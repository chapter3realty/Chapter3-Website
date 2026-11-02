/* /hoa/liens-and-foreclosure/ - can an HOA or condo association in South Carolina take your house over unpaid
 * dues: where the power comes from, how often it happens in Horry County, the steps in order with a real case's
 * months, how a $250 bill became $2,898.67, where the lien ranks against a mortgage, what an owner who is behind
 * can do before the sale, what a buyer inherits, and the bills before the legislature.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-02. The live page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-11-a/hoa-liens-and-foreclosure/facts.md, verified rows only, and corrected rows
 * only in the verifier's wording (VERIFY.md). Row 22 is struck: the county's "pay before the sale" sheet speaks of
 * a mortgagor, so the page uses the Winrose replacement ("paying the bill does not by itself end the lawsuit"). Struck
 * wording: hoa-liens-and-foreclosure-struck.json (no "never a private sale" without the timeshare exception, no
 * "final that day", no "no further notice" outside the Winrose case, no "always behind a mortgage", no "dues
 * missed", no "about 3 in 1,000").
 * Data, never typed (website working copy, data/2026-11-a/hoa-liens-and-foreclosure/):
 *   findings.json               every derived number (build-findings.py): the county sale list (rows 18 to 20),
 *                               the Winrose judgment and sale (rows 13, 14), the listings counts (row 38)
 *   chart-winrose-judgment.json the four parts of the Winrose judgment (row 13; the "Dues missed" label is
 *                               replaced here by the verifier's "Unpaid dues in the judgment")
 *   chart-mie-sale-by-lien.json the 4 and 15 of the sale list (row 18)
 *   photos.json                 the one photo (row 39): the Government and Justice Center, Commons, CC BY-SA 3.0
 * Kept from the live page: the title's search words ("Can an HOA Foreclose in South Carolina?"), the court-only
 * point (now with the timeshare exception), the priority point (now with its sources and the 1994 case's limits),
 * the estoppel point for buyers (now with the statute's cap), the 14.1 percent figure (corrected: a share of the
 * recommendations, not of complainants), the FAQ questions on foreclosing, priority and withholding, the internal
 * links, the legal notice (shorter, no typed date).
 * Cut: "generally", "typically", "potentially", "costs escalate quickly", "a question for an attorney rather than a
 * website" as the answer, "This is not optional diligence", the repeated offer, "Verified July 2026".
 * Sibling owners: /invest/foreclosures/ owns buying at the courthouse sale (this page says once that an HOA sale
 * leaves the mortgage on the house, and links there); /hoa/violations-and-fines/ owns fines; /hoa/estoppel-and-
 * transfer-fees/ owns the resale statement and its fee.
 * Fix round 1 (2026-11-02): REVIEW-1.md. New rows 40 to 43 (VERIFIED-BY-FIXER in facts.md): SCRCP 12(a) 30 days to
 * answer, SCRCP 71(a) notice only to parties who answer, 15-11-20 and 15-11-40 (the lawsuit notice binds a buyer; the
 * one who filed it can cancel it once the case is settled or dismissed), no payment-plan rule in 27-30 or 27-31.
 * Row 39 (photo place) confirmed by the fixer. The FAQ holds only questions the body does not answer.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/liens-and-foreclosure/";
const DIR = path.join(__dirname, "..", "data", "2026-11-a", "hoa-liens-and-foreclosure");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const F = read("findings.json"), M = F.mie, W = F.winrose;
const JUDGMENT = read("chart-winrose-judgment.json"), BY_LIEN = read("chart-mie-sale-by-lien.json");

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const cents = (v) => "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const to1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");

/* ---- Rows 18 to 20: the county's sale list. The page says "one month's list"; the byline date covers it. ---- */
const HOA_N = M.hoa_cases, ALL_N = M.cases, MORT_N = M.mortgage_cases;
const CONDO_N = M.hoa_land_use.filter((c) => c === "107").length;
if (HOA_N + MORT_N !== ALL_N) throw new Error("findings.json: the association and mortgage cases do not add to the list");
if (CONDO_N !== HOA_N - 1) throw new Error("findings.json: the page says every association case but one was a condo unit (row 18); re-read the list");
const lienRow = (re) => (BY_LIEN.find((r) => re.test(r.lien)) || {}).cases;
if (lienRow(/^Association/) !== HOA_N || lienRow(/^Mortgage/) !== MORT_N) throw new Error("chart-mie-sale-by-lien.json and findings.json disagree");
const PCT_LO = Math.round(Math.min(...M.hoa_judgment_pct_of_county_value)), PCT_HI = Math.round(Math.max(...M.hoa_judgment_pct_of_county_value));
if (PCT_LO < 4 || PCT_HI > 11) throw new Error("the association debts are no longer about 5 to 10 percent of county value; rewrite row 20's sentence");
if (M.hoa_deficiency_demanded !== 0) throw new Error("an association case now demands a deficiency; rewrite the auction step (row 10)");

/* ---- Rows 13, 14: Winrose. The arithmetic is checked here, not trusted. ---- */
const PARTS = JUDGMENT.map((p) => ({ name: /^Dues/i.test(p.part) ? "Unpaid dues in the judgment" : /^Attorney fees$/i.test(p.part) ? "Attorney's fees" : p.part, value: p.dollars }));
const TOTAL = Math.round(PARTS.reduce((t, p) => t + p.value, 0) * 100) / 100;
if (TOTAL !== W.judgment || TOTAL !== 2898.67) throw new Error("the Winrose parts no longer add to $2,898.67 (row 13)");
const FEES_PCT = Math.round(W.fees_share_of_judgment_pct);
if (FEES_PCT !== 89 || W.judgment_over_dues !== 11.6 || W.bid_pct_of_equity !== 4.9) throw new Error("the Winrose ratios are not the ledger's (rows 13, 14)");

/* Rounded figures for the prose (the exact ones stay in the table, row 13; owner: "too many numbers"). */
const JUDG_ROUND = Math.round(W.judgment / 100) * 100, TIMES_ROUND = Math.round(W.judgment_over_dues), CENTS_ON_DOLLAR = Math.round(W.bid_pct_of_equity);
if (JUDG_ROUND !== 2900 || W.judgment >= 2900 || TIMES_ROUND !== 12 || CENTS_ON_DOLLAR !== 5) throw new Error("the rounded Winrose figures in the prose no longer hold");

/* ---- Links ---- */
const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T15_39 = "https://www.scstatehouse.gov/code/t15c039.php";
const T15_11 = "https://www.scstatehouse.gov/code/t15c011.php";
const T22_3 = "https://www.scstatehouse.gov/code/t22c003.php";
const BAILEY = "https://hallapproved.com/sc/cases/appeals/1994/8325603";
const WINROSE = "https://cases.justia.com/south-carolina/supreme-court/2019-27934.pdf";
const WACHESAW = "https://cases.justia.com/south-carolina/supreme-court/2015-27585.pdf";
const MIE = "https://www.horrycountysc.gov/departments/master-in-equity/";
const MIE_LIST = "https://www.horrycountysc.gov/departments/master-in-equity/principal-sales/";
const SCDCA = "https://consumer.sc.gov/sites/consumer/files/Documents/HOA/2026_HOA_Complaint_Report.pdf";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.2-02/full-review-process";
const USC523 = "https://www.law.cornell.edu/uscode/text/11/523";
const RULE12 = "https://www.sccourts.org/resources/judicial-community/court-rules/civil/rule-12/";
const RULE71 = "https://www.sccourts.org/resources/judicial-community/court-rules/civil/rule-71/";
const SCBAR = "https://www.scbar.org/for-the-public/quicklinks/get-legal-help/";
const S366 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/366.htm";
const H3447 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/3447.htm";
const H5204 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/5204.htm";

