/* /invest/rental-program-vs-airbnb/ - an oceanfront condo owner's choice between the building's rental
 * program and running the unit on Airbnb or Vrbo: what each keeps, one real owner statement, a year both
 * ways, which buildings run a program, the exit, owner stays, the loan, the taxes and the license.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-04; fix round 1 the same day (REVIEW-1.md). Replaces the 2026-09-06 spec (no share in percent or
 * dollars, "ask for it", Airbnb at 3 percent and Vrbo at 5 plus 3, both now wrong; no visual).
 * Facts: Blog-Brain batches/2026-11-a/invest-rental-program-vs-airbnb/facts.md, VERIFIED and CORRECTED
 * rows only, at the corrected wording (VERIFY.md). Struck list: invest-rental-program-vs-airbnb-struck.json.
 * Every number is read here from data/2026-11-a/invest-rental-program-vs-airbnb/findings.json (compute.py:
 * the manual's terms and sample statement, the platform fees, the per-$1,000 and yearly examples, the CRM
 * counts) and raw/by-building.json (the building chart), never typed.
 * Sources: one oceanfront resort's owner manual (a 2017 copy a listing site posted; rows 1 to 7, past
 * tense, never today's terms; the resort is named only in the sources line, PLAN choice a); Airbnb help
 * 1857 and 2328; Vrbo's pay-per-booking page; SCDOR accommodations; Horry County hospitality fee; City of
 * Myrtle Beach business license FAQ; SC Code 40-57; lender project rules (B4-2.1-03, reused from the
 * invest-condos pull; never named in copy); IRS Publication 527; 26 CFR 1.469-5T; data/str-market.json
 * (AirROI, the only source for rental figures); the CRM's public map API, counted in aggregate; stories
 * rental-program-buildings, str-cheapest-cleaner.
 * Kept from the live page: the H1 question, the definitions (shorter), the tax facts (re-verified), the
 * lender section (made concrete), the agreement checklist (now what we read), the internal links.
 * Row 16's manager range is not set beside the 38.6 percent (its base is "gross profit"; VERIFY row 16).
 * Row 28 (listing loan flags) stays off the page.
 * Photo: Grande Shores from the beach (Philip Tellis, CC BY-SA 2.0, Wikimedia Commons) until the photo
 * partner's shots arrive (shot-list.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/rental-program-vs-airbnb/";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", "invest-rental-program-vs-airbnb");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), BYB = read(path.join("raw", "by-building.json")), PHOTOS = read("photos.json").photos;

/* ---------------------------------------------------------------------------- */
/* Numbers, rounded the way the ledger says                                       */

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const cents = (v) => "$" + v.toFixed(2);
const r100 = (v) => money(Math.round(v / 100) * 100);
const M = F.manual, ST = M.statement, PL = F.platform, K = F.per_1000, CRM = F.crm;
const MB = F.years["myrtle-beach"], NMB = F.years["north-myrtle-beach"];
if (M.program_take_pct !== 38.6 || M.health_club_per_month !== 53 || ST.check !== 66.84 || ST.gross !== 229.95) throw new Error("rows 1 to 3 moved: re-verify");
if (PL.airbnb_single_pct !== 15.5 || PL.vrbo_pct !== 12 || PL.airbnb_split_pct !== 3) throw new Error("rows 11 and 12 moved: re-verify");
if (K.program_manual !== 614 || K.airbnb_single !== 845 || K.vrbo !== 880 || F.break_even_per_1000 !== 231) throw new Error("row 13 moved: re-verify");
if (MB.gross !== 25807 || MB.gap_airbnb_minus_program !== 6597 || NMB.gap_airbnb_minus_program !== 8583) throw new Error("rows 14 and 15 moved: re-verify");
const TAKE = `${M.program_take_pct} percent`, AIR = `${PL.airbnb_single_pct} percent`, VRBO = `${PL.vrbo_pct} percent`;
const CHECK_CENTS = Math.round(ST.check_pct_of_gross); /* 29 cents of each rent dollar (row 3) */
const PCT = (a, b) => Math.round(a / b * 100);
/* Row 25 shares: the first pull (findings.json) and the verifier's live re-count agree to within 0.2 points. */
const MB_PCT = PCT(CRM.city.program["Myrtle Beach"], CRM.city.program["Myrtle Beach"] + CRM.city.not["Myrtle Beach"]);
const NMB_PCT = PCT(CRM.city.program["North Myrtle Beach"], CRM.city.program["North Myrtle Beach"] + CRM.city.not["North Myrtle Beach"]);
if (MB_PCT !== 83 && MB_PCT !== 84) throw new Error(`row 25 Myrtle Beach share moved: ${MB_PCT}`);
if (NMB_PCT !== 76) throw new Error(`row 25 North Myrtle Beach share moved: ${NMB_PCT}`);
const PER_MONTH = money(Math.round(MB.gap_airbnb_minus_program / 12 / 10) * 10); /* $550 (row 31, fix round 1) */
if (PER_MONTH !== "$550") throw new Error("row 31 moved: re-verify");
const MB_PCT_TXT = 83; /* the verifier's live re-count, 83.4 (row 25); the first pull gave 83.5 */
if (Math.round(CRM.pct_in_program / 10) !== 8) throw new Error("row 25: no longer about 8 in 10");

/* Row 29: the building table, from raw/by-building.json. */
const BLD = BYB.buildings;
const B8 = BLD.filter((b) => b.listings >= 8);
const B8_LIST = B8.reduce((t, b) => t + b.listings, 0), B8_PROG = B8.reduce((t, b) => t + b.in_program, 0);
const B8_ALL = B8.filter((b) => b.in_program === b.listings).length;
const B8_MIXED = B8.length - B8_ALL; /* buildings where some condos for sale say they are not in the program (row 29 note, fix round 1) */
if (BLD.length !== 159 || B8.length !== 43 || B8_LIST !== 782 || B8_PROG !== 669 || B8_ALL !== 13 || B8_MIXED !== 30) throw new Error("row 29 moved: re-verify");
/* Names as the listings give them, case tidied; a phase code is shown as the phase. "Mb Resort Rt" is a code, not a name: left out. */
const NAME = {
  "Sand Dunes Phii": "Sand Dunes Phase II", "Bluewater Resort - Hi rise": "Bluewater Resort high rise",
  "Caribbean Oceanfront Suite Tower - PH I": "Caribbean Oceanfront Suite Tower", "Bay Watch PH I - North Tower": "Bay Watch North Tower",
  "Palace, The": "The Palace", "Meridian Pla": "Meridian Plaza", "Grande Cayman Resort (formerly Long Bay Resort)": "Grande Cayman Resort",
};
const SHOWN = BLD.filter((b) => b.listings >= 15 && b.building !== "Mb Resort Rt").sort((a, b) => b.listings - a.listings);
const MBRT = BLD.find((b) => b.building === "Mb Resort Rt");
if (!MBRT || MBRT.listings < 15 || BLD.filter((b) => b.listings >= 15).length !== SHOWN.length + 1) throw new Error("row 29: the left-out listing name changed: rewrite the chart note");
const BUILDINGS_CHART = G.bars(SHOWN.map((b) => ({
  name: NAME[b.building] || b.building, value: Math.round(b.in_program / b.listings * 100),
  valueText: `${b.in_program} of ${b.listings}`, feature: b.city,
})), { caption: "How many condos for sale in each oceanfront building say they are in a rental program", nameLabel: "Building", featureLabel: "city",
  valueLabel: "in a program, of those for sale", max: 100, format: (v) => `${v}%`, compact: true, phoneList: true,
  note: `All ${SHOWN.length} buildings with ${SHOWN.at(-1).listings} or more condos for sale, named as their listings name them. One more listing name, "Mb Resort Rt" (${MBRT.in_program} of ${MBRT.listings}), is not the name of a building, so it is left out. The chart counts what the listings say, not the building's rules.` });
const GRANDE = BLD.find((b) => b.building === "Grande Shores");
if (!B8.every((b) => b.in_program > 0)) throw new Error("row 29: a building with 8+ for sale has none in a program");
if (!GRANDE || GRANDE.listings !== GRANDE.in_program) throw new Error("Grande Shores count changed: rewrite the photo caption");

/* ---------------------------------------------------------------------------- */
/* Links                                                                          */

const CONTACT = "/contact/";
const MANUAL = "https://homesforsalelistings.net/wp-content/uploads/2021/02/kingston-manual.pdf";
const AIR_FEES = "https://www.airbnb.com/help/article/1857";
const AIR_SC = "https://www.airbnb.com/help/article/2328";
const VRBO_FEES = "https://help.vrbo.com/articles/How-is-the-booking-fee-calculated";
const SCDOR = "https://dor.sc.gov/tax/accommodations";
const HC_HOSP = "https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/";
const MB_BL = "https://www.cityofmyrtlebeach.com/careers/business/business_faq.php";
const SC4057 = "https://www.scstatehouse.gov/code/t40c057.php";
const LENDER = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const P527 = "https://www.irs.gov/publications/p527";
const CFR469 = "https://www.law.cornell.edu/cfr/text/26/1.469-5T";
const CFR4691 = "https://www.law.cornell.edu/cfr/text/26/1.469-1T";

/* ---------------------------------------------------------------------------- */
/* Styles for the page's own blocks                                               */

/* Design pass, 2026-11-08 (redo2/invest-rental-program-vs-airbnb/DESIGN.md), after the approved /invest/condos/ pass:
   a two-line headline, a contents list without a card, one card style (the statement, the charts, the calculator,
   the offers), plain tables and lists under thin rules, one block width of 720 px, and on a wide screen the
   statement and the photo beside the text they go with. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const DESIGN_CSS = ""
  /* 1. The headline: the italic line at about half the H1's size; on a phone the tiles are short rows under thin rules. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}${S} .c3-glance span.t{line-height:1.3}}`
  /* 2. The contents list: no card, in columns between two rules, 720 px wide. */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important;max-width:720px!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}`
  /* 3. Tables and lists without cards; on a phone the table rows are plain rows split by a rule. */
  + `${S} .c3-cc{${FLAT};padding:0!important}${S} .c3-cc thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${S} .c3-cc th:first-child,${S} .c3-cc td:first-child{padding-left:0}`
  + `@media (max-width:39.999em){${S} .c3-cc tbody tr{${FLAT};border-top:${RULE}!important;margin:0!important;padding:.7rem 0 .75rem!important}`
  + `${S} .c3-cc tbody tr:last-child{border-bottom:${RULE}!important}${S} .c3-cc th,${S} .c3-cc td{padding-left:0!important;padding-right:0!important}}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  /* 4. One block width. */
  + `${S} .c3-cc,${S} .c3-gchart,${S} figure.c3ph-hero,${S} figure.rp-calc,${S} .rp-year,${S} .rp-lend,${S} .rp-steps,${S} .rp-req,${S} .rp-fees{max-width:720px!important;box-sizing:border-box}`
  /* 5. On a wide screen the statement and the photo sit beside the paragraphs they go with. */
  + `@media (min-width:1100px){${S} .rp-side{display:grid;grid-template-columns:minmax(0,665px) minmax(0,380px);column-gap:2.5rem;align-items:start}`
  + `${S} .rp-side.a{grid-template-rows:auto auto auto 1fr}${S} .rp-side.b{grid-template-rows:auto 1fr}`
  + `${S} .rp-side>*{grid-column:1}${S} .rp-side>figure{grid-column:2;grid-row:1/-1;margin:.3rem 0 1.2rem!important;max-width:none!important;width:100%}}`;

