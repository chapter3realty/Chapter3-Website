/* /invest/rental-property-tax-cut/ - Governor-elect Alan Wilson's plan to end the higher property tax on
 * rentals, for a Myrtle Beach investor: his words, the bill on a $350,000 rental at 6% and at 4%, the votes a
 * change needs, what it would cost the county and its schools, what past examples point to in the short and
 * long run, and what Johnson and the Democrats said.
 *
 * Batch 2026-11-e, page 4, Lane N. Co-authored (owner, 2026-11-04): author "devin+abdulla", names in the
 * byline and schema only. Bipartisan: each side in its own words, the same tests for each.
 * Facts: Blog-Brain batches/2026-11-e/facts.md, VERIFIED and CORRECTED rows only, at the verifier's values
 * (VERIFY.md). Struck wording: batches/2026-11-e/facts/election-2026-struck.json. Past examples:
 * predictions.md section 5, with VERIFY.md's cuts (no "project partners", the study's own definition of
 * other residential, no claimed effect of Florida's cap).
 * Data: data/2026-11-e/rental-property-tax-cut/ (website working copy). The table, the chart, the calculator
 * and the vote figures are computed here from those files and checked against the ledger's results.
 * Siblings: /buyers/act-388-changes/ owns the history of Act 388, the 15% cap and the pending bills;
 * /market-reports/2026-election/ owns the results. This page owns the investor's bill, the vote math, the
 * cost to the county and the short- and long-run outlook.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/invest/rental-property-tax-cut/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "rental-property-tax-cut");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const LEVY = read("levy-2026.json"), SH = read("horry-shares-2018.json"), V = read("votes.json");
/* The one photo (CC BY-SA 3.0, record and subject check in this page's photos.json). */
const PH = PK.create({ h, photos: read("photos.json").photos }).photoSet({ aerialWidth: "760px" });

const must = (ok, what) => { if (!ok) throw new Error(`rental-property-tax-cut.js: ${what}`); };
const r2 = (v) => Math.round(v * 100) / 100;
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");

/* ---- F144 to F148: the levy and the worked example. ---- */
const M = LEVY.mills;
const millsOf = (a) => r2(LEVY.areas[a].parts.reduce((t, k) => t + M[k], 0));
must(millsOf("myrtle-beach") === 254.6 && LEVY.areas["myrtle-beach"].total === 254.6, "F145: 254.6 mills in the city");
must(millsOf("unincorporated") === 192.9 && LEVY.areas.unincorporated.total === 192.9, "F148: 192.9 mills unincorporated");
must(r2(M.county + M.school_debt + M.school_operation) === M.county_and_school, "F144: county and school 171.2");
const PRICE = LEVY.example_price;
const bill = (price, ratio, mills) => r2(price * ratio * mills / 1000);
const BILLS = (a) => {
  const m = millsOf(a);
  return { mills: m, six: bill(PRICE, 0.06, m), four: bill(PRICE, 0.04, m), home: bill(PRICE, 0.04, r2(m - M.school_operation)) };
};
const MB = BILLS("myrtle-beach"), UN = BILLS("unincorporated");
const LR = LEVY.ledger_results;
must(PRICE === 350000 && MB.six === LR["myrtle-beach"].six && MB.four === LR["myrtle-beach"].four_with_school && MB.home === LR["myrtle-beach"].like_home, "F145 to F147: the city example");
must(UN.six === LR.unincorporated.six && UN.four === LR.unincorporated.four_with_school, "F148: the unincorporated example");
must(Math.abs((MB.six - MB.four) / MB.six - 1 / 3) < 0.001, "F146: the narrow cut is one third");
const CUT_NARROW = r2(MB.six - MB.four), CUT_HOME = r2(MB.six - MB.home);
const PART = (k, ratio = 0.06) => bill(PRICE, ratio, M[k]);
const PARTS = { county: PART("county"), schoolOps: PART("school_operation"), schoolDebt: PART("school_debt"), city: PART("myrtle_beach_city") };
must(r2(PARTS.county + PARTS.schoolOps + PARTS.schoolDebt + PARTS.city) === MB.six, "the parts add to the city bill");

/* ---- F083, F011, F012, F014: the votes. ---- */
const HO = V.house, SE = V.senate;
must(HO.two_thirds === Math.ceil(HO.members * 2 / 3) && SE.two_thirds === Math.ceil(SE.members * 2 / 3), "F083: two-thirds of 124 and 46");
must(HO.two_thirds === 83 && SE.two_thirds === 31 && HO.republicans_unofficial_2026 === 79 && HO.democrats_unofficial_2026 === 45 && SE.republicans === 34, "F083: 83, 31, 79, 45, 34");
const NEED_D = HO.two_thirds - HO.republicans_unofficial_2026; /* 4 */
const BLOCK = HO.members - HO.two_thirds + 1; /* 42 members not voting yes stop it */
must(NEED_D === 4 && BLOCK === 42 && BLOCK <= HO.democrats_unofficial_2026, "vote arithmetic");

/* ---- F149: Horry shares, 2018. ---- */
const row = (c) => SH.rows.find((r) => r.class === c);
const PRI = row("Primary residential"), OTH = row("Other residential"), COM = row("Commercial");
must(PRI.appraised === 35.5 && PRI.assessed === 30.8 && OTH.appraised === 36.4 && OTH.assessed === 47.2 && COM.appraised === 21.4 && COM.assessed === 21.1, "F149: Table 2.3, Horry");
const SHIFT = Math.round(OTH.assessed / 3); /* 47.2 / 3 = 15.7, about 16 */
must(SHIFT === 16 && Math.abs(OTH.assessed / 3 - 100 / 6) < 1.1, "a third of 47.2 is about 16, about a sixth");

