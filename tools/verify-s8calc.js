// Verify the Section 8 calculator on /invest/section-8-rentals/ in a real browser
// against three hand-computed cases. Usage (server on :8123 from chapter3realty/):
//   NODE_PATH=$(npm root -g) node tools/verify-s8calc.js [screenshot.png]
// Hand computation: standard = FMR[bedrooms] * percent; tenant share = 30% of income;
// authority = min(standard, rent) - tenant share (floor 0); tenant = rent - authority.
const { chromium } = require('playwright');
const PNG = process.argv[2];
const CASES = [
  { name: 'A', rent: 1800, inc: 2400, br: '3', pct: '100', ps: '$1,823', hap: '$1,080', ten: '$720', share: '30 percent of income', noteHas: '', noteNot: '40 percent' },
  { name: 'B', rent: 2100, inc: 2400, br: '3', pct: '100', ps: '$1,823', hap: '$1,103', ten: '$997', share: '42 percent of income', noteHas: '40 percent cap', noteNot: '' },
  { name: 'C', rent: 1500, inc: 1000, br: '2', pct: '110', ps: '$1,654', hap: '$1,200', ten: '$300', share: '30 percent of income', noteHas: '', noteNot: 'above the standard' },
];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('http://127.0.0.1:8123/invest/section-8-rentals/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.c3S8 === 'function');
  let fails = 0;
  const set = async c => { await page.fill('#s8rent', String(c.rent)); await page.fill('#s8inc', String(c.inc)); await page.selectOption('#s8br', c.br); await page.selectOption('#s8pct', c.pct); await page.dispatchEvent('#s8rent', 'input'); };
  for (const c of CASES) {
    await set(c);
    const got = await page.evaluate(() => ({
      ps: document.getElementById('s8ps').textContent, hap: document.getElementById('s8hap').textContent,
      ten: document.getElementById('s8ten').textContent, share: document.getElementById('s8share').textContent,
      note: document.getElementById('s8note').textContent,
      c1: document.querySelectorAll('#s8chart1 rect').length, c2: document.querySelectorAll('#s8chart2 rect').length,
      brass: [...document.querySelectorAll('#s8chart2 rect')].filter(r => r.getAttribute('fill') === '#c4783a').length,
      vis: ['s8ps','s8hap','s8ten','s8chart1','s8chart2'].every(id => { const b = document.getElementById(id).getBoundingClientRect(); return b.width > 0 && b.height > 0; }),
    }));
    const checks = [['standard', got.ps === c.ps, got.ps, c.ps], ['authority', got.hap === c.hap, got.hap, c.hap], ['tenant', got.ten === c.ten, got.ten, c.ten], ['share', got.share === c.share, got.share, c.share], ['note has', !c.noteHas || got.note.includes(c.noteHas), got.note, c.noteHas], ['note not', !c.noteNot || !got.note.includes(c.noteNot), got.note, 'not ' + c.noteNot], ['visible', got.vis, String(got.vis), 'true']];
    for (const [k, ok, g, e] of checks) { if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} case ${c.name} ${k}: got "${g}" expected "${e}"`); }
    console.log(`     case ${c.name} chart1 rects=${got.c1} chart2 bars=${got.c2} brass=${got.brass}`);
  }
  await set(CASES[0]);
  if (PNG) {
    await page.locator('#s8chart2').scrollIntoViewIfNeeded();
    const bb = await page.evaluate(() => { const a = document.getElementById('s8rent').closest('div[style*="background"]'), b = document.getElementById('s8chart2'); const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect(); return { x: Math.min(r1.left, r2.left), y: r1.top + window.scrollY, w: Math.max(r1.right, r2.right) - Math.min(r1.left, r2.left), h: r2.bottom - r1.top }; });
    await page.screenshot({ path: PNG, clip: { x: bb.x, y: bb.y, width: Math.ceil(bb.w), height: Math.ceil(bb.h) }, fullPage: true, timeout: 20000 }).catch(e => console.log('screenshot skipped: ' + e.message.split('\n')[0]));
  }
  await page.setViewportSize({ width: 320, height: 700 });
  await page.dispatchEvent('#s8rent', 'input');
  const docW = await page.evaluate(() => document.documentElement.scrollWidth);
  if (docW > 320) { fails++; console.log('FAIL 320px: document scrolls sideways, width ' + docW); } else console.log('ok   320px: no sideways scroll');
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
  console.log(fails ? `FAILS=${fails}` : 'ALL CASES PASS');
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})();
