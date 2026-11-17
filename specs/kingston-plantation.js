/* /submarkets/myrtle-beach/kingston-plantation/ - Kingston Plantation, Myrtle Beach: the 11 condo buildings,
 * what each sold for in the past year, the HOA fees on current listings, the rental program, the flood zone
 * by building, the town question (Myrtle Beach or North Myrtle Beach) and the yearly cost to own.
 *
 * Batch 2026-11-e, Lane N (new page). Built like the pilot specs/plantation-point.js (a neighborhood) and
 * specs/palace-resort.js (building facts): the answer first, the italic sub line at about half the H1 size, one
 * block width of 720 px, plain lists under thin rules, live homes strips under the sentence that names the place.
 * Facts: Blog-Brain batches/2026-11-e/kingston-plantation/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's values and wording only (VERIFY.md; struck wording in batches/2026-11-e/facts/kingston-plantation-struck.json).
 * Plan: PLAN.md. Demand: must-answer.md.
 * Not used: row 26 (pets, not usable), the "31 oceanfront or ocean view" figure (row 22), a flat "145 acres" (row 3),
 * "$150,000 each" for Kingston Lakes (row 7), "next door" for Royale Palms (row 24), "owned by Hilton", what the HOA fee
 * covers, which resort amenities an owner may use, any rental terms or income, the county value (about $435,000), and any
 * sentence about who the neighbors are (row 19 is said once, as a tax fact).
 * Data: data/2026-11-e/kingston-plantation/ (findings.json, findings-extra.json, listings.json, hoa-brackets.json,
 * drives.json, photos.json; README.md). Every count, price, share and minute is read from those files here and
 * checked against its ledger row.
 * Pictures: one aerial photo (USDA NAIP 2023, public domain) labelled from county parcel points, and one chart of
 * prices by building, one of flood zones, one of drives. No photo of the place itself: the shot list is in BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/kingston-plantation/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "kingston-plantation");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), X = read("findings-extra.json"), L = read("listings.json"), HB = read("hoa-brackets.json"), DR = read("drives.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const usd = (v) => "$" + n(v);
const r5k = (v) => "about $" + n(Math.round(v / 5000) * 5000);
const mil = (v) => "$" + (Math.round(v / 10000) / 100).toString() + " million";
const must = (ok, msg) => { if (!ok) throw new Error(`kingston-plantation.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 8: 1,620 county units, 1,364 without Kingston Lakes; the 11 buildings and their units. */
const BU = F.buildings;
const BUILDINGS = ["Margate Tower", "Brighton Towers", "Richmond Park", "South Hampton", "West Hyde Park", "North Hampton",
  "Cumberland Terrace", "Canterbury Court", "St James Park", "Windermere By The Sea", "Arrowhead Court"];
must(F.units === 1620 && X.without_kingston_lakes.units === 1364 && BUILDINGS.reduce((a, b) => a + BU[b].units, 0) === 1364, "row 8 changed");
must(BU["Margate Tower"].units === 253 && BU["Brighton Towers"].units === 201 && BU["Richmond Park"].units === 183 && BU["South Hampton"].units === 143 && BU["West Hyde Park"].units === 140, "row 8 groups changed");
/* Row 7 (CORRECTED): 256 Kingston Lakes parcels, one owner name, none sold, none for sale. */
must(X.kingston_lakes.parcels === 256 && X.kingston_lakes.distinct_owner_names === 1 && X.kingston_lakes.sales_in_window === 0 && X.kingston_lakes.for_sale_now === 0, "row 7 changed");
/* Row 1: 63 for sale, all condominiums. Row 13: $210,000 to $1,690,000, middle $449,900; beds 4, 30, 26, 3; built 1986 to 2006. */
const LA = L.all;
must(LA.n === 63 && LA.price.min === 210000 && LA.price.max === 1690000 && LA.price.median === 449900, "rows 1 and 13 changed");
must(LA.beds.map((b) => b.join(":")).join() === "1:4,2:30,3:26,4:3" && LA.year_built.join() === "1986,2006", "row 13 beds or years changed");
/* Row 14: for sale by building. */
const LS = (b) => L.subdivisions["Kingston Plantation - " + (b === "St James Park" ? "St James Park HPR" : b)];
const FOR_SALE = Object.fromEntries(BUILDINGS.map((b) => [b, LS(b).n]));
must(FOR_SALE["Margate Tower"] === 7 && FOR_SALE["Brighton Towers"] === 10 && FOR_SALE["South Hampton"] === 13 && FOR_SALE["Richmond Park"] === 12 && FOR_SALE["West Hyde Park"] === 5, "row 14 counts changed");
must(FOR_SALE["Canterbury Court"] === 4 && FOR_SALE["North Hampton"] === 3 && FOR_SALE["Cumberland Terrace"] === 2 && FOR_SALE["St James Park"] === 2 && FOR_SALE["Windermere By The Sea"] === 1 && FOR_SALE["Arrowhead Court"] === 1, "row 14 small counts changed");
const NAMED_FOR_SALE = Object.values(FOR_SALE).reduce((a, b) => a + b, 0);
const OTHER_FOR_SALE = LA.n - NAMED_FOR_SALE; /* Laurel Court 1 and Windsor Court 2: no county match (gap 4) */
must(OTHER_FOR_SALE === 3 && LS("Laurel Court").n === 1 && LS("Windsor Court").n === 2, "row 14 other names changed");
const M = LS("Margate Tower"), B = LS("Brighton Towers"), S = LS("South Hampton"), R = LS("Richmond Park");
must(M.price.min === 640000 && M.price.max === 1690000 && M.year_built.join() === "2004,2006" && M.beds.map((b) => b[0]).join() === "3,4", "row 14 Margate changed");
must(B.price.min === 519000 && B.price.max === 719000 && B.year_built.join() === "2000,2000", "row 14 Brighton changed");
must(S.price.min === 409900 && S.price.max === 629000 && S.year_built.join() === "1987,1987", "row 14 South Hampton changed");
must(R.price.min === 225000 && R.price.max === 479900 && R.year_built.join() === "1986,1988", "row 14 Richmond Park changed");
const BUILT = { "Margate Tower": "2004 to 2006", "Brighton Towers": "2000", "South Hampton": "1987", "Richmond Park": "1986 to 1988", "West Hyde Park": "1988",
  "North Hampton": "1987 to 1988", "Cumberland Terrace": "1989 to 1990", "Canterbury Court": "1995 to 1996", "St James Park": "1991 to 1992",
  "Windermere By The Sea": "1994", "Arrowhead Court": "1988" };
for (const b of BUILDINGS) {
  const y = LS(b).year_built;
  must(BUILT[b] === (y[0] === y[1] ? String(y[0]) : `${y[0]} to ${y[1]}`), `row 14 build year of ${b} changed`);
}
/* Row 11: 83 sales, middle $435,000, $176,250 to $1,633,125; by building. Middle prices only where 9 or more sales. */
const SA = F.sales;
must(SA.all.n === 83 && SA.all.median === 435000 && SA.all.min === 176250 && SA.all.max === 1633125, "row 11 changed");
const SB = SA.by_building;
must(SB["Richmond Park"].n === 17 && SB["Richmond Park"].median === 245000 && SB["Margate Tower"].n === 15 && SB["Margate Tower"].median === 990000
  && SB["Brighton Towers"].n === 14 && SB["Brighton Towers"].median === 577500 && SB["South Hampton"].n === 9 && SB["South Hampton"].median === 429500
  && SB["West Hyde Park"].n === 9 && SB["West Hyde Park"].median === 420000, "row 11 buildings changed");
must(BUILDINGS.every((b) => (SB[b].n >= 9) === ["Richmond Park", "Margate Tower", "Brighton Towers", "South Hampton", "West Hyde Park"].includes(b)), "row 11: which buildings have 9 or more sales changed");
must(Math.round(SB["Margate Tower"].median / SB["Richmond Park"].median) === 4 && SB["Margate Tower"].median / SB["Richmond Park"].median > 4, "row 11: the four-times line changed");
/* Row 12: sales by month stayed between 3 and 11. */
const MON = Object.values(SA.by_month);
must(Math.min(...MON) === 3 && Math.max(...MON) === 11 && MON.length === 12, "row 12 changed");
/* Row 15 (CORRECTED): fees on listings, by the site's bracket filter; the top is $2,100 (Margate Tower), not $2,000. */
const HF = (b) => HB.by_building["Kingston Plantation - " + (b === "St James Park" ? "St James Park HPR" : b)];
must(HB.all_fee_at_or_under["500"] === 1 && HB.all_fee_at_or_under["2000"] === 62 && HB.all_fee_at_or_under["2100"] === 63 && HB.all_fee_at_or_under["1400"] === 51 && HB.all_fee_at_or_under["1100"] === 38 && HB.hoa0 === 0, "row 15 brackets changed");
must(HF("West Hyde Park").first_bracket_with_a_listing === 500 && HF("Canterbury Court").first_bracket_with_a_listing === 600 && HF("Richmond Park").first_bracket_with_a_listing === 700 && HF("Richmond Park").all_at_or_under === 1300
  && HF("Brighton Towers").first_bracket_with_a_listing === 1100 && HF("Brighton Towers").all_at_or_under === 1700 && HF("South Hampton").first_bracket_with_a_listing === 1100 && HF("South Hampton").all_at_or_under === 1400
  && HF("Margate Tower").first_bracket_with_a_listing === 1500 && HF("Margate Tower").all_at_or_under === 2100 && HF("North Hampton").first_bracket_with_a_listing === 1100 && HF("North Hampton").all_at_or_under === 1400
  && HF("West Hyde Park").all_at_or_under === 800 && HF("Canterbury Court").all_at_or_under === 800, "row 15 buildings changed");
/* A fee range is printed only for a building with 3 or more listings: from its lowest bracket to its highest. */
const feeRange = (b) => (FOR_SALE[b] >= 3 ? `${usd(HF(b).first_bracket_with_a_listing)} to ${usd(HF(b).all_at_or_under)}` : "\u2013");
/* Row 19 (CORRECTED): 158 of 1,364 (12%) taxed at 4%; 1,206 at 6%. */
must(X.without_kingston_lakes.legal_residence_4pct === 158 && X.without_kingston_lakes.assessed_6pct === 1206 && Math.round(158 / 1364 * 100) === 12, "row 19 changed");
/* Row 20 (CORRECTED): tax at $435,000: $1,688 and $5,336; write about $1,700 and about $5,300. */
const TAX_PRIMARY = 435000 * 0.04 * (201.0 - 109.1) / 1000 + 89.40, TAX_OTHER = 435000 * 0.06 * 201.0 / 1000 + 89.40;
must(Math.round(TAX_PRIMARY) === 1688 && Math.round(TAX_OTHER) === 5336 && X.tax_at_typical_price_435000.legal_residence === 1688 && X.tax_at_typical_price_435000.second_home_or_rental === 5336, "row 20 changed");
const T1 = Math.round(TAX_PRIMARY / 100) * 100, T2 = Math.round(TAX_OTHER / 100) * 100;
must(T1 === 1700 && T2 === 5300, "row 20 rounding changed");
/* Row 21: flood zone by building. */
const FB = F.flood_by_building;
must(FB["South Hampton"]["('AE', 'T')"] === 143 && FB["Brighton Towers"]["('0.2 PCT ANNUAL CHANCE FLOOD HAZARD', 'F')"] === 201 && FB["North Hampton"]["('0.2 PCT ANNUAL CHANCE FLOOD HAZARD', 'F')"] === 126
  && FB["Richmond Park"]["('0.2 PCT ANNUAL CHANCE FLOOD HAZARD', 'F')"] === 1 && FB["Richmond Park"].none === 182 && FB["Margate Tower"].none === 253, "row 21 changed");
