/* /invest/condo-buildings/grand-atlantic/ - the Grand Atlantic, 2007 S Ocean Blvd, Myrtle Beach: what owning
 * a condo there gives you, the HOA fee by unit size and what it pays, renting it by the night, what units
 * sold for, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N, in the style of the Palace Resort pilot (specs/palace-resort.js).
 * Facts: Blog-Brain batches/2026-11-e/grand-atlantic/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md; struck wording in batches/2026-11-e/facts/
 * invest-condo-buildings-grand-atlantic-struck.json). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-e/grand-atlantic/ (listings.json, county.json, flood.json, tax.json).
 * Every count, fee, price, share and tax figure is read from those files here and checked against its
 * ledger row with must(); a changed file stops the build until a person reads the row again.
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates
 * (data/2026-11-e/grand-atlantic/images/label.py; record in photos.json), until the photo partner's shots arrive.
 * Homes: two live strips (G.homesQ): all nine condos at the top, the four-bedrooms after the fees.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/grand-atlantic/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "grand-atlantic");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TX = read("tax.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r100 = (v) => money(Math.round(v / 100) * 100);
const must = (ok, msg) => { if (!ok) throw new Error(`grand-atlantic.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 4 (CORRECTED): about 220 feet by the FAA obstacle file (223 ft), no ranking, no story count. */
const FEET = "about 220 feet";
/* Row 3 (CORRECTED): 136 units, 133 condos, 3 commercial; floors numbered 2 to 12 and 14 to 20, plus 7 penthouses. */
const FLR = C.floors;
must(C.units === 136 && C.landuse_first_digit["1xx"] === 133 && C.landuse_first_digit["3xx"] === 3, "row 3 counts changed");
must(FLR.top === 20 && FLR.missing_between.join() === "13" && FLR.count === 18 && FLR.units_per_floor["2"] === 7 && FLR.units_per_floor["20"] === 7, "row 3 floors changed");
const UNITS = C.units, CONDOS = C.landuse_first_digit["1xx"];
/* Row 5: built 2005 to 2006. */
must(L.year_built["2006"] === 8 && L.year_built["2005"] === 1, "row 5 changed");
/* Row 9: the fee by size, to the dollar (bisection). */
const FX = L.fee_exact;
must(FX["1"].n === 1 && FX["1"].lowest === 865 && FX["1"].highest === 865, "row 9 one-bedroom fee changed");
must(FX["2"].n === 3 && FX["2"].lowest === 1160 && FX["2"].highest === 1203, "row 9 two-bedroom fee changed");
must(FX["3"].n === 2 && FX["3"].lowest === 1430 && FX["3"].highest === 1430, "row 9 three-bedroom fee changed");
must(FX["4"].n === 3 && FX["4"].lowest === 1993 && FX["4"].highest === 1995, "row 9 four-bedroom fee changed");
const mid = (k) => (FX[k].lowest + FX[k].highest) / 2;
must(r5(FX["1"].lowest) === "$865" && r5(FX["2"].lowest) === "$1,160" && r5(FX["2"].highest) === "$1,205" && r5(mid("4")) === "$1,995", "row 9 rounding");
const YEAR = (v) => v * 12;
must(r100(YEAR(FX["1"].lowest)) === "$10,400" && r100(YEAR(FX["2"].lowest)) === "$13,900" && r100(YEAR(FX["2"].highest)) === "$14,400" && r100(YEAR(FX["3"].lowest)) === "$17,200" && r100(YEAR(mid("4"))) === "$23,900", "row 9 yearly rounding");
/* Row 10: what the fee pays, by the listings' own flags. */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 9 && FG.hoa_includes_trash === 9 && FG.hoa_includes_utilities === 9 && FG.hoa_includes_insurance === 9 && FG.hoa_includes_electric === 8 && FG.hoa_includes_cable === 8 && FG.hoa_includes_internet === 8 && FG.hoa_includes_pest === 6, "row 10 changed");
/* Rows 1, 7, 8: for sale now. */
const A = L.asking;
must(L.api_total === 9 && L.at_2007 === 9 && L.beds["1"] === 1 && L.beds["2"] === 3 && L.beds["3"] === 2 && L.beds["4"] === 3, "rows 1 and 7 counts changed");
must(A.all.min === 234900 && A.all.max === 550000 && A["2"].min === 320000 && A["2"].max === 365000 && A["4"].min === 529000 && A["4"].max === 550000, "row 8 asking changed");
/* Row 6: sizes, as the listings' ranges (the resort rounds them). */
must(A["1"].sqft_range.join() === "776,776" && A["2"].sqft_range.join() === "1035,1074" && A["3"].sqft_range.join() === "1276,1300" && A["4"].sqft_range.join() === "1779,1780", "row 6 sizes changed");
/* Row 11 and 13: rentals and furnishing, by the listings' flags. */
must(FG.str_allowed === 9 && FG.vacation_rental_program === 9 && FG.long_term_rental_allowed === 8 && FG.furnished === 9 && FG.oceanfront_unit === 9 && FG.indoor_pool === 7, "rows 11 and 13 changed");
/* Row 19 (CORRECTED): 5 sales in the 12 months to 2026-09-30, $220,000 to $500,000. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30" && SW.all.n === 5 && SW.all.min === 220000 && SW.all.max === 500000, "row 19 changed");
const ONE_IN = Math.round(UNITS / SW.all.n);
must(ONE_IN === 27, "row 19 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 20 (CORRECTED): of the 133 condos, 120 tax bills go out of state, 2 are taxed as a home. */
must(C.owner_out_of_sc === 120 && C.taxed_as_home_4pct === 2, "row 20 changed");
/* Row 21: tax, the middle unit at the 2026 city rate, before any exemption. */
must(TX.units_at_6pct === 131 && TX.implied_tax_city_millage.median === 4392 && TX.implied_tax_city_millage.p25 === 3338 && TX.implied_tax_city_millage.p75 === 5194, "row 21 changed");
must(Math.round(TX.taxable_below_market_share * 100) === 72, "row 21 cap share changed");
const TAX_MID = TX.implied_tax_city_millage.median;
const HOLD_TWO = YEAR(mid("2")) + TAX_MID;
must(r100(YEAR(mid("2"))) === "$14,200" && r100(TAX_MID) === "$4,400" && r100(HOLD_TWO) === "$18,600", "row 21 totals changed");
/* Row 18: flood zones under the lot. */
const zone = (z) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
must(zone("VE").share_of_footprint === 0.796 && zone("VE").attributes.STATIC_BFE === 14 && zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint === 0.204 && FL.share_in_no_zone === 0, "row 18 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;

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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/grand-atlantic-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 6, 7, 9).                                                  */

