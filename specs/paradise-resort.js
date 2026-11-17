/* /invest/condo-buildings/paradise-resort/ - Paradise Resort, 2201 S Ocean Blvd, Myrtle Beach: what owning
 * a condo there gives you, the HOA fee by unit size and what it pays, renting it by the night, what units
 * sold for, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. Built in the style of palace-resort.js (the pilot).
 * Facts: Blog-Brain batches/2026-11-e/paradise-resort/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-e/paradise-resort/ (listings.json, county.json, flood.json, tax.json; README.md has the rerun order).
 * Every count, fee, price, share and chart value is read from those files here and checked against its
 * ledger row with must(); a changed file stops the build until a person reads the row again.
 * Where the verifier corrected a row (24: one deed moved two units) the corrected figures are typed here and
 * checked against the file's own totals.
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates (data/2026-11-e/paradise-resort/images/label.py;
 * record in photos.json), until the photo partner's shots arrive (BUILD.md lists them).
 * Homes: four live strips (G.homesQ), each checked on the live site with 3 or more homes (BUILD.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/paradise-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "paradise-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TX = read("tax.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r10k = (v) => money(Math.round(v / 10000) * 10000);
const must = (ok, msg) => { if (!ok) throw new Error(`paradise-resort.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 5: built in 2006 (12 of 12 cards). */
must(L.year_built["2006"] === 12 && Object.keys(L.year_built).length === 1, "row 5 changed");
const BUILT = 2006;
/* Rows 2 and 3: about 203 condos, 4 commercial units. */
must(C.units === 207 && C.landuse_first_digit["1xx"] === 203 && C.landuse_first_digit["3xx"] === 4, "row 3 changed");
const CONDOS = C.landuse_first_digit["1xx"];
/* Row 4: floors 1 to 12 and 14 to 20, 11 doors on most lower floors. */
const FLR = C.floors;
must(FLR.top === 20 && FLR.missing_between.join() === "13" && FLR.units_per_floor["2"] === 11, "row 4 changed");
/* Row 16 (CORRECTED): the fee by size, to the dollar. 607 sq ft x3 = 674; 629 x1 and 672 x3 = 746; four-bedrooms 2,000. */
const FS = L.fee_by_size;
must(FS["607"].lowest === 674 && FS["607"].highest === 674 && FS["629"].highest === 746 && FS["672"].lowest === 746 && FS["672"].highest === 746, "row 16 one-bedroom fees changed");
must(L.fee_exact["4"].lowest === 2000 && L.fee_exact["4"].highest === 2000 && L.fee_exact["4"].n === 3, "row 16 four-bedroom fee changed");
must(FS.sizes_for_sale["607"] === 3 && FS.sizes_for_sale["629"] === 1 && FS.sizes_for_sale["672"] === 3, "row 15 sizes changed");
const FEE_SMALL = 674, FEE_BIG = 746, FEE_4 = 2000;
/* Row 13 and 14: for sale now, by size, and the asking prices. */
const A = L.asking;
must(L.api_total === 12 && L.beds["0"] === 1 && L.beds["1"] === 7 && L.beds["2"] === 1 && L.beds["4"] === 3, "row 13 counts changed");
must(A["1"].median === 218000 && A["1"].min === 179900 && A["1"].max === 240000 && A["4"].min === 529000 && A["4"].max === 599000 && A["4"].median === 595500, "row 14 asking changed");
must(A["1"].sqft_range.join() === "607,672" && A["4"].sqft_range.join() === "1802,1802", "row 15 size ranges changed");
/* Row 17: what the fee pays, by the listings' own flags. */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 11 && FG.hoa_includes_trash === 11 && FG.hoa_includes_insurance === 11 && FG.hoa_includes_internet === 11 && FG.hoa_includes_electric === 10, "row 17 changed");
/* Rows 18, 19, 20: rentals, pets, features, indoor pools. */
must(FG.vacation_rental_program === 12 && FG.str_allowed === 10 && FG.pets_allowed === 8, "row 18 changed");
must(FG.oceanfront_unit === 10 && FG.balcony === 11 && FG.high_floor_unit === 10 && FG.elevator_building === 11 && FG.covered_parking === 12 && FG.indoor_pool === 11, "rows 19 and 20 changed");
/* Row 22: owners' mailing addresses. Row 23: tax rate groups. */
must(C.owner_out_of_sc === 158 && C.units === 207, "row 22 changed");
const OUT_PCT = Math.round(C.owner_out_of_sc / C.units * 100);
must(OUT_PCT === 76, "row 22 share changed");
must(TX.units_at_6pct === 194 && C.taxed_as_home_4pct === 9, "row 23 units changed");
/* Row 23 (CORRECTED): the buyer's tax is the price x 6 percent x the city's 254.6 mills (CON row 21), before any exemption;
   not the seller's present bill. */
const MILLS = 254.6;
const TAX_1 = A["1"].median * 0.06 * MILLS / 1000;
must(Math.round(TAX_1) === 3330, "row 23 tax changed");
const YEAR_SMALL = FEE_SMALL * 12, YEAR_BIG = FEE_BIG * 12, YEAR_4 = FEE_4 * 12;
must(YEAR_SMALL === 8088 && YEAR_BIG === 8952 && YEAR_4 === 24000, "row 16 yearly changed");
must(r100(YEAR_SMALL) === "$8,100" && r100(YEAR_BIG) === "$9,000" && r100(TAX_1) === "$3,300", "row 23 rounding");
const HOLD_LO = r100(YEAR_SMALL + TAX_1), HOLD_HI = r100(YEAR_BIG + TAX_1);
must(HOLD_LO === "$11,400" && HOLD_HI === "$12,300", "row 23 totals changed"); /* the page says "about $12,000" (midpoint $11,850) */
/* Row 24 (CORRECTED): the file counts 8 deeds; one ($522,500) moved two units together, so the verifier's
   one-unit figures are 7 sales, middle $205,000, $174,500 to $385,000; floors 1 to 10: 4 sales, middle $190,000;
   floors 11 and up: 3 sales, middle $305,000. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30" && SW.all.n === 8 && SW.all.max === 522500 && SW.all.min === 174500, "row 24 changed");
must(SW.floors_11_up.n === 3 && SW.floors_11_up.median === 305000 && SW.floors_11_up.max === 385000, "row 24 upper floors changed");
const SOLD = { n: 7, median: 205000, min: 174500, max: 385000, low: { n: 4, median: 190000 }, high: { n: 3, median: 305000 }, pair: 522500 };
const ONE_IN = Math.round(CONDOS / SOLD.n);
must(ONE_IN === 29, "row 24 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 26: flood zones under the building's county parcels. */
const zone = (z) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
must(zone("VE").share_of_footprint === 0.254 && zone("VE").attributes.STATIC_BFE === 14 && zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint === 0.339 && FL.share_in_no_zone === 0.407, "row 26 changed");
const VE_PCT = Math.round(zone("VE").share_of_footprint * 100), SHADED_PCT = Math.round(zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint * 100), NONE_PCT = Math.round(FL.share_in_no_zone * 100);
must(VE_PCT === 25 && SHADED_PCT === 34 && NONE_PCT === 41, "row 26 percents");
/* The listings' read time (row 13). Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the Palace pilot's design).                  */

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
/* The fee table (rows 15, 16): three sizes, by the unit's square feet.            */

