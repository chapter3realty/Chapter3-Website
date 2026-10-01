// The homepage map once it has landed, the town cards, and the scroll moments. node after.js <url>. Exits 1 on a failure.
//   the turn: runs between --h0 and --h1, labels on their towns and clear of each other all the way; waits while a label is
//     hovered or the map is off screen; stops for good, where it is, on keyboard focus, a click, a tap or a drag (WCAG 2.2.2)
//   the drag: turns the map, never past either end, the page still scrolls on a phone, a drag never follows a link
//   the cards: each town's facts match data/towns.json and data/str-market.json, the card never covers its own label or
//     the words, it can be hovered, Escape closes it, a tap opens it and a second tap follows the link
//   the scroll moments: nothing hidden, never a sideways scroll, nothing with reduced motion
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const URL0 = process.argv[2] || 'http://localhost:8124/';
const HP = path.join(__dirname, '..'), REPO = path.join(HP, '..', '..');
const towns = JSON.parse(fs.readFileSync(path.join(HP, 'data', 'towns.json'), 'utf-8'));
const str = JSON.parse(fs.readFileSync(path.join(REPO, 'data', 'str-market.json'), 'utf-8'));
const TW = fs.readFileSync(path.join(__dirname, 'twlib.js'), 'utf-8');
const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };
const usd = (n) => '$' + Number(n).toLocaleString('en-US');

