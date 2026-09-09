/* /invest/how-long-to-hold/ - how long to hold a Myrtle Beach rental before
 * selling. Price history from Zillow's home value index (metro, city and ZIP
 * files, data through July 2026), read from research/invest-next/data/hold-*.csv
 * at build time so the charts and tables cannot drift from the file. Rules
 * quoted from the IRS, the statute and the lender pages named in the sources
 * line (research/invest-next/hold-facts.md). Yields are not restated here: the
 * all-cash section takes each area's rent-after-costs from
 * data/submarkets.json, the same file the returns page uses, so the two pages
 * carry one number from one source (owner, batch 5 answer 10). No commission
 * is stated as a fact: the break-even rows use the editable example in the net
 * proceeds calculator and say so. No loan payment, no interest rate and no
 * down-payment percentage appears (non-negotiable 3; this page is not one of
 * the four investor-financing pages). Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");
const DATA = path.join(__dirname, "..", "research", "invest-next", "data");
const D = require(path.join(DATA, "submarkets.json"));

const TEL = "tel:+18543332135";
const ZILLOW = "https://www.zillow.com/research/data/";
const T409 = "https://www.irs.gov/taxtopics/tc409";
const P523 = "https://www.irs.gov/publications/p523";
const P544 = "https://www.irs.gov/publications/p544";
const S1031 = "https://www.law.cornell.edu/uscode/text/26/1031";
const RP0816 = "https://www.irs.gov/irb/2008-10_IRB";
const FNMA = "https://selling-guide.fanniemae.com/sel/b2-1.3-03/cash-out-refinance-transactions";
const EASY = "https://easystreetcap.com/dscr-loan-cash-out-refinance-guide/";
const SC1224 = "https://www.scstatehouse.gov/code/t12c024.php";
const NAR = "https://www.nar.realtor/blogs/economists-outlook/top-10-takeaways-from-nars-2025-profile-of-home-buyers-and-sellers";
const CHENG = "https://ideas.repec.org/a/eee/jhouse/v19y2010i2p109-118.html";

/* ---------------- data ---------------- */
function parseCSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.length > 1);
}
const csv = (f) => parseCSV(fs.readFileSync(path.join(DATA, f), "utf8"));

/* metro series, monthly */
const metroRows = csv("hold-zhvi-metro-myrtle-beach.csv").slice(1).map(r => [r[0], +r[1]]);
const at = (d) => metroRows.find(r => r[0] === d)[1];
const LAST = metroRows[metroRows.length - 1];
const chg = (a, b) => (a / b - 1) * 100;
const ann = (a, b, y) => (Math.pow(a / b, 1 / y) - 1) * 100;
const now = LAST[1];
const win = [1, 3, 5, 10, 15, 20].map(y => { const d = `${2026 - y}-07-31`; return { y, from: at(d), total: chg(now, at(d)), a: ann(now, at(d), y) }; });
const pre2015 = metroRows.filter(r => r[0] < "2015-01-01");
const peak = pre2015.reduce((a, b) => b[1] > a[1] ? b : a);
const trough = metroRows.filter(r => r[0] > peak[0] && r[0] < "2015-01-01").reduce((a, b) => b[1] < a[1] ? b : a);
const regain = metroRows.find(r => r[0] > trough[0] && r[1] >= peak[1]);
const post = metroRows.filter(r => r[0] > "2020-01-01").reduce((a, b) => b[1] > a[1] ? b : a);
const months = (a, b) => { const [ya, ma] = a.split("-").map(Number), [yb, mb] = b.split("-").map(Number); return (yb - ya) * 12 + (mb - ma); };
const fall = chg(trough[1], peak[1]);

/* rolling windows */
const rw = csv("hold-rolling-windows.csv");
const rwH = rw[0], rwi = (s) => rwH.findIndex(x => x.includes(s));
const roll = rw.slice(1).map(r => ({ y: +r[rwi("hold_years")], n: +r[rwi("windows")], worst: +r[rwi("worst_total")], ws: r[rwi("worst_window_start")], we: r[rwi("worst_window_end")], median: +r[rwi("median_total")], best: +r[rwi("best_total")], any: +r[rwi("any gain")], fin: +r[rwi("+10.5%")], cash: +r[rwi("+7.9%")] }));
const rollAt = (y) => roll.find(r => r.y === y);

/* break-even */
const be = csv("hold-breakeven-model.csv").slice(1).map(r => ({ g: r[0], buyer: r[1], comm: r[2], no: r[3], pay: r[4] })).filter(r => r.comm.startsWith("6.0%"));
const beAt = (g, buyer) => { const r = be.find(x => (x.g === g || x.g.endsWith(" " + g)) && x.buyer === buyer); if (!r) throw new Error(`no break-even row for ${g} ${buyer}`); return r; };

/* by ZIP, July 2026 against July 2025, 2023, 2021, 2016 */
const zipCsv = csv("hold-zhvi-zip-grand-strand.csv"), zh = zipCsv[0];
const col = (d) => zh.indexOf(d);
const ZIPLABEL = { "29526": "Conway", "29527": "Conway, west", "29566": "Little River", "29568": "Longs", "29569": "Loris", "29572": "Myrtle Beach, north end", "29575": "Surfside Beach", "29576": "Murrells Inlet and Garden City", "29577": "Myrtle Beach, city core", "29579": "Carolina Forest and the 501 corridor", "29582": "North Myrtle Beach", "29585": "Pawleys Island", "29588": "Socastee and Burgess" };
const zips = zipCsv.slice(1).map(r => { const v = (d) => +r[col(d)]; const n = v("2026-07-31"); return { zip: r[zh.indexOf("RegionName")], label: ZIPLABEL[r[zh.indexOf("RegionName")]] || r[zh.indexOf("City")], now: n, y1: chg(n, v("2025-07-31")), y3: chg(n, v("2023-07-31")), y5: chg(n, v("2021-07-31")), a5: ann(n, v("2021-07-31"), 5), y10: chg(n, v("2016-07-31")), a10: ann(n, v("2016-07-31"), 10) }; }).sort((a, b) => b.a10 - a.a10);

/* All-cash model, on the same basis as the returns page (owner, 2026-09-09):
   the price a rental actually sells for (Zillow's cheaper third for the ZIP) and
   a 10 percent allowance for empty months and repairs. The two pages must not
   disagree about the same figure (PLAYBOOK A22e). */
const BOTTOM = require(path.join(DATA, "zip-bottom-tier.json"));
const VAC = 0.10, MGMT = 0.10, INS = 3050;
const noiAt = (s, price, mgmt) => {
  const gross = s.ltr_rent_fmr_3br_fy2027 * 12;
  const tax = price * 0.06 * s.property_tax_mills_6pct / 1000 + (s.property_tax_extra_fees || 0);
  return gross - gross * VAC - gross * mgmt - tax - INS;
};
const S = D.submarkets.filter(s => s.slug !== "pawleys-island" && s.slug !== "garden-city");
const cashRows = S.map(s => {
  const price = BOTTOM[s.zip].bottom;
  const noi = noiAt(s, price, MGMT), noiL = noiAt(s, price, 0);
  return { name: s.slug === "murrells-inlet" ? "Murrells Inlet and Garden City" : s.name,
    zhvi: price, noi, noiL, yrs: price / noi, yrsL: price / noiL };
}).sort((a, b) => a.yrs - b.yrs);
const yrsLo = Math.min(...cashRows.map(r => r.yrs)), yrsHi = Math.max(...cashRows.map(r => r.yrs)), yrsLLo = Math.min(...cashRows.map(r => r.yrsL)), yrsLHi = Math.max(...cashRows.map(r => r.yrsL));
const MB = D.submarkets.find(s => s.slug === "myrtle-beach");
const mbPrice = BOTTOM[MB.zip].bottom, mbNoi = noiAt(MB, mbPrice, MGMT);
const tenYear = (P, noi, g) => { let saved = 0; for (let t = 0; t < 10; t++) saved += noi * Math.pow(1 + g, t); const v = P * Math.pow(1 + g, 10); return { saved, v, total: v + saved, pct: chg(v + saved, P) }; };
const ty0 = tenYear(mbPrice, mbNoi, 0), ty3 = tenYear(mbPrice, mbNoi, 0.03);
/* The trade example is two real houses someone already owns or would buy, so it
   keeps each area's typical value and its own asking rent, at the same 10 percent
   allowance. */
const PI = D.submarkets.find(s => s.slug === "pawleys-island"), CW = D.submarkets.find(s => s.slug === "conway");
const noiZori = (s) => { const gross = s.ltr_rent_zip * 12;
  const tax = s.zhvi * 0.06 * s.property_tax_mills_6pct / 1000 + (s.property_tax_extra_fees || 0);
  return gross - gross * VAC - gross * MGMT - tax - INS; };
