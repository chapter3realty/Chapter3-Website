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
const UI_JS = "\n(function(){\n  var $=function(id){return document.getElementById(id);};\n  var wrap=$('txcWrap'), st=$('txcState');\n  if(!wrap||!st||!window.C3TAX){return;}\n  var T=window.C3TAX, mfj=true, is65=false, localChoice=null, touched={};\n  var FIELDS=['txcWages','txcPension','txcSS','txcMil','txcHomeNow','txcHomeHere'];\n  var KEYS={txcWages:'wages',txcPension:'pension',txcSS:'ss',txcMil:'military',txcHomeNow:'homeNow',txcHomeHere:'homeHere'};\n\n  function money(x){return '$'+Math.round(x).toLocaleString('en-US');}\n  function num(el){return parseFloat((el.value||'').replace(/[^0-9.]/g,''))||0;}\n  function commas(el){var v=num(el);el.value=v?v.toLocaleString('en-US'):'';}\n  function stale(on){wrap.classList.toggle('is-stale',!!on);}\n\n  function localSeg(){\n    var L=T.RULES[st.value].local, w=$('txcLocalWrap'), seg=$('txcLocalSeg');\n    seg.innerHTML='';\n    if(!L||L.kind==='auto'){w.hidden=true;localChoice=null;return;}\n    w.hidden=false;\n    $('txcLocalQ').textContent=L.question;\n    var opts=L.kind==='yesno'?[['yes','Yes'],['no','No']]:L.options;\n    if(localChoice===null){localChoice=L.preset;}\n    opts.forEach(function(o){\n      var b=document.createElement('button');\n      b.type='button';b.textContent=o[1];b.setAttribute('aria-pressed',String(o[0]===localChoice));\n      b.addEventListener('click',function(){\n        localChoice=o[0];\n        Array.prototype.forEach.call(seg.children,function(c){c.setAttribute('aria-pressed',String(c===b));});\n        stale(true);\n      });\n      seg.appendChild(b);\n    });\n  }\n\n  function read(){\n    var v={state:st.value,mfj:mfj,is65:is65,localChoice:localChoice};\n    FIELDS.forEach(function(id){v[KEYS[id]]=num($(id));});\n    return v;\n  }\n\n  function fill(ex){\n    FIELDS.forEach(function(id){\n      var el=$(id), val=ex[KEYS[id]];\n      el.value=val?val.toLocaleString('en-US'):'';\n      el.classList.add('is-example');\n    });\n    touched={};\n  }\n\n  function render(v,isExample){\n    var r=T.calc(v), R=T.RULES[v.state];\n    $('txcCap').textContent=isExample?('Example: a couple leaving '+R.name):'Your numbers, estimated';\n    $('txcNowH').textContent=R.name;\n    $('txcNowInc').textContent=money(r.now.income);\n    $('txcHereInc').textContent=money(r.here.income);\n    $('txcNowProp').textContent=money(r.now.property);\n    $('txcHereProp').textContent=money(r.here.property);\n    $('txcNowTot').textContent=money(r.now.total);\n    $('txcHereTot').textContent=money(r.here.total);\n    var row=$('txcLocalRow');\n    if(r.now.local>0){row.hidden=false;$('txcLocalLab').textContent=r.now.localLabel;$('txcNowLocal').textContent=money(r.now.local);}\n    else{row.hidden=true;}\n    var d=r.difference;\n    if(d>0){\n      $('txcBig').textContent=money(d)+' less a year';\n      $('txcMo').textContent='About '+money(d/12)+' a month, in tax alone.';\n    }else if(d<0){\n      $('txcBig').textContent=money(-d)+' more a year';\n      $('txcMo').textContent='Not every move saves tax money. We would rather show you that now than after you buy.';\n    }else{\n      $('txcBig').textContent='About the same';\n      $('txcMo').textContent='The tax side is a wash here. The house price is usually where the difference shows up.';\n    }\n    var ten=$('txcTen');\n    if(d>0&&r.tenYear>0){ten.hidden=false;\n      ten.innerHTML='Ten years at today&#39;s rates: about <b>'+money(r.tenYear)+'</b>'+(r.equity>0?', tax and the house together.':'.');}\n    else{ten.hidden=true;}\n    var parts=[], pp=r.now.property-r.here.property, pi=r.now.income-r.here.income, pl=r.now.local;\n    if(pp>0)parts.push('property tax '+money(pp));\n    if(pi>0)parts.push('income tax '+money(pi));\n    if(pl>0){var ll=r.now.localLabel||'Local income tax';\n      if(!/^(New York|Yonkers)/.test(ll))ll=ll.charAt(0).toLowerCase()+ll.slice(1);\n      parts.push(ll+' '+money(pl));}\n    var line='';\n    if(parts.length)line='Where you save: '+parts.join(', ')+' a year';\n    if(r.equity>0)line+=(line?', plus about ':'Where you save: about ')+'<b>'+money(r.equity)+'</b> on the house, and a smaller loan with it';\n    if(line)line+='.';\n    if(r.cheaper.gas&&r.cheaper.goods)line+=' Groceries and the gas tax are lower here too.';\n    else if(r.cheaper.goods)line+=' Groceries cost less here too.';\n    else if(r.cheaper.gas)line+=' The gas tax is lower here too.';\n    if(r.propNote)line+=(line?' ':'')+r.propNote;\n    $('txcFrom').innerHTML=line;\n    var note=R.local&&R.local.note?' '+R.local.note:'';\n    var src=$('txcSrc');\n    if(note&&src.getAttribute('data-base')===null){src.setAttribute('data-base',src.textContent);}\n    stale(false);\n  }\n\n  function calculate(){render(read(),false);}\n\n  st.addEventListener('change',function(){localChoice=null;localSeg();fill(T.example(st.value));stale(true);});\n  $('txcSingle').addEventListener('click',function(){mfj=false;this.setAttribute('aria-pressed','true');$('txcJoint').setAttribute('aria-pressed','false');stale(true);});\n  $('txcJoint').addEventListener('click',function(){mfj=true;this.setAttribute('aria-pressed','true');$('txcSingle').setAttribute('aria-pressed','false');stale(true);});\n  $('txcAgeNo').addEventListener('click',function(){is65=false;this.setAttribute('aria-pressed','true');$('txcAgeYes').setAttribute('aria-pressed','false');stale(true);});\n  $('txcAgeYes').addEventListener('click',function(){is65=true;this.setAttribute('aria-pressed','true');$('txcAgeNo').setAttribute('aria-pressed','false');stale(true);});\n  FIELDS.forEach(function(id){\n    var el=$(id);\n    el.addEventListener('input',function(){el.classList.remove('is-example');touched[id]=true;stale(true);});\n    el.addEventListener('blur',function(){commas(el);});\n  });\n  $('txcGo').addEventListener('click',calculate);\n  $('txcReset').addEventListener('click',function(){localChoice=null;localSeg();fill(T.example(st.value));render(T.example(st.value),true);});\n\n  localSeg();\n  var ex=T.example(st.value);\n  fill(ex);\n  render(ex,true);\n})();\n";
const crypto = require('crypto');

