/* /invest/condo-buildings/palace-resort/ - the Palace Resort, 1605 S Ocean Blvd, Myrtle Beach: what owning
 * a condo there gives you, the HOA fee by unit size and what it pays, renting it by the night (the resort's
 * own program and its water-park passes), what units sold for, and what we check before an offer.
 *
 * Batch 2026-11-d, Lane N. Version 1, 2026-11-13. The pilot for one page per oceanfront resort.
 * Facts: Blog-Brain batches/2026-11-d/palace-resort/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md; struck wording in batches/2026-11-d/facts/
 * invest-condo-buildings-palace-resort-struck.json). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-d/palace-resort/ (listings.json, county.json, flood.json; README.md has the rerun order).
 * Every count, fee, price, share and chart value is read from those files here and checked against its
 * ledger row with must(); a changed file stops the build until a person reads the row again.
 * Row 25 (AirROI by size) is CORRECTED to "print no figure": the page links /invest/airbnb-income/ instead.
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates
 * (data/2026-11-d/palace-resort/images/label.py; record in photos.json), until the photo partner's shots arrive.
 * Homes: the CRM place "the-palace" (index false) fills the strip under the short answer. The page has no
 * edge feed of its own (idx-lib/feeds.js), so the strip is the opening's homes, and there is never a second.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/palace-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", "palace-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`palace-resort.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 1: 241 feet (FAA Digital Obstacle File 45-000725). A fixed fact, typed. */
const FEET = 241;
/* Row 2 (CORRECTED wording): floors numbered 1 to 12 and 14 to 23; 10 condos on each of the top two. */
const FLR = C.floors;
must(FLR.top === 23 && FLR.missing_between.join() === "13" && FLR.count === 22, "row 2 floors changed");
must(FLR.units_per_floor["22"] === 10 && FLR.units_per_floor["23"] === 10 && FLR.units_per_floor["2"] === 14, "row 2 units per floor changed");
/* Row 3: built in the mid-1980s. */
must(L.year_built["1986"] === 22 && L.year_built["1985"] === 2 && L.year_built["1987"] === 1, "row 3 changed");
/* Row 4: 302 units, 298 of them condos. */
must(C.units === 302 && C.landuse_first_digit["1xx"] === 298 && C.landuse_first_digit["3xx"] === 4, "row 4 changed");
const UNITS = C.units, CONDOS = C.landuse_first_digit["1xx"];
/* Row 6: the fee by size, to the dollar (bisection), rounded to $5 as the directory does. */
const FX = L.fee_exact;
must(FX["0"].n === 10 && FX["0"].lowest === 455 && FX["0"].highest === 460, "row 6 studio fee changed");
must(FX["1"].n === 7 && FX["1"].lowest === 683 && FX["1"].highest === 690, "row 6 one-bedroom fee changed");
must(FX["2"].n === 8 && FX["2"].lowest === 910 && FX["2"].highest === 920, "row 6 two-bedroom fee changed");
const FEE = ["0", "1", "2"].map((k) => (FX[k].lowest + FX[k].highest) / 2);
must(r5(FEE[0]) === "$460" && r5(FEE[1]) === "$685" && r5(FEE[2]) === "$915", "row 6 rounding");
/* Row 9: a year of fees. */
const FEE_YEAR = FEE.map((f) => f * 12);
must(r100(FEE_YEAR[0]) === "$5,500" && r100(FEE_YEAR[1]) === "$8,200" && r100(FEE_YEAR[2]) === "$11,000", "row 9 changed");
/* Row 8: what the fee pays, by the listings' own flags. */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 24 && FG.hoa_includes_trash === 23 && FG.hoa_includes_insurance === 23 && FG.hoa_includes_internet === 23 && FG.hoa_includes_pest === 18 && FG.hoa_includes_electric === 0, "row 8 changed");
/* Row 12: for sale now, by size. */
const A = L.asking;
must(L.api_total === 25 && L.beds["0"] === 10 && L.beds["1"] === 7 && L.beds["2"] === 8, "row 12 counts changed");
must(A["0"].median === 132450 && A["1"].median === 164900 && A["2"].median === 218750, "row 12 asking middles changed");
must(A["0"].sqft_range.join() === "341,478" && A["1"].sqft_range.join() === "509,539" && A["2"].sqft_range.join() === "739,950", "row 12 sizes changed");
/* Row 11: fees plus property tax at the rental rate (6 percent of value, City of Myrtle Beach 254.6 mills, CON row 21),
   at today's typical asking price, before any exemption. */
