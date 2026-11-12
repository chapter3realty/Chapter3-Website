/* /buyers/cost-to-own/ - what a home in Horry County costs to own each year besides the mortgage: the
 * itemized total for the middle house, house against condo, home against second home, by town, each part
 * (tax, insurance, the HOA or condo fee, upkeep, utilities) from a public record or a federal survey, and
 * the calculator.
 *
 * Batch 2026-11-a, Lane U. Version 1. The live page was old-template HTML with no spec; this spec replaces it.
 * Reader, must-answers and plan: Blog-Brain batches/2026-11-a/buyers-cost-to-own/ (must-answer.md, PLAN.md).
 * Facts: facts.md there, VERIFIED and CORRECTED rows only, at their corrected values (VERIFY.md,
 * buyers-cost-to-own-struck.json). The verifier's corrections are in: the house HOA fee is the middle of the
 * 15 Horry County ZIPs ($100 a month, not the whole feed's $75), so the middle house is about $7,850 a year
 * (rows 1, 25); North Myrtle Beach and Surfside Beach houses list no fee (rows 4, 25; pull_hoa.py's $0 fault
 * fixed and re-run); "most" on the 201.0 and 207.3 mill levies and on the $89.40 fee (rows 10, 12, 13); the
 * 2026-only $75,000 at 65 (row 15); "may" on the condo fee paying the building's insurance (row 19); "can buy"
 * wind cover (row 20); the quote offer keeps "if you buy with us" (row 21); a FEMA policy "on a single condo
 * unit" (row 23); the Loris area left out of the 61 percent (row 27); no condo water figure (row 33);
 * "usually paid separately" for the HOA fee (row 36).
 * Every table, chart, tile and calculator default is built from data/2026-11-a/buyers-cost-to-own/ (never typed):
 *   examples.json            rows 1 to 6, 13 (built by build_examples.py from the files below and the 2026 levies)
 *   hoa-by-area.json         rows 25, 26 (homes for sale, counted in total with the site's map; Horry ZIPs)
 *   pums-2024-1yr*.json, pums-moe.json   rows 2, 17, 19, 27, 33, 34 (Census ACS PUMS 2024)
 *   ahs-2023-*.json          rows 29 to 32 (Census AHS 2023, South Atlantic)
 *   flood-by-area.json       row 23 (FEMA flood policies)
 *   photos.json              one public-domain USGS photo (record there)
 * Kept from the live page: the title and H1 the owner liked, the calculator's tax model and town list (now with
 * the county fee, sourced defaults, a house or condo switch, and "Cost besides the loan" filled from the first
 * load; the loan line still waits for the reader's own rate and down payment), the links to the tax, insurance,
 * HOA and condo pages. Cut: the lead form above the answer, the same offer three times, the "1 percent" upkeep
 * rule, the $160 insurance placeholder, "get it during due diligence" (we do the work).
 * Stories used as recorded: household-utility-bills (one household's bill, no quotation marks, "one of our
 * team"), insurance-quote-before-offer (with its condition, no agent or company named).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");

const BB = [path.join(__dirname, "..", "tools", "blog-brain-2026-11-a"), path.join(__dirname, "..", "tools", "blog-brain-2026-10-b"), process.env.BLOG_BRAIN,
  path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, "tools", "page-kit.js")));
if (!BB) throw new Error("Blog-Brain tools not found (tools/page-kit.js)");
const PK = require(path.join(BB, "tools", "page-kit.js"));
const G = require(path.join(BB, "tools", "glass.js"));
const { compareCards } = require(path.join(BB, "tools", "compare.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));

const DATA = path.join(__dirname, "..", "data", "2026-11-a", "buyers-cost-to-own");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const EX = read("examples.json"), HOA = read("hoa-by-area.json"), REP = read("ahs-2023-replacements.json"), AHS = read("ahs-2023-maintenance.json").groups;
const PUMS = read("pums-2024-1yr.json").groups, REST = read("pums-2024-1yr-rest-of-sc.json").groups, MOE = read("pums-moe.json");

const kit = PK.create({ h, theme: "glass", photos: read("photos.json").photos,
  mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" });
const { glance } = kit;
const ph = kit.photoSet({ aerialWidth: "760px" });

const SELF = "/buyers/cost-to-own/";
const r10 = (v) => "$" + (Math.round(v / 10) * 10).toLocaleString("en-US");
const r100 = (v) => "$" + (Math.round(v / 100) * 100).toLocaleString("en-US");
const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
const nw = (t) => `<span style="white-space:nowrap">${t}</span>`;
const must = (ok, msg) => { if (!ok) throw new Error(`cost-to-own: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* Data (ledger rows named)                                                        */

const W = EX.worked_example, U = W.unincorporated, CITY = W.city_of_myrtle_beach, CONDO = W.condo_unincorporated;   // rows 1, 3
must(U.price === 350000 && CONDO.price === 215000, "the middle prices moved: rewrite the $350,000 and $215,000 copy (row 7)");
must(U.hoa_yearly === 1200, "the middle house HOA fee moved off $100 a month (rows 1, 25): rewrite");
must(Math.round(U.total) === 7849 && Math.round(U.total_second_home) === 10783, "the worked example moved off $7,850 and $10,780 (row 1)");
must(Math.round(CITY.total) === 7887 && Math.round(CITY.total_second_home) === 11820, "the city example moved off $7,890 and $11,820 (row 1)");
must(CONDO.hoa_yearly === 7800 && Math.round(CONDO.total) === 10171, "the condo example moved off $10,170 (row 3)");
const FEE = U.fee_on_tax_bill;                                                                    // row 12
must(FEE === 89.4, "the county stormwater fee moved off $89.40 (row 12)");
const CHECK = U.check_vs_census_paid_off_house;                                                   // row 2
must(CHECK.same_parts_as_census_no_upkeep_per_month === 571 && CHECK.census_median_per_month === 555, "the cross-check moved off $571 and $555 (row 2)");
const HOUSES = EX.houses, CONDOS = EX.condos;                                                     // rows 4, 5
const house = (p) => HOUSES.find((r) => r.place === p), condo = (p) => CONDOS.find((r) => r.place === p);
must(house("North Myrtle Beach").hoa_monthly_middle === 0 && Math.round(house("North Myrtle Beach").total_legal_residence) === 7672, "North Myrtle Beach house moved off no HOA fee and $7,670 (row 4)");
for (const p of ["Myrtle Beach", "North Myrtle Beach"]) must(condo(p).total_legal_residence > house(p).total_legal_residence, `${p}: the condo no longer costs more than the house (row 6)`);
must(condo("Carolina Forest").total_legal_residence < house("Carolina Forest").total_legal_residence, "Carolina Forest: the condo now costs more than the house (row 6)");
const TAXR = EX.tax_chart_same_house.rows;                                                        // row 13
const times = TAXR.map((r) => r.times);
must(Math.min(...times) === 2.5 && Math.max(...times) === 3.8, "the second-home tax range moved off 2.5 to 3.8 times (row 13)");
const FL = EX.flood_extra;                                                                        // row 23
const UT = EX.utilities;                                                                          // row 33
must(UT.house_electric_year === 1800 && UT.house_water_year === 480 && U.utilities === 2280, "house utilities moved (row 33)");
must(!("condo_water_year" in UT), "the condo water figure is cut (row 33)");
const INS = MOE.INSP, ELE = MOE.ELEP, PAID = MOE.SMOCP_no_mortgage;                              // rows 17, 33, 34
must(INS.horry.median === 2000 && INS.rest_of_sc.median === 1400, "insurance moved off $2,000 and $1,400 (row 17)");
const SPREAD = read("pums-insp-spread.json");                                                     // fixer row 40
must(SPREAD.median === INS.horry.median && SPREAD.p25 === 1300 && SPREAD.p75 === 3000, "the insurance spread no longer matches row 17");
must(Math.round(1 / SPREAD.share_4000_or_more) === 10 && Math.round(1 / SPREAD.share_6000_or_more) === 40, "the insurance spread moved off 1 in 10 at $4,000 and 1 in 40 at $6,000 (row 40)");
const INS_CONDO = PUMS.apartment_building_3plus.INSP.median;                                     // row 19
must(INS_CONDO === 800, "condo insurance moved off $800 (row 19)");
const HOA_SHARE = Math.round(PUMS.all_owners.share_paying_condo_fee * 100), HOA_SHARE_SC = Math.round(REST.all_owners.share_paying_condo_fee * 100);   // row 27
must(HOA_SHARE === 61 && HOA_SHARE_SC === 33, "the share paying an HOA fee moved off 61 and 33 percent (row 27)");
const HORRY = read("hoa-horry.json").horry;
const HH = HORRY.house;                                                                       // row 25
must(HH.median === 100, "the Horry ZIPs' middle house fee moved off $100 (row 25)");
const H_LIST = Math.round(HH.listings / 10) * 10, H_NONE = Math.round(HH.no_hoa / 10) * 10;
must(HH.no_hoa / HH.listings > 0.25 && HH.no_hoa / HH.listings < 0.3, "houses with no fee moved off 'more than 1 in 4' (row 25)");
const CF = HORRY.condo;                                                                       // row 26
must(CF.median === 650, "the middle condo fee moved off $650 (row 26)");
const UPKEEP = U.upkeep, UPKEEP_CONDO = CONDO.upkeep;                                             // rows 31, 32
must(Math.round(UPKEEP) === 3273 && Math.round(UPKEEP_CONDO) === 692, "upkeep moved off $3,270 and $690 (rows 31, 32)");
const J = REP.jobs;                                                                               // row 30

