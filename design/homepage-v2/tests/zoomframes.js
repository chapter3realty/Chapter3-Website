// The towns flight frozen at exact moments: node zoomframes.js <url> <WxH> <out-prefix> [dpr] [times in ms, comma list]
// Writes <out-prefix>-<ms>.png of the map stage for each moment, to look at every hand-off between the zoom levels.
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
  // arrive the way a visitor does: first within reach (the zoom maps load, the first frame is set), then in view
  await p.evaluate(() => { const r = document.querySelector('.tw-stage').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - innerHeight * 1.4, behavior: 'instant' }); });
  await p.waitForTimeout(400);
  await p.waitForFunction(() => [...document.querySelectorAll('.tw-lod img, .tw-plane img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 30000 }).catch(() => {});
  await p.evaluate(() => { const r = document.querySelector('#towns').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - (innerWidth > 1099 ? 89 : -40), behavior: 'instant' }); });
  await p.waitForFunction(() => document.querySelector('.tw-stage').classList.contains('in'), null, { timeout: 10000 });
  await p.waitForTimeout(60);
  const info = await p.evaluate(() => ({ cls: document.querySelector('.tw-stage').className, anims: document.getAnimations().length }));
  for (const t of times) {
    await p.evaluate((t) => { for (const a of document.getAnimations()) { if (!a.effect || !a.effect.target || !a.effect.target.closest || !a.effect.target.closest('#towns')) continue; a.pause(); try { a.currentTime = Math.min(t, (a.effect.getComputedTiming().endTime || t)); } catch (e) {} } }, t);
    await p.waitForTimeout(120);
    await p.locator('.tw-stage').screenshot({ path: `${pre}-${String(t).padStart(4, '0')}.png`, timeout: 20000 });
  }
  console.log(size, JSON.stringify(info), errs.length ? 'ERR ' + errs.join(' | ') : 'no errors');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
