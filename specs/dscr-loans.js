/* /invest/strategies/dscr-loans/ - DSCR loans in Myrtle Beach and South Carolina: what the ratio is, how a lender works
 * it out on a Grand Strand rental, what ratio passes, which kinds of homes here pass before the loan is even counted,
 * nightly-rental income, condotels, what to bring, who qualifies, and what we do at each step.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this is its first spec. Plan: Blog-Brain
 * batches/2026-11-b/invest-strategies-dscr-loans/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows, and CORRECTED
 * rows (2, 4, 5, 7, 8, 11, 13, 20, 22, 32, 42, 43) only in the verifier's wording (VERIFY.md). Struck wording:
 * batches/2026-11-b/facts/invest-strategies-dscr-loans-struck.json. Never on this page: an interest rate, a payment
 * amount, a down-payment figure outside the one BrickWood range (row 26), the names of the lenders behind the three
 * program sheets or a link to them (they are "for the use of mortgage professionals only"), the 80 percent oceanfront
 * line (row 20), an AirROI link (VERIFY "Not to publish"), "no tax returns" in the copy (row 3: one sentence, once).
 * Data, never typed: data/2026-11-b/invest-strategies-dscr-loans/findings.json and chart-rent-split.json
 * (build_findings.py: every share is of the rent a lender counts; no rate and no payment is used).
 * Design, as /sell/home-value/ and /submarkets/garden-city/ (owner-approved): the answer first, question headings, the
 * italic line at about half the H1's size, one card style for the formula, the chart and the scale, plain lists and
 * tables under thin rules, one block width of 720 px, an offer after about every second section, each tied to it.
 * Homes (owner, 2026-11-08 and 2026-11-10: the strip is the strongest offer, its title bold and true): the site's edge
 * feed under the opening (idx-lib/feeds.js DSCR), and three strips in the sections that name a place: Longs houses,
 * Carolina Forest houses (two new places) and Garden City Beach condos (str-garden-city-beach-condos). The new places,
 * the feed's new title and withStrips: true for this URL are in BUILD.md for the lead (idx-lib is outside this
 * folder). Until then the two new strips stay empty and take no space, and their offer pill shows in their place.
 * Kept from the live page: the searched words of the title, "qualifies on the rent", the definition, the steps with
 * what we do at each, the 14-day line (in the verifier's wording), the 0.75 floor, the links out, the two stories,
 * the FAQ questions people search, the phone number. Cut: the nine struck lines, the boxes that repeated the steps,
 * the mini calculator (/invest/long-term-rental/ owns that search), "Local wrinkles".
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/strategies/dscr-loans/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "invest-strategies-dscr-loans");
const F = JSON.parse(fs.readFileSync(path.join(DATA, "findings.json"), "utf8"));
const CH = JSON.parse(fs.readFileSync(path.join(DATA, "chart-rent-split.json"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`dscr-loans.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r25 = (v) => money(Math.round(v / 25) * 25);
const P = (v) => Math.round(v);
const INK = "#8a5226", BRASS = "#c4783a", NAVY = "#1c2028", SLATE = "#5c6b78", RED = "#9b2c2c";

/* ---- Rows 16 to 21: the six worked homes, read from findings.json. ---- */
const CASE = (name) => { const c = F.cases.find((x) => x.name === name); must(c, `findings.json has no case "${name}"`); return c; };
const LONGS = CASE("Longs, 3-bedroom house");
const CFH = CASE("Carolina Forest, 3-bedroom house");
const CFC = CASE("Carolina Forest, 2-bedroom condo");
const MBC = CASE("Myrtle Beach, 2-bedroom condo, yearly lease");
const OCEAN = CASE("Myrtle Beach oceanfront, 2-bedroom condo, nightly (75 percent counted)");
const GCB = CASE("Garden City Beach, 2-bedroom condo, nightly (75 percent counted)");
must(F.target_ratio === 1.25 && F.str_counted.brickwood === 0.75 && F.str_counted.published_programs === 0.8, "rows 6, 8, 26: the ratio or the counted shares moved");
must(F.mills.unincorporated === 201.0 && F.mills.myrtle_beach_city === 254.6 && F.mills.mi_gc_fire === 207.3, "row 12: the millage moved");
must(LONGS.rent_counted_month === 2270 && CFH.rent_counted_month === 2230 && CFC.rent_counted_month === 1840 && MBC.rent_counted_month === 1420, "row 13: HUD's rents moved");
must(LONGS.price === 320000 && CFH.price === 390000 && CFC.price === 165000 && MBC.price === 240000, "row 14: the middle asking prices moved");
must(CFH.tax_month === 392 && CFH.insurance_month === 275 && CFH.dues_month === 100 && CFH.dues_month === LONGS.dues_month, "rows 14, 15, 17: the worked example's inputs moved");
must(P(LONGS.pct_tax_ins_dues) === 31 && P(LONGS.pct_left_for_loan_at_1_25) === 49, "row 16 moved");
must(P(CFH.pct_tax_ins_dues) === 34 && P(CFH.pct_left_for_loan_at_1_25) === 46, "row 17 moved");
must(P(CFC.pct_left_for_loan_at_1_25) === 44 && CFC.dues_month === 425, "row 18 moved");
must(P(MBC.pct_left_for_loan_at_1_25) === 14 && P(MBC.pct_dues) === 39 && MBC.dues_month === 550, "row 19 moved");
must(P(OCEAN.pct_tax_ins_dues) === 109 && OCEAN.ratio_before_any_loan === 0.91 && OCEAN.reaches_1_25_with_no_loan === false && r25(OCEAN.dues_month) === "$1,225", "row 20 moved");
must(P(GCB.pct_left_for_loan_at_1_25) === 20 && GCB.dues_month === 575 && GCB.dues_month < OCEAN.dues_month / 2, "row 21 moved: the Garden City Beach dues are no longer under half the oceanfront tower's");
must(LONGS.pct_left_for_loan_at_1_25 === Math.max(...F.cases.map((c) => c.pct_left_for_loan_at_1_25)), "the Longs strip says its house leaves the most for the loan of the six cases");
const HC = F.haircut;
must(HC.mb_2br_nightly_median_year === 20100 && HC.median_counted_75_month === 1256 && HC.hud_2br_29577_month === 1420 && HC.median_counted_75_below_hud_29577, "row 22 moved");

