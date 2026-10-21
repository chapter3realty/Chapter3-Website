/**
 * Check every place's search against the real MLS, once, before going live (contract §5:
 * "Check the MLS's words once with a search"). Read-only; uses the development key.
 *   IDX_DEV_KEY=... node tools/idx-check-places.mjs
 * For each place: how many homes match, and the MLS subdivision names among them. A place
 * whose names show the wrong community needs better words in Blog-Brain's idx-places.json.
 */
import { PLACES } from "../idx-lib/places.js";
import { placeParams } from "../idx-lib/edge.js";

const KEY = process.env.IDX_DEV_KEY;
if (!KEY) { console.error("Set IDX_DEV_KEY (never commit it)."); process.exit(2); }
const BASE = (process.env.CRM_URL || "https://app.chapter3realty.com").replace(/\/+$/, "");
for (const [slug, p] of Object.entries(PLACES)) {
  const q = placeParams(p.q);
  if (!q) { console.log(`${slug}: BAD QUERY ${JSON.stringify(p.q)}`); continue; }
  q.set("size", "48");
  const r = await fetch(`${BASE}/api/idx/listings?${q}`, { headers: { "x-idx-key": KEY, "x-idx-client-ip": "203.0.113.9" } });
  const j = await r.json().catch(() => null);
  if (!j || !j.ok) { console.log(`${slug}: ${r.status} ${j && j.error}`); continue; }
  const names = {};
  for (const l of j.listings) names[l.subdivision || "(none)"] = (names[l.subdivision || "(none)"] || 0) + 1;
  const top = Object.entries(names).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, c]) => `${n} ${c}`).join("; ");
  console.log(`${slug}: ${j.total} homes${j.total < 3 ? " (strip hidden)" : ""} | ${top}`);
  await new Promise((res) => setTimeout(res, 400)); // gentle on the CRM's small database
}
