/* /market-reports/2026-election/ - what the 2026 election means for Myrtle Beach real estate.
 * The hub of batch 2026-11-e's seven election pages.
 *
 * Version 2 (owner, 2026-11-04, after reading version 1): "we are a real estate company", "lets talk about
 * what that means for real estate", "were not reporting on who won", "im scrolling for eternity before i
 * get to anything valuable", "too much talk about bills", "mainly a wall of words", "make it dynamic ...
 * so that it is engaging and makes it easier to learn you can even use other colors just this one page".
 * So: one line of results, a short top, a picker by the reader's situation, a tax slider, a dated
 * timeline, simple animated bars, and each winner's housing plans as cards of the same size. An
 * experiment in colour and motion on this page only (class ev-*, scoped to main#main).
 *
 * Bipartisan: the same number of plan cards, the same fields and the same colour for each winner.
 * Co-authored by Devin Day (COO) and Abdulla Hijazi (CMO); names in the byline and schema only.
 * Facts: Blog-Brain batches/2026-11-e/facts.md, VERIFIED and CORRECTED rows only, at the corrected values
 * (VERIFY.md; struck list facts/election-2026-struck.json; predictions.md with VERIFY's cuts).
 * Data: data/2026-11-e/election-2026/findings.json and photos.json. Every number in a chart or the
 * calculator is read from findings.json here and checked against the ledger row.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/market-reports/2026-election/";
const SLUG = "election-2026";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), PHOTOS = read("photos.json").photos;
const must = (ok, msg) => { if (!ok) throw new Error(`election-2026.js: ${msg}`); };

/* The six sibling pages (BRIEF.md). */
const P2 = "/buyers/first-time-buyer-tax-credit/", P3 = "/buyers/flood-insurance-after-the-election/",
  P4 = "/invest/rental-property-tax-cut/", P5 = "/buyers/act-388-changes/",
  P6 = "/invest/short-term-rental-rules-statehouse/", P7 = "/invest/horry-county-growth-roads-permits/";

const pct1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r10 = (v) => "$" + (Math.round(v / 10) * 10).toLocaleString("en-US");

/* ---------------------------------------------------------------------------- */
/* Results and seats (F004, F006, F011, F012, F083), checked against the ledger.  */
const R = F.results, SH = R.state_house, SS = R.state_senate, TT = F.two_thirds;
must(R.senate.pct === 51.02 && R.governor.pct === 51.71, "F004/F006 changed");
must(SH.after.R === 79 && SH.after.D === 45 && SS.R === 34 && SS.D === 12, "F011/F012 seats changed");
must(TT.house_needed === Math.ceil(SH.seats * 2 / 3) && TT.senate_needed === Math.ceil(SS.seats * 2 / 3), "two-thirds arithmetic");
const SHORT = TT.house_needed - SH.after.R;
must(SHORT === 4 && TT.house_needed === 83 && TT.senate_needed === 31, "F083: 83 and 31, 4 short");

/* The tax on a home inside Myrtle Beach (F144-F147), 2026 levy. */
const TX = F.tax_example, M = TX.mills;
const MILLS = M.county + M.school_debt + M.school_operation + M.myrtle_beach_city;
const tax = (price, ratio, mills) => price * ratio * mills / 1000;
const T6 = tax(TX.price, 0.06, MILLS), T4 = tax(TX.price, 0.04, MILLS), TH = tax(TX.price, 0.04, MILLS - M.school_operation);
must(TX.price === 350000 && Math.abs(T6 - 5346.60) < 0.01 && Math.abs(T4 - 3564.40) < 0.01 && Math.abs(TH - 2037.00) < 0.01, "F145-F147 changed");

/* FHFA, Myrtle Beach metro, year after each election (F198-F200). */
const FH = F.fhfa;
const chg = ([, , a], [, , b]) => (b / a - 1) * 100;
const EL = FH.elections.map((e) => ({ ...e, pct: chg(e.from, e.to) }));
const WANT = { 2016: "5.6", 2018: "5.0", 2020: "21.6", 2022: "8.5", 2024: "3.0" };
for (const e of EL) must(pct1(e.pct) === WANT[e.year], `F198 ${e.year}: ${pct1(e.pct)}`);
const LATEST = chg(FH.latest.from, FH.latest.to), Y2008 = chg(FH.y2008.from, FH.y2008.to);
must(pct1(LATEST) === "0.8" && pct1(Y2008) === "-9.7", "F199/F200 changed");
const seShare = Math.max(...EL.slice(-2).flatMap((e) => [e.from[3] / e.from[2], e.to[3] / e.to[2]]), FH.latest.to[3] / FH.latest.to[2]) * 100;
must(Math.round(seShare) === 2, `standard error share ${seShare}`);

/* ---------------------------------------------------------------------------- */
/* Look: this page's own colours (owner: "you can even use other colors just this  */
/* one page"). Neither party's colour: teal for what is set, amber for a proposal,  */
/* slate for no change, coral only for a fall in prices.                          */
const CSS = "<style>"
  + "main#main{--ev-ink:#14202c;--ev-teal:#0b7a75;--ev-teal-2:#d9f1ee;--ev-amber:#b86e00;--ev-amber-2:#fff0d2;--ev-slate:#4c5866;--ev-slate-2:#e8ecf0;--ev-coral:#c8452a;--ev-sky:#eaf3fb;--ev-card:#ffffff}"
  + "main#main .detail-hero{padding-top:1rem!important;padding-bottom:.4rem!important}main#main .detail-hero .eyebrow{margin-bottom:.5rem!important}main#main .detail-hero+section{padding-top:1.6rem!important}"
  + "main#main h1.detail-h1{font-size:clamp(1.9rem,4vw,3.2rem)!important;margin-bottom:.7rem!important}main#main .detail-sub{font-size:1.08rem!important;line-height:1.55!important;margin-bottom:0!important}"
  + "main#main .detail-media{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;margin:0 0 .8rem!important;max-width:none!important}"
  + "main#main .ev-jump{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;margin:0;padding:0;list-style:none}"
  + "main#main .ev-jump li{margin:0;flex:0 0 auto}main#main .ev-jump a{display:inline-block;white-space:nowrap;text-decoration:none!important;padding:.42rem .7rem;border-radius:999px;background:var(--ev-card);border:1px solid rgba(20,32,44,.14);color:var(--ev-ink);font-family:var(--sans);font-size:.9rem;line-height:1.2;text-decoration:none;font-weight:600}"
  + "main#main .ev-jump a:hover,main#main .ev-jump a:focus-visible{background:var(--ev-teal);color:#fff;border-color:var(--ev-teal)}"
  + "main#main .ev-jump .k{font-family:var(--sans);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#8a5226;font-weight:600}"
  + "main#main nav.ev-nav{padding:0!important;margin:0!important;background:none!important;border:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-radius:0!important}"
  + "main#main nav.ev-nav::before,main#main nav.ev-nav::after,main#main figure.ev-calc::before,main#main figure.ev-calc::after{display:none!important}"
  + "main#main .ev-jump a{padding:0 .75rem!important;display:inline-flex!important;align-items:center;min-height:2.5rem;line-height:1.1!important}"
  + "main#main figure.ev-calc{background:linear-gradient(160deg,#0f2b3a,#14485a)!important;border:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:1.2rem 1.1rem 1.1rem!important;margin:1.2rem 0 1.4rem!important}"
  + "main#main figure.ev-hb{padding:1rem 1.1rem!important;margin:1.2rem 0 1.4rem!important}"
  /* tabs: a segmented control */
  + "main#main .ev-tabs{display:grid;grid-template-columns:1fr 1fr;gap:.35rem;margin:1.2rem 0 1rem;max-width:760px;padding:.35rem;border-radius:20px;background:#e4e9ee}"
  + "@media (min-width:760px){main#main .ev-tabs.n4{grid-template-columns:repeat(4,1fr)}}"
  + "main#main .ev-tabs button{display:flex;align-items:center;gap:.55rem;min-height:3.2rem;padding:.55rem .75rem;border-radius:15px;border:0;background:transparent;color:var(--ev-slate);font:600 .98rem/1.2 var(--sans);cursor:pointer;text-align:left;transition:background .25s,color .25s,box-shadow .25s}"
  + "main#main .ev-tabs button svg{flex:0 0 auto;width:1.35rem;height:1.35rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}"
  + "main#main .ev-tabs button[aria-selected=true]{background:#fff;color:var(--ev-ink);box-shadow:0 6px 16px -8px rgba(20,32,44,.45)}main#main .ev-tabs button[aria-selected=true] svg{color:var(--ev-teal)}"
  + "@media (hover:hover){main#main .ev-tabs button:hover{color:var(--ev-ink)}}"
  + "main#main .ev-tabs button:focus-visible{outline:3px solid var(--ev-teal);outline-offset:2px}"
  + "main#main.ev-js .ev-panel{animation:evIn .4s cubic-bezier(.2,.8,.2,1)}@keyframes evIn{from{opacity:.4;transform:translateY(8px)}to{opacity:1;transform:none}}"
  /* section kicker from the short label */
  + "main#main h2[data-toc]::before{content:attr(data-toc);display:block;font:700 .8rem/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:#075a56;margin-bottom:.7rem}"
  /* the number tiles in the hero */
  + "main#main .ev-dash{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin:0 0 .9rem;max-width:980px}@media (min-width:800px){main#main .ev-dash{grid-template-columns:repeat(4,1fr);gap:.75rem}}"
  + "main#main .ev-tile{position:relative;border-radius:18px;padding:.85rem .9rem .8rem;background:#fff;border:1px solid rgba(20,32,44,.08);box-shadow:0 12px 28px -20px rgba(20,32,44,.5);overflow:hidden}"
  + "main#main .ev-tile::after{content:'';position:absolute;left:0;right:0;top:0;height:4px;background:var(--ev-slate)}main#main .ev-tile.now::after{background:var(--ev-teal)}main#main .ev-tile.idea::after{background:#f0b04a}"
  + "main#main .ev-tile .b{display:block;font:700 clamp(1.6rem,5vw,2.2rem)/1.05 var(--serif);color:var(--ev-ink);margin:.1rem 0 .35rem;white-space:nowrap}"
  + "main#main .ev-tile .l{display:block;font:600 .9rem/1.3 var(--sans);color:var(--ev-ink)}main#main .ev-tile .s{display:block;font:500 .85rem/1.3 var(--sans);color:var(--ev-slate);margin-top:.2rem}"
  + "@media (max-width:699px){main#main .ev-tile{padding:.7rem .75rem}main#main .ev-tile .b{font-size:1.55rem}main#main .ev-tile .s{display:none}main#main.ev-js nav.ev-nav{display:none}}"
  /* the sticky jump bar (made by the script) */
  + "main#main section[id]{scroll-margin-top:11rem}"
  + "main#main .ev-stick{position:fixed;left:0;right:0;z-index:40;background:#faf8f4;border-bottom:1px solid rgba(20,32,44,.1);box-shadow:0 8px 20px -16px rgba(20,32,44,.5);transform:translateY(-120%);visibility:hidden;transition:transform .3s,visibility .3s;pointer-events:none}"
  + "main#main .ev-stick.on{transform:none;visibility:visible;pointer-events:auto}main#main .ev-stick ul{display:flex;gap:.35rem;margin:0 auto;padding:.5rem 16px;list-style:none;overflow-x:auto;scrollbar-width:none;max-width:1140px}main#main .ev-stick ul::-webkit-scrollbar{display:none}"
  + "main#main .ev-stick a{display:inline-flex;align-items:center;min-height:2.2rem;padding:0 .8rem;border-radius:999px;white-space:nowrap;font:600 .88rem/1 var(--sans);color:var(--ev-ink);text-decoration:none!important;transition:background .2s,color .2s}"
  + "main#main .ev-stick a.cur{background:var(--ev-ink);color:#fff}"
  /* presets on the slider */
  + "main#main .ev-pre{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 1rem}main#main .ev-pre button{min-height:2.4rem;padding:0 .85rem;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font:600 .92rem/1 var(--sans);cursor:pointer;transition:background .2s}"
  + "main#main .ev-pre button[aria-pressed=true]{background:#f4b63f;border-color:#f4b63f;color:#1d1300}main#main .ev-pre button:focus-visible{outline:3px solid #9fe3db;outline-offset:2px}"
  /* the price chart you can tap */
  + "main#main .ev-hb .r[tabindex]{cursor:pointer;border-radius:10px;padding:.15rem .3rem;margin-left:-.3rem;margin-right:-.3rem;transition:background .2s}main#main .ev-hb .r[tabindex]:hover,main#main .ev-hb .r.sel{background:#eef3f6}main#main .ev-hb .r[tabindex]:focus-visible{outline:3px solid var(--ev-teal)}"
  + "main#main .ev-read{margin:.8rem 0 0;padding:.7rem .85rem;border-radius:12px;background:var(--ev-teal-2);color:#073f3c;font:600 1rem/1.45 var(--sans)}"
  /* the quiz */
  + "main#main .ev-quiz{max-width:760px;margin:1.4rem 0;padding:1.1rem;border-radius:20px;background:linear-gradient(160deg,#0f2b3a,#14485a);color:#fff}"
  + "main#main .ev-quiz .hd{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin:0 0 .8rem;font:700 .8rem/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:#9fe3db}main#main .ev-quiz .hd b{font-size:1rem;letter-spacing:0;text-transform:none;color:#f4b63f}"
  + "main#main .ev-q{padding:.85rem 0;border-top:1px solid rgba(255,255,255,.14)}main#main .ev-q .q{margin:0 0 .6rem;font:600 1.05rem/1.4 var(--sans);color:#fff}"
  + "main#main .ev-q .o{display:flex;gap:.5rem}main#main .ev-q button{flex:1;min-height:2.8rem;border-radius:12px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font:700 1rem/1 var(--sans);cursor:pointer;transition:background .2s,border-color .2s}"
  + "main#main .ev-q button.ok{background:#1aa391;border-color:#1aa391}main#main .ev-q button.no{background:#c8452a;border-color:#c8452a}main#main .ev-q button:disabled{cursor:default}main#main .ev-q button:focus-visible{outline:3px solid #f4b63f;outline-offset:2px}"
  + "main#main .ev-q .a{margin:.6rem 0 0;line-height:1.55;color:#e6f2f5}main#main.ev-js .ev-q:not(.done) .a{display:none}main#main .ev-q .a b{color:#f4b63f}"
  + "main#main .ev-panel{max-width:760px}main#main .ev-panel>h3{font-family:var(--sans);font-size:1.05rem;color:var(--ev-ink);margin:1.4rem 0 .6rem}"
  + "main#main.ev-js .ev-panel>h3{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}"
  + "main#main .ev-grid{display:grid;grid-template-columns:1fr;gap:.8rem}@media (min-width:700px){main#main .ev-grid{grid-template-columns:1fr 1fr}}"
  + "main#main .ev-card{position:relative;background:var(--ev-card);border-radius:18px;padding:1.05rem 1.15rem 1.05rem 1.3rem;border:1px solid rgba(20,32,44,.08);box-shadow:0 14px 30px -24px rgba(20,32,44,.55);overflow:hidden}"
  + "@media (hover:hover){main#main .ev-card,main#main.ev-js .ev-card.ev-rise.ev-on{transition:transform .25s,box-shadow .25s}main#main .ev-card:hover,main#main.ev-js .ev-card.ev-rise.ev-on:hover{transform:translateY(-3px);box-shadow:0 22px 40px -24px rgba(20,32,44,.6)}}"
  + "main#main .ev-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--ev-slate)}"
  + "main#main .ev-card.now::before{background:var(--ev-teal)}main#main .ev-card.idea::before{background:var(--ev-amber)}"
  + "main#main .ev-pill{display:inline-block;font:700 .78rem/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;padding:.38rem .6rem;border-radius:999px;background:var(--ev-slate-2);color:var(--ev-slate);margin-bottom:.55rem}"
  + "main#main .now .ev-pill{background:var(--ev-teal-2);color:#075a56}main#main .idea .ev-pill{background:var(--ev-amber-2);color:#7a4900}"
  + "main#main .ev-card strong.t{display:block;font-family:var(--sans);font-size:1.08rem;line-height:1.3;color:var(--ev-ink);margin-bottom:.35rem}"
  + "main#main .ev-card p{margin:0 0 .4rem;line-height:1.6;color:var(--ev-ink);font-size:1rem}main#main .ev-card p:last-child{margin-bottom:0}"
  + "main#main .ev-card a{color:var(--ev-teal);font-weight:600}main#main .ev-card q{font-style:italic;quotes:'\\201C' '\\201D'}"
  + "main#main .ev-card .w{color:var(--ev-slate);font-size:.95rem}"
  + "main#main .ev-key{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin:.2rem 0 .4rem;font:600 1rem/1.5 var(--sans);color:var(--ev-slate)}"
  + "main#main .ev-key span::before{content:'';display:inline-block;width:.8rem;height:.8rem;border-radius:3px;margin-right:.35rem;vertical-align:-1px;background:var(--ev-slate)}"
  + "main#main .ev-key .now::before{background:var(--ev-teal)}main#main .ev-key .idea::before{background:var(--ev-amber)}"
  /* calculator */
  + "main#main .ev-calc{max-width:760px;margin:1.2rem 0 1.4rem;padding:1.2rem 1.1rem 1.1rem;border-radius:20px;background:linear-gradient(160deg,#0f2b3a,#14485a);color:#fff;box-shadow:0 24px 50px -30px rgba(15,43,58,.9)}"
  + "main#main .ev-calc .k{font:700 .78rem/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:#9fe3db;margin-bottom:.7rem}"
  + "main#main .ev-calc label{display:block;font:600 1rem/1.4 var(--sans);color:#fff}"
  + "main#main .ev-calc .val{display:block;font:700 2rem/1.15 var(--serif);color:#fff;margin:.2rem 0 .4rem}"
  + "main#main .ev-calc input[type=range]{width:100%;accent-color:#f4b63f;height:2rem;margin:0 0 .8rem}"
  + "main#main .ev-bar{margin:0 0 .75rem}main#main .ev-bar .lab{display:flex;justify-content:space-between;gap:.6rem;font:600 .95rem/1.35 var(--sans);color:#e6f2f5;margin-bottom:.3rem}"
  + "main#main .ev-bar .lab b{color:#fff;font-size:1.05rem;white-space:nowrap}"
  + "main#main .ev-bar .tr{height:14px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden}"
  + "main#main .ev-bar .fl{height:100%;border-radius:999px;background:#9fb3bf;transition:width .5s cubic-bezier(.2,.8,.2,1)}"
  + "main#main .ev-bar.a .fl{background:#f4b63f}main#main .ev-bar.c .fl{background:#5fd3c6}"
  + "main#main .ev-save{margin:.9rem 0 0;padding:.8rem .9rem;border-radius:14px;background:rgba(255,255,255,.1);font:600 1.02rem/1.45 var(--sans);color:#fff}"
  + "main#main .ev-save b{color:#f4b63f;font-size:1.2rem}main#main .ev-calc .n{font-size:1rem;color:#c5d6dd;margin:.7rem 0 0;line-height:1.5}"
  /* steps (what has to happen first) */
  + "main#main .ev-steps{list-style:none;margin:1rem 0 1.4rem;padding:0;max-width:760px;counter-reset:s}"
  + "main#main .ev-steps li{position:relative;padding:.1rem 0 1rem 3rem;line-height:1.55;color:var(--ev-ink);counter-increment:s}"
  + "main#main .ev-steps li::before{content:counter(s);position:absolute;left:0;top:0;width:2.1rem;height:2.1rem;border-radius:50%;background:var(--ev-ink);color:#fff;font:700 1rem/2.1rem var(--sans);text-align:center}"
  + "main#main .ev-steps li strong{display:block;font-family:var(--sans)}"
  + "main#main .ev-meter{display:flex;align-items:center;gap:1rem;max-width:760px;margin:1rem 0 1.2rem;padding:1rem 1.1rem;border-radius:16px;background:var(--ev-amber-2)}"
  + "main#main .ev-meter .big{font:700 3rem/1 var(--serif);color:#7a4900;min-width:3.2rem;text-align:center}"
  + "main#main .ev-meter p{margin:0;line-height:1.5;color:var(--ev-ink)}"
  /* short run and long run */
  + "main#main .ev-runs{list-style:none;padding:0;display:grid;grid-template-columns:1fr;gap:.8rem;max-width:760px;margin:1rem 0 1.4rem}@media (min-width:700px){main#main .ev-runs{grid-template-columns:1fr 1fr}}"
  + "main#main .ev-run{border-radius:16px;padding:1rem 1.1rem;background:var(--ev-sky);border:1px solid rgba(20,32,44,.08)}"
  + "main#main .ev-run .h{display:block;font:700 .8rem/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:#1d5c8f;margin-bottom:.5rem}"
  + "main#main .ev-run p{margin:0 0 .4rem;line-height:1.6;color:var(--ev-ink)}main#main .ev-run p:last-child{margin:0}"
  /* horizontal bars (credit size, prices) */
  + "main#main .ev-hb{max-width:760px;margin:1.2rem 0 1.4rem;padding:1rem 1.1rem;border-radius:18px;background:var(--ev-card);border:1px solid rgba(20,32,44,.1)}"
  + "main#main .ev-hb .cap{font:700 1.02rem/1.4 var(--sans);color:var(--ev-ink);margin:0 0 .8rem}"
  + "main#main .ev-hb .r{display:grid;grid-template-columns:7.2rem 1fr;align-items:center;gap:.6rem;margin:0 0 .55rem}"
  + "main#main .ev-hb .r>span{font:600 .92rem/1.25 var(--sans);color:var(--ev-ink)}"
  + "main#main .ev-hb .tr{position:relative;height:1.9rem;border-radius:8px;background:var(--ev-slate-2)}"
  + "main#main .ev-hb .fl{position:absolute;left:0;top:0;bottom:0;border-radius:8px;background:var(--ev-teal);transition:width .9s cubic-bezier(.2,.8,.2,1)}"
  + "main#main .ev-hb .fl.c{background:var(--ev-coral)}main#main .ev-hb .fl.s{background:#7d8a97}main#main .ev-hb .fl.a{background:#f0b04a}"
  + "main#main .ev-hb .v{position:absolute;left:.55rem;top:0;line-height:1.9rem;font:700 .95rem/1.9rem var(--sans);color:var(--ev-ink);white-space:nowrap}"
  + "main#main .ev-hb .fl+.v.in{color:#fff}main#main .ev-hb .fl.a+.v.in{color:#2b1a00}main#main .ev-hb .note{max-width:640px;font-size:1rem;color:var(--ev-slate);line-height:1.5;margin:.6rem 0 0}"
  + "main#main.ev-js .ev-hb:not(.ev-on) .fl{width:0!important}"
  /* timeline */
  + "main#main .ev-time{position:relative;list-style:none;margin:1.2rem 0 1.4rem;padding:0;max-width:760px}main#main .ev-time::before,main#main .ev-time .ev-tf{content:'';position:absolute;left:calc(1.1rem - 1.5px);top:.6rem;bottom:1.6rem;width:3px;border-radius:3px;background:rgba(20,32,44,.13)}main#main .ev-time .ev-tf{bottom:auto;height:0;background:var(--ev-teal);transition:height .15s linear}"
  + "main#main .ev-time li{position:relative;margin:0;padding:0 0 1rem 2.4rem}"
  + "main#main .ev-time li::before{content:'';position:absolute;left:.55rem;top:.35rem;width:1.1rem;height:1.1rem;border-radius:50%;background:var(--ev-teal);box-shadow:0 0 0 5px var(--ev-teal-2)}"
  + "main#main .ev-time li.idea::before{background:var(--ev-amber);box-shadow:0 0 0 5px var(--ev-amber-2)}"
  + "main#main .ev-time li::before{z-index:1;transition:transform .3s}main#main.ev-js .ev-time li:not(.on)::before{background:#fff;box-shadow:0 0 0 3px rgba(20,32,44,.2)}main#main .ev-time li.on::before{transform:scale(1.1)}"
  + "main#main .ev-time .c{background:var(--ev-card);border:1px solid rgba(20,32,44,.1);border-radius:14px;padding:.75rem .95rem}"
  + "main#main .ev-time .d{margin:0;font-family:var(--sans);color:var(--ev-ink);line-height:1.4}"
  + "main#main .ev-time .d b{display:block;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;color:#075a56}main#main .ev-time li.idea .d b{color:#7a4900}"
  + "main#main .ev-time .d span{display:block;font-weight:600;font-size:1.05rem}"
  + "main#main .ev-time .c p:not(.d){margin:.5rem 0 0;line-height:1.6;color:var(--ev-ink)}"
  + "main#main .ev-tab{width:100%;max-width:760px;border-collapse:collapse;font-family:var(--sans);font-size:1rem;color:var(--ev-ink);margin:0 0 1.4rem}main#main .ev-tab caption{text-align:left;font-weight:700;padding:0 0 .5rem;line-height:1.4}"
  + "main#main .ev-tab th,main#main .ev-tab td{padding:.55rem .45rem;border-bottom:1px solid rgba(20,32,44,.12);text-align:right;white-space:nowrap}main#main .ev-tab th:first-child,main#main .ev-tab td:first-child{text-align:left}main#main .ev-tab thead th{font-size:.85rem;border-bottom:2px solid var(--ev-ink);white-space:normal;vertical-align:bottom}"
  + "@media (max-width:420px){main#main .ev-tab{font-size:.92rem}main#main .ev-tab th,main#main .ev-tab td{padding:.5rem .25rem}}"
  /* plans */
  + "main#main .ev-who{display:flex;gap:.5rem;margin:1.2rem 0 1rem;max-width:760px}main#main .ev-who button{flex:1}"
  + "main#main .ev-plans .ev-card::before{background:var(--ev-ink)}main#main .ev-plans .ev-pill{background:var(--ev-slate-2);color:var(--ev-ink)}"
  + "main#main .ev-plans .num{position:absolute;right:.9rem;top:.8rem;font:700 1.4rem/1 var(--serif);color:rgba(20,32,44,.18)}"
  + "main#main .ev-more{max-width:760px;margin:1rem 0 .4rem;border-radius:14px;background:var(--ev-slate-2);padding:.75rem .95rem}"
  + "main#main .ev-more .h{margin:0;font:700 1rem/1.4 var(--sans);color:var(--ev-ink)}main#main .ev-more ul{margin:.6rem 0 0 1.1rem;padding:0}main#main .ev-more li{margin:0 0 .45rem;line-height:1.55;color:var(--ev-ink)}"
  /* motion */
  + "main#main.ev-js .ev-rise{transform:translateY(16px);transition:transform .55s cubic-bezier(.2,.8,.2,1)}main#main.ev-js .ev-rise.ev-on{transform:none}"
  + "@media (prefers-reduced-motion:reduce){main#main.ev-js .ev-rise{transform:none;transition:none}main#main .ev-bar .fl,main#main .ev-hb .fl,main#main .ev-tabs button{transition:none}}"
  + "</style>";

