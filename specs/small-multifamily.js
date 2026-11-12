/* /invest/strategies/small-multifamily/ - how to buy a duplex, triplex or fourplex on the Grand Strand: how many are
 * for sale and what they ask, where they stand (most of them by the ocean), what they sold for by distance from the
 * ocean, what a unit rents for, the price per home, living in one unit on FHA or VA, FHA's rent test for a triplex or
 * fourplex, and nightly rentals on an FHA loan.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this is its first spec. Plan: Blog-Brain
 * batches/2026-11-b/invest-strategies-small-multifamily/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows, and
 * CORRECTED rows (5, 8, 14, 15, 16, 17, 26, 28, 29, 31, 33, R2) only in the verifier's wording (VERIFY.md).
 * Struck wording: batches/2026-11-b/facts/invest-strategies-small-multifamily-struck.json. Never on this page: the
 * 4.7 percent rent against the median price (row 31), the county's code meaning stated as the county's (row 5),
 * "inland" for Windtree Estates (rows 14, 33), "move out after a year" (row 20), any percentage from rows 26 and 28.
 * Data, never typed: data/2026-11-b/invest-strategies-small-multifamily/findings.json (listings in aggregate on the day
 * in meta.listings_pulled, parcels, deeds, the worked examples), pums-2to4.json (rents), raw/hud-limits-FHA-from-2026-10-d.html
 * (FHA's limits, row 21), and the county resale medians of /sell/home-value/ (row 31, data/2026-10-d/sell-home-value).
 * Design, as /sell/home-value/, /submarkets/garden-city/ and /invest/strategies/1031-exchange/: the italic line at about
 * half the H1's size, one card style for the chart, the worked box and the offers, plain tables and lists under thin
 * rules, one block width of 720 px, an offer after about every second section, each tied to that section.
 * Homes: the site's edge feed under the opening (MULTI, idx-lib/feeds.js), and three strips in "Where" for the beach
 * towns and Myrtle Beach. Fix round 1 (REVIEW-1.md): a wow line for each place (W7 to W10, VERIFIED-BY-FIXER), the
 * county figure only as "value for tax" and only to say where buildings cost less (row 14), places priced with the
 * sale bands (row 11), one offer per place group, a decision line in "Worth it", sentences of 28 words or fewer. Their places and withStrips: true are in Blog-Brain
 * batches/2026-11-b/invest-strategies-small-multifamily/BUILD.md for the lead (idx-lib is outside this page's folder).
 * Until they land, each strip stays empty and takes no space, and its place's offer pill shows instead.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/strategies/small-multifamily/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "invest-strategies-small-multifamily");
const F = JSON.parse(fs.readFileSync(path.join(DATA, "findings.json"), "utf8"));
const PUMS = JSON.parse(fs.readFileSync(path.join(DATA, "pums-2to4.json"), "utf8"));
const HV = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-10-d", "sell-home-value", "findings.json"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`small-multifamily.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r50 = (v) => money(Math.round(v / 50) * 50);
const yards = (m) => Math.round(m * 1.0936 / 10) * 10;
const miles = (m) => Math.round(m / 1609.34 * 10) / 10;

/* ---- Rows 1 to 4b: for sale now, our count of the listing feed, in aggregate. ---- */
const FS = F.for_sale, FH = FS.horry, BT = FS.horry_by_town;
must(FS.api_total === 65 && FS.outside_horry === 10 && FH.n === 55, "row 1: the count moved");
must(FH.median === 680000 && FH.p25 === 485000 && FH.p75 === 982000, "row 2: the middle ask moved");
must(BT["North Myrtle Beach"].n === 26 && BT["Myrtle Beach"].n === 11 && BT["Surfside Beach"].n === 9, "row 3: the town counts moved");
must(FS.ocean_bands["under 0.25 mile"].n === 32 && FS.ocean_bands["0.25 to 1 mile"].n === 14, "row 4: the ocean bands moved");
must(FS.all_horry_under_2unit_fha_limit === 28, "row 4a: the count under FHA's two-unit limit moved");
const PULLED = new Date(F.meta.listings_pulled);
must(!isNaN(PULLED), "findings.json meta.listings_pulled is not a date");
const PULL_DAY = PULLED.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const BIG3 = ["North Myrtle Beach", "Myrtle Beach", "Surfside Beach"];
const OTHER = Object.keys(BT).filter((t) => !BIG3.includes(t));
const OTHER_N = OTHER.reduce((s, t) => s + BT[t].n, 0);
must(OTHER_N + BIG3.reduce((s, t) => s + BT[t].n, 0) === FH.n, "row 3: the towns no longer add up to the county");
must(BIG3.every((t) => BT[t].n >= 9) && OTHER.every((t) => BT[t].n < 9), "row 3: a median is shown only for a town with 9 or more");
const NEAR_FS = FS.ocean_bands["under 0.25 mile"].n;

