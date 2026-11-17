/* /invest/condo-buildings/caravelle-resort/ - the Caravelle Resort, 6900 N Ocean Blvd, Myrtle Beach (and the
 * Caravelle Tower, 7000 N Ocean Blvd): the pool deck, the HOA fee by size and what it pays, how the Tower
 * differs, renting by the night, what units sold for, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. Follows the Palace Resort pilot (specs/palace-resort.js).
 * Facts: Blog-Brain batches/2026-11-e/caravelle-resort/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md; struck wording in batches/2026-11-e/facts/
 * invest-condo-buildings-caravelle-resort-struck.json). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-e/caravelle-resort/ (listings.json, county.json, fee-by-size.json, flood-resort.json,
 * flood-tower.json, tax.json; README.md has the rerun order). Every count, fee, price, share and chart value
 * is read from those files here and checked against its ledger row with must().
 * Row 5 (CORRECTED): the county's 404 is not clean, so the page says "about 400". Row 12 (CORRECTED): the value
 * resets the year after a sale. Row 22 (CORRECTED): the 8 percent is zone X, minimal hazard. Row 23: Sea Captain's is south.
 * Row 21: no income figure; the page links /invest/airbnb-income/. No photo is licensed: the page has a table and a chart.
 * Homes: live strips by G.homesQ (round 2, owner 2026-11-14). Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/caravelle-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "caravelle-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FB = read("fee-by-size.json"), FLM = read("flood-resort.json"), FLT = read("flood-tower.json"), TX = read("tax.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`caravelle-resort.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Rows 1 and 7: 47 for sale, 41 in the main building and 6 in the Tower. */
