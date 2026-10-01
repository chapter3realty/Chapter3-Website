// Behaviour tests for the redesigned homepage. node states.js <url>. Exits 1 when a check fails.
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
  const zoom = [];
  page.on('request', r => { if (/\/media\/map\/zoom-/.test(r.url())) zoom.push(r.url()); });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(noPop);
  if (init) await page.addInitScript(init);
  return { ctx, page, zoom, errs };
}
// the hero map: every town label shown (the flight has landed); keyboard focus on a town label, which lands a flight at once
const landed = (page, ms = 14000) => page.waitForFunction(() => [...document.querySelectorAll('.tw-pin')].every(e => getComputedStyle(e).opacity === '1'), null, { timeout: ms }).catch(() => {});
const landNow = page => page.evaluate(() => { const a = document.querySelector('.tw-pin a'); a.focus(); a.blur(); });
const scrollAll = page => page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } scrollTo({ top: 0, behavior: 'instant' }); });

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  // 1. reduced motion
  {
    const { ctx, page, zoom, errs } = await ctxPage(browser, { reduced: true });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(3500);
    const r0 = await page.evaluate(() => document.querySelector('.rv-slide.on figcaption').textContent);
    await scrollAll(page); await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const anims = document.getAnimations().map(a => a.timeline && a.timeline.constructor.name);
      const hidden = [...document.querySelectorAll('.eb, .ln, .why-stat, .tm, .qa')].filter(el => { const t = getComputedStyle(el, el.matches('.eb') ? '::before' : el.matches('.ln') ? null : '::before').transform; return t && t !== 'none' && /matrix\(0/.test(t); }).length;
      const strokes = [...document.querySelectorAll('.why-ico path, .why-ico rect, .why-ico circle, .coast')].filter(el => parseFloat(getComputedStyle(el).strokeDashoffset) > 0.01).length;
      const kpi = [...document.querySelectorAll('.stat-kpi')].map(e => getComputedStyle(e).color);
      return { scrollTL: anims.filter(n => n === 'ScrollTimeline' || n === 'ViewTimeline').length, hidden, strokes, live: document.querySelector('.rv-stack').getAttribute('aria-live'), kpi: [...new Set(kpi)] };
    });
    await page.waitForTimeout(8000);
    const r1 = await page.evaluate(() => document.querySelector('.rv-slide.on figcaption').textContent);
    ok('reduced: no scroll timelines', r.scrollTL === 0, JSON.stringify(r.scrollTL));
    ok('reduced: no zoom maps requested', zoom.length === 0, zoom.join());
    ok('reduced: all lines drawn', r.hidden === 0, 'hidden=' + r.hidden);
    ok('reduced: all strokes drawn', r.strokes === 0, 'undrawn=' + r.strokes);
    ok('reduced: badge values brass-2', r.kpi.length === 1 && r.kpi[0] === 'rgb(212, 137, 74)', r.kpi.join());
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
    ok('no-js: H1 text exact', r.h1 === 'Myrtle Beach Homes', JSON.stringify(r.h1));
    // submit the form without JS
    await page.fill('#sbh-street', '123 Main St'); await page.fill('#sbh-city', 'Myrtle Beach'); await page.fill('#sbh-zip', '29577');
    await Promise.all([page.waitForNavigation({ timeout: 8000 }).catch(() => null), page.click('.an-go')]);
    ok('no-js: submit reaches analyzer with params', /\/invest\/long-term-rental\/\?street=123\+Main\+St&city=Myrtle\+Beach&zip=29577$/.test(page.url()), page.url());
    await ctx.close();
  }

  // 3. IntersectionObserver never fires: text stays visible
  {
    const { ctx, page } = await ctxPage(browser, {}, () => { window.IntersectionObserver = function () { return { observe() {}, unobserve() {}, disconnect() {} }; }; });
    await page.goto(URL0, { waitUntil: 'load' }); await landed(page);
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

  // 5. the hero map's loading gates: the zoom maps load with the page and the flight is the zoom; on Save-Data or a 2G link
  // no zoom map is requested and the flight is the short one; if the zoom maps stall, the short one starts after 2.5s
  const planeFlight = page => page.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.matches && a.effect.target.matches('.tw-plane') && a.effect.getTiming().iterations !== Infinity).map(a => a.effect.getTiming().duration).join());
  for (const [label, init, short] of [
    ['Save-Data', () => { Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' }, configurable: true }); }, true],
    ['2G', () => { Object.defineProperty(navigator, 'connection', { value: { saveData: false, effectiveType: '2g' }, configurable: true }); }, true],
    ['a normal link', null, false],
  ]) {
    const { ctx, page, zoom, errs } = await ctxPage(browser, {}, init);
    await page.goto(URL0, { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('#home .tw-stage').classList.contains('in'), null, { timeout: 8000 }).catch(() => {});
    const d = await planeFlight(page);
    if (short) ok(`hero map, ${label}: the short flight, no zoom maps requested`, d === '2600' && zoom.length === 0, `flight ${d} requests ${zoom.length}`);
    else ok('hero map: the zoom maps load with the page, and the flight is the zoom', d === '4600' && zoom.length >= 3 && ['us', 'se', 'coast'].every(k => zoom.some(u => u.includes('zoom-' + k + '-'))), `flight ${d} requests ${zoom.map(u => u.split('/').pop()).join()}`);
    ok(`hero map, ${label}: no script errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  {
    const { ctx, page } = await ctxPage(browser);
    await page.route(/\/media\/map\/zoom-/, () => {}); // never answer
    await page.goto(URL0, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const a = await page.evaluate(() => document.querySelector('#home .tw-stage').classList.contains('in'));
    await page.waitForTimeout(2200);
    const d = await planeFlight(page);
    ok('hero map: zoom maps that stall give the short flight after 2.5s', !a && d === '2600', `in at 1.5s ${a}, flight ${d}`);
    await ctx.close();
  }

  // 6. reviews
  {
    const { ctx, page } = await ctxPage(browser);
    await page.goto(URL0, { waitUntil: 'load' });
    await page.evaluate(() => document.querySelector('#home-reviews').scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(500);
    const cap = () => page.evaluate(() => document.querySelector('.rv-slide.on figcaption').textContent);
    // they never move on their own (so no pause button); the arrows and the dots step through them, announced politely
    const a = await cap(); await page.waitForTimeout(7600); const b = await cap();
    ok('reviews: never move on their own, no pause button', a === b && !(await page.evaluate(() => document.querySelector('.rv-rot'))), `${a} -> ${b}`);
    await page.click('.rv-next'); const d = await cap();
    await page.click('.rv-prev'); const e = await cap();
    await page.click('.rv-dots button:nth-child(4)'); await page.waitForTimeout(100);
    const f = await page.evaluate(() => ({ cap: document.querySelector('.rv-slide.on figcaption').textContent, slide: [...document.querySelectorAll('.rv-slide')].findIndex((x) => x.classList.contains('on')), cur: [...document.querySelectorAll('.rv-dots button')].findIndex((x) => x.getAttribute('aria-current') === 'true'), live: document.querySelector('.rv-stack').getAttribute('aria-live') }));
    ok('reviews: next, previous and a dot step through them, announced politely', d !== b && e === b && f.slide === 3 && f.cur === 3 && f.live === 'polite', JSON.stringify({ d, e, ...f }));
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

  // 7. layout budgets. A wide screen: the words and the three paths, and once the map lands every town, inside the first
  // screen; the H1 inside its column. The H1's box is the column: on a narrow screen the words' wrapper
  // is display:contents and has no box of its own.
  const h1Fit = () => { const h = document.querySelector('.cine-h1').getBoundingClientRect(); return { inner: Math.round(h.width), lines: [...document.querySelectorAll('.cine-h1 .l1>span, .cine-h1 .l2>span')].map(s => Math.round(s.getBoundingClientRect().right - h.left)) }; };
  for (const [w, h] of [[1100, 700], [1366, 657], [1440, 789], [1920, 969], [1280, 649]]) {
    const { ctx, page } = await ctxPage(browser, { w, h, reduced: true });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(600);
    const r = await page.evaluate((h1Fit) => {
      const f = new Function('return (' + h1Fit + ')()'), H = innerHeight;
      const words = Math.max(...[...document.querySelectorAll('.cine-copy > *')].map(e => e.getBoundingClientRect().bottom));
      const pins = [...document.querySelectorAll('.tw-pin')].filter(li => Math.max(li.querySelector('a').getBoundingClientRect().bottom, li.getBoundingClientRect().top + 8) > H).map(li => li.dataset.town);
      const tiles = [...document.querySelectorAll('.cine-path')].map(t => t.scrollWidth <= t.clientWidth + 1);
      return { words: Math.round(words), H, pins, ...f(), tiles };
    }, h1Fit.toString());
    ok(`hero ${w}x${h}: the words and the paths in the first screen`, r.words <= r.H, `${r.words} <= ${r.H}`);
    ok(`hero ${w}x${h}: all nine towns in the first screen`, r.pins.length === 0, r.pins.join());
    ok(`hero ${w}x${h}: H1 lines inside the column`, r.lines.every(x => x <= r.inner), `${r.lines} col ${r.inner}`);
    ok(`hero ${w}x${h}: path tiles do not overflow`, r.tiles.every(Boolean));
    await ctx.close();
  }
  // the owner's edits of 2026-10-01: no eyebrow, the H1 and the H2, the paths without arrows, no map controls or map data line,
  // no pause button anywhere, the analyzer's heading and text, and example values in its three boxes
  {
    const { ctx, page } = await ctxPage(browser, { reduced: true });
    await page.goto(URL0, { waitUntil: 'load' });
    const r = await page.evaluate(() => ({
      eyebrow: !!document.querySelector('.cine-eyebrow') || /Chapter3 Realty \u00b7 Myrtle Beach, SC/.test(document.querySelector('#home').textContent),
      h1: document.querySelector('h1').textContent, h2: (document.querySelector('#home h2.cine-sub') || {}).textContent,
      arrows: document.querySelectorAll('.cine-path .pa, .cine-path svg').length,
      controls: document.querySelectorAll('.tw-ctl, .tw-rot, .tw-compass, .rv-rot, .tw-credit').length, credit: /Map data/.test(document.body.textContent),
      pause: [...document.querySelectorAll('button')].filter((b) => /pause|play/i.test(b.getAttribute('aria-label') || '')).length,
      an: document.querySelector('#ltr-h').textContent, anP: document.querySelector('.an-text').textContent,
      ph: ['sbh-street', 'sbh-city', 'sbh-zip'].map((id) => document.getElementById(id).placeholder),
    }));
    ok('edits: no eyebrow; H1 "Myrtle Beach Homes"; the H2 under it', !r.eyebrow && r.h1 === 'Myrtle Beach Homes' && r.h2 === 'Buy, sell and invest in Myrtle Beach real estate with a specialized real estate agent.', JSON.stringify({ eyebrow: r.eyebrow, h1: r.h1, h2: r.h2 }));
    ok('edits: no arrows in the paths, no map controls, no map data line, no pause button', r.arrows === 0 && r.controls === 0 && !r.credit && r.pause === 0, JSON.stringify({ arrows: r.arrows, controls: r.controls, credit: r.credit, pause: r.pause }));
    ok('edits: the analyzer heading, text and example values', r.an === 'Try our property analysis tool' && r.anP === 'Enter any address to see a real estate analysis on the house: expected profit, appreciation and much more. Free, no signup.' && r.ph.join('|') === '123 Main St|Myrtle Beach|29577', JSON.stringify({ an: r.an, anP: r.anP, ph: r.ph }));
    await ctx.close();
  }
  // a narrow screen: the paths and the point the flight lands on in the first screen
  for (const w of [320, 360, 390, 768]) {
    const { ctx, page } = await ctxPage(browser, { w, h: w < 700 ? 740 : 1024 });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(1500);
    const r = await page.evaluate((h1Fit) => {
      const f = new Function('return (' + h1Fit + ')()'), cs = getComputedStyle(document.querySelector('#home'));
      const st = document.querySelector('#home .tw-stage').getBoundingClientRect(), target = st.bottom - parseFloat(cs.getPropertyValue('--cb'));
      const paths = document.querySelector('.cine-paths').getBoundingClientRect();
      const ctl = document.querySelector('.rv-ctl').getBoundingClientRect(); const rvb = document.querySelector('#home-reviews').getBoundingClientRect();
      const row = document.querySelector('.an-row').getBoundingClientRect(), card = document.querySelector('.an-card').getBoundingClientRect();
      const bios = [...document.querySelectorAll('.tm-bio')].every(b => b.scrollWidth <= b.clientWidth + 1);
      return { ...f(), paths: Math.round(paths.bottom), target: Math.round(target), H: innerHeight, sw: document.documentElement.scrollWidth, ctlFits: ctl.right <= rvb.right + 1, rowFits: row.right <= card.right - 10, bios };
    }, h1Fit.toString());
    ok(`mobile ${w}: H1 lines fit`, r.lines.every(x => x <= r.inner) && r.sw <= w, `${r.lines} / ${r.inner} sw=${r.sw}`);
    ok(`mobile ${w}: the paths and the flight's landing point in the first screen`, r.paths <= r.H && r.target <= r.H - 40, `paths ${r.paths}, landing ${r.target}, screen ${r.H}`);
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
    const r = await page.evaluate((h1Fit) => ({ ...new Function('return (' + h1Fit + ')()')(), sw: document.documentElement.scrollWidth }), h1Fit.toString());
    ok(`fallback fonts ${w}: H1 lines fit`, r.lines.every(x => x <= r.inner) && r.sw <= w, `${r.lines} / ${r.inner} sw=${r.sw}`);
    await ctx.close();
  }

  // 8. the hero map. At rest, at every width and over the camera's whole heading range: each label sits on its town, and
  // no label covers another label, a pin, a shield, a water name or the words, even drawn 4.5% wider (Firefox draws
  // DM Sans about 3.5% wider than Chromium and WebKit). Then while it moves.
  const TW = require('fs').readFileSync(__dirname + '/twlib.js', 'utf-8');
  // motion allowed; keyboard focus on a town label lands the flight at once
  for (const [w, h] of [[2560, 1440], [1920, 1080], [1920, 860], [1680, 649], [1536, 730], [1440, 900], [1440, 790], [1400, 800], [1400, 649], [1399, 800], [1399, 649], [1366, 768], [1280, 800], [1280, 720], [1159, 900], [1100, 800], [1100, 600], [1099, 800], [1024, 768], [900, 1000], [899, 1000], [820, 1180], [768, 1024], [700, 900], [699, 900], [430, 932], [390, 844], [360, 740], [359, 640], [340, 700], [320, 568]]) {
    const { ctx, page } = await ctxPage(browser, { w, h });
    await page.goto(URL0, { waitUntil: 'load' });
    await landNow(page);
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(TW);
    const r = await page.evaluate(() => {
      const T = window.__tw, [h0, h1] = T.heads(), all = new Set();
      for (let k = 0; k <= 6; k++) { T.setHead(h0 + (h1 - h0) * k / 6); T.problems(0.045).forEach((x) => all.add(x)); }
      document.querySelector('#home').style.removeProperty('--h0');
      return { probs: [...all], proj: T.projErr(), n: document.querySelectorAll('.tw-pin a[href^="/submarkets/"]').length };
    });
    ok(`map ${w}x${h}: nine town links`, r.n === 9, String(r.n));
    ok(`map ${w}x${h}: labels clear over the heading range`, r.probs.length === 0, r.probs.slice(0, 4).join('; '));
    ok(`map ${w}x${h}: labels on their towns`, r.proj.worst <= 1, r.proj.worst + 'px ' + r.proj.who);
    await ctx.close();
  }
  // the map in motion. __twan lists the map's own transform animations (the flight), not CSS ones.
  const twInit = () => { window.__twan = () => document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.tw-stage') && !(a instanceof CSSAnimation) && !(a instanceof CSSTransition) && a.effect.getKeyframes().some((k) => k.transform)); window.__shown = () => [...document.querySelectorAll('.tw-pin')].filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.05).length; };
  const flightState = (page) => page.evaluate(() => { const an = window.__twan(); return { flight: an.filter((a) => a.effect.getTiming().iterations !== Infinity && a.playState === 'running').length, turn: an.filter((a) => a.effect.getTiming().iterations === Infinity && a.playState === 'running').length, shown: window.__shown(), in: document.querySelector('#home .tw-stage').classList.contains('in') }; });
  const takeoff = (page) => page.waitForFunction(() => document.querySelector('#home .tw-stage').classList.contains('in'), null, { timeout: 10000 });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page, errs } = await ctxPage(browser, { w, h }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await takeoff(page);
    const f0 = await flightState(page);
    await page.waitForTimeout(400);
    const f400 = await flightState(page);
    ok(`map ${w}: the flight starts as the page opens, with no label shown`, f0.flight > 0 && f0.shown === 0, JSON.stringify(f0));
    ok(`map ${w}: the flight is still running at +400ms`, f400.flight > 0 && f400.shown === 0, JSON.stringify(f400));
    // the labels, shields and water names are hidden until the landing and move only in the flight's last 30% (from 3.2s):
    // every label that can be seen sits on its town, and at 3.5s, just before they show, all of them already do
    const worst = [], mv = [], T = [800, 1600, 3500, 4200, 7000];
    for (const t of T) {
      await page.waitForTimeout(t - (worst.length ? T[worst.length - 1] : 400));
      await page.evaluate(TW);
      const r = await page.evaluate((all) => {
        const an = window.__twan(), running = an.filter((a) => a.playState === 'running' && a.effect.target.matches('.tw-plane, .tw-pt, .tw-deco .wl i')).length;
        an.forEach((a) => a.pause()); const e = window.__tw.projErr(!all); an.forEach((a) => a.play());
        return { e: e.worst, running };
      }, t === 3500);
      worst.push(r.e); mv.push(r.running);
    }
    ok(`map ${w}: labels stay on their towns while it moves, whenever they can be seen`, Math.max(...worst) <= 1, worst.join(', ') + 'px (3.5s: all labels, seen or not)');
    const movers = await page.evaluate(() => [...document.querySelectorAll('.tw-plane, .tw-pt, .tw-deco .wl i')].filter((e) => e.getClientRects().length).length);
    ok(`map ${w}: the flight moves every drawn element`, mv.slice(0, 4).every((n) => n === movers), mv.join(', ') + ' of ' + movers);
    const done = await flightState(page);
    ok(`map ${w}: after the flight the map is at rest, every label shown`, done.flight === 0 && done.turn === 0 && mv[4] === 0 && done.shown === 9, JSON.stringify(done) + ' running at 7s: ' + mv[4]);
    if (w > 430) {
      // a resize across a breakpoint at rest: CSS draws the new camera at once, labels on their towns
      await page.setViewportSize({ width: 1000, height: h });
      await page.waitForTimeout(120);
      await page.evaluate(TW);
      const bp = await page.evaluate(() => window.__tw.projErr().worst);
      ok('map: after crossing a breakpoint, labels on their towns', bp <= 1, bp + 'px');
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(300);
    }
    ok(`map ${w}: no script errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  // all the hero's motion (the flight, the landing pins, rings and labels) ends within 5s of the flight's start, so it needs
  // no pause button (WCAG 2.2.2). Read from the animations' own timing, a second into the flight, when all of them exist
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page } = await ctxPage(browser, { w, h }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await takeoff(page); await page.waitForTimeout(1000);
    const r = await page.evaluate(() => {
      const an = document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#home'));
      const t0 = an.find((a) => a.effect.target.matches('.tw-plane')).startTime;
      // every animation still to run, from the flight's start; the brass point's pulse repeats until it is hidden at the landing
      const ends = an.map((a) => { const t = a.effect.getComputedTiming(); return { el: String(a.effect.target.className || a.effect.target.tagName).slice(0, 16), dest: !!a.effect.target.closest('.tw-dest'), end: t.endTime === Infinity ? Infinity : Math.round((a.startTime ?? t0) - t0 + t.endTime) }; }).filter((e) => e.end > 0);
      const worst = ends.filter((e) => !e.dest).reduce((x, y) => (y.end > x.end ? y : x), { end: 0 });
      return { n: ends.length, worst, otherInfinite: ends.filter((e) => e.end === Infinity && !e.dest).map((e) => e.el), lands: document.querySelector('#home .tw-stage').classList.contains('z') ? 4600 : 2600 };
    });
    ok(`map ${w}: all the hero's motion ends within 5s of the flight's start`, r.n > 20 && r.worst.end <= 5000 && r.otherInfinite.length === 0, JSON.stringify(r));
    await ctx.close();
  }
  // the zoom: at 400ms the camera looks at the eastern United States (98W to 66.5W, 24.5N to 47.5N), tilted, inside the part of
  // the screen the words leave free (beside them on a wide screen, under them on a narrow one), with the basemap hidden and
  // the brass point on the Grand Strand; after it lands the zoom levels are gone and the basemap is the only map
  for (const [w, h] of [[1440, 900], [1100, 649], [820, 1180], [390, 844]]) {
    const { ctx, page, errs } = await ctxPage(browser, { w, h }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await takeoff(page);
    const f0 = await page.evaluate(() => {
      const an = document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.tw-stage') && !(a instanceof CSSTransition) && !(a instanceof CSSAnimation));
      an.forEach((a) => { a.pause(); a.currentTime = 400; });
      const st = document.querySelector('#home .tw-stage').getBoundingClientRect(), us = document.querySelector('.tw-lod[data-lod=us]'), img = us.querySelector('img'), e = us.dataset.ext.split(',').map(Number);
      const ym = (lat) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
      // probes inside the country map at the box's corners, placed by the browser through the map's own 3D transform
      const at = (lon, lat) => { const p = document.createElement('i'); p.style.cssText = `position:absolute;width:0;height:0;left:${(lon - e[0]) / (e[1] - e[0]) * img.width}px;top:${(ym(e[3]) - ym(lat)) / (ym(e[3]) - ym(e[2])) * img.height}px`; us.appendChild(p); const r = p.getBoundingClientRect(); p.remove(); return [r.left, r.top]; };
      const [nw, ne, se, sw] = [at(-98, 47.5), at(-66.5, 47.5), at(-66.5, 24.5), at(-98, 24.5)];
      const xs = [nw[0], ne[0], se[0], sw[0]], ys = [nw[1], ne[1], se[1], sw[1]];
      const box = { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) };
      let words = null;
      for (const el of document.querySelectorAll('.cine-copy > *')) { const r = el.getBoundingClientRect(); if (!r.height || r.bottom <= st.top || r.top >= st.bottom) continue; words = words ? { r: Math.max(words.r, r.right), b: Math.max(words.b, r.bottom) } : { r: r.right, b: r.bottom }; }
      const beside = words && st.right - words.r > st.width / 3;
      const free = beside ? { l: words.r, r: st.right, t: Math.max(st.top, 0), b: Math.min(st.bottom, innerHeight) } : { l: st.left, r: st.right, t: Math.max(words ? words.b : st.top, 0), b: Math.min(st.bottom, innerHeight) };
      const o = (sel) => +getComputedStyle(document.querySelector(sel)).opacity;
      const out = { lod: document.querySelector('#home .tw-stage').classList.contains('lod'), us: o('.tw-lod[data-lod=us]'), plane: o('.tw-plane'), fog: +o('.tw-fog').toFixed(2), dest: o('.tw-dest'),
        beside, inFree: box.l >= free.l + 20 && box.r <= free.r - 8 && box.t >= free.t + 8 && box.b <= free.b - 8,
        fill: +Math.max((box.r - box.l) / (free.r - free.l), (box.b - box.t) / (free.b - free.t)).toFixed(2),
        tilt: +((ne[0] - nw[0]) / (se[0] - sw[0])).toFixed(3) };
      an.forEach((a) => a.play());
      return out;
    });
    ok(`map ${w}x${h}: the flight starts on the eastern United States, tilted, where the words leave room`, f0.lod && f0.us === 1 && f0.plane === 0 && f0.dest > 0.9 && f0.fog >= 0.45 && f0.fog <= 0.6 && f0.inFree && f0.fill >= 0.8 && f0.tilt < 0.97 && f0.beside === (w > 1099), JSON.stringify(f0));
    await page.waitForTimeout(5400);
    const end = await page.evaluate(() => ({ lod: document.querySelector('#home .tw-stage').classList.contains('lod'), shown: [...document.querySelectorAll('.tw-lod, .tw-dest')].filter((e) => e.getClientRects().length).length, plane: getComputedStyle(document.querySelector('.tw-plane')).opacity, fog: getComputedStyle(document.querySelector('.tw-fog')).opacity, pins: window.__shown() }));
    ok(`map ${w}x${h}: after the zoom lands, only the basemap is left`, !end.lod && end.shown === 0 && end.plane === '1' && end.fog === '1' && end.pins === 9, JSON.stringify(end));
    ok(`map ${w}x${h}: zoom without script errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  // the motion preference changing while the page is open: the map stops at rest with every label shown, then turns again
  {
    const { ctx, page } = await ctxPage(browser, { w: 1440, h: 900 }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await landed(page); await page.waitForTimeout(500);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(400);
    const b = await page.evaluate(() => ({ running: window.__twan().filter((x) => x.playState === 'running').length, shown: window.__shown(), lod: document.querySelector('#home .tw-stage').classList.contains('lod') }));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(400);
    const c = await flightState(page);
    ok('map: the motion setting changing after the landing leaves it at rest, every label shown', b.running === 0 && b.shown === 9 && !b.lod && c.flight === 0 && c.turn === 0 && c.shown === 9, JSON.stringify({ b, c }));
    await ctx.close();
  }
  // motion turned off during the flight: it stops at once, at rest, every label shown
  {
    const { ctx, page } = await ctxPage(browser, { w: 390, h: 844 }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await takeoff(page); await page.waitForTimeout(700);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(400);
    const b = await page.evaluate(() => ({ running: window.__twan().filter((x) => x.playState === 'running').length, shown: window.__shown(), lod: document.querySelector('#home .tw-stage').classList.contains('lod') }));
    ok('map: turning off motion mid-flight stops it at rest', b.running === 0 && b.shown === 9 && !b.lod, JSON.stringify(b));
    await ctx.close();
  }
  // a reload further down the page (the browser restores the scroll): back at the top, the map is at rest, every label shown
  {
    const { ctx, page } = await ctxPage(browser, { w: 1440, h: 900 }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await page.evaluate(() => scrollTo({ top: 3000, behavior: 'instant' })); await page.waitForTimeout(300);
    await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(6500);
    const y = await page.evaluate(() => Math.round(scrollY));
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(600);
    const r = await flightState(page);
    ok('map: after a reload further down, the map is at rest at the top', y > 900 && r.flight === 0 && r.in && r.shown === 9, JSON.stringify({ y, ...r }));
    await ctx.close();
  }
  // a crossing of a breakpoint during the flight: the flight jumps to its end, labels on their towns
  {
    const { ctx, page } = await ctxPage(browser, { w: 1440, h: 900 }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await takeoff(page); await page.waitForTimeout(900);
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.waitForTimeout(150);
    await page.evaluate(TW);
    const r = await page.evaluate(() => { const an = window.__twan(); an.forEach((a) => a.pause()); const e = window.__tw.projErr(); an.forEach((a) => a.play()); return { e: e.worst, flight: an.filter((a) => a.effect.getTiming().iterations !== Infinity && a.playState !== 'finished').length }; });
    ok('map: a breakpoint crossed mid-flight ends the flight, labels on their towns', r.e <= 1 && r.flight === 0, JSON.stringify(r));
    await ctx.close();
  }
  // keyboard focus reaching the map during the flight: the map comes to rest at once and the focused label shows
  {
    const { ctx, page } = await ctxPage(browser, { w: 820, h: 1180 }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await takeoff(page); await page.waitForTimeout(500);
    await page.focus('.cine-copy .tw-links a:last-child');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
    await page.evaluate(TW);
    const r = await page.evaluate(() => { const a = document.activeElement, li = a.closest('.tw-pin'); return { town: li && li.dataset.town, op: li && getComputedStyle(li).opacity, flight: window.__twan().filter((x) => x.effect.getTiming().iterations !== Infinity && x.playState === 'running').length, proj: window.__tw.projErr().worst }; });
    ok('map: tabbing into it mid-flight shows the focused label at once, on its town', r.town === 'pawleys-island' && r.op === '1' && r.flight === 0 && r.proj <= 1, JSON.stringify(r));
    await ctx.close();
  }
  // on a slow link the flight waits for the basemap, up to 2.5s, with the map and the labels hidden
  {
    const { ctx, page } = await ctxPage(browser, { w: 1440, h: 900 }, twInit);
    await page.route(/\/media\/map\/strand-dark/, async (r) => { await new Promise((z) => setTimeout(z, 6000)); try { await r.continue(); } catch (e) {} });
    await page.goto(URL0, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const a = await flightState(page);
    await page.waitForTimeout(2000);
    const b = await flightState(page);
    ok('map: waits for the basemap with nothing shown, then flies after 2.5s at most', !a.in && a.flight === 0 && a.shown === 0 && b.flight > 0 && b.in, JSON.stringify(a) + ' then ' + JSON.stringify(b));
    await ctx.close();
  }
  // the page script never runs: the head boot's timer removes .m after 3s and the map shows at rest
  {
    const { ctx, page } = await ctxPage(browser, { w: 1440, h: 900 });
    await page.route(URL0, async (r) => { const res = await r.fetch(); const t = (await res.text()).replace(/<script>\s*\/\* Homepage (effects|map), 2026-09 redesign[\s\S]*?<\/script>/g, ''); r.fulfill({ response: res, body: t }); });
    await page.goto(URL0, { waitUntil: 'load' });
    const scripts = await page.evaluate(() => [...document.scripts].filter((s) => /Homepage (effects|map)/.test(s.textContent)).length);
    await page.waitForTimeout(7000);
    const r = await page.evaluate(() => ({ m: document.documentElement.classList.contains('m'), op: [...document.querySelectorAll('.tw-plane, .tw-pin, .tw-deco')].map((e) => getComputedStyle(e).opacity).filter((o) => o !== '1').length }));
    ok('map: with the page script gone, the map shows at rest after the 3s timer', scripts === 0 && !r.m && r.op === 0, JSON.stringify({ scripts, ...r }));
    await ctx.close();
  }
  {
    const { ctx, page } = await ctxPage(browser, { reduced: true });
    await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(600);
    const r = await page.evaluate(() => ({ an: document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.tw-stage') && !(a instanceof CSSAnimation) && !(a instanceof CSSTransition) && a.effect.getKeyframes().some((k) => k.transform)).length, op: [...document.querySelectorAll('.tw-plane, .tw-pin, .tw-deco')].map((e) => getComputedStyle(e).opacity).filter((o) => o !== '1').length }));
    ok('map, reduced motion: at rest from the start, everything shown', r.an === 0 && r.op === 0, JSON.stringify(r));
    await ctx.close();
  }
  // a browser without trigonometric CSS (Safari before 15.4, Chrome before 111): the map stays a picture, the towns are a
  // list under it, and nothing moves them. Emulated by swapping the two @supports blocks and making CSS.supports agree.
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page } = await ctxPage(browser, { w, h }, () => { const o = CSS.supports.bind(CSS); CSS.supports = function (a, b) { return /sin\(/.test(String(a) + String(b)) ? false : o.apply(null, arguments); }; });
    await page.route(URL0, async (r) => { const res = await r.fetch(); const t0 = await res.text(); const t1 = t0.replace(/@supports not \(width:calc\(1px \* sin\(1deg\)\)\)/g, '@supports (display:block)').replace(/@supports \(width:calc\(1px \* sin\(1deg\)\)\)/g, '@supports (display:nonsense)'); r.fulfill({ response: res, body: t1 }); });
    await page.goto(URL0, { waitUntil: 'load' });
    await page.waitForTimeout(3500);
    const r = await page.evaluate(() => {
      const a = [...document.querySelectorAll('.tw-pin a')].map((e) => e.getBoundingClientRect());
      const moved = document.getAnimations().filter((x) => x.effect && x.effect.target && x.effect.target.closest && x.effect.target.closest('.tw-pins')).length;
      const inside = a.every((b) => b.left >= 0 && b.right <= innerWidth + 0.5);
      let overlap = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i].left < a[j].right && a[j].left < a[i].right && a[i].top < a[j].bottom && a[j].top < a[i].bottom) overlap++;
      const scene = document.querySelector('.tw-scene').getBoundingClientRect(), words = [...document.querySelectorAll('.cine-copy > *')].map((e) => e.getBoundingClientRect());
      const below = a.every((b) => b.top >= scene.bottom - 1), clear = a.every((b) => words.every((c) => b.bottom <= c.top || b.top >= c.bottom || b.right <= c.left || b.left >= c.right));
      return { moved, inside, overlap, below, clear, sceneH: Math.round(scene.height), op: [...document.querySelectorAll('.tw-pin')].filter((e) => getComputedStyle(e).opacity !== '1').length };
    });
    ok(`map without CSS trig ${w}: towns are a still list under the map`, r.moved === 0 && r.inside && r.overlap === 0 && r.below && r.clear && r.sceneH > 300 && r.op === 0, JSON.stringify(r));
    await ctx.close();
  }
  {
    const { ctx, page } = await ctxPage(browser, { js: false });
    await page.goto(URL0, { waitUntil: 'load' });
    const r = await page.evaluate(() => ({ op: [...document.querySelectorAll('.tw-plane, .tw-pin, .tw-deco')].map((e) => getComputedStyle(e).opacity).filter((o) => o !== '1').length, t: getComputedStyle(document.querySelector('.tw-plane')).transform !== 'none' }));
    ok('map, no JavaScript: tilted, every pin shown', r.op === 0 && r.t, JSON.stringify(r));
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
  process.exitCode = f.length ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