/* ---- Rows 5, 7, 8, 13, 14, 33: the county's parcels (our reading of the land-use codes). ---- */
const ST = F.stock, OB = ST.ocean_bands;
must(ST.total === 1268 && ST.units_total === 3001, "row 5: the parcel count moved");
const MEASURED = OB["under 0.25 mile"] + OB["0.25 to 1 mile"] + OB["1 to 3 miles"] + OB["over 3 miles"];
must(MEASURED === 1240 && OB["under 0.25 mile"] === 452 && OB["0.25 to 1 mile"] === 458, "row 8: the ocean bands moved");
const IN_MILE = (OB["under 0.25 mile"] + OB["0.25 to 1 mile"]) / MEASURED, IN_QTR = OB["under 0.25 mile"] / MEASURED;
must(IN_MILE > 0.7 && IN_MILE < 0.75 && IN_QTR > 1 / 3 && IN_QTR < 0.4, "row 8: 'nearly 3 in 4' and 'more than a third' no longer hold");
const NMB_TOTAL = ST.by_town.find(([t]) => t === "North Myrtle Beach")[1];
const NMB_QTR = ST.ocean_bands_by_town["North Myrtle Beach"]["under 0.25 mile"];
must(NMB_TOTAL === 439 && NMB_QTR === 354, "row 8: North Myrtle Beach's count moved");
const RT = ST.ratio, OWNER_RATE = RT["4%"] + RT.split;
must(OWNER_RATE === 213 && Math.round(ST.total / OWNER_RATE) === 6, "row 33: 'about 1 in 6' no longer holds");
const CL = Object.fromEntries(ST.clusters.map((c) => [c.name, c]));
const cl = (k) => { must(CL[k], `row 13: group ${k} is missing`); return CL[k]; };
const CG = cl("CHERRY GROVE BEACH"), CR = cl("CRESCENT BEACH"), WH = cl("WINDY HILL BEACH"), IB = cl("INGRAM BEACH"), OD = cl("OCEAN DRIVE BEACH");
const OT = cl("OCEAN TERRACE"), OP = cl("OCEAN PINES"), GC = cl("GARDEN CITY");
const WT = cl("WINDTREE ESTATES"), TB = cl("TARPON BAY II"), PR = cl("A PLACE AT THE RIVER");
must(CR.buildings === 119 && CG.buildings === 113 && WH.buildings === 43 && IB.buildings === 42 && OD.buildings === 24, "row 13: the North Myrtle Beach groups moved");
must(OT.buildings === 54 && OP.buildings === 32 && GC.buildings === 42 && WT.buildings === 49 && TB.buildings === 75 && PR.buildings === 22, "row 13: the other groups moved");
must(WT.codes["104"] === 49 && TB.codes["102"] === 75 && PR.codes["102"] === 22, "row 13: Windtree is no longer all fourplexes, or Tarpon Bay II and A Place at the River all duplexes");
const NMB_GROUPS = [IB, CG, OD, WH, CR];
const NMB_IN_GROUPS = NMB_GROUPS.reduce((s, c) => s + c.buildings, 0);
must(NMB_IN_GROUPS === 341, "row 13: the old beach towns' count moved");
const NEAR_YD = yards(Math.min(...NMB_GROUPS.map((c) => c.ocean_m_median))), FAR_YD = yards(Math.max(...NMB_GROUPS.map((c) => c.ocean_m_median)));
must(NEAR_YD === 160 && FAR_YD === 340, "row 13: the middle distances in North Myrtle Beach moved");
const BEACH_VAL = [CR, CG, OT, WH, IB, GC, OP].map((c) => c.county_value_median), AWAY_VAL = [WT, TB, PR].map((c) => c.county_value_median);
must(Math.min(...BEACH_VAL) === 447000 && Math.max(...BEACH_VAL) === 685000 && Math.min(...AWAY_VAL) === 230000 && Math.max(...AWAY_VAL) === 255000, "row 14: the county values moved");
must(Math.max(...AWAY_VAL) < 0.6 * Math.min(...BEACH_VAL), "row 14: the groups away from the beach no longer cost far less");
must(miles(WT.ocean_m_median) === 0.7 && miles(PR.ocean_m_median) === 2.7 && Math.round(miles(TB.ocean_m_median)) === 5, "rows 13, 14: the distances of the groups away from the beach moved");
must(OT.owner_4pct_or_split === 20 && WT.owner_4pct_or_split === 23 && TB.owner_4pct_or_split === 20 && CG.owner_4pct_or_split === 9 && IB.owner_4pct_or_split === 4, "row 33: the groups' owner-rate counts moved");

/* ---- W7 to W10: our measurements from each group's middle point (wow-measures.json, fix round 1). ---- */
const WOW = JSON.parse(fs.readFileSync(path.join(DATA, "wow-measures.json"), "utf8"));
const WW = WOW.windtree_estates, WTB = WOW.tarpon_bay_ii, WPR = WOW.a_place_at_the_river;
must(Math.round(WW.ocean_walk_min / 5) * 5 === 15 && Math.round(WW.hospital_drive_min) === 6, "W7, W8: the Windtree walk or drive moved");
must(Math.round(WTB.beach_drive_min) === 12 && Math.round(WPR.waterfront_straight_mi) === 1 && Math.round(WPR.waterfront_drive_min) === 4, "W9, W10: the Tarpon Bay II drive or the Little River waterfront moved");
must(miles(OT.ocean_m_median) === 0.5 && miles(OP.ocean_m_median) === 0.4 && miles(GC.ocean_m_median) === 0.6, "row 13: the Surfside Beach and Garden City distances moved");
const ALL_QTR = [OT, OP, GC].every((c) => c.ocean_m_median > 402 && c.ocean_m_median < 1609);
must(ALL_QTR, "row 11: Ocean Terrace, Ocean Pines and Garden City are no longer all a quarter mile to a mile from the ocean");
must(FAR_YD < 440, "row 11: the old beach blocks' middle buildings are no longer within a quarter mile");

/* ---- Rows 9 to 12: sales in the county deeds, our count. ---- */
const SO = F.sold, SB = SO.ocean_bands;
must(SO.all.n === 58 && SO.all.median === 520000 && SO.all_home_sales === 13194, "row 9: the sales moved");
must(Math.round(SO.all.n / SO.all_home_sales * 1000) === 4, "row 9: '4 in every 1,000' no longer holds");
must(SO.by_code["102"].n === 45 && SO.by_code["103"].n === 5 && SO.by_code["104"].n === 8 && SO.by_code["102"].median === 512000, "row 10: the sales by kind moved");
must(SB["under 0.25 mile"].median === 842000 && SB["0.25 to 1 mile"].median === 500000 && SB["1 to 3 miles"].median === 410000 && SB["over 3 miles"].median === 245000, "row 11: the prices by distance moved");
must(SB["under 0.25 mile"].n === 28 && SB["0.25 to 1 mile"].n === 16 && SB["1 to 3 miles"].n === 7 && SB["over 3 miles"].n === 5, "row 11: the sale counts by distance moved");
const [W_FROM, W_TO] = SO.window.match(/\d{4}-\d{2}-\d{2}/g).map((d) => new Date(d + "T12:00:00Z"));
const TIMES = Math.floor(SB["under 0.25 mile"].median / SB["over 3 miles"].median);
must(TIMES === 3, "row 11: 'more than 3 times' no longer holds");
must(SO.all.n - Object.values(SB).reduce((s, b) => s + b.n, 0) === 2, "row 11: the count of sales with no address point moved");
const monthYear = (d) => d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/* ---- Rows 15 to 17: rents from the Census survey (most of Horry County). ---- */
const CR2 = PUMS.contract_rent.small_2to4_2br, GR2 = PUMS.gross_rent.small_2to4_2br;
const CRA = PUMS.contract_rent.small_2to4_all, GRA = PUMS.gross_rent.small_2to4_all, HOUSE = PUMS.contract_rent.house_detached;
must(CR2.median === 1000 && GR2.median === 1135 && CRA.median === 947 && GRA.median === 1099 && HOUSE.median === 1400, "rows 15, 16: the rents moved");
const BR = PUMS.bedrooms_share_2to4_renters;
must(Math.round(BR["2"] / 10) === 6 && Math.round(BR["1"] / 10) === 2, "row 17: the bedroom shares moved");

