// labels stay on their towns while the map flies in and while it turns after the landing: freeze every animation at
// several moments and compare each label anchor with a probe placed at the same spot inside the (animated) plane.
// node twmotion.js <url> <w> <h>. The labels are hidden until the landing and move only in the flight's last 30%, so
// before 3.45s only the labels that can be seen count. After the flight (6s) only the slow turn moves the map: endless
// back-and-forth keyframes. Exits 1 when a label is more than 1px off its town, when nothing moved during the flight,
// or when after it anything but the turn moves, or nothing does.
const { chromium } = require('playwright'), fs = require('fs');
(async () => {
  const [url, w, h] = process.argv.slice(2);
  const lib = fs.readFileSync(__dirname + '/twlib.js', 'utf-8');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let worst = 0, still = 0, after = 0;
  for (const at of [300, 900, 1800, 3450, 3900, 4400, 6000, 11000]) {
    const ctx = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: +w <= 430, hasTouch: +w <= 430 });
    const p = await ctx.newPage();
    await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    await p.goto(url, { waitUntil: 'load' });
    await p.evaluate(() => { const i = document.querySelector('.tw-plane img'); i.loading = 'eager'; });
    await p.waitForFunction(() => { const i = document.querySelector('.tw-plane img'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 });
    // the flight starts on its own as the page opens
    await p.waitForFunction(() => document.querySelector('#home .tw-stage').classList.contains('in'));
    await p.waitForTimeout(at);
    await p.evaluate(lib);
    const r = await p.evaluate((seen) => {
      const an = document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.tw-stage'));
      // what is still running (a finished landing ring that holds its last frame is not moving)
      const run = an.filter((a) => a.playState === 'running' && a.effect.getKeyframes().some((k) => k.transform) && !(a instanceof CSSAnimation));
      const moving = run.length, turn = run.filter((a) => a.effect.getTiming().iterations === Infinity && a.effect.getTiming().direction === 'alternate').length;
      an.forEach((a) => a.pause());
      const e = window.__tw.projErr(seen);
      const plane = getComputedStyle(document.querySelector('.tw-plane')).transform;
      return { moving, turn, err: e.worst, who: e.who, plane: plane.slice(0, 60) };
    }, at < 3450);
    console.log(`t+${at}ms: ${r.moving} transform animations (${r.turn} of them the turn), worst label offset ${r.err}px (${r.who})`);
    worst = Math.max(worst, r.err); if (at < 6000 && !r.moving) still++; if (at >= 6000 && (!r.turn || r.moving !== r.turn)) after++;
    await ctx.close();
  }
  await b.close();
  const bad = worst > 1 || still > 0 || after > 0;
  console.log(bad ? `FAIL: worst ${worst}px, ${still} moments with nothing moving during the flight, ${after} after it with anything but the turn moving, or nothing` : `ok: worst ${worst}px, only the turn moving after the flight`);
  process.exitCode = bad ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });
