/* /submarkets/north-myrtle-beach/ - living in North Myrtle Beach, SC: what the city is like, its eight
 * parts (the four old beach towns, Tilghman Beach, Little River Neck, the mainland west of US 17 and the
 * neighborhoods across the waterway), what a home costs in each, where it floods, what owning costs each
 * year, and the rules for renting by the night.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-03. The live page was hand-made (an "Investor Report" with a
 * town guide bolted on); this is its first spec, and it is now a town guide for a buyer choosing where in
 * the city to buy, with one section for the nightly-rental owner.
 * Facts: Blog-Brain batches/2026-11-a/submarkets-north-myrtle-beach/facts.md (VERIFIED rows, and CORRECTED
 * rows in the verifier's wording and values only; VERIFY.md; struck wording in
 * submarkets-north-myrtle-beach-struck.json). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-a/submarkets-north-myrtle-beach/verified/ (the verifier's run with the Crescent Beach
 * and Windy Hill fix: findings.json, table-parts.json, map-parts.geojson), landmarks.json, raw/drives.json,
 * raw/munis-ab.json, photos.json. Every count, share, price and drive time is read from those files and
 * checked against its ledger row here, never typed. Where the ledger's corrected wording rounds a figure,
 * the rounding is checked against the file.
 * Kept from the live page: the rental angle of the liked H1 (the rule in force, now stated as the verifier
 * corrected it: a yearly city license, no special zoning or permit; "allowed citywide" is struck, row 23),
 * the 1968 merger, the parking-space rule, 4 against 6 percent, McLeod Seacoast nearby, Barefoot on the
 * waterway, 18,790 people in 2020, the homes feed (the website's edge adds it), and the links to the
 * rental, tax, insurance and flood pages.
 * Not kept (judge 2026-10-31; PLAN.md "What must not survive"): "a licensing regime still in draft", the
 * family and golfer wording, the "illustrative" occupancy chart and the AirROI box, Redfin's and Zillow's
 * medians, the financing section, First Street's 44 percent, the school table and the crime how-to, the
 * shoulder-season claim, the "Investor Hub" crumb.
 * Pictures: our own map of the eight parts, drawn here from the county's polygons (area-map.js takes no
 * polygon overlay; Little River NEEDS 1); a drive-time map (tools/area-map.js); glass bar charts
 * (tools/glass.js); one Commons photo of Cherry Grove (CC BY-SA 3.0, 2012) and three labelled USDA NAIP
 * aerials, public domain (photos.json; images/aerial_render.py), until the photo partner's shots arrive
 * (shot-list.md).
 * Round 4, 2026-11-08 (owner: "i dont feel emotionally pulled to any of these locations"; the numbered map of
 * the parts was hard to read; "horizontal idx listings is the strongest tool we have"): each part now sells
 * itself with what a local would show you there (facts.md rows 52 to 64, independent verifier), the numbered
 * map became a plain list of the parts in two groups, each part has a homes strip (idx-places.json nmb-*)
 * with its old "Send me homes" pill as the fallback, the flood chart shows one number per part under a title
 * that states its point, and the for-sale chart became one sentence (the strips show the homes).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance, prosCons } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));

const SELF = "/submarkets/north-myrtle-beach/";
const SLUG = "submarkets-north-myrtle-beach";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", SLUG);
const IMG_DIR = path.join(__dirname, "..", "chapter3realty", "images", "2026-11-a", SLUG);
const IMG_SRC = `/images/2026-11-a/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("verified/findings.json"), TABLE = read("verified/table-parts.json").rows;
const LM = read("landmarks.json"), DRIVES = read("raw/drives.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r10k = (v) => money(Math.round(v / 10000) * 10000);
const r100 = (v) => money(Math.round(v / 100) * 100);
const must = (ok, msg) => { if (!ok) throw new Error(`north-myrtle-beach.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 3: people (Census 2020 and 2010, city). */
const P2020 = 18790, P2010 = 13752, GROWTH = Math.round((P2020 - P2010) / P2010 * 100);
{ const c = JSON.stringify(read("raw/census-DECENNIALPL2020.P1-160XX00US4551280.json")), d = JSON.stringify(read("raw/census-DECENNIALSF12010.P1-160XX00US4551280.json"));
  must(c.includes("18790") && d.includes("13752") && GROWTH === 37, "row 3 changed"); }
/* Row 4: seasonal homes, 2020 Census DHC H5 and PL H1. */
{ const hh = JSON.stringify(read("raw/census-DECENNIALDHC2020.H5-160XX00US4551280.json")), h1 = JSON.stringify(read("raw/census-DECENNIALPL2020.H1-160XX00US4551280.json"));
  must(hh.includes("12555") && h1.includes("25950") && Math.round(12555 / 25950 * 1000) / 10 === 48.4, "row 4 changed"); }

/* Rows 7, 8: homes, by kind and by part (verified run). */
must(F.homes.all === 31135 && F.homes.by_kind.condo === 17898 && F.homes.by_kind.house === 11450, "row 7 changed");
const HA = F.homes_by_area;
must(HA.cb.n === 3969 && HA.wh.n === 3920 && HA.cg.n === 4848 && HA.across.n === 5193 && HA.neck.by_kind.manufactured === 661, "row 8 (corrected) changed");

/* Row 9: city prices from deeds. */
const S = F.sales;
must(S.house_resale.n === 560 && S.house_resale.median === 565000 && S.house_resale.p25 === 420000 && S.house_resale.p75 === 740000, "row 9 house changed");
must(Math.round(S.house_new_builder.median) === 441595 && S.condo.median === 309750 && S.townhouse.median === 350000, "row 9 others changed");
const HOUSE = r5k(S.house_resale.median), CONDO = r10k(S.condo.median), NEW_HOUSE = r10k(S.house_new_builder.median);   // $565,000, $310,000, $440,000
must(HOUSE === "$565,000" && CONDO === "$310,000" && NEW_HOUSE === "$440,000", "row 9 rounding");

/* Rows 10, 11: by part (verified run; row 10 wording "about"). */
const SA = F.sales_by_area;
const HR = Object.fromEntries(Object.entries(SA).map(([k, v]) => [k, v.house_resale]));
must(HR.til.median === 725000 && HR.cg.median === 695000 && HR.od.median === 600000 && HR.od.p25 === 385000 && HR.od.p75 === 980000
  && HR.neck.median === 588782 && HR.across.median === 477500 && HR.west17.median === 475000 && HR.wh.median === 460000 && HR.wh.n === 29
  && HR.cb.median === 410000 && HR.cb.n === 65, "row 10 (corrected) changed");
must(SA.west17.condo.median === 175000 && SA.across.condo.median === 275000 && SA.cb.condo.median === 338400 && SA.wh.condo.median === 358500, "row 11 (corrected) changed");
const beachKeys = ["cg", "til", "od", "cb", "wh"];
must(beachKeys.every((k) => SA[k].condo.median >= 305000 && SA[k].condo.median <= 360000) && SA.neck.condo.median > 305000, "row 11: a beach part's condo middle is outside $310,000 to $360,000");
must(beachKeys.every((k) => HR.cb.median <= HR[k].median), "row 10: Crescent Beach no longer has the lowest middle house price of the beach parts");
must(Object.keys(HR).every((k) => HR.til.median >= HR[k].median), "row 10: Tilghman Beach no longer has the highest middle house price");
must(Object.keys(SA).every((k) => SA.west17.condo.median <= SA[k].condo.median), "row 11: west of US 17 no longer has the lowest condo middle");

/* Row 12: new houses from builders. */
const NB = Object.fromEntries(Object.entries(SA).map(([k, v]) => [k, v.house_new_builder.n]));
must(S.house_new_builder.n === 279 && NB.across === 125 && NB.west17 === 94 && NB.neck === 53 && beachKeys.reduce((t, k) => t + NB[k], 0) === 7, "row 12 changed");
must(Object.keys(NB).every((k) => NB.across >= NB[k]), "row 12: across the waterway no longer has the most new houses");

/* Rows 13, 14: the Cherry Grove channels. */
const CH = F.channel_houses;
must(CH.n === 682 && CH.in_sfha === 679 && CH.zones.outside === 3 && CH.legal_residence_pct === 23.0, "row 13 changed");
must(S.house_resale_channel.n === 38 && S.house_resale_channel.median === 715000 && S.house_resale_cg_not_channel.median === 665000, "row 14 changed");

/* Row 15: listings in aggregate (CCMLS), as of the pull. */
const LT = F.listings.by_type;
must(LT.house.n === 252 && LT.condo.n === 574 && LT.townhouse.n === 35 && LT.manufactured.n === 39 && F.listings.condo_under_200k === 84 && F.listings.house_under_400k === 27, "row 15 changed");
must(F.listings.by_area.west17.condo.median === 199900 && F.listings.by_area.west17.condo.n === 40, "row 15 west17 changed");

