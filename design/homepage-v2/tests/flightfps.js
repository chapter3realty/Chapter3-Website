// Frame intervals across the hero flight on the main thread, and long animation frames: node flightfps.js <url> <w> <h> [cpu slowdown] [dpr]
// The flight starts as the page opens, so recording starts in the page itself, at the moment the stage gets .in.
const { chromium } = require('playwright');
(async () => {
  const [url, w, h, slow = '1', dpr = '1'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: +w <= 430, hasTouch: +w <= 430, deviceScaleFactor: +dpr });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    try { localStorage.c3PopDone = 1; } catch (e) {}
    window.__lo = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lo.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'long-animation-frame', buffered: true }); } catch (e) {}
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.querySelector('#home .tw-stage'); if (!st) return;
      const go = () => { const ts = [], t0 = performance.now(); window.__t0 = t0; (function f(t) { ts.push(t); if (t - t0 < 5200) requestAnimationFrame(f); else window.__ts = ts; })(t0); };
      if (st.classList.contains('in')) go(); else new MutationObserver((m, o) => { if (st.classList.contains('in')) { o.disconnect(); go(); } }).observe(st, { attributes: true, attributeFilter: ['class'] });
    });
  });
  const cdp = await ctx.newCDPSession(p);
  if (+slow > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: +slow });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__ts, null, { timeout: 30000 });
  const r = await p.evaluate(() => {
    const ts = window.__ts, d = ts.slice(1).map((t, i) => t - ts[i]).sort((a, b) => a - b), q = (x) => Math.round(d[Math.floor(d.length * x)]);
    const loaf = window.__lo.filter(([t]) => t >= window.__t0 - 50 && t < window.__t0 + 5200).map(([, dd]) => dd);
    return { zoom: document.querySelector('#home .tw-stage').classList.contains('z'), frames: d.length, fps: Math.round(d.length / 5.2), p50: q(0.5), p95: q(0.95), max: Math.round(d[d.length - 1]), over50: d.filter((x) => x > 50).length, loaf: loaf.slice(0, 12) };
  });
  console.log(url, w + 'x' + h, 'cpu x' + slow, 'dpr ' + dpr, JSON.stringify(r));
  await b.close();
})();
