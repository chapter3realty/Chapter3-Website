/* /submarkets/conway/wild-wing-plantation/ - Wild Wing Plantation, Conway SC: what living there is like
 * (one lot in four at the edge of a golf course, a lake the owners' association owns, the City of Conway),
 * which part is which (the big lots, The Sanctuary, the Fairways townhomes), what the houses sold for,
 * the HOA question, the city limits, the flood zone and the beach.
 *
 * Batch 2026-11-e, Lane N (new page), the neighborhood pilot's shape (specs/plantation-point.js).
 * Facts: Blog-Brain batches/2026-11-e/wild-wing-plantation/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's values and wording only (VERIFY.md). Plan: PLAN.md. Demand: must-answer.md.
 * Not used: row 19 (Avocet restoration and reopening: struck), row 18 beyond "listing sites name Avocet as the
 * 18-hole course", four courses, Hummingbird as open, "4 back to a pond or lake", the county value, the listing
 * city-limits keys, the clubhouse drive, the lot median $164,000, any gate claim.
 * Data: data/2026-11-e/wild-wing-plantation/. findings.json, drives.json, listings.json from the scripts there;
 * map-layers.json from map_layers.py. Every count, size, price, share and minute is read from those files
 * here and checked against its ledger row.
 * Pictures: one map we drew from Horry County parcels and the Census road lines. No licensed photo: the shot
 * list for the photo partner is in the batch BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/conway/wild-wing-plantation/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "wild-wing-plantation");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-layers.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const r10k = (v) => "$" + n(Math.round(v / 10000) * 10000);
const mil = (v) => "$" + (Math.round(v / 10000) / 100).toString() + " million";
const must = (ok, msg) => { if (!ok) throw new Error(`wild-wing-plantation.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const M = F.detached, SA = F.sanctuary, FW = F.fairways, SL = F.sales;
/* Row 2 (VERIFIED): 756 parcels, 673 houses, 74 empty lots; The Sanctuary 70 houses; the Fairways 179 townhomes. */
must(M.parcels === 756 && M.houses === 673 && M.vacant_lots === 74 && SA.houses === 70 && FW.houses === 179, "row 2 changed");
/* Row 3 (VERIFIED): the typical lot 16,386 sq ft (0.38 acre); The Sanctuary 9,170. */
must(M.lot_sqft.median === 16386 && SA.lot_sqft.median === 9170, "row 3 changed");
const LOT = n(Math.round(M.lot_sqft.median / 100) * 100), LOT_S = n(Math.round(SA.lot_sqft.median / 100) * 100), LOT_F = n(Math.round(FW.lot_sqft.median / 100) * 100);
must(Math.round(M.lot_sqft.median / 43560 * 100) === 38, "row 3 acres changed");
/* Row 4 (VERIFIED): the typical house covers about 3,400 sq ft of ground; The Sanctuary about 2,900 (roof outline, garage included). */
must(Math.round(M.house_footprint_sqft.median) === 3442 && M.house_footprint_sqft.n === 522 && Math.round(SA.house_footprint_sqft.median) === 2932, "row 4 changed");
const ROOF = n(Math.round(M.house_footprint_sqft.median / 100) * 100), ROOF_S = n(Math.round(SA.house_footprint_sqft.median / 100) * 100);
/* Row 5 (VERIFIED, a floor): 42 pools. Not a wow factor here: 6 in 100. */
must(M.pools === 42 && SA.pools === 1 && FW.pools === 0, "row 5 changed");
/* Row 6 (VERIFIED with wording): 189 of 756 lots touch or sit within 50 feet of a golf parcel; 41 in The Sanctuary. */
must(M.golf_lots === 189 && SA.golf_lots === 41 && FW.golf_lots === 0 && M.parcels === 756, "row 6 changed");
must(Math.round(M.golf_lots / M.parcels * 100) === 25, "row 6 share changed");
/* Row 7 (VERIFIED): 46 lots touch the association's lake-and-wetland parcel, 33 acres. */
must(M.lake_lots === 46, "row 7 changed");
/* Row 14 (CORRECTED): about 40 deeds with a stated price (42 less one lot counted twice), middle about $510,000 (41 sales);
   $340,000 to about $975,000. The Sanctuary: 2 priced deeds, $340,000 and $375,000. */
