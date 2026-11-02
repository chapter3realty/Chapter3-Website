/* /submarkets/myrtle-beach/ - Myrtle Beach real estate for two readers: the buyer who will live here and
 * the buyer of a condo to rent by the night. What living in the city gives you, the parts of the city
 * people live in (each sold on what it has, then its price), where the city allows nightly rentals (our
 * map and counts), the oceanfront buildings, whether a typical oceanfront one-bedroom pays its way, prices,
 * whether a Myrtle Beach address is in the city, property tax and flood insurance, and the pros and cons.
 *
 * Batch 2026-11-a, Lane U. Version 2, fix round 1 (2026-11-02): the page now leads with life in the city
 * and the places, not the zoning (owner 2026-10-14, "sell them on the location"); fewer numbers; no
 * personified rules; one offer at the top and one at the end, the homes strips in between.
 * Version 1, 2026-11-02, was the first spec; the live page was hand-made.
 * Facts: Blog-Brain batches/2026-11-a/submarkets-myrtle-beach/facts.md (VERIFIED rows, CORRECTED rows at the
 * verifier's corrected values and wording only, and rows 41 to 52 marked VERIFIED-BY-FIXER in fix round 1
 * for the lead to re-check; VERIFY.md; struck wording in submarkets-myrtle-beach-struck.json). Row 11 is
 * struck and no longer used.
 * Data: data/2026-11-a/submarkets-myrtle-beach/ (findings.json from analyze.py; map-str-zones.geojson;
 * chart-values.json, Zillow; chart-str-months.json, AirROI; chart-jobs.json, BLS; worked-example.json;
 * nfip-city-houses.json and building-units.json from fix1_data.py; photos.json). Every count, share, price
 * and chart value is read from those files here and checked against its ledger row, never typed. Values
 * typed with a row number beside them: row 5's square miles, row 19's combined Landmark row, and the
 * sourced facts of rows 41 to 50 (named places, the hospital, the airport, the Boardwalk).
 * Not kept from version 1 (reviewers, round 1): the ZIP code table, the owner-share chart, the builder
 * count, the Meridian flood sentence, the overlay ordinance sentence (row 11 struck), the middle offer
 * band, the links that sent the reader to read other pages instead of an answer.
 * Pictures: our nightly-rental map (drawn here from the city's zoning layer and the 2021 city map,
 * map-str-zones.geojson; area-map.js takes no polygon fill, NEEDS.md 3), our own Zillow line chart and
 * season chart, three USGS oblique aerial photos (public domain) and one aerial already on the site
 * (records in photos.json) until the photo partner's shots arrive (shot-list.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance, prosCons } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/";
const SLUG = "submarkets-myrtle-beach";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", SLUG);
const IMG_DIR = path.join(__dirname, "..", "chapter3realty", "images", "2026-11-a", SLUG);
const IMG_SRC = `/images/2026-11-a/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), ZONES = read("map-str-zones.geojson"), ZHVI = read("chart-values.json");
const MONTHS = read("chart-str-months.json"), JOBS = read("chart-jobs.json"), WX = read("worked-example.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r10k = (v) => money(Math.round(v / 10000) * 10000);
const r100 = (v) => money(Math.round(v / 100) * 100);
const near = (v, step) => n(Math.round(v / step) * step);
const must = (ok, msg) => { if (!ok) throw new Error(`myrtle-beach.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const HC = F.homes_in_city, BZ = HC.by_zone_class, SL = F.sales_in_city, L = F.listings, OF = F.oceanfront;

/* Row 7: homes in the city. */
must(HC.all.homes === 31059 && HC.condo.homes === 16929 && HC.house.homes === 10326 && HC.villa_townhouse.homes === 848, "row 7 changed");
const HOMES = near(HC.all.homes, 100), CONDOS = near(HC.condo.homes, 100), HOUSES = near(HC.house.homes, 100);
must(HOMES === "31,100" && CONDOS === "16,900" && HOUSES === "10,300", "row 7 rounding");

/* Row 8: the deciding count. */
must(BZ.str.condo.homes === 13120 && BZ.str.house.homes === 389 && BZ.str.villa_townhouse.homes === 527, "row 8 changed");
const CONDO_STR_4 = Math.round(BZ.str.condo.homes / HC.condo.homes * 4);                 // 3 (in 4)
const HOUSE_NOT_100 = Math.round((1 - BZ.str.house.homes / HC.house.homes) * 100);      // 96 (in 100)
must(CONDO_STR_4 === 3 && HOUSE_NOT_100 === 96, "row 8 shares");

/* Row 9: homes for sale now, inside the city, by zone class (counted in aggregate). */
const HI = L.houses_inside, IZ = L.inside_by_zone_class, OCI = L.oceanfront_condos_inside;
must(HI.n === 350 && HI.in_str_zone === 76 && IZ.str.house.n === 43 && IZ.str.townhouse.n === 33 && L.inside.condo.n === 1004 && IZ.str.condo.n === 911, "row 9 changed");
must(OCI.n === 668 && OCI.in_str_zone === 667, "row 9 oceanfront changed");
must(L.inside.house.n === 264 && L.inside.townhouse.n === 86, "row 9 split changed");
/* Row 10: what listings say. */
must(HI.listing_says_str_allowed === 35 && HI.listing_says_str_allowed_not_str_zone === 3, "row 10 changed");

/* Row 5 (CORRECTED by the verifier: two overlapping planned-development polygons were counted twice). */
const SQMI = { str: "5.1", r: "5.0", pud: "8", other: "5.6", city: "23.8" };                // row 5, typed
must(Math.abs(F.city.county_layer_sqmi - 23.83) < 0.01, "row 5 city area changed");

/* Rows 12 and 13: who owns. */
must(HC.condo.rate_4pct === 1993 && HC.condo.owner_mail_not_sc === 10945 && HC.house.rate_4pct === 7732 && HC.house.owner_mail_not_sc === 1208, "row 12 changed");
must(BZ.str.condo.pct_4pct === 5.5 && BZ.r_no.condo.pct_4pct === 35.3 && BZ.r_no.condo.homes === 2464, "row 13 changed");
const CONDO_MAIN = Math.round(HC.condo.pct_4pct), HOUSE_MAIN = Math.round(HC.house.pct_4pct);   // 12, 75

/* Row 14: months of supply. */
const MS = L.months_supply_inside;
must(MS.condo_listings === 1004 && MS.condo_sales_12m === 661 && Math.round(MS.condo_months) === 18 && MS.house_th_listings === 350 && Math.round(MS.house_months) === 4, "row 14 changed");

/* Row 15: Zillow (chart-values.json). */
const zl = (s, m) => (ZHVI[s].find((r) => r[0] === m) || [])[1];
const zmax = (s) => ZHVI[s].reduce((a, b) => (b[1] > a[1] ? b : a));
must(zl("condo", "2026-09") === 206578 && zl("condo", "2025-09") === 210378 && zmax("condo")[0] === "2024-04", "row 15 condo changed");
must(zl("single_family", "2026-09") === 375430 && zl("single_family", "2025-09") === 372856 && zmax("single_family")[0] === "2022-09", "row 15 single-family changed");
const CONDO_OFF_PEAK = Math.round((1 - zl("condo", "2026-09") / zmax("condo")[1]) * 100);          // 14
const SFR_OFF_PEAK = Math.round((1 - zl("single_family", "2026-09") / zmax("single_family")[1]) * 100);                // 3
const CONDO_YR = Math.round((1 - zl("condo", "2026-09") / zl("condo", "2025-09")) * 100);         // 2
must(CONDO_OFF_PEAK === 14 && SFR_OFF_PEAK === 3 && CONDO_YR === 2, "row 15 shares");

/* Rows 16 and 17: resale prices. */
const RC = SL.resale_condo, RN = SL.resale_not_condo;
must(RC.n === 658 && RC.median === 175000 && RN.n === 1005 && RN.median === 305000, "row 16 changed");
const RC_Q1 = r1k(RC.q1), RC_Q3 = r1k(RC.q3), RN_Q1 = r1k(RN.q1), RN_Q3 = r1k(RN.q3);
must(RC_Q1 === "$104,000" && RC_Q3 === "$275,000" && RN_Q1 === "$170,000" && RN_Q3 === "$530,000", "row 16 rounding");
must(SL.by_zone_class.str.condo.median === 155000 && SL.by_zone_class.r_no.condo.median === 270500 && SL.by_zone_class.r_no.condo.n === 54, "row 17 changed");

