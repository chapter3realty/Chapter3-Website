/* /sell/home-value/ - what is my home worth in Myrtle Beach: what homes like yours sold for, by area,
 * from the county's deeds; whether prices are dropping; how close online estimates and the county's
 * number come; how we price a home, shown on one real house; what moves the price here; why the
 * county's value is not the price; and the free valuation form.
 *
 * Batch 2026-10-d, Lane U. Version 1, built 2026-11-01. The live page was hand-made; this spec
 * replaces it. Facts: Blog-Brain batches/2026-10-d/sell-home-value/facts.md, VERIFIED and CORRECTED
 * rows only, at the verifier's wording (VERIFY.md; struck list sell-home-value-struck.json).
 * Data: data/2026-10-d/sell-home-value/findings.json (the Horry County deed index and parcels, the
 * FHFA house price index, Redfin's published accuracy table, the CRM's active listings counted in
 * aggregate) and cap-by-tenure.json (county parcels). Every chart, table and figure in the copy is
 * read from those files here, never typed.
 * Kept from the live page: the headline and title (data/headlines.json), the byline, the lead form
 * with its consent text word for word, the service promises (free, no obligation to list, a call the
 * same day, evenings included, the analysis usually within a day or two, the sold homes behind the
 * number), the links to the net proceeds, capital gains, property tax, coastal insurance,
 * non-warrantable condo, FSBO and selling pages.
 * Cut from the live page: "It depends", "Spring sales move fastest here" (not checked), the two
 * "Want us to look at it for you?" boxes, the second call button. Added: the legal valuation
 * disclosure beside the form (SC Code 40-60-30(1), ledger row 19).
 * No address box and no value box: the area picker takes an area and a kind of home only, and shows
 * that area's recorded sales. No automated value for any home.
 * Review 1 (2026-10-d, fix round 1): plain area names, the row-1 wording, the table wraps and folds
 * under the picker, fewer numbers and dates, one sub line, the photo moved to the section it shows,
 * the county value section cut to one answer. REVIEW-1.md in the batch folder lists each change.
 * Review 2 (fix round 2): the 20-row table cut to the three highest and three lowest areas (the picker
 * holds all 20), the townhouse rule under the picker, the price chart in percent change, both inline
 * charts drawn twice (a phone one and a wide one) so their text stays 13 to 16 px, the Redfin tiles, the
 * tax-cap rule and the tenure chart cut, one photo, "Water and golf" and the condo H3 folded into the
 * CMA steps, one card width. REVIEW-2.md lists each change.
 * Review 3 (fix round 3): one county value section (the quick-number test, condos and houses, the tax bill), the
 * worked example shown against its own neighborhood's sales instead of the county's value, what a listing adds to an
 * online estimate (Redfin's listed-home figure), new houses and the time of year as price factors, what comes off a
 * $350,000 sale, the data notes moved to the sources line, no italic hero line. REVIEW-3.md lists each change.
 * Round 3 data: fix3-findings.json (fix3.py; the worked example's neighborhood, active house listings by tag,
 * resales per month). Facts rows 26 to 31 in facts.md, VERIFIED-BY-FIXER.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, kit } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));

const DATA = path.join(__dirname, "..", "data", "2026-10-d", "sell-home-value");
const F = JSON.parse(fs.readFileSync(path.join(DATA, "findings.json"), "utf8"));
const F3 = JSON.parse(fs.readFileSync(path.join(DATA, "fix3-findings.json"), "utf8"));
/* Review 2 (owner): the tenure chart (cap-by-tenure.json) is cut; the county value section keeps one point. */
const NB_ = " ";

const SELF = "/sell/home-value/";
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const pct = (v) => `${Math.round(v)} percent`;

/* The period of the deed pull, from the data file (never typed): "recorded 2025-10-01 to 2026-09-30". */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const per = (F.meta.sales_source.match(/recorded (\d{4})-(\d{2})-\d{2} to (\d{4})-(\d{2})-\d{2}/) || []);
if (!per.length) throw new Error("findings.json meta: no recorded period");
const PERIOD = `12 months to ${MONTHS[+per[4] - 1]} ${per[3]}`;
const TEST_YEAR = per[3];

/* Ledger rows 1, 2, 4. */
const C = F.county_all, HOUSE = C.resale_house, CONDO = C.resale_condo;
if (HOUSE.n !== F.counts.resale_house || CONDO.n !== F.counts.resale_condo) throw new Error("findings.json: county_all and counts disagree");

/* Ledger row 3. Display names in the reader's words; the group rule is in the sources line.
   Cells under 20 sales are not printed (by_area_rule). */
/* Review 1 (owner): plain names a homeowner knows. "City of" and "Town of" are inside the limits;
   "Near" is a home with that town's mailing address outside its limits and outside any other place
   on the list (by_area_rule). The note under the picker says so in one line. */
const NAMES = {
  "Myrtle Beach (city)": "City of Myrtle Beach",
  "North Myrtle Beach (city)": "City of North Myrtle Beach",
  "Myrtle Beach mailing address, outside the city": "Near Myrtle Beach",
  "Little River": "Little River",
  "Conway mailing address, outside the city": "Near Conway",
  "Carolina Forest": "Carolina Forest",
  "Garden City": "Garden City",
  "Murrells Inlet (Horry County side)": "Murrells Inlet, Horry County side",
  "Socastee": "Socastee",
  "Conway (city)": "City of Conway",
  "Longs": "Longs",
  "Red Hill": "Red Hill",
  "Little River mailing address, outside Little River": "Near Little River",
  "Surfside Beach mailing address, outside the town": "Near Surfside Beach",
  "Surfside Beach": "Town of Surfside Beach",
  "Loris mailing address, outside the city": "Near Loris",
  "Forestbrook": "Forestbrook",
  "Aynor mailing address, outside the town": "Near Aynor",
  "Galivants Ferry": "Galivants Ferry",
  "Loris (city)": "City of Loris",
};
const MIN = 20;
const cell = (c) => (c && c.n >= MIN && c.iqr ? { med: c.median, lo: c.iqr[0], hi: c.iqr[1], n: c.n } : null);
const AREAS = F.by_area.map((a) => {
  if (!NAMES[a.area]) throw new Error(`findings.json by_area: no display name for "${a.area}"`);
  return { name: NAMES[a.area], house: cell(a.house), condo: cell(a.condo) };
});
const byName = (n) => { const a = AREAS.find((x) => x.name === n); if (!a) throw new Error(`no area ${n}`); return a; };
const CONWAY = byName("City of Conway"), NMB = byName("City of North Myrtle Beach");
const HIGH = AREAS.filter((a) => a.house).sort((x, y) => y.house.med - x.house.med);
const TOP = HIGH[0], BOTTOM = HIGH[HIGH.length - 1];
if (TOP.name !== "Town of Surfside Beach" || BOTTOM.name !== "City of Loris") throw new Error("the FAQ names the top and bottom areas: update it");
const condoShare = Math.round(F.area_coverage.condo_with_area / F.area_coverage.condo_resales * 10);

