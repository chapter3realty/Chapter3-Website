// The sample report beside the homepage analyzer is what the analyzer itself returns for that house.
//   node sample.js <base url>   (the site root: the homepage and /invest/long-term-rental/ are read from it)
// Runs the long-term rental analyzer's own code (ltrRenderResults, recalcLtr) on the sample's inputs in its own page, for a
// cash purchase with no county record, then compares every figure, pill and the badge with the homepage's sample.
const { chromium } = require('playwright');
const BASE = (process.argv[2] || 'http://localhost:8124/').replace(/\/?$/, '/');
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };
const money = (s) => { const m = /\$([\d,]+)/.exec(s || ''); return m ? +m[1].replace(/,/g, '') : null; };
const pct = (s) => { const m = /([\d.]+)%/.exec(s || ''); return m ? +m[1] : null; };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.c3PopDone = 1; } catch (e) {} });
  // the homepage sample
  await p.goto(BASE, { waitUntil: 'load' });
  const home = await p.evaluate(() => {
    const r = document.querySelector('.an-rep'), t = (s) => { const e = r.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
    const kpi = {}; r.querySelectorAll('.kpi').forEach((k) => { kpi[k.querySelector('.k').textContent.trim()] = { v: k.querySelector('b').textContent, pill: (k.querySelector('i') || {}).textContent || '' }; });
    const rows = [...r.querySelectorAll('.rep-exp li')].map((li) => [li.querySelector('span').textContent, li.querySelector('b').textContent]);
    return { value: t('.rep-val b'), badge: t('.rep-badge'), verdict: t('.rep-verdict'), addr: t('.rep-addr'), kpi, rows, total: t('.rep-exp .tot b'), note: t('.rep-note'), text: r.textContent };
  });
  const price = money(home.value), rent = money(home.kpi['Monthly rent'] && home.kpi['Monthly rent'].v), appr = pct(home.kpi['Appreciation'] && home.kpi['Appreciation'].v);
  const mg = /Management, (\d+)% of the rent/.exec(home.rows.map((r) => r[0]).join('|'));
  ok('the sample states its inputs: price, rent, management, appreciation', price && rent && mg && appr != null, JSON.stringify({ price, rent, mgmt: mg && mg[1], appr }));
  // the analyzer's own code on those inputs
  await p.goto(BASE + 'invest/long-term-rental/', { waitUntil: 'load' });
  const an = await p.evaluate(({ price, rent, mgmt, appr }) => {
    document.getElementById('ltr-mgmt').value = String(mgmt);
    const d = { estimatedValue: price, estRentMonthly: rent, insuranceAnnual: 1800, utilitiesMonthly: 0, hoaAnnual: 0, propertyTaxAnnual: 0, maintenanceAnnual: 0, managementFeeAnnual: 0,
      estimatedAppreciationPct: appr, verdict: 'sample', narrative: '', flags: [], inferredBeds: 3, inferredBaths: 2, inferredSqft: 0 };
    ltrRenderResults(d, 'Sample', false, true);
    // a card: its colour bar, its label (whose first text is the name; a help tip follows it), its value, its pill
    const card = (root) => [...document.querySelectorAll(root + ' > div')].map((c) => ({ label: c.children[1].firstChild.textContent.trim(), v: c.children[2].textContent.trim(), pill: c.children[3] ? c.children[3].textContent.trim() : '' }));
    const rows = [...document.querySelectorAll('#ltr-expense-table > div > div')].map((r) => [r.children[0].textContent.trim(), r.children[1].textContent.trim()]);
    return { cards: card('#ltr-core-metrics').concat(card('#ltr-income-metrics'), card('#ltr-return-metrics')), rows, badge: document.getElementById('ltr-r-badge').textContent.trim(), value: document.getElementById('ltr-r-value').textContent.trim() };
  }, { price, rent, mgmt: +mg[1], appr });
  const C = (l) => an.cards.find((c) => c.label === l) || {}, R = (l) => (an.rows.find((r) => r[0].startsWith(l)) || [])[1];
  ok('the analyzer runs on the sample inputs', an.cards.length >= 7 && an.rows.length >= 5, JSON.stringify(an.cards.map((c) => c.label)));
  ok('estimated value', money(an.value) === price, `${an.value} vs ${home.value}`);
  ok('a cash purchase: no loan, no payment, no rate on either', C('Cash Purchase').v === '100%' && !/Mortgage|DSCR|Interest/i.test(an.rows.map((r) => r[0]).join() + an.cards.map((c) => c.label).join()) && !/mortgage|loan payment|interest rate|\bDSCR\b/i.test(home.text.replace('so no loan is shown', '')), C('Cash Purchase').v);
  ok('monthly cash flow and its pill', C('Monthly Cash Flow').v === home.kpi['Monthly cash flow'].v && C('Monthly Cash Flow').pill.toLowerCase() === home.kpi['Monthly cash flow'].pill.toLowerCase(), `${C('Monthly Cash Flow').v} ${C('Monthly Cash Flow').pill} vs ${home.kpi['Monthly cash flow'].v} ${home.kpi['Monthly cash flow'].pill}`);
  ok('cap rate and its pill', C('Cap Rate').v === home.kpi['Cap rate'].v && C('Cap Rate').pill.toLowerCase() === home.kpi['Cap rate'].pill.toLowerCase(), `${C('Cap Rate').v} ${C('Cap Rate').pill} vs ${home.kpi['Cap rate'].v} ${home.kpi['Cap rate'].pill}`);
  ok('monthly rent', C('Monthly Rent').v === home.kpi['Monthly rent'].v, C('Monthly Rent').v);
  ok('net income a year is the analyzer\'s annual NOI', C('Annual NOI').v === home.kpi['Net income a year'].v, `${C('Annual NOI').v} vs ${home.kpi['Net income a year'].v}`);
  ok('appreciation', C('Appreciation').v === appr.toFixed(1) + '%/yr' && home.kpi['Appreciation'].v === appr.toFixed(1) + '% a year', `${C('Appreciation').v} vs ${home.kpi['Appreciation'].v}`);
  const hr = (l) => (home.rows.find((r) => r[0].startsWith(l)) || [])[1];
  ok('each cost a year', R('Property Tax') === hr('Property tax') && R('Insurance') === hr('Insurance') && R('Management') === hr('Management') && R('Maintenance') === hr('Maintenance') && R('Total Operating') === home.total,
    JSON.stringify(an.rows.slice(0, 6)) + ' vs ' + JSON.stringify(home.rows) + ' ' + home.total);
  ok('the badge: a strong deal', an.badge === 'Strong Deal' && /strong deal/i.test(home.badge), `${an.badge} vs ${home.badge}`);
  ok('the verdict states the monthly cash flow', home.verdict.includes(home.kpi['Monthly cash flow'].v), home.verdict);
  ok('the sample says it is a sample, with no street address', /sample/i.test(home.note) && /^\d+ bed, \d+ bath house/.test(home.addr) && !/\d+ [A-Z][a-z]+ (St|Street|Rd|Road|Ave|Dr|Ln|Way|Ct|Blvd)\b/.test(home.text), home.addr);
  await b.close();
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
  process.exitCode = results.every(Boolean) ? 0 : 1;
})().catch((e) => { console.error(e); process.exit(1); });