/* ---------------------------------------------------------------- sources */
const A10 = "https://www.scstatehouse.gov/scconstitution/A10.pdf";
const A16 = "https://www.scstatehouse.gov/scconstitution/A16.pdf";
const C43 = "https://www.scstatehouse.gov/code/t12c043.php";
const C37 = "https://www.scstatehouse.gov/code/t12c037.php";
const C11 = "https://www.scstatehouse.gov/code/t11c011.php";
const LEVY_PDF = LEVY.source;
const WIS = "https://www.wistv.com/2026/10/28/full-interview-alan-wilson-shares-priorities-governor-ahead-election-day/";
const FOX = "https://www.foxcarolina.com/2026/10/15/republican-nominee-sc-governor-alan-wilson-announces-affordability-agenda/";
const HERE = "https://www.herecolumbia.com/2026/10/16/governor-candidate-alan-wilson-affordability-campaign-plan/";
const PRIOR = "https://wilsonforsc.com/priorities/";
const WMBF = "https://www.wmbfnews.com/2026/09/30/sc-governor-candidates-split-taxes-infrastructure-ahead-registration-deadlines/";
const GAZ = "https://yourislandnews.com/alan-wilson-declares-victory-in-sc-governors-race-johnson-concedes/";
const SCEC = "https://scvotes.gov/2026-general-election-results/";
const LINC = SH.source;
const USC = "https://sc.edu/study/colleges_schools/law/student_life/journals/jled/editions/_documents/2025_54_1/boyette_jled54.1_.pdf";
const FLA = "https://www.flsenate.gov/Laws/Constitution";
const H3841 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/3841.htm";
const S815 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/815.htm";
const C36 = "https://www.scstatehouse.gov/code/t12c036.php";

