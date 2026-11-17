/* /invest/condo-buildings/prince-resort/ - Prince Resort, 3500 and 3601 N Ocean Blvd, Cherry Grove, North Myrtle
 * Beach: two towers at the Cherry Grove Pier, the HOA fee by unit size and what the listings say it pays, renting
 * by the night, what units sold for, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. Built from the Palace Resort pilot (specs/palace-resort.js).
 * Facts: Blog-Brain batches/2026-11-e/prince-resort/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * wording only (VERIFY.md; struck wording in batches/2026-11-e/facts/prince-resort-struck.json). Plan: PLAN.md.
 * Data: data/2026-11-e/prince-resort/ (listings.json, county.json, flood.json, tax.json, photos.json; README.md).
 * Every count, fee, price and share is read from those files and checked against its ledger row with must().
 * The lazy river is on tower two, the 3601 side (row 7 CORRECTED). "The fee pays power" is never said as fact:
 * the listings say it, and we confirm it against the budget (row 11 CORRECTED). 250 of 262 units are at the
 * rental rate (row 21 CORRECTED). No sold-against-asking chart: the deeds do not record size, and the units for
 * sale are mostly one-bedrooms, so the two middles are not the same kind of unit.
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates (data/.../images/label.py).
 * Homes: three live strips (G.homesQ), no "send me" offer (owner, 2026-11-14). Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/prince-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "prince-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TX = read("tax.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r50 = (v) => money(Math.round(v / 50) * 50);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`prince-resort.js: ${msg}`); };

/* Row 3 (CORRECTED): 262 units in all; no phase split is printed. */
const UNITS = C.units;
must(UNITS === 262, "row 3 units changed");
/* Row 5: built in 2006 (5) and 2007 (2), by the listings. */
must(L.year_built["2006"] === 5 && L.year_built["2007"] === 2, "row 5 changed");
/* Rows 1, 9: seven for sale, five one-bedrooms and two two-bedrooms. */
const A = L.asking;
must(L.api_total === 7 && L.at_prince === 7 && L.beds["1"] === 5 && L.beds["2"] === 2, "rows 1 and 9 counts changed");
must(A.all.min === 194500 && A.all.max === 350000 && A["1"].min === 194500 && A["1"].max === 249900 && A["2"].min === 318000 && A["2"].max === 350000, "row 9 asking changed");
must(A["1"].sqft_range.join() === "522,740" && A["2"].sqft_range.join() === "1051,1075", "row 9 sizes changed");
/* Row 10: the fee, to the dollar. */
const F1 = L.fee_exact["1"], F2 = L.fee_exact_2br;
must(F1.n === 5 && F1.lowest === 728 && F1.highest === 1035 && F2.n === 2 && F2.lowest === 1560 && F2.highest === 1560, "row 10 fee changed");
must(r5(F1.lowest) === "$730" && r5(F1.highest) === "$1,035" && r5(F2.lowest) === "$1,560", "row 10 rounding");
/* Row 12: a year of fees. */
const Y1 = [F1.lowest * 12, F1.highest * 12], Y2 = F2.lowest * 12;
must(r100(Y1[0]) === "$8,700" && r100(Y1[1]) === "$12,400" && r100(Y2) === "$18,700", "row 12 changed");
/* Row 11 (CORRECTED): what the listings tick. */
const FG = L.flags;
must(["electric", "water_sewer", "trash", "insurance", "internet", "utilities"].every((k) => FG["hoa_includes_" + k] === 7) && FG.hoa_includes_pest === 6, "row 11 changed");
/* Row 13: rentals, by the listings. */
must(FG.str_allowed === 7 && FG.vacation_rental_program === 6, "row 13 changed");
/* Row 14: other flags. */
must(FG.furnished === 7 && FG.balcony === 7 && FG.elevator_building === 7 && FG.covered_parking === 6 && FG.ocean_view === 6 && FG.oceanfront_building === 4, "row 14 changed");
/* Rows 15, 18: sales, the 12 months to 2026-09-30; one bulk deed left out. */
const SW = C.sales_window_1, SU = SW.unit_sales;
must(SW.window === "2025-10-01 to 2026-09-30" && SU.n === 6 && SU.median === 365000 && SU.min === 220000 && SU.max === 385000 && SW.bulk_deeds === 1, "row 15 changed");
const ONE_IN = Math.round(UNITS / SU.n);
must(SU.n === 6 && ONE_IN === 44, "row 15 share changed");
/* Row 17 (CORRECTED): the current owner's mailing state on 5 of the 6 sold units. */
must(SW.buyer_tax_bill_out_of_sc === 5 && SW.buyer_tax_bill_in_sc === 1, "row 17 changed");
/* Row 19: two companies hold 134 of 262. */
const OWN = fs.readFileSync(path.join(DATA, "raw", "owner-concentration.txt"), "utf8");
must(/86\b/.test(OWN) && /\b48\b/.test(OWN) && 86 + 48 === 134 && Math.round(134 / UNITS * 100) === 51, "row 19 changed");
/* Row 20: owners with a mailing address outside South Carolina. */
must(C.owner_out_of_sc === 99, "row 20 changed");
/* Row 21 (CORRECTED): 250 of 262 at the 6 percent rate, 12 at 4 percent. */
must(C.taxed_at_6pct === 250 && C.taxed_at_4pct === 12 && C.taxed_at_6pct + C.taxed_at_4pct === UNITS, "row 21 changed");
/* Rows 22, 23: the yearly tax at 221.2 mills and 6 percent, on the county's taxable value. */
const IT = TX.implied_tax_city_millage;
must(IT.median === 3053 && IT.p25 === 2533 && IT.p75 === 3816 && TX.taxable_value.median === 230000, "row 22 changed");
must(Math.round(TX.taxable_below_market_share * 100) === 74, "row 23 changed");
const HOLD1 = [Y1[0] + IT.median, Y1[1] + IT.median];
must(r100(HOLD1[0]) === "$11,800" && r100(HOLD1[1]) === "$15,500", "row 22 totals changed");
/* Row 24: flood zones. */
const zone = (z) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
must(zone("AE").share_of_footprint === 0.841 && zone("VE").share_of_footprint === 0.159 && FL.share_in_no_zone === 0 && zone("AE").attributes.STATIC_BFE === 11, "row 24 changed");
const AE_PCT = Math.round(zone("AE").share_of_footprint * 100), VE_PCT = Math.round(zone("VE").share_of_footprint * 100);
/* Row 25: the footprint centre, for the near strip and the Place. */
const [LAT, LNG] = FL.footprint_center;
must(LAT === 33.830662 && LNG === -78.633242, "row 25 changed");
const NEAR = `${LAT.toFixed(4)},${LNG.toFixed(4)}`;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
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
  + `${S} .c3-pr-herophoto .c3ph-cr{left:.6rem!important;right:auto!important}${S} .c3-pr-bodyphoto{display:none}@media (max-width:699px){${S} .c3-pr-herophoto{display:none}${S} .c3-pr-bodyphoto{display:block}}`
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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/prince-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
/* Review 1: the aerial moves into the hero, so the first screen has the picture (the lazy river is in it). */
const BASE = "/images/2026-11-e/prince-resort/prince-resort-from-above";
const PHOTO_RAW = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
/* Wide screens: the hero shows the 16:9 crop that keeps both tower labels whole (review 1). Phones: the first screen
   stays for the answer, so the full picture sits at the start of "owning" instead. */
