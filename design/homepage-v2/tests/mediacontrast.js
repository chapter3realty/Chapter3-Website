// Worst-case contrast of text drawn over video, images or gradients, measured from pixels.
// For each text element: hide the glyphs, capture the element's box, take the 98th-percentile
// worst background pixel against the text colour. Repeats at several video times.
// node mediacontrast.js <url> <width> [selector=[data-over-media] *] [times=0,2,4,6,8,10,12,14,16]
const { chromium } = require('playwright');
(async () => {
  const [url, width = '1440', sel = '[data-over-media]', timesArg = '0,2,4,6,8,10,12,14,15.9'] = process.argv.slice(2);
  const w = +width, mobile = w <= 430;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 800 : 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(page);
  const times = timesArg.split(',').map(Number);
  const worst = {};
  for (const t of times) {
    const vstate = await page.evaluate(async (t) => {
      const v = document.querySelector('video[data-hero]') || document.querySelector('#home video');
      if (!v || !v.currentSrc) return 'no-video';
      v.pause(); v.currentTime = t; await new Promise(r => { v.onseeked = r; setTimeout(r, 1500); });
      return 'video@' + v.currentTime.toFixed(1);
    }, t);
    // pause CSS animations so the frame is stable
    const boxes = await page.evaluate((sel) => {
      const els = [...document.querySelectorAll(sel)].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1));
      return els.map((el, i) => { el.setAttribute('data-mc', i); const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        return { i, t: el.textContent.trim().slice(0, 40), x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height, color: cs.color, fs: parseFloat(cs.fontSize), fw: parseInt(cs.fontWeight) }; });
    }, sel);
    for (const b of boxes) {
      if (b.w < 2 || b.h < 2) continue;
      await page.evaluate((i) => { const el = document.querySelector(`[data-mc="${i}"]`); el.dataset.mcColor = el.style.color; el.style.setProperty('color', 'transparent', 'important'); el.style.setProperty('text-shadow', 'none', 'important'); el.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); }, b.i);
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 }, captureBeyondViewport: true });
      await page.evaluate((i) => { const el = document.querySelector(`[data-mc="${i}"]`); el.style.removeProperty('color'); el.style.removeProperty('text-shadow'); el.style.removeProperty('-webkit-text-fill-color'); }, b.i);
      const res = await page.evaluate(async ({ data, color }) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const px = g.getImageData(0, 0, c.width, c.height).data;
        const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        const L = (r, gg, b) => 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b);
        const m = color.match(/[\d.]+/g).map(Number); const fa = m.length > 3 ? m[3] : 1;
        const ratios = [];
        for (let k = 0; k < px.length; k += 16) { // every 4th pixel
          const br = px[k], bg = px[k + 1], bb = px[k + 2];
          const fr = m[0] * fa + br * (1 - fa), fg = m[1] * fa + bg * (1 - fa), fb = m[2] * fa + bb * (1 - fa);
          const a = L(fr, fg, fb), b2 = L(br, bg, bb); ratios.push((Math.max(a, b2) + .05) / (Math.min(a, b2) + .05));
        }
        ratios.sort((a, b) => a - b);
        return { p2: ratios[Math.floor(ratios.length * 0.02)], min: ratios[0] };
      }, { data: shot.data, color: b.color });
      const need = (b.fs >= 24 || (b.fs >= 18.66 && b.fw >= 700)) ? 3 : 4.5;
      const k = b.t;
      if (!worst[k] || res.p2 < worst[k].p2) worst[k] = { p2: +res.p2.toFixed(2), min: +res.min.toFixed(2), need, at: vstate };
    }
  }
  let fails = 0;
  for (const [t, r] of Object.entries(worst)) { const bad = r.p2 < r.need; if (bad) fails++; console.log(`${bad ? 'FAIL' : 'ok  '} ${r.p2}:1 (min ${r.min}, need ${r.need}) ${r.at}  "${t}"`); }
  console.log(`w=${w} checked ${Object.keys(worst).length} text elements over media, ${fails} under the bar`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
