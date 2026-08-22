#!/usr/bin/env node
/*
 * build-cities.js — the city name index behind the calculator's picker.
 *
 *   node build.js citydata
 *
 * The calculator compares metro areas, because that is the level every price
 * source publishes at. Buyers do not type metro areas. They type the town they
 * live in, and "Plano" or "Scottsdale" or "Boca Raton" is in no metro title,
 * so the picker used to return nothing for them.
 *
 * This builds city -> metro from two public domain Census files and writes a
 * browser asset the picker loads on demand.
 *
 *   national_place2020.txt   every place, with the counties it sits in
 *   list1_2023.xlsx          every county, with the CBSA it belongs to
 *   sub-est2024.csv          population, used to rank and to set the cut
 *
 * Join: place -> county -> CBSA title -> the id already in col-places.json.
 *
 * Three things this has to get right, each of which was wrong first time:
 *
 *  1. The county list in the places file is separated by "~~~", not by commas.
 *     Splitting on commas silently drops every city that straddles two
 *     counties, which is most large suburbs. Plano, Frisco and Cary all
 *     vanished before this was caught.
 *  2. A straddling city must not take whichever county is listed first. Cary
 *     sits in Chatham and Wake and the first one lands it in Durham. Rank the
 *     candidates: a metro whose title names the city wins, then a central
 *     county over an outlying one.
 *  3. Connecticut replaced its counties with planning regions in 2022. The
 *     delineation file uses the new regions, the 2020 places file still uses
 *     the old counties, and no newer places file is published. So CT is
 *     bridged by hand below. Without it every Connecticut town is missing,
 *     and the northeast is where these buyers come from.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const HERE = __dirname;
const RAW = path.join(HERE, 'raw');
const ROOT = path.join(HERE, '..', '..');
const ASSETS = path.join(ROOT, 'chapter3realty', 'assets');

/* Population floor for incorporated places. Below this the names are hamlets
 * nobody types, and every one costs bytes in a file the browser fetches.
 *
 * Census designated places are kept whatever their size, because the
 * population estimates program does not cover them at all: every CDP would
 * score zero and be cut, and the CDPs include Bethesda, Arlington, Silver
 * Spring, Metairie, Columbia and The Villages. Those are exactly the places
 * these buyers leave. Keeping all of them costs about 138KB, which is why the
 * page fetches this file only when someone puts the cursor in the city box. */
const MIN_POP = 2500;

const SOURCES = {
  places: 'https://www2.census.gov/geo/docs/reference/codes2020/national_place2020.txt',
  cbsa: 'https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx',
  pop: 'https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/cities/totals/sub-est2024.csv',
};

const STATE_ABBR = { Alabama:'AL',Alaska:'AK',Arizona:'AZ',Arkansas:'AR',California:'CA',Colorado:'CO',Connecticut:'CT',Delaware:'DE','District of Columbia':'DC',Florida:'FL',Georgia:'GA',Hawaii:'HI',Idaho:'ID',Illinois:'IL',Indiana:'IN',Iowa:'IA',Kansas:'KS',Kentucky:'KY',Louisiana:'LA',Maine:'ME',Maryland:'MD',Massachusetts:'MA',Michigan:'MI',Minnesota:'MN',Mississippi:'MS',Missouri:'MO',Montana:'MT',Nebraska:'NE',Nevada:'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND',Ohio:'OH',Oklahoma:'OK',Oregon:'OR',Pennsylvania:'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD',Tennessee:'TN',Texas:'TX',Utah:'UT',Vermont:'VT',Virginia:'VA',Washington:'WA','West Virginia':'WV',Wisconsin:'WI',Wyoming:'WY' };
const ABBR_STATE = Object.fromEntries(Object.entries(STATE_ABBR).map(([k, v]) => [v, k]));

/* Connecticut, bridged by hand. See note 3 at the top. New Haven County is the
 * only old county that splits across two of the new metros, so the Naugatuck
 * valley towns are named and the rest of the county falls to New Haven. */
