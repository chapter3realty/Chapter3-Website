#!/usr/bin/env node
/*
 * build-col-data.js
 * Builds data/relocating/col-places.json from the raw public files in
 * data/relocating/raw/. Run after refreshing any raw file.
 *
 * Sources
 *   BEA Regional Price Parities, metro (MARPP) and state (SARPP), 2024 vintage,
 *   released 2026-02. Public domain. https://apps.bea.gov/regional/downloadzip.htm
 *   Zillow ZHVI (typical home value, all homes, smoothed, seasonally adjusted)
 *   and ZORI (typical asking rent), metro, latest month in file.
 *   https://www.zillow.com/research/data/  (free, attribution required)
 *
 * Output: one record per selectable place.
 *   { id, name, state, kind: 'msa'|'state'|'nonmetro'|'us',
 *     rpp: { all, goods, housing, utilities, other },   // 2024, US = 100
 *     zhvi, zori, zAsOf, zName }                          // may be null
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, 'raw');
const OUT = path.join(__dirname, 'col-places.json');
const YEAR = '2024';   // BEA vintage column to read; bump when a new MARPP/SARPP zip is dropped into raw/
const localISO = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const ZILLOW = {
  zillow_zhvi_metro: 'https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv',
  zillow_zori_metro: 'https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv',
};
// The Zillow CSVs are 5MB and gitignored; fetch them when absent (or when
// REFRESH_ZILLOW=1) with curl, which Windows 10+ ships as curl.exe.
function ensureZillow() {
  const { execFileSync } = require('child_process');
  for (const [name, url] of Object.entries(ZILLOW)) {
    const f = path.join(RAW, name + '.csv');
    if (fs.existsSync(f) && !process.env.REFRESH_ZILLOW) continue;
    console.log('Downloading ' + url);
    execFileSync(process.platform === 'win32' ? 'curl.exe' : 'curl', ['-sSL', '-o', f, url], { stdio: 'inherit' });
    if (!fs.existsSync(f) || fs.statSync(f).size < 100000) throw new Error('Download failed or too small: ' + f);
  }
}

function parseCsv(text) {
  // Minimal RFC-4180 parser sufficient for BEA and Zillow files.
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const LINE = { 1: 'all', 2: 'goods', 3: 'housing', 4: 'utilities', 5: 'other' };

function loadRpp(file, kindFor) {
  const rows = parseCsv(fs.readFileSync(file, 'latin1'));
  const head = rows[0].map(s => s.trim());
  const yi = head.indexOf(YEAR);
  const places = new Map();
  for (const r of rows.slice(1)) {
    if (r.length < yi + 1) continue;
    const fips = (r[0] || '').trim();
    const name = (r[1] || '').trim();
    const line = parseInt((r[4] || '').trim(), 10);
    if (!fips || !LINE[line]) continue;
    const kind = kindFor(fips, name);
    if (!kind) continue;
    const v = parseFloat(r[yi]);
    if (!Number.isFinite(v)) continue;
    if (!places.has(fips)) places.set(fips, { fips, rawName: name, kind, rpp: {} });
    places.get(fips).rpp[LINE[line]] = v;
  }
  return [...places.values()].filter(p => Object.keys(p.rpp).length === 5);
}

function main() {
  ensureZillow();
  // --- BEA metro file: MSAs + US + US nonmetro. State-level nonmetro portions
  // are in the state file (SARPP) as "State (Nonmetropolitan Portion)".
  const metro = loadRpp(path.join(RAW, 'MARPP', 'MARPP_MSA_2008_2024.csv'), (fips, name) => {
    if (fips === '00000') return 'us';
    if (fips === '00999') return null; // US nonmetro: not a useful origin choice
    if (/Metropolitan Statistical Area/i.test(name)) return 'msa';
    return null;
  });
  // The BEA state zip carries states, DC, the US and the 8 BEA regions. It does
  // not carry state metro/nonmetro portions, so there is no 'nonmetro' kind.
  const state = loadRpp(path.join(RAW, 'SARPP', 'SARPP_STATE_2008_2024.csv'), (fips, name) => {
    if (fips === '00000') return null;
    if (/^\d{5}$/.test(fips) && fips.endsWith('000') && !/Portion|Region|United States/i.test(name)) return 'state';
    return null;
  });
  const STATE_ABBR = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA','Colorado':'CO','Connecticut':'CT','Delaware':'DE','District of Columbia':'DC','Florida':'FL','Georgia':'GA','Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY'
  };
  const stateRecs = state.filter(p => p.kind === 'state' && STATE_ABBR[p.rawName]);
  if (stateRecs.length !== 51) throw new Error('Expected 51 states + DC, got ' + stateRecs.length);
  
  // --- Zillow
  function loadZillow(file) {
    const rows = parseCsv(fs.readFileSync(file, 'utf8'));
    const head = rows[0];
    const nameI = head.indexOf('RegionName'), typeI = head.indexOf('RegionType'), stI = head.indexOf('StateName');
    const dateCols = head.map((h, i) => ({ h, i })).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.h));
    const latest = dateCols[dateCols.length - 1];
    const out = new Map();
    for (const r of rows.slice(1)) {
      if (r[typeI] !== 'msa') continue;
      // take the latest non-empty value walking backwards up to 3 months
      let v = null, asOf = null;
      for (let k = dateCols.length - 1; k >= Math.max(0, dateCols.length - 3); k--) {
        const x = parseFloat(r[dateCols[k].i]);
        if (Number.isFinite(x)) { v = x; asOf = dateCols[k].h; break; }
      }
      if (v == null) continue;
      out.set(r[nameI], { v, asOf, state: r[stI] });
    }
    return { map: out, latest: latest.h };
  }
  const zhvi = loadZillow(path.join(RAW, 'zillow_zhvi_metro.csv'));
  const zori = loadZillow(path.join(RAW, 'zillow_zori_metro.csv'));
  
  // Zillow keys look like "Myrtle Beach, SC". BEA like
  // "Myrtle Beach-Conway-North Myrtle Beach, SC-NC (Metropolitan Statistical Area)".
  // Match on first principal city + first state.
  function beaKey(rawName) {
    const m = rawName.replace(/\s*\(Metropolitan Statistical Area\)\s*/i, '').match(/^(.*?),\s*([A-Z]{2})/);
    if (!m) return null;
    const city = m[1].split('-')[0].trim();
    return `${city}, ${m[2]}`;
  }
  const ZILLOW_ALIASES = {
    // BEA (OMB 2023) first city differs from Zillow's label. Checked by hand
    // against both files on 2026-08-16. Metros that OMB split off in 2023
    // (Waterbury-Shelton CT, Slidell LA, Amherst-Northampton MA) are left
    // unmatched on purpose: Zillow's older delineation is a different geography.
    'Kiryas Joel, NY': 'Poughkeepsie, NY',          // same MSA, renamed 2023 (ZORI only)
    'Louisville/Jefferson County, KY': 'Louisville, KY',
    'Lexington Park, MD': 'California, MD',
    'Wildwood, FL': 'The Villages, FL',
  };
  
  function toSlug(s) {
    return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  
  const out = [];
  const unmatched = [];
  for (const p of metro) {
    if (p.kind === 'us') {
      out.push({ id: 'us', name: 'United States average', state: '', kind: 'us', rpp: p.rpp, zhvi: null, zori: null, zAsOf: null, zName: null });
      continue;
    }
    const clean = p.rawName.replace(/\s*\(Metropolitan Statistical Area\)\s*/i, '').trim();
    const key0 = beaKey(p.rawName);
    const key = ZILLOW_ALIASES[key0] || key0;
    const h = key && zhvi.map.get(key);
    const r = key && zori.map.get(key);
    if (!h) unmatched.push(clean + '  ->  ' + key);
    const stAbbr = (clean.match(/,\s*([A-Z]{2})/) || [])[1] || '';
    out.push({
      id: toSlug(clean),
      name: clean,
      state: stAbbr,
      kind: 'msa',
      rpp: p.rpp,
      zhvi: h ? Math.round(h.v) : null,
      zori: r ? Math.round(r.v) : null,
      zAsOf: h ? h.asOf : null,
      zName: h ? key : null,
    });
  }
  for (const p of stateRecs) {
    out.push({ id: 'state-' + toSlug(p.rawName), name: p.rawName + ' (statewide average)', state: STATE_ABBR[p.rawName], kind: 'state', rpp: p.rpp, zhvi: null, zori: null, zAsOf: null, zName: null });
  }
  // Sort: US, then MSAs by name, then states.
  const order = { us: 0, msa: 1, state: 2 };
  out.sort((a, b) => order[a.kind] - order[b.kind] || a.name.localeCompare(b.name));
  
  // Sanity checks: known values from the raw files (fail loudly if the parse drifts).
  const mb = out.find(p => p.id === 'myrtle-beach-conway-north-myrtle-beach-sc');
  if (!mb) throw new Error('Myrtle Beach MSA missing');
  for (const k of ['all','goods','housing','utilities','other']) if (!(mb.rpp[k] > 50 && mb.rpp[k] < 200)) throw new Error('MB ' + k + ' RPP out of range: ' + mb.rpp[k]);
  if (!(mb.zhvi > 100000 && mb.zhvi < 2000000)) throw new Error('MB ZHVI out of range: ' + mb.zhvi);
  const us = out.find(p => p.id === 'us');
  if (us.rpp.all !== 100) throw new Error('US index not 100');
  const dupIds = out.map(p => p.id).filter((v, i, a) => a.indexOf(v) !== i);
  if (dupIds.length) throw new Error('Duplicate ids: ' + dupIds.join(', '));
  
  const meta = {
    generated: localISO(),
    rppVintage: YEAR,
    rppSource: 'U.S. Bureau of Economic Analysis, Regional Price Parities (MARPP, SARPP), released February 2026',
    zillowLatestMonth: zhvi.latest,
    zillowSource: 'Zillow Research, ZHVI (all homes, smoothed, seasonally adjusted) and ZORI, metro level',
    counts: { msa: out.filter(p => p.kind === 'msa').length, state: stateRecs.length, total: out.length,
              msaWithZhvi: out.filter(p => p.kind === 'msa' && p.zhvi != null).length,
              msaWithZori: out.filter(p => p.kind === 'msa' && p.zori != null).length },
    unmatchedZillow: unmatched,
  };
  fs.writeFileSync(OUT, JSON.stringify({ meta, places: out }, null, 1));
  
  // --- Emit the browser asset. Compact row arrays; the page script expands them.
  // build.js audit checks that the deployed asset equals this exact output, so the
  // page can never drift from data/relocating/col-places.json.
  const assetText = buildAsset({ meta, places: out });
  const ASSETS_DIR = path.join(__dirname, '..', '..', 'chapter3realty', 'assets');
  const existing = fs.readdirSync(ASSETS_DIR).filter(n => /^col(\.[0-9a-f]{10})?\.js$/.test(n));
  const target = existing[0] || 'col.js';
  fs.writeFileSync(path.join(ASSETS_DIR, target), assetText);
  console.log(`Wrote ${OUT.replace(__dirname, 'data/relocating')} and chapter3realty/assets/${target} (${(assetText.length / 1024).toFixed(0)}KB). Run 'node build.js rehash' if the asset changed.`);
  console.log(JSON.stringify(meta, null, 2));
  console.log('Myrtle Beach record:', JSON.stringify(mb));
  
  }

function buildAsset(d) {
  const rows = d.places.map(p => [p.id, p.name, p.state, p.kind, p.rpp.all, p.rpp.goods, p.rpp.housing, p.rpp.utilities, p.rpp.other, p.zhvi, p.zori]);
  const m = { rppVintage: d.meta.rppVintage, zillowLatestMonth: d.meta.zillowLatestMonth, generated: d.meta.generated, counts: d.meta.counts };
  return '/* Cost of living data for /buyers/relocating/cost-of-living/. Generated by data/relocating/build-col-data.js. Do not edit by hand.\n' +
    '   Sources: ' + d.meta.rppSource + '; ' + d.meta.zillowSource + '.\n' +
    '   Row: [id, name, state, kind, rppAll, rppGoods, rppHousing, rppUtilities, rppOther, zhvi, zori]; US = 100. */\n' +
    'window.C3_COL=' + JSON.stringify({ meta: m, rows }) + ';\n';
}
module.exports = { buildAsset, main };
if (require.main === module) main();
