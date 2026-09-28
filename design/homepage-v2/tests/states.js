// Behaviour tests for the redesigned homepage. node states.js <url>
const { chromium } = require('playwright');
const URL0 = process.argv[2] || 'http://localhost:8124/';
const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };
const noPop = () => { try { localStorage.c3PopDone = 1; } catch (e) {} };

async function ctxPage(browser, opts = {}, init) {
  const { w = 1440, h = 900, reduced = false, js = true } = opts;
  const mobile = w <= 430;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced ? 'reduce' : 'no-preference', javaScriptEnabled: js });
  const page = await ctx.newPage();
  const media = [];
  page.on('request', r => { if (/\/media\/hero\/walkthrough/.test(r.url())) media.push({ url: r.url(), t: Date.now() }); });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(noPop);
  if (init) await page.addInitScript(init);
  return { ctx, page, media, errs };
}
const scrollAll = page => page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } scrollTo({ top: 0, behavior: 'instant' }); });

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  // 1. reduced motion
  {
    const { ctx, page, media, errs } = await ctxPage(browser, { reduced: true });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(3500);
    const r0 = await page.evaluate(() => document.querySelector('.rv-slide.on figcaption').textContent);
    await scrollAll(page); await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const anims = document.getAnimations().map(a => a.timeline && a.timeline.constructor.name);
      const hidden = [...document.querySelectorAll('.eb, .ln, .why-stat, .tm, .qa')].filter(el => { const t = getComputedStyle(el, el.matches('.eb') ? '::before' : el.matches('.ln') ? null : '::before').transform; return t && t !== 'none' && /matrix\(0/.test(t); }).length;
      const strokes = [...document.querySelectorAll('.why-ico path, .why-ico rect, .why-ico circle, .coast')].filter(el => parseFloat(getComputedStyle(el).strokeDashoffset) > 0.01).length;
      const kpi = [...document.querySelectorAll('.stat-kpi')].map(e => getComputedStyle(e).color);
      return { scrollTL: anims.filter(n => n === 'ScrollTimeline' || n === 'ViewTimeline').length, videoSrc: !!document.querySelector('.cine-video').getAttribute('src'), hidden, strokes, rot: getComputedStyle(document.querySelector('.rv-rot')).display, live: document.querySelector('.rv-stack').getAttribute('aria-live'), kpi: [...new Set(kpi)] };
    });
    await page.waitForTimeout(8000);
    const r1 = await page.evaluate(() => document.querySelector('.rv-slide.on figcaption').textContent);
    ok('reduced: no scroll timelines', r.scrollTL === 0, JSON.stringify(r.scrollTL));
    ok('reduced: no video requested', !r.videoSrc && media.length === 0);
    ok('reduced: all lines drawn', r.hidden === 0, 'hidden=' + r.hidden);
    ok('reduced: all strokes drawn', r.strokes === 0, 'undrawn=' + r.strokes);
    ok('reduced: badge values brass-2', r.kpi.length === 1 && r.kpi[0] === 'rgb(212, 137, 74)', r.kpi.join());
    ok('reduced: rotation button hidden', r.rot === 'none');
    ok('reduced: aria-live polite', r.live === 'polite');
    ok('reduced: reviews do not rotate', r0 === r1, `${r0} -> ${r1}`);
    ok('reduced: no page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // 2. JavaScript disabled
  {
    const { ctx, page } = await ctxPage(browser, { js: false });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const vis = el => { const cs = getComputedStyle(el); const b = el.getBoundingClientRect(); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.95 && b.height > 0; };
      const f = document.querySelector('.an-card');
      return { slides: [...document.querySelectorAll('.rv-slide')].filter(vis).length, ctl: getComputedStyle(document.querySelector('.rv-ctl')).display, action: f.getAttribute('action'), method: f.getAttribute('method'), names: [...f.querySelectorAll('input')].map(i => i.name).join(), undrawn: [...document.querySelectorAll('.why-ico path, .coast')].filter(el => parseFloat(getComputedStyle(el).strokeDashoffset) > 0.01).length, h1: document.querySelector('h1').textContent };
    });
    ok('no-js: all five reviews visible', r.slides === 5, 'visible=' + r.slides);
    ok('no-js: review controls hidden', r.ctl === 'none');
    ok('no-js: form GETs the analyzer', r.action === '/invest/long-term-rental/' && r.method === 'get' && r.names === 'street,city,zip', `${r.action} ${r.method} ${r.names}`);
    ok('no-js: decoration drawn', r.undrawn === 0);
    ok('no-js: H1 text exact', r.h1 === 'Myrtle Beach Real Estate', JSON.stringify(r.h1));
    // submit the form without JS
    await page.fill('#sbh-street', '123 Main St'); await page.fill('#sbh-city', 'Myrtle Beach'); await page.fill('#sbh-zip', '29577');
    await Promise.all([page.waitForNavigation({ timeout: 8000 }).catch(() => null), page.click('.an-go')]);
    ok('no-js: submit reaches analyzer with params', /\/invest\/long-term-rental\/\?street=123\+Main\+St&city=Myrtle\+Beach&zip=29577$/.test(page.url()), page.url());
    await ctx.close();
  }

  // 3. IntersectionObserver never fires: text stays visible
  {
    const { ctx, page } = await ctxPage(browser, {}, () => { window.IntersectionObserver = function () { return { observe() {}, unobserve() {}, disconnect() {} }; }; });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(4000);
    await scrollAll(page);
    const r = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll('main *')) {
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
        let op = 1, hid = false; for (let a = el; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); op *= +cs.opacity; if (cs.visibility === 'hidden' || cs.display === 'none') hid = true; }
        if (!hid && op < 0.95) bad.push(el.textContent.trim().slice(0, 30));
      }
      return bad;
    });
    ok('io-stub: no text hidden', r.length === 0, r.join(' | '));
    await ctx.close();
  }

  // 4. shouldIBuy with JS, rail
  {
    const { ctx, page } = await ctxPage(browser, { w: 390, h: 844 });
    await page.goto(URL0, { waitUntil: 'load' });
    await page.fill('#sbh-street', '123 Main St'); await page.fill('#sbh-city', 'Myrtle Beach'); await page.fill('#sbh-zip', '29577');
    const rail = await page.evaluate(() => [document.querySelectorAll('.an-rail i.ok').length, document.querySelector('.an-card').classList.contains('is-ready')]);
    ok('js: rail fills on valid fields', rail[0] === 3 && rail[1], JSON.stringify(rail));
    const [req] = await Promise.all([page.waitForRequest(r => /long-term-rental/.test(r.url()), { timeout: 5000 }).catch(() => null), page.press('#sbh-zip', 'Enter')]);
    ok('js: Enter runs shouldIBuy()', !!req && /\?street=123%20Main%20St&city=Myrtle%20Beach&zip=29577/.test(req.url()), req ? req.url() : 'none');
    await ctx.close();
  }

  // 5. video gates
  for (const [label, init, expectNone] of [
    ['saveData', () => { Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } }); }, true],
    ['2g', () => { Object.defineProperty(navigator, 'connection', { value: { saveData: false, effectiveType: '2g' } }); }, true],
    ['normal', null, false],
  ]) {
    const { ctx, page, media } = await ctxPage(browser, {}, init);
    let loadAt = 0; page.on('load', () => { loadAt = Date.now(); });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(4500);
    if (expectNone) ok(`video: none on ${label}`, media.length === 0, media.map(m => m.url).join());
    else {
      ok('video: requested only after load', media.length > 0 && media[0].t >= loadAt, media.map(m => m.url.split('/').pop()).join());
      ok('video: webm chosen in headless Chromium', media.length > 0 && /\.webm$/.test(media[0].url));
      const st = await page.evaluate(() => ({ playing: document.querySelector('#home').classList.contains('is-playing'), paused: document.querySelector('.cine-video').paused, btn: !document.querySelector('.cine-pause').hidden }));
      ok('video: playing, button shown', st.playing && !st.paused && st.btn, JSON.stringify(st));
      // scroll away -> pause
      await page.evaluate(() => scrollTo({ top: 3000, behavior: 'instant' })); await page.waitForTimeout(600);
      const sp = await page.evaluate(() => document.querySelector('.cine-video').paused);
      ok('video: pauses when scrolled away', sp);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(600);
      ok('video: resumes when back', !(await page.evaluate(() => document.querySelector('.cine-video').paused)));
      // pop-up opens -> pause; closes -> resume
      await page.evaluate(() => { document.getElementById('c3-pop').hidden = false; }); await page.waitForTimeout(300);
      ok('video: pauses while pop-up is open', await page.evaluate(() => document.querySelector('.cine-video').paused));
      await page.evaluate(() => { document.getElementById('c3-pop').hidden = true; }); await page.waitForTimeout(300);
      ok('video: resumes after pop-up closes', !(await page.evaluate(() => document.querySelector('.cine-video').paused)));
      // hidden tab
      await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); }); await page.waitForTimeout(300);
      ok('video: pauses on hidden tab', await page.evaluate(() => document.querySelector('.cine-video').paused));
      await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); }); await page.waitForTimeout(300);
      // user pause button
      await page.click('.cine-pause'); await page.waitForTimeout(200);
      const up = await page.evaluate(() => [document.querySelector('.cine-video').paused, document.querySelector('.cine-pause').getAttribute('aria-label')]);
      ok('video: pause button pauses and relabels', up[0] && up[1] === 'Play the video', JSON.stringify(up));
      await page.click('.cine-pause'); await page.waitForTimeout(300);
      // three plays then rest (fast-forward)
      await page.evaluate(() => { document.querySelector('.cine-video').playbackRate = 16; });
      await page.waitForTimeout(4200);
      const rest = await page.evaluate(() => ({ paused: document.querySelector('.cine-video').paused, playing: document.querySelector('#home').classList.contains('is-playing'), label: document.querySelector('.cine-pause').getAttribute('aria-label') }));
      ok('video: rests on poster after 3 plays', rest.paused && !rest.playing && rest.label === 'Play the video', JSON.stringify(rest));
    }
    await ctx.close();
  }
  // stall -> abort to poster
  {
    const { ctx, page } = await ctxPage(browser);
    await page.route(/walkthrough/, () => {}); // never answer
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(8000);
    const r = await page.evaluate(() => ({ src: document.querySelector('.cine-video').getAttribute('src'), btn: document.querySelector('.cine-pause').hidden, playing: document.querySelector('#home').classList.contains('is-playing') }));
    ok('video: stall aborts to poster, button hidden', !r.src && r.btn && !r.playing, JSON.stringify(r));
    await ctx.close();
  }

  // 6. reviews
  {
    const { ctx, page } = await ctxPage(browser);
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(500);
    const cap = () => page.evaluate(() => document.querySelector('.rv-slide.on figcaption').textContent);
    const a = await cap(); await page.waitForTimeout(7600); const b = await cap();
    ok('reviews: advance after 7s', a !== b, `${a} -> ${b}`);
    await page.hover('.rv-stack'); await page.waitForTimeout(7600); const c = await cap();
    ok('reviews: hold while hovered', b === c);
    await page.mouse.move(5, 5);
    await page.click('.rv-next'); const d = await cap(); await page.waitForTimeout(7600); const e = await cap();
    const live = await page.evaluate(() => [document.querySelector('.rv-stack').getAttribute('aria-live'), document.querySelector('.rv-rot').getAttribute('aria-label')]);
    ok('reviews: manual step stops rotation', d === e && live[0] === 'polite' && live[1] === 'Play reviews', JSON.stringify(live));
    const h = await page.evaluate(() => [...document.querySelectorAll('.rv-slide')].map(s => s.getBoundingClientRect().height));
    const box = await page.evaluate(() => document.querySelector('.rv-stack').getBoundingClientRect().height);
    ok('reviews: stack as tall as the tallest slide', Math.abs(box - Math.max(...h)) < 1, `${box} vs ${Math.max(...h)}`);
    await ctx.close();
  }
  {
    const { ctx, page } = await ctxPage(browser, { w: 390, h: 844 });
    await page.goto(URL0, { waitUntil: 'load' });
    await page.evaluate(() => document.querySelector('#home-reviews').scrollIntoView({ block: 'center', behavior: 'instant' }));
    const cap = () => page.evaluate(() => document.querySelector('.rv-slide.on figcaption').textContent);
    const a = await cap();
    const bb = await page.evaluate(() => { const b = document.querySelector('.rv-stack').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bb.x + 80, y: bb.y }] });
    for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: bb.x + 80 - k * 25, y: bb.y + 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(300);
    const b = await cap();
    ok('reviews: swipe left steps forward at 390', a !== b, `${a} -> ${b}`);
    await ctx.close();
  }

  // 7. layout budgets
  for (const [w, h] of [[1100, 700], [1366, 657], [1440, 789], [1920, 969]]) {
    const { ctx, page } = await ctxPage(browser, { w, h });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const rv = document.querySelector('#home-reviews').getBoundingClientRect();
      const film = document.querySelector('.cine-film').getBoundingClientRect();
      const pbtn = document.querySelector('.cine-pause'); pbtn.hidden = false; const pb = pbtn.getBoundingClientRect();
      const col = document.querySelector('.cine-copy').getBoundingClientRect().width;
      const lines = [...document.querySelectorAll('.cine-h1 .l1, .cine-h1 .l2')].map(l => { const s = l.firstElementChild.getBoundingClientRect(); return Math.round(s.right - document.querySelector('.cine-copy').getBoundingClientRect().left); });
      const tiles = [...document.querySelectorAll('.cine-path')].map(t => t.scrollWidth <= t.clientWidth + 1);
      return { rvBottom: Math.round(rv.bottom), ih: innerHeight, pbIn: pb.left >= film.left && pb.right <= Math.min(film.right, innerWidth) && pb.top >= Math.max(film.top, 89) && pb.bottom <= film.bottom, col: Math.round(col), lines, tiles };
    });
    ok(`fold ${w}x${h}: reviews end above fold`, r.rvBottom <= r.ih, `${r.rvBottom} <= ${r.ih}`);
    ok(`fold ${w}x${h}: pause button inside visible film`, r.pbIn);
    ok(`fold ${w}x${h}: H1 lines inside column-8`, r.lines.every(x => x <= r.col - 8), `${r.lines} col ${r.col}`);
    ok(`fold ${w}x${h}: path tiles do not overflow`, r.tiles.every(Boolean));
    await ctx.close();
  }
  for (const w of [320, 360, 390, 768]) {
    const { ctx, page } = await ctxPage(browser, { w, h: w < 700 ? 740 : 1024 });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const copy = document.querySelector('.cine-copy'), cs = getComputedStyle(copy); const inner = copy.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); const left = copy.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
      const lines = [...document.querySelectorAll('.cine-h1 .l1>span, .cine-h1 .l2>span')].map(s => Math.round(s.getBoundingClientRect().right - left));
      const ctl = document.querySelector('.rv-ctl').getBoundingClientRect(); const rvb = document.querySelector('#home-reviews').getBoundingClientRect();
      const row = document.querySelector('.an-row').getBoundingClientRect(), card = document.querySelector('.an-card').getBoundingClientRect();
      const bios = [...document.querySelectorAll('.tm-bio')].every(b => b.scrollWidth <= b.clientWidth + 1);
      return { inner: Math.round(inner), lines, ctlFits: ctl.right <= rvb.right + 1, rowFits: row.right <= card.right - 10, bios };
    });
    ok(`mobile ${w}: H1 lines fit`, r.lines.every(x => x <= r.inner), `${r.lines} / ${r.inner}`);
    ok(`mobile ${w}: review controls fit`, r.ctlFits);
    ok(`mobile ${w}: analyzer city/ZIP row fits`, r.rowFits);
    ok(`mobile ${w}: bios do not overflow`, r.bios);
    await ctx.close();
  }
  // H1 with web fonts blocked (fallback faces)
  for (const w of [320, 390, 1100, 1440]) {
    const { ctx, page } = await ctxPage(browser, { w, h: 800 });
    await page.route(/\.woff2$/, r => r.abort());
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(800);
    const r = await page.evaluate(() => { const copy = document.querySelector('.cine-copy'), cs = getComputedStyle(copy); const left = copy.getBoundingClientRect().left + parseFloat(cs.paddingLeft); const inner = copy.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); return { inner: Math.round(inner), lines: [...document.querySelectorAll('.cine-h1 .l1>span, .cine-h1 .l2>span')].map(s => Math.round(s.getBoundingClientRect().right - left)), sw: document.documentElement.scrollWidth, fam: getComputedStyle(document.querySelector('.cine-h1')).fontFamily.slice(0, 40) }; });
    ok(`fallback fonts ${w}: H1 lines fit`, r.lines.every(x => x <= r.inner) && r.sw <= w, `${r.lines} / ${r.inner} sw=${r.sw}`);
    await ctx.close();
  }

  // 8. town labels never collide
  for (const [w, h] of [[1100, 800], [1152, 800], [1280, 800], [1440, 900], [1920, 1000]]) {
    const { ctx, page } = await ctxPage(browser, { w, h });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const rs = [...document.querySelectorAll('.tw-list a')].map(a => ({ t: a.textContent, b: a.getBoundingClientRect() }));
      const hits = [];
      for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const a = rs[i].b, b = rs[j].b; if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) hits.push(rs[i].t + '/' + rs[j].t); }
      const sec = document.querySelector('#towns').getBoundingClientRect();
      const out = rs.filter(x => x.b.left < 0 || x.b.right > innerWidth).map(x => x.t);
      return { hits, out };
    });
    ok(`towns ${w}: labels do not overlap`, r.hits.length === 0 && r.out.length === 0, r.hits.concat(r.out).join(', '));
    await ctx.close();
  }

  // 9. copy after a full scroll
  {
    const { ctx, page } = await ctxPage(browser);
    await page.goto(URL0, { waitUntil: 'load' }); await scrollAll(page); await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({ kpi: [...document.querySelectorAll('.stat-kpi')].map(e => e.textContent), col: [...new Set([...document.querySelectorAll('.stat-kpi')].map(e => getComputedStyle(e).color))] }));
    ok('badges: values exact after scroll', JSON.stringify(r.kpi) === JSON.stringify(['30+ years', 'Instant replies', 'Pawleys to NC', '1:1', 'Specialized agents', 'Free tools', 'Permit data', 'Clear communication']), r.kpi.join('|'));
    ok('badges: brass-2 after reveal', r.col.length === 1 && r.col[0] === 'rgb(212, 137, 74)', r.col.join());
    await ctx.close();
  }

  // 10. CLS over load, a full scroll and 35s idle
  for (const [w, h] of [[390, 844], [1440, 789]]) {
    const { ctx, page } = await ctxPage(browser, { w, h }, () => { window.__cls = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls.push({ v: e.value, t: Math.round(e.startTime), n: (e.sources || []).map(s => s.node && (s.node.id || s.node.className || s.node.nodeName)).join(',') }); }).observe({ type: 'layout-shift', buffered: true }); });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(2000); await scrollAll(page); await page.waitForTimeout(35000);
    const r = await page.evaluate(() => window.__cls);
    const tot = r.reduce((s, e) => s + e.v, 0);
    ok(`CLS ${w}: under 0.05`, tot < 0.05, tot.toFixed(4) + ' ' + JSON.stringify(r.slice(0, 5)));
    await ctx.close();
  }

  await browser.close();
  const f = results.filter(r => !r.pass);
  console.log(`\n${results.length - f.length}/${results.length} passed`);
})().catch(e => { console.error(e); process.exit(1); });
