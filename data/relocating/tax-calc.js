/* Builds the tax comparison section that goes on every from-state page.
 *
 * Usage from a page spec:
 *     const { taxCalcSection } = require('../tax-calc.js');
 *     ... ${taxCalcSection({ preselect: 'CT' })} ...
 *
 * The arithmetic lives in tax-engine.js and is embedded here verbatim, so the
 * page and data/relocating/test-tax.js can never disagree. Nothing here
 * fetches anything: the whole tool runs in the reader's browser.
 *
 * Owner rules this design answers (2026-08-28):
 *   - It must not recalculate while someone types. A half-filled form showed a
 *     small saving and read as a let-down. Nothing moves until Calculate.
 *   - It opens on a worked example, in muted type, so the first thing anyone
 *     sees is a real number rather than zeroes.
 *   - No tax-rate boxes. New York asks whether you live in the city; Ohio and
 *     Pennsylvania ask whether your town charges one; Maryland just applies the
 *     state average. Our estimate, not the reader's homework.
 *   - The result names where the difference comes from.
 */
'use strict';
const fs = require('fs'), path = require('path');

const ENGINE = fs.readFileSync(path.join(__dirname, 'tax-engine.js'), 'utf8');

// The order the dropdown offers. Origin states with their own page first.
const ORDER = ['NY', 'NJ', 'PA', 'OH', 'MD', 'VA', 'NC', 'CT', 'MA', 'FL', 'TX'];
const NAMES = { NY: 'New York', NJ: 'New Jersey', PA: 'Pennsylvania', OH: 'Ohio', MD: 'Maryland', VA: 'Virginia', NC: 'North Carolina', CT: 'Connecticut', MA: 'Massachusetts', FL: 'Florida', TX: 'Texas' };