const MILLS = 254.6;
const TAX = [A["0"].median, A["2"].median].map((p) => p * 0.06 * MILLS / 1000);
must(Math.round(TAX[0]) === 2023 && Math.round(TAX[1]) === 3342, "row 11 tax changed");
const HOLD_STUDIO = FEE_YEAR[0] + TAX[0], HOLD_TWO = FEE_YEAR[2] + TAX[1];
/* The total is rounded to $100, as its two parts are, so the column adds up (review 1: $11,000 + $3,300). */
must(r100(HOLD_STUDIO) === "$7,500" && r100(HOLD_TWO) === "$14,300", "row 11 totals changed");
must(r100(FEE_YEAR[0]) === "$5,500" && r100(TAX[0]) === "$2,000" && r100(FEE_YEAR[2]) === "$11,000" && r100(TAX[1]) === "$3,300", "row 11 parts changed");
/* Row 13: what the listings say about the units. */
must(FG.furnished === 25 && FG.covered_parking === 25 && FG.ocean_view === 23 && FG.oceanfront_unit === 8, "row 13 changed");
/* Rows 14 and 15: recorded deeds, the directory's window. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30", "row 14 window changed");
must(SW.all.n === 21 && SW.all.median === 142000 && SW.all.p25 === 112500 && SW.all.p75 === 156950, "row 14 changed");
must(SW.floors_1_to_10.n === 10 && SW.floors_1_to_10.median === 112500 && SW.floors_11_up.n === 11 && SW.floors_11_up.median === 154000, "row 15 changed");
const ONE_IN = Math.round(UNITS / SW.all.n);
must(ONE_IN === 14, "row 14 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 17: taxed as the owner's home. */
must(C.taxed_as_home_4pct === 32 && Math.round(C.taxed_as_home_4pct / UNITS * 10) === 1, "row 17 changed");
/* Row 20: rentals, by the listings' flags. */
must(FG.str_allowed === 22 && FG.vacation_rental_program === 21, "row 20 changed");
const IN_PROGRAM = Math.round(FG.vacation_rental_program / L.api_total * 10);
must(IN_PROGRAM === 8, "row 20 share changed");
/* Row 32 (CORRECTED wording): flood zones under the lot. */
const zone = (z) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
must(zone("AE").share_of_footprint === 0.037 && zone("AE").attributes.STATIC_BFE === 12 && zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint === 0.728 && FL.share_in_no_zone === 0.235, "row 32 changed");
const AE_PCT = Math.round(zone("AE").share_of_footprint * 100);
/* Row 27: every studio under 500 square feet; every one- and two-bedroom over. */
must(A["0"].sqft_range[1] < 500 && A["1"].sqft_range[0] > 500 && A["2"].sqft_range[0] > 500, "row 27 changed");
/* The listings' read time (row 12). Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`; /* the year once in the body is enough */
/* Row 12a (VERIFIED-BY-FIXER): the middle asking price of all 25, against the sales middle (row 14). */
must(A.all.median === 159999 && A.all.min === 110000 && A.all.max === 255000, "row 12a asking middle changed");
must(A.all.median > SW.all.median, "row 12a: asking is no longer above the sales middle; rewrite the sentence");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main: the bar pages' design (garden-city.js), the  */
/* italic line at about half the H1's size, one card style, plain lists.          */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:1rem!important;row-gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.55rem!important;padding:.5rem 0!important;min-width:0}${S} .c3-glance li:nth-last-child(-n+2){border-bottom:${RULE}!important}}`
  /* Under 360 px the icons leave too little room for two columns; the words stay. */
  + `@media (max-width:359px){${S} .c3-glance li>span.i{display:none!important}${S} .c3-glance{column-gap:.8rem!important}}`
  + `${S} h2{text-wrap:balance}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  + `${S} .c3-pr-list{list-style:none;padding:0;margin:1rem 0 1.4rem;max-width:720px}`
  + `${S} .c3-pr-list li{margin:0;padding:.8rem 0 .85rem;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} .c3-pr-list li:last-child{border-bottom:${RULE}}${S} .c3-pr-list strong{color:var(--navy);display:block;margin-bottom:.15rem}`
  + `${S} .c3-pr-up{margin:1.4rem 0 0;max-width:720px;color:var(--muted);line-height:1.7}`
  + `${S} .c3-gchart,${S} .c3-cc,${TBL}{max-width:720px!important;box-sizing:border-box}`
  /* Plain tables under thin rules, no card (garden-city.js design pass). */
  + `${TBL}{${FLAT};padding:0!important}${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  /* The homes strip under the short answer, with room before the first heading. */
  + `${S} .c3-pr-open .hx-strip:not(:empty){margin:0 0 1.2rem}`
  /* The end band: the bar pages' rounded card (garden-city.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  + `@media (max-width:359px){${S} .hx-feed .hx-fb-ai,${S} label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* The picture: one labelled NAIP aerial (public domain), under its sentence.     */

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/palace-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 6, 9, 12). The floor chart was removed in review 1: its     */
/* title said high floors earn more, and its note said the gap is mostly size.    */

const SIZES = [
  { name: "Studio", k: "0", sleeps: 4 },
  { name: "One-bedroom", k: "1", sleeps: 4 },
  { name: "Two-bedroom", k: "2", sleeps: 6 },
];
const FEE_TABLE = compareCards(SIZES.map((s, i) => ({
  name: s.name,
  bestFor: `${A[s.k].sqft_range[0]} to ${A[s.k].sqft_range[1]} sq ft, sleeps\u00a0${s.sleeps}`,
  cells: { fee: `About ${r5(FEE[i])}`, year: `About ${r100(FEE_YEAR[i])}`, ask: `About ${r1k(A[s.k].median)}`, sale: `${L.beds[s.k]}` },
})), [
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "year", label: "Fees a year", num: true },
  { key: "ask", label: "Middle asking price", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At the Palace, the fee goes by the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.palaceresort.com/";
const WATERPARK = "https://www.palaceresort.com/waterpark-access/";
const AMENITIES = "https://www.palaceresort.com/amenities/";
const FAQPAGE = "https://www.palaceresort.com/faq/";
const PROGRAM = "https://www.palaceresort.com/rental-management/";
const ROOMS = "https://www.palaceresort.com/accommodations/";
const DOF = "https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/dof/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const FANNIE = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const HUD = "https://entp.hud.gov/idapp/html/condlook.cfm";

/* ---------------------------------------------------------------------------- */
/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "The Palace Resort", alternateName: ["The Palace", "Palace Resort Myrtle Beach"],
  description: `A ${FEET}-foot oceanfront condo tower with ${CONDOS} condos on the south end of Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "1605 S Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* ---------------------------------------------------------------------------- */
/* The offers (no two with the same words).                                       */

/* Round 2 (owner, 2026-11-14): live strips, no "send me" offer. The MLS spells the building "PALACE, THE". */
const STRIP = G.homesQScript() + G.homesQ("subdivision=PALACE, THE", "Own a condo in the Palace Resort, on the ocean");
const STRIP_NEAR = G.homesQ(`near=${FL.footprint_center[0]},${FL.footprint_center[1]}&miles=1&type=condo&has=oceanfront_unit`, "Oceanfront condos within a mile of the Palace");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Palace Resort Myrtle Beach Condos for Sale: Fees From ${r5(FEE[0])}`,
  description: `The Palace Resort, 1605 S Ocean Blvd, Myrtle Beach: HOA fees by unit size, what they pay, nightly rentals and the water park, and what ${SW.all.n} units sold for.`,
  ogTitle: "The Palace Resort, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "The Palace",
  eyebrow: "Palace Resort, Myrtle Beach",
  h1: "The Palace Resort, Myrtle Beach: condos for sale on the ocean.",
  h1em: `A ${FEET}-foot tower with a water park next door.`,
  sub: `Two pools on the ocean with a putting green beside them, and three 40-foot water slides at the resort next door, at 1605 S Ocean Blvd.`,
  heroMedia: glance([
    { icon: "beach", label: "On the beach", text: `${FEET}-foot tower` },
    { icon: "home", label: "Condos", text: `${CONDOS}` },
    { icon: "calendar", label: "Built", text: "Mid-1980s" },
    { icon: "key", label: "Nightly rentals", text: "Allowed" },
  ]),
  /* The homes strip under the short answer is the first offer (owner, 2026-11-08: "horizontal idx listings is the strongest
     tool we have"); its pill is the fallback while it is empty. */
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The Palace Resort is a ${FEET}-foot tower on the beach at the south end of Myrtle Beach. It holds ${CONDOS} condos you can own: studios, one-bedrooms and two-bedrooms. The middle sale price over the past year was about ${money(SW.all.median)}.`,
    `The monthly HOA fee goes by the unit's size: about ${r5(FEE[0])} for a studio, ${r5(FEE[1])} for a one-bedroom and ${r5(FEE[2])} for a two-bedroom. Units may rent by the night, and guests who book through the resort's own rental program get the water park next door.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">The Palace is one of 47 buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at the Palace?", toc: "Owning here", id: "owning", html: () =>
      h.p(`Book a stay through the Palace's own rental program, and the first two guests on the reservation get the H2Oasis water park free, every day of the stay. H2Oasis is next door at Landmark Resort. Its three slides are each 40 feet tall, and the longest runs 250 feet.`) +
      h.p(`Other guests in the room can buy a pass for $5. The water park opens for the summer season. For an owner who rents through the resort, it is a reason a guest picks your unit over one down the beach.`) +
      h.p(`Whether owners get passes is in the association's rules, and we ask before you offer.`) +
      h.p(`The Palace has its own two pools on the ocean, three outdoor whirlpools, an indoor whirlpool and a sauna. A putting green sits next to the oceanfront pools, and two beach accesses lead to the sand. Most of the outdoor features are open in season.`) +
      h.h3(`A ${FEET}-foot tower on the south end`) +
      h.p(`The Palace stands ${FEET} feet tall. No floor is numbered 13: unit numbers run on floors 1 to 12 and 14 to 23. The top two floors hold ${FLR.units_per_floor["23"]} condos each, against ${FLR.units_per_floor["2"]} on most floors below.`) +
      h.p(`It stands next door to Landmark Resort, on the south end of the city's oceanfront. Family Kingdom's rides are under a mile north along the beach, and Springmaid Pier is about a mile and a half south.`) +
      PHOTO +
      h.p(`Every unit has a full kitchen, and the resort lists a private balcony among its room features. The resort calls a studio an efficiency. A studio or a one-bedroom sleeps 4, and a two-bedroom sleeps 6.`) +
      h.p(`All ${L.api_total} condos for sale on ${RUN} came furnished, with covered parking. ${FG.ocean_view} were listed with an ocean view, and ${FG.oceanfront_unit} of those as oceanfront units.`) +
      STRIP_NEAR },

    { h2: "What are the HOA fees at the Palace Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`At the Palace Resort, the HOA fee pays water and sewer, trash, internet and the building's insurance, by nearly every listing. Most listings add pest control. Units of the same size list nearly the same fee.`) +
      FEE_TABLE +
      h.p(`None of the listings says the fee pays the power bill. You also need your own policy on the inside of the unit; our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("What a year costs before any loan") +
      h.p(`A studio at the middle asking price costs about ${r100(HOLD_STUDIO)} a year to hold, before power and your unit's own insurance.`) +
      h.table(["Each year, at the middle asking price", "Studio", "Two-bedroom"], [
        ["HOA fees", r100(FEE_YEAR[0]), r100(FEE_YEAR[2])],
        ["Property tax as a rental, before any exemption", r100(TAX[0]), r100(TAX[1])],
        ["<strong>About</strong>", `<strong>${r100(HOLD_STUDIO)}</strong>`, `<strong>${r100(HOLD_TWO)}</strong>`],
      ]) +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value, and a sale resets the value to about the price. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.p(`Buyers in most associations here, with a rental program or not, pay a transfer fee at closing. Many also put a few months of dues in escrow, an account that holds the money until it is due.`) +
      h.cta("Know the Palace's fees before you offer", "We ask the association for the unit's dues, its transfer fee and any dues held at closing, and add them up for you.", "Have us get a Palace unit's fees", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at the Palace Resort?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes. The Palace is in a City of Myrtle Beach zoning district where nightly rentals are allowed, and the resort itself rents units by the night. About ${IN_PROGRAM} in 10 of the condos for sale on ${RUN_MD} were in a rental program.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's own program</strong>The Palace runs an on-site rental program, part of the Vacation Myrtle Beach group. It collects and pays the lodging taxes, sends monthly and year-end statements, and holds the rent in escrow, a separate account, until it pays the owner. Its guests get the water-park passes.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`The program does not publish its share of the rent, so we get its terms for any unit you consider. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`What studios, one-bedrooms and two-bedrooms earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for the Palace alone.`) +
      h.h3("The resort's rules for guests") +
      h.p(`Guests must be 21 to check in. Guests may not bring pets, and a $500 fine applies; registered service animals are not counted as pets. Guests register one car for a studio or one-bedroom, and up to two for a two-bedroom.`) +
      h.p(`An owner's own rules on pets and cars are in the condo's founding documents and rules. We read them before you offer.`) },

    { h2: "What have Palace Resort condos sold for?", toc: "Sales", id: "sales", html: (bg) =>
      h.p(`${SW.all.n} Palace condos sold in the past year by Horry County's deed records. That is about 1 in ${ONE_IN} units in the building changing hands in a year.`) +
      h.table(["Palace condos", "Price"], [
        ["Middle sale price, past year", `About ${money(SW.all.median)}`],
        ["Middle half of the sales", `About ${money(SW.all.p25)} to ${r500(SW.all.p75)}`],
        [`Middle asking price, ${L.api_total} for sale on ${RUN_SHORT}`, `About ${r1k(A.all.median)}`],
      ]) +
      h.p(`Asking prices ran above what units sold for. Upper-floor sales ran higher, mostly because more of them were larger units.`) +
      h.p(`The deeds do not record bedrooms, so we compare a unit with sales of its own size. We price an offer from the recorded sales.`) +
      h.p(`Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) },

    { h2: "What we check before you buy at the Palace", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>About three quarters of the lot is in FEMA's moderate flood zone, and about a quarter in its lowest-risk zone. About ${AE_PCT} percent, a strip on the ocean side, is in the high-risk zone. We check the flood map for the building itself and the flood cover in the building's policy.</li>`
        + `<li><strong>The building's age</strong>Built in the mid-1980s. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Who uses the units</strong>About 1 in 10 units is taxed as the owner's home. Nearly all the rest pay the higher rate for second homes and rentals.</li>`
        + `<li><strong>If you will use a loan</strong>Many standard loans will not cover a unit in a building run like a hotel. The Palace is not on HUD's list of condos approved for FHA loans. One published condotel loan program asks for at least 500 square feet and a separate bedroom. Every studio for sale is under that size; the one- and two-bedrooms are over it. Ask a lender before you choose a studio.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Palace unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.cta("Have us check a Palace unit before you offer", "We go through each check above for the unit you like, and we get the rental program's terms and the unit's booking history.", "Have us check a Palace unit", "/contact/", bg) +
      h.p(`To weigh the Palace against the other 46 buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) },
  ],
  faqTitle: "Palace Resort Myrtle Beach FAQ",
  faq: [
    { q: "When was the Palace Resort in Myrtle Beach built?", a: "The Palace Resort was built in the mid-1980s, so the tower is about 40 years old." },
    { q: "How tall is the Palace Resort?", a: `The Palace Resort stands ${FEET} feet tall. No floor is numbered 13: unit numbers run on floors 1 to 12 and 14 to 23.` },
    { q: "Is the Palace a hotel or condos?", a: `Both. Its ${CONDOS} condos are owned one by one, and the resort's own rental program rents many of them to guests by the night.` },
    { q: "Is the water park free at the Palace Resort?", a: "For the first two guests of each reservation booked through the Palace's own rental program, yes, every day of the stay, in season. Other guests in the room can buy a pass." },
    { q: "Is the Palace Resort pet friendly?", a: "Guests may not bring pets; registered service animals are not counted as pets. An owner's own pet rules are in the condo's founding documents, and we read them before you offer." },
    { q: "What is the address of the Palace Resort?", a: "The Palace Resort is at 1605 S Ocean Blvd, Myrtle Beach, SC 29577, on the south end of the city's oceanfront." },
    { q: "How many Palace Resort condos are for sale?", a: `On ${RUN}, ${L.api_total} Palace Resort condos were for sale: ${L.beds["0"]} studios, ${L.beds["1"]} one-bedrooms and ${L.beds["2"]} two-bedrooms.` },
  ],
  sources: [
    { name: "Palace Resort", href: RESORT },
    { name: "water park", href: WATERPARK },
    { name: "amenities", href: AMENITIES },
    { name: "guest FAQ", href: FAQPAGE },
    { name: "rental program", href: PROGRAM },
    { name: "rooms", href: ROOMS },
    { name: "FAA obstacle file", href: DOF },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "Fannie Mae", href: FANNIE },
    { name: "HUD condo list", href: HUD },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at the Palace.",
    p: "Tell us the size you want and the days you are here. An agent shows you the Palace units for sale in that size.",
    label: "Book a showing at the Palace", href: "/contact/",
  },
  keywords: "Palace Resort Myrtle Beach condos for sale, The Palace Myrtle Beach for sale, Palace Resort Myrtle Beach HOA fees, The Palace Myrtle Beach condo fees, Palace Resort Myrtle Beach Airbnb, 1605 S Ocean Blvd Myrtle Beach, Palace Resort water park, when was the Palace Resort built",
  about: "The Palace Resort, a 302-unit oceanfront condo tower at 1605 S Ocean Blvd, Myrtle Beach, South Carolina",
});