const CT_COUNTY_METRO = {
  'fairfield county': 'Bridgeport-Stamford-Danbury, CT',
  'hartford county': 'Hartford-West Hartford-East Hartford, CT',
  'tolland county': 'Hartford-West Hartford-East Hartford, CT',
  'middlesex county': 'Hartford-West Hartford-East Hartford, CT',
  'new london county': 'Norwich-New London-Willimantic, CT',
  'new haven county': 'New Haven, CT',
};
const CT_NAUGATUCK = new Set(['Waterbury','Naugatuck','Shelton','Ansonia','Derby','Seymour','Beacon Falls','Oxford','Middlebury','Prospect','Wolcott','Cheshire','Southbury']);

/* Places that are not incorporated places and so are in no Census place file,
 * but that people absolutely type. The five New York City boroughs. */
const EXTRA = [
  ['Brooklyn', 'NY', 'New York-Newark-Jersey City, NY-NJ', 2561225],
  ['Queens', 'NY', 'New York-Newark-Jersey City, NY-NJ', 2252196],
  ['Bronx', 'NY', 'New York-Newark-Jersey City, NY-NJ', 1356476],
  ['Manhattan', 'NY', 'New York-Newark-Jersey City, NY-NJ', 1597451],
  ['Staten Island', 'NY', 'New York-Newark-Jersey City, NY-NJ', 490687],
];

function get(url, dest) {
  return new Promise((resolve, reject) => {
    const f = fs.createWriteStream(dest);
    const go = (u, n) => https.get(u, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && n < 5) {
        res.resume(); return go(new URL(res.headers.location, u).href, n + 1);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`${res.statusCode} for ${u}`)); }
      res.pipe(f); f.on('finish', () => f.close(resolve));
    }).on('error', reject);
    go(url, 0);
  });
}

/* Minimal xlsx reader: a xlsx is a zip, and the two members we need are
 * deflated XML. Avoids a dependency for one file read a year. */
function unzip(buf) {
  const out = {};
  // walk the central directory from the end-of-central-directory record
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('not a zip');
  let off = buf.readUInt32LE(eocd + 16);
  const count = buf.readUInt16LE(eocd + 10);
  for (let i = 0; i < count; i++) {
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nameLen);
    const lNameLen = buf.readUInt16LE(localOff + 26);
    const lExtraLen = buf.readUInt16LE(localOff + 28);
    const start = localOff + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);
    out[name] = method === 8 ? zlib.inflateRawSync(raw) : Buffer.from(raw);
    off += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

const unent = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function readSheet(files) {
  const ss = (files['xl/sharedStrings.xml'] || Buffer.from('')).toString('utf8');
  const shared = (ss.match(/<si>[\s\S]*?<\/si>/g) || []).map((si) =>
    unent((si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || []).map((t) => t.replace(/<[^>]*>/g, '')).join('')));
  const sheet = files['xl/worksheets/sheet1.xml'].toString('utf8');
  const colnum = (c) => { let n = 0; for (const ch of c) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
  const rows = [];
  for (const body of sheet.match(/<row[^>]*>[\s\S]*?<\/row>/g) || []) {
    const row = {};
    /* The lazy quantifier on the attributes matters. Greedy, it eats the "/"
     * of a self-closing empty cell, then matches the ">" branch and swallows
     * every following cell up to the next </c>. That silently blanked 263
     * metro rows before it was caught. */
    const re = /<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let m;
    while ((m = re.exec(body))) {
      const v = /<v>([\s\S]*?)<\/v>/.exec(m[3] || '');
      if (!v) continue;
      row[colnum(m[1])] = m[2].includes('t="s"') ? shared[+v[1]] : unent(v[1]);
    }
    if (Object.keys(row).length) rows.push(row);
  }
  return rows;
}

function parseCsvLine(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur); return out;
}

const stripKind = (n) => n.replace(/\s+(city and borough|consolidated government|metro government|urban county government|unified government|municipality|borough|village|town|city|CDP)$/i, '').trim();
/* BEA marks a few metros with a trailing "*" and one carries the words
 * "Metropolitan Statistical Area". Normalise both sides before joining. */