const CSS = `<style>
main#main div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.06rem;padding:.85rem 1.5rem;min-height:52px;display:inline-flex;align-items:center}
/* The closing offer is followed by the homes strip (.hx-wrap), so glass.js's compact rule for the first offer also catches it. Put the dark panel back (as on /invest/rent-prices/; NEEDS.md there). */
main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;display:block!important;padding:2.2rem 1.6rem!important;border-radius:28px!important;margin-left:auto!important;margin-right:auto!important;text-align:center!important}
main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap>*{color:var(--ivory)}
main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap>p{color:rgba(244,239,232,.8)!important}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
/* The homes strip's search box ran past a 320 px window on the sibling pages (critic). */
main#main .hx-fb-ai{max-width:100%;box-sizing:border-box;flex-wrap:wrap;min-width:0}
main#main .hx-fb-ai>.hx-ai-badge{flex-wrap:wrap;white-space:normal;max-width:100%;min-width:0}
main#main .hx-fb-ai>.hx-fb-q{flex:1 1 100%;max-width:100%;min-width:0;flex-wrap:wrap;box-sizing:border-box}
main#main .hx-fb-q textarea{min-width:7.5rem}
main#main .hx-fb-go{max-width:100%}
main#main .rp-card{max-width:560px;margin:1.2rem 0 1.5rem;padding:1.1rem 1.2rem 1rem;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(255,255,255,.62));border:1px solid rgba(255,255,255,.9);box-shadow:0 14px 30px -24px rgba(28,32,40,.45);font-family:var(--sans);color:var(--navy)}
main#main .rp-card .k{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:#8a5226;font-weight:600;margin:0 0 .6rem}
main#main .rp-card dl{margin:0;display:grid}
main#main .rp-card dl>div{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding:.5rem 0;border-bottom:1px dashed rgba(28,32,40,.18)}
main#main .rp-card dl>div.sub{border-bottom:1px solid rgba(28,32,40,.3)}
main#main .rp-card dl>div.sub dt,main#main .rp-card dl>div.sub dd{font-weight:650}
main#main .rp-card dl>div.t{border-bottom:0;border-top:2px solid var(--navy);margin-top:.25rem;padding-top:.65rem}
main#main .rp-card dl>div.t dt{font-weight:700}
main#main .rp-card dl>div.t dd{font-weight:700;color:#8a5226;font-size:1.3rem}
main#main .rp-card dt{margin:0;line-height:1.4;font-size:1rem}
main#main .rp-card dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;font-size:1rem;white-space:nowrap}
main#main .rp-card dd.m{color:#9b2c2c}
main#main .rp-card figcaption{margin:.8rem 0 0;color:var(--muted);font-size:.95rem;line-height:1.5}
main#main .rp-fees{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;max-width:640px;margin:1rem 0 1.3rem;padding:.2rem 0;list-style:none;border-top:1px solid rgba(28,32,40,.16);border-bottom:1px solid rgba(28,32,40,.16)}
main#main .rp-fees li{margin:0;padding:.7rem .7rem;font-family:var(--sans);color:var(--muted);font-size:.95rem;line-height:1.35;text-align:center}
main#main .rp-fees li+li{border-left:1px solid rgba(28,32,40,.16)}
main#main .rp-fees b{display:block;font-family:var(--serif);color:var(--navy);font-size:1.6rem;line-height:1.1;margin-bottom:.25rem}
main#main .rp-steps{list-style:none;counter-reset:s;margin:1rem 0 1.4rem;padding:0;max-width:640px;display:grid;gap:0}
main#main .rp-steps li{counter-increment:s;position:relative;margin:0;padding:.75rem 0 .75rem 2.5rem;border-top:1px solid rgba(28,32,40,.16);font-family:var(--sans);color:var(--navy);line-height:1.45}
main#main .rp-steps li:last-child{border-bottom:1px solid rgba(28,32,40,.16)}
main#main .rp-steps li::before{content:counter(s);position:absolute;left:0;top:.75rem;width:1.6rem;height:1.6rem;border-radius:50%;background:#c4783a;color:#fff;font-size:.9rem;display:flex;align-items:center;justify-content:center}
main#main .c3-glance li,main#main .c3-glance span.t{line-height:1.4}
@media (max-width:480px){main#main .rp-fees{grid-template-columns:1fr;gap:0;padding:0}main#main .rp-fees li{display:flex;align-items:baseline;gap:.8rem;text-align:left;padding:.55rem 0}main#main .rp-fees li+li{border-left:0;border-top:1px solid rgba(28,32,40,.16)}main#main .rp-fees b{display:inline;font-size:1.4rem;min-width:3.6rem;margin:0}}
main#main .rp-req{max-width:760px;display:grid;gap:0;margin:1rem 0 1.4rem;padding:0;list-style:none;border-bottom:1px solid rgba(28,32,40,.16)}
@media (min-width:700px){main#main .rp-req{grid-template-columns:1fr 1fr;column-gap:2rem}}
main#main .rp-req>li{margin:0;padding:.8rem 0 .85rem;border-top:1px solid rgba(28,32,40,.16)}
main#main .rp-req b{display:block;font-family:var(--sans);color:var(--navy);font-size:1.05rem;margin-bottom:.3rem}
main#main .rp-req p{margin:0;color:var(--muted);line-height:1.55}
main#main .rp-calc{margin-left:0;margin-right:0;background:var(--navy);border-radius:16px;padding:1.4rem 1.4rem 1.3rem;margin:1.6rem 0;max-width:600px}
main#main figure.rp-calc{background:var(--navy)!important;border:0!important;box-shadow:0 20px 40px -28px rgba(28,32,40,.6)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;color:var(--ivory);padding:1.4rem 1.3rem 1.3rem!important;border-radius:16px!important;box-sizing:border-box}
main#main .rp-calc .k{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);margin:0 0 .9rem}
main#main .rp-calc label{display:flex;justify-content:space-between;align-items:center;gap:1rem;color:rgba(244,239,232,.92);font-family:var(--sans);font-size:.98rem;line-height:1.35}
main#main .rp-calc .u{white-space:nowrap;color:rgba(244,239,232,.6)}
main#main .rp-calc input{width:118px;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.34);border-radius:8px;color:#f4efe8;font-family:var(--sans);font-size:1rem;padding:.45rem .55rem;text-align:right}
main#main .rp-calc .o{display:flex;justify-content:space-between;gap:1rem;align-items:baseline;font-family:var(--sans);color:rgba(244,239,232,.9);margin-top:.55rem}
main#main .rp-calc .o strong{color:var(--ivory);font-variant-numeric:tabular-nums}
main#main .rp-calc .o.big{border-top:1px solid rgba(244,239,232,.22);margin-top:1rem;padding-top:.9rem}
main#main .rp-calc .o.big strong{color:var(--brass-2);font-family:var(--serif);font-size:1.6rem;line-height:1}
main#main .rp-calc p.v{font-family:var(--sans);color:rgba(244,239,232,.78);line-height:1.55;margin:.7rem 0 0;font-size:.95rem}
@media (max-width:420px){main#main .rp-calc label{flex-direction:column;align-items:flex-start;gap:.3rem}main#main .rp-calc .u{width:100%;display:flex;align-items:center;gap:.35rem;box-sizing:border-box}main#main .rp-calc input{flex:1 1 auto;width:100%;min-width:0;box-sizing:border-box}}
/* Fix round 1: at 320 px the inputs ran 13 px past the panel (critic). Every row stays inside the panel's padding. */
main#main figure.rp-calc{max-width:100%}
main#main .rp-calc .o strong{white-space:nowrap}
main#main .rp-calc>div{grid-template-columns:minmax(0,1fr)}
main#main .rp-calc label{min-width:0;flex-wrap:wrap;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere}
main#main .rp-calc .u{min-width:0;max-width:100%}
main#main .rp-calc input{min-width:0;max-width:100%;box-sizing:border-box}
/* The site header's phone number made the page 1029 px wide in a 1024 px window (critic; shared fix in NEEDS.md item 5). The icon and its label stay. */
@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}
main#main .rp-year{width:100%;max-width:640px;border-collapse:collapse;font-family:var(--sans);font-size:1rem;line-height:1.4;color:var(--navy);margin:1rem 0 1.2rem}
main#main .rp-year caption{caption-side:top;text-align:left;font-weight:600;padding:0 0 .5rem}
main#main .rp-year th,main#main .rp-year td{padding:.6rem .45rem;border-bottom:1px solid rgba(28,32,40,.12);text-align:right;vertical-align:top;font-variant-numeric:tabular-nums}
main#main .rp-year th[scope=row],main#main .rp-year thead th:first-child{text-align:left;padding-left:0;font-weight:500}
main#main .rp-year thead th{border-bottom:2px solid var(--navy);font-weight:650}
@media (min-width:481px){main#main .rp-year td{white-space:nowrap}}
main#main .rp-year tr.t th,main#main .rp-year tr.t td{font-weight:700;border-top:2px solid var(--navy);border-bottom:0;color:#8a5226}
main#main .rp-year tr.t th{color:var(--navy)}
@media (max-width:480px){main#main .rp-year{font-size:.95rem}main#main .rp-year th,main#main .rp-year td{padding:.55rem .3rem}}
main#main .rp-lend{width:100%;max-width:720px;border-collapse:collapse;font-family:var(--sans);font-size:1rem;line-height:1.45;color:var(--navy);margin:1rem 0 1.3rem}
main#main .rp-lend caption{caption-side:top;text-align:left;font-weight:600;padding:0 0 .5rem}
main#main .rp-lend th,main#main .rp-lend td{padding:.6rem .5rem;border-bottom:1px solid rgba(28,32,40,.12);text-align:left;vertical-align:top}
main#main .rp-lend thead th{border-bottom:2px solid var(--navy)}
main#main .rp-lend th[scope=row]{font-weight:650;padding-left:0;width:38%}
@media (max-width:560px){main#main .rp-lend thead{display:none}main#main .rp-lend tr{display:block;padding:.55rem 0;border-bottom:1px solid rgba(28,32,40,.14)}main#main .rp-lend th,main#main .rp-lend td{display:block;border:0;padding:.1rem 0;width:auto}main#main .rp-lend th[scope=row]{width:auto}main#main .rp-lend td::before{content:"Its rules: ";color:#8a5226;font-weight:600}}
${DESIGN_CSS}
</style>`;