/* Row 18: oceanfront condo resales. */
const OCS = OF.oceanfront_condo_sales;
must(OCS.n === 459 && OCS.median === 148000 && OCS.matched_owner === 450 && OCS.buyer_mail_not_sc === 335, "row 18 changed");
must(SL.top_buyer_states.slice(0, 4).map((s) => s[0]).join() === "NC,PA,NY,VA", "row 18 states changed");

/* Row 19 (CORRECTED: Landmark phases I and II are one resort at one point; combined 51 sales, about $102,000). */
const TB = Object.fromEntries(OF.top_buildings.map((b) => [b.group, b]));
must(TB["LANDMARK HPR PH I"].n + TB["LANDMARK HPR PH II"].n === 51, "row 19 Landmark changed");
const BUILDINGS = [
  ["TIDES/DRIFTWD/OASIS HPR", "Tides/Driftwood/Oasis"],
  [null, "Landmark Resort", 51, 102000],                                                      // row 19, typed (verifier)
  ["CORAL BEACH HPR", "Coral Beach"],
  ["CARAVELLE RESORT HPR", "Caravelle Resort"],
  ["PINNACLE OCEANFRT TOWER", "Pinnacle Oceanfront Tower"],
  ["LONG BAY RESORT HPR", "Long Bay Resort"],
  ["MONTEREY BAY SUITES RST", "Monterey Bay Suites"],
  ["DUNES VILLAGE HPR", "Dunes Village"],
  ["SAND DUNES OCEANFRONT", "Sand Dunes Oceanfront"],
].map(([k, name, cnt, med]) => ({ name, n: k ? TB[k].n : cnt, median: k ? TB[k].median : med }));
must(BUILDINGS.map((b) => `${b.n}/${Math.round(b.median / 1000)}`).join(" ") === "60/53 51/102 36/85 28/145 23/150 21/170 19/150 17/269 14/131", "row 19 changed");

/* Row 20: flood by home type. Row 21: the Arbor Glenn district. */
must(HC.condo.in_sfha === 4212 && HC.condo.in_ve === 1105 && HC.house.in_sfha === 458, "row 20 changed");
const AG = HC.by_part.arbor_glenn_meridian.house;
must(AG.homes === 513 && AG.pct_in_sfha === 40.0, "row 21 changed");

/* Rows 22 to 24: the parts people live in. */
const GD = HC.by_part.grande_dunes.house, MC = HC.by_part.market_common.house, OR = HC.by_part.older_r_house_zones.house;
const GDs = SL.by_part.grande_dunes.resale_not_condo, MCs = SL.by_part.market_common.resale_not_condo, ORs = SL.by_part.older_r_house_zones.resale_not_condo;
must(GD.homes === 2151 && GD.pct_4pct === 81.0 && GDs.n === 108 && GDs.median === 882500, "row 22 changed");
must(MC.homes === 2491 && MC.pct_4pct === 85.6 && MCs.n === 170 && MCs.median === 498750, "row 23 changed");
must(OR.homes === 3158 && OR.pct_4pct === 70.9 && ORs.n === 116 && ORs.median === 552500, "row 24 changed");

/* Row 25: the mailing address. */
const MA = F.mailing_address_countywide, MZ = MA.by_zip;
must(MA.inside_city === 13235 && MA.outside_city === 42744, "row 25 changed");
must(MZ["29579"].all === 21216 && MZ["29579"].inside_city === 280 && MZ["29588"].all === 19008 && MZ["29588"].inside_city === 0, "row 25 ZIPs changed");
must(MZ["29577"].all === 10429 && MZ["29577"].inside_city === 8898 && MZ["29572"].all === 5250 && MZ["29572"].inside_city === 4056, "row 25 ZIPs changed");
const OUT_4 = Math.round(MA.outside_city / (MA.inside_city + MA.outside_city) * 4);               // 3 (in 4)
must(OUT_4 === 3, "row 25 share");

/* Row 26: people (raw/sub-est2025_45.csv). */
{ const csv = fs.readFileSync(path.join(DATA, "raw", "sub-est2025_45.csv"), "utf8");
  must(csv.includes("Myrtle Beach city,South Carolina,35694,35972,37014,38499,39838,40669,40937"), "row 26: the Census row changed"); }
const POP = near(40937, 100), GROWTH = Math.round((40937 - 35694) / 35694 * 100);
must(POP === "40,900" && GROWTH === 15, "row 26");

/* Row 29: AirROI months. Row 30: the one-bedroom median. Row 32: the worked example. */
const MON = Object.fromEntries(MONTHS.months);
must(MON.July === 6800 && MON.January === 1340, "row 29 changed");
const SUMMER = Math.round((MON.June + MON.July + MON.August) / MONTHS.months.reduce((t, m) => t + m[1], 0) * 100);
must(SUMMER === 47, "row 29 summer share");
const JULY_X_JAN = Math.round(MON.July / MON.January);                                             // 5
must(JULY_X_JAN === 5, "row 29 ratio");
must(WX.gross_bookings_1br_median === 17000 && WX.running_costs === 6475 && WX.property_tax_6pct_on_price === 2443 && WX.left_for_hoa_insurance_and_any_loan === 8082 && WX.left_per_month === 674, "row 32 changed");
must(WX.asking_price_median_1br_oceanfront_inside_city === 159950 && WX.listings === 346 && OCI.by_beds["1"].n === 346, "row 32 price changed");
const AFTER_COSTS = WX.gross_bookings_1br_median - WX.running_costs;                               // 10,525

/* Row 33: tax per $100,000. */
must(F.tax.per_100k_4pct_net === 404 && F.tax.per_100k_6pct === 1527.6, "row 33 changed");
const TAX4 = (p) => p / 100000 * F.tax.per_100k_4pct_net, TAX6 = (p) => p / 100000 * F.tax.per_100k_6pct;

/* Row 35: jobs. */
const JM = Object.fromEntries(JOBS.months);
must(JM["2025-01"] === 31298 && JM["2025-07"] === 40569, "row 35 changed");

/* Row 36: builders. */
must(SL.builder.n === 49, "row 36 changed");

/* Row 51: flood insurance on houses in the city (nfip-city-houses.json, FEMA NFIP policies). */
const NFIP = read("nfip-city-houses.json");
must(NFIP.high.n === 324 && NFIP.high.median === 833 && NFIP.x.n === 1793 && NFIP.x.median === 571, "row 51 changed");
const FLOOD_HIGH = r100(NFIP.high.median), FLOOD_X = r100(NFIP.x.median);                     // $800, $600
must(FLOOD_HIGH === "$800" && FLOOD_X === "$600", "row 51 rounding");

/* Row 52: what the busiest oceanfront buildings have for sale (building-units.json, listings in aggregate). */
const UNITS = read("building-units.json").buildings;
must(UNITS["TIDES/DRIFTWD/OASIS HPR"].listings === 30 && UNITS["TIDES/DRIFTWD/OASIS HPR"].beds["0"] === 30 && UNITS["TIDES/DRIFTWD/OASIS HPR"].median_sqft === 385, "row 52 changed");
const BEDW = ["Studios", "One-bedrooms", "Two-bedrooms", "Three-bedrooms"];
const unitWords = (k) => {
  const b = UNITS[k].beds, tot = Object.values(b).reduce((a, c) => a + c, 0), keys = Object.keys(b).map(Number).sort();
  const [top, cnt] = Object.entries(b).sort((x, y) => y[1] - x[1])[0];
  if (cnt / tot >= 0.9) return BEDW[top];
  if (cnt / tot >= 0.7) return "Mostly " + BEDW[top].toLowerCase();
  if (keys.length === 2 && keys[1] - keys[0] === 1) return `${BEDW[keys[0]]} and ${BEDW[keys[1]].toLowerCase()}`;
  return `${BEDW[keys[0]]} to ${BEDW[keys.at(-1)].toLowerCase()}`.replace("One-bedrooms to", "One- to");
};

/* Rows 53 to 56 (fix round 2): houses alone, the neighborhoods with houses near $300,000, and the homes for sale
   at $300,000 or less (house-resales.json from fix2_data.py). Row 16's "not condo" group mixes houses with condo
   units recorded without "HPR", villas, townhouses and other land uses; the page now prices houses from row 53. */
const HR = read("house-resales.json"), HRH = HR.houses, NB = HR.neighborhoods, LOW = HR.listings_inside_at_or_under_300k;
must(HRH.n === 459 && HRH.median === 539500 && HRH.q1 === 415000 && HRH.q3 === 742500 && HRH.at_or_under_350k === 79, "row 53 changed");
const HOUSE_MED = r10k(HRH.median);                                                                 // $540,000
const UNDER_350_6 = Math.round(HRH.at_or_under_350k / HRH.n * 6);                                   // 1 (in 6)
must(HOUSE_MED === "$540,000" && UNDER_350_6 === 1, "row 53 rounding");
must(LOW.n === 869 && LOW.by_type.house === 8 && LOW.by_type.condo === 820 && LOW.by_type.townhouse === 41, "row 54 changed");
const BO = NB["BENT OAK ESTATES"], ME = NB["MERIDIAN"], SM = NB["SUMMIT @ MERIDIAN"];
must(BO.house_resales === 12 && BO.median === 245500 && BO.district_houses === 150 && BO.district_pct_main_home === 68.7 && BO.district_in_high_risk === 1 && BO.miles_to_coastline < 1 && BO.miles_to_airport < 1.25 && BO.district_nightly_rentals.join() === "pud_no", "row 55 changed");
must(ME.house_resales === 12 && ME.median === 350450 && SM.house_resales === 25 && SM.median === 419000 && ME.district_houses === 513 && !ME.east_of_airport && ME.district_nightly_rentals.join() === "pud_no", "row 56 changed");
const BO_MED = r5k(BO.median), ME_MED = r10k(ME.median), SM_MED = r10k(SM.median);                 // $245,000, $350,000, $420,000
must(BO_MED === "$245,000" && ME_MED === "$350,000" && SM_MED === "$420,000" && Math.round(BO.district_pct_main_home / 10) === 7, "rows 55 and 56 rounding");

const NEAR_300K = compareCards([
  { name: "Bent Oak Estates", cells: { price: `About ${BO_MED}`, flood: "Almost none" } },
  { name: "Meridian", cells: { price: `About ${ME_MED}`, flood: "About 2 in 5" } },
  { name: "Summit at Meridian", cells: { price: `About ${SM_MED}`, flood: "About 2 in 5" } },
], [{ key: "price", label: "Middle resale price, houses" }, { key: "flood", label: "Houses in the high-risk flood zone" }],
{ caption: `Where houses resold near $300,000 in the past year (${BO.house_resales} to ${SM.house_resales} sales each)`, nameLabel: "Neighborhood" });
must(BO.district_in_high_risk <= 2 && Math.round(ME.district_in_high_risk / ME.district_houses * 5) === 2, "rows 21 and 55 flood words");

