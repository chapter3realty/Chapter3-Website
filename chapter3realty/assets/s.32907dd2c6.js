
// ── LTR TOOL ─────────────────────────────────────────────

let _ltrData = null, _ltrIsCash = false;

function toggleLtrFixer() {
  const on = document.getElementById('ltr-is-fixer').checked;
  document.getElementById('ltr-fixer-fields').style.display = on ? 'block' : 'none';
}
function toggleLtrCash() {
  const on = document.getElementById('ltr-is-cash').checked;
  document.getElementById('ltr-loan-fields').style.display = on ? 'none' : 'block';
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

function ltrCard(label, displayValue, metric, topColor, tipKey, rawScore) {
  // rawScore is the numeric value used for color - displayValue may be a formatted string
  const score = (rawScore !== undefined && rawScore !== null) ? rawScore : parseFloat(String(displayValue).replace(/[^0-9.-]/g,''));
  const color = metric ? ltrScoreColor(metric, score) : (topColor||'var(--brass)');
  const pill  = metric ? ltrPillLabel(metric, score)  : null;
  const tip   = tipKey ? ltrTip(tipKey) : (metric ? ltrTip(metric) : '');
  return `<div style="background:#fff;border:1px solid var(--rule);padding:1.5rem 1.75rem;position:relative;overflow:visible">
    <div style="position:absolute;top:0;left:0;width:100%;height:3px;background:${color};transition:background .3s"></div>
    <div style="font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem;display:flex;align-items:center">${label}${tip}</div>
    <div style="font-family:var(--serif);font-size:1.9rem;line-height:1;margin-bottom:.35rem;color:var(--navy)">${displayValue}</div>
    ${pill?`<span style="display:inline-block;margin-top:.4rem;padding:.2rem .6rem;font-size:.68rem;font-weight:500;background:${pill[1]};color:${pill[2]};transition:background .3s,color .3s">${pill[0]}</span>`:''}
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
    headers: { 'Content-Type': 'application/json', 'x-api-name': 'anthropic' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'API error');
  const textBlock = data.content?.filter(b => b.type==='text').pop();
  if (!textBlock) throw new Error('No response received.');
  return textBlock.text.trim();
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
      `geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin` +
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

async function ltrGeocodeAddress(addr) {
  try {
    const key = 'AIzaSyAFTNMGh-PmVFTl3S0ViiM9zNYicFrgGfs';
    const res  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${key}`);
    const data = await res.json();
    if (data.results && data.results[0]) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
    return null;
  } catch(e) { return null; }
}