const BM = L.by_building.resort, BT = L.by_building.tower, A = L.asking;
must(L.api_total === 47 && L.at_caravelle === 47 && BM.n === 41 && BT.n === 6, "rows 1 and 7 counts changed");
must(BM.asking.min === 114999 && BM.asking.max === 214000 && BT.asking.min === 95000 && BT.asking.max === 135000 && A.all.median === 135000, "row 7 asking changed");
/* Row 5 (CORRECTED): about 400 units, 348 and 56 by the county's two regimes. Print "about 400". */
must(C.units === 404 && C.by_regime.resort.units === 348 && C.by_regime.tower.units === 56, "row 5 changed");
/* Row 8: the fee by size band. */
const BANDS = FB.bands;
const BAND_KEYS = ["under 450 sq ft", "450 to 519", "520 to 599", "600 and over"];
must(BAND_KEYS.every((k) => BANDS[k] && BANDS[k].n >= 5), "row 8: a size band has fewer than 5 homes; show the range in words");
must(BANDS["under 450 sq ft"].n === 7 && BANDS["under 450 sq ft"].bracket_lowest === 600 && BANDS["under 450 sq ft"].bracket_highest === 825 && BANDS["under 450 sq ft"].median_bracket === 675, "row 8 band 1 changed");
must(BANDS["450 to 519"].n === 22 && BANDS["450 to 519"].bracket_lowest === 650 && BANDS["450 to 519"].bracket_highest === 875 && BANDS["450 to 519"].median_bracket === 750, "row 8 band 2 changed");
must(BANDS["520 to 599"].n === 7 && BANDS["520 to 599"].bracket_lowest === 650 && BANDS["520 to 599"].bracket_highest === 900 && BANDS["520 to 599"].median_bracket === 875, "row 8 band 3 changed");
must(BANDS["600 and over"].n === 11 && BANDS["600 and over"].bracket_lowest === 750 && BANDS["600 and over"].bracket_highest === 950 && BANDS["600 and over"].median_bracket === 900, "row 8 band 4 changed");
must(FB.correlation_sqft_fee === 0.72, "row 8 correlation changed");
/* Row 9: the fee to the dollar. */
const FX = L.fee_exact, FEE = L.fee.all;
must(FX.resort_0.lowest === 599 && FX.resort_1.highest === 935 && FX.tower_0.lowest === 688 && FX.tower_1.highest === 878, "row 9 changed");
must(FEE.lowest_at_or_under === 600 && FEE.highest_at_or_under === 950 && FEE.median_at_or_under === 750, "row 9 bracket changed");
const FEE_MID = FEE.median_at_or_under, FEE_YEAR = FEE_MID * 12;
must(r100(FEE_YEAR) === "$9,000" && r100(FEE_YEAR + 2062) === "$11,100", "row 11 fees changed");
/* Row 10: what the fee pays, by the listings' own flags. */
const FG = L.flags;
must(FG.hoa_includes_water_sewer === 47 && FG.hoa_includes_trash === 46 && FG.hoa_includes_insurance === 44 && FG.hoa_includes_internet === 40 && FG.hoa_includes_electric === 40 && FG.hoa_includes_pest === 39, "row 10 changed");
/* Row 11: property tax at the rental rate, at the middle asking price. */
const MILLS = 254.6, TAXY = A.all.median * 0.06 * MILLS / 1000;
must(Math.round(TAXY) === 2062 && r100(TAXY) === "$2,100", "row 11 tax changed");
/* Row 12 (CORRECTED): the county's own values give a middle bill of about $1,670. */
must(TX.units_at_6pct === 394 && TX.implied_tax_city_millage.median === 1670 && TX.implied_tax_city_millage.p25 === 1176 && TX.implied_tax_city_millage.p75 === 2337, "row 12 changed");
/* Row 13: what the listings say about the homes. */
must(FG.furnished === 47 && FG.ocean_view === 47 && FG.balcony === 45 && FG.elevator === 45 && FG.covered_parking === 41 && FG.oceanfront_unit === 18, "row 13 changed");
/* Rows 14 and 15: recorded deeds, two windows. */
const SW = C.sales_window_1, SW2 = C.sales_window_2;
must(SW.window === "2025-10-01 to 2026-09-30" && SW.all.n === 32 && SW.all.median === 140000 && SW.all.min === 76000 && SW.all.max === 270000, "row 14 changed");
must(SW.resort.n === 28 && SW.resort.median === 144500 && SW.resort.min === 118000 && SW.resort.max === 270000, "row 14 main building changed");
must(SW.tower.n === 4 && SW.tower.median === 105750 && SW.tower.min === 76000 && SW.tower.max === 140000, "row 14 Tower changed");
must(SW2.resort.n === 21 && SW2.resort.median === 145000 && SW2.tower.n === 5 && SW2.tower.median === 102500, "row 15 changed");
const ONE_IN = Math.round(404 / SW.all.n);
must(ONE_IN === 13, "row 14 share changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 16: who owns and who buys. */
const OUT = C.by_regime.resort.owner_out_of_sc + C.by_regime.tower.owner_out_of_sc;
must(OUT === 262 && Math.round(OUT / C.units * 3) === 2 && SW.buyer_tax_bill_out_of_sc === 25, "row 16 changed");
const AT4 = C.by_regime.resort.taxed_at_4pct + C.by_regime.tower.taxed_at_4pct;
must(AT4 === 9, "row 16 owner-occupant count changed");
/* Row 17: rentals, by the listings' flags. */
must(FG.str_allowed === 43 && FG.vacation_rental_program === 46, "row 17 changed");
/* Row 20: sizes for the loan paragraph. */
must(A["0"].sqft_range.join() === "350,575" && A["1"].sqft_range.join() === "501,681", "row 20 sizes changed");
/* Row 22 (CORRECTED): flood zones under the two lots; the zone X share is "minimal hazard". */
const zone = (F, z) => F.zones_touching.find((x) => x.attributes.FLD_ZONE === z);
const SHADE = "0.2 PCT ANNUAL CHANCE FLOOD HAZARD";
must(zone(FLM, "AE").share_of_footprint === 0.048 && zone(FLM, SHADE).share_of_footprint === 0.872 && FLM.share_in_no_zone === 0.08, "row 22 main lot changed");
must(zone(FLT, "AE").share_of_footprint === 0.353 && zone(FLT, SHADE).share_of_footprint === 0.646, "row 22 Tower lot changed");
const AE_M = Math.round(zone(FLM, "AE").share_of_footprint * 100), AE_T = Math.round(zone(FLT, "AE").share_of_footprint * 100);
must(AE_M === 5 && AE_T === 35, "row 22 rounding");
/* Row 23: distances, straight line from the main building. Sea Captain's House is south (verifier). */
const [LAT, LNG] = FLM.footprint_center;
must(LAT === 33.738864 && LNG === -78.820933, "row 23 centre changed");
const MONTHS_RUN = L.refreshedAt;
must(/^2026-11-1\d/.test(MONTHS_RUN), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const IN_PROGRAM = Math.round(FG.vacation_rental_program / L.api_total * 10);
must(IN_PROGRAM === 10, "row 17 share changed");

/* ---------------------------------------------------------------------------- */
/* Page styles                                                                    */

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
const AERIAL = PHOTOS.find((p) => p.file.endsWith("/caravelle-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* The fee table (rows 8 and 9): by size in square feet, the page's main tool.    */

const SIZES = [
  { name: "Under 450 sq ft", k: "under 450 sq ft" },
  { name: "450 to 519 sq ft", k: "450 to 519" },
  { name: "520 to 599 sq ft", k: "520 to 599" },
  { name: "600 sq ft and over", k: "600 and over" },
];
const FEE_TABLE = compareCards(SIZES.map((s) => {
  const b = BANDS[s.k];
  return { name: s.name, cells: {
    range: `About ${money(b.bracket_lowest)} to ${money(b.bracket_highest)}`,
    mid: `About ${money(b.median_bracket)}`,
    year: `About ${r100(b.median_bracket * 12)}`,
    sale: `${b.n}`,
  } };
}), [
  { key: "range", label: "Fee a month, range", num: true },
  { key: "mid", label: "Middle fee a month", num: true },
  { key: "year", label: "Fees a year, at the middle", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At the Caravelle, the fee rises with the size of the home", nameLabel: "Size" });

/* The main building and the Tower, side by side (rows 7, 9, 14, 22). */
const TOWER_TABLE = h.table(["", "Main building", "The Tower"], [
  ["Asking price, for sale " + RUN_SHORT, `About ${r1k(BM.asking.min)} to ${r1k(BM.asking.max)}`, `About ${r1k(BT.asking.min)} to ${r1k(BT.asking.max)}`],
  ["HOA fee a month", `About ${r5(Math.min(FX.resort_0.lowest, FX.resort_1.lowest))} to ${r5(Math.max(FX.resort_0.highest, FX.resort_1.highest))}`, `About ${r5(Math.min(FX.tower_0.lowest, FX.tower_1.lowest))} to ${r5(Math.max(FX.tower_0.highest, FX.tower_1.highest))}`],
  ["Middle sale price, past year", `About ${r1k(SW.resort.median)}, ${SW.resort.n} deeds`, `About ${r1k(SW.tower.median)}, ${SW.tower.n} deeds`],
  ["Lot in the high-risk flood zone", `About ${AE_M} percent`, `About ${AE_T} percent`],
]);

/* The sales chart (row 14): lowest to highest sale as a line, the middle as a dot. Group figures only.
   The Tower rests on 4 deeds, and the caption says so. */
const X0 = 70000, X1 = 280000, xs = (v) => Math.round(20 + (v - X0) / (X1 - X0) * 400);
const SROW = (label, g, y) => {
  const mx = xs(g.median), left = mx < 110;
  return `<text x="20" y="${y}" class="t">${label}</text>`
    + `<text x="${left ? 20 : mx}" y="${y + 28}"${left ? "" : ' text-anchor="middle"'} class="m">Middle about ${r1k(g.median)}</text>`
    + `<line x1="${xs(g.min)}" x2="${xs(g.max)}" y1="${y + 48}" y2="${y + 48}" stroke="#8a5226" stroke-width="8" stroke-linecap="round" opacity=".35"/>`
    + `<circle cx="${mx}" cy="${y + 48}" r="9" fill="#c4783a" stroke="#1c2028" stroke-width="2"/>`
    + `<text x="20" y="${y + 78}" class="e">Lowest ${money(g.min)}, highest ${money(g.max)}</text>`;
};
const SALES_SVG = `<svg role="img" aria-label="Range of Caravelle sale prices: main building ${money(SW.resort.min)} to ${money(SW.resort.max)}, middle about ${r1k(SW.resort.median)}, ${SW.resort.n} sales; Tower ${money(SW.tower.min)} to ${money(SW.tower.max)}, middle about ${r1k(SW.tower.median)}, ${SW.tower.n} sales" viewBox="0 0 440 258" width="100%" style="display:block;max-width:560px;height:auto">`
  + `<style>.t{font:600 18px sans-serif;fill:#1c2028}.m{font:16px sans-serif;fill:#1c2028}.e{font:15px sans-serif;fill:#3d4a56}</style>`
  + SROW(`Main building, ${SW.resort.n} sales`, SW.resort, 26) + SROW(`The Tower, ${SW.tower.n} sales`, SW.tower, 154) + `</svg>`;
const SALES_CHART = h.figure(SALES_SVG, `The Tower's homes sold for less than the main building's. Each line runs from the lowest to the highest recorded sale, and the dot is the middle. Deeds recorded in the ${PERIOD}. The Tower figures rest on only ${SW.tower.n} sales, so treat them as a guide. The year before showed the same gap, with ${SW2.resort.n} main-building sales and ${SW2.tower.n} in the Tower.`);

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.thecaravelle.com/";
const AMENITIES = "https://www.thecaravelle.com/amenities/";
const TOWER_PAGE = "https://www.thecaravelle.com/caravelle-tower/";
const ABOUT = "https://www.thecaravelle.com/about/";
const PROGRAM = "https://www.thecaravelle.com/rental-management/";
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
  name: "The Caravelle Resort", alternateName: ["The Caravelle", "Caravelle Resort Myrtle Beach", "Caravelle Tower"],
  description: "An oceanfront resort of condos on the Golden Mile in Myrtle Beach, South Carolina, with a main building and a seven-story Tower.",
  address: { "@type": "PostalAddress", streetAddress: "6900 N Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29572", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* ---------------------------------------------------------------------------- */
/* Strips (round 2): each search checked on the live site 2026-11-14, 3 or more homes. */

const STRIP = G.homesQScript() + G.homesQ("type=condo&subdivision=Caravelle", "Condos for sale at the Caravelle, by the block-long pool deck");
const STRIP_OCEAN = G.homesQ("type=condo&subdivision=Caravelle&has=oceanfront_unit", "Oceanfront condos at the Caravelle");
const STRIP_FEE = G.homesQ("type=condo&subdivision=Caravelle&hoaMax=700", "Caravelle condos with a fee of $700 a month or less");
const STRIP_TOWER = G.homesQ("type=condo&subdivision=Caravelle Tower", "Condos in the Caravelle Tower, seven floors next door");
const STRIP_NEAR = G.homesQ(`near=${LAT},${LNG}&miles=1&type=condo&has=oceanfront_unit`, "Oceanfront condos within a mile of the Caravelle");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AERIAL),
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  title: `Caravelle Resort Myrtle Beach Condos for Sale: Fees From ${money(FEE.lowest_at_or_under)}`,
  description: `The Caravelle Resort and Tower, 6900 N Ocean Blvd, Myrtle Beach: HOA fees by size and what they pay, nightly rentals, flood zones, and what ${SW.all.n} homes sold for.`,
  ogTitle: "The Caravelle Resort, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "The Caravelle",
  eyebrow: "Caravelle Resort, Myrtle Beach",
  h1: "The Caravelle Resort, Myrtle Beach: condos for sale on the ocean.",
  h1em: "A pool deck the resort calls block-long, and a fee that often pays the power bill.",
  sub: `Caravelle Tower condos asked ${money(BT.asking.min)} to ${money(BT.asking.max)} on ${RUN_MD}. The electric bill is in the fee for ${FG.hoa_includes_electric} of the ${L.api_total} homes for sale.`,
  heroMedia: glance([
    { icon: "home", label: "Condos", text: "About 400, in two buildings" },
    { icon: "calendar", label: "A resort since", text: "1960, by its own words" },
    { icon: "pool", label: "Pool deck", text: "A block long, per the resort" },
    { icon: "key", label: "Nightly rentals", text: "Allowed" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The Caravelle Resort is an oceanfront resort at 6900 N Ocean Blvd, on the Golden Mile of Myrtle Beach. It has a main building and a seven-story Caravelle Tower next door, the lower-priced of the two. The middle sale price over the past year was about ${money(SW.all.median)}.`,
    `The monthly HOA fee goes by the size of the home, from about ${money(FEE.lowest_at_or_under)} to about ${money(FEE.highest_at_or_under)}. The fee also covers water, trash and the building's insurance.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">The Caravelle is one of the oceanfront buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at the Caravelle?", toc: "Owning here", id: "owning", html: () =>
      h.p(`The resort says its pool deck is block-long, reaching from near the beach access all the way to Ocean Boulevard. It holds a lazy river, a children's lazy river, a Wild Water Pool, a large outdoor pool that the resort heats in season, and a hot tub.`) +
      h.p(`The main building also has a heated indoor pool on the 7th floor, behind floor-to-ceiling windows. The resort says it is heated to about 82 degrees and open year-round.`) +
      h.p(`The Caravelle sits on the ocean side of Ocean Boulevard. In a straight line, the Dunes Golf and Beach Club is 2.2 miles north, Sea Captain's House is 3.1 miles south and Pier 14 is 4.4 miles south.`) +
      PHOTO +
      h.p(`Of the ${L.api_total} homes for sale on ${RUN}, all were listed with an ocean view and as sold furnished. ${FG.balcony} had a balcony and an elevator, ${FG.covered_parking} had covered parking, and ${FG.oceanfront_unit} were listed as oceanfront units.`) +
      h.p(`The resort says it has been here since 1960 and has nine buildings. Homes in two of them list under the Caravelle name, the main building and the Tower, and this page covers those two. We read the reserve study before an offer, because the resort is not new.`) +
      STRIP_OCEAN },

    { h2: "What are the HOA fees at the Caravelle Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The middle HOA fee at the Caravelle is about ${money(FEE_MID)} a month. A larger home pays a larger fee, as the table shows.`) +
      FEE_TABLE +
      h.p(`Fees are read from the listings in $25 steps, so each is within $25 of the figure shown. Size explains most of the gap between homes. Bedrooms do not, because nearly every home for sale is a studio or a one-bedroom.`) +
      STRIP_FEE +
      h.h3("What the fee pays") +
      h.p(`The fee covers water and sewer for all ${L.api_total} homes, trash for ${FG.hoa_includes_trash} and the building's insurance for ${FG.hoa_includes_insurance}. For ${FG.hoa_includes_electric}, it also covers the internet and the electric bill. The condo's founding documents decide, and we read them for the unit you like.`) +
      h.p(`You still need your own policy on the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.h3("What a year costs before any loan") +
      h.p(`At the middle fee and the middle asking price, holding a Caravelle condo costs about ${r100(FEE_YEAR + TAXY)} a year, before the loan and your unit's own policy.`) +
      h.table(["Each year, at the middle fee and price", "Amount"], [
        ["HOA fees", r100(FEE_YEAR)],
        ["Property tax as a rental, before any exemption", r100(TAXY)],
        ["<strong>About</strong>", `<strong>${r100(FEE_YEAR + TAXY)}</strong>`],
      ]) +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value. On the county's values today, the middle tax bill for those units is about ${r100(TX.implied_tax_city_millage.median)} a year, and the middle half run from about ${r100(TX.implied_tax_city_millage.p25)} to ${r100(TX.implied_tax_city_millage.p75)}.`) +
      h.p(`The value resets to roughly the sale price the year after a sale, so plan on the higher figure. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.cta("Know the Caravelle's fees before you offer", "We ask the association for the unit's budget, its reserve study and any assessment, and add up the fees for you.", "Have us get the Caravelle's budget and reserve study", "/contact/", bg) },

    { h2: "The Caravelle Tower: what is different?", toc: "The Tower", id: "tower", html: () =>
      h.p(`The Tower is a seven-story building next door, at 7000 N Ocean Blvd. Its units are studios and one-bedrooms with a full kitchen and a private ocean-view balcony. The resort calls it oceanview, not oceanfront.`) +
      h.p(`It has an indoor and outdoor pool of its own, and Tower owners use the main building's pools next door. Check-in for guests is at the main building.`) +
      TOWER_TABLE +
      h.p(`The Tower is the smaller, lower-priced way into the same resort. It also has more flood exposure to check. Only ${BT.n} Tower homes were for sale on ${RUN_MD}, so its fee is a range, never a middle.`) +
      STRIP_TOWER },

    { h2: "Can you Airbnb a condo at the Caravelle Resort?", toc: "Renting it", id: "renting", html: (bg) =>
      h.p(`Yes. The city zones the Caravelle's lots in a district where nightly rentals are allowed, and the resort rents units by the night. The listings say short-term rental is allowed in ${FG.str_allowed} of ${L.api_total} homes, and ${FG.vacation_rental_program} are in a rental program.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's own program</strong>The Caravelle runs an on-site rental program, part of the Vacation Myrtle Beach group. It collects and pays the state and local taxes, buys the annual business license, sends monthly and year-end statements, and escrows the unit's revenue.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself, if the condo's founding documents allow it. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`The program does not publish its share of the rent, so we get its terms for any unit you consider. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways, and ${h.a("/invest/airbnb-income/", "what Myrtle Beach rentals earn")} is on its own page. No public source gives income for the Caravelle alone.`) +
      h.h3("The resort's rules for guests") +
      h.p(`Guests must be 21 to check in. A pet brought into a unit draws a $500 fine, and registered service animals are not counted as pets. An owner's own rules on pets and cars are in the condo's founding documents, and we read them before you offer.`) +
      h.cta("Know what a rental would do", "We ask the rental program for its terms and a unit's booking history before you offer.", "Have us get the rental program's terms", "/contact/", bg) },

    { h2: "What have Caravelle condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} Caravelle homes sold in the past year by Horry County's deed records, at a middle price of about ${money(SW.all.median)}. That is about 1 in ${ONE_IN} units changing hands in a year.`) +
      SALES_CHART +
      h.p(`The deeds do not record bedrooms, so we compare a unit with sales of its own size. Thinking of selling a unit? ${h.a("/sell/home-value/", "Our home value page")} explains how we price a home here, and we price yours from these sales.`) +
      h.p(`About 2 in 3 of the units have a tax-bill address outside South Carolina, and ${SW.buyer_tax_bill_out_of_sc} of the ${SW.all.n} buyers in the year did too. Only ${AT4} units are taxed as the owner's home. The buildings are run for renters and visitors.`) +
      STRIP_NEAR },

    { h2: "What we check before you buy at the Caravelle", toc: "Our checks", id: "checks", html: () =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>On the county's flood map, about ${Math.round(zone(FLM, SHADE).share_of_footprint * 100)} percent of the main building's lot is in FEMA's moderate zone and ${AE_M} percent in the high-risk zone. The rest is an area of minimal flood hazard. The Tower's lot is ${AE_T} percent in the high-risk zone. We read the building's flood cover, and our ${h.a("/buyers/flood-zone-check/", "flood zone page")} shows how to check a lot.</li>`
        + `<li><strong>The building's age</strong>The resort says it dates from 1960. We read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>If you will use a loan</strong>Many standard loans will not cover a unit in a building run like a hotel. The Caravelle is not on HUD's list of condos approved for FHA loans. Studios for sale run ${A["0"].sqft_range[0]} to ${A["0"].sqft_range[1]} square feet and one-bedrooms ${A["1"].sqft_range[0]} to ${A["1"].sqft_range[1]}. One published condotel loan program asks for at least 500 square feet and a separate bedroom, so size alone does not meet it.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Caravelle unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.p(`To weigh the Caravelle against the other oceanfront buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. For condos across the city, see our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 1 mile) and ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about 3 miles). Farther north: ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} (about 3 miles) and ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 6 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 1 mile) and ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (about 3 miles). Farther south: ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (about 3 miles) and ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 5 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Caravelle Resort Myrtle Beach FAQ",
  faq: [
    { q: "When was the Caravelle Resort built?", a: "The resort says it has been in Myrtle Beach since 1960. Most main-building listings give 1960 as the year built, and the Tower's listings give 1982." },
    { q: "Is the Caravelle a hotel or condos?", a: "Both. Its condos are owned one by one, and the resort's on-site rental program rents many of them to guests by the night." },
    { q: "What is the address of the Caravelle Resort?", a: "The main building is at 6900 N Ocean Blvd, Myrtle Beach, SC 29572. The Caravelle Tower is next door at 7000 N Ocean Blvd." },
    { q: "Is the Caravelle in North Myrtle Beach?", a: "No. It is in the City of Myrtle Beach, on the stretch of Ocean Boulevard the resort calls the Golden Mile." },
    { q: "Is the Caravelle Tower the same as Sea Mark Tower?", a: "No. The Caravelle Tower is next door to the main building. It is at 7000 N Ocean Blvd. Sea Mark Tower is a different building and lists under its own name." },
    { q: "Is the Caravelle's indoor pool open all year?", a: "The resort says the heated indoor pool on the main building's 7th floor is open year-round. The hours are the resort's, so ask it." },
    { q: "How many Caravelle condos are for sale?", a: `On ${RUN}, ${L.api_total} Caravelle condos were for sale: ${BM.n} in the main building and ${BT.n} in the Tower.` },
  ],
  sources: [
    { name: "Caravelle Resort", href: RESORT },
    { name: "amenities", href: AMENITIES },
    { name: "Caravelle Tower", href: TOWER_PAGE },
    { name: "about the resort", href: ABOUT },
    { name: "rental program", href: PROGRAM },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "Fannie Mae", href: FANNIE },
    { name: "HUD condo list", href: HUD },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at the Caravelle.",
    p: "Tell us the size you want and the days you are here. An agent shows you the Caravelle condos for sale in that size.",
    label: "Book a showing at the Caravelle", href: "/contact/",
  },
  keywords: "Caravelle Resort Myrtle Beach, Caravelle Resort condos for sale, Caravelle Tower Myrtle Beach, Caravelle Tower condos for sale, Caravelle Resort HOA fees, Caravelle Resort Airbnb, 6900 N Ocean Blvd Myrtle Beach",
  about: "The Caravelle Resort and the Caravelle Tower, oceanfront condo buildings at 6900 and 7000 N Ocean Blvd, Myrtle Beach, South Carolina",
});
