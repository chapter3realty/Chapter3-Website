// Viewport screenshots at scroll positions: node shot.js <url> <w> <h> <outprefix> [y1,y2,...|sel1,sel2] [--wait ms] [--reduced]
const { chromium } = require('playwright');
(async () => {
  const a = process.argv.slice(2);
  const [url, w, h, out, ys = '0'] = a;
  const wait = a.includes('--wait') ? +a[a.indexOf('--wait') + 1] : 2500;
  const mobile = +w <= 430;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, reducedMotion: a.includes('--reduced') ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(wait);
  const cdp = await ctx.newCDPSession(p);
  let n = 0;
  for (const y of ys.split(',')) {
    if (/^[\d.]+$/.test(y)) await p.evaluate(y => window.scrollTo({ top: +y, behavior: 'instant' }), y);
    else await p.evaluate(s => { const el = document.querySelector(s); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }); }, y);
    await p.waitForTimeout(1800);
    const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const f = `${out}-${n++}.png`;
    require('fs').writeFileSync(f, Buffer.from(r.data, 'base64'));
    console.log(f);
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