/* ---- Row 31: the price per home (the 4.7 percent is struck and never printed). ---- */
const WE = F.worked_example, RM = HV.county_all;
must(WE.duplex_price_median_sold === SO.by_code["102"].median && WE.price_per_unit === 256000, "row 31: the duplex price per home moved");
must(RM.resale_house.median === 350000 && RM.resale_condo.median === 215000, "row 31: the county resale medians moved");

/* ---- Row 30: FHA's rent test, worked in rent only. Never a payment. ---- */
const SS = WE.fha_self_sufficiency_fourplex;
must(SS.units === 4 && SS.rent_each === CR2.median && SS.appraiser_rent_total === 4000 && SS.less_25pct === 3000 && SS.appraiser_rent_total * 0.75 === SS.less_25pct, "row 30: the worked test moved");

/* ---- Row 21: FHA's loan limits for Horry County, read from HUD's own page (copy in raw/). ---- */
const LIM_HTML = fs.readFileSync(path.join(DATA, "raw", "hud-limits-FHA-from-2026-10-d.html"), "utf8").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
const LIM_M = LIM_HTML.match(/HORRY COUNTY 051 SC (\$[\d,]+) (\$[\d,]+) (\$[\d,]+) (\$[\d,]+)/);
must(LIM_M, "row 21: Horry County's line is not in the HUD copy");
const LIMITS = LIM_M.slice(1, 5);
must(LIMITS.join(" ") === "$541,287 $693,050 $837,700 $1,041,125", "row 21: the limits moved");
const LIM_YEAR = (LIM_HTML.match(/CY(20\d\d)/) || [])[1];
must(LIM_YEAR, "row 21: the limits' year is not in the HUD copy");
must(Number(LIMITS[1].replace(/\D/g, "")) === 693050, "row 4a: the two-unit limit used for the count moved");

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const HUD = "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf";
const F92561 = "https://www.hud.gov/sites/dfiles/OCHCO/documents/92561.pdf";
const HUDLIM = "https://entp.hud.gov/idapp/html/hicostlook.cfm";
const FHLMC = "https://sf.freddiemac.com/general/maximum-ltv-tltv-htltv-ratio-requirements-for-conforming-and-super-conforming-mortgages";
const VAPUR = "https://www.va.gov/housing-assistance/home-loans/loan-types/purchase-loan/";
const SC12 = "https://www.scstatehouse.gov/code/t12c043.php";
const SC27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const SC27_39 = "https://www.scstatehouse.gov/code/t27c039.php";
const SC1 = "https://www.scstatehouse.gov/code/t01c001.php";
const NMB1968 = "https://www.scstatehouse.gov/sess117_2007-2008/prever/1325_20080423.htm";
const DNR = "https://dnr.sc.gov/fish/saltrecs/records.html";
const SSBPIER = "https://www.surfsidebeach.org/212/Surfside-Beach-Fishing-Pier";
const GCPIER = "https://www.pieratgardencity.com/story";
const CAMMY = "https://www.cammy.org/";
const SHRIMP = "https://littlerivershrimpfest.org/";
const GSMC = "https://www.mygrandstrandhealth.com/";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const PUMSURL = "https://www.census.gov/programs-surveys/acs/microdata.html";
const ASK = "/contact/";

/* ---- V1: what is for sale, by mailing city (rows 1 to 3), a real table that folds on a phone. ---- */
const townRow = (name, n, med) => `<tr><th scope="row">${name}</th><td><span class="l">For sale</span>${n}</td><td><span class="l">Middle asking price</span>${med}</td></tr>`;
const FOR_SALE = `<div class="ex-tw"><table class="ex-tab"><caption>Buildings of 2 to 4 units for sale in Horry County, our count on ${PULL_DAY}. Asking prices are rounded.</caption>`
  + `<thead><tr><th scope="col">Mailing address</th><th scope="col">For sale</th><th scope="col">Middle asking price</th></tr></thead><tbody>`
  + BIG3.map((t) => townRow(t, BT[t].n, `about ${r5k(BT[t].median)}`)).join("")
  + townRow(`${OTHER.slice(0, -1).join(", ")} and ${OTHER[OTHER.length - 1]}`, OTHER_N, "too few to say")
  + townRow("All of Horry County", FH.n, `about ${r5k(FH.median)}`)
  + `</tbody></table></div>`;

/* ---- V2: where the named groups are (rows 13, 14): each group's middle address point, from group-points.json
   (data/.../group_points.py, rounded to about 100 m; group centers only, no parcel). Numbered north to south, as the lists. ---- */
const GP = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(DATA, "group-points.json"), "utf8")).groups.map((g) => [g.name, g]));
/* The five old beach-town groups of North Myrtle Beach are one place on the map (the text names each), and Ocean Terrace,
   Ocean Pines and Garden City are one (they share one homes strip; as two markers, Garden City lost its name): each such point is the middle of its groups' points, weighted by buildings. */
