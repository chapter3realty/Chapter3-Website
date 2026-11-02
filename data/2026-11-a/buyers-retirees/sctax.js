/* The 2026 South Carolina income tax estimate, the same rules as data/2026-11-a/buyers-retirees/build_examples.py
   (ledger rows 2 to 10), written once as a plain function so the page's calculator and this test run the same code. */
function c3ScTax(o) {
  var joint = !!o.joint, ss = Math.max(0, o.ss || 0);
  var people = [{ age: o.age1 || 0, ret: Math.max(0, o.ret1 || 0), mil: Math.max(0, o.mil || 0) }];
  if (joint) people.push({ age: o.age2 || 0, ret: Math.max(0, o.ret2 || 0), mil: 0 });
  var otherInc = Math.max(0, o.other || 0);
  var other = otherInc;
  for (var i = 0; i < people.length; i++) other += people[i].ret + people[i].mil;
  var base = joint ? 32000 : 25000, adj = joint ? 44000 : 34000, prov = other + ss / 2, tss;
  if (prov <= base) tss = 0;
  else if (prov <= adj) tss = Math.min(ss / 2, (prov - base) / 2);
  else tss = Math.min(0.85 * ss, 0.85 * (prov - adj) + Math.min(ss / 2, (adj - base) / 2));
  var agi = other + tss, sc = other;
  var dRet = 0, dAge = 0, dMil = 0;
  for (var j = 0; j < people.length; j++) {
    var p = people[j], r = Math.min(p.ret, p.age >= 65 ? 10000 : 3000);
    dRet += r; dMil += p.mil;
    if (p.age >= 65) dAge += Math.max(0, 15000 - r - p.mil);
  }
  var full = joint ? 30000 : 15000, start = joint ? 80000 : 40000, span = joint ? 110000 : 55000, sciad;
  if (agi <= start) sciad = full;
  else { var f = (agi - start) / span; sciad = f >= 1 ? 0 : full - Math.floor(full * f / 10) * 10; }
  var ti = Math.max(0, sc - dRet - dAge - dMil - sciad);
  var tax = ti <= 0 ? 0 : ti < 30000 ? ti * 0.0199 : ti * 0.0521 - 966;
  return { agi: agi, taxable: ti, tax: Math.round(tax * 100) / 100, deductions: dRet + dAge + dMil + sciad };
}
if (typeof module !== "undefined") module.exports = c3ScTax;
