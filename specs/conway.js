/* /submarkets/conway/ - living in Conway, SC: what a normal week is like, whether a Conway address is
 * in the city, the five parts of town, which parts flood and how the river behaves, what a home costs
 * and what it costs to own each year, and what a rental earns.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-02. The live page was hand-made (an investor report); this
 * is its first spec, and it is now a town guide for a buyer who will live here, with one section for
 * the landlord.
 * Facts: Blog-Brain batches/2026-11-a/submarkets-conway/facts.md (VERIFIED rows, and CORRECTED rows in
 * the verifier's safe wording only; VERIFY.md; struck wording in submarkets-conway-struck.json). Rows
 * 41 and 42 are struck and not used: no nightly-rental numbers and no statement on the city's
 * short-term rental rules (links only). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-a/submarkets-conway/ (findings.json from analyze.py; chart-river-rise.json,
 * chart-major-crests.json; map-city.geojson and map-flood-city.geojson for the city map; raw/drives.json).
 * Every count, share, price and drive time is read from those files here and checked against its
 * ledger row, never typed. Rules, quotes and the HUD rents (row 39, the verifier's FY2027 figures,
 * not in the data folder) are typed from their rows, with the row number beside each.
 * Kept from the live page: the H1 (data/headlines.json, the owner liked it), the homes feed (the
 * website's edge adds "Top homes in Conway", idx-lib/feeds.js), the 4 percent and 6 percent rule with
 * the "about 2.5 times" ratio (row 11), the beach drive (row 27), the links to property taxes, coastal
 * insurance, student rentals, the rental analyzer, short-term rental rules and Airbnb income.
 * Not kept (judge 2026-10-31; PLAN.md): the "illustrative" occupancy chart, "roughly 20,000" and
 * "25,210 (2020 Census)", "lowest entry prices", "part of the Intracoastal Waterway", the Redfin
 * paragraph, the school proficiency table, income and poverty rows, the crime how-to, the HOA
 * documents essay, investor jargon, the duplicate FAQs, flood said eight times.
 * Pictures: a region map (tools/area-map.js), our own city map of the five parts and both flood maps
 * (drawn here from the county's polygons; area-map.js takes no polygon overlay, NEEDS.md 1), our own
 * river chart, glass bar charts (tools/glass.js), and five free-licence photos
 * (data/2026-11-a/submarkets-conway/photos.json; two new files in images/2026-11-a/submarkets-conway/,
 * three reused from the site) until the photo partner's shots arrive (shot-list.md).
 * Version 2, fix round 1 (REVIEW-1.md): the five parts lead with the places in them (the city's parks
 * guide, the hospital, the colleges), one way into the list (the map and its legend), no side-by-side
 * table, a homes strip per part, flood said in its own section and the FAQ only, the 14-row crest list
 * cut to one sentence, what the city tax buys, what a typical house is, and one offer at the end. New
 * facts are rows 46 to 52 in facts.md (row 52: the homes grid), marked VERIFIED-BY-FIXER for the lead to re-check.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance, prosCons } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));

const SELF = "/submarkets/conway/";
const SLUG = "submarkets-conway";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", SLUG);
const IMG_DIR = path.join(__dirname, "..", "chapter3realty", "images", "2026-11-a", SLUG);
const IMG_SRC = `/images/2026-11-a/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), RISE = read("chart-river-rise.json"), CRESTS = read("chart-major-crests.json");
const DRIVES = read("raw/drives.json"), PHOTOS = read("photos.json").photos;
const CITY = read("map-city.geojson"), FLOOD = read("map-flood-city.geojson");
const GRID = read("map-homes-grid.json");                                            // home_grid.py: homes by ~180 m cell and part
if (GRID.homes !== 8935) throw new Error("conway.js: the homes grid no longer counts the 8,935 city homes of row 13");

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
/* Halves round down, so $362,500 reads "about $360,000" and $152,500 "about $150,000", as the ledger rounds them. */
const r5k = (v) => money(Math.round(v / 5000 - 1e-9) * 5000);
const r100 = (v) => money(Math.round(v / 100) * 100);
const near = (v, step) => n(Math.round(v / step) * step);
const must = (ok, msg) => { if (!ok) throw new Error(`conway.js: ${msg}`); };
const title = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const HC = F.homes_in_city, MAIL = F.conway_mailing_homes, SALES = F.sales_in_city, A = F.areas, L = F.listings;
must(HC.homes === 8935 && HC.in_either === 480 && HC.pct_in_either === 5.4, "row 13 changed");
const OUTSIDE_PER_100 = Math.round(100 - HC.pct_in_either);                         // row 13: about 95 in 100
must(OUTSIDE_PER_100 === 95, "row 13: no longer about 95 in 100");
must(MAIL.all_in_box === 30264 && MAIL.inside_city === 8311 && MAIL.outside_city === 21953, "row 3 changed");
must(SALES.resales_not_condo.n === 334 && SALES.resales_not_condo.median === 264250, "row 5 changed");
const HOME = r5k(SALES.resales_not_condo.median);                                   // row 5: about $265,000
const Q1 = r5k(SALES.resales_not_condo.q1), Q3 = r5k(SALES.resales_not_condo.q3);   // $220,000 to $340,000
must(HOME === "$265,000" && Q1 === "$220,000" && Q3 === "$340,000", "row 5 rounding");
const NEW = SALES.builder;                                                           // row 6
must(NEW.n === 122 && Math.round(NEW.median) === 295475, "row 6 changed");
const CONDO = SALES.resales_condo;                                                   // row 8
must(CONDO.n === 14 && SALES.resales.n === 348, "row 8 changed");
const PLACE = F.resale_by_place_not_condo;                                           // row 7
must(PLACE["Horry County (all kept sales)"].median === 324900 && PLACE["Conway city"].median === 264000, "row 7 changed");
const UNDER_COUNTY = near(PLACE["Horry County (all kept sales)"].median - PLACE["Conway city"].median, 10000); // "about $60,000"
must(UNDER_COUNTY === "60,000", "row 7: no longer about $60,000 under the county");

/* Row 1 and 2: people. Growth from the estimates base (verifier: not from the Census count). */
const POP_2025 = 30627, POP_2020 = 24849;                                            // row 1 (raw/sub-est2025_45.csv; P1)
{ const csv = fs.readFileSync(path.join(DATA, "raw", "sub-est2025_45.csv"), "utf8");
  must(csv.includes("Conway city,South Carolina,25057,25210,25715,27521,28358,29780,30627"), "row 1: the Census estimates row changed"); }
const GROWTH = Math.round((POP_2025 - 25057) / 25057 * 100);                         // row 2: 22 percent
must(GROWTH === 22, "row 2 growth");

/* Row 27: drives from the USGS point for Conway, free flow. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const mins = (k) => { const m = DRIVES[k].minutes; return m < 15 ? Math.round(m) : Math.round(m / 5) * 5; };
const BEACH = mins("beach_mb40"), CCU = mins("ccu"), HOSP = mins("conway_medical"), RIVERWALK = mins("riverwalk_park");
/* The airport as the ledger rounds it (row 27: "about 27 minutes"; critic round 1). */
const AIRPORT = Math.round(DRIVES.airport_terminal.minutes);
must(BEACH === 25 && AIRPORT === 27 && CCU === 10 && HOSP === 10 && RIVERWALK === 3, "row 27 drives changed");

/* Rows 10 and 11: the yearly tax (findings tax_calc; the verifier's "about $670 more"). */
const TAX = F.tax_calc;
must(TAX.price === 265000 && TAX.inside_city_4pct === 1732 && TAX.outside_city_4pct_district100 === 1064 && TAX.inside_city_6pct === 4333 && TAX.outside_city_6pct_district100 === 3285, "row 11 changed");
const TAX_GAP = near(TAX.inside_city_4pct - TAX.outside_city_4pct_district100, 10);  // about $670
must(TAX_GAP === "670", "row 11 gap");
const RATIO = Math.round(TAX.inside_city_6pct / TAX.inside_city_4pct * 10) / 10;     // 2.5
must(RATIO === 2.5, "row 11 ratio");

/* Row 24: flood policy cost by ZIP and zone. */
const NP = F.nfip_policies;
must(NP["29526_x"].cost_median === 560 && NP["29527_x"].cost_median === 679 && NP["29526_a"].cost_median === 983, "row 24 changed");
const POL_X1s = "$560", POL_X2s = "$680", POL_As = "$980";                          // row 24 as the ledger rounds them

