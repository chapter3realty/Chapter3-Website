/* /buyers/homes-near-the-beach/ - houses near the beach on the Grand Strand (not oceanfront condos): where the houses a
 * walk from the sand are, what they sold for by distance from the ocean against houses a few miles inland, the walk to a
 * public beach access measured for every house for sale near the ocean, the flood zone by distance and by stretch of
 * coast, the four stretches from Cherry Grove to Pawleys Island one by one, and the pros and cons.
 *
 * Batch 2026-11-n, Lane N (a new page). Version 1, 2026-11-08. Design: the approved pilots of batch 2026-11-a
 * (sell-fsbo, submarkets-pawleys-island, hoa-liens-and-foreclosure, invest-condos): a two-line headline with the italic
 * sub line at about half the H1 size, the hero photo beside the key facts on a wide screen (as Pawleys Island), the
 * answer first, no cards (the stretches are read one at a time, as the Pawleys parts), plain lists and large numbers
 * under thin rules, one block width of 720 px, and on wide screens the price chart beside the paragraphs that explain
 * it. DESIGN.md in the batch folder says why.
 * Facts: Blog-Brain batches/2026-11-n/buyers-homes-near-the-beach/facts.md, VERIFIED rows, and CORRECTED rows only at
 * the verifier's values and in the verifier's wording (VERIFY.md). Struck wording: buyers-homes-near-the-beach-struck.json
 * in the same folder (no "mostly the oceanfront row", no "about the same as houses 2 to 5 miles inland", no "and they are
 * smaller", no 420 or 800 houses, no "rare but real", no campground homes in any count, no Ocean Lakes by name, no
 * "router does not use private roads", no "Within 1 mi of the beach" filter, no 5 km/h, no "every access along Garden
 * City Beach", no "never far", no "the exception that lets the beach be a walk").
 * Data, never typed (website working copy, data/2026-11-n/buyers-homes-near-the-beach/):
 *   findings-no-campground.json       rows 2 to 9, 13, 15 (search keys), 16 to 18, 21: deeds, listings, stock, flood
 *                                     (the verifier's re-run of analyze.py with the 79 campground homes dropped; its
 *                                     deeds, stock and access parts match findings.json exactly)
 *   findings.json                     row 15 only (what the search returns, campground homes included, as the verifier said)
 *   walk-findings-no-campground.json  rows 10, 10b, 10c: the walk to the nearest public beach access
 *   access-findings.json              row 11: public accesses per mile on the state's map
 *   kings-hwy-distance.json           row 14: Kings Highway's distance from the ocean in Myrtle Beach
 *   map-layers.geojson                our map: the shoreline (TIGER/Line 2024), the half-mile line, the access points (SCDES)
 * Reused deeds: data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (through analyze.py). Reused photos: the
 * records in data/2026-11-a/{submarkets-garden-city,submarkets-myrtle-beach,submarkets-north-myrtle-beach,
 * submarkets-surfside-beach}/photos.json (VERIFY.md Photos: each looked at full size, captions per the verifier).
 * Typed and checked: carried rows 12 (town access counts), 19 (the flood insurance rule), 20 (FEMA policy costs),
 * 23 (the owner's beach-character story, literal), 24 (drive minutes), 25 (Garden City parking), each in its row's wording.
 * Owner questions open (OWNER-QUESTIONS.md): Q1 a real story of a buyer who traded size for the beach (none used),
 * Q2 the resident parking pass (left to /buyers/relocating/beaches/).
 * Fix round 1 (2026-11-08, REVIEW-1.md): the walk leads the title and the page; the towns follow the walk, each sold on its
 * own streets and places (rows 27 to 31, carried) with one line of price; the worked example, the term list, the stretch
 * table, the square-foot paragraphs and the flood zone letters are gone; a small budget table (row 26) answers what
 * $400,000 and $600,000 buy a walk from the sand; the north arrow points north; the Cherry Grove photo is the labelled
 * aerial of the channel houses.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/homes-near-the-beach/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "buyers-homes-near-the-beach");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings-no-campground.json"), F0 = read("findings.json"), W = read("walk-findings-no-campground.json");
const A = read("access-findings.json"), K = read("kings-hwy-distance.json"), LAYERS = read("map-layers.geojson");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const nw = (t) => `<span class="nb-nw">${t}</span>`;                                   // keeps "5-minute" and "2 to 5" on one line
const k5 = (v) => money(Math.round(v / 5000) * 5000);
const mil = (v) => `$${(v / 1e6).toFixed(2).replace(/0$/, "").replace(/\.0?$/, "")} million`;
const must = (ok, msg) => { if (!ok) throw new Error(`buyers-homes-near-the-beach.js: ${msg}`); };
const DAY = new Date(F.listings.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const CTA = "/contact/";
const walkMap = (q) => `/homes/map/?type=house&amp;has=${q}`;

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const NMB = "North Myrtle Beach and Cherry Grove", MB = "Myrtle Beach", SGM = "Surfside Beach, Garden City and Murrells Inlet",
  GT = "Litchfield and Pawleys Island (Georgetown County)";
const D = F.deeds, DB = D.by_band;
/* Row 2: sales by band. */
const BANDS = ["under 1/4 mile", "1/4 to 1/2 mile", "1/2 to 1 mile", "1 to 2 miles", "2 to 5 miles", "5 to 10 miles", "10 miles or more"];
must(BANDS.map((b) => DB[b].median).join() === "805000,540000,510000,500000,390000,350000,290000", "row 2 changed");
must(DB["under 1/4 mile"].sales === 239 && DB["2 to 5 miles"].sales === 2339, "row 2 counts changed");
/* Row 3 CORRECTED: the first tenth of a mile (no "oceanfront row" clause). */
must(D.first_tenth_mile.median === 1330000 && D.tenth_to_quarter.median === 705000, "row 3 changed");
/* Row 4: within half a mile against 2 to 5 miles. */
const NEAR4 = D.all_near_vs_2_5;
must(NEAR4.near.median === 675000 && NEAR4.near.sales === 450 && NEAR4.two_to_five.median === 390000, "row 4 changed");
const RATIO = Math.round(NEAR4.near.median / NEAR4.two_to_five.median * 10) / 10;
must(RATIO === 1.7 && Math.round(D.house_sales_with_point / NEAR4.near.sales) === 16, "row 4 ratio or share changed");
/* Row 5 CORRECTED: by stretch. */
const ST = D.by_stretch, near = (s) => ST[s]["within 1/2 mile"].median, inland = (s) => ST[s]["2 to 5 miles"].median;
must(near(NMB) === 625000 && inland(NMB) === 350000 && near(MB) === 670000 && inland(MB) === 405000 && near(SGM) === 775000 && inland(SGM) === 420000, "row 5 changed");
must(ST[SGM]["1/2 to 2 miles"].median === 395000, "row 5 Surfside half mile to 2 miles changed");
/* Row 6 CORRECTED: listings by band, campground homes dropped. */
const LB = F.listings.by_band, L14 = LB["under 1/4 mile"], L12 = LB["1/4 to 1/2 mile"], L25 = LB["2 to 5 miles"];
must(L14.listings === 202 && L14.median_ask === 960000 && L14.median_ask_per_sqft === 445 && L14.median_sqft === 2350, "row 6 under a quarter mile changed");
must(L12.listings === 154 && L12.median_ask === 680000 && Math.round(L12.median_ask_per_sqft / 10) * 10 === 330 && L12.median_sqft === 1800, "row 6 quarter to half changed");
must(L25.listings === 865 && L25.median_ask === 450000 && Math.round(L25.median_ask_per_sqft / 10) * 10 === 220 && L25.median_sqft === 2100, "row 6 two to five changed");
must(L14.listings + L12.listings === 356, "row 6 within half a mile changed");
/* Row 7 CORRECTED: listings within half a mile by stretch. */
const LS = F.listings.by_stretch, ls = (s) => LS[s]["within 1/2 mile"];
must(ls(NMB).listings === 143 && ls(MB).listings === 101 && ls(SGM).listings === 71 && ls(GT).listings === 41, "row 7 counts changed");
must(ls(NMB).median_ask === 750000 && ls(MB).median_ask === 725000 && ls(SGM).median_ask === 990000 && ls(GT).median_ask === 2100000, "row 7 asks changed");
must(LS[GT]["2 to 5 miles"].median_ask === 900000, "row 7 Georgetown inland changed");
/* Row 8 CORRECTED: sales under $400,000 within half a mile. */
must(D.near_sales_under["400000"] === 72 && Math.round(NEAR4.near.sales / 72) === 6, "row 8 share changed");
const U4 = D.near_sales_under_400k_by_stretch;
must(U4[NMB] === 49 && U4[MB] === 18 && U4[SGM] === 5, "row 8 by stretch changed");
/* Row 9: the county's houses. */
const SB = F.stock.by_band, HALF = SB["under 1/4 mile"].houses + SB["1/4 to 1/2 mile"].houses;
must(F.stock.county_houses_total === 130922 && HALF === 10417, "row 9 changed");
/* Row 10 CORRECTED: the walk. */
const WB = W.by_walk_band;
must(W.houses_routed === 721 && WB["under 1/4 mile"].houses === 186 && WB["under 1/4 mile"].median_ask === 950000, "row 10 under a quarter mile changed");
must(WB["1/4 to 1/2 mile"].houses === 109 && WB["1/4 to 1/2 mile"].median_ask === 680000 && WB["1/2 to 1 mile"].houses === 104 && WB["1/2 to 1 mile"].median_ask === 650000, "row 10 bands changed");
/* Row 10b CORRECTED. */
const WL = W.walk_vs_line;
must(WL.line_under_half_mile === 356 && WL.line_under_half_mile_but_walk_over_one_mile === 27 && Math.round(WL.median_ratio_walk_to_line_for_line_under_half_mile * 10) / 10 === 1.1, "row 10b changed");
const LONG_GT = 18;
must(Math.round(356 / 27) === 13 && Math.round(LONG_GT / 27 * 3) === 2, "row 10b shares changed");                                                                  // row 10b, verifier: 18 of the 27 on the Litchfield and Pawleys Island coast
/* Row 10c CORRECTED: under $400,000 within a 10-minute walk. */
const u10 = (s) => W.by_stretch[s]["under 1/4 mile"].under_400k + W.by_stretch[s]["1/4 to 1/2 mile"].under_400k;
must(u10(NMB) === 14 && u10(MB) === 5 && u10(SGM) === 1 && u10(GT) === 0, "row 10c changed");
/* Row 11 CORRECTED: accesses per mile on the state's map. */
must(A["North Myrtle Beach"].avg_gap_feet === 250 && A["Surfside Beach"].avg_gap_feet === 352 && A["Myrtle Beach"].avg_gap_feet === 387 && A["Garden City, both counties"].avg_gap_feet === 414, "row 11 gaps changed");
must(Math.round(A["Garden City, both counties"].per_mile) === 13 && A["Pawley's Island"].avg_gap_feet === 2433, "row 11 Garden City or Pawleys changed");
/* Row 13: the nearest access, straight line. */
const NA = F.access.houses_within_half_mile_to_nearest_access_miles;
must(NA.median === 0.19 && Math.round(NA.median * 5280 / 100) * 100 === 1000 && Math.round(NA.pct_within_quarter / 10) === 6, "row 13 changed");
/* Row 14: Kings Highway in Myrtle Beach. */
const KH = K["Myrtle Beach"];
must(KH.median_miles === 0.47 && KH.min === 0.18 && KH.max === 1.27, "row 14 changed");
/* Row 15 CORRECTED: the search filters (as the search returns them, campground homes included). */
const SK = F0.listings.search_keys_measured;
must(SK.walk_to_beach.median_miles === 0.25 && SK.walk_to_beach.p90_miles === 0.55 && SK.near_beach.median_miles === 0.73 && SK.near_beach.p90_miles === 2.01 && SK.east_of_17.median_miles === 0.45, "row 15 changed");
/* Rows 16, 17 CORRECTED: flood by distance. */
const pctHR = (b) => (SB[b]["A or AE"] + SB[b].VE) / SB[b].houses * 100;
must(Math.round(pctHR("under 1/4 mile")) === 52 && Math.round(pctHR("1/4 to 1/2 mile")) === 23 && Math.round(100 / pctHR("1/2 to 1 mile")) === 15, "row 16 changed");
must((SB["under 1/4 mile"].VE + SB["1/4 to 1/2 mile"].VE) / HALF < 1 / 50, "row 16 VE changed");
const TW = F.stock.high_risk_by_twentieth_mile;
must(TW["0.6"].pct_high_risk === 9.3 && TW["0.65"].pct_high_risk === 10 && TW["0.75"].pct_high_risk === 4.6 && TW["0.85"].pct_high_risk === 0.9, "row 17 changed");
must(Object.keys(TW).filter((k) => +k >= 0.75).every((k) => TW[k].pct_high_risk < 5), "row 17: past three quarters of a mile, fewer than 1 in 20");
/* Row 18: flood within half a mile by stretch. */
const WH = F.stock.within_half_mile_by_stretch, hr = (s) => (WH[s]["A or AE"] + WH[s].VE) / WH[s].houses;
must(Math.round(1 / hr(MB)) === 11 && Math.round(hr(NMB) * 10) === 4 && Math.round(hr(SGM) * 10) === 5, "row 18 changed");
/* Row 21 CORRECTED: no HOA fee. */
must(L14.no_hoa === 155 && L12.no_hoa === 97 && L25.no_hoa === 91 && Math.round(L14.no_hoa / L14.listings * 4) === 3 && Math.round(L25.listings / L25.no_hoa) === 10, "row 21 changed");
/* Carried rows, typed in their rows' wording. */
const TOWN_ACCESS = { mb: 143, nmb: "over 240", surfside: 36, pawleys: 8 };          // row 12
const FEMA = { outside: 550, inside: 1070, notLivedIn: 1370 };                         // row 20 (cost-to-own row 23)
const DRIVE = { cf: 20, conway: 30 };                                                // row 24 (relocating-which-town row 17)
/* Row 26 VERIFIED-BY-FIXER (fix round 1): what a budget buys within a 10-minute walk, and the live North Myrtle Beach search. */
const BUD = read("fix1-walk-budget.json"), U = BUD.under_400k, M46 = BUD["400k_to_600k"], LIVE = BUD.live_nmb_walk_under_400k;
must(U.houses === 20 && U.median_sqft === 1360 && U.beds["3"] === 13 && U.by_stretch[NMB] === 14 && U.by_stretch[MB] === 5, "row 26 under $400,000 changed");
const UST = Object.fromEntries(U.streets_by_stretch[NMB]), UMB = Object.fromEntries(U.streets_by_stretch[MB]);
must(UST["Edge Dr."] === 3 && UST["Hillside Dr. S"] === 3 && UMB["Collins St."] === 2 && UMB["N Oak St."] === 1, "row 26 streets changed");
must(M46.houses === 51 && M46.beds["3"] === 38 && M46.median_sqft === 1460, "row 26 $400,000 to $600,000 changed");
must(LIVE.total === 19 && LIVE.campground_homes === 0 && LIVE.by_part["Crescent Beach"] === 12, "row 26 live search changed");
/* Carried from the 2026-11-a ledgers (VERIFIED rows), in their wording: NMB rows 1, 5, 11, 23, 30, 31, 32, 46; MB rows 1, 8, 20, 41;
   Surfside rows 17, 40, 49; Garden City rows 1, 3, 41, 44; Pawleys rows 2, 40, 42, 49, 56, 57. Rows 27 to 31 here. */

/* ---------------------------------------------------------------------------- */
/* Chart 1 (row 2): what a house sold for, by distance from the ocean.            */

const bandName = { "under 1/4 mile": "Under a quarter mile", "1/4 to 1/2 mile": "A quarter to half a mile", "1/2 to 1 mile": "Half a mile to 1 mile",
  "1 to 2 miles": "1 to 2 miles", "2 to 5 miles": "2 to 5 miles", "5 to 10 miles": "5 to 10 miles", "10 miles or more": "10 miles or more" };
const PRICE_CHART = G.bars(BANDS.map((b, i) => ({ name: bandName[b], value: DB[b].median, valueText: k5(DB[b].median), reference: i >= 4 })),
  { caption: "What a house sold for, by distance from the ocean", nameLabel: "Distance from the ocean", valueLabel: "Middle sale price", compact: true,
    note: "Houses sold in Horry County in the last year, from the county's deed records. The middle price: half sold for more, half for less. Gray bars: 2 miles or more inland." });

/* ---------------------------------------------------------------------------- */
/* Chart 2 (rows 16, 17): the share of houses in the high-risk flood zone, by twentieth of a mile. */

const f1 = (v) => Math.round(v * 10) / 10;
const FLOOD_CHART = (() => {
  const keys = Object.keys(TW).sort((a, b) => +a - +b);
  must(keys.length === 20 && keys[0] === "0.0" && keys[19] === "0.95", "the flood chart's twentieths changed");
  const Wd = 360, Ht = 230, L0 = 40, R0 = 352, T0 = 14, B0 = 186, MAX = 80, bw = (R0 - L0) / keys.length;
  const Y = (v) => B0 - v / MAX * (B0 - T0);
  const grid = [0, 25, 50, 75].map((v) => `<line x1="${L0}" x2="${R0}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="#1c2028" stroke-opacity="${v ? ".1" : ".35"}"/><text x="${L0 - 6}" y="${f1(Y(v) + 5)}" text-anchor="end">${v}%</text>`).join("");
  const cols = keys.map((k, i) => { const v = TW[k].pct_high_risk, x = L0 + i * bw + bw * 0.12, w = bw * 0.76;
    return `<rect x="${f1(x)}" y="${f1(Y(v))}" width="${f1(w)}" height="${f1(Math.max(B0 - Y(v), 1))}" rx="2" fill="${+k < 0.5 ? "#c4783a" : "#d9b48f"}"/>`; }).join("");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((m) => { const x = L0 + m * (R0 - L0);
    return `<line x1="${f1(x)}" x2="${f1(x)}" y1="${B0}" y2="${B0 + 5}" stroke="#1c2028" stroke-opacity=".35"/><text x="${f1(x)}" y="${B0 + 22}" text-anchor="${m === 0 ? "start" : m === 1 ? "end" : "middle"}">${m === 0 ? "0" : m === 1 ? "1 mile" : m === 0.25 ? "¼" : m === 0.5 ? "½" : "¾"}</text>`; }).join("");
  const desc = keys.map((k) => `${k} to ${f1(+k + 0.05)} mile, ${Math.round(TW[k].pct_high_risk)} percent`).join("; ");
  const svg = `<svg class="nb-cols" viewBox="0 0 ${Wd} ${Ht}" width="100%" role="img" aria-label="Column chart of the share of Horry County houses in FEMA's high-risk flood zone, by distance from the ocean in twentieths of a mile: ${desc}.">${grid}${cols}${ticks}<text x="${(L0 + R0) / 2}" y="${Ht - 4}" text-anchor="middle">Distance from the ocean</text></svg>`;
  return `<figure class="c3-gchart nb-fig"><span class="cap nb-cap">Share of houses in the high-risk flood zone, by distance from the ocean</span>${svg}<figcaption>Each column is a twentieth of a mile, about 260 feet. Darker: the first half mile. Horry County houses, with FEMA's flood zones from the county's map, at the middle of each lot.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Our map (rows 11, 13): the coast from Pawleys Island to Cherry Grove, turned so the shore runs across the
   screen. The land within half a mile of the ocean is shaded; each dot is a public beach access on the state's
   map; the numbers are the four stretches, in the order of the entries below.                                     */

const MAP = (() => {
  const feat = (f) => LAYERS.features.filter(f);
  const shore = feat((x) => x.properties.layer === "shore")[0].geometry.coordinates;
  let half = feat((x) => x.properties.layer === "band" && x.properties.miles === 0.5)[0].geometry.coordinates;
  const pts = feat((x) => x.properties.layer === "access").map((x) => x.geometry.coordinates);
  must(pts.length === 451 && shore.length > 100, "the map layers changed");
  const lat0 = 33.6, lon0 = -78.9, c = Math.cos(lat0 * Math.PI / 180);
  const P = ([lo, la]) => [(lo - lon0) * 111.32 * c, (la - lat0) * 110.57];
  const s0 = P(shore[0]), s1 = P(shore[shore.length - 1]), th = Math.atan2(s1[1] - s0[1], s1[0] - s0[0]);
  const R = ([x, y]) => [x * Math.cos(th) + y * Math.sin(th), -(-x * Math.sin(th) + y * Math.cos(th))];
  const T = (ll) => R(P(ll));
  const sr = shore.map(T);
  const d0 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  if (d0(T(half[0]), sr[0]) > d0(T(half[half.length - 1]), sr[0])) half = half.slice().reverse();
  const hr2 = half.map(T);
  const xs = sr.map((p) => p[0]), ys = sr.concat(hr2).map((p) => p[1]);
  const pad = 2.2, x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - 9.5, y1 = Math.max(...ys) + 1.2;
  const VW = 1000, sc = VW / (x1 - x0), VH = Math.round((y1 - y0) * sc);
  const V = ([x, y]) => [f1((x - x0) * sc), f1((y - y0) * sc)];
  const path = (arr) => arr.map((p, i) => (i ? "L" : "M") + V(p).join(" ")).join("");
  const sea = path(sr) + `L${VW} ${f1(Math.max(...sr.map((p) => V(p)[1])))}L${VW} ${VH}L0 ${VH}L0 ${V(sr[0])[1]}Z`;
  const ribbon = path(sr) + hr2.slice().reverse().map((p) => "L" + V(p).join(" ")).join("") + "Z";
  const dots = pts.map((p) => { const [x, y] = V(T(p)); return `<circle cx="${x}" cy="${y}" r="2.6"/>`; }).join("");
  /* The stretch cuts, in miles along the shore from its south end (analyze.py's own cuts). */
  const cum = [0]; for (let i = 1; i < sr.length; i++) cum.push(cum[i - 1] + d0(sr[i], sr[i - 1]) / 1.609344);
  const at = (mi) => { const i = cum.findIndex((v) => v >= mi); const t = (mi - cum[i - 1]) / (cum[i] - cum[i - 1]); return [sr[i - 1][0] + (sr[i][0] - sr[i - 1][0]) * t, sr[i - 1][1] + (sr[i][1] - sr[i - 1][1]) * t]; };
  const CUT = F.stretch_cuts_miles_from_south_end;
  const cuts = [CUT["Murrells Inlet jetty (Garden City end)"], CUT["Surfside Beach north edge (Ocean Lakes line)"], CUT["Briarcliffe Acres"]];
  must(cuts.join() === "19.31,25.91,43.89", "the stretch cuts changed");
  const total = cum[cum.length - 1];
  const tick = (mi) => { const [x, y] = V(at(mi)); return `<line x1="${x}" y1="${f1(y + 16)}" x2="${x}" y2="${f1(y - 40)}" stroke="#1c2028" stroke-width="2" stroke-dasharray="4 4" stroke-opacity=".55"/>`; };
  const mid = [[cuts[2], total], [cuts[1], cuts[2]], [cuts[0], cuts[1]], [0, cuts[0]]].map(([a, b]) => (a + b) / 2);
  const num = (n, mi) => { const [x, y] = V(at(mi)); const yy = f1(y - 64);
    return `<line x1="${x}" y1="${f1(yy + 20)}" x2="${x}" y2="${f1(y - 8)}" stroke="#1c2028" stroke-width="2"/><circle class="mk" cx="${x}" cy="${yy}" r="22"/><text class="mn" x="${x}" y="${f1(yy + 8)}" text-anchor="middle">${n}</text>`; };
  const [ox, oy] = V(at(33)), ocean = `<text class="oc" x="${ox}" y="${f1(oy + 80)}" text-anchor="middle">Atlantic Ocean</text>`;
  /* North arrow. R sends north (0, 1) to (sin th, -cos th) on screen: right and up, away from the ocean at the bottom
     and toward the Cherry Grove end at the right. The arrow is drawn pointing up, so it turns clockwise by th. */
  const na = (() => { const ang = th * 180 / Math.PI, cx = 60, cy = 58, r = Math.PI / 180 * ang;
    must(ang > 20 && ang < 70, "the north arrow's angle changed");
    return `<g transform="translate(${cx} ${cy}) rotate(${f1(ang)})"><path d="M0 18V-12" stroke="#1c2028" stroke-width="3"/><path d="M0 -26L8 -9L-8 -9Z" fill="#1c2028"/></g><text class="sm" x="${f1(cx + 42 * Math.sin(r))}" y="${f1(cy - 42 * Math.cos(r) + 7)}" text-anchor="middle">N</text>`; })();
  const fiveMi = 5 * 1.609344 * sc, sbx = VW - 40 - fiveMi, sby = 40;
  const scale = `<path d="M${f1(sbx)} ${sby}h${f1(fiveMi)}" stroke="#1c2028" stroke-width="3"/><path d="M${f1(sbx)} ${sby - 7}v14M${f1(sbx + fiveMi)} ${sby - 7}v14" stroke="#1c2028" stroke-width="2"/><text class="sm" x="${f1(sbx + fiveMi / 2)}" y="${sby - 12}" text-anchor="middle">5 miles</text>`;
  const svg = `<svg class="nb-map" viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="nb-map-t">`
    + `<title id="nb-map-t">Map of the coast from Pawleys Island at the left to Cherry Grove at the right, turned so the shore runs across. A shaded strip along the shore is the land within half a mile of the ocean. Dots along the shore are public beach accesses: close together from Garden City to Cherry Grove, far apart at the two state parks and on Pawleys Island. Numbers mark the four stretches: 1 North Myrtle Beach and Cherry Grove, 2 Myrtle Beach, 3 Surfside Beach, Garden City and Murrells Inlet, 4 Litchfield and Pawleys Island.</title>`
    + `<rect width="${VW}" height="${VH}" fill="#fbf8f3"/>`
    + `<path d="${sea}" fill="#d3e0e5"/>`
    + `<path d="${ribbon}" fill="#e8c99a" fill-opacity=".85"/>`
    + `<path d="${path(sr)}" fill="none" stroke="#3f6275" stroke-width="2"/>`
    + `<g fill="#1c2028" fill-opacity=".75">${dots}</g>`
    + cuts.map(tick).join("")
    + mid.map((mi, i) => num(i + 1, mi)).join("")
    + ocean + na + scale + `</svg>`;
  return svg;
})();
const ENTRY_IDS = ["north-myrtle-beach", "myrtle-beach", "surfside-to-murrells-inlet", "litchfield-and-pawleys-island"];
const ENTRY_NAMES = ["North Myrtle Beach and Cherry Grove", "Myrtle Beach, east of Kings Highway", "Surfside Beach, Garden City and Murrells Inlet", "Litchfield and Pawleys Island"];
const MAP_FIG = `<figure class="nb-mapfig"><div class="nb-mapframe">${MAP}</div>`
  + `<ol class="nb-key" aria-label="The four stretches on the map">${ENTRY_NAMES.map((nm, i) => `<li><span class="n" aria-hidden="true">${i + 1}</span><a href="#${ENTRY_IDS[i]}">${nm}</a></li>`).join("")}</ol>`
  + `<figcaption>The tan strip is the land within half a mile of the ocean. Each dot is a public beach access on the state's map. The dots are close together from Garden City to Cherry Grove, and far apart at Huntington Beach State Park and on Pawleys Island. Shoreline: U.S. Census Bureau TIGER/Line, public domain. Accesses: SC Department of Environmental Services. Map: Chapter3 Realty.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* Photos (VERIFY.md Photos): the records already on the site, captions per the verifier.                         */

const rec = (slug, part) => {
  const r = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-a", slug, "photos.json"), "utf8")).photos.find((p) => p.file.includes(part));
  must(r, `photo record ${part} missing`);
  return r;
};
const GC = read("photos.json").photos.find((p) => p.file.includes("garden-city-beach-and-marsh-from-the-ocean"));
must(GC && GC.crops && GC.crops["16x9"], "the Garden City record or its crops are missing");
const MBP = rec("submarkets-myrtle-beach", "oceanfront-houses-from-the-ocean");
const CG = rec("submarkets-north-myrtle-beach", "cherry-grove-channels-from-above");
const SS = rec("submarkets-surfside-beach", "surfside-beach-houses-from-the-sand");
const CAP = {
  gc: "Garden City Beach from over the ocean: the oceanfront row of houses, two more rows behind it, and the salt marsh behind them.",
  mb: "Houses on wide lawns facing the beach north of downtown Myrtle Beach, with Ocean Boulevard and streets of houses under oaks behind them.",
  cg: "Houses on the Cherry Grove channels, many with a dock behind them, between the marsh and the beach. The boat ramp and Heritage Shores are at the top.",
  ss: "The oceanfront row of beach houses at Surfside Beach, seen from the sand.",
};
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
const side = (r, caption, cls = "") => lazy(PH.heroPhoto(r, { alt: r.alt, caption, maxWidth: "720px", sizes: "(max-width: 700px) 100vw, (max-width: 1099px) 720px, 380px" })).replace('<figure class="c3ph-hero"', `<figure class="c3ph-hero nb-side-ph${cls ? " " + cls : ""}"`);
const HERO_PHOTO = PH.heroPhoto(GC, { alt: GC.alt, caption: CAP.gc, sizes: "(max-width: 1099px) 100vw, 380px" }).replace('<figure class="c3ph-hero"', '<figure class="c3ph-hero nb-hero"');
const SHOWN = [GC, CG, MBP, SS];
const CREDITS = PH.creditsList([{ photo: GC, caption: "Garden City Beach from over the ocean" }, { photo: CG, caption: "The Cherry Grove channels from above" },
  { photo: MBP, caption: "Oceanfront houses in Myrtle Beach" }, { photo: SS, caption: "Beach houses at Surfside Beach" }]);
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not insurers or attorneys, and nothing on this page is insurance or legal advice. The flood zone and the cost of a policy depend on the one house; an insurance agent quotes the policy.</p>`;

/* ---------------------------------------------------------------------------- */
/* Blocks.                                                                        */

const stat = (label, items) => `<div class="nb-stat"><p class="k">${label}</p><ul>`
  + items.map(([big, text]) => `<li><strong>${big}</strong><span>${text}</span></li>`).join("") + `</ul></div>`;
const WALK_STAT = stat("Houses for sale, by the walk to the nearest public path to the sand", [
  [`${WB["under 1/4 mile"].houses} for sale`, `a ${nw("5-minute")} walk or less. Middle asking price about ${k5(WB["under 1/4 mile"].median_ask)}.`],
  [`${WB["1/4 to 1/2 mile"].houses} for sale`, `a ${nw("5- to 10-minute")} walk. Middle asking price about ${k5(WB["1/4 to 1/2 mile"].median_ask)}.`],
  [`${WB["1/2 to 1 mile"].houses} for sale`, `a ${nw("10- to 20-minute")} walk. Middle asking price about ${k5(WB["1/2 to 1 mile"].median_ask)}.`],
]);
const FLOOD_STAT = stat("Houses within half a mile of the ocean in the high-risk flood zone", [
  [`About 1 in ${Math.round(1 / hr(MB))}`, "on the Myrtle Beach stretch, from Briarcliffe Acres to Surfside Beach"],
  ["About 4 in 10", "in North Myrtle Beach and Cherry Grove"],
  ["About half", "from Surfside Beach to Murrells Inlet"],
]);
const BUDGET_TABLE = `<table class="nb-tbl"><caption>Houses for sale a 10-minute walk or less from a beach path, by price</caption>`
  + `<thead><tr><th scope="col">Asking price</th><th scope="col">Houses</th><th scope="col">Middle size</th><th scope="col">Most have</th></tr></thead><tbody>`
  + `<tr><th scope="row">Under ${money(400000)}</th><td data-l="Houses">${U.houses}</td><td data-l="Middle size">${n0(U.median_sqft)} sq ft</td><td data-l="Most have">3 bedrooms</td></tr>`
  + `<tr><th scope="row">${money(400000)} to ${money(600000)}</th><td data-l="Houses">${M46.houses}</td><td data-l="Middle size">${n0(M46.median_sqft)} sq ft</td><td data-l="Most have">3 bedrooms</td></tr>`
  + `</tbody></table><p class="nb-note">Our count of the houses for sale on our site, with campground homes on leased sites left out. The walk follows mapped streets and paths. Middle size: half are bigger, half smaller.</p>`;
const plain = (label, items) => `<ul class="nb-plain" aria-label="${label}">` + items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("") + `</ul>`;
const place = (id, n, name, line) => `<h3 id="${id}" class="nb-place" data-n="${n}">${name}</h3><p class="nb-line">${line}</p>`;
const ask = (placeName, label) => G.offer(placeName, { label });

/* ---------------------------------------------------------------------------- */
/* The page's own styles (the pilots' treatment, prefix nb-).                     */

const INK = "#8a5226", RULE = "rgba(28,32,40,.16)";
const S = "main#main";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line. */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  /* The hero: the photo beside the key facts and the byline on a wide screen; after them on a narrower one. */
  + `${S} .detail-hero .detail-media{display:contents}${S} .detail-hero .c3-glance{margin-bottom:1.2rem}`
  + `${S} .detail-hero figure.nb-hero{margin:.4rem 0 0!important;max-width:640px;background:none!important;border:0!important;box-shadow:none!important;padding:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}`
  + `${S} .detail-hero figure.nb-hero figcaption{padding:.55rem 0 0!important;font-size:.92rem;color:var(--muted);line-height:1.5}`
  + `@media (max-width:1099px){${S} .detail-hero .wrap{display:flex;flex-direction:column}${S} .detail-hero figure.nb-hero{order:9}}`
  + `@media (min-width:700px) and (max-width:1099px){${S} .detail-hero figure.nb-hero{max-width:440px}}`
  + `@media (min-width:1100px){${S} .detail-hero .wrap{display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:repeat(6,auto) 1fr;column-gap:3rem}`
  + `${S} .detail-hero .wrap>*,${S} .detail-hero .c3-glance{grid-column:1}`
  + `${S} .detail-hero .breadcrumb,${S} .detail-hero .eyebrow,${S} .detail-hero .detail-h1{grid-column:1/-1}`
  + `${S} .detail-hero figure.nb-hero{grid-column:2;grid-row:4/8;align-self:start;margin:0!important;width:380px}${S} .detail-h1 em{font-size:min(.5em,2.25rem)}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid ${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid ${RULE}!important}}`
  /* One block width (720 px, as the contents box and the offers). */
  + `${S} .c3-gchart,${S} div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box}`
  + `${S} .nb-cap{display:block;color:var(--navy);font-weight:600;font-size:1.0625rem;line-height:1.35;margin:0 0 .5rem}`
  + `${S} svg.nb-cols{display:block}${S} svg.nb-cols text{font-family:var(--sans),system-ui,sans-serif;font-size:13px;fill:#4a5763}`
  + `${S} .nb-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}`
  /* large numbers under a thin rule, no box */
  + `${S} .nb-stat{max-width:720px;margin:1.2rem 0 1.5rem}`
  + `${S} .nb-stat .k{font-family:var(--sans);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .6rem}`
  + `${S} .nb-stat ul{list-style:none;margin:0;padding:0;display:grid;gap:1rem 1.6rem}@media (min-width:700px){${S} .nb-stat ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .nb-stat li{margin:0;padding:.75rem 0 0;border-top:1px solid ${RULE}}${S} .nb-stat strong{display:block;color:var(--navy);font-family:var(--serif);font-weight:400;font-size:clamp(1.6rem,5vw,2rem);line-height:1.05;margin-bottom:.3rem}`
  + `${S} .nb-stat span{display:block;color:var(--muted);line-height:1.5;font-size:1rem}`
  /* the stretch table: plain rows under thin rules; on a phone each row is a block */
  + `${S} .nb-tbl{width:100%;max-width:720px;border-collapse:collapse;margin:1rem 0 .6rem;font-size:1rem;font-variant-numeric:tabular-nums}`
  + `${S} .nb-tbl caption{caption-side:top;text-align:left;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1.0625rem;margin-bottom:.6rem}`
  + `${S} .nb-tbl thead th{padding:.5rem .6rem .5rem 0;border-bottom:2px solid var(--navy);color:var(--navy);text-align:right;font-family:var(--sans);font-size:.8rem;letter-spacing:.05em;text-transform:uppercase;vertical-align:bottom;line-height:1.3}`
  + `${S} .nb-tbl thead th:first-child,${S} .nb-tbl tbody th{text-align:left}`
  + `${S} .nb-tbl tbody th,${S} .nb-tbl td{padding:.7rem .6rem .7rem 0;border-bottom:1px solid ${RULE};vertical-align:top;line-height:1.45}`
  + `${S} .nb-tbl tbody th{font-family:var(--sans);font-weight:600;color:var(--navy)}${S} .nb-tbl td{text-align:right;color:var(--muted);white-space:nowrap}`
  + `@media (max-width:699px){${S} .nb-tbl thead{display:none}${S} .nb-tbl,${S} .nb-tbl tbody,${S} .nb-tbl tr,${S} .nb-tbl tbody th,${S} .nb-tbl td{display:block;width:auto}`
  + `${S} .nb-tbl tr{padding:.75rem 0;border-bottom:1px solid ${RULE}}${S} .nb-tbl tbody th,${S} .nb-tbl td{padding:0;border:0!important;text-align:left}`
  + `${S} .nb-tbl tbody th{font-size:1.0625rem;margin-bottom:.25rem}${S} .nb-tbl td{display:flex;justify-content:space-between;gap:1rem;white-space:normal;color:var(--navy)}`
  + `${S} .nb-tbl td::before{content:attr(data-l);color:var(--muted)}${S} .nb-tbl caption{display:block;width:auto}}`
  + `${S} .nb-note{max-width:720px;color:var(--muted);font-size:.95rem;line-height:1.55;margin:.4rem 0 1.4rem}`
  /* short facts: a plain list under thin rules */
  + `${S} .nb-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:0 2rem;max-width:720px}`
  + `${S} .nb-plain li{margin:0;padding:.85rem 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}${S} .nb-plain li:last-child{border-bottom:1px solid ${RULE}}`
  + `${S} .nb-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.3rem}`
  + `@media (min-width:760px){${S} .nb-pc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 2rem;max-width:720px}${S} .nb-pc .nb-plain{margin-top:.4rem}}`
  + `${S} .nb-pc h3{margin-top:1.2rem!important}`
  /* the map: no card; the picture keeps round corners, the key and the caption sit under it */
  + `${S} figure.nb-mapfig{max-width:720px;margin:1.3rem 0 1.6rem;padding:0!important;background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}`
  + `${S} .nb-mapframe{border-radius:14px;overflow:hidden;box-shadow:0 10px 26px -18px rgba(28,32,40,.35)}${S} svg.nb-map{display:block;width:100%;height:auto}`
  + `${S} svg.nb-map text{font-family:var(--sans),system-ui,sans-serif;fill:#1c2028}${S} svg.nb-map .mk{fill:#1c2028}${S} svg.nb-map .mn{fill:#fff;font-weight:700;font-size:26px}`
  + `${S} svg.nb-map .oc{font-style:italic;font-size:22px;fill:#3f6275}${S} svg.nb-map .sm{font-size:18px}`
  + `@media (max-width:699px){${S} svg.nb-map .mn{font-size:38px}${S} svg.nb-map .mk{r:32px}${S} svg.nb-map .oc,${S} svg.nb-map .sm{font-size:32px}}`
  + `${S} .nb-key{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.35rem 1.6rem}@media (min-width:700px){${S} .nb-key{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .nb-key li{display:flex;gap:.6rem;align-items:center;margin:0;font-size:1rem;line-height:1.4}${S} .nb-key a{color:var(--navy)}`
  + `${S} .nb-key .n,${S} .nb-n{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.9rem}`
  + `${S} .nb-mapfig figcaption{color:var(--muted);font-size:.92rem;line-height:1.5;padding:.7rem 0 0!important}`
  /* each stretch starts under a rule, with a heading that can be found while scrolling */
  + `${S} .nb-place{clear:both;margin:2.8rem 0 .9rem;padding-top:1.5rem;border-top:1px solid ${RULE};font-family:var(--serif);font-size:1.6rem;font-weight:500;color:var(--navy);line-height:1.2;max-width:720px}`
  + `${S} .nb-place::before{content:attr(data-n);display:inline-flex;align-items:center;justify-content:center;width:1.9rem;height:1.9rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:1rem;margin-right:.6rem;vertical-align:.2rem}`
  + `${S} p.nb-line{font-family:var(--sans);font-size:1rem;font-weight:600;color:${INK};letter-spacing:.01em;margin:-.5rem 0 1rem;max-width:720px;line-height:1.4}`
  /* photos sit on the page: the picture and its caption, no card around it */
  + `${S} figure.nb-side-ph{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;max-width:720px;margin:1.3rem 0 1.5rem}`
  + `${S} figure.nb-side-ph .c3ph-f{border-radius:14px!important}${S} figure.nb-side-ph figcaption{padding:.55rem 0 0!important;font-size:.92rem;color:var(--muted);line-height:1.5}`
  /* A wide screen: the chart or the photo beside the paragraphs that explain it. */
  + `@media (min-width:1100px){${S} .nb-side{display:grid;grid-template-columns:minmax(0,1fr) 380px;column-gap:2.5rem;max-width:1100px;align-items:start}`
  + `${S} .nb-side>*{grid-column:1}${S} .nb-side>.nb-aside{grid-column:2;grid-row:1/span 6;margin:.3rem 0 1.2rem!important;max-width:none!important;position:sticky;top:110px}`
  + `${S} .nb-side>.nb-aside figure,${S} .nb-side>figure.nb-aside{margin:0!important}}`
  + `@media (min-width:1100px){${S}>section>.wrap:has(.nb-side-ph){display:flow-root}${S} figure.nb-side-ph{float:right;clear:right;width:380px;max-width:380px!important;margin:.35rem 0 1.4rem 2rem!important}}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .nb-plain b,${S} a.btn{text-wrap:balance}${S} .nb-nw,${S} .nb-stat span.nb-nw{display:inline;white-space:nowrap}`
  /* the labelled aerial: the whole picture, never cropped, with the credit at the lower left, clear of the "Atlantic Ocean" label */
  + `${S} figure.nb-full img{aspect-ratio:auto!important}${S} figure.nb-full .c3ph-cr{left:0!important;right:auto!important;text-align:left!important;padding:1.6rem 2.6rem .35rem .6rem!important;background:radial-gradient(farthest-side at 0% 100%,rgba(28,32,40,.72),rgba(28,32,40,.4) 55%,rgba(28,32,40,0))!important}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* Work-arounds copied from the pilots: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* The FAQ: questions the body does not answer in the same words, each with its own fact.                         */

const FAQ = [
  { q: "Is Myrtle Beach in a flood zone?", a: "Parts of it are. Inside the City of Myrtle Beach, only about 1 in 23 houses is in FEMA's high-risk flood zone. About 1 in 4 condos in the city is." },
  { q: "Can you rent out a house near the beach in Myrtle Beach?", a: "The rules differ by city. In the City of Myrtle Beach, a rental of less than 90 days is legal only where the zoning allows it. About 96 in 100 houses there are not in those zones. North Myrtle Beach allows short-term rentals across the city, with a city business license renewed each year." },
  { q: "Is a condo near the beach cheaper than a house?", a: "In North Myrtle Beach, yes. In its beach sections, a condo sold for about $310,000 to $360,000 at the middle in the last year. This page covers houses; our condos page covers condos." },
  { q: "What is a second-row house at the beach?", a: "A second-row house is in the row just behind the oceanfront houses. Our waterfront homes page covers the oceanfront row itself." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: `Houses Near the Beach in Myrtle Beach: ${WB["under 1/4 mile"].houses} a 5-Minute Walk`,
  pageImages: () => PH.pageImages(GC),
  description: `Where to buy a house you can walk to the beach from near Myrtle Beach: the walk to the sand, the beach towns, what houses cost by distance, and the flood zone.`,
  ogTitle: "Houses near the beach in Myrtle Beach: the walk to the sand, the beach towns, the price by distance and the flood zone",
  crumb: "Houses Near the Beach",
  eyebrow: "Buying a home",
  h1: "Houses near the beach in Myrtle Beach:",
  h1em: `${WB["under 1/4 mile"].houses} for sale a 5-minute walk from a public path to the sand.`,
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. */
  sub: "Where the houses a walk from the sand are near Myrtle Beach, what each beach town is like, what houses cost, and the flood zone.",
  heroMedia: CSS + glance([
    { icon: "beach", label: `${U.houses} under ${money(400000)}`, text: "a 10-minute walk or less from a public path to the sand" },
    { icon: "pin", label: "About 1 every 250 to 400 feet", text: "a public path to the sand in the beach towns" },
  ]) + HERO_PHOTO,
  heroCta: { title: "Tell us your budget and how far you will walk.", label: "Send us your budget", href: CTA },
  topOfferLine: "Tell us your budget and how far you will walk. We send the houses that fit.",
  author: "devin",
  shortAnswer: [
    `On ${DAY}, ${WB["under 1/4 mile"].houses} houses for sale near the beach were a ${nw("5-minute")} walk or less from a public path to the sand. They are spread from Cherry Grove to Pawleys Island. About half the houses under $400,000 a 10-minute walk or less from the sand are in Crescent Beach, in North Myrtle Beach.`,
    `In the last year, a Horry County house within half a mile of the ocean sold for about ${k5(NEAR4.near.median)} at the middle. That means half sold for more and half for less. ${nw("Two to 5")} miles inland, the middle was about ${k5(NEAR4.two_to_five.median)}.`,
  ],
  sections: [
    { h2: "How far is the walk to the beach from a house near the beach?", toc: "The walk", id: "walk", html: (bg) =>
      h.p(`We checked the walk to the sand from the houses for sale within 1.5 miles of the ocean. Each walk follows mapped streets and paths to the nearest public beach access on the state's map. A quarter mile takes about 5 minutes on foot, and half a mile about 10.`) +
      h.p(`In the beach towns, the state's map shows a public path to the sand about every 250 to 400 feet. North Myrtle Beach manages ${TOWN_ACCESS.nmb} beach accesses, and Myrtle Beach counts ${TOWN_ACCESS.mb}.`) +
      WALK_STAT +
      `<p class="nb-note">These are asking prices for houses for sale today. The sale prices on this page are what houses sold for in the last year, from the county's deed records.</p>` +
      h.p(`A house that looks close on a map can still be a long walk. About 1 in ${Math.round(WL.line_under_half_mile / WL.line_under_half_mile_but_walk_over_one_mile)} houses for sale within half a mile of the ocean is more than a mile on foot from a public path. Two in 3 of those are on the Litchfield and Pawleys Island coast, where the paths are far apart.`) +
      h.p(`Parking at the beach, resident passes and the beach rules are on our ${h.a("/buyers/relocating/beaches/", "page on the beaches")}.`) +
      h.cta("How far is the walk from that house to the sand?", "Send us the listing. We measure the walk to the nearest public beach access and look up the flood zone the house is in.", "Have us measure the walk", CTA, bg) },

    { h2: "Which beach town near Myrtle Beach fits you?", toc: "The beach towns", id: "towns", html: () =>
      h.p("The coast from Cherry Grove to Pawleys Island is four stretches of beach towns, one after another. Here they are from north to south.") +
      MAP_FIG +

      place(ENTRY_IDS[0], 1, ENTRY_NAMES[0], "Four old beach towns, marsh channels") +
      h.p("North Myrtle Beach is four old beach towns that voted to join in 1968: Cherry Grove, Ocean Drive, Crescent Beach and Windy Hill.") +
      side(CG, CAP.cg, "nb-full") +
      plain("The four old beach towns", [
        ["Cherry Grove", "The quieter beach, at the north end. About 680 houses here are on long channels dug in the marsh, often with a dock. The city's boat ramp reaches the ocean through Hog Inlet. Heritage Shores Nature Preserve has about 7 acres of paths on an island in the marsh."],
        ["Ocean Drive", "Main Street, and the Ingram Dunes Nature Preserve, with dunes 30 feet tall and a half-mile trail. In Ocean Drive and Crescent Beach, a pavilion drew crowds to dance the shag, now South Carolina's state dance."],
        ["Crescent Beach", `South of Ocean Drive, with the 18th and Edge pocket park.`],
        ["Windy Hill", "Past the separate town of Atlantic Beach. Investors from Conway built it up after World War II. It has Yow Park and the 41st Avenue South pocket park."],
      ]) +
      h.p(`Houses near the ocean here sold for about ${k5(near(NMB))} at the middle in the last year. Our ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach page")} covers each part of the city.`) +
        G.homesCss() + G.homes("beach-walk-north-myrtle-beach", "North Myrtle Beach beach-walk houses", "", "Houses a walk from the beach in North Myrtle Beach") +
      ask("North Myrtle Beach", "Have us find a house in North Myrtle Beach") +

      place(ENTRY_IDS[1], 2, ENTRY_NAMES[1], "The boardwalk, the busy beach, and the fewest houses in the flood zone") +
      h.p(`In Myrtle Beach, the main road near the ocean is Kings Highway, also called US 17 Business. We measured its distance from the ocean along its whole length in the city. For half of it, the road is within about half a mile of the ocean.`) +
      h.p(`Listings say "east of 17" for the streets between Kings Highway and the sand. Houses marked east of 17 in our home search are a little under half a mile from the ocean at the middle.`) +
      side(MBP, CAP.mb) +
      h.p(`Downtown is the busy beach, with the boardwalk and volleyball. The Boardwalk is about 1.3 miles long, beside the ocean, with a raised wooden walk and a paved walk along the beach.`) +
      h.p(`This stretch runs from Briarcliffe Acres south to Surfside Beach, and includes Arcadian Shores and Myrtle Beach State Park. Within half a mile of the ocean on this stretch, the middle sale price of a house was about ${k5(near(MB))}.`) +
      h.p(`Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach page")} covers the city's neighborhoods and its rental rules.`) +
      ask("Myrtle Beach", "Get the houses near the beach in Myrtle Beach") +

      place(ENTRY_IDS[2], 3, ENTRY_NAMES[2], "A town pier, free county parking, and the marsh at Murrells Inlet") +
      h.p("This stretch is Surfside Beach, Garden City and Murrells Inlet, from north to south.") +
      side(SS, CAP.ss) +
      plain("The three beach places", [
        ["Surfside Beach", "A town of about 1.9 square miles. Every home in it is within about 0.8 mile of Ocean Boulevard, the beach road. The concrete town pier is free to walk on, with two restaurants and an ice cream shop."],
        ["Life in Surfside Beach", "On summer Sunday evenings, the town holds a free concert in Memorial Park. On Memorial Day, the Fourth of July and in December, golf cart parades go down Ocean Boulevard."],
        ["Garden City", "Not a town: Horry County runs it. Its beach road is Waccamaw Drive, and houses on the marsh line Dogwood Drive. Horry County's oceanfront beach accesses here have free parking all year."],
        ["Murrells Inlet", "The MarshWalk is a half-mile wooden boardwalk along the marsh, with restaurants and free live music."],
      ]) +
      h.p(`This stretch has the highest prices of the three in Horry County: about ${k5(near(SGM))} at the middle for a house within half a mile of the ocean. Our pages on ${h.a("/submarkets/surfside-beach/", "Surfside Beach")}, ${h.a("/submarkets/garden-city/", "Garden City")} and ${h.a("/submarkets/murrells-inlet/", "Murrells Inlet")} cover each town.`) +
      ask("Surfside Beach", "Ask about houses in Surfside Beach and Garden City") +

      place(ENTRY_IDS[3], 4, ENTRY_NAMES[3], "A barrier island of old beach houses, and the highest prices") +
      plain("Pawleys Island and Litchfield", [
        ["Pawleys Island", "A barrier island less than 4 miles long, mostly one house wide, with salt marsh behind it. The town has a 25 mph speed limit and no lifeguards on the beach."],
        ["Life on the island", "People crab and fish from the two marsh bridges, and the town still calls itself by its old nickname, \"arrogantly shabby\". On about 6 in 10 island houses, the last deed was not a sale, the way a house passes to children or an estate."],
        ["Litchfield", "The beach between the island and Huntington Beach State Park. A bike path goes along US 17 from behind the island through Litchfield to Murrells Inlet."],
      ]) +
      h.p(`There are fewer public paths here. Pawleys Island has the largest free beach parking lot in Georgetown County, at the south end, and ${TOWN_ACCESS.pawleys} other public accesses. The state's map shows one about every 2,400 feet on the island.`) +
      h.p(`Houses for sale within half a mile of the ocean here ask about ${mil(ls(GT).median_ask)} at the middle. This coast is in Georgetown County, outside the Horry County deed records we used, so we give asking prices here. Our ${h.a("/submarkets/pawleys-island/", "Pawleys Island page")} has the island's own sales and flood zones.`) +
      ask("Pawleys Island", "Ask about houses on Pawleys Island") },

    { h2: "How much does a house near the beach cost in Myrtle Beach?", toc: "What they cost", id: "cost", html: () =>
      h.p(`The nearer the ocean, the more a house sold for. Houses within a quarter mile of the ocean sold for about ${k5(DB["under 1/4 mile"].median)} at the middle in the last year.`) +
      PRICE_CHART +
      h.p(`The price is highest in the first tenth of a mile, about 500 feet. Houses there sold for about ${mil(D.first_tenth_mile.median)}. From half a mile to 2 miles back, the price stays near ${k5(DB["1 to 2 miles"].median)}. Our ${h.a("/buyers/waterfront-homes/", "waterfront homes page")} covers houses on the ocean itself.`) },

    { h2: "Where can you buy a house near the beach for under $400,000?", toc: "Under $400,000", id: "under-400k", html: () =>
      h.p(`About 1 in 6 house sales within half a mile of the ocean was under ${money(400000)} in the last year. Most of those were in North Myrtle Beach and Cherry Grove.`) +
      h.p(`In our count of houses for sale, ${U.houses} under ${money(400000)} were a ${nw("10-minute")} walk or less from a beach path. Of those, ${U.by_stretch[NMB]} were in North Myrtle Beach, most of them in Crescent Beach.`) +
      BUDGET_TABLE +
      h.p(`In North Myrtle Beach, 12 of the ${U.by_stretch[NMB]} are on Edge Drive, Hillside Drive South and the numbered avenues South, such as 11th, 23rd and 28th Avenue South. In Myrtle Beach, 3 of the ${U.by_stretch[MB]} are on Collins Street and North Oak Street.`) +
      G.homes("beach-walk-nmb-under-400k", "beach-walk houses at $400,000 or less", "", "Beach-walk houses in North Myrtle Beach at $400,000 or less") },

    { h2: "Will you need flood insurance for a house near the beach?", toc: "Flood zones", id: "flood", html: (bg) =>
      `<div class="nb-side">` +
      h.p(`Often, if the house is close to the ocean and you buy with a mortgage. About half of Horry County houses within a quarter mile of the ocean are in FEMA's high-risk flood zone. A quarter to half a mile back, about 1 in 4 are.`) +
      `<div class="nb-aside">${FLOOD_CHART}</div>` +
      h.p(`If the house is in the high-risk flood zone and you buy with a mortgage, the lender requires flood insurance.`) +
      h.p(`Past about three quarters of a mile from the ocean, fewer than 1 in 20 houses are in the high-risk zone.`) +
      `</div>` +
      h.p(`Near the ocean, it depends on the town. Of the three Horry County stretches, Myrtle Beach has the fewest houses in the high-risk zone:`) +
      FLOOD_STAT +
      h.p(`In Horry County, a FEMA flood policy on a house the owner lives in cost about ${money(FEMA.inside)} a year at the middle inside the high-risk zone. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance page")} covers wind and flood policies here. Our ${h.a("/buyers/undisclosed-flooding/", "page on undisclosed flooding")} covers what we look up to learn whether a house has flooded before.`) +
      h.cta("Want a house near the sand and outside the high-risk flood zone?", "Tell us the town. We send the houses for sale there that are outside FEMA's high-risk zone, with the walk to the beach from each.", "Have us find them", CTA, bg) },

    { h2: "What are the pros and cons of living near the beach?", toc: "Pros and cons", id: "pros-cons", html: () =>
      h.p("With a house near the beach, you can walk to the sand, and you usually pay no HOA fee. You pay more for the house, and flood insurance is more likely.") +
      `<div class="nb-pc"><div>` + h.h3("The good") + plain("The good", [
        ["You walk to the beach", `From a house near the beach, the sand can be a ${nw("5-minute")} walk. From a house inland in Carolina Forest or Conway, the beach is a ${nw(`${DRIVE.cf}- to ${DRIVE.conway}-minute`)} drive with no traffic.`],
        ["Usually no HOA fee", `About 3 in 4 houses for sale in the first quarter mile report no homeowners association (HOA) fee. ${nw("Two to 5")} miles inland, about 1 in 10 report none. Our ${h.a("/buyers/no-hoa-homes/", "homes with no HOA page")} covers what that allows.`],
        ["A few streets back costs much less", `Past the first quarter mile, houses sold for about a third less at the middle. Half a mile from the ocean is still about a ${nw("10-minute")} walk.`],
      ]) + `</div><div>` + h.h3("The hard") + plain("The hard", [
        ["Fewer houses, higher prices", `Only about 1 in 16 house sales in Horry County was within half a mile of the ocean. Those houses sold for about ${RATIO} times as much as houses ${nw("2 to 5")} miles inland.`],
        ["Flood insurance is more likely", "Near the ocean, many houses are in the high-risk flood zone. We look up the zone and the policy cost for the house before you make an offer."],
        ["Many neighbors are part-time", "At the 2020 Census, close to half the homes in North Myrtle Beach were held for seasonal or vacation use."],
      ]) + `</div></div>` },
  ],
  afterSources: () => LEGAL + CREDITS + PH.imageSchema(SHOWN),
  faqTitle: "Houses near the beach FAQ",
  faq: FAQ,
  sources: [
    { name: "Horry County deeds", href: "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType" },
    { name: "Horry County GIS", href: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer" },
    { name: "Census TIGER/Line", href: "https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html" },
    { name: "SCDES beach access map", href: "https://gis.des.sc.gov/beachaccess/" },
    { name: "Myrtle Beach", href: "https://www.cityofmyrtlebeach.com/services/accessibility_information/index.php" },
    { name: "North Myrtle Beach", href: "https://parks.nmb.us/339/Beach-Accesses-Amenities" },
    { name: "Surfside Beach", href: "https://www.surfsidebeach.org/200/Beaches" },
    { name: "Pawleys Island", href: "https://www.townofpawleysisland.com/beach-access-parking/" },
    { name: "Horry County beach accesses", href: "https://horrycountysc.gov/departments/parksandrecreation/beach-accesses/" },
    { name: "SCDOT", href: "https://projectportal.scdot.org/US17Bus-RSA" },
    { name: "OpenStreetMap foot router", href: "https://routing.openstreetmap.de/" },
    { name: "OpenFEMA policies", href: "https://www.fema.gov/openfema-data-page/nfip-redacted-policies-v3" },
    { name: "42 U.S.C. 4012a", href: "https://www.law.cornell.edu/uscode/text/42/4012a" },
  ],
  sourcesNote: `Houses for sale: our count of the listings on our site, ${DAY}, asking prices, in aggregate, from CCMLS. Distances: straight line to the ocean, except the walk.`,
  bottomCta: { h2: "Find the house you can walk to the beach from.", p: "Send us your budget, the town and how far you want to walk. We send the houses that fit, with the walk and the flood zone for each.", label: "Send us what you want", href: CTA },
  keywords: "houses near the beach Myrtle Beach, homes for sale near the beach Myrtle Beach SC, beach houses for sale North Myrtle Beach, houses for sale near Surfside Beach SC, walking distance to the beach Myrtle Beach, east of 17 Myrtle Beach, is Myrtle Beach in a flood zone, cheap houses near the beach South Carolina",
  about: "Houses near the beach on the Grand Strand: Myrtle Beach, North Myrtle Beach, Surfside Beach, Garden City, Murrells Inlet and Pawleys Island, South Carolina",
});