async function runLtrAnalysis() {
  const street = document.getElementById('ltr-street').value.trim();
  const city   = document.getElementById('ltr-city').value.trim();
  const zip    = document.getElementById('ltr-zip').value.trim();
  const price  = document.getElementById('ltr-price').value.trim();
  const isCash = document.getElementById('ltr-is-cash').checked;
  const downPct= isCash ? null : document.getElementById('ltr-down').value;
  const rate   = isCash ? null : document.getElementById('ltr-rate').value;
  const term   = isCash ? null : document.getElementById('ltr-term').value;
  const isFixer= document.getElementById('ltr-is-fixer').checked;
  const cond   = isFixer ? document.getElementById('ltr-condition').value.trim() : '';
  const hoaMo  = document.getElementById('ltr-hoa').value.trim();
  const mgmtPct= document.getElementById('ltr-mgmt').value.trim();
  const uBeds  = document.getElementById('ltr-beds')?.value.trim();
  const uBaths = document.getElementById('ltr-baths')?.value.trim();
  const uSqft  = document.getElementById('ltr-sqft')?.value.trim();

  if (!street || !city) { ltrShowError('Please enter a street address and city.'); return; }
  if (!isCash && (!downPct || !rate)) { ltrShowError('Please enter a down payment % and interest rate.'); return; }

  ltrHideError();
  document.getElementById('ltr-form').style.display = 'none';
  document.getElementById('ltr-loading').style.display = 'block';

  const fullAddr = [street, city, zip||'SC'].filter(Boolean).join(', ');
  const priceCtx = price ? `Purchase price: $${Number(price).toLocaleString()}` : 'Purchase price: not provided, estimate from comps';
  const finCtx   = isCash ? 'Cash purchase. Set dscr null, monthlyMortgage 0, annualDebtService 0, loanAmount 0.' : `${downPct}% down, ${rate}% interest, ${term}-year loan`;
  const hoaCtx   = hoaMo ? `HOA: $${hoaMo}/mo (use exactly)` : 'HOA: 0 (user confirmed none)';
  const mgmtCtx  = mgmtPct ? `Management: ${mgmtPct}% of rent` : 'Management: not provided, set managementFeeAnnual 0';

  try {
    // ── Pre-filled from user input ────────────────────────
    let beds  = uBeds  ? parseInt(uBeds)    : null;
    let baths = uBaths ? parseFloat(uBaths) : null;
    let sqft  = uSqft  ? parseInt(uSqft)    : null;

    // ── CALL 1: beds/baths/sqft if not user-provided ──────
    if (!beds || !baths || !sqft) {
      document.getElementById('ltr-loading-msg').textContent = 'Looking up property details...';
      document.getElementById('ltr-loading-sub').textContent = 'Checking records.';
      try {
        const raw = await callProxy({
          model: 'claude-sonnet-4-5', max_tokens: 120,
          messages: [{ role: 'user', content: `What are the beds, baths, and sqft for: ${fullAddr}? Use actual listing records. JSON only: {"beds":N,"baths":N,"sqft":N}` }]
        });
        const p = extractJSON(raw);
        if (!beds  && p.beds)  beds  = p.beds;
        if (!baths && p.baths) baths = p.baths;
        if (!sqft  && p.sqft)  sqft  = p.sqft;
      } catch(e) {}
    }

    const knownFacts = (beds && baths && sqft)
      ? `CONFIRMED: ${beds} beds, ${baths} baths, ${sqft.toLocaleString()} sqft. Use these exactly.`
      : 'Property details: estimate from address.';

    // ── CALL 2: Geocode + permits (free, parallel) ────────
    document.getElementById('ltr-loading-msg').textContent = 'Checking neighborhood activity...';
    document.getElementById('ltr-loading-sub').textContent = 'Pulling Horry County permit data.';

    let permitCtx = '';
    const coords = await ltrGeocodeAddress(fullAddr);
    if (coords) {
      const permits = await getNearbyPermits(coords.lat, coords.lng);
      if (permits) permitCtx = permits;
    }

    // ── CALL 3: Full investment analysis ──────────────────
    document.getElementById('ltr-loading-msg').textContent = 'Running investment analysis...';
    document.getElementById('ltr-loading-sub').textContent = 'Calculating all the numbers.';

    const analysisPrompt = `LTR analyst. JSON only, start { end }.

PROPERTY: ${fullAddr} | ${priceCtx} | ${finCtx}${isFixer?' | FIXER: '+(cond||'general'):''}
${knownFacts}
${hoaCtx}
${mgmtCtx}
${permitCtx ? permitCtx.slice(0,320) : ''}
RENT: ${beds||'?'}BR comps 2026: 1BR $1100-1600,2BR $1400-2100,3BR $1700-2600,4BR $2100-3400.
EXP: Tax=0.82% of value (SC 6% investment assessment×Horry millage),Ins=$1500SFH/$3000condo/$5000ocean,Utils=$0.20/sqft/yr (e.g. 1200sqft=$240/yr=$20/mo),Maint=0.85%/yr,Vac=6%.
${permitCtx ? 'Permit signals: generate GREEN flags for hospital/medical/retail/school growth, AMBER for new residential supply, RED for industrial or demolition near subject. Farther = less weight.' : ''}

{"inferredPropertyType":"","inferredBeds":${beds||0},"inferredBaths":${baths||0},"inferredSqft":${sqft||0},"inferredYearBuilt":0,"inferredHOAMonthly":0,"inferredFloodZone":null,"inferredFeatures":[],"estimatedValue":0,"verdict":"one punchy sentence","dealRating":"good|ok|tough","estRentMonthly":0,"grossRentAnnual":0,"vacancyLoss":0,"effectiveGrossIncome":0,"propertyTaxAnnual":0,"insuranceAnnual":0,"utilitiesMonthly":0,"hoaAnnual":0,"managementFeeAnnual":0,"maintenanceAnnual":0,"totalExpensesAnnual":0,"noi":0,"capRate":0,"loanAmount":0,"monthlyMortgage":0,"annualDebtService":0,"dscr":${isCash?'null':0},"monthlyCashflow":0,"annualCashflow":0,"cashOnCashReturn":0,"totalCashInvested":0,"estimatedAppreciationPct":0,"estimatedAppreciationDollar1yr":0,"estimatedAppreciationDollar5yr":0,"arv":${isFixer?0:'null'},"rehabBudgetLow":${isFixer?0:'null'},"rehabBudgetHigh":${isFixer?0:'null'},"rehabNarrative":${isFixer?'""':'null'},"totalProjectCost":${isFixer?0:'null'},"potentialEquityGain":${isFixer?0:'null'},"narrative":"Write 3-4 plain sentences that any first-time investor can understand - avoid jargon, use simple language, no acronyms. Cover: (1) what kind of tenant would rent this and why it works as a rental, (2) what the nearby construction activity means in plain terms - e.g. a hospital expanding nearby usually brings stable tenants like nurses and doctors who pay rent reliably, new homes being built shows the area is growing, (3) which of these investing goals this property fits and why in plain terms: steady monthly income, long-term value growth, fixer-upper flip, or tax-efficient swap - be honest if it does not fit some of these, (4) one clear bottom line sentence","flags":[{"type":"green|amber|red","text":""}]}`;

    const analysisRaw = await callProxy({
      model: 'claude-sonnet-4-5', max_tokens: 1200,
      messages: [{ role: 'user', content: analysisPrompt }]
    });

    const d = extractJSON(analysisRaw);
    ltrRenderResults(d, fullAddr, isFixer, isCash);

  } catch(err) {
    document.getElementById('ltr-loading').style.display = 'none';
    document.getElementById('ltr-form').style.display = 'block';
    ltrShowError('Analysis failed: ' + err.message + '. Please try again.');
  }
}

