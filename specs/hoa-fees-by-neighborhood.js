/* /hoa/fees-by-neighborhood/ - the monthly HOA fee in 382 neighborhoods of houses, townhomes and manufactured
 * homes around Myrtle Beach, counted from the homes for sale: a table a reader can search, the fee by town, what a
 * fee buys at each level, Carolina Forest's many HOAs, second fees and leased land, and townhome fees.
 *
 * Batch 2026-11-d, Lane N. A new page, version 1, 2026-11-13. Plan: Blog-Brain batches/2026-11-d/
 * hoa-fees-by-neighborhood/PLAN.md. Demand and sibling pages: must-answer.md. Facts: facts.md, VERIFIED rows, and
 * CORRECTED rows at the verifier's values and wording only (VERIFY.md). Row numbers are given as F<n>.
 * Not used (VERIFY "Do not publish"): Conway Plantation, Crystal Lake or Waterford Oaks as "no fee"; "every one
 * listing $107"; "one lists $450"; "each $315"; "inside one master community"; "on the town center's streets";
 * "a Beach Club fee for the Grande Dunes Ocean Club"; "2,585 of the 4,213"; "2,422"; a $1, $5 or $9 fee from one
 * or two listings stated as a neighborhood's HOA in prose or in the table (review 1). Never "gated" from the listing flags (F52); never 55+
 * for Cresswind (F40).
 * Data: data/2026-11-d/hoa-fees-by-neighborhood/ (table.json and findings.json from analyze.py; display-names.json,
 * by hand: the plain names the reader sees, and the two lot-rent communities the verifier found, F15 and F53).
 * Every count, fee, chart value and table row is read from those files here and checked against its ledger row.
 * Corrected values the files do not hold (F1's 3,990, F11, F12, F13, F21) are typed with their row number beside them.
 * No listing, address, MLS number or listing photo is on the page: counts, middles and ranges only.
 * Homes: the site's edge puts this page's feed under the opening (lead item in BUILD.md). Two strips, both
 * existing places: waterbridge and the-farm (batches/2026-10-b/data/idx-places.json).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/hoa/fees-by-neighborhood/";
const SLUG = "hoa-fees-by-neighborhood";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const F = read("findings.json"), T = read("table.json"), DN = read("display-names.json");
const ROWS = T.rows;
const LOT_RENT = new Set(DN.lot_rent_by_remarks.names);
const NAME = (r) => DN.names[r.name] || r.name;
const byName = (mls) => { const r = ROWS.find((x) => x.name === mls); must(r, `no row named ${mls}`); return r; };
const isHouse = (r) => r.houses * 2 > r.homes;
const PAID = ROWS.filter((r) => r.fee_mid && !r.leased_land);
const HS = PAID.filter(isHouse);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/* F1 (CORRECTED): 382 neighborhoods, 2,585 homes; the South Carolina total is 3,990, not the file's 4,213 (223 NC zips). */
must(F.communities_sc === 382 && ROWS.length === 382 && F.homes_in_table === 2585, "F1: 382 and 2,585");
const SC_HOMES = 3990;                                                                     // F1, CORRECTED
must(Object.keys(DN.names).every((k) => ROWS.some((r) => r.name === k)), "display-names.json names a row that is not in table.json");
/* F2 and F4: the middle house neighborhood, $95; 162 of 280 at $100 or less. */
must(F.house_middle_of_middles === 95 && HS.length === 280 && med(HS.map((r) => r.fee_mid)) === 95, "F2: $95, 280 neighborhoods of houses");
const UNDER100 = HS.filter((r) => r.fee_mid <= 100).length;
must(UNDER100 === 162, "F4: 162 of 280");
/* F3 (CORRECTED labels: band tops are inclusive). The chart joins $301 to $500 (16) and over $500 (3). */
const BANDS = [["$50 or less", 0, 50], ["$51 to $100", 50, 100], ["$101 to $150", 100, 150], ["$151 to $200", 150, 200], ["$201 to $300", 200, 300], ["Over $300", 300, Infinity]]
  .map(([label, lo, hi]) => ({ label, n: HS.filter((r) => r.fee_mid > lo && r.fee_mid <= hi).length }));