/* ---------------------------------------------------------------------------- */
/* Block 1: the fees, and the manual's sample owner statement (rows 1 to 3)       */

const FEES = h.raw(`<ul class="rp-fees" aria-label="The program's three fees on the rent">`
  + `<li><b>${M.management_pct}%</b>management fee</li><li><b>${M.marketing_pct}%</b>marketing fee</li><li><b>${M.inventory_pct}%</b>to replace worn items</li></ul>`);
const neg = (v) => `&minus;${cents(v)}`;
const STATEMENT = h.raw(`<figure class="rp-card" role="group" aria-label="A sample owner statement from the resort's rental desk"><p class="k">Owner statement, one January</p><dl>`
  + `<div><dt>Rent for ${ST.nights} nights</dt><dd>${cents(ST.gross)}</dd></div>`
  + `<div><dt>Management fee, ${M.management_pct}%</dt><dd class="m">${neg(ST.management)}</dd></div>`
  + `<div><dt>Marketing fee, ${M.marketing_pct}%</dt><dd class="m">${neg(ST.marketing)}</dd></div>`
  + `<div class="sub"><dt>After the program's fees</dt><dd>${cents(ST.owner_revenue)}</dd></div>`
  + `<div><dt>Health club</dt><dd class="m">${neg(ST.health_club)}</dd></div>`
  + `<div><dt>Replacing worn items, ${M.inventory_pct}%</dt><dd class="m">${neg(ST.inventory)}</dd></div>`
  + `<div><dt>A repair</dt><dd class="m">${neg(ST.maintenance)}</dd></div>`
  + `<div><dt>The owner's own charges</dt><dd class="m">${neg(ST.personal)}</dd></div>`
  + `<div class="t"><dt>Check to the owner</dt><dd>${cents(ST.check)}</dd></div>`
  + `</dl><figcaption>The rental desk's sample owner statement, redrawn by Chapter3. The owner kept about ${CHECK_CENTS} cents of each rent dollar that month.</figcaption></figure>`);

/* Block 2: what the owner keeps of each $1,000 (row 13). */
const KEEP_CHART = G.bars([
  { name: "Vrbo, run yourself", value: K.vrbo, feature: `Vrbo takes ${PL.vrbo_pct}%` },
  { name: "Airbnb, run yourself", value: K.airbnb_single, feature: `Airbnb takes ${PL.airbnb_single_pct}%` },
  { name: "The rental program", value: K.program_manual, feature: `one resort's desk takes ${M.program_take_pct}%`, reference: true },
], { caption: "What the owner keeps of each $1,000 of rent, before the cleaner and other costs", nameLabel: "Who rents it", featureLabel: "fee",
  valueLabel: "owner keeps", max: 1000,
  note: "The program's figure is before its monthly club fee and its repair charges, so the real difference is larger. Airbnb's figure uses the fee most hosts pay. Vrbo's uses its pay-per-booking fee." });

/* Block 3: the three ways side by side (rows 1, 11, 12, 16, 17). Fix round 1 (all three reviewers, FACT-2, VERIFY row 16):
   the manager's 40 to 60 percent is a share of gross profit, not of the rent, so no percentage is printed in its cell. */
const WAYS = compareCards([
  { name: "The building's rental program", cells: { takes: `${M.program_take_pct}% of rent at one resort, plus fees`, work: "The desk books, cleans, answers guests", tax: "The program pays it" } },
  { name: "Airbnb or Vrbo, run yourself", cells: { takes: `${PL.airbnb_single_pct}% on Airbnb, ${PL.vrbo_pct}% on Vrbo`, work: "You, a cleaner and a handyman", tax: "The site pays it on its bookings" } },
  { name: "A local vacation rental manager", cells: { takes: "A share of the profit, not of the rent", work: "The manager: guests, taxes, repairs", tax: "The manager pays it when it books" } },
], [{ key: "takes", label: "What it keeps" }, { key: "work", label: "Who runs it day to day" }, { key: "tax", label: "Who pays the state tax" }],
{ caption: "Three ways to rent an oceanfront condo", nameLabel: "The way" });

/* Block 4: the year both ways (rows 14, 15). */
const YEAR = h.raw(`<table class="rp-year"><caption>One year on the average short-term rental's bookings</caption><thead><tr><th scope="col">The year</th><th scope="col">Myrtle Beach</th><th scope="col">North Myrtle Beach</th></tr></thead><tbody>`
  + `<tr><th scope="row">Bookings in a year</th><td>${money(MB.gross)}</td><td>${money(NMB.gross)}</td></tr>`
  + `<tr><th scope="row">The program's terms: less ${M.program_take_pct}% and $${M.health_club_per_month} a month</th><td>about ${r100(MB.program_after_fees_and_club)}</td><td>about ${r100(NMB.program_after_fees_and_club)}</td></tr>`
  + `<tr><th scope="row">Airbnb: less ${PL.airbnb_single_pct}%</th><td>about ${r100(MB.airbnb_after_fee)}</td><td>about ${r100(NMB.airbnb_after_fee)}</td></tr>`
  + `<tr class="t"><th scope="row">Left to pay the cleaner, supplies and your time</th><td>about ${r100(MB.gap_airbnb_minus_program)}</td><td>about ${r100(NMB.gap_airbnb_minus_program)}</td></tr>`
  + `</tbody></table>`);

/* Block 5: the calculator. Defaults are the Myrtle Beach year (rows 1, 2, 11, 14); the owner's own costs start at 0. */
const fld = (id, label, v, unit, step) => `<label>${label}<span class="u">${unit === "$" ? "$ " : ""}<input id="${id}" type="number" min="0" step="${step}" value="${v}" oninput="c3Rp()" aria-label="${label}">${unit === "%" ? " %" : ""}</span></label>`;
const CALC = `<figure class="rp-calc" role="group" aria-label="Run your own year: the program against running it yourself"><p class="k">Run your own year</p><div style="display:grid;gap:.75rem">`
  + fld("rpGross", "Bookings in a year", MB.gross, "$", 500)
  + fld("rpShare", "The program's share", M.program_take_pct, "%", 0.1)
  + fld("rpMonthly", "The program's monthly charges", M.health_club_per_month, "$", 1)
  + fld("rpFee", "The booking site's fee", PL.airbnb_single_pct, "%", 0.1)
  + fld("rpClean", "Cleaner, linens, supplies, a year", 0, "$", 100)
  + fld("rpHours", "Your hours a month", 0, "", 1)
  + `</div>`
  + `<div class="o"><span>Program pays you</span><strong id="rpProg">${money(MB.program_after_fees_and_club)}</strong></div>`
  + `<div class="o"><span>Running it yourself pays you</span><strong id="rpSelf">${money(MB.airbnb_after_fee)}</strong></div>`
  + `<div class="o big"><span>Difference</span><strong id="rpGap">${money(MB.gap_airbnb_minus_program)}</strong></div>`
  + `<p class="v" id="rpSay">Running it yourself keeps ${money(MB.gap_airbnb_minus_program)} more before your cleaner and supplies. The bookings already hold the cleaning fees guests pay. Enter what you would pay out, and your hours.</p></figure>`
  + `<script>function c3Rp(){var g=function(id){var e=document.getElementById(id);var v=e?parseFloat(e.value):NaN;return isFinite(v)&&v>0?v:0};`
  + `var m=function(n){return (n<0?"-":"")+"$"+Math.round(Math.abs(n)).toLocaleString("en-US")};`
  + `var P=document.getElementById("rpProg"),S=document.getElementById("rpSelf"),D=document.getElementById("rpGap"),Y=document.getElementById("rpSay");if(!P||!S||!D||!Y)return;`
  + `var gr=g("rpGross"),sh=Math.min(g("rpShare"),100),mo=g("rpMonthly"),fe=Math.min(g("rpFee"),100),cl=g("rpClean"),hr=g("rpHours");`
  + `var prog=gr*(1-sh/100)-12*mo,self=gr*(1-fe/100)-cl,gap=self-prog;P.textContent=m(prog);S.textContent=m(self);D.textContent=m(gap);`
  + `if(!gr){Y.textContent="Enter the bookings for a year.";return}`
  + `if(gap<=0){Y.textContent="The program pays you more at these numbers.";return}`
  + `Y.textContent=hr>0?"Running it yourself keeps "+m(gap)+" more, about "+m(gap/(hr*12))+" for each hour of your time.":"Running it yourself keeps "+m(gap)+" more"+(cl?"":" before your cleaner and supplies. The bookings already hold the cleaning fees guests pay")+". Enter your hours to see it per hour."}`
  + `document.addEventListener("DOMContentLoaded",c3Rp);</script>`;

/* Block 6: leaving the program (row 5). */
const LEAVE = h.raw(`<ol class="rp-steps" aria-label="How an owner left the resort's rental program">`
  + `<li>Written notice at least 90 days ahead.</li>`
  + `<li>The desk took out its hotel items, such as the vacuum, linens and towels, and did a final cleaning.</li>`
  + `<li>It turned off the keycard lock and had a locksmith rekey the door, so the unit had its own lock again.</li>`
  + `<li>Any balance was due within 10 days of the final statement.</li></ol>`);

/* Block 7: what the program required (row 6, corrected wording). */
const REQ = h.raw(`<ul class="rp-req" aria-label="What the program required">`
  + `<li><b>Locks and phone</b><p>A keycard lock on the resort's key system, and a phone line with voicemail through the phone service the program named.</p></li>`
  + `<li><b>Beds</b><p>A queen sleeper sofa. A king bed in the main bedroom and two queens in each guest room, where they fit.</p></li>`
  + `<li><b>Dishes</b><p>Winter Frost White Corelle plates, Chivalry glasses by Libby and Allison flatware by Rogers.</p></li>`
  + `<li><b>TV</b><p>A flat screen of at least 42 inches in the living room.</p></li>`
  + `<li><b>Updates</b><p>Units were expected to be updated at least once every ten years. A unit came off the program if work rated below standard was not done in time.</p></li>`
  + `<li><b>Insurance</b><p>Liability cover of at least $500,000, carried by the owner.</p></li>`
  + `</ul>`);

