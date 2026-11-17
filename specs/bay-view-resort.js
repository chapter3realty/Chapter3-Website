/* /invest/condo-buildings/bay-view-resort/ - Bay View Resort, 504 N Ocean Blvd, Myrtle Beach: what owning a condo
 * there gives you, the HOA fee by unit size and what the listings say it pays, renting by the night, what units
 * sold for (smaller against larger), and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. The second resort page, built the way palace-resort.js was.
 * Facts: Blog-Brain batches/2026-11-e/bay-view-resort/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md: rows 3, 24, 26 corrected; row 31's monthly series is not printed).
 * Data: data/2026-11-e/bay-view-resort/ (listings.json, county.json, flood.json, tax.json, photos.json, images/).
 * Every count, fee, price, share and chart value is read from those files here and checked against its ledger
 * row with must(); a changed file stops the build until a person reads the row again.
 * Homes: four live strips (G.homesQ), no "send me" offer (owner, 2026-11-14). Picture: one USDA NAIP aerial
 * (public domain), cropped and labelled from coordinates, until the photo partner's shots arrive.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/bay-view-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "bay-view-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r10k = (v) => money(Math.round(v / 10000) * 10000);
const must = (ok, msg) => { if (!ok) throw new Error(`bay-view-resort.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 7: 183 units on floors numbered 2 to 12 and 14 to 19 (no 13); 11 on most floors, 9 on floors 2, 3 and 19. */
const FLR = C.floors;
must(C.units === 183 && FLR.top === 19 && FLR.missing_between.join() === "13" && FLR.numbers[0] === 2, "row 7 floors or units changed");
must(FLR.units_per_floor["4"] === 11 && FLR.units_per_floor["2"] === 9 && FLR.units_per_floor["19"] === 9, "row 7 units per floor changed");
const UNITS = C.units;
/* Row 6: built about 2007 (9 listings say 2007, 1 says 2006). */
must(L.year_built["2007"] === 9 && L.year_built["2006"] === 1, "row 6 changed");
/* Rows 14 and 15: for sale now, by size; the fee by size to the dollar (bisection), one-bedrooms only on their own. */
const A = L.asking, FX = L.fee_exact;
must(L.api_total === 10 && L.at_504 === 10 && L.beds["1"] === 7 && L.beds["2"] === 2 && L.beds["3"] === 1, "row 14 counts changed");
const BIG_N = L.beds["2"] + L.beds["3"];
must(BIG_N === 3, "row 14 larger group changed");
must(A["1"].median === 139000 && A["1"].min === 119900 && A["1"].max === 194900 && A["1"].sqft_range.join() === "606,693", "row 14 one-bedroom asking changed");
const BIG_MIN = Math.min(A["2"].min, A["3"].min), BIG_MAX = Math.max(A["2"].max, A["3"].max);
must(BIG_MIN === 362500 && BIG_MAX === 532500, "row 14 larger asking range changed");
must(A.all.median === 153400, "row 14 asking middle changed");
must(FX["1"].n === 7 && FX["1"].lowest === 685 && FX["1"].highest === 776, "row 15 one-bedroom fee changed");
must(FX["2"].n === 2 && FX["2"].lowest === 1174 && FX["2"].highest === 1174, "row 15 two-bedroom fee changed");
must(r5(FX["1"].lowest) === "$685" && r5(FX["1"].highest) === "$775", "row 15 rounding");
/* Decision (row 15 note): the two-bedroom fee is two listings, so it is printed as "over $1,100", never as a figure. */
const FEE_LO = FX["1"].lowest, FEE_HI = FX["1"].highest;
const YEAR_LO = FEE_LO * 12, YEAR_HI = FEE_HI * 12;
must(r100(YEAR_LO) === "$8,200" && r100(YEAR_HI) === "$9,300" && FX["2"].lowest * 12 > 13000, "row 21 fees a year changed");
/* Row 16: what the fee pays, by the listings' own agent-ticked flags (wording limit: "the listings say"). */
const FG = L.flags;
must(FG.hoa_includes_electric === 10 && FG.hoa_includes_utilities === 10 && FG.hoa_includes_water_sewer === 10 && FG.hoa_includes_trash === 10 && FG.hoa_includes_internet === 10 && FG.hoa_includes_insurance === 9 && FG.hoa_includes_pest === 9, "row 16 changed");
/* Row 20 and 21: tax at the rental rate on the typical one-bedroom's asking price, before any exemption. */
const MILLS = 254.6;
const TAX = A["1"].median * 0.06 * MILLS / 1000;
must(Math.round(TAX) === 2123 && r100(TAX) === "$2,100", "row 20 tax changed");
const HOLD_LO = YEAR_LO + TAX, HOLD_HI = YEAR_HI + TAX;
must(HOLD_LO > 10000 && HOLD_LO < 10500 && r100(HOLD_LO) === "$10,300" && r100(HOLD_HI) === "$11,400", "row 21 totals changed");
/* Row 17: nightly rentals, by the listings' flags. Row 11/13: parking and the units. */
must(FG.str_allowed === 10 && FG.vacation_rental_program === 10 && FG.furnished === 10 && FG.balcony === 10, "rows 13 and 17 changed");
must(FG.indoor_pool === 8 && FG.oceanfront_unit === 3 && FG.ocean_view === 8, "rows 8 and 13 flags changed");
/* Rows 22 and 23: recorded deeds, the directory's window, and the split by the county's value for the unit. */
const SW = C.sales.hub_window, SV = C.sales_by_value;
must(SW.window === "2025-10-01 to 2026-09-30" && SV.window_1.window === SW.window, "row 22 window changed");
must(SW.all.n === 12 && SW.all.median === 188200, "row 22 changed");
const SMALL = SV.window_1.under_200k, BIGS = SV.window_1["300k_up"];
must(SMALL.n === 7 && SMALL.median === 139777 && SMALL.min === 112500 && SMALL.max === 189900, "row 23 smaller group changed");
must(BIGS.n === 5 && BIGS.median === 360000 && BIGS.min === 350000 && BIGS.max === 475000, "row 23 larger group changed");
must(SMALL.n + BIGS.n === SW.all.n, "row 23 groups no longer add to the sales");
const ONE_IN = Math.round(UNITS / SW.all.n);
must(ONE_IN === 15, "row 22 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 25: taxed as the owner's home. */
must(C.taxed_as_home_4pct === 2, "row 25 changed");
/* Row 27 (VERIFIED wording): flood zones under the lot. */
const zone = FL.zones_touching.find((x) => x.attributes.FLD_ZONE === "0.2 PCT ANNUAL CHANCE FLOOD HAZARD");
must(FL.zones_touching.length === 1 && zone && zone.share_of_footprint === 0.378 && FL.share_in_no_zone === 0.622 && FL.center_point_zones.length === 0, "row 27 changed");
const MOD_PCT = Math.round(zone.share_of_footprint * 100), NONE_PCT = Math.round(FL.share_in_no_zone * 100);
/* Row 28: every one-bedroom for sale is over 500 square feet. */
must(A["1"].sqft_range[0] > 500, "row 28 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];
must(LAT === 33.687986 && LNG === -78.883317, "row 4 center changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (same design pass as palace-resort.js).       */

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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/bay-view-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 14, 15, 21): by size. A group of one or two listings is not printed on its own. */

const FEE_TABLE = compareCards([
  { name: "One-bedroom", bestFor: `${A["1"].sqft_range[0]} to ${A["1"].sqft_range[1]} sq ft`,
    cells: { fee: `About ${r5(FEE_LO)} to ${r5(FEE_HI)}`, year: `${r100(YEAR_LO)} to ${r100(YEAR_HI)}`, ask: `About ${r1k(A["1"].median)}`, sale: `${L.beds["1"]}` } },
  { name: "Larger units", bestFor: "Two and three bedrooms",
    cells: { fee: "Over $1,100 (two-bedroom)", year: "Over $13,000 (two-bedroom)", ask: `${r10k(BIG_MIN)} to ${r5k(BIG_MAX)}`, sale: `${BIG_N}` } },
], [
  { key: "fee", label: "HOA fee a month" },
  { key: "year", label: "Fees a year" },
  { key: "ask", label: "Asking price" },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At Bay View, the fee goes by the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* The sales chart (row 23): one message, two bars. */
const SALES = G.bars([
  { name: `Smaller units (${SMALL.n} sales)`, value: SMALL.median, valueText: `About ${r1k(SMALL.median)}` },
  { name: `Larger units (${BIGS.n} sales)`, value: BIGS.median, valueText: `About ${r1k(BIGS.median)}` },
], {
  caption: "Larger units at Bay View sold for about $360,000; smaller ones for about $140,000",
  nameLabel: "Units", valueLabel: "Middle sale price", compact: true, max: Math.round(BIGS.median * 1.4),
  note: `Recorded deeds, ${PERIOD}. Smaller units sold from ${r500(SMALL.min)} to ${r500(SMALL.max)}; larger units from ${r500(BIGS.min)} to ${r500(BIGS.max)}. The deeds do not record bedrooms, so the county's value for the unit stands in for its size: under $200,000 is smaller, $300,000 or more is larger.`,
});
must(r1k(SMALL.median) === "$140,000" && r1k(BIGS.median) === "$360,000", "chart title no longer matches its values");

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.bayviewresort.com/";
const AMENITIES = "https://www.bayviewresort.com/amenities/";
const FAQPAGE = "https://www.bayviewresort.com/faq/";
const ROOMS = "https://www.bayviewresort.com/accommodations/";
const OWNERS = "https://www.bayviewresort.com/homeowner-services/";
const BRH = "https://www.brittainresorts.com/homeowner-services/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const HUD = "https://entp.hud.gov/idapp/html/condlook.cfm";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Bay View Resort", alternateName: ["Bay View on the Boardwalk", "Bayview Resort", "Bay View Resort Myrtle Beach"],
  description: `An oceanfront condo tower on the Boardwalk in Myrtle Beach, South Carolina, built about 2007, with ${UNITS} condos.`,
  address: { "@type": "PostalAddress", streetAddress: "504 N Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips (owner, 2026-11-14). Checked 2026-11-14 against /homes/api/strip: 10, 3, 7 and 14 homes. The MLS spells the building "Bay View Resort". */
const SUB = "subdivision=Bay View Resort&type=condo";
const STRIP = G.homesQScript() + G.homesQ(SUB, "Condos for sale at Bay View Resort, on the Myrtle Beach Boardwalk");
const STRIP_OCEAN = G.homesQ(`${SUB}&waterfront=1`, "Bay View condos on the oceanfront");
const STRIP_UNDER = G.homesQ(`${SUB}&max=200000`, "Bay View condos under $200,000");
const STRIP_NEAR = G.homesQ(`near=${LAT},${LNG}&miles=1&type=condo&beds=2&waterfront=1`, "Oceanfront condos with two bedrooms or more, within a mile of Bay View");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Bay View Resort Myrtle Beach Condos for Sale: Fees From ${r5(FEE_LO)}`,
  description: `Bay View Resort, 504 N Ocean Blvd, Myrtle Beach: HOA fees by unit size, what they pay, nightly rentals, and what ${SW.all.n} units sold for, with condos for sale now.`,
  ogTitle: "Bay View Resort, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "Bay View Resort",
  eyebrow: "Bay View Resort, Myrtle Beach",
  h1: "Bay View Resort, Myrtle Beach: condos for sale on the Boardwalk.",
  h1em: "All 10 condos for sale say the HOA fee pays the electric bill.",
  sub: `${UNITS} condos at 504 N Ocean Blvd, on the Boardwalk. To book a stay instead, go to ${h.ext(RESORT, "the resort's own website")}.`,
  heroMedia: glance([
    { icon: "beach", label: "Location", text: "On the Boardwalk" },
    { icon: "home", label: "Condos", text: `${UNITS}` },
    { icon: "calendar", label: "Built", text: "About 2007" },
    { icon: "key", label: "Nightly rentals", text: "Allowed" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Bay View Resort is an oceanfront tower on the Myrtle Beach Boardwalk with ${UNITS} condos you can own. Condos there sold for about ${r1k(SW.all.median)} in the middle over the past year.`,
    `All ${L.api_total} condos for sale on ${RUN_MD} say the HOA fee pays the electric bill. Those are the listing agents' entries, so we ask for the budget. The HOA fee on a one-bedroom is about ${r5(FEE_LO)} to ${r5(FEE_HI)} a month. The bigger the unit, the higher the fee.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `${PHOTO}<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Bay View is one of 47 buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at Bay View Resort?", toc: "Owning here", id: "owning", html: () =>
      h.p(`The Boardwalk runs right in front of the building, and the resort says it is 1.2 miles long. The 2nd Avenue Pier is a third of a mile south and the SkyWheel half a mile north, in a straight line.`) +
      h.p(`Inside, the resort has a heated indoor pool, a heated indoor lazy river, a heated kiddie pool and a hot tub. Outside it has a pool and a spa. A Starbucks sits on the ground floor of the tower.`) +
      h.p(`There is also an exercise room, shuffleboard, an outdoor fire pit, and giant chess and checkers on the oceanfront lawn.`) +
      h.h3("The building and the units") +
      h.p(`Unit numbers run on floors 2 to 12 and 14 to 19. No floor is numbered 13, and the ground floor holds the lobby and the Starbucks.`) +
      h.p(`The resort rents one-, two-, three- and four-bedroom condos, with washers and dryers in each. Views are oceanfront, ocean, side or city. All ${L.api_total} condos for sale on ${RUN_MD} came furnished with a balcony, and ${FG.ocean_view} were listed with an ocean view.`) +
      STRIP_OCEAN +
      h.p(`Parking is in a garage across the street. An owner's own parking rights are in the condo's founding documents, and we read them before you offer.`) },

    { h2: "What are the HOA fees at Bay View Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The fee goes by the size of the unit, and units of the same size list the same fee. The three-bedroom's fee is not in its listing.`) +
      FEE_TABLE +
      h.p(`The same listings say the fee also pays water and sewer, trash, internet and a utility, and nine say it pays the building's insurance. We ask for the budget that shows it.`) +
      h.p(`You still need a policy for the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("What a year costs before any loan") +
      h.p(`A one-bedroom costs from just over $10,000 to about ${r100(HOLD_HI)} a year to hold. That is fees of ${r100(YEAR_LO)} to ${r100(YEAR_HI)} plus about ${r100(TAX)} in city property tax at the rental rate. The tax is figured at the typical asking price, before any exemption.`) +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value, and a sale resets the value to about the price. The seller's bill can be lower than yours will be. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      STRIP_UNDER +
      h.cta("Know Bay View's budget before you offer", "We ask for the association's budget, its reserve study and the rental program's terms, and add them up for the unit you like.", "Have us get Bay View's budget and reserve study", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at Bay View Resort?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes. Bay View is in a City of Myrtle Beach zoning district where nightly rentals are allowed. All ${L.api_total} condos for sale on ${RUN_MD} say short-term rentals are allowed and that the unit is in a rental program.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's program</strong>The resort has a rental operation, and its ${h.ext(OWNERS, "owner page")} sends owners to Brittain Resorts &amp; Hotels. Brittain's ${h.ext(BRH, "owner page")} lists unlimited owner stays, monthly accounting of income and expense, and a year-end 1099.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`Brittain's page does not say what share of the rent an owner keeps, so we get the terms for any unit you consider. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`What one- and two-bedrooms earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for Bay View alone.`) },

    { h2: "What have Bay View Resort condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} units at Bay View sold in the ${PERIOD}, by Horry County's deed records. That is about 1 in ${ONE_IN} units in the building.`) +
      SALES +
      h.p(`The overall middle blends two groups, so it describes neither. Compare a unit with sales of its own size.`) +
      h.p(`Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) },

    { h2: "What to check before you buy at Bay View Resort", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>FEMA's map puts no high-risk zone on the lot. About ${MOD_PCT} percent of the lot is in the moderate zone, and about ${NONE_PCT} percent is outside the mapped zones. The map shows the county's lot drawing, not the walls, so we check the flood certificate and the flood cover in the building's policy.</li>`
        + `<li><strong>The building's age</strong>At about 19 years, we read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Who uses the units</strong>${C.taxed_as_home_4pct} of ${UNITS} units are taxed as the owner's home, against about 1 in 5 condos in Horry County. Bay View is run for renters.</li>`
        + `<li><strong>If you will use a loan</strong>Many standard loans will not cover a unit in a building run like a hotel. Bay View is not on HUD's list of condos approved for FHA loans. Every one-bedroom for sale is over 500 square feet (${A["1"].sqft_range[0]} to ${A["1"].sqft_range[1]}), the size one published condotel program asks for.</li>`
        + `<li><strong>Closing costs</strong>Buyers in rental-program buildings here pay HOA transfer fees and often a few months of dues in escrow.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Bay View unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      STRIP_NEAR +
      h.cta("Have us check a Bay View unit before you offer", "We go through each check above for the unit you like, and our affiliated lender, BrickWood Mortgage, a separate company, looks at the unit.", "Have us check a Bay View unit", "/contact/", bg) +
      h.p(`To weigh Bay View against the other 46 buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/roxanne-towers/", "Roxanne Towers")} (about 1 mile) and ${h.a("/invest/condo-buildings/palms-resort/", "The Palms Resort")} (about 1 mile). Farther north: ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (about 2 miles) and ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (about 2 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/sea-mist-resort/", "Sea Mist Resort")} (about 1 mile) and ${h.a("/invest/condo-buildings/landmark-resort/", "Landmark Resort")} (about 1 mile). Farther south: ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (about 2 miles) and ${h.a("/invest/condo-buildings/grand-atlantic/", "Grand Atlantic")} (about 2 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Bay View Resort Myrtle Beach FAQ",
  faq: [
    { q: "When was Bay View Resort in Myrtle Beach built?", a: "Bay View Resort was built about 2007. Nine of the ten condos for sale list 2007 and one lists 2006." },
    { q: "How many condos does Bay View Resort have?", a: `The county records ${UNITS} units. Unit numbers run on floors 2 to 12 and 14 to 19, and no floor is numbered 13.` },
    { q: "Is Bay View a hotel or condos?", a: "Both. The condos are owned one by one, and the resort rents standard rooms and condos to guests by the night." },
    { q: "Is there parking at Bay View Resort?", a: "Parking is in a garage across the street, with a clearance of 7 feet. For guests, the resort gives one pass for a one-bedroom and two for a two-bedroom or larger." },
    { q: "Is Bay View Resort pet friendly?", a: "Guests may not bring pets. An owner's own pet rules are in the condo's founding documents, and we read them before you offer." },
    { q: "What is the address of Bay View Resort?", a: "Bay View Resort is at 504 N Ocean Blvd, Myrtle Beach, SC 29577, on the Boardwalk." },
    { q: "How many Bay View Resort condos are for sale?", a: `On ${RUN}, ${L.api_total} were for sale: ${L.beds["1"]} one-bedrooms, ${L.beds["2"]} two-bedrooms and ${L.beds["3"]} three-bedroom.` },
    { q: "Is Bay View the same as Bayview in Conway?", a: "No. The Bayview homes in Conway are a new-home community about 30 miles inland, a different place from this oceanfront tower." },
  ],
  sources: [
    { name: "Bay View Resort", href: RESORT },
    { name: "amenities", href: AMENITIES },
    { name: "guest FAQ", href: FAQPAGE },
    { name: "rooms", href: ROOMS },
    { name: "owner page", href: OWNERS },
    { name: "Brittain owner page", href: BRH },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "HUD condo list", href: HUD },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Bay View.",
    p: "Tell us the size you want and the days you are here. An agent shows you the Bay View units for sale in that size.",
    label: "Book a showing at Bay View", href: "/contact/",
  },
  keywords: "bay view resort myrtle beach condos for sale, bayview myrtle beach, bayview resort myrtle beach condos for sale, bay view resort myrtle beach hoa fees, bay view on the boardwalk condos for sale, bay view resort myrtle beach airbnb, 504 n ocean blvd myrtle beach, when was bay view resort built",
  about: "Bay View Resort, a 183-unit oceanfront condo tower at 504 N Ocean Blvd on the Boardwalk, Myrtle Beach, South Carolina",
});