/* ---------------------------------------------------------------------------- */
/* Page CSS: the itemized table, the paired bars, tiles, cards, the "we do" box, the example box and the
   calculator. Scoped to main#main; everything a reader reads is at reading size. */

const M = "main#main";
const GLASS = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.85);box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 1px 2px rgba(28,32,40,.05),0 12px 30px -18px rgba(28,32,40,.32)";
const CHIP = "flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;color:var(--g-ink,#8a5226);background:rgba(196,120,58,.13)";
const BRASS = "#c4783a", SLATE = "#5c6b78";
const BAND_END = 'main#main>section[style^="background:var(--navy)"]:has(>.wrap>h2)';
const PAGE_CSS = "<style>main#main .c3-glance li{line-height:1.4}"
  /* The itemized table (CRAFT 3: a cost page's visual is the table with a total row). */
  + `${M} .c3k-bill{max-width:760px;margin:1.3rem 0 .6rem;border-radius:20px;overflow:hidden;${GLASS}}`
  + `${M} .c3k-bill table{width:100%;border-collapse:collapse;font-size:1rem;line-height:1.4}`
  + `${M} .c3k-bill caption{text-align:left;padding:1rem 1.1rem .4rem;color:var(--navy);font-weight:600;font-size:1.05rem;line-height:1.35}`
  + `${M} .c3k-bill th,${M} .c3k-bill td{padding:.62rem 1.1rem;border-bottom:1px solid rgba(28,32,40,.09);text-align:left;vertical-align:top}`
  + `${M} .c3k-bill thead th{font-family:var(--sans);font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600}`
  + `${M} .c3k-bill .n{text-align:right;white-space:nowrap;color:var(--navy);font-variant-numeric:tabular-nums}`
  + `${M} .c3k-bill tbody th{color:var(--navy);font-weight:600}${M} .c3k-bill tbody th small{display:block;color:var(--muted);font-weight:400;font-size:.95rem;margin-top:.1rem}`
  + `${M} .c3k-bill tfoot th,${M} .c3k-bill tfoot td{border-bottom:0;background:rgba(196,120,58,.1);color:var(--navy);font-weight:700;font-size:1.08rem}`
  + `${M} .c3k-bill tfoot tr+tr th,${M} .c3k-bill tfoot tr+tr td{background:rgba(196,120,58,.05);font-weight:600;font-size:1rem}`
  + `${M} .c3k-bill thead th.n{white-space:normal}`
  + `@media (max-width:520px){${M} .c3k-bill table{font-size:.95rem}${M} .c3k-bill th,${M} .c3k-bill td{padding:.5rem .45rem}${M} .c3k-bill th:first-child{padding-left:.75rem}${M} .c3k-bill td:last-child,${M} .c3k-bill th:last-child{padding-right:.75rem}${M} .c3k-bill thead th{font-size:.75rem;letter-spacing:.02em}${M} .c3k-bill tbody th small{font-size:.9rem}${M} .c3k-bill tfoot th,${M} .c3k-bill tfoot td{font-size:1rem}}`
  + `${M} .c3k-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:760px;margin:.2rem 0 1.3rem}`
  + `${M} ul.c3k-nl{padding:0 0 0 1.1rem}${M} ul.c3k-nl li{margin:0 0 .3rem}`
  /* Paired bars: two bars a group (your home and second home; house and condo). Bars stop at 3/4 of the
     track and the value sits in its own column, so a label never runs into a bar. */
  + `${M} .c3k-pair{max-width:760px;margin:1.4rem 0 1.5rem;padding:1.1rem 1.15rem 1rem;border-radius:20px;box-sizing:border-box;${GLASS}}`
  + `${M} .c3k-pair .cap{display:block;color:var(--navy);font-weight:600;font-size:1.08rem;line-height:1.35;margin:0 0 .5rem}`
  + `${M} .c3k-pair .key{display:flex;flex-wrap:wrap;gap:.2rem 1.1rem;margin:0 0 .9rem;color:var(--muted);font-size:1rem;line-height:1.45}`
  + `${M} .c3k-pair .sw{display:inline-block;width:.8rem;height:.8rem;border-radius:3px;margin-right:.35rem;vertical-align:-.05em}`
  + `${M} .c3k-pair .g{margin:0 0 .95rem}${M} .c3k-pair .lab{display:flex;justify-content:space-between;gap:.6rem;color:var(--navy);font-weight:600;line-height:1.35;margin-bottom:.3rem}`
  + `${M} .c3k-pair .lab b{color:var(--g-ink,#8a5226);font-weight:600;white-space:nowrap}`
  + `${M} .c3k-pair .r{display:grid;grid-template-columns:minmax(0,1fr) 6.2rem;align-items:center;gap:.55rem;margin:.18rem 0}`
  + `${M} .c3k-pair .t{height:.95rem;border-radius:999px;background:rgba(92,107,120,.1);overflow:hidden}`
  + `${M} .c3k-pair .b{display:block;height:100%;border-radius:999px}`
  + `${M} .c3k-pair .v{color:var(--navy);font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap;font-size:1rem}`
  + `${M} .c3k-pair figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.3rem 0 0;padding:0!important;background:none!important;border:0!important;box-shadow:none!important}`
  /* Number tiles. */
  + `${M} .c3k-stat{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(9.5rem,100%),1fr));gap:.65rem;max-width:760px;margin:1.2rem 0 .5rem}`
  + `${M} .c3k-stat>div{padding:.9rem 1rem;border-radius:18px;${GLASS}}`
  + `${M} .c3k-stat.c3k-stat3{grid-template-columns:repeat(3,minmax(0,1fr))}${M} .c3k-tl{color:var(--navy);font-weight:600;margin:1.2rem 0 -.4rem;line-height:1.4}`
  + `${M} .c3k-stat .big{display:block;font-family:var(--serif);font-size:1.75rem;line-height:1.1;color:var(--g-ink,#8a5226);font-weight:600;margin-bottom:.3rem}`
  + `${M} .c3k-stat .s{display:block;color:var(--navy);font-size:1rem;line-height:1.45}`
  + `@media (max-width:520px){${M} .c3k-stat{grid-template-columns:1fr 1fr;gap:.5rem}${M} .c3k-stat.c3k-stat3{grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem}${M} .c3k-stat>div{padding:.75rem .8rem}${M} .c3k-stat3>div{padding:.65rem .55rem}${M} .c3k-stat .big{font-size:1.4rem}${M} .c3k-stat3 .big{font-size:1.2rem}${M} .c3k-stat3 .s{font-size:.95rem}}`
  /* Cards with an icon and a heading line. */
  + `${M} .c3k-cards{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;grid-template-columns:1fr;gap:.65rem;max-width:760px}@media (min-width:600px){${M} .c3k-cards{grid-template-columns:1fr 1fr}}`
  + `${M} .c3k-cards li{margin:0;padding:.9rem 1rem;border-radius:18px;${GLASS}}`
  + `${M} .c3k-cards .h{display:flex;align-items:center;gap:.6rem;margin:0 0 .35rem;color:var(--navy);font-weight:600;font-size:var(--read,1.0625rem);line-height:1.35}`
  + `${M} .c3k-cards .h .i{${CHIP};width:2.2rem;height:2.2rem}`
  + `${M} .c3k-cards .h .p{margin-left:auto;font-family:var(--serif);font-size:1.3rem;color:var(--g-ink,#8a5226);white-space:nowrap}`
  + `${M} .c3k-cards p{margin:0;color:var(--muted);line-height:1.55;font-size:1rem}`
  /* What we do. */
  + `${M} .c3k-we{display:flex;gap:.75rem;align-items:flex-start;max-width:720px;margin:1.3rem 0 1rem;padding:.85rem 1.05rem;border-radius:16px;${GLASS}}`
  + `${M} .c3k-we .i{${CHIP};width:1.8rem;height:1.8rem;margin-top:.15rem}`
  + `${M} .c3k-we p{margin:0;color:var(--navy);line-height:1.6;font-size:var(--read,1.0625rem)}`
  /* The labelled example. */
  + `${M} .c3k-ex{max-width:720px;margin:1.3rem 0 1.4rem;padding:1rem 1.15rem;border-radius:18px;${GLASS}}`
  + `${M} .c3k-ex .k{display:inline-block;font-family:var(--sans);font-size:.85rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--g-ink,#8a5226);margin-bottom:.35rem}`
  + `${M} .c3k-ex p{margin:0 0 .5rem;color:var(--navy);line-height:1.6}${M} .c3k-ex p:last-child{margin-bottom:0}`
  /* The calculator. */
  + `${M} .c3k-calc{max-width:720px;margin:1.4rem 0 1.2rem;padding:1.2rem 1.2rem 1.1rem;border-radius:22px;${GLASS}}`
  + `${M} .c3k-calc .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr));gap:.8rem 1rem;align-items:end}`
  + `@media (max-width:560px){${M} .c3k-calc .grid{grid-template-columns:1fr 1fr;gap:.7rem .6rem}${M} .c3k-calc .grid>.full{grid-column:1/-1}${M} .c3k-calc label small{font-size:.85rem}${M} .c3k-calc{padding:1rem .85rem}}`
  + `${M} .c3k-calc label{display:block;color:var(--navy);font-weight:600;font-size:1rem;line-height:1.35}`
  + `${M} .c3k-calc label small{display:block;color:var(--muted);font-weight:400;font-size:.92rem}`
  + `${M} .c3k-calc input,${M} .c3k-calc select{display:block;width:100%;box-sizing:border-box;margin-top:.3rem;padding:.6rem .7rem;font-size:1.05rem;border:1px solid rgba(28,32,40,.22);border-radius:10px;background:rgba(255,255,255,.92);color:var(--navy);font-family:var(--sans)}`
  + `${M} .c3k-calc .seg{display:flex;gap:.4rem;margin-top:.3rem}${M} .c3k-calc .seg label{flex:1;font-weight:500}`
  + `${M} .c3k-calc .seg input{position:absolute;opacity:0;width:1px;height:1px}`
  + `${M} .c3k-calc .seg span{display:block;text-align:center;padding:.55rem .5rem;border-radius:999px;border:1px solid rgba(28,32,40,.22);background:rgba(255,255,255,.8);cursor:pointer}`
  + `${M} .c3k-calc .seg input:checked+span{background:var(--navy);color:var(--ivory);border-color:var(--navy)}`
  + `${M} .c3k-calc .seg input:focus-visible+span{outline:2px solid ${BRASS};outline-offset:2px}`
  + `${M} .c3k-calc .out{margin-top:1.1rem;border-top:1px solid rgba(28,32,40,.14);padding-top:.8rem;display:grid;gap:.15rem}`
  + `${M} .c3k-calc .out div{display:flex;justify-content:space-between;gap:1rem;color:var(--navy);line-height:1.45;padding:.2rem 0}`
  + `${M} .c3k-calc .out strong{font-variant-numeric:tabular-nums;white-space:nowrap}`
  + `${M} .c3k-calc .out .tot{margin-top:.35rem;padding:.6rem .75rem;border-radius:14px;background:rgba(196,120,58,.12);font-weight:700;font-size:1.08rem}`
  + `${M} .c3k-calc .out .tot small{display:block;font-weight:400;font-size:.95rem;color:var(--muted)}`
  + `${M} .c3k-calc .out .wait strong{color:var(--muted);font-weight:500;white-space:normal;text-align:right}`
  + `${M} .c3k-calc .h3{margin:1.1rem 0 .5rem;color:var(--navy);font-weight:600;font-size:1.1rem;font-family:var(--sans)}`
  + `@media (prefers-reduced-transparency:reduce){${M} .c3k-bill,${M} .c3k-pair,${M} .c3k-stat>div,${M} .c3k-cards li,${M} .c3k-we,${M} .c3k-ex,${M} .c3k-calc{background:#fbf8f3}}`
  /* The end offer band: the listing notice follows it inside <main>, so glass.js's top-bar rules reach it
     (the same fix as the sibling pages; retirees NEEDS.md 1). */
  + `${BAND_END}{padding:.9rem 0 1.4rem!important}${BAND_END}>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important}`
  + `${BAND_END}>.wrap>h2{color:var(--ivory)!important}${BAND_END}>.wrap>p{color:rgba(244,239,232,.82)!important}`
  + `@media (max-width:699px){${BAND_END}>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}${BAND_END}>.wrap>h2{font-size:1.5rem!important;line-height:1.25}}`
  /* Small phones (critic round 2, 320 px): "Insurance" ran over its tile, so four tiles go 2 x 2; the three
     flood tiles stack with the number beside its words. */
  + `@media (max-width:359px){${M} .c3-glance{grid-template-columns:1fr 1fr!important}}`
  + `@media (max-width:420px){${M} .c3k-stat.c3k-stat3{grid-template-columns:1fr}${M} .c3k-stat3>div{display:flex;align-items:baseline;gap:.7rem}${M} .c3k-stat3 .big{flex:none;min-width:4.2rem;margin:0}}`
  /* "On this page": two columns from 760 px (critic round 2; same as dst.js). */
  + `@media (min-width:760px){${M} nav[aria-label="On this page"]{max-width:960px!important}${M} nav[aria-label="On this page"] ul{columns:2;column-gap:2.4rem}${M} nav[aria-label="On this page"] li{break-inside:avoid}}`
  /* Three cards in one row from 700 px (the wind sides). */
  + `@media (min-width:700px){${M} .c3k-cards.c3k-cards3{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* One bar a place: how much more the condo or the house costs a year. */
  + `${M} .c3k-diff .r{grid-template-columns:minmax(0,1fr) 8.6rem}`
  + "main#main .hx-feed .hx-fb,main#main .hx-feed .hx-fb-ai,main#main .hx-feed .hx-fb-q{min-width:0!important;max-width:100%!important;box-sizing:border-box}"
  + "@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Blocks                                                                          */

const TICK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
const we = (text) => `<div class="c3k-we"><span class="i" aria-hidden="true">${TICK}</span><p>${text}</p></div>`;
const tiles = (items) => `<div class="c3k-stat">${items.map((t) => `<div><span class="big">${t.big}</span><span class="s">${t.text}</span></div>`).join("")}</div>`;
/* Small line icons for the replacements (tools/icons.js has no roof, air unit, flame or water heater). */
const svg = (d) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const ICO = {
  roof: svg('<path d="M2.5 12.5 12 4l9.5 8.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9.5 20v-5h5v5"/>'),
  air: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="4.5"/><path d="M12 7.5v9M7.5 12h9"/>'),
  heat: svg('<path d="M12 21c3.6 0 6-2.4 6-5.6 0-3.8-3.4-5.6-4.2-9.4-1.7 1.3-2.6 3-2.4 5-1.2-.6-2-1.8-2.2-3.2C7.3 9.6 6 12 6 15.4 6 18.6 8.4 21 12 21Z"/>'),
  water: svg('<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M12 8.5c1.4 1.7 2.2 2.9 2.2 4a2.2 2.2 0 0 1-4.4 0c0-1.1.8-2.3 2.2-4Z"/><path d="M9 21v1M15 21v1"/>'),
};
const cards = (items, label, cls = "") => `<ul class="c3k-cards${cls ? " " + cls : ""}" role="list" aria-label="${label}">${items.map((c) => `<li><p class="h"><span class="i" aria-hidden="true">${c.svg || icon(c.icon, { size: 20 })}</span><span>${c.head}</span>${c.price ? `<span class="p">${c.price}</span>` : ""}</p>${c.text ? `<p>${c.text}</p>` : ""}</li>`).join("")}</ul>`;

/* Paired bars from the data: groups of { name, side, a, b }, each bar { label, value, text }. */
const pairs = (o) => {
  const max = Math.max(...o.groups.flatMap((g) => [g.a.value, g.b.value]));
  const bar = (x, color) => `<div class="r"><span class="t"><span class="b" style="width:${(x.value / max * 100).toFixed(1)}%;background:${color}"></span></span><span class="v">${x.text}</span></div>`;
  return `<figure class="c3k-pair" role="group" aria-label="${o.cap}"><span class="cap">${o.cap}</span>`
    + `<div class="key"><span><span class="sw" style="background:${BRASS}" aria-hidden="true"></span>${o.aLabel}</span><span><span class="sw" style="background:${SLATE}" aria-hidden="true"></span>${o.bLabel}</span></div>`
    + o.groups.map((g) => `<div class="g"><span class="lab"><span>${g.name}</span>${g.side ? `<b>${g.side}</b>` : ""}</span>`
      + `<span class="c3k-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">${o.aLabel}: ${g.a.text}. ${o.bLabel}: ${g.b.text}.</span>`
      + `<div aria-hidden="true">${bar(g.a, BRASS)}${bar(g.b, SLATE)}</div></div>`).join("")
    + `<figcaption>${o.note}</figcaption></figure>`;
};

/* Section 1: the itemized table for the middle house, outside city limits (row 1). Line items at $10, the
   fee as billed; the total is the exact sum, rounded the same way. */
const SECOND_MONTH = U.total_second_home / 12;
const BILL = `<div class="c3k-bill"><table><caption>A typical Horry County house, about ${usd(U.price)}, outside city limits: what it costs a year besides the loan</caption>`
  + `<thead><tr><th scope="col">What you pay</th><th scope="col" class="n">Your home</th><th scope="col" class="n">Second home</th></tr></thead><tbody>`
  + [
    ["Property tax", "the rate is charged on 4 percent of the value (6 percent for a second home)", r10(U.tax_legal_residence), r10(U.tax_second_home)],
    ["County stormwater fee", "on most tax bills outside city limits", "$" + Math.round(FEE), "$" + Math.round(FEE)],
    ["Home insurance", "what owners of a house here pay for all their policies", r10(U.insurance), r10(U.insurance)],
    ["HOA fee", `a typical house for sale, $${HH.median} a month`, r10(U.hoa_yearly), r10(U.hoa_yearly)],
    ["Upkeep", "routine repairs plus the big replacements", r10(UPKEEP), r10(UPKEEP)],
  ].map(([a, b, c, d]) => `<tr><th scope="row">${a}<small>${b}</small></th><td class="n">${c}</td><td class="n">${d}</td></tr>`).join("")
  + `</tbody><tfoot><tr><th scope="row">Total a year</th><td class="n">${r10(U.total)}</td><td class="n">${r10(U.total_second_home)}</td></tr>`
  + `<tr><th scope="row">A month</th><td class="n">${r10(U.total_per_month)}</td><td class="n">${r10(SECOND_MONTH)}</td></tr></tfoot></table></div>`
  + `<p class="c3k-note">Not in the total: electricity and water, about ${r10(U.utilities)} a year. A home with a loan in the high-risk flood zone also needs a flood policy (see insurance below). The second-home column changes only the tax. Insurance on a second home can cost more.</p>`;

/* Section 1: houses by town (row 4). */
const TOWN_NAMES = { "Myrtle Beach": "City of Myrtle Beach", "North Myrtle Beach": "North Myrtle Beach", "Conway": "Conway" };
const hoaText = (m) => (m === 0 ? "none listed" : `$${m}`);
/* One stacking width for both compare tables. compare.js writes an unscoped style block per table and
   stacks a five-column table below 50em, so at 640 to 799 px the other table stacked too, with its
   numbers still right-aligned (critic round 1, 768 px). Both tables take css:false, and the page
   carries one block at compare.js's 40em width (taken from a two-row table it builds and throws away). */
const CC_STYLE = compareCards([{ name: "a", cells: { x: "1" } }, { name: "b", cells: { x: "2" } }], [{ key: "x", label: "x" }], { caption: "x" }).match(/^<style>[\s\S]*?<\/style>/)[0];
must(/max-width:39\.999em/.test(CC_STYLE), "compare.js stacking width moved off 40em");
const HOUSE_TABLE = compareCards(HOUSES.slice().sort((a, b) => a.total_legal_residence - b.total_legal_residence).map((r) => ({
  name: TOWN_NAMES[r.place] || r.place,
  cells: { price: r100(r.middle_price), tax: r10(r.tax_legal_residence + r.fee_on_tax_bill), hoa: hoaText(r.hoa_monthly_middle), total: `${r10(r.total_legal_residence)} (${r10(r.total_legal_residence / 12)})` },
})), [{ key: "price", label: "Typical price", num: true }, { key: "tax", label: "Tax and fee", num: true }, { key: "hoa", label: "HOA fee a month" }, { key: "total", label: "A year (a month)", num: true }],
{ caption: "A typical house in five places, as your home: what it costs to own", nameLabel: "Place", css: false });
const noteList = (items) => `<ul class="c3k-note c3k-nl">${items.map((t) => `<li>${t}</li>`).join("")}</ul>`;
const HOUSE_NOTE = noteList([
  `Carolina Forest and Socastee are outside city limits, where most tax bills include the ${usd(FEE)} county fee.`,
  `The city rows leave out each city's own stormwater and trash fees, which come with the water bill.`,
  `On the north end of Myrtle Beach, a typical house lists an HOA fee of $${HOA.areas["29572"].house.median} a month. Conway's HOA fee is for its main ZIP code, which is mostly outside the city.`,
]);

