// node twcheck.js <url> [w x h ...]: hero map collisions over the whole turn (13 headings, --h0 to --h1), and label-to-map projection error.
// GROW=0.045 widens every label as Firefox draws it; SPACING=1 applies the WCAG 1.4.12 text spacing. Exits 1 on any problem.
const { chromium } = require('playwright'), fs = require('fs');
(async () => {
  const [url, ...sizes] = process.argv.slice(2);
  const lib = fs.readFileSync(__dirname + '/twlib.js', 'utf-8');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0;
  for (const s of (sizes.length ? sizes : ['1920x1080', '1680x1050', '1440x900', '1280x800', '1100x800', '1099x800', '1024x768', '900x1000', '899x1000', '820x1180', '768x1024', '700x900', '699x900', '430x932', '390x844', '375x667', '360x740', '320x568'])) {
    const [w, h] = s.split('x').map(Number);
    // motion allowed; keyboard focus on a town label lands the flight at once
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'no-preference', isMobile: w <= 430, hasTouch: w <= 430 });
    if (process.env.SPACING) await ctx.addInitScript(() => addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'; document.head.appendChild(s); }));
    const p = await ctx.newPage();
    await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    await p.goto(url, { waitUntil: 'load' });
    await p.evaluate(() => { const a = document.querySelector('.tw-pin a'); a.focus(); a.blur(); });
    // CSS=... adds rules on top, to try a placement before writing it into head.html
    await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' + (process.env.CSS || '') });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(lib);
    await p.evaluate((g) => { window.__grow = g; }, +(process.env.GROW || 0));
    const r = await p.evaluate(() => {
      const T = window.__tw, [h0, h1] = T.heads(), all = new Set();
      for (let k = 0; k <= 12; k++) { const h = h0 + (h1 - h0) * k / 12; T.setHead(h); T.problems(+(window.__grow || 0)).forEach((x) => all.add(x)); }
      T.setHead(h0); document.querySelector('#home').style.removeProperty('--h0');
      return { probs: [...all], proj: T.projErr() };
    });
    bad += r.probs.length + (r.proj.worst > 1.5 ? 1 : 0);
    console.log(`${s}: proj ${r.proj.worst}px (${r.proj.who})${r.probs.length ? '\n   ' + r.probs.join('\n   ') : '  clean'}`);
    await ctx.close();
  }
  console.log(bad ? `${bad} problems` : 'all clean');
  await b.close();
  process.exitCode = bad ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });
