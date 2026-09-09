/* /invest/rental-returns/ - what return a Myrtle Beach rental makes, by area.
 *
 * Round 2 (owner, 2026-09-09). What changed and why:
 *  - Vacancy and upkeep allowance is 10 percent of rent, not 25 (his instruction).
 *  - Every return is shown with a manager and without one (his instruction).
 *  - He challenged the price: "a $401,110 typical home I dont think this is the
 *    typical price for an investment property here which may be lowering our Cap
 *    rate." He was right. Zillow's headline value is the middle third of ALL
 *    homes in the ZIP. A rental is usually bought below that. The page now leads
 *    with Zillow's bottom-tier value for the same ZIP (data/zip-bottom-tier.json,
 *    file Zip_zhvi_uc_sfrcondo_tier_0.0_0.33_sm_sa_month.csv, July 2026) and
 *    keeps the middle third beside it. That single fix moves Horry County from
 *    2.3-3.6 percent to 4.2-7.5 percent with a manager, which is why the site's
 *    old "5 to 7 percent cap range" was right and my 2026-09-08 correction of it
 *    was wrong. See HANDOFF 2026-09-09.
 *  - Dealbreakers are his four numbers: 1.25 coverage, 6 percent cap,
 *    3 percent appreciation, 60 percent occupancy. The occupancy line carries his
 *    point that the manager decides it, against AirROI's own listing tiers.
 *  - The map is USGS satellite imagery (public domain, The National Map) with
 *    real ZIP boundaries from Census TIGERweb (public domain), built by
 *    scratchpad/buildmap.py into chapter3realty/invest/grand-strand-areas.jpg
 *    and data/map-shapes.json. Murrells Inlet and Garden City share ZIP 29576,
 *    so they are one area on the map and one row in the rent table; AirROI
 *    measures them as two short-term markets, so the short-term table keeps both.
 *  - "denominator" and the ZIP-sharing aside are gone; "appreciation" is used
 *    throughout instead of "price change".
 *
 * Every number is computed here from research/invest-next/data/*.json so the
 * prose, the tables, the charts, the map and the calculator cannot disagree.
 * No interest rate and no loan payment appears anywhere (non-negotiable 3):
 * coverage is the rent divided by the ratio. Verified in the browser against
 * hand-computed cases by tools/verify-returns-calc.js (PLAYBOOK A29b).
 * Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");
const D = require("../research/invest-next/data/submarkets.json");
const BOTTOM = require("../research/invest-next/data/zip-bottom-tier.json");
const MAP = require("../research/invest-next/data/map-shapes.json");

const TEL = "tel:+18543332135";
const ZILLOW = "https://www.zillow.com/research/data/";
const AIRROI = "https://www.airroi.com/airbnb-data/united-states/south-carolina/myrtle-beach";
const FMR27 = "https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx";
const ARBOR = "https://arbor.com/research/reports/single-family-rental-investment-trends-report-q1-2026/";
const LENDINGONE = "https://lendingone.com/insight/a-guide-to-dscr-loans-for-real-estate-investors/";
const NEWFI = "https://newfi.com/dscr-loan-requirements/";
const FRED = "https://fred.stlouisfed.org/series/SCRVAC";
const ASSESSOR = "https://www.horrycountysc.gov/departments/assessor/";
const GTCALC = "https://gtcountysc.gov/385/Property-Tax-Calculator";

/* ---------------- assumptions, all stated on the page ---------------- */
const VAC = 0.10;          // vacancy and upkeep, share of rent (owner, 2026-09-09)
const MGMT = 0.10;         // management, share of rent, when a manager runs it
const INS = 3050;          // landlord insurance, midpoint of the site's $1,700-$4,400
const STR_LO = 0.45, STR_HI = 0.65;   // short-term expense share, low and high

/* ---------------- data ---------------- */
const M = D.meta.metro_zhvi.find(x => x.label === "Myrtle Beach, SC");
const ann = (now, then, yrs) => (Math.pow(now / then, 1 / yrs) - 1) * 100;
const metro = {
  now: M.latest, y1: (M.latest / M.v12 - 1) * 100, y3: (M.latest / M.v36 - 1) * 100,
  a3: ann(M.latest, M.v36, 3), a5: ann(M.latest, M.v60, 5), a10: ann(M.latest, M.v120, 10),
};

/* One row per ZIP. Murrells Inlet and Garden City share 29576 and become one area. */
const MERGED = { "murrells-inlet": "Murrells Inlet and Garden City" };
const SKIP = new Set(["garden-city"]);
const src = D.submarkets.filter(s => !SKIP.has(s.slug));

const areas = src.map(s => {
  const rent = s.ltr_rent_fmr_3br_fy2027;
  const mills = s.property_tax_mills_6pct, fees = s.property_tax_extra_fees || 0;
  const low = BOTTOM[s.zip] ? BOTTOM[s.zip].bottom : null;
  const gross = rent * 12;
  const at = (price, mgmt) => {
    const tax = price * 0.06 * mills / 1000 + fees;
    const noi = gross - gross * VAC - gross * mgmt - tax - INS;
    return { price, tax, noi, cap: noi / price * 100 };
  };
  /* Short-term: this ZIP's AirROI revenue. 29576 is two AirROI markets, so the
     ZIP figure is their average and the page says so. The revenue is the average
     of every active listing, and those are mostly beach properties rather than
     the cheapest third of houses, so short-term returns divide by the typical
     home value. Pairing beach revenue with the cheapest houses would overstate
     it. The page says this in the section. */
  const twin = s.slug === "murrells-inlet" ? D.submarkets.find(x => x.slug === "garden-city") : null;
  const rev = twin ? (s.str_avg_annual_revenue_airroi + twin.str_avg_annual_revenue_airroi) / 2 : s.str_avg_annual_revenue_airroi;
  const occ = twin ? (s.str_annual_occupancy_airroi_pct + twin.str_annual_occupancy_airroi_pct) / 2 : s.str_annual_occupancy_airroi_pct;
  const strAt = (price, share) => rev ? rev * (1 - share) / price * 100 : null;
  return {
    id: s.slug, name: MERGED[s.slug] || s.name, zip: s.zip, rent, mills, fees,
    low, mid: s.zhvi,
    lowMgr: low ? at(low, MGMT) : null, lowSelf: low ? at(low, 0) : null,
    midMgr: at(s.zhvi, MGMT), midSelf: at(s.zhvi, 0),
    a5: ann(s.zhvi, s.zhvi_5y, 5), a10: ann(s.zhvi, s.zhvi_10y, 10),
    y3: (s.zhvi / s.zhvi_3y - 1) * 100,
    rev, occ,
    strHi: rev ? strAt(s.zhvi, STR_LO) : null,
    strLo: rev ? strAt(s.zhvi, STR_HI) : null,
  };
});
const by = (id) => areas.find(a => a.id === id);
const mb = by("myrtle-beach"), pi = by("pawleys-island"), lr = by("little-river"),
      sb = by("surfside-beach"), mgc = by("murrells-inlet"), cw = by("conway"),
      cf = by("carolina-forest"), nmb = by("north-myrtle-beach");

