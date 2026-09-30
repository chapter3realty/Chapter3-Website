// The towns map cameras in the page match data/cameras.json, which map/build_basemap.py places the road shields for.
// node cameras.js <url>. Loads the page at each width the file lists and compares the computed camera, the controls and
// every town's label side. Exits 1 on any difference.
const { chromium } = require('playwright'), fs = require('fs');
(async () => {
  const url = process.argv[2] || 'http://localhost:8124/';
  const cfg = JSON.parse(fs.readFileSync(__dirname + '/../data/cameras.json', 'utf-8'));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0;
  for (const cam of cfg.cameras) for (const vw of cam.vws) {
    const ctx = await b.newContext({ viewport: { width: vw, height: cam.vh }, isMobile: vw <= 430, hasTouch: vw <= 430 });
    const p = await ctx.newPage();
    await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    await p.goto(url, { waitUntil: 'load' });
    const got = await p.evaluate(() => {
      const sec = document.querySelector('#towns'), cs = getComputedStyle(sec), n = (k) => parseFloat(cs.getPropertyValue(k));
      const st = document.querySelector('.tw-stage').getBoundingClientRect(), ctl = document.querySelector('.tw-ctl'), cr = ctl.getBoundingClientRect();
      const sides = {};
      for (const li of document.querySelectorAll('.tw-pin')) { const s = getComputedStyle(li); sides[li.dataset.town] = ['--ax', '--ay', '--ox', '--oy', '--stem'].map((k) => parseFloat(s.getPropertyValue(k))); }
      return { sh: n('--sh'), P: n('--P'), pw: n('--pw'), tilt: n('--t0'), h0: n('--h0'), h1: n('--h1'), cx: n('--cx'), cy: n('--cy'), fog: n('--fog'),
        font: parseFloat(getComputedStyle(document.querySelector('.tw-pin a')).fontSize), card: getComputedStyle(document.querySelector('.tw-card')).position === 'absolute',
        ci: +(st.right - cr.right).toFixed(1), ctl: getComputedStyle(ctl).flexDirection === 'column' ? 'column' : 'row', ctlBottom: +(st.bottom - cr.bottom).toFixed(1), sides };
    });
    const want = { sh: cam.sh, P: cam.P, pw: cam.pw, tilt: cam.tilt, h0: cam.heads[0], h1: cam.heads[2], cx: cam.cx, cy: cam.cy, fog: cam.fog, font: cam.font, card: cam.card,
      ci: cam.ci === 'side' ? Math.max(32, (vw - 1200) / 2 + 32) : cam.ci, ctl: cam.ctl, ctlBottom: cam.ctlBottom };
    const diff = [];
    for (const k of Object.keys(want)) if (typeof want[k] === 'number' ? Math.abs(want[k] - got[k]) > 0.05 : want[k] !== got[k]) diff.push(`${k} page ${got[k]} file ${want[k]}`);
    if (Math.abs((cam.heads[0] + cam.heads[2]) / 2 - cam.heads[1]) > 0.01) diff.push('heads: the middle heading is not halfway');
    for (const [town, s] of Object.entries(got.sides)) {
      const w = cam.sides[town] === undefined ? cfg.sideNames.up : typeof cam.sides[town] === 'string' ? cfg.sideNames[cam.sides[town]] : cam.sides[town];
      if (!w || w.some((v, i) => Math.abs(v - s[i]) > 0.01)) diff.push(`${town} side page [${s}] file [${w}]`);
    }
    bad += diff.length;
    console.log(`${diff.length ? 'FAIL' : 'ok  '} ${cam.name} at ${vw}x${cam.vh}${diff.length ? '\n     ' + diff.join('\n     ') : ''}`);
    await ctx.close();
  }
  await b.close();
  console.log(bad ? `${bad} differences` : 'page and data/cameras.json agree');
  process.exitCode = bad ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });
