#!/usr/bin/env node
/* Controls for the property lookup on /buyers/property-records/ (lookup-core.js), on the real answers
 * each source gave on 2026-11-13 (raw/api/). Each rule has a control that must pass and one that must
 * fail. A field renamed or dropped at the county fails a named control here, not the page.
 *
 *   node data/2026-11-d/property-records/lookup-test.js            prints "all controls pass"
 *   node data/2026-11-d/property-records/lookup-test.js --live     also asks each county source again at the
 *                                                                   test points and checks its field names
 *
 * The lead may move this to tools/lookup-test.mjs with tools/fixtures/lookup/ (PLAN "The test"). */
"use strict";
const fs = require("fs"), path = require("path");
const C = require("./lookup-core.js");
const API = path.join(__dirname, "raw", "api");
const fx = (f) => JSON.parse(fs.readFileSync(path.join(API, f), "utf8"));

let fails = 0, n = 0;
const ok = (name, cond, got) => { n++; if (!cond) { fails++; console.log(`FAIL ${name}${got !== undefined ? `: got ${JSON.stringify(got)}` : ""}`); } };

/* A copy of an answer with one field renamed: the parser must notice. */
const rename = (j, from, to) => {
  const c = JSON.parse(JSON.stringify(j));
  for (const f of c.features || c.candidates || []) { const a = f.attributes || {}; if (from in a) { a[to] = a[from]; delete a[from]; } }
  return c;
};

/* Finder (R1, R48). */
{
  const m = C.prPickMatch(fx("geocode-1301-second-ave.json"));
  ok("finder: a county address point at score 100 is accepted", m.ok && m.address === "1301 SECOND AVE, Conway, SC, 29526" && m.city === "Conway" && Math.abs(m.x + 79.049153) < 1e-5, m);
  const s = C.prPickMatch(fx("geocode-2700-Pampas-Dr--Myrtle-Beach-.json"));
  ok("finder: a street name with no house number is refused, asking for the number", !s.ok && s.why === "street", s);
  const g = C.prPickMatch(fx("geocode-pawleys-miss.json"));
  ok("finder: a Pawleys Island address (best score 64.66) is refused", !g.ok && g.why === "none", g);
  const b = C.prPickMatch(fx("geocode-937-Broadway-St--Myrtle-Beach-.json"));
  ok("finder: a match along the street at 99.17 is accepted", b.ok && b.city === "Myrtle Beach", b);
  const r = C.prPickMatch(rename(fx("geocode-1301-second-ave.json"), "Addr_type", "AddrType"));
  ok("finder: a renamed Addr_type field fails the match", !r.ok, r);
  ok("finder: an error answer is a failed source", C.prPickMatch({ error: { code: 500 } }).why === "service");
  ok("Georgetown words go to Georgetown's links", C.prIsGeorgetown("321 Myrtle Ave, Pawleys Island, SC 29585") && C.prIsGeorgetown("Litchfield") && C.prIsGeorgetown("x 29585"));
  ok("Georgetown words: a Horry address is not sent there", !C.prIsGeorgetown("1301 Second Ave, Conway") && !C.prIsGeorgetown("295851"));
  const sug = fx("suggest-937-broadw.json");
  ok("suggestions: text and magicKey are there", Array.isArray(sug.suggestions) && sug.suggestions[0].text && sug.suggestions[0].magicKey);
}

/* Parcels (R3 to R6, R28). */
{
  const one = C.prParcels(fx("parcels-conway-1301.json"));
  ok("parcel: one parcel gives an 11-digit PIN, the TMS and the drawn area", one.n === 1 && one.pin === "36800000016" && one.tms === "1370607007" && Math.round(one.sqft) === 658748, one);
  ok("parcel: a blank LOT is left out", one.lot === "", one.lot);
  const stack = C.prParcels(fx("parcels-nmb-102.json"));
  ok("parcel: 165 parcels at a condo building give no single PIN", stack.n === 165 && stack.pin === "", stack.n);
  const none = C.prParcels(fx("parcels-mb-937.json"));
  ok("parcel: no parcel at a street match", none.n === 0 && none.pin === "", none);
  ok("parcel: an error answer is a failed source", C.prParcels({ error: { code: 400 } }) === null);
  const ren = C.prParcels(rename(fx("parcels-conway-1301.json"), "PIN", "PARCELID"));
  ok("parcel: a renamed PIN field fails", ren.pin === "", ren);
  ok("PIN: a number prints as 11 digits", C.prPin(36800000016) === "36800000016" && C.prPin(5607030131) === "05607030131");
  ok("PIN: text that is not a number is refused", C.prPin("ABC") === "" && C.prPin(null) === "" && C.prPin(123456789012) === "");
  ok("address shown in plain case", C.prNice("1101 N OCEAN BLVD, Myrtle Beach, SC, 29577") === "1101 N Ocean Blvd, Myrtle Beach, SC 29577", C.prNice("1101 N OCEAN BLVD, Myrtle Beach, SC, 29577"));
  ok("address: ordinals and no state", C.prNice("1301 2ND AVE, Conway, 29526") === "1301 2nd Ave, Conway, SC 29526", C.prNice("1301 2ND AVE, Conway, 29526"));
  ok("address: a capitals line is not left as it was (control)", C.prNice("4519 NORTH PLANTATION HARBOUR DR, Little River, SC, 29566") !== "4519 NORTH PLANTATION HARBOUR DR, Little River, SC, 29566");
  ok("address point: the point's PIN", C.prPointPin(fx("addresspoints-where-1301.json")) === "36800000016");
  ok("address point: none when the answer is empty", C.prPointPin({ features: [] }) === "");
}