/* Rows 14, 15, 19, 20, 21, 22: the flood record. */
const SUB = Object.fromEntries(F.subdivisions_flood.map((s) => [s.name, s]));
const FLOOD_SUBS = ["SHERWOOD", "MIDLAND", "PECAN GROVE", "COUNTRY CLUB FOREST", "LAKELAND"].map((k) => SUB[k]);
must(FLOOD_SUBS.map((s) => `${s.in_sfz}/${s.homes}`).join(" ") === "98/126 33/49 29/103 21/57 18/37", "row 14 changed");
const DRY_SUBS = ["ROSEHAVEN", "OAK GLENN", "WOODLAND LAKES", "RIVERTOWN ROW", "KINGSTON BAY", "SNOWHILL"];
must(DRY_SUBS.every((k) => SUB[k] && SUB[k].in_either === 0), "row 15: a dry subdivision now has a home in a flood map");
must(A.us501.homes === 1432 && A.us501.in_either === 0, "row 15 US 501 area changed");
const CL = F.closures_florence;
must(CL.flood_streets === 58, "row 20 changed");
const NF = F.nfip_city_of_conway;
must(NF.by_year["2018"].paid_claims === 109 && NF.median_paid_2018 === 133861, "row 21 changed");
const BUY = F.hmgp_conway_acquisitions.by_disaster;
must(BUY["4286"].buildings === 86 && BUY["1299"].buildings === 14, "row 22 changed");
const RV = F.river;
must(RV.florence.above_minor.days === 29 && RV.florence.above_major.days === 20 && RV.matthew.above_minor.days === 26, "row 17 changed");
const dayDiff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const FLO_CREST_DAY = dayDiff(RISE.landfall.florence, RV.florence.peak_daily_mean[0]);  // 12
const MAT_CREST_DAY = dayDiff(RISE.landfall.matthew, RV.matthew.peak_daily_mean[0]);   // 10
must(FLO_CREST_DAY === 12 && MAT_CREST_DAY === 10, "row 17 crest days");
const EVENTS = CRESTS.rows;
const RECENT = EVENTS.filter((r) => +r[0].slice(0, 4) >= 2015 && +r[0].slice(0, 4) <= 2025);
must(EVENTS.length === 14 && RECENT.length === 6, "row 18 changed");

/* Rows 31 to 34: the five parts of town. */
must(A.downtown.homes === 1158 && A.downtown.in_either === 36 && A.downtown.resales_not_condo.n === 22, "row 31 changed");
must(A.crabtree.homes === 2387 && A.crabtree.in_either === 253 && A.crabtree.resales_not_condo.median === 260000, "row 32 changed");
must(A.west.homes === 3398 && A.west.in_either === 176 && A.west.resales_not_condo.median === 246000, "row 33 changed");
must(A.north.homes === 560 && A.north.in_sfha === 15 && A.north.in_sfz === 0 && A.north.resales_not_condo.median === 399900, "row 34 north changed");
must(A.us501.resales_not_condo.median === 362500, "row 34 US 501 changed");
const lot = (acres) => acres >= 0.7 ? "about three-quarters of an acre" : acres >= 0.37 ? "about four-tenths of an acre" : acres >= 0.31 ? "about a third of an acre" : acres >= 0.24 ? "about a quarter of an acre" : "about a fifth of an acre";
must(lot(A.downtown.median_acres_houses) === "about a third of an acre" && lot(A.west.median_acres_houses) === "about a quarter of an acre"
  && lot(A.north.median_acres_houses) === "about three-quarters of an acre" && lot(A.crabtree.median_acres_houses) === "about a fifth of an acre", "lot sizes");

/* Rows 35, 36: houses for sale with a Conway address, counted in aggregate (CCMLS). */
must(L.api_totals.house === 673 && L.api_totals["house+new_construction"] === 368 && L.houses_inside_city.n === 172 && L.houses_one_acre_plus === 62 && L.houses_under_250k === 58, "rows 35, 36 changed");

/* Row 37: the university (11,348 in fall 2024, said "more than 11,000"; reader round 1: too exact). */
const CCU_STUDENTS = "more than 11,000";

/* Row 51 (VERIFIED-BY-FIXER): what a house near the city's middle price is. The CRM's houses for sale
   inside the city asking $240,000 to $290,000, counted in aggregate (pull of 2026-11-01, row 35's pull). */
const BUYS = { n: 35, three_bed: 27, sqft_med: 1389, sqft_q1: 1266, sqft_q3: 1600, built_2025_2026: 8 };
const BUYS_SQ = near(BUYS.sqft_med, 100), BUYS_LO = near(BUYS.sqft_q1, 100), BUYS_HI = near(BUYS.sqft_q3, 100);
must(BUYS_SQ === "1,400" && BUYS_LO === "1,300" && BUYS_HI === "1,600" && Math.round(BUYS.three_bed / BUYS.n * 4) === 3, "row 51 rounding");

/* Row 39 (CORRECTED by the verifier to HUD's FY2027 Small Area FMRs, FY27_safmrs.xlsx). */
const HUD = { two: 1320, three: 1630, four: 1900, cf_three: 2230 };
const HUD_GAP = near(HUD.cf_three - HUD.three, 100);                                 // about $600
must(HUD_GAP === "600", "row 39 gap");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

/* One colour per part of town: the map's home dots, its numbered markers and the legend under it. */
const PART_COLOR = { downtown: "#c4783a", us501: "#2f6f8f", west: "#5f8a4e", crabtree: "#8a5a9e", north: "#5c6b78" };

