/* /hoa/tax-deductible/ - are HOA fees tax deductible in South Carolina: the answer by how the home is used,
 * the rented share in dollars (a calculator and a worked example), what Grand Strand condo dues come to and
 * include, why the dues are not a property tax (three real 2026 county bills), special assessments, the state
 * return and owners out of state, and where the dues go on Schedule E.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-04. The live page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-11-a/hoa-tax-deductible/facts.md, verified rows only, and corrected rows only
 * in the verifier's wording (VERIFY.md). Struck wording: hoa-tax-deductible-struck.json (no Form 8829 line for
 * dues, no "the rental answer is the common one", no "taxed as a rental" for the 6 percent rate, no "typical
 * dues", no South Carolina "if you itemize", no "a little less the first year", no "6 in 10 condo owners").
 * Never on the page: a tax saved in dollars, a bracket, a rate or payment, a PIN, unit, building or owner name.
 * Data, never typed (website working copy, data/2026-11-a/hoa-tax-deductible/, its README.md):
 *   worked-example.json    one condo at the county's middle dues, five uses (row 33); the calculator is
 *                          checked against every case before the page builds
 *   chart-dues-by-zip.json middle monthly condo dues by ZIP code, the 2026-11-02 pull (row 27)
 *   chart-dues-vs-tax.json a year of dues against three real 2026 tax bills (rows 31, 32)
 *   findings.json          condo units by tax rate (rows 22, 23), dues and rental flags (26, 29), what the
 *                          dues include (28)
 *   photos.json            the one photo: a Myrtle Beach condo tower, Commons, CC BY 2.0 (VERIFY.md)
 * Kept from the live page: the title's search words, the three-way answer (now a table by situation), the
 * day split, repair days, under 15 days, the night log, the special assessment section (now answered: the
 * cost basis line replaces "a question for your CPA"), the five FAQ questions, the links.
 * Cut: "ask a CPA" as an answer, the move-in charges and resale statement (one link to
 * /hoa/estoppel-and-transfer-fees/), "Verified July 2026", the same offer three times.
 * Sibling owners: /invest/14-day-rule/ owns the day rules (one sentence and a link here), /buyers/property-taxes/
 * owns the 4 percent rate and the 72 days, /invest/condos/ owns the condo counts, /hoa/special-assessments/
 * owns its own $7,500 example (ours is a separate $10,000 example).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/tax-deductible/";
const DIR = path.join(__dirname, "..", "data", "2026-11-a", "hoa-tax-deductible");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const EX = read("worked-example.json"), ZIP = read("chart-dues-by-zip.json"), DVT = read("chart-dues-vs-tax.json"), F = read("findings.json");
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");

/* ---- Row 26: the county's middle dues; row 33 is built on it. ---- */
const DUES = EX.monthly_dues, YEAR = EX.yearly_dues;
if (DUES !== 650 || YEAR !== 7800 || F.listings.median_dues_month !== 650 || F.listings.oceanfront_median_dues_month !== 925) throw new Error("row 26: the middle dues moved; rewrite the page from a fresh pull");

/* ---- The calculator's rule (rows 10, 13 to 16), in one function used twice: here, to test it against the
   five cases in worked-example.json, and in the page's script. ---- */
function deduct(monthly, rented, personal) {
  const year = monthly * 12;
  if (!(rented > 0)) return { share: 0, ded: 0, kind: "none" };
  const limit = Math.max(14, rented / 10);
  const home = personal > limit;
  if (home && rented < 15) return { share: 0, ded: 0, kind: "short", limit };
  if (!(personal > 0)) return { share: 1, ded: year, kind: "all", limit };
  const share = rented / (rented + personal);
  return { share, ded: Math.round(year * share), kind: home ? "home" : "split", limit };
}
for (const c of EX.cases) {
  const r = deduct(DUES, c.rented_days, c.personal_days);
  if (r.ded !== c.deductible_dues) throw new Error(`calculator: ${c.case} gives ${r.ded}, the ledger says ${c.deductible_dues}`);
  if (c.rented_days > 0 && c.rented_days >= 15 && (r.kind === "home") !== c.counts_as_home) throw new Error(`calculator: ${c.case} home test disagrees`);
}
const CASE = (n) => { const c = EX.cases.find((x) => x.rented_days === n[0] && x.personal_days === n[1]); if (!c) throw new Error(`no case ${n}`); return c; };
const C20 = CASE([120, 20]), C14 = CASE([120, 14]), CALL = CASE([365, 0]), CLIVE = CASE([0, 365]);
const pct = (c) => Math.round(c.rental_share_pct);
if (pct(C20) !== 86 || pct(C14) !== 90) throw new Error("row 33: the shares are no longer 86 and 90 percent");

/* ---- Row 33: the worked example, as bars. ---- */
const EXAMPLE = G.bars([
  { name: "Lived in all year", value: CLIVE.deductible_dues, valueText: money(CLIVE.deductible_dues), feature: "a home: no deduction" },
  { name: "Rented 120 nights, 20 personal nights", value: C20.deductible_dues, valueText: money(C20.deductible_dues), feature: `${pct(C20)}%; counts as your home` },
  { name: "Rented 120 nights, 14 personal nights", value: C14.deductible_dues, valueText: money(C14.deductible_dues), feature: `${pct(C14)}%; not your home` },
  { name: "Held for rent all year, no personal nights", value: CALL.deductible_dues, valueText: money(CALL.deductible_dues), feature: "all of the dues", reference: true },
], { caption: `Example: deductible dues on one condo with ${money(YEAR)} a year in dues`, nameLabel: "How the condo is used", featureLabel: "rented share",
  valueLabel: "dues you deduct", max: YEAR, compact: true,
  note: `The condo has the middle dues of Horry County condos for sale, ${money(DUES)} a month.` });