/* Flood (R7, R8, R23 to R26). */
{
  const ae = C.prFlood(fx("fema-nmb-102.json"));
  ok("flood: FEMA Zone AE is high risk, with the mortgage rule", ae && ae.level === "high" && /federally backed mortgage requires flood insurance/.test(ae.text), ae);
  const x = C.prFlood(fx("fema-conway-1301.json"));
  ok("flood: FEMA minimal Zone X", x && x.level === "minimal" && /do not require/.test(x.text), x);
  const cae = C.prFlood(fx("countyfema-nmb-102.json"));
  ok("flood: the county's copy, Zone AE", cae && cae.level === "high", cae);
  const cx = C.prFlood(fx("countyfema-conway-1301.json"));
  ok("flood: the county's copy, Zone X (no subtype field)", cx && cx.level === "minimal", cx);
  const shaded = C.prFlood({ features: [{ attributes: { FLD_ZONE: "0.2 PCT ANNUAL CHANCE FLOOD HAZARD", SFHA_TF: "F" } }] });
  ok("flood: the county's copy stores shaded X in FLD_ZONE", shaded && shaded.level === "moderate" && shaded.zone === "X", shaded);
  const fshaded = C.prFlood({ features: [{ attributes: { FLD_ZONE: "X", ZONE_SUBTY: "0.2 PCT ANNUAL CHANCE FLOOD HAZARD" } }] });
  ok("flood: FEMA's shaded X from ZONE_SUBTY", fshaded && fshaded.level === "moderate", fshaded);
  const ve = C.prFlood({ features: [{ attributes: { FLD_ZONE: "VE", SFHA_TF: "T" } }] });
  ok("flood: Zone VE is the coastal zone", ve && ve.level === "coastal" && /waves/.test(ve.text), ve);
  ok("flood: a connection error falls back (null)", C.prFlood(undefined) === null && C.prFlood({ error: {} }) === null);
  ok("flood: a renamed FLD_ZONE fails (null)", C.prFlood(rename(fx("fema-nmb-102.json"), "FLD_ZONE", "ZONE")) === null);
  ok("flood: the word safe never appears", ![ae, x, cae, cx, shaded, ve].some((f) => /\bsafe\b/i.test(f.text)));
  ok("supplemental flood zone: outside at the test point", C.prSupFlood(fx("supflood-nmb-102.json")) === false);
  ok("supplemental flood zone: inside when a shape answers", C.prSupFlood({ features: [{ attributes: { OBJECTID: 1 } }] }) === true);
}

/* Town (R10, R17 to R20). */
{
  ok("town: a named town", C.prTown(fx("muni-conway-1301.json")) === "Conway");
  ok("town: North Myrtle Beach", C.prTown(fx("muni-nmb-102.json")) === "North Myrtle Beach");
  ok("town: an empty answer is unincorporated", C.prTown(fx("muni-cf-point.json")) === "");
  ok("town: Briarcliffe is written Briarcliffe Acres", C.prTown({ features: [{ attributes: { NAME: "BRIARCLIFFE" } }] }) === "Briarcliffe Acres");
  ok("town: an error answer is a failed source", C.prTown({ error: {} }) === null);
  ok("town: a renamed NAME field fails", C.prTown(rename(fx("muni-conway-1301.json"), "NAME", "TOWN")) === "");
  const t = C.prTownText("", "Myrtle Beach");
  ok("town line: a Myrtle Beach mailing address outside the city says so", /mailing address says Myrtle Beach, but this address is outside/.test(t), t);
  const t2 = C.prTownText("Conway", "Conway");
  ok("town line: inside, no mailing note", t2 === "Inside the limits of Conway, so Conway's own zoning applies.", t2);
  const t3 = C.prTownText("", "Murrells Inlet");
  ok("town line: a mailing place that is not a town gets no note", !/mailing/.test(t3), t3);
}

/* Evacuation zone (R11). */
{
  ok("evacuation: zone A", C.prEvac(fx("evac-nmb-102.json")) === "A");
  ok("evacuation: none", C.prEvac(fx("evac-conway-1301.json")) === "");
  ok("evacuation: an error answer is a failed source", C.prEvac({ error: {} }) === null);
  ok("evacuation: a renamed Zone field fails", C.prEvac(rename(fx("evac-nmb-102.json"), "Zone", "EvacZone")) === "");
  ok("evacuation line: never says safe", !/\bsafe\b/i.test(C.prEvacText("") + C.prEvacText("A")));
}

