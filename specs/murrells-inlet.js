/* /submarkets/murrells-inlet/ - Murrells Inlet, SC: which county a home is in and what that changes, the
 * four parts of the Murrells Inlet address (the Horry side, the Georgetown side west of the bypass, the
 * streets between the roads, the creek side), docks and the tide, the tax bill on each side, flooding,
 * renting, daily life and how the seafood village began.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-02. The live page was hand-made (an investor report with an
 * invented occupancy chart); this is its first spec, and it is now a place guide for a buyer choosing a
 * side of the county line, with one section on renting.
 * Version 2, 2026-11-03 (review round 1): each fact said once (the county table, the parts table, the tide
 * chart and the cost table cut); life moved up after the four parts; the dock rules cut to one sentence;
 * part 3 re-cut and re-written; offers carry the part. Changes and reasons: REVIEW-1.md.
 * Facts: Blog-Brain batches/2026-11-a/submarkets-murrells-inlet/facts.md (VERIFIED rows, and CORRECTED
 * rows at the verifier's corrected values and safe wording only; VERIFY.md; struck wording in
 * submarkets-murrells-inlet-struck.json). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-a/submarkets-murrells-inlet/ (findings.json, names.json, listings-findings.json,
 * nfip-findings.json, airroi.json, worked.json, chart-*.json, map-layers.geojson, raw/drives.json,
 * raw/tides-2026.json, photos.json). Every count, price, share, tax, policy cost, chart value and drive
 * time is read from those files here and checked against its ledger row with must(). Corrected rows whose
 * corrected figure is not in a data file (row 9's ratio, row 10's Georgetown condos and townhouses, row
 * 43's split) are typed at the verifier's values, with the row number beside each.
 * Kept from the live page: the H1 (data/headlines.json, the owner liked it), the AirROI numbers (now
 * AirROI's fresh read, row 27), the county line (now the spine, with a map), the 4 and 6 percent rule, the
 * promise to read the HOA papers, and the links to waterfront, property tax, rental rules, accommodations
 * tax, coastal insurance, Airbnb income, long-term rental and 1031 pages.
 * Not kept (judge 2026-10-31; PLAN.md): the "Investor Report" frame, the invented occupancy chart, the
 * aggregator price band, "10,306" and "$454,900", the thesis, first deal and financing sections, the
 * school and community stat blocks, "Who Murrells Inlet suits", the SC 31 section (Little River owns it).
 * Pictures: our map of the four parts on the USGS Imagery Only basemap (public domain), drawn here as
 * inline SVG from map-layers.geojson; five USDA NAIP 2023 aerial close-ups (public domain), labelled from
 * coordinates by data/2026-11-a/submarkets-murrells-inlet/images/label_naip.py; Sunnyside (Upstateherd,
 * CC BY-SA 4.0, Wikimedia Commons). Licence records: photos.json there (tools/photos.js check passes).
 * The photo partner's shots (shot-list.md) replace the aerials of the MarshWalk and the creek when they come.
 * Stories: stories.json "blackmoor-to-seasons" (as recorded, no names) and "murrells-inlet-team-choice"
 * (one line, no names).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/murrells-inlet/";
const SLUG = "submarkets-murrells-inlet";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", SLUG);
const IMG_SRC = `/images/2026-11-a/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), NM = read("names.json").names, L = read("listings-findings.json"), NF = read("nfip-findings.json").groups;
const AIR = read("airroi.json"), MONTHS = read("chart-str-months.json").months, WK = read("worked.json"), TIDES = read("raw/tides-2026.json");
const DRIVES = read("raw/drives.json"), LAYERS = read("map-layers.geojson"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r10 = (v) => money(Math.round(v / 10) * 10);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r10k = (v) => money(Math.round(v / 10000) * 10000);
const must = (ok, msg) => { if (!ok) throw new Error(`murrells-inlet.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const ST = F.stock, SA = F.sales;
/* Row 4: homes with a Murrells Inlet address outside Garden City, by side. */
must(ST["core/all"].homes === 12575 && ST["horry/west/all"].homes === 8945, "row 4 changed");
const GT_HOMES = ST["georgetown/west/all"].homes + ST["georgetown/old_road/all"].homes + ST["georgetown/inlet/all"].homes;
must(GT_HOMES === 3630 && Math.round(8945 / 12575 * 10) === 7, "row 4 split changed");
/* Row 5: the Census's Murrells Inlet. */
const PEOPLE_2020 = 9740;
/* Rows 6 to 8: house and condo sales, year to September 2026. */
const HS = SA["horry/west/house"], GW = SA["georgetown/west/house"], OR = SA["georgetown/old_road/house"], ORC = SA["georgetown/old_road/condo"];
must(HS.sales === 396 && HS.median === 449950 && HS.builder === 43, "row 6 changed");
must(GW.sales === 113 && GW.median === 568000, "row 7 changed");
must(OR.sales === 29 && OR.median === 530000 && ORC.sales === 16 && ORC.median === 278750, "row 8 changed");
must(r10k(HS.median) === "$450,000" && r10k(GW.median) === "$570,000" && r10k(GW.median - HS.median) === "$120,000", "rows 6 and 7 rounding");
/* Row 9 (CORRECTED): houses within 30 m of the salt marsh, three years of sales. */
const MARSH = { houses: ST["georgetown/inlet/house_marsh"].homes, sales3y: SA["georgetown/inlet/house_marsh_3y"].sales, median: SA["georgetown/inlet/house_marsh_3y"].median };
must(MARSH.houses === 217 && MARSH.sales3y === 21 && MARSH.median === 929000, "row 9 changed");
must(Math.round(MARSH.median / SA["georgetown/west/house_3y"].median * 10) / 10 === 1.7, "row 9 ratio (about 1.7 times)");
/* Row 10 (CORRECTED): condos on both sides, Horry townhouses. */
must(SA["horry/west/condo"].sales === 90 && SA["horry/west/condo"].median === 273500, "row 10 Horry condos changed");
const GT_CONDO = { sales: 21, median: 280000 };                                       // row 10, CORRECTED
const H_TOWN = { sales: 70, median: 320710 };                                         // row 10, CORRECTED
/* Row 12 (CORRECTED) and 13 (CORRECTED): neighborhoods. */
const nm = (name) => NM.find((x) => x.name === name);
must(nm("INDIGO CREEK").kinds.house === 559 && nm("SEASONS @ PRINCE CREEK").kinds.house === 441, "row 12 changed");
must(nm("WACHESAW PLANTATION").kinds.house === 651 && nm("LINKSBROOK").homes === 414 && nm("COLLINS CREEK").homes === 187, "row 13 changed");
/* Rows 15 to 17: tax. */
must(WK.same_house_value === 450000 && WK.horry_610.legal_residence === 1857 && WK.horry_610.second_home_or_rental === 5686, "row 17 Horry changed");
must(WK.georgetown_41.legal_residence === 2416 && WK.georgetown_41.second_home_or_rental === 6900, "row 17 Georgetown changed");
must(WK.diff_same_house.legal_residence === 559 && WK.diff_same_house.second_home_or_rental === 1214, "row 17 differences changed");
must(WK.georgetown_west_middle_house.legal_residence === 3025 && WK.georgetown_west_middle_house.second_home_or_rental === 8684, "row 17 Georgetown middle house changed");
must(ST["horry/west/all"].taxdist["600"] === 774, "row 15 district 600 changed");
/* Rows 18, 19: FEMA high-risk zones by part. */
const FL = { horry: ST["horry/west/all"].pct_high_risk, west: ST["georgetown/west/all"].pct_high_risk, between: ST["georgetown/old_road/all"].pct_high_risk, creek: ST["georgetown/inlet/all"].pct_high_risk };
must(FL.horry === 1.8 && FL.west === 1.6 && FL.between === 34.8 && FL.creek === 85.8, "row 18 changed");
must(ST["georgetown/inlet/house_marsh"].fema.VE === 24, "row 19 changed");
/* Rows 20, 21: flood policies, ZIP 29576. */
must(NF["georgetown/11/any"].median_cost === 593 && NF["horry/11/any"].median_cost === 576 && NF["georgetown/11/A"].median_cost === 1084 && NF["georgetown/11/V"].median_cost === 2160 && NF["strip/11/any"].median_cost === 3259, "row 20 changed");
must(NF["georgetown/11/X"].policies === 461 && NF["georgetown/11/any"].policies === 606, "row 21 changed");
/* Rows 27 to 29: AirROI (vendor) and HUD. */
const AH = AIR.headline;
must(AH.revenue === "$47,603" && AH.occupancy === "41.9%" && AH.adr === "$405" && AH.listings === "478", "row 27 changed");
const MON = Object.fromEntries(MONTHS.map((m) => [m.month, m.revenue]));
must(MONTHS.length === 12 && MON.Jul === 9780 && MON.Jan === 2250, "row 28 changed");
const STR = WK.str_vs_ltr;
must(STR.map((r) => [r.bedrooms, r.airbnb_typical_gross_year, r.hud_fair_rent_year].join()).join(";") === "2,27500,20640;3,30600,24960;4,54100,29040", "row 29 changed");
/* Row 31: drives, free flow. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const mins = (start, k) => { const m = DRIVES[start][k].minutes; return m < 15 ? Math.round(m) : Math.round(m / 5) * 5; };
const D = { hospital: mins("marshwalk", "tidelands_waccamaw_hospital"), park: mins("marshwalk", "huntington_beach_sp_entrance"), gcpier: mins("marshwalk", "garden_city_pier"),
  brookgreen: mins("marshwalk", "brookgreen_gardens"), pawleys: mins("marshwalk", "pawleys_island_town_hall"), market: mins("marshwalk", "market_common"),
  airport: mins("marshwalk", "airport_terminal"), broadway: mins("marshwalk", "broadway_at_the_beach"),
  hPublix: mins("horry", "publix_707"), hMarshwalk: mins("horry", "marshwalk"), hHospital: mins("horry", "tidelands_waccamaw_hospital"), hAirport: mins("horry", "airport_terminal") };
must(D.hospital === 4 && D.park === 9 && D.gcpier === 9 && D.brookgreen === 12 && D.pawleys === 15 && D.market === 20 && D.airport === 25 && D.broadway === 25, "row 31 MarshWalk drives changed");
must(D.hPublix === 4 && D.hMarshwalk === 9 && D.hHospital === 8 && D.hAirport === 25, "row 31 Horry-side drives changed");
must(Math.abs(DRIVES.marshwalk.charleston_city_hall.minutes - 120) < 1, "row 31 Charleston changed");
/* Row 33: the tide. */
const TI = TIDES["8661529"], TR = TIDES["8661493"], TO = TIDES["8661437"];
must(TI.mean_range_ft === 4.14 && TR.mean_range_ft === 2.33 && TO.mean_range_ft === 4.8 && TI.lows_below_0 === 213, "row 33 changed");
/* Row 35: listings tagged with a private dock. */
must(L.features.private_dock.n === 9 && L.features.private_dock.by_part["georgetown/inlet"] === 2, "row 35 changed");
/* Row 39 (CORRECTED): houses taxed as the owner's legal residence. */
must(ST["core/house"].pct_legal_residence === 85.2, "row 39 changed");
/* Row 42: HOA fees on houses for sale. */
const HOA = L.house_hoa_monthly.groups;
must(L.house_no_hoa.by_part["horry/west"] === 5 && L.groups["horry/west/house"].n === 99 && HOA["horry/west"].median_upper === 110 && HOA["georgetown/west"].median_upper === 150, "row 42 changed");
must(HOA["horry/west"].q1_upper === 80 && HOA["horry/west"].q3_upper === 120, "row 42 quartiles changed");
/* Row 43 (CORRECTED): where the 55 no-HOA houses are. */
must(L.house_no_hoa.api_total === 55 && L.house_no_hoa.by_part["georgetown/inlet"] === 6, "row 43 changed");
const NOHOA = { all: 55, georgetown: 21, creek: 6, gardenCity: 29, horry: 5 };            // row 43, CORRECTED

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const PART_COLOR = ["#2f6f8f", "#5f8a4e", "#c4783a", "#8a4fa0"];
const CSS = `<style>
main#main .c3-mi-fig{margin:1.4rem 0 1.6rem;max-width:640px}
main#main .c3-mi-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}
main#main .c3-mi-frame{border-radius:18px;overflow:hidden;background:#3b5a4a;border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.1)}
main#main .c3-mi-frame svg{display:block;width:100%;height:auto}
main#main .c3-mi-key{list-style:none;margin:.9rem 0 0;padding:0;display:grid;gap:.45rem}
main#main .c3-mi-key li{display:flex;align-items:flex-start;gap:.65rem;font-size:1.02rem;line-height:1.4;margin:0;color:var(--muted)}
main#main .c3-mi-num{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.7rem;height:1.7rem;border-radius:50%;color:#fff;font-weight:700;font-size:.95rem;font-family:var(--sans)}
${PART_COLOR.map((c, i) => `main#main .c3-mi-num.p${i + 1}{background:${c}}`).join("")}
main#main .c3-mi-h3{display:flex;align-items:baseline;gap:.6rem;font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:2.2rem 0 .7rem;line-height:1.3}
main#main .c3-mi-h3 .c3-mi-num{position:relative;top:-.12rem}
main#main svg.c3-mi-map .lb{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:64px;fill:#fff;paint-order:stroke;stroke:rgba(20,28,34,.85);stroke-width:14px;stroke-linejoin:round}
main#main svg.c3-mi-map .lb.it{font-style:italic;font-weight:600}
main#main svg.c3-mi-map .lb.cty{font-size:58px;fill:#ffe7c2}
main#main svg.c3-mi-map .lb.sm{font-size:50px}
main#main svg.c3-mi-map .pn{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:76px;fill:#fff}
@media (min-width:700px){main#main svg.c3-mi-map .lb{font-size:40px;stroke-width:10px}main#main svg.c3-mi-map .lb.cty{font-size:38px}main#main svg.c3-mi-map .lb.sm{font-size:34px}}
main#main .c3-mi-stats{list-style:none;padding:0;margin:1.2rem 0 1.4rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;max-width:640px}
@media (min-width:700px){main#main .c3-mi-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
main#main .c3-mi-stats li{margin:0;padding:.75rem .85rem;border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);box-shadow:0 6px 18px rgba(28,32,40,.07)}
main#main .c3-mi-stats b{display:block;font-family:var(--serif);font-size:1.45rem;color:var(--navy);line-height:1.15}
main#main .c3-mi-stats span{display:block;color:var(--muted);font-size:.95rem;line-height:1.35;margin-top:.2rem}
main#main .c3-mi-rules{list-style:none;padding:0;margin:1rem 0 1.4rem;display:grid;gap:.55rem;max-width:680px;counter-reset:rule}
@media (min-width:700px){main#main .c3-mi-rules{grid-template-columns:1fr 1fr}}
main#main .c3-mi-rules li{margin:0;padding:.7rem .9rem;border-radius:14px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.8);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .c3-mi-rules strong{color:var(--navy);display:block}
main#main .c3-mi-story{max-width:640px;margin:1.2rem 0 1.4rem;padding:1rem 1.2rem;border-radius:16px;background:rgba(255,255,255,.55);border-left:4px solid var(--brass);color:var(--muted);line-height:1.7}
main#main .c3-mi-story b{color:var(--navy)}
main#main h2{text-wrap:balance}
main#main svg.c3-mi-cols text{font-family:var(--sans),system-ui,sans-serif;font-size:17px;fill:#4a5763}
main#main svg.c3-mi-cols text.v{font-weight:700;fill:#91592b}
@media (min-width:700px){main#main svg.c3-mi-cols text{font-size:10px}}
/* The end band (the same fix as /submarkets/garden-city/ and /submarkets/conway/; NEEDS.md). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
@media (max-width:359px){.c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.4rem!important}}
/* The labelled aerials are 4:3 with their labels near the edges: show the whole frame at every width (critic round 1). */
main#main figure.c3ph-hero img[height="900"]{aspect-ratio:4/3!important;object-fit:contain!important}
/* The homes strip's AI search box at 320 px (critic round 1; the same fix as /submarkets/conway/ and
   /submarkets/pawleys-island/; the shared CSS fix is NEEDS.md item 7). */
@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-fb-ai textarea{width:100%!important}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}.hx-feed .hx-fb-pills{overflow-x:auto;max-width:100%}}
main#main .c3-mi-nb{white-space:nowrap}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The four parts.                                                                */

const PARTS = [
  { id: "horry-side", name: "The Horry side", key: "golf neighborhoods and most of the homes", lon: -79.0500, lat: 33.6000 },
  { id: "georgetown-west", name: "Georgetown, west of the bypass", key: "Wachesaw, golf and the river landing", lon: -79.0720, lat: 33.5530 },
  { id: "between-the-roads", name: "Between the bypass and Business 17", key: "streets in the middle of the village", lon: -79.0451, lat: 33.5500 },
  { id: "creek-side", name: "The creek side", key: "houses on the salt marsh, and the MarshWalk", lon: -79.0300, lat: 33.5420, to: [-79.0410, 33.5500] },
].map((p, i) => Object.assign(p, { num: i + 1 }));
const numDot = (p) => `<span class="c3-mi-num p${p.num}" aria-hidden="true">${p.num}</span>`;
const partH3 = (p, tail) => `<h3 id="${p.id}" data-toc="${p.name}" class="c3-mi-h3">${numDot(p)}<span>${p.name}: ${tail}</span></h3>`;

/* ---------------------------------------------------------------------------- */
/* The map: the USGS Imagery Only basemap (public domain) with our layers, drawn   */
/* as inline SVG. The base is the export of bbox -79.105,33.515,-78.985,33.648     */
/* (Web Mercator, 1400 x 1863; images/base.py, its no-imagery corner over the sea   */
/* filled with the sea's own colour). Every shape and label is placed from          */
/* coordinates in map-layers.geojson.                                               */

const MAP = (() => {
  const R = 6378137, mx = (lo) => R * lo * Math.PI / 180, my = (la) => R * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
  const BX = [-79.105, 33.515, -78.985, 33.648], W = 1400, H = 1863;
  const P = (lo, la) => [(mx(lo) - mx(BX[0])) / (mx(BX[2]) - mx(BX[0])) * W, (my(BX[3]) - my(la)) / (my(BX[3]) - my(BX[1])) * H];
  const f0 = (v) => Math.round(v), f1 = (v) => Math.round(v * 10) / 10;
  /* Douglas-Peucker in map pixels, so the four shapes stay small inline. */
  const dp = (pts, tol) => {
    if (pts.length < 3) return pts;
    const [a, b] = [pts[0], pts[pts.length - 1]]; let idx = 0, dmax = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const d = Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / len; if (d > dmax) { dmax = d; idx = i; }
    }
    return dmax > tol ? dp(pts.slice(0, idx + 1), tol).slice(0, -1).concat(dp(pts.slice(idx), tol)) : [a, b];
  };
  /* A closed ring starts and ends on one point, so it is simplified in two halves split at its middle point. */
  const ring = (coords, tol = 2.2) => { const all = coords.map((c) => P(c[0], c[1])), m = all.length >> 1;
    const pts = all.length < 4 ? all : dp(all.slice(0, m + 1), tol).slice(0, -1).concat(dp(all.slice(m), tol));
    return pts.length < 4 ? "" : "M" + pts.map((p) => `${f0(p[0])} ${f0(p[1])}`).join("L") + "Z"; };
  const line = (coords, tol = 1.5) => "M" + dp(coords.map((c) => P(c[0], c[1])), tol).map((p) => `${f0(p[0])} ${f0(p[1])}`).join("L");
  const feat = (test) => LAYERS.features.filter(test);
  const lines = (g) => (g.type === "MultiLineString" ? g.coordinates : [g.coordinates]);
  const polys = (g) => (g.type === "MultiPolygon" ? g.coordinates : [g.coordinates]);
  const KEYS = ["horry/west", "georgetown/west", "georgetown/old_road", "georgetown/inlet"];
  const shapes = KEYS.map((k, i) => { const f = feat((x) => x.properties.layer === "part" && x.properties.part === k)[0]; must(f, `no map shape for ${k}`);
    return `<path d="${polys(f.geometry).map((p) => p.map((r) => ring(r)).join("")).join("")}" fill="${PART_COLOR[i]}" fill-opacity=".55" stroke="${PART_COLOR[i]}" stroke-width="3" fill-rule="evenodd"/>`; }).join("");
  const road = (label) => feat((f) => f.properties.layer === "road" && f.properties.label === label).flatMap((f) => lines(f.geometry)).map((c) => line(c)).join("");
  const county = feat((f) => f.properties.layer === "county_line").flatMap((f) => lines(f.geometry)).map((c) => line(c)).join("");
  const gc = feat((f) => f.properties.layer === "garden_city_cdp")[0];
  const lab = (text, lo, la, o = {}) => { const [x, y] = P(lo, la); return `<text class="lb${o.cls ? " " + o.cls : ""}" x="${f1(x + (o.dx || 0))}" y="${f1(y + (o.dy || 0))}" text-anchor="${o.anchor || "start"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x + (o.dx || 0))} ${f1(y + (o.dy || 0))})"` : ""}>${text}</text>`; };
  /* A road's name, set along its own line near a given point. */
  const along = (text, label, lo, la, off) => {
    const pts = feat((f) => f.properties.layer === "road" && f.properties.label === label).flatMap((f) => lines(f.geometry)).flatMap((c) => c);
    const [tx, ty] = P(lo, la); let bi = 0, bd = Infinity;
    pts.forEach((c, i) => { const [x, y] = P(c[0], c[1]), d = (x - tx) ** 2 + (y - ty) ** 2; if (d < bd) { bd = d; bi = i; } });
    must(bd < 60 ** 2, `${text}: no point of the road near the label`);
    const [x1, y1] = P(...pts[Math.max(0, bi - 2)]), [x2, y2] = P(...pts[Math.min(pts.length - 1, bi + 2)]);
    let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
    const r = ang * Math.PI / 180, [cx, cy] = P(...pts[bi]), ox = f1(cx - Math.sin(r) * off), oy = f1(cy + Math.cos(r) * off);
    return `<text class="lb sm" x="${ox}" y="${oy}" text-anchor="middle" transform="rotate(${f1(ang)} ${ox} ${oy})">${text}</text>`;
  };
  const mw = feat((f) => f.properties.layer === "pier" && /Marsh Walk/.test(f.properties.label))[0].geometry.coordinates;
  must(Math.abs(mw[0] + 79.03183) < 1e-4 && Math.abs(mw[1] - 33.55795) < 1e-4, "the MarshWalk point moved");
  const [mwx, mwy] = P(mw[0], mw[1]);
  const pins = PARTS.map((p, i) => { const [x, y] = P(p.lon, p.lat);
    const lead = p.to ? (() => { const [tx, ty] = P(p.to[0], p.to[1]); return `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(tx)}" y2="${f1(ty)}" stroke="#fff" stroke-width="6"/><circle cx="${f1(tx)}" cy="${f1(ty)}" r="9" fill="#fff"/>`; })() : "";
    return `${lead}<g transform="translate(${f1(x)} ${f1(y)})"><circle r="54" fill="${PART_COLOR[i]}" stroke="#fff" stroke-width="8"/><text class="pn" y="26" text-anchor="middle">${p.num}</text></g>`; }).join("");
  /* The county line runs east and west at about 33.572 N across the middle of the map (row 1). */
  const [, lineY] = P(-79.09, 33.5715);
  must(lineY > H * 0.4 && lineY < H * 0.7, "the county line is not where the labels expect it");
  const svg = `<svg class="c3-mi-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="c3-mi-map-t">`
    + `<title id="c3-mi-map-t">Aerial map of the Murrells Inlet mailing area. The Horry and Georgetown county line runs east and west across the middle. North of it, shaded blue, is the Horry side, west of the US 17 bypass. South of it, in Georgetown County, are the Georgetown side west of the bypass (green), a narrow band between the bypass and Business 17 (orange) and the creek side along the inlet (purple), where the MarshWalk is. Garden City, on the beach to the east, has its own guide.</title>`
    + `<image href="${IMG_SRC}/murrells-inlet-aerial-1000.webp" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>`
    + shapes
    + `<path d="${ring(gc.geometry.coordinates[0], 3)}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="4" stroke-dasharray="10 10"/>`
    + `<path d="${road("US 17 bypass")}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${road("US 17 Business")}" fill="none" stroke="#f2b25c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${road("SC 707")}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${county}" fill="none" stroke="#1c2028" stroke-opacity=".6" stroke-width="13"/><path d="${county}" fill="none" stroke="#ffe7c2" stroke-width="6" stroke-dasharray="26 16"/>`
    + lab("Horry County", -79.1035, 33.5715, { cls: "cty", dy: -30 })
    + lab("Georgetown County", -79.1035, 33.5715, { cls: "cty", dy: 64 })
    + along("US 17 bypass", "US 17 bypass", -79.0250, 33.5960, -26)
    + along("Business 17", "US 17 Business", -79.0050, 33.5880, 46)
    + lab("Garden City", -79.0010, 33.6080, { anchor: "middle" })
    + lab("Atlantic Ocean", -79.0060, 33.5300, { cls: "it", anchor: "middle" })
    + `<circle cx="${f1(mwx)}" cy="${f1(mwy)}" r="15" fill="#fff" stroke="#1c2028" stroke-width="5"/>`
    + lab("MarshWalk", mw[0], mw[1], { dx: 24, dy: -22 })
    + pins + `</svg>`;
  const key = `<ol class="c3-mi-key" aria-label="The four parts of Murrells Inlet">` + PARTS.map((p) => `<li>${numDot(p)}<span><b style="color:var(--navy)">${p.name}</b>: ${p.key}</span></li>`).join("") + `</ol>`;
  return `<figure class="c3-mi-fig"><div class="c3-mi-frame">${svg}</div><figcaption>The dashed line is the county line. The shading covers where the homes are. Aerial photo: USGS, public domain. County line, roads and home locations: U.S. Census Bureau, Horry and Georgetown counties and OpenStreetMap contributors.</figcaption>${key}</figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Photos: USDA NAIP aerial close-ups (public domain), labelled from coordinates,  */
/* and Sunnyside from Wikimedia Commons (CC BY-SA 4.0).                            */

const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}-1200w`)); must(r, `no photo record for ${name}`); return r; };
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const photo = (r) => lazy(PH.heroPhoto(r, { alt: r.alt, caption: r.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" }));
const HORRY = rec("murrells-inlet-horry-side-from-above"), RIVER = rec("murrells-inlet-wacca-wache-landing-from-above"), BETWEEN = rec("murrells-inlet-between-the-roads-from-above");
const DOCKS = rec("murrells-inlet-creek-front-docks-from-above"), MARSHWALK = rec("murrells-inlet-marshwalk-from-above"), SUNNY = rec("sunnyside-murrells-inlet");
const SHOWN = [HORRY, RIVER, BETWEEN, DOCKS, MARSHWALK, SUNNY];
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: p.caption.replace(/\.$/, "") })));

/* ---------------------------------------------------------------------------- */
/* Charts and tables.                                                             */

/* Row 4's part counts (the parts' own entries print them). */
must(ST["georgetown/west/all"].homes === 2464 && ST["georgetown/old_road/all"].homes === 800 && ST["georgetown/inlet/all"].homes === 366, "row 4 part counts changed");
/* Round 1 (owner's eye): the county table, the parts table and the tide chart are cut. Each fact is said
   once, in its own section; the flood shares live only in this chart. */

/* Flood risk by part (row 18). */
const FLOOD_CHART = G.bars([
  { name: "1. The Horry side", value: FL.horry, valueText: "About 2 in 100" },
  { name: "2. Georgetown, west of the bypass", value: FL.west, valueText: "About 2 in 100" },
  { name: "3. Between the bypass and Business 17", value: FL.between, valueText: "About 1 in 3" },
  { name: "4. The creek side", value: FL.creek, valueText: "About 6 in 7" },
], { caption: "Homes in FEMA's high-risk flood zone, by part of Murrells Inlet", nameLabel: "Part", valueLabel: "Homes in the zone", max: 100, compact: true,
  note: "Every home's flood zone on the county's FEMA map, at the middle of its lot. The numbers match the map above." });

/* Airbnb revenue by month (row 28). */
const MONTH_CHART = (() => {
  const W = 360, H = 236, L0 = 70, R0 = 352, T0 = 26, B0 = 200, MAX = 11000, bw = (R0 - L0) / 12;
  const Y = (v) => B0 - v / MAX * (B0 - T0), f1 = (v) => Math.round(v * 10) / 10;
  const grid = [0, 5000, 10000].map((v) => `<line x1="${L0}" x2="${R0}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="#1c2028" stroke-opacity="${v ? ".12" : ".35"}"/><text x="${L0 - 6}" y="${f1(Y(v) + 5)}" text-anchor="end">${v ? money(v) : "$0"}</text>`).join("");
  const cols = MONTHS.map((r, i) => { const x = L0 + i * bw + bw * 0.14, w = bw * 0.72, hi = r.month === "Jul" || r.month === "Jan";
    return `<rect x="${f1(x)}" y="${f1(Y(r.revenue))}" width="${f1(w)}" height="${f1(B0 - Y(r.revenue))}" rx="3" fill="${r.season === "High" ? "#c4783a" : "#d9b48f"}"/>`
      + `<text x="${f1(x + w / 2)}" y="${B0 + 22}" text-anchor="middle">${r.month[0]}</text>`
      + (hi ? `<text class="v" x="${f1(x + w / 2 + (r.month === "Jan" ? 10 : 0))}" y="${f1(Y(r.revenue) - 8)}" text-anchor="middle">${money(r.revenue)}</text>` : ""); }).join("");
  const svg = `<svg class="c3-mi-cols" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Column chart of what a Murrells Inlet Airbnb earns in an average month: ${MONTHS.map((r) => `${r.month} ${money(r.revenue)}`).join(", ")}.">${grid}${cols}</svg>`;
  return `<figure class="c3-gchart c3-mi-fig"><span class="cap" style="display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem">What a Murrells Inlet Airbnb earns in an average month</span>${svg}<figcaption>AirROI's average per active listing over two years, before cleaning, fees and management. Darker columns are May to August, the high season.</figcaption></figure>`;
})();

/* Airbnb against HUD's fair rent, by bedrooms (row 29). */
const STR_TABLE = compareCards(STR.map((r) => ({ name: `${r.bedrooms} bedrooms`, cells: {
  a: money(r.airbnb_typical_gross_year), hud: money(r.hud_fair_rent_year), gap: `About ${money(r.gap >= 10000 ? Math.round(r.gap / 1000) * 1000 : Math.round(r.gap / 100) * 100)} more` } })),
  [{ key: "a", label: "Typical Airbnb, a year, before costs" }, { key: "hud", label: "HUD's fair rent, 12 months" }, { key: "gap", label: "The gap, before costs" }],
  { caption: "A Murrells Inlet Airbnb against a yearly lease at HUD's fair rent", nameLabel: "Home size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const TIGER = "https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html";
const HGIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const GGIS = "https://gis1.georgetowncountysc.org/portal/rest/services";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const CENSUS = "https://data.census.gov/table?g=160XX00US4548985";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const GTCALC = "https://www.gtcountysc.gov/385/Property-Tax-Calculator";
const SC_4PCT = "https://www.scstatehouse.gov/code/t12c043.php";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const HCS = "https://www.horrycountyschools.net/about-hcs/our-schools";
const STRCHART = "https://www.horrycountysc.gov/media/monjnvh0/sales-tax-chart-short-term-rentals.pdf";
const GTFAQ = "https://www.gtcountysc.gov/Faq.aspx?QID=116";
const GTTAX = "https://www.gtcountysc.gov/351/Hospitality-Accommodations-Tax";
const SCDOR = "https://dor.sc.gov/tax/accommodations";
const AIRROI = "https://www.airroi.com/airbnb-data/united-states/south-carolina/murrells-inlet";
const HUD = "https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html";
const MARSHWALK_SITE = "https://marshwalk.com/";
const HBSP = "https://southcarolinaparks.com/huntington-beach";
const REG30 = "https://www.scstatehouse.gov/coderegs/Chapter%2030.pdf";
const NOAA = "https://tidesandcurrents.noaa.gov/stationhome.html?id=8661529";
const SHELL = "https://www.dnr.sc.gov/marine/shellfish/regs.html";
const NRHP = "https://npgallery.nps.gov/NRHP/GetAsset/NRHP/80003670_text";
const SCE = "https://www.scencyclopedia.org/sce/entries/murrells-inlet/";
const DREDGE = "https://dph.sc.gov/sites/scdph/files/media/document/Special-Appropriations/Special-Appropriations-Q4-2024/Q4ExpRpt-Georgetown-County-Murrells-Inlet-Dredging.pdf";
const HCPD = "https://www.horrycountysc.gov/departments/police/";
const GCSO = "https://www.gcsheriff.org/enforcement-division/patrol/";

/* ---------------------------------------------------------------------------- */
/* The offers.                                                                    */

const TOP = { title: "Get the Murrells Inlet homes that fit your plan", label: "Send me Murrells Inlet homes", href: "/contact/" };
const END = {
  h2: "Before you offer on a Murrells Inlet home, we check four things.",
  p: "Which county it is in and its tax bill. What its HOA papers say. Its flood zone and what a flood policy costs. On the creek, the dock's permit and the water at the dock.",
  label: "Ask about a Murrells Inlet home", href: `/contact/?place=${encodeURIComponent("Murrells Inlet")}`,
};
/* Each part's offer carries the part, so the agent knows which one the reader picked (round 1). */
const ask = (p, label) => G.offer("Murrells Inlet", { label, href: `/contact/?place=${encodeURIComponent("Murrells Inlet")}&part=${p.id}` });
const [P1, P2, P3, P4] = PARTS;
const nb = (t) => t.replace(/ /g, " ");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  pageImages: () => PH.pageImages(MARSHWALK),
  title: "Murrells Inlet, SC Real Estate: Horry or Georgetown Side?",
  description: "Murrells Inlet homes by side of the county line: what houses sell for, the tax bill, schools, flood zones, docks and Airbnb numbers, from county records.",
  ogTitle: "Murrells Inlet, SC: the county line, the four parts, docks and the tide, taxes and flooding",
  crumb: "Murrells Inlet",
  eyebrow: "Murrells Inlet, SC",
  /* The owner's kept headline (data/headlines.json). The short answer's second paragraph and part 4 say
     why a buyer needs patience here: few creek-front houses come up for sale (row 9). */
  h1: "Murrells Inlet real estate:",
  h1em: "room for patient buyers.",
  sub: "Murrells Inlet is the seafood village on a salt marsh south of Myrtle Beach, with the MarshWalk on the Georgetown side and golf neighborhoods on the Horry side.",
  heroMedia: glance([
    { icon: "pin", label: "ZIP 29576", text: "2 counties" },
    { icon: "dock", label: "Marsh-front sales", text: "7 a year" },
    { icon: "hospital", label: "MarshWalk to hospital", text: `${D.hospital} min` },
    { icon: "beach", label: "MarshWalk to beach", text: `${D.park} min` },
  ]),
  heroCta: TOP,
  topOfferLine: "Tell us which side you want. We send the homes that fit.",
  author: "devin",
  toc: false,
  shortAnswer: [
    `Murrells Inlet has two sides, split by the line between Horry and Georgetown counties. The Horry side has the golf neighborhoods, the new houses from builders and 7 in 10 of the homes. Its middle house price in the past year was about ${r10k(HS.median)}. The Georgetown side has the MarshWalk, the river landing and the houses on the creek. West of the US 17 bypass, its middle house price was about ${r10k(GW.median)}.`,
    `If you want a house on the creek, plan to wait: only about 7 sell in a year. Your tax bill, your schools and the paperwork to rent a house out depend on the county.`,
  ],
  sections: [
    { h2: "Is Murrells Inlet in Horry County or Georgetown County?", toc: "Which county", id: "which-county", html: () =>
      CSS +
      h.p(`Both. Murrells Inlet is not a town, and its ZIP code, 29576, crosses the county line. Each county runs its own side. The address on the mail does not tell you the county, so we look it up for every home before you see it.`) +
      h.p(`US 17 runs through Murrells Inlet as two roads: the US 17 bypass to the west, and Business 17 nearer the marsh. The map shows both, and the four parts of Murrells Inlet that the two roads and the county line make. Garden City, on the beach to the east, shares the ZIP code and has ${h.a("/submarkets/garden-city/", "its own guide")}.`) +
      MAP },

    { h2: "Where should you buy in Murrells Inlet?", toc: "Four parts", id: "parts", html: () =>
      h.p(`Each of the four parts is a different way to live here. The numbers match the map above.`) +

      partH3(P1, "golf neighborhoods and most of the homes") +
      h.p(`Most Murrells Inlet homes are here, north of the county line and west of the US 17 bypass. The neighborhoods are ${h.a("/buyers/golf-communities/", "laid out around golf courses")} and ponds: the International Club, Blackmoor, the TPC of Myrtle Beach and Indigo Creek's course are all on this side.`) +
      h.p(`The largest house neighborhoods are Indigo Creek, with about 560 houses, Seasons at Prince Creek West (a ${h.a("/buyers/55-plus-communities/", "55+ community")}), The Pines of St. James and Longwood Bluffs. Clients of ours sold their house in Blackmoor, a golf community with no age restriction, to buy in Seasons at Prince Creek West, an age-restricted community a few minutes away.`) +
      photo(HORRY) +
      h.p(`Publix and Lowes Foods are on SC 707, about ${D.hPublix} minutes from the middle of this side. The MarshWalk is about ${D.hMarshwalk} minutes away.`) +
      h.p(`Almost every house for sale here is in an HOA (homeowners association), and the middle fee was about $${HOA["horry/west"].median_upper} a month. Most of the ${h.a("/buyers/no-hoa-homes/", "houses with no HOA")} are on the Georgetown side. About 1 in 9 houses sold here in the past year was new from a builder. Townhouses and condos cost less, about ${r10k(H_TOWN.median)} and ${r5k(SA["horry/west/condo"].median)}.`) +
      ask(P1, "Send me Horry-side homes in Murrells Inlet") +

      partH3(P2, "Wachesaw, golf and the river") +
      h.p(`South of the county line and west of the bypass, the land runs down to the Waccamaw River. Boats go in at Wacca Wache Landing, off Wachesaw Road. On the river, the tide rises and falls about half as much as in the inlet.`) +
      photo(RIVER) +
      h.p(`The largest neighborhood is ${h.a("/buyers/gated-communities/", "Wachesaw Plantation")}, with about 650 houses, then Linksbrook and Collins Creek. The Wachesaw Plantation Club and Wachesaw East golf courses are on this side. Prince Creek crosses the county line: Palm Bay is in Georgetown County, Seasons at Prince Creek West is in Horry, and Highwood is split between them.`) +
      h.p(`The middle HOA fee on houses for sale here was about $${HOA["georgetown/west"].median_upper} a month.`) +
      ask(P2, "Send me Georgetown-side homes in Murrells Inlet") +

      partH3(P3, "streets in the middle of the village") +
      h.p(`This narrow band is on the Georgetown side, between the US 17 bypass and Business 17. It has about ${n(ST["georgetown/old_road/all"].homes)} homes on streets of houses like the ones in the photo. Tidelands Waccamaw Community Hospital and a Food Lion are just west of the bypass. The MarshWalk, the restaurants and the creek are just east of Business 17.`) +
      photo(BETWEEN) +
      h.p(`A house here sold for about ${r10k(OR.median)} at the middle in the past year, and a condo or villa for about ${r10k(ORC.median)}. Some streets here are in FEMA's high-risk flood zone and some are not, so we look up the zone for each house before you offer.`) +
      ask(P3, "Send me homes between the highways in Murrells Inlet") +

      partH3(P4, "houses on the salt marsh") +
      h.p(`East of Business 17, on the Georgetown side, houses line the edge of the inlet's salt marsh, many with a dock out to the creek. This is where the village began, and it is a National Register historic district. The county's named areas here include Sunnyside, the Hermitage and Vaux Hall. The MarshWalk's restaurants are on this side.`) +
      photo(DOCKS) +
      h.p(`The creek side has about ${n(Math.round(ST["georgetown/inlet/all"].homes / 10) * 10)} homes. About 220 of them are houses on the edge of the marsh, and few of those come up for sale: ${MARSH.sales3y} sold in the past three years. The middle one sold for about ${r10k(MARSH.median)}, about 1.7 times the middle house west of the bypass over the same years.`) +
      ask(P4, "Send me creek-front homes in Murrells Inlet") },

    { h2: "What is it like to live in Murrells Inlet?", toc: "Daily life", id: "life", html: () =>
      h.p(`The ${h.ext(MARSHWALK_SITE, "MarshWalk")} is a half-mile wooden boardwalk along the salt marsh, lined with restaurants such as Drunken Jack's, Dead Dog Saloon, Creek Ratz and The Wicked Tuna. Its live music is free to hear. Crazy Sister Marina and the county's Murrells Inlet boat landing are at its south end.`) +
      photo(MARSHWALK) +
      h.p(`About 85 in 100 houses outside Garden City are taxed as their owner's main home.`) +
      h.h3("Oysters in season") +
      h.p(`From October 1 into May, you can gather oysters and clams on the inlet's three public shellfish grounds with a South Carolina saltwater fishing license. They are the state grounds named Murrells Inlet and Drunken Jack Island, and a public ground at the old Lachicotte oyster factory. A resident's license costs $15 a year, and no license is needed under 16. There is a daily limit, on no more than two days in any seven, and parts of each ground are closed by the state.`) +
      h.h3("The beach, groceries and the hospital") +
      h.p(`The creek side has no ocean beach. The nearest are ${h.ext(HBSP, "Huntington Beach State Park")}, about ${D.park} minutes from the MarshWalk, with 3 miles of beach and a freshwater lake known for alligators, and Garden City Beach, about ${D.gcpier} minutes away.`) +
      h.p(`On the Horry side, Publix and Lowes Foods are on SC 707 and a Walmart Neighborhood Market is on the US 17 bypass. On the Georgetown side, a Food Lion is on the bypass near the hospital. Two of our own team chose to live in Murrells Inlet. One of them drives from here to Market Common and to a gym in Carolina Forest.`) +
      h.table(["From the MarshWalk to", "By car, about"], [
        ["Tidelands Waccamaw Community Hospital", nb(`${D.hospital} min`)],
        ["Brookgreen Gardens", nb(`${D.brookgreen} min`)],
        [h.a("/submarkets/pawleys-island/", "Pawleys Island"), nb(`${D.pawleys} min`)],
        ["Market Common", nb(`${D.market} min`)],
        ["Myrtle Beach International Airport", nb(`${D.airport} min`)],
        ["Broadway at the Beach", nb(`${D.broadway} min`)],
        ["Charleston", nb("2 hours")],
      ]) +
      h.p(`Times are without traffic. Summer traffic on US 17 adds time.`) },

    { h2: "Can a creek-front house in Murrells Inlet have a dock?", toc: "Docks and tides", id: "docks", html: (bg) =>
      h.p(`Usually. South Carolina allows one dock per lot on the salt marsh, if the lot has enough marsh frontage and the creek in front of it is wide enough. Before you offer on a creek-front house, we pull the dock's permit and check the frontage and the creek's width.`) +
      h.p(`Few houses for sale have a dock. Of the ${n(465)} listings with a Murrells Inlet address, Garden City included, listing agents marked a private dock on ${L.features.private_dock.n}. Only ${L.features.private_dock.by_part["georgetown/inlet"]} of those were on the creek side. A creek house with a dock does come up, but you may wait for one.`) +
      h.h3("How much water is at the dock?") +
      h.p(`The tide in the inlet rises and falls about 4 feet on an average day, at NOAA's prediction station at Captain Alex's Marina. About 3 low tides in 10 drop below the low-water mark on the creek's charts. At a dock with little water, a boat can sit on the mud at those tides. We look at the dock at low tide before you offer. Our ${h.a("/buyers/waterfront-homes/", "waterfront homes guide")} covers what else to look at.`) +
      h.h3("Where can you launch a boat?") +
      h.p(`Georgetown County lists four boat landings in the Murrells Inlet ZIP code. The Murrells Inlet Landing is at the MarshWalk, Marina Colony is on Business 17 and Morse Landing is at the inlet's south end. Wacca Wache Landing is on the Waccamaw River.`) +
      h.cta("Found a creek house with a dock?", "Send us the creek house you like. We pull its dock permit and look at the water at its dock at low tide.", "Have us check the dock", "/contact/", bg) },

    { h2: "What are property taxes in Murrells Inlet?", toc: "Property tax", id: "property-tax", html: () =>
      h.p(`On the same house, the bill is higher on the Georgetown side. For a $450,000 house, the yearly tax is about:`) +
      h.table(["", "Horry", "Georgetown"], [
        ["Main home", r10(WK.horry_610.legal_residence), r10(WK.georgetown_41.legal_residence)],
        ["Second home or rental", r10(WK.horry_610.second_home_or_rental), r10(WK.georgetown_41.second_home_or_rental)],
      ]) +
      h.p(`Parts 3 and 4 on the map are on the Georgetown side. A new owner's bill is figured on the price paid, and your HOA fee and homeowners insurance come on top. Our ${h.a("/buyers/property-taxes/", "property tax calculator")} has the rate for every part of both counties.`) },

    { h2: "Does Murrells Inlet flood?", toc: "Flooding", id: "flooding", html: (bg) =>
      h.p(`Few homes west of the US 17 bypass are in FEMA's high-risk flood zone. Most homes on the creek side are. In that zone, a lender requires flood insurance.`) +
      FLOOD_CHART +
      h.p(`On the creek side, about 1 in 9 of the houses on the marsh are in FEMA's V zone, where waves are expected in a big storm. A flood policy costs the most there.`) +
      h.h3("What flood insurance costs here") +
      h.p(`The middle federal flood policy on a house cost about ${r10(NF["georgetown/11/any"].median_cost)} a year on the Georgetown side and about ${r10(NF["horry/11/any"].median_cost)} on the Horry side. On the Georgetown side, a house in FEMA's A zone, the high-risk zone away from the waves, paid about ${r10(NF["georgetown/11/A"].median_cost)}. A house in the V zone, where FEMA expects waves, paid about ${r10(NF["georgetown/11/V"].median_cost)}.`) +
      h.p(`Most of the flood policies on Georgetown-side houses are on homes outside the high-risk zone. Before you offer, we pull the flood zone and an insurance quote for the house. Our pages on ${h.a("/buyers/coastal-insurance/", "coastal insurance")} and ${h.a("/buyers/undisclosed-flooding/", "finding out whether a house has flooded")} show what we look at.`) +
      h.cta("Has the house you like ever flooded?", "Tell us which house. We look up its flood zone and its flood history before you make an offer.", "Have us check its flood history", "/contact/", bg) },

    { h2: "Can you rent out a house in Murrells Inlet?", toc: "Renting", id: "renting", html: (bg) =>
      h.p(`It depends on the HOA papers and the county zoning for that lot. An HOA can forbid or limit rentals in its papers, and almost every Horry-side house for sale is in one. We read the HOA papers and check the zoning before you offer.`) +
      h.p(`On the Horry side, the county asks a nightly-rental owner for a business license and tax filings, and names no rental permit. Guests pay about 12 percent in lodging taxes. On the Georgetown side, the county issues no business license, and guests pay about 11 percent. The details are on our ${h.a("/invest/str-rules/", "short-term rental rules page")} and our ${h.a("/invest/accommodations-tax/", "accommodations tax page")}.`) +
      h.h3("What a Murrells Inlet Airbnb earns") +
      h.p(`AirROI, a company that tracks Airbnb listings, counts about ${n(Math.round(+AH.listings / 10) * 10)} active listings in Murrells Inlet. Its count may take in Garden City Beach homes with a Murrells Inlet address. The average listing took in about $47,600 in gross bookings in the past 12 months, before costs. Most of that comes in summer.`) +
      MONTH_CHART +
      h.h3("Worked example: nightly renting against a yearly lease") +
      h.p(`The gap between a typical Airbnb and a yearly lease grows with the size of the house. The table compares a typical Airbnb of each size with a year's lease at HUD's fair rent, the government's figure for a standard rental in the ZIP code, rent and utilities included.`) +
      STR_TABLE +
      h.p(`The Airbnb figures are before cleaning, platform fees, management, furniture and utilities. Rents by area are on our ${h.a("/invest/rent-prices/", "rent prices page")}, and our ${h.a("/invest/str-tools/", "Airbnb calculator")} and ${h.a("/invest/long-term-rental/", "long-term rental analyzer")} run both sides for one house. Selling a rental to buy here? Our ${h.a("/invest/strategies/1031-exchange/", "1031 exchange guide")} covers the tax.`) +
      h.cta("Thinking of renting a Murrells Inlet house?", "Send us the address. We read the HOA papers on renting, check the zoning, and price the tax, the flood policy and the fees for that house.", "Ask about a Murrells Inlet rental", "/contact/", bg) },

    { h2: "How did Murrells Inlet become a seafood village?", toc: "History", id: "history", html: () =>
      h.p(`Murrells Inlet began with the homes of two rice planters. Around 1850, Sunnyside was built for Jacob Motte Alston, and the Hermitage for Dr. Allard Belin Flagg, the master of Wachesaw plantation, on the edge of the marsh. A small settlement grew up along the marsh on their old lands.`) +
      photo(SUNNY) +
      h.p(`Visitors first came for oyster roasts and fried shore dinners put on by the inlet's founding families, the Morses, Nances, Vereens, Olivers, Chandlers and Lees. That grew into the restaurants that earned the nickname "Seafood Capital." Hurricane Hugo struck the creek front in 1989, and the village rebuilt.`) +
      h.p(`Georgetown County plans to dredge the inlet's creeks. In ${h.ext(DREDGE, "a report to the state")}, it estimated the cost at about $30 million.`) },
  ],
  faqTitle: "Murrells Inlet FAQ",
  faq: [
    { q: "What ZIP code is Murrells Inlet?", a: "29576. It covers the Horry side, the Georgetown side and Garden City, so the ZIP code does not tell you the county." },
    { q: "Is Murrells Inlet part of Myrtle Beach?", a: "No. No part of the Murrells Inlet ZIP code is inside Myrtle Beach or any other town." },
    { q: "Does Murrells Inlet have a beach?", a: `Not on the creek side. Huntington Beach State Park and Garden City Beach are the nearest beaches.` },
    { q: "What schools serve Murrells Inlet?", a: `Horry-side homes are zoned for the St. James schools of Horry County Schools. Georgetown-side homes are zoned for the Waccamaw schools of the Georgetown County School District. We look up the assigned schools for any home you like.` },
  ],
  sources: [
    { name: "Census 2020", href: CENSUS },
    { name: "Horry GIS", href: HGIS },
    { name: "Georgetown GIS", href: GGIS },
    { name: "Horry deeds", href: DEEDS },
    { name: "Horry 2026 levy", href: LEVY },
    { name: "Georgetown tax estimate", href: GTCALC },
    { name: "OpenFEMA", href: NFIP },
    { name: "Horry STR filings", href: STRCHART },
    { name: "Georgetown FAQ", href: GTFAQ },
    { name: "AirROI", href: AIRROI },
    { name: "HUD", href: HUD },
    { name: "SC Regs. 30-12", href: REG30 },
    { name: "NOAA", href: NOAA },
    { name: "SCDNR", href: SHELL },
    { name: "National Register", href: NRHP },
    { name: "SC Encyclopedia", href: SCE },
  ],
  sourcesNote: "Our counts from both counties' parcels, flood maps and sales. Creek-front: within 30 meters of the salt marsh; the sale count is a floor. Tax: each county's rates and fees for its district. Listings in aggregate from CCMLS. Drives without traffic.",
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: END,
  keywords: "Murrells Inlet SC real estate, Murrells Inlet homes for sale, is Murrells Inlet in Horry County or Georgetown County, Murrells Inlet waterfront homes, Murrells Inlet docks, Murrells Inlet property tax, Murrells Inlet flood zone, Murrells Inlet Airbnb, Murrells Inlet schools, MarshWalk",
  about: "Murrells Inlet, an unincorporated community in Georgetown and Horry counties, South Carolina",
});
