/* /buyers/property-records/tax-bill/ - Horry County tax payments: where to find a tax bill and pay it
 * online (no sign-in; e-check free, card 2.35%), what each way of paying costs, the January 15 due date
 * and the penalties, installments, how to search tax records by name, PIN or notice number (no address
 * search), what each line on a bill means, who the Assessor, Auditor and Treasurer are and where their
 * offices are, how to appeal a value, what happens when a bill goes unpaid (our count of the tax sale
 * list), vehicle tax, and Georgetown County for Pawleys Island and Litchfield.
 *
 * Batch 2026-11-d, Lane N. A new page, version 1, 2026-11-13. Plan: Blog-Brain
 * batches/2026-11-d/property-records-tax-bill/PLAN.md. Demand: must-answer.md. Facts: facts.md,
 * VERIFIED rows, and CORRECTED rows at the verifier's wording only (VERIFY.md; struck wording in
 * batches/2026-11-d/facts/buyers-property-records-tax-bill-struck.json). Row numbers are given as F<n>;
 * "gis F<n>" is the gis-map sibling's ledger.
 * Not used: the $3.95 in-office debit fee (F8), "11 members" (F32), "only lawyers and CPAs" (F34), any
 * reading of the bill's Residential Exemption line as the 4% rate (F37), "the 21st Avenue office closed"
 * (F30), the no-notice January 15 waiver (F31), a pay-by-phone number (F50), a Georgetown card fee (F42),
 * any owner, address, PIN or bill from the tax sale lists or the portal.
 * Data: data/2026-11-d/property-records-tax-bill/ (delinquent-summary.json, the chart CSV, the fee,
 * installment and timeline tables). Every count, share and date below is read from those files and
 * checked against its ledger row.
 * Pictures: one chart, drawings in cards (the bill's lines, the three offices), and one licensed photo of
 * the county building in Conway, where the Treasurer's main office and the tax sale are.
 * Homes: the site's edge places this page's feed under the opening. No second strip: the reader came
 * to pay a bill (PLAN, "Homes strips").
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const IC = require(path.join(BB, "tools", "icons.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/property-records/tax-bill/";
const SLUG = "property-records-tax-bill";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
/* A CSV with quoted cells, read plainly. */
const csv = (f) => fs.readFileSync(path.join(DATA, f), "utf8").trim().split(/\r?\n/).slice(1)
  .map((l) => [...l.matchAll(/("([^"]*)"|[^,]*)(,|$)/g)].filter((m, i, a) => i < a.length - 1 || m[0] !== "").map((m) => (m[2] !== undefined ? m[2] : m[1])));

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const SUM = read("delinquent-summary.json");
const RE = SUM.real_estate, MH = SUM.mobile_home;
must(RE.rows === 1772 && RE.unique_pins === 1771, "F24: 1,772 properties, 1,771 PINs");
must(RE.bid_median === 2709, "F24: median opening bid $2,709");
must(MH.rows === 459 && MH.bid_median === 586, "F24: 459 mobile homes, median $586");
const asOf = (t) => { const m = /AS OF (\d{1,2})\/(\d{1,2})\/\d{4}/.exec(t); must(m, `no list date in "${t}"`); return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][+m[1] - 1]} ${+m[2]}`; };
const LIST_DAY = asOf(RE.title);
must(asOf(MH.title) === LIST_DAY, "both tax sale lists carry the same day");
const MEDIAN = Math.round(RE.bid_median / 100) * 100; /* $2,709, said as about $2,700 */
must(MEDIAN === 2700, "F24: about $2,700");
/* F25 (VERIFY 25): both counts are PINs. 302,630 parcels on the county map (gis F17). */
const PARCELS = 302630;
const ONE_IN = Math.round(PARCELS / RE.unique_pins / 10) * 10;
must(ONE_IN === 170, "F25: about 1 parcel in 170");

/* V8: the chart rows, from the CSV (F24). */
const BIDS = csv("chart-tax-sale-opening-bids.csv").map(([range, re]) => ({ range, n: +re }));
must(BIDS.length === 7 && BIDS.reduce((s, b) => s + b.n, 0) === RE.rows, "F24: seven ranges that add to the list");
BIDS.forEach((b, i) => must(b.n === RE.buckets[i].count && b.range === RE.buckets[i].label, `F24: chart row ${b.range}`));

/* V1: the fee table (F8 at the verifier's wording, F11). */
const FEES = csv("table-payment-fees.csv");
must(FEES.length === 4 && FEES[0][1] === "E-check: free" && FEES[0][2] === "2.35%", "F8: online e-check free, card 2.35%");
must(!FEES.some((r) => r.join(" ").includes("3.95")), "F8: the $3.95 debit figure is cut (VERIFY 8)");
const FEE_NAME = ["Online", "By phone", "In person", "By mail or drop box"];

/* V3: the installment schedule (F18). */
const INST = csv("table-installments.csv");
must(INST.length === 6 && INST.slice(0, 5).every((r) => r[2] === "16.67%"), "F18: five payments of 16.67%");
must(INST.slice(0, 5).map((r) => r[1]).join() === "February 15,April 15,June 15,August 15,October 15", "F18: the five dates");

/* V2: the timeline (F12, F13, F22, F23). The dates come from the CSV; the words are the page's own. */
const TL = csv("timeline-unpaid-tax.csv").map((r) => r[0]);
must(TL.length === 11 && TL[1] === "January 15" && TL[2] === "January 16" && TL[3] === "February 2" && TL[4] === "March 17", "F13: the penalty dates");
/* The penalty steps (F13), checked against the CSV's words. */
const TLW = csv("timeline-unpaid-tax.csv").map((r) => r[1]);
must(/^3% penalty$/.test(TLW[2]) && /\(10% in all\)/.test(TLW[3]) && /\(15% in all\)/.test(TLW[4]), "F13: 3%, 10% in all, 15% in all");
const PEN = [{ day: TL[1], v: 0, t: "None" }, { day: TL[2], v: 3, t: "3%" }, { day: TL[3], v: 10, t: "10%" }, { day: TL[4], v: 15, t: "15%" }];
const LATE_WORDS = [
  "The county mails a delinquent notice.",
  "A certified notice follows.",
  "A notice is posted on the property: seized, to be sold for the tax.",
  "The property is advertised in the newspaper.",
  "The tax sale, at the county building in Conway.",
  "The last day the owner can pay the tax and costs and get the property back.",
];
const LATE_DAY = ["April 1 or soon after", "30 days later", "May to October", "Three Thursdays before the sale", "Early December", "12 months after the sale"];
must(TL.slice(5).join("|") === LATE_DAY.join("|"), "F22, F23: the delinquent steps");

/* ---------------------------------------------------------------------------- */
/* Links.                                                                         */

const PAY = "https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx";
const TPS = "https://www.horrycountysc.gov/tax-payer-services/";
const RPT = "https://www.horrycountysc.gov/tax-payer-services/real-property-tax/";
const INSTALL = "https://www.horrycountysc.gov/tax-payer-services/installment-payments/";
const TREAS = "https://www.horrycountysc.gov/departments/treasurer/";
const DELQ = "https://www.horrycountysc.gov/departments/treasurer/delinquent-tax/";
const VALUES = "https://www.horrycountysc.gov/tax-payer-services/questioning-values/";
const GUIDE = "https://www.horrycountysc.gov/departments/assessor/guide-to-assessment/";
const VEHICLE = "https://www.horrycountysc.gov/tax-payer-services/vehicle-tax/";
const CCC = "https://www.horrycountysc.gov/news/articles/horry-county-marks-opening-of-central-coast-complex-with-ribbon-cutting/";
const SC45 = "https://www.scstatehouse.gov/code/t12c045.php";
const SC51 = "https://www.scstatehouse.gov/code/t12c051.php";
const SC60 = "https://www.scstatehouse.gov/code/t12c060.php";
const GT_PAY = "https://georgetowncountysctax.com/";
const GT_TREAS = "https://gtcountysc.gov/288/Treasurer";
const GT_REASSESS = "https://gtcountysc.gov/268/Reassessment";
const GT_QPUB = "https://www.qpublic.net/sc/georgetown/";
const GT_INSTALL = "https://gtcountysc.gov/DocumentCenter/View/456/Application-for-Advance-Installment-Payments-PDF";
const ASSESSOR = "https://www.horrycountysc.gov/departments/assessor/";
const LEAD = "/contact/";
/* The hub (/buyers/property-records/) is built in another workflow. A link to a sibling is written only
   when its page exists in this working copy, else its words stay plain; rebuild once it is built (BUILD.md). */
const SITE_ROOT = path.join(__dirname, "..", "chapter3realty");
const live = (u) => fs.existsSync(path.join(SITE_ROOT, ...u.split("/").filter(Boolean), "index.html"));
const sib = (u, text) => (live(u) ? h.a(u, text) : text);
const extNew = (u, t) => `<a href="${u}" style="color:var(--navy);text-decoration:underline" target="_blank" rel="noopener noreferrer">${t}</a>`;
const tel = (n) => `<a href="tel:+1${n.replace(/\D/g, "")}" style="color:var(--navy);text-decoration:underline;white-space:nowrap">${n}</a>`;

/* ---------------------------------------------------------------------------- */
/* The one photo: the county building at 1301 Second Avenue in Conway (CC BY-SA 3.0, already licensed and   */
/* on the site for /hoa/liens-and-foreclosure/; its record is reused unchanged). It holds the Treasurer's   */
/* main office (F29) and the tax sale (F23), and sits beside the offices table.                           */

const JC_PHOTOS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-a", "hoa-liens-and-foreclosure", "photos.json"), "utf8")).photos;
const JC_REC = JC_PHOTOS.find((r) => /horry-government-justice-center\.webp$/.test(r.file));
must(JC_REC && JC_REC.license === "CC BY-SA 3.0" && /1301 Second Avenue/.test(JC_REC.place.sublocation), "the county building's photo record (HOA liens photos.json)");
const JC_CAP = "The Horry County Government and Justice Center at 1301 Second Avenue in Conway. The Treasurer's main office is here, and so is the tax sale each December";
const JC = PH.heroPhoto(JC_REC, { alt: JC_REC.alt, caption: JC_CAP + ".", maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
const CREDITS_NOTE = '<div role="listitem">Chapter3 Realty resized these photos and cropped some of them. Each photo keeps the license listed with it.</div>';
const CREDITS_RAW = PH.creditsList([{ photo: JC_REC, caption: JC_CAP }]);
must(CREDITS_RAW.includes(CREDITS_NOTE), "photos.js credit note changed");
/* One photo: its own line already says it was cropped and resized. The share-alike note stays, in the singular. */
const CREDITS = CREDITS_RAW.replace(CREDITS_NOTE, '<div role="listitem">The cropped photo keeps the same license.</div>');

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main. One card style for the drawings, the chart and the offers; lists  */
/* and tables plain under thin rules; one block width of 720 px.                                       */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const CARD = "border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 14px 34px -24px rgba(28,32,40,.45)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CSS = "<style>"
  /* The headline: the italic line at about half the H1's size. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.25rem,2.4vw,2.1rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} h2{text-wrap:balance}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The county button: navy, so it does not look like our request buttons. */
  + `${S} .tb-go{display:inline-flex;align-items:center;gap:.55rem;min-height:52px;padding:.8rem 1.4rem;border-radius:999px;background:var(--navy);color:#fff!important;font-family:var(--sans);font-weight:600;font-size:1.05rem;line-height:1.3;text-decoration:none!important;box-shadow:0 10px 24px -14px rgba(28,32,40,.7)}`
  + `${S} .tb-go:hover{background:#2a3040}${S} .tb-go svg{flex:none}`
  + `${S} .tb-go-note{font-size:.95rem;color:var(--muted);margin:.55rem 0 1.2rem;line-height:1.5;max-width:720px}`
  /* Numbered steps: plain rows under thin rules, an icon chip or a number each. */
  + `${S} ol.tb-steps{list-style:none;margin:.4rem 0 1.2rem;padding:0;max-width:720px;counter-reset:tb}`
  + `${S} ol.tb-steps>li{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:.9rem;align-items:start;padding:.95rem 0;border-top:${RULE};margin:0;counter-increment:tb}`
  + `${S} ol.tb-steps>li:last-child{border-bottom:${RULE}}`
  + `${S} ol.tb-steps .ic{display:inline-flex;color:var(--brass);margin-top:.1rem}`
  + `${S} ol.tb-steps .no{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:999px;background:rgba(196,120,58,.16);color:var(--navy);font-family:var(--sans);font-weight:700;font-size:1rem}`
  + `${S} ol.tb-steps h3{margin:0 0 .25rem!important;font-family:var(--sans);font-size:1.1rem!important;font-weight:650;color:var(--navy);line-height:1.35}`
  + `${S} ol.tb-steps.counted h3::before{content:counter(tb) ". "}`
  + `${S} ol.tb-steps p{margin:0!important;color:var(--muted);line-height:1.65;font-size:var(--read,1.0625rem)}`
  /* Cards: the bill drawing, the timeline, the three offices. */
  + `${S} .tb-fig{margin:1.4rem 0 1.6rem;max-width:720px}`
  + `${S} .tb-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}`
  + `${S} .tb-card{${CARD};padding:1rem 1.15rem 1.05rem;box-sizing:border-box}`
  + `${S} .tb-card .hd{display:flex;align-items:center;gap:.5rem;font-family:var(--sans);font-weight:700;font-size:1rem;color:var(--navy);padding-bottom:.6rem;border-bottom:2px solid var(--navy);margin-bottom:.15rem}`
  + `${S} .tb-card dl{margin:0;display:grid;grid-template-columns:1fr}`
  + `${S} .tb-card .r{display:grid;grid-template-columns:minmax(0,11.5rem) minmax(0,1fr);column-gap:1rem;padding:.55rem 0;border-bottom:1px solid rgba(28,32,40,.1)}`
  + `${S} .tb-card .r:last-child{border-bottom:0}`
  + `${S} .tb-card dt{font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1rem;line-height:1.4}`
  + `${S} .tb-card dd{margin:0;color:var(--muted);font-size:1rem;line-height:1.45}`
  + `${S} .tb-card .r.k dt{color:var(--g-ink,#8a5226)}`
  + `@media (max-width:520px){${S} .tb-card .r{grid-template-columns:1fr;row-gap:.1rem}}`
  /* The timeline: a date chip and a plain line per step. */
  + `${S} .tb-tl .hd{margin-bottom:.3rem}`
  + `${S} .tb-tl ol{list-style:none;margin:0;padding:0}`
  + `${S} .tb-tl li{display:grid;grid-template-columns:minmax(0,13.5rem) minmax(0,1fr);column-gap:1rem;align-items:baseline;padding:.6rem 0;border-bottom:1px solid rgba(28,32,40,.1);margin:0}`
  + `${S} .tb-tl li:last-child{border-bottom:0}`
  + `${S} .tb-tl .d{justify-self:start;font-family:var(--sans);font-weight:650;font-size:.95rem;color:var(--navy);background:rgba(196,120,58,.16);border-radius:999px;padding:.2rem .7rem;line-height:1.35}`
  + `${S} .tb-tl li.ok .d{background:rgba(47,111,143,.14)}${S} .tb-tl li.end .d{background:rgba(28,32,40,.14)}`
  + `${S} .tb-tl .w{color:var(--muted);line-height:1.5;font-size:1rem}`
  + `@media (max-width:520px){${S} .tb-tl li{grid-template-columns:1fr;row-gap:.3rem}}`
  /* The penalty steps. */
  + `${S} .tb-pen>svg{display:block;width:100%;height:auto;margin-top:.8rem}`
  + `${S} .tb-pen text{font-family:var(--sans),system-ui,sans-serif}${S} .tb-pen text.v{font-size:40px;font-weight:700;fill:#1c2028}${S} .tb-pen text.d{font-size:33px;font-weight:600;fill:#4a4f5c}`
  + `@media (min-width:600px){${S} .tb-pen text.v{font-size:34px}${S} .tb-pen text.d{font-size:27px}${S} figure.tb-fig.tb-small{max-width:540px}}`
  /* The plain tables. */
  + `${S} .tb-t table{font-size:1rem!important}${S} .tb-t th{border-bottom:1px solid rgba(28,32,40,.3)!important;padding:.5rem .8rem .5rem 0!important;font-size:.78rem!important}`
  + `${S} .tb-t td{border-bottom:${RULE}!important;padding:.7rem .8rem .7rem 0!important;vertical-align:top;line-height:1.45}`
  + `${S} .tb-t td:first-child{color:var(--navy);font-weight:600}${S} .tb-t th:last-child,${S} .tb-t td:last-child{padding-right:0!important}`
  + `${S} ol.tb-steps+ul.tb-list>li:first-child,${S} .tb-t+ul.tb-list>li:first-child{border-top:0}`
  /* The three offices. */
  + `${S} .tb-offices{display:grid;grid-template-columns:1fr;gap:.8rem;margin:1.2rem 0 1.4rem;max-width:720px}`
  + `@media (min-width:760px){${S} .tb-offices{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .tb-offices .tb-card{padding:.95rem 1rem 1rem;display:flex;flex-direction:column}${S} .tb-offices .ph{margin-top:auto!important}`
  + `${S} .tb-offices .hd{font-size:1.05rem}${S} .tb-offices .hd .ic{display:inline-flex;color:var(--brass)}`
  + `${S} .tb-offices ul{list-style:none;margin:.5rem 0 .6rem;padding:0}`
  + `${S} .tb-offices li{margin:0;padding:.22rem 0;color:var(--muted);line-height:1.45;font-size:1rem}`
  + `${S} .tb-offices .ph{margin:0;font-family:var(--sans);font-weight:600;font-size:1rem}`
  /* Figures sit on the page without a second frame: the card inside is the one frame. */
  + `${S} figure.tb-fig,${S} figure.c3ph-hero{${FLAT};padding:0!important}${S} figure.tb-fig>figcaption,${S} figure.c3ph-hero>figcaption{padding:0!important}${S} figure.c3ph-hero{max-width:720px!important}`
  + `${S} .tb-nw{white-space:nowrap}`
  /* 320 px: a little less side padding, so no single word sits alone on a button's second line. */
  + `@media (max-width:359px){.btn{padding-left:.85rem!important;padding-right:.85rem!important}${S} .tb-go{padding-left:.8rem;padding-right:.8rem;gap:.4rem;font-size:1rem}}`
  /* Lists and tables plain, under thin rules. */
  + `${S} ul.tb-list{list-style:none;margin:.6rem 0 1.3rem;padding:0;max-width:720px}`
  + `${S} ul.tb-list>li{margin:0;padding:.75rem 0;border-top:${RULE};color:var(--muted);line-height:1.6}`
  + `${S} ul.tb-list>li:last-child{border-bottom:${RULE}}${S} ul.tb-list strong{color:var(--navy)}`
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}${TBL} td:first-child{color:var(--navy);font-weight:600}`
  + `@media (max-width:599px){${TBL} table,${TBL} tbody,${TBL} tr,${TBL} td{display:block;width:100%}${TBL} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TBL} tr{padding:.65rem 0;border-bottom:${RULE}}${TBL} td{border:0!important;padding:.1rem 0!important}${TBL} td:first-child{font-weight:650;color:var(--navy)}`
  + `${TBL} td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-weight:500}}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* A plain table that stays a table on a phone (two or three short columns), under thin rules. */
const ptable = (head, rows) => {
  const t = h.table(head, rows), from = 'style="overflow-x:auto;margin:1.2rem 0;max-width:760px"';
  must(t.includes(from), "h.table's wrapper changed");
  return t.replace(from, 'class="tb-t" style="margin:1.1rem 0 1.3rem;max-width:720px;overflow-x:auto"');
};
const ic = (name, size = 30) => `<span class="ic">${IC.icon(name, { size })}</span>`;
const step = (icon, title, text) => `<li>${ic(icon)}<div><h3>${title}</h3><p>${text}</p></div></li>`;
const nstep = (n, title, text) => `<li><span class="no" aria-hidden="true">${n}</span><div><h3>${title}</h3><p>${text}</p></div></li>`;
const arrowOut = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

/* ---------------------------------------------------------------------------- */
/* V2: the timeline, in two parts.                                                */

const timeline = (title, days, words, cls, label) => `<figure class="tb-fig"><div class="tb-card tb-tl" role="img" aria-label="${label}">`
  + `<div class="hd">${IC.icon("calendar", { size: 22 })}<span>${title}</span></div><ol>`
  + days.map((d, i) => `<li class="${cls[i] || ""}"><span class="d">${d}</span><span class="w">${words[i]}</span></li>`).join("")
  + `</ol></div></figure>`;