const Z = X.without_kingston_lakes; void Z;
const HIGH = 143, MODERATE = 201 + 126 + 1, OUTSIDE = 1364 - HIGH - MODERATE;
must(MODERATE === 328 && OUTSIDE === 893 && F.flood_zone_by_unit.none - 256 === OUTSIDE, "row 21 totals changed");
/* Rows 9 and 10: outside every town, Myrtle Beach 29572, county zoning RC; the same tax district as Plantation Point. */
must(F.tax_districts["800"] === 1627, "row 9 changed");
/* Row 22: of the 63, 34 list oceanfront; the strip below uses that search. Row 3: half a mile of beach. */
/* Row 23 (CORRECTED): drives. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const DD = DR.drives;
const mins = (m) => (m < 15 ? Math.round(m) : Math.round(m / 5) * 5);
const D = { hosp: mins(DD["Grand Strand Medical Center"].minutes), barefoot: mins(DD["Barefoot Landing"].minutes), broadway: mins(DD["Broadway at the Beach"].minutes),
  mall: mins(DD["Coastal Grand Mall"].minutes), airport: mins(DD["Myrtle Beach International Airport terminal"].minutes) };
must(D.hosp === 9 && D.barefoot === 9 && D.broadway === 15 && D.mall === 20 && D.airport === 25, "row 23 changed");
must(DD["Barefoot Landing"].miles === 3.89 && DD["Grand Strand Medical Center"].miles === 3.83 && DD["Myrtle Beach International Airport terminal"].miles === 14.09, "row 23 miles changed");
/* The day the listing counts ran (owner, 2026-11-03: every count of homes for sale prints its day). */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`, RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the pilot's design).                         */

const INK = "#8a5226";
const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:${INK}!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .kp-wow{max-width:720px;margin:.2rem 0 1.4rem;padding:.9rem 0 .2rem;border-top:3px solid var(--brass);font-size:clamp(1.15rem,2.2vw,1.45rem);line-height:1.35;color:var(--navy);font-weight:600;text-wrap:balance}
main#main .kp-wow span{display:block;font-weight:400;font-size:.95rem;color:var(--muted);margin-top:.35rem}
main#main .kp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.6rem 0 1.4rem}
main#main .kp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .kp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .kp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main .c3-gchart,main#main .c3-cc,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain), labelled from county parcel points. */

const AIR = PHOTOS.find((r) => r.file.includes("kingston-plantation-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Kingston Plantation from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The buildings table (rows 8, 11, 14, 15): one row a building; cards on a phone. */

const SUB = (b) => `/homes/?subdivision=${encodeURIComponent("Kingston Plantation - " + (b === "St James Park" ? "St James Park HPR" : b))}`;
const BIG5 = ["Richmond Park", "Margate Tower", "Brighton Towers", "South Hampton", "West Hyde Park"];
const TABLE = compareCards(BUILDINGS.map((b) => ({
  name: b,
  href: SUB(b),
  bestFor: BUILT[b].replace(" to ", "\u00a0to\u00a0"),
  cells: {
    units: n(BU[b].units),
    sale: String(FOR_SALE[b]),
    sold: BIG5.includes(b) ? usd(SB[b].median) : "\u2013",
    fee: feeRange(b),
  },
})), [
  { key: "units", label: "Condos", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
  { key: "sold", label: "Sold, middle", num: true },
  { key: "fee", label: "HOA a month", num: true },
], { caption: "Kingston Plantation's 11 buildings side by side", nameLabel: "Building", bestForLabel: "Built" });

/* The middle price by building, five buildings with 9 or more sales (row 11). */
const PRICE_CHART = G.bars(BIG5.map((b) => ({ name: b, value: SB[b].median, feature: `${SB[b].n} sold` })).sort((a, b) => a.value - b.value), {
  caption: "What condos sold for in the past year, the middle price by building",
  nameLabel: "Building", featureLabel: "sales", valueLabel: "Middle sale price", compact: true,
  note: "Only buildings with 9 or more sales are shown. Prices are the stated price on each recorded deed, which is not always an arm's-length sale.",
});

/* Flood zones (row 21): condos in each zone, Kingston Lakes left out. */
const FLOOD_CHART = G.bars([
  { name: "Outside mapped flood zones", value: OUTSIDE, feature: "Margate Tower and 7 more", valueText: `${n(OUTSIDE)} condos` },
  { name: "Moderate zone", value: MODERATE, feature: "Brighton Towers, North Hampton", valueText: `${n(MODERATE)} condos` },
  { name: "High-risk zone", value: HIGH, feature: "South Hampton", valueText: `${n(HIGH)} condos` },
], {
  caption: "How many condos sit in each FEMA flood zone, by the county map",
  nameLabel: "Flood zone", featureLabel: "buildings", valueLabel: "Condos", compact: true, format: (v) => n(v) + " condos",
  note: "Each building is placed by the middle of its county parcel. One Richmond Park condo is in the moderate zone. Kingston Lakes is left out.",
});

/* The drives (row 23): one chart, minutes by car with no traffic. */
const DRIVES = G.bars([
  { name: "Barefoot Landing", value: D.barefoot },
  { name: "Grand Strand Medical Center", value: D.hosp },
  { name: "Broadway at the Beach", value: D.broadway },
  { name: "Coastal Grand Mall", value: D.mall },
  { name: "Myrtle Beach International Airport", value: D.airport },
].map((r) => Object.assign(r, { valueText: `${r.value} min` })), {
  caption: "Minutes by car from the middle of Kingston Plantation",
  nameLabel: "Place", valueLabel: "By car, about", compact: true,
  note: "With no traffic. Routes on OpenStreetMap roads.",
});

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  zoning: "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf",
  fema: "https://msc.fema.gov/portal/home",
  resort: "https://www.kingstonresorts.com",
  ace: "https://acerealtysc.realgeeks.com/kingston-plantation/",
  manual: "https://homesforsalelistings.net/wp-content/uploads/2021/02/kingston-manual.pdf",
  swa: "https://www.solidwasteauthority.org/recyclingcenters.html",
  swaRes: "https://www.solidwasteauthority.org/residential.html",
  decal: "https://cityofmyrtlebeach.com/i_want_to/apply_for/resident_parking_decal.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  naip: "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer",
  osm: "https://www.openstreetmap.org/",
};

/* ---------------------------------------------------------------------------- */
/* The offers (two) and the place, for search engines.                            */

const CONTACT = `/contact/?place=${encodeURIComponent("Kingston Plantation")}`;

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Kingston Plantation", alternateName: "Kingston Plantation, Myrtle Beach",
  description: `A condo community of about ${n(Math.round(X.without_kingston_lakes.units / 10) * 10)} condos in 11 buildings on the ocean in Myrtle Beach, South Carolina, outside the town limits, with a Myrtle Beach mailing address.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center[0], longitude: F.center[1] },
  address: { "@type": "PostalAddress", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29572", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "Kingston Plantation Myrtle Beach: Buildings, HOA, Prices",
  description: "Kingston Plantation in Myrtle Beach: 11 condo buildings, what each sold for, the HOA fees on current listings, the flood zone and the rental program.",
  ogTitle: "Kingston Plantation in Myrtle Beach: 11 condo buildings, and what each one sold for",
  crumb: "Kingston Plantation",
  eyebrow: "Kingston Plantation, Myrtle Beach",
  h1: "Kingston Plantation condos in Myrtle Beach:",
  h1em: "11 buildings, and what you pay depends on which one you pick.",
  /* The wow factor (row 11): the same community, about four times the price. */
  sub: `In the past year, recorded sales in Kingston Plantation ran from ${usd(SA.all.min)} to ${mil(SA.all.max)}, depending on the building.`,
  heroMedia: CSS + glance([
    { icon: "home", label: "Condos", text: "About 1,360" },
    { icon: "pin", label: "Buildings", text: "11" },
    { icon: "beach", label: "Beach", text: "Half a mile" },
    { icon: "dollar", label: "HOA a month", text: `${usd(500)} to ${usd(2100)}` },
  ]) + `<p class="kp-wow">A Margate Tower condo sold for a middle of ${usd(SB["Margate Tower"].median)}. A Richmond Park condo, in the same community, sold for ${usd(SB["Richmond Park"].median)}.<span>About four times the price, in one community. Middle prices from the past 12 months of recorded sales.</span></p>`,
  /* Round 2: the live homes strip is the first call to action; a button to /homes/ fails the audit. */
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Kingston Plantation is a resort-style community of about 1,360 condos in 11 buildings, on the ocean in Myrtle Beach. Listing agents describe it as gated.`,
    `In the past year ${SA.all.n} condos sold here, at a middle price of ${usd(SA.all.median)}. The building matters most, and the table below shows each one.`,
  ],
  sections: [
    { h2: "What is Kingston Plantation?", toc: "What it is", id: "what", html: () =>
      h.p(`Kingston Plantation is a community of condo buildings behind one name, on the beach at the north end of Myrtle Beach. Listing agents put it at about 145 acres, with half a mile of beach.`) +
      G.homesCss() + G.homesQScript() +
      G.homesQ("subdivision=Kingston Plantation&has=water_ocean", "Kingston Plantation condos listed as oceanfront") +
      h.p(`In the photo, Margate Tower, Brighton Towers, South Hampton and North Hampton stand along the sand. The other buildings sit behind them among lakes and trees.`) +
      AERIAL +
      h.p(`The resort's own site lists tennis and pickleball courts, a spa, a golf simulator, waterslides and a free shuttle across the property. It also lists a Hilton and an Embassy Suites hotel. Some of those amenities are for hotel guests or cost owners extra, so ask before you count on one.`) },

    { h2: "Which Kingston Plantation building should you look at?", toc: "The 11 buildings", id: "buildings", html: () =>
      h.p(`Kingston Plantation is 11 buildings, and they differ most in price. Open any building's name to see its condos for sale.`) +
      TABLE +
      `<p class="kp-note">Condos: county parcels. For sale: CCMLS listings. Sales: Horry County deeds recorded in the past 12 months. Built: the year on the listings. HOA a month: what listing agents entered, as the site's fee brackets. A building with fewer than 9 sales has no middle price.</p>` +
      h.p(`Five buildings sold enough condos in the past year to show a middle price. The chart shows what each one's condos went for.`) +
      PRICE_CHART +
      h.h3("Margate Tower") +
      h.p(`Margate Tower has the highest middle price, ${usd(SB["Margate Tower"].median)}. Seven are for sale now, from ${usd(M.price.min)} to ${mil(M.price.max)}, all with three or four bedrooms. Margate is the newest of the 11 buildings, by the years on the listings.`) +
      G.homesQ("subdivision=Kingston Plantation - Margate Tower", "Margate Tower: three and four bedrooms") +
      h.h3("Brighton Towers") +
      h.p(`Brighton Towers condos sold at a middle of ${r5k(SB["Brighton Towers"].median)}. Ten are for sale, from ${usd(B.price.min)} to ${usd(B.price.max)}. It is in the county's moderate flood zone, which the flood section explains.`) +
      G.homesQ("subdivision=Kingston Plantation - Brighton Towers", "Brighton Towers condos for sale now") +
      h.h3("South Hampton") +
      h.p(`South Hampton condos sold at a middle of ${r5k(SB["South Hampton"].median)}. Thirteen are for sale, from ${r5k(S.price.min)} to ${usd(S.price.max)}. It is the one building in a high-risk flood zone.`) +
      G.homesQ("subdivision=Kingston Plantation - South Hampton", "South Hampton condos for sale now") +
      h.h3("Richmond Park") +
      h.p(`Richmond Park had the most sales, at a middle of ${usd(SB["Richmond Park"].median)}. That is the lowest middle price of the five buildings in the chart. Twelve are for sale, from ${usd(R.price.min)} to ${r5k(R.price.max)}.`) +
      G.homesQ("subdivision=Kingston Plantation - Richmond Park", "Richmond Park condos for sale now") +
      h.h3("West Hyde Park") +
      h.p(`West Hyde Park condos sold at a middle of ${usd(SB["West Hyde Park"].median)}, and its listings start at ${usd(LS("West Hyde Park").price.min)}. The six smaller buildings sold too few for a middle price, and the table has their counts.`) +
      G.homesQ("subdivision=Kingston Plantation - West Hyde Park", "West Hyde Park condos for sale now") +
      h.p(`The county also lists a group of condo parcels called Kingston Lakes, all under one owner name. None sold in the past year and none is for sale, so they are left out of every count here. The resort's website lists Royale Palms, with one- to three-bedroom condos, as a separate property, and it is not counted either.`) +
      h.p(`To compare the beach towers here with other oceanfront buildings, see our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.`) },

    { h2: "What do Kingston Plantation condos sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`From 3 to 11 condos sold in a month, by the county deed index.`) +
      h.p(`On ${RUN}, ${LA.n} condos were for sale, asking ${usd(LA.price.min)} to ${mil(LA.price.max)}. They have one to four bedrooms, and most have two or three.`) +
      `<p class="kp-note">Sale prices: Horry County deeds recorded in the past 12 months, the stated price on each deed. Asking prices: CCMLS listings, counted in aggregate.</p>` +
      G.homesQ("subdivision=Kingston Plantation&max=350000", "Kingston Plantation condos under $350,000") +
      G.homesQ("subdivision=Kingston Plantation&min=700000", "Kingston Plantation condos at $700,000 and up") +
      h.p(`If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) },

    { h2: "What is the HOA fee at Kingston Plantation?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p(`Monthly fees on current listings are about ${usd(500)} to ${usd(2100)}. The fee follows the building: Richmond Park fees are about ${usd(700)} to ${usd(1300)}, and Margate Tower fees about ${usd(1500)} to ${usd(2100)}.`) +
      `<ul class="kp-rules" aria-label="How the HOA works at Kingston Plantation">`
        + `<li><strong>Two layers</strong>The resort's owner manual describes an association for each building, called a regime, and a Kingston Plantation Master Association above it. The manual is an older document, so we confirm the current setup.</li>`
        + `<li><strong>What the fee pays for</strong>The listing agent enters the fee. Each association decides what it covers, so we get that in writing for the building you pick.</li>`
        + `<li><strong>The resort amenities</strong>Listing agents write that some are only through the hotel rental program. They write that others cost owners extra, such as the fitness center, indoor pool, water park and courts. We find out which apply to your condo.</li>`
        + `</ul>` +
      G.homesQ("subdivision=Kingston Plantation&hoaMax=900", "Kingston Plantation condos with a fee of $900 a month or less") +
      h.cta("Like a building? Have us pull its association papers", "We pull the building's association papers and rental rules. Before you offer, we tell you what the fee covers and what the amenities cost.", "Have us pull the papers", CONTACT, bg) },

    { h2: "Can you rent out a Kingston Plantation condo?", toc: "Renting", id: "renting", html: () =>
      h.p(`The resort runs a rental program for owners. We pull the agreement with the association papers.`) +
      h.p(`County zoning has no limit on how long a home outside the towns may be rented. A building's rules or the master association's rules can have one. Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers renting by the night.`) },

    { h2: "Is Kingston Plantation in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`It depends on the building. On the county's FEMA map, South Hampton's ${HIGH} condos are in the high-risk zone, the zone where a lender requires flood insurance. Brighton Towers and North Hampton, and one Richmond Park condo, are in the moderate zone. The rest are outside the mapped zones. We checked each building against that map.`) +
      FLOOD_CHART +
      `<ul class="kp-rules" aria-label="What the flood map shows here">`
        + `<li><strong>Check the building</strong>We place each building by the middle of its parcel, and a building can sit across a zone line. A lender and an insurer decide by the building. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} explains what they look at.</li>`
        + `<li><strong>Flood history</strong>A zone does not show whether a condo has flooded. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how we check.</li>`
        + `</ul>` +
      G.homesQ("subdivision=Kingston Plantation&min=350000&max=500000", "Kingston Plantation condos from $350,000 to $500,000") +
      h.cta("Like a condo? Have us check its flood history", "Send us the listing. We check the building's flood zone and its flood history, and tell you what we find.", "Have us check a condo", CONTACT, bg) },

    { h2: "Is Kingston Plantation in Myrtle Beach or North Myrtle Beach?", toc: "Which town", id: "town", html: () =>
      h.p(`Myrtle Beach. Every listing here has a Myrtle Beach mailing address and the zip code 29572. The land is outside every town's limits, in Horry County. We checked the county's town map at the middle of the community, and no town is there. Three things change for an owner:`) +
      `<ul class="kp-rules" aria-label="What being outside the city limits changes">`
        + `<li><strong>Property tax</strong>The bill has county and school tax and no city tax. The yearly figures below already count that.</li>`
        + `<li><strong>Trash</strong>The county does not collect trash at the curb.</li>`
        + `<li><strong>City parking decal</strong>The city's resident parking decal needs a car registered in the city, so Kingston Plantation owners do not qualify.</li>`
        + `</ul>` +
      h.p(`The drive from the middle of the community is short to Barefoot Landing and the hospital, and longer to the mall and the airport.`) +
      DRIVES +
      G.homesQ("near=33.76795,-78.77984&miles=1&type=condo", "Condos for sale within a mile of Kingston Plantation") +
      h.p(`Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city's own neighborhoods and what changes inside its limits.`) },

    { h2: "What does a Kingston Plantation condo cost a year to own?", toc: "Yearly cost", id: "cost", html: () =>
      h.p(`Property tax on a condo at the middle price of ${usd(SA.all.median)} is about ${usd(T1)} a year as your ${h.a("/buyers/property-taxes/", "primary residence")}. As a second home or rental it is about ${usd(T2)} a year. Most bills also include a flat county fee of about $90. That is on top of the mortgage, insurance and the HOA fee.`) +
      h.p(`The county uses the lower rate only for the home an owner lives in full time. It does that for ${X.without_kingston_lakes.legal_residence_4pct} of the ${n(X.without_kingston_lakes.units)} condos here, or 12%.`) +
      h.p(`For one specific condo, our ${h.a("/buyers/property-records/tax-bill/", "tax bill lookup")} shows the county's tax figures for an address.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 3 miles) and ${h.a("/invest/condo-buildings/bay-watch-resort/", "Bay Watch Resort")} (about 5 miles). Farther north: ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} (about 7 miles) and ${h.a("/invest/condo-buildings/towers-on-the-grove/", "Towers on the Grove")} (about 9 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/margate-tower/", "Margate Tower")} (under a quarter mile) and ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about half a mile). Farther south: ${h.a("/invest/condo-buildings/margaritaville-vacation-residences/", "Margaritaville Vacation Residences")} (about half a mile) and ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 3 miles).`) + h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach, ${h.a("/submarkets/north-myrtle-beach/briarcliffe-acres/", "the town of Briarcliffe Acres")} and ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach. Then ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach, ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")} in North Myrtle Beach. Then ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach and ${h.a("/submarkets/conway/shaftesbury-glen/", "Shaftesbury Glen")} near Conway. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "Kingston Plantation FAQ",
  faq: [
    { q: "Is Kingston Plantation in North Myrtle Beach?", a: "No. Its mailing address is Myrtle Beach, and the land is outside every town's limits, in Horry County." },
    { q: "Is Kingston Plantation gated?", a: "Listings describe it as a gated community. The association papers we pull for a building say how the gate works for owners and guests." },
    { q: "Is there a rental program at Kingston Plantation?", a: "Yes. The resort runs a rental program for owners, and we pull its current agreement with the association papers." },
    { q: "Can you walk to the beach from Kingston Plantation?", a: "Margate Tower, Brighton Towers, South Hampton and North Hampton stand along the beach in the photo above. The other buildings are farther back, and we measure the walk from the one you like." },
    { q: "How far is Kingston Plantation from the airport?", a: `About ${D.airport} minutes by car, ${DD["Myrtle Beach International Airport terminal"].miles.toFixed(0)} miles, with no traffic. The hospital is about ${D.hosp} minutes away and Broadway at the Beach about ${D.broadway}.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "zoning", href: SRC.zoning },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "Kingston Resorts", href: SRC.resort },
    { name: "ACE Realty", href: SRC.ace },
    { name: "resort owner manual", href: SRC.manual },
    { name: "recycling centers", href: SRC.swa },
    { name: "trash pickup", href: SRC.swaRes },
    { name: "parking decal", href: SRC.decal },
    { name: "tax levy", href: SRC.levy },
    { name: "NAIP aerial photo", href: SRC.naip },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Kingston Plantation.",
    p: "Tell us which building and your budget. We line up the condos that fit, each with its fee, its flood zone and its yearly tax.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Kingston Plantation Myrtle Beach, Kingston Plantation condos for sale, Kingston Plantation HOA fees, Kingston Plantation map, Kingston Plantation oceanfront, Kingston Plantation rentals, Brighton Towers, South Hampton, Kingston Plantation flood zone",
  about: "Kingston Plantation, a community of 11 condo buildings on the ocean in Myrtle Beach, South Carolina, with its buildings, sale prices, HOA fees, flood zones and rental program",
});
