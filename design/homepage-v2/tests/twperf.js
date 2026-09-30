// main-thread cost of the map while it turns, versus paused, versus scrolled away. node twperf.js <url> <w> <h> [cpu slowdown]
const { chromium } = require('playwright');
(async () => {
  const [url, w, h, slow] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: +w <= 430, hasTouch: +w <= 430 });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Performance.enable');
  if (slow) await cdp.send('Emulation.setCPUThrottlingRate', { rate: +slow });
  await p.goto(url, { waitUntil: 'load' });
  const M = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  const win = async (label, ms) => {
    const a = await M(); const f0 = await p.evaluate(() => new Promise((r) => { let n = 0; const t = performance.now(); (function k() { n++; if (performance.now() - t < 1000) requestAnimationFrame(k); else r(n); })(); }));
    await p.waitForTimeout(ms - 1000); const c = await M();
    const d = (k) => ((c[k] - a[k]) * 1000 / (ms / 1000)).toFixed(1);
    console.log(`${label.padEnd(26)} per second: style ${d('RecalcStyleDuration')}ms layout ${d('LayoutDuration')}ms script ${d('ScriptDuration')}ms task ${d('TaskDuration')}ms  styleCount ${((c.RecalcStyleCount - a.RecalcStyleCount) / (ms / 1000)).toFixed(0)}  fps~${f0}`);
  };
  await p.evaluate(() => { const i = document.querySelector('.tw-plane img'); i.loading = 'eager'; });
  await p.waitForFunction(() => { const i = document.querySelector('.tw-plane img'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 });
  await p.waitForTimeout(1500);
  await win('top of page (hero film)', 4000);
  await p.evaluate(() => { const el = document.querySelector('#towns .tw-stage'); const r = el.getBoundingClientRect(); window.scrollTo({ top: r.top + scrollY - Math.max(0, (innerHeight - r.height) / 2), behavior: 'instant' }); });
  await win('map: fly-in', +(process.env.FLY || 5000));
  await win('map: turning', 5000);
  await p.click('.tw-rot');
  await win('map: paused by its button', 4000);
  await p.click('.tw-rot');
  await p.evaluate(() => window.scrollTo({ top: document.querySelector('#faq').getBoundingClientRect().top + scrollY + 400, behavior: 'instant' }));
  await win('scrolled past the map', 4000);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