/* V2a: the penalty, drawn as four steps (F13). One message: pay by January 15 and there is none. */
const PAY_TL = (() => {
  const W = 640, base = 236, top = 76, col = W / 4;
  const bars = PEN.map((p, i) => {
    const x = col * i + col / 2, hgt = Math.round((base - top) * p.v / 15), y = base - hgt;
    const fill = i === 0 ? "#2f6f8f" : i === 3 ? "#91592b" : "#c4783a";
    return (p.v ? `<rect x="${x - 48}" y="${y}" width="96" height="${hgt}" rx="10" fill="${fill}"/>` : `<rect x="${x - 48}" y="${base - 5}" width="96" height="5" rx="2.5" fill="${fill}"/>`)
      + `<text class="v" x="${x}" y="${(p.v ? y : base - 5) - 16}" text-anchor="middle">${p.t}</text>`
      + `<text class="d" x="${x}" y="${base + 42}" text-anchor="middle">${p.day.split(" ")[0]}</text><text class="d" x="${x}" y="${base + 80}" text-anchor="middle">${p.day.split(" ")[1]}</text>`;
  }).join("");
  return `<figure class="tb-fig tb-small"><div class="tb-card tb-pen"><div class="hd">${IC.icon("calendar", { size: 22 })}<span>Pay by January 15 and there is no penalty</span></div>`
    + `<svg viewBox="0 0 ${W} 330" role="img" aria-label="The penalty on an unpaid Horry County property tax bill: none through ${PEN[0].day}, 3% from ${PEN[1].day}, 10% in all from ${PEN[2].day}, and 15% in all from ${PEN[3].day}, when the tax is delinquent.">`
    + `<line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="rgba(28,32,40,.25)" stroke-width="2"/>` + bars + `</svg></div>`
    + `<figcaption>Each penalty is added to the unpaid tax on the date shown. On ${PEN[3].day} the tax is delinquent.</figcaption></figure>`;
})();
const LATE_TL = timeline("From a missed bill to the tax sale", LATE_DAY, LATE_WORDS, ["", "", "", "", "end", ""],
  "After March 17: a delinquent notice about April 1, a certified notice 30 days later, a notice posted on the property between May and October that it is seized for sale, three weeks of newspaper ads, the tax sale in early December, and 12 months for the owner to pay and get it back.");