/* Section 2: house against condo, the three places with both (rows 4 to 6). */
const BOTH = ["Myrtle Beach", "North Myrtle Beach", "Carolina Forest"];
/* One bar a place: how much more a year the condo (brass) or the house (slate) costs. The totals themselves
   are in the two town tables, so the chart says only the difference (owner round 2: say a fact once). */
const DIFF = BOTH.map((p) => ({ name: TOWN_NAMES[p] || p, d: condo(p).total_legal_residence - house(p).total_legal_residence }));
const DMAX = Math.max(...DIFF.map((x) => Math.abs(x.d)));
const HC_CHART = `<figure class="c3k-pair c3k-diff" role="group" aria-label="How much more a typical condo or house costs to own a year, as your home"><span class="cap">How much more a year the condo or the house costs to own, as your home</span>`
  + `<div class="key"><span><span class="sw" style="background:${BRASS}" aria-hidden="true"></span>The condo costs more</span><span><span class="sw" style="background:${SLATE}" aria-hidden="true"></span>The house costs more</span></div>`
  + DIFF.map((x) => { const more = x.d > 0 ? "condo" : "house", txt = `${r10(Math.abs(x.d))} more`;
    return `<div class="g"><span class="lab"><span>${x.name}</span><b>${more} costs more</b></span>`
      + `<span class="c3k-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">The ${more} costs about ${txt} a year.</span>`
      + `<div class="r" aria-hidden="true"><span class="t"><span class="b" style="width:${(Math.abs(x.d) / DMAX * 100).toFixed(1)}%;background:${x.d > 0 ? BRASS : SLATE}"></span></span><span class="v">${txt}</span></div></div>`; }).join("")
  + `<figcaption>A typical condo against a typical house in the same place: tax, the county fee where it applies, insurance, the HOA or condo fee and upkeep. The totals are in the town tables.</figcaption></figure>`;
const CF_DIFF = house("Carolina Forest").total_legal_residence - condo("Carolina Forest").total_legal_residence;
must(Math.round(CF_DIFF / 100) * 100 === 1000, "Carolina Forest's condo is no longer about $1,000 a year cheaper than its house (rows 4, 5)");
const MB_H = house("Myrtle Beach"), MB_C = condo("Myrtle Beach"), NMB_H = house("North Myrtle Beach"), NMB_C = condo("North Myrtle Beach");
{ const fees = CONDOS.map((r) => r.hoa_monthly_middle).sort((a, b) => a - b);
  must(condo("Carolina Forest").hoa_monthly_middle === fees[0] && Math.min(MB_C.hoa_monthly_middle, NMB_C.hoa_monthly_middle) > fees[fees.length - 3], "Carolina Forest is no longer the lowest condo fee, or Myrtle Beach and North Myrtle Beach the two highest (row 5)"); }
must(MB_C.middle_price * 2 < MB_H.middle_price && NMB_C.middle_price * 2 > NMB_H.middle_price, "the condo price shares moved: rewrite 'less than half' and 'a little more than half' (row 6)");
const CONDO_TABLE = compareCards(CONDOS.slice().sort((a, b) => b.total_legal_residence - a.total_legal_residence).map((r) => ({
  name: TOWN_NAMES[r.place] || r.place,
  cells: { price: r100(r.middle_price), fee: `$${r.hoa_monthly_middle}`, total: `${r10(r.total_legal_residence)} (${r10(r.total_legal_residence / 12)})` },
})), [{ key: "price", label: "Typical price", num: true }, { key: "fee", label: "Condo fee a month" }, { key: "total", label: "A year (a month)", num: true }],
{ caption: "A typical condo in five places, as your home: what it costs to own", nameLabel: "Place", css: false });
const CONDO_NOTE = noteList([
  "Each total is the condo fee plus the owner's own tax, insurance and upkeep, and the county fee outside city limits.",
  "Garden City's condo fee is for its ZIP code, which also covers Murrells Inlet.",
]);
/* The condo fee's share of each place's yearly cost (rows 5, 26): 7 to 8 in 10 everywhere. */
const FEE_SHARE = CONDOS.map((r) => r.hoa_monthly_middle * 12 / r.total_legal_residence);
must(Math.min(...FEE_SHARE) >= 0.69 && Math.max(...FEE_SHARE) <= 0.82, "the condo fee is no longer about three quarters of the yearly cost in every place (rows 5, 26)");

/* Section 3: the same house in six tax areas (row 13). */
const AREA_NAMES = { "City of Myrtle Beach": "City of Myrtle Beach", "North Myrtle Beach": "North Myrtle Beach", "Conway": "Conway", "Surfside Beach": "Surfside Beach (in the town)",
  "Garden City (unincorporated)": "Garden City and Murrells Inlet, Horry side (most homes)", "Unincorporated Horry County": "Outside city limits (most homes)" };
const TAX_CHART = pairs({
  cap: `Property tax a year on the same house, valued at ${usd(EX.tax_chart_same_house.value)}`,
  aLabel: "As your home (4\u00a0percent)", bLabel: "As a second home (6\u00a0percent)",
  groups: TAXR.filter((r) => r.tax_area !== "Unincorporated Horry County").sort((a, b) => b.times - a.times).map((r) => ({ name: AREA_NAMES[r.tax_area], side: `${r.times} times`,
    a: { value: r.legal_residence, text: r10(r.legal_residence) }, b: { value: r.second_home, text: r10(r.second_home) } })),
  note: "Outside city limits, the tax is in the table at the top. Horry County's current tax rates, with the City of Myrtle Beach credit for a home taxed at 4 percent. Tax only: the county's stormwater fee and small special districts are left out.",
});
const GAP_LO = Math.min(...TAXR.map((r) => r.second_home - r.legal_residence)), GAP_HI = Math.max(...TAXR.map((r) => r.second_home - r.legal_residence));

/* Section 4: insurance and flood (rows 17, 23, 24). */
const tiles3 = (items) => `<div class="c3k-stat c3k-stat3">${items.map((t) => `<div><span class="big">${t.big}</span><span class="s">${t.text}</span></div>`).join("")}</div>`;
const FLOOD_TILES = `<p class="c3k-tl">A FEMA flood policy on a house, the typical cost a year:</p>` + tiles3([
  { big: r10(FL.house_lived_in_outside_high_risk), text: "your home, outside the high-risk zone" },
  { big: r10(FL.house_lived_in_high_risk_A), text: "your home, inside the zone" },
  { big: r10(FL.house_not_lived_in_high_risk_A), text: "a second home, inside the zone" },
]);

/* Section 4: which side of the wind line (row 20; fixer row 38, TIGER/Line roads and Census place
   outlines). Plain words for a reader who does not know the roads (owner round 1). */
const WIND_SIDES = cards([
  { icon: "beach", head: "On the ocean side", text: "Most of the City of Myrtle Beach, Surfside Beach and Garden City." },
  { icon: "home", head: "West of the law's line", text: "Carolina Forest, Socastee and Conway are west of it. The state has at times let its wind insurer write policies there too, so we check the address." },
  { icon: "pin", head: "On both sides", text: "North Myrtle Beach and Little River. It depends on the street. Murrells Inlet straddles the Horry and Georgetown county line. On the Georgetown side, the law draws its own line near U.S. 17." },
], "Which side of the wind line each place is on", "c3k-cards3");

/* Section 5: the big replacements (row 30). */
const pctOne = (s) => `1 in ${Math.round(1 / s)}`;
const REPL = cards([
  { svg: ICO.roof, head: "A new roof", price: r100(J.roof.median_cost), text: `About ${pctOne(J.roof.share_of_homes_reporting_job)} owners replaced one in two years.` },
  { svg: ICO.air, head: "Central air conditioning", price: r100(J["central air conditioning"].median_cost), text: `About ${pctOne(J["central air conditioning"].share_of_homes_reporting_job)} owners replaced it in two years.` },
  { svg: ICO.heat, head: "Heating equipment", price: r100(J["heating equipment"].median_cost), text: "The furnace or heat pump." },
  { svg: ICO.water, head: "A water heater", price: r100(J["water heater"].median_cost), text: "" },
], "What the big replacements cost");

/* Section 6: utilities (rows 33, 35). */
const UTIL_TILES = tiles([
  { big: usd(UT.house_electric_year / 12), text: "a month for electricity on a house here" },
  { big: usd(ELE.rest_of_sc.median), text: "a month in the rest of South Carolina" },
  { big: usd(UT.house_water_year), text: "a year for water and sewer on a house" },
  { big: usd(UT.condo_electric_year / 12), text: "a month for electricity in a condo" },
]);

/* The calculator: the live page's tax model (the 2026 levies, 4 or 6 percent, the 109.1-mill school
   operating exemption at 4 percent, the City of Myrtle Beach credit of 53.4 percent of its 83.4-mill levy),
   now with the flat fee on the bill and every default from the data. No rate or down payment is filled in. */
const LEVIES = [
  ["Outside city limits", 201.0, 0, 89.4, true],
  ["City of Myrtle Beach", 254.6, 83.4, 0],
  ["North Myrtle Beach", 221.2, 0, 0],
  ["Surfside Beach (in the town)", 214.2, 0, 82],
  ["Conway (in the city)", 272.5, 0, 0],
  ["Garden City and Murrells Inlet, Horry side", 207.3, 0, 89.4],
];
/* The calculator must give the chart's figures for the chart's house (row 13). */
{
  const t = (lev, city, six, v) => six ? v * 0.06 * lev / 1000 : v * 0.04 * (lev - 109.1) / 1000 - v * 0.04 * city / 1000 * 0.534;
  const byName = { "City of Myrtle Beach": LEVIES[1], "North Myrtle Beach": LEVIES[2], "Surfside Beach": LEVIES[3], "Conway": LEVIES[4], "Garden City (unincorporated)": LEVIES[5], "Unincorporated Horry County": LEVIES[0] };
  for (const r of TAXR) { const L = byName[r.tax_area]; must(Math.abs(t(L[1], L[2], false, 350000) - r.legal_residence) <= 0.5 && Math.abs(t(L[1], L[2], true, 350000) - r.second_home) <= 0.5, `calculator and chart disagree for ${r.tax_area}`); }
}
const DEF = { house: { price: U.price, ins: INS.horry.median, hoa: HH.median, up: Math.round(UPKEEP / 10) * 10 }, condo: { price: CONDO.price, ins: INS_CONDO, hoa: CF.median, up: Math.round(UPKEEP_CONDO / 10) * 10 } };
/* Flood is a choice the reader makes (owner round 1: "put flood in the calculator as a choice"). The hint
   gives the typical FEMA policy for the type (row 23); the field starts at none. */
const FLOOD_HINT = { house: `About ${r10(FL.house_lived_in_outside_high_risk)} outside the high-risk zone, ${r10(FL.house_lived_in_high_risk_A)} inside it`, condo: `About ${usd(FL.condo_unit_lived_in_outside_high_risk)} for a unit outside the high-risk zone` };
/* The condo fee hint names the inland figure, so a Carolina Forest buyer is not left with the county's $650
   (reader round 2). */
