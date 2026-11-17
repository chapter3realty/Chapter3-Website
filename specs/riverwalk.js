/* /submarkets/myrtle-beach/riverwalk/ - Riverwalk at Arrowhead, Myrtle Beach: a condo community beside the
 * Arrowhead Country Club golf course and the Intracoastal Waterway. What it is like to own there, what condos sold
 * for, the HOA fee by size and what it pays, the old lawsuit, the city limits, the flood zone, renting.
 *
 * Batch 2026-11-e, Lane N (new page). Built like specs/plantation-point.js (the neighborhood pilot) with the
 * fee and three-parts table of specs/palace-resort.js. Facts: Blog-Brain batches/2026-11-e/riverwalk/facts.md,
 * VERIFIED rows and CORRECTED rows at the verifier's wording only (VERIFY.md). Demand: must-answer.md. Plan: PLAN.md.
 * Not used (struck or held): row 4's building counts and "three-story", row 15's indoor pool and nature trail,
 * row 17's "only Grand Strand design", "six courses on the Intracoastal" and "five holes on the waterway", row 24's
 * tax dollars (tax district 600 is not tied to a levy), row 23's county value, the Food Lion drive, the townhome sales
 * (row 10), docks, views, who owns here, a unit's own flood zone.
 * Data: data/2026-11-e/riverwalk/. Every count, price, fee and minute is read from those files and checked against its
 * ledger row with must(). Picture: one map we drew from Horry County parcels (map_layers.py). No photo yet: the shot
 * list for the photo partner is in BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/riverwalk/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "riverwalk");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const PHOTOS = read("photos.json").photos;
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-layers.json");

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const r100 = (v) => "$" + n(Math.round(v / 100) * 100);
const must = (ok, msg) => { if (!ok) throw new Error(`riverwalk.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 3: 321 condo units: 216 in the original phase, 105 in Riverwalk II; 28 townhome lots. */
const CN = F.counts;
must(CN.condo_units === 321 && CN.phase_I_units === 216 && CN.phase_II_units === 105 && CN.townhome_lots === 28, "row 3 changed");
/* Row 7: 22 condo sales, $137,500 to $325,500, middle $208,500, middle half $174,625 to $250,000. */
const SA = F.sales, SC = SA.condos_all;
must(SC.n === 22 && SC.median === 208500 && SC.min === 137500 && SC.max === 325500 && SC.p25 === 174625 && SC.p75 === 250000, "row 7 changed");
/* Row 8: by phase. */
const S1 = SA.condos_phase_I, S2 = SA.condos_phase_II;
must(S1.n === 13 && S1.median === 183000 && S1.min === 137500 && S1.max === 224000 && S2.n === 9 && S2.median === 265000 && S2.min === 177000 && S2.max === 325500, "row 8 changed");
/* Row 10: the townhome sales are too few to print (6 deeds, one a $4,485 transfer). */
must(SA.townhomes.n === 6, "row 10 changed");
/* Row 11: for sale, condos: 1-bed 5, 2-bed 4 (original phase), 3-bed 2 (Riverwalk II). */
const CB = L.condos_by_beds, LG = L.groups;
must(LG.condos.n === 11 && CB["1"].n === 5 && CB["2"].n === 4 && CB["3"].n === 2, "row 11 counts changed");
must(CB["1"].min === 145000 && CB["2"].max === 223500 && CB["3"].min === 229900 && CB["3"].max === 298000, "row 11 prices changed");
must(L.subdivision_field["RIVERWALK"] === 9 && L.subdivision_field["RIVERWALK II"] === 2 && L.subdivision_field["Riverwalk Townhomes at Arrowhead"] === 2, "row 1 changed");
/* Row 12: sizes. */
must(CB["1"].sqft_range[0] === 756 && CB["2"].sqft_range[1] === 1120 && CB["3"].sqft_range[0] === 1510 && LG.townhomes.sqft_range[0] === 1658 && LG.townhomes.sqft_range[1] === 1675, "row 12 changed");
/* Row 13 (CORRECTED): the brackets are upper bounds; bisection puts the fees at about $315, $400 and $495 and the townhomes
   at about $185. The brackets read 325, 400, 500 and 200. */
