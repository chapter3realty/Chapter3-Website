/* /invest/condo-buildings/ocean-forest-villas/ - Ocean Forest Villas, 5601 N Ocean Blvd, Myrtle Beach: what a
 * two-bedroom costs to own there, the HOA fee (it falls in two groups), what the county taxes, what units sold
 * for, nightly rentals, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-15. Follows specs/palace-resort.js and specs/sea-mist-resort.js.
 * Facts: Blog-Brain batches/2026-11-e/ocean-forest-villas/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md; struck wording in batches/2026-11-e/facts/
 * invest-condo-buildings-ocean-forest-villas-struck.json). Row 26 stays UNVERIFIED: no program terms are described.
 * Data: data/2026-11-e/ocean-forest-villas/ (listings.json, county.json, tax.json, fema.json, zoning.json,
 * by_building.json, nearby.json, strips.json, photos.json). Every count, fee, price and share is read from
 * those files here and checked against its ledger row with must(); a changed file stops the build.
 * Picture: one USDA NAIP aerial (public domain), the five buildings lettered from coordinates
 * (data/2026-11-e/ocean-forest-villas/images/label.py; record in photos.json), until the photo partner's shots arrive.
 * Strips: four live strips (G.homesQ), no "send me" offer. Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/ocean-forest-villas/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "ocean-forest-villas");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), T = read("tax.json"), FE = read("fema.json"), Z = read("zoning.json"),
  BY = read("by_building.json"), NB = read("nearby.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`ocean-forest-villas.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/* Row 7: the listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
/* Rows 1, 7, 8, 9: 17 condos for sale, all two-bedroom, $249,000 to $404,999, middle $325,000, 850 to 900 sq ft. */
const FOR_SALE = L.api_total;
const A = L.asking["2"];
must(FOR_SALE === 17 && L.beds["2"] === 17 && L.at_1605 === 17, "row 7 counts changed");
must(A.n === 17 && A.median === 325000 && A.min === 249000 && A.max === 404999, "row 8 changed");
must(A.sqft_range.join() === "850,900" && A.sqft_median === 872, "row 9 changed");
/* Row 3: built about 1980. */
must(L.year_built["1980"] === 17, "row 3 changed");
/* Row 2: five buildings, about 240 condos (241 in the county's records; building C shows 43 of 48). */
must(C.units === 241 && C.units_per_building.A === 54 && C.units_per_building.C === 43 && Object.keys(C.units_per_building).length === 5, "row 2 changed");
/* Rows 10 and 11: the fee, $450 to $749, in two groups: 12 at $450 to $475 and 5 at $741 to $749, none between. */
const FX = L.fee_exact["2"];
must(FX.n === 17 && FX.lowest === 450 && FX.highest === 749, "row 10 changed");
const BK = {};
for (const b of Object.values(BY.buildings)) for (const [k, v] of Object.entries(b.fee_bracket_counts)) BK[k] = (BK[k] || 0) + v;
must(Object.keys(BK).sort().join() === "450,475,749" && BK["450"] + BK["475"] === 12 && BK["749"] === 5, "row 11 fee groups changed shape; read the row again");
const LOW_GROUP = BK["450"] + BK["475"], HIGH_GROUP = BK["749"];
/* The two groups' edges ($475 and $741) were read to the dollar by bisection (VERIFY.md); typed. */
const LOW_TO = 475, HIGH_FROM = 741;
/* Rows 12 and 13: what the listings say, and what the fee pays. */
const FG = L.flags;
must(FG.str_allowed === 14 && FG.vacation_rental_program === 12 && FG.pets_allowed === 14 && FG.ocean_view === 14 && FG.oceanfront_unit === 2 && FG.oceanfront_building === 5 && FG.furnished === 17 && FG.balcony === 13, "row 12 changed");
must(FG.hoa_includes_trash === 14 && FG.hoa_includes_internet === 11 && FG.hoa_includes_cable === 11 && FG.hoa_includes_water_sewer === 7 && FG.hoa_includes_electric === 0, "row 13 changed");
/* Row 14: county values and who gets the tax bill. */
const VG = Object.fromEntries(C.county_market_value_groups);
must(VG["324000"] === 162 && VG["370000"] === 50 && C.taxed_as_home_4pct === 20 && C.owner_out_of_sc === 177, "row 14 changed");
const HOME_ONE_IN = Math.round(C.units / C.taxed_as_home_4pct);
must(HOME_ONE_IN === 12, "row 14 share changed");
/* Row 17 and 18: deeds in the year to 31 October 2026. */
const SW = C.sales;
must(SW.window === "2025-11-01 to 2026-10-31" && SW.all.n === 16 && SW.all.median === 280000 && SW.all.p25 === 268500 && SW.all.p75 === 313750 && SW.all.min === 250000 && SW.all.max === 345000, "row 17 changed");
must(SW.all.n >= 10, "fewer than 10 sales; show ranges in words");
must(A.median > SW.all.median, "asking is no longer above the sales middle; rewrite the sentences");
const ONE_IN_SALES = Math.round(C.units / SW.all.n);
must(ONE_IN_SALES === 15, "row 17 share changed");
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `year to ${MONTHS[+wm - 1]} 31, ${wy}`;
/* Rows 20 to 22: tax. The county's current bills, in aggregate, at the City of Myrtle Beach's 254.6 mills. */
const TX = T.implied_tax_city_millage, TG = T.by_county_value_group_n5_plus;
must(T.units_at_6pct === 221 && TX.median === 2635 && TG["324000"].implied_tax_median === 2373 && TG["324000"].n === 147 && TG["370000"].implied_tax_median === 2986 && TG["370000"].n === 48, "row 21 changed");
must(Math.round(T.taxable_below_market_share * 100) === 77, "row 20 changed");
const MILLS = 254.6;
const TAX_SALE = SW.all.median * 0.06 * MILLS / 1000;
must(Math.round(TAX_SALE) === 4277, "row 22 tax changed");
const FEE_YEAR_LOW = FX.lowest * 12, FEE_YEAR_HIGH = FX.highest * 12;
must(FEE_YEAR_LOW === 5400 && FEE_YEAR_HIGH === 8988, "row 22 fees changed");
/* Row 24: all five buildings in the city and in RMV. */
must(Object.values(Z.buildings).length === 5 && Object.values(Z.buildings).every((b) => b.zoning.join() === "RMV" && b.in_city_limits === true), "row 24 changed");
/* Row 25: FEMA, the footprint and the center point in zone X, minimal hazard. */
must(FE.center_point[0].FLD_ZONE === "X" && FE.center_point[0].ZONE_SUBTY === "AREA OF MINIMAL FLOOD HAZARD", "row 25 center point changed");
const XMIN = FE.zones.find((z) => z.attributes.FLD_ZONE === "X" && z.attributes.ZONE_SUBTY === "AREA OF MINIMAL FLOOD HAZARD");
must(XMIN.share_of_footprint === 1 && FE.zones.filter((z) => z !== XMIN).every((z) => z.share_of_footprint === 0), "row 25 footprint changed");
/* Row 16 (CORRECTED): straight-line miles. The state park is "about 8"; the Boardwalk is left out. */
const NP = NB.places;
must(NP["Broadway at the Beach"].miles === 2.8 && NP["Myrtle Beach International Airport"].miles === 6.4 && Math.round(NP["Myrtle Beach State Park"].miles) === 8, "row 16 changed");


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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/ocean-forest-villas-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* Two charts, each with one message.                                             */

