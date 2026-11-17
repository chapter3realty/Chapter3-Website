/* /invest/condo-buildings/grande-shores/ - Grande Shores, 201 77th Ave N, Myrtle Beach: what owning a condo
 * there gives you, the HOA fee by unit size and what it pays, the county's tax, renting it by the night,
 * what units sold for, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. Model: specs/palace-resort.js (the pilot).
 * Facts: Blog-Brain batches/2026-11-e/grande-shores/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-e/grande-shores/ (listings.json, county.json, flood.json, tax.json, nearby.json,
 * strips.json, photos.json; README.md has the rerun order).
 * Every count, fee, price, share and tax value is read from those files here and checked against its ledger
 * row with must(); a changed file stops the build until a person reads the row again.
 * Picture: Philip Tellis's CC BY-SA 2.0 photo from Wikimedia Commons (record in photos.json), until the
 * photo partner's shots arrive. Its source is 1200 px wide, too small for photos.js crops, so the share
 * image is the 1200 x 630 cut the rental-program page already uses (ogImage, no pageImages).
 * Homes: four live strips (the building, two bedrooms and up, $160,000 or less, oceanfront condos within a
 * mile). The edge feed at the top of the page is the lead's (BUILD.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/grande-shores/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "grande-shores");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TX = read("tax.json"), NB = read("nearby.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r50 = (v) => money(Math.round(v / 50) * 50);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`grande-shores.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 2 and 3: 136 condos; doors on floors 3 to 12; 13 condo doors on the 7th floor, 19 on each of 8 to 11. */
const CONDOS = C.condo_units;
must(CONDOS === 136 && C.penthouse_units === 13, "row 2 changed");
const UPF = C.floors.units_per_floor;
must(UPF["7"] === 13 && UPF["8"] === 19 && UPF["11"] === 19 && UPF["3"] === 5 && UPF["12"] === 14, "row 3 changed");
/* Row 4: MLS year built 2000 (9) and 2001 (1). */
must(L.year_built["2000"] === 9 && L.year_built["2001"] === 1, "row 4 changed");
/* Row 8: the fee by size, to the dollar (bisection), rounded to $5. */
const FX = L.fee_exact;
must(FX["1"].n === 4 && FX["1"].lowest === 921 && FX["1"].highest === 1038, "row 8 one-bedroom fee changed");
must(FX["2"].n === 3 && FX["2"].lowest === 1507 && FX["2"].highest === 1531, "row 8 two-bedroom fee changed");
must(FX["3"].n === 3 && FX["3"].lowest === 1745 && FX["3"].highest === 1869, "row 8 three-bedroom fee changed");
const LO = ["1", "2", "3"].map((k) => FX[k].lowest), HI = ["1", "2", "3"].map((k) => FX[k].highest);
must(r5(LO[0]) === "$920" && r5(HI[0]) === "$1,040" && r5(LO[1]) === "$1,505" && r5(HI[1]) === "$1,530" && r5(LO[2]) === "$1,745" && r5(HI[2]) === "$1,870", "row 8 rounding");
/* Row 9: what the fee pays, by the listings' flags. */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 9 && FG.hoa_includes_trash === 9 && FG.hoa_includes_insurance === 9 && FG.hoa_includes_internet === 9 && FG.hoa_includes_pest === 9 && FG.hoa_includes_electric === 9, "row 9 changed");
/* Row 7: for sale now, by size. */
const A = L.asking;
must(L.api_total === 10 && L.beds["1"] === 4 && L.beds["2"] === 3 && L.beds["3"] === 3, "row 7 counts changed");
must(A["1"].median === 147449.5 && A["2"].median === 199900 && A["3"].median === 359900 && A.all.median === 189900, "row 7 asking middles changed");
must(A["1"].sqft_range.join() === "550,551" && A["2"].sqft_range.join() === "893,893" && A["3"].sqft_range.join() === "1122,1365", "row 7 sizes changed");
/* Rows 10 and 11: tax. The county's values today imply about $2,300 a year in the middle (row 10);
   a buyer plans on price x 6 percent x 254.6 mills (row 11). */