/* The calculator script used to be embedded verbatim into every page, which
 * cost each of the eleven pages ~24KB of identical inline JS and re-parsed it
 * on every view. It is now written once to /assets/taxcalc.<hash>.js at
 * require time (content-hashed, so a changed engine gets a new URL and every
 * page must be reassembled, which build.js check enforces via the broken-ref
 * gate) and each page emits one cached <script src> instead. The engine is
 * still read from tax-engine.js at build time, so the pages, the asset and
 * data/relocating/test-tax.js can never disagree. */
let _calcSrc = ENGINE + UI_JS;
/* Minified when uglify-js is installed (it is, globally, in the build
 * environment); shipped readable otherwise. Deterministic either way, so the
 * hash is stable for a given engine + UI + toolchain. */
try {
  const ug = require('uglify-js');
  const out = ug.minify(_calcSrc, { compress: { passes: 2 }, mangle: true });
  if (!out.error && out.code) _calcSrc = out.code;
} catch (e) { /* uglify not installed: ship readable */ }
const CALC_JS = _calcSrc;
// Same scheme as build.js rehash (md5, 10 hex chars), so the two naming
// authorities can never disagree about this file's name.
const CALC_HASH = crypto.createHash('md5').update(CALC_JS).digest('hex').slice(0, 10);
const CALC_REL = `/assets/taxcalc.${CALC_HASH}.js`;
{
  const assetsDir = path.join(__dirname, '..', '..', 'chapter3realty', 'assets');
  const target = path.join(assetsDir, `taxcalc.${CALC_HASH}.js`);
  for (const f of fs.readdirSync(assetsDir)) {
    if (/^taxcalc\.[0-9a-f]{10}\.js$/.test(f) && f !== `taxcalc.${CALC_HASH}.js`) fs.unlinkSync(path.join(assetsDir, f));
  }
  fs.writeFileSync(target, CALC_JS);
}


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
.txc-ten{font-family:var(--sans);font-size:.92rem;line-height:1.55;color:var(--brass-2);border-top:1px solid rgba(244,239,232,.18);padding-top:.85rem;margin:0 0 1.2rem}
.txc-ten b{color:var(--ivory);font-weight:700;font-size:1.05rem}
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
  // Only an explicit preselect names the state in the H2. The default 'NY'
  // above is a fallback for the generic page, and its heading must stay
  // generic - a "What New York taxes you now" H2 on the cost of living page
  // would be wrong.
  const h2Text = o.preselect
    ? 'What ' + NAMES[o.preselect] + ' taxes you now, and what South Carolina would'
    : 'What you pay in taxes now, and what you would pay here';
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
<h2 style="${S.h2}">${h2Text}</h2>
<p style="${S.p}">It opens on a real example. Change any line to your own numbers and press Calculate. It estimates the income tax, the local income tax where your town charges one, and the property tax on both ends, and the difference in home price. Estimates, not facts. Nothing you type leaves your browser.</p>
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
    <p class="txc-ten" id="txcTen" hidden></p>
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
<p class="txc-src" id="txcSrc">An estimate, not a fact. Rates, brackets and retirement rules come from each state&#39;s own department of revenue and statutes for 2026, and the Myrtle Beach property tax uses Horry County&#39;s 2025 certified millage for an owner-occupied home outside the city limits, with the 4 percent residential ratio, the school operating exemption and the 65 and older homestead exemption. Left out on both sides: federal tax, car taxes, insurance, and any credit that depends on your own return. Where a state rule is too detailed to model we leave it out, and almost every one of those left out would RAISE the bill in the state you are leaving, not lower it: Connecticut&#39;s tax recapture, New York&#39;s supplemental tax, and the exemption phase-outs in Maryland and Ohio. Three would LOWER it, and we name them: Pennsylvania&#39;s tax forgiveness and the Massachusetts senior circuit breaker are low-income credits we do not apply, and Florida caps how fast a homesteaded home&#39;s assessed value can rise, so a long-held Florida home&#39;s real bill is below our estimate. If one of those is you, your bill in the state you are leaving is lower than we show. Insurance is a separate cost to check on this coast, usually higher here than in the states up north; coming from coastal Florida it is priced address by address, in both directions. The ${A('/buyers/coastal-insurance/', 'coastal insurance page')} has the real numbers. Your accountant gives you the final answer, and we will sit down and go through it with you.</p>
</div></section>

<script src="${CALC_REL}" defer></script>`;
}

module.exports = { taxCalcSection, ORDER };