const range = (a, b, f) => (a === b ? f(a) : `${f(a)} to ${f(b)}`);
const SIZES = [
  { name: "One-bedroom", k: "1", sleeps: "6" },
  { name: "Two-bedroom", k: "2", sleeps: "6 to 8" },
  { name: "Three-bedroom", k: "3", sleeps: "10" },
  { name: "Four-bedroom", k: "4", sleeps: "14 or 16" },
];
const FEE_TABLE = compareCards(SIZES.map((s) => ({
  name: s.name,
  bestFor: `${range(A[s.k].sqft_range[0], A[s.k].sqft_range[1], n)} sq ft`,
  cells: {
    sleeps: s.sleeps,
    fee: `About ${range(r5(FX[s.k].lowest), r5(FX[s.k].highest), (x) => x)}`,
    year: `About ${range(r100(YEAR(FX[s.k].lowest)), r100(YEAR(FX[s.k].highest)), (x) => x)}`,
    sale: `${L.beds[s.k]}`,
  },
})), [
  { key: "sleeps", label: "Sleeps (resort)", num: true },
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "year", label: "Fees a year", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At the Grand Atlantic, the fee goes by the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://grandatlanticresort.com/";
const AMENITIES = "https://grandatlanticresort.com/our-amenities/";
const FAQPAGE = "https://grandatlanticresort.com/faqs/";
const CONDOS_PAGE = "https://grandatlanticresort.com/myrtle-beach-condos/";
const DOF = "https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/dof/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const FANNIE = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "The Grand Atlantic", alternateName: ["Grand Atlantic Resort", "Grand Atlantic Myrtle Beach"],
  description: `An oceanfront condo tower with ${CONDOS} condos on the south end of Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "2007 S Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips (owner, 2026-11-14): the nine condos at the top, the four-bedrooms after the fees. Both searches checked
   against /homes/api/strip on 2026-11-14: 9 and 3 homes. beds is a minimum; 4 is exact here because none is larger. */
const STRIP = G.homesQScript() + G.homesQ("subdivision=Grand Atlantic&type=condo", "Own an oceanfront condo at the Grand Atlantic, in Myrtle Beach");
const STRIP_NEAR = G.homesQ(`near=${FL.footprint_center[0]},${FL.footprint_center[1]}&miles=1&type=condo&has=oceanfront_unit`, "Oceanfront condos within a mile of the Grand Atlantic");
const STRIP_FOUR = G.homesQ("subdivision=Grand Atlantic&type=condo&beds=4", "Four-bedroom condos at the Grand Atlantic, sleeping 14 or 16");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Grand Atlantic Myrtle Beach Condos for Sale: Fees From ${r5(FX["1"].lowest)}`,
  description: `The Grand Atlantic, 2007 S Ocean Blvd, Myrtle Beach: HOA fees by size, what they pay, flood zone, nightly rentals and what ${SW.all.n} units sold for.`,
  ogTitle: "The Grand Atlantic, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "The Grand Atlantic",
  eyebrow: "Grand Atlantic, Myrtle Beach",
  h1: "The Grand Atlantic, Myrtle Beach: condos for sale on the ocean.",
  h1em: "A tower on the beach with an indoor pool area.",
  sub: `The Grand Atlantic condos for sale stand on an oceanfront lot where about ${Math.round(zone("VE").share_of_footprint * 100)} percent is in FEMA's coastal high-hazard zone, called VE.`,
  heroMedia: glance([
    { icon: "beach", label: "On the beach", text: `${FEET[0].toUpperCase() + FEET.slice(1)} tall` },
    { icon: "home", label: "Condos", text: `${CONDOS}` },
    { icon: "calendar", label: "Flood zone", text: `${Math.round(zone("VE").share_of_footprint * 100)}% of the lot is VE` },
    { icon: "key", label: "Nightly rentals", text: "Allowed" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The Grand Atlantic is an oceanfront tower on the south end of Myrtle Beach, ${FEET} tall by the FAA's obstacle file. It holds ${CONDOS} condos you can own, from one to four bedrooms, built in the mid-2000s.`,
    `The monthly HOA fee goes by the unit's size: about ${r5(FX["1"].lowest)} for a one-bedroom, up to about ${r5(mid("4"))} for a four-bedroom. Nearly every listing says it pays water, trash, insurance, cable and power. Units may rent by the night.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `${PHOTO}<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">The Grand Atlantic is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at the Grand Atlantic?", toc: "Owning here", id: "owning", html: () =>
      h.p(`The resort lists an indoor lazy river, an indoor pool and hot tubs, beside a large heated pool on the ocean and a children's splash pool. It also lists a game room, a fitness room and a walkway to the beach, and says its pool areas were renovated.`) +
      h.p(`The lazy river has one source, the resort's own listing, so we ask whether it is open before you count on it.`) +
      h.h3(`A tower ${FEET} tall`) +
      h.p(`The FAA's obstacle file puts the building at ${FEET}. No floor is numbered 13: unit numbers run on floors 2 to 12 and 14 to 20, plus seven penthouses. Seven condos sit on each numbered floor.`) +
      h.p(`The tower stands about a third of a mile south of ${h.a("/invest/condo-buildings/palace-resort/", "the Palace Resort")}. Family Kingdom is about 1.2 miles north-east in a straight line, and Springmaid Pier about 1.1 miles south-west. The Market Common is about 2 miles to its center.`) +
      h.h3("Inside the unit, and where you park") +
      h.p(`The resort says each oceanfront condo has a full kitchen, a washer and dryer, and an oceanfront balcony. A one-bedroom sleeps 6, a three-bedroom sleeps 10, and a four-bedroom sleeps 14 or 16.`) +
      h.p(`The garage has 6 levels. Its clearance is 6 feet 7 inches, so a tall van or a roof box may not fit. The resort gives a one-bedroom 1 parking permit and a two-bedroom up to 2. Owners' parking rules are in the condo's founding documents.`) +
      h.p(`All ${L.api_total} condos for sale on ${RUN_MD} came furnished and were listed as oceanfront units. The building is about 20 years old, so we read the reserve study before you offer.`) },

    { h2: "What are the HOA fees at the Grand Atlantic?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`At the Grand Atlantic, the HOA fee is about ${r5(FX["1"].lowest)} a month for a one-bedroom and about ${r5(mid("4"))} for a four-bedroom. Units of the same size list nearly the same fee.`) +
      FEE_TABLE +
      h.p(`The one-bedroom is the one for sale on ${RUN_MD}, so its fee is a single listing. Two-bedrooms ask ${money(A["2"].min)} to ${money(A["2"].max)} and four-bedrooms ${money(A["4"].min)} to ${money(A["4"].max)}. All ${L.api_total} together ask about ${money(Math.round(A.all.min/1000)*1000)} to ${money(A.all.max)}.`) +
      h.p(`Nearly every listing says the fee pays water and sewer, trash, utilities and the building's insurance. ${FG.hoa_includes_electric} of ${L.api_total} add electric, cable and internet, and ${FG.hoa_includes_pest} add pest control.`) +
      h.p(`You still need your own policy on the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      STRIP_FOUR +
      h.h3("What a year costs before any loan") +
      h.p(`A two-bedroom, taxed at the middle value in the building, costs about ${r100(HOLD_TWO)} a year to hold, before your unit's own insurance.`) +
      h.table(["Each year, for a two-bedroom", "About"], [
        ["HOA fees", r100(YEAR(mid("2")))],
        ["Property tax at the building's middle value, as a rental, before any exemption", r100(TAX_MID)],
        ["<strong>Together</strong>", `<strong>${r100(HOLD_TWO)}</strong>`],
      ]) +
      h.h3("How the tax is set") +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value, and ${TX.units_at_6pct} of the ${CONDOS} condos are taxed that way. Across the building, the middle half of the units pay about ${r100(TX.implied_tax_city_millage.p25)} to ${r100(TX.implied_tax_city_millage.p75)} a year at the city's 2026 rate.`) +
      h.p(`${Math.round(TX.taxable_below_market_share * 100)} percent of the units are taxed on less than their market value, and a sale can reset that to about the price. The real bill for one unit is on the county's public record: ${h.a("/buyers/property-records/tax-bill/", "look up a unit's tax bill")} on our lookup. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.h3("What you pay at closing") +
      h.p(`Buyers in most associations here, with a rental program or not, pay a transfer fee at closing. Many also put a few months of dues in escrow, an account that holds the money until it is due.`) +
      h.cta("Know the Grand Atlantic's fees before you offer", "We ask the association for the unit's budget, its reserve study and any assessment, and add up the fees for you.", "Have us get the Grand Atlantic's budget", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at the Grand Atlantic?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes. The Grand Atlantic is in a City of Myrtle Beach zoning district where nightly rentals are allowed, and the resort itself rents units by the night. All ${FG.vacation_rental_program} of the condos for sale on ${RUN_MD} said they were in a rental program.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort</strong>The Grand Atlantic calls itself a condotel, with a 24-hour front desk, maintenance and housekeeping. Each unit is owned by an individual, and its owner's decor is part of the stay.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself. ${FG.long_term_rental_allowed} of the ${L.api_total} listings also allow long-term rentals. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`The resort does not publish its share of the rent, so we get the program's terms for any unit you consider. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`What one-bedrooms and larger condos earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for the Grand Atlantic alone.`) +
      h.h3("The resort's rules for guests") +
      h.p(`The resort is pet free, and service animals are allowed. It is smoke free, balconies included. Check-in is at 4 pm, and the resort has reduced daily housekeeping.`) +
      h.p(`${FG.pets_allowed} of the ${L.api_total} listings tick pets allowed, so an owner's own rules differ from the guest rules. They are in the condo's founding documents, and we read them before you offer.`) },

    { h2: "What have Grand Atlantic condos sold for?", toc: "Sales", id: "sales", html: (bg) =>
      h.p(`${SW.all.n} Grand Atlantic condos sold in the ${PERIOD} by Horry County's deed records, for ${money(SW.all.min)} to ${money(SW.all.max)}. That is about 1 in ${ONE_IN} units in the building changing hands in a year.`) +
      h.p(`Five sales is too few for a middle price or a chart, and a unit's price depends on its size and floor. The deeds do not record bedrooms, so we compare a unit with sales of its own size.`) +
      h.p(`We price an offer from those recorded sales. Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) },

    { h2: "What we check before you buy at the Grand Atlantic", toc: "Our checks", id: "checks", html: (bg) =>
      h.h3("The lot and the building") +
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zone</strong>About ${Math.round(zone("VE").share_of_footprint * 100)} percent of the lot is in FEMA's coastal high-hazard zone, called VE, where waves can reach in a big storm. FEMA's flood elevation for that zone is ${zone("VE").attributes.STATIC_BFE} feet. The other ${Math.round(zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint * 100)} percent is in the moderate zone. That is the lot, not the floors. We check the building's flood cover and what your lender asks.</li>`
        + `<li><strong>The building's age</strong>Built in the mid-2000s. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `</ul>` + h.h3("The owners and the loan") + `<ul class="c3-pr-list">`
        + `<li><strong>Who uses the units</strong>The tax bills of ${C.owner_out_of_sc} of the ${CONDOS} condos go to an address outside South Carolina. ${C.taxed_as_home_4pct} of the ${CONDOS} are taxed as someone's home.</li>`
        + `<li><strong>A loan</strong>Many standard loans will not cover a unit in a building run like a hotel, and the Grand Atlantic calls itself a condotel. In our agents' experience, buildings with a rental program are usually non-warrantable, because so many owners are investors. Ask a lender before you choose a unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.</li>`
        + `</ul>` +
      h.cta("Have our affiliated lender look at the unit before you offer", "Our affiliated lender, BrickWood Mortgage, a separate company, tells you which loans fit a Grand Atlantic unit.", "Have our affiliated lender look at a unit", "/contact/", bg) +
      h.p(`To weigh the Grand Atlantic against the other oceanfront buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) },

    { html: () => `<div class="c3-pr-open">${STRIP_NEAR}</div>` + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (about half a mile) and ${h.a("/invest/condo-buildings/landmark-resort/", "Landmark Resort")} (about half a mile). Farther north: ${h.a("/invest/condo-buildings/sea-mist-resort/", "Sea Mist Resort")} (about half a mile) and ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 2 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/paradise-resort/", "Paradise Resort")} (under a quarter mile) and ${h.a("/invest/condo-buildings/holiday-sands-south/", "Holiday Sands South")} (about half a mile). Farther south: ${h.a("/invest/condo-buildings/regency-towers/", "Regency Towers")} (about half a mile) and ${h.a("/invest/condo-buildings/surfmaster/", "Surfmaster by the Sea")} (about 7 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Grand Atlantic Myrtle Beach FAQ",
  faq: [
    { q: "Where is the Grand Atlantic in Myrtle Beach?", a: "The Grand Atlantic is at 2007 S Ocean Blvd, Myrtle Beach, SC 29577, on the oceanfront at the south end of the city." },
    { q: "When was the Grand Atlantic built?", a: "The condos for sale were built in 2005 and 2006, so the tower is about 20 years old." },
    { q: "Is the Grand Atlantic a hotel or condos?", a: `Both. Its ${CONDOS} condos are owned one by one, and the resort calls itself a condotel with a front desk and a rental program.` },
    { q: "Is the Grand Atlantic pet friendly?", a: "Guests may not bring pets; service animals are allowed. An owner's own pet rules are in the condo's founding documents, and we read them before you offer." },
    { q: "Is there parking at the Grand Atlantic?", a: "Yes. The resort has a 6-level attached garage with a clearance of 6 feet 7 inches. Permits are first come, first served." },
    { q: "How many Grand Atlantic condos are for sale?", a: `On ${RUN_MD}, ${L.api_total} Grand Atlantic condos were for sale: ${L.beds["1"]} one-bedroom, ${L.beds["2"]} two-bedrooms, ${L.beds["3"]} three-bedrooms and ${L.beds["4"]} four-bedrooms.` },
    { q: "Does the Grand Atlantic have an indoor pool?", a: `The resort lists an indoor pool, and ${FG.indoor_pool} of the ${L.api_total} condos for sale on ${RUN_MD} ticked an indoor pool. It also lists a heated outdoor pool on the oceanfront.` },
  ],
  sources: [
    { name: "Grand Atlantic", href: RESORT },
    { name: "condos", href: CONDOS_PAGE },
    { name: "amenities", href: AMENITIES },
    { name: "guest FAQ", href: FAQPAGE },
    { name: "FAA obstacle file", href: DOF },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "Fannie Mae", href: FANNIE },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Ask about a Grand Atlantic unit.",
    p: "An agent can tell you what a unit's fees, rental program and building papers look like.",
    label: "Ask about a Grand Atlantic unit", href: "/contact/",
  },
  keywords: "Grand Atlantic Myrtle Beach condos for sale, Grand Atlantic Resort Myrtle Beach for sale, Grand Atlantic Myrtle Beach HOA fees, Grand Atlantic Myrtle Beach condo fees, Grand Atlantic Myrtle Beach Airbnb, 2007 S Ocean Blvd Myrtle Beach, Grand Atlantic indoor lazy river, when was the Grand Atlantic built",
  about: "The Grand Atlantic, a 133-condo oceanfront tower at 2007 S Ocean Blvd, Myrtle Beach, South Carolina",
});
