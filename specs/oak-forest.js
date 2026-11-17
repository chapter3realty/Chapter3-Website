/* /submarkets/myrtle-beach/oak-forest/ - Oak Forest, Myrtle Beach: what it costs to own a house there
 * (the typical sale, the yearly property tax, the HOA fee), which houses touch FEMA's high-risk flood zone,
 * what the houses sold for, the HOA and the recorded rules, the city limits, the drives, and which Oak Forest it is.
 *
 * Batch 2026-11-e, Lane N (new page). Built like /submarkets/myrtle-beach/plantation-point/ (specs/plantation-point.js):
 * the answer first, one block width of 720 px, plain lists under thin rules, one card style for the offers and the
 * chart frame, live homes strips from the site's own search, sources, a short FAQ.
 * Facts: Blog-Brain batches/2026-11-e/oak-forest/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's values
 * and wording only (VERIFY.md). Not used: "$26" (row 14: the fee is $30), "backs onto the US 17 Bypass" (row 5),
 * "Socastee side" (row 2), "free beach parking" (row 22), any search count (row 24), "14 houses sold" (row 11:
 * 14 recorded sales on 13 houses), the by-zone lot counts that change with the point used (rows 19 and 25),
 * the county value (gap 6), any word about water access (gap 5), who lives here, schools, crime, safety.
 * Data: data/2026-11-e/oak-forest/. Every count, size, price, share and minute is read from those files here and
 * checked against its ledger row. map-layers.json is drawn by map_layers.py from the county cache.
 * Pictures: one map we drew from Horry County parcels, building outlines, FEMA's flood zones and the Census road
 * lines; one USDA NAIP aerial (public domain). Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/oak-forest/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "oak-forest");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-layers.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`oak-forest.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const A = F.all, SA = F.sales.houses;
/* Rows 2 and 3 (CORRECTED): 185 houses; 3 parcels with no house (a fourth common parcel, the detention pond, is not in the cache). */
must(A.houses === 185 && A.vacant_lots === 3 && A.parcels === 188, "rows 2 and 3 changed");
must(A.streets["TEMPERANCE DR"] === 105 && A.streets["MORLYNN DR"] === 44 && A.streets["TRIUMPH DR"] === 35, "row 2 streets changed");
/* Row 6: lots about 6,300 square feet. Row 7: about 1,900 under roof. */
must(A.lot_sqft.median === 6323 && A.house_footprint_sqft.median === 1871, "rows 6 and 7 changed");
const LOT = n(Math.round(A.lot_sqft.median / 100) * 100), ROOF = n(Math.round(A.house_footprint_sqft.median / 100) * 100);
must(LOT === "6,300" && ROOF === "1,900", "rows 6 and 7 rounding changed");
/* Row 9: 3 of 185 houses have an in-ground pool. */
must(A.pools === 3, "row 9 changed");
/* Row 11 (CORRECTED): 14 recorded sales with a stated price, middle $258,000, middle half $253,750 to $281,875. */
must(SA.count === 14 && SA.prices.median === 258000 && SA.prices.q1 === 253750 && SA.prices.q3 === 281875 && F.sales.lots.count === 0, "row 11 changed");
const MED = SA.prices.median, Q1 = r1k(SA.prices.q1), Q3 = r1k(SA.prices.q3);
/* Rows 8 and 10: 3 houses for sale on the pull day, $242,500 to $275,000, 3 to 4 bedrooms, built 1998 to 2014. */
must(L.for_sale === 3 && L.list_price.min === 242500 && L.list_price.max === 275000 && L.beds[0] === 3 && L.beds[2] === 4 && L.year_built[0] === 1998 && L.year_built[2] === 2014, "rows 8 and 10 changed");
/* Row 14 (CORRECTED): $30 a month on the three homes for sale; none at $25 or less. */
must(L.homes_at_or_under_fee["30"] === 3 && L.homes_at_or_under_fee["25"] === 0, "row 14 changed");
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Row 15 (VERIFIED): tax on a house bought at the typical price. 4%: 91.9 mills; 6%: 201.0 mills; flat fee $89.40. */
const FEE = 89.40, T4 = MED * 0.04, T6 = MED * 0.06;
const TAX_PRIMARY = T4 * (201.0 - 109.1) / 1000 + FEE, TAX_OTHER = T6 * 201.0 / 1000 + FEE;
const r10 = (v) => Math.round(v / 10) * 10;
must(r10(TAX_PRIMARY) === 1040 && r10(TAX_OTHER) === 3200, "row 15 changed");
/* Row 17: 135 of 185 houses are taxed as an owner's primary residence. */
must(A.assessed_at_4pct_legal_residence === 135 && A.assessed_at_6pct === 50, "row 17 changed");
/* Row 4 (VERIFIED): no lot inside the city. */
must(A.in_city_limits === 0, "row 4 changed");
/* Row 19 (CORRECTED): 38 lots touch the high-risk zone; 29 houses have a roof outline that touches it: 17, 12, 0. */
must(A.lot_touches_high_risk_zone === 38 && A.house_footprint_touches_high_risk_zone === 29 && ML.counts.touch === 29 && ML.counts.house === 156 && ML.counts.open === 3, "row 19 changed");
const XS = F.extra.houses_touching_high_risk_by_street;
must(XS["TEMPERANCE DR"] === 17 && XS["MORLYNN DR"] === 12 && !XS["TRIUMPH DR"], "row 19 streets changed");
/* Row 21: drives, no traffic. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const DD = DR.drives["Oak Forest (middle)"];
const mins = (m) => (m < 15 ? Math.round(m) : Math.round(m / 5) * 5);
const D = {
  beach: mins(DD["nearest public beach access"].minutes), beachMiles: Math.round(DD["nearest public beach access"].miles * 10) / 10,
  airport: mins(DD["Myrtle Beach International Airport terminal"].minutes), broadway: mins(DD["Broadway at the Beach"].minutes),
  mall: mins(DD["Coastal Grand Mall"].minutes), hosp: mins(DD["Grand Strand Medical Center"].minutes),
  mc: mins(DD["The Market Common"].minutes),
};
const COSTCO = mins(DD["Costco (county parcel legal description OAK FOREST; COSTCO)"].minutes);
must(D.beach === 12 && D.beachMiles === 4.6 && D.airport === 12 && D.broadway === 13 && D.mall === 10 && D.hosp === 20 && D.mc === 8 && COSTCO === 10, "rows 21 changed");
must(Math.round(DD["walk to that access"].minutes / 10) === 9, "row 21 walk changed");
/* The map: the same counts as row 19. */
must(ML.lots.length === 188, "map layers do not match the rows");