/* ---- V1: the worked example (row 17), a plain table inside the formula card. No figure for the loan. ---- */
const CF_SHARE = P(CFH.pct_tax_ins_dues), CF_LEFT = P(CFH.pct_left_for_loan_at_1_25);
const exRow = (what, amt, why) => `<tr><th scope="row">${what}</th><td class="a">${amt}</td><td class="w">${why}</td></tr>`;
const FORMULA = `<div class="dl-card" role="group" aria-label="The DSCR formula and a worked example">`
  + `<p class="k">The formula</p>`
  + `<p class="dl-f"><b>DSCR</b> = the monthly rent the lender counts, divided by the monthly bill: principal and interest, property tax, insurance and HOA dues.</p>`
  + `<div class="dl-tw"><table class="dl-ex"><caption>Worked example: the middle 3-bedroom house for sale in Carolina Forest, asking about ${r5k(CFH.price)}</caption>`
  + `<thead><tr><th scope="col">In the ratio</th><th scope="col">A month</th><th scope="col">Where it comes from</th></tr></thead><tbody>`
  + exRow("Rent the lender counts", money(CFH.rent_counted_month), "HUD's fair market rent for a 3-bedroom in the ZIP code. Your lender uses the appraiser's figure.")
  + exRow("Property tax", `about ${money(CFH.tax_month)}`, "A rental is taxed on 6 percent of its value, at the 2026 county rate for most homes outside city limits")
  + exRow("Insurance", `about ${money(CFH.insurance_month)}`, "A landlord policy, one agency's estimate. We get a quote for the address.")
  + exRow("HOA dues", money(CFH.dues_month), "The middle house's HOA fee")
  + exRow("Principal and interest", "Lender's quote", "")
  + `</tbody></table></div>`
  + `<p class="dl-res">The tax, insurance and HOA use about <b>${CF_SHARE} percent</b> of the rent. At a ratio of 1.25, principal and interest must fit in the <b>${CF_LEFT} percent</b> that is left.</p></div>`;

/* ---- V2: the ratio scale (rows 5, 6, 26): a line from 0.6 to 1.4 with the four marks, drawn twice (a phone one and a
   wide one) so its words stay 13 to 16 px, then one line for each mark. ---- */
const MARKS = [0.75, 1.0, 1.15, 1.25];
const scaleSvg = (Wd, fs, cls, lo = 0.6, hi = 1.4) => {
  const pad = Math.round(fs * 1.6), x0 = pad, x1 = Wd - pad;
  const X = (v) => x0 + (v - lo) / (hi - lo) * (x1 - x0);
  const ty = Math.round(fs * 1.9), th = Math.round(fs * 0.75), H = ty + th + Math.round(fs * 2);
  const band = (a, b, fill) => `<rect x="${X(a).toFixed(1)}" y="${ty}" width="${(X(b) - X(a)).toFixed(1)}" height="${th}" fill="${fill}"/>`;
  const marks = MARKS.map((m) => `<line x1="${X(m).toFixed(1)}" x2="${X(m).toFixed(1)}" y1="${ty - 4}" y2="${ty + th + 4}" stroke="${NAVY}" stroke-width="2"/>`
    + `<text x="${X(m).toFixed(1)}" y="${ty - Math.round(fs * 0.55)}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${m === 1.25 ? INK : NAVY}">${m.toFixed(2)}</text>`).join("");
  const under = `<text x="${x0}" y="${H - Math.round(fs * 0.35)}" font-size="${fs}" fill="#4a4f5c">Rent falls short</text>`
    + `<text x="${x1}" y="${H - Math.round(fs * 0.35)}" text-anchor="end" font-size="${fs}" fill="#4a4f5c">More cushion</text>`;
  return `<svg class="${cls}" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="A line of DSCR ratios from ${lo.toFixed(1)} to ${hi.toFixed(1)}. Below 1.00 the rent falls short of the bill. Marked: 0.75, our affiliated lender's floor; 1.00, where the rent just covers the bill; 1.15, asked by some programs for a nightly rental; 1.25, our target.">`
    + band(lo, 1.0, "rgba(155,44,44,.22)") + band(1.0, 1.25, "rgba(92,107,120,.25)") + band(1.25, hi, "rgba(196,120,58,.45)") + marks + under + `</svg>`;
};
const SCALE = `<figure class="dl-card dl-scalecard"><p class="k">What the ratio means</p>`
  + scaleSvg(280, 15, "dl-n", 0.7, 1.3) + scaleSvg(640, 15, "dl-w")
  + `<ol class="dl-scale">`
  + `<li><span class="n">0.75</span><span class="t"><b>Our affiliated lender's floor</b>BrickWood Mortgage, a separate company, starts writing DSCR loans at this ratio.</span></li>`
  + `<li><span class="n">1.00</span><span class="t"><b>The rent just covers the bill</b>The three program sheets we read ask for a ratio of 1.00 or more.</span></li>`
  + `<li><span class="n">1.15</span><span class="t"><b>A nightly rental, at some programs</b>Some ask 1.15 for a nightly rental, or 1.25 on a small loan.</span></li>`
  + `<li class="us"><span class="n">1.25</span><span class="t"><b>Our target</b>A fifth of the rent is left after the whole bill.</span></li>`
  + `</ol></figure>`;

