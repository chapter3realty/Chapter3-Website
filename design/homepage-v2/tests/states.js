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
      // three loops at 16x take about 3s when the decoder keeps up; under load it can take longer, so wait for the rest state
      await page.waitForFunction(() => !document.querySelector('#home').classList.contains('is-playing'), null, { timeout: 20000 }).catch(() => {});
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

  // 8. the towns map. At rest, at every width and through the whole slow turn: each label sits on its town, and no label
  // covers another label, a pin, a shield, a water name, the card, the pause button, the compass or the map data line,
  // even drawn 4.5% wider (Firefox draws DM Sans about 3.5% wider than Chromium and WebKit). Then while it moves.
  const TW = require('fs').readFileSync(__dirname + '/twlib.js', 'utf-8');
  // motion allowed, so the pause button shows; the map is far below the first screen, so nothing flies or turns
  for (const [w, h] of [[2560, 1440], [1920, 1080], [1920, 860], [1536, 730], [1440, 900], [1440, 790], [1381, 800], [1366, 768], [1280, 800], [1280, 720], [1159, 900], [1150, 769], [1130, 900], [1100, 800], [1099, 800], [1024, 768], [900, 1000], [899, 1000], [820, 1180], [768, 1024], [700, 900], [699, 900], [430, 932], [390, 844], [360, 740], [359, 640], [340, 700], [320, 568]]) {
    const { ctx, page } = await ctxPage(browser, { w, h });
    await page.goto(URL0, { waitUntil: 'load' });
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(TW);
    const r = await page.evaluate(() => {
      const T = window.__tw, [h0, h1] = T.heads(), all = new Set();
      for (let k = 0; k <= 6; k++) { T.setHead(h0 + (h1 - h0) * k / 6); T.problems(0.045).forEach((x) => all.add(x)); }
      document.querySelector('#towns').style.removeProperty('--h0');
      return { probs: [...all], proj: T.projErr(), n: document.querySelectorAll('.tw-pin a[href^="/submarkets/"]').length };
    });
    ok(`map ${w}: nine town links`, r.n === 9, String(r.n));
    ok(`map ${w}: labels clear through the turn`, r.probs.length === 0, r.probs.slice(0, 4).join('; '));
    ok(`map ${w}: labels on their towns`, r.proj.worst <= 1, r.proj.worst + 'px ' + r.proj.who);
    await ctx.close();
  }
  // the map in motion. __twan lists the map's own transform animations (the flight and the turn), not CSS ones.
  const twInit = () => { window.__twan = () => document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.tw-stage') && !(a instanceof CSSAnimation) && !(a instanceof CSSTransition) && a.effect.getKeyframes().some((k) => k.transform)); window.__shown = () => [...document.querySelectorAll('.tw-pin')].filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.05).length; };
  const flightState = (page) => page.evaluate(() => { const an = window.__twan(); return { flight: an.filter((a) => a.effect.getTiming().iterations !== Infinity && a.playState === 'running').length, turn: an.filter((a) => a.effect.getTiming().iterations === Infinity && a.playState === 'running').length, shown: window.__shown(), pre: document.querySelector('.tw-stage').classList.contains('pre') }; });
  const imgReady = (page) => page.evaluate(async () => { const i = document.querySelector('.tw-plane img'); i.loading = 'eager'; if (!(i.complete && i.naturalWidth)) await new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }); });
  const centreMap = (page) => page.evaluate(() => { const r = document.querySelector('.tw-stage').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - Math.max(0, (innerHeight - r.height) / 2), behavior: 'instant' }); });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page, errs } = await ctxPage(browser, { w, h }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await imgReady(page);
    // two steps, as a visitor scrolls: first the map comes within reach and the camera goes overhead, with every label
    // hidden at once; a while later the map scrolls into view and the flight starts with no label showing yet
    await page.evaluate(() => { const r = document.querySelector('.tw-stage').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - innerHeight * 1.3, behavior: 'instant' }); });
    await page.waitForTimeout(250);
    const pre = await flightState(page);
    ok(`map ${w}: overhead before it comes into view, labels hidden at once`, pre.pre && pre.shown === 0, JSON.stringify(pre));
    await page.waitForTimeout(1600);
    await centreMap(page);
    await page.waitForTimeout(100);
    const f100 = await flightState(page);
    await page.waitForTimeout(300);
    const f400 = await flightState(page);
    ok(`map ${w}: the flight starts with no label shown`, f100.flight > 0 && f100.shown === 0 && !f100.pre, JSON.stringify(f100));
    ok(`map ${w}: the flight is still running at +400ms`, f400.flight > 0, JSON.stringify(f400));
    const worst = [], mv = [];
    for (const t of [400, 1600, 3200, 7000]) {
      await page.waitForTimeout(t - (worst.length ? [400, 1600, 3200, 7000][worst.length - 1] : 0));
      await page.evaluate(TW);
      const r = await page.evaluate(() => {
        const an = window.__twan(), running = an.filter((a) => a.playState === 'running').length;
        an.forEach((a) => a.pause()); const e = window.__tw.projErr(); an.forEach((a) => a.play());
        return { e: e.worst, running };
      });
      worst.push(r.e); mv.push(r.running);
    }
    ok(`map ${w}: labels stay on their towns while it moves`, Math.max(...worst) <= 1, worst.join(', ') + 'px');
    const movers = await page.evaluate(() => [...document.querySelectorAll('.tw-plane, .tw-pt, .tw-deco .wl i, .tw-compass i')].filter((e) => e.getClientRects().length).length);
    ok(`map ${w}: flight then turn move every drawn element`, mv.every((n) => n === movers), mv.join(', ') + ' of ' + movers);
    const landed = await flightState(page);
    ok(`map ${w}: after the flight, the slow turn runs`, landed.flight === 0 && landed.turn === movers && landed.shown === 9, JSON.stringify(landed));
    // a resize that keeps the camera (a phone's address bar, a window made taller) leaves the turn running where it was.
    // Taller, because a desktop window under 881px tall has its own camera
    const t0 = await page.evaluate(() => { const a = window.__twan().find((x) => x.effect.getTiming().iterations === Infinity); window.__turn0 = a; return a.currentTime; });
    await page.setViewportSize({ width: w, height: h + 60 });
    await page.waitForTimeout(400);
    const t1 = await page.evaluate(() => ({ same: window.__twan().includes(window.__turn0), t: window.__turn0.currentTime, state: window.__turn0.playState }));
    ok(`map ${w}: a height-only resize keeps the turn going`, t1.same && t1.state === 'running' && t1.t > t0, `t ${Math.round(t0)} -> ${Math.round(t1.t)} ${t1.state} same=${t1.same}`);
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(300);
    // the pause button stops the turn and starts it again
    const btn = await page.evaluate(() => { const b = document.querySelector('.tw-rot'), r = b.getBoundingClientRect(); return { shown: !b.hidden && r.width === 44, label: b.getAttribute('aria-label') }; });
    ok(`map ${w}: pause button shown`, btn.shown && btn.label === 'Pause the map', JSON.stringify(btn));
    await page.click('.tw-rot');
    await page.waitForTimeout(200);
    const p1 = await page.evaluate(() => ({ states: [...new Set(window.__twan().map((a) => a.playState))], label: document.querySelector('.tw-rot').getAttribute('aria-label'), play: getComputedStyle(document.querySelector('.tw-rot .i-play')).display, pause: getComputedStyle(document.querySelector('.tw-rot .i-pause')).display }));
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);
    const p1b = await page.evaluate(() => [...new Set(window.__twan().map((a) => a.playState))]);
    ok(`map ${w}: pause button stops the turn, and stays stopped`, p1.states.join() === 'paused' && p1b.join() === 'paused' && p1.label === 'Play the map' && p1.play === 'block' && p1.pause === 'none', JSON.stringify(p1) + ' then ' + p1b.join());
    await page.click('.tw-rot');
    await page.waitForTimeout(200);
    const p2 = await page.evaluate(() => ({ states: [...new Set(window.__twan().map((a) => a.playState))], label: document.querySelector('.tw-rot').getAttribute('aria-label') }));
    ok(`map ${w}: pause button starts it again`, p2.states.join() === 'running' && p2.label === 'Pause the map', JSON.stringify(p2));
    if (w > 430) {
      // the pointer on the map's background does not hold the turn; on a town label it does
      const bg = await page.evaluate(() => { const s = document.querySelector('.tw-stage').getBoundingClientRect(); return [s.left + s.width * 0.9, s.top + 40]; });
      await page.mouse.move(bg[0], bg[1]);
      await page.waitForTimeout(300);
      const free = await page.evaluate(() => [...new Set(window.__twan().map((a) => a.playState))]);
      ok('map: keeps turning with the pointer on the map background', free.join() === 'running', free.join());
      const mb = await page.evaluate(() => { const r = document.querySelector('.tw-pin[data-town=myrtle-beach] a').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await page.mouse.move(mb[0], mb[1]);
      await page.waitForTimeout(300);
      const held = await page.evaluate(() => window.__twan().map((a) => a.playState));
      ok('map: holds still with the pointer on a town label', held.length > 20 && held.every((s) => s === 'paused'), [...new Set(held)].join());
      // keyboard focus on a label holds it too, and the mouse leaving does not release it
      await page.focus('.tw-pin[data-town=conway] a');
      await page.mouse.move(bg[0], bg[1]);
      await page.waitForTimeout(300);
      const fh = await page.evaluate(() => [...new Set(window.__twan().map((a) => a.playState))]);
      ok('map: focus on a label holds the turn after the mouse leaves', fh.join() === 'paused', fh.join());
      await page.evaluate(() => document.activeElement.blur());
      await page.mouse.move(2, 2);
      await page.waitForTimeout(300);
      // a resize across a breakpoint: the turn restarts at once with the new camera, labels on their towns
      await page.setViewportSize({ width: 1000, height: h });
      await page.waitForTimeout(120);
      await page.evaluate(TW);
      const bp = await page.evaluate(() => { const an = window.__twan(); an.forEach((a) => a.pause()); const e = window.__tw.projErr(); an.forEach((a) => a.play()); return e.worst; });
      ok('map: after crossing a breakpoint, labels on their towns within a frame', bp <= 1, bp + 'px');
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(300);
    }
    await page.evaluate(() => scrollTo({ top: document.querySelector('#faq').getBoundingClientRect().top + scrollY + 600, behavior: 'instant' }));
    await page.waitForTimeout(400);
    const off = await page.evaluate(() => window.__twan().map((a) => a.playState));
    ok(`map ${w}: stops turning off screen`, off.every((s) => s !== 'running'), [...new Set(off)].join());
    ok(`map ${w}: no script errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  // a jump straight to the map (a link, a reload with the scroll restored): both observers report in one frame. The flight
  // must still play, with no label showing at its start. Five fresh loads, because this used to go either way.
  {
    let flew = 0; const seen = [];
    for (let k = 0; k < 5; k++) {
      const { ctx, page } = await ctxPage(browser, { w: 1440, h: 900 }, twInit);
      await page.goto(URL0, { waitUntil: 'load' });
      await imgReady(page);
      await centreMap(page);
      await page.waitForTimeout(100);
      const f = await flightState(page);
      if (f.flight > 0 && f.shown === 0) flew++;
      seen.push(`${f.flight}/${f.shown}`);
      await ctx.close();
    }
    ok('map: a jump to the map still flies in, labels hidden at its start', flew === 5, seen.join(' '));
  }
  // a crossing of a breakpoint during the flight: the flight jumps to its end, labels on their towns
  {
    const { ctx, page } = await ctxPage(browser, { w: 1440, h: 900 }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await imgReady(page);
    await centreMap(page);
    await page.waitForTimeout(900);
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.waitForTimeout(150);
    await page.evaluate(TW);
    const r = await page.evaluate(() => { const an = window.__twan(); an.forEach((a) => a.pause()); const e = window.__tw.projErr(); an.forEach((a) => a.play()); return { e: e.worst, flight: an.filter((a) => a.effect.getTiming().iterations !== Infinity && a.playState !== 'finished').length }; });
    ok('map: a breakpoint crossed mid-flight ends the flight, labels on their towns', r.e <= 1 && r.flight === 0, JSON.stringify(r));
    await ctx.close();
  }
  // keyboard focus reaching the map while it waits overhead: the map comes to rest at once and the label shows
  {
    const { ctx, page } = await ctxPage(browser, { w: 820, h: 1180 }, twInit);
    await page.goto(URL0, { waitUntil: 'load' });
    await imgReady(page);
    await page.evaluate(() => { const r = document.querySelector('.tw-stage').getBoundingClientRect(); scrollTo({ top: r.top + scrollY - innerHeight * 0.95, behavior: 'instant' }); });
    await page.waitForTimeout(300);
    await page.focus('#towns .tw-links a:last-child');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
    await page.evaluate(TW);
    const r = await page.evaluate(() => { const a = document.activeElement, li = a.closest('.tw-pin'); return { town: li && li.dataset.town, op: li && getComputedStyle(li).opacity, pre: document.querySelector('.tw-stage').classList.contains('pre'), flight: window.__twan().filter((x) => x.effect.getTiming().iterations !== Infinity && x.playState === 'running').length, proj: window.__tw.projErr().worst }; });
    ok('map: tabbing into it shows the focused label at once, on its town', r.town === 'pawleys-island' && r.op === '1' && !r.pre && r.flight === 0 && r.proj <= 1, JSON.stringify(r));
    await ctx.close();
  }
  // on a slow link the flight waits for the map image, up to 1.5s, overhead with the labels hidden
  {
    const { ctx, page } = await ctxPage(browser, { w: 1440, h: 900 }, twInit);
    await page.route(/\/media\/map\/strand-dark/, async (r) => { await new Promise((z) => setTimeout(z, 6000)); try { await r.continue(); } catch (e) {} });
    await page.goto(URL0, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await centreMap(page);
    await page.waitForTimeout(700);
    const a = await flightState(page);
    await page.waitForTimeout(1200);
    const b = await flightState(page);
    ok('map: waits overhead for the map image, then flies after 1.5s at most', a.pre && a.flight === 0 && a.shown === 0 && b.flight > 0 && !b.pre, JSON.stringify(a) + ' then ' + JSON.stringify(b));
    await ctx.close();
  }
  {
    const { ctx, page } = await ctxPage(browser, { reduced: true });
    await page.goto(URL0, { waitUntil: 'load' }); await scrollAll(page);
    await page.evaluate(() => { const r = document.querySelector('.tw-stage').getBoundingClientRect(); scrollTo({ top: r.top + scrollY, behavior: 'instant' }); });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({ an: document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.tw-stage') && !(a instanceof CSSAnimation) && !(a instanceof CSSTransition) && a.effect.getKeyframes().some((k) => k.transform)).length, op: [...document.querySelectorAll('.tw-pin, .tw-deco, .tw-ctl')].map((e) => getComputedStyle(e).opacity).filter((o) => o !== '1').length, btn: getComputedStyle(document.querySelector('.tw-rot')).display }));
    ok('map, reduced motion: at rest, everything shown, no pause button', r.an === 0 && r.op === 0 && r.btn === 'none', JSON.stringify(r));
    await ctx.close();
  }
  // a browser without trigonometric CSS (Safari before 15.4, Chrome before 111): the map stays a picture, the towns are a
  // list under it, and nothing moves them. Emulated by swapping the two @supports blocks and making CSS.supports agree.
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page } = await ctxPage(browser, { w, h }, () => { const o = CSS.supports.bind(CSS); CSS.supports = function (a, b) { return /sin\(/.test(String(a) + String(b)) ? false : o.apply(null, arguments); }; });
    await page.route(URL0, async (r) => { const res = await r.fetch(); const t0 = await res.text(); const t1 = t0.replace(/@supports not \(width:calc\(1px \* sin\(1deg\)\)\)/g, '@supports (display:block)').replace(/@supports \(width:calc\(1px \* sin\(1deg\)\)\)/g, '@supports (display:nonsense)'); r.fulfill({ response: res, body: t1 }); });
    await page.goto(URL0, { waitUntil: 'load' });
    await page.evaluate(() => { const r = document.querySelector('#towns').getBoundingClientRect(); scrollTo({ top: r.top + scrollY, behavior: 'instant' }); });
    await page.waitForTimeout(3500);
    const r = await page.evaluate(() => {
      const a = [...document.querySelectorAll('.tw-pin a')].map((e) => e.getBoundingClientRect());
      const moved = document.getAnimations().filter((x) => x.effect && x.effect.target && x.effect.target.closest && x.effect.target.closest('.tw-pins')).length;
      const inside = a.every((b) => b.left >= 0 && b.right <= innerWidth + 0.5);
      let overlap = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i].left < a[j].right && a[j].left < a[i].right && a[i].top < a[j].bottom && a[j].top < a[i].bottom) overlap++;
      const below = a.every((b) => b.top >= document.querySelector('.tw-scene').getBoundingClientRect().bottom - 1);
      return { moved, inside, overlap, below, op: [...document.querySelectorAll('.tw-pin')].filter((e) => getComputedStyle(e).opacity !== '1').length };
    });
    ok(`map without CSS trig ${w}: towns are a still list under the map`, r.moved === 0 && r.inside && r.overlap === 0 && r.below && r.op === 0, JSON.stringify(r));
    await ctx.close();
  }
  {
    const { ctx, page } = await ctxPage(browser, { js: false });
    await page.goto(URL0, { waitUntil: 'load' });
    const r = await page.evaluate(() => ({ op: [...document.querySelectorAll('.tw-pin, .tw-deco, .tw-ctl')].map((e) => getComputedStyle(e).opacity).filter((o) => o !== '1').length, t: getComputedStyle(document.querySelector('.tw-plane')).transform !== 'none', btn: getComputedStyle(document.querySelector('.tw-rot')).display }));
    ok('map, no JavaScript: tilted, every pin shown, no pause button', r.op === 0 && r.t && r.btn === 'none', JSON.stringify(r));
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
