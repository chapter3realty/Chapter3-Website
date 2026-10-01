// main-thread cost of the hero map while it flies in, versus at rest after it, versus scrolled away.
// node twperf.js <url> <w> <h> [cpu slowdown]. FLY=ms sets the first window (the flight starts as the page opens)
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
  await p.waitForFunction(() => document.querySelector('#home .tw-stage').classList.contains('in'), null, { timeout: 10000 });
  const M = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  const win = async (label, ms) => {
    const a = await M(); const f0 = await p.evaluate(() => new Promise((r) => { let n = 0; const t = performance.now(); (function k() { n++; if (performance.now() - t < 1000) requestAnimationFrame(k); else r(n); })(); }));
    await p.waitForTimeout(ms - 1000); const c = await M();
    const d = (k) => ((c[k] - a[k]) * 1000 / (ms / 1000)).toFixed(1);
    console.log(`${label.padEnd(26)} per second: style ${d('RecalcStyleDuration')}ms layout ${d('LayoutDuration')}ms script ${d('ScriptDuration')}ms task ${d('TaskDuration')}ms  styleCount ${((c.RecalcStyleCount - a.RecalcStyleCount) / (ms / 1000)).toFixed(0)}  fps~${f0}`);
  };
  await win('map: fly-in', +(process.env.FLY || 5000));
  await win('map: at rest after the flight', 5000);
  await p.evaluate(() => window.scrollTo({ top: document.querySelector('#faq').getBoundingClientRect().top + scrollY + 400, behavior: 'instant' }));
  await win('scrolled past the map', 4000);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