/* ---------------------------------------------------------------- blocks */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const CAP = "color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4";
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  /* Design pass, 2026-11-08 (redo3/invest-rental-property-tax-cut/DESIGN.md): a normal-size headline, the contents between
     rules, one card style (the charts, the calculator and the offers), plain lists and tables under thin rules, one width. */
  /* 1. The headline at a normal size; on a phone the facts are flat rows under rules. */
  + `${S} .detail-h1{font-size:clamp(2.1rem,4.4vw,3.9rem);max-width:15em;text-wrap:balance}${S} .detail-h1 br,${S} .detail-h1 em:empty{display:none}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* 2. The contents list: no card, in columns between two rules. */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}`
  /* 5. One block width of 720 px. */
  + `${S} .c3-gchart,${S} .rt-fig,${S} .rt-tbl,${S} .rt-calc,${S} .rt-q,${S} .rt-routes,${S} .rt-runs,${S} .c3-aerial .c3ph-hero{max-width:720px!important;box-sizing:border-box}`
  /* 3. The quote: a brass left rule, no box. */
  + `${S} .rt-q{margin:1.2rem 0 1.4rem;padding:.2rem 0 .2rem 1.2rem;border-left:3px solid var(--brass)}`
  + `${S} .rt-q p{margin:0 0 .7rem;color:var(--navy);font-family:var(--serif);font-size:1.2rem;line-height:1.5}`
  + `${S} .rt-q p.by{margin:0;color:var(--muted);font-family:var(--sans);font-size:1rem;line-height:1.5}`
  /* 3. The photo without a frame. */
  + `${S} .c3-aerial figure.c3ph-hero{${FLAT};padding:0!important}${S} .c3-aerial figure.c3ph-hero figcaption{padding:0!important;margin-top:.55rem}`
  /* 3. Tables: plain, under thin rules. On a phone each row is a plain row split by a rule. */
  + `${S} .rt-tbl{margin:1.3rem 0 1.4rem}`
  + `${S} .rt-tbl .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .5rem}`
  + `${S} .rt-tbl table{width:100%;border-collapse:collapse;font-family:var(--sans)}`
  + `${S} .rt-tbl th{text-align:left;vertical-align:bottom;font-size:.85rem;color:var(--navy);font-weight:700;padding:.5rem .6rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);line-height:1.3}`
  + `${S} .rt-tbl td,${S} .rt-tbl tbody th{padding:.7rem .6rem .7rem 0;border-bottom:${RULE};color:var(--muted);font-size:1rem;line-height:1.45;vertical-align:top}`
  + `${S} .rt-tbl tbody th{color:var(--navy);font-weight:650;font-size:1rem}`
  + `${S} .rt-tbl .num{text-align:right;white-space:nowrap;padding-right:0}${S} .rt-tbl th.num{padding-left:.6rem}${S} .rt-tbl td.num b{color:var(--navy)}`
  + `${S} .rt-tbl .note{color:var(--muted);font-size:.95rem;line-height:1.5;margin:0;padding:.7rem 0 0}`
  + `@media (max-width:699px){${S} .rt-tbl.rt-stack thead{display:none}${S} .rt-tbl.rt-stack tr{display:block;padding:.7rem 0 .75rem;border-top:${RULE}}${S} .rt-tbl.rt-stack tr:last-child{border-bottom:${RULE}}`
  + `${S} .rt-tbl.rt-stack tbody th,${S} .rt-tbl.rt-stack td{display:block;border:0;padding:.2rem 0;text-align:left;white-space:normal}${S} .rt-tbl.rt-stack tbody th{font-size:1.06rem;margin-bottom:.15rem}`
  + `${S} .rt-tbl.rt-stack td::before{content:attr(data-l);display:block;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:#8a5226}}`
  /* 3. The calculator keeps the card; its results are plain rows split by rules, no box inside it. */
  + `${S} .rt-calc{margin:1.2rem 0 1.4rem;padding:1.2rem 1.3rem;border-radius:20px;${CARD}}`
  + `${S} .rt-calc .k{${CAP};margin:0 0 .8rem}`
  + `${S} .rt-calc .g{display:grid;gap:.8rem;margin-bottom:1rem}@media (min-width:640px){${S} .rt-calc .g{grid-template-columns:1fr 1fr}}`
  + `${S} .rt-calc label{display:flex;flex-direction:column;gap:.35rem;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1rem}`
  + `${S} .rt-calc input,${S} .rt-calc select{font:inherit;font-weight:400;font-size:1.0625rem;padding:.6rem .7rem;border:1px solid rgba(28,32,40,.3);border-radius:10px;background:#fff;color:var(--navy);width:100%;box-sizing:border-box;min-height:44px}`
  + `${S} .rt-calc .out{margin:0;padding:0;border-bottom:${RULE}}`
  + `${S} .rt-calc .out>div{display:flex;justify-content:space-between;align-items:baseline;gap:.8rem;margin:0;padding:.6rem 0;border-top:${RULE};font-family:var(--sans);color:var(--muted);line-height:1.35}`
  + `${S} .rt-calc .out>div strong{color:var(--navy);font-size:1.15rem;white-space:nowrap}`
  + `${S} .rt-calc .out>div.now span{color:var(--navy);font-weight:700}${S} .rt-calc .out>div.now strong{font-size:1.3rem}`
  + `${S} .rt-calc .note{color:var(--muted);font-size:.95rem;line-height:1.5;margin:.8rem 0 0}`
  /* The charts keep the one card style. */
  + `${S} .rt-fig{margin:1.4rem 0 1.4rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;${CARD}}`
  + `${S} .rt-fig .cap{${CAP};margin:0 0 .8rem}`
  + `${S} figure.rt-fig:not(.c3-gchart){padding:1.1rem 1.2rem 1rem!important}`
  + `${S} .rt-fig svg[role=img],${S} .rt-fig .rt-ch svg{display:block;width:100%;max-width:440px;height:auto;margin:0;border-radius:0!important}`
  + `@media (max-width:699px){${S} figure.rt-fig:not(.c3-gchart){padding:.9rem .7rem .8rem!important}}`
  + `${S} figure.rt-fig>figcaption{padding:.6rem 0 0!important}`
  + `${S} .rt-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}`
  /* 4. The votes chart: the House and the Senate side by side on a wide screen. */
  + `${S} .rt-ch{display:grid;gap:1rem}@media (min-width:700px){${S} .rt-ch{grid-template-columns:1fr 1fr;column-gap:1.6rem}}`
  /* 4. The shares chart: its key beside the bars on a wide screen. */
  + `@media (min-width:760px){${S} figure.rt-side{display:grid;grid-template-columns:minmax(0,400px) minmax(0,1fr);column-gap:1.8rem;align-items:center}${S} figure.rt-side>.cap{grid-column:1/-1}${S} figure.rt-side>figcaption{margin:0;padding:0!important}}`
  /* 3. The two routes: two plain columns, each under a thin rule. */
  + `${S} .rt-routes{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;column-gap:1.6rem}`
  + `@media (min-width:700px){${S} .rt-routes{grid-template-columns:1fr 1fr}}`
  + `${S} .rt-routes>li{margin:0;padding:.9rem 0 1rem;border-top:${RULE}}`
  + `${S} .rt-routes b.t{display:block;font-family:var(--sans);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:#8a5226;font-weight:700;margin-bottom:.6rem}`
  + `${S} .rt-routes ol{margin:0;padding:0;list-style:none;counter-reset:rs;display:grid;gap:.5rem}`
  + `${S} .rt-routes ol li{counter-increment:rs;position:relative;margin:0;padding-left:2.1rem;color:var(--muted);line-height:1.5;min-height:1.6rem}`
  + `${S} .rt-routes ol li::before{content:counter(rs);position:absolute;left:0;top:.05rem;width:1.55rem;height:1.55rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.85rem;display:flex;align-items:center;justify-content:center}`
  + `${S} .rt-routes ol li strong{color:var(--navy)}`
  /* 3. Short run and long run: a plain list under rules; "First" across the top with a brass top rule. */
  + `${S} .rt-runs{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;column-gap:1.6rem}`
  + `@media (min-width:760px){${S} .rt-runs{grid-template-columns:1fr 1fr}${S} .rt-runs>li.first{grid-column:1/-1}}`
  + `${S} .rt-runs>li{margin:0;padding:.9rem 0 .6rem;border-top:${RULE}}${S} .rt-runs>li.first{border-top:2px solid var(--brass)}`
  + `${S} .rt-runs .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:#8a5226;font-weight:700;margin-bottom:.3rem}`
  + `${S} .rt-runs b.h{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.5rem}`
  + `${S} .rt-runs ul{margin:0;padding:0 0 0 1.1rem;color:var(--muted);line-height:1.55}${S} .rt-runs ul li{margin:0 0 .45rem}`
  + `${S} h2,${S} h3,${S} .rt-runs b.h,${S} .rt-fig .cap,${S} .c3-gchart .cap{text-wrap:balance}`
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "@media (max-width:359px){main#main .c3-glance span.t{font-size:.75rem!important;hyphens:none}main#main .c3-glance li{padding-left:.15rem;padding-right:.15rem}}main#main .c3-glance li{line-height:1.4}main#main .c3-glance strong{font-size:1.2rem!important;font-weight:700;line-height:1.25}main#main .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* Wilson's direct words (F060 anchor quote, F061), WIS full interview transcript. */
const QUOTE = `<blockquote class="rt-q"><p>"Owner-occupied homes are taxed at a much lower rate" while "second, third, and fourth homes, which are usually rental properties, are taxed at a higher rate."</p>`
  + `<p>"...looking at Act 388 and reforming how we assess property taxes on those types of properties."</p>`
  + `<p class="by">Alan Wilson, in a ${h.ext(WIS, "full interview with WIS")} before the election</p></blockquote>`;