const piNoi = noiZori(PI), cwNoi = noiZori(CW);
const stamps = (p) => Math.ceil(p / 500) * 1.85;
const sellCost = 0.06 * PI.zhvi + stamps(PI.zhvi) + 1500;
const buyCost = (p) => 900 + 330 + 2.10 * Math.max(0, (p - 100000) / 1000) + 112.5 + 15;
const netSale = PI.zhvi - sellCost, twoCost = 2 * CW.zhvi + 2 * buyCost(CW.zhvi), gap = twoCost - netSale;
const gainYr = 2 * cwNoi - piNoi, tradeCosts = sellCost + 2 * buyCost(CW.zhvi), payback = tradeCosts / gainYr;

const fmt$ = (n) => (n < 0 ? "−$" : "$") + Math.round(Math.abs(n)).toLocaleString("en-US");
const p1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
const sp = (n) => (n >= 0 ? "+" : "−") + p1(Math.abs(n));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const mon = (d) => { const [y, m] = d.split("-"); return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][+m - 1] + " " + y; };

/* ---------------- charts ---------------- */
const NAVY = "#1c2028", MUTED = "rgba(28,32,40,.78)", BRASS = "#c4783a", PURPLE = "#6a5aa8", GRID = "rgba(28,32,40,.12)";
const SVGSTYLE = 'style="display:block;max-width:640px;font-family:var(--sans)"';

function lineChart() {
  const W = 640, H = 270, L = 58, R = 16, T = 14, B = 30, PW = W - L - R, PH = H - T - B;
  const vals = metroRows.map(r => r[1]), lo = 100000, hi = 400000;
  const x = (i) => L + PW * i / (metroRows.length - 1), y = (v) => T + PH * (1 - (v - lo) / (hi - lo));
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Typical home value in the Myrtle Beach metro, monthly, November 2001 to July 2026" ${SVGSTYLE}>`;
  for (const g of [100000, 200000, 300000, 400000]) s += `<line x1="${L}" y1="${y(g)}" x2="${W - R}" y2="${y(g)}" stroke="${GRID}" stroke-width="1"/><text x="${L - 6}" y="${y(g) + 4}" font-size="11" text-anchor="end" fill="${MUTED}">$${g / 1000}k</text>`;
  metroRows.forEach((r, i) => { if (r[0].endsWith("-07-31") && +r[0].slice(0, 4) % 4 === 2) s += `<text x="${x(i)}" y="${H - 10}" font-size="11" text-anchor="middle" fill="${MUTED}">${r[0].slice(0, 4)}</text>`; });
  s += `<polyline fill="none" stroke="${BRASS}" stroke-width="2.5" stroke-linejoin="round" points="${metroRows.map((r, i) => `${x(i).toFixed(1)},${y(r[1]).toFixed(1)}`).join(" ")}"><title>Zillow home value index, Myrtle Beach metro, monthly</title></polyline>`;
  const mark = (row, label, dx, dy, anchor) => { const i = metroRows.indexOf(row); s += `<circle cx="${x(i)}" cy="${y(row[1])}" r="4.5" fill="${NAVY}" stroke="#f4efe8" stroke-width="2"><title>${esc(label)}</title></circle><text x="${x(i) + dx}" y="${y(row[1]) + dy}" font-size="11" font-weight="600" text-anchor="${anchor}" fill="${NAVY}">${esc(label)}</text>`; };
  mark(peak, `${mon(peak[0])}: ${fmt$(peak[1])}`, 8, -8, "start");
  mark(trough, `${mon(trough[0])}: ${fmt$(trough[1])}`, 0, 18, "middle");
  mark(post, `${mon(post[0])}: ${fmt$(post[1])}`, -8, -8, "end");
  mark(LAST, `${mon(LAST[0])}: ${fmt$(LAST[1])}`, -8, 18, "end");
  return s + "</svg>";
}
const CHART_LINE = lineChart();

