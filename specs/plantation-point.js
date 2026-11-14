/* /submarkets/myrtle-beach/plantation-point/ - Plantation Point, Myrtle Beach: what living there is like
 * (half-acre lots, a pool at half the houses, the Intracoastal Waterway and the Myrtlewood golf courses),
 * which lots are on the water and the course, what the houses sold for, the HOA question, the city limits,
 * the flood zone, and The Landing at Plantation Point next door.
 *
 * Batch 2026-11-d, Lane N (new page). Built like /submarkets/myrtle-beach/market-common/ (specs/market-common.js),
 * with the skeleton of specs/garden-city.js and specs/home-value.js: the answer first, the italic sub line at about
 * half the H1 size, one block width of 720 px, plain lists under thin rules, one card style for the offers and the
 * chart frame, an offer after about every second section, sources, a short FAQ.
 * Facts: Blog-Brain batches/2026-11-d/plantation-point/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's values and wording only (VERIFY.md; struck wording in batches/2026-11-d/facts/
 * submarkets-myrtle-beach-plantation-point-struck.json). Demand: must-answer.md. Plan: PLAN.md.
 * Not used: row 11 (struck: the 1966 date and the redesign line), "36 holes" (row 10), the county value (row 19),
 * docks, lakes, voluntary dues, which recorded restrictions bind which street (row 23), "named for" (row 38).
 * Data: data/2026-11-d/plantation-point/. findings.json, map-lots.json, drives.json and listings.json are the
 * verifier's corrected run (VERIFY.md section A: The Landing is 139 houses; the pond parcel is out). map-layers.json
 * is drawn from the same corrected county cache by map_layers.py. Every count, size, price, share and minute is
 * read from those files here and checked against its ledger row.
 * Pictures: one map we drew from Horry County parcels and the Census road lines. No photo yet: the shot list for the
 * photo partner is in PLAN.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/plantation-point/";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", "plantation-point");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-layers.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const mil = (v) => "$" + (Math.round(v / 10000) / 100).toString() + " million";
const must = (ok, msg) => { if (!ok) throw new Error(`plantation-point.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const M = F.main, LD = F.landing, SA = F.sales;
/* Row 1 (CORRECTED): 352 houses and 14 empty lots; The Landing 139 houses. */
must(M.houses === 352 && M.vacant_lots === 14 && LD.houses === 139 && LD.parcels === 139, "row 1 changed");
/* Row 2 (CORRECTED): SF 10 on the main streets (10,000 square feet a lot); The Landing SF 6. */
must(M.zoning["SF 10"] === 364 && LD.zoning["SF 6"] === 139, "row 2 changed");
/* Row 3: lots about half an acre (0.53), the smallest about a third (0.33). */
must(M.lot_sqft.median === 23084.5 && M.lot_sqft.min === 14180, "row 3 changed");
must(Math.round(M.lot_sqft.median / 43560 * 100) === 53 && Math.round(M.lot_sqft.min / 43560 * 100) === 33, "row 3 acres changed");
/* Row 4 (CORRECTED): The Landing's lots about 6,600 square feet. */
must(LD.lot_sqft.median === 6561, "row 4 changed");
const LANDING_LOT = n(Math.round(LD.lot_sqft.median / 100) * 100);
/* Row 5 (CORRECTED): about 3,900 square feet under roof; The Landing about 1,700. */
must(M.house_footprint_sqft.median === 3869 && LD.house_footprint_sqft.median === 1669, "row 5 changed");
const ROOF = n(Math.round(M.house_footprint_sqft.median / 100) * 100), ROOF_L = n(Math.round(LD.house_footprint_sqft.median / 100) * 100);
/* Row 6: 176 of 352 houses have an in-ground pool (half). The Landing has 1. */
must(M.pools === 176 && M.pools / M.houses === 0.5 && LD.pools === 1, "row 6 changed");
/* Row 7: across the county, 12,406 pools and 198,021 residential buildings (about 1 in 16). */
must(Math.round(198021 / 12406) === 16, "row 7 changed");
/* Row 8 (CORRECTED): 58 waterway lots, all in Plantation Point. */
must(M.waterway_lots === 58 && LD.waterway_lots === 0, "row 8 changed");
/* Row 9 (CORRECTED): 88 golf lots in Plantation Point, 47 in The Landing. */
must(M.golf_lots === 88 && LD.golf_lots === 47, "row 9 changed");
/* Row 13 (CORRECTED): no house outline in a high-risk zone; 35 lots touch the strip along the water. */
must(M.house_footprint_touches_high_risk_zone === 0 && LD.house_footprint_touches_high_risk_zone === 0 && M.lot_touches_high_risk_zone === 35 && LD.lot_touches_high_risk_zone === 0, "row 13 changed");
/* Row 14: no lot inside a town's limits. */
must(F.all.in_city_limits === 0 && F.all.parcels === 506, "row 14 changed");
/* Row 15: 13 house sales, middle $785,000, $375,000 to $1.9 million. */
const HS = SA.houses_main;
must(HS.count === 13 && HS.prices.median === 785000 && HS.prices.min === 375000 && HS.prices.max === 1900000, "row 15 changed");
/* Row 16: the two waterway house sales. */
must(SA.houses_waterway.count === 2 && SA.houses_waterway.prices.min === 1170000 && SA.houses_waterway.prices.max === 1900000, "row 16 changed");
/* Row 17 (CORRECTED): 7 Landing sales, middle $280,000, $200,000 to $408,250. */
const HL = SA.houses_landing;
must(HL.count === 7 && HL.prices.median === 280000 && HL.prices.min === 200000 && HL.prices.max === 408250, "row 17 changed");
/* Row 18: one empty lot sold, on the course, for $560,000 (the deed index row; findings carries the count). */
must(SA.lots.count === 1, "row 18 changed");
const LOT_SALE = 560000;                                                               // row 18, deed 2026/05/06
/* Row 20 (CORRECTED): 300 of 352 taxed as a primary residence (85 in 100); The Landing 81 of 139 (58 in 100). */
must(M.assessed_at_4pct_legal_residence === 300 && LD.assessed_at_4pct_legal_residence === 81, "row 20 changed");
const PRIMARY = Math.round(M.assessed_at_4pct_legal_residence / M.houses * 100), PRIMARY_L = Math.round(LD.assessed_at_4pct_legal_residence / LD.houses * 100);
must(PRIMARY === 85 && PRIMARY_L === 58, "row 20 shares changed");
/* Row 21 (CORRECTED): no listing names a monthly fee; 3 of the 6 Plantation Point listings say no HOA. */
const LP = L.groups["Plantation Point"], LL = L.groups["The Landing at Plantation Point"];
must(LP.for_sale === 6 && LP.listing_says_no_hoa === 3 && LP.hoa_monthly_listed.length === 0 && LL.hoa_monthly_listed.length === 0, "row 21 changed");
/* Row 32: 6 for sale, $749,999 to $2,099,000, 4 to 6 bedrooms. Row 33: the houses for sale this fall built 1987 to 2021. */
must(LP.list_price.min === 749999 && LP.list_price.max === 2099000 && LP.beds[0] === 4 && LP.beds[1] === 6 && LP.year_built[0] === 1987, "row 32 changed");
/* Row 34: The Landing's one house for sale, built 1979. */
must(LL.for_sale === 1 && LL.year_built[0] === 1979, "row 34 changed");
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Row 37: tax on a house bought for about $785,000. 4%: 91.9 mills; 6%: 201.0 mills; a flat fee of about $90 on most bills. */
const TAX_PRIMARY = 785000 * 0.04 * (201.0 - 109.1) / 1000, TAX_OTHER = 785000 * 0.06 * 201.0 / 1000;
must(Math.round(TAX_PRIMARY / 100) * 100 === 2900 && Math.round(TAX_OTHER / 100) * 100 === 9500, "row 37 changed");
/* Rows 27 to 31: drives, no traffic. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const PPD = DR.drives["Plantation Point (middle, The Landing left out)"], LDD = DR.drives["The Landing (middle)"];
const mins = (m) => (m < 15 ? Math.round(m) : Math.round(m / 5) * 5);
const D = {
  beach: mins(PPD["nearest public beach access"].minutes), beachMiles: Math.round(PPD["nearest public beach access"].miles * 10) / 10,
  airport: mins(PPD["Myrtle Beach International Airport terminal"].minutes), broadway: mins(PPD["Broadway at the Beach"].minutes),
  mall: mins(PPD["Coastal Grand Mall"].minutes), food: mins(PPD["Food Lion, Plantation Point Plaza (1241 38th Ave N)"].minutes),
  club: mins(PPD["Myrtlewood Golf Club clubhouse (1500 48th Ave N)"].minutes),
  lBeach: mins(LDD["nearest public beach access"].minutes), lFood: mins(LDD["Food Lion, Plantation Point Plaza (1241 38th Ave N)"].minutes),
};
must(D.beach === 9 && D.beachMiles === 2.7 && D.airport === 15 && D.broadway === 7 && D.mall === 11 && D.food === 8 && D.club === 10, "rows 27 to 31 changed");
must(D.lBeach === 6 && D.lFood === 3, "rows 27 and 30 (The Landing) changed");
/* Row 29: the hospital, 13.5 minutes in the verifier's run; the ledger's figure is "about 13". */
const HOSP = PPD["Grand Strand Medical Center"].minutes;
must(HOSP > 13.3 && HOSP < 13.6, "row 29 hospital changed");
const D_HOSP = 13;
/* Row 27: on foot, about an hour. */
must(Math.round(PPD["walk to that access"].minutes / 10) === 6 && PPD["walk to that access"].miles > 2.6, "row 27 walk changed");
/* The map: the same counts as the rows. */
must(ML.counts.waterway === 58 && ML.counts.landing === 139 && ML.lots.filter((l) => l.golf).length === 135, "map layers do not match rows 8 and 9");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const INK = "#8a5226";
const C = { land: "#eef0e4", water: "#a9cfe3", waterEdge: "#7fb3cf", course: "#d3e6c4", courseEdge: "#b3d19c",
  lot: "#ffffff", lotEdge: "#b9b2a5", wLot: "#2f6f8f", gLot: "#5f8a4e", lLot: "#e2b07f", road: "#ffffff", roadEdge: "#9c9486" };
