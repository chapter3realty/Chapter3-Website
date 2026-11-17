/* /invest/condo-buildings/landmark-resort/ - Landmark Resort, 1501 S Ocean Blvd, Myrtle Beach: what owning a
 * condo there gives you, the HOA fee by unit size and what it pays, renting it by the night (the resort's own
 * program), what units sold for (the two buildings sell about $46,000 apart), and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. Built from the Palace pilot (specs/palace-resort.js).
 * Facts: Blog-Brain batches/2026-11-e/landmark-resort/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md). Plan: PLAN.md. Data: data/2026-11-e/landmark-resort/ (listings.json,
 * county.json, phases.json, flood.json, tax.json; README.md has the rerun order). Every count, fee, price,
 * share and chart value is read from those files and checked against its ledger row with must(); a changed file
 * stops the build until a person reads the row again.
 * Picture: one USDA NAIP aerial (public domain), labelled from coordinates (data/.../images/label.py).
 * Homes: four live strips (G.homesQ), none with an address, a price or an MLS number from us.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/landmark-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "landmark-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), PHS = read("phases.json"), TX = read("tax.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`landmark-resort.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 4: 570 condos (339 + 231) plus 1 commercial parcel; the most of the 47 buildings in the directory. */
must(C.units === 571 && C.landuse_first_digit["1xx"] === 570 && C.landuse_first_digit["3xx"] === 1, "row 4 changed");
const CONDOS = C.landuse_first_digit["1xx"], PARCELS = C.units;
/* Row 5: unit numbers on floors 2 to 12 and 14 to 15, none on 13. */
const FLR = C.floors;
must(FLR.top === 15 && FLR.missing_between.join() === "13", "row 5 floors changed");
/* Row 6: the listings' year built, 1973 and 1996. */
must(L.year_built["1973"] === 43 && L.year_built["1996"] === 39, "row 6 changed");
/* Row 15: for sale now, by size. */
const A = L.asking;
must(L.at_1501 === 88 && L.beds["0"] === 50 && L.beds["1"] === 38, "row 15 counts changed");
must(A["0"].sqft_median === 360 && A["1"].sqft_median === 550, "row 15 sizes changed");
/* Row 16: asking prices. */
must(A.all.median === 105000 && A["0"].median === 86400 && A["1"].median === 125000, "row 16 changed");
/* Row 17: the monthly fee by size, to the dollar; the middle bracket. */
const FX = L.fee_exact, FB = L.fee;
must(FX["0"].n === 50 && FX["0"].lowest === 390 && FX["0"].highest === 981, "row 17 studio fee changed");
must(FX["1"].n === 38 && FX["1"].lowest === 812 && FX["1"].highest === 1135, "row 17 one-bedroom fee changed");
must(FB["0"].median_at_or_under === 625 && FB["1"].median_at_or_under === 975, "row 17 middle fee changed");
const FEE_MID = [FB["0"].median_at_or_under, FB["1"].median_at_or_under];
const FEE_YEAR = FEE_MID.map((f) => f * 12);
must(r100(FEE_YEAR[0]) === "$7,500" && r100(FEE_YEAR[1]) === "$11,700", "row 17 year changed");
/* Row 18: what the fee pays, by the listings' own flags (of 88). */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 84 && FG.hoa_includes_trash === 83 && FG.hoa_includes_insurance === 84 && FG.hoa_includes_electric === 76 && FG.hoa_includes_internet === 79 && FG.hoa_includes_cable === 37, "row 18 changed");
/* Rows 19, 20, 21: rentals, views, pets. */
must(FG.str_allowed === 79 && FG.vacation_rental_program === 78, "row 19 changed");
must(FG.oceanfront_unit === 37 && FG.ocean_view === 71 && FG.furnished === 88, "row 20 changed");
must(FG.pets_allowed === 39, "row 21 changed");
/* Row 23: recorded deeds, the directory's window. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30", "row 23 window changed");
must(SW.all.n === 55 && SW.all.median === 100000 && SW.all.p25 === 73500 && SW.all.p75 === 120000, "row 23 changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
const ONE_IN = Math.round(CONDOS / SW.all.n);
must(ONE_IN === 10, "row 23 share changed");
/* Row 24: by phase. */
const P1 = PHS.phase_I, P2 = PHS.phase_II;
must(P1.n === 28 && P1.median === 119950 && P1.p25 === 107750 && P1.p75 === 128000, "row 24 phase I changed");
must(P2.n === 27 && P2.median === 73500 && P2.p25 === 65000 && P2.p75 === 90000, "row 24 phase II changed");
must(r1k(P1.median - P2.median) === "$46,000", "row 24 gap changed");
/* Row 28: taxed as an owner's home. */
must(C.taxed_as_home_4pct === 20 && TX.units_at_6pct === 550, "row 28 changed");
/* Row 29: tax at the 6 percent rate and 254.6 mills, the middle unit. */
const TAXM = TX.implied_tax_city_millage;
must(TAXM.median === 1495 && TAXM.p25 === 1130 && TAXM.p75 === 2004, "row 29 changed");
const HOLD = FEE_YEAR.map((f) => f + TAXM.median);
must(r100(HOLD[0]) === "$9,000" && r100(HOLD[1]) === "$13,200" && r100(TAXM.median) === "$1,500", "row 29 totals changed");
/* Row 30: the county's last deed. */
const LS = C.last_sale_year;
const RECENT = ["2021", "2022", "2023", "2024", "2025", "2026"].reduce((s, y) => s + LS[y], 0);
must(RECENT === 364, "row 30 changed");
/* Row 32 (CORRECTED wording): flood zones under the lot. */
const zone = (z, bfe) => FL.zones_touching.filter((x) => x.attributes.FLD_ZONE === z && (bfe === undefined || x.attributes.STATIC_BFE === bfe));
const AE = zone("AE").reduce((s, x) => s + x.share_of_footprint, 0);
must(zone("AE").length === 2 && Math.round(AE * 100) === 37, "row 32 AE changed");
must(zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD")[0].share_of_footprint === 0.229 && FL.share_in_no_zone === 0.402, "row 32 other zones changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;

/* Page styles, scoped to main#main (the Palace pilot's design). */
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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/landmark-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 15 to 17). Two sizes only: the listings cannot be split further. */

