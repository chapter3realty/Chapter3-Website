/* /submarkets/little-river/ - living in Little River, SC: what a normal week is like on the water, who
 * runs the place, the deeded boat slips and the public ramps, the five parts of Little River, which homes
 * flood, what a home costs and costs to own each year, what a rental earns, and the road everyone asks about.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-02; review round 1 the same day (REVIEW-1.md: the five parts
 * sell daily life before price, flood said once, slip sizes, slip tax, the state's insurance sample rates,
 * the Blue Crab Festival and the golf courses from fixer-verified rows R1-1 to R1-7). The live page was hand-made (an "Investor Report" with
 * a town guide bolted on); this is its first spec, and it is now a town guide for a buyer who will live
 * here, often with a boat, with one section for the landlord.
 * Facts: Blog-Brain batches/2026-11-a/submarkets-little-river/facts.md (VERIFIED rows, and CORRECTED rows
 * in the verifier's safe wording only; VERIFY.md; struck wording in submarkets-little-river-struck.json).
 * Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-a/submarkets-little-river/ (findings.json from analyze.py; chart-seasonal.json;
 * map-little-river.geojson and map-points.json for our two maps; raw/drives.json; photos.json).
 * Every count, share, price and drive time is read from those files here and checked against its ledger
 * row, never typed. Where the verifier corrected a figure the data file still carries (rows 8, 11, 14, 33,
 * 34), the corrected figure is typed from its row with the row number beside it.
 * Kept from the live page: the H1 (data/headlines.json, the owner liked it), the homes feed (the website's
 * edge adds "Top homes in Little River", idx-lib/feeds.js), "no city ordinance, county rules" for rentals,
 * the 4 and 6 percent rule, about 10 minutes to Cherry Grove (row 35 measures 11), the links to property
 * taxes, coastal insurance, short-term rental rules, Airbnb income and the rental analyzer.
 * Not kept (judge 2026-10-31; PLAN.md "What must not survive"): the "illustrative" occupancy chart and the
 * AirROI block, the investor thesis and its jargon, the financing section, Redfin's and Zillow's figures,
 * "9,692 (2020 Census)", "manufactured ... a large part", First Street's 23 percent, "construction around
 * 2029", the school table, the crime how-to, the "Investor Hub" crumb.
 * Pictures: our own map of the water (marinas, landings, FEMA's high-risk zone, North Myrtle Beach's
 * limits) and our own map of the five parts, drawn here from county polygons (area-map.js takes no polygon
 * overlay; NEEDS.md 1); a drive-time map (tools/area-map.js); glass bar charts (tools/glass.js); two
 * labelled USDA NAIP aerials, public domain (photos.json), until the photo partner's shots arrive
 * (shot-list.md). Wikimedia Commons has no usable photo of Little River (VERIFY.md, "Photo candidates").
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance, prosCons } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));

const SELF = "/submarkets/little-river/";
const SLUG = "submarkets-little-river";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", SLUG);
const IMG_DIR = path.join(__dirname, "..", "chapter3realty", "images", "2026-11-a", SLUG);
const IMG_SRC = `/images/2026-11-a/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), SEASONAL = read("chart-seasonal.json"), POINTS = read("map-points.json");
const DRIVES = read("raw/drives.json"), PHOTOS = read("photos.json").photos, GEOJ = read("map-little-river.geojson");

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r100 = (v) => money(Math.round(v / 100) * 100);
const near = (v, step) => n(Math.round(v / step) * step);
const r10 = (v) => money(Math.round(v / 10) * 10);
const must = (ok, msg) => { if (!ok) throw new Error(`little-river.js: ${msg}`); };
const title = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/'S\b/g, "'s");

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 3: people (Little River CDP). */
const CEN = F.census["Little River CDP"], CTY = F.census["Horry County"];
must(CEN.pop_2020 === 11711 && CEN.pop_2010 === 8960 && CTY.pop_2020 === 351029, "row 3 changed");
const GROWTH = Math.round((CEN.pop_2020 - CEN.pop_2010) / CEN.pop_2010 * 100);       // 31
const CGROWTH = Math.round((CTY.pop_2020 - CTY.pop_2010) / CTY.pop_2010 * 100);      // 30
must(GROWTH === 31 && CGROWTH === 30, "row 3 growth");

/* Row 4: seasonal homes, 2020 Census. */
const SEAS = Object.fromEntries(SEASONAL.map((r) => [r.place, r]));
must(SEAS["Little River CDP"].seasonal_pct === 19.1 && SEAS["North Myrtle Beach city"].seasonal_pct === 48.4 && SEAS["Garden City CDP"].seasonal_pct === 39.5 && SEAS["Horry County"].seasonal_pct === 17.6, "row 4 changed");

/* Rows 2 and 7: the ZIP, its homes, the corner inside North Myrtle Beach. */
const HZ = F.homes_zip;
must(HZ.all === 15613 && HZ.by_kind.house === 9995 && HZ.by_kind.condo === 4297 && HZ.by_kind.manufactured === 757 && HZ.by_kind.townhouse === 437, "row 7 changed");
must(HZ.inside_north_myrtle_beach === 246 && F.areas_sq_mi.zip_inside_north_myrtle_beach === 1.4 && F.areas_sq_mi.zip_29566 === 30.9, "row 2 changed");
const pct = (k) => Math.round(HZ.by_kind[k] / HZ.all * 100);
must(pct("house") === 64 && pct("condo") === 28 && pct("manufactured") === 5 && pct("townhouse") === 3, "row 7 shares");

/* Rows 5, 6, 38: tax. */
const WX = F.worked_example;
must(WX.price === 357000 && WX.rent_3br_month === 2100 && WX.rent_year === 25200 && WX.tax_6pct === 4395 && WX.tax_4pct === 1402 && WX.gross_rent_to_price_pct === 7.1 && WX.tax_6pct_share_of_rent === 17.4, "row 38 changed");
const TAX_HOME = r100(WX.tax_4pct), TAX_RENT = r100(WX.tax_6pct);                     // $1,400 and $4,400

/* Rows 10, 11, 12, 13, 14: water, slips and slip sales. */
const WH = F.water_homes_zip;
must(WH.n === 531 && WH.by_kind.condo === 353 && WH.by_kind.house === 162, "row 10 changed");
const SL = F.slips, SLIP = Object.fromEntries(SL.by_marina_zip);
must(SL.county === 322 && SL.in_zip === 223 && SLIP["Mariner's Pointe"] === 116 && SLIP["Coquina Harbour"] === 81 && SLIP["Lightkeepers Village"] === 25, "row 12 changed");
must(SL.county_value_zip.q1 === 35000 && SL.county_value_zip.q3 === 45000, "row 12 county values changed");
/* Row R1-1 (fixer): two land-use-306 parcels are not slips (Coquina Harbor North's 2-acre tract, and the
   Bryant Dr & Wharf Av parcel), so the ZIP has 221 deeded slips (Coquina 80) and the county 320. */
const COQ_SLIPS = SLIP["Coquina Harbour"] - 1, SLIPS_ZIP = SLIP["Mariner's Pointe"] + COQ_SLIPS + SLIP["Lightkeepers Village"];
must(SLIPS_ZIP === 221 && SL.county - 2 === 320 && Math.round(SLIPS_ZIP / 320 * 3) === 2, "row R1-1 changed");
/* Row R1-2: slip lengths from the county's parcel outlines (slip-sizes.json, slip_sizes.py). */
const SZ_SLIP = read("slip-sizes.json").by_marina;
must(SZ_SLIP["Mariner's Pointe"].len_median === 33.1 && SZ_SLIP["Mariner's Pointe"].len_buckets["30"] + SZ_SLIP["Mariner's Pointe"].len_buckets["35"] === 85
  && SZ_SLIP["Coquina Harbour"].n_slip_sized === 80 && SZ_SLIP["Lightkeepers Village"].len_median === 55.1
  && SZ_SLIP["Dock Holidays Marina"].len_min === 39.7 && SZ_SLIP["Dock Holidays Marina"].len_max === 50.6, "row R1-2 changed");
/* Row R1-4: a slip pays tax at 6 percent of the county's value, 201.0 mills (rows 5 and 6). */
must(SL.county_value_by_marina_zip["Mariner's Pointe"].median === 38000, "row R1-4 value changed");
const SLIP_TAX = r10(38000 * 0.06 * 0.201);                                           // $460
must(SLIP_TAX === "$460", "row R1-4 tax");
/* Review round 2: most Mariner's Pointe slips are valued at $38,000 or more (q1), and 10 of the 11 sales were below it. */
must(SL.county_value_by_marina_zip["Mariner's Pointe"].q1 >= 38000, "row R1-4: fewer than three in four Mariner's Pointe slips are valued at $38,000 or more");
const DOCK_HOLIDAYS_SLIPS = Object.fromEntries(SL.outside_zip_by_marina)["Dock Holidays Marina"];
must(DOCK_HOLIDAYS_SLIPS === 93, "row 12: Dock Holidays count changed");
const SS = F.slip_sales;
const MP_SALES = SS.list.filter((s) => s.marina === "Mariner's Pointe").map((s) => s.price).sort((a, b) => a - b);
must(MP_SALES.filter((v) => v < 38000).length === 10, "Mariner's Pointe: no longer 10 of 11 sales under the county's middle value");
must(MP_SALES.length === 11 && MP_SALES[0] === 10000 && MP_SALES[10] === 38000 && SS.by_marina_zip["Mariner's Pointe"].median === 16500, "row 13 changed");
must(SS.by_marina_zip["Lightkeepers Village"].n === 1 && SS.by_marina_zip["Lightkeepers Village"].median === 95000 && !SS.by_marina_zip["Coquina Harbour"], "row 13 Lightkeepers or Coquina changed");
/* Row 14, corrected: the $190,000 deed was two slips; drop it. */
const DH = SS.list.filter((s) => s.marina === "Dock Holidays Marina" && s.price !== 190000).map((s) => s.price).sort((a, b) => a - b);
const DH_MID = (DH[4] + DH[5]) / 2;
must(DH.length === 10 && DH[0] === 65000 && DH[9] === 115000 && DH_MID === 92500, "row 14 (corrected) changed");

