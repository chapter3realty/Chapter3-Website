
// ═══════════════════════════════════
// DATA
// ═══════════════════════════════════
const submarkets = [
  { slug:'myrtle-beach', name:'Myrtle Beach', tagline:'The core market: oceanfront density and the strongest STR velocity.', description:'The city of Myrtle Beach contains the highest concentration of rentable oceanfront units on the Grand Strand. Ocean Boulevard, the Boardwalk corridor, and Kings Highway inventory trade actively year-round with predictable STR revenue patterns.', stats:[{label:'Median list price',value:'TBD'},{label:'Typical STR occupancy',value:'TBD'},{label:'Median nightly rate',value:'TBD'},{label:'STR regulation',value:'Permitted by zone'}], thesis:['Oceanfront studios and 1BRs with established rental programs offer the lowest friction entry to Myrtle Beach STR investing.','Building-level rental program history matters more than unit-level finish: the right building does 40% more revenue than the wrong one.','Watch City of Myrtle Beach zoning overlays carefully: not every address is STR-eligible.'], strStatus:'Permitted in designated zones; permit required; primary STR corridor for the Grand Strand.', typicalInvestor:'First-time STR investor, cash-flow focused, $150K–$500K budget.', priceRange:'$150,000 – $1,500,000+' },
  { slug:'north-myrtle-beach', name:'North Myrtle Beach', tagline:'Family-oriented STR submarket with higher ADR and tighter regulation.', description:'North Myrtle Beach draws a more family-oriented vacation renter, which translates to longer stays, higher per-booking revenue, and lower turnover cost. Cherry Grove, Ocean Drive, Crescent Beach, and Windy Hill each have distinct rental dynamics.', stats:[{label:'Median list price',value:'TBD'},{label:'Typical STR occupancy',value:'TBD'},{label:'Median nightly rate',value:'TBD'},{label:'STR regulation',value:'Permit + overlay required'}], thesis:['ADR premium over Myrtle Beach proper often offsets the higher acquisition cost.','Cherry Grove channel-front and oceanfront SFRs have strongest long-term appreciation.','Verify short-term rental overlay district status on every address: not universal.'], strStatus:'Permitted in specified overlay districts; permit required; minimum rental period rules apply.', typicalInvestor:'Family-budget STR investor, appreciation + cash flow dual mandate.', priceRange:'$300,000 – $2,500,000+' },
  { slug:'surfside-beach', name:'Surfside Beach', tagline:'The "Family Beach": lower nightly rates, higher occupancy, predictable returns.', description:'Surfside Beach brands itself as "The Family Beach" and delivers on it: a walkable pier district, smaller inventory, and a bookings profile skewed heavily to family groups. Lower ADR is offset by consistently higher occupancy.', stats:[{label:'Median list price',value:'TBD'},{label:'Typical STR occupancy',value:'TBD'},{label:'Median nightly rate',value:'TBD'},{label:'STR regulation',value:'Permit required'}], thesis:['Occupancy consistency makes Surfside attractive for break-even-sensitive investors.','Smaller inventory means less comp noise: pricing and rent are easier to establish.','Oceanfront SFRs rare and command premium pricing.'], strStatus:'Permitted with town-issued permit; minimum rental period requirements apply.', typicalInvestor:'Risk-averse cash-flow investor, second-home hybrid.', priceRange:'$250,000 – $1,500,000' },
  { slug:'garden-city', name:'Garden City', tagline:'Pier-adjacent STR corridor with strong shoulder-season bookings.', description:'Garden City runs from the south end of Surfside down to the Murrells Inlet line. Pier District oceanfront is the prime STR corridor; inland inventory trades as second homes or long-term rentals.', stats:[{label:'Median list price',value:'TBD'},{label:'Typical STR occupancy',value:'TBD'},{label:'Median nightly rate',value:'TBD'},{label:'STR regulation',value:'Varies by jurisdiction'}], thesis:['Pier District oceanfront carries Myrtle Beach-level revenue with a quieter neighborhood premium.','Shoulder season (April, October) performs better than pure beach-season markets.'], strStatus:'Regulation depends on specific jurisdiction; verify address-by-address.', typicalInvestor:'Second-home STR hybrid, mid-budget cash flow investor.', priceRange:'$225,000 – $1,200,000' },
  { slug:'murrells-inlet', name:'Murrells Inlet', tagline:'Marshwalk proximity, LTR strength, growing mid-term rental demand.', description:'Murrells Inlet blends a marshfront dining district with inland SFR neighborhoods. STR inventory is limited; the real investor play here is long-term and mid-term rentals.', stats:[{label:'Median list price',value:'TBD'},{label:'Typical LTR rent',value:'TBD'},{label:'MTR demand',value:'Growing'},{label:'STR regulation',value:'Restricted outside designated zones'}], thesis:['LTR cash flow is the cleaner play: STR is constrained in most neighborhoods.','Mid-term rentals (traveling nurses, relocation, military) fill a real gap here.','Marshfront properties command pricing premium but face insurance complications.'], strStatus:'Restricted in most residential zones; verify zoning before assuming STR eligibility.', typicalInvestor:'Long-term rental investor, MTR operator.', priceRange:'$200,000 – $1,000,000+' },
  { slug:'pawleys-island', name:'Pawleys Island', tagline:'Luxury STRs, historic rentals, higher-AUM clientele.', description:'Pawleys Island is the Grand Strand\'s luxury STR submarket. Historic creek-side cottages, oceanfront estates, and gated Litchfield inventory attract a higher-spending renter with longer average stays.', stats:[{label:'Median list price',value:'TBD'},{label:'Typical STR occupancy',value:'TBD'},{label:'Median nightly rate',value:'TBD'},{label:'STR regulation',value:'Permitted; historic rules apply'}], thesis:['ADR premium is significant: strong ROI despite higher acquisition.','Weekly rental culture is well-established; less operational complexity than nightly turnover.','Longer ownership horizons: appreciation play more than pure cash flow.'], strStatus:'Permitted; some historic district overlays apply.', typicalInvestor:'Higher-net-worth investor, lifestyle + investment dual mandate.', priceRange:'$450,000 – $5,000,000+' },
  { slug:'little-river', name:'Little River', tagline:'Emerging value market: NC border, workforce LTR demand, lower entry prices.', description:'Little River sits at the NC/SC border and has been the Grand Strand\'s value story for the last 5 years. Workforce LTR demand is strong, and STR opportunity exists along the Intracoastal and Cherry Grove marshfront.', stats:[{label:'Median list price',value:'TBD'},{label:'Typical LTR rent',value:'TBD'},{label:'Appreciation trend',value:'Above-market'},{label:'STR regulation',value:'County dependent'}], thesis:['Cash flow LTR purchases available well under $300K.','Marshfront and ICW inventory has STR potential with higher variance.','Workforce migration from NC drives sustained rental demand.'], strStatus:'Horry County unincorporated rules apply; check specific address zoning.', typicalInvestor:'Entry-level LTR investor, BRRRR operator, portfolio scaler.', priceRange:'$150,000 – $800,000' },
  { slug:'conway', name:'Conway', tagline:'CCU student housing, LTR cash flow, lowest entry prices on the Grand Strand.', description:'Conway is the Grand Strand\'s working-class market and home to Coastal Carolina University. The investor playbook is clean: long-term rentals with strong student-adjacent demand.', stats:[{label:'Median list price',value:'TBD'},{label:'Typical LTR rent',value:'TBD'},{label:'Student population (CCU)',value:'~11,000'},{label:'STR regulation',value:'Restrictive'}], thesis:['Rent-by-the-room student rentals can outperform traditional LTRs.','Manufactured home LTRs fill a chronic workforce-housing gap.','BRRRR inventory exists: true fixer-upper SFRs trade under $200K.'], strStatus:'Restrictive: STR is not the Conway play; focus on LTR and MTR.', typicalInvestor:'Cash-flow LTR investor, rent-by-room operator, BRRRR.', priceRange:'$120,000 – $500,000' },
];