const PHOTO_HERO = PHOTO_RAW
  .replace(/<img src="[^"]+" srcset="[^"]+"/, `<img src="${BASE}-16x9.webp" srcset="${BASE}-16x9.webp 1200w"`)
  .replace('width="1200" height="900"', 'width="1200" height="675"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero c3-pr-herophoto" style="margin:0 0 1.2rem;');
const PHOTO_BODY = PHOTO_RAW.replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero c3-pr-bodyphoto" style="margin:1.2rem 0 1.4rem;');
const PHOTO = PHOTO_HERO;
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 9, 10, 12): two sizes, one table.                          */

const FEE_TABLE = compareCards([
  { name: "One-bedroom", bestFor: `${A["1"].sqft_range[0]} to ${A["1"].sqft_range[1]} sq ft`,
    cells: { fee: `About ${r5(F1.lowest)} to ${r5(F1.highest)}`, year: `About ${r100(Y1[0])} to ${r100(Y1[1])}`, ask: `${money(A["1"].min)} to ${money(A["1"].max)}`, sale: `${L.beds["1"]}` } },
  { name: "Two-bedroom", bestFor: `${n(A["2"].sqft_range[0])} to ${n(A["2"].sqft_range[1])} sq ft`,
    cells: { fee: `About ${r5(F2.lowest)}`, year: `About ${r100(Y2)}`, ask: `${money(A["2"].min)} to ${money(A["2"].max)}`, sale: `${L.beds["2"]}` } },
], [
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "year", label: "Fees a year", num: true },
  { key: "ask", label: "Asking price", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At Prince Resort, the fee goes by the size of the unit", nameLabel: "Unit", bestForLabel: "Size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.princeresortonline.com/";
const POOLS = "https://www.princeresortonline.com/pools/";
const AMENITIES = "https://www.princeresortonline.com/amenities/";
const PIER = "https://cherrygrovepier.com/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Prince Resort", alternateName: ["Prince Resort at the Cherry Grove Pier", "Prince Resort North Myrtle Beach"],
  description: `Two condo towers beside the Cherry Grove Pier in North Myrtle Beach, South Carolina, with ${UNITS} condos, built in 2006 and 2007.`,
  address: { "@type": "PostalAddress", streetAddress: "3500 N Ocean Blvd", addressLocality: "North Myrtle Beach", addressRegion: "SC", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "City", name: "North Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Round 2 (owner, 2026-11-14): live strips, no "send me" offer. The MLS spells the building "Prince Resort". */
const SUB = "subdivision=Prince Resort";
const STRIP = G.homesQScript() + G.homesQ(SUB, "Own a condo at Prince Resort, by the Cherry Grove Pier");
const STRIP_NEAR = G.homesQ(`type=condo&near=${NEAR}&miles=1&has=water_ocean`, "More oceanfront condos within a mile of the pier");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Prince Resort North Myrtle Beach Condos: HOA Fees From ${r5(F1.lowest)}`,
  description: `Prince Resort at the Cherry Grove Pier, North Myrtle Beach: the HOA fee by size and what it pays, flood zone, nightly rentals, and what ${SU.n} units sold for.`,
  ogTitle: "Prince Resort, Cherry Grove: condos for sale, HOA fees by size, rentals and sales",
  crumb: "Prince Resort",
  eyebrow: "Prince Resort, Cherry Grove",
  h1: "Prince Resort, Cherry Grove: owning a condo by the pier.",
  h1em: "A lazy river on the roof of the tower across the road.",
  sub: `Prince Resort is at 3500 and 3601 N Ocean Blvd, North Myrtle Beach, SC.`,
  heroMedia: PHOTO + glance([
    { icon: "home", label: "Condos", text: `${UNITS} in two buildings` },
    { icon: "calendar", label: "Built", text: "2006 and 2007" },
    { icon: "pool", label: "On the roof", text: "Lazy river" },
    { icon: "beach", label: "Next door", text: "Cherry Grove Pier" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Prince Resort is two condo towers at the Cherry Grove Pier in North Myrtle Beach, with ${UNITS} condos in all. ${SU.n} units sold in the past year, for about ${r1k(SU.median)} in the middle.`,
    `A one-bedroom pays about ${r5(F1.lowest)} to ${r5(F1.highest)} a month in HOA fees, and a two-bedroom about ${r5(F2.lowest)}. We confirm what the fee includes against the budget before an offer.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Prince Resort is one of 47 buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at Prince Resort?", toc: "Owning here", id: "owning", html: () =>
      PHOTO_BODY +
      h.p(`Start with the roof. The tower across the road from the beach has a rooftop pool and a lazy river. The resort says kids can grab a tube and float along it, with views of Cherry Grove Beach.`) +
      h.p(`The tower on the beach side has its own full-size pool, a kiddie pool with an umbrella waterfall and two in-ground hot tubs. `) +
      h.h3("Two towers and a pier") +
      h.p(`The 3500 N Ocean Blvd tower is on the beach side of the road, beside ${h.ext(PIER, "the Cherry Grove Pier")} at 3502. The 3601 tower is across the road.`) +
      h.p(`By unit numbers, the 3500 tower runs from floor ${C.floors.I[0]} to floor ${C.floors.I[1]}, and the 3601 tower from floor ${C.floors.II[0]} to floor ${C.floors.II[1]}. Neither has a floor 13.`) +
      h.p(`All ${L.api_total} condos for sale on ${RUN} came furnished with a balcony, in a building with an elevator. ${FG.covered_parking} have covered parking, and ${FG.ocean_view} were listed with an ocean view.`) +
      "" },

    { h2: "What are the HOA fees at Prince Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The fee goes by the size of the unit. The figures are the ones in the listings, so we confirm them with the association.`) +
      FEE_TABLE +
      h.p(`All ${L.api_total} listings say the fee includes electric, water and sewer, trash, insurance and internet, and ${FG.hoa_includes_pest} add pest control. A listing's agent ticks those boxes, so we check them against the building's budget before an offer.`) +
      h.p(`If it holds, the power bill is part of the fee. You still need your own policy for the inside of the unit; our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("What a year costs before any loan") +
      h.p(`The table adds fees and property tax for a one-bedroom, before your unit's own insurance.`) +
      h.table(["Each year, one-bedroom", "Cost"], [
        ["HOA fees", `${r100(Y1[0])} to ${r100(Y1[1])}`],
        ["Property tax as a rental, before any exemption", `About ${r50(IT.median)}`],
        ["<strong>Fees and tax together</strong>", `<strong>${r100(HOLD1[0])} to ${r100(HOLD1[1])}</strong>`],
      ]) +
      h.h3("How the tax works") +
      h.p(`The tax is for a condo at the county's current taxable value. The middle half of the units ranges from ${r100(IT.p25)} to ${r100(IT.p75)}. A buyer's first bill can be higher, because the county's value for about 3 in 4 units is below its market value, and a sale resets it.`) +
      h.h3("Rental rate and home rate") +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value. ${C.taxed_at_6pct} of the ${UNITS} units are taxed that way, and ${C.taxed_at_4pct} as an owner's home at 4 percent. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.cta("Know Prince Resort's fees before you offer", "We ask the association for the budget, the reserve study and any assessment, and add up the unit's dues for you.", "Have us get the budget and reserve study", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at Prince Resort?", toc: "Renting it", id: "renting", html: (bg) =>
      h.p(`Yes, by the listings. All ${FG.str_allowed} condos for sale on ${RUN_MD} say short-term rentals are allowed, and ${FG.vacation_rental_program} say they are in a vacation rental program. The resort is managed by Myrtle Beach Seaside Resorts.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's rental program</strong>Guests book through the resort. The program does not publish its share of the rent, so we get its terms for any unit you consider.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself. North Myrtle Beach has its own rules, and the license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.h3("Companies that own many units") +
      h.p(`Two companies hold ${86 + 48} of the ${UNITS} units, a little more than half, by the county's owner names. How votes are counted is in the condo's founding rules, and we read them before you offer.`) +
      h.h3("What it earns") +
      h.p(`Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways. What condos earn across the coast is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for Prince Resort alone.`) +
      h.cta("Know the rental terms before you offer", "We get the rental program's terms and a unit's booking history, and set them beside running it on your own.", "Have us get the rental terms and booking history", "/contact/", bg) },

    { h2: "What have Prince Resort condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`Six Prince Resort condos sold in the past year by Horry County's deed records. That is about 1 in ${ONE_IN} units in the building changing hands in a year. One more deed, a bulk transfer of company-held units, is left out.`) +
      h.table(["Prince Resort condos", "Price"], [
        [`Middle sale price, ${PERIOD}`, `About ${r1k(SU.median)}`],
        ["Lowest to highest sale", `${money(SU.min)} to ${money(SU.max)}`],
        [`Asking price, ${L.api_total} for sale on ${RUN_SHORT}`, `${money(A.all.min)} to ${money(A.all.max)}`],
      ]) +
      h.p(`The deeds do not record bedrooms, and ${L.beds["1"]} of the ${L.api_total} condos for sale are one-bedrooms. Asking prices and sales are not the same mix of units. We price an offer from sales of the same size.`) +
      h.p(`On ${SW.buyer_tax_bill_out_of_sc} of the ${SU.n} sold units, the owner's mailing address is outside South Carolina. Selling a unit? Our ${h.a("/sell/home-value/", "home value page")} shows how we price a home.`) },

    { h2: "What we check before you buy at Prince Resort", toc: "Our checks", id: "checks", html: () =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>The county's FEMA flood map layer puts the whole lot in high-risk zones. About ${AE_PCT} percent in the AE class and ${VE_PCT} percent in the VE class, none outside. We read the building's master flood policy and the unit's own cover. Our page on ${h.a("/buyers/flood-zone-check/", "checking a flood zone")} shows how.</li>`
        + `<li><strong>The building's age</strong>Buildings of this age need reserves. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Who owns the units</strong>${UNITS === 262 ? "99" : ""} of the ${UNITS} units have an owner whose mailing address is outside South Carolina. Most pay the rental-rate tax, so a first bill can differ from the one the seller paid.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a unit in a building with a rental program. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      STRIP_NEAR +
      h.p(`To weigh Prince Resort against the other 46 buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. For the town around it, see ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach")}.`) + /* sibling-links */ h.p(`Down the beach to the south: ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} (about 3 miles) and ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 6 miles). Farther south: ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} (about 9 miles) and ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about 10 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Prince Resort FAQ",
  faq: [
    { q: "Is Prince Resort a hotel or condos?", a: `Both. Its ${UNITS} condos are owned one by one. The resort rents rooms to guests, and ${FG.vacation_rental_program} of the ${L.api_total} condos for sale say they are in a rental program.` },
    { q: "What is the address of Prince Resort?", a: "Prince Resort is two buildings at 3500 and 3601 N Ocean Blvd, North Myrtle Beach, SC, next to the Cherry Grove Pier." },
    { q: "Is electric included in the Prince Resort HOA fee?", a: `All ${L.api_total} listings tick that the HOA fee includes electric, water and sewer, trash, insurance and internet. These are agent-ticked fields, so we confirm them against the building's budget before an offer.` },
    { q: "How many Prince Resort condos are for sale?", a: `On ${RUN}, ${L.api_total} Prince Resort condos were for sale: ${L.beds["1"]} one-bedrooms and ${L.beds["2"]} two-bedrooms.` },
    { q: "What are the transfer fee and escrow at Prince Resort?", a: "We have not found a published transfer fee or escrow amount for Prince Resort. We ask the association for both before an offer and give them to you in writing." },
    { q: "Is Prince Resort the same as King and Prince?", a: "No. This page is about Prince Resort at the Cherry Grove Pier, 3500 N Ocean Blvd, North Myrtle Beach. The King and Prince is a different resort." },
  ],
  sources: [
    { name: "Prince Resort", href: RESORT },
    { name: "pools", href: POOLS },
    { name: "amenities", href: AMENITIES },
    { name: "Cherry Grove Pier", href: PIER },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a tour of a Prince Resort unit.",
    p: "Found a unit above that you like? Pick a day, and an agent tours that unit with you.",
    label: "Book a tour of a unit", href: "/contact/",
  },
  keywords: "prince resort, prince resort north myrtle beach condos for sale, prince resort cherry grove, prince resort hoa fees, prince resort airbnb, 3500 n ocean blvd north myrtle beach",
  about: "Prince Resort, two condo towers with 262 condos at 3500 and 3601 N Ocean Blvd beside the Cherry Grove Pier, North Myrtle Beach, South Carolina",
});
