/* /submarkets/myrtle-beach/pine-lakes-preserve/ - The Preserve at Pine Lakes, Myrtle Beach SC: what living there is
 * like (about 290 houses in four phases, built to a plan of three price levels), which phase is which, what the
 * houses sold for, the HOA question, the golf parcel next door, the city limits and the flood zone.
 *
 * Batch 2026-11-f, Lane N (new page), the neighborhood shape of specs/plantation-point.js and specs/wild-wing-plantation.js.
 * Facts: Blog-Brain batches/2026-11-f/pine-lakes-preserve/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's values and wording only (VERIFY.md). Plan: PLAN.md. Demand: must-answer.md.
 * Not used: row 16 (club history, struck), the builder in row 17 (struck), "the ocean is 1.2 miles from all of them"
 * (struck), "no course rights" (not sourced), "no pools" (a pool structure sits on the HOA's land), the county value (row 10),
 * the three dropped deeds (row 9), "299 lots" and "9 empty lots" (row 2), "184 lots touch common land" (row 4), tax district
 * counts, the out-of-state count, the 880-a-month figure (an order, not a page fact).
 * Data: data/2026-11-f/pine-lakes-preserve/. Every count, size, price, share and minute is read from those files here
 * and checked against its ledger row.
 * Pictures: one public-domain NAIP aerial (USDA, 2023) and one map we drew from Horry County parcel points.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/pine-lakes-preserve/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "pine-lakes-preserve");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), PHS = read("phases.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-lots.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const r10k = (v) => "$" + n(Math.round(v / 10000) * 10000);
const must = (ok, msg) => { if (!ok) throw new Error(`pine-lakes-preserve.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 2 (CORRECTED): 290 houses, none empty; by phase 1A 87, 1B 70, 2 87, 3 46. */
must(F.houses === 290 && PHS["1A"].houses === 87 && PHS["1B"].houses === 70 && PHS["2"].houses === 87 && PHS["3"].houses === 46, "row 2 changed");
/* Row 5: typical lot by phase; 1B townhome-style (land use 109). */
must(PHS["1B"].lot_sqft_median === 2949 && PHS["1A"].lot_sqft_median === 6815 && PHS["2"].lot_sqft_median === 6993 && Math.round(PHS["3"].lot_sqft_median) === 8640 && PHS["1B"].landuse["109"] === 70, "row 5 changed");
const LOT = (k) => n(Math.round(PHS[k].lot_sqft_median / 100) * 100);
/* Row 6: about 2,750 sq ft of ground covered (roof outline, garage included); the ledger's 2,772 is within 1%. */
must(F.house_footprint_sqft.median === 2772 && F.house_footprint_sqft.n === 175, "row 6 changed");
const ROOF = n(Math.round(F.house_footprint_sqft.median / 50) * 50);
must(ROOF === "2,750", "row 6 rounding changed");
/* Row 8 (CORRECTED): about 20 recorded sales, middle about $540,000, $351,000 to $680,000. By phase, middles about
   $400,000 (1B), $540,000 (1A), $635,000 (2), $650,000 (3); phases 2 and 3 have 3 sales each. */
const SA = F.sales_houses, BP = SA.by_section;
must(SA.count === 20 && SA.prices.median === 538250 && SA.prices.min === 350922 && SA.prices.max === 680000, "row 8 changed");
must(BP["PINE LAKE PH 1B"].median === 397000 && BP["PINE LAKES PH 1A"].median === 539500 && BP["PINE LAKES PH 2"].median === 635000 && BP["PINE LAKES PH 3"].median === 650000 && BP["PINE LAKES PH 2"].n === 3 && BP["PINE LAKES PH 3"].n === 3, "row 8 phases changed");
/* Row 9: Phase 1B about $400,000 (with the two part-interest-looking deeds, $390,000). */
/* Row 4 (CORRECTED): the HOA owns 12 parcels, about 69 acres. */
const HOA_ACRES = 69;
/* Row 7: one pool structure sits on the HOA's Common Area 2; none on a house parcel. */
/* Row 11: homes for sale now: 8, $399,000 to $679,000. */
must(L.all.for_sale === 8 && L.all.list_price.min === 399000 && L.all.list_price.max === 679000, "row 11 changed");
/* Row 12: listing HOA fee field: $95 to $98 a month on 7 detached; $313 on the townhouse. */
must(L.all.hoa_monthly_listed.join() === "95,95,96,96,96,96,98,313", "row 12 changed");
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Row 14 (VERIFIED): all 290 houses in FEMA Zone X, minimal hazard; none in the high-risk zone. */
must(F.sfha_fema === 0, "row 14 changed");
/* Row 15 (CORRECTED): 42 of 290 houses touch the golf parcel: 1A 11, 2 20, 3 11, 1B none; 31 in Phases 2 and 3. */
const GE = (k) => Object.values(PHS[k].golf_edge).reduce((a, b) => a + b, 0);
must(GE("1A") === 12 && GE("2") === 20 && GE("3") === 11 && GE("1B") === 0, "row 15 (county run) changed");
const GOLF = { "1A": 11, "1B": 0, "2": 20, "3": 11 }, GOLF_ALL = 42;
must(GOLF["1A"] + GOLF["2"] + GOLF["3"] === GOLF_ALL && GOLF["2"] + GOLF["3"] === 31 && Math.round(GOLF_ALL / 290 * 100) === 14, "row 15 verified counts changed");
/* Row 18 (CORRECTED): drives from the middle of the community, no traffic; the road route to the access is 1.2 miles. */
const PD = DR.drives["The Preserve at Pine Lakes (middle)"];
const D = { beach: Math.round(PD["nearest public beach access"].minutes), beachMiles: Math.round(PD["nearest public beach access"].miles * 10) / 10,
  broadway: Math.round(PD["Broadway at the Beach"].minutes), mall: Math.round(PD["Coastal Grand Mall"].minutes), airport: Math.round(PD["Myrtle Beach International Airport terminal"].minutes) };
