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
  ctaBox: 'background:var(--ivory);border:1px solid var(--rule);border-radius:12px;padding:1.2rem 1.3rem;margin-top:1.8rem;max-width:720px;display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between',
};
const A = (href, text) => `<a href="${href}" style="${S.a}">${text}</a>`;
const X = (href, text) => `<a href="${href}" style="${S.a}" rel="noopener" target="_blank">${text}</a>`;

const faq = [
  { q: 'Is the cost of living cheaper in Myrtle Beach?',
    a: 'Yes. The biggest difference is the house. A typical home here sells for about $342,000, against about $737,000 in the New York area and about $742,000 in Boston. Day to day costs are closer to average, and rent runs about 17 percent below the national average.' },
  { q: 'What salary do I need to live in Myrtle Beach?',
    a: 'It depends on where you live now, which is what the calculator on this page is for. Someone earning $70,000 in Los Angeles needs about $43,000 here to live the same way. Someone in Cleveland would need slightly more here, not less.' },
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
  house: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  bolt:  '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
  cart:  '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.55L20.5 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.6-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.6C19 15.4 12 20 12 20Z"/></svg>',
};

/* ---------- the calculator ----------
 * Forbes layout: income, a searchable "my city now", a fixed destination, a
 * Calculate button, one big number, then a category breakdown, each with an
 * icon, a headline percentage and a small table.
 * The destination is deliberately not a picker. We only sell here. */
const CALC_HTML = `
<section style="background:var(--ivory-2)" id="col-calc"><div class="wrap"><p style="${S.eyebrow}">The calculator</p><h2 style="${S.h2}">Compare your city with Myrtle Beach</h2><p style="${S.p}">Our cost of living calculator compares how much money you need to make in Myrtle Beach compared to the city you live in.</p>
<div style="max-width:760px;background:#fff;border:1px solid var(--rule);border-radius:14px;padding:1.6rem">
<div style="margin-bottom:1.1rem"><label style="${S.label}" for="colIncome">My household income before tax</label><input class="idx-input" id="colIncome" type="text" inputmode="numeric" value="75,000" autocomplete="off"></div>
<div style="margin-bottom:1.1rem;position:relative"><label style="${S.label}" for="colCity">My city now</label><input class="idx-input" id="colCity" type="text" placeholder="Start typing a city or state" autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="colList"><div id="colList" role="listbox" style="display:none;position:absolute;left:0;right:0;top:100%;z-index:40;background:#fff;border:1px solid var(--rule);border-top:none;border-radius:0 0 8px 8px;max-height:260px;overflow-y:auto;box-shadow:0 12px 30px rgba(28,32,40,.14)"></div></div>
<div style="margin-bottom:1.3rem"><label style="${S.label}" for="colTo">I want to live in</label><input class="idx-input" id="colTo" value="Myrtle Beach / Surrounding Areas" readonly aria-readonly="true" style="background:var(--ivory-2);color:var(--navy);font-weight:600"></div>
<button class="btn btn-brass" style="width:100%" id="colGo" onclick="colCalc()">Calculate</button>
<div id="colOut" aria-live="polite" style="border-top:1px solid var(--rule);margin-top:1.5rem;padding-top:1.4rem">
<p id="colLead" style="font-family:var(--sans);font-size:.95rem;color:var(--muted);line-height:1.6;margin:0 0 .4rem">To live the same way in Myrtle Beach, you need a household income of:</p>
<p id="colBig" style="font-family:var(--serif);font-size:2.6rem;color:var(--brass);line-height:1;margin:0 0 1rem">&nbsp;</p>
<p id="colSub" style="font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.6;margin:0 0 .3rem"></p>
<p id="colDiff" style="font-family:var(--sans);font-size:1rem;color:var(--muted);line-height:1.6;margin:0"></p>
</div>
<p style="${S.small}">Home values and rents: Zillow, <span id="colZDate">latest month</span>. Other prices: US Bureau of Economic Analysis. Averages for a whole metro area, not a quote for one home. Taxes are not included.</p>
</div>
<div id="colCats" style="max-width:760px;margin-top:1.6rem"></div>
<div style="max-width:760px;margin-top:1.6rem;background:var(--navy);border-radius:14px;padding:1.5rem 1.6rem;display:flex;gap:1.2rem;flex-wrap:wrap;align-items:center;justify-content:space-between"><div style="flex:1 1 320px"><p style="font-family:var(--serif);font-size:1.3rem;color:var(--ivory);margin:0 0 .4rem">Want this run on a real house?</p><p style="font-family:var(--sans);font-size:.92rem;color:rgba(244,239,232,.65);margin:0;line-height:1.6">Send a price range and the city you are leaving. We work out the tax, the insurance and the payment on real listings.</p></div><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Run my numbers</a><a class="btn btn-outline" href="tel:+18543332135" style="color:var(--ivory);border-color:rgba(244,239,232,.4)">Call 854.333.2135</a></div></div>
</div>
<script src="/assets/col.js"></script>
<script>
// Declared before the data check so the button never throws if the data file
// fails to load. The real implementation replaces it below.
function colCalc(){}
(function(){
  // ICONS is a Node-side constant in this spec. It must be serialised INTO
  // the browser script, or catBlock throws ReferenceError and the whole
  // category breakdown renders empty. That shipped once and the browser
  // console caught it; the static audit could not.
  var ICONS=${JSON.stringify(ICONS)};
  var D=window.C3_COL;
  if(!D||!D.rows){document.getElementById('colLead').textContent='The comparison data did not load. Call 854.333.2135 and we will run it for you.';return;}
  var MB='myrtle-beach-conway-north-myrtle-beach-sc';
  var R={},rows=D.rows,i;
  for(i=0;i<rows.length;i++){R[rows[i][0]]=rows[i];}
  var cityIn=document.getElementById('colCity'),listEl=document.getElementById('colList'),inc=document.getElementById('colIncome');
  var big=document.getElementById('colBig'),lead=document.getElementById('colLead'),sub=document.getElementById('colSub'),diff=document.getElementById('colDiff'),cats=document.getElementById('colCats');
  var chosen=null, active=-1, shown=[];
  function zMonth(iso){if(!iso)return 'latest month';var p=iso.split('-');var M=['January','February','March','April','May','June','July','August','September','October','November','December'];return M[parseInt(p[1],10)-1]+' '+p[0];}
  document.getElementById('colZDate').textContent=zMonth(D.meta.zillowLatestMonth);
  function money(n){return '$'+Math.round(n).toLocaleString('en-US');}
  function money100(n){return '$'+(Math.round(n/100)*100).toLocaleString('en-US');}
  function readIncome(){var v=parseFloat((inc.value||'').replace(/[^0-9.]/g,''));return isFinite(v)&&v>0?v:0;}
  function place(r){return r[3]==='us'?'the average US city':r[1].replace(' (statewide average)','');}
  // Column 11 is the buyer-weighted index. Fall back to BEA all-items (4) for
  // the few places with no home value. See data/relocating/README-coli.md.
  function idx(r){return r[11]!=null?r[11]:r[4];}
  function gap(from,to){
    if(from==null||to==null||!from||!to)return null;
    var d=to/from;
    if(Math.abs(d-1)<0.005)return {word:'about the same',pct:0};
    var p=(Math.abs(1-d)*100).toFixed(1);
    return d<1?{word:p+'% lower',pct:-1}:{word:p+'% higher',pct:1};
  }
  function colorOf(g){return g.pct<0?'#2f6b3a':(g.pct>0?'#a03333':'var(--navy)');}
  /* ---- searchable city picker ---- */
  function render(q){
    var s=q.trim().toLowerCase();
    listEl.innerHTML='';shown=[];active=-1;
    if(s.length<2){listEl.style.display='none';cityIn.setAttribute('aria-expanded','false');return;}
    var starts=[],has=[];
    for(var j=0;j<rows.length;j++){
      var nm=rows[j][1].toLowerCase();
      if(nm.indexOf(s)===0)starts.push(rows[j]);
      else if(nm.indexOf(s)>0)has.push(rows[j]);
    }
    shown=starts.concat(has).slice(0,40);
    if(!shown.length){listEl.innerHTML='<div style="padding:.7rem .9rem;font-family:var(--sans);font-size:.88rem;color:var(--muted)">No match. Try a nearby city or the state name.</div>';listEl.style.display='block';return;}
    for(var k=0;k<shown.length;k++){
      var o=document.createElement('div');
      o.setAttribute('role','option');o.setAttribute('data-i',String(k));
      o.style.cssText='padding:.6rem .9rem;font-family:var(--sans);font-size:.9rem;color:var(--navy);cursor:pointer';
      o.textContent=shown[k][1];
      o.onmousedown=function(e){e.preventDefault();pick(parseInt(this.getAttribute('data-i'),10));};
      listEl.appendChild(o);
    }
    listEl.style.display='block';cityIn.setAttribute('aria-expanded','true');
  }
  function highlight(){
    var kids=listEl.children;
    for(var j=0;j<kids.length;j++)kids[j].style.background=(j===active)?'rgba(196,120,58,.10)':'';
    if(active>=0&&kids[active]&&kids[active].scrollIntoView)kids[active].scrollIntoView({block:'nearest'});
  }
  function pick(j){
    if(j<0||j>=shown.length)return;
    chosen=shown[j][0];cityIn.value=shown[j][1];
    listEl.style.display='none';cityIn.setAttribute('aria-expanded','false');
    window.colCalc();
  }
  cityIn.addEventListener('input',function(){chosen=null;render(cityIn.value);});
  cityIn.addEventListener('focus',function(){if(cityIn.value.trim().length>1)render(cityIn.value);});
  cityIn.addEventListener('blur',function(){setTimeout(function(){listEl.style.display='none';},150);});
  cityIn.addEventListener('keydown',function(e){
    if(listEl.style.display==='none')return;
    if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,shown.length-1);highlight();}
    else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);highlight();}
    else if(e.key==='Enter'){if(active>=0){e.preventDefault();pick(active);}}
    else if(e.key==='Escape'){listEl.style.display='none';}
  });
  /* ---- category breakdown ---- */
  var CAT=[
    {key:'home', icon:'house', name:'Housing', blurb:'The biggest number in any move. What a typical home sells for, and what a typical rent runs.'},
    {key:'util', icon:'bolt', name:'Utilities', blurb:'Power, water and gas. Summers here run the air conditioning hard, so the yearly total matters more than the rate.'},
    {key:'goods', icon:'cart', name:'Groceries and everyday items', blurb:'Food, clothing, fuel and household goods. Food you cook at home is not taxed at all in Horry County.'},
    {key:'serv', icon:'heart', name:'Health care and services', blurb:'Doctors, dentists, eating out, and the everyday services you pay people for.'}
  ];
  function trow(label,a,b,fmt){
    if(a==null||b==null)return '';
    var g=gap(a,b); if(!g)return '';
    return '<tr><td style="padding:.55rem .5rem;border-bottom:1px solid var(--rule)">'+label+'</td>'+
      '<td style="padding:.55rem .5rem;border-bottom:1px solid var(--rule)">'+fmt(a)+'</td>'+
      '<td style="padding:.55rem .5rem;border-bottom:1px solid var(--rule)">'+fmt(b)+'</td>'+
      '<td style="padding:.55rem .5rem;border-bottom:1px solid var(--rule);font-weight:600;color:'+colorOf(g)+'">'+g.word+'</td></tr>';
  }
  var one=function(x){return x.toFixed(1);};
  /* Only Housing gets a table, because only Housing has real dollar figures.
     The other three would have to print raw index points, and "158.6 vs 88.0"
     tells a buyer nothing. They get the headline percentage instead. */
  function catBlock(c,fromName,f,t){
    var head=null,body='';
    if(c.key==='home'){head=gap(f[9],t[9]);body=trow('Typical home value',f[9],t[9],money)+trow('Typical rent, a month',f[10],t[10],money);}
    if(c.key==='util'){head=gap(f[7],t[7]);}
    if(c.key==='goods'){head=gap(f[5],t[5]);}
    if(c.key==='serv'){head=gap(f[8],t[8]);}
    if(!head)return '';
    var table=body?('<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:460px">'+
      '<thead><tr style="text-align:left"><th style="padding:.5rem;font-weight:600;border-bottom:1px solid var(--rule)"></th>'+
      '<th style="padding:.5rem;font-weight:600;border-bottom:1px solid var(--rule)">'+fromName+'</th>'+
      '<th style="padding:.5rem;font-weight:600;border-bottom:1px solid var(--rule)">Myrtle Beach</th>'+
      '<th style="padding:.5rem;font-weight:600;border-bottom:1px solid var(--rule)">Change</th></tr></thead><tbody>'+body+'</tbody></table></div>'):'';
    return '<div style="background:#fff;border:1px solid var(--rule);border-radius:14px;padding:1.4rem 1.5rem;margin-bottom:1rem">'+
      '<div style="display:flex;align-items:center;gap:.8rem;margin-bottom:.6rem;flex-wrap:wrap"><span style="color:var(--brass);display:flex">'+ICONS[c.icon]+'</span>'+
      '<h3 style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:0">'+c.name+'</h3>'+
      '<span style="margin-left:auto;font-family:var(--sans);font-size:1.05rem;font-weight:600;color:'+colorOf(head)+'">'+head.word+'</span></div>'+
      '<p style="font-family:var(--sans);font-size:.88rem;color:var(--muted);line-height:1.6;margin:0 0 '+(table?'.9rem':'0')+';max-width:640px">'+c.blurb+'</p>'+table+'</div>';
  }
  window.colCalc=function(){
    var f=chosen?R[chosen]:null,t=R[MB];
    if(!f){lead.textContent='Type your city above and pick it from the list.';big.innerHTML='&nbsp;';sub.textContent='';diff.textContent='';cats.innerHTML='';return;}
    if(f[0]===MB){lead.textContent='That is Myrtle Beach. Pick the city you live in now.';big.innerHTML='&nbsp;';sub.textContent='';diff.textContent='';cats.innerHTML='';return;}
    var income=readIncome();
    var need=income*idx(t)/idx(f), g=gap(idx(f),idx(t));
    lead.textContent='To live the same way in Myrtle Beach, you need a household income of:';
    big.textContent=income>0?money100(need):'—';
    sub.textContent=g.pct===0
      ? 'The cost of living is about the same in Myrtle Beach as in '+place(f)+'.'
      : 'The cost of living is '+g.word+' in Myrtle Beach than in '+place(f)+'.';
    diff.textContent=income>0?('That is '+money100(Math.abs(income-need))+(need<income?' less':' more')+' than you earn now.'):'Enter your income to see the number.';
    var shortName=f[3]==='us'?'US average':f[1].replace(' (statewide average)','').split(',')[0];
    var html='';
    for(var j=0;j<CAT.length;j++)html+=catBlock(CAT[j],shortName,f,t);
    cats.innerHTML=html;
    try{var u=new URL(location.href);u.searchParams.set('from',f[0]);if(income>0)u.searchParams.set('income',String(Math.round(income)));else u.searchParams.delete('income');history.replaceState(null,'',u.pathname+u.search+u.hash);}catch(e){}
  };
  inc.addEventListener('input',function(){if(chosen)window.colCalc();});
  inc.addEventListener('blur',function(){var v=readIncome();if(v>0)inc.value=Math.round(v).toLocaleString('en-US');});
  var start='new-york-newark-jersey-city-ny-nj';
  try{var q=new URLSearchParams(location.search);var qf=q.get('from');if(qf&&R[qf])start=qf;var qi=parseFloat(q.get('income'));if(isFinite(qi)&&qi>0)inc.value=Math.round(qi).toLocaleString('en-US');}catch(e){}
  chosen=start;cityIn.value=R[start][1];window.colCalc();
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
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Cost of Living</span></div><p class="eyebrow" style="margin-bottom:1rem">Cost of living calculator</p><h1 class="detail-h1">Cost of living in Myrtle Beach<br/><em style="font-style:italic;color:var(--brass)">compared with your city.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">See what income you would need here to live the way you live now, and what your money buys once you arrive.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#col-calc">Compare my city</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>
${CALC_HTML}

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Your money buys a lot more house here</h2><p style="${S.p}">The typical home in the Myrtle Beach area sells for about $342,000. In the New York area it is about $737,000. Boston is about $742,000, Washington about $580,000 and Philadelphia about $392,000. Sell in any of those and you can often buy here outright, or buy a much bigger house for the same payment.</p><p style="${S.p}">Day to day costs move less than the house does. Food, power and everyday items run close to the national average. Rent is the one that clearly drops, at about 17 percent below average.</p><p style="${S.pLast}">Not every move saves you money on a house. Cleveland runs about $254,000 and Pittsburgh about $232,000, so both are cheaper than here. If you are coming from the Midwest, put your city in the calculator before you assume the coast is a bargain.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">See what your sale actually buys on the Grand Strand.</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Show me homes in my range</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Real bills</p><h2 style="${S.h2}">What our customers actually pay each month</h2><p style="${S.p}">These are real bills from a customer in a 1,400 square foot two-story house, not an area average. Power runs about $119.89 and water about $51.42. Your bill moves with the size of the house and how cold you keep it.</p><p style="${S.p}">Internet runs about $40 to $75 a month. Most addresses can choose between a local fiber co-op and cable, so it is worth getting both prices.</p><h3 style="${S.h3}">Peak Hours: how your power bill really works</h3><p style="${S.p}">Your power company charges you two ways. You pay for the power you use, and you pay again for your highest single hour of use that month. That second charge is $8 to $12 for each kilowatt in that one hour.</p><p style="${S.p}">The company calls that window Peak Hours. It runs 3pm to 6pm from April to October, and 6am to 9am from November to March. Run the dryer, the oven and the pool pump together at 5pm in July and you pay for it all month. Spread them out and the same power costs less.</p><p style="${S.pLast}">Opening an account needs a credit check and may need a deposit. Water and sewer outside the city needs one day of notice, so call before you move in. Who serves your street is on our ${A('/buyers/relocating/moving-checklist/', 'moving checklist')}.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Taxes</p><h2 style="${S.h2}">Taxes are lower here, and one of them is new</h2><p style="${S.p}">Taxes drop for almost everyone who moves here. The drop is bigger than the price difference on food or power, and it repeats every year.</p><h3 style="${S.h3}">Income tax</h3><p style="${S.p}">South Carolina charges 1.99 percent on your first $30,000 of taxable income and 5.21 percent above that. No city or county adds its own income tax. Social Security is not taxed. Military retirement pay is not taxed at any age. Other retirement income gets a deduction of up to $3,000 before you turn 65 and up to $10,000 after. At 65 there is also a deduction of up to $15,000 against any income, but it is reduced by whatever retirement deduction you already took, so the two do not stack. A couple where both are 65 can claim up to $30,000.</p><h3 style="${S.h3}">Property tax</h3><p style="${S.p}">A main home is taxed on 4 percent of its value and is exempt from the school operating tax. A second home or a rental is taxed on 6 percent and pays that school tax too. On a $350,000 house in the unincorporated county that is roughly $1,300 a year as a main home against roughly $4,200 as a second home. You have to apply for the lower rate yourself. Our ${A('/buyers/property-taxes/', 'property tax page')} has the form and a calculator.</p><h3 style="${S.h3}">Car tax, which is new for most people</h3><p style="${S.p}">South Carolina taxes your car every year. New York, New Jersey, Pennsylvania and Ohio do not. North Carolina, Virginia and Massachusetts already do, so check yours. A $30,000 car costs about $360 a year outside the city and about $460 inside Myrtle Beach, plus a $50 road fee. You also pay $250 once per car when you first register it here.</p><h3 style="${S.h3}">Sales tax and gas</h3><p style="${S.pLast}">Sales tax is 8 percent in the county and 9 percent inside Myrtle Beach. Food you cook at home is not taxed at all here. Gas is cheaper too. In the middle of this year South Carolina ran about 45 cents a gallon below the national average, about 60 cents below Ohio and about 50 cents below New York. You can ${X('https://gasprices.aaa.com/state-gas-price-averages/', 'check today&#39;s prices by state')} yourself.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want the tax bill on a real address, at your ownership status?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Run my numbers</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--navy)" id="lead-form"><div class="wrap" style="padding:3rem 1.5rem"><div style="max-width:680px;margin:0 auto;text-align:center"><h2 style="font-family:var(--serif);font-size:1.9rem;color:var(--ivory);margin-bottom:.8rem">Get the real monthly cost for one home.</h2><p style="color:rgba(244,239,232,.6);margin:0 auto 1.6rem;line-height:1.7">Send an address or a price range and the city you are leaving. We work out the tax, the insurance, the dues and the payment for that property. Free.</p></div><div id="ldWrap" style="max-width:680px;margin:0 auto;background:var(--ivory);border-radius:14px;padding:1.6rem;text-align:left"><div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldCtx" placeholder="Address or price range, and the city you are leaving"></div><div class="idx-lead"><input class="idx-input" id="ldName" placeholder="Your name"><input class="idx-input" id="ldPhone" placeholder="Phone" type="tel"></div><div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldEmail" placeholder="Email" type="email"></div><label style="display:flex;gap:.5rem;align-items:flex-start;font-family:var(--sans);font-size:.72rem;color:var(--muted);line-height:1.45;margin:0 0 .85rem;cursor:pointer"><input type="checkbox" id="ldConsent" style="margin-top:.15rem;accent-color:var(--brass);flex-shrink:0;width:15px;height:15px"><span>I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.</span></label><p id="ldErr" style="display:none;color:#a03333;font-family:var(--sans);font-size:.8rem;margin:0 0 .7rem"></p><button class="btn btn-brass" style="width:100%" onclick="ldSubmit()">Run my numbers</button><p style="font-family:var(--sans);font-size:.75rem;color:var(--muted);margin:.7rem 0 0;line-height:1.5">Free, no obligation. We reply the same day, evenings included. Prefer to talk now? <a href="tel:+18543332135" class="btn btn-outline" style="padding:.35rem .8rem;font-size:.8rem">Call 854.333.2135</a>.</p></div><div id="ldOk" style="display:none;max-width:680px;margin:0 auto;background:rgba(244,239,232,.08);border:1px solid var(--brass);border-radius:14px;padding:1.4rem;color:var(--ivory);text-align:center;line-height:1.6">Thanks. A licensed team member will reply the same day, evenings included.</div><script>
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

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Myrtle Beach cost of living FAQ</h2>${faqHtml}<p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area', 'US Bureau of Economic Analysis')}, ${X('https://www.zillow.com/research/data/', 'Zillow')}, ${X('https://dor.sc.gov/', 'SC Department of Revenue')}, ${X('https://www.horrycountysc.gov/tax-payer-services/', 'Horry County')}, ${X('https://gasprices.aaa.com/state-gas-price-averages/', 'AAA fuel prices')}. Our own bills are marked as ours. Prices and rates change.</p></div></section>
`,
};

module.exports = spec;