const CSS = `
<style>
.txc{display:grid;grid-template-columns:minmax(300px,380px) 1fr;gap:0;max-width:940px;border:1px solid var(--rule);border-radius:10px;overflow:hidden;background:var(--white)}
.txc-form{padding:1.7rem 1.7rem 1.5rem;background:var(--white)}
.txc-leg{font-family:var(--sans);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);font-weight:700;margin:0 0 .9rem}
.txc-leg+.txc-leg,.txc-grp+.txc-leg{margin-top:1.5rem}
.txc-f{margin-bottom:.85rem}
.txc-lab{display:block;font-family:var(--sans);font-size:.78rem;color:var(--muted);margin-bottom:.3rem}
.txc-money{position:relative}
.txc-money span{position:absolute;left:.7rem;top:50%;transform:translateY(-50%);font-family:var(--sans);font-size:.9rem;color:var(--slate);pointer-events:none}
.txc-in,.txc-sel{width:100%;padding:.62rem .8rem;font-family:var(--sans);font-size:.95rem;background:var(--white);border:1px solid var(--rule);border-radius:6px;color:var(--navy);outline:none;transition:border-color .15s,box-shadow .15s}
.txc-money .txc-in{padding-left:1.55rem}
.txc-in:focus,.txc-sel:focus{border-color:var(--brass);box-shadow:0 0 0 3px rgba(196,120,58,.15)}
.txc-in.is-example{color:var(--slate)}
.txc-seg{display:flex;gap:.35rem}
.txc-seg button{flex:1;padding:.55rem .35rem;font-family:var(--sans);font-size:.85rem;background:var(--white);border:1px solid var(--rule);border-radius:6px;color:var(--muted);cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.txc-seg button:hover{border-color:var(--brass)}
.txc-seg button[aria-pressed="true"]{background:var(--navy);border-color:var(--navy);color:var(--ivory);font-weight:600}
.txc-grp{margin-bottom:.85rem}
.txc-two{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;align-items:end}
.txc-two .txc-lab{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.txc-go{width:100%;justify-content:center;margin-top:1.1rem}
.txc-reset{display:block;width:100%;margin-top:.7rem;background:none;border:0;font-family:var(--sans);font-size:.78rem;color:var(--muted);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.txc-reset:hover{color:var(--navy)}

.txc-out{position:relative;background:var(--navy);color:var(--ivory);padding:1.9rem 1.8rem;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
.txc-out>*{width:100%;max-width:480px}
.txc-out>.txc-stale{max-width:none;width:auto}
.txc-cap{font-family:var(--sans);font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:var(--brass-2);font-weight:700;margin:0 0 .5rem}
.txc-big{font-family:var(--serif);font-size:2.5rem;line-height:1.08;color:var(--ivory);margin:0 0 .35rem;letter-spacing:-.01em}
.txc-mo{font-family:var(--sans);font-size:.88rem;color:rgba(244,239,232,.72);margin:0 0 1.2rem}
.txc-eq{font-family:var(--sans);font-size:.88rem;line-height:1.6;color:var(--brass-2);border-top:1px solid rgba(244,239,232,.18);padding-top:.9rem;margin:0 0 1.2rem}
.txc-eq b{color:var(--ivory);font-weight:600}
.txc-tab{width:100%;table-layout:fixed;border-collapse:collapse;font-family:var(--sans);font-size:.86rem;margin-bottom:.9rem}
.txc-tab th{text-align:right;font-weight:600;font-size:.62rem;letter-spacing:.03em;text-transform:uppercase;color:rgba(244,239,232,.6);padding:0 0 .5rem;border-bottom:1px solid rgba(244,239,232,.18);white-space:nowrap}
.txc-tab th:first-child{width:36%}
.txc-tab th:nth-child(2),.txc-tab th:nth-child(3){width:32%}
.txc-tab th:first-child{text-align:left}
.txc-tab td{padding:.5rem 0;border-bottom:1px solid rgba(244,239,232,.12);color:rgba(244,239,232,.82);text-align:right;white-space:nowrap}
.txc-tab td:first-child{text-align:left;white-space:normal;padding-right:.6rem}
.txc-tab tr.tot td{border-bottom:0;padding-top:.7rem;color:var(--ivory);font-weight:700;font-size:.95rem}
.txc-tab td.hi{color:var(--brass-2);font-weight:600}
.txc-est{font-family:var(--sans);font-size:.78rem;line-height:1.6;color:rgba(244,239,232,.62);margin:0 0 .7rem}
.txc-from{font-family:var(--sans);font-size:.82rem;line-height:1.65;color:rgba(244,239,232,.72);margin:0 0 1.2rem}
.txc-from b{color:var(--ivory);font-weight:600}
.txc-cta{margin-top:.2rem}
.txc-stale{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(11,22,40,.82);backdrop-filter:blur(1px);z-index:3}
.txc-stale p{font-family:var(--sans);font-size:.9rem;color:var(--ivory);text-align:center;max-width:230px;line-height:1.6;margin:0}
.txc.is-stale .txc-stale{display:flex}
.txc-src{font-family:var(--sans);font-size:.76rem;color:var(--muted);line-height:1.65;max-width:940px;margin-top:1.1rem}
@media(max-width:840px){.txc{grid-template-columns:1fr}.txc-form{padding:1.3rem}.txc-out{padding:1.5rem 1.3rem}.txc-big{font-size:2.1rem}.txc-tab{font-size:.82rem}.txc-tab th{font-size:.55rem;letter-spacing:.01em}.txc-tab th:first-child{width:32%}.txc-tab th:nth-child(2),.txc-tab th:nth-child(3){width:34%}}
</style>`;

const A = (href, text) => `<a href="${href}" style="color:var(--brass);font-weight:600;text-decoration:none">${text}</a>`;

