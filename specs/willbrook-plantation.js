/* /submarkets/pawleys-island/willbrook-plantation/ - Willbrook Plantation, Pawleys Island: what living there is like
 * (lots of more than half an acre, seven in ten touching the golf course land, gated Litchfield by the Sea around it),
 * the three neighborhoods inside the name, what the houses sold for, the HOA question, the flood zone, and the town question.
 *
 * Batch 2026-11-e, Lane N (new page), neighborhood pilot shape of specs/plantation-point.js.
 * Facts: Blog-Brain batches/2026-11-e/willbrook-plantation/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's values and wording only (VERIFY.md). Demand: must-answer.md. Plan: PLAN.md.
 * Not used: "open to the public" (row 6), any grant date (row 26), golf acreage (row 5), the county's 70 and 50 flood counts (row 12:
 * FEMA's 63 are used), "Tradition Club at Willbrook" as a strip title (row 21), the 1877 to 1881 deeds (row 24), a pool or dock claim,
 * Willowbrook, beach-club access (row 19).
 * Data: data/2026-11-e/willbrook-plantation/. findings.json, drives.json, listings.json from the researcher's run (reproduced by the
 * verifier); fema.json holds the verifier's FEMA counts; map-layers.json is drawn by map_layers.py from the same county cache.
 * Pictures: one map we drew from Georgetown County parcels, FEMA's flood map and the Census road lines. No photo: the shot list is in BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/pawleys-island/willbrook-plantation/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "willbrook-plantation");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-layers.json"), FE = read("fema.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const mil = (v) => "$" + (Math.round(v / 10000) / 100).toString() + " million";
const must = (ok, msg) => { if (!ok) throw new Error(`willbrook-plantation.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const CO = F.core, TR = F.parts.TRADITION, MI = F.parts.MINGO;
/* Row 1: 189 houses and 12 empty lots in the core. Row 2: 478 parcels, 13 empty lots in all. */
must(CO.houses === 189 && CO.empty_lots === 12 && F.all.parcels === 478, "rows 1 and 2 changed");
/* Row 4: the typical core lot is 0.58 acre. */
must(CO.lot_acres.median === 0.583 && TR.lot_acres.median === 0.238 && MI.lot_acres.median === 0.077, "row 4 or 11 lot sizes changed");
/* Row 5 (CORRECTED): 131 of 189 core houses share a boundary with the golf parcel (the 15 m count, 138, is not printed). */
must(ML.house_lots_touching_golf === 131 && CO.golf_lots === 138 && TR.golf_lots === 0 && MI.golf_lots === 0, "row 5 changed");
const TOUCH = ML.house_lots_touching_golf;
must(Math.round(TOUCH / CO.houses * 10) === 7, "row 5 share changed");
/* Row 8: about 4,200 square feet under roof. */
must(CO.footprint_sqft.median === 4207, "row 8 changed");
/* Row 10: 8 sales, middle 1,017,500, 775,000 to 1,375,000; 18 in 3 years, middle 995,000. */
must(CO.sales_12m.n === 8 && CO.sales_12m.median === 1017500 && CO.sales_12m.min === 775000 && CO.sales_12m.max === 1375000, "row 10 changed");
must(CO.sales_3y.n === 18 && CO.sales_3y.median === 995000, "row 10 three years changed");
/* Row 11: Tradition 135 houses, 8 sales, middle 572,000; Mingo 41 houses plus 28 condo units, 4 sales, middle 491,500. */
must(TR.houses === 135 && TR.sales_12m.n === 8 && TR.sales_12m.median === 572000 && MI.houses === 41 && MI.condo_units === 28 && MI.sales_12m.n === 4 && MI.sales_12m.median === 491500, "row 11 changed");
/* Row 12 (CORRECTED): FEMA: 63 of 189 roofs (33%); Tradition and Mingo none; Oak Point 6 of 7. */
must(FE.core_house_roofs_touching_high_risk_zone === 63 && FE.core_houses === 189 && Math.round(63 / 189 * 3) === 1 && FE.tradition_roofs === 0 && FE.mingo_roofs === 0 && FE.oak_point_roofs_touching_zone === 6 && FE.oak_point_houses === 7, "row 12 changed");
/* Rows 13 and 14: district 4, $96 in storm water and household fees; 1,017,500 x .04 x .1140 + 96 and x .06 x .2371 + 96. */
const PRICE = CO.sales_12m.median;
const TAX_FULL = PRICE * 0.04 * 0.1140 + 96, TAX_OTHER = PRICE * 0.06 * 0.2371 + 96;
must(Math.round(TAX_FULL / 10) * 10 === 4740 && Math.round(TAX_OTHER / 10) * 10 === 14570, "row 14 changed");
/* Row 16 (CORRECTED): the listings' fee brackets, every one at $350 a month or less. */
const LW = L.groups["Willbrook Plantation"];
must(L.groups["Willbrook Plantation"].fee_at_or_under["350"] === LW.for_sale && LW.fee_at_or_under["250"] === 1 && LW.fee_at_or_under["325"] === 1, "row 16 changed");
/* Row 20: drives. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const DD = DR.drives;
const mins = (m) => (m < 15 ? Math.round(m) : Math.round(m / 5) * 5);
const D = {
  beach: mins(DD["nearest public beach access"].minutes), beachMiles: Math.round(DD["nearest public beach access"].miles * 10) / 10, walk: Math.round(DD["walk to that access"].minutes / 10) * 10,
  brook: mins(DD["Brookgreen Gardens"].minutes), marsh: mins(DD["Murrells Inlet MarshWalk"].minutes), hosp: mins(DD["Tidelands Waccamaw Community Hospital"].minutes),
  airport: mins(DD["Myrtle Beach International Airport terminal"].minutes), club: mins(DD["Willbrook Plantation Golf Club clubhouse (Nominatim point)"].minutes),
  gate: mins(DD["Willbrook Boulevard at US 17 (entrance)"].minutes),
};
must(D.beach === 9 && D.beachMiles === 4 && D.walk === 80 && D.brook === 15 && D.marsh === 20 && D.hosp === 15 && D.airport === 35 && D.club === 6 && D.gate === 7, "row 20 changed");
/* The map: the same counts as the rows. */
must(ML.counts.tradition === 143 && ML.counts.mingo === 69 && ML.lots.length === 419, `map layers changed ${JSON.stringify(ML.counts)} ${ML.lots.length}`);

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const INK = "#8a5226";
const C = { land: "#eef0e4", course: "#d3e6c4", courseEdge: "#b3d19c", lot: "#ffffff", lotEdge: "#b9b2a5", gLot: "#5f8a4e", tLot: "#e2b07f", mLot: "#a7adb8", flood: "#2f6f8f", road: "#ffffff", roadEdge: "#9c9486" };
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
/* A strip closes its section. */
main#main .hx-strip:not(:empty){margin-top:1.2rem}
/* The end band (as /submarkets/myrtle-beach/market-common/). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;


/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain): houses on a lake and the course.  */

