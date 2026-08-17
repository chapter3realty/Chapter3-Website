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
    a: 'Yes, by about 6 percent against the average US city. Rent is the main reason. It costs about 17 percent less here. Power, food and everyday items are close to average. Taxes are low. Home insurance is high.' },
  { q: 'What salary do I need to live in Myrtle Beach?',
    a: 'It depends on where you live now, which is what the calculator on this page is for. Someone earning $95,000 in the New York City area needs about $79,000 here to live the same way.' },
  { q: 'Is Myrtle Beach cheaper than Charlotte or Raleigh?',
    a: 'A little cheaper day to day, and a lot cheaper on the house. The typical home here costs about $342,000. In Charlotte it is about $389,000 and in Raleigh about $437,000.' },
  { q: 'What costs more in Myrtle Beach than people expect?',
    a: 'Three things. Home insurance, because near the coast you often need wind, hail and flood cover on top of a normal policy. The yearly tax on your car, which many states do not charge. And the tax on a second home, which is about three times the tax on a main home.' },
  { q: 'Where does the calculator get its data?',
    a: 'Prices come from the US Bureau of Economic Analysis, which measures what things cost in 387 metro areas and every state. Home values and rents come from Zillow. Both are averages for a whole metro area, not a quote for one house.' },
  { q: 'Does the calculator include South Carolina taxes?',
    a: 'No. It compares what goods, rent and services cost. It does not cover income tax, property tax or car tax. Those are covered further down this page.' },
];

/* ---------- the calculator ----------
 * Forbes layout, Chapter3 branding: income, starting city, destination,
 * Calculate button, one big number, plain result lines. */