/* ---------------------------------------------------------------------------- */
/* V4: what each line on the bill means (F7, F27, F28). Labels as the county's bill shows them. */

const BILL_ROWS = [
  ["Total Appraisal", "The Assessor's value of the land and buildings."],
  ["Total Assessed", "The taxable value: 4% of the appraisal on a home you live in, 6% on most other property."],
  ["District/Levy, City/Levy", "The tax district, and the town if the property is inside one."],
  ["Map Number, PIN", "The two numbers to search the bill again next year."],
  ["County Tax, City Tax, Fees", "Each tax and fee on the property."],
  ["Exemptions, Local Option Credit", "The credits that lower the bill."],
  ["Total Taxes", "What is owed for the year."],
];
const BILL = `<figure class="tb-fig"><div class="tb-card" role="img" aria-label="A drawing of the lines on a Horry County real estate tax bill, with a plain meaning beside each: total appraisal, total assessed, the district and city levy, map number and PIN, county tax, city tax and fees, the exemptions and credits, and total taxes.">`
  + `<div class="hd">${IC.icon("tax", { size: 22 })}<span>Real estate tax bill</span></div><dl>`
  + BILL_ROWS.map(([k, v], i) => `<div class="r${i === BILL_ROWS.length - 1 ? " k" : ""}"><dt>${k}</dt><dd>${v}</dd></div>`).join("")
  + `</dl></div><figcaption>A drawing of the lines on the county's bill page, with what each one means. No real bill is shown.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* V5: the three offices (F28, F29).                                              */

const office = (icon, name, jobs, phone) => `<div class="tb-card"><div class="hd">${ic(icon, 22)}<span>${name}</span></div><ul>${jobs.map((j) => `<li>${j}</li>`).join("")}</ul><p class="ph">${tel(phone)}</p></div>`;
const OFFICES = `<div class="tb-offices" role="list" aria-label="Three county offices, three jobs">`
  + office("home", "Assessor", ["Values the land and buildings", "Keeps who owns what", "Reviews applications for the 4% rate", "Takes address changes", "In Conway and at the Central Coast Complex", extNew(ASSESSOR, "The Assessor's page")], "(843) 915-5040").replace('<div class="tb-card">', '<div class="tb-card" role="listitem">')
  + office("tax", "Auditor", ["Figures each bill", "Writes the vehicle tax bills"], "(843) 915-5050").replace('<div class="tb-card">', '<div class="tb-card" role="listitem">')
  + office("dollar", "Treasurer", ["Collects every tax payment", "Keeps the receipts", "Runs the installment plan and the tax sale"], "(843) 915-5470").replace('<div class="tb-card">', '<div class="tb-card" role="listitem">')
  + `</div>`;

/* ---------------------------------------------------------------------------- */
/* V8: the chart, from the CSV (F24).                                             */

/* One point: the three ranges under $2,500 hold nearly half the list (F24: 843 of 1,772, 48%). They keep the
   brass bars; the other ranges are drawn as reference bars. */
const UNDER = 3, UNDER_N = BIDS.slice(0, UNDER).reduce((s, b) => s + b.n, 0);
must(/2,499$/.test(BIDS[UNDER - 1].range) && UNDER_N === 843 && UNDER_N / RE.rows > 0.45 && UNDER_N / RE.rows < 0.5, "F24: 843 of 1,772 under $2,500, nearly half");
const CHART = G.bars(BIDS.map((b, i) => ({ name: b.range.replace(/^u/, "U"), value: b.n, valueText: n0(b.n), reference: i >= UNDER })), {
  caption: `Nearly half the properties on the tax sale list have an opening bid under $2,500`,
  note: `Our count of the opening bids on the county's list, by range. The three shaded ranges, under $2,500, hold ${n0(UNDER_N)} properties.`,
  nameLabel: "Opening bid", valueLabel: "Properties", compact: true,
});

/* ---------------------------------------------------------------------------- */
/* Offers. Every request button goes to /contact/; the site opens the short pop-up. Each has its own words. */

const END = {
  h2: "Buying a house in Horry County? We read its tax bill with you.",
  p: "Give us the address. We read the bill, see whether the 4% rate is on it, and tell you what the tax will be after you buy.",
  label: "Have us read the tax bill", href: LEAD,
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: live("/buyers/property-records/") ? { name: "Property records", url: "/buyers/property-records/" } : { name: "Buyers", url: "/buyers/" },
  title: "Horry County Tax Payments & Records: Pay Online, E-Check Free",
  description: "Pay Horry County taxes online: search tax records by name, PIN or notice number, the card fee, the January 15 due date, installments and Tax Assessor appeals.",
  ogTitle: "Horry County tax payments: find a tax bill by name or PIN, pay it online, and know the due dates",
  crumb: "Tax Bill",
  eyebrow: "Horry County property records",
  h1: "Horry County tax payments: find your bill and pay it online",
  h1em: "Search by owner name or PIN, pay by e-check for free, and do it by January 15 to avoid a penalty.",
  sub: "The county's tax search needs no account. Three steps take you from an owner's name or a PIN to a paid bill.",
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Pay Horry County taxes online on the Treasurer's ${extNew(PAY, "Tax Payments and Receipts site")}, and find a bill by owner name, PIN, map number or notice number.`,
    `Paying by e-check is free, and a card costs 2.35%. The bill is due January 15; a 3% penalty starts the next day and reaches 15% on March 17.`,
  ],
  sections: [
    { h2: "How do I pay Horry County taxes online?", toc: "Pay online", id: "pay-online", html: (bg) =>
      CSS
      + `<p><a class="tb-go" href="${PAY}" target="_blank" rel="noopener">Pay on the county's tax site${arrowOut}</a></p>`
      + `<p class="tb-go-note">The site belongs to the Horry County Treasurer. Chapter3 is a real estate brokerage, not the county. Use Chrome or Edge: payments do not go through in Safari.</p>`
      + `<ol class="tb-steps">`
      + step("calendar", "Pick the bill type and the year.", `Choose Real Estate for a house, condo or lot, or Vehicle for a car or truck. The search holds about ten years of bills, paid and unpaid.`)
      + step("tax", "Search by owner name, PIN, map number or notice number.", `Type the owner's last name first. There is no address search. The PIN is on the parcel card of the ${h.a("/buyers/property-records/gis-map/", "county GIS map")}.`)
      + step("dollar", "Open the bill and pay it.", `Pay by e-check or card. The county mails a receipt, and you can print a copy from the same site.`)
      + `</ol>`
      + h.cta("Have only an address? We find the bill.", "Give us the address. We find the PIN and last year's bill, and send you both.", "Have us find the bill", LEAD, bg)
      + h.p(`Deeds, the parcel map and the county's other records are in our ${sib("/buyers/property-records/", "Horry County property records guide")}. To find a deed, see our ${h.a("/buyers/property-records/deeds/", "deed search guide")}.`) },

    { h2: "How much does it cost to pay Horry County taxes online?", toc: "Fees", id: "fees", html: () =>
      h.p(`Paying online by e-check costs nothing; a credit or debit card costs 2.35%.`)
      + ptable(["How you pay", "No card", "Card"], FEES.map((r, i) => [FEE_NAME[i], r[1], r[2]]))
      + `<ul class="tb-list">`
      + `<li><strong>The oldest year comes first.</strong> While any older tax is unpaid, the county will not take this year's bill online or by phone. The oldest year must be paid first.</li>`
      + `<li><strong>The county keeps none of the fee.</strong> The card fee goes to the payment company. Visa, Mastercard and Discover are taken.</li>`
      + `<li><strong>By mail,</strong> send a check or money order to the Horry County Treasurer, with the notice number written on the check.</li>`
      + `</ul>` },

    { h2: "When are Horry County property taxes due?", toc: "Due dates", id: "due", html: (bg) =>
      h.p(`Horry County property taxes are due January 15, for the bill mailed in October. A mailed payment counts by its postmark.`)
      + PAY_TL
      + h.p(`Not getting the bill does not stop the penalty.`)
      + h.h3("Did my lender already pay it?")
      + h.p(`If your monthly mortgage payment includes the tax, held in an escrow account, the mortgage company may pay the county before January 15. The tax search shows each bill as paid or unpaid, with the date it was paid.`)
      + h.h3("Bought this year, and the bill went to the seller?")
      + h.p(`When a home changes hands during the year, the bill can go to the prior owner. If the new owner got no notice in time, state law requires the Treasurer to waive the penalty. The tax itself is still owed. At closing, the ${h.a("/buyers/closing-costs/", "seller credits you for their share of the year")}.`) },

    { h2: "Can you pay Horry County property taxes in installments?", toc: "Installments", id: "installments", html: () =>
      h.p(`Yes. Horry County takes five payments ahead, each 16.67% of last year's tax, then mails a final bill for the rest.`)
      + ptable(["Payment", "Due"], INST.map(([n, due]) => [n === "final bill" ? "Final bill, for the rest" : `Payment ${n}`, due.replace(/^m/, "M")]))
      + `<ul class="tb-list">`
      + `<li><strong>Sign up between December 1 and January 15,</strong> with one form for each parcel. The ${h.ext(INSTALL, "county's installment page")} has the form.</li>`
      + `<li><strong>Real property only:</strong> land, buildings and mobile homes. Not vehicles, boats, or a tax a lender pays from escrow.</li>`
      + `<li><strong>Pay with the coupons</strong> in person, by mail or in a drop box. Installments cannot be paid online.</li>`
      + `<li><strong>The county holds the money until the last payment,</strong> then applies it to the bill. An owner who sells asks the Treasurer for a refund in writing, because a buyer cannot use the seller's payments.</li>`
      + `<li><strong>The packet comes again each year</strong> until you opt out in writing. An application can be turned down when older taxes are unpaid, the tax is escrowed, or the applicant is not the owner.</li>`
      + `</ul>` },

    { h2: "How do you search Horry County tax records by name, PIN or address?", toc: "Search tax records", id: "search", html: (bg) =>
      h.p(`The county's tax search finds a bill by owner name, PIN, map number, notice number or tax ID. It has no address search.`)
      + `<ul class="tb-list">`
      + `<li><strong>Owner name:</strong> last name first, then the first name.</li>`
      + `<li><strong>PIN:</strong> the 11-digit number every county office uses for a parcel. It is on the parcel card of the county map.</li>`
      + `<li><strong>Map number:</strong> the 10-digit tax map number, on the same card and on the bill.</li>`
      + `<li><strong>Notice number:</strong> printed on the bill. It finds that one bill.</li>`
      + `<li><strong>Only an address?</strong> The county sends address searches to its Land Records map, which needs a county account. Our ${h.a("/buyers/property-records/gis-map/", "GIS map guide")} shows how to get in and find the PIN.</li>`
      + `</ul>`
      + h.p(`Open a bill from the results to see its lines. The search needs no sign-in.`)
      + BILL
      + h.h3("The 4% rate on a home you live in")
      + h.p(`A home you live in, which the county calls a legal residence, is taxed on 4% of its value. It also gets a credit that removes the school operating tax. The owner applies to the Assessor. Our ${h.a("/buyers/property-taxes/", "Horry County property tax guide")} shows how to apply and what the tax on a home will be.`)
      + h.p(`Paying the 6% rate on a home you live in is the costliest ${h.a("/buyers/common-mistakes/", "common buyer mistake")} here. For the full yearly cost of a home, tax included, see ${h.a("/buyers/cost-to-own/", "what it costs to own a home here")}.`)
      + h.cta("Looking at a house? See its tax bill before you offer.", "We read last year's bill for that house and tell you what changes when you buy it.", "Have us pull the bill", LEAD, bg) },

    { h2: "What does the Horry County Tax Assessor do?", toc: "Assessor and tax offices", id: "assessor", html: () =>
      h.p(`The Horry County Assessor values the land and buildings on the bill. The Assessor also reviews the applications for the 4% rate on a home you live in. The Auditor figures the bill, and the Treasurer takes the payment.`)
      + OFFICES
      + h.p(`The Assessor does not take payments. Every payment goes to the Treasurer, online or at one of its offices.`)
      + h.h3("Where are the Horry County tax offices?")
      + ptable(["Treasurer's office", "Address"], [
        ["Conway, the main office", "1301 Second Avenue, Conway"],
        ["Myrtle Beach", "332 Hinson Drive, in the Central Coast Complex"],
        ["South Strand", "9630 Scipio Lane, Surfside"],
        ["Stephen's Crossroads", "107 Highway 57 North, Little River"],
      ])
      + JC
      + h.p(`Each office is open 8 to 5 on weekdays. The Myrtle Beach office is now in the county's new ${h.ext(CCC, "Central Coast Complex")} in ${h.a("/submarkets/carolina-forest/", "Carolina Forest")}. The Treasurer, the Auditor and the Assessor share the building. Mail goes to P.O. Box 1237, Conway, SC 29528.`) },

    { h2: "How do you appeal your Horry County property value?", toc: "Appeal a value", id: "appeal", html: (bg) =>
      h.p(`Write to the Horry County Assessor within 90 days after a value notice is mailed. The Assessor mails a notice when a value rises by $1,000 or more.`)
      + h.p(`In a year with no notice, you may appeal in writing at any time. In that year, one filed by January 15 counts for that year's bill, and a later one counts for the next year.`)
      + `<ol class="tb-steps">`
      + nstep(1, "Object in writing.", `Use the Property Appeal form on the county's ${h.ext(TPS, "Tax Payer Services page")}.`)
      + nstep(2, "Meet the Assessor.", `The Assessor schedules a meeting within <strong>30 days</strong> of your request.`)
      + nstep(3, "File a written protest.", `If the meeting does not settle it, you have <strong>30 days</strong> to protest in writing, with the facts, your reasons and the value you think is right.`)
      + nstep(4, "Go to the Board of Assessment Appeals.", `You have <strong>30 days</strong> after the Assessor's written answer.`)
      + nstep(5, "Ask for a hearing at the Administrative Law Court.", `You have <strong>30 days</strong> after the board's written decision.`)
      + `</ol>`
      + `<ul class="tb-list">`
      + `<li><strong>The bill still comes.</strong> If an appeal will not be settled by December 31, the bill is figured on 80% of the protested assessment. The difference is billed or refunded, with interest, after the decision.</li>`
      + `<li><strong>Values reset every fifth year.</strong> The last countywide reset took effect for the 2024 tax year. Between resets, reassessment alone can raise a property's taxable value by at most 15% over five years.</li>`
      + `<li><strong>The 15% cap does not cover an addition or the year after a sale.</strong> Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows what a sale means for a buyer's tax.</li>`
      + `<li><strong>Who can present it:</strong> you, a lawyer, a CPA, an enrolled agent, or a licensed or certified appraiser on a value question. An enrolled agent is a tax professional the IRS approves to represent taxpayers. A real estate agent cannot.</li>`
      + `</ul>` },

    { h2: "What happens if Horry County property tax is not paid?", toc: "Unpaid tax", id: "unpaid", html: () =>
      h.p(`Horry County property tax still unpaid on March 17 is delinquent. After a series of notices, the property goes to the county's tax sale in early December.`)
      + LATE_TL
      + h.p(`The opening bid at the sale is all the unpaid tax, penalties and costs, plus this year's tax.`)
      + CHART
      + h.p(`The county's list of ${LIST_DAY} holds ${n0(RE.rows)} properties, about 1 parcel in ${ONE_IN} in the county. A second list holds ${n0(MH.rows)} mobile homes without land. Both lists get shorter as owners pay.`)
      + h.p(`Buying at the sale has its own rules on deposits, bidding and the title. Our ${h.a("/invest/foreclosures/", "foreclosure and tax sale guide")} covers them.`) },

    { h2: "How do you pay Horry County vehicle tax?", toc: "Vehicle tax", id: "vehicle", html: () =>
      h.p(`Pay Horry County vehicle tax on the same county site. The tax is paid a year ahead, before the DMV renews or issues the registration.`)
      + `<ul class="tb-list">`
      + `<li><strong>Renewals.</strong> The bill comes about a month before the plate expires. Pay it online or by phone.</li>`
      + `<li><strong>The high mileage discount</strong> is only given in the month the tax is due.</li>`
      + `<li><strong>A first registration needs the paper receipt.</strong> The DMV does not take the receipt printed after an online payment, so get the original at a Treasurer's office.</li>`
      + `<li><strong>A car bought from a dealer</strong> gets a bill that is due when it comes. If it is still unpaid 120 days after the purchase, a final notice gives 30 more days before the driver's license and registration are suspended.</li>`
      + `<li><strong>New to the area?</strong> The order of the steps is in our ${h.a("/buyers/relocating/moving-checklist/", "moving checklist")}.</li>`
      + `</ul>`
      + h.p(`If a property was not the home you lived in on December 31, the Auditor asks for a personal property return (PT-100). Furniture in a rental is taxed on its own notice; our ${h.a("/invest/str-setup/", "rental setup guide")} covers it.`) },

    { h2: "Georgetown County tax payments for Pawleys Island and Litchfield", toc: "Georgetown County", id: "georgetown", html: () =>
      h.p(`${h.a("/submarkets/pawleys-island/", "Pawleys Island")} and Litchfield are in Georgetown County, which takes tax payments online at ${h.ext(GT_PAY, "georgetowncountysctax.com")}.`)
      + `<ul class="tb-list">`
      + `<li><strong>Card or e-check online,</strong> through a payment company that charges its own fee. The county keeps none of it.</li>`
      + `<li><strong>The ${h.ext(GT_TREAS, "Treasurer")}</strong> is at 129 Screven Street in Georgetown, ${tel("(843) 545-3101")}, open 8:30 to 5 on weekdays.</li>`
      + `<li><strong>The DMV does not take the online receipt.</strong> The county mails an official receipt within three business days.</li>`
      + `<li><strong>Installments,</strong> five payments on last year's tax, but you ${h.ext(GT_INSTALL, "apply every year")} by January 15, with last year's tax paid.</li>`
      + `<li><strong>Unpaid on March 17,</strong> the tax is delinquent, and the tax sale is in December.</li>`
      + `<li><strong>Values were reset countywide for 2025.</strong> You have 90 days from a ${h.ext(GT_REASSESS, "reassessment notice")} to appeal, free, on the form at the bottom of the notice. The Assessor is ${tel("(843) 545-3017")}.</li>`
      + `<li><strong>A rental gets two notices,</strong> one for the property and one for its furniture, fixtures and equipment.</li>`
      + `<li><strong>Property records</strong> are on the Assessor's ${h.ext(GT_QPUB, "qPublic site")}.</li>`
      + `</ul>` },
  ],
  faqTitle: "Horry County tax payment questions",
  faq: [
    { q: "Can I pay Horry County taxes by phone?", a: "Yes, for a small fee, shown in the fee table above. For a question about a bill, the Treasurer's main line is (843) 915-5470." },
    { q: "How do I get a copy of my Horry County tax receipt?", a: "Print it from the Tax Payments and Receipts site: search the bill, then open it. A printed copy will not do for a car's first registration." },
    { q: "I never got a tax bill. Am I still late?", a: "Yes. The 3% penalty starts January 16 whether or not a bill arrived. The one exception is a home bought that year whose bill went to the seller." },
    { q: "Can a Horry County tax penalty be waived?", a: "Yes, in two cases. One is a home bought this year whose bill went to the seller. The other is a written request with clear proof you mailed the payment on time; the Treasurer's answer to it is final." },
    { q: "Is there unclaimed tax money in my name?", a: "The county keeps a search of unclaimed tax refunds, by name or notice number, on its Tax Payer Services page. A claim takes 3 to 6 weeks. Refunds dated before 2022 are with the State Treasurer." },
    { q: "Where is the Horry County tax office in Myrtle Beach?", a: "At 332 Hinson Drive in Carolina Forest, inside the county's Central Coast Complex." },
    { q: "Is Chapter3 part of Horry County?", a: "No. Chapter3 is a real estate brokerage. The tax site, the bill and the payment belong to the Horry County Treasurer. We find a bill or pull it for buyers and owners, free." },
  ],
  sources: [
    { name: "Tax Payments and Receipts", href: PAY },
    { name: "Tax Payer Services", href: TPS },
    { name: "Real Property Tax", href: RPT },
    { name: "Installment Payments", href: INSTALL },
    { name: "Treasurer", href: TREAS },
    { name: "Delinquent Tax", href: DELQ },
    { name: "Questioning Values", href: VALUES },
    { name: "Guide to Assessment", href: GUIDE },
    { name: "Vehicle Tax", href: VEHICLE },
    { name: "SC Code 12-45", href: SC45 },
    { name: "12-51", href: SC51 },
    { name: "12-60", href: SC60 },
    { name: "Georgetown Treasurer", href: GT_TREAS },
  ],
  sourcesNote: `Our count: the Treasurer's tax sale lists as of ${LIST_DAY}, opening bids only, no owner or address. Not legal or tax advice.`,
  afterSources: () => CREDITS + PH.imageSchema([JC_REC]),
  bottomCta: END,
  keywords: "Horry County tax payments, Horry County taxes, pay Horry County taxes online, Horry County tax records, Horry County tax records by name, Horry County tax bill search, Horry County property tax search, Horry County tax assessor, Horry County tax office, Horry County property tax due date, Horry County installment payments, Horry County tax appeal, Horry County vehicle tax, Georgetown County tax payments",
  about: "Horry County property tax bills and payments, Horry County, South Carolina",
});
