// The hero map cameras in the page match data/cameras.json, which map/build_basemap.py places the road shields for.
// node cameras.js <url>. Loads the page at each width (and the height) the file lists and compares the computed camera,
// the layout, every town's label side, the water names and the hidden road shields. Exits 1 on any difference.
const { chromium } = require('playwright'), fs = require('fs');
(async () => {
  const url = process.argv[2] || 'http://localhost:8124/';
  const cfg = JSON.parse(fs.readFileSync(__dirname + '/../data/cameras.json', 'utf-8'));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0;
  for (const cam of cfg.cameras) for (const vw of cam.vws) {
    const ctx = await b.newContext({ viewport: { width: vw, height: cam.vh }, isMobile: vw <= 430, hasTouch: vw <= 430, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    await p.goto(url, { waitUntil: 'load' });
    const got = await p.evaluate(() => {
      const sec = document.querySelector('#home'), cs = getComputedStyle(sec), n = (k) => parseFloat(cs.getPropertyValue(k));
      const sides = {};
      for (const li of document.querySelectorAll('.tw-pin')) { const s = getComputedStyle(li); sides[li.dataset.town] = ['--ax', '--ay', '--ox', '--oy', '--stem'].map((k) => parseFloat(s.getPropertyValue(k))); }
      const water = {};
      for (const k of ['icw', 'wac', 'sea']) { const el = document.querySelector('.tw-deco .wl.' + k), s = getComputedStyle(el); water[k] = s.display === 'none' ? null : ['--px', '--py', '--a'].map((v) => parseFloat(s.getPropertyValue(v))); }
      const hiddenShields = [...document.querySelectorAll('.tw-deco .sh')].filter((e) => getComputedStyle(e).display === 'none').map((e) => e.dataset.r);
      return { P: n('--P'), pw: n('--pw'), tilt: n('--t0'), h0: n('--h0'), h1: n('--h1'), cx: n('--cx'), cb: n('--cb'), ma: n('--ma'), fog: n('--fog'),
        font: parseFloat(getComputedStyle(document.querySelector('.tw-pin a')).fontSize), layout: getComputedStyle(document.querySelector('.cine-copy')).display === 'contents' ? 'above' : 'beside',
        sides, water, hiddenShields };
    });
    const want = { P: cam.P, pw: cam.pw, tilt: cam.tilt, h0: cam.heads[0], h1: cam.heads[2], cx: cam.cx, cb: cam.cb, fog: cam.fog, font: cam.font, layout: cam.layout };
    if (cam.ma !== undefined) want.ma = cam.ma;
    const diff = [];
    for (const k of Object.keys(want)) if (typeof want[k] === 'number' ? Math.abs(want[k] - got[k]) > 0.05 : want[k] !== got[k]) diff.push(`${k} page ${got[k]} file ${want[k]}`);
    if (Math.abs((cam.heads[0] + cam.heads[2]) / 2 - cam.heads[1]) > 0.01) diff.push('heads: the middle heading is not halfway');
    for (const [town, s] of Object.entries(got.sides)) {
      const w = cam.sides[town] === undefined ? cfg.sideNames.up : typeof cam.sides[town] === 'string' ? cfg.sideNames[cam.sides[town]] : cam.sides[town];
      if (!w || w.some((v, i) => Math.abs(v - s[i]) > 0.01)) diff.push(`${town} side page [${s}] file [${w}]`);
    }
    for (const [k, v] of Object.entries(got.water)) {
      const w = cam.water[k];
      if ((w === null) !== (v === null) || (w && w.some((x, i) => Math.abs(x - v[i]) > 0.001))) diff.push(`water ${k} page ${JSON.stringify(v)} file ${JSON.stringify(w)}`);
    }
    if (JSON.stringify(got.hiddenShields.sort()) !== JSON.stringify([...cam.hiddenShields].sort())) diff.push(`hidden shields page ${got.hiddenShields} file ${cam.hiddenShields}`);
    bad += diff.length;
    console.log(`${diff.length ? 'FAIL' : 'ok  '} ${cam.name} at ${vw}x${cam.vh}${diff.length ? '\n     ' + diff.join('\n     ') : ''}`);
    await ctx.close();
  }
  await b.close();
  console.log(bad ? `${bad} differences` : 'page and data/cameras.json agree');
  process.exitCode = bad ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });
