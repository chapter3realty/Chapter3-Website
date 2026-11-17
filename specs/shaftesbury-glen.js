/* /submarkets/conway/shaftesbury-glen/ - Shaftesbury Glen near Conway SC: what it is (217 lots in sections beside an
 * 18-hole golf club), the new Preserve section (92 lots, D.R. Horton, 12 houses for sale), what the lots sold for,
 * the HOA question, the city limits, the flood zone and the beach.
 *
 * Batch 2026-11-f, Lane N (new page), the neighborhood pilots' shape (specs/plantation-point.js, wild-wing-plantation.js).
 * Facts: Blog-Brain batches/2026-11-f/shaftesbury-glen/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * values and wording only (VERIFY.md). Plan: PLAN.md. Demand: must-answer.md.
 * Not used: "selling out", "opened 2001", the builder office address and tours, "empty lots" (say no building value on
 * the county roll), "floodway strip" (say a mapped high-risk area), the club's awards, any golf access or membership
 * claim for Preserve owners, the golf-lot count for the older sections, the owner-occupied share (row 15, weak), the Zillow
 * snippet on schools.
 * Data: data/2026-11-f/shaftesbury-glen/. findings.json, map-lots.json, drives.json from the scripts there;
 * raw/map-sg.json is the live listing count (aggregate only; no address or MLS number reaches the page).
 * Pictures: one map we drew from Horry County parcels (one dot per lot), and a USDA NAIP aerial (public domain, 2023).
 * The Preserve was not built in 2023, so the photo shows the club and the older streets; the photo partner's shot list
 * (The Preserve itself) is in the batch BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/conway/shaftesbury-glen/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "shaftesbury-glen");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), DR = read("drives.json"), ML = read("map-lots.json"), LS = read(path.join("raw", "map-sg.json"));
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r100 = (v) => n(Math.round(v / 100) * 100);
const must = (ok, msg) => { if (!ok) throw new Error(`shaftesbury-glen.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const A = F.all, PR = F.preserve, LA = F.landing, VI = F.villas, OL = F.older, SL = F.sales;
/* Rows 3, 4 (CORRECTED): 217 parcels; The Preserve 92, a building value on 16 of them; typical house lot 9,352. */
must(A.parcels === 217 && PR.parcels === 92 && PR.houses === 16 && PR.lot_sqft.median === 9352, "rows 3 and 4 changed");
must(LA.parcels === 35 && LA.houses === 31 && LA.lot_sqft.median === 8400 && Math.round(LA.house_footprint_sqft.median) === 2624, "row 14 Landing changed");
must(VI.parcels === 12 && OL.parcels === 78 && OL.houses === 62 && Math.round(OL.lot_sqft.median) === 14739 && OL.parcels + LA.parcels + VI.parcels + PR.parcels === 217, "sections changed");
/* Row 5 (VERIFIED): 122 of 217 lots touch the golf parcels (within 15 m, about 50 feet); 29 of The Preserve's 92. */
must(A.golf_lots === 122 && PR.golf_lots === 29, "row 5 changed");
/* Row 6 (VERIFIED): no town over the community; zoning PDD on 216 of 217. */
must(A.in_city_limits === 0 && A.zoning.PDD === 216, "row 6 changed");
/* Row 8 (CORRECTED): 9 lots (8 houses) in a mapped high-risk area, all in the older sections. */
must(A.in_flood_zone_AE_over5pct === 9 && A.houses_in_flood_zone === 8 && PR.in_flood_zone_AE_over5pct === 0 && LA.in_flood_zone_AE_over5pct === 0, "row 8 changed");
/* Row 11 (VERIFIED, wording corrected): 41 deeds on The Preserve's lots; middle $377,983; middle half $355,500 to $412,541; $340,400 to $506,517. */
const DE = { count: 41, median: 377983, q1: 355500, q3: 412541, min: 340400, max: 506517 }; // preserve_deeds.py output, VERIFY.md
must(F.sales.houses_all.count === 15 && SL.houses_all.prices.median === 372000 && SL.houses_landing.count === 2 && SL.houses_older.count === 4 && SL.houses_villas.count === 1, "row 11 changed");
must(SL.houses_landing.prices.min === 249900 && SL.houses_landing.prices.max === 298000 && SL.houses_older.prices.min === 397500 && SL.houses_older.prices.max === 692500 && SL.houses_villas.prices.median === 175000, "row 11 older prices changed");
/* Rows 1, 2 (VERIFIED): 12 for sale, all The Preserve, all D.R. Horton; $299,990 to $469,770; middle $364,825; 3 to 5 beds; 1,414 to 4,072 sq ft. */
const PINS = LS.pins, usd = (s) => Number(String(s).replace(/[^0-9]/g, ""));
const PRICES = PINS.map((p) => usd(p.price)).sort((a, b) => a - b);
const midp = (PRICES[5] + PRICES[6]) / 2;
must(PINS.length === 12 && PRICES[0] === 299990 && PRICES[11] === 469770 && midp === 364825, "row 2 prices changed");
must(Math.min(...PINS.map((p) => p.beds)) === 3 && Math.max(...PINS.map((p) => p.beds)) === 5 && PINS.filter((p) => p.beds >= 4).length === 9, "row 2 beds changed");
must(Math.min(...PINS.map((p) => p.sqft)) === 1414 && Math.max(...PINS.map((p) => p.sqft)) === 4072 && PINS.every((p) => /horton/i.test(p.firm)), "row 2 sizes changed");
must(PRICES.filter((v) => v <= 360000).length === 5, "under-$360,000 count changed");
const COUNT_DAY = new Date(F.made + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Row 9 (VERIFIED): every one of the 12 listings states $75 a month; the HOA table adds trash pickup. */
/* Row 12 (VERIFIED): drives from the middle of The Preserve, no traffic. */
const WD = DR.drives["The Preserve at Shaftesbury Glen (middle of its 92 lots)"];
const mm = (k) => WD[k].minutes;
must(mm("Myrtle Beach International Airport terminal") === 42.1 && mm("Broadway at the Beach") === 33.2 && mm("Coastal Grand Mall") === 37.1 && mm("Downtown Conway (Main Street at 4th Avenue)") === 19.1 && mm("nearest public beach access") === 24, "row 12 changed");
const D = { beach: 24, beachMiles: Math.round(WD["nearest public beach access"].miles * 10) / 10, airport: 42, broadway: 33, mall: 37, town: 19 };
must(D.beachMiles === 15.2, "row 12 miles changed");
/* Map: the same counts as the rows. */
const DOTS = ML.lots.map((r) => ({ lat: r[0], lng: r[1], g: r[2], golf: r[3], flood: r[4] }));
must(DOTS.length === 217 && DOTS.filter((d) => d.golf).length === 122 && DOTS.filter((d) => d.g === "preserve" && d.golf).length === 29 && DOTS.filter((d) => d.flood).length === 9, "map lots do not match rows 3, 5 and 8");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const C = { land: "#eef0e4", pre: "#e2b07f", old: "#c9bfd9", lan: "#ffffff", vil: "#9cb7a6", golf: "#4f7f3f", flood: "#2f6f8f", road: "#ffffff" };
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
main#main .ww-hero{max-width:720px!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;object-position:50% 45%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:3/1}main#main .ww-hero figcaption{display:none}main#main .detail-hero .ww-hero{margin-bottom:.9rem!important}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:3/1}main#main .detail-hero .detail-media{max-width:1100px!important}}
/* The end band (as /submarkets/myrtle-beach/market-common/). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The sections side by side (rows 3, 4, 14). Short row labels, no-break units.    */

const NB = "&nbsp;";
const CMP = `<div class="pp-cmp">` + h.table(["", "Preserve", "Landing", "Older"], [
  ["Lots", n(PR.parcels), n(LA.parcels), n(OL.parcels)],
  ["Houses", n(PR.houses), n(LA.houses), n(OL.houses)],
  ["House lot", `${r100(PR.lot_sqft.median)}${NB}sq${NB}ft`, `${r100(LA.lot_sqft.median)}${NB}sq${NB}ft`, `${r100(OL.lot_sqft.median)}${NB}sq${NB}ft`],
  ["Under roof", "No outlines yet (new houses)", `${r100(LA.house_footprint_sqft.median)}${NB}sq${NB}ft`, `${r100(OL.house_footprint_sqft.median)}${NB}sq${NB}ft`],
]) + `</div>`;

/* The aerial photo (USDA NAIP 2023, public domain): the club's fairways beside the streets. */
const AIR = PHOTOS.find((r) => r.file.includes("shaftesbury-glen-golf-and-houses-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "1100px", sizes: "(max-width: 1200px) 100vw, 1100px" })
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero ww-hero" style="margin:0 0 1.2rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Part of Shaftesbury Glen from the air" }]);

/* Sources. */
const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  census: "https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html",
  club: "https://www.shaftesburyglen.com/",
  beach: "https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0",
  osm: "https://www.openstreetmap.org/",
};

const CONTACT = `/contact/?place=${encodeURIComponent("The Preserve at Shaftesbury Glen")}`;
const SUB = "subdivision=The Preserve at Shaftesbury Glen";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Shaftesbury Glen", alternateName: "Shaftesbury Glen, Conway",
  description: `A planned community of ${A.parcels} lots beside an 18-hole golf club near Conway, South Carolina, in Horry County outside the City of Conway, with The Preserve at Shaftesbury Glen as its newest section.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center[0], longitude: F.center[1] },
  address: { "@type": "PostalAddress", addressLocality: "Conway", addressRegion: "SC", postalCode: "29526", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Conway", url: "/submarkets/conway/" },
  title: "Shaftesbury Glen, Conway SC: New Homes, HOA and Golf",
  description: "Shaftesbury Glen near Conway, SC: the new houses for sale now, the $75 HOA, flood zone, what The Preserve sold for, and the golf club next door.",
  ogTitle: "Shaftesbury Glen, Conway SC: 41 of the 92 new Preserve lots sold in a year",
  crumb: "Shaftesbury Glen",
  eyebrow: "Shaftesbury Glen, near Conway",
  h1: "Shaftesbury Glen homes near Conway:",
  h1em: "41 of the 92 lots in the new Preserve section had a deed in a year.",
  sub: `${PINS.length} new D.R. Horton houses for sale at The Preserve at Shaftesbury Glen, ${r5k(PRICES[0])} to ${r5k(PRICES[11])}.`,
  pageImages: () => PH.pageImages(AIR),
  heroMedia: CSS + glance([
    { icon: "home", label: "For sale", text: `${PINS.length} houses` },
    { icon: "dollar", label: "Asking from", text: r1k(PRICES[0]) },
    { icon: "golf", label: "Lots at the course", text: `${A.golf_lots} of ${A.parcels}` },
    { icon: "beach", label: "Beach by car", text: `${D.beach} min` },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Shaftesbury Glen is a planned community of ${A.parcels} lots beside an 18-hole golf club, outside the City of Conway with a Conway mailing address. Its newest section, The Preserve at Shaftesbury Glen, has ${PINS.length} D.R. Horton houses for sale, about ${r5k(PRICES[0])} to about ${r5k(PRICES[11])}.`,
    `The HOA fee at The Preserve is $75 a month. The Preserve is in FEMA's minimal flood hazard zone, and the nearest public beach access is about ${D.beach} minutes away by car.`,
  ],
  sections: [
    { id: "homes", html: () => G.homesCss() + G.homesQScript() + G.homesQ(SUB, "The Preserve at Shaftesbury Glen homes for sale") },

    { h2: "What is Shaftesbury Glen?", toc: "What it is", id: "what", html: () =>
      h.p(`Shaftesbury Glen is built in sections. The older streets run along the golf course, then come The Landing and The Villas, and the newest section is The Preserve. The county zones ${A.zoning.PDD} of the ${A.parcels} lots as a planned development district.`) +
      AERIAL +
      CMP +
      `<p class="pp-note">Sizes are the typical one for each section, rounded. Houses are lots with a building value on the county roll. The Villas are ${VI.parcels} more lots, existing villa units. Lots: Horry County parcels and building outlines.</p>` +
      h.p(`The Shaftesbury Glen Golf &amp; Fish Club LLC owns the golf-course land, two parcels of ${n(134.7)} and ${n(33.4)} acres. Owning a house here does not make you an owner of the course. ${A.golf_lots} of the ${A.parcels} lots touch that land or sit within 50 feet of it, and ${PR.golf_lots} of those are in The Preserve.`) +
      h.p(`The club's own site lists an 18-hole, par 72 course designed by Clyde Johnston (2001) at 951 Shaftesbury Lane. It does not say whether Preserve owners can play or join, so we ask the club what play and membership cost before you offer. Our ${h.a("/buyers/golf-communities/", "golf communities guide")} compares the area's golf neighborhoods.`) +
      h.p(`The listings use other Shaftesbury names too, such as Meadows, Green, Estates, Oaks and The Cottages. Those are separate neighborhoods, and our counts leave them out.`) },

    { h2: "What are the new homes at The Preserve?", toc: "The Preserve", id: "preserve", html: () =>
      h.p(`The Preserve at Shaftesbury Glen is the newest section: ${PR.parcels} lots on Bantry Lane, Doonbeg Court, Crookhaven Court, Port Rush Court and Glens Way. D.R. Horton lists all ${PINS.length} homes for sale. They have 3 to 5 bedrooms, and 11 were built in 2026.`) +
      h.p(`Nine of the ${PINS.length} have four or more bedrooms. The homes are in the strip at the top of the page.`) +
      h.p(`The county roll shows a building value on ${PR.houses} of the ${PR.parcels} lots, and houses built this year may not be on it yet. The prices section counts the lots that sold.`) },

    { h2: "How much does a house in Shaftesbury Glen cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`On ${COUNT_DAY}, ${PINS.length} homes were for sale at The Preserve, asking about ${r5k(PRICES[0])} to ${r5k(PRICES[11])}. The middle asking price was about ${r5k(midp)}.`) +
      h.p(`In the past year, ${DE.count} Preserve lots had a deed with a price. The middle price was about ${r5k(DE.median)}, and half of them sold between about ${r5k(DE.q1)} and about ${r5k(DE.q3)}. The range was about ${r5k(DE.min)} to about ${r5k(DE.max)}.`) +
      h.p(`Each deed is for one lot, from D.R. Horton. New houses close on the lot's parcel before the county roll shows the house, so we count lots here and not houses on the roll.`) +
      `<p class="pp-note">Sale prices: Horry County deeds recorded in the past 12 months, one lot each, price stated. Asking prices: CCMLS listings, counted in aggregate.</p>` +
      G.homesQ(`${SUB}&max=360000`, "Shaftesbury Glen homes under $360,000") +
      h.p(`In The Landing and the older sections, fewer houses change hands. ${SL.houses_landing.count + SL.houses_older.count} houses on the county roll sold in the past year, from about ${r5k(SL.houses_landing.prices.min)} to about ${r5k(SL.houses_older.prices.max)}. One villa sold for ${r5k(SL.houses_villas.prices.median)}.`) +
      h.p(`Insurance and ${h.a("/buyers/property-taxes/", "property tax")} come on top of the price, and we work out both for the house you like. If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) },

    { h2: "Is there an HOA at Shaftesbury Glen?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p(`Every home for sale at The Preserve lists an HOA fee of $75 a month, and the listing's HOA field names trash pickup.`) +
      `<ul class="pp-rules one" aria-label="The HOA and the community's rules">`
        + `<li><strong>The fee shown for a home for sale</strong>The listing agent enters it, so it is not the association's budget. We confirm what it covers with the association before you offer.</li>`
        + `<li><strong>The golf</strong>The golf club is separate from the HOA.</li>`
        + `<li><strong>Renting</strong>Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers renting by the night. For a longer lease, we read the association's papers first.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us pull the HOA papers", "We read the association's papers for that house. We tell you the fee, what it covers and what the rules allow.", "Have us pull the HOA papers", CONTACT, bg) },

    { h2: "Is Shaftesbury Glen in Conway?", toc: "City limits", id: "city", html: () =>
      h.p(`The mailing address is Conway, SC 29526, but the land is outside the City of Conway. The county's map of towns shows no town over the community, and the Census Bureau's map shows the same. The community is in Horry County.`) +
      h.p(`It follows that the property tax bill has no City of Conway tax. Our ${h.a("/buyers/property-taxes/", "property taxes guide")} explains the bill. For a golf neighborhood inside the city limits, see ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")}. Our ${h.a("/submarkets/conway/", "Conway guide")} covers the town itself.`) },

    { h2: "Is Shaftesbury Glen in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`The Preserve is in FEMA's lowest-risk flood zone, which FEMA calls an "area of minimal flood hazard". That is outside the high-risk zone. A lender can still ask for flood insurance there, so we check the lender's rules for the house you pick.`) +
      `<ul class="pp-rules one" aria-label="What the flood map shows here">`
        + `<li><strong>The older sections</strong>${A.in_flood_zone_AE_over5pct} lots, ${A.houses_in_flood_zone} with houses, lie in a mapped high-risk flood area. All are in the older sections. None are in The Preserve or The Landing.</li>`
        + `<li><strong>What a zone does not show</strong>A zone does not show whether a house has flooded. We check each house's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.</li>`
        + `<li><strong>Insurance</strong>Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} covers insurance for homes near the coast.</li>`
        + `</ul>` },

    { h2: "How far is Shaftesbury Glen from the beach?", toc: "The beach", id: "beach", html: () =>
      h.p(`About ${D.beach} minutes by car, ${D.beachMiles} miles to the nearest public beach access on the state's list, with no traffic. Downtown Conway is about ${D.town} minutes, Broadway at the Beach about ${D.broadway}, Coastal Grand Mall about ${D.mall} and the Myrtle Beach airport about ${D.airport}.`) +
       /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway, ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} in Myrtle Beach. Then ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach, ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach and ${h.a("/submarkets/north-myrtle-beach/briarcliffe-acres/", "the town of Briarcliffe Acres")}. Then ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest and ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "Shaftesbury Glen FAQ",
  faq: [
    { q: "Is Shaftesbury Glen on a golf course?", a: `Many lots are. The section on what Shaftesbury Glen is has the counts, and the club is not part of the HOA.` },
    { q: "Who builds homes in Shaftesbury Glen?", a: `D.R. Horton lists all ${PINS.length} homes for sale at The Preserve, the newest section. The county's deed index shows D.R. Horton as the seller on every Preserve lot deed in the past year.` },
    { q: "Can I rent out a house in Shaftesbury Glen?", a: `Renting can depend on the association's rules, so we read them for the house you pick. Our short-term rental rules guide covers renting by the night.` },
    { q: "Are there lots for sale in Shaftesbury Glen?", a: `The county roll shows ${A.vacant_lots} lots with no building value, and some of them hold new houses the roll does not show yet. No lots are listed for sale on their own now. The strip at the top of the page shows the houses that are.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "Census map", href: SRC.census },
    { name: "the golf club", href: SRC.club },
    { name: "beach access list", href: SRC.beach },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, building outlines, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Picked a house at The Preserve?",
    p: "We read the HOA papers and check the flood history for that house before you offer, and tell you what we find.",
    label: "Have us check the house", href: CONTACT,
  },
  keywords: "Shaftesbury Glen, Shaftesbury Glen Conway SC, Shaftesbury Glen homes for sale, The Preserve at Shaftesbury Glen, Shaftesbury Glen HOA, Shaftesbury Glen golf, Shaftesbury Glen flood zone",
  about: "Shaftesbury Glen, a planned community beside a golf club near Conway, South Carolina, with The Preserve at Shaftesbury Glen as its newest section",
});