const HOA_HINT = { house: "A typical house for sale here", condo: `About $${CF.median} county-wide; $${condo("Carolina Forest").hoa_monthly_middle} in Carolina Forest` };
const inp = (id, label, sub, v, extra = "") => `<label for="${id}">${label}${sub ? `<small>${sub}</small>` : ""}<input id="${id}" type="number" inputmode="decimal" min="0" ${extra} value="${v}"></label>`;
const CALC = `<div class="c3k-calc" id="c3k-calc">`
  + `<h3 class="h3" style="margin-top:0">Your home</h3><div class="grid">`
  + `<div class="full"><span style="display:block;color:var(--navy);font-weight:600">What are you buying?</span><div class="seg" role="radiogroup" aria-label="House or condo"><label><input type="radio" name="c3kType" value="house" checked><span>A house</span></label><label><input type="radio" name="c3kType" value="condo"><span>A condo</span></label></div></div>`
  + `<div class="full"><span style="display:block;color:var(--navy);font-weight:600">How will you use it?</span><div class="seg" role="radiogroup" aria-label="Your home or a second home"><label><input type="radio" name="c3kUse" value="4" checked><span>My home</span></label><label><input type="radio" name="c3kUse" value="6"><span>Second home</span></label></div></div>`
  + `<label for="c3kLoc" class="full">Where<small>Outside city limits: Carolina Forest, Socastee, Little River</small><select id="c3kLoc">${LEVIES.map((l) => `<option value="${l[1]}|${l[2]}|${l[3]}"${l[4] ? " selected" : ""}>${l[0]}</option>`).join("")}</select></label>`
  + inp("c3kPrice", "Price", "", U.price, 'step="5000"')
  + inp("c3kIns", "Insurance, a year", "What owners here pay", DEF.house.ins, 'step="50"')
  + inp("c3kHoa", "HOA or condo fee, a month", "A typical house for sale here", DEF.house.hoa, 'step="5"')
  + inp("c3kUp", "Upkeep, a year", "The regional average", DEF.house.up, 'step="50"')
  + inp("c3kFlood", "Flood policy, a year", FLOOD_HINT.house, 0, 'step="10"')
  + `</div>`
  + `<h3 class="h3">Your loan (optional)</h3><div class="grid">`
  + `<label for="c3kDown">Down payment, percent<small>Your own figure</small><input id="c3kDown" type="number" inputmode="decimal" min="0" max="100" step="1" placeholder="Yours"></label>`
  + `<label for="c3kRate">Rate, percent<small>From your lender's quote</small><input id="c3kRate" type="number" inputmode="decimal" min="0" step="0.125" placeholder="Yours"></label>`
  + `<label for="c3kTerm">Term, years<input id="c3kTerm" type="number" inputmode="numeric" min="1" step="1" value="30"></label>`
  + `</div>`
  + `<h3 class="h3">What it costs</h3><div class="out" aria-live="polite">`
  + `<div><span>Property tax</span><strong id="c3kTax"></strong></div>`
  + `<div><span>County fee on the tax bill</span><strong id="c3kFee"></strong></div>`
  + `<div><span>Insurance</span><strong id="c3kInsO"></strong></div>`
  + `<div><span>HOA or condo fee</span><strong id="c3kHoaO"></strong></div>`
  + `<div><span>Upkeep</span><strong id="c3kUpO"></strong></div>`
  + `<div><span>Flood policy</span><strong id="c3kFloodO"></strong></div>`
  + `<div class="tot"><span>Cost besides the loan<small id="c3kYear"></small></span><strong id="c3kBesides"></strong></div>`
  + `<div class="wait"><span>Loan payment</span><strong id="c3kPI"></strong></div>`
  + `<div class="tot"><span>Total a month with the loan</span><strong id="c3kAll"></strong></div>`
  + `</div></div>`
  + `<script>(function(){var D=${JSON.stringify(DEF)},FH=${JSON.stringify(FLOOD_HINT)},HH2=${JSON.stringify(HOA_HINT)};var $=function(i){return document.getElementById(i)};`
  + `var num=function(i){var v=parseFloat($(i).value);return isFinite(v)&&v>0?v:0};var m=function(n){return "$"+Math.round(n).toLocaleString("en-US")};`
  + `var pick=function(n){var e=document.querySelector('input[name="'+n+'"]:checked');return e?e.value:""};`
  + `function calc(){if(!$("c3kTax"))return;var p=num("c3kPrice"),L=$("c3kLoc").value.split("|"),lev=+L[0],city=+L[1],fee=+L[2],six=pick("c3kUse")==="6";`
  + `var tax=six?p*.06*lev/1000:Math.max(0,p*.04*(lev-109.1)/1000-p*.04*city/1000*.534);`
  + `var ins=num("c3kIns"),hoa=num("c3kHoa")*12,up=num("c3kUp"),fl=num("c3kFlood");var yr=tax+fee+ins+hoa+up+fl;`
  + `$("c3kTax").textContent=m(tax/12)+" a month";$("c3kFee").textContent=fee?m(fee/12)+" a month":"none";$("c3kInsO").textContent=m(ins/12)+" a month";`
  + `$("c3kHoaO").textContent=m(hoa/12)+" a month";$("c3kUpO").textContent=m(up/12)+" a month";$("c3kFloodO").textContent=fl?m(fl/12)+" a month":"none";$("c3kBesides").textContent=m(yr/12)+" a month";$("c3kYear").textContent=m(yr)+" a year";`
  + `var hd=$("c3kDown").value.trim()!=="",hr=$("c3kRate").value.trim()!==""&&parseFloat($("c3kRate").value)>=0;`
  + `if(!(hd&&hr)){var ask="Add "+(hd?"your rate":hr?"your down payment":"your down payment and rate");$("c3kPI").textContent=ask;$("c3kAll").textContent="--";return}`
  + `var loan=p*(1-Math.min(100,parseFloat($("c3kDown").value)||0)/100),r=Math.max(0,parseFloat($("c3kRate").value)||0)/1200,n=(num("c3kTerm")||30)*12;`
  + `var pi=r>0?loan*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):loan/n;$("c3kPI").textContent=m(pi)+" a month";$("c3kAll").textContent=m(pi+yr/12)+" a month"}`
  + `function type(){var d=D[pick("c3kType")]||D.house;var pv=+$("c3kPrice").value;if(pv===D.house.price||pv===D.condo.price)$("c3kPrice").value=d.price;$("c3kIns").value=d.ins;$("c3kHoa").value=d.hoa;$("c3kUp").value=d.up;`
  + `var c=pick("c3kType")==="condo";$("c3kHoa").previousElementSibling.textContent=c?HH2.condo:HH2.house;$("c3kFlood").previousElementSibling.textContent=c?FH.condo:FH.house;calc()}`
  + `function go(){var c=$("c3k-calc");if(!c)return;c.addEventListener("input",calc);c.addEventListener("change",function(e){if(e.target.name==="c3kType")type();else calc()});calc()}`
  + `if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go()})();</script>`;

/* The offer: one label everywhere. */
const CTA_LABEL = "Talk to a specialized agent";   // his label (voice/RULES.md CTA-1)

/* Boxed offers mid-page, one after about every second section (owner, 2026-11-03: "mid roll CTA's are
   lacking"); the end band carries the last. The first keeps his label and the phone button. */
const ctaBox = (title, text) => `<div style="border-left:3px solid var(--brass);padding:1.2rem 1.4rem;margin:1.8rem 0;max-width:720px"><h3 style="color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin:0 0 .4rem">${title}</h3><p style="color:var(--muted);line-height:1.7;margin-bottom:.8rem">${text}</p>`
  + `<p style="display:flex;flex-wrap:wrap;gap:.6rem;margin:0"><a class="btn btn-brass" href="/contact/?topic=cost-to-own">${CTA_LABEL}</a><a class="btn btn-brass" href="tel:+18543332135">Call 854.333.2135</a></p></div>`;
const offerBox = (title, text, label) => `<div style="border-left:3px solid var(--brass);padding:1.2rem 1.4rem;margin:1.8rem 0;max-width:720px"><h3 style="color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin:0 0 .4rem">${title}</h3><p style="color:var(--muted);line-height:1.7;margin-bottom:.8rem">${text}</p>`
  + `<p style="margin:0"><a class="btn btn-brass" href="/contact/?topic=cost-to-own">${label}</a></p></div>`;

/* Photos (photos.json; each looked at full size). The house street sits under the house total (owner
   round 1); no year in a caption (the year is in the credits). */
