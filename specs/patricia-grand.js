/* /invest/condo-buildings/patricia-grand/ - the Patricia Grand, 2710 N Ocean Blvd, Myrtle Beach: the monthly HOA fee by
 * unit size and what the listings say it covers, renting a unit by the night, what units sold for, and what we check
 * before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. Model: specs/palace-resort.js.
 * Facts: Blog-Brain batches/2026-11-e/patricia-grand/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * wording only (VERIFY.md). STRUCK, never printed: the year built (row 20), the hotel's amenities, rooms and height
 * (rows 4, 21), any rental manager's name (row 22). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-e/patricia-grand/ (listings.json, county.json, flood.json, tax.json, distances.json, photos.json).
 * Every count, fee, price, share and distance is read from those files and checked against its ledger row with must().
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates
 * (data/2026-11-e/patricia-grand/images/label.py; record in photos.json), until the photo partner's shots arrive.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/patricia-grand/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "patricia-grand");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TX = read("tax.json"), DI = read("distances.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
/* Fees are known to the dollar (row 8), so every fee prints exactly; a rounded top end would pass the real one. */
const r100 = (v) => money(Math.round(v / 100) * 100);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`patricia-grand.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Rows 2 (CORRECTED) and 12: 142 county units, 139 of them residential condos, 3 commercial. */
must(C.units === 142 && C.landuse_first_digit["1xx"] === 139 && C.landuse_first_digit["3xx"] === 3, "row 2 changed");
const UNITS = C.units, CONDOS = C.landuse_first_digit["1xx"];
/* Row 3: floors 2 to 19, none numbered 13. */
const FLR = C.floors;
must(FLR.top === 19 && FLR.missing_between.join() === "13" && FLR.count === 17 && FLR.numbers[0] === 2, "row 3 floors changed");
/* Row 5: distances, straight line. */
const MI = DI.miles;
must(MI["Pier 14"] === 1.08 && MI["SkyWheel"] === 1.2 && MI["2nd Avenue Pier"] === 2.04 && MI["Family Kingdom"] === 2.36, "row 5 distances changed");
/* Rows 6 and 7: for sale now, by size. */
const A = L.asking;
must(L.api_total === 10 && L.beds["0"] === 5 && L.beds["1"] === 5 && !L.beds["2"], "row 6 counts changed");
must(A.all.median === 197249.5 && A.all.min === 179900 && A.all.max === 275000, "row 7 all changed");
must(A["0"].median === 184999 && A["0"].min === 179900 && A["0"].max === 210000 && A["0"].sqft_range.join() === "360,425", "row 7 studio changed");
must(A["1"].median === 214000 && A["1"].min === 194500 && A["1"].max === 275000 && A["1"].sqft_range.join() === "520,692", "row 7 one-bedroom changed");
/* Row 8: the fee by size, to the dollar (bisection). The ranges must not overlap. */
const FX = L.fee_exact;
must(FX["0"].n === 5 && FX["0"].lowest === 649 && FX["0"].highest === 814, "row 8 studio fee changed");
must(FX["1"].n === 5 && FX["1"].lowest === 969 && FX["1"].highest === 1303, "row 8 one-bedroom fee changed");
must(FX["0"].highest < FX["1"].lowest, "row 8: the studio and one-bedroom fees overlap");
/* Row 9: a year of fees, to $100. */
const FEE_YEAR = { "0": [FX["0"].lowest * 12, FX["0"].highest * 12], "1": [FX["1"].lowest * 12, FX["1"].highest * 12] };
must(r100(FEE_YEAR["0"][0]) === "$7,800" && r100(FEE_YEAR["0"][1]) === "$9,800" && r100(FEE_YEAR["1"][0]) === "$11,600" && r100(FEE_YEAR["1"][1]) === "$15,600", "row 9 changed");
/* Row 11: what the fee covers, by the listings' own flags. */
const FG = L.flags;
must(FG.hoa_includes_utilities === 10 && FG.hoa_includes_water_sewer === 10 && FG.hoa_includes_insurance === 10 && FG.hoa_includes_internet === 10 && FG.hoa_includes_electric === 9 && FG.hoa_includes_trash === 9, "row 11 changed");
/* Row 13: rentals, by the listings' flags (agent-ticked) and the city's zoning district. */
must(FG.str_allowed === 9 && FG.vacation_rental_program === 10 && FG.rentals_allowed === 10, "row 13 changed");
must(JSON.parse(fs.readFileSync(path.join(DATA, "raw", "city-zoning-point.json"), "utf8")).features[0].attributes.ZONING_DIS === "MUH", "row 13 zoning changed");
/* Row 14 (CORRECTED): owners of the 139 residential condos. */
must(C.taxed_as_home_4pct === 1, "row 14 home count changed");
/* Row 15 (CORRECTED): one window, the directory's. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30", "row 15 window changed");
must(SW.all.n === 5 && SW.all.median === 220000 && SW.all.p25 === 182500 && SW.all.p75 === 242500 && SW.all.min === 180000 && SW.all.max === 260000, "row 15 changed");
const ONE_IN = Math.round(CONDOS / SW.all.n);
must(ONE_IN === 28, "row 15 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 18 (VERIFIED with a limit): the yearly tax at the rental rate, City of Myrtle Beach 254.6 mills, at the middle
   asking price; today's owners pay less because of the assessment cap. */
const MILLS = 254.6;
must(TX.units_at_6pct === 138 && TX.implied_tax_city_millage.median === 1881 && TX.taxable_below_market_share === 0.761, "row 18 changed");
const TAXQ = [A["0"].median, A["1"].median].map((p) => p * 0.06 * MILLS / 1000);
must(r100(TAXQ[0]) === "$2,800" && r100(TAXQ[1]) === "$3,300", "row 18 tax at asking changed");
const HOLD = { "0": [FEE_YEAR["0"][0] + TAXQ[0], FEE_YEAR["0"][1] + TAXQ[0]], "1": [FEE_YEAR["1"][0] + TAXQ[1], FEE_YEAR["1"][1] + TAXQ[1]] };
must(r100(HOLD["0"][0]) === "$10,600" && r100(HOLD["0"][1]) === "$12,600" && r100(HOLD["1"][0]) === "$14,900" && r100(HOLD["1"][1]) === "$18,900", "row 18 totals changed");
/* Row 19: flood zones under the lot. */
const zone = (z) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
must(zone("AE").share_of_footprint === 0.557 && zone("AE").attributes.STATIC_BFE === 14 && zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint === 0.443 && FL.share_in_no_zone === 0, "row 19 changed");
const AE_PCT = Math.round(zone("AE").share_of_footprint * 100), X_PCT = 100 - AE_PCT;
/* Row 23: pets, a listing flag only. */
must(FG.pets_allowed === 10, "row 23 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const word = (k) => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][k];

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the Palace page's, unchanged).               */

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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/patricia-grand-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 7, 8, 9).                                                  */

const SIZES = [{ name: "Studio", k: "0" }, { name: "One-bedroom", k: "1" }];
const FEE_TABLE = compareCards(SIZES.map((s) => ({
  name: s.name,
  bestFor: `${A[s.k].sqft_range[0]} to ${A[s.k].sqft_range[1]} sq ft`,
  cells: {
    fee: `${money(FX[s.k].lowest)} to ${money(FX[s.k].highest)}`,
    year: `${r100(FEE_YEAR[s.k][0])} to ${r100(FEE_YEAR[s.k][1])}`,
    ask: `About ${r1k(A[s.k].median)}`,
    sale: `${L.beds[s.k]}`,
  },
})), [
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "year", label: "Fees a year", num: true },
  { key: "ask", label: "Middle asking price", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At the Patricia Grand, the fee goes by the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";

/* ---------------------------------------------------------------------------- */
/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "The Patricia Grand", alternateName: ["Patricia Grand", "Patricia Grand Myrtle Beach"],
  description: `An oceanfront condo building with ${CONDOS} condos on North Ocean Boulevard in Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "2710 N Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips (round 2, owner 2026-11-14). The MLS spells the building "Patricia Grand I"; the search word matches it. */
const STRIP = G.homesQScript() + G.homesQ("subdivision=Patricia Grand", "Own a condo at the Patricia Grand, on the ocean in Myrtle Beach");
const STRIP_UNDER = G.homesQ("subdivision=Patricia Grand&max=200000", "Patricia Grand condos for $200,000 or less");
const STRIP_NEAR = G.homesQ(`near=${FL.footprint_center[0]},${FL.footprint_center[1]}&miles=1&type=condo&has=oceanfront_unit`, "Oceanfront condos within a mile of the Patricia Grand");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Patricia Grand Myrtle Beach Condos for Sale: Fees From ${money(FX["0"].lowest)}`,
  description: `The Patricia Grand, 2710 N Ocean Blvd, Myrtle Beach: HOA fees by unit size, what the fee covers, nightly rentals, and what ${SW.all.n} units sold for.`,
  ogTitle: "The Patricia Grand, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "The Patricia Grand",
  eyebrow: "Patricia Grand, Myrtle Beach",
  h1: "The Patricia Grand, Myrtle Beach: owning a studio or one-bedroom on the ocean.",
  h1em: `A studio's HOA fee tops out at ${money(FX["0"].highest)} a month. A one-bedroom's starts at ${money(FX["1"].lowest)}.`,
  sub: `Condos for sale at 2710 N Ocean Blvd. This page is for owners and buyers. To book a stay, ask the resort or a booking site.`,
  heroMedia: glance([
    { icon: "beach", label: "On the beach", text: "2710 N Ocean Blvd" },
    { icon: "home", label: "County units", text: `${UNITS}, ${CONDOS} condos` },
    { icon: "key", label: "For sale now", text: "Studios, one-bedrooms" },
    { icon: "calendar", label: "Fee", text: "Power, per listings" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The Patricia Grand is an oceanfront condo building at 2710 N Ocean Blvd in Myrtle Beach. The county counts ${UNITS} units, ${CONDOS} of them condos. The ${L.api_total} for sale on ${RUN_MD} are studios and one-bedrooms asking ${r1k(A.all.min)} to ${r1k(A.all.max)}.`,
    `The monthly HOA fee depends on the unit's size: ${money(FX["0"].lowest)} to ${money(FX["0"].highest)} for a studio and ${money(FX["1"].lowest)} to ${money(FX["1"].highest)} for a one-bedroom. ${word(SW.all.n)[0].toUpperCase() + word(SW.all.n).slice(1)} units sold by recorded deed in the past year.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">The Patricia Grand is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a unit at the Patricia Grand?", toc: "Owning here", id: "owning", html: () =>
      h.p(`The building stands on North Ocean Boulevard. In a straight line it is about ${Math.round(MI["Pier 14"])} mile from Pier 14 and ${MI["SkyWheel"].toFixed(1)} miles from the SkyWheel. The 2nd Avenue Pier is about ${Math.round(MI["2nd Avenue Pier"])} miles south, and Family Kingdom about ${MI["Family Kingdom"].toFixed(1)} miles.`) +
      PHOTO +
      h.p(`A studio here measures ${A["0"].sqft_range[0]} to ${A["0"].sqft_range[1]} square feet, and a one-bedroom ${A["1"].sqft_range[0]} to ${A["1"].sqft_range[1]}. No two-bedroom was for sale on ${RUN_MD}.`) +
      h.p(`No floor is numbered 13: unit numbers run on floors ${FLR.numbers[0]} to ${FLR.top}. The other ${UNITS - CONDOS} county units are commercial.`) +
      h.p(`The MLS lists the building as "Patricia Grand I."`) },

    { h2: "What are the HOA fees at the Patricia Grand?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The ranges for the two sizes do not overlap, so the fee depends on the unit's size.`) +
      FEE_TABLE +
      h.p(`All ${word(L.api_total)} listings tick water and sewer, building insurance, internet and other utilities. ${word(FG.hoa_includes_electric)[0].toUpperCase() + word(FG.hoa_includes_electric).slice(1)} tick electricity, and ${word(FG.hoa_includes_trash)} tick trash and pest control. The boxes are what each listing agent ticked, so we confirm the fee's coverage with the association before an offer. You still need your own policy on the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      STRIP_UNDER +
      h.h3("What a year costs before any loan") +
      h.p(`A studio costs more than $10,000 a year to hold in fees and property tax, before your unit\'s own insurance.`) +
      h.table(["Each year, at the middle asking price", "Studio", "One-bedroom"], [
        ["HOA fees", `${r100(FEE_YEAR["0"][0])} to ${r100(FEE_YEAR["0"][1])}`, `${r100(FEE_YEAR["1"][0])} to ${r100(FEE_YEAR["1"][1])}`],
        ["Property tax as a rental, before any credit", r100(TAXQ[0]), r100(TAXQ[1])],
        ["<strong>About</strong>", `<strong>${r100(HOLD["0"][0])} to ${r100(HOLD["0"][1])}</strong>`, `<strong>${r100(HOLD["1"][0])} to ${r100(HOLD["1"][1])}</strong>`],
      ]) +
      h.p(`The tax row is what a buyer would pay on a rental or second home. South Carolina taxes those on 6 percent of value, and a sale resets the value to about the price. Owners who bought years ago pay less, about ${r100(TX.implied_tax_city_millage.median)} in the middle, because a cap limits how fast their value rises. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.cta("Know the Patricia Grand's fees before you offer", "We ask the association for the unit's dues, its budget, its reserve study and any assessment, and add them up for you.", "Have us get the Patricia Grand's budget", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at the Patricia Grand?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Most likely yes. The building is in the City of Myrtle Beach's MUH zoning district, which the city's map shades for nightly rentals. The listings back that up.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>What the listings flag</strong>${word(FG.str_allowed)[0].toUpperCase() + word(FG.str_allowed).slice(1)} of the ${word(L.api_total)} listings are flagged as allowing short-term rentals, and all ${word(L.api_total)} are flagged as part of a vacation rental program. The listings do not say who runs that program or what it pays an owner.</li>`
        + `<li><strong>Who owns here</strong>Only ${C.taxed_as_home_4pct} of the ${CONDOS} condos is taxed as an owner's home. About 7 in 10 have an owner mailing address outside South Carolina. A mailing address is not where someone lives, but the building is run mostly for renters and visitors.</li>`
        + `<li><strong>Pets</strong>All ${word(L.api_total)} listings flag pets as allowed. The flag does not say which pets or whether guests may bring them. The association's rules decide, and we read them before you offer.</li>`
        + `</ul>` +
      h.p(`We read the documents and get the program's terms for any unit you consider, and we do not guess. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`The license and the lodging taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}. What rentals earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for the Patricia Grand alone.`) },

    { h2: "What have Patricia Grand condos sold for?", toc: "Sales", id: "sales", html: (bg) =>
      h.p(`${SW.all.n} Patricia Grand condos sold in the ${PERIOD} by Horry County's deed records. That is about 1 in ${ONE_IN} condos in the building changing hands in a year. Five sales is a small number, so read the prices as a range.`) +
      h.table(["Patricia Grand condos", "Price"], [
        ["Middle sale price, past year", `About ${money(SW.all.median)}`],
        ["Middle half of the sales", `About ${r500(SW.all.p25)} to ${r500(SW.all.p75)}`],
        ["Lowest and highest sale", `${money(SW.all.min)} to ${money(SW.all.max)}`],
        [`Middle asking price, ${L.api_total} for sale on ${RUN_SHORT}`, `About ${r1k(A.all.median)}`],
      ]) +
      h.p(`The deeds do not record bedrooms, so we compare a unit with sales of its own size. We price an offer from the recorded sales. Our ${h.a("/sell/home-value/", "home value page")} explains how.`) +
      STRIP_NEAR },

    { h2: "What we check before you buy at the Patricia Grand", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>The whole lot is in a FEMA flood zone. About ${AE_PCT} percent is in the high-risk zone, where a big flood is expected to reach 14 feet above sea level. About ${X_PCT} percent is in the moderate-risk zone. We check the building's flood cover and get the survey that shows how high the unit's floor sits.</li>`
        + `<li><strong>The building's age</strong>The county's parcel records give no year built, so we get it from the association's papers. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Size and loan</strong>Every studio for sale is under 450 square feet. Lenders treat a building with a rental program differently from an ordinary condo. Ask a lender before you choose a studio.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a unit here. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.cta("Have us check a Patricia Grand unit before you offer", "We go through each check above for the unit you like, and we get the rental program's terms.", "Have us check a Patricia Grand unit", "/contact/", bg) +
      h.p(`To weigh the Patricia Grand against other buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 2 miles) and ${h.a("/invest/condo-buildings/caravelle-resort/", "Caravelle Resort")} (about 3 miles). Farther north: ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 4 miles) and ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about 6 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (under a quarter mile) and ${h.a("/invest/condo-buildings/palms-resort/", "The Palms Resort")} (under a quarter mile). Farther south: ${h.a("/invest/condo-buildings/roxanne-towers/", "Roxanne Towers")} (about 1 mile) and ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 2 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Patricia Grand Myrtle Beach FAQ",
  faq: [
    { q: "What is the address of the Patricia Grand?", a: "The Patricia Grand is at 2710 N Ocean Blvd, Myrtle Beach, SC 29577, on the oceanfront." },
    { q: "Is the Patricia Grand a hotel or condos?", a: `Condos, owned one by one. ${word(FG.str_allowed)[0].toUpperCase() + word(FG.str_allowed).slice(1)} of the ${word(L.api_total)} listings on ${RUN_MD} say short-term rentals are allowed.` },
    { q: "How many units are at the Patricia Grand?", a: `The county records ${UNITS} units, ${CONDOS} of them condos. Unit numbers run on floors ${FLR.numbers[0]} to ${FLR.top}, and no floor is numbered 13.` },
    { q: "What is the HOA fee at the Patricia Grand?", a: `For the listings on ${RUN_MD}, ${money(FX["0"].lowest)} to ${money(FX["0"].highest)} a month for a studio and ${money(FX["1"].lowest)} to ${money(FX["1"].highest)} for a one-bedroom. The listings say it includes water, sewer, insurance and internet.` },
    { q: "Can you bring a pet to the Patricia Grand?", a: "All ten listings flag pets as allowed. The flag does not say which pets, and the association's rules decide. We read them before you offer." },
    { q: "How many Patricia Grand condos are for sale?", a: `On ${RUN}, ${L.api_total} were for sale: ${L.beds["0"]} studios and ${L.beds["1"]} one-bedrooms. Asking prices ran from ${r1k(A.all.min)} to ${r1k(A.all.max)}.` },
    { q: "What is the Patricia Grand called in the MLS?", a: `The MLS lists the building as "Patricia Grand I." Searching "Patricia Grand" finds all ${word(L.api_total)} units for sale.` },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at the Patricia Grand.",
    p: "Tell us the size you want and the days you are here. An agent shows you the Patricia Grand units for sale in that size.",
    label: "Book a showing at the Patricia Grand", href: "/contact/",
  },
  keywords: "Patricia Grand Myrtle Beach condos for sale, Patricia Grand condos for sale, Patricia Grand HOA fees, Patricia Grand Myrtle Beach Airbnb, 2710 N Ocean Blvd Myrtle Beach",
  about: "The Patricia Grand, an oceanfront condo building at 2710 N Ocean Blvd, Myrtle Beach, South Carolina",
});