const SIZES = [{ name: "Studio", k: "0" }, { name: "One-bedroom", k: "1" }];
const FEE_TABLE = compareCards(SIZES.map((s, i) => ({
  name: s.name,
  bestFor: `About ${A[s.k].sqft_median} sq ft in the middle`,
  cells: { fee: `${money(FX[s.k].lowest)} to ${money(FX[s.k].highest)}`, mid: `About ${r5(FEE_MID[i])}`, ask: `About ${r1k(A[s.k].median)}`, sale: `${L.beds[s.k]}` },
})), [
  { key: "fee", label: "HOA fee a month, lowest to highest", num: true },
  { key: "mid", label: "Middle fee a month", num: true },
  { key: "ask", label: "Middle asking price", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At Landmark, the fee goes by the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* The sales chart (row 24): one message, two bars. */
const SALES = G.bars([
  { name: `Phase I (${P1.n} sales)`, value: P1.median, valueText: `About ${r1k(P1.median)}` },
  { name: `Phase II (${P2.n} sales)`, value: P2.median, valueText: `About ${r1k(P2.median)}` },
], {
  caption: "The two Landmark buildings sell about $46,000 apart",
  nameLabel: "Building", valueLabel: "Middle sale price", compact: true, max: Math.round(P1.median * 1.4),
  note: `Recorded deeds, ${PERIOD}. Half of Phase I sales fell between ${r500(P1.p25)} and ${r500(P1.p75)}; half of Phase II sales between ${r500(P2.p25)} and ${r500(P2.p75)}. Phase I and Phase II are the two sets of condos in the county's records.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.landmarkresort.com/";
const WATERPARK = "https://www.landmarkresort.com/waterpark/";
const AMENITIES = "https://www.landmarkresort.com/amenities/";
const INFO = "https://www.landmarkresort.com/info/";
const FAQPAGE = "https://www.landmarkresort.com/faqs/";
const PROGRAM = "https://www.landmarkresort.com/rental-management/";
const ROOMS = "https://www.landmarkresort.com/accommodations/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Landmark Resort", alternateName: ["Landmark Resort Phase II", "Landmark Resort Myrtle Beach"],
  description: `An oceanfront resort with ${CONDOS} condos in two buildings on the south end of Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "1501 S Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Round 2 (owner, 2026-11-14): live strips, no "send me" offer. Each search was checked on the live site (3 or more homes). */
const C0 = FL.footprint_center;
const STRIP = G.homesQScript() + G.homesQ("subdivision=Landmark", "Own a condo at Landmark Resort, on the ocean in Myrtle Beach");
const STRIP_OCEAN = G.homesQ("subdivision=Landmark&has=oceanfront_unit", "Oceanfront units at Landmark Resort, steps from the sand");
const STRIP_RENT = G.homesQ("subdivision=Landmark&has=vacation_rental_program", "Landmark condos already in the resort's rental program");
const STRIP_NEAR = G.homesQ(`type=condo&has=oceanfront_building&near=${C0[0].toFixed(4)},${C0[1].toFixed(4)}&miles=1`, "More oceanfront condos within a mile of Landmark");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Landmark Resort Myrtle Beach Condos for Sale: Fees From ${r5(FX["0"].lowest)}`,
  description: `Landmark Resort, 1501 S Ocean Blvd, Myrtle Beach: HOA fees by unit size, what they pay, nightly rentals, the indoor lazy river and what ${SW.all.n} units sold for.`,
  ogTitle: "Landmark Resort, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "Landmark Resort",
  eyebrow: "Landmark Resort, Myrtle Beach",
  h1: "Landmark Resort, Myrtle Beach: condos for sale at the resort with the 300-foot indoor lazy river.",
  h1em: `${CONDOS} condos on the south end, two buildings, one water park.`,
  sub: `Studios and one-bedrooms at 1501 S Ocean Blvd, with fees by size and recorded sales.`,
  heroMedia: glance([
    { icon: "home", label: "Condos", text: `${CONDOS}` },
    { icon: "beach", label: "On the beach", text: "1501 S Ocean Blvd" },
    { icon: "pool", label: "Indoor lazy river", text: "300 feet" },
    { icon: "key", label: "Nightly rentals", text: "Allowed" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Landmark Resort is an oceanfront resort on the south end of Myrtle Beach with ${CONDOS} condos in two buildings. That is more than any other of the 47 oceanfront buildings in our directory. The condos for sale now are studios and one-bedrooms, asking about ${r1k(A.all.median)} in the middle.`,
    `The monthly HOA fee is ${money(FX["0"].lowest)} to ${money(FX["1"].highest)}, and it pays water, trash and insurance in most listings. In the past year ${SW.all.n} units sold for about ${r1k(SW.all.median)} in the middle, Phase I at about ${r1k(P1.median)} and Phase II at about ${r1k(P2.median)}.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + PHOTO + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Landmark is one of 47 buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at Landmark Resort?", toc: "Owning here", id: "owning", html: () =>
      h.p(`Landmark has a heated indoor lazy river, 300 feet long. The resort says it is open year-round, along with the heated indoor pool and five indoor whirlpools.`) +
      h.p(`Across Ocean Boulevard is H2OASIS, the resort's water park. It has three slides, each 40 feet tall, at 250, 240 and 238 feet long. The resort values the park at over $3 million.`) +
      h.p(`The resort says the water park is exclusive to guests who stay through its on-site rental program. The park is seasonal.`) +
      h.p(`On the beach side, the oceanfront pool and whirlpool have beach access straight off the pool deck. The lobby has a Starbucks coffee bar, and a pool bar and snack bar open in season.`) +
      h.h3("Where it sits") +
      h.p(`Family Kingdom is about 0.8 mile north of Landmark, and Springmaid Pier is about 1.5 miles south, in a straight line. The Palace is next door: its tower stands about 0.07 mile away, center to center. Our ${h.a("/invest/condo-buildings/palace-resort/", "page on the Palace Resort")} covers it.`) +
      h.p(`The resort calls its enclosed walkway over Ocean Boulevard the only enclosed crosswalk in Myrtle Beach. It leads to the parking garage and the water park across the street.`) +
      h.h3(`Two buildings, ${CONDOS} condos`) +
      h.p(`The county records two sets of condos, Phase I and Phase II. The MLS calls them Landmark Resort and Landmark Resort Phase II. Unit numbers run up to floor 15, and no floor is numbered 13.`) +
      h.p(`All ${L.at_1501} condos for sale at 1501 S Ocean Blvd on ${RUN} came furnished. ${FG.ocean_view} were listed with an ocean view, and ${FG.oceanfront_unit} of those as oceanfront units.`) +
      STRIP_OCEAN },

    { h2: "What are the HOA fees at Landmark Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`At Landmark, studios list fees from ${money(FX["0"].lowest)} to ${money(FX["0"].highest)} a month and one-bedrooms from ${money(FX["1"].lowest)} to ${money(FX["1"].highest)}. The middle studio fee is about ${r5(FEE_MID[0])}; the middle one-bedroom fee is about ${r5(FEE_MID[1])}.`) +
      FEE_TABLE +
      h.p(`The ranges overlap, so size alone does not set the fee. The listings do not say why one studio costs $390 and another $981. We ask which building and unit type a fee belongs to before you compare.`) +
      h.p(`Most listings say the fee covers water and sewer (${FG.hoa_includes_water_sewer} of ${L.at_1501}), trash (${FG.hoa_includes_trash}), the building's insurance (${FG.hoa_includes_insurance}), internet (${FG.hoa_includes_internet}) and electric (${FG.hoa_includes_electric}). Cable is on ${FG.hoa_includes_cable}. A box not ticked does not mean no, so we confirm each one.`) +
      h.p(`You also need your own policy on the inside of the unit; our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("What a year costs before any loan") +
      h.table(["Each year, at the middle fee", "Studio", "One-bedroom"], [
        ["HOA fees", r100(FEE_YEAR[0]), r100(FEE_YEAR[1])],
        ["Property tax as a rental, for the middle unit here", r100(TAXM.median), r100(TAXM.median)],
        ["<strong>About</strong>", `<strong>${r100(HOLD[0])}</strong>`, `<strong>${r100(HOLD[1])}</strong>`],
      ]) +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value. At the city's 2026 rate, half the Landmark units pay between ${r100(TAXM.p25)} and ${r100(TAXM.p75)} a year, an estimate before any credit or fee on the bill. The table uses one figure, for the middle unit, in both columns.`) +
      h.h3("What a sale can change") +
      h.p(`A sale can raise a bill, because the county taxes more than half of these units below their market value.`) +
      h.p(`Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in. Power is extra for the ${L.at_1501 - FG.hoa_includes_electric} listings whose fee does not pay it.`) +
      h.cta("Know Landmark's fees before you offer", "We ask the association for the unit's dues, its budget, its reserve study and any assessment, and add them up for you.", "Have us get Landmark's budget and reserve study", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at Landmark Resort?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes. Landmark is in a City of Myrtle Beach zoning district where nightly rentals are allowed, and the resort itself rents units by the night. ${FG.str_allowed} of the ${L.at_1501} condos for sale on ${RUN_MD} said nightly rentals are allowed, and ${FG.vacation_rental_program} were in a rental program.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's own program</strong>Landmark Resort LLC runs the on-site rental program, part of the Vacation Myrtle Beach group. The resort lists a 24-hour front desk, a rental program specialist, monthly statements and group sales. Owners' guests get the water park and five more amenities.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`The program does not publish its share of the rent or its fees, so we get its terms for any unit you consider. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`What studios and one-bedrooms earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for Landmark alone.`) +
      STRIP_RENT +
      h.h3("The resort's rules for guests") +
      h.p(`The resort takes no pets, allows no grilling anywhere on the property, and charges guests $12 a night per vehicle for parking in the garage across the street. The garage clears 8 feet 10 inches on the first level and 7 feet 10 inches above. ${FG.pets_allowed} of the ${L.at_1501} listings say pets are allowed.`) +
      h.p(`An owner's own rules on pets, cars and rentals are in the condo's founding documents. We read them before you offer.`) },

    { h2: "What have Landmark Resort condos sold for?", toc: "Sales", id: "sales", html: (bg) =>
      h.p(`${SW.all.n} Landmark condos sold in the past year by Horry County's deed records, about 1 in ${ONE_IN} units. The middle sale price was about ${r1k(SW.all.median)}. Half the sales fell between ${r500(SW.all.p25)} and ${r500(SW.all.p75)}.`) +
      SALES +
      h.h3("Why the two buildings differ") +
      h.p(`The deeds do not say why the two buildings sell apart. It may be size, view or age, and we will not guess. We ask before any offer.`) +
      h.h3("Asking prices against sales") +
      h.p(`Asking prices are near ${r1k(A.all.median)} in the middle for the ${L.at_1501} condos for sale on ${RUN_SHORT}, against about ${r1k(SW.all.median)} in sales. We price an offer from the recorded sales, never from the asking price.`) +
      h.p(`The county's last deed on ${RECENT} of ${PARCELS} units is dated 2021 or later. Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) +
      h.cta("Thinking of selling at Landmark?", "An agent reviews the recorded sales of your building and unit type and tells you what the units have sold for.", "Have us price a Landmark unit from these sales", "/contact/", bg) },

    { h2: "What we check before you buy at Landmark", toc: "Our checks", id: "checks", html: () =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>About ${Math.round(AE * 100)} percent of the lot is in FEMA's high-risk flood zone. About ${Math.round(zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD")[0].share_of_footprint * 100)} percent is in the moderate zone and about ${Math.round(FL.share_in_no_zone * 100)} percent in the minimal-hazard zone. That is a share of the lot, not of one unit. We read the building's flood cover and ask for a survey that shows how high the floor sits.</li>`
        + `<li><strong>The buildings' age</strong>The listings say built in 1973 and 1996. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Who uses the units</strong>Only ${C.taxed_as_home_4pct} of ${CONDOS} units are taxed as an owner's home. The rest pay the higher rate for second homes and rentals.</li>`
        + `<li><strong>If you will use a loan</strong>Many standard loans will not cover a unit in a building run like a hotel. Landmark has a front desk and a rental program, so ask a lender before you choose a unit.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Landmark unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} and ${h.a("/invest/non-warrantable-condos/", "non-warrantable condos page")} have more.`) +
      STRIP_NEAR +
      h.p(`To weigh Landmark against the other 46 buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/sea-mist-resort/", "Sea Mist Resort")} (under half a mile) and ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 1 mile). Farther north: ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (about 3 miles) and ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (about 3 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (under half a mile) and ${h.a("/invest/condo-buildings/grand-atlantic/", "Grand Atlantic")} (under half a mile). Farther south: ${h.a("/invest/condo-buildings/paradise-resort/", "Paradise Resort")} (under half a mile) and ${h.a("/invest/condo-buildings/holiday-sands-south/", "Holiday Sands South")} (about 1 mile).`) /* end sibling-links */ },
  ],
  faqTitle: "Landmark Resort Myrtle Beach FAQ",
  faq: [
    { q: "Is Landmark Resort condos or a hotel?", a: `Both. Its ${CONDOS} condos are owned one by one, and the resort's on-site rental program rents many of them to guests by the night.` },
    { q: "How many condos are at Landmark Resort?", a: `The county records ${CONDOS} condos in two buildings, Phase I and Phase II.` },
    { q: "When was Landmark Resort built?", a: "The listings say 1973 and 1996. We have no second source, so we read the association's records before you offer." },
    { q: "Is the water park free at Landmark Resort?", a: "The resort says the water park is exclusive to guests who stay through its on-site rental program. The park is seasonal. Ask the resort what a guest pays." },
    { q: "Is Landmark Resort pet friendly?", a: "The resort says it is not equipped to take pets for guests. An owner's own pet rules are in the condo's founding documents, and we read them before you offer." },
    { q: "Is there parking at Landmark Resort?", a: "Yes, in a garage across Ocean Boulevard, reached by an enclosed walkway. The resort charges guests $12 a night per vehicle." },
    { q: "What is the address of Landmark Resort?", a: "Landmark Resort is at 1501 S Ocean Blvd, Myrtle Beach, SC 29577, on the south end of the city's oceanfront." },
    { q: "How many Landmark Resort condos are for sale?", a: `On ${RUN}, ${L.at_1501} Landmark condos at 1501 S Ocean Blvd were for sale: ${L.beds["0"]} studios and ${L.beds["1"]} one-bedrooms.` },
  ],
  sources: [
    { name: "Landmark Resort", href: RESORT },
    { name: "water park", href: WATERPARK },
    { name: "amenities", href: AMENITIES },
    { name: "resort information", href: INFO },
    { name: "guest FAQ", href: FAQPAGE },
    { name: "rental program", href: PROGRAM },
    { name: "rooms", href: ROOMS },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Landmark.",
    p: "Tell us the size you want and the days you are here. An agent shows you the Landmark units for sale in that size.",
    label: "Book a showing at Landmark", href: "/contact/",
  },
  keywords: "Landmark Resort Myrtle Beach condos for sale, Landmark Myrtle Beach for sale, Landmark Resort Myrtle Beach HOA fees, Landmark Resort Myrtle Beach Airbnb, Landmark Resort units for sale, 1501 S Ocean Blvd Myrtle Beach, Landmark Resort water park, when was Landmark Resort built",
  about: "Landmark Resort, an oceanfront resort with 570 condos at 1501 S Ocean Blvd, Myrtle Beach, South Carolina",
});