const mid = (keys) => { const g = keys.map((k) => { must(GP[k] && CL[k] && GP[k].buildings === CL[k].buildings, `row 13: ${k} has no point or its count moved`); return GP[k]; });
  const n = g.reduce((t, x) => t + x.buildings, 0);
  return { lat: Math.round(g.reduce((t, x) => t + x.lat * x.buildings, 0) / n * 1000) / 1000, lon: Math.round(g.reduce((t, x) => t + x.lon * x.buildings, 0) / n * 1000) / 1000 }; };
const MAP_PLACES = [
  { name: "North Myrtle Beach's old beach towns", short: "North Myrtle Beach beach towns", ...mid(["CHERRY GROVE BEACH", "OCEAN DRIVE BEACH", "INGRAM BEACH", "CRESCENT BEACH", "WINDY HILL BEACH"]) },
  { name: "Surfside Beach and Garden City: Ocean Terrace, Ocean Pines and Garden City", short: "Surfside Beach and Garden City", ...mid(["OCEAN TERRACE", "OCEAN PINES", "GARDEN CITY"]) },
  { name: "A Place at the River, Little River", short: "A Place at the River", ...mid(["A PLACE AT THE RIVER"]) },
  { name: "Tarpon Bay II, near Forestbrook", short: "Tarpon Bay II", ...mid(["TARPON BAY II"]) },
  { name: "Windtree Estates, Myrtle Beach", short: "Windtree Estates", ...mid(["WINDTREE ESTATES"]) },
];
const MAP = (() => {
  const m = regionMap({ name: "Where the largest groups of duplexes, triplexes and fourplexes are in Horry County", places: MAP_PLACES, maxRatio: 1.1 },
    { dir: path.join(__dirname, "..", "chapter3realty", "images", "2026-11-b", "invest-strategies-small-multifamily"), src: "/images/2026-11-b/invest-strategies-small-multifamily", glass: true });
  return h.figure(m.html, `Where the largest groups of 2 to 4 unit buildings stand, each marked at the middle of its buildings. ${m.credit}`) + (m.unlabelled && m.unlabelled.length ? m.key : "");
})().replace('<figure style="margin:1.8rem 0;max-width:760px">', '<figure style="margin:1.8rem 0;max-width:720px">');

/* ---- The photo (record in this page's data folder, photos.json: the USGS 2011 oblique aerial of Crescent Beach that
   /buyers/no-hoa-homes/ shows, public domain, looked at full size). It shows the streets behind the oceanfront at Crescent
   Beach, beside the sentence about the old beach towns' streets. Its caption says only what it shows. ---- */
