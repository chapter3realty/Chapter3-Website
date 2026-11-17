/* /submarkets/north-myrtle-beach/briarcliffe-acres/ - Briarcliffe Acres, SC: a small town of about 250 houses on lots
 * of about an acre, two lakes and a dune beach with no motor vehicles; what houses sold for, the tax, the six-month
 * rental rule, the association and the cabana, the flood map, the beach.
 *
 * Batch 2026-11-e, Lane N (new page), built like specs/plantation-point.js (the owner's pilot): the answer first, one
 * block width of 720 px, plain lists under thin rules, our own map, one aerial, live strips for the homes, two offers.
 * Facts: Blog-Brain batches/2026-11-e/briarcliffe-acres/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * values and wording only (VERIFY.md; struck wording in batches/2026-11-e/facts/briarcliffe-acres-struck.json).
 * Corrections used here: row 7 (nearest house about 650 feet, middle house about 0.56 mile; the ledger's 570 ft, 30 and
 * 129 are NOT printed), row 4 ("about 250 houses"; the 12 empty lots are not printed), row 24 (most houses are on septic),
 * row 27 (22 street names; not printed), row 21 (boat rule), row 19 (Kuester struck), row 18 (no HOA figure printed),
 * row 16 ("about 4 in 5"), row 13 (not used), row 15 (county value, not used), row 3 (north border only).
 * Data: data/2026-11-e/briarcliffe-acres/ (findings.json, listings.json, drives.json, map-layers.json, photos.json).
 * Picture: one map we drew from Horry County parcels and Census lines, and one public domain aerial. No ground photo:
 * the shot list for the photo partner is in BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/north-myrtle-beach/briarcliffe-acres/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "briarcliffe-acres");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-layers.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const mil = (v) => "$" + (Math.round(v / 10000) / 100).toString() + " million";
const must = (ok, msg) => { if (!ok) throw new Error(`briarcliffe-acres.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const HO = F.houses, SA = F.sales;
/* Row 4: 250 houses (the page says "about 250"). */
must(HO.houses === 250, "row 4 changed");
/* Row 5: lots about an acre (median 0.97), 102 of 250 on an acre or more, the smallest about a quarter acre. */
must(HO.lot_sqft.median === 42121.5 && HO.lot_sqft.min === 10708 && Math.round(HO.lot_sqft.median / 43560 * 100) === 97 && Math.round(HO.lot_sqft.min / 43560 * 100) === 25, "row 5 changed");
const ACRE_PLUS = 102;                                                           // row 5, VERIFY: recomputed from the cache
/* Row 7 (CORRECTED by the verifier, not the ledger's first run): the nearest house is 198 m (about 650 feet) from the
   coastline, the middle house 908 m (about 0.56 mile). No house touches the beach. */
must(F.oceanfront.houses === 0, "row 7: an oceanfront house appeared");
const NEAREST_FT = Math.round(198 * 3.28084 / 50) * 50, MID_MI = 908 / 1609.344;
must(NEAREST_FT === 650 && MID_MI > 0.55 && MID_MI < 0.58, "row 7 corrected distances changed");
/* Row 11: two ponds of about 10.3 acres (the plan). */
/* Row 12: 76 of 250 houses have an in-ground pool (a floor). */
must(HO.pools === 76, "row 12 changed");
/* Row 14: 9 house sales, middle $1,175,000, $815,000 to $4,650,000; one empty lot sold for $800,000. */
const HS = SA.houses;
must(HS.count === 9 && HS.prices.median === 1175000 && HS.prices.min === 815000 && HS.prices.max === 4650000, "row 14 changed");
must(SA.all_town.prices.min === 800000 && SA.all_town.count === 10, "row 14 lot sale changed");
const LOT_SALE = 800000;
/* Row 16: 197 of 250 at the 4% rate; the verifier says "about 4 in 5". */
must(Math.round(HO.legal_residence_4pct / HO.houses * 10) === 8, "row 16 changed");
/* Row 17: the levy. Tax at the typical sale price: 4%: (219.2 - 109.1) mills; 6%: 219.2 mills; a flat fee of $89.40. */
const SALE_MID = HS.prices.median;
const TAX_PRIMARY = SALE_MID * 0.04 * (219.2 - 109.1) / 1000 + 89.4, TAX_OTHER = SALE_MID * 0.06 * 219.2 / 1000 + 89.4;
must(Math.round(TAX_PRIMARY) === 5264 && Math.round(TAX_OTHER) === 15543, "row 17 arithmetic changed");
const TP = n(Math.round(TAX_PRIMARY / 100) * 100), TO = n(Math.round(TAX_OTHER / 100) * 100);
/* Row 18: 2 houses for sale, $874,900 and $1,050,000. */
must(L.for_sale_inside_town === 2 && L.subdivision_search_total === 2, "row 18 changed: the town's own search has 3 or more homes? give it a strip");
const FS = L.list_price.slice().sort((a, b) => a - b);
must(FS[0] === 874900 && FS[1] === 1050000, "row 18 prices changed");
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Row 22: flood. */
must(F.flood_zone_at_lot_center["outside mapped zones (X)"] === 221 && F.flood_zone_at_lot_center.AE === 24 && F.house_outline_touches_high_risk === 23, "row 22 changed");
/* Row 23: drives, no traffic. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const BD = DR.drives["Briarcliffe Acres (middle of the houses)"];
const mins = (m) => (m < 15 ? Math.round(m) : Math.round(m / 5) * 5);
const D = {
  beach: mins(BD["nearest public beach access"].minutes), beachMiles: Math.round(BD["nearest public beach access"].miles * 10) / 10,
  walk: Math.round(BD["walk to that access"].minutes / 5) * 5,
  barefoot: mins(BD["Barefoot Landing"].minutes), hospital: mins(BD["Grand Strand Medical Center"].minutes),
  broadway: mins(BD["Broadway at the Beach"].minutes), mall: mins(BD["Coastal Grand Mall"].minutes), airport: mins(BD["Myrtle Beach International Airport terminal"].minutes),
};
must(D.beach === 6 && D.beachMiles === 2.1 && D.walk === 45 && D.barefoot === 5 && D.hospital === 11 && D.broadway === 20 && D.mall === 20 && D.airport === 25, "row 23 changed");
/* The map: the same counts as the data. */
must(ML.counts.lake === 39 && ML.counts.plain === 223 && ML.lots.length === 262 && ML.lakes.length === 3, "map layers changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const INK = "#8a5226";
const C = { land: "#eef0e4", water: "#a9cfe3", waterEdge: "#7fb3cf", lot: "#ffffff", lotEdge: "#b9b2a5", lakeLot: "#2f6f8f", road: "#ffffff", roadEdge: "#9c9486", town: "#8a5226" };
const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:${INK}!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .ba-fig{margin:1.4rem 0 1.6rem;max-width:720px}
main#main .ba-fig figcaption{color:var(--muted);font-size:.92rem;line-height:1.55;margin-top:.6rem}
main#main .ba-fig h4{margin:0 0 .5rem;font-size:1.05rem;color:var(--navy)}
main#main .ba-frame{border-radius:14px;overflow:hidden;background:${C.land};border:1px solid rgba(28,32,40,.12)}
main#main .ba-frame svg{display:block;width:100%;height:auto}
main#main svg.ba-map text{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#1c2028;paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-linejoin:round;font-size:44px;stroke-width:10px}
main#main svg.ba-map text.it{font-style:italic;font-weight:600;fill:#1f4f68}
main#main svg.ba-map text.sm{font-weight:600;font-size:38px}
@media (min-width:700px){main#main svg.ba-map text{font-size:25px;stroke-width:6px}main#main svg.ba-map text.sm{font-size:22px}}
main#main .ba-legend{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.4rem;font-size:1rem;color:var(--muted);line-height:1.4}
@media (min-width:700px){main#main .ba-legend{grid-template-columns:1fr 1fr;column-gap:1.5rem}}
main#main .ba-legend li{display:flex;gap:.6rem;align-items:center;margin:0}
main#main .ba-legend i{flex:none;display:inline-block;width:1.5rem;height:1rem;border-radius:3px;border:1px solid rgba(28,32,40,.25)}
main#main .ba-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
@media (min-width:700px){main#main .ba-rules:not(.one){grid-template-columns:1fr 1fr}}
main#main .ba-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .ba-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main .c3-gchart,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .ba-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.6rem 0 1.4rem}
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
/* The map: every lot, the lakes, the town line, US 17 and the coast, from map-layers.json (no PIN, owner or address). */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const [W0, S0, E0, N0] = ML.frame, MW = 1000, MH = Math.round(MW * (my(N0) - my(S0)) / (mx(E0) - mx(W0)));
const P = (lo, la) => [(mx(lo) - mx(W0)) / (mx(E0) - mx(W0)) * MW, (my(N0) - my(la)) / (my(N0) - my(S0)) * MH];
const f1 = (v) => Math.round(v * 10) / 10;
const ringD = (r) => "M" + r.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L") + "Z";
const lineD = (pts) => "M" + pts.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L");

const MAP = (() => {
  const by = (k) => ML.lots.filter((l) => l.k === k).map((l) => l.r.map(ringD).join("")).join("");
  const lots = `<path d="${by("plain")}" fill="${C.lot}" stroke="${C.lotEdge}" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="${by("lake")}" fill="${C.lakeLot}" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>`;
  const lakes = ML.lakes.map(ringD).join("");
  const town = ML.town.map(ringD).join("");
  const roads = ML.roads.map((r) => lineD(r.p)).join("");
  const coast = ML.coast[0];
  /* The ocean: the coast line, then well past the frame to the southeast. */
  const ocean = "M" + coast.map(([lo, la]) => P(lo, la).map(f1).join(" ")).join("L") + `L${P(E0 + 0.02, coast[coast.length - 1][1]).map(f1).join(" ")}L${P(E0 + 0.02, S0 - 0.02).map(f1).join(" ")}L${P(coast[0][0], S0 - 0.02).map(f1).join(" ")}Z`;
  const lab = (t, x, y, o = {}) => `<text${o.cls ? ` class="${o.cls}"` : ""} x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x)} ${f1(y)})"` : ""}>${t}</text>`;
  const svg = `<svg class="ba-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" role="img" aria-labelledby="ba-map-t">`
    + `<title id="ba-map-t">Map of Briarcliffe Acres. US 17 runs along the top left, the Atlantic Ocean lies at the lower right, and between them the town's lots sit on curving streets. The two lakes are in the middle, with the lots beside them in dark blue.</title>`
    + `<rect width="${MW}" height="${MH}" fill="${C.land}"/>`
    + `<path d="${ocean}" fill="${C.water}" stroke="${C.waterEdge}" stroke-width="2"/>`
    + `<path d="${roads}" fill="none" stroke="${C.roadEdge}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="${roads}" fill="none" stroke="${C.road}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
    + lots
    + `<path d="${lakes}" fill="${C.water}" stroke="${C.waterEdge}" stroke-width="2" stroke-linejoin="round"/>`
    + `<path d="${town}" fill="none" stroke="${C.town}" stroke-width="3" stroke-dasharray="14 8" stroke-linejoin="round"/>`
    + `@@LABELS@@`
    + `</svg>`;
  const key = `<ul class="ba-legend">`
    + `<li><i style="background:${C.lakeLot}"></i>Lots beside a lake: ${ML.counts.lake}</li>`
    + `<li><i style="background:${C.lot}"></i>Other lots: ${ML.counts.plain}</li>`
    + `<li><i style="background:none;border:2px dashed ${C.town}"></i>The town line</li></ul>`;
  return { svg, key, lab, P };
})();
const LABELS = (() => {
  const { lab } = MAP;
  return lab("US 17", 190, 135, { cls: "sm", rot: -18 })
    + lab("Atlantic Ocean", 800, 610, { cls: "it" })
    + lab("Lakes", 540, 425, { cls: "sm" });
})();
const MAPHTML = `<figure class="ba-fig"><h4>Where the lakes and the beach are</h4><div class="ba-frame">${MAP.svg.replace("@@LABELS@@", LABELS)}</div>${MAP.key}<figcaption>Every lot in Briarcliffe Acres. Lots: Horry County parcels. Roads and shore: U.S. Census Bureau TIGER/Line. Map: Chapter3 Realty.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain): the lake, the acre lots, the marsh and the dunes (rows 5, 8, 11). */

const AIR = PHOTOS.find((r) => r.file.includes("briarcliffe-acres-lakes-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Part of Briarcliffe Acres from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The drives (row 23): one chart, minutes by car with no traffic.                 */

const DRIVES = G.bars([
  { name: "Barefoot Landing", value: D.barefoot },
  { name: "The nearest public beach access", value: D.beach },
  { name: "Grand Strand Medical Center", value: D.hospital },
  { name: "Broadway at the Beach", value: D.broadway },
  { name: "Coastal Grand Mall", value: D.mall },
  { name: "Myrtle Beach International Airport", value: D.airport },
].map((r) => Object.assign(r, { valueText: `${r.value} min` })), {
  caption: "Minutes by car from the middle of Briarcliffe Acres",
  nameLabel: "Place", valueLabel: "By car, about", compact: true,
  note: `With no traffic. Routes on OpenStreetMap roads.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  code: "https://www.municode.com/library/sc/briarcliffe_acres/codes/code_of_ordinances",
  plan: "https://www.townofbriarcliffe.us/s/118006-Briarcliffe-Book-2025-Complete-Book.pdf",
  town: "https://www.townofbriarcliffe.us/",
  handout: "https://www.townofbriarcliffe.us/s/draft-handout-Briarcliffe-beach-no-motor-vehicles.pdf",
  fema: "https://msc.fema.gov/portal/home",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  access: "https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0",
  osm: "https://www.openstreetmap.org/",
};

const CONTACT = `/contact/?place=${encodeURIComponent("Briarcliffe Acres")}`;
const TOWN_HOMES = "/homes/?subdivision=Briarcliffe%20Acres";
const CENTER = "near=33.79068,-78.75036";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Briarcliffe Acres", alternateName: "Town of Briarcliffe Acres",
  description: "A small incorporated town in Horry County, South Carolina, next to North Myrtle Beach, of about 250 houses on lots of about an acre, with two lakes and a beach where motor vehicles are not allowed.",
  geo: { "@type": "GeoCoordinates", latitude: F.center[0], longitude: F.center[1] },
  address: { "@type": "PostalAddress", streetAddress: "121 North Gate Road", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29572", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "North Myrtle Beach", url: "/submarkets/north-myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "Briarcliffe Acres SC: Acre Lots, Two Lakes, Dune Beach",
  description: "Briarcliffe Acres, SC: about 250 houses on acre lots, two lakes, a dune beach with no cars. What houses sold for, the tax, the rental rule, flood, the beach.",
  ogTitle: "Briarcliffe Acres, SC: a small town of acre lots, two lakes and a dune beach",
  crumb: "Briarcliffe Acres",
  eyebrow: "Briarcliffe Acres, South Carolina",
  h1: "Briarcliffe Acres:",
  h1em: "a small town of acre lots, two lakes and a dune beach.",
  sub: `Briarcliffe Acres allows no car or golf cart on its beach. The nearest house is about ${n(NEAREST_FT)} feet from the surf, past dunes, a tidal creek and salt marsh.`,
  heroMedia: CSS + glance([
    { icon: "home", label: "Houses", text: "About 250" },
    { icon: "lawn", label: "Lots", text: "About an acre" },
    { icon: "water", label: "Lakes", text: "Two" },
    { icon: "beach", label: "Beach", text: "No cars" },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Briarcliffe Acres is its own small town in Horry County, next to North Myrtle Beach. It has two lakes, a dune beach and a town hall of its own.`,
    `Below, you find what houses sold for, the tax, the rules for renting, the flood map and the beach.`,
  ],
  sections: [
    { h2: "What is it like to live in Briarcliffe Acres?", toc: "Life here", id: "life", html: () =>
      G.homesCss() + G.homesQScript() +
      G.homesQ(`${CENTER}&miles=1.5&type=house`, "Houses for sale in and around Briarcliffe Acres") +
      AERIAL +
      h.p(`The lot is the point here. The middle lot is about an acre, and ${ACRE_PLUS} of the ${n(HO.houses)} houses sit on an acre or more. The town's zoning asks for at least 40,000 square feet a lot, so the houses stand well apart.`) +
      h.p(`Two lakes sit inside the town, about 10 acres in all. The town's plan calls them ponds and says residents fish and canoe on them. ${n(HO.pools)} of the houses have an in-ground pool.`) +
      G.homesQ(`${CENTER}&miles=1.5&type=house&has=lake_view`, "Houses with a lake view near Briarcliffe Acres") +
      h.p(`Past the lots, the town's beach has no cars at all. People walk or ride a bicycle to the sand.`) +
      h.h3("Where a normal week takes you") +
      h.p(`Barefoot Landing is about ${D.barefoot} minutes by car, and the medical center about ${D.hospital}.`) +
      DRIVES +
      h.h3("Is Briarcliffe Acres oceanfront?") +
      h.p(`No. No house touches the beach. The middle house is a little over half a mile from the ocean, with the dunes, a tidal creek and marsh between. Our ${h.a("/buyers/homes-near-the-beach/", "homes near the beach guide")} compares the places where a house is closer to the sand.`) +
      MAPHTML },

    { h2: "Is Briarcliffe Acres in North Myrtle Beach or Myrtle Beach?", toc: "Which town", id: "town", html: () =>
      h.p(`Neither. Briarcliffe Acres is its own town in Horry County, with its own town hall and municipal court. The mail says Myrtle Beach, and North Myrtle Beach borders the town to the north.`) +
      `<ul class="ba-rules" aria-label="The town at a glance">`
        + `<li><strong>Town Hall</strong>121 North Gate Road, ZIP code 29572, 843.272.8863.</li>`
        + `<li><strong>Water and sewer</strong>The City of Myrtle Beach lays and keeps the water lines. Most houses use a septic system.</li>`
        + `<li><strong>Trash and recycling</strong>These are town services, run by a hauler.</li>`
        + `<li><strong>The streets</strong>Three entrances open to US 17: North, Middle and South Gate Road.</li>`
        + `</ul>` +
      h.p(`The Briarcliffe West condos on North Kings Highway are outside the town. Our ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach guide")} covers the city next door, and our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city its mail says.`) +
      G.homesQ("subdivision=Briarcliffe West", "Condos at Briarcliffe West") },

    { h2: "What do homes in Briarcliffe Acres sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year ${HS.count} houses in Briarcliffe Acres sold, at a middle price of about ${r5k(SALE_MID)}. They ranged from about ${r5k(HS.prices.min)} to ${mil(HS.prices.max)}. One empty lot sold for ${r1k(LOT_SALE)}.`) +
      h.p(`On ${COUNT_DAY}, ${L.for_sale_inside_town} houses were for sale in the town, asking about ${r1k(FS[0])} and ${mil(FS[1])}. ${h.a(TOWN_HOMES, "See the houses for sale in the town")}.`) +
      `<p class="ba-note">Sale prices: Horry County deeds recorded in the past 12 months, houses only. Asking prices: CCMLS listings, counted in aggregate.</p>` +
      G.homesQ(`${CENTER}&miles=2&type=house&has=pool`, "Houses with a pool near Briarcliffe Acres") +
      h.p(`Besides ${h.a("/buyers/coastal-insurance/", "insurance")}, property tax on a house at the typical sale price is about $${TP} a year as your full-time home. As a second home or rental it is about $${TO} a year, before any credit. About 4 in 5 houses here are taxed as the owner's full-time home. Read how the ${h.a("/buyers/property-taxes/", "property tax rates")} work.`) +
      h.p(`The bill has a town levy on top of the county and school tax, and a flat county fee of about $90.`) +
      G.homesQ(`${CENTER}&miles=1.5&type=house&min=700000`, "Houses near Briarcliffe Acres at $700,000 and up") },

    { h2: "Can you rent a house in Briarcliffe Acres?", toc: "Renting", id: "renting", html: (bg) =>
      h.p(`Not for less than six months. The town's zoning code, as we read it, calls the rental of a single-family house for under six consecutive months a commercial activity and does not allow it. A nightly or weekly rental is out. A lease of six months or more is not covered by that rule.`) +
      h.p(`Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers the towns around it, and our ${h.a("/invest/long-term-rental/", "long-term rental page")} covers a lease. The town's code is posted on ${h.a(SRC.code, "Municode")}.`) +
      `<ul class="ba-rules one" aria-label="More of the town's rules">`
        + `<li><strong>Work at home</strong>The code allows no professional or business activity in a house in the single-family district.</li>`
        + `<li><strong>The lot</strong>Buildings, garages and sheds included, may cover no more than 15 percent of the lot.</li>`
        + `<li><strong>Boats</strong>For a boat kept more than 72 hours: under 25 feet is fine, one item in the front yard. A boat of 25 to 40 feet goes in the back or side yard, screened. A boat over 40 feet is not allowed in the town.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us check the town's rules", "We read the town's current code for the house you like and tell you what it allows before you offer.", "Have us check the rules", CONTACT, bg) },

    { h2: "Is there an HOA in Briarcliffe Acres, and what about the cabana?", toc: "HOA and cabana", id: "hoa", html: (bg) =>
      h.p(`The town's plan names the Briarcliffe Acres Association as the owner of the town's recreation property and its old walking trails.`) +
      `<ul class="ba-rules one" aria-label="The association and the cabana">`
        + `<li><strong>The trails</strong>The old walking trails are being closed.</li>`
        + `<li><strong>The cabana</strong>A beachfront cabana serves the residents.</li>`
        + `<li><strong>The dues</strong>Neither of the ${L.for_sale_inside_town} houses for sale lists an association fee. We have not found what the association charges or who may use the cabana.</li>`
        + `</ul>` +
      h.p(`Before you offer, we get the dues and the cabana rules from the association for the house you pick.`) +
      h.cta("Like a lot here? Have us pull the association's papers", "We request the association's papers and its dues for the house you like, and send you what we get before you offer.", "Have us pull the papers", CONTACT, bg) },

    { h2: "Is Briarcliffe Acres in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`Mostly not. FEMA's map puts the center of ${F.flood_zone_at_lot_center["outside mapped zones (X)"]} of the ${n(HO.houses)} house lots outside every mapped flood zone.`) +
      h.p(`${F.flood_zone_at_lot_center.AE} lots have their center in FEMA's high-risk zone, the zone where a lender requires flood insurance, and ${F.house_outline_touches_high_risk} house outlines touch it. No lot is in the coastal wave zone.`) +
      h.p(`A zone does not show whether a house has flooded. We check each house's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how, and our ${h.a("/buyers/flood-zone-check/", "flood zone check")} shows how to look up one address.`) },

    { h2: "Where is the beach in Briarcliffe Acres, and can you drive on it?", toc: "The beach", id: "beach", html: () =>
      h.p(`No. The town's beach lies between Ocean Creek Resort to the north and the Meher Spiritual Center to the south. The town bans motor vehicles on it, golf carts included, all year. It is open to people on foot and on bicycles.`) +
      h.p(`The nearest public beach access is North Myrtle Beach access no. 1, about ${D.beachMiles} miles by road. That is about ${D.beach} minutes by car, or about ${D.walk} minutes on foot. We confirm who may use the town's own stretch of sand for the house you pick.`) + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} in Myrtle Beach, ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach. Then ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")} in North Myrtle Beach, ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach and ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest. Then ${h.a("/submarkets/conway/shaftesbury-glen/", "Shaftesbury Glen")} near Conway and ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "Briarcliffe Acres FAQ",
  faq: [
    { q: "Can you drive a golf cart on the beach in Briarcliffe Acres?", a: "No. The town bans motor vehicles on its beach, golf carts included, all year. We have not confirmed the town's rules for golf carts on its streets." },
    { q: "Does Briarcliffe Acres have its own police?", a: "The town has one full-time police chief, helped by Horry County Police and the South Carolina Highway Patrol." },
    { q: "What is Briarcliffe West?", a: "Condos on North Kings Highway just outside the town. They are not part of Briarcliffe Acres." },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "town code", href: SRC.code },
    { name: "town plan", href: SRC.plan },
    { name: "town website", href: SRC.town },
    { name: "beach handout", href: SRC.handout },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "tax levy", href: SRC.levy },
    { name: "beach access", href: SRC.access },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, building outlines, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in Briarcliffe Acres.",
    p: "Tell us the lot size and the budget you have in mind. We line up the houses that fit, each with its lot, its flood zone and its yearly tax.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Briarcliffe Acres, Briarcliffe Acres SC, Briarcliffe Acres homes for sale, Briarcliffe Acres Myrtle Beach, Briarcliffe Acres North Myrtle Beach, Briarcliffe Acres lakes, Briarcliffe Acres beach, Briarcliffe Acres flood zone, Briarcliffe Acres rentals",
  about: "Briarcliffe Acres, a small incorporated town in Horry County, South Carolina, next to North Myrtle Beach",
});