/* ---- V3: the rent split (rows 16 to 21), stacked bars from chart-rent-split.json. A full bar is the rent a lender
   counts; the dashed line is 100 percent. One message, in the title. ---- */
const LABELS = {
  "Longs, 3-bedroom house": "Longs house, 3 bedrooms",
  "Carolina Forest, 3-bedroom house": "Carolina Forest house, 3 bedrooms",
  "Carolina Forest, 2-bedroom condo": "Carolina Forest condo, 2 bedrooms",
  "Myrtle Beach, 2-bedroom condo, yearly lease": "Myrtle Beach condo in the city, 2 bedrooms",
  "Garden City Beach, 2-bedroom condo, nightly (75 percent counted)": "Garden City Beach condo, 2 bedrooms, nightly",
  "Myrtle Beach oceanfront, 2-bedroom condo, nightly (75 percent counted)": "Myrtle Beach oceanfront condo, 2 bedrooms, nightly",
};
const ORDER = Object.keys(LABELS);
must(CH.rows.length === ORDER.length && CH.rows.every((r) => LABELS[r.label]), "chart-rent-split.json: the rows changed; update LABELS");
const SCALE_MAX = 115;
const W = (v) => (v / SCALE_MAX * 100).toFixed(2) + "%";
/* Each bar is a small SVG with its own text alternative; it stretches to the row's width, so x = 100 sits under the
   dashed "all the rent" line at every width. */
const COL = { hoa: NAVY, ti: SLATE, cu: "rgba(196,120,58,.32)", left: BRASS };
const splitRow = (r) => {
  const c = F.cases.find((x) => x.name === r.label);
  must(Math.abs(r.tax + r.insurance + r.hoa - c.pct_tax_ins_dues) < 0.2, `chart and findings disagree on ${r.label}`);
  const over = r.short_by > 0;
  const tail = over ? `<b class="bad">More than the rent before any loan</b>` : `<b>About ${P(r.left_for_loan)}%</b> left for the loan`;
  const parts = [["hoa", r.hoa], ["ti", r.tax + r.insurance]].concat(over ? [] : [["cu", r.cushion], ["left", r.left_for_loan]]);
  let x = 0;
  const rects = parts.filter(([, v]) => v > 0).map(([k, v]) => { const t = `<rect x="${x.toFixed(2)}" y="0" width="${v.toFixed(2)}" height="10" fill="${COL[k]}"/>`; x += v; return t; }).join("");
  const alt = `${LABELS[r.label]}: HOA fee ${P(r.hoa)} percent and tax and insurance ${P(r.tax + r.insurance)} percent of the rent` + (over ? ", more than all of it" : `, ${P(r.left_for_loan)} percent left for the loan at 1.25`);
  return `<li><span class="lab">${LABELS[r.label]}</span><span class="val">${tail}</span>`
    + `<svg class="bar" viewBox="0 0 ${SCALE_MAX} 10" preserveAspectRatio="none" role="img" aria-label="${alt}">${rects}`
    + (over ? `<line x1="100" x2="100" y1="0" y2="10" stroke="#fff" stroke-width="3" vector-effect="non-scaling-stroke"/>` : "") + `</svg></li>`;
};
const rowsInOrder = ORDER.map((l) => CH.rows.find((r) => r.label === l));
const SPLIT = `<figure class="dl-card dl-split">`
  + `<p class="cap">On a beach condo, the HOA fee and the tax use most of the rent before the loan</p>`
  + `<p class="key"><span><i class="s-hoa"></i>HOA fee</span><span><i class="s-ti"></i>Tax and insurance</span><span><i class="s-cu"></i>Cushion at 1.25</span><span><i class="s-left"></i>Left for the loan</span></p>`
  + `<ol class="rows" style="--full:${W(100)}">${rowsInOrder.map(splitRow).join("")}</ol>`
  + `<p class="ax"><span style="left:${W(100)}"><i aria-hidden="true">&#9650;</i>All the rent</span></p>`
  + `<figcaption>Share of the monthly rent a lender counts, for the middle home for sale of each kind. Yearly leases use HUD's rent for the ZIP code. Nightly condos count 75 percent of a year of guest payments. Insurance is one agency's estimate, and flood insurance is not included.</figcaption></figure>`;

/* ---- One photo (record in data/2026-11-b/invest-strategies-dscr-loans/photos.json, copied from the page that first
   showed it; a public domain U.S. government aerial, looked at full size by that page's writer): Garden City Beach, condos
   on the sand and the marsh behind. The caption says only what it shows. Fix round 1 dropped the Longs aerial (a raw
   subdivision beside farm fields); the Longs and Carolina Forest sections now open with a place a renter would want. ---- */