// ═══════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
  // special: build submarket grid dynamically on first show
  if (id === 'invest') buildSubmarketGrid();
}

function showSubmarket(slug) {
  const sm = submarkets.find(s => s.slug === slug);
  if (!sm) return;
  document.getElementById('sm-breadcrumb').textContent = sm.name;
  document.getElementById('sm-eyebrow').textContent = sm.name + ': Submarket Research';
  document.getElementById('sm-name').textContent = sm.name;
  document.getElementById('sm-tagline').textContent = sm.tagline;
  document.getElementById('sm-desc').textContent = sm.description;
  document.getElementById('sm-aside-name').textContent = sm.name + ' Snapshot';
  // stats
  document.getElementById('sm-stats').innerHTML = sm.stats.map(s =>
    `<div class="stat-box"><div class="stat-box-label">${s.label}</div><div class="stat-box-val">${s.value}</div></div>`
  ).join('');
  // thesis
  document.getElementById('sm-thesis').innerHTML = sm.thesis.map((t,i) =>
    `<li><span class="thesis-num">${String(i+1).padStart(2,'0')}</span><span class="thesis-text">${t}</span></li>`
  ).join('');
  // aside
  document.getElementById('sm-aside-dl').innerHTML = `
    <div><div class="aside-dt">Price Range</div><div class="aside-dd">${sm.priceRange}</div></div>
    <div><div class="aside-dt">STR Status</div><div class="aside-dd aside-dd-sm">${sm.strStatus}</div></div>
    <div><div class="aside-dt">Typical Investor</div><div class="aside-dd aside-dd-sm">${sm.typicalInvestor}</div></div>
  `;
  showPage('submarket');
}

function buildSubmarketGrid() {
  const grid = document.getElementById('submarketGrid');
  if (grid.children.length > 0) return; // already built
  grid.innerHTML = submarkets.map(sm => `
    <a href="#" class="submarket-card" onclick="showSubmarket('${sm.slug}')">
      <div class="submarket-name">${sm.name}</div>
      <div class="submarket-blurb">${sm.blurb || sm.tagline}</div>
      <div class="submarket-link">Research →</div>
    </a>
  `).join('');
}

// ═══════════════════════════════════
// GRAND INVESTOR TOOL
// ═══════════════════════════════════

const PROXY_BASE = 'https://api-proxy.chapter3realty.workers.dev';

// ── GEOGRAPHIC LOCK ──
const ALLOWED_LOCALITIES = [
  'myrtle beach','north myrtle beach','surfside beach',
  'garden city','murrells inlet','pawleys island','litchfield beach',
  'little river','conway','florence','loris','socastee',
  'carolina forest','the grove','longs','aynor','hemingway'
];
const ALLOWED_COUNTIES   = ['horry','georgetown','florence'];
const ALLOWED_KEYWORDS   = ['sc','south carolina'];

function isAllowedLocation(address) {
  const a = address.toLowerCase();
  // Always allow if clearly SC Grand Strand or Florence
  if (ALLOWED_KEYWORDS.some(k => a.includes(k))) return true;
  if (ALLOWED_LOCALITIES.some(l => a.includes(l))) return true;
  if (ALLOWED_COUNTIES.some(c => a.includes(c))) return true;
  return false;
}

// ── CACHE (indefinite, session-level + localStorage) ──
const _cache = {};
function cacheKey(obj) { return JSON.stringify(obj); }
function cacheGet(key) {
  if (_cache[key]) return _cache[key];
  try {
    const raw = sessionStorage.getItem('c3_' + btoa(key).slice(0,80));
    if (raw) { const v = JSON.parse(raw); _cache[key] = v; return v; }
  } catch(e){}
  return null;
}
function cacheSet(key, val) {
  _cache[key] = val;
  try { sessionStorage.setItem('c3_' + btoa(key).slice(0,80), JSON.stringify(val)); } catch(e){}
}

// ── API HELPER ──
async function apiGet(path, params) {
  const url = new URL(AIRROI_BASE + path);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(PROXY_BASE, { method:'GET', headers:{'x-api-name':'airroi-get','x-api-path':path} });
  const t1=await res.text();let d1;try{d1=JSON.parse(t1);}catch(e){d1={error:t1};}
  if (!res.ok) throw new Error('AirROI '+res.status);
  return d1;
}
async function apiPost(path, body) {
  const res = await fetch(PROXY_BASE, { method:'POST', headers:{'Content-Type':'application/json','x-api-name':'airroi-post','x-api-path':path}, body:JSON.stringify(body) });
  const t2=await res.text();let d2;try{d2=JSON.parse(t2);}catch(e){d2={error:t2};}
  if (!res.ok) throw new Error('AirROI '+res.status);
  return d2;
}

// ── TAB SWITCHER ──
function switchTool(id, btn) {
  document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tool-panel').forEach(p => p.style.display = 'none');
  document.getElementById('tool-' + id).style.display = 'block';
  if (btn) btn.classList.add('active');
}