/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the pilot's, plus the map's two-column place on a wide screen). */

const INK = "#8a5226";
const C = { land: "#eef0e4", lot: "#ffffff", lotEdge: "#b9b2a5", open: "#d3e6c4", touch: "#f0a35c", touchEdge: "#9a5a1c",
  ae: "#2f6f8f", aeEdge: "#1f4f68", shaded: "#a9cfe3", shadedEdge: "#5f93b0", road: "#ffffff", roadEdge: "#9c9486" };
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
main#main svg.pp-map text{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#1c2028;paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-linejoin:round;font-size:30px;stroke-width:7px}
main#main svg.pp-map text.sm{font-weight:600;font-size:27px}
main#main .of-fig{display:grid;gap:.2rem 1.4rem;max-width:720px}
main#main .of-fig .pp-frame{max-width:420px}
@media (min-width:700px){main#main .of-fig{grid-template-columns:minmax(0,340px) minmax(0,1fr);align-items:start}main#main .of-fig .pp-frame{max-width:none}main#main .of-fig .pp-legend{grid-template-columns:1fr}}
</style>`;

/* Street and road names on the map: each sits on a straight stretch of its street, turned to follow it (map_layers.py picks two points). */
const MAPLABELS = (lab, P2) => {
  const out = [];
  for (const [k, name] of [["US 17 BYP", "US 17 Bypass"], ["TEMPERANCE DR", "Temperance Dr"], ["MORLYNN DR", "Morlynn Dr"], ["TRIUMPH DR", "Triumph Dr"]]) {
    const [p, q] = ML.labels[k].map((pt) => P2(pt)); let rot = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
    if (rot > 90) rot -= 180; if (rot < -90) rot += 180;
    out.push(lab(name, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, { cls: "sm", rot: f1(rot) }));
  }
  return out.join("");
};

/* ---------------------------------------------------------------------------- */
/* The map: every lot, with the houses that touch the high-risk zone in orange (row 19), from map-layers.json. */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const [W0, S0, E0, N0] = ML.frame, MW = 700, MH = Math.round(MW * (my(N0) - my(S0)) / (mx(E0) - mx(W0)));
const P = (lo, la) => [(mx(lo) - mx(W0)) / (mx(E0) - mx(W0)) * MW, (my(N0) - my(la)) / (my(N0) - my(S0)) * MH];
const f1 = (v) => Math.round(v * 10) / 10;
const ringD = (r) => "M" + r.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L") + "Z";
const lineD = (pts) => "M" + pts.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L");

const MAP = (() => {
  const by = (k) => ML.lots.filter((l) => l.k === k).map((l) => ringD(l.r)).join("");
  const lots = `<path d="${by("house")}" fill="${C.lot}" fill-opacity=".55" stroke="${C.lotEdge}" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="${by("open")}" fill="${C.open}" fill-opacity=".8" stroke="${C.lotEdge}" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="${by("touch")}" fill="${C.touch}" stroke="${C.touchEdge}" stroke-width="1.4" stroke-linejoin="round"/>`;
  const shaded = ML.shaded.map(ringD).join(""), ae = ML.ae.map(ringD).join("");
  const byp = ML.roads.filter((r) => r.r === "US 17 BYP").map((r) => lineD(r.p)).join("");
  const lab = (t, x, y, o = {}) => `<text${o.cls ? ` class="${o.cls}"` : ""} x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x)} ${f1(y)})"` : ""}>${t}</text>`;
  const svg = `<svg class="pp-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" role="img" aria-labelledby="of-map-t">`
    + `<title id="of-map-t">Map of Oak Forest in Myrtle Beach, drawn lot by lot. A strip of FEMA's high-risk flood zone, in blue, crosses the neighborhood. The ${ML.counts.touch} houses whose roof outline touches it are orange: 17 on Temperance Drive and 12 on Morlynn Drive. No house on Triumph Drive touches it.</title>`
    + `<rect width="${MW}" height="${MH}" fill="${C.land}"/>`
    + `<path d="${byp}" fill="none" stroke="${C.roadEdge}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="${byp}" fill="none" stroke="${C.road}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${shaded}" fill="${C.shaded}" fill-opacity=".6" stroke="${C.shadedEdge}" stroke-width="1" stroke-dasharray="5 4"/>`
    + `<path d="${ae}" fill="${C.ae}" fill-opacity=".55" stroke="${C.aeEdge}" stroke-width="1.5"/>`
    + lots
    + MAPLABELS(lab, (pt) => P(...pt))
    + `</svg>`;
  const key = `<ul class="pp-legend">`
    + `<li><i style="background:${C.touch};border-color:${C.touchEdge}"></i>${ML.counts.touch} houses whose roof outline touches the high-risk zone</li>`
    + `<li><i style="background:${C.ae};opacity:.7"></i>FEMA high-risk flood zone</li>`
    + `<li><i style="background:${C.shaded};opacity:.8;border-style:dashed"></i>FEMA shaded zone, a 1 in 500 yearly chance</li>`
    + `<li><i style="background:${C.lot}"></i>Other lots: ${ML.counts.house} houses and ${ML.counts.open} shared parcels</li></ul>`;
  return `<figure class="pp-fig of-fig"><div class="pp-frame">${svg}</div><div>${key}<figcaption>Every lot in Oak Forest, drawn from Horry County parcels and building outlines. Flood zones: FEMA. Roads: U.S. Census Bureau TIGER/Line. Map: Chapter3 Realty.</figcaption></div></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain).                              */

const AIR = PHOTOS.find((r) => r.file.includes("oak-forest-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Part of Oak Forest from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The cost to own (rows 11, 15): the two tax cases side by side.                  */

const NB = "&nbsp;";
const TAXT = `<div class="pp-cmp">` + h.table(["", "Your full-time home", "Second home or rental"], [
  ["Counted at", `4%${NB}=${NB}$${n(T4)}`, `6%${NB}=${NB}$${n(T6)}`],
  ["Tax on each $1", `9.19${NB}cents`, `20.1${NB}cents`],
  ["Tax a year, with the fee", `about $${n(r10(TAX_PRIMARY))}`, `about $${n(r10(TAX_OTHER))}`],
]) + `</div>`;

/* ---------------------------------------------------------------------------- */
/* The drives (row 21): one chart, minutes by car with no traffic.                 */

const DRIVES = G.bars([
  { name: "The Market Common", value: D.mc },
  { name: "Coastal Grand Mall", value: D.mall },
  { name: "Costco", value: COSTCO },
  { name: "The beach", value: D.beach },
  { name: "Myrtle Beach International Airport", value: D.airport },
  { name: "Broadway at the Beach", value: D.broadway },
  { name: "Grand Strand Medical Center", value: D.hosp },
].map((r) => Object.assign(r, { valueText: `${r.value} min` })), {
  caption: "Minutes by car from the middle of Oak Forest",
  nameLabel: "Place", valueLabel: "By car, about", compact: true,
  note: `With no traffic. The beach is the nearest public beach access, about ${D.beachMiles} miles away. On foot it is about an hour and a half. Routes on OpenStreetMap roads.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  swa: "https://www.solidwasteauthority.org/recyclingcenters.html",
  swaRes: "https://www.solidwasteauthority.org/residential.html",
  decal: "https://cityofmyrtlebeach.com/i_want_to/apply_for/resident_parking_decal.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  osm: "https://www.openstreetmap.org/",
};

