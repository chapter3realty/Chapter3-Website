// The lead pop-up must never rise with an empty box. Four cases, in a real
// browser (server on :8123 from chapter3realty/):
//   NODE_PATH=$(npm root -g) node tools/verify-popup.js [webm-substitute]
// The container's Chromium has no H.264, so a WebM stands in for the clip when
// a path is given. Without it, only the failure paths are exercised.
const { chromium } = require('playwright');
const fs = require('fs');
const CLIP = process.argv[2] && fs.existsSync(process.argv[2]) ? fs.readFileSync(process.argv[2]) : null;
let fails = 0;
const ok = (cond, label, got, exp) => { if (!cond) fails++; console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}: got "${got}" expected "${exp}"`); };

async function newPop(browser, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  if (opts.refusePlay) {
    await p.addInitScript(() => {
      const real = HTMLMediaElement.prototype.play;
      window.__allowPlay = false;
      HTMLMediaElement.prototype.play = function () {
        if (window.__allowPlay) return real.apply(this, arguments);
        return Promise.reject(new DOMException('NotAllowedError', 'NotAllowedError'));
      };
    });
  }
  await p.route(/fonts\.(googleapis|gstatic)\.com|googletagmanager|google-analytics/, r => r.abort());
  if (CLIP) {
    /* the original clip too, so the early-open path has something playable */
    await p.route('**/popup.mp4', r => r.fulfill({ status: 200, contentType: 'video/webm', body: CLIP }));
  }
  if (CLIP && !opts.breakGreen) {
    await p.route('**/popup-green.mp4', r => r.request().method() === 'HEAD'
      ? r.fulfill({ status: 200, contentType: 'video/webm' })
      : r.fulfill({ status: 200, contentType: 'video/webm', body: CLIP }));
  }
  if (opts.breakGreen) {
    await p.route('**/popup-green.mp4', r => r.request().method() === 'HEAD'
      ? r.fulfill({ status: 200, contentType: 'video/mp4' })
      : r.fulfill({ status: 500, body: 'broken' }));
  }
  await p.goto('http://127.0.0.1:8123/', { waitUntil: 'load' });
  await p.evaluate(() => { try { sessionStorage.clear(); localStorage.clear(); } catch (e) {} });
  return { ctx, p };
}
const state = (p) => p.evaluate(() => {
  const v = document.getElementById('c3-pop-video');
  const m = document.getElementById('c3-pop-media');
  const btn = document.getElementById('c3-pop-play');
  const ov = document.getElementById('c3-pop-overlay');
  const cv = document.getElementById('c3-pop-canvas');
  return { t: +v.currentTime.toFixed(2), poster: v.getAttribute('poster') || '', src: (v.currentSrc || '').split('/').pop(),
    keyed: m.classList.contains('c3-keyed'), needtap: m.classList.contains('c3-needtap'),
    tapShown: getComputedStyle(btn).display !== 'none', canvasShown: getComputedStyle(cv).display !== 'none',
    videoVisible: getComputedStyle(v).visibility === 'visible', formShown: parseFloat(getComputedStyle(ov).opacity) > 0.9,   /* it fades in over .5s */
    box: Math.round(m.getBoundingClientRect().width) + 'x' + Math.round(m.getBoundingClientRect().height) };
});

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });

  if (CLIP) {
    /* A. the real timeline: warm at 6s, open at 10s, and the book opens */
    const { ctx, p } = await newPop(browser);
    await p.waitForTimeout(12500);
    const a = await state(p);
    ok(a.t > 0.3, 'A plays on its own', a.t + 's', '> 0.3s');
    ok(!a.tapShown, 'A no tap prompt while it plays', String(a.tapShown), 'false');
    ok(a.keyed || a.videoVisible, 'A something is on screen', a.keyed ? 'keyed canvas' : 'plain video', 'one of the two');
    await p.waitForTimeout(2000);
    ok((await state(p)).formShown, 'A the form arrives', 'shown', 'shown');
    await ctx.close();

    /* D. the warm-up timer must not rewind a clip that is already playing */
    const d = await newPop(browser);
    await d.p.evaluate(() => window.c3PopOpen());
    await d.p.waitForTimeout(1200);
    const before = (await state(d.p)).t;
    await d.p.waitForTimeout(5200);                 /* past the 6s warmVideo timer */
    const after = await state(d.p);
    ok(after.t >= before, 'D the warm-up does not rewind a playing clip', before + 's then ' + after.t + 's', 'never smaller');
    await d.ctx.close();
  } else {
    console.log('..   A and D skipped: no WebM substitute given');
  }

  /* B. autoplay refused: a poster, a tap target, and the tap starts it */
  {
    const { ctx, p } = await newPop(browser, { refusePlay: true });
    await p.evaluate(() => window.c3PopOpen());
    await p.waitForTimeout(2400);
    const s = await state(p);
    ok(s.poster !== '', 'B a poster is still set', s.poster || '(none)', 'a file');
    ok(s.tapShown, 'B the tap prompt is offered', String(s.tapShown), 'true');
    ok(s.formShown, 'B the form still arrives', String(s.formShown), 'true');
    if (CLIP) {
      await p.evaluate(() => { window.__allowPlay = true; });
      await p.click('#c3-pop-play');
      await p.waitForTimeout(1500);
      const after = await state(p);
      ok(after.t > 0.2, 'B the tap opens the book', after.t + 's', '> 0.2s');
      ok(!after.tapShown, 'B the prompt clears once it plays', String(after.tapShown), 'false');
    }
    await ctx.close();
  }

  /* C. the keyed master is broken: fall back to the clip that always worked */
  {
    const { ctx, p } = await newPop(browser, { breakGreen: true });
    await p.evaluate(() => window.c3PopOpen());
    await p.waitForTimeout(3600);
    const s = await state(p);
    ok(/popup\.mp4$/.test(s.src) || s.poster.indexOf('popup-poster') >= 0, 'C falls back to the original clip', s.src + ' / ' + s.poster, 'popup.mp4');
    ok(s.poster !== '', 'C a poster is still set', s.poster || '(none)', 'a file');
    ok(s.formShown, 'C the form still arrives', String(s.formShown), 'true');
    await ctx.close();
  }

  await browser.close();
  console.log(fails ? 'FAILS=' + fails : 'ALL CHECKS PASS');
  process.exit(fails ? 1 : 0);
})();
