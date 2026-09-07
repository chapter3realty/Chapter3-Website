const { chromium } = require('playwright');
const TCPA = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";
const PAGES = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const w of [1280, 768, 320]) {
    const c = await b.newContext({ viewport: { width: w, height: 900 } });
    await c.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    // Network guard: nothing reaches the CRM from this harness, whatever the page defines.
    await c.route('**/api/forms/**', route => { route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"harness":true}' }); });
    const p = await c.newPage(); const errs = []; let crmHits = 0;
    p.on('pageerror', e => errs.push(String(e).slice(0, 100))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 100)); });
    p.on('request', r => { if (r.url().includes('/api/forms/')) crmHits++; });
    for (const u of PAGES) {
      errs.length = 0; crmHits = 0;
      await p.goto('http://localhost:8123' + u, { waitUntil: 'load', timeout: 30000 });
      // Stub AFTER the page's own scripts have defined c3SendForm.
      await p.evaluate(() => { window.__sent = null; window.c3SendForm = (f, n) => { window.__sent = { f, n }; }; });
      await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 500) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 40)); } window.scrollTo({ top: 0, behavior: 'instant' }); });
      await p.waitForTimeout(400);
      const r = await p.evaluate((TCPA) => {
        const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const parse = x => { const m = (x.match(/[\d.]+/g) || []).map(Number); return { rgb: m.slice(0, 3), a: m[3] !== undefined ? m[3] : 1 }; };
        const low = []; let nodes = 0;
        for (const el of document.querySelectorAll('main p, main li, main h1, main h2, main h3, main td, main th, main span, main strong, main div, main a, main label, main button')) {
          const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim(); if (txt.length < 3) continue;
          const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
          const rc = el.getBoundingClientRect(); if (rc.width < 2 || rc.height < 2) continue; nodes++;
          let bg = [255, 255, 255], n = el, ch = []; while (n && n !== document.documentElement) { ch.push(n); n = n.parentElement; }
          for (const e of ch.reverse()) { const bb = parse(getComputedStyle(e).backgroundColor); if (bb.a > 0) bg = bb.rgb.map((x, i) => Math.round(x * bb.a + bg[i] * (1 - bb.a))); }
          const f = parse(cs.color); const fg = f.rgb.map((x, i) => Math.round(x * f.a + bg[i] * (1 - f.a)));
          const L1 = lum(fg), L2 = lum(bg); const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
          if (cr < (big ? 3 : 4.5) && !/^(Home|Invest|Buyers|Sell|HOA Guide|The short answer|Common questions|Sources:)$/.test(txt)) low.push(+cr.toFixed(2) + ' ' + txt.slice(0, 30));
        }
        const clipped = []; for (const el of document.querySelectorAll('main *')) { const cs = getComputedStyle(el); if ((cs.overflowX === 'hidden' || cs.overflow === 'hidden') && el.scrollWidth > el.clientWidth + 2) clipped.push(el.tagName + (el.id ? '#' + el.id : '') + '.' + String(el.className).slice(0, 30)); }
        const hero = document.querySelector('.detail-hero a.btn'); let hit = null; if (hero) { hero.scrollIntoView({ block: 'center', behavior: 'instant' }); const rc = hero.getBoundingClientRect(); const e = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2); hit = e === hero || hero.contains(e); window.scrollTo({ top: 0, behavior: 'instant' }); }
        const consent = document.querySelector('.form-consent span') || [...document.querySelectorAll('label span')].find(s => s.textContent.startsWith('I consent')); const consentOk = consent ? consent.textContent === TCPA : null;
        return { nodes, low: low.slice(0, 5), overflow: document.documentElement.scrollWidth > innerWidth, clipped: clipped.slice(0, 3), h1: document.querySelectorAll('h1').length, heroHit: hit, consentOk };
      }, TCPA);
      console.log(String(w).padEnd(5), u.padEnd(30), JSON.stringify({ ...r, errs }));
      if (w === 1280) {
        const has = async (sel) => p.evaluate(s => !!document.querySelector(s), sel);
        if (await has('#rnWrap')) {
          const st = async () => p.evaluate(() => ({ err: document.getElementById('rnErr').textContent, ok: getComputedStyle(document.getElementById('rnOk')).display !== 'none', sent: window.__sent }));
          await p.click('#rnWrap button'); console.log('   empty         ->', JSON.stringify(await st()));
          await p.fill('#rnAddr', '123 Test St'); await p.fill('#rnName', 'Harness Test'); await p.click('#rnWrap button'); console.log('   addr+name     ->', JSON.stringify(await st()));
          await p.fill('#rnEmail', 'harness@example.invalid'); await p.click('#rnWrap button'); console.log('   email, no box ->', JSON.stringify(await st()));
          await p.selectOption('#rnPlan', 'Short-term rental'); await p.fill('#rnNotes', 'harness note'); await p.check('#rnConsent'); await p.click('#rnWrap button'); console.log('   consent       ->', JSON.stringify(await st()), 'crmHits', crmHits);
        } else if (await has('#ldWrap')) {
          const st = async () => p.evaluate(() => ({ err: document.getElementById('ldErr').textContent, ok: getComputedStyle(document.getElementById('ldOk')).display !== 'none', sent: window.__sent }));
          const hasCtx = await has('#ldCtx');
          if (hasCtx) await p.fill('#ldCtx', '123 Test St');
          await p.fill('#ldName', 'Harness Test'); await p.fill('#ldEmail', 'harness@example.invalid'); await p.click('#ldWrap button'); console.log('   email, no box ->', JSON.stringify(await st()));
          await p.check('#ldConsent'); await p.click('#ldWrap button'); console.log('   consent       ->', JSON.stringify(await st()), 'crmHits', crmHits);
        }
      }
    }
    await c.close();
  }
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