/* ---- The page's own blocks. ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const RED = "#a8482f", GREY = "#c9c2b6";
const CSS = "<style>"
  /* figures: a glass card with a caption line on top */
  + `main#main .lf-fig{max-width:760px;margin:1.3rem 0 1.5rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;box-sizing:border-box;${CARD}}`
  + `main#main .lf-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .8rem}`
  + `main#main .lf-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.8rem}`
  /* the 19 cases, one square each */
  + `main#main .lf-waffle{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:.4rem;max-width:520px}`
  + `main#main .lf-waffle li{margin:0;aspect-ratio:1;border-radius:7px;background:${GREY}}main#main .lf-waffle li.a{background:${RED}}`
  + `main#main .lf-key{list-style:none;margin:.9rem 0 0;padding:0;display:grid;gap:.35rem;font-family:var(--sans);font-size:1rem;line-height:1.4;color:var(--navy)}`
  + `main#main .lf-key li{margin:0;display:flex;align-items:flex-start;gap:.5rem}main#main .lf-key i{flex:0 0 auto;width:1rem;height:1rem;border-radius:4px;margin-top:.2rem;background:${GREY}}main#main .lf-key i.a{background:${RED}}`
  + `main#main .lf-key b{font-weight:700}`
  /* the share bar: the debt against the home's county value */
  + `main#main .lf-share{position:relative;height:2.6rem;border-radius:999px;background:${GREY};overflow:hidden;max-width:620px}`
  + `main#main .lf-share i{position:absolute;left:0;top:0;bottom:0;background:${RED}}main#main .lf-share i.lo{width:5%}main#main .lf-share i.hi{width:10%;opacity:.45}`
  + `main#main .lf-share span{position:absolute;right:1rem;top:50%;transform:translateY(-50%);color:var(--navy);font-family:var(--sans);font-weight:700;font-size:1rem}`
  + `main#main .lf-sharekey{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.3rem 1rem;max-width:620px;margin:.55rem 0 0;font-family:var(--sans);font-size:1rem;line-height:1.4;color:var(--navy)}`
  + `main#main .lf-sharekey b{color:${RED}}`
  /* the steps, as a timeline */
  + `main#main .lf-steps{list-style:none;margin:1.2rem 0 1.4rem;padding:0;max-width:760px;position:relative}`
  + `main#main .lf-steps::before{content:"";position:absolute;left:1.05rem;top:.6rem;bottom:.6rem;width:2px;background:rgba(28,32,40,.16)}`
  + `main#main .lf-steps>li{position:relative;margin:0 0 .7rem;padding:0 0 0 3.1rem}`
  + `main#main .lf-steps .n{position:absolute;left:0;top:.75rem;display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem}`
  + `main#main .lf-steps li.hot .n{background:${RED}}`
  + `main#main .lf-steps .c{display:block;padding:.85rem 1rem .9rem;border-radius:16px;${CARD};color:var(--muted);line-height:1.55}`
  + `main#main .lf-steps li.hot .c{border:2px solid ${RED};background:#fff}`
  + `main#main .lf-steps .t{display:inline-block;margin:0 0 .3rem;padding:.1rem .55rem;border-radius:999px;background:rgba(28,32,40,.07);color:var(--navy);font-family:var(--sans);font-size:.85rem;font-weight:600;letter-spacing:.02em}`
  + `main#main .lf-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* the Winrose bill: a table with bars */
  + `main#main .lf-bill{width:100%;border-collapse:collapse;font-family:var(--sans)}`
  + `main#main .lf-bill th,main#main .lf-bill td{text-align:left;vertical-align:top;padding:.6rem .2rem;border-bottom:1px solid rgba(28,32,40,.1);font-size:1rem;line-height:1.4}`
  + `main#main .lf-bill thead th{font-size:.85rem;color:var(--navy);font-weight:700;border-bottom:2px solid rgba(28,32,40,.18)}`
  + `main#main .lf-bill tbody th{color:var(--navy);font-weight:600}main#main .lf-bill td{color:var(--navy);font-weight:700;white-space:nowrap;padding-left:1rem}`
  + `main#main .lf-bill .num{text-align:right}`
  + `main#main .lf-bill .bar{display:block;height:.55rem;border-radius:999px;background:rgba(28,32,40,.08);margin-top:.35rem;overflow:hidden}main#main .lf-bill .bar i{display:block;height:100%;min-width:3px;border-radius:999px;background:${RED}}`
  + `main#main .lf-bill tbody tr:first-child .bar i{background:var(--navy)}`
  + `main#main .lf-bill tfoot th,main#main .lf-bill tfoot td{border-bottom:0;background:rgba(28,32,40,.05);color:var(--navy);font-weight:700;font-size:1.05rem;padding:.7rem .6rem}`
  /* the dark callout: what the house sold for */
  + `main#main .lf-sold{max-width:760px;margin:1.3rem 0 1.5rem;padding:1.2rem 1.3rem;border-radius:20px;box-sizing:border-box;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));color:var(--ivory);box-shadow:0 26px 60px -30px rgba(28,32,40,.6)}`
  + `main#main .lf-sold .k{font-family:var(--sans);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);font-weight:600;margin:0 0 .9rem}`
  + `main#main .lf-sold ol{list-style:none;margin:0;padding:0;display:grid;gap:.9rem}@media (min-width:700px){main#main .lf-sold ol{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `main#main .lf-sold li{margin:0;padding:0}main#main .lf-sold strong{display:block;color:var(--brass-2);font-family:var(--serif);font-size:clamp(1.9rem,7vw,2.3rem);line-height:1.05;margin-bottom:.3rem}`
  + `main#main .lf-sold span{display:block;color:rgba(244,239,232,.92);line-height:1.5;font-size:1rem}`
  /* the priority ladder */
  + `main#main .lf-ladder{list-style:none;counter-reset:ld;margin:0;padding:0;display:grid;gap:.5rem}`
  + `main#main .lf-ladder li{counter-increment:ld;position:relative;margin:0;padding:.75rem 1rem .75rem 3rem;border-radius:14px;background:rgba(255,255,255,.75);border:1px solid rgba(28,32,40,.1);color:var(--navy);font-family:var(--sans);font-size:1.02rem;line-height:1.4}`
  + `main#main .lf-ladder li::before{content:counter(ld);position:absolute;left:.85rem;top:.7rem;display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:.85rem}`
  + `main#main .lf-ladder li.us{border:2px solid ${RED};background:#fff}main#main .lf-ladder li.us::before{background:${RED}}`
  + `main#main .lf-ladder small{display:block;color:var(--muted);font-size:.95rem;margin-top:.1rem}`
  /* two or three cards side by side on a wide screen */
  + `main#main .lf-cards{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.65rem;max-width:760px}`
  + `@media (min-width:760px){main#main .lf-cards:not(.lf-one){grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `main#main .lf-cards li{margin:0;padding:1rem 1.1rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55}`
  + `main#main .lf-cards li.no{border:2px solid ${RED};background:#fff}`
  + `main#main .lf-cards .k{display:block;font-family:var(--sans);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:#8a5226;font-weight:700;margin-bottom:.3rem}`
  + `main#main .lf-cards .w{display:block;margin-top:.5rem;padding-top:.5rem;border-top:1px solid rgba(28,32,40,.1);color:var(--navy);font-family:var(--sans);font-size:.95rem;font-weight:600}`
  + `main#main .lf-cards b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.25rem}`
  /* the numbered actions */
  + `main#main .lf-acts{list-style:none;counter-reset:ac;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.6rem;max-width:760px}`
  + `main#main .lf-acts li{counter-increment:ac;position:relative;margin:0;padding:.9rem 1rem .95rem 3.1rem;border-radius:16px;${CARD};color:var(--muted);line-height:1.55}`
  + `main#main .lf-acts li::before{content:counter(ac);position:absolute;left:.9rem;top:.9rem;display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.85rem}`
  + `main#main .lf-acts li.hot{border:2px solid ${RED};background:#fff}main#main .lf-acts li.hot::before{background:${RED}}`
  + `main#main .lf-acts b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* the court's words */
  + `main#main .lf-quote{max-width:720px;margin:1.2rem 0 1.4rem;padding:.2rem 0 .2rem 1.1rem;border-left:3px solid var(--brass)}`
  + `main#main .lf-quote p{margin:0 0 .35rem;color:var(--navy);font-family:var(--serif);font-size:1.25rem;line-height:1.45}`
  + `main#main .lf-quote cite{font-style:normal;color:var(--muted);font-size:.95rem}`
  /* no single word alone on a heading's last line (critic, round 1) */
  + "main#main h2,main#main h3,main#main .lf-cards b,main#main .lf-acts b,main#main .lf-steps b,main#main a.btn{text-wrap:balance}"
  /* the hero glance tiles: larger figures */
  + "main#main .c3-glance li{line-height:1.4}main#main .c3-glance strong{font-size:1.2rem!important;font-weight:700;line-height:1.25}main#main .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}"
  /* the contents list in two columns on a wide screen (as on /hoa/reserves/) */
  + "@media (min-width:700px){main#main nav[aria-label=\"On this page\"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}"
  /* Work-arounds copied from /hoa/reserves/ (its NEEDS 10, 11, and the sibling's NEEDS 5): the shared feed's search
     row at 320 px, the header phone at 1000 to 1100 px, and the closing band kept dark when the site adds a block after it. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* Row 18 as 19 squares, one per case on the list. */
const WAFFLE = `<figure class="lf-fig"><p class="cap">Foreclosures on Horry County's list for one month's sale</p>`
  + `<ul class="lf-waffle" role="img" aria-label="${ALL_N} squares, one for each foreclosure on the list. ${HOA_N} are brought by an HOA or condo association, ${MORT_N} by a mortgage.">`
  + Array.from({ length: ALL_N }, (_, i) => `<li${i < HOA_N ? ' class="a"' : ""}></li>`).join("") + `</ul>`
  + `<ul class="lf-key"><li><i class="a" aria-hidden="true"></i><span><b>${HOA_N} brought by an HOA or condo association.</b> ${CONDO_N} condo units and one other home.</span></li>`
  + `<li><i aria-hidden="true"></i><span><b>${MORT_N} brought on a mortgage.</b></span></li></ul>`
  + `<figcaption>Our count of the cases on the sale list of the county's Master in Equity, the court officer who holds its foreclosure sales. One square is one case.</figcaption></figure>`;

/* Row 20 as one bar: the association's debt against what the county values the home at (a range across four,
   never one address). */
const SHARE = `<figure class="lf-fig"><p class="cap">The association's debt, against what the county values the home at</p>`
  + `<div class="lf-share" role="img" aria-label="A bar for the home's full county value, with about ${PCT_LO} to ${PCT_HI} percent of it shaded for the association's debt"><i class="hi"></i><i class="lo"></i><span>The whole home</span></div>`
  + `<p class="lf-sharekey"><span><b>About ${PCT_LO} to ${PCT_HI}%:</b> the association's debt</span><span>100%: the home the court sells</span></p>`
  + `<figcaption>The four association cases on the list. The county's value is its figure for property tax.</figcaption></figure>`;

/* The steps in order (rows 6 to 10, 12, 15), each with how long it took in the Winrose case (row 12: behind in
   January 2011, lien April 2011, suit February 2014, judgment July 2014, sale two weeks later). Months, not dates. */
const step = (n, when, title, text, hot) => `<li${hot ? ' class="hot"' : ""}><span class="n" aria-hidden="true">${n}</span><span class="c">${when ? `<span class="t">${when}</span>` : ""}<b>${title}</b>${text}</span></li>`;
const STEPS = `<ol class="lf-steps" aria-label="What happens when HOA dues go unpaid, in order">`
  + step(1, "The start", "Dues go unpaid", "Your community's rules say what is added. In the Winrose case, dues unpaid for 30 days began to earn interest, and a court judgment would add a reasonable attorney's fee and the court costs.")
  + step(2, "Winrose: 3 months in", "A lien goes on the home", "The lien is the association's claim against the home itself. In Winrose, the HOA filed it three months after the owners fell behind.")
  + step(3, "Winrose: about 3 years in", "The lawsuit", "The association sues to foreclose. A notice of the lawsuit, called a lis pendens, may be filed with the county clerk, so it shows on the home's title.")
  + step(4, "Usually 30 days", "Your answer is due", `You usually have 30 days from the day you are served to answer the lawsuit in writing. The time is in ${h.ext(RULE12, "the court's rules")}, and the summons states it.`, true)
  + step(5, "", "No answer: no notice of the rest", `An owner who does not answer usually gets no ${h.ext(RULE71, "notice of the hearings")} that follow. In the Winrose case, one owner put the lawsuit papers in a drawer and forgot them. The owners did not answer and got no further notice of the judgment or the sale. A sale notice still runs in the newspaper. In Horry County it runs three times over three weeks.`, true)
  + step(6, "Winrose: 5 months after the suit", "The judgment", "The judge enters a judgment and orders the home sold. It adds the interest, the fees and the court costs to the dues.")
  + step(7, "Winrose: 2 weeks later", "The auction", `In Horry County, the ${h.ext(MIE, "Master in Equity")} holds the sale at 11 a.m. on the first Monday of each month, or on the Tuesday when that Monday is a holiday. The sale is on the third floor of the Government and Justice Center in Conway. The winning bidder pays 5 percent of the bid by noon the next day.`, true)
  + step(8, "", "The buyer's deed", `The highest bidder gets a deed to the home. What happens to a mortgage on it is ${h.a("#your-mortgage", "below")}.`)
  + `</ol>`;

/* Row 14: what the house sold for, and what the buyer then asked. */
const SOLD = `<div class="lf-sold"><p class="k">The Winrose house, after the judgment</p><ol>`
  + `<li><strong>${money(W.fair_market_value)}</strong><span>What the house was worth, with about ${to1k(W.mortgage_balance)} left on its mortgage.</span></li>`
  + `<li><strong>${money(W.winning_bid)}</strong><span>What a company paid for it at the auction, with the mortgage still on it.</span></li>`
  + `<li><strong>$35,000</strong><span>What the company then asked the owners to pay to keep their home.</span></li></ol></div>`;

/* Row 13 as a table with a bar in each row and a total row (the itemized-table shape of a cost breakdown). */
const MAXP = Math.max(...PARTS.map((p) => p.value));
const JUDGMENT_TABLE = `<figure class="lf-fig"><p class="cap" id="lf-bill-cap">The Winrose judgment: $250 of unpaid dues, and what the court added</p>`
  + `<table class="lf-bill" aria-labelledby="lf-bill-cap"><thead><tr><th scope="col">Part of the bill</th><th scope="col" class="num">Amount</th></tr></thead><tbody>`
  + PARTS.map((p) => `<tr><th scope="row">${p.name}<span class="bar" aria-hidden="true"><i style="width:${(100 * p.value / MAXP).toFixed(1)}%"></i></span></th><td class="num">${cents(p.value).replace(/\.00$/, "")}</td></tr>`).join("")
  + `</tbody><tfoot><tr><th scope="row">The judgment</th><td class="num">${cents(W.judgment)}</td></tr></tfoot></table>`
  + `<figcaption>One South Carolina case, Winrose, in Richland County. The cents are the court's.</figcaption></figure>`;

/* Rows 3, 25: who is paid first in a condo; rows 15, 33, 17: what each kind of foreclosure means. */
const LADDER = `<figure class="lf-fig"><p class="cap">Who is paid first, in a South Carolina condo</p><ol class="lf-ladder">`
  + `<li>Property taxes</li><li>Recorded mortgages and other recorded liens</li><li class="us">The condo association's unpaid dues<small>Then ahead of any other lien on the unit</small></li></ol>`
  + `<figcaption>From South Carolina's condo law, for the lien and for the money from a sale.</figcaption></figure>`;
const BOTH_WAYS = `<ul class="lf-cards lf-one" aria-label="What the order means in each kind of foreclosure">`
  + `<li><span class="k">The association forecloses</span><b>The mortgage stays</b>The buyer at the sale takes the home with the first mortgage still on it, when that mortgage ranks ahead. If you are bidding, read our guide to ${h.a("/invest/foreclosures/", "buying at the courthouse sale")}.</li>`
  + `<li><span class="k">The bank forecloses a condo</span><b>Your neighbors pay the gap</b>When a bank forecloses on a condo, the new owner does not pay the dues the last owner left unpaid after the mortgage was recorded. Every owner in the building pays that share instead.</li>`
  + `<li><span class="k">While a condo case goes on</span><b>The owner owes rent</b>Once the association sues to foreclose a condo, the owner must pay a reasonable rent for the unit while the case goes on.</li></ul>`;

/* Rows 8, 11, 22 (replacement), 23 to 25, 29: what to do now. */
const ACTS = `<ol class="lf-acts" aria-label="What to do if you are behind on HOA dues">`
  + `<li class="hot"><b>Answer the lawsuit within the time on the summons, usually 30 days.</b>An answer is your written reply to the association's complaint. Serve it on the association's lawyer, whose name and address are on the summons, and file it with the clerk of court. A lawyer can write it with you; the $50 line below is a start.</li>`
  + `<li><b>Have the case dismissed when you pay.</b>In Winrose, the owners paid $250 and got a letter that the lien was satisfied. The HOA did not withdraw its suit. Ask the association's lawyer to dismiss the lawsuit and to file a cancellation of the lawsuit notice with the clerk. Under ${h.ext(T15_11, "state law")}, whoever filed that notice can cancel it once the case is settled or dismissed.</li>`
  + `<li><b>A fight over the amount can go to small claims.</b>A money dispute with your HOA of $7,500 or less can go to magistrate court, the county's small claims court. A foreclosure cannot. It goes to the circuit court.</li>`
  + `<li><b>A lawyer for $50.</b>The ${h.ext(SCBAR, "SC Bar's Lawyer Referral Service")}, (803) 799-7100, connects you with a local lawyer. The first 30 minutes cost no more than $50.</li>`
  + `<li><b>Sell before the auction.</b>The lawsuit notice on your title does not stop a sale. It warns any buyer, and a buyer who closes while the case is open is bound by it. Plan for the sale to pay the association and end the case. Unpaid dues usually come out of the seller's money at closing, before you are paid.</li></ol>`;

/* Rows 1, 2, 5: where the power comes from, by kind of association. */
const KINDS = `<ul class="lf-cards" aria-label="Where an association's power to foreclose comes from">`
  + `<li><span class="k">Condo association</span><b>South Carolina's condo law</b>Unpaid dues are a lien on the unit by law, and the association can foreclose it in court.</li>`
  + `<li><span class="k">HOA that is not a condo</span><b>The community's recorded rules</b>These are the rules filed with the county. Courts enforce them like a contract. A lien under them is enforced through the court too.</li></ul>`;

/* Rows 31, 32: the building's own health, for a buyer's loan. */
const LOAN_CARDS = `<ul class="lf-cards" aria-label="When owners behind on dues affect a buyer's loan">`
  + `<li class="no"><span class="k">Can block the loan</span><b>More than 15 in 100 units behind</b>Fannie Mae buys home loans from lenders. When it reviews a whole building, it will not buy a loan on a unit there if that many units are 60 days or more behind on dues.</li>`
  + `<li><span class="k">Does not by itself</span><b>The association suing an owner</b>An association that sues an owner for past-due dues, or forecloses on one, does not by itself make the building ineligible.</li></ul>`;

/* Rows 35 to 37: the bills. None is law. */
const bill = (name, href, title, text, where) => `<li><span class="k">${h.ext(href, name)}</span><b>${title}</b>${text}<span class="w">${where}</span></li>`;
const BILLS = `<ul class="lf-cards lf-one" aria-label="Bills before the South Carolina legislature on HOA foreclosure">`
  + bill("S. 366", S366, "No HOA foreclosure clauses", "Any clause in an HOA's papers that allows foreclosure could not be enforced. A primary home would be protected from a court sale brought only by an HOA. The HOA could still place a lien.", "In the Senate Judiciary Committee")
  + bill("H. 3447", H3447, "A hearing first", "An HOA would need a court hearing before it could advertise a foreclosure sale against an owner who did not answer.", "Passed the House 110 to 2; now in the Senate Judiciary Committee")
  + bill("H. 5204", H5204, "A minimum debt", "No foreclosure for less than $10,000 in dues, or $1,000 per home in the association if that is less. Also 90 days' notice, mediation and a cap on attorney's fees.", "In a House committee")
  + `</ul>`;