/* grouped horizontal bars, two series */
function grouped(groups, opt) {
  const W = 640, L = opt.left || 150, R = 70, BW = W - L - R, gH = 38, H = groups.length * gH + 40, max = opt.max;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(opt.aria)}" ${SVGSTYLE}>`;
  groups.forEach((g, i) => {
    const y = i * gH + 4;
    s += `<text x="${L - 8}" y="${y + 19}" font-size="12" text-anchor="end" fill="${NAVY}">${esc(g.name)}</text>`;
    [[g.a, opt.aLabel, BRASS, 0], [g.b, opt.bLabel, PURPLE, 15]].forEach(([v, lab, colr, dy]) => {
      if (v === null) { s += `<text x="${L + 6}" y="${y + dy + 10}" font-size="11" fill="${MUTED}">${esc(g.none || "never")}</text>`; return; }
      const w = Math.max(2, Math.round(BW * v / max));
      s += `<rect x="${L}" y="${y + dy}" width="${w}" height="12" fill="${colr}"><title>${esc(g.name)}, ${esc(lab)}: ${esc(opt.fmt(v))}</title></rect><text x="${L + w + 5}" y="${y + dy + 10}" font-size="11" fill="${NAVY}">${esc(opt.fmt(v))}</text>`;
    });
  });
  const base = groups.length * gH + 8;
  s += `<rect x="${L}" y="${base + 6}" width="12" height="12" fill="${BRASS}"/><text x="${L + 17}" y="${base + 16}" font-size="12" fill="${NAVY}">${esc(opt.aLabel)}</text>`;
  s += `<rect x="${L + 240}" y="${base + 6}" width="12" height="12" fill="${PURPLE}"/><text x="${L + 257}" y="${base + 16}" font-size="12" fill="${NAVY}">${esc(opt.bLabel)}</text>`;
  return s + "</svg>";
}
const num = (s) => /never/.test(s) ? null : +s;
const beGroups = [["3%", "3 percent a year"], ["5%", "5 percent a year"], ["1.94%", `${p1(win[5].a)} percent, the 20-year rate`], ["5.18%", `${p1(win[4].a)} percent, the 15-year rate`], ["6.08%", `${p1(win[3].a)} percent, the 10-year rate`], ["0%", "No price change"]].map(([k, name]) => ({ name, a: num(beAt(k, "financed").no), b: num(beAt(k, "cash").no) }));
const CHART_BE = grouped(beGroups, { max: 6, left: 190, aLabel: "Financed buyer", bLabel: "Cash buyer", fmt: (v) => v.toFixed(1) + " years", aria: "Years until a sale returns the buying and selling costs, by yearly price change, financed and cash buyers" });
const rollGroups = [1, 2, 3, 5, 7, 10, 15].map(y => { const r = rollAt(y); return { name: `${y} year${y > 1 ? "s" : ""}`, a: r.fin, b: r.cash }; });
const CHART_ROLL = grouped(rollGroups, { max: 100, left: 80, aLabel: "Financed buyer, needs +10.5 percent", bLabel: "Cash buyer, needs +7.9 percent", fmt: (v) => v + " of 100", aria: "Share of holds of each length since 2001 whose price rise covered the buying and selling costs" });