const PHOTOS = JSON.parse(fs.readFileSync(path.join(DATA, "photos.json"), "utf8")).photos;
const CRES = PH.findPhoto(PHOTOS, "crescent-beach-streets-from-the-ocean-2011");
const CRES_PHOTO = PH.heroPhoto(CRES, { alt: CRES.alt, caption: CRES.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.1rem 0 1.3rem;');
const CREDITS = PH.creditsList([{ photo: CRES, caption: "Crescent Beach in North Myrtle Beach" }]);

/* ---- V3: what they sold for by distance from the ocean (row 11). One message, in the verifier's title. ---- */
const BAND_NAMES = { "under 0.25 mile": "Within a quarter mile", "0.25 to 1 mile": "A quarter mile to a mile", "1 to 3 miles": "1 to 3 miles", "over 3 miles": "More than 3 miles" };
const PRICE_CHART = G.bars(Object.keys(BAND_NAMES).map((k) => ({
  name: BAND_NAMES[k], feature: `${SB[k].n} sales`, value: SB[k].median, valueText: r1k(SB[k].median),
})), {
  caption: "Buildings of 2 to 4 homes near the ocean sell for more",
  /* the middle sale price at the end of each bar; the note says it is the middle */
  nameLabel: "Distance from the ocean", featureLabel: "sales", valueLabel: "Middle sale price",
  note: `Middle sale price in the past year, by straight-line distance from the ocean, with the number of sales in each group. ${["None", "One", "Two", "Three", "Four"][SO.all.n - Object.values(SB).reduce((s, b) => s + b.n, 0)]} of the ${SO.all.n} sales had no address point to measure.`,
});

/* ---- V5: FHA's loan limits (row 21). ---- */
const UNITS = ["One home", "Duplex (2 units)", "Triplex (3 units)", "Fourplex (4 units)"];
const LIMIT_TABLE = `<div class="ex-tw"><table class="ex-tab ex-two"><caption>FHA's largest loan in Horry County, ${LIM_YEAR}</caption>`
  + `<thead><tr><th scope="col">Building</th><th scope="col">Loan limit</th></tr></thead><tbody>`
  + UNITS.map((u, i) => `<tr><th scope="row">${u}</th><td><span class="l">Loan limit</span>${LIMITS[i]}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* ---- V6: the worked rent test (row 30), in the page's card style. Rent only, never a payment. ---- */
const TEST_BOX = `<div class="ex-card" role="group" aria-labelledby="smfT"><p class="k" id="smfT">Worked example: FHA's rent test on a fourplex</p>`
  + `<ol class="ex-sum">`
  + `<li><span>Four 2-bedroom units at about ${money(SS.rent_each)} a month each</span><b>${money(SS.appraiser_rent_total)}</b></li>`
  + `<li><span>Less 25 percent for empty months and upkeep</span><b>&minus;${money(SS.appraiser_rent_total - SS.less_25pct)}</b></li>`
  + `<li class="t"><span>The rent FHA counts</span><b>${money(SS.less_25pct)}</b></li></ol>`
  + `<p class="n">FHA uses the appraiser's rent estimates, so your building's figures can differ.</p></div>`;

/* ---- The homes strips (BUILD.md has the places for the lead). The place's offer pill shows while a strip is empty. ---- */
const pill = (place, label) => G.offer(place, { label });
const strip = (slug, name, head, place, label) => G.homes(slug, name, pill(place, label), head);

/* ---- The page's own styles, as /invest/strategies/1031-exchange/. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const SURF = "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,inset 0 1px 0 rgba(255,255,255,.9)),var(--g-sh,0 10px 26px -18px rgba(28,32,40,.35))";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  + `${S} .c3-gchart,${S} .ex-tw,${S} .ex-card,${S} .ex-plain,${S} .ex-steps{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-gchart .v{font-weight:600}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  + `${S} .ex-tw{margin:1.3rem 0 1.4rem}`
  + `${S} .ex-tw table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .ex-tw caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem}`
  + `${S} .ex-tw thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .5rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom}`
  + `${S} .ex-tw tbody th{text-align:left;font-weight:600;padding:.65rem .8rem .65rem 0;border-bottom:${RULE};line-height:1.35;vertical-align:top}`
  + `${S} .ex-tw td{padding:.65rem .5rem .65rem 0;border-bottom:${RULE};vertical-align:top;font-variant-numeric:tabular-nums;white-space:nowrap}`
  + `${S} .ex-tw tbody tr:last-child th,${S} .ex-tw tbody tr:last-child td{border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .ex-tw td .l{display:none}`
  + `@media (max-width:599px){${S} .ex-tab,${S} .ex-tab tbody,${S} .ex-tab caption{display:block;width:100%}`
  + `${S} .ex-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .ex-tab tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:.8rem;align-items:end;padding:.7rem 0;border-bottom:${RULE}}`
  + `${S} .ex-tab.ex-two tr{grid-template-columns:minmax(0,1fr) auto;align-items:baseline}${S} .ex-tab.ex-two tbody th{grid-column:auto;padding-bottom:0}${S} .ex-tab.ex-two td .l{display:none}`
  + `${S} .ex-tab th,${S} .ex-tab td{border:0!important;padding:0}${S} .ex-tab tbody th{grid-column:1/-1;padding-bottom:.35rem}`
  + `${S} .ex-tab td{white-space:nowrap}${S} .ex-tab td .l{display:block;font-size:.8rem;color:var(--muted);line-height:1.3;margin-bottom:.1rem;white-space:nowrap}}`
  + `${S} .ex-card{margin:1.3rem 0 1.5rem;padding:1.2rem 1.3rem 1.1rem;border-radius:20px;${SURF};font-family:var(--sans);color:var(--navy)}`
  + `${S} .ex-card .k{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .7rem}`
  + `${S} .ex-sum{list-style:none;margin:0;padding:0}`
  + `${S} .ex-sum li{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding:.7rem 0;border-bottom:${RULE};font-size:1.0625rem;line-height:1.45;margin:0}`
  + `${S} .ex-sum li b{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600}`
  + `${S} .ex-sum li.t{border-bottom:0;border-top:1px solid rgba(28,32,40,.35);font-weight:700}${S} .ex-sum li.t b{font-family:var(--serif);font-size:1.35rem;font-weight:700}`
  + `${S} .ex-card .n{margin:.8rem 0 0;color:var(--muted);font-size:1rem;line-height:1.55}`
  + `${S} .ex-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .ex-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .ex-plain li:last-child{border-bottom:${RULE}}${S} .ex-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  + `${S} .ex-steps{list-style:none;counter-reset:xs;margin:1.1rem 0 1.4rem;padding:0}`
  + `${S} .ex-steps li{counter-increment:xs;position:relative;margin:0;padding:.8rem 0 .8rem 2.6rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .ex-steps li:last-child{border-bottom:${RULE}}${S} .ex-steps li::before{content:counter(xs);position:absolute;left:0;top:.8rem;width:1.8rem;height:1.8rem;border-radius:50%;background:rgba(196,120,58,.14);color:${INK};font-family:var(--sans);font-weight:700;font-size:1rem;line-height:1.8rem;text-align:center}`
  + `${S} .ex-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* a place in the "Where" lists: its name as a small heading, its text, then its homes strip or offer pill */
  + `${S} .smf-place{max-width:720px;padding:1.1rem 0 .4rem;border-top:${RULE}}${S} .smf-place h4{font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:0 0 .5rem;line-height:1.3}`
  + `${S} .smf-place .c3-offer{margin:.2rem 0 .6rem}`
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="ex-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const steps = (items) => `<ol class="ex-steps">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ol>`;
const place = (name, ...kids) => `<div class="smf-place"><h4>${name}</h4>${kids.join("")}</div>`;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. It does not make loans. BrickWood Mortgage is our affiliated lender, a separate company. Nothing on this page is a loan offer or tax advice.</p>`;

/* The FAQ repeats only questions the page answers, said short and in other words. Plain characters only. */
const FAQ = [
  { q: "What is the FHA loan limit for a duplex in Horry County?", a: `${LIMITS[1]} for ${LIM_YEAR}. The limit is the largest loan FHA insures on a duplex here, not the price you pay. It is higher for a triplex or a fourplex.` },
  { q: "Can I use a VA loan on a duplex?", a: "Yes. A veteran can buy a building of up to four units with a VA loan if the veteran will live in one of them." },
  { q: "How much down payment does a duplex need if I live in it?", a: "On an FHA loan, the same smallest down payment as a one-unit home, when every buyer on the loan will live there. Our affiliated lender, BrickWood Mortgage, a separate company, gives the numbers for one building." },
  { q: "Is a fourplex a commercial property?", a: "Not for an FHA home loan. FHA's home loan programs cover buildings of one to four homes that the buyer lives in." },
  { q: "Does the seller of a duplex have to give a disclosure form?", a: "Yes. The seller of a home of one to four units must give the buyer the state's disclosure form. A duplex or fourplex comes with the same form as a house." },
  { q: "Can a South Carolina city cap the rent on my units?", a: "No. South Carolina does not let a city or county limit rents on privately owned homes." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Strategies", url: "/invest/strategies/" },
  title: "Duplexes for Sale in Myrtle Beach: Prices, Rents, FHA Rules",
  description: `${FH.n} duplexes, triplexes and fourplexes for sale in Horry County: what they ask, where they stand, what a unit rents for, and FHA and VA rules to live in one.`,
  ogTitle: "Duplexes and fourplexes in Myrtle Beach: how many are for sale, where they stand, what a unit rents for, and FHA and VA rules",
  /* Our own share card (tools/ogcard.js), kept in this page's image folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/invest-strategies-small-multifamily/share.jpg",
  ogImageAlt: "How to buy a duplex or fourplex in Myrtle Beach. Nearly 3 in 4 of Horry County's duplexes, triplexes and fourplexes stand within a mile of the ocean.",
  crumb: "Duplexes and Fourplexes",
  eyebrow: "Investment strategy",
  h1: "How to buy a duplex or fourplex in Myrtle Beach",
  h1em: "Nearly 3 in 4 of Horry County's duplexes, triplexes and fourplexes stand within a mile of the ocean.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: `About ${n0(Math.round(ST.total / 10) * 10)} buildings of 2 to 4 homes stand in Horry County, most of them near the ocean, and few come up for sale.`,
  heroMedia: CSS + G.homesCss(),
  heroCta: { title: "Tell us your budget and whether you will live in one unit. We send the buildings that fit.", label: "Send me buildings that fit", href: ASK },
  author: "devin",
  shortAnswer: [
    `On ${PULL_DAY}, ${FH.n} buildings listed as 2 to 4 units were for sale in Horry County. Their middle asking price was about ${r5k(FH.median)}.`,
    `In the past year, ${SO.all.n} sold at a middle price of about ${r1k(SO.all.median)}. Those within a quarter mile of the ocean sold for about ${r1k(SB["under 0.25 mile"].median)}.`,
    "If you will live in one unit, you can buy a building of up to four units with an FHA or VA loan. On an FHA loan, you may not rent any unit for under 30 days.",
  ],
  sections: [
    { h2: "How do you buy a duplex or fourplex in Myrtle Beach?", toc: "Steps", id: "steps", html: () =>
      h.p("A duplex, triplex or fourplex is two, three or four homes in one building, bought in one purchase with one loan. You can live in one unit and rent the others, or rent them all. Buying one takes five steps:") +
      steps([
        ["Pick the kind of building and the place", `Buildings by the ocean cost more. Buildings away from the old beach blocks cost less. We send you the buildings for sale on the Grand Strand in the place you pick.`],
        ["Add up the rent roll", `The rent roll is the rent from every unit added together. For one building, our agents run the number for each unit from current local leases and listings, at no cost, before you write the offer.`],
        ["Look at the whole building", `We go through the expenses and any association documents with you before you write an offer.`],
        ["Choose how you will pay", `If you will live in one unit, you can buy it with an FHA, VA or conventional loan. If you will not, you can use an investor loan such as a DSCR loan. We introduce our affiliated lender, BrickWood Mortgage, a separate company, for the numbers.`],
        ["Offer and close", `We write the offer with you and work with you up to closing. The seller gives you the state's disclosure form before you both sign the contract, the same form a house comes with.`],
      ]) },

    { h2: "How many duplexes are for sale in Myrtle Beach, and what do they cost?", toc: "For sale", id: "for-sale", html: () =>
      h.p(`Few. Half of the ${FH.n} buildings for sale ask between about ${r5k(FH.p25)} and ${r5k(FH.p75)}.`) +
      FOR_SALE +
      h.p(`North Myrtle Beach has the most and the highest asking prices. We checked each listing's distance to the ocean: ${NEAR_FS} of the ${FH.n} stand within a quarter mile.`) +
      h.p(`They sell rarely too. ${SO.all.n} sold in the past year, about 4 in every 1,000 home sales in the county. Of those, ${SO.by_code["102"].n} were duplexes, ${SO.by_code["103"].n} triplexes and ${SO.by_code["104"].n} fourplexes. The middle duplex sold for about ${r1k(SO.by_code["102"].median)}.`) },

    { h2: "Where are the duplexes and fourplexes on the Grand Strand?", toc: "Where", id: "where", html: (bg) =>
      h.p(`By the ocean. Horry County's tax records put about ${n0(Math.round(ST.total / 10) * 10)} parcels with a building under the land-use codes we read as two-, three- and four-family buildings, about ${n0(Math.round(ST.units_total / 100) * 100)} homes in all.`) +
      h.p(`Nearly 3 in 4 of them stand within a mile of the ocean, in a straight line, and more than a third within a quarter mile. Of the ${NMB_TOTAL} with a North Myrtle Beach mailing address, ${NMB_QTR} stand within a quarter mile.`) +
      MAP +
      PRICE_CHART +
      h.h3("The beach towns") +
      place("North Myrtle Beach's old beach towns",
        h.p(`North Myrtle Beach was ${h.ext(NMB1968, "formed in 1968 from four beach towns")}: Cherry Grove, Ocean Drive, Crescent Beach and Windy Hill. About ${Math.round(NMB_IN_GROUPS / 10) * 10} of the city's ${NMB_TOTAL} duplexes, triplexes and fourplexes stand on the old streets of these towns and of Ingram Beach beside them. The middle building in each stands about ${NEAR_YD} to ${FAR_YD} yards from the ocean.`),
        CRES_PHOTO,
        h.p(`${h.ext(SC1, "The shag")} is South Carolina's official state dance, by law since 1984, and the state Senate calls North Myrtle Beach its home. Each November, the ${h.ext(CAMMY, "Carolina Beach Music Awards")} weekend brings beach music bands to the stages of the shag clubs on Main Street.`),
        h.p(`Within a quarter mile of the ocean, buildings like these sold for about ${r1k(SB["under 0.25 mile"].median)} at the middle in the past year.`),
        strip("north-myrtle-beach-duplexes", "North Myrtle Beach", "Live in one, rent the rest in North Myrtle Beach", "North Myrtle Beach", "Get the duplexes for sale in North Myrtle Beach")) +
      place("Surfside Beach: Ocean Terrace and Ocean Pines",
        h.p(`${h.ext(SSBPIER, "The Surfside Beach Fishing Pier")} is 814 feet long, all concrete, owned by the town and opened in 2024. Walking on it is free.`),
        h.p(`Ocean Terrace has ${OT.buildings} of these buildings and Ocean Pines ${OP.buildings}. The middle building in each stands about ${Math.min(miles(OT.ocean_m_median), miles(OP.ocean_m_median))} to ${Math.max(miles(OT.ocean_m_median), miles(OP.ocean_m_median))} mile from the ocean. In Ocean Terrace, ${OT.owner_4pct_or_split} of the ${OT.buildings} are taxed at the owner's 4 percent rate on all or part.`)) +
      place("Garden City",
        h.p(`${h.ext(GCPIER, "The Garden City Pier")} was rebuilt after Hurricane Hugo destroyed the old one in 1989. At its far end, the rain shelter has a bandstand and a dance floor bar. People learn line dances there, out over the ocean.`),
        h.p(`Garden City, where the mail goes to Murrells Inlet, has ${GC.buildings} of these buildings, about ${miles(GC.ocean_m_median)} mile from the ocean at the middle. A quarter mile to a mile from the ocean, as here and in Surfside Beach, buildings sold for about ${r1k(SB["0.25 to 1 mile"].median)} at the middle.`),
        strip("surfside-garden-city-duplexes", "Surfside Beach and Garden City", "Your own beach-town rental in Surfside Beach and Garden City", "Surfside Beach and Garden City", "Get the duplexes for sale in Surfside Beach and Garden City")) +
      h.h3("Away from the old beach blocks") +
      h.p(`Three large groups away from the old beach blocks cost less. The county's middle value for tax is about ${r1k(Math.min(...AWAY_VAL))} to ${r1k(Math.max(...AWAY_VAL))} in these groups, and about ${r1k(Math.min(...BEACH_VAL))} to ${r1k(Math.max(...BEACH_VAL))} in the largest beach groups. It is a figure for the tax bill, not a sale price.`) +
      place("A Place at the River, Little River",
        h.p(`The old Little River waterfront is about a mile from A Place at the River, about ${Math.round(WPR.waterfront_drive_min)} minutes by car. Each October, more than 200 vendors and two stages of live music set up there for ${h.ext(SHRIMP, "Little River ShrimpFest")}.`),
        h.p(`All ${PR.buildings} buildings in A Place at the River are duplexes, about ${miles(PR.ocean_m_median)} miles from the ocean.`)) +
      place("Tarpon Bay II, near Forestbrook",
        h.p(`All ${TB.buildings} buildings in Tarpon Bay II are duplexes, the largest group of them away from the beach. More than 3 miles from the ocean, as here, buildings sold for about ${r1k(SB["over 3 miles"].median)} at the middle, the least of any distance.`),
        h.p(`The neighborhood is near Forestbrook, outside any town limits, about ${Math.round(miles(TB.ocean_m_median))} miles from the ocean in a straight line. The nearest beach is about ${Math.round(WTB.beach_drive_min)} minutes by car.`)) +
      place("Windtree Estates, Myrtle Beach",
        h.p(`Windtree Estates is inside the City of Myrtle Beach, around 62nd to 67th Avenue North. From the middle of it, the beach is about a ${Math.round(WW.ocean_walk_min / 5) * 5}-minute walk. ${h.ext(GSMC, "Grand Strand Medical Center")}, a hospital with a heart surgery program, is about ${Math.round(WW.hospital_drive_min)} minutes by car.`),
        h.p(`All ${WT.buildings} buildings in Windtree Estates are fourplexes. ${WT.owner_4pct_or_split} of the ${WT.buildings} are taxed at the owner's rate on all or part, the highest share of the large groups.`)) +
      strip("myrtle-beach-duplexes", "Myrtle Beach", "Several rents, one closing: Myrtle Beach duplexes and fourplexes", "Myrtle Beach", "Get the duplexes and fourplexes for sale in Myrtle Beach") },

    { h2: "What does a duplex unit rent for in Myrtle Beach?", toc: "Rents", id: "rents", html: () =>
      h.p(`In most of Horry County, a 2&#8209;bedroom unit in a building of 2 to 4 units rents for about ${money(CR2.median)} a month. With the utilities the tenant pays, the total is about ${money(GR2.median)}.`) +
      plain([
        ["Any unit in these buildings", `About ${r50(CRA.median)} a month, or about ${r50(GRA.median)} with utilities.`],
        ["A house, for comparison", `About ${r50(HOUSE.median)} a month in rent.`],
        ["Bedrooms", `About 6 in 10 rented units in these buildings have 2 bedrooms, and about 2 in 10 have one.`],
      ]) +
      h.p(`These are the rents tenants pay now, on leases of every age. ${h.a("/invest/rent-prices/", "Our rent prices guide")} has what landlords ask for a new lease, by ZIP code. South Carolina does not let a city or county limit rents on privately owned homes.`) },

    { h2: "Is a duplex a good investment in Myrtle Beach?", toc: "Worth it", id: "worth-it", html: (bg) =>
      h.p(`Yes, if you will live in one unit. You can buy it with an FHA or VA home loan. On FHA, the other units' rent can count toward your income. Your own unit can be taxed at the owner's 4 percent rate.`) +
      h.p(`If you will rent every unit, the whole building is taxed at 6 percent, and you borrow a smaller share of the price. Then two things count most: what each home costs, and where the building stands.`) +
      plain([
        ["What each home costs", `Per home, the middle duplex sold for about ${r1k(WE.price_per_unit)}. In the same 12 months, a resold house or other home sold for about ${r1k(RM.resale_house.median)} and a resold condo for about ${r1k(RM.resale_condo.median)}.`],
        ["Where you buy", `At the middle, a building within a quarter mile of the ocean sold for more than ${TIMES} times as much as one over 3 miles away.`],
        ["How often one comes up", `About 4 in every 1,000 home sales in the county are one of these buildings. We send you each new one in your price range as it lists.`],
      ]) +
      h.p(`${h.a("/invest/run-the-numbers/", "How to run the numbers on a rental")} lists the costs of owning one building.`) +
      h.cta("Have us run the rents and costs on one building.", "Send us the address. We work out each unit's rent from current local leases and listings, and the expenses, before you write an offer, at no cost.", "Have us run the numbers", ASK, bg) },

    { h2: "Can you live in one unit and rent the others? FHA and VA in Horry County", toc: "Live in one", id: "live-in-one", html: () =>
      h.p(`Yes. Living in one unit and renting the others is called house hacking. ${h.ext(HUD, "FHA insures loans")} on buildings of one to four units that the buyer will live in as their main home.`) +
      h.p("At least one buyer must move in within 60 days of signing and plan to live there for at least a year.") +
      LIMIT_TABLE +
      h.p(`${FS.all_horry_under_2unit_fha_limit} of the ${FH.n} buildings for sale ask less than FHA's two-unit loan limit.`) +
      h.h3("Loans that fit a building you live in") +
      plain([
        ["FHA", "Rent from the other units can count toward your income. With no rent history, the lender counts 75 percent of the lower of the appraiser's market rent and the lease."],
        ["VA", `A veteran can ${h.ext(VAPUR, "buy a home of up to 4 units with a VA loan")}, if the veteran will live in it. ${h.a("/buyers/va-loans/", "Our VA loan guide")} covers who qualifies.`],
        ["Conventional", `On ${h.ext(FHLMC, "Freddie Mac's")} standard loans, the top loan on a 2 to 4 unit building you live in matches its top loan on a one-unit home. Freddie Mac's system must accept the loan. Some of its low down payment programs allow more on a one-unit home only.`],
      ]) +
      h.p("When every buyer on the loan will live there, FHA asks the same smallest down payment on a duplex or fourplex as on a one-unit home. If a co-borrower, even a family member, will not live in a 2 to 4 unit building, FHA asks for a much larger down payment.") +
      h.p(`${h.a("/buyers/first-time-home-buyer-myrtle-beach/", "Our first-time buyer guide")} has FHA's other rules.`) +
      h.h3("If you will not live there") +
      h.p(`On Freddie Mac's loans, an investor who lives elsewhere borrows a smaller share of the price. ${h.a("/invest/strategies/dscr-loans/", "A DSCR loan")} is one choice: the lender qualifies the loan on the rent, not on your income.`) +
      h.h3("The tax on a building you live in") +
      h.p(`In South Carolina, ${h.ext(SC12, "the home you live in is taxed")} on 4 percent of its value, once you apply. The rented units on the same property are taxed on 6 percent. ${h.a("/buyers/property-taxes/", "Our property tax guide")} covers the application.`) +
      h.p(`About 1 in 6 of these buildings is taxed at the owner's 4 percent rate on all or part of it.`) },

    { h2: "What is the FHA self-sufficiency test for a triplex or fourplex?", toc: "FHA test", id: "fha-test", html: (bg) =>
      h.p(`For an FHA loan on a triplex or fourplex, ${h.ext(HUD, "the rents must cover the loan")}. FHA takes the rent from every unit, including yours, and subtracts 25 percent, or the appraiser's figure for empty months and upkeep if that is larger. The monthly loan payment, taxes and insurance must not be more than what is left.`) +
      TEST_BOX +
      h.p("The lender must also see savings equal to three months of the full monthly payment, taxes and insurance, left after closing. A duplex does not take the test.") +
      h.cta("Buying a triplex or fourplex with FHA?", "Send us the building. Our affiliated lender, BrickWood Mortgage, a separate company, works out whether its rents pass FHA's test.", "Send us the building", ASK, bg) },

    { h2: "Can you Airbnb a duplex in Myrtle Beach?", toc: "Airbnb", id: "airbnb", html: () =>
      h.p(`Not on an FHA loan. On an FHA loan for a 2 to 4 unit building, the buyer signs ${h.ext(F92561, "HUD's form 92561")}. On it, the buyer promises not to rent any part of the building for under 30 days, or with hotel services, while the FHA loan is in place.`) +
      h.p(`Each town on the Grand Strand has its own rules for nightly rentals. ${h.a("/invest/str-rules/", "Our short-term rental rules guide")} covers them. Renting to summer workers by the season is in ${h.a("/invest/j1-rentals/", "our J-1 rentals guide")}.`) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([CRES]) + LEGAL,
  faqTitle: "Duplex and fourplex FAQ",
  faq: FAQ,
  sources: [
    { name: "HUD Handbook 4000.1", href: HUD },
    { name: "HUD-92561", href: F92561 },
    { name: "FHA limits", href: HUDLIM },
    { name: "Freddie Mac", href: FHLMC },
    { name: "VA", href: VAPUR },
    { name: "SC Code 12-43", href: SC12 },
    { name: "SC Code 27-50", href: SC27_50 },
    { name: "SC Code 27-39", href: SC27_39 },
    { name: "Census ACS", href: PUMSURL },
    { name: "County parcels", href: PARCELS },
    { name: "County deeds", href: DEEDS },
  ],
  sourcesNote: `For sale: our count of the listing feed on ${PULL_DAY}. Buildings: county parcels, by our reading of the land-use codes. Sales: deeds of ${monthYear(W_FROM)} to ${monthYear(W_TO)}. Distances are straight lines. Rents: Census, 2020 to 2024, most of Horry County.`,
  bottomCta: { h2: "Found a duplex or fourplex you like?", p: "Call 854.333.2135, or send us an address, the kind of building you want and your budget. We send the buildings that fit, with the rents and costs on each.", label: "Send us a building", href: ASK },
  keywords: "duplex for sale Myrtle Beach, fourplex for sale Myrtle Beach, duplex North Myrtle Beach, duplex Surfside Beach, triplex Myrtle Beach, FHA duplex loan limit Horry County, FHA self-sufficiency test, VA loan duplex, house hacking Myrtle Beach, buying a duplex and living in one side",
  about: "Buying a building of 2 to 4 homes (a duplex, triplex or fourplex) in Horry County, South Carolina",
});