function ltrRenderResults(d, address, isFixer, isCash) {
  document.getElementById('ltr-loading').style.display = 'none';
  document.getElementById('ltr-results').style.display = 'block';
  _ltrData = d; _ltrIsCash = isCash;

  document.getElementById('ltr-r-address').textContent = address;
  const verdictEl = document.getElementById('ltr-r-verdict');
  if (verdictEl) verdictEl.textContent = d.verdict || '';
  document.getElementById('ltr-r-value').textContent = ltrFmt(d.estimatedValue);

  const _cap = d.capRate||0, _cf = d.monthlyCashflow||0, _coc = d.cashOnCashReturn||0;
  const _rating = (_cap>=5.5 && _cf>=100 && _coc>=5) ? 'good' : (_cap>=4 && _cf>=0) ? 'ok' : 'tough';
  const badgeColors = {good:['#2d7a4f','Strong Deal'],ok:['#d97706','Decent Deal'],tough:['#c0392b','Tough Deal']};
  const [bc,bt] = badgeColors[_rating];
  document.getElementById('ltr-r-badge').innerHTML = `<span style="display:inline-flex;align-items:center;padding:.3rem .85rem;font-size:.72rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;background:${bc};color:#fff">${bt}</span>`;

  // Inferred strip
  if (d.inferredBeds || d.inferredSqft) {
    const strip = document.getElementById('ltr-inferred-strip');
    strip.style.display = 'flex';
    const chips = [
      d.inferredPropertyType && `<span style="font-size:.75rem;color:var(--muted)">Type <strong style="color:var(--navy);margin-left:.3rem">${d.inferredPropertyType}</strong></span>`,
      d.inferredBeds  && `<span style="font-size:.75rem;color:var(--muted)">Beds <strong style="color:var(--navy);margin-left:.3rem">${d.inferredBeds}</strong></span>`,
      d.inferredBaths && `<span style="font-size:.75rem;color:var(--muted)">Baths <strong style="color:var(--navy);margin-left:.3rem">${d.inferredBaths}</strong></span>`,
      d.inferredSqft  && `<span style="font-size:.75rem;color:var(--muted)">Sq Ft <strong style="color:var(--navy);margin-left:.3rem">${d.inferredSqft.toLocaleString()}</strong></span>`,
    ].filter(Boolean);
    const features = (d.inferredFeatures||[]).length ? `<div style="flex-basis:100%;display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.35rem">${d.inferredFeatures.map(f=>`<span style="font-size:.68rem;padding:.15rem .5rem;background:rgba(196,120,58,.1);color:var(--brass);border:1px solid rgba(196,120,58,.2)">${f}</span>`).join('')}</div>` : '';
    strip.innerHTML = `<span style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brass);flex-basis:100%;margin-bottom:.35rem">Property Details</span>${chips.join('')}${features}`;
  }

  // Adjustment panel
  const adj = document.getElementById('ltr-adj-panel');
  if (adj) {
    const hoaMoVal = document.getElementById('ltr-hoa')?.value || Math.round((d.hoaAnnual||0)/12);
    const utPaid   = (d.utilitiesMonthly||0)>0 ? 'landlord' : 'tenant';
    const downVal  = document.getElementById('ltr-down')?.value || 25;
    const rateVal  = document.getElementById('ltr-rate')?.value || 7.5;
    adj.innerHTML = `
      <div style="font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:1.25rem;padding-bottom:.6rem;border-bottom:1px solid var(--rule)">Adjust Assumptions <span style="font-size:.7rem;font-weight:400;letter-spacing:0;text-transform:none;color:var(--muted);margin-left:.5rem">recalculates instantly</span></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem" class="adj-grid">
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">Monthly Rent ($)</div>
          <input style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);transition:border-color .15s" id="adj-rent" type="number" value="${d.estRentMonthly||''}" oninput="recalcLtr()"/>
        </div>
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">Purchase Price ($)</div>
          <input style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);transition:border-color .15s" id="adj-price" type="number" value="${d.estimatedValue||''}" oninput="recalcLtr()"/>
        </div>
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">HOA ($/mo)</div>
          <input style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);transition:border-color .15s" id="adj-hoa" type="number" value="${hoaMoVal}" oninput="recalcLtr()"/>
        </div>
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">Insurance ($/yr)</div>
          <input style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);transition:border-color .15s" id="adj-insurance" type="number" value="${d.insuranceAnnual||1800}" oninput="recalcLtr()"/>
        </div>
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">Repair budget ($)</div>
          <input style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);transition:border-color .15s" id="adj-rehab" type="number" value="${d.rehabBudgetHigh||0}" oninput="recalcLtr()"/>
        </div>
        ${!isCash?`
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">Down Payment (%)</div>
          <input style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);transition:border-color .15s" id="adj-down" type="number" value="${downVal}" oninput="recalcLtr()"/>
        </div>
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">Interest Rate (%)</div>
          <input style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);transition:border-color .15s" id="adj-rate" type="number" step="0.1" value="${rateVal}" oninput="recalcLtr()"/>
        </div>`:''}
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">Vacancy % <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted);font-size:.58rem">optional</span></div>
          <input style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);transition:border-color .15s" id="adj-vacancy" type="number" placeholder="0" min="0" max="20" value="0" oninput="recalcLtr()"/>
        </div>
        <div>
          <div style="font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem">Utilities Paid By</div>
          <select style="width:100%;padding:.55rem .75rem;font-family:var(--sans);font-size:.9rem;font-weight:500;background:var(--ivory-2);border:1.5px solid var(--rule);outline:none;color:var(--navy);-webkit-appearance:none" id="adj-utilities" onchange="recalcLtr()">
            <option value="landlord" ${utPaid==='landlord'?'selected':''}>Landlord</option>
            <option value="tenant" ${utPaid==='tenant'?'selected':''}>Tenant</option>
          </select>
        </div>
      </div>`;
    adj.style.display = 'block';
  }

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

  document.getElementById('ltr-narrative-text').textContent = d.narrative || '';
  document.getElementById('ltr-flags').innerHTML = (d.flags||[]).map(f=>{
    const c={green:'#2d7a4f',amber:'#d97706',red:'#c0392b'};
    return `<div style="display:flex;gap:.75rem;align-items:flex-start;padding:.7rem 0;border-bottom:1px solid var(--rule);font-size:.87rem;line-height:1.6;color:var(--navy)"><div style="width:8px;height:8px;border-radius:50%;background:${c[f.type]||c.amber};flex-shrink:0;margin-top:5px"></div><div>${f.text}</div></div>`;
  }).join('') || '<div style="font-size:.85rem;color:var(--muted)">No specific flags noted.</div>';

  recalcLtr();
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(initLtrTips, 150);
}

function recalcLtr() {
  const d = _ltrData; if (!d) return;

  const rent    = parseFloat(document.getElementById('adj-rent')?.value)      || d.estRentMonthly||0;
  const price   = parseFloat(document.getElementById('adj-price')?.value)     || d.estimatedValue||0;
  const hoaMo   = parseFloat(document.getElementById('adj-hoa')?.value)       || 0;
  const utPay   = document.getElementById('adj-utilities')?.value             || 'landlord';
  const vacPct  = parseFloat(document.getElementById('adj-vacancy')?.value)   || 0; // 0 = off by default
  const rawDown = parseFloat(document.getElementById('adj-down')?.value)      || 0;
  const ratePct = parseFloat(document.getElementById('adj-rate')?.value)      || 7.5;
  const termYrs = parseFloat(document.getElementById('ltr-term')?.value)      || 30;

  // 100% down = cash purchase regardless of isCash toggle
  const effectiveCash = _ltrIsCash || rawDown >= 100;
  const downPct       = effectiveCash ? 100 : rawDown || 25;

  // SC investment property tax: 6% assessment ratio × Horry County millage 0.1367 = ~0.82% of value
  const gross   = rent * 12;
  const vac     = Math.round(gross * vacPct / 100);
  const egi     = gross - vac;
  const tax     = d.propertyTaxAnnual || Math.round(price * 0.0082);
  const ins     = parseFloat(document.getElementById('adj-insurance')?.value) || d.insuranceAnnual || 1800;
  const maint   = d.maintenanceAnnual || Math.round(price * 0.0085);
  const utBase  = d.utilitiesMonthly || Math.round((d.inferredSqft || _ltrData?.inferredSqft || 1200) * 0.20 / 12);
  const utAnn   = utPay === 'landlord' ? utBase * 12 : 0;
  const hoaAnn  = hoaMo * 12;
  const mgmt    = d.managementFeeAnnual || 0;
  const opEx    = tax + ins + utAnn + hoaAnn + mgmt + maint + vac;
  const noi     = egi - opEx + vac; // NOI excludes vacancy
  const noiTrue = egi - (tax + ins + utAnn + hoaAnn + mgmt + maint);

  let mort = 0, debt = 0, loan = 0, dscr = null;
  if (!effectiveCash && ratePct > 0) {
    loan = price * (1 - downPct / 100);
    const mo = ratePct / 100 / 12, n = termYrs * 12;
    mort = loan * (mo * Math.pow(1+mo,n)) / (Math.pow(1+mo,n) - 1);
    debt = mort * 12;
    dscr = debt > 0 ? noiTrue / debt : null;
  }

  const cf   = noiTrue - debt - vac;
  const moCF = cf / 12;
  const rehab = parseFloat(document.getElementById("adj-rehab")?.value) || 0;
  const cash = (effectiveCash ? price : price * downPct / 100 + price * 0.03) + rehab;
  const coc  = cash > 0 ? (cf / cash) * 100 : 0;
  const cap  = price > 0 ? (noiTrue / price) * 100 : 0;

  // Render - colors update automatically since ltrCard reads live values
  const dscrCard = effectiveCash
    ? ltrCard('Cash Purchase','100%',null,'#2d7a4f','cash100')
    : ltrCard('DSCR', dscr != null ? dscr.toFixed(2) : '0.00', 'dscr', null, null, dscr||0);

  document.getElementById('ltr-core-metrics').innerHTML =
    ltrCard('Monthly Cash Flow', ltrFmt(moCF), 'cashflow', null, null, moCF) +
    dscrCard +
    ltrCard('Cap Rate', ltrFmtPct(cap), 'capRate', null, null, cap);

  document.getElementById('ltr-income-metrics').innerHTML =
    ltrCard('Monthly Rent',    ltrFmt(rent), null, 'var(--slate)', 'rent') +
    ltrCard('Annual NOI',      ltrFmt(noiTrue),null, 'var(--slate)', 'noi') +
    ltrCard('Annual Cash Flow', ltrFmt(cf),   'cashflow', 'var(--slate)', 'annualCF', cf/12);

  document.getElementById('ltr-return-metrics').innerHTML =
    ltrCard('Cash-on-Cash', ltrFmtPct(coc), 'coc', null, null, coc) +
    ltrCard('Appreciation', ltrFmtPct(d.estimatedAppreciationPct) + '/yr', null, 'var(--brass)', 'appreciation');

  // Expense table
  const rows = [
    ['Property Tax (6% SC investment rate)', tax],
    ['Insurance', ins],
    ...(utPay === 'landlord' ? [['Utilities', utAnn]] : []),
    ...(hoaAnn > 0 ? [['HOA Fees', hoaAnn]] : []),
    ...(mgmt > 0   ? [['Management', mgmt]] : []),
    ['Maintenance Reserve', maint],
    ...(vac > 0    ? [['Vacancy (' + vacPct + '%)', vac]] : []),
  ];
  const rowStyle = 'display:flex;justify-content:space-between;align-items:baseline;padding:.3rem 0;border-bottom:1px solid rgba(0,0,0,.04)';
  const divStyle = 'display:flex;justify-content:space-between;align-items:baseline;padding:.45rem 0;border-top:1.5px solid var(--rule);margin-top:.2rem';
  document.getElementById('ltr-expense-table').innerHTML =
    `<div style="display:flex;flex-direction:column;width:100%;font-size:.83rem">` +
    rows.map(([l,v]) => `<div style="${rowStyle}"><span style="color:var(--muted)">${l}</span><span style="font-weight:500;font-variant-numeric:tabular-nums">${ltrFmt(v)}</span></div>`).join('') +
    `<div style="${divStyle}"><span style="font-weight:600">Total Operating Expenses</span><span style="font-weight:700;font-variant-numeric:tabular-nums">${ltrFmt(opEx - vac)}</span></div>` +
    (!effectiveCash ? `<div style="${rowStyle}"><span style="color:var(--muted)">Annual Mortgage</span><span style="font-weight:500;font-variant-numeric:tabular-nums">${ltrFmt(debt)}</span></div>` : '') +
    `</div>`;

  setTimeout(initLtrTips, 50);
}

function ltrSavePDF() {
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
  document.getElementById('ltr-results').style.display = 'none';
  document.getElementById('ltr-form').style.display = 'block';
  document.getElementById('ltr-arv-section').style.display = 'none';
  const strip = document.getElementById('ltr-inferred-strip');
  if (strip) { strip.style.display='none'; strip.innerHTML=''; }
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
    page: window.location.pathname
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
    page: window.location.pathname
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

