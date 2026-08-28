/* Builds the tax comparison section that goes on every from-state page.
 *
 * Usage from a page spec:
 *     const { taxCalcSection } = require('../tax-calc.js');
 *     ... ${taxCalcSection({ preselect: 'CT', bg: 'ivory-2' })} ...
 *
 * The arithmetic lives in tax-engine.js and is embedded here verbatim, so the
 * page and data/relocating/test-tax.js can never disagree. Nothing here
 * fetches anything: the whole tool runs in the reader's browser.
 */
'use strict';
const fs = require('fs'), path = require('path');

const ENGINE = fs.readFileSync(path.join(__dirname, 'tax-engine.js'), 'utf8');

// The order the dropdown offers. Origin states with their own page first.
const ORDER = ['NY', 'NJ', 'PA', 'OH', 'MD', 'VA', 'NC', 'CT', 'MA', 'FL', 'TX'];

const CSS = `
<style>
.txc{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);max-width:900px;display:grid;grid-template-columns:minmax(280px,360px) 1fr}
.txc-form{padding:1.8rem 1.9rem 1.8rem 0;border-right:1px solid var(--rule)}
.txc-res{padding:1.8rem 0 1.8rem 1.9rem}
.txc-lab{display:block;font-family:var(--sans);font-size:.62rem;letter-spacing:.13em;text-transform:uppercase;color:var(--slate);margin-bottom:.4rem;font-weight:500}
.txc-f{margin-bottom:1rem}
.txc-in,.txc-sel{width:100%;padding:.6rem .8rem;font-family:var(--sans);font-size:.92rem;background:var(--white);border:1px solid var(--rule);border-radius:4px;color:var(--navy);outline:none}
.txc-in:focus,.txc-sel:focus{border-color:var(--brass);box-shadow:0 0 0 3px rgba(196,120,58,.14)}
.txc-pair{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
.txc-seg{display:flex;gap:.4rem}
.txc-seg button{flex:1;padding:.55rem .3rem;font-family:var(--sans);font-size:.85rem;background:var(--white);border:1px solid var(--rule);border-radius:4px;color:var(--muted);cursor:pointer}
.txc-seg button[aria-pressed="true"]{background:var(--navy);border-color:var(--navy);color:var(--ivory);font-weight:600}
.txc-check{display:flex;align-items:center;gap:.55rem;font-family:var(--sans);font-size:.88rem;color:var(--navy);cursor:pointer;margin:.2rem 0 1rem}
.txc-check input{width:16px;height:16px;accent-color:var(--brass)}
.txc-hint{font-family:var(--sans);font-size:.72rem;color:var(--muted);margin:.35rem 0 0;line-height:1.5}
.txc-sub{font-family:var(--sans);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brass);margin:1.5rem 0 .7rem;font-weight:600}
.txc-cols{display:grid;grid-template-columns:1fr 1fr;gap:1.4rem}
.txc-col h3{font-family:var(--sans);font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);margin:0 0 .8rem;font-weight:600}
.txc-col.here h3{color:var(--brass)}
.txc-row{display:flex;justify-content:space-between;gap:.6rem;padding:.5rem 0;border-bottom:1px solid var(--rule);font-family:var(--sans);font-size:.86rem;color:var(--muted)}
.txc-row b{color:var(--navy);font-weight:600;white-space:nowrap}
.txc-tot{display:flex;justify-content:space-between;gap:.6rem;padding:.7rem 0 0;font-family:var(--sans);font-size:.9rem;color:var(--navy);font-weight:600}
.txc-tot span:last-child{font-family:var(--serif);font-size:1.45rem;font-weight:400}
.txc-big{font-family:var(--serif);font-size:2rem;color:var(--navy);line-height:1.15;margin:1.5rem 0 .3rem}
.txc-big em{font-style:normal;color:var(--brass)}
.txc-note{font-family:var(--sans);font-size:.8rem;color:var(--muted);line-height:1.6;margin:0 0 1.1rem;max-width:420px}
.txc-src{font-family:var(--sans);font-size:.76rem;color:var(--muted);line-height:1.6;max-width:900px;margin-top:1.2rem}
@media(max-width:820px){.txc{grid-template-columns:1fr}.txc-form{padding:1.4rem 0;border-right:0;border-bottom:1px solid var(--rule)}.txc-res{padding:1.4rem 0}}
</style>`;

