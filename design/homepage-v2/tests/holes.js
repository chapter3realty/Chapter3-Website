// node holes.js <url> <w> <h> [css]  -> for scroll 0..600 step 30, count transparent pixels in viewport capture and their bbox
const { chromium } = require('playwright');
(async () => {
  const [url, w, h, css] = process.argv.slice(2);
  const mobile = +w <= 430;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' });
  if (css) await p.addStyleTag({ content: css });
  await p.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(p);
  const q = await b.newPage();
  for (let y = 0; y <= 600; y += 30) {
    await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
    await p.waitForTimeout(400);
    const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const res = await q.evaluate(async d => {
      const im = new Image(); im.src = 'data:image/png;base64,' + d; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const a = x.getImageData(0, 0, c.width, c.height).data; let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let i = 3; i < a.length; i += 4) if (a[i] < 250) { n++; const px = ((i - 3) / 4) % c.width, py = Math.floor((i - 3) / 4 / c.width); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); }
      return n ? `${n}px in [${x0},${y0}]-[${x1},${y1}]` : '0';
    }, r.data);
    console.log(`scroll ${y}: ${res}`);
  }
  await b.close();
})();