/* ---------------- tables ---------------- */
const T_WIN = h.table(["Bought in July", "Typical value then", "Change to July 2026", "A year"], win.map(w => [`${2026 - w.y} (${w.y} year${w.y > 1 ? "s" : ""})`, fmt$(w.from), sp(w.total) + "%", sp(w.a) + "%"]));
const T_BE = h.table(["Buyer", "Buying costs", "Selling costs", "Price rise needed"], [
  ["Financed", "3 percent of the price", "Commission at the calculator's example rate, deed stamps, $1,500 closing", "+10.5 percent"],
  ["Cash", "$1,866: attorney, owner's title policy, termite letter, recording", "The same", "+7.9 percent"],
  ["Financed, no commission", "3 percent", "Deed stamps and $1,500", "+3.8 percent"],
  ["Cash, no commission", "$1,866", "Deed stamps and $1,500", "+1.4 percent"],
]);
const T_ROLL = h.table(["Hold", "Holds counted", "Worst", "Typical", "Best", "Ended below the start"], [1, 2, 3, 5, 7, 10, 15].map(y => { const r = rollAt(y); return [`${y} year${y > 1 ? "s" : ""}`, r.n, `${sp(r.worst)}% (${r.ws.slice(0, 7)} to ${r.we.slice(0, 7)})`, sp(r.median) + "%", sp(r.best) + "%", `${100 - r.any} of 100`]; }));
const T_ZIP = h.table(["Area (ZIP)", "Typical value, July 2026", "1 year", "3 years", "5 years, a year", "10 years, a year"], zips.map(z => [`${z.label} (${z.zip})`, fmt$(z.now), sp(z.y1) + "%", sp(z.y3) + "%", sp(z.a5) + "%", sp(z.a10) + "%"]));
const T_STRAT = h.table(["Strategy", "The waiting period", "Where it comes from"], [
  ["Flip", "None. The profit is ordinary income however long you hold, because a house bought to resell is inventory. It cannot go into a 1031 exchange.", "Tax law on inventory"],
  ["Any rental sold outright", "More than one year for the lower long-term capital gains rate. One year or less is taxed as ordinary income.", "The capital gains rule"],
  ["BRRRR, conventional cash-out refinance", "Six months on title, and the loan being paid off must be at least 12 months old. A cash buyer can refinance inside six months for no more than what was paid plus the loan's costs.", "The conventional selling guide"],
  ["BRRRR, rental-loan lenders", "Many have no waiting period. One publishes a smaller loan inside six months and the appraised value only after six.", "A DSCR lender's published tiers"],
  ["1031 exchange", "No minimum in the statute. The house must be held for investment, not for sale. A house you also use has a 24-month safe harbor before and after the trade.", "The statute and the IRS safe harbor"],
  ["Live in it, then rent it", "Two of the last five years lived in, and a sale within three years of moving out, excludes up to $250,000 of gain, or $500,000 on a joint return. Depreciation taken while rented is never excluded.", "The home sale exclusion"],
  ["Rent it, then move in", "The rental years before you moved in are taxed in proportion. Eight rental years out of ten owned leaves a fifth of the gain excluded.", "The nonqualified-use rule"],
]);
const T_CASH = h.table(["Area", "Price of a rental", "Rent left after costs, with a manager", "Years of saved rent to buy a second house", "Self-managed"], cashRows.map(r => [r.name, fmt$(r.zhvi), fmt$(r.noi) + " a year", Math.round(r.yrs) + " years", Math.round(r.yrsL) + " years"]));
const T_TRADE = h.table(["Step", "Figure"], [
  [`Sell the ${PI.name} house, ${fmt$(PI.zhvi)}, which leaves ${fmt$(piNoi)} a year after costs`, `Net after commission at the example rate, stamps and closing: ${fmt$(netSale)}`],
  [`Buy two ${CW.name} houses at ${fmt$(CW.zhvi)} each`, `${fmt$(twoCost)} with buying costs, so ${fmt$(gap)} of new cash`],
  ["Rent left after costs, two houses", `${fmt$(2 * cwNoi)} a year, ${fmt$(gainYr)} more than before`],
  ["Costs of the trade", fmt$(tradeCosts)],
  ["Years to earn the costs back", `${p1(payback)} years`],
]);