const SIZES = [
  { name: "Smaller one-bedroom", size: "607 sq ft", fee: FEE_SMALL, sale: FS.sizes_for_sale["607"] },
  { name: "Larger one-bedroom", size: "629 to 672 sq ft", fee: FEE_BIG, sale: FS.sizes_for_sale["629"] + FS.sizes_for_sale["672"] },
  { name: "Four-bedroom", size: "1,802 sq ft", fee: FEE_4, sale: L.beds["4"] },
];
const FEE_TABLE = compareCards(SIZES.map((s) => ({
  name: s.name,
  bestFor: s.size,
  cells: { fee: money(s.fee), year: money(s.fee * 12), sale: `${s.sale}` },
})), [
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "year", label: "Fees a year", num: true },
  { key: "sale", label: "For sale", num: true },
], { caption: "At Paradise Resort, the fee goes by the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.paradiseresortmb.com/";
const WATER = "https://www.paradiseresortmb.com/amenities/water-attractions/";
const FOOD = "https://www.paradiseresortmb.com/amenities/food-and-beverage/";
const FAQPAGE = "https://www.paradiseresortmb.com/faq/";
const OWNERS = "https://www.paradiseresortmb.com/homeowner-services/";
const BRITTAIN = "https://brittainresorts.com/our-portfolio/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "ApartmentComplex", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Paradise Resort", alternateName: ["Paradise Resort Myrtle Beach"],
  description: `An oceanfront condo tower built in ${BUILT} with about ${CONDOS} condos on the south end of Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "2201 S Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/paradise-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* Row 27: points from the ledger (OSM, via CB landmark-distances.json); the tower is the county parcels' centre (flood.json). */


const FLOOD_CHART = G.bars([
  { name: "Coastal high-hazard zone", value: VE_PCT },
  { name: "Shaded moderate-risk zone", value: SHADED_PCT },
  { name: "Unshaded", value: NONE_PCT },
], { caption: "A quarter of the building's county parcels is in FEMA's coastal high-hazard zone", nameLabel: "Flood map", valueLabel: "Share of the parcels", format: (v) => v + " percent", max: 100,
  note: "Share of the building's county parcels under each FEMA flood zone." });

/* Live strips (owner, 2026-11-14): each search checked on the live site, 3 or more homes. */
const PT = `near=${FL.footprint_center[0]},${FL.footprint_center[1]}`;
const STRIP = G.homesQScript() + G.homesQ("subdivision=Paradise Resort", "Own a condo at Paradise Resort, on the ocean in Myrtle Beach");
const STRIP_1BR = G.homesQ("subdivision=Paradise Resort&beds=1&max=240000", "One-bedroom condos at Paradise Resort, 607 to 672 square feet");
const STRIP_4BR = G.homesQ("subdivision=Paradise Resort&beds=4", "Four-bedroom condos at Paradise Resort, 1,802 square feet");
const STRIP_NEAR = G.homesQ(`type=condo&${PT}&miles=0.5&has=oceanfront_unit`, "More oceanfront condos within half a mile of Paradise Resort");

module.exports = G.page({
  theme: "glass",
  pageImages: () => PH.pageImages(AERIAL),
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  title: `Paradise Resort Myrtle Beach Condos for Sale: Fees From ${money(FEE_SMALL)}`,
  description: `Paradise Resort, 2201 S Ocean Blvd, Myrtle Beach: HOA fees by unit size, what they pay, nightly rentals, the flood zone and what ${SOLD.n} condos sold for.`,
  ogTitle: "Paradise Resort, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "Paradise Resort",
  eyebrow: "Paradise Resort, Myrtle Beach",
  h1: "Paradise Resort, Myrtle Beach: owning a condo in the 2006 oceanfront tower.",
  h1em: "A lazy river and indoor pools, on the ocean.",
  sub: "Paradise Resort condos at 2201 S Ocean Blvd, with an HOA fee that goes by the unit's size.",
  heroMedia: glance([
    { icon: "calendar", label: "Built", text: `${BUILT}` },
    { icon: "home", label: "Condos", text: `About ${CONDOS}` },
    { icon: "town", label: "Floors", text: `To ${FLR.top}` },
    { icon: "key", label: "Nightly rentals", text: "Allowed" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Paradise Resort is a ${BUILT} oceanfront tower on the south end of Myrtle Beach, with about ${CONDOS} condos from studios to four-bedrooms. One-bedrooms ask about ${money(A["1"].median)} now, and ${SOLD.n} condos sold by deed in the past year for about ${money(SOLD.median)} in the middle.`,
    `The monthly HOA fee depends on the unit's size: ${money(FEE_SMALL)} to ${money(FEE_BIG)} for a one-bedroom and ${money(FEE_4)} for a four-bedroom. Most listings say it covers water, trash, insurance, internet and electricity.`,
    `Only ${C.taxed_as_home_4pct} of its units are taxed as an owner's home, and about three in four have an owner mailing address outside South Carolina. It is mostly a second-home and rental building.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>` },

    { h2: "What is it like to own at Paradise Resort?", toc: "Owning here", id: "owning", html: () =>
      h.p(`The water side is the draw. The resort has a lazy river, an outdoor pool with a pool deck, indoor pools and hot tubs. Most of the condos for sale list an indoor pool, so a cold day is a swim day. Some of the outdoor features are seasonal.`) +
      h.p(`Sandals Restaurant serves breakfast on site every morning, and the Tiki Hut serves lunch and dinner part of the week, weather permitting. There is also a workout room on the third floor, cornhole and a life-size chess set.`) +
      h.h3(`A ${BUILT} tower with floors to ${FLR.top}`) +
      h.p(`Paradise Resort was built in ${BUILT}, so it is about 20 years old. Floors are numbered 1 to 12 and 14 to ${FLR.top}: no floor is numbered 13.`) +
      h.p(`Most of the condos for sale are listed as oceanfront units, and most have a balcony and sit on a high floor. The building has an elevator, and every condo for sale has covered parking.`) +
      h.p(`Springmaid Pier is about a mile south along the beach, and Family Kingdom's rides are about 1.3 miles north.`) +
      PHOTO +
      h.p(`The biggest condos here are the ${L.beds["4"]} four-bedrooms for sale, all ${n(A["4"].sqft_range[0])} square feet and asking ${r1k(A["4"].min)} to ${r1k(A["4"].max)}.`) +
      STRIP_4BR },

    { h2: "What are the HOA fees at Paradise Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The fee depends on the unit's size. The table gives the fee for each size, with how many are for sale.`) +
      FEE_TABLE +
      h.p(`The ${L.beds["1"]} one-bedrooms for sale ask ${r1k(A["1"].min)} to ${money(A["1"].max)}, about ${money(A["1"].median)} in the middle. A studio and a two-bedroom are also for sale.`) +
      STRIP_1BR +
      h.p(`The fee pays water and sewer, trash, internet and the building's insurance, by nearly every listing, and most also say it pays electricity. We read the budget to confirm what each fee covers. You still need a policy on the inside of your unit, and our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("What a year costs before any loan") +
      h.p(`A one-bedroom at the middle asking price costs about $12,000 a year to hold, before your unit's own insurance.`) +
      h.table(["Yearly cost", "About"], [
        ["HOA fees", `${r100(YEAR_SMALL)} to ${r100(YEAR_BIG)}`],
        ["Property tax", r100(TAX_1)],
        ["Together", "about $12,000"],
      ]) +
      h.p(`The tax uses the 6 percent rate that applies to rentals and second homes, and the city's 2026 rate, before any exemption. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower 4 percent rate for a home you live in. A four-bedroom's fees alone come to ${r1k(YEAR_4)} a year.`) },
    { h2: "Can you rent a condo at Paradise Resort by the night?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes. Paradise Resort is in a City of Myrtle Beach zoning district where nightly rentals are allowed. The resort's owner page sends owners to Brittain Resorts & Hotels, whose portfolio lists Paradise Resort. All ${FG.vacation_rental_program} condos for sale were listed as in a rental program, and ${FG.str_allowed} as allowing short-term rentals.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's program</strong>Owners who want the resort's help renting start on its homeowner page. What the program pays an owner is not published, so we get its terms for any unit you consider.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`Guests must be 21 or older unless a parent or guardian is with them. Buyers in most associations here, with a rental program or not, pay a transfer fee at closing. Many also put a few months of dues in escrow, an account that holds the money until it is due.`) },

    { h2: "What have Paradise Resort condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SOLD.n} Paradise Resort condos sold by deed in the ${PERIOD}, about 1 in ${ONE_IN} condos in the building. They sold for about ${money(SOLD.median)} in the middle, from about ${r1k(SOLD.min)} to ${money(SOLD.max)}. One more deed moved two units together for about ${r10k(SOLD.pair)}.`) +
      h.p(`Condos on floor 11 and up sold for ${money(SOLD.high.median)} in the middle (${SOLD.high.n} sales), and floors 1 to 10 for ${money(SOLD.low.median)} (${SOLD.low.n} sales). That is too few sales to say a high floor earns more, and the deeds do not record size.`) +
      h.p(`We price a unit from its own size and recorded sales, not from asking prices. Our ${h.a("/sell/home-value/", "home value page")} explains how. If you own here and are thinking of selling, ${h.a("/contact/", "tell us the unit")} and we price it from the deeds.`) },

    { h2: "What we check before you buy at Paradise Resort", toc: "Our checks", id: "checks", html: (bg) =>
      FLOOD_CHART + `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>About ${VE_PCT} percent of the building's county parcels, on the ocean side, is in FEMA's coastal high-hazard zone. FEMA draws that zone where storm waves are expected, and its map expects storm water up to 14 feet above sea level there. About ${SHADED_PCT} percent is in its shaded zone, and about ${NONE_PCT} percent is unshaded. We check the building's own flood map and the flood cover in its policy.</li>`
        + `<li><strong>The building's age</strong>Built in ${BUILT}, about 20 years ago. We read the reserve study, which is the plan and savings for big repairs. We also read the last two budgets and the minutes for any planned special assessment, an extra bill to owners. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>If you will use a loan</strong>A building run with a front desk and a rental program usually needs a condotel loan, a loan made for condo-hotel buildings. Many standard loans will not cover a unit in one.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a unit here. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.cta("Have us check a unit before you offer", "We get the budget and reserve study and go through each check above for the unit you like. Our affiliated lender, BrickWood Mortgage, a separate company, looks at the loan.", "Have us check a unit", "/contact/", bg) +
      STRIP_NEAR +
      h.p(`To weigh Paradise Resort against the other oceanfront buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/grand-atlantic/", "Grand Atlantic")} (under a quarter mile) and ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (about half a mile). Farther north: ${h.a("/invest/condo-buildings/landmark-resort/", "Landmark Resort")} (about half a mile) and ${h.a("/invest/condo-buildings/sea-mist-resort/", "Sea Mist Resort")} (about half a mile). Down the beach to the south: ${h.a("/invest/condo-buildings/holiday-sands-south/", "Holiday Sands South")} (about half a mile) and ${h.a("/invest/condo-buildings/regency-towers/", "Regency Towers")} (about half a mile). Farther south: ${h.a("/invest/condo-buildings/surfmaster/", "Surfmaster by the Sea")} (about 7 miles) and ${h.a("/invest/condo-buildings/atalaya-towers/", "Atalaya Towers")} (about 8 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Paradise Resort Myrtle Beach FAQ",
  faq: [
    { q: "When was Paradise Resort in Myrtle Beach built?", a: `Paradise Resort was built in ${BUILT}, so the tower is about 20 years old. It stands on the south end of the Myrtle Beach oceanfront.` },
    { q: "Is Paradise Resort a hotel or condos?", a: `Both. Its condos are owned one by one, and many are rented to guests by the night. The resort takes reservations on its own website.` },
    { q: "What is the address of Paradise Resort?", a: "Paradise Resort is at 2201 S Ocean Blvd, Myrtle Beach, SC 29577, on the south end of the city's oceanfront." },
    { q: "Is this the Paradise Resort in Minnesota, or Paradise Point?", a: "No. This page is about the oceanfront Paradise Resort at 2201 S Ocean Blvd in Myrtle Beach, South Carolina." },
    { q: "Is Paradise Resort pet friendly?", a: `${FG.pets_allowed} of the ${L.api_total} condos for sale say pets are allowed. The association's rules decide, and we read them before you offer.` },
    { q: "Does Paradise Resort have parking?", a: `Yes. All ${FG.covered_parking} of the ${L.api_total} Paradise Resort condos for sale were listed with covered parking, and the building has an elevator.` },
    { q: "Does Paradise Resort have indoor pools?", a: "Yes. Paradise Resort lists indoor pools and hot tubs, along with a lazy river and an outdoor pool with a pool deck. Some of the outdoor features are seasonal." },
    { q: "How many Paradise Resort condos are for sale?", a: `On ${RUN}, ${L.api_total} Paradise Resort condos were for sale: ${L.beds["0"]} studio, ${L.beds["1"]} one-bedrooms, ${L.beds["2"]} two-bedroom and ${L.beds["4"]} four-bedrooms.` },
  ],
  sources: [
    { name: "Paradise Resort", href: RESORT },
    { name: "water attractions", href: WATER },
    { name: "food and drink", href: FOOD },
    { name: "guest FAQ", href: FAQPAGE },
    { name: "homeowner services", href: OWNERS },
    { name: "Brittain portfolio", href: BRITTAIN },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Paradise Resort.",
    p: "Pick a day that suits you and we set up the showing.",
    label: "Book a showing at Paradise Resort", href: "/contact/",
  },
  keywords: "Paradise Resort Myrtle Beach condos for sale, Paradise Myrtle Beach for sale, Paradise Resort Myrtle Beach HOA fees, Paradise Resort Myrtle Beach condo fees, 2201 S Ocean Blvd Myrtle Beach",
  about: "Paradise Resort, an oceanfront condo tower at 2201 S Ocean Blvd, Myrtle Beach, South Carolina",
});
