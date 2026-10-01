// Search the hero map layout in the real page, one breakpoint range at a time.
//   node twsearch.js '<json>'  { url, widths:[..], vh, grid:{P,pw,t0,hc,cx,cb}, drift, steps, tilts:[..], order:[..], prefs:[..], top, grow, ma, col }
// For every camera: measure pins, shields and candidate water-label spots (relative to the camera target) over the turn,
// then greedily give each town a label side that clears every width and every step of the turn. The turn is hc - drift to
// hc + drift in steps headings (default 5); tilts (degrees added to t0, default [0]) checks the range a drag can tilt to. Shields a label cannot
// avoid are hidden; each water label takes the first candidate spot that clears everything, or is hidden.
// The words over the map (eyebrow, H1, sub-header, paths, map links) are one obstacle, the box round those that overlap the
// map's stage; col:true stretches it to the stage's full height (the words are centred, so they move with the screen's
// height). ma sets the map's height under the words on a narrow screen (--ma, px) for the search.
const { chromium } = require('playwright'), fs = require('fs');
(async () => {
  const cfg = JSON.parse(process.argv[2]);
  const cands = JSON.parse(fs.readFileSync(__dirname + '/water-cands.json', 'utf-8'));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: cfg.widths[0], height: cfg.vh || 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
  await p.goto(cfg.url, { waitUntil: 'load' });
  await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important} .tw-deco .wl,.tw-deco .sh{display:block!important}' });
  await p.evaluate(() => document.fonts.ready);
  if (cfg.ma) await p.evaluate((ma) => document.querySelector('#home').style.setProperty('--ma', ma + 'px'), cfg.ma);
  // phase A: per width, the stage size and the fixed obstacle (the words over the map) in stage coordinates
  const W = [];
  for (const w of cfg.widths) {
    await p.setViewportSize({ width: w, height: cfg.vh || 900 });
    W.push(await p.evaluate((col) => {
      const st = document.querySelector('#home .tw-stage').getBoundingClientRect(), R = (e) => e.getBoundingClientRect();
      const rel = (r, pad) => [r.left - st.left - pad, r.top - st.top - pad, r.right - st.left + pad, r.bottom - st.top + pad];
      let u = null;
      for (const el of document.querySelectorAll('.cine-copy > *')) {
        const r = R(el); if (!r.height || r.bottom <= st.top || r.top >= st.bottom) continue;
        u = u ? { left: Math.min(u.left, r.left), top: Math.min(u.top, r.top), right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) } : { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      }
      if (u && col) { u.top = st.top; u.bottom = st.bottom; }
      return { w: st.width, h: st.height, card: u ? rel(u, 8) : null };
    }, !!cfg.col));
  }
  await p.setViewportSize({ width: cfg.widths[0], height: cfg.vh || 900 });
  // phase B + C in the page
  const res = await p.evaluate(({ cfg, W, cands }) => {
    const sec = document.querySelector('#home'), st = document.querySelector('#home .tw-stage'), deco = document.querySelector('.tw-deco');
    const R = (e) => e.getBoundingClientRect();
    const pins = [...document.querySelectorAll('.tw-pin')];
    const size = {}; for (const li of pins) { const a = li.querySelector('a'); size[li.dataset.town] = [a.offsetWidth * (1 + (cfg.grow || 0)), a.offsetHeight]; }
    const shields = [...document.querySelectorAll('.tw-deco .sh')].map((s, k) => ({ id: 'sh' + k + ':' + s.dataset.r, el: s, w: s.firstElementChild.offsetWidth, h: s.firstElementChild.offsetHeight }));
    const wl = {}; for (const s of document.querySelectorAll('.tw-deco .wl')) { const i = s.firstElementChild; wl[i.dataset.t] = [i.offsetWidth, i.offsetHeight]; }
    const water = [['Intracoastal Waterway', 'icw'], ['Waccamaw River', 'wac'], ['Atlantic Ocean', 'ocean']];
    // probes for every candidate water spot
    const probes = {};
    for (const [name, key] of water) probes[name] = cands[key].map(([x, y, a]) => { const e = document.createElement('span'); e.className = 'tw-pt'; e.style.cssText = `--px:${x};--py:${y}`; deco.appendChild(e); return { e, a }; });
    const keys = Object.keys(cfg.grid); let combos = [[]];
    for (const k of keys) { const n = []; for (const c of combos) for (const v of cfg.grid[k]) n.push([...c, v]); combos = n; }
    const steps = cfg.steps ? Array.from({ length: cfg.steps }, (_, i) => -1 + 2 * i / (cfg.steps - 1)) : [-1, -0.5, 0, 0.5, 1];
    const poses = []; for (const dt of cfg.tilts || [0]) for (const s of steps) poses.push({ s, dt });
    const hitR = (a, b, pad) => a[0] < b[2] + pad && b[0] < a[2] + pad && a[1] < b[3] + pad && b[1] < a[3] + pad;
    const corners = (cx, cy, hw, hh, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => [cx + i * hw * c - j * hh * s, cy + i * hw * s + j * hh * c]); };
    const obb = (cx, cy, hw, hh, ang) => ({ cx, cy, hw, hh, a: ang, pts: corners(cx, cy, hw, hh, ang) });
    const rectO = (r) => obb((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, (r[2] - r[0]) / 2, (r[3] - r[1]) / 2, 0);
    function sat(A, B) {
      for (const o of [A, B]) for (const ax of [[Math.cos(o.a), Math.sin(o.a)], [-Math.sin(o.a), Math.cos(o.a)]]) {
        const x = A.pts.map((q) => q[0] * ax[0] + q[1] * ax[1]), y = B.pts.map((q) => q[0] * ax[0] + q[1] * ax[1]);
        if (Math.max(...x) < Math.min(...y) || Math.max(...y) < Math.min(...x)) return false;
      }
      return true;
    }
    const inside = (o, w, m) => o.pts.every(([x, y]) => x >= m && x <= w.w - m && y >= m && y <= w.h - m);
    const PL = { r: (x, y, w, h) => [x + 12, y - h / 2], l: (x, y, w, h) => [x - 12 - w, y - h / 2], up: (x, y, w, h) => [x - w / 2, y - 28 - h], ul: (x, y, w, h) => [x + 14 - w, y - 28 - h], ur: (x, y, w, h) => [x - 14, y - 28 - h], up2: (x, y, w, h) => [x - w / 2, y - 60 - h] };
    const out = [];
    for (const c of combos) {
      const cam = Object.fromEntries(keys.map((k, i) => [k, c[i]]));
      sec.style.setProperty('--P', cam.P); sec.style.setProperty('--pw', cam.pw); sec.style.setProperty('--t0', cam.t0 + 'deg');
      sec.style.setProperty('--h0', (cam.hc - cfg.drift) + 'deg'); sec.style.setProperty('--h1', (cam.hc + cfg.drift) + 'deg');
      sec.style.setProperty('--cx', cam.cx); sec.style.setProperty('--cb', cam.cb);
      const S = R(st), C0 = [S.left + S.width / 2 + cam.cx, S.bottom - cam.cb];
      const rel = (e) => { const r = R(e); return [r.left - C0[0], r.top - C0[1]]; };
      // positions relative to the camera target, per step
      const P = {}, SH = shields.map(() => []), WP = {};
      poses.forEach(({ s, dt }, si) => {
        const h = cam.hc + s * cfg.drift; sec.style.setProperty('--h0', h + 'deg'); sec.style.setProperty('--t0', (cam.t0 + dt) + 'deg');
        for (const li of pins) (P[li.dataset.town] ||= [])[si] = rel(li);
        shields.forEach((sh, k) => { SH[k][si] = rel(sh.el); });
        const t = (cam.t0 + dt) * Math.PI / 180, hh = h * Math.PI / 180;
        for (const [name] of water) (WP[name] ||= probes[name].map(() => []), probes[name].forEach((pr, k) => { const a = pr.a * Math.PI / 180; WP[name][k][si] = [...rel(pr.e), Math.atan2(Math.sin(a + hh) * Math.cos(t), Math.cos(a + hh))]; }));
      });
      sec.style.setProperty('--h0', (cam.hc - cfg.drift) + 'deg'); sec.style.setProperty('--t0', cam.t0 + 'deg');
      // absolute (stage coordinates) for width index wi
      const at = (v, wi) => [W[wi].w / 2 + cam.cx + v[0], W[wi].h - cam.cb + v[1]];
      const fixed = W.map((w) => [w.card && rectO(w.card)].filter(Boolean));
      const dots = (wi, si, except) => Object.entries(P).filter(([t]) => t !== except).map(([t, v]) => { const [x, y] = at(v[si], wi); return obb(x, y, 8, 8, 0); });
      let fails = 0; const choice = {}, placed = [];   // placed[i] = array over (wi,si) of obb
      const shOn = shields.map((s) => !(cfg.hideShields || []).includes(s.id));
      const shBox = (k, wi, si) => { const [x, y] = at(SH[k][si], wi); return obb(x, y, shields[k].w / 2 + 1, shields[k].h / 2 + 1, 0); };
      // pins first can never sit under the words, and must stay on the stage
      for (const [t, v] of Object.entries(P)) for (let wi = 0; wi < W.length; wi++) for (let si = 0; si < poses.length; si++) { const [x, y] = at(v[si], wi); const d = obb(x, y, 8, 8, 0); if (!inside(d, W[wi], 10) || fixed[wi].some((f) => sat(d, f))) { fails++; choice[t] = 'PIN'; } }
      const tryPlace = (t, pl, useSh) => {
        const [w, h] = size[t], boxes = [];
        for (let wi = 0; wi < W.length; wi++) for (let si = 0; si < poses.length; si++) {
          const [x, y] = at(P[t][si], wi), [lx, ly] = PL[pl](x, y, w, h), o = obb(lx + w / 2, ly + h / 2, w / 2 + 2, h / 2 + 2, 0);
          if (!inside(o, W[wi], 8)) return null;
          if (fixed[wi].some((f) => sat(o, f))) return null;
          if (dots(wi, si, t).some((d) => sat(o, d))) return null;
          if (placed.some((q) => sat(o, q.b[wi * poses.length + si]))) return null;
          if (useSh && shields.some((_, k) => shOn[k] && sat(o, shBox(k, wi, si)))) return null;
          boxes.push(o);
        }
        return boxes;
      };
      for (const t of cfg.order) {
        if (choice[t] === 'PIN') continue;
        let got = null;
        for (const pl of cfg.prefs) { const bx = tryPlace(t, pl, true); if (bx) { got = [pl, bx]; break; } }
        if (!got) for (const pl of cfg.prefs) { const bx = tryPlace(t, pl, false); if (bx) { got = [pl, bx]; break; } }
        if (!got) { fails++; choice[t] = 'X'; continue; }
        choice[t] = got[0]; placed.push({ t, b: got[1] });
        // shields this label covers are hidden
        shields.forEach((_, k) => { if (!shOn[k]) return; for (let wi = 0; wi < W.length; wi++) for (let si = 0; si < poses.length; si++) if (sat(got[1][wi * poses.length + si], shBox(k, wi, si))) { shOn[k] = false; return; } });
      }
      // shields must clear pins, the words and the stage edge
      shields.forEach((_, k) => { if (!shOn[k]) return; for (let wi = 0; wi < W.length; wi++) for (let si = 0; si < poses.length; si++) { const o = shBox(k, wi, si); if (!inside(o, W[wi], 4) || fixed[wi].some((f) => sat(o, f)) || dots(wi, si).some((d) => sat(o, d))) { shOn[k] = false; return; } } });
      // water labels: the first candidate spot that clears everything placed so far
      const wat = {}, watBoxes = [];
      for (const [name, key] of water) {
        const [w, h] = wl[name]; let pick = -1;
        const pref = [...WP[name].keys()].sort((a, b2) => Math.abs(a - WP[name].length / 2) - Math.abs(b2 - WP[name].length / 2));
        for (const k of pref) {
          let ok = true; const bx = [];
          for (let wi = 0; wi < W.length && ok; wi++) for (let si = 0; si < poses.length && ok; si++) {
            const v = WP[name][k][si], [x, y] = at(v, wi), o = obb(x, y, w / 2 + 2, h / 2 + 2, v[2]);
            if (!inside(o, W[wi], 6) || fixed[wi].some((f) => sat(o, f)) || dots(wi, si).some((d) => sat(o, d)) || placed.some((q) => sat(o, q.b[wi * poses.length + si])) || shields.some((_, j) => shOn[j] && sat(o, shBox(j, wi, si))) || watBoxes.some((q) => sat(o, q[wi * poses.length + si]))) ok = false;
            bx.push(o);
          }
          if (ok) { pick = k; watBoxes.push(bx); break; }
        }
        wat[name] = pick >= 0 ? cands[key][pick] : null;
      }
      const hidden = shields.filter((_, k) => !shOn[k]).map((s) => s.id).concat(Object.entries(wat).filter(([, v]) => !v).map(([n]) => n));
      out.push({ cam, fails, hidden, choice, wat, up2: Object.values(choice).filter((v) => v === 'up2').length });
    }
    return out;
  }, { cfg, W, cands });
  res.sort((a, c) => a.fails - c.fails || a.hidden.length - c.hidden.length || a.up2 - c.up2 || c.cam.pw - a.cam.pw);
  if (cfg.dump) require('fs').writeFileSync(cfg.dump, JSON.stringify(res));
  for (const r of res.slice(0, cfg.top || 6)) console.log(JSON.stringify({ f: r.fails, hid: r.hidden, cam: r.cam, ch: r.choice, wat: r.wat }));
  console.log('cameras', res.length, 'placed all', res.filter((r) => !r.fails).length, 'placed all, nothing hidden', res.filter((r) => !r.fails && !r.hidden.length).length);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
