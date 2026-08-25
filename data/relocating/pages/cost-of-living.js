/*
 * Page spec: /buyers/relocating/cost-of-living/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/cost-of-living.js
 *
 * OWNER RULES BAKED INTO THIS PAGE (2026-08-16 review). Do not undo them:
 *  - The calculator copies the Forbes UI: income, starting city, a Calculate
 *    button, one big number, then plain one-line results. No methodology essay.
 *  - No index numbers in the copy. "17% below a national 100" means nothing to
 *    a buyer. Say "rent costs about 17% less than the average US city".
 *  - Short sentences, common words. `node build.js audit` fails the build above
 *    grade 9 and warns above grade 7.
 *  - No metaphors, idioms or personification. Housing does not "carry" a gap,
 *    money does not "disappear", insurance is not an "ambush". `audit` has a
 *    FIGURATIVE list that fails the build.
 *  - No self-congratulation ("almost nobody mentions this"). `audit` fails.
 *  - Say each number once. Repeating the rent figure in three sections reads
 *    like padding.
 *
 * Owner-supplied bills: water $51.42, electric $119.89 (his household).
 * Everything else: data/relocating/col-places.json and research/relocating/.
 */
'use strict';

const S = {
  eyebrow: 'font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600',
  h2: 'font-family:var(--serif);font-size:1.7rem;color:var(--navy);margin-bottom:1rem;letter-spacing:-.01em',
  h3: 'font-family:var(--serif);font-size:1.15rem;color:var(--navy);margin:1.4rem 0 .5rem',
  p: 'color:var(--muted);line-height:1.75;max-width:720px;margin-bottom:1rem',
  pLast: 'color:var(--muted);line-height:1.75;max-width:720px',
  a: 'color:var(--brass);font-weight:600;text-decoration:none',
  label: 'display:block;font-family:var(--sans);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--navy);margin-bottom:.4rem;font-weight:600',
  small: 'font-family:var(--sans);font-size:.75rem;color:var(--muted);margin-top:.9rem;line-height:1.5',
  ctaBox: 'background:var(--ivory);border:1px solid var(--rule);border-radius:6px;padding:1.2rem 1.3rem;margin-top:1.8rem;max-width:720px;display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between',
};
const A = (href, text) => `<a href="${href}" style="${S.a}">${text}</a>`;
const X = (href, text) => `<a href="${href}" style="${S.a}" rel="noopener" target="_blank">${text}</a>`;

const faq = [
  { q: 'Is the cost of living cheaper in Myrtle Beach?',
    a: 'Yes. The biggest difference is the house. A typical home here sells for about $342,000, against about $737,000 in the New York area and about $742,000 in Boston. Day to day costs are closer to average, and rent runs about 17 percent below the national average.' },
  { q: 'What salary do I need to live in Myrtle Beach?',
    a: 'It depends on where you live now, which is what the calculator on this page is for. On the price index behind the calculator, someone earning $70,000 in Los Angeles would need about $43,000 here for the same buying power. Not every move saves money. Someone coming from Montgomery, Alabama would need about the same, and from a few smaller southern metros slightly more.' },
  { q: 'Is Myrtle Beach cheaper than Charlotte or Raleigh?',
    a: 'On the house, yes. A typical home here is about $342,000. Charlotte is about $389,000 and Raleigh about $437,000. Property tax on a main home is also lower here because South Carolina taxes an owner-occupied home on 4 percent of its value.' },
  { q: 'What costs more in Myrtle Beach than people expect?',
    a: 'Two things. South Carolina taxes your car every year, which most northern states do not, and that runs a few hundred dollars per vehicle. And a second home or rental is taxed at about three times the rate of a main home.' },
  { q: 'Where does the calculator get its data?',
    a: 'Home values and rents come from Zillow. Everything else comes from the US Bureau of Economic Analysis, which measures what things cost in 387 metro areas and every state. Both are averages for a whole metro area, not a quote for one house.' },
  { q: 'Does the calculator include South Carolina taxes?',
    a: 'No. It compares what homes, rent, goods and services cost. Income tax, property tax and car tax are covered further down this page, because they depend on the state you are leaving.' },
];

const ICONS = {
  house: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  bolt:  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
  cart:  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.55L20.5 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.6-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.6C19 15.4 12 20 12 20Z"/></svg>',
  dollar:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5v19"/><path d="M16.6 6.6c0-1.7-2-2.7-4.6-2.7s-4.6 1-4.6 3c0 4.2 9.4 2 9.4 6.5 0 2-2 3-4.8 3s-4.8-1-4.8-2.8"/></svg>',
};

/* ---------- the calculator ----------
 * Forbes layout, in the site's own vocabulary. The first build of this used
 * 14px rounded cards with a border around every element, which is not how
 * anything else here is drawn: the site separates with hairline rules and
 * whitespace, its radii stop at 6px, and .hero-stats already sets a row of
 * figures with gap:0 under a single rule. So: no cards, no shadows, one rule
 * between the form and the answer, one under the figures, one per open row.
 * The destination is deliberately not a picker. We only sell here.
 * Only Housing and Electricity get tables, because only those two have real
 * dollars behind them. */
