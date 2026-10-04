// Contrast of every visible text element on every page, measured in the browser.
// Usage (a server on the port serving chapter3realty/):
//   NODE_PATH=$(npm root -g) node tools/contrast-scan.js [base url] [--widths 1280,375] [--pages /a/,/b/] [--json out.json]
// What is measured: each element with its own visible text, at the centre of its first line of text. The
// background is what the browser stacks at that point (elementsFromPoint), composited bottom to top with
// each layer's alpha and opacity, so text over a sibling's background or an absolutely placed panel is
// measured against what is really behind it. The text colour is composited over that background with its
// own alpha and opacity. Large text (24px, or 18.66px bold) needs 3:1, everything else 4.5:1 (WCAG AA).
// A layer with a background image or gradient is reported as "image" and not scored: a pixel check is
// the only honest measure there (design/homepage-v2/tests/mediacontrast.js does that for the hero).
// Reveals: the page is scrolled to the bottom and back, then transitions and animations are cut to zero
// length, so faded-in text is measured at its resting colour, not mid-fade.
// Exit 1 if any text fails.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const BASE = (args.find((a) => /^https?:/.test(a)) || 'http://127.0.0.1:8123/').replace(/\/?$/, '/');
const WIDTHS = opt('--widths', '1280,375').split(',').map(Number);
const ROOT = path.join(__dirname, '..', 'chapter3realty');
const allPages = () => {
  const out = [];
  (function walk(d, rel) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) { if (!['assets', 'media', 'team', 'map'].includes(f) || rel) walk(p, rel + f + '/'); }
      else if (f === 'index.html') out.push('/' + rel);
    }
  })(ROOT, '');
  return out.sort();
};
const PAGES = opt('--pages', '') ? opt('--pages').split(',') : allPages();

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const report = [];
  let fails = 0;
  for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, hasTouch: w < 500, isMobile: w < 500 });
    await ctx.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    await ctx.route(/googletagmanager|google-analytics|maps\.googleapis|cloudflareinsights|app\.chapter3realty\.com/, (r) => r.abort());
    const p = await ctx.newPage();
    for (const u of PAGES) {
      try { await p.goto(BASE + u.replace(/^\//, ''), { waitUntil: 'load', timeout: 30000 }); } catch (e) { report.push({ w, u, error: String(e).slice(0, 80) }); continue; }
      await p.evaluate(async () => {
        const H = document.documentElement.scrollHeight;
        for (let y = 0; y < H; y += 400) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 30)); }
        window.scrollTo({ top: 0, behavior: 'instant' });
        const s = document.createElement('style');
        s.textContent = '*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;scroll-behavior:auto!important}';
        document.head.appendChild(s);
        // the welcome popup and the particle canvas are not page text
        for (const sel of ['#c3-pop', '.c3-pop', '#heroCanvas', 'canvas']) document.querySelectorAll(sel).forEach((e) => { e.style.display = 'none'; });
        await new Promise((r) => setTimeout(r, 150));
      });
      const res = await p.evaluate(async () => {
        const lum = ([r, g, bl]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
        const parse = (x) => { const m = (String(x).match(/[\d.]+/g) || []).map(Number); return { rgb: m.slice(0, 3), a: m.length > 3 ? m[3] : (m.length === 3 ? 1 : 0) }; };
        const over = (top, a, bot) => top.map((c, i) => c * a + bot[i] * (1 - a));
        const opac = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
        const items = [];
        for (const el of document.body.querySelectorAll('*')) {
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION', 'TEMPLATE', 'TITLE', 'DESC'].includes(el.tagName) || ['title', 'desc'].includes(el.tagName)) continue;
          const tn = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
          if (!tn) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          const r = document.createRange(); r.selectNodeContents(tn); const rc = r.getClientRects()[0];
          if (!rc || rc.width < 2 || rc.height < 2) continue;
          items.push({ el, tn, y: rc.top + scrollY, x: rc.left + Math.min(rc.width / 2, 12), h: rc.height });
        }
        const out = [];
        const VH = innerHeight;
        const H = document.documentElement.scrollHeight;
        for (let top = 0; top < H; top += VH - 100) {
          window.scrollTo({ top, behavior: 'instant' });
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          for (const it of items) {
            if (it.done) continue;
            // the live position: a sticky or fixed panel is not where it was when the page loaded
            const lr = document.createRange(); lr.selectNodeContents(it.tn); const live = lr.getClientRects()[0];
            if (!live) continue;
            const cy = live.top + live.height / 2;
            if (cy < 4 || cy > VH - 4) continue;
            it.x = live.left + Math.min(live.width / 2, 12);
            it.done = true;
            const el = it.el, cs = getComputedStyle(el);
            const o = opac(el);
            if (o < 0.02) continue;
            // clipped by an ancestor's overflow (a carousel's off-screen slide): not visible, not scored
            let clipped = false;
            for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
              const ns = getComputedStyle(n);
              if (ns.overflowX !== 'visible' || ns.overflowY !== 'visible') { const b = n.getBoundingClientRect(); if (it.x < b.left || it.x > b.right || cy < b.top || cy > b.bottom) { clipped = true; break; } }
            }
            if (clipped) continue;
            const stack = document.elementsFromPoint(it.x, cy);
            const at = stack.findIndex((s) => s === el || el.contains(s) || s.contains(el));
            // text that takes no pointer events is not in the hit-test stack: everything there is behind it
            // only text that is itself at the point is measured (or text that takes no pointer events)
            const ownIdx = stack.indexOf(el) >= 0 ? stack.indexOf(el) : (cs.pointerEvents === 'none' ? 0 : (at >= 0 && el.contains(stack[at]) ? at : -1));
            // something opaque painted above the text covers it: not readable text, not scored
            let covered = false;
            for (let i = 0; i < Math.max(0, ownIdx); i++) { const s = stack[i]; if (s.contains(el) || el.contains(s)) continue; const bb = parse(getComputedStyle(s).backgroundColor); if (bb.a * opac(s) > 0.9) { covered = true; break; } }
            if (covered) continue;
            if (ownIdx < 0) continue;   // the point is not on this text (covered by a layer without a background): not scored
            const below = stack.slice(ownIdx);
            let bg = [255, 255, 255], image = false;
            for (const s of below.reverse()) {
              const scs = getComputedStyle(s);
              if (scs.backgroundImage && scs.backgroundImage !== 'none' && !/^url\(.*\.svg/.test(scs.backgroundImage)) image = true;
              if (['IMG', 'VIDEO', 'CANVAS', 'IFRAME', 'PICTURE'].includes(s.tagName)) image = true;
              const bb = parse(scs.backgroundColor);
              if (bb.a > 0) bg = over(bb.rgb, bb.a * opac(s), bg);
              // an SVG shape behind SVG text (a chart bar) is a background too: its fill
              if (s instanceof SVGElement && s !== el && /^(rect|path|circle|ellipse|polygon)$/.test(s.tagName) && /^rgb/.test(scs.fill)) {
                const sf = parse(scs.fill); const fo = parseFloat(scs.fillOpacity); bg = over(sf.rgb, (sf.a || 1) * (isNaN(fo) ? 1 : fo) * opac(s), bg);
              }
            }
            // SVG text is painted with fill, not color
            const paint = (el instanceof SVGElement && cs.fill && /^rgb/.test(cs.fill)) ? cs.fill : cs.color;
            const f = parse(paint);
            const fg = over(f.rgb, f.a * o, bg);
            const L1 = lum(fg), L2 = lum(bg), cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
            const fs = parseFloat(cs.fontSize), fw = +cs.fontWeight || 400;
            const big = fs >= 24 || (fs >= 18.66 && fw >= 700);
            const need = big ? 3 : 4.5;
            const txt = it.tn.textContent.replace(/\s+/g, ' ').trim().slice(0, 40);
            const hidden = !!el.closest('[aria-hidden="true"]');
            out.push({ cr: +cr.toFixed(2), need, image, hidden, txt, color: paint, bg: 'rgb(' + bg.map(Math.round).join(',') + ')', sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') });
          }
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        return out;
      });
      const scored = res.filter((x) => !x.image);
      const bad = scored.filter((x) => x.cr < x.need && !x.hidden);
      const hid = scored.filter((x) => x.cr < x.need && x.hidden);
      fails += bad.length;
      report.push({ w, u, nodes: res.length, image: res.length - scored.length, fail: bad.length, failHidden: hid.length, worst: bad.sort((a, c) => a.cr - c.cr).slice(0, 8) });
      process.stdout.write(`${String(w).padEnd(5)} ${u.padEnd(48)} nodes ${String(res.length).padStart(4)}  fail ${String(bad.length).padStart(3)}${hid.length ? ` (+${hid.length} aria-hidden)` : ''}${bad.length ? '  worst ' + bad[0].cr + ' "' + bad[0].txt + '" ' + bad[0].color + ' on ' + bad[0].bg : ''}\n`);
    }
    await ctx.close();
  }
  await b.close();
  const pagesFailing = (w) => report.filter((r) => r.w === w && r.fail > 0).length;
  for (const w of WIDTHS) console.log(`width ${w}: ${pagesFailing(w)} of ${report.filter((r) => r.w === w).length} pages with failing text, ${report.filter((r) => r.w === w).reduce((s, r) => s + (r.fail || 0), 0)} failing text elements`);
  const j = opt('--json', '');
  if (j) fs.writeFileSync(j, JSON.stringify(report, null, 1));
  process.exitCode = fails ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(2); });
