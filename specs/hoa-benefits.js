/* /hoa/benefits/ - are HOA fees worth it on the Grand Strand: what a fee buys, line by line, from real budgets (The
 * Farm at Carolina Forest); the pool against a city pass (Myrtle Trace and The Farm); what a beach club adds (Del Webb
 * at Grande Dunes and Barefoot Resort); what a staffed gate costs to run; condo fees; whether an HOA shows up in asking
 * prices here; what you give up; and what we check before you offer.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this is its first spec and it replaces it. Plan: Blog-Brain
 * batches/2026-11-b/hoa-benefits/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows, and CORRECTED rows only in
 * the verifier's wording (VERIFY.md). Struck wording: batches/2026-11-b/facts/hoa-benefits-struck.json (30 entries).
 * Rows used: 1, 2 (CORRECTED: each home's share of the budget, about $108; plain labels), 3, 4, 5, 6, 7 (CORRECTED:
 * the operating line; reserves on top), 8, 9 (CORRECTED), 10, 11 (CORRECTED), 12 (CORRECTED: "says"), 16, 17, 18, 19 to 24, 25 (CORRECTED), 26 (CORRECTED: $15.13 only), 27 (CORRECTED), 28 to 30 (30 CORRECTED:
 * senior rates beside Myrtle Trace, new chart title), 31 to 34, 35, 36 (CORRECTED: "a boat ramp"; the listing feed, not
 * Horry County), 37 (CORRECTED: "of the concerns the state names"), 39, 40, 41, 43, 44, 46 and 47 (VERIFIED-BY-FIXER, fix round 1); and 2026-11-a row 21 (Fannie
 * Mae deductible limit) and The Farm row 13 (the 20 percent cap), both verified.
 * Not on this page: row 15 (Pulte's 2017 claim, cut in fix round 1: it pulled against row 11), rows 13 and 14 (STRUCK: no per-lot Ocean Club or yard-care figure), the guard count and the yearly
 * wage (row 26), "one household could not buy it", any named oceanfront building's fee, the hub's per-$100 bars, any
 * verdict on a named HOA, any rate or payment, anything about who lives anywhere.
 * Data, never typed: data/2026-11-b/hoa-benefits/ (findings.json, chart-farm-fee.json, chart-pool.json,
 * chart-price-by-beach.json, chart-complaints.json). The files keep the researcher's first labels; the corrected
 * labels are mapped here.
 * Design, as /buyers/condo-in-litigation/ and /invest/non-warrantable-condos/ (owner-approved 2026-11-08): the italic
 * line at about half the H1's size, one card style for the charts and the offers, plain lists under thin rules, one
 * block width of 720 px, an offer after about every second section.
 * Homes: four strips, one per named community (the-farm, myrtle-trace, del-webb-grande-dunes, barefoot-resort), each
 * with a bold, true title and its pill as the fallback. The places exist; the lead adds this page to their pages and
 * gives the edge feed withStrips (BUILD.md).
 * Photo: The Farm's large pool from above (NOAA NGS, public domain; record in data/2026-10-b/photos.json, file copied
 * into images/2026-11-b/hoa-benefits/).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));

const SELF = "/hoa/benefits/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "hoa-benefits");
const IMG = "/images/2026-11-b/hoa-benefits";
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), CA = read("chart-farm-fee.json"), CB = read("chart-pool.json");
const CC = read("chart-price-by-beach.json"), CD = read("chart-complaints.json");
const must = (ok, msg) => { if (!ok) throw new Error(`hoa-benefits.js: ${msg}`); };
const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
const NB = " ";

/* ---- Rows 1 to 3: The Farm's fee and its budget, per home. ---- */
const FARM = F.farm;
must(FARM.homes === 1571 && FARM.dues_month_2027 === 107 && FARM.dues_month_2026 === 107, "row 1 moved");
must(FARM.budget_2027 === 2031964 && FARM.cable_2027 === 804981, "row 3 moved");
const CABLE_CENTS = Math.round(FARM.cable_2027 / FARM.budget_2027 * 100);
must(CABLE_CENTS === 40, "row 3: about 40 cents of each dollar");
/* Row 2 (CORRECTED): plain labels, the verifier's wording. The bars add to about $108: each home's share of the budget. */
const LABEL_A = {
  "Cable TV": "Cable TV",
  "Trash pickup": "Trash pickup",
  "Lawns, landscaping and ponds": "Common-area landscaping and ponds",
  "Management company": "The management company",
  "Power for shared areas": "Power for shared areas",
  "Savings for repairs": "Savings for future projects",
  "Two pools": "The two pools",
  "Insurance": "Insurance",
  "Everything else": "All other lines",
};
must(CA.rows.length === 9 && CA.rows.every((r) => LABEL_A[r.label]), "chart-farm-fee.json labels moved");
const A_ROWS = CA.rows.map((r) => ({ name: LABEL_A[r.label], value: r.month }));
const A_SUM = Math.round(CA.rows.reduce((t, r) => t + r.month, 0));
must(A_SUM === 108 && Math.round(CA.rows[0].month) === 43 && Math.round(CA.rows[1].month) === 13, "row 2 moved");
const SHARE_HALF = Math.round((CA.rows[0].month + CA.rows[1].month) / A_SUM * 100);
must(SHARE_HALF >= 48 && SHARE_HALF <= 55, "row 2: cable and trash are about half");
const POOL_FARM = Math.round(FARM.per_home_month_2027["Two pools"] * 12);
must(POOL_FARM === 63, "row 30: The Farm's pool line, about $63 a home a year");

/* ---- Rows 7 to 9: Myrtle Trace. ---- */
const MT = F.myrtle_trace;
must(MT.homes === 518 && MT.dues_month === 95 && Math.round(MT.pool_and_lakes_year) === 77, "row 7 moved");

/* ---- Rows 28 to 30: a year at a city pool and gym. ---- */
const PP = F.public_pool;
must(PP.mb_adult_resident === 175 && PP.mb_adult_nonresident === 295 && PP.mb_senior_resident === 125 && PP.mb_senior_nonresident === 210, "row 28 moved");
must(PP.nmb_individual[1] === 555 && PP.nmb_senior_individual[1] === 465, "row 29 moved");
must(CB.rows.map((r) => r.year).join() === "77,63,175,295,555", "chart-pool.json moved");

/* ---- Rows 26, 27: the gate. ---- */
const GT = F.gate;
must(GT.guard_median_hourly === 15.13 && GT.hours_in_a_year === 8760 && GT.split_examples["500"] === 22.09, "rows 26, 27 moved");
const GATE_YEAR = Math.round(GT.guard_median_hourly * GT.hours_in_a_year / 500) * 500;
must(GATE_YEAR === 132500, "row 27: about $132,500");

/* ---- Rows 31 to 34: the price test. ---- */
const PT = F.price_test, B2 = PT.built_2000_plus, AA = PT.all_ages;
must(B2.with_fee_ppsf === 205 && B2.no_fee_ppsf === 274 && B2.with_fee_acres === 0.2 && B2.no_fee_acres === 0.53, "row 31 moved");
must(AA.zips_compared === 13 && AA.zips_fee_higher === 1 && B2.zips_compared === 10 && B2.zips_fee_higher === 0, "row 32 moved");
const BANDS = CC.rows;
must(BANDS.map((b) => `${b.with_fee_ppsf}/${b.no_fee_ppsf}`).join() === "340/417,255/298,199/225,178/228", "row 33 moved");
must(BANDS.every((b) => b.no_fee_acres > b.with_fee_acres), "row 33: the no-fee house has more land in every band");
must(Math.round(BANDS[1].share_with_fee_pct) === 91 && Math.round(BANDS[2].share_with_fee_pct) === 96, "row 34 moved");

/* ---- Row 36 (CORRECTED): what a fee house rarely lists, in the whole listing feed. ---- */
const TO = F.trade_offs;
must(TO.rv_boat_parking_pct_with_fee === 2.9 && TO.rv_boat_parking_pct_no_fee === 30.5 && TO.boat_ramp_pct_with_fee === 8.9 && TO.boat_ramp_pct_no_fee === 2.0, "row 36 moved");

/* ---- Row 37 (CORRECTED): the complaints, the state's labels in plain words. ---- */
const SC = read("from-2026-11-a/scdca-concerns.json").total;
must(SC.horry_complaints === 416 && SC.pct_of_complaints.Other === 22.1, "row 37: Other is 22.1 in 100");
const OTHER = Math.round(SC.pct_of_complaints.Other);
const LABEL_D = {
  "Failure to adhere to and/or enforce covenants and bylaws": "Did not follow or enforce its own rules",
  "Concerns regarding maintenance or repairs": "Maintenance or repairs",
  "Request to access information/ view documents ignored": "Did not answer a request to see documents",
  "Concerns on Allocation of HOA funds": "How the HOA spends its money",
  "Consumer disagrees with HOA Fees/Special Assessments": "Disagrees with the fees or a special assessment",
  "Failure to notify residents of Board actions": "Did not tell owners about board actions",
  "Failure to produce financial statements": "Did not produce financial statements",
  "Issue related to Board Elections": "Board elections",
};
must(CD.complaints === 416 && CD.rows.length === 8 && CD.rows.every((r) => LABEL_D[r.concern]), "chart-complaints.json moved");
must(Math.round(CD.rows[0].pct) === 36 && Math.round(CD.rows[1].pct) === 30, "row 37 moved");

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const FARM27 = "https://www.farmatcarolinaforest.com/uploads/documents_page/The%20Farm%20@%20Carolina%20Forest%20HOA%20-%20Budget%20Summary%20Report%20NEW%20DNU.pdf";
const MT26 = "https://myrtletracesc.org/wp-content/uploads/AnnualMeetingCommitteeReports/2026/2026AAnnualMeetingDocuments.pdf";
const MTRULES = "https://myrtletracesc.org/wp-content/uploads/MTHOA-Policies-2025/MTHOAPropertyCommitteeGuidelines2026.pdf";
const DWDECL = "https://www.delwebbatgrandedunes.com/ResourceCenter/Download/48372~3083079";
const GDOC = "https://grandedunescommunities.sites.townsq.io/2";
const BRRA = "https://www.barefoothoa.com/amenities/";
const OEWS = "https://www.bls.gov/oes/current/oes_34820.htm";
const MBREC = "https://cityofmyrtlebeach.com/departments/recreation_center_memberships.php";
const NMBAFC = "https://afc.nmb.us/174/Membership";
const STUDY = "https://econpapers.repec.org/RePEc:eee:juecon:v:112:y:2019:i:c:p:1-15";
const SCDCA = "https://www.consumer.sc.gov/HOA-reports";
const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const FNMA = "https://selling-guide.fanniemae.com/sel/b7-3-03/master-property-insurance-requirements-project-developments";
const AHS = "https://www2.census.gov/programs-surveys/ahs/2023/";
const ASK = "/contact/";
const PHONE = "854.333.2135";

/* ---- V1: where The Farm's fee goes, per home a month (rows 1 to 3). Cable TV in the accent; the rest neutral. ---- */
const CHART_A = G.bars(A_ROWS.map((r, i) => ({ name: r.name, value: r.value, valueText: usd(r.value), reference: i !== 0 })),
  { caption: `The Farm spends about $${Math.round(CA.rows[0].month)} of each home's $107 fee on cable TV`, nameLabel: "Budget line", valueLabel: "Each home's share a month", compact: true,
    note: `Each home's share of the HOA's newest approved budget is about $${A_SUM} a month: $107 from the fee, and the rest from transfer fees, rent and key cards.` });

/* ---- V2: a year of pool (rows 28 to 30, CORRECTED). The HOA lines in the accent, the city passes neutral, each with its
   senior price beside it (Myrtle Trace is a 55+ community). ---- */
const CHART_B = G.bars([
  { name: "The Farm, each home's share", value: POOL_FARM, valueText: usd(POOL_FARM), feature: "two outdoor pools" },
  { name: "Myrtle Trace, each home's share", value: Math.round(MT.pool_and_lakes_year), valueText: usd(MT.pool_and_lakes_year), feature: "the pool and fifteen ponds" },
  { name: "Myrtle Beach city pass, resident", value: PP.mb_adult_resident, valueText: usd(PP.mb_adult_resident), feature: `$${PP.mb_senior_resident} at 55 and up`, reference: true },
  { name: "Myrtle Beach city pass, nonresident", value: PP.mb_adult_nonresident, valueText: usd(PP.mb_adult_nonresident), feature: `$${PP.mb_senior_nonresident} at 55 and up`, reference: true },
  { name: "North Myrtle Beach center pass", value: PP.nmb_individual[1], valueText: usd(PP.nmb_individual[1]), feature: `$${PP.nmb_senior_individual[1]} at 62 and up`, reference: true },
], { caption: "A year of pool: a home's share of the pool line, or one adult's city pass", nameLabel: "Pool", featureLabel: "what it covers or the senior price", valueLabel: "A year", compact: true,
  note: "HOA rows: the pool line in each budget, divided by its homes, before power, insurance and repair savings. City rows: one adult aged 18 to 54 (24 and up in North Myrtle Beach), with a gym." });

/* ---- V3: asking price a square foot by distance from the beach, two bars a band (rows 31, 33). ---- */
const C_MAX = Math.max(...BANDS.map((b) => Math.max(b.with_fee_ppsf, b.no_fee_ppsf)));
const BAND_NAME = { "under 1 mile": "Under 1 mile from the beach", "1 to 3 miles": "1 to 3 miles", "3 to 10 miles": "3 to 10 miles", "over 10 miles": "Over 10 miles" };
must(BANDS.every((b) => BAND_NAME[b.band]), "chart-price-by-beach.json bands moved");
const acre = (v) => (v === 1 ? "1 acre" : `${v.toFixed(2).replace(/^0/, "0")} acre`);
const C_CAP = "Newer houses with an HOA fee list for less a square foot, near the beach and far from it";
const pf = (v) => Math.round(v / C_MAX * 1000) / 1000;
const CHART_C = `<figure class="c3-gchart hb-pc"><table class="hb-tab"><caption>${C_CAP}</caption>`
  + `<thead><tr><th scope="col">Distance from the beach</th><th scope="col">Middle asking price a square foot</th></tr></thead><tbody>`
  + BANDS.map((b) => `<tr><th scope="row"><span class="n">${BAND_NAME[b.band]}</span><span class="f">Lot: ${acre(b.with_fee_acres)} with a fee, ${acre(b.no_fee_acres)} without</span></th>`
    + `<td><span class="hb-ln"><span class="b" style="--f:${pf(b.with_fee_ppsf)}" aria-hidden="true"></span><span class="v">$${b.with_fee_ppsf} with a fee</span></span>`
    + `<span class="hb-ln nf"><span class="b" style="--f:${pf(b.no_fee_ppsf)}" aria-hidden="true"></span><span class="v">$${b.no_fee_ppsf} no fee</span></span></td></tr>`).join("")
  + `</tbody></table><figcaption>Houses for sale built in 2000 or later, in Horry County ZIP codes. Middle asking price a square foot. Distance in a straight line. The two middle bands have few houses with no fee (${BANDS[1].n_none} and ${BANDS[2].n_none}).</figcaption></figure>`;

/* ---- V4: what owners complain to the state about (row 37, CORRECTED). The top concern in the accent. ---- */
const CHART_D = G.bars(CD.rows.map((r, i) => ({ name: LABEL_D[r.concern], value: r.pct, valueText: `${Math.round(r.pct)} in 100`, reference: i !== 0 })),
  { caption: "What Horry County owners complain to the state about their HOA", nameLabel: "Concern", valueLabel: "Complaints that name it", max: 100, compact: true,
    note: `${CD.complaints} complaints from Horry County to SC Consumer Affairs, 2022 to 2025. A complaint can name several concerns. About ${OTHER} in 100 named one the state files as other.` });

/* ---- The photo (record: data/2026-10-b/photos.json, the-farm-pool-from-above-2026; NOAA NGS, public domain). ---- */
const POOL_ALT = "The Farm at Carolina Forest from above in winter, labelled: a large curving blue pool with a wide deck and two palm islands beside a dark pond, and a white-roofed activity center at the lower left";
const PHOTO = `<figure class="hb-ph"><img src="${IMG}/the-farm-pool-from-above-2026-1200w.webp" srcset="${IMG}/the-farm-pool-from-above-2026-600w.webp 600w, ${IMG}/the-farm-pool-from-above-2026-1200w.webp 1200w" sizes="(max-width: 760px) 100vw, 720px" width="1200" height="900" loading="lazy" decoding="async" alt="${POOL_ALT}">`
  + `<figcaption>The Farm's large pool and activity center from above. The HOA keeps up two pools. <span class="cr">Photo: NOAA National Geodetic Survey, public domain. Labels by Chapter3 Realty.</span></figcaption></figure>`;