/* ---------- V1: the area picker and the table ---------- */
const PICK_CSS = "<style>"
  + "main#main .hv-pick{margin:1.4rem 0 1.2rem;max-width:760px;padding:1.1rem 1.15rem 1.15rem;border-radius:18px;box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 18px 40px -26px rgba(28,32,40,.45)}"
  + "main#main .hv-pick .row{display:grid;grid-template-columns:1fr;gap:.75rem}"
  + "@media (min-width:700px){main#main .hv-pick .row{grid-template-columns:3fr 2fr}}"
  + "main#main .hv-pick label{display:block;font-family:var(--sans);font-size:1rem;font-weight:600;color:var(--navy)}"
  + "main#main .hv-pick select{display:block;width:100%;margin-top:.35rem;min-height:48px;padding:.55rem .7rem;font-family:var(--sans);font-size:1.0625rem;color:var(--navy);background:#fff;border:1px solid rgba(28,32,40,.28);border-radius:10px;box-sizing:border-box}"
  + "main#main .hv-out{margin-top:1rem;padding-top:.9rem;border-top:1px solid rgba(28,32,40,.14);font-family:var(--sans);color:var(--navy)}"
  + "main#main .hv-out .big{display:block;font-family:var(--serif);font-size:2.4rem;line-height:1.1;color:var(--navy)}"
  + "main#main .hv-out .lbl{display:block;font-size:1rem;color:var(--muted);margin-top:.15rem}"
  + "main#main .hv-out .rng{display:block;font-size:1.0625rem;line-height:1.5;margin-top:.6rem;color:var(--navy)}"
  + "main#main .hv-note{font-size:1rem;color:var(--muted);line-height:1.6;max-width:720px;margin:.2rem 0 1.2rem}"
  + "</style>";
const PICK_DATA = { all: { house: cell(HOUSE), condo: cell(CONDO) } };
AREAS.forEach((a, i) => { PICK_DATA["a" + i] = { house: a.house, condo: a.condo }; });
const opts = [`<option value="all" selected>All of Horry County</option>`]
  .concat(AREAS.map((a, i) => ({ a, i })).sort((x, y) => x.a.name.localeCompare(y.a.name)).map(({ a, i }) => `<option value="a${i}">${a.name}</option>`)).join("");
const firstOut = `<span class="big">${r1k(HOUSE.median)}</span><span class="lbl">middle price, houses and other homes, all of Horry County</span><span class="rng">Half sold between ${r1k(HOUSE.iqr[0])} and ${r1k(HOUSE.iqr[1])}. ${n0(HOUSE.n)} sales.</span>`;
/* The script lives in a template string: no backslash escapes in it (VERDICTS 2026-10-26). */
const PICKER = `<div class="hv-pick" role="group" aria-label="What homes sold for, by area">`
  + `<div class="row"><label for="hvArea">Your area<select id="hvArea">${opts}</select></label>`
  + `<label for="hvType">Your home<select id="hvType"><option value="house" selected>House or townhouse</option><option value="condo">Condo unit</option></select></label></div>`
  + `<div class="hv-out" id="hvOut" aria-live="polite">${firstOut}</div></div>`
  + `<script>(function(){var D=${JSON.stringify(PICK_DATA)};var NM={house:"houses and other homes",condo:"condos"};`
  + `function m(v){return "$"+(Math.round(v/1000)*1000).toLocaleString("en-US")}`
  + `function go(){var a=document.getElementById("hvArea"),t=document.getElementById("hvType"),o=document.getElementById("hvOut");if(!a||!t||!o)return;`
  + `var c=(D[a.value]||{})[t.value],where=a.options[a.selectedIndex].text;o.textContent="";`
  + `function s(cls,txt){var e=document.createElement("span");e.className=cls;e.textContent=txt;o.appendChild(e)}`
  + `if(!c){s("big","Too few sales");s("rng","Fewer than ${MIN} "+NM[t.value]+" sold in "+where+" in the year. We price a home here from sales of similar homes in the areas around it.");return}`
  + `s("big",m(c.med));s("lbl","middle price, "+NM[t.value]+", "+where);s("rng","Half sold between "+m(c.lo)+" and "+m(c.hi)+". "+c.n.toLocaleString("en-US")+" sales.")}`
  + `document.addEventListener("DOMContentLoaded",function(){var a=document.getElementById("hvArea"),t=document.getElementById("hvType");if(a)a.addEventListener("change",go);if(t)t.addEventListener("change",go)})})();</script>`;
/* Review 2 (owner, critic): the 20-row table repeated the picker's list and wrapped unevenly on a phone.
   The picker holds all 20 areas; under it, the three highest and three lowest middle house prices only,
   as the site's chart (a phone list under 700 px, so each row is one line and the range under it). */
const TOP3 = HIGH.slice(0, 3), LOW3 = HIGH.slice(-3);
/* A real table (score A6), drawn the same way on every row at every width: on a phone each row is the
   area's name, then two cells, each a small label over a value that does not wrap; under 380 px the two
   cells stack. All values are six-figure prices, so every row has the same shape (critic, 390 px). */
const ENDS_CSS = "<style>main#main .hv-tabwrap{max-width:760px;margin:1.2rem 0 1rem;padding:.7rem 1rem .5rem;border-radius:18px;box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.75)}"
  + "main#main .hv-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:var(--read,1.0625rem);color:var(--navy)}"
  + "main#main .hv-tab caption{text-align:left;font-weight:600;padding:.3rem 0 .6rem;line-height:1.4}"
  + "main#main .hv-tab th,main#main .hv-tab td{padding:.55rem .4rem;border-bottom:1px solid rgba(28,32,40,.12);text-align:left;vertical-align:top;line-height:1.35}"
  + "main#main .hv-tab thead th{font-size:.95rem;border-bottom:2px solid var(--navy)}"
  + "main#main .hv-tab th.grp{font-size:.875rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);padding-top:.9rem;border-bottom:1px solid rgba(28,32,40,.2)}"
  + "main#main .hv-tab tbody th[scope=row]{font-weight:500}"
  + "main#main .hv-tab td{white-space:nowrap;font-variant-numeric:tabular-nums}main#main .hv-tab td .l{display:none}"
  + "main#main .hv-tab tbody tr:last-child>*{border-bottom:0}"
  + "@media (max-width:599px){main#main .hv-tab,main#main .hv-tab tbody,main#main .hv-tab caption{display:block;width:100%}"
  + "main#main .hv-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}"
  + "main#main .hv-tab tr{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:1.2rem;padding:.6rem 0;border-bottom:1px solid rgba(28,32,40,.12)}"
  + "main#main .hv-tab tbody tr:last-child{border-bottom:0}main#main .hv-tab th,main#main .hv-tab td{border:0;padding:0}"
  + "main#main .hv-tab tbody th{grid-column:1/-1;padding-bottom:.2rem}main#main .hv-tab tbody th[scope=row]{font-weight:600}main#main .hv-tab th.grp{padding:.6rem 0 0}"
  + "main#main .hv-tab td .l{display:block;font-size:.875rem;color:var(--muted)}}"
  + "@media (max-width:379px){main#main .hv-tab tr{grid-template-columns:1fr;row-gap:.3rem}}</style>";
