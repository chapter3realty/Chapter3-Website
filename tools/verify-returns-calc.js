// Verify the return calculator and the satellite map on /invest/rental-returns/
// in a real browser. Usage (server on :8123 from chapter3realty/):
//   NODE_PATH=$(npm root -g) node tools/verify-returns-calc.js [screenshot-dir]
//
// Hand computation (PLAYBOOK A29b), from the exact values the inputs carry:
//   gross      = rent x 12
//   allowance  = gross x allow%          management = gross x 10%
//   tax        = price x 0.06 x mills / 1000 + fees
//   other      = insurance + dues x 12
//   self-managed left = gross - allowance - tax - other
//   with a manager    = that, minus management
//   return = left / price
//   coverage ratio = rent / (loan payment + tax/12 + insurance/12 + dues)
//
// A  Myrtle Beach 254.6 mills, $160,000, $1,823, ins $3,050, dues 0, allow 10%
//    gross 21,876; allow 2,187.60; mgmt 2,187.60; tax 2,444.16; other 3,050
//    self 14,194.24 -> $14,194 = 8.87% -> 8.9%   mgr 12,006.64 -> $12,007 = 7.504% -> 7.5%
//    no loan payment -> coverage reads "Add a payment"   verdict: passes
// B  Pawleys Island 233.9 mills + $96, $320,314, $1,380, ins $3,050, allow 10%
//    gross 16,560; allow 1,656; mgmt 1,656; tax 4,591.29; other 3,050
//    self 7,262.71 -> $7,263 = 2.267% -> 2.3%     mgr 5,606.71 -> $5,607 = 1.750% -> 1.8%
//    verdict: below the target either way
// C  Conway 269.3 mills, $214,498, $1,900, ins $1,700, dues $50, allow 15%
//    gross 22,800; allow 3,420; mgmt 2,280; tax 3,465.86; other 2,300
//    self 13,614.14 -> $13,614 = 6.347% -> 6.3%   mgr 11,334.14 -> $11,334 = 5.284% -> 5.3%
//    verdict: self-managed only
// D  Myrtle Beach, $600,000, $900 rent: every line negative -> dealbreaker
//    gross 10,800; allow 1,080; mgmt 1,080; tax 9,165.60; other 3,050
//    self -2,495.60 -> -$2,496 = -0.416% -> -0.4%  mgr -3,575.60 -> -$3,576 = -0.596% -> -0.6%
// E  A with a $900 loan payment: tax/12 = 203.68, ins/12 = 254.1667, dues 0
//    monthly 1,357.8467;  1,823 / 1,357.8467 = 1.34257 -> 1.34   verdict: passes
// F  A with a $1,400 loan payment: monthly 1,857.8467
//    1,823 / 1,857.8467 = 0.98124 -> 0.98   below 1.25 -> dealbreaker
const { chromium } = require('playwright');
const fs = require('fs');
const DIR = process.argv[2];
const MINUS = '−';
const CASES = [
  { name: 'A', area: 'myrtle-beach', price: 160000, rent: 1823, ins: 3050, hoa: 0, allow: '10',
    capM: '7.5%', capS: '8.9%', noiM: '$12,007 a year', noiS: '$14,194 a year',
    gross: '$21,876', vac: MINUS + '$2,188', mgmt: MINUS + '$2,188', tax: MINUS + '$2,444', other: MINUS + '$3,050',
    pay: 0, dscr: 'Add a payment', verdict: 'Passes.', cls: 'pass' },
  { name: 'B', area: 'pawleys-island', price: 320314, rent: 1380, ins: 3050, hoa: 0, allow: '10',
    capM: '1.8%', capS: '2.3%', noiM: '$5,607 a year', noiS: '$7,263 a year',
    gross: '$16,560', vac: MINUS + '$1,656', mgmt: MINUS + '$1,656', tax: MINUS + '$4,591', other: MINUS + '$3,050',
    pay: 0, dscr: 'Add a payment', verdict: 'Below the 6 percent target either way', cls: 'warn' },
  { name: 'C', area: 'conway', price: 214498, rent: 1900, ins: 1700, hoa: 50, allow: '15',
    capM: '5.3%', capS: '6.3%', noiM: '$11,334 a year', noiS: '$13,614 a year',
    gross: '$22,800', vac: MINUS + '$3,420', mgmt: MINUS + '$2,280', tax: MINUS + '$3,466', other: MINUS + '$2,300',
    pay: 0, dscr: 'Add a payment', verdict: 'Passes only if you manage it yourself', cls: 'warn' },
  { name: 'D', area: 'myrtle-beach', price: 600000, rent: 900, ins: 3050, hoa: 0, allow: '10',
    capM: MINUS + '0.6%', capS: MINUS + '0.4%', noiM: MINUS + '$3,576 a year', noiS: MINUS + '$2,496 a year',
    gross: '$10,800', vac: MINUS + '$1,080', mgmt: MINUS + '$1,080', tax: MINUS + '$9,166', other: MINUS + '$3,050',
    pay: 0, dscr: 'Add a payment', verdict: 'Dealbreaker. The rent does not cover', cls: 'stop' },
  { name: 'E', area: 'myrtle-beach', price: 160000, rent: 1823, ins: 3050, hoa: 0, allow: '10',
    capM: '7.5%', capS: '8.9%', noiM: '$12,007 a year', noiS: '$14,194 a year',
    gross: '$21,876', vac: MINUS + '$2,188', mgmt: MINUS + '$2,188', tax: MINUS + '$2,444', other: MINUS + '$3,050',
    pay: 900, dscr: '1.34', verdict: 'The rent clears the monthly cost', cls: 'pass' },
  { name: 'F', area: 'myrtle-beach', price: 160000, rent: 1823, ins: 3050, hoa: 0, allow: '10',
    capM: '7.5%', capS: '8.9%', noiM: '$12,007 a year', noiS: '$14,194 a year',
    gross: '$21,876', vac: MINUS + '$2,188', mgmt: MINUS + '$2,188', tax: MINUS + '$2,444', other: MINUS + '$3,050',
    pay: 1400, dscr: '0.98', verdict: 'Dealbreaker. The rent is less than 25 percent', cls: 'stop' },
];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('http://127.0.0.1:8123/invest/rental-returns/', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.c3Ret === 'function');
  let fails = 0;
  const ok = (cond, label, got, exp) => { if (!cond) fails++; console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}: got "${got}" expected "${exp}"`); };

  /* Each box carries its own name, greyed, inside the box and on the same row
     as the control, so the name is still there once a number is typed
     (owner, 2026-09-11). A placeholder would vanish on the first keystroke. */
  const start = await page.evaluate(() => {
    const lum = (c, bg) => { const n = c.match(/[\d.]+/g).map(Number), al = n.length > 3 ? n[3] : 1;
      const p = n.slice(0, 3).map((v, i) => { v = al * v + (1 - al) * bg[i]; v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]; };
    const fields = [...document.querySelectorAll('#rrtool .rrf')].map(f => {
      const t = f.querySelector('span'), c = f.querySelector('input,select');
      const tb = t.getBoundingClientRect(), cb = c.getBoundingClientRect(), fb = f.getBoundingClientRect();
      return { id: c.id, title: t.textContent.trim(),
        sameRow: Math.abs((tb.top + tb.height / 2) - (cb.top + cb.height / 2)) < 6,
        inside: tb.left >= fb.left - 1 && tb.right <= fb.right + 1 && tb.top >= fb.top - 1 && tb.bottom <= fb.bottom + 1,
        fits: tb.width > 20 && cb.width > 28 && f.scrollWidth <= f.clientWidth + 1 && c.scrollWidth <= c.clientWidth + 1,
        colour: getComputedStyle(t).color, value: c.value };
    });
    const sp = document.querySelector('#rrtool .rrf span');
    const box = getComputedStyle(sp.closest('.rrf')).backgroundColor.match(/[\d.]+/g).slice(0, 3).map(Number);
    const l = lum(getComputedStyle(sp).color, box), bl = lum(getComputedStyle(sp.closest('.rrf')).backgroundColor, [255, 255, 255]);
    const ratio = (Math.max(l, bl) + 0.05) / (Math.min(l, bl) + 0.05);
    return { fields, ratio: Math.round(ratio * 100) / 100,
      head: document.querySelector('#rrtool .rrhead').textContent.trim(),
      pay: document.getElementById('rrPay').value,
      dscr: document.getElementById('rrDscr').textContent,
      verdict: document.getElementById('rrVerdict').textContent };
  });
  ok(start.head === 'Investment calculator', 'panel title', start.head, 'Investment calculator');
  ok(start.fields.length === 7, 'seven labelled boxes', start.fields.length, 7);
  start.fields.forEach(f => {
    ok(f.sameRow && f.inside, `box "${f.title}" carries its title inside, on one row`, `sameRow=${f.sameRow} inside=${f.inside}`, 'true/true');
    ok(f.fits, `box "${f.title}" fits its title and its value`, String(f.fits), 'true');
  });
  ok(start.ratio >= 4.5, 'greyed titles measure against white', start.ratio + ':1', '>=4.5:1');
  ok(start.pay === '', 'the loan payment starts empty', JSON.stringify(start.pay), '""');
  ok(start.dscr === 'Add a payment', 'coverage waits for a payment', start.dscr, 'Add a payment');
  ok(/^Passes\./.test(start.verdict), 'the prefilled example passes', start.verdict.slice(0, 40), 'Passes.');

  for (const c of CASES) {
    await page.selectOption('#rrArea', c.area);
    await page.fill('#rrPrice', String(c.price));
    await page.fill('#rrRent', String(c.rent));
    await page.fill('#rrIns', String(c.ins));
    await page.fill('#rrHoa', String(c.hoa));
    await page.fill('#rrPay', c.pay ? String(c.pay) : '');
    await page.selectOption('#rrAllow', c.allow);
    await page.dispatchEvent('#rrPrice', 'input');
    const g = await page.evaluate(() => {
      const t = id => document.getElementById(id).textContent;
      const vis = ['rrCapM', 'rrCapS', 'rrNoiM', 'rrNoiS', 'rrVerdict'].every(id => {
        const b = document.getElementById(id).getBoundingClientRect(); return b.width > 0 && b.height > 0;
      });
      return { capM: t('rrCapM'), capS: t('rrCapS'), noiM: t('rrNoiM'), noiS: t('rrNoiS'),
        gross: t('rrGross'), vac: t('rrVac'), mgmt: t('rrMgmt'), tax: t('rrTax'), other: t('rrOther'),
        dscr: t('rrDscr'), verdict: t('rrVerdict'), cls: document.getElementById('rrVerdict').className, vis };
    });
    for (const k of ['capM', 'capS', 'noiM', 'noiS', 'gross', 'vac', 'mgmt', 'tax', 'other', 'dscr'])
      ok(g[k] === c[k], `case ${c.name} ${k}`, g[k], c[k]);
    ok(g.verdict.includes(c.verdict), `case ${c.name} verdict`, g.verdict.slice(0, 46), c.verdict);
    ok(g.cls.includes(c.cls), `case ${c.name} verdict style`, g.cls, c.cls);
    ok(g.vis, `case ${c.name} visible`, String(g.vis), 'true');
  }

  /* ---- the satellite map ---- */
  // the base image is lazy-loaded, so bring it on screen and let it decode first
  await page.locator('#rrmapwrap').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => { const i = document.querySelector('#rrmapwrap img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 });
  const m = await page.evaluate(() => {
    const rg = [...document.querySelectorAll('#rrmapsvg .rg')];
    const img = document.querySelector('#rrmapwrap img');
    return { regions: rg.length, ids: rg.map(g => g.dataset.id),
      fills: [...new Set(rg.map(g => g.querySelector('path').getAttribute('fill')))].length,
      buttons: document.querySelectorAll('#rrtog button').length,
      pressed: document.querySelectorAll('#rrtog button[aria-pressed="true"]').length,
      labels: document.querySelectorAll('#rrmapsvg .lbl').length,
      values: [...document.querySelectorAll('#rrmapsvg .val')].map(t => t.textContent).filter(Boolean).length,
      legend: document.getElementById('rrleg').textContent.trim(),
      imgOk: img && img.complete && img.naturalWidth > 1000,
      imgW: img ? img.naturalWidth : 0, imgH: img ? img.naturalHeight : 0,
      svgBox: document.getElementById('rrmapsvg').getBoundingClientRect().width };
  });
  ok(m.regions === 8, 'map: eight areas', m.regions, 8);
  ok(m.buttons === 4, 'map: four toggles', m.buttons, 4);
  ok(m.pressed === 1, 'map: one toggle pressed', m.pressed, 1);
  ok(m.labels === 8, 'map: eight labels', m.labels, 8);
  ok(m.values === 8, 'map: eight values drawn', m.values, 8);
  ok(m.fills >= 4, 'map: colour ramp in use', m.fills, '>=4');
  ok(m.imgOk, 'map: satellite image loaded', `${m.imgW}x${m.imgH}`, 'natural width > 1000');
  ok(m.svgBox > 200, 'map: overlay sized', Math.round(m.svgBox), '>200');
  ok(/Long-term return/.test(m.legend), 'map: legend text', m.legend.slice(0, 40), 'Long-term return');

  await page.locator('#rrmapwrap').scrollIntoViewIfNeeded();
  await page.hover('#rrmapsvg [data-id="myrtle-beach"] path');
  let tip = await page.evaluate(() => { const t = document.getElementById('rrtip');
    return { shown: getComputedStyle(t).display !== 'none' && t.getBoundingClientRect().width > 0, text: t.textContent }; });
  ok(tip.shown && /Myrtle Beach/.test(tip.text) && /7\.5%/.test(tip.text) && /8\.8%/.test(tip.text),
    'map: hover shows both manager cases', tip.text.slice(0, 90), 'Myrtle Beach 7.5% / 8.8%');

  await page.mouse.move(4, 4);
  await page.click('#rrtog button[data-k="str"]');
  const cf = await page.evaluate(() => ({
    fill: document.querySelector('#rrmapsvg [data-id="carolina-forest"] path').getAttribute('fill'),
    val: document.querySelector('#rrmapsvg [data-val="carolina-forest"]').textContent,
    legend: document.getElementById('rrleg').textContent }));
  ok(cf.fill === '#8d9298' && cf.val === 'not measured' && /not measured/.test(cf.legend),
    'map: Carolina Forest reads as not measured', `${cf.fill} / ${cf.val}`, '#8d9298 / not measured');

  await page.focus('#rrmapsvg [data-id="conway"]');
  tip = await page.evaluate(() => ({ shown: getComputedStyle(document.getElementById('rrtip')).display !== 'none',
    text: document.getElementById('rrtip').textContent }));
  ok(tip.shown && /Conway/.test(tip.text), 'map: keyboard focus opens the tooltip', tip.text.slice(0, 40), 'Conway');
  await page.keyboard.press('Enter');
  const pinned = await page.evaluate(() => document.querySelector('#rrmapsvg [data-id="conway"]').classList.contains('on'));
  ok(pinned, 'map: Enter pins the tooltip', String(pinned), 'true');

  /* ---- the three charts ---- */
  const charts = await page.evaluate(() => [...document.querySelectorAll('main svg[role="img"]')]
    .map(s => ({ label: (s.getAttribute('aria-label') || '').slice(0, 44), rects: s.querySelectorAll('rect').length, w: s.getBoundingClientRect().width })));
  charts.forEach(c => console.log(`     chart "${c.label}" rects=${c.rects} width=${Math.round(c.w)}`));
  ok(charts.filter(c => c.rects >= 6 && c.w > 300).length >= 3, 'three charts drawn and sized',
    charts.filter(c => c.rects >= 6 && c.w > 300).length, '>=3');

  if (DIR) {
    fs.mkdirSync(DIR, { recursive: true });
    const svgs = await page.$$('main svg[role="img"]');
    for (let i = 0; i < svgs.length; i++) {
      const bb = await svgs[i].boundingBox();
      if (bb && bb.width > 300) { await svgs[i].scrollIntoViewIfNeeded(); await svgs[i].screenshot({ path: `${DIR}/rr-chart-${i}.png`, timeout: 25000 }).catch(e => console.log('screenshot skipped: ' + e.message.split('\n')[0])); }
    }
    for (const [sel, file] of [['#rrtool', 'rr-calc.png'], ['#rrmapwrap', 'rr-map.png']]) {
      const el = await page.$(sel); await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: `${DIR}/${file}`, timeout: 25000 }).catch(e => console.log('screenshot skipped: ' + e.message.split('\n')[0]));
    }
  }

  await page.setViewportSize({ width: 320, height: 700 });
  await page.dispatchEvent('#rrPrice', 'input');
  const docW = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(docW <= 320, '320px: no sideways scroll', docW, '<=320');

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
  console.log(fails || errors.length ? `FAILS=${fails}` : 'ALL CHECKS PASS');
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})();
