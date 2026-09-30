// Frame intervals across the towns flight on the main thread, and long animation frames: node flightfps.js <url> <w> <h> [cpu slowdown] [dpr]
const { chromium } = require('playwright');
(async () => {
  const [url, w, h, slow = '1', dpr = '1'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: +w <= 430, hasTouch: +w <= 430, deviceScaleFactor: +dpr });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
  const cdp = await ctx.newCDPSession(p);
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  if (+slow > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: +slow });
  // within reach first, so the maps load; then into view
  await p.evaluate(() => { const r = document.querySelector('.tw-stage').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - innerHeight * 1.4, behavior: 'instant' }); });
  await p.waitForFunction(() => [...document.querySelectorAll('.tw-lod img, .tw-plane img')].every((i) => !i.getAttribute('srcset') && !i.getAttribute('src') ? true : i.complete && i.naturalWidth > 0), null, { timeout: 30000 }).catch(() => {});
  const r = await p.evaluate(async () => {
    const lo = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) lo.push(Math.round(e.duration)); }).observe({ type: 'long-animation-frame' }); } catch (e) {}
    const el = document.querySelector('.tw-stage'), rr = el.getBoundingClientRect();
    scrollTo({ top: rr.top + scrollY - Math.max(0, (innerHeight - rr.height) / 2), behavior: 'instant' });
    const ts = []; const t0 = performance.now();
    await new Promise((res) => { (function f(t) { ts.push(t); if (t - t0 < 5200) requestAnimationFrame(f); else res(); })(t0); });
    const d = ts.slice(1).map((t, i) => t - ts[i]).sort((a, b) => a - b);
    const q = (x) => Math.round(d[Math.floor(d.length * x)]);
    return { frames: d.length, fps: Math.round(d.length / 5.2), p50: q(0.5), p95: q(0.95), max: Math.round(d[d.length - 1]), over50: d.filter((x) => x > 50).length, loaf: lo.slice(0, 12) };
  });
  console.log(url, w + 'x' + h, 'cpu x' + slow, 'dpr ' + dpr, JSON.stringify(r));
  await b.close();
})();