const endRow = (a) => `<tr><th scope="row">${a.name}</th><td><span class="l">Middle price</span>${r1k(a.house.med)}</td><td><span class="l">Half sold between</span>${r1k(a.house.lo)} to ${r1k(a.house.hi)}</td></tr>`;
const ENDS = ENDS_CSS + `<div class="hv-tabwrap"><table class="hv-tab"><caption>Middle house price in the three highest and three lowest of ${AREAS.length} areas</caption>`
  + `<thead><tr><th scope="col">Area</th><th scope="col">Middle price</th><th scope="col">Half sold between</th></tr></thead>`
  + `<tbody><tr><th colspan="3" scope="colgroup" class="grp">Highest</th></tr>${TOP3.map(endRow).join("")}</tbody>`
  + `<tbody><tr><th colspan="3" scope="colgroup" class="grp">Lowest</th></tr>${LOW3.map(endRow).join("")}</tbody></table></div>`;
/* Under the picker: which row is mine, and which kind of home (reader: "does a townhouse count?").
   The rule is the data's own (findings.json meta.condo_rule): a condo is county land use code 107 or a
   horizontal property regime unit; every other home with a building is in the house group. */
/* Review 3 (owner): one plain line under the picker; the area and condo rules are in the sources line. */
const ROW_NOTE = `<p class="hv-note">A townhouse or a mobile home on its own lot counts as a house. Not sure which area is yours? Send the address in the form below and we will tell you.</p>`;

/* ---------- V2: the FHFA index, set at 100 in mid-2021 (ledger row 6) ---------- */
const SER = F.fhfa_myrtle_beach_msa.series.filter(([y]) => y >= 2016);
const q = (y, qq) => { const r = SER.find(([a, b]) => a === y && b === qq); if (!r) throw new Error(`FHFA ${y}Q${qq} missing`); return r[2]; };
const LAST = SER[SER.length - 1], BASE = q(2021, 2);
const rise2125 = Math.round((q(2025, 2) / BASE - 1) * 100);
const yoy = Math.round((LAST[2] / q(LAST[0] - 1, LAST[1]) - 1) * 1000) / 10;
if (rise2125 !== 51 || yoy !== 0.8) throw new Error(`FHFA: ledger row 6 says 51 and 0.8; the file gives ${rise2125} and ${yoy}`);
/* Review 2 (owner, critic): percent change since mid-2021, not index points. Each inline chart is drawn
   twice, at the width it shows at: a phone one (viewBox 300, shown up to 599 px, at most 310 px wide) and a
   wide one (viewBox 600, shown from 600 px, at most 620 px wide). Its text then shows at 13 to 16 px at
   every width, under the H3s (critic: 25 px at 1440 and 10 px at 320 with one viewBox). */
const CHART_CSS = "<style>main#main svg.hv-n{display:block;width:100%;height:auto;max-width:310px;margin:0 auto}main#main svg.hv-w{display:none;width:100%;height:auto;max-width:620px}"
  + "@media (min-width:600px){main#main svg.hv-n{display:none}main#main svg.hv-w{display:block}}</style>";