/* The page script: tabs, the slider, and bars that grow when they come into view. All text is in the
   HTML; without the script every panel shows and every bar is drawn at full length. Stores nothing. */
const MAXP = 1000000, MINP = 150000;
const SCRIPT = `<script>(function(){var d=document,root=d.getElementById("main");if(!root)return;root.className+=" ev-js";`
  + `[].forEach.call(d.querySelectorAll("[data-ev-tabs]"),function(g){var bs=g.querySelectorAll("[role=tab]");function show(b){[].forEach.call(bs,function(x){var on=x===b;x.setAttribute("aria-selected",on?"true":"false");x.tabIndex=on?0:-1;var p=d.getElementById(x.getAttribute("aria-controls"));if(p)p.hidden=!on;if(on&&p)[].forEach.call(p.querySelectorAll(".ev-rise"),function(e){e.classList.add("ev-on")})})}`
  + `[].forEach.call(bs,function(b,i){b.addEventListener("click",function(){show(b)});b.addEventListener("keydown",function(e){var k=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(k){var n=bs[(i+k+bs.length)%bs.length];n.focus();show(n)}})});show(bs[0])});`
  + `var s=d.getElementById("evPrice");if(s){var m=${MILLS},so=${M.school_operation},top=${MAXP}*0.06*m/1000,f=function(x){return "$"+(Math.round(x/10)*10).toLocaleString("en-US")};`
  + `var up=function(){var v=+s.value,a=v*0.06*m/1000,b=v*0.04*m/1000,c=v*0.04*(m-so)/1000;d.getElementById("evV").textContent="$"+v.toLocaleString("en-US");`
  + `[["evSix",a],["evFour",b],["evHome",c]].forEach(function(p){d.getElementById(p[0]).textContent=f(p[1]);d.getElementById(p[0]+"B").style.width=(p[1]/top*100).toFixed(1)+"%"});`
  + `d.getElementById("evSave").textContent=f(a-b)+" to "+f(a-c)};s.addEventListener("input",up);up()}`
  + `var pre=d.querySelectorAll(".ev-pre button");[].forEach.call(pre,function(b){b.addEventListener("click",function(){s.value=b.getAttribute("data-v");s.dispatchEvent(new Event("input"))})});`
  + `if(s)s.addEventListener("input",function(){[].forEach.call(pre,function(b){b.setAttribute("aria-pressed",b.getAttribute("data-v")===s.value?"true":"false")})});`
  + `[].forEach.call(d.querySelectorAll(".ev-hb"),function(f){var rd=f.querySelector(".ev-read");if(!rd)return;var rs=f.querySelectorAll(".r[data-say]");[].forEach.call(rs,function(r){var go=function(){[].forEach.call(rs,function(x){x.classList.toggle("sel",x===r)});rd.textContent=r.getAttribute("data-say")};r.addEventListener("click",go);r.addEventListener("mouseenter",go);r.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}})})});`
  + `var sc=d.getElementById("evScore"),qn=0,qr=0,qs=d.querySelectorAll(".ev-q");[].forEach.call(qs,function(q){var bs=q.querySelectorAll("button");[].forEach.call(bs,function(b){b.addEventListener("click",function(){var ok=b.getAttribute("data-v")===q.getAttribute("data-a");b.classList.add(ok?"ok":"no");[].forEach.call(bs,function(x){x.disabled=true;if(x.getAttribute("data-v")===q.getAttribute("data-a"))x.classList.add("ok")});q.classList.add("done");qn++;if(ok)qr++;if(sc)sc.textContent=qr+" of "+qn+" right"})})});`
  + `var dd=d.querySelector("[data-ev-days]");if(dd){var t=new Date(dd.getAttribute("data-ev-days")+"T00:00:00"),n=Math.ceil((t-new Date())/864e5);if(n>1)dd.textContent=n+" days away, before the new senator takes office";else if(n===1)dd.textContent="Tomorrow"}`
  + `var cnt=function(e){var to=parseFloat(e.getAttribute("data-ev-count")),dc=+(e.getAttribute("data-ev-dec")||0),t0=null;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var st=function(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/900),v=to*(1-Math.pow(1-k,3));e.textContent=dc?v.toFixed(dc):Math.round(v).toLocaleString("en-US");if(k<1)requestAnimationFrame(st)};requestAnimationFrame(st)};[].forEach.call(d.querySelectorAll("[data-ev-count]"),cnt);`
  + `var tl=d.querySelector(".ev-time");if(tl){var tf=d.createElement("span");tf.className="ev-tf";tf.setAttribute("aria-hidden","true");tl.insertBefore(tf,tl.firstChild);var lis=tl.querySelectorAll("li");var tick=function(){var r=tl.getBoundingClientRect(),y=innerHeight*0.6-r.top,h=Math.max(0,Math.min(r.height-26,y));tf.style.height=h+"px";[].forEach.call(lis,function(li){li.classList.toggle("on",li.offsetTop+10<=h)})};addEventListener("scroll",tick,{passive:true});tick()}`
  + `var jn=d.querySelector(".ev-jump");if(jn){var bar=d.createElement("div");bar.className="ev-stick";bar.innerHTML="<ul>"+[].map.call(jn.querySelectorAll("a"),function(a){return '<li><a href="'+a.getAttribute("href")+'">'+a.textContent+"</a></li>"}).join("")+"</ul>";root.appendChild(bar);var hd=d.querySelector("header"),bl=bar.querySelectorAll("a"),ids=[].map.call(bl,function(a){return a.getAttribute("href").slice(1)});`
  + `var spy=function(){var top=hd?Math.max(0,hd.getBoundingClientRect().bottom):0;bar.style.top=top+"px";var an=jn.offsetParent?jn:d.querySelector(".ev-dash");bar.classList.toggle("on",!!an&&an.getBoundingClientRect().bottom<top);var cur=-1;ids.forEach(function(id,i){var el=d.getElementById(id);if(el&&el.getBoundingClientRect().top<top+140)cur=i});[].forEach.call(bl,function(a,i){var on=i===cur;if(on&&!a.classList.contains("cur")){var u=bar.firstChild;u.scrollLeft=a.offsetLeft-u.clientWidth/2+a.clientWidth/2}a.classList.toggle("cur",on)})};addEventListener("scroll",spy,{passive:true});addEventListener("resize",spy);spy()}`
  + `var els=root.querySelectorAll(".ev-hb,.ev-rise");if(!("IntersectionObserver" in window)){[].forEach.call(els,function(e){e.classList.add("ev-on")});return}`
  + `var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("ev-on");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});[].forEach.call(els,function(e){io.observe(e)});`
  + `setTimeout(function(){[].forEach.call(els,function(e){var r=e.getBoundingClientRect();if(r.top<innerHeight)e.classList.add("ev-on")})},60)})();</script>`;