const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:${INK}!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .pp-fig{margin:1.4rem 0 1.6rem;max-width:720px}
main#main .pp-fig figcaption{color:var(--muted);font-size:.92rem;line-height:1.55;margin-top:.6rem}
main#main .pp-frame{border-radius:14px;overflow:hidden;background:${C.land};border:1px solid rgba(28,32,40,.12)}
main#main .pp-frame svg{display:block;width:100%;height:auto}
main#main svg.pp-map text{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#1c2028;paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-linejoin:round;font-size:40px;stroke-width:9px}
main#main svg.pp-map text.it{font-style:italic;font-weight:600;fill:#1f4f68}
main#main svg.pp-map text.gc{fill:#2f5326}
main#main svg.pp-map text.sm{font-weight:600;font-size:34px}
@media (max-width:379px){main#main svg.pp-map text.sm{font-size:40px}}
@media (min-width:700px){main#main svg.pp-map text{font-size:24px;stroke-width:6px}main#main svg.pp-map text.sm{font-size:21px}}
main#main .pp-legend{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.4rem;font-size:1rem;color:var(--muted);line-height:1.4}
@media (min-width:700px){main#main .pp-legend{grid-template-columns:1fr 1fr;column-gap:1.5rem}}
main#main .pp-legend li{display:flex;gap:.6rem;align-items:center;margin:0}
main#main .pp-legend i{flex:none;display:inline-block;width:1.5rem;height:1rem;border-radius:3px;border:1px solid rgba(28,32,40,.25)}
/* Short facts: a plain list under thin rules, not cards. */
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
@media (min-width:700px){main#main .pp-rules:not(.one){grid-template-columns:1fr 1fr}}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
/* One block width: tables, the map, lists and offers are 720 px. */
main#main .c3-gchart,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-cmp th:not(:first-child),main#main .pp-cmp td:not(:first-child){white-space:nowrap}
@media (max-width:480px){main#main .pp-cmp th,main#main .pp-cmp td{padding:.5rem .4rem!important;font-size:.95rem}main#main .pp-cmp th:not(:first-child),main#main .pp-cmp td:not(:first-child){white-space:normal}}
@media (max-width:399px){main#main .pp-cmp>div{padding-left:8px!important;padding-right:8px!important}main#main .pp-cmp th,main#main .pp-cmp td{padding:.45rem .25rem!important;font-size:.9rem}main#main .pp-cmp th{text-transform:none!important;letter-spacing:0!important}}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.6rem 0 1.4rem}
main#main .pp-quote{max-width:665px;margin:1.2rem 0 1.4rem;padding:.2rem 0 .2rem 1.1rem;border-left:3px solid var(--brass);color:var(--navy);font-family:var(--serif);font-size:1.2rem;line-height:1.5}
main#main .pp-quote span{display:block;font-family:var(--sans);font-size:.92rem;color:var(--muted);margin-top:.4rem}
/* The contents list: no card, plain columns between two thin rules. */
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
/* The hero's facts: a plain list under thin rules on a phone (as /submarkets/myrtle-beach/market-common/). */
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
/* The Landing's strip and its offer close the section. */
main#main .hx-strip:not(:empty){margin-top:1.2rem}
/* The end band (as /submarkets/myrtle-beach/market-common/). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The map: every lot, colored by what it is on (rows 8 and 9), from map-layers.json.            */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const [W0, S0, E0, N0] = ML.frame, MW = 1000, MH = Math.round(MW * (my(N0) - my(S0)) / (mx(E0) - mx(W0)));
const P = (lo, la) => [(mx(lo) - mx(W0)) / (mx(E0) - mx(W0)) * MW, (my(N0) - my(la)) / (my(N0) - my(S0)) * MH];
const f1 = (v) => Math.round(v * 10) / 10;
const ringD = (r) => "M" + r.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L") + "Z";
const lineD = (pts) => "M" + pts.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L");
const centroid = (lots) => { const pts = lots.flatMap((l) => l.r[0]); return P(pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length); };

const MAP = (() => {
  const by = (k) => ML.lots.filter((l) => l.k === k).map((l) => l.r.map(ringD).join("")).join("");
  const fill = { plain: C.lot, waterway: C.wLot, golf: C.gLot, landing: C.lLot };
  const lots = ["plain", "landing", "golf", "waterway"].map((k) => `<path d="${by(k)}" fill="${fill[k]}" stroke="${k === "plain" ? C.lotEdge : "#fff"}" stroke-width="1.2" stroke-linejoin="round"/>`).join("");
  /* Landing lots on the course get a green edge, so the 47 show inside The Landing's color. */
  const lGolf = ML.lots.filter((l) => l.k === "landing" && l.golf).map((l) => l.r.map(ringD).join("")).join("");
  const water = ML.icw.map(ringD).join(""), course = ML.golf.map(ringD).join("");
  const roads = ML.roads.map((r) => lineD(r.p)).join("");
  const [fx, fy] = P(...ML.labels["Food Lion, Plantation Point Plaza"]);
  const [cx, cy] = P(...ML.labels["Myrtlewood Golf Club clubhouse"]);
  const pp = centroid(ML.lots.filter((l) => l.k !== "landing")), ld = centroid(ML.lots.filter((l) => l.k === "landing"));
  const lab = (t, x, y, o = {}) => `<text${o.cls ? ` class="${o.cls}"` : ""} x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x)} ${f1(y)})"` : ""}>${t}</text>`;
  /* Label spots in map units (the frame is 1000 wide), placed by eye on the drawn map: on the water, on the open
     course, along the bypass. The lot colors carry the facts; the labels only name the places. */
  must(MH > 650 && MH < 760, `the map frame changed (height ${MH}); place the labels again`);
  const svg = `<svg class="pp-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" role="img" aria-labelledby="pp-map-t">`
    + `<title id="pp-map-t">Map of Plantation Point in Myrtle Beach. The Intracoastal Waterway runs along one side, and the Myrtlewood golf courses along another. The lots on the waterway are blue, the lots on the golf course are green, and The Landing's smaller lots, near the US 17 Bypass, are tan. An arrow points southeast to the beach, ${D.beachMiles} miles away by road.</title>`
    + `<rect width="${MW}" height="${MH}" fill="${C.land}"/>`
    + `<path d="${course}" fill="${C.course}" stroke="${C.courseEdge}" stroke-width="1.5"/>`
    + `<path d="${water}" fill="${C.water}" stroke="${C.waterEdge}" stroke-width="1.5"/>`
    + `<path d="${roads}" fill="none" stroke="${C.roadEdge}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="${roads}" fill="none" stroke="${C.road}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
    + lots
    + `<path d="${lGolf}" fill="none" stroke="${C.gLot}" stroke-width="3" stroke-linejoin="round"/>`
    + `<circle cx="${f1(fx)}" cy="${f1(fy)}" r="11" fill="${INK}" stroke="#fff" stroke-width="4"/>`
    + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="11" fill="#2f5326" stroke="#fff" stroke-width="4"/>`
    + lab("Intracoastal Waterway", 300, 214, { cls: "it", rot: -28 })
    + lab("Myrtlewood", 850, 158, { cls: "gc" }) + lab("golf courses", 850, 206, { cls: "gc" })
    + lab("Plantation Point", pp[0], pp[1])
    + lab("The Landing", ld[0], ld[1])
    + lab("US 17 Bypass", 585, 612, { cls: "sm", rot: -35 })
    + lab("Food Lion", fx, fy - 24, { cls: "sm" })
    + lab("Clubhouse", cx - 20, cy + 12, { cls: "sm gc", anchor: "end" })
    /* The beach is off the map to the southeast (row 27: access MYRTLE BEACH 86, 2.7 miles by road; bearing about
       136 degrees from the middle of Plantation Point, drives.json). A small arrow in the empty corner past the bypass. */
    + `<path d="M890 605L950 665" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M968 683L936.9 676.7L956.7 656.9Z" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
    + lab(`Beach, ${D.beachMiles} mi`, 985, 578, { cls: "sm", anchor: "end" })
    + `</svg>`;
  const key = `<ul class="pp-legend">`
    + `<li><i style="background:${C.wLot}"></i>On the Intracoastal Waterway: ${M.waterway_lots} lots</li>`
    + `<li><i style="background:${C.gLot}"></i>On the golf course: ${M.golf_lots} lots</li>`
    + `<li><i style="background:${C.lLot};border:3px solid ${C.gLot}"></i>The Landing, with ${LD.golf_lots} lots on the course</li>`
    + `<li><i style="background:${C.lot}"></i>Other lots in Plantation Point</li></ul>`;
  return `<figure class="pp-fig"><div class="pp-frame">${svg}</div>${key}<figcaption>Every lot in Plantation Point and The Landing. The arrow points to the nearest public beach access, ${D.beachMiles} miles away by road. Lots: Horry County parcels. Roads: U.S. Census Bureau TIGER/Line. Map: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain): pools behind the houses, row 6.  */

const AIR = PHOTOS.find((r) => r.file.includes("plantation-point-pools-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Part of Plantation Point from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The two parts side by side (rows 1, 3 to 6, 8, 9, 15, 17, 27). Short row labels and no-break units, so
   both columns fit a 320 px phone without a scroll box (review 1). */

const NB = "&nbsp;";
const CMP = `<div class="pp-cmp">` + h.table(["", "Plantation Point", "The Landing"], [
  ["Houses", n(M.houses), n(LD.houses)],
  ["Lot", `Half an acre`, `${LANDING_LOT}${NB}sq${NB}ft`],
  ["Under roof", `${ROOF}${NB}sq${NB}ft`, `${ROOF_L}${NB}sq${NB}ft`],
  ["Pools", n(M.pools), n(LD.pools)],
  ["Golf lots", n(M.golf_lots), n(LD.golf_lots)],
  ["Waterway lots", n(M.waterway_lots), "None"],
  ["Sold, past year", `${HS.count}, about ${r5k(HS.prices.median)}`, `${HL.count}, about ${r5k(HL.prices.median)}`],
  ["Beach by car", `${D.beach}${NB}min`, `${D.lBeach}${NB}min`],
]) + `</div>`;

/* ---------------------------------------------------------------------------- */
/* The drives (rows 27 to 31): one chart, minutes by car with no traffic.          */

const DRIVES = G.bars([
  { name: "Broadway at the Beach", value: D.broadway },
  { name: "Food Lion, Plantation Point Plaza", value: D.food },
  { name: "The beach", value: D.beach },
  { name: "Coastal Grand Mall", value: D.mall },
  { name: "Grand Strand Medical Center", value: D_HOSP },
  { name: "Myrtle Beach International Airport", value: D.airport },
].map((r) => Object.assign(r, { valueText: `${r.value} min` })), {
  caption: "Minutes by car from the middle of Plantation Point",
  nameLabel: "Place", valueLabel: "By car, about", compact: true,
  note: `With no traffic. The beach is the nearest public beach access, about ${D.beachMiles} miles away, about an hour on foot. Routes on OpenStreetMap roads.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  zoning: "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf",
  fema: "https://msc.fema.gov/portal/home",
  golf: "https://www.playgolfmyrtlebeach.com/news/5-things-know-go-myrtlewood-pinehills/",
  sce: "https://www.scencyclopedia.org/sce/entries/myrtle-beach/",
  hobcaw: "https://npgallery.nps.gov/AssetDetail/NRIS/94001236",
  hopsewee: "https://npgallery.nps.gov/AssetDetail/NRIS/71000782",
  plaza: "https://rivercrest.propertycapsule.com/web/property/49562478de4c54fafd4ec46fdb297de5-aa9ee5a5b1155137461f9e4c7389f038",
  swa: "https://www.solidwasteauthority.org/recyclingcenters.html",
  swaRes: "https://www.solidwasteauthority.org/residential.html",
  decal: "https://cityofmyrtlebeach.com/i_want_to/apply_for/resident_parking_decal.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  osm: "https://www.openstreetmap.org/",
};

/* ---------------------------------------------------------------------------- */
/* The offers.                                                                    */

const CONTACT = `/contact/?place=${encodeURIComponent("Plantation Point")}`;
const CONTACT_L = `/contact/?place=${encodeURIComponent("The Landing at Plantation Point")}`;

/* The place, for search engines: a Place with its point and the town it is in. */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Plantation Point", alternateName: "Plantation Point, Myrtle Beach",
  description: `A neighborhood of ${M.houses} houses on the Intracoastal Waterway beside the Myrtlewood golf courses, with The Landing at Plantation Point next to it, in unincorporated Horry County with Myrtle Beach mailing addresses.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center_main[0], longitude: F.center_main[1] },
  address: { "@type": "PostalAddress", addressLocality: "Myrtle Beach", addressRegion: "SC", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "Plantation Point Myrtle Beach Homes: Half Have a Pool",
  description: "Plantation Point in Myrtle Beach: 352 houses on half-acre lots by the Intracoastal and Myrtlewood golf. What homes sold for, the HOA, flood zone, The Landing.",
  ogTitle: "Plantation Point homes in Myrtle Beach: half-acre lots, and half the houses have a pool",
  crumb: "Plantation Point",
  eyebrow: "Plantation Point, Myrtle Beach",
  h1: "Plantation Point homes in Myrtle Beach:",
  h1em: "half-acre lots, and half the houses have a pool.",
  /* Review 1: the sub line is its own hook (row 12, the verifier's wording), not a preview of the short answer. */
  sub: "Myrtlewood Golf Club, next to Plantation Point, serves food and drink to people who do not play, and it has a patio by the Intracoastal Waterway.",
  heroMedia: CSS + glance([
    { icon: "home", label: "Houses", text: n(M.houses) },
    { icon: "pool", label: "In-ground pools", text: n(M.pools) },
    { icon: "water", label: "On the waterway", text: `${M.waterway_lots} lots` },
    { icon: "golf", label: "On the golf course", text: `${M.golf_lots} lots` },
  ]),
  /* Round 2: the live homes strip is the first call to action; a button to /homes/ fails the audit. */
  heroCta: false,
  author: "devin",
  shortAnswer: [
    /* Where it is: row 41 (VERIFIED-BY-FIXER, review 1), row 30 (38th Avenue North), row 27 (2.7 miles). */
    `Plantation Point is a neighborhood of ${M.houses} houses in Myrtle Beach, between the US 17 Bypass and the Intracoastal Waterway, near 38th Avenue North. The nearest public beach access is about ${D.beachMiles} miles away.`,
    `In the past year a typical house here sold for about ${r5k(HS.prices.median)}. No home for sale lists a monthly HOA fee. Across the golf course, The Landing at Plantation Point has ${LD.houses} smaller houses that sold for about ${r5k(HL.prices.median)}.`,
  ],
  sections: [
    { h2: "What is it like to live in Plantation Point?", toc: "Life here", id: "life", html: () =>
      /* Review 1: the sell first (the pools against the county, the aerial, the club), the record after. */
      h.p(`The county's map shows an in-ground pool at ${n(M.pools)} of the ${n(M.houses)} houses here. Across Horry County, the same map shows about 1 in-ground pool for every 16 residential buildings. Our ${h.a("/buyers/pool-homes/", "pool homes guide")} covers what a pool costs to keep.`) +
      AERIAL +
      G.homesCss() + G.homesQScript() +
      G.homesQ("subdivision=Plantation Point&has=pool", "Plantation Point houses with their own pool") +
      h.p(`Next door is Myrtlewood Golf Club, with two courses, PineHills and Palmetto.`) +
      `<blockquote class="pp-quote">"PineHills is widely regarded as the soul of Myrtle Beach golf, and its Myrtlewood sister, the Palmetto Course, as the heart."<span>${h.a(SRC.golf, "Play Golf Myrtle Beach")}</span></blockquote>` +
      h.p(`The clubhouse is across the course, a ${D.club}-minute drive. Our ${h.a("/buyers/golf-communities/", "golf communities guide")} compares the area's golf neighborhoods.`) +
      G.homesQ("subdivision=Plantation Point&has=on_golf_course", "Plantation Point houses on the golf course") +
      h.p(`A typical lot is about half an acre, and the smallest is about a third of an acre. The typical house is about ${ROOF} square feet under roof, garage included. The houses for sale this fall were built from 1987 to 2021.`) +
      h.p(`Most are full-time homes: the county taxes about ${PRIMARY} in 100 houses here as their owner's primary residence.`) +
      h.h3("Where a normal week takes you") +
      h.p(`The nearest groceries are at the Food Lion in Plantation Point Plaza, across the bypass at 38th Avenue North.`) +
      DRIVES +
      h.h3("A little history") +
      h.p(`${h.a(SRC.sce, "Myrtle Beach Farms")}, formed in 1912 and later Burroughs & Chapin, played a central role in the growth of Myrtle Beach. It recorded Plantation Point's restrictions in phases, starting in 1990.`) +
      h.p(`Several streets share their names with old rice plantations in Georgetown County, such as Annandale, ${h.a(SRC.hobcaw, "Hobcaw")} and ${h.a(SRC.hopsewee, "Hopsewee")}.`) },

    { h2: "Which Plantation Point lots are on the waterway and the golf course?", toc: "Water and golf lots", id: "lots", html: (bg) =>
      h.p(`Every waterway lot is in Plantation Point itself, and the map shows where they are. Two of the waterway houses sold in the past year, for ${mil(SA.houses_waterway.prices.min)} and ${mil(SA.houses_waterway.prices.max)}.`) +
      MAP +
      h.p(`Lots in both parts border the Myrtlewood courses. Empty lots are rare: the county map shows ${M.vacant_lots}, and one on the course sold for ${r1k(LOT_SALE)} in the past year. The county zones these streets for single-family houses on lots of at least 10,000 square feet.`) +
      h.p(`Before you offer on a waterway house, we find out what dock it has and what the rules allow. Our ${h.a("/buyers/waterfront-homes/#docks", "waterfront homes guide")} explains the dock rules on the Intracoastal.`) +
      G.homesQ("subdivision=Plantation Point", "Every house for sale in Plantation Point") },

    { h2: "What do homes in Plantation Point sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year ${HS.count} houses in Plantation Point sold, at a middle price of about ${r5k(HS.prices.median)}. They ranged from about ${r5k(HS.prices.min)} to ${mil(HS.prices.max)}.`) +
      h.p(`On ${COUNT_DAY}, ${LP.for_sale} houses were for sale here, asking about ${r5k(LP.list_price.min)} to ${mil(LP.list_price.max)}.`) +
      `<p class="pp-note">Sale prices: Horry County deeds recorded in the past 12 months, houses only. Asking prices: CCMLS listings, counted in aggregate.</p>` +
      h.p(`Besides the mortgage and ${h.a("/buyers/coastal-insurance/", "insurance")}, property tax on a typical house here is about $${n(Math.round(TAX_PRIMARY / 100) * 100)} a year as your ${h.a("/buyers/property-taxes/", "primary residence")}. As a second home or rental it is about $${n(Math.round(TAX_OTHER / 100) * 100)} a year. Most bills also include a flat county fee of about $90.`) +
      h.p(`If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) },

    { h2: "Does Plantation Point have an HOA fee?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p(`Not one of the ${LP.for_sale} Plantation Point homes for sale lists a monthly fee, and ${LP.listing_says_no_hoa} of them say there is no HOA at all. Before you offer, we find out what the association collects, if anything, for the house you pick.`) +
      `<ul class="pp-rules one" aria-label="The HOA and the neighborhood's rules">`
        + `<li><strong>The association</strong>The only parcel the county lists for Plantation Point HOA is a small common area by the US 17 Bypass.</li>`
        + `<li><strong>The fee shown for a home for sale</strong>The listing agent enters that fee, so we confirm it with the association.</li>`
        + `<li><strong>The recorded rules</strong>Each lot comes with recorded restrictions, the neighborhood's rules. The county's index of them is online, but the documents can only be read at the Register of Deeds in Conway. We pull them for the lot you like.</li>`
        + `<li><strong>Renting</strong>County zoning has no limit on how long a home outside the towns may be rented. A subdivision's recorded rules can have one. Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers renting by the night.</li>`
        + `</ul>` +
      h.cta("Like a lot? Have us pull its restrictions", "We read the recorded rules for that lot in Conway and tell you what they allow before you offer.", "Have us pull the restrictions", CONTACT, bg) },

    { h2: "Is Plantation Point in the City of Myrtle Beach?", toc: "City limits", id: "city", html: () =>
      h.p(`No. Every house here has a Myrtle Beach mailing address. The land is outside the city limits, in Horry County. Three things change for an owner:`) +
      `<ul class="pp-rules one" aria-label="What being outside the city limits changes">`
        + `<li><strong>Property tax</strong>The bill has county and school tax and no city tax. The yearly figures above already count that.</li>`
        + `<li><strong>Trash</strong>The county does not collect trash at the curb. Owners hire a private hauler or use a county recycling and convenience center. The county's 25 centers are open only to residents outside the towns.</li>`
        + `<li><strong>City parking decal</strong>The city's resident parking decal is only for cars kept inside the city limits that pay city vehicle tax. Plantation Point owners do not qualify.</li>`
        + `</ul>` +
      h.p(`Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city's own neighborhoods and what changes inside its limits.`) },

    { h2: "Is Plantation Point in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      /* Review 1: the lender line in the 2026-10-b verifier's wording (nohoa-verify-v10 N4), not "will not require". */
      h.p(`No house in Plantation Point or The Landing is in FEMA's high-risk zone, the zone where a lender requires flood insurance. We checked every house outline here against FEMA's map.`) +
      `<ul class="pp-rules one" aria-label="What the flood map shows here">`
        + `<li><strong>Along the water</strong>A high-risk strip runs along the Intracoastal. It touches the waterway edge of ${M.lot_touches_high_risk_zone} lots and stops short of the houses.</li>`
        + `<li><strong>Flood history</strong>A zone does not show whether a house has flooded. We check each house's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.</li>`
        + `</ul>` +
      h.cta("Like a waterway house? Have us check its flood history", "Send us the listing. We check its flood zone and its flood history, and tell you what we find.", "Have us check a house", CONTACT, bg) },

    { h2: "The Landing at Plantation Point: the same location for less", toc: "The Landing", id: "the-landing", html: () =>
      h.p(`The Landing at Plantation Point is the older, smaller part of the neighborhood, near the US 17 Bypass. Its houses sold for about ${r5k(HL.prices.median)} in the past year, about a third of Plantation Point's middle price.`) +
      h.p(`It is the part closer to the beach, and the Food Lion is about ${D.lFood} minutes away by car.`) +
      CMP +
      `<p class="pp-note">Sizes, prices and drives are the typical one for each part, rounded. Houses, lots and pools: Horry County parcels. Sales: deeds recorded in the past 12 months. Drives: no traffic.</p>` +
      G.homesCss() + G.homes("landing-at-plantation-point", "The Landing at Plantation Point", "", "The Landing at Plantation Point: 6 minutes to the beach") +
      G.homesQ("near=33.72855,-78.88639&miles=1", "Homes for sale within a mile of Plantation Point") },
  ],
  faqTitle: "Plantation Point FAQ",
  faq: [
    { q: "Is there a Plantation Point golf course?", a: "The course beside the lots is Myrtlewood Golf Club, with two courses, PineHills and Palmetto. Lots in both Plantation Point and The Landing border it." },
    { q: "Where is Plantation Point Plaza?", a: `Plantation Point Plaza is the shopping center at the US 17 Bypass and 38th Avenue North, with a Food Lion. It is about ${D.food} minutes by car from the middle of Plantation Point and about ${D.lFood} from The Landing.` },
    { q: "Can you walk to the beach from Plantation Point?", a: `Not easily. The nearest public beach access is about ${D.beachMiles} miles away, about an hour on foot or about ${D.beach} minutes by car.` },
    { q: "Can I rent out a house in Plantation Point?", a: "County zoning has no limit on how long a home here may be rented. The recorded restrictions can have one, so we pull them for the house you pick." },
    { q: "Do I need flood insurance in Plantation Point?", a: `No house here is in FEMA's high-risk zone, the zone where a lender requires flood insurance. Where the zone touches ${M.lot_touches_high_risk_zone} lots along the water, it stops short of the houses, so we check each house's flood history before you offer.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "zoning", href: SRC.zoning },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "Myrtlewood", href: SRC.golf },
    { name: "Myrtle Beach Farms", href: SRC.sce },
    { name: "Hobcaw", href: SRC.hobcaw },
    { name: "Hopsewee", href: SRC.hopsewee },
    { name: "Plantation Point Plaza", href: SRC.plaza },
    { name: "recycling centers", href: SRC.swa },
    { name: "trash pickup", href: SRC.swaRes },
    { name: "parking decal", href: SRC.decal },
    { name: "tax levy", href: SRC.levy },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, building outlines, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in Plantation Point.",
    p: "Tell us waterway, fairway or pool, and your budget. We line up the houses that fit, each with its lot, its flood zone and its yearly tax.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Plantation Point Myrtle Beach, Plantation Point homes for sale, Plantation Point Myrtle Beach SC, Plantation Point HOA, Plantation Point golf course, Myrtlewood golf course homes, The Landing at Plantation Point, Plantation Point Plaza, Plantation Point flood zone",
  about: "Plantation Point and The Landing at Plantation Point, neighborhoods on the Intracoastal Waterway beside the Myrtlewood golf courses in Myrtle Beach, South Carolina",
});