// ── FORMATTERS ──
const fmt$ = v => '$' + Math.round(v).toLocaleString();
const fmtPct = v => Math.round(v * 100) + '%';
const fmtN = v => v != null ? v.toFixed(1) : 'N/A';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─────────────────────────────────────────
// TOOL 1: REVENUE ESTIMATOR
// ─────────────────────────────────────────
async function runRevenueEstimate() {
  const address = document.getElementById('rev-address').value.trim();
  const beds    = parseInt(document.getElementById('rev-beds').value);
  const baths   = parseFloat(document.getElementById('rev-baths').value);
  const guests  = parseInt(document.getElementById('rev-guests').value);
  const errEl   = document.getElementById('rev-error');
  errEl.style.display = 'none';

  if (!address) { showRevErr('Please enter a property address.'); return; }
  if (!isAllowedLocation(address)) {
    showRevErr('This tool is locked to the Grand Strand, Conway, and Florence, SC area. Please enter an address within that region.');
    return;
  }

  const key = cacheKey({type:'estimate', address, beds, baths, guests});
  const cached = cacheGet(key);
  const cachedBadge = document.getElementById('rev-cached-badge');

  setRevLoading(true);
  try {
    let data = cached;
    if (!data) {
      data = await apiGet('/calculator/estimate', { address, bedrooms: beds, baths, guests, currency: 'usd' });
      cacheSet(key, data);
      cachedBadge.style.display = 'none';
    } else {
      cachedBadge.style.display = 'inline-block';
    }
    renderRevenueResults(data);
  } catch(e) {
    showRevErr('Could not load data. Check your API key or try again shortly.');
    console.error(e);
  } finally {
    setRevLoading(false);
  }
}

function setRevLoading(on) {
  document.getElementById('rev-loading').style.display = on ? 'flex' : 'none';
  document.getElementById('rev-results').style.display = 'none';
  document.getElementById('rev-btn-text').textContent = on ? 'Loading…' : 'Estimate Revenue →';
}
function showRevErr(msg) {
  const e = document.getElementById('rev-error');
  e.textContent = msg; e.style.display = 'block';
  setRevLoading(false);
}

function renderRevenueResults(data) {
  document.getElementById('rev-loading').style.display = 'none';
  document.getElementById('rev-results').style.display = 'block';
  document.getElementById('rev-btn-text').textContent = 'Estimate Revenue →';

  document.getElementById('rev-annual').textContent = data.revenue != null ? fmt$(data.revenue) : 'N/A';
  document.getElementById('rev-adr').textContent    = data.average_daily_rate != null ? fmt$(data.average_daily_rate) + '/night' : 'N/A';
  document.getElementById('rev-occ').textContent    = data.occupancy != null ? fmtPct(data.occupancy) : 'N/A';

  // Percentile bars
  const p = data.percentiles?.revenue;
  if (p) {
    const max = p.p90 || p.avg * 1.4;
    document.getElementById('rev-pct-bars').innerHTML = ['p25','p50','p75','p90'].map(pct => {
      const h = Math.round((p[pct] / max) * 100);
      return `<div class="pct-bar-wrap">
        <div class="pct-bar ${pct}" style="height:${h}%"></div>
        <div class="pct-val">${fmt$(p[pct])}</div>
      </div>`;
    }).join('');
  }

  // Seasonal chart
  const monthly = data.monthly_revenue_distributions;
  if (monthly && monthly.length === 12 && data.revenue) {
    const maxRatio = Math.max(...monthly.filter(Boolean));
    document.getElementById('rev-seasonal-chart').innerHTML = monthly.map((r, i) => {
      const h = r ? Math.round((r / maxRatio) * 100) : 0;
      const monthRev = r ? fmt$(data.revenue * r) : '$0';
      return `<div class="season-bar-wrap" title="${MONTHS[i]}: ${monthRev}">
        <div class="season-bar" style="height:${h}%"></div>
        <div class="season-label">${MONTHS[i].slice(0,1)}</div>
      </div>`;
    }).join('');
  }
}

// ─────────────────────────────────────────
// TOOL 2: MARKET DASHBOARD
// ─────────────────────────────────────────
async function runMarketDashboard() {
  const locality  = document.getElementById('mkt-locality').value;
  const roomType  = document.getElementById('mkt-room-type').value;
  const beds      = document.getElementById('mkt-beds').value;
  const errEl     = document.getElementById('mkt-error');
  errEl.style.display = 'none';

  const market = { country: 'United States', region: 'South Carolina', locality };
  const filter = {};
  if (roomType) filter.room_type = { eq: roomType };
  if (beds)     filter.bedrooms  = { eq: parseInt(beds) };

  const body = { market, filter, currency: 'usd', num_months: 12 };
  const key  = cacheKey({type:'market_all', body});
  const cached = cacheGet(key);
  const cachedBadge = document.getElementById('mkt-cached-badge');

  setLoading('mkt', true);
  try {
    let data = cached;
    if (!data) {
      const [summary, metrics] = await Promise.all([
        apiPost('/markets/summary', body),
        apiPost('/markets/metrics/all', body)
      ]);
      data = { summary, metrics };
      cacheSet(key, data);
      cachedBadge.style.display = 'none';
    } else {
      cachedBadge.style.display = 'inline-block';
    }
    renderMarketDashboard(data, locality);
  } catch(e) {
    document.getElementById('mkt-error').textContent = 'Could not load market data. Check your API key.';
    document.getElementById('mkt-error').style.display = 'block';
    console.error(e);
  } finally {
    setLoading('mkt', false);
  }
}

function setLoading(prefix, on) {
  document.getElementById(prefix + '-loading').style.display = on ? 'flex' : 'none';
  if (document.getElementById(prefix + '-results')) document.getElementById(prefix + '-results').style.display = on ? 'none' : '';
  const btn = document.getElementById(prefix + '-btn-text');
  if (btn) btn.textContent = on ? 'Loading…' : btn.dataset.original || btn.textContent;
}

