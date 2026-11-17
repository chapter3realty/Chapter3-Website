/* /invest/condo-buildings/palms-resort/ - the Palms Resort, 2500 N Ocean Blvd, Myrtle Beach: what owning a condo
 * there gives you, the HOA fee by unit size and what it pays, renting it by the night (the resort's own program),
 * what units sold for, and what we check before an offer.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17. Palace Resort and Bay View shape, built from its own data.
 * Facts: Blog-Brain batches/2026-11-f/palms-resort/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * wording only (VERIFY.md). Plan: PLAN.md. Data: data/2026-11-f/palms-resort/ (listings, county, sales_split, flood,
 * tax, distances, photos.json, images/). Every count, fee, price and share is read from those files and checked
 * against its ledger row with must(); a changed file stops the build until a person reads the row again.
 * Kept off the page (VERIFY.md): story count or height, the two-bedroom's price and fee, the penthouse price, any
 * single unit's fee, "main home" as a fact, "you will pay" a tax figure, the renovation date, staff names.
 * Picture: one USDA NAIP aerial (public domain), labelled from coordinates (images/label.py).
 * Homes: four live strips (G.homesQ), no "send me" offer. Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/palms-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "palms-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), SS = read("sales_split.json"),
  TX = read("tax.json"), DS = read("distances.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`palms-resort.js: ${msg}`); };

/* Row 1: the MLS name, 9 for sale. */
must(L.api_total === 9 && L.subdivision_field["PALMS, THE"] === 9, "row 1 changed");
/* Row 5: built 1985 on all 9 cards. */
must(L.year_built["1985"] === 9, "row 5 changed");
/* Row 7 (CORRECTED): 96 parcels: 89 numbered, 6 penthouses, 1 commercial; 95 condos. */
must(C.units === 96 && C.landuse_first_digit["1xx"] === 95 && C.landuse_first_digit["3xx"] === 1, "row 7 changed");
const CONDOS = C.landuse_first_digit["1xx"];
/* Row 20 (CORRECTED): 4 of the 95 condos taxed at the owner-occupant rate; 76 of 96 owners' tax-bill addresses outside SC. */
must(C.taxed_as_home_4pct === 4 && TX.units_at_6pct === 91 && C.owner_out_of_sc === 76, "row 20 changed");
/* Row 9: the fee by size, to the dollar (bisection). */
const FX = L.fee_exact;
must(FX["1"].n === 4 && FX["1"].lowest === 658 && FX["1"].highest === 658, "row 9 one-bedroom fee changed");
must(FX["3"].n === 2 && FX["3"].lowest === 1120 && FX["3"].highest === 1186, "row 9 three-bedroom fee changed");
const FEE1 = 658, FEE3_LO = 1120, FEE3_HI = 1186;
/* Row 11: a year of fees. */
const Y1 = FEE1 * 12, Y3_LO = FEE3_LO * 12, Y3_HI = FEE3_HI * 12;
must(r100(Y1) === "$7,900" && r100(Y3_LO) === "$13,400" && r100(Y3_HI) === "$14,200", "row 11 changed");
/* Row 10: what the fee pays, by the listings' flags. */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 8 && FG.hoa_includes_utilities === 8 && FG.hoa_includes_internet === 8 && FG.hoa_includes_pest === 8 && FG.hoa_includes_trash === 6 && FG.hoa_includes_insurance === 5 && FG.hoa_includes_cable === 2 && FG.hoa_includes_electric === 0, "row 10 changed");
/* Row 14: for sale now, by size. */
const A = L.asking;
must(L.beds["1"] === 4 && L.beds["2"] === 1 && L.beds["3"] === 4, "row 14 counts changed");
must(A["1"].median === 191000 && A["1"].min === 159500 && A["1"].max === 199000 && A["1"].sqft_range.join() === "588,588", "row 14 one-bedroom changed");
must(A["3"].median === 333900 && A["3"].min === 325000 && A["3"].max === 340000 && A["3"].sqft_range.join() === "1151,1248", "row 14 three-bedroom changed");
must(A.all.median === 325000, "row 14 all changed");
/* Row 12 (CORRECTED): tax at the second-home rate, city millage 254.6 (CON row 21), at today's typical asking price,
   before any exemption, credit or fee. Round to $100. */