/* Rows 17, 18: the flood zone (verified run; row 18 corrected wording). */
const FL = F.flood, FA = FL.by_area;
must(FL.all.pct_sfha === 33.2 && FL.houses.pct_sfha === 22.4 && FL.condos.pct_sfha === 42.2, "row 17 changed");
must(FA.cg.all.pct_sfha === 88.1 && FA.cg.houses.pct_sfha === 94.8 && FA.od.all.pct_sfha === 52.3 && FA.od.houses.pct_sfha === 10.2
  && FA.wh.all.pct_sfha === 54.2 && FA.wh.houses.pct_sfha === 17.1 && FA.wh.condos.pct_sfha === 71.0 && FA.til.all.pct_sfha === 32.9 && FA.til.houses.pct_sfha === 15.2
  && FA.cb.all.pct_sfha === 9.8 && FA.cb.houses.pct_sfha === 1.4 && FA.neck.all.pct_sfha === 9.9 && FA.west17.all.pct_sfha === 6.8
  && FA.across.all.in_sfha === 2 && FA.across.all.n === 5193, "row 18 (corrected) changed");
must(beachKeys.every((k) => FA.cb.houses.pct_sfha <= FA[k].houses.pct_sfha), "row 18: Crescent Beach no longer has the fewest houses in the zone of the beach parts");

/* Row 19: flood policies, ZIP 29582. */
const NP = F.nfip_policies_29582;
must(NP.x.median === 603 && NP.a.median === 1463 && NP.v.median === 2151, "row 19 changed");
const POL_X = r100(NP.x.median), POL_A = money(Math.round(NP.a.median / 10) * 10), POL_V = money(Math.round(NP.v.median / 10) * 10);   // $600, $1,460, $2,150
must(POL_X === "$600" && POL_A === "$1,460" && POL_V === "$2,150", "row 19 rounding");

/* Row 22: buyers whose tax bill goes to another state. */
must(S.pct_buyer_bill_out_of_state === 55.1 && S.all === 2029, "row 22 changed");

/* Row 34: drives from Main Street at Ocean Drive, free flow; under 15 minutes to the minute, longer to the nearest 5. */
const mins = (k) => { const m = DRIVES[k].minutes; return m < 15 ? Math.round(m) : Math.round(m / 5) * 5; };
const D_PIER = mins("cherry_grove_pier"), D_HOSP = mins("mcleod_seacoast"), D_BAREFOOT = mins("barefoot_landing"), D_HERITAGE = mins("heritage_shores"),
  D_GSMC = mins("grand_strand_medical"), D_SKYWHEEL = mins("skywheel_myrtle_beach"), D_MALL = mins("coastal_grand"), D_AIRPORT = mins("airport_terminal");
must(D_PIER === 8 && D_HOSP === 9 && D_BAREFOOT === 11 && D_HERITAGE === 12 && D_GSMC === 20 && D_SKYWHEEL === 30 && D_MALL === 30 && D_AIRPORT === 35, "row 34 drives changed");
must(F.drives_from_main_street.barefoot_landing.minutes === 10.9, "row 33 changed");

/* Row 35: houses taxed as someone's legal residence (4 percent), by part (verified run). */
const RES = Object.fromEntries(Object.entries(F.residence.by_area).map(([k, v]) => [k, v.houses.pct_legal_residence]));
must(RES.across === 74.1 && RES.neck === 72.9 && RES.west17 === 72.2 && RES.til === 67.1 && RES.od === 41.0 && RES.cb === 32.2 && RES.wh === 32.0 && RES.cg === 23.7, "row 35 (corrected) changed");
must(beachKeys.every((k) => RES.til >= RES[k]), "row 35: Tilghman Beach no longer has the most main homes of the beach parts");

/* Rows 36, 37: lodging taxes and the worked example. */
const LX = F.lodging_tax_example;
must(LX.rent === 2000 && LX.state_9pct === 180 && LX.city_hospitality_1_5pct === 30 && LX.county_hospitality_1_5pct === 30 && LX.total_12pct === 240, "row 37 changed");

/* Rows 38, 39: property tax (row 39 corrected wording). */
const TX = F.tax_example;
must(TX.mills === 221.2 && TX.mills_at_4pct === 112.1 && TX.house.value === 565000 && TX.house.as_home === 2533 && TX.house.as_second_or_rental === 7499
  && TX.condo.as_home === 1389 && TX.condo.as_second_or_rental === 4111 && TX.per_100k.as_home === 448 && TX.per_100k.as_second_or_rental === 1327, "rows 38, 39 changed");
const TAX_HOME = r100(TX.house.as_home), TAX_RENT = r100(TX.house.as_second_or_rental);                       // $2,500 and $7,500
const OWN_HOME = r100(TX.house.as_home + NP.x.median), OWN_RENT = r100(TX.house.as_second_or_rental + NP.x.median);   // $3,100 and $8,100
must(TAX_HOME === "$2,500" && TAX_RENT === "$7,500" && OWN_HOME === "$3,100" && OWN_RENT === "$8,100", "row 39 rounding");

/* Row 43 (corrected): the neighborhoods named in the entries. */
const SUBS = F.subdivisions_by_area;
const sub = (k, nm) => { const s = SUBS[k].find((x) => x.name === nm); must(s, `${nm} not in ${k}`); return s; };
must(sub("neck", "TIDEWATER PLNTN").kinds.house + sub("neck", "TIDEWATER PLANTATION").kinds.house === 481 && sub("neck", "TIDEWATER PLNTN").resales_main_kind.median === 615000
  && sub("neck", "TIDEWATER PLANTATION").resales_main_kind.median === 561250, "row 43 Tidewater changed");
must(sub("til", "TILGHMAN EST").kinds.house === 449, "row 43 Tilghman Estates changed");
must(sub("od", "INGRAM BEACH").kinds.house === 144 && sub("od", "INGRAM BEACH").resales_main_kind.n === 12 && sub("od", "INGRAM BEACH").resales_main_kind.median === 1350000, "row 43 Ingram Beach changed");
must(sub("cb", "CRESCENT BEACH").kinds.house + sub("cb", "CRESCENT BCH").kinds.house === 673 && sub("cb", "CRESCENT BEACH").resales_main_kind.median === 717500 && sub("cb", "CRESCENT BCH").resales_main_kind.median === 664470, "row 43 Crescent Beach plats changed");
must(sub("wh", "WINDY HILL BCH").kinds.house === 320 && sub("wh", "WINDY HILL BCH").resales_main_kind.n === 10 && sub("wh", "WINDY HILL BCH").resales_main_kind.median === 439000, "row 43 Windy Hill Beach changed");
must(sub("west17", "CHESTNUT GREENS").kinds.house === 408 && sub("west17", "CHESTNUT GREENS").resales_main_kind.median === 514950, "row 43 Chestnut Greens changed");
must(sub("west17", "SUNSET HARBOUR").kinds.house === 161 && sub("west17", "SUNSET HARBOUR").resales_main_kind.median === 759000 && sub("west17", "SUNSET HARBOUR").in_sfha === 68, "row 43 Sunset Harbour changed");
const SEABROOK = sub("til", "SEABROOK PLANTATION"); must(SEABROOK.kinds.house === 166, "row 43 Seabrook changed");
const GDN = sub("across", "GRANDE DUNES N"), WS = sub("across", "WATERSIDE");
must(GDN.kinds.house === 261 && GDN.resales_main_kind.median === 374000 && WS.kinds.house === 206 && WS.resales_main_kind.median === 385000, "row 43 across changed");

/* Rows 30, 31, 32, 33, 41: which part each named place is in (OpenStreetMap points, landmarks.json). */
must(LM["Main Street (Ocean Drive)"].part === "Ocean Drive" && LM["McLean Park"].part === "Ocean Drive" && LM["Ingram Dunes Nature Preserve"].part === "Ocean Drive"
  && LM["Central Park"].part === "West of US 17" && LM["Cherry Grove Pier"].part === "Cherry Grove" && LM["Cherry Grove Boat Ramp"].part === "Cherry Grove"
  && LM["Heritage Shores Nature Preserve"].part === "Cherry Grove", "landmarks changed part");

/* Fix round 1 (2026-11-04). Rows 44 to 47 are VERIFIED-BY-FIXER (facts.md); rows 48 to 50 are carried from verified rows
   of /buyers/cost-to-own/ and /buyers/relocating/which-town/, read from their own data files here. */
/* Row 44: drive from a typical house in two inland parts to Ocean Boulevard (raw/drives-to-beach.json, drives_beach_fix1.py). */
const DB = read("raw/drives-to-beach.json").areas;
must(DB.west17.median === 3.8 && DB.across.median === 10.6 && DB.west17.n === 60 && DB.across.n === 60, "row 44 changed");
const B_WEST = Math.round(DB.west17.median), B_ACROSS = Math.round(DB.across.median);
must(B_WEST === 4 && B_ACROSS === 11, "row 44 rounding");
/* Row 45: Barefoot Resort's four courses (raw/barefootgolf-home.txt). */
{ const t = fs.readFileSync(path.join(DATA, "raw", "barefootgolf-home.txt"), "utf8");
  must(t.includes("four award-winning championship courses designed by legendary architects Greg Norman, Davis Love III, Tom Fazio, and Pete Dye")
    && t.includes("seven spectacular holes stretching along the Intracoastal Waterway"), "row 45 changed"); }
/* Row 46: the shag pavilion (SC Encyclopedia, raw/sce-nmb.json; ledger row 6 note). Row 47: Windy Hill's start (same entry). */
{ const t = JSON.stringify(read("raw/sce-nmb.json"));
  must(t.includes("A pavilion and amusement park drew crowds to play and dance the shag") && t.includes("Windy Hill Beach was developed by Conway investors after World War II"), "rows 46, 47 changed"); }
/* Rows 48 to 50: insurance, upkeep and the condo fee (cost-to-own data; CTO rows 17, 19, 26, 31, 32; which-town rows 12, 13, 30). */
const CTO = path.join(__dirname, "..", "data", "2026-11-a", "buyers-cost-to-own");
const EX = JSON.parse(fs.readFileSync(path.join(CTO, "examples.json"), "utf8")), HOA = JSON.parse(fs.readFileSync(path.join(CTO, "hoa-by-area.json"), "utf8")).areas["29582"];
const EXC = EX.condos.find((c) => c.place === "North Myrtle Beach");
const INS_HOUSE = EX.houses[0].insurance, UPKEEP_HOUSE = EX.houses[0].upkeep, INS_CONDO = EXC.insurance, UPKEEP_CONDO = EXC.upkeep, FEE_MO = HOA.condo.median;
must(INS_HOUSE === 2000 && UPKEEP_HOUSE === 3273 && INS_CONDO === 800 && UPKEEP_CONDO === 692 && FEE_MO === 700 && EXC.hoa_monthly_middle === 700, "rows 48, 49 changed");
must(HOA.house.listings === 255 && HOA.house.no_hoa === 134, "row 50 changed");
const YR_HOUSE_HOME = TX.house.as_home + INS_HOUSE + NP.x.median + UPKEEP_HOUSE, YR_HOUSE_RENT = TX.house.as_second_or_rental + INS_HOUSE + NP.x.median + UPKEEP_HOUSE;
const YR_CONDO_HOME = TX.condo.as_home + INS_CONDO + FEE_MO * 12 + UPKEEP_CONDO, YR_CONDO_RENT = TX.condo.as_second_or_rental + INS_CONDO + FEE_MO * 12 + UPKEEP_CONDO;
/* Totals of $10,000 or more round to the thousand (score P1). */
const yr = (v) => (v >= 10000 ? r1k(v) : r100(v));
must(yr(YR_HOUSE_HOME) === "$8,400" && yr(YR_HOUSE_RENT) === "$13,000" && yr(YR_CONDO_HOME) === "$11,000" && yr(YR_CONDO_RENT) === "$14,000", "row 51 totals changed");

/* ---------------------------------------------------------------------------- */
/* The eight parts (row 8; our grouping, not the city's map).                     */

/* Round 4: the order a buyer meets them, the five on the ocean from north to south, then the three inland. hook: the
   line in the list of parts, from the entry's own verified sentences. tail: the end of the entry's heading. */
const PARTS = [
  { key: "cg", name: "Cherry Grove", id: "cherry-grove", hook: "A dock behind the house, and a pier at sunrise" },
  { key: "til", name: "Tilghman Beach", id: "tilghman-beach", hook: "Houses by the ocean, most of them the owner's main home" },
  { key: "od", name: "Ocean Drive", id: "ocean-drive", hook: "Main Street and its shag clubs" },
  { key: "cb", name: "Crescent Beach", id: "crescent-beach", hook: "A house near the ocean for less, with little flood zone" },
  { key: "wh", name: "Windy Hill", id: "windy-hill", hook: "Beach houses at some of the lower prices by the ocean" },
  { key: "neck", name: "Little River Neck", id: "little-river-neck", hook: "Woods and trail rides north of the Cherry Grove marsh" },
  { key: "west17", name: "West of US 17", id: "west-of-us-17", hook: "Newer houses a few minutes' drive from the beach" },
  { key: "across", name: "Across the waterway", id: "across-the-waterway", hook: "Four golf courses, a marina and almost no flood zone" },
];
const PART = Object.fromEntries(PARTS.map((p) => [p.key, p]));
must(PARTS.every((p) => F.area_names[p.key] === p.name || (p.key === "west17" && F.area_names.west17 === "West of US 17")), "part names differ from areas.py");

/* ---------------------------------------------------------------------------- */
/* The parts as a plain list (round 4). The numbered map drawn from the county's polygons was hard to read
   (owner, 2026-11-08); a buyer needs two things from it: which parts are on the ocean, and their order. */

const ROW = (p) => `<li><a href="#${p.id}">${p.name}</a><span>${p.hook}</span></li>`;
const PARTS_LIST = `<div class="c3-nmb-list">`
  + `<p class="c3-nmb-grp">On the ocean, from north to south</p><ul>` + ["cg", "til", "od", "cb"].map((k) => ROW(PART[k])).join("")
  + `<li class="c3-nmb-ab"><b>Atlantic Beach</b><span>A separate town, not part of the city</span></li>` + ROW(PART.wh) + `</ul>`
  + `<p class="c3-nmb-grp">Inland</p><ul>` + ["neck", "west17", "across"].map((k) => ROW(PART[k])).join("") + `</ul></div>`;

/* Map 2: drive times from Main Street (row 34), tools/area-map.js. */
const MAIN = LM["Main Street (Ocean Drive)"];
const DRIVE_MAP = (() => {
  const m = regionMap({ home: { name: "Main Street", label: "Main Street", lat: MAIN.lat, lon: MAIN.lon, town: "North Myrtle Beach" },
    landmarks: [
      { name: "Cherry Grove Pier", short: "Cherry Grove Pier", kind: "beach", lat: LM["Cherry Grove Pier"].lat, lon: LM["Cherry Grove Pier"].lon, minutes: D_PIER },
      { name: "McLeod Seacoast hospital", short: "Hospital", kind: "hospital", lat: 33.86573, lon: -78.66371, minutes: D_HOSP },
      { name: "Barefoot Landing", short: "Barefoot Landing", kind: "shopping", lat: LM["Barefoot Landing"].lat, lon: LM["Barefoot Landing"].lon, minutes: D_BAREFOOT },
    ],
    alt: `Map of North Myrtle Beach: from Main Street, Cherry Grove Pier is about ${D_PIER} minutes by car, McLeod Seacoast hospital about ${D_HOSP} minutes and Barefoot Landing about ${D_BAREFOOT} minutes.` },
  { glass: true, dir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), src: "/images/maps" });
  must(m.html.includes(`${D_PIER} min`), "the drive map lost the pier drive");
  must(DRIVES.mcleod_seacoast.url.includes("-78.663710,33.865730"), "the hospital point differs from the routed point");
  return `<figure class="c3-nmb-fig" style="max-width:560px"><div class="c3-nmb-frame">${m.html}</div><figcaption>Drive times by car from Main Street at Ocean Drive, without traffic. ${m.credit}</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Charts and tables (glass.js, compare.js).                                      */

const pctTxt = (v) => `${Math.round(v)}%`;
/* Round 4: one number per part, and a title that says the point. The houses-and-condos split is in each entry. */
const FLOOD_CHART = G.bars(PARTS.slice().sort((a, b) => FA[b.key].all.pct_sfha - FA[a.key].all.pct_sfha).map((p) => ({
  name: p.name, value: FA[p.key].all.pct_sfha, valueText: p.key === "across" ? `2 of ${n(Math.round(HA.across.n / 100) * 100)}` : pctTxt(FA[p.key].all.pct_sfha) })),
  { caption: "Homes in FEMA's high-risk flood zone: most of Cherry Grove, almost none across the waterway", nameLabel: "Part", valueLabel: "Share of homes in the zone", compact: true, phoneList: true, max: 100,
    note: "Every home in the county's parcel records, tested against FEMA's flood map as the county carries it." });
must(pctTxt(FA.od.houses.pct_sfha) === "10%" && pctTxt(FA.wh.houses.pct_sfha) === "17%", "flood chart rounding");

/* The parts side by side (rows 10, 11, 18, 35), from table-parts.json; checked against findings. */
const TROW = Object.fromEntries(TABLE.map((r) => [r.key, r]));
PARTS.forEach((p) => must(TROW[p.key].house_resale.median === HR[p.key].median && TROW[p.key].pct_homes_high_risk_flood === FA[p.key].all.pct_sfha && TROW[p.key].pct_houses_legal_residence === RES[p.key], `table row ${p.key} disagrees with findings`));
/* Shares said as the entries say them: the nearest of 1 in 4, 1 in 3, 4 in 10, half, 2 in 3, 3 in 4. */
const SHARE_WORDS = [[25, "1 in 4"], [100 / 3, "1 in 3"], [40, "4 in 10"], [50, "half"], [200 / 3, "2 in 3"], [75, "3 in 4"]];
/* The ratio is joined with no-break spaces, so a phone never sets "About 3 in" with "4" alone on the next line (critic, round 1). */
const inTen = (v) => { const [, w] = SHARE_WORDS.reduce((b, c) => (Math.abs(c[0] - v) < Math.abs(b[0] - v) ? c : b)); return `About ${w.replace(/ /g, "\u00a0")}`; };
must(["cg", "neck", "til", "od", "cb", "wh", "west17", "across"].map((k) => inTen(RES[k]).replace(/\u00a0/g, " ")).join("|") === "About 1 in 4|About 3 in 4|About 2 in 3|About 4 in 10|About 1 in 3|About 1 in 3|About 3 in 4|About 3 in 4", "main-home words changed");
const PARTS_TABLE = `<div class="c3-nmb-parts">` + compareCards(PARTS.map((p) => ({ name: p.name, href: `#${p.id}`, cells: {
  house: `About ${r5k(HR[p.key].median)}`, condo: `About ${r5k(SA[p.key].condo.median)}`, main: inTen(RES[p.key]) } })),
  [{ key: "house", label: "Typical resold house" }, { key: "condo", label: "Typical condo" }, { key: "main", label: "Main homes" }],
  { caption: "The eight parts side by side: middle sale prices over the past year, from county deeds", nameLabel: "Part" }) + `</div>`;