const lastPct = Math.round((LAST[2] / BASE - 1) * 100);
const sgn = (v) => (v > 0 ? "+" : v < 0 ? "\u2212" : "") + Math.abs(v) + "%";
const fhfaSvg = (W, fs, cls) => {
  const H = Math.round(W * 0.62), x0 = Math.round(fs * 3.3), x1 = W - 10, y0 = 14, y1 = H - fs * 2.2, lo = -40, hi = 60;
  const t = (y, qq) => (y - 2016) + (qq - 1) / 4;
  const T1 = t(LAST[0], LAST[1]);
  const X = (v) => x0 + (v / T1) * (x1 - x0), Y = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
  const P = (v) => (v / BASE - 1) * 100;
  const pts = SER.map(([y, qq, v]) => [X(t(y, qq)), Y(P(v))]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  const area = `${line}L${x1} ${Y(lo).toFixed(1)}L${x0} ${Y(lo).toFixed(1)}Z`;
  const grid = [-40, -20, 0, 20, 40, 60].map((g) => `<line x1="${x0}" x2="${x1}" y1="${Y(g).toFixed(1)}" y2="${Y(g).toFixed(1)}" stroke="#1c2028" stroke-opacity="${g === 0 ? ".3" : ".1"}"/><text x="${x0 - 6}" y="${(Y(g) + fs * 0.35).toFixed(1)}" text-anchor="end" font-size="${fs}" fill="#4a4f5c">${sgn(g)}</text>`).join("");
  const yrs = W < 400 ? [2016, 2019, 2022, 2025] : [2016, 2018, 2020, 2022, 2024, 2026];
  const xl = yrs.map((y) => `<text x="${X(t(y, 1)).toFixed(1)}" y="${(H - fs * 0.5).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="#4a4f5c">${y}</text>`).join("");
  const b = [X(t(2021, 2)), Y(0)], l = [X(T1), Y(P(LAST[2]))];
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of house prices in Horry County, as the change since mid-2021, by quarter, from the federal house price index. Prices were about ${Math.abs(Math.round(P(SER[0][2])))} percent lower in early 2016, rose to about ${Math.round(P(q(2025, 2)))} percent above mid-2021 by mid-2025, and have been about flat since, at ${lastPct} percent above in the latest quarter.">`
    + `<defs><linearGradient id="hvFill${cls}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c4783a" stop-opacity=".28"/><stop offset="1" stop-color="#c4783a" stop-opacity="0"/></linearGradient></defs>`
    + grid + xl
    + `<path d="${area}" fill="url(#hvFill${cls})"/><path d="${line}" fill="none" stroke="#c4783a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<circle cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="4.5" fill="#1c2028"/><text x="${(b[0] - 8).toFixed(1)}" y="${(b[1] - fs * 0.6).toFixed(1)}" text-anchor="end" font-size="${fs}" font-weight="600" fill="#1c2028" stroke="#fbf8f3" stroke-width="4" stroke-linejoin="round" paint-order="stroke">mid-2021</text>`
    + `<circle cx="${l[0].toFixed(1)}" cy="${l[1].toFixed(1)}" r="4.5" fill="#1c2028"/><text x="${(l[0] - 4).toFixed(1)}" y="${(l[1] - fs * 0.8).toFixed(1)}" text-anchor="end" font-size="${fs}" font-weight="600" fill="#1c2028" stroke="#fbf8f3" stroke-width="4" stroke-linejoin="round" paint-order="stroke">now: up ${lastPct}%</text>`
    + `</svg>`;
};
const FHFA_FIG = h.figure(fhfaSvg(300, 15.5, "hv-n") + fhfaSvg(600, 15, "hv-w"), `Change in house prices in Horry County since mid\u20112021, by quarter: up about half by mid\u20112025, then about flat for a year. Federal Housing Finance Agency house price index; houses only.`);

/* Ledger rows 5 and 7. */
const months = Object.values(F.by_month);
const mH = months.map((m) => m.house.median), mC = months.map((m) => m.condo.median);
const MT = F.methods_test;
const condoBelow = Math.round(MT.condo.county_value.estimate_above_price_pct / 10);
const houseAbove = Math.round((100 - MT.house.county_value.estimate_above_price_pct) / 10);
if (condoBelow !== 7 || houseAbove !== 6) throw new Error("ledger row 7: 7 in 10 condos, 6 in 10 houses");

/* ---------- V3: Redfin's own figures (row 8) as tiles, then our test (row 9) as bars ---------- */
const RF = F.redfin_horry.classic, RL = F.redfin_horry.lavm;
const rfMed = Math.round(RF.medianError * 1000) / 10, rfIn5 = Math.round(RF.errorsWithin5 * 10), rfOver20 = Math.round(1 / (1 - RF.errorsWithin20));
const rlMed = Math.round(RL.medianError * 10000) / 100;
if (rfMed !== 6.6 || rfIn5 !== 4 || rfOver20 !== 7 || rlMed !== 1.65) throw new Error("ledger row 8 figures changed in findings.json");
/* Review 2 (owner: too many numbers): the three Redfin tiles are cut to one sentence with two figures. */
const HT = MT.house, NB = HT.neighbors_median, CV = HT.county_value;
const ON = 350000;
/* Review 3 (owner): the chart holds the two percentages; no dollar column and no data note (the test's scope is in the
   sources line: house resales recorded January to September, critic). */
const TEST_CHART = G.bars([
  { name: `Middle price of the six nearest${NB_}sales`, value: NB.median_miss_pct, valueText: `${Math.round(NB.median_miss_pct)}% off` },
  { name: "The county's value", value: CV.median_miss_pct, valueText: `${Math.round(CV.median_miss_pct)}% off` },
], { caption: "How far off two quick numbers were on a typical house", nameLabel: "Quick number", valueLabel: "how far off", max: 20 });

/* ---------- V4: the worked example (rows 10 and 26) as a dot strip ---------- */
/* Review 3 (reader): the example shows the house against its own neighborhood's other sales, not the county's value
   (owner: one county value section). Critic: the phone label sat left of the median tick and the dashed line ran into
   it. The dashed line now shows only beside each row of dots, and the median label is two lines centered on its tick. */
const WX = F.worked_example, WG = F3.worked_example_group;
const wxNb = Math.round(WX.miss_neighbors_pct);
if (wxNb !== 16 || WG.n !== 4 || WG.sold_for_less_than_example !== 4 || WG.example_price !== WX.price) throw new Error("ledger rows 10 and 26 changed");
const six = WX.six_sales.map((s) => s.price), hood = WG.prices;
const dotsSvg = (W, fs, cls) => {
  const lo = 250000, hi = 750000, x0 = 12, x1 = W - 12, g = fs * 1.15;
  const X = (v) => x0 + (v - lo) / (hi - lo) * (x1 - x0);
  /* Rows: a label line, then the marks under it; under the first row, the two-line median label. */
  const r1 = fs * 2.6, d1 = r1 + g, r2 = d1 + fs * 4.7, d2 = r2 + g, r3 = d2 + fs * 2.2, d3 = r3 + g, H = Math.round(d3 + fs * 1.1);
  const est = (txt) => txt.length * fs * 0.56;
  const halo = ' fill="#1c2028" stroke="#fbf8f3" stroke-width="4" stroke-linejoin="round" paint-order="stroke"';
  /* A value label sits right of its mark, or left of it when it would run past the edge. */
  const vl = (x, y, txt, bold) => { const right = x + 12 + est(txt) <= W - 2; return `<text x="${(right ? x + 12 : x - 12).toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${right ? "start" : "end"}" font-size="${fs}"${bold ? ' font-weight="600"' : ""}${halo}>${txt}</text>`; };
  const ticks = [300000, 500000, 700000].map((v) => `<line x1="${X(v).toFixed(1)}" x2="${X(v).toFixed(1)}" y1="${fs * 1.4}" y2="${H - 4}" stroke="#1c2028" stroke-opacity=".08"/><text x="${X(v).toFixed(1)}" y="${fs}" text-anchor="middle" font-size="${fs}" fill="#4a4f5c">${r1k(v).replace(",000", "k")}</text>`).join("");
  const sold = X(WX.price), nb = X(WX.neighbors_median);
  const lab = (y, t) => `<text x="${x0}" y="${y.toFixed(1)}" font-size="${fs}" font-weight="600" fill="#1c2028" stroke="#fbf8f3" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${t}</text>`;
  const dot = (v) => `<circle cx="${X(v).toFixed(1)}" cy="__Y__" r="7" fill="#7d8291" fill-opacity=".75" stroke="#fff" stroke-width="1.5"/>`;
  const ml = `<text x="${nb.toFixed(1)}" text-anchor="middle" font-size="${fs}"${halo}><tspan x="${nb.toFixed(1)}" y="${(d1 + fs * 1.85).toFixed(1)}">middle</tspan><tspan x="${nb.toFixed(1)}" y="${(d1 + fs * 3.0).toFixed(1)}" font-weight="600">${r1k(WX.neighbors_median)}</tspan></text>`;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Dot chart on one price line from $250,000 to $750,000. The six nearest sales are dots from ${r1k(Math.min(...six))} to ${r1k(Math.max(...six))}, with their middle at ${r1k(WX.neighbors_median)}. The other sales in the house's own neighborhood are dots from ${r1k(Math.min(...hood))} to ${r1k(Math.max(...hood))}. The house sold for ${r1k(WX.price)}, more than any of them.">`
    + ticks
    + [d1, d2, d3].map((d) => `<line x1="${sold.toFixed(1)}" x2="${sold.toFixed(1)}" y1="${(d - 11).toFixed(1)}" y2="${(d + 11).toFixed(1)}" stroke="#c4783a" stroke-width="2" stroke-dasharray="4 4"/>`).join("")
    + lab(r1, "The six nearest sales")
    + six.map((v) => dot(v).replace("__Y__", d1.toFixed(1))).join("")
    + `<line x1="${nb.toFixed(1)}" x2="${nb.toFixed(1)}" y1="${(d1 - 12).toFixed(1)}" y2="${(d1 + 12).toFixed(1)}" stroke="#1c2028" stroke-width="3"/>` + ml
    + lab(r2, "Other sales in its neighborhood")
    + hood.map((v) => dot(v).replace("__Y__", d2.toFixed(1))).join("")
    + lab(r3, "What it sold for")
    + `<circle cx="${sold.toFixed(1)}" cy="${d3.toFixed(1)}" r="8" fill="#c4783a"/>` + vl(sold, d3 + fs * 0.35, r1k(WX.price), true)
    + `</svg>`;
};
const DOTS_FIG = h.figure(dotsSvg(300, 15.5, "hv-n") + dotsSvg(600, 15, "hv-w"), "One Carolina Forest house, from county records. Gray dots are sales. The black line is the middle of the six nearest. The dashed line is what the house sold for.");

/* ---------- V5: asking price per square foot by distance from the ocean (row 17) ---------- */
const LC = F.listings.condo_by_ocean, LH = F.listings.house_by_ocean;
const BANDS = [["under 0.1 mile", "Within 0.1 mile"], ["0.1 to 0.5 mile", "0.1 to 0.5 mile"], ["0.5 to 2 miles", "0.5 to 2 miles"], ["over 2 miles", "Over 2 miles"]];
const OCEAN_CHART = G.bars(BANDS.map(([k, name]) => ({ name, value: LC[k].median_asking_per_sqft, valueText: `$${LC[k].median_asking_per_sqft} a${NB_}sq${NB_}ft`, feature: `middle size ${n0(Math.round(LC[k].median_sqft / 5) * 5)}${NB_}sq${NB_}ft` })),
  { caption: "Asking price per square foot of condos for sale, by distance from the ocean", nameLabel: "Distance from the ocean", featureLabel: "middle size", valueLabel: "asking price per square foot",
    note: `Condos for sale in Horry County, about ${n0(Math.round(Object.values(LC).reduce((t, b) => t + b.n, 0) / 100) * 100)} in all, counted in aggregate from our listings feed. Asking prices, not sale prices. Distance in a straight line to the ocean.` });
const condoRatio = Math.round(LC["under 0.1 mile"].median_asking_per_sqft / LC["over 2 miles"].median_asking_per_sqft * 10) / 10;
const houseRatio = Math.round(LH["under 0.1 mile"].median_asking_per_sqft / LH["over 2 miles"].median_asking_per_sqft * 10) / 10;
if (condoRatio !== 1.9 || houseRatio !== 2.5) throw new Error("ledger row 17 ratios changed");

/* ---------- Row 18 ---------- */
const FL = F.flood;
const flPct = Math.round(FL.in_sfha / FL.resales_with_point * 100);
const flCondo = Math.round(FL.by_type.condo.n / FL.by_type.condo.in_sfha), flHouse = Math.round(FL.by_type.house.n / FL.by_type.house.in_sfha);
const flPrem = Math.round((FL.same_subdivision_houses.in_sfha.median_vs_neighbors - 1) * 100);
if (flPct !== 13 || flCondo !== 4 || flHouse !== 15 || flPrem !== 12) throw new Error("ledger row 18 figures changed");
/* Review 3: "most of them condos" (956 of the 1,384 inside the zone). */
if (!(FL.by_type.condo.in_sfha / FL.in_sfha > 0.5)) throw new Error("ledger row 18: most inside the zone are condos");

/* Rows 28 and 29 (review 3, owner: more of what moves a seller's price, and when to list). Active house listings
   more than 2 miles from the ocean and not listed as waterfront: new (built this year or last, the site's card tag)
   against older. Resales recorded per month. */
const LF = F3.listings_houses.over_2_miles;
const newSq = LF.new_not_waterfront.median_asking_per_sqft, oldSq = LF.older_not_waterfront.median_asking_per_sqft;
if (newSq !== 194 || oldSq !== 200) throw new Error("ledger row 28 changed");
const MC = Object.entries(F3.by_month_counts);
const mcH = (keys) => MC.filter(([m]) => keys.includes(m.slice(5))).map(([, v]) => v.house);
const warm = mcH(["05", "06", "07", "08", "09", "10"]), cold = mcH(["01", "02"]);
const r10 = (v) => Math.round(v / 10) * 10;
const warmLo = r10(Math.min(...warm)), warmHi = r10(Math.max(...warm)), coldMid = r10((cold[0] + cold[1]) / 2);
const mLo = r1k(Math.min(...mH)), mHi = r1k(Math.max(...mH));
if (warmLo !== 620 || warmHi !== 670 || coldMid !== 430 || mLo !== "$333,000" || mHi !== "$368,000") throw new Error("ledger rows 5 and 29 changed");
/* In the copy, one ratio and one band: 618 to 670 a month against 427 and 430 is 1.44 to 1.57 times; $333,000 to $368,000
   is 4.9 percent under to 5.1 percent over $350,000. */
const warmX = Math.round(Math.min(...warm) / Math.max(...cold) * 2) / 2, mBand = Math.round(Math.max(HOUSE.median - Math.min(...mH), Math.max(...mH) - HOUSE.median) / HOUSE.median * 100);
if (warmX !== 1.5 || mBand !== 5) throw new Error("ledger row 29: 1.5 times, within 5 percent");

/* Ledger row 14. Review 2 (owner): the tenure chart and the 15 percent rule are cut from the body. */
const CP = F.cap;
const capShare = Math.round(CP.pct_below / 100 * 3);
if (capShare !== 2) throw new Error("ledger row 14: 2 in 3");

/* Photos: licence records in data/2026-10-b/photos.json (USGS, public domain); look checked at full size 2026-11-01.
   Review 2 (owner): one photo, with a caption that states its fact (ledger row 17, houses 2.5 times). */
const ph = kit.photoSet({ aerialWidth: "760px" });
const OCEAN_PHOTO = ph.aerial("crescent-beach-streets-from-the-ocean-2011",
  `Crescent Beach in North Myrtle Beach from over the ocean in 2011: buildings on the beach, then streets of houses. Houses for sale within 0.1${NB_}mile of the ocean ask about ${houseRatio} times as much a square foot as houses more than 2${NB_}miles away.`, { closeUp: true });
/* Article.image and the share image: the Crescent Beach file has no 1x1, 4x3 or 16x9 crop at 1,200 px (its
   copy on the site is 1200 x 782), so the page keeps the crops of the licensed beach photo it showed in
   round 1 (data/photos.json, 28bytes, CC BY-SA 4.0). NEEDS.md item 9 asks for Crescent Beach crops. */
const P_ = require(path.join(BB, "tools", "photos.js"));
const { batchPhotos } = require("./_kit.js");
const SHARE_IMAGES = () => P_.pageImages(P_.findPhoto(batchPhotos(), "myrtle-beach-beach-from-above"));
/* Stopgap for two sitewide parts (critic, review 1; NEEDS.md item 7): the homes strip's search row ran
   past a 320 px window, and the header ran 5 px past a 1024 px one. Remove this when the lead fixes them
   in the shared strip and header. */
const CHROME_CSS = "<style>@media (max-width:379px){main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0;max-width:100%;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-inner nav.primary{gap:2.2rem}}</style>";

/* Review 2 (critic, 1024 and 1440): one card width. The form, the offers, the contents box and the charts
   ended at four different right edges; every card now stops at 760 px, the picker's and the photos' width. */
const WIDTH_CSS = "<style>@media (min-width:700px){main#main nav[aria-label=\"On this page\"],main#main .c3-offer,main#main .c3-gchart,main#main section>.wrap>div[style*=\"max-width:720px\"]{max-width:760px!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:not(:last-of-type)>.wrap{max-width:760px!important}}</style>";

/* ---------- The form (kept from the live page: the same fields, ids, consent text and handler) ---------- */
const CONSENT = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";
const DISCLOSE = "This valuation service may not be used for the purposes of obtaining financing in a federally related transaction.";
const FORM_CSS = "<style>main#main .hv-form{max-width:760px;margin:1.4rem 0 1rem;padding:1.4rem 1.3rem;border-radius:20px;box-sizing:border-box;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)}"
  + "main#main .hv-form .idx-lead{margin-bottom:.7rem}main#main .hv-form .idx-input{min-height:48px;font-size:1.0625rem}"
  + "main#main .hv-form .hv-consent{display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.875rem;color:rgba(244,239,232,.86);line-height:1.5;margin:.3rem 0 1rem;cursor:pointer}"
  + "main#main .hv-form .hv-consent input{margin-top:.2rem;accent-color:#c4783a;flex-shrink:0;width:20px;height:20px}"
  + "main#main .hv-form .btn{width:100%;justify-content:center;min-height:50px}"
  + "main#main .hv-form .hv-err{display:none;color:#ffb4a8;font-family:var(--sans);font-size:1rem;margin:0 0 .8rem}"
  + "main#main .hv-ok{display:none;max-width:760px;margin:1.4rem 0 1rem;padding:1.3rem;border-radius:20px;background:var(--navy);color:var(--ivory);font-family:var(--sans);font-size:1.0625rem;line-height:1.6}"
  /* The end band. The listings feed's notice is written into <main> after it at the edge, so the band is no
     longer the last child and glass.js draws it as the slim light top bar, with ivory text on a light card
     (preview, 2026-11-01; NEEDS.md). The last <section> keeps its dark panel here. */
  + "main#main>section[style^=\"background:var(--navy)\"]:last-of-type{padding:2.5rem 0 3rem!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:last-of-type>.wrap{display:block!important;text-align:center!important;max-width:720px!important;margin:0 auto!important;padding:2.2rem 1.4rem!important;width:calc(100% - 32px);box-sizing:border-box;border-radius:22px;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important}"
  + "@media (max-width:699px){main#main #lead-form .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}main#main #lead-form .c3-glance li{flex-direction:row;text-align:left;gap:.6rem;padding:.6rem .7rem}}"
  + "main#main .hv-disc{font-family:var(--sans);font-size:1rem;line-height:1.6;color:var(--navy);max-width:760px;margin:0 0 1rem;padding:.8rem 1rem;border-left:3px solid var(--brass);background:rgba(255,255,255,.5);border-radius:0 12px 12px 0}</style>";
const FORM = `<div id="ldWrap" class="hv-form">`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldCtx" placeholder="Property address" aria-label="Property address" autocomplete="street-address"></div>`
  + `<div class="idx-lead"><input class="idx-input" id="ldName" placeholder="Your name" aria-label="Your name" autocomplete="name"><input class="idx-input" id="ldPhone" placeholder="Phone" aria-label="Phone" type="tel" autocomplete="tel"></div>`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldEmail" placeholder="Email" aria-label="Email" type="email" autocomplete="email"></div>`
  + `<label class="hv-consent"><input type="checkbox" id="ldConsent"><span>${CONSENT}</span></label>`
  + `<p id="ldErr" class="hv-err" role="alert"></p>`
  + `<button type="button" class="btn btn-brass btn-lg" onclick="ldSubmit()">Get my home value</button></div>`
  + `<div id="ldOk" class="hv-ok">Thanks. Tim Nash and the team will reach out the same day to talk through your home and start your market analysis. If it is evening, we still call.</div>`
  + `<p class="hv-disc">${DISCLOSE}</p>`
  + `<script>function ldSubmit(){`
  + `var cx=document.getElementById('ldCtx').value.trim(),n=document.getElementById('ldName').value.trim(),ph=document.getElementById('ldPhone').value.trim(),em=document.getElementById('ldEmail').value.trim(),c=document.getElementById('ldConsent').checked,err=document.getElementById('ldErr');`
  + `function fail(m){err.textContent=m;err.style.display='block';}err.style.display='none';`
  + `if(!cx||!n){fail('Add the property address and your name.');return;}`
  + `if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}`
  + `if(!c){fail('Check the consent box to send the request.');return;}`
  + `c3SendForm({property_address:cx,name:n,phone:ph,email:em,consent:c?'yes':'no'},'home-value');`
  + `document.getElementById('ldWrap').style.display='none';document.getElementById('ldOk').style.display='block';}</script>`;

/* Sources: each opened by the researcher and again by the verifier. */
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const FHFA = "https://www.fhfa.gov/data/hpi";
const REDFIN = "https://www.redfin.com/redfin-estimate";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const T12_24 = "https://www.scstatehouse.gov/code/t12c024.php";
const T40_60 = "https://www.scstatehouse.gov/code/t40c060.php";
const ASSESSOR = "https://www.horrycountysc.gov/departments/assessor/guide-to-assessment/";
const IRS701 = "https://www.irs.gov/taxtopics/tc701";
const T12_8 = "https://www.scstatehouse.gov/code/t12c008.php";

const LEAD = "#lead-form";
const LABEL = "Get my home value";

/* Review 3 (owner): no italic hero line. mkpage requires h1em; it is empty and this hides the empty line. */
const HERO_CSS = "<style>main#main h1.detail-h1>br:last-of-type,main#main h1.detail-h1>em:empty{display:none}</style>";
const deedFee = money(Math.ceil(ON / 500) * 1.85);
if (deedFee !== "$1,295") throw new Error("ledger row 23: $1,295 on $350,000");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "What Is My Myrtle Beach Home Worth? Free, Same Day | Chapter3",
  description: "What is your Myrtle Beach home worth? What homes like yours sold for by area, from the county's deeds, how close online estimates come, and a free valuation.",
  /* The beach photo's 1x1, 4x3 and 16x9 crops: Article.image and the share image (see SHARE_IMAGES). */
  pageImages: SHARE_IMAGES,
  ogTitle: "What is my home worth in Myrtle Beach? What homes sold for by area, how close online estimates come, and a free valuation",
  crumb: "Home Value",
  /* Review 3 (owner): the eyebrow, the italic line and the sub said the same thing three times. The sub stays. */
  eyebrow: "Selling a home",
  /* The owner's headline (data/headlines.json), on one line: mkpage requires the place in spec.h1. */
  h1: "What is my home worth in Myrtle Beach?",
  h1em: "",
  sub: "A licensed broker tells you what your own Horry County home is worth, free, from the sales most like it.",
  heroCta: { title: "Send your address. An agent calls the same day.", label: LABEL, href: LEAD },
  author: "devin",
  /* Review 3 (owner): the price first, the date once; the lowest and highest areas (owner nit; critic: "houses and other homes"). */
  shortAnswer: [
    `Houses and other homes that resold in Horry County went for a middle price of about ${r1k(HOUSE.median)} in the ${PERIOD}, and condos for about ${r1k(CONDO.median)}. By area, the middle house price ran from about ${r1k(BOTTOM.house.med)} in the city of Loris to about ${r1k(TOP.house.med)} in the town of Surfside Beach.`,
    `For what your own home is worth, an agent picks the sales most like it and sends you the number with those sales.`,
  ],
  sections: [
    { h2: "What did homes sell for in my area of Myrtle Beach?", toc: "Your area", id: "your-area", html: (bg) =>
      HERO_CSS + PICK_CSS + CHART_CSS + WIDTH_CSS + CHROME_CSS + ph.css() +
      h.p(`Pick your area and your kind of home. Half of the homes sold for more than the middle price, and half for less.`) +
      PICKER + ROW_NOTE +
      h.p(`Where your home falls in that range depends on its size, age, lot and condition. That is the part we work out for you.`) +
      ENDS +
      h.cta("Find out where your home falls in that range", "Send the address. An agent tells you where in your area's range your home falls, and why.", "Show me where mine falls", LEAD, bg) },

    { h2: "Are home prices dropping in Myrtle Beach?", toc: "Prices now", id: "prices-now", html: () =>
      h.p(`No. House prices in Horry County have been about flat for a year, after rising about half in the four years before.`) +
      FHFA_FIG },

    /* Review 3 (reader): why a typical 6.6 percent miss is not good enough on one house, and what a listing adds. */
    { h2: "How accurate are online home estimates in Myrtle Beach?", toc: "Online estimates", id: "online-estimates", html: (bg) =>
      h.p(`Redfin publishes how close its own estimate comes in Horry County. For homes that were not for sale, the middle miss was ${rfMed} percent: about ${r1k(RF.medianError * ON)} on a ${money(ON)} house. Half of the homes were further off, and about 1${NB_}in${NB_}${rfOver20} was off by more than 20 percent.`) +
      h.p(`No online estimate, Zillow's Zestimate included, tells you whether your home is one of the close ones or one of the far ones.`) +
      h.p(`Once a home is listed for sale, Redfin's middle miss here falls to ${rlMed} percent. It is closer then because there is more data about a home for sale. A listing adds what the county's records do not show: the rooms, the updates, the photos and an asking price. Our agent looks at those things with you before you list, and sends the number with the sales behind it. Before you list, read ${h.a("/sell/repairs-before-selling/", "what to fix before you sell")} and ${h.a("/sell/best-time-to-sell/", "the best month to list")}.`) +
      h.cta("Get a closer number than an online estimate", "Send the online number you have, and an agent tells you how close it is for your home, with the sales behind it. Free, and you do not have to list.", "Have us check my online estimate", LEAD, bg) },

    /* Review 3 (owner): one county value section, with the test, condos and houses, and the tax bill. */
    { h2: "Is the county's value or the nearest sales a good guess at my price?", toc: "Quick numbers", id: "county-value", html: () =>
      h.p(`Two quick numbers are often used as a price: the middle price of the six nearest sales, and the county's value, which is the market value on the home's county property record. We checked both against the prices of houses sold this year.`) +
      TEST_CHART +
      h.p(`The county's value was closer, but it is a mass estimate, made for every home at once, for tax. It is above the price on most condos and below it on most houses: about ${condoBelow} in 10 condos sold for less than it, and ${houseAbove} in 10 houses sold for more.`) +
      h.p(`Your tax bill is a worse guide. About ${capShare} in 3 Horry County homes are taxed on less than the county's value. A sale resets the value as of December 31 of the year the home sold, so ${h.a("/buyers/property-taxes/", "your buyer's tax bill")} can be higher than yours.`) },

    { h2: "How is a home's value worked out in Myrtle Beach?", toc: "How we price it", id: "how-we-price-it", html: (bg) =>
      h.p(`We start from the sales most like your home. The nearest sales, or the sales on your street, can be far off. Here is one Carolina Forest house from the county's records.`) +
      DOTS_FIG +
      h.ol([
        `<strong>The six nearest sales</strong> had a middle price of about ${r1k(WX.neighbors_median)}, about ${r1k(WX.neighbors_median - WX.price)} more than the house sold for. Only one of the six was in its neighborhood.`,
        `<strong>The other ${WG.n} house sales in its own neighborhood</strong> in the year went for ${r1k(Math.min(...hood))} to ${r1k(Math.max(...hood))}.`,
        `<strong>The house sold</strong> for about ${r1k(WX.price)}, more than any of them.`,
      ]) +
      h.p(`The county's records do not say why this house sold for more than its neighbors. A comparative market analysis, or CMA, finds out. It does five things the quick numbers cannot:`) +
      h.ul([
        "It keeps only sales like the home in size, age, lot and condition, from the same neighborhood or the next one over. For a condo, that means sales in the same building. For a home on the water or a golf course, sales on the same water or course.",
        "It adjusts each of those sales for what differs from the home.",
        "It looks at the home's condition, updates and view, with the owner.",
        "It compares the home with the homes for sale near it now.",
        "It ends in a price range and a list price.",
      ]) +
      h.p(`A condo's price also depends on whether lenders will lend in its building. Where many will not, fewer buyers can get a loan. Our ${h.a("/invest/non-warrantable-condos/", "guide to condos most lenders will not lend on")} explains which buildings and why.`) +
      h.p(`Our agents do a CMA for your home, free.`) +
      h.cta("Have an agent price your home", "Usually in a day or two.", "Ask us to price it", LEAD, bg) +
      h.h3("Is a CMA the same as an appraisal?") +
      h.p(`No. An appraisal is a licensed appraiser's opinion of value. In South Carolina, appraisal work and the title of appraiser need an appraiser's license, and an agent's valuation may not be called an appraisal.`) +
      h.p(`Our agents see low appraisals only rarely here. When a buyer's appraisal comes in low, our agents ask the appraiser to look again, and send recent sales of homes like yours. Once, the value went up, and the buyer brought less cash to closing.`) },

    /* Review 3 (owner): more of what moves a seller's own price, and when to list. Pool, garage and age have no
       public-record or listing field here (REVIEW-3.md). */
    { h2: "What changes a home's price in Myrtle Beach?", toc: "What changes price", id: "what-changes-price", html: () =>
      h.h3("How close it is to the ocean") +
      h.p(`Condos within 0.1 mile of the ocean ask about twice as much per square foot as condos more than 2 miles away.`) +
      OCEAN_CHART +
      OCEAN_PHOTO +
      h.h3("New houses for sale near you") +
      h.p(`Your house competes with ${h.a("/buyers/new-construction/", "new ones")}. Builders sold new houses in the same 12 months for a middle price close to the resale one. More than 2 miles from the ocean, new houses for sale ask about $${newSq} a square foot, and older ones about $${oldSq}. A buyer at your price may also be touring new houses.`) +
      h.h3("The time of year") +
      h.p(`More houses sell in the warm months. From May to October the county recorded about ${warmX} times as many house resales a month as in January and February. The price moved less: the middle stayed within about ${mBand} percent of ${r1k(HOUSE.median)} in every month. Our ${h.a("/market-reports/", "Myrtle Beach market reports")} track prices, days on market and inventory.`) +
      h.h3("The flood line") +
      h.p(`About ${flPct} percent of the county's resales were inside ${h.a("/buyers/coastal-insurance/", "FEMA's high-risk flood zone")}, most of them condos. Being inside it did not lower the price. In neighborhoods with house sales on both sides of the line, the houses inside it did not sell for less than the others.`) },

    /* Review 3 (owner): what comes off a $350,000 sale, from verified rows only, with one link. No commission figure:
       the commission is set between the seller and the broker. */
    { h2: "How much will I keep when I sell in Myrtle Beach?", toc: "What you keep", id: "what-you-keep", html: () =>
      h.p(`On a ${money(ON)} sale, these come off the price:`) +
      h.ul([
        `<strong>The deed fee, ${deedFee}.</strong> It is a state fee, and the seller pays it.`,
        `<strong>The commission</strong> you agree with your broker.`,
        `<strong>What you still owe on your loan.</strong>`,
        `<strong>Tax on your gain, often none.</strong> If you owned the home and lived in it for 2 of the last 5 years, up to $250,000 of gain can be left out of your income, or $500,000 for a married couple filing jointly who both lived there. It does not apply if you used it on another home in the 2 years before. Bought for $200,000 and sold for ${money(ON)}, your gain is less than $150,000, inside the limit.`,
        `<strong>A hold-back if you live in another state.</strong> The buyer must hold back part of the price at closing for South Carolina income tax, unless the sale is exempt, for example a main home whose gain is inside that limit. With your signed statement of the gain, it is figured on the gain, not the whole price.`,
      ]) +
      h.p(`Our ${h.a("/sell/net-proceeds/", "net proceeds calculator")} works out what you keep at your own price. Thinking of ${h.a("/sell/fsbo/", "selling it yourself")}? We will price your home either way.`) },

    { h2: "Get the number for your home", toc: "Get your number", id: "lead-form", html: () =>
      FORM_CSS +
      h.p(`Send the address and an agent calls you, evenings included. You can ask before you are ready to sell: for insurance, ${h.a("/sell/inherited-house/", "an estate")}, or to decide when to sell. Prefer to talk? Call ${h.a("tel:+18543332135", "854.333.2135")}.`) +
      kit.glance([
        { icon: "calendar", label: "A call", text: "Same day" },
        { icon: "home", label: "Your analysis", text: "Usually a day or two" },
        { icon: "dollar", label: "Cost", text: "Free" },
        { icon: "key", label: "Listing with us", text: "Not required" },
      ]) +
      FORM },
  ],
  faqTitle: "Home value FAQ",
  /* Review 3 (owner): the answers say it differently from the body. */
  faq: [
    { q: "What is my home worth in Myrtle Beach?", a: `Across Horry County, houses and other homes resold for a middle price of about ${r1k(HOUSE.median)} in the latest 12 months of county deeds, and condos for about ${r1k(CONDO.median)}. In the city of Conway the middle house sold for about ${r1k(CONWAY.house.med)}, and inside North Myrtle Beach for about ${r1k(NMB.house.med)}.` },
    { q: "How accurate are online home estimates in Myrtle Beach?", a: `Close on some homes and far off on others. Redfin's figures for Horry County put its middle miss at ${rfMed} percent on homes not for sale, and ${rlMed} percent once a home is listed.` },
    { q: "What is the difference between a CMA and an appraisal?", a: "A CMA, a comparative market analysis, is an agent's pricing of your home from the sales most like it. An appraisal is a licensed appraiser's opinion of value. In South Carolina an agent's valuation must not be called an appraisal." },
    { q: "Why is my county assessed value different from my market value?", a: "The county values every home at once, for tax, so it cannot see what one home has. The taxable value is often lower still: under state law it can rise only so far between sales. A sale resets it." },
    { q: "Are Myrtle Beach home prices dropping?", a: "No. By the Federal Housing Finance Agency's house price index, house prices in Horry County were about flat in the year to mid-2026, after rising about half from mid-2021 to mid-2025." },
    { q: "Does a home valuation cost anything?", a: "No. Our valuation is free, and you do not have to list your home with us." },
  ],
  sources: [
    { name: "Horry County deed index", href: DEEDS },
    { name: "Horry County parcels and flood zones", href: GIS },
    { name: "FHFA house price index", href: FHFA },
    { name: "Redfin Estimate accuracy", href: REDFIN },
    { name: "IRS Topic 701", href: IRS701 },
    { name: "SC Code 12-37", href: T12_37 },
    { name: "SC Code 12-24", href: T12_24 },
    { name: "SC Code 12-8-580", href: T12_8 },
    { name: "SC Code 40-60", href: T40_60 },
  ],
  /* Review 3 (owner): the data notes live here, not in the body. */
  sourcesNote: `Sale prices: resale deeds recorded in the ${PERIOD}, builders left out. "Near" a town means its mailing address, outside its limits. Houses include townhouses and a few condo-hotel units. Test: ${n0(NB.n)} house resales, January to September ${TEST_YEAR}. Not legal or tax advice.`,
  bottomCta: { h2: "Ask what your home is worth.", p: "Send the address. An agent calls you, and listing with us is your choice.", label: LABEL, href: LEAD },
  keywords: "what is my home worth Myrtle Beach, home value Myrtle Beach, Myrtle Beach home values, Horry County median home price, are Myrtle Beach home prices dropping, online home estimate accuracy, Zestimate accuracy Myrtle Beach, CMA vs appraisal, Horry County assessed value vs market value, free home valuation Myrtle Beach",
  about: "Home values and home prices in Myrtle Beach and Horry County, South Carolina",
  afterSources: () => ph.credits(),
});
