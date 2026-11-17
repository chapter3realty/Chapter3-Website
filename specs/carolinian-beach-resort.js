/* /invest/condo-buildings/carolinian-beach-resort/ - the Carolinian Beach Resort, 2504 N Ocean Blvd, Myrtle Beach:
 * what owning a condo there gives you, the HOA fee by unit size and what it pays, renting it by the night (the resort's
 * own program), what units sold for, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N, built from the Palace pilot (specs/palace-resort.js). Version 1, 2026-11-14.
 * Facts: Blog-Brain batches/2026-11-e/carolinian-beach-resort/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md; struck wording in batches/2026-11-e/facts/carolinian-beach-resort-struck.json).
 * Data: data/2026-11-e/carolinian-beach-resort/ (listings.json, county.json, flood.json, tax.json, distances.json).
 * Every count, fee, price, share and chart value is read from those files and checked against its ledger row with
 * must(); a changed file stops the build until a person reads the row again.
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates
 * (data/2026-11-e/carolinian-beach-resort/images/label.py; record in photos.json), until the photo partner's shots arrive.
 * Homes: live strips (G.homesQ), none from the CRM. Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/carolinian-beach-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "carolinian-beach-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TX = read("tax.json"), DI = read("distances.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const must = (ok, msg) => { if (!ok) throw new Error(`carolinian-beach-resort.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 1: one building, 12 for sale, all at 2504 N Ocean Blvd. */