/* Short-term markets are AirROI's, not ZIPs: Garden City and Murrells Inlet are
   measured separately, and there is no Carolina Forest market. */
const strMarkets = D.submarkets.filter(s => s.str_avg_annual_revenue_airroi).map(s => {
  const rev = s.str_avg_annual_revenue_airroi;
  return { name: s.name, listings: s.str_active_listings, occ: s.str_annual_occupancy_airroi_pct,
    rev, yoy: s.str_revenue_yoy_pct, price: s.zhvi,
    capHi: rev * (1 - STR_LO) / s.zhvi * 100,
    capLo: rev * (1 - STR_HI) / s.zhvi * 100 };
}).sort((a, b) => b.capHi - a.capHi);

const fmt$ = (n) => "$" + Math.round(n).toLocaleString("en-US");
const p1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
const sp = (n) => (n >= 0 ? "+" : "−") + p1(Math.abs(n));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const horry = areas.filter(a => a.id !== "pawleys-island");
const rng = (arr, f) => { const v = arr.map(f).filter(x => x !== null); return [Math.min(...v), Math.max(...v)]; };
const [lowMgrLo, lowMgrHi] = rng(horry, a => a.lowMgr && a.lowMgr.cap);
const [lowSelfLo, lowSelfHi] = rng(horry, a => a.lowSelf && a.lowSelf.cap);
const [midMgrLo, midMgrHi] = rng(horry, a => a.midMgr.cap);
const [strCapLo, strCapHi] = [Math.min(...strMarkets.map(m => m.capLo)), Math.max(...strMarkets.map(m => m.capHi))];
const [occLo, occHi] = rng(strMarkets, m => m.occ);
const sortBy = (arr, f, desc = true) => arr.slice().sort((a, b) => desc ? f(b) - f(a) : f(a) - f(b));
const capsAt6 = areas.filter(a => a.lowMgr && a.lowMgr.cap >= 6).map(a => a.name);

/* ---------------- palette and chart helpers ---------------- */
const NAVY = "#1c2028", MUTED = "rgba(28,32,40,.72)", BRASS = "#c4783a", BRASS_LT = "#e3bf8f",
      TEAL = "#2f6f7e", TEAL_LT = "#9dc3cc", RED = "#a8412f", GRID = "rgba(28,32,40,.13)";
const SVGSTYLE = 'style="display:block;width:100%;height:auto;font-family:var(--sans)"';

/* Paired bars: one row per area, a bar for "with a manager" and one for "without". */
function pairChart(rows, opt) {
  const W = 760, L = 208, R = 74, BW = W - L - R, rowH = 46, H = rows.length * rowH + 62;
  const max = opt.max, x = (v) => Math.max(2, Math.round(BW * v / max));
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.aria)}" ${SVGSTYLE}>`;
  for (let g = 0; g <= max; g += opt.step) {
    const gx = L + Math.round(BW * g / max);
    s += `<line x1="${gx}" y1="18" x2="${gx}" y2="${rows.length * rowH + 20}" stroke="${GRID}"/>`;
    s += `<text x="${gx}" y="${rows.length * rowH + 36}" font-size="12" text-anchor="middle" fill="${MUTED}">${g}%</text>`;
  }
  rows.forEach((r, i) => {
    const y = i * rowH + 22;
    s += `<text x="${L - 10}" y="${y + 14}" font-size="12.5" text-anchor="end" fill="${NAVY}">${esc(r.name)}</text>`;
    s += `<text x="${L - 10}" y="${y + 30}" font-size="11" text-anchor="end" fill="${MUTED}">${esc(r.note)}</text>`;
    [[r.a, opt.aColor, 0], [r.b, opt.bColor, 15]].forEach(([v, col, dy]) => {
      const w = x(v);
      s += `<rect x="${L}" y="${y + dy}" width="${w}" height="13" fill="${col}" rx="2"><title>${esc(r.name)}: ${p1(v)} percent</title></rect>`;
      s += `<text x="${L + w + 6}" y="${y + dy + 11}" font-size="12" fill="${NAVY}">${p1(v)}%</text>`;
    });
  });
  if (opt.mark) {
    const mx = L + Math.round(BW * opt.mark / max);
    s += `<line x1="${mx}" y1="18" x2="${mx}" y2="${rows.length * rowH + 4}" stroke="${NAVY}" stroke-width="2" stroke-dasharray="5 4"/>`;
    s += `<text x="${mx}" y="12" font-size="12.5" font-weight="600" text-anchor="middle" fill="${NAVY}">${esc(opt.markLabel)}</text>`;
  }
  const by0 = rows.length * rowH + 48;
  s += `<rect x="${L}" y="${by0}" width="12" height="12" fill="${opt.aColor}" rx="2"/><text x="${L + 18}" y="${by0 + 10}" font-size="12.5" fill="${NAVY}">${esc(opt.aLabel)}</text>`;
  s += `<rect x="${L + 250}" y="${by0}" width="12" height="12" fill="${opt.bColor}" rx="2"/><text x="${L + 268}" y="${by0 + 10}" font-size="12.5" fill="${NAVY}">${esc(opt.bLabel)}</text>`;
  return s + "</svg>";
}

const CHART_LTR = pairChart(
  sortBy(areas.filter(a => a.lowMgr), a => a.lowMgr.cap).map(a => ({
    name: a.name, note: `${fmt$(a.low)} house, ${fmt$(a.rent)} rent`,
    a: a.lowMgr.cap, b: a.lowSelf.cap })),
  { max: 10, step: 2, mark: 6, markLabel: "6% target", aColor: BRASS, bColor: BRASS_LT,
    aLabel: "With a property manager", bLabel: "Without one",
    aria: "Yearly return on a long-term rental by area, with and without a property manager" });

const CHART_STR = pairChart(
  strMarkets.map(m => ({
    name: m.name, note: `${fmt$(m.rev)} a year, ${Math.round(m.occ)}% of nights`,
    a: m.capLo, b: m.capHi })),
  { max: 10, step: 2, mark: 6, markLabel: "6% target", aColor: TEAL, bColor: TEAL_LT,
    aLabel: "After 65% expenses", bLabel: "After 45% expenses",
    aria: "Yearly return on a short-term rental by area, at high and low expense assumptions" });

/* The two parts of the return, stacked, over three windows. Large by request. */
function appreciationChart() {
  const W = 760, H = 300, L = 92, R = 150, T = 16, BW = W - L - R;
  const wins = [
    { label: "3 years", app: metro.a3 }, { label: "5 years", app: metro.a5 }, { label: "10 years", app: metro.a10 },
  ];
  const rent = mb.lowMgr.cap;
  const max = 14, rowH = 76;
  const x = (v) => L + BW * v / max;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rent and appreciation added together, over three, five and ten years" ${SVGSTYLE}>`;
  for (let g = 0; g <= max; g += 2) {
    s += `<line x1="${x(g)}" y1="${T - 6}" x2="${x(g)}" y2="${T + wins.length * rowH - 12}" stroke="${GRID}"/>`;
    s += `<text x="${x(g)}" y="${T + wins.length * rowH + 6}" font-size="12.5" text-anchor="middle" fill="${MUTED}">${g}%</text>`;
  }
  wins.forEach((w, i) => {
    const y = T + i * rowH;
    s += `<text x="${L - 12}" y="${y + 26}" font-size="14" font-weight="600" text-anchor="end" fill="${NAVY}">${w.label}</text>`;
    const rw = x(rent) - L;
    s += `<rect x="${L}" y="${y + 6}" width="${rw}" height="30" fill="${BRASS}" rx="3"><title>Rent after costs: ${p1(rent)} percent</title></rect>`;
    if (rw > 74) s += `<text x="${L + 10}" y="${y + 26}" font-size="13" font-weight="600" fill="#fff">${p1(rent)}%</text>`;
    if (w.app >= 0) {
      const aw = x(rent + w.app) - x(rent);
      s += `<rect x="${x(rent)}" y="${y + 6}" width="${Math.max(2, aw)}" height="30" fill="${TEAL}" rx="3"><title>Appreciation: ${sp(w.app)} percent a year</title></rect>`;
      if (aw > 74) s += `<text x="${x(rent) + 10}" y="${y + 26}" font-size="13" font-weight="600" fill="#fff">${sp(w.app)}%</text>`;
      s += `<text x="${x(rent + w.app) + 10}" y="${y + 26}" font-size="14" font-weight="600" fill="${NAVY}">${sp(rent + w.app)}% a year</text>`;
    } else {
      const aw = x(rent) - x(rent + w.app);
      s += `<rect x="${x(rent + w.app)}" y="${y + 6}" width="${Math.max(2, aw)}" height="30" fill="${RED}" rx="3"><title>Appreciation: ${sp(w.app)} percent a year</title></rect>`;
      s += `<text x="${x(rent) + 10}" y="${y + 26}" font-size="14" font-weight="600" fill="${NAVY}">${sp(rent + w.app)}% a year, after ${sp(w.app)}% appreciation</text>`;
    }
  });
  const by0 = T + wins.length * rowH + 26;
  s += `<rect x="${L}" y="${by0}" width="13" height="13" fill="${BRASS}" rx="2"/><text x="${L + 19}" y="${by0 + 11}" font-size="13" fill="${NAVY}">Rent left after costs, with a manager</text>`;
  s += `<rect x="${L + 300}" y="${by0}" width="13" height="13" fill="${TEAL}" rx="2"/><text x="${L + 319}" y="${by0 + 11}" font-size="13" fill="${NAVY}">Appreciation a year</text>`;
  return s + "</svg>";
}
const CHART_APP = appreciationChart();