function renderMarketDashboard(data, locality) {
  document.getElementById('mkt-loading').style.display = 'none';
  document.getElementById('mkt-results').style.display = 'block';
  const s = data.summary;
  document.getElementById('mkt-title').textContent = locality + ': STR Market Summary (Trailing 12 Months)';
  document.getElementById('mkt-summary').innerHTML = `
    <div class="mkt-stat"><div class="mkt-stat-val">${fmtPct(s.occupancy||0)}</div><div class="mkt-stat-label">Avg Occupancy</div></div>
    <div class="mkt-stat"><div class="mkt-stat-val">${fmt$(s.average_daily_rate||0)}</div><div class="mkt-stat-label">Avg Daily Rate</div></div>
    <div class="mkt-stat"><div class="mkt-stat-val">${fmt$(s.rev_par||0)}</div><div class="mkt-stat-label">RevPAR</div></div>
    <div class="mkt-stat"><div class="mkt-stat-val">${Math.round(s.booking_lead_time||0)}d</div><div class="mkt-stat-label">Booking Lead Time</div></div>
    <div class="mkt-stat"><div class="mkt-stat-val">${fmtN(s.length_of_stay||0)}</div><div class="mkt-stat-label">Avg Stay (nights)</div></div>
    <div class="mkt-stat"><div class="mkt-stat-val">${Math.round(s.active_listings_count||0).toLocaleString()}</div><div class="mkt-stat-label">Active Listings</div></div>
    <div class="mkt-stat"><div class="mkt-stat-val">${fmtN(s.min_nights||0)}</div><div class="mkt-stat-label">Avg Min Nights</div></div>
    <div class="mkt-stat"><div class="mkt-stat-val">${fmt$(s.revenue||0)}</div><div class="mkt-stat-label">Avg Monthly Rev</div></div>
  `;
  // restyle grid
  document.getElementById('mkt-summary').style.gridTemplateColumns = 'repeat(4,1fr)';

  // charts from metrics time series
  const results = data.metrics?.results || [];
  if (results.length) {
    const maxOcc = Math.max(...results.map(r => r.occupancy?.avg||0));
    const maxAdr = Math.max(...results.map(r => r.average_daily_rate?.avg||0));
    document.getElementById('mkt-occ-chart').innerHTML = results.map(r => {
      const h = maxOcc ? Math.round(((r.occupancy?.avg||0)/maxOcc)*100) : 0;
      const d = r.date?.slice(0,7) || '';
      return `<div class="mkt-bar-wrap" title="${d}: ${fmtPct(r.occupancy?.avg||0)}">
        <div class="mkt-bar" style="height:${h}%"></div>
        <div class="mkt-bar-label">${d.slice(5)}</div>
      </div>`;
    }).join('');
    document.getElementById('mkt-adr-chart').innerHTML = results.map(r => {
      const h = maxAdr ? Math.round(((r.average_daily_rate?.avg||0)/maxAdr)*100) : 0;
      const d = r.date?.slice(0,7) || '';
      return `<div class="mkt-bar-wrap" title="${d}: ${fmt$(r.average_daily_rate?.avg||0)}">
        <div class="mkt-bar" style="height:${h}%; background:var(--brass)"></div>
        <div class="mkt-bar-label">${d.slice(5)}</div>
      </div>`;
    }).join('');
  }
}

// ─────────────────────────────────────────
// TOOL 3: COMPARABLE LISTINGS
// ─────────────────────────────────────────
async function runComps() {
  const address = document.getElementById('comp-address').value.trim();
  const beds    = parseInt(document.getElementById('comp-beds').value);
  const baths   = parseFloat(document.getElementById('comp-baths').value);
  const guests  = parseInt(document.getElementById('comp-guests').value);
  const errEl   = document.getElementById('comp-error');
  errEl.style.display = 'none';

  if (!address) { errEl.textContent = 'Please enter an address.'; errEl.style.display = 'block'; return; }
  if (!isAllowedLocation(address)) {
    errEl.textContent = 'This tool is locked to the Grand Strand, Conway, and Florence area.';
    errEl.style.display = 'block'; return;
  }

  const key = cacheKey({type:'comps', address, beds, baths, guests});
  const cached = cacheGet(key);
  document.getElementById('comp-cached-badge').style.display = 'none';

  document.getElementById('comp-loading').style.display = 'flex';
  document.getElementById('comp-results').style.display = 'none';
  document.getElementById('comp-btn-text').textContent = 'Searching…';

  try {
    let data = cached;
    if (!data) {
      data = await apiGet('/listings/comparables', { address, bedrooms: beds, baths, guests, currency: 'usd' });
      cacheSet(key, data);
    } else {
      document.getElementById('comp-cached-badge').style.display = 'inline-block';
    }
    renderComps(data);
  } catch(e) {
    errEl.textContent = 'Could not load comps. Check your API key.';
    errEl.style.display = 'block';
    console.error(e);
  } finally {
    document.getElementById('comp-loading').style.display = 'none';
    document.getElementById('comp-btn-text').textContent = 'Find Comps →';
  }
}

