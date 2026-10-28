
// ── LTR TOOL ─────────────────────────────────────────────

let _ltrData = null, _ltrIsCash = false;
// Implied rates captured from the first analysis, so property tax, maintenance
// and management scale when the user edits price or rent in the Adjust panel.
// Previously these were fixed dollar amounts and never moved, even though the
// panel says the numbers recalculate instantly. No API call is involved.
let _ltrRates = null;
// The county assessor record for the analyzed address, when one is found.
let _ltrParcel = null;
// The home's MLS listing, when the address is a home for sale (or ?mls= came from a
// listing page). Its facts replace typing the beds, baths and square feet.
let _ltrMls = null;

async function ltrMlsLookup(qs) {
  try {
    const res = await fetch('/homes/api/lookup?' + qs, { credentials: 'same-origin' });
    if (!res.ok) return null;
    const j = await res.json();
    if (j && !j.found && j.soldNeedsSignup) ltrSoldHint();
    return j && j.found && j.facts ? j.facts : null;
  } catch (e) { return null; }
}

// Fill the form from the listing, quietly (owner, 2026-10-28: no note on the form). The results
// name the listing and its firm, as the MLS display rules ask of a page that shows its facts.
function ltrShowMls(f) {
  _ltrMls = f;
  const fill = function (id, v) { const e = document.getElementById(id); if (e && v != null && v !== '' && !e.value) e.value = v; };
  if (f.address) fill('ltr-street', f.address);
  fill('ltr-city', f.city); fill('ltr-zip', f.zip);
  fill('ltr-beds', f.beds); fill('ltr-baths', f.baths); fill('ltr-sqft', f.sqft);
  if (f.hoaMonthly != null) fill('ltr-hoa', f.hoaMonthly);
}

// Not for sale and not signed up: a sold home's MLS record needs the free sign-up.
function ltrSoldHint() {
  if (document.getElementById('ltr-mls-note')) return;
  const note = document.createElement('p');
  note.id = 'ltr-mls-note';
  note.style.cssText = 'margin:.6rem 0;padding:.65rem .85rem;border-radius:12px;background:#f4efe8;color:#1c2028;font-size:.88rem;line-height:1.45';
  note.appendChild(document.createTextNode('Not for sale right now. If it sold in the last two years, '));
  const a = document.createElement('a');
  a.href = '/homes/?signup=1'; a.textContent = 'sign up free on our home search'; a.style.fontWeight = '700';
  note.appendChild(a);
  note.appendChild(document.createTextNode(', then come back: we pull its sale from the MLS.'));
  const btn = document.getElementById('ltr-analyze-btn');
  if (btn && btn.parentNode) btn.parentNode.insertBefore(note, btn);
}