async function open(browser, { w = 1440, h = 900, reduced = false, touch = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.addInitScript(() => {
    try { localStorage.c3PopDone = 1; } catch (e) {}
    // the turn's animations: the map's own endless transform keyframes
    window.__turn = () => document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.tw-stage') && !(a instanceof CSSAnimation) && !(a instanceof CSSTransition) && a.effect.getTiming().iterations === Infinity);
  });
  await page.goto(URL0, { waitUntil: 'load' });
  return { ctx, page, errs };
}
const settle = (page) => page.waitForFunction(() => [...document.querySelectorAll('.tw-pin')].every((e) => getComputedStyle(e).opacity === '1') && document.querySelector('.tw-stage').classList.contains('turnable'), null, { timeout: 15000 });
const turnState = (page) => page.evaluate(() => { const t = window.__turn(); return { n: t.length, running: t.filter((a) => a.playState === 'running').length, paused: t.filter((a) => a.playState === 'paused').length }; });
// the heading the plane shows, from its transform: rotateX(t) then rotateZ(h) puts -sin(h) in m21 and cos(h) in m11
const heading = (page) => page.evaluate(() => { const m = new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.tw-plane')).transform); return +(Math.atan2(-m.m21, m.m11) * 180 / Math.PI).toFixed(3); });
const range = (page) => page.evaluate(() => { const cs = getComputedStyle(document.querySelector('#home')); return [parseFloat(cs.getPropertyValue('--h0')), parseFloat(cs.getPropertyValue('--h1'))]; });
// labels on their towns and clear of everything, at the heading shown now (the turn paused while measuring)
const geometry = (page) => page.evaluate((lib) => {
  (0, eval)(lib);
  const t = window.__turn(); const was = t.map((a) => a.playState); t.forEach((a) => a.pause());
  const r = { proj: window.__tw.projErr(), probs: window.__tw.problems(0) };
  t.forEach((a, i) => { if (was[i] === 'running') a.play(); });
  return r;
}, TW);
const mapSpot = async (page, fx, fy) => { const b = await (await page.$('#home .tw-stage')).boundingBox(); return [b.x + b.width * fx, b.y + b.height * fy]; };
// a spot on the map clear of every label, the card and the words, from the right half of the stage
const blank = (page, fx0 = .95) => page.evaluate((fx0) => {
  const st = document.querySelector('#home .tw-stage').getBoundingClientRect();
  const busy = [...document.querySelectorAll('.tw-pin a, .tw-card.on, .cine-copy > *, .tw-deco b, .tw-deco i')].map((e) => e.getBoundingClientRect()).filter((r) => r.width);
  for (let fy = .2; fy < .95; fy += .05) for (let fx = fx0; fx > .5; fx -= .05) {
    const x = st.left + st.width * fx, y = st.top + st.height * fy;
    if (!busy.some((r) => x > r.left - 40 && x < r.right + 40 && y > r.top - 30 && y < r.bottom + 30)) return [x, y];
  }
  return [st.left + st.width * .9, st.top + st.height * .9];
}, fx0);
async function swipe(page, x0, y0, x1, y1, steps = 12) {
  const c = await page.context().newCDPSession(page);
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] });
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps, id: 1 }] }); await page.waitForTimeout(16); }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await c.detach();
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  // ---- the turn -------------------------------------------------------------------------------------------------------
  for (const [w, h] of [[1440, 900], [1280, 700], [1000, 900], [390, 844]]) {
    const { ctx, page, errs } = await open(browser, { w, h });
    await settle(page); await page.waitForTimeout(400);
    const [h0, h1] = await range(page);
    const t = await page.evaluate(() => { const a = window.__turn().find((x) => x.effect.target.classList.contains('tw-plane')); if (!a) return null; const k = a.effect.getKeyframes(), tm = a.effect.getTiming(); const z = (s) => +(/rotateZ\(([-\d.]+)deg\)/.exec(s.transform) || [])[1]; return { from: z(k[0]), to: z(k[k.length - 1]), dur: tm.duration, dir: tm.direction, ease: tm.easing }; });
    const s0 = await turnState(page);
    ok(`turn ${w}x${h}: after the landing the map turns from --h0 to --h1 and back, 12s each way, every drawn element`, t && t.from === h0 && t.to === h1 && t.dur === 12000 && t.dir === 'alternate' && s0.running === s0.n && s0.n > 15, JSON.stringify({ h0, h1, t, s0 }));
    // over the turn: sample it at several moments
    const hs = [], worst = [], probs = new Set();
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(i ? 2100 : 0);
      hs.push(await heading(page)); const g = await geometry(page); worst.push(g.proj.worst); g.probs.forEach((p) => probs.add(p));
    }
    const lo = Math.min(h0, h1) - .05, hi = Math.max(h0, h1) + .05;
    ok(`turn ${w}x${h}: it moves, between the two headings only`, new Set(hs.map((x) => x.toFixed(1))).size >= 4 && hs.every((x) => x >= lo && x <= hi), hs.join(', '));
    ok(`turn ${w}x${h}: labels on their towns and clear of everything while it turns`, Math.max(...worst) <= 1.5 && probs.size === 0, worst.join(', ') + 'px ' + [...probs].slice(0, 3).join('; '));
    ok(`turn ${w}x${h}: no script errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  // it waits while a label is under the pointer, and while the map is off screen; it turns again after
  {
    const { ctx, page } = await open(browser, { w: 1440, h: 900 });
    await settle(page);
    const a = await (await page.$('.tw-pin[data-town=conway] a')).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.waitForTimeout(400);
    const hov = await turnState(page);
    const [bx, by] = await blank(page);
    await page.mouse.move(bx, by); await page.waitForTimeout(900);
    const off0 = await turnState(page);
    await page.evaluate(() => scrollTo({ top: 1800, behavior: 'instant' })); await page.waitForTimeout(400);
    const off = await turnState(page);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(400);
    const back = await turnState(page);
    ok('turn: waits while a town label is hovered, turns again after', hov.paused === hov.n && hov.n > 0 && off0.running === off0.n, JSON.stringify({ hov, off0 }));
    ok('turn: waits while the map is off screen, turns again when it is back', off.paused === off.n && off.n > 0 && back.running === back.n, JSON.stringify({ off, back }));
    await ctx.close();
  }
  // keyboard focus, a click, a tap: it stops for good where it is, with no jump
  for (const how of ['focus', 'click', 'tap']) {
    const { ctx, page } = await open(browser, how === 'tap' ? { w: 390, h: 844, touch: true } : { w: 1440, h: 900 });
    await settle(page); await page.waitForTimeout(1500);
    const pos = () => page.evaluate(() => [...document.querySelectorAll('.tw-pin')].map((li) => { const r = li.getBoundingClientRect(); return [r.left, r.top]; }));
    const before = await pos();
    if (how === 'focus') await page.keyboard.press('Tab').then(() => page.evaluate(() => document.querySelector('.tw-pin a').focus()));
    else { const [x, y] = await blank(page); if (how === 'click') await page.mouse.click(x, y); else await page.touchscreen.tap(x, y); }
    await page.waitForTimeout(50);
    const after = await pos();
    const jump = Math.max(...before.map((p, i) => Math.hypot(p[0] - after[i][0], p[1] - after[i][1])));
    await page.waitForTimeout(2500);
    const later = await pos(), st = await turnState(page), g = await geometry(page);
    const moved = Math.max(...after.map((p, i) => Math.hypot(p[0] - later[i][0], p[1] - later[i][1])));
    ok(`turn: ${how === 'focus' ? 'keyboard focus in the map' : how === 'click' ? 'a click on the map' : 'a tap on the map'} stops it for good, where it is`, st.n === 0 && jump < 4 && moved < .5 && g.proj.worst <= 1.5 && g.probs.length === 0, JSON.stringify({ st, jump: +jump.toFixed(2), moved: +moved.toFixed(2), proj: g.proj.worst, probs: g.probs.length }));
    await ctx.close();
  }
  // no motion allowed: no turn, but the visitor can still turn the map
  {
    const { ctx, page } = await open(browser, { w: 1440, h: 900, reduced: true });
    await page.waitForTimeout(1500);
    const st = await turnState(page), grab = await page.evaluate(() => document.querySelector('.tw-stage').classList.contains('turnable'));
    ok('turn, reduced motion: never starts; the map can still be turned by hand', st.n === 0 && grab, JSON.stringify({ st, grab }));
    await ctx.close();
  }

  // ---- the drag -------------------------------------------------------------------------------------------------------
  {
    const { ctx, page, errs } = await open(browser, { w: 1440, h: 900 });
    await settle(page);
    const [h0, h1] = await range(page), lo = Math.min(h0, h1) - .05, hi = Math.max(h0, h1) + .05;
    // from mid-map, so every move stays inside the window (a pointer outside it is ignored: Firefox reports it at x 0)
    const [x0, y0] = await blank(page, .75);
    const seen = [];
    await page.mouse.move(x0, y0); await page.mouse.down();
    let x = x0;
    for (const [n, dx] of [[16, -15], [32, 15], [16, -15]]) for (let i = 1; i <= n; i++) { x += dx; await page.mouse.move(x, y0); if (i % 4 === 0) seen.push(await heading(page)); }
    const mid = await page.evaluate(() => document.querySelector('.tw-stage').classList.contains('dragging'));
    await page.mouse.up(); await page.waitForTimeout(1500);
    seen.push(await heading(page));
    const st = await turnState(page), g = await geometry(page);
    ok('drag 1440: a sideways drag turns the map, never past either end', mid && new Set(seen.map((x) => x.toFixed(1))).size >= 5 && seen.every((x) => x >= lo && x <= hi) && Math.max(...seen) - Math.min(...seen) > (hi - lo) * .6, seen.join(', ') + ` in [${h0}, ${h1}]`);
    ok('drag 1440: the turn stops for good; labels on their towns and clear of everything where it is let go', st.n === 0 && g.proj.worst <= 1.5 && g.probs.length === 0, JSON.stringify({ st, proj: g.proj.worst, probs: g.probs.slice(0, 3) }));
    // a breakpoint crossed after a drag: the map keeps its place in the range, labels on their towns
    const f0 = (seen[seen.length - 1] - h0) / (h1 - h0);
    await page.setViewportSize({ width: 1000, height: 900 }); await page.waitForTimeout(300);
    const [k0, k1] = await range(page), hh = await heading(page), g2 = await geometry(page);
    ok('drag: after a breakpoint, the map keeps its place in the range, labels on their towns', Math.abs((hh - k0) / (k1 - k0) - f0) < .03 && g2.proj.worst <= 1.5 && g2.probs.length === 0, JSON.stringify({ f0: +f0.toFixed(3), f1: +((hh - k0) / (k1 - k0)).toFixed(3), proj: g2.proj.worst, probs: g2.probs.slice(0, 3) }));
    ok('drag: no script errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  // a drag that starts on a label turns the map and does not follow the link
  {
    const { ctx, page } = await open(browser, { w: 1440, h: 900 });
    await settle(page);
    const a = await (await page.$('.tw-pin[data-town=myrtle-beach] a')).boundingBox(), h = await heading(page);
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(a.x + a.width / 2 - i * 15, a.y + a.height / 2);
    await page.mouse.up(); await page.waitForTimeout(800);
    ok('drag: a drag that starts on a label turns the map and stays on the page', new URL(page.url()).pathname === '/' && Math.abs((await heading(page)) - h) > .5, page.url());
    await ctx.close();
  }
  // a phone: a sideways swipe turns the map and the page stays; an up-and-down swipe scrolls the page and the map stays
  {
    const { ctx, page } = await open(browser, { w: 390, h: 844, touch: true });
    await settle(page);
    const [x, y] = await blank(page);
    // one way and then the other: at either end of its range the map does not turn further that way
    const h = await heading(page), y0 = await page.evaluate(() => scrollY);
    await swipe(page, x - 160, y, x, y); await page.waitForTimeout(700);
    const ha = await heading(page);
    await swipe(page, x, y, x - 160, y); await page.waitForTimeout(700);
    const hb = await heading(page), y1 = await page.evaluate(() => scrollY);
    const h2 = Math.abs(ha - h) > Math.abs(hb - ha) ? ha : hb;
    await swipe(page, x - 40, y + 60, x - 40, y - 240);
    await page.waitForTimeout(900);
    const h3 = await heading(page), y2 = await page.evaluate(() => scrollY);
    ok('drag 390: a sideways swipe turns the map, the page stays', Math.abs(ha - h) > .5 || Math.abs(hb - ha) > .5 && Math.abs(y1 - y0) < 2, JSON.stringify({ h, ha, hb, y0, y1 }));
    ok('drag 390: an up-and-down swipe scrolls the page, the map stays', y2 - y1 > 100 && Math.abs(h3 - hb) < .3, JSON.stringify({ hb, h3, y1, y2 }));
    await ctx.close();
  }

  // ---- the town cards -------------------------------------------------------------------------------------------------
  const want = (slug) => {
    const z = towns.towns[slug], m = (str.markets || []).find((x) => x.slug === slug);
    return { value: usd(z.value), yoy: `${z.yoy < 0 ? 'Down' : 'Up'} ${Math.abs(z.yoy).toFixed(1)}% in a year`, ten: `${z.tenYear < 0 ? 'Down' : 'Up'} ${Math.abs(z.tenYear)}% since ${towns.startName.split(' ')[1]}`,
      zip: z.region.type === 'zip' ? z.region.name : '', str: m ? `${usd(m.adr)} a night, ${m.occupancy}% of nights booked` : '' };
  };
  const cardAt = (page, slug) => page.evaluate((slug) => {
    const c = document.querySelector('.tw-card'), st = document.querySelector('#home').getBoundingClientRect(), cr = c.getBoundingClientRect();
    const box = (r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom });
    const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
    const C = box(cr), own = box(document.querySelector(`.tw-pin[data-town=${slug}] a`).getBoundingClientRect());
    // the words over the map (a narrow screen's sub-header and links sit under the map, and a card may cover those)
    const S = document.querySelector('#home .tw-stage').getBoundingClientRect();
    const words = [...document.querySelectorAll('.cine-copy > *')].map((e) => e.getBoundingClientRect()).filter((r) => r.height && r.bottom > S.top && r.top < S.bottom).map(box);
    // another town is hidden when the card covers its pin or more than 60% of its label
    const others = [...document.querySelectorAll('.tw-pin')].filter((li) => li.dataset.town !== slug).filter((li) => {
      const r = box(li.querySelector('a').getBoundingClientRect()), p = li.getBoundingClientRect();
      const f = Math.max(0, Math.min(C.r, r.r) - Math.max(C.l, r.l)) * Math.max(0, Math.min(C.b, r.b) - Math.max(C.t, r.t)) / ((r.r - r.l) * (r.b - r.t));
      return f > .6 || (p.left > C.l && p.left < C.r && p.top > C.t && p.top < C.b);
    }).map((li) => li.dataset.town);
    return { on: c.classList.contains('on') && getComputedStyle(c).visibility === 'visible', text: c.innerText.replace(/\s+/g, ' '), inside: cr.left >= st.left - .5 && cr.right <= st.right + .5 && cr.top >= st.top - .5 && cr.bottom <= st.bottom + .5,
      own: hit(C, own), words: words.some((x) => hit(C, x)), others, hidden: c.getAttribute('aria-hidden'), focusables: [...c.querySelectorAll('a,button,input,[tabindex]')].filter((e) => e.tabIndex >= 0).length,
      link: (c.querySelector('a.tc-n') || {}).pathname === `/submarkets/${slug}/` };
  }, slug);
  for (const [w, h] of [[1440, 900], [1280, 700], [1000, 900], [768, 1024], [390, 844]]) {
    const touch = w <= 430;
    const { ctx, page, errs } = await open(browser, { w, h, touch });
    await settle(page);
    let bad = [], covers = [];
    for (const slug of Object.keys(towns.towns)) {
      await page.$eval(`.tw-pin[data-town=${slug}] a`, (e) => { const r = e.getBoundingClientRect(); if (r.top < 90 || r.bottom > innerHeight - 10) scrollBy({ top: r.top - innerHeight / 2, behavior: 'instant' }); });
      await page.waitForTimeout(150);
      const a = await (await page.$(`.tw-pin[data-town=${slug}] a`)).boundingBox();
      if (touch) await page.touchscreen.tap(a.x + a.width / 2, a.y + a.height / 2); else await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
      await page.waitForTimeout(500);
      const r = await cardAt(page, slug), x = want(slug), name = await page.$eval(`.tw-pin[data-town=${slug}] a`, (e) => e.textContent);
      const facts = r.text.includes(name) && r.text.includes(x.value) && r.text.includes(x.yoy) && r.text.includes(x.ten) && (x.zip ? r.text.includes('ZIP ' + x.zip) : !/ZIP/.test(r.text)) && (x.str ? r.text.includes(x.str) : !/Short-term/i.test(r.text));
      if (!r.on || !facts || !r.link || !r.inside || r.own || r.words || r.hidden !== 'true' || r.focusables) bad.push(slug + ' ' + JSON.stringify({ on: r.on, facts, inside: r.inside, own: r.own, words: r.words, text: facts ? '' : r.text.slice(0, 160) }));
      if (r.others.length) covers.push(slug + ':' + r.others.join('+'));
      if (touch) { const [bx, by] = await blank(page); await page.touchscreen.tap(bx, by); } else { const [bx, by] = await blank(page); await page.mouse.move(bx, by); }
      await page.waitForTimeout(450);
    }
    ok(`cards ${w}x${h}: each town's card shows its own facts, inside the hero, never over its label or the words over the map`, bad.length === 0, bad.join(' | '));
    ok(`cards ${w}x${h}: a card hides no other town (its pin, or most of its label)`, w < 1000 || covers.length === 0, covers.join(', ') || 'none');
    ok(`cards ${w}x${h}: no script errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  // hoverable (WCAG 1.4.13): the pointer can move onto the card; leaving it closes it; Escape closes it
  {
    const { ctx, page } = await open(browser, { w: 1440, h: 900 });
    await settle(page);
    const a = await (await page.$('.tw-pin[data-town=myrtle-beach] a')).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.waitForTimeout(500);
    const c = await (await page.$('.tw-card')).boundingBox();
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 12 }); await page.waitForTimeout(700);
    const stay = await page.evaluate(() => document.querySelector('.tw-card').classList.contains('on'));
    const [bx, by] = await blank(page);
    await page.mouse.move(bx, by); await page.waitForTimeout(600);
    const gone = await page.evaluate(() => !document.querySelector('.tw-card').classList.contains('on'));
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    const esc = await page.evaluate(() => !document.querySelector('.tw-card').classList.contains('on'));
    ok('cards: the pointer can move onto the card, leaving closes it, Escape closes it', stay && gone && esc, JSON.stringify({ stay, gone, esc }));
    await ctx.close();
  }
  // keyboard: focus on a label opens its card; the label's description carries the same facts; leaving the map closes it
  {
    const { ctx, page } = await open(browser, { w: 1440, h: 900 });
    await settle(page);
    const r = await page.evaluate(() => {
      const out = [];
      for (const a of document.querySelectorAll('.tw-pin a')) {
        a.focus();
        const d = document.getElementById(a.getAttribute('aria-describedby')), c = document.querySelector('.tw-card');
        out.push({ slug: a.parentNode.dataset.town, on: c.classList.contains('on'), name: !!c.querySelector('.tc-n') && c.querySelector('.tc-n').firstChild.textContent.trim() === a.textContent, desc: d ? d.textContent : '' });
      }
      document.activeElement.blur();
      return { out, after: document.querySelector('.tw-card').classList.contains('on') };
    });
    const bad = r.out.filter((o) => { const x = want(o.slug); return !o.on || !o.name || !o.desc.includes(x.value) || !o.desc.includes(x.yoy.toLowerCase()) || (x.str && !o.desc.includes(`${usd((str.markets.find((m) => m.slug === o.slug)).adr)} a night`)); });
    ok('cards, keyboard: focus opens each town\'s card, its description carries the facts, leaving closes it', bad.length === 0 && !r.after, JSON.stringify(bad.slice(0, 2)) + ' after=' + r.after);
    await ctx.close();
  }
  // touch: the first tap opens the card and stays on the page; the second follows the link
  {
    const { ctx, page } = await open(browser, { w: 390, h: 844, touch: true });
    await settle(page);
    const a = await (await page.$('.tw-pin[data-town=conway] a')).boundingBox();
    await page.touchscreen.tap(a.x + a.width / 2, a.y + a.height / 2); await page.waitForTimeout(600);
    const first = { path: new URL(page.url()).pathname, on: await page.evaluate(() => document.querySelector('.tw-card').classList.contains('on')) };
    const nav = page.waitForNavigation({ timeout: 5000 }).then(() => true, () => false);
    await page.touchscreen.tap(a.x + a.width / 2, a.y + a.height / 2);
    const went = await nav;
    ok('cards, touch: the first tap opens the card on the page, the second opens the town page', first.path === '/' && first.on && went && /\/submarkets\/conway\/$/.test(page.url()), JSON.stringify({ first, went, url: page.url() }));
    await ctx.close();
  }

  // phones: a tapped card ends fully on screen, under the sticky header (it scrolls itself into view when it has to)
  for (const [w, h] of [[390, 844], [360, 740], [390, 664], [430, 932], [320, 568]]) {
    const { ctx, page } = await open(browser, { w, h, touch: true });
    await settle(page);
    const off = [];
    for (const slug of Object.keys(towns.towns)) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(120);
      await page.$eval(`.tw-pin[data-town=${slug}] a`, (a) => { const r = a.getBoundingClientRect(); if (r.bottom > innerHeight - 10) scrollBy({ top: r.bottom - innerHeight + 60, behavior: 'instant' }); });
      await page.waitForTimeout(120);
      const a = await (await page.$(`.tw-pin[data-town=${slug}] a`)).boundingBox();
      await page.touchscreen.tap(a.x + a.width / 2, a.y + a.height / 2); await page.waitForTimeout(900);
      const r = await page.evaluate(() => { const c = document.querySelector('.tw-card'), r = c.getBoundingClientRect(), hb = document.querySelector('body > header, header').getBoundingClientRect().bottom; return { on: c.classList.contains('on'), top: Math.round(r.top), bottom: Math.round(r.bottom), hb: Math.round(hb), ih: innerHeight }; });
      if (!r.on || r.top < r.hb - 1 || r.bottom > r.ih + 1) off.push(slug + ' ' + JSON.stringify(r));
      await page.touchscreen.tap(5, h - 5); await page.waitForTimeout(300);
    }
    ok(`cards ${w}x${h}, touch: every tapped card ends fully on screen`, off.length === 0, off.join(' | '));
    await ctx.close();
  }

  // ---- the scroll moments ---------------------------------------------------------------------------------------------
  for (const [w, h, reduced] of [[1440, 900, false], [390, 844, false], [1440, 900, true]]) {
    const { ctx, page } = await open(browser, { w, h, reduced, touch: w <= 430 });
    await page.waitForTimeout(800);
    const r = await page.evaluate(async () => {
      const wide = [], hidden = new Set(), H = document.documentElement.scrollHeight;
      const texts = [...document.querySelectorAll('#ltr-teaser, #why-us, #team, #faq')].flatMap((s) => [...s.querySelectorAll('h2,h3,p,li,b,span,label')]).filter((e) => e.textContent.trim() && e.getClientRects().length);
      for (let y = 0; y < H; y += 400) {
        scrollTo({ top: y, behavior: 'instant' }); await new Promise((z) => setTimeout(z, 60));
        if (document.documentElement.scrollWidth > innerWidth) wide.push(y);
        for (const e of texts) { let o = 1; for (let a = e; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); o *= +cs.opacity; if (cs.visibility === 'hidden') o = 0; } if (o < .99) hidden.add(e.textContent.trim().slice(0, 30)); }
      }
      const tl = document.getAnimations().filter((a) => a.timeline && a.timeline !== document.timeline).length;
      scrollTo({ top: 0, behavior: 'instant' });
      return { wide, hidden: [...hidden].slice(0, 5), tl };
    });
    const tag = `scroll ${w}${reduced ? ', reduced motion' : ''}`;
    ok(`${tag}: the page never scrolls sideways`, r.wide.length === 0, r.wide.join());
    ok(`${tag}: no text below the map is ever hidden`, r.hidden.length === 0, r.hidden.join(' | '));
    ok(`${tag}: ${reduced ? 'no scroll-linked motion' : 'scroll-linked motion runs'}`, reduced ? r.tl === 0 : r.tl > 0, 'scroll timelines: ' + r.tl);
    if (!reduced) {
      // the sample report straightens fully once it is well in view
      const flat = await page.evaluate(async () => { const e = document.querySelector('.an-rep'); e.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise((z) => setTimeout(z, 200)); return getComputedStyle(e).transform; });
      ok(`${tag}: the sample report rests flat once it is in view`, flat === 'none' || /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(flat), flat);
    }
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exitCode = failed.length ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });
