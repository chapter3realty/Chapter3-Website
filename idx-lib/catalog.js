/**
 * The CRM's filter list (contract §5, GET /api/idx/filters, Ticket 471): every public filter and how
 * many homes for sale match it. Loaded at most once an hour (the CRM allows a few calls per 10 minutes
 * and recounts every 6 hours): kept in this isolate's memory and in the edge cache through crm().
 * On any trouble the last copy stays, or the built-in keys (idx-lib/features.js) do the work.
 */
import { crm } from "./crm.js";
import { useCatalog, isDistance } from "./features.js";

const HOUR = 3600 * 1000;
let memo = null; // { at, list }
let pending = null;
let failedAt = 0; // after a failure, no new try for 2 minutes: a page never waits long on a list that is down

/** The words the filter panel uses for the CRM's groups, in the panel's order. */
export const GROUP_NAME = { water: "Water and boats", place: "Beach and places nearby", outside: "Outside", inside: "Inside",
  community: "Community and HOA", market: "The listing", type: "Kind of home" };
const ORDER = Object.keys(GROUP_NAME);
/* Features the bar already asks for in its own words, or that only restate a home type. */
const SKIP = new Set(["waterfront", "house", "condo", "townhouse", "land", "manufactured", "multi_family", "hoa"]);

function shape(j) {
  const features = j.filters.filter((f) => f && Array.isArray(f.params) && f.params.includes("has") && typeof f.key === "string"
    && /^[a-z0-9_]{2,60}$/.test(f.key) && typeof f.forSale === "number" && f.forSale > 0)
    .map((f) => ({ key: f.key, label: String(f.label || f.key).slice(0, 80), group: GROUP_NAME[f.group] ? f.group : "inside", forSale: f.forSale, distance: isDistance(f.key) }));
  return { countedAt: j.countedAt || null, features };
}

/** The list, or null. Never throws. */
export async function filterCatalog(env, request) {
  if (memo && Date.now() - memo.at < HOUR) return memo.list;
  if (!pending && Date.now() - failedAt < 2 * 60 * 1000) return memo ? memo.list : null;
  if (!pending) pending = (async () => {
    try {
      const r = await crm(env, request, "/api/idx/filters", { anonymous: true, cacheSeconds: 3600, timeoutMs: 4000 });
      const list = r.status === 200 && r.json && r.json.ok && Array.isArray(r.json.filters) ? shape(r.json) : null;
      if (list && list.features.length) { memo = { at: Date.now(), list }; useCatalog(list.features); } else failedAt = Date.now();
    } catch { failedAt = Date.now(); /* keep the last copy */ }
    pending = null;
    return memo ? memo.list : null;
  })();
  return pending;
}

/** The panel's groups: each group's features, most homes first, without the ones the bar already has. */
export function panelGroups(list) {
  if (!list) return [];
  return ORDER.map((g) => ({ group: g, name: GROUP_NAME[g], items: list.features.filter((f) => f.group === g && !SKIP.has(f.key)).sort((a, b) => b.forSale - a.forSale) }))
    .filter((g) => g.items.length);
}

/** For the tests: forget the list and any failure. */
export function resetCatalog() { memo = null; pending = null; failedAt = 0; useCatalog(null); }