/* The city example as a chart (F145 to F147). */
const BILL_CHART = G.bars([
  { name: "Today, at 6%", value: MB.six, valueText: money(MB.six), reference: true },
  { name: "At 4%, still paying the school tax", value: MB.four, valueText: money(MB.four) },
  { name: "At 4%, taxed like an owner's home", value: MB.home, valueText: money(MB.home) },
], { caption: `At 4%, the ${money(MB.six)} tax on a ${money(PRICE)} Myrtle Beach rental falls to ${money(MB.four)} or ${money(MB.home)}`, nameLabel: "Tax rule", valueLabel: "tax a year", max: MB.six, compact: true,
  note: `Horry County's 2026 tax rates, ${MB.mills} mills inside the city: county, schools and city. Before credits, fees and any special district.` });

/* Both places, all three rules (F145 to F148; the unincorporated "like a home" figure is our arithmetic, F147's method). */
const COLS = ["Today, at 6%", "At 4%, with the school tax", "At 4%, like an owner's home"];
const TROW = (name, b) => `<tr><th scope="row">${name}</th>${[b.six, b.four, b.home].map((v, i) => `<td class="num" data-l="${COLS[i]}"><b>${money(v)}</b></td>`).join("")}</tr>`;
const BOTH = `<div class="rt-tbl rt-stack"><div class="cap">The same ${money(PRICE)} rental, a year, in two places</div><table><thead><tr><th scope="col">Where</th>${COLS.map((c) => `<th scope="col" class="num">${c}</th>`).join("")}</tr></thead><tbody>`
  + TROW("Inside Myrtle Beach", MB) + TROW("Unincorporated Horry County", UN)
  + `</tbody></table><div class="note">Unincorporated means outside any city or town, here inside the county fire district. Some parcels there also pay an 8.1-mill waste levy, which would add about 4%.</div></div>`;
must(Math.round(8.1 / UN.mills * 100) === 4, "the waste levy adds about 4%");

/* The calculator: price and place in, the three bills out. Rates from levy-2026.json. Stores nothing. */
const OPT = (a) => `<option value="${millsOf(a)}">${LEVY.areas[a].name}</option>`;
const CALC = `<div class="rt-calc"><div class="k">Work out the tax on your rental</div><div class="g">`
  + `<label>The county's value of the rental<input id="rtPrice" type="text" inputmode="numeric" autocomplete="off" value="${PRICE.toLocaleString("en-US")}" oninput="c3Rt()" aria-label="The county's value of the rental, in dollars"></label>`
  + `<label>Where it is<select id="rtArea" onchange="c3Rt()" aria-label="Where the rental is">${OPT("myrtle-beach")}${OPT("unincorporated")}</select></label></div>`
  + `<div class="out" role="list" aria-live="polite"><div role="listitem" class="now"><span>Today, at 6%</span><strong id="rtSix">${money(MB.six)}</strong></div>`
  + `<div role="listitem"><span>At 4%, still paying the school tax</span><strong id="rtFour">${money(MB.four)}</strong></div>`
  + `<div role="listitem"><span>At 4%, taxed like an owner's home</span><strong id="rtHome">${money(MB.home)}</strong></div></div>`
  + `<div class="note" id="rtNote">A change would save ${money(CUT_NARROW)} to ${money(CUT_HOME)} a year on this rental.</div><div class="note">Before the 25% exemption a rental gets when it sells.</div></div>`
  + `<script>function c3Rt(){var p=document.getElementById("rtPrice"),a=document.getElementById("rtArea"),o=["rtSix","rtFour","rtHome"].map(function(i){return document.getElementById(i)}),n=document.getElementById("rtNote");if(!p||!a||!n)return;`
  + `var v=parseFloat(String(p.value).replace(/[$,\\s]/g,"")),m=parseFloat(a.value),s=${M.school_operation};`
  + `var f=function(x){return "$"+Math.round(x).toLocaleString("en-US")};if(!(v>0)){o.forEach(function(e){e.textContent="--"});n.textContent="Enter the county's value of the rental.";return}`
  + `var six=v*0.06*m/1000,four=v*0.04*m/1000,home=v*0.04*(m-s)/1000;o[0].textContent=f(six);o[1].textContent=f(four);o[2].textContent=f(home);`
  + `n.textContent="A change would save "+f(six-four)+" to "+f(six-home)+" a year on this rental."}</script>`;

/* The vote meter (F083, F011, F012). Seats as bars, the two-thirds line marked. */
const VOTES = (() => {
  const W0 = 300, x0 = 6, x1 = 294, X = (n, tot) => x0 + (x1 - x0) * n / tot;
  const chamber = (y, name, tot, r, d, need) => {
    const xr = X(r, tot), xn = X(need, tot), by = y + 34;
    return `<text x="${x0}" y="${y}" font-size="18" font-weight="700" fill="#1c2028">${name}, ${tot} members</text>`
      + `<text x="${xn.toFixed(1)}" y="${y + 24}" text-anchor="end" font-size="17" font-weight="700" fill="#a8482f">${need} needed</text>`
      + `<rect x="${x0}" y="${by}" width="${(xr - x0).toFixed(1)}" height="30" rx="6" fill="#2a3040"/>`
      + `<rect x="${xr.toFixed(1)}" y="${by}" width="${(x1 - xr).toFixed(1)}" height="30" rx="6" fill="#b9c2ca"/>`
      + `<text x="${(x0 + 8).toFixed(1)}" y="${by + 21}" font-size="16" font-weight="700" fill="#fff">${r} Republicans</text>`
      + `<text x="${x1.toFixed(1)}" y="${by + 50}" text-anchor="end" font-size="16" font-weight="700" fill="#1c2028">${d} Democrats</text>`
      + `<line x1="${xn.toFixed(1)}" x2="${xn.toFixed(1)}" y1="${y + 29}" y2="${by + 36}" stroke="#a8482f" stroke-width="3"/>`;
  };
  const ariaH = `The House: ${HO.republicans_unofficial_2026} Republicans and ${HO.democrats_unofficial_2026} Democrats in the unofficial count, with the two-thirds line at ${HO.two_thirds} of ${HO.members}, past the Republican seats.`;
  const ariaS = `The Senate: ${SE.republicans} Republicans and ${SE.democrats} Democrats, with the line at ${SE.two_thirds} of ${SE.members}, inside the Republican seats.`;
  const one = (label, c) => `<svg role="img" aria-label="${label}" viewBox="0 0 ${W0} 112" style="font-family:var(--sans)">${c}</svg>`;
  const svg = `<div class="rt-ch">`
    + one(ariaH, chamber(20, "House", HO.members, HO.republicans_unofficial_2026, HO.democrats_unofficial_2026, HO.two_thirds))
    + one(ariaS, chamber(20, "Senate", SE.members, SE.republicans, SE.democrats, SE.two_thirds)) + `</div>`;
  return `<figure class="rt-fig"><div class="cap">Republicans hold two-thirds of the Senate, but not of the House</div>${svg}`
    + `<figcaption>House seats are the unofficial 2026 count. Senate seats were not on the ballot, except one special election.</figcaption></figure>`;
})();