/* ---- Row 27: dues by ZIP code (the 2026-11-02 pull, printed with "about"). ---- */
const LEDGER27 = { 29572: 875, 29577: 775, 29582: 700, 29575: 525, 29576: 525, 29566: 525, 29579: 425, 29588: 375 };
for (const r of ZIP.rows) {
  if (LEDGER27[r.zip] !== r.median_month || r.rented_all_year_deductible !== r.median_month * 12 || r.listings < 50) throw new Error(`row 27: ${r.zip} no longer matches the ledger`);
}
const ZNAME = { 29572: "Myrtle Beach, north end", 29577: "Myrtle Beach, central and south", 29582: "North Myrtle Beach", 29575: "Surfside Beach",
  29576: "Murrells Inlet and Garden City", 29566: "Little River", 29579: "Carolina Forest", 29588: "Socastee" };
const BY_ZIP = G.bars(ZIP.rows.map((r) => ({ name: `${ZNAME[r.zip]} (ZIP ${r.zip})`, value: r.median_month, valueText: `about ${money(r.median_month)}`,
  feature: `about ${money(r.rented_all_year_deductible)} a year` })),
  { caption: "Middle monthly HOA dues of condos for sale, by ZIP code", nameLabel: "Area", featureLabel: "a year of dues", valueLabel: "dues a month",
    compact: true,
    note: "Half the condos for sale in each ZIP code list higher dues, half lower. ZIP codes with 50 or more condos for sale. A condo held for rent all year, with no personal nights, deducts the whole year of dues." });
const ZTOP = ZIP.rows[0], ZLOW = ZIP.rows[ZIP.rows.length - 1];

/* ---- Row 28: what the dues include (one pull; percentages only). ---- */
const INC = F.dues_include.condos.includes, OCE = F.dues_include.oceanfront_building.includes;
const ip = (k) => Math.round(INC[k].pct), op = (k) => Math.round(OCE[k].pct);
if (ip("hoa_includes_insurance") !== 79 || ip("hoa_includes_water_sewer") !== 85 || ip("hoa_includes_trash") !== 91 || ip("hoa_includes_internet") !== 71 || ip("hoa_includes_electric") !== 27 || op("hoa_includes_electric") !== 58) throw new Error("row 28: the shares moved; rewrite the chips");
const chip = (n, label, extra) => `<li><strong>${n}%</strong><span>${label}${extra ? `<small>${extra}</small>` : ""}</span></li>`;
const INCLUDES = `<figure class="tx-fig"><p class="cap">What Horry County condos for sale say their dues include</p><ul class="tx-inc">`
  + chip(ip("hoa_includes_trash"), "trash pickup")
  + chip(ip("hoa_includes_water_sewer"), "water and sewer")
  + chip(ip("hoa_includes_insurance"), "insurance on the building")
  + chip(ip("hoa_includes_internet"), "internet")
  + chip(ip("hoa_includes_electric"), "electric", `${op("hoa_includes_electric")}% in oceanfront buildings`)
  + `</ul><figcaption>Share of condos for sale in Horry County whose listing says the dues include each one. Our count of the condo listings on our site.</figcaption></figure>`;

/* ---- Rows 22, 23, 29: county counts. ---- */
const ST = F.condo_stock;
if (Math.round(ST.pct_4pct) !== 22 || Math.round(ST.by_area_pct_4pct["City of Myrtle Beach"]) !== 9 || Math.round(ST.pct_mailing_outside_sc) !== 58) throw new Error("rows 22, 23: the shares moved");
if (Math.round(F.listings.pct_str_allowed) !== 71) throw new Error("row 29: the short-term rental share moved");

/* ---- Rows 31, 32: a year of dues against a year of tax, three real bills. ---- */
const [MB6, MB4, NM6] = ["6 percent", "main home", "North"].map((k) => DVT.rows.find((r) => r.case.includes(k)));
const LEDGER31 = [[MB6, 9300, 2421.24, 3.8], [MB4, 9300, 829.16, 11.2], [NM6, 8400, 3326.85, 2.5]];
for (const [r, d, t, x] of LEDGER31) if (!r || r.dues_year !== d || r.tax_year !== t || Math.round(r.dues_year / r.tax_year * 10) / 10 !== x) throw new Error("rows 31, 32: chart-dues-vs-tax.json no longer matches");
const about10 = (v) => `about ${money(Math.round(v / 10) * 10)}`;
const times = (r) => { const x = r.dues_year / r.tax_year; return x >= 10 ? `about ${Math.round(x)} times` : x >= 3 ? `about ${Math.round(x)} times` : `about ${Math.round(x * 2) / 2} times`; };
const DMAX = Math.max(...DVT.rows.map((r) => r.dues_year));
const pair = (label, r, hot) => `<li${hot ? ' class="hot"' : ""}><p class="l">${label}<span class="x">Dues are ${times(r)} the tax</span></p>`
  + `<div class="row"><span class="k">Dues</span><span class="bar d" style="--f:${(r.dues_year / DMAX).toFixed(3)}"></span><span class="v">about ${money(r.dues_year)}</span></div>`
  + `<div class="row"><span class="k">Tax</span><span class="bar t" style="--f:${(r.tax_year / DMAX).toFixed(3)}"></span><span class="v">${about10(r.tax_year)}</span></div></li>`;
const DUES_TAX = `<figure class="tx-fig"><p class="cap">A year of HOA dues against a year of property tax, three condos in Myrtle Beach and North Myrtle Beach</p><ul class="tx-pairs">`
  + pair("Myrtle Beach condo at the 4 percent rate", MB4, true)
  + pair("Myrtle Beach condo at the 6 percent rate", MB6)
  + pair("North Myrtle Beach condo at the 6 percent rate", NM6)
  + `</ul><figcaption>Dues: the middle monthly dues of condos for sale in ZIP 29577 (Myrtle Beach) or 29582 (North Myrtle Beach), times 12. Tax: the 2026 county bill of the middle-valued condo at that rate in Myrtle Beach or North Myrtle Beach.</figcaption></figure>`;

