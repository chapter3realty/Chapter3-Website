// The hero flight frozen at exact moments: node zoomframes.js <url> <WxH> <out-prefix> [dpr] [times in ms, comma list]
// Writes <out-prefix>-<ms>.png of the first screen for each moment, to look at every hand-off between the zoom levels.
const { chromium } = require('playwright');
(async () => {
  const [url, size, pre, dpr = '1', ts] = process.argv.slice(2);
  const [w, h] = size.split('x').map(Number);
  const times = (ts || '0,400,800,1200,1600,2000,2400,2800,3200,3600,4000,4600').split(',').map(Number);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: +dpr, isMobile: w <= 430, hasTouch: w <= 430 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' });
  // the flight starts on its own as the page opens, once its maps have arrived
  await p.waitForFunction(() => document.querySelector('#home .tw-stage').classList.contains('in'), null, { timeout: 10000 });
  await p.waitForTimeout(60);
  const info = await p.evaluate(() => ({ cls: document.querySelector('#home .tw-stage').className, anims: document.getAnimations().length }));
  for (const t of times) {
    await p.evaluate((t) => { for (const a of document.getAnimations()) { if (!a.effect || !a.effect.target || !a.effect.target.closest || !a.effect.target.closest('#home .tw-stage')) continue; a.pause(); try { a.currentTime = Math.min(t, (a.effect.getComputedTiming().endTime || t)); } catch (e) {} } }, t);
    await p.waitForTimeout(120);
    await p.screenshot({ path: `${pre}-${String(t).padStart(4, '0')}.png`, timeout: 20000 });
  }
  console.log(size, JSON.stringify(info), errs.length ? 'ERR ' + errs.join(' | ') : 'no errors');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