const PH_STREET = ph.aerial("carolina-forest-house-streets-from-above", "Houses on streets in Carolina Forest, outside city limits, seen from above. The typical house in the table above is one like these.");
const PH_CONDOS = ph.aerial("myrtle-beach-oceanfront-condos-2011", "Condo buildings on the ocean in Myrtle Beach, seen from a plane. Condo owners share the cost of grounds, pools and parking lots like these through the condo fee.");
ph.share("myrtle-beach-oceanfront-condos-2011");

/* Sources a reader can open. */
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const STORM = "https://www.horrycountysc.gov/departments/stormwater/major-initiatives/utility-fee/";
const MB_FIN = "https://www.cityofmyrtlebeach.com/departments/financial_management_and_reporting.php";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const T38_75 = "https://www.scstatehouse.gov/code/t38c075.php";
const USC4012A = "https://www.law.cornell.edu/uscode/text/42/4012a";
const PUMS_PAGE = "https://www.census.gov/programs-surveys/acs/microdata.html";
const ACS_DEF = "https://www2.census.gov/programs-surveys/acs/tech_docs/subject_definitions/2024_ACSSubjectDefinitions.pdf";
const AHS_PAGE = "https://www.census.gov/programs-surveys/ahs.html";
const NFIP = "https://www.fema.gov/openfema-data-page/nfip-redacted-policies-v3";
const CLAIMS = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-claims-v2";
const CFPB = "https://www.consumerfinance.gov/ask-cfpb/on-a-mortgage-whats-the-difference-between-my-principal-and-interest-payment-and-my-total-monthly-payment-en-1941/";

const PER_MONTH = r10(U.total_per_month);

/* The condo fee's local reason, from the ZIP counts (row 26): the north end of Myrtle Beach is the highest,
   and Carolina Forest is about half of it. */