/* ---- Rows 1 to 4, 10, 15, 16, 19: the answer by situation. ---- */
const ans = (cls, word) => `<span class="tx-a ${cls}">${word}</span>`;
const sit = (who, a, what) => `<tr><th scope="row">${who}</th><td data-label="Deductible?">${a}</td><td data-label="What it means">${what}</td></tr>`;
const RULES = `<figure class="tx-fig tx-rulefig"><p class="cap">Are the HOA dues deductible? It depends on how the home is used</p><table class="tx-rules"><thead><tr><th scope="col">How you use the home</th><th scope="col">Deductible?</th><th scope="col">What it means</th></tr></thead><tbody>`
  + sit("You live in it all year", ans("no", "No"), "HOA fees on a home you live in are a personal cost, like your insurance and utilities.")
  + sit("A second home you never rent", ans("no", "No"), "The same rule as a main home. The dues are not deductible.")
  + sit("You rent it out and never stay there", ans("yes", "Yes, all"), "All of the dues are a rental expense, including months it sits empty while you hold it out for rent (listed and open to bookings).")
  + sit("You rent it out and stay there some nights", ans("part", "Partly"), "You deduct the rented share of the dues, worked out by nights.")
  + sit("Your home, rented fewer than 15 days", ans("no", "No"), "You report no rent and deduct no rental costs.")
  + sit("You work from home", ans("no", "Not for employees"), "An employee gets no home office deduction. A self-employed owner who qualifies splits whole-home costs by the share used for business.")
  + `</tbody></table></figure>`;

/* ---- Rows 3 to 9: special assessments, upkeep or improvement. ---- */
const box = (cls, k, title, text) => `<div class="${cls}"><p class="k">${k}</p><b>${title}</b><p>${text}</p></div>`;
const ASSESS = `<figure class="tx-fig"><p class="cap">Is a special assessment deductible?</p><div class="tx-grid">`
  + box("yes", "Rental, for upkeep", "Deductible the year you pay it", "An assessment for upkeep of the shared parts is a rental expense, like the dues.")
  + box("part", "Rental, for an improvement", "Spread over 27.5 years", "You deduct a share each year, starting when the work is finished and ready to use. The IRS calls this depreciation.")
  + box("no", "Your home, for upkeep", "Not deductible", "An assessment for upkeep on a home you live in gives no deduction.")
  + box("part", "Your condo, for an improvement", "Added to your cost basis", "It gives no deduction the year you pay it. It lowers the taxable gain when you sell.")
  + `</div></figure>`;
const ROOF = 10000, ROOF_YR = Math.round(ROOF / 27.5);
if (ROOF_YR !== 364) throw new Error("row 7: the example no longer gives $364");
const ROOFFIG = `<figure class="tx-fig"><p class="cap">A $10,000 roof assessment on a condo you rent out, spread over the years</p><ul class="tx-roof">`
  + `<li><strong>${money(ROOF)}</strong><span>your share of the roof, paid to the association</span></li>`
  + `<li><strong>27.5 years</strong><span>the period the IRS uses for a rental home and its roof</span></li>`
  + `<li class="hot"><strong>about ${money(ROOF_YR)}</strong><span>deducted in each full year; the first and last years are less</span></li>`
  + `</ul></figure>`;

/* ---- Rows 17, 18: the records. ---- */
const step = (n, title, text) => `<li><span class="n" aria-hidden="true">${n}</span><span class="c"><b>${title}</b>${text}</span></li>`;
const STEPS = `<ol class="tx-steps" aria-label="The records to keep for the dues on a rental">`
  + step(1, "The association's statements", "They show what you paid in dues and in any special assessment, and when.")
  + step(2, "A log of nights", "Write down each night rented at a fair price, each personal night and each repair day, as they happen.")
  + step(3, "The assessment notice and the minutes", "They say what an assessment paid for, which decides whether it is upkeep or an improvement.")
  + step(4, "The two night counts", "Give them to whoever prepares your return. Schedule E asks for both.")
  + `</ol>`;

/* ---- Rows 10 to 12: what counts as a personal night (row 11 in the verifier's wording). ---- */
const li = (t) => `<li>${t}</li>`;
const NIGHTS = `<div class="tx-two"><div class="pers"><p class="k">Counts as a personal night</p><ul>`
  + li("A night you or a co-owner stays there")
  + li("A night a relative stays, unless they rent it at a fair price as their main home")
  + li("A night anyone pays less than a fair rent")
  + li("A night someone stays in a swap that lets you use another home")
  + `</ul></div><div class="rent"><p class="k">Does not count as a personal night</p><ul>`
  + li("A night rented at a fair price, even if you were there that day")
  + li("A day you spend working close to full time on repairs and upkeep, even if family members enjoy the condo that day")
  + `</ul></div></div>`
  + h.p("Relatives are a spouse, brothers and sisters including half, parents, grandparents and earlier generations, and children, grandchildren and later generations. A day spent improving the condo, not repairing it, is not a repair day.");

/* ---- The calculator (rows 10 to 16; default dues from row 26). What it prints, in one function used three
   times: for the page's first text, in the checks below, and in the page's script. Row 16: with no nights at
   all, the dues are all a rental expense if it was held out for rent, and none if it was not. ---- */
function view(D, m, md, r, p) {
  const x = D(md, r, p);
  const lim = x.limit >= 15 ? "more than 10 percent of the " + r + " nights rented" : "more than 14";
  if (r + p > 365) return { ded: m(x.ded), share: Math.round(x.share * 100) + "%", say: "A year has 365 nights. Check the two counts." };
  if (x.kind === "none" && !(p > 0)) return { ded: m(0) + " or " + m(md * 12), share: "0% or 100%",
    say: "If you held it out for rent all year, all of the dues are a rental expense. If you did not, none are." };
  const say = x.kind === "none" ? "With no nights rented, none of the dues are deductible."
    : x.kind === "short" ? "This counts as your home and was rented fewer than 15 days. You report no rent and deduct no rental costs."
    : x.kind === "all" ? "No personal nights: all of the dues are a rental expense, including weeks it sits empty while you hold it out for rent."
    : x.kind === "home" ? "This condo counts as your home under the IRS test below, because your personal nights are " + lim + ". The figure above is the most you can deduct. It is cut if your rental costs are more than the rent."
    : "This condo does not count as your home under the IRS test below: your personal nights are not " + lim + ". Your rental costs can be more than the rent.";
  return { ded: m(x.ded), share: Math.round(x.share * 100) + "%", say };
}
{
  const t = (r, p) => view(deduct, money, DUES, r, p);
  if (!/^\$0 or \$7,800$/.test(t(0, 0).ded) || !/held it out for rent all year/.test(t(0, 0).say)) throw new Error("calculator: 0 and 0 must say row 16");
  if (!/none of the dues/.test(t(0, 30).say)) throw new Error("calculator: personal use only must give none");
  if (!/more than 14\./.test(t(145, 15).say)) throw new Error("calculator: 141 to 149 rented must say more than 14");
  if (!/10 percent of the 200 nights/.test(t(200, 21).say)) throw new Error("calculator: 200 rented must give the 10 percent line");
  if (t(C20.rented_days, C20.personal_days).ded !== money(C20.deductible_dues)) throw new Error("calculator: default case moved");
}
const V0 = view(deduct, money, DUES, C20.rented_days, C20.personal_days);
const CALC = `<figure class="tx-cfig"><div class="tx-calc" role="group" aria-labelledby="txcalc-h"><p class="k" id="txcalc-h">Work out your deductible dues</p>`
  + `<div class="f"><label for="txDues">HOA dues a month</label><span class="in">$ <input id="txDues" type="number" min="0" step="25" value="${DUES}" inputmode="numeric"></span></div>`
  + `<div class="f"><label for="txRent">Nights rented at a fair price this year</label><span class="in"><input id="txRent" type="number" min="0" max="365" step="1" value="${C20.rented_days}" inputmode="numeric"></span></div>`
  + `<div class="f"><label for="txMine">Your personal nights this year</label><span class="in"><input id="txMine" type="number" min="0" max="365" step="1" value="${C20.personal_days}" inputmode="numeric"></span></div>`
  + `<div class="out"><span>Dues you deduct for the year</span><strong id="txDed" aria-live="polite">${V0.ded}</strong></div>`
  + `<div class="out s"><span>Rented share of the nights</span><strong id="txShare">${V0.share}</strong></div>`
  + `<p id="txSay" class="say">${V0.say}</p></div></figure>`
  + `<script>(function(){var D=${deduct.toString()};var V=${view.toString()};`
  + `function n(id){var e=document.getElementById(id);var v=e?parseFloat(e.value):NaN;return isFinite(v)&&v>0?v:0}`
  + `function m(v){return "$"+Math.round(v).toLocaleString("en-US")}`
  + `function run(){var o=document.getElementById("txDed"),s=document.getElementById("txShare"),y=document.getElementById("txSay");if(!o||!s||!y)return;`
  + `var md=n("txDues"),r=Math.min(365,Math.round(n("txRent"))),p=Math.min(365,Math.round(n("txMine")));var x=V(D,m,md,r,p);o.textContent=x.ded;s.textContent=x.share;y.textContent=x.say}`
  + `["txDues","txRent","txMine"].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener("input",run)});run()})();</script>`;

