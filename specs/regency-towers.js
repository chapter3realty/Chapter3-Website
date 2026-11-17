/* /invest/condo-buildings/regency-towers/ - Regency Towers, 2511 S Ocean Blvd, Myrtle Beach: what owning a condo
 * there gives you, the HOA fee by unit size and what the listings say it pays, what units sold for, the flood
 * zone, nightly rentals, and what we check before an offer.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17. Built the way bay-view-resort.js was.
 * Facts: Blog-Brain batches/2026-11-f/regency-towers/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md: rows 3, 9, 15 corrected; row 20 struck; row 24 open, so no tax amount).
 * Data: data/2026-11-f/regency-towers/ (listings.json, county.json, flood.json, photos.json, images/).
 * Row 15: listings.json's fee_exact for three-bedrooms is wrong (one fee, $1,338); the verifier read all four
 * cards: two-bedrooms $953 and $1,047, three-bedrooms $1,338 and $1,378. The page uses those figures, as constants.
 * Homes: three live strips (G.homesQ), no "send me" offer. Picture: one USDA NAIP aerial (public domain),
 * cropped and labelled from coordinates, until the photo partner's shots arrive.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/regency-towers/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "regency-towers");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`regency-towers.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 9 (CORRECTED): 119 units on 17 floors numbered 1 to 18 with no 13, seven on every floor. */