// A listing page links here with ?mls=, the homepage with the address and terms. With go=1
// the analysis starts at once: no second form (owner, 2026-10-26).
(function () {
  const q = new URLSearchParams(location.search);
  const mls = /^[A-Za-z0-9]{3,20}$/.test(q.get('mls') || '') ? q.get('mls') : null;
  const go = function () {
    const set = function (id, v) { const el = document.getElementById(id); if (el && v != null && v !== '') el.value = String(v).slice(0, 120); };
    // An address from a link goes into the AI's prompt: letters, digits and address marks only.
    const addr = function (v) { return v == null ? v : String(v).replace(/[^A-Za-z0-9 #.,'\/-]/g, '').slice(0, 120); };
    set('ltr-street', addr(q.get('street'))); set('ltr-city', addr(q.get('city'))); set('ltr-price', q.get('price'));
    set('ltr-down', q.get('down')); set('ltr-rate', q.get('rate')); set('ltr-term', /^(15|20|30)$/.test(q.get('term') || '') ? q.get('term') : null);
    if (q.get('cash') === '1') { document.getElementById('ltr-is-cash').checked = true; toggleLtrCash(); }
    if (mls) set('ltr-street', mls);
    if (q.get('go') === '1' && document.getElementById('ltr-street').value) { runLtrAnalysis(); return; }
    if (mls) ltrMlsLookup('mls=' + mls).then(function (f) { if (f) ltrShowMls(f); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();

function toggleLtrFixer() {
  const on = document.getElementById('ltr-is-fixer').checked;
  document.getElementById('ltr-fixer-fields').style.display = on ? 'block' : 'none';
  if (on) { const c = document.getElementById('ltr-condition'); if (c) c.focus(); }
}
function toggleLtrCash() {
  const on = document.getElementById('ltr-is-cash').checked;
  document.getElementById('ltr-loan-fields').style.display = on ? 'none' : 'block';
}
// Reads a numeric field, distinguishing "left blank" from "typed zero".
function ltrNum(id, fallback) {
  const el = document.getElementById(id);
  const raw = el ? el.value : '';
  if (raw === '' || raw == null) return fallback;
  const n = ltrMoney(raw);
  return isNaN(n) ? fallback : n;
}
function ltrFmt(n) { return (n==null||isNaN(n)) ? '--' : '$'+Math.round(n).toLocaleString(); }
function ltrFmtPct(n) { return (n==null||isNaN(n)) ? '--' : n.toFixed(1)+'%'; }

function ltrScoreColor(m,v) {
  if(m==='dscr')     return v>=1.25?'#2d7a4f':v>=1.0?'#d97706':'#c0392b';
  if(m==='capRate')  return v>=5.5?'#2d7a4f':v>=4?'#d97706':'#c0392b';
  if(m==='coc')      return v>=8?'#2d7a4f':v>=5?'#d97706':'#c0392b';
  if(m==='cashflow') return v>=200?'#2d7a4f':v>=0?'#d97706':'#c0392b';
  return 'var(--brass)';
}
function ltrPillLabel(m,v) {
  if(m==='dscr')     return v>=1.25?['Strong Coverage','#e8f5ee','#2d7a4f']:v>=1.0?['Covers Debt','#fef3cd','#d97706']:['Below Coverage','#fdf0ee','#c0392b'];
  if(m==='capRate')  return v>=5.5?['Strong Yield','#e8f5ee','#2d7a4f']:v>=4?['Acceptable','#fef3cd','#d97706']:['Low Yield','#fdf0ee','#c0392b'];
  if(m==='coc')      return v>=8?['Great Return','#e8f5ee','#2d7a4f']:v>=5?['Decent Return','#fef3cd','#d97706']:['Weak Return','#fdf0ee','#c0392b'];
  if(m==='cashflow') return v>=200?['Cash Flowing','#e8f5ee','#2d7a4f']:v>=0?['Break-Even','#fef3cd','#d97706']:['Negative','#fdf0ee','#c0392b'];
  return null;
}

const LTR_TIPS = {
  cashflow: 'Monthly Cash Flow = Gross Rent minus vacancy, all operating expenses, and mortgage payment. Positive means the property puts money in your pocket each month.',
  dscr:     'DSCR = Annual NOI divided by Annual Mortgage Payments. Above 1.0 means rent covers the mortgage. Most DSCR loan programs want 1.0 to 1.25.',
  capRate:  'Cap Rate = Annual NOI divided by Property Value. Measures return independent of financing. Grand Strand market average is 5 to 7%.',
  rent:     'Estimated monthly rent based on comparable long-term rentals for this property type, bedroom count, and neighborhood.',
  noi:      'NOI = Gross Rent minus Vacancy minus all Operating Expenses (taxes, insurance, utilities, management, maintenance). Does not include mortgage.',
  annualCF: 'Annual Cash Flow = NOI minus Annual Mortgage Payments. The actual dollars the property generates after every expense and mortgage payment.',
  coc:      'Cash-on-Cash Return = Annual Cash Flow divided by Total Cash Invested. Measures return on the actual dollars you put in.',
  appreciation: 'Estimated annual appreciation based on Grand Strand submarket trends and demand drivers.',
};

function ltrTip(key) {
  const t = LTR_TIPS[key]||'';
  if (!t) return '';
  return `<span class="ltr-tip-wrap" style="position:relative;display:inline-block;margin-left:.35rem;vertical-align:middle"><span class="ltr-tip-icon" style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:#e5e7eb;color:#6b7280;font-size:.62rem;font-weight:700;cursor:default">?</span><span class="ltr-tip-box" style="display:none;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);width:240px;background:#1c2028;color:#f4efe8;font-size:.75rem;line-height:1.55;padding:.7rem .9rem;z-index:999;pointer-events:none">${t}</span></span>`;
}

// Scores the header badge off the SAME numbers shown on the cards, so the verdict
// can never contradict them. Called at the end of recalcLtr().
function ltrSetBadge(cap, moCF, coc) {
  const el = document.getElementById('ltr-r-badge');
  if (!el) return;
  const rating = (cap >= 5.5 && moCF >= 100 && coc >= 5) ? 'good'
               : (cap >= 4 && moCF >= 0) ? 'ok' : 'tough';
  const colors = { good: ['#2d7a4f','Strong Deal'], ok: ['#d97706','Decent Deal'], tough: ['#c0392b','Tough Deal'] };
  const [bc, bt] = colors[rating];
  el.innerHTML = `<span style="display:inline-flex;align-items:center;padding:.3rem .85rem;font-size:.72rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;background:${bc};color:#fff">${bt}</span>`;
}

// What each number means, behind the "?" beside its name: hover, tap or tab to it (owner, 2026-10-27).
const LTR_SAYS = {
  cashflow: 'What is left each month after every cost and the loan.',
  rent: 'What a home like this rents for here, a month.',
  capRate: 'A year of profit before the loan, as a share of the price.',
  coc: 'A year of cash flow, as a share of the cash you put in.',
  annualCF: 'What is left over a year, after every cost and the loan.',
  noi: 'Rent a year, less every cost except the loan.',
  cashIn: 'Down payment, about 3 percent closing costs and repairs.',
  dscr: 'Rent profit divided by the loan payments. Over 1 means the rent covers the loan.',
  cash100: 'You pay the whole price, so there is no loan payment.',
  appreciation: 'How much homes here may gain in value each year.',
};
// What is good in this town, under each "?" (owner, 2026-10-28). The figures are the rental
// returns page's own (research/invest-next/data: Zillow typical rent and values, July 2026; a
// rental in the cheaper third of homes in the ZIP, with a manager, 10 percent vacancy and upkeep):
// ZIP: [area, typical rent, price of a rental, its cap rate, kept a month bought with cash, value growth a year over 5 years].
const LTR_AREA = {"29526":["Conway",1892,214000,5.1,910,5.1],"29527":["Conway",1892,214000,5.1,910,5.1],"29566":["Little River",1502,209000,5.7,990,4.3],"29575":["Surfside Beach",1607,184000,6.6,1010,5.6],"29576":["Murrells Inlet and Garden City",1943,264000,4.2,930,5.4],"29577":["Myrtle Beach",1680,161000,7.5,1000,4.7],"29572":["Myrtle Beach",1680,161000,7.5,1000,4.7],"29588":["Myrtle Beach",1680,161000,7.5,1000,4.7],"29579":["Carolina Forest",1736,234000,5,970,4.2],"29582":["North Myrtle Beach",1627,247000,4.5,930,5.3],"29585":["Pawleys Island",1926,320000,1.8,470,6.7]};
let _ltrArea = null;
function ltrFindArea(zip, city) {
  if (zip && LTR_AREA[zip]) return LTR_AREA[zip];
  const c = String(city || '').toLowerCase();
  for (const k in LTR_AREA) { const n = LTR_AREA[k][0].toLowerCase(); if (c && (n === c || n.indexOf(c) === 0 || (c === 'garden city' && n.indexOf('garden city') > 0))) return LTR_AREA[k]; }
  return null;
}
function ltrGood(key) {
  if (_ltrCommercial) return key === 'dscr' ? 'Lenders on commercial property often ask 1.25 or more.' : '';
  const a = _ltrArea, $ = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  const cheap = a ? 'a rental in the cheaper third of ' + a[0] + ' homes' : '';
  const inA = a ? 'In ' + a[0] + ', a rental in the cheaper third of homes' : '';
  switch (key) {
    case 'cashflow': return 'Good: $200 or more a month.' + (a ? ' Bought with cash, ' + cheap + ' keeps about ' + $(a[4]) + ' a month.' : '');
    case 'annualCF': return 'Good: $2,400 or more a year.' + (a ? ' Bought with cash, ' + cheap + ' keeps about ' + $(a[4] * 12) + '.' : '');
    case 'rent': return a ? 'The typical rent in ' + a[0] + ' is about ' + $(a[1]) + ' a month (Zillow).' : '';
    case 'capRate': return 'Good: 6 percent or more, our target.' + (a ? ' ' + inA + ' makes about ' + a[3] + ' percent.' : '');
    case 'coc': return 'Good: 8 percent or more.' + (a ? ' Paid in cash it equals the cap rate: about ' + a[3] + ' percent on ' + cheap + '.' : '');
    case 'noi': return a ? inA + ' keeps about ' + $(a[4] * 12) + ' a year.' : '';
    case 'cashIn': return a ? inA + ' costs about ' + $(a[2]) + '.' : '';
    case 'dscr': return 'Good: 1.25 or more, our target anywhere on the Grand Strand.';
    case 'appreciation': return a ? 'Homes in ' + a[0] + ' gained about ' + a[5] + ' percent a year over the last five years (Zillow).' : '';
  }
  return '';
}
// other: the same number in the other scenario, shown small under this one while comparing.
function ltrCard(label, displayValue, metric, topColor, tipKey, rawScore, other) {
  // rawScore is the numeric value used for color - displayValue may be a formatted string
  const score = (rawScore !== undefined && rawScore !== null) ? rawScore : parseFloat(String(displayValue).replace(/[^0-9.-]/g,''));
  const color = metric ? ltrScoreColor(metric, score) : (topColor||'var(--brass)');
  const pill  = metric ? ltrPillLabel(metric, score)  : null;
  const says  = LTR_SAYS[tipKey || metric] || '';
  const good  = ltrGood(tipKey || metric);
  const tip   = good ? says + '\n' + good : says;
  const q = says ? `<button type="button" class="ltr-q" aria-label="What is ${label.toLowerCase()}?" data-tip="${c3Esc(tip)}">?</button>` : '';
  return `<div class="ltr-m"><div class="ltr-m-bar" style="background:${color}"></div>
    <div class="ltr-m-l">${label}${q}</div>
    <div class="ltr-m-v">${displayValue}</div>
    ${pill?`<span class="ltr-m-p" style="background:${pill[1]};color:${pill[2]}">${pill[0]}</span>`:''}
    ${other != null ? `<span class="ltr-m-o">${other}</span>` : ''}
  </div>`;
}

function initLtrTips() {
  document.querySelectorAll('.ltr-tip-wrap').forEach(w => {
    const icon = w.querySelector('.ltr-tip-icon');
    const box  = w.querySelector('.ltr-tip-box');
    icon.addEventListener('mouseenter', () => box.style.display='block');
    icon.addEventListener('mouseleave', () => box.style.display='none');
  });
}

async function callProxy(body) {
  const res = await fetch('https://api-proxy.chapter3realty.workers.dev', {
    method: 'POST',
    // x-api-name was only meaningful to the old worker. Sending it forces a CORS
    // preflight that must explicitly permit it, so it is simply dropped.
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'API error');
  const textBlock = data.content?.filter(b => b.type==='text').pop();
  if (!textBlock) throw new Error('No response received.');
  return textBlock.text.trim();
}

// The model's answer is untrusted, and it is cached for every visitor to the same address:
// every number becomes a number, flags keep only a known colour, and text that goes into
// HTML is escaped where it is printed (review, 2026-10-26).
const LTR_NUM = ['inferredBeds','inferredBaths','inferredSqft','inferredYearBuilt','inferredHOAMonthly','estimatedValue','estRentMonthly','grossRentAnnual','vacancyLoss','effectiveGrossIncome','propertyTaxAnnual','insuranceAnnual','utilitiesMonthly','hoaAnnual','managementFeeAnnual','maintenanceAnnual','totalExpensesAnnual','noi','capRate','loanAmount','monthlyMortgage','annualDebtService','monthlyCashflow','annualCashflow','cashOnCashReturn','totalCashInvested','estimatedAppreciationPct','estimatedAppreciationDollar1yr','estimatedAppreciationDollar5yr','arv','rehabBudgetLow','rehabBudgetHigh','totalProjectCost','potentialEquityGain'];
function ltrSanitize(d) {
  if (!d || typeof d !== 'object') throw new Error('No analysis received');
  LTR_NUM.forEach(function (k) { if (d[k] != null) { const n = Number(d[k]); d[k] = isFinite(n) ? n : 0; } });
  if (d.dscr != null) { const n = Number(d.dscr); d.dscr = isFinite(n) ? n : null; }
  ['inferredPropertyType', 'verdict', 'overview', 'narrative', 'rehabNarrative', 'dealRating'].forEach(function (k) { if (d[k] != null && typeof d[k] !== 'string') d[k] = ''; });
  d.inferredFeatures = Array.isArray(d.inferredFeatures) ? d.inferredFeatures.filter(function (f) { return typeof f === 'string'; }).slice(0, 8) : [];
  d.flags = Array.isArray(d.flags) ? d.flags.filter(function (f) { return f && typeof f.text === 'string'; }).map(function (f) { return { type: ['green', 'amber', 'red'].indexOf(f.type) >= 0 ? f.type : 'amber', text: f.text }; }).slice(0, 8) : [];
  return d;
}

function extractJSON(raw) {
  const s = raw.replace(/^```json\n?/,'').replace(/^```\n?/,'').replace(/\n?```$/,'').trim();
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  return JSON.parse(a>=0 && b>a ? s.slice(a, b+1) : s);
}

// ── HORRY COUNTY PERMIT LOOKUP (free, no API key) ────────
async function getNearbyPermits(lat, lng) {
  try {
    const radius = 26400; // 5 miles in feet
    const url = `https://www.horrycounty.org/gisweb/rest/services/Public/PermitsActive/MapServer/0/query?` +
      // Intersects, not Within: a buffered point query asks which permits fall
      // inside the radius. Within asks the opposite and returns nothing here.
      `geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects` +
      `&distance=${radius}&units=esriSRUnit_Foot` +
      `&outFields=PERMITNUMBER,APPLYDATE,PermitType,Workclass,DESCRIPTION,StreetNum,StreetName,VALUE` +
      `&where=1%3D1&orderByFields=APPLYDATE+DESC&resultRecordCount=25&f=json`;
    const res  = await fetch(url);
    const data = await res.json();
    if (!data.features || !data.features.length) return null;

    const now     = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const recent  = data.features
      .filter(f => f.attributes.APPLYDATE && (now - f.attributes.APPLYDATE) < oneYear)
      .map(f => {
        const a    = f.attributes;
        const desc = (a.DESCRIPTION||'').toLowerCase();
        const wc   = (a.Workclass||'').toLowerCase();
        const pt   = (a.PermitType||'').toLowerCase();
        // Classify by description keywords
        const isHospital  = desc.includes('hospital') || desc.includes('medical') || desc.includes('health') || desc.includes('clinic') || desc.includes('surgery');
        const isRetail    = desc.includes('retail') || desc.includes('shopping') || desc.includes('grocery') || desc.includes('store') || desc.includes('restaurant') || desc.includes('hotel');
        const isOffice    = desc.includes('office') || desc.includes('professional');
        const isIndustrial= desc.includes('warehouse') || desc.includes('industrial') || desc.includes('storage');
        const isSchool    = desc.includes('school') || desc.includes('education') || desc.includes('university') || desc.includes('college');
        const isNewRes    = wc.includes('new') && (pt.includes('residential') || pt.includes('single') || pt.includes('multi'));
        const isDemo      = wc.includes('demolition');
        return { wc, pt, desc: (a.DESCRIPTION||'').slice(0,80), value: a.VALUE||0,
                 isHospital, isRetail, isOffice, isIndustrial, isSchool, isNewRes, isDemo,
                 isCommercial: pt.includes('commercial') };
      });

    if (!recent.length) return null;

    // Build a rich but tight summary
    const parts = [];
    const newRes    = recent.filter(p => p.isNewRes);
    const hospitals = recent.filter(p => p.isHospital);
    const retail    = recent.filter(p => p.isRetail && !p.isHospital);
    const office    = recent.filter(p => p.isOffice && !p.isHospital);
    const schools   = recent.filter(p => p.isSchool);
    const demos     = recent.filter(p => p.isDemo);
    const otherComm = recent.filter(p => p.isCommercial && !p.isHospital && !p.isRetail && !p.isOffice && !p.isSchool);

    if (hospitals.length)  parts.push(`POSITIVE: ${hospitals.length} hospital/medical permit(s) - strong employment anchor, reliable tenant base`);
    if (schools.length)    parts.push(`POSITIVE: ${schools.length} school/education permit(s) - family demand signal`);
    if (retail.length)     parts.push(`POSITIVE: ${retail.length} retail/restaurant permit(s) - amenity growth nearby`);
    if (office.length)     parts.push(`POSITIVE: ${office.length} office/professional permit(s) - employment base growing`);
    if (newRes.length)     parts.push(`NEUTRAL: ${newRes.length} new residential permit(s) avg $${Math.round(newRes.reduce((a,p)=>a+p.value,0)/newRes.length).toLocaleString()} - area demand confirmed, monitor future rental supply`);
    if (otherComm.length)  parts.push(`COMMERCIAL: ${otherComm.length} other commercial permit(s) - verify use type`);
    if (demos.length)      parts.push(`NOTE: ${demos.length} demolition permit(s) nearby`);
    if (!parts.length)     parts.push('No significant construction activity within 5 miles in the past year');

    return `NEARBY ACTIVITY (5mi, last 12mo, ${recent.length} total permits): ` + parts.join('; ') + '.';
  } catch(e) { return null; }
}

// ── ADDRESS AUTOCOMPLETE ──────────────────────────────
// Keyless, served through our own worker (OpenStreetMap with a Grand Strand
// bounding box, falling back to the US Census address database). The address
// field never had autocomplete before; the Google Places code on this site
// targets an element that does not exist on any page.
const C3_SUGGEST_URL = 'https://api-proxy.chapter3realty.workers.dev/suggest';
let _c3Ac = { items: [], active: -1, timer: null, box: null, picked: null, seq: 0 };

function c3AcStyles() {
  if (document.getElementById('c3-ac-style')) return;
  const st = document.createElement('style');
  st.id = 'c3-ac-style';
  st.textContent =
    '.c3-ac{position:absolute;left:0;right:0;top:100%;z-index:60;background:#fdfbf7;border:1.5px solid var(--rule,#ddd);border-top:none;max-height:264px;overflow-y:auto;display:none;box-shadow:0 8px 24px rgba(20,30,40,.12)}' +
    '.c3-ac.open{display:block}' +
    '.c3-ac-item{padding:.6rem .85rem;font-size:.88rem;line-height:1.35;cursor:pointer;border-bottom:1px solid rgba(0,0,0,.05);color:var(--navy,#1c2028)}' +
    '.c3-ac-item:last-child{border-bottom:none}' +
    '.c3-ac-item:hover,.c3-ac-item.active{background:rgba(196,120,58,.12)}' +
    '.c3-ac-item small{display:block;color:var(--muted,#6b7280);font-size:.76rem;margin-top:.1rem}';
  document.head.appendChild(st);
}

function c3AcClose() {
  if (_c3Ac.box) { _c3Ac.box.classList.remove('open'); }
  _c3Ac.active = -1;
}

function c3AcRender() {
  if (!_c3Ac.box) return;
  if (!_c3Ac.items.length) { c3AcClose(); return; }
  _c3Ac.box.innerHTML = _c3Ac.items.map(function (s, i) {
    const sub = [s.city, s.state, s.zip].filter(Boolean).join(', ');
    return '<div class="c3-ac-item' + (i === _c3Ac.active ? ' active' : '') + '" data-i="' + i + '">' +
      c3Esc(s.street) + (sub ? '<small>' + c3Esc(sub) + '</small>' : '') + '</div>';
  }).join('');
  _c3Ac.box.classList.add('open');
}

function c3Esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function c3AcPick(i) {
  const s = _c3Ac.items[i];
  if (!s) return;
  // Clear, do not skip: picking a Conway address after a Myrtle Beach one used to
  // leave the old ZIP in place, producing "Conway, 29577" -- an address that does
  // not exist, which then became the shared cache key for everyone.
  const set = function (id, v) { const e = document.getElementById(id); if (e) e.value = v || ''; };
  set('ltr-street', s.street);
  set('ltr-city', s.city);
  set('ltr-zip', s.zip);
  // Coordinates ride along with the suggestion, so choosing one skips the
  // geocode round-trip entirely and the permit lookup gets exact coordinates.
  _c3Ac.picked = { street: s.street, city: s.city, zip: s.zip, lat: s.lat, lng: s.lng };
  c3AcClose();
  _ltrMls = null;
  ['ltr-beds', 'ltr-baths', 'ltr-sqft'].forEach(function (id) { const e = document.getElementById(id); if (e) e.value = ''; });
  const old = document.getElementById('ltr-mls-note'); if (old) old.remove();
  if (s.lat != null && s.lng != null) {
    ltrMlsLookup('street=' + encodeURIComponent(s.street || '') + '&lat=' + s.lat + '&lng=' + s.lng).then(function (f) { if (f) ltrShowMls(f); });
  }
}

async function c3AcFetch(q) {
  // Sequence guard: typing fast fires overlapping requests, and a slower earlier
  // one can resolve after a newer one. Without this, suggestions for "1201 N"
  // could land on top of suggestions for "1201 N Ocean Blvd" and the list would
  // no longer match what is in the box.
  const seq = ++_c3Ac.seq;
  try {
    const res = await fetch(C3_SUGGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: q })
    });
    const data = await res.json();
    if (seq !== _c3Ac.seq) return; // a newer query has already been issued
    _c3Ac.items = (data && data.suggestions) || [];
    _c3Ac.active = -1;
    c3AcRender();
  } catch (e) {
    if (seq === _c3Ac.seq) c3AcClose();
  }
}

function c3InitAddressAutocomplete() {
  const input = document.getElementById('ltr-street');
  if (!input || input.dataset.c3ac) return;
  input.dataset.c3ac = '1';
  input.setAttribute('autocomplete', 'off');
  c3AcStyles();

  const wrap = input.parentElement;
  if (wrap && getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
  const box = document.createElement('div');
  box.className = 'c3-ac';
  box.setAttribute('role', 'listbox');
  (wrap || document.body).appendChild(box);
  _c3Ac.box = box;

  box.addEventListener('mousedown', function (e) {
    const item = e.target.closest ? e.target.closest('.c3-ac-item') : null;
    if (!item) return;
    e.preventDefault(); // keep focus so blur does not close before the click lands
    c3AcPick(parseInt(item.dataset.i, 10));
  });

  input.addEventListener('input', function () {
    _c3Ac.picked = null;
    const v = input.value.trim();
    clearTimeout(_c3Ac.timer);
    // Bumping the sequence invalidates any request still in flight, so clearing
    // the box cannot be undone by a late response re-opening the dropdown.
    if (v.length < 3) { _c3Ac.seq++; _c3Ac.items = []; c3AcClose(); return; }
    _c3Ac.timer = setTimeout(function () { c3AcFetch(v); }, 220);
  });

  input.addEventListener('keydown', function (e) {
    if (!_c3Ac.box.classList.contains('open')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); _c3Ac.active = Math.min(_c3Ac.active + 1, _c3Ac.items.length - 1); c3AcRender(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); _c3Ac.active = Math.max(_c3Ac.active - 1, 0); c3AcRender(); }
    else if (e.key === 'Enter') { if (_c3Ac.active >= 0) { e.preventDefault(); c3AcPick(_c3Ac.active); } }
    else if (e.key === 'Escape') { c3AcClose(); }
  });

  input.addEventListener('blur', function () { setTimeout(c3AcClose, 120); });
}

// The site-wide address suggestions (Google Places, in the footer) replace the
// OpenStreetMap ones, which knew few Grand Strand house numbers (2026-10-26). A pick
// arrives as "c3:address": fill the town and look the home up on the MLS.
document.addEventListener('c3:address', function (e) {
  if (!e.target || e.target.id !== 'ltr-street') return;
  const d = e.detail || {};
  const set = function (id, v) { const el = document.getElementById(id); if (el) el.value = v || ''; };
  set('ltr-city', d.city); set('ltr-zip', '');
  _ltrMls = null;
  ['ltr-beds', 'ltr-baths', 'ltr-sqft', 'ltr-hoa'].forEach(function (id) { set(id, ''); });
  const old = document.getElementById('ltr-mls-note'); if (old) old.remove();
  ltrGeocodeAddress([d.street, d.city, d.state || 'SC'].filter(Boolean).join(', ')).then(function (c) {
    // The visitor typed again while this ran: these coordinates are for the old text.
    if (document.getElementById('ltr-street').value !== d.street) return;
    _c3Ac.picked = { street: d.street, city: d.city, zip: '', lat: c ? c.lat : null, lng: c ? c.lng : null };
    if (c) ltrMlsLookup('street=' + encodeURIComponent(d.street || '') + '&lat=' + c.lat + '&lng=' + c.lng).then(function (f) { if (f) ltrShowMls(f); });
  });
});
// Typing again after a pick: the old pick no longer describes the box.
function ltrForgetHome() {
  _ltrMls = null; _c3Ac.picked = null;
  ['ltr-city', 'ltr-zip', 'ltr-beds', 'ltr-baths', 'ltr-sqft', 'ltr-hoa'].forEach(function (id) { const el = document.getElementById(id); if (el) el.value = ''; });
  const note = document.getElementById('ltr-mls-note'); if (note) note.remove();
}
document.addEventListener('input', function (e) { if (e.target && e.target.id === 'ltr-street') ltrForgetHome(); });

// Money and percents as people type them: "$350,000", "350k", "6.5%".
function ltrMoney(v) {
  const t = String(v == null ? '' : v).toLowerCase().replace(/[$,%\s]/g, '');
  if (!t) return NaN;
  const m = /^(\d+(?:\.\d+)?)(k|m)?$/.exec(t);
  if (!m) return NaN;
  return parseFloat(m[1]) * (m[2] === 'k' ? 1e3 : m[2] === 'm' ? 1e6 : 1);
}

// Buying with cash or a loan? Asked while the analysis runs, when the form left it open
// (owner, 2026-10-26: "midway while loading ... as an impossible to miss pop up").
// The answer only changes the math done here in the browser, never the AI's answer,
// which is cached by address for every visitor.
let _ltrFinCancel = null;
function ltrAskFinancing() {
  let cancel = function () {};
  const promise = new Promise(function (done) {
    const dlg = document.getElementById('ltr-fin');
    if (!dlg || !dlg.showModal) { done({ cash: true }); return; }
    const form = document.getElementById('ltr-fin-form'), loan = document.getElementById('ltr-fin-loan'), go = form.querySelector('.ltr-fin-go');
    let mode = null, settled = false;
    const btns = form.querySelectorAll('[data-fin]');
    // A fresh box on every run.
    btns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    loan.hidden = true; go.disabled = true;
    const finish = function (answer) { if (settled) return; settled = true; clearTimeout(timer); if (dlg.open) dlg.close(); done(answer); };
    const ready = function () {
      go.disabled = !(mode === 'cash' || (mode === 'loan' && ltrMoney(form.elements.down.value) >= 0 && ltrMoney(form.elements.rate.value) >= 0));
    };
    btns.forEach(function (b) {
      b.onclick = function () {
        mode = b.getAttribute('data-fin');
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        loan.hidden = mode !== 'loan';
        if (mode === 'loan') form.elements.down.focus();
        ready();
      };
    });
    form.oninput = ready;
    form.onsubmit = function (ev) {
      ev.preventDefault();
      if (go.disabled) return;
      finish(mode === 'cash' ? { cash: true } : { cash: false, down: ltrMoney(form.elements.down.value), rate: ltrMoney(form.elements.rate.value), term: form.elements.term.value });
    };
    // Closed without an answer (Escape, or the page closing it): figured as a cash purchase.
    dlg.oncancel = function () { finish({ cash: true }); };
    dlg.onclose = function () { finish({ cash: true }); };
    const timer = setTimeout(function () { if (!settled && !dlg.open) dlg.showModal(); }, 1200);
    cancel = function () { finish({ cash: true }); };
  });
  return { promise: promise, cancel: function () { cancel(); } };
}

// Geocoding runs through our own worker, which uses the free US Census
// geocoder and caches the result. The previous version called Google Maps with
// a key whose billing is disabled, so it always returned null and the
// nearby-permits lookup below never ran for a single visitor.
async function ltrGeocodeAddress(addr) {
  try {
    const res = await fetch('https://api-proxy.chapter3realty.workers.dev/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: addr })
    });
    const data = await res.json();
    if (data && data.lat != null && data.lng != null) return { lat: data.lat, lng: data.lng };
    return null;
  } catch(e) { return null; }
}

let _ltrRunning = false;
async function runLtrAnalysis() {
  // One run at a time: a double click never starts two analyses.
  if (_ltrRunning) return;
  _ltrRunning = true;
  // The booking popup never opens while the analyzer works or shows its numbers (footer, owner 2026-10-28).
  window.c3Busy = true;
  try { await ltrRun(); } finally { _ltrRunning = false; if (_ltrFinCancel) { _ltrFinCancel(); _ltrFinCancel = null; } }
}
async function ltrRun() {
  let typed  = document.getElementById('ltr-street').value.trim();
  let street = typed;
  let city   = document.getElementById('ltr-city').value.trim();
  let zip    = document.getElementById('ltr-zip').value.trim();
  const price  = document.getElementById('ltr-price').value.trim();
  let isCash = document.getElementById('ltr-is-cash').checked;
  const downPct= isCash ? null : document.getElementById('ltr-down').value;
  const rate   = isCash ? null : document.getElementById('ltr-rate').value;
  const term   = isCash ? null : document.getElementById('ltr-term').value;
  let use = (document.getElementById('ltr-use') || {}).value || 'home';
  // An MLS number: the listing gives the address.
  if (/^\d{5,9}$/.test(typed)) {
    const f = (_ltrMls && String(_ltrMls.mlsNumber) === typed) ? _ltrMls : await ltrMlsLookup('mls=' + typed);
    if (!f) { ltrShowError('We could not find MLS #' + typed + ' among homes for sale. Check the number, or type the address.'); return; }
    if (_ltrMls && String(_ltrMls.mlsNumber) !== typed) { const keep = typed; ltrForgetHome(); document.getElementById('ltr-street').value = keep; }
    if (!f.address) { ltrShowError('The seller of MLS #' + typed + ' does not show its address online, so we cannot analyze it here. Call us at (854) 333-2135.'); return; }
    ltrShowMls(f);
    street = f.address; city = f.city || city; zip = f.zip || zip;
  } else if (!city && typed.indexOf(',') > 0) {
    // "123 Main St, Conway, SC": the town is the second part.
    const parts = typed.split(',').map(function (x) { return x.trim(); });
    street = parts[0]; city = parts[1] || '';
    const z = /\b(29\d{3}|28\d{3})\b/.exec(typed); if (z && !zip) zip = z[1];
  }
  const needFin = !isCash && (!(ltrMoney(downPct) >= 0) || !(ltrMoney(rate) >= 0));
  const isFixer= document.getElementById('ltr-is-fixer').checked;
  const cond   = isFixer ? document.getElementById('ltr-condition').value.trim() : '';
  const hoaMo  = document.getElementById('ltr-hoa').value.trim();
  const mgmtPct= document.getElementById('ltr-mgmt').value.trim();
  const uBeds  = document.getElementById('ltr-beds')?.value.trim();
  const uBaths = document.getElementById('ltr-baths')?.value.trim();
  const uSqft  = document.getElementById('ltr-sqft')?.value.trim();

  if (!street) { ltrShowError('Please enter the address or the MLS number.'); return; }
  // Without a town the address is a guess, and a guess becomes the cached answer for everyone.
  if (!city) { ltrShowError('Pick the address from the list, or add the town after a comma: "123 Main St, Conway".'); return; }

  ltrHideError();
  document.getElementById('ltr-form').style.display = 'none';
  document.getElementById('ltr-loading').style.display = 'block';
  const fin0 = needFin ? ltrAskFinancing() : null;
  _ltrFinCancel = fin0 ? fin0.cancel : null;
  const finAnswer = fin0 ? fin0.promise : Promise.resolve(null);

  const fullAddr = [street, city, zip||'SC'].filter(Boolean).join(', ');
  // The buyer's price is deliberately NOT sent to the model. Market value has to
  // be a property fact so the same house returns the same estimate to everyone;
  // their own price is applied in the browser by recalcLtr().
  const priceCtx = 'Estimate current market value from comparable sales';
  // Financing is applied in the browser by recalcLtr(), for each visitor's own terms. The
  // answer is cached by address for everyone, so the model never sees anyone's loan.
  const finCtx   = 'Financing is applied separately: set dscr null, monthlyMortgage 0, annualDebtService 0, loanAmount 0';
  let hoaCtx   = hoaMo ? `HOA: $${hoaMo}/mo (use exactly)` : 'HOA: not known. Estimate it from the property type and subdivision; a house outside a planned community is often 0';
  const mgmtCtx  = mgmtPct ? `Management: ${mgmtPct}% of rent` : 'Management: not provided, set managementFeeAnnual 0';

  try {
    // ── Pre-filled from user input ────────────────────────
    let beds  = uBeds  ? parseInt(uBeds)    : null;
    let baths = uBaths ? parseFloat(uBaths) : null;
    let sqft  = uSqft  ? parseInt(uSqft)    : null;

    // ── CALL 1: the MLS listing, when the home is for sale ─
    // Real listing facts replace the model's guess. The model was asked to "use
    // actual listing records", which it cannot see; now it is given them.
    document.getElementById('ltr-loading-msg').textContent = 'Looking up the home on the MLS...';
    document.getElementById('ltr-loading-sub').textContent = 'Beds, baths, size, HOA and more.';
    const _pick0 = (_c3Ac.picked && _c3Ac.picked.lat != null) ? _c3Ac.picked : null;
    const coords = _pick0 ? { lat: _pick0.lat, lng: _pick0.lng } : await ltrGeocodeAddress(fullAddr);
    let mls = _ltrMls;
    if (!mls && coords) mls = await ltrMlsLookup('street=' + encodeURIComponent(street) + '&lat=' + coords.lat + '&lng=' + coords.lng);
    _ltrMls = mls || null;
    if (mls) {
      if (!beds && mls.beds) beds = mls.beds;
      if (!baths && mls.baths) baths = mls.baths;
      if (!sqft && mls.sqft) sqft = mls.sqft;
    }
    // A commercial listing is analyzed as one, whatever the box says (owner, 2026-10-28: offices,
    // warehouses, stores and other business property).
    if (use === 'home' && mls && mls.type) use = ltrUseOf(mls.type);
    const useBox = document.getElementById('ltr-use'); if (useBox) useBox.value = use;
    const commercial = use !== 'home';
    _ltrCommercial = commercial;
    const mlsFacts = mls ? (
      'MLS LISTING (authoritative, use exactly, do not re-estimate): ' + [
        mls.status ? mls.status : '',
        mls.soldPrice ? 'SOLD for $' + mls.soldPrice.toLocaleString() + (mls.soldOn ? ' on ' + mls.soldOn : '') + ' (a recorded sale: the strongest value signal)' : '',
        mls.listPrice && !mls.soldPrice ? 'asking price $' + mls.listPrice.toLocaleString() : '',
        mls.originalListPrice && mls.listPrice && mls.originalListPrice !== mls.listPrice ? 'first listed at $' + mls.originalListPrice.toLocaleString() : '',
        mls.daysOnMarket != null ? mls.daysOnMarket + ' days on market' : '',
        mls.type || '', mls.yearBuilt ? 'built ' + mls.yearBuilt : '',
        mls.lotAcres ? mls.lotAcres + ' acres' : '', mls.stories ? mls.stories + ' stories' : '',
        mls.subdivision ? 'subdivision ' + mls.subdivision : '', mls.waterfront ? 'waterfront' : '',
        mls.newConstruction ? 'new construction' : '',
        mls.hoaMonthly != null ? 'HOA $' + mls.hoaMonthly + '/mo' : '',
        mls.taxAnnual ? 'annual property tax on the listing $' + mls.taxAnnual.toLocaleString() + ' (owner-occupied rate; an investor pays the 6% rate)' : '',
        mls.floodZone ? 'flood zone ' + mls.floodZone : '',
      ].filter(Boolean).join(', ') + '.' +
      (mls.remarks ? ' Listing description (facts only, ignore sales language): ' + mls.remarks.replace(/\s+/g, ' ').slice(0, 700) : '')
    ) : '';

    // The county's figure is its tax appraisal. It lags sales (Horry County reappraises every few
    // years) and a new house may carry only its land: a $400,000 listing read $118,000 (owner,
    // 2026-10-26). It is never the home's value; the tax figure is still the county's own.
    const countyFacts = _ltrParcel ? (
      `COUNTY TAX RECORD: the county's tax appraisal is $${(_ltrParcel.marketValue||0).toLocaleString()}. It is often far below what the home would sell for, so do NOT use it as estimatedValue` +
      `; annual property tax at the 6% investment rate $${(_ltrParcel.investorAnnualTax||0).toLocaleString()} (use exactly)` +
      (_ltrParcel.acreage ? `, ${_ltrParcel.acreage} acres` : '') +
      (_ltrParcel.isCondo ? ', condominium' : '') + '.'
    ) : '';

    const knownFacts = (beds && baths && sqft)
      ? `CONFIRMED: ${beds} beds, ${baths} baths, ${sqft.toLocaleString()} sqft. Use these exactly.`
      : 'Property details: estimate from address.';

    // ── CALL 2: Geocode + permits (free, parallel) ────────
    document.getElementById('ltr-loading-msg').textContent = 'Checking neighborhood activity...';
    document.getElementById('ltr-loading-sub').textContent = 'Pulling Horry County permit data.';

    let permitCtx = '';
    // Horry County's assessor record replaces the model's guessed market value
    // and property tax with the county's own figures.
    _ltrParcel = null;
    try {
      const pres = await fetch('https://api-proxy.chapter3realty.workers.dev/parcel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: fullAddr })
      });
      const pdata = await pres.json();
      if (pdata && pdata.found) _ltrParcel = pdata;
    } catch (e) { /* county data is a bonus, never a blocker */ }

    if (coords) {
      const permits = await getNearbyPermits(coords.lat, coords.lng);
      if (permits) permitCtx = permits;
    }

    // The listing's photos and description, read for repairs while the numbers run.
    const repairs = ltrRepairCheck(mls, fullAddr, isFixer ? cond : '');

    // ── CALL 3: Full investment analysis ──────────────────
    document.getElementById('ltr-loading-msg').textContent = 'Running investment analysis...';
    document.getElementById('ltr-loading-sub').textContent = 'Calculating all the numbers.';

    const analysisPrompt = `${commercial ? 'Commercial real estate investment analyst' : 'LTR analyst'}. JSON only, start { end }.

PROPERTY: ${fullAddr} | ${priceCtx} | ${finCtx}${isFixer?' | FIXER: '+(cond||'general'):''}
${knownFacts}
${mlsFacts}
${countyFacts}
${!hoaMo && mls && mls.hoaMonthly != null ? `HOA: $${mls.hoaMonthly}/mo from the MLS listing (use exactly)` : hoaCtx}
${mgmtCtx}
${permitCtx ? permitCtx.slice(0,320) : ''}
${commercial ? LTR_COMMERCIAL(use, sqft) : `RENT: ${beds||'?'}BR comps 2026: 1BR $1100-1600,2BR $1400-2100,3BR $1700-2600,4BR $2100-3400.
EXP: Tax=0.82% of value (SC 6% investment assessment×Horry millage),Ins=$1500SFH/$3000condo/$5000ocean,Utils=$0.20/sqft/yr (e.g. 1200sqft=$240/yr=$20/mo),Maint=0.85%/yr,Vac=6%.`}
${permitCtx ? 'Permit signals: generate GREEN flags for hospital/medical/retail/school growth, AMBER for new residential supply, RED for industrial or demolition near subject. Farther = less weight.' : ''}

{"inferredPropertyType":"","commercialUse":"","rentPerSqftYear":0,"leaseType":"","vacancyPct":0,"inferredBeds":${beds||0},"inferredBaths":${baths||0},"inferredSqft":${sqft||0},"inferredYearBuilt":0,"inferredHOAMonthly":0,"inferredFloodZone":null,"inferredFeatures":[],"estimatedValue":0,"verdict":"one plain sentence","overview":"Your honest opinion of this ${commercial ? 'property as a commercial investment' : 'home as a long-term rental'} in 2 short sentences, 40 words or fewer: whether it works, and the one number or fact that decides it. Describe the property, never people. No rates or loan terms.","dealRating":"good|ok|tough","estRentMonthly":0,"grossRentAnnual":0,"vacancyLoss":0,"effectiveGrossIncome":0,"propertyTaxAnnual":0,"insuranceAnnual":0,"utilitiesMonthly":0,"hoaAnnual":0,"managementFeeAnnual":0,"maintenanceAnnual":0,"totalExpensesAnnual":0,"noi":0,"capRate":0,"loanAmount":0,"monthlyMortgage":0,"annualDebtService":0,"dscr":${isCash?'null':0},"monthlyCashflow":0,"annualCashflow":0,"cashOnCashReturn":0,"totalCashInvested":0,"estimatedAppreciationPct":0,"estimatedAppreciationDollar1yr":0,"estimatedAppreciationDollar5yr":0,"arv":${isFixer?0:'null'},"rehabBudgetLow":${isFixer?0:'null'},"rehabBudgetHigh":${isFixer?0:'null'},"rehabNarrative":${isFixer?'""':'null'},"totalProjectCost":${isFixer?0:'null'},"potentialEquityGain":${isFixer?0:'null'},"flags":[{"type":"green|amber|red","text":"one plain sentence"}]}
FLAGS: 5 to 7 insights, each ONE plain sentence of 30 words or fewer, each a different point, none repeating the overview. Pick from: the rent against what homes like it rent for here; the price against the asking price or recent sales; property tax and insurance; flood zone or storm exposure when it applies; the HOA, its fee and its rules on rentals; building permits nearby (growth, or new supply competing for tenants); tenant demand and resale for this size and type of home; its age and what that means for upkeep. green helps the investment, amber is worth checking, red hurts it. Describe the property, never people. No rates or loan terms.`;

    const analysisRaw = await callProxy({
      model: 'claude-haiku-5-5', max_tokens: 1200,
      cache_key: ['analysis5', fullAddr, commercial ? 'com-' + use : '', beds||'', baths||'', sqft||'', isFixer ? (cond||'fixer') : '', mls ? 'mls' + mls.mlsNumber + '-' + (mls.listPrice||'') + '-' + mls.tier : ''].join('|'),
      messages: [{ role: 'user', content: analysisPrompt }]
    });

    const d = ltrSanitize(extractJSON(analysisRaw));

    // The county's own numbers override the model's estimate. Value and property
    // tax are matters of public record, not something worth guessing at.
    // A home for sale is worth about its asking price to a buyer: the MLS price, not a guess.
    if (_ltrMls && !_ltrMls.soldPrice && _ltrMls.listPrice > 0) { d.estimatedValue = _ltrMls.listPrice; d.valueFrom = 'asking'; }
    if (_ltrParcel) {
      if (_ltrParcel.marketValue) d.countyValue = _ltrParcel.marketValue;
      if (_ltrParcel.investorAnnualTax) d.propertyTaxAnnual = _ltrParcel.investorAnnualTax;
      d.flags = d.flags || [];
      if (_ltrParcel.currentlyOwnerOccupied) {
        // The single most useful thing the county file tells an investor: the
        // seller pays the 4% owner-occupied rate, the buyer will not.
        const jump = (_ltrParcel.investorAnnualTax || 0) - (_ltrParcel.currentAnnualTax || 0);
        d.flags.unshift({
          type: 'amber',
          text: 'County records show this property is taxed at the 4 percent owner-occupied rate today. ' +
                'As an investment property it is reassessed at 6 percent, raising the annual tax from about $' +
                (_ltrParcel.currentAnnualTax || 0).toLocaleString() + ' to about $' +
                (_ltrParcel.investorAnnualTax || 0).toLocaleString() + ', an increase of roughly $' +
                jump.toLocaleString() + ' a year. The figures below already use the 6 percent rate.'
        });
      }
      if (_ltrParcel.isCondo && _ltrParcel.unitsAtThisPoint > 1) {
        d.flags.push({
          type: 'green',
          text: 'This address sits in a building with ' + _ltrParcel.unitsAtThisPoint +
                ' separately assessed units on county record, which is a useful comparison set when pricing an offer.'
        });
      }
    }

    // The financing answer, when it was asked while this ran.
    const fin = await finAnswer;
    if (fin) {
      const set = function (id, v) { const el = document.getElementById(id); if (el) el.value = v; };
      if (fin.cash) { isCash = true; document.getElementById('ltr-is-cash').checked = true; toggleLtrCash(); }
      else { set('ltr-down', fin.down); set('ltr-rate', fin.rate); set('ltr-term', fin.term); }
    }
    _ltrArea = commercial ? null : ltrFindArea(mls && mls.zip || zip || (/\b(29\d{3})\b/.exec(fullAddr) || [])[1], mls && mls.city || city);
    ltrRenderResults(d, fullAddr, isFixer, isCash);
    // Homes for sale are no comparison for a store or a warehouse.
    if (commercial) { const sb = document.getElementById('ltr-similar'); if (sb) sb.innerHTML = ''; } else ltrSimilar(coords, beds, mls);
    ltrShowRepairs(await repairs, isFixer);

  } catch(err) {
    document.getElementById('ltr-loading').style.display = 'none';
    document.getElementById('ltr-form').style.display = 'block';
    window.c3Busy = false;
    ltrShowError('Analysis failed: ' + err.message + '. Please try again.');
  }
}

// The listing's photos and description, read for repairs (owner, 2026-10-28: "I look for items
// that need repaired"). It runs on every home with a listing, ticked or not, and shows only when
// it sees work. The photos are passed by their link and never saved; the answer is cached per
// listing, so a home is read once. Never throws: the analysis stands without it.
async function ltrRepairCheck(mls, fullAddr, said) {
  try {
    const all = mls && Array.isArray(mls.photos) ? mls.photos.filter(function (u) { return /^https:\/\//.test(u); }) : [];
    // Spread across the listing: the front, the kitchen and the baths are rarely the first six.
    // Four photos, spread through the listing (front, kitchen, a bath, the back): enough to see work, and each
    // photo the AI opens also counts against the MLS photo server's limit of 240 a minute (owner, 2026-10-28).
    const pick = all.length <= 4 ? all : [0, 1, 2, 3].map(function (i) { return all[Math.round(i * (all.length - 1) / 3)]; });
    const notes = mls && mls.remarks ? mls.remarks.replace(/\s+/g, ' ').slice(0, 700) : '';
    const asked = String(said || '').replace(/\s+/g, ' ').slice(0, 300);
    if (!pick.length && !notes && !asked) return null;
    const prompt = `Repair check for ${fullAddr}${mls && mls.yearBuilt ? ', built ' + mls.yearBuilt : ''}${mls && mls.sqft ? ', ' + mls.sqft + ' sq ft' : ''}. JSON only, start { end }.
Look at the listing photos${notes ? ' and read the listing description' : ''}. List only repairs you can SEE in a photo or READ in the description: damaged or dated roof, siding, windows, floors, kitchen, baths, ceilings with stains, missing fixtures, overgrown or damaged exterior, "as is", "needs TLC", "investor special", "handyman". Never guess at what you cannot see. A clean, updated home needs nothing: say so.${asked ? '\nThe buyer says: ' + asked + ' (include it, priced).' : ''}
${notes ? 'Description: ' + notes : ''}
Cost each item as a 2026 Myrtle Beach area contractor range in whole dollars.
{"needsWork":true,"items":[{"item":"short plain name","seen":"photo|description|buyer","low":0,"high":0}],"summary":"one plain sentence on the home's condition"}`;
    const content = [{ type: 'text', text: prompt }].concat(pick.map(function (u) { return { type: 'image', source: { type: 'url', url: u } }; }));
    const raw = await callProxy({
      model: 'claude-haiku-5-5', max_tokens: 700,
      cache_key: ['repair2', fullAddr, mls ? 'mls' + mls.mlsNumber + '-' + pick.length : '', asked].join('|'),
      messages: [{ role: 'user', content: content }]
    });
    const r = extractJSON(raw);
    const items = (Array.isArray(r.items) ? r.items : []).filter(function (x) { return x && x.item && x.high > 0 && x.high >= (x.low || 0); }).slice(0, 8);
    return { needsWork: r.needsWork === true && items.length > 0, items: items, summary: ltrSafeNarrative(r.summary || '') };
  } catch (e) { return null; }
}

// "Work it needs": shown only when the photos, the description or the buyer show work. Its total
// goes into the Repairs box, so the cash to buy and the returns count it.
function ltrShowRepairs(r, asked) {
  const box = document.getElementById('ltr-repairs'); if (!box) return;
  if (!r || !r.needsWork) { box.hidden = true; return; }
  const lo = r.items.reduce(function (s, x) { return s + (x.low || 0); }, 0), hi = r.items.reduce(function (s, x) { return s + x.high; }, 0);
  const mid = Math.round((lo + hi) / 2 / 100) * 100;
  const rep = document.getElementById('adj-rehab'), fill = rep && !(ltrMoney(rep.value) > 0);
  document.getElementById('ltr-repairs-list').innerHTML =
    (r.summary ? `<p class="ltr-narr" style="margin:0 0 .6rem">${c3Esc(r.summary)}</p>` : '') +
    r.items.map(function (x) { return `<div class="ltr-rep"><span>${c3Esc(x.item)}</span><span>${ltrFmt(x.low || 0)} to ${ltrFmt(x.high)}</span></div>`; }).join('') +
    `<div class="ltr-rep ltr-rep-t"><span>About</span><span>${ltrFmt(lo)} to ${ltrFmt(hi)}</span></div>` +
    `<p class="ltr-edit-n">${asked ? 'From the photos, the description and what you told us.' : 'From the listing photos and description.'} A contractor's bid is the real number.${fill ? ' We put ' + ltrFmt(mid) + ' in Repairs above; change it there.' : ''}</p>`;
  box.hidden = false;
  if (fill) { rep.value = mid; recalcLtr(); }
}

// Fair housing backstop. The prompt is written to describe the property, not the
// people, but model output is not guaranteed and every narrative is cached for a
// year, so a single bad sentence would be served to every later visitor. Any
// narrative mentioning a protected class or family status is dropped rather than
// published under the brokerage's license.
const FH_BLOCK = /\b(famil(y|ies)|children|kids|child|singles?|couples?|retirees?|elderly|seniors?|young|old(er)?\s+(people|folks|residents)|race|racial|ethnic|religio(n|us)|christian|jewish|muslim|church|disab(led|ility)|handicap|nationality|immigrant|student body|gender|male|female)\b/i;
let _ltrCommercial = false;
/** The kind of commercial property an MLS type names, or 'home'. */
function ltrUseOf(type) {
  const t = String(type || '').toLowerCase();
  if (/office|medical/.test(t)) return 'office';
  if (/retail|store|shop/.test(t)) return 'retail';
  if (/warehouse|industrial|flex|manufactur|storage/.test(t)) return 'warehouse';
  if (/restaurant|food|bar/.test(t)) return 'restaurant';
  if (/commercial|business|mixed|hotel|motel|church|special purpose|investment/.test(t)) return 'business';
  return 'home';
}
// How a commercial property is figured: rent by the square foot and the lease type, not by bedrooms.
function LTR_COMMERCIAL(use, sqft) {
  const word = { office: 'office', retail: 'retail store', warehouse: 'warehouse or industrial building', restaurant: 'restaurant', business: 'business property' }[use] || 'commercial property';
  return `COMMERCIAL: analyze it as a ${word} on the Grand Strand, never as a home.${sqft ? ' Building ' + sqft + ' sq ft.' : ''}
RENT: estimate market rent per square foot per year for this use, size, condition and location (traffic, frontage, parking, access); rentPerSqftYear = that; estRentMonthly = rentPerSqftYear x building sq ft / 12. If the listing says it is leased, or gives rent, NOI or a cap rate, use those and say so in a flag.
LEASE: leaseType = the usual lease for this use here: NNN (tenant pays tax, insurance and upkeep), modified gross or gross. Under NNN set the owner's costs to what the tenant does not pay: management about 4-6% of rent, reserves for roof, structure and parking. Under gross the owner pays tax, insurance and upkeep.
VACANCY: vacancyPct = expected vacancy and downtime between tenants for this use (commercial space takes longer to lease than a home); usually 8-12 unless leased.
VALUE: estimatedValue from commercial sales and income (rent less costs, divided by a cap rate for this use), never from home prices.
EXP: Tax = SC 6% assessment x Horry millage, about 0.82% of value (the county figure wins). Insurance for a commercial building of this size and use.
FLAGS for commercial: lease type and who pays what; leased or vacant and tenant quality of the space (describe the space, never people); zoning and permitted uses; parking, signage, access and traffic; building age, roof and HVAC; environmental risk for warehouses, auto, gas or dry cleaning uses; demand for this use nearby; ADA and fire code upgrades a new tenant may need.`;
}

function ltrSafeNarrative(text) {
  const t = String(text || '');
  if (!t) return '';
  return t.split(/(?<=[.!?])\s+/).filter(function (sentence) {
    return !FH_BLOCK.test(sentence);
  }).join(' ').trim();
}

function ltrRenderResults(d, address, isFixer, isCash) {
  document.getElementById('ltr-loading').style.display = 'none';
  document.getElementById('ltr-results').style.display = 'block';
  if (window.c3track) c3track('analysis_complete', { page_path: location.pathname });
  _ltrData = d; _ltrIsCash = isCash; _ltrRates = null;

  document.getElementById('ltr-r-address').textContent = address;
  // Facts from the MLS name their listing and its firm, and the source (MLS display rules).
  let src = document.getElementById('ltr-r-mls');
  if (_ltrMls) {
    if (!src) { src = document.createElement('p'); src.id = 'ltr-r-mls'; src.style.cssText = 'margin:.3rem 0 0;font-size:.78rem;color:var(--slate,#5c6b78)'; document.getElementById('ltr-r-address').insertAdjacentElement('afterend', src); }
    src.textContent = 'MLS #' + _ltrMls.mlsNumber + ', listed by ' + (_ltrMls.listingFirm || 'the listing brokerage') + '.';
  } else if (src) { src.remove(); }
  // A commercial property says what it was figured as: its use, rent by the square foot and the lease.
  let com = document.getElementById('ltr-r-com');
  if (_ltrCommercial) {
    if (!com) { com = document.createElement('p'); com.id = 'ltr-r-com'; com.style.cssText = 'margin:.35rem 0 0;font-size:.85rem;color:rgba(244,239,232,.85)'; document.getElementById('ltr-r-address').insertAdjacentElement('afterend', com); }
    const psf = d.rentPerSqftYear > 0 ? ' Market rent about $' + (Math.round(d.rentPerSqftYear * 100) / 100) + ' a square foot a year' : '';
    com.textContent = 'Figured as ' + String(d.commercialUse || 'commercial property').slice(0, 60) + '.' + psf + (d.leaseType ? ', usually ' + String(d.leaseType).slice(0, 40) + '.' : psf ? '.' : '');
  } else if (com) com.remove();
  const verdictEl = document.getElementById('ltr-r-verdict');
  if (verdictEl) verdictEl.textContent = ltrSafeNarrative(d.overview || d.verdict || '') || ltrSafeNarrative(d.verdict || '');
  document.getElementById('ltr-r-value').textContent = ltrFmt(d.estimatedValue);
  const go = document.getElementById('ltr-cta-go'); if (go) go.href = '/contact/?topic=investment' + (_ltrMls ? '&mls=' + encodeURIComponent(_ltrMls.mlsNumber) : '');
  const vk = document.getElementById('ltr-r-vk'); if (vk) vk.textContent = d.valueFrom === 'asking' ? 'Asking price' : 'Estimated value';
  const cv = document.getElementById('ltr-r-county');
  if (cv) cv.textContent = d.countyValue ? 'County value for tax: ' + ltrFmt(d.countyValue) : '';

  // The badge is set by recalcLtr() below, off the recomputed numbers. It used to
  // be scored here from the model's own financing guess, which is never displayed
  // anywhere else, so the header could read STRONG DEAL directly above a negative
  // cash flow, and it never moved when the buyer edited price or terms.

  // "Your numbers": the buyer's own inputs. Loan terms show in a second row of the same box,
  // only when Loan is chosen (owner, 2026-10-28).
  const adj = document.getElementById('ltr-adj-panel');
  if (adj) {
    // No made-up loan terms: the visitor's own, or none (the site states no rate, PLAYBOOK).
    const downVal  = ltrMoney(document.getElementById('ltr-down')?.value);
    const rateVal  = ltrMoney(document.getElementById('ltr-rate')?.value);
    if (!(downVal >= 0) || !(rateVal >= 0)) { isCash = true; _ltrIsCash = true; }
    // The buyer's own purchase price wins over the model's market estimate.
    // Left blank: the MLS asking price, else the estimate (owner, 2026-10-26).
    const priceVal = ltrMoney(document.getElementById('ltr-price')?.value) || (_ltrMls && !_ltrMls.soldPrice && _ltrMls.listPrice) || d.estimatedValue || '';
    _ltrPayOf.adj = isCash;
    adj.innerHTML = ltrPanel('adj', {
      cash: isCash, priceLabel: d.valueFrom === 'asking' ? 'Asking price' : 'Price', price: priceVal, rent: d.estRentMonthly || '',
      down: downVal >= 0 ? downVal : '', rate: rateVal >= 0 ? rateVal : '', term: document.getElementById('ltr-term')?.value || '30',
      hoa: document.getElementById('ltr-hoa')?.value || Math.round((d.hoaAnnual||0)/12), ins: d.insuranceAnnual || 1800,
      rehab: d.rehabBudgetHigh || 0, vac: _ltrCommercial ? (d.vacancyPct > 0 && d.vacancyPct < 40 ? d.vacancyPct : 10) : 0,
      hoaLabel: _ltrCommercial ? 'Association or CAM a month' : 'HOA fee a month',
      mgmt: ltrNum('ltr-mgmt', 0) || Math.round(((d.managementFeeAnnual || 0) / ((d.estRentMonthly || 1) * 12)) * 100) || 0,
      ut: (d.utilitiesMonthly||0)>0 ? 'landlord' : 'tenant',
    });
    adj.style.display = 'block';
  }
  ltrCompare(false);
  // "Talk to an agent" opens the sitewide popup, which sends the home with the lead (footer).
  window.c3AgentContext = function () { return { address: address, note: (_ltrMls ? 'MLS #' + _ltrMls.mlsNumber + '. ' : '') + 'From the rental analyzer.' }; };

  // ARV
  if (isFixer && d.arv) {
    document.getElementById('ltr-arv-section').style.display = 'block';
    document.getElementById('ltr-arv-grid').innerHTML = [
      ['After Repair Value', ltrFmt(d.arv), 'Est. value post-rehab'],
      ['Rehab Budget', ltrFmt(d.rehabBudgetLow)+' to '+ltrFmt(d.rehabBudgetHigh), 'Estimated cost range'],
      ['Potential Equity Gain', ltrFmt(d.potentialEquityGain), 'ARV minus total project cost'],
    ].map(([l,v,s])=>`<div style="background:rgba(255,255,255,.05);padding:1.1rem"><div style="font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(244,239,232,.4);margin-bottom:.3rem">${l}</div><div style="font-family:var(--serif);font-size:1.3rem;color:var(--ivory);margin-bottom:.2rem">${v}</div><div style="font-size:.75rem;color:rgba(244,239,232,.5)">${s}</div></div>`).join('');
    if (d.rehabNarrative) document.getElementById('ltr-arv-note').textContent = d.rehabNarrative;
  }

  document.getElementById('ltr-flags').innerHTML = (d.flags||[]).map(f=>({ type: f.type, text: ltrSafeNarrative(f.text) })).filter(f=>f.text).map(f=>{
    const c={green:'#2d7a4f',amber:'#d97706',red:'#c0392b'};
    return `<div style="display:flex;gap:.75rem;align-items:flex-start;padding:.7rem 0;border-bottom:1px solid var(--rule);font-size:.87rem;line-height:1.6;color:var(--navy)"><div style="width:8px;height:8px;border-radius:50%;background:${c[f.type]||c.amber};flex-shrink:0;margin-top:5px"></div><div>${c3Esc(f.text)}</div></div>`;
  }).join('') || '<div style="font-size:.85rem;color:var(--muted)">No specific flags noted.</div>';

  recalcLtr();
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(initLtrTips, 150);
}

// One scenario's inputs. p is the id prefix: 'adj' for the first, 'adjb' for the one beside it.
function ltrPanel(p, v) {
  const a = p === 'adj';
  const box = (k, label, val, unit, extra) => `<label class="ltr-in"><span>${label}</span><span class="ltr-in-b${unit === '$' ? ' ltr-in-d' : ' ltr-in-p'}">${unit === '$' ? '<i>$</i>' : ''}<input id="${p}-${k}" type="text" inputmode="decimal" value="${c3Esc(String(val))}" oninput="recalcLtr()"${extra || ''}/>${unit === '%' ? '<i>%</i>' : ''}</span></label>`;
  const sel = (k, label, opts, val) => `<label class="ltr-in"><span>${label}</span><span class="ltr-in-b"><select id="${p}-${k}" onchange="${a && k === 'term' ? "document.getElementById('ltr-term').value=this.value;" : ''}recalcLtr()">${opts.map(o => `<option value="${o[0]}"${String(val) === o[0] ? ' selected' : ''}>${o[1]}</option>`).join('')}</select></span></label>`;
  return `<div class="ltr-edit-h"><div><p class="ltr-edit-t"><svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span id="${p}-name">${a ? 'Your numbers' : 'Second scenario'}</span></p><p class="ltr-edit-s">${a ? 'Change any box. Every result below updates as you type.' : 'Change any box to compare.'}</p></div>
    <div class="ltr-edit-r"><div class="ltr-pay" role="radiogroup" aria-label="How you pay"><button type="button" role="radio" data-pay="cash" aria-checked="${v.cash}" onclick="ltrPay(true,'${p}')">Cash</button><button type="button" role="radio" data-pay="loan" aria-checked="${!v.cash}" onclick="ltrPay(false,'${p}')">Loan</button></div>
    ${a ? `<button type="button" class="ltr-cmp-b" id="ltr-cmp-b" onclick="ltrCompare(!_ltrCmp)" aria-pressed="false"><img src="/images/brand/chapter-iii-mark.svg" alt="" width="11" height="22">Compare</button>` : `<button type="button" class="ltr-cmp-b" onclick="ltrCompare(false)">Close</button>`}</div></div>
    <div class="ltr-grid">
      ${box('price', v.priceLabel || 'Price', v.price, '$')}
      ${box('rent', 'Rent a month', v.rent, '$')}
      ${box('hoa', v.hoaLabel || 'HOA fee a month', v.hoa, '$')}
      ${box('insurance', 'Insurance a year', v.ins, '$')}
    </div>
    <div class="ltr-loanrow" id="${p}-loanrow"${v.cash ? ' hidden' : ''}>
      <div class="ltr-grid">
        ${box('down', 'Down payment', v.down, '%', ' placeholder="Your %"')}
        ${box('rate', 'Interest rate', v.rate, '%', ' placeholder="Your rate"')}
        ${sel('term', 'Loan term', [['30', '30 years'], ['20', '20 years'], ['15', '15 years']], v.term)}
        <div class="ltr-in"><span>Loan amount</span><span class="ltr-in-b ltr-in-o"><output id="${p}-loanamt">--</output></span></div>
      </div>
      <p class="ltr-edit-n" id="${p}-loan-note">Enter your own down payment and rate to see the loan. We are not a lender.</p>
    </div>
    <div class="ltr-grid">
      ${box('rehab', 'Repairs', v.rehab, '$')}
      ${box('vacancy', 'Vacancy', v.vac, '%', ' placeholder="0"')}
      ${box('mgmt', 'Property manager', v.mgmt, '%')}
      ${sel('utilities', 'Utilities paid by', [['tenant', 'Tenant'], ['landlord', 'Landlord']], v.ut)}
    </div>`;
}

// What one scenario's boxes hold right now, to start the second from.
function ltrPanelValues(p) {
  const g = function (k) { const e = document.getElementById(p + '-' + k); return e ? e.value : ''; };
  return { cash: _ltrPayOf[p], priceLabel: 'Price', hoaLabel: _ltrCommercial ? 'Association or CAM a month' : 'HOA fee a month', price: g('price'), rent: g('rent'), down: g('down'), rate: g('rate'), term: g('term') || '30',
           hoa: g('hoa'), ins: g('insurance'), rehab: g('rehab'), vac: g('vacancy'), mgmt: g('mgmt'), ut: g('utilities') || 'tenant' };
}

// Cash or a loan, from the switch in a scenario. A loan needs the buyer's own terms; we state none.
const _ltrPayOf = { adj: false, adjb: false };
function ltrPay(cash, p) {
  p = p || 'adj';
  _ltrPayOf[p] = !!cash;
  const panel = document.getElementById(p === 'adj' ? 'ltr-adj-panel' : 'ltr-adj-panel-b');
  if (panel) panel.querySelectorAll('.ltr-pay [data-pay]').forEach(function (b) { b.setAttribute('aria-checked', String((b.getAttribute('data-pay') === 'cash') === !!cash)); });
  const row = document.getElementById(p + '-loanrow'); if (row) row.hidden = !!cash;
  if (p === 'adj') {
    _ltrIsCash = !!cash;
    const c = document.getElementById('ltr-is-cash'); if (c) { c.checked = _ltrIsCash; toggleLtrCash(); }
    if (!cash) { const dn = document.getElementById('adj-down'); if (dn && !dn.value) dn.focus(); }
  }
  recalcLtr();
}

// Two scenarios side by side, our bookmark between them (owner, 2026-10-28): two loans, or cash
// against a loan. The second starts as a copy of the first; from cash it starts as a loan.
let _ltrCmp = false;
function ltrCompare(on) {
  _ltrCmp = !!on;
  const wrap = document.getElementById('ltr-cmp'), b = document.getElementById('ltr-sc-b'), mid = document.getElementById('ltr-cmp-mid');
  if (!wrap || !b) return;
  const pb = document.getElementById('ltr-adj-panel-b');
  if (_ltrCmp) {
    const v = ltrPanelValues('adj');
    if (v.cash) { v.cash = false; v.down = document.getElementById('ltr-down')?.value || ''; v.rate = document.getElementById('ltr-rate')?.value || ''; }
    _ltrPayOf.adjb = v.cash;
    pb.innerHTML = ltrPanel('adjb', v);
  } else if (pb) { pb.innerHTML = ''; document.getElementById('ltr-core-metrics-b').innerHTML = ''; }
  wrap.classList.toggle('on', _ltrCmp);
  wrap.classList.remove('show-b'); wrap.classList.add('show-a');
  b.hidden = !_ltrCmp; if (mid) mid.hidden = !_ltrCmp;
  const nm = document.getElementById('adj-name'); if (nm) nm.textContent = _ltrCmp ? 'First scenario' : 'Your numbers';
  const btn = document.getElementById('ltr-cmp-b'); if (btn) { btn.setAttribute('aria-pressed', String(_ltrCmp)); btn.lastChild.textContent = _ltrCmp ? 'Stop comparing' : 'Compare'; }
  // Room for two: the results widen while comparing.
  const w = document.getElementById('ltr-results').closest('.wrap'); if (w) w.style.maxWidth = _ltrCmp ? '1180px' : '800px';
  ltrCmpTab('a');
  recalcLtr();
}
// On a phone the scenarios take turns: a tap on either side of the bookmark.
function ltrCmpTab(s) {
  const wrap = document.getElementById('ltr-cmp'); if (!wrap) return;
  wrap.classList.toggle('show-a', s === 'a'); wrap.classList.toggle('show-b', s === 'b');
  document.querySelectorAll('#ltr-cmp-mid [data-sc]').forEach(function (t) { t.setAttribute('aria-pressed', String(t.getAttribute('data-sc') === s)); });
}

// Homes like this one for sale now, near it: the listing search's own cards, from the server.
async function ltrSimilar(coords, beds, mls) {
  const box = document.getElementById('ltr-similar'); if (!box) return;
  box.innerHTML = '';
  const price = ltrNum('adj-price', 0);
  const q = new URLSearchParams();
  if (coords) { q.set('near', coords.lat.toFixed(5) + ',' + coords.lng.toFixed(5)); q.set('miles', '3'); }
  if (beds) q.set('beds', String(Math.max(1, beds - 1)));
  if (price > 0) { q.set('min', String(Math.round(price * 0.7 / 1000) * 1000)); q.set('max', String(Math.round(price * 1.3 / 1000) * 1000)); }
  if (mls && mls.mlsNumber) q.set('not', mls.mlsNumber);
  try {
    const r = await fetch('/homes/api/similar?' + q.toString(), { credentials: 'same-origin' });
    const j = r.ok ? await r.json() : null;
    if (j && j.ok && j.html) { box.innerHTML = j.html; box.querySelectorAll('.hx-s-row').forEach(ltrRig); }
  } catch (e) { /* no strip; the analysis stands on its own */ }
}

// The row scrolls slowly by itself and drags with a mouse or a finger, as every row of homes
// on the site does (idx-lib/render.js rig; that script is not on this page). It stops while
// a pointer is over it, while it is touched or has focus, and a few seconds after it is moved.
function ltrRig(row) {
  if (row.hxRig) return; row.hxRig = 1;
  let down = false, moved = false, x0 = 0, s0 = 0, hold = 0, over = false, seen = false, pos = row.scrollLeft, wait = 0, last = 0;
  const rest = function (ms) { hold = Date.now() + ms; };
  row.addEventListener('pointerdown', function (e) { rest(5000); if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = row.scrollLeft; });
  row.addEventListener('pointermove', function (e) { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) { moved = true; row.classList.add('hx-dragging'); } row.scrollTo({ left: s0 - dx, behavior: 'instant' }); });
  const up = function () { down = false; rest(5000); setTimeout(function () { row.classList.remove('hx-dragging'); }, 0); };
  row.addEventListener('pointerup', up); row.addEventListener('pointerleave', function () { over = false; up(); });
  row.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') over = true; });
  row.addEventListener('touchstart', function () { rest(6000); }, { passive: true });
  row.addEventListener('wheel', function () { rest(5000); }, { passive: true });
  row.addEventListener('focusin', function () { rest(8000); });
  row.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  row.querySelectorAll('img, a').forEach(function (el) { el.setAttribute('draggable', 'false'); });
  if ((window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || !window.requestAnimationFrame) return;
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(row); else seen = true;
  const step = function (t) {
    const dt = last ? Math.min(64, t - last) : 16; last = t;
    if (!row.isConnected) return;
    if (seen && !over && !down && Date.now() > hold && !row.contains(document.activeElement)) {
      const max = row.scrollWidth - row.clientWidth;
      if (max > 8) {
        if (Math.abs(row.scrollLeft - pos) > 2) pos = row.scrollLeft;
        if (pos >= max - 1) { if (!wait) wait = Date.now() + 1800; else if (Date.now() > wait) { wait = 0; pos = 0; row.scrollTo({ left: 0, behavior: 'smooth' }); rest(1200); } }
        else { pos = Math.min(max, pos + dt * 0.03); row.scrollLeft = pos; }
      }
    }
    requestAnimationFrame(step);
  };
  row.classList.add('hx-auto'); requestAnimationFrame(step);
}

// One scenario's numbers, from its boxes. p is 'adj' or 'adjb'.
function ltrCalc(p) {
  const d = _ltrData;
  // A typed 0 is a real value, not a blank.
  const rent    = ltrNum(p + '-rent',  d.estRentMonthly || 0);
  const price   = ltrNum(p + '-price', d.estimatedValue || 0);
  const hoaMo   = ltrNum(p + '-hoa', 0);
  const utPay   = document.getElementById(p + '-utilities')?.value || 'landlord';
  const vacPct  = ltrNum(p + '-vacancy', 0); // 0 = off by default
  const _downRaw = document.getElementById(p + '-down')?.value;
  const rawDown = (_downRaw === '' || _downRaw == null) ? NaN : ltrMoney(_downRaw);
  const ratePct = ltrNum(p + '-rate', NaN);
  const termYrs = parseFloat(document.getElementById(p + '-term')?.value) || 30;

  // Blank down payment or rate, or 100% down: figured as cash. The site states no loan terms (PLAYBOOK).
  const effectiveCash = _ltrPayOf[p] || isNaN(rawDown) || rawDown >= 100 || isNaN(ratePct);
  // An explicit 0 stays 0 (VA and USDA are zero down).
  const downPct = effectiveCash ? 100 : rawDown;

  const gross = rent * 12;
  const vac   = Math.round(gross * vacPct / 100);
  const egi   = gross - vac;
  // Capture the implied rates once, off the values the analysis returned, then
  // derive from the live price and rent so the boxes actually recalculate.
  if (!_ltrRates) {
    const basePrice = d.estimatedValue || price || 0;
    const baseRent  = (d.estRentMonthly || rent || 0) * 12;
    _ltrRates = {
      // A sale resets the county's value to the price, so the tax follows the price at the county's
      // own rate: its 6 percent tax over its own appraisal (never over our value, which differs).
      tax:   (_ltrParcel && _ltrParcel.investorAnnualTax && _ltrParcel.marketValue > 0)
               ? _ltrParcel.investorAnnualTax / _ltrParcel.marketValue
               : (basePrice > 0 && d.propertyTaxAnnual ? d.propertyTaxAnnual / basePrice : 0.0082),
      maint: basePrice > 0 && d.maintenanceAnnual ? d.maintenanceAnnual / basePrice : 0.0085,
      // The typed management percentage wins over a cached answer's.
      mgmt:  (ltrNum('ltr-mgmt', 0) / 100) ||
             (baseRent > 0 && d.managementFeeAnnual ? d.managementFeeAnnual / baseRent : 0)
    };
  }
  const tax    = Math.round(price * _ltrRates.tax);
  const ins    = ltrNum(p + '-insurance', d.insuranceAnnual || 1800);
  const maint  = Math.round(price * _ltrRates.maint);
  const utBase = d.utilitiesMonthly || Math.round((d.inferredSqft || 1200) * 0.20 / 12);
  const utAnn  = utPay === 'landlord' ? utBase * 12 : 0;
  const hoaAnn = hoaMo * 12;
  const mgmtBox = document.getElementById(p + '-mgmt');
  const mgmt   = mgmtBox && mgmtBox.value.trim() !== '' ? Math.round(gross * ltrNum(p + '-mgmt', 0) / 100) : Math.round(gross * _ltrRates.mgmt);
  const costs  = tax + ins + utAnn + hoaAnn + mgmt + maint;
  // NOI is net of vacancy (egi = gross - vac); vacancy is never subtracted twice.
  const noi    = egi - costs;

  let debt = 0, loan = 0, dscr = null;
  if (!effectiveCash && ratePct >= 0) {
    loan = price * (1 - downPct / 100);
    const mo = ratePct / 100 / 12, n = termYrs * 12;
    // A genuine 0% note (seller or family financing) is straight-line principal.
    const mort = mo === 0 ? (n > 0 ? loan / n : 0) : loan * (mo * Math.pow(1+mo,n)) / (Math.pow(1+mo,n) - 1);
    debt = mort * 12;
    dscr = debt > 0 ? noi / debt : null;
  }
  const cf    = noi - debt;
  const rehab = ltrNum(p + '-rehab', 0);
  const cash  = (effectiveCash ? price : price * downPct / 100 + price * 0.03) + rehab;
  return { rent, price, gross, vac, vacPct, tax, ins, utAnn, utPay, hoaAnn, mgmt, maint, costs, noi, debt, loan, dscr, cf,
           moCF: cf / 12, cash, coc: cash > 0 ? (cf / cash) * 100 : 0, cap: price > 0 ? (noi / price) * 100 : 0, effectiveCash };
}

// The eight numbers for one scenario. o is the other scenario while comparing, shown small under each.
function ltrMetrics(r, o, tag) {
  const d = _ltrData;
  const vs = function (txt) { return o ? tag + ': ' + txt : null; };
  const dscrTxt = function (x) { return x.effectiveCash ? 'cash' : 'DSCR ' + (x.dscr != null ? x.dscr.toFixed(2) : '0.00'); };
  const last = r.effectiveCash
    ? ltrCard('Value growth', ltrFmtPct(d.estimatedAppreciationPct) + ' a year', null, 'var(--brass)', 'appreciation', null, o ? vs(o.effectiveCash ? ltrFmtPct(d.estimatedAppreciationPct) : dscrTxt(o)) : null)
    : ltrCard('DSCR', r.dscr != null ? r.dscr.toFixed(2) : '0.00', 'dscr', null, null, r.dscr || 0, o ? vs(dscrTxt(o)) : null);
  return ltrCard('Cash flow a month', ltrFmt(r.moCF), 'cashflow', null, null, r.moCF, o ? vs(ltrFmt(o.moCF)) : null) +
    ltrCard('Rent a month', ltrFmt(r.rent), null, 'var(--slate)', 'rent', null, o ? vs(ltrFmt(o.rent)) : null) +
    ltrCard('Cap rate', ltrFmtPct(r.cap), 'capRate', null, null, r.cap, o ? vs(ltrFmtPct(o.cap)) : null) +
    ltrCard('Cash-on-cash', ltrFmtPct(r.coc), 'coc', null, null, r.coc, o ? vs(ltrFmtPct(o.coc)) : null) +
    ltrCard('Cash flow a year', ltrFmt(r.cf), 'cashflow', 'var(--slate)', 'annualCF', r.cf / 12, o ? vs(ltrFmt(o.cf)) : null) +
    ltrCard('Profit before the loan, a year', ltrFmt(r.noi), null, 'var(--slate)', 'noi', null, o ? vs(ltrFmt(o.noi)) : null) +
    ltrCard('Cash to buy it', ltrFmt(r.cash), null, 'var(--slate)', 'cashIn', null, o ? vs(ltrFmt(o.cash)) : null) +
    last;
}

// The two scenarios row by row; the better number in each row is marked.
function ltrCmpTable(a, b) {
  const d = _ltrData;
  const dscr = function (x) { return x.effectiveCash ? 'Cash' : (x.dscr != null ? x.dscr.toFixed(2) : '0.00'); };
  const rows = [
    ['Cash flow a month', 'cashflow', ltrFmt(a.moCF), ltrFmt(b.moCF), a.moCF, b.moCF, 1],
    ['Cash flow a year', 'annualCF', ltrFmt(a.cf), ltrFmt(b.cf), a.cf, b.cf, 1],
    ['Cash-on-cash', 'coc', ltrFmtPct(a.coc), ltrFmtPct(b.coc), a.coc, b.coc, 1],
    ['Cap rate', 'capRate', ltrFmtPct(a.cap), ltrFmtPct(b.cap), a.cap, b.cap, 1],
    ['Cash to buy it', 'cashIn', ltrFmt(a.cash), ltrFmt(b.cash), a.cash, b.cash, -1],
    ['Loan amount', '', a.loan > 0 ? ltrFmt(a.loan) : 'None', b.loan > 0 ? ltrFmt(b.loan) : 'None', null, null, 0],
    ['Loan payments a year', '', a.debt > 0 ? ltrFmt(a.debt) : 'None', b.debt > 0 ? ltrFmt(b.debt) : 'None', null, null, 0],
    ['DSCR', 'dscr', dscr(a), dscr(b), null, null, 0],
    ['Rent a month', 'rent', ltrFmt(a.rent), ltrFmt(b.rent), null, null, 0],
    ['Profit before the loan, a year', 'noi', ltrFmt(a.noi), ltrFmt(b.noi), null, null, 0],
  ];
  const q = function (label, k) {
    const says = LTR_SAYS[k] || '', good = k ? ltrGood(k) : '';
    return says ? `<button type="button" class="ltr-q" aria-label="What is ${label.toLowerCase()}?" data-tip="${c3Esc(good ? says + '\n' + good : says)}">?</button>` : '';
  };
  const cell = function (v, win) { return `<td${win ? ' class="ltr-win"' : ''}>${v}</td>`; };
  return `<table class="ltr-cmpt"><thead><tr><th scope="col"><span class="ltr-vh">Number</span></th><th scope="col">First</th><th scope="col">Second</th></tr></thead><tbody>` +
    rows.map(function (r) {
      const aw = r[6] && r[4] !== r[5] && (r[6] > 0 ? r[4] > r[5] : r[4] < r[5]);
      const bw = r[6] && r[4] !== r[5] && !aw;
      return `<tr><th scope="row">${r[0]}${q(r[0], r[1])}</th>${cell(r[2], aw)}${cell(r[3], bw)}</tr>`;
    }).join('') + `</tbody></table><p class="ltr-edit-n">The better number in each row is in green. Change either scenario above; the table follows.</p>`;
}

function recalcLtr() {
  const d = _ltrData; if (!d) return;
  const a = ltrCalc('adj');
  const b = _ltrCmp && document.getElementById('adjb-price') ? ltrCalc('adjb') : null;
  // Comparing: one table, the two scenarios in lined-up columns (owner, 2026-10-28: "the stats need to line up").
  const tbl = document.getElementById('ltr-cmp-table');
  document.getElementById('ltr-core-metrics').hidden = !!b;
  if (tbl) { tbl.hidden = !b; tbl.innerHTML = b ? ltrCmpTable(a, b) : ''; }
  if (!b) document.getElementById('ltr-core-metrics').innerHTML = ltrMetrics(a, null, '');
  [['adj', a], ['adjb', b]].forEach(function (x) {
    if (!x[1]) return;
    const out = document.getElementById(x[0] + '-loanamt'); if (out) out.textContent = x[1].loan > 0 ? ltrFmt(x[1].loan) : '--';
    // The loan note only while a loan is chosen and its terms are missing.
    const ln = document.getElementById(x[0] + '-loan-note'); if (ln) ln.hidden = _ltrPayOf[x[0]] || !x[1].effectiveCash;
  });

  // Where the money goes, for the first scenario.
  const rows = [
    ['Property tax (the 6 percent rental rate)', a.tax],
    ['Insurance', a.ins],
    ...(a.utPay === 'landlord' ? [['Utilities', a.utAnn]] : []),
    ...(a.hoaAnn > 0 ? [['HOA fee', a.hoaAnn]] : []),
    ...(a.mgmt > 0   ? [['Property manager', a.mgmt]] : []),
    ['Upkeep and repairs set aside', a.maint],
  ];
  // Vacancy is a reduction in gross income, not an operating expense, so it is
  // listed below the total. Inside the list it made the rows not sum to the total.
  const rowStyle = 'display:flex;justify-content:space-between;align-items:baseline;padding:.3rem 0;border-bottom:1px solid rgba(0,0,0,.04)';
  const divStyle = 'display:flex;justify-content:space-between;align-items:baseline;padding:.45rem 0;border-top:1.5px solid var(--rule);margin-top:.2rem';
  document.getElementById('ltr-expense-table').innerHTML =
    `<div style="display:flex;flex-direction:column;width:100%;font-size:.92rem">` +
    `<div style="${rowStyle}"><span style="color:var(--navy);font-weight:600">Rent a year</span><span style="font-weight:600;font-variant-numeric:tabular-nums">${ltrFmt(a.gross)}</span></div>` +
    rows.map(([l,v]) => `<div style="${rowStyle}"><span style="color:var(--muted)">${l}</span><span style="font-weight:500;font-variant-numeric:tabular-nums">${ltrFmt(v)}</span></div>`).join('') +
    `<div style="${divStyle}"><span style="font-weight:600">Costs a year</span><span style="font-weight:700;font-variant-numeric:tabular-nums">${ltrFmt(a.costs)}</span></div>` +
    (a.vac > 0 ? `<div style="${rowStyle}"><span style="color:var(--muted)">Vacancy allowance (${a.vacPct}%)</span><span style="font-weight:500;font-variant-numeric:tabular-nums">${ltrFmt(a.vac)}</span></div>` : '') +
    (!a.effectiveCash ? `<div style="${rowStyle}"><span style="color:var(--muted)">Loan payments a year</span><span style="font-weight:500;font-variant-numeric:tabular-nums">${ltrFmt(a.debt)}</span></div>` : '') +
    `<div style="${divStyle}"><span style="font-weight:700;color:var(--navy)">Left over a year</span><span style="font-weight:700;font-variant-numeric:tabular-nums;color:${a.cf >= 0 ? '#2d7a4f' : '#c0392b'}">${ltrFmt(a.cf)}</span></div>` +
    `</div>`;

  ltrSetBadge(a.cap, a.moCF, a.coc);
}

// ── INVESTOR REPORT EMAIL GATE ────────────────────────
// Results are never hidden. We ask for an email only when someone wants the PDF
// copy, or the first time they start a second analysis.
function ltrStore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
function ltrHasEmail() { return !!ltrStore('c3_ltr_email'); }
function ltrGateAsked() { return !!ltrStore('c3_ltr_asked'); }

function ltrGateSnapshot() {
  function v(id) { var e = document.getElementById(id); return e ? (e.value || e.textContent || '').trim() : ''; }
  var addr = v('ltr-r-address') || [v('ltr-street'), v('ltr-city'), v('ltr-zip')].filter(Boolean).join(', ');
  var parts = [];
  if (addr) parts.push('Property: ' + addr);
  if (v('ltr-price')) parts.push('Price: $' + v('ltr-price'));
  if (v('ltr-r-verdict')) parts.push('Verdict: ' + v('ltr-r-verdict'));
  if (v('ltr-r-value')) parts.push('Headline: ' + v('ltr-r-value'));
  return parts.join(' | ') || 'No property details captured';
}

function ltrOpenGate(mode) {
  var g = document.getElementById('ltr-gate');
  if (!g) { ltrGateProceed(mode); return; }
  g.setAttribute('data-mode', mode);
  var t = document.getElementById('ltr-gate-title');
  var s = document.getElementById('ltr-gate-sub');
  var b = document.getElementById('ltr-gate-submit');
  var k = document.getElementById('ltr-gate-skip');
  if (mode === 'pdf') {
    if (t) t.textContent = 'Where should we send the report?';
    if (s) s.textContent = 'Your report downloads as soon as you submit this. We use your email to follow up with the numbers.';
    if (b) b.textContent = 'Email me the report';
    if (k) k.style.display = 'none';
  } else {
    if (t) t.textContent = 'Want these numbers emailed to you?';
    if (s) s.textContent = 'Before you run another property, we can follow up with the numbers on this one. We only ask once.';
    if (b) b.textContent = 'Send it and start over';
    if (k) k.style.display = 'block';
  }
  g.style.display = 'block';
  document.body.style.overflow = 'hidden';
  var em = document.getElementById('ltr-gate-email');
  if (em) setTimeout(function () { em.focus(); }, 60);
  if (window.c3track) c3track('lead_prompt_shown', { form_name: 'Investor Report', mode: mode, page_path: location.pathname });
}

function ltrCloseGate() {
  var g = document.getElementById('ltr-gate');
  if (g) g.style.display = 'none';
  document.body.style.overflow = '';
}

function ltrGateProceed(mode) {
  ltrCloseGate();
  if (mode === 'pdf') ltrRunPDF(); else ltrDoReset();
}

function ltrGateSkip() {
  ltrStore('c3_ltr_asked', '1');
  var g = document.getElementById('ltr-gate');
  ltrGateProceed(g ? g.getAttribute('data-mode') : 'again');
}

function ltrGateSubmit(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  var em = document.getElementById('ltr-gate-email');
  var email = em ? em.value.trim() : '';
  if (!email || email.indexOf('@') < 1) { if (em) em.focus(); return false; }
  /* The CRM refuses a lead without call and text consent, so an unticked box
     would show the visitor a download and quietly lose the lead. */
  var cb = document.getElementById('ltr-gate-consent');
  if (cb && !cb.checked) { cb.focus(); if (cb.reportValidity) cb.reportValidity(); return false; }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  ltrStore('c3_ltr_email', email);
  ltrStore('c3_ltr_asked', '1');
  var g = document.getElementById('ltr-gate');
  var mode = g ? g.getAttribute('data-mode') : 'pdf';
  if (typeof c3SendForm === 'function') {
    c3SendForm({
      name: val('ltr-gate-name'),
      email: email,
      phone: val('ltr-gate-phone'),
      message: 'Investor report request. ' + ltrGateSnapshot(),
      consent: cb && cb.checked ? 'yes' : 'no'
    }, 'Investor Report Request');
  }
  // generate_lead is fired by the sitewide c3SendForm wrapper in the footer.
  // Firing it here too would double-count every lead.
  ltrGateProceed(mode);
  return false;
}

function ltrSavePDF() {
  if (window.c3track) c3track('report_download', { page_path: location.pathname });
  if (ltrHasEmail()) { ltrRunPDF(); return; }
  ltrOpenGate('pdf');
}

function ltrRunPDF() {
  var res = document.getElementById('ltr-results'); if (!res) return;
  var btns = res.querySelectorAll('button, a.btn'); for (var i=0;i<btns.length;i++) btns[i].style.display='none';
  var h = document.createElement('div'); h.id='ltr-pdf-hdr';
  h.style.cssText='text-align:center;padding:1rem 0 1.5rem;border-bottom:2px solid #1c2028;margin-bottom:1.5rem';
  h.innerHTML='<div style="font-family:serif;font-size:1.4rem;font-weight:700;color:#1c2028">Chapter3 Realty</div><div style="font-size:.75rem;color:#6b7280;margin-top:.25rem">Investor Property Report · chapter3realty.com · 854.333.2135</div>';
  res.prepend(h);
  function cleanup(){ for (var i=0;i<btns.length;i++) btns[i].style.display=''; var hh=document.getElementById('ltr-pdf-hdr'); if(hh) hh.remove(); }
  function fallback(){ try{ window.print(); }catch(e){} setTimeout(cleanup, 1200); }
  function gen(){
    if (!window.html2canvas || !window.jspdf) { fallback(); return; }
    window.html2canvas(res, {scale:2, backgroundColor:'#ffffff', useCORS:true}).then(function(canvas){
      var img=canvas.toDataURL('image/jpeg',0.92);
      var JsPDF=window.jspdf.jsPDF; var pdf=new JsPDF('p','pt','a4');
      var pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
      var ih=canvas.height*(pw/canvas.width), y=0, pg=0;
      while (y < ih && pg < 25) { if (pg>0) pdf.addPage(); pdf.addImage(img,'JPEG',0,-y,pw,ih); y+=ph; pg++; }
      pdf.save('Chapter3-Investor-Report.pdf'); cleanup();
    }).catch(fallback);
  }
  var need=[]; if(!window.jspdf) need.push('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'); if(!window.html2canvas) need.push('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  if (!need.length) { gen(); return; }
  var done=0, failed=false;
  need.forEach(function(u){ var sc=document.createElement('script'); sc.src=u; sc.onload=function(){ if(++done===need.length){ failed?fallback():gen(); } }; sc.onerror=function(){ failed=true; if(++done===need.length) fallback(); }; document.head.appendChild(sc); });
}
function resetLtr() {
  if (!ltrHasEmail() && !ltrGateAsked()) { ltrOpenGate('again'); return; }
  ltrDoReset();
}

function ltrDoReset() {
  window.c3Busy = false;
  document.getElementById('ltr-results').style.display = 'none';
  document.getElementById('ltr-form').style.display = 'block';
  document.getElementById('ltr-arv-section').style.display = 'none';
  window.scrollTo({top:0,behavior:'smooth'});
}
function ltrShowError(m) { const e=document.getElementById('ltr-error'); e.textContent=m; e.style.display='block'; }
function ltrHideError() { document.getElementById('ltr-error').style.display='none'; }

// ── SELLER PAGE ───────────────────────────────────────

// Multi-step CMA form
function sellerNextStep(step) {
  document.getElementById('seller-step-' + step).style.display = 'none';
  document.getElementById('seller-step-' + (step + 1)).style.display = 'block';
  // update progress bar
  for (let i = 1; i <= 4; i++) {
    document.getElementById('seller-p' + i).style.background = i <= step + 1 ? 'var(--brass)' : 'var(--rule)';
  }
}

function sellerSubmit() {
  const name  = document.getElementById('seller-name').value.trim();
  const email = document.getElementById('seller-email').value.trim();
  const phone = document.getElementById('seller-phone').value.trim();
  if (!name || !email) { alert('Please enter your name and email.'); return; }
  var address  = document.getElementById('seller-address')  ? document.getElementById('seller-address').value.trim()  : '';
  var propType = document.getElementById('seller-type')     ? document.getElementById('seller-type').value             : '';
  var beds     = document.getElementById('seller-beds')     ? document.getElementById('seller-beds').value             : '';
  var timeline = document.getElementById('seller-timeline') ? document.getElementById('seller-timeline').value         : '';
  c3SendForm({
    name: name, email: email, phone: phone,
    address: address, property_type: propType, bedrooms: beds, timeline: timeline,
    message: 'Seller valuation request',
    page: window.location.pathname,
    consent: (document.getElementById('sellerConsent') || {}).checked ? 'yes' : 'no'
  }, 'Seller Valuation Form');
  var _s=document.getElementById('seller-form-steps'); if(_s)_s.style.display='none';
  var _p=document.getElementById('seller-form-progress'); if(_p)_p.style.display='none';
  var _ok=document.getElementById('seller-success'); if(_ok)_ok.style.display='block';
}

function finalSellerSubmit() {
  const name  = document.getElementById('final-name').value.trim();
  const email = document.getElementById('final-email').value.trim();
  if (!name || !email) { alert('Please enter your name and email.'); return; }
  var phone   = document.getElementById('final-phone')   ? document.getElementById('final-phone').value.trim()   : '';
  var address = document.getElementById('final-address') ? document.getElementById('final-address').value.trim() : '';
  c3SendForm({
    name: name, email: email, phone: phone, address: address,
    message: 'Seller follow-up form submission',
    page: window.location.pathname,
    consent: (document.getElementById('finalConsent') || {}).checked ? 'yes' : 'no'
  }, 'Seller Follow-up Form');
  document.getElementById('final-seller-success').style.display = 'block';
  document.getElementById('final-seller-success').previousElementSibling.style.display = 'none';
  document.getElementById('final-seller-success').previousElementSibling.previousElementSibling.style.display = 'none';
}

// Persona tabs
function showPersona(id, btn) {
  document.querySelectorAll('.persona-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.persona-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById(id);
  if (panel) {
    panel.style.display = panel.getAttribute('data-cols') === '1' ? 'block' : 'grid';
    // Detect if it has a 2-col inline grid style
    if (panel.style.gridTemplateColumns) {
      // already has inline style, respect it
    } else {
      panel.style.display = 'block';
    }
  }
  btn.classList.add('active');
}