const AIR = PHOTOS.find((r) => r.file.includes("willbrook-plantation-golf-course-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Part of Willbrook Plantation from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The map: every lot, colored by what it is (rows 1, 5, 11, 12), from map-layers.json.            */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const [W0, S0, E0, N0] = ML.frame, MW = 1000, MH = Math.round(MW * (my(N0) - my(S0)) / (mx(E0) - mx(W0)));
const P = (lo, la) => [(mx(lo) - mx(W0)) / (mx(E0) - mx(W0)) * MW, (my(N0) - my(la)) / (my(N0) - my(S0)) * MH];
const f1 = (v) => Math.round(v * 10) / 10;
const ringD = (r) => "M" + r.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L") + "Z";
const lineD = (pts) => "M" + pts.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L");
const centroid = (lots) => { const pts = lots.flatMap((l) => l.r); return P(pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length); };

const MAP = (() => {
  const by = (k) => ML.lots.filter((l) => l.k === k).map((l) => ringD(l.r)).join("");
  const fill = { core: C.lot, golf: C.gLot, tradition: C.tLot, mingo: C.mLot };
  const lots = ["core", "tradition", "mingo", "golf"].map((k) => `<path d="${by(k)}" fill="${fill[k]}" stroke="${k === "core" ? C.lotEdge : "#fff"}" stroke-width="1.2" stroke-linejoin="round"/>`).join("");
  const course = ML.golf.map(ringD).join(""), flood = ML.fema.map(ringD).join("");
  const roads = ML.roads.map(lineD).join("");
  const lab = (t, x, y, o = {}) => `<text${o.cls ? ` class="${o.cls}"` : ""} x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x)} ${f1(y)})"` : ""}>${t}</text>`;
  const [gx, gy] = P(...ML.labels["Willbrook Plantation Golf Club"]);
  const [ex, ey] = P(-79.0968, 33.4855);
  const tr = centroid(ML.lots.filter((l) => l.k === "tradition")), mi = centroid(ML.lots.filter((l) => l.k === "mingo"));
  must(MH > 480 && MH < 620, `the map frame changed (height ${MH}); place the labels again`);
  const svg = `<svg class="pp-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" role="img" aria-labelledby="wb-map-t">`
    + `<title id="wb-map-t">Map of Willbrook Plantation in Pawleys Island. The golf course runs through the neighborhood. The lots that touch the golf course are green, the Tradition Club lots are tan, the smaller Mingo lots are grey, and the area in FEMA's high-risk flood zone is striped blue. The entrance is on US 17 at the right.</title>`
    + `<defs><pattern id="wb-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="${C.flood}" stroke-width="2.2"/></pattern></defs>`
    + `<rect width="${MW}" height="${MH}" fill="${C.land}"/>`
    + `<path d="${course}" fill="${C.course}" stroke="${C.courseEdge}" stroke-width="1.5"/>`
    + `<path d="${roads}" fill="none" stroke="${C.roadEdge}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="${roads}" fill="none" stroke="${C.road}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
    + lots
    + `<path d="${flood}" fill="url(#wb-hatch)" fill-opacity=".5" stroke="${C.flood}" stroke-width="1.2" stroke-opacity=".7" stroke-linejoin="round"/>`
    + `<circle cx="${f1(gx)}" cy="${f1(gy)}" r="11" fill="#2f5326" stroke="#fff" stroke-width="4"/>`
    + `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="11" fill="${INK}" stroke="#fff" stroke-width="4"/>`
    + lab("Willbrook Plantation", gx + 22, gy - 6, { cls: "gc", anchor: "start" }) + lab("Golf Club", gx + 22, gy + 42, { cls: "gc", anchor: "start" })
    + lab("Willbrook", 250, 225, { cls: "it" })
    + lab("Tradition Club", tr[0], tr[1] - 100)
    + lab("Mingo", mi[0], mi[1] + 62)
    + lab("US 17 entrance", ex + 6, ey - 24, { cls: "sm", anchor: "end" })
    + `</svg>`;
  const key = `<ul class="pp-legend">`
    + `<li><i style="background:${C.gLot}"></i>Lots that touch the golf course: ${TOUCH} houses</li>`
    + `<li><i style="background:${C.lot}"></i>Other lots in Willbrook: ${CO.houses - TOUCH} houses</li>`
    + `<li><i style="background:${C.tLot}"></i>Tradition Club at Willbrook: ${TR.houses} houses</li>`
    + `<li><i style="background:${C.mLot}"></i>Mingo at Willbrook: ${MI.houses} houses, ${MI.condo_units} condo units</li>`
    + `<li><i style="background:repeating-linear-gradient(45deg,${C.flood} 0 2px,#fff 2px 5px)"></i>FEMA's high-risk flood zone</li></ul>`;
  return `<figure class="pp-fig"><div class="pp-frame">${svg}</div>${key}<figcaption>Every lot in the Willbrook name. The pale green is the golf course land. Lots: Georgetown County parcels. Flood zone: FEMA. Roads: U.S. Census Bureau TIGER/Line. Map: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* The three neighborhoods side by side (rows 1, 4, 5, 10, 11, 12).                */

const NB = "&nbsp;";
const CMP = `<div class="pp-cmp">` + h.table(["", "Willbrook", "Tradition Club", "Mingo"], [
  ["Houses", n(CO.houses), n(TR.houses), `${MI.houses}${NB}+${NB}${MI.condo_units}${NB}condos`],
  ["Typical lot", `${CO.lot_acres.median.toFixed(2)}${NB}acre`, `${TR.lot_acres.median.toFixed(2)}${NB}acre`, `${MI.lot_acres.median.toFixed(2)}${NB}acre`],
  ["Touch the course", n(TOUCH), "–", "–"],
  ["In flood zone", n(FE.core_house_roofs_touching_high_risk_zone), "None", "None"],
  ["Sold, past year", n(CO.sales_12m.n), n(TR.sales_12m.n), n(MI.sales_12m.n)],
  ["Middle price", mil(CO.sales_12m.median), r5k(TR.sales_12m.median), r5k(MI.sales_12m.median)],
]) + `</div>`;

/* ---------------------------------------------------------------------------- */
/* The drives (row 20): one chart, minutes by car with no traffic.                 */

const DRIVES = G.bars([
  { name: "Willbrook Plantation Golf Club", value: D.club },
  { name: "The entrance at US 17", value: D.gate },
  { name: "The beach", value: D.beach },
  { name: "Brookgreen Gardens", value: D.brook },
  { name: "Tidelands Waccamaw Community Hospital", value: D.hosp },
  { name: "Murrells Inlet MarshWalk", value: D.marsh },
  { name: "Myrtle Beach International Airport", value: D.airport },
].map((r) => Object.assign(r, { valueText: `${r.value} min` })), {
  caption: "Minutes by car from the middle of Willbrook Plantation",
  nameLabel: "Place", valueLabel: "By car, about", compact: true,
  note: `With no traffic. The beach is the nearest public beach access, about ${D.beachMiles} miles away, about ${D.walk} minutes on foot. Routes on OpenStreetMap roads.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://gis1.georgetowncountysc.org/portal/rest/services",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  tax: "https://www.gtcountysc.gov/385/Property-Tax-Calculator",
  club: "https://www.willbrookgolf.com/about-willbrook/",
  member: "https://www.willbrookgolf.com/golf-memberships/",
  lbts: "https://litchfieldbythesea.com/communities/willbrook/",
  lbtsHome: "https://litchfieldbythesea.com/",
  scp: "https://south-carolina-plantations.com/georgetown/willbrook.html",
  osm: "https://www.openstreetmap.org/",
};

/* ---------------------------------------------------------------------------- */
/* The offers.                                                                    */

const CONTACT = `/contact/?place=${encodeURIComponent("Willbrook Plantation")}`;

/* The place, for search engines: a Place with its point and the town on its mail. */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Willbrook Plantation", alternateName: "Willbrook Plantation, Pawleys Island",
  description: `A neighborhood of ${CO.houses} houses beside the Willbrook Plantation golf course, inside the gated community of Litchfield by the Sea, in unincorporated Georgetown County with Pawleys Island mailing addresses.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center_core[0], longitude: F.center_core[1] },
  address: { "@type": "PostalAddress", addressLocality: "Pawleys Island", addressRegion: "SC", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Georgetown County, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  pageImages: () => PH.pageImages(AIR),
  url: SELF,
  hub: { name: "Pawleys Island", url: "/submarkets/pawleys-island/" },
  title: "Willbrook Plantation Homes, Pawleys Island: Golf, HOA, Flood",
  description: "Willbrook Plantation in Pawleys Island: 189 houses on half-acre lots, 131 touching the golf course. What homes sold for, the HOA, flood zones, Tradition Club.",
  ogTitle: "Willbrook Plantation homes in Pawleys Island: seven in ten lots touch the golf course",
  crumb: "Willbrook Plantation",
  eyebrow: "Willbrook Plantation, Pawleys Island",
  h1: "Willbrook Plantation homes in Pawleys Island:",
  h1em: "seven in ten lots touch the golf course.",
  sub: "The golf course at Willbrook Plantation has water on 15 of its 18 holes, and the nearest public beach access is about 9 minutes away by car.",
  heroMedia: CSS + glance([
    { icon: "home", label: "Houses in the main part", text: n(CO.houses) },
    { icon: "golf", label: "Touch the golf course", text: `${TOUCH} houses` },
    { icon: "dollar", label: "Typical sale, past year", text: `about ${mil(CO.sales_12m.median)}` },
    { icon: "beach", label: "Nearest public beach, by car", text: `${D.beach} minutes` },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Willbrook Plantation is a neighborhood in Pawleys Island, inside the gated community of Litchfield by the Sea, built around ${h.a(SRC.club, "Willbrook Plantation Golf Club")}. Its main part has ${CO.houses} houses. A typical lot is a little over half an acre, and ${TOUCH} of the houses have lots that touch the golf course land. Tee times are booked on the club's website.`,
    `In the past year a typical house here sold for about ${mil(CO.sales_12m.median)}. About one in three has part of its roof outline in FEMA's high-risk flood zone.`,
  ],
  sections: [
    { h2: "What is it like to live in Willbrook Plantation?", toc: "Life here", id: "life", html: () =>
      h.p(`The lots are roomy, and so are the houses. A typical house has a roof outline of about ${n(Math.round(CO.footprint_sqft.median / 100) * 100)} square feet, garage included. The aerial below shows houses spaced along a lake and a fairway.`) +
      AERIAL +
      G.homesCss() + G.homesQScript() +
      G.homesQ("subdivision=Willbrook+Plantation", "Willbrook Plantation on half-acre lots") +
      h.p(`The course next door is ${h.a(SRC.club, "Willbrook Plantation Golf Club")}, a Dan Maples design, and the club sells ${h.a(SRC.member, "memberships")}. Our ${h.a("/buyers/golf-communities/", "golf communities guide")} compares the area's golf neighborhoods.`) +
      h.p(`Willbrook is gated, and it sits inside Litchfield by the Sea. The association's page lists Willbrook as one of its sub-associations, with a clubhouse and an outdoor pool. Our ${h.a("/buyers/gated-communities/", "gated communities guide")} covers the gate and the beach club.`) +
      h.h3("Where a normal week takes you") +
      h.p(`The entrance is on Willbrook Boulevard at US 17, about ${D.gate} minutes from the middle of the neighborhood, with Litchfield Market Village beside it. Brookgreen Gardens is ${D.brook} minutes away, and the Murrells Inlet MarshWalk is ${D.marsh}.`) +
      DRIVES +
      h.h3("A little history") +
      h.p(`${h.a(SRC.scp, "A compiled history of local plantations")} says the land was one plantation of 2,400 acres in 1941. The Hunter heirs sold it to Litchfield-by-the-Sea in 1984.`) +
      h.p(`The association's page says the Oatland slave cemetery, with 38 graves, remains a sacred and protected site within the community.`) },

    { h2: "What is inside the name Willbrook Plantation?", toc: "Inside the name", id: "parts", html: () =>
      h.p(`The name covers three neighborhoods that differ in lot size, price and flood zone. The county's records call them Willbrook, Tradition Club at Willbrook and Mingo at Willbrook. Willbrook includes the Oak Point and Allston Point sections.`) +
      MAP +
      CMP +
      `<p class="pp-note">Houses and lots: Georgetown County parcels and 2024 building outlines. Flood zone: houses with part of the roof outline in FEMA's high-risk zone. Sales: last deeds recorded in the past 12 months, houses only. Oak Point and Allston Point count with Willbrook.</p>` +
      h.p(`Some listings in the MLS are tagged Tradition but sit in other Tradition neighborhoods nearby. The homes below are limited to a mile and a half around Willbrook.`) +
      G.homesQ("subdivision=Tradition&near=33.4885,-79.1125&miles=1.5", "Houses listed as Tradition, near Willbrook") },

    { h2: "What do homes in Willbrook Plantation sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year at least ${CO.sales_12m.n} houses in Willbrook sold, from $${n(CO.sales_12m.min)} to $${n(CO.sales_12m.max)}. Over three years, ${CO.sales_3y.n} sold at a middle price of about ${r5k(CO.sales_3y.median)}.`) +
      h.p(`Tradition Club houses sold for about ${r5k(TR.sales_12m.median)} in the past year, on lots of about a quarter acre. Mingo sold for about ${r5k(MI.sales_12m.median)}.`) +
      h.p(`On a house at that middle sale price, the county's own calculator puts property tax at about $${n(Math.round(TAX_FULL / 10) * 10)} a year as your ${h.a("/buyers/property-taxes/", "full-time home")}. As a second home or rental it is about $${n(Math.round(TAX_OTHER / 100) * 100)} a year. Both include $96 in storm water and household fees.`) +
      `<p class="pp-note">Sale prices: Georgetown County's last recorded deeds, houses only; a few more show a nominal deed that can hide a sale, so the counts are a floor. Tax: an estimate on a sale price, not a bill.</p>` },

    { h2: "Who runs the Willbrook Plantation HOA, and what does it cost?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p(`Willbrook sits under the Litchfield by the Sea Community Association, which lists it as a sub-association. The county's records name five associations that own the roads, lakes and common areas inside the Willbrook name.`) +
      h.p(`They are the Willbrook Plantation Community Association, the Willbrook Plantation Property Owners Association, Tradition at Willbrook, Mingo, and a road maintenance association.`) +
      h.p(`Every home for sale here shows a monthly fee of $350 or less, and the lowest shows $250 or less. We confirm the fee with the association for the house you pick. See every ${h.a("/homes/?subdivision=Willbrook+Plantation", "Willbrook Plantation home for sale")}, or compare ${h.a("/hoa/fees-by-neighborhood/", "HOA fees across neighborhoods")}.`) +
      `<ul class="pp-rules one" aria-label="The HOA and the neighborhood's rules">`
        + `<li><strong>What the fee covers</strong>No public page says what the fee covers, or whether the beach club comes with a Willbrook house. We ask the association in writing before you offer.</li>`
        + `<li><strong>The recorded rules</strong>Each lot comes with recorded restrictions, the neighborhood's rules. They are read at the Georgetown County Register of Deeds, and we pull them for the lot you like.</li>`
        + `<li><strong>Renting</strong>Whether a house can be rented, and for how long, is decided by those recorded rules. We read them before you offer.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us pull its rules and fees", "We read the recorded rules for that lot, ask the association what the fee covers, and tell you what we find.", "Have us pull the rules and fees", CONTACT, bg) },

    { h2: "Is Willbrook Plantation in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`About one in three Willbrook houses, ${FE.core_house_roofs_touching_high_risk_zone} of ${CO.houses}, has part of its roof outline in FEMA's high-risk flood zone, the zone where a lender requires flood insurance. In Oak Point it is ${FE.oak_point_roofs_touching_zone} of ${FE.oak_point_houses}. No Tradition Club or Mingo house touches it.`) +
      `<ul class="pp-rules one" aria-label="What the flood map shows here">`
        + `<li><strong>House by house</strong>A lender decides by the house, not the lot. A lot can touch the zone while the house stays out of it.</li>`
        + `<li><strong>Flood history</strong>A zone does not show whether a house has flooded. We check each house's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.</li>`
        + `<li><strong>Cost</strong>Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} covers what flood insurance costs, and our ${h.a("/buyers/flood-zone-check/", "flood zone check")} looks up any address.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us check its flood zone and history", "Send us the listing. We check the house against FEMA's map and its flood history, and tell you what we find.", "Have us check a house", CONTACT, bg) },

    { h2: "Is Willbrook Plantation part of the Town of Pawleys Island?", toc: "Town limits", id: "town", html: () =>
      h.p(`No. Every Willbrook address reads Pawleys Island, but the land is in unincorporated Georgetown County. None of the neighborhood's lots touches the limits of the Town of Pawleys Island, Andrews or Georgetown.`) +
      h.p(`The tax bill uses the county's tax district 4, so the yearly figures above use the county's own rates. Our ${h.a("/submarkets/pawleys-island/", "Pawleys Island guide")} covers the town and the mainland around it.`) +
      G.homesQ("near=33.48923,-79.12668&miles=1", "Homes within a mile of Willbrook Plantation") + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/golf-and-yacht-club/", "Myrtle Beach Golf and Yacht Club")}, ${h.a("/submarkets/myrtle-beach/windsor-plantation/", "Windsor Plantation")} near Myrtle Beach and ${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest")} in Myrtle Beach. Then ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach, ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest and ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach. Then ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway and ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach.`) /* end sibling-links */ },
  ],
  faqTitle: "Willbrook Plantation FAQ",
  faq: [
    { q: "Is Willbrook Plantation gated?", a: "Yes. Litchfield by the Sea's page describes Willbrook as a private, gated community, and Willbrook sits inside Litchfield by the Sea." },
    { q: "Can I play the Willbrook Plantation golf course?", a: `Tee times are booked on the club's website, and the club sells memberships. The club is part of Founders Group International, and its clubhouse is about ${D.club} minutes by car from the middle of the neighborhood.` },
    { q: "How far is Willbrook Plantation from the beach?", a: `About ${D.beach} minutes by car. The nearest public beach access is about ${D.beachMiles} miles away, about ${D.walk} minutes on foot.` },
    { q: "Is Willbrook Plantation the same as Litchfield by the Sea?", a: "No. Willbrook is one of the sub-associations inside Litchfield by the Sea, with its own neighborhoods, golf course and rules." },
    { q: "Are there empty lots in Willbrook Plantation?", a: `The county's map shows ${CO.empty_lots} empty lots in the main part of Willbrook. We pull the recorded rules for any lot you like.` },
    { q: "Where is the entrance to Willbrook Plantation?", a: `On Willbrook Boulevard at US 17. Litchfield Market Village is beside it, and the middle of the neighborhood is about ${D.gate} minutes from the entrance by car.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "county tax calculator", href: SRC.tax },
    { name: "Willbrook golf club", href: SRC.club },
    { name: "membership", href: SRC.member },
    { name: "Litchfield by the Sea: Willbrook", href: SRC.lbts },
    { name: "Litchfield by the Sea", href: SRC.lbtsHome },
    { name: "plantation history", href: SRC.scp },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: Georgetown County parcels, 2024 building outlines, last recorded deeds and FEMA's flood map. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in Willbrook Plantation.",
    p: "Pick a house from the strips above, or one we have not shown you. Before the showing we read its lot, its recorded rules and its flood zone.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Willbrook Plantation, Willbrook Plantation homes for sale, Willbrook Plantation Pawleys Island, Willbrook Plantation HOA, Willbrook Plantation golf course, Tradition Club at Willbrook, Litchfield by the Sea, Willbrook Plantation flood zone, Willbrook Plantation real estate",
  about: "Willbrook Plantation, a neighborhood beside the Willbrook golf course inside Litchfield by the Sea in Pawleys Island, South Carolina",
});
