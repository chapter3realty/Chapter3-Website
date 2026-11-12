/* /buyers/act-388-changes/ - will the next governor cut the tax on a Myrtle Beach rental? What Act 388 did
 * in 2006 (the school operating tax swap, the extra 1% sales tax, the 15% reassessment limit), the 2011 25%
 * exemption at a sale, the 2026 Act 140 change after an owner's death, S. 815 and the other 2025-2026 bills,
 * Horry County's expected next reassessment (our inference), who would pay more or less under each change,
 * the evidence on both sides, and the short- and long-run range for each kind of owner from past examples.
 *
 * Batch 2026-11-e, page 5, Lane N. Version 1, 2026-11-04. Owner's brief: Blog-Brain batches/2026-11-e/BRIEF.md.
 * Reader: a homeowner or second-home owner. Page 4 (/invest/rental-property-tax-cut/) is the investor's money
 * page; its levy table, its bill at 6% and 4%, and its vote table are not repeated here, only linked.
 * Facts: Blog-Brain batches/2026-11-e/facts.md, VERIFIED and CORRECTED rows only, at their corrected values
 * (VERIFY.md). Rows used: F006, F007, F011, F012, F014, F015, F060, F061, F062, F065, F070, F080 to F086,
 * F140 to F143, F144, F145, F147, F149 to F158, F198. Predictions: predictions.md section 5, with VERIFY.md's
 * notes 4 and 5 (F149's definition; the Chamber Foundation and SC Realtors only picked the counties).
 * Struck wording: facts/election-2026-struck.json.
 * Data: data/2026-11-e/act-388-changes/act388.json. Every bill, share and difference on the page is computed
 * here from it and checked against its ledger row (must()), never typed.
 * Our own findings (arithmetic on verified rows): one house, four owners (the 15% limit, the reset at a sale
 * and the 2011 exemption on one $350,000 Myrtle Beach house); the FHFA metro index between the last two
 * scheduled reassessments (+69%) against the 15% limit; each class's share of a levy every class pays if
 * rentals moved to 4% (Lincoln Table 2.3, 2018); the Horry House delegation by party.
 * Never on the page: a single-number forecast; "AP called" for the governor; nohometax.org's arguments (not
 * opened); a funder for the Lincoln study (no row says who paid); the 8.1-mill waste levy.
 * No photo: the State House grounds file in photos.md shows an office tower, not the State House, and the
 * 1950 postcard could not be downloaded (Commons 429). The share image is the text card.
 * Design pass, 2026-11-08 (Blog-Brain redo3/buyers-act-388-changes/DESIGN.md), with the overlap fix from
 * reports/cannibalization-2026-11-08.json: the H1 and title ask what Act 388 is and which bills would change it;
 * Wilson's plan for rentals is /invest/rental-property-tax-cut/'s question.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/buyers/act-388-changes/";
const SLUG = "act-388-changes";
const D = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-e", SLUG, "act388.json"), "utf8"));
const must = (ok, what) => { if (!ok) throw new Error(`act-388-changes: ${what} differs from its ledger row`); };
const money2 = (v) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const about100 = (v) => "about $" + (Math.round(v / 100) * 100).toLocaleString("en-US");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const cents = (v) => Math.round(v * 100) / 100;

/* Links. */
const TAXES = "/buyers/property-taxes/";
const PAGE4 = "/invest/rental-property-tax-cut/";
const PAGE1 = "/market-reports/2026-election/";
const STR = "/invest/short-term-rental-rules-statehouse/";
const SECOND = "/buyers/second-home/";
const COST = "/buyers/cost-to-own/";
const CONTACT = "/contact/";

/* Sources. */
const CONST10 = "https://www.scstatehouse.gov/scconstitution/A10.pdf";
const CONST16 = "https://www.scstatehouse.gov/scconstitution/A16.pdf";
const C43 = "https://www.scstatehouse.gov/code/t12c043.php";
const C37 = "https://www.scstatehouse.gov/code/t12c037.php";
const C36 = "https://www.scstatehouse.gov/code/t12c036.php";
const C11 = "https://www.scstatehouse.gov/code/t11c011.php";
const S815 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/815.htm";
const H3841 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/3841.htm";
const S768 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/768.htm";
const H3445 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/3445.htm";
const H3352 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/3352.htm";
const H4608 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/4608.htm";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const ASSESSOR = "https://www.horrycountysc.gov/departments/assessor/guide-to-assessment";
const LINCOLN = "https://www.lincolninst.edu/app/uploads/legacy-files/pubfiles/sc_volume_2_chapter_2.pdf";
const NOTE = "https://sc.edu/study/colleges_schools/law/student_life/journals/jled/editions/_documents/2025_54_1/boyette_jled54.1_.pdf";
const WIS = "https://www.wistv.com/2026/10/28/full-interview-alan-wilson-shares-priorities-governor-ahead-election-day/";
const FOX = "https://www.foxcarolina.com/2026/10/15/republican-nominee-sc-governor-alan-wilson-announces-affordability-agenda/";
const WMBF = "https://www.wmbfnews.com/2026/09/30/sc-governor-candidates-split-taxes-infrastructure-ahead-registration-deadlines/";
const PRIORITIES = "https://wilsonforsc.com/priorities/";
const FLA = "https://www.flsenate.gov/Laws/Constitution";
const FHFA = "https://www.fhfa.gov/hpi/download/quarterly_datasets/hpi_at_metro.csv";
const SCVOTES = "https://scvotes.gov/2026-general-election-results/";

/* The photo (CC BY-SA 4.0, BullDawg2021; record in this page's photos.json): beach houses at Surfside Beach,
   under the sentence on the 6% rate. Its caption states the rule, not who owns the houses. */
const PH = PK.create({ h, photos: JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-e", SLUG, "photos.json"), "utf8")).photos }).photoSet({ aerialWidth: "760px" });
const PHOTO_RAW = PH.aerial("surfside-beach-houses-on-the-dunes", "Beach houses behind the dunes in Surfside Beach. A house here that is not the owner's home is taxed on 6% of its value.", { closeUp: true });
/* At most 720 px wide, and about 370 px beside its text on a wide screen, not the 1136 px photos.js assumes. */
if (!PHOTO_RAW.includes('sizes="(max-width: 1200px) 100vw, 1136px"')) throw new Error("photos.js changed the photo's sizes; recheck");
const PHOTO = PHOTO_RAW.split('sizes="(max-width: 1200px) 100vw, 1136px"').join('sizes="(max-width: 759px) 100vw, (max-width: 1179px) 720px, 380px"');
const CREDITS = () => PH.credits().replace(/<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/, "");

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                             */

const R = D.ratios, M = D.mills_2026;
must(R.legal_residence === 0.04 && R.other === 0.06, "F080, F085 (4% and 6%)");
must(M.county === 52.1 && M.school_debt === 10.0 && M.school_operation === 109.1 && M.myrtle_beach_city === 83.4, "F144 (2026 levy)");
const MB = cents(M.county + M.school_debt + M.school_operation + M.myrtle_beach_city);   // 254.6
must(MB === D.myrtle_beach_total_mills, "F145 (254.6 mills)");
const MB_HOME = cents(MB - M.school_operation);                                          // 145.5
const bill = (value, ratio, mills) => cents(value * ratio * mills / 1000);
must(bill(D.ledger_bills.price, R.other, MB) === D.ledger_bills.rental_6, "F145 ($5,346.60)");
must(bill(D.ledger_bills.price, R.legal_residence, MB_HOME) === D.ledger_bills.home_4, "F147 ($2,037.00)");
must(D.cap.limit === 0.15 && D.cap.years === 5 && D.exemption_2011.share === 0.25, "F142, F143");

/* One house, four owners (our constructed example; F142, F143, F145, F147). */
const EX = D.example, PRICE = EX.price;
must(PRICE === D.ledger_bills.price, "the example's price is page 4's $350,000");
const CAPPED = Math.round(EX.roll_before * (1 + D.cap.limit));                           // 230,000
const EXEMPT = Math.max(PRICE * (1 - D.exemption_2011.share), CAPPED);                    // 262,500
const OWNERS = [
  { key: "a", name: "Lives there, long-time owner", value: CAPPED, ratio: R.legal_residence, mills: MB_HOME, why: "4%, no school operating tax" },
  { key: "b", name: "Lives there, new buyer", value: PRICE, ratio: R.legal_residence, mills: MB_HOME, why: "4%, no school operating tax" },
  { key: "d", name: "Rents it out, owned before 2011", value: CAPPED, ratio: R.other, mills: MB, why: "6%, with school operating tax" },
  { key: "c", name: "Second home or rental, new buyer", value: EXEMPT, ratio: R.other, mills: MB, why: "6%, with school operating tax" },
].map((o) => ({ ...o, bill: bill(o.value, o.ratio, o.mills) }));
const OW = Object.fromEntries(OWNERS.map((o) => [o.key, o]));
must(CAPPED === 230000 && EXEMPT === 262500, "the example's values");
must(OW.a.bill === 1338.60 && OW.b.bill === 2037.00 && OW.c.bill === 4009.95 && OW.d.bill === 3513.48, "the four bills (recomputed)");
const TIMES = Math.round(OW.c.bill / OW.a.bill);                                         // 3
must(TIMES === 3, "the new second-home buyer pays about three times the long-time homeowner");

/* FHFA, between the last two scheduled reassessments (F198, F157). */
const RISE = Math.round((D.fhfa.q4_2024 / D.fhfa.q4_2019 - 1) * 100);                     // 69
must(D.fhfa.q4_2019 === 215.11 && D.fhfa.q4_2024 === 363.30 && RISE === 69, "F198 (69%)");

/* Lincoln Table 2.3, Horry, 2018 (F149). Each class's share of a levy every class pays equals its share
   of assessed value. If the 6% class moved to 4%, its assessed value falls by a third (our arithmetic). */
const LR = Object.fromEntries(D.lincoln_horry_2018.rows.map((r) => [r.class, r]));
must(LR.primary.appraised === 35.5 && LR.primary.assessed === 30.8 && LR.other_residential.appraised === 36.4 && LR.other_residential.assessed === 47.2 && LR.commercial.appraised === 21.4 && LR.commercial.assessed === 21.1, "F149 (Table 2.3)");
const REST = cents(100 - LR.primary.assessed - LR.other_residential.assessed - LR.commercial.assessed);  // 0.9
const OR4 = LR.other_residential.assessed * R.legal_residence / R.other;
const TOT4 = LR.primary.assessed + OR4 + LR.commercial.assessed + REST;
const SH = { primary: 100 * LR.primary.assessed / TOT4, other: 100 * OR4 / TOT4, commercial: 100 * LR.commercial.assessed / TOT4 };
const pc = (v) => `about ${Math.round(v)}%`;
must(Math.round(SH.primary) === 37 && Math.round(SH.other) === 37 && Math.round(SH.commercial) === 25, "the share arithmetic (37, 37, 25)");

/* Effective rates: our example against the Lincoln study's statewide figures (F152). */
const EFF_HOME = Math.round(D.ledger_bills.home_4 / PRICE * 1000) / 10;                  // 0.6
const EFF_RENT = Math.round(D.ledger_bills.rental_6 / PRICE * 1000) / 10;                // 1.5
must(EFF_HOME === 0.6 && EFF_RENT === 1.5 && D.lincoln_effective_rates.homestead === 0.005, "F152 and our example");

/* Votes (F011, F012, F014, F083). */
const HO = D.house, SE = D.senate;
must(HO.members === 124 && HO.two_thirds === Math.ceil(HO.members * 2 / 3) && HO.republicans_unofficial === 79, "F083, F011 (House)");
must(SE.members === 46 && SE.two_thirds === Math.ceil(SE.members * 2 / 3) && SE.republicans === 34, "F083, F012 (Senate)");
const SHORT = HO.two_thirds - HO.republicans_unofficial;                                 // 4
/* The two recount districts (F014): D27 a Republican lead, D89 a Democratic lead. Both flipped: 78 to 80. */
must(SHORT === 4 && HO.recounts.join() === "27,89", "F014 (recounts)");
const HZ = D.horry_house_districts;
must(HZ.R.length === 8 && HZ.D.length === 3, "F015 (Horry districts by party)");
must(D.act_140_votes.house.join() === "107-0,109-0" && D.act_140_votes.senate === "43-0" && D.act_140_votes.rented_days_limit === 72, "F154");
must(D.s768.senate_vote === "44-0" && D.s768.exemption_2025_or_10yr === 150000 && D.s768.exemption_5yr === 75000, "F155");
must(D.reassessment.next_inferred === 2029 && D.reassessment.every === 5, "F157");

/* ---------------------------------------------------------------------------- */
/* The page's own blocks, in the glass theme's look.                              */
/* Design pass, 2026-11-08 (Blog-Brain redo3/buyers-act-388-changes/DESIGN.md): a two-line headline and the short answer
   on the first screen, the contents between rules, one card style (the two charts and the offers), plain lists and
   tables under thin rules, one block width of 720 px, the photo beside its text on a wide screen. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58))!important;border:1px solid rgba(255,255,255,.8)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)!important;border-radius:20px!important";
const BRASS = "#c4783a", SLATE = "#5c6b78";
const CSS = "<style>"
  + `${S} h1,${S} h2,${S} h3{text-wrap:balance}`
  /* 1. The headline: the italic line at about half the H1's size; the dek is not shown (the facts above it say the
     same 4% and 6%); the four facts one quiet line on a wide screen and flat rows under rules on a phone. */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:#8a5226!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  + `${S} .c3-glance li{${FLAT};min-width:0}${S} .c3-glance li{line-height:1.4!important}${S} .c3-glance strong{font-size:.85rem!important;color:var(--muted)!important;font-weight:500;line-height:1.4!important}${S} .c3-glance span.t{color:var(--navy)!important;font-weight:600;font-size:1rem!important;line-height:1.4!important}`
  + `@media (min-width:700px){${S} .detail-hero .detail-media:has(.c3-glance){max-width:none!important}${S} .c3-glance{max-width:none!important;display:flex!important;flex-wrap:wrap;gap:.3rem 2.4rem!important;border-top:${RULE};border-bottom:${RULE};padding:.55rem 0}${S} .c3-glance li{padding:.15rem 0!important}}`
  /* on a phone: a small fact table, the label on the left and the fact on the right, one line each */
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{border-top:${RULE}!important;display:block!important;text-align:left!important;padding:.45rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}${S} .c3-glance .i{display:none!important}`
  + `${S} .c3-glance li>span:last-child{display:grid;grid-template-columns:8.3rem minmax(0,1fr);column-gap:.45rem;align-items:baseline}${S} .c3-glance strong{font-size:.8rem!important}${S} .c3-glance span.t{font-size:.95rem!important}}`
  /* the hero ends closer to the short answer, so the answer is on the first screen */
  + `${S} .detail-hero{padding-bottom:1.6rem!important}${S}>.detail-hero+section:not(.hx-feed),${S}>.hx-feed-top+section{padding-top:1.6rem!important}`
  + `@media (max-width:699px){${S} .detail-hero{padding-bottom:.4rem!important}${S}>.detail-hero+section:not(.hx-feed),${S}>.hx-feed-top+section{padding-top:1.1rem!important}${S} .detail-hero .detail-media{margin-bottom:.8rem!important}}`
  /* 2. The contents list: no card, in columns between two rules. */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important;max-width:720px!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}`
  /* 3. One card style, for the two charts (the offers keep theirs). */
  + `${S} figure.a388-fig{max-width:720px;margin:1.4rem 0 1.6rem;padding:1.1rem 1.2rem 1rem!important;box-sizing:border-box;${CARD}}`
  + `${S} .a388-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .9rem;text-wrap:balance}`
  + `${S} .a388-fig figcaption{color:var(--muted);font-size:.92rem!important;line-height:1.55;margin-top:.8rem!important;padding:0!important}`
  /* the share chart: three groups, two bars each, the number on the bar's end */
  + `${S} .a388-sh{list-style:none;margin:0;padding:0}${S} .a388-sh>li{margin:0;padding:.55rem 0 .65rem;border-top:${RULE}}${S} .a388-sh>li:first-child{border-top:0;padding-top:0}`
  + `${S} .a388-sh .g{display:block;color:var(--navy);font-family:var(--sans);font-weight:650;font-size:1.02rem;margin:0 0 .3rem}`
  + `${S} .a388-sh .r{display:grid;grid-template-columns:minmax(0,10.5rem) minmax(0,1fr);align-items:center;column-gap:.8rem;margin:.2rem 0;font-family:var(--sans);font-size:.95rem;color:var(--muted)}`
  + `${S} .a388-sh .bar{display:flex;align-items:center;gap:.5rem;min-width:0}${S} .a388-sh .bar i{display:block;height:.85rem;border-radius:999px;background:${SLATE};flex:none}${S} .a388-sh .r.tx .bar i{background:${BRASS}}`
  + `${S} .a388-sh .bar b{color:var(--navy);font-weight:700;white-space:nowrap}`
  + `@media (max-width:479px){${S} .a388-sh .r{grid-template-columns:minmax(0,7.4rem) minmax(0,1fr);column-gap:.6rem;font-size:.85rem;line-height:1.25}${S} .a388-sh .bar b{font-size:.9rem}}`
  /* What Act 388 did, and the short and long run: plain columns under rules. */
  + `${S} .a388-grid{display:grid;column-gap:1.6rem;margin:1.1rem 0 1.4rem;max-width:720px}`
  + `@media (min-width:760px){${S} .a388-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  /* What Act 388 did: three rows, the part named on the left and what it did on the right */
  + `${S} .a388-grid:not(.two){border-bottom:${RULE}}@media (min-width:760px){${S} .a388-grid:not(.two) .a388-card{display:grid;grid-template-columns:13rem minmax(0,1fr);column-gap:1.4rem}${S} .a388-grid:not(.two) .a388-card h3{margin:.15rem 0 0!important}}`
  + `${S} .a388-card{padding:.9rem 0 1rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:var(--read,1.0625rem)}`
  + `${S} .a388-card h3{font-family:var(--sans)!important;font-size:1.08rem!important;font-weight:650;color:var(--navy);margin:0 0 .35rem!important;line-height:1.35}`
  + `${S} .a388-card p{margin:0 0 .5rem}${S} .a388-card p:last-child{margin:0}`
  + `${S} .a388-card .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:#8a5226;font-weight:700;margin:.6rem 0 .1rem}`
  /* the timeline: the years and the line stay; no box around each year's text */
  + `${S} .a388-tl{list-style:none;margin:1.2rem 0 1.4rem;padding:0;max-width:720px;position:relative}`
  + `${S} .a388-tl::before{content:"";position:absolute;left:2.05rem;top:.5rem;bottom:.5rem;width:2px;background:rgba(196,120,58,.35)}`
  + `${S} .a388-tl .r{position:relative;display:grid;grid-template-columns:4.1rem minmax(0,1fr);gap:.9rem;align-items:start;margin:0 0 .9rem}${S} .a388-tl .r:last-child{margin-bottom:0}`
  + `${S} .a388-tl .y{position:relative;z-index:1;display:block;text-align:center;font:650 .95rem/1.9rem var(--sans);color:var(--navy);background:#fbf8f3;border:1px solid rgba(196,120,58,.45);border-radius:999px}`
  + `${S} .a388-tl .t{display:block;padding:.2rem 0 0;color:var(--muted);line-height:1.55;font-size:var(--read,1.0625rem)}${S} .a388-tl .t strong{color:var(--navy);font-weight:600}`
  + `${S} .a388-tl .r.next .y{background:var(--navy);color:#fff;border-color:var(--navy)}`
  /* the tables: plain under thin rules, 720 px; on a phone, plain rows split by a rule */
  + `${S} .a388-bills>div,${S} .c3-cc{${FLAT};padding:0!important;max-width:720px!important}`
  + `${S} .a388-bills td:first-child{white-space:nowrap}${S} .a388-bills td{vertical-align:top!important}${S} .a388-bills th:first-child,${S} .a388-bills td:first-child,${S} .c3-cc th:first-child,${S} .c3-cc td:first-child{padding-left:0!important}${S} .c3-cc :is(th,td):last-child{padding-right:0!important}`
  + `${S} .c3-cc:has(thead th:nth-child(5)) table{font-size:.95rem}${S} .c3-cc:has(thead th:nth-child(5)) :is(th,td){padding:.55rem .5rem}`
  + `@media (max-width:699px){${S} .a388-bills thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}${S} .a388-bills table,${S} .a388-bills tbody,${S} .a388-bills tr,${S} .a388-bills td{display:block;width:auto}`
  + `${S} .a388-bills tr{margin:0;padding:.7rem 0 .75rem;border-top:${RULE}}${S} .a388-bills tr:last-child{border-bottom:${RULE}}${S} .a388-bills td{border:0!important;padding:.15rem 0!important}${S} .a388-bills td:first-child{font-weight:650;font-size:1.05rem}${S} .a388-bills td:last-child{color:var(--navy)}}`
  + `@media (max-width:39.999em){${S} .c3-cc tbody tr{${FLAT};border-top:${RULE}!important;margin:0!important;padding:.6rem 0 .7rem!important}${S} .c3-cc tbody tr:last-child{border-bottom:${RULE}!important}${S} .c3-cc th,${S} .c3-cc td{padding:.15rem 0!important}}`
  + `@media (max-width:49.999em){${S} .c3-cc:has(thead th:nth-child(5)) tbody tr{${FLAT};border-top:${RULE}!important;margin:0!important;padding:.6rem 0 .7rem!important}${S} .c3-cc:has(thead th:nth-child(5)) tbody tr:last-child{border-bottom:${RULE}!important}${S} .c3-cc:has(thead th:nth-child(5)) th,${S} .c3-cc:has(thead th:nth-child(5)) td{padding:.15rem 0!important}}`
  /* 4. The photo: no frame; on a wide screen beside the two paragraphs it explains. */
  + `${S} #why-second-homes-pay-more>.wrap figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} #why-second-homes-pay-more>.wrap figure.c3ph-hero figcaption{padding:0!important;margin-top:.55rem!important}`
  + `@media (min-width:1180px){${S} #why-second-homes-pay-more>.wrap{display:grid;grid-template-columns:720px minmax(0,1fr);column-gap:2.6rem;align-items:start}`
  + `${S} #why-second-homes-pay-more>.wrap>h2{grid-column:1/-1}${S} #why-second-homes-pay-more>.wrap>p{grid-column:1}${S} #why-second-homes-pay-more>.wrap>.c3-aerial{grid-column:2;grid-row:2/span 2;margin-top:.3rem}${S} #why-second-homes-pay-more>.wrap figure.c3ph-hero{margin:0!important}}`
  + `@media (prefers-reduced-transparency:reduce){${S} figure.a388-fig{background:#fbf8f3!important}}`
  /* offer boxes: a larger button (as on the approved pages) */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  /* The header phone at 1,000 to 1,100 px pushed the page 5 px wider than the window (copied from /hoa/documents/). */
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  /* The closing band kept dark (copied from /hoa/documents/ and /hoa/liens-and-foreclosure/): without it, its
     ivory words sat on a light card and could not be read. */
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";
const card = (title, parts) => `<div class="a388-card"><h3>${title}</h3>${parts}</div>`;
/* The timeline is a visual, drawn as a list of divs (role="list") so it reads as one picture of the years. */
const tl = (items) => `<div class="a388-tl" role="list" aria-label="Act 388 and the changes since, year by year">${items.map(([y, t, next]) => `<div role="listitem" class="r${next ? " next" : ""}"><span class="y">${y}</span><span class="t">${t}</span></div>`).join("")}</div>`;

/* Chart 1: one house, four owners, as an inline SVG drawn from the bills above. 360 units wide, so its
   15-unit text stays near 15 px on a phone; at most 480 px wide on a wide screen. Its title says what it shows
   (design pass, 2026-11-08); the note under it keeps the key and the limits. */
const OWNERS_CHART = (() => {
  const W = 360, ROW = 60, TOP = 6, BARW = 232, max = Math.max(...OWNERS.map((o) => o.bill));
  const Hh = TOP + ROW * OWNERS.length + 2;
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const rows = OWNERS.map((o, i) => {
    const y = TOP + i * ROW, w = Math.max(6, Math.round(o.bill / max * BARW));
    const fill = o.ratio === R.other ? "#c4783a" : "#1c2028";
    return `<text x="0" y="${y + 16}" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="15" fill="#1c2028">${esc(o.name)}</text>`
      + `<rect x="0" y="${y + 25}" width="${w}" height="20" rx="10" fill="${fill}"/>`
      + `<text x="${w + 8}" y="${y + 40}" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="15" font-weight="600" fill="#1c2028">${about100(o.bill)}</text>`;
  }).join("");
  const label = `Yearly tax on one $350,000 Myrtle Beach house: ${OWNERS.map((o) => `${o.name.toLowerCase()}, ${about100(o.bill)}`).join("; ")}.`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(label)}" style="display:block;width:100%;max-width:480px;height:auto"><title>${esc(label)}</title>${rows}</svg>`;
  /* h.figure checks the svg's label; the figure then takes this page's chart card. */
  return h.figure(svg, "Dark bars are taxed at 4%, brass bars at 6%. Our example, before credits, fees and any special district.")
    .replace('<figure style="margin:1.8rem 0;max-width:760px">', `<figure class="a388-fig"><p class="cap">One $350,000 Myrtle Beach house, four owners: the 2026 tax bill</p>`);
})();

