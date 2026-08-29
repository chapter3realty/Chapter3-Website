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
// CT joint, AGI 120k: SS 75% taxable (30k), pension deduction 60% so 32k is
// taxable, and the exemption is fully phased out above 71k. 62,000 taxable ->
// 400 + 1,890, plus the $200 add-back at that AGI.
check('CT joint pension 80k + SS 40k', run({ state: 'CT', pension: 80000, ss: 40000, mfj: true, is65: true }).now.income, 400 + 1890 + 200);
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
check('NYC row label', ny.now.localLabel, 'New York City tax');
// Yonkers is a surcharge of 16.75 percent of the state tax, not a rate on income.
check('Yonkers surcharge', run({ state: 'NY', wages: 120000, mfj: true, localChoice: 'yonkers' }).now.local, ny.now.income * 0.1675);
check('No city, no local tax', run({ state: 'NY', wages: 120000, mfj: true, localChoice: 'no' }).now.local, 0);
// Pennsylvania and Maryland: one at the state average, one automatic.
check('PA local EIT at 1%', run({ state: 'PA', wages: 80000 }).now.local, 800);
const md2 = run({ state: 'MD', wages: 80000 });
check('MD county tax at the 2.51% average', md2.now.local, md2.now.taxableIncome * 0.0251);
// Connecticut Tax Calculation Schedule, Tables A and C, opened 2026-08-28.
// Joint AGI 120,000: the $24,000 exemption is gone above $71,000, so the tax
// is 400 + 3,600 + 1,100 = 5,100, plus a $200 phase-out add-back.
check('CT joint 120k wages', run({ state: 'CT', wages: 120000, mfj: true }).now.income, 5100 + 200);
// Single AGI 40,000: exemption 15,000 - 10,000 = 5,000, no add-back yet.
check('CT single 40k wages', run({ state: 'CT', wages: 40000 }).now.income, 200 + 1125);
// The exemption survives in full below the phase-out.
// 24,000 taxable: the 2 percent band stops at 20,000, so 400 + 4,000 at 4.5%.
check('CT joint 48k wages', run({ state: 'CT', wages: 48000, mfj: true }).now.income, 400 + 180);
// The add-back caps after ten bands.
check('CT add-back caps at 500', run({ state: 'CT', wages: 400000, mfj: true }).now.income
  - T.bracketTax(400000, T.RULES.CT.bM), 500);
// New Jersey gives an extra $1,000 exemption per person at 65 (NJ Division of
// Taxation, opened 2026-08-29). Omitting it made New Jersey look worse than it
// is, which is the one direction we never allow.
const njY = run({ state: 'NJ', wages: 80000, mfj: true, is65: true });
const njN = run({ state: 'NJ', wages: 80000, mfj: true, is65: false });
check('NJ age 65 exemption is worth 2,000 of deduction', njN.now.taxableIncome - njY.now.taxableIncome, 2000);
check('NJ under 65 taxable', njN.now.taxableIncome, 80000 - 2000);
// The house money is reported alongside the tax.
check('equity freed', run({ state: 'CT', homeNow: 453000, homeHere: 342000 }).equity, 111000);
check('equity never negative', run({ state: 'CT', homeNow: 300000, homeHere: 342000 }).equity, 0);
// The gas and groceries claims are recomputed here from the two data files, so
// a flag in the engine can never drift from the numbers behind it.
const COL = JSON.parse(fs.readFileSync(path.join(__dirname, 'col-places.json'), 'utf8'));
const goodsOf = name => {
  const row = COL.places.find(p => p.name === name);
  return row && row.rpp ? row.rpp.goods : null;
};
const MB_GOODS = goodsOf('Myrtle Beach-Conway-North Myrtle Beach, SC');
const SC_GAS = DATA.states.find(s => s.abbr === 'SC').gasTaxCentsPerGallon;
const STATE_NAME = { NY: 'New York', NJ: 'New Jersey', PA: 'Pennsylvania', OH: 'Ohio', MD: 'Maryland',
  VA: 'Virginia', NC: 'North Carolina', CT: 'Connecticut', MA: 'Massachusetts', FL: 'Florida', TX: 'Texas' };
for (const [abbr, name] of Object.entries(STATE_NAME)) {
  const gas = DATA.states.find(s => s.abbr === abbr).gasTaxCentsPerGallon;
  const goods = goodsOf(`${name} (statewide average)`);
  check(`${abbr} gas claim`, T.CHEAPER[abbr].gas, gas !== null && gas !== undefined && gas - SC_GAS >= 3);
  check(`${abbr} groceries claim`, T.CHEAPER[abbr].goods, goods !== null && goods - MB_GOODS >= 1.5);
}
// Every worked example has to show a saving, or the page opens on a dud.
for (const st of ['NY', 'NJ', 'PA', 'OH', 'MD', 'VA', 'NC', 'CT', 'MA']) {
  const e = T.calc(T.example(st));
  if (!(e.difference > 0)) { fails++; console.log(`  FAIL ${st} example shows no saving`); }
  else console.log(`  ok   ${st} example saves ${Math.round(e.difference)}`);
}
// NJ cliff: at 150,001 of total income the pension exclusion is gone, leaving
// 160,000 less the $2,000 regular and $2,000 age exemptions.
check('NJ pension 60k at AGI 160k', run({ state: 'NJ', wages: 100000, pension: 60000, mfj: true, is65: true }).now.taxableIncome, 160000 - 4000);
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
