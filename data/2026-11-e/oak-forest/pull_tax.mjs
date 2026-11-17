// Real 2025 tax bills for a sample of Oak Forest houses, read the way /api/tax does (Horry County Treasurer's public payment site).
// Saves counts and ranges only: no PIN, no owner. Run: RAW=<scratch> node pull_tax.mjs > tax-sample.json
import { onRequest } from "../../../functions/api/tax.js";
import fs from "fs";
globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };
const C = JSON.parse(fs.readFileSync(process.env.RAW + "/county.json"));
const pins = Object.keys(C.parcels).filter(p => C.parcels[p].MarketImprv).sort();
const pick = pins.filter((_, i) => i % Math.floor(pins.length / 16) === 0).slice(0, 16);
const rows = [];
for (const pin of pick) {
  const r = await onRequest({ request: new Request("https://x.test/api/tax?pin=" + pin), env: {}, waitUntil() {} });
  const j = await r.json();
  if (j.ok && j.last) rows.push({ year: j.last.year, appraisal: j.last.appraisal, ratio: j.last.ratio, assessed: j.last.assessed, total: j.last.total, fees: j.last.fees, countyTax: j.last.countyTax, cityTax: j.last.cityTax });
  else rows.push({ err: j.error || "no detail" });
  await new Promise(r => setTimeout(r, 800));
}
console.log(JSON.stringify(rows, null, 1));
