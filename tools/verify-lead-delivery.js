// Every lead form actually sends its lead, with consent, and sends nothing without it.
// Usage (a server on the port serving chapter3realty/):
//   NODE_PATH=$(npm root -g) node tools/verify-lead-delivery.js [base url]
// The CRM endpoint is answered inside the browser: no request leaves this machine and no
// test lead reaches the CRM. Each form is filled like a visitor would fill it, once with the
// consent box left empty (must send nothing) and once ticked (must send one lead that says
// consent: true). Four forms showed "thank you" and sent nothing until 2026-10-02 because
// their c3SendForm call carried no consent field; build.js now refuses that statically, and
// this proves the browser behaviour.
const { chromium } = require('playwright');
const BASE = (process.argv.find((a) => /^https?:/.test(a)) || 'http://127.0.0.1:8123/').replace(/\/?$/, '/');

const FORMS = [
  { name: 'listings search pop-up', page: 'about/', open: (p) => p.evaluate(() => openIdx()),
    fill: async (p) => { await p.fill('#idxName', 'Harness Test'); await p.fill('#idxPhone', '8435550100'); await p.fill('#idxEmail', 'harness@example.invalid'); },
    box: '#idxConsent', submit: (p) => p.click('#idxModal button.btn-brass'), expect: { formName: 'IDX Listing Search', message: /^Listing search\. City:/ } },
  { name: 'specialized agent, /invest/', page: 'invest/',
    fill: async (p) => { await p.fill('.specialist-form [name=sa-name]', 'Harness Test'); await p.fill('.specialist-form [name=sa-email]', 'harness@example.invalid'); await p.fill('.specialist-form [name=sa-phone]', '8435550100'); },
    box: '#saConsent', submit: (p) => p.click('.specialist-form button.btn-brass'), expect: { formName: 'Specialized Agent Request' } },
  { name: 'specialized agent, /why-chapter-3/', page: 'why-chapter-3/',
    fill: async (p) => { await p.fill('.specialist-form [name=sa-name]', 'Harness Test'); await p.fill('.specialist-form [name=sa-email]', 'harness@example.invalid'); await p.fill('.specialist-form [name=sa-phone]', '8435550100'); },
    box: '#saConsent', submit: (p) => p.click('.specialist-form button.btn-brass'), expect: { formName: 'Specialized Agent Request' } },
  { name: 'off-market alerts', page: 'buyers/buying-in-myrtle-beach/',
    fill: async (p) => { await p.fill('#offMarketForm [name=name]', 'Harness Test'); await p.fill('#offMarketForm [name=phone]', '8435550100'); },
    box: '#bimbConsent', submit: (p) => p.evaluate(() => { const f = document.getElementById('offMarketForm'); if (f.requestSubmit) f.requestSubmit(); else f.submit(); }), expect: { formName: 'Off-Market Alert Form' } },
  { name: 'investor report gate', page: 'invest/long-term-rental/',
    open: (p) => p.evaluate(() => { window.ltrRunPDF = function () { window.__pdf = (window.__pdf || 0) + 1; }; ltrOpenGate('pdf'); }),
    fill: async (p) => { await p.fill('#ltr-gate-name', 'Harness Test'); await p.fill('#ltr-gate-email', 'harness@example.invalid'); await p.fill('#ltr-gate-phone', '8435550100'); },
    box: '#ltr-gate-consent', submit: (p) => p.click('#ltr-gate-submit'), expect: { formName: 'Investor Report Request', message: /^Investor report request\./ } },
  { name: 'welcome pop-up', page: 'buyers/', open: (p) => p.evaluate(() => window.c3PopOpen && window.c3PopOpen()),
    fill: async (p) => { await p.waitForSelector('#c3-pop-name', { state: 'visible', timeout: 12000 }); await p.fill('#c3-pop-name', 'Harness Test'); await p.fill('#c3-pop-phone', '8435550100'); await p.fill('#c3-pop-email', 'harness@example.invalid'); },
    box: '#c3-pop-consent', submit: (p) => p.click('#c3-pop-send'), expect: { formName: 'Site popup' } },
  { name: 'contact page', page: 'contact/',
    fill: async (p) => { const f = '#contactForm'; await p.check(`${f} [name=interest]`); for (const [n, v] of [['name', 'Harness Test'], ['email', 'harness@example.invalid'], ['phone', '8435550100']]) { const el = await p.$(`${f} [name=${n}]`); if (el) await el.fill(v); } },
    box: '#contactForm [name=consent]', submit: (p) => p.evaluate(() => { const f = document.getElementById('contactForm'); if (f.requestSubmit) f.requestSubmit(); else f.submit(); }), expect: { formName: 'Contact page' } },
];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0;
  for (const F of FORMS) {
    for (const ticked of [false, true]) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
      await ctx.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
      const sent = [];
      await ctx.route('**/api/forms/**', (route) => { try { sent.push(JSON.parse(route.request().postData() || '{}')); } catch (e) { sent.push({ unparsed: true }); } route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"harness":true}' }); });
      await ctx.route(/googletagmanager|google-analytics|maps\.googleapis|cloudflareinsights|cdnjs/, (r) => r.abort());
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', (e) => errs.push(e.message.slice(0, 90)));
      await p.goto(BASE + F.page, { waitUntil: 'load' });
      if (F.page === 'buyers/') await p.evaluate(() => { try { localStorage.removeItem('c3PopDone'); } catch (e) {} });
      if (F.open) await F.open(p);
      await p.waitForTimeout(300);
      try {
        await F.fill(p);
        if (ticked) await p.check(F.box);
        await F.submit(p);
      } catch (e) { errs.push('drive: ' + e.message.slice(0, 120)); }
      await p.waitForTimeout(900);
      const lead = sent[0];
      let ok, why = '';
      if (!ticked) { ok = sent.length === 0; why = ok ? 'nothing sent' : `sent ${sent.length} without consent`; }
      else {
        ok = sent.length === 1 && lead.consent === true && lead.formName === F.expect.formName && /I consent to receive/.test(lead.consentText || '') && (!F.expect.message || F.expect.message.test(lead.message || ''));
        why = sent.length ? JSON.stringify({ consent: lead.consent, formName: lead.formName, message: (lead.message || '').slice(0, 40), consentText: (lead.consentText || '').slice(0, 20) }) : 'NOTHING SENT';
      }
      if (errs.length) { ok = false; why += ' errors: ' + errs.join(' | '); }
      if (!ok) bad++;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${F.name.padEnd(36)} box ${ticked ? 'ticked  ' : 'unticked'}  ${why}`);
      await ctx.close();
    }
  }
  await b.close();
  console.log(bad ? `\n${bad} failing` : '\nall lead forms deliver with consent and send nothing without it');
  process.exitCode = bad ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(2); });