/* Block 8: the lender's list against the manual (rows 8, 9). */
const LEND = h.raw(`<table class="rp-lend"><caption>Hotel services lenders list, and the rental desk's own rules</caption><thead><tr><th scope="col">What lenders list</th><th scope="col">The rental desk's rules</th></tr></thead><tbody>`
  + `<tr><th scope="row">Registration at a front desk</th><td>Owners were asked to check in at the hotel front desk like any guest.</td></tr>`
  + `<tr><th scope="row">A central key system</th><td>Every unit on the rental program had a keycard lock on the resort's key system.</td></tr>`
  + `<tr><th scope="row">A central phone service</th><td>Phones ran through the phone service the program named.</td></tr>`
  + `<tr><th scope="row">Limits on decorating</th><td>A full section of decorating rules, down to the dishes.</td></tr>`
  + `</tbody></table>`);

/* Block 9: who pays the state tax (row 17). */
const TAX = compareCards([
  { name: "The program books the guest", cells: { tax: "The program collects and pays it", lic: "None needed" } },
  { name: "Airbnb or Vrbo books the guest", cells: { tax: "The site pays it on the full booking", lic: "None needed" } },
  { name: "You book the guest yourself", cells: { tax: "You collect and pay it", lic: "A state retail license, see below" } },
], [{ key: "tax", label: "The state's tax on the stay" }, { key: "lic", label: "Your state license" }],
{ caption: "Who pays South Carolina's tax on a short stay", nameLabel: "Who books it" });

/* Block 10: the decision (rows 4, 7, 8, 10, 15, stories str-cheapest-cleaner). Described by use, never by who the owner is. */
const DECIDE = compareCards([
  { name: "You want no guest calls and live out of state", cells: { usually: "The rental program", why: "Staff on site book and clean" } },
  { name: "You will answer guests and have a cleaner you trust", cells: { usually: "Airbnb or Vrbo, run yourself", why: "You keep the difference for that work" } },
  { name: "You want to stay in the condo often", cells: { usually: "Run it yourself, if the building allows", why: "Program stays went through the office" } },
  { name: "You need a standard loan", cells: { usually: "A building without hotel-style services", why: "Hotel services block many standard loans" } },
  { name: "The building requires its program", cells: { usually: "Price it with the share taken out", why: "Every rental there goes through it" } },
], [{ key: "usually", label: "Usually" }, { key: "why", label: "Why" }], { caption: "Which way fits how you will use the condo", nameLabel: "If" });

/* Photo */
const RESORT = PH.findPhoto(PHOTOS, "oceanfront-resort-from-the-beach");
const RESORT_CAP = `Grande Shores, an oceanfront condo resort in Myrtle Beach, from the beach. When we counted, all ${GRANDE.listings} of its condos for sale said they were in a rental program.`;
const photo = (rec, cap, mw = "640px") => PH.heroPhoto(rec, { alt: rec.alt, caption: cap, maxWidth: mw, sizes: `(max-width: 680px) 100vw, ${mw}` })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: RESORT, caption: "An oceanfront condo resort in Myrtle Beach, from the beach" }]);