must(BANDS.map((b) => b.n).join() === "37,125,56,24,19,19", "F3: band counts");
const FB = F.house_communities_by_middle_fee;
must(FB["$300 to $500"] === 16 && FB["Over $500"] === 3, "F3: 16 and 3 over $300");
/* F5 and F6. */
const LAWN = F.house_lawn_vs_not, POOL = F.house_pool_clubhouse_vs_neither;
must(LAWN.lawn === 300 && LAWN.n_lawn === 19 && LAWN.no_lawn === 90 && LAWN.n_no_lawn === 261, "F5: lawn care");
must(POOL.both === 115 && POOL.n_both === 130 && POOL.neither === 68 && POOL.n_neither === 92, "F6: pool and clubhouse");
/* F7 (CORRECTED list): the lowest middle fees where listings show a pool and a clubhouse; the page stops at Lakeside at Eagle Nest. */
const LOWPOOL = F.lowest_house_with_pool_and_clubhouse.slice(0, 5);
must(LOWPOOL.map((x) => `${x[1]}|${x[2]}|${Math.round(x[0])}`).join() === "The Lakes|Myrtle Beach|25,Aberdeen|Longs|30,Long Bay|Longs|38,Southgate|Carolina Forest|46,Lakeside at Eagle Nest|Little River|48", "F7: the five lowest");
/* F8: townhome neighborhoods. */
must(F.townhome_middle_of_middles === 250 && F.townhome_middle_of_middles > 2 * F.house_middle_of_middles, "F8: $250, more than twice $95");
/* F9: by town (the small towns are not printed). */
const TOWNS_SHOWN = ["Surfside Beach", "Socastee", "Conway", "Longs", "Carolina Forest", "Myrtle Beach", "Little River", "Georgetown", "Murrells Inlet", "North Myrtle Beach", "Pawleys Island"];
const BT = F.by_town;
must(BT["Surfside Beach"].middle_of_middles === 72 && BT.Socastee.middle_of_middles === 77.5 && BT.Conway.middle_of_middles === 81.5 && BT["North Myrtle Beach"].middle_of_middles === 206 && BT["Pawleys Island"].middle_of_middles === 236.25, "F9: town ends");
must(BT["Myrtle Beach"].middle_of_middles === 110 && BT["Myrtle Beach"].communities === 88 && BT["Murrells Inlet"].middle_of_middles === 140 && BT.Longs.middle_of_middles === 93.5 && BT["Little River"].middle_of_middles === 117.5, "F9: towns");
const TOWN_LABEL = (t) => (t === "Socastee" ? "Socastee area" : t === "Carolina Forest" ? "Carolina Forest area" : t);
/* F10: Carolina Forest. */
const CF = ROWS.filter((r) => r.town === "Carolina Forest"), CFH = CF.filter((r) => isHouse(r) && r.fee_mid);
must(CF.length === 34 && CFH.length === 28 && Math.min(...CFH.map((r) => r.fee_mid)) === 46 && Math.max(...CFH.map((r) => r.fee_mid)) === 159, "F10: 34 and 28, $46 to $159");
must(CFH.filter((r) => r.has.includes("pool")).length === 27, "F10: 27 of 28 show a pool");
/* F11 (CORRECTED): Waterbridge 26 houses, every one with a fee; 23 list $150; one $449. */
const WB = byName("Waterbridge");
must(WB.homes === 26 && WB.with_fee === 26 && WB.fee_mid === 150, "F11: Waterbridge");
const WB_150 = 23, WB_TOP = 449;                                                           // F11, CORRECTED
/* F12 (CORRECTED): The Farm 14 houses, 12 list $107, the others $100 and $110. F38: the HOA's fee is $107. */
const FARM = byName("Carolina Forest - The Farm");
must(FARM.homes === 14 && FARM.fee_mid === 107 && FARM.fee_min === 100 && FARM.fee_max === 110, "F12: The Farm");
const FARM_107 = 12;                                                                       // F12, CORRECTED
/* F13 (CORRECTED) and F33 to F36: the 55+ communities. */
const MT = byName("Myrtle Trace"), SEAS = byName("Seasons At Prince Creek West"), DWN = byName("Del Webb North Myrtle Beach"), DWG = byName("Grande Dunes - Del Webb");
must(MT.homes === 9 && MT.fee_min === 95 && MT.fee_max === 95 && SEAS.homes === 4 && SEAS.fee_mid === 342 && DWN.fee_mid === 315 && DWG.homes === 26 && DWG.fee_low === 401 && DWG.fee_high === 435, "F13");
/* F14 and F42: Plantation Point. */
const PP = byName("Plantation Point");
must(PP.homes === 6 && PP.with_fee === 0 && PP.says_no_hoa === 3, "F14: Plantation Point");
/* F15 (CORRECTED): 51 with no fee; 16 of them manufactured-home communities; 35 houses or townhomes. */
const NOFEE = ROWS.filter((r) => !r.fee_mid && !r.leased_land);
const MH_NOFEE = NOFEE.filter((r) => r.kind.startsWith("manufactured"));
must(NOFEE.length === 51 && F.no_fee_on_any === 51 && MH_NOFEE.length === 16 && [...LOT_RENT].every((n) => MH_NOFEE.some((r) => r.name === n)), "F15: 51, 16 manufactured");
const NOFEE_HOUSES = NOFEE.length - MH_NOFEE.length;
must(NOFEE_HOUSES === 35, "F15: 35");
const HAG = byName("Hagley Estates"), WHB = byName("Windy Hill Beach"), PL = byName("Pine Lakes");
must(HAG.homes === 10 && HAG.town === "Pawleys Island" && WHB.homes === 12 && PL.homes === 7, "F15: examples");
/* F16 and F43: Ocean Lakes and Lakeside Crossing. */
const OL = byName("Ocean Lakes"), LC = byName("Lakeside Crossing");
must(OL.homes === 145 && OL.says_no_hoa === 145 && OL.leased_land && LC.homes === 21 && LC.says_no_hoa === 20 && LC.leased_land, "F16");
/* F17 (CORRECTED): among the highest. */
const HI = F.highest_house;
must(HI[0][0] === 898 && HI[1][0] === 898 && HI[2][1] === "Grande Dunes - Waterside Pointe" && HI[2][0] === 503 && HI[3][1] === "Prince George Ocean" && HI[3][0] === 492.5, "F17: the top four");
must(HI[0][4].includes("lawn care") && HI[0][4].includes("internet") && HI[1][4].includes("lawn care") && HI[1][4].includes("internet"), "F17: lawn care and internet");
/* F19 (CORRECTED): sub-neighborhood names. */
const fam = (s) => ROWS.filter((r) => r.name.includes(s));
must(fam("Grande Dunes").length === 11 && fam("Prince Creek").length === 10 && fam("Market Common").length === 9, "F19: 11, 10 and 9 names");
must(byName("Grande Dunes - Cipriana Park").fee_mid === 232 && byName("Prince Creek - Longwood Bluffs - Detached").fee_mid === 99 && byName("Prince Creek - Willow Bay").fee_mid === 180, "F19: fees");
must(byName("Highlands at Withers Preserve-Market Common").fee_mid === 63 && byName("Sweetgrass Square - Market Common").fee_mid === 220 && byName("Market Common, The").fee_mid === 450 && byName("Market Common - Market View").fee_mid === 490, "F19: Market Common fees");
/* F21 (CORRECTED): 2,097 of 2,411 outside leased land. */
const OUTSIDE = ROWS.filter((r) => !r.leased_land), OUT_HOMES = OUTSIDE.reduce((a, r) => a + r.homes, 0), OUT_FEE = OUTSIDE.reduce((a, r) => a + r.with_fee, 0);
must(OUT_HOMES === 2411 && OUT_FEE === 2097, "F21: 2,097 of 2,411");
/* F32: what the fee includes, townhouses and houses (batch 2026-11-b hoa row 4). */
const TH_INC = { lawn: 84, trash: 72, insurance: 37, internet: 23, pest: 33, cable: 29, water: 19 }, HO_INC = { lawn: 8, trash: 46 };   // F32
/* F56 (VERIFIED-BY-FIXER, round 2): the same tick counts' other items, from the same source row as F32: houses insurance 4, water and sewer 2, pest 1, cable 0. */
const HO_TH = { insurance: 4, water: 2, pest: 1, cable: 0 };                                // F56
/* F55 (VERIFIED-BY-FIXER, review 1): the middle townhouse listing's fee, $290, as /hoa/ prints it (batch 2026-11-b hoa row 1). */
const TH_HOME = 290;                                                                       // F55

/* The month of the count, from the data file (never typed). */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pm = String(F.pulled).match(/^(\d{4})-(\d{2})-/);
must(pm, "findings.json: no pulled date");
const COUNTED = `${MONTHS[+pm[2] - 1]} ${pm[1]}`;

/* ---------------------------------------------------------------------------- */
/* Links.                                                                         */

const LEAD = "/contact/";
const MAPAPI = "https://chapter3realty.com/homes/";
const WBHOA = "https://waterbridgehoa.com/";
const FARMHOA = "https://www.farmatcarolinaforest.com/";
const DWDEC = "https://www.delwebbatgrandedunes.com/ResourceCenter/Download/48372~3083079";
const TOLL = "https://www.tollbrothers.com/luxury-homes-for-sale/South-Carolina/Townes-of-Prince-Creek-West";
const OCEANLAKES = "https://www.oceanlakes.com/lodging-2/annual-lease-sales/";
const CRESS = "https://www.cresswind-myrtlebeach.com/about-cresswind/";
const P55 = "/buyers/55-plus-communities/";

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main. One card style for the tool, the charts and   */
/* the offers; lists and tables plain under thin rules; one block width.           */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,inset 0 1px 0 rgba(255,255,255,.95)),var(--g-sh,0 14px 36px -20px rgba(28,32,40,.3));border-radius:var(--g-r,20px)";
const CSS = "<style>"
  /* The headline: the italic line at about half the H1's size. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.25rem,2.4vw,2.1rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} h2{text-wrap:balance}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* Lists plain, under thin rules. */
  + `${S} ul.hf-list{list-style:none;margin:.6rem 0 1.3rem;padding:0;max-width:720px}`
  + `${S} ul.hf-list>li{margin:0;padding:.75rem 0;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} ul.hf-list>li:last-child{border-bottom:${RULE}}${S} ul.hf-list strong{color:var(--navy)}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  + `${S} .hx-fallback .c3-offer{margin-top:.4rem}`
    /* The closing navy band: a dark card, so its ivory words read (garden-city.js, hoa.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `${S} figure.c3ph-hero{max-width:720px!important}${S} figure.c3ph-hero img{aspect-ratio:4/3!important}`
  /* The tool: one card, the search row, then the table plain under thin rules. */
  + `${S} .hf-tool{${CARD};max-width:760px;margin:1.2rem 0 1rem;padding:1.1rem 1.15rem .9rem;box-sizing:border-box}`
  + `${S} .hf-ctl{display:grid;grid-template-columns:1fr;gap:.6rem;margin-bottom:.8rem}`
  + `@media (min-width:700px){${S} .hf-ctl{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr)}}`
  + `${S} .hf-ctl label{display:block;font-family:var(--sans);font-size:.95rem;font-weight:600;color:var(--navy)}`
  + `${S} .hf-ctl input,${S} .hf-ctl select{display:block;width:100%;margin-top:.3rem;min-height:46px;padding:.5rem .7rem;font-family:var(--sans);font-size:1.0625rem;color:var(--navy);background:#fff;border:1px solid rgba(28,32,40,.28);border-radius:10px;box-sizing:border-box}`
  + `${S} .hf-count{font-family:var(--sans);font-size:.95rem;color:var(--muted);margin:.2rem 0 .4rem;line-height:1.5}`
  + `${S} table.hf-t{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1rem;color:var(--navy)}`
  + `${S} table.hf-t thead th{font-size:.8rem;letter-spacing:.04em;text-transform:uppercase;text-align:left;font-weight:600;padding:.5rem .45rem;border-bottom:1px solid rgba(28,32,40,.3);color:var(--navy)}`
  + `${S} table.hf-t th[scope=row],${S} table.hf-t td{padding:.6rem .45rem;border-bottom:1px solid rgba(28,32,40,.12);text-align:left;vertical-align:top;line-height:1.4}`
  + `${S} table.hf-t th:first-child{padding-left:0}${S} table.hf-t td:last-child,${S} table.hf-t th:last-child{padding-right:0}`
  + `${S} table.hf-t th[scope=row]{font-weight:600}${S} table.hf-t th[scope=row] a{color:var(--navy);text-decoration:underline;text-underline-offset:.16em}`
  + `${S} table.hf-t .tw{display:block;font-weight:400;font-size:.9rem;color:var(--muted)}`
  + `${S} table.hf-t td{color:var(--muted)}${S} table.hf-t td.fe{color:var(--navy);font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}`
  + `${S} table.hf-t td.hm{font-variant-numeric:tabular-nums}${S} table.hf-t .nt{display:block;font-weight:400;font-size:.875rem;color:var(--muted);white-space:normal}`
  + `${S} table.hf-t tr[hidden]{display:none!important}`
  + `${S} .hf-more{display:inline-flex;align-items:center;min-height:44px;margin:.8rem 0 .2rem;padding:.5rem 1.1rem;font-family:var(--sans);font-size:1rem;font-weight:600;color:var(--navy);background:#fff;border:1px solid rgba(145,89,43,.4);border-radius:999px;cursor:pointer}`
  + `${S} .hf-more[hidden]{display:none}`
  + `${S} .hf-note{font-family:var(--sans);font-size:.92rem;line-height:1.55;color:var(--muted);margin:.8rem 0 .1rem;padding-top:.7rem;border-top:1px solid rgba(28,32,40,.12)}`
  /* On a phone each row is a card: the name and town on one line, the fee under it, then the small facts. */
  + `@media (max-width:699px){${S} table.hf-t,${S} table.hf-t tbody{display:block;width:100%}`
  + `${S} table.hf-t thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} table.hf-t tr{display:flex;flex-wrap:wrap;align-items:flex-start;column-gap:.8rem;padding:.7rem 0;border-bottom:1px solid rgba(28,32,40,.12)}`
  + `${S} table.hf-t th[scope=row],${S} table.hf-t td{border:0;padding:0}`
  + `${S} table.hf-t th[scope=row]{flex:0 0 100%;min-width:0;order:0}${S} table.hf-t td.fe{flex:0 0 100%;order:1;text-align:left;font-size:1.0625rem;margin-top:.3rem;white-space:normal}`
  + `${S} table.hf-t td.hm,${S} table.hf-t td.in,${S} table.hf-t td.sh{flex:0 0 100%;order:2;font-size:.92rem;line-height:1.45;margin-top:.15rem}`
  + `${S} table.hf-t td.in:empty,${S} table.hf-t td.sh:empty{display:none}`
  + `${S} table.hf-t td[data-l]::before{content:attr(data-l) ": ";font-weight:600;color:var(--navy)}}`
  + `@media (min-width:700px){${S} table.hf-t td.hm{text-align:right;padding-right:1rem}${S} table.hf-t thead th.hm{text-align:right;padding-right:1rem}}`
  + "</style>";

const list = (items) => `<ul class="hf-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------------------------------------------------------------------------- */
/* V1: the table a reader searches (table.json, 382 rows).                        */

/* The fee cell. The fee shown is the table's own: the middle half of the listings with a fee when 4 or more list
   one, else lowest to highest (table.json rule). Where fewer than all list one, the cell says how many.
   No dollar figure where it rests on too few listings (F16, F22, review 1): fewer than half give a fee, or a fee
   under $15 rests on one or two. That hides Mt Gilead, Myrtle Dunes, North Litchfield Beach and The Olde Village
   (F22), and the manufactured-home rows where one or two listings type a fee (Folly Estate, Waterway View, Foxfire,
   Windjammer Village - GC): those say to ask about lot rent. */
const MH = (r) => r.kind.startsWith("manufactured");
const tooFew = (r) => r.fee_mid && (r.with_fee * 2 < r.homes || (r.with_fee < 3 && r.fee_high < 15));
const HIDDEN = ROWS.filter((r) => !r.leased_land && !LOT_RENT.has(r.name) && tooFew(r)).map((r) => r.name);
must(["Mt Gilead", "Myrtle Dunes", "North Litchfield Beach", "The Olde Village", "Folly Estate", "Waterway View Community", "Foxfire"].every((n) => HIDDEN.includes(n)) && !HIDDEN.includes("Rosehaven") && HIDDEN.length === 9, "F22: rows with too few fees");
const feeCell = (r) => {
  if (r.leased_land || LOT_RENT.has(r.name)) return `Leased land<span class="nt">Lot rent, no HOA fee</span>`;
  if (!r.fee_mid) return MH(r) ? `No HOA fee listed<span class="nt">Ask about lot rent</span>` : `No fee listed`;
  if (tooFew(r)) return `Too few list a fee<span class="nt">${r.with_fee} of ${r.homes} list one. ${MH(r) ? "Ask about lot rent." : "Ask us."}</span>`;
  const lo = Math.round(r.fee_low), hi = Math.round(r.fee_high);
  const fee = lo === hi ? money(lo) : `${money(lo)} to ${money(hi)}`;
  return fee + (r.with_fee < r.homes ? `<span class="nt">${r.with_fee} of ${r.homes} list a fee</span>` : "");
};
const sortFee = (r) => (r.leased_land || LOT_RENT.has(r.name) || !r.fee_mid || tooFew(r) ? -1 : r.fee_mid);
const TOWNS = [...new Set(ROWS.map((r) => r.town))].sort();
const tcode = (t) => "t" + TOWNS.indexOf(t);
const KIND = (k) => (k === "houses" ? "" : ` · ${k}`);
const ROW_HTML = ROWS.slice().sort((a, b) => b.homes - a.homes || NAME(a).localeCompare(NAME(b))).map((r) => {
  const nm = NAME(r), key = [nm, r.name, TOWN_LABEL(r.town)].join(" ").toLowerCase();
  /* Round 2 (FIXES-2.md): every name links to our search for that community, by the MLS name the table was counted by.
     A community with its own guide gets a second link to it under the name. */
  const name = `<a href="/homes/?subdivision=${encodeURIComponent(r.name)}">${esc(nm)}</a>`;
  const guide = r.page ? ` · <a href="${r.page}">Guide</a>` : "";
  const inc = r.leased_land || LOT_RENT.has(r.name) ? "" : cap1(r.includes.join(", "));
  const has = r.has.length ? cap1(r.has.join(", ")) : "";
  return `<tr data-k="${esc(key)}" data-t="${tcode(r.town)}" data-f="${sortFee(r)}" data-h="${r.homes}" data-n="${esc(nm.toLowerCase())}">`
    + `<th scope="row">${name}<span class="tw">${esc(TOWN_LABEL(r.town))}${esc(KIND(r.kind))}${guide}</span></th>`
    + `<td class="hm" data-l="For sale">${r.homes}</td><td class="fe" data-l="Monthly HOA fee">${feeCell(r)}</td>`
    + `<td class="in"${inc ? ' data-l="Fee includes"' : ""}>${esc(inc)}</td><td class="sh"${has ? ' data-l="Amenities listed"' : ""}>${esc(has)}</td></tr>`;
}).join("");
const TOWN_OPTS = `<option value="" selected>All towns</option>` + TOWNS.map((t) => `<option value="${tcode(t)}">${esc(TOWN_LABEL(t))} (${ROWS.filter((r) => r.town === t).length})</option>`).join("");
const FIRST = 12;
/* The script lives in a template string: no backslash escapes and no regular expressions in it (VERDICTS 2026-10-26). */
const TOOL = `<div class="hf-tool" id="hfTool" role="group" aria-label="HOA fee by neighborhood">`
  + `<div class="hf-ctl"><label for="hfQ">Type a neighborhood<input id="hfQ" type="search" autocomplete="off" placeholder="Waterbridge, Grande Dunes ..."></label>`
  + `<label for="hfT">Town<select id="hfT">${TOWN_OPTS}</select></label>`
  + `<label for="hfS">Sort by<select id="hfS"><option value="h" selected>Most for sale</option><option value="az">Name, A to Z</option><option value="lo">Fee, lowest first</option><option value="hi">Fee, highest first</option></select></label></div>`
  + `<p class="hf-count" id="hfCount" aria-live="polite">All ${ROWS.length} neighborhoods</p>`
  + `<table class="hf-t"><caption class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Monthly HOA fee in ${ROWS.length} neighborhoods around Myrtle Beach, from the homes for sale in ${COUNTED}</caption>`
  + `<thead><tr><th scope="col">Neighborhood</th><th scope="col" class="hm">For sale</th><th scope="col">Monthly HOA fee</th><th scope="col">Fee includes</th><th scope="col">Amenities listed</th></tr></thead>`
  + `<tbody>${ROW_HTML}</tbody></table>`
  + `<button type="button" class="hf-more" id="hfMore" hidden>Show all ${ROWS.length} neighborhoods</button>`
  + `<p class="hf-note">We checked the fee on each of the ${n0(F.homes_in_table)} homes for sale in these neighborhoods, to the dollar, in ${COUNTED}. Where several list a fee, the table shows the middle half of them. Where too few give one, we find it for you. "Fee includes" and "Amenities listed" are what half or more of the listings say.</p></div>`
  + `<script>(function(){var box=document.getElementById("hfTool");if(!box||!box.querySelector)return;`
  + `var tb=box.querySelector("tbody"),rows=Array.prototype.slice.call(tb.rows),q=document.getElementById("hfQ"),t=document.getElementById("hfT"),s=document.getElementById("hfS"),more=document.getElementById("hfMore"),cnt=document.getElementById("hfCount"),all=false,FIRST=${FIRST};`
  + `function num(r,a){return Number(r.getAttribute(a))}function nm(r){return r.getAttribute("data-n")}function az(a,b){return nm(a)<nm(b)?-1:nm(a)>nm(b)?1:0}`
  + `function go(){var v=(q.value||"").toLowerCase().trim(),tw=t.value,so=s.value;`
  + `var list=rows.filter(function(r){return(!tw||r.getAttribute("data-t")===tw)&&(!v||r.getAttribute("data-k").indexOf(v)>-1)});`
  + `list.sort(function(a,b){var fa=num(a,"data-f"),fb=num(b,"data-f");if(so==="az")return az(a,b);`
  + `if(so==="lo"){if(fa<0)fa=100000;if(fb<0)fb=100000;return fa-fb||az(a,b)}if(so==="hi")return fb-fa||az(a,b);return num(b,"data-h")-num(a,"data-h")||az(a,b)});`
  + `var cap=(v||tw||all)?list.length:Math.min(FIRST,list.length);rows.forEach(function(r){r.hidden=true});`
  + `list.forEach(function(r,i){tb.appendChild(r);r.hidden=i>=cap});`
  + `cnt.textContent=list.length?(cap<list.length?"The "+cap+" with the most homes for sale, of "+list.length+" neighborhoods":list.length+(list.length===1?" neighborhood":" neighborhoods")):"No neighborhood by that name had 3 or more homes for sale. Send us the name, and we look up its fee.";`
  + `more.hidden=cap>=list.length;more.textContent="Show all "+list.length+" neighborhoods"}`
  + `q.addEventListener("input",go);t.addEventListener("change",go);s.addEventListener("change",go);more.addEventListener("click",function(){all=true;go()});go()})();</script>`;

/* ---------------------------------------------------------------------------- */
/* Charts, from the data files.                                                   */

/* F9: by town, the towns with 10 or more neighborhoods in the table. */
const CHART_TOWN = G.bars(TOWNS_SHOWN.map((t) => ({ name: TOWN_LABEL(t), value: BT[t].middle_of_middles, valueText: money(BT[t].middle_of_middles), feature: `${BT[t].communities} neighborhoods` }))
  .sort((a, b) => a.value - b.value), {
  caption: "HOA fees are highest in North Myrtle Beach and Pawleys Island",
  note: "The middle neighborhood's monthly HOA fee in each town: half the neighborhoods charge more, half less. All kinds of homes.",
  nameLabel: "Town", featureLabel: "neighborhoods in the table", valueLabel: "Middle monthly HOA fee", compact: true,
});
/* F3 (CORRECTED labels). */
const CHART_BANDS = G.bars(BANDS.map((b) => ({ name: b.label, value: b.n, valueText: `${b.n}` })), {
  caption: "Most neighborhoods of houses charge $51 to $100 a month",
  note: `How many of the ${HS.length} neighborhoods of houses with a listed fee fall in each range. Each one's fee is the middle of its listings.`,
  nameLabel: "Middle monthly HOA fee", valueLabel: "Neighborhoods of houses", compact: true,
});
/* F10: the 12 Carolina Forest neighborhoods of houses with the most homes for sale, cheapest first. */
const CF12 = CFH.slice().sort((a, b) => b.homes - a.homes || a.fee_mid - b.fee_mid).slice(0, 12).sort((a, b) => a.fee_mid - b.fee_mid);
must(CF12.some((r) => r.name === "Waterbridge") && CF12.some((r) => r.name === "Carolina Forest - The Farm"), "F10: the chart has Waterbridge and The Farm");
const CHART_CF = G.bars(CF12.map((r) => ({ name: NAME(r), value: r.fee_mid, valueText: money(r.fee_mid), href: r.page || undefined,
  feature: r.has.length ? cap1(r.has.join(", ")) : `${r.homes} for sale` })), {
  caption: "Carolina Forest: each neighborhood has its own HOA fee",
  note: "The middle monthly fee in the Carolina Forest neighborhoods of houses with the most homes for sale. Pick Carolina Forest in the town list to see them all.",
  nameLabel: "Neighborhood", featureLabel: "amenities listed", valueLabel: "Middle monthly HOA fee", compact: true, phoneList: true,
});