const CONTACT = `/contact/?place=${encodeURIComponent("Oak Forest")}`;
const SEARCH = "/homes/?subdivision=Oak%20Forest";

/* The place, for search engines: a Place with its point and the town it is in. */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Oak Forest", alternateName: "Oak Forest, Myrtle Beach",
  description: `A neighborhood of ${A.houses} detached houses on small lots near the US 17 Bypass, in unincorporated Horry County with Myrtle Beach mailing addresses.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center[0], longitude: F.center[1] },
  address: { "@type": "PostalAddress", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
})}</script>`;


module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "Oak Forest Homes for Sale in Myrtle Beach: HOA, Tax, Flood",
  description: "Oak Forest in Myrtle Beach: 185 houses by the US 17 Bypass. What homes sold for, the HOA fee, the property tax a year, and which houses touch the flood zone.",
  ogTitle: "Oak Forest homes in Myrtle Beach: about $258,000, and about $1,040 a year in tax",
  crumb: "Oak Forest",
  eyebrow: "Oak Forest, Myrtle Beach",
  h1: "Oak Forest homes in Myrtle Beach:",
  h1em: "what a house costs to own, and which houses touch the flood zone.",
  sub: `Oak Forest is 185 detached houses on small lots beside the Highway 17 Bypass, with one street where no house touches FEMA's high-risk flood zone.`,
  heroMedia: CSS + glance([
    { icon: "home", label: "Houses", text: n(A.houses) },
    { icon: "dollar", label: "Typical sale", text: `About $${n(MED)}` },
    { icon: "tax", label: "Property tax a year", text: `About $${n(r10(TAX_PRIMARY))}` },
    { icon: "flood", label: "Touch the flood zone", text: `${A.house_footprint_touches_high_risk_zone} houses` },
  ]),
  /* The live homes strip is the first call to action (the lead's feed at the top); a button to /homes/ fails the audit. */
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Oak Forest is a neighborhood of ${A.houses} detached houses on small lots on the south side of Myrtle Beach, close to the US 17 Bypass and Socastee Boulevard. The land is outside the city limits, in Horry County.`,
    `The homes for sale come first below. After them: what houses sold for, the yearly tax, the flood map, the HOA and the drives.`,
  ],
  sections: [
    { h2: "What is Oak Forest, and where is it?", toc: "What it is", id: "what", html: () =>
      `<div id="homes"></div>` + G.homesCss() + G.homesQScript() +
      G.homesQ("subdivision=Oak+Forest", "Homes for sale in Oak Forest") +
      h.p(`The mail says Myrtle Beach and the ZIP code is 29577. ${h.a(SRC.osm, "OpenStreetMap")} calls the area Back Gate.`) +
      h.p(`Three streets, Temperance, Morlynn and Triumph Drive, hold nearly every lot.`) +
      AERIAL +
      h.p(`A typical lot is about ${LOT} square feet. A typical house is about ${ROOF} square feet under roof, and that counts the garage.`) +
      h.p(`Oak Forest Lane, where Costco and Best Buy stand, is a different place with the same name. It is a shopping area a few miles away, not part of this neighborhood.`) },

    { h2: "What do homes in Oak Forest sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year the county recorded ${SA.count} sales of Oak Forest houses with a stated price. The middle price was about $${n(MED)}, and half of them sold for ${Q1} to ${Q3}.`) +
      h.p(`On ${COUNT_DAY}, ${L.for_sale} houses were for sale here, asking $${n(L.list_price.min)} to $${n(L.list_price.max)}. All three are detached, with 3 or 4 bedrooms.`) +
      `<p class="pp-note">Sale prices: Horry County deeds recorded in the past 12 months. Asking prices: CCMLS listings, counted in aggregate.</p>` +
      G.homesQ("type=house&near=33.67669,-78.96186&miles=2&max=300000", "Houses under $300,000 near Oak Forest") +
      h.p(`If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) },

    { h2: "What does it cost to own a house in Oak Forest?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a house bought at the typical price, $${n(MED)}. Besides the mortgage and ${h.a("/buyers/coastal-insurance/", "insurance")}, the property tax is about $${n(r10(TAX_PRIMARY))} a year if it is your full-time home. As a second home or a rental it is about $${n(r10(TAX_OTHER))} a year.`) +
      TAXT +
      `<p class="pp-note">The county counts 4% of the price for an owner's primary residence and 6% for any other home. It then applies its 2026 tax rate and adds a flat fee of about $90. Our ${h.a("/buyers/property-taxes/", "property taxes guide")} explains each step.</p>` +
      h.p(`We checked this arithmetic against 13 real 2026 tax bills for Oak Forest houses. It matched 11 to the cent. The other two were lower, so some owners pay less. Owners who bought years ago often do: the full-time-home bills we read ran from about $370 to about $1,110 a year.`) +
      h.p(`The ${h.a("/hoa/fees-by-neighborhood/", "HOA fee")} on the three homes for sale is $30 a month. The listings do not say what it covers, so before you offer, we ask the association.`) },

    { h2: "Is Oak Forest in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`Part of it is. FEMA's map puts a strip of its high-risk zone across the neighborhood, the zone where a lender requires flood insurance. The roof outlines of ${A.house_footprint_touches_high_risk_zone} of the ${A.houses} houses touch it: ${XS["TEMPERANCE DR"]} on Temperance Drive and ${XS["MORLYNN DR"]} on Morlynn Drive. On Triumph Drive, no house touches it.`) +
      MAP +
      h.p(`FEMA also shades a wider zone with a 1 in 500 chance of flooding each year. Our ${h.a("/buyers/flood-zone-check/", "flood zone check guide")} explains both.`) +
      h.p(`A zone does not show whether a house has flooded. We check each house's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.`) +
      h.cta("Like a house here? Have us check its flood history", "Send us the listing. We check its flood zone and its flood history, and tell you what we find.", "Have us check a house", CONTACT, bg) },

    { h2: "Does Oak Forest have an HOA, and what are its rules?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p(`Yes. The association is Oak Forest Homeowners Association Inc, and the ${h.a("#homes", "Oak Forest homes for sale")} each list a fee of $30 a month. We do not yet know what that fee covers.`) +
      `<ul class="pp-rules one" aria-label="The HOA and the neighborhood's rules">`
        + `<li><strong>The recorded rules</strong>Four recorded documents are indexed under the Oak Forest names. They are the restrictions of 1988, added rules in 1998, bylaws in 2022, and rules and bylaws in August 2026. The county's index is online, but the documents can only be read at the Register of Deeds in Conway. We pull them for the house you like.</li>`
        + `<li><strong>The fee</strong>The listing agent enters the fee, so we confirm it, and what it covers, with the association.</li>`
        + `<li><strong>Renting</strong>County zoning has no limit on how long a home outside the towns may be rented. A neighborhood's recorded rules can have one. Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers renting by the night.</li>`
        + `</ul>` +
      h.cta("Like a house? Have us pull its HOA papers", "We read the recorded rules and the HOA papers for that house, and tell you what they allow before you offer.", "Have us pull the papers", CONTACT, bg) },

    { h2: "Is Oak Forest inside the City of Myrtle Beach?", toc: "City limits", id: "city", html: () =>
      h.p(`No. The mail says Myrtle Beach, but the land is outside the city limits, in Horry County. Three things change for an owner:`) +
      `<ul class="pp-rules one" aria-label="What being outside the city limits changes">`
        + `<li><strong>Property tax</strong>The bills we read show county and school tax and no city tax. The yearly figures above already count that.</li>`
        + `<li><strong>Trash</strong>The county does not collect trash at the curb. Owners hire a private hauler or use a county recycling and convenience center. The county's 25 centers are open only to residents outside the towns.</li>`
        + `<li><strong>City parking decal</strong>The city's resident parking decal is only for cars kept inside the city limits that pay city vehicle tax. Oak Forest owners do not qualify.</li>`
        + `</ul>` +
      h.p(`Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city's own neighborhoods and what changes inside its limits.`) },

    { h2: "How far is Oak Forest from the beach, Costco and the airport?", toc: "Drives", id: "drives", html: () =>
      h.p(`Everything on this list is a drive. The beach is too far to walk, about an hour and a half on foot. ${h.a("/submarkets/myrtle-beach/market-common/", "The Market Common")}, Coastal Grand Mall and Costco are the closest of the places below.`) +
      DRIVES +
      G.homesQ("near=33.67669,-78.96186&miles=1", "Homes within a mile of Oak Forest") + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach, ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest and ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach. Then ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway, ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} in Myrtle Beach. Then ${h.a("/submarkets/north-myrtle-beach/briarcliffe-acres/", "the town of Briarcliffe Acres")} and ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "Oak Forest FAQ",
  faq: [
    { q: "Is Oak Forest the same as Oak Forest Lane?", a: "No. Oak Forest Lane is the Costco and Best Buy shopping area, a few miles from these houses. The Oak Forest neighborhood has three streets: Temperance, Morlynn and Triumph Drive." },
    { q: "Does Oak Forest have a pool or a clubhouse?", a: `Few houses have a pool: the county's building map shows an in-ground pool at ${A.pools} of the ${A.houses}. The shared parcels the county lists carry names like Tract C and Open Space. None is named for a clubhouse or a pool.` },
    { q: "How old are the houses in Oak Forest?", a: "The three houses for sale were built in 1998, 1999 and 2014. The county's public map has no year built, so we cannot give the age of the rest." },
    { q: "Can I rent out a house in Oak Forest?", a: "County zoning has no limit on how long a home here may be rented. The recorded rules can have one, so we pull them for the house you pick." },
    { q: "Do I need flood insurance in Oak Forest?", a: `A lender requires it on a house in FEMA's high-risk zone. In Oak Forest, ${A.house_footprint_touches_high_risk_zone} houses have a roof outline that touches the zone. We check the zone and the flood history of the house you like before you offer.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "tax levy", href: SRC.levy },
    { name: "trash pickup", href: SRC.swaRes },
    { name: "recycling centers", href: SRC.swa },
    { name: "parking decal", href: SRC.decal },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, building outlines, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "See an Oak Forest house in person.",
    p: "Pick a house from the homes above. We check its flood zone, its HOA papers and its yearly tax before you offer.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Oak Forest Myrtle Beach, Oak Forest homes for sale, Oak Forest Myrtle Beach SC, Oak Forest subdivision Myrtle Beach, Oak Forest HOA, Oak Forest flood zone, Oak Forest property tax, Oak Forest Temperance Drive, Oak Forest Morlynn Drive",
  about: "Oak Forest, a neighborhood of detached houses near the US 17 Bypass in Myrtle Beach, South Carolina",
});
