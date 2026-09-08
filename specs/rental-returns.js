/* /invest/rental-returns/ - what return a Myrtle Beach rental makes, by area,
 * with the dealbreakers. Every number is computed at build time from
 * research/invest-next/data/submarkets.json (Zillow ZHVI and ZORI for July
 * 2026, AirROI August 2025 to July 2026, HUD FY2027 fair market rents, the
 * site's 2025 millage by district) so the page, the charts, the map and the
 * calculator cannot disagree with each other. Sources and every assumption:
 * research/invest-next/returns-facts.md (sections 4 and 5). Benchmarks: the
 * DSCR floors and the 75 percent lender rent factor are quoted from the lender
 * pages named in the sources line; the 7.3 percent national cap rate is
 * Arbor/Chandan Q4 2025. No interest rate and no loan payment appears anywhere
 * on the page (non-negotiable 3): coverage is shown as the rent divided by the
 * ratio. The calculator is verified in the browser against three hand-computed
 * cases by tools/verify-returns-calc.js (PLAYBOOK A29b). Built by
 * tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");
const D = require("../research/invest-next/data/submarkets.json");

const TEL = "tel:+18543332135";
const ZILLOW = "https://www.zillow.com/research/data/";
const AIRROI = "https://www.airroi.com/airbnb-data/united-states/south-carolina/myrtle-beach";
const FMR27 = "https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx";
const ARBOR = "https://arbor.com/research/reports/single-family-rental-investment-trends-report-q1-2026/";
const LENDINGONE = "https://lendingone.com/insight/a-guide-to-dscr-loans-for-real-estate-investors/";
const NEWFI = "https://newfi.com/dscr-loan-requirements/";
const GRIFFIN = "https://griffinfunding.com/dscr-loans/";
const FNMA = "https://selling-guide.fanniemae.com/sel/b3-3.8-02/rental-income-subject-property";
const FRED = "https://fred.stlouisfed.org/series/SCRVAC";
const GTCALC = "https://gtcountysc.gov/385/Property-Tax-Calculator";
const ASSESSOR = "https://www.horrycountysc.gov/departments/assessor/";

/* ---------------- data, computed once ---------------- */
const S = D.submarkets;
const M = D.meta.metro_zhvi.find(x => x.label === "Myrtle Beach, SC");
const ann = (now, then, yrs) => (Math.pow(now / then, 1 / yrs) - 1) * 100;
const metro = { now: M.latest, y1: (M.latest / M.v12 - 1) * 100, y3: (M.latest / M.v36 - 1) * 100, y5: (M.latest / M.v60 - 1) * 100, y10: (M.latest / M.v120 - 1) * 100,
  a3: ann(M.latest, M.v36, 3), a5: ann(M.latest, M.v60, 5), a10: ann(M.latest, M.v120, 10) };
const A = D.meta.assumptions;
const rows = S.map(s => {
  const zk = Object.keys(s.ltr_math).find(k => k.startsWith("ZIP ZORI")), fk = Object.keys(s.ltr_math).find(k => k.startsWith("FMR"));
  const z = s.ltr_math[zk], f = s.ltr_math[fk], m = s.str_math;
  return { id: s.slug, name: s.name, zip: s.zip, zhvi: s.zhvi, yoy: s.zhvi_yoy,
    c3: (s.zhvi / s.zhvi_3y - 1) * 100, c5: (s.zhvi / s.zhvi_5y - 1) * 100, c10: (s.zhvi / s.zhvi_10y - 1) * 100,
    a5: ann(s.zhvi, s.zhvi_5y, 5), a10: ann(s.zhvi, s.zhvi_10y, 10),
    zori: s.ltr_rent_zip, fmr: s.ltr_rent_fmr_3br_fy2027,
    capZ: z.base.cap, capZL: z.lean.cap, noiZ: z.base.noi, capF: f.base.cap, capFL: f.lean.cap, noiF: f.base.noi, taxF: f.base.tax,
    mills: s.property_tax_mills_6pct, fees: s.property_tax_extra_fees,
    occ: s.str_annual_occupancy_airroi_pct, adr: s.str_adr_airroi, rev: s.str_avg_annual_revenue_airroi, listings: s.str_active_listings, revyoy: s.str_revenue_yoy_pct,
    cap45: m ? m.cap45 : null, cap65: m ? m.cap65 : null, noi45: m ? m.noi45 : null, noi65: m ? m.noi65 : null };
});
const by = (id) => rows.find(r => r.id === id);
const mb = by("myrtle-beach"), pi = by("pawleys-island"), lr = by("little-river"), gc = by("garden-city"), sb = by("surfside-beach"), mi = by("murrells-inlet"), cw = by("conway");
const fmt$ = (n) => "$" + Math.round(n).toLocaleString("en-US");
const p1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
const sp = (n) => (n >= 0 ? "+" : "−") + p1(Math.abs(n));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const horry = rows.filter(r => r.id !== "pawleys-island");
const range = (arr, k) => [Math.min(...arr.map(r => r[k])), Math.max(...arr.map(r => r[k]))];
const [zLo, zHi] = range(horry, "capZ"), [zlLo, zlHi] = range(horry, "capZL");
const strRows = rows.filter(r => r.cap45 !== null);
const [sLo, sHi] = [Math.min(...strRows.map(r => r.cap65)), Math.max(...strRows.map(r => r.cap45))];
const [occLo, occHi] = range(strRows, "occ");
const belowTwoF = rows.filter(r => r.capF < 2).map(r => r.name);
const sortBy = (k, desc = true) => rows.slice().sort((a, b) => desc ? (b[k] ?? -1e9) - (a[k] ?? -1e9) : (a[k] ?? 1e9) - (b[k] ?? 1e9));

/* ---------------- static SVG charts ---------------- */
const NAVY = "#1c2028", MUTED = "rgba(28,32,40,.78)", BRASS = "#c4783a", BRASS_LT = "#e3bf8f", PURPLE = "#6a5aa8", PURPLE_LT = "#c2b9e3", GRAY = "#b9b3aa", INK_LT = "rgba(28,32,40,.35)";
const SVGSTYLE = 'style="display:block;max-width:640px;font-family:var(--sans)"';

/* Two overlapping bars per row: a dark bar to `lo`, a light bar to `hi`, one label. */
function rangeChart(items, opt) {
  const W = 640, L = 132, R = 92, BW = W - L - R, rowH = 26, H = items.length * rowH + 46 + (opt.screen ? 16 : 0), max = opt.max;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(opt.aria)}" ${SVGSTYLE}>`;
  items.forEach((it, i) => {
    const y = i * rowH + 4;
    s += `<text x="${L - 8}" y="${y + 15}" font-size="12" text-anchor="end" fill="${NAVY}">${esc(it.name)}</text>`;
    if (it.hi === null || it.hi === undefined) { s += `<text x="${L + 6}" y="${y + 15}" font-size="12" fill="${MUTED}">no data</text>`; return; }
    const wh = Math.max(2, Math.round(BW * Math.max(0, it.hi) / max)), wl = Math.max(0, Math.round(BW * Math.max(0, it.lo) / max));
    s += `<rect x="${L}" y="${y}" width="${wh}" height="20" fill="${opt.light}"><title>${esc(it.name)}: ${esc(it.label)}</title></rect>`;
    if (wl > 0) s += `<rect x="${L}" y="${y}" width="${wl}" height="20" fill="${opt.dark}"><title>${esc(it.name)}: ${esc(it.label)}</title></rect>`;
    s += `<text x="${L + wh + 6}" y="${y + 15}" font-size="12" fill="${NAVY}">${esc(it.label)}</text>`;
  });
  let base = items.length * rowH + 6;
  if (opt.screen) { const x = L + Math.round(BW * opt.screen / max); s += `<line x1="${x}" y1="0" x2="${x}" y2="${base + 4}" stroke="${NAVY}" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${x + 5}" y="${base + 14}" font-size="11" fill="${MUTED}">${esc(opt.screenLabel)}</text>`; base += 16; }
  s += `<rect x="${L}" y="${base + 14}" width="12" height="12" fill="${opt.dark}"/><text x="${L + 17}" y="${base + 24}" font-size="12" fill="${NAVY}">${esc(opt.darkLabel)}</text>`;
  s += `<rect x="${L + 250}" y="${base + 14}" width="12" height="12" fill="${opt.light}"/><text x="${L + 267}" y="${base + 24}" font-size="12" fill="${NAVY}">${esc(opt.lightLabel)}</text>`;
  return s + "</svg>";
}
const ltrItems = sortBy("capZ").map(r => ({ name: r.name, lo: r.capZ, hi: r.capZL, label: `${p1(r.capZ)} to ${p1(r.capZL)}%` }));
const CHART_LTR = rangeChart(ltrItems, { max: 5, dark: BRASS, light: BRASS_LT, darkLabel: "With a manager, 25 percent allowance", lightLabel: "Self-managed, 10 percent allowance", screen: 2, screenLabel: "2 percent screen", aria: "Long-term rental return by area, typical rent and typical home value, July 2026" });
const strItems = sortBy("cap45").map(r => r.cap45 === null ? { name: r.name, lo: null, hi: null, label: "" } : { name: r.name, lo: r.cap65, hi: r.cap45, label: `${p1(r.cap65)} to ${p1(r.cap45)}%` });
const CHART_STR = rangeChart(strItems, { max: 6, dark: PURPLE, light: PURPLE_LT, darkLabel: "At 65 percent expenses", lightLabel: "At 45 percent expenses", aria: "Short-term rental return by area, average listing revenue against the typical home value" });

/* Grouped bars around a zero line: the rent part and the price part of the yearly return, by window. */
function partsChart(groups) {
  const W = 640, L = 96, R = 120, BW = W - L - R, min = -2, max = 9, gH = 40, H = groups.length * gH + 44;
  const x = (v) => L + Math.round(BW * (v - min) / (max - min)), x0 = x(0);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="The rent part and the price part of a yearly return, over three, five and ten years" ${SVGSTYLE}>`;
  groups.forEach((g, i) => {
    const y = i * gH + 4;
    s += `<text x="${L - 8}" y="${y + 20}" font-size="12" text-anchor="end" fill="${NAVY}">${esc(g.name)}</text>`;
    const bar = (v, yy, col, lab) => { const a = Math.min(x0, x(v)), w = Math.max(2, Math.abs(x(v) - x0)); s += `<rect x="${a}" y="${yy}" width="${w}" height="12" fill="${col}"><title>${esc(g.name)}: ${esc(lab)}</title></rect>`; s += `<text x="${v >= 0 ? x(v) + 5 : x0 + 5}" y="${yy + 10}" font-size="11" text-anchor="start" fill="${NAVY}">${esc(lab)}</text>`; };
    bar(g.rent, y, BRASS, `rent ${sp(g.rent)}%`);
    bar(g.price, y + 15, PURPLE, `price ${sp(g.price)}%`);
    s += `<text x="${W - 4}" y="${y + 20}" font-size="12" font-weight="600" text-anchor="end" fill="${NAVY}">total ${sp(g.rent + g.price)}%</text>`;
  });
  const base = groups.length * gH + 6;
  s += `<line x1="${x0}" y1="0" x2="${x0}" y2="${base}" stroke="${NAVY}" stroke-width="1.5"/>`;
  s += `<rect x="${L}" y="${base + 12}" width="12" height="12" fill="${BRASS}"/><text x="${L + 17}" y="${base + 22}" font-size="12" fill="${NAVY}">Rent after costs, with a manager</text>`;
  s += `<rect x="${L + 250}" y="${base + 12}" width="12" height="12" fill="${PURPLE}"/><text x="${L + 267}" y="${base + 22}" font-size="12" fill="${NAVY}">Price change a year, metro</text>`;
  return s + "</svg>";
}
const CHART_PARTS = partsChart([
  { name: "3 years", rent: mb.capZ, price: metro.a3 },
  { name: "5 years", rent: mb.capZ, price: metro.a5 },
  { name: "10 years", rent: mb.capZ, price: metro.a10 },
]);

/* ---------------- the hover map ---------------- */
const mapRows = rows.map(r => ({ id: r.id, n: r.name, zip: r.zip, v: r.zhvi, rent: r.zori, ltr: +p1(r.capZ), rev: r.rev, occ: r.occ, str: r.cap45 === null ? null : +p1(r.cap45), strLo: r.cap65 === null ? null : +p1(r.cap65), a5: +p1(r.a5) }));
const MAP = `
<style>
#rrmap{position:relative;max-width:640px}
#rrmap svg{display:block;width:100%;height:auto}
#rrmap .rg{cursor:pointer}
#rrmap .rg path{transition:fill .15s}
#rrmap .rg:hover path,#rrmap .rg:focus path,#rrmap .rg.on path{stroke:#1c2028;stroke-width:2}
#rrmap .rg:focus{outline:none}
#rrtip{position:absolute;pointer-events:none;background:#1c2028;color:#f4efe8;font-size:.8rem;line-height:1.45;padding:.55rem .7rem;border-radius:6px;max-width:250px;display:none;z-index:2}
#rrtip b{color:#f4efe8;display:block;margin-bottom:.15rem}
#rrtog{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 .6rem}
#rrtog button{font-family:var(--sans);font-size:.72rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:.45rem .7rem;border:1.5px solid rgba(28,32,40,.25);background:transparent;color:rgba(28,32,40,.78);cursor:pointer;border-radius:4px}
#rrtog button[aria-pressed="true"]{background:#1c2028;color:#f4efe8;border-color:#1c2028}
#rrleg{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;font-size:.72rem;color:rgba(28,32,40,.78);margin-top:.4rem}
#rrleg i{display:inline-block;width:14px;height:14px;border-radius:2px}
</style>
<div id="rrtog" role="group" aria-label="What the map color shows"></div>
<div id="rrmap"></div>
<div id="rrleg"></div>
<p style="font-size:.72rem;color:rgba(28,32,40,.78);margin:.3rem 0 0">Not to scale. Hover, tap or tab to an area. Home values and rents: Zillow, July 2026, by ZIP. Short-term figures: AirROI, August 2025 to July 2026.</p>
<script>
(function(){
var R=${JSON.stringify(mapRows)};
function money(v){return "$"+v.toLocaleString("en-US")}
var METRICS=[
 {k:"ltr",label:"Long-term return",fmt:function(v){return v.toFixed(1)+" percent a year"}},
 {k:"str",label:"Short-term return",fmt:function(v){return v.toFixed(1)+" percent a year"}},
 {k:"v",label:"Home value",fmt:function(v){return money(v)}},
 {k:"a5",label:"Price change, 5 years",fmt:function(v){return (v>=0?"+":"")+v.toFixed(1)+" percent a year"}}
];
var RAMP=["#f3e3cf","#ecd3b0","#e3bf8f","#dba36a","#d4894a"], NONE="#e6e0d6";
var P=[[585,165],[530,215],[470,270],[385,345],[335,390],[290,430],[230,475],[140,540]];
var OFF=[-51,-68];
function o(d){return [OFF[0]*d,OFF[1]*d]}
function pt(i,d){var q=o(d);return [P[i][0]+q[0],P[i][1]+q[1]]}
function band(i,depth){var d=depth||0;return [pt(i,d),pt(i+1,d),pt(i+1,d+1),pt(i,d+1)];}
var SHAPES={
 "little-river":band(0),"north-myrtle-beach":band(1),"myrtle-beach":band(2),"surfside-beach":band(3),
 "garden-city":band(4),"murrells-inlet":band(5),"pawleys-island":band(6),
 "carolina-forest":band(2,1),
 "conway":[pt(1,1),pt(2,1),pt(2,2),pt(3,2),pt(3,3),pt(1,3)]
};
var SHORT={"north-myrtle-beach":"N. Myrtle Beach","pawleys-island":"Pawleys","surfside-beach":"Surfside"};
function centroid(pts){var x=0,y=0;pts.forEach(function(p){x+=p[0];y+=p[1]});return [x/pts.length,y/pts.length]}
function ramp(k){var vals=R.filter(function(r){return r[k]!==null}).map(function(r){return r[k]}),lo=Math.min.apply(null,vals),hi=Math.max.apply(null,vals);
  return function(v){if(v===null)return NONE;var t=hi===lo?0:(v-lo)/(hi-lo);return RAMP[Math.min(4,Math.floor(t*5))]}}
var cur="ltr", map=document.getElementById("rrmap"), tog=document.getElementById("rrtog"), leg=document.getElementById("rrleg");
var svg='<svg viewBox="0 0 640 570" role="img" aria-label="Nine Grand Strand areas with long-term and short-term rental figures">';
svg+='<rect x="0" y="0" width="640" height="570" fill="#f4efe8"/>';
svg+='<polygon points="'+P.map(function(p){return p.join(",")}).join(" ")+' 640,570 640,110" fill="rgba(28,32,40,.06)"/>';
svg+='<text x="560" y="380" font-size="11" fill="rgba(28,32,40,.55)" transform="rotate(-40 560 380)">Atlantic Ocean</text>';
R.forEach(function(r){var pts=SHAPES[r.id],c=centroid(pts);
  svg+='<g class="rg" tabindex="0" role="button" data-id="'+r.id+'" aria-label="'+r.n+'"><path d="M'+pts.map(function(p){return p.join(" ")}).join(" L")+' Z" stroke="#f4efe8" stroke-width="2"/>';
  svg+='<text x="'+c[0]+'" y="'+(c[1]+4)+'" font-size="11" font-weight="600" text-anchor="middle" fill="#1c2028" pointer-events="none">'+(SHORT[r.id]||r.n)+'</text></g>';});
svg+='</svg><div id="rrtip" role="status" aria-live="polite"></div>';
map.innerHTML=svg;
var tip=document.getElementById("rrtip");
function paint(){var f=ramp(cur);R.forEach(function(r){map.querySelector('[data-id="'+r.id+'"] path').setAttribute("fill",f(r[cur]))});
  var m=METRICS.filter(function(x){return x.k===cur})[0],vals=R.filter(function(r){return r[cur]!==null}).map(function(r){return r[cur]});
  leg.innerHTML='<span>'+m.label+':</span>'+RAMP.map(function(c){return '<i style="background:'+c+'"></i>'}).join("")+'<span>'+m.fmt(Math.min.apply(null,vals))+' to '+m.fmt(Math.max.apply(null,vals))+'</span>'+(vals.length<R.length?'<i style="background:'+NONE+'"></i><span>no data</span>':'');
  tog.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.k===cur?"true":"false")});}