/* Row 15: county landings. */
const LAND = Object.fromEntries(F.landings.map((l) => [l.name, l]));
const CAMP = LAND["T. Craig Campbell Landing"], CAUSEY = LAND["Johnny Causey Landing"], WORTH = LAND["Worthams Ferry Landing"], ANDER = LAND["Chris Anderson Landing"];
must(CAMP.ramps === 2 && CAMP.parking === 31 && CAMP.in_zip && !CAMP.in_nmb && CAUSEY.parking === 52 && CAUSEY.in_nmb && WORTH.ramps === 1 && WORTH.surface === "UNPVD" && ANDER.parking === 25, "row 15 changed");

/* Rows 20, 21, 22, 32: flood. */
const FZ = F.sfha_zip;
must(FZ.in_sfha === 565 && FZ.by_kind.house.in_sfha === 261 && FZ.by_kind.condo.in_sfha === 289 && FZ.by_kind.manufactured.in_sfha === 1 && FZ.by_kind.townhouse.in_sfha === 0, "row 20 changed");
const OUT_PER_100 = Math.round((1 - FZ.in_sfha / FZ.homes) * 100);                   // 96
must(OUT_PER_100 === 96 && 100 - OUT_PER_100 === 4, "row 20 share");
must(FZ.water_homes_in_sfha === 237 && FZ.water_homes === 531, "row 21 changed");
const WATER_PCT = Math.round(FZ.water_homes_in_sfha / FZ.water_homes * 100);         // 45
const AWAY_PCT = Math.round((FZ.in_sfha - FZ.water_homes_in_sfha) / (FZ.homes - FZ.water_homes) * 1000) / 10; // 2.2
const ALL_PCT = Math.round(FZ.in_sfha / FZ.homes * 1000) / 10;                       // 3.6
must(WATER_PCT === 45 && AWAY_PCT === 2.2 && ALL_PCT === 3.6, "row 21 shares");
const NP = F.nfip_policies_29566;
must(NP.x.median === 477 && NP.a.median === 1247, "row 22 changed");
const POL_X = "$480", POL_A = "$1,250";                                               // row 22 as the ledger rounds them
must(Math.abs(NP.x.median - 480) < 5 && Math.abs(NP.a.median - 1250) < 5, "row 22 rounding");

/* Row R1-5: the state's homeowners sample rates for ZIP 29566, without wind (raw/scdoi-home-sample-rates-29566.txt). */
const SAMPLE = (fs.readFileSync(path.join(DATA, "raw", "scdoi-home-sample-rates-29566.txt"), "utf8").match(/\t\$[\d,]+\t/g) || []).map((s) => +s.replace(/[^\d]/g, "")).sort((a, b) => a - b);
const qx = (q) => { const i = (SAMPLE.length + 1) * q - 1, lo = Math.floor(i); return SAMPLE[lo] + (SAMPLE[lo + 1] - SAMPLE[lo]) * (i - lo); };
must(SAMPLE.length === 23 && qx(0.25) === 1104 && qx(0.5) === 1436 && qx(0.75) === 2441, "row R1-5 changed");
const INS_LO = r100(qx(0.25)), INS_HI = r100(qx(0.75));                              // $1,100 and $2,400

/* Rows 25 to 29, 46: prices from deeds. */
const SZ = F.sales_zip;
must(SZ.house_resale.n === 511 && SZ.house_resale.median === 357000 && SZ.house_resale.q1 === 303500 && SZ.house_resale.q3 === 451000, "row 25 changed");
must(SZ.house_new_builder.n === 80 && Math.round(SZ.house_new_builder.median) === 317825, "row 26 changed");
must(SZ.condo.median === 189250 && SZ.condo_on_water.median === 263250 && SZ.condo_not_water.median === 180000, "row 27 changed");
must(SZ.manufactured.median === 182500 && SZ.townhouse.median === 264500, "row 28 changed");
must(SZ.house_resale_on_water.n === 5 && SZ.house_resale_on_water.median === 1325000, "row 29 changed");
const HOUSE = r1k(SZ.house_resale.median);                                            // $357,000
const PLACE = read("../submarkets-conway/findings.json").resale_by_place_not_condo;  // row 46
must(PLACE["Little River CDP"].median === 317500 && PLACE["Horry County (all kept sales)"].median === 324900, "row 46 changed");

/* Rows 30, 31: houses for sale, in aggregate (CCMLS). */
const L = F.listings, LT = L.by_type;
must(LT.house.n === 188 && LT.house.median === 398450 && LT.condo.n === 184 && LT.townhouse.n === 29 && LT.manufactured.n === 19 && LT.land.n === 49, "row 30 changed");
must(L.api_totals["house+new_construction"] === 44 && L.house_under_300k === 22 && L.house_3bed.n === 110 && L.house_3bed_under_400k === 68, "rows 30, 31 changed");
must(LT.house.in_sfha_by_pin === 8 && LT.condo.in_sfha_by_pin === 15, "row 32 changed");

/* Row 35: drives from the OpenStreetMap place point for Little River, free flow. Under 15 minutes to
   the minute; longer drives as the verifier rounds them (36, 41, 73). */
const mins = (k) => Math.round(DRIVES[k].minutes);
const BEACH = mins("cherry_grove_pier"), CALABASH = mins("calabash_nc"), HOSP = mins("mcleod_seacoast"), COQUINA = mins("coquina_harbour"),
  CAMPBELL = mins("campbell_landing"), NMB_MAIN = mins("nmb_main_street_ocean_drive"), BAREFOOT = mins("barefoot_landing"),
  MALL = mins("coastal_grand"), AIRPORT = mins("airport_terminal"), WILM = mins("wilmington_nc");
must(BEACH === 11 && CALABASH === 7 && HOSP === 6 && COQUINA === 3 && CAMPBELL === 7 && NMB_MAIN === 11 && BAREFOOT === 18 && MALL === 36 && AIRPORT === 41 && WILM === 73, "row 35 drives changed");
/* Row R2-1 (review round 2): drives from the centres of the far-west part's three largest subdivisions, free flow. */
const FW = read("raw/drives-farwest.json"), FW_SUBS = ["HIDDEN BROOKE", "PALM LAKES PLANTATION", "WATERFALL"];
const fwRange = (k) => { const v = FW_SUBS.map((o) => Math.round(FW[o][k].minutes)); return [Math.min(...v), Math.max(...v)]; };
const FW_MALL = fwRange("coastal_grand"), FW_AIR = fwRange("airport_terminal"), FW_WATER = fwRange("little_river_waterfront_mineola"), FW_HOSP = fwRange("mcleod_seacoast");
must(FW_MALL.join() === "30,35" && FW_AIR.join() === "35,40" && FW_WATER.join() === "12,15" && FW_HOSP.join() === "9,9", "row R2-1 drives changed");
must(FW_SUBS.every((o) => FW[o].coastal_grand.main_roads.includes("SC 31") && FW[o].airport_terminal.main_roads.includes("SC 31")), "row R2-1: a far-west drive south no longer uses SC 31");
must(FW_MALL[1] < MALL && FW_AIR[1] < AIRPORT && MALL - FW_MALL[0] === 6, "row R2-1: the far west is no longer up to 6 minutes nearer Myrtle Beach than the old village");
const VILLAGE = { lon: -78.6232583, lat: 33.8727006 };                               // row 35: the OSM place point

/* Row 36: HUD FY2027 Small Area Fair Market Rents. */
const HUD = F.hud_fy2027;
must(HUD["29566"]["2"] === 1730 && HUD["29566"]["3"] === 2100 && HUD["29566"]["4"] === 2280 && HUD["29582"]["3"] === 1880 && HUD["29577"]["3"] === 1720 && HUD["29579"]["3"] === 2230 && HUD["29568"]["3"] === 2270, "row 36 changed");
must(CEN.acs_median_gross_rent === 1528 && CTY.acs_median_gross_rent === 1255, "row 39 changed");
const RENT_LR = r10(CEN.acs_median_gross_rent), RENT_CTY = r10(CTY.acs_median_gross_rent);   // $1,530 and $1,260
must(RENT_LR === "$1,530" && RENT_CTY === "$1,260", "row 39 rounding");

/* Rows 8 and 9 (corrected) and 34 (corrected): manufactured homes and lots. */
must(F.manufactured_zip.n === 757, "row 8 changed");
const ACRE_PLUS = "about 370";                                                       // row 34, the verifier's count by outline (371)

/* ---------------------------------------------------------------------------- */
/* The five parts of Little River (row 33): every subdivision in the table, put in */
/* a part by its centre point, measured from the village point.                    */

const R_EARTH_MI = 3958.8;
const miles = (a, b) => { const r = Math.PI / 180, dla = (b.lat - a.lat) * r, dlo = (b.lon - a.lon) * r;
  const s = Math.sin(dla / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dlo / 2) ** 2; return 2 * R_EARTH_MI * Math.asin(Math.sqrt(s)); };