const FEE_BARS = G.bars([
  { name: `${money(FX.lowest)} to ${money(LOW_TO)}`, value: LOW_GROUP, valueText: `${LOW_GROUP} listings` },
  { name: `${money(LOW_TO + 1)} to ${money(HIGH_FROM - 1)}`, value: 0, valueText: "None", reference: true },
  { name: `${money(HIGH_FROM)} to ${money(FX.highest)}`, value: HIGH_GROUP, valueText: `${HIGH_GROUP} listings` },
], {
  caption: "At Ocean Forest Villas, the monthly fee falls in two groups",
  nameLabel: "Monthly HOA fee", valueLabel: "Condos for sale", compact: true, max: FOR_SALE, format: (v) => `${v} listings`,
  note: `Condos for sale on ${RUN_MD}, ${FOR_SALE} in all. We do not yet know which units pay which fee, so ask for the budget of the unit you like.`,
});
const PRICE_BARS = G.bars([
  { name: `Sold, past year, ${SW.all.n} units`, feature: `${r1k(SW.all.min)} to ${r1k(SW.all.max)}`, value: SW.all.median, valueText: money(SW.all.median) },
  { name: `Asking now, ${FOR_SALE} units`, feature: `${r1k(A.min)} to ${r1k(A.max)}`, value: A.median, valueText: money(A.median) },
  { name: "County value, most units", value: 324000, valueText: money(324000), reference: true },
  { name: `County value, ${VG["370000"]} units`, value: 370000, valueText: money(370000), reference: true },
], {
  caption: "Asking prices run above what units sold for",
  nameLabel: "Measure", featureLabel: "range", valueLabel: "Middle price", compact: true, max: 400000,
  note: `The first two bars are middles, with their low to high range beside them. Recorded deeds in the ${PERIOD}, ${SW.all.n} sales; no single sale is shown. The county values are the assessor's market values, not prices paid.`,
});
must(VG["324000"] === 162, "county value bar changed");

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const WIKI = "https://en.wikipedia.org/wiki/Ocean_Forest_Hotel";
const LIVE5 = "https://www.live5news.com/2025/09/13/this-day-history-sept-13-1974-ocean-forest-hotel-destroyed-myrtle-beach/";
const RADIO = "https://www.southcarolinapublicradio.org/show/south-carolina-from-a-to-z/2020-09-25/o-is-for-ocean-forest-hotel";