must(L.api_total === 12 && L.at_2504 === 12 && L.subdivision_field["Carolinian Beach Resort"] === 12, "row 1 changed");
/* Row 2 (CORRECTED): 129 condos plus 5 commercial parcels. Write "129 condos", never "134 condos". */
must(C.units === 134 && C.landuse_first_digit["1xx"] === 129 && C.landuse_first_digit["3xx"] === 5, "row 2 changed");
const CONDOS = C.landuse_first_digit["1xx"];
/* Row 3: floors numbered 2 to 21, no 13th, 7 on each floor from 3 up. */
const FLR = C.floors;
must(FLR.top === 21 && FLR.missing_between.join() === "13" && FLR.units_per_floor["3"] === 7 && FLR.units_per_floor["21"] === 7 && FLR.units_per_floor["2"] === 3, "row 3 changed");
must(3 + 7 * (Object.keys(FLR.units_per_floor).length - 1) === CONDOS, "row 3: floors do not add to the condos");
/* Row 4 (CORRECTED): built around 2004, from the listings; no primary source. */
must(L.year_built["2004"] === 11 && L.year_built["2002"] === 1, "row 4 changed");
/* Row 5: 8 one-bedrooms and 4 two-bedrooms, no studios. */
must(L.beds["1"] === 8 && L.beds["2"] === 4 && !L.beds["0"], "row 5 counts changed");
const A = L.asking;
must(A["1"].sqft_range.join() === "620,783" && A["2"].sqft_range.join() === "1069,1123", "row 5 sizes changed");
/* Row 6: the fee by size, to the dollar (bisection). Two-bedrooms: 3 of 4 list a fee. */
const FX = L.fee_exact;
must(FX["1"].n === 8 && FX["1"].lowest === 658 && FX["1"].highest === 726, "row 6 one-bedroom fee changed");
must(FX["2"].n === 3 && FX["2"].lowest === 1139 && FX["2"].highest === 1140, "row 6 two-bedroom fee changed");
const FEE2 = (FX["2"].lowest + FX["2"].highest) / 2;
must(money(Math.round(FEE2)) === "$1,140", "row 6 rounding");
const FEE_YEAR_LO = FX["1"].lowest * 12, FEE_YEAR_HI = FX["1"].highest * 12, FEE_YEAR_2 = FEE2 * 12;
must(r100(FEE_YEAR_LO) === "$7,900" && r100(FEE_YEAR_HI) === "$8,700" && r100(FEE_YEAR_2) === "$13,700", "row 6 yearly changed");
/* Row 7: asking prices now. */
must(A["1"].median === 204950 && A["1"].min === 174900 && A["1"].max === 224900 && A["2"].median === 399900 && A["2"].min === 339000 && A["2"].max === 409000 && A.all.median === 216500, "row 7 changed");
must(A["2"].median / A["1"].median > 1.9 && A["2"].median / A["1"].median < 2.1, "row 7: two-bedrooms no longer ask about twice");
/* Row 8: what the fee pays, by the listings' own flags (of 12). */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 11 && FG.hoa_includes_internet === 10 && FG.hoa_includes_electric === 9 && FG.hoa_includes_trash === 9 && FG.hoa_includes_pest === 8 && FG.hoa_includes_cable === 5 && FG.hoa_includes_insurance === 2, "row 8 changed");
/* Row 9: what the listings say about the units. */
must(FG.str_allowed === 11 && FG.vacation_rental_program === 8 && FG.furnished === 11 && FG.ocean_view === 11 && FG.oceanfront_unit === 4 && FG.balcony === 9 && FG.parking_garage === 10 && FG.pets_allowed === 3, "row 9 changed");
/* Row 15: recorded deeds, the directory's window. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30", "row 15 window changed");
must(SW.all.n === 14 && SW.all.median === 270000 && SW.all.p25 === 190000 && SW.all.p75 === 340400, "row 15 changed");
const ONE_IN = Math.round(CONDOS / SW.all.n);
must(ONE_IN === 9, "row 15 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 17 (CORRECTED): on the 129 condos, 11 are taxed as the owner's home, about 1 in 12. */
must(C.taxed_as_home_4pct === 11 && Math.round(CONDOS / C.taxed_as_home_4pct) === 12, "row 17 changed");
/* Row 18 (CORRECTED): 118 of the 129 at 6 percent; the middle tax about $3,500, the middle half about $2,400 to $3,900. */
must(TX.units_at_6pct === 118 && TX.implied_tax_city_millage.median === 3544, "row 18 changed");
must(r100(TX.implied_tax_city_millage.p25) === "$2,400" && r100(TX.implied_tax_city_millage.p75) === "$3,900", "row 18 middle half changed");
/* The yearly cost by size: the 6 percent rate on the middle asking price, at the city's 254.6 mills (CON row 21), before any exemption. */
const MILLS = 254.6;
const TAXB = [A["1"].median, A["2"].median].map((p) => p * 0.06 * MILLS / 1000);
must(r100(TAXB[0]) === "$3,100" && r100(TAXB[1]) === "$6,100", "yearly tax changed");
const HOLD_LO = FEE_YEAR_LO + TAXB[0], HOLD_HI = FEE_YEAR_HI + TAXB[0], HOLD_2 = FEE_YEAR_2 + TAXB[1];
must(r100(HOLD_LO) === "$11,000" && r100(HOLD_HI) === "$11,800" && r100(HOLD_2) === "$19,800", "yearly totals changed");
/* Row 19 (CORRECTED): flood zones under the lot; no side of the lot is named. */
const zone = (z) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
must(zone("AE").share_of_footprint === 0.124 && zone("AE").attributes.STATIC_BFE === 14 && zone("0.2 PCT ANNUAL CHANCE FLOOD HAZARD").share_of_footprint === 0.395 && FL.share_in_no_zone === 0.481, "row 19 changed");
const AE_PCT = Math.round(zone("AE").share_of_footprint * 100);
/* Row 21 (CORRECTED): straight-line miles to the southwest. */
must(DI.miles["Pier 14"] === 0.89 && DI.miles["SkyWheel"] === 1.01 && DI.miles["Sea Captain's House"] === 0.38, "row 21 changed");
/* Row 25: nothing for sale is under 500 square feet. */
must(A["1"].sqft_range[0] > 500 && A["2"].sqft_range[0] > 500, "row 25 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the Palace's, unchanged).                    */

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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/carolinian-beach-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 5 to 7) and the one chart (row 7).                         */