const MILLS = 254.6;
const TAXASK = ["1", "2", "3"].map((k) => A[k].median * 0.06 * MILLS / 1000);
must(Math.round(TAXASK[0]) === 2252 && Math.round(TAXASK[1]) === 3054 && Math.round(TAXASK[2]) === 5498, "row 11 tax changed");
must(TX.units_at_6pct === 134 && TX.implied_tax_city_millage.median === 2284 && TX.implied_tax_city_millage.p25 === 1617 && TX.implied_tax_city_millage.p75 === 3198, "row 10 changed");
must(r100(TX.implied_tax_city_millage.median) === "$2,300" && r100(TX.implied_tax_city_millage.p25) === "$1,600" && r100(TX.implied_tax_city_millage.p75) === "$3,200", "row 10 rounding");
/* Row 12 (CORRECTED): a year of fees plus tax, before the loan and the unit's own insurance. */
const FY_LO = LO.map((f) => f * 12), FY_HI = HI.map((f) => f * 12);
must(r100(FY_LO[0]) === "$11,100" && r100(FY_HI[0]) === "$12,500", "row 12 fee year changed");
const HOLD_LO = FY_LO.map((f, i) => f + TAXASK[i]), HOLD_HI = FY_HI.map((f, i) => f + TAXASK[i]);
must(r100(HOLD_LO[0]) === "$13,300" && r100(HOLD_HI[0]) === "$14,700" && r100(HOLD_LO[1]) === "$21,100" && r100(HOLD_HI[1]) === "$21,400", "row 12 totals changed");
/* Row 13: taxed as the owner's home. */
must(C.taxed_as_home_4pct === 2 && C.taxed_at_6pct === 134, "row 13 changed");
/* Row 15: rentals, by the listings' flags. */
must(FG.vacation_rental_program === 10 && FG.str_allowed === 9 && FG.furnished === 10 && FG.covered_parking === 10 && FG.indoor_pool === 10, "row 15 changed");
/* Rows 19: recorded deeds, the directory's window. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30", "row 19 window changed");
must(SW.all.n === 10 && SW.all.median === 150250 && SW.all.p25 === 124500 && SW.all.p75 === 218750 && SW.all.min === 109000 && SW.all.max === 369000, "row 19 changed");
const ONE_IN = Math.round(CONDOS / SW.all.n);
must(ONE_IN === 14, "row 19 share changed");
must(A.all.median > SW.all.median, "row 19: asking is no longer above the sales middle; rewrite the sentence");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 21: flood zones under the lot: FEMA's moderate band over 77.8 percent, no mapped zone on the rest. */
must(FL.zones_touching.length === 1 && FL.zones_touching[0].attributes.FLD_ZONE === "0.2 PCT ANNUAL CHANCE FLOOD HAZARD" && FL.zones_touching[0].attributes.SFHA_TF === "F" && FL.zones_touching[0].share_of_footprint === 0.778 && FL.share_in_no_zone === 0.222, "row 21 changed");
/* Row 25: straight-line miles. */
const MI = (k) => NB.places[k].miles;
must(MI("Broadway at the Beach") === 4.3 && MI("Myrtle Beach Boardwalk") === 5.4 && MI("Myrtle Beach International Airport") === 7.9, "row 25 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
/* The Palace's one-bedroom fee, for one comparison (Palace VERIFY row 6, same method). */
const PALACE_1BR = "$685";

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the Palace page's design).                   */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:1rem!important;row-gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.55rem!important;padding:.5rem 0!important;min-width:0}${S} .c3-glance li:nth-last-child(-n+2){border-bottom:${RULE}!important}}`
  + `@media (max-width:359px){${S} .c3-glance li>span.i{display:none!important}${S} .c3-glance{column-gap:.8rem!important}}`
  + `${S} h2{text-wrap:balance}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  + `${S} .c3-pr-list{list-style:none;padding:0;margin:1rem 0 1.4rem;max-width:720px}`
  + `${S} .c3-pr-list li{margin:0;padding:.8rem 0 .85rem;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} .c3-pr-list li:last-child{border-bottom:${RULE}}${S} .c3-pr-list strong{color:var(--navy);display:block;margin-bottom:.15rem}`
  + `${S} .c3-pr-up{margin:1.4rem 0 0;max-width:720px;color:var(--muted);line-height:1.7}`
  + `${S} .c3-gchart,${S} .c3-cc,${TBL}{max-width:720px!important;box-sizing:border-box}`
  + `${TBL}{${FLAT};padding:0!important}${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${S} .c3-pr-open .hx-strip:not(:empty){margin:0 0 1.2rem}`
  + `${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  + `@media (max-width:359px){${S} .hx-feed .hx-fb-ai,${S} label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* The picture: Philip Tellis's photo from the beach, under its sentence.         */

const BEACH = PH.findPhoto(PHOTOS, "oceanfront-resort-from-the-beach");
must(BEACH && BEACH.license === "CC BY-SA 2.0", "no photo record, or the licence changed");
const PHOTO = PH.heroPhoto(BEACH, { alt: BEACH.alt, caption: BEACH.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: BEACH, caption: BEACH.caption.replace(/\.$/, "") }]);

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 7, 8, 11): the page's main tool.                           */

const SALES_CHART = () => G.bars([
  { name: `Asking now (${L.api_total} for sale)`, value: A.all.median, valueText: `About ${r1k(A.all.median)}` },
  { name: `Sold, past year (${SW.all.n} sales)`, value: SW.all.median, valueText: `About ${r1k(SW.all.median)}` },
], { caption: `Middle asking price and middle sale price at Grande Shores`, nameLabel: "Grande Shores condos", valueLabel: "Middle price", compact: true, max: Math.round(A.all.median * 1.4),
  note: `Middle asking price on ${RUN}; middle recorded sale price, ${PERIOD}. Sizes are mixed in both.` });

const SIZES = [
  { name: "One-bedroom", k: "1", i: 0 },
  { name: "Two-bedroom", k: "2", i: 1 },
  { name: "Three-bedroom", k: "3", i: 2 },
];
const feeRange = (i) => `${r5(LO[i])} to ${r5(HI[i])}`;
const yearRange = (i) => `${r100(FY_LO[i])} to ${r100(FY_HI[i])}`;
const sqft = (k) => { const [a, b] = A[k].sqft_range; return b === a ? `${n(a)} sq ft` : b - a <= 2 ? `About ${n(a)} sq ft` : `${n(a)} to ${n(b)} sq ft`; };
const FEE_TABLE = compareCards(SIZES.map((s) => ({
  name: s.name,
  bestFor: sqft(s.k),
  cells: { fee: feeRange(s.i), tax: `About ${r50(TAXASK[s.i])}`, sale: `${L.beds[s.k]}` },
})), [
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "tax", label: "Tax a year at the middle asking price", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At Grande Shores, the fee goes by the size of the unit", nameLabel: "Unit", bestForLabel: "Size in listings" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.grandeshores.com/";
const ABOUT = "https://www.grandeshores.com/about";
const ROOMS = "https://www.grandeshores.com/accommodations";
const FAQPAGE = "https://www.grandeshores.com/faq";
const OWNERS = "https://www.grandeshores.com/about/owner-services";
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
  name: "Grande Shores", alternateName: ["Grande Shores Ocean Resort", "Grande Shores Myrtle Beach"],
  description: `An oceanfront resort with hotel rooms and ${CONDOS} condos you can own, on 77th Avenue North in Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "201 77th Ave N", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29572", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* ---------------------------------------------------------------------------- */
/* The homes strips (owner, round 2, 2026-11-14): each search checked on the live site, 10, 6, 4 and 199. */

const STRIP = G.homesQScript() + G.homesQ("subdivision=Grande Shores", "Own a condo at Grande Shores, on the ocean in Myrtle Beach");
const STRIP_BEDS = G.homesQ("subdivision=Grande Shores&beds=2", "Grande Shores condos with two or more bedrooms");
const STRIP_CHEAP = G.homesQ("subdivision=Grande Shores&max=160000", "Grande Shores condos for $160,000 or less");
const STRIP_NEAR = G.homesQ(`near=${FL.footprint_center[0].toFixed(4)},${FL.footprint_center[1].toFixed(4)}&miles=1&type=condo&has=water_ocean`, "Oceanfront condos within a mile of Grande Shores");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  ogImage: "https://chapter3realty.com/images/2026-11-e/grande-shores/oceanfront-resort-share.jpg",
  ogImageAlt: BEACH.alt,
  title: `Grande Shores Myrtle Beach Condos for Sale: Fees From ${r5(LO[0])}`,
  description: `Grande Shores, 201 77th Ave N, Myrtle Beach: condos for sale now, HOA fees by size, the county's tax, nightly rentals and what ${SW.all.n} units sold for.`,
  ogTitle: "Grande Shores, Myrtle Beach: condos for sale, HOA fees by size, tax, rentals and sales",
  crumb: "Grande Shores",
  eyebrow: "Grande Shores, Myrtle Beach",
  h1: "Grande Shores, Myrtle Beach: owning a condo at the oceanfront resort on 77th Avenue North.",
  h1em: `The fee pays the power bill in ${FG.hoa_includes_electric} of the ${L.api_total} listings.`,
  sub: `${L.api_total} of the resort's ${CONDOS} condos were for sale on ${RUN_SHORT}. One-bedrooms ask about ${r1k(A["1"].median)} and three-bedrooms about ${r1k(A["3"].median)}, with fees of ${r5(LO[0])} to ${r5(HI[2])} a month.`,
  heroMedia: glance([
    { icon: "beach", label: "On the ocean", text: "77th Ave N" },
    { icon: "home", label: "Condos", text: `${CONDOS}` },
    { icon: "pool", label: "Pools", text: "Indoor and outdoor" },
    { icon: "dollar", label: "For sale", text: `${L.api_total} on ${RUN_SHORT}` },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Grande Shores is an oceanfront resort at 201 77th Ave N, in the north end of Myrtle Beach. It has hotel rooms and ${CONDOS} condos you can own.`,
    `Asking prices in the middle were about ${r1k(A["1"].median)} for a one-bedroom, ${r1k(A["2"].median)} for a two-bedroom and ${r1k(A["3"].median)} for a three-bedroom. The monthly HOA fee the listings give is about ${feeRange(0)} for a one-bedroom, ${feeRange(1)} for a two-bedroom and ${feeRange(2)} for a three-bedroom.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Grande Shores is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at Grande Shores?", toc: "Owning here", id: "owning", html: () =>
      h.p(`The resort lists one-bedroom condos on the 7th floor with a fenced patio that opens to the 7th-floor pool deck. It also lists three-bedroom condos at pool level with patio access. Which unit is which type, we check for you.`) +
      h.p(`The resort lists an indoor pool, an indoor kiddie pool and an indoor hot tub. Outside it lists two pools, two lazy rivers and four hot tubs. The indoor pools and the 7th-floor hot tubs are heated all year.`) +
      h.p(`There is also a poolside bar, a cafe and a fitness center on the 6th floor, open from 6 a.m. to 10 p.m.`) +
      h.h3("The units, by size") +
      h.p(`The resort lists one-bedroom condos of 500 to 510 square feet with a kitchenette, a two-bedroom of 825 square feet and three-bedrooms of 990 to 1,377 square feet. The two- and three-bedrooms have a full kitchen and a washer and dryer in the unit. The resort says individual units may vary. The listed one-bedrooms are 550 square feet, larger than the resort's 500 to 510 type, so ask which type a listing is.`) +
      h.p(`Condo doors are numbered on floors 3 to 12, and ${UPF["7"]} of them are on the 7th floor, the floor with the pool deck.`) +
      PHOTO +
      h.h3("Where it is and how old it is") +
      h.p(`Grande Shores is in the north end of Myrtle Beach. In straight lines it is about ${Math.round(MI("Broadway at the Beach"))} miles to Broadway at the Beach, about ${Math.round(MI("Myrtle Beach Boardwalk"))} miles to the Boardwalk and about ${Math.round(MI("Myrtle Beach International Airport"))} miles to the airport.`) +
      h.p(`The building opened as a Ramada Inn in 1974. The resort has been Grande Shores since March 2001, and the listings give the year built as 2000 or 2001.`) +
      STRIP_NEAR },

    { h2: "What are the HOA fees at Grande Shores?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`At Grande Shores the HOA fee rises with the size of the unit, and units of the same size list nearly the same fee.`) +
      FEE_TABLE +
      h.p(`${FG.hoa_includes_water_sewer} of the ${L.api_total} listings say the fee pays water and sewer, trash, internet, pest control and the building's insurance. The same ${FG.hoa_includes_electric} say it pays the electric bill.`) +
      h.p(`That is why the fee is higher than at buildings that leave the power to you. One-bedrooms at the Palace Resort list about ${PALACE_1BR} a month, and none of its listings says the fee pays the power. Compare the yearly total, not the fee alone. Our page on the ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} has its numbers.`) +
      STRIP_BEDS +
      h.h3("What does the county charge in tax?") +
      h.p(`The county's values today imply about ${r100(TX.implied_tax_city_millage.median)} a year in tax in the middle, for the ${TX.units_at_6pct} units taxed at the rental rate. The middle half runs ${r100(TX.implied_tax_city_millage.p25)} to ${r100(TX.implied_tax_city_millage.p75)}, before credits and fees.`) +
      h.p(`A sale usually resets the value to about the price. The table shows the tax a buyer should plan on at today's middle asking prices. It is 6 percent of the price at the City of Myrtle Beach rate, before any credit.`) +
      h.p(`${C.taxed_as_home_4pct} of the ${CONDOS} condos are taxed as the owner's home, at a lower rate. Our ${h.a("/buyers/property-taxes/", "property tax page")} explains it.`) +
      h.h3("What a year costs before any loan") +
      h.p(`The last row adds a year of fees and tax. It leaves out the loan and your unit's own insurance, and the power is in the fee.`) +
      h.table(["Each year", "One-bedroom", "Two-bedroom"], [
        ["HOA fees", yearRange(0), yearRange(1)],
        ["Property tax as a rental, before any credit", r50(TAXASK[0]), r50(TAXASK[1])],
        ["<strong>About</strong>", `<strong>${r100(HOLD_LO[0])} to ${r100(HOLD_HI[0])}</strong>`, `<strong>${r100(HOLD_LO[1])} to ${r100(HOLD_HI[1])}</strong>`],
      ]) +
      h.p(`You also need your own policy on the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.cta("Know Grande Shores' fees before you offer", "We ask for the association's budget, its reserve study and any planned assessment, and add up the unit's dues, transfer fee and any dues held at closing.", "Have us get Grande Shores' budget", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at Grande Shores?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes. The lot is in a City of Myrtle Beach zoning district where nightly rentals are allowed, and the resort rents units by the night. ${FG.str_allowed} of the ${L.api_total} listings say short-term rentals are allowed, and all ${FG.vacation_rental_program} say the unit is in a rental program. A nightly rental needs the city license.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's operator</strong>The resort's operator, Myrtle Beach Seaside Resorts, offers owners rental management. Its owner page lists marketing, housekeeping, maintenance and monthly income statements.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`The operator does not publish its share of the rent, so we get its terms for any unit you consider. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways. What Myrtle Beach units earn is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for Grande Shores alone.`) +
      h.p(`In our agents' experience, a building with a rental program is run for renting. Buyers pay a transfer fee and often a few months of dues up front, which is common in any HOA.`) +
      h.h3("The resort's rules for guests") +
      h.p(`Guests in a condo must be 23 or older unless a parent or guardian is with them. Guests may not bring pets, but service animals are welcome. A one-bedroom gets 1 parking pass, and a two- or three-bedroom gets 2.`) +
      h.p(`An owner's own rules on pets and cars are in the condo's founding documents and rules. We read them before you offer.`) },

    { h2: "What have Grande Shores condos sold for?", toc: "Sales", id: "sales", html: (bg) =>
      h.p(`${SW.all.n} Grande Shores condos sold in the past year by Horry County's recorded deeds. That is about 1 in ${ONE_IN} of the ${CONDOS} condos changing hands in a year.`) +
      h.table(["Grande Shores condos", "Price"], [
        ["Middle sale price, past year", `About ${r1k(SW.all.median)}`],
        ["Middle half of the sales", `About ${money(SW.all.p25)} to ${r500(SW.all.p75)}`],
        ["Lowest to highest sale", `${money(SW.all.min)} to ${money(SW.all.max)}`],
        [`Middle asking price, ${L.api_total} for sale on ${RUN_SHORT}`, `About ${r1k(A.all.median)}`],
      ]) +
      SALES_CHART() +
      h.p(`${SW.all.n} sales is a small count, so we draw no trend from it. Asking prices ran above what units sold for.`) +
      h.p(`The deeds do not record bedrooms, so we compare a unit with sales of its own size. We price an offer from the recorded sales.`) +
      STRIP_CHEAP +
      h.p(`Thinking of selling a Grande Shores unit? ${h.a("/contact/", "Have us price it from these sales")}. An agent reads them, and no automated value is used.`) },

    { h2: "What we check before you buy at Grande Shores", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>FEMA's map shades most of the lot in its moderate flood zone, and the rest has no mapped zone. No part is in a high-risk zone. We still read the building's policy for its flood cover.</li>`
        + `<li><strong>Reserves and assessments</strong>The building is from 1974. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Which unit type</strong>The resort lists a two-room suite of 894 square feet beside its 825-square-foot two-bedroom. The two-bedroom listings are 893 square feet. Ask which type a listing is.</li>`
        + `</ul>` +
      h.h3("If you will use a loan") +
      `<ul class="c3-pr-list"><li><strong>The hotel rule</strong>Many standard loans will not cover a unit in a building run like a hotel. Grande Shores has hotel rooms, and all ${FG.vacation_rental_program} listed units are in a rental program.</li><li><strong>FHA</strong>It is not on HUD's list of FHA-approved condos for Horry County that we read in November.</li><li><strong>Size</strong>Every unit for sale is 550 square feet or larger.</li></ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Grande Shores unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.cta("Have the loan checked before you offer", "We take the unit you like to our affiliated lender and ask whether it fits their loans, before you spend on an offer.", "Have our affiliated lender, BrickWood Mortgage, a separate company, look at the unit", "/contact/", bg) +
      h.h3("Other buildings") +
      h.p(`To weigh Grande Shores against other buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about 2 miles) and ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} (about 3 miles). Farther north: ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 6 miles) and ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} (about 9 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/caravelle-resort/", "Caravelle Resort")} (about 1 mile) and ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 2 miles). Farther south: ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (about 4 miles) and ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (about 4 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Grande Shores Myrtle Beach FAQ",
  faq: [
    { q: "When was Grande Shores built?", a: "Grande Shores opened as a Ramada Inn in 1974. The resort name changed to Grande Shores in March 2001." },
    { q: "Is Grande Shores a hotel or condos?", a: `Both. The condos are owned one by one, ${CONDOS} of them. The hotel rooms are one block of property that the county lists as a single hotel parcel.` },
    { q: "What is the address of Grande Shores?", a: "Grande Shores is at 201 77th Ave N, Myrtle Beach, SC 29572, near the north end of the city's oceanfront. The resort's own site lists the same address." },
    { q: "Is Grande Shores in North Myrtle Beach?", a: "No. It is in the City of Myrtle Beach, near the north end of the city's oceanfront." },
    { q: "Is Grande Shores pet friendly?", a: "Guests may not bring pets, but service animals are welcome. An owner's own pet rules are in the condo's founding documents, and we read them before you offer." },
    { q: "Is there parking at Grande Shores?", a: "Yes, in a garage. A one-bedroom gets 1 parking pass and a two- or three-bedroom gets 2. The garage clearance is 6 feet 10 inches." },
    { q: "How many Grande Shores condos are for sale?", a: `On ${RUN}, ${L.api_total} Grande Shores condos were for sale: ${L.beds["1"]} one-bedrooms, ${L.beds["2"]} two-bedrooms and ${L.beds["3"]} three-bedrooms.` },
    { q: "How old do you have to be to book at Grande Shores?", a: "Guests in a condo must be 23 or older unless a parent or guardian is with them. The resort takes bookings on its own website." },
  ],
  sources: [
    { name: "Grande Shores", href: RESORT },
    { name: "about the resort", href: ABOUT },
    { name: "rooms", href: ROOMS },
    { name: "guest FAQ", href: FAQPAGE },
    { name: "owner services", href: OWNERS },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "Fannie Mae", href: FANNIE },
    { name: "HUD condo list", href: HUD },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels, assessments and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing; distances in straight lines from OpenStreetMap.`,
  afterSources: () => CREDITS + PH.imageSchema([BEACH]) + PLACE_LD,
  bottomCta: {
    h2: "Ask us about a Grande Shores unit.",
    p: "Tell us the size and the fee you can live with. We read the unit's budget and the resort's rules before you offer.",
    label: "Ask about a Grande Shores unit", href: "/contact/",
  },
  keywords: "Grande Shores Myrtle Beach condos for sale, Grande Shores ocean resort condos for sale, Grande Shores HOA fees, Grande Shores Myrtle Beach rentals, 201 77th Ave N Myrtle Beach, when was Grande Shores built",
  about: "Grande Shores, an oceanfront resort with 136 condos at 201 77th Ave N, Myrtle Beach, South Carolina",
});
