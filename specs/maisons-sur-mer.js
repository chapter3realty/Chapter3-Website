/* /invest/condo-buildings/maisons-sur-mer/ - Maisons Sur Mer, 9650 Shore Dr., Myrtle Beach: what owning a condo
 * in the tower is like (the association's own restaurant, lounge and pool bar), the two HOA fee levels, the
 * county's real tax bills, what units sold for, whether it can rent, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. The third page built the way palace-resort.js was, but an
 * owners' tower in unincorporated Horry County, not a resort with a desk.
 * Facts: Blog-Brain batches/2026-11-e/maisons-sur-mer/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md). Struck: rows 26 and 32, single-listing prices (row 6), pool-bar hours (row 20).
 * Data: data/2026-11-e/maisons-sur-mer/ (listings.json, county.json, flood.json, taxbills.json, photos.json, images/).
 * Every count, fee, price, share and chart value is read from those files here and checked against its ledger
 * row with must(); a changed file stops the build until a person reads the row again.
 * The 4% tax median is computed here from the eight bills (VERIFY row 17: the file's median_total is the upper middle).
 * Homes: three live strips (G.homesQ), no "send me" offer (owner, 2026-11-14). Picture: one USDA NAIP aerial
 * (public domain), cropped and labelled from coordinates, until the photo partner's shots arrive.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/maisons-sur-mer/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "maisons-sur-mer");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TB = read("taxbills.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r500 = (v) => money(Math.round(v / 500) * 500);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const must = (ok, msg) => { if (!ok) throw new Error(`maisons-sur-mer.js: ${msg}`); };
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 2 (CORRECTED wording): 253 units, floors numbered 1 to 12 and 14 to 24, 11 on every floor. */
const FLR = C.floors;
must(C.units === 253 && FLR.top === 24 && FLR.count === 23 && FLR.missing_between.join() === "13", "row 2 floors or units changed");
must(Object.values(FLR.units_per_floor).every((v) => v === 11) && Object.keys(FLR.units_per_floor).length === 23, "row 2 units per floor changed");
const UNITS = C.units;
/* Row 3: built 1974 (7 listings) or 1975 (6). Row 4 (VERIFIED wording): about 300 feet, FAA obstacle file 45-000344. A fixed fact, typed. */
must(L.year_built["1974"] === 7 && L.year_built["1975"] === 6, "row 3 changed");
const FEET = 300;
/* Row 5: all 13 for sale are two-bedrooms of 1,367 to 1,511 square feet. */
const A = L.asking;
must(L.api_total === 13 && L.at_9650 === 13 && L.beds["2"] === 13, "row 5 counts changed");
must(A["2"].sqft_range.join() === "1367,1511" && A["2"].sqft_median === 1420, "row 5 sizes changed");
/* Row 6 (CORRECTED): the range and the middle only, never a single listing's price. */
must(A.all.median === 555000 && A.all.min === 349900 && A.all.max === 824900, "row 6 asking changed");
/* Row 7: the fee takes two values only, $1,014 (8 units) and $1,456 (5); hoaMax=1014 returns 8 (ledger, VERIFIED). */
const FX = L.fee_exact["2"], FS = L.fee_by_size;
must(FX.n === 13 && FX.lowest === 1014 && FX.highest === 1456, "row 7 fee levels changed");
const LOW = FX.lowest, HIGH = FX.highest, N_LOW = 8, N_HIGH = 5;
must(N_LOW + N_HIGH === L.api_total, "row 7 counts do not add up");
must(FS["1400"].lowest === 1456 && FS["1400"].n === 2 && FS["1386"].highest === 1014 && FS["1367"].highest === 1014, "row 7 size examples changed");
must(FS["1420"].lowest === 1014 && FS["1420"].highest === 1456 && FS["1511"].lowest === 1014 && FS["1511"].highest === 1456, "row 7 mixed sizes changed");
const sizesAt = (fee) => Object.keys(FS).filter((k) => /^\d+$/.test(k) && (FS[k].lowest === fee || FS[k].highest === fee)).map(Number).sort((a, b) => a - b);
const SZ_LOW = sizesAt(LOW), SZ_HIGH = sizesAt(HIGH);
must(SZ_LOW.join() === "1367,1386,1420,1511" && SZ_HIGH.join() === "1400,1420,1511", "row 7 sizes at each level changed");
const YEAR_LOW = LOW * 12, YEAR_HIGH = HIGH * 12;
must(r100(YEAR_LOW) === "$12,200" && r100(YEAR_HIGH) === "$17,500", "row 7 fees a year changed");
/* Row 8 (CORRECTED): more than the Palace's and Bay View's two-bedrooms; the Palace's are 739 to 950 sq ft (palace-resort.js). */
/* Row 9: what the fee pays, by the listings' own flags. */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 13 && FG.hoa_includes_trash === 12 && FG.hoa_includes_pest === 11 && FG.hoa_includes_internet === 10 && FG.hoa_includes_cable === 10 && FG.hoa_includes_electric === 0 && FG.hoa_includes_insurance === 1, "row 9 changed");
/* Row 10: pets. Row 24: rentals. */
must(FG.pets_allowed === 11 && FG.str_allowed === 12 && FG.long_term_rental_allowed === 12 && FG.vacation_rental_program === 3, "rows 10 and 24 changed");
/* Rows 11 to 14: recorded deeds, the directory's window. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30", "row 11 window changed");
must(SW.all.n === 16 && SW.all.median === 582500 && SW.all.p25 === 496875 && SW.all.p75 === 630000 && SW.all.min === 420000 && SW.all.max === 900000, "row 11 changed");
must(SW.floors_1_to_12.n === 6 && SW.floors_1_to_12.median === 582500 && SW.floors_14_up.n === 10 && SW.floors_14_up.median === 587500, "row 13 changed");
must(SW.buyer_tax_bill_in_sc === 8 && SW.buyer_tax_bill_out_of_sc === 8, "row 14 changed");
const ONE_IN = Math.round(UNITS / SW.all.n);
must(ONE_IN === 16, "row 11 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 15 (CORRECTED): 70 of 253 taxed as the owner's home (28 percent; about 5 percent across all oceanfront buildings, NWC);
   74 of 253 (29 percent) have a tax-bill address in North Carolina; 155 outside South Carolina. Row 16: 40 last sold in 2025 or 2026. */