/* Row 26 in words; rows 41 to 50 are sourced facts typed in the copy below, each with its row number. */

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const ZC = { str: "#c4783a", r_no: "#5f8a6e", pud_no: "#d9cfa6", other_no: "#d4d4cf" };
const CSS = `<style>
main#main .c3-mb-fig{margin:1.6rem 0 1.8rem;max-width:680px}
main#main .c3-mb-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.65rem}
main#main .c3-mb-frame{border-radius:18px;overflow:hidden;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.08)}
main#main .c3-mb-frame img,main#main .c3-mb-frame svg{display:block;width:100%;height:auto}
main#main .c3-mb-legend{display:flex;flex-wrap:wrap;gap:.35rem 1.1rem;margin:.75rem 0 .2rem;padding:0;list-style:none}
main#main .c3-mb-legend li{display:flex;align-items:center;gap:.5rem;color:var(--muted);font-size:1rem;line-height:1.35;margin:0}
main#main .c3-mb-sw{flex:none;display:inline-block;width:1.4rem;height:1rem;border-radius:4px}
main#main .c3-mb-line{flex:none;display:inline-block;width:1.6rem;height:4px;border-radius:2px}
main#main .c3-mb-num{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:.9rem;font-family:var(--sans)}
main#main .c3-mb-h3{display:flex;align-items:baseline;gap:.6rem}
main#main .c3-mb-h3 .c3-mb-num{position:relative;top:-.15rem}
main#main .c3-mb-key{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.35rem}
main#main .c3-mb-key li{display:flex;align-items:center;gap:.6rem;color:var(--muted);font-size:1rem;line-height:1.4;margin:0}
main#main .c3-mb-key a{color:var(--navy)}
main#main .c3-mb-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:.8rem;max-width:680px;margin:1.2rem 0 1.4rem}
main#main .c3-mb-tile{padding:1rem 1.1rem;border-radius:18px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 6px 18px rgba(28,32,40,.07)}
main#main .c3-mb-tile .big{display:block;font-family:var(--serif);font-size:2rem;line-height:1.1;color:var(--navy)}
main#main .c3-mb-tile .lbl{display:block;color:var(--muted);font-size:1rem;line-height:1.45;margin-top:.3rem}
main#main .c3-mb-tile.hot .big{color:#8a5226}
main#main .c3-mb-sum{max-width:620px;margin:1.2rem 0 1.4rem;border-radius:18px;overflow:hidden;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 6px 18px rgba(28,32,40,.07)}
main#main .c3-mb-sum .cap{display:block;padding:.9rem 1.1rem .4rem;color:var(--navy);font-weight:600;font-size:1.05rem;line-height:1.35}
main#main .c3-mb-sum ol{list-style:none;margin:0;padding:0 1.1rem .6rem}
main#main .c3-mb-sum li{display:flex;justify-content:space-between;gap:1rem;align-items:baseline;padding:.55rem 0;border-top:1px solid rgba(28,32,40,.08);color:var(--muted);font-size:1rem;line-height:1.45;margin:0}
main#main .c3-mb-sum li strong{color:var(--navy);white-space:nowrap;font-weight:600}
main#main .c3-mb-sum li.tot{border-top:2px solid var(--navy);color:var(--navy);font-weight:600}
main#main .c3-mb-sum li.tot strong{color:#8a5226;font-size:1.15rem}
main#main svg.c3-mb-chart text.ct{font-family:var(--sans),system-ui,sans-serif;font-size:16px;fill:#4a5763}
main#main svg.c3-mb-chart text.cl{font-family:var(--sans),system-ui,sans-serif;font-size:16px;font-weight:700}
@media (min-width:700px){main#main svg.c3-mb-chart text.ct,main#main svg.c3-mb-chart text.cl{font-size:11px}}
main#main h2{text-wrap:balance}
main#main .c3-mb-life{list-style:none;margin:1rem 0 1.4rem;padding:0;display:grid;gap:.7rem;max-width:680px}
main#main .c3-mb-life li{margin:0;padding:.85rem 1rem;border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 6px 18px rgba(28,32,40,.07);line-height:1.55}
main#main .c3-mb-life strong{color:var(--navy)}
/* Hero chips: two columns on a narrow phone, so a label like "Boardwalk" fits its chip (critic, fix round 1, 320 px). */
@media (max-width:420px){#main .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.5rem!important}#main .c3-glance li{padding:.5rem .4rem!important}}
main#main .c3-pc{align-items:stretch}
/* The end band: glass.js's compact-bar rule draws it light under ivory text (Conway, critic round 1; NEEDS.md). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The parts of the city people choose between (rows 22 to 24, 13, 17, 41 to 46).  */

const PARTS = [
  { key: "grande_dunes", num: 1, name: "Grande Dunes", id: "grande-dunes" },
  { key: "market_common", num: 2, name: "The Market Common", id: "market-common" },
  { key: "older_r_house_zones", num: 3, name: "The older neighborhoods", id: "older-neighborhoods" },
  { key: "oceanfront", num: 4, name: "A condo on the oceanfront", id: "oceanfront-condo", pt: [-78.8765, 33.6905] },
].map((p) => Object.assign(p, { pt: p.pt || HC.by_part[p.key].center }));
const numDot = (p) => `<span class="c3-mb-num" aria-hidden="true">${p.num}</span>`;

/* ---------------------------------------------------------------------------- */
/* The map: the city's zoning in four classes (map-str-zones.geojson), drawn here.  */


const dec = (flat, sc = 1e4) => { const o = []; let x = 0, y = 0; for (let i = 0; i < flat.length; i += 2) { x += flat[i]; y += flat[i + 1]; o.push([x / sc - 80, y / sc + 33]); } return o; };
const RENTAL_MAP = (() => {
  const city = ZONES.features.find((f) => f.properties.class === "city_limits").geometry.coordinates;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const poly of city) for (const [lo, la] of poly[0]) { x0 = Math.min(x0, lo); x1 = Math.max(x1, lo); y0 = Math.min(y0, la); y1 = Math.max(y1, la); }
  const padX = (x1 - x0) * 0.03, padY = (y1 - y0) * 0.03;
  x0 -= padX; x1 += padX; y0 -= padY; y1 += padY;
  const kx = Math.cos((y0 + y1) / 2 * Math.PI / 180);
  const W = 760, S = W / ((x1 - x0) * kx), H = Math.round((y1 - y0) * S);
  const P = (lo, la) => [(lo - x0) * kx * S, (y1 - la) * S];
  const f1 = (v) => Math.round(v * 10) / 10;
  const d = (pts, close) => { const out = []; let last = null;
    for (const [lo, la] of pts) { const p = P(lo, la); if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= 1.2) { out.push(p); last = p; } }
    return out.length < 3 ? "" : "M" + out.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L") + (close ? "Z" : ""); };
  const multi = (coords) => coords.map((poly) => poly.map((r) => d(r, true)).join("")).join("");
  const cls = (k) => ZONES.features.find((f) => f.properties.class === k).geometry.coordinates;
  /* The ocean: the coastline closed far out at sea (the area-map.js rule). */
  const GEO = JSON.parse(fs.readFileSync(path.join(BB, "tools", "geo", "grand-strand-v2.json"), "utf8")).region;
  const coast = dec(GEO.coast).filter(([lo, la]) => lo > x0 - 0.05 && lo < x1 + 0.05 && la > y0 - 0.05 && la < y1 + 0.05);
  must(coast.length > 20, "the coastline is missing from the map box");
  const sea = d([...coast, [x1 + 0.1, y0 - 0.1], [x1 + 0.1, coast[0][1] < coast.at(-1)[1] ? y0 - 0.1 : y1 + 0.1]], true);
  const label = (lo, la, text, o = {}) => { const [x, y] = P(lo, la); return `<text class="lb${o.it ? " it" : ""}" x="${f1(x + (o.dx || 0))}" y="${f1(y + (o.dy || 0))}" text-anchor="${o.anchor || "start"}" fill="${o.fill || "#1c2028"}">${text}</text>`; };
  const marks = PARTS.map((p) => { const [x, y] = P(p.pt[0], p.pt[1]); return `<g transform="translate(${f1(x)} ${f1(y)})"><circle r="21" fill="#1c2028" stroke="#fff" stroke-width="4"/><text class="nm" y="9" text-anchor="middle">${p.num}</text></g>`; }).join("");
  const ap = P(-78.92906, 33.68064);                                                          // row 40: the airport, OSM aerodrome point
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Map of the City of Myrtle Beach and where it allows nightly rentals">`
    + `<style>.lb{font-family:'DM Sans',system-ui,sans-serif;font-size:27px;font-weight:700;paint-order:stroke;stroke:#fff;stroke-width:6px;stroke-linejoin:round}.it{font-style:italic;font-weight:600}.nm{font-family:'DM Sans',system-ui,sans-serif;font-size:26px;font-weight:700;fill:#fff}@media (min-width:560px){.lb{font-size:19px}}</style>`
    + `<rect width="${W}" height="${H}" fill="#f4efe8"/>`
    + `<path d="${sea}" fill="#d6eaf2"/>`
    + `<path d="${multi(city)}" fill="#fffdf9"/>`
    + ["other_no", "pud_no", "r_no", "str"].map((k) => `<path d="${multi(cls(k))}" fill="${ZC[k]}" fill-opacity="${k === "str" ? ".95" : ".9"}" fill-rule="evenodd"/>`).join("")
    + `<path d="${multi(city)}" fill="none" stroke="#1c2028" stroke-width="2.2" stroke-linejoin="round"/>`
    + `<g transform="translate(${f1(ap[0])} ${f1(ap[1])})"><path d="M0 -13 L3 -3 L13 2 L13 5 L3 2 L2 9 L6 12 L6 14 L0 12 L-6 14 L-6 12 L-2 9 L-3 2 L-13 5 L-13 2 L-3 -3 Z" fill="#1c2028" stroke="#fff" stroke-width="2" paint-order="stroke"/></g>`
    + label(-78.92906, 33.68064, "Airport", { anchor: "end", dx: -20, dy: 9 })
    + label(-78.86, 33.672, "Atlantic Ocean", { it: true, fill: "#3f6275" })
    + marks + `</svg>`;
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.writeFileSync(path.join(IMG_DIR, "nightly-rental-zones-map.svg"), svg);
  must(svg.length < 175000, `the map is ${svg.length} bytes`);
  const alt = `Map of the City of Myrtle Beach, a long strip along the ocean. Orange areas are where the city allows nightly rentals: most of the oceanfront, the Broadway at the Beach area and stretches of the main roads inland. Green areas are zoned for homes only, where it does not. Numbers mark 1 Grande Dunes at the north end, 2 The Market Common at the south end, 3 the older neighborhoods of houses north of downtown, and 4 the oceanfront condos. The airport is inside the city.`;
  const legend = `<ul class="c3-mb-legend" aria-label="Map colors">`
    + `<li><span class="c3-mb-sw" style="background:${ZC.str}"></span>Nightly rentals allowed</li>`
    + `<li><span class="c3-mb-sw" style="background:${ZC.r_no}"></span>Zoned for homes: no rentals under 90 days</li>`
    + `<li><span class="c3-mb-sw" style="background:${ZC.pud_no}"></span>Planned neighborhoods such as Grande Dunes: not allowed</li>`
    + `<li><span class="c3-mb-sw" style="background:${ZC.other_no}"></span>Other zones: not allowed</li></ul>`;
  const key = `<ol class="c3-mb-key" aria-label="The numbers on the map">` + PARTS.map((p) => `<li>${numDot(p)}<a href="#${p.id}">${p.name}</a></li>`).join("") + `</ol>`;
  return `<figure class="c3-mb-fig" id="rental-map"><div class="c3-mb-frame"><img src="${IMG_SRC}/nightly-rental-zones-map.svg" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async"></div>`
    + `<figcaption>${legend}Where the City of Myrtle Beach allows nightly rentals: the city's own map of those zones, drawn by us on its current zoning lines. The numbers are the four parts of the city described below. Map data: City of Myrtle Beach zoning; Horry County GIS; U.S. Census Bureau TIGER/Line.${key}</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Charts and tables.                                                             */

/* The split, by home type (rows 7 and 8), in words a reader can picture. */
must(Math.round(BZ.str.villa_townhouse.homes / HC.villa_townhouse.homes * 5) === 3, "row 8 villas share");
const SPLIT = compareCards([
  { name: "Condos", cells: { all: `About ${CONDOS}`, str: `About 3 in 4` } },
  { name: "Houses", cells: { all: `About ${HOUSES}`, str: `About 4 in 100` } },
  { name: "Villas and townhouses", cells: { all: `About ${near(HC.villa_townhouse.homes, 50)}`, str: `About 3 in 5` } },
], [{ key: "all", label: "Homes in the city" }, { key: "str", label: "Can rent by the night" }],
{ caption: "Which homes in the City of Myrtle Beach can rent by the night", nameLabel: "Kind of home" });

/* Zillow line chart (row 15), drawn here: glass.js has no line chart. */
const PRICE_CHART = (() => {
  const C = ZHVI.condo, S2 = ZHVI.single_family;
  must(C.length === 93 && S2.length === 93 && C[0][0] === "2019-01" && C.at(-1)[0] === "2026-09", "chart-values.json months changed");
  const W = 360, H = 250, L0 = 60, R0 = 300, T0 = 10, B0 = 214, YMIN = 100000, YMAX = 400000;
  const X = (i) => L0 + i / (C.length - 1) * (R0 - L0), Y = (v) => B0 - (v - YMIN) / (YMAX - YMIN) * (B0 - T0);
  const f1 = (v) => Math.round(v * 10) / 10;
  const line = (s) => "M" + s.map((r, i) => `${f1(X(i))} ${f1(Y(r[1]))}`).join("L");
  const CO = "#c4783a", SF = "#2f6f8f";
  const grid = [100000, 200000, 300000, 400000].map((v) => v === 100000 ? "" : `<line x1="${L0}" y1="${f1(Y(v))}" x2="${R0}" y2="${f1(Y(v))}" stroke="#1c2028" stroke-opacity=".1"/><text class="ct" x="${L0 - 6}" y="${f1(Y(v) + 5)}" text-anchor="end">$${v / 1000}k</text>`).join("");
  const xt = ["2019", "2021", "2023", "2025"].map((y) => { const i = C.findIndex((r) => r[0] === `${y}-01`); return `<text class="ct" x="${f1(X(i))}" y="${B0 + 22}" text-anchor="middle">${y}</text>`; }).join("");
  const pk = C.findIndex((r) => r[0] === zmax("condo")[0]);
  const svg = `<svg class="c3-mb-chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Line chart of Zillow's typical home value in Myrtle Beach from 2019 to 2026. Single-family homes rose from about $${Math.round(S2[0][1] / 1000)},000 to about $${Math.round(zmax("single_family")[1] / 1000)},000 in 2022 and have held near $375,000. Condos rose from about $${Math.round(C[0][1] / 1000)},000 to about $${Math.round(zmax("condo")[1] / 1000)},000 in April 2024 and have fallen to about $${Math.round(zl("condo", "2026-09") / 1000)},000.">`
    + `<rect x="${L0}" y="${T0}" width="${R0 - L0}" height="${B0 - T0}" fill="rgba(255,255,255,.55)" rx="6"/>` + grid + xt
    + `<path d="${line(S2)}" fill="none" stroke="${SF}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="${line(C)}" fill="none" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/>`
    + `<circle cx="${f1(X(pk))}" cy="${f1(Y(C[pk][1]))}" r="4" fill="${CO}" stroke="#fff" stroke-width="1.5"/>`
    + `<text class="cl" x="${f1(X(pk))}" y="${f1(Y(C[pk][1]) - 10)}" text-anchor="middle" fill="#8a5226">Condo high</text>`
    + `<text class="cl" x="${R0 + 6}" y="${f1(Y(S2.at(-1)[1]) + 5)}" fill="${SF}">$${Math.round(S2.at(-1)[1] / 1000)}k</text>`
    + `<text class="cl" x="${R0 + 6}" y="${f1(Y(C.at(-1)[1]) + 5)}" fill="#8a5226">$${Math.round(C.at(-1)[1] / 1000)}k</text>`
    + `</svg>`;
  const legend = `<ul class="c3-mb-legend"><li><span class="c3-mb-line" style="background:${SF}"></span>Houses</li><li><span class="c3-mb-line" style="background:${CO}"></span>Condos</li></ul>`;
  return `<figure class="c3-gchart c3-mb-fig"><span class="cap" style="display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem">Typical home value in Myrtle Beach, houses and condos</span>${legend}${svg}<figcaption>Zillow's typical value, monthly from January 2019. Houses here means single-family homes.</figcaption></figure>`;
})();

/* The busiest oceanfront buildings (rows 18, 19, 52), highest price first, with what each has for sale. */
const BKEY = { "Landmark Resort": "LANDMARK HPR PH I" };
const BUILDING_TABLE = compareCards(BUILDINGS.slice().sort((a, b) => b.median - a.median).map((b) => {
  const k = BKEY[b.name] || OF.top_buildings.find((x) => x.n === b.n && x.median === b.median).group;
  return { name: b.name, cells: { price: `About ${r1k(b.median)}`, units: unitWords(k) } };
}), [{ key: "price", label: "Middle resale price" }, { key: "units", label: "Most homes for sale now" }],
{ caption: "The nine oceanfront condo buildings in the city with the most resales in the past year", nameLabel: "Building" });
must(unitWords("TIDES/DRIFTWD/OASIS HPR") === "Studios" && unitWords("MONTEREY BAY SUITES RST") === "One-bedrooms" && unitWords("DUNES VILLAGE HPR") === "One- to three-bedrooms", "row 52 words");

/* The season (row 29). */
const SEASON_CHART = (() => {
  const M = MONTHS.months, W = 360, H = 232, L0 = 8, R0 = 352, T0 = 34, B0 = 196, MAX = 7000;
  const bw = (R0 - L0) / M.length, f1 = (v) => Math.round(v * 10) / 10;
  const summer = (m) => ["June", "July", "August"].includes(m);
  const bars = M.map(([m, v], i) => { const x = L0 + i * bw + 3, y = B0 - v / MAX * (B0 - T0);
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(bw - 6)}" height="${f1(B0 - y)}" rx="4" fill="${summer(m) ? "#c4783a" : "#5c6b78"}" fill-opacity="${summer(m) ? "1" : ".55"}"/>`
      + `<text class="ct" x="${f1(x + (bw - 6) / 2)}" y="${B0 + 22}" text-anchor="middle">${m[0]}</text>`; }).join("");
  const tag = (m) => { const i = M.findIndex((r) => r[0] === m), v = M[i][1]; const x = L0 + i * bw + bw / 2, y = B0 - v / MAX * (B0 - T0);
    return `<text class="cl" x="${f1(i === 0 ? L0 + 3 : x)}" y="${f1(y - 8)}" text-anchor="${i === 0 ? "start" : "middle"}" fill="${summer(m) ? "#8a5226" : "#4a5763"}">${money(v)}</text>`; };
  const svg = `<svg class="c3-mb-chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Bar chart of what the average Myrtle Beach nightly rental takes in each month: ${M.map(([m, v]) => `${m} ${money(v)}`).join(", ")}.">`
    + `<line x1="${L0}" y1="${B0}" x2="${R0}" y2="${B0}" stroke="#1c2028" stroke-opacity=".25"/>` + bars + tag("January") + tag("July") + `</svg>`;
  const legend = `<ul class="c3-mb-legend"><li><span class="c3-mb-sw" style="background:#c4783a"></span>June to August</li><li><span class="c3-mb-sw" style="background:#5c6b78;opacity:.55"></span>The other months</li></ul>`;
  return `<figure class="c3-gchart c3-mb-fig"><span class="cap" style="display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem">What the average Myrtle Beach nightly rental takes in, by month</span>${legend}${svg}<figcaption>Each month averaged over the past two years, for the Myrtle Beach market, which reaches past the city limits. Source: AirROI.</figcaption></figure>`;
})();

/* The worked example (rows 30 to 33), as a receipt with a total row. */
const WX_TITLE = "A typical one-bedroom's income on a typical oceanfront one-bedroom's price";
const WORKED = `<div class="c3-mb-sum" role="group" aria-label="${WX_TITLE}"><span class="cap">${WX_TITLE}</span><ol>`
  + `<li><span>What a typical one-bedroom nightly rental took in for a year, counting listings open only part of the year</span><strong>About ${r1k(WX.gross_bookings_1br_median)}</strong></li>`
  + `<li><span>Running costs for an owner who runs it without a manager: the Airbnb fee, cleaning, utilities, supplies, repairs, a short-term rental policy and the permit</span><strong>About ${r100(WX.running_costs)}</strong></li>`
  + `<li><span>Property tax at the rate for second homes, on ${r1k(WX.asking_price_median_1br_oceanfront_inside_city)}</span><strong>About ${r100(WX.property_tax_6pct_on_price)}</strong></li>`
  + `<li class="tot"><span>Left each year for the HOA fee, a policy on the unit itself and any loan</span><strong>About ${r100(WX.left_for_hoa_insurance_and_any_loan)}</strong></li></ol></div>`;
must(r100(WX.running_costs) === "$6,500" && r100(WX.property_tax_6pct_on_price) === "$2,400" && r100(WX.left_for_hoa_insurance_and_any_loan) === "$8,100", "row 32 rounding");

/* How fast homes sell (row 14), in words. */
const SUPPLY = `<div class="c3-mb-tiles"><div class="c3-mb-tile hot"><span class="big">About ${Math.round(MS.condo_months)} months</span><span class="lbl">to sell every condo for sale in the city, at the past year's pace</span></div>`
  + `<div class="c3-mb-tile"><span class="big">About ${Math.round(MS.house_months)} months</span><span class="lbl">to sell every house and townhouse for sale in the city</span></div></div>`;

