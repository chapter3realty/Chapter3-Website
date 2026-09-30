// DOM checks for the homepage at many widths. Measures the rendered page, not the HTML.
// node check.js <url> [--reduced] [--widths 320,390,1440] [--dump]
const { chromium } = require('playwright');
const fs = require('fs');
const args = process.argv.slice(2);
const url = args[0];
const reduced = args.includes('--reduced');
const wArg = args.indexOf('--widths');
const WIDTHS = wArg > -1 ? args[wArg + 1].split(',').map(Number) : [320, 360, 390, 430, 768, 900, 1024, 1280, 1440, 1920];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const report = [];
  for (const w of WIDTHS) {
    const mobile = w <= 430;
    const ctx = await browser.newContext({
      viewport: { width: w, height: mobile ? 800 : 900 }, isMobile: mobile, hasTouch: mobile,
      deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID/.test(m.text())) errors.push('console: ' + m.text()); });
    page.on('requestfailed', r => { const u = r.url(); if (!/googletagmanager|google-analytics|fonts\.g/.test(u)) errors.push('reqfail: ' + u + ' ' + (r.failure() || {}).errorText); });
    await page.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(400);
    // scroll the whole page in steps so every observer and scroll timeline fires
    await page.evaluate(async () => {
      const H = () => document.documentElement.scrollHeight;
      for (let y = 0; y < H(); y += Math.round(innerHeight * 0.4)) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
      scrollTo(0, H()); await new Promise(r => setTimeout(r, 400));
    });
    await page.waitForTimeout(1500);
    // the hero map may still be landing (its pins show 3.7s to 4.8s after the flight starts, which waits up to 2.5s for
    // its maps): wait for that, up to 12s, so a label caught mid-fade is not counted, while one that never shows still is
    await page.waitForFunction(() => [...document.querySelectorAll('.tw-pin')].every((e) => getComputedStyle(e).opacity === '1'), null, { timeout: 12000 }).catch(() => {});
    const r = await page.evaluate(() => {
      const out = {};
      const de = document.documentElement;
      out.scrollW = Math.max(de.scrollWidth, document.body.scrollWidth); out.innerW = innerWidth;
      out.sideways = out.scrollW > innerWidth + 1;
      // who pokes out past the right edge
      out.wide = [];
      if (out.sideways) for (const el of document.querySelectorAll('body *')) {
        const b = el.getBoundingClientRect(); if (b.width && b.right > innerWidth + 1) {
          const cs = getComputedStyle(el); if (cs.position === 'fixed') continue;
          out.wide.push((el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]) + ' r=' + Math.round(b.right));
          if (out.wide.length > 8) break;
        }
      }
      out.h1 = document.querySelectorAll('h1').length;
      out.h2 = [...document.querySelectorAll('main h2')].map(h => h.textContent.trim().slice(0, 40));
      const pop = document.getElementById('c3-pop'); out.popHidden = !pop || pop.hidden || getComputedStyle(pop).display === 'none';
      const idx = document.getElementById('idxModal'); out.idxHidden = !idx || getComputedStyle(idx).display === 'none' || getComputedStyle(idx).visibility === 'hidden' || getComputedStyle(idx).opacity === '0';
      // text that is present but not visible after a full scroll
      const inv = [];
      const main = document.querySelector('main');
      for (const el of main.querySelectorAll('*')) {
        const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
        if (!own) continue;
        if (el.closest('[hidden],[aria-hidden="true"],.sr-only,.visually-hidden')) continue;
        let op = 1, hid = false;
        for (let a = el; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a); op *= parseFloat(cs.opacity);
          if (cs.visibility === 'hidden' || cs.display === 'none') hid = true;
        }
        const b = el.getBoundingClientRect();
        if (hid) continue; // display none (e.g. carousel off-slide handled by overflow) is fine
        if (op < 0.95 || b.width < 1 || b.height < 1) inv.push({ t: el.textContent.trim().slice(0, 50), op: +op.toFixed(2), w: Math.round(b.width), h: Math.round(b.height) });
      }
      out.invisible = inv;
      // contrast with alpha compositing over every translucent layer
      const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
      const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
      const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const low = [], complex = [];
      let n = 0;
      for (const el of document.querySelectorAll('main *, footer *')) {
        const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
        if (!own) continue;
        const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const b = el.getBoundingClientRect(); if (b.width < 1 || b.height < 1) continue;
        if (el.closest('#c3-pop,#idxModal')) continue;
        let fg = parse(cs.color); if (!fg) continue;
        const layers = []; let isComplex = false;
        for (let a = el; a; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (s.backgroundImage && s.backgroundImage !== 'none' && !/^linear-gradient\(rgba\(244, 239, 232, 0\.0[0-9]+\)/.test(s.backgroundImage)) isComplex = true;
          if (a.dataset && a.dataset.overMedia !== undefined) isComplex = true;
          const bg = parse(s.backgroundColor); if (bg && bg[3] > 0) { layers.push(bg); if (bg[3] >= 1) break; }
        }
        let base = [255, 255, 255, 1];
        for (let i = layers.length - 1; i >= 0; i--) base = layers[i][3] >= 1 ? layers[i] : over(layers[i], base);
        const fgc = fg[3] < 1 ? over(fg, base) : fg;
        const ratio = cr(fgc, base); n++;
        const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
        const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
        const rec = { t: el.textContent.trim().slice(0, 40), ratio: +ratio.toFixed(2), need, fs: size };
        if (isComplex) complex.push(rec); else if (ratio < need) low.push(rec);
      }
      out.contrastChecked = n; out.lowContrast = low; out.overMediaOrGradient = complex.length;
      out.docH = document.documentElement.scrollHeight;
      return out;
    });
    r.w = w; r.errors = errors;
    report.push(r);
    await ctx.close();
  }
  await browser.close();
  const dump = args.includes('--dump');
  for (const r of report) {
    const bad = r.sideways || r.h1 !== 1 || !r.popHidden || !r.idxHidden || r.invisible.length || r.lowContrast.length || r.errors.length;
    console.log(`${bad ? 'FAIL' : 'ok  '} w=${r.w} docH=${r.docH} sideways=${r.sideways}${r.sideways ? ' ' + r.wide.join(' | ') : ''} h1=${r.h1} pop=${r.popHidden} idx=${r.idxHidden} invisible=${r.invisible.length} low=${r.lowContrast.length}/${r.contrastChecked} complex=${r.overMediaOrGradient} errors=${r.errors.length}`);
    if (dump || bad) {
      if (r.invisible.length) console.log('   invisible:', JSON.stringify(r.invisible.slice(0, 12)));
      if (r.lowContrast.length) console.log('   low:', JSON.stringify(r.lowContrast.slice(0, 12)));
      if (r.errors.length) console.log('   errors:', r.errors.slice(0, 8).join('\n           '));
    }
  }
  if (report[0]) console.log('h2s:', JSON.stringify(report[report.length - 1].h2));
})().catch(e => { console.error(e); process.exit(1); });