METRICS.forEach(function(m){var b=document.createElement("button");b.type="button";b.textContent=m.label;b.dataset.k=m.k;b.addEventListener("click",function(){cur=m.k;paint()});tog.appendChild(b)});
function lines(r){var a=["Typical home value: "+money(r.v),"Long-term rent: "+money(r.rent)+" a month","Long-term return: "+r.ltr.toFixed(1)+" percent a year"];
  if(r.str===null)a.push("Short-term: no data for this area");else{a.push("Short-term revenue: "+money(r.rev)+" a year per listing, "+Math.round(r.occ)+" percent of nights booked");a.push("Short-term return: "+r.strLo.toFixed(1)+" to "+r.str.toFixed(1)+" percent a year");}
  a.push("Price change, 5 years: "+(r.a5>=0?"+":"")+r.a5.toFixed(1)+" percent a year");return a;}
function show(r,x,y){tip.innerHTML="<b>"+r.n+" (ZIP "+r.zip+")</b>"+lines(r).join("<br>");
  tip.style.display="block";var W=map.clientWidth,tw=tip.offsetWidth;tip.style.left=Math.max(0,Math.min(W-tw,x+12))+"px";tip.style.top=(y-tip.offsetHeight-12<0?y+16:y-tip.offsetHeight-12)+"px";}
map.querySelectorAll(".rg").forEach(function(g){var r=R.filter(function(x){return x.id===g.dataset.id})[0];
  g.addEventListener("mousemove",function(e){var b=map.getBoundingClientRect();show(r,e.clientX-b.left,e.clientY-b.top)});
  g.addEventListener("mouseleave",function(){if(!g.classList.contains("on"))tip.style.display="none"});
  g.addEventListener("focus",function(){var b=g.getBoundingClientRect(),m=map.getBoundingClientRect();show(r,b.left-m.left+b.width/2,b.top-m.top)});
  g.addEventListener("blur",function(){if(!g.classList.contains("on"))tip.style.display="none"});
  g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();g.dispatchEvent(new MouseEvent("click",{bubbles:true}));}});
  g.addEventListener("click",function(){map.querySelectorAll(".rg.on").forEach(function(x){if(x!==g)x.classList.remove("on")});g.classList.toggle("on");if(g.classList.contains("on")){var b=g.getBoundingClientRect(),m=map.getBoundingClientRect();show(r,b.left-m.left+b.width/2,b.top-m.top)}else tip.style.display="none";});
});
window.addEventListener("resize",function(){tip.style.display="none";map.querySelectorAll(".rg.on").forEach(function(x){x.classList.remove("on")})});
paint();
})();
</script>`;

/* ---------------- the calculator ---------------- */
const IN = 'style="width:100%;max-width:170px;margin-top:.3rem;background:var(--ivory);border:1px solid rgba(28,32,40,.3);border-radius:6px;color:var(--navy);font-family:var(--sans);font-size:.95rem;padding:.42rem .55rem"';
const LB = 'style="display:block;font-size:.78rem;color:var(--muted);font-weight:600"';
const OUT = 'style="font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)"';
const BIG = 'style="font-family:var(--serif);font-size:1.5rem;color:var(--navy)"';
const TOOL = `
<div id="rrtool" style="background:var(--ivory-2);border:1.5px solid var(--rule);padding:1.4rem 1.4rem 1.2rem;margin:1.2rem 0 1.4rem">
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.9rem 1.2rem;margin-bottom:1rem">
    <label ${LB}>Area, for the tax rate<br><select id="rrArea" onchange="c3Ret()" aria-label="Area, which decides the property tax rate" ${IN}>${rows.map(r => `<option value="${r.id}" data-mills="${r.mills}" data-fees="${r.fees}"${r.id === "myrtle-beach" ? " selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label>
    <label ${LB}>Price<br><input id="rrPrice" type="number" min="0" step="1000" value="300000" oninput="c3Ret()" aria-label="Purchase price in dollars" ${IN}></label>
    <label ${LB}>Monthly rent<br><input id="rrRent" type="number" min="0" step="25" value="1800" oninput="c3Ret()" aria-label="Monthly rent in dollars" ${IN}></label>
    <label ${LB}>Association dues a month<br><input id="rrHoa" type="number" min="0" step="10" value="0" oninput="c3Ret()" aria-label="Association dues a month in dollars" ${IN}></label>
    <label ${LB}>Landlord insurance a year<br><input id="rrIns" type="number" min="0" step="50" value="3050" oninput="c3Ret()" aria-label="Landlord insurance a year in dollars" ${IN}></label>
    <label ${LB}>Management<br><select id="rrMgmt" onchange="c3Ret()" aria-label="Management fee as a percent of rent" ${IN}><option value="10" selected>A manager, 10 percent of rent</option><option value="0">Self-managed, 0</option></select></label>
    <label ${LB}>Allowance for empty months and repairs<br><select id="rrAllow" onchange="c3Ret()" aria-label="Allowance for empty months and repairs as a percent of rent" ${IN}><option value="25" selected>25 percent of rent</option><option value="10">10 percent of rent</option></select></label>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem 1rem;margin-bottom:.9rem">
    <div><div ${OUT}>Rent left after costs, a year</div><div id="rrNoi" ${BIG}>$0</div></div>
    <div><div ${OUT}>Return on the price</div><div id="rrCap" ${BIG}>0.0%</div></div>
    <div><div ${OUT}>Property tax at 6 percent</div><div id="rrTax" ${BIG}>$0</div></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem 1rem;margin-bottom:.9rem">
    <div><div ${OUT}>Rent divided by 1.00</div><div id="rrC100" ${BIG}>$0</div></div>
    <div><div ${OUT}>Rent divided by 1.10</div><div id="rrC110" ${BIG}>$0</div></div>
    <div><div ${OUT}>Rent divided by 1.25</div><div id="rrC125" ${BIG}>$0</div></div>
  </div>
  <p id="rrVerdict" style="font-size:.92rem;color:var(--navy);line-height:1.5;margin:0 0 1rem;min-height:1.2em;font-weight:600"></p>
  <div style="font-size:.78rem;color:var(--muted);margin-bottom:.35rem">Where the rent goes</div>
  <div id="rrChart"></div>
</div>
<script>
  var RR_MILLS=${JSON.stringify(Object.fromEntries(rows.map(r => [r.id, [r.mills, r.fees]])))};
  function rr$(i){return document.getElementById(i)}
  function rrFmt(n){return (n<0?"\\u2212$":"$")+Math.round(Math.abs(n)).toLocaleString("en-US")}
  function c3Ret(){
    var area=rr$("rrArea").value, mf=RR_MILLS[area]||[0,0];
    var price=Math.max(0,+rr$("rrPrice").value||0), rent=Math.max(0,+rr$("rrRent").value||0), hoa=Math.max(0,+rr$("rrHoa").value||0), ins=Math.max(0,+rr$("rrIns").value||0);
    var mg=+rr$("rrMgmt").value/100, al=+rr$("rrAllow").value/100;
    var gross=rent*12, allow=gross*al, mgmt=gross*mg, tax=price*0.06*mf[0]/1000+mf[1], dues=hoa*12;
    var noi=gross-allow-mgmt-tax-ins-dues, cap=price>0?noi/price*100:0;
    rr$("rrNoi").textContent=rrFmt(noi); rr$("rrCap").textContent=(cap<0?"\\u2212":"")+Math.abs(cap).toFixed(1)+"%"; rr$("rrTax").textContent=rrFmt(tax);
    rr$("rrC100").textContent=rrFmt(rent); rr$("rrC110").textContent=rrFmt(rent/1.10); rr$("rrC125").textContent=rrFmt(rent/1.25);
    var v;
    if(price<=0||rent<=0) v="Enter a price and a rent.";
    else if(noi<=0) v="Dealbreaker. The rent does not cover the costs of owning the house, before any loan.";
    else if(cap<2) v="Below 2 percent with these costs. The return depends on the price rising. The metro price fell ${p1(Math.abs(metro.y3))} percent over the last three years.";
    else v="Passes the first screen. If the lender's monthly figure for the loan, taxes, insurance and dues is above the rent divided by 1.25, most lenders will not fund it at standard terms.";
    rr$("rrVerdict").textContent=v;
    var parts=[["Allowance",allow,"#b9b3aa"],["Management",mgmt,"#8f8a82"],["Property tax",tax,"#6a5aa8"],["Insurance",ins,"#9a8bc9"],["Dues",dues,"#c2b9e3"],["Left for you",Math.max(0,noi),"#c4783a"]].filter(function(p){return p[1]>0});
    var W=640, total=Math.max(gross,1), x=0, s='<svg viewBox="0 0 '+W+' 66" width="100%" role="img" aria-label="Where the rent goes" style="display:block;max-width:640px;font-family:var(--sans)">';
    if(noi<0){parts.push(["Short",-noi,"#b23b3b"]);total=gross-noi;}
    parts.forEach(function(p){var w=Math.max(1,Math.round(W*p[1]/total)); s+='<rect x="'+x+'" y="0" width="'+Math.max(0,w-2)+'" height="24" fill="'+p[2]+'"><title>'+p[0]+' '+rrFmt(p[1])+'</title></rect>'; x+=w;});
    x=0; parts.forEach(function(p,i){var col=Math.floor(i/3), rowi=i%3; s+='<rect x="'+(rowi*210)+'" y="'+(34+col*16)+'" width="10" height="10" fill="'+p[2]+'"/><text x="'+(rowi*210+15)+'" y="'+(43+col*16)+'" font-size="11" fill="#1c2028">'+p[0]+' '+rrFmt(p[1])+'</text>';});
    s+='</svg>'; rr$("rrChart").innerHTML=s;
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",c3Ret); else c3Ret();
</script>`;

/* ---------------- tables ---------------- */
const T_DEF = h.table(["Number", "What it is", "Typical here, July 2026"], [
  ["Cap rate", "The rent left after the costs of owning the house, divided by the price", `${p1(zLo)} to ${p1(zHi)} percent on a long-term rental in Horry County, with a manager`],
  ["Coverage ratio", "The monthly rent divided by the monthly cost of the loan, taxes, insurance and dues", "Most lenders want 1.10 to 1.25 or higher"],
  ["Price change", "The change in the typical home value each year", `${sp(metro.a10)} percent a year over ten years, ${sp(metro.a3)} over the last three`],
  ["Occupancy", "The share of nights a short-term rental is booked", `${Math.round(occLo)} to ${Math.round(occHi)} percent across the year`],
]);
const T_LTR = h.table(["Area", "ZIP", "Typical home value", "Typical rent", "Return, with a manager", "Self-managed", "At the county three-bedroom rent"], sortBy("capZ").map(r => [
  r.name, r.zip, fmt$(r.zhvi), fmt$(r.zori) + " a month", p1(r.capZ) + "%", p1(r.capZL) + "%", `${p1(r.capF)}% at ${fmt$(r.fmr)}`]));
const T_EX = h.table(["Line", "A year"], [
  ["Rent, 12 months at " + fmt$(mb.fmr), fmt$(mb.fmr * 12)],
  ["Allowance for empty months and repairs, 25 percent", "−" + fmt$(mb.fmr * 12 * A.vacMaintBase)],
  ["Management, 10 percent", "−" + fmt$(mb.fmr * 12 * A.mgmtBase)],
  [`Property tax at 6 percent, city of Myrtle Beach, ${mb.mills} mills`, "−" + fmt$(mb.taxF)],
  ["Landlord insurance", "−" + fmt$(A.insMid)],
  ["Left for you", fmt$(mb.noiF)],
  [`Divided by the ${fmt$(mb.zhvi)} price`, p1(mb.capF) + " percent"],
]);
const T_STR = h.table(["Area", "Active listings", "Nights booked", "Average revenue per listing", "Return at 65 percent expenses", "At 45 percent"], sortBy("cap45").map(r => r.cap45 === null
  ? [r.name, "no AirROI market", "", "", "", ""]
  : [r.name, r.listings.toLocaleString("en-US"), Math.round(r.occ) + "%", fmt$(r.rev) + " a year", p1(r.cap65) + "%", p1(r.cap45) + "%"]));
const T_COV = h.table(["Ratio", "What it means", `At ${fmt$(mb.fmr)} of rent`, `At ${fmt$(gc.zori)} of rent`], [
  ["1.00", "The rent equals the monthly cost of the loan, taxes, insurance and dues", fmt$(mb.fmr), fmt$(gc.zori)],
  ["1.10", "The rent is 10 percent above it", fmt$(mb.fmr / 1.10), fmt$(gc.zori / 1.10)],
  ["1.25", "The rent is 25 percent above it", fmt$(mb.fmr / 1.25), fmt$(gc.zori / 1.25)],
]);
const top2 = (k, fmt, desc = true) => sortBy(k, desc).filter(r => r[k] !== null).slice(0, 2).map(r => `${r.name} ${fmt(r)}`).join("; ");
const T_BEST = h.table(["The number", "Best areas", "The figure"], [
  ["Long-term return, typical rent and value", top2("capZ", r => p1(r.capZ) + "%"), "Cheaper houses, not higher rent"],
  ["Long-term return at the county three-bedroom rent", top2("capF", r => p1(r.capF) + "%"), fmt$(mb.fmr) + " a month in Horry County"],
  ["Typical rent", top2("zori", r => fmt$(r.zori)), "Garden City and Murrells Inlet share ZIP 29576"],
  ["Lowest typical home value", top2("zhvi", r => fmt$(r.zhvi), false), "The price is the denominator"],
  ["Short-term revenue per listing", top2("rev", r => fmt$(r.rev)), "Average of every active listing, a year"],
  ["Short-term return", top2("cap45", r => `${p1(r.cap65)} to ${p1(r.cap45)}%`), "At 65 and 45 percent expenses"],
  ["Nights booked", top2("occ", r => Math.round(r.occ) + "%"), "Across the whole year"],
  ["Price rise, five years", top2("a5", r => sp(r.a5) + "% a year"), "Zillow, July 2021 to July 2026"],
  ["Price fall, three years", top2("c3", r => sp(r.c3) + "%", false), "Zillow, July 2023 to July 2026"],
]);
const T_PARTS = h.table(["Window", "Rent after costs, with a manager", "Price change a year, metro", "Total a year"], [
  ["3 years", p1(mb.capZ) + "%", sp(metro.a3) + "%", sp(mb.capZ + metro.a3) + "%"],
  ["5 years", p1(mb.capZ) + "%", sp(metro.a5) + "%", sp(mb.capZ + metro.a5) + "%"],
  ["10 years", p1(mb.capZ) + "%", sp(metro.a10) + "%", sp(mb.capZ + metro.a10) + "%"],
]);

module.exports = {
  url: "/invest/rental-returns/",
  title: "What Return Should a Myrtle Beach Rental Make? | Chapter3",
  description: "Cap rates, short-term returns and price change for nine Grand Strand areas, from Zillow, AirROI and HUD data, with a hover map, a calculator and five dealbreakers.",
  ogTitle: "What return should a Myrtle Beach rental make?",
  crumb: "Rental returns",
  eyebrow: "Rental returns",
  h1: "What return should a Myrtle Beach rental make?",
  h1em: "The numbers by area, and when to walk away.",
  sub: `A Myrtle Beach house rented long-term keeps ${p1(zLo)} to ${p1(zHi)} percent of its price a year after costs. The rest of the return has come from the price change.`,
  heroCta: { label: "Have us run the numbers", href: "/invest/run-the-numbers/" },
  author: "devin",
  shortAnswer: `Two numbers. A long-term rental in Horry County keeps ${p1(zLo)} to ${p1(zHi)} percent of its price each year after costs. That assumes a manager and a 25 percent allowance for empty months and repairs. Self-managed with a 10 percent allowance, ${p1(zlLo)} to ${p1(zlHi)} percent. A short-term rental nets ${p1(sLo)} to ${p1(sHi)} percent of the typical home value, by area. Both are below the 7.3 percent a national research firm reports for single-family rentals. The price change has been the larger part of the return here. It was ${p1(metro.a10)} percent a year over ten years and ${p1(metro.a5)} percent over five. It fell ${p1(Math.abs(metro.y3))} percent over the last three. Below 2 percent with a manager, or with a rent that does not cover the costs, we call it a dealbreaker. The map and the calculator below give the numbers for one area and one house.`,
  sections: [
    { h2: "What does a Myrtle Beach rental return?", html:
      h.p(`A rental pays you two ways. The first is the rent left after the costs of owning the house. The second is the change in the price when you sell.`) +
      h.p(`The first part is small on the Grand Strand. A typical house rented at the typical rent keeps ${p1(zLo)} to ${p1(zHi)} percent of its price each year after costs. That assumes a manager and a 25 percent allowance for empty months and repairs. Investors call that number the cap rate. Self-managed, with a 10 percent allowance, it is ${p1(zlLo)} to ${p1(zlHi)} percent.`) +
      h.p(`The second part has been larger. ${h.ext(ZILLOW, "The typical home value in the metro")} rose ${p1(metro.a10)} percent a year over the last ten years and ${p1(metro.a5)} percent a year over the last five. It fell ${p1(Math.abs(metro.y3))} percent over the last three.`) +
      h.p(`Short-term rentals sit between the two. The average listing's revenue, after 45 to 65 percent expenses, is ${p1(sLo)} to ${p1(sHi)} percent of the typical home value, depending on the area.`) +
      T_DEF +
      h.p(`${h.ext(ARBOR, "A national research firm puts the cap rate on single-family rentals at 7.3 percent")} for late 2025. Myrtle Beach is below that on rent alone. Buyers here have made their return from the price change and from short-term rates instead. That is why the price part and the short-term part get their own sections below.`) },
    { h2: "How much does a long-term rental make in each area?", html: (bg) =>
      h.p(`The chart uses the typical asking rent and the typical home value in the same ZIP, ${h.ext(ZILLOW, "from Zillow for July 2026")}. The dark bar is the return with a manager and a 25 percent allowance for empty months and repairs. The light bar is self-managed with a 10 percent allowance. The dashed line is Chapter3's 2 percent screen.`) +
      h.raw(`<div style="max-width:640px;margin:1rem 0 1.2rem">${CHART_LTR}</div>`) +
      h.p(`${cw.name} and the Myrtle Beach city core lead because the houses cost less, not because the rent is higher. ${gc.name} and ${mi.name} have the highest typical rent, ${fmt$(gc.zori)} a month, and a ${fmt$(gc.zhvi)} typical home, so the return is lower. ${pi.name} has the most expensive houses and the lowest return.`) +
      h.p(`The last column uses the county's three-bedroom benchmark rent instead of the ZIP's typical rent. ${h.ext(FMR27, "That benchmark is " + fmt$(mb.fmr) + " in Horry County")} and ${fmt$(pi.fmr)} in Georgetown County, where Pawleys Island sits.`) +
      T_LTR +
      h.h3("One worked example, the Myrtle Beach city core") +
      T_EX +
      h.p(`Property tax is the largest cost after the allowance. A rental pays the 6 percent assessment ratio, not the 4 percent a legal residence pays. In Horry County the tax alone takes 1.2 to 1.6 points off the return. ${h.a("/buyers/property-taxes/", "The property tax page")} has every district's rate. ${h.a("/invest/landlord-insurance/", "The insurance figure")} is the middle of the site's landlord range.`) +
      h.p(`The 25 percent allowance is the share of rent ${h.ext(FNMA, "a conventional lender leaves out")} when it counts rent toward a loan. ${h.ext(FRED, "South Carolina's rental vacancy rate")} was 9.8 percent in 2025, which is where the 10 percent self-managed case comes from.`) +
      h.cta("Want the return on one house?", "Send us the address and the rent you expect. We run the numbers with local leases and the tax district before you offer.", "Have us run the numbers", "/invest/run-the-numbers/", bg) },
    { h2: "How much does a short-term rental make in each area?", html:
      h.p(`The chart uses ${h.ext(AIRROI, "the average revenue per active listing from AirROI")}, August 2025 to July 2026, against the same typical home values. The dark bar takes 65 percent expenses. The light bar takes 45 percent. Both include management, cleaning, utilities, platform fees, the 6 percent tax and insurance.`) +
      h.raw(`<div style="max-width:640px;margin:1rem 0 1.2rem">${CHART_STR}</div>`) +
      h.p(`${sb.name}, ${mi.name} and ${gc.name} lead. Their listings earn ${fmt$(Math.min(sb.rev, mi.rev, gc.rev))} to ${fmt$(Math.max(sb.rev, mi.rev, gc.rev))} a year and the typical home costs ${fmt$(Math.min(sb.zhvi, mi.zhvi, gc.zhvi))} to ${fmt$(Math.max(sb.zhvi, mi.zhvi, gc.zhvi))}. ${lr.name} is the weakest. Its listings average ${fmt$(lr.rev)} a year. After expenses that is ${fmt$(lr.noi65)} to ${fmt$(lr.noi45)}, about what a long-term lease of the same house leaves.`) +
      T_STR +
      h.p(`Three cautions. The revenue is the average of every active listing in the area, mostly condos in Myrtle Beach and North Myrtle Beach, and the price is a typical home. The chart compares an area's typical listing with an area's typical house, not one house with its own bookings. AirROI does not say whether revenue is before or after platform fees and cleaning fees, so the page treats it as gross. Revenue fell from the year before in five of the eight areas.`) +
      h.p(`${h.a("/invest/airbnb-income/", "How much Airbnbs make here")} has the income by percentile. ${h.a("/invest/rental-program-vs-airbnb/", "Rental program against Airbnb")} has the management split.`) },
    { h2: "Which area is best for each number?", html:
      h.p(`Hover over an area, or tap it, for its long-term and short-term numbers. The buttons change what the color shows. Darker is higher.`) +
      h.raw(MAP) +
      T_BEST +
      h.p(`The rules differ by town, and nightly rentals are banned in most neighborhoods. ${h.a("/invest/where-to-buy/", "Where to buy a rental")} has the rule, the license and the taxes for each of the nine areas.`) },
    { h2: "When does a number become a dealbreaker?", html: (bg) =>
      h.p(`These are Chapter3's screening rules. They come from the numbers above, not from an industry standard. No published standard says what one rental house should return.`) +
      h.ol([
        `<strong>The rent does not cover the costs.</strong> Take the rent, subtract the allowance, management, property tax, insurance and dues. If nothing is left, the house loses money before any loan. ${pi.name} at the county's three-bedroom benchmark is the live example: ${fmt$(pi.fmr)} a month against a ${fmt$(pi.zhvi)} house comes up ${fmt$(Math.abs(pi.noiF))} short each year. That house only works as a bet on the price.`,
        `<strong>The return is under 2 percent with a manager.</strong> Below 2 percent, the return depends on the price rising. The metro price fell ${p1(Math.abs(metro.y3))} percent over the last three years. At the county benchmark rent, that rule flags ${belowTwoF.slice(0, -1).join(", ")} and ${belowTwoF.slice(-1)}.`,
        `<strong>The rent does not cover the loan.</strong> ${h.ext(GRIFFIN, "Lenders divide the monthly rent by the monthly cost of the loan, taxes, insurance and dues")}. Below 1.00 the rent does not cover it. ${h.ext(NEWFI, "Some lenders fund down to 0.75")} and charge for it. ${h.ext(LENDINGONE, "Most want 1.10 to 1.25 or higher")}. Divide the rent by 1.25. If the lender's monthly figure is above that, the house fails at most lenders.`,
        `<strong>A short-term rental that does not beat a lease.</strong> ${lr.name} is the example above. If the area's listings net no more than a long-term lease, the extra work of nightly guests earns nothing extra.`,
        `<strong>A projection above 50 percent occupancy in June.</strong> AirROI's measured June occupancy is 41.5 to 48.9 percent across the eight areas it covers. A projection above 50 percent in June is above the market's best month.`,
      ]) +
      T_COV +
      h.p(`The ratio decides the loan, so taxes and insurance sit inside the monthly figure the lender uses. ${h.a("/invest/strategies/dscr-loans/", "The DSCR page")} has the loan itself.`) +
      h.cta("Not sure which rule a house fails?", "Call us with the address. We run the five rules on it with local rent and the tax district, in one call.", "Call a specialized agent", TEL, bg) },
    { h2: "How do you calculate the return on one house?", html:
      h.p(`Enter the price and the rent. The tool subtracts the allowance, management, the property tax for the area, insurance and dues. It shows what is left, the return on the price, and the rent divided by each coverage ratio.`) +
      h.raw(TOOL) +
      h.p(`The tool uses the 6 percent assessment ratio and the 2025 millage for each area. The Horry County rates come from ${h.ext(ASSESSOR, "the county assessor")}. Pawleys Island uses ${h.ext(GTCALC, "the Georgetown County calculator")}, which adds $96 of fees. It assumes no flood or wind policy, no leasing fee and no capital repairs. Enter the insurance quote for the house when you have it. A lender uses its own rent estimate and its own ratio.`) },
    { h2: "How much does the price change add?", html:
      h.p(`The rent part of the return is the same each year. The price part depends on when you buy and when you sell. The chart adds the two for the Myrtle Beach city core at the typical rent, over three windows ending in July 2026.`) +
      h.raw(`<div style="max-width:640px;margin:1rem 0 1.2rem">${CHART_PARTS}</div>`) +
      T_PARTS +
      h.p(`Over ten years the price did most of the work. Over the last three it took some back. A buyer who needs the return now, not in ten years, should buy on the rent part alone and treat the price part as a possible bonus.`) +
      h.p(`${h.a("/invest/how-long-to-hold/", "How long to hold a rental before selling")} has the price history for every area. It has the worst three-year fall on record and the years it takes to get the selling costs back.`) },
  ],
  faqTitle: "Rental returns FAQ",
  faq: [
    { q: "What is a good cap rate for a rental in Myrtle Beach?", a: `With a manager and a 25 percent allowance for empty months and repairs, the typical house at the typical rent returns ${p1(zLo)} to ${p1(zHi)} percent in Horry County. Above 2 percent passes Chapter3's screen. Self-managed houses reach ${p1(zlLo)} to ${p1(zlHi)} percent. A national research firm put single-family cap rates at 7.3 percent in late 2025. Myrtle Beach returns have come from the price change and from short-term rates instead.` },
    { q: "What is a good DSCR for a Myrtle Beach rental?", a: `Most lenders want 1.10 to 1.25 or higher. Divide the monthly rent by the monthly cost of the loan, taxes, insurance and dues. At 1.25, a ${fmt$(mb.fmr)} rent supports ${fmt$(mb.fmr / 1.25)} a month for all of those together. Some lenders fund down to 0.75 and charge for it.` },
    { q: "Which Myrtle Beach area has the best rental returns?", a: `Long-term, ${cw.name} and the Myrtle Beach city core, because the houses cost less. Short-term, ${sb.name}, ${mi.name} and ${gc.name}, where the average listing earned ${fmt$(Math.min(sb.rev, mi.rev, gc.rev))} to ${fmt$(Math.max(sb.rev, mi.rev, gc.rev))} from August 2025 to July 2026.` },
    { q: "Why are rental returns lower in Myrtle Beach than the national number?", a: `The typical home value rose ${Math.round(metro.y10)} percent in ten years and rents did not keep up. A rental also pays property tax at the 6 percent ratio, which takes 1.2 to 1.6 points off the return in Horry County. The price change has made up the difference: ${p1(metro.a10)} percent a year over ten years.` },
    { q: "How much does a short-term rental make in Myrtle Beach?", a: `The average active listing in the city earned ${fmt$(mb.rev)} from August 2025 to July 2026, with ${Math.round(mb.occ)} percent of nights booked. ${sb.name} averaged ${fmt$(sb.rev)} and ${mi.name} ${fmt$(mi.rev)}. After 45 to 65 percent expenses that is ${p1(sLo)} to ${p1(sHi)} percent of the typical home value, by area.` },
    { q: "What occupancy should I expect from a Myrtle Beach Airbnb?", a: `AirROI measures ${Math.round(occLo)} to ${Math.round(occHi)} percent of nights booked across the year in the eight areas it covers. June runs 41.5 to 48.9 percent and January 23.5 to 28 percent. A projection above 50 percent in June is above the market's best month.` },
  ],
  sources: [
    { name: "Zillow home value and rent indexes", href: ZILLOW },
    { name: "AirROI market data", href: AIRROI },
    { name: "HUD fair market rents FY2027", href: FMR27 },
    { name: "Arbor, single-family rental report", href: ARBOR },
    { name: "LendingOne, DSCR guide", href: LENDINGONE },
    { name: "Newfi, DSCR requirements", href: NEWFI },
    { name: "Griffin Funding, DSCR loans", href: GRIFFIN },
    { name: "Selling Guide B3-3.8-02", href: FNMA },
    { name: "FRED, SC rental vacancy", href: FRED },
    { name: "Horry County Assessor", href: ASSESSOR },
    { name: "Georgetown County tax calculator", href: GTCALC },
  ],
  sourcesNote: "Educational only, not a loan offer and not an appraisal. Chapter3 is a real estate brokerage. Area figures are not a quote on one house.",
  bottomCta: { h2: "Have us run the five rules on a house before you offer.", p: "One call. Local rent, the tax district, the insurance quote, and the return, before the contract.", label: "Call a specialized agent", href: TEL },
  keywords: "Myrtle Beach rental returns, cap rate Myrtle Beach rental, Myrtle Beach investment property return, Grand Strand rental cap rate by area, Myrtle Beach Airbnb return, DSCR Myrtle Beach rental",
  about: "The return a rental property makes in Myrtle Beach and the Grand Strand, by area",
};