/* Chart 2: Horry County, 2018, share of market value and of taxable value, by class (F149). Three groups, two
   bars each, so a reader compares the two shares of one kind of property at a glance (design pass, 2026-11-08). */
const SHARE_CHART = (() => {
  const MAX = 50;
  const groups = [
    ["Homes their owners live in", LR.primary],
    ["Other homes, mostly rentals", LR.other_residential],
    ["Commercial property", LR.commercial],
  ];
  const bar = (cls, label, v) => `<span class="r${cls}"><span class="l">${label}</span><span class="bar"><i style="width:${Math.round(v / MAX * 100 * 0.68)}%" aria-hidden="true"></i><b>${v}%</b></span></span>`;
  const items = groups.map(([name, r]) => `<li><span class="g">${name}</span>${bar("", "Share of market value", r.appraised)}${bar(" tx", "Share of taxable value", r.assessed)}</li>`).join("");
  return `<figure class="a388-fig"><p class="cap">Horry County, 2018: rentals were taxed on more than their share of the value</p>`
    + `<ul class="a388-sh" aria-label="Horry County, 2018: share of market value and share of taxable value, by kind of property">${items}</ul>`
    + `<figcaption>Gray bars: share of market value. Brass bars: share of taxable value. Taxable value is the assessed value, after the 4% or 6% rate. Only real property the county assessor values is counted. Property the state values and vehicles are not in it. Other homes are, in the study's words, typically rental property at the 6% rate.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "Act 388 in South Carolina: the 15% Cap, 6% Rate and Bills",
  description: "What Act 388 is, how the 15% cap and the 4% and 6% rates work, and which bills in the legislature would change them, for Myrtle Beach and Horry County owners.",
  ogTitle: "What is Act 388 in South Carolina, and which bills would change it?",
  crumb: "Act 388 changes",
  eyebrow: "Property tax",
  h1: "What is Act 388 in South Carolina, and which bills would change it?",
  h1em: "The law, the rates and the bills",
  sub: "A Myrtle Beach second home or rental is taxed on 6% of its value, plus school operating tax. A home you live in pays on 4%, without that tax.",
  heroMedia: CSS + glance([
    { icon: "home", label: "Home you live in", text: "4% of value" },
    { icon: "key", label: "Second home or rental", text: "6%, plus school tax" },
    { icon: "tax", label: "To change the rates", text: "Two-thirds of each house" },
    { icon: "calendar", label: "Next reassessment", text: "2029, our estimate" },
  ]),
  heroCta: { title: "Buying on the Grand Strand? We work out the tax bill on the home first.", label: "Get the tax on a home", href: CONTACT },
  author: "devin+abdulla",
  shortAnswer: [
    `Act 388 is the 2006 state law that took school operating taxes off homes their owners live in. Second homes and rentals still pay them, and are taxed at 6% of value, not 4%.`,
    `Lowering the 6% rate takes two-thirds of each house of the legislature, and no bill we found would lower it.`,
    `For a home you live in, nothing pending raises the 4% rate. The one bill on that rate signed this year keeps it for heirs for a time.`,
  ],
  sections: [
    { h2: "What did Act 388 do?", toc: "What Act 388 did", id: "what-act-388-did", html: () =>
      h.p(`Act 388 is the 2006 state law that took school operating taxes off homes their owners live in. Everyone else still pays them, including second homes, rentals and businesses.`) +
      `<div class="a388-grid">` +
      card("Homes their owners live in", `<p>They stopped paying the school operating tax. They still pay the school debt tax, the county's tax and the city's.</p>`) +
      card("An extra 1% sales tax", `<p>The state sales tax rose by 1%, but not on hotel and rental stays. The money goes to a separate fund that pays school districts back.</p>`) +
      card("The 15% limit", `<p>At each countywide reassessment, a property's taxable value can rise no more than 15% over five years. It took effect after a change to the state constitution was ratified.</p>`) +
      `</div>` +
      h.p(`In Horry County the school operating tax is the largest single part of a second home's bill.`) +
      h.h3("What has changed since?") +
      tl([
        ["2006", `<strong>Act 388 passes.</strong> Homes their owners live in stop paying school operating tax.`],
        ["2007", `<strong>The 1% sales tax starts, and the change to the constitution behind the 15% limit is ratified.</strong>`],
        ["2011", `<strong>Act No. 57.</strong> When a 6% property sells, 25% of its value at the sale is exempt.`],
        ["2019", `<strong>Horry County reassessment.</strong>`],
        ["2024", `<strong>The next Horry County reassessment</strong>, as the county scheduled it.`],
        ["2026", `<strong>S. 815 is filed, and Act 140 is signed.</strong> Wilson wins the governor's race; Jermaine Johnson concedes.`],
        ["2028", `<strong>The next general election.</strong> The earliest statewide vote on a change to the constitution.`, true],
        ["2029", `<strong>Horry County's next reassessment</strong>, expected. Our estimate from the five-year rule.`, true],
      ]) },

    { h2: "Why does a second home or rental in Myrtle Beach pay more property tax?", toc: "Why second homes pay more", id: "why-second-homes-pay-more", html: () =>
      h.p(`The state constitution taxes a home you do not live in on 6% of its value instead of 4%, and it still pays the school operating tax. On the same house inside Myrtle Beach, that makes the second-home bill more than twice the homeowner's. Our ${h.a(TAXES, "Horry County property tax guide")} shows how each bill is figured, and our ${h.a(PAGE4, "page for rental investors works each bill at 6% and 4%")}.`) +
      PH.css() + PHOTO +
      h.p(`The example house pays about ${EFF_HOME}% of its value a year as a home you live in, and about ${EFF_RENT}% as a second home. A statewide study by the Lincoln Institute found about the same: half a percent for homeowners, a little over one and a half for apartments.`) },

    { h2: "How does the 15% cap work, and when does it reset?", toc: "The 15% cap and a sale", id: "the-15-cap", html: (bg) =>
      h.p(`The 15% cap limits how much a reassessment can raise your taxable value while you own the home. A sale or an addition ends the limit for that property.`) +
      h.p(`From late 2019 to late 2024, home prices in the Myrtle Beach metro rose ${RISE}% on the federal housing agency's index. An owner who did not sell or add on saw a taxable value rise of 15% at most.`) +
      h.p(`The buyer starts at market value. The 2011 law reduces that for a second home or rental. A quarter of the value at the sale is exempt. It still cannot go below what the seller paid tax on.`) +
      h.h3("One house, four owners") +
      h.p(`Take a house on the roll at $200,000 at one reassessment. At the next, the cap lets it rise to $230,000 at most. It sells for $350,000. The chart gives the 2026 bill for each kind of owner.`) +
      OWNERS_CHART +
      compareCards(OWNERS.map((o) => ({ name: o.name, cells: { v: "$" + n0(o.value), r: o.why, t: money2(o.bill) } })), [{ key: "v", label: "Taxable value", num: true }, { key: "r", label: "Rate" }, { key: "t", label: "Yearly tax", num: true }], { caption: "The four bills, worked out", nameLabel: "Owner" }) +
      h.p(`The new second-home buyer pays about ${TIMES} times what the long-time owner who lives there pays, on the same house. The buyer who moves in pays more than the long-time owner too, but at the lower rate.`) +
      h.cta("Before you make an offer on a Grand Strand home", "We work out its tax bill as a home you live in and as a second home, from the county's own record.", "Get the tax on a home", CONTACT, bg) },

    /* Overlap fix (Blog-Brain reports/cannibalization-2026-11-08.json): the Wilson rental question belongs to
       /invest/rental-property-tax-cut/. This section is two sentences and a link (DESIGN.md lists the cut sentences). */
    { h2: "What did Alan Wilson and Jermaine Johnson say about Act 388?", toc: "What the candidates said", id: "candidates", html: () =>
      h.p(`Alan Wilson plans to look at reforming Act 388 for rentals, and neither he nor Jermaine Johnson named a rate, a bill or a cost. What Wilson's plan would do to a Myrtle Beach rental's tax bill is on our ${h.a(PAGE4, "rental tax cut page")}.`) },

    { h2: "Which Act 388 bills are in the South Carolina legislature now?", toc: "Bills and their status", id: "bills", html: () =>
      h.p(`One became law and the rest are in committee. We read each bill's page at the Statehouse, and none of them lowers the 6% rate.`) +
      `<div class="a388-bills">` + h.table(["Bill", "What it does", "Where it stands"], [
        [h.ext(H3841, "H. 3841, now Act 140"), `A home keeps the 4% rate after the owner dies, until the estate closes, a deed out of the estate is recorded, or Dec. 31 of the year after the death. It ends if the home is rented more than ${D.act_140_votes.rented_days_limit} days.`, `Signed into law. House ${D.act_140_votes.house.join(" and ")}, Senate ${D.act_140_votes.senate}.`],
        [h.ext(S815, "S. 815"), "A change to the constitution: the legislature could choose the classes of property and their rates by law.", "Senate Finance Committee."],
        [h.ext(S768, "S. 768"), `Raises the senior homestead exemption from $50,000 of value to $150,000 for those who qualified in 2025 and residents of 10 years, and to $75,000 for residents of five years.`, `Passed the Senate ${D.s768.senate_vote}. House Ways and Means Committee.`],
        [h.ext(H3445, "H. 3445"), "A spouse may claim the 4% rate.", "House Ways and Means Committee."],
        [h.ext(H3352, "H. 3352"), "The assessor may not demand confidential tax records for the 4% rate.", "House Ways and Means Committee."],
        [h.ext(H4608, "H. 4608"), "The 4% rate for family dwellings on the same lot.", "House Ways and Means Committee."],
      ]) + `</div>` +
      h.p(`Two Horry County representatives, Kevin Hardee and William Bailey, were among the sponsors of Act 140. No one voted against it in either house.`) },

    /* Overlap fix: bill text only. The vote count (seats won, the recounts) is the rental tax cut page's answer. */
    { h2: "Which bills would change the 6% rate?", toc: "Bills that would change it", id: "what-it-would-take", html: () =>
      h.p(`Two-thirds of the members of each house must vote for it. The governor can propose a change, but the vote is the legislature's.`) +
      h.p(`Cutting the school tax break for the home you live in also takes a two-thirds roll-call vote in each house.`) +
      h.h3("The longer route: S. 815") +
      h.p(`S. 815 would change the constitution itself. That takes two-thirds of each house and then a majority of voters at the next general election, in November 2028. The next legislature must then ratify it.`) },

    { h2: "When is Horry County's next reassessment?", toc: "Next reassessment", id: "next-reassessment", html: () =>
      h.p(`Tax year 2029 is our estimate, or 2030 if the county postpones. State law requires a reassessment every fifth year, and a county may put one off by a year.`) +
      h.p(`The county reassessed for tax year 2019 and scheduled the next for 2024. We checked the county's assessor guide: it gives no date for the one after.`) +
      h.ul([
        `<strong>If you have not sold or added on,</strong> the 15% cap limits your rise in taxable value at that reassessment.`,
        `<strong>If you bought after the last one,</strong> your value already started at the price you paid.`,
        `<strong>If voters approved the amendment in 2028,</strong> the next legislature would ratify it about when the reassessment is due. Any new rates would still need a law.`,
      ]) },

    { h2: "Who would pay more or less under each change?", toc: "Who pays more or less", id: "who-pays", html: () =>
      h.p(`A lower rate for rentals would cut their bills by about a third or more, and no plan names who would make up the money. The bills already passed or pending help homeowners and heirs.`) +
      compareCards([
        { name: "Rentals taxed at 4% (Wilson's idea)", cells: { home: "Larger share if money not replaced", second: "Unknown until a bill is written", rental: "About a third off, or more", biz: "Larger share if money not replaced" } },
        { name: "S. 815 (rates chosen by law)", cells: { home: "No change by itself", second: "No change by itself", rental: "No change by itself", biz: "No change by itself" } },
        { name: "Act 140 (law now)", cells: { home: "Heirs keep 4% for a time", second: "No change", rental: "Heirs lose 4% if rented over 72 days", biz: "No change" } },
        { name: "S. 768 (larger homestead exemption)", cells: { home: "Larger exemption, if you qualify", second: "No change", rental: "No change", biz: "No change" } },
        { name: "Business personal property cut", cells: { home: "No change", second: "No change", rental: "No change", biz: "Lower, if a bill passes" } },
      ], [{ key: "home", label: "Home you live in" }, { key: "second", label: "Second home" }, { key: "rental", label: "Rental" }, { key: "biz", label: "Business" }],
      { caption: "Each change, by kind of owner", nameLabel: "Change" }) +
      h.h3("Who would make up the money?") +
      h.p(`In 2006 the state named a new source, the extra sales tax, for the money homeowners stopped paying. No plan to lower the rental rate names one.`) +
      h.p(`If none were named, the same dollars would have to come from the rest of the tax roll. For a tax every kind of property pays, such as the county's own tax, each kind pays its share of taxable value.`) +
      h.p(`Of the real property the county assessor values, homes their owners live in were taxed on ${LR.primary.assessed}% in 2018. With every 6% home moved to 4% and the same dollars raised, that would rise to ${pc(SH.primary)}.`) +
      compareCards([
        { name: "Homes their owners live in", cells: { now: `${LR.primary.assessed}%`, four: pc(SH.primary) } },
        { name: "Other homes, mostly rentals", cells: { now: `${LR.other_residential.assessed}%`, four: pc(SH.other) } },
        { name: "Commercial property", cells: { now: `${LR.commercial.assessed}%`, four: pc(SH.commercial) } },
      ], [{ key: "now", label: "Share, 2018", num: true }, { key: "four", label: "With 6% homes at 4%", num: true }],
      { caption: "Share of taxable value, property the Horry County assessor values", nameLabel: "Kind of property" }) +
      h.ul([
        `<strong>Every 6% home moves.</strong> The calculation moves the whole higher-rate class to the lower rate, second homes included. If only rentals moved, the shift would be smaller.`,
        `<strong>The rest is held fixed.</strong> The rest of the roll, under one percent, is held as it was.`,
        `<strong>What is not counted.</strong> Property the state values, such as factories and utilities, and vehicles are not in these figures.`,
      ]) +
      h.p(`The figures are a calculation, not a forecast. The school operating tax works differently: homes their owners live in do not pay it, so that part would fall on second homes, rentals and businesses.`) },

    { h2: "What does the evidence say about Act 388, for and against?", toc: "Evidence on both sides", id: "evidence", html: () =>
      h.p(`The main study says the state's system moved the tax off homes their owners live in and onto other property. Lawmakers have kept widening the homeowner side, with no votes against.`) +
      h.h3("The case that it shifted the tax") +
      h.p(`The ${h.ext(LINCOLN, "Lincoln Institute of Land Policy")} wrote the study in 2020. The South Carolina Chamber Foundation and South Carolina Realtors picked the ten counties it studied, Horry among them. Its subtitle calls the system "Complex, Inequitable and Uncompetitive."`) +
      h.p(`It found the burden has shifted "from owner-occupied residential properties to non-owner-occupied residential properties." It names commercial, manufacturing and utility property too. In Horry County the figures look like this:`) +
      SHARE_CHART +
      h.p(`A 2025 student note in a University of South Carolina law journal adds two claims. It says the rental rate has led to "rising rent costs" in South Carolina. It says the rate "can also prevent the development of affordable housing" as well. The note cites other sources and is not a measured study.`) +
      h.h3("The case for keeping it") +
      h.p(`A group at nohometax.org publishes a page titled "We Support Act 388." The legislature's own votes point the same way.`) +
      h.ul([
        `<strong>Act 140</strong> passed the House twice and the Senate with no votes against.`,
        `<strong>S. 768</strong>, the larger senior exemption, passed the Senate with no votes against.`,
        `<strong>The school tax break</strong> for the home you live in can be cut only by a two-thirds roll-call vote of each house.`,
      ]) },

    { h2: "What could happen to each kind of owner in the short run and the long run?", toc: "Short and long run", id: "short-and-long-run", html: (bg) =>
      h.p(`For homeowners, little changes in the first two years. For second homes and rentals, the range is from no change to about a third off a city bill, and only after a two-thirds vote.`) +
      `<div class="a388-grid two">` +
      card("Home you live in",
        `<span class="k">First 1 to 2 years</span><p>Nothing pending raises your 4% assessment. If every second home and rental moved to the lower rate with no new money, homes like yours would pay a larger share. The table under "Who would make up the money?" gives it.</p>`
        + `<span class="k">Five years and more</span><p>The 15% cap keeps your taxable value under the market while you own the home. It applies again at the next reassessment.</p>`
        + `<span class="k">Where this was tried before</span><p>In 2006 lawmakers paired the homeowner cut with a new sales tax, so school districts were paid back.</p>`) +
      card("Second home",
        `<span class="k">First 1 to 2 years</span><p>Wilson named "second, third, and fourth homes." Whether a cut would include a second home you never rent depends on a bill no one has written.</p>`
        + `<span class="k">Five years and more</span><p>When you sell, your buyer's value starts at the price, less the 25% exemption.</p>`
        + `<span class="k">Where this was tried before</span><p>That exemption came five years after Act 388. It applies at each sale of a home taxed at 6%.</p>`) +
      card("Rental",
        `<span class="k">First 1 to 2 years</span><p>No change until both houses pass a lower rate by two-thirds. Our ${h.a(STR, "short-term rental rules guide")} covers what else the Statehouse can change.</p>`
        + `<span class="k">Five years and more</span><p>Florida chose a different rule. It limits the yearly rise in assessment on a home that is not the owner's residence to 10%. The limit leaves out school taxes and buildings over nine units. We found no measured study of what that did to Florida rents or prices.</p>`
        + `<span class="k">Rents</span><p>Whether a lower tax would reach tenants is not known. The student note says the high rate has raised rents, without measuring it.</p>`) +
      card("Business property",
        `<span class="k">First 1 to 2 years</span><p>Wilson's agenda, as reported, lists lower personal property taxes for businesses. No bill was published.</p>`
        + `<span class="k">Five years and more</span><p>Commercial property was about a fifth of the taxable value of property the county assessor values. If every second home and rental moved to the lower rate with the same dollars raised, that share would rise toward a quarter.</p>`
        + `<span class="k">Where this was tried before</span><p>The Lincoln study found the shift fell partly on business property.</p>`) +
      `</div>` +
      h.p(`Buying a second home now? Our ${h.a(SECOND, "second home guide")} and our ${h.a(COST, "cost to own a home here")} give the rest of the yearly cost.`) +
      h.cta("Thinking about a second home or a rental on the Grand Strand?", "We work out the tax bill on the homes you like, at today's rates, before you make an offer.", "Get the tax on a home", CONTACT, bg) },
  ],
  faqTitle: "Act 388 questions",
  faq: [
    { q: "Does a Myrtle Beach home get the 4% rate automatically?", a: "No. The owner must apply to the county for the 4% rate before the first penalty date. Without the application, the home is taxed at 6%, like a second home." },
    { q: "Can I get the 25% exemption on a second home I buy?", a: "Yes, if the home is taxed as a second home or rental and changed hands after 2010. The owner must notify the assessor before Jan. 31 of the first tax year claimed. The taxable value cannot fall below the seller's value on the roll." },
    { q: "Does a home keep the 4% rate after the owner dies?", a: "Yes, for a time, under Act 140. The rate stays until the estate closes, a deed out of the estate is recorded, or Dec. 31 of the year after the death, whichever comes first. It ends if the home is rented more than 72 days." },
    { q: "Did Annie Andrews' win change property taxes in Horry County?", a: "No. The two rates are in the South Carolina Constitution. Only the state legislature, or the legislature and the state's voters together, can change them. A U.S. senator has no vote on them." },
    { q: "Will my property tax go up at the next Horry County reassessment?", a: "If you have not sold or added on, your taxable value can rise no more than 15% at that reassessment. The tax rate can still change. We expect the next one for tax year 2029, from the state's five-year rule." },
  ],
  sources: [
    { name: "S.C. Const. Art. X", href: CONST10 },
    { name: "Art. XVI", href: CONST16 },
    { name: "S.C. Code 12-43", href: C43 },
    { name: "12-37", href: C37 },
    { name: "12-36-1110", href: C36 },
    { name: "11-11-155", href: C11 },
    { name: "S. 815", href: S815 },
    { name: "Horry 2026 levy", href: LEVY },
    { name: "Horry assessor", href: ASSESSOR },
    { name: "Lincoln Institute 2020", href: LINCOLN },
    { name: "USC law note 2025", href: NOTE },
    { name: "WIS", href: WIS },
    { name: "Fox Carolina", href: FOX },
    { name: "WMBF", href: WMBF },
    { name: "Wilson priorities", href: PRIORITIES },
    { name: "SC Election Commission", href: SCVOTES },
    { name: "FHFA index", href: FHFA },
    { name: "Florida Const. Art. VII", href: FLA },
  ],
  sourcesNote: "Election results are unofficial until certified. The four-owner example and the shares are our arithmetic. Not legal or tax advice.",
  afterSources: CREDITS,
  bottomCta: { h2: "Buying or owning on the Grand Strand?", p: "Send us the address. We work out the tax bill as a home you live in and as a second home, and what changes when it sells.", label: "Get the tax on a home", href: CONTACT },
  keywords: "Act 388 school operating tax, Act 388 South Carolina, Act 388 changes, Act 388 bills 2026, 15 percent cap reassessment, S. 815, Act 140, Horry County reassessment",
  about: "South Carolina Act 388 of 2006, the 4% and 6% property tax rates, and proposed changes, for owners in Myrtle Beach and Horry County",
});