must(C.taxed_as_home_4pct === 70 && Math.round(70 / UNITS * 100) === 28, "row 15 changed");
const OWN = Object.fromEntries(C.owner_state_top);
must(OWN.NC === 74 && OWN.SC === 98 && C.owner_out_of_sc === 155 && Math.round(OWN.NC / UNITS * 10) === 3, "row 15 owner states changed");
must(C.last_sale_year["2025"] === 18 && C.last_sale_year["2026"] === 22, "row 16 changed");
/* Row 17 (CORRECTED): real 2026 bills. 6 percent: median $5,611 (right in the file). 4 percent: the true median of the eight is $1,634. */
const T6 = TB.groups.six_percent, T4 = TB.groups.four_percent;
must(T6.n === 8 && T4.n === 8 && T6.rows.length === 8 && T4.rows.length === 8 && T6.city_tax_nonzero === 0 && T4.city_tax_nonzero === 0, "row 17 sample changed");
const MED6 = median(T6.rows.map((r) => r.total)), MED4 = median(T4.rows.map((r) => r.total));
must(Math.round(MED6) === 5611 && Math.round(MED4) === 1634, "row 17 medians changed");
must(r100(T6.min_total) === "$4,800" && r100(T6.max_total) === "$7,000" && r100(T4.min_total) === "$1,300" && r100(T4.max_total) === "$2,300", "row 17 ranges changed");
const TAX6 = r100(MED6), TAX4 = r100(MED4);
must(TAX6 === "$5,600" && TAX4 === "$1,600", "row 17 rounding changed");
const sum = (a, b) => money(Math.round(a / 100) * 100 + Math.round(b / 100) * 100);
const YR = { lo6: sum(YEAR_LOW, MED6), lo4: sum(YEAR_LOW, MED4), hi6: sum(YEAR_HIGH, MED6), hi4: sum(YEAR_HIGH, MED4) };
must(YR.lo6 === "$17,800" && YR.lo4 === "$13,800" && YR.hi6 === "$23,100" && YR.hi4 === "$19,100", "row 17 yearly sums changed");
/* Row 19 (VERIFIED wording): the lot, not the floors. VE 19, AE 64, the 0.2 percent zone 17; about 83 percent in high-risk areas. */
const sh = (z) => FL.zones_touching.filter((x) => x.attributes.FLD_ZONE === z).reduce((s, x) => s + x.share_of_footprint, 0);
const VE = Math.round(sh("VE") * 100), AE = Math.round(sh("AE") * 100), X02 = Math.round(sh("0.2 PCT ANNUAL CHANCE FLOOD HAZARD") * 100);
must(VE === 19 && AE === 64 && X02 === 17 && FL.share_in_no_zone === 0 && VE + AE + X02 === 100, "row 19 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];
must(LAT === 33.761916 && LNG === -78.786229, "row 1 center changed");

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
/* The picture: one labelled NAIP aerial (public domain), under its sentence.     */

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/maisons-sur-mer-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* Visual 1: the page's one table, the two fee levels (rows 7, 8). */

const sq = (a) => `${n(a[0])} to ${n(a[a.length - 1])} sq ft`;
const FEE_TABLE = compareCards([
  { name: "Lower fee level", bestFor: sq(SZ_LOW), cells: { fee: money(LOW), year: `About ${r100(YEAR_LOW)}`, sale: `${N_LOW}` } },
  { name: "Higher fee level", bestFor: sq(SZ_HIGH), cells: { fee: money(HIGH), year: `About ${r100(YEAR_HIGH)}`, sale: `${N_HIGH}` } },
], [
  { key: "fee", label: "Monthly fee", num: true },
  { key: "year", label: "Fee a year", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "Two fee levels, and size does not explain them", nameLabel: "Level", bestForLabel: "Sizes at this level" });

/* Visual 2: the tax bars (row 17). One message: the rate sets the bill. */
const TAX_CHART = G.bars([
  { name: "Taxed at the rental rate", value: MED6, valueText: `About ${TAX6}` },
  { name: "Taxed as the owner's home", value: MED4, valueText: `About ${TAX4}` },
], {
  caption: "What a year of tax runs at Maisons Sur Mer",
  nameLabel: "Unit", valueLabel: "Middle bill, 2026", compact: true, max: Math.round(MED6 * 1.35),
  note: `The county Treasurer's 2026 bills for ${T6.n + T4.n} units: ${T6.n} at each rate. Bills ran ${r100(T6.min_total)} to ${r100(T6.max_total)} at the rental rate, and ${r100(T4.min_total)} to ${r100(T4.max_total)} at the owner's home rate, after the owner's credits.`,
});

/* Visual 3: the sales chart (row 11). One message: where most sales landed. */
const SALES_CHART = G.bars([
  { name: "Lowest of the 16 sales", value: SW.all.min, valueText: r1k(SW.all.min) },
  { name: "A quarter sold for less than", value: SW.all.p25, valueText: r1k(SW.all.p25) },
  { name: "Middle sale", value: SW.all.median, valueText: `About ${r1k(SW.all.median)}`, reference: true },
  { name: "A quarter sold for more than", value: SW.all.p75, valueText: r1k(SW.all.p75) },
  { name: "Highest of the 16 sales", value: SW.all.max, valueText: r1k(SW.all.max) },
], {
  caption: `Most Maisons Sur Mer sales landed between ${r1k(SW.all.p25)} and ${r1k(SW.all.p75)}`,
  nameLabel: "Sales", valueLabel: "Price", compact: true, max: Math.round(SW.all.max * 1.12),
  note: `Recorded deeds, ${PERIOD}: the price in the deed, which is not always the listing's sale price.`,
});
must(r1k(SW.all.p25) === "$497,000" && r1k(SW.all.p75) === "$630,000" && r1k(SW.all.min) === "$420,000" && r1k(SW.all.max) === "$900,000", "sales chart no longer matches its values");

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const HOA = "https://www.maisons-sur-mer4real.com/";
const FOOD = "https://www.maisons-sur-mer4real.com/food-services";
const FITNESS = "https://www.maisons-sur-mer4real.com/fitness-sauna";
const CLUB = "https://www.maisons-sur-mer4real.com/club-rooms";
const PARKING = "https://www.maisons-sur-mer4real.com/parking";
const DOF = "https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/dof/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const TREASURER = "https://horrycountytreasurer.qpaybill.com/Taxes/";
const NFHL = "https://msc.fema.gov/portal/home";

/* The building as a place, for search (never Hotel, LodgingBusiness or Restaurant: we are not the association). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Maisons Sur Mer", alternateName: ["Maisons-sur-Mer", "Maison Sur Mer", "Maisons Sur Mer Myrtle Beach"],
  description: `An oceanfront condo tower on Shore Drive in Myrtle Beach, South Carolina, built in the mid-1970s, with ${UNITS} condos.`,
  address: { "@type": "PostalAddress", streetAddress: "9650 Shore Dr.", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29572", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips (owner, 2026-11-14). Checked 2026-11-14 against /homes/api/strip: 13, 8 and 5 homes. The MLS spells the building "Maisons Sur-Mer". */
const SUB = "subdivision=Maisons Sur-Mer";
const STRIP = G.homesQScript() + G.homesQ(SUB, "Condos for sale at Maisons Sur Mer, an oceanfront tower");
const STRIP_FEE = G.homesQ(`${SUB}&hoaMax=${LOW}`, `Maisons Sur Mer condos at the lower fee level`);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: "Maisons Sur Mer Myrtle Beach Condos for Sale: Fees, Taxes",
  description: `Maisons Sur Mer, 9650 Shore Dr., Myrtle Beach: the two monthly fee levels in the listings, real tax bills, what ${SW.all.n} units sold for, and rentals.`,
  ogTitle: "Maisons Sur Mer, Myrtle Beach: condos for sale, the two HOA fee levels, real tax bills and sales",
  crumb: "Maisons Sur Mer",
  eyebrow: "Maisons Sur Mer, Myrtle Beach",
  h1: "Maisons Sur Mer, Myrtle Beach: condos for sale in the tower on Shore Drive.",
  sub: `At Maisons Sur Mer, more than one in four units pay tax at the owner's home rate, the most of any oceanfront building measured.`,
  h1em: "A restaurant, a lounge and a pool bar inside the building.",
  heroMedia: glance([
    { icon: "calendar", label: "Built", text: "Mid-1970s" },
    { icon: "home", label: "Condos", text: `${UNITS}` },
    { icon: "food", label: "Inside", text: "Restaurant and lounge" },
    { icon: "key", label: "For sale now", text: `${L.api_total} two-bedrooms` },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Maisons Sur Mer is a ${UNITS}-unit oceanfront tower at 9650 Shore Dr., built in the mid-1970s. The owners' association runs a restaurant, a lounge and a pool bar inside it.`,
    `The ${L.api_total} condos for sale on ${RUN_MD} are all two-bedrooms of ${n(A["2"].sqft_range[0])} to ${n(A["2"].sqft_range[1])} square feet, asking about ${r5k(A.all.min)} to ${r5k(A.all.max)}. The monthly HOA fee in the listings is one of two levels, ${money(LOW)} or ${money(HIGH)}. ${SW.all.n} units sold in the past year, at about ${r1k(SW.all.median)} in the middle.`,
    `Looking for a week at the beach? This page is for buying a unit. We do not book stays.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + PHOTO + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Maisons Sur Mer is one of 47 buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at Maisons Sur Mer?", toc: "Owning here", id: "owning", html: () =>
      h.p(`By the county's tax records, more than one in four units, ${C.taxed_as_home_4pct} of ${UNITS}, are taxed at the owner's home rate. That is the most of any oceanfront building we measured, against about 5 percent across them.`) +
      h.p(`The rest are taxed at the 6 percent rate for second homes and rentals, about ${TAX6} a year against about ${TAX4} at the home rate. If you will rent the unit or use it as a second home, plan on the higher bill.`) +
      h.p(`The fee is the other half of the cost, and it comes in two levels, set out below.`) +
      h.p(`The owners' association runs a restaurant inside the building, the Ocean Club lounge at the back of the lobby level, and a bar by the swimming pool. Its pages also list a fitness center, saunas and game, billiards and media rooms.`) +
      h.p(`The garage on the lower level holds two vehicles a unit. We read the association's parking and house rules before you offer.`) +
      h.h3("The tower") +
      h.p(`Floors are numbered up to 24, with no 13th, and every numbered floor holds ${FLR.units_per_floor["2"]} condos. The FAA lists a ${FEET}-foot building at this address.`) +
      h.p(`The address says Myrtle Beach, but the tower stands outside the city limits, in unincorporated Horry County.`) },

    { h2: "What are the HOA fees at Maisons Sur Mer?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`Of the ${L.api_total} condos for sale on ${RUN_MD}, ${N_LOW} list a monthly fee of ${money(LOW)} and ${N_HIGH} list ${money(HIGH)}. No listing falls in between.`) +
      FEE_TABLE +
      h.p(`Two 1,400-square-foot units both list the higher level, and two smaller units both list the lower. The listings do not say why. The association's fee schedule does, so we ask for it before an offer.`) +
      h.p(`Every listing says the fee pays water and sewer, and nearly all say trash. Most add pest control, internet and cable. Plan on paying power yourself.`) +
      h.p(`Only one listing ticks the building's insurance, so we read the budget to see what the fee holds. You also need your own policy for the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.p(`These two-bedrooms run 1,367 to 1,511 square feet, nearly twice the Palace's 739 to 950, and the Palace's pay about $915 a month. Bay View's two-bedrooms pay $1,174. Both are below Maisons Sur Mer's two levels.`) +
      STRIP_FEE +
      h.cta("Know Maisons Sur Mer's budget before you offer", "We ask the association for the fee schedule, the budget, the reserve study and its rental rules, and we get a unit's booking history if it rents.", "Have us get Maisons Sur Mer's fee schedule and budget", "/contact/", bg) },

    { h2: "What will the property tax be at Maisons Sur Mer?", toc: "Property tax", id: "tax", html: () =>
      h.p(`The county's real 2026 tax bills are about ${TAX6} a year at the rental rate and about ${TAX4} at the owner's home rate.`) +
      TAX_CHART +
      h.p(`South Carolina taxes a second home or a rental on 6 percent of its value, and a home you live in on 4 percent. A sale resets the value to about the price. Our ${h.a("/buyers/property-taxes/", "property tax page")} explains the two rates.`) +
      h.p(`The tower is outside the City of Myrtle Beach, so no city tax appears on any of these bills. To see one unit's bill, use our ${h.a("/buyers/property-records/", "property lookup")} and type its address.`) +
      h.h3("What a year costs before any loan") +
      h.p(`Add a fee level to a tax bill and you have the year's cost to hold a unit, before power and your unit's own insurance.`) +
      h.table(["Each year, before any loan", "Taxed at the rental rate", "Taxed as the owner's home"], [
        [`Lower fee, ${r100(YEAR_LOW)}`, YR.lo6, YR.lo4],
        [`Higher fee, ${r100(YEAR_HIGH)}`, YR.hi6, YR.hi4],
      ]) +
      h.p(`The tax is the middle of the bills we read, not a bill for a particular unit. A unit's bill follows the county's value for it.`) },

    { h2: "What have Maisons Sur Mer condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} units sold in the past year, by Horry County's deed records. That is about 1 in ${ONE_IN} of the ${UNITS}. The middle price was about ${r1k(SW.all.median)}.`) +
      SALES_CHART +
      h.p(`Floor did not set the price here. The middle was about the same on the lower floors (${SW.floors_1_to_12.n} sales) and the upper floors (${SW.floors_14_up.n} sales). Both groups are small.`) +
      h.p(`Asking prices spread wider than sales, from ${r5k(A.all.min)} to ${r5k(A.all.max)}.`) +
      h.p(`See every unit for sale in the ${h.a("/homes/?subdivision=Maisons%20Sur-Mer", "live Maisons Sur Mer search")}.`) +
      h.p(`Thinking of selling a unit here? ${h.a("/contact/", "Have us price it from these sales")}.`) },

    { h2: "Can you rent a condo at Maisons Sur Mer?", toc: "Renting it", id: "renting", html: () =>
      h.p(`The listings say yes: ${FG.str_allowed} of ${L.api_total} allow short-term rentals, and ${FG.long_term_rental_allowed} allow long-term ones. The association's documents decide.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>The county</strong>The tower is in unincorporated Horry County. The county's zoning code has no short-term rental use category. A business license and taxes still apply, and they are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `<li><strong>The association</strong>Only ${FG.vacation_rental_program} listings say they are in a rental program. We do not state a minimum stay, because the association's public pages do not give one. We ask.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself, once the association's rules allow it. Our ${h.a("/invest/rental-program-vs-airbnb/", "rental program versus Airbnb")} page shows the money both ways.</li>`
        + `</ul>` +
      h.p(`What two-bedrooms earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for this tower alone.`) },

    { h2: "What to check before you buy at Maisons Sur Mer", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>The building's age</strong>A 1970s tower. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Flood zones</strong>About ${VE + AE} percent of the lot is in FEMA's high-risk map areas. The oceanfront edge is in the coastal VE zone and most of the rest is in AE zones. The remainder is in the shaded 0.2-percent-chance zone. That is the county's drawing of the lot, not of the floors. We check the building's flood cover and ${h.a("/buyers/coastal-insurance/", "your own")}.</li>`
        + `<li><strong>The fee</strong>We get the fee schedule and the budget so you know which level a unit pays and why.</li>`
        + `<li><strong>If you will use a loan</strong>Lenders look at the building before they lend on a unit. Our affiliated lender, BrickWood Mortgage, a separate company, can look at this one before you offer. Our page on ${h.a("/invest/non-warrantable-condos/", "non-warrantable condos")} explains what makes a building hard to lend on.</li>`
        + `</ul>` +
      h.cta("Have us check a Maisons Sur Mer unit before you offer", "We go through each check above for the unit you like, and our affiliated lender, BrickWood Mortgage, a separate company, looks at the building.", "Have us check a Maisons Sur Mer unit", "/contact/", bg) +
      h.p(`To weigh Maisons Sur Mer against the other 46 buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/margate-tower/", "Margate Tower")} (about half a mile) and ${h.a("/invest/condo-buildings/margaritaville-vacation-residences/", "Margaritaville Vacation Residences")} (about half a mile). Farther north: ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 4 miles) and ${h.a("/invest/condo-buildings/bay-watch-resort/", "Bay Watch Resort")} (about 5 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 2 miles) and ${h.a("/invest/condo-buildings/caravelle-resort/", "Caravelle Resort")} (about 3 miles). Farther south: ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 4 miles) and ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (about 6 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Maisons Sur Mer Myrtle Beach FAQ",
  faq: [
    { q: "Where is Maisons Sur Mer?", a: "Maisons Sur Mer is at 9650 Shore Dr., Myrtle Beach, SC 29572, on the oceanfront. It is in unincorporated Horry County, not in North Myrtle Beach or inside the City of Myrtle Beach." },
    { q: "How many condos and floors does Maisons Sur Mer have?", a: `The county records ${UNITS} condo units, with 11 on each numbered floor. Floors are numbered up to 24, with no 13th.` },
    { q: "When was Maisons Sur Mer built?", a: `Maisons Sur Mer was built in the mid-1970s. The condos for sale list 1974 for ${L.year_built["1974"]} of them and 1975 for ${L.year_built["1975"]}.` },
    { q: "Is Maisons Sur Mer a hotel?", a: "No. The condos are owned one by one, and a homeowner association with a board of directors runs the building, including its restaurant, lounge and pool bar." },
    { q: "Does Maisons Sur Mer allow pets?", a: `${FG.pets_allowed} of the ${L.api_total} listings say pets are allowed. The association's own rule governs, and we read it before you offer.` },
    { q: "Is there parking at Maisons Sur Mer?", a: "Yes. The garage on the lower level is limited to two vehicles a unit, and each vehicle needs a sticker or a permit." },
    { q: "Is it Maison Sur Mer or Maisons Sur Mer?", a: "Both spellings appear in the county's records for the tower. The association itself writes the name Maisons-sur-Mer, with hyphens." },
    { q: "How many Maisons Sur Mer condos are for sale?", a: `On ${RUN}, ${L.api_total} Maisons Sur Mer condos were for sale, all two-bedrooms of ${n(A["2"].sqft_range[0])} to ${n(A["2"].sqft_range[1])} square feet.` },
  ],
  sources: [
    { name: "owners' association", href: HOA },
    { name: "food services", href: FOOD },
    { name: "fitness and saunas", href: FITNESS },
    { name: "club rooms", href: CLUB },
    { name: "parking rules", href: PARKING },
    { name: "FAA obstacle file", href: DOF },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "county Treasurer", href: TREASURER },
    { name: "FEMA flood map", href: NFHL },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels, the Treasurer's 2026 bills for ${T6.n + T4.n} units, and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Have us read Maisons Sur Mer's documents for the unit you pick.",
    p: "We go through the budget, the reserve study, the fee schedule and the rental rules, and tell you what we find before you offer.",
    label: "Have us read the documents", href: "/contact/",
  },
  keywords: "maisons sur mer, maisons sur mer myrtle beach, maisons sur mer for sale, maisons sur mer condos for sale, maisons sur mer hoa fees, maisons sur mer rentals, 9650 shore dr myrtle beach, maison sur mer myrtle beach",
  about: "Maisons Sur Mer, a 253-unit oceanfront condo tower at 9650 Shore Dr., Myrtle Beach, South Carolina",
});