const partOf = (s) => {
  const p = { lon: s.center[0], lat: s.center[1] };
  if (miles(VILLAGE, p) <= 1.25) return "village";
  if (p.lon >= -78.62) return "east";
  if (p.lat >= 33.879) return "northwest";
  if (p.lon >= -78.68) return "west";
  return "farwest";
};
const SUBS = F.subdivisions.map((s) => Object.assign({}, s, { part: partOf(s) }));
const SUB = Object.fromEntries(SUBS.map((s) => [s.name, s]));
const PART_COLOR = { village: "#c4783a", east: "#2f6f8f", northwest: "#5f8a4e", west: "#8a5a9e", farwest: "#5c6b78" };
const PARTS = [
  { key: "village", name: "The old village and the harbors", place: "Little River's old village", id: "old-village" },
  { key: "east", name: "North and east, toward Calabash", place: "east Little River", id: "north-and-east" },
  { key: "northwest", name: "North-west, toward the Waccamaw", place: "north-west Little River", id: "north-west" },
  { key: "west", name: "West, around the hospital", place: "west Little River", id: "west" },
  { key: "farwest", name: "Far west, at SC 9", place: "far west Little River", id: "far-west" },
].map((p, i) => Object.assign(p, { num: i + 1 }));
const PART = Object.fromEntries(PARTS.map((p) => [p.key, p]));
/* Each part's named subdivisions must sit in it, and the measured words in its entry must hold. */
const inPart = (key, names) => names.forEach((nm) => must(SUB[nm] && SUB[nm].part === key, `${nm} is not in part ${key}`));
inPart("village", ["CYPRESS VILLAGE", "HIDDEN LAKES VILLAGE", "WRENS CROSSING", "GARDENS AT CYPRESS BAY", "MARINERS POINTE", "LIGHTKEEPERS VILLAGE", "COQUINA HARBOR", "EASTPORT"]);
inPart("east", ["HEATHER GLEN", "HEATHER LAKES", "STONEBRIDGE FARMS", "WINDJAMMER VILLAGE", "BIG LANDING PLANTATION"]);
inPart("northwest", ["LAFAYETTE PARK", "RIVER HILLS", "CAROLINA CROSSING", "NORTH VILLAGE", "STONES EDGE", "SUNSET LANDING"]);
inPart("west", ["CAROLINA YACHT LANDING", "BAY TREE", "WATERSIDE VILLAGE", "SHOREHAVEN VILLAGE", "STARFISH VILLAGE", "SAWGRASS VILLAGE @ BRIDGEWATER", "NORTH POINTE"]);
inPart("farwest", ["HIDDEN BROOKE", "PALM LAKES PLANTATION", "WATERFALL", "WOODLYN MEADOW", "PARK POINTE"]);
/* Row 33 (and the table behind it): the subdivisions named in an entry, with their resale prices. */
const res = (nm) => SUB[nm].resales;
must(SUB["HEATHER GLEN"].homes === 1124 && res("HEATHER GLEN").n === 58 && res("HEATHER GLEN").median === 375000, "row 33 Heather Glen");
must(SUB["LAFAYETTE PARK"].homes === 434 && res("LAFAYETTE PARK").median === 347950, "row 33 Lafayette Park");
must(SUB["CYPRESS VILLAGE"].kinds.house === 341 && SUB["CYPRESS VILLAGE"].kinds.townhouse === 65 && res("CYPRESS VILLAGE").median === 385000, "row 33 Cypress Village");
must(SUB["RIVER HILLS"].homes === 376 && res("RIVER HILLS").median === 385000, "row 33 River Hills");
must(SUB["WINDJAMMER VILLAGE"].kinds.house === 348 && SUB["WINDJAMMER VILLAGE"].kinds.manufactured === 19 && SUB["WINDJAMMER VILLAGE"].in_sfha === 15 && res("WINDJAMMER VILLAGE").median === 310000, "row 33 Windjammer");
must(SUB["BAY TREE"].kinds.condo === 267 && SUB["BAY TREE"].kinds.townhouse === 43 && res("BAY TREE").median === 165000, "row 33 Bay Tree");
must(res("SAWGRASS VILLAGE @ BRIDGEWATER").n === 5 && res("SAWGRASS VILLAGE @ BRIDGEWATER").median === 585000 && res("WATERSIDE VILLAGE").n === 19 && res("WATERSIDE VILLAGE").median === 559900 && res("WATERFALL").n === 7 && res("WATERFALL").median === 555000, "row 33 highest prices");
/* Row 33, corrected by the verifier (spelling variants merged): Hidden Brooke and Carolina Yacht Landing. */
const HIDDEN_BROOKE = { houses: 313, n: 12, median: 389500 }, CYL = { units: 337, n: 30, median: 252000, water: 163 };
const MARINERS = { units: 146, water: 76 }, LIGHTKEEPERS = { units: 278, water: 38 };  // row 11, corrected
/* Row 33, corrected: lots by parcel outline (the county's Acreage field is nearly empty there). */
const LAFAYETTE_LOT = "about a quarter of an acre";                                 // 0.27 acre
/* Flood counts by subdivision (row 33's table): the north-west part's named subdivisions have none. */
must(["LAFAYETTE PARK", "RIVER HILLS", "CAROLINA CROSSING", "NORTH VILLAGE", "STONES EDGE", "SUNSET LANDING", "ASHTON ACRES", "THE RETREAT"].every((k) => SUB[k].in_sfha === 0), "a north-west subdivision now has a home in the high-risk zone");
must(["HIDDEN BROOKE", "PALM LAKES PLANTATION", "WATERFALL", "WOODLYN MEADOW", "PARK POINTE", "ROYAL ESTATES"].every((k) => SUB[k].in_sfha === 0), "a far-west subdivision now has a home in the high-risk zone");
must(SUB["MARINERS POINTE"].in_sfha === 73 && SUB["EASTPORT"].in_sfha === 56 && SUB["EASTPORT"].homes === 64, "row 33 village flood counts");
must(SUB["NORTH POINTE"].kinds.manufactured === 128 && res("NORTH POINTE").n === 7 && res("NORTH POINTE").median === 180000, "row 33 North Pointe");
must(SUB["STONES EDGE"].kinds.house === 59 && SUB["STONES EDGE"].kinds.manufactured === 47 && res("STONES EDGE").median === 230000, "row 33 Stones Edge");
const milesFrom = (nm) => miles(VILLAGE, { lon: SUB[nm].center[0], lat: SUB[nm].center[1] });
/* Distances said in the entries (straight line from the village point, row 33's centre points). */
must(Math.round(milesFrom("HEATHER GLEN") * 10) / 10 === 1.7 && Math.round(milesFrom("CAROLINA CROSSING")) === 4 && Math.round(milesFrom("RIVER HILLS") * 10) / 10 === 1.3, "part distances");
must(milesFrom("PALM LAKES PLANTATION") > 4 && milesFrom("WATERFALL") < 5 && milesFrom("HIDDEN BROOKE") > 3.5, "far west distances");
/* Places named in the entries, by our measure: the Calabash point is nearer the east part than the village;
   the Worthams Ferry ramp is nearer the north-west part; the hospital is inside the west part. */
const CALABASH_PT = { lon: -78.568345, lat: 33.890728 }, MCLEOD_PT = { lon: -78.66371, lat: 33.86573 };
const HG = { lon: SUB["HEATHER GLEN"].center[0], lat: SUB["HEATHER GLEN"].center[1] };
must(miles(HG, CALABASH_PT) < miles(VILLAGE, CALABASH_PT) - 1, "Calabash is not nearer the east part");
const CC = { lon: SUB["CAROLINA CROSSING"].center[0], lat: SUB["CAROLINA CROSSING"].center[1] };
must(miles(CC, WORTH) < 2 && miles(VILLAGE, WORTH) > 3, "Worthams Ferry is not nearer the north-west part");
must(partOf({ center: [MCLEOD_PT.lon, MCLEOD_PT.lat] }) === "west", "the hospital is not in the west part");
/* SC 31 meets SC 9 at the edge of the far-west part (TIGER, tools/geo): Hidden Brooke's centre is within half a mile. */
const SC31_END = { lon: -78.6856, lat: 33.8728 };
must(Math.abs(miles(SC31_END, { lon: SUB["HIDDEN BROOKE"].center[0], lat: SUB["HIDDEN BROOKE"].center[1] }) - 1 / 3) < 0.06, "Hidden Brooke is no longer about a third of a mile from SC 31's end");
/* Vereen Gardens (OSM boundary point, PLAN V1) is in the east part, east of US 17 (TIGER: US 17 at that latitude near -78.6015). */
must(partOf({ center: [-78.5948466, 33.8815826] }) === "east" && -78.5948466 > -78.6015, "Vereen Gardens is not in the east part, east of US 17");
/* Worthams Ferry is north of every north-west subdivision; every north-west subdivision is outside the zone. */
must(SUBS.filter((s) => s.part === "northwest").every((s) => s.center[1] < WORTH.lat && s.in_sfha === 0), "north-west part: Worthams Ferry or flood check failed");
/* The three highest middle resale prices among subdivisions with at least 5 resales (row 33, corrected wording). */
const TOP_PRICE = SUBS.filter((s) => s.resales && s.resales.n >= 5).sort((a, b) => b.resales.median - a.resales.median).slice(0, 3).map((s) => s.name);
must(TOP_PRICE.join("|") === "SAWGRASS VILLAGE @ BRIDGEWATER|WATERSIDE VILLAGE|WATERFALL", "the highest-priced subdivisions changed");
must(["BAY TREE", "CAROLINA YACHT LANDING", "WATERSIDE VILLAGE", "SHOREHAVEN VILLAGE", "STARFISH VILLAGE", "SAWGRASS VILLAGE @ BRIDGEWATER", "NORTH POINTE"].every((k) => SUB[k].miles_from_center >= 1.9 && SUB[k].miles_from_center <= 2.9), "west part distances");
must(SUBS.filter((s) => s.part === "farwest").every((s) => s.miles_from_center >= 3.5 && s.miles_from_center <= 5.6), "far-west part distances");
must(SUB["HEATHER LAKES"].center[0] > SUB["HEATHER GLEN"].center[0] && res("HEATHER LAKES").median === res("HEATHER GLEN").median, "Heather Lakes east, same price");
must(SUB["CAROLINA YACHT LANDING"].center[0] < CAMP.lon, "Carolina Yacht Landing is not west of Campbell Landing");
must(miles(SC31_END, { lon: SUB["HIDDEN BROOKE"].center[0], lat: SUB["HIDDEN BROOKE"].center[1] }) < 0.5, "SC 31's end is not by Hidden Brooke");
/* Review round 1: the new entry words. */
must(SUBS.every((s) => !s.resales || s.name === "HEATHER GLEN" || s.resales.n < res("HEATHER GLEN").n), "Heather Glen no longer has the most resales");
must(partOf({ center: [CAMP.lon, CAMP.lat] }) === "west", "Campbell Landing is not in the west part");
must(SUBS.filter((s) => s.part === "farwest").every((s) => s.in_sfha === 0), "a far-west subdivision has a home in the high-risk zone");
must(SUB["WINDJAMMER VILLAGE"].in_sfha > 0 && SUB["HIDDEN LAKES VILLAGE"].part === "village" && SUB["EASTPORT"].part === "village" && SUB["RIVER HILLS"].part === "northwest", "golf entries moved part");
must(SUB["PALM LAKES PLANTATION"].homes >= 290 && SUB["PALM LAKES PLANTATION"].homes <= 330, "Palm Lakes is no longer about as large as Hidden Brooke");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const CSS = `<style>
main#main .c3-lr-fig{margin:1.6rem 0 1.8rem;max-width:680px}
main#main .c3-lr-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.65rem}
main#main .c3-lr-frame{border-radius:18px;overflow:hidden;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.08)}
main#main .c3-lr-frame img,main#main .c3-lr-frame svg{display:block;width:100%;height:auto}
main#main .c3-lr-key{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.4rem}
main#main .c3-lr-key li{display:flex;align-items:flex-start;gap:.6rem;color:var(--muted);font-size:1rem;line-height:1.45;margin:0}
main#main .c3-lr-key a{color:var(--navy)}
main#main .c3-lr-num{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:.9rem;font-family:var(--sans)}
main#main .c3-lr-num::before{content:attr(data-n)}
main#main .c3-lr-num.sq{border-radius:5px}
${Object.entries(PART_COLOR).map(([k, c]) => `main#main .c3-lr-num.p-${k}{background:${c}}`).join("")}
main#main .c3-lr-num.marina{background:#2f6f8f}
main#main .c3-lr-sw{flex:none;display:inline-block;width:1.6rem;height:1rem;border-radius:4px;margin-top:.2rem}
main#main .c3-lr-h3{display:flex;align-items:baseline;gap:.6rem}
main#main .c3-lr-h3 .c3-lr-num{position:relative;top:-.15rem}
main#main h2,main#main h3{text-wrap:balance}
/* Review round 1: the two aerials are cut 4:3 with every label inside; show the whole frame at every width
   (photos.js crops a hero to 16:9 from 700 px, which cut off US 17 and pressed a label to the edge). */