/* Owning each year (row 33), for the typical resale of each kind (row 16). */
function r10(v) { return money(Math.round(v / 10) * 10); }
const OWN = compareCards([
  { name: "Every $100,000 of value", cells: { live: money(F.tax.per_100k_4pct_net), rent: money(F.tax.per_100k_6pct) } },
  { name: `A ${HOUSE_MED} house`, cells: { live: `About ${r10(TAX4(540000))}`, rent: `About ${r10(TAX6(540000))}` } },
  { name: `A ${money(RC.median)} condo`, cells: { live: `About ${r10(TAX4(RC.median))}`, rent: `About ${r10(TAX6(RC.median))}` } },
], [{ key: "live", label: "A home you live in" }, { key: "rent", label: "A second home or rental" }],
{ caption: "Property tax each year inside the City of Myrtle Beach", nameLabel: "The home" });
must(r10(TAX4(540000)) === "$2,180" && r10(TAX6(540000)) === "$8,250" && r10(TAX4(RC.median)) === "$710" && r10(TAX6(RC.median)) === "$2,670", "row 33 dollars");

/* ---------------------------------------------------------------------------- */
/* Photos (photos.json; each looked at full size, subject_check in its record).    */

const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}`)); must(r, `no photo record for ${name}`); return r; };
const SPLIT_PH = rec("houses-and-towers-from-the-ocean"), TOWERS = rec("oceanfront-towers-from-the-ocean"), OCEAN_HOUSES = rec("oceanfront-houses-from-the-ocean");
const VALOR = rec("market-common-valor-park");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const CAP = new Map([
  [TOWERS, "Oceanfront condo towers south of downtown Myrtle Beach, near three of the busiest buildings in the table above. This stretch is in a zone where nightly rentals are allowed."],
  [OCEAN_HOUSES, "Houses on wide lawns facing the beach, on the older streets north of downtown Myrtle Beach."],
  [VALOR, "The Market Common from the air. The homes outlined in orange are next to the shops and to the lake and ball fields of Grand Park."],
]);
const capOf = (r) => CAP.get(r) || r.caption;
const photo = (r) => lazy(PH.heroPhoto(r, { alt: r.alt, caption: capOf(r), maxWidth: "680px", sizes: "(max-width: 700px) 100vw, 680px" }));
const SHOWN = [SPLIT_PH, TOWERS, VALOR, OCEAN_HOUSES];
/* The credits name each photo by its first sentence (photos.js skips a caption with a date in it, so the
   USGS year stays in the photo records). The towers' first sentence points at the table, so its credit is cut there. */
must(SHOWN.filter((r) => r.taken === "2011-08-24").length === 3, "the three USGS photos changed");
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: capOf(p).split(". ")[0].replace(/, near three of the busiest buildings.*$/, "").replace(/\.$/, "") })));

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const CITY_STR = "https://www.cityofmyrtlebeach.com/news_detail_T6_R1468.php";
const CITY_PZ = "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php";
const CITY_BL = "https://www.cityofmyrtlebeach.com/careers/business/business_faq.php";
const CITY_MC = "https://cityofmyrtlebeach.com/news_detail_T6_R729.php";
const CITY_BW = "https://cityofmyrtlebeach.com/news_detail_T6_R986.php";                          // row 41
const CITY_GP = "https://cityofmyrtlebeach.com/i_want_to/find/photos_of_the_week/pow090420.php";   // row 46
const GD_HOA = "https://grandedunescommunities.sites.townsq.io/2";                                  // row 44
const MC_PARKS = "https://marketcommonmb.com/parks-playgrounds/";                                   // row 46
const PINE = "https://pinelakes.com/";                                                              // row 42
const DUNES = "https://www.thedunesclub.com/";                                                      // row 43
const GSMC = "https://www.mygrandstrandhealth.com/";                                                // row 47
const MYR = "https://www.flymyrtlebeach.com/";                                                      // row 48
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";               // row 49
const AIRBNB_TAX = "https://www.airbnb.com/help/article/2328";                                      // row 50
const NFIP_SRC = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";          // row 51
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZILLOW = "https://www.zillow.com/research/data/";
const AIRROI = "https://www.airroi.com/airbnb-data/united-states/south-carolina/myrtle-beach";
const CENSUS = "https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/cities/totals/";
const QCEW = "https://www.bls.gov/cew/";
const FEMA = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const ST575 = "https://dor.sc.gov/sites/dor/files/forms/ST575.pdf";
const NMB = "https://www.nmb.us/833/Short-term-Rentals";

/* ---------------------------------------------------------------------------- */
/* The offers: one at the top, one at the end, and the homes strips in between    */
/* (affordable-places-to-live: the strip is the offer). One pill, for the          */
/* oceanfront condos, which have no strip yet (NEEDS.md 2).                        */

const TOP = { title: "Tell us how you will use the home", label: "Ask about a Myrtle Beach home", href: "/contact/" };
const END = {
  h2: "Send us an address or a building.",
  p: "We tell you its zone, its HOA's rules on rentals, its HOA fee and its flood zone. Then we send you the homes for sale that fit your plan.",
  label: "Ask about a Myrtle Beach home", href: `/contact/?place=${encodeURIComponent("Myrtle Beach")}`,
};
const partH3 = (p, tail) => `<h3 id="${p.id}" data-toc="${p.name}" class="c3-mb-h3" style="font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:2rem 0 .6rem;line-height:1.3">${numDot(p)}<span>${p.name}${tail ? `: ${tail}` : ""}</span></h3>`;
const [P1, P2, P3, P4] = PARTS;
const AIRPORT_TO_OCEAN = "less than 2 miles";                                                       // row 48, measured
const MC_C6_HOUSES = 331;                                                                           // row 8 notes (verifier checked)
must(MC_C6_HOUSES >= 200 && MC_C6_HOUSES < 1000, "row 8: \"a few hundred\" houses in the town center zone");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  pageImages: () => PH.pageImages(SPLIT_PH),
  title: "Myrtle Beach Real Estate: Where to Live and Rent | Chapter3",
  description: "What living in Myrtle Beach gives you, the parts of the city people live in, our map of where nightly rentals are allowed, and what homes sell for.",
  ogTitle: "Myrtle Beach real estate: where should you buy? Where people live, and where you can rent by the night.",
  crumb: "Myrtle Beach",
  eyebrow: "Myrtle Beach, SC",
  h1: "Myrtle Beach real estate: where should you buy?",
  h1em: "Where people live, and where you can rent by the night.",
  sub: "A 1.3-mile Boardwalk, golf, a large hospital and the airport are all inside the city. Where you buy depends on whether you will live here or rent by the night.",
  heroMedia: glance([
    { icon: "beach", label: "Boardwalk", text: "1.3 miles" },
    { icon: "airport", label: "Airport", text: "50+ nonstop cities" },
    { icon: "home", label: "Houses", text: "Mostly main homes" },
    { icon: "key", label: "Nightly rentals", text: "Most condos" },
  ]),
  heroCta: TOP,
  topOfferLine: "Tell us if you will live in it or rent it. We send the homes that fit.",
  author: "devin",
  shortAnswer: [
    `Buy a house if you will live here. About 3 in 4 houses in the city are their owners' main homes, and almost none may be rented by the night. Buy an oceanfront condo if you want to rent it to visitors: about 3 in 4 condos are in zones where the city allows nightly rentals.`,
    `Houses in the city resold for about ${HOUSE_MED} in the middle, and their prices are steady. Condos resold for about ${money(RC.median)}, and their prices are falling.`,
  ],
  sections: [
    { h2: "What is it like to live in Myrtle Beach?", toc: "Living here", id: "living", html: () =>
      CSS + G.homesCss() +
      h.p(`Myrtle Beach is a city of about ${POP} people on the ocean. About ${GROWTH} percent more people live here than in 2020.`) +
      `<ul class="c3-mb-life">`
      + `<li><strong>The Boardwalk.</strong> Downtown, the ${h.ext(CITY_BW, "Boardwalk")} is about 1.3 miles long, beside the ocean. It has a raised wooden boardwalk, a wide section for entertainment, and a winding walk along the ocean.</li>`
      + `<li><strong>A large hospital.</strong> Grand Strand Medical Center is inside the city, about a mile from the ocean. It has the region's only heart surgery program and a trauma center for the most serious injuries.</li>`
      + `<li><strong>The airport.</strong> Myrtle Beach International Airport is inside the city too, ${AIRPORT_TO_OCEAN} from the ocean. It has nonstop flights to more than 50 cities.</li>`
      + `<li><strong>Golf and shops.</strong> Two golf clubs, Pine Lakes and The Dunes, are in the older neighborhoods described ${h.a("#older-neighborhoods", "below")}. The Market Common, on the south end, has shops, restaurants, a movie theater and two parks.</li>`
      + `</ul>` +
      h.h3("What is the off season like?") +
      h.p(`Quieter, not closed. In the off season, nothing closes except tourist attractions and water parks.`) +
      h.p(`Hotels, restaurants and other leisure businesses in the county had about ${Math.round((JM["2025-07"] / JM["2025-01"] - 1) * 100)} percent more workers in July than in January last year.`) },

    { h2: "Where should you live in Myrtle Beach?", toc: "Where to live", id: "where-to-live", html: (bg) =>
      h.p(`In one of three parts of the city where 7 in 10 or more of the houses are their owners' main homes: Grande Dunes, The Market Common or the older neighborhoods near the golf clubs. Or in a condo, on the oceanfront or off it. For a house near $300,000, look at the ${h.a("#near-300k", "two smaller neighborhoods")} after part 3.`) +
      h.p(`The numbers on the map show where each part is. The orange areas are where the city allows nightly rentals.`) +
      RENTAL_MAP +

      partH3(P1, "on the Waterway, with a beach club") +
      h.p(`Grande Dunes is a planned community on both sides of the Intracoastal Waterway, the inland water route behind the beach. Every homeowner gets a free household membership to the ${h.ext(GD_HOA, "Grande Dunes Ocean Club")}. It has a large pool, a dining room, classes and clubs, and its own way onto the beach.`) +
      h.p(`The community also has a public marina, a public golf course with holes along the water, a private members' golf course and a tennis club.`) +
      h.p(`About 4 in 5 houses here are their owners' main homes. Houses, villas and townhouses resold for about ${r10k(GDs.median)} in the middle, the highest of the parts in this guide.`) +
      G.homes("grande-dunes", "Grande Dunes") +

      partH3(P2, "shops, a lake and parks") +
      h.p(`The Market Common is a town center with shops, restaurants and a movie theater, and apartments above the stores. It was built on land that was the Myrtle Beach Air Force Base.`) +
      h.p(`${h.ext(MC_PARKS, "Grand Park and Valor Park")} are next to the shops. They have a lake with a 1.1-mile path around it, sports fields, picnic areas, fishing spots and Savannah's Playground, built for children of all abilities.`) +
      G.homes("market-common", "The Market Common", photo(VALOR)) +
      h.p(`About ${near(MC.homes, 100)} houses are in the neighborhoods around it, among them Emmens Preserve, The Reserve, Sanctuary at Withers Preserve and Belle Harbor. About 6 in 7 are their owners' main homes, the highest share in this guide. Houses, villas and townhouses here resold for about ${r10k(MCs.median)} in the middle.`) +
      h.p(`The city allows nightly rentals in the town center's zone, which includes a few hundred of these houses. It does not allow them in the other neighborhoods around it. Each neighborhood's HOA can still ban them, and we read its rules for you.`) +

      partH3(P3, "golf and streets by the ocean") +
      h.p(`These neighborhoods are built around two golf clubs. ${h.ext(PINE, "Pine Lakes Country Club")} opened in 1927 as Myrtle Beach's first golf course. ${h.ext(DUNES, "The Dunes Golf and Beach Club")}, on the ocean, hosts a PGA Tour event, the Myrtle Beach Classic.`) +
      h.p(`Myrtle Heights, Oak Park, Forest Dunes and Northwood are here too. On some streets, the houses face the beach across wide lawns.`) +
      G.homes("pine-lakes", "Pine Lakes", photo(OCEAN_HOUSES), "Homes for sale near Pine Lakes now") +
      h.p(`Nightly rentals are not allowed here, and about 7 in 10 houses are their owners' main homes. Houses resold for about ${r10k(ORs.median)} in the middle, with a wide range from street to street.`) +

      `<h3 id="near-300k" data-toc="Houses near $300,000" style="font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:2rem 0 .6rem;line-height:1.3">Where are the houses near $300,000?</h3>` +
      h.p(`In a few smaller neighborhoods. Houses in the city resold for about ${HOUSE_MED} in the middle in the past year, and only about 1 in 6 sold for $350,000 or less. Of the ${LOW.n} homes for sale in the city at $300,000 or less, only ${LOW.by_type.house} are houses. The rest are condos and townhouses.`) +
      NEAR_300K +
      h.p(`Bent Oak Estates, off Pridgen Road, had the most house sales at $350,000 or less. It has about ${near(BO.district_houses, 10)} houses, about a mile from the beach and from the airport. About 7 in 10 are their owners' main homes.`) +
      h.p(`Meridian and Summit at Meridian, west of the airport, are one planned development of ${ME.district_houses} houses. Of the city's zoning districts with 50 or more houses, it has the highest share in FEMA's high-risk flood zone. Nightly rentals are not allowed in any of the three.`) +

      partH3(P4, "") +
      h.p(`You can live in a condo too. Nearly every oceanfront condo building is where the city allows nightly rentals, so most of your neighbors there will be guests. Only about 1 in 18 condos there is someone's main home.`) +
      h.p(`Off the oceanfront, where nightly rentals are not allowed, about 1 in 3 condos is its owner's main home. Those condos resold for about ${r5k(SL.by_zone_class.r_no.condo.median)} in the middle, more than oceanfront condos, but there were only a few dozen sales. The ${h.a("#oceanfront-buildings", "oceanfront buildings")} are next.`) +
      h.cta("Tour the part of the city you like", "Tell us which part of Myrtle Beach fits you. We set up showings of the homes for sale there.", "Book a showing in Myrtle Beach", "/contact/", bg) },

    { h2: "Can you rent a home by the night in Myrtle Beach?", toc: "Nightly rentals", id: "nightly-rentals", html: () =>
      h.p(`Most condos, yes. Almost every house, no. Inside the City of Myrtle Beach, nightly rentals are legal only in the zones where the city allows them, and any stay shorter than 90 days counts.`) +
      h.p(`Those zones include most of the oceanfront hotel and condo strip, the Broadway at the Beach area, stretches of the US 17 Bypass and US 501, and The Market Common's town center. They are the orange areas on the ${h.a("#rental-map", "map")}.`) +
      h.p(`The city bans nightly rentals in every zone for homes, except one zone set aside for visitor stays. A house outside the allowed zones cannot be switched over to nightly rentals. Breaking the rule is a misdemeanor, with a fine, jail time or both for each violation.`) +
      SPLIT +
      photo(SPLIT_PH) +
      h.p(`The homes for sale today split the same way. Nearly every oceanfront condo for sale is in an allowed zone. Only about 1 in 5 houses and townhouses for sale in the city is.`) +
      h.p(`Fewer than 30 houses in the zones for homes may still be rented by the night, because they were rented that way before the current zoning. No new ones can be added.`) +
      h.h3("If a listing says short-term rentals are allowed, can you rent it nightly?") +
      h.p(`Not always. ${HI.listing_says_str_allowed} houses and townhouses for sale in the city say so in the listing. We checked each of them against our map, and ${HI.listing_says_str_allowed_not_str_zone} are not in an allowed zone. Many HOAs also ban rentals of any length. We check the zone and the HOA's rules for any home you like, and we leave out the homes where your plan is not allowed.`) +
      h.h3("What does a nightly rental need?") +
      h.p(`A ${h.ext(CITY_BL, "city business license")}. Every rental in the city needs one, short or long, and its fee is based on the rent you collect.`) +
      h.p(`Guests pay about 13 percent in lodging taxes on top of each stay under 90 days. When a guest books through Airbnb, ${h.ext(AIRBNB_TAX, "Airbnb collects these taxes")} for the state, the county and the city. On a booking you take yourself, you collect and pay them.`) },

    { h2: "Which oceanfront condo buildings in Myrtle Beach sell the most?", toc: "Oceanfront buildings", id: "oceanfront-buildings", html: () =>
      h.p(`About ${near(OCS.n, 10)} condos in oceanfront buildings inside the city resold in the past year. Nine buildings had the most sales, and their homes range from hotel-style studios to three-bedroom condos. For a one-bedroom on the oceanfront, plan on about ${r1k(WX.asking_price_median_1br_oceanfront_inside_city)}, the middle asking price today.`) +
      BUILDING_TABLE +
      h.p(`The lowest prices are for studios of about ${near(UNITS["TIDES/DRIFTWD/OASIS HPR"].median_sqft, 50)} square feet at Tides, Driftwood and Oasis. Many of these buildings have a rental program for their owners.`) +
      photo(TOWERS) +
      h.p(`Most buyers here live out of state. About 3 in 4 buyers of these oceanfront condos have their tax bill mailed outside South Carolina.`) +
      h.h3("Can you get a loan on an oceanfront condo?") +
      h.p(`Yes, but in many of these buildings not the most common kind. ${h.ext(FNMA, "Fannie Mae")} will not back a loan in a building managed like a hotel: with a front desk, daily cleaning, or a rule that owners put their unit in the rental program.`) +
      h.p(`Our preferred lender can tell you which loans work in the building you like. At closing, buyers usually also pay an HOA transfer fee and a few months of HOA dues in advance.`) +
      G.offer("Myrtle Beach", { label: "Get the oceanfront condos for sale in Myrtle Beach" }) },

    { h2: "Does an oceanfront condo in Myrtle Beach pay for itself?", toc: "What a condo earns", id: "what-a-condo-earns", html: () =>
      h.p(`At typical figures, it covers its running costs and property tax, with about ${r100(WX.left_for_hoa_insurance_and_any_loan)} a year left. That money must pay the HOA fee, a policy on the unit itself and any loan.`) +
      h.p(`For the example below, we used the middle asking price for a one-bedroom on the oceanfront, about ${r1k(WX.asking_price_median_1br_oceanfront_inside_city)}. We used the income of a typical one-bedroom nightly rental in the Myrtle Beach market, not this unit's own.`) +
      WORKED +
      h.p(`Whether the unit pays for itself depends on the building's HOA fee, which is different in every building. We get the real fee for any building you send us and run these figures with it.`) +
      h.h3("Most of the year's rental income comes in summer") +
      h.p(`The average listing takes in about ${JULY_X_JAN} times as much in July as in January. June, July and August bring in almost half of a year's revenue.`) +
      SEASON_CHART },

    { h2: "Are Myrtle Beach home prices dropping?", toc: "Prices", id: "prices", html: () =>
      h.p(`For condos, yes. The typical condo value in Myrtle Beach is about ${CONDO_OFF_PEAK} percent below its high in 2024, and it is still falling. For houses, no: the typical house value has stayed about the same since 2022.`) +
      PRICE_CHART +
      h.p(`Condos also sell far more slowly than houses. At the past year's pace, it would take about a year and a half to sell every condo for sale now.`) +
      SUPPLY +
      h.p(`That gives a condo buyer room to negotiate. On the house side, there are fewer homes for sale than buyers in a year.`) +
      h.p(`In the past year, condos in the city resold for about ${money(RC.median)} in the middle: half sold for more, half for less. Houses resold for about ${HOUSE_MED}.`) },

    { h2: "Is a Myrtle Beach address in the City of Myrtle Beach?", toc: "City or county", id: "city-or-county", html: () =>
      h.p(`Usually not. About 3 in 4 houses and buildings with a Myrtle Beach mailing address are outside the city limits. Outside the city, the county's rental rules apply, not the city's.`) +
      h.p(`Carolina Forest and Forestbrook are almost all outside the city, and Socastee is entirely outside it. Our ${h.a("/submarkets/carolina-forest/", "Carolina Forest guide")} covers that area.`) +
      h.p(`North Myrtle Beach is a separate city. A short-term rental there needs a business license, and for now there is no special zoning or permit process beyond it. Our ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach guide")} covers it.`) },

    { h2: "What do property tax and flood insurance cost in Myrtle Beach?", toc: "Tax and flood insurance", id: "yearly-cost", html: () =>
      h.p(`Inside the city, a second home or rental pays almost four times the property tax of a home you live in. You apply for the lower rate on the home you live in, and our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how.`) +
      OWN +
      h.h3("Will you need flood insurance?") +
      h.p(`For most houses, no. Only about 1 in 23 houses in the city is in the high-risk flood zone of FEMA, the Federal Emergency Management Agency. About 1 in 4 condos is, many of them at the ocean's edge.`) +
      h.p(`In the high-risk zone, your lender will require flood insurance. On a house there, it usually costs about ${FLOOD_HIGH} a year. Outside that zone, federal rules do not require it, and a policy usually costs about ${FLOOD_X}.`) +
      h.p(`A condo's HOA insures the building itself and adds the cost to the HOA fee.`) },

    { h2: "What are the pros and cons of Myrtle Beach?", toc: "Pros and cons", id: "pros-and-cons", html: (bg) =>
      h.p(`The good points are the house neighborhoods, the beach and the price of a condo. The hard ones are the condo market, the season and the flood zone at the ocean.`) +
      prosCons([
        "The house neighborhoods are mostly owners' main homes.",
        "The beach, the Boardwalk, golf, a large hospital and the airport are all inside the city.",
        "Condos cost far less than houses, a way to own at the beach for less.",
        "More people live in the city every year.",
      ], [
        { text: "Condo prices are falling, and condos take far longer to sell than houses.", act: "We help you pick the building and negotiate the price." },
        { text: "Rental income comes mostly in summer.", act: "We plan the year with you before you buy." },
        { text: "Many oceanfront condos are in the high-risk flood zone.", act: "We check the flood zone and the building's insurance for you." },
        { text: "Most houses cannot be rented by the night.", act: "We check the zone of any address you send us." },
      ], { bg }) },
  ],
  faqTitle: "Myrtle Beach real estate FAQ",
  faq: [
    { q: "Can you do short-term rentals in Myrtle Beach?", a: `Inside the city, only in the zones where the city allows them, which hold most condos and almost no houses. The city bans rentals under 90 days in every zone for homes, except one zone set aside for visitor stays.` },
    { q: "Is Myrtle Beach a buyer's market?", a: `For condos, yes: there are about ${Math.round(MS.condo_months)} months of condos for sale, and prices are falling. For houses, no: there are about ${Math.round(MS.house_months)} months of houses for sale.` },
    { q: "Is Carolina Forest in Myrtle Beach?", a: `No. Carolina Forest has a Myrtle Beach address, but only about 1 in 75 houses and buildings in its ZIP code, 29579, is inside the city.` },
    { q: "What is the property tax on a second home in Myrtle Beach?", a: "About $1,528 a year for every $100,000 of the county's value inside the city. A home you live in pays about $404." },
    { q: "What is the difference between Myrtle Beach and North Myrtle Beach?", a: "Myrtle Beach and North Myrtle Beach are two separate cities with different rental rules. Myrtle Beach allows nightly rentals only in some zones. North Myrtle Beach, for now, asks only for a business license, with no special zoning or permit process beyond it." },
  ],
  sources: [
    { name: "city rentals", href: CITY_STR },
    { name: "city zoning", href: CITY_PZ },
    { name: "city licenses", href: CITY_BL },
    { name: "air base", href: CITY_MC },
    { name: "Boardwalk", href: CITY_BW },
    { name: "Grand Park", href: CITY_GP },
    { name: "Grande Dunes", href: GD_HOA },
    { name: "Market Common", href: MC_PARKS },
    { name: "Pine Lakes", href: PINE },
    { name: "Dunes Club", href: DUNES },
    { name: "hospital", href: GSMC },
    { name: "airport", href: MYR },
    { name: "Fannie Mae", href: FNMA },
    { name: "Airbnb taxes", href: AIRBNB_TAX },
    { name: "flood policies", href: NFIP_SRC },
    { name: "county GIS", href: GIS },
    { name: "deeds", href: DEEDS },
    { name: "Zillow", href: ZILLOW },
    { name: "AirROI", href: AIRROI },
    { name: "Census", href: CENSUS },
    { name: "BLS", href: QCEW },
    { name: "FEMA maps", href: FEMA },
    { name: "tax levy", href: LEVY },
    { name: "SCDOR", href: ST575 },
    { name: "NMB rentals", href: NMB },
  ],
  sourcesNote: "Counts are ours, from city zoning, county parcels, FEMA and deeds. Listings in aggregate from CCMLS. Not legal or tax advice.",
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: END,
  keywords: "where to live in Myrtle Beach, Myrtle Beach real estate, Myrtle Beach neighborhoods, Myrtle Beach short term rental zoning map, can you Airbnb in Myrtle Beach, Myrtle Beach oceanfront condos for sale, Myrtle Beach home prices dropping, Myrtle Beach buyers market, Myrtle Beach city limits, Myrtle Beach property tax second home, Myrtle Beach flood insurance",
  about: "Real estate in the City of Myrtle Beach, South Carolina",
});