function taxCalcSection(opts) {
  const o = opts || {};
  const bg = o.bg || 'ivory-2';
  const pre = o.preselect || '';
  const cta = o.cta || '#lead-form';
  const S = {
    eyebrow: 'font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600',
    h2: 'font-family:var(--serif);font-size:1.7rem;color:var(--navy);margin-bottom:1rem;letter-spacing:-.01em',
    p: 'color:var(--muted);line-height:1.75;max-width:720px;margin-bottom:1.4rem',
  };
  const options = ORDER.map(a => {
    const name = { NY: 'New York', NJ: 'New Jersey', PA: 'Pennsylvania', OH: 'Ohio', MD: 'Maryland', VA: 'Virginia', NC: 'North Carolina', CT: 'Connecticut', MA: 'Massachusetts', FL: 'Florida', TX: 'Texas' }[a];
    return `<option value="${a}"${a === pre ? ' selected' : ''}>${name}</option>`;
  }).join('');

  return `
<section style="background:var(--${bg})" id="tax-calc"><div class="wrap">
<p style="${S.eyebrow}">Side by side</p>
<h2 style="${S.h2}">What you pay in taxes now, and what you would pay here</h2>
<p style="${S.p}">Put in what you earn, how you earn it, and what your house is worth. It works out the state income tax and the property tax on both ends, and shows them next to each other. Nothing you type leaves your browser.</p>
${CSS}
<div class="txc">
  <div class="txc-form">
    <div class="txc-f"><label class="txc-lab" for="txcState">Where you live now</label><select class="txc-sel" id="txcState">${options}</select></div>
    <div class="txc-f"><span class="txc-lab">Who is filing</span><div class="txc-seg" role="group" aria-label="Filing status"><button type="button" id="txcSingle" aria-pressed="true">Just me</button><button type="button" id="txcJoint" aria-pressed="false">Married, together</button></div></div>
    <label class="txc-check"><input type="checkbox" id="txc65"> Someone is 65 or older</label>
    <p class="txc-sub">How you earn it, per year</p>
    <div class="txc-f"><label class="txc-lab" for="txcWages">Wages or business income</label><input class="txc-in" id="txcWages" type="text" inputmode="numeric" placeholder="0" autocomplete="off"></div>
    <div class="txc-f"><label class="txc-lab" for="txcPension">Pension, 401(k) or IRA withdrawals</label><input class="txc-in" id="txcPension" type="text" inputmode="numeric" placeholder="0" autocomplete="off"></div>
    <div class="txc-pair"><div class="txc-f"><label class="txc-lab" for="txcSS">Social Security</label><input class="txc-in" id="txcSS" type="text" inputmode="numeric" placeholder="0" autocomplete="off"></div>
    <div class="txc-f"><label class="txc-lab" for="txcMil">Military retirement</label><input class="txc-in" id="txcMil" type="text" inputmode="numeric" placeholder="0" autocomplete="off"></div></div>
    <p class="txc-sub">The house</p>
    <div class="txc-pair"><div class="txc-f"><label class="txc-lab" for="txcHomeNow">Your home now</label><input class="txc-in" id="txcHomeNow" type="text" inputmode="numeric" placeholder="450,000" autocomplete="off"></div>
    <div class="txc-f"><label class="txc-lab" for="txcHomeHere">A home here</label><input class="txc-in" id="txcHomeHere" type="text" inputmode="numeric" value="342,000" autocomplete="off"></div></div>
    <div class="txc-f" id="txcLocalWrap" hidden><label class="txc-lab" id="txcLocalLab" for="txcLocal">Local income tax rate</label><input class="txc-in" id="txcLocal" type="text" inputmode="decimal" placeholder="0" autocomplete="off"><p class="txc-hint" id="txcLocalHint"></p></div>
    <button class="btn btn-brass" id="txcGo" style="width:100%;justify-content:center;margin-top:.4rem">Show me both</button>
  </div>
  <div class="txc-res" aria-live="polite">
    <div class="txc-cols">
      <div class="txc-col"><h3 id="txcNowH">Where you live now</h3>
        <div class="txc-row"><span>State income tax</span><b id="txcNowInc">$0</b></div>
        <div class="txc-row" id="txcNowLocalRow" hidden><span id="txcNowLocalLab">Local income tax</span><b id="txcNowLocal">$0</b></div>
        <div class="txc-row"><span>Property tax</span><b id="txcNowProp">$0</b></div>
        <div class="txc-tot"><span>A year</span><span id="txcNowTot">$0</span></div>
      </div>
      <div class="txc-col here"><h3>In Myrtle Beach</h3>
        <div class="txc-row"><span>State income tax</span><b id="txcHereInc">$0</b></div>
        <div class="txc-row" id="txcHereLocalRow" hidden><span>Local income tax</span><b>None</b></div>
        <div class="txc-row"><span>Property tax</span><b id="txcHereProp">$0</b></div>
        <div class="txc-tot"><span>A year</span><span id="txcHereTot">$0</span></div>
      </div>
    </div>
    <p class="txc-big" id="txcBig">Fill in what you earn.</p>
    <p class="txc-note" id="txcNote">Every figure updates as you type.</p>
    <a class="btn btn-brass" href="${cta}">Have an expert check my numbers</a>
  </div>
</div>
<p class="txc-src">An estimate, not a tax return. State rates, brackets and retirement rules come from each state&#39;s own department of revenue and statutes for 2026; the Myrtle Beach property tax uses Horry County&#39;s 2025 certified millage for an owner-occupied home outside the city limits, with the 4 percent residential ratio, the school operating exemption and the 65 and older homestead exemption. It leaves out federal tax, city and county income taxes unless you enter one, car taxes, and every credit that depends on your own return. Connecticut&#39;s exemption phase-out and benefit recapture are left out too, so a large Connecticut income shows lower here than you would really pay. Your accountant has the last word, and we will happily sit with you and go through it.</p>
</div></section>

<script>
${ENGINE}
(function(){
  var $=function(id){return document.getElementById(id);};
  var st=$('txcState'),single=$('txcSingle'),joint=$('txcJoint'),age=$('txc65');
  if(!st||!window.C3TAX){return;}
  var mfj=false;
  function num(el){var v=(el.value||'').replace(/[^0-9.]/g,'');return parseFloat(v)||0;}
  function money(x){return '$'+Math.round(x).toLocaleString('en-US');}
  function localCfg(){var R=window.C3TAX.RULES[st.value];return R?R.local:null;}
  function syncLocal(){
    var cfg=localCfg(),wrap=$('txcLocalWrap');
    if(cfg){wrap.hidden=false;$('txcLocalLab').textContent=cfg.label;$('txcLocalHint').textContent=cfg.hint;}
    else{wrap.hidden=true;$('txcLocal').value='';}
  }
  function run(){
    var R=window.C3TAX.RULES[st.value];
    var localPct=num($('txcLocal'));
    var r=window.C3TAX.calc({state:st.value,mfj:mfj,is65:age.checked,
      wages:num($('txcWages')),pension:num($('txcPension')),ss:num($('txcSS')),military:num($('txcMil')),
      homeNow:num($('txcHomeNow')),homeHere:num($('txcHomeHere')),localRate:localPct>1?localPct/100:localPct});
    $('txcNowH').textContent='In '+R.name+' now';
    $('txcNowInc').textContent=money(r.now.income);
    $('txcNowProp').textContent=money(r.now.property);
    $('txcNowTot').textContent=money(r.now.total);
    $('txcHereInc').textContent=money(r.here.income);
    $('txcHereProp').textContent=money(r.here.property);
    $('txcHereTot').textContent=money(r.here.total);
    var lr=$('txcNowLocalRow');
    if(r.now.local>0){lr.hidden=false;$('txcNowLocal').textContent=money(r.now.local);$('txcNowLocalLab').textContent=localCfg()?localCfg().label.replace(/^Your /,'').replace(/ rate$/,''):'Local income tax';$('txcHereLocalRow').hidden=false;}
    else{lr.hidden=true;$('txcHereLocalRow').hidden=true;}
    var d=r.difference, any=(num($('txcWages'))+num($('txcPension'))+num($('txcSS'))+num($('txcMil'))+num($('txcHomeNow')))>0;
    if(!any){$('txcBig').innerHTML='Fill in what you earn.';$('txcNote').textContent='Every figure updates as you type.';return;}
    if(d>0){$('txcBig').innerHTML='About <em>'+money(d)+' less</em> a year in tax.';
      $('txcNote').textContent='That is '+money(d/12)+' a month, before anything else about the move changes.';}
    else if(d<0){$('txcBig').innerHTML='About <em>'+money(-d)+' more</em> a year in tax.';
      $('txcNote').textContent='Not every move saves tax money, and we would rather show you that here than after you buy.';}
    else{$('txcBig').innerHTML='About the same either way.';$('txcNote').textContent='The tax side is close. The house price is usually where the difference shows up.';}
  }
  single.addEventListener('click',function(){mfj=false;single.setAttribute('aria-pressed','true');joint.setAttribute('aria-pressed','false');run();});
  joint.addEventListener('click',function(){mfj=true;joint.setAttribute('aria-pressed','true');single.setAttribute('aria-pressed','false');run();});
  st.addEventListener('change',function(){syncLocal();run();});
  age.addEventListener('change',run);
  ['txcWages','txcPension','txcSS','txcMil','txcHomeNow','txcHomeHere','txcLocal'].forEach(function(id){
    var el=$(id); if(el){el.addEventListener('input',run);}
  });
  $('txcGo').addEventListener('click',run);
  syncLocal();run();
})();
</script>`;
}

module.exports = { taxCalcSection, ORDER };