/* ---- The page's own styles, as /buyers/condo-in-litigation/: one card style (the glass surface of the charts and the
   offers), lists under thin rules, one block width. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  + `${S} .c3-gchart,${S} .hb-plain,${S} .hb-ph,${S} .c3-offer{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}${S} .c3-gchart .v{font-weight:600}`
  /* the price chart: two thin bars a band, the no-fee bar in slate, the value after each */
  + `${S} .hb-tab{width:100%;border-collapse:collapse;font-family:var(--sans);color:var(--navy)}`
  + `${S} .hb-tab caption{text-align:left;font-weight:600;font-size:1.1em;line-height:1.35;padding:0 0 1rem;color:var(--navy)}`
  + `${S} .hb-tab thead th{font-size:.9rem;font-weight:500;color:var(--muted);text-align:left;padding:0 1rem .45rem 0;border-bottom:1px solid rgba(28,32,40,.25)}`
  + `${S} .hb-tab tbody th{text-align:left;font-weight:400;padding:.75rem 1.2rem .75rem 0;vertical-align:top;border-bottom:${RULE};width:42%}`
  + `${S} .hb-tab td{padding:.75rem 0;border-bottom:${RULE};vertical-align:top}${S} .hb-tab tbody tr:last-child>*{border-bottom:0}`
  + `${S} .hb-tab .n{display:block;color:var(--navy);font-weight:600}${S} .hb-tab .f{display:block;font-size:.95rem;color:var(--muted);margin-top:.1rem;line-height:1.4}`
  + `${S} .hb-tab td .hb-ln+.hb-ln{margin-top:.35rem}`
  + `@media (max-width:599px){${S} .hb-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}${S} .hb-tab,${S} .hb-tab tbody,${S} .hb-tab caption{display:block;width:100%}${S} .hb-tab tr{display:block;padding:.7rem 0;border-bottom:${RULE}}${S} .hb-tab tbody tr:last-child{border-bottom:0}${S} .hb-tab tbody th,${S} .hb-tab td{display:block;width:auto;border:0;padding:0}${S} .hb-tab td{margin-top:.45rem}}`
  + `${S} .hb-pc .hb-ln{display:flex;align-items:center;gap:.6rem;min-width:0}`
  + `${S} .hb-pc .b{width:calc((100% - 8.6rem) * var(--f));height:.7rem}`
  + `${S} .hb-pc .nf .b{background:#5c6b78}${S} .hb-pc .nf .v{font-weight:500}`
  /* the photo */
  + `${S} .hb-ph{margin:1.5rem 0 1.7rem}${S} .hb-ph img{display:block;width:100%;height:auto;border-radius:18px;border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.1)}`
  + `${S} .hb-ph figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}${S} .hb-ph .cr{display:block;font-size:.85rem;margin-top:.15rem}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .hb-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .hb-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .hb-plain li:last-child{border-bottom:${RULE}}${S} .hb-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  + `${S} ol.hb-plain{counter-reset:hb}${S} ol.hb-plain li{counter-increment:hb;padding-left:2.2rem;position:relative}`
  + `${S} ol.hb-plain li::before{content:counter(hb);position:absolute;left:0;top:.85rem;width:1.55rem;height:1.55rem;border-radius:50%;background:var(--navy);color:#fff;font:600 .9rem/1.55rem var(--sans);text-align:center}`
  + `${S} .hx-strip+.hx-fallback .c3-offer{margin:.6rem 0 1.6rem}${S} .hx-strip:not(:empty){margin:1.2rem 0 2rem}`
  /* Work-arounds copied from /buyers/condo-in-litigation/: the feed's search row at 320 px, the header phone at
     1000 to 1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="hb-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const steps = (items) => `<ol class="hb-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ol>`;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage, not a law firm or a tax adviser. This page is general information, not legal or tax advice. We do not publish an opinion about any named association.</p>`;

/* ---- The homes strips: one per named community, each title bold and true while its rows hold. ---- */
const pill = (place) => G.offer(place, { label: `Get the homes for sale in ${place}` });
const STRIP_FARM = G.homes("the-farm", "The Farm", pill("The Farm"), "Homes in The Farm, with pools open until 9 p.m. all season");           // row 46 (TF row 61)
const STRIP_MT = G.homes("myrtle-trace", "Myrtle Trace", pill("Myrtle Trace"), "Myrtle Trace homes with fifteen ponds to fish");                 // rows 8, 9
const STRIP_DW = G.homes("del-webb-grande-dunes", "Del Webb at Grande Dunes", pill("Del Webb at Grande Dunes"), "Del Webb homes with a membership in the Grande Dunes Ocean Club"); // row 12
const STRIP_BR = G.homes("barefoot-resort", "Barefoot Resort", pill("Barefoot Resort"), "Barefoot homes with an ocean cabana and a waterway pool for members"); // rows 19, 21

/* The FAQ repeats only questions the page answers, short and in other words. Plain characters only. */
const FAQ = [
  { q: "Are HOA fees a waste of money?", a: `Not when the fee buys what you would pay for anyway. In The Farm at Carolina Forest, the HOA spends about $${Math.round(CA.rows[0].month)} of each home's $107 monthly fee on cable TV, and trash pickup is the next largest line.` },
  { q: "Do HOA homes sell for more in Myrtle Beach?", a: `Not by asking prices. Newer houses with an HOA fee list for less a square foot than newer houses without one in all ${B2.zips_compared} Horry County ZIP codes we could compare.` },
  { q: "Is a gated community worth the HOA fee?", a: `Only if you want a staffed gate. One post staffed all year costs about ${usd(GATE_YEAR)} in a guard's pay alone, about $${Math.round(GT.split_examples["500"])} a home a month if 500 homes share it.` },
  { q: "Can an HOA raise its fees in South Carolina?", a: "Yes. State law puts no cap on dues or special assessments. The limits are in each community's own recorded rules and bylaws." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA", url: "/hoa/" },
  title: "Are HOA Fees Worth It? What $107 Buys in Myrtle Beach",
  description: "What a Grand Strand HOA fee buys, from real budgets: $43 of The Farm's $107 is cable TV. The pool, the beach club, the gate, and what you give up.",
  ogTitle: "Are HOA fees worth it on the Grand Strand? What real budgets buy: the pool, the beach club, the gate, and what you give up",
  crumb: "Are HOA Fees Worth It?",
  eyebrow: "HOA fees",
  h1: "Are HOA fees worth it on the Grand Strand?",
  h1em: "Yes, when the fee buys what you would pay for anyway.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: "Whether HOA fees are worth it, from real Grand Strand budgets priced per home against what the same things cost alone.",
  heroMedia: CSS + G.homesCss(),
  heroCta: { title: "Found a home with an HOA fee? We find out what it buys.", label: "Have us price a home's fee", href: ASK },
  author: "devin",
  shortAnswer: [
    `A homeowners association (HOA) fee is worth it when it buys things you would pay for anyway, for less than they cost alone. In The Farm at Carolina Forest, the HOA spends about $${Math.round(CA.rows[0].month)} of each home's $107 monthly fee on cable TV.`,
    `The budget's pool line there comes to about $${POOL_FARM} a home a year, less than one adult's year at a city pool. The trade-off is room: newer houses with a fee sit on smaller lots, and few houses with a fee list a place to park a boat.`,
  ],
  sections: [
    { h2: "What does an HOA fee pay for?", toc: "What a fee buys", id: "what-it-buys", html: () =>
      h.p(`The Farm at Carolina Forest is a neighborhood of ${FARM.homes.toLocaleString("en-US")} homes outside any city limit, with a Myrtle Beach mailing address. Its main HOA fee is $107 a month, and its newest budget keeps it at $107.`) +
      h.p(`The HOA buys cable TV from Spectrum for its homes, the largest line in the budget at about ${CABLE_CENTS} cents of each dollar. Trash pickup, which the HOA hires, is the next largest.`) +
      CHART_A +
      h.p(`Cable TV and trash pickup take about half of each home's share. If you would pay for cable TV anyway, about $${Math.round(CA.rows[0].month)} of the fee is a bill you already have.`) +
      h.p(`The rest keeps up the shared land and its ponds, two pools, an activity center and a clubhouse with a fitness room. It also pays the company that runs the HOA.`) +
      h.p(`From April 15 to October 15, both pools stay open until 9${NB}p.m., so a swim after work is part of what the fee buys.`) +
      PHOTO +
      h.p(`Other communities put other services in the fee. In Del Webb North Myrtle Beach, the fee is $315 a month on most homes for sale or recently sold. The builder lists lawn care and a 175-channel TV package in it.`) +
      plain([
        ["On The Farm's north edge", "The state bought land there for a nature preserve. That land holds habitat for the Venus flytrap."],
        ["The trade-off", "No private pool on a lot. A boat, trailer, camper or RV may be kept outside only with the HOA's written approval; pickups and SUVs are fine."],
      ]) +
      h.p(`Our page about ${h.a("/hoa/", "Myrtle Beach HOA fees")} shows what fees include for a typical house, townhouse or condo. Our ${h.a("/submarkets/carolina-forest/the-farm/", "guide to The Farm")} covers daily life there.`) +
      STRIP_FARM },

    { h2: "Is the pool worth the HOA fee?", toc: "The pool", id: "pool", html: (bg) =>
      h.p(`The pool is worth it for a household that swims. The pool line in the budget comes to about $${POOL_FARM} a home a year at The Farm, and about $${Math.round(MT.pool_and_lakes_year)} at Myrtle Trace with its ponds.`) +
      h.p(`A year at a city pool and gym in Myrtle Beach costs an adult aged 18 to 54 $${PP.mb_adult_resident} to $${PP.mb_adult_nonresident}. North Myrtle Beach's Aquatic and Fitness Center costs $${PP.nmb_individual[1]} for one adult.`) +
      CHART_B +
      h.p(`The two are not the same thing. A city pass is for one person and adds a gym. The Farm's pools are outdoors and open from mid-April to mid-October.`) +
      h.h3("Myrtle Trace: fifteen ponds to fish") +
      h.p(`Myrtle Trace is a 55+ community whose HOA owns 42 acres of common land besides its roads, with fifteen ponds. Residents and their house guests may fish the ponds from common land; every fish is released.`) +
      h.p(`The HOA uses its $${MT.dues_month} monthly fee to keep up the pool, the clubhouse, the roads, the common areas and the ponds. Large pond and pool repairs come from its reserve fund, on top of the pool line.`) +
      plain([
        ["On the ponds", "Swimming and recreational boats are not allowed."],
        ["In the driveway", "Trucks go in the garage when not in use. Boats, campers and RVs park by permit at the clubhouse lot."],
      ]) +
      h.p(`We have a full ${h.a("/buyers/55-plus-communities/myrtle-trace/", "guide to Myrtle Trace")}.`) +
      STRIP_MT +
      h.cta("Get the budget behind the fee", "Name the community. We get its budget and show you what each home's share pays for.", "Have us get the budget", ASK, bg) },

    { h2: "Is a beach club worth a higher HOA fee?", toc: "Beach clubs", id: "beach-club", html: () =>
      h.p(`A beach club is worth a higher fee for an owner who will use it often. Two places here have one: the Grande Dunes Ocean Club for Del Webb at Grande Dunes owners, and a private ocean cabana in parts of Barefoot Resort. A Del Webb house lists a fee of about $400 a month, against about $95 for a typical house here.`) +
      h.h3("Del Webb at Grande Dunes: the Ocean Club") +
      h.p(`The Grande Dunes master association says a Grande Dunes homeowner gets a household membership in the Grande Dunes Ocean Club. It lists Del Webb among its neighborhoods.`) +
      plain([
        ["The Ocean Club", "A large outdoor pool and whirlpool, private beach access, and classes, clubs, dining and entertainment."],
        ["The amenity center", "The community's posted rules list indoor and outdoor pools, a fitness center, tennis, pickleball and bocce courts and a day dock, with a lifestyle director."],
        ["Not allowed", "Sheds and above-ground pools."],
      ]) +
      h.p(`What you pay: every owner pays a mandatory Beach Club fee to the Grande Dunes master association, on top of the association's own assessments.`) +
      h.p(`A Del Webb house lists a fee of about $400 a month. We check what that figure covers, and what the master association bills on top, before you offer.`) +
      h.p(`Our ${h.a("/buyers/55-plus-communities/del-webb-grande-dunes/", "Del Webb at Grande Dunes guide")} covers the rest of the community.`) +
      STRIP_DW +
      h.h3("Barefoot Resort: an ocean cabana and a waterway pool") +
      h.p(`Barefoot Resort's residential association gives owners in its member neighborhoods a private cabana on the ocean in North Myrtle Beach, and more:`) +
      plain([
        ["The Beach Cabana", "Owner parking and a beach gate opened by key fob, a kitchen, showers, an elevator and staff attendants."],
        ["A beach shuttle", "In season, a shuttle takes owners to and from the beach."],
        ["The North Tower pool", "Beside the Intracoastal Waterway, it holds about 356,000 gallons."],
        ["The Residents' Club", "For most single-family neighborhoods: a 5,000-square-foot club with a pool, a weight room, a library, tennis and pickleball courts and a lifestyle director."],
      ]) +
      h.p(`Condos for sale in Barefoot list a typical fee of about $570 a month. Houses in its Leatherleaf section list $385 to $398. Not every Barefoot neighborhood belongs to the residential association, so we check which one a home is in.`) +
      STRIP_BR +
      h.p(`Our guides to ${h.a("/buyers/55-plus-communities/", "55+ communities")} and ${h.a("/buyers/gated-communities/", "gated communities")} compare the other clubs one by one.`) },

    { h2: "Is a gated community worth the HOA fee?", toc: "Gates", id: "gate", html: (bg) =>
      h.p(`A gated community is worth the fee if you want a gate with a guard, because a shared fee splits the cost among many homes. One household alone would pay all of it.`) +
      h.p(`In the Myrtle Beach metro area, security guards earned a middle wage of $${GT.guard_median_hourly} an hour in the latest federal wage survey. At that wage, one gate staffed day and night costs this much:`) +
      plain([
        [`${GT.hours_in_a_year.toLocaleString("en-US")} hours a year`, "A guard at the gate every hour of the year."],
        [`About ${usd(GATE_YEAR)} a year`, "The guard's pay alone, before taxes, benefits or a security company's margin."],
        [`About $${Math.round(GT.split_examples["500"])} a home a month`, "That pay shared by 500 homes, as an example."],
      ]) +
      h.p(`In Dye Estates, inside Barefoot Resort, owners and their guests are greeted by the security staff at the front guardhouse.`) +
      h.p(`A gate controls who drives in. We do not rate any place as safe or unsafe. Our ${h.a("/buyers/gated-communities/", "guide to gated communities")} compares the gated places here.`) +
      h.cta("Add up the gate, the club and the HOA", "Send us the home. We find every fee on it, the master association's too, and what each one pays for.", "Have us find every fee on a home", ASK, bg) },

    { h2: "Are condo fees worth it in Myrtle Beach?", toc: "Condo fees", id: "condo", html: () =>
      h.p(`Condo fees are usually worth it, because owners pay together through the fee for what no one owner could buy alone.`) +
      plain([
        ["The building's insurance", "South Carolina law requires a condo association to insure the property. Each owner may still insure their own unit."],
        ["The roof", "In a condo, the roof belongs to all the owners together, and its repair is a shared expense. Owners of a one-family house in the South Atlantic states, which include South Carolina, who replaced a roof paid a middle of more than $10,000."],
        ["A policy lenders accept", `For a loan sold to Fannie Mae, the building's deductible may be no more than 5 percent of its coverage. When it is charged per unit, the limit is $50,000 a unit. If the policy falls outside those limits, fewer of your buyers can get a loan there. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own")} explains both.`],
      ]) +
      h.p(`Our page about ${h.a("/hoa/", "Myrtle Beach HOA fees")} explains why condo fees are high here. Fees building by building are on our ${h.a("/invest/condo-buildings/", "oceanfront condo buildings")} page.`) },

    { h2: "Do HOAs increase property value in Myrtle Beach?", toc: "Property value", id: "value", html: (bg) =>
      h.p(`Not in asking prices. Here, newer houses with an HOA fee list for less a square foot than houses without one. Of houses for sale built in 2000 or later in Horry County ZIP codes, those with a fee list for a middle of about $${B2.with_fee_ppsf} a square foot. Those with no fee list for about $${B2.no_fee_ppsf}.`) +
      h.p(`The house with no fee also sits on more land: about half an acre, against about a fifth of an acre with a fee.`) +
      CHART_C +
      plain([
        ["ZIP code by ZIP code", `Counting houses of every age, those with a fee list for less a square foot in ${AA.zips_compared - AA.zips_fee_higher} of the ${AA.zips_compared} ZIP codes with enough of both. Socastee is the one exception. Among newer houses only, it is ${B2.zips_compared - B2.zips_fee_higher} of ${B2.zips_compared}.`],
        ["What a national study found", "A 2019 national study of mortgage records found that houses in HOAs sold for at least 4 percent more, on average, than similar houses outside them. Our count here compares asking prices and does not show a cause."],
        ["Often there is no choice", `Of newer houses for sale 1 to 3 miles from the beach, ${Math.round(BANDS[1].share_with_fee_pct)} in 100 list an HOA fee. From 3 to 10 miles, ${Math.round(BANDS[2].share_with_fee_pct)} in 100 do.`],
      ]) +
      h.cta("Want the land and no HOA fee?", "Tell us where you want to live. We send you houses there with no HOA fee, with the lot size of each.", "Ask us for houses with no HOA", ASK, bg) },

    { h2: "What do you give up in an HOA?", toc: "What you give up", id: "give-up", html: (bg) =>
      h.p(`In an HOA you give up room, some freedom and some say over the money. In return, every neighbor follows the same rules you do.`) +
      h.p(`Whether the dues come off your taxes is on our page on ${h.a("/hoa/tax-deductible/", "HOA fees and taxes")}.`) +
      plain([
        ["Room for a boat or an RV", `Our listing feed covers the Grand Strand from Pawleys Island into North Carolina. In it, about 3 in 100 houses for sale with an HOA fee list parking for an RV or a boat. With no fee, about 3 in 10 do. Houses with a fee list a boat ramp more often, 9 in 100 against 2. Our page on ${h.a("/buyers/no-hoa-homes/", "homes with no HOA")} shows where those houses are.`],
        ["Things you cannot build or park", "Each community above has rules against something: a private pool, a shed or a boat in the driveway. The biggest mistake we see buyers from New York make is not checking that the community's rules fit how they live. That means the HOA rules on boats, golf carts, rentals and pools."],
        ["No cap in state law", `South Carolina's HOA law and condo law put no cap on dues, on a special assessment or on ${h.a("/hoa/violations-and-fines/", "a fine")}. The limits are in each community's own recorded rules and bylaws. The Farm's recorded rules cap a yearly increase in the base fee at 20 percent. More on ${h.a("/hoa/dues-increases/", "how much an HOA can raise dues")}.`],
        ["A low fee can mean thin savings", `If an HOA saves too little for repairs, owners can face a ${h.a("/hoa/special-assessments/", "special assessment")} later, a one-time bill to each owner. Our page on ${h.a("/hoa/reserves/", "HOA reserves")} covers how much an HOA should save.`],
      ]) +
      h.h3("What do owners here complain to the state about?") +
      h.p(`Of the concerns the state names, the most common, in ${Math.round(CD.rows[0].pct)} of 100 complaints, was that the HOA did not follow or enforce its own rules. Maintenance and repairs came next, in ${Math.round(CD.rows[1].pct)} of 100.`) +
      CHART_D +
      h.p(`Our page on ${h.a("/hoa/south-carolina-hoa-laws/", "South Carolina HOA laws")} explains where an owner can take a dispute.`) +
      h.cta("Send us the rules before you offer", "Tell us about the boat, the truck, the dog or the rental plan. We read the community's rules against it and tell you what they allow.", "Have us read the rules", ASK, bg) },

    { h2: "What do we check before you buy a home with an HOA?", toc: "What we check", id: "we-check", html: () =>
      h.p(`We read six things before you make an offer, and tell you what each one means for you.`) +
      steps([
        ["The budget, per home", "What each line buys, and which of those bills you would pay anyway."],
        ["The reserves", "How much the HOA has saved for future repairs, and its reserve study if it has one."],
        ["The building's insurance", "For a condo, the master policy and its deductible."],
        ["The recorded rules", "Against your boat, truck, pets, pool or rental plans."],
        ["Who runs the board", `The owners or still the builder. More on ${h.a("/hoa/developer-control-turnover/", "when the builder hands over the HOA")}.`],
        ["What the HOA charges when you buy", `More on ${h.a("/hoa/estoppel-and-transfer-fees/", "HOA transfer fees at closing")}.`],
      ]) +
      h.p(`We do not publish an opinion about any named association. We tell you what its papers say.`) },
  ],
  afterSources: () => LEGAL,
  /* The share card: tools/ogcard.js from the page's eyebrow and H1, moved into this page's images folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/hoa-benefits/share.jpg",
  ogImageAlt: "Are HOA fees worth it on the Grand Strand? Yes, when the fee buys what you would pay for anyway.",
  faqTitle: "Common questions about HOA fees",
  faq: FAQ,
  sources: [
    { name: "The Farm budget", href: FARM27 },
    { name: "Myrtle Trace budget", href: MT26 },
    { name: "Myrtle Trace rules", href: MTRULES },
    { name: "Del Webb declaration", href: DWDECL },
    { name: "Grande Dunes Ocean Club", href: GDOC },
    { name: "Barefoot association", href: BRRA },
    { name: "BLS wages", href: OEWS },
    { name: "Myrtle Beach passes", href: MBREC },
    { name: "North Myrtle Beach passes", href: NMBAFC },
    { name: "Clarke and Freedman", href: STUDY },
    { name: "SC Consumer Affairs", href: SCDCA },
    { name: "SC Code 27-30", href: T27_30 },
    { name: "SC Code 27-31", href: T27_31 },
    { name: "Fannie Mae B7-3-03", href: FNMA },
    { name: "Census AHS", href: AHS },
  ],
  sourcesNote: "Our counts: houses for sale in our listing feed, asking prices; budget lines divided by each HOA's homes; the gate at 500 homes is an example.",
  bottomCta: { h2: "Is this HOA fee worth it for you?", p: `Call ${PHONE}, or send us the home or the community. We get the budget and the rules, and tell you what the fee buys and what it rules out.`, label: "Have us review the fee", href: ASK },
  keywords: "are HOA fees worth it, is an HOA worth it, HOA pros and cons, are HOA fees a waste of money, what do HOA fees pay for, benefits of an HOA, do HOAs increase property value, are condo fees worth it, is a gated community worth it, beach club HOA fees, Myrtle Beach HOA",
  about: "Whether homeowners association (HOA) fees are worth it on the Grand Strand, South Carolina: what the fees buy, property values and what owners give up",
});
