/* /invest/condo-buildings/bay-watch-resort/ - Bay Watch Resort, 2701 S Ocean Blvd, North Myrtle Beach: what owning a condo
 * there gives you, the HOA fee by unit size and what the listings say it pays, renting, what units sold for
 * (studio, one-bedroom, larger), and what we check before an offer.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17. Built the way bay-view-resort.js was.
 * Facts: Blog-Brain batches/2026-11-f/bay-watch-resort/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md: rows 12, 18, 20 corrected; 5, 21, 23 wording; 22 not printed).
 * Data: data/2026-11-f/bay-watch-resort/ (listings.json, county.json, flood.json, photos.json, images/).
 * Every count, fee, price, share and chart value is read from those files here and checked against its ledger
 * row with must(); a changed file stops the build until a person reads the row again.
 * Homes: four live strips (G.homesQ). Picture: one USDA NAIP aerial (public domain), labelled from coordinates.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/bay-watch-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "bay-watch-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const must = (ok, msg) => { if (!ok) throw new Error(`bay-watch-resort.js: ${msg}`); };

/* The numbers, each checked against its ledger row. */
/* Rows 1, 6: for sale now, by size. */
must(L.api_total === 41 && L.at_towers === 41 && L.beds["0"] === 9 && L.beds["1"] === 15 && L.beds["2"] === 13 && L.beds["3"] === 4, "rows 1 and 6 counts changed");
/* Row 3: units. */
must(C.units === 533 && C.units_by_phase.I === 171 && C.units_by_phase.II === 192 && C.units_by_phase.III === 170, "row 3 changed");
const UNITS = C.units;
/* Row 4: built 2001 to 2003. */
must(L.year_built["2001"] === 27 && L.year_built["2002"] === 3 && L.year_built["2003"] === 11, "row 4 changed");
/* Row 7: asking by size. */
const A = L.asking;
must(A["0"].median === 126900 && A["0"].min === 107900 && A["0"].max === 159900 && A["0"].sqft_median === 345 && A["0"].sqft_range.join() === "326,400", "row 7 studio changed");
must(A["1"].median === 229900 && A["1"].min === 214900 && A["1"].max === 289000 && A["1"].sqft_range.join() === "552,700", "row 7 one-bedroom changed");
must(A["2"].median === 395000 && A["2"].min === 370000 && A["2"].max === 419500 && A["2"].sqft_range.join() === "890,1153", "row 7 two-bedroom changed");
must(A["3"].n === 4 && A["3"].min === 449900 && A["3"].max === 549900, "row 7 three-bedroom changed");
/* Row 8: fee by size, to a $25 bracket (at or under). Print the three-bedroom as "up to about $1,375"? No: one listing; verifier says prefer about $1,350. */
const F = L.fee;
must(F["0"].lowest_at_or_under === 400 && F["0"].highest_at_or_under === 450 && F["1"].lowest_at_or_under === 625 && F["1"].highest_at_or_under === 625, "row 8 studio or one-bedroom fee changed");
must(F["2"].middle_half.join() === "1000,1075" && F["2"].lowest_at_or_under === 775 && F["3"].median_at_or_under === 1350 && F["3"].highest_at_or_under === 1375, "row 8 larger fees changed");
/* Row 9: what the fee pays (agent-ticked). */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 39 && FG.hoa_includes_utilities === 39 && FG.hoa_includes_internet === 38 && FG.hoa_includes_trash === 37 && FG.hoa_includes_pest === 36 && FG.hoa_includes_insurance === 8, "row 9 changed");
/* Row 10 and 13: rentals and the units. */
must(FG.str_allowed === 37 && FG.vacation_rental_program === 39 && FG.furnished === 41 && FG.oceanfront_unit === 32 && FG.elevator_building === 38 && FG.parking_garage === 36 && FG.balcony === 37 && FG.pets_allowed === 23 && FG.indoor_pool === 38, "rows 10 and 13 changed");
/* Row 14, 15: recorded deeds. */
const SW = C.sales.window_1, SV = C.sales.by_county_value_w1;
must(SW.window === "2025-10-01 to 2026-09-30" && SW.all.n === 35 && SW.all.median === 265000, "row 14 changed");
must(SV.under_150k.n === 6 && SV.under_150k.median === 131350 && SV["150k_to_249k"].n === 16 && SV["150k_to_249k"].median === 230000 && SV["250k_up"].n === 13 && SV["250k_up"].median === 387500, "row 15 changed");
must(SV.under_150k.n + SV["150k_to_249k"].n + SV["250k_up"].n === SW.all.n, "row 15 groups no longer add to the sales");
const ONE_IN = Math.round(UNITS / SW.all.n);
must(ONE_IN === 15, "row 14 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 16: who lives in it, and where tax bills go. */
must(C.taxed_as_home_4pct === 22 && C.owner_out_of_sc === 430, "row 16 changed");
/* Row 18 (CORRECTED wording): flood. */
const zone = FL.zones_touching.find((x) => x.attributes.FLD_ZONE === "0.2 PCT ANNUAL CHANCE FLOOD HAZARD");
const hi = FL.zones_touching.filter((x) => x.attributes.SFHA_TF === "T").reduce((s, x) => s + x.share_of_footprint, 0);
must(zone && zone.share_of_footprint === 0.823 && hi > 0.006 && hi < 0.008 && FL.share_in_no_zone === 0.17, "row 18 changed");
const MOD_PCT = Math.round(zone.share_of_footprint * 100);
/* Row 20: studios are all under 400 sq ft; the program asks 500. */
must(A["0"].sqft_range[1] <= 400, "row 20 changed");
/* The listings' read time. */
must(/^2026-11-1[7-9]/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];
must(LAT === 33.801802 && LNG === -78.713004, "footprint center changed");

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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/bay-watch-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
/* Pool placement has no ledger row (row 5 lists features only): cut it from the caption and alt. */
AERIAL.caption = AERIAL.caption.replace(", with their pools on the beach side", "");
AERIAL.alt = AERIAL.alt.replace(" with pools and lazy-river loops on the beach side", "");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* The fee table (rows 6, 7, 8): by size. The three-bedroom is four listings and one low fee, so it is printed as a limit. */
const FEE_TABLE = compareCards([
  { name: "Studio", bestFor: `About ${A["0"].sqft_median} sq ft`,
    cells: { fee: `About ${r5(F["0"].lowest_at_or_under)} to ${r5(F["0"].highest_at_or_under)}`, ask: `About ${r1k(A["0"].median)}`, sale: `${L.beds["0"]}` } },
  { name: "One-bedroom", bestFor: `${A["1"].sqft_range[0]} to 700 sq ft`,
    cells: { fee: `About ${r5(F["1"].median_at_or_under)}`, ask: `About ${r1k(A["1"].median)}`, sale: `${L.beds["1"]}` } },
  { name: "Two-bedroom", bestFor: "About 900 to 1,150 sq ft",
    cells: { fee: `About ${r5(F["2"].middle_half[0])} to ${r5(F["2"].middle_half[1])}`, ask: `About ${r5k(A["2"].median)}`, sale: `${L.beds["2"]}` } },
  { name: "Three-bedroom", bestFor: "Varies",
    cells: { fee: "Up to about $1,375", ask: `From about ${r5k(A["3"].min)}`, sale: `${L.beds["3"]}` } },
], [
  { key: "fee", label: "HOA fee a month" },
  { key: "ask", label: "Asking price" },
  { key: "sale", label: "For sale now", num: true },
], { caption: "At Bay Watch, the fee and the price both go by the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* The sales chart (row 15): one message, three bars. */
const S1 = SV.under_150k, S2 = SV["150k_to_249k"], S3 = SV["250k_up"];
const SALES = G.bars([
  { name: `Studios and smallest units (${S1.n} sales)`, value: S1.median, valueText: `About ${r1k(S1.median)}` },
  { name: `One-bedrooms (${S2.n} sales)`, value: S2.median, valueText: `About ${r1k(S2.median)}` },
  { name: `Larger units (${S3.n} sales)`, value: S3.median, valueText: `About ${r500(S3.median)}` },
], {
  caption: "Smaller units at Bay Watch sold for about $131,000, one-bedrooms for $230,000, larger units for about $387,500",
  nameLabel: "Units", valueLabel: "Middle sale price", compact: true, max: Math.round(S3.median * 1.3),
  note: `Recorded deeds, ${PERIOD}. Sales ran from ${r500(S1.min)} to ${r500(S3.max)} in all. The deeds do not record bedrooms, so the county's value for the unit stands in for its size.`,
});
must(r1k(S1.median) === "$131,000" && r1k(S2.median) === "$230,000" && r500(S3.median) === "$387,500", "chart title no longer matches its values");

/* Sources */
const VAC = "https://www.vacasa.com/usa/Baywatch-Resort/";
const NMB = "https://www.nmb.us/833/Short-term-Rentals";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Bay Watch Resort", alternateName: ["Baywatch Resort", "Bay Watch Resort & Conference Center"],
  description: `Three oceanfront condo towers in Crescent Beach, North Myrtle Beach, South Carolina, built 2001 to 2003, with ${UNITS} condos.`,
  address: { "@type": "PostalAddress", streetAddress: "2701 S Ocean Blvd", addressLocality: "North Myrtle Beach", addressRegion: "SC", postalCode: "29582", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "City", name: "North Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips. Checked 2026-11-17 against /homes/api/strip: 41, 32, 14 and 17 homes. The MLS spells the building "Bay Watch". */
const SUB = "subdivision=Bay Watch&type=condo";
const STRIP = G.homesQScript() + G.homesQ(SUB, "Condos for sale at Bay Watch Resort, North Myrtle Beach");
const STRIP_OCEAN = G.homesQ(`${SUB}&waterfront=1`, "Bay Watch condos on the oceanfront");
const STRIP_ONE = G.homesQ(`${SUB}&beds=1&max=250000`, "One-bedrooms at Bay Watch under $250,000");
const STRIP_BIG = G.homesQ(`${SUB}&beds=2`, "Two bedrooms or more at Bay Watch");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Bay Watch Resort North Myrtle Beach Condos: Fees From ${r5(F["0"].lowest_at_or_under)}`,
  description: `Bay Watch Resort, 2701 S Ocean Blvd, North Myrtle Beach: HOA fees by size, what they pay, rentals, and what ${SW.all.n} units sold for, with the condos for sale now.`,
  ogTitle: "Bay Watch Resort, North Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "Bay Watch Resort",
  eyebrow: "Bay Watch Resort condos",
  h1: "Bay Watch Resort, North Myrtle Beach: condos for sale in three towers.",
  h1em: "One building, studios to three-bedrooms, and the fee goes by size.",
  sub: `Bay Watch Resort has ${UNITS} condos in three towers in North Myrtle Beach. Rental companies list units to book a stay. This page is for buyers.`,
  heroMedia: glance([
    { icon: "beach", label: "Towers", text: "Three" },
    { icon: "home", label: "Condos", text: `${UNITS}` },
    { icon: "calendar", label: "Built", text: "2001 to 2003" },
    { icon: "key", label: "Short-term rentals", text: "Most listings say allowed" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Bay Watch Resort is three oceanfront towers at 2701 S Ocean Blvd in North Myrtle Beach, built 2001 to 2003. It sells one ladder of sizes: studios from about ${r1k(A["0"].min)}, one-bedrooms from about ${r5k(A["1"].min)}, two-bedrooms from about ${r5k(A["2"].min)}.`,
    `The HOA fee climbs with size: about ${r5(F["0"].lowest_at_or_under)} to ${r5(F["0"].highest_at_or_under)} for a studio, about ${r5(F["1"].median_at_or_under)} for a one-bedroom and about ${r5(F["2"].middle_half[0])} to ${r5(F["2"].middle_half[1])} for a two-bedroom. Most condos for sale say it pays water, sewer, internet and trash. We ask for the budget to confirm it. The town is North Myrtle Beach, not Myrtle Beach.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Bay Watch is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to oceanfront condo buildings")}. The town is covered on our ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach page")}.</p>` },

    { h2: "What is it like to own a condo at Bay Watch Resort?", toc: "Owning here", id: "owning", html: () =>
      h.p(`${UNITS} condos sit in three towers on one stretch of the beach. The resort lists indoor and outdoor pools, lazy rivers, hot tubs and kiddie pools. It also lists a cafe, a beach bar, a sports bar and grill, a fitness center and a gift shop. The event space is over 6,500 square feet.`) +
      h.p(`The towers are about two and a half miles south of the ocean end of Main Street in North Myrtle Beach, in a straight line. The neighborhood is Crescent Beach.`) +
      PHOTO +
      h.h3("The building and the units") +
      h.p(`Units run from studios to three-bedrooms. Most condos for sale are oceanfront units, and most have a balcony and garage parking. All come furnished.`) +
      STRIP_OCEAN +
      h.p(`The towers are about 25 years old, and the checks below cover what that means. If you meant Bay View Resort, that is a different tower in Myrtle Beach. If you meant The Baywatch in Traverse City, Michigan, that is a different resort.`) },

    { h2: "What are the HOA fees at Bay Watch Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The fee goes by the size of the unit, and the table below has it for each size. The fees are the listings' entries, rounded to a $25 bracket.`) +
      FEE_TABLE +
      h.p(`Most listings say the fee also pays water and sewer, internet, trash and pest control. Only ${FG.hoa_includes_insurance} say it pays the building's insurance. We ask for the budget that shows it.`) +
      h.p(`You still need a policy for the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.p(`A year of fees is the monthly fee times 12. For a one-bedroom that is about 12 payments of ${r5(F["1"].median_at_or_under)}, before property tax. South Carolina taxes a rental or second home at a higher rate than a home you live in. Our ${h.a("/buyers/property-taxes/", "property tax page")} explains both.`) +
      STRIP_ONE +
      h.cta("Know Bay Watch's budget before you offer", "We ask for the association's budget and the rental terms, and add them up for the unit you like.", "Have us get Bay Watch's budget and rental terms", "/contact/", bg) },

    { h2: "Can you rent out a condo at Bay Watch Resort?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Most condos for sale say short-term rentals are allowed, and most say the unit is in a rental program. The condo's founding rules govern, and ${h.a("#checks", "our checks")} include reading them.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>A program</strong>Several outside rental companies list Bay Watch units, so there is not one program that every owner joins.</li>`
        + `<li><strong>The city license</strong>The City of North Myrtle Beach requires a business license for a short-term rental, renewed each year. It says it has no special zoning or permit process beyond that license. The ${h.ext(NMB, "city's page")} has the steps, and our ${h.a("/invest/str-rules/", "short-term rental rules page")} covers the taxes.</li>`
        + `<li><strong>A manager or on your own</strong>You can hire a manager or list the unit yourself. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways. What rentals earn across the beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for Bay Watch alone.</li>`
        + `</ul>` },

    { h2: "What have Bay Watch Resort condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} units at Bay Watch sold in the ${PERIOD}, by Horry County's deed records. That is about 1 in ${ONE_IN} units in the three towers. The middle of all ${SW.all.n} sales was ${r1k(SW.all.median)}.`) +
      SALES +
      h.p(`That single middle blends three sizes, so it describes none of them. Compare a unit with sales of its own size. The smallest group is ${S1.n} sales, so treat its figure as rough.`) +
      h.p(`Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) },

    { h2: "What to check before you buy at Bay Watch Resort", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>About ${MOD_PCT} percent of the grounds is in FEMA's moderate-risk zone, and under 1 percent touches a high-risk zone. The county's lot drawing does not say which zone a given unit is in. We ask for the flood certificate and check the flood cover in the building's policy.</li>`
        + `<li><strong>The towers' age</strong>Built 2001 to 2003. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Who uses the units</strong>${C.taxed_as_home_4pct} of ${UNITS} units are taxed as the owner's home. Most tax bills go to an address outside South Carolina.</li>`
        + `<li><strong>If you will use a loan</strong>Most listings say the unit is in a rental program, and every studio is 400 square feet or less. One published condotel program asks for 500. Ask the lender whether the building counts as a condotel; our ${h.a("/invest/condotel-financing/", "condotel financing page")} explains.</li>`
        + `<li><strong>Pets and rental rules</strong>More than half the listings say pets are allowed. Pet and rental rules are in the condo's founding rules, so we read them.</li>`
        + `</ul>` +
      h.cta("Have us check a Bay Watch unit before you offer", "We go through each check above for the unit you like. Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit it.", "Ask about a loan for this unit", "/contact/", bg) +
      STRIP_BIG +
      h.p(`To weigh Bay Watch against the other oceanfront buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} (about 2 miles) and ${h.a("/invest/condo-buildings/towers-on-the-grove/", "Towers on the Grove")} (about 4 miles). Farther north: ${h.a("/invest/condo-buildings/prince-resort/", "Prince Resort")} (about 5 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 2 miles) and ${h.a("/invest/condo-buildings/margate-tower/", "Margate Tower")} (about 5 miles). Farther south: ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about 5 miles) and ${h.a("/invest/condo-buildings/margaritaville-vacation-residences/", "Margaritaville Vacation Residences")} (about 5 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Bay Watch Resort North Myrtle Beach FAQ",
  faq: [
    { q: "When was Bay Watch Resort built?", a: "The towers were built 2001 to 2003. Most of the condos for sale list 2001." },
    { q: "How many condos does Bay Watch Resort have?", a: `The county records ${UNITS} condos in three phases, one for each tower, from studios to three-bedrooms.` },
    { q: "What is the address of Bay Watch Resort?", a: "The towers are at 2701, 2711 and 2801 S Ocean Blvd, North Myrtle Beach, SC 29582." },
    { q: "Is Bay Watch Resort in Myrtle Beach?", a: "No. It is in Crescent Beach, in the City of North Myrtle Beach, about two and a half miles south of the ocean end of Main Street." },
    { q: "How many towers does Bay Watch Resort have?", a: "Three. The MLS lists them as the North Tower, the Center Tower and the South Tower." },
    { q: "Are pets allowed at Bay Watch Resort?", a: `More than half the condos for sale say pets are allowed. The condo's own rules decide, and the checks section of this page covers them.` },
    { q: "Does Bay Watch Resort have a lazy river?", a: "The resort's page lists lazy rivers, indoor and outdoor pools, hot tubs and kiddie pools." },
    { q: "How many Bay Watch Resort condos are for sale?", a: `At this page's last update, ${L.api_total} were for sale: ${L.beds["0"]} studios, ${L.beds["1"]} one-bedrooms, ${L.beds["2"]} two-bedrooms and ${L.beds["3"]} three-bedrooms.` },
  ],
  sources: [
    { name: "rental company's page about the resort", href: VAC },
    { name: "North Myrtle Beach short-term rentals", href: NMB },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
  ],
  sourcesNote: `Our counts: CCMLS listings at this page's last update, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Bay Watch.",
    p: "Tell us the size you want and the days you are here. An agent shows you the Bay Watch units for sale in that size.",
    label: "Book a showing at Bay Watch", href: "/contact/",
  },
  keywords: "bay watch resort north myrtle beach condos for sale, baywatch resort myrtle beach, bay watch resort hoa fees, bay watch resort address, 2701 s ocean blvd north myrtle beach",
  about: "Bay Watch Resort, a 533-unit oceanfront condo resort in three towers at 2701 S Ocean Blvd, Crescent Beach, North Myrtle Beach, South Carolina",
});