/* The two routes (F081, F084). */
const ROUTES = `<ol class="rt-routes" aria-label="The two ways the rental rate could change">`
  + `<li><b class="t">Route 1: a new law</b><ol><li><strong>House:</strong> two-thirds of its members vote yes.</li><li><strong>Senate:</strong> two-thirds of the senators agree.</li><li>The new rate goes into state law. No statewide vote is needed.</li></ol></li>`
  + `<li><b class="t">Route 2: an amendment</b><ol><li>Two-thirds of the members elected to each house vote yes.</li><li>A majority of voters approve it at the next general election, in November 2028.</li><li>The next legislature votes to ratify it.</li></ol></li></ol>`;

/* F149: appraised against assessed share, Horry 2018, as paired bars. */
const SHARES = (() => {
  const W0 = 340, lx = 4, bx = 4, bw = 120, rowH = 96, X = (v) => bw * v / 50;
  const names = { "Primary residential": "Homes their owners live in", "Other residential": "Rental property, at 6%", "Commercial": "Commercial property" };
  const rows = SH.rows.map((r, i) => {
    const y = 18 + i * rowH;
    return `<text x="${lx}" y="${y}" font-size="18" font-weight="700" fill="#1c2028">${names[r.class]}</text>`
      + `<rect x="${bx}" y="${y + 10}" width="${X(r.appraised).toFixed(1)}" height="20" rx="5" fill="#b9c2ca"/>`
      + `<text x="${(bx + X(r.appraised) + 6).toFixed(1)}" y="${y + 26}" font-size="16" fill="#1c2028">${r.appraised}% of value</text>`
      + `<rect x="${bx}" y="${y + 36}" width="${X(r.assessed).toFixed(1)}" height="20" rx="5" fill="#c4783a"/>`
      + `<text x="${(bx + X(r.assessed) + 6).toFixed(1)}" y="${y + 52}" font-size="16" font-weight="700" fill="#1c2028">${r.assessed}% of taxable value</text>`;
  }).join("");
  const aria = `Paired bars for Horry County in 2018. Homes their owners live in: ${PRI.appraised} percent of value, ${PRI.assessed} percent of the taxable value. Rental property at 6 percent: ${OTH.appraised} percent of value, ${OTH.assessed} percent of the taxable value. Commercial property: ${COM.appraised} percent of value, ${COM.assessed} percent of the taxable value.`;
  const svg = `<svg role="img" aria-label="${aria}" viewBox="0 0 ${W0} ${18 + 3 * rowH - 22}" style="font-family:var(--sans)">${rows}</svg>`;
  return `<figure class="rt-fig rt-side"><div class="cap">Horry County rentals are ${OTH.appraised}% of the value but ${OTH.assessed}% of the taxable value</div>${svg}`
    + `<figcaption>Gray bar: share of the value the county assessor counts. Brass bar: share of the taxable value, after the 4% and 6% rates. The figures are for 2018, from the Lincoln Institute of Land Policy study. Rental property is the study's "other residential" class, which it describes as typically rental property at 6%.</figcaption></figure>`;
})();

/* Where the city bill goes (F144 parts of F145). */
const PARTS_CHART = G.bars([
  { name: "School operating tax", value: PARTS.schoolOps, valueText: money(PARTS.schoolOps) },
  { name: "City of Myrtle Beach", value: PARTS.city, valueText: money(PARTS.city) },
  { name: "Horry County", value: PARTS.county, valueText: money(PARTS.county) },
  { name: "School debt", value: PARTS.schoolDebt, valueText: money(PARTS.schoolDebt) },
], { caption: `The largest part of the ${money(MB.six)} on the ${money(PRICE)} city rental is the school operating tax`, nameLabel: "Who gets it", valueLabel: "a year", max: PARTS.schoolOps, compact: true,
  note: "Horry County's 2026 tax rates, at the 6% rental rate. A home its owner lives in pays no school operating tax." });

/* Short run and long run (predictions.md section 5, with VERIFY.md's cuts). */
const RUNS = `<ul class="rt-runs" aria-label="What a rental tax cut could do, and what has to happen first">`
  + `<li class="first"><span class="k">First</span><b class="h">Nothing changes until lawmakers vote.</b><ul>`
  + `<li>No bill exists. A change needs two-thirds of each house, or an amendment that voters approve in November 2028.</li>`
  + `<li>Until then, a rental's bill stays at 6%.</li></ul></li>`
  + `<li><span class="k">Short run: the first 1 to 2 years</span><b class="h">More cash flow, from the tax line only.</b><ul>`
  + `<li>Our ${money(PRICE)} city rental would keep ${money(CUT_NARROW)} to ${money(CUT_HOME)} a year more.</li>`
  + `<li>Rents: no study we found measured how much of a tax cut reaches tenants here. A USC law student's note argues the 6% rate has pushed rents up.</li>`
  + `<li>Prices: a rental that nets more is worth more to a buyer. How much of the saving shows up in prices, no study here has measured.</li></ul></li>`
  + `<li><span class="k">Long run: 5 years or more</span><b class="h">Other owners pay a larger share, unless the state steps in.</b><ul>`
  + `<li>The two rates and Act 388's school exemption shifted the tax toward rentals and businesses, the Lincoln study found.</li>`
  + `<li>A cut would move tax the opposite way. About a sixth of the taxable value of the real property the county assessor values would come off, at 2018 shares. Homes their owners live in and businesses would pay a larger share, unless the state replaced it or spending fell.</li>`
  + `<li>Over time, a lower yearly tax could lift what buyers pay for rentals. We give no figure, because no study here has measured it.</li></ul></li></ul>`;
