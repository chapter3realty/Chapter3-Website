// shared in-page geometry for the towns map tests. Runs inside the page (page.evaluate(fn)).
window.__tw = (function () {
  const st = document.querySelector('.tw-stage'), sec = document.querySelector('#towns');
  const R = (e) => e.getBoundingClientRect();
  // oriented box of an element whose transform is translate + rotate: centre, half sizes, angle
  function obox(el, pad) {
    const r = R(el), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform === 'none' ? undefined : getComputedStyle(el).transform);
    let ang = Math.atan2(m.b, m.a);
    const rot = getComputedStyle(el).rotate; if (rot && rot !== 'none') ang += parseFloat(rot) * Math.PI / 180;
    return { cx, cy, hw: el.offsetWidth / 2 + (pad || 0), hh: el.offsetHeight / 2 + (pad || 0), a: ang };
  }
  const rbox = (r, pad) => ({ cx: r.left + r.width / 2, cy: r.top + r.height / 2, hw: r.width / 2 + (pad || 0), hh: r.height / 2 + (pad || 0), a: 0 });
  function corners(b) { const c = Math.cos(b.a), s = Math.sin(b.a); return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => [b.cx + i * b.hw * c - j * b.hh * s, b.cy + i * b.hw * s + j * b.hh * c]); }
  function hit(A, B) { // separating axis test for two oriented rectangles
    const pa = corners(A), pb = corners(B);
    for (const b of [A, B]) for (const ax of [[Math.cos(b.a), Math.sin(b.a)], [-Math.sin(b.a), Math.cos(b.a)]]) {
      const pr = (ps) => ps.map((p) => p[0] * ax[0] + p[1] * ax[1]);
      const x = pr(pa), y = pr(pb);
      if (Math.max(...x) < Math.min(...y) || Math.max(...y) < Math.min(...x)) return false;
    }
    return true;
  }
  function inside(b, S, m) { return corners(b).every(([x, y]) => x >= S.left + m && x <= S.right - m && y >= S.top + m && y <= S.bottom - m); }
  function items() {
    const pins = [...document.querySelectorAll('.tw-pin')].map((li) => { const r = R(li); return { n: li.dataset.town, x: r.left, y: r.top, li, a: li.querySelector('a') }; });
    const deco = [...document.querySelectorAll('.tw-deco .sh b, .tw-deco .wl i')].filter((e) => e.getClientRects().length).map((e) => ({ n: e.dataset.t || e.textContent, el: e, sh: !!e.closest('.sh') }));
    return { pins, deco };
  }
  // every problem at the current camera
  // grow: labels drawn wider by this fraction (Firefox draws DM Sans about 3.5% wider than Chromium and WebKit),
  // grown about the label's anchor, so a layout that passes here also passes there
  function problems(grow) {
    const S = R(st), out = [];
    const { pins, deco } = items();
    const card = document.querySelector('.tw-card'), cardAbs = getComputedStyle(card).position === 'absolute';
    const obs = [];
    if (cardAbs) obs.push({ n: 'card', b: rbox(R(card), 8) });
    // the controls over the map: the pause button, the compass and the map data line
    for (const [n, sel] of [['compass', '.tw-compass'], ['pause', '.tw-rot'], ['credit', '.tw-credit']]) {
      const el = st.querySelector(sel);
      if (el && el.getClientRects().length) obs.push({ n, b: rbox(R(el), 6) });
    }
    const dots = pins.map((p) => ({ n: p.n, b: { cx: p.x, cy: p.y, hw: 8, hh: 8, a: 0 } }));
    const pills = pins.map((p) => {
      const b = obox(p.a, 2);
      if (grow) { const ax = parseFloat(getComputedStyle(p.li).getPropertyValue('--ax')) || 0, w0 = b.hw * 2, w1 = w0 * (1 + grow), left = b.cx - b.hw, anchor = left + ax * w0; b.cx = anchor - ax * w1 + w1 / 2; b.hw = w1 / 2; }
      return { n: p.n, b };
    });
    const dec = deco.map((d) => ({ n: d.n, b: obox(d.el, 1), sh: d.sh }));
    pills.forEach((p, i) => {
      if (!inside(p.b, S, 8)) out.push('edge: ' + p.n);
      for (let k = i + 1; k < pills.length; k++) if (hit(p.b, pills[k].b)) out.push('label/label: ' + p.n + ' x ' + pills[k].n);
      for (const d of dots) if (d.n !== p.n && hit(p.b, d.b)) out.push('label/pin: ' + p.n + ' x ' + d.n);
      for (const d of dec) if (hit(p.b, d.b)) out.push('label/deco: ' + p.n + ' x ' + d.n);
      for (const o of obs) if (hit(p.b, o.b)) out.push('label/' + o.n + ': ' + p.n);
    });
    dots.forEach((d) => {
      if (!inside(d.b, S, 10)) out.push('pin edge: ' + d.n);
      for (const o of obs) if (hit(d.b, o.b)) out.push('pin/' + o.n + ': ' + d.n);
      for (const e of dec) if (hit(d.b, e.b)) out.push('pin/deco: ' + d.n + ' x ' + e.n);
    });
    dec.forEach((d, i) => {
      if (!inside(d.b, S, 4)) out.push('deco edge: ' + d.n);
      for (let k = i + 1; k < dec.length; k++) if (hit(d.b, dec[k].b)) out.push('deco/deco: ' + d.n + ' x ' + dec[k].n);
      for (const o of obs) if (hit(d.b, o.b)) out.push('deco/' + o.n + ': ' + d.n);
    });
    return out;
  }
  // labels must sit on their towns: a probe inside the tilted plane at the same spot, projected by the browser
  function projErr() {
    const plane = document.querySelector('.tw-plane'); let worst = 0, who = '';
    for (const li of document.querySelectorAll('.tw-pt')) {
      if (getComputedStyle(li).display === 'none') continue;
      const cs = getComputedStyle(li), px = +cs.getPropertyValue('--px'), py = +cs.getPropertyValue('--py');
      const pr = document.createElement('i'); pr.style.cssText = `position:absolute;left:${px * 100}%;top:${py * 100}%;width:0;height:0`;
      plane.appendChild(pr); const a = R(pr), b = R(li); pr.remove();
      const e = Math.hypot(a.left - b.left, a.top - b.top); if (e > worst) { worst = e; const t = li.querySelector('[data-t]'); who = li.dataset.town || (t && t.dataset.t) || ''; }
    }
    return { worst: +worst.toFixed(2), who };
  }
  function heads() { sec.style.removeProperty('--h0'); const cs = getComputedStyle(sec); return [parseFloat(cs.getPropertyValue('--h0')), parseFloat(cs.getPropertyValue('--h1'))]; }
  function setHead(h) { sec.style.setProperty('--h0', h + 'deg'); }
  return { problems, projErr, heads, setHead, obox, hit, inside, R };
})();
