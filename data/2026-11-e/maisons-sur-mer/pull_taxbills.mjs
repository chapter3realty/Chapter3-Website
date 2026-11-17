/* Maisons Sur-Mer: the county's real tax bills for a sample of units, in aggregate. Source: Horry County Treasurer's public
 * payment site (same reader as functions/api/tax.js). Sample: 8 units taxed at 6 percent and 8 at 4 percent, spread by county
 * value group, by parcel order. Kept: per ratio group the count, the median and lowest and highest total bill, county tax, the
 * fees line, and the countyTax+cityTax split (to see if any city tax appears). Never kept: a PIN, a unit, a name, an address.
 * Run: node pull_taxbills.mjs <this dir> <website root>. Writes taxbills.json. */
import fs from "fs";
import { parseBills, parseDetail } from "../../../functions/api/tax.js";
const D = process.argv[2];
const SITE = "https://horrycountytreasurer.qpaybill.com/Taxes/", UA = "Mozilla/5.0 (compatible; Chapter3RealtyLookup/1.0; +https://chapter3realty.com/buyers/property-records/)";
async function load(url, cookie) { let jar = cookie || "", at = url;
  for (let h = 0; h < 4; h++) { const r = await fetch(at, { headers: { "user-agent": UA, ...(jar ? { cookie: jar } : {}) }, redirect: "manual" });
    const set = (r.headers.get("set-cookie") || "").split(/,(?=\s*[A-Za-z0-9_.-]+=)/).map((c) => c.split(";")[0].trim()).filter(Boolean);
    if (set.length) jar = [...new Map([...jar.split("; ").filter(Boolean), ...set].map((c) => [c.split("=")[0], c])).values()].join("; ");
    const loc = r.headers.get("location"); if (r.status >= 300 && r.status < 400 && loc) { at = new URL(loc, at).toString(); continue; }
    return { ok: r.ok, html: r.ok ? await r.text() : "", cookie: jar }; } return { ok: false, html: "" }; }
const raw = JSON.parse(fs.readFileSync(D + "/raw/parcels-raw.json")).features.map((f) => f.attributes).filter((a) => a.MarketImprv > 0 && a.PIN);
const by = (r) => raw.filter((a) => a.TaxableProp && Math.abs(a.AssessedProp / a.TaxableProp - r) < 0.002);
const pick = (xs, n) => xs.filter((_, i) => i % Math.floor(xs.length / n) === 0).slice(0, n);
const out = { read: new Date().toISOString(), rule: "see header", groups: {} };
for (const [name, r] of [["six_percent", 0.06], ["four_percent", 0.04]]) {
  const rows = [];
  for (const a of pick(by(r), 8)) {
    const list = await load(`${SITE}TaxesDefaultType4.aspx?PIN=${a.PIN}`); if (!list.ok) { rows.push({ err: "list" }); continue; }
    const done = parseBills(list.html).find((b) => b.detail); if (!done) { rows.push({ err: "nobill" }); continue; }
    const d = await load(SITE + done.detail, list.cookie); const x = d.ok ? parseDetail(d.html) : null;
    if (x) rows.push({ year: x.year, appraisal: x.appraisal, ratio: x.ratio, assessed: x.assessed, countyTax: x.countyTax, cityTax: x.cityTax, fees: x.fees, total: x.total, county_value: a.MarketProp });
    await new Promise((s) => setTimeout(s, 1500));
  }
  const ok = rows.filter((x) => x.total != null), t = ok.map((x) => x.total).sort((p, q) => p - q);
  out.groups[name] = { n: ok.length, failed: rows.length - ok.length, years: [...new Set(ok.map((x) => x.year))], median_total: t[Math.floor(t.length / 2)], min_total: t[0], max_total: t[t.length - 1],
    city_tax_nonzero: ok.filter((x) => x.cityTax).length, total_over_appraisal_pct: ok.map((x) => +(100 * x.total / x.appraisal).toFixed(2)), rows: ok.map((x) => ({ appraisal: x.appraisal, total: x.total, countyTax: x.countyTax, fees: x.fees })) };
  console.log(name, JSON.stringify(out.groups[name]).slice(0, 700));
}
fs.writeFileSync(D + "/taxbills.json", JSON.stringify(out, null, 1));