/* ---- The page's own styles. ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const RED = "#a8482f", BRASS = "#c4783a", SLATE = "#5c6b78", GREEN = "#2f6b4f", INK = "#8a5226";
const S = "main#main";
const CSS = "<style>"
  + `${S} .tx-fig{max-width:760px;margin:1.3rem 0 1.5rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;box-sizing:border-box;${CARD}}`
  + `${S} .tx-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .8rem}`
  + `${S} .tx-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.8rem}`
  /* the answer badges */
  + `${S} .tx-a{display:inline-block;padding:.2rem .65rem;border-radius:999px;font-family:var(--sans);font-weight:700;font-size:.95rem;color:#fff;white-space:nowrap}`
  + `${S} .tx-a.no{background:${RED}}${S} .tx-a.yes{background:${GREEN}}${S} .tx-a.part{background:${INK}}`
  /* the rule table: rows on a wide screen, cards on a phone */
  + `${S} .tx-rules{width:100%;border-collapse:collapse;font-family:var(--sans)}`
  + `${S} .tx-rules th,${S} .tx-rules td{text-align:left;vertical-align:top;padding:.75rem .5rem;border-bottom:1px solid rgba(28,32,40,.1);font-size:1rem;line-height:1.45;color:var(--muted)}`
  + `${S} .tx-rules thead th{font-size:.85rem;color:var(--navy);font-weight:700;border-bottom:2px solid rgba(28,32,40,.18)}`
  + `${S} .tx-rules tbody th{color:var(--navy);font-weight:650;width:32%}${S} .tx-rules td:nth-child(2){width:15%}`
  + `@media (max-width:699px){${S} .tx-rulefig{padding:1rem .8rem}${S} .tx-rules thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .tx-rules,${S} .tx-rules tbody,${S} .tx-rules tr,${S} .tx-rules th,${S} .tx-rules td{display:block;width:auto!important}`
  + `${S} .tx-rules tr{background:#fff;border:1px solid rgba(28,32,40,.1);border-radius:14px;padding:.75rem .9rem;margin:0 0 .55rem}`
  + `${S} .tx-rules th,${S} .tx-rules td{border:0;padding:0}${S} .tx-rules tbody th{font-size:1.06rem;margin-bottom:.4rem}`
  + `${S} .tx-rules td{margin-top:.35rem}${S} .tx-rules td:nth-child(3)::before{content:attr(data-label);display:block;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:${INK};font-weight:700}}`
  /* the calculator */
  + `${S} figure.tx-cfig.tx-cfig{margin:0;padding:0;background:none!important;border:0!important;box-shadow:none!important;max-width:600px}`
  + `${S} .tx-calc{max-width:600px;margin:1.4rem 0 1.6rem;padding:1.3rem 1.3rem 1.2rem;border-radius:20px;box-sizing:border-box;background:linear-gradient(160deg,rgba(42,48,64,.97),rgba(28,32,40,.99));color:var(--ivory)}`
  + `${S} .tx-calc .k{font-family:var(--sans);font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);font-weight:600;margin:0 0 .9rem}`
  + `${S} .tx-calc .f{display:flex;justify-content:space-between;align-items:center;gap:.8rem;margin:0 0 .75rem}`
  + `${S} .tx-calc label{color:rgba(244,239,232,.95);font-family:var(--sans);font-size:1.0625rem;line-height:1.35;flex:1 1 auto}`
  + `${S} .tx-calc .in{white-space:nowrap;color:rgba(244,239,232,.75);font-family:var(--sans);font-size:1.0625rem;flex:none}`
  + `${S} .tx-calc input{width:6.2rem;min-height:44px;box-sizing:border-box;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.45);border-radius:8px;color:#f4efe8;font-family:var(--sans);font-size:1.0625rem;padding:.45rem .6rem;text-align:right}`
  + `${S} .tx-calc .out{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;border-top:1px solid rgba(244,239,232,.22);margin-top:1rem;padding-top:.9rem;font-family:var(--sans);color:rgba(244,239,232,.95);font-size:1.0625rem}`
  + `${S} .tx-calc .out strong{color:var(--brass-2);font-family:var(--serif);font-size:1.9rem;line-height:1}`
  + `${S} .tx-calc .out.s{border-top:0;margin-top:.4rem;padding-top:0}${S} .tx-calc .out.s strong{font-size:1.25rem;color:var(--ivory);font-family:var(--sans)}`
  + `${S} .tx-calc .say{font-family:var(--sans);color:rgba(244,239,232,.92);line-height:1.55;margin:.8rem 0 0;font-size:1.0625rem}`
  /* what the dues include */
  + `${S} .tx-inc{list-style:none;margin:0;padding:0;display:grid;gap:.6rem;grid-template-columns:repeat(2,minmax(0,1fr))}@media (min-width:700px){${S} .tx-inc{grid-template-columns:repeat(5,minmax(0,1fr))}}`
  + `${S} .tx-inc li{margin:0;padding:.85rem .8rem;border-radius:16px;background:#fff;border:1px solid rgba(28,32,40,.1)}`
  + `${S} .tx-inc strong{display:block;color:var(--navy);font-family:var(--serif);font-size:1.9rem;line-height:1.05;margin-bottom:.25rem}`
  + `${S} .tx-inc span{display:block;color:var(--muted);font-family:var(--sans);font-size:1rem;line-height:1.35}${S} .tx-inc small{display:block;margin-top:.3rem;color:${INK};font-weight:600;font-size:.95rem}${S} .tx-inc li:last-child{grid-column:1/-1}@media (min-width:700px){${S} .tx-inc li:last-child{grid-column:auto}}`
  /* dues against tax */
  + `${S} .tx-pairs{list-style:none;margin:0;padding:0;display:grid;gap:.7rem}`
  + `${S} .tx-pairs>li{margin:0;padding:.85rem .95rem;border-radius:16px;background:#fff;border:1px solid rgba(28,32,40,.1)}${S} .tx-pairs>li.hot{border:2px solid ${BRASS}}`
  + `${S} .tx-pairs .l{color:var(--navy);font-family:var(--sans);font-weight:650;font-size:1.0625rem;line-height:1.45;margin:0 0 .55rem}`
  + `${S} .tx-pairs .x{display:block;color:${INK};font-weight:700;font-size:.95rem;margin-top:.15rem}`
  + `${S} .tx-pairs .row{display:flex;align-items:center;gap:.6rem;margin:.3rem 0}`
  + `${S} .tx-pairs .row .k{flex:none;width:2.6rem;color:var(--muted);font-family:var(--sans);font-size:.95rem}`
  + `${S} .tx-pairs .bar{flex:none;height:.85rem;min-width:.85rem;width:calc((100% - 10.5rem) * var(--f));border-radius:999px}`
  + `${S} .tx-pairs .bar.d{background:linear-gradient(90deg,${BRASS},#d4894a)}${S} .tx-pairs .bar.t{background:${SLATE}}`
  + `${S} .tx-pairs .v{color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1rem;white-space:nowrap}`
  /* special assessments, two by two */
  + `${S} .tx-grid{display:grid;gap:.6rem}@media (min-width:640px){${S} .tx-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .tx-grid>div{padding:.9rem 1rem;border-radius:16px;background:#fff;border:1px solid rgba(28,32,40,.1);border-top:4px solid ${SLATE}}`
  + `${S} .tx-grid>div.yes{border-top-color:${GREEN}}${S} .tx-grid>div.no{border-top-color:${RED}}${S} .tx-grid>div.part{border-top-color:${BRASS}}`
  + `${S} .tx-grid .k{font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .3rem}`
  + `${S} .tx-grid b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.25rem}`
  + `${S} .tx-grid p{color:var(--muted);line-height:1.5;margin:0}`
  /* two cards side by side: personal nights, and the two tax rates */
  + `${S} .tx-two{display:grid;gap:.65rem;max-width:760px;margin:1.1rem 0 1.2rem}@media (min-width:700px){${S} .tx-two{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .tx-two>div{padding:1rem 1.1rem;border-radius:18px;background:#fff;border:1px solid rgba(28,32,40,.1);border-top:4px solid ${SLATE}}`
  + `${S} .tx-two>div.pers{border-top-color:${BRASS}}${S} .tx-two>div.rent{border-top-color:${GREEN}}`
  + `${S} .tx-two .k{font-family:var(--sans);font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .45rem}`
  + `${S} .tx-two b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.06rem;line-height:1.4;margin:0 0 .45rem}`
  + `${S} .tx-two ul{margin:0;padding:0 0 0 1.1rem;color:var(--navy);line-height:1.5}${S} .tx-two li{margin:0 0 .35rem}`
  /* the records */
  + `${S} .tx-steps{list-style:none;margin:1.2rem 0 1.4rem;padding:0;max-width:760px;position:relative}`
  + `${S} .tx-steps::before{content:"";position:absolute;left:1.05rem;top:.6rem;bottom:.6rem;width:2px;background:rgba(28,32,40,.16)}`
  + `${S} .tx-steps>li{position:relative;margin:0 0 .7rem;padding:0 0 0 3.1rem}`
  + `${S} .tx-steps .n{position:absolute;left:0;top:.75rem;display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem}`
  + `${S} .tx-steps .c{display:block;padding:.85rem 1rem .9rem;border-radius:16px;${CARD};color:var(--muted);line-height:1.55}`
  + `${S} .tx-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .tx-grid b,${S} .tx-steps b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.2rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  + `@media (min-width:700px){${S} .c3-glance li{align-items:flex-start}}`
  /* Light fix, triage 2026-11-08 (the approved look, Blog-Brain batches/2026-11-a/hoa-documents/DESIGN.md): the italic
     line at about half the H1's size on its own line; on a phone the three facts are flat rows under thin rules. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:#8a5226!important}}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{background:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}}`
  /* the roof example */
  + `${S} .tx-roof{list-style:none;margin:0;padding:0;display:grid;gap:.6rem;grid-template-columns:1fr}@media (min-width:560px){${S} .tx-roof{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .tx-roof li{margin:0;padding:.85rem .9rem;border-radius:16px;background:#fff;border:1px solid rgba(28,32,40,.1)}${S} .tx-roof li.hot{border:2px solid ${BRASS}}`
  + `${S} .tx-roof strong{display:block;color:var(--navy);font-family:var(--serif);font-size:1.7rem;line-height:1.1;margin-bottom:.2rem}${S} .tx-roof span{display:block;color:var(--muted);font-family:var(--sans);font-size:1rem;line-height:1.4}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* Work-arounds copied from /hoa/documents/ (from /hoa/reserves/ NEEDS 10, 11): the feed's search row at
     320 px, the header phone at 1000 to 1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* ---- The photo (VERIFY.md, Photo candidate; this page's photos.json). ---- */
const PH = read("photos.json").photos;
const ph = PK.create({ h, photos: PH, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "640px" });
const PHOTO = ph.aerial("myrtle-beach-condo-tower", PH[0].caption);
ph.share("myrtle-beach-condo-tower");
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const LEGAL = `<p style="font-size:.95rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Tax notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We do not prepare tax returns, and nothing on this page is tax advice.</p>`;
const AFTER = () => { const c = ph.credits(); if (!GENERIC_CREDIT.test(c)) throw new Error("photos.js changed its general credit line; recheck"); return LEGAL + c.replace(GENERIC_CREDIT, ""); };