const CZ = Object.fromEntries(Object.entries(HOA.areas).filter(([, a]) => a.condo && a.condo.median).map(([z, a]) => [z, a.condo.median]));
must(Math.max(...Object.values(CZ)) === CZ["29572"] && CZ["29572"] === 875, "29572 is no longer the highest condo fee at $875 (row 26)");
must(CZ["29579"] / CZ["29572"] > 0.4 && CZ["29579"] / CZ["29572"] < 0.6, "Carolina Forest's condo fee is no longer about half the north end's (row 26)");
const MO = (v) => r10(v / 12);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => ph.pageImages(),
  title: "The Real Monthly Cost to Own in Myrtle Beach | Chapter3",
  description: `A typical Horry County house costs about ${r10(U.total)} a year to own besides the loan: tax, insurance, HOA fee and upkeep, by town, house or condo, with a calculator.`,
  ogTitle: "The real monthly cost to own a home in Myrtle Beach, line by line",
  crumb: "Cost to Own",
  eyebrow: "Before you buy",
  h1: "The real monthly cost to own a home in Myrtle Beach,",
  h1em: "line by line.",
  /* The total is in the first sentence under the H1 (critic round 2: an answer engine quotes the dek). */
  sub: `A typical ${usd(U.price)} house in Horry County costs about ${PER_MONTH} a month to own besides the loan, ${r10(U.total)} a year. Each part is below, town by town.`,
  /* The chips are monthly, and the line above them says so once (reader round 1 read "$3,270" as a month). */
  heroMedia: `<p style="margin:0 0 .45rem;color:var(--navy);font-weight:600;font-size:1rem;line-height:1.4">Each month, part by part:</p>` + glance([
    { icon: "tax", label: "Tax", text: MO(U.tax_legal_residence) },
    { icon: "storm", label: "Insurance", text: MO(U.insurance) },
    { icon: "home", label: "HOA fee", text: MO(U.hoa_yearly) },
    { icon: "key", label: "Upkeep", text: MO(UPKEEP) },
  ]),
  heroCta: { title: "Found a home? We work out its tax and fees before you offer.", label: CTA_LABEL, href: "/contact/?topic=cost-to-own" },
  author: "devin",
  shortAnswer: [
    `A typical house in Horry County, about ${usd(U.price)}, costs about ${PER_MONTH} a month to own if you live in it, about ${r10(U.total)} a year. That does not count the loan payment: paying back the loan and its interest.`,
    `In Myrtle Beach and North Myrtle Beach, a typical condo costs more to own each year than a typical house. The condo fee is the reason: condo owners pay it for the building they share. A second home pays about three times the property tax, about ${r100(U.total_second_home - U.total)} more a year.`,
  ],
  sections: [
    { h2: "How much does it cost to own a home in Myrtle Beach each year?", toc: "The yearly total", id: "yearly-total", html: () =>
      PAGE_CSS + ph.css() + CC_STYLE +
      h.p(`Upkeep and insurance are the biggest parts. Your lender usually collects the tax and insurance with each loan payment, but they are counted here, not in the loan. The HOA fee goes to your homeowners association. It and upkeep are usually paid separately.`) +
      BILL +
      PH_STREET +
      h.p(`Inside the City of Myrtle Beach, the same house costs about ${r10(CITY.total)} a year as your home. The tax is higher there, about ${r10(CITY.tax_legal_residence)}, and there is no county fee on the tax bill.`) +
      h.h3("What does a house cost to own in each town?") +
      h.p(`Between about ${r100(Math.min(...HOUSES.map((r) => r.total_legal_residence)))} and ${r100(Math.max(...HOUSES.map((r) => r.total_legal_residence)))} a year for a typical house, as your home. North Myrtle Beach has the highest prices, but most of its houses for sale list no HOA fee.`) +
      HOUSE_TABLE + HOUSE_NOTE +
      h.p(`Prices differ from town to town far more than these costs do. Our ${h.a("/buyers/affordable-places-to-live/", "affordable places page")} shows where a typical home costs least.`) },

    { h2: "Is a condo cheaper to own than a house in Myrtle Beach?", toc: "Condo or house", id: "condo-or-house", html: () =>
      h.p(`In Carolina Forest, yes. Its condo fees are the lowest in the table below, and a typical condo there costs about ${r100(CF_DIFF)} a year less to own than a typical house. In Myrtle Beach and North Myrtle Beach, no: their condo fees are the highest.`) +
      HC_CHART +
      h.p(`The condo is cheaper to buy, so its loan is smaller. In Myrtle Beach a typical condo costs less than half as much as a typical house; in North Myrtle Beach, a little more than half.`) +
      h.h3("Why are condo fees so high in Myrtle Beach?") +
      h.p(`They are highest near the ocean in Myrtle Beach. On the city's north end, a typical condo for sale lists about $${CZ["29572"]} a month. In Carolina Forest, inland, condos list about half that.`) +
      h.p(`Owners pay the fee for everything they share: running the building, upkeep, and improvements to the grounds, halls, lobby, parking and pool. It may also include the tax and insurance on the shared property. Your own unit's insurance is separate: condo owners pay about ${usd(INS_CONDO)} a year for it.`) +
      PH_CONDOS +
      h.p(`In each place below, the condo fee is about three quarters of what a condo owner pays a year to own the unit.`) +
      CONDO_TABLE + CONDO_NOTE +
      h.p(`Our ${h.a("/hoa/master-insurance-ho6/", "guide to the building's policy and your own")} shows what each one covers. When a building needs more than its savings, owners get a ${h.a("/hoa/special-assessments/", "special assessment")}. Whether a condo pays as an investment is on our ${h.a("/invest/condos/", "condo investing page")}. Why some buildings cannot get a normal loan is on our ${h.a("/invest/non-warrantable-condos/", "page on condos most lenders will not lend on")}.`) +
      ctaBox("Looking at a condo to rent out?", "Some communities ban renting at all. Our agents read the HOA documents for rules that would block your plan before you offer.") +
      h.h3("How many homes here pay an HOA fee?") +
      h.p(`More than half. About 6 in 10 homeowners across most of Horry County pay an HOA or condo fee; in the rest of South Carolina, about 1 in 3. Still, more than 1 in 4 houses for sale here list no HOA fee. Our page on ${h.a("/buyers/no-hoa-homes/", "homes with no HOA")} shows where they are.`) },

    { h2: "How much more does a second home pay in property tax?", toc: "Second home tax", id: "second-home-tax", html: () =>
      h.p(`About ${Math.min(...times)} to ${Math.max(...times)} times as much as the same house as your home. On a ${usd(EX.tax_chart_same_house.value)} house, that is about ${r100(GAP_LO)} to ${r100(GAP_HI)} more a year, depending on the town.`) +
      TAX_CHART +
      h.p(`On a home you live in, the tax rate is charged on 4 percent of its value, not the whole value: on a ${usd(EX.tax_chart_same_house.value)} house, on ${usd(EX.tax_chart_same_house.value * 0.04)}. It also pays only part of the school tax. A second home or a rental is charged on 6 percent and pays all of the school tax. Our ${h.a("/buyers/second-home/", "second home guide")} covers the rest of owning one.`) +
      h.p(`The 4 percent rate is not automatic: you apply for it. Our ${h.a("/buyers/property-taxes/", "property tax guide")} has the steps, and our ${h.a("/buyers/common-mistakes/", "buyer mistakes page")} shows what paying 6 percent by mistake costs.`) +
      h.p(`At 65 you can have part of your home's value exempted from property tax. Our ${h.a("/buyers/retirees/", "retiree guide")} covers who qualifies and how much.`) },

    { h2: "What does homeowners insurance cost in Myrtle Beach?", toc: "Insurance", id: "insurance", html: () =>
      h.p(`A typical house owner in Horry County pays about ${usd(INS.horry.median)} a year, about 40 percent more than in the rest of South Carolina. That is all their home insurance together, with a wind or flood policy included where they have one. Half pay between about ${usd(PUMS.house_detached.INSP.p25)} and ${usd(PUMS.house_detached.INSP.p75)}.`) +
      h.p(`Near the ocean, wind can be a separate policy. On the ocean side of U.S. 17, the highway along the coast, an insurer may leave wind and hail out of a homeowners policy. In Myrtle Beach the line is the U.S. 17 Bypass. The owner then buys that cover separately, for example from the state's backup insurer for wind.`) +
      WIND_SIDES +
      h.p(`The ${usd(INS.horry.median)} includes those wind policies. About 1 in ${Math.round(1 / SPREAD.share_4000_or_more)} house owners here pay ${usd(4000)} or more a year for all their home insurance, and about 1 in ${Math.round(1 / SPREAD.share_6000_or_more)} pay ${usd(6000)} or more. The Census figures do not split by side of the highway. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} explains each policy.`) +
      we("If you buy with us, we get you an insurance quote for the address before you make an offer, so wind and flood are in your budget before you commit.") +
      h.h3("Do I need flood insurance in Myrtle Beach?") +
      h.p(`You must have it if the home is in the high-risk flood zone and your loan is from a bank or other lender the federal government regulates. Anywhere else it is your choice, but since 2015, 3 in 10 paid flood claims in Horry County were on buildings outside that zone. The Federal Emergency Management Agency (FEMA) maps the zone.`) +
      h.p(`About 1 in 15 houses resold in Horry County were in the zone, and about 1 in 4 condos.`) +
      FLOOD_TILES +
      h.p(`A FEMA flood policy on a condo unit its owner lives in, outside the high-risk zone, costs about ${usd(FL.condo_unit_lived_in_outside_high_risk)} a year. Flood is not in the yearly total above; you can add it in the calculator below. Our page on ${h.a("/buyers/undisclosed-flooding/", "homes that have flooded")} shows how we learn a house's flood history.`) +
      offerBox("Has the home you like flooded before?", "Before you offer, we look up the flood history for that address.", "Have us check its flood history") },

    { h2: "How much should I budget for upkeep?", toc: "Upkeep", id: "upkeep", html: () =>
      h.p(`About ${r10(UPKEEP)} a year for a house: about ${r10(AHS.SouthAtlantic.yearly.mean)} of routine repairs and about ${r10(Math.round(UPKEEP / 10) * 10 - Math.round(AHS.SouthAtlantic.yearly.mean / 10) * 10)} put toward the big replacements. A condo owner spends about ${r10(UPKEEP_CONDO)} a year on upkeep; the building's upkeep is paid from the condo fee.`) +
      h.p(`Most years cost far less than the average, and some years cost much more. Half of house owners spend about ${r10(AHS.SouthAtlantic.yearly.median)} or less on routine repairs in a year, and about ${pctOne(AHS.SouthAtlantic.share_spending_zero)} spend nothing. The average is high because of the big jobs:`) +
      REPL +
      h.p(`Budgeting 1 percent of the value a year is a little high: on the typical house it gives ${usd(U.price * 0.01)}.`) },

    { h2: "What are electric and water bills like in Myrtle Beach?", toc: "Utilities", id: "utilities", html: () =>
      h.p(`Electricity costs less here than in the rest of South Carolina, and water is a small bill. These are typical bills for owners:`) +
      UTIL_TILES +
      h.p("One household's bills: on one of our team's own houses, about 1,400 square feet on two floors, summer electricity is about $130 a month and water about $50.") },

    { h2: "What will my home cost each month? Use the calculator", toc: "Calculator", id: "calculator", html: () =>
      h.p(`Pick a house or a condo, your town and how you will use it. Insurance, the HOA fee and upkeep are filled in from this page, and you can change any of them. Add a flood policy if the home needs one. Your cost shows at once. Add your rate and down payment from your lender to see the loan payment.`) +
      CALC +
      h.p(`The calculator uses Horry County's current rates, the same math as our ${h.a("/buyers/property-taxes/", "property tax calculator")}. It leaves out the 65 and older exemption and small special districts.`) +
      offerBox("Want homes that fit your monthly budget?", "Tell us what you can spend each month, loan included, and we send homes for sale that fit.", "Send us your budget") },
  ],
  faqTitle: "Cost to own FAQ",
  faq: [
    { q: "What is PITI, and what is not in it?", a: "PITI stands for principal, interest, taxes and insurance. It is the loan payment plus the property tax and home insurance, which the lender usually collects with it, and mortgage insurance if the loan needs it. An HOA or condo fee is usually paid separately. Upkeep and utilities are not in it." },
    { q: "Will my property tax be the same as the seller's?", a: "Not always. After a sale, the county values the home again, and the new value is first taxed the year after the sale. Do not budget from the seller's tax bill." },
    { q: "Does the cost change if I rent the home out?", a: "Yes. A rental is taxed like a second home, on 6 percent of its value. The second-home section above shows the tax by town." },
    { q: "Is Myrtle Beach expensive to own a home in?", a: `A little more than the rest of South Carolina. Owners of a paid-off house here pay about ${r10(PAID.horry.median - PAID.rest_of_sc.median)} a month more for tax, insurance, utilities and any HOA fee together.` },
  ],
  sources: [
    { name: "2026 county levy", href: LEVY },
    { name: "Stormwater fee", href: STORM },
    { name: "Myrtle Beach budget", href: MB_FIN },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "12-37", href: T12_37 },
    { name: "38-75", href: T38_75 },
    { name: "42 U.S.C. 4012a", href: USC4012A },
    { name: "Census ACS", href: PUMS_PAGE },
    { name: "AHS", href: AHS_PAGE },
    { name: "FEMA policies", href: NFIP },
    { name: "FEMA claims", href: CLAIMS },
    { name: "CFPB", href: CFPB },
  ],
  sourcesNote: "Prices: county deeds, 12 months to September 2026. Insurance, utilities, HOA share: Census American Community Survey 2024, Horry County outside the Loris area; insurance includes wind and flood where carried. Upkeep: Census American Housing Survey 2023, South Atlantic states. Fees: homes for sale, Horry ZIPs, one day. Not legal, tax or insurance advice.",
  afterSources: () => {
    let c = ph.credits();
    for (const r of ph.used()) if (r.taken && /Geological Survey/.test(r.author || "")) {
      const a = `${r.caption} Photo: ${r.author}, `;
      must(c.includes(a), "the USGS credit line moved: put the flight year back in it");
      c = c.split(a).join(`${r.caption} Photo: ${r.author}, ${String(r.taken).slice(0, 4)}, `);
    }
    return c;
  },
  bottomCta: { h2: "Want the costs worked out for one home?", p: "An agent works out the tax at your rate and the HOA or condo fee for the address before you offer.", label: CTA_LABEL, href: "/contact/?topic=cost-to-own" },
  keywords: "cost to own a home Myrtle Beach, true cost of owning a home, hidden costs of owning a home, cost of owning a condo Myrtle Beach, Horry County property tax, homeowners insurance Myrtle Beach, condo fees Myrtle Beach, flood insurance cost Myrtle Beach, home maintenance cost per year, average electric bill Myrtle Beach, is it cheaper to own a condo or house, PITI",
  about: "The yearly cost of owning a home in Myrtle Beach and Horry County, South Carolina, besides the loan",
});