function taxCalcSection(opts) {
  const o = opts || {};
  const bg = o.bg || 'ivory-2';
  const pre = o.preselect || 'NY';
  const cta = o.cta || '#lead-form';
  const S = {
    eyebrow: 'font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600',
    h2: 'font-family:var(--serif);font-size:1.7rem;color:var(--navy);margin-bottom:1rem;letter-spacing:-.01em',
    p: 'color:var(--muted);line-height:1.75;max-width:720px;margin-bottom:1.5rem',
  };
  const options = ORDER.map(a => `<option value="${a}"${a === pre ? ' selected' : ''}>${NAMES[a]}</option>`).join('');
  const money = (id, label, extra) => `<div class="txc-f"><label class="txc-lab" for="${id}">${label}</label><div class="txc-money"><span>$</span><input class="txc-in is-example" id="${id}" type="text" inputmode="numeric" autocomplete="off"${extra || ''}></div></div>`;

  return `
<section style="background:var(--${bg})" id="tax-calc"><div class="wrap">
<p style="${S.eyebrow}">Side by side</p>
<h2 style="${S.h2}">What you pay in taxes now, and what you would pay here</h2>
<p style="${S.p}">It opens on a real example. Change any line to your own numbers and press Calculate. It estimates the income tax, the local income tax where your town charges one, and the property tax on both ends, and what the price of the house puts back in your pocket. Estimates, not facts. Nothing you type leaves your browser.</p>
${CSS}
<div class="txc" id="txcWrap">
  <div class="txc-form">
    <p class="txc-leg">Where you live now</p>
    <div class="txc-f"><label class="txc-lab" for="txcState">Your state</label><select class="txc-sel" id="txcState">${options}</select></div>
    <div class="txc-grp" id="txcLocalWrap" hidden><p class="txc-lab" id="txcLocalQ"></p><div class="txc-seg" id="txcLocalSeg" role="group" aria-label="Local income tax"></div></div>
    <div class="txc-grp"><p class="txc-lab">Who is filing</p><div class="txc-seg" role="group" aria-label="Filing status"><button type="button" id="txcSingle" aria-pressed="false">Just me</button><button type="button" id="txcJoint" aria-pressed="true">Married</button></div></div>
    <div class="txc-grp"><p class="txc-lab">Anyone 65 or older</p><div class="txc-seg" role="group" aria-label="Age 65 or older"><button type="button" id="txcAgeNo" aria-pressed="true">No</button><button type="button" id="txcAgeYes" aria-pressed="false">Yes</button></div></div>
    <p class="txc-leg">What you earn in a year</p>
    ${money('txcWages', 'Wages or business income')}
    ${money('txcPension', 'Pension, 401(k) or IRA withdrawals')}
    <div class="txc-two">${money('txcSS', 'Social Security')}${money('txcMil', 'Military retirement')}</div>
    <p class="txc-leg">The house</p>
    <div class="txc-two">${money('txcHomeNow', 'Your home now')}${money('txcHomeHere', 'A home here')}</div>
    <button class="btn btn-brass txc-go" id="txcGo">Calculate</button>
    <button type="button" class="txc-reset" id="txcReset">Put the example back</button>
  </div>
  <div class="txc-out" aria-live="polite">
    <p class="txc-cap" id="txcCap">Example</p>
    <p class="txc-big" id="txcBig">&nbsp;</p>
    <p class="txc-mo" id="txcMo">&nbsp;</p>
    <table class="txc-tab"><thead><tr><th>Every year</th><th id="txcNowH">Now</th><th>Myrtle Beach</th></tr></thead>
      <tbody>
        <tr><td>Income tax</td><td id="txcNowInc">$0</td><td id="txcHereInc">$0</td></tr>
        <tr id="txcLocalRow" hidden><td id="txcLocalLab">Local income tax</td><td id="txcNowLocal">$0</td><td>None</td></tr>
        <tr><td>Property tax</td><td id="txcNowProp">$0</td><td id="txcHereProp">$0</td></tr>
        <tr class="tot"><td>Total</td><td id="txcNowTot">$0</td><td class="hi" id="txcHereTot">$0</td></tr>
      </tbody></table>
    <p class="txc-from" id="txcFrom"></p>
    <p class="txc-est">These are estimates, not facts. Rules change, and your own numbers will not match to the dollar.</p>
    <div class="txc-cta"><a class="btn btn-brass" href="${cta}">Start your move to Myrtle</a></div>
    <div class="txc-stale"><p>Press Calculate to see your own numbers.</p></div>
  </div>
</div>
<p class="txc-src" id="txcSrc">An estimate, not a fact. Rates, brackets and retirement rules come from each state&#39;s own department of revenue and statutes for 2026, and the Myrtle Beach property tax uses Horry County&#39;s 2025 certified millage for an owner-occupied home outside the city limits, with the 4 percent residential ratio, the school operating exemption and the 65 and older homestead exemption. Left out on both sides: federal tax, car taxes, insurance, and any credit that depends on your own return. Where a state rule is too detailed to model we leave it out, and almost every one of those left out would RAISE the bill in the state you are leaving, not lower it: Connecticut&#39;s tax recapture, New York&#39;s supplemental tax, and the exemption phase-outs in Maryland and Ohio. Two run the other way and we would rather name them: Pennsylvania&#39;s tax forgiveness and the Massachusetts senior circuit breaker are low-income credits we do not apply, so if you qualify for one, your bill up north is lower than we show. Insurance is its own question on this coast and usually costs more here than up north; the ${A('/buyers/coastal-insurance/', 'coastal insurance page')} has the real numbers. Your accountant has the last word, and we will sit down and go through it with you.</p>
</div></section>

<script>
${ENGINE}
(function(){
  var $=function(id){return document.getElementById(id);};
  var wrap=$('txcWrap'), st=$('txcState');
  if(!wrap||!st||!window.C3TAX){return;}
  var T=window.C3TAX, mfj=true, is65=false, localChoice=null, touched={};
  var FIELDS=['txcWages','txcPension','txcSS','txcMil','txcHomeNow','txcHomeHere'];
  var KEYS={txcWages:'wages',txcPension:'pension',txcSS:'ss',txcMil:'military',txcHomeNow:'homeNow',txcHomeHere:'homeHere'};

  function money(x){return '$'+Math.round(x).toLocaleString('en-US');}
  function num(el){return parseFloat((el.value||'').replace(/[^0-9.]/g,''))||0;}
  function commas(el){var v=num(el);el.value=v?v.toLocaleString('en-US'):'';}
  function stale(on){wrap.classList.toggle('is-stale',!!on);}

  function localSeg(){
    var L=T.RULES[st.value].local, w=$('txcLocalWrap'), seg=$('txcLocalSeg');
    seg.innerHTML='';
    if(!L||L.kind==='auto'){w.hidden=true;localChoice=null;return;}
    w.hidden=false;
    $('txcLocalQ').textContent=L.question;
    var opts=L.kind==='yesno'?[['yes','Yes'],['no','No']]:L.options;
    if(localChoice===null){localChoice=L.preset;}
    opts.forEach(function(o){
      var b=document.createElement('button');
      b.type='button';b.textContent=o[1];b.setAttribute('aria-pressed',String(o[0]===localChoice));
      b.addEventListener('click',function(){
        localChoice=o[0];
        Array.prototype.forEach.call(seg.children,function(c){c.setAttribute('aria-pressed',String(c===b));});
        stale(true);
      });
      seg.appendChild(b);
    });
  }

  function read(){
    var v={state:st.value,mfj:mfj,is65:is65,localChoice:localChoice};
    FIELDS.forEach(function(id){v[KEYS[id]]=num($(id));});
    return v;
  }

  function fill(ex){
    FIELDS.forEach(function(id){
      var el=$(id), val=ex[KEYS[id]];
      el.value=val?val.toLocaleString('en-US'):'';
      el.classList.add('is-example');
    });
    touched={};
  }

  function render(v,isExample){
    var r=T.calc(v), R=T.RULES[v.state];
    $('txcCap').textContent=isExample?('Example: a couple leaving '+R.name):'Your numbers, estimated';
    $('txcNowH').textContent=R.name;
    $('txcNowInc').textContent=money(r.now.income);
    $('txcHereInc').textContent=money(r.here.income);
    $('txcNowProp').textContent=money(r.now.property);
    $('txcHereProp').textContent=money(r.here.property);
    $('txcNowTot').textContent=money(r.now.total);
    $('txcHereTot').textContent=money(r.here.total);
    var row=$('txcLocalRow');
    if(r.now.local>0){row.hidden=false;$('txcLocalLab').textContent=r.now.localLabel;$('txcNowLocal').textContent=money(r.now.local);}
    else{row.hidden=true;}
    var d=r.difference;
    if(d>0){
      $('txcBig').textContent=money(d)+' less a year';
      $('txcMo').textContent='About '+money(d/12)+' a month, in tax alone.';
    }else if(d<0){
      $('txcBig').textContent=money(-d)+' more a year';
      $('txcMo').textContent='Not every move saves tax money. We would rather show you that now than after you buy.';
    }else{
      $('txcBig').textContent='About the same';
      $('txcMo').textContent='The tax side is a wash here. The house price is usually where the difference shows up.';
    }
    var parts=[], pp=r.now.property-r.here.property, pi=r.now.income-r.here.income, pl=r.now.local;
    if(pp>0)parts.push('property tax '+money(pp));
    if(pi>0)parts.push('income tax '+money(pi));
    if(pl>0){var ll=r.now.localLabel||'Local income tax';
      if(!/^(New York|Yonkers)/.test(ll))ll=ll.charAt(0).toLowerCase()+ll.slice(1);
      parts.push(ll+' '+money(pl));}
    var line='';
    if(parts.length)line='Where you save: '+parts.join(', ')+' a year';
    if(r.equity>0)line+=(line?', plus about ':'Where you save: about ')+'<b>'+money(r.equity)+'</b> on the house, and a smaller loan with it';
    if(line)line+='.';
    if(r.cheaper.gas&&r.cheaper.goods)line+=' Groceries and the gas tax are lower here too.';
    else if(r.cheaper.goods)line+=' Groceries cost less here too.';
    else if(r.cheaper.gas)line+=' The gas tax is lower here too.';
    $('txcFrom').innerHTML=line;
    var note=R.local&&R.local.note?' '+R.local.note:'';
    var src=$('txcSrc');
    if(note&&src.getAttribute('data-base')===null){src.setAttribute('data-base',src.textContent);}
    stale(false);
  }

  function calculate(){render(read(),false);}

  st.addEventListener('change',function(){localChoice=null;localSeg();fill(T.example(st.value));stale(true);});
  $('txcSingle').addEventListener('click',function(){mfj=false;this.setAttribute('aria-pressed','true');$('txcJoint').setAttribute('aria-pressed','false');stale(true);});
  $('txcJoint').addEventListener('click',function(){mfj=true;this.setAttribute('aria-pressed','true');$('txcSingle').setAttribute('aria-pressed','false');stale(true);});
  $('txcAgeNo').addEventListener('click',function(){is65=false;this.setAttribute('aria-pressed','true');$('txcAgeYes').setAttribute('aria-pressed','false');stale(true);});
  $('txcAgeYes').addEventListener('click',function(){is65=true;this.setAttribute('aria-pressed','true');$('txcAgeNo').setAttribute('aria-pressed','false');stale(true);});
  FIELDS.forEach(function(id){
    var el=$(id);
    el.addEventListener('input',function(){el.classList.remove('is-example');touched[id]=true;stale(true);});
    el.addEventListener('blur',function(){commas(el);});
  });
  $('txcGo').addEventListener('click',calculate);
  $('txcReset').addEventListener('click',function(){localChoice=null;localSeg();fill(T.example(st.value));render(T.example(st.value),true);});

  localSeg();
  var ex=T.example(st.value);
  fill(ex);
  render(ex,true);
})();
</script>`;
}

module.exports = { taxCalcSection, ORDER };
