/* /invest/condo-buildings/mar-vista-grande/ - Mar Vista Grande, 603 S Ocean Blvd, North Myrtle Beach: what owning
 * a condo there is like, the HOA fee and what it pays, the year's cost, the flood zone, what units sold for,
 * and whether it can rent.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-15. Follows the Palace Resort pilot (palace-resort.js) and its round 2
 * (live strips, no "send me" offers).
 * Facts: Blog-Brain batches/2026-11-e/mar-vista-grande/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * wording only (VERIFY.md). Rows 23 and 24 are struck; the struck parts of rows 25 and 27 and "most owners live
 * elsewhere" (row 20) are not used. Plan: PLAN.md. Demand: must-answer.md.
 * Data: data/2026-11-e/mar-vista-grande/ (listings.json, county.json, flood.json, tax.json, nearby.json, osm-near.json).
 * Every count, fee, price and share is read from those files and checked against its ledger row with must().
 * Picture: one USDA NAIP aerial (public domain), labelled from coordinates (images/label.py; photos.json).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/mar-vista-grande/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "mar-vista-grande");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), T = read("tax.json"), NB = read("nearby.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r50 = (v) => money(Math.round(v / 50) * 50);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`mar-vista-grande.js: ${msg}`); };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 1: 6 condos for sale, all at 603 S Ocean Blvd. */