const MILLS = 254.6;
const TAX1 = A["1"].median * 0.06 * MILLS / 1000, TAX3 = A["3"].median * 0.06 * MILLS / 1000;
must(Math.round(TAX1) === 2918 && Math.round(TAX3) === 5101, "row 12 changed");
/* Row 13: fees plus tax; the parts and the sums agree when rounded to $100. */
const T1 = Y1 + TAX1, T3_LO = Y3_LO + TAX3, T3_HI = Y3_HI + TAX3;
must(r100(T1) === "$10,800" && r100(TAX1) === "$2,900" && r100(T3_LO) === "$18,500" && r100(T3_HI) === "$19,300" && r100(TAX3) === "$5,100", "row 13 changed");
/* Row 15 and 16: what the listings say. */
must(FG.furnished === 9 && FG.oceanfront_unit === 8 && FG.ocean_view === 8 && FG.balcony === 8 && FG.indoor_pool === 8 && FG.elevator_building === 8 && FG.high_floor_unit === 7 && FG.parking_garage === 6 && FG.pets_allowed === 5, "row 15 changed");
must(FG.str_allowed === 8 && FG.long_term_rental_allowed === 8 && FG.vacation_rental_program === 7, "row 16 changed");
/* Rows 17 and 18: recorded deeds. The penthouse sale is left out of the middle and its price is never printed. */
const S1 = SS["hub_window_2025-10-01_to_2026-09-30"], S2 = SS["later_window_2025-11-01_to_2026-10-31"];
must(C.sales.hub_window.window === "2025-10-01 to 2026-09-30", "row 17 window changed");
must(S1.all.n === 9 && S1.numbered_units_only.n === 8 && S1.numbered_units_only.median === 147500 && S1.numbered_units_only.min === 132500 && S1.numbered_units_only.max === 329000 && S1.penthouse.n === 1, "row 17 changed");
must(S1.floors_11_up.n === 2 && S1.floors_11_up.min === 180000 && S1.floors_11_up.max === 250000, "row 17 floors changed");
must(S2.numbered_units_only.n === 6 && S2.numbered_units_only.median === 147450, "row 18 changed");
/* Row 19 (CORRECTED): the county's tax-bill address today, 8 of the 9 units that sold. */
must(C.sales.hub_window.buyer_tax_bill_out_of_sc === 8 && C.sales.hub_window.buyer_is_company === 2, "row 19 changed");
/* Row 30: flood shares of the area under the unit parcels. */
const zone = (z) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
must(zone("AE").share_of_footprint === 0.11 && zone("AE").attributes.STATIC_BFE === 14 && zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint === 0.351 && FL.share_in_no_zone === 0.539, "row 30 changed");
const AE_PCT = Math.round(zone("AE").share_of_footprint * 100), MOD_PCT = Math.round(zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint * 100), NONE_PCT = Math.round(FL.share_in_no_zone * 100);
/* Row 31: straight-line distances. */
must(DS.miles["Pier 14"] === 0.85 && DS.miles["SkyWheel"] === 0.97, "row 31 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const [, wy, wm] = C.sales.hub_window.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];

/* ---------------------------------------------------------------------------- */
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

/* The picture: one labelled NAIP aerial (public domain). */
const AERIAL = PHOTOS.find((p) => p.file.endsWith("/palms-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: "The Palms Resort from above" }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* The fee table (rows 9, 11, 14). */
const FEE_TABLE = compareCards([
  { name: "One-bedroom", bestFor: "588 sq ft",
    cells: { fee: money(FEE1), year: `About ${r100(Y1)}`, ask: `About ${r1k(A["1"].median)}`, sale: `${L.beds["1"]}` } },
  { name: "Three-bedroom", bestFor: `${n(A["3"].sqft_range[0])} to ${n(A["3"].sqft_range[1])} sq ft`,
    cells: { fee: `${money(FEE3_LO)} to ${money(FEE3_HI)}`, year: `${r100(Y3_LO)} to ${r100(Y3_HI)}`, ask: `About ${r1k(A["3"].median)}`, sale: `${L.beds["3"]}` } },
], [
  { key: "fee", label: "HOA fee a month" },
  { key: "year", label: "Fees a year" },
  { key: "ask", label: "Middle asking price" },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At the Palms, a bigger unit pays a bigger HOA fee", nameLabel: "Unit", bestForLabel: "Size" });

/* Sources */
const RESORT = "https://www.palmsresort.com/";
const FAQPAGE = "https://www.palmsresort.com/faq/";
const PROGRAM = "https://www.palmsresort.com/rental-management/";
const AMENITIES = "https://www.palmsresort.com/amenities/resort-amenities/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const FANNIE = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const HUD = "https://entp.hud.gov/idapp/html/condlook.cfm";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "The Palms Resort", alternateName: ["The Palms", "Palms Resort Myrtle Beach"],
  description: `An oceanfront condo building from 1985 with ${CONDOS} condos on North Ocean Boulevard in Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "2500 N Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips, checked on /homes/api/strip 2026-11-17: 9, 4, 7 and 51 homes. The MLS spells the building "Palms, The".
   Every strip has a subdivision or a max price, so the strip API does not drop the low-priced condos. */
const SUB = "type=condo&subdivision=Palms, The";
const STRIP = G.homesQScript() + G.homesQ(SUB, "Condos for sale at the Palms Resort, on the ocean");
const STRIP_3BR = G.homesQ(`${SUB}&beds=3&max=450000`, "Palms Resort condos with three bedrooms");
const STRIP_RENT = G.homesQ(`${SUB}&has=vacation_rental_program`, "Palms Resort condos in the resort's rental program");
const STRIP_NEAR = G.homesQ(`type=condo&near=${LAT},${LNG}&miles=1&has=oceanfront_unit&max=200000`, "Oceanfront condos within a mile of the Palms, under $200,000");
const GRAND = "/homes/?subdivision=Grand%20Palms%20Resort%20%28formerly%20Plantation%20Resort%29";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Palms Resort Myrtle Beach Condos for Sale: Fees From ${r5(FEE1)}`,
  description: `The Palms Resort, 2500 N Ocean Blvd, Myrtle Beach: HOA fees by size, what they pay, nightly rentals, what ${S1.all.n} units sold for and what is for sale now.`,
  ogTitle: "The Palms Resort, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "The Palms",
  eyebrow: "Palms Resort, Myrtle Beach",
  h1: "The Palms Resort, Myrtle Beach: condos for sale on the ocean.",
  h1em: "A bigger unit pays a bigger fee, and the resort runs rentals on site.",
  sub: `Palms Resort condos run from ${A["1"].sqft_range[0]} square foot one-bedrooms to three-bedrooms of up to ${n(A["3"].sqft_range[1])} square feet, at two street numbers on the beach.`,
  heroMedia: glance([
    { icon: "beach", label: "On the beach", text: "Oceanfront" },
    { icon: "home", label: "Condos", text: `${CONDOS}` },
    { icon: "calendar", label: "Built", text: "1985" },
    { icon: "key", label: "Nightly rentals", text: "Most allow" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The Palms Resort is an oceanfront condo building at 2500 N Ocean Blvd in Myrtle Beach, built in 1985, with ${CONDOS} condos. Only ${C.taxed_as_home_4pct} of the ${CONDOS} are taxed at the owner-occupant rate. The one-bedrooms for sale are all 588 square feet and ask about ${r1k(A["1"].min)} to ${r1k(A["1"].max)}. The three-bedrooms ask about ${r1k(A["3"].min)} to ${r1k(A["3"].max)}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">The Palms is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>`
      + `<p class="c3-pr-up">Booking a stay? The resort takes reservations on ${h.ext(RESORT, "its own website")}. Grand Palms Resort on Double Eagle Drive is a different place; ${h.a(GRAND, "see its homes")}.</p>` },

    { h2: "What is for sale at the Palms Resort now?", toc: "For sale now", id: "for-sale", html: () =>
      h.p(`On ${RUN}, ${L.api_total} Palms condos were for sale. The ${L.beds["1"]} one-bedrooms, ${A["1"].sqft_range[0]} square feet each, are at 2406 N Ocean Blvd, and the ${L.beds["3"]} three-bedrooms, ${n(A["3"].sqft_range[0])} to ${n(A["3"].sqft_range[1])} square feet, are at 2500.`) +
      h.p(`The middle asking price is about ${r1k(A["1"].median)} for a one-bedroom and about ${r1k(A["3"].median)} for a three-bedroom. The county records both street numbers as one condo property.`) +
      STRIP_3BR +
      PHOTO +
      h.p(`The resort describes its units as one-bedroom suites and three-bedroom condos, each with a private balcony and a kitchen. The resort's guest pages list an oceanfront pool open in season, a heated indoor pool, indoor and outdoor whirlpools, an exercise room and an oceanfront lawn. Washers and dryers come with the two- and three-bedrooms.`) +
      h.p(`All ${L.api_total} condos for sale came furnished, and ${FG.oceanfront_unit} were listed as oceanfront units with an ocean view.`) +
      h.p(`Next door is ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")}.`) },

    { h2: "How much is the HOA fee at the Palms Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`A bigger unit pays a bigger fee. Every one-bedroom for sale lists ${money(FEE1)} a month. Two of the four three-bedrooms list a fee, and those two list ${money(FEE3_LO)} and ${money(FEE3_HI)}.`) +
      FEE_TABLE +
      h.p(`Most listings include water and sewer, a utility, internet and pest control in the fee. Some add trash and the building's insurance, and two add cable. No listing includes the power bill in the fee. The HOA papers decide what it covers, and we read them before you offer.`) +
      h.h3("What a year costs before any loan") +
      h.p(`At today's typical asking price, before any exemption, credit or fee on the bill, fees plus property tax come to about the totals below. A sale price below asking would lower the tax bill.`) +
      h.table(["Each year, at the middle asking price", "One-bedroom", "Three-bedroom"], [
        ["HOA fees", r100(Y1), `${r100(Y3_LO)} to ${r100(Y3_HI)}`],
        ["Property tax as a second home or rental", r100(TAX1), r100(TAX3)],
        ["<strong>About</strong>", `<strong>${r100(T1)}</strong>`, `<strong>${r100(T3_LO)} to ${r100(T3_HI)}</strong>`],
      ]) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Left out</strong>The loan, power and your unit's own insurance.</li>`
        + `<li><strong>The tax rate</strong>South Carolina taxes a second home or rental on 6 percent of its value.</li>`
        + `<li><strong>A home you live in</strong>It has a lower rate. Our ${h.a("/buyers/property-taxes/", "property tax page")} shows it.</li>`
        + `</ul>` +
      h.p(`Our ${h.a("/hoa/master-insurance-ho6/", "page on the building's policy and your own condo policy")} explains the split. Our agents' experience is that buyers in rental-program buildings pay a transfer fee at closing and often put a few months of dues in escrow.`) +
      h.cta("Know the Palms fees before you offer", "We ask the association for the unit's dues, its transfer fee and any dues held at closing, and we add them up for you.", "Have us check a Palms unit's HOA papers", "/contact/", bg) },

    { h2: "What have Palms Resort condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${S1.all.n} Palms condos sold in the past year, by Horry County's deed records. Eight were numbered units, and their middle sale price was about ${r1k(S1.numbered_units_only.median)}, from ${money(S1.numbered_units_only.min)} to ${money(S1.numbered_units_only.max)}. The ninth was a penthouse, which sold for far more, so we leave it out of the middle.`) +
      h.p(`${S1.floors_11_up.n} of the sales were on the 11th floor and up, for ${money(S1.floors_11_up.min)} and ${money(S1.floors_11_up.max)}.`) +
      h.p(`Nine sales is a small sample, so read the middle as a guide and not a typical price. The year after agrees, at a middle of about ${r1k(S2.numbered_units_only.median)}.`) +
      h.p(`The deeds do not record bedrooms, so we compare a unit with sales of its own size. We price an offer from the recorded sales. Our ${h.a("/sell/home-value/", "home value page")} explains how.`) },

    { h2: "Can you rent your Palms Resort condo by the night?", toc: "Renting it", id: "renting", html: () =>
      h.p(`The resort's on-site program rents units by the night, and ${FG.str_allowed} of the ${L.api_total} condos for sale on ${RUN_MD} were listed as allowing short-term rentals. The HOA papers set the rule for a given unit.`) +
      h.p(`The lot sits in a City of Myrtle Beach zoning district that the city's rental map mostly shades for nightly rentals. That share is for the whole district, not this lot. ${FG.vacation_rental_program} of the ${L.api_total} listings were in a rental program.`) +
      STRIP_RENT +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's own program</strong>The resort says its on-site rental management company has "over 40 years of service". It lists a front desk, maintenance and housekeeping staff, revenue management, group sales and a call center. It does not publish what share of the rent an owner keeps, so we get its terms for any unit you consider.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`Our agents' experience is that rental programs here are usually in oceanfront buildings. Buyers in them pay transfer fees and often a few months of dues in escrow. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`What one-bedrooms and larger units earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for the Palms alone.`) +
      h.h3("Who owns here") +
      h.p(`Most owners live somewhere else. About ${Math.round(C.owner_out_of_sc / C.units * 100)} in 100 send their tax bill to an address outside South Carolina. Only ${C.taxed_as_home_4pct} of the ${CONDOS} condos are taxed as an owner's home, and the county taxes the rest at the higher second-home and rental rate.`) +
      h.p(`Of the ${S1.all.n} units that sold in the past year, ${C.sales.hub_window.buyer_tax_bill_out_of_sc} have a tax-bill address outside South Carolina today, and ${C.sales.hub_window.buyer_is_company} went to companies.`) +
      h.h3("The resort's rules for guests") +
      h.p(`Guests must be 21 to check in, except for winter monthly rentals, where the resort's minimum age is 55. Pets are not allowed, with a $500 fine. An owner's own rules are in the HOA papers, and we read them before you offer.`) },

    { h2: "Can you get a loan on a Palms Resort condo?", toc: "Loans", id: "loans", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Fannie Mae</strong>It will not buy a loan on a unit in a building run like a hotel.</li>`
        + `<li><strong>The Palms</strong>It has a check-in desk and an on-site rental program, so a lender reviews the building before it lends.</li>`
        + `<li><strong>HUD</strong>The Palms is not on its list of condos approved for FHA loans in Horry County.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Palms unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.cta("Ask whether a Palms unit clears a lender's review", "Tell us the unit. We ask the building what a lender will want to see, and you can ask our affiliated lender, BrickWood Mortgage, a separate company, about the loan.", "Ask about a Palms loan", "/contact/", bg) },

    { h2: "Is the Palms Resort in a flood zone?", toc: "Flood", id: "flood", html: () =>
      h.p(`Part of the lot is. On the county's drawing of the unit lots, about ${AE_PCT} percent is in FEMA's high-risk flood zone. There a big flood is expected to reach ${zone("AE").attributes.STATIC_BFE} feet above sea level. About ${MOD_PCT} percent is in a moderate-risk zone and the rest is outside the mapped zones.`) +
      h.p(`The listings' flood-zone field is blank for all ${L.api_total}. The building's own zone can differ from the lot map. We get the survey that shows how high its floor sits, and we check the flood cover in the building's policy. Our ${h.a("/buyers/flood-zone-check/", "flood zone check")} shows how to look up an address.`) },

    { h2: "What is near the Palms Resort?", toc: "Nearby", id: "nearby", html: () =>
      h.p(`Pier 14 is ${DS.miles["Pier 14"]} miles away and the SkyWheel ${DS.miles["SkyWheel"]} miles, both in a straight line. Next door is ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")}, and the county also lists the Carolina Grande condos within about 250 meters.`) +
      STRIP_NEAR +
      h.p(`To weigh the Palms against the other buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. For the city around it, see ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (under a quarter mile) and ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (under a quarter mile). Farther north: ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 2 miles) and ${h.a("/invest/condo-buildings/caravelle-resort/", "Caravelle Resort")} (about 4 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/roxanne-towers/", "Roxanne Towers")} (about half a mile) and ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 1 mile). Farther south: ${h.a("/invest/condo-buildings/sea-mist-resort/", "Sea Mist Resort")} (about 3 miles) and ${h.a("/invest/condo-buildings/landmark-resort/", "Landmark Resort")} (about 3 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Palms Resort Myrtle Beach FAQ",
  faq: [
    { q: "Which Palms is this?", a: `The Palms Resort is at 2500 N Ocean Blvd in Myrtle Beach. Grand Palms Resort, on Double Eagle Drive, is a different place.` },
    { q: "What is the HOA fee at the Palms Resort?", a: `On ${RUN_MD}, every one-bedroom for sale listed ${money(FEE1)} a month. The three-bedrooms that listed a fee showed ${money(FEE3_LO)} and ${money(FEE3_HI)}.` },
    { q: "Can you rent a Palms Resort condo by the night?", a: `The resort's on-site program rents units by the night. The HOA papers set the rule for a given unit, and we read them before you offer.` },
    { q: "What do Palms Resort condos sell for?", a: `${S1.numbered_units_only.n} numbered units sold in the past year at a middle of about ${r1k(S1.numbered_units_only.median)}. Nine sales is a small sample.` },
    { q: "Does the Palms Resort have a pool?", a: "The resort's guest pages list an oceanfront outdoor pool, open in season, and a heated indoor pool, with indoor and outdoor whirlpools." },
    { q: "When was the Palms Resort built?", a: "The listings give 1985 for all nine condos for sale, so the building is about 40 years old." },
    { q: "How many Palms Resort condos are for sale?", a: `On ${RUN_MD}, ${L.api_total} Palms Resort condos were for sale: ${L.beds["1"]} one-bedrooms, ${L.beds["2"]} two-bedroom and ${L.beds["3"]} three-bedrooms.` },
  ],
  sources: [
    { name: "Palms Resort", href: RESORT },
    { name: "guest FAQ", href: FAQPAGE },
    { name: "amenities", href: AMENITIES },
    { name: "rental program", href: PROGRAM },
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
    h2: "See the Palms condos for sale.",
    p: "Pick a condo from the strip above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: "/contact/",
  },
  keywords: "palms resort myrtle beach condos for sale, the palms resort myrtle beach for sale, palms resort myrtle beach hoa fees, palms resort myrtle beach penthouses, 2500 n ocean blvd myrtle beach",
  about: "The Palms Resort, an oceanfront condo building at 2500 N Ocean Blvd, Myrtle Beach, South Carolina",
});
