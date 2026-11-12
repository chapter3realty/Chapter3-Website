/* /hoa/special-assessments/ - condo special assessments on the Grand Strand: what one is, how big they get,
 * how the bill is split, why older buildings here need them, whether the board needs a vote, how we spot one
 * before an offer, who pays at closing, loans, not paying (with one line on tax; /hoa/tax-deductible/ owns that question).
 *
 * Batch 2026-10-d, Lane U. The page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-10-d/hoa-special-assessments/facts.md (verified rows, and corrected rows only
 * in the verifier's approved wording, VERIFY.md). Struck wording: hoa-special-assessments-struck.json.
 * Charts and tables are built here from data/2026-10-d/hoa-special-assessments/ (website working copy), never typed:
 *   worked-example.json  the labelled 120-unit example (row 5)
 *   listing-ages.json    condos for sale by year built (row 10; the CRM's active listings, counted only)
 *   eul-subset.json      HUD planning lives (row 11)
 *   scdca-counts.json    SC Consumer Affairs HOA complaints (rows 30 and 31; one share in the text, no chart)
 * Round 3 cut the lien chart (row 26) and the complaints chart: the owner and the reader found no meaning in them
 * for a buyer. Row 26's count stays in the ledger for /hoa/liens-and-foreclosure/.
 * Kept from the live page: the title words, the breadcrumb, the idea of "how to spot one before you make an
 * offer" (now what we read, from rows 11 to 16), the who-pays-at-sale point (now with 27-31-200 and -220 under
 * it), the offer "Have us check a building", the FAQ questions, the links to reserves, selling a condo and
 * non-warrantable condos. Cut: the "%s" document box, the four repeated calls, "into the thousands per unit",
 * the typed dates, and the unsourced lines on insurance premiums, 2021 safety scrutiny and "never a surprise".
 * Sibling owners: /hoa/reserves/ (reserve studies), /hoa/liens-and-foreclosure/ (lien steps),
 * /hoa/master-insurance-ho6/ (what an owner's policy pays), /hoa/tax-deductible/ (tax detail),
 * /invest/non-warrantable-condos/ (lender detail).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/special-assessments/";
const DIR = path.join(__dirname, "..", "data", "2026-10-d", "hoa-special-assessments");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const WX = read("worked-example.json"), AGES = read("listing-ages.json"), EUL = read("eul-subset.json"), DCA = read("scdca-counts.json");

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const MIL = (v) => `$${v / 1e6} million`;
const pct = (a, b) => Math.round(a / b * 100);
const YEAR = new Date().getFullYear();

/* ---- Row 5: the worked example, checked against the ledger. ---- */
if (WX.building_units !== 120 || WX.repair_cost !== 1200000 || WX.reserve_on_hand !== 300000 || WX.shortfall !== 900000 || WX.average_per_unit !== 7500)
  throw new Error("worked-example.json no longer gives the ledger's row 5");
if (WX.rows.reduce((t, r) => t + r.share * r.count, 0) !== WX.shortfall) throw new Error("the example's shares do not add back to the shortfall");
/* Names never break at the hyphen (critic, round 2: "One- / bedroom" at 320 px). */
const UNIT_NAME = { "1-bedroom": "One\u2011bedroom", "2-bedroom": "Two\u2011bedroom", "3-bedroom": "Three\u2011bedroom" };
const NW = (t) => `<span style="white-space:nowrap">${t}</span>`;
const EXAMPLE = `<div class="sa-ex">` + h.table(["Unit", "Bill"],
  WX.rows.map((r) => [`<strong style="color:var(--navy)">${NW(UNIT_NAME[r.unit])}</strong><br>${n0(r.count)} units at ${r.percent}%`, `<strong style="color:var(--navy)">${money(r.share)}</strong>`])
    .concat([[`<strong style="color:var(--navy)">${NW(`All ${WX.building_units} units`)}</strong><br>${n0(WX.percent_total)}% together`, `<strong style="color:var(--navy)">${money(WX.shortfall)}</strong>`]])) + `</div>`;
const SHARE_LO = Math.min(...WX.rows.map((r) => r.share)), SHARE_HI = Math.max(...WX.rows.map((r) => r.share));
if (SHARE_LO !== 5850 || SHARE_HI !== 10350) throw new Error("worked-example.json shares are not row 5's");

/* ---- Row 10: condos for sale by the year the building was built. ---- */
const ALL = AGES.rows.find((r) => r.city === "(all)"), MB = AGES.rows.find((r) => r.city === "Myrtle Beach"), NMB = AGES.rows.find((r) => r.city === "North Myrtle Beach");
const band = (row, b) => row.bands.find((x) => x.band === b).count;
const before = (row, bs) => bs.reduce((t, b) => t + band(row, b), 0);
const PRE2000 = ["before 1980", "1980 to 1989", "1990 to 1999"], PRE1990 = ["before 1980", "1980 to 1989"], SINCE2010 = ["2010 to 2019", "2020 or later"];
if (ALL.all !== 2866 || before(ALL, PRE2000) !== 1865 || before(ALL, PRE1990) !== 1308 || before(ALL, SINCE2010) !== 121) throw new Error("listing-ages.json no longer gives the ledger's row 10");
if (pct(before(MB, PRE2000), MB.all) !== 72 || pct(before(NMB, PRE2000), NMB.all) !== 46) throw new Error("listing-ages.json: the city shares are not the ledger's row 10");
/* HUD lives (row 11), merged where two parts share a plain name and a life (the two flat roofs). */
const LIFE = {};
for (const r of EUL.rows) {
  const k = /^Flat roof/.test(r.plain) ? "Flat roof" : r.plain;
  if (LIFE[k] !== undefined && LIFE[k] !== r.years_family) throw new Error(`two lives for ${k}`);
  LIFE[k] = r.years_family;
}
if (LIFE["Shingle roof"] !== 20 || LIFE["Elevator machinery"] !== 20 || LIFE["Aluminum windows"] !== 35 || LIFE["Flat roof"] !== 15) throw new Error("eul-subset.json is not the ledger's row 11");
const BANDS = [
  ["before 1980", "Built before 1980", 1979], ["1980 to 1989", "Built in the 1980s", 1989], ["1990 to 1999", "Built in the 1990s", 1999],
  ["2000 to 2009", "Built in the 2000s", 2009], ["2010 to 2019", "Built in the 2010s", 2019], ["2020 or later", "Built in 2020 or later", YEAR],
];
const AGE_CHART = G.bars(BANDS.map(([b, name, last]) => {
  const c = band(ALL, b);
  return { name, value: pct(c, ALL.all), valueText: `${pct(c, ALL.all)}%` };
}), { caption: "Most condos for sale here are in buildings built before 2000", nameLabel: "Year built", valueLabel: "share of condos for sale", format: (v) => `${v}%`, compact: true,
  note: "Our count of the condos for sale in the local listing service (MLS), by the year built each listing gives. A building's parts may have been replaced since." });
/* "About two in three" (owner, round 3: one number per point). */
const PRE2000_PCT = pct(before(ALL, PRE2000), ALL.all);
if (PRE2000_PCT < 63 || PRE2000_PCT > 70) throw new Error("the share built before 2000 is no longer about two in three; rewrite the building-age answer");
const AGE_99 = YEAR - 1999, AGE_89 = YEAR - 1989;
/* Six parts a buyer can picture (owner, round 1: no building bars among the parts). */
const KEY_PARTS = ["Flat roof", "Shingle roof", "Elevator machinery", "Aluminum windows", "Concrete or steel balconies", "Metal railings"];
const LIFE_ROWS = KEY_PARTS.map((name) => { if (LIFE[name] === undefined) throw new Error(`eul-subset.json has no ${name}`); return { name, value: LIFE[name], valueText: `${LIFE[name]} years` }; })
  .sort((a, b) => a.value - b.value);
if (!(AGE_89 >= LIFE["Aluminum windows"])) throw new Error("a 1989 building is no longer past HUD's window life; rewrite the sentence under the chart");
const LIFE_CHART = G.bars(LIFE_ROWS, { caption: "How many years HUD plans for each building part to last", nameLabel: "Building part", valueLabel: "years", format: (v) => `${v} years`, compact: true,
  note: "HUD's estimated useful life table for family housing." });

/* ---- Rows 30 to 32: complaints. ---- */
const R26 = DCA.reports["2026"], R25 = DCA.reports["2025"];
if (R26.statewide.complaints !== 452 || R26.horry.complaints !== 140 || R26.statewide.fees_special_assessments !== 76 || R26.horry.fees_special_assessments !== 30 || R25.horry.fees_special_assessments !== 12)
  throw new Error("scdca-counts.json is not the ledger's rows 30 to 32");
/* Row 31: 30 of 76 is 39.5 percent, said as "2 in 5" (owner, round 3: one number per point, no chart). */
const FEES_SHARE = "2 in 5";
if (Math.abs(R26.horry.fees_special_assessments / R26.statewide.fees_special_assessments - 0.4) > 0.02) throw new Error("Horry's share of fee complaints is no longer about 2 in 5");
/* ---- The page's own blocks: the payment order, the case, the calculator, the words list. ---- */
const CSS = "<style>"
  /* Design pass, 2026-11-08 (redo3/hoa-special-assessments/DESIGN.md): the payment order as three plain columns under
     a rule, step 3 with a brass top rule and dot instead of an outline. */
  + "main#main .sa-flow{list-style:none;margin:1.4rem 0 .6rem;padding:0;display:grid;column-gap:1.6rem;max-width:720px}"
  + "@media (min-width:760px){main#main .sa-flow{grid-template-columns:repeat(3,minmax(0,1fr))}}"
  + "main#main .sa-flow li{margin:0;padding:.85rem 0 .9rem;border-top:1px solid rgba(28,32,40,.16);display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:.7rem;align-content:start}"
  + "@media (max-width:759px){main#main .sa-flow li:last-child{border-bottom:1px solid rgba(28,32,40,.16)}}"
  + "main#main .sa-flow li.sa-you{border-top:2px solid var(--brass)}"
  + "main#main .sa-flow .sa-n{grid-row:1/3;display:inline-flex;align-items:center;justify-content:center;width:1.9rem;height:1.9rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem}"
  + "main#main .sa-flow li.sa-you .sa-n{background:var(--brass)}"
  + "main#main .sa-flow b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.3;margin:.2rem 0 .25rem}"
  + "main#main .sa-flow span.t{display:block;color:var(--muted);line-height:1.55}"
  + "main#main .sa-cap{color:var(--muted);font-size:1rem;line-height:1.6;max-width:640px;margin:0 0 1.4rem}"
  + "main#main .sa-case{max-width:720px;box-sizing:border-box;margin:1.2rem 0 1.6rem;padding:1.2rem 1.3rem;border-radius:18px;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));color:var(--ivory);box-shadow:0 26px 60px -30px rgba(28,32,40,.6)}"
  + "main#main .sa-case .k{font-family:var(--sans);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);font-weight:600;margin:0 0 .5rem}"
  + "main#main .sa-case .big{font-family:var(--serif);font-size:clamp(2.2rem,8vw,3rem);line-height:1;color:#fff;margin:0 0 .3rem}"
  + "main#main .sa-case .sub{color:rgba(244,239,232,.85);line-height:1.55;margin:0 0 .9rem}"
  + "main#main .sa-case .row{display:flex;flex-wrap:wrap;gap:.5rem 1.4rem;border-top:1px solid rgba(244,239,232,.2);padding-top:.8rem;color:rgba(244,239,232,.85);line-height:1.5}"
  + "main#main .sa-case .row strong{color:#fff;font-family:var(--serif);font-size:1.3rem;margin-right:.35rem}"
  /* The words we look for: a plain list between two rules, no pills and no card. */
  + "main#main .sa-words{max-width:720px;margin:1.4rem 0 1.6rem;padding:.85rem 0 .7rem;border-top:1px solid rgba(28,32,40,.16);border-bottom:1px solid rgba(28,32,40,.16)}"
  + "main#main .sa-words p{color:var(--navy);font-weight:600;font-family:var(--sans);margin:0 0 .45rem}"
  + "main#main .sa-words ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}"
  + "@media (min-width:700px){main#main .sa-words ul{grid-template-columns:repeat(4,minmax(0,1fr))}}"
  + "main#main .sa-words li{margin:0;padding:.3rem 0;color:var(--navy);font-size:1rem;line-height:1.35}"
  + "main#main .sa-calc{background:var(--navy);border-radius:14px;padding:1.3rem 1.3rem 1.2rem;margin:1.2rem 0 1.4rem;max-width:720px;box-sizing:border-box}"
  /* The calculator's offer sits at its foot, under a rule: the tool and its offer are one box. */
  + "main#main .sa-calc div[style^=\"border-left:3px solid var(--brass)\"]{background:none!important;border:0!important;border-top:1px solid rgba(244,239,232,.22)!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:1rem 0 0!important;margin:1.1rem 0 0!important}"
  + "main#main .sa-calc div[style^=\"border-left:3px solid var(--brass)\"] p:first-child{color:#fff!important;font-family:var(--sans)}"
  + "main#main .sa-calc div[style^=\"border-left:3px solid var(--brass)\"] p+p{color:rgba(244,239,232,.85)!important}"
  + "main#main .sa-calc .k{font-family:var(--sans);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);margin:0 0 .9rem;font-weight:600}"
  + "main#main .sa-calc label{display:flex;justify-content:space-between;align-items:center;gap:.8rem;color:rgba(244,239,232,.92);font-family:var(--sans);font-size:1rem;line-height:1.35}"
  + "main#main .sa-calc .u{display:flex;align-items:center;gap:.35rem;flex:0 0 12.5rem;min-width:0;color:rgba(244,239,232,.6)}"
  + "main#main .sa-calc .u .s{flex:0 0 1rem;text-align:center}main#main .sa-calc .sa-in{display:grid;grid-template-columns:minmax(0,1fr);gap:.8rem}main#main .sa-calc label{min-width:0}"
  + "main#main .sa-calc input{flex:1 1 auto;min-width:0;width:auto;box-sizing:border-box;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.4);border-radius:8px;color:#fff;font:inherit;font-size:1rem;padding:.45rem .55rem;text-align:right}"
  + "main#main .sa-calc .out{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;border-top:1px solid rgba(244,239,232,.22);margin-top:1.1rem;padding-top:.9rem;color:rgba(244,239,232,.92);font-family:var(--sans)}"
  + "main#main .sa-calc .out strong{color:var(--brass-2);font-family:var(--serif);font-size:1.8rem;line-height:1}"
  + "main#main .sa-calc .note{color:rgba(244,239,232,.78);font-family:var(--sans);font-size:.95rem;line-height:1.55;margin:.6rem 0 0}"
  + "@media (max-width:420px){main#main .sa-calc{padding:1.2rem 1rem 1.1rem}main#main .sa-calc label{flex-direction:column;align-items:stretch;gap:.3rem}main#main .sa-calc .u{flex:none;width:100%}}"
  /* Worked example: the unit column takes the room it needs (critic, round 2, 320 px). */
  + "main#main .sa-ex td:first-child{width:62%}@media (max-width:420px){main#main .sa-ex>div{padding-left:.6rem!important;padding-right:.6rem!important}main#main .sa-ex td,main#main .sa-ex th{padding-left:.45rem!important;padding-right:.45rem!important}}main#main .sa-ex td:last-child,main#main .sa-ex th:last-child{text-align:right!important}"
  /* "On this page": no card, in columns between two thin rules (two on a phone, three from 700 px). */
  + "main#main nav[aria-label=\"On this page\"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}"
  + "main#main nav[aria-label=\"On this page\"]>ul{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem;columns:auto!important}"
  + "@media (min-width:700px){main#main nav[aria-label=\"On this page\"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label=\"On this page\"] li a{padding:.45rem 0!important}}"
  + "main#main .sa-chart{max-width:820px;margin:1.4rem 0 1.6rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.55));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)}"
  + "main#main .sa-chart .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .6rem}"
  + "main#main .sa-chart figcaption{color:var(--muted);font-size:1rem;line-height:1.55;margin-top:.6rem}"
  + "main#main .sa-law{list-style:none;margin:1rem 0 1.4rem;padding:0;display:grid;column-gap:1.6rem;max-width:720px}"
  + "@media (min-width:760px){main#main .sa-law{grid-template-columns:repeat(2,minmax(0,1fr))}}"
  + "main#main .sa-law li{margin:0;display:flex;gap:.7rem;align-items:flex-start;padding:.8rem 0;border-top:1px solid rgba(28,32,40,.16);border-bottom:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5}"
  + "@media (max-width:759px){main#main .sa-law li+li{border-top:0}}"
  + "main#main .sa-law li b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem}"
  + "main#main .sa-law .m{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-family:var(--sans);font-size:.9rem;margin-top:.1rem}"
  + "main#main .sa-law li.yes .m{background:var(--brass)}"
  /* Workaround (NEEDS.md 5): when the site adds a block after the closing band, glass.js treats that band as the top
     offer bar and puts its ivory heading on a light panel. Keep the closing band dark. */
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  /* Workaround (NEEDS.md 6): at 340 px and below the listing strip's AI search box is wider than the screen. */
  + "@media (max-width:340px){.hx-fb-ai,.hx-fb-q{box-sizing:border-box!important;max-width:100%!important;min-width:0!important}.hx-fb-ai{width:100%!important}}"
  /* Workaround (NEEDS.md 7): between 1000 and 1060 px the header's phone number pushes the page 5 px wide. */
  + "@media (min-width:1000px) and (max-width:1060px){.header-ctas .hdr-phone{display:none!important}}"
  /* One right edge for every block, the charts' 820 px (critic and owner, round 3: edges stepped at 915, 975, 1113
     and the worked example ran the full 1130 px). Text keeps the site's measure. */
  + "main#main .sa-ex,main#main .c3-cc,main#main .sa-ex>div{max-width:720px!important}"
  /* Design pass, 2026-11-08: one block width of 720 px, the same as the offers. */
  + "main#main .c3-gchart,main#main .c3-aerial,main#main figure.c3ph-hero{max-width:720px!important;box-sizing:border-box}"
  /* 1. The headline: two lines on a desktop, the italic line at about half the H1's size. */
  + "main#main .detail-h1{text-wrap:balance}@media (min-width:700px){main#main .detail-h1{font-size:clamp(2.4rem,3.6vw,3.3rem)!important;max-width:none!important}}"
  + "main#main .detail-h1 em{display:block;font-size:clamp(1.2rem,1.9vw,1.7rem);line-height:1.3;margin-top:.6rem;text-wrap:balance}"
  + "@media (max-width:1279px){main#main .detail-h1 em{color:#8a5226!important}}"
  /* 3. Three offers in the body lose the white card: a brass rule on the left, no fill, no shadow. */
  + "main#main section>.wrap>div[style^=\"border-left:3px solid var(--brass)\"]{background:none!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border:0!important;border-left:3px solid var(--brass)!important;border-radius:0!important;padding:.3rem 0 .4rem 1.3rem!important}"
  + "main#main div[style^=\"border-left:3px solid var(--brass)\"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}"
  /* 4. Tables under thin rules, no card; on a phone the who-pays rows are plain rows split by a rule. The photo has no frame. */
  + "main#main .sa-ex>div,main#main .c3-cc{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:0!important}"
  + "main#main .sa-ex th:first-child,main#main .sa-ex td:first-child,main#main .c3-cc th:first-child,main#main .c3-cc td:first-child{padding-left:0!important}"
  + "main#main .sa-ex th:last-child,main#main .sa-ex td:last-child,main#main .c3-cc th:last-child,main#main .c3-cc td:last-child{padding-right:0!important}"
  + "main#main .sa-ex thead th,main#main .c3-cc thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}"
  + "main#main .c3-cc caption{text-align:left;padding:0 0 .5rem!important}"
  + "@media (max-width:639px){main#main .c3-cc tbody tr{background:none!important;box-shadow:none!important;border:0!important;border-top:1px solid rgba(28,32,40,.16)!important;border-radius:0!important;padding:.75rem 0 .8rem!important;margin:0!important}main#main .c3-cc tbody tr:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}main#main .c3-cc th,main#main .c3-cc td{padding-left:0!important;padding-right:0!important}}"
  + "main#main figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:0!important}main#main figure.c3ph-hero figcaption{padding:.55rem 0 0!important}"
  + "</style>";