module.exports = {
  url: "/invest/how-long-to-hold/",
  title: "How Long to Hold a Myrtle Beach Rental | Chapter3",
  description: "How long to hold a Myrtle Beach rental: the price rise that pays the costs back, Zillow price history by area since 2001, and the tax and loan waiting periods.",
  ogTitle: "How long should you hold a Myrtle Beach rental before selling?",
  crumb: "How long to hold",
  eyebrow: "Holding period",
  h1: "How long should you hold a Myrtle Beach rental before selling?",
  h1em: "The costs, the price history, and the rules.",
  sub: "A financed buyer needs the Myrtle Beach price up about 10 percent to cover a rental's costs. Since 2001 that hold was usually three years or more.",
  heroCta: { label: "Have us run your net proceeds", href: "/sell/net-proceeds/" },
  author: "devin",
  shortAnswer: `Hold until a sale pays back the costs of buying and selling, and until the tax rule you are counting on is met. A financed buyer at the example commission in our net proceeds calculator needs the price to rise 10.5 percent. A cash buyer needs 7.9 percent. At 3 percent a year that is about three years. In this market's history since 2001, three-year holds cleared the financed buyer's bar ${rollAt(3).fin} times out of 100 and one-year holds ${rollAt(1).fin} times. The tax rules have their own waiting periods. More than one year gets the lower capital gains rate. Two of the last five years lived in gets the home sale exclusion. A 1031 exchange of a house you also use has a 24-month IRS safe harbor. An all-cash buyer who dislikes risk holds longest. Saved rent does not buy a second house for ${Math.round(yrsLo)} years or more, so the return is the price and the saved rent. Every 15-year hold since 2001 ended above its start.`,
  sections: [
    { h2: "What decides how long to hold a rental in Myrtle Beach?", html:
      h.p(`Three things. The costs of buying and selling, which a price rise has to pay back. The price history of the market you bought in. The waiting periods in the tax and loan rules for your strategy.`) +
      h.p(`The costs are the same for every strategy. The price history decides how long the costs take to earn back. The rules add a floor for some strategies and none for others. Each has a section below.`) +
      h.p(`The rent left after costs is the other part of the return. ${h.a("/invest/rental-returns/", "What return a Myrtle Beach rental makes")} has it by area. This page uses those figures where it needs them and does not restate them.`) },
    { h2: "How much does the price need to rise to get your money back?", html: (bg) =>
      h.p(`A financed buyer pays about 3 percent of the price to buy, per ${h.a("/buyers/closing-costs/", "the closing costs page")}. A cash buyer pays about $1,866 at the typical metro price: the attorney, an owner's title policy, the termite letter and the recording. Selling costs the commission, ${h.ext(SC1224, "the deed recording fee of $1.85 per $500 of the price")}, and about $1,500 of attorney and closing fees.`) +
      h.p(`Commissions are negotiable and the site states none as a fact. ${h.a("/sell/net-proceeds/", "The net proceeds calculator")} uses an editable example of 6 percent, and the table below uses that example. Change it there for your own number.`) +
      T_BE +
      h.p(`The price rise needed comes from the typical metro home value of ${fmt$(now)} in July 2026. The chart turns the rise into years at each yearly price change. It counts no rent and no loan paydown, so it is the slow case.`) +
      h.raw(`<div style="max-width:640px;margin:1rem 0 1.2rem">${CHART_BE}</div>`) +
      h.p(`With a loan, the principal you repay shortens the wait, because the payoff at sale is smaller. On a 30-year loan the share repaid in the first three years is between ${csv("hold-amortization-share.csv")[3][1]} and ${csv("hold-amortization-share.csv")[3][2]} percent of the loan, depending on the rate. At 3 percent a year that cuts the financed buyer's wait from ${beAt("3%", "financed").no} years to ${beAt("3%", "financed").pay} years. With no price change at all, paydown alone takes ${beAt("0%", "financed").pay} years.`) +
      h.cta("Want the numbers on a house you own?", "The net proceeds calculator takes your price, your payoff and your commission example and shows what a sale leaves today.", "Have us run your net proceeds", "/sell/net-proceeds/", bg) },
    { h2: "What has the Myrtle Beach price done since 2001?", html:
      h.p(`${h.ext(ZILLOW, "Zillow's home value index")} tracks the typical home in the metro, all types, the middle third by value. The chart is every month from ${mon(metroRows[0][0])} to ${mon(LAST[0])}.`) +
      h.raw(`<div style="max-width:640px;margin:1rem 0 1.2rem">${CHART_LINE}</div>`) +
      h.p(`The peak was ${mon(peak[0])} at ${fmt$(peak[1])}. The low was ${mon(trough[0])} at ${fmt$(trough[1])}, a fall of ${p1(Math.abs(fall))} percent over ${months(peak[0], trough[0])} months. The index did not pass the ${mon(peak[0]).split(" ")[1]} peak again until ${mon(regain[0])}, ${months(peak[0], regain[0])} months later. A buyer at the top who sold before then sold below the purchase price, before any selling cost.`) +
      h.p(`The fastest rise was July 2021 to July 2022, ${p1(chg(at("2022-07-31"), at("2021-07-31")))} percent in twelve months. The value has been flat since: ${mon(post[0])} was the high at ${fmt$(post[1])}, and ${mon(LAST[0])} is ${p1(Math.abs(chg(LAST[1], post[1])))} percent below it.`) +
      T_WIN +
      h.p(`The 20-year row starts one year before the peak. It is the honest figure for a buyer who bought at the top: ${p1(win[5].a)} percent a year. The 10-year and 15-year rows start after the low, so they are the best case.`) },
    { h2: "How often did a hold of each length pay?", html:
      h.p(`The chart counts every hold of each length that could have started since November 2001, and asks whether the price rise covered the costs in the table above. One bust sits inside most of the holds, so this is a count of what happened, not a forecast.`) +
      h.raw(`<div style="max-width:640px;margin:1rem 0 1.2rem">${CHART_ROLL}</div>`) +
      T_ROLL +
      h.p(`In the first two years the selling costs decided the result more than the market did. From year three on, the holds that failed are almost all the ones that started between 2005 and 2008. Every 15-year hold ended above its start, and the lowest 15-year result was ${sp(rollAt(15).worst)} percent, which still clears the financed buyer's costs.`) },
    { h2: "Which Myrtle Beach areas rose the most?", html: (bg) =>
      h.p(`The same index by ZIP. Garden City and Carolina Forest have no Zillow row of their own. ZIP 29576 and ZIP 29579 are used for them and labeled that way. The list is sorted by the ten-year rate.`) +
      T_ZIP +
      h.p(`No area rose more than ${p1(Math.max(...zips.map(z => z.y1)))} percent in the last year, and most fell over the last three. The ten-year rates run from ${p1(Math.min(...zips.map(z => z.a10)))} to ${p1(Math.max(...zips.map(z => z.a10)))} percent a year, so the spread between areas is small next to the spread between decades. The area decides the rent and the rules more than the price rise. ${h.a("/invest/where-to-buy/", "Where to buy a rental")} has the rules by area.`) +
      h.cta("Want to know what a rental you own is worth now?", "Send the address. Tim Nash runs the comparable sales himself and tells you what it would sell for today, and what a sale would leave.", "Have us value your rental", "/sell/home-value/", bg) },
    { h2: "How long do you hold for each strategy?", html:
      h.p(`These are the waiting periods in the rules, not advice on when to sell. Each one comes from the source named in the last column and linked in the sources line.`) +
      T_STRAT +
      h.p(`Depreciation is the other clock on a long-term rental. The building depreciates over 27.5 years, and at sale the depreciation taken is taxed back at up to 25 percent. On a ${fmt$(now)} house with a fifth of the price in land, that is about $9,949 a year. After ten years it is up to $24,873 of tax at sale, before the state's share and before tax on any price gain. ${h.a("/invest/rental-depreciation/", "The depreciation page")} has the math and ${h.a("/sell/capital-gains/", "the capital gains page")} has the state layer.`) +
      h.p(`${h.a("/invest/strategies/1031-exchange/", "A 1031 exchange")} defers both. Our 1031 page has a client who sells when a house has used up its depreciation and trades the money up. That is a hold decided by the tax rule, not by the price.`) +
      h.p(`${h.a("/invest/strategies/fix-and-flip/", "The fix and flip page")} and ${h.a("/invest/strategies/brrrr/", "the BRRRR page")} have each strategy in full. ${h.ext(P523, "The home sale exclusion")} applies to the house you live in; ${h.a("/sell/rental-property/", "selling a rental you once lived in")} has the sequence that matters.`) },
    { h2: "What is the best hold for an all-cash buyer who dislikes risk?", html: (bg) =>
      h.p(`The long one. Three facts from the numbers above decide it.`) +
      h.p(`First, the costs come back in about three years at 3 percent a year, and every 15-year hold in this market's history ended above its start. Shorter holds lost money in ${100 - rollAt(5).any} of 100 cases at five years and ${100 - rollAt(1).any} of 100 at one year.`) +
      h.p(`Second, the rent does not buy a second house. The table takes each area's rent left after costs from the returns page, at the county's three-bedroom benchmark rent with a manager. It divides the price of a rental by that figure. That is how many years of saved rent it takes to pay cash for a second house of the same kind, with no price change.`) +
      T_CASH +
      h.p(`A ${MB.name} rental at ${fmt$(mbPrice)} that leaves ${fmt$(mbNoi)} a year is worth ${fmt$(ty0.total)} after ten years with the rent saved and no price change, ${sp(ty0.pct)} percent. With prices and rents rising 3 percent a year it is ${fmt$(ty3.total)}, ${sp(ty3.pct)} percent. An all-cash owner's growth comes from the price and the saved rent, not from the number of houses.`) +
      h.p(`Third, selling one house to buy two of the same kind never helps, because the sale only adds the selling costs and the buying costs. Selling one expensive house that leaves little rent for two cheaper houses that leave more can help. The two must be held long enough to earn the costs back. The example uses the returns page's figures and the calculator's example commission, through a 1031 exchange so no tax is due at the trade.`) +
      T_TRADE +
      h.p(`The trade is behind by the costs for the first ${Math.ceil(payback)} years and ahead after that. Without a 1031 exchange, the tax on the gain and the depreciation would sit on top of the costs and push the payback later.`) +
      h.p(`Research on holding periods agrees on the direction and gives no single number. ${h.ext(CHENG, "Higher transaction costs lengthen the right hold and higher price swings shorten it")}. ${h.ext(NAR, "Home sellers in 2025 had owned for a median of 11 years")}, a record, though those are people's own homes, not rentals.`) +
      h.cta("Deciding whether to sell a rental or keep it?", "Call us with the address, what you paid and what it rents for. We run the sale against the hold, with the commission example you choose.", "Call a specialized agent", TEL, bg) },
  ],
  faqTitle: "Holding period FAQ",
  faq: [
    { q: "How long should I hold a rental property before selling in Myrtle Beach?", a: `Until a sale pays back the buying and selling costs and the tax rule you need is met. A financed buyer at the example commission in our net proceeds calculator needs the price to rise 10.5 percent. At 3 percent a year that is about three years. Since 2001, three-year holds cleared that bar ${rollAt(3).fin} times out of 100 in the Myrtle Beach metro, and every 15-year hold ended above its start.` },
    { q: "How much has Myrtle Beach real estate appreciated?", a: `Zillow's typical home value for the Myrtle Beach metro was ${fmt$(now)} in July 2026. That is ${sp(win[0].total)} percent over one year and ${sp(win[1].total)} percent over three years. Over five years it is ${sp(win[2].total)} percent, or ${p1(win[2].a)} percent a year. Over ten years it is ${sp(win[3].total)} percent, or ${p1(win[3].a)} percent a year. From the March 2007 peak the value fell ${p1(Math.abs(fall))} percent and did not recover until December 2020.` },
    { q: "Do I have to hold a rental for a year before selling?", a: "No law requires it. A house held one year or less is taxed as ordinary income when sold. A house held more than one year gets the lower long-term capital gains rate. A flip is inventory and is taxed as ordinary income at any length." },
    { q: "How long do I have to hold a property before a 1031 exchange?", a: "The statute has no minimum. The house must be held for investment or business use, not for sale. The only IRS time test is a safe harbor for a house you also use yourself. It must be owned and rented for 24 months before the exchange, with personal use inside the limits. The same 24 months apply after." },
    { q: "How long do I have to live in a rental to avoid capital gains?", a: "Two of the last five years as your main home, and you must sell within three years of moving out. That excludes up to $250,000 of gain, or $500,000 on a joint return, except the depreciation taken while it was rented. If you rented it first and moved in later, the rental years before the move are taxed in proportion." },
    { q: "Should an all-cash investor sell one rental to buy two?", a: `Not two of the same kind, because the sale only adds the selling and buying costs. Trading one expensive house that leaves little rent for two cheaper houses that leave more can pay back the costs in about ${Math.round(payback)} years, through a 1031 exchange. Saved rent alone does not buy a second house for ${Math.round(yrsLo)} years or more in any Horry County area.` },
  ],
  sources: [
    { name: "Zillow home value index", href: ZILLOW },
    { name: "IRS Topic 409", href: T409 },
    { name: "IRS Pub 544", href: P544 },
    { name: "IRS Pub 523", href: P523 },
    { name: "26 U.S.C. 1031", href: S1031 },
    { name: "Rev. Proc. 2008-16", href: RP0816 },
    { name: "Selling Guide B2-1.3-03", href: FNMA },
    { name: "a DSCR lender's seasoning tiers", href: EASY },
    { name: "SC Code 12-24", href: SC1224 },
    { name: "NAR 2025 profile", href: NAR },
    { name: "Cheng, Lin and Liu 2010", href: CHENG },
  ],
  sourcesNote: "Educational only, not tax or legal advice and not a loan offer. Chapter3 is a real estate brokerage. Commissions are negotiable; the example rate is the calculator's.",
  bottomCta: { h2: "Thinking about selling a rental? Run the sale against the hold first.", p: "One call. Your price, your payoff, the commission example you choose, and what the next years look like either way.", label: "Call a specialized agent", href: TEL },
  keywords: "how long to hold rental property before selling, Myrtle Beach real estate appreciation, Myrtle Beach home value history, holding period rental property, 1031 exchange holding period, Myrtle Beach investment property hold",
  about: "How long to hold a rental property in Myrtle Beach before selling, with the local price history",
};
