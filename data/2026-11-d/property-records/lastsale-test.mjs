#!/usr/bin/env node
/* Controls for GET /api/lastsale (functions/api/lastsale.js), on the Register of Deeds' real book and page answers
 * saved on 2026-11-14 with party names and memo text removed (raw/lastsale/). Each rule has a passing and a failing control.
 *   node data/2026-11-d/property-records/lastsale-test.mjs   prints "all controls pass" */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseGrid } from "../../../functions/api/lastsale.js";
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "raw", "lastsale");
const g = (n) => fs.readFileSync(path.join(dir, `grid-${n}.json`), "utf8");
let n = 0, fails = 0;
const ok = (name, cond, got) => { n++; if (cond) console.log("ok   " + name); else { fails++; console.log("FAIL " + name + ": got " + JSON.stringify(got)); } };
const a = parseGrid(g("5023-726"), "5023", "726", "41913020007");
ok("a deed with a price: date, type and whole dollars", a && a.found && a.deed && a.date === "2025-12-11" && a.type === "deed" && a.price === 760182, a);
const b = parseGrid(g("5072-1415"), "5072", "1415", "41913020006");
ok("a deed the index lists at $0 has no price", b && b.found && b.deed && b.price === null && b.date === "2026-04-28", b);
const c = parseGrid(g("4480-720"), "4480", "720", "41913020042");
ok("a paper that is not a deed is named and is not a sale", c && c.found && c.deed === false && c.type === "certificate of death" && c.price === null, c);
ok("another parcel's PIN finds nothing (fires)", parseGrid(g("5023-726"), "5023", "726", "41913020099").found === false);
ok("the other paper at the same book and page is ignored", parseGrid(g("5023-726"), "5023", "726", "41913020007").type === "deed");
ok("a deed the index does not list at that book and page finds nothing", parseGrid(g("5133-2709"), "5133", "2709", "41913020039").found === false);
ok("zero-padded book and page still match", parseGrid(g("5023-726"), "05023", "0726", "41913020007").found === true);
ok("an answer that is not JSON is no answer (fires)", parseGrid("<html>error</html>", "1", "1", "41913020007") === null);
ok("no party name in any answer", !/NAME|LLC|TITLE/.test(JSON.stringify([a, b, c])), [a, b, c]);
ok("a price of $0 as text is no price", parseGrid(JSON.stringify({ Data: [{ BookPage: "1/1", ParcelNumber: "41913020007", DocTypeDescription: "DEED", Consideration: "$0.00", RecordDate: "2020/01/02" }] }), "1", "1", "41913020007").price === null);
if (fails) { console.log(`${fails} of ${n} controls failed`); process.exit(1); }
console.log(`all controls pass (${n})`);
