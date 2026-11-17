/* /invest/condo-buildings/holiday-sands-south/ - Holiday Sands South, 2501 S Ocean Blvd, Myrtle Beach: what owning a
 * condo there costs, the HOA fee by unit size and what listings say it pays (the electric bill), nightly rentals,
 * what units sold for, flood zone and what is nearby.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. Follows the Palace Resort pilot (specs/palace-resort.js).
 * Facts: Blog-Brain batches/2026-11-e/holiday-sands-south/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md). Struck: row 5 "converted"; row 6 "0.86 acre", "3,000 each", any height;
 * row 11 "among the highest"; row 13 "names a rental program"; row 20 "directly on the ocean side" unattributed;
 * row 22 owner use of the hotel's amenities (NEEDS-SOURCE, not printed).
 * Data: data/2026-11-e/holiday-sands-south/ (listings.json, county.json, flood.json, tax.json, nearby.json, photos.json).
 * Every count, fee, price and share is read from those files and checked against its ledger row with must().
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates (images/label.py).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/holiday-sands-south/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "holiday-sands-south");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TX = read("tax.json"), NB = read("nearby.json"), PHOTOS = read("photos.json").photos;
const PAL = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-d", "palace-resort", "listings.json"), "utf8"));

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5 = (v) => money(Math.round(v / 5) * 5);
const must = (ok, msg) => { if (!ok) throw new Error(`holiday-sands-south.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 6: 117 condo units, numbered on floors 1 to 12. */
must(C.condo_units === 117 && C.floors.count === 12 && C.floors.numbers[11] === 12, "row 6 changed");
const UNITS = C.condo_units;
/* Row 7 and 8: for sale now, by size. */
const A = L.asking;
must(L.api_total === 15 && L.beds["1"] === 8 && L.beds["2"] === 7, "row 7 counts changed");
must(A["1"].median === 187450 && A["2"].median === 309900 && A.all.median === 219000 && A.all.min === 163900 && A.all.max === 359900, "row 8 asking changed");
must(A["1"].sqft_range.join() === "652,711" && A["2"].sqft_range.join() === "995,1100", "row 8 sizes changed");
must(A["1"].min === 163900 && A["1"].max === 219000 && A["2"].min === 269000 && A["2"].max === 359900, "row 8 ranges changed");
/* Row 11: fee by size, to the dollar. */
const FX = L.fee_exact;
must(FX["1"].n === 8 && FX["1"].lowest === 874 && FX["1"].highest === 978, "row 11 one-bedroom fee changed");
must(FX["2"].n === 7 && FX["2"].lowest === 1340 && FX["2"].highest === 1438, "row 11 two-bedroom fee changed");
const YR = { "1": [FX["1"].lowest * 12, FX["1"].highest * 12], "2": [FX["2"].lowest * 12, FX["2"].highest * 12] };
must(YR["1"].join() === "10488,11736" && YR["2"].join() === "16080,17256", "row 11 yearly changed");
const PAL1 = PAL.fee_exact["1"];
must(PAL1.lowest === 683 && PAL1.highest === 690 && FX["1"].lowest > PAL1.highest, "palace comparison changed");
/* Row 12: what listings say the fee covers. */
const FG = L.flags;
must(FG.hoa_includes_electric === 12 && FG.hoa_includes_water_sewer === 12 && FG.hoa_includes_trash === 13 && FG.hoa_includes_internet === 12 && FG.hoa_includes_pest === 10 && FG.hoa_includes_cable === 6, "row 12 changed");
/* Row 10 and 13: what listings say about the units and rentals. */
must(FG.furnished === 15 && FG.covered_parking === 15 && FG.ocean_view === 13 && FG.oceanfront_unit === 7 && FG.oceanfront_building === 13 && FG.indoor_pool === 13, "row 10 changed");
must(FG.str_allowed === 13 && FG.vacation_rental_program === 13, "row 13 changed");
/* Row 5: year built, from the listings only. */
must(L.year_built["2007"] === 15, "row 5 changed");
/* Row 15: recorded deeds, the directory's window. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30" && SW.all.n === 6 && SW.all.median === 175000 && SW.all.min === 170000 && SW.all.max === 275000, "row 15 changed");
must(C.sales.later_window.zero_dollar_deeds === 2, "row 15 zero deeds changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 16 and 17: tax rate and the implied bill, in aggregate. */
must(C.taxed_at_6pct === 104 && C.taxed_as_home_4pct === 13, "row 16 changed");
must(TX.units_at_6pct === 104 && TX.implied_tax_city_millage.median === 2549 && TX.implied_tax_city_millage.p25 === 1920 && TX.implied_tax_city_millage.p75 === 3267, "row 17 changed");
/* Row 18: flood. */
const zoneAt = (bfe) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === "AE" && x.attributes.STATIC_BFE === bfe);
must(zoneAt(12).share_of_footprint === 0.854 && zoneAt(11).share_of_footprint === 0.146 && FL.zones_touching.length === 2 && FG.flood_zone === 4, "row 18 changed");
/* Row 19: straight-line miles. */
const M = Object.fromEntries(Object.entries(NB.places).map(([k, v]) => [k, v.miles]));
must(M["Springmaid Pier"] === 0.7 && M["Myrtle Beach State Park"] === 1.5 && M["Myrtle Beach International Airport"] === 1.5 && M["Family Kingdom Amusement Park"] === 1.6 && M["Myrtle Beach Boardwalk"] === 2.4 && M["Broadway at the Beach"] === 3.9, "row 19 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the Palace page: one card style, plain lists).  */

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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/holiday-sands-south-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 8, 11).                                                    */