must(Math.round(CUT_NARROW / MB.six * 3) === 1 && Math.round(CUT_HOME / MB.six * 5) === 3, "a third to three fifths of the tax");

/* The past examples, side by side (F140 to F142, F149 to F152, F158). */
const PAST = `<div class="rt-tbl rt-stack"><div class="cap">What happened where this was tried before</div><table><thead><tr><th scope="col">Past example</th><th scope="col">What happened</th><th scope="col">What it points to here</th></tr></thead><tbody>`
  + `<tr><th scope="row">Act 388, South Carolina, 2006</th><td data-l="What happened">Homes their owners live in stopped paying school operating tax. A 1% sales tax paid the schools back. Rentals and businesses kept paying it.</td><td data-l="What it points to here">When one kind of property pays less, the others pay a larger share. A rental cut would move part of the tax back onto homes and businesses.</td></tr>`
  + `<tr><th scope="row">Florida's cap on non-homestead homes</th><td data-l="What happened">Florida caps the yearly rise in taxable value at 10% for a home of nine units or fewer that is not the owner's homestead. The cap covers every tax but the school tax. A homestead: 3% or inflation, whichever is lower.</td><td data-l="What it points to here">A state can slow the growth of a rental's bill without cutting its rate. We found no study of what the cap did to Florida rents or prices.</td></tr>`
  + `<tr><th scope="row">H. 3841, South Carolina, 2026</th><td data-l="What happened">A property tax bill on the 4% rate passed the House 109-0 and the Senate 43-0.</td><td data-l="What it points to here">Two-thirds is reachable when both parties agree. That bill was narrow; a rental rate change is larger.</td></tr>`
  + `</tbody></table></div>`;

/* Each side, the same tests (F060 to F062, F065, F070). */
const SIDES = `<div class="rt-tbl rt-stack"><div class="cap">What each candidate for governor said about property tax</div><table><thead><tr><th scope="col">Test</th><th scope="col">Alan Wilson, Republican</th><th scope="col">Jermaine Johnson, Democrat</th></tr></thead><tbody>`
  + `<tr><th scope="row">The goal</th><td data-l="Alan Wilson, Republican">"Reforming Act 388 to remove higher property taxes for rental properties"</td><td data-l="Jermaine Johnson, Democrat">Lowering property taxes</td></tr>`
  + `<tr><th scope="row">Names the rental rate</th><td data-l="Alan Wilson, Republican">Yes, the higher tax on rentals</td><td data-l="Jermaine Johnson, Democrat">Not in the summary</td></tr>`
  + `<tr><th scope="row">Other tax items</th><td data-l="Alan Wilson, Republican">Tax breaks for seniors and veterans, the car tax, business personal property, the income tax</td><td data-l="Jermaine Johnson, Democrat">Income tax relief for lower-income families, more affordable housing</td></tr>`
  + `<tr><th scope="row">Whose words</th><td data-l="Alan Wilson, Republican">His interview and his site; the agenda as news outlets reported it</td><td data-l="Jermaine Johnson, Democrat">WMBF's summary of his platform</td></tr>`
  + `</tbody></table></div>`;

const GLANCE = PK.glance([
  { icon: "tax", label: money(MB.six), text: `a year on a ${money(PRICE)} city rental at 6%` },
  { icon: "dollar", label: "A third or more off", text: "if rentals moved to 4%" },
  { icon: "key", label: `${HO.two_thirds} of ${HO.members}`, text: "House votes a change needs" },
]);

