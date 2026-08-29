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
 * HONESTY RULE: every simplification still in here is listed in
 * research/relocating/tax-calculator-audit.md with the direction it pushes.
 * Almost all of them UNDERSTATE the state someone is leaving, which makes our
 * saving look smaller, never bigger. The two that run the other way are
 * Pennsylvania's tax forgiveness and Massachusetts's senior circuit breaker,
 * both narrow low-income credits, and both are named on the page itself.
 * The South Carolina side is never shortened.
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
      local: { kind: 'choice', question: 'Do you live inside New York City?', options: [['nyc', 'In the city'], ['yonkers', 'Yonkers'], ['no', 'Neither']], preset: 'nyc',
        note: 'New York City resident rates, from the state&#39;s own IT-201 schedule. Yonkers adds 16.75 percent of your state tax.' },
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
      local: { kind: 'yesno', question: 'Does your town charge the local earned income tax?', preset: 'yes', rate: .01, base: 'wages', rowLabel: 'Local income tax',
        note: 'Most Pennsylvania towns charge one. We use 1 percent, near the state average; yours is on your pay stub.' },
      ret: 'pa',
    },
    OH: {
      name: 'Ohio',
      bS: [[26050, 0], [null, .0275]], bM: [[26050, 0], [null, .0275]],
      std: { s: 0, m: 0 }, exempt: { s: 2400, m: 4800 },
      propRate: .0136,
      local: { kind: 'yesno', question: 'Does your city charge an income tax?', preset: 'yes', rate: .02, base: 'wages', rowLabel: 'City income tax',
        note: 'Ohio cities charge 1 to 3 percent on wages. We use 2 percent; yours is on your pay stub.' },
      ret: 'oh',
    },
    MD: {
      name: 'Maryland',
      bS: [[1000, .02], [2000, .03], [3000, .04], [100000, .0475], [125000, .05], [150000, .0525], [250000, .055], [500000, .0575], [1000000, .0625], [null, .065]],
      bM: [[1000, .02], [2000, .03], [3000, .04], [150000, .0475], [175000, .05], [225000, .0525], [300000, .055], [600000, .0575], [1200000, .0625], [null, .065]],
      std: { s: 3350, m: 6700 }, exempt: { s: 3200, m: 6400 },
      propRate: .0092,
      local: { kind: 'auto', rate: .0251, base: 'taxable', rowLabel: 'County income tax',
        note: 'Every Maryland county and Baltimore City charges one. We use 2.51 percent, the state average; yours is on your return.' },
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
      /* Form CT-1040 Tax Calculation Schedule (Rev. 12/25), opened 2026-08-28.
       * Table A: the personal exemption falls $1,000 for every $1,000 of
       * Connecticut AGI over $30,000 single and $48,000 joint, and is gone at
       * $45,000 and $71,000. Table C: the 2 percent rate phase-out add-back,
       * $25 per $5,000 band over $56,500 single and $50 per $5,000 band over
       * $100,500 joint, capped after ten bands.
       * Table D, the tax recapture, is NOT applied. It starts above $105,000
       * single and $210,000 joint and would raise the Connecticut number
       * further, so leaving it out errs against us, never against the reader. */
      exemptPhase: { startS: 30000, startM: 48000 },
      addBack: { startS: 56500, stepS: 25, startM: 100500, stepM: 50, per: 5000, capSteps: 10 },
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

  /* New York City resident rate schedule, printed in the state's own IT-201
   * instructions (opened 2026-08-28), and the Yonkers resident surcharge of
   * 16.75 percent of the state tax from the same instructions. We apply the
   * city schedule to New York taxable income, which is our estimate: the city
   * starts from the same figure but allows its own credits. */
  var NYC_S = [[12000, .03078], [25000, .03762], [50000, .03819], [null, .03876]];
  var NYC_M = [[21600, .03078], [45000, .03762], [90000, .03819], [null, .03876]];
  var YONKERS = .1675;


  /* What ELSE is cheaper here, state by state. Two sources, both already in
   * the repo, and test-tax.js recomputes these flags from them so they cannot
   * go stale:
   *   gas   - state gas tax, state-tax.json. South Carolina is 28.75 cents.
   *           Flagged only where the other state is at least 3 cents higher.
   *   goods - BEA regional price parity for goods, col-places.json. Myrtle
   *           Beach is 96.339. Flagged only where the other state is at least
   *           1.5 points higher, so a rounding-width gap is never sold as a
   *           saving.
   * INSURANCE IS DELIBERATELY ABSENT. Our own coastal insurance page prices
   * Myrtle Beach zips above $5,000 a year on a standardised $300,000 house,
   * the highest in South Carolina. It usually costs MORE here, and the sources
   * line says so. */
  var CHEAPER = {
    NY: { gas: false, goods: true },   // gas tax not verified for NY
    NJ: { gas: true,  goods: true },
    PA: { gas: true,  goods: true },
    OH: { gas: true,  goods: false },  // Ohio groceries are cheaper than ours
    MD: { gas: true,  goods: true },
    VA: { gas: false, goods: true },   // gas tax not verified for VA
    NC: { gas: true,  goods: false },  // 0.3 of a point apart, too close to claim
    CT: { gas: false, goods: false },  // Connecticut taxes gas LESS than we do
    MA: { gas: false, goods: true },   // Massachusetts taxes gas less than we do
    FL: { gas: true,  goods: true },
    TX: { gas: false, goods: true },
    SC: { gas: false, goods: false },
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
        // NJ Division of Taxation, exemptions page, opened 2026-08-29: "You can
        // claim a $1,000 exemption if you were 65 or older on the last day of
        // the tax year", on top of the regular $1,000 each. Leaving it out
        // would have made New Jersey look worse than it is.
        out.military = 0;
        if (is65) out.extraDeduction += 1000 * (mfj ? 2 : 1);
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
      var agiFull = inc.wages + inc.pension + inc.military + inc.ss;
      var exempt = inp.mfj ? R.exempt.m : R.exempt.s;
      if (R.exemptPhase) {
        var start = inp.mfj ? R.exemptPhase.startM : R.exemptPhase.startS;
        if (agiFull > start) exempt = Math.max(0, exempt - 1000 * Math.ceil((agiFull - start) / 1000));
      }
      var ded = (inp.mfj ? R.std.m : R.std.s) + exempt + r.extraDeduction;
      var taxable = Math.max(0, gross - ded);
      var income = Math.max(0, bracketTax(taxable, inp.mfj ? R.bM : R.bS) - r.credit);
      if (R.addBack) {
        var aStart = inp.mfj ? R.addBack.startM : R.addBack.startS;
        var aStep = inp.mfj ? R.addBack.stepM : R.addBack.stepS;
        if (agiFull > aStart) {
          income += aStep * Math.min(R.addBack.capSteps, Math.ceil((agiFull - aStart) / R.addBack.per));
        }
      }

      var local = 0, localLabel = '';
      if (side === 'now' && R.local) {
        var L = R.local, choice = (inp.localChoice === undefined || inp.localChoice === null) ? L.preset : inp.localChoice;
        if (L.kind === 'auto') { local = L.rate * taxable; localLabel = L.rowLabel; }
        else if (L.kind === 'yesno') {
          if (choice === 'yes' || choice === true) { local = L.rate * (L.base === 'wages' ? inc.wages : taxable); localLabel = L.rowLabel; }
        } else if (L.kind === 'choice') {
          if (choice === 'nyc') { local = bracketTax(taxable, inp.mfj ? NYC_M : NYC_S); localLabel = 'New York City tax'; }
          else if (choice === 'yonkers') { local = income * YONKERS; localLabel = 'Yonkers surcharge'; }
        }
      }

      var prop;
      if (side === 'here') {
        var fmv = Math.max(0, (inp.homeHere || 0) - (inp.is65 ? HOMESTEAD : 0));
        prop = fmv * RES_RATIO * (HORRY_MILLS - SCHOOL_OPS) / 1000;
      } else {
        prop = (inp.homeNow || 0) * R.propRate;
      }
      out[side] = { income: income, local: local, localLabel: localLabel, property: prop, total: income + local + prop, taxableIncome: taxable };
    });
    out.difference = out.now.total - out.here.total;
    // The money that comes out of the house is not a tax, but it is the
    // biggest number in most of these moves, so the tool reports it.
    out.equity = Math.max(0, (inp.homeNow || 0) - (inp.homeHere || 0));
    out.cheaper = CHEAPER[inp.state] || { gas: false, goods: false };
    /* Ten years of the yearly tax difference plus the one-time house money.
     * At today's rates: it is arithmetic on the numbers already shown, not a
     * forecast, and the page says so in those words. */
    out.tenYear = out.difference * 10 + out.equity;
    return out;
  }


  /* What the calculator shows on load: a real household, not zeroes. Home
   * values are each state's own Zillow statewide typical from col-places.json
   * (July 2026), against the $342,000 typical here. */
  var EXAMPLES = {
    NY: { homeNow: 527000 }, NJ: { homeNow: 584000 }, PA: { homeNow: 291000 },
    OH: { homeNow: 250000 }, MD: { homeNow: 433000 }, VA: { homeNow: 418000 },
    NC: { homeNow: 338000 }, CT: { homeNow: 453000 }, MA: { homeNow: 669000 },
    FL: { homeNow: 400000 }, TX: { homeNow: 340000 },
  };
  function example(code) {
    var e = EXAMPLES[code] || { homeNow: 450000 };
    return { state: code, mfj: true, is65: false, wages: 120000, pension: 0, ss: 0, military: 0,
             homeNow: e.homeNow, homeHere: 342000, localChoice: undefined };
  }

  root.C3TAX = { RULES: RULES, calc: calc, bracketTax: bracketTax, retirement: retirement, example: example, CHEAPER: CHEAPER };
})(typeof window !== 'undefined' ? window : globalThis);