const PHOTOS = JSON.parse(fs.readFileSync(path.join(DATA, "photos.json"), "utf8")).photos;
const GC_PH = PH.findPhoto(PHOTOS, "garden-city-condos-2011");
const photo = (rec, caption) => PH.heroPhoto(rec, { alt: rec.alt, caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
const GC_CAP = "A condo tower and low-rise condo buildings on the beach at Garden City Beach, with the salt marsh behind them.";
const CREDITS = PH.creditsList([{ photo: GC_PH, caption: "Condo buildings at Garden City Beach" }]);

/* ---- The glance row under the H1 (rows 16, 17, 26, 6). ---- */
const GLANCE = PK.glance([
  { icon: "home", label: `${CF_LEFT} to ${P(LONGS.pct_left_for_loan_at_1_25)}%`, text: "of the rent left for the loan on an inland house" },
  { icon: "dollar", label: "75 to 80%", text: "of nightly income that lenders count" },
  { icon: "key", label: "1.25", text: "the ratio we aim for" },
]);

/* ---- Homes strips (BUILD.md lists the two new places for the lead). Titles are true by the place's search and a
   ledger row: Longs leaves the most rent for the loan of the six cases (rows 16 to 21, checked above); almost no
   Carolina Forest houses are in the high-risk flood zone (row 43); the Garden City Beach title is the owner's own
   (2026-11-10), as /invest/airbnb-income/ ships it. ---- */
const ASK = "/contact/";
const LONGS_STRIP = G.homes("dscr-longs-houses", "Longs", G.offer("Longs", { label: "Send me 3-bedroom rentals in Longs" }), "Longs houses: the strongest DSCR numbers we found");
const CF_STRIP = G.homes("dscr-carolina-forest-houses", "Carolina Forest", G.offer("Carolina Forest", { label: "Send me Carolina Forest houses that clear 1.25" }), "Best DSCR rental buys in Carolina Forest");
const GC_STRIP = G.homes("str-garden-city-beach-condos", "Garden City Beach", "", "Best Airbnb opportunities in Garden City Beach");

/* ---- Links (each opened by the researcher and again by the verifier). The three DSCR program sheets are not linked
   or named: each says it is for mortgage professionals only. ---- */
const FNMA = "https://selling-guide.fanniemae.com/sel/b3-6-03/monthly-housing-expense-subject-property";
const REGZ = "https://www.consumerfinance.gov/rules-policy/regulations/1026/interp-3/";
const SC43 = "https://www.scstatehouse.gov/code/t12c043.php";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const HUD = "https://www.huduser.gov/portal/datasets/fmr.html";
const CLOV_L = "https://clovered.com/landlord-insurance/south-carolina/";
const MBSTR = "https://www.cityofmyrtlebeach.com/news_detail_T6_R1468.php";
const FHFA_CONDO = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";

/* ---- The page's own styles. One card style (the glass surface of the offers) for the formula, the scale and the
   chart; tables and lists sit on the page under thin rules. As /invest/strategies/1031-exchange/. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const SURF = "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,inset 0 1px 0 rgba(255,255,255,.9)),var(--g-sh,0 10px 26px -18px rgba(28,32,40,.35))";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  /* the contents list: no card, in columns between two thin rules */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* the headline: the italic line at about half the H1's size; the hero sub is said by the short answer */
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  /* the hero tiles: glass tiles on a wide screen, short rows under rules on a phone */
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* one block width */
  + `${S} .dl-card,${S} .dl-plain,${S} .dl-steps,${S} .dl-story{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  /* the card: the formula, the scale and the chart */
  + `${S} .dl-card{margin:1.3rem 0 1.5rem!important;padding:1.2rem 1.3rem 1.1rem!important;border-radius:20px!important;${SURF};font-family:var(--sans);color:var(--navy)}`
  + `${S} .dl-card .k{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .6rem}`
  + `${S} .dl-f{font-family:var(--serif);font-size:1.3rem;line-height:1.45;color:var(--navy);margin:0 0 1rem;padding:0 0 1rem;border-bottom:${RULE}}`
  + `${S} .dl-f b{color:${INK}}`
  /* the worked example: a plain table that folds on a phone */
  + `${S} .dl-ex{width:100%;border-collapse:collapse;font-size:1.0625rem;color:var(--navy)}`
  + `${S} .dl-ex caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .6rem}`
  + `${S} .dl-ex thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .6rem .45rem 0;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .dl-ex tbody th{text-align:left;font-weight:600;padding:.6rem .8rem .6rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.35}`
  + `${S} .dl-ex td{padding:.6rem .6rem .6rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.45}`
  + `${S} .dl-ex td.a{white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600}${S} .dl-ex td.w{color:var(--muted);font-size:1rem}`
  + `${S} .dl-ex tbody tr:last-child>*{border-bottom:0}`
  + `@media (max-width:599px){${S} .dl-ex,${S} .dl-ex tbody,${S} .dl-ex caption{display:block;width:100%}`
  + `${S} .dl-ex thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .dl-ex tr{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:.8rem;padding:.6rem 0;border-bottom:${RULE}}`
  + `${S} .dl-ex tbody tr:last-child{border-bottom:0}${S} .dl-ex th,${S} .dl-ex td{border:0!important;padding:0!important}`
  + `${S} .dl-ex td.a{text-align:right;white-space:normal;max-width:9.5rem}${S} .dl-ex td.w{grid-column:1/-1;margin-top:.15rem}${S} .dl-ex td.w:empty{display:none}}`
  + `${S} .dl-res{margin:.9rem 0 0;padding:.9rem 0 0;border-top:1px solid rgba(28,32,40,.3);font-size:1.0625rem;line-height:1.6;color:var(--navy)}`
  /* the scale */
  + `${S} .dl-scalecard svg.dl-n{display:block;width:100%;height:auto;max-width:360px;margin:0 0 .8rem}${S} .dl-scalecard svg.dl-w{display:none;width:100%;height:auto;max-width:660px;margin:0 0 .8rem}`
  + `@media (min-width:600px){${S} .dl-scalecard svg.dl-n{display:none}${S} .dl-scalecard svg.dl-w{display:block}}`
  + `${S} .dl-scale{list-style:none;margin:0;padding:0}`
  + `${S} .dl-scale li{display:grid;grid-template-columns:4.6rem minmax(0,1fr);column-gap:1rem;align-items:baseline;padding:.75rem 0;border-top:${RULE};margin:0}`
  + `${S} .dl-scale li:first-child{border-top:0;padding-top:.2rem}`
  + `${S} .dl-scale .n{font-family:var(--serif);font-size:1.9rem;line-height:1;color:var(--navy);font-variant-numeric:tabular-nums}`
  + `${S} .dl-scale li.us .n{color:${INK}}`
  + `${S} .dl-scale .t{color:var(--muted);font-size:1.0625rem;line-height:1.5}${S} .dl-scale .t b{display:block;color:var(--navy);font-size:1.08rem;line-height:1.35}`
  /* the chart */
  + `${S} .dl-split .cap{font-family:var(--sans);font-weight:700;font-size:1.2rem;line-height:1.35;color:var(--navy);margin:0 0 .7rem;text-wrap:balance}`
  + `${S} .dl-split .key{display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;margin:0 0 .9rem;font-size:1rem;color:var(--navy)}`
  + `${S} .dl-split .key i{display:inline-block;width:.85rem;height:.85rem;border-radius:3px;margin-right:.4rem;vertical-align:-.08em}`
  + `${S} .dl-split .rows{list-style:none;margin:0;padding:0;position:relative}`
  + `${S} .dl-split .rows li{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:.8rem;margin:0;padding:.55rem 0 .65rem}`
  + `${S} .dl-split .lab{font-weight:600;font-size:1.0625rem;line-height:1.35;color:var(--navy)}`
  + `${S} .dl-split .val{font-size:1rem;line-height:1.35;color:var(--muted);text-align:right;white-space:nowrap}${S} .dl-split .val b{color:var(--navy)}${S} .dl-split .val b.bad{color:${RED}}`
  + `${S} .dl-split svg.bar{grid-column:1/-1;display:block;width:100%;height:1.15rem;margin-top:.4rem;border-radius:6px;overflow:hidden}`
  + `${S} .dl-split .s-hoa{background:${NAVY}}${S} .dl-split .s-ti{background:${SLATE}}${S} .dl-split .s-cu{background:rgba(196,120,58,.32)}${S} .dl-split .s-left{background:${BRASS}}`
  + `${S} .dl-split .ax{position:relative;height:2.5rem;margin:-.3rem 0 .6rem;font-size:.95rem;color:var(--muted)}${S} .dl-split .ax span{position:absolute;top:0;display:block;transform:translateX(-50%);text-align:center;white-space:nowrap;line-height:1.2}${S} .dl-split .ax i{display:block;font-style:normal;color:var(--navy);font-size:.8rem;line-height:1}`
  + `${S} .dl-split figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin:0;padding:.7rem 0 0!important;border-top:${RULE};background:none!important}`
  + `@media (max-width:519px){${S} .dl-split .rows li{grid-template-columns:1fr}${S} .dl-split .val{text-align:left;white-space:normal;margin-top:.1rem}}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .dl-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .dl-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .dl-plain li:last-child{border-bottom:${RULE}}${S} .dl-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* numbered steps: the same list, with the step's number in brass */
  + `${S} .dl-steps{list-style:none;counter-reset:xs;margin:1.1rem 0 1.4rem;padding:0}`
  + `${S} .dl-steps li{counter-increment:xs;position:relative;margin:0;padding:.8rem 0 .8rem 2.6rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .dl-steps li:last-child{border-bottom:${RULE}}${S} .dl-steps li::before{content:counter(xs);position:absolute;left:0;top:.8rem;width:1.8rem;height:1.8rem;border-radius:50%;background:rgba(196,120,58,.14);color:${INK};font-family:var(--sans);font-weight:700;font-size:1rem;line-height:1.8rem;text-align:center}`
  + `${S} .dl-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  /* a place inside the rentals section: its name, its lines, its strip */
  + `${S} .dl-place{margin:1.8rem 0 .4rem;font-size:1.35rem!important}`
  /* the story, set off by a brass rule */
  + `${S} .dl-story{margin:1.2rem 0 1.4rem;padding:.2rem 0 .2rem 1.1rem;border-left:3px solid ${BRASS};color:var(--navy);font-size:1.0625rem;line-height:1.7}`
  /* Work-arounds copied from /invest/strategies/1031-exchange/: the feed's search row at 320 px, the header phone at
     1000 to 1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="dl-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const steps = (items) => `<ol class="dl-steps">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ol>`;
const place = (t) => `<h3 class="dl-place">${t}</h3>`;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. It does not lend or do any financing work. Our affiliated lender, BrickWood Mortgage, is a separate company. Your lender's terms decide your loan.</p>`;