must(r5k(HR.neck.median) === "$590,000" && r5k(HR.across.median) === "$480,000" && r5k(HR.cb.median) === "$410,000", "table rounding");

/* The day the listing count ran, from the data file (class 2026-11-03), never typed. */
const LIST_DAY = new Date(F.listings.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
must(r5k(LT.manufactured.median) === "$145,000", "row 15 manufactured rounding");
/* Round 4: the for-sale chart became one sentence. The homes strips in the entries show the homes themselves. */
const FORSALE = `At our last count, on ${LIST_DAY}, about ${Math.round(LT.house.n / 10) * 10} houses were for sale at a middle asking price of about ${r10k(LT.house.median)}, and about ${Math.round(LT.condo.n / 10) * 10} condos at about ${r10k(LT.condo.median)}.`;
must(FORSALE.includes("about 250 houses") && FORSALE.includes("$690,000") && FORSALE.includes("about 570 condos") && FORSALE.includes("$300,000"), "row 15 sentence changed");

/* ---------------------------------------------------------------------------- */
/* Photos (photos.json; each looked at full size, subject_check in its record).    */

const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}`)); must(r, `no photo record for ${name}`); return r; };
const PIER = rec("cherry-grove-from-above-2012-1200w"), CHANNELS = rec("cherry-grove-channels-from-above-1200w"),
  OD = rec("ocean-drive-main-street-from-above-1200w"), BAREFOOT = rec("barefoot-landing-waterway-from-above-1200w"), AB_PHOTO_REC = rec("atlantic-beach-between-from-above-1200w"),
  WH = rec("windy-hill-from-above-1200w"), W17 = rec("west-of-us-17-new-streets-from-above-1200w"), TIL = rec("tilghman-beach-from-above-1200w"),
  PAVILION = rec("ocean-drive-beach-pavilion-postcard-1941-1200w");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const photo = (r, caption) => lazy(PH.heroPhoto(r, { alt: r.alt, caption, maxWidth: "680px", sizes: "(max-width: 700px) 100vw, 680px" }));
/* Every caption gives the year the picture was taken (critic, round 1; rules/images.md: a NAIP caption carries its year). */
must(PIER.taken.startsWith("2012") && PAVILION.taken === "1941" && [CHANNELS, OD, BAREFOOT, AB_PHOTO_REC, WH, W17, TIL].every((r) => r.taken.startsWith("2023")), "photo years changed");
const PIER_PHOTO = photo(PIER, "Cherry Grove from a height in 2012: older low beach houses beside mid-rise condos, the marsh behind them, and Cherry Grove Pier.");
const CHANNELS_PHOTO = photo(CHANNELS, "Cherry Grove from above, 2023 aerial: houses on the dug channels, many with a dock behind them, the marsh, the boat ramp and Heritage Shores.");
const OD_PHOTO = photo(OD, "Ocean Drive from above, 2023 aerial: Main Street running back from the beach, McLean Park and its lake, and the condo towers along the ocean.");
const PAVILION_PHOTO = photo(PAVILION, PAVILION.caption);
const TIL_PHOTO = photo(TIL, TIL.caption), WH_PHOTO = photo(WH, WH.caption), W17_PHOTO = photo(W17, W17.caption);
/* Design pass 2026-11-08 (redo2/submarkets-north-myrtle-beach/DESIGN.md): on a wide screen an entry's aerial sits beside its text. */
const side = (html) => html.replace('<figure class="c3ph-hero"', '<figure class="c3ph-hero c3-nmb-side"');
const BAREFOOT_PHOTO = photo(BAREFOOT, "Barefoot Landing on the Intracoastal Waterway at US 17, 2023 aerial, with the neighborhoods across the waterway on the far bank.");
const AB_PHOTO = photo(AB_PHOTO_REC, "Atlantic Beach, outlined, is a separate town between Crescent Beach and Windy Hill, from US 17 to the ocean (2023 aerial).");
must([TIL, WH, W17].every((r) => /2023 aerial/.test(r.caption)) && /1941/.test(PAVILION.caption), "a new caption lost its year");
const SHOWN = [PIER, CHANNELS, TIL, OD, PAVILION, AB_PHOTO_REC, WH, W17, BAREFOOT];
/* Short names in the credits: the full captions sit under each photo, and the long list was a 1,300 px wall on a phone. */
const CREDIT_NAME = new Map([[PIER, "Cherry Grove and its pier from a height"], [CHANNELS, "Houses on the Cherry Grove channels, from above"],
  [OD, "Ocean Drive and Main Street, from above"], [AB_PHOTO_REC, "Atlantic Beach between Crescent Beach and Windy Hill, from above"],
  [BAREFOOT, "Barefoot Landing on the Intracoastal Waterway, from above"], [TIL, "Tilghman Beach, from above"], [WH, "Windy Hill, from above"],
  [W17, "West of US 17 and Central Park, from above"], [PAVILION, "The pavilion at Ocean Drive Beach, on a postcard"]]);
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: CREDIT_NAME.get(p) })));

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const CSS = `<style>
main#main .c3-nmb-fig{margin:1.6rem 0 1.8rem;max-width:720px}
main#main .c3-nmb-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.65rem}
main#main .c3-nmb-frame{border-radius:18px;overflow:hidden;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.08)}
main#main .c3-nmb-frame img,main#main .c3-nmb-frame svg{display:block;width:100%;height:auto}
main#main .c3-nmb-list{max-width:720px;margin:1.4rem 0 2rem}
main#main .c3-nmb-grp{margin:1.3rem 0 .35rem!important;font:700 .78rem/1.3 var(--sans)!important;letter-spacing:.09em;text-transform:uppercase;color:var(--g-ink,#8a5226)!important}
main#main .c3-nmb-list ul{list-style:none;margin:0;padding:0}
main#main .c3-nmb-list li{display:grid;grid-template-columns:11.5rem minmax(0,1fr);column-gap:1.2rem;align-items:baseline;margin:0;padding:.7rem 0;border-top:1px solid rgba(28,32,40,.16);font-size:1.05rem;line-height:1.45;color:var(--muted)}
main#main .c3-nmb-list li:last-child{border-bottom:1px solid rgba(28,32,40,.16)}
main#main .c3-nmb-list a,main#main .c3-nmb-list b{color:var(--navy);font-weight:600}
main#main .c3-nmb-list li.c3-nmb-ab{font-size:.95rem;padding:.45rem 0}main#main .c3-nmb-list li.c3-nmb-ab b{font-weight:500;color:var(--muted)}
@media (max-width:559px){main#main .c3-nmb-list li{grid-template-columns:1fr;row-gap:.15rem}}
main#main ul.c3-nmb-cal{list-style:none;margin:.2rem 0 1.4rem;padding:0;max-width:640px}
main#main ul.c3-nmb-cal li{margin:0;padding:.75rem 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.65}
main#main ul.c3-nmb-cal li:last-child{border-bottom:1px solid rgba(28,32,40,.16)}main#main ul.c3-nmb-cal strong{color:var(--navy)}
main#main .c3-nmb-entry+.hx-strip,main#main .c3-nmb-entry+.hx-strip+.hx-fallback{margin-bottom:2.2rem}
main#main h2,main#main h3{text-wrap:balance}
main#main .c3ph-hero img{aspect-ratio:auto!important}
main#main .c3-nmb-steps{list-style:none;counter-reset:s;margin:1.2rem 0 1.4rem;padding:0;display:grid;gap:.7rem;max-width:720px}
main#main .c3-nmb-steps li{counter-increment:s;position:relative;margin:0;padding:.9rem 1rem .9rem 3.4rem;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.8);box-shadow:0 6px 18px rgba(28,32,40,.07);color:var(--muted);line-height:1.6}
main#main .c3-nmb-steps li::before{content:counter(s);position:absolute;left:1rem;top:.9rem;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--navy);color:#fff;font:700 .9rem/1.7rem var(--sans);text-align:center}
main#main .c3-nmb-steps strong{color:var(--navy)}
main#main .c3-nmb-ex{max-width:720px;margin:1.2rem 0 1.4rem;padding:1rem 1.2rem;border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 6px 18px rgba(28,32,40,.07);color:var(--muted);line-height:1.65}
main#main .c3-nmb-ex strong{color:var(--navy)}
@media (max-width:359px){main#main .c3-glance span.t{font-size:.92rem}main#main .c3-glance strong{font-size:.8rem}}
main#main .c3-glance li>span{min-width:0;max-width:100%}main#main .c3-glance span.t,main#main .c3-glance strong{overflow-wrap:break-word}
@media (min-width:1000px){main#main h3.c3-nmb-h3{font-size:1.65rem!important;margin-top:2.6rem!important}}
@media (min-width:700px){main#main .c3-cc td{white-space:nowrap}}
main#main .c3-pc{align-items:stretch}
@media (max-width:799px){main#main .c3-nmb-parts .c3-cc tbody tr{display:grid!important;grid-template-columns:1fr 1fr;column-gap:.5rem;row-gap:.45rem;padding:.5rem 0 .7rem}main#main .c3-nmb-parts .c3-cc tbody th{grid-column:1/-1}main#main .c3-nmb-parts .c3-cc td{padding:.1rem .9rem}main#main .c3-nmb-parts .c3-cc td[data-label]::before{content:attr(data-label);display:block;font-size:.9rem;line-height:1.3;color:var(--navy);font-weight:500}}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}
</style>`;

/* Design pass, 2026-11-08 (redo2/submarkets-north-myrtle-beach/DESIGN.md), as on the approved condo and HOA lien pages:
   a two-line headline, the contents in columns, one card style (the maps, the charts and the offers), plain tables and
   lists, photos without frames, one block width of 720 px, and on a wide screen each entry's aerial beside its text. */
const M = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const DESIGN_CSS = "<style>"
  /* 1. The headline: the italic line at about half the H1's size; on a phone the tiles are short rows under hairlines. */
  + `@media (min-width:700px){${M} .detail-h1{text-wrap:balance}}${M} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${M} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${M} .c3-glance li{line-height:1.4}${M} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${M} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${M} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${M} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* Four tiles: two short rows of two on most phones, so the byline and the opening line stay on the first screen. */
  + `@media (min-width:360px) and (max-width:699px){${M} .c3-glance{grid-template-columns:1fr 1fr!important;column-gap:1rem!important}${M} .c3-glance li:nth-last-child(2){border-bottom:${RULE}!important}}`
  /* 2. The contents: no card, in columns between two rules. */
  + `${M} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${M} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${M} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}${M} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}`
  /* 3. One card style. Photos without a frame; the maps keep one card, with no frame inside it. */
  + `${M} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${M} figure.c3ph-hero figcaption{padding:0!important}`
  + `${M} .c3-nmb-frame{background:none!important;border:0!important;box-shadow:none!important;border-radius:12px!important}`
  /* Tables: plain, under thin rules; on a phone, plain rows split by a rule. */
  + `${M} .c3-cc{${FLAT};padding:0!important}${M} .c3-cc thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${M} .c3-cc th:first-child,${M} .c3-cc td:first-child{padding-left:0}`
  + `@media (max-width:39.999em){${M} .c3-cc tbody tr{${FLAT};border-top:${RULE}!important;margin:0!important;padding:.7rem 0 .75rem!important}`
  + `${M} .c3-cc tbody tr:last-child{border-bottom:${RULE}!important}${M} .c3-cc th,${M} .c3-cc td{padding-left:0!important;padding-right:0!important}}`
  + `@media (max-width:799px){${M} .c3-nmb-parts .c3-cc tbody tr{${FLAT};border-top:${RULE}!important;margin:0!important}${M} .c3-nmb-parts .c3-cc tbody tr:last-child{border-bottom:${RULE}!important}${M} .c3-nmb-parts .c3-cc th,${M} .c3-nmb-parts .c3-cc td{padding-left:0!important;padding-right:0!important}}`
  /* The five rental rules: one list split by rules, the number dots kept; the example keeps a brass rule, not a box. */
  + `${M} ol.c3-nmb-steps{gap:0!important}${M} ol.c3-nmb-steps li{${FLAT};border-top:${RULE}!important;padding:.85rem 0 .85rem 2.6rem!important}${M} ol.c3-nmb-steps li:last-child{border-bottom:${RULE}!important}${M} ol.c3-nmb-steps li::before{left:0!important;top:.95rem!important}`
  + `${M} .c3-nmb-ex{${FLAT};border-left:3px solid var(--brass)!important;padding:.2rem 0 .2rem 1.2rem!important}`
  /* The pros and cons: two plain columns, each under a brass rule. */
  + `${M} .c3-pc>div{${FLAT};border-top:2px solid var(--brass)!important;padding:.9rem 0 0!important}${M} .c3-pc{column-gap:2.5rem!important}`
  /* 4. One block width. */
  + `${M} .c3-cc,${M} .c3-gchart,${M} figure.c3-nmb-fig,${M} ol.c3-nmb-steps,${M} .c3-nmb-ex,${M} .c3-pc{max-width:720px!important;box-sizing:border-box}`
  /* 5. On a wide screen, an entry's aerial sits to the right of its text, from its first paragraph down. */
  + `@media (min-width:1180px){${M} .c3-nmb-entry{display:grid;grid-template-columns:minmax(0,640px) minmax(0,1fr);grid-template-rows:repeat(14,auto) 1fr;column-gap:2.5rem;align-items:start;margin:2.6rem 0 2rem}`
  + `${M} .c3-nmb-entry>*{grid-column:1}${M} .c3-nmb-entry>h3.c3-nmb-h3{margin-top:0!important;grid-column:1/-1}`
  + `${M} .c3-nmb-entry>figure.c3-nmb-side{grid-column:2;grid-row:2/-1;margin:.35rem 0 0!important;max-width:none!important}}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const CENSUS = "https://data.census.gov/profile/North_Myrtle_Beach_city,_South_Carolina?g=160XX00US4551280";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const USC4012A = "https://www.law.cornell.edu/uscode/text/42/4012a";
const SENATE = "https://www.scstatehouse.gov/sess117_2007-2008/prever/1325_20080423.htm";
const T1_1 = "https://www.scstatehouse.gov/code/t01c001.php";
const SCE = "https://www.scencyclopedia.org/sce/entries/north-myrtle-beach/";
const STR = "https://www.parks.nmb.us/833/Short-term-Rentals";
const STR_RULES = "https://www.parks.nmb.us/DocumentCenter/View/5580/Short-term-Rental-Rules";
const BEACH = "https://www.parks.nmb.us/249/Beach-Laws";
const GOLFCART = "https://www.parks.nmb.us/600/Golf-Cart-Laws";
const PARKS = "https://www.parks.nmb.us/473/Parks";
const SCDOR = "https://dor.sc.gov/tax/accommodations";
const COUNTY_FEE = "https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/";
const HCS = "https://www.horrycountyschools.net/about-hcs/our-schools";

/* Round 4: the sources of the selling sentences, by part (facts.md rows 52 to 64), as on /buyers/relocating/which-town/.
   The main sources line keeps its 90-word limit. */
const SRC_LINK = 'style="color:var(--navy);text-decoration:underline" target="_blank" rel="noopener noreferrer"';
const PART_SOURCES = [
  ["The whole beach", [["Sea Turtle Patrol", "https://nmbturtle.blogspot.com/p/faqs.html"], ["first 2026 nest", "https://nmbturtle.blogspot.com/2026/05/1st-loggerhead-endangered-sea-turtle.html"]]],
  ["Cherry Grove", [["Cherry Grove Pier", "https://cherrygrovepier.com/the-pier/"], ["the pier's record", "https://cherrygrovepier.com/"], ["the city's Fourth of July fireworks", "https://www.nmb.us/m/newsflash/Home/Detail/1555"],
    ["MyHorryNews on Waties Island", "https://www.myhorrynews.com/news/getting-off-the-beaten-path-at-inlet-plantation-stables-and-waties-island/article_d1d46858-b162-4b95-9f7b-10f8081e6159.html"]]],
  ["Ocean Drive", [["Fat Harold's", "https://www.fatharolds.com/"], ["SOS", "https://www.fatharolds.com/sos-2/"], ["Carolina Beach Music Awards", "https://www.cammy.org/"], ["the city's St. Patrick's Day parade", "https://www.nmb.us/411/St-Patricks-Day-Parade-Festival"]]],
  ["Windy Hill", [["MyHorryNews on George Washington", "https://www.myhorrynews.com/opinion/yes-president-george-washington-did-sleep-in-horry-county/article_2f0b6f46-1e58-11ed-97e3-9fb8590a30fd.html"]]],
  ["Little River Neck", [["MyHorryNews on the stables", "https://www.myhorrynews.com/news/getting-off-the-beaten-path-at-inlet-plantation-stables-and-waties-island/article_d1d46858-b162-4b95-9f7b-10f8081e6159.html"], ["Open Space Institute", "https://www.openspaceinstitute.org/stories/a-small-south-carolina-island-with-a-big-impact"]]],
  ["West of US 17", [["fireworks schedule (Vacation Myrtle Beach)", "https://www.vacationmyrtlebeach.com/blog/myrtle-beach-fireworks-schedule/"]]],
  ["Across the waterway", [["Barefoot Resort community", "https://barefootgolf.com/community/"], ["Norman course", "https://barefootgolf.com/golf/norman-course/"]]],
];
const PART_SRC = `<div style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:.6rem"><strong style="color:var(--navy)">Sources by part:</strong> `
  + PART_SOURCES.map(([t, ls]) => `${t}: ` + ls.map(([nm, u]) => `<a href="${u}" ${SRC_LINK}>${nm}</a>`).join(", ")).join(". ") + `.</div>`;

/* ---------------------------------------------------------------------------- */
/* The offers and the entries.                                                    */

const partH3 = (p, tail) => `<h3 id="${p.id}" data-toc="${p.name}" class="c3-nmb-h3" style="font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:2rem 0 .6rem;line-height:1.3">${p.name}: ${tail}</h3>`;
const ask = (p, label) => G.offer(p.name, { label });
/* Round 4: a homes strip per part (owner, 2026-11-08: "horizontal idx listings is the strongest tool we have"). The places are
   nmb-<id> in idx-places.json: a short "near" search that stays inside the part, index false. The old pill is the fallback,
   shown only while the strip is empty. */
const STRIP_NAME = { west17: "North Myrtle Beach west of US 17", across: "North Myrtle Beach across the waterway" };
const STRIP_HEAD = { west17: "Homes for sale west of US 17 now", across: "Homes for sale across the waterway now" };
const homesFor = (p, label) => G.homes(`nmb-${p.id}`, STRIP_NAME[p.key] || p.name, ask(p, label), STRIP_HEAD[p.key] || "");
const mid = (k) => r5k(HR[k].median);

const GOLF = "https://www.barefootgolf.com/";
const CFR64 = "https://www.ecfr.gov/current/title-44/chapter-I/subchapter-B/part-64/section-64.3";
const nb = (t) => t.replace(/ /g, " ");

/* Round 1 order (owner): the parts come first, right after the short answer; "Living here" is short and follows them;
   golf carts, dogs, schools and safety live in the FAQ only. */
module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  pageImages: () => PH.pageImages(PIER),
  title: "Living in North Myrtle Beach, SC: Sections, Prices, Flood",
  description: "Living in North Myrtle Beach, SC: its eight parts and who each suits, what homes sell for, the flood zone, the yearly cost, and the rental rules.",
  ogTitle: "North Myrtle Beach, SC: which of its eight parts suits you, and what each costs",
  crumb: "North Myrtle Beach",
  eyebrow: "North Myrtle Beach, SC",
  h1: "North Myrtle Beach real estate: nine miles of beach, eight different markets.",
  h1em: "A dock behind the house in Cherry Grove, shag nights on Main Street, golf across the waterway.",
  sub: "Its own city at the north end of the Grand Strand, made from four beach towns in 1968, with its own rental rules and city tax.",
  heroMedia: glance([
    { icon: "beach", label: "Beach", text: "About 9 miles" },
    { icon: "boat", label: "Channel houses", text: `About ${n(Math.round(CH.n / 10) * 10)}` },
    { icon: "golf", label: "Barefoot golf", text: "4 courses" },
    { icon: "key", label: "Nightly rentals", text: "City license" },
  ]),
  heroCta: { title: "See homes for sale in North Myrtle Beach", label: "Send me North Myrtle Beach homes", href: "/contact/" },
  topOfferLine: "Tell us how you will use the home. We will send the parts and houses that fit.",
  author: "devin",
  shortAnswer: [
    `North Myrtle Beach has about nine miles of beach and eight parts, each suited to a different buyer. For a boat behind the house, look in Cherry Grove. For Main Street and a maritime forest, look in Ocean Drive. For a house near the ocean for less, look in Crescent Beach or Windy Hill. For newer houses and little flood zone, look across the waterway or west of US 17.`,
    `A typical resold house sold for about ${HOUSE} in the past year, from about ${mid("cb")} in Crescent Beach to ${mid("til")} in Tilghman Beach. Nightly rentals need a yearly city business license, with no special rental zoning or permit.`,
  ],
  sections: [
    { h2: "Which part of North Myrtle Beach should you look in?", toc: "The eight parts", id: "parts", html: () =>
      CSS + DESIGN_CSS + G.homesCss() +
      h.p(`The city has eight parts a buyer can tell apart, and each gives you something the others do not. Five run along the ocean; the other three lie inland. Under each one are the homes for sale there now.`) +
      PARTS_LIST +

      `<div class="c3-nmb-entry">` + partH3(PART.cg, "a dock behind the house, and a pier at sunrise") +
      h.p(`Cherry Grove is the part for a boat at the back door. Channels were dug into its marsh in the 1970s, and about ${n(Math.round(CH.n / 10) * 10)} houses now back onto them or the marsh edge. Many have ${h.a("/buyers/waterfront-homes/", "a dock behind the house")}, and boats reach the ocean through Hog Inlet.`) +
      side(CHANNELS_PHOTO) +
      h.p(`From the city's boat ramp on 53rd Avenue North, you can paddle a kayak about a mile and a half through Hog Inlet, past pelicans and ospreys, to the empty beach on Waties Island. People walk the shore there looking for shells and fossil shark teeth, including megalodon teeth.`) +
      h.p(`Walk 985 feet out on Cherry Grove Pier to the two-story deck at the end, where people watch the sun rise over the ocean and look for dolphins, then eat at the Driftwood restaurant on the pier. In 1964 a fisherman landed a 1,780-pound tiger shark from this pier, and the pier still lists it as a world record.`) +
      PIER_PHOTO +
      h.p(`On the Fourth of July, the city puts on a free fireworks show over the ocean at the pier. People carry beach chairs onto the sand to watch it, after checking the tide. Heritage Shores Nature Preserve has walking paths on an island in the marsh, and the Russell Burgess Coastal Preserve has a boardwalk.`) +
      h.p(`A house on the channels resold for about ${r5k(S.house_resale_channel.median)} at the middle (${S.house_resale_channel.n} sales), and elsewhere in Cherry Grove about ${r5k(S.house_resale_cg_not_channel.median)}. The trade-off is flood insurance: almost every house here is in FEMA's high-risk flood zone, channel houses included. Only about 1 in 4 houses is the owner's main home.`) +
      `</div>` + homesFor(PART.cg, "Send me homes in Cherry Grove") +

      `<div class="c3-nmb-entry">` + partH3(PART.til, "houses by the ocean, most of them main homes") +
      h.p(`Tilghman Beach suits a buyer who wants a house by the ocean among owners who make it their main home. About 2 in 3 houses here are, the most of any beach part.`) +
      side(TIL_PHOTO) +
      h.p(`From about May to mid-August, loggerhead turtles about three feet long come up this sand at night and lay about 120 eggs each. Volunteers from the Sea Turtle Patrol watch over and protect the nests, and 45 to 65 days later the hatchlings dig out at night and head for the moonlit water.`) +
      h.p(`Tilghman Beach grew from one large tract that Charles T. Tilghman Jr. developed in 1948. Its houses sell for the most of any part. In Tilghman Estates, its largest neighborhood, the middle of 19 house resales was about $1.05 million. Seabrook Plantation resold for about $750,000, the middle of 9 sales.`) +
      h.p(`Most of its homes in the flood zone are condos, not houses.`) +
      `</div>` + homesFor(PART.til, "Send me homes in Tilghman Beach") +

      `<div class="c3-nmb-entry">` + partH3(PART.od, "Main Street and its shag clubs") +
      h.p(`Ocean Drive is the part with Main Street, which runs back from the ocean. McLean Park, built around a small lake, is about a 5-minute walk from it.`) +
      side(OD_PHOTO) +
      h.p(`The shag is South Carolina's state dance. In the old beach towns of Ocean Drive and Crescent Beach, a pavilion and amusement park drew crowds to dance it.`) +
      PAVILION_PHOTO +
      h.p(`It is still danced on Main Street, all year:`) +
      `<ul class="c3-nmb-cal">`
        + `<li><strong>Every night.</strong> At Fat Harold's Beach Club, a DJ plays beach music from 7. Couples take shag lessons on Monday nights, and Tuesday night is for learning the state dance.</li>`
        + `<li><strong>January, April and September.</strong> Thousands of shag dancers fill the clubs on Main Street for the Society of Stranders: Midwinter Break, Spring Safari and Fall Migration.</li>`
        + `<li><strong>March.</strong> People set up beach chairs and golf carts along Main Street by 8:30 a.m. for a St. Patrick's Day parade of more than 100 entries, then stay for a free festival until 4.</li>`
        + `<li><strong>November.</strong> The Carolina Beach Music Awards weekend brings beach music bands to the stages of the shag clubs.</li>`
        + `</ul>` +
      h.p(`The Ingram Dunes Nature Preserve, which the city calls its last maritime forest, has dunes 30 feet tall and a half-mile trail. Houses in the Ingram Beach neighborhood resold for about $1.35 million at the middle (12 sales).`) +
      h.p(`Prices here spread wide: the middle half of house resales ran from about ${r5k(HR.od.p25)} to ${r5k(HR.od.p75)}. Most of its homes in the flood zone are oceanfront condos; about 1 in 10 houses is in it.`) +
      `</div>` + homesFor(PART.od, "Send me homes in Ocean Drive") +

      `<div class="c3-nmb-entry">` + partH3(PART.cb, "a house near the ocean for less") +
      h.p(`Crescent Beach suits a buyer who wants a house near the ocean at a lower price. Its houses resold for the least of the beach parts, and only about 1 house in 100 is in the flood zone, the fewest of the beach parts.`) +
      h.p(`The loggerheads nest on this beach too, and the Sea Turtle Patrol's volunteers watch over the nests until the hatchlings head for the water.`) +
      h.p(`Houses on the original Crescent Beach lots resold for more. The county records those lots under two names, and their middle prices were about $665,000 and $718,000.`) +
      h.p(`The 18th and Edge pocket park is its own small green space. Crescent Beach ends at Atlantic Beach, a separate town that did not join the city.`) +
      side(AB_PHOTO) +
      `</div>` + homesFor(PART.cb, "Send me homes in Crescent Beach") +

      `<div class="c3-nmb-entry">` + partH3(PART.wh, "beach houses south of Atlantic Beach") +
      h.p(`Windy Hill suits a buyer who wants a beach house at one of the lower prices by the ocean. Local history says it got its name in 1791, when George Washington rode this stretch of beach on a windy day and his hat kept blowing off.`) +
      side(WH_PHOTO) +
      h.p(`Investors from Conway built it up after World War II. Houses on the original Windy Hill Beach lots resold for about $439,000 at the middle (10 sales). Most of its houses are outside the flood zone; most of its condos are in it.`) +
      h.p(`Yow Park and the 41st Avenue South pocket park are its neighborhood parks.`) +
      `</div>` + homesFor(PART.wh, "Send me homes in Windy Hill") +

      `<div class="c3-nmb-entry">` + partH3(PART.neck, "woods and trail rides north of the marsh") +
      h.p(`Little River Neck suits a buyer who wants a house among owners who live there. It lies north of the Cherry Grove marsh, along Little River Neck Road.`) +
      h.p(`Inlet Point Plantation Stables is two miles down a one-lane dirt road through the woods. From there, an hour-long trail ride passes deer, wild turkeys and an alligator sunning by a lake, follows the Intracoastal Waterway across from Calabash, and ends at the marsh behind Waties Island.`) +
      h.p(`The Open Space Institute has bought more than 600 acres on and around Waties Island and the mainland at Little River Neck. The state plans to make parts of it a new state park and parts a Heritage Trust preserve, open to the public.`) +
      h.p(`Tidewater Plantation is its largest neighborhood, and about 8 in 10 of its houses are the owner's main home. Builders are still selling new houses here: ${NB.neck} in the past year. The Neck also holds most of the city's manufactured homes, about ${n(Math.round(HA.neck.by_kind.manufactured / 10) * 10)} of ${n(Math.round(F.homes.by_kind.manufactured / 100) * 100)}.`) +
      `</div>` + homesFor(PART.neck, "Send me homes in Little River Neck") +

      `<div class="c3-nmb-entry">` + partH3(PART.west17, "newer houses a few minutes from the beach") +
      h.p(`West of US 17 suits a buyer who wants a newer house close to the beach, with little flood zone. From a typical house here, the drive to Ocean Boulevard is about ${B_WEST} minutes.`) +
      side(W17_PHOTO) +
      h.p(`Every Monday night in summer, Barefoot Landing, on the waterway at US 17, has a fireworks show at 10 p.m.`) +
      h.p(`Builders sold ${NB.west17} new houses here in the past year, and the city's 20-acre Central Park is in this part. Chestnut Greens is the largest neighborhood, and its houses resold for about $515,000 at the middle.`) +
      h.p(`Sunset Harbour resold for about $760,000 (9 sales), but ${sub("west17", "SUNSET HARBOUR").in_sfha} of its homes are in the high-risk flood zone. Condos here cost the least in the city, about ${r5k(SA.west17.condo.median)} at the middle.`) +
      `</div>` + homesFor(PART.west17, "Send me homes west of US 17") +

      `<div class="c3-nmb-entry">` + partH3(PART.across, "golf, newer houses and almost no flood zone") +
      h.p(`Across the Intracoastal Waterway suits a buyer who wants golf, a newer house and almost no flood zone: 2 homes of about ${n(Math.round(HA.across.n / 100) * 100)} are in it. More of the city's new houses sold here than anywhere else.`) +
      h.p(`Barefoot Resort's four golf courses were designed by Greg Norman, Davis Love III, Tom Fazio and Pete Dye. Seven holes of the Norman course run along the waterway, and the resort has a deep-water marina with a bar and grill on the water.`) +
      side(BAREFOOT_PHOTO) +
      h.p(`Barefoot Landing, the shops and restaurants on the waterway at US 17, is about ${D_BAREFOOT} minutes by car from Main Street. From a typical house here, the drive to Ocean Boulevard is about ${B_ACROSS} minutes.`) +
      h.p(`Houses in Grande Dunes North resold for about $374,000 at the middle, and in Waterside for about $385,000. We pull the HOA papers and fees for any house here.`) +
      `</div>` + homesFor(PART.across, "Send me homes across the waterway") +
      /* Owner's eye, 2026-11-04: the table moved after the eight entries, so the first place starts right after the map. */
      h.h3("The eight parts side by side") +
      PARTS_TABLE +
      h.p(`The last column shows how many houses are the owner's main home. Where that share is low, more houses are second homes or rentals, and fewer people live there all year.`) },

    { h2: "What is North Myrtle Beach like to live in?", toc: "Living here", id: "living-here", html: () =>
      h.p(`North Myrtle Beach has about nine miles of ocean beach, running south-west from Hog Inlet. Cherry Grove, Ocean Drive, Crescent Beach and Windy Hill voted to become one city in 1968.`) +
      h.p(`From the 1970s, condo and hotel towers began replacing houses on the oceanfront. Today condos outnumber houses about 3 to 2.`) +
      h.p(`About ${n(Math.round(P2020 / 100) * 100)} people lived in the city at the 2020 Census, about ${GROWTH} percent more than in 2010. Close to half its homes were kept for seasonal or vacation use. Our ${h.a("/submarkets/little-river/#living-here", "Little River guide")} compares that share with the towns nearby.`) +
      h.h3("How is North Myrtle Beach different from Myrtle Beach?") +
      h.p(`North Myrtle Beach is not part of Myrtle Beach. It is a separate city in Horry County, with its own city tax and its own rules for nightly rentals. The Myrtle Beach oceanfront, at the SkyWheel, is about ${D_SKYWHEEL} minutes south by car without traffic.`) +
      h.p(`The map shows the drives from Main Street to the pier, McLeod Seacoast hospital and Barefoot Landing. The airport is about ${D_AIRPORT} minutes away and Grand Strand Medical Center about ${D_GSMC}. Summer traffic on US 17 makes those drives longer.`) +
      DRIVE_MAP },

    { h2: "What do homes cost in North Myrtle Beach?", toc: "Prices", id: "prices", html: (bg) =>
      h.p(`A typical resold house in North Myrtle Beach sold for about ${HOUSE} in the past year; half sold between about ${r5k(S.house_resale.p25)} and ${r5k(S.house_resale.p75)}. A condo sold for about ${CONDO}, and a new house from a builder for about ${NEW_HOUSE}.`) +
      h.p(`Condos sell for about the same in every part along the ocean, about $310,000 to $360,000. Houses differ by part far more. More than half the homes sold here in the past year went to a buyer whose tax bill goes to another state.`) +
      h.h3("Homes for sale now") +
      h.p(`${FORSALE} The homes for sale now in each part are under its entry in ${h.a("#parts", "the eight parts")}.`) +
      h.cta("Know what a house is worth before you offer", "Send us the address. An agent pulls what nearby homes like it sold for in the past year and tells you what the house is worth, with those sales behind it.", "Have us value a house", "/contact/", bg) },

    { h2: "Does North Myrtle Beach flood?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`About 1 in 3 homes in North Myrtle Beach is in FEMA's high-risk flood zone, more of them condos than houses. The part you choose decides most of it.`) +
      FLOOD_CHART +
      h.p(`The high-risk zone has two kinds here. The VE zone is the oceanfront, where storm waves add to the flood; the A zones are the rest of it.`) +
      h.h3("Do you need flood insurance in North Myrtle Beach?") +
      h.p(`A federally regulated lender must require flood insurance when the building is in FEMA's high-risk zone, and any lender can ask for it elsewhere. In ZIP code 29582, which covers most of the city, a federal flood policy on a house usually cost:`) +
      compareCards([
        { name: "Outside the flood zone", cells: { cost: `About ${POL_X}` } },
        { name: "In the flood zone, back from the ocean (A zone)", cells: { cost: `About ${POL_A}` } },
        { name: "In the flood zone on the oceanfront, where waves reach (VE zone)", cells: { cost: `About ${POL_V}` } },
      ], [{ key: "cost", label: "A year, at the middle" }], { caption: "A federal flood policy on a house in ZIP code 29582", nameLabel: "Where the house is" }) +
      h.p(`A new policy takes effect 30 days after you apply and pay; it can start sooner when you buy it with your home loan.`) +
      h.p(`Outside the zone is not the same as never flooded. Our page on ${h.a("/buyers/undisclosed-flooding/", "how to find out if a house flooded")} shows every record we use, and our ${h.a("/buyers/coastal-insurance/", "coastal insurance page")} explains each policy.`) +
      h.cta("Find out a house's flood risk before you offer", "Send us the address. We check its flood zone, its elevation and its flood history, and tell you whether a lender must require flood insurance.", "Have us check a house's flood zone", "/contact/", bg) },

    { h2: "What does a home in North Myrtle Beach cost to own each year?", toc: "Yearly cost", id: "yearly-cost", html: () =>
      h.p(`A typical house you live in costs about ${yr(YR_HOUSE_HOME)} a year to own, before any mortgage. A typical condo costs more, about ${yr(YR_CONDO_HOME)}, because of the condo fee.`) +
      compareCards([
        { name: "Property tax", cells: { house: `About ${TAX_HOME}`, condo: `About ${r100(TX.condo.as_home)}` } },
        { name: "Home insurance", cells: { house: `About ${money(INS_HOUSE)}`, condo: `About ${money(INS_CONDO)}` } },
        { name: "Flood policy, outside the flood zone", cells: { house: `About ${POL_X}`, condo: "Not counted" } },
        { name: "HOA or condo fee", cells: { house: "None on about half", condo: `About ${money(FEE_MO * 12)}` } },
        { name: "Upkeep", cells: { house: `About ${r100(UPKEEP_HOUSE)}`, condo: `About ${r100(UPKEEP_CONDO)}` } },
        { name: "Together", cells: { house: `About ${yr(YR_HOUSE_HOME)}`, condo: `About ${yr(YR_CONDO_HOME)}` } },
      ], [{ key: "house", label: `House, about ${HOUSE}` }, { key: "condo", label: `Condo, about ${CONDO}` }], { caption: "Each year, as your home, before any mortgage", nameLabel: "What you pay" }) +
      h.p(`As a second home or rental, the tax is three times as much. The house then costs about ${yr(YR_HOUSE_RENT)} a year and the condo about ${yr(YR_CONDO_RENT)}, if the other costs stay the same.`) +
      h.p(`The tax is on the county's value of the home, and a sale resets that value toward the price you pay. You must apply for the lower rate on a home you live in; our ${h.a("/buyers/property-taxes/", "property tax page")} shows how.`) +
      h.h3("Where the other figures come from") +
      h.p(`Home insurance is the middle that Horry County owners pay for a house they live in; half pay between about $1,300 and $3,000. On the beach side of US 17, an insurer may leave wind and hail out of a policy. The owner can then buy that cover separately, for example from the state's wind and hail association.`) +
      h.p(`The condo fee is the middle fee of condos for sale in ZIP code 29582, about ${money(FEE_MO)} a month. It may also pay the insurance on the shared building. About half the houses for sale in that ZIP code list no HOA fee.`) +
      h.p(`Upkeep is the average owners spend a year in the South Atlantic states. If you buy with us, we get you an insurance quote for the address before you make an offer. Our ${h.a("/buyers/cost-to-own/", "cost to own page")} compares the towns nearby.`) },

    { h2: "Can you rent out a home by the night in North Myrtle Beach?", toc: "Renting it out", id: "renting", html: (bg) =>
      h.p(`Yes, with a city business license. Every short-term rental in the city needs one, renewed each year, and must collect lodging taxes. The city has no special zoning or rental permit beyond the license.`) +
      h.p(`An HOA or the deed can still bar rentals, and we read the HOA's rules and the deed before you offer. A rental owner here has five things to get right:`) +
      `<ol class="c3-nmb-steps">`
        + `<li><strong>The license.</strong> A city business license, renewed every year.</li>`
        + `<li><strong>The parking number.</strong> When you apply or renew, you report the parking spaces on the property's own land. That number is the most cars guests can park there. It goes in every ad and rental agreement and is posted inside. Where an HOA or the deed limits parking, the owner certifies the number matches.</li>`
        + `<li><strong>The lodging taxes.</strong> Guests pay 12 percent on a stay under 90 days, split between the state, the city and the county.</li>`
        + `<li><strong>The trash days.</strong> The city collects a rental's trash on its regular day plus Friday, Saturday and Sunday. Recycling goes out only on the regular day.</li>`
        + `<li><strong>The quiet hours.</strong> They run from 11 p.m. to 7 a.m., and fireworks are banned everywhere in the city, with a $310 ticket for a first offense.</li>`
        + `</ol>` +
      `<div class="c3-nmb-ex"><strong>Example.</strong> On a $${n(LX.rent)} week, a guest pays about $${LX.total_12pct} in lodging taxes, which the owner collects and pays to the state, the city and the county.</div>` +
      h.h3("Is North Myrtle Beach changing its rental rules?") +
      h.p(`The city has held workshops and public sessions on possible new short-term rental rules. Its rental page lists no new rental ordinance adopted, and the license rule is the one in force. Earlier tries, a moratorium on large rental houses and a draft ordinance, failed.`) +
      h.p(`Our pages on ${h.a("/invest/str-rules/", "short-term rental rules by town")}, ${h.a("/invest/accommodations-tax/", "filing the lodging taxes")} and ${h.a("/invest/airbnb-income/", "what a nightly rental earns")} go further.`) +
      h.cta("Know a building's rental rules before you offer", "Send us the condo or the house. We read the HOA's rules and the deed for rental limits, and count the parking spaces the city will ask for.", "Have us read the rental rules", "/contact/", bg) },

    { h2: "What are the pros and cons of living in North Myrtle Beach?", toc: "Pros and cons", id: "pros-and-cons", html: (bg) =>
      h.p("The good points are the beach, the water, the golf and the choice of parts. The hard ones are the flood zone at the north end, the condo fees, and how few houses by the ocean are main homes.") +
      prosCons([
        "About nine miles of beach, Main Street at Ocean Drive, and the marsh parks and boat ramp at Cherry Grove.",
        "Houses on the Cherry Grove channels, with water behind the house.",
        "Four golf courses at Barefoot Resort, across the waterway.",
        `Almost no flood zone across the waterway, and about ${Math.round(FA.west17.all.pct_sfha)} in 100 homes west of US 17.`,
      ], [
        { text: "Cherry Grove is almost all in the high-risk flood zone, and its flood policies cost more.", act: "We check the flood zone, the elevation and the flood history before you offer." },
        { text: "Most houses by the ocean are second homes or rentals, and fewer neighbors live there all year.", act: "Inland, about 3 in 4 houses are the owner's main home." },
        { text: `Condo fees are high: the middle condo for sale lists about ${money(FEE_MO)} a month.`, act: "We read the condo's budget and rules before you offer." },
        { text: `Summer traffic on US 17 slows every drive.`, act: "We time the drives from any house you like." },
      ], { bg }) },
  ],
  faqTitle: "North Myrtle Beach FAQ",
  faq: [
    { q: "Is North Myrtle Beach part of Myrtle Beach?", a: `No. North Myrtle Beach is its own city in Horry County, South Carolina. Four beach towns joined to form it in 1968, and it has its own city tax and rental rules. The Myrtle Beach oceanfront is about ${D_SKYWHEEL} minutes south by car.` },
    { q: "What are the sections of North Myrtle Beach?", a: "The four old beach towns are Cherry Grove, Ocean Drive, Crescent Beach and Windy Hill. Tilghman Beach, Little River Neck, the mainland west of US 17 and the neighborhoods across the waterway make eight parts." },
    { q: "Can you drive a golf cart in North Myrtle Beach?", a: "Yes, from sunrise to sunset, on city streets posted 35 mph or less, with a state permit sticker from the DMV and a licensed driver. A cart may cross Ocean Boulevard, 27th Avenue South, US 17 and Sea Mountain Highway, but not drive along them." },
    { q: "Are dogs allowed on the beach in North Myrtle Beach?", a: "Yes, on a leash. From May 15 to Labor Day they must be off the beach from 10 a.m. to 4 p.m. In that season the beach takes umbrellas only, no tents or canopies." },
    { q: "What does it cost to own a home in North Myrtle Beach each year?", a: `As your home, before any mortgage, about ${yr(YR_HOUSE_HOME)} for a typical house and about ${yr(YR_CONDO_HOME)} for a typical condo. That covers tax, insurance, a flood policy outside the zone, the condo fee and upkeep.` },
    { q: "What is the property tax in North Myrtle Beach?", a: `On a house the county values at ${HOUSE}, about ${TAX_HOME} a year as your home and about ${TAX_RENT} as a second home or rental.` },
    { q: "Is North Myrtle Beach safe?", a: "We do not rate any place as safe or unsafe. We pull the reported crime figures for the area around any house you ask about." },
    { q: "Which schools serve North Myrtle Beach?", a: "Horry County Schools assigns schools by address. North Myrtle Beach is one of its nine attendance areas, with North Myrtle Beach High School, North Myrtle Beach Middle School and Ocean Drive Elementary. We look up the assigned schools for any house you like." },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "Census profile", href: CENSUS },
    { name: "FEMA flood policies", href: NFIP },
    { name: "44 CFR 64.3", href: CFR64 },
    { name: "2026 tax levy", href: LEVY },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "42 USC 4012a", href: USC4012A },
    { name: "SC Code 1-1-665", href: T1_1 },
    { name: "SC Encyclopedia", href: SCE },
    { name: "Barefoot Resort golf", href: GOLF },
    { name: "city rental page", href: STR },
    { name: "city rental rules", href: STR_RULES },
    { name: "beach laws", href: BEACH },
    { name: "golf cart laws", href: GOLFCART },
    { name: "city parks", href: PARKS },
    { name: "lodging taxes", href: SCDOR },
    { name: "Horry County Schools", href: HCS },
  ],
  sourcesNote: "Our counts from county records and CCMLS listings; the parts are ours. Insurance: Census ACS. Upkeep: Census AHS.",
  afterSources: () => PART_SRC + CREDITS + PH.imageSchema(SHOWN),
  bottomCta: {
    h2: "Tell us how you will use the home.",
    p: "A place to live, a second home or a weekly rental: we will show you the parts and houses that fit. We check the flood zone, the HOA rules and the rental rules for each before you offer.",
    label: "Ask about North Myrtle Beach homes", href: `/contact/?place=${encodeURIComponent("North Myrtle Beach")}`,
  },
  keywords: "living in North Myrtle Beach SC, North Myrtle Beach neighborhoods, North Myrtle Beach flood zone, North Myrtle Beach short term rental rules, North Myrtle Beach property tax, North Myrtle Beach vs Myrtle Beach, Ocean Drive, Crescent Beach, Windy Hill, Barefoot Resort golf, North Myrtle Beach home prices",
  about: "North Myrtle Beach, a city on the Atlantic coast in Horry County, South Carolina",
});