/* ---------------- the satellite map ---------------- */
const mapAreas = areas.map(a => ({
  id: a.id, zip: a.zip, n: a.name,
  poly: MAP.zips[a.zip],
  ltr: a.lowMgr ? +p1(a.lowMgr.cap) : null,
  ltrSelf: a.lowSelf ? +p1(a.lowSelf.cap) : null,
  str: a.strHi ? +p1(a.strHi) : null, strLo: a.strLo ? +p1(a.strLo) : null,
  price: a.low, mid: a.mid, rent: a.rent, occ: a.occ ? Math.round(a.occ) : null,
  app: +p1(a.a5),
  twin: a.id === "murrells-inlet",
}));
const LABEL = {
  "conway": [452, 322], "little-river": [1152, 250], "north-myrtle-beach": [1128, 424],
  "carolina-forest": [604, 560], "myrtle-beach": [706, 700], "surfside-beach": [524, 898],
  "murrells-inlet": [330, 1064], "pawleys-island": [152, 1258],
};
const MAPBLOCK = `
<style>
#rrmapwrap{position:relative;max-width:760px;margin:1.1rem 0 .5rem}
#rrmapwrap .rrshell{position:relative;border:1px solid var(--rule);border-radius:10px;overflow:hidden;background:#173342}
#rrmapwrap img{display:block;width:100%;height:auto}
#rrmapsvg{position:absolute;inset:0;width:100%;height:100%}
#rrmapsvg .rg{cursor:pointer}
#rrmapsvg .rg path{transition:fill-opacity .15s,stroke-width .15s}
#rrmapsvg .rg:hover path,#rrmapsvg .rg:focus path,#rrmapsvg .rg.on path{fill-opacity:.86;stroke-width:5}
#rrmapsvg .rg:focus{outline:none}
#rrmapsvg .lbl{font-family:var(--sans);font-size:25px;font-weight:600;fill:#f4efe8;pointer-events:none;paint-order:stroke;stroke:rgba(12,18,24,.92);stroke-width:6px;stroke-linejoin:round}
#rrmapsvg .val{font-family:var(--sans);font-size:27px;font-weight:700;fill:#ffdcb8;pointer-events:none;paint-order:stroke;stroke:rgba(12,18,24,.92);stroke-width:6px;stroke-linejoin:round}
#rrtip{position:absolute;pointer-events:none;background:#12181f;color:#f4efe8;font-size:.82rem;line-height:1.5;padding:.6rem .75rem;border-radius:7px;max-width:250px;display:none;z-index:3;box-shadow:0 6px 20px rgba(0,0,0,.4)}
#rrtip b{display:block;color:#fff;margin-bottom:.2rem}
#rrtip i{color:#ffca92;font-style:normal;font-weight:600}
#rrtog{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 .7rem}
#rrtog button{font-family:var(--sans);font-size:.73rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding:.5rem .8rem;border:1.5px solid rgba(28,32,40,.25);background:transparent;color:rgba(28,32,40,.78);cursor:pointer;border-radius:5px}
#rrtog button[aria-pressed="true"]{background:var(--navy);color:var(--ivory);border-color:var(--navy)}
#rrtog button:focus-visible{outline:2px solid var(--brass);outline-offset:2px}
#rrleg{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;font-size:.74rem;color:var(--muted);margin-top:.5rem}
#rrleg i{display:inline-block;width:15px;height:15px;border-radius:3px}
</style>
<div id="rrtog" role="group" aria-label="What the map color shows"></div>
<div id="rrmapwrap">
  <div class="rrshell">
    <img src="/invest/grand-strand-areas.jpg" width="${MAP.width}" height="${MAP.height}" loading="lazy" decoding="async" alt="Satellite view of the Grand Strand from Little River south to Pawleys Island, with the eight areas outlined.">
    <svg id="rrmapsvg" viewBox="0 0 ${MAP.width} ${MAP.height}" role="img" aria-label="Eight Grand Strand areas with their rental returns"></svg>
  </div>
  <div id="rrtip" role="status" aria-live="polite"></div>
</div>
<div id="rrleg"></div>
<p style="font-size:.73rem;color:var(--muted);line-height:1.6;margin:.4rem 0 0">Imagery: U.S. Geological Survey, The National Map. Boundaries: U.S. Census Bureau ZIP code tabulation areas. Both public domain. Prices and rents: Zillow and HUD, July 2026. Short-term figures: AirROI, August 2025 to July 2026.</p>
<script>
(function(){
var A=${JSON.stringify(mapAreas)}, LB=${JSON.stringify(LABEL)};
var METRICS=[
 {k:"ltr",label:"Long-term return",fmt:function(v){return v.toFixed(1)+"%"}},
 {k:"str",label:"Short-term return",fmt:function(v){return v.toFixed(1)+"%"}},
 {k:"price",label:"Price of a rental",fmt:function(v){return "$"+Math.round(v/1000)+"k"}},
 {k:"app",label:"Appreciation, 5 years",fmt:function(v){return (v>=0?"+":"")+v.toFixed(1)+"%"}}
];
var RAMP=["#f6e7d2","#eac89a","#dfa864","#cf8339","#a95f20"], NONE="#8d9298";
var cur="ltr", svg=document.getElementById("rrmapsvg"), tog=document.getElementById("rrtog"),
    leg=document.getElementById("rrleg"), tip=document.getElementById("rrtip"), wrap=document.getElementById("rrmapwrap");
function money(v){return "$"+Math.round(v).toLocaleString("en-US")}
var parts="";
A.forEach(function(a){
  var d="M"+a.poly.map(function(p){return p[0]+" "+p[1]}).join(" L")+" Z";
  parts+='<g class="rg" tabindex="0" role="button" data-id="'+a.id+'" aria-label="'+a.n+'">'+
    '<path d="'+d+'" fill="#cf8339" fill-opacity="0.66" stroke="#f4efe8" stroke-width="3" stroke-linejoin="round"></path></g>';
});
A.forEach(function(a){var p=LB[a.id]||a.poly[0];
  parts+='<text class="lbl" x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle">'+a.n+'</text>'+
         '<text class="val" x="'+p[0]+'" y="'+(p[1]+30)+'" text-anchor="middle" data-val="'+a.id+'"></text>';});
svg.innerHTML=parts;
function ramp(k){var v=A.map(function(a){return a[k]}).filter(function(x){return x!==null});
  var lo=Math.min.apply(null,v),hi=Math.max.apply(null,v);
  return function(x){if(x===null)return NONE;var t=hi===lo?0.5:(x-lo)/(hi-lo);return RAMP[Math.min(4,Math.floor(t*4.999))]}}
function paint(){var f=ramp(cur), m=METRICS.filter(function(x){return x.k===cur})[0];
  A.forEach(function(a){
    svg.querySelector('[data-id="'+a.id+'"] path').setAttribute("fill",f(a[cur]));
    svg.querySelector('[data-val="'+a.id+'"]').textContent = a[cur]===null ? "not measured" : m.fmt(a[cur]);
  });
  var v=A.map(function(a){return a[cur]}).filter(function(x){return x!==null});
  leg.innerHTML='<span>'+m.label+', low to high:</span>'+RAMP.map(function(c){return '<i style="background:'+c+'"></i>'}).join("")+
    '<span>'+m.fmt(Math.min.apply(null,v))+' to '+m.fmt(Math.max.apply(null,v))+'</span>'+
    (v.length<A.length?'<i style="background:'+NONE+'"></i><span>not measured</span>':'');
  tog.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.k===cur?"true":"false")});}
METRICS.forEach(function(m){var b=document.createElement("button");b.type="button";b.textContent=m.label;b.dataset.k=m.k;
  b.addEventListener("click",function(){cur=m.k;paint()});tog.appendChild(b)});
function lines(a){
  var L=["A rental here costs about "+money(a.price)+", against "+money(a.mid)+" for every home in the area.",
         "Rent "+money(a.rent)+" a month.",
         "Long-term return <i>"+a.ltr.toFixed(1)+"%</i> with a manager, <i>"+a.ltrSelf.toFixed(1)+"%</i> without."];
  if(a.str===null) L.push("Short-term rentals are not measured here.");
  else L.push("Short-term return <i>"+a.strLo.toFixed(1)+"% to "+a.str.toFixed(1)+"%</i>, "+a.occ+"% of nights booked"+(a.twin?", averaging the two markets.":"."));
  L.push("Appreciation "+(a.app>=0?"+":"")+a.app.toFixed(1)+"% a year over five years.");
  return L;}
function show(a,x,y){tip.innerHTML="<b>"+a.n+"</b>"+lines(a).join("<br>");tip.style.display="block";
  var W=wrap.clientWidth,tw=tip.offsetWidth,th=tip.offsetHeight;
  tip.style.left=Math.max(0,Math.min(W-tw,x-tw/2))+"px";
  tip.style.top=(y-th-14<0?y+18:y-th-14)+"px";}
function hide(g){if(!g||!g.classList.contains("on"))tip.style.display="none";}
svg.querySelectorAll(".rg").forEach(function(g){
  var a=A.filter(function(x){return x.id===g.dataset.id})[0];
  g.addEventListener("mousemove",function(e){var b=wrap.getBoundingClientRect();show(a,e.clientX-b.left,e.clientY-b.top)});
  g.addEventListener("mouseleave",function(){hide(g)});
  g.addEventListener("focus",function(){var b=g.getBoundingClientRect(),m=wrap.getBoundingClientRect();show(a,b.left-m.left+b.width/2,b.top-m.top+b.height/2)});
  g.addEventListener("blur",function(){hide(g)});
  g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();g.dispatchEvent(new MouseEvent("click",{bubbles:true}));}});
  g.addEventListener("click",function(){
    svg.querySelectorAll(".rg.on").forEach(function(x){if(x!==g)x.classList.remove("on")});
    g.classList.toggle("on");
    if(g.classList.contains("on")){var b=g.getBoundingClientRect(),m=wrap.getBoundingClientRect();show(a,b.left-m.left+b.width/2,b.top-m.top+b.height/2);}
    else tip.style.display="none";});
});
window.addEventListener("resize",function(){tip.style.display="none";svg.querySelectorAll(".rg.on").forEach(function(x){x.classList.remove("on")})});
paint();
})();
</script>`;