const SIZES = [{ name: "One-bedroom", k: "1" }, { name: "Two-bedroom", k: "2" }];
const FEE_TABLE = compareCards(SIZES.map((s) => ({
  name: s.name,
  bestFor: `${A[s.k].sqft_range[0]} to ${n(A[s.k].sqft_range[1])} sq ft`,
  cells: {
    fee: `${money(FX[s.k].lowest)} to ${money(FX[s.k].highest)}`,
    year: `About ${r1k(YR[s.k][0])} to ${r1k(YR[s.k][1])}`,
  },
})), [
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "year", label: "Fees a year, before any loan", num: true },
], { caption: "HOA fee by unit size at Holiday Sands South", nameLabel: "Unit", bestForLabel: "Size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.holidaysandssouth.com/";
const AMENITIES = "https://www.holidaysandssouth.com/amenities/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const OSM = "https://www.openstreetmap.org/copyright";

/* The condos as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Holiday Sands South", alternateName: ["Holiday Sands at South Beach", "Holiday Sands South Myrtle Beach"],
  description: `${UNITS} one- and two-bedroom condos at 2501 S Ocean Blvd on the south end of Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "2501 S Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Round 2 (owner, 2026-11-14): live strips, never "send me homes". The MLS spells the building "Holiday Sands";
   each search was called on /homes/api/strip on 2026-11-14 (ok true, 15, 7, 7, 13, 7 homes). */
const STRIP = G.homesQScript() + G.homesQ("subdivision=Holiday Sands", "Condos for sale at Holiday Sands South");
const STRIP_2BR = G.homesQ("subdivision=Holiday Sands&beds=2", "Two-bedroom condos at Holiday Sands South");
const STRIP_LOW = G.homesQ("subdivision=Holiday Sands&max=200000", "Holiday Sands South condos for $200,000 or less");
const STRIP_RENT = G.homesQ("subdivision=Holiday Sands&has=vacation_rental_program", "Holiday Sands South condos listed with a rental program");
const STRIP_OCEAN = G.homesQ("subdivision=Holiday Sands&has=oceanfront_unit", "Oceanfront units at Holiday Sands South");

const NEAR = G.bars([
  { name: "Springmaid Pier", value: M["Springmaid Pier"] },
  { name: "Myrtle Beach State Park", value: M["Myrtle Beach State Park"], },
  { name: "Myrtle Beach International Airport", value: M["Myrtle Beach International Airport"] },
  { name: "Family Kingdom Amusement Park", value: M["Family Kingdom Amusement Park"] },
  { name: "Myrtle Beach Boardwalk", value: M["Myrtle Beach Boardwalk"] },
  { name: "Broadway at the Beach", value: M["Broadway at the Beach"], valueText: "3.9 miles" },
], { caption: "Straight-line miles from Holiday Sands South", nameLabel: "Place", valueLabel: "Miles", format: (v) => `${v} miles`, note: "Straight-line miles from the middle of the lot, not drive distances. For Myrtle Beach State Park and the airport, the distance is to the middle of each." });

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Holiday Sands South Myrtle Beach Condos: HOA Fees From ${money(FX["1"].lowest)}`,
  description: `Holiday Sands South, 2501 S Ocean Blvd, Myrtle Beach: HOA fees by unit size, what the fee pays, flood zone, nightly rentals and what ${SW.all.n} units sold for.`,
  ogTitle: "Holiday Sands South, Myrtle Beach: condos for sale, HOA fees, rentals and sales",
  crumb: "Holiday Sands South",
  eyebrow: "Holiday Sands South, Myrtle Beach",
  h1: "Holiday Sands South, Myrtle Beach: owning a condo here.",
  h1em: `${UNITS} one- and two-bedroom condos at 2501 S Ocean Blvd.`,
  sub: `Holiday Sands South condos for sale, from the county's records, FEMA's flood map and the listings read on ${RUN}.`,
  heroMedia: glance([
    { icon: "home", label: "6 percent tax rate", text: `${C.taxed_at_6pct} of ${UNITS} units` },
    { icon: "dollar", label: "HOA fee a month", text: `${money(FX["1"].lowest)} to ${money(FX["2"].highest)}` },
    { icon: "key", label: "Nightly rentals", text: "Zoned for them" },
    { icon: "flood", label: "Flood zone", text: "High risk, 12 feet" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Holiday Sands South is ${UNITS} one- and two-bedroom condos at 2501 S Ocean Blvd on the south end of Myrtle Beach. The county taxes ${C.taxed_at_6pct} of them at the 6 percent rate, for a second home or a rental. Only ${C.taxed_as_home_4pct} at the 4 percent rate for an owner's home.`,
    `The monthly HOA fee is ${money(FX["1"].lowest)} to ${money(FX["2"].highest)}, by the size of the unit. ${FG.hoa_includes_electric} of the ${L.api_total} listings for sale say the fee pays the electric bill. The ${SW.all.n} units that sold in the past year went for ${money(SW.all.min)} to ${money(SW.all.max)}.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Holiday Sands South is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "Which Holiday Sands is which?", toc: "Which is which", id: "which", html: () =>
      h.p(`Two addresses go by this name. The county records the hotel as its own parcel, coded as a hotel. Hotel stays go through the front desk at 2411 S Ocean Blvd, and the condos for sale are listed at 2501 S Ocean Blvd, a separate address.`) +
      h.p(`The resort calls the condo side "Holiday Sands South at South Beach," and its own site describes the property as hotel rooms plus one- and two-bedroom condominiums. The listing service files the condos under the name "Holiday Sands."`) +
      h.p(`The county records ${UNITS} condo units. They are numbered on floors 1 to 12. All ${L.api_total} condos listed for sale on ${RUN} gave 2007 as the year built.`) +
      PHOTO +
      h.p(`The listings tell you what the units have. All ${L.api_total} came furnished, with covered parking. ${FG.ocean_view} were listed with an ocean view, and ${FG.oceanfront_unit} as oceanfront units. ${FG.indoor_pool} listings tick an indoor pool.`) +
      h.p(`The resort's own site lists, for its guests, eleven water amenities including a lazy river, two indoor pools and two large indoor hot tubs. Whether owners may use them is in the condo's founding documents, and we ask before you offer. See the ${h.ext(AMENITIES, "resort's amenities page")}.`) +
      STRIP_OCEAN },

    { h2: "What does a condo at Holiday Sands South cost?", toc: "Price", id: "price", html: () =>
      h.p(`On ${RUN_MD}, ${L.api_total} units were for sale, ${L.beds["1"]} one-bedrooms and ${L.beds["2"]} two-bedrooms. The table has what they ask.`) +
      h.table(["Holiday Sands South", "One-bedroom", "Two-bedroom"], [
        ["Size", `${A["1"].sqft_range[0]} to ${A["1"].sqft_range[1]} sq ft`, `${A["2"].sqft_range[0]} to ${n(A["2"].sqft_range[1])} sq ft`],
        ["Middle asking price", `About ${r1k(A["1"].median)}`, `About ${r1k(A["2"].median)}`],
        ["Asking range", `${r1k(A["1"].min)} to ${r1k(A["1"].max)}`, `${r1k(A["2"].min)} to ${r1k(A["2"].max)}`],
      ]) +
      STRIP_2BR +
      h.p(`${SW.all.n} units sold by Horry County's deed records in the ${PERIOD}. They went for ${money(SW.all.min)} to ${money(SW.all.max)}, and the middle was ${money(SW.all.median)}. Two more deeds were recorded with no price.`) +
      h.p(`The deeds do not record bedrooms, so we cannot match a sale to a size, and the six are one- and two-bedrooms mixed.`) +
      h.p(`Six sales is a small sample, so we price an offer from the sales closest to the unit you want. Our ${h.a("/sell/home-value/", "home value page")} explains how.`) +
      STRIP_LOW },

    { h2: "What are the HOA fees at Holiday Sands South?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`${FG.hoa_includes_electric} of the ${L.api_total} listings say the HOA fee pays the electric bill, and ${FG.hoa_includes_water_sewer} say it pays water and sewer. The listing agents ticked these boxes, so we confirm them with the association.`) +
      FEE_TABLE +
      h.p(`A one-bedroom at Holiday Sands South costs more each month than a one-bedroom at the ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")}, where the fee is ${money(PAL1.lowest)} to ${money(PAL1.highest)}.`) +
      h.h3("What the fee pays, by the listings") +
      `<ul class="c3-pr-list">`
        + `<li><strong>Trash and internet</strong>${FG.hoa_includes_trash} listings include trash, and ${FG.hoa_includes_internet} include internet.</li>`
        + `<li><strong>Pest control and cable</strong>${FG.hoa_includes_pest} listings include pest control, and ${FG.hoa_includes_cable} include cable.</li>`
        + `<li><strong>The building's insurance</strong>${FG.hoa_includes_insurance} listings tick insurance. We read the association's budget to see what that covers, and you still need a policy for the inside of your unit.</li>`
        + `</ul>` +
      h.p(`These are what the listing agents ticked, not the association's own list. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("Property tax") +
      `<ul class="c3-pr-list">`
        + `<li><strong>A middle bill</strong>For a unit at the 6 percent rate, the middle city and county bill is about ${r100(TX.implied_tax_city_millage.median)} a year, before credits and fees. That figure covers all sizes together.</li>`
        + `</ul>` +
      h.p(`A sale can raise a unit's value to about its price. For the real bill on a unit you like, use our ${h.a("/buyers/property-records/", "property records lookup")}. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.cta("Know the Holiday Sands South fees before you offer", "We ask the association for the unit's budget, its reserve study and any assessment, and add the fees up for you.", "Have us get the Holiday Sands South budget", "/contact/", bg) },

    { h2: "Can you rent a condo at Holiday Sands South by the night?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes, by the city's zoning. Holiday Sands South is in a City of Myrtle Beach zoning district where nightly rentals are allowed. ${FG.str_allowed} of the ${L.api_total} listings on ${RUN_MD} say short-term rentals are allowed and a rental program is available.`) +
      h.p(`The listings do not say who runs a program or what it pays owners. We get its terms before you offer, and we do not guess at income. Hotel stays at the resort are a separate business, booked on the resort's own site.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through a rental program</strong>A program books the unit, collects the lodging taxes and sends the owner statements. Ask for its split of the rent, its fees and its booking history.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways. What one- and two-bedrooms earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}.`) +
      STRIP_RENT },

    { h2: "Is Holiday Sands South in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`Yes. FEMA's flood map puts the lot in a high-risk flood zone. The base flood height, the level a flood is expected to reach, is 12 feet over most of the lot and 11 feet over the rest.`) +
      h.p(`A lender can require flood insurance on a loan for a unit here. The building's policy and your own policy split the cover, and which part of a loss each one pays is in the policy.`) +
      h.p(`Only ${FG.flood_zone} of the ${L.api_total} listings mention a flood zone, so we check it for you. We have not seen a survey of how high the building's floor sits. Our ${h.a("/buyers/flood-zone-check/", "flood zone page")} shows how to check any address.`) },

    { h2: "What is near Holiday Sands South?", toc: "Nearby", id: "nearby", html: () =>
      h.p(`Springmaid Pier is the closest, at ${M["Springmaid Pier"]} mile from the middle of the lot. The chart has the other five.`) + NEAR },

    { h2: "What we check before you buy at Holiday Sands South", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>The fee and the budget</strong>We read the budget and the reserve study first. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what a surprise bill can cost.</li>`
        + `<li><strong>The rental terms</strong>If you plan to rent, we get the program's terms and the unit's booking history, or the rules for a manager of your own.</li>`
        + `<li><strong>The flood cover</strong>We read the building's policy and ask a lender what a loan on a unit here needs.</li>`
        + `<li><strong>The owner's access</strong>We ask the association what owners may use at the resort, and what the rules say about pets and cars.</li>`
        + `</ul>` +
      h.h3("Loans for a unit like this") +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a unit in a building like this. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.cta("Have us check the unit you like", "We check the tax, the rental terms and the fees on the unit you like, and tell you what we find before you offer.", "Have us check a Holiday Sands South unit", "/contact/", bg) +
      h.p(`To weigh this building against the others, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/paradise-resort/", "Paradise Resort")} (about half a mile) and ${h.a("/invest/condo-buildings/grand-atlantic/", "Grand Atlantic")} (about half a mile). Farther north: ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (about 1 mile) and ${h.a("/invest/condo-buildings/landmark-resort/", "Landmark Resort")} (about 1 mile). Down the beach to the south: ${h.a("/invest/condo-buildings/regency-towers/", "Regency Towers")} (under a quarter mile) and ${h.a("/invest/condo-buildings/surfmaster/", "Surfmaster by the Sea")} (about 7 miles). Farther south: ${h.a("/invest/condo-buildings/atalaya-towers/", "Atalaya Towers")} (about 7 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Holiday Sands South Myrtle Beach FAQ",
  faq: [
    { q: "What is the address of Holiday Sands South?", a: "The condos are listed at 2501 S Ocean Blvd, Myrtle Beach, SC 29577. The resort's front desk for hotel stays is at 2411 S Ocean Blvd." },
    { q: "How much are the HOA fees at Holiday Sands South?", a: `By the listings on ${RUN_MD}, a one-bedroom is ${money(FX["1"].lowest)} to ${money(FX["1"].highest)} a month and a two-bedroom is ${money(FX["2"].lowest)} to ${money(FX["2"].highest)}.` },
    { q: "Does the HOA fee at Holiday Sands South include electric?", a: `${FG.hoa_includes_electric} of the ${L.api_total} listings on ${RUN_MD} say it does. The listing agents ticked this, so we confirm it with the association before an offer.` },
    { q: "Can you rent a Holiday Sands South condo by the night?", a: "The zoning allows nightly rentals. Most listings say a rental program is available. We get the program's terms before you offer." },
    { q: "Is Holiday Sands South in a flood zone?", a: "Yes. FEMA puts the lot in a high-risk flood zone, with a base flood height of 12 feet over most of it and 11 feet over the rest." },
    { q: "How much did Holiday Sands South condos sell for?", a: `${SW.all.n} units sold in the past year, for ${money(SW.all.min)} to ${money(SW.all.max)}. The middle was ${money(SW.all.median)}.` },
    { q: "Is Holiday Sands South the same as Holiday Sands at South Beach?", a: "Yes. The resort calls the condo side Holiday Sands South at South Beach. The listing service files it as Holiday Sands." },
  ],
  sources: [
    { name: "Holiday Sands South", href: RESORT },
    { name: "amenities", href: AMENITIES },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "OpenStreetMap", href: OSM },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN_MD}, in aggregate; county parcels and the deeds recorded in the past year; the flood map on the county's parcel drawing; distances from OpenStreetMap place points.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Holiday Sands South.",
    p: "Tell us the size you want and the days you are here. An agent shows you the units for sale in that size.",
    label: "Book a showing at Holiday Sands South", href: "/contact/",
  },
  keywords: "holiday sands south condos for sale, holiday sands at south beach, holiday sands south hoa fees, 2501 s ocean blvd myrtle beach, holiday sands south myrtle beach",
  about: "Holiday Sands South, a 117-unit condo building at 2501 S Ocean Blvd, Myrtle Beach, South Carolina",
});