const CALC_HTML = `
<section style="background:var(--ivory)" id="col-calc"><div class="wrap"><h2 class="colx-sr">Compare your city with Myrtle Beach</h2>

<div class="colx">
  <div class="colx-form">
    <div class="colx-field"><label class="colx-label" for="colIncome">Household income</label><input class="colx-in" id="colIncome" type="text" inputmode="numeric" placeholder="75,000" autocomplete="off"></div>
    <div class="colx-field" style="position:relative"><label class="colx-label" for="colCity">My city now (type your city)</label><input class="colx-in" id="colCity" type="text" placeholder="NYC" autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="colList"><button type="button" class="colx-caret" id="colCaret" aria-label="Show all areas" tabindex="-1"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="colList" role="listbox" class="colx-list"></div></div>
    <div class="colx-field"><p class="colx-label" id="colToLab">I want to live in</p><p class="colx-fixed" aria-labelledby="colToLab">Myrtle Beach and surrounding areas</p><p class="colx-hint">Covers Myrtle Beach, Conway, North Myrtle Beach and the rest of the county.</p></div>
    <button class="btn btn-brass colx-go" id="colGo" onclick="colCalc()">Calculate</button>
  </div>
  <div class="colx-answer" id="colOut" aria-live="polite">
    <p class="colx-lead" id="colLead">To live the same way in Myrtle Beach, you need a household income of</p>
    <div class="colx-bigrow"><p class="colx-big" id="colBig">&nbsp;</p><span class="colx-pct" id="colPct"></span></div>
    <p class="colx-delta" id="colDelta"></p>
    <a class="btn btn-brass colx-want" id="colWant" href="/contact/">I want to live here</a>
  </div>
</div>

<div class="colx-stats" id="colCards"></div>

<div class="colx-rows" id="colCats"></div>

<p class="colx-src">Home values and rents: Zillow, <span id="colZDate">latest month</span>. Electricity: US Energy Information Administration, <span id="colEDate">latest</span> average monthly residential bill for the state. Other prices: US Bureau of Economic Analysis regional price parities, <span id="colBDate">latest vintage</span>. These are averages for a whole area, not a quote for one home. Taxes are not included.</p>

<div class="colx-cta"><div><p class="colx-cta-h">Want this run on a real house?</p><p class="colx-cta-p">Send a price range and the city you are leaving. We work out the property tax, an insurance estimate and the carrying cost on real homes.</p></div><div class="colx-cta-btns"><a class="btn btn-brass" href="#lead-form">Run it on a real house</a><a class="btn btn-ghost" href="tel:+18543332135">Call 854.333.2135</a></div></div>
</div>
<style>
/* --- the tool sits on rules and space, not boxes --- */
.colx{display:grid;grid-template-columns:minmax(270px,350px) 1fr;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);max-width:900px}
.colx-form{padding:1.9rem 2rem 1.9rem 0;border-right:1px solid var(--rule)}
.colx-field{margin-bottom:1.15rem}
.colx-label{display:block;font-family:var(--sans);font-size:.62rem;letter-spacing:.13em;text-transform:uppercase;color:var(--slate);margin-bottom:.45rem;font-weight:500}
.colx-in{width:100%;padding:.6rem 2.2rem .6rem .8rem;font-family:var(--sans);font-size:.92rem;background:var(--white);border:1px solid var(--rule);border-radius:4px;color:var(--navy);outline:none;transition:border-color .16s,box-shadow .16s}
.colx-in:focus{border-color:var(--brass);box-shadow:0 0 0 3px rgba(196,120,58,.14)}
.colx-fixed{margin:0;padding:.6rem .8rem;font-family:var(--sans);font-size:.9rem;font-weight:500;line-height:1.4;background:var(--ivory-2);border:1px solid var(--rule);border-radius:4px;color:var(--navy)}
.colx-hint{font-family:var(--sans);font-size:.72rem;color:var(--muted);margin:.45rem 0 0;line-height:1.5}
.colx-go{width:100%;justify-content:center;margin-top:.3rem}
.colx-list{display:none;position:absolute;left:0;right:0;top:100%;z-index:40;background:var(--white);border:1px solid var(--rule);border-top:none;border-radius:0 0 4px 4px;max-height:260px;overflow-y:auto;box-shadow:0 8px 28px rgba(28,32,40,.08)}
.colx-opt{padding:.58rem .8rem;font-family:var(--sans);font-size:.88rem;color:var(--navy);cursor:pointer}
.colx-opt[aria-selected="true"],.colx-opt:hover{background:rgba(196,120,58,.09)}
.colx-caret{position:absolute;right:.1rem;bottom:0;height:2.45rem;width:2.2rem;display:flex;align-items:center;justify-content:center;background:none;border:0;color:var(--slate);cursor:pointer;transition:color .15s,transform .18s}
.colx-caret:hover{color:var(--navy)}
.colx-open .colx-caret{transform:rotate(180deg)}
.colx-head-opt{padding:.5rem .8rem .3rem;font-family:var(--sans);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);background:var(--ivory);position:sticky;top:0}
.colx-opt-a{display:block}
.colx-opt-b{display:block;font-size:.74rem;color:var(--muted);margin-top:.08rem}

.colx-answer{padding:1.9rem 0 1.9rem 2.5rem;display:flex;flex-direction:column;justify-content:center}
.colx-lead{font-family:var(--sans);font-size:.92rem;color:var(--muted);margin:0 0 .6rem;max-width:34ch;line-height:1.55}
.colx-bigrow{display:flex;align-items:baseline;gap:.6rem;flex-wrap:wrap}
/* Fraunces ships 300/400/500 on this site, so 500 is the real bold. 600 would
   be synthesised and look smeared at this size. */
.colx-big{font-family:var(--serif);font-size:clamp(2.5rem,5.6vw,3.6rem);font-weight:500;color:var(--brass-ink);line-height:.95;margin:0;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.colx-pct{font-family:var(--sans);font-size:1rem;font-weight:700;white-space:nowrap;letter-spacing:-.01em}
.colx-want{display:none;margin-top:1.25rem;align-self:flex-start}
.colx-want.is-on{display:inline-flex}
/* The tool is the page, so the heading stays for structure and screen readers
   and the form starts at the top of the section. */
.colx-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.colx-delta{font-family:var(--sans);font-size:.95rem;color:var(--navy);margin:.7rem 0 0;font-weight:500}

/* --- figures row: the site's .hero-stats idea, gap 0 under one rule --- */
.colx-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:0;max-width:900px;margin-top:1.6rem;border-top:1px solid var(--rule);padding-top:1.3rem}
.colx-stat{padding:0 1.1rem;border-left:1px solid var(--rule)}
.colx-stat:first-child{border-left:none;padding-left:0}
.colx-k{display:flex;align-items:center;gap:.45rem;font-family:var(--sans);font-size:1.15rem;letter-spacing:-.01em;color:var(--navy);margin:0 0 .45rem;font-weight:600;line-height:1.25}
.colx-k svg{color:var(--brass);flex:none;width:22px;height:22px}
.colx-v{font-family:var(--sans);font-size:.85rem;font-weight:600;line-height:1.25;margin:0;font-variant-numeric:tabular-nums;letter-spacing:0}
.colx-w{display:block;font-family:var(--sans);font-size:.74rem;font-weight:400;color:var(--muted);margin-top:.3rem;letter-spacing:0}

/* --- breakdown: hairline rows, no cards --- */
.colx-rows{max-width:900px;margin-top:2.2rem;border-top:1px solid var(--rule)}
.colx-row{border-bottom:1px solid var(--rule)}
.colx-row > summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:.85rem;padding:1.15rem .2rem;transition:background .16s}
.colx-row > summary::-webkit-details-marker{display:none}
.colx-row > summary::marker{content:''}
.colx-row > summary:hover{background:rgba(196,120,58,.045)}
.colx-row > summary:focus-visible{outline:2px solid var(--brass);outline-offset:-2px}
.colx-ic{color:var(--brass);display:flex;flex:none}
.colx-name{font-family:var(--serif);font-size:1.12rem;color:var(--navy)}
.colx-head{margin-left:auto;font-family:var(--sans);font-size:.92rem;font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}
.colx-chev{color:var(--slate);display:flex;flex:none;transition:transform .2s cubic-bezier(.23,1,.32,1)}
.colx-row[open] > summary .colx-chev{transform:rotate(180deg)}
.colx-body{padding:0 .2rem 1.5rem}
.colx-blurb{font-family:var(--sans);font-size:.87rem;color:var(--muted);line-height:1.65;margin:0;max-width:62ch}
.colx-tw{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-top:1.1rem}
.colx-t{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.88rem;color:var(--navy);min-width:440px}
.colx-t th{font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);font-weight:500;padding:0 .6rem .55rem;border-bottom:1px solid var(--rule);text-align:right}
.colx-t th:first-child{text-align:left;padding-left:0}
.colx-t td{padding:.62rem .6rem;border-bottom:1px solid var(--rule);text-align:right;font-variant-numeric:tabular-nums}
.colx-t td:first-child{text-align:left;padding-left:0;color:var(--muted)}
.colx-t tr:last-child td{border-bottom:none}
.colx-num{font-family:var(--serif);font-size:1rem}
.colx-chg{font-weight:600;white-space:nowrap}

.colx-src{font-family:var(--sans);font-size:.74rem;color:var(--muted);margin-top:1.4rem;line-height:1.6;max-width:900px}

.colx-cta{max-width:900px;margin-top:2.2rem;background:var(--navy);padding:1.7rem 1.9rem;display:flex;gap:1.4rem;flex-wrap:wrap;align-items:center;justify-content:space-between;border-radius:4px}
.colx-cta-h{font-family:var(--serif);font-size:1.3rem;color:var(--ivory);margin:0 0 .35rem;font-weight:300}
.colx-cta-p{font-family:var(--sans);font-size:.89rem;color:rgba(244,239,232,.68);margin:0;line-height:1.6;max-width:46ch}
.colx-cta-btns{display:flex;gap:.7rem;flex-wrap:wrap}

/* This page leads with the tool. The shared hero is 5rem/4rem of padding on a
   clamp(2.5rem,5vw,4.5rem) headline, which pushes the form off the first
   screen. Compact it here only. */
.detail-hero{padding:2.5rem 0 2rem}
.detail-hero .detail-h1{font-size:clamp(1.85rem,3.6vw,2.75rem);margin-bottom:.7rem}
.detail-hero .detail-sub{font-size:1rem;max-width:560px}
#col-calc{padding-top:1.5rem}

@media (max-width:820px){
  .detail-hero{padding:1.5rem 0 1.4rem}
  .detail-hero .eyebrow{display:none}
  .detail-hero .detail-h1{font-size:1.45rem;margin-bottom:.5rem;line-height:1.12}
  .detail-hero .detail-sub{font-size:.92rem;line-height:1.45}
  .detail-hero .breadcrumb{margin-bottom:.55rem}
  .col-byline{font-size:.78rem!important;line-height:1.45;margin-bottom:.6rem!important}
  .col-herocta{margin-top:1rem!important;gap:.5rem!important;flex-wrap:nowrap!important}
  .col-herocta .btn{padding:.58rem .9rem;font-size:.66rem;letter-spacing:.08em}
  #col-calc{padding-top:1rem}
  .colx{grid-template-columns:1fr}
  .colx-form{padding:1.6rem 0;border-right:none;border-bottom:1px solid var(--rule)}
  .colx-answer{padding:1.6rem 0}
  .colx-stats{grid-template-columns:repeat(2,1fr);row-gap:1.4rem}
  .colx-stat{padding:0 1rem}
  .colx-stat:nth-child(odd){border-left:none;padding-left:0}
}
@media (prefers-reduced-motion:reduce){
  .colx-chev,.colx-row > summary,.colx-in{transition:none}
}
</style>
<script src="/assets/col.js"></script>
<script>
// Declared before the data check so the button never throws if the data file
// fails to load. The real implementation replaces it below.
function colCalc(){}
(function(){
  // ICONS is a Node-side constant in this spec. It must be serialised INTO
  // the browser script, or the figures throw ReferenceError and the whole
  // breakdown renders empty. That shipped once and the browser console
  // caught it; the static audit could not.
  var ICONS=${JSON.stringify(ICONS)};
  var D=window.C3_COL;
  if(!D||!D.rows){document.getElementById('colLead').textContent='The comparison data did not load. Call 854.333.2135 and we will run it for you.';return;}
  var MB='myrtle-beach-conway-north-myrtle-beach-sc';
  var R={},rows=D.rows,i;
  for(i=0;i<rows.length;i++){R[rows[i][0]]=rows[i];}
  var cityIn=document.getElementById('colCity'),listEl=document.getElementById('colList'),inc=document.getElementById('colIncome');
  var big=document.getElementById('colBig'),lead=document.getElementById('colLead'),pct=document.getElementById('colPct'),delta=document.getElementById('colDelta'),want=document.getElementById('colWant');
  var stats=document.getElementById('colCards'),cats=document.getElementById('colCats');
  var chosen=null, active=-1, shown=[];
  function zMonth(iso){if(!iso)return 'latest month';var p=iso.split('-');var M=['January','February','March','April','May','June','July','August','September','October','November','December'];return M[parseInt(p[1],10)-1]+' '+p[0];}
  document.getElementById('colZDate').textContent=zMonth(D.meta.zillowLatestMonth);
  // The BEA vintage is two years behind by design (they publish with a lag).
  // Hiding that behind "latest" was flagged in the 2026-08-20 compliance review.
  var bd=document.getElementById('colBDate'); if(bd&&D.meta.rppVintage)bd.textContent=D.meta.rppVintage;
  var ed=document.getElementById('colEDate'); if(ed&&D.meta.elecVintage)ed.textContent=D.meta.elecVintage;
  function money(n){return '$'+Math.round(n).toLocaleString('en-US');}
  function money2(n){return '$'+n.toFixed(2);}
  function money100(n){return '$'+(Math.round(n/100)*100).toLocaleString('en-US');}
  function readIncome(){var v=parseFloat((inc.value||'').replace(/[^0-9.]/g,''));return isFinite(v)&&v>0?v:0;}
  // Backslashes must be doubled: this whole script is inside a template
  // literal, so \\s reaches the browser as \\s and not as a bare s. Written
  // singly, /\\*+/ arrived as /*+ which opens a comment and kills the file.
  function tidy(n){return String(n).replace(/\\s*Metropolitan Statistical Area\\s*$/i,'').replace(/\\*+\\s*$/,'').trim();}
  // Column 11 is the buyer-weighted index. Fall back to BEA all-items (4) for
  // the few places with no home value. See data/relocating/README-coli.md.
  function idx(r){return r[11]!=null?r[11]:r[4];}
  function gap(from,to){
    if(from==null||to==null||!from||!to)return null;
    var d=to/from;
    if(Math.abs(d-1)<0.005)return {word:'about the same',pct:0,n:0,num:'same',dir:'',less:'about the same'};
    var p=Math.abs(1-d)*100, w=Math.round(p);
    // Whole percentages, like the Forbes tool. One decimal reads as false
    // precision on an index that is an approximation to within a few points.
    return d<1?{word:w+'% lower',pct:-1,n:-p,num:w+'%',dir:'lower',less:w+'% less'}
              :{word:w+'% higher',pct:1,n:p,num:w+'%',dir:'higher',less:w+'% more'};
  }
  function colorOf(g){return g.pct<0?'#2f6b3a':(g.pct>0?'#a03333':'var(--navy)');}
  function arrowOf(g){return g.pct<0?'\\u25BC':(g.pct>0?'\\u25B2':'');}
  /* ---- searchable picker: metros, plus 12,000 town names ----
   * The price data is metro level, because that is the level every source
   * publishes at. Nobody types a metro. So the town list maps a place to its
   * metro, and the option shows both, so it is never a surprise which area
   * the number describes. The list is 280KB, so it is fetched the first time
   * the cursor lands in the box and never on page load. */
  var CITY=null, cityLoading=false, openAll=false;
  var wrapEl=cityIn.parentNode;
  /* One box, two ways in. Typing filters; the caret, or clicking an empty
   * box, drops the whole list. A separate select for 438 areas sat unused
   * beside a search box that looked like the only way in. */
  function showAll(){
    // Owns the flag. cityIn.focus() runs the focus listener, which calls
    // render(), which clears openAll. Setting it in the caret handler before
    // focus() was therefore useless, and the city index arriving a moment
    // later redrew one match over all 439 areas.
    openAll=true;
    var h='',j,mode='';
    shown=[];
    for(j=0;j<rows.length;j++){
      var k=rows[j][3]==='state'?'State averages':'Metro areas';
      if(k!==mode){h+='<div class="colx-head-opt">'+k+'</div>';mode=k;}
      h+='<div class="colx-opt" role="option" data-i="'+shown.length+'">'+tidy(rows[j][1]).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</div>';
      shown.push({id:rows[j][0],label:tidy(rows[j][1]),sub:''});
    }
    listEl.innerHTML=h;
    Array.prototype.forEach.call(listEl.querySelectorAll('.colx-opt'),function(o){
      o.onmousedown=function(e){e.preventDefault();pick(parseInt(this.getAttribute('data-i'),10));};});
    listEl.style.display='block';cityIn.setAttribute('aria-expanded','true');wrapEl.classList.add('colx-open');
    var cur=chosen?listEl.querySelector('.colx-opt[data-i="'+shown.map(function(x){return x.id;}).indexOf(chosen)+'"]'):null;
    if(cur&&cur.scrollIntoView)cur.scrollIntoView({block:'center'});
  }
  function closeList(){listEl.style.display='none';cityIn.setAttribute('aria-expanded','false');wrapEl.classList.remove('colx-open');openAll=false;}
  document.getElementById('colCaret').addEventListener('mousedown',function(e){
    e.preventDefault();
    if(listEl.style.display==='block'){closeList();return;}
    openAll=true; cityIn.focus(); loadCities();
    if(cityIn.value.trim().length>1)cityIn.select();
    showAll();
  });
  function loadCities(){
    if(CITY||cityLoading)return;
    cityLoading=true;
    var el=document.createElement('script');
    el.src='/assets/cities.js';
    el.onload=function(){cityLoading=false;CITY=window.C3_CITIES||null;
      // Do not redraw over the full list. The caret calls loadCities, and this
      // arriving 150ms later used to replace 439 areas with the one match for
      // whatever was already in the box.
      if(CITY&&!openAll&&document.activeElement===cityIn)render(cityIn.value);};
    el.onerror=function(){cityLoading=false;};   // metro search still works
    document.head.appendChild(el);
  }
  function render(q){
    var s=q.trim().toLowerCase();
    listEl.innerHTML='';shown=[];active=-1;
    if(s.length<2){ if(openAll) return showAll(); listEl.style.display='none';cityIn.setAttribute('aria-expanded','false');wrapEl.classList.remove('colx-open');return; }
    openAll=false;
    var starts=[],has=[],j;
    for(j=0;j<rows.length;j++){
      var nm=rows[j][1].toLowerCase();
      if(nm.indexOf(s)===0)starts.push({id:rows[j][0],label:tidy(rows[j][1]),sub:''});
      else if(nm.indexOf(s)>0)has.push({id:rows[j][0],label:tidy(rows[j][1]),sub:''});
    }
    var list=starts.concat(has).slice(0,12);
    if(CITY){
      var seen={},k;
      for(k=0;k<list.length;k++)seen[list[k].id+'|'+list[k].label]=1;
      var cs=[],cd=[];
      for(j=0;j<CITY.cities.length;j++){
        var c=CITY.cities[j], cn=c[0].toLowerCase();
        var at=cn.indexOf(s);
        if(at!==0&&at<1)continue;
        var id=CITY.metros[c[2]];
        var lab=c[0]+', '+c[1], s2=(R[id]?tidy(R[id][1]):'');
        // A town whose metro carries its own name is already in the list
        // above. Enid, OK under Enid, OK reads like a bug.
        if(s2===lab||seen[id+'|'+lab])continue;
        seen[id+'|'+lab]=1;
        var o={id:id,label:lab,sub:s2};
        (at===0?cs:cd).push(o);
        if(cs.length>=28)break;
      }
      list=list.concat(cs.slice(0,28)).concat(cd.slice(0,8));
    }
    shown=list.slice(0,40);
    if(!shown.length){listEl.innerHTML='<div class="colx-opt" style="color:var(--muted);cursor:default">No match. Try a nearby city or the state name.</div>';listEl.style.display='block';return;}
    for(var m=0;m<shown.length;m++){
      var o=document.createElement('div');
      o.className='colx-opt';
      o.setAttribute('role','option');o.setAttribute('data-i',String(m));
      if(shown[m].sub){
        o.innerHTML='<span class="colx-opt-a"></span><span class="colx-opt-b"></span>';
        o.firstChild.textContent=shown[m].label;
        o.lastChild.textContent=shown[m].sub;
      } else o.textContent=shown[m].label;
      o.onmousedown=function(e){e.preventDefault();pick(parseInt(this.getAttribute('data-i'),10));};
      listEl.appendChild(o);
    }
    listEl.style.display='block';cityIn.setAttribute('aria-expanded','true');
  }
  function highlight(){
    var kids=listEl.children;
    for(var j=0;j<kids.length;j++)kids[j].setAttribute('aria-selected',j===active?'true':'false');
    if(active>=0&&kids[active]&&kids[active].scrollIntoView)kids[active].scrollIntoView({block:'nearest'});
  }
  function pick(j){
    if(j<0||j>=shown.length)return;
    chosen=shown[j].id;cityIn.value=shown[j].label;
    closeList();
    window.colCalc();
  }
  cityIn.addEventListener('input',function(){chosen=null;render(cityIn.value);});
  cityIn.addEventListener('focus',function(){loadCities();if(cityIn.value.trim().length>1)render(cityIn.value);});
  cityIn.addEventListener('click',function(){if(!cityIn.value.trim()){openAll=true;showAll();}});
  cityIn.addEventListener('input',function(){loadCities();});
  cityIn.addEventListener('blur',function(){setTimeout(closeList,150);});
  cityIn.addEventListener('keydown',function(e){
    if(listEl.style.display==='none')return;
    if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,shown.length-1);highlight();}
    else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);highlight();}
    else if(e.key==='Enter'){if(active>=0){e.preventDefault();pick(active);}}
    else if(e.key==='Escape'){closeList();}
  });
  /* ---- the figures row ---- */
  function statHTML(icon,label,g){
    if(!g)return '';
    return '<div class="colx-stat"><p class="colx-k">'+(icon?ICONS[icon]:'')+label+'</p>'+
      '<p class="colx-v" style="color:'+colorOf(g)+'"><span aria-hidden="true">'+arrowOf(g)+'</span> '+g.num+
      '<span class="colx-w">'+(g.dir||'')+'</span></p></div>';
  }
  var CAT=[
    {key:'home', icon:'house', name:'Housing', label:'Homes', blurb:'The biggest number in any move. What a typical home sells for, and what a typical rent runs.'},
    {key:'elec', icon:'bolt', name:'Electricity', label:'Electricity', blurb:'Summers here run the air conditioning hard, so the yearly total matters more than the rate. This is the state average bill, and it does not include gas or water.'},
    {key:'goods', icon:'cart', name:'Everyday goods and driving', label:'Goods', blurb:'Food, clothing, fuel and household goods. Food you cook at home is not taxed at all in Horry County.'},
    {key:'serv', icon:'heart', name:'Health care and services', label:'Services', blurb:'Doctors, dentists, eating out, and the everyday services you pay people for.'}
  ];
  function headOf(key,f,t){
    if(key==='home')return gap(f[9],t[9]);
    if(key==='elec')return gap(f[12],t[12]);
    if(key==='goods')return gap(f[5],t[5]);
    if(key==='serv')return gap(f[8],t[8]);
    return null;
  }
  function buildStats(f,t){
    var h=statHTML('dollar',"Cost of living",gap(idx(f),idx(t)));
    for(var j=0;j<CAT.length;j++)h+=statHTML(CAT[j].icon,CAT[j].label,headOf(CAT[j].key,f,t));
    return h;
  }
  /* ---- collapsible rows ---- */
  function trow(label,a,b,fmt){
    if(a==null||b==null)return '';
    var g=gap(a,b); if(!g)return '';
    return '<tr><td>'+label+'</td>'+
      '<td><span class="colx-num">'+fmt(a)+'</span></td>'+
      '<td><span class="colx-num">'+fmt(b)+'</span></td>'+
      '<td class="colx-chg" style="color:'+colorOf(g)+'"><span aria-hidden="true">'+arrowOf(g)+'</span> '+g.word+'</td></tr>';
  }
  function catBlock(c,fromName,f,t){
    var head=headOf(c.key,f,t),body='';
    if(!head)return '';
    if(c.key==='home')body=trow('Typical home value',f[9],t[9],money)+trow('Typical rent, a month',f[10],t[10],money);
    if(c.key==='elec')body=trow('Average electricity bill, a month',f[12],t[12],money2);
    var table=body?('<div class="colx-tw"><table class="colx-t"><thead><tr><th></th><th>'+fromName+'</th><th>Myrtle Beach</th><th>Change</th></tr></thead><tbody>'+body+'</tbody></table></div>'):'';
    return '<details class="colx-row"'+(c.key==='home'?' open':'')+'>'+
      '<summary><span class="colx-ic">'+ICONS[c.icon]+'</span>'+
      '<span class="colx-name">'+c.name+'</span>'+
      '<span class="colx-head" style="color:'+colorOf(head)+'"><span aria-hidden="true">'+arrowOf(head)+'</span> '+head.word+'</span>'+
      '<span class="colx-chev" aria-hidden="true"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>'+
      '</summary><div class="colx-body"><p class="colx-blurb">'+c.blurb+'</p>'+table+'</div></details>';
  }
  window.colCalc=function(){
    var f=chosen?R[chosen]:null,t=R[MB];
    function clear(msg){lead.textContent=msg;big.innerHTML='&nbsp;';big.style.color='';pct.textContent='';delta.textContent='';want.classList.remove('is-on');stats.innerHTML='';cats.innerHTML='';}
    if(!f){clear('Type your city above and pick it from the list.');return;}
    if(f[0]===MB){clear('That is Myrtle Beach. Pick the city you live in now.');return;}
    var income=readIncome();
    var need=income*idx(t)/idx(f), g=gap(idx(f),idx(t));
    lead.textContent='To live the same way in Myrtle Beach, you need a household income of';
    big.textContent=income>0?money100(need):'\\u2014';
    if(income>0){var d=need-income,same=Math.abs(d)<50;
      // the needed income carries the direction: green when it drops, brass when it rises
      big.style.color=same?'var(--navy)':(d<0?'#2f6b3a':'var(--brass-ink)');
      pct.textContent=g.pct===0?'':g.num+' '+g.dir;
      pct.style.color=colorOf(g);
      delta.textContent=same?'About what you earn now.':(money100(Math.abs(d))+(d<0?' less':' more')+' than you earn now.');
      delta.style.color=d<0?'#2f6b3a':(d>0?'#a03333':'var(--navy)');
      want.classList.add('is-on');}
    else{big.style.color='';pct.textContent='';want.classList.remove('is-on');
      delta.textContent='Enter your income to see the number.';delta.style.color='var(--muted)';}
    var shortName=f[3]==='us'?'US average':tidy(f[1]).replace(' (statewide average)','').split(',')[0];
    stats.innerHTML=buildStats(f,t);
    var html='';
    for(var j=0;j<CAT.length;j++)html+=catBlock(CAT[j],shortName,f,t);
    cats.innerHTML=html;
    try{var u=new URL(location.href);u.searchParams.set('from',f[0]);if(income>0)u.searchParams.set('income',String(Math.round(income)));else u.searchParams.delete('income');history.replaceState(null,'',u.pathname+u.search+u.hash);}catch(e){}
  };
  inc.addEventListener('input',function(){if(chosen)window.colCalc();});
  inc.addEventListener('blur',function(){var v=readIncome();if(v>0)inc.value=Math.round(v).toLocaleString('en-US');});
  // Load empty so the placeholders read as the example. A shared link still
  // arrives filled in, which is the only case that should prefill.
  var start=null;
  try{var q=new URLSearchParams(location.search);var qf=q.get('from');if(qf&&R[qf])start=qf;var qi=parseFloat(q.get('income'));if(isFinite(qi)&&qi>0)inc.value=Math.round(qi).toLocaleString('en-US');}catch(e){}
  if(start){chosen=start;cityIn.value=tidy(R[start][1]);}
  window.colCalc();
})();
</script>
</div></section>`;

const spec = {
  slug: '/buyers/relocating/cost-of-living/',
  cur: 'buyers-relocating-col',
  title: 'Cost of Living in Myrtle Beach, SC: Compare Your City',
  description: 'Compare the cost of living in Myrtle Beach with 387 US metro areas. See the income you need here, what homes and rent cost, and what changes on your taxes.',
  headline: 'Cost of Living in Myrtle Beach, SC, Compared With Your City',
  keywords: 'cost of living in Myrtle Beach SC, Myrtle Beach cost of living calculator, salary needed to live in Myrtle Beach',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Cost of Living', href: '/buyers/relocating/cost-of-living/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Cost of Living</span></div><p class="eyebrow" style="margin-bottom:1rem">Cost of living calculator</p><h1 class="detail-h1">Cost of living in Myrtle Beach<br/><em style="font-style:italic;color:var(--brass)">compared with your city.</em></h1><p class="col-byline" style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">See what income you would need here to live the way you live now, and what your money buys once you arrive.</p><div class="col-herocta" style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#col-calc">Compare my city</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>
${CALC_HTML}

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Your money buys a lot more house here</h2><p style="${S.p}">The typical home in the Myrtle Beach area sells for about $342,000. In the New York area it is about $737,000. Boston is about $742,000, Washington about $580,000 and Philadelphia about $392,000. Sell in any of those and you can often buy here outright, or buy a much bigger house for the same payment.</p><p style="${S.p}">Day to day costs move less than the house does. Food, power and everyday items run close to the national average. Rent is the one that clearly drops, at about 17 percent below average.</p><p style="${S.pLast}">Not every move saves you money on a house. Cleveland runs about $254,000 and Pittsburgh about $232,000, so both are cheaper than here. If you are coming from the Midwest, put your city in the calculator before you assume the coast is a bargain.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">See what your sale actually buys on the Grand Strand.</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Show me homes in my range</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Real bills</p><h2 style="${S.h2}">What our customers actually pay each month</h2><p style="${S.p}">These are real bills from a customer in a 1,400 square foot two-story house in 2026, not an area average. Power runs about $119.89 and water about $51.42. Your bill moves with the size of the house and how cold you keep it.</p><p style="${S.p}">Internet runs about $40 to $75 a month. Most addresses can choose between a local fiber co-op and cable, so it is worth getting both prices.</p><h3 style="${S.h3}">Peak Hours: how your power bill really works</h3><p style="${S.p}">Both utilities that serve Horry County, Santee Cooper and Horry Electric Cooperative, charge a residential account two ways. You pay for the power you use, and you pay again for your highest single hour of use that month. On their published 2026 schedules that second charge runs $8 to $12 for each kilowatt in that one hour.</p><p style="${S.p}">The company calls that window Peak Hours. It runs 3pm to 6pm from April to October, and 6am to 9am from November to March. Run the dryer, the oven and the pool pump together at 5pm in July and you pay for it all month. Spread them out and the same power costs less.</p><p style="${S.pLast}">Opening an account needs a credit check and may need a deposit. Water and sewer outside the city needs one day of notice, so call before you move in. Who serves your street is on our ${A('/buyers/relocating/moving-checklist/', 'moving checklist')}.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Taxes</p><h2 style="${S.h2}">Taxes are lower here</h2><p style="${S.p}">Taxes drop for almost everyone who moves here. The drop is bigger than the price difference on food or power.</p><p style="${S.p}"><strong style="color:var(--navy)">This is general information, not tax advice.</strong> Rates and deductions change, and your own situation decides the answer. Confirm anything you plan around with a tax professional or the Horry County Auditor.</p><h3 style="${S.h3}">Income tax</h3><p style="${S.p}">For the 2026 tax year, South Carolina charges 1.99 percent on your first $30,000 of taxable income and 5.21 percent above that. No city or county adds its own income tax. Social Security is not taxed. Military retirement pay is not taxed at any age. Other retirement income gets a deduction of up to $3,000 before you turn 65 and up to $10,000 after. At 65 there is also a deduction of up to $15,000 against any income, but it is reduced by whatever retirement deduction you already took, so the two do not stack. A couple where both are 65 can claim up to $30,000.</p><h3 style="${S.h3}">Property tax</h3><p style="${S.p}">These are assessment ratios, not tax rates. Only 4 percent of a main home&#39;s value is assessed, and a main home is also exempt from the school operating tax. For a second home or a rental, 6 percent is assessed and the school tax applies. On a $350,000 house in the unincorporated county that is roughly $1,300 a year as a main home against roughly $4,200 as a second home. You have to apply for the lower rate yourself. Our ${A('/buyers/property-taxes/', 'property tax page')} has the form and a calculator.</p><h3 style="${S.h3}">Car tax, which is new for most people</h3><p style="${S.p}">South Carolina taxes your car every year. New York, New Jersey, Pennsylvania and Ohio do not. North Carolina, Virginia and Massachusetts already do, so check yours. The tax reaches past cars: the county bills boats and campers every year too. A $30,000 car costs about $360 a year outside the city and about $460 inside Myrtle Beach, plus a $50 road fee. You also pay $250 once per car when you first register it here. Devin, who wrote this page, arrived from Ohio three years ago, and this tax was the one that caught him.</p><h3 style="${S.h3}">Sales tax and gas</h3><p style="${S.pLast}">Sales tax is 8 percent in the county and 9 percent inside Myrtle Beach. Food you cook at home is not taxed at all here. Gas is cheaper too. In August 2026 South Carolina ran about 40 cents a gallon below the national average, about 45 cents below Ohio and about 45 cents below New York. Devin calls cheaper gas the best everyday change since his own move from Ohio.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want an estimate of the property tax on a real address, at your ownership status?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Estimate my property tax</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--navy)" id="lead-form"><div class="wrap" style="padding:3.5rem 1.5rem"><div style="max-width:620px;margin:0 auto">
<p style="font-family:var(--sans);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--brass-2);margin-bottom:.7rem;text-align:center">Free, no obligation</p>
<h2 style="font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--ivory);letter-spacing:-.01em;margin-bottom:.6rem;text-align:center">Get the real monthly cost for one home.</h2>
<p style="font-family:var(--sans);font-size:.93rem;color:rgba(244,239,232,.68);margin:0 auto 1.9rem;line-height:1.65;text-align:center;max-width:52ch">Send an address or a price range and the city you are leaving. We work out the tax, the insurance, the dues and the payment for that property. Free.</p>
<div id="ldWrap">
<div style="display:grid;gap:.7rem;margin-bottom:1rem">
<input class="ld-in" id="ldCtx" placeholder="Address or price range, and the city you are leaving">
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.7rem"><input class="ld-in" id="ldName" placeholder="Your name" autocomplete="name"><input class="ld-in" id="ldPhone" placeholder="Phone" type="tel" autocomplete="tel"></div>
<input class="ld-in" id="ldEmail" placeholder="Email" type="email" autocomplete="email">
</div>
<label style="display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.72rem;color:rgba(244,239,232,.6);line-height:1.5;margin:0 0 1.1rem;cursor:pointer"><input type="checkbox" id="ldConsent" style="margin-top:.18rem;accent-color:var(--brass);flex-shrink:0;width:15px;height:15px"><span>I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.</span></label>
<p id="ldErr" style="display:none;color:#e6b0a9;font-family:var(--sans);font-size:.8rem;margin:0 0 .8rem"></p>
<button class="btn btn-brass" style="width:100%;justify-content:center" onclick="ldSubmit()">Get my cost breakdown</button>
<p style="font-family:var(--sans);font-size:.78rem;color:rgba(244,239,232,.6);margin:.9rem 0 0;line-height:1.6;text-align:center">We reply the same day, evenings included. Prefer to talk now? <a href="tel:+18543332135" style="color:var(--brass-2);font-weight:600;text-decoration:none;white-space:nowrap">Call 854.333.2135</a></p>
</div>
<div id="ldOk" style="display:none;border:1px solid var(--brass);border-radius:6px;padding:1.4rem;color:var(--ivory);text-align:center;line-height:1.6;font-family:var(--sans)">Thanks. A licensed team member will reply the same day, evenings included.</div>
</div>
<style>
.ld-in{width:100%;padding:.7rem .85rem;font-family:var(--sans);font-size:.92rem;background:var(--white);border:1px solid transparent;border-radius:4px;color:var(--navy);outline:none;transition:border-color .16s,box-shadow .16s}
.ld-in::placeholder{color:var(--slate)}
.ld-in:focus{border-color:var(--brass-2);box-shadow:0 0 0 3px rgba(212,137,74,.28)}
</style>
<script>
function ldSubmit(){
 var cx=document.getElementById('ldCtx').value.trim(),n=document.getElementById('ldName').value.trim(),ph=document.getElementById('ldPhone').value.trim(),em=document.getElementById('ldEmail').value.trim(),c=document.getElementById('ldConsent').checked,err=document.getElementById('ldErr');
 function fail(m){err.textContent=m;err.style.display='block';}
 err.style.display='none';
 if(!cx||!n){fail('Add the address or price range, and your name.');return;}
 if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}
 if(ph&&!c){fail('Check the consent box so we can call or text you, or leave the phone blank and use email.');return;}
 c3SendForm({property_address:cx,name:n,phone:ph,email:em,consent:c?'yes':'no'},'relocating-cost-of-living');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Myrtle Beach cost of living FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div>
<p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area', 'US Bureau of Economic Analysis')}, ${X('https://www.zillow.com/research/data/', 'Zillow')}, ${X('https://dor.sc.gov/', 'SC Department of Revenue')}, ${X('https://www.horrycountysc.gov/tax-payer-services/', 'Horry County')}, ${X('https://gasprices.aaa.com/state-gas-price-averages/', 'AAA fuel prices')}. Our own bills are marked as ours. Prices and rates change.</p></div></section>
`,
};

module.exports = spec;