const CALC_HTML = `
<section style="background:var(--ivory-2)" id="col-calc"><div class="wrap"><p style="${S.eyebrow}">The calculator</p><h2 style="${S.h2}">Compare your city with Myrtle Beach</h2>
<div style="max-width:720px;background:#fff;border:1px solid var(--rule);border-radius:14px;padding:1.6rem">
<div style="margin-bottom:1.1rem"><label style="${S.label}" for="colIncome">My household income before tax</label><input class="idx-input" id="colIncome" type="text" inputmode="numeric" value="75,000" autocomplete="off"></div>
<div style="margin-bottom:1.1rem"><label style="${S.label}" for="colFrom">My city now</label><select class="idx-select" id="colFrom"><option value="">Loading&hellip;</option></select></div>
<div style="margin-bottom:1.3rem"><label style="${S.label}" for="colTo">I want to live in</label><select class="idx-select" id="colTo" disabled><option>Myrtle Beach, SC</option></select></div>
<button class="btn btn-brass" style="width:100%" id="colGo" onclick="colCalc()">Calculate</button>
<div id="colOut" aria-live="polite" style="border-top:1px solid var(--rule);margin-top:1.5rem;padding-top:1.4rem">
<p id="colLead" style="font-family:var(--sans);font-size:.95rem;color:var(--muted);line-height:1.6;margin:0 0 .4rem">To live the same way in Myrtle Beach, you need a household income of:</p>
<p id="colBig" style="font-family:var(--serif);font-size:2.6rem;color:var(--brass);line-height:1;margin:0 0 1rem">&nbsp;</p>
<p id="colSub" style="font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.6;margin:0 0 .3rem"></p>
<p id="colDiff" style="font-family:var(--sans);font-size:1rem;color:var(--muted);line-height:1.6;margin:0 0 1.2rem"></p>
<div id="colLines" style="font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.9"></div>
</div>
<p style="${S.small}">Prices: US Bureau of Economic Analysis, 387 metro areas and every state. Homes and rent: Zillow, <span id="colZDate">latest month</span>. Averages for a whole metro area, not a quote for one home. Taxes are not included.</p>
</div>
<script src="/assets/col.js"></script>
<script>
// Declared before the data check so the Calculate button never throws if
// /assets/col.js fails to load. The real implementation replaces it below.
function colCalc(){}
(function(){
  var D=window.C3_COL;
  if(!D||!D.rows){document.getElementById('colLead').textContent='The comparison data did not load. Call 854.333.2135 and we will run it for you.';return;}
  var MB='myrtle-beach-conway-north-myrtle-beach-sc';
  var R={},rows=D.rows,i;
  for(i=0;i<rows.length;i++){R[rows[i][0]]=rows[i];}
  var sel=document.getElementById('colFrom'),inc=document.getElementById('colIncome');
  var big=document.getElementById('colBig'),lead=document.getElementById('colLead'),sub=document.getElementById('colSub'),diff=document.getElementById('colDiff'),lines=document.getElementById('colLines');
  document.getElementById('colZDate').textContent=zMonth(D.meta.zillowLatestMonth);
  var gM=document.createElement('optgroup');gM.label='Metro areas';
  var gS=document.createElement('optgroup');gS.label='Statewide averages';
  var us=document.createElement('option');us.value='us';us.textContent='United States average';sel.appendChild(us);
  for(i=0;i<rows.length;i++){var r=rows[i];if(r[3]==='us')continue;var o=document.createElement('option');o.value=r[0];o.textContent=r[1];(r[3]==='msa'?gM:gS).appendChild(o);}
  sel.appendChild(gM);sel.appendChild(gS);
  function money(n){return '$'+Math.round(n).toLocaleString('en-US');}
  function money100(n){return '$'+(Math.round(n/100)*100).toLocaleString('en-US');}
  function zMonth(iso){if(!iso)return 'latest month';var p=iso.split('-');var M=['January','February','March','April','May','June','July','August','September','October','November','December'];return M[parseInt(p[1],10)-1]+' '+p[0];}
  function readIncome(){var v=parseFloat((inc.value||'').replace(/[^0-9.]/g,''));return isFinite(v)&&v>0?v:0;}
  function place(r){return r[3]==='us'?'the average US city':r[1].replace(' (statewide average)','');}
  // "12.3% less" / "4.0% more" / "about the same"
  function gap(from,to){
    if(!from||!to)return null;
    var d=to/from;
    if(Math.abs(d-1)<0.005)return {word:'about the same',pct:0};
    var p=(Math.abs(1-d)*100).toFixed(1);
    return d<1?{word:p+'% less',pct:-p}:{word:p+'% more',pct:+p};
  }
  function line(label,verb,g){
    if(!g)return '';
    return '<div>'+label+' '+verb+' <strong style="color:'+(g.pct<0?'#2f6b3a':(g.pct>0?'#a03333':'var(--navy)'))+'">'+g.word+'</strong>.</div>';
  }
  window.colCalc=function(){
    var f=R[sel.value],t=R[MB];
    if(!f||!t){return;}
    if(f[0]===MB){lead.textContent='That is Myrtle Beach. Pick the city you live in now.';big.innerHTML='&nbsp;';sub.textContent='';diff.textContent='';lines.innerHTML='';return;}
    var income=readIncome();
    var ratio=t[4]/f[4], need=income*ratio, g=gap(f[4],t[4]);
    lead.textContent='To live the same way in Myrtle Beach, you need a household income of:';
    big.textContent=income>0?money100(need):'\\u2014';
    // "about the same AS", but "12% less THAN". Getting this wrong reads as broken English.
    sub.textContent=g.pct===0
      ? 'The cost of living is about the same in Myrtle Beach as in '+place(f)+'.'
      : 'The cost of living is '+g.word+' in Myrtle Beach than in '+place(f)+'.';
    diff.textContent=income>0?('That is '+money100(Math.abs(income-need))+(need<income?' less':' more')+' than you earn now.'):'Enter your income to see the number.';
    var html='';
    if(f[3]==='msa'&&f[9]&&t[9])html+=line('Homes','cost',gap(f[9],t[9]));
    if(f[3]==='msa'&&f[10]&&t[10])html+=line('Rent','costs',gap(f[10],t[10]));
    html+=line('Power, water and gas','cost',gap(f[7],t[7]));
    html+=line('Food and everyday items','cost',gap(f[5],t[5]));
    html+=line('Health care and other services','cost',gap(f[8],t[8]));
    lines.innerHTML=html;
    try{var u=new URL(location.href);u.searchParams.set('from',f[0]);if(income>0)u.searchParams.set('income',String(Math.round(income)));else u.searchParams.delete('income');history.replaceState(null,'',u.pathname+u.search+u.hash);}catch(e){}
  };
  sel.addEventListener('change',window.colCalc);
  inc.addEventListener('input',window.colCalc);
  inc.addEventListener('blur',function(){var v=readIncome();if(v>0)inc.value=Math.round(v).toLocaleString('en-US');});
  var start='new-york-newark-jersey-city-ny-nj';
  try{var q=new URLSearchParams(location.search);var qf=q.get('from');if(qf&&R[qf])start=qf;var qi=parseFloat(q.get('income'));if(isFinite(qi)&&qi>0)inc.value=Math.round(qi).toLocaleString('en-US');}catch(e){}
  sel.value=start; window.colCalc();
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
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Cost of Living</span></div><p class="eyebrow" style="margin-bottom:1rem">Cost of living calculator</p><h1 class="detail-h1">Cost of living in Myrtle Beach<br/><em style="font-style:italic;color:var(--brass)">compared with your city.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">It costs about 6 percent less to live here than in the average US city. Enter your income and your city to see what you would need in Myrtle Beach.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#col-calc">Compare my city</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>
${CALC_HTML}

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">What it costs to live in Myrtle Beach</h2><p style="${S.p}">Living here costs about 6 percent less than the average US city. Rent is the main reason. It runs about 17 percent below average. Power, food and everyday items are close to normal.</p><p style="${S.p}">Homes are the bigger difference for a buyer. The typical home here costs about $342,000. In the New York area it is about $737,000. In Boston about $742,000, in Washington about $580,000 and in Philadelphia about $392,000.</p><p style="${S.pLast}">Not every move saves you money on a house. In Cleveland the typical home is about $254,000 and in Pittsburgh about $232,000. Both are cheaper than here. If you are coming from the Midwest, use the calculator before you assume the coast is a bargain.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Real bills</p><h2 style="${S.h2}">What we actually pay each month</h2><p style="${S.p}">These are our own bills, not an area average. A 1,400 square foot two-story house runs about $119.89 for power and about $51.42 for water. Your bill moves with the size of the house and how cold you keep it.</p><p style="${S.p}">Internet runs about $40 to $75 a month. Most addresses can choose between a local fiber co-op and cable, so it is worth getting both prices.</p><h3 style="${S.h3}">Your power bill works differently here</h3><p style="${S.p}">Both power companies in Horry County charge you twice. You pay for the power you use. You also pay for your highest single hour of use that month. That second charge is $8 to $12 for each kilowatt in that one hour.</p><p style="${S.p}">The hours that count are 3pm to 6pm from April to October, and 6am to 9am from November to March. Run the dryer, the oven and the pool pump together at 5pm in July and you pay for it all month. Spread them out and the same power costs less.</p><p style="${S.pLast}">Both companies also run a credit check and may ask for a deposit. Water and sewer outside the city needs one day of notice, so call before you move in. Who serves your street is on our ${A('/buyers/relocating/moving-checklist/', 'moving checklist')}.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Taxes and insurance</p><h2 style="${S.h2}">Taxes are lower here. Insurance costs more.</h2><p style="${S.p}">Taxes drop for almost everyone who moves here, and the drop is bigger than the price difference on food or power. Here is how.</p><h3 style="${S.h3}">Income tax</h3><p style="${S.p}">South Carolina charges 1.99 percent on your first $30,000 and 5.21 percent above that. No city or county adds its own income tax. Social Security is not taxed. Military retirement pay is not taxed. Other pensions get a deduction of up to $3,000 before you turn 65, and up to $10,000 after, plus a further $15,000 deduction at 65 against any income.</p><h3 style="${S.h3}">Property tax</h3><p style="${S.p}">A main home is taxed at 4 percent of its value. A second home or a rental is taxed at 6 percent, and pays the school tax too. On a $350,000 house that is about $1,300 a year as a main home, or about $4,200 as a second home. You have to apply for the lower rate yourself. Our ${A('/buyers/property-taxes/', 'property tax page')} has the form and the calculator.</p><h3 style="${S.h3}">Car tax, which is new for most people</h3><p style="${S.p}">South Carolina taxes your car every year. New York, New Jersey, Pennsylvania and Ohio do not. North Carolina, Virginia and Massachusetts already do, so check yours. A $30,000 car costs about $360 a year outside the city and about $460 inside Myrtle Beach, plus a $50 road fee. You also pay $250 once per car when you first register it here.</p><h3 style="${S.h3}">Sales tax and gas</h3><p style="${S.p}">Sales tax is 8 percent in the county and 9 percent inside Myrtle Beach. Food you cook at home is not taxed at all. Gas is cheaper here than almost anywhere you are moving from. In the middle of this year it was about 45 cents a gallon below the national average, about 60 cents below Ohio and about 50 cents below New York. You can ${X('https://gasprices.aaa.com/state-gas-price-averages/', 'check today&#39;s prices by state')} yourself.</p><h3 style="${S.h3}">Insurance goes the other way</h3><p style="${S.p}">Near the coast you often need three policies, not one: home, wind and hail, and flood. Each is priced on its own. Two houses on the same street can cost very different amounts, based on the age of the roof, how high the land sits and how far it is from water. Get real quotes before you buy, not after. Our ${A('/buyers/coastal-insurance/', 'insurance page')} explains the parts.</p><p style="${S.pLast}">Car insurance depends on where you live now. South Carolina averages about $2,288 a year for full cover. That is less than New Jersey at about $3,661 and New York at about $2,676. It is more than Ohio at about $1,799 and North Carolina at about $1,789.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want these numbers for a real address?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Run my numbers</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

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