must(D.beach === 6 && D.beachMiles === 1.2 && D.broadway === 7 && D.mall === 12 && D.airport === 16, "row 18 changed");
/* Row 19: 225 of 290 houses taxed at the owner-occupied rate (78 in 100). */
must(F.at4 === 225 && Math.round(225 / 290 * 100) === 78, "row 19 changed");
const PRIMARY = 78;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const INK = "#8a5226";
const C = { land: "#eef0e4", p1A: "#e2b07f", p1B: "#a98fd0", p2: "#5c9bbf", p3: "#c4635a", ring: "#2f5326", road: "#ffffff" };
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
/* The aerial photo (USDA NAIP 2023, public domain).                              */

const AIR = PHOTOS.find((r) => r.file.includes("pine-lakes-preserve-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "The Preserve at Pine Lakes from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The four phases side by side (rows 2, 5, 8, 15). Short labels and no-break units.   */

const NB = "&nbsp;";
const mid = (k) => r5k(BP[k].median);
const CMP = `<div class="pp-cmp">` + h.table(["Phase", "Houses", "Typical lot", "Sold, past year"], [
  ["1B, townhome-style", n(PHS["1B"].houses), `${LOT("1B")}${NB}sq${NB}ft`, `about ${r10k(BP["PINE LAKE PH 1B"].median)}`],
  ["1A", n(PHS["1A"].houses), `${LOT("1A")}${NB}sq${NB}ft`, `about ${r10k(BP["PINE LAKES PH 1A"].median)}`],
  ["2", n(PHS["2"].houses), `${LOT("2")}${NB}sq${NB}ft`, `about ${r5k(BP["PINE LAKES PH 2"].median)}`],
  ["3", n(PHS["3"].houses), `${LOT("3")}${NB}sq${NB}ft`, `about ${r5k(BP["PINE LAKES PH 3"].median)}`],
]) + `</div>`;

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  beach: "https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0",
  osm: "https://www.openstreetmap.org/",
};

const CONTACT = `/contact/?place=${encodeURIComponent("The Preserve at Pine Lakes")}`;
const HOMES_ALL = "/homes/?subdivision=The+Preserve+at+Pine+Lakes";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "The Preserve at Pine Lakes", alternateName: "The Preserve at Pine Lakes, Myrtle Beach SC",
  description: `A neighborhood of ${F.houses} houses in four phases inside the City of Myrtle Beach, South Carolina, next to a golf course.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center[0], longitude: F.center[1] },
  address: { "@type": "PostalAddress", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
})}</script>`;

const TOPSTRIP = G.homesCss() + G.homesQScript() + G.homesQ("subdivision=The Preserve at Pine Lakes", "The Preserve at Pine Lakes homes for sale");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "The Preserve at Pine Lakes Myrtle Beach SC: Price by Phase",
  description: "The Preserve at Pine Lakes in Myrtle Beach, SC: about 290 houses in four phases, what each sold for, the HOA fee on listings, flood zone and the golf next door.",
  ogTitle: "The Preserve at Pine Lakes, Myrtle Beach SC: one neighborhood, four phases, three price levels",
  crumb: "The Preserve at Pine Lakes",
  eyebrow: "The Preserve at Pine Lakes, Myrtle Beach SC",
  h1: "The Preserve at Pine Lakes homes in Myrtle Beach, SC:",
  h1em: "four phases, three price levels, and a public beach access 6 minutes away.",
  sub: `The Preserve at Pine Lakes has four phases. In the past year, Phase 1B sold near ${r10k(BP["PINE LAKE PH 1B"].median)}, and Phases 2 and 3 sold near ${r5k(BP["PINE LAKES PH 2"].median)} to ${r5k(BP["PINE LAKES PH 3"].median)}.`,
  heroMedia: CSS + glance([
    { icon: "home", label: "Houses", text: n(F.houses) },
    { icon: "dollar", label: "Sold, past year", text: `about ${r10k(SA.prices.median)}` },
    { icon: "golf", label: "On the golf parcel", text: `${GOLF_ALL} houses` },
    { icon: "beach", label: "Beach by car", text: `${D.beach} min` },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `The Preserve at Pine Lakes is a neighborhood of ${n(F.houses)} houses in four phases, inside the City of Myrtle Beach, SC. In the past year its houses sold for about ${r10k(SA.prices.median)}, from ${r1k(SA.prices.min)} to ${r1k(SA.prices.max)}.`,
    `Listing sheets show an HOA fee of about $95 to $98 a month for houses. No house is in FEMA's high-risk flood zone. The county lists a golf company, not the homeowners, as owner of the course land next door.</p>${TOPSTRIP}<p style="display:none">`,
  ],
  sections: [
    { h2: "What is it like to live in The Preserve at Pine Lakes?", toc: "Life here", id: "life", html: () =>
      h.p(`The neighborhood has six streets: Whitebark Drive, Knobcone Loop, Lacebark Trail, Bristlecone Court, Canary Island Court and Shortleaf Path. The roof of a typical house, garage included, covers about ${ROOF} square feet of ground.`) +
      h.p(`The homeowners' association, the HOA, owns about ${HOA_ACRES} acres of common land across 12 parcels. The county's map shows a pool on that land, and the aerial below shows what looks like a pool and play area.`) +
      AERIAL +
      h.h3("Where a normal week takes you") +
      h.p(`By car with no traffic, the nearest public beach access is about ${D.beach} minutes from the middle of the neighborhood. Broadway at the Beach is about ${D.broadway}, Coastal Grand Mall about ${D.mall} and the airport about ${D.airport}.`) +
      h.p(`Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city around it.`) },

    { h2: "Which phase of The Preserve at Pine Lakes is which?", toc: "The four phases", id: "phases", html: () =>
      h.p(`The county's records call it Pine Lakes, Phases 1A, 1B, 2 and 3. Phase 1B is townhome-style, on much smaller lots. The other three phases are houses, and the lots grow from 1A to 3.`) +
      CMP +
      `<p class="pp-note">Lots and houses: Horry County parcels. Sales: deeds recorded in the past 12 months, houses only, middle price rounded. Phases 2 and 3 have 3 sales each, so treat their middles as a sample.</p>` +
      G.homesQ("subdivision=The Preserve at Pine Lakes&max=550000", "Preserve at Pine Lakes homes under $550,000") +
      G.homesQ("subdivision=The Preserve at Pine Lakes&min=600000", "Homes in The Preserve at Pine Lakes from $600,000") +
      "" },

    { h2: "What do homes in The Preserve at Pine Lakes sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year, about ${SA.count} houses here sold. The middle price was about ${r10k(SA.prices.median)}, and prices ran from ${r1k(SA.prices.min)} to ${r1k(SA.prices.max)}. The phase explains most of the gap.`) +
      h.p(`Phase 1B sold near ${r10k(BP["PINE LAKE PH 1B"].median)}, Phase 1A near ${r10k(BP["PINE LAKES PH 1A"].median)}, and Phases 2 and 3 near ${r5k(BP["PINE LAKES PH 2"].median)} to ${r5k(BP["PINE LAKES PH 3"].median)}. Phases 2 and 3 are a small sample, 3 sales each, and Phase 1B is townhome-style.`) +
      h.p(`On ${COUNT_DAY}, ${L.all.for_sale} homes were for sale here, asking about ${r1k(L.all.list_price.min)} to ${r1k(L.all.list_price.max)}.`) +
      `<p class="pp-note">Sale prices: Horry County deeds recorded in the past 12 months, houses only, counted in aggregate. Asking prices: CCMLS listings, counted in aggregate.</p>` +
      h.p(`The county taxes about ${PRIMARY} in 100 houses here as their owner's primary ${h.a("/buyers/property-taxes/", "residence")}. Besides the mortgage and ${h.a("/buyers/coastal-insurance/", "insurance")}, you pay yearly property tax, and it is lower on a ${h.a("/buyers/property-taxes/", "primary residence")} than on a second home or rental. If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) },

    { h2: "Is there an HOA at The Preserve at Pine Lakes?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p(`Yes. The Preserve at Pine Lakes HOA Inc is the owner the county lists for the common land. Listing sheets for ${h.a(HOMES_ALL, "homes for sale here")} show about $95 to $98 a month for houses and $313 for the townhome.`) +
      `<ul class="pp-rules one" aria-label="The HOA and the neighborhood's rules">`
        + `<li><strong>The fee shown for a home for sale</strong>The listing agent enters it, so it is not the association's budget. We have not found what it covers. We confirm both with the association before you offer.</li>`
        + `<li><strong>Renting</strong>Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers renting by the night. For a longer lease, we read the association's papers first.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us pull the HOA papers", "We read the association's papers for that house. We tell you the fee, what it covers and what the rules allow.", "Have us pull the HOA papers", CONTACT, bg) },

    { h2: "Does The Preserve at Pine Lakes back onto the golf course?", toc: "Golf", id: "golf", html: () =>
      h.p(`Some houses do. ${GOLF_ALL} of the ${F.houses} houses touch the county's golf-course parcel. Most of those are in Phases 2 and 3, some are in Phase 1A, and none are in Phase 1B.`) +
      h.p(`The county lists a golf company, not the homeowners, as the owner of that land. Our ${h.a("/buyers/golf-communities/", "golf communities guide")} compares the area's golf neighborhoods, and we ask the course what play and membership cost before you offer.`) },

    { h2: "Is The Preserve at Pine Lakes in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`No house here is in FEMA's high-risk zone, the zone where a lender requires flood insurance. On FEMA's current map, all ${F.houses} houses are in an "area of minimal flood hazard".`) +
      `<ul class="pp-rules one" aria-label="What the flood map shows here">`
        + `<li><strong>What a zone does not show</strong>A zone does not show whether a house has flooded. We check each house's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.</li>`
        + `<li><strong>Insurance</strong>Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} covers insurance for homes near the coast.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us check its flood history", "Send us the listing. We check its flood zone and its flood history, and tell you what we find.", "Have us check a house", CONTACT, bg) },

    { h2: "Is The Preserve at Pine Lakes in the City of Myrtle Beach?", toc: "City limits", id: "city", html: () =>
      h.p(`Yes. The county's map puts all ${F.houses} houses inside the Myrtle Beach city limits, and the mail says Myrtle Beach, SC 29577. Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city's own neighborhoods.`) + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach, ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach and ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest. Then ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} in Myrtle Beach, ${h.a("/submarkets/north-myrtle-beach/briarcliffe-acres/", "the town of Briarcliffe Acres")} and ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach. Then ${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest")} in Myrtle Beach and ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "The Preserve at Pine Lakes FAQ",
  faq: [
    { q: "Is The Preserve at Pine Lakes the same as Pine Lakes Estates?", a: `No. The listings keep Pine Lakes Estates, the older neighborhood, under its own name, and our counts here leave it out.` },
    { q: "Is The Preserve at Pine Lakes in Myrtle Beach, SC?", a: `Yes, the mailing address is Myrtle Beach, SC 29577. A Pine Lakes Preserve in Port St. Lucie, Florida, is a different place.` },
    { q: "Are there empty lots in The Preserve at Pine Lakes?", a: `Not on the county's map: every lot has a house on it. See the homes for sale at the top of this page.` },
    { q: "Does The Preserve at Pine Lakes have a pool?", a: `The county's map shows a pool on the HOA's common land. No house lot has one on the county's map. Ask us what the fee covers.` },
    { q: "Can I rent out a house in The Preserve at Pine Lakes?", a: `Renting depends on the HOA's rules and the city's, so we read both for the house you pick.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "beach access list", href: SRC.beach },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, building outlines, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in The Preserve at Pine Lakes.",
    p: "Pick a house from the list at the top of this page. We show it to you, and we check its lot, flood zone and HOA papers before you offer.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "The Preserve at Pine Lakes, Preserve at Pine Lakes Myrtle Beach SC, Pine Lakes Preserve Myrtle Beach, Preserve at Pine Lakes homes for sale, Preserve at Pine Lakes HOA, Preserve at Pine Lakes flood zone, Preserve at Pine Lakes golf",
  about: "The Preserve at Pine Lakes, a neighborhood of about 290 houses in four phases inside the City of Myrtle Beach, South Carolina, next to a golf course",
});