const LAW = `<ul class="sa-law" aria-label="What South Carolina's condo and HOA laws do not require">`
  + `<li><span class="m" aria-hidden="true">&#10005;</span><span><b>No reserve study</b>required</span></li>`
  + `<li><span class="m" aria-hidden="true">&#10005;</span><span><b>No periodic structural inspection</b>required</span></li>`
  + `</ul>`;

const FLOW = `<ol class="sa-flow" aria-label="Who pays to repair damage to an insured part of a South Carolina condo building, in order">`
  + `<li><span class="sa-n" aria-hidden="true">1</span><b>The building's insurance</b><span class="t">The association must insure the building.</span></li>`
  + `<li><span class="sa-n" aria-hidden="true">2</span><b>The reserve fund</b><span class="t">The money the association has saved for big repairs.</span></li>`
  + `<li class="sa-you"><span class="sa-n" aria-hidden="true">3</span><b>The owners</b><span class="t">The rest, divided among the owners. This can be a special assessment.</span></li></ol>`
  + `<p class="sa-cap">Who pays to repair damage to an insured part of a South Carolina condo building, in order. A building's bylaws can split the owners' part another way. The board can bill that part as a special assessment, or add it to the yearly budget.</p>`;

/* Row 3: $88,398 per unit in Buildings A and B, rounded for the reader (owner, round 1: one rounded number). */
const CASE_K = Math.round(88398 / 1000), CASE_LO = Math.round(64868 / 1000);
const CASE = `<div class="sa-case sa-card"><p class="k">Shipyard Village, Pawleys Island</p><p class="big">About $${CASE_K},000</p>`
  + `<p class="sub">The special assessment its board proposed in 2009 for each unit in two of its buildings.</p>`
  + `<div class="row"><span>The owners voted it down. The board then put the repair cost into the next two yearly budgets instead.</span></div></div>`;

const IN = (id, label, unit, v) => `<label><span>${label}</span><span class="u"><span class="s" aria-hidden="true">${unit === "$" ? "$" : ""}</span><input id="${id}" type="text" size="1" value="${unit === "$" ? n0(v) : v}" inputmode="decimal" autocomplete="off" oninput="c3Sa()" onblur="c3SaF(this)" aria-label="${label}"><span class="s" aria-hidden="true">${unit === "%" ? "%" : ""}</span></span></label>`;
const ONE = WX.rows.find((r) => r.unit === "2-bedroom");
const CALC = `<div class="sa-calc"><p class="k">Work out your share</p><div class="sa-in">`
  + IN("saCost", "What the repair costs", "$", WX.repair_cost)
  + IN("saSaved", "What insurance and the reserve fund pay", "$", WX.reserve_on_hand)
  + IN("saPct", "Your unit's percentage", "%", ONE.percent)
  + `</div><div class="out"><span>Your share</span><strong id="saShare">${money(ONE.share)}</strong></div>`
  + `<p class="note" id="saNote">The owners together owe ${money(WX.shortfall)}.</p></div>`
  + `<script>function c3SaN(t){var v=parseFloat(String(t).replace(/[^0-9.]/g,""));return isFinite(v)&&v>0?v:0}`
  + `function c3SaF(e){if(e&&e.id!=="saPct"&&e.value.trim()!==""){e.value=Math.round(c3SaN(e.value)).toLocaleString("en-US")}}`
  + `function c3Sa(){var g=function(id){var e=document.getElementById(id);return e?c3SaN(e.value):0};`
  + `var m=function(n){return "$"+Math.round(n).toLocaleString("en-US")};var s=document.getElementById("saShare"),t=document.getElementById("saNote");if(!s||!t)return;`
  + `var rest=Math.max(0,g("saCost")-g("saSaved")),p=g("saPct");s.textContent=m(rest*p/100);`
  + `t.textContent=rest>0?"The owners together owe "+m(rest)+".":"Insurance and the reserve fund pay all of it, so no special assessment is needed.";}`
  + `document.addEventListener("DOMContentLoaded",c3Sa);</script>`;

const WORDS = `<div class="sa-words"><p>Words in the minutes we look for</p><ul>`
  + ["special assessment", "engineer's report", "structural inspection", "water intrusion", "balconies", "waterproofing", "necessary repairs", "added to the operating budget"]
    .map((w) => `<li>${w}</li>`).join("") + `</ul></div>`;

const WHO_PAYS = compareCards([
  { name: "Billed before closing, not yet paid", cells: { who: "The seller, from the sale price", we: "We get the association's statement" } },
  { name: "Voted before closing, billed after", cells: { who: "You, unless the offer says otherwise", we: "We write who pays into the offer" } },
  { name: "Talked about, not yet voted", cells: { who: "Usually you, the owner when it is billed", we: "We look for it in the minutes" } },
], [{ key: "who", label: "Who pays" }, { key: "we", label: "What we do" }], { caption: "Where the assessment stands at closing, and who pays", nameLabel: "Where it stands at closing" });

/* The one photo (rules/images.md): a USGS oblique aerial, public domain; record in this page's data folder, with
   the writer's subject check. It shows the parts HUD gives a life to (flat roofs, balconies, pools), so its caption
   says "oceanfront buildings", names no building, and does not stand for the buildings in the listing count. */
const ph = PK.create({ h, photos: read("photos.json").photos, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "820px" });
const PHOTO = ph.aerial("north-myrtle-beach-oceanfront-roofs-and-balconies-2011", "Stacked balconies with railings on oceanfront buildings in North Myrtle Beach, seen from a plane. Balconies and waterproofing are on Fannie Mae's list.");
ph.share("north-myrtle-beach-oceanfront-roofs-and-balconies-2011");

const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const T33_31 = "https://www.scstatehouse.gov/code/t33c031.php";
const FISHER = "https://www.sccourts.org/opinions/HTMLFiles/SC/27603.pdf";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const DISC = "https://www.llr.sc.gov/re/recpdf/Updated_Property_Disclosure_Form.pdf";
const HUD = "https://www.hud.gov/sites/documents/eul_for_cna_e_tool.pdf";
const P527 = "https://www.irs.gov/publications/p527";
const P530 = "https://www.irs.gov/publications/p530";
const SCDCA = "https://consumer.sc.gov/sites/consumer/files/Documents/HOA/2026_HOA_Complaint_Report.pdf";

/* The FAQ asks what the body does not answer (owner, rounds 2 and 3: "Say a fact once"). Rows 6; 7; 25; 20. */
const FAQ = [
  { q: "Can the board change my unit's percentage to raise my share?", a: "No. Your unit's percentage is set in the condo's founding papers. It cannot be changed without every owner's agreement, except as a phased condo's founding papers provide or when owners vote not to rebuild a unit." },
  { q: "How much say does one owner have in a vote on a special assessment?", a: "As much as the unit's percentage. Where owners vote, a majority means owners holding at least 51 percent of the building's value, not 51 percent of the units." },
  { q: "Can a condo board borrow money instead of charging a special assessment?", a: "Yes, if the association is a nonprofit corporation and its articles do not forbid it. Under South Carolina law, it may borrow money and pledge its income to repay the loan." },
  { q: "Does a special assessment matter if I pay cash?", a: "Yes. You owe your share like every other owner. Fannie Mae's loan rules do not stop a cash purchase, but they apply to a later buyer of your unit who needs a loan." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: "Myrtle Beach Condo Special Assessments: Who Pays | Chapter3",
  description: "How big condo special assessments get in Myrtle Beach, who pays at closing, what South Carolina law allows, and the papers we read before you make an offer.",
  ogTitle: "Condo special assessments in Myrtle Beach: how big they get, who pays, and how we spot one",
  crumb: "Special Assessments",
  eyebrow: "HOA Guide",
  /* Owner, 2026-10-27: a headline that sells, which the page proves (rows 18 and 3). Round 2: literal, no "pass to". */
  h1: "The buyer of a Myrtle Beach condo can owe the seller's special assessment",
  h1em: "What one costs, who pays it, and how we find it in the board's minutes.",
  /* Round 3: plain speech (critic, reader, owner). build.js audit wants "you" and a place, and no "we". */
  sub: "An agent reads a Myrtle Beach condo board's meeting minutes for you, so you know about a coming special assessment before you make an offer.",
  heroCta: { title: "Know about an assessment before you sign.", label: "Have us check a building", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "A special assessment is a one-time bill from a condo association, which all the owners belong to, on top of the regular dues. It pays for a cost the yearly budget and the reserve fund, the money saved for big repairs, do not cover. South Carolina law puts no limit on the amount. Your share is your unit's percentage, set in the condo's founding papers, recorded when the condo was created.",
    "If a seller leaves an assessment unpaid, the association can collect it from the buyer too. The buyer's limit is the amount on the association's written statement of what the seller owes. We get that statement before closing, the day the sale is final.",
  ],
  sections: [
    { h2: "What is a special assessment on a condo?", toc: "What it is", id: "what-it-is", html: () => CSS + ph.css() +
      h.p(`A special assessment is a bill the association sends every owner, once, for a cost its budget and its reserve fund cannot pay. Dues pay the yearly budget. The ${h.a("/hoa/reserves/", "reserve fund")} is money the association saves for big repairs, such as a roof. A special assessment pays the rest.`) +
      h.p("When a part of a condo building the association must insure is damaged, the repair is paid in this order.") +
      FLOW +
      h.p(`In a neighborhood of houses, the recorded rules of the homeowners association (HOA) say whether it can charge one. Our page on ${h.a("/hoa/south-carolina-hoa-laws/", "South Carolina's HOA laws")} covers both kinds.`) },

    { h2: "How much is a condo special assessment?", toc: "How much", id: "how-much", html: (bg) =>
      h.p(`The size depends on the repair, what the reserve fund holds, and your unit's percentage. At one Pawleys Island condo, the board proposed about $${CASE_LO},000 to $${CASE_K},000 a unit. In our example below, it is ${money(SHARE_LO)} to ${money(SHARE_HI)}.`) +
      h.h3("What did one Pawleys Island condo's board ask each owner to pay?") +
      h.p("At Shipyard Village, a condo in Pawleys Island, south of Myrtle Beach, the board said two of its buildings needed extensive repairs. It said every unit's windows and sliding doors had to be replaced, at $12 million to $13 million. A consultant found corroded reinforcing steel and an outer shell that was not weather tight.") +
      CASE +
      h.p("Owners sued the association, and the South Carolina Supreme Court ruled on the case, Fisher v. Shipyard Village. For a buyer, this means a no vote can still lead to a bigger yearly budget, so the budget is on our list too.") +
      h.h3("How is each owner's share of a special assessment worked out?") +
      h.p(`<strong>Example, with our numbers:</strong> a ${WX.building_units}-unit building needs a ${MIL(WX.repair_cost)} roof and has ${money(WX.reserve_on_hand)} saved for it. The ${money(WX.shortfall)} still needed is split by each unit's percentage.`) +
      EXAMPLE +
      h.p(`The average is ${money(WX.average_per_unit)} a unit. Each unit's percentage is based on its value against the whole property when the condo was created. A unit with a higher percentage pays more of every assessment.`) +
      /* The calculator and its offer are one box (design pass, 2026-11-08). */
      CALC.replace("</div><script>", h.cta("What would your share be?", "Tell us the unit you are looking at. We find its percentage in the founding papers, so you can work out your share of any assessment.", "Have us find your unit's percentage", "/contact/", bg) + "</div><script>") },

    { h2: "How old are the condo buildings for sale on the Grand Strand?", toc: "Building age", id: "building-age", html: () =>
      h.p(`Most are more than ${Math.floor(AGE_99 / 5) * 5} years old. About two in three condos for sale here are in buildings built before 2000.`) +
      AGE_CHART +
      h.h3("How long do a condo building's roof, elevator and windows last?") +
      h.p("The U.S. Department of Housing and Urban Development (HUD) publishes how long building parts last when it plans repairs.") +
      LIFE_CHART +
      h.p("A building built before 1990 is older than HUD expects a flat or shingle roof, elevator machinery or aluminum windows to last. That does not mean those parts were never replaced. We find out which ones were from the minutes and the reserve study, if there is one. A reserve study is a list of the building's big parts, with when each needs replacing and what it will cost.") },

    { h2: "Can a condo HOA charge a special assessment without a vote in South Carolina?", toc: "Votes and limits", id: "votes-and-limits", html: (bg) =>
      h.p("Yes, if the building's bylaws allow it. Under South Carolina's condo law, each building's recorded bylaws say how owners are billed. Any limit on the amount is in those bylaws and the founding papers.") +
      h.h3("Does South Carolina require a reserve study or regular structural inspections?") +
      h.p("No. The state's condo and HOA laws require neither.") +
      LAW +
      h.p("In the Shipyard Village case, the South Carolina Supreme Court said a court will not overrule a board that acts within its powers and in good faith. A court can rule against a board that breaks its own founding papers or bylaws.") +
      h.h3("Do owners in Horry County dispute special assessments?") +
      h.p(`Yes. More of South Carolina's HOA complaints are about associations in Horry County than in any other county. Associations there are also the subject of about ${FEES_SHARE} of the complaints over fees or special assessments. For a buyer, that is a reason to see how a building's last assessment was voted. That vote is in the minutes we read.`) +
      h.cta("Can this board bill you without a vote?", "Tell us the building. We read its bylaws and tell you whether the board can charge an assessment without a vote, and any limit on the amount.", "Have us read the bylaws", "/contact/", bg) },

    { h2: "How can I tell if a condo has a special assessment coming?", toc: "How to spot one", id: "how-we-spot-one", html: () =>
      h.p("We read the building's papers, the same ones Fannie Mae, which buys home loans from lenders, tells a lender to read. The right to see them belongs to owners, so we ask the seller for them before you make an offer.") +
      h.ol([
        "<strong>Board minutes.</strong> An association that is a nonprofit corporation must keep minutes of every board meeting, so a repair being priced shows up there.",
        "<strong>The association's list of special assessments and needed repairs.</strong> It shows what is billed now and what repairs are planned.",
        "<strong>Any engineer's or inspection report.</strong> A lender must read a structural or mechanical inspection done in the last 3 years, and so do we.",
        `<strong>The reserve study, if there is one, against the building's age.</strong> We compare what the fund holds with the parts HUD expects to be worn out. If a building has none, the minutes and the budget carry more weight. Our ${h.a("/hoa/reserves/", "reserves page")} shows how much a building should have saved.`,
        "<strong>The budget and the record of every expense.</strong> A condo board must keep a detailed record of every receipt and expense, open to all owners.",
        "<strong>The seller's disclosure.</strong> It asks: \"Has the owners association levied any special assessments or similar charges?\" It also asks about \"any known common area problems\".",
      ]) +
      h.p("In most resales the seller fills in that disclosure form before a contract. The answer can be yes, no or No Representation, which means the seller does not know.") +
      WORDS +
      h.h3("What if the papers come after I sign?") +
      h.p("Then we read them inside the contract's due diligence period. The standard South Carolina sales contract has one, for a length you and the seller agree on. Inside it, you can end the contract for any reason, with written notice and the fee the contract names. After it ends, that right ends.") +
      h.p(`${h.a("/hoa/documents/", "Our page on HOA documents")} explains each paper a buyer gets.`) },

    { h2: "Who pays a special assessment when a condo sells?", toc: "Who pays at sale", id: "who-pays-at-sale", html: (bg) =>
      h.p("The seller pays what was billed before closing. It comes out of the sale price.") +
      h.p(`If the seller does not pay, the association can collect from the buyer too, for everything owed up to closing. The buyer owes no more of the seller's bill than the association's written statement shows. If it shows nothing owed, the buyer owes none of it. We get that statement and find out what the seller owes before closing, so you do not get stuck with it. ${h.a("/hoa/estoppel-and-transfer-fees/", "Our page on that statement and its fee")} says what it costs.`) +
      WHO_PAYS +
      h.p("When owners vote for one before closing and the bill comes after, the association bills you, as the owner then, unless the offer says the seller pays it. The offer can say the same for installments due after closing.") +
      h.p("If the minutes show one coming, we tell you. Before you offer, you can offer less, ask the seller for a credit at closing, or not make an offer. The seller's disclosure form asks only about assessments already levied, so the minutes are where a coming one shows up.") +
      h.p(`Selling a condo with an assessment pending? See ${h.a("/sell/sell-my-condo/", "selling a condo in Myrtle Beach")}.`) +
      h.cta("Leave the seller's bill with the seller", "We get the association's statement of what the seller owes, and we write who pays a voted assessment into your offer.", "Have us write it into your offer", "/contact/", bg) },

    { h2: "Can a special assessment stop a condo loan?", toc: "Loans", id: "loans", html: (bg) =>
      h.p(`Yes. If a building's special assessment pays for a critical repair that has not been fixed, Fannie Mae will not buy a loan on any unit in that building. For a buyer, that rules out a regular loan your lender plans to sell to Fannie Mae, until the repair is done. Cash still works. FHA, VA and other loans have their own rules, and our page on ${h.a("/invest/non-warrantable-condos/", "condos most lenders will not lend on")} explains them.`) +
      h.h3("Which repairs does Fannie Mae count as critical?") +
      h.ul([
        "Repairs to items such as sea walls, elevators, waterproofing, stairwells, balconies, foundations, electrical systems and parking structures.",
        "Mold, water intrusion and damaging leaks in the buildings.",
        "A repair over $10,000 per unit, due within 12 months, with no money set aside for it.",
        "A full or partial evacuation order for an unsafe condition. The building is ineligible until it is safe.",
      ]) +
      h.p("Damage to only one or a few units does not count.") +
      PHOTO +
      h.cta("Buying with a loan? Know the repair list first.", "Tell us the building and your loan. Before you offer, we check its papers for a repair on Fannie Mae's critical list.", "Have us check it for your loan", "/contact/", bg) },

    { h2: "Can I refuse to pay a special assessment, or pay it over time?", toc: "Not paying", id: "not-paying", html: () =>
      h.p("No owner can refuse a lawful share. Not using the shared areas, or giving up the unit, does not end it.") +
      h.p("No South Carolina statute gives an owner a right to a payment plan. Whether one is offered is the board's choice.") +
      h.h3("What happens if a special assessment goes unpaid in South Carolina?") +
      h.p(`An unpaid condo assessment is a lien on the unit. If the unit is sold to pay its debts, property taxes and the mortgage are paid first, then the association. The association can foreclose its lien in court like a mortgage, or sue for the money without foreclosing. Our page on ${h.a("/hoa/liens-and-foreclosure/", "HOA liens and foreclosure")} has each step.`) +
      h.p("A neighbor's unpaid share can become every owner's cost. When a lender forecloses on a unit, some of that unit's unpaid assessments are split among all the owners.") +
      /* Overlap fix, 2026-11-08: /hoa/tax-deductible/ owns the tax question; one sentence and the link stay here. */
      h.p(`Association assessments are not deductible as real estate tax, because an association, not a government, charges them. Our page on whether ${h.a("/hoa/tax-deductible/", "HOA fees are tax deductible")} has the detail.`) },
  ],
  pageImages: () => ph.pageImages(),
  /* Workaround (NEEDS.md 8): creditsList adds a general "resized these photos" line after the photo's own
     changes line, which repeats it on a one-photo page. */
  afterSources: () => { const c = ph.credits(), x = "Chapter3 Realty resized these photos and cropped some of them."; return c.includes(x) ? c.replace(x, "") : c; },
  faqTitle: "Special assessment questions",
  faq: FAQ,
  sources: [
    { name: "SC Code 27-31", href: T27_31 },
    { name: "SC Code 27-30", href: T27_30 },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC Code 33-31", href: T33_31 },
    { name: "Fisher v. Shipyard Village", href: FISHER },
    { name: "Fannie Mae B4-2.1-03", href: FNMA },
    { name: "SC disclosure form", href: DISC },
    { name: "HUD useful lives", href: HUD },
    { name: "IRS Pub. 527", href: P527 },
    { name: "IRS Pub. 530", href: P530 },
    { name: "SCDCA HOA report", href: SCDCA },
  ],
  sourcesNote: "Condos for sale: our count of active listings by year built. Not legal or tax advice; a South Carolina attorney can advise on your documents.",
  bottomCta: { h2: "Want to know what a building's papers say?", p: "Tell us the condo you like. One of our agents reads its minutes, its list of special assessments and its reserve study, if it has one. Then we tell you what they show, before you make an offer.", label: "Have an agent read the minutes", href: "/contact/" },
  keywords: "condo special assessment Myrtle Beach, HOA special assessment South Carolina, special assessment who pays at closing, special assessment limit South Carolina, can HOA charge special assessment without vote, special assessment Fannie Mae, condo special assessment calculator, South Carolina Horizontal Property Act",
  about: "Condo special assessments in Myrtle Beach and South Carolina",
});