/* ---------------------------------------------------------------------------- */
/* Pieces.                                                                         */
const card = (kind, pill, title, body) => `<div class="ev-card ${kind} ev-rise"><span class="ev-pill">${pill}</span><strong class="t">${title}</strong>${[].concat(body).map((p) => `<p>${p}</p>`).join("")}</div>`;
const tabs = (id, label, items) => `<div data-ev-tabs><div class="ev-tabs n${items.length}" role="tablist" aria-label="${label}">`
  + items.map((t, i) => `<button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" aria-selected="${i === 0}">${ic(t.icon)}<span>${t.tab}</span></button>`).join("")
  + `</div>${items.map((t, i) => `<div class="ev-panel" role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}"><h3>${t.h3}</h3>${t.html}</div>`).join("")}</div>`;
const ICONS = {"home": "<path d=\"M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>", "tag": "<path d=\"M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.5\"/>", "key": "<circle cx=\"7.5\" cy=\"15.5\" r=\"4.5\"/><path d=\"M10.7 12.3L21 2M16 7l3 3M18.5 4.5l2 2\"/>", "build": "<path d=\"M2 21h20M4 21V9l8-6 8 6v12M9 21v-6h6v6\"/>", "person": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>"};
const ic = (k) => k ? `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>` : "";
const KEY = `<p class="ev-key"><span class="now">Set to happen</span><span class="idea">A proposal, not law</span><span>No change</span></p>`;

/* V1: the picker. Four situations, each a set of cards. */
const PICK = tabs("evr", "Pick your situation", [
  { tab: "I'm buying", icon: "home", h3: "If you are buying", html: `<div class="ev-grid">`
    + card("now", "Dec. 11", "Flood insurance can lapse", [`If Congress does not extend the federal flood program by Dec. 11, it cannot write new policies. A loan on a house in a high-risk flood zone can then wait.`, `Our agents check a house's flood zone and its tax ratio before you make an offer. ${h.a(P3, "What a lapse does")}`])
    + card("idea", "Proposal", "A $50,000 first-time buyer credit", [`Annie Andrews backs one. It has had no vote in Congress, so plan a purchase this winter without it. ${h.a(P2, "What the last credit did")}`])
    + card("now", "Jan. 7", "Big investors hit a limit", [`A company that controls 350 or more houses may not buy more, with some exceptions. A family buying one rental is not affected.`])
    + card("", "No change", "A rental or second home pays the higher tax", [`It is taxed on 6 percent of its value. A home you live in is taxed on 4 percent. Price a second home on today's bill.`])
    + `</div>` },
  { tab: "I'm selling", icon: "tag", h3: "If you are selling", html: `<div class="ev-grid">`
    + card("", "No change", "Prices are about flat", [`Prices here rose about ${pct1(LATEST)} percent in the latest year. We price your home from this year's sales of homes like it. ${h.a("#prices", "Prices after past elections")}`])
    + card("now", "Dec. 11", "A buyer's closing can slip", [`If your house is in a high-risk flood zone and your buyer needs a loan, a lapse can delay the closing. A private flood policy can count if it meets federal rules.`])
    + card("", "No change", "The tax on your gain", [`Up to $250,000 of gain on a home you lived in stays out of federal income tax, or $500,000 for certain married couples. Neither winner's plan changes it.`])
    + card("idea", "Proposal", "Lower taxes for rental buyers", [`If the tax on rentals fell, a buyer of a rental or second home would pay less each year. ${h.a("#rental-tax", "Try the tax slider")}`])
    + `</div>` },
  { tab: "I own a rental or second home", icon: "key", h3: "If you own a rental or second home", html: `<div class="ev-grid">`
    + card("idea", "Proposal", "A lower property tax", [`Alan Wilson wants to cut the higher tax on rentals. At 4 percent, a ${money(TX.price)} rental in Myrtle Beach would pay about ${r10(T6 - T4)} less a year. ${h.a("#rental-tax", "Try your price")}`])
    + card("", "No change", "Flood premiums keep rising", [`On a second home with a discounted federal flood rate, the rate rises 25 percent a year until it reaches the full-risk rate. That is current law.`])
    + card("", "No change", "Short-term rental rules", [`We found no statement on short-term rentals from either winner. City zoning still decides where they are allowed. ${h.a(P6, "What the statehouse could change")}`])
    + card("now", "Jan. 7", "The investor limit", [`It applies only to companies with 350 or more houses. Andrews wants it cut to 50.`])
    + `</div>` },
  { tab: "I'm building or buying new", icon: "build", h3: "If you are building or buying new", html: `<div class="ev-grid">`
    + card("idea", "Proposal", "Faster permits", [`Wilson wants building permits for new homes to move faster. Horry County issued permits for 6,418 new single-family homes in 2025. ${h.a(P7, "Building in Horry County")}`])
    + card("idea", "Proposal", "Cheaper materials and builder tax cuts", [`Andrews wants to end tariffs the president imposes alone, naming building materials, and to cut taxes for home builders.`])
    + card("", "No change", "Impact fees", [`A new home of about 1,500 square feet pays $1,615 in county impact fees. County Council decides them, not the new governor or senator.`])
    + card("idea", "Proposal", "Faster roads, and I-73", [`Both winners talk about roads. Funding for most of I-73's $1.6 billion cost has not been identified.`])
    + `</div>` },
]);

/* V2: the rental tax slider (F144-F147). */
const w = (v) => (v / tax(MAXP, 0.06, MILLS) * 100).toFixed(1) + "%";
const CALC = `<figure class="ev-calc" id="evCalc"><div class="k">Try it: the tax on a rental inside Myrtle Beach</div>`
  + `<label for="evPrice">The county's value of the home<span class="val" id="evV">${money(TX.price)}</span></label>`
  + `<input id="evPrice" type="range" min="${MINP}" max="${MAXP}" step="10000" value="${TX.price}" aria-label="The county's value of the home, in dollars"><div class="ev-pre" role="group" aria-label="Quick prices">${[250000, 350000, 500000, 750000].map((v) => `<button type="button" data-v="${v}" aria-pressed="${v === TX.price}">$${v / 1000}k</button>`).join("")}</div>`
  + `<div class="ev-bar"><div class="lab"><span>Today, taxed at 6 percent</span><b id="evSix">${r10(T6)}</b></div><div class="tr"><div class="fl" id="evSixB" style="width:${w(T6)}"></div></div></div>`
  + `<div class="ev-bar a"><div class="lab"><span>If rentals moved to 4 percent</span><b id="evFour">${r10(T4)}</b></div><div class="tr"><div class="fl" id="evFourB" style="width:${w(T4)}"></div></div></div>`
  + `<div class="ev-bar c"><div class="lab"><span>Taxed like a home you live in</span><b id="evHome">${r10(TH)}</b></div><div class="tr"><div class="fl" id="evHomeB" style="width:${w(TH)}"></div></div></div>`
  + `<p class="ev-save">A cut would save about <b id="evSave">${r10(T6 - T4)} to ${r10(T6 - TH)}</b> a year.</p>`
  + `<p class="n">Yearly tax, from Horry County's 2026 tax rates for the county, schools and the city of Myrtle Beach. Before credits, fees and any special district.</p></figure>`;

/* The same arithmetic at three prices, as a table (A6). */
const TAXTAB = `<table class="ev-tab"><caption>Yearly tax on a rental inside Myrtle Beach</caption><thead><tr><th scope="col">County's value</th><th scope="col">Today, 6%</th><th scope="col">At 4%</th><th scope="col">Like a home you live in</th></tr></thead><tbody>`
  + [250000, 350000, 500000].map((v) => `<tr><td>${money(v)}</td><td>${r10(tax(v, 0.06, MILLS))}</td><td>${r10(tax(v, 0.04, MILLS))}</td><td>${r10(tax(v, 0.04, MILLS - M.school_operation))}</td></tr>`).join("")
  + `</tbody></table>`;

const METER = `<div class="ev-meter ev-rise"><span class="big">${SHORT}</span><p><strong>More House votes needed beyond every Republican.</strong> The change takes ${TT.house_needed} of ${SH.seats} House votes and ${TT.senate_needed} of ${SS.seats} Senate votes. Republicans won ${SH.after.R} House seats in the unofficial count and hold ${SS.R} in the Senate.</p></div>`;

const runs = (short, long) => `<ul class="ev-runs"><li class="ev-run ev-rise"><span class="h">Next 1 to 2 years</span>${short.map((p) => `<p>${p}</p>`).join("")}</li><li class="ev-run ev-rise"><span class="h">5 years and more</span>${long.map((p) => `<p>${p}</p>`).join("")}</li></ul>`;

/* V3: credit size (F106, F102). */
const hbar = (cap, rows, note, read) => `<figure class="ev-hb"><figcaption class="cap">${cap}</figcaption>${rows.map((r) => `<div class="r"${r.say ? ` tabindex="0" role="button" data-say="${r.say}"` : ""}><span>${r.name}</span><div class="tr"><div class="fl ${r.cls || ""}" style="width:${r.w}"></div><span class="v${r.inside ? " in" : ""}"${r.inside ? "" : ` style="left:calc(${r.w} + .45rem)"`}>${r.text}</span></div></div>`).join("")}${read ? `<p class="ev-read" aria-live="polite">${read}</p>` : ""}${note ? `<p class="note">${note}</p>` : ""}</figure>`;
const CREDIT = hbar("The largest first-time buyer credit, then and proposed", [
  { name: "2008 to 2010, paid", w: "16%", text: "$8,000", cls: "s" },
  { name: "Proposed now", w: "100%", text: "$50,000", cls: "a", inside: true },
], "The proposed credit is about six times the old one.");

/* V4: prices after each election (F198-F200). Scale: the largest change fills the bar. */
const PMAX = Math.max(...EL.map((e) => e.pct));
const pw = (v) => (Math.abs(v) / PMAX * 100).toFixed(1) + "%";
const PRICES = hbar("Change in Myrtle Beach-area home prices in the year after each election", [
  { name: "2008", w: pw(Y2008), text: `${pct1(Y2008).replace("-", "−")}%`, cls: "c", say: `After the 2008 election, in the housing slump, prices fell ${pct1(-Y2008)} percent in a year.` },
  ...EL.map((e) => ({ name: String(e.year), w: pw(e.pct), text: `+${pct1(e.pct)}%`, inside: e.pct === PMAX, say: `After the ${e.year} ${e.kind === "midterm" ? "midterm" : "presidential"} election, prices rose ${pct1(e.pct)} percent${e.pct === PMAX ? ", the largest rise" : ""}.` })),
  { name: "Latest year", w: pw(LATEST), text: `+${pct1(LATEST)}%`, cls: "s", say: `In the latest year, to mid-2026, prices rose ${pct1(LATEST)} percent, about flat.` },
], `Federal Housing Finance Agency house price index, Myrtle Beach, Conway and North Myrtle Beach metro area, from the last quarter of each election year to a year later. The latest year runs to mid-2026. FHFA's margin of error is about ${Math.round(seShare)} percent, so the +3.0% and +0.8% changes may be no change at all.`, "Tap a year to see what happened.");

/* V5: the dates (F120-F124, F100/F101, F084, WBTV). */
const TIMELINE = `<ol class="ev-time">`
  + `<li class="ev-rise"><div class="c"><p class="d"><b>Dec. 11, 2026</b><span>Federal flood insurance can lapse</span></p><p>Unless Congress extends it, the program cannot write new policies. A loan on a house in a high-risk flood zone can then wait for the program to return, or for a private policy that meets federal rules.</p><p>It has happened before. In June 2010, over 1,400 closings a day were canceled or delayed across the country, by one estimate. The longest recent lapse ran from Oct. 1 to Nov. 12, 2025. Every lapse so far ended with Congress restoring the program. ${h.a(P3, "Flood insurance after the election")}</p></div></li>`
  + `<li class="ev-rise"><div class="c"><p class="d"><b>Jan. 3, 2027</b><span>Annie Andrews takes her Senate seat</span></p><p>Her housing plans need a vote of the House and the Senate and the president's signature. The flood deadline comes before she takes office.</p></div></li>`
  + `<li class="ev-rise"><div class="c"><p class="d"><b>Jan. 7, 2027</b><span>The limit on big investors starts</span></p><p>A company that controls 350 or more single-family houses may not buy more, with some exceptions. It became law in July. Andrews wants the number cut to 50.</p></div></li>`
  + `<li class="ev-rise idea"><div class="c"><p class="d"><b>November 2028</b><span>The earliest voters could change the rental tax in the constitution</span></p><p>The other path to a lower rental tax is an amendment to the state constitution. It needs two-thirds of each chamber, then a yes from voters, then a second vote of the legislature.</p></div></li>`
  + `</ol>`;

/* V6: the plans, the same seven fields for each winner. */
const plan = (n, title, words, touch, needs) => `<div class="ev-card ev-rise"><span class="num">${n}</span><span class="ev-pill">${needs}</span><strong class="t">${title}</strong>${words ? `<p class="w">In their words: ${words}</p>` : ""}<p>${touch}</p></div>`;
const ANDREWS = [
  ["A $50,000 tax credit for first-time buyers", `<q>a $50,000 tax cut to help first-time homebuyers</q>`, `Helps with a down payment. It has had no vote. ${h.a(P2, "More")}`],
  ["Cut the investor limit from 350 houses to 50", `<q>We should cut that threshold down several times to 50 homes.</q>`, "Fewer large companies could keep buying houses."],
  ["Keep Wall Street off Fannie Mae and Freddie Mac loans", `<q>ban these Wall Street interests from using Fannie Mae and Freddie Mac mortgages to buy up housing</q>`, "Large investors would lose those loans for buying homes."],
  ["Tax cuts for home builders", `<q>provide tax cuts to homebuilders to incentivize more construction</q>`, `Aimed at more new homes and more workforce housing. ${h.a(P7, "More")}`],
  ["End tariffs the president imposes alone", `<q>end chaotic and unilateral tariffs</q>`, "She names home building materials, which are part of the cost of a new home."],
  ["Fix roads and bridges", `<q>Fix and modernize South Carolina's roads, bridges, and highways</q>`, "She named no project and no I-73 plan."],
  ["Homeowners insurance", "", "She held a roundtable on rising homeowners insurance. She has no written plan for it."],
];
const WILSON = [
  ["Lower the higher tax on rentals", `<q>reforming how we assess property taxes on those types of properties</q>, meaning Act 388`, `Every rental and second home here pays it. He has published no bill. ${h.a("#rental-tax", "Try the slider")}`],
  ["Sign seniors up for the homestead exemption", "", "Seniors would get the lower tax on their own home without applying, as reported."],
  ["A bigger homestead exemption for disabled veterans", "", "A lower tax on a disabled veteran's own home, as reported."],
  ["End the car tax for seniors and veterans", `<q>He will work to eliminate the car property tax for seniors and veterans</q>`, "Their yearly tax on cars would end."],
  ["Faster permits for new homes", `<q>make it easier for homes to be built, which lowers the cost of those homes</q>`, `Shorter waits to start building. ${h.a(P7, "More")}`],
  ["Build roads faster", `<q>we need to cut down the time it takes to build a road or a bridge</q>`, "Projects such as I-73. Funding for most of its cost has not been identified."],
  ["Public audits of insurance rate increases", "", `Homeowners insurance only. Flood insurance is federal, so it is not part of this plan. ${h.a(P3, "More")}`],
];
must(ANDREWS.length === WILSON.length, "bipartisan: the same number of plan cards");
const grid = (rows, needs) => `<div class="ev-grid ev-plans">${rows.map((r, i) => plan(i + 1, r[0], r[1], r[2], i === 0 && needs.first ? needs.first : needs.all)).join("")}</div>`;
const OTHER_A = `<div class="ev-more"><p class="h">Her other plans, with no direct tie to a home</p><ul>`
  + ["A two-year national pause on AI data centers, with no data center costs passed on to power bills.", "Three income tax brackets of 10, 20 and 35 percent, and no tax rise for families under $500,000.",
     "Health care: reverse federal Medicaid cuts, expand Medicaid here, restore marketplace premium help, and add a public option.", "Drug prices: imports from Canada, a $35 insulin cap for every insured patient, and more prices that Medicare negotiates.",
     "Families: child care apprenticeships, a larger child tax credit, higher wages and paid family leave.", "Taxes: end breaks for the highest earners and for moving jobs overseas, keep no tax on tips and Social Security, and restore free IRS filing.",
     "Energy: suspend the federal gas tax and restore clean energy tax cuts.", "Congress: term limits, a balanced budget amendment, a stock trading ban and no pay in shutdowns.",
     "Other: universal background checks, a path to citizenship with border security, a digital bill of rights, phones out of schools, Roe v. Wade protections, and a vote of Congress before military force."]
    .map((t) => `<li>${t}</li>`).join("") + `</ul></div>`;
const OTHER_W = `<div class="ev-more"><p class="h">His other plans, with no direct tie to a home</p><ul>`
  + ["End the state income tax, a long-term goal, and overhaul property taxes, as reported.", "Lower personal property taxes on business equipment, as reported.",
     "Let the governor pause the state gas tax for up to 120 days, as reported.", "Fully fund public schools and expand school choice.", "Rural clinics and telemedicine.",
     "Deny state benefits to people here illegally.", "Independent audits of state agencies, led by the lieutenant governor.", "Build the energy grid and add competition, as reported."]
    .map((t) => `<li>${t}</li>`).join("") + `</ul></div>`;
const PLANS = tabs("evp", "Pick a winner", [
  { tab: "Annie Andrews (D), U.S. Senate", icon: "person", h3: "Annie Andrews' housing plans", html: grid(ANDREWS, { all: "Needs Congress" }) + OTHER_A },
  { tab: "Alan Wilson (R), governor", icon: "person", h3: "Alan Wilson's housing plans", html: grid(WILSON, { all: "Needs the legislature", first: "Needs two-thirds" }) + OTHER_W },
]);

/* V7: a three-question check of what the page taught. The answers are in the HTML; the script hides
   each one until the reader picks. */
const QS = [
  ["Can the new governor cut the tax on rentals by himself?", "no", `It takes two-thirds of each chamber, and Republicans are ${SHORT} House votes short.`],
  ["Can a first-time buyer use a $50,000 federal credit this winter?", "no", "It is a proposal. It has had no vote in Congress."],
  ["Did prices here fall in the year after any election from 2016 to 2024?", "no", "They rose every time, by 3 to 22 percent."],
];
const QUIZ = `<div class="ev-quiz" id="evQuiz"><p class="hd"><span>Check what you learned</span><b id="evScore"></b></p>`
  + QS.map(([q, a, ans]) => `<div class="ev-q" data-a="${a}"><p class="q">${q}</p><div class="o"><button type="button" data-v="yes">Yes</button><button type="button" data-v="no">No</button></div><p class="a"><b>${a === "no" ? "No." : "Yes."}</b> ${ans}</p></div>`).join("")
  + `</div>`;

/* ---------------------------------------------------------------------------- */
/* Photo (photos.json; looked at full size; subject_check in its record).          */
const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}`)); must(r, `no photo record for ${name}`); PH.checkRecord(r); return r; };
const CAPITOL = rec("us-capitol-west-front"), COUNTY = rec("horry-government-justice-center");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const CAP_CAPTION = "The U.S. Capitol, where a buyer credit and the flood insurance deadline are decided.";
const CAPITOL_PHOTO = lazy(PH.heroPhoto(CAPITOL, { alt: CAPITOL.alt, caption: CAP_CAPTION, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" }));
const COUNTY_CAPTION = "Horry County's government center in Conway. County Council decides impact fees on new homes and zoning outside the cities.";
const COUNTY_PHOTO = lazy(PH.heroPhoto(COUNTY, { alt: COUNTY.alt, caption: COUNTY_CAPTION, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" }));
const CREDITS = PH.creditsList([{ photo: CAPITOL, caption: CAP_CAPTION.replace(/\.$/, "") }, { photo: COUNTY, caption: COUNTY_CAPTION.replace(/\.$/, "") }]);

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                        */
const SCEC = "https://scvotes.gov/2026-general-election-results/";
const CONST = "https://www.scstatehouse.gov/scconstitution/A10.pdf";
const AMEND = "https://www.scstatehouse.gov/scconstitution/A16.pdf";
const ANDREWS_PLAN = "https://drannieandrews.com/wp-content/uploads/2026/08/Web-file.pdf";
const ANDREWS_SITE = "https://drannieandrews.com/platform/";
const WILSON_FOX = "https://www.foxcarolina.com/2026/10/15/republican-nominee-sc-governor-alan-wilson-announces-affordability-agenda/";
const WILSON_WIS = "https://www.wistv.com/2026/10/28/full-interview-alan-wilson-shares-priorities-governor-ahead-election-day/";
const WILSON_SITE = "https://wilsonforsc.com/priorities/";
const FHFA = "https://www.fhfa.gov/data/hpi";
const CRS = "https://www.congress.gov/crs_external_products/IN/HTML/IN10835.html";
const PL101 = "https://www.govinfo.gov/content/pkg/PLAW-119publ101/html/PLAW-119publ101.htm";

/* The number tiles under the H1: the four numbers a reader came for. The script counts them up and
   turns "Dec. 11" into a live count of days; without it they read as written. */
const tile = (kind, big, label, sub) => `<div class="ev-tile ${kind}"><span class="b">${big}</span><span class="l">${label}</span><span class="s">${sub}</span></div>`;
const SAVE = Math.round((T6 - T4) / 10) * 10;
const DASH = `<div class="ev-dash">`
  + tile("now", "Dec. 11", "Flood insurance deadline", `<span data-ev-days="2026-12-11">Before the new senator takes office</span>`)
  + tile("idea", `$<span data-ev-count="${SAVE}">${SAVE.toLocaleString("en-US")}</span>`, `Less tax a year on a ${money(TX.price)} rental`, "If rentals moved to 4 percent")
  + tile("idea", `<span data-ev-count="${SHORT}">${SHORT}</span> votes`, "Short of the rental tax cut", "In the state House")
  + tile("", `+<span data-ev-count="${pct1(LATEST)}" data-ev-dec="1">${pct1(LATEST)}</span>%`, "Prices here, latest year", "About flat")
  + `</div>`;
/* The jump list: short, in the hero, one tap to each part. */
const JUMP = [["for-you", "Your situation"], ["rental-tax", "Rental tax"], ["buyer-credit", "Buyer credit"], ["dates", "Key dates"], ["prices", "Prices"], ["plans", "Both plans"], ["election-faq", "Election FAQ"]];
const JUMPNAV = `<nav class="ev-nav" aria-label="On this page"><ul class="ev-jump"><li class="k">Jump to</li>${JUMP.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ul></nav>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Market Reports", url: "/market-reports/" },
  pageImages: () => PH.pageImages(CAPITOL),
  title: "What the 2026 Election Means for Myrtle Beach Homes | Chapter3",
  description: "What the 2026 election changes for a Myrtle Beach home: the Dec. 11 flood deadline, a rental tax cut with a tax slider, the $50,000 buyer credit, and prices.",
  ogTitle: "What the 2026 election means for Myrtle Beach real estate: what changes for buyers, sellers and rental owners, and when",
  crumb: "2026 Election",
  eyebrow: "Market report",
  h1: "What the 2026 Election Means for Myrtle Beach Real Estate",
  h1em: "",
  sub: `In the 2026 election's unofficial count, Annie Andrews (D) won the U.S. Senate race and Alan Wilson (R) won for governor of South Carolina.`,
  heroMedia: "<style>main#main h1.detail-h1>br:last-of-type,main#main h1.detail-h1>em:empty{display:none}</style>" + CSS + DASH + JUMPNAV,
  heroCta: false,
  toc: false,
  author: "devin+abdulla",
  shortAnswer: [
    `Two dates after the election matter for a Myrtle Beach home this winter. On Dec. 11, federal flood insurance can lapse and stall closings in flood zones, and on Jan. 7, companies with 350 or more houses may no longer buy more.`,
    `The bigger changes are proposals. Wilson wants a lower tax on rentals, and at 4 percent a ${money(TX.price)} rental in Myrtle Beach would pay about ${r10(T6 - T4)} less a year. Andrews backs a $50,000 credit for first-time buyers.`,
  ],
  sections: [
    { h2: "What does the 2026 election change for my home?", toc: "Your situation", id: "for-you", html: (bg) =>

      h.p(`Two things are set to happen for a Myrtle Beach home, and the rest are proposals. Pick your situation to see what applies to you.`) +
      KEY + PICK +
      h.cta("Ask what the election changes for your house", "Send us the address. We tell you its flood zone, its tax ratio and what a pending vote could change for it.", "Ask about your house", "/contact/", bg) },

    { h2: "How much would a Myrtle Beach rental save if Wilson cuts the rental tax?", toc: "Rental tax", id: "rental-tax", html: () =>
      h.p(`About a third of its yearly property tax, if rentals were taxed at 4 percent instead of 6. A home you live in is taxed on 4 percent of its value, and skips the school operating tax. A rental or second home is taxed on 6 percent.`) +
      CALC + TAXTAB +
      h.h3("What has to happen first") +
      h.p(`The 6 percent is in the ${h.ext(CONST, "state constitution")}. Changing it takes two-thirds of each chamber, so it needs some Democratic votes.`) +
      METER +
      h.p(`Wilson has published no bill. The other path is a ${h.ext(AMEND, "constitutional amendment")}, which voters could approve in November 2028 at the earliest.`) +
      h.h3("Where this was tried before, and what it points to") +
      h.p(`Act 388, a 2006 state law, took the school operating tax off homes people live in and added a 1 percent sales tax. A 2020 Lincoln Institute study found the state's system shifted the tax burden onto rentals, second homes and businesses. The South Carolina Chamber Foundation and South Carolina Realtors chose its case-study counties. The 2006 law has defenders too, such as nohometax.org.`) +
      runs(
        [`If a cut passes, the bill on a rental here falls by about a third.`, `No plan names who makes up the lost tax: other owners, businesses or the state.`],
        [`A cut would move part of the burden the 2006 law shifted back off rentals.`, `No study we found shows whether the saving would reach tenants or show up in prices.`]) +
      h.p(`More: ${h.a(P4, "the rental tax cut for investors")} and ${h.a(P5, "what changing the 2006 school tax law would mean")}.`) },

    { h2: "Would a $50,000 first-time buyer credit raise Myrtle Beach home prices?", toc: "Buyer credit", id: "buyer-credit", html: () =>
      h.p(`The last credit raised prices a little and sales a lot. A $50,000 credit has never been tried, so how much more is unknown.`) +
      CREDIT +
      h.p(`From 2008 to 2010, a federal credit paid first-time buyers up to $8,000. A study in the Journal of Finance found it raised home sales by about 10 percent and prices by about 1 percent. Many buyers simply bought a few years earlier than they would have.`) +
      h.p(`Here it did not stop a fall. Myrtle Beach-area prices dropped about 10 percent in 2009 and kept falling until 2012.`) +
      runs(
        [`If it passes, the same pattern points to more sales and slightly higher prices, about 1 percent the last time.`, `Some buyers would move a purchase earlier to get the credit.`],
        [`Unknown. No study measured a credit this large, or what happens once buyers who bought early are gone.`]) +
      h.p(`First it needs a vote in the House and the Senate and the president's signature. It has had no vote. More: ${h.a(P2, "the first-time buyer tax credit")}.`) +
      CAPITOL_PHOTO },

    { h2: "What dates matter for a Myrtle Beach home sale after the election?", toc: "Key dates", id: "dates", html: () =>
      h.p(`Dec. 11 matters most. It is the deadline for federal flood insurance, and it comes before the new senator takes office.`) +
      TIMELINE +
      runs(
        [`If the program lapses, closings in high-risk flood zones can wait from a few hours to several weeks, based on past lapses.`],
        [`Congress has kept the program going with 36 short extensions since 2017. Most premiums can rise up to 18 percent a year by law, whoever is in the Senate.`]) },

    { h2: "Will Myrtle Beach home prices go down after the election?", toc: "Prices", id: "prices", html: () =>
      h.p(`Prices here rose in the year after each of the last five elections, by 3 to 22 percent. They fell only after 2008, in the housing slump.`) +
      PRICES +
      h.p(`The record gives no basis for a forecast after this election. The changes swing sevenfold from one election to the next, and we found nothing that ties them to who won. Our ${h.a("/sell/home-value/", "home value page")} shows what homes like yours sold for this year.`) },

    { h2: "What do Andrews and Wilson plan for housing?", toc: "Both plans", id: "plans", html: () =>
      h.p(`Each has seven plans that touch a home or what an owner pays. Each is a proposal. Pick a winner to see them, in their own words where they gave them.`) +
      PLANS +
      h.p(`Neither winner decides impact fees, zoning or where short-term rentals are allowed. County and city councils do.`) +
      COUNTY_PHOTO +
      QUIZ +
      h.p(`Sources: Andrews' ${h.ext(ANDREWS_PLAN, "affordability plan")} and ${h.ext(ANDREWS_SITE, "platform")}; Wilson's ${h.ext(WILSON_SITE, "priorities")}, his agenda as ${h.ext(WILSON_FOX, "Fox Carolina reported it")}, and an ${h.ext(WILSON_WIS, "interview with WIS")}.`) +
      SCRIPT },
  ],
  faqTitle: "Election FAQ",
  faq: [
    { q: "Will Myrtle Beach home prices go down after the election?", a: `Past elections do not say. In the year after each election from 2016 to 2024, Myrtle Beach-area prices rose 3 to 22 percent. In the latest year they were about flat, up ${pct1(LATEST)} percent.` },
    { q: "Can Alan Wilson cut the property tax on rentals by himself?", a: `No. Changing the 6 percent rate needs ${TT.house_needed} House votes and ${TT.senate_needed} Senate votes. Republicans won ${SH.after.R} House seats in the unofficial count, so it needs Democratic votes too.` },
    { q: "Is there a $50,000 first-time buyer tax credit now?", a: "No. Annie Andrews backs one, but it has had no vote in Congress. Plan a purchase this winter without it." },
    { q: "What happens to a closing if flood insurance lapses on Dec. 11?", a: "A loan on a house in a high-risk flood zone can wait until Congress restores the program or the lender accepts a private policy that meets federal rules. Houses outside those zones are not held up." },
  ],
  sources: [
    { name: "SC Election Commission results", href: SCEC },
    { name: "SC Constitution Art. X", href: CONST },
    { name: "Art. XVI", href: AMEND },
    { name: "Andrews plan", href: ANDREWS_PLAN },
    { name: "Wilson agenda (Fox Carolina)", href: WILSON_FOX },
    { name: "Wilson interview (WIS)", href: WILSON_WIS },
    { name: "FHFA house price index", href: FHFA },
    { name: "CRS on flood insurance", href: CRS },
    { name: "Public Law 119-101", href: PL101 },
  ],
  sourcesNote: "Results are the unofficial count, not certified. Educational only, not legal or tax advice.",
  bottomCta: { h2: "Ask what the election changes for your house.", p: "Send us a house you are buying or selling. An agent tells you what is set now and what is still a proposal.", label: "Ask about your house", href: "/contact/" },
  keywords: "2026 election Myrtle Beach real estate, South Carolina election housing plans, Annie Andrews housing plan, flood insurance lapse December 11, will home prices go down after the election, Horry County rental tax after the election",
  about: "What the 2026 South Carolina election means for home buyers, sellers and rental owners in Myrtle Beach and Horry County",
  afterSources: () => CREDITS,
});