const FLR = C.floors;
must(C.units === 119 && FLR.top === 18 && FLR.count === 17 && FLR.missing_between.join() === "13", "row 9 floors or units changed");
must(C.units === 17 * 7, "row 9: 17 floors of 7 no longer make the units");
const UNITS = C.units;
/* Row 8: built 1974 on 4 of 4 listings. */
must(L.year_built["1974"] === 4, "row 8 changed");
/* Rows 2, 4, 5: for sale now, by size. */
const A = L.asking;
must(L.api_total === 4 && L.at_504 === 4 && L.beds["2"] === 2 && L.beds["3"] === 2, "row 2 counts changed");
must(A.all.min === 127000 && A.all.max === 519900 && A.all.median === 409450, "row 4 asking changed");
must(A["2"].min === 127000 && A["2"].max === 343900 && A["3"].min === 475000 && A["3"].max === 519900, "row 4 asking by size changed");
must(A["2"].sqft_range.join() === "1260,1350" && A["3"].sqft_range.join() === "1600,1725", "row 5 sizes changed");
/* Row 15 (CORRECTED by the verifier): fees to the dollar, read from each listing card and by hoaMax. */
const FEE2 = [953, 1047], FEE3 = [1338, 1378];
must(L.fee_exact["2"].lowest === 953 && L.fee_exact["2"].highest === 1047 && L.fee_exact["3"].lowest === 1338, "row 15 fee_exact changed");
const FEE_LO = FEE2[0], FEE_HI = FEE3[1];
const YEAR_LO = FEE_LO * 12, YEAR_HI = FEE_HI * 12;
must(r100(YEAR_LO) === "$11,400" && r100(YEAR_HI) === "$16,500", "row 15 fees a year changed");
/* Row 16: what the fee pays, by the listings' agent-ticked flags ("the listings say"). */
const FG = L.flags;
must(FG.hoa_includes_insurance === 4 && FG.hoa_includes_trash === 4 && FG.hoa_includes_utilities === 3 && FG.hoa_includes_water_sewer === 3 && FG.hoa_includes_pest === 3 && FG.hoa_includes_cable === 3 && FG.hoa_includes_internet === 2 && FG.hoa_includes_electric === 0, "row 16 changed");
/* Row 17: nightly rentals by the listings' flags. */
must(FG.str_allowed === 3 && FG.long_term_rental_allowed === 2 && FG.vacation_rental_program === 1, "row 17 changed");
/* Row 13: four recorded deeds in the 12 months to September 2026. The four amounts are the verifier's (VERIFY row 13). */
const SW = C.sales.hub_window;
const DEEDS_N = [322500, 352000, 365000, 415000];
must(SW.window === "2025-10-01 to 2026-09-30" && SW.all.n === 4 && SW.all.median === 358500 && SW.all.min === 322500 && SW.all.max === 415000, "row 13 changed");
must(SW.buyer_tax_bill_out_of_sc === 3 && SW.buyer_tax_bill_in_sc === 1, "row 13 buyers changed");
must((DEEDS_N[1] + DEEDS_N[2]) / 2 === SW.all.median, "row 13 amounts no longer give the middle");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Rows 11 and 12: who owns, and who is taxed as home. */
must(C.owner_out_of_sc === 64 && C.taxed_as_home_4pct === 13, "rows 11 and 12 changed");
/* Row 21: flood zones under the lot. */
const aeShare = FL.zones_touching.filter((x) => x.attributes.FLD_ZONE === "AE").reduce((s, x) => s + x.share_of_footprint, 0);
const mod = FL.zones_touching.find((x) => x.attributes.FLD_ZONE === "0.2 PCT ANNUAL CHANCE FLOOD HAZARD");
const AE_PCT = Math.round(aeShare * 1000) / 10, MOD_PCT = Math.round(mod.share_of_footprint * 1000) / 10;
must(AE_PCT === 79.3 && MOD_PCT === 20.7 && FL.share_in_no_zone === 0 && FL.center_point_zones[0].FLD_ZONE === "AE", "row 21 changed");
/* Row 22: straight-line miles from the building center (recomputed by the verifier). */
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];
must(LAT === 33.664483 && LNG === -78.911248, "row 22 center changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_MD = `${MONTHS[rm - 1]} ${rd}`;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (same design pass as bay-view-resort.js).     */

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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/regency-towers-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table and the charts (rows 15, 13, 21): by size, then one message each. */

const FEE_TABLE = compareCards([
  { name: "Two-bedroom", bestFor: `${n(A["2"].sqft_range[0])} to ${n(A["2"].sqft_range[1])} sq ft`,
    cells: { fee: `${money(FEE2[0])} and ${money(FEE2[1])}`, year: `${r100(FEE2[0] * 12)} to ${r100(FEE2[1] * 12)}`, ask: `${money(A["2"].min)} to ${money(A["2"].max)}`, sale: `${L.beds["2"]}` } },
  { name: "Three-bedroom", bestFor: `${n(A["3"].sqft_range[0])} to ${n(A["3"].sqft_range[1])} sq ft`,
    cells: { fee: `${money(FEE3[0])} and ${money(FEE3[1])}`, year: `${r100(FEE3[0] * 12)} to ${r100(FEE3[1] * 12)}`, ask: `${money(A["3"].min)} to ${money(A["3"].max)}`, sale: `${L.beds["3"]}` } },
], [
  { key: "fee", label: "HOA fee a month" },
  { key: "year", label: "Fees a year" },
  { key: "ask", label: "Asking price" },
  { key: "sale", label: `For sale ${RUN_MD}`, num: true },
], { caption: "At Regency Towers, the HOA fee goes up with the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.regencymb.com/";
const ROOMS = "https://www.regencymb.com/luxury-accommodations.html";
const AMENITIES = "https://www.regencymb.com/exciting-amenities.html";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Regency Towers", alternateName: ["Regency Towers Myrtle Beach", "Regency Towers Condominiums"],
  description: `An oceanfront condo tower in south Myrtle Beach, South Carolina, built in 1974, with ${UNITS} condos.`,
  address: { "@type": "PostalAddress", streetAddress: "2511 S Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips. Checked 2026-11-17 against /homes/api/strip: 4 homes (3 shown; the strip drops the $127,000
   condo), 32 and 108. The MLS spells the building "Regency Towers". The pins of the nearby strips are
   measured from the building center, never from a listing's pin (row 3). */
const SUB = "subdivision=Regency Towers&type=condo";
const NEAR = `near=${LAT},${LNG}&miles=1&type=condo`;
const STRIP = G.homesQScript() + G.homesQ(SUB, "Condos for sale at Regency Towers");
const STRIP_NEAR = G.homesQ(`${NEAR}&beds=2&waterfront=1`, "Waterfront condos, two bedrooms or more, within a mile of Regency");
const STRIP_UNDER = G.homesQ(`${NEAR}&waterfront=1&max=400000`, "Waterfront condos under $400,000 within a mile of Regency Towers");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: "Regency Towers Myrtle Beach Condos for Sale: HOA Fees, Sales",
  description: `Regency Towers, 2511 S Ocean Blvd, Myrtle Beach: HOA fees by size, what ${SW.all.n} units sold for, the flood zone, and the condos for sale now.`,
  ogTitle: "Regency Towers, Myrtle Beach: condos for sale, HOA fees by size, sales and flood zone",
  crumb: "Regency Towers",
  eyebrow: "Regency Towers, Myrtle Beach",
  h1: "Regency Towers, Myrtle Beach: condos for sale on the oceanfront.",
  h1em: "In the county's records, the tower has 17 floors of condos, and none is numbered 13.",
  sub: `The oceanfront tower at 2511 S Ocean Blvd, in south Myrtle Beach. To book a stay instead, go to ${h.ext(RESORT, "the resort's own website")}.`,
  heroMedia: glance([
    { icon: "beach", label: "Location", text: "Oceanfront" },
    { icon: "home", label: "Condos", text: `${UNITS}` },
    { icon: "calendar", label: "Built", text: "1974" },
    { icon: "pin", label: "Sizes for sale", text: "2 and 3 bedrooms" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Regency Towers is a 1974 oceanfront tower in south Myrtle Beach with ${UNITS} condos. The ${L.api_total} for sale on ${RUN_MD} ask ${money(A.all.min)} to about ${r1k(Math.round(A.all.max/10000)*10000)}, and condos there sold for about ${r1k(Math.round(SW.all.median/10000)*10000)} in the middle over the past year.`,
    `The HOA fee on the condos for sale is ${money(FEE_LO)} to ${money(FEE_HI)} a month, higher for a three-bedroom. About four-fifths of the lot is in a high-risk flood zone, so we price flood insurance before you offer.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Regency Towers is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}, and the town is covered in our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")}.</p>` },

    { h2: "What is it like to own a condo at Regency Towers?", toc: "Owning here", id: "owning", html: () =>
      h.p(`In the county's records, the tower has ${UNITS} condos on 17 numbered floors, seven to a floor. Floors run from 1 to 18, and none is numbered 13. It matters when you compare units by floor. In the county's numbering, floor 18 is the top but only 17 floors have condos, so we confirm each unit's floor before we compare views.`) +
      h.p(`The resort lists its two-bedroom units at 1,350 square feet and its three-bedrooms at 1,725, and says its units have oceanfront balconies. The condos for sale run from ${n(A["2"].sqft_range[0])} to ${n(A["3"].sqft_range[1])} square feet, so sizes differ from unit to unit.`) +
      h.p(`The resort says the oceanfront pool is enclosed and heated in the winter. It also lists a kiddie pool, two outdoor hot tubs, an exercise room with a sauna, and a social room for up to 60 people.`) +
      h.p(`Springmaid Pier is about two-thirds of a mile south, in a straight line. The Family Kingdom amusement park is about 1.7 miles north, and Myrtle Beach State Park about 1.5 miles to the southwest.`) +
      PHOTO +
      STRIP_NEAR },

    { h2: "What are the HOA fees at Regency Towers?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The two-bedrooms for sale pay ${money(FEE2[0])} and ${money(FEE2[1])} a month in HOA fees, and the three-bedrooms pay ${money(FEE3[0])} and ${money(FEE3[1])}. Fees alone come to $11,400 to $16,500 a year.`) +
      FEE_TABLE +
      h.p(`All four listings say the fee pays the building's insurance and trash. Three say it also pays water and sewer, other utilities, pest control and cable, and two say internet. The electric bill is in none of them. Those are the listing agents' entries, so we ask for the budget that shows it.`) +
      h.p(`Four condos are not the whole building. The fee for the other units, the reserve study and any planned assessment are in the association's papers, and we read them before you offer. Our page on ${h.a("/hoa/documents/", "HOA documents")} lists what each one tells you.`) +
      h.p(`You still need a policy for the inside of your unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split. City property tax is separate from the fee, and our ${h.a("/buyers/property-taxes/", "property tax page")} shows how it is figured.`) +
      h.p(`Most of the condos in this strip are in other buildings along the oceanfront, so their fees and sizes differ from Regency Towers.`) + STRIP_UNDER },

    { h2: "What have condos sold for at Regency Towers?", toc: "Sales", id: "sales", html: (bg) =>
      h.p(`Over the past year, four Regency Towers condos sold for about $320,000 to about $415,000, with a middle of about $360,000.`) +
      h.p(`Three of the four buyers' tax bills went to addresses outside South Carolina. We compare a unit with sales of its own size before we price it.`) +
      h.cta("What is my Regency Towers condo worth?", "We pull the recorded sales that match your unit and send them. There is no automated value.", "Have us pull the Regency Towers sales for my unit", "/contact/", bg) },

    { h2: "Is Regency Towers in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`Yes. FEMA's map puts ${AE_PCT} percent of the Regency Towers lot in a high-risk flood zone, and the other ${MOD_PCT} percent in the moderate-risk zone. No part of the lot is outside the mapped zones.`) +
      h.p(`A lender usually asks for flood insurance on a home in a high-risk flood zone, and the price depends on the unit. We get the quote path before you offer, so it is in your budget. The map shows the county's drawing of the lot, not the walls, and our ${h.a("/buyers/flood-zone-check/", "flood zone check")} shows how we read it.`) +
      h.cta("Get the flood zone and a quote path before you offer", "We check the flood certificate and the building's flood cover for the unit you like.", "Have us check the flood zone for a Regency Towers unit", "/contact/", bg) },

    { h2: "Can you rent a Regency Towers condo by the night?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Mostly yes. ${FG.str_allowed} of the ${L.api_total} condos for sale on ${RUN_MD} say nightly rentals are allowed, and ${FG.long_term_rental_allowed} say long-term rentals are allowed. One is in a vacation rental program.`) +
      h.p(`The resort rents units through its own desk, and its ${h.ext(RESORT, "website")} takes reservations. We confirm the association's rental rules for any unit before you rely on them. Our ${h.a("/invest/str-rules/", "short-term rental rules page")} has the license and the taxes, and our ${h.a("/invest/rental-program-vs-airbnb/", "rental program versus Airbnb page")} shows the choices.`) +
      h.p(`Most owners live somewhere else. About ${Math.round(C.owner_out_of_sc / UNITS * 100)} in 100 send their tax bill to an address outside South Carolina, and ${C.taxed_as_home_4pct} condos are taxed as an owner's home. What condos earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for Regency Towers alone.`) },

    { h2: "What could go wrong at Regency Towers?", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>A 1974 building</strong>At this age we read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Flood cover</strong>Most of the lot is in a high-risk flood zone, so the flood quote comes before the offer, not after it.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a condo in a building like this one.`) +
      h.p(`To weigh Regency Towers against the other oceanfront buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/holiday-sands-south/", "Holiday Sands South")} (under a quarter mile) and ${h.a("/invest/condo-buildings/paradise-resort/", "Paradise Resort")} (about half a mile). Farther north: ${h.a("/invest/condo-buildings/grand-atlantic/", "Grand Atlantic")} (about half a mile) and ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (about 1 mile). Down the beach to the south: ${h.a("/invest/condo-buildings/surfmaster/", "Surfmaster by the Sea")} (about 7 miles) and ${h.a("/invest/condo-buildings/atalaya-towers/", "Atalaya Towers")} (about 7 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Regency Towers Myrtle Beach FAQ",
  faq: [
    { q: "When was Regency Towers in Myrtle Beach built?", a: "Regency Towers was built in 1974. All four condos for sale list 1974." },
    { q: "How many condos does Regency Towers have?", a: `The building has ${UNITS} units. In the county's records they sit on 17 numbered floors, seven to a floor, and none is numbered 13.` },
    { q: "How much is the HOA fee at Regency Towers?", a: `The condos for sale pay ${money(FEE2[0])} to ${money(FEE2[1])} a month for two bedrooms and ${money(FEE3[0])} to ${money(FEE3[1])} for three bedrooms. The listings say the fee pays insurance and trash.` },
    { q: "How much do Regency Towers condos sell for?", a: `Four sold over the past year, from about $320,000 to about $415,000, with a middle of about $360,000.` },
    { q: "Is Regency Towers in a flood zone?", a: `Yes. About four-fifths of the lot is in a high-risk FEMA flood zone, and the rest is in the moderate-risk zone.` },
    { q: "What is the address of Regency Towers?", a: "Regency Towers is at 2511 S Ocean Blvd, Myrtle Beach, SC 29577." },
    { q: "How many Regency Towers condos are for sale?", a: `On ${RUN}, ${L.api_total} were for sale: ${L.beds["2"]} two-bedrooms and ${L.beds["3"]} three-bedrooms.` },
    { q: "Is Regency Towers the same as Club Regency?", a: "Other places have similar names. This page is about the oceanfront tower at 2511 S Ocean Blvd." },
  ],
  sources: [
    { name: "Regency Towers resort", href: RESORT },
    { name: "rooms", href: ROOMS },
    { name: "amenities", href: AMENITIES },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "See the Regency Towers condos for sale.",
    p: "Pick a condo from the strips above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: "/contact/",
  },
  keywords: "regency towers myrtle beach, regency towers myrtle beach condos for sale, regency towers myrtle beach hoa fees, regency towers myrtle beach sc, 2511 s ocean blvd myrtle beach, regency towers condos for sale by owner, regency towers flood zone",
  about: "Regency Towers, a 119-unit oceanfront condo tower at 2511 S Ocean Blvd, Myrtle Beach, South Carolina",
});
