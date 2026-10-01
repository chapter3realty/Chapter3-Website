// Worst-case contrast of the town cards' text, measured from pixels: the card is translucent over the map, so what is
// behind each line depends on the town. For each town's card: hide the glyphs, capture each text element's box, take the
// 2nd-percentile worst background pixel against the text colour. node cardcontrast.js <url> [WxH ...]. Exits 1 under 4.5:1.
const { chromium } = require('playwright');
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
(async () => {
  const [url = 'http://localhost:8124/', ...sizes] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let worst = { r: 99 };
  for (const s of sizes.length ? sizes : ['1440x900', '390x844']) {
    const [w, h] = s.split('x').map(Number), touch = w <= 430;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    await page.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('#home .tw-stage').classList.contains('turnable'), null, { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    for (const slug of await page.$$eval('.tw-pin', (ls) => ls.map((l) => l.dataset.town))) {
      // the card opened by keyboard focus (which also stops the turn), held still while it is measured
      await page.$eval(`.tw-pin[data-town=${slug}] a`, (a) => { const r = a.getBoundingClientRect(); scrollTo({ top: Math.max(0, scrollY + r.top - innerHeight / 2), behavior: 'instant' }); });
      await page.waitForTimeout(100);
      await page.$eval(`.tw-pin[data-town=${slug}] a`, (a) => a.focus());
      await page.waitForTimeout(700);
      const items = await page.evaluate(() => {
        const c = document.querySelector('.tw-card'), out = [];
        for (const el of c.querySelectorAll('p, a, span, b, text')) {
          if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el), col = (cs.fill && el.tagName === 'text' ? cs.fill : cs.color).match(/[\d.]+/g).map(Number);
          if (r.top < 0 || r.bottom > innerHeight) continue;   // off screen: the capture is of the viewport
          out.push({ t: el.textContent.trim().slice(0, 28), x: r.left, y: r.top, w: r.width, h: r.height, col });
        }
        c.querySelectorAll('*').forEach((e) => { e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('fill', e.tagName === 'text' ? 'transparent' : '', e.tagName === 'text' ? 'important' : ''); });
        return out;
      });
      await page.waitForTimeout(80);
      for (const it of items) {
        if (it.w < 1 || it.h < 1) continue;
        // a capture of the viewport only: a full-page capture resizes it, which moves the map under the card
        const png = await page.screenshot({ clip: { x: it.x, y: it.y, width: Math.max(1, it.w), height: Math.max(1, it.h) } });
        const px = await page.evaluate(async (b64) => {
          const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
          const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
          const d = g.getImageData(0, 0, im.width, im.height).data, out = [];
          for (let i = 0; i < d.length; i += 4) out.push([d[i], d[i + 1], d[i + 2]]);
          return out;
        }, png.toString('base64'));
        // the text colour over the background it is drawn on: a translucent text colour blends with each pixel
        const a = it.col.length > 3 ? it.col[3] : 1, rs = px.map((p) => ratio(it.col.slice(0, 3).map((c, k) => c * a + p[k] * (1 - a)), p)).sort((x, y) => x - y);
        const r = rs[Math.floor(rs.length * 0.02)];
        if (r < worst.r) worst = { r, s, slug, t: it.t };
        if (r < 4.5) console.log(`LOW  ${s} ${slug} "${it.t}" ${r.toFixed(2)}:1`);
      }
      await page.evaluate(() => { document.querySelectorAll('.tw-card *').forEach((e) => { e.style.removeProperty('color'); e.style.removeProperty('fill'); }); document.activeElement.blur(); });
      await page.waitForTimeout(350);
    }
    await ctx.close();
  }
  await b.close();
  console.log(`worst ${worst.r.toFixed(2)}:1 (${worst.s} ${worst.slug} "${worst.t}")`);
  process.exitCode = worst.r < 4.5 ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });
