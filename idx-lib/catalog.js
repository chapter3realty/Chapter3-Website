/**
 * The CRM's filter list (contract §5, GET /api/idx/filters, Ticket 471): every public filter and how
 * many homes for sale match it. The CRM recounts every 6 hours and allows 30 calls in 10 minutes for the
 * whole site; past that it answers 429 for the rest of the 10 minutes and alerts the owner. It went over
 * 24 times from 9 to 13 Nov 2026 (the CRM's thread "The filter list is called far more than once an
 * hour"): every Cloudflare location and every isolate kept its own copy, and after a failure each tried
 * again two minutes later.
 *
 * Now ONE copy for every visitor everywhere, in the site's R2 bucket (cache/filters.json):
 *  - the CRM is called only when that copy is missing or over an hour old, and only by the one caller
 *    that wins the lock (cache/filters.lock, a compare-and-swap; a lock is good for 2 minutes);
 *  - on a 429 or 503 (or any failure) the last good copy keeps being served, and nobody calls again until
 *    the CRM's retry-after has passed (2 minutes for a failure that names no time);
 *  - each isolate reads the bucket at most once a minute.
 * With no copy at all, the built-in keys (idx-lib/features.js) do the work.
 */
import { crm } from "./crm.js";
import { useCatalog, isDistance } from "./features.js";

const HOUR = 3600 * 1000;
const COPY = "cache/filters.json", LOCK = "cache/filters.lock";
const LOCK_MS = 2 * 60 * 1000, LOOK_MS = 60 * 1000, FAIL_WAIT_MS = 2 * 60 * 1000;
let memo = null; // { list, fetchedAt, retryUntil, lookedAt }
let pending = null;

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

const take = (o) => { memo = { ...o, lookedAt: Date.now() }; if (o.list) useCatalog(o.list.features); return o.list || null; };

/** One caller at a time, everywhere: the lock's time moves only by a compare-and-swap on its etag. */
async function takeLock(R2, now) {
  let h = await R2.head(LOCK);
  if (!h) { await R2.put(LOCK, "0", { customMetadata: { at: "0" } }); h = await R2.head(LOCK); if (!h) return false; }
  if (now - Number((h.customMetadata && h.customMetadata.at) || 0) < LOCK_MS) return false;
  return !!(await R2.put(LOCK, String(now), { customMetadata: { at: String(now) }, onlyIf: { etagMatches: h.etag } }));
}

async function load(env, request) {
  const now = Date.now();
  const R2 = env && env.PHOTOS;
  // The shared copy, read at most once a minute per isolate.
  let shared = memo;
  if (R2 && (!memo || now - memo.lookedAt >= LOOK_MS)) {
    try {
      const o = await R2.get(COPY);
      shared = o ? JSON.parse(await o.text()) : { list: memo && memo.list, fetchedAt: memo ? memo.fetchedAt : 0, retryUntil: memo ? memo.retryUntil : 0 };
    } catch { shared = memo; }
    if (shared) take(shared);
  }
  const fetchedAt = (shared && shared.fetchedAt) || 0, retryUntil = (shared && shared.retryUntil) || 0;
  if (shared && shared.list && now - fetchedAt < HOUR) return shared.list;
  // Over an hour old or missing: wait out the CRM's retry-after, and let only one caller ask.
  if (now < retryUntil) return shared ? shared.list || null : null;
  if (R2 ? !(await takeLock(R2, now).catch(() => false)) : memo && now - (memo.triedAt || 0) < FAIL_WAIT_MS) {
    // Another caller is asking the CRM. With no copy at all yet (the first minute after a deploy), read its answer a moment later.
    if (R2 && !(shared && shared.list)) {
      await new Promise((z) => setTimeout(z, 1500));
      try { const o = await R2.get(COPY); if (o) return take(JSON.parse(await o.text())); } catch { /* the built-in keys */ }
    }
    return shared ? shared.list || null : null;
  }
  let r;
  try { r = await crm(env, request, "/api/idx/filters", { anonymous: true, cache: false, retry: false, timeoutMs: 4000 }); } catch { r = { status: 502, json: null }; }
  const list = r.status === 200 && r.json && r.json.ok && Array.isArray(r.json.filters) ? shape(r.json) : null;
  let next;
  if (list && list.features.length) next = { list, fetchedAt: now, retryUntil: 0 };
  else {
    // 429 or 503: the CRM's own wait; any other failure: two minutes. The last good copy stays.
    const secs = Number(r.retryAfter);
    const wait = (r.status === 429 || r.status === 503) && Number.isFinite(secs) && secs > 0 ? Math.min(secs, 3600) * 1000 : FAIL_WAIT_MS;
    next = { list: shared ? shared.list || null : null, fetchedAt, retryUntil: now + wait };
  }
  if (R2) await R2.put(COPY, JSON.stringify(next), { httpMetadata: { contentType: "application/json" } }).catch(() => {});
  next.triedAt = now;
  return take(next);
}

/** The list, or null. Never throws. */
export async function filterCatalog(env, request) {
  if (memo && memo.list && Date.now() - memo.fetchedAt < HOUR) return memo.list;
  if (!pending) pending = load(env, request).catch(() => (memo ? memo.list || null : null)).finally(() => { pending = null; });
  return pending;
}

/** The panel's groups: each group's features, most homes first, without the ones the bar already has. */
export function panelGroups(list) {
  if (!list) return [];
  return ORDER.map((g) => ({ group: g, name: GROUP_NAME[g], items: list.features.filter((f) => f.group === g && !SKIP.has(f.key)).sort((a, b) => b.forSale - a.forSale) }))
    .filter((g) => g.items.length);
}

/** For the tests: forget the list and any failure. */
export function resetCatalog() { memo = null; pending = null; useCatalog(null); }