/* ---------------------------------------------------------------------------- */
/* The page                                                                       */

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Myrtle Beach Condo Rental Program vs Airbnb: What You Keep",
  description: `One Myrtle Beach rental program kept ${M.program_take_pct}% of the rent; Airbnb takes ${PL.airbnb_single_pct}%. See a real owner statement, a year both ways and the buildings with programs.`,
  ogTitle: "Rental program or Airbnb for a Myrtle Beach condo: what you keep, both ways",
  /* Share image: a 1200 x 630 crop of the page's photo (the source is 1280 px wide, too small for
     photos.js crops, so there is no pageImages set; a larger copy is on the photo partner's list). */
  ogImage: "https://chapter3realty.com/images/2026-11-a/invest-rental-program-vs-airbnb/oceanfront-resort-share.jpg",
  ogImageAlt: "An oceanfront condo resort with rows of balconies, seen from the beach at dusk",
  crumb: "Rental program vs Airbnb",
  eyebrow: "Oceanfront condos",
  h1: "Rental program or Airbnb for a Myrtle Beach condo?",
  h1em: "What you keep, both ways.",
  sub: `One Myrtle Beach resort's rental desk kept ${TAKE} of the rent. Airbnb takes ${AIR} from most hosts.`,
  heroMedia: glance([
    { icon: "dollar", label: `${M.program_take_pct}%`, text: "one resort's rental desk" },
    { icon: "home", label: `${PL.airbnb_single_pct}%`, text: "Airbnb, most hosts" },
    { icon: "key", label: "8 in 10", text: "oceanfront condos for sale in a program" },
  ]),
  heroCta: { title: "Know what the rental desk keeps before you buy.", label: "Have us run it both ways", href: CONTACT },
  author: "devin",
  shortAnswer: [
    `One oceanfront Myrtle Beach resort's rental desk kept ${TAKE} of the rent, before its other charges. Airbnb now takes ${AIR} from most hosts, and Vrbo takes ${VRBO}.`,
    `Of each $1,000 guests paid, that desk left the owner ${money(K.program_manual)}. Airbnb leaves ${money(K.airbnb_single)}. Running it yourself keeps more while the cleaner, supplies and your time cost less than ${money(F.break_even_per_1000)} of each $1,000.`,
    `A rental program is the building's own rental desk. It books the guests, cleans the unit and sends you the rest. We get the building's program agreement and owner statements and run it both ways before you offer.`,
  ],
  sections: [
    { h2: "How much does a rental program take in Myrtle Beach?", toc: "What a program takes", id: "what-it-takes", html: () =>
      CSS +
      h.p(`One large oceanfront Myrtle Beach resort's rental desk took about 4 of every 10 rent dollars, then billed the owner for more. Its written rules set three fees on the gross rent, meaning all the rent guests paid:`) +
      `<div class="rp-side a">` +
      FEES +
      h.p(`It also charged a health club fee of $${M.health_club_per_month} a month plus tax. It billed repairs job by job, and added a handling fee when it paid an outside contractor's bill for the owner. It asked the owner's approval for any single repair over $500, unless the owner could not be reached or an emergency could not wait.`) +
      h.p(`Its sample owner statement shows what was left. In one slow January, the unit rented ${ST.nights} nights for ${cents(ST.gross)}. The owner's check was ${cents(ST.check)}.`) +
      STATEMENT +
      h.p(`The statement's only income line is the room rent for the nights booked. It has no line for the cleaning fees guests pay.`) +
      `</div>` },

    { h2: "Which keeps more: the program, Airbnb or Vrbo?", toc: "Program vs Airbnb", id: "which-keeps-more", html: (bg) =>
      h.p(`Running it yourself on Airbnb or Vrbo keeps more of each booking, before you pay for the work. Airbnb is moving every home host to one fee, and most hosts pay ${AIR}. Its old 3 percent host fee is being phased out. Vrbo takes ${VRBO} of the rent and the cleaning fee.`) +
      KEEP_CHART +
      h.p(`The difference, ${money(F.break_even_per_1000)} of each $1,000, pays for the work the desk did: the cleaner, linens, supplies and answering guests. If those cost you less, running it yourself keeps more.`) +
      WAYS +
      h.p(`A local manager is a third way. Full service here covers marketing, guest messages, the books, taxes and repairs. In what we see, managers price it as a share of gross profit, not of the rent. Its percentage cannot be set beside the shares above. What managers here charge is on our ${h.a("/invest/property-management/", "property management page")}.`) +
      h.p(`The worst mistake we see when owners run it themselves is the cheapest cleaner. Owners who hired one have had theft and damage.`) +
      h.cta("How does your building's program compare?", "Send us the building. We get its program agreement and owner statements and lay one year both ways side by side.", "Send us the building", CONTACT, bg) },

    { h2: "What does a year look like both ways?", toc: "A year, both ways", id: "a-year", html: () =>
      h.p(`On the bookings of the average Myrtle Beach short-term rental, that desk's terms pay the owner about ${r100(MB.gap_airbnb_minus_program)} a year less than Airbnb. That is about ${PER_MONTH} a month. It has to pay the cleaner and supplies, and the rest is what your time earns.`) +
      YEAR +
      h.p(`The table gives both ways the same bookings. Both also pay the same homeowners association (HOA) fee, property tax, insurance and utilities, so it compares only the fees. This is the average listing, not a promise of income.`) +
      h.p(`The bookings include the cleaning fees guests pay. On Airbnb or Vrbo, you set that fee, and it comes to you with the rent, less the site's fee. The resort desk's statement showed room rent only. The table still counts the cleaning fees on the program side, which favors the program.`) +
      h.p(`Put in your own numbers below. Start with what a cleaner, linens and supplies would cost you in a year, and the hours you would spend each month.`) +
      CALC +
      h.p(`For a full estimate of a self-managed rental, with the taxes by town, use our ${h.a("/invest/str-tools/", "short-term rental calculator")}. What rentals here earn is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}.`) },

    { h2: "Which Myrtle Beach buildings have rental programs?", toc: "Buildings with programs", id: "buildings", html: (bg) =>
      h.p(`About 8 in 10 condos for sale in Horry County's oceanfront buildings say the unit is in a rental program. That is about ${MB_PCT_TXT} percent in Myrtle Beach and about ${NMB_PCT} percent in North Myrtle Beach. Every one of the ${B8.length} oceanfront buildings with 8 or more condos for sale has units listed in a program.`) +
      `<div class="rp-side b">` +
      photo(RESORT, RESORT_CAP) +
      h.p(`Their listings give ${BLD.length} building names. The chart shows the buildings with ${SHOWN.at(-1).listings} or more condos for sale. In ${B8_ALL} of the ${B8.length} buildings with 8 or more for sale, every unit for sale says it is in a program.`) +
      h.p(`In the other ${B8_MIXED}, some condos for sale do not say they are in one. That is what the ads say, not the building's rules.`) +
      `</div>` +
      BUILDINGS_CHART +
      h.p(`Program condos are smaller and cheaper. About half ask $200,000 or less, against about 3 in 10 of the rest. About 4 in 10 have two bedrooms or more, against about 6 in 10 of the rest.`) +
      h.p(`They are also run more like hotel rooms. About 6 in 10 say the HOA fee pays the electric bill, against about a third of the rest. Nearly all are sold furnished.`) +
      h.p(`What a condo's ad says is not the building's rules. The building's recorded documents say whether its program is required. HOA fees by building are on our ${h.a("/invest/condo-buildings/", "oceanfront condo buildings page")}.`) +
      h.cta("Looking at one of these buildings?", "Tell us which one. We pull its program terms and run the year both ways for the condo you like.", "Ask us about a building", CONTACT, bg) },

    { h2: "Can you leave the program or list on Airbnb too?", toc: "Leaving the program", id: "leaving", html: () =>
      h.p(`Not both at once at that resort. Its desk was the owner's only rental agent and collected all the rent. Booking your own guests and keeping the money broke the agreement.`) +
      h.p(`An owner who booked a guest through the management office earned a referral commission instead, 20 percent of the nightly rate in most months.`) +
      h.p(`Leaving took about three months:`) +
      LEAVE +
      h.p(`After the rekey, the door is yours again. You choose how your own guests get in.`) },

    { h2: "What does the program make you buy and keep up?", toc: "What it requires", id: "standards", html: (bg) =>
      h.p(`A unit furnished like a hotel room, to the desk's standard, down to the dishes:`) +
      REQ +
      h.p(`A unit you run yourself has no such list. When we run the numbers on a program unit, we add what its furnishing rules will cost.`) +
      h.cta("Want the program's rules read before you sign?", "Send us the listing. We get the agreement, read the exit, owner-stay and furnishing rules, and tell you what they cost.", "Have us read the agreement", CONTACT, bg) },

    { h2: "Can you still use your own condo?", toc: "Your own stays", id: "own-use", html: () =>
      h.p(`Yes, but in a program you book it like a guest. At that resort, owners booked their own stays through the management office, Monday to Friday, 8 to 5. They were asked to check in at the hotel front desk like any guest. The rules set no cap on owner nights.`) +
      h.p(`Running it yourself, you block your own dates on the calendar.`) +
      h.p(`Either way, the IRS limits your own days. The limit is the greater of 14 days or 10 percent of the days the condo is rented at a fair price. Days your family uses it count too.`) +
      h.p(`Go over the limit, and the IRS counts the condo as a home, which limits a rental loss. More on our ${h.a("/invest/14-day-rule/", "14-day rule page")}.`) },

    { h2: "Does a rental program change the loan?", toc: "The loan", id: "loan", html: (bg) =>
      h.p(`For many conventional loans, lenders look at the building, not at whether you join its program. Many conventional loans, the standard mortgages, are not made on any unit in a building run like a hotel. That includes a unit you run on Airbnb yourself.`) +
      h.p(`Lenders list what makes a building ineligible. One is rules that make owners rent their units through the building's program, limit when owners may stay, or make owners share rental profit with the manager.`) +
      h.p(`Hotel services count as well: registration at a front desk, daily cleaning, a central phone, central keys and limits on decorating. A name that says hotel, motel or resort counts too, unless the word only refers to the building's past use. Marketing as a hotel, resort or investment counts as well.`) +
      h.p(`Four of those hotel services were written into that resort desk's rules:`) +
      LEND +
      h.p(`In what we see, buildings with a rental program usually do not qualify for standard loans, because so many owners are investors. Lenders call these buildings non-warrantable. That many investors also shows the building is run for renting.`) +
      h.p(`The loans that work there are on our ${h.a("/invest/condotel-financing/", "condotel financing")} and ${h.a("/invest/non-warrantable-condos/", "non-warrantable condos")} pages.`) +
      h.cta("Will a standard loan work in this building?", "Tell us the building. We read its documents against the lenders' list before you make an offer.", "Have us review the building's loan rules", CONTACT, bg) },

    { h2: "Who pays the lodging taxes in each case?", toc: "Taxes", id: "taxes", html: () =>
      h.p(`Whoever books the stay and takes the payment collects and pays South Carolina's tax on it. That is the state's 5 percent sales tax and 2 percent accommodations tax, the tax on short stays.`) +
      TAX +
      h.p(`The exception: an owner who books guests directly needs no retail license if the condo is rented no more than one week in each calendar quarter. That owner still files and pays the tax once a year.`) +
      h.raw(`<ul class="rp-req" aria-label="Other taxes and licenses on a short stay">`
        + `<li><b>What else Airbnb collects</b><p>The county's and the cities' taxes on the stay, and the local sales taxes the state collects for them. The host handles any other tax.</p></li>`
        + `<li><b>The county's hospitality fee</b><p>3 percent of the rent outside city limits and 1.5 percent inside. When a manager books the stay, the county tells the owner to make sure the manager pays it.</p></li>`
        + `<li><b>Long stays</b><p>A stay of 90 days or more in a row by the same guest owes no hospitality fee.</p></li>`
        + `<li><b>The city license</b><p>Inside Myrtle Beach city limits, every rental property needs a city business license, short-term or long-term.</p></li></ul>`) +
      h.p(`The totals by town are on our ${h.a("/invest/accommodations-tax/", "accommodations tax page")}.`) },

    { h2: "Who may run a Myrtle Beach rental for you?", toc: "Who may run it", id: "license", html: () =>
      h.p(`You, or someone with a South Carolina real estate license. An owner renting his own condo needs no license.`) +
      h.p(`Anyone paid to list it or rent it out for you must be licensed as a property manager or broker. That covers a paid Airbnb co-host, a helper who lists your condo or arranges its rentals. Chapter3 does not manage rentals.`) +
      h.p(`Whether you or a manager runs the rental also changes your tax result. How is on our ${h.a("/invest/str-tax-treatment/", "rental tax page")}.`) },

    { h2: "Program or Airbnb: which fits your condo?", toc: "Which fits you", id: "which-fits", html: () =>
      h.p(`The program fits an owner who wants no work, and running it yourself fits an owner who will do the work. About 58 percent of Horry County condo units mail their tax bill outside South Carolina. For an owner who lives out of state, the desk's share pays for someone on site. ${h.a("/invest/out-of-state/", "How to buy a Myrtle Beach rental from out of state")}, without flying in, is on its own page.`) +
      DECIDE +
      h.p(`Whether nightly guests beat a yearly lease is on our ${h.a("/invest/str-vs-ltr/", "short-term against long-term rental page")}.`) },
  ],
  faqTitle: "Rental program FAQ",
  faq: [
    { q: "How much do rental programs charge in Myrtle Beach?", a: `One oceanfront resort's rental desk took ${TAKE} of the rent, plus a monthly health club fee and repairs. In its sample statement the owner kept about ${CHECK_CENTS} cents of each rent dollar. Airbnb takes ${AIR} from most hosts.` },
    { q: "Does Airbnb still charge hosts 3 percent?", a: `Airbnb's 3 percent host fee is being phased out. Airbnb is moving every home host to one fee, and most hosts pay ${AIR}. Vrbo charges ${VRBO}.` },
    { q: "Can I use Airbnb while I am in the program?", a: "Not at the resort whose rules this page shows. Its desk was the only rental agent, and booking your own guests broke the agreement. Leaving took 90 days' notice." },
    { q: "Who pays the accommodations tax when the program books the guest?", a: "The program, because it takes the payment. If you book a guest yourself, you collect and pay that stay's tax." },
    { q: "Does joining a rental program affect my loan?", a: "For many standard loans, the lender looks at the building, not at whether you join. Many standard loans are not made on any unit in a building run like a hotel. Signs are a front desk, central keys or rules on when owners may stay." },
    { q: "Do I need a license to rent out my own condo?", a: "No real estate license. Anyone paid to list or rent it for you needs one. Inside Myrtle Beach city limits, every rental also needs a city business license." },
  ],
  sources: [
    { name: "Kingston Resorts owner manual, 2017 copy", href: MANUAL },
    { name: "Airbnb host fees", href: AIR_FEES },
    { name: "Airbnb taxes in South Carolina", href: AIR_SC },
    { name: "Vrbo booking fee", href: VRBO_FEES },
    { name: "SCDOR accommodations tax", href: SCDOR },
    { name: "County hospitality fee", href: HC_HOSP },
    { name: "Myrtle Beach business licenses", href: MB_BL },
    { name: "SC Code 40-57", href: SC4057 },
    { name: "Lender project rules", href: LENDER },
    { name: "IRS Publication 527", href: P527 },
    { name: "26 CFR 1.469-1T", href: CFR4691 },
    { name: "26 CFR 1.469-5T", href: CFR469 },
  ],
  sourcesNote: "Program terms: one oceanfront resort's owner manual. Bookings: AirROI, past 12 months, average listing. Buildings: our count of condos for sale in Horry County oceanfront buildings. Not tax or legal advice.",
  afterSources: () => CREDITS + PH.imageSchema([RESORT]),
  bottomCta: { h2: "Put the program's statement next to an Airbnb year.", p: "Send us the listing or the building. We get the agreement and the owner statements, run the year both ways, and show you what you would keep.", label: "Send us the listing", href: CONTACT },
  keywords: "Myrtle Beach condo rental program vs Airbnb, rental program fees Myrtle Beach, condo hotel rental program, rental pool agreement, Airbnb host fee 15.5, Vrbo host fee, self managing Airbnb Myrtle Beach, oceanfront condo rental program, condotel Myrtle Beach",
  about: "Condo rental programs against self-managing on Airbnb or Vrbo for an oceanfront condo in Myrtle Beach and North Myrtle Beach, South Carolina",
});