const FB = L.fee_by_beds;
must(FB["1"].highest_at_or_under === 325 && FB["2"].highest_at_or_under === 400 && FB["3"].highest_at_or_under === 500 && L.fee.townhomes.highest_at_or_under === 200, "row 13 changed");
const FEE = { b1: 315, b2: 400, b3: 495, th: 185 };
const YEAR = { b1: FEE.b1 * 12, b2: FEE.b2 * 12, b3: FEE.b3 * 12 };
/* Row 14: what the fee pays, of the 13 listings. */
const FL = L.flags_all;
must(L.api_total === 13 && FL.hoa_includes_trash === 13 && FL.lawn_care_included === 13 && FL.hoa_includes_pest === 11 && FL.hoa_includes_water_sewer === 10 && FL.hoa_includes_insurance === 10 && FL.hoa_includes_cable === 7 && FL.hoa_includes_internet === 3 && FL.hoa_includes_electric === 0, "row 14 changed");
/* Row 15 (CORRECTED): the MLS counts only. */
must(FL.community_pool === 11 && FL.clubhouse === 9 && FL.golf_view === 12 && FL.on_golf_course === 10 && LG.condos.waterfront_field === 3, "row 15 changed");
/* Row 16: 66 of 321 within 25 m (about 80 ft) of the waterway's mapped edge; 156 within 100 m (about 330 ft). */
const WD = F.waterway_distance_m;
must(WD.within_25m === 66 && WD.within_100m === 156 && WD.n === 321 && Math.round(66 / 321 * 5) === 1, "row 16 changed");
must(Math.round(25 * 3.2808) === 82 && Math.round(100 * 3.2808) === 328, "row 16 feet changed");
/* Row 18: the course's two nearest parcels, about 180 m (about 600 ft) from the condos in the middle; 12 condos within 50 m (about 160 ft). */
must(F.golf_distance_m.median === 183 && F.golf_distance_m.within_50m === 12, "row 18 changed");
/* Row 19: no town at the community's center (the county's municipal layer). */
must(F.town_contains_center === false && F.town_contains_all_condo_parcels === 0, "row 19 changed");
/* Row 21: flood. */
must(F.flood_condo_parcels.AE === 12 && F.flood_condo_parcels["0.2"] === 69 && F.flood_condo_parcels.X === 240, "row 21 changed");
/* Row 22: tax status. */
must(F.tax_status.taxed_6pct === 209 && F.tax_status.taxed_4pct_legal_residence === 112, "row 22 changed");
/* Row 26: rentals, of the 13 listings. Row 27: loans. */
must(FL.rentals_allowed === 12 && FL.str_allowed === 9 && FL.long_term_rental_allowed === 12, "row 26 changed");
must(FL.conventional_accepted === 12 && FL.fha_accepted === 7 && FL.va_accepted === 5 && FL.cash_only_listing === 0, "row 27 changed");
/* Row 28: drives from the middle of the condos, no traffic, to the nearest minute. */
const DV = DR.drives, mins = (k) => Math.round(DV[k].minutes);
const D = { club: mins("Arrowhead Country Club (centre of the OSM course outline)"), mall: mins("Coastal Grand Mall"), publix: mins("Publix, 955 Wood Duck Dr"),
  airport: mins("Myrtle Beach International Airport terminal"), broadway: mins("Broadway at the Beach"), beach: mins("nearest public beach access") };
must(D.club === 3 && D.mall === 14 && D.publix === 15 && D.airport === 16 && D.broadway === 17 && D.beach === 17, "row 28 changed");
const BEACH_MI = Math.round(DV["nearest public beach access"].miles), WALK_MI = Math.round(DR.walk_to_that_access.miles);
must(BEACH_MI === 7 && WALK_MI === 7, "row 28 beach miles changed");
/* The listings' read time: every count of homes for sale prints the day it ran. */
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (as plantation-point.js).                       */

const INK = "#8a5226";
const C = { land: "#eef0e4", water: "#cfe4ef", waterEdge: "#9cc3d8", course: "#d3e6c4", courseEdge: "#b3d19c", other: "#e6e4dc", otherEdge: "#c9c4b6",
  far: "#ffffff", farEdge: "#b9b2a5", mid: "#6fa3bd", near: "#1f5f80" };