const normTitle = (t) => t.replace(/\s*Metropolitan Statistical Area\s*$/i, '').replace(/\*+\s*$/, '').trim();

async function main() {
  fs.mkdirSync(RAW, { recursive: true });
  const files = {
    places: path.join(RAW, 'census_national_place2020.txt'),
    cbsa: path.join(RAW, 'census_list1_2023.xlsx'),
    pop: path.join(RAW, 'census_sub_est2024.csv'),
  };
  for (const k of Object.keys(files)) {
    if (!fs.existsSync(files[k])) {
      process.stdout.write(`downloading ${k} ... `);
      await get(SOURCES[k], files[k]);
      console.log(`${(fs.statSync(files[k]).size / 1048576).toFixed(1)}MB`);
    }
  }

  // county -> { metro title, is it the central county }
  const countyMetro = new Map();
  for (const row of readSheet(unzip(fs.readFileSync(files.cbsa)))) {
    if (row[4] !== 'Metropolitan Statistical Area') continue;
    const ab = STATE_ABBR[row[8]];
    if (!ab) continue;
    countyMetro.set(`${ab}|${(row[7] || '').toLowerCase()}`, { title: row[3], central: row[11] === 'Central' });
  }
  if (countyMetro.size < 1000) throw new Error(`only ${countyMetro.size} county rows parsed; the delineation read is broken`);

  // population, keyed by place name + state name
  const pop = new Map();
  const popLines = fs.readFileSync(files.pop, 'latin1').split('\n');
  const popHdr = parseCsvLine(popLines[0]);
  const iSum = popHdr.indexOf('SUMLEV'), iName = popHdr.indexOf('NAME'), iSt = popHdr.indexOf('STNAME');
  const iPop = popHdr.indexOf('POPESTIMATE2024');
  for (let i = 1; i < popLines.length; i++) {
    if (!popLines[i]) continue;
    const c = parseCsvLine(popLines[i]);
    if (!['162', '157', '170'].includes(c[iSum])) continue;
    const n = parseInt(c[iPop], 10);
    if (!isFinite(n)) continue;
    const k = `${c[iName]}|${c[iSt]}`;
    if (n > (pop.get(k) || 0)) pop.set(k, n);
  }

  // places -> metro
  const best = new Map();
  for (const line of fs.readFileSync(files.places, 'utf8').split('\n')) {
    const p = line.replace(/\r$/, '').split('|');
    if (p.length < 9 || p[0] === 'STATE') continue;
    const [st, , , , rawName, kind, , , counties] = p;
    const city = stripKind(rawName);
    const isCdp = kind === 'CENSUS DESIGNATED PLACE';
    const cands = [];
    for (const c of counties.split('~~~')) {          // NOT a comma. See note 1.
      const key = c.trim().toLowerCase();
      let hit = countyMetro.get(`${st}|${key}`);
      if (!hit && st === 'CT') {                       // See note 3.
        const title = CT_NAUGATUCK.has(city) ? 'Waterbury-Shelton, CT' : CT_COUNTY_METRO[key];
        if (title) hit = { title, central: true };
      }
      if (hit && !cands.some((x) => x.title === hit.title)) cands.push(hit);
    }
    if (!cands.length) continue;
    // See note 2: a metro that names the city beats one that does not, then a
    // central county beats an outlying one.
    const named = (t) => new RegExp(`(^|[-\\s])${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([-,]|$)`).test(t);
    cands.sort((a, b) => (named(b.title) - named(a.title)) || (b.central - a.central));
    const population = pop.get(`${rawName}|${ABBR_STATE[st] || ''}`) || 0;
    const k = `${city}|${st}`;
    const prev = best.get(k);
    // An incorporated place always beats a CDP of the same name in the same
    // state, whatever the estimate says, because the CDP's is always zero.
    const better = !prev || (prev.cdp && !isCdp) || (prev.cdp === isCdp && population > prev.pop);
    if (better) best.set(k, { city, st, metro: cands[0].title, pop: population, cdp: isCdp });
  }
  for (const [city, st, metro, population] of EXTRA) best.set(`${city}|${st}`, { city, st, metro, pop: population, cdp: false });

  // keep only what resolves to a place we actually price
  const places = JSON.parse(fs.readFileSync(path.join(HERE, 'col-places.json'), 'utf8')).places;
  const byTitle = new Map(places.filter((p) => p.kind === 'msa').map((p) => [normTitle(p.name), p.id]));
  const metroIds = [];
  const metroIdx = new Map();
  const rows = [];
  let unresolved = 0;
  for (const r of [...best.values()].sort((a, b) => b.pop - a.pop)) {
    if (!r.cdp && r.pop < MIN_POP) continue;   // CDPs have no estimate at all
    const id = byTitle.get(normTitle(r.metro));
    if (!id) { unresolved++; continue; }
    if (!metroIdx.has(id)) { metroIdx.set(id, metroIds.length); metroIds.push(id); }
    rows.push([r.city, r.st, metroIdx.get(id), r.cdp ? 1 : 0, r.pop]);
  }
  /* Order is the picker's ranking: it scans this array and takes matches as it
   * finds them. Alphabetical put Plano, IL (pop 12k) above Plano, TX (pop
   * 293k), which is the opposite of what anyone typing "Plano" means. So:
   * incorporated places by population, largest first, then the CDPs, which
   * have no published estimate and would otherwise all tie at zero. */
  rows.sort((a, b) => (a[3] - b[3]) || (b[4] - a[4]) || a[0].localeCompare(b[0]));
  for (const r of rows) r.length = 3;

  if (rows.length < 9000) throw new Error(`only ${rows.length} cities survived; expected about twelve thousand`);
  for (const [probe, st] of [['Bethesda','MD'],['Levittown','NY'],['Conway','SC'],['Plano','TX'],['Stamford','CT']]) {
    if (!rows.some((r) => r[0] === probe && r[1] === st)) throw new Error(`${probe}, ${st} is missing from the city index`);
  }
  const plano = rows.filter((r) => r[0] === 'Plano');
  if (plano.length && plano[0][1] !== 'TX') throw new Error(`Plano, ${plano[0][1]} outranks Plano, TX in the picker order`);
  const conway = rows.find((r) => r[0] === 'Conway' && r[1] === 'SC');
  if (!conway || metroIds[conway[2]] !== 'myrtle-beach-conway-north-myrtle-beach-sc') {
    throw new Error('Conway, SC does not resolve to the Myrtle Beach metro');
  }

  const out = { generated: new Date().toISOString().slice(0, 10), minPop: MIN_POP, metros: metroIds, cities: rows };
  fs.writeFileSync(path.join(HERE, 'cities.json'), JSON.stringify(out));

  const asset = '/* City name index for /buyers/relocating/cost-of-living/. Generated by data/relocating/build-cities.js. Do not edit by hand.\n' +
    '   Sources: US Census Bureau place and county delineation files, and Vintage 2024 population estimates. Public domain.\n' +
    '   Row: [city, stateAbbr, index into metros]; metros holds ids from col-places.json. */\n' +
    'window.C3_CITIES=' + JSON.stringify(out) + ';\n';
  const existing = fs.readdirSync(ASSETS).filter((n) => /^cities(\.[0-9a-f]{10})?\.js$/.test(n));
  const target = existing[0] || 'cities.js';
  fs.writeFileSync(path.join(ASSETS, target), asset);

  console.log(`${rows.length} cities across ${metroIds.length} metros -> data/relocating/cities.json and chapter3realty/assets/${target} (${(asset.length / 1024).toFixed(0)}KB).`);
  console.log(`${unresolved} dropped: their metro is not priced (Puerto Rico, and metros with no home value).`);
  console.log(`Run 'node build.js rehash' if the asset changed.`);
}

module.exports = { main };
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
