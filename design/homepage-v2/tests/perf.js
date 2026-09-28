// Throttled load metrics for one URL: LCP, CLS, long tasks, bytes, requests.
// node perf.js <url> [mobile|desktop]
const { chromium } = require('playwright');
(async () => {
  const [url, mode = 'mobile'] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext(mode === 'mobile'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  // "Slow 4G"-ish: 9 Mbps down, 1.5 up, 60ms RTT; CPU 4x on mobile
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
  if (mode === 'mobile') await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let bytes = 0, reqs = 0; const byType = {};
  cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; });
  cdp.on('Network.responseReceived', e => { reqs++; const t = e.type; byType[t] = (byType[t] || 0) + 1; });
  await page.addInitScript(() => {
    window.__m = { lcp: 0, lcpEl: '', cls: 0, lt: 0, ltN: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.lcp = e.startTime; window.__m.lcpEl = (e.element && (e.element.tagName + (e.element.id ? '#' + e.element.id : '') + (e.element.className ? '.' + String(e.element.className).split(' ')[0] : ''))) || e.url; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.lt += e.duration - 50; window.__m.ltN++; } }).observe({ type: 'longtask', buffered: true });
    try { localStorage.c3PopDone = 1; } catch (e) {}
  });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(6000);
  const m = await page.evaluate(() => window.__m);
  const fcp = await page.evaluate(() => (performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || 0);
  console.log(JSON.stringify({ url, mode, loadMs, fcp: Math.round(fcp), lcp: Math.round(m.lcp), lcpEl: m.lcpEl, cls: +m.cls.toFixed(4), tbt: Math.round(m.lt), longTasks: m.ltN, kb: Math.round(bytes / 1024), reqs, byType }));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