must(L.api_total === 6 && L.at_603 === 6 && L.subdivision_field["Mar Vista Grande"] === 6, "row 1 changed");
/* Row 2 (CORRECTED): 160 condos; two more units numbered CU-1 and CU-2. */
must(C.parcels === 163 && C.units_with_building_value === 162 && C.condos === 160, "row 2 changed");
const CONDOS = C.condos;
/* Row 4: built in 2006. */
must(L.year_built["2006"] === 6, "row 4 changed");
/* Row 5: every condo for sale is a three-bedroom of 1,465 to 1,549 square feet. */
const A = L.asking;
must(L.beds["3"] === 6 && A["3"].sqft_range.join() === "1465,1549" && A["3"].sqft_median === 1480, "row 5 changed");
/* Row 6: agent-ticked position flags. */
const FG = L.flags;
must(FG.oceanfront_unit === 4 && FG.ocean_view === 6 && FG.oceanfront_building === 6, "row 6 changed");
/* Row 7 (VERIFIED): the fee to the dollar. */
const FX = L.fee_exact["3"];
must(FX.n === 6 && FX.lowest === 1293 && FX.highest === 1333, "row 7 fee changed");
const FEE = Math.round((FX.lowest + FX.highest) / 2 / 100) * 100;
must(FEE === 1300, "row 7 rounding");
/* Row 8: what the listings say the fee covers. */
must(FG.hoa_includes_water_sewer === 6 && FG.hoa_includes_trash === 6 && FG.hoa_includes_insurance === 6 && FG.hoa_includes_internet === 6 && FG.hoa_includes_pest === 6 && FG.hoa_includes_cable === 5 && FG.hoa_includes_electric === 0, "row 8 changed");
/* Row 9: a year of fees. */
const FEE_YEAR = [FX.lowest * 12, FX.highest * 12];
must(FEE_YEAR[0] === 15516 && FEE_YEAR[1] === 15996, "row 9 changed");
/* Row 10: tax at the rental rate on the middle asking price, North Myrtle Beach 221.2 mills. */
const MILLS = 221.2, MILLS_HOME = 221.2 - 109.1;
must(A.all.median === 824950 && A.all.min === 749900 && A.all.max === 979000, "row 19 changed");
const TAX = A.all.median * 0.06 * MILLS / 1000;
must(Math.round(TAX) === 10949, "row 10 changed");
/* Row 11: the owner-occupant rate on the middle recorded sale of the seven ordinary sales. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30", "row 16 window changed");
must(SW.all.n === 8 && SW.all.median === 795000 && SW.all_without_under_300000.n === 7 && SW.all_without_under_300000.median === 815000 && SW.all_without_under_300000.min === 660000 && SW.all_without_under_300000.max === 895500 && SW.under_300000 === 1 && SW.all.min === 180000, "row 16 changed");
const TAX_HOME = SW.all_without_under_300000.median * 0.04 * MILLS_HOME / 1000;
must(Math.round(TAX_HOME) === 3654 && C.taxed_as_home_4pct === 16 && C.taxed_at_6pct === 144, "row 11 changed");
/* Row 12: the year's line, before any loan. $500 roundings so the column adds up. */
must(r500(FEE_YEAR[0]) === "$15,500" && r500(FEE_YEAR[1]) === "$16,000" && r500(TAX) === "$11,000", "row 12 parts changed");
const YEAR_LO = Math.round(FEE_YEAR[0] / 500) * 500 + Math.round(TAX / 500) * 500, YEAR_HI = Math.round(FEE_YEAR[1] / 500) * 500 + Math.round(TAX / 500) * 500;
must(YEAR_LO === 26500 && YEAR_HI === 27000, "row 12 totals changed");
/* Row 13 (CORRECTED): the county's own bill on older values (condos only). */
must(T.units_at_6pct === 146, "row 13 file changed; read the row again");
/* Row 14: flood zones under the lot. */
const zone = (z) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
must(zone("AE").share_of_footprint === 0.679 && zone("VE").share_of_footprint === 0.321 && FL.share_in_no_zone === 0 && FL.zones_touching.length === 2, "row 14 changed");
const AE_PCT = Math.round(zone("AE").share_of_footprint * 100), VE_PCT = Math.round(zone("VE").share_of_footprint * 100);
must(AE_PCT + VE_PCT === 100, "row 14 shares");
/* Row 15: the listings' own flood field is blank on all 6. */
must(L.flood_zone_field["None"] === 6, "row 15 changed");
/* Row 18: about 1 in 20 sells in a year. */
const ONE_IN = Math.round(CONDOS / SW.all.n);
must(ONE_IN === 20, "row 18 changed");
/* Row 21: rentals, by the listings' flags. */
must(FG.str_allowed === 6 && FG.long_term_rental_allowed === 6 && FG.vacation_rental_program === 3 && FG.has_rental_income === 3, "row 21 changed");
/* Row 26: parking and the building. */
must(FG.covered_parking === 6 && FG.elevator_building === 6 && FG.balcony === 6 && FG.indoor_pool === 6, "row 26 changed");
/* Row 29: of 48 oceanfront condos for sale within a mile, 38 are in buildings built before 2006. */
must(NB.total === 48 && NB.year_built_bands["before 2006"] === 38 && NB.year_built_bands["2006 or later"] === 10, "row 29 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 27 (CORRECTED): the one distance that is kept, the sand parking lot. */
const LOT = require(path.join(DATA, "osm-near.json")).places.find((p) => p.name === "7th S. Public Beach Parking");
must(LOT && LOT.metres === 140, "row 27 lot changed");
const LOT_FEET = Math.round(LOT.metres * 3.281 / 50) * 50;
must(LOT_FEET === 450, "row 27 feet");

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
  /* Phone: the price tiles and a short, cropped aerial come first, so the standfirst is still on the first screen. */
  + `@media (max-width:699px){${S} .c3-glance li:nth-child(-n+2){display:none!important}${S} .c3-glance li:nth-last-child(-n+2){border-bottom:${RULE}!important}${S} figure.c3ph-hero img{width:100%!important;height:150px!important;object-fit:cover!important}${S} figure.c3ph-hero{margin:.8rem 0 .8rem!important}${S} figure.c3ph-hero figcaption{display:none!important}${S} .detail-hero .eyebrow{display:none!important}}`
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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/mar-vista-grande-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.1rem 0 1.2rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The flood picture (row 14): one message, two bars.                             */

const FLOOD_CHART = G.bars([
  { name: "Zone AE, high risk", value: AE_PCT, valueText: `About ${AE_PCT}%` },
  { name: "Zone VE, coastal high-hazard", value: VE_PCT, valueText: `About ${VE_PCT}%` },
], {
  caption: "All of the land under Mar Vista Grande is in a high-risk flood zone",
  nameLabel: "FEMA flood zone", valueLabel: "Share of the land", format: (v) => `${v}%`, max: 100, compact: true,
  note: `Share of the building's land in each zone, from the county's copy of FEMA's flood map. None of the land is outside a zone.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const HUD = "https://entp.hud.gov/idapp/html/condlook.cfm";
const STR = "https://www.nmb.us/833/Short-term-Rentals";
const OSM = "https://www.openstreetmap.org/copyright";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Mar Vista Grande", alternateName: ["Mar Vista Grande North Myrtle Beach"],
  description: `An oceanfront condo tower with ${CONDOS} condos, built in 2006, in the Ocean Drive section of North Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "603 S Ocean Blvd", addressLocality: "North Myrtle Beach", addressRegion: "SC", postalCode: "29582", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "North Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Round 2 (owner, 2026-11-14): live strips, no "send me" offer. Checked on the live site 2026-11-14: 6 and 48 homes. */
const STRIP = G.homesQScript() + G.homesQ("subdivision=Mar Vista Grande&type=condo", "Own a three-bedroom on the ocean at Mar Vista Grande");
const STRIP_NEAR = G.homesQ(`near=${FL.footprint_center[0]},${FL.footprint_center[1]}&miles=1&type=condo&has=oceanfront_unit`, "Other oceanfront condos within a mile (not Mar Vista Grande)");

const YEAR_TABLE = h.table(["Each year at Mar Vista Grande, before any loan", "About"], [
  ["HOA fees", `${r500(FEE_YEAR[0])} to ${r500(FEE_YEAR[1])}`],
  ["Property tax as a second home or rental", r500(TAX)],
  ["<strong>Total</strong>", `<strong>${money(YEAR_LO)} to ${money(YEAR_HI)}</strong>`],
  ["If it is your legal residence, the tax alone", r50(TAX_HOME)],
]);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Mar Vista Grande Condos, North Myrtle Beach: Fee About ${money(FEE)}`,
  description: `Mar Vista Grande, 603 S Ocean Blvd, North Myrtle Beach: the HOA fee and what it pays, a year's cost, the flood zone, rentals, and what units sold for.`,
  ogTitle: "Mar Vista Grande, North Myrtle Beach: condos for sale, HOA fee, flood zone and rentals",
  crumb: "Mar Vista Grande",
  eyebrow: "Mar Vista Grande, North Myrtle Beach",
  h1: "Mar Vista Grande, North Myrtle Beach: condos for sale on the ocean.",
  h1em: "A 2006 tower right on the ocean.",
  sub: "Mar Vista Grande has three-bedroom condos on the oceanfront at 603 S Ocean Blvd, with Main Street's restaurants about half a mile northeast.",
  heroMedia: glance([
    { icon: "home", label: "Condos", text: `${CONDOS}` },
    { icon: "calendar", label: "Built", text: "2006" },
    { icon: "dollar", label: "HOA fee", text: `About ${money(FEE)} a month` },
    { icon: "key", label: "Asking, middle", text: `About ${r1k(A.all.median)}` },
  ]) + PHOTO,
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Mar Vista Grande is an oceanfront tower of ${CONDOS} condos at 603 S Ocean Blvd in North Myrtle Beach. All ${L.api_total} condos for sale on ${RUN_MD} were three-bedrooms of about ${n(A["3"].sqft_median)} square feet, asking about ${r1k(A.all.median)} in the middle.`,
    `The HOA fee is about ${money(FEE)} a month. Fees and property tax come to about ${money(YEAR_LO)} a year before any loan. The whole building sits in a FEMA flood zone, a third of it in the coastal one.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Mar Vista Grande is one of 47 buildings in our ${h.a("/invest/condo-buildings/", "guide to oceanfront condo buildings")}. It is not Vista del Mar, a different building in Grande Dunes.</p>` },

    { h2: "What is it like to own a condo at Mar Vista Grande?", toc: "Owning here", id: "owning", html: () =>
      h.p(`Mar Vista Grande is newer than most oceanfront condos near it. Of the ${NB.total} oceanfront condos for sale within a mile on ${RUN_MD}, ${NB.year_built_bands["before 2006"]} are in buildings built before 2006.`) +
      h.p(`Listings and agents describe a lazy river, indoor and outdoor pools, hot tubs and a fitness center. All ${L.api_total} listings on ${RUN_MD} tick an indoor pool. We have not found the building's own page for its amenities, so we ask the association for the list and the pool rules before you offer.`) +
      h.h3("What the units are like") +
      h.p(`Every condo for sale today is a three-bedroom with three baths, from ${n(A["3"].sqft_range[0])} to ${n(A["3"].sqft_range[1])} square feet. ${FG.oceanfront_unit} of the ${L.api_total} list an oceanfront unit, all ${FG.ocean_view} have an ocean view and a balcony, and all ${FG.covered_parking} have covered parking.`) +
      h.h3("Where it sits") +
      h.p(`The tower is on the ocean in the Ocean Drive section of North Myrtle Beach. A public beach parking lot is about ${LOT_FEET} feet away. Main Street's restaurants, bars and ice cream shops are about half a mile to the northeast, measured in a straight line.`) +
      STRIP_NEAR },

    { h2: "What are the HOA fees at Mar Vista Grande?", toc: "HOA fees", id: "hoa-fees", html: () =>
      h.p(`The HOA fee at Mar Vista Grande is about ${money(FEE)} a month. The ${L.api_total} condos for sale on ${RUN_MD} listed fees from ${money(FX.lowest)} to ${money(FX.highest)}.`) +
      h.p(`Listings say the fee covers:`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Water, sewer and trash</strong>On all ${FG.hoa_includes_water_sewer} listings.</li>`
        + `<li><strong>The building's insurance</strong>On all ${FG.hoa_includes_insurance} listings. It does not cover the inside of your unit.</li>`
        + `<li><strong>Internet and pest control</strong>On all ${FG.hoa_includes_internet} listings. Cable is on ${FG.hoa_includes_cable} of the ${L.api_total}.</li>`
        + `</ul>` +
      h.p(`None of the listings says the fee pays the power bill. Budget for power, and for your own policy on the inside of the unit. We ask the association for the budget and the reserve study before you offer. The reserve study is the building's plan for big repairs. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("What a year costs before any loan") +
      YEAR_TABLE +
      h.h3("How we figured the tax") +
      h.p(`We used the middle asking price. South Carolina taxes a second home or a rental on 6 percent of its value, and a sale resets the value to about the price.`) +
      h.p(`For most units the county's value today is well below the market value it lists, so we price the tax from the price. About ${Math.round(C.taxed_as_home_4pct / CONDOS * 100)} percent of the units are taxed today as the owner's home. Our ${h.a("/buyers/property-taxes/", "property tax page")} explains the lower rate for a home you live in.`) },

    { h2: "Is Mar Vista Grande in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`Yes, all of it. The county's copy of FEMA's flood map puts the building's land in two high-risk zones. About ${AE_PCT} percent is in zone AE, a high-risk area. About ${VE_PCT} percent is in zone VE, the coastal high-hazard zone, where waves add to the flood risk.`) +
      FLOOD_CHART +
      h.p(`The building's insurance is in the HOA fee. Flood cover on the inside of your unit is a separate question. We read the building's policy before you offer, and you can ${h.a("/contact/", "ask us for an insurance quote")} on a unit you like. We put no price on insurance on this page.`) +
      h.p(`The listings' own flood field was blank on all ${L.flood_zone_field["None"]} condos for sale. We read the county's map instead.`) },

    { h2: "What have Mar Vista Grande condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} sales of Mar Vista Grande condos were recorded at the county in the ${PERIOD}. Seven were ordinary sales, from ${r500(SW.all_without_under_300000.min)} to ${r500(SW.all_without_under_300000.max)}. One was recorded at ${money(SW.all.min)}, and we leave it out of the middle.`) +
      h.p(`That is about 1 in ${ONE_IN} condos in the building changing hands in a year.`) +
      h.table(["Mar Vista Grande condos", "Price"], [
        ["Recorded sales: middle of 7 ordinary sales", `About ${r1k(SW.all_without_under_300000.median)}`],
        ["Recorded sales: lowest to highest", `${r500(SW.all_without_under_300000.min)} to ${r500(SW.all_without_under_300000.max)}`],
        [`Asking prices: middle of ${L.api_total} for sale on ${RUN_SHORT}`, `About ${r1k(A.all.median)}`],
        ["Asking prices: lowest to highest", `${r1k(A.all.min)} to ${r1k(A.all.max)}`],
      ]) +
      h.p(`The price on a recorded sale is the one stated on it, not a checked sale price. We price a unit from recent sales of similar units in the same layout and on the same floor, not from asking prices. Our ${h.a("/sell/home-value/", "home value page")} explains how.`) },

    { h2: "Can you Airbnb a condo at Mar Vista Grande?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Maybe. All ${FG.str_allowed} listings on ${RUN_MD} say short-term rentals are allowed, and all ${FG.long_term_rental_allowed} say long-term rentals are allowed. ${FG.vacation_rental_program} of the ${L.api_total} are in a rental program, and ${FG.has_rental_income} list rental income.`) +
      h.p(`The city of North Myrtle Beach requires a business license for every short-term rental and renews it each year. An association can still say no, so we read the papers for the unit you like.`) +
      h.p(`Our pages explain ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")}, the ${h.a("/invest/str-rules/", "short-term rental rules")}, the ${h.a("/invest/accommodations-tax/", "lodging tax")} and what rentals ${h.a("/invest/airbnb-income/", "gross across the Grand Strand")}. No public source gives income for this building alone.`) },

    { h2: "What we check before you buy at Mar Vista Grande", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>The flood zone and the building's policy</strong>We read the building's policy for flood cover and what it leaves to you.</li>`
        + `<li><strong>The reserve study and the budget</strong>We read the study, the last two budgets and the meeting minutes for any planned special charge to owners. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>The rental papers</strong>We confirm that the association allows the rentals you plan and read the program's terms if the unit is in one.</li>`
        + `<li><strong>If you will use a loan</strong>Mar Vista Grande is not on HUD's list of condos approved for FHA loans. Ask a lender early.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a unit here. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.p(`To weigh Mar Vista Grande against the other 46 buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/prince-resort/", "Prince Resort")} (about 3 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 4 miles) and ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} (about 7 miles). Farther south: ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about 7 miles) and ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 9 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Mar Vista Grande North Myrtle Beach FAQ",
  faq: [
    { q: "Where is Mar Vista Grande?", a: "Mar Vista Grande is at 603 S Ocean Blvd, North Myrtle Beach, SC 29582, on the oceanfront in the Ocean Drive section." },
    { q: "When was Mar Vista Grande built?", a: "Mar Vista Grande was built in 2006. The tower is newer than most oceanfront condos near it." },
    { q: "How many condos are in Mar Vista Grande?", a: `The county records ${CONDOS} condos. It lists two more units, numbered CU-1 and CU-2, that we do not count as condos.` },
    { q: "How many bedrooms do the condos have?", a: `Every condo for sale on ${RUN_MD} was a three-bedroom with three baths, from ${n(A["3"].sqft_range[0])} to ${n(A["3"].sqft_range[1])} square feet.` },
    { q: "Does Mar Vista Grande have a lazy river?", a: "Listings and agents say yes, with indoor and outdoor pools and hot tubs. We ask the association for the amenity list and pool rules before you offer." },
    { q: "What are the HOA fees at Mar Vista Grande?", a: `About ${money(FEE)} a month, from ${money(FX.lowest)} to ${money(FX.highest)} across the ${L.api_total} condos for sale on ${RUN_MD}. What the fee covers is listed above.` },
    { q: "Is Mar Vista Grande the same as Vista del Mar?", a: "No. Vista del Mar is a different building, in Grande Dunes in Myrtle Beach. Mar Vista Grande is at 603 S Ocean Blvd in North Myrtle Beach." },
    { q: "How many Mar Vista Grande condos are for sale?", a: `On ${RUN_MD}, ${L.api_total} condos were for sale, all three-bedrooms, asking from ${r1k(A.all.min)} to ${r1k(A.all.max)}.` },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "HUD condo list", href: HUD },
    { name: "North Myrtle Beach short-term rentals", href: STR },
    { name: "OpenStreetMap", href: OSM },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Mar Vista Grande.",
    p: "Tell us what you want and the days you are here. An agent shows you the Mar Vista Grande condos for sale.",
    label: "Book a showing at Mar Vista Grande", href: "/contact/",
  },
  keywords: "Mar Vista Grande, Mar Vista Grande North Myrtle Beach, Mar Vista Grande condos for sale, Mar Vista Grande HOA fees, Mar Vista Grande rentals, 603 S Ocean Blvd North Myrtle Beach, when was Mar Vista Grande built",
  about: "Mar Vista Grande, a 160-condo oceanfront tower at 603 S Ocean Blvd, North Myrtle Beach, South Carolina",
});