const CSS = `<style>
main#main .c3-cw-fig{margin:1.6rem 0 1.8rem;max-width:640px}
main#main .c3-cw-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.65rem}
main#main .c3-cw-frame{border-radius:18px;overflow:hidden;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.08)}
main#main .c3-cw-frame img,main#main .c3-cw-frame svg{display:block;width:100%;height:auto}
main#main .c3-cw-key{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.35rem}
main#main .c3-cw-key li{display:flex;align-items:center;gap:.6rem;color:var(--muted);font-size:1rem;line-height:1.4;margin:0}
main#main .c3-cw-key a{color:var(--navy)}
main#main .c3-cw-num{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:.9rem;font-family:var(--sans)}
${Object.entries(PART_COLOR).map(([k, c]) => `main#main .c3-cw-num.p-${k}{background:${c}}`).join("")}
main#main .c3-cw-sw{flex:none;display:inline-block;width:1.6rem;height:1rem;border-radius:4px}
main#main .c3-cw-h3{display:flex;align-items:baseline;gap:.6rem}
main#main .c3-cw-h3 .c3-cw-num{position:relative;top:-.15rem}
main#main .c3-cw-legend{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;margin:.2rem 0 .6rem;padding:0;list-style:none}
main#main .c3-cw-legend li{display:flex;align-items:center;gap:.5rem;color:var(--muted);font-size:1rem;margin:0}
main#main .c3-cw-line{flex:none;display:inline-block;width:1.6rem;height:4px;border-radius:2px}
main#main svg.c3-cw-chart text.ct{font-family:var(--sans),system-ui,sans-serif;font-size:17px;fill:#4a5763}
main#main svg.c3-cw-chart text.cl{font-family:var(--sans),system-ui,sans-serif;font-size:17px;font-weight:700}
@media (min-width:700px){main#main svg.c3-cw-chart text.ct,main#main svg.c3-cw-chart text.cl{font-size:9.5px}}
main#main h2{text-wrap:balance}
main#main .c3-pc{align-items:stretch}
/* The end band. In the browser something follows the last section of <main>, so glass.js's compact-bar
   rule (:not(:last-child)) draws this band as a light bar under ivory text (critic round 1; NEEDS.md 5).
   Until the shared rule changes, this page puts the dark panel back on its own last band. */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
/* The shared header runs 5 px past a 1024 px window (critic round 1; the same on other glass pages,
   NEEDS.md 8). Until the lead fixes the header, this page narrows the gap between the menu items there. */
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
/* The homes feed's search bar at 320 px (critic round 1; shared feed CSS, NEEDS.md 6). */
@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}
</style>`;

/* Design pass, 2026-11-08 (redo3/submarkets-conway/DESIGN.md): a two-line headline, the drive times as one plain line,
   the contents between rules, each part closed by its homes strip, photos beside the text on a wide screen, one card
   style (charts and offers), plain tables under thin rules, and one block width of 720 px. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const TOC = `${S} nav[aria-label="On this page"]`;
const DESIGN_CSS = "<style>"
  /* 1. The headline: the italic line at about half the H1's size; the drive times one plain line between rules, rows on a phone. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance{border-top:${RULE};border-bottom:${RULE};max-width:720px;box-sizing:border-box}${S} .c3-glance li{${FLAT};line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (min-width:700px){${S} .c3-glance{gap:0 1.6rem!important;padding:.55rem 0!important}${S} .c3-glance li{padding:.2rem 0!important}${S} .c3-glance .i{background:none!important;box-shadow:none!important}}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important;border-bottom:0}${S} .c3-glance li{border-bottom:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.5rem 0!important}`
  + `${S} .c3-glance li>span:last-child{display:flex;gap:.5rem;align-items:baseline}${S} .c3-glance strong{font-size:1rem!important}}`
  /* 2. The contents list: no card, in columns between two rules. */
  + `${TOC}{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${TOC} ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${TOC} ul{grid-template-columns:repeat(3,minmax(0,1fr))}${TOC} li a{padding:.45rem 0!important}}`
  /* 3. Photos without a frame; on a wide screen a photo sits beside the text it belongs to. Each part ends with its
     homes strip; below 1,100 px the part's photo shows only while the strip is empty, as before. */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  + `@media (min-width:1100px){${S} .c3-cw-side{display:grid;grid-template-columns:minmax(0,1fr) 400px;grid-template-rows:var(--cw-rows);column-gap:2.5rem;align-items:start}`
  + `${S} .c3-cw-side>*{grid-column:1}${S} .c3-cw-side>figure.c3ph-hero{grid-column:2;grid-row:1/-1;margin:.4rem 0 1.2rem!important;max-width:none!important}`
  + `${S} .c3-cw-side>h3:first-child~figure.c3ph-hero{margin-top:2.2rem!important}}`
  + `@media (max-width:1099px){${S} .c3-cw-side:has(+.hx-strip:not(:empty))>figure.c3ph-hero{display:none}}`
  + `${S} .c3-cw-side+.hx-strip,${S} .c3-cw-part+.hx-strip{margin-top:1.2rem}`
  + `${S} .hx-strip+.hx-fallback{margin:1rem 0 .4rem}`
  + `@media (min-width:1100px){${S} .c3-cw-side+.hx-strip,${S} .c3-cw-part+.hx-strip{max-width:none!important}}`
  /* 4. One card style (charts and offers). Tables, the yearly cost table and pros and cons are plain, under thin rules;
     the maps keep their own frame and lose the outer card. */
  + `${TBL}{${FLAT};padding:0!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${S} figure.c3-cw-fig:not(.c3-gchart){${FLAT};padding:0!important}${S} figure.c3-cw-fig:not(.c3-gchart)>figcaption{padding:0!important}`
  + `${S} .c3-cc{${FLAT};padding:0!important}${S} .c3-cc caption{padding-left:0!important;text-align:left}`
  + `${S} .c3-cc th,${S} .c3-cc td{border-bottom:${RULE}!important}${S} .c3-cc thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}${S} .c3-cc th:first-child,${S} .c3-cc td:first-child{padding-left:0!important}`
  + `${S} .c3-pc{gap:0 2rem!important}${S} .c3-pc>div{${FLAT};border-top:${RULE}!important;padding:.9rem 0 .4rem!important}`
  /* 5. One block width. */
  + `${S} .c3-gchart,${TBL},${S} .c3-cc,${S} .c3-pc{max-width:720px!important;box-sizing:border-box}`
  + `${S} figure.c3-cw-fig:not(.c3-gchart){max-width:640px!important}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Map 1: where Conway is (row 27).                                               */

const WHERE_MAP = (() => {
  const m = regionMap({ home: { name: "Downtown Conway", label: "Downtown Conway", lat: F.town_point.lat, lon: F.town_point.lon, town: "Conway" },
    landmarks: [
      { name: "the beach in Myrtle Beach", short: "Beach", kind: "beach", lat: 33.690692, lon: -78.880438, minutes: BEACH },
      { name: "Myrtle Beach International Airport", short: "Airport", kind: "airport", lat: 33.681467, lon: -78.922789, minutes: AIRPORT },
      { name: "Coastal Carolina University", short: "University", kind: "town", lat: 33.795323, lon: -79.012682, minutes: CCU },
      { name: "Conway Medical Center", short: "Conway Medical Center", kind: "hospital", lat: 33.785483, lon: -79.001894, minutes: HOSP },
    ],
    alt: `Map of Conway and the coast: from downtown Conway, the beach in Myrtle Beach is about ${BEACH} minutes by car, the airport about ${AIRPORT} minutes, and Coastal Carolina University and Conway Medical Center about ${CCU} minutes each.` },
  { glass: true, dir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), src: "/images/maps" });
  must(m.html.includes(`${BEACH} min`), "the region map lost the beach drive");
  return `<figure class="c3-cw-fig" style="max-width:560px"><div class="c3-cw-frame">${m.html}</div><figcaption>Drive times by car from downtown Conway, without traffic. ${m.credit}</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* The five parts of town (rows 31 to 34).                                        */

const PARTS = [
  { key: "downtown", name: "Downtown", place: "Downtown Conway", id: "downtown" },
  { key: "us501", name: "Near the university, off US 501", place: "Conway near the university", id: "us-501" },
  { key: "west", name: "West and south", place: "West Conway", id: "west-and-south" },
  { key: "crabtree", name: "Around Crabtree Swamp", place: "Conway near Crabtree Swamp", id: "crabtree-swamp" },
  { key: "north", name: "The north edge", place: "North Conway", id: "north-edge" },
].map((p, i) => Object.assign(p, { num: i + 1, pt: F.area_label_points[p.key], a: A[p.key] }));
const homesAbout = (p) => near(p.a.homes, p.a.homes > 3000 ? 100 : 10);
const floodWords = (p) => { const r = p.a.in_either / p.a.homes; if (!p.a.in_either) return "none"; if (r > .09 && r < .12) return "about 1 in 10"; return `about ${Math.round(r * 100)} in 100`; };
must(PARTS.map(floodWords).join("|") === "about 3 in 100|none|about 5 in 100|about 1 in 10|about 3 in 100", "flood shares by part changed");
/* Where each subdivision in the Florence table sits (row 50: county parcels by plat name; Midland and
   Lakeland straddle the downtown line, so they are named by direction). */
const SUB_PART = { SHERWOOD: "Around Crabtree Swamp", MIDLAND: "Just north of downtown", "PECAN GROVE": "West and south", "COUNTRY CLUB FOREST": "Around Crabtree Swamp", LAKELAND: "Just north of downtown" };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
must(floodWords(PARTS[0]) === floodWords(PARTS[4]), "downtown and the north edge no longer share a flood share");
const numDot = (p) => `<span class="c3-cw-num p-${p.key}" aria-hidden="true">${p.num}</span>`;

/* ---------------------------------------------------------------------------- */
/* Maps 2 and 3: the city, drawn here from the county's polygons (area-map.js     */
/* takes no polygon overlay, NEEDS.md 1). Both show where the homes are, as dots   */
/* on a grid of about 180 m (map-homes-grid.json, home_grid.py), so the picture    */
/* says what the text says (owner round 1). Map 2 colours the dots by part of town */
/* and numbers the parts; map 3 greys them and lays both flood maps under them.    */

const cityMap = (mode) => {
  const flood = mode === "flood";
  const cityPolys = CITY.features[0].geometry.coordinates;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const poly of cityPolys) for (const r of poly) for (const [lo, la] of r) { x0 = Math.min(x0, lo); x1 = Math.max(x1, lo); y0 = Math.min(y0, la); y1 = Math.max(y1, la); }
  const padX = (x1 - x0) * 0.04, padY = (y1 - y0) * 0.04;
  x0 -= padX; x1 += padX; y0 -= padY; y1 += padY;
  const lat0 = (y0 + y1) / 2, kx = Math.cos(lat0 * Math.PI / 180);
  const W = 760, S = W / ((x1 - x0) * kx), H = Math.round((y1 - y0) * S);
  const P = (lo, la) => [(lo - x0) * kx * S, (y1 - la) * S];
  const inBox = (lo, la, m = 0.15) => lo > x0 - (x1 - x0) * m && lo < x1 + (x1 - x0) * m && la > y0 - (y1 - y0) * m && la < y1 + (y1 - y0) * m;
  const f1 = (v) => Math.round(v * 10) / 10;
  const d = (pts, close, tol = 1.4) => {
    const out = []; let last = null;
    for (const [lo, la] of pts) { const p = P(lo, la); if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= tol) { out.push(p); last = p; } }
    if (out.length < (close ? 3 : 2)) return "";
    return "M" + out.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L") + (close ? "Z" : "");
  };
  const area = (r) => { let s = 0; const q = r.map(([lo, la]) => P(lo, la)); for (let i = 0, j = q.length - 1; i < q.length; j = i++) s += (q[j][0] + q[i][0]) * (q[j][1] - q[i][1]); return Math.abs(s / 2); };
  const polysD = (multi, minA = 6) => multi.map((poly) => (area(poly[0]) < minA ? "" : poly.filter((r, i) => i === 0 || area(r) >= minA).map((r) => d(r, true)).join(""))).join("");
  const GEO = JSON.parse(fs.readFileSync(path.join(BB, "tools", "geo", "grand-strand-v2.json"), "utf8")).region;
  const dec = (flat, sc = 1e4) => { const o = []; let x = 0, y = 0; for (let i = 0; i < flat.length; i += 2) { x += flat[i]; y += flat[i + 1]; o.push([x / sc - 80, y / sc + 33]); } return o; };
  const runs = (pts) => { const out = []; let cur = []; for (const p of pts) { if (inBox(p[0], p[1])) cur.push(p); else { if (cur.length) { cur.push(p); out.push(cur); } cur = []; } } if (cur.length) out.push(cur); return out; };
  const water = GEO.water.filter((w) => w.a > 100).map((w) => w.r.map((r) => dec(r))).filter((rings) => rings[0].some(([lo, la]) => inBox(lo, la, 0.3))).map((rings) => rings.map((r) => d(r.filter(([lo, la]) => inBox(lo, la, 0.3)), true, 1)).join("")).join("");
  const roads = GEO.roads.filter((r) => r.t <= 2 && /^(US 501|US 501 BUS|US 701|SC 905|SC 319|US 378)$/.test(r.r || "")).flatMap((r) => runs(dec(r.p))).map((r) => d(r, false, 1.5)).join("");
  const cityD = polysD(cityPolys, 2);
  const sfha = FLOOD.features.find((f) => /SFHA/.test(f.properties.name)).geometry.coordinates;
  const sfz = FLOOD.features.find((f) => /Florence/.test(f.properties.name)).geometry.coordinates;
  const SFHA = "#8fb3c7", SFZ = "#2f6f8f";
  /* Home dots: one per grid cell, its area growing with the homes in it. */
  const dots = (one) => Object.keys(PART_COLOR).map((part) => `<g fill="${one || PART_COLOR[part]}">` + GRID.cells.filter((c) => c[3] === part).map(([lo, la, k]) => { const [x, y] = P(lo, la); return `<circle cx="${Math.round(x)}" cy="${Math.round(y)}" r="${f1(Math.min(5.6, 1.5 + Math.sqrt(k) * 0.75))}"/>`; }).join("") + `</g>`).join("");
  const label = (lo, la, text, o = {}) => { const [x, y] = P(lo, la); return `<text class="lb${o.small ? " sm" : ""}" x="${f1(x + (o.dx || 0))}" y="${f1(y + (o.dy || 0))}" text-anchor="${o.anchor || "start"}" fill="${o.fill || "#3f6275"}"${o.italic ? ' font-style="italic"' : ""}>${text}</text>`; };
  const ccu = P(-79.012682, 33.795323), cmc = P(-79.002612, 33.786530);
  const sym = `<g transform="translate(${f1(ccu[0])} ${f1(ccu[1])})"><rect x="-11" y="-11" width="22" height="22" rx="4" fill="#1c2028" stroke="#fff" stroke-width="3"/></g>`
    + `<g transform="translate(${f1(cmc[0])} ${f1(cmc[1])})"><path d="M-4 -12h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="#b3261e" stroke="#fff" stroke-width="2.5" paint-order="stroke"/></g>`;
  const marks = flood ? "" : PARTS.map((p) => { const [x, y] = P(p.pt.lon, p.pt.lat); return `<g transform="translate(${f1(x)} ${f1(y)})"><circle r="28" fill="${PART_COLOR[p.key]}" stroke="#fff" stroke-width="4"/><text class="nm" y="11.5" text-anchor="middle">${p.num}</text></g>`; }).join("");
  const labels = label(-79.0365, 33.8365, "Waccamaw River", { dx: 14, dy: 6, italic: true })
    + (flood
      ? label(-79.0830, 33.8495, "Crabtree Swamp", { anchor: "middle", dy: 30, italic: true })
        + label(-79.0310, 33.8530, "Kingston Lake", { dx: 6, italic: true })
        + label(-79.0455, 33.8586, "Sherwood", { anchor: "end", dx: -14, dy: -8, fill: "#1c2028" })
        + label(-79.047814, 33.836003, "Downtown", { anchor: "end", dx: -12, dy: 6, fill: "#1c2028" })
      : "")
    + label(-79.012682, 33.795323, "University", { anchor: "end", dx: -20, dy: 9, fill: "#1c2028" })
    + label(-79.002612, 33.786530, "Hospital", { anchor: "end", dx: -20, dy: 14, fill: "#b3261e" });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${flood ? "Map of the flood maps and the homes in Conway" : "Map of the five parts of Conway"}">`
    + `<style>.lb{font-family:'DM Sans',system-ui,sans-serif;font-size:30px;font-weight:700;paint-order:stroke;stroke:#fff;stroke-width:7px;stroke-linejoin:round}.nm{font-family:'DM Sans',system-ui,sans-serif;font-size:32px;font-weight:700;fill:#fff}@media (min-width:560px){.lb{font-size:19px}}</style>`
    + `<rect width="${W}" height="${H}" fill="#f4efe8"/>`
    + `<defs><clipPath id="cw-city-${mode}"><path d="${cityD}"/></clipPath></defs>`
    + `<path d="${cityD}" fill="#fffdf9" stroke="none"/>`
    + (flood ? `<g clip-path="url(#cw-city-${mode})"><path d="${polysD(sfha)}" fill="${SFHA}" fill-opacity=".7" fill-rule="evenodd"/><path d="${polysD(sfz)}" fill="${SFZ}" fill-opacity=".55" fill-rule="evenodd"/></g>` : "")
    + `<path d="${water}" fill="#d6eaf2" stroke="#5f93ab" stroke-width="1.6" fill-rule="evenodd"/>`
    + `<path d="${roads}" fill="none" stroke="#cdbfac" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<g fill-opacity="${flood ? ".8" : ".85"}">${dots(flood ? "#1c2028" : "")}</g>`
    + `<path d="${cityD}" fill="none" stroke="#1c2028" stroke-width="2.5" stroke-linejoin="round"/>`
    + sym + labels + marks + `</svg>`;
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const file = flood ? "conway-city-flood-map.svg" : "conway-parts-map.svg";
  fs.writeFileSync(path.join(IMG_DIR, file), svg);
  must(svg.length < 175000, `the ${mode} map is ${svg.length} bytes`);
  return { W, H, file };
};

const PARTS_MAP = (() => {
  const { W, H, file } = cityMap("parts");
  const alt = `Map of the city of Conway with its homes shown as dots, coloured by part of town and numbered: 1 downtown, by the Waccamaw River; 2 near the university, off US 501 to the southeast; 3 west and south of downtown, the largest; 4 around Crabtree Swamp, north and northwest of downtown; 5 the north edge. Coastal Carolina University and Conway Medical Center are in part 2.`;
  const list = `<ol class="c3-cw-key" aria-label="The five parts of Conway">` + PARTS.map((p) => `<li>${numDot(p)}<a href="#${p.id}">${p.name}</a></li>`).join("") + `</ol>`;
  return `<figure class="c3-cw-fig"><div class="c3-cw-frame"><img src="${IMG_SRC}/${file}" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async"></div>`
    + `<figcaption>Map of the city's homes, each dot a group of homes, coloured by part of town. The dark square is Coastal Carolina University and the red cross is Conway Medical Center. Map data: Horry County GIS; U.S. Census Bureau TIGER/Line.</figcaption>${list}</figure>`;
})();

const FLOOD_MAP = (() => {
  const { W, H, file } = cityMap("flood");
  const alt = `Map of the city of Conway: dark dots are its homes; light blue is FEMA's high-risk flood zone and darker blue is where Florence's water reached in 2018. The blue lies along the Waccamaw River, Crabtree Swamp north of downtown around Sherwood, and Kingston Lake. Most dots, including all of those near the university, are outside it.`;
  const key = `<ul class="c3-cw-legend" aria-label="Map colors">`
    + `<li><span class="c3-cw-sw" style="background:#1c2028;border-radius:50%;width:.8rem;height:.8rem"></span>Homes</li>`
    + `<li><span class="c3-cw-sw" style="background:#8fb3c7"></span>FEMA's high-risk flood zone</li>`
    + `<li><span class="c3-cw-sw" style="background:#2f6f8f;opacity:.75"></span>Where Florence's water reached</li></ul>`;
  return `<figure class="c3-cw-fig"><div class="c3-cw-frame"><img src="${IMG_SRC}/${file}" width="${W}" height="${H}" alt="${alt}" loading="lazy" decoding="async"></div>`
    + `<figcaption>${key}Map of the two flood maps under the city's homes. Map data: Horry County GIS; U.S. Census Bureau TIGER/Line.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Chart: the slow river (rows 16, 17). Days from the storm's landfall.            */

const RIVER_CHART = (() => {
  const W = 360, H = 252, L0 = 34, R0 = 352, T0 = 8, B0 = 212, XMIN = -7, XMAX = 46, YMIN = 6, YMAX = 24;
  const X = (d) => L0 + (d - XMIN) / (XMAX - XMIN) * (R0 - L0), Y = (v) => B0 - (v - YMIN) / (YMAX - YMIN) * (B0 - T0);
  const f1 = (v) => Math.round(v * 10) / 10;
  const series = (rows, land) => rows.map(([d, v]) => [dayDiff(land, d), v]).filter(([x]) => x >= XMIN && x <= XMAX);
  const FL = series(RISE.florence, RISE.landfall.florence), MT = series(RISE.matthew, RISE.landfall.matthew);
  const line = (pts) => "M" + pts.map(([x, v]) => `${f1(X(x))} ${f1(Y(v))}`).join("L");
  const BR = "#c4783a", SL = "#5c6b78";
  const grid = [8, 11, 14, 17, 20, 23].map((v) => `<text class="ct" x="${L0 - 6}" y="${f1(Y(v) + 4.5)}" text-anchor="end">${v}</text>`).join("");
  const xt = [0, 10, 20, 30, 40].map((d) => `<line x1="${f1(X(d))}" y1="${B0}" x2="${f1(X(d))}" y2="${B0 + 5}" stroke="#9aa5ae"/><text class="ct" x="${f1(X(d))}" y="${B0 + 22}" text-anchor="middle">${d}</text>`).join("");
  const stage = (v, dash) => `<line x1="${L0}" y1="${f1(Y(v))}" x2="${R0}" y2="${f1(Y(v))}" stroke="#1c2028" stroke-opacity=".6" stroke-width="1.3" stroke-dasharray="${dash}"/>`;
  const pk = FL.reduce((a, b) => (b[1] > a[1] ? b : a));
  const svg = `<svg class="c3-cw-chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Line chart of the Waccamaw River's height on the gauge at Conway, by days after the storm came ashore. After Florence the river rose past flood stage (11 feet) on day 2, was highest, about 21 feet, on day ${FLO_CREST_DAY}, and stayed above flood stage for ${RV.florence.above_minor.days} days. After Matthew it was highest, about 18 feet, on day ${MAT_CREST_DAY} and stayed above flood stage for ${RV.matthew.above_minor.days} days.">`
    + `<rect x="${L0}" y="${T0}" width="${R0 - L0}" height="${B0 - T0}" fill="rgba(255,255,255,.55)" rx="6"/>`
    + `<rect x="${L0}" y="${f1(Y(YMAX))}" width="${R0 - L0}" height="${f1(Y(14) - Y(YMAX))}" fill="#2f6f8f" fill-opacity=".07"/>`
    + stage(11, "6 4") + stage(14, "2 3")
    + `<line x1="${f1(X(0))}" y1="${T0}" x2="${f1(X(0))}" y2="${B0}" stroke="#1c2028" stroke-opacity=".35" stroke-width="1"/>`
    + `<path d="${line(MT)}" fill="none" stroke="${SL}" stroke-width="2.2" stroke-linejoin="round"/>`
    + `<path d="${line(FL)}" fill="none" stroke="${BR}" stroke-width="3" stroke-linejoin="round"/>`
    + `<circle cx="${f1(X(pk[0]))}" cy="${f1(Y(pk[1]))}" r="4" fill="${BR}" stroke="#fff" stroke-width="1.5"/>`
    + `<text class="cl" x="${f1(X(pk[0]))}" y="${f1(Y(pk[1]) - 10)}" text-anchor="middle" fill="#91592b">Highest, day ${FLO_CREST_DAY}</text>`
    + grid + xt
    + `<text class="ct" x="${f1((L0 + R0) / 2)}" y="${H - 2}" text-anchor="middle">Days after the storm came ashore</text>`
    + `</svg>`;
  const dash = (d) => `<svg width="26" height="6" aria-hidden="true" style="flex:none"><line x1="0" y1="3" x2="26" y2="3" stroke="#1c2028" stroke-opacity=".7" stroke-width="2" stroke-dasharray="${d}"/></svg>`;
  const legend = `<ul class="c3-cw-legend"><li><span class="c3-cw-line" style="background:${BR}"></span>Florence, 2018</li><li><span class="c3-cw-line" style="background:${SL}"></span>Matthew, 2016</li><li>${dash("2 3")}Major flooding, 14 ft</li><li>${dash("6 4")}Flood stage, 11 ft</li></ul>`;
  return `<figure class="c3-gchart c3-cw-fig" style="max-width:640px"><span class="cap" style="display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem">After Florence, the river at Conway was highest on day ${FLO_CREST_DAY} and above flood stage for ${RV.florence.above_minor.days} days</span>${legend}${svg}<figcaption>Daily average height in feet on the river gauge at the Conway Marina. After Florence, the river stayed above flood stage for ${RV.florence.above_minor.days} days, ${RV.florence.above_major.days} of them in major flood.</figcaption></figure>`;
})();

/* Chart: homes with a Conway mailing address, inside and outside the city (row 3). */
const ADDRESS_CHART = G.bars([
  { name: "Inside the city limits", value: MAIL.inside_city, valueText: near(MAIL.inside_city, 100) },
  { name: "Outside, in the county", value: MAIL.outside_city, valueText: near(MAIL.outside_city, 1000), reference: true },
], { caption: "Most homes with a Conway mailing address are outside the city", nameLabel: "Where the home is", valueLabel: "Homes", compact: true, note: "Homes, rounded." });

/* Chart: what a home resold for, Conway against the county and other towns (row 7). */
const TOWNS = [
  ["Loris city", "Loris"], ["Aynor town", "Aynor"], ["Conway city", "Conway"], ["Socastee CDP", "Socastee"], ["Myrtle Beach city", "Myrtle Beach"],
  ["Horry County (all kept sales)", "All of Horry County"], ["Carolina Forest CDP", "Carolina Forest"], ["North Myrtle Beach city", "North Myrtle Beach"],
].map(([k, name]) => ({ name, med: PLACE[k].median, n: PLACE[k].n }));
const PRICE_CHART = G.bars(TOWNS.map((t) => ({ name: t.name, value: t.med, valueText: r5k(t.med), feature: `${n(t.n)} resales`, reference: t.name !== "Conway" })),
  { caption: "What a home usually resold for in the past year", nameLabel: "Town", featureLabel: "homes resold", valueLabel: "Middle price", compact: true,
    note: "Houses and townhouses resold by their owners, not by a builder, and not condo units. Middle price: half sold for more, half for less. Aynor had only 17 resales." });

/* ---------------------------------------------------------------------------- */
/* Photos (photos.json; each looked at full size, subject_check in its record).    */

const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}`)); must(r, `no photo record for ${name}`); return r; };
const HALL = rec("conway-city-hall-1200w"), KIMBEL = rec("coastal-carolina-kimbel-library-1200w"), RIVER = rec("conway-riverwalk-boardwalk"),
  OAK = rec("conway-older-house-and-oak"), FLOODPH = rec("conway-florence-floodwater-street");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const photo = (r, alt, caption = r.caption) => lazy(PH.heroPhoto(r, { alt, caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" }));
/* The older house: its record's subject_check supports "in the downtown historic district" only (critic round 1). */
const OAK_CAPTION = "An older house under a live oak, in the downtown historic district.";
must(/historic district/i.test(OAK.subject_check || JSON.stringify(OAK)), "the older house's record no longer places it in the historic district");
const RIVER_PHOTO = photo(RIVER, "A wooden boardwalk with a black railing under tall sycamores, beside old wooden buildings on the river in Conway");
const HALL_PHOTO = photo(HALL, "Conway City Hall, a brick building with a white portico of four columns and stairs up both sides, beside a white clock tower and palmetto trees");
const OAK_PHOTO = photo(OAK, "An older white wood house with black shutters behind a large live oak, with a paved driveway, in downtown Conway", OAK_CAPTION);
const KIMBEL_PHOTO = photo(KIMBEL, "A red brick library building with white doors behind a wide live oak with long low limbs, at Coastal Carolina University in Conway");
const FLOOD_PHOTO = photo(FLOODPH, "Floodwater covering a street and the yards of single-story houses, with road signs standing in the water, in the Conway area after Hurricane Florence");
const SHOWN = [RIVER, HALL, OAK, KIMBEL, FLOODPH];
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: (p === OAK ? OAK_CAPTION : p.caption).replace(/\.$/, "") })));

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const CENSUS = "https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/cities/totals/";
const GAUGE = "https://water.noaa.gov/gauges/CNWS1";
const USGS = "https://waterdata.usgs.gov/monitoring-location/02110704/";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-claims-v2";
const HUDFMR = "https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const HISTORY = "https://www.conwaysc.gov/residents_visitors/about_conway/";
const NRHP = "https://npgallery.nps.gov/AssetDetail/NRIS/71000785";
const NCES = "https://nces.ed.gov/collegenavigator/?id=218724";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const USC4013 = "https://www.law.cornell.edu/uscode/text/42/4013";
const USC4012A = "https://www.law.cornell.edu/uscode/text/42/4012a";
const CFR80 = "https://www.ecfr.gov/current/title-44/chapter-I/subchapter-D/part-80/section-80.19";
const PARKS = "https://www.conwaysc.gov/departments/parks___recreation/parks.php";           // rows 46 to 48: the City of Conway Parks Guide (PDF linked there)
const TRASH = "https://www.conwaysc.gov/departments/sanitation.php";                          // row 49
const SWA = "https://www.solidwasteauthority.org/recyclingcenters.html";                     // row 49
const CMC = "https://www.conwaymedicalcenter.com/";                                           // row 48
const HGTC = "https://www.hgtc.edu/";                                                         // row 48

/* ---------------------------------------------------------------------------- */
/* The offers. What we do is said once, in the end band (owner round 1).          */

const TOP = { title: "See homes for sale in Conway", label: "Send me Conway homes", href: "/contact/" };
const END = {
  h2: "See the Conway houses you like, in person",
  p: "Pick the Conway houses you like. An agent shows them to you and answers what the page did not.",
  label: "Have us set up a Conway showing", href: `/contact/?place=${encodeURIComponent("Conway")}`,
};

const partH3 = (p, tail) => `<h3 id="${p.id}" data-toc="${p.name}" class="c3-cw-h3" style="font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:2rem 0 .6rem;line-height:1.3">${numDot(p)}<span>${p.name}: ${tail}</span></h3>`;
/* A homes strip per part (owner 2026-10-21). The slugs are new: NEEDS.md 7 asks the lead to add them to
   idx-places.json; until then the slot stays empty, takes no space, and the part's photo shows instead. */
const ask = (p) => G.offer(p.place, { label: `Get the homes for sale in ${p.place}` });
/* Design pass, 2026-11-08: the strip closes each part and is its main picture; the old pill is the strip's fallback,
   shown only while the strip is empty (owner, 2026-11-08: "horizontal idx listings is the strongest tool we have"). */
const strip = (p) => G.homes(`conway-${p.id}`, p.place, ask(p));
/* Text and its photo in one block, so the photo can sit beside the text on a wide screen (the photo's grid rows span
   every text row; the last row takes what is left). A block with no photo is a plain block. */
const side = (...kids) => { kids = kids.filter(Boolean); const ph = kids.filter((k) => k.includes('class="c3ph-hero"')).length, n = kids.length - ph;
  return ph ? `<div class="c3-cw-side" style="--cw-rows:${"auto ".repeat(Math.max(n - 1, 0))}1fr">` + kids.join("") + `</div>` : `<div class="c3-cw-part">` + kids.join("") + `</div>`; };
const D = PARTS[0], U = PARTS[1], WS = PARTS[2], CT = PARTS[3], NO = PARTS[4];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  pageImages: () => PH.pageImages(HALL),
  title: "Conway, SC Real Estate: Homes, Prices, Flood Map | Chapter3",
  description: "Living in Conway, SC: the five parts of town and what is in each, what homes cost, the city limits and your tax bill, which parts flood, and rents.",
  ogTitle: "Living in Conway, SC: the five parts of town, home prices, and where the river floods",
  crumb: "Conway",
  eyebrow: "Conway, SC",
  h1: "Conway, SC: the Grand Strand's inland value market.",
  h1em: `A river town about ${BEACH} minutes from the beach.`,
  sub: "In Conway you get Main Street and the Riverwalk downtown, a university and a hospital inside the city, and the biggest lots at its north edge.",
  heroMedia: glance([
    { icon: "beach", label: "Beach", text: `${BEACH} min drive` },
    { icon: "airport", label: "Airport", text: `${AIRPORT} min drive` },
    { icon: "town", label: "University", text: "In the city" },
    { icon: "hospital", label: "Hospital", text: `${HOSP} min drive` },
  ]),
  heroCta: TOP,
  topOfferLine: "Tell us your price range. We will send the Conway homes for sale that fit.",
  author: "devin",
  shortAnswer: [
    `Conway is a river town with an old downtown on the Waccamaw River, a university and a hospital inside the city, and the beach about ${BEACH} minutes away. A house here resells for about $${UNDER_COUNTY} less than across Horry County.`,
    `Most homes with a Conway mailing address are outside the city limits. Only a few places are in the flood maps, near the river, Crabtree Swamp and Kingston Lake. The two maps are FEMA's high-risk flood zone and the county's map of where Hurricane Florence's floodwater reached in 2018.`,
  ],
  sections: [
    { h2: "What is it like to live in Conway, SC?", toc: "Living here", id: "living-here", html: () =>
      CSS + DESIGN_CSS + G.homesCss() +
      side(
        h.p(`Conway is a small city on the Waccamaw River, said WAH-kuh-maw. Much of downtown was built in the early 1900s, after a fire, and its streets have old live oaks.`),
        h.p(`The Riverwalk is a path of about 1.5 miles along the river, with benches and a kayak launch. It starts about ${RIVERWALK} minutes by car from the center of town. At Riverfront Park beside it are a public boat landing with floating docks, a playground built like an old river steamboat, and rocking chairs under a gazebo.`),
        RIVER_PHOTO) +
      side(
        h.p(`Conway was laid out in 1732, as Kingston, and later named Conwayborough for General Robert Conway of the state militia.`),
        h.p(`City Hall on Main Street was finished in 1825 as the county courthouse. Its design is credited to Robert Mills, who designed the Washington Monument.`),
        HALL_PHOTO) +
      h.p(`Coastal Carolina University is inside the city, about ${CCU} minutes from downtown. It enrolled ${CCU_STUDENTS} students in fall 2024, a record for the school. Horry-Georgetown Technical College has its Conway campus on US 501, and Conway Medical Center is about ${HOSP} minutes from downtown.`) +
      h.p(`The city is growing fast. By Census estimates it grew about ${GROWTH} percent since 2020, the seventh fastest among South Carolina cities and towns of 10,000 people or more.`) +
      h.p(`The beach is about ${BEACH} minutes away by car, and the airport about ${AIRPORT}.`) +
      WHERE_MAP },

    { h2: "Is a Conway address inside the city of Conway?", toc: "City or county", id: "city-or-county", html: (bg) =>
      h.p(`Usually not. Only a little more than 1 in 4 homes with a Conway mailing address is inside the city limits. The rest are in the county, outside any city.`) +
      ADDRESS_CHART +
      h.p(`The same is true of homes for sale. At our last count, only about 1 in 4 houses for sale with a Conway address was inside the city. To see a lot's lines and zoning, use our ${h.a("/buyers/property-records/gis-map/", "Horry County GIS map guide")}.`) +
      h.h3("What the city line changes") +
      h.p(`Inside the city, the property tax is about $${TAX_GAP} a year more on a typical house you live in. The City of Conway picks up garbage, recycling and yard waste at the curb once a week for homes in the city, and the city has its own police and fire departments.`) +
      h.p(`Outside the city there is no city pickup. Homes in the county, outside any city, are the only ones allowed to use the county's 25 recycling and convenience centers, where owners bring their own trash.`) +
      h.cta("Inside the city or not, for one address", "Send us a Conway address. We tell you which side of the city line it is on, and what that means for its tax and its trash pickup.", "Have us look up an address", "/contact/", bg) },

    { h2: "Which part of Conway should you look at?", toc: "Five parts of town", id: "parts-of-town", html: () =>
      h.p(`The city's homes fall into five parts. Each has something the others do not. The numbers on the map match the entries below. Each price is what a house or townhouse there usually resold for in the past year, from county deeds.`) +
      PARTS_MAP +

      side(
        partH3(D, "a walk to Main Street and the river"),
        h.p(`Downtown is the old town on the river. Main Street, City Hall, the Riverwalk and Riverfront Park are all here. Kingston Park on Main Street has shaded tables and a fountain, and the Garden Walk off Third Avenue is a walkway with music and lights in the evening.`),
        h.p(`Downtown here means the streets within about a mile of the center of town, on house lots of ${lot(D.a.median_acres_houses)}. Snowhill, Mayfair, Buckwood, Highland Park and Collinswood are the largest subdivisions. Few homes here come up for sale. Those that did resold for about ${r5k(D.a.resales_not_condo.median)}.`),
        OAK_PHOTO) +
      strip(D) +

      side(
        partH3(U, "the university and the hospital"),
        h.p(`Along US 501 toward the beach, the city reaches past Coastal Carolina University. Conway Medical Center, on Singleton Ridge Road, and the Conway campus of Horry-Georgetown Technical College are in this part too.`),
        h.p(`Wild Wing, Coastal Point West, Kiskadee Parke and Aviary Village are the largest subdivisions, with about ${homesAbout(U)} homes in all, on lots of ${lot(U.a.median_acres_houses)}. Homes here resold for about ${r5k(U.a.resales_not_condo.median)}. Only the north edge was higher.`),
        KIMBEL_PHOTO) +
      strip(U) +

      side(
        partH3(WS, "the most homes, three city parks and the lowest prices"),
        h.p(`West and south of downtown, toward US 378 and US 701 South, is the largest part of the city. The Billy Gardner Recreation Complex on Mill Pond Road holds the Conway Recreation Center, with an indoor pool and walking track, plus ball fields and a playground built for children of all abilities. Smith Jones Park has an outdoor pool, and Collins Park has tennis and pickleball courts.`),
        h.p(`Rosehaven, New Castle, Oak Glenn, Woodland Lakes and Jasmine Woods are the largest subdivisions, on lots of ${lot(WS.a.median_acres_houses)}. Homes here resold for about ${r5k(WS.a.resales_not_condo.median)}, the lowest of the five parts.`)) +
      strip(WS) +

      side(
        partH3(CT, "north and northwest of downtown, with a park on Sherwood Drive"),
        h.p(`North and northwest of downtown, around Crabtree Swamp, are about ${homesAbout(CT)} homes, most of them 2 to 4 miles out. Sherwood Park on Sherwood Drive has a playground and a sand volleyball court, and across the street a nine-hole disc golf course inside a walking track.`),
        h.p(`Midtown Village, Rivertown Row, Elmhurst, Woodcreek, Kingston Bay, Sherwood and Country Club Forest are the largest subdivisions. The lots are the smallest in the city, ${lot(CT.a.median_acres_houses)}, and homes resold for about ${r5k(CT.a.resales_not_condo.median)}.`)) +
      strip(CT) +

      side(
        partH3(NO, "the biggest lots in the city"),
        h.p(`At the city's north edge, 4 to 5 miles from downtown, a typical lot is ${lot(NO.a.median_acres_houses)}, the largest in the city. Ridgewood West, Country Manor and Maple Hill are the largest subdivisions, with about ${homesAbout(NO)} homes in all.`),
        h.p(`Few homes resold here, and the middle price was about ${r5k(NO.a.resales_not_condo.median)}, the highest of the five parts.`)) +
      strip(NO) },

    { h2: "Does Conway, SC flood?", toc: "Flooding", id: "flooding", html: (bg) =>
      h.p(`A few parts do. About ${OUTSIDE_PER_100} in 100 homes in the city are outside both FEMA's high-risk zone and the land Florence's water reached in 2018. The rest are near the river, Crabtree Swamp and Kingston Lake.`) +
      h.p(`By part of town, none of the homes near the university are in either flood map. Downtown and at the north edge, ${floodWords(D)} homes are in one. West and south, it is ${floodWords(WS)}, and around Crabtree Swamp ${floodWords(CT)}.`) +
      FLOOD_MAP +
      side(
        h.p(`The worst flood on record came after Hurricane Florence in 2018. The river gauge at the Conway Marina read about 21 feet, its highest ever. That is the height of the river on the gauge, not the depth of water on a street. Major flooding starts at 14 feet.`),
        h.h3("Why the flood comes late and stays"),
        h.p(`The flood here comes down the river, days after the storm. Florence came ashore in North Carolina, and the river at Conway was highest ${FLO_CREST_DAY} days later.`),
        FLOOD_PHOTO) +
      RIVER_CHART +
      h.p(`During Florence, the county closed ${CL.flood_streets} streets in and at the edge of the city for flooding. Long Avenue, Third Avenue, Church Street and Marina Drive stayed closed about four weeks.`) +
      h.h3("Which streets flood at each river height") +
      h.p("The National Weather Service lists what floods as the river rises on the gauge:") +
      h.table(["River height", "What floods"], [
        ["14 feet", "Low areas along Long Avenue and Sherwood Drive, near Crabtree Swamp"],
        ["15 feet", "The Conway Marina, Elm Street and Marina Drive"],
        ["17 feet", "Main Street and Pecan Grove Boulevard may begin to flood"],
        ["21 feet", "The US 501 Bypass may flood. Florence reached about 21 feet."],
      ]) +
      h.h3("Where Florence's water reached, by subdivision") +
      h.table(["Subdivision, and where it is", "Homes Florence's water reached"], FLOOD_SUBS.map((s) => [`${title(s.name)}, ${SUB_PART[s.name].charAt(0).toLowerCase() + SUB_PART[s.name].slice(1)}`, `${s.in_sfz} of ${s.homes}`])) +
      h.p(`By the county's map, Florence's water did not reach large parts of Conway. No home in Rosehaven, Oak Glenn, Woodland Lakes, Rivertown Row, Kingston Bay or Snowhill is in either flood map.`) +
      h.h3("How often it happens") +
      h.p(`Of the ${EVENTS.length} floods on record that reached major flood stage at Conway, ${RECENT.length} came in the last 11 years.`) +
      h.p(`For Florence, flood insurance paid ${NF.by_year["2018"].paid_claims} claims in the city, and the middle claim was about ${r1k(NF.median_paid_2018)}. After Hurricane Matthew, the city used FEMA grants to buy ${BUY["4286"].buildings} buildings. Land bought this way must stay open space.`) +
      h.p(`Our page on ${h.a("/buyers/undisclosed-flooding/", "how to find out if a house flooded")} shows every record we use.`) +
      h.cta("The flood maps for one Conway house", "Send us a house you like. We check it against FEMA's flood map and the map of where Florence's water reached, before you make an offer.", "Have us check a house for flooding", "/contact/", bg) },

    { h2: "Do you need flood insurance in Conway, and what does it cost?", toc: "Flood insurance", id: "flood-insurance", html: () =>
      h.p(`Federal law makes a lender require it only when the house is in FEMA's high-risk zone. A lender can still ask for it anywhere.`) +
      h.p(`Outside the high-risk zone, a flood policy on a house usually costs about ${POL_X1s} to ${POL_X2s} a year, depending on the ZIP code.`) +
      h.table(["Flood policy a year, about", "ZIP 29526", "ZIP 29527"], [["Outside the zone", POL_X1s, POL_X2s], ["Inside the zone", POL_As, POL_As]]) +
      h.p(`A new federal flood policy takes effect 30 days after the application and payment are complete, unless it is bought when a home loan is made. Buy it with the house, not when a storm is coming.`) },

    { h2: "What does it cost to own a home in Conway each year?", toc: "Yearly cost", id: "yearly-cost", html: (bg) =>
      h.p(`For a typical ${money(TAX.price)} house you live in inside the city, the property tax is about ${r100(TAX.inside_city_4pct)} a year, plus a flood policy if you want one.`) +
      compareCards([
        { name: "Property tax, a home you live in", cells: { in: `About ${r100(TAX.inside_city_4pct)}`, out: `About ${r100(TAX.outside_city_4pct_district100)}, with an $89 county fee` } },
        { name: "Flood policy outside the high-risk zone, if you want one", cells: { in: `About ${POL_X1s} to ${POL_X2s}`, out: `About ${POL_X1s} to ${POL_X2s}` } },
        { name: "Tax and flood policy together", cells: { in: `About ${r100(TAX.inside_city_4pct + 560)} to ${r100(TAX.inside_city_4pct + 680)}`, out: `About ${r100(TAX.outside_city_4pct_district100 + 560)} to ${r100(TAX.outside_city_4pct_district100 + 680)}` } },
        { name: "Property tax instead, as a second home or rental", cells: { in: `About ${r100(TAX.inside_city_6pct)}`, out: `About ${r100(TAX.outside_city_6pct_district100)}` } },
      ], [{ key: "in", label: "Inside the city" }, { key: "out", label: "Just outside it" }], { caption: `Each year, for a ${money(TAX.price)} house`, nameLabel: "What you pay" }) +
      h.p(`Homeowners insurance is a third bill, on top of these. Its price depends on the house, its roof and the company. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance page")} explains the policies a house here can need.`) +
      h.p(`South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent. You must apply for the lower rate. Inside the city, that makes a rental's bill about ${RATIO} times a home's. Our ${h.a("/buyers/property-taxes/", "property tax page")} shows how to apply.`) +
      h.cta("The yearly bills on one house, before you offer", "Pick a house. We work out its property tax at the rate you will pay and get you an insurance quote on it.", "Have us price the yearly bills", "/contact/", bg) },

    { h2: "What do homes cost in Conway, SC?", toc: "Home prices", id: "home-prices", html: () =>
      h.p(`A house or townhouse that resold inside the city in the past year usually went for about ${HOME}. Half sold for between about ${Q1} and ${Q3}.`) +
      h.p(`At that price, a house in the city is usually three bedrooms and about ${BUYS_SQ} square feet. That is what we found among the houses for sale inside the city near that price at our last count, about 3 in 4 of them with three bedrooms. Some were new, built in the last two years.`) +
      h.p(`Builders sold about ${near(NEW.n, 10)} new homes in the city in the same year, for about ${r5k(NEW.median)} in the middle. Few resales were condos, and those went for about ${r5k(CONDO.median)}.`) +
      PRICE_CHART +
      h.p(`Conway is not the cheapest town in the county. Homes in Loris and Aynor, two smaller inland towns, resold for less.`) +
      h.p(`At our last count, about ${near(L.api_totals.house, 10)} houses were for sale with a Conway address, more than half of them new construction, and about ${near(L.houses_one_acre_plus, 10)} on an acre or more. Our ${h.a("/buyers/no-hoa-homes/", "no-HOA homes guide")} and ${h.a("/buyers/affordable-places-to-live/", "most affordable places")} include Conway. For vacant land, see ${h.a("/buyers/land/", "land for sale around Conway and the county")}.`) },

    { h2: "What do homes rent for in Conway?", toc: "Renting out", id: "renting-out", html: (bg) =>
      h.p(`HUD's fair market rent for a three-bedroom in the Conway ZIP codes is ${money(HUD.three)} a month. HUD counts rent and utilities together, so the rent alone is less. The figure sits a little under ${h.a("/invest/rent-prices/", "the middle of the market")}.`) +
      h.table(["Bedrooms", "HUD fair market rent, ZIPs 29526 and 29527"], [["Two", money(HUD.two)], ["Three", money(HUD.three)], ["Four", money(HUD.four)]]) +
      h.p(`In Carolina Forest's ZIP code, the three-bedroom figure is about $${HUD_GAP} more.`) +
      h.p(`In our experience, students near the college look for the cheapest house that fits their group. People moving to be near the college pay more for a nice house close to campus.`) +
      h.p(`In our experience near the college, August is the best month to find a new tenant, because new students arrive. Start marketing a month before the lease ends. Our ${h.a("/invest/student-rentals/", "student rental guide")} covers renting near Coastal Carolina.`) +
      h.p(`For any address, our ${h.a("/invest/long-term-rental/", "rental analyzer")} gives the rent and the costs. For nightly rentals, see ${h.a("/invest/airbnb-income/", "what a nightly rental earns by town")} and ${h.a("/invest/str-rules/", "the short-term rental rules by town")}.`) +
      h.cta("What one Conway house would rent for", "Send us an address. We send back the rent from nearby rentals, the tax at a landlord's rate, and what is left each month after the tax and costs.", "Have us estimate a house's rent", "/contact/", bg) },

    { h2: "What are the pros and cons of living in Conway?", toc: "Pros and cons", id: "pros-and-cons", html: (bg) =>
      h.p("The good points are the price, the downtown and the university. The hard ones are flooding in a few places, the city tax and the drive to the beach.") +
      prosCons([
        `Homes cost less than in the county as a whole, and new homes and land are for sale.`,
        "A downtown on the river, with Main Street, the Riverwalk and Riverfront Park.",
        "A university and the hospital inside the city, and city trash pickup each week.",
      ], [
        "A few parts flood, and the river stays high for weeks.",
        "The city's property tax is higher than just outside it.",
        `The beach is a drive of about ${BEACH} minutes, not a walk.`,
      ], { bg }) },
  ],
  faqTitle: "Conway, SC FAQ",
  faq: [
    { q: "Is Conway, SC a good place to live?", a: `For a buyer who wants a river town with a downtown and a university, at prices under the county's middle, yes. The trade is the drive: the beach is about ${BEACH} minutes away by car.` },
    { q: "How far is Conway from Myrtle Beach?", a: `About ${BEACH} minutes by car from downtown Conway to the beach in Myrtle Beach, without traffic, and about ${AIRPORT} minutes to Myrtle Beach International Airport.` },
    { q: "Does Conway, SC flood?", a: `In a few places. About ${OUTSIDE_PER_100} in 100 homes in the city are outside both FEMA's high-risk zone and the land Florence's water reached; most of the rest are near the Waccamaw River, Crabtree Swamp and Kingston Lake.` },
    { q: "What is the property tax rate in Conway, SC?", a: "Inside the city, a home you live in pays about $654 a year for every $100,000 of the county's value for it. Just outside the city, it pays about $368, plus an $89 county stormwater fee. A second home or rental pays about 2.5 times as much inside the city." },
    { q: "How many people live in Conway, SC?", a: `About ${near(POP_2025, 100)} in 2025, by the Census Bureau's estimate, up from ${n(POP_2020)} at the 2020 Census.` },
    { q: "Is Conway, SC safe?", a: "We do not rate any place as safe or unsafe. Inside the city limits, the City of Conway has its own police department and fire department." },
    { q: "Which schools serve Conway, SC?", a: "Horry County Schools assigns schools by address, and one of its attendance areas is named Conway. We look up the assigned schools for any house you like." },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "Census estimates", href: CENSUS },
    { name: "NWS river gauge", href: GAUGE },
    { name: "USGS gauge", href: USGS },
    { name: "FEMA flood claims", href: NFIP },
    { name: "HUD rents", href: HUDFMR },
    { name: "2026 tax levy", href: LEVY },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "42 USC 4012a", href: USC4012A },
    { name: "42 USC 4013", href: USC4013 },
    { name: "44 CFR 80.19", href: CFR80 },
    { name: "City history", href: HISTORY },
    { name: "city parks", href: PARKS },
    { name: "city trash", href: TRASH },
    { name: "county recycling", href: SWA },
    { name: "hospital", href: CMC },
    { name: "HGTC", href: HGTC },
    { name: "NRHP record", href: NRHP },
    { name: "NCES", href: NCES },
  ],
  sourcesNote: "Our counts from county parcels, flood maps and the past year's deeds. Listing counts in aggregate from CCMLS. Drives from downtown, without traffic.",
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: END,
  keywords: "living in Conway SC, Conway SC neighborhoods, Conway SC flooding, Conway SC flood zone map, is Conway SC a good place to live, Conway SC home prices, Conway SC city limits, Conway SC property tax, how far is Conway from Myrtle Beach, Conway SC rentals",
  about: "Conway, a city on the Waccamaw River in Horry County, South Carolina",
});