main#main .c3ph-hero img{aspect-ratio:auto!important}
@media (max-width:359px){main#main .c3-glance span.t{font-size:.92rem}main#main .c3-glance strong{font-size:.8rem}}
@media (min-width:700px){main#main .c3-cc td{white-space:nowrap}}
main#main .c3-pc{align-items:stretch}
/* The end band (Conway's fix, NEEDS.md 2): glass.js's compact-bar rule draws the last band as a light
   bar under ivory text in the browser; put the dark panel back on this page's own last band. */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* Maps 1 and 2, drawn here from the county's polygons (map-little-river.geojson): */
/* the water (marinas, landings, FEMA's high-risk zone) and the five parts.         */

const GEO = JSON.parse(fs.readFileSync(path.join(BB, "tools", "geo", "grand-strand-v2.json"), "utf8")).region;
const layer = (name) => GEOJ.features.find((f) => f.properties.layer === name).geometry;
const multi = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);

const lrMap = (mode) => {
  const water = mode === "water";
  const [x0, x1, y0, y1] = water ? [-78.690, -78.592, 33.840, 33.893] : [-78.722, -78.578, 33.836, 33.912];
  const kx = Math.cos(((y0 + y1) / 2) * Math.PI / 180);
  const W = 760, S = W / ((x1 - x0) * kx), H = Math.round((y1 - y0) * S);
  const P = (lo, la) => [(lo - x0) * kx * S, (y1 - la) * S];
  const f1 = (v) => Math.round(v * 10) / 10;
  const inBox = (lo, la, m = 0.2) => lo > x0 - (x1 - x0) * m && lo < x1 + (x1 - x0) * m && la > y0 - (y1 - y0) * m && la < y1 + (y1 - y0) * m;
  const d = (pts, close, tol = 1.4) => {
    const out = []; let last = null;
    for (const [lo, la] of pts) { const p = P(lo, la); if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= tol) { out.push(p); last = p; } }
    if (out.length < (close ? 3 : 2)) return "";
    return "M" + out.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L") + (close ? "Z" : "");
  };
  const area = (r) => { let s = 0; const q = r.map(([lo, la]) => P(lo, la)); for (let i = 0, j = q.length - 1; i < q.length; j = i++) s += (q[j][0] + q[i][0]) * (q[j][1] - q[i][1]); return Math.abs(s / 2); };
  const polysD = (mp, minA = 4, tol = 1.4) => mp.map((poly) => (area(poly[0]) < minA ? "" : poly.filter((r, i) => i === 0 || area(r) >= minA).map((r) => d(r, true, tol)).join(""))).join("");
  const dec = (flat, sc = 1e4) => { const o = []; let x = 0, y = 0; for (let i = 0; i < flat.length; i += 2) { x += flat[i]; y += flat[i + 1]; o.push([x / sc - 80, y / sc + 33]); } return o; };
  const runs = (pts) => { const out = []; let cur = []; for (const p of pts) { if (inBox(p[0], p[1], 0.05)) cur.push(p); else { if (cur.length) { cur.push(p); out.push(cur); } cur = []; } } if (cur.length) out.push(cur); return out; };
  const zip = multi(layer("zip_29566")), nmb = multi(layer("north_myrtle_beach_limits")), sfha = multi(layer("fema_high_risk")), wat = multi(layer("water"));
  const zipD = polysD(zip, 2);
  const roadsOf = (re) => GEO.roads.filter((r) => re.test(r.r || "")).flatMap((r) => runs(dec(r.p))).map((r) => d(r, false, 1.5)).join("");
  const mainRoads = roadsOf(/^(US 17|SC 31)$/), sideRoads = roadsOf(/^(SC 9|SC 90|SC 57|SC 179|SC 65)$/);
  const state = GEO.stateline.flatMap((r) => runs(dec(r))).map((r) => d(r, false, 1)).join("");
  const label = (lo, la, text, o = {}) => { const [x, y] = P(lo, la); return `<text class="lb${o.cls ? " " + o.cls : ""}" x="${f1(x + (o.dx || 0))}" y="${f1(y + (o.dy || 0))}" text-anchor="${o.anchor || "start"}" fill="${o.fill || "#1c2028"}"${o.italic ? ' font-style="italic"' : ""}>${text}</text>`; };
  const [vx, vy] = P(VILLAGE.lon, VILLAGE.lat);
  const villagePin = `<g transform="translate(${f1(vx)} ${f1(vy)})"><circle r="9" fill="#1c2028" stroke="#fff" stroke-width="4"/></g>`;
  let marks = "", extra = "";
  if (water) {
    /* Marinas: a circle per marina, its area by the deeded slips in it; Coquina Harbour and Lightkeepers
       share one basin, 400 m apart, so their markers sit west of the basin with a line to the true spot. */
    const MAR = POINTS.filter((p) => p.kind === "slips" && p.n > 1).sort((a, b) => b.n - a.n);
    must(MAR.map((m) => `${m.name}:${m.n}`).join("|") === "Mariner's Pointe:116|Coquina Harbour:81|Lightkeepers Village:25", "map-points marinas changed");
    const OFF = { "Mariner's Pointe": [0, 0], "Coquina Harbour": [-34, -40], "Lightkeepers Village": [-44, 26] };
    marks += MAR.map((m, i) => { const [x, y] = P(m.lon, m.lat), [dx, dy] = OFF[m.name], r = f1(14 + Math.sqrt(m.n) * 1.3);
      return (dx || dy ? `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x + dx)}" y2="${f1(y + dy)}" stroke="#1c2028" stroke-width="2.5"/><circle cx="${f1(x)}" cy="${f1(y)}" r="4" fill="#1c2028"/>` : "")
        + `<g transform="translate(${f1(x + dx)} ${f1(y + dy)})"><circle r="${r}" fill="#2f6f8f" stroke="#fff" stroke-width="4"/><text class="nm" y="10.5" text-anchor="middle">${i + 1}</text></g>`; }).join("");
    /* Landings: Campbell and Causey are 140 m apart across the waterway, so one marker (A) stands for the pair. */
    const LMARK = [["A", CAMP]];
    marks += LMARK.map(([k, l]) => { const [x, y] = P(l.lon, l.lat); return `<g transform="translate(${f1(x)} ${f1(y)})"><rect x="-17" y="-17" width="34" height="34" rx="6" fill="#1c2028" stroke="#fff" stroke-width="4"/><text class="nm" y="10.5" text-anchor="middle">${k}</text></g>`; }).join("");
    extra = label(-78.6300, 33.8470, "Intracoastal Waterway", { anchor: "middle", italic: true, fill: "#2c5d75" })
      + label(-78.688, 33.8425, "North Myrtle Beach", { fill: "#5c5248" })
      + label(VILLAGE.lon, VILLAGE.lat, "Old village", { dx: -16, dy: -16, anchor: "end" })
      + label(-78.6005, 33.8905, "N.C.", { anchor: "middle", fill: "#5c5248" })
      + label(-78.6050, 33.8845, "S.C.", { anchor: "middle", fill: "#5c5248" });
  } else {
    /* Each subdivision of row 33's table as a dot, its area by its homes, coloured by part. */
    const dots = SUBS.map((s) => { const [x, y] = P(s.center[0], s.center[1]); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(Math.min(15, 3.5 + Math.sqrt(s.homes) * 0.36))}" fill="${PART_COLOR[s.part]}"/>`; }).join("");
    marks += `<g fill-opacity=".8" stroke="#fff" stroke-width="1.5">${dots}</g>`;
    /* A numbered marker per part, at the middle of its subdivisions' homes, moved where it would sit on another part's dots. */
    const NUDGE = { village: [16, 44], east: [18, -38], northwest: [-6, -36], west: [-6, 40], farwest: [6, -40] };
    marks += PARTS.map((p) => { const ss = SUBS.filter((s) => s.part === p.key), tot = ss.reduce((t, s) => t + s.homes, 0);
      const lo = ss.reduce((t, s) => t + s.center[0] * s.homes, 0) / tot, la = ss.reduce((t, s) => t + s.center[1] * s.homes, 0) / tot;
      const [x, y] = P(lo, la), [dx, dy] = NUDGE[p.key];
      return `<g transform="translate(${f1(x + dx)} ${f1(y + dy)})"><circle r="27" fill="${PART_COLOR[p.key]}" stroke="#fff" stroke-width="4"/><text class="nm" y="11.5" text-anchor="middle">${p.num}</text></g>`; }).join("");
    const [hx, hy] = P(MCLEOD_PT.lon, MCLEOD_PT.lat);
    extra = `<g transform="translate(${f1(hx)} ${f1(hy)})"><rect x="-13" y="-13" width="26" height="26" rx="5" fill="#1c2028" stroke="#fff" stroke-width="3"/><text class="nm" y="9" text-anchor="middle" style="font-size:22px">H</text></g>`
      + label(-78.6526, 33.8497, "US 17", { dx: 14, dy: 4, fill: "#6b5638" })
      + label(-78.7034, 33.9042, "SC 9", { dx: 10, dy: -8, fill: "#6b5638" })
      + label(-78.719, 33.8425, "North Myrtle Beach", { fill: "#5c5248" })
      + label(-78.586, 33.906, "N.C.", { anchor: "middle", fill: "#5c5248" });
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${water ? "Map of Little River's marinas, public boat landings and flood zone" : "Map of the five parts of Little River"}">`
    + `<style>.lb{font-family:'DM Sans',system-ui,sans-serif;font-size:34px;font-weight:700;paint-order:stroke;stroke:#fff;stroke-width:7px;stroke-linejoin:round}.nm{font-family:'DM Sans',system-ui,sans-serif;font-size:30px;font-weight:700;fill:#fff}@media (min-width:560px){.lb{font-size:19px}}</style>`
    + `<rect width="${W}" height="${H}" fill="#f4efe8"/>`
    + `<defs><clipPath id="lr-zip-${mode}"><path d="${zipD}"/></clipPath></defs>`
    + `<path d="${zipD}" fill="#fffdf9"/>`
    + `<path d="${polysD(nmb, 2)}" fill="#e3d9cc" fill-rule="evenodd"/>`
    + (water ? `<defs><pattern id="lr-sfha" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#b9d3e6"/><rect width="4" height="9" fill="#3d7fb8"/></pattern></defs><g clip-path="url(#lr-zip-${mode})"><path d="${polysD(sfha, 3, 1.2)}" fill="url(#lr-sfha)" fill-rule="evenodd"/></g>` : "")
    + `<path d="${polysD(wat, 2, 1)}" fill="#cfe4ee" stroke="#5f93ab" stroke-width="1.2" fill-rule="evenodd"/>`
    + `<path d="${sideRoads}" fill="none" stroke="#d9cbb6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${mainRoads}" fill="none" stroke="#c9b28f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${state}" fill="none" stroke="#5c5248" stroke-width="2.5" stroke-dasharray="10 7"/>`
    + `<path d="${zipD}" fill="none" stroke="#1c2028" stroke-width="2.5" stroke-linejoin="round"/>`
    + villagePin + marks + extra + `</svg>`;
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const file = water ? "little-river-water-map.svg" : "little-river-parts-map.svg";
  fs.writeFileSync(path.join(IMG_DIR, file), svg);
  must(svg.length < 175000, `the ${mode} map is ${svg.length} bytes`);
  return { W, H, file };
};

const numDot = (cls, text) => `<span class="c3-lr-num ${cls}" data-n="${text}" aria-hidden="true"></span>`;
let WATER_ALT = "", PARTS_ALT = "", WATER_SIZE = {}, PARTS_SIZE = {};
const WATER_MAP = (() => {
  const { W, H, file } = lrMap("water"); WATER_SIZE = { W, H };
  const alt = `Map of Little River's water: three marinas with deeded slips near the old village (1 Mariner's Pointe, 2 Coquina Harbour, 3 Lightkeepers Village), the public landings at the US 17 bridge (A), and FEMA's high-risk flood zone striped along the water.`; WATER_ALT = alt;
  const key = `<ul class="c3-lr-key" aria-label="Map key">`
    + `<li>${numDot("marina", "1")}<span>Mariner's Pointe</span></li>`
    + `<li>${numDot("marina", "2")}<span>Coquina Harbour</span></li>`
    + `<li>${numDot("marina", "3")}<span>Lightkeepers Village</span></li>`
    + `<li>${numDot("sq", "A")}<span>T. Craig Campbell Landing and, across the waterway, Johnny Causey Landing</span></li>`
    + `<li><span class="c3-lr-sw" style="background:repeating-linear-gradient(45deg,#3d7fb8 0 3px,#b9d3e6 3px 7px)"></span><span>FEMA's high-risk flood zone</span></li>`
    + `<li><span class="c3-lr-sw" style="background:#e3d9cc"></span><span>The city of North Myrtle Beach</span></li></ul>`;
  return `<figure class="c3-lr-fig"><div class="c3-lr-frame"><img src="${IMG_SRC}/${file}" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async"></div>`
    + `<figcaption>${key}<p style="margin:.7rem 0 0">The dark line is the Little River ZIP code. Marker sizes follow the number of deeded slips. The two landings on the Waccamaw River are north-west of this map. Map data: Horry County GIS; FEMA flood map as the county carries it; U.S. Census Bureau TIGER/Line.</p></figcaption></figure>`;
})();

const PARTS_MAP = (() => {
  const { W, H, file } = lrMap("parts"); PARTS_SIZE = { W, H };
  const alt = `Map of Little River's subdivisions as dots in five numbered parts: 1 the old village and harbors, 2 north and east, 3 north-west, 4 west around the hospital (H), 5 far west at SC 9.`; PARTS_ALT = alt;
  const list = `<ol class="c3-lr-key" aria-label="The five parts of Little River">` + PARTS.map((p) => `<li>${numDot(`p-${p.key}`, p.num)}<a href="#${p.id}">${p.name}</a></li>`).join("") + `</ol>`;
  return `<figure class="c3-lr-fig"><div class="c3-lr-frame"><img src="${IMG_SRC}/${file}" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async"></div>`
    + `<figcaption>Each dot is a subdivision, sized by its homes. The black dot is the old village, and H is McLeod Seacoast hospital. Map data: Horry County GIS; U.S. Census Bureau TIGER/Line; OpenStreetMap.${list}</figcaption></figure>`;
})();

/* Map 3: drive times (row 35), tools/area-map.js. */
const WHERE_MAP = (() => {
  const m = regionMap({ home: { name: "Little River", label: "Little River", lat: VILLAGE.lat, lon: VILLAGE.lon, town: "Little River" },
    landmarks: [
      { name: "the beach at Cherry Grove Pier", short: "Beach", kind: "beach", lat: 33.8287315, lon: -78.6326763, minutes: BEACH },
      { name: "Calabash, North Carolina", short: "Calabash, N.C.", kind: "town", lat: CALABASH_PT.lat, lon: CALABASH_PT.lon, minutes: CALABASH },
      { name: "McLeod Seacoast hospital", short: "Hospital", kind: "hospital", lat: MCLEOD_PT.lat, lon: MCLEOD_PT.lon, minutes: HOSP },
      { name: "Barefoot Landing", short: "Barefoot Landing", kind: "shopping", lat: 33.799875, lon: -78.74244, minutes: BAREFOOT },
    ],
    alt: `Map of Little River and the coast: from the old village, the beach at Cherry Grove Pier is about ${BEACH} minutes by car, Calabash, North Carolina, about ${CALABASH} minutes, McLeod Seacoast hospital about ${HOSP} minutes and Barefoot Landing about ${BAREFOOT} minutes.` },
  { glass: true, dir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), src: "/images/maps" });
  must(m.html.includes(`${BEACH} min`), "the region map lost the beach drive");
  return `<figure class="c3-lr-fig" style="max-width:560px"><div class="c3-lr-frame">${m.html}</div><figcaption>Drive times by car from the old village, without traffic. ${m.credit}</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Charts (glass.js).                                                             */

const SEASON_NAMES = { "North Myrtle Beach city": "North Myrtle Beach", "Garden City CDP": "Garden City", "Little River CDP": "Little River", "Horry County": "All of Horry County", "Murrells Inlet CDP": "Murrells Inlet", "Carolina Forest CDP": "Carolina Forest", "Conway city": "Conway" };
const SEASON_CHART = G.bars(SEASONAL.map((r) => ({ name: SEASON_NAMES[r.place], value: r.seasonal_pct, valueText: `${Math.round(r.seasonal_pct - 1e-9)}%`, reference: r.place !== "Little River CDP" })),
  { caption: "Share of homes kept for seasonal use, 2020 Census", nameLabel: "Place", valueLabel: "Seasonal homes", compact: true, max: 50,
    note: "Homes no one lived in on Census Day that were kept for seasonal or occasional use, such as vacation homes and many nightly rentals." });

const PRICE_CHART = G.bars([
  { name: "House, resold", value: SZ.house_resale.median, valueText: r1k(SZ.house_resale.median) },
  { name: "New house from a builder", value: SZ.house_new_builder.median, valueText: r1k(SZ.house_new_builder.median), reference: true },
  { name: "Townhouse", value: SZ.townhouse.median, valueText: r1k(SZ.townhouse.median), reference: true },
  { name: "Condo", value: SZ.condo.median, valueText: r1k(SZ.condo.median), reference: true },
  { name: "Manufactured home on its own lot", value: SZ.manufactured.median, valueText: r1k(SZ.manufactured.median), reference: true },
], { caption: "What a home in Little River sold for in the past year, by kind", nameLabel: "Kind of home", valueLabel: "Middle price", compact: true,
  note: "Sales recorded in the county's deeds for homes in the Little River ZIP code. Middle price: half sold for more, half for less." });

const FLOOD_CHART = G.bars([
  { name: "Homes within about 50 feet of the water", value: WATER_PCT, valueText: `${WATER_PCT}%` },
  { name: "All homes in the ZIP", value: ALL_PCT, valueText: `${ALL_PCT}%`, reference: true },
  { name: "Homes away from the water", value: AWAY_PCT, valueText: `${AWAY_PCT}%`, reference: true },
], { caption: "Share of Little River homes inside FEMA's high-risk flood zone", nameLabel: "Homes", valueLabel: "In the zone", compact: true, max: 50 });

const RENT_CHART = G.bars([
  ["29568", "Longs, 29568"], ["29579", "Carolina Forest, 29579"], ["29566", "Little River, 29566"], ["29582", "North Myrtle Beach, 29582"], ["29577", "Myrtle Beach, 29577"],
].map(([z, name]) => ({ name, value: HUD[z]["3"], valueText: money(HUD[z]["3"]), reference: z !== "29566" })),
  { caption: "HUD's fair market rent for a three-bedroom, by ZIP code", nameLabel: "ZIP code", valueLabel: "A month, with utilities", compact: true });

/* The ten largest subdivisions by homes among those with 10 or more resales (row 33, Carolina Yacht Landing and
   Hidden Brooke as corrected). Review round 1: the caption says how the ten were chosen. */
const SUB_ROWS = [
  ["HEATHER GLEN", "Heather Glen"], ["LAFAYETTE PARK", "Lafayette Park"], ["CYPRESS VILLAGE", "Cypress Village, houses and townhouses"], ["RIVER HILLS", "River Hills"],
  ["WINDJAMMER VILLAGE", "Windjammer Village"], ["CAROLINA YACHT LANDING", "Carolina Yacht Landing, condos"], ["HIDDEN BROOKE", "Hidden Brooke"], ["BAY TREE", "Bay Tree, condos"],
  ["HIDDEN LAKES VILLAGE", "Hidden Lakes Village"], ["PALM LAKES PLANTATION", "Palm Lakes Plantation"],
].map(([k, name]) => {
  const fix = k === "CAROLINA YACHT LANDING" ? CYL : k === "HIDDEN BROOKE" ? HIDDEN_BROOKE : null;
  const r = fix ? { n: fix.n, median: fix.median } : res(k);
  must(r.n >= 10, `${k} has under 10 resales`);
  return { name, value: r.median, valueText: r1k(r.median), feature: `part ${PART[SUB[k].part].num}` };
}).sort((a, b) => b.value - a.value);
{ const homesOf = (s) => (s.name === "CAROLINA YACHT LANDING" ? CYL.units : s.name === "HIDDEN BROOKE" ? 314 : s.homes);
  const ten = SUBS.filter((s) => (s.name === "CAROLINA YACHT LANDING" ? CYL.n : s.name === "HIDDEN BROOKE" ? HIDDEN_BROOKE.n : (s.resales || {}).n || 0) >= 10)
    .sort((a, b) => homesOf(b) - homesOf(a)).slice(0, 10).map((s) => s.name).sort().join("|");
  must(ten === "BAY TREE|CAROLINA YACHT LANDING|CYPRESS VILLAGE|HEATHER GLEN|HIDDEN BROOKE|HIDDEN LAKES VILLAGE|LAFAYETTE PARK|PALM LAKES PLANTATION|RIVER HILLS|WINDJAMMER VILLAGE", "the ten largest changed: " + ten); }
const SUB_CHART = G.bars(SUB_ROWS, { caption: "Middle resale price in the ten largest subdivisions with 10 or more resales, past year", nameLabel: "Subdivision", featureLabel: "part of Little River", valueLabel: "Middle price", compact: true, phoneList: true,
  note: "Every resale in each subdivision recorded in the county's deeds, mostly houses unless the name says otherwise. Middle price: half sold for more, half for less." });

/* ---------------------------------------------------------------------------- */
/* Photos (photos.json; each looked at full size, subject_check in its record).    */

const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}`)); must(r, `no photo record for ${name}`); return r; };
const WATERFRONT = rec("little-river-waterfront-from-above-1200w"), HARBOURS = rec("little-river-harbours-from-above-1200w");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const photo = (r, alt, caption = r.caption) => lazy(PH.heroPhoto(r, { alt, caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" }));
const yr = (r) => { must(/^2023-/.test(r.taken), "aerial year changed"); return r.taken.slice(0, 4); };
const WATERFRONT_PHOTO = photo(WATERFRONT, WATERFRONT.alt, `The waterfront at the end of Mineola Avenue, and the slip basin at Mariner's Pointe, from above (NAIP aerial, ${yr(WATERFRONT)}).`);
const HARBOURS_PHOTO = photo(HARBOURS, HARBOURS.alt, `Coquina Harbour and Lightkeepers Village share one basin between US 17 and the waterway, with a golf course beside it (NAIP aerial, ${yr(HARBOURS)}).`);
const SHOWN = [WATERFRONT, HARBOURS];
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: p.caption.replace(/\.$/, "") })));