/* Zoning (R12). */
{
  ok("zoning: PUD at the Carolina Forest point", C.prZoning(fx("zoning-cf-point.json")) === "PUD");
  ok("zoning: none inside Conway", C.prZoning(fx("zoning-conway-1301.json")) === "");
  ok("zoning: a renamed ZoningCode fails", C.prZoning(rename(fx("zoning-cf-point.json"), "ZoningCode", "Zoning")) === "");
}

/* Deed (R13, R14). */
{
  const d = C.prDeed(fx("gisapp24-deedbook-1301.json"));
  ok("deed: book 1837 page 226 and 15.01 acres", d && d.book === "1837" && d.page === "226" && d.acres === 15.01, d);
  const links = C.prRecordLinks("36800000016", d);
  ok("deed: the record link by book and page", links[0].label === "Deed record" && links[0].href === "https://acclaimweb.horrycounty.org/AcclaimWeb/details/JumpToBookPage/1/1837/226", links[0]);
  ok("tax: the search link with ?PIN=", links[1].href === "https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx?PIN=36800000016", links[1]);
  const z = C.prDeed({ features: [{ attributes: { DeedBook: "2479", DeedPage: "0959" } }] });
  ok("deed: a leading zero is stripped from the page", z.book === "2479" && z.page === "959", z);
  const code = C.prDeed({ features: [{ attributes: { DeedBook: "CG2302", DeedPage: "270858" } }] });
  ok("deed: a code in the book field is refused", code.book === "", code);
  ok("deed: no usable pair opens the deed search", C.prRecordLinks("", code)[0].label === "Deed search");
  const ren = C.prDeed(rename(fx("gisapp24-deedbook-1301.json"), "DeedBook", "Book"));
  ok("deed: a renamed DeedBook fails to the search", ren.book === "", ren);
  ok("land: the county's acreage first", C.prAcres(d, 658748) === "About 15 acres on the county's record.", C.prAcres(d, 658748));
  ok("land: the drawn area when there is no acreage", C.prAcres(null, 13068) === "About 0.3 acres, as the county's map draws the lot.", C.prAcres(null, 13068));
  ok("land: nothing when there is no area", C.prAcres(null, 0) === "");
}

/* The homes link (R49). */
ok("homes strip: the search the strip asks for", C.prHomesStripQ(-79.049153, 33.831893) === "near=33.83189,-79.04915&miles=1", C.prHomesStripQ(-79.049153, 33.831893));
ok("homes strip: its search is a prefix of the fallback link", C.prHomesHref(-79.049153, 33.831893).indexOf(C.prHomesStripQ(-79.049153, 33.831893).split("&")[0].slice(0, 20)) > -1);
ok("homes: near the point within a mile", C.prHomesHref(-79.049153, 33.831893) === "/homes/map/?near=33.83189,-79.04915&miles=1", C.prHomesHref(-79.049153, 33.831893));

/* No owner, value or price field is ever asked for. */
ok("fields: no owner, value or price field is asked of any source", !/owner|value|price|market|sale|mail/i.test(Object.values(C.PR_FIELDS).join(",")), C.PR_FIELDS);

/* curl, not fetch: Node's fetch ignores an HTTPS proxy, and curl ships with Windows 10 and later too. */
function getJson(url) {
  const r = require("child_process").spawnSync("curl", ["-s", "-m", "60", "-H", "Origin: https://chapter3realty.com", url], { encoding: "utf8", maxBuffer: 1 << 26 });
  try { return r.status === 0 ? JSON.parse(r.stdout) : null; } catch (e) { return null; }
}

async function live() {
  /* The verified test points: the county courthouse and the Carolina Forest library (public buildings). */
  const P = [{ x: -79.049153, y: 33.831893 }, { x: -78.891064, y: 33.75983 }];
  const need = { parcels: ["PIN", "TMS", "LOT"], points: ["PIN"], towns: ["NAME"], evac: ["Zone"], countyFlood: ["FLD_ZONE", "SFHA_TF"], zoning: ["ZoningCode"] };
  for (const [k, fields] of Object.entries(need)) {
    const r = getJson(C.PR_SRC[k] + "?" + C.prPointQuery(P[0].x, P[0].y, C.PR_FIELDS[k], k === "points" ? 5 : 0).replace("returnGeometry=false", "returnGeometry=false&returnFieldName=true"));
    const names = (r && r.fields || []).map((f) => f.name);
    ok(`live ${k}: answers with ${fields.join(", ")}`, r && !r.error && fields.every((f) => names.includes(f)), r && (r.error || names));
  }
  const g = getJson(C.PR_SRC.locator + "/findAddressCandidates?SingleLine=" + encodeURIComponent("1301 Second Ave, Conway, SC") + "&outFields=Addr_type,Match_addr,City&maxLocations=5&outSR=4326&f=json");
  ok("live finder: the courthouse still matches", C.prPickMatch(g).ok, g);
}

(async () => {
  if (process.argv.includes("--live")) await live();
  if (fails) { console.log(`${fails} of ${n} controls failed`); process.exit(1); }
  console.log(`all controls pass (${n})`);
})();
