/* Tests for tax-engine.js. Run: node data/relocating/test-tax.js
 * Wired into `node build.js preflight`, because a calculator that drifts from
 * state-tax.json is exactly the kind of defect that ships silently.
 *
 * Two jobs:
 *   1. DRIFT: every bracket, deduction and property rate in the engine must
 *      still match data/relocating/state-tax.json.
 *   2. MATH: hand-computed cases, worked on paper first, then compared.
 */
'use strict';
const fs = require('fs'), path = require('path');
require(path.join(__dirname, 'tax-engine.js'));
const T = globalThis.C3TAX;
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'state-tax.json'), 'utf8'));

let fails = 0;
const near = (a, b, tol = 0.51) => Math.abs(a - b) <= tol;
function check(name, got, want) {
  const ok = typeof want === 'number' ? near(got, want) : got === want;
  if (!ok) { fails++; console.log(`  FAIL ${name}: got ${got}, want ${want}`); }
  else console.log(`  ok   ${name}: ${typeof got === 'number' ? Math.round(got * 100) / 100 : got}`);
}

// ---------- 1. drift against state-tax.json --------------------------------
console.log('drift check against state-tax.json');
for (const abbr of Object.keys(T.RULES)) {
  const R = T.RULES[abbr];
  const J = DATA.states.find(s => s.abbr === abbr);
  if (!J) { fails++; console.log(`  FAIL ${abbr}: not in state-tax.json`); continue; }
  // FL and TX carry an empty bracket list in the data file because they have
  // no income tax; the engine writes that as one zero-rate bracket.
  const flat = b => (b && b.length ? b : [{ upTo: null, rate: 0 }])
    .map(x => `${x.upTo === null ? 'top' : x.upTo}@${x.rate}`).join(',');
  const flatE = b => b.map(x => `${x[0] === null ? 'top' : x[0]}@${x[1]}`).join(',');
  check(`${abbr} single brackets`, flatE(R.bS), flat(J.bracketsSingle));
  check(`${abbr} joint brackets`, flatE(R.bM), flat(J.bracketsMFJ));
  check(`${abbr} std single`, R.std.s, J.stdDeductionSingle || 0);
  check(`${abbr} std joint`, R.std.m, J.stdDeductionMFJ || 0);
  if (abbr !== 'SC') check(`${abbr} property rate`, R.propRate, J.effectivePropertyTaxRate);
}

// ---------- 2. hand-computed cases -----------------------------------------
console.log('\nhand-computed cases');
const base = { mfj: false, is65: false, wages: 0, pension: 0, ss: 0, military: 0, homeNow: 0, homeHere: 0, localRate: 0 };
const run = o => T.calc(Object.assign({}, base, o));

// PA flat 3.07% on wages, no deduction.
check('PA wages 100k', run({ state: 'PA', wages: 100000 }).now.income, 3070);
// PA taxes no retirement income at all.
check('PA retiree pension 60k + SS 30k', run({ state: 'PA', pension: 60000, ss: 30000, is65: true }).now.income, 0);
// SC joint wages 100k: (100k - 30k std) -> 30k @1.99% + 40k @5.21%.
check('SC joint wages 100k', run({ state: 'PA', wages: 100000, mfj: true }).here.income, 597 + 2084);
// SC property, 342k home, under 65: 342000 * .04 * .0919
check('SC property 342k', run({ state: 'PA', homeHere: 342000 }).here.property, 342000 * 0.04 * 0.0919);
// SC property with the 65+ homestead exemption on the first $50,000.
check('SC property 342k at 65+', run({ state: 'PA', homeHere: 342000, is65: true }).here.property, 292000 * 0.04 * 0.0919);
// NC: SS exempt, pension fully taxed at 3.99% after the 12,750 deduction.
check('NC pension 60k + SS 30k', run({ state: 'NC', pension: 60000, ss: 30000, is65: true }).now.income, (60000 - 12750) * 0.0399);
// CT joint, AGI 120k: SS 75% taxable, pension deduction 60% (linear), exemption 24k.
check('CT joint pension 80k + SS 40k', run({ state: 'CT', pension: 80000, ss: 40000, mfj: true, is65: true }).now.income, 400 + 810);
// MD 65+: exclusion room 41,200 - 20,000 SS = 21,200 against a 50,000 pension.
check('MD 65+ pension 50k + SS 20k', run({ state: 'MD', pension: 50000, ss: 20000, is65: true }).now.income, 20 + 30 + 40 + (22250 - 3000) * 0.0475);
// VA 65+ military 50k: 40k subtraction, then the age deduction wipes the rest.
check('VA 65+ military 50k', run({ state: 'VA', military: 50000, is65: true }).now.income, 0);
// OH wages 60k with a 2% city tax: state on 57,600 above the 26,050 zero band.
const oh = run({ state: 'OH', wages: 60000 });
check('OH state on 60k wages', oh.now.income, (57600 - 26050) * 0.0275);
check('OH city tax, default yes at 2%', oh.now.local, 1200);
check('OH city tax, answered no', run({ state: 'OH', wages: 60000, localChoice: 'no' }).now.local, 0);
// New York City resident schedule, IT-201 instructions: MFJ 3,264 + 3.876%
// of the excess over 90,000.
const ny = run({ state: 'NY', wages: 120000, mfj: true });
check('NY taxable income', ny.now.taxableIncome, 103950);
check('NYC tax on that', ny.now.local, 3264 + (103950 - 90000) * 0.03876);
check('NYC row label', ny.now.localLabel, 'New York City income tax');
// Yonkers is a surcharge of 16.75 percent of the state tax, not a rate on income.
check('Yonkers surcharge', run({ state: 'NY', wages: 120000, mfj: true, localChoice: 'yonkers' }).now.local, ny.now.income * 0.1675);
check('No city, no local tax', run({ state: 'NY', wages: 120000, mfj: true, localChoice: 'no' }).now.local, 0);
// Pennsylvania and Maryland: one at the state average, one automatic.
check('PA local EIT at 1%', run({ state: 'PA', wages: 80000 }).now.local, 800);
const md2 = run({ state: 'MD', wages: 80000 });
check('MD county tax at the 2.51% average', md2.now.local, md2.now.taxableIncome * 0.0251);
// Every worked example has to show a saving, or the page opens on a dud.
for (const st of ['NY', 'NJ', 'PA', 'OH', 'MD', 'VA', 'NC', 'CT', 'MA']) {
  const e = T.calc(T.example(st));
  if (!(e.difference > 0)) { fails++; console.log(`  FAIL ${st} example shows no saving`); }
  else console.log(`  ok   ${st} example saves ${Math.round(e.difference)}`);
}
// NJ cliff: at 150,001 of total income the pension exclusion is gone.
check('NJ pension 60k at AGI 160k', run({ state: 'NJ', wages: 100000, pension: 60000, mfj: true, is65: true }).now.taxableIncome, 158000);
check('NJ pension 60k at AGI 90k', run({ state: 'NJ', pension: 60000, ss: 30000, mfj: true, is65: true }).now.taxableIncome, 0);
// Social Security is untaxed in every state we compare, and in SC.
for (const st of ['NY', 'NJ', 'PA', 'OH', 'MD', 'VA', 'NC', 'MA']) {
  check(`${st} SS 40k alone`, run({ state: st, ss: 40000, is65: true }).now.income, 0);
}
check('SC SS 40k alone', run({ state: 'PA', ss: 40000, is65: true }).here.income, 0);
// A whole comparison: NJ couple, 65+, 90k pension, 20k SS, 600k house -> 342k here.
const full = run({ state: 'NJ', pension: 90000, ss: 20000, mfj: true, is65: true, homeNow: 600000, homeHere: 342000 });
check('NJ couple property now', full.now.property, 600000 * 0.0188);
check('NJ couple property here', full.here.property, 292000 * 0.04 * 0.0919);
check('difference is now minus here', full.difference, full.now.total - full.here.total);

console.log(fails === 0 ? '\nTAX ENGINE OK' : `\nTAX ENGINE FAILURES: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
