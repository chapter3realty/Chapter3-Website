/* Tax comparison engine. ONE source of truth: this file is embedded verbatim
 * into every page that carries the calculator AND loaded by test-tax.js, so a
 * number can never differ between the browser and the tests.
 *
 * Every rate, bracket, deduction and threshold below traces to
 * data/relocating/state-tax.json, which in turn traces to the statutes and
 * departments of revenue listed in research/relocating/state-tax-table.md.
 * The South Carolina property tax math is the SAME math as the calculator on
 * /buyers/property-taxes/ (2025 certified millage, Act 388 school operating
 * exemption on a legal residence, $50,000 homestead exemption at 65+).
 *
 * WHERE A RULE IS UNCERTAIN THE ENGINE ERRS AGAINST US: it leaves out
 * Connecticut's exemption phase-out and benefit recapture, and New Jersey's
 * age exemption, all of which would RAISE the number we show for the state
 * someone is leaving. It never shortens the South Carolina side.
 */
(function (root) {
  'use strict';

  var D = 1;   // dollars, kept for readability in the tables below

  // ---- brackets: [topOfBracket|null, rate] ---------------------------------
  var RULES = {
    NY: {
      name: 'New York',
      bS: [[8500, .039], [11700, .044], [13900, .0515], [80650, .054], [215400, .059], [1077550, .0685], [5000000, .0965], [25000000, .103], [null, .109]],
      bM: [[17150, .039], [23600, .044], [27900, .0515], [161550, .054], [323200, .059], [2155350, .0685], [5000000, .0965], [25000000, .103], [null, .109]],
      std: { s: 8000, m: 16050 }, exempt: { s: 0, m: 0 },
      propRate: .0130,
      local: { label: 'New York City or Yonkers income tax rate', base: 'taxable', hint: 'New York City runs about 3 to 4 percent. Leave it at 0 if you live outside the city.' },
      ret: 'ny',
    },
    NJ: {
      name: 'New Jersey',
      bS: [[20000, .014], [35000, .0175], [40000, .035], [75000, .05525], [500000, .0637], [1000000, .0897], [null, .1075]],
      bM: [[20000, .014], [50000, .0175], [70000, .0245], [80000, .035], [150000, .05525], [500000, .0637], [1000000, .0897], [null, .1075]],
      std: { s: 0, m: 0 }, exempt: { s: 1000, m: 2000 },
      propRate: .0188,
      local: null,
      ret: 'nj',
    },
    PA: {
      name: 'Pennsylvania',
      bS: [[null, .0307]], bM: [[null, .0307]],
      std: { s: 0, m: 0 }, exempt: { s: 0, m: 0 },
      propRate: .0126,
      local: { label: 'Your local earned income tax rate', base: 'wages', hint: 'Most Pennsylvania towns charge one. It averages about 1 percent and is on your pay stub.' },
      ret: 'pa',
    },
    OH: {
      name: 'Ohio',
      bS: [[26050, 0], [null, .0275]], bM: [[26050, 0], [null, .0275]],
      std: { s: 0, m: 0 }, exempt: { s: 2400, m: 4800 },
      propRate: .0136,
      local: { label: 'Your city income tax rate', base: 'wages', hint: 'Most Ohio cities charge 1 to 3 percent on wages. It is on your pay stub.' },
      ret: 'oh',
    },
    MD: {
      name: 'Maryland',
      bS: [[1000, .02], [2000, .03], [3000, .04], [100000, .0475], [125000, .05], [150000, .0525], [250000, .055], [500000, .0575], [1000000, .0625], [null, .065]],
      bM: [[1000, .02], [2000, .03], [3000, .04], [150000, .0475], [175000, .05], [225000, .0525], [300000, .055], [600000, .0575], [1200000, .0625], [null, .065]],
      std: { s: 3350, m: 6700 }, exempt: { s: 3200, m: 6400 },
      propRate: .0092,
      local: { label: 'Your county income tax rate', base: 'taxable', hint: 'Every Maryland county and Baltimore City charges one. Statewide it averages about 2.5 percent, and yours is on your return.' },
      ret: 'md',
    },
    VA: {
      name: 'Virginia',
      bS: [[3000, .02], [5000, .03], [17000, .05], [null, .0575]],
      bM: [[3000, .02], [5000, .03], [17000, .05], [null, .0575]],
      std: { s: 8750, m: 17500 }, exempt: { s: 930, m: 1860 },
      propRate: .0078,
      local: null,
      ret: 'va',
    },
    NC: {
      name: 'North Carolina',
      bS: [[null, .0399]], bM: [[null, .0399]],
      std: { s: 12750, m: 25500 }, exempt: { s: 0, m: 0 },
      propRate: .0066,
      local: null,
      ret: 'nc',
    },
    CT: {
      name: 'Connecticut',
      bS: [[10000, .02], [50000, .045], [100000, .055], [200000, .06], [250000, .065], [500000, .069], [null, .0699]],
      bM: [[20000, .02], [100000, .045], [200000, .055], [400000, .06], [500000, .065], [1000000, .069], [null, .0699]],
      std: { s: 0, m: 0 }, exempt: { s: 15000, m: 24000 },
      propRate: .0154,
      local: null,
      ret: 'ct',
    },
    MA: {
      name: 'Massachusetts',
      bS: [[1083150, .05], [null, .09]], bM: [[1083150, .05], [null, .09]],
      std: { s: 0, m: 0 }, exempt: { s: 4400, m: 8800 },
      propRate: .0100,
      local: null,
      ret: 'ma',
    },
    FL: { name: 'Florida', bS: [[null, 0]], bM: [[null, 0]], std: { s: 0, m: 0 }, exempt: { s: 0, m: 0 }, propRate: .0078, local: null, ret: 'none' },
    TX: { name: 'Texas', bS: [[null, 0]], bM: [[null, 0]], std: { s: 0, m: 0 }, exempt: { s: 0, m: 0 }, propRate: .0140, local: null, ret: 'none' },
    SC: {
      name: 'South Carolina',
      bS: [[30000, .0199], [null, .0521]], bM: [[30000, .0199], [null, .0521]],
      std: { s: 15000, m: 30000 }, exempt: { s: 0, m: 0 },
      propRate: null,   // computed from Horry County millage instead
      local: null,
      ret: 'sc',
    },
  };

  // Horry County, tax year 2025 certified millage, unincorporated (the same
  // constants as the calculator on /buyers/property-taxes/).
  var HORRY_MILLS = 201.0, SCHOOL_OPS = 109.1, HOMESTEAD = 50000, RES_RATIO = .04;

  function bracketTax(taxable, brackets) {
    var t = 0, prev = 0;
    for (var i = 0; i < brackets.length; i++) {
      var top = brackets[i][0], rate = brackets[i][1];
      var ceil = (top === null) ? Infinity : top;
      if (taxable > prev) t += (Math.min(taxable, ceil) - prev) * rate;
      prev = ceil;
      if (taxable <= ceil) break;
    }
    return Math.max(0, t);
  }

  /* Returns the part of retirement money that the state actually taxes, plus
   * any credit it hands back. inc: {wages, pension, ss, military}. */
  function retirement(code, inc, mfj, is65) {
    var agi = inc.wages + inc.pension + inc.military + inc.ss;
    var out = { pension: inc.pension, military: inc.military, ss: 0, credit: 0, extraDeduction: 0 };
    switch (code) {
      case 'ny':
        // $20,000 pension and annuity exclusion per taxpayer at 59.5+; federal
        // and military pensions are exempt with no cap.
        out.military = 0;
        out.pension = Math.max(0, inc.pension - (is65 ? 20000 * (mfj ? 2 : 1) : 0));
        break;
      case 'nj': {
        // Hard income cliffs, NJ Division of Taxation pension exclusion table.
        out.military = 0;
        var pct = 0;
        if (agi <= 100000) pct = 1;
        else if (agi <= 125000) pct = mfj ? .50 : .375;
        else if (agi <= 150000) pct = mfj ? .25 : .1875;
        var cap = mfj ? 100000 : 75000;
        if (pct > 0 && agi <= 150000) {
          var allow = (pct === 1) ? Math.min(inc.pension, cap) : inc.pension * pct;
          out.pension = Math.max(0, inc.pension - allow);
        }
        break;
      }
      case 'pa':
        // No retirement income is taxed once you are retired.
        out.pension = 0; out.military = 0;
        break;
      case 'oh': {
        // ORC 5747.01(A)(23), opened 2026-08-28: deduct "amounts received by
        // the taxpayer as retired personnel pay for service in the uniformed
        // services or reserve components thereof, or the national guard".
        out.military = 0;
        var p = inc.pension;
        if (agi < 100000 && p > 0) {
          out.credit += p >= 8000 ? 200 : p >= 5000 ? 130 : p >= 3000 ? 80 : p >= 1500 ? 50 : p >= 500 ? 25 : 0;
        }
        if (is65 && agi < 100000) out.credit += 50;
        break;
      }
      case 'md': {
        // Worksheet 13A: up to $41,200 per person at 65+, REDUCED by Social
        // Security received. Military subtraction $20,000 at 55+.
        out.military = Math.max(0, inc.military - (is65 ? 20000 : 12500));
        if (is65) {
          var people = mfj ? 2 : 1;
          var room = Math.max(0, 41200 * people - inc.ss);
          out.pension = Math.max(0, inc.pension - Math.min(inc.pension, room));
        }
        break;
      }
      case 'va': {
        out.military = Math.max(0, inc.military - 40000);
        if (is65) {
          var floor = mfj ? 75000 : 50000;
          var age = Math.max(0, 12000 * (mfj ? 2 : 1) - Math.max(0, agi - floor));
          out.extraDeduction += age + 800 * (mfj ? 2 : 1);
        }
        break;
      }
      case 'ct': {
        out.military = 0;
        var lo = mfj ? 100000 : 75000, hi = mfj ? 150000 : 100000;
        if (agi >= lo) out.ss = inc.ss * .75;          // 25% deductible above the line
        var share = agi <= lo ? 1 : agi >= hi ? 0 : (hi - agi) / (hi - lo);
        out.pension = inc.pension * (1 - share);
        break;
      }
      case 'ma':
        out.military = 0;
        break;
      case 'nc':
        out.military = 0;   // 20 years of service or medical retirement
        break;
      case 'sc': {
        out.military = 0;                       // exempt at any age
        var people = mfj ? 2 : 1;
        var retDed = Math.min(inc.pension, (is65 ? 10000 : 3000) * people);
        out.pension = inc.pension - retDed;
        if (is65) out.extraDeduction += Math.max(0, 15000 * people - retDed - Math.min(inc.military, 15000 * people));
        break;
      }
      case 'none':
      default:
        out.pension = 0; out.military = 0;
    }
    return out;
  }

  /* inputs: {state, mfj, is65, wages, pension, ss, military, homeNow, homeHere, localRate} */
  function calc(inp) {
    var out = { now: {}, here: {} };
    [['now', inp.state], ['here', 'SC']].forEach(function (pair) {
      var side = pair[0], code = pair[1], R = RULES[code];
      var inc = { wages: inp.wages || 0, pension: inp.pension || 0, ss: inp.ss || 0, military: inp.military || 0 };
      var r = retirement(R.ret, inc, !!inp.mfj, !!inp.is65);
      var gross = inc.wages + r.pension + r.military + r.ss;
      var ded = (inp.mfj ? R.std.m : R.std.s) + (inp.mfj ? R.exempt.m : R.exempt.s) + r.extraDeduction;
      var taxable = Math.max(0, gross - ded);
      var income = Math.max(0, bracketTax(taxable, inp.mfj ? R.bM : R.bS) - r.credit);

      var localRate = (side === 'now' && R.local) ? (inp.localRate || 0) : 0;
      var localBase = (R.local && R.local.base === 'wages') ? inc.wages : taxable;
      var local = localRate * localBase;

      var prop;
      if (side === 'here') {
        var fmv = Math.max(0, (inp.homeHere || 0) - (inp.is65 ? HOMESTEAD : 0));
        prop = fmv * RES_RATIO * (HORRY_MILLS - SCHOOL_OPS) / 1000;
      } else {
        prop = (inp.homeNow || 0) * R.propRate;
      }
      out[side] = { income: income, local: local, property: prop, total: income + local + prop, taxableIncome: taxable };
    });
    out.difference = out.now.total - out.here.total;
    return out;
  }

  root.C3TAX = { RULES: RULES, calc: calc, bracketTax: bracketTax, retirement: retirement };
})(typeof window !== 'undefined' ? window : globalThis);
