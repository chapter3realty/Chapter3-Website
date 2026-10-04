// The listings search pop-up works without a mouse and without sight.
// Usage (a server on the port serving chapter3realty/):
//   NODE_PATH=$(npm root -g) node tools/verify-idx-a11y.js [base url]
// Checks, at desktop and phone width, opening it from the keyboard: it is exposed to
// screen readers as a named modal dialog, focus moves in, Tab and Shift+Tab never leave
// it, the page behind is inert, every field has a name, the pills report pressed state,
// Escape closes it, focus returns to the button that opened it, and nothing stays inert.
// Until 2026-10-02 it kept aria-hidden="true" while open and focus stayed behind it.
const { chromium } = require('playwright');
const BASE = (process.argv.find((a) => /^https?:/.test(a)) || 'http://127.0.0.1:8123/').replace(/\/?$/, '/');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0;
  const ok = (name, pass, detail = '') => { if (!pass) bad++; console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`); };
  for (const [w, h, page] of [[1280, 900, 'about/'], [390, 844, 'invest/llc/']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, isMobile: w < 500 });
    await ctx.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
    await ctx.route(/googletagmanager|google-analytics|maps\.googleapis|cloudflareinsights/, (r) => r.abort());
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + page, { waitUntil: 'load' });
    // a visible control that opens the pop-up, reached and pressed from the keyboard
    const opener = await p.evaluateHandle(() => {
      const all = [...document.querySelectorAll('[onclick*="openIdx"]')];
      return all.find((el) => el.getBoundingClientRect().width >= 2) || all.find((el) => el.closest('.mobile-nav'));
    });
    const openerTag = await p.evaluate((el) => { if (el.closest('.mobile-nav')) toggleMobile(); el.focus(); return el.outerHTML.slice(0, 80); }, opener);
    await p.waitForTimeout(150);
    await p.keyboard.press('Enter');
    await p.waitForTimeout(300);
    const st = await p.evaluate(() => {
      const m = document.getElementById('idxModal'), panel = m.querySelector('[role=dialog]');
      const inertMain = !!(document.querySelector('main') && document.querySelector('main').closest('[inert]'));
      return { open: m.classList.contains('open'), hidden: m.getAttribute('aria-hidden'), modal: panel.getAttribute('aria-modal'), name: panel.getAttribute('aria-label'), focusIn: m.contains(document.activeElement), focus: document.activeElement.id || document.activeElement.tagName, inertMain };
    });
    ok(`${w}  opens from the keyboard (${openerTag.replace(/\s+/g, ' ').slice(0, 40)}...)`, st.open, JSON.stringify(st));
    ok(`${w}  exposed as a named modal dialog`, st.hidden === 'false' && st.modal === 'true' && !!st.name);
    ok(`${w}  focus moves into it`, st.focusIn, st.focus);
    ok(`${w}  the page behind is inert`, st.inertMain);
    // what a screen reader is given: the dialog, by name, with its labelled fields
    const tree = await p.locator('#idxModal').ariaSnapshot();
    const combos = (tree.match(/combobox "[^"]+"/g) || []).length, unnamed = (tree.match(/combobox(?! ")/g) || []).length;
    ok(`${w}  screen readers see the named dialog and its labelled selects`, /dialog "Search Grand Strand listings"/.test(tree) && combos === 7 && unnamed === 0, `${combos} named selects, ${unnamed} unnamed`);
    // Tab and Shift+Tab stay inside
    let left = 0;
    for (let i = 0; i < 45; i++) { await p.keyboard.press('Tab'); if (!(await p.evaluate(() => document.getElementById('idxModal').contains(document.activeElement)))) left++; }
    for (let i = 0; i < 10; i++) { await p.keyboard.press('Shift+Tab'); if (!(await p.evaluate(() => document.getElementById('idxModal').contains(document.activeElement)))) left++; }
    ok(`${w}  Tab and Shift+Tab never leave it (55 presses)`, left === 0, left ? `${left} presses landed outside` : '');
    const names = await p.evaluate(() => {
      const m = document.getElementById('idxModal'); const miss = [];
      for (const el of m.querySelectorAll('select, input, button')) {
        const nm = el.getAttribute('aria-label') || (el.labels && el.labels.length && el.labels[0].textContent.trim()) || (el.tagName === 'BUTTON' && el.textContent.trim());
        if (!nm) miss.push(el.id || el.className || el.tagName);
      }
      const pills = [...m.querySelectorAll('.idx-pill')];
      return { miss, pills: pills.length, pressed: pills.every((x) => x.getAttribute('aria-pressed') === 'false') };
    });
    ok(`${w}  every field and button has a name`, names.miss.length === 0, names.miss.join(', '));
    ok(`${w}  pills report their state`, names.pills === 7 && names.pressed);
    await p.evaluate(() => document.querySelector('#idxModal .idx-pill').focus());
    await p.keyboard.press('Space');
    ok(`${w}  a pill toggles pressed from the keyboard`, (await p.evaluate(() => document.querySelector('#idxModal .idx-pill').getAttribute('aria-pressed'))) === 'true');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(200);
    const after = await p.evaluate(() => ({ open: document.getElementById('idxModal').classList.contains('open'), hidden: document.getElementById('idxModal').getAttribute('aria-hidden'), inert: document.querySelectorAll('[inert]').length, focus: (document.activeElement.getAttribute('onclick') || '').includes('openIdx'), overflow: document.body.style.overflow }));
    ok(`${w}  Escape closes it and hides it again`, !after.open && after.hidden === 'true');
    ok(`${w}  focus returns to the button that opened it`, after.focus);
    ok(`${w}  nothing is left inert, the page scrolls`, after.inert === 0 && after.overflow === '');
    ok(`${w}  no script errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  await b.close();
  console.log(bad ? `\n${bad} failing` : '\nthe search pop-up passes every keyboard and screen reader check');
  process.exitCode = bad ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(2); });