/* The FAQ repeats only questions the page answers, said short and in other words. Plain characters only. */
const FAQ = [
  { q: "What is a good DSCR for a rental property?", a: "Our target is 1.25, which leaves a fifth of the rent after the whole monthly bill. The three program sheets we read ask for 1.00 or more." },
  { q: "Can I get a DSCR loan in South Carolina without tax returns?", a: "Yes. A DSCR loan is judged on the home's rent and its monthly bill. You sign that the home is a rental for business and that you will not live in it." },
  { q: "Can I get a DSCR loan if the rent does not cover the bill?", a: "Sometimes. Our affiliated lender, BrickWood Mortgage, a separate company, starts writing DSCR loans at a ratio of 0.75. Below 1.00, you pay the rest of the bill each month." },
  { q: "Can I use Airbnb income for a DSCR loan in Myrtle Beach?", a: "At some lenders. They count 75 to 80 percent of the nightly-rental estimate, and two of the three sheets we read take it only on a refinance. The city and the HOA must allow nightly rentals." },
  { q: "Does a DSCR loan need an appraisal?", a: "Yes. The rent the lender counts is the appraiser's market rent, written on a rent schedule with the appraisal." },
  { q: "Can I get a DSCR loan in an LLC?", a: "Yes. A DSCR loan can close in your name or in an LLC. The investor clients we work with usually close in an LLC." },
  { q: "Can a first-time home buyer get a DSCR loan?", a: "Not at the three programs we read. A first-time investor who already owns a home can qualify at some programs." },
  { q: "Can Canadians get a DSCR loan?", a: "A Canadian without a Social Security number and U.S. credit usually needs a DSCR loan, and needs a Social Security number or a U.S. taxpayer ID number (TIN). Some programs take only U.S. citizens and permanent residents." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Strategies", url: "/invest/strategies/" },
  title: "DSCR Loans in Myrtle Beach, SC: Which Rentals Pass the Ratio",
  description: "DSCR loans in Myrtle Beach and South Carolina: the formula, what ratio passes, how much of the rent the tax and HOA dues use here, and Airbnb income rules.",
  /* Our own share card (tools/ogcard.js, run on a copy of this page), kept in this page's image folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/invest-strategies-dscr-loans/share.jpg",
  ogImageAlt: "DSCR loans in Myrtle Beach: which rentals here pass the ratio? A house inland passes with room to spare. A nightly oceanfront condo can fail before the loan.",
  ogTitle: "DSCR loans in Myrtle Beach: which Grand Strand rentals pass the ratio, and which fail before the loan",
  crumb: "DSCR Loans",
  eyebrow: "Investor financing",
  h1: "DSCR loans in Myrtle Beach: which rentals here pass the ratio?",
  h1em: "A house inland passes with room to spare. A nightly oceanfront condo can fail before the loan.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: "The 6 percent rental tax and the HOA fee sit inside a DSCR loan's ratio. Houses inland often pass, while a beach condo's dues can use the rent first.",
  heroMedia: CSS + G.homesCss() + GLANCE,
  heroCta: { title: "Send us a listing. We work out its ratio before you offer.", label: "Have us check a listing's ratio", href: ASK },
  author: "devin",
  shortAnswer: [
    `A DSCR loan qualifies on the rent. The lender divides the rent it counts by the monthly bill: principal and interest, property tax, insurance and HOA dues. The three program sheets we read ask for a ratio of 1.00 or more.`,
    `On the Grand Strand, the middle 3-bedroom house in Longs or Carolina Forest leaves ${CF_LEFT} to ${P(LONGS.pct_left_for_loan_at_1_25)} percent of the rent for the loan at our 1.25 target. On the middle oceanfront two-bedroom in Myrtle Beach rented by the night, the dues, tax and insurance alone come to more than the income a lender counts.`,
  ],
  sections: [
    { h2: "What is a DSCR loan, and does it work in South Carolina?", toc: "DSCR in SC", id: "what-is-dscr", html: () =>
      h.p(`DSCR is short for debt service coverage ratio. It is the rent a home collects, divided by the monthly bill it must cover. The lender qualifies the loan on the rent, not on your income. You sign that the home is for business and that you will not live in it.`) +
      h.p(`DSCR loans work on South Carolina rentals, and the formula does not change at the state line. The local numbers do. A rental here is taxed on 6 percent of its value, condo dues can be high, and towns and HOAs set their own rules on nightly rentals. Each of those sits inside the ratio.`) +
      h.p(`The rent the lender counts is the appraiser's. The appraiser fills in a rent schedule with the appraisal, and with a lease in place the lender may use the lease, within limits. HUD's rents on this page are a guide; the appraiser's figure is the one that counts.`) },

    { h2: "How do you calculate DSCR on a Grand Strand rental?", toc: "The formula", id: "formula", html: (bg) =>
      h.p(`Add up the monthly bill, then divide the rent by it. ${h.ext(FNMA, "The bill lenders divide by")} holds principal and interest, the property tax, the insurance and the HOA dues.`) +
      FORMULA +
      h.p(`The HOA fee counts against the rent, and a special assessment can count too; ask your lender. Flood insurance counts where a home needs it. ${h.a("/invest/long-term-rental/", "Our rental analyzer")} runs the same numbers on any address.`) +
      h.cta("Have us fill in the bill for an address.", "Send us an address. We fill in the tax, an insurance quote and the dues, and you add your lender's quote.", "Have us fill in the numbers", ASK, bg) },

    { h2: "What is a good DSCR for a rental, and what if it is below 1.00?", toc: "A good ratio", id: "good-ratio", html: () =>
      h.p(`A ratio of 1.00 means the rent just covers the bill. Our target is 1.25.`) +
      SCALE +
      h.p(`Below 1.00, the rent does not cover the bill, and you pay the rest each month. At 1.25, the cushion is there for an empty month or a repair.`) },

    { h2: "Which Grand Strand rentals pass a DSCR loan?", toc: "Which rentals pass", id: "which-pass", html: () =>
      h.p(`We worked out the bill on six kinds of home for sale here, at the middle asking price of each. The chart shows how much of the rent the tax, the insurance and the HOA fee use before the loan.`) +
      SPLIT +
      plain([
        ["A city condo on a yearly lease is tight", `The middle 2-bedroom condo inside Myrtle Beach leaves about ${P(MBC.pct_left_for_loan_at_1_25)} percent. Its dues alone, about ${money(MBC.dues_month)} a month, take ${P(MBC.pct_dues)} percent of the rent.`],
        ["An oceanfront condo rented by the night fails before the loan", `Take a typical oceanfront two-bedroom in Myrtle Beach, booked the nights the average listing books. That average counts listings open only part of the year. Its HOA fee is about $1,200 a month. With the tax and insurance, that is about ${P(OCEAN.pct_tax_ins_dues)} percent of the nightly income a lender counts at 75 percent. The ratio is about ${OCEAN.ratio_before_any_loan.toFixed(2)} with no loan at all.`],
      ]) +
      h.p(`Taxes stop more rental deals here than insurance does. A home that is not its owner's legal residence, such as a house rented out year-round or a second home, is taxed on 6 percent. ${h.a("/buyers/property-taxes/", "Our property tax guide")} works out the bill.`) +
      place("Longs: the Waccamaw River, and the most rent left for the loan") +
      h.p(`The Waccamaw River runs past Longs, and it is the only river that starts in a Carolina bay. From the landing on SC 9, you can paddle a state preserve along 28 miles of it, past bald cypress and water tupelo. Otters and black bears live there, and you may camp on the riverbank on preserve land.`) +
      h.p(`Of the six homes we worked, the Longs house leaves the most of the rent for the loan, about ${P(LONGS.pct_left_for_loan_at_1_25)} percent. The middle 3-bedroom house for sale asks about ${r5k(LONGS.price)}, and HUD's rent for a 3-bedroom in its ZIP code is ${money(LONGS.rent_counted_month)} a month.`) +
      h.p(`Much of Longs is new. About half the houses sold there in a year of county deeds were sales by builders, 280 of 607. About 2 in 5 homes in its ZIP code were built in 2010 or later. Only 3 in 100 of its houses are in FEMA's high-risk flood zone. Builders here rarely offer incentives to a buyer using a DSCR loan, so plan on none.`) +
      LONGS_STRIP +
      place("Carolina Forest: trails in the woods, and almost no houses in the flood zone") +
      h.p(`Off River Oaks Drive, the county's Bike and Run Park, which riders call "The Hulk", has 7 miles of mountain bike and running trails on about 70 acres. It sits between Carolina Forest and the Intracoastal Waterway.`) +
      h.p(`Almost no houses in Carolina Forest are in FEMA's high-risk flood zone, and half its homes were built in 2007 or later. The middle 3-bedroom house for sale asks about ${r5k(CFH.price)} and leaves about ${CF_LEFT} percent of the rent for the loan.`) +
      h.p(`A condo there does almost as well. At HUD's 2-bedroom figure for the ZIP code, the middle 2-bedroom condo, about ${r5k(CFC.price)} with dues of about ${money(CFC.dues_month)} a month, leaves about ${P(CFC.pct_left_for_loan_at_1_25)} percent.`) +
      CF_STRIP +
      h.p(`${h.a("/invest/where-to-buy/", "Our where-to-buy guide")} compares every area's rent with its prices.`) },

    { h2: "Can you use Airbnb income for a DSCR loan in Myrtle Beach?", toc: "Airbnb income", id: "airbnb-income", html: (bg) =>
      h.p(`Yes, at some lenders. Lenders count 75 to 80 percent of the nightly-rental estimate, to allow for advertising, furnishing and cleaning. A loan officer at our preferred lender says only 75 percent counts. Two of the three program sheets we read count at most 80 percent of nightly-rental income; the third asks for a 1.15 ratio instead.`) +
      h.p(`The cut can make a nightly rental count for less than a yearly lease. The middle two-bedroom nightly rental in the Myrtle Beach area took in about ${money(HC.mb_2br_nightly_median_year)} in a year, counting listings open only part of the year. Counted at 75 percent, that is about ${money(HC.median_counted_75_month)} a month. HUD's figure for a 2-bedroom on a yearly lease in ZIP code 29577 is ${money(HC.hud_2br_29577_month)}.`) +
      plain([
        ["Some programs take it only on a refinance", "Two of the three sheets we read take nightly income only when you refinance. On a purchase, the home may have to qualify on the yearly-lease rent."],
        ["The rules must allow nightly rentals", `The lender's appraiser must show no city, county or HOA rule against them. In the City of Myrtle Beach, a stay under 90 days is short-term, and most of the city's residential zones bar it. ${h.a("/invest/str-rules/", "Our short-term rental rules guide")} goes town by town.`],
        ["Most condos allow them; few houses with an HOA do", "About 7 in 10 condos for sale in Horry County say short-term rentals are allowed. Among houses for sale with an HOA fee, about 4 in 100 say so."],
      ]) +
      place("Garden City Beach: the pier, and a beach condo that still passes") +
      h.p(`Garden City Beach has a 668-foot pier. In summer, bands play every night at both ends of it, weather permitting, and you can fish from it around the clock. A pier pass covers fishing, so no state license is needed.`) +
      h.p(`It is also where a condo by the sea can still pass the ratio. About two dozen condos for sale in Garden City Beach are marked for nightly rentals. The middle 2-bedroom among them has dues of about ${money(GCB.dues_month)} a month, under half the oceanfront tower's. Counted at 75 percent, its nightly income leaves about ${P(GCB.pct_left_for_loan_at_1_25)} percent for the loan at 1.25.`) +
      photo(GC_PH, GC_CAP) +
      GC_STRIP +
      h.p(`${h.a("/invest/airbnb-income/", "What Airbnbs make here")} has the income town by town, and ${h.a("/invest/str-vs-ltr/", "nightly or yearly")} compares the two plans.`) +
      h.cta("Have us check whether a condo's nightly income passes the ratio.", "Send us the condo. We read its HOA papers for the rental rules and work out its ratio at 75 percent.", "Have us check a condo's numbers", ASK, bg) },

    { h2: "Can you get a DSCR loan on a condotel or non-warrantable condo here?", toc: "Condotels", id: "condotels", html: () =>
      h.p(`A non-warrantable condo is in a building that fails one of Fannie Mae's project rules, so the usual conventional loan will not work there.`) +
      h.p(`Often not. About 8 in 10 condos for sale in oceanfront buildings in Horry County say the unit is in a rental program. All three DSCR program sheets we read exclude non-warrantable condos, and two of them also name condotels. Fannie Mae ${h.ext(FHFA_CONDO, "will not buy a loan")} in a building run like a hotel or with a rental pool. It is one of the two companies Congress created to buy mortgages from lenders.`) +
      h.p(`${h.a("/invest/condotel-financing/", "Our condotel financing guide")} names the buildings and the loans that do work. ${h.a("/invest/non-warrantable-condos/", "Our non-warrantable condo guide")} goes tower by tower.`) +
      G.offer("the building", { label: "Have us check the building before you offer" }) },

    { h2: "How much down, what credit score and what else does a DSCR loan need?", toc: "What to bring", id: "what-to-bring", html: () =>
      h.p(`A DSCR loan asks you for money down, a credit score, money in reserve and a plan for the first few years.`) +
      plain([
        ["Money down", "15 to 25 percent on most purchases, and more on a condotel. Figures from our affiliated lender, BrickWood Mortgage, a separate company."],
        ["Credit score", "The program sheets we read set credit score floors from 660 to 720."],
        ["Reserves", "Money in the bank after closing, counted in months of the home's bill. The programs we read ask for 3 to 6 months, and one asks a first-time investor for 12."],
        ["A fee to pay off early", `Many DSCR loans charge a prepayment fee if you sell or refinance in the first few years. Ask your lender before a quick resale or ${h.a("/invest/strategies/brrrr/", "a BRRRR refinance")}.`],
        ["The price of the loan", "According to a loan officer at our preferred lender, with good credit and a 1.25 to 1.5 ratio, a DSCR loan is priced about like a conventional loan."],
      ]) +
      h.p(`To see what the loan would cost on a home here, call us. We will work with our affiliated lender to give you solid numbers.`) },

    { h2: "Who can get a DSCR loan: an LLC, a first-time investor, a Canadian?", toc: "Who qualifies", id: "who-qualifies", html: (bg) =>
      h.p(`Each of them can get a DSCR loan at some programs, with limits.`) +
      plain([
        ["An LLC", `A DSCR loan can close in your name or in an LLC; the investor clients we work with usually close in an LLC. About 9 in 10 of them form a new LLC for each house. ${h.a("/invest/llc/", "Our LLC guide")} covers the steps.`],
        ["A first-time investor", "One program we read takes a first-time investor with a 700 score, 12 months of reserves and a home they own and live in. Another does not take them, and a third asks them for a 1.00 ratio. All three refuse a first-time home buyer."],
        ["A Canadian", `Canadians usually need a DSCR loan unless they have a Social Security number and U.S. credit, or a U.S. work card. They need a Social Security number or a U.S. taxpayer ID number from the IRS, called a TIN. Some programs take only U.S. citizens and permanent residents. ${h.a("/invest/canadian-buyers/", "Our guide for Canadian buyers")} has the rest.`],
        ["Someone who will use it too", `Plan to stay in the home more than 14 days in the coming year? Then ${h.ext(REGZ, "federal rules")} no longer treat it as a rental its owner does not live in. The business-loan exemption may not apply. Tell your lender early.`],
      ]) +
      h.cta("Have us find a rental that clears 1.25.", "Tell us your price range and how you will hold it. We send homes whose rent clears the ratio, with the tax, the dues and the rental rules checked.", "Send me rentals that clear 1.25", ASK, bg) },

    { h2: "How does Chapter3 help with a DSCR purchase on the Grand Strand?", toc: "How we help", id: "how-we-help", html: () =>
      h.p(`The investor clients we work with here buy most often with a DSCR loan or ${h.a("/invest/strategies/1031-exchange/", "a 1031 exchange")}. At each step of a DSCR purchase, we do the work:`) +
      steps([
        ["Find the property", "Many agents wait for the client to bring a deal. We search the Grand Strand for homes that cash flow enough for a DSCR loan, and we send them to you."],
        ["Check the rules", "Many communities ban renting the house at all. We filter out the ones here that do, and we read the HOA papers for rules that would block your plan."],
        ["Work out the bill", "We work out the Horry County tax at 6 percent, and we get an insurance quote for the house before you make an offer."],
        ["Run the ratio", "We divide the rent by the bill, at our 1.25 target. If you plan to rent by the night, we count 75 percent of the nightly income."],
        ["Choose your lender", "You choose your lender. Our affiliated lender, BrickWood Mortgage, a separate company, is one option."],
      ]) +
      `<p class="dl-story">We have a buyer who spent over a year scrolling Zillow and sending his agent links, asking if each was a good purchase. Every time, he got the same answer: yes, it is in an up and coming neighborhood.</p>` +
      h.p(`Finding the property is the hard part, and it is the part we do.`) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([GC_PH]) + LEGAL,
  faqTitle: "DSCR loan FAQ",
  faq: FAQ,
  sources: [
    { name: "Fannie Mae B3-6-03", href: FNMA },
    { name: "Reg Z comment 3(a)-4", href: REGZ },
    { name: "SC Code 12-43-220", href: SC43 },
    { name: "Horry County 2026 tax levy", href: LEVY },
    { name: "HUD fair market rents", href: HUD },
    { name: "Clovered insurance estimates", href: CLOV_L },
    { name: "City of Myrtle Beach", href: MBSTR },
  ],
  sourcesNote: "Loan rules: three DSCR program sheets for mortgage professionals, read by us and not named. Nightly income: AirROI. Listings: our count, in total only; one that does not say rentals are allowed may be a ban, a limit or a blank field. Longs and Carolina Forest: county deeds, FEMA and the Census Bureau. Not loan advice.",
  bottomCta: { h2: "Send us the listing you are looking at.", p: "We run the rent, the tax, the dues and the HOA's rental rules before you offer. Or call 854.333.2135.", label: "Send us the listing", href: ASK },
  keywords: "DSCR loan Myrtle Beach, DSCR loan South Carolina, DSCR loan requirements South Carolina, how to calculate DSCR for rental property, what is a good DSCR, DSCR loan Airbnb Myrtle Beach, DSCR loan short-term rental, DSCR loan condo Myrtle Beach",
  about: "DSCR loans for rental property in Myrtle Beach and South Carolina, and which Grand Strand rentals pass the ratio",
});