/* ---------------------------------------------------------------------------- */
/* Photos: two public-domain U.S. government aerials, records copied from data/2026-10-b/photos.json into this  */
/* page's photos.json: the Waterbridge pool complex and clubhouse (USDA NAIP; files in this page's images folder) */
/* and The Farm's large pool and activity center (NOAA; the files /hoa/benefits/ already serves).                */

const RECS = read("photos.json").photos;
const photoRec = (re) => { const r = RECS.find((x) => re.test(x.file)); must(r && r.license === "Public domain", `photo record ${re}`); return r; };
const WB_REC = photoRec(/waterbridge-from-above-1200w\.webp$/);
const FARM_REC = photoRec(/the-farm-pool-from-above-2026-1200w\.webp$/);
const WB_CAP = "Waterbridge from above: the pools and clubhouse inside a circle of streets.";
const FARM_CAP = "The Farm's large pool and its activity center, from above.";
const photo = (rec, caption) => PH.heroPhoto(rec, { alt: rec.alt, caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
const WB_PHOTO = photo(WB_REC, WB_CAP), FARM_PHOTO = photo(FARM_REC, FARM_CAP);
const CREDITS = PH.creditsList([{ photo: WB_REC, caption: WB_CAP.replace(/\.$/, "") }, { photo: FARM_REC, caption: FARM_CAP.replace(/\.$/, "") }]);

/* ---------------------------------------------------------------------------- */
/* Homes strips (existing places) with their fallbacks.                            */

const STRIP_WB = G.homesQ("subdivision=Waterbridge&type=house", "Waterbridge houses, with the pool complex and lakes");
const STRIP_FARM = G.homesQ("subdivision=Carolina Forest - The Farm&type=house", "Houses in The Farm, with two pools and an activity center");
const STRIP_TH = G.homesQ("type=townhouse&has=lawn_care_included", "Townhomes where the HOA does the lawn care");

/* ---------------------------------------------------------------------------- */
/* Words read from the data.                                                      */

const SHARE6 = Math.round(UNDER100 / HS.length * 10);
must(SHARE6 === 6, "F4: about 6 in 10");
const SHARE9 = Math.round(OUT_FEE / OUT_HOMES * 100);
must(SHARE9 === 87, "F21: 87 in 100");
const LOWLIST = LOWPOOL.map(([v, n, t]) => `<strong>${n}</strong> in ${t}, about ${money(v)}`);
const LOW_N = LOWPOOL.map((x) => x[3]);
/* Words for counts, checked: "nearly all" Waterbridge houses list $150 (F11: 23 of 26); "most" The Farm houses list $107
   (F12: 12 of 14); townhouse fees: "most" lawn care and trash, "more than a third" insurance; houses "fewer than 1 in 10" lawn (F32);
   "all but one" Carolina Forest house neighborhood marks a pool (F10: 27 of 28); "half" of Plantation Point's houses say no HOA (F14). */
must(WB_150 / WB.homes >= 0.85 && FARM_107 / FARM.homes > 0.5 && TH_INC.lawn > 50 && TH_INC.trash > 50 && TH_INC.insurance > 100 / 3 && HO_INC.lawn < 10, "count words");
must(CFH.length - CFH.filter((r) => r.has.includes("pool")).length === 1 && PP.says_no_hoa * 2 === PP.homes && Math.max(...LOW_N) <= 6, "count words: Carolina Forest, Plantation Point, few homes");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA", url: "/hoa/" },
  title: `HOA Fees by Neighborhood: ${ROWS.length} Myrtle Beach Area Communities`,
  description: `The monthly HOA fee in ${ROWS.length} neighborhoods from Little River to Pawleys Island and Conway, from the homes for sale: what it includes, and second fees.`,
  ogTitle: `HOA fees in ${ROWS.length} Myrtle Beach area neighborhoods: the monthly fee, what it includes, and second fees`,
  crumb: "Fees by neighborhood",
  eyebrow: "HOA fees",
  h1: `HOA fees in ${ROWS.length} Myrtle Beach area neighborhoods`,
  h1em: "What each one costs a month, and what you get for it.",
  sub: `Waterbridge has a pool complex, pocket parks and over 80 acres of lakes and natural areas. Most of its homes for sale list a ${money(150)} monthly HOA fee.`,
  heroCta: { title: "Serious about one home? We get its HOA budget and rules before you offer.", label: "Ask about one home's HOA", href: LEAD },
  topOfferLine: "Serious about one home? We get its HOA budget and rules before you offer.",
  author: "devin",
  shortAnswer: [
    `In the middle Myrtle Beach area neighborhood of houses, the HOA fee is about ${money(F.house_middle_of_middles)} a month. About ${SHARE6} in 10 charge ${money(100)} or less.`,
    `The fee is higher where it includes more. It is about ${money(LAWN.lawn)} where the listings say it includes lawn care, and about ${money(F.townhome_middle_of_middles)} in the middle townhome neighborhood.`,
  ],
  sections: [
    { h2: "What is the HOA fee in each neighborhood?", toc: "Find a fee", id: "find", html: (bg) =>
      CSS + G.homesCss() + G.homesQScript() +
      h.p(`The table gives the monthly HOA fee in ${ROWS.length} neighborhoods, from Little River to Pawleys Island and inland to Conway, Loris, Aynor and Georgetown. Each has 3 or more houses, townhomes or manufactured homes for sale. Type a name, or pick a town.`) +
      h.p(`What a typical fee is, and what HOA fees pay for, is on our ${h.a("/hoa/", "Myrtle Beach HOA fees guide")}.`) +
      TOOL +
      h.cta("Not in the table, or serious about one home?", `A neighborhood needs 3 homes for sale to be in the table. Cresswind Myrtle Beach, with its ${h.ext(CRESS, "12,000-square-foot clubhouse")} and outdoor amphitheater, had fewer. Send us any name or address, and we find its HOA fee. For a home you are serious about, we get the HOA's budget, rules and any second fee.`, "Ask us about one neighborhood", LEAD, bg) },

    { h2: "How much are HOA fees in each town?", toc: "By town", id: "by-town", html: () =>
      h.p(`The middle neighborhood fee is about ${money(BT["Surfside Beach"].middle_of_middles)} a month in Surfside Beach and about ${money(BT["Pawleys Island"].middle_of_middles)} in Pawleys Island.`) +
      CHART_TOWN +
      h.p(`In Myrtle Beach, the town with the most neighborhoods in the table, it is about ${money(BT["Myrtle Beach"].middle_of_middles)}.`) },

    { h2: "Which neighborhoods give the most for the fee?", toc: "Most for the fee", id: "what-it-buys", html: (bg) =>
      CHART_BANDS +
      h.p(`Where the listings mark a pool and a clubhouse, the middle fee is about ${money(POOL.both)} a month. Where they mark neither, it is about ${money(POOL.neither)}.`) +
      h.p(`Where the listings say the fee includes lawn care, the middle fee is about ${money(LAWN.lawn)}. Where it does not, it is about ${money(LAWN.no_lawn)}.`) +
      h.h3("A pool and a clubhouse for under $50 a month") +
      h.p(`In these neighborhoods of houses, the listings mark a pool and a clubhouse, and the middle fee is under ${money(50)}:`) +
      list(LOWLIST) +
      h.p(`Each of these rests on only a few homes for sale, so we confirm the fee with the HOA.`) +
      h.p(`Fees in the 55+ communities, and what each one includes, are on our ${h.a(P55, "55+ communities page")}.`) +
      h.h3("The top of the range") +
      h.p(`Among the highest middle fees for houses:`) +
      list([
        `<strong>North Beach Plantation's cottage neighborhoods</strong> in North Myrtle Beach, about ${money(HI[0][0])} a month. The listings say the fee includes lawn care and internet.`,
        `<strong>Grande Dunes - Waterside Pointe</strong> in Myrtle Beach, about ${money(HI[2][0])}.`,
        `<strong>Prince George Ocean</strong> in Pawleys Island, about ${money(HI[3][0])}.`,
      ]) +
      h.p(`Each of these rests on a few homes for sale. Gated neighborhoods and what they charge are on our ${h.a("/buyers/gated-communities/", "gated communities page")}.`) },

    { h2: "What are HOA fees in Carolina Forest?", toc: "Carolina Forest", id: "carolina-forest", html: () =>
      h.p(`Carolina Forest is ${CF.length} neighborhoods in our table, each with its own HOA fee. Its neighborhoods of houses charge about ${money(46)} to ${money(159)} a month in the middle. The listings in all but one of them mark a community pool.`) +
      CHART_CF +
      h.p(`Our ${h.a("/submarkets/carolina-forest/", "Carolina Forest guide")} covers the area itself.`) +
      h.h3("Waterbridge: a pool complex, and lakes through the neighborhood") +
      h.p(`${h.ext(WBHOA, "Waterbridge")} has over 80 acres of lakes and natural areas, a swimming pool complex, pocket parks and a clubhouse. Every house for sale there lists an HOA fee, and nearly all list ${money(150)} a month.`) +
      WB_PHOTO +
      STRIP_WB +
      h.h3("The Farm at Carolina Forest: two pools for $107") +
      h.p(`The Farm's HOA fee is ${money(107)} a month. Its amenities include two pools, an activity center, a clubhouse with a fitness room, a basketball court and a playground. Most of its houses for sale list ${money(107)}, and the others ${money(FARM.fee_min)} or ${money(FARM.fee_max)}.`) +
      FARM_PHOTO +
      h.p(`Owners in two of its neighborhoods pay a second fee. Our ${h.a("/submarkets/carolina-forest/the-farm/", "guide to The Farm")} has both.`) +
      STRIP_FARM },

    { h2: "Two fees, or no HOA fee at all", toc: "Two fees or none", id: "two-fees", html: (bg) =>
      h.p(`Close to 9 in 10 homes for sale in these neighborhoods list an HOA fee, outside the campground and leased-land communities. Some owners pay a second fee, and some pay a lot rent instead.`) +
      h.h3("A second fee on top of the HOA") +
      list([
        `<strong>The Farm at Carolina Forest.</strong> Owners in The Orchards pay about $225 to $255 a month in all. In Planters Point, it is about $450 to $500.`,
        `<strong>${h.a(P55 + "del-webb-grande-dunes/", "Del Webb at Grande Dunes")}.</strong> The fee is about $400 a month for a house and about $445 for a villa. Every owner also pays a ${h.ext(DWDEC, "mandatory Beach Club fee")} to the Grande Dunes master association, on top of that.`,
      ]) +
      h.p(`A listing may show one fee or both. Our page on ${h.a("/hoa/hoa-vs-poa/", "HOAs and POAs")} explains a neighborhood with two associations.`) +
      h.h3("One community, many names") +
      h.p(`Some communities appear in the listings under many neighborhood names, each with its own listed fee.`) +
      list([
        `<strong>Grande Dunes.</strong> Houses in its neighborhoods list from about ${money(232)} in Cipriana Park to about ${money(503)} in Waterside Pointe.`,
        `<strong>Prince Creek and Prince Creek West.</strong> Houses list from about ${money(99)} in Longwood Bluffs to ${money(180)} in Willow Bay, and ${money(SEAS.fee_mid)} in Seasons at Prince Creek West, a 55+ community. Prince Creek West is a ${h.ext(TOLL, "2,700-acre master plan")}. Its amenity complex, The Park, has two community pools, sport courts and walking trails.`,
        `<strong>Market Common.</strong> Houses list from about ${money(63)} in Highlands at Withers Preserve to ${money(220)} in Sweetgrass Square, and townhomes about ${money(450)} and ${money(490)}.`,
      ]) +
      h.h3("Leased land: a lot rent instead of an HOA fee") +
      list([
        `<strong>Ocean Lakes.</strong> Every listing there says there is no HOA. The houses and mobile homes are on ${h.ext(OCEANLAKES, "2,579 annual lease sites")} along a mile of oceanfront.`,
        `<strong>Lakeside Crossing</strong> in Conway. The homes are on leased land in a 55+ community. There is no HOA, and the lot rent is the monthly cost. More is on our ${h.a(P55, "55+ communities page")}.`,
        `<strong>Conway Plantation and Crystal Lake.</strong> We read their listings: the homes are on leased land with a monthly lot rent.`,
      ]) +
      h.p(`The other manufactured-home communities in the table list no HOA fee. Ask about a lot rent before you offer.`) +
      h.h3("No HOA fee listed") +
      h.p(`In ${NOFEE_HOUSES} neighborhoods of houses or townhomes, no listing for sale gives a fee. Among them are Hagley Estates in Pawleys Island, Windy Hill Beach in North Myrtle Beach and Pine Lakes in Myrtle Beach.`) +
      h.p(`In ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")}, none of the houses for sale lists a fee, and half say there is no HOA. To shop only homes with no HOA, see our ${h.a("/buyers/no-hoa-homes/", "no HOA homes page")}.`) +
      h.cta("Name the home, and we find every fee it pays.", "The HOA, a master association, a club or a lot rent. We get each one in writing before you offer.", "Ask us about every fee on a home", LEAD, bg) },

    { h2: "Why are townhome HOA fees higher?", toc: "Townhomes", id: "townhomes", html: () =>
      h.p(`The fee covers more. In the middle townhome neighborhood the HOA fee is about ${money(F.townhome_middle_of_middles)} a month, more than twice the fee for houses. Counted home by home instead, the middle townhouse fee is about ${money(TH_HOME)}, as our ${h.a("/hoa/", "Myrtle Beach HOA fees guide")} shows.`) +
      h.h3("What a townhome fee includes") +
      h.p(`Of the townhouse listings that give a fee, ${TH_INC.lawn} in 100 say it includes lawn care, ${TH_INC.trash} in 100 trash pickup and ${TH_INC.insurance} in 100 insurance. For houses it is ${HO_INC.lawn}, ${HO_INC.trash} and ${HO_TH.insurance} in 100. Pest control, cable and water and sewer also show up in townhouse listings, and almost never in house listings.`) +
      h.h3("How to compare it with a house") +
      h.p(`A townhome fee buys more items, not the same items at a higher price. A house owner usually does those jobs alone and pays for them apart from the HOA. To compare a house fee with a townhome fee, add what you would pay for the same items on the house.`) +
      h.p(`The listing says the fee includes insurance. It does not say which policy. Ask the HOA what its insurance covers and what yours must cover.`) +
      STRIP_TH +
      h.p(`For a condo, each oceanfront building's fee is on our ${h.a("/invest/condo-buildings/", "condo buildings page")}. To add the HOA fee to the tax and insurance for a year, use our ${h.a("/buyers/cost-to-own/", "cost to own page")}. How much an HOA may raise its fee is on our ${h.a("/hoa/dues-increases/", "dues increases page")}.`) },
  ],
  faqTitle: "HOA fees by neighborhood: FAQ",
  faq: [
    { q: "What is the HOA fee in Lakeside Crossing in Conway?", a: "Lakeside Crossing has no HOA fee. The homes are on leased land in a 55+ community, and the lot rent is the monthly cost." },
    { q: "Why does a listing's HOA fee differ from the HOA's?", a: "A home's listed fee is what its agent typed for that home. A home in two associations may list one fee or both. We get the HOA's own figure before you offer." },
    { q: "Is the HOA fee part of the monthly cost of a home?", a: "Yes. Add it to the property tax and the insurance. Our cost to own page adds them up for a year." },
    { q: "Why are townhome HOA fees higher?", a: "The fee covers more. Most townhouse listings that give a fee say it includes lawn care and trash pickup, and fewer than 1 in 10 house listings include lawn care. Insurance, pest control and water and sewer also show up far more often for townhouses." },
    { q: "What about condo HOA fees?", a: "Our table lists neighborhoods of houses, townhomes and manufactured homes. For a condo for sale that lists a fee, the middle fee is about $650 a month." },
  ],
  sources: [
    { name: "CCMLS listings (our count)", href: MAPAPI },
    { name: "Waterbridge HOA", href: WBHOA },
    { name: "The Farm HOA", href: FARMHOA },
    { name: "Del Webb at Grande Dunes declaration", href: DWDEC },
    { name: "Toll Brothers, Prince Creek West", href: TOLL },
    { name: "Ocean Lakes lease sales", href: OCEANLAKES },
    { name: "Cresswind Myrtle Beach", href: CRESS },
  ],
  sourcesNote: `Our count, ${COUNTED}: the monthly HOA fee on each house (detached or semi-detached), townhome and manufactured home for sale, to the dollar, from CCMLS listings in aggregate. ${n0(F.homes_in_table)} of the ${n0(SC_HOMES)} such homes for sale we found in South Carolina are in these neighborhoods. A neighborhood is its MLS name.`,
  bottomCta: { h2: "Get the budget and the rules before you offer.", p: "Send us a home you are serious about. We get its HOA's budget, reserves and rules, and every fee it pays.", label: "Ask us about a home's HOA", href: LEAD },
  afterSources: () => CREDITS + PH.imageSchema([WB_REC, FARM_REC]),
  keywords: "HOA fees by neighborhood Myrtle Beach, Myrtle Beach HOA fees by community, Carolina Forest HOA fees, Lakeside Crossing HOA fees, Waterbridge HOA fee, The Farm Carolina Forest HOA fee, Grande Dunes HOA fees, North Myrtle Beach HOA fees, Pawleys Island HOA fees, townhome HOA fees Myrtle Beach",
  about: "Monthly HOA fees in neighborhoods of houses, townhomes and manufactured homes around Myrtle Beach, South Carolina",
});