const HS = SL.houses_detached;
must(HS.count === 42 && HS.prices.median === 505000 && HS.prices.min === 340000 && HS.prices.max === 975000, "row 14 changed");
const MID = 510000;                                                                    // VERIFY item 2: 41 sales without the double count, middle $510,000
must(SL.houses_sanctuary.count === 2 && SL.houses_sanctuary.prices.min === 340000 && SL.houses_sanctuary.prices.max === 375000, "row 14 Sanctuary changed");
/* Row 14, lots (CORRECTED): about a dozen true lots sold, middle about $160,000. */
const LOT_MID = 160000;
/* Row 15 (VERIFIED): 22 Fairways deeds, middle $214,450, $170,000 to $241,000. */
const HF = SL.houses_fairways;
must(HF.count === 22 && HF.prices.median === 214450 && HF.prices.min === 170000 && HF.prices.max === 241000, "row 15 changed");
/* Row 12 (VERIFIED with wording): tax on a house at the middle price. Owner-occupied: 163.4 mills x 4%; other: 272.5 mills x 6%. */
const TAX_PRIMARY = MID * 0.04 * 163.4 / 1000, TAX_OTHER = MID * 0.06 * 272.5 / 1000;
must(Math.round(TAX_PRIMARY / 100) * 100 === 3300 && Math.round(TAX_OTHER / 100) * 100 === 8300, "row 12 changed");
/* Row 25 (VERIFIED): 578 of 673 houses taxed as the owner's legal residence (86 in 100). */
must(M.assessed_at_4pct_legal_residence === 578 && Math.round(578 / 673 * 100) === 86, "row 25 changed");
const PRIMARY = 86;
/* Row 17 (VERIFIED with wording): 25 for sale, $297,500 to $1,750,000; 3 in The Sanctuary. Row 9 (CORRECTED): listing-sheet fees. */
must(L.all.for_sale === 25 && L.all.list_price.min === 297500 && L.all.list_price.max === 1750000 && L.sanctuary.for_sale === 3, "row 17 changed");
const FEES = L.all.hoa_monthly_listed;
must(FEES.filter((f) => f === 135).length === 19 && FEES.filter((f) => f === 115).length === 2 && FEES.filter((f) => f === 130).length === 1 && L.sanctuary.hoa_monthly_listed.join() === "66,66,74", "row 9 changed");
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Row 21 (CORRECTED): drives, no traffic. Conway Medical Center is 8.7 minutes, 2.3 miles (VERIFY item 3); the clubhouse point is not used. */
const WD = DR.drives["Wild Wing Plantation (middle of the detached houses)"];
const mm = (k) => { const v = WD[k]; return v.minutes; };
must(WD["Myrtle Beach International Airport terminal"].minutes === 23.1 && WD["nearest public beach access"].minutes === 22.3 && WD["Broadway at the Beach"].minutes === 21.5 && WD["Coastal Grand Mall"].minutes === 20.3, "row 21 changed");
must(WD["Downtown Conway (Main Street at 4th Avenue)"].minutes === 14.9, "row 21 downtown changed");
const D = {
  beach: Math.round(mm("nearest public beach access")), beachMiles: Math.round(WD["nearest public beach access"].miles * 10) / 10,
  airport: Math.round(mm("Myrtle Beach International Airport terminal")), broadway: Math.round(mm("Broadway at the Beach")),
  mall: Math.round(mm("Coastal Grand Mall")), town: Math.round(mm("Downtown Conway (Main Street at 4th Avenue)")), hosp: 9,
};
must(D.beach === 22 && D.beachMiles === 11.6 && D.airport === 23 && D.broadway === 22 && D.mall === 20 && D.town === 15, "rows 21 rounding changed");
/* The map: the same counts as the rows. */
must(ML.counts.golf === 189 && ML.counts.lake === 46 && ML.counts.sanctuary === 71 && ML.counts.fairways === 184, "map layers do not match rows 6, 7 and 2");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const C = { land: "#eef0e4", course: "#d3e6c4", courseEdge: "#b3d19c", lake: "#a9cfe3", lakeEdge: "#7fb3cf", lot: "#ffffff", lotEdge: "#b9b2a5",
  gLot: "#5f8a4e", wLot: "#2f6f8f", sLot: "#e2b07f", fLot: "#c9bfd9", road: "#ffffff", roadEdge: "#9c9486" };