/* The community as a place, for search (never Hotel or LodgingBusiness: we are not a resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Ocean Forest Villas", alternateName: ["Ocean Forest Villas Myrtle Beach"],
  description: "A community of five buildings of two-bedroom condos, built about 1980, on North Ocean Boulevard in Myrtle Beach, South Carolina.",
  address: { "@type": "PostalAddress", streetAddress: "5601 N Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: 33.729017, longitude: -78.83472 },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* ---------------------------------------------------------------------------- */
/* Strips (round 2, owner 2026-11-14): live homes, no "send me" offer. Each search checked on /homes/api/strip the build day
   (strips.json): 17, 4, 40 and 15 homes. */
const SJ = read("strips.json").strips;
const stripTotal = (q) => (SJ.find((s) => decodeURIComponent(s.q) === q) || {}).total;
const MID = "33.72902,-78.83472";
const Q1 = "subdivision=Ocean Forest Villas", Q2 = "subdivision=Ocean Forest Villas&max=300000",
  Q3 = `type=condo&near=${MID}&miles=0.5&has=oceanfront_unit`, Q4 = `type=condo&near=${MID}&miles=1&beds=2&max=300000`;
must(stripTotal(Q1) === 17 && stripTotal(Q2) >= 3 && stripTotal(Q3) >= 3 && stripTotal(Q4) >= 3, "a strip has fewer than 3 homes; read strips.json");
const STRIP = G.homesQScript() + G.homesQ(Q1, "Two-bedroom condos for sale at Ocean Forest Villas");
const STRIP_CHEAP = G.homesQ(Q2, "Ocean Forest Villas condos asking $300,000 or less");
const STRIP_OCEAN = G.homesQ(Q3, "Oceanfront condos within half a mile");
const STRIP_NEAR = G.homesQ(Q4, "Condos with 2 or more bedrooms within a mile, $300,000 or less");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: "Ocean Forest Villas Myrtle Beach Condos: Fees, Sales",
  description: `Ocean Forest Villas, 5601 N Ocean Blvd, Myrtle Beach: what ${FOR_SALE} condos ask, the HOA fee in two groups, what ${SW.all.n} units sold for, county tax and nightly rentals.`,
  ogTitle: "Ocean Forest Villas, Myrtle Beach: condos for sale, HOA fees in two groups, sales and tax",
  crumb: "Ocean Forest Villas",
  eyebrow: "Ocean Forest Villas, Myrtle Beach",
  h1: "Ocean Forest Villas, Myrtle Beach: two-bedroom condos with an HOA fee in two groups.",
  h1em: "Five buildings that stand where the Ocean Forest Hotel stood.",
  sub: `Ocean Forest Villas has about 240 two-bedroom condos. ${FOR_SALE} for sale asked ${r1k(A.min)} to ${r1k(A.max)} on ${RUN_MD}, with an HOA fee of ${money(FX.lowest)} to ${money(FX.highest)} a month.`,
  heroMedia: glance([
    { icon: "home", label: "Buildings", text: "Five, lettered A to E" },
    { icon: "key", label: "Condos", text: "About 240" },
    { icon: "pool", label: "Two bedrooms", text: `${A.sqft_median} sq ft` },
    { icon: "calendar", label: "Built", text: "About 1980" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Ocean Forest Villas is five buildings of two-bedroom condos, built about 1980, at 5601 N Ocean Blvd in Myrtle Beach. On ${RUN_MD}, ${FOR_SALE} were for sale, asking ${r1k(A.min)} to ${r1k(A.max)}.`,
    `${SW.all.n} sold in the past year, at a middle price of ${money(SW.all.median)}. The monthly HOA fee falls in two groups, a lower one and a higher one.`,
    `Staying here instead? Owners rent their units through the usual rental sites and managers. We do not book stays.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Looking at other buildings too? Compare them in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is Ocean Forest Villas in Myrtle Beach?", toc: "What it is", id: "owning", html: () =>
      h.p(`Ocean Forest Villas is five lettered buildings, A to E, in the Cabana section of North Ocean Blvd. The county lists about 240 condos. Every one for sale on ${RUN_MD} has two bedrooms.`) +
      h.p(`The buildings stand where the Ocean Forest Hotel stood until 1974. Raymond Hood designed that hotel, and it opened in 1930. It was demolished in 1974, and ${h.ext(WIKI, "Wikipedia")} places the villas on the site today.`) +
      PHOTO +
      h.p(`In the aerial, N Ocean Blvd and a strip of dunes lie between the buildings and the sand. Listings call the condos steps from the beach. Most say an ocean view, and ${FG.oceanfront_unit} say an oceanfront unit.`) +
      h.p(`About 3 in 4 listings say a balcony. Every one lists 1980 as the year built, so we say about 1980.`) +
      h.p(`Broadway at the Beach is about ${NP["Broadway at the Beach"].miles} miles away in a straight line, and the airport about ${NP["Myrtle Beach International Airport"].miles} miles.`) +
      h.p(`Want a unit on the sand instead? These condos are within half a mile and say an oceanfront unit.`) +
      STRIP_OCEAN },

    { h2: "What are the HOA fees at Ocean Forest Villas?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The HOA fee at Ocean Forest Villas is ${money(FX.lowest)} to ${money(FX.highest)} a month, in two groups. The lower group is ${money(FX.lowest)} to ${money(LOW_TO)}, and the higher is ${money(HIGH_FROM)} to ${money(FX.highest)}. None falls between.`) +
      FEE_BARS +
      h.p(`Most listings say the fee pays trash. About two thirds say internet and cable, fewer than half say water and sewer, and none says the electric bill. Agents fill in these fields and many leave them blank, so we ask the association for the written list.`) +
      h.p(`The fee does not cover the inside of your unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("What a year costs before any loan") +
      h.p(`A buyer should plan on the fee and the tax in this table, before power, the unit's own policy and any loan.`) +
      h.table(["Each year, per condo", "About"], [
        [`HOA fees at ${money(FX.lowest)} to ${money(FX.highest)} a month`, `${r100(FEE_YEAR_LOW)} to ${r100(FEE_YEAR_HIGH)}`],
        [`Property tax as a rental, at the middle sale price of ${money(SW.all.median)}`, r100(TAX_SALE)],
        ["<strong>Total</strong>", `<strong>${r100(Math.round(FEE_YEAR_LOW / 100) * 100 + Math.round(TAX_SALE / 100) * 100)} to ${r100(Math.round(FEE_YEAR_HIGH / 100) * 100 + Math.round(TAX_SALE / 100) * 100)}</strong>`],
      ]) +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value. The tax uses the City of Myrtle Beach's 2026 rate. It is our arithmetic for planning, not a bill. The tax line is the bill after a sale resets the value; today's bills are lower, see the county tax section below. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.cta("Know the budget before you offer", "We ask the association for the unit's budget, its reserve study and any planned assessment, and send them to you before you offer.", "Have us get the HOA budget", "/contact/", bg) },

    { h2: "What do Ocean Forest Villas condos sell for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} units sold in the ${PERIOD} by Horry County's deed records, at a middle price of ${money(SW.all.median)}. That is about 1 unit in ${ONE_IN_SALES} changing hands.`) +
      PRICE_BARS +
      h.p(`The middle ask today is ${money(A.median)}. Asking is not the price paid, so we price an offer from recorded sales. Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) +
      h.p(`The lowest asking prices at Ocean Forest Villas today:`) +
      STRIP_CHEAP },

    { h2: "What does the county tax an Ocean Forest Villas condo at?", toc: "Property tax", id: "taxes", html: () =>
      h.p(`The county's current bills are about ${r100(TX.median)} a year for a middle unit taxed at the second-home rate, before credits and fees.`) +
      h.table(["Units taxed at the second-home rate", "Units", "Middle yearly tax"], [
        [`County value ${money(324000)}`, `${TG["324000"].n}`, `About ${r100(TG["324000"].implied_tax_median)}`],
        [`County value ${money(370000)}`, `${TG["370000"].n}`, `About ${r100(TG["370000"].implied_tax_median)}`],
        ["<strong>All of them</strong>", `<strong>${T.units_at_6pct}</strong>`, `<strong>About ${r100(TX.median)}</strong>`],
      ]) +
      h.p(`These bills come from capped values. About 3 in 4 units are taxed on a value under market. After a sale the county reappraises the unit near its price, so a new owner's bill can differ. `) +
      h.p(`About 1 unit in ${HOME_ONE_IN} is taxed as an owner's home, which carries a lower rate. About 3 in 4 units have a tax-bill address outside South Carolina.`) +
      h.p(`The tax bill and deed of any one unit are free in our ${h.a("/buyers/property-records/", "property records lookup")}. Our ${h.a("/buyers/property-taxes/", "property tax page")} shows both rates.`) },

    { h2: "Can you rent an Ocean Forest Villas condo by the night?", toc: "Renting it", id: "renting", html: (bg) =>
      h.h3("What the listings and the city say") +
      h.p(`Most listings say yes. ${FG.str_allowed} of the ${FOR_SALE} say short-term rentals are allowed, and about 7 in 10 say the unit is in a rental program.`) +
      h.p(`All five buildings are in the City of Myrtle Beach and in its RMV zoning district. The city's map for nightly rentals appears to cover this block. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.`) +
      h.h3("What the rental program offers") +
      h.p(`We could not read what the rental program offers or charges. We get its terms before an offer. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`What two-bedroom condos earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for these buildings alone, so we print no figure.`) +
      h.cta("Know the rental terms before you offer", "We get the rental program's terms and a unit's booking history, and send them to you before you offer.", "Have us get the rental terms", "/contact/", bg) +
      h.h3("Other two-bedroom condos nearby") +
      h.p(`Weighing other two-bedroom condos nearby? These are within a mile.`) +
      STRIP_NEAR },

    { h2: "What we check before you buy at Ocean Forest Villas", toc: "Our checks", id: "checks", html: () =>
      `<ul class="c3-pr-list">`
        + `<li><strong>The building's age</strong>Built about 1980. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Flood zones</strong>FEMA's map puts the buildings in an area of minimal flood hazard. It also maps the coastal high-hazard zone nearby. No listing gives a flood zone, so we check the map for the unit and the flood policy. Our ${h.a("/buyers/flood-zone-check/", "flood zone page")} and ${h.a("/buyers/coastal-insurance/", "coastal insurance page")} show how.</li>`
        + `<li><strong>The fee</strong>It falls in two groups. We ask what the higher group pays for.</li>`
        + `<li><strong>Who uses the units</strong>About 1 in ${HOME_ONE_IN} units is taxed as the owner's home. The rest pay the higher rate for second homes and rentals.</li>`
        + `<li><strong>If you will use a loan</strong>Buildings with a rental program are often non-warrantable, which narrows the loans that fit. Our ${h.a("/invest/non-warrantable-condos/", "non-warrantable condo page")} explains.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit an Ocean Forest Villas unit.`) +
      h.p(`To weigh these condos against other buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. For the wider city, see our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach neighborhood guide")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/caravelle-resort/", "Caravelle Resort")} (about 1 mile) and ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 2 miles). Farther north: ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about 4 miles) and ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} (about 4 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (about 2 miles) and ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (about 2 miles). Farther south: ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 4 miles) and ${h.a("/invest/condo-buildings/sea-mist-resort/", "Sea Mist Resort")} (about 5 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Ocean Forest Villas Myrtle Beach FAQ",
  faq: [
    { q: "Where is Ocean Forest Villas?", a: "Ocean Forest Villas is at 5601 N Ocean Blvd, Myrtle Beach, SC 29577, in the city of Myrtle Beach, not North Myrtle Beach." },
    { q: "How many condos are at Ocean Forest Villas?", a: "The county lists about 240 condos in five buildings, lettered A to E." },
    { q: "When was Ocean Forest Villas built?", a: "The listings give 1980 as the year built for every condo for sale, so we say about 1980. A building this age needs a close read of its reserve study." },
    { q: "Is Ocean Forest Villas oceanfront?", a: `Not as a community. ${FG.ocean_view} of the ${FOR_SALE} condos for sale say an ocean view, and ${FG.oceanfront_unit} say an oceanfront unit.` },
    { q: "Is Ocean Forest Villas pet friendly?", a: `${FG.pets_allowed} of the ${FOR_SALE} listings say pets are allowed. The association's rules decide, and we read them before you offer.` },
    { q: "How many Ocean Forest Villas condos are for sale?", a: `On ${RUN}, ${FOR_SALE} condos were for sale, all with two bedrooms, asking ${r1k(A.min)} to ${r1k(A.max)}.` },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "Ocean Forest Hotel, Wikipedia", href: WIKI },
    { name: "Ocean Forest Hotel, Live 5", href: LIVE5 },
    { name: "Ocean Forest Hotel, SC Public Radio", href: RADIO },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Ocean Forest Villas.",
    p: "Tell us the days you are here and which building you like. An agent shows you the Ocean Forest Villas units for sale.",
    label: "Book a showing at Ocean Forest Villas", href: "/contact/",
  },
  keywords: "ocean forest villas, ocean forest villas myrtle beach, ocean forest villas for sale, ocean forest villas condos for sale, ocean forest villas hoa, ocean forest villas rentals, 5601 n ocean blvd",
  about: "Ocean Forest Villas, a community of five buildings of two-bedroom condos at 5601 N Ocean Blvd, Myrtle Beach, South Carolina",
});
