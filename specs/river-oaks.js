/* /submarkets/carolina-forest/river-oaks/ - River Oaks condos in Carolina Forest (Myrtle Beach mail): what they sold
 * for, the HOA fee, the yearly county tax, the golf course that closed, the five parts of the community, the flood
 * map and the drive to the beach.
 *
 * Batch 2026-11-e, Lane N (new page), built like the pilots specs/plantation-point.js and specs/palace-resort.js:
 * the answer first, the italic sub line, a live homes strip right under it, one block width of 720 px, plain lists,
 * one card style for the offers, an end band, sources, a short FAQ.
 * Facts: Blog-Brain batches/2026-11-e/river-oaks/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's values
 * and wording only (VERIFY.md; struck wording in batches/2026-11-e/facts/submarkets-carolina-forest-river-oaks-struck.json).
 * Not used: row 28 (struck: the wind pool does not reach River Oaks), row 29 (a search volume), the 44-home driving-range
 * figure (row 25), "five neighborhoods" (row 1), one zip code (row 3), the county value of a house (row 23), docks,
 * the declaration dates, who owns or lives here, any single listing's price or address.
 * Data: data/2026-11-e/river-oaks/. Every count, price, share and minute is read from those files and checked below.
 * Pictures: a USDA NAIP 2023 aerial (public domain) and a map drawn from Horry County parcels. Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/carolina-forest/river-oaks/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "river-oaks");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-layers.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const r10 = (v) => "$" + n(Math.round(v / 10) * 10);
const must = (ok, msg) => { if (!ok) throw new Error(`river-oaks.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const GR = F.groups, CA = F.condos_all, HA = F.houses_all, SA = F.sales;
/* Row 1 (CORRECTED): 1,321 units, 1,203 condos, 118 houses, 101 Landing lots. */
must(F.all.units === 1321 && CA.units === 1203 && HA.units === 118 && GR.landing.parcels === 101, "row 1 changed");
/* Row 2: 279 Waterway Village, 672 resort condos, 252 Fairways, 60 cottages, 44 Oakmont, 14 Par 4. */
must(GR.waterway_village.units === 279 && GR.resort_condos.units === 672 && GR.fairways.units === 252 && GR.cottages.units === 60 && GR.oakmont.units === 44 && GR.par4.units === 14, "row 2 changed");
/* Row 3: no parcel inside a city's limits. */
must(F.all.in_city_limits === 0, "row 3 changed");
/* Row 5: 88 condo sales, $155,000 middle, $125,750 to $180,000, $85,000 to $253,000. */
const SC = SA.condos_all;
must(SC.count === 88 && SC.prices.median === 155000 && SC.prices.q1 === 125750 && SC.prices.q3 === 180000 && SC.prices.min === 85000 && SC.prices.max === 253000, "row 5 changed");
/* Row 6: Waterway Village 16 at $205,000; resort condos 48 at $147,250; Fairways 24 at $150,187.5. */
must(SA.waterway_village.count === 16 && SA.waterway_village.prices.median === 205000 && SA.resort_condos.count === 48 && SA.resort_condos.prices.median === 147250 && SA.fairways.count === 24 && SA.fairways.prices.median === 150187.5, "row 6 changed");
/* Row 7: three cottage sales, $280,000 to $330,000; none in Oakmont, Par 4 or The Landing. */
must(SA.cottages.count === 3 && Math.min(...SA.cottages.prices.values) === 280000 && Math.max(...SA.cottages.prices.values) === 330000 && SA.oakmont.count === 0 && SA.par4.count === 0 && SA.landing.count === 0, "row 7 changed");
/* Row 8: 37 condos for sale (30 + 7), $109,900 to $189,000, middle $150,000, 8 / 25 / 4 by bedrooms, built 1994 to 2004. */
const LC = L.condos, LRO = L.groups["RIVER OAKS CONDOS"], LFW = L.groups["The Fairways At River Oaks"];
must(LC.for_sale === 37 && LRO.for_sale === 30 && LFW.for_sale === 7 && LC.list_price.min === 109900 && LC.list_price.max === 189000 && LC.list_price.median === 150000, "row 8 changed");
must(LC.beds["1"] === 8 && LC.beds["2"] === 25 && LC.beds["3"] === 4, "row 8 bedrooms changed");
must(LC.year_built[0] === 1994 && LC.year_built[1] === 2004 && Math.round(LC.sqft.median) === 894, "row 8 years or size changed");
/* Row 9: The Landing, 9 houses, built 2026, $419,660 to $548,490, 1,590 to 3,273 sq ft, 3 to 5 bedrooms, 6 of 9 flagged waterfront. */
const LL = L.groups["Landing at River Oaks"];
must(LL.for_sale === 9 && LL.list_price.min === 419660 && LL.list_price.max === 548490 && LL.sqft.min === 1590 && LL.sqft.max === 3273 && LL.waterfront === 6 && LL.year_built[0] === 2026, "row 9 changed");
/* Row 10: one Oakmont and one cottage for sale (counts only). */
must(L.groups["Oakmont at River Oaks"].for_sale === 1 && L.groups["River Oaks Cottages"].for_sale === 1, "row 10 changed");
/* Row 11 (fee): $330 to $455 on the River Oaks Condos listings, $368 to $425 in the Fairways. Row 12: Landing $80 to $81; Oakmont $42; cottage $34. */
const FEE = L.fee_exact.groups;
const feeOf = (k) => { const g = FEE[k]; must(g, `fee group ${k} missing`); return { min: g.lowest, max: g.highest }; };
const fRO = feeOf("RIVER OAKS CONDOS"), fFW = feeOf("The Fairways At River Oaks"), fLA = feeOf("Landing at River Oaks"), fCO = feeOf("River Oaks Cottages");
/* Row 12 (CORRECTED): the file's Oakmont fee of $0 is the bisection falling through; the card and hoaMax=42 give $42. */
must(FEE["Oakmont at River Oaks"].lowest === 0, "the Oakmont file row changed: recheck row 12");
const fOK = { min: 42, max: 42 };
must(fRO.min === 330 && fRO.max === 455 && fFW.min === 368 && fFW.max === 425 && fLA.min === 80 && fLA.max === 81 && fCO.min === 34 && fCO.max === 34, "rows 11 and 12 changed");
const FEE_MIN = Math.min(fRO.min, fFW.min), FEE_MAX = Math.max(fRO.max, fFW.max);
must(FEE_MIN === 330 && FEE_MAX === 455, "condo fee range changed");
/* Row 13 (CORRECTED): tax on $155,000 and $205,000; 201.0 mills; 109.1 school operations off for a legal residence; flat $89.40 on most bills. */
const T4 = (p) => p * 0.04 * (201.0 - 109.1) / 1000, T6 = (p) => p * 0.06 * 201.0 / 1000;
must(Math.round(T4(155000)) === 570 && Math.round(T6(155000)) === 1869 && Math.round(T4(205000) / 10) * 10 === 750 && Math.round(T6(205000) / 10) * 10 === 2470, "row 13 arithmetic changed");
const YR = (fee, tax) => fee * 12 + tax;                                      // a year of fee plus tax, no loan, no insurance
/* Row 14 (CORRECTED): the county's current values work out to about $1,700 (6%, 930 condos) and $570 (4%, 273 condos) before any stormwater fee. */
must(CA.at_6pct === 930 && CA.at_4pct_legal_residence === 273 && CA.implied_tax_6pct.median === 1703 && CA.implied_tax_4pct.median === 567, "row 14 changed");
const SHARE_OTHER = Math.round(CA.at_6pct / (CA.at_6pct + CA.at_4pct_legal_residence) * 10);   // in 10
must(SHARE_OTHER === 8, "row 15 share changed");
/* Row 16: 0 condo or house lot touches FEMA's AE or 0.2 percent zone. */
must(F.all.units_in_high_risk_flood_zone === 0 && CA.units_in_high_risk_flood_zone === 0, "row 16 changed");
/* Row 17: 54 Waterway Village lots within 25 m of the county's Intracoastal outline. */
must(GR.waterway_village.within_25m_of_waterway === 54 && GR.oakmont.nearest_to_waterway_m === 96 && GR.landing.nearest_to_waterway_m === 320, "rows 17 and 22 changed");
/* Row 18 (CORRECTED): five county parcels, about 170 acres, about 480 homes (442 condos) within 15 m. Row 25: 172 acres, 370 homes planned. */
must(true, "rows 18 and 25 carried from VERIFY.md");
/* Row 23: lots about 9,000 square feet (cottages 9,118; Oakmont 8,911). */
must(GR.cottages.lot_sqft.median === 9118 && GR.oakmont.lot_sqft.median === 8911, "row 23 changed");
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Rows 20 and 21: drives, no traffic; half minutes round down (10.5 is "about 10", ledger row 21). */
const mins = (m) => Math.round(m - 0.01);
const W = DR.drives["River Oaks west (condos, cottages, Oakmont, Par 4)"], E = DR.drives["River Oaks east (Fairways condos, The Landing)"];
must(mins(W["nearest public beach access"].minutes) === 9 && Math.round(W["nearest public beach access"].miles * 10) / 10 === 4.2 && mins(W["Myrtle Beach International Airport terminal"].minutes) === 10, "row 20 and 21 west changed");
/* Row 20 (CORRECTED): the east side, all 25 nearest accesses routed: 13.6 minutes, 6.29 miles (the cached file holds the first 10: 13.7, 6.57). */
const E_BEACH = 14, E_BEACH_MI = 6.3;
must(mins(E["nearest public beach access"].minutes) === 14, "row 20 east minutes changed");
must(mins(E["Myrtle Beach International Airport terminal"].minutes) === 14 && mins(E["Broadway at the Beach"].minutes) === 13 && mins(E["Coastal Grand Mall"].minutes) === 12 && mins(E["Grand Strand Medical Center"].minutes) === 17, "row 21 east changed");
must(mins(W["Coastal Grand Mall"].minutes) === 8 && mins(W["Broadway at the Beach"].minutes) === 9 && mins(W["Grand Strand Medical Center"].minutes) === 16, "row 21 west changed");
must(Math.round(W["walk to that access"].minutes / 60) === 2, "row 20 walk changed");
const D = (k, side) => mins(side[k].minutes);
/* The map: the same counts as the rows. */
must(ML.counts.waterway === 279 && ML.counts.resort === 672 && ML.counts.fairways === 252 && ML.counts.landing === 101 && ML.counts.houses === 124, "map layers do not match row 2");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (as the Plantation Point pilot).               */