/* ---------------- the calculator ---------------- */
const TOOL = `
<style>
#rrtool{border:1px solid var(--rule);border-radius:12px;overflow:hidden;margin:1.2rem 0 1.3rem;max-width:760px;background:var(--ivory)}
#rrtool .rrhead{background:var(--navy);color:var(--ivory);padding:.85rem 1.15rem;display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem 1rem}
#rrtool .rrhead p{margin:0;font-family:var(--serif);font-size:1.12rem;color:var(--ivory)}
#rrtool .rrhead span{font-size:.76rem;color:rgba(244,239,232,.68)}
#rrtool .rrbody{display:grid;grid-template-columns:minmax(220px,1fr) minmax(230px,1.05fr);gap:0}
#rrtool .rrin{padding:1.1rem 1.15rem;border-right:1px solid var(--rule)}
#rrtool .rrout{padding:1.1rem 1.15rem;background:var(--ivory-2)}
@media (max-width:640px){#rrtool .rrbody{grid-template-columns:1fr}#rrtool .rrin{border-right:0;border-bottom:1px solid var(--rule)}}
#rrtool label{display:block;font-size:.75rem;font-weight:600;color:var(--muted);letter-spacing:.02em;margin-bottom:.85rem}
#rrtool input,#rrtool select{width:100%;margin-top:.28rem;background:#fff;border:1px solid rgba(28,32,40,.26);border-radius:7px;color:var(--navy);font-family:var(--sans);font-size:.97rem;padding:.5rem .6rem;box-sizing:border-box}
#rrtool input:focus,#rrtool select:focus{outline:2px solid var(--brass);outline-offset:1px;border-color:var(--brass)}
#rrtool .rrpair{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
#rrtool .rrbig{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-bottom:.9rem}
#rrtool .rrcard{background:#fff;border:1px solid var(--rule);border-radius:9px;padding:.7rem .8rem}
#rrtool .rrcard .k{font-size:.66rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600}
#rrtool .rrcard .v{font-family:var(--serif);font-size:1.68rem;color:var(--navy);line-height:1.15;margin-top:.15rem;font-variant-numeric:tabular-nums}
#rrtool .rrcard .s{font-size:.74rem;color:var(--muted);margin-top:.1rem}
#rrtool .rrline{display:flex;justify-content:space-between;gap:1rem;font-size:.83rem;padding:.32rem 0;border-bottom:1px solid var(--rule)}
#rrtool .rrline:last-of-type{border-bottom:0}
#rrtool .rrline span:first-child{color:var(--muted)}
#rrtool .rrline span:last-child{color:var(--navy);font-weight:600;font-variant-numeric:tabular-nums}
#rrtool .rrverdict{margin:.9rem 0 0;padding:.65rem .8rem;border-radius:8px;font-size:.87rem;line-height:1.5;font-weight:600}
#rrtool .rrverdict.pass{background:rgba(47,111,126,.13);color:#22525d;border-left:3px solid #2f6f7e}
#rrtool .rrverdict.warn{background:rgba(196,120,58,.14);color:#8a4f22;border-left:3px solid var(--brass)}
#rrtool .rrverdict.stop{background:rgba(168,65,47,.13);color:#8c3626;border-left:3px solid #a8412f}
#rrtool .rrfoot{padding:.75rem 1.15rem;border-top:1px solid var(--rule);font-size:.78rem;color:var(--muted);line-height:1.6}
</style>
<div id="rrtool">
  <div class="rrhead"><p>What one house returns</p><span>All-cash, before any loan</span></div>
  <div class="rrbody">
    <div class="rrin">
      <label>Area, which decides the tax rate
        <select id="rrArea" onchange="c3Ret()">${areas.map(a => `<option value="${a.id}" data-mills="${a.mills}" data-fees="${a.fees}"${a.id === "myrtle-beach" ? " selected" : ""}>${esc(a.name)}</option>`).join("")}</select></label>
      <div class="rrpair">
        <label>Price<input id="rrPrice" type="number" min="0" step="1000" value="160000" oninput="c3Ret()"></label>
        <label>Rent a month<input id="rrRent" type="number" min="0" step="25" value="1823" oninput="c3Ret()"></label>
      </div>
      <div class="rrpair">
        <label>Insurance a year<input id="rrIns" type="number" min="0" step="50" value="3050" oninput="c3Ret()"></label>
        <label>Dues a month<input id="rrHoa" type="number" min="0" step="10" value="0" oninput="c3Ret()"></label>
      </div>
      <label>Empty months and repairs
        <select id="rrAllow" onchange="c3Ret()"><option value="10" selected>10 percent of rent</option><option value="15">15 percent of rent</option><option value="25">25 percent of rent</option></select></label>
    </div>
    <div class="rrout">
      <div class="rrbig">
        <div class="rrcard"><div class="k">With a manager</div><div class="v" id="rrCapM">0.0%</div><div class="s" id="rrNoiM">$0 a year</div></div>
        <div class="rrcard"><div class="k">Without one</div><div class="v" id="rrCapS">0.0%</div><div class="s" id="rrNoiS">$0 a year</div></div>
      </div>
      <div class="rrline"><span>Rent a year</span><span id="rrGross">$0</span></div>
      <div class="rrline"><span>Empty months and repairs</span><span id="rrVac">$0</span></div>
      <div class="rrline"><span>Management, 10 percent</span><span id="rrMgmt">$0</span></div>
      <div class="rrline"><span>Property tax at 6 percent</span><span id="rrTax">$0</span></div>
      <div class="rrline"><span>Insurance and dues</span><span id="rrOther">$0</span></div>
      <div class="rrline"><span>Rent divided by 1.25</span><span id="rrC125">$0</span></div>
      <p class="rrverdict" id="rrVerdict"></p>
    </div>
  </div>
  <div class="rrfoot">The tax uses the 6 percent rental ratio and this area's 2025 rate. Enter the insurance quote for the house when you have it. For a full report on one address, with the loan, the cash flow and nearby permits, use <a href="/invest/long-term-rental/" style="color:var(--navy);text-decoration:underline">the rental analyzer</a>.</div>
</div>
<script>
  var RR_TAX=${JSON.stringify(Object.fromEntries(areas.map(a => [a.id, [a.mills, a.fees]])))};
  function rr$(i){return document.getElementById(i)}
  function rrFmt(n){return (n<0?"\\u2212$":"$")+Math.round(Math.abs(n)).toLocaleString("en-US")}
  function c3Ret(){
    var mf=RR_TAX[rr$("rrArea").value]||[0,0];
    var price=Math.max(0,+rr$("rrPrice").value||0), rent=Math.max(0,+rr$("rrRent").value||0);
    var ins=Math.max(0,+rr$("rrIns").value||0), hoa=Math.max(0,+rr$("rrHoa").value||0);
    var al=+rr$("rrAllow").value/100;
    var gross=rent*12, vac=gross*al, mgmt=gross*0.10, tax=price*0.06*mf[0]/1000+mf[1], other=ins+hoa*12;
    var noiS=gross-vac-tax-other, noiM=noiS-mgmt;
    var capS=price>0?noiS/price*100:0, capM=price>0?noiM/price*100:0;
    rr$("rrCapM").textContent=(capM<0?"\\u2212":"")+Math.abs(capM).toFixed(1)+"%";
    rr$("rrCapS").textContent=(capS<0?"\\u2212":"")+Math.abs(capS).toFixed(1)+"%";
    rr$("rrNoiM").textContent=rrFmt(noiM)+" a year";
    rr$("rrNoiS").textContent=rrFmt(noiS)+" a year";
    rr$("rrGross").textContent=rrFmt(gross);
    rr$("rrVac").textContent="\\u2212"+rrFmt(vac);
    rr$("rrMgmt").textContent="\\u2212"+rrFmt(mgmt);
    rr$("rrTax").textContent="\\u2212"+rrFmt(tax);
    rr$("rrOther").textContent="\\u2212"+rrFmt(other);
    rr$("rrC125").textContent=rrFmt(rent/1.25);
    var v=rr$("rrVerdict"), t, cls;
    if(price<=0||rent<=0){t="Enter a price and a rent.";cls="warn";}
    else if(noiM<=0){t="Dealbreaker. The rent does not cover the cost of owning it, before any loan.";cls="stop";}
    else if(capM>=6){t="Passes. Above the 6 percent target with a manager running it.";cls="pass";}
    else if(capS>=6){t="Passes only if you manage it yourself. With a manager it is below the 6 percent target.";cls="warn";}
    else {t="Below the 6 percent target either way. The return would depend on appreciation.";cls="warn";}
    v.textContent=t; v.className="rrverdict "+cls;
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",c3Ret); else c3Ret();
</script>`;