const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:${INK}!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main figure.c3ph-hero img{aspect-ratio:4/3!important}
main#main .rw-fig{margin:1.4rem 0 1.6rem;max-width:720px}
main#main .rw-fig figcaption{color:var(--muted);font-size:.92rem;line-height:1.55;margin-top:.6rem}
main#main .rw-frame{border-radius:14px;overflow:hidden;background:${C.land};border:1px solid rgba(28,32,40,.12)}
main#main .rw-frame svg{display:block;width:100%;height:auto}
main#main svg.rw-map text{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#1c2028;paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-linejoin:round;font-size:34px;stroke-width:8px}
main#main svg.rw-map text.it{font-style:italic;font-weight:600;fill:#1f4f68}
main#main svg.rw-map text.gc{fill:#2f5326}
@media (min-width:700px){main#main svg.rw-map text{font-size:22px;stroke-width:6px}}
main#main .rw-legend{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.4rem;font-size:1rem;color:var(--muted);line-height:1.4}
@media (min-width:700px){main#main .rw-legend{grid-template-columns:1fr 1fr;column-gap:1.5rem}}
main#main .rw-legend li{display:flex;gap:.6rem;align-items:center;margin:0}
main#main .rw-legend i{flex:none;display:inline-block;width:1.5rem;height:1rem;border-radius:3px;border:1px solid rgba(28,32,40,.25)}
main#main .rw-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .rw-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .rw-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main .c3-gchart,main#main .c3-cc,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .c3-cc{max-width:100%!important}
main#main .rw-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.6rem 0 1.4rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;text-align:right}
}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The map: every condo building, shaded by its distance to the waterway's mapped edge (row 16), from map-layers.json. */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const [W0, S0, E0, N0] = ML.frame, MW = 1000, MH = Math.round(MW * (my(N0) - my(S0)) / (mx(E0) - mx(W0)));
const P = (lo, la) => [(mx(lo) - mx(W0)) / (mx(E0) - mx(W0)) * MW, (my(N0) - my(la)) / (my(N0) - my(S0)) * MH];
const f1 = (v) => Math.round(v * 10) / 10;
const ringD = (r) => "M" + r.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L") + "Z";
must(ML.counts.near === 66 && ML.counts.near + ML.counts.mid === 156 && ML.counts.far === 165, "map layers do not match row 16");

const MAP = (() => {
  const area = (r) => { let a = 0; for (let i = 0; i < r.length - 1; i++) a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return Math.abs(a / 2); };
  const order = { other: 0, far: 1, mid: 2, near: 3 };
  const lots = ML.lots.slice().sort((a, b) => order[a.k] - order[b.k] || b.r.reduce((s, r) => s + area(r), 0) - a.r.reduce((s, r) => s + area(r), 0));
  const fill = { other: C.other, far: C.far, mid: C.mid, near: C.near }, edge = { other: C.otherEdge, far: C.farEdge, mid: "#fff", near: "#fff" };
  const paths = lots.map((l) => `<path d="${l.r.map(ringD).join("")}" fill="${fill[l.k]}" stroke="${edge[l.k]}" stroke-width="1.2" stroke-linejoin="round" fill-rule="evenodd"/>`).join("");
  const water = ML.icw.map(ringD).join(""), course = ML.golf.map(ringD).join("");
  const lab = (t, x, y, o = {}) => `<text${o.cls ? ` class="${o.cls}"` : ""} x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}">${t}</text>`;
  const svg = `<svg class="rw-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" role="img" aria-labelledby="rw-map-t">`
    + `<title id="rw-map-t">Map of the Riverwalk condo buildings in Myrtle Beach. The Intracoastal Waterway runs along the bottom, and the Arrowhead Country Club golf course lies to the northeast. The buildings within about 80 feet of the waterway are dark blue, the buildings 80 to 330 feet away are lighter blue, and the rest are white.</title>`
    + `<rect width="${MW}" height="${MH}" fill="${C.land}"/>`
    + `<path d="${course}" fill="${C.course}" stroke="${C.courseEdge}" stroke-width="1.5"/>`
    + `<path d="${water}" fill="${C.water}" stroke="${C.waterEdge}" stroke-width="1.5"/>`
    + paths
    + `@@LABELS@@`
    + `</svg>`;
  const key = `<ul class="rw-legend">`
    + `<li><i style="background:${C.near}"></i>Within about 80 feet of the waterway: ${n(ML.counts.near)} condos</li>`
    + `<li><i style="background:${C.mid}"></i>About 80 to 330 feet away: ${n(ML.counts.mid)} condos</li>`
    + `<li><i style="background:${C.far}"></i>Farther from the waterway: ${n(ML.counts.far)} condos</li>`
    + `<li><i style="background:${C.other}"></i>Townhomes, garages and common land</li></ul>`;
  return { svg, key, lab };
})();
const MAPFIG = (() => {
  /* Label spots in map units (the frame is 1000 wide), placed by eye on the drawn map: on the water along the bottom edge and
     on the open green of the course. The shading carries the facts; the labels only name the two places. */
  const wy = MH - 24;
  const labels = MAP.lab("Intracoastal Waterway", 500, wy, { cls: "it" }) + MAP.lab("Arrowhead", 835, 70, { cls: "gc" }) + MAP.lab("Country Club", 835, 112, { cls: "gc" });
  return `<figure class="rw-fig"><div class="rw-frame">${MAP.svg.replace("@@LABELS@@", labels)}</div>${MAP.key}<figcaption>Each outline is a building, and condos on different floors share it. Shading is the distance to the Intracoastal Waterway's mapped edge. Buildings: Horry County parcels. Map: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain): the buildings, the fairway and the waterway in one frame. */

const AIR = PHOTOS.find((r) => r.file.includes("riverwalk-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Part of Riverwalk from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The three parts side by side (rows 3, 5, 8, 11, 12, 13, 29): cards on a phone.   */

const NB = "\u00a0";
const PARTS = compareCards([
  { name: "Original buildings", bestFor: `${CN.phase_I_units} condos, built 1997 to 1999`,
    cells: { sold: `${S1.n}, about${NB}${r1k(S1.median)}`, sale: `${CB["1"].n + CB["2"].n}, ${"$" + n(CB["1"].min)}${NB}to${NB}${"$" + n(CB["2"].max)}`, fee: `$${FEE.b1}${NB}to${NB}$${FEE.b2}` } },
  { name: "Riverwalk II", bestFor: `${CN.phase_II_units} condos, built 2006`,
    cells: { sold: `${S2.n}, about${NB}${r5k(S2.median)}`, sale: `${CB["3"].n}, ${"$" + n(CB["3"].min)}${NB}to${NB}${"$" + n(CB["3"].max)}`, fee: `$${FEE.b3}` } },
  { name: "Townhomes", bestFor: `${CN.townhome_lots} townhomes, built 2022`,
    cells: { sold: "Too few to count", sale: `${LG.townhomes.n}`, fee: `$${FEE.th}` } },
], [
  { key: "sold", label: "Sold, past year", num: true },
  { key: "sale", label: "For sale now", num: true },
  { key: "fee", label: "Fee a month", num: true },
], { caption: "Riverwalk has three parts. Each sells for a different price.", nameLabel: "Part", bestForLabel: "Homes" });

/* ---------------------------------------------------------------------------- */
/* The drives (row 28): one chart, minutes by car with no traffic.                  */

const DRIVES = G.bars([
  { name: "Arrowhead Country Club", value: D.club },
  { name: "Coastal Grand Mall", value: D.mall },
  { name: "Publix on Wood Duck Drive", value: D.publix },
  { name: "Myrtle Beach International Airport", value: D.airport },
  { name: "Broadway at the Beach", value: D.broadway },
  { name: "Closest beach access with parking", value: D.beach },
].map((r) => Object.assign(r, { valueText: `${r.value} min` })), {
  caption: "Minutes by car from the middle of Riverwalk",
  nameLabel: "Place", valueLabel: "By car, about", compact: true,
  note: `With no traffic. The beach time is to the closest public beach access with parking. Routes on OpenStreetMap roads.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  golf: "https://www.playgolfmyrtlebeach.com/news/6-things-know-arrowhead-country-club/",
  op4888: "https://www.sccourts.org/media/opinions/HTMLFiles/COA/4888.htm",
  op27698: "https://www.sccourts.org/media/opinions/HTMLFiles/SC/27698.pdf",
  swa: "https://www.solidwasteauthority.org/residential.html",
  conway: "https://en.wikipedia.org/wiki/Conway,_South_Carolina",
  osm: "https://www.openstreetmap.org/",
};

const CONTACT = `/contact/?place=${encodeURIComponent("Riverwalk")}`;

/* Round 2 (owner, 2026-11-14): live strips, never "send me homes". The MLS spells the community Riverwalk (it matches
   RIVERWALK, RIVERWALK II and the townhomes). Searches checked on the live site 2026-11-14 (BUILD.md); the feed at the top
   of the page is the lead's. */
const STRIP_WATER = G.homesQ("subdivision=Riverwalk&waterfront=1", "Riverwalk condos listed as waterfront");
const STRIP_UNDER = G.homesQ("subdivision=Riverwalk&max=200000", "Riverwalk condos under $200,000");
const STRIP_NEAR = G.homesQ("type=condo&near=33.69641,-78.95454&miles=1", "Condos within a mile of Riverwalk");

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Riverwalk at Arrowhead", alternateName: ["Riverwalk", "Riverwalk Myrtle Beach", "Riverwalk II"],
  description: `A community of ${CN.condo_units} condos on Riverwalk Drive beside Arrowhead Country Club and the Intracoastal Waterway, outside the city limits of Myrtle Beach, South Carolina, with Myrtle Beach mailing addresses.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center[0], longitude: F.center[1] },
  address: { "@type": "PostalAddress", streetAddress: "Riverwalk Dr", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29579", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "Riverwalk Condos Myrtle Beach: Prices, HOA Fees, Golf",
  description: `Riverwalk at Arrowhead in Myrtle Beach: ${CN.condo_units} condos by the Intracoastal and Arrowhead golf. What condos sold for, HOA fees, the 2003 lawsuit, flood, rentals.`,
  ogTitle: "Riverwalk condos in Myrtle Beach: prices, HOA fees and the golf course next door",
  crumb: "Riverwalk",
  eyebrow: "Riverwalk, Myrtle Beach",
  h1: "Riverwalk condos in Myrtle Beach:",
  h1em: "one in five sits within about 80 feet of the Intracoastal Waterway.",
  sub: `Condos here sold for about ${r5k(SC.min)} to ${r5k(SC.max)} in the past year, beside Arrowhead Country Club, a 27-hole public course.`,
  heroMedia: CSS + glance([
    { icon: "home", label: "Condos", text: n(CN.condo_units) },
    { icon: "water", label: "Waterway", text: `${ML.counts.near} within 80${NB}feet` },
    { icon: "golf", label: "Golf next door", text: "27 holes" },
    { icon: "dollar", label: "HOA fee", text: `From about $${FEE.b1}` },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Riverwalk is a community of ${CN.condo_units} condos on Riverwalk Drive in Myrtle Beach, beside Arrowhead Country Club and the Intracoastal Waterway. The land is outside the city limits. In the past year ${SC.n} condos sold, and the middle price was ${"$" + n(SC.median)}.`,
    `Homes for sale list a monthly HOA fee of about $${FEE.b1} to $${FEE.b3}, by the size of the condo. On most listings the fee covers trash, lawn care and pest control. The original buildings sold for less than Riverwalk II.`,
  ],
  sections: [
    { h2: "What is it like to own a condo at Riverwalk?", toc: "Life here", id: "life", html: () =>
      G.homesCss() + G.homesQScript() +
      h.p(`Riverwalk sits next to Arrowhead Country Club, a public golf course with 27 holes, designed by Raymond Floyd and Tom Jackson. The county's map puts the course's land about ${n(Math.round(F.golf_distance_m.median * 3.2808 / 100) * 100)} feet from the middle of the condos.`) +
      AERIAL +
      h.p(`The other edge is water. We measured every condo's distance to the waterway on the county's map. Of the ${CN.condo_units} condos, ${n(WD.within_25m)}, one in five, sit within about 80 feet of the Intracoastal Waterway's mapped edge.`) +
      MAPFIG +
      h.p(`The map shows distance, not a view or a dock. Use it to pick the condos to ask about first. Whether a condo has a water view is in its listing, and we confirm it with you. On ${COUNT_DAY}, ${LG.condos.waterfront_field} Riverwalk condos listed as waterfront.`) +
      STRIP_WATER +
      h.p(`Of the ${L.api_total} Riverwalk homes listed on ${COUNT_DAY}, ${FL.community_pool} name a community pool and ${FL.clubhouse} a clubhouse.`) +
      h.p(`A normal week here means a round at Arrowhead, a boat ride on the Intracoastal and Publix for groceries. The beach is not a walk: it is about ${D.beach} minutes by car to the closest access with parking.`) +
      DRIVES +
      h.h3("The three parts of Riverwalk") +
      h.p(`Riverwalk was built in parts. The first buildings went up from 1997 to 1999. Riverwalk II came later, and the two Riverwalk II condos for sale are three-bedrooms. The townhomes were built in 2022 and list their own, lower fee.`) },

    { h2: "How much are condos at Riverwalk Myrtle Beach?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year ${SC.n} Riverwalk condos sold, from about ${r5k(SC.min)} to ${r5k(SC.max)}. The middle price was ${"$" + n(SC.median)}, and half the sales fell between about ${r5k(SC.p25)} and ${r5k(SC.p75)}.`) +
      h.p(`Which part of Riverwalk a condo is in changes the price. The table shows each part.`) +
      PARTS +
      `<p class="rw-note">Sales: Horry County deeds recorded in the past 12 months, condos only; deeds under $1,000 are transfers and are left out. Asking prices and fees: CCMLS listings on ${COUNT_DAY}, in aggregate. The fees are close to the amount listed, not exact. Sales are counted in small numbers, so the prices are about.</p>` +
      STRIP_UNDER +
      h.p(`If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) },

    { h2: "What is the HOA fee at Riverwalk?", toc: "HOA fee", id: "hoa", html: (bg) =>
      h.p(`The ${h.a("/hoa/fees-by-neighborhood/", "HOA")} fee at Riverwalk goes by the size of the condo. This is what the homes for sale list, with a year of fees beside each.`) +
      `<ul class="rw-rules"><li><strong>One-bedroom</strong>About $${FEE.b1} a month, ${r100(YEAR.b1)} a year</li><li><strong>Two-bedroom</strong>About $${FEE.b2} a month, ${r100(YEAR.b2)} a year</li><li><strong>Three-bedroom</strong>About $${FEE.b3} a month, ${r100(YEAR.b3)} a year</li></ul>` +
      h.p(`Every one of the ${L.api_total} listings says the fee covers trash and lawn care. Most also name pest control, water and sewer, and the building's insurance. Fewer name cable or internet, and none names the power bill.`) +
      h.p(`The yearly totals are before the power bill, your own condo insurance and property tax. Our ${h.a("/buyers/property-taxes/", "property tax page")} explains the two tax rates.`) +
      h.p(`The listing agent types the fee and what it covers, so the association's own budget is the real source. We get it first.`) +
      h.cta("Have us get Riverwalk's budget, rules and reserve study before you offer", "We ask the association for its budget, its rules and its reserve study, read them, and tell you what they show before you offer.", "Have us get the Riverwalk papers", CONTACT, bg) },

    { h2: "Was Riverwalk in a lawsuit?", toc: "The lawsuit", id: "lawsuit", html: () =>
      h.p(`Yes. The first buildings were built from 1997 to 1999. In 2003 the condo association sued the builder, and the builder had closed by then. A ${h.a(SRC.op4888, "trial")} began in January 2009, and in 2011 the Court of Appeals affirmed.`) +
      h.p(`We read both court opinions. In 2017 the state Supreme Court decided what the builder's insurer owed, in ${h.a(SRC.op27698, "its last ruling")}. The buildings still sell: ${SC.n} condos sold in the past year. Our ${h.a("/buyers/condo-in-litigation/", "condos in litigation page")} explains what a suit in a building's past means for a buyer.`) },

    { h2: "Is Riverwalk inside the City of Myrtle Beach?", toc: "City limits", id: "city", html: () =>
      h.p(`No. The mail says Myrtle Beach, but the county's map shows no city at Riverwalk. The land is outside the city limits, in Horry County, as ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} is.`) +
      h.p(`The county does not collect trash at the curb outside the towns. That makes the fee's trash line matter: it is on all ${FL.hoa_includes_trash} listings. Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers what changes inside the city.`) },

    { h2: "Is Riverwalk in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`We checked every condo's land against FEMA's map. It shows a high-risk strip along the water, the zone where a lender requires flood insurance. The strip touches the land of ${F.flood_condo_parcels.AE} of the ${CN.condo_units} condos. A lower-risk zone, the 0.2 percent chance zone, touches ${F.flood_condo_parcels["0.2"]} more. The rest touch neither.`) +
      h.p(`A zone touching the land does not put the building in it, and the map does not show a condo's own floor. We check each condo's zone first. Our pages on ${h.a("/buyers/coastal-insurance/", "coastal insurance")} and ${h.a("/buyers/flood-zone-check/", "checking a flood zone")} show what to ask.`) },

    { h2: "Can you rent a condo at Riverwalk?", toc: "Renting", id: "renting", html: (bg) =>
      h.p(`${FL.rentals_allowed} of the ${L.api_total} listings say rentals are allowed, and ${FL.str_allowed} say short-term rentals are allowed. The association's own rules and any minimum stay are the real source.`) +
      h.p(`The county taxes ${F.tax_status.taxed_6pct} of the ${CN.condo_units} condos at the 6 percent rate, the rate for a home the owner does not live in full time. It taxes ${F.tax_status.taxed_4pct_legal_residence} at the 4 percent rate for a home you live in. Our ${h.a("/invest/str-rules/", "short-term rental rules page")} and ${h.a("/invest/airbnb-income/", "Airbnb income page")} cover renting by the night.`) +
      h.cta("Have us get the rental rules and any minimum stay", "We ask the association what it allows, for how long and at what minimum stay, and tell you before you offer.", "Have us get Riverwalk's rental rules", CONTACT, bg) },

    { h2: "Condos near Riverwalk", toc: "Nearby", id: "nearby", html: () => h.p(`These condos are within a mile of the middle of Riverwalk. Riverwalk's own are included.`) + STRIP_NEAR + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest")} in Myrtle Beach, ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest and ${h.a("/submarkets/myrtle-beach/windsor-plantation/", "Windsor Plantation")} near Myrtle Beach. Then ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach, ${h.a("/submarkets/myrtle-beach/golf-and-yacht-club/", "Myrtle Beach Golf and Yacht Club")} and ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach. Then ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway and ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "Riverwalk at Arrowhead FAQ",
  faq: [
    { q: "Where is Riverwalk in Myrtle Beach?", a: `Riverwalk is on Riverwalk Drive, zip 29579, beside Arrowhead Country Club and the Intracoastal Waterway. It is about ${D.beach} minutes by car from the closest beach access with parking.` },
    { q: "Is this the Riverwalk in Conway?", a: `No. The Riverwalk in Conway follows the Waccamaw River in that city. This page is about the Riverwalk condos on Riverwalk Drive in Myrtle Beach.` },
    { q: "Are the Riverwalk townhomes the same community?", a: `The townhomes sit next to the condos but are a separate part, built in 2022. The townhomes for sale list a fee of about $${FEE.th} a month, lower than the condos'.` },
    { q: "Do Riverwalk condos accept FHA loans?", a: `Of the ${L.api_total} Riverwalk homes listed on ${COUNT_DAY}, ${FL.fha_accepted} say FHA is accepted, ${FL.va_accepted} say VA and ${FL.conventional_accepted} say conventional. Each condo is its own case, and our condos in litigation page explains the FHA rule for a building with a suit in its past.` },
    { q: "Do I need flood insurance at Riverwalk?", a: `A lender requires it only in FEMA's high-risk zone, which touches the land of ${F.flood_condo_parcels.AE} of the ${CN.condo_units} condos. We check the unit's own zone before you offer.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "Arrowhead Country Club", href: SRC.golf },
    { name: "Op. 4888", href: SRC.op4888 },
    { name: "Op. 27698", href: SRC.op27698 },
    { name: "trash pickup", href: SRC.swa },
    { name: "Conway", href: SRC.conway },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Riverwalk.",
    p: "Tell us the size you want and your budget. We line up the Riverwalk condos that fit, each with its fee, its flood zone and its sales history.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Riverwalk condos Myrtle Beach, Riverwalk at Arrowhead, Riverwalk Myrtle Beach SC, Riverwalk II Myrtle Beach, Riverwalk Townhomes at Arrowhead, Riverwalk condos HOA, Riverwalk Drive Myrtle Beach, Riverwalk condos for sale",
  about: "Riverwalk at Arrowhead, a condo community on Riverwalk Drive beside Arrowhead Country Club and the Intracoastal Waterway near Myrtle Beach, South Carolina",
});
