#!/usr/bin/env node
/* Controls for GET /api/tax (functions/api/tax.js), on the Treasurer's real pages for one parcel, saved on
 * 2026-11-14 with the owner's name and address removed (raw/tax/). Each rule has a passing and a failing control.
 *   node data/2026-11-d/property-records/tax-test.mjs   prints "all controls pass" */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseBills, parseDetail } from "../../../functions/api/tax.js";
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "raw", "tax");
const list = fs.readFileSync(path.join(dir, "list-41913020042.html"), "utf8"), det = fs.readFileSync(path.join(dir, "detail-41913020042.html"), "utf8");
let n = 0, fails = 0;
const ok = (name, cond, got) => { n++; if (cond) console.log("ok   " + name); else { fails++; console.log("FAIL " + name + ": got " + JSON.stringify(got)); } };
const b = parseBills(list), d = parseDetail(det);
ok("bills: newest first, real estate, amount and status", b[0].year === 2026 && b[0].status === "unpaid" && b[0].amount === 2491.67 && b[1].status === "paid" && b[1].paid === "12/09/25", b.slice(0, 2));
ok("bills: no owner name in any field", !JSON.stringify(b).includes("OWNER"), b[0]);
ok("bills: a page with no result rows gives none (fires)", parseBills("<table><tr class=\"gvheader\"><th>x</th></tr></table>").length === 0);
ok("bills: a vehicle row is not a real estate bill (fires)", parseBills(list.replace(/RealEstate/g, "Vehicle")).length === 0);
ok("detail: the county's value, the ratio and the parts of the bill", d && d.appraisal === 653499 && d.ratio === 4 && d.land === 120014 && d.building === 533485 && d.countyTax === 5254.14 && d.residential === 2851.87 && d.total === 2491.67 && d.acres === 0.46, d);
ok("detail: no owner name or address in the answer", !/OWNER|ADDRESS|REMOVED/.test(JSON.stringify(d)), d);
ok("detail: a 6% parcel reads as 6 (fires)", parseDetail(det.replace(/<td>4%\s*<\/td>/, "<td>6% </td>")).ratio === 6);
ok("detail: a page without a total is no answer (fires)", parseDetail(det.replace(/id="ctl00_MainContent_lblTotalTaxes"[^>]*>[^<]*</, 'id="x"><')) === null);
if (fails) { console.log(`${fails} of ${n} controls failed`); process.exit(1); }
console.log(`all controls pass (${n})`);