/* The one photo (row 39; place checked by the writer, see photos.json subject_check). */
const ph = PK.create({ h, photos: read("photos.json").photos, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "760px" });
const PHOTO = ph.aerial("horry-government-justice-center", "Horry County's Government and Justice Center in Conway, where the county's foreclosure cases are heard and its foreclosure sales are held.");
ph.share("horry-government-justice-center");
/* photos.js adds a general "resized these photos and cropped some of them" line; the one photo already says it
   (as on /hoa/reserves/, its NEEDS 9). */
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, and nothing on this page is legal advice. For advice on your own case, talk to a South Carolina attorney.</p>`;
const AFTER = () => { const c = ph.credits(); if (!GENERIC_CREDIT.test(c)) throw new Error("photos.js changed its general credit line; recheck"); return LEGAL + c.replace(GENERIC_CREDIT, ""); };

/* The glance row under the H1 (rows 18, 13). The 89 percent is said here only. */
const GLANCE = PK.glance([
  { icon: "home", label: `${HOA_N} of ${ALL_N}`, text: "of one month's Horry County foreclosures were for HOA or condo debts" },
  { icon: "town", label: `${FEES_PCT}%`, text: "of one South Carolina HOA's court bill was lawyers' fees and court costs" },
]);

/* Only questions the body does not answer (owner: "say a fact once"). */
const FAQ = [
  { q: "Does an HOA have to agree to a payment plan?", a: "No. South Carolina's HOA and condo laws do not make an association offer one. If it agrees to a plan, get the plan in writing, including what happens to the lawsuit." },
  { q: "Can you get your house back after an HOA foreclosure sale?", a: "Not by paying the association afterward. In a Murrells Inlet case, the owner offered the full fees as soon as he learned of the sale, and the association's lawyers turned it down because someone had already bid. The Supreme Court set the Winrose sale aside because the price was far too low, but that took five years." },
  { q: "Can I stop paying HOA dues if the HOA is not doing its job?", a: "No. A condo owner cannot avoid the dues by not using the shared areas or by leaving the unit. In an HOA, paying the dues is a duty in the community's recorded rules. Holding them back starts the late charges, the lien and the lawsuit." },
  { q: "Can an HOA put a lien on your house for fines?", a: "Only if your community's papers make fines part of the dues the lien covers. South Carolina's HOA law does not say." },
  { q: "Does bankruptcy wipe out HOA dues?", a: "Not the dues that fall due after you file. Those stay owed for as long as you still own the home." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: "Can an HOA Foreclose in South Carolina? Liens and Unpaid Dues",
  description: "Yes, through the court. How a South Carolina HOA lien and foreclosure work, how often it happens in Horry County, and what stops it before the sale.",
  ogTitle: "Can an HOA foreclose in South Carolina? Liens, unpaid dues and the sale",
  crumb: "Liens and Foreclosure",
  eyebrow: "HOA Guide",
  h1: "Can an HOA take your house in South Carolina over unpaid dues?",
  h1em: "Yes, through the court, and the bill that starts it can be small.",
  sub: "How an association forecloses, how often it happens in Horry County, and the steps that stop it before the sale.",
  heroMedia: GLANCE,
  heroCta: { title: "Behind on HOA dues? Ask us about selling before the auction.", label: "Talk to an agent", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "Yes. For a house or a condo, a South Carolina homeowners association (HOA) or condo association can put a lien on your home for unpaid dues and ask a court to sell it. The lien is on the home itself, so it applies whether or not you have a mortgage.",
    "The bill that starts it can be small. Lawyers' fees and court costs are added to it.",
    "If you are sued, you usually have 30 days to answer; the summons gives the time. Answer, and get the case itself dismissed, because paying the bill does not by itself end the lawsuit. Or sell before the auction.",
  ],
  sections: [
    { h2: "Can an HOA foreclose on your house in South Carolina?", toc: "Can they foreclose?", id: "can-they-foreclose", html: () => CSS + ph.css() +
      h.p("Yes, for a house or a condo, through the court. An association cannot sell your home on its own. It files a lawsuit, and a judge orders the sale, the same way a bank forecloses a mortgage. It can also sue you for the money alone, without asking to sell the home.") +
      h.p("The power comes from one of two places:") +
      KINDS +
      h.p(`In a ${h.a("#how-the-bill-grows", "2019 case")}, the community's rules allowed foreclosure, and the South Carolina Supreme Court said the HOA had the legal right to foreclose. It still set that sale aside.`) +
      h.p(`For an HOA that is not a condo, ${h.ext(T27_30, "the state's HOA law")} says nothing about late fees, interest, liens or foreclosure. Those rules are in your community's own papers, so they differ from one community to the next. Our guide to ${h.a("/hoa/south-carolina-hoa-laws/", "South Carolina HOA law")} has what the state does say, and our guide to ${h.a("/hoa/violations-and-fines/", "HOA violations and fines")} covers fines.`) },

    { h2: "How often do HOAs foreclose in Horry County?", toc: "How often here", id: "how-often", html: () =>
      h.p(`Associations bring a real share of the county's foreclosures, mostly against condo units. We read every case on ${h.ext(MIE_LIST, "Horry County's sale list")} for one month and matched each association case to the county's parcel records.`) +
      WAFFLE +
      h.p(`The association debts were small next to the homes. The largest was about ${to1k(M.hoa_judgment_max)}, and the court sells the whole home to pay the debt.`) +
      SHARE +
      h.p(`More of the complaints in the ${h.ext(SCDCA, "state's 2026 HOA report")} came from Horry County than from any other county, almost a third of them.`) },

    { h2: "What happens if you stop paying HOA dues?", toc: "Step by step", id: "step-by-step", html: () =>
      h.p("The bill grows, a lien goes on the home, and the association can sue to have it sold. The months below are from one South Carolina case, Winrose, in Richland County. The time to answer, usually 30 days, is in the court's rules, and the summons states it.") +
      STEPS +
      PHOTO +
      h.p(`In all ${HOA_N} association cases on the county's list, ${h.ext(T15_39, "the bidding closes at the auction")}. It does not stay open 30 days for higher bids. Plan to settle or sell before that day.`) },

    { h2: "How does a small HOA bill turn into thousands?", toc: "How the bill grows", id: "how-the-bill-grows", html: () =>
      h.p(`Mostly through lawyers' fees and court costs. In the ${h.ext(WINROSE, "Winrose case")}, the court's judgment was almost ${money(JUDG_ROUND)} on $250 of unpaid dues, about ${TIMES_ROUND} times the dues.`) +
      JUDGMENT_TABLE +
      h.p("Then the house was sold.") +
      SOLD +
      h.p(`Five years later, the South Carolina Supreme Court set the sale aside. The winning bid was about ${CENTS_ON_DOLLAR} cents for each dollar of the owners' equity in the house, and the court called the price grossly inadequate. It wrote:`) +
      h.raw(`<blockquote class="lf-quote"><p>"A foreclosure proceeding is a last resort, not a business model to be swiftly invoked for the purpose of exploiting property owners."</p><cite>South Carolina Supreme Court, Winrose Homeowners' Association v. Hale</cite></blockquote>`) +
      h.p(`The steps that stop a bill like this are in ${h.a("#behind-now", "what to do if you are behind")}.`) },

    { h2: "Does an HOA lien come before your mortgage?", toc: "Your mortgage", id: "your-mortgage", html: () =>
      h.p(`No, not before a mortgage that was recorded first. South Carolina has no law that puts an association's lien ahead of a first mortgage, the rule called a super lien.`) +
      LADDER +
      h.p(`For an HOA that is not a condo, no law ranks the HOA's lien. In a ${h.ext(BAILEY, "1994 case")}, a mortgage recorded before the dues fell due came first. That HOA's papers did not say the HOA came first.`) +
      h.p("The order works both ways:") +
      BOTH_WAYS },

    { h2: "Behind on HOA dues? What to do before the sale", toc: "Behind now", id: "behind-now", html: (bg) =>
      h.p("Start with the lawsuit papers.") +
      ACTS +
      h.cta("Selling to pay the association", "A Chapter3 agent finds out before closing what the association says is owed, so that amount is paid from the sale. We tell you what your home could sell for, and what would be left after the association and the mortgage are paid.", "Plan a sale", "/contact/", bg) },

    { h2: "Buying a condo or HOA home: will the seller's unpaid dues follow you?", toc: "Buying", id: "buying", html: (bg) =>
      h.p(`In a condo, only up to what the association puts in writing. A condo buyer is liable with the seller for unpaid dues, but only up to the amount in the statement the association must issue on request. The unpaid dues are paid from the sale price at closing, after taxes and recorded mortgages. That limit does not cover a buyer at a foreclosure sale.`) +
      h.p(`When a sale leaves no profit to pay them, the association could go after the new buyer for the fees, or waive them. Our agents check for unpaid fees before closing. A title search shows a lien the association has recorded and any notice of a lawsuit. Dues owed but not recorded show only in the association's statement, also called an ${h.a("/hoa/estoppel-and-transfer-fees/", "estoppel letter")}.`) +
      h.h3("Owners behind on dues can affect your loan") +
      LOAN_CARDS +
      h.p(`A building's savings matter for the same reason. Our guide to ${h.a("/hoa/reserves/", "condo reserves")} shows how we read them.`) +
      h.cta("What we check before you close", "Unpaid dues on the unit, so you know what the seller owes the association and what you could be asked to pay.", "Have us check a unit", "/contact/", bg) },

    { h2: "Is South Carolina changing its HOA foreclosure law?", toc: "New bills", id: "new-bills", html: () =>
      h.p("Not yet. Three bills before the legislature would limit HOA foreclosure. None has become law.") +
      BILLS },
  ],
  pageImages: () => ph.pageImages(),
  afterSources: () => AFTER(),
  faqTitle: "HOA liens and foreclosure FAQ",
  faq: FAQ,
  sources: [
    { name: "SC Code 27-31", href: T27_31 },
    { name: "SC Code 27-30", href: T27_30 },
    { name: "SC Code 15-39", href: T15_39 },
    { name: "SC Code 15-11", href: T15_11 },
    { name: "SCRCP Rule 12", href: RULE12 },
    { name: "SCRCP Rule 71", href: RULE71 },
    { name: "SC Code 22-3", href: T22_3 },
    { name: "Winrose v. Hale (2019)", href: WINROSE },
    { name: "Wachesaw v. Alexander (2015)", href: WACHESAW },
    { name: "Bailey (1994)", href: BAILEY },
    { name: "Horry County Master in Equity", href: MIE },
    { name: "SCDCA 2026 HOA report", href: SCDCA },
    { name: "Fannie Mae B4-2.2-02", href: FNMA },
    { name: "11 U.S.C. 523", href: USC523 },
    { name: "SC Bar referral", href: SCBAR },
  ],
  sourcesNote: "Our count: the county's sale list for one month, with the county's values.",
  bottomCta: { h2: "Behind on dues, or buying into an HOA?", p: "If you are behind, an agent can tell you what your home could sell for and plan the sale. If you are buying, we check the unit for unpaid dues before you close.", label: "Talk to an agent", href: "/contact/" },
  keywords: "can an HOA foreclose in South Carolina, HOA lien South Carolina, HOA foreclosure South Carolina, what happens if you don't pay HOA fees, unpaid HOA dues, condo association lien, HOA lien priority, HOA super lien, Master in Equity HOA foreclosure, HOA fines lien, HOA dues bankruptcy",
  about: "Homeowners association and condo association liens and foreclosure for unpaid dues in South Carolina and Horry County",
});