const INK = "#8a5226";

const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:${INK}!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .pp-fig{margin:1.4rem 0 1.6rem;max-width:720px}
main#main .pp-fig.tall{max-width:560px}
main#main .pp-fig figcaption{color:var(--muted);font-size:.92rem;line-height:1.55;margin-top:.6rem}
main#main .pp-frame{border-radius:14px;overflow:hidden;background:${C.land};border:1px solid rgba(28,32,40,.12)}
main#main .pp-frame svg{display:block;width:100%;height:auto}
main#main svg.pp-map text{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#1c2028;paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-linejoin:round;font-size:34px;stroke-width:8px}
main#main svg.pp-map text.it{font-style:italic;font-weight:600;fill:#1f4f68}
main#main svg.pp-map text.gc{fill:#2f5326}
main#main svg.pp-map text.sm{font-weight:600;font-size:30px}
@media (max-width:379px){main#main svg.pp-map text.sm{font-size:34px}}
@media (min-width:700px){main#main svg.pp-map text{font-size:27px;stroke-width:7px}main#main svg.pp-map text.sm{font-size:24px}}
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
main#main .hx-strip:not(:empty){margin-top:1.2rem}
/* The aerial in the hero: a wide crop of the same picture, so the first screen shows the course and lakes. */
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;object-position:50% 45%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:3/1}main#main .ww-hero figcaption{display:none}main#main .detail-hero .ww-hero{margin-bottom:.9rem!important}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:3/1}main#main .detail-hero .detail-media{max-width:1100px!important}}
/* The end band (as /submarkets/myrtle-beach/market-common/). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The map: every lot, colored by what it touches (rows 6 and 7), from map-layers.json.            */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const [W0, S0, E0, N0] = ML.frame, MW = 1000, MH = Math.round(MW * (my(N0) - my(S0)) / (mx(E0) - mx(W0)));
const P = (lo, la) => [(mx(lo) - mx(W0)) / (mx(E0) - mx(W0)) * MW, (my(N0) - my(la)) / (my(N0) - my(S0)) * MH];
const f1 = (v) => Math.round(v * 10) / 10;
const ringD = (r) => "M" + r.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L") + "Z";
const lineD = (pts) => "M" + pts.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L");
const cen = (rs) => { const pts = rs.flat(); return P(pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length); };


const MAP = (() => {
  const by = (f) => ML.lots.filter(f).map((l) => ringD(l.r)).join("");
  const fills = [
    ["common", (l) => !l.house && !l.golf && !l.lake && l.k !== "fairways", "none", "#c9cdbb"],
    ["plain", (l) => l.house && l.k === "plain" && !l.golf && !l.lake, C.lot, C.lotEdge],
    ["fairways", (l) => l.k === "fairways", C.fLot, "#fff"],
    ["sanctuary", (l) => l.k === "sanctuary", C.sLot, "#fff"],
    ["lake", (l) => l.k === "plain" && l.lake && !l.golf, C.wLot, "#fff"],
    ["golf", (l) => l.k === "plain" && l.golf, C.gLot, "#fff"],
  ];
  const lots = fills.map(([, f, fill, edge]) => `<path d="${by(f)}" fill="${fill}" stroke="${edge}" stroke-width="1.2" stroke-linejoin="round"/>`).join("");
  const sGolf = ML.lots.filter((l) => l.k === "sanctuary" && l.golf).map((l) => ringD(l.r)).join("");
  const course = ML.golf.map(ringD).join(""), lake = ML.lake.map(ringD).join("");
  const roads = ML.roads.map((r) => lineD(r.p)).join("");
  const lab = (t, x, y, o = {}) => `<text${o.cls ? ` class="${o.cls}"` : ""} x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x)} ${f1(y)})"` : ""}>${t}</text>`;
  const sc = cen(ML.lots.filter((l) => l.k === "sanctuary").map((l) => l.r)), fc = cen(ML.lots.filter((l) => l.k === "fairways").map((l) => l.r));
  const lc = cen(ML.lake), gc = cen(ML.golf);
  /* US 501: the middle of the longest piece inside the frame, with its angle. */
  const rp = ML.roads.filter((r) => r.r === "US 501").map((r) => r.p).sort((a, b) => b.length - a.length)[0];
  must(rp && rp.length >= 2, "US 501 is not in the frame");
  const ra = P(...rp[0]), rb = P(...rp[rp.length - 1]);
  const rd = [(ra[0] + rb[0]) / 2 + 30, (ra[1] + rb[1]) / 2 - 22, ((Math.round(Math.atan2(rb[1] - ra[1], rb[0] - ra[0]) * 180 / Math.PI) + 270) % 180) - 90];
  const svg = `<svg class="pp-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" role="img" aria-labelledby="pp-map-t">`
    + `<title id="pp-map-t">Map of Wild Wing Plantation in Conway. The lots on or next to the golf course are green, the lots next to the owners' association's lake and wetland are blue, The Sanctuary's lots are tan, and the Fairways townhomes are lilac.</title>`
    + `<rect width="${MW}" height="${MH}" fill="${C.land}"/>`
    + `<path d="${course}" fill="${C.course}" stroke="${C.courseEdge}" stroke-width="1.5"/>`
    + `<path d="${lake}" fill="${C.lake}" stroke="${C.lakeEdge}" stroke-width="1.5"/>`
    + `<path d="${roads}" fill="none" stroke="${C.roadEdge}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="${roads}" fill="none" stroke="${C.road}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
    + lots
    + `<path d="${sGolf}" fill="none" stroke="${C.gLot}" stroke-width="3" stroke-linejoin="round"/>`
    + lab("The Sanctuary", sc[0], sc[1], { cls: "sm" })
    + lab("Fairways", fc[0], fc[1], { cls: "sm" })
    + lab("Golf course", 850, 165, { cls: "gc" })
    + lab("Lake and wetland", lc[0] - 10, lc[1] - 125, { cls: "it" })
    + lab("US 501", rd[0], rd[1], { cls: "sm", rot: rd[2] })
    + `</svg>`;
  const key = `<ul class="pp-legend">`
    + `<li><i style="background:${C.gLot}"></i>On or next to the golf course</li>`
    + `<li><i style="background:${C.wLot}"></i>Next to the lake and wetland: ${M.lake_lots} lots</li>`
    + `<li><i style="background:${C.sLot};border:3px solid ${C.gLot}"></i>The Sanctuary, with ${SA.golf_lots} lots on the course</li>`
    + `<li><i style="background:${C.fLot}"></i>Fairways townhomes: ${n(FW.houses)}</li>`
    + `<li><i style="background:${C.lot}"></i>Other lots</li></ul>`;
  return `<figure class="pp-fig tall"><div class="pp-frame">${svg}</div>${key}<figcaption>Every lot in Wild Wing Plantation and the Fairways. A lot counts as on the course when it is within 50 feet of a golf-course parcel. Lots: Horry County parcels. Roads: U.S. Census Bureau TIGER/Line. Map: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain): fairways, greens and lakes between the streets (rows 6, 7). */

const AIR = PHOTOS.find((r) => r.file.includes("wild-wing-plantation-golf-and-lakes-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
/* Review 1: the picture leads the page, in the hero under the H1, as the pilots lead with theirs. */
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: "Houses along the fairways, with greens and lakes between the streets.", maxWidth: "1100px", sizes: "(max-width: 1200px) 100vw, 1100px" })
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero ww-hero" style="margin:0 0 1.2rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Part of Wild Wing Plantation from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The three parts side by side (rows 2 to 6, 14, 15). Short row labels and no-break units, so
   all columns fit a 320 px phone without a scroll box.                              */

const NB = "&nbsp;";
const CMP = `<div class="pp-cmp">` + h.table(["", "Wild Wing", "Sanctuary", "Fairways"], [
  ["Houses", n(M.houses), n(SA.houses), n(FW.houses)],
  ["Lot", `${LOT}${NB}sq${NB}ft`, `${LOT_S}${NB}sq${NB}ft`, `${LOT_F}${NB}sq${NB}ft`],
  ["Under roof", `${ROOF}${NB}sq${NB}ft`, `${ROOF_S}${NB}sq${NB}ft`, "Not mapped"],
  ["Golf lots", n(M.golf_lots), n(SA.golf_lots), "None"],
  ["Sold, past year", "About 40", String(SL.houses_sanctuary.count), String(HF.count)],
  ["Middle price", `About ${r10k(MID)}`, "Too few", `About ${r5k(HF.prices.median)}`],
]) + `</div>`;

/* ---------------------------------------------------------------------------- */
/* The drives (row 21): one chart, minutes by car with no traffic.                  */

const DRIVES = G.bars([
  { name: "Conway Medical Center", value: D.hosp },
  { name: "Downtown Conway", value: D.town },
  { name: "Coastal Grand Mall", value: D.mall },
  { name: "Broadway at the Beach", value: D.broadway },
  { name: "The beach", value: D.beach },
  { name: "Myrtle Beach International Airport", value: D.airport },
].map((r) => Object.assign(r, { valueText: `${r.value} min` })), {
  caption: "Minutes by car from the middle of Wild Wing Plantation",
  nameLabel: "Place", valueLabel: "By car, about", compact: true,
  note: `With no traffic. The beach is the nearest public beach access, about ${D.beachMiles} miles away. Routes on OpenStreetMap roads.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  trash: "https://www.conwaysc.gov/departments/sanitation.php",
  beach: "https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0",
  osm: "https://www.openstreetmap.org/",
};

const CONTACT = `/contact/?place=${encodeURIComponent("Wild Wing Plantation")}`;
const HOMES_KISK = `/homes/?subdivision=${encodeURIComponent("Kiskadee Parke At Wild Wing")}`;

/* The place, for search engines: a Place with its point and the town it is in. */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Wild Wing Plantation", alternateName: "Wild Wing Plantation, Conway",
  description: `A neighborhood of ${n(M.parcels)} lots in the City of Conway, South Carolina, with a golf course along its edge, a lake and wetland owned by its property owners' association, and The Sanctuary at Wild Wing Plantation inside it.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center[0], longitude: F.center[1] },
  address: { "@type": "PostalAddress", addressLocality: "Conway", addressRegion: "SC", postalCode: "29526", addressCountry: "US" },
  containedInPlace: { "@type": "City", name: "Conway, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Conway", url: "/submarkets/conway/" },
  title: "Wild Wing Plantation Conway SC: One Lot in Four by Golf",
  description: "Wild Wing Plantation in Conway, SC: 756 lots, 189 by the golf course. What houses sold for, the HOA fee, the flood zone, The Sanctuary and the Fairways.",
  ogTitle: "Wild Wing Plantation, Conway SC: one lot in four sits at the edge of a golf course",
  crumb: "Wild Wing Plantation",
  eyebrow: "Wild Wing Plantation, Conway",
  h1: "Wild Wing Plantation homes in Conway:",
  h1em: "one lot in four sits at the edge of a golf course.",
  sub: "Listing sites name Avocet as the 18-hole golf course at Wild Wing Plantation, and a company owns its land.",
  heroMedia: CSS + AERIAL + glance([
    { icon: "home", label: "Houses", text: n(M.houses) },
    { icon: "golf", label: "By the golf course", text: `${M.golf_lots} lots` },
    { icon: "pond", label: "On the lake", text: `${M.lake_lots} lots` },
    { icon: "beach", label: "Beach by car", text: `${D.beach} min` },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Wild Wing Plantation is a golf neighborhood of ${n(M.parcels)} lots inside the City of Conway. In the past year its houses sold for about ${r10k(MID)}, from about ${r5k(HS.prices.min)} to about ${r5k(HS.prices.max)}.`,
    `Listing sheets show an association fee of $${n(135)} a month for most homes for sale. No part of the neighborhood is in FEMA's high-risk flood zone. Next door, the Fairways townhomes sold for about ${r5k(HF.prices.median)}.`,
  ],
  sections: [
    { h2: "What is it like to live in Wild Wing Plantation?", toc: "Life here", id: "life", html: () =>
      h.p(`Of the ${n(M.parcels)} lots, ${M.golf_lots} touch a golf-course parcel or sit within 50 feet of one. Buying on the course does not make you an owner of it. Our ${h.a("/buyers/golf-communities/", "golf communities guide")} compares the area's golf neighborhoods.`) +
      G.homesCss() + G.homesQScript() +
      G.homesQ("subdivision=Wild Wing Plantation&has=on_golf_course", "Wild Wing houses on the golf course") +
      h.p(`Lakes sit between the street loops. The owners' association owns a ${Math.round(33.09)}-acre lake and wetland, and ${M.lake_lots} lots touch it. See the ${h.a("/homes/?subdivision=Wild+Wing+Plantation&amp;waterfront=1", "Wild Wing homes tagged waterfront")}.`) +
      h.p(`A typical lot is about a third of an acre, ${LOT} square feet. The typical house is about ${ROOF} square feet under roof, garage included. Streets are named for birds: Wood Stork Drive, Whooping Crane Drive, Wigeon Drive and Spoonbill Drive.`) +
      h.p(`Most of these are full-time homes: the county taxes ${PRIMARY} in 100 houses here as their owner's primary residence.`) },

    { h2: "Which part of Wild Wing Plantation is which?", toc: "The parts", id: "parts", html: () =>
      h.p(`The listings use three names here. Wild Wing Plantation is the main neighborhood. The Sanctuary at Wild Wing Plantation is a part of it with smaller lots. The Fairways at Wild Wing is a separate group of townhomes next door, and our counts for Wild Wing leave it out.`) +
      MAP +
      CMP +
      `<p class="pp-note">Sizes, prices and counts are the typical one for each part, rounded. Houses, lots and roofs: Horry County parcels and building outlines. Sales: deeds with a price, recorded in the past 12 months. The Sanctuary is part of the Wild Wing column.</p>` +
      h.p(`The Sanctuary has ${SA.houses} houses on lots of about ${LOT_S} square feet, and ${SA.golf_lots} of them are on the course. Only two sales with a price on the deed came through in the past year. Treat its prices as a sample of two. See ${h.a("/homes/?subdivision=The+Sanctuary+at+Wild+Wing+Plantation", "The Sanctuary's homes for sale")}.`) +
      h.p(`The Fairways are ${FW.houses} townhomes on lots of about ${LOT_F} square feet, and ${HF.count} sold in the past year, from about ${r5k(HF.prices.min)} to about ${r5k(HF.prices.max)}. See the ${h.a("/homes/?subdivision=Fairways+at+Wild+Wing", "Fairways townhomes for sale")}.`) +
      h.p(`Searching "Wild Wing" also finds ${h.a(HOMES_KISK, "Kiskadee Parke At Wild Wing")}, which the listings keep apart from both. Its homes are not in our counts.`) },

    { h2: "What do homes in Wild Wing Plantation sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year, about 40 houses here sold with a price on the deed. The middle price was about ${r10k(MID)}. They ranged from about ${r5k(HS.prices.min)} to about ${r5k(HS.prices.max)}. We read the county's deed index to get them.`) +
      h.p(`On ${COUNT_DAY}, ${L.all.for_sale} homes were for sale here, asking about ${r5k(L.all.list_price.min)} to ${mil(L.all.list_price.max)}.`) +
      `<p class="pp-note">Sale prices: Horry County deeds recorded in the past 12 months, houses only. Deeds with no price stated are not counted. Asking prices: CCMLS listings, counted in aggregate.</p>` +
      G.homesQ("subdivision=Wild Wing Plantation&max=550000", "Wild Wing homes under $550,000") +
      h.p(`Besides the mortgage and ${h.a("/buyers/coastal-insurance/", "insurance")}, tax on a house bought at about ${r10k(MID)} is about $${n(Math.round(TAX_PRIMARY / 100) * 100)} a year as your ${h.a("/buyers/property-taxes/", "primary residence")}. As a second home or rental it is about $${n(Math.round(TAX_OTHER / 100) * 100)} a year. Both assume the county values the house at the price you pay, and the lower rate needs a legal-residence application.`) +
      h.p(`If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) +
      G.homesQ("near=33.7955,-78.9789&miles=1", "Homes for sale within a mile of Wild Wing Plantation") },

    { h2: "Is there an HOA at Wild Wing Plantation?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p(`Yes. Wild Wing Plantation has a property owners' association, the POA. The listing sheets for most homes for sale here show a fee of $${n(135)} a month. The Sanctuary's sheets show $${n(66)} and $${n(74)}.`) +
      `<ul class="pp-rules one" aria-label="The HOA and the neighborhood's rules">`
        + `<li><strong>The fee shown for a home for sale</strong>The listing agent enters it, so it is not the association's budget. We have not found what it covers. We confirm both with the association before you offer.</li>`
        + `<li><strong>Renting</strong>Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers renting by the night. For a longer lease, we read the association's papers first.</li>`
        + `<li><strong>The golf</strong>We ask the club what play and membership cost before you offer.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us pull the POA papers", "We read the association's papers for that house. We tell you the fee, what it covers and what the rules allow.", "Have us pull the POA papers", CONTACT, bg) },

    { h2: "Is Wild Wing Plantation in the City of Conway?", toc: "City limits", id: "city", html: () =>
      h.p(`Yes. The county's map puts every lot inside the City of Conway, and the mail says Conway, SC 29526. Two things follow for an owner:`) +
      `<ul class="pp-rules one" aria-label="What being inside the city changes">`
        + `<li><strong>Property tax</strong>The bill includes the City of Conway's tax. The yearly figures above already count it.</li>`
        + `<li><strong>Trash</strong>The city collects garbage, recycling and yard waste at the curb once a week.</li>`
        + `</ul>` +
      h.p(`Our ${h.a("/submarkets/conway/", "Conway guide")} covers the town itself.`) },

    { h2: "Is Wild Wing Plantation in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`No part of the neighborhood is in FEMA's high-risk zone, the zone where a lender requires flood insurance. One FEMA map area covers it, and FEMA calls it an "area of minimal flood hazard".`) +
      `<ul class="pp-rules one" aria-label="What the flood map shows here">`
        + `<li><strong>What a zone does not show</strong>A zone does not show whether a house has flooded. We check each house's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.</li>`
        + `<li><strong>Insurance</strong>Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} covers insurance for homes near the coast.</li>`
        + `</ul>` },

    { h2: "How far is Wild Wing Plantation from the beach?", toc: "The beach", id: "beach", html: () =>
      h.p(`About ${D.beach} minutes by car, ${D.beachMiles} miles to the nearest public beach access, with no traffic. The Myrtle Beach airport is about ${D.airport} minutes away, and Broadway at the Beach about ${D.broadway}.`) +
      DRIVES +
      h.p(`None of the 12 public beach accesses closest to Wild Wing has parking, says the state's beach access list. The nearest one with parking is about 23 minutes away.`) + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest, ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach. Then ${h.a("/submarkets/conway/shaftesbury-glen/", "Shaftesbury Glen")} near Conway, ${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach. Then ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/windsor-plantation/", "Windsor Plantation")} near Myrtle Beach. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "Wild Wing Plantation FAQ",
  faq: [
    { q: "Which golf course is at Wild Wing Plantation?", a: `Listing sites name Avocet as the 18-hole course. A company owns the golf-course land, not the homeowners. Call the club for what play and membership cost.` },
    { q: "Is Kiskadee Parke part of Wild Wing Plantation?", a: `Not in the listings. Kiskadee Parke At Wild Wing is its own name there, and our counts leave it out. Its homes are on our search.` },
    { q: "Is Wild Wing Plantation in Conway or Myrtle Beach?", a: `Conway. The neighborhood is inside the City of Conway limits, and the mailing address is Conway, SC 29526.` },
    { q: "Are there empty lots for sale in Wild Wing Plantation?", a: `The county map shows ${M.vacant_lots} empty lots, and about a dozen sold in the past year. Ask us which are for sale now.` },
    { q: "Can I rent out a house in Wild Wing Plantation?", a: `Renting can depend on the City of Conway and the association's rules, so we check both for the house you pick.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "tax levy", href: SRC.levy },
    { name: "Conway trash pickup", href: SRC.trash },
    { name: "beach access list", href: SRC.beach },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, building outlines, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in Wild Wing Plantation.",
    p: "Tell us golf course, lake or townhome, and your budget. We line up the houses that fit, each with its lot, its flood zone and its yearly tax.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Wild Wing Plantation, Wild Wing Plantation Conway SC, Wild Wing Plantation homes for sale, Wild Wing Plantation HOA, Wild Wing Plantation golf, The Sanctuary at Wild Wing Plantation, Fairways at Wild Wing, Wild Wing Plantation flood zone",
  about: "Wild Wing Plantation, a golf neighborhood in the City of Conway, South Carolina, with The Sanctuary at Wild Wing Plantation inside it and the Fairways at Wild Wing townhomes next door",
});