const FAQ = [
  { q: "Does the 6% rate apply to a condo I rent out?", a: "Yes. The 4% rate is only for the home the owner lives in and applies for. A condo, house or townhouse you rent out is taxed at 6%, whether it rents by the week or by the year." },
  { q: "Would a second home that is never rented get the cut?", a: "Lawmakers have not decided. Today the 6% rate covers every home its owner does not live in, rented or not. Lawmakers would decide which homes a change covers when they write the bill." },
  { q: "Does the 4% rate stay on a home after its owner dies?", a: "For a time, under a 2026 law. The home keeps the 4% rate until the estate closes or a deed out of it is recorded. At the latest, it keeps it until December 31 of the year after the death. It loses the rate if it is rented for more than 72 days." },
  { q: "Would a cut change the taxes a short-term rental collects from guests?", a: "No. The plan is about property tax. A weekly rental still collects the state's 7% accommodations tax and any local tax of up to 3%. A few rentals are exempt, such as a home rented for 14 days or fewer in a year." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Wilson's Act 388 Rental Tax Cut: What It Means in Myrtle Beach",
  description: "Alan Wilson wants to end the higher property tax on rentals. A $350,000 Myrtle Beach rental's bill at 6% and 4%, the votes it needs, and what could follow.",
  ogTitle: "What would Wilson's rental tax cut mean for Myrtle Beach?",
  crumb: "Rental tax cut",
  eyebrow: "Invest",
  h1: "What would Wilson's rental tax cut mean for Myrtle Beach?",
  h1em: "",
  sub: `A ${money(PRICE)} rental inside Myrtle Beach pays ${money(MB.six)} a year in property tax. What a lower rate would save, and the votes it needs.`,
  heroMedia: GLANCE,
  /* The text share card (Blog-Brain tools/ogcard.js), kept in this page's image folder; the lead may move it to og/ (NEEDS.md). */
  ogImage: "https://chapter3realty.com/images/2026-11-e/rental-property-tax-cut/share-card.jpg",
  heroCta: { title: "Own or want a rental here? We work out its tax at 6% and at 4%.", label: "Send us the rental", href: "/contact/" },
  author: "devin+abdulla",
  shortAnswer: [
    `Alan Wilson plans to look at reforming Act 388, the 2006 law behind part of the higher property tax on rentals. A ${money(PRICE)} rental inside Myrtle Beach pays ${money(MB.six)} a year at 6%. At 4%, it would pay ${money(MB.four)}, or ${money(MB.home)} if it were taxed like an owner's home.`,
    `No bill exists yet. The change needs two-thirds of each house of the legislature. By the unofficial count, Republicans are ${NEED_D} votes short of that in the House.`,
  ],
  sections: [
    { h2: "What did Alan Wilson say about the tax on rentals?", toc: "What Wilson said", id: "what-wilson-said", html: () => CSS + PH.css() +
      h.p(`Alan Wilson won the governor's race in the ${h.ext(SCEC, "unofficial count")}, 51.71% to 47.00%. Jermaine Johnson conceded on election night. The Associated Press had ${h.ext(GAZ, "not called the race")} when he did.`) +
      h.p("In an interview before the election, Wilson named the gap he wants to close:") +
      QUOTE +
      h.p(`His affordability agenda, as ${h.ext(FOX, "Fox Carolina")} and ${h.ext(HERE, "HERE Columbia")} reported it, lists "Reforming Act 388 to remove higher property taxes for rental properties". He has published no bill text, no new rate and no cost.`) +
      PH.aerial("myrtle-beach-oceanfront-rentals", "Oceanfront towers in Myrtle Beach. A unit in them that its owner rents out pays the 6% rate today.", { closeUp: true }) +
      h.h3("His other property tax plans") +
      h.p("The same agenda, as reported, also lists these:") +
      h.ul([
        "Enroll seniors automatically in their property tax break for older owners.",
        "Expand the property tax break for disabled veterans.",
        "Lower personal property taxes for commercial businesses.",
        "Eliminate the state income tax and overhaul property taxes.",
      ]) +
      h.p(`${h.ext(PRIOR, "His campaign site")} adds a pledge to "eliminate the car property tax for seniors and veterans". Our ${h.a("/market-reports/2026-election/", "guide to the 2026 election")} covers his other plans and the rest of the results. His plan for faster home permits is on ${h.a("/invest/horry-county-growth-roads-permits/", "our page on what the new leaders say about roads and growth")}.`) },

    { h2: "How much property tax does a Myrtle Beach rental pay now, and at 4%?", toc: "The tax at 6% and at 4%", id: "the-tax-now", html: () =>
      h.p(`At 4%, a Myrtle Beach rental would pay a third to three fifths less than it does at 6%. How much depends on whether a change also drops the school operating tax.`) +
      BILL_CHART +
      h.p(`Two rules make the gap. The ${h.ext(A10, "state constitution")} taxes a rental on 6% of its value and an owner's home on 4%. Since Act 388, an owner's home also pays no school operating tax. How the 4% and 6% rates work today is on our ${h.a("/buyers/property-taxes/", "Horry County property tax page")}.`) +
      h.p(`Wilson has not said which of the two he means, so the chart shows both. Our page on ${h.a("/buyers/act-388-changes/", "what Act 388 changes would mean")} has the law's history.`) +
      BOTH +
      h.h3("Your rental's numbers") +
      h.p("Type in the county's value of your rental. The tax rates are Horry County's for this year.") +
      CALC +
      h.p(`These bills are before credits and fees. Our ${h.a("/buyers/property-taxes/", "Horry County property tax guide")} has the credits an owner who lives in the home gets.`) +
      h.h3("If you buy a rental") +
      h.p(`When a rental sells, the ${h.ext(C37, "county exempts 25%")} of its value at the sale. The exemption cannot bring the taxable value below the county's current value of the parcel. The buyer applies to the county assessor before January 31 of the first tax year.`) },

    { h2: "Can the governor cut the tax on rentals by himself?", toc: "The votes it needs", id: "votes-it-needs", html: () =>
      h.p(`No. Lawmakers can change the 6% rate without a statewide vote, but ${h.ext(A10, "only with two-thirds")} of the members of each house. That is ${HO.two_thirds} House votes and ${SE.two_thirds} Senate votes.`) +
      VOTES +
      h.p(`Republicans won ${HO.republicans_unofficial_2026} House seats in the unofficial count. Even with every Republican voting yes, a change needs ${NEED_D} Democratic votes in the House. In the Senate, Republicans hold more seats than the two-thirds needs.`) +
      h.p(`Two House races were close enough for a recount under state law, one led by each party. The Republican count could still move by a seat either way.`) +
      h.p(`There are two ways to make the change:`) +
      ROUTES +
      h.p(`One pending bill, ${h.ext(S815, "S. 815")}, would amend the constitution so lawmakers could set the classes and rates by ordinary law. It is in the Senate Finance Committee.`) },

    { h2: "What would a rental tax cut cost Horry County and its schools?", toc: "What it would cost", id: "what-it-would-cost", html: () =>
      h.p(`Suppose every home now taxed at 6% moved to 4%. At 2018 shares, that would take about a sixth of the taxable value off the real property the county assessor values. The county, the cities and the schools would collect less, unless someone else paid more.`) +
      SHARES +
      h.p(`In 2018, rental property was ${OTH.appraised}% of the value the county assessor counts, but ${OTH.assessed}% of the taxable value. At 4%, rentals' taxable value would fall by a third.`) +
      h.p(`The ${h.ext(LINC, "study behind these shares")} is by the Lincoln Institute of Land Policy. The South Carolina Chamber Foundation and South Carolina Realtors picked the ten counties it studied. It found the tax had shifted "from owner-occupied residential properties to non-owner-occupied residential properties as well as commercial, manufacturing, and utility properties."`) +
      PARTS_CHART +
      h.p(`The school operating tax is the largest part of a rental's bill. For homes their owners live in, ${h.ext(C11, "a state fund")} filled by Act 388's 1% sales tax pays the school districts back. Wilson has not said whether the state would do the same for rentals.`) +
      h.h3("Who says the gap is unfair, and who backs it") +
      h.p(`A ${h.ext(USC, "2025 student note")} in a University of South Carolina law journal argues the higher rate shifts the tax onto renters. It says the rate "can also prevent the development of affordable housing". The Lincoln study puts the yearly tax in South Carolina at about 0.5% of value for a home its owner lives in. For an apartment renter's property, it is slightly above 1.5%.`) +
      h.p(`On the other side, groups such as nohometax.org back Act 388 as it is. The same note cites the group's page, titled "We Support Act 388".`) },

    { h2: "What could a rental tax cut do to cash flow and prices?", toc: "Short run and long run", id: "short-and-long-run", html: (bg) =>
      h.p(`In the first year or two, a cut would raise cash flow on the tax line, by a third or more of the bill. Over five years or more, past examples point to other owners paying a larger share, unless the state paid the difference.`) +
      RUNS +
      PAST +
      h.p(`None of this is a forecast of what lawmakers will pass. It is what the same mechanism did before, with the size of the change our arithmetic gives.`) +
      h.cta("Buying a rental before lawmakers vote?", "Send us the listing. We work out its tax at 6% today and at 4%, so the price you offer rests on the bill it pays now.", "Send us the listing", "/contact/", bg) },

    { h2: "What did Jermaine Johnson and the Democrats say about property tax?", toc: "What Democrats said", id: "what-democrats-said", html: () =>
      h.p(`Johnson's platform, as ${h.ext(WMBF, "WMBF summarized it")}, called for lowering property taxes, income tax relief for lower-income families and "building more affordable housing". The summary does not say which property taxes he would lower.`) +
      SIDES +
      h.p(`In the House, a rental change needs Democratic votes. At today's count, if ${BLOCK} of the ${HO.democrats_unofficial_2026} Democrats voted no, it would fail even with every Republican voting yes.`) +
      h.p(`Annie Andrews, the Democrat who won the U.S. Senate seat, works on federal law, and the property tax here is state and local. Her housing plan backs a ${h.a("/buyers/first-time-buyer-tax-credit/", "$50,000 federal tax cut for first-time buyers")}.`) },

    { h2: "What should a Myrtle Beach rental investor do while this is debated?", toc: "What we do now", id: "what-we-do-now", html: () =>
      h.p(`Buy and sell on the tax a rental pays today. A plan with no bill can change before it passes, or never pass.`) +
      h.p(`In Chapter3's experience, property tax stops more rental deals here than insurance does. When you buy or sell a rental, our agents check its numbers three ways:`) +
      h.ul([
        "On the 6% bill it pays today, with the 25% exemption where it applies.",
        "On the 4% bills beside it, so you see what a change would be worth without paying for it up front.",
        "On the buyer's tax, which rests on the new price and can be higher than the seller's.",
      ]) +
      h.p(`Our ${h.a("/invest/run-the-numbers/", "rental numbers guide")} adds the rest of the costs.`) +
      h.p(`If you rent by the week, our page on ${h.a("/invest/short-term-rental-rules-statehouse/", "which short-term rental rules a new Statehouse can change")} covers the other half of the law.`) },
  ],
  faqTitle: "Rental property tax questions",
  faq: FAQ,
  sources: [
    { name: "S.C. Constitution Art. X", href: A10 },
    { name: "Art. XVI", href: A16 },
    { name: "S.C. Code 12-43", href: C43 },
    { name: "12-37", href: C37 },
    { name: "11-11-155", href: C11 },
    { name: "12-36", href: C36 },
    { name: "Horry County 2026 levy", href: LEVY_PDF },
    { name: "H. 3841", href: H3841 },
    { name: "S. 815", href: S815 },
    { name: "SC Election Commission", href: SCEC },
    { name: "SC Daily Gazette", href: GAZ },
    { name: "WIS", href: WIS },
    { name: "Fox Carolina", href: FOX },
    { name: "HERE Columbia", href: HERE },
    { name: "Wilson's priorities", href: PRIOR },
    { name: "WMBF", href: WMBF },
    { name: "Lincoln Institute", href: LINC },
    { name: "USC law note", href: USC },
    { name: "Florida Constitution Art. VII", href: FLA },
  ],
  sourcesNote: "Bills are our arithmetic from the county's 2026 rates, before credits and fees. Election results are the unofficial count. Not legal or tax advice.",
  /* photos.js adds a general "resized these photos" line; this page's one photo already says it was cropped and resized (as on /hoa/reserves/). */
  afterSources: () => { const c = PH.credits(), G1 = '<div role="listitem">Chapter3 Realty resized these photos and cropped some of them. Each photo keeps the license listed with it.</div>'; if (!c.includes(G1)) throw new Error("photos.js changed its general credit line"); return c.replace(G1, ""); },
  bottomCta: { h2: "Buying or selling a Myrtle Beach rental?", p: "Send us the address. We work out its tax at 6% today and at 4%, and price it on the law as it stands.", label: "Send us the rental", href: "/contact/" },
  keywords: "Alan Wilson property tax, two-thirds vote assessment ratio, Jermaine Johnson property tax",
  about: "Governor-elect Alan Wilson's proposal to end the higher 6% property tax assessment ratio on South Carolina rental property, and its effect on rentals in Myrtle Beach and Horry County",
});