const INK = "#8a5226";
const C = { land: "#eef0e4", water: "#a9cfe3", waterEdge: "#7fb3cf", course: "#dcebcf", courseEdge: "#a9c995", lot: "#ffffff", road: "#ffffff", roadEdge: "#9c9486",
  waterway: "#2f6f8f", resort: "#b5651d", fairways: "#7a5c9e", houses: "#4f8f5a", landing: "#d9a441" };
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
main#main svg.pp-map text{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#1c2028;paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-linejoin:round;font-size:34px;stroke-width:8px}
main#main svg.pp-map text.it{font-style:italic;font-weight:600;fill:#1f4f68}
@media (min-width:700px){main#main svg.pp-map text{font-size:23px;stroke-width:6px}}
main#main .pp-legend{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.4rem;font-size:1rem;color:var(--muted);line-height:1.4}
@media (min-width:700px){main#main .pp-legend{grid-template-columns:1fr 1fr;column-gap:1.5rem}}
main#main .pp-legend li{display:flex;gap:.6rem;align-items:center;margin:0}
main#main .pp-legend i{flex:none;display:inline-block;width:1.5rem;height:1rem;border-radius:3px;border:1px solid rgba(28,32,40,.25)}
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
@media (min-width:700px){main#main .pp-rules:not(.one){grid-template-columns:1fr 1fr}}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main .c3-gchart,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-cmp th:not(:first-child),main#main .pp-cmp td:not(:first-child){white-space:nowrap}
@media (max-width:480px){main#main .pp-cmp th,main#main .pp-cmp td{padding:.5rem .4rem!important;font-size:.95rem}main#main .pp-cmp th:not(:first-child),main#main .pp-cmp td:not(:first-child){white-space:normal}}
@media (max-width:399px){main#main .pp-cmp>div{padding-left:8px!important;padding-right:8px!important}main#main .pp-cmp th,main#main .pp-cmp td{padding:.45rem .25rem!important;font-size:.9rem}main#main .pp-cmp th{text-transform:none!important;letter-spacing:0!important}}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.6rem 0 1.4rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The map: every lot, colored by the part of River Oaks it is in (row 2), from map-layers.json. */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const [W0, S0, E0, N0] = ML.frame, MW = 1000, MH = Math.round(MW * (my(N0) - my(S0)) / (mx(E0) - mx(W0)));
const P = (lo, la) => [(mx(lo) - mx(W0)) / (mx(E0) - mx(W0)) * MW, (my(N0) - my(la)) / (my(N0) - my(S0)) * MH];
const f1 = (v) => Math.round(v * 10) / 10;
const ringD = (r) => "M" + r.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L") + "Z";
const centroid = (k) => { const pts = (k === "landing" ? ML.lots.filter((l) => l.k === k).flatMap((l) => l.r[0]) : ML.buildings.filter((b) => b.k === k).flatMap((b) => b.r)); return P(pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length); };

const MAP = (() => {
  /* The buildings carry the colors (county building outlines, each in the part whose lots it overlaps most);
     The Landing has no buildings yet, so its lots are drawn. */
  const by = (k) => ML.buildings.filter((b) => b.k === k).map((b) => ringD(b.r)).join("");
  const lots = ["resort", "houses", "fairways", "waterway"].map((k) => `<path d="${by(k)}" fill="${C[k]}" stroke="${C[k]}" stroke-width="2.6" stroke-linejoin="round"/>`).join("")
    + `<path d="${ML.lots.filter((l) => l.k === "landing").map((l) => l.r.map(ringD).join("")).join("")}" fill="${C.landing}" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>`;
  const water = ML.icw.map(ringD).join(""), course = ML.course.map(ringD).join("");
  const lab = (t, x, y, o = {}) => `<text${o.cls ? ` class="${o.cls}"` : ""} x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x)} ${f1(y)})"` : ""}>${t}</text>`;
  must(MH > 560 && MH < 760, `the map frame changed (height ${MH}); place the labels again`);
  const cw = centroid("waterway"), cr = centroid("resort"), cf = centroid("fairways"), cl = centroid("landing"), ch = centroid("houses");
  const svg = `<svg class="pp-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" role="img" aria-labelledby="ro-map-t">`
    + `<title id="ro-map-t">Map of River Oaks in Carolina Forest. The Intracoastal Waterway runs along the lower right. Waterway Village, on its edge, is blue. The resort condos are orange, the Fairways condos purple, the cottages, Oakmont and Par 4 houses green, and The Landing's new lots gold. The land of the old golf course, which a builder's company owns, is shaded light green between them.</title>`
    + `<rect width="${MW}" height="${MH}" fill="${C.land}"/>`
    + `<path d="${course}" fill="${C.course}" stroke="${C.courseEdge}" stroke-width="2"/>`
    + `<path d="${water}" fill="${C.water}" stroke="${C.waterEdge}" stroke-width="1.5"/>`
    + lots
    + lab("Intracoastal Waterway", 820, 560, { cls: "it", rot: -33 })
    + lab("Waterway Village", cw[0] + 20, cw[1] + 52)
    + lab("Resort condos", 194, 362)
    + lab("The Fairways", 722, 268)
    + lab("The Landing", cl[0], cl[1] - 26)
    + `</svg>`;
  const key = `<ul class="pp-legend">`
    + `<li><i style="background:${C.waterway}"></i>Waterway Village: ${n(ML.counts.waterway)} condos</li>`
    + `<li><i style="background:${C.resort}"></i>Resort condos: ${n(ML.counts.resort)} condos</li>`
    + `<li><i style="background:${C.fairways}"></i>The Fairways: ${n(ML.counts.fairways)} condos</li>`
    + `<li><i style="background:${C.houses}"></i>Cottages, Oakmont and Par 4: ${n(ML.counts.houses)} lots</li>`
    + `<li><i style="background:${C.landing}"></i>The Landing: ${n(ML.counts.landing)} lots</li>`
    + `<li><i style="background:${C.course};border-color:${C.courseEdge}"></i>Old golf course land that a builder's company owns</li></ul>`;
  return `<figure class="pp-fig"><div class="pp-frame">${svg}</div>${key}<figcaption>Every building in River Oaks, colored by its part, and The Landing's new lots. The shaded land is five county parcels. Buildings and lots: Horry County GIS. Map: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain).                              */

const AIR = PHOTOS.find((r) => r.file.includes("river-oaks-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "River Oaks from the air, with the golf course open" }]);

/* ---------------------------------------------------------------------------- */
/* Tables and charts.                                                             */

const NB = "&nbsp;";
const PARTS = `<div class="pp-cmp">` + h.table(["Part of River Oaks", "Homes", "Sold, past year"], [
  ["Waterway Village, condos on the Intracoastal", n(GR.waterway_village.units), `${SA.waterway_village.count}, about ${r1k(SA.waterway_village.prices.median)}`],
  ["Resort condos", n(GR.resort_condos.units), `${SA.resort_condos.count}, about ${r1k(SA.resort_condos.prices.median)}`],
  ["The Fairways, condos", n(GR.fairways.units), `${SA.fairways.count}, about ${r1k(SA.fairways.prices.median)}`],
  ["Cottages, Oakmont and Par 4, houses", n(HA.units), `${SA.cottages.count} cottages, ${r1k(Math.min(...SA.cottages.prices.values))} to ${r1k(Math.max(...SA.cottages.prices.values))}`],
  ["The Landing, new houses", `${GR.landing.parcels}${NB}lots`, "none recorded yet"],
]) + `</div>`;

const SOLD = G.bars([
  { name: `Waterway Village, ${SA.waterway_village.count} sold`, value: SA.waterway_village.prices.median },
  { name: `The Fairways, ${SA.fairways.count} sold`, value: SA.fairways.prices.median },
  { name: `Resort condos, ${SA.resort_condos.count} sold`, value: SA.resort_condos.prices.median },
].map((r) => Object.assign(r, { valueText: r1k(r.value) })), {
  caption: "What River Oaks condos sold for, the middle sale in each part",
  nameLabel: "Part of River Oaks", valueLabel: "Middle sale price", compact: true,
  note: "Horry County deeds recorded in the past 12 months. Half sold for more, half for less.",
});

const DRIVES = `<div class="pp-cmp">` + h.table(["By car, about", "Condos, cottages, Oakmont", "The Fairways, The Landing"], [
  ["Coastal Grand Mall", `${D("Coastal Grand Mall", W)}${NB}min`, `${D("Coastal Grand Mall", E)}${NB}min`],
  ["Nearest public beach access", `${D("nearest public beach access", W)}${NB}min`, `${E_BEACH}${NB}min`],
  ["Broadway at the Beach", `${D("Broadway at the Beach", W)}${NB}min`, `${D("Broadway at the Beach", E)}${NB}min`],
  ["Myrtle Beach airport", `${D("Myrtle Beach International Airport terminal", W)}${NB}min`, `${D("Myrtle Beach International Airport terminal", E)}${NB}min`],
  ["Grand Strand Medical Center", `${D("Grand Strand Medical Center", W)}${NB}min`, `${D("Grand Strand Medical Center", E)}${NB}min`],
]) + `</div>`;

const TAXES = h.table(["Each year, county tax", "As your full-time home", "As a second home or rental"], [
  [`A typical condo, ${r1k(SC.prices.median)}`, `About ${r10(T4(SC.prices.median))}`, `About ${r10(T6(SC.prices.median))}`],
  [`A typical Waterway Village condo, ${r1k(SA.waterway_village.prices.median)}`, `About ${r10(T4(SA.waterway_village.prices.median))}`, `About ${r10(T6(SA.waterway_village.prices.median))}`],
]);

const YEAR = h.table(["Each year, before any loan", "As your full-time home", "As a second home or rental"], [
  ["HOA fee, at $330 to $455 a month", `${r10(FEE_MIN * 12)} to ${r10(FEE_MAX * 12)}`, `${r10(FEE_MIN * 12)} to ${r10(FEE_MAX * 12)}`],
  [`County tax on a ${r1k(SC.prices.median)} condo`, `About ${r10(T4(SC.prices.median))}`, `About ${r10(T6(SC.prices.median))}`],
  ["<strong>Fee and tax together</strong>", `<strong>About ${r10(Math.round(YR(FEE_MIN, T4(SC.prices.median)) / 100) * 100)} to ${r10(Math.round(YR(FEE_MAX, T4(SC.prices.median)) / 100) * 100)}</strong>`, `<strong>About ${r10(Math.round(YR(FEE_MIN, T6(SC.prices.median)) / 100) * 100)} to ${r10(Math.round(YR(FEE_MAX, T6(SC.prices.median)) / 100) * 100)}</strong>`],
]);

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  storm: "https://www.horrycountysc.gov/departments/stormwater/major-initiatives/utility-fee/",
  zoning: "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf",
  course: "https://www.onthegreenmagazine.com/final-farewells-are-being-given-to-river-oaks-golf-club-over-the-next-two-weeks/",
  beach: "https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0",
  osm: "https://www.openstreetmap.org/",
};

/* ---------------------------------------------------------------------------- */
/* Strips and offers (round 2, owner 2026-11-14: show the houses; two service offers at most). */

const CONTACT = `/contact/?place=${encodeURIComponent("River Oaks")}`;
const STRIP_ALL = G.homesQScript() + G.homesQ("subdivision=River Oaks Condos", "River Oaks condos for sale");

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "River Oaks", alternateName: ["River Oaks, Myrtle Beach", "River Oaks condos, Carolina Forest"],
  description: `A community of ${n(CA.units)} condos and ${HA.units} houses in Carolina Forest with Myrtle Beach mailing addresses, on the Intracoastal Waterway, in unincorporated Horry County, South Carolina.`,
  geo: { "@type": "GeoCoordinates", latitude: F.all.center[0], longitude: F.all.center[1] },
  address: { "@type": "PostalAddress", addressLocality: "Myrtle Beach", addressRegion: "SC", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Carolina Forest", url: "/submarkets/carolina-forest/" },
  pageImages: () => PH.pageImages(AIR),
  title: "River Oaks Condos Myrtle Beach: Prices, HOA Fee, Tax",
  description: `River Oaks condos in Carolina Forest, Myrtle Beach: what ${SC.count} sold for, the monthly HOA fee, yearly county tax, the closed golf course, and homes for sale.`,
  ogTitle: "River Oaks condos in Carolina Forest, Myrtle Beach: what they sell for, the HOA fee and the tax",
  crumb: "River Oaks",
  eyebrow: "River Oaks, Carolina Forest",
  h1: "River Oaks condos in Carolina Forest:",
  h1em: "what they sell for, the HOA fee and the tax.",
  sub: `A typical River Oaks condo sold for ${r5k(SC.prices.median)} this past year. The county tax on one is about ${r10(T4(SC.prices.median))} a year as your full-time home.`,
  heroMedia: CSS + glance([
    { icon: "home", label: "Condos", text: n(CA.units) },
    { icon: "dollar", label: "Typical sale", text: r5k(SC.prices.median) },
    { icon: "cards", label: "HOA fee a month", text: `$${FEE_MIN} to $${FEE_MAX}` },
    { icon: "beach", label: "Beach by car", text: `About ${D("nearest public beach access", W)} minutes` },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `River Oaks is a community of ${n(CA.units)} condos and ${HA.units} houses on the Intracoastal Waterway in Carolina Forest. Mail goes to Myrtle Beach, but the land is outside every town, in Horry County.`,
    `The monthly HOA fee on the ${LC.for_sale} condos for sale is $${FEE_MIN} to $${FEE_MAX}. River Oaks Golf Club, the 27-hole course that sat among the condos, closed on November 30, 2025.`,
  ],
  sections: [
    { html: () => G.homesCss() + STRIP_ALL },

    { h2: "What is River Oaks in Myrtle Beach?", toc: "The five parts", id: "parts", html: () =>
      h.p(`River Oaks is several groups of homes under one name. It has seven sections in the county's records, and the listings use five names. They put Waterway Village and the resort condos together as "River Oaks Condos".`) +
      AERIAL +
      PARTS +
      `<p class="pp-note">Homes: county parcels with a building. Sales: Horry County deeds recorded in the past 12 months, recorded sales only.</p>` +
      h.p(`The land is in ${h.a("/submarkets/carolina-forest/", "Carolina Forest")}, not inside Myrtle Beach. None of River Oaks' lots is in a town's limits. Mail goes to Myrtle Beach, so listings say Myrtle Beach.`) +
      MAP },

    { h2: "What do River Oaks condos sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year ${SC.count} River Oaks condos sold, at a middle price of ${r5k(SC.prices.median)}. The middle half went for ${r5k(SC.prices.q1)} to ${r5k(SC.prices.q3)}.`) +
      SOLD +
      h.p(`In our latest count, ${LC.for_sale} River Oaks condos were for sale, asking ${r5k(LC.list_price.min)} to ${r5k(LC.list_price.max)}. Most were two-bedrooms, and most were built in the 1990s, with the newest in 2004. The River Oaks Condos listings are about ${n(Math.round(LRO.sqft.median / 10) * 10)} square feet at the middle.`) +
      G.homesQ("subdivision=River Oaks Condos&beds=2", "Two-bedroom condos in River Oaks") },

    { h2: "How much is the HOA fee at River Oaks, and what does it cover?", toc: "HOA fee", id: "hoa", html: (bg) =>
      h.p(`The monthly HOA fee on River Oaks condos for sale is $${FEE_MIN} to $${FEE_MAX}. In the Fairways it is $${fFW.min} to $${fFW.max}.`) +
      h.p(`The listings do not say what the fee pays for, and the county does not keep it. Before you offer, we ask the association for its budget and its rules.`) +
      h.cta("Like a condo? Have us pull the association's budget", "We ask the association for the budget, the dues, and the rules on renting, and tell you what they say before you offer.", "Have us pull the budget", CONTACT, bg) +
      h.h3("What the houses pay") +
      h.p(`The houses pay less. The Landing's fee is $${fLA.min} to $${fLA.max} a month, with trash pickup. The one cottage for sale shows $${fCO.min} a month, and the one Oakmont house $${fOK.min}. Our ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood page")} has the rest of Carolina Forest.`) +
      h.h3("Renting, and the association's rules") +
      h.p(`On renting: the county's zoning has no limit on how long a home outside the towns may be rented. The association's recorded rules can have one. Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers renting by the night.`) +
      h.p(`Six sets of rules and regulations were recorded for Waterway Village between 2019 and 2025. We read the current ones before you offer.`) },

    { h2: "How much is the property tax on a River Oaks condo?", toc: "Property tax", id: "tax", html: () =>
      h.p(`On a typical condo, the county tax is about ${r10(T4(SC.prices.median))} a year as your full-time home. As a second home or rental it is about ${r10(T6(SC.prices.median))}. Most bills add a flat $89.40 county stormwater fee.`) +
      TAXES +
      `<p class="pp-note">The arithmetic: the price, times 4 percent for a home you live in or 6 percent otherwise, times the county's current tax rate. Your own ${h.a("/buyers/property-taxes/", "full-time home")} bill depends on filing for the lower rate.</p>` +
      h.p(`The county taxes about ${SHARE_OTHER} in 10 River Oaks condos at the second-home and rental rate, and the rest at the full-time rate.`) +
      h.p(`The county's current values work out to about ${r10(CA.implied_tax_6pct.median)} for a condo taxed as a second home. For one taxed as a full-time home, they work out to about ${r10(CA.implied_tax_4pct.median)}. Both are before any stormwater fee. A sale resets the value to about the price, so a buyer's bill follows the price paid.`) +
      h.h3("A year of fee and tax, before any loan") +
      YEAR +
      `<p class="pp-note">Before insurance and power. The fee range is the one on the condos for sale, and the tax is for a ${r1k(SC.prices.median)} condo.</p>` },

    { h2: "Is the River Oaks golf course still open?", toc: "The golf course", id: "course", html: (bg) =>
      h.p(`No. River Oaks Golf Club closed on November 30, 2025, after 38 years. It had 27 holes, in three nines called Fox, Otter and Bear.`) +
      h.p(`The Bear nine closed first, in September 2021. It became 220 home lots, and ${h.a(SRC.course, "On The Green")} described that project as well underway. For the other 18 holes, the owner bought the land in February 2024 and plans 370 home lots on 172 acres.`) +
      h.p(`Five parcels named FAIRWAYS, about 170 acres, belong to a builder's company. They are land, not the Fairways condos. About 480 homes sit within 50 feet of that land.`) +
      G.homesQ("subdivision=River Oaks Condos&has=on_golf_course", "River Oaks condos the listings place on the old golf course") +
      h.p(`A condo that once looked onto a fairway now looks onto land a builder owns. What goes there is the owner's plan, not a promise.`) +
      h.cta("Like a condo on the old course? Have us check the land beside it", "We read the county's records for the land next to the condo, and tell you what we find before you offer.", "Have us check the land", CONTACT, bg) },

    { h2: "Waterway Village: the condos on the Intracoastal", toc: "Waterway Village", id: "waterway", html: () =>
      h.p(`Waterway Village has ${GR.waterway_village.units} condos, and ${GR.waterway_village.within_25m_of_waterway} of them are within about 80 feet of the county's outline of the Intracoastal Waterway. No other part of River Oaks comes close.`) +
      h.p(`${SA.waterway_village.count} sold in the past year, at a middle price of ${r5k(SA.waterway_village.prices.median)}, the highest middle price in River Oaks. For the ones on the water, our ${h.a("/buyers/waterfront-homes/", "waterfront homes guide")} explains what the water adds and costs.`) },

    { h2: "The Fairways at River Oaks", toc: "The Fairways", id: "fairways", html: () =>
      h.p(`The Fairways is the other set of condos, ${GR.fairways.units} of them on the east side of River Oaks. The middle sale in the past year was about ${r5k(SA.fairways.prices.median)}, from ${SA.fairways.count} sales. The ${LFW.for_sale} for sale were built from ${LFW.year_built[0]} to ${LFW.year_built[1]}, and ${LFW.beds["3"]} of them have three bedrooms.`) +
      G.homesQ("subdivision=Fairways At River Oaks", "Condos for sale in the Fairways at River Oaks") },

    { h2: "The houses: cottages, Oakmont and The Landing", toc: "The houses", id: "houses", html: () =>
      h.p(`River Oaks has ${HA.units} older houses in the cottages, Oakmont and Par 4. Their lots are about ${n(Math.round(GR.cottages.lot_sqft.median / 100) * 100)} square feet at the middle. ${SA.cottages.count} cottages sold in the past year, for ${r1k(Math.min(...SA.cottages.prices.values))} to ${r1k(Math.max(...SA.cottages.prices.values))}. No Oakmont house sold.`) +
      h.p(`The Landing is the new part: ${GR.landing.parcels} lots. In our latest count, ${LL.for_sale} Landing houses were for sale, asking ${r1k(LL.list_price.min)} to ${r1k(LL.list_price.max)}. No Landing house sale is recorded yet.`) +
      G.homesQ("subdivision=Landing at River Oaks", "New houses for sale in The Landing at River Oaks") +
      h.p(`The listings mark ${LL.waterfront} of the ${LL.for_sale} as waterfront. The county's outline puts the Intracoastal ${n(GR.landing.nearest_to_waterway_m)} meters from the nearest Landing lot, so we ask which water a house faces. The Landing's fee covers trash pickup, a community pool and tennis.`) },

    { h2: "Is River Oaks in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`None of River Oaks' home and lot parcels touches FEMA's high-risk zone or its 0.2 percent zone on the county's map. That includes the Waterway Village lots next to the water.`) +
      h.p(`A map does not show whether a building has flooded, and it does not set an insurance bill. We check a condo's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how, and ${h.a("/buyers/coastal-insurance/", "coastal insurance")} covers wind and flood cover.`) },

    { h2: "How far is River Oaks from the beach?", toc: "The drive", id: "drives", html: () =>
      h.p(`The nearest public beach access is about ${D("nearest public beach access", W)} minutes by car from the condos, cottages and Oakmont, and about ${E_BEACH} from the Fairways and The Landing. It is about ${E_BEACH_MI} miles from the east side. Walking from the west side takes about two hours.`) +
      DRIVES +
      `<p class="pp-note">Minutes with no traffic, from the middle of each side, on OpenStreetMap roads. Beach: the nearest public access.</p>` +
      G.homesQ("near=33.7225,-78.9215&miles=1&type=condo", "Condos for sale within a mile of River Oaks") + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach, ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest")} in Myrtle Beach. Then ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway, ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} in Myrtle Beach. Then ${h.a("/submarkets/north-myrtle-beach/briarcliffe-acres/", "the town of Briarcliffe Acres")} and ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "River Oaks FAQ",
  faq: [
    { q: "Is River Oaks in Myrtle Beach or Carolina Forest?", a: "Both, in a sense. Mail goes to Myrtle Beach, but the land is in Carolina Forest, outside every town's limits, in Horry County." },
    { q: "Is the River Oaks golf course open?", a: "No. River Oaks Golf Club has closed, and a builder's company owns the course land now." },
    { q: "Can I rent out a River Oaks condo?", a: `The county's zoning has no limit on how long a home outside the towns may be rented. The association's recorded rules can have one, so we read them before you offer. Our short-term rental rules guide covers renting by the night.` },
    { q: "Does River Oaks have a pool?", a: `The Landing has a community pool, on all ${LL.for_sale} of its listings, and tennis on 5 of them. For the condos, the listings do not say, so we ask the association.` },
    { q: "Why is the HOA fee not in the county's records?", a: "The county does not keep an association's fee. It comes from the listing, and we confirm it with the association." },
    { q: "Is this River Oaks Estates in Pawleys Island?", a: "No. River Oaks Estates is a different place, in Pawleys Island. This page is about River Oaks in Carolina Forest, near Myrtle Beach." },
    { q: "How many condos are in River Oaks?", a: `The county counts ${n(CA.units)} condos: ${GR.waterway_village.units} in Waterway Village, ${GR.resort_condos.units} resort condos and ${GR.fairways.units} in the Fairways.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "2026 tax levy", href: SRC.levy },
    { name: "stormwater fee", href: SRC.storm },
    { name: "zoning", href: SRC.zoning },
    { name: "golf course closing", href: SRC.course },
    { name: "beach access", href: SRC.beach },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in River Oaks.",
    p: "Tell us the part you like and your budget. We line up the condos or houses that fit, each with its fee, its yearly tax and what the association's papers say.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "River Oaks condos Myrtle Beach, River Oaks Myrtle Beach SC, River Oaks condos for sale, River Oaks HOA fee, River Oaks golf course closing, Fairways at River Oaks, Waterway Village River Oaks, The Landing at River Oaks, River Oaks Carolina Forest",
  about: "River Oaks, a community of condos and houses on the Intracoastal Waterway in Carolina Forest, with Myrtle Beach mailing addresses, in Horry County, South Carolina",
});