function renderComps(data) {
  const listings = data.listings || [];
  document.getElementById('comp-results').style.display = 'block';
  document.getElementById('comp-count').textContent = `${listings.length} comparable listing${listings.length !== 1 ? 's' : ''} found`;
  if (!listings.length) {
    document.getElementById('comp-list').innerHTML = '<p style="padding:1.5rem;color:var(--muted)">No comparable listings found nearby. Try adjusting bedrooms or guest count.</p>';
    return;
  }
  document.getElementById('comp-list').innerHTML = listings.map(l => {
    const info = l.listing_info || {};
    const pm   = l.performance_metrics || {};
    const loc  = l.location_info || {};
    const rat  = l.ratings || {};
    return `<div class="comp-card">
      <div>
        <div class="comp-name">${info.listing_name || 'STR Listing'}</div>
        <div class="comp-meta">${loc.locality || ''} · ${l.property_details?.bedrooms ?? '?'} bed / ${l.property_details?.baths ?? '?'} bath · Sleeps ${l.property_details?.guests ?? '?'}</div>
        ${rat.rating_overall ? `<div class="comp-rating">★ ${rat.rating_overall} (${rat.num_reviews || 0} reviews)</div>` : ''}
      </div>
      <div>
        <div class="comp-stats">
          <div><div class="comp-stat-val">${pm.ttm_revenue ? fmt$(pm.ttm_revenue) : 'N/A'}</div><div class="comp-stat-label">TTM Revenue</div></div>
          <div><div class="comp-stat-val">${pm.ttm_occupancy != null ? fmtPct(pm.ttm_occupancy) : 'N/A'}</div><div class="comp-stat-label">Occupancy</div></div>
          <div><div class="comp-stat-val">${pm.ttm_avg_rate ? fmt$(pm.ttm_avg_rate) : 'N/A'}</div><div class="comp-stat-label">ADR</div></div>
        </div>
        <div style="margin-top:.75rem">
          <a href="#" class="comp-cta" onclick="showPage('contact')">Interested in this property? Contact Chapter 3 →</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ─────────────────────────────────────────
// TOOL 4: TOP CONDOS
// ─────────────────────────────────────────
async function runCondoSearch() {
  const locality = document.getElementById('condo-locality').value;
  const beds     = document.getElementById('condo-beds').value;
  const minRev   = document.getElementById('condo-min-rev').value;
  const amenityBoxes = document.querySelectorAll('#tool-condos .amenity-check input:checked');
  const amenities = Array.from(amenityBoxes).map(b => b.value).filter(v => v !== 'ocean_view');
  const errEl = document.getElementById('condo-error');
  errEl.style.display = 'none';

  const filter = {
    room_type: { eq: 'entire_home' },
  };
  if (beds) filter.bedrooms = { eq: parseInt(beds) };
  if (minRev) filter.ttm_revenue = { gte: parseFloat(minRev) };
  if (amenities.length) filter.amenities = { any: amenities };

  const body = {
    market: { country: 'United States', region: 'South Carolina', locality },
    filter,
    sort: { ttm_revenue: 'desc' },
    pagination: { page_size: 20, offset: 0 },
    currency: 'usd'
  };

  const key = cacheKey({type:'condos', body});
  const cached = cacheGet(key);
  document.getElementById('condo-cached-badge').style.display = 'none';
  document.getElementById('condo-loading').style.display = 'flex';
  document.getElementById('condo-results').style.display = 'none';
  document.getElementById('condo-btn-text').textContent = 'Searching…';

  try {
    let data = cached;
    if (!data) {
      data = await apiPost('/listings/search/market', body);
      cacheSet(key, data);
    } else {
      document.getElementById('condo-cached-badge').style.display = 'inline-block';
    }
    renderCondos(data, locality);
  } catch(e) {
    errEl.textContent = 'Could not load listings. Check your API key.';
    errEl.style.display = 'block';
    console.error(e);
  } finally {
    document.getElementById('condo-loading').style.display = 'none';
    document.getElementById('condo-btn-text').textContent = 'Search Top Performers →';
  }
}

function renderCondos(data, locality) {
  const listings = data.results || [];
  document.getElementById('condo-results').style.display = 'block';
  document.getElementById('condo-count').textContent =
    `Top ${listings.length} STR performers in ${locality}: sorted by TTM revenue`;
  if (!listings.length) {
    document.getElementById('condo-list').innerHTML = '<p style="padding:1.5rem;color:var(--muted)">No listings matched these filters. Try loosening the criteria.</p>';
    return;
  }
  document.getElementById('condo-list').innerHTML = listings.map((l, idx) => {
    const info = l.listing_info || {};
    const pm   = l.performance_metrics || {};
    const rat  = l.ratings || {};
    const pd   = l.property_details || {};
    return `<div class="comp-card">
      <div>
        <div class="comp-name"><span style="color:var(--brass);font-family:var(--serif);margin-right:.5rem">#${idx+1}</span>${info.listing_name || 'STR Listing'}</div>
        <div class="comp-meta">${pd.bedrooms ?? '?'} bed / ${pd.baths ?? '?'} bath · Sleeps ${pd.guests ?? '?'}</div>
        ${rat.rating_overall ? `<div class="comp-rating">★ ${rat.rating_overall} (${rat.num_reviews || 0} reviews)</div>` : ''}
        ${pd.amenities?.length ? `<div style="font-size:.65rem;color:var(--muted);margin-top:.3rem">${pd.amenities.slice(0,5).join(' · ')}</div>` : ''}
      </div>
      <div>
        <div class="comp-stats">
          <div><div class="comp-stat-val">${pm.ttm_revenue ? fmt$(pm.ttm_revenue) : 'N/A'}</div><div class="comp-stat-label">TTM Revenue</div></div>
          <div><div class="comp-stat-val">${pm.ttm_occupancy != null ? fmtPct(pm.ttm_occupancy) : 'N/A'}</div><div class="comp-stat-label">Occupancy</div></div>
          <div><div class="comp-stat-val">${pm.ttm_avg_rate ? fmt$(pm.ttm_avg_rate) : 'N/A'}</div><div class="comp-stat-label">ADR</div></div>
        </div>
        <div style="margin-top:.75rem">
          <a href="#" class="comp-cta" onclick="showPage('contact')">Interested in this property? Contact Chapter 3 →</a>
        </div>
      </div>
    </div>`;
  }).join('');
}


// ─────────────────────────────────────────
// LTR TOOLS PAGE
// ─────────────────────────────────────────
function showLTRTool(id, el) {
  document.querySelectorAll('.ltr-tool-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.ltr-tool-card').forEach(c => c.classList.remove('active'));
  document.getElementById('ltr-tool-' + id).style.display = 'block';
  if (el) el.classList.add('active');
  // Scroll to the tool panel
  setTimeout(() => {
    const panel = document.getElementById('ltr-tool-' + id);
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

// ─────────────────────────────────────────
// DSCR ADDRESS AUTOCOMPLETE (Google Places)
// Works even if STR Map was never visited
// ─────────────────────────────────────────
let d2AutocompleteService = null;
let d2Geocoder = null;
let d2PlacesLoading = false;

function d2InitPlaces() {
  if (window.google && window.google.maps && window.google.maps.places) {
    if (!d2AutocompleteService) {
      d2AutocompleteService = new google.maps.places.AutocompleteService();
      d2Geocoder = new google.maps.Geocoder();
    }
  }
}

function d2EnsurePlaces() {
  // Already ready
  if (d2AutocompleteService) return;
  // Maps loaded but Places not yet initialized
  if (window.google && window.google.maps && window.google.maps.places) {
    d2InitPlaces(); return;
  }
  // Maps loaded but Places library missing: unlikely since we include it
  if (window.google && window.google.maps && !window.google.maps.places) return;
  // Maps not loaded at all: load it now (lightweight, no map rendering)
  if (!d2PlacesLoading && GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== 'YOUR_GOOGLE_MAPS_KEY') {
    d2PlacesLoading = true;
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places,geometry&callback=d2PlacesReady`;
    s.async = true;
    document.head.appendChild(s);
  }
}

function d2PlacesReady() {
  d2InitPlaces();
  // Also init the STR map if it's been queued
  if (typeof initSTRMap === 'function' && document.getElementById('page-strmap')?.classList.contains('active')) {
    initSTRMap();
  }
}

// Called when main Maps callback fires (STR map path)
const _origInitSTRMap = window.initSTRMap;
window.initSTRMap = function() {
  if (_origInitSTRMap) _origInitSTRMap();
  d2InitPlaces();
};

// Try init immediately if Maps already on page
if (window.google && window.google.maps) d2InitPlaces();

function d2AddressInput(input) {
  // Lazily ensure Places is loaded
  d2EnsurePlaces();

  const val = input.value.trim();
  const dropdown = document.getElementById('d2-address-dropdown');
  if (!dropdown) return;

  if (val.length < 3 || !d2AutocompleteService) {
    dropdown.classList.remove('open');
    dropdown.style.display = 'none';
    return;
  }

  d2AutocompleteService.getPlacePredictions({
    input: val,
    componentRestrictions: { country: 'us' },
    types: ['address']
  }, (predictions, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
      dropdown.classList.remove('open');
      dropdown.style.display = 'none';
      return;
    }
    dropdown.innerHTML = predictions.slice(0, 5).map(p =>
      `<div class="strmap-ac-item" onclick="d2SelectAddress('${p.place_id}','${p.description.replace(/'/g, "\\'")}')">
        ${p.description}
      </div>`
    ).join('');
    dropdown.style.display = 'block';
    dropdown.classList.add('open');
  });
}