/* Our two drawn maps: an ImageObject each, with the rights fields photos.js gives our own pictures
   (image-meta.js S13; license and acquire pages as metaFor sets them for "own"). */
const MAP_SCHEMA = (() => {
  const io = (file, name, alt, W, H) => ({ "@type": "ImageObject", contentUrl: `https://chapter3realty.com${IMG_SRC}/${file}`, url: `https://chapter3realty.com${IMG_SRC}/${file}`,
    width: W, height: H, encodingFormat: "image/svg+xml", name, description: alt,
    creator: { "@type": "Organization", name: "Chapter3 Realty" }, creditText: "Chapter3 Realty", copyrightNotice: "© Chapter3 Realty",
    license: "https://chapter3realty.com/terms/", acquireLicensePage: "https://chapter3realty.com/contact/" });
  const g = [io("little-river-water-map.svg", "Little River's marinas, landings and flood zone", WATER_ALT, WATER_SIZE.W, WATER_SIZE.H),
    io("little-river-parts-map.svg", "The five parts of Little River", PARTS_ALT, PARTS_SIZE.W, PARTS_SIZE.H)];
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": g }).replace(/</g, "\\u003c")}</script>`;
})();

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const CENSUS_GLOSSARY = "https://www.census.gov/programs-surveys/geography/about/glossary.html";
const CENSUS = "https://data.census.gov/profile/Little_River_CDP,_South_Carolina?g=160XX00US4542010";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const HUDFMR = "https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const USC4012A = "https://www.law.cornell.edu/uscode/text/42/4012a";
const USC4013 = "https://www.law.cornell.edu/uscode/text/42/4013";
const BRIDGE = "https://projectportal.scdot.org/sc-historic-bridges/s-20-bridge-over-intercoastal-waterway-horry-county";
const CFR117 = "https://www.ecfr.gov/current/title-33/chapter-I/subchapter-J/part-117/subpart-B/section-117.911";
const PARKS = "https://www.horrycountysc.gov/departments/parksandrecreation/parks";
const LANDINGS = "https://www.horrycounty.org/gisweb/rest/services/Public/ParksRecreation/MapServer/1";
const HAZEL = "https://www.weather.gov/ilm/HurricaneHazel1954";
const STR_CHART = "https://www.horrycountysc.gov/media/monjnvh0/sales-tax-chart-short-term-rentals.pdf";
const NCDOT = "https://www.ncdot.gov/projects/carolina-bays-parkway/";
const HEARING = "https://www.ncdot.gov/projects/carolina-bays-parkway/Documents/carolina-bays-extension-public-hearing-summary.pdf";
const HCS = "https://www.horrycountyschools.net/about-hcs/our-schools";

