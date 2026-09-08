// Verify the return calculator on /invest/rental-returns/ in a real browser
// against three hand-computed cases, then the map. Usage (server on :8123
// from chapter3realty/):
//   NODE_PATH=$(npm root -g) node tools/verify-returns-calc.js [screenshot-dir]
// Hand computation (PLAYBOOK A29b): gross = rent x 12; allowance = gross x
// allow%; management = gross x mgmt%; tax = price x 0.06 x mills / 1000 + fees;
// left = gross - allowance - management - tax - insurance - dues x 12;
// return = left / price; coverage = rent / 1.00, / 1.10, / 1.25.
//   A  Myrtle Beach 254.6 mills, $279,713, $1,823, ins $3,050, 10%, 25%:
//      gross 21,876; allow 5,469; mgmt 2,187.60; tax 4,272.89; left 6,896.51; 2.47% -> "2.5%"; 1,823 / 1,657 / 1,458
//   B  Pawleys Island 233.9 mills + $96, $550,277, $1,380, ins $3,050, 10%, 25%:
//      gross 16,560; allow 4,140; mgmt 1,656; tax 7,818.58; left -104.58 -> "-$105"; -0.02% -> "-0.0%"; dealbreaker
//   C  Conway 269.3 mills, $250,000, $1,900, dues $50, ins $1,700, 0%, 10%:
//      gross 22,800; allow 2,280; mgmt 0; tax 4,039.50; dues 600; left 14,180.50; 5.67% -> "5.7%"; 1,900 / 1,727 / 1,520; passes
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = process.argv[2];
const CASES = [
  { name: 'A', area: 'myrtle-beach', price: 279713, rent: 1823, hoa: 0, ins: 3050, mgmt: '10', allow: '25', noi: '$6,897', cap: '2.5%', tax: '$4,273', c100: '$1,823', c110: '$1,657', c125: '$1,458', verdictHas: 'Passes the first screen' },
  { name: 'B', area: 'pawleys-island', price: 550277, rent: 1380, hoa: 0, ins: 3050, mgmt: '10', allow: '25', noi: '−$105', cap: '−0.0%', tax: '$7,819', c100: '$1,380', c110: '$1,255', c125: '$1,104', verdictHas: 'Dealbreaker' },
  { name: 'C', area: 'conway', price: 250000, rent: 1900, hoa: 50, ins: 1700, mgmt: '0', allow: '10', noi: '$14,181', cap: '5.7%', tax: '$4,040', c100: '$1,900', c110: '$1,727', c125: '$1,520', verdictHas: 'Passes the first screen' },
  { name: 'D', area: 'north-myrtle-beach', price: 400143, rent: 1627, hoa: 0, ins: 3050, mgmt: '10', allow: '25', noi: '$4,450', cap: '1.1%', tax: '$5,191', c100: '$1,627', c110: '$1,479', c125: '$1,302', verdictHas: 'Below 2 percent' },
];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('http://127.0.0.1:8123/invest/rental-returns/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.c3Ret === 'function');
  let fails = 0;
  const set = async c => { await page.selectOption('#rrArea', c.area); await page.fill('#rrPrice', String(c.price)); await page.fill('#rrRent', String(c.rent)); await page.fill('#rrHoa', String(c.hoa)); await page.fill('#rrIns', String(c.ins)); await page.selectOption('#rrMgmt', c.mgmt); await page.selectOption('#rrAllow', c.allow); await page.dispatchEvent('#rrPrice', 'input'); };
  const read = () => page.evaluate(() => ({
    noi: document.getElementById('rrNoi').textContent, cap: document.getElementById('rrCap').textContent, tax: document.getElementById('rrTax').textContent,
    c100: document.getElementById('rrC100').textContent, c110: document.getElementById('rrC110').textContent, c125: document.getElementById('rrC125').textContent,
    verdict: document.getElementById('rrVerdict').textContent, rects: document.querySelectorAll('#rrChart rect').length,
    vis: ['rrNoi', 'rrCap', 'rrTax', 'rrC125', 'rrVerdict', 'rrChart'].every(id => { const b = document.getElementById(id).getBoundingClientRect(); return b.width > 0 && b.height > 0; }),
  }));
  for (const c of CASES) {
    await set(c);
    const g = await read();
    const checks = [['left', g.noi === c.noi, g.noi, c.noi], ['return', g.cap === c.cap, g.cap, c.cap], ['tax', g.tax === c.tax, g.tax, c.tax], ['/1.00', g.c100 === c.c100, g.c100, c.c100], ['/1.10', g.c110 === c.c110, g.c110, c.c110], ['/1.25', g.c125 === c.c125, g.c125, c.c125], ['verdict', g.verdict.includes(c.verdictHas), g.verdict.slice(0, 40), c.verdictHas], ['visible', g.vis, String(g.vis), 'true']];
    for (const [k, ok, got, exp] of checks) { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} case ${c.name} ${k}: got "${got}" expected "${exp}"`); }
    console.log(`     case ${c.name} chart rects=${g.rects}`);
  }
  /* ---- the map: nine regions, four toggles, tooltip on hover, focus and click, no data fill ---- */
  const m = await page.evaluate(() => {
    const regions = [...document.querySelectorAll('#rrmap .rg')];
    const fills = regions.map(r => r.querySelector('path').getAttribute('fill'));
    return { regions: regions.length, buttons: document.querySelectorAll('#rrtog button').length, pressed: document.querySelectorAll('#rrtog button[aria-pressed="true"]').length, fills: [...new Set(fills)].length, legend: document.getElementById('rrleg').textContent.trim().slice(0, 60), ids: regions.map(r => r.dataset.id) };
  });
  const mchecks = [['nine regions', m.regions === 9, m.regions, 9], ['four buttons', m.buttons === 4, m.buttons, 4], ['one pressed', m.pressed === 1, m.pressed, 1], ['ramp used', m.fills >= 3, m.fills, '>=3'], ['legend text', /Long-term return/.test(m.legend), m.legend, 'Long-term return']];
  for (const [k, ok, got, exp] of mchecks) { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} map ${k}: got "${got}" expected "${exp}"`); }
  await page.locator('#rrmap').scrollIntoViewIfNeeded();
  await page.hover('#rrmap [data-id="surfside-beach"] path');
  let tip = await page.evaluate(() => { const t = document.getElementById('rrtip'); const b = t.getBoundingClientRect(); return { shown: getComputedStyle(t).display !== 'none' && b.width > 0, text: t.textContent }; });
  const hoverOk = tip.shown && /Surfside Beach \(ZIP 29575\)/.test(tip.text) && /Short-term return: 3\.4 to 5\.4 percent/.test(tip.text) && /Long-term rent: \$1,607/.test(tip.text);
  if (!hoverOk) fails++; console.log(`${hoverOk ? 'ok  ' : 'FAIL'} map hover Surfside: "${tip.text.slice(0, 120)}"`);
  await page.mouse.move(5, 5);
  await page.click('#rrtog button[data-k="str"]');
  const cf = await page.evaluate(() => ({ fill: document.querySelector('#rrmap [data-id="carolina-forest"] path').getAttribute('fill'), pressed: document.querySelector('#rrtog button[aria-pressed="true"]').dataset.k, legend: document.getElementById('rrleg').textContent }));
  const cfOk = cf.fill === '#e6e0d6' && cf.pressed === 'str' && /no data/.test(cf.legend);
  if (!cfOk) fails++; console.log(`${cfOk ? 'ok  ' : 'FAIL'} map short-term toggle: Carolina Forest fill ${cf.fill}, pressed ${cf.pressed}, legend "${cf.legend.slice(0, 80)}"`);
  await page.focus('#rrmap [data-id="conway"]');
  tip = await page.evaluate(() => { const t = document.getElementById('rrtip'); return { shown: getComputedStyle(t).display !== 'none', text: t.textContent }; });
  const focusOk = tip.shown && /Conway \(ZIP 29526\)/.test(tip.text);
  if (!focusOk) fails++; console.log(`${focusOk ? 'ok  ' : 'FAIL'} map keyboard focus Conway: "${tip.text.slice(0, 60)}"`);
  await page.keyboard.press('Enter');
  const on = await page.evaluate(() => document.querySelector('#rrmap [data-id="conway"]').classList.contains('on'));
  if (!on) fails++; console.log(`${on ? 'ok  ' : 'FAIL'} map Enter pins the tooltip`);
  await page.click('#rrmap [data-id="carolina-forest"] path');
  tip = await page.evaluate(() => document.getElementById('rrtip').textContent);
  const cfTip = /Carolina Forest \(ZIP 29579\)/.test(tip) && /Short-term: no data/.test(tip);
  if (!cfTip) fails++; console.log(`${cfTip ? 'ok  ' : 'FAIL'} map click Carolina Forest: "${tip.slice(0, 90)}"`);
  /* ---- the three static charts render with bars ---- */
  const charts = await page.evaluate(() => [...document.querySelectorAll('main svg[role="img"]')].map(s => ({ label: s.getAttribute('aria-label').slice(0, 40), rects: s.querySelectorAll('rect').length, w: s.getBoundingClientRect().width })));
  for (const c of charts) console.log(`     chart "${c.label}" rects=${c.rects} width=${Math.round(c.w)}`);
  const chartOk = charts.filter(c => c.rects >= 6 && c.w > 200).length >= 4;
  if (!chartOk) fails++; console.log(`${chartOk ? 'ok  ' : 'FAIL'} four charts with bars and width`);
  if (DIR) {
    fs.mkdirSync(DIR, { recursive: true });
    const shots = [['#rrtool', 'returns-calc.png'], ['#rrmap', 'returns-map.png']];
    const docBox = (sel, i) => page.evaluate(([sel, i]) => { const el = document.querySelectorAll(sel)[i]; const r = el.getBoundingClientRect(); return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: Math.ceil(r.width), height: Math.ceil(r.height) }; }, [sel, i]);
    const n = await page.evaluate(() => document.querySelectorAll('main svg[role="img"]').length);
    for (let i = 0; i < n; i++) { const bb = await docBox('main svg[role="img"]', i); if (bb.width > 200 && bb.height > 20) await page.screenshot({ path: `${DIR}/returns-chart-${i}.png`, clip: bb, fullPage: true, timeout: 30000 }).catch(e => console.log('screenshot skipped: ' + e.message.split('\n')[0])); }
    for (const [sel, file] of shots) { const bb = await docBox(sel, 0); await page.screenshot({ path: `${DIR}/${file}`, clip: bb, fullPage: true, timeout: 30000 }).catch(e => console.log('screenshot skipped: ' + e.message.split('\n')[0])); }
  }
  await page.setViewportSize({ width: 320, height: 700 });
  await page.dispatchEvent('#rrPrice', 'input');
  const docW = await page.evaluate(() => document.documentElement.scrollWidth);
  if (docW > 320) { fails++; console.log('FAIL 320px: document scrolls sideways, width ' + docW); } else console.log('ok   320px: no sideways scroll');
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
  console.log(fails ? `FAILS=${fails}` : 'ALL CASES PASS');
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})();