function d2SelectAddress(placeId, description) {
  document.getElementById('d2-street').value = description;
  const dropdown = document.getElementById('d2-address-dropdown');
  if (dropdown) { dropdown.classList.remove('open'); dropdown.style.display = 'none'; }

  if (!d2Geocoder) return;
  d2Geocoder.geocode({ placeId }, (results, status) => {
    if (status !== 'OK' || !results[0]) return;
    const comps = results[0].address_components;
    const county = comps.find(c => c.types.includes('administrative_area_level_2'));
    const zip    = comps.find(c => c.types.includes('postal_code'));
    if (county) document.getElementById('d2-county').value = county.long_name.replace(' County','');
    if (zip)    { document.getElementById('d2-zip').value = zip.long_name; d2AutoFillCounty(); }
  });
}

// Trigger Places load as soon as user lands on LTR page
const _baseShowPage = window.showPage || showPage;
window.showPage = function(id) {
  _baseShowPage(id);
  if (id === 'ltr') {
    setTimeout(d2EnsurePlaces, 100);
  }
};

// Close DSCR dropdown on outside click
document.addEventListener('click', e => {
  const dd = document.getElementById('d2-address-dropdown');
  if (dd && !e.target.closest('#d2-street') && !e.target.closest('#d2-address-dropdown')) {
    dd.classList.remove('open'); dd.style.display = 'none';
  }
});
// Full SC rental rates, county millage, zip→county
// ─────────────────────────────────────────
const SC_RENTAL_RATES = {
  "Hilton Head": { target_1800_sqft: 3600, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Kiawah": { target_1800_sqft: 3600, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Isle of Palms": { target_1800_sqft: 3600, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Sullivans Island": { target_1800_sqft: 3500, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Daniel Island": { target_1800_sqft: 3400, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Charleston Downtown": { target_1800_sqft: 3400, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Folly Beach": { target_1800_sqft: 2900, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Charleston": { target_1800_sqft: 2800, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Mount Pleasant": { target_1800_sqft: 2700, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "James Island": { target_1800_sqft: 2500, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "West Ashley": { target_1800_sqft: 2300, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Summerville": { target_1800_sqft: 2200, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "North Charleston": { target_1800_sqft: 2000, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Myrtle Beach": { target_1800_sqft: 2200, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "North Myrtle Beach": { target_1800_sqft: 2250, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Little River": { target_1800_sqft: 2100, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Surfside Beach": { target_1800_sqft: 2100, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Murrells Inlet": { target_1800_sqft: 2000, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Pawleys Island": { target_1800_sqft: 2400, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Garden City": { target_1800_sqft: 2050, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Conway": { target_1800_sqft: 1600, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Florence": { target_1800_sqft: 1700, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Beaufort": { target_1800_sqft: 2000, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Columbia": { target_1800_sqft: 1800, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Greenville": { target_1800_sqft: 1900, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} },
  "Default SC": { target_1800_sqft: 1650, tier_multipliers: {small:1.19,medium:1.09,standard:1.0,large:0.89,very_large:0.78} }
};

const SC_COUNTY_MILLAGE = {
  "Horry":0.1918,"Charleston":0.2247,"Beaufort":0.1952,"Greenville":0.2386,
  "Richland":0.2936,"Lexington":0.1855,"Spartanburg":0.2513,"York":0.232,
  "Berkeley":0.1975,"Dorchester":0.2019,"Anderson":0.2019,"Pickens":0.1869,
  "Florence":0.2178,"Sumter":0.2547,"Georgetown":0.1887,"Aiken":0.1813,
  "Orangeburg":0.2638,"Williamsburg":0.2274,"Colleton":0.2274,"Darlington":0.2365,
  "Cherokee":0.2196,"Lancaster":0.2019,"Chesterfield":0.2274,"Marion":0.2547,
  "Newberry":0.2274,"Laurens":0.2196,"Union":0.2547,"Chester":0.2365,
  "Kershaw":0.2365,"Lee":0.2547,"Dillon":0.2547,"Marlboro":0.2547,
  "Barnwell":0.2274,"Bamberg":0.2547,"Allendale":0.2547,"Hampton":0.2274,
  "Jasper":0.2178,"Saluda":0.2274,"Edgefield":0.2196,"Abbeville":0.2196,
  "Oconee":0.1869,"Clarendon":0.2547,"Fairfield":0.2638,"McCormick":0.2274,
  "Calhoun":0.2274,"Greenwood":0.2274
};

const SC_ZIP_TO_COUNTY = {
  "29526":"Horry","29527":"Horry","29544":"Horry","29554":"Horry","29566":"Horry",
  "29568":"Horry","29569":"Horry","29572":"Horry","29575":"Horry","29576":"Horry",
  "29577":"Horry","29578":"Horry","29579":"Horry","29582":"Horry","29585":"Horry",
  "29588":"Horry","29587":"Horry","29597":"Horry",
  "29401":"Charleston","29403":"Charleston","29405":"Charleston","29407":"Charleston",
  "29412":"Charleston","29414":"Charleston","29464":"Charleston","29466":"Charleston",
  "29901":"Beaufort","29902":"Beaufort","29906":"Beaufort","29910":"Beaufort","29928":"Beaufort",
  "29601":"Greenville","29605":"Greenville","29607":"Greenville","29615":"Greenville","29650":"Greenville",
  "29201":"Richland","29203":"Richland","29204":"Richland","29205":"Richland","29206":"Richland",
  "29072":"Lexington","29073":"Lexington","29169":"Lexington","29170":"Lexington",
  "29301":"Spartanburg","29302":"Spartanburg","29303":"Spartanburg","29306":"Spartanburg",
  "29730":"York","29732":"York","29707":"York","29715":"York",
  "29440":"Georgetown","29442":"Georgetown",
  "29445":"Berkeley","29461":"Berkeley","29483":"Berkeley",
  "29485":"Dorchester","29486":"Dorchester",
  "29621":"Anderson","29624":"Anderson","29625":"Anderson",
  "29630":"Pickens","29631":"Pickens","29671":"Pickens",
  "29501":"Florence","29505":"Florence","29506":"Florence",
  "29150":"Sumter","29153":"Sumter","29154":"Sumter"
};

let d2InsMode = 'auto', d2RentMode = 'auto', d2TaxMode = 'auto', d2LastCalc = null;

function d2AutoFillCounty() {
  const zip = document.getElementById('d2-zip').value.trim();
  if (zip.length === 5 && SC_ZIP_TO_COUNTY[zip]) {
    document.getElementById('d2-county').value = SC_ZIP_TO_COUNTY[zip];
  }
}

function d2SetMode(type, mode) {
  if (type === 'ins') {
    d2InsMode = mode;
    document.getElementById('ins-auto').classList.toggle('active', mode==='auto');
    document.getElementById('ins-manual').classList.toggle('active', mode==='manual');
    document.getElementById('d2-insurance').style.display = mode==='manual' ? 'block' : 'none';
  } else if (type === 'rent') {
    d2RentMode = mode;
    document.getElementById('rent-auto').classList.toggle('active', mode==='auto');
    document.getElementById('rent-manual').classList.toggle('active', mode==='manual');
    document.getElementById('d2-manual-rent').style.display = mode==='manual' ? 'block' : 'none';
  } else if (type === 'tax') {
    d2TaxMode = mode;
    document.getElementById('tax-auto').classList.toggle('active', mode==='auto');
    document.getElementById('tax-manual').classList.toggle('active', mode==='manual');
    document.getElementById('d2-manual-tax').style.display = mode==='manual' ? 'block' : 'none';
  }
}

function d2ToggleNOI() {
  const p = document.getElementById('d2-noi-panel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function d2UpdateUtilities() {
  const m = document.getElementById('d2-utilities-mode').value;
  document.getElementById('d2-utilities-group').style.display = m === 'owner' ? 'block' : 'none';
}

function d2GetRentalRate(address, sqft) {
  const up = address.toUpperCase();
  const sizeTier = sqft < 1000 ? 'small' : sqft < 1500 ? 'medium' : sqft < 2000 ? 'standard' : sqft < 2500 ? 'large' : 'very_large';
  const checks = [
    ['HILTON HEAD','Hilton Head'],['KIAWAH','Kiawah'],['ISLE OF PALMS','Isle of Palms'],
    ['SULLIVANS ISLAND','Sullivans Island'],['DANIEL ISLAND','Daniel Island'],
    ['FOLLY BEACH','Folly Beach'],['JAMES ISLAND','James Island'],
    ['WEST ASHLEY','West Ashley'],['MOUNT PLEASANT','Mount Pleasant'],
    ['SUMMERVILLE','Summerville'],['NORTH CHARLESTON','North Charleston'],
    ['NORTH MYRTLE','North Myrtle Beach'],['LITTLE RIVER','Little River'],
    ['SURFSIDE','Surfside Beach'],['MURRELLS INLET','Murrells Inlet'],
    ['PAWLEYS ISLAND','Pawleys Island'],['GARDEN CITY','Garden City'],
    ['MYRTLE BEACH','Myrtle Beach'],['CONWAY','Conway'],['FLORENCE','Florence'],
    ['BEAUFORT','Beaufort'],['COLUMBIA','Columbia'],['GREENVILLE','Greenville'],
    ['CHARLESTON','Charleston']
  ];
  let locData = SC_RENTAL_RATES['Default SC'], locName = 'Default SC';
  for (const [check, name] of checks) {
    if (up.includes(check)) { locData = SC_RENTAL_RATES[name]; locName = name; break; }
  }
  const est = Math.round((locData.target_1800_sqft / 1800) * locData.tier_multipliers[sizeTier] * sqft);
  return { location: locName, estimatedRent: est, lowEstimate: Math.round(est*0.9), highEstimate: Math.round(est*1.1) };
}

function d2MonthlyPayment(principal, annualRate, years) {
  const r = annualRate / 12, n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1);
}

function calcDSCR2() {
  const street  = document.getElementById('d2-street').value;
  const county  = document.getElementById('d2-county').value.trim();
  const zip     = document.getElementById('d2-zip').value.trim();
  const price   = parseFloat(document.getElementById('d2-price').value);
  const sqft    = parseFloat(document.getElementById('d2-sqft').value);
  const hoa     = parseFloat(document.getElementById('d2-hoa').value) || 0;
  const downPct = parseFloat(document.getElementById('d2-down').value) / 100;
  const rate    = parseFloat(document.getElementById('d2-rate').value) / 100;
  const term    = parseFloat(document.getElementById('d2-term').value);

  if (!county || !price || !sqft) { alert('Please fill in County, Purchase Price, and Square Feet.'); return; }

  const address = `${street}, ${county} County, SC ${zip}`;
  const loanAmt = price * (1 - downPct);

  let monthlyRent, rentInfo;
  if (d2RentMode === 'manual') {
    monthlyRent = parseFloat(document.getElementById('d2-manual-rent').value) || 0;
    rentInfo = { location: 'Manual', estimatedRent: monthlyRent, lowEstimate: monthlyRent, highEstimate: monthlyRent };
  } else {
    rentInfo = d2GetRentalRate(address, sqft);
    monthlyRent = rentInfo.estimatedRent;
  }

  const insurance = d2InsMode === 'manual' ? (parseFloat(document.getElementById('d2-insurance').value)||150) : 150;

  let taxAnnual, taxMonthly, countyUsed;
  if (d2TaxMode === 'manual') {
    taxAnnual  = parseFloat(document.getElementById('d2-manual-tax').value) || 0;
    taxMonthly = taxAnnual / 12;
    countyUsed = 'Manual';
  } else {
    const norm = county.trim().replace(/\s+county$/i,'').replace(/\s+/g,'').toLowerCase();
    const key  = norm.charAt(0).toUpperCase() + norm.slice(1);
    const millage = SC_COUNTY_MILLAGE[key];
    if (!millage) { alert(`County "${county}" not found. Try Manual tax mode.`); return; }
    taxAnnual  = price * 0.06 * millage;
    taxMonthly = taxAnnual / 12;
    countyUsed = key;
  }

  const pi       = d2MonthlyPayment(loanAmt, rate, term);
  const totalPITI = pi + taxMonthly + insurance + hoa;
  const dscr     = totalPITI > 0 ? (monthlyRent * 12) / (totalPITI * 12) : 0;
  const cashflow = monthlyRent - totalPITI;

  let badgeClass, badgeText;
  if (dscr >= 1.25) { badgeClass='dscr2-badge-good'; badgeText='Excellent: qualifies for most DSCR lenders'; }
  else if (dscr >= 1.0) { badgeClass='dscr2-badge-ok'; badgeText='Good: meets minimum threshold'; }
  else { badgeClass='dscr2-badge-low'; badgeText='Below 1.0: does not cover debt service'; }

  const cfColor = cashflow >= 0 ? 'var(--saddle)' : 'var(--slate)';

  document.getElementById('dscr2-results-content').innerHTML = `
    <div class="dscr2-result-cell">
      <div class="dscr2-result-label">DSCR</div>
      <div class="dscr2-result-value">${dscr.toFixed(2)}</div>
      <div class="dscr2-badge ${badgeClass}">${badgeText}</div>
    </div>
    <div class="dscr2-result-cell">
      <div class="dscr2-result-label">Est. Monthly Rent</div>
      <div class="dscr2-result-value">$${monthlyRent.toLocaleString()}</div>
      <div class="dscr2-result-caption">Range: $${rentInfo.lowEstimate.toLocaleString()}–$${rentInfo.highEstimate.toLocaleString()} · ${rentInfo.location}</div>
    </div>
    <div class="dscr2-result-cell">
      <div class="dscr2-result-label">Monthly Cashflow</div>
      <div class="dscr2-result-value" style="color:${cfColor}">$${Math.abs(cashflow).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
      <div class="dscr2-result-caption" style="color:${cfColor}">${cashflow>=0?'Positive':'Negative'} · after PITI</div>
    </div>
    <div class="dscr2-result-cell">
      <div class="dscr2-result-label">Annual Property Tax</div>
      <div class="dscr2-result-value">$${taxAnnual.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
      <div class="dscr2-result-caption">${countyUsed} County</div>
    </div>
  `;

  d2LastCalc = { monthlyRent, taxMonthly, insurance, hoa, sqft, pi, loanAmt, price };
  document.getElementById('dscr2-results').style.display = 'block';
  document.getElementById('dscr2-results').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function calcNOI2() {
  if (!d2LastCalc) { alert('Please calculate DSCR first.'); return; }
  const vacancy     = (parseFloat(document.getElementById('d2-vacancy').value)||5) / 100;
  const maintenance = (parseFloat(document.getElementById('d2-maintenance').value)||10) / 100;
  const utilitiesMode = document.getElementById('d2-utilities-mode').value;
  let utilities = 0;
  if (utilitiesMode === 'owner') {
    const manual = parseFloat(document.getElementById('d2-utilities').value)||0;
    utilities = manual > 0 ? manual : Math.max(75, Math.min(350, (d2LastCalc.sqft||1500) * 0.16));
  }
  const egi    = d2LastCalc.monthlyRent * (1 - vacancy);
  const maint  = d2LastCalc.monthlyRent * maintenance;
  const totEx  = d2LastCalc.taxMonthly + d2LastCalc.insurance + d2LastCalc.hoa + maint + utilities;
  const noiMo  = egi - totEx;
  const noiAnn = noiMo * 12;
  const capRate = d2LastCalc.price > 0 ? (noiAnn / d2LastCalc.price * 100).toFixed(2) : 0;

  document.getElementById('d2-noi-content').innerHTML = `
    <div class="dscr2-result-cell">
      <div class="dscr2-result-label">Monthly NOI</div>
      <div class="dscr2-result-value">$${noiMo.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
    </div>
    <div class="dscr2-result-cell">
      <div class="dscr2-result-label">Annual NOI</div>
      <div class="dscr2-result-value">$${noiAnn.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
    </div>
    <div class="dscr2-result-cell">
      <div class="dscr2-result-label">Cap Rate</div>
      <div class="dscr2-result-value">${capRate}%</div>
      <div class="dscr2-result-caption">NOI ÷ Purchase Price</div>
    </div>
    <div class="dscr2-result-cell">
      <div class="dscr2-result-label">Assumptions</div>
      <div style="font-size:.8rem;color:var(--muted);margin-top:.4rem;line-height:1.7">
        Vacancy: ${(vacancy*100).toFixed(1)}%<br>
        Maintenance: ${(maintenance*100).toFixed(1)}%<br>
        Utilities: $${utilities.toFixed(0)}/mo
      </div>
    </div>
  `;
  document.getElementById('d2-noi-results').style.display = 'block';
}

function toggleMobile() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ═══════════════════════════════════
// CONTACT FORM (demo: shows success state)
// ═══════════════════════════════════
function submitContact(e) {
  e.preventDefault();
  var f = document.getElementById('contactForm');
  var nameEl = f.querySelector('[name=name]');
  var firstName = nameEl ? nameEl.value.trim() : (f.querySelector('[name=firstName]') ? f.querySelector('[name=firstName]').value.trim() : '');
  var lastName  = nameEl ? '' : (f.querySelector('[name=lastName]') ? f.querySelector('[name=lastName]').value.trim() : '');
  var email     = f.querySelector('[name=email]')     ? f.querySelector('[name=email]').value.trim()     : '';
  var phone     = f.querySelector('[name=phone]')     ? f.querySelector('[name=phone]').value.trim()     : '';
  var interest  = f.querySelector('[name=interest]:checked') ? f.querySelector('[name=interest]:checked').value : '';
  var notes     = f.querySelector('[name=notes]')     ? f.querySelector('[name=notes]').value.trim()     : '';
  c3SendForm({
    name: (firstName+' '+lastName).trim(),
    email: email,
    phone: phone,
    interest: interest,
    message: notes,
    page: window.location.pathname
  }, 'Contact Form');
  f.style.display = 'none';
  var s = document.getElementById('contactSuccess');
  if(s) s.style.display = 'block';
}