/* ---- The glance row under the H1 (rows 1, 27, 32). ---- */
const GLANCE = PK.glance([
  { icon: "home", label: "$0", text: "of HOA fees deductible on a home you live in" },
  { icon: "dollar", label: `${money(YEAR)} a year`, text: "deductible on a condo rented all year at the middle Horry County dues" },
  { icon: "tax", label: `${times(MB4).replace(/^a/, "A")}`, text: "a year of dues against the property tax on a Myrtle Beach condo its owner lives in" },
]);

/* ---- Links ---- */
const P527 = "https://www.irs.gov/publications/p527";
const P530 = "https://www.irs.gov/publications/p530";
const P523 = "https://www.irs.gov/publications/p523";
const P587 = "https://www.irs.gov/publications/p587";
const ISE = "https://www.irs.gov/instructions/i1040se";
const T12_6 = "https://www.scstatehouse.gov/code/t12c006.php";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const ACT110 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/4216.htm";
const TREAS = "https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx";

const FAQ = [
  { q: "Are HOA fees tax deductible on my primary residence?", a: "No. On a home you live in, HOA and condo fees are a personal cost, like insurance and utilities. They are not a property tax either, because an association, not a government, charges them." },
  { q: "Are HOA fees deductible on a rental property?", a: "Yes. On a condo you rent out, the dues are a rental expense on Schedule E. On a house in an HOA that you rent out, the dues are a cost of renting it, like insurance and repairs." },
  { q: "Are HOA fees deductible on a second home I do not rent?", a: "No. A second home you never rent follows the same rule as a main home. If you rent it for 15 days or more, the rented share of the nights becomes deductible." },
  { q: "Can I deduct HOA fees if I work from home?", a: "Not as an employee: an employee gets no home office deduction. A self-employed owner who qualifies splits whole-home costs by the share of the home used for business. The IRS's examples are insurance, utilities and general repairs. Its home office guide does not say whether association dues count, so this page does not say they do." },
  { q: "Do HOA special assessments lower capital gains when I sell?", a: "On a condo you live in, an assessment for an improvement is added to your cost basis, which lowers the taxable gain. If you qualify, the first $250,000 of gain on a main home is not taxed, or $500,000 for a married couple filing jointly." },
  { q: "Do family stays count as personal use?", a: "Yes, unless the relative rents it at a fair price as their main home. A stay by you, a co-owner or a relative is a personal night, and so is any night rented below a fair price." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: "Are HOA Fees Tax Deductible in South Carolina? | Chapter3",
  description: "HOA fees on a home you live in are not deductible; on a rental they are. The rented share, second homes, special assessments, Schedule E and Grand Strand dues.",
  ogTitle: "Are HOA fees tax deductible in South Carolina? The answer by how you use the home, in dollars",
  crumb: "Tax deductible",
  eyebrow: "HOA Guide",
  h1: "Are HOA fees tax deductible in South Carolina?",
  h1em: "Not on the home you live in. Yes on the nights you rent it out.",
  sub: `On a Horry County condo with the middle HOA fees of ${money(DUES)} a month, the nights you rent it decide how much is deductible.`,
  heroMedia: GLANCE,
  heroCta: { title: "Looking at a condo? Get its dues and what they include before you offer.", label: "Have us check the dues", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "HOA fees on a home you live in are not tax deductible. On a condo or house you rent out, the dues are a rental expense, taken off the rent on Schedule E, the IRS form for rental income.",
    "If you rent it out and also stay there, you deduct the rented share. Divide the nights rented at a fair price by those nights plus your personal nights. The same rules on dues apply on the South Carolina return.",
  ],
  sections: [
    { h2: "Are HOA fees tax deductible?", toc: "The answer by how you use the home", id: "the-answer", html: () => CSS + ph.css() +
      h.p(`Only when the home is rented out. The IRS lists homeowners association (HOA) fees, condo fees and common charges with homeowners insurance, utilities and internet service as costs you ${h.ext(P530, "cannot deduct on a home")}. On a rental, ${h.ext(P527, "IRS Publication 527")} lets you deduct dues paid for upkeep of the shared parts of a condo building.`) +
      RULES +
      h.p("A deduction is not money back. It lowers the rental income that is taxed, and what it saves depends on the rest of your return.") },

    { h2: "How much of the HOA fee can I deduct if I rent and use the condo?", toc: "Your rented share", id: "rented-share", html: (bg) =>
      h.p("You deduct the rented share: rented nights as a share of rented nights plus personal nights. Nights the condo sat empty count on neither side.") +
      h.p("A night rented at a fair price counts as rented, even if you were there that day. A fair price is about what a person not related to you would pay. A rent far below what similar condos nearby charge is not a fair price.") +
      h.p("Put in your own numbers:") +
      CALC +
      h.p(`Worked example: fewer personal nights can mean a larger deduction. On the condo below, rented 120 nights, cutting personal nights from 20 to 14 raises the deductible dues. The condo also stops counting as your home.`) +
      EXAMPLE +
      h.h3("When the condo counts as your home") +
      h.p("The IRS counts a condo as your home if your personal nights are more than 14. If you rent it more than 140 nights at a fair price, the line is 10 percent of those nights instead.") +
      h.p("Counting as your home matters when the rent is less than your rental costs. Then the deductions stop at the rent, and you can use the rest on next year's return for the same condo.") +
      h.p(`If it does not count as your home, the rental can show a loss. Whether that loss lowers the tax on your other income, such as wages, depends on the loss limits on our ${h.a("/invest/str-tax-treatment/", "short-term rental tax page")}.`) +
      h.p(`This IRS test is not the county's 72-day limit for the property tax rate, which comes below. The ${h.a("/invest/14-day-rule/", "14-day rule page")} has the other IRS day counts.`) +
      h.h3("What counts as a personal night") +
      NIGHTS +
      h.cta("Want the numbers for one condo?", "Send us the condo you are looking at. We find its dues, what they include, and whether its rules allow short-term rentals, before you make an offer.", "Have us check one condo", "/contact/", bg) },

    { h2: "What do condo HOA fees cost in Horry County?", toc: "Dues by area", id: "dues-by-area", html: () =>
      h.p(`About ${money(DUES)} a month, or ${money(YEAR)} a year, for the middle condo for sale in Horry County. In oceanfront buildings the middle is about ${money(F.listings.oceanfront_median_dues_month)} a month. The middle dues are about ${money(ZLOW.median_month)} a month in Socastee and about ${money(ZTOP.median_month)} at the north end of Myrtle Beach.`) +
      BY_ZIP +
      h.p("Most Horry County condos for sale say their dues include the building's insurance, water and sewer, trash and internet.") +
      INCLUDES +
      h.p("On a rental, the insurance, utilities and internet are rental costs too, inside the dues or not.") +
      h.p(`The deduction needs nights you are allowed to rent. About 7 in 10 condos for sale in Horry County say they allow short-term rentals. When we search for a buyer who plans to rent, we filter out communities that ban renting. Then our agents read the ${h.a("/hoa/rental-restrictions/", "rental rules")} in the HOA documents.`) },

    { h2: "Do HOA fees count as property tax?", toc: "HOA fees and property tax", id: "property-tax", html: (bg) =>
      h.p(`No. HOA fees are not a property tax, because an association, not a government, charges them. The IRS says you ${h.ext(P530, "cannot deduct them as real estate tax")}.`) +
      h.p(`A home you live in, once you claim it with the county, is taxed at the 4 percent rate. Rentals, second homes and any home whose owner has not claimed that rate pay 6 percent. An owner who lives in another state pays 6 percent, because the 4 percent rate is only for the owner's ${h.ext(T12_43, "domicile")}.`) +
      h.p(`On a Myrtle Beach condo at the 4 percent rate, a year of dues at the middle for condos for sale in ZIP 29577 is about ${money(MB4.dues_year)}. That is ${times(MB4)} the 2026 tax bill on a middle-valued condo in the city taxed at that rate, ${about10(MB4.tax_year)}.`) +
      DUES_TAX +
      h.p(`On a home you live in, the property tax counts on the federal return if you itemize, meaning you list your deductions instead of taking the standard deduction. The dues never do. On a rental, both are rental expenses.`) +
      h.h3("The county's 72-day limit") +
      h.p(`A condo you live in can be rented for part of the year and keep the 4 percent rate. It keeps that rate only while you still qualify and rent it no more than 72 days in a calendar year. The assessor may ask for your Schedule E.`) +
      h.p(`The ${h.a("/buyers/property-taxes/", "property tax page")} explains the two rates and works out the bill at either one.`) +
      h.cta("What will one condo cost you each year?", "Send us the condo you like. We pull its county tax bill, read the association's budget for the dues, and send you both for a year.", "Have us pull the tax bill and dues", "/contact/", bg) },

    { h2: "Is an HOA special assessment tax deductible?", toc: "Special assessments", id: "special-assessments", html: () =>
      h.p(`On a rental, yes if it pays for upkeep, and slowly if it pays for an improvement. On a home you live in, no. A ${h.a("/hoa/special-assessments/", "special assessment")} is a one-time bill on top of the dues, usually for a large job.`) +
      ASSESS +
      h.p(`Worked example: your share of a roof assessment on a condo you rent out is ${money(ROOF)}. You deduct about ${money(ROOF_YR)} a year in each full year, over 27.5 years from when the new roof is in service. In service means finished and ready to use.`) +
      ROOFFIG +
      h.p(`Our page on ${h.a("/invest/rental-depreciation/", "rental depreciation")} shows how the first and last years are counted.`) +
      h.p(`On a condo you live in, an assessment that is not just for repairs or upkeep is added to your cost basis, what the home cost you. The basis rarely matters on a main home. If you qualify, the ${h.ext(P523, "first $250,000 of gain")} is not taxed, or $500,000 for a married couple filing jointly.`) +
      h.p("Whether a job is upkeep or an improvement depends on the work. The assessment notice and the board's minutes say what the work is.") },

    { h2: "Does South Carolina treat HOA fees differently?", toc: "South Carolina and owners out of state", id: "south-carolina", html: (bg) =>
      h.p(`No. ${h.ext(T12_6, "South Carolina starts from the federal figures")}, so the same rules on dues, rental days and depreciation apply on the state return. From 2026, ${h.ext(ACT110, "South Carolina does not use")} the federal itemized deductions. That does not touch the dues on a rental, which come off the rent, not off a list of itemized deductions.`) +
      h.p(`About 6 in 10 Horry County condo units have their tax bill mailed to an address outside South Carolina. For an owner who lives in another state, the rent from a Grand Strand condo, less its costs and dues, is South Carolina income.`) +
      h.p(`On the South Carolina return, the dues come off that rent the same way they do on the federal return. How your home state treats the same rent depends on that state's law, not South Carolina's.`) +
      PHOTO +
      h.p(`Across Horry County, only about 1 in 5 condo units is taxed at the 4 percent rate as the home its owner lives in. Our ${h.a("/invest/condos/", "condo investing page")} has the counts by town.`) +
      h.cta("Buying a Grand Strand condo from another state?", "We read the building's rental rules and budget, pull its tax bill, and send you what the dues and the tax come to in a year.", "Send us the condo you like", "/contact/", bg) },

    { h2: "Where do HOA fees go on Schedule E, and what records do I keep?", toc: "Schedule E and records", id: "schedule-e", html: () =>
      h.p(`Schedule E has no line for association dues. An expense not listed on lines 5 to 18 goes on ${h.ext(ISE, "line 19, Other")}.`) +
      h.p("Line 2 asks for the nights rented at a fair price and the nights of personal use. Keep these four records:") +
      STEPS +
      h.p(`The ${h.a("/hoa/documents/", "HOA documents page")} lists what each paper shows. What you pay the association at closing is on our page on ${h.a("/hoa/estoppel-and-transfer-fees/", "transfer fees")}.`) },
  ],
  pageImages: () => ph.pageImages(),
  afterSources: () => AFTER(),
  faqTitle: "HOA fees and taxes FAQ",
  faq: FAQ,
  sources: [
    { name: "IRS Pub. 527", href: P527 },
    { name: "IRS Pub. 530", href: P530 },
    { name: "IRS Pub. 523", href: P523 },
    { name: "IRS Pub. 587", href: P587 },
    { name: "Schedule E instructions", href: ISE },
    { name: "SC Code 12-6", href: T12_6 },
    { name: "SC Code 12-37", href: T12_37 },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "SC Act 110 (H. 4216)", href: ACT110 },
    { name: "Horry County Treasurer", href: TREAS },
  ],
  sourcesNote: "Condo counts: Horry County parcel records. Dues and what they include: CCMLS listings on our site, counted in total. Not tax advice.",
  bottomCta: { h2: "Know the dues before you buy the condo.", p: "Send us the condo or the area. We get the dues, what they include, the tax bill and the rental rules, and tell you what they mean for you.", label: "Ask us about a condo", href: "/contact/" },
  keywords: "are HOA fees tax deductible, HOA fees tax deductible South Carolina, are HOA fees deductible on rental property, HOA fees second home, HOA special assessment tax deductible, do HOA fees count as property tax, HOA fees Schedule E, condo fees tax deductible, HOA fees home office, HOA fees deductible Myrtle Beach",
  about: "The federal and South Carolina income tax treatment of homeowners association and condo dues on a home, a rental and a second home",
});