const FEE_TABLE = compareCards([
  { name: "One-bedroom", bestFor: `${A["1"].sqft_range[0]} to ${A["1"].sqft_range[1]} sq ft`,
    cells: { fee: `${money(FX["1"].lowest)} to ${money(FX["1"].highest)}`, year: `${r100(FEE_YEAR_LO)} to ${r100(FEE_YEAR_HI)}`, ask: `About ${r1k(A["1"].median)}`, sale: `${L.beds["1"]}` } },
  { name: "Two-bedroom", bestFor: `${n(A["2"].sqft_range[0])} to ${n(A["2"].sqft_range[1])} sq ft`,
    cells: { fee: `About ${money(Math.round(FEE2))}`, year: `About ${r100(FEE_YEAR_2)}`, ask: `About ${r1k(A["2"].median)}`, sale: `${L.beds["2"]}` } },
], [
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "year", label: "Fees a year", num: true },
  { key: "ask", label: "Middle asking price", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At the Carolinian, the fee goes by the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

const ASK_CHART = G.bars([
  { name: `One-bedroom (${L.beds["1"]} for sale)`, value: A["1"].median, valueText: `About ${r1k(A["1"].median)}` },
  { name: `Two-bedroom (${L.beds["2"]} for sale)`, value: A["2"].median, valueText: `About ${r1k(A["2"].median)}` },
], {
  caption: "Two-bedrooms at the Carolinian ask about twice what one-bedrooms ask",
  nameLabel: "Units", valueLabel: "Middle asking price", compact: true, max: Math.round(A["2"].median * 1.25),
  note: `Asking prices on ${RUN}. One-bedrooms asked from ${r1k(A["1"].min)} to ${r1k(A["1"].max)}; two-bedrooms from ${r1k(A["2"].min)} to ${r1k(A["2"].max)}. Asking prices are not sale prices.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.carolinianbeachresort.com/";
const AMENITIES = "https://www.carolinianbeachresort.com/features/amenities/";
const POLICIES = "https://www.carolinianbeachresort.com/policies/";
const PRIVILEGES = "https://www.carolinianbeachresort.com/features/privileges/";
const PROGRAM = "https://www.carolinianbeachresort.com/rental-program/";
const DIRECTIONS = "https://www.carolinianbeachresort.com/directions/";
const BROKER = "https://www.beachproteam.com/subdivisions/view/carolinian-beach-resort-myrtle-beach-condos-for-sale";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const OSM = "https://www.openstreetmap.org/";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "The Carolinian Beach Resort", alternateName: ["The Carolinian", "Carolinian Beach Resort Myrtle Beach"],
  description: `An oceanfront condo tower with ${CONDOS} condos on North Ocean Boulevard in Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "2504 N Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips (owner, 2026-11-14): the houses, not a "send me" offer. Searches checked 2026-11-14 at /homes/api/strip. */
const STRIP = G.homesQScript() + G.homesQ("subdivision=Carolinian", "Own a condo at the Carolinian, steps from the sand");
const STRIP_2BD = G.homesQ("subdivision=Carolinian&beds=2", "Two-bedroom condos at the Carolinian");
const STRIP_PROGRAM = G.homesQ("subdivision=Carolinian&has=vacation_rental_program", "Carolinian condos whose listings mention a rental program");
const STRIP_NEAR = G.homesQ(`near=${FL.footprint_center[0]},${FL.footprint_center[1]}&miles=1&type=condo&has=oceanfront_building`, "Condos in oceanfront buildings within a mile of the Carolinian");

const TITLE = `Carolinian Beach Resort Myrtle Beach Condos: Fees From ${money(FX["1"].lowest)}`;
must(TITLE.length <= 62, `title is ${TITLE.length} characters`);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: TITLE,
  description: `The Carolinian Beach Resort, 2504 N Ocean Blvd, Myrtle Beach: HOA fees by unit size, what they pay, nightly rentals, and what ${SW.all.n} units sold for.`,
  ogTitle: "The Carolinian Beach Resort, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "The Carolinian",
  eyebrow: "Carolinian Beach Resort, Myrtle Beach",
  h1: "The Carolinian Beach Resort, Myrtle Beach: owning a condo on the ocean.",
  h1em: "A lazy river on the oceanfront pool deck.",
  sub: `${CONDOS} condos at 2504 N Ocean Blvd, a fee that covers water, internet and, in most listings, electric, a lazy river and a rental program.`,
  heroMedia: glance([
    { icon: "beach", label: "On the ocean", text: "Oceanfront pool deck" },
    { icon: "home", label: "Condos", text: `${CONDOS}` },
    { icon: "calendar", label: "Built", text: "Around 2004" },
    { icon: "key", label: "Nightly rentals", text: "Resort program" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The Carolinian Beach Resort is a tower on the ocean at 2504 N Ocean Blvd in Myrtle Beach, built around 2004. It holds ${CONDOS} condos you can own, mostly one- and two-bedrooms. The middle sale price over the past year was about ${r5k(SW.all.median)}.`,
    `The monthly HOA fee is ${money(FX["1"].lowest)} to ${money(FX["1"].highest)} for the one-bedrooms for sale and about ${money(Math.round(FEE2))} for the two-bedrooms. Most listings say it covers water, internet and electric, and units rent by the night through the resort's own program.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">The Carolinian is one of 47 buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at the Carolinian?", toc: "Owning here", id: "owning", html: () =>
      h.p(`The oceanfront pool deck has a lazy river, a winding channel you float around on an inner tube. The resort encloses it for part of the year. Beside it are an outdoor pool, a hot tub and a kiddie pool, and the beach is steps away.`) +
      h.p(`The resort also lists a fitness center, a minimart and coin laundry. Whether owners use the lazy river and the rest on the same terms as guests is in the association's rules, and we ask before you offer.`) +
      h.h3("A tower with floors numbered to 21") +
      h.p(`Floors are numbered up to ${FLR.top}, and none is numbered 13. Every floor from the 3rd up has ${FLR.units_per_floor["3"]} condos, and the 2nd floor has ${FLR.units_per_floor["2"]}. That makes ${CONDOS} condos in all.`) +
      h.p(`Pier 14 is ${DI.miles["Pier 14"]} mile down the beach to the southwest, and the SkyWheel is about a mile, both in a straight line. The Patricia Grand, at 2710 N Ocean Blvd, is two blocks north.`) +
      PHOTO +
      h.p(`Nearly all the condos for sale on ${RUN} came furnished and were listed with an ocean view, and ${FG.oceanfront_unit} were oceanfront units. Most have a balcony and covered garage parking.`) +
      h.p(`The tower dates from about 2004. Its reserve study and budgets are on our checklist in the last section.`) +
      STRIP_NEAR },

    { h2: "What are the HOA fees at the Carolinian Beach Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`At the Carolinian, the HOA fee for the one-bedrooms for sale is ${money(FX["1"].lowest)} to ${money(FX["1"].highest)} a month, and about ${money(Math.round(FEE2))} for the two-bedrooms. A one-bedroom's fee does not rise with its size: the smallest and the largest list the same range.`) +
      FEE_TABLE +
      h.p(`The listings say what the fee pays. Nearly all say water and sewer and internet, and most say electric and trash. Fewer than half say cable, and almost none says the building's insurance, so we read the building's policy before you offer.`) +
      h.p(`You also need your own policy on the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      STRIP_2BD +
      h.h3("What a year costs before any loan") +
      h.p(`The table adds the fees to the property tax, before your unit's own insurance.`) +
      h.table(["Each year, at the middle asking price", "One-bedroom", "Two-bedroom"], [
        ["HOA fees", `${r100(FEE_YEAR_LO)} to ${r100(FEE_YEAR_HI)}`, r100(FEE_YEAR_2)],
        ["Property tax as a rental, before any exemption", r100(TAXB[0]), r100(TAXB[1])],
        ["<strong>About</strong>", `<strong>${r100(HOLD_LO)} to ${r100(HOLD_HI)}</strong>`, `<strong>${r100(HOLD_2)}</strong>`],
      ]) +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value, and a sale resets the value to about the price. Nearly all the condos are taxed at that rate, and the county's bills today have a middle of about ${r100(TX.implied_tax_city_millage.median)} a year, before any credit. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.cta("Know the Carolinian's fees before you offer", "We ask the association for its budget, its reserve study and the unit's dues, and add them up for you.", "Have us get the Carolinian's budget", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at the Carolinian Beach Resort?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes, through the resort's own program or on your own. ${FG.str_allowed} of the ${L.api_total} condos for sale on ${RUN_MD} say short-term rentals are allowed, and ${FG.vacation_rental_program} say they are in a rental program.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's own program</strong>Oceana Resorts runs an on-site rental program with a front desk, housekeeping and maintenance. It sends monthly owner statements, pays the rent by direct deposit and reports it on an annual 1099. A unit may be promoted on the resort's own sites, Airbnb, VRBO, Booking.com, Expedia and Hotels.com.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`The program does not publish its share of the rent. We get its terms and the unit's booking history for any unit you consider. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways.`) +
      h.p(`We do not say the city's zoning allows nightly rentals here. The lot is in a planned-development district, so we ask the city before you offer.`) +
      STRIP_PROGRAM +
      h.p(`What one-bedrooms and two-bedrooms earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for the Carolinian alone.`) +
      h.h3("What guests get, and the resort's rules") +
      h.p(`Guests who book direct get a $20 breakfast voucher each day, good at Azure, the oceanfront restaurant at the Patricia Grand, two blocks away. It is a guest perk, not an owner benefit.`) +
      h.p(`Check-in is at 4 p.m. Guests under 21 are not admitted unless with an adult. Guests may not bring pets, and service animals are welcome. Guest parking is free in the garage on Withers Drive, one block back and across the street: one pass for a one-bedroom, two for a two-bedroom.`) +
      h.p(`An owner's own rules on pets and parking are in the condo's founding documents. ${FG.pets_allowed} of the ${L.api_total} listings say pets are allowed. We read the rules before you offer.`) },

    { h2: "What have Carolinian Beach Resort condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} Carolinian condos had a recorded sale in the past year by Horry County's deed records. That is about 1 in ${ONE_IN} of the ${CONDOS} condos changing hands in a year.`) +
      h.table(["Carolinian condos", "Price"], [
        ["Middle sale price, past year", `About ${money(SW.all.median)}`],
        ["Middle half of the sales", `About ${r1k(SW.all.p25)} to ${r1k(SW.all.p75)}`],
        [`Middle asking price, ${L.api_total} for sale on ${RUN_SHORT}`, `About ${r1k(A.all.median)}`],
      ]) +
      h.p(`The deeds do not record bedrooms, so the sales mix one- and two-bedrooms. We price a unit from sales of its own size.`) +
      ASK_CHART +
      h.p(`Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) },

    { h2: "What we check before you buy at the Carolinian", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>The county's drawing for the lot shows about ${AE_PCT} percent in FEMA's high-risk zone and about 4 in 10 in its moderate zone. About half is in no mapped zone. We check the flood map for the building itself and the flood cover in the building's policy.</li>`
        + `<li><strong>The building's age</strong>Built around 2004, as the listings say. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Who uses the units</strong>About 1 in 12 condos is taxed as the owner's home. The rest pay the higher rate for second homes and rentals.</li>`
        + `<li><strong>If you will use a loan</strong>In our agents' experience, buildings with a rental program are often non-warrantable, which rules out many standard loans. One published condotel loan program asks for at least 500 square feet. Every condo for sale here is over that, the smallest at ${A["1"].sqft_range[0]}.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Carolinian unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.cta("Have us check a Carolinian unit before you offer", "We go through each check above for the unit you like, and we get the rental program's terms and the unit's booking history.", "Have us check a Carolinian unit", "/contact/", bg) +
      h.p(`To weigh the Carolinian against the other 46 buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (under half a mile) and ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 2 miles). Farther north: ${h.a("/invest/condo-buildings/caravelle-resort/", "Caravelle Resort")} (about 3 miles) and ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 4 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 2 miles) and ${h.a("/invest/condo-buildings/sea-mist-resort/", "Sea Mist Resort")} (about 3 miles). Farther south: ${h.a("/invest/condo-buildings/landmark-resort/", "Landmark Resort")} (about 3 miles) and ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (about 3 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Carolinian Beach Resort Myrtle Beach FAQ",
  faq: [
    { q: "When was the Carolinian Beach Resort built?", a: "The listings say about 2004, and a broker page says it was completed in late 2004. The county's records do not show a year built." },
    { q: "How many floors does the Carolinian have?", a: `Floors are numbered up to ${FLR.top}, and none is numbered 13. The county records ${CONDOS} condos in the building.` },
    { q: "Is the Carolinian a hotel or condos?", a: `Both. Its ${CONDOS} condos are owned one by one, and the resort's own rental program rents many of them to guests by the night.` },
    { q: "Is there a lazy river at the Carolinian Beach Resort?", a: "Yes. The oceanfront pool deck has a winding lazy river with inner tubes, which the resort encloses for part of the year." },
    { q: "Is the Carolinian Beach Resort pet friendly?", a: `Guests may not bring pets, and service animals are welcome. An owner's own pet rules are in the condo's founding documents, and ${FG.pets_allowed} of the ${L.api_total} listings say pets are allowed. We read the rules before you offer.` },
    { q: "Where do you park at the Carolinian Beach Resort?", a: "Guest parking is free in the garage on Withers Drive, one block back and across the street from the resort. An owner's parking is in the condo's own documents." },
    { q: "What is the address of the Carolinian Beach Resort?", a: "The county and the listings use 2504 N Ocean Blvd, Myrtle Beach, SC 29577. The resort's own pages write 2506 N Ocean Blvd." },
    { q: "How many Carolinian Beach Resort condos are for sale?", a: `On ${RUN}, ${L.api_total} Carolinian condos were for sale: ${L.beds["1"]} one-bedrooms and ${L.beds["2"]} two-bedrooms.` },
  ],
  sources: [
    { name: "Carolinian Beach Resort", href: RESORT },
    { name: "amenities", href: AMENITIES },
    { name: "guest policies", href: POLICIES },
    { name: "guest privileges", href: PRIVILEGES },
    { name: "rental program", href: PROGRAM },
    { name: "directions", href: DIRECTIONS },
    { name: "broker page", href: BROKER },
    { name: "OpenStreetMap", href: OSM },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at the Carolinian.",
    p: "Tell us the size you want and the days you are here. An agent shows you the Carolinian units for sale in that size.",
    label: "Book a showing at the Carolinian", href: "/contact/",
  },
  keywords: "Carolinian Beach Resort condos for sale, Carolinian Beach Resort HOA fees, Carolinian Beach Resort Airbnb, Carolinian Beach Resort Myrtle Beach, 2504 N Ocean Blvd Myrtle Beach, Carolinian Beach Resort lazy river, when was the Carolinian Beach Resort built",
  about: "The Carolinian Beach Resort, a 129-condo oceanfront tower at 2504 N Ocean Blvd, Myrtle Beach, South Carolina",
});