/* ---------------- the numbers panel ---------------- */
const TILE = (big, label, note) => `<div style="background:#fff;border:1px solid var(--rule);border-radius:10px;padding:1rem 1.05rem"><div style="font-family:var(--serif);font-size:1.85rem;color:var(--navy);line-height:1.1;font-variant-numeric:tabular-nums">${big}</div><div style="font-size:.68rem;letter-spacing:.09em;text-transform:uppercase;color:var(--brass);font-weight:600;margin:.4rem 0 .3rem">${label}</div><div style="font-size:.83rem;color:var(--muted);line-height:1.55">${note}</div></div>`;
const PANEL = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(210px,100%),1fr));gap:.85rem;margin:1.1rem 0 1.3rem;max-width:760px">
${TILE(`${p1(lowMgrLo)}–${p1(lowMgrHi)}%`, "Long-term, with a manager", "Rent left after costs, on a rental bought in the cheaper third of Horry County")}
${TILE(`${p1(lowSelfLo)}–${p1(lowSelfHi)}%`, "Long-term, self-managed", "The same houses with no management fee")}
${TILE(`${p1(strCapLo)}–${p1(strCapHi)}%`, "Short-term", "The average listing's revenue after 45 to 65 percent expenses")}
${TILE(`${sp(metro.a5)}%`, "Appreciation a year", `Over five years. ${sp(metro.a10)} percent a year over ten, ${sp(metro.a3)} over three`)}
</div>`;

/* ---------------- tables ---------------- */
const T_TERMS = h.table(["Number", "What it means", "Here"], [
  ["Cap rate", "The rent left after the cost of owning the house, divided by the price. No loan in it.", `${p1(lowMgrLo)} to ${p1(lowMgrHi)} percent with a manager`],
  ["Appreciation", "How much the value of the house rises each year.", `${sp(metro.a5)} percent a year over five years`],
  ["Coverage ratio", "The rent divided by the monthly cost of the loan, taxes, insurance and dues.", "Our target is 1.25"],
  ["Occupancy", "The share of nights a short-term rental is booked.", `${Math.round(occLo)} to ${Math.round(occHi)} percent across the year`],
]);

const T_PRICE = h.table(["Area", "A rental costs about", "Every home in the area", "Return on the rental", "Return on the typical home"],
  sortBy(areas.filter(a => a.low), a => a.lowMgr.cap).map(a => [
    a.name, fmt$(a.low), fmt$(a.mid), `<strong>${p1(a.lowMgr.cap)}%</strong>`, `${p1(a.midMgr.cap)}%`]));

const T_LTR = h.table(["Area", "Price", "Rent a month", "With a manager", "Without one"],
  sortBy(areas.filter(a => a.low), a => a.lowMgr.cap).map(a => [
    a.name, fmt$(a.low), fmt$(a.rent), `<strong>${p1(a.lowMgr.cap)}%</strong>`, `${p1(a.lowSelf.cap)}%`]));

const T_EX = h.table(["Line", "A year"], [
  [`Rent, 12 months at ${fmt$(mb.rent)}`, fmt$(mb.rent * 12)],
  ["Empty months and repairs, 10 percent", "−" + fmt$(mb.rent * 12 * VAC)],
  ["Management, 10 percent", "−" + fmt$(mb.rent * 12 * MGMT)],
  [`Property tax at 6 percent, ${mb.mills} mills`, "−" + fmt$(mb.lowMgr.tax)],
  ["Landlord insurance", "−" + fmt$(INS)],
  ["<strong>Rent left</strong>", "<strong>" + fmt$(mb.lowMgr.noi) + "</strong>"],
  [`<strong>Divided by the ${fmt$(mb.low)} price</strong>`, `<strong>${p1(mb.lowMgr.cap)} percent</strong>`],
]);

const T_STR = h.table(["Market", "Listings", "Nights booked", "Revenue a listing", "Typical home", "After 65% costs", "After 45% costs"],
  strMarkets.map(m => [m.name, m.listings.toLocaleString("en-US"), Math.round(m.occ) + "%", fmt$(m.rev) + " a year",
    fmt$(m.price), p1(m.capLo) + "%", `<strong>${p1(m.capHi)}%</strong>`]));

const best = (label, list, note) => [label, list, note];
const T_BEST = h.table(["If you want", "Look at", "Why"], [
  best("The highest rent return", sortBy(areas.filter(a => a.low), a => a.lowMgr.cap).slice(0, 2).map(a => a.name).join(", "), "The rent is the same across Horry County. These have the cheapest houses."),
  best("The highest short-term return", strMarkets.slice(0, 2).map(m => m.name).join(", "), "The most booking revenue for the price of a house there."),
  best("The most nights booked", sortBy(strMarkets, m => m.occ).slice(0, 2).map(m => `${m.name} (${Math.round(m.occ)}%)`).join(", "), "Steadier bookings across the shoulder months."),
  best("The strongest appreciation", sortBy(areas, a => a.a5).slice(0, 2).map(a => `${a.name} (${sp(a.a5)}%)`).join(", "), "Five-year rate. Ten-year order differs."),
  best("The lowest price to start", sortBy(areas.filter(a => a.low), a => a.low, false).slice(0, 2).map(a => `${a.name} (${fmt$(a.low)})`).join(", "), "Less cash in, and the rent barely changes."),
  best("A tenant all year, not a guest", `${cf.name}, ${cw.name}`, "Year-round households and workers, away from the nightly-rental rules."),
]);

const T_STOP = h.table(["The number", "Our line", "What the market does"], [
  ["Coverage ratio", "<strong>Below 1.25, walk</strong>", `Divide the rent by 1.25. At ${fmt$(mb.rent)} of rent that is ${fmt$(mb.rent / 1.25)} a month for the loan, taxes, insurance and dues together.`],
  ["Cap rate", "<strong>Below 6 percent, walk</strong>", `With a manager, ${capsAt6.length} of the ${areas.filter(a => a.low).length} areas clear it: ${capsAt6.join(", ")}.`],
  ["Appreciation", "<strong>Below 3 percent a year, walk</strong>", `The metro ran ${sp(metro.a5)} percent a year over five years and ${sp(metro.a10)} over ten. It ran ${sp(metro.a3)} over the last three.`],
  ["Occupancy", "<strong>Below 60 percent a year, walk</strong>", "The middle listing books 25 to 36 percent of nights. The top tenth books 67 to 76 percent. That gap is the manager."],
]);

module.exports = {
  url: "/invest/rental-returns/",
  title: "What Return Should a Myrtle Beach Rental Make? | Chapter3",
  description: "What a Myrtle Beach rental returns: cap rates by area with and without a property manager, short-term returns, appreciation, four dealbreakers and a calculator.",
  ogTitle: "What return should a Myrtle Beach rental make?",
  crumb: "Rental returns",
  eyebrow: "Rental returns",
  h1: "What return should a Myrtle Beach rental make?",
  h1em: "By area, with and without a manager.",
  sub: `A Myrtle Beach rental returns ${p1(lowMgrLo)} to ${p1(lowMgrHi)} percent of its price a year after costs with a manager, and ${p1(lowSelfLo)} to ${p1(lowSelfHi)} percent without one. Appreciation comes on top.`,
  heroCta: { label: "Have us find top performing properties", href: "/invest/run-the-numbers/" },
  author: "devin",
  shortAnswer: `Two numbers, and the price you buy at decides both. A Horry County rental bought in the cheaper third of the market keeps ${p1(lowMgrLo)} to ${p1(lowMgrHi)} percent of its price each year after costs, with a manager. Without a manager it keeps ${p1(lowSelfLo)} to ${p1(lowSelfHi)} percent. Appreciation has added ${p1(metro.a5)} percent a year over five years and ${p1(metro.a10)} percent over ten. Those are all-cash returns, before any loan. With a loan the rent has to cover the payment too, and our line is a 1.25 coverage ratio. The numbers below are the whole page.`,
  sections: [
    { h2: "What return should you expect on a Myrtle Beach rental?", html:
      h.raw(PANEL) +
      h.p(`A rental pays you two ways. The rent left after the cost of owning the house, and the appreciation when you sell.`) +
      h.p(`The tiles above are all-cash returns, before any loan. A loan changes the cash you put in and adds a payment the rent has to cover. That is the coverage ratio, and it has its own line in the dealbreakers below.`) +
      T_TERMS +
      h.p(`${h.ext(ARBOR, "A national research firm puts the cap rate on single-family rentals at 7.3 percent")} for late 2025. Myrtle Beach sits inside that range once you use the price a rental sells for. The next section is why that matters more than anything else on this page.`) },

    { h2: "Which price should you divide the rent by?", html: (bg) =>
      h.p(`This is the question that decides whether the market looks good or bad, and it is easy to get wrong.`) +
      h.p(`${h.ext(ZILLOW, "Zillow publishes a typical value for every home in a ZIP code")}. In Murrells Inlet that is ${fmt$(mgc.mid)}. It counts oceanfront houses, second homes and everything else. Almost nobody buys that house as a rental.`) +
      h.p(`Zillow also publishes the value of the cheaper third of homes in the same ZIP. In Murrells Inlet that is ${fmt$(mgc.low)}. That is much closer to what a rental sells for here, and it is the price this page uses.`) +
      h.p(`The rent barely changes between the two. ${h.ext(FMR27, "The county's three-bedroom benchmark rent is " + fmt$(mb.rent))} either way. The price you divide by decides the whole return.`) +
      T_PRICE +
      h.p(`In the Myrtle Beach city core that is the difference between ${p1(mb.midMgr.cap)} percent and ${p1(mb.lowMgr.cap)} percent, on the same rent. Divide by the wrong price and a normal market looks like a bad one.`) +
      h.p(`One caution on the costs. This page keeps insurance at ${fmt$(INS)} on every house, which is the middle of our landlord range. A smaller house usually insures for less, so the real return on a cheaper house is a little higher than the table shows.`) +
      h.cta("Not sure what a rental costs in an area?", "Tell us the area and what you want the house to do. We send you what is for sale now and what each one would return.", "Have us find top performing properties", "/invest/run-the-numbers/", bg) },

    { h2: "How much does a long-term rental make in each area?", html:
      h.p(`Each area has two bars. The dark bar is the return with a property manager taking 10 percent of the rent. The light bar is the same house with you managing it. Both allow 10 percent of the rent for empty months and repairs.`) +
      h.raw(`<div style="max-width:760px;margin:1.1rem 0 1.3rem">${CHART_LTR}</div>`) +
      h.p(`The rent is the same county benchmark everywhere, so price alone decides the order. The Myrtle Beach city core leads because a rental there costs ${fmt$(mb.low)}. ${nmb.name} and ${mgc.name} trail because the same rent has to cover a ${fmt$(nmb.low)} or ${fmt$(mgc.low)} house.`) +
      T_LTR +
      h.h3("One house, line by line") +
      T_EX +
      h.p(`Property tax is the biggest cost after the allowance. A rental pays the 6 percent ratio, not the 4 percent a home you live in pays. ${h.a("/buyers/property-taxes/", "The property tax page")} has every district's rate, and ${h.a("/invest/landlord-insurance/", "the insurance page")} has the range.`) +
      h.p(`The 10 percent allowance for empty months and repairs is close to what the market runs. ${h.ext(FRED, "South Carolina's rental vacancy rate")} was 9.8 percent in 2025. A lender is stricter and ${h.ext("https://selling-guide.fanniemae.com/sel/b3-3.8-02/rental-income-subject-property", "counts only 75 percent of the rent")} when it decides your loan.`) },

    { h2: "How much does a short-term rental make in each area?", html:
      h.p(`${h.ext(AIRROI, "These are the average revenue and occupancy for every active listing")} in each market, August 2025 to July 2026, against the same rental prices. The dark bar takes 65 percent for costs and the light bar takes 45. Both cover management, cleaning, utilities, platform fees, the 6 percent tax and insurance.`) +
      h.p(`One difference from the section above. That revenue is the average of every listing in a market, and most of them are beach properties, not the cheapest houses in the area. This section therefore divides by the typical home value instead of the cheaper third. Pairing beach revenue with the cheapest houses would flatter the number.`) +
      h.raw(`<div style="max-width:760px;margin:1.1rem 0 1.3rem">${CHART_STR}</div>`) +
      T_STR +
      h.p(`Murrells Inlet and Garden City are one ZIP code for price and rent, and two separate short-term markets. The table keeps them apart because their bookings differ.`) +
      h.p(`Carolina Forest has no short-term figure because our data source does not measure it. That is not the same as no demand. It sits beside the new Carolina Forest hospital, and a furnished monthly rental there serves traveling nurses on 13-week contracts. ${h.a("/invest/mid-term-rentals/", "Furnished monthly rentals")} covers that, and ${h.a("/invest/where-to-buy/", "where to buy")} has the nightly-rental rules, which ban them in most neighborhoods.`) +
      h.p(`One more caution. Our source does not say whether revenue is before or after platform and cleaning fees, so this page treats it as before. ${h.a("/invest/airbnb-income/", "How much Airbnbs make here")} has the income by percentile.`) },

    { h2: "Which area is best for each number?", html:
      h.p(`Hover an area, or tap it, for its numbers. The buttons change what the color shows. Darker is higher.`) +
      h.raw(MAPBLOCK) +
      T_BEST +
      h.p(`Nightly rentals are banned in most Grand Strand neighborhoods, so the area decides the strategy before the numbers do. ${h.a("/invest/where-to-buy/", "Where to buy a rental")} has the rule, the license and the taxes for each area.`) },

    { h2: "When should you walk away?", html: (bg) =>
      h.p(`Four numbers. If a house misses one of them, we say so before you write an offer.`) +
      T_STOP +
      h.p(`The occupancy line is the one people argue with. The market average looks low because it includes every part-time and badly run listing. A well-run house books far more nights than the average one. That is why the manager matters more than the address.`) +
      h.p(`These are our lines, not an industry standard. No published study says what one rental house should return. ${h.a("/invest/strategies/dscr-loans/", "The DSCR page")} has the loan side of the coverage ratio.`) +
      h.cta("Every investor's goals are different.", "Tell us what you want the house to do, and we find properties that fit those goals and run all four numbers on each one.", "Have us find properties for your goals", "/invest/run-the-numbers/", bg) },

    { h2: "How do you calculate the return on one house?", html:
      h.p(`Enter a price and a rent. The tool takes out the allowance, the property tax for that area, insurance and dues, and shows the return with a manager and without one.`) +
      h.raw(TOOL) },

    { h2: "How much does appreciation add?", html:
      h.p(`The rent return is the same every year you own it. Appreciation depends on when you buy and when you sell. The chart adds the two for a Myrtle Beach rental at ${fmt$(mb.low)}.`) +
      h.raw(`<div style="max-width:760px;margin:1.1rem 0 1.4rem">${CHART_APP}</div>`) +
      h.p(`Over ten years appreciation did more than the rent. Over the last three it went backwards and the rent carried the whole return. That is the argument for buying on the rent and treating appreciation as a bonus.`) +
      h.p(`${h.a("/invest/how-long-to-hold/", "How long to hold a rental before selling")} has the price history for every area and the years it takes to earn the selling costs back.`) },
  ],
  faqTitle: "Rental returns FAQ",
  faq: [
    { q: "What is a good cap rate for a rental in Myrtle Beach?", a: `Six percent or better is our line. A Horry County rental bought in the cheaper third of the market returns ${p1(lowMgrLo)} to ${p1(lowMgrHi)} percent with a property manager and ${p1(lowSelfLo)} to ${p1(lowSelfHi)} percent without one. A national research firm put single-family cap rates at 7.3 percent in late 2025, so the better Myrtle Beach areas sit right in that range.` },
    { q: "Why do Myrtle Beach cap rates look so low in some reports?", a: `Because they divide the rent by the typical value of every home in the area, which includes oceanfront houses and second homes nobody rents out. Use the price a rental sells for and the same rent returns far more. In the Myrtle Beach city core that is the difference between ${p1(mb.midMgr.cap)} percent and ${p1(mb.lowMgr.cap)} percent.` },
    { q: "What DSCR do you need for a Myrtle Beach rental?", a: `Our line is 1.25. Divide the monthly rent by the monthly cost of the loan, taxes, insurance and dues. At ${fmt$(mb.rent)} of rent, 1.25 means all of those together stay under ${fmt$(mb.rent / 1.25)} a month. Some lenders will fund below that and charge for it.` },
    { q: "Which Myrtle Beach area has the best rental returns?", a: `For long-term rent, ${sortBy(areas.filter(a => a.low), a => a.lowMgr.cap).slice(0, 2).map(a => a.name).join(" and ")}, because the houses cost least and the rent is the same across the county. For short-term, ${strMarkets.slice(0, 2).map(m => m.name).join(" and ")}.` },
    { q: "Does a property manager make a rental worth it?", a: `A manager takes about 10 percent of the rent, which costs roughly one point of return. On a short-term rental the manager usually earns it back. The middle listing books 25 to 36 percent of nights. The top tenth books 67 to 76 percent. On a long-term rental, self-managing is worth about one extra point a year.` },
    { q: "How much does a Myrtle Beach rental appreciate?", a: `The metro rose ${p1(metro.a5)} percent a year over five years and ${p1(metro.a10)} percent a year over ten. Over the last three years it fell ${p1(Math.abs(metro.y3))} percent in total. Our line is 3 percent a year over the long run.` },
  ],
  sources: [
    { name: "Zillow home values and rents", href: ZILLOW },
    { name: "AirROI", href: AIRROI },
    { name: "HUD fair market rents", href: FMR27 },
    { name: "Arbor single-family report", href: ARBOR },
    { name: "LendingOne on DSCR", href: LENDINGONE },
    { name: "Newfi on DSCR", href: NEWFI },
    { name: "FRED, SC vacancy", href: FRED },
    { name: "Horry County Assessor", href: ASSESSOR },
    { name: "Georgetown County tax", href: GTCALC },
  ],
  sourcesNote: "Educational only, not a loan offer and not an appraisal. Chapter3 is a real estate brokerage. Area figures are not a quote on one house.",
  bottomCta: { h2: "Tell us what you want a rental to do.", p: "One call. Your goal, the areas that fit it, and all four numbers run on every house before you offer.", label: "Call a specialized agent", href: TEL },
  keywords: "Myrtle Beach rental returns, cap rate Myrtle Beach rental, Myrtle Beach investment property return, Grand Strand rental cap rate by area, Myrtle Beach Airbnb return, DSCR Myrtle Beach rental",
  about: "The return a rental property makes in Myrtle Beach and the Grand Strand, by area",
};