/* ---------------------------------------------------------------------------- */
/* The offers.                                                                    */

const TOP = { title: "See homes for sale in Little River", label: "Send me Little River homes", href: "/contact/" };
const END = {
  h2: "Tell us your boat and your budget.",
  p: "We will send the Little River houses, deeded slips and condos that fit, and check the flood map, the slip and the HOA rules for each one.",
  label: "Ask about Little River homes", href: `/contact/?place=${encodeURIComponent("Little River")}`,
};
const partH3 = (p, tail) => `<h3 id="${p.id}" data-toc="${p.name}" class="c3-lr-h3" style="font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:2rem 0 .6rem;line-height:1.3">${numDot(`p-${p.key}`, p.num)}<span>${p.name}: ${tail}</span></h3>`;
const ask = (p) => G.offer(p.place, { label: `Get the homes for sale in ${p.place}` });
const P1 = PART.village, P2 = PART.east, P3 = PART.northwest, P4 = PART.west, P5 = PART.farwest;
const mid = (nm) => r1k(res(nm).median);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  pageImages: () => PH.pageImages(WATERFRONT),
  title: "Little River, SC Real Estate: Homes, Boat Slips, Flood Zones",
  description: "Living in Little River, SC: deeded boat slips and ramps, the five parts of Little River, home prices from county deeds, flood zones, taxes and rents.",
  ogTitle: "Living in Little River, SC: boat slips you can own, home prices, and where it floods",
  crumb: "Little River",
  eyebrow: "Little River, SC",
  h1: "Little River, SC: the boating end of the Grand Strand.",
  h1em: "About two of every three deeded boat slips in the county are here.",
  sub: "A waterway community at the North Carolina line, run by Horry County, with deeded boat slips, public ramps and people who live here all year.",
  heroMedia: glance([
    { icon: "dock", label: "Deeded slips", text: `About ${near(SLIPS_ZIP, 10)}` },
    { icon: "beach", label: "Beach", text: `${BEACH} min drive` },
    { icon: "home", label: "Typical house", text: HOUSE },
  ]),
  heroCta: TOP,
  topOfferLine: "Tell us your price range and your boat. We will send the homes that fit.",
  author: "devin",
  shortAnswer: [
    `Little River is the year-round waterway community at the north end of the Grand Strand, at the North Carolina line. If the boat comes first, look at the old village, where all three marinas with deeded slips are. A deeded slip is one you buy and own, with its own deed. For golf and dry ground, look north-west toward the Waccamaw River; for the hospital and the highest-priced neighborhoods, look west.`,
    `A resold house here usually sells for about ${HOUSE}. Little River is not a town, so Horry County makes the rules and there is no city tax.`,
  ],
  sections: [
    { h2: "What is it like to live in Little River, SC?", toc: "Living here", id: "living-here", html: () =>
      CSS +
      h.p(`Little River sits on the Intracoastal Waterway, the boat channel behind the Grand Strand's beaches. The old village meets the water at the end of Mineola Avenue, with docks, boats and restaurants on the water, about a minute from US 17.`) +
      WATERFRONT_PHOTO +
      h.p(`Each May, on the weekend after Mother's Day, the Blue Crab Festival fills that waterfront with seafood from local restaurants, live music and crafters. It has been held for more than 40 years, and a water taxi brings people in from the water.`) +
      h.p(`The beach at Cherry Grove Pier in North Myrtle Beach, Calabash in North Carolina and McLeod Seacoast hospital are all within about ${BEACH} minutes by car, as the map shows. The airport is the long drive, about ${AIRPORT} minutes.`) +
      WHERE_MAP +
      h.p(`A swing bridge built in 1935 still carries Sea Mountain Highway over the waterway. It turns on a center pier to let boats through, and it is one of the oldest swing bridges on SCDOT's highways. Boaters signal it to open, and at weekday rush hours it opens only on the hour and half hour.`) +
      h.p(`Vereen Memorial Historical Gardens, a county park on the waterway, has about 3 miles of trails and boardwalks through forest and marsh. A piece of the colonial Kings Highway, the road from Boston to Charleston, still runs at the front of the park.`) +
      h.p(`Little River is a place people live all year. When the Census last counted, about one in five of its homes was kept for seasonal use. In North Myrtle Beach, which borders it, it was nearly half.`) +
      SEASON_CHART },

    { h2: "Is Little River, SC a town?", toc: "Town or county", id: "town-or-county", html: () =>
      h.p(`No. Little River has no town government and no town limits, so Horry County makes its rules and collects its tax. A home here pays the county's property tax and no city tax on top.`) +
      h.p(`One corner is different. A small part of the Little River ZIP code along the waterway is inside the city of North Myrtle Beach. Its homes, about ${near(HZ.inside_north_myrtle_beach, 50)} and mostly condos, have a Little River address and pay North Myrtle Beach's city tax. We check which side of the line a house is on.`) },

    { h2: "Living on the water in Little River: boat slips, ramps and waterfront homes", toc: "On the water", id: "on-the-water", html: (bg) =>
      h.p(`Most marinas rent their slips. At Little River's three marinas you can buy one: a deeded slip is its own piece of real estate, with its own deed and its own county tax bill. The 12 slip sales recorded here in the past year were each for a slip alone, at $10,000 to $95,000, without a condo.`) +
      WATER_MAP +
      h.p(`The slips come in sizes. The table gives the length of most slips at each marina, from the county's parcel map. Coquina Harbour's are about 30 to 45 feet. The county's parcel records do not give the depth of the water, so we check it at low tide for any slip you like.`) +
      compareCards([
        { name: "Mariner's Pointe", cells: { size: "About 30 to 35 feet", sold: String(MP_SALES.length), range: `${money(MP_SALES[0])} to ${money(MP_SALES[10])}`, mid: `About ${money(SS.by_marina_zip["Mariner's Pointe"].median)}` } },
        { name: "Lightkeepers Village", cells: { size: "About 45 to 65 feet", sold: "1", range: money(SS.by_marina_zip["Lightkeepers Village"].median), mid: money(SS.by_marina_zip["Lightkeepers Village"].median) } },
        { name: "Dock Holidays Marina, in North Myrtle Beach", cells: { size: "About 40 to 50 feet", sold: String(DH.length), range: `${money(DH[0])} to ${money(DH[9])}`, mid: `About ${money(DH_MID)}` } },
      ], [{ key: "size", label: "Most slips" }, { key: "sold", label: "Sales, past year" }, { key: "range", label: "Prices" }, { key: "mid", label: "Middle price" }], { caption: "Deeded boat slips and what they sold for, from county deeds", nameLabel: "Marina" }) +
      h.p(`Coquina Harbour, with about ${near(COQ_SLIPS, 10)} deeded slips, had no slip sales in the past year.`) +
      h.p(`The county taxes a slip like a second home, on its own value for the slip. It values most Mariner's Pointe slips at $38,000 or more, above nearly every price paid there in the past year. On the county's full $38,000 value, a slip pays about ${SLIP_TAX} a year in property tax; a slip that has not sold in years may be taxed on a lower, capped value. The marina's association charges a fee on top, and its recorded papers say who may own a slip.`) +
      h.h3("Where to launch a boat") +
      h.p(`Horry County runs two public boat landings in the Little River ZIP. T. Craig Campbell Landing is on the Intracoastal Waterway at the US 17 bridge, about ${CAMPBELL} minutes from the old village, with two ramps, a dock and a paved lot. Johnny Causey Landing faces it across the waterway, just inside North Myrtle Beach, with two more ramps and a larger lot.`) +
      h.p(`On the Waccamaw River, Worthams Ferry Landing has one ramp and an unpaved lot. Chris Anderson Landing, on the river near Longs, has two ramps.`) +
      h.h3("Homes on the water") +
      h.p(`Few houses here ${h.a("/buyers/waterfront-homes/", "sit on the water")}: fewer than 2 in every 100 have a lot on the Intracoastal Waterway, a canal off it, or the Waccamaw River. Those few cost far more. Only ${SZ.house_resale_on_water.n} resold in the past year, and the middle one sold for about $1.3 million.`) +
      h.p(`Most homes right by the water are condos, and about half of them are in three communities: Carolina Yacht Landing, Mariner's Pointe and Lightkeepers Village. A condo by the water usually sold for about ${r1k(SZ.condo_on_water.median)} in the past year, and one away from it for about ${r1k(SZ.condo_not_water.median)}.`) +
      h.p(`A typical resold house and a Mariner's Pointe slip come to about $375,000 together. If you would rather keep the boat on a trailer at home, our ${h.a("/buyers/no-hoa-homes/", "guide to homes with no HOA")} covers where that is allowed.`) +
      h.cta("Get a deeded slip checked before you offer", "Send us the slip or the marina. We check the water depth at low tide and read the association's fee and its papers on who can own a slip.", "Have us check a boat slip", "/contact/", bg) },

    { h2: "Which part of Little River should you look at?", toc: "Five parts", id: "parts", html: () =>
      h.p(`Little River's homes fall into five parts, and each gives you something the others do not. The numbers on the map match the entries below.`) +
      PARTS_MAP +

      partH3(P1, "all three marinas within a mile") +
      h.p(`This is the part to choose if the boat comes first. The waterfront at the end of Mineola Avenue, its restaurants and all three marinas with deeded slips are within about a mile of the village center. At Mariner's Pointe, the condo buildings ring the slip basin.`) +
      HARBOURS_PHOTO +
      h.p(`Golf is here too. Hidden Lakes Village borders the River Hills golf course, and Eastport's homes line a course beside Coquina Harbour. Cypress Village, with houses and townhouses, is the largest subdivision in this part.`) +
      h.p(`Homes in Cypress Village resold for about ${mid("CYPRESS VILLAGE")} at the middle in the past year, and in Hidden Lakes Village for about ${mid("HIDDEN LAKES VILLAGE")}. Flood risk is highest at the water's edge: about half the condos at Mariner's Pointe and most homes at Eastport are in FEMA's high-risk zone.`) +
      ask(P1) +

      partH3(P2, "Heather Glen and Vereen Gardens") +
      h.p(`Heather Glen is the biggest neighborhood in Little River, with more than 1,100 houses north-east of the old village, and the busiest: more of its houses resold in the past year than in any other. Heather Lakes is east of it.`) +
      h.p(`This is the side nearest Calabash, North Carolina. Vereen Memorial Historical Gardens is in this part too, between US 17 and the waterway, with its trails along the marsh.`) +
      h.p(`Houses in Heather Glen and Heather Lakes usually resold for about ${mid("HEATHER GLEN")}. Windjammer Village, the third large neighborhood here, has some homes in the high-risk flood zone.`) +
      ask(P2) +

      partH3(P3, "golf, dry ground and a river ramp") +
      h.p(`River Hills is built along the River Hills golf course. Lafayette Park has more than 400 houses on lots of ${LAFAYETTE_LOT}.`) +
      h.p(`Worthams Ferry Landing, the county's ramp on the Waccamaw River, is north of this part, for a boat you keep on a trailer.`) +
      h.p(`Houses resold for about ${mid("RIVER HILLS")} at the middle in River Hills and about ${mid("LAFAYETTE PARK")} in Lafayette Park. The marinas are back toward the old village, a drive rather than a walk.`) +
      ask(P3) +

      partH3(P4, "the landing and condos on the water") +
      h.p(`McLeod Seacoast hospital is in this part, about ${HOSP} minutes from the old village. T. Craig Campbell Landing, the county's ramp at the US 17 bridge, is at its south edge.`) +
      h.p(`Carolina Yacht Landing, a condo community on the waterway west of that landing, has about half its units within about 50 feet of the water. Bay Tree, near the hospital, has condos and townhouses.`) +
      h.p(`Among Little River subdivisions with at least five resales, the two highest prices are here: Sawgrass Village at Bridgewater, at about ${mid("SAWGRASS VILLAGE @ BRIDGEWATER")}, and Waterside Village, at about ${mid("WATERSIDE VILLAGE")}. Condos at Carolina Yacht Landing resold for about ${r1k(CYL.median)}.`) +
      ask(P4) +

      partH3(P5, "a shorter drive to Myrtle Beach") +
      h.p(`This part suits a buyer who drives south to Myrtle Beach often. SC 31, the Carolina Bays Parkway, starts at its edge. From its subdivisions, Coastal Grand Mall in Myrtle Beach is about ${FW_MALL[0]} to ${FW_MALL[1]} minutes by car and the airport about ${FW_AIR[0]} to ${FW_AIR[1]}, a few minutes sooner than from the old village.`) +
      h.p(`It is the part farthest from the water: the old village's waterfront is about ${FW_WATER[0]} to ${FW_WATER[1]} minutes back east by car, and McLeod Seacoast hospital about ${FW_HOSP[0]}. Its three largest subdivisions, Hidden Brooke, Palm Lakes Plantation and Waterfall, are neighborhoods of houses.`) +
      h.p(`In the past year, houses resold for about ${mid("PALM LAKES PLANTATION")} at the middle in Palm Lakes Plantation, ${r1k(HIDDEN_BROOKE.median)} in Hidden Brooke and ${mid("WATERFALL")} in Waterfall.`) +
      ask(P5) +
      SUB_CHART },

    { h2: "Does Little River flood?", toc: "Flooding", id: "flooding", html: (bg) =>
      h.p(`Most of it does not. About ${OUT_PER_100} in 100 Little River homes are outside FEMA's high-risk flood zone. Homes right by the water are the exception: close to half of them are inside it.`) +
      FLOOD_CHART +
      h.p(`Hurricane Hazel came ashore near Little River, at the North Carolina and South Carolina line, in October 1954 as a Category 4 hurricane. It hit at the year's highest tide, and the storm surge reached as high as 18 feet at Calabash.`) +
      h.p(`Few houses for sale at our last count were in the high-risk zone. Our page on ${h.a("/buyers/undisclosed-flooding/", "how to find out if a house flooded")} shows every record we use.`) +
      h.h3("Do you need flood insurance in Little River?") +
      h.p(`A lender must require flood insurance when the building is in FEMA's high-risk zone, and can ask for it anywhere.`) +
      h.p(`In the Little River ZIP, a flood policy on a house outside the zone usually costs about ${POL_X} a year, and inside it about ${POL_A}. A new policy starts 30 days after you apply and pay, unless you buy it with your home loan.`) +
      h.cta("Find out the flood risk of one Little River house", "Send us the address. We check its flood map, its elevation and the seller's flood disclosure, and tell you whether a lender must require flood insurance.", "Have us check a house's flood risk", "/contact/", bg) },

    { h2: "What does it cost to own a home in Little River each year?", toc: "Yearly cost", id: "yearly-cost", html: () =>
      h.p(`A typical resold house you live in costs about ${r100(WX.tax_4pct + 480 + qx(0.25))} to ${r100(WX.tax_4pct + 480 + qx(0.75))} a year in property tax, a flood policy and homeowners insurance, before wind and hail cover.`) +
      compareCards([
        { name: "Property tax", cells: { year: `About ${TAX_HOME}` } },
        { name: "Flood policy outside the high-risk zone", cells: { year: `About ${POL_X}` } },
        { name: "Homeowners insurance, without wind and hail", cells: { year: `About ${INS_LO} to ${INS_HI}` } },
        { name: "Together", cells: { year: `About ${r100(WX.tax_4pct + 480 + qx(0.25))} to ${r100(WX.tax_4pct + 480 + qx(0.75))}` } },
      ], [{ key: "year", label: "Each year" }], { caption: `Each year, for a typical resold house you live in, outside North Myrtle Beach`, nameLabel: "What you pay" }) +
      h.p(`That insurance range is for a house insured for $350,000. It leaves out wind and hail, which is priced on its own here. We get that quote for any house before you make an offer.`) +
      h.p(`South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent, so the same house as a rental pays about ${TAX_RENT}. The owner must apply for the lower rate; our ${h.a("/buyers/property-taxes/", "property tax page")} shows how. Where there is an HOA, its fee comes on top, and we read its budget and rules with you. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance page")} explains each policy.`) },

    { h2: "What do homes cost in Little River, SC?", toc: "Home prices", id: "home-prices", html: (bg) =>
      h.p(`A resold house in Little River usually sold for about ${HOUSE} in the past year. Half sold for between about ${r1k(SZ.house_resale.q1)} and ${r1k(SZ.house_resale.q3)}. New houses from builders sold for less in the middle.`) +
      PRICE_CHART +
      h.h3("What kind of homes are here") +
      h.p(`About two in three homes in the Little River ZIP are houses, and more than a quarter are condos.`) +
      h.p(`Room to spread out is uncommon. Fewer than one in twenty houses sits on an acre or more, and the typical house lot is about a fifth of an acre.`) +
      h.h3("Homes for sale now") +
      G.bars([
        ["Houses", LT.house, near(LT.house.n, 10)], ["Townhouses", LT.townhouse, String(LT.townhouse.n)], ["Manufactured homes", LT.manufactured, String(LT.manufactured.n)],
        ["Condos", LT.condo, near(LT.condo.n, 10)], ["Lots", LT.land, String(LT.land.n)],
      ].map(([name, t, k]) => ({ name, value: t.median, valueText: r1k(t.median), feature: `about ${k} for sale` })),
      { caption: "Homes for sale with a Little River address, at our last count", nameLabel: "Kind", featureLabel: "for sale", valueLabel: "Middle asking price", compact: true,
        note: "Asking prices, not sales. Listing counts from the Coastal Carolinas Association of REALTORS MLS, in aggregate." }) +
      h.p(`About ${L.api_totals["house+new_construction"]} of the houses for sale were new construction, and ${L.house_under_300k} asked under $300,000.`) +
      h.cta("Know what a Little River house is worth before you offer", "Send us the address. We pull what nearby homes like it sold for in the past year and give you a value with those sales behind it.", "Have us value a Little River house", "/contact/", bg) },

    { h2: "What do homes rent for in Little River?", toc: "Renting out", id: "renting-out", html: () =>
      h.p(`HUD's Small Area Fair Market Rent for a three-bedroom in the Little River ZIP is ${money(HUD["29566"]["3"])} a month, with utilities. That is above North Myrtle Beach's ZIP and Myrtle Beach's, and close to Carolina Forest's.`) +
      RENT_CHART +
      h.p(`Rents people pay here are higher than the county's: the Census survey's middle rent in Little River is about ${RENT_LR} a month, against about ${RENT_CTY} countywide, apartments included.`) +
      h.h3("A worked example") +
      h.p(`Take a typical resold house. At HUD's three-bedroom figure of ${money(WX.rent_3br_month)} a month, a year comes to about $25,000, about ${Math.round(WX.gross_rent_to_price_pct)} percent of the price. As a rental, the house pays about ${TAX_RENT} a year in property tax, about ${Math.round(WX.tax_6pct_share_of_rent)} percent of that rent.`) +
      h.p(`Insurance, upkeep, management and empty months come out of the rent too. Our ${h.a("/invest/long-term-rental/", "rental analyzer")} works them out for any address.`) +
      h.h3("Short-term rentals") +
      h.p(`Little River has no city ordinance, so county rules apply. A home in Little River outside North Myrtle Beach that is rented short term needs:`) +
      h.ul(["a Horry County business license;", "a county hospitality and accommodations account;", "a South Carolina sales and accommodations tax account;", "a yearly county personal property return for its furnishings, due April 30."]) +
      h.p(`An HOA's rules can forbid short stays, and we read them first. See ${h.a("/invest/str-rules/", "the short-term rental rules by town")} and ${h.a("/invest/airbnb-income/", "what a nightly rental earns by town")}.`) },

    { h2: "Is the Carolina Bays Parkway being extended through Little River?", toc: "The new road", id: "carolina-bays-parkway", html: (bg) =>
      h.p(`The extension is planned but not built. The Carolina Bays Parkway, SC 31, would be extended from SC 9 north-east, passing north and northwest of Little River's old village. It would cross the state line to US 17 near Shallotte, North Carolina. It would be a multi-lane freeway, partly on new ground.`) +
      h.p(`South Carolina's part is in SCDOT's current program. North Carolina has not funded land buying or building for its part. The whole project is estimated at $797 million.`) +
      h.p(`The two states have named a preferred route. The final choice comes after they review the comments from the public hearings.`) +
      h.cta("See how close a house is to the planned road", "Send us the address of a house in the north-west part. We show you where it sits on the map of the preferred route.", "Have us map a house against the route", "/contact/", bg) },

    { h2: "What are the pros and cons of living in Little River?", toc: "Pros and cons", id: "pros-and-cons", html: (bg) =>
      h.p("The good points are the water, the price and a year-round town. The hard ones are the few houses on the water, flooding at the water's edge, and the drive to the airport.") +
      prosCons([
        "Deeded boat slips you can own, and public ramps on the waterway and the Waccamaw River.",
        `No city tax, golf in the neighborhoods, and the beach about ${BEACH} minutes away.`,
        "A year-round community, with the waterfront, the Blue Crab Festival, the swing bridge and Vereen Gardens.",
      ], [
        "Few houses are on the water, and those cost far more. We pair a house with a deeded slip instead.",
        "Homes right at the water's edge have the most flood risk. We check the flood map and the elevation first.",
        `The airport is about ${AIRPORT} minutes away by car.`,
      ], { bg }) },
  ],
  faqTitle: "Little River, SC FAQ",
  faq: [
    { q: "Is Little River, SC a city, and what county is it in?", a: "Little River is not a city. It is an unincorporated community in Horry County, South Carolina, at the North Carolina line, and the county runs it." },
    { q: "What is there to do in Little River, SC?", a: "Most of Little River's life is on the water: the docks and restaurants on the Mineola Avenue waterfront, and public ramps on the waterway and the Waccamaw River. On land there is golf in the neighborhoods, the trails at Vereen Memorial Historical Gardens and the Blue Crab Festival each May." },
    { q: "How far is Little River from Myrtle Beach?", a: `About ${MALL} minutes by car to Coastal Grand Mall in Myrtle Beach, without traffic. Barefoot Landing, in North Myrtle Beach, is about ${BAREFOOT} minutes, and the airport about ${AIRPORT}.` },
    { q: "Does Little River, SC flood?", a: `Most of it does not: about ${OUT_PER_100} in 100 homes are outside FEMA's high-risk flood zone. The risk is at the water's edge, along the Intracoastal Waterway.` },
    { q: "What is the property tax in Little River, SC?", a: `A home you live in pays only the county's property tax, about ${TAX_HOME} a year on a typical resold house, with no city tax on top. A second home or rental is taxed at a higher rate.` },
    { q: "How much is a boat slip in Little River?", a: "Deeded slips at Mariner's Pointe, most about 30 to 35 feet long, sold for $10,000 to $38,000 in the past year, each on its own deed, without a condo. Bigger slips at Dock Holidays, across the line in North Myrtle Beach, sold for $65,000 to $115,000." },
    { q: "Is Little River, SC safe?", a: "We do not rate any place as safe or unsafe. Reported crime is published by police agency, and we pull the figures for the area around any house you ask about." },
    { q: "Which schools serve Little River, SC?", a: "Horry County Schools assigns schools by address, in nine attendance areas, and none is named Little River. We look up the assigned schools for any house you like." },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "Census profile", href: CENSUS },
    { name: "FEMA flood policies", href: NFIP },
    { name: "HUD rents", href: HUDFMR },
    { name: "2026 tax levy", href: LEVY },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "42 USC 4012a", href: USC4012A },
    { name: "42 USC 4013", href: USC4013 },
    { name: "SCDOT swing bridge", href: BRIDGE },
    { name: "33 CFR 117.911", href: CFR117 },
    { name: "county parks", href: PARKS },
    { name: "boat landings", href: LANDINGS },
    { name: "NWS Hazel", href: HAZEL },
    { name: "rental filings", href: STR_CHART },
    { name: "NCDOT project", href: NCDOT },
    { name: "hearing summary", href: HEARING },
    { name: "Horry County Schools", href: HCS },
    { name: "Blue Crab Festival", href: "https://bluecrabfestival.org/" },
    { name: "SC sample rates", href: "https://online.doi.sc.gov/Eng/Public/HelpInsure/HelpInsure.aspx?LinkId=Home" },
  ],
  sourcesNote: "Our counts from county parcels, flood maps and deeds. Listings in aggregate from CCMLS. Drives without traffic.",
  afterSources: () => CREDITS + PH.imageSchema(SHOWN) + MAP_SCHEMA,
  bottomCta: END,
  keywords: "living in Little River SC, Little River SC boat slips for sale, Little River SC waterfront homes, Little River SC flooding, is Little River SC a good place to live, Little River SC neighborhoods, Little River SC home prices, Little River SC property tax, is Little River SC a city, Little River SC boat ramp",
  about: "Little River, an unincorporated community on the Intracoastal Waterway in Horry County, South Carolina",
});
