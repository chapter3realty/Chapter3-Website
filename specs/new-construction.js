/* /buyers/new-construction/ - buying a new house on the Grand Strand: whether new is worth it against a
 * nearly new house, where builders build and who, what a new house costs, the tax bill the price leaves
 * out, your own agent, incentives and the builder's lender, spec or to-be-built, the three inspections,
 * and what South Carolina law gives you when something is wrong.
 *
 * Batch 2026-10-d, Lane U. Version 1, 2026-11-01. The live page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-10-d/buyers-new-construction/facts.md (VERIFIED rows, and CORRECTED rows
 * in the verifier's "Use" wording only; VERIFY.md). Demand: must-answer.md (Google suggestions of
 * 2026-11-01). Plan: PLAN.md. Struck wording: struck.json (none of it is on this page).
 * Data: data/2026-10-d/buyers-new-construction/ (README.md): the CRM's active MLS listings counted in
 * aggregate (findings-listings.json, chart-*.json, raw/listings.json for the dot map, no address or
 * photo), the county deed index joined to county parcels (findings-deeds-verified.json, the verifier's
 * company-only rerun: 5,108 builder sales, not 5,111), the county flood layer (findings-flood.json), the
 * Census Survey of Construction and ACS 2025 (raw/). Every count, share and median on the page is read
 * from those files here and checked against its ledger row; chart-tax-lag.json is not used because the
 * verifier's rerun changed three months, so the tax chart reads builder_imp0_by_month from the verified file.
 * Kept from the live page: the title and H1 the owner liked (data/headlines.json), "Set up my builder
 * tour", your own agent at the first visit, the written agreement since 2024, incentives tied to the
 * builder's lender with Loan Estimates compared, the three inspections, the warranty, spec or
 * to-be-built, the link for investors. Not kept (judge 2026-10-31, SWEEP, ledger "Not verified"): the
 * broken Market Common sentence, the unsourced complaint and lawsuit lines, "no statutory new-home
 * warranty", the full lead form above the answer, "Read it before you sign", "treat that as
 * information", "the builder pays the buyer agent fee in most communities" (owner question O1), the
 * registration rule as fact (O2), five calls to action, the off-market search sentence (the mkpage donor
 * carries the new one).
 * Service lines pending the owner (facts.md O3, O6): "we line up the Loan Estimates", "we look up the
 * builder's license". The other service lines were on the live page (register with you, review the
 * contract and incentives, set up the inspections, track the warranty deadlines).
 * Never on the page: a rate, a payment, a down payment, a sold MLS price, a value for any address, a
 * judgment of any builder (builders are named only with their recorded sale counts).
 * Pictures: our own charts, dot map and drawing, and one U.S. government aerial (USDA NAIP, April 2023,
 * public domain; record in data/2026-10-d/buyers-new-construction/photos.json, checked by tools/photos.js)
 * of a new street in the City of Myrtle Beach at every stage of building, with four numbered markers.
 * No Commons photo: the one candidate of a framed house (Kgacs, CC BY-SA 4.0) is a car-window shot whose
 * subject is a sheathing brand printed on every panel (rules/images.md, a product as the subject), and
 * the other is 1,083 px wide. The aerial and the drawing of an open wall stand in until the photo
 * partner's shots arrive (batches/2026-10-d/buyers-new-construction/shot-list.md).
 * Review round 1 (2026-11-01; Blog-Brain batches/2026-10-d/buyers-new-construction/REVIEW-1.md): new H1 (the
 * PLAN.md alternative; the defect H1 had no finding behind it), the ten communities where builders sold the
 * most (ledger row 33, county deeds and GIS), what a new house gives you (rows 29, 35), the HOA fee (row 34),
 * the 4 percent deadline (row 36), each fact said once, fewer exact numbers, the law cut to what it means,
 * the story cut (no tension in the entry), the O3 and O6 service lines back to the live wording or cut.
 * Review round 2 (REVIEW-2.md): the community cards say what each builder's page lists and link to the homes for sale
 * there (rows 38, 39); the agent's pay and the first visit (rows 43, 44); what else the sign leaves out (row 40);
 * the builder's lender (rows 41, 42); no catch-up bill (row 45); the code bullet (row 46); no hero tiles; hedges,
 * repeats and the "clocks" metaphor cut; dates said as data periods, not "this year".
 * Final fix (2026-11-03, REVIEW-FINAL.md): what the sign leaves out now names lot premiums and options (rows 47
 * to 49), closing costs (rows 50, 52) and HOA charges at closing (row 51); the aerial stays (no free-licence ground photo exists).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/buyers/new-construction/";
const CONTACT = "/contact/";
const DATA = path.join(__dirname, "..", "data", "2026-10-d", "buyers-new-construction");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("findings-listings.json"), D = read("findings-deeds-verified.json"), FL = read("findings-flood.json");
const PAIR = read("chart-new-vs-nearly-new.json"), SHARE = read("chart-share-by-town.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const near = (v, step) => Math.round(v / step) * step;
const must = (ok, what) => { if (!ok) throw new Error(`new-construction: ${what} differs from its ledger row`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                             */

const NH = L.sets.new_house.all, NT = L.sets.new_townhouse.all;
must(L.share_new.new_in_horry_all_set === 1006 && L.share_new.houses_in_horry === 3014, "row 1");
must(NT.count === 108 && near(NT.median_price, 5000) === 275000 && near(NT.median_sqft, 10) === 1580, "row 2");
must(NH.count === 1006 && near(NH.median_price, 10000) === 370000 && near(NH.median_sqft, 100) === 1900 && NH.median_acres === 0.23, "row 3");
const BANDS = L.new_house_price_bands;
must(BANDS[0].count === 198 && BANDS.reduce((t, b) => t + b.count, 0) === 1006, "row 3 (price bands)");
const M = L.matched;
must(M.new_houses_matched === 244 && M.median_ratio === 1.009 && M.share_new_cheaper_per_sqft === 0.488, "row 5");
const BYC = Object.fromEntries(L.by_city_house.map((c) => [c.city, c]));
must(BYC.Conway.new.median_acres === 0.23 && BYC.Conway.nearly_new_2016_2023.median_acres === 0.22
  && BYC.Longs.new.median_acres === 0.19 && BYC.Longs.nearly_new_2016_2023.median_acres === 0.17
  && BYC["Myrtle Beach"].new.median_acres === 0.17 && BYC["Myrtle Beach"].nearly_new_2016_2023.median_acres === 0.18, "row 7 (corrected)");
must(L.sets.new_house.years["2026"] === 757, "row 8");
must(D.builder_sales === 5108 && D.steps["residential land use code"] === 17881, "row 9 (corrected)");
const BY = Object.fromEntries(D.by_builder);
const TOP5 = [["D.R. Horton", "D.R. Horton"], ["Lennar", "Lennar"], ["NVR (Ryan Homes)", "NVR, parent of Ryan Homes"], ["Pulte", "Pulte"], ["Meritage", "Meritage"]];
must(BY["D.R. Horton"] === 1417 && BY.Lennar === 982 && BY["NVR (Ryan Homes)"] === 490 && BY.Pulte === 383 && BY.Meritage === 334, "row 10 (corrected)");
const TOP5_SUM = TOP5.reduce((t, [k]) => t + BY[k], 0);
must(TOP5_SUM === 3606 && D.top5_share_of_builder_sales_pct === 70.6, "row 10 (share)");
must(D.builder_imp0.deeds_jan_sep_2026[0] === 3093 && D.builder_imp0.deeds_jan_sep_2026[1] === 3825 && D.builder_imp0.deeds_oct_dec_2025[0] === 0 && D.builder_imp0.deeds_oct_dec_2025[1] === 1283, "row 24 (corrected)");
must(D.q4_2025_builder_value_to_price.n === 1282 && D.q4_2025_builder_value_to_price.median === 0.998, "row 25 (corrected)");
const LAND = D.builder_2026_imp0_land;
must(LAND.median_market_land === 80000 && LAND.median_price_of_those_deeds === 329000, "row 26 (inputs)");
/* Row 26: the 2026 Horry County levy, unincorporated: 201.0 mills; a legal residence pays no school
   operating mills (109.1), so 91.9. Legal residence 4 percent, other 6 percent. */
const MILLS = 171.2 + 20.2 + 1.5 + 8.1, MILLS_LR = MILLS - 109.1;
const tax = (value, ratio, mills) => value * ratio * mills / 1000;
const T_LOT4 = tax(LAND.median_market_land, 0.04, MILLS_LR), T_HOUSE4 = tax(LAND.median_price_of_those_deeds, 0.04, MILLS_LR);
const T_LOT6 = tax(LAND.median_market_land, 0.06, MILLS), T_HOUSE6 = tax(LAND.median_price_of_those_deeds, 0.06, MILLS);
must(Math.round(T_LOT4) === 294 && Math.round(T_HOUSE4) === 1209 && Math.round(T_LOT6) === 965 && Math.round(T_HOUSE6) === 3968, "row 26 (tax)");
must(T_HOUSE6 / T_HOUSE4 > 3 && T_HOUSE6 / T_HOUSE4 < 3.5, "row 26 (more than three times)");
const STATUS = fs.readFileSync(path.join(DATA, "raw", "listings-status-totals.txt"), "utf8");
must(Math.round(570 / 1265 * 100) === 45 && /new_construction 1265/.test(STATUS) && /quick_move_in 570/.test(STATUS) && /still_being_built 695/.test(STATUS), "row 11");
must(FL.new_house.in_sfha === 52 && FL.new_house.in_horry === 1006 && FL.all_house.in_sfha === 248 && FL.all_house.in_horry === 3014, "row 29");
const ACS = read("raw/acs-ACSDT1Y2025.B25034.json").response.data;
const acs = (k) => +ACS[1][ACS[0].indexOf(k)];
must(acs("B25034_001E") === 237850 && acs("B25034_002E") === 36932 && acs("B25034_002E") + acs("B25034_003E") === 83085, "row 30 (corrected, ACS 2025)");
const PCT = (a, b) => Math.round(a / b * 100);
/* Row 34 (fixer): HOA fee on new houses for sale, whole MLS feed. */
const HOA = fs.readFileSync(path.join(DATA, "raw", "listings-hoa-totals.txt"), "utf8");
const hoaN = (q) => +(HOA.match(new RegExp("has=new_construction" + q.replace(/[?&=]/g, (c) => "\\" + c) + " (\\d+)\\n")) || [])[1];
must(hoaN("") === 1260 && hoaN("&hoa=0") === 260 && hoaN("&hoaMax=100") === 926, "row 34");
/* Row 33 (fixer): the ten communities with the most builder sales (build_communities.py). */
const CM = read("findings-communities.json");
must(CM.builder_sales === 5108 && CM.communities.length === 10 && CM.top10_sales === 1402
  && CM.communities.map((c) => c.sales).join(",") === "219,197,158,137,136,120,116,111,107,101", "row 33");
const MID_NEW = near(NH.median_price, 10000);                       // $370,000

/* ---------------------------------------------------------------------------- */
/* Page styles: the glass cards and charts this page draws itself. Scoped to .c3-nc. */

const GL = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 18px 40px -28px rgba(28,32,40,.45);border-radius:20px";
const C_NEW = "#c4783a", C_OLD = "#5c6b78", C_NAVY = "#1c2028";
const FIGCAP = "color:var(--muted);font-size:.95rem;line-height:1.55;margin:.8rem 0 0;padding:0";
const CSS = "<style>"
  + ".c3-nc-cap{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.05rem;line-height:1.35;margin:0 0 .7rem}"
  + ".c3-nc-key{display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;margin:0 0 .9rem;font-family:var(--sans);font-size:1rem;color:var(--navy)}"
  + ".c3-nc-key span{display:inline-flex;align-items:center;gap:.4rem}.c3-nc-key i{display:inline-block;width:1.1rem;height:.75rem;border-radius:3px}"
  /* Chart A: new against nearly new, price per square foot, by town */
  + `.c3-nc-fig{${GL};margin:1.4rem 0 1.6rem;padding:1.1rem 1.15rem 1rem;max-width:760px;box-sizing:border-box}`
  + ".c3-nc-town{margin:0 0 .8rem}.c3-nc-town:last-of-type{margin-bottom:0}"
  + ".c3-nc-town .tn{display:block;font-family:var(--sans);font-weight:650;font-size:1rem;color:var(--navy);margin-bottom:.2rem}"
  + ".c3-nc-row{display:grid;grid-template-columns:6.2rem minmax(0,1fr) 3.4rem;align-items:center;gap:.55rem;font-family:var(--sans);font-size:1rem;color:var(--muted);line-height:1.35}"
  + ".c3-nc-row .bar{display:block;min-width:0}.c3-nc-row .bar i{display:block;height:.62rem;border-radius:999px;min-width:3px}"
  + ".c3-nc-row em{font-style:normal;color:var(--navy);font-weight:600;white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums}"
  /* Chart C: builder sales by month, the part still taxed as a lot */
  + ".c3-nc-cols{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:.3rem;align-items:end;height:11rem;margin:.4rem 0 .2rem;border-bottom:1px solid rgba(28,32,40,.25)}"
  + ".c3-nc-cols>span{display:flex;flex-direction:column-reverse;height:100%;justify-content:flex-start}"
  + ".c3-nc-cols>span>i{display:block;width:100%}.c3-nc-cols>span>i:first-child{border-radius:0}.c3-nc-cols>span>i:last-child{border-radius:5px 5px 0 0}"
  + ".c3-nc-mo{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:.3rem;font-family:var(--sans);font-size:.95rem;color:var(--navy);text-align:center;line-height:1.3}"
  + ".c3-nc-yr{display:grid;grid-template-columns:3fr 9fr;gap:.3rem;font-family:var(--sans);font-size:.95rem;color:var(--muted);text-align:center;margin-top:.15rem}"
  + ".c3-nc-yr span{border-top:2px solid rgba(28,32,40,.18);padding-top:.15rem}"
  /* Decision cards and checklists */
  + ".c3-nc-dec{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.75rem;max-width:760px}"
  + "@media (min-width:760px){.c3-nc-dec{grid-template-columns:1fr 1fr}}"
  + `.c3-nc-dec>li{${GL};margin:0;padding:.95rem 1.1rem;display:grid;grid-template-columns:40px 1fr;gap:.2rem .85rem;align-items:start;align-content:start}`
  + ".c3-nc-ic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:13px;color:var(--brass);background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.95);box-shadow:0 6px 14px -10px rgba(28,32,40,.45)}"
  + ".c3-nc-dec .k{grid-column:2;align-self:center;font-family:var(--sans);font-size:1.05rem;font-weight:650;color:var(--navy);line-height:1.3}"
  + ".c3-nc-dec .d{grid-column:1 / -1;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55;margin-top:.35rem}"
  + ".c3-nc-dec .d a{color:var(--navy);text-decoration:underline}"
  + `.c3-nc-check{${GL};list-style:none;margin:1.2rem 0 1.6rem;padding:1rem 1.15rem;max-width:760px;display:grid;gap:.7rem}`
  + ".c3-nc-check li{margin:0;display:grid;grid-template-columns:1.9rem 1fr;gap:.6rem;align-items:start;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}"
  + ".c3-nc-check li::before{content:'';width:1.6rem;height:1.6rem;border-radius:50%;margin-top:.05rem;background:var(--brass) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5'/%3E%3C/svg%3E\") center/1rem no-repeat}"
  + ".c3-nc-check strong{color:var(--navy);font-family:var(--sans)}"
  /* Numbered steps */
  + ".c3-nc-steps{list-style:none;counter-reset:s;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.7rem;max-width:760px}"
  + `.c3-nc-steps>li{${GL};counter-increment:s;margin:0;padding:.95rem 1.1rem .95rem 4rem;position:relative;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}`
  + ".c3-nc-steps>li::before{content:counter(s);position:absolute;left:1rem;top:.9rem;width:2.1rem;height:2.1rem;border-radius:50%;background:var(--navy);color:#f4efe8;font-family:var(--sans);font-weight:700;display:flex;align-items:center;justify-content:center}"
  + ".c3-nc-steps strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem;margin-bottom:.1rem}"
  /* The deadlines after closing */
  + ".c3-nc-tl .r{margin:0 0 .85rem}.c3-nc-tl .r:last-of-type{margin-bottom:.4rem}"
  + ".c3-nc-tl .l{display:flex;justify-content:space-between;gap:.6rem;font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.35;margin-bottom:.25rem}"
  + ".c3-nc-tl .l b{font-weight:650;white-space:nowrap}"
  + ".c3-nc-tl .trk{position:relative;height:.7rem;border-radius:999px;background:rgba(28,32,40,.08)}"
  + ".c3-nc-tl .trk i{position:absolute;left:0;top:0;bottom:0;border-radius:999px}"
  + ".c3-nc-tl .trk u{position:absolute;top:-.3rem;bottom:-.3rem;width:3px;margin-left:-1.5px;background:var(--navy);border-radius:2px}"
  + ".c3-nc-ax{position:relative;height:1.4rem;font-family:var(--sans);font-size:.95rem;color:var(--muted);border-top:1px solid rgba(28,32,40,.2);margin-top:.5rem}"
  + ".c3-nc-ax span{position:absolute;top:.15rem;transform:translateX(-50%);white-space:nowrap}"
  + ".c3-nc-ax span:first-child{transform:none}.c3-nc-ax span:last-child{transform:translateX(-100%)}"
  + ".c3-nc-map svg,.c3-nc-draw svg{display:block;width:100%;height:auto}"
  /* The closing offer band. glass.js draws every navy band that is not the last child of <main> as the slim
     light top bar; the website's edge puts the MLS notice after the closing band, so the closing band got the
     light bar with ivory text (batches/2026-10-d/buyers-new-construction/NEEDS.md). This puts the dark panel back. */
  + 'main#main>section[style^="background:var(--navy)"]:last-of-type{padding:.9rem 0!important}'
  + 'main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{display:block;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6);border-radius:28px;padding:2.2rem 1.6rem;width:calc(100% - 32px);box-sizing:border-box;margin-left:auto!important;margin-right:auto!important;max-width:720px}'
  + '@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem;border-radius:24px}}'
  + 'main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap>a.btn{padding:.9rem 1.6rem;margin:0}'
  + ".c3-nc-num{list-style:none;counter-reset:k;display:grid;gap:.45rem;margin:.9rem 0 0;padding:0}"
  + ".c3-nc-num li{counter-increment:k;display:grid;grid-template-columns:1.8rem 1fr;gap:.6rem;align-items:start;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.45}"
  + ".c3-nc-num li::before{content:counter(k);width:1.7rem;height:1.7rem;border-radius:50%;background:#c4783a;color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #fff}"
  /* The ten communities (row 33): glass cards, numbered as on the map */
  + ".c3-nc-cm{display:grid;gap:.7rem;margin:1.2rem 0 1.6rem;max-width:760px}"
  + "@media (min-width:760px){.c3-nc-cm{grid-template-columns:1fr 1fr}}"
  + `.c3-nc-cm>div{${GL};padding:1rem 1.05rem 1.05rem;display:grid;grid-template-columns:2rem minmax(0,1fr);gap:0 .75rem;align-items:start;align-content:start}`
  + ".c3-nc-cm b.n{width:2rem;height:2rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center}"
  + ".c3-nc-cm .bd{display:flex;flex-direction:column;justify-content:flex-start;gap:.45rem;min-width:0}"
  + ".c3-nc-cm .nm{font-family:var(--sans);font-weight:650;font-size:1.12rem;color:var(--navy);line-height:1.3;margin-top:.2rem}"
  + ".c3-nc-cm .pl{font-family:var(--sans);font-size:.9rem;color:var(--muted);line-height:1.3;margin-top:-.3rem}"
  + ".c3-nc-cm p{margin:0;font-size:1rem;line-height:1.5;color:var(--muted)}.c3-nc-cm p.hs{color:var(--navy)}"
  + ".c3-nc-cm a.go{display:block;font-family:var(--sans);font-weight:650;font-size:.98rem;line-height:1.45;color:var(--g-ink,#8a5226);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1.5px;margin-top:.1rem}.c3-nc-cm a.go svg{display:inline;vertical-align:-3px;margin-left:.3rem}"
  + ".c3-nc-note{color:var(--muted);font-size:.95rem;line-height:1.5;max-width:760px;margin:-.6rem 0 1.4rem}"
  /* Shared chrome fixes, scoped to this page until the shared files change (NEEDS.md items 5 to 7). */
  /* The edge's listing search box ran 44 px past a 320 px screen: let the row shrink and the button wrap. */
  + "main#main .hx-fb-ai,main#main .hx-fb-q,main#main .hx-fb-ai *{min-width:0;max-width:100%;box-sizing:border-box}"
  + "@media (max-width:400px){main#main .hx-fb-q{flex-wrap:wrap;padding-right:1rem}main#main .hx-fb-q textarea{flex:1 1 100%;width:100%}main#main .hx-fb-go{margin-left:auto}}"
  /* The header phone number ran 5 px past a 1024 px window. */
  + "@media (min-width:900px) and (max-width:1100px){.header-ctas{gap:10px!important}.header-ctas .hdr-phone-num{font-size:14px!important}.header-ctas .btn{padding-left:14px!important;padding-right:14px!important}}"
  /* "On this page": two columns at desktop, not one tall column. */
  + "@media (min-width:700px){main#main nav[aria-label=\"On this page\"]>ul{display:grid;grid-template-columns:1fr 1fr;column-gap:2.2rem}}"
  /* Review round 2: the H1 line breaks evenly (no word alone on the last line); the shared charts keep the 760 px column;
     a button label stays on one line at 320 px. */
  + "main#main h1{text-wrap:balance}main#main .c3-gchart{max-width:760px;box-sizing:border-box}"
  + "@media (max-width:360px){main#main a.btn{white-space:nowrap;padding-left:1rem!important;padding-right:1rem!important}}"
  /* The hero tiles at 320: short words, not one word a line. */
  + "@media (max-width:360px){main#main .c3-glance span.t{font-size:.92rem;line-height:1.25}}"
  + ".c3-nc-ax{margin-bottom:.9rem}"
  + "main#main #tax-bill table th:first-child{width:44%}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Sources                                                                       */

const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const T40_59 = "https://www.scstatehouse.gov/code/t40c059.php";
const T15_3 = "https://www.scstatehouse.gov/code/t15c003.php";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const T38_73 = "https://www.scstatehouse.gov/code/t38c073.php";
const T6_9 = "https://www.scstatehouse.gov/code/t06c009.php";
const T12_39 = "https://www.scstatehouse.gov/code/t12c039.php";
const CFPB_HOME = "https://www.consumerfinance.gov/owning-a-home/explore/find-the-right-home/";
const DHI_FL = "https://www.drhorton.com/florida/southeast-florida/florida-city/palm-cay/qmis/1301-ne-4-avenue";
const LEN_KO = "https://www.lennar.com/new-homes/south-carolina/myrtle-beach/conway/kingston-oaks";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const TREAS = "https://www.horrycountysc.gov/tax-payer-services/real-property-tax/";
const SOC = "https://www.census.gov/construction/nrc/xls/avg_starttocomp_cust.xlsx";
const NAR = "https://www.nar.realtor/the-facts/what-the-nar-settlement-means-for-home-buyers-and-sellers";
const CFPB_LE = "https://www.consumerfinance.gov/owning-a-home/loan-estimate/";
const REGX = "https://www.consumerfinance.gov/rules-policy/regulations/1024/17/";
const DHI = "https://www.sec.gov/Archives/edgar/data/882184/000088218425000081/dhi-20250930.htm";
/* Final fix, rows 47 to 52. */
const PULTE_CC = "https://www.pulte.com/homes/south-carolina/myrtle-beach/myrtle-beach/crescent-cove-211035";
const TOL = "https://www.sec.gov/Archives/edgar/data/794170/000079417025000112/tol-20251031.htm";
const PHM = "https://www.sec.gov/Archives/edgar/data/822416/000082241626000007/phm-20251231.htm";
const MTH = "https://www.sec.gov/Archives/edgar/data/833079/000083307926000010/mth-20251231.htm";
const CFPB_CC = "https://www.consumerfinance.gov/ask-cfpb/what-fees-or-charges-are-paid-when-closing-on-a-mortgage-and-who-pays-them-en-1845/";
const REGZ38 = "https://www.consumerfinance.gov/rules-policy/regulations/1026/interp-38/";
const LLR = "https://llr.sc.gov/res/";
const FLOOD = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/19";

/* ---------------------------------------------------------------------------- */
/* Section 1: new against nearly new (rows 5, 6, 7), what new gives you (rows 22, 29, 35), the choice. */

/* Chart A (row 6): towns with 15 or more of each kind; Loris and Aynor have 10 and 12 nearly new
   listings, too few (verifier), so they are left out. */
const PAIR_ROWS = PAIR.rows.filter((r) => r.new_n >= 15 && r.nearly_new_n >= 15);
must(PAIR_ROWS.map((r) => r.town).join(",") === "Conway,Longs,Myrtle Beach,Little River,Galivants Ferry,North Myrtle Beach", "row 6 (towns)");
const PMAX = Math.max(...PAIR_ROWS.flatMap((r) => [r.new_ppsf, r.nearly_new_ppsf]));
const pbar = (label, v, color) => `<div class="c3-nc-row"><span>${label}</span><span class="bar"><i style="width:${(v / PMAX * 100).toFixed(1)}%;background:${color}"></i></span><em>${money(v)}</em></div>`;
const PAIR_CHART = `<figure class="c3-nc-fig" role="group" aria-label="Typical asking price per square foot of new houses and of houses built 2016 to 2023, by town in Horry County">`
  + `<span class="c3-nc-cap">Typical asking price per square foot, houses for sale</span>`
  + `<div class="c3-nc-key" aria-hidden="true"><span><i style="background:${C_NEW}"></i>New</span><span><i style="background:${C_OLD}"></i>Nearly new: built 2016 to 2023</span></div>`
  + PAIR_ROWS.map((r) => `<div class="c3-nc-town"><span class="tn">${r.town}</span>${pbar("New", r.new_ppsf, C_NEW)}${pbar("Nearly new", r.nearly_new_ppsf, C_OLD)}</div>`).join("")
  + `<figcaption style="${FIGCAP}">Houses for sale in Horry County, grouped by the town in the address. A Myrtle Beach address includes inland Carolina Forest. Typical means half are higher and half lower. Towns with at least 15 of each kind.</figcaption></figure>`;

/* What a new house gives you: rows 12 note and 22 (the county inspects for code), 29 (flood), 35 (wind rates). */
const GIVES = `<ul class="c3-nc-check" role="list" aria-label="What a new house gives you">`
  + `<li><span><strong>No one has lived in it.</strong> If the builder has not started it, you also pick the plan and the finishes.</span></li>`
  + `<li><span><strong>A written warranty from the builder.</strong> The ${h.a("#warranty-law", "warranty section")} below lists what it covers.</span></li>`
  + `<li><span><strong>Built to today's codes.</strong> State law has the county or city ${h.ext(T6_9, "enforce the building codes")}: building, electrical, plumbing, gas, energy and fire. East of U.S.&nbsp;17, state law also has insurers ${h.ext(T38_73, "count the building code")}, the construction and roof tie-downs when they price wind coverage. Roof tie-downs are straps that hold the roof to the walls.</span></li>`
  + `<li><span><strong>Less flood risk, on average.</strong> About 1 in 20 new houses for sale is in a high-risk flood zone on the map of the Federal Emergency Management Agency (FEMA). Of all houses for sale, about ${PCT(FL.all_house.in_sfha, FL.all_house.in_horry)} in 100 are. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} covers wind and flood coverage.</span></li>`
  + `</ul>`;

const DECIDE = [
  { ic: "key", k: "You want to move in within a month", d: "Look at nearly new resales, houses built 2016 to 2023 and sold by their owners, and at new houses that are finished and never lived in." },
  { ic: "calendar", k: "You want to pick the plan and the finishes", d: "Choose a house the builder has not started. Plan on about 6 months of building, more on your own lot." },
  { ic: "dollar", k: "You are buying it to rent", d: `The county taxes a rental or second home on 6 percent of its value, not 4. It also adds the school tax a home you live in does not pay. Its yearly bill is more than three times as high. Our guide to ${h.a("/invest/new-construction-rentals/", "new construction as a rental")} has the rest.` },
  { ic: "home", k: "You want to be near the beach", d: `New houses are a small share of what is for sale near the ocean. Three of the ${h.a("#where", "ten busiest new communities")} are about 1 to 2 miles from it.` },
];
const DECIDE_HTML = `<ul class="c3-nc-dec" role="list" aria-label="Which kind of house fits your plans">`
  + DECIDE.map((w) => `<li><span class="c3-nc-ic" aria-hidden="true">${icon(w.ic, { size: 22 })}</span><span class="k">${w.k}</span><span class="d">${w.d}</span></li>`).join("") + "</ul>";

/* ---------------------------------------------------------------------------- */
/* Section 2: where (rows 4, 33) and who builds (rows 9, 10).                    */

const title = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
const ROAD = { "HWY 90": "Highway 90", "HWY 22": "Highway 22", "HWY 9": "Highway 9", "HWY 905": "Highway 905", "HWY 544": "Highway 544",
  "CAROLINA BAYS PKWY": "the Carolina Bays Parkway", "N KINGS HWY": "U.S. 17", "S HWY 17": "U.S. 17", "HWY 17 BYP": "the U.S. 17 Bypass",
  "SOCASTEE BLVD": "Socastee Boulevard", "ROBERT EDGE PKY": "Robert Edge Parkway" };
const CITY = { "NORTH MYRTLE BEACH": "North Myrtle Beach", "CONWAY": "Conway" };
/* Two roads for each, from the nearest numbered highways or parkways (row 33); "near", never "off". */
const ROADS = { "AUBERON WOODS": ["HWY 90"], "GRANDE DUNES NORTH": ["N KINGS HWY", "CAROLINA BAYS PKWY"], "ARCADIA": ["CAROLINA BAYS PKWY", "HWY 544"],
  "WATERSIDE NEIGHBORHOOD": ["HWY 22", "CAROLINA BAYS PKWY"], "INDIGO GROVE": ["HWY 90"], "CHESTNUT GREENS": ["S HWY 17", "ROBERT EDGE PKY"],
  "CYPRESS RIDGE": ["HWY 9"], "KINGSTON OAKS": ["HWY 22", "HWY 905"], "CRESCENT COVE": ["SOCASTEE BLVD", "HWY 17 BYP"], "EDEN SPRINGS": ["HWY 90", "HWY 22"] };
const miles = (m) => m < 1.5 ? "about 1&nbsp;mile" : `about ${Math.round(m)}&nbsp;miles`;
const BNAME = { "D.R. Horton": "D.R. Horton", "NVR (Ryan Homes)": "NVR (Ryan Homes)", "Clayton Properties": "Clayton Properties", Pulte: "Pulte", Lennar: "Lennar", Meritage: "Meritage" };
/* Review round 2 (owner: "a few sentences on what it gives a resident ... with the price as one clause"; ledger
   rows 38 and 39). sell: the name the builder sells under, where it differs from the county's plat name (each
   builder's sales or model address is a lot on that plat, raw/sales-office-plats.json). has: what the builder's
   own page lists, as it says it (raw/primary-quotes-round2.json), with "coming soon" and "future" kept. Arcadia,
   The Overlook and Cypress Ridge: no amenity list could be read, so the sentence is a fact from row 33. */
const SELL = { "GRANDE DUNES NORTH": "Grande Dunes North Village", "WATERSIDE NEIGHBORHOOD": "Waterside", "INDIGO GROVE": "The Overlook", "CHESTNUT GREENS": "Del Webb North Myrtle Beach" };
const HAS = {
  "AUBERON WOODS": "D.R. Horton's page says the pool and pickleball courts are open, and a basketball court, a fitness room and sidewalks are on the way.",
  "GRANDE DUNES NORTH": "A gated part of Grande Dunes with a staffed guardhouse. Ryan Homes' page says lawn care is included and residents have access to the Grande Dunes Ocean Club, the golf and the marina on the Intracoastal Waterway.",
  "ARCADIA": "The only one of the ten where three builders recorded sales in those 12 months.",
  "WATERSIDE NEIGHBORHOOD": "Meritage's page lists a swimming pool, a cabana, a dog park, a tennis court, a bocce court, a community garden, a tot lot and a boat dock.",
  "INDIGO GROVE": "With Kingston Oaks, also built by Lennar, it had the lowest typical price of the ten.",
  "CHESTNUT GREENS": "A 55+ community from Del Webb, Pulte's brand. Its page lists indoor and outdoor pools, an owner's clubhouse, a fitness center, sports courts and a lifestyle director.",
  "CYPRESS RIDGE": "Meritage builds here and at Waterside. Here, inland, buyers paid about $70,000 less for a typical house than at Waterside, near the beach.",
  "KINGSTON OAKS": "Lennar's page lists a pool, a picnic area, a playground and a barbecue area as future amenities, and places the community near downtown Conway and Coastal Carolina University.",
  "CRESCENT COVE": "On the Intracoastal Waterway near Socastee. Pulte's page lists a day dock, a pool and a playground as coming soon, and a planned boat ramp.",
  "EDEN SPRINGS": "D.R. Horton's page lists a pool and a pond, and says a community garden is planned.",
};
const LINKS = read("raw/community-links.json").links;
const COMM = CM.communities.map((c, i) => {
  const rds = ROADS[c.name];
  for (const r of rds) must(c.nearest_highways_miles.some(([n, mi]) => n === r && mi <= 2.5), `row 33 (${c.name} near ${r})`);
  const inCity = c.municipality[0][0] !== "unincorporated";
  must(c.municipality.length === 1, `row 33 (${c.name} all in or all out)`);
  must(LINKS[c.name] && LINKS[c.name].farthest_miles < 1, `row 39 (${c.name} link)`);
  const post = c.postal_city.find(([p]) => p !== "no address yet")[0];
  const big = c.builders.filter(([, v]) => v >= 20);
  const who = `Built by ${big.map(([b]) => BNAME[b]).join(", ").replace(/, ([^,]*)$/, " and $1")}`;
  /* Kingston Oaks: the nearest named highway is 2.3 miles off, so the card gives the distance, not "near". */
  const far = Math.min(...rds.map((r) => c.nearest_highways_miles.find(([n]) => n === r)[1])) > 1.5;
  const road = far ? `About ${Math.round(Math.min(...rds.map((r) => c.nearest_highways_miles.find(([n]) => n === r)[1])))}&nbsp;miles from ${ROAD[rds[0]].replace(/ (\d+)$/, "&nbsp;$1")}` : `Near ${ROAD[rds[0]].replace(/ (\d+)$/, "&nbsp;$1")}`;
  return {
    num: i + 1, key: c.name, name: SELL[c.name] || title(c.name), plat: SELL[c.name] ? title(c.name) : "", lat: c.mid[1], lon: c.mid[0], miles: c.ocean_miles,
    has: HAS[c.name],
    where: `${post} address, ${inCity ? `inside ${CITY[c.municipality[0][0]]} city limits` : "outside city limits"}. ${road}, ${miles(c.ocean_miles)} from the ocean.`,
    who: `${who}. Buyers paid a typical price of about ${money(near(c.median_price, 5000))}.`, inCity,
    href: "/homes/map/?" + ("type=house&" + LINKS[c.name].q).replace(/&/g, "&amp;"),
  };
});
{ const P = Object.fromEntries(CM.communities.map((c) => [c.name, c]));
  const low2 = CM.communities.slice().sort((a, b) => a.median_price - b.median_price).slice(0, 2).map((c) => c.name).sort().join();
  must(low2 === "INDIGO GROVE,KINGSTON OAKS" && near(P["INDIGO GROVE"].median_price, 5000) === 245000 && near(P["KINGSTON OAKS"].median_price, 5000) === 245000
    && P["INDIGO GROVE"].builders[0][0] === "Lennar" && P["KINGSTON OAKS"].builders[0][0] === "Lennar" && P["INDIGO GROVE"].nearest_highways_miles[0][1] === 0.4, "row 33 (Lennar, lowest two)");
  must(P["CYPRESS RIDGE"].builders[0][0] === "Meritage" && P["WATERSIDE NEIGHBORHOOD"].builders[0][0] === "Meritage" && near(P["CYPRESS RIDGE"].median_price, 5000) === 295000
    && near(P["WATERSIDE NEIGHBORHOOD"].median_price, 5000) === 365000 && near(P["WATERSIDE NEIGHBORHOOD"].median_price - P["CYPRESS RIDGE"].median_price, 5000) === 70000 && Math.round(P["WATERSIDE NEIGHBORHOOD"].ocean_miles) === 2, "row 33 (Meritage, two prices)");
  must(CM.communities.filter((c) => c.builders.filter(([, v]) => v >= 20).length === 3).map((c) => c.name).join() === "ARCADIA", "row 33 (three builders)"); }
function near10(v) { return Math.round(v / 10) * 10; }
const ARROW = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const COMM_HTML = `<div class="c3-nc-cm" role="list" aria-label="The ten communities where builders sold the most homes from October 2025 to September 2026">`
  + COMM.map((c) => `<div role="listitem" class="c3-nc-card"><b class="n" aria-hidden="true">${c.num}</b><div class="bd"><span class="nm">${c.name}</span>`
    + (c.plat ? `<span class="pl">County record: ${c.plat}</span>` : "")
    + `<p class="hs">${c.has}</p><p class="ln">${c.where}</p><p class="ln">${c.who}</p>`
    + `<a class="go" href="${c.href}">Homes for sale in ${c.name}${ARROW}</a></div></div>`).join("")
  + `</div>`
  + `<p class="c3-nc-note">Builders and prices: county deeds for the same 12 months; the price is what buyers paid the builder. Ocean miles are straight lines. What each community has: the builder's own page.</p>`;
const IN_CITY = COMM.filter((c) => c.inCity);
must(IN_CITY.map((c) => c.name).join(",") === "Grande Dunes North Village,Waterside,Del Webb North Myrtle Beach,Kingston Oaks", "row 33 (inside a city)");
const BEACH3 = COMM.filter((c) => c.miles < 2.5);
must(["INDIGO GROVE", "KINGSTON OAKS", "CYPRESS RIDGE"].every((x) => CM.communities.find((c) => c.name === x).median_price < 300000)
  && CM.communities.filter((c) => c.median_price < 300000).length === 3, "row 33 (three under $300,000, FAQ)");
must(BEACH3.length === 3, "row 33 (three near the beach)");

/* The dot map: every house for sale (raw/listings.json, sets all_house and new_house), drawn at about
   200 m a pixel and clipped to the county line (raw/horry-county-boundary.json, Census TIGERweb); no
   address, price or photo. A pin on the same pixel is drawn once. Numbered markers: the ten communities
   (row 33), each at the middle of its sold parcels, with a short leader where two sit close. */
const dotMap = () => {
  const { loadGeo2 } = require(path.join(BB, "tools", "area-map.js"));
  const geo = loadGeo2();
  const LI = read("raw/listings.json").sets;
  const newIds = new Set(Object.keys(LI.new_house.homes));
  const k = 560, cos = Math.cos(33.9 * Math.PI / 180), lon0 = -79.36, lat0 = 34.33;
  const X = (lon) => (lon - lon0) * cos * k, Y = (lat) => (lat0 - lat) * k;
  const W = 440, H = 430;
  const ring = read("raw/horry-county-boundary.json").features[0].geometry.rings[0].filter((_, i) => i % 2 === 0);
  const pts = (r) => r.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join("L");
  const sea = [...geo.coast, [-78.0, 33.75], [-78.0, 32.9], [-79.6, 32.9], [-79.6, 33.1]];
  const dots = (homes, keep) => {
    const seen = new Set(); let d = "";
    for (const [id, x] of Object.entries(homes)) {
      if (!keep(id) || !Number.isFinite(x.lat)) continue;
      const px = X(x.lng).toFixed(0), py = Y(x.lat).toFixed(0), key = px + "," + py;
      if (seen.has(key)) continue; seen.add(key); d += `M${px} ${py}h0`;
    }
    return d;
  };
  const FT = 'font-family="Inter,system-ui,sans-serif"';
  const HALO = 'paint-order="stroke" stroke="#fbf8f3" stroke-width="5" stroke-linejoin="round"';
  const T = Object.fromEntries(geo.towns.map((t) => [t.name, t]));
  const LAB = [["Loris", 12, 6, "start"], ["Longs", 12, 5, "start"], ["Aynor", 0, -14, "middle"], ["Conway", -12, 6, "end"],
    ["Little River", 10, 6, "start"], ["North Myrtle Beach", 16, 30, "start", ["North Myrtle", "Beach"]],
    ["Myrtle Beach", 12, 16, "start"], ["Surfside Beach", -14, 6, "end"]];
  const towns = LAB.map(([name, dx, dy, a, lines]) => {
    const t = T[name]; if (!t) throw new Error(`area-map towns: no ${name}`);
    const x = X(t.lon), y = Y(t.lat);
    const txt = (lines || [name]).map((l, i) => `<tspan x="${(x + dx).toFixed(1)}" dy="${i ? 20 : 0}">${l}</tspan>`).join("");
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#fff" stroke="#1c2028" stroke-width="2"/>`
      + `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${a}" ${FT} font-size="18" font-weight="600" fill="#1c2028" ${HALO}>${txt}</text>`;
  }).join("");
  /* Badge offsets in map units, set by eye so no two badges touch (checked in the shots at 390 and 1440). */
  /* Review round 2: the six near North Myrtle Beach and the two near Socastee spread apart, each with a leader to its point. */
  const OFF = { 1: [-10, 10], 2: [27, 15], 3: [-15, -10], 4: [-23, 15], 5: [-8, -24], 6: [-12, -22], 7: [-12, -10], 8: [0, 0], 9: [13, 13], 10: [-16, -17] };
  const badges = COMM.map((c) => {
    const x = X(c.lon), y = Y(c.lat), [dx, dy] = OFF[c.num], bx = x + dx, by = y + dy;
    return (dx || dy ? `<path d="M${x.toFixed(1)} ${y.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}" stroke="#1c2028" stroke-width="1.6"/>` : "")
      + `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#1c2028"/>`
      + `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="9.5" fill="#1c2028" stroke="#fff" stroke-width="1.8"/>`
      + `<text x="${bx.toFixed(1)}" y="${(by + 4.6).toFixed(1)}" text-anchor="middle" ${FT} font-size="${c.num > 9 ? 11 : 13}" font-weight="700" fill="#fff">${c.num}</text>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of Horry County with a dot for each house for sale. New houses, in orange, crowd around Conway, Longs, Loris and Aynor. Near the beach most dots are gray, older houses. Numbers 1 to 10 mark the communities where builders sold the most homes, most of them between Conway and North Myrtle Beach.">`
    + `<defs><clipPath id="c3-nc-frame"><rect width="${W}" height="${H}"/></clipPath><clipPath id="c3-nc-county"><path d="M${pts(ring)}Z"/></clipPath></defs><g clip-path="url(#c3-nc-frame)">`
    + `<rect width="${W}" height="${H}" fill="#e9e3d8"/>`
    + `<path d="M${pts(ring)}Z" fill="#fdfbf7" stroke="#5c6b78" stroke-width="1.6" stroke-linejoin="round"/>`
    + `<path d="M${pts(sea)}Z" fill="#d3e0e5"/>`
    + `<g clip-path="url(#c3-nc-county)">`
    + `<path d="${dots(LI.all_house.homes, (id) => !newIds.has(id))}" stroke="${C_OLD}" stroke-opacity=".5" stroke-width="4.4" stroke-linecap="round" fill="none"/>`
    + `<path d="${dots(LI.new_house.homes, () => true)}" stroke="${C_NEW}" stroke-opacity=".85" stroke-width="4.4" stroke-linecap="round" fill="none"/></g>`
    + `<text x="${W - 12}" y="${H - 12}" text-anchor="end" ${FT} font-size="17" font-style="italic" fill="#3f6275">Atlantic Ocean</text>`
    + towns + badges + `</g></svg>`;
  return `<figure class="c3-nc-map" style="margin:1.6rem 0 1.2rem;max-width:560px">${svg}`
    + `<div class="c3-nc-key" style="margin:.6rem .2rem .1rem" aria-hidden="true"><span><i style="background:${C_NEW};border-radius:50%;width:.8rem;height:.8rem"></i>New house for sale</span><span><i style="background:${C_OLD};border-radius:50%;width:.8rem;height:.8rem"></i>Any other house for sale</span><span><i style="background:${C_NAVY};border-radius:50%;width:.95rem;height:.95rem"></i>Community below</span></div>`
    + `<figcaption style="${FIGCAP}">Each dot is a house for sale now. The numbers are the ten communities below. Map: Chapter3 Realty, from MLS listings, county records and Census map lines.</figcaption></figure>`;
};

const SHARE_ROWS = SHARE.rows;
must(SHARE_ROWS.length === 10 && SHARE_ROWS[0].town === "Loris" && SHARE_ROWS[0].pct === 64 && SHARE_ROWS[9].pct === 4, "row 4");
const SHARE_CHART = G.bars(SHARE_ROWS.map((r) => ({ name: r.town, value: r.pct, valueText: `${r.pct}%` })),
  { caption: "Share of houses for sale that are new, by town", nameLabel: "Town", valueLabel: "share new", max: 100, compact: true, phoneList: true,
    note: "Houses for sale in Horry County, grouped by the town in the address. Towns with 30 or more houses for sale." });

const BUILDER_CHART = G.bars(TOP5.map(([k, name]) => ({ name, value: BY[k], valueText: `${n(BY[k])} sales` }))
  .concat([{ name: "Every other builder", value: D.builder_sales - TOP5_SUM, valueText: `${n(D.builder_sales - TOP5_SUM)} sales`, reference: true }]),
  { caption: "Homes sold by builders in Horry County in the past year, by builder", nameLabel: "Builder", valueLabel: "sales recorded", format: (v) => n(v), compact: true,
    note: "Sales recorded in the county's deed records, October 2025 to September 2026." });

/* ---------------------------------------------------------------------------- */
/* Section 3: what a new house costs (rows 3, 34).                               */

const bandName = ({ band: [lo, hi] }) => lo === 0 ? `${money(hi)} or less` : hi > 5e6 ? `Over ${money(lo - 1)}` : `${money(lo - 1)} to ${money(hi)}`;
const PRICE_CHART = G.bars(BANDS.map((b) => ({ name: bandName(b), value: b.count, valueText: `${n(b.count)} houses` })),
  { caption: "New houses for sale in Horry County, by asking price", nameLabel: "Asking price", valueLabel: "houses for sale", format: (v) => n(v), compact: true });

/* ---------------------------------------------------------------------------- */
/* Section 4: the tax bill (rows 23 to 28, 33, 36).                              */

const MON = D.builder_imp0_by_month;
must(MON.length === 12 && MON[0].month === "2025-10" && MON[11].month === "2026-09" && MON[11].sales === 456 && MON[11].no_building_value === 435, "row 24 (months)");
const CMAX = Math.max(...MON.map((m) => m.sales));
const ABBR = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const TAX_CHART = `<figure class="c3-nc-fig" role="group" aria-label="Homes builders sold in Horry County each month from October 2025 to September 2026, and how many the county still taxes as a lot. None sold in late 2025; most sold in 2026.">`
  + `<span class="c3-nc-cap">Homes builders sold each month, and how many the county still taxes as a lot</span>`
  + `<div class="c3-nc-key" aria-hidden="true"><span><i style="background:${C_NEW}"></i>Still taxed as a lot</span><span><i style="background:${C_OLD}"></i>House value on the tax roll</span></div>`
  + `<div class="c3-nc-cols" aria-hidden="true">` + MON.map((m) => {
    const lot = m.no_building_value, val = m.sales - lot;
    return `<span title="${m.month}: ${lot} of ${m.sales}"><i style="height:${(val / CMAX * 100).toFixed(1)}%;background:${C_OLD}"></i><i style="height:${(lot / CMAX * 100).toFixed(1)}%;background:${C_NEW}"></i></span>`;
  }).join("") + `</div>`
  + `<div class="c3-nc-mo" aria-hidden="true">${MON.map((m) => `<span>${ABBR[+m.month.slice(5) - 1]}</span>`).join("")}</div>`
  + `<div class="c3-nc-yr" aria-hidden="true"><span>2025</span><span>2026</span></div>`
  + `<figcaption style="${FIGCAP}">For about 4 in 5 of the 2026 sales in the chart, the county record still shows the lot only, so the 2026 bill is on the lot. Every 2025 sale in the chart has its house value.</figcaption></figure>`;

const TAX_TABLE = h.p(`Take a typical 2026 builder sale that the county still taxes as a lot. It sold for ${money(LAND.median_price_of_those_deeds)}, and the county values the lot at ${money(LAND.median_market_land)}. A home you live in is taxed on 4 percent of its value once you apply; a second home or rental on 6 percent. Outside city limits, the yearly county tax looks like this:`)
  + h.table(["Kind of home", "Lot only", "Once valued"], [
    ["Home you live in, 4 percent", `About ${money(near(T_LOT4, 10))}`, `About ${money(near(T_HOUSE4, 10))}`],
    ["Second home or rental, 6 percent", `About ${money(near(T_LOT6, 10))}`, `About ${money(near(T_HOUSE6, 10))}`],
  ])
  + h.p(`Inside a city, the city's own tax is added, so the bill is higher. Of the ten communities above, ${IN_CITY.slice(0, 3).map((c) => c.name).join(", ").replace(/, ([^,]*)$/, " and $1")} are inside North Myrtle Beach and ${IN_CITY[3].name} is inside Conway. Our ${h.a("/buyers/property-taxes/", "property tax guide")} has each city's rate.`);

/* ---------------------------------------------------------------------------- */
/* Section 5: your own agent (row 18; live page service lines).                  */

const AGENT_CHECK = `<ul class="c3-nc-check" role="list" aria-label="What a Chapter3 agent does on a new build">`
  + `<li><span><strong>Comes to your first visit.</strong> We register with the builder as your agent from the start.</span></li>`
  + `<li><span><strong>Reads the contract and the incentives.</strong> The contract is the builder's own, and we go through it with you before you sign.</span></li>`
  + `<li><span><strong>Prices the house against its neighbors.</strong> We compare it with the nearly new houses for sale within a mile.</span></li>`
  + `<li><span><strong>Works out the tax bill.</strong> You see the bill on the finished house before you sign.</span></li>`
  + `<li><span><strong>Arranges three inspections.</strong> Before the drywall, before closing and in month&nbsp;11.</span></li>`
  + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* Section 7: how long it takes (rows 11, 17).                                   */

/* The aerial (data/2026-10-d/buyers-new-construction/photos.json): new houses in the City of Myrtle Beach at every
   stage, a U.S. government photo in the public domain. Final fix: the lead asked for a free-licence photo of a new
   house in the area, or none. No ground photo with a free licence exists on Commons or Openverse (searched
   2026-11-03), and critic.mjs blocks a guide with no photo, so this public-domain photo of new houses stays
   until the photo partner's shots arrive (shot-list.md). */
const P = require(path.join(BB, "tools", "photos.js"));
const PHOTO = read("photos.json").photos[0];
P.checkRecord(PHOTO);
const AERIAL = `<figure class="c3-nc-fig c3-nc-photo" style="max-width:760px">`
  + `<img src="/${PHOTO.variants["1200"]}" srcset="/${PHOTO.variants["600"]} 600w, /${PHOTO.variants["1200"]} 1200w" sizes="(max-width: 800px) 100vw, 760px" width="${PHOTO.width}" height="${PHOTO.height}" loading="lazy" decoding="async" alt="${PHOTO.alt}" style="display:block;width:100%;height:auto;border-radius:14px">`
  + `<ol class="c3-nc-key c3-nc-num" aria-label="What the numbers mark">`
  + ["A bare lot. The county taxes it as land until it values the house.", "A new concrete slab, outlined, the first step of the house.", "A house in open framing, before the drywall.", "Finished houses."].map((t) => `<li>${t}</li>`).join("")
  + `</ol><figcaption style="${FIGCAP}">New streets in the City of Myrtle Beach from above. Photo: USDA Farm Service Agency, NAIP, public domain. Numbers by Chapter3 Realty.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* Section 8: the three inspections. The drawing stands in for the photo partner's shot. */

const WALL = (() => {
  const FT = 'font-family="Inter,system-ui,sans-serif"';
  const studs = [70, 190, 310, 430, 550].map((x) => `<rect x="${x}" y="40" width="22" height="250" fill="#e2c49a" stroke="#b8925f" stroke-width="2"/>`).join("");
  const lab = (x, y, tx, ty, t, a = "start") => `<path d="M${x} ${y}L${tx} ${ty}" stroke="#1c2028" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#1c2028"/>`
    + `<text x="${tx + (a === "end" ? -6 : 6)}" y="${ty + 8}" text-anchor="${a}" ${FT} font-size="26" font-weight="600" fill="#1c2028" paint-order="stroke" stroke="#fbf8f3" stroke-width="6" stroke-linejoin="round">${t}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 330" role="img" aria-label="Drawing of a wall before the drywall goes up: wooden studs, an electrical cable running through them to an outlet box, and two water pipes running up between the studs.">`
    + `<rect width="640" height="330" rx="18" fill="#f3ede4"/>`
    + `<rect x="40" y="290" width="560" height="18" fill="#cfae7f" stroke="#b8925f" stroke-width="2"/><rect x="40" y="22" width="560" height="18" fill="#cfae7f" stroke="#b8925f" stroke-width="2"/>`
    + studs
    + `<path d="M40 170 C120 168 160 172 214 170 S300 172 330 176" fill="none" stroke="#e0b100" stroke-width="7" stroke-linecap="round"/>`
    + `<rect x="330" y="160" width="34" height="46" rx="4" fill="#3d6fb5" stroke="#284d82" stroke-width="2"/>`
    + `<path d="M480 290 V60" stroke="#c0392b" stroke-width="9" stroke-linecap="round"/><path d="M504 290 V60" stroke="#2f6fb1" stroke-width="9" stroke-linecap="round"/>`
    + lab(124, 80, 150, 70, "Framing")
    + lab(258, 172, 236, 238, "Wiring", "end")
    + lab(492, 120, 400, 112, "Pipes", "end")
    + `</svg>`;
})();
const WALL_FIG = `<figure class="c3-nc-draw" style="margin:1.4rem 0 1.4rem;max-width:560px">${WALL}<figcaption style="${FIGCAP}">Before the drywall goes up, the framing, the wiring and the pipes are open to see. Drawing: Chapter3 Realty.</figcaption></figure>`;

const STEPS = `<ol class="c3-nc-steps" aria-label="The three inspections on a new house">`
  + `<li><strong>Before the drywall goes up.</strong>The inspector sees the framing, the wiring and the pipes while the walls are open. Once the drywall is up, a problem inside a wall is hidden.</li>`
  + `<li><strong>Before closing.</strong>What is still wrong goes on a written list for the builder, while you can still ask for fixes before you close.</li>`
  + `<li><strong>In month&nbsp;11.</strong>Book it before the one-year part of the warranty ends. It finds what to report while the builder still pays for the fix. We see many builders here also send a maintenance person once in the first year to fix defects and touch up paint.</li>`
  + `</ol>`;

/* ---------------------------------------------------------------------------- */
/* Section 9: the warranty and the law (rows 12 to 15).                          */

const tlRow = (label, years, color, mark) => `<div class="r"><div class="l"><span>${label}</span><b>${years} ${years === 1 ? "year" : "years"}</b></div>`
  + `<div class="trk">${mark ? `<u style="left:${years * 10}%"></u>` : `<i style="width:${years * 10}%;background:${color}"></i>`}</div></div>`;
const TIMELINE = `<figure class="c3-nc-fig c3-nc-tl" role="group" aria-label="After closing: the largest builder's warranty is 1 year on most of the house, 2 years on major mechanical systems and 10 years on major structure. South Carolina's outer limit for most defect claims is 8 years after the house is finished.">`
  + `<span class="c3-nc-cap">After closing: the largest builder's warranty, and the state's outer limit</span>`
  + tlRow("Most of the house", 1, C_NEW) + tlRow("Major mechanical systems", 2, C_NEW) + tlRow("Major structure", 10, C_NEW)
  + tlRow("Outer limit for most defect claims", 8, C_NAVY, true)
  + `<div class="c3-nc-ax" aria-hidden="true"><span style="left:0">Closing</span><span style="left:50%">5 years</span><span style="left:100%">10 years</span></div>`
  + `<figcaption style="${FIGCAP}">Warranty: D.R. Horton's, from its annual report. Law: the 8 years run from when the house is substantially complete.</figcaption></figure>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "New Construction in Myrtle Beach: What the Price Leaves Out",
  description: "New construction in Myrtle Beach lists for about $370,000. The price leaves out lot premiums, options, HOA charges, closing costs and the full tax bill.",
  ogTitle: "New construction in Myrtle Beach: where builders build, what it costs, and the tax bill the sign leaves out",
  crumb: "New Construction",
  eyebrow: "Buying a new build on the Grand Strand",
  h1: "New construction in Myrtle Beach:",
  h1em: "what the price on the sign leaves out.",
  sub: "New construction in Horry County costs about what a nearly new house does. The sign leaves out lot premiums, options, HOA charges, closing costs and the full tax bill.",
  heroCta: { title: "Touring model homes? Bring your own agent to the first visit.", label: "Set up my builder tour", href: CONTACT },
  author: "devin",
  shortAnswer: [
    `A new house here lists for about the same price per square foot as a house built 2016 to 2023 of similar size nearby. A typical new house for sale is listed at about ${money(MID_NEW)}. Most are built inland, in large communities near Highway 90, Highway 22 and the Carolina Bays Parkway.`,
    `The sign leaves out the full tax bill, closing costs, HOA charges, options you pick and lot premiums, extra charges for a particular lot. For about 4 in 5 of the 2026 builder sales, the county still taxes only the lot. On a typical home you live in outside city limits, the yearly county bill goes from about ${money(near(T_LOT4, 10))} to about ${money(near(T_HOUSE4, 10))} once the county values the house.`,
  ],
  sections: [
    { h2: "Is new construction worth it, or should you buy a nearly new house?", toc: "New or nearly new", id: "new-or-nearly-new", html: () =>
      CSS +
      h.p(`The price per square foot, the price divided by the floor space, will not decide it for you. Next to a house built 2016 to 2023 of similar size within a mile, about half of new houses list for less per square foot and half for more. Town by town, the typical prices are close too.`) +
      PAIR_CHART +
      h.p(`The lot is about the same size too. In Conway, Longs and Myrtle Beach addresses, a new house has about the same size lot as a house built 2016 to 2023 in the same town.`) +
      h.h3("What does a new house give you?") +
      GIVES +
      h.p("Pick by your plans:") +
      DECIDE_HTML },

    { h2: "Where are new homes being built around Myrtle Beach?", toc: "Where", id: "where", html: (bg) =>
      h.p(`Mostly inland, in large planned communities between Conway and North Myrtle Beach. These ten recorded the most builder sales in Horry County in the 12 months to September 2026.`) +
      dotMap() +
      COMM_HTML +
      h.cta("Want to see one of these ten?", "Tell us the ones you like. We set up the visits and register with the builder as your agent.", "Have us set up the visits", CONTACT, bg) +
      h.p(`By town, new houses are more than half of the houses for sale in Loris, Longs, Aynor, Conway and Galivants Ferry addresses. Near the ocean they are a small share.`) +
      SHARE_CHART +
      h.p(`Our page on ${h.a("/invest/what-is-being-built/", "what is being built")} covers the permits, the new roads and the hospitals.`) +
      h.h3("Who builds new homes here?") +
      h.p(`Builders sold more than 1 in 4 homes recorded in Horry County in those 12 months. Five builders recorded about 7 in 10 of those sales.`) +
      BUILDER_CHART },

    { h2: "What does a new house cost in Myrtle Beach?", toc: "Cost", id: "cost", html: () =>
      h.p(`A typical new house for sale in Horry County is listed at about ${money(MID_NEW)}, with about ${n(near(NH.median_sqft, 100))} square feet on just under a quarter acre. Half are listed for more, half for less. That is an asking price; the tax example below uses what buyers paid.`) +
      PRICE_CHART +
      h.p(`Most new houses come with an HOA fee. About 1 in 5 new houses for sale has none. For about 3 in 4, the fee is $100 a month or less, or there is none. Our guide to ${h.a("/buyers/no-hoa-homes/", "homes with no HOA")} lists the areas where most homes have none, and our guide to the ${h.a("/buyers/affordable-places-to-live/", "most affordable places to live")} covers the lowest prices.`) },

    { h2: "What does the price of a new house leave out?", toc: "What the price leaves out", id: "tax-bill", html: (bg) =>
      h.p(`Five things: the full property tax, lot premiums, options and upgrades, HOA charges and closing costs. First the tax. A South Carolina ${h.ext(T12_37, "tax year looks back")} to December 31 of the year before. A house finished after that date, or still unsold in the builder's hands, is usually not in that year's bill. Your first bill is often for the lot alone.`) +
      TAX_CHART +
      h.p(`When the county does value the house, it values it at about what you paid.`) +
      TAX_TABLE +
      h.h3("Will the county bill you for the months before?") +
      h.p(`Not for the months before the house stood on a December 31. The tax year looks back to that date, so the house tax starts with the next year's bill. If a house that was standing is left off the tax roll, the county may ${h.ext(T12_39, "bill the missed years")}. It can go back no more than three years, and never to a year before the house was built.`) +
      `<ul class="c3-nc-check" role="list" aria-label="Two things to plan for with the tax bill on a new house">`
      + `<li><span><strong>Apply for the 4 percent assessment.</strong> Without it, the county taxes your home like a second home, at 6 percent. Apply to the Horry County Assessor by January 15 of the year after you move in, before the ${h.ext(TREAS, "first penalty date")}. It ${h.ext(T12_43, "covers the whole year")} if the house is the home you live in for any part of it. Overpaid tax can be refunded.</span></li>`
      + `<li><span><strong>Plan for a higher monthly payment later.</strong> If your lender collects the taxes with your loan, the tax part of the payment may go up once the house is valued. The lender's ${h.ext(REGX, "yearly escrow review")} finds the difference.</span></li></ul>` +
      h.h3("Lot premiums, options and upgrades") +
      h.p(`The price on the sign is for the base house. Pulte's pages for its communities here say the price ${h.ext(PULTE_CC, "may not include")} lot premiums, upgrades and options. A lot premium is an extra charge for a particular lot. Pulte's ${h.ext(PHM, "annual report")} names flooring, countertops, fixtures and appliances among its options.`) +
      h.p(`Toll Brothers, which recorded 97 of the builder sales here, gives a national figure in its ${h.ext(TOL, "annual report")}. Its buyers' options and lot premiums came to about a quarter of the base price in its 2025 fiscal year. Its spec homes have less to add, it says.`) +
      h.h3("Deposits") +
      h.p(`D.R. Horton, the builder with the most sales here, says in its ${h.ext(DHI, "annual report")} that its contracts take an earnest money deposit, and more deposits if you pick options or upgrades. If a contract is cancelled, the deposit is kept or refunded under the contract's terms. Our page on ${h.a("/buyers/new-construction/builders/", "the new home builders in Myrtle Beach")} ranks them by homes sold.`) +
      h.p(`The ${h.ext(CFPB_HOME, "deposit terms")} matter before you sign.`) +
      h.h3("HOA charges and closing costs") +
      h.p(`Closing costs come on top of the price. The federal Consumer Financial Protection Bureau (CFPB) says the buyer ${h.ext(CFPB_CC, "generally pays them")}.`) +
      `<ul class="c3-nc-check" role="list" aria-label="Closing costs and HOA charges on a new house">`
      + `<li><span><strong>What they include.</strong> The appraisal, title insurance, government taxes, and property taxes and homeowners insurance paid ahead.</span></li>`
      + `<li><span><strong>Help from the builder.</strong> Meritage, which recorded 334 sales here, says in its ${h.ext(MTH, "annual report")} that it may pay part of the closing costs for buyers who use its preferred lenders. A seller will usually want a higher price to cover a credit, the CFPB says.</span></li>`
      + `<li><span><strong>HOA charges.</strong> A new community's HOA can also charge at closing. Pulte's pages here list community association fees as a possible extra. If you take out a mortgage, any HOA charge paid at closing is listed on your ${h.ext(REGZ38, "Closing Disclosure")}. Ask the builder for the HOA's fees before you sign.</span></li></ul>` +
      h.cta("Before you sign: the options and the deposit", "Tell us the house and the options you like. We go through the deposit terms with you and what each option adds to the price.", "Have us compare them", CONTACT, bg) },

    { h2: "Do you need a realtor for new construction?", toc: "Your own agent", id: "your-agent", html: () =>
      h.p(`You can buy without one, but the salesperson in the model home works for the builder. Your own agent works for you. Nationwide, most of D.R. Horton's closings involve an independent real estate broker, its annual report says.`) +
      h.p(`Since 2024, an agent asks you to sign a ${h.ext(NAR, "written agreement")} before you tour a home together. It states what the agent is paid, and that amount is fully negotiable. A builder, like any seller, can still offer to pay your agent. We confirm in writing what, if anything, you would pay before you tour.`) +
      h.h3("Why does the first visit matter?") +
      h.p(`Each builder writes its own terms for paying a buyer's agent. Under D.R. Horton's ${h.ext(DHI_FL, "terms on its Florida listings")}, for example, the builder pays a buyer's agent only if the agent registers you on or before your first visit. You must also not have signed up on its website or talked with its sales agent first.`) +
      h.p(`Tell us before you sign up online or walk into a model home, and we register with the builder as your agent from the start.`) +
      AGENT_CHECK },

    { h2: "Can you negotiate with a builder, and should you use the builder's lender?", toc: "Incentives and lenders", id: "incentives", html: (bg) =>
      h.p("Yes, you can negotiate. We see most builders here offer incentives to buyers with an FHA, VA or conventional loan. Incentives for investors, whose loans are based on the rent the home brings in, are rare.") +
      h.p(`Some promotions come with the builder's own lender. Lennar's ${h.ext(LEN_KO, "Kingston Oaks page")} offers promotions when you finance through Lennar Mortgage, and nationwide, D.R. Horton's mortgage subsidiary financed 81 percent of the homes it closed in its 2025 fiscal year. You never ${h.ext(CFPB_HOME, "have to use the builder's lender")}.`) +
      h.p(`The way to judge the offer is ${h.ext(CFPB_LE, "full Loan Estimates")} from more than one lender, side by side. A Loan Estimate is the form that lists a loan's costs. Any lender can run that comparison for you, including our preferred lender.`) +
      h.cta("What will the builder offer you?", "Tell us the community and the kind of loan you plan to use. We ask the builder which incentives it offers you, before you sign.", "Ask us about incentives", CONTACT, bg) },

    { h2: "Spec home or to-be-built: how long does a new house take?", toc: "How long it takes", id: "how-long", html: () =>
      h.p(`A spec home, one the builder starts before it has a buyer, is often finished and ready now. Of the new houses for sale in the MLS feed, almost half are finished and never lived in. The rest are still being built.`) +
      h.p(`A house the builder has not started takes months. ${h.ext(SOC, "In the South")}, a builder's house took about 5 and a half months from start to finish in the 2025 figures. A house a contractor builds on your own lot took about 9 months.`) +
      AERIAL },

    { h2: "What inspections does a new house need?", toc: "Inspections", id: "inspections", html: (bg) =>
      h.p("Three of your own: before the drywall, before closing and before the first year of the warranty ends. Each comes at the last point a problem is easy to see, or still the builder's to fix. The county or city also inspects, for the building code. Your own inspector works for you.") +
      WALL_FIG +
      STEPS +
      h.p("We set up all three, ask the builder for the warranty booklet, and keep a list of what each one finds, so the builder has it in writing.") +
      h.cta("Your three inspections, booked for you", "When you buy with us, we book all three inspections and keep each list until the builder answers every item.", "Have us book inspections", CONTACT, bg) },

    { h2: "What can you do when something is wrong with a new house?", toc: "Warranty and the law", id: "warranty-law", html: () =>
      h.p(`Report it to the builder in writing, under the warranty. D.R. Horton ${h.ext(DHI, "gives 1 year")} on most of the house, 2 years on major mechanical systems and 10 years on major structure. Other builders differ, and the written warranty states the terms.`) +
      TIMELINE +
      h.p(`The warranty says what the builder will fix. The state law says how long you have to sue. Most lawsuits over defects must be filed within 8 years of the house being finished. Inside that, most claims ${h.ext(T15_3, "must be filed within three years")}.`) +
      h.p(`If the builder will not fix it, under South Carolina's ${h.ext(T40_59, "defect law")} you send the builder written notice, and the builder may inspect and offer a repair before you can sue. We keep track of your warranty deadlines after closing.`) },
  ],
  faqTitle: "New construction questions",
  faq: [
    { q: "Can I find a new house in Myrtle Beach under $300,000?", a: `Yes. About 1 in 5 new houses for sale in Horry County is listed at $300,000 or less. Of the ten communities where builders sold the most, The Overlook (Indigo Grove), Kingston Oaks and Cypress Ridge had typical sale prices under $300,000.` },
    { q: "Are there new townhomes in Myrtle Beach?", a: `Yes. ${n(NT.count)} new townhouses are for sale in Horry County, at a typical list price of about ${money(near(NT.median_price, 5000))} for about ${n(near(NT.median_sqft, 10))} square feet.` },
    { q: "How does the county know a new house is being built?", a: "From the building permit. South Carolina law has every county require a permit for new construction. The county must send the assessor a copy of each building permit within 10 days, so the assessor knows a house is being built." },
    { q: "Does a home builder in South Carolina need a license?", a: "Yes. A residential builder needs a state license for any job over $5,000, issued by the Residential Builders Commission. A complaint against a builder goes to the Commission in writing and sworn." },
  ],
  sources: [
    { name: "County deeds", href: DEEDS },
    { name: "County GIS", href: GIS },
    { name: "Flood zones", href: FLOOD },
    { name: "2026 tax levy", href: LEVY },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "SC Code 38-73", href: T38_73 },
    { name: "SC Code 40-59", href: T40_59 },
    { name: "SC Code 15-3", href: T15_3 },
    { name: "SC builders board", href: LLR },
    { name: "Census", href: SOC },
    { name: "NAR", href: NAR },
    { name: "12 CFR 1024.17", href: REGX },
    { name: "D.R. Horton 10-K", href: DHI },
    { name: "SC Code 6-9", href: T6_9 },
    { name: "SC Code 12-39", href: T12_39 },
    { name: "CFPB", href: CFPB_HOME },
    { name: "Lennar", href: LEN_KO },
    { name: "D.R. Horton terms", href: DHI_FL },
    { name: "Pulte", href: PULTE_CC },
    { name: "Reg Z", href: REGZ38 },
  ],
  afterSources: () => P.creditsList([{ photo: PHOTO, caption: "New streets in the City of Myrtle Beach from above, April 2023" }])
    /* The helper's closing line is written for several photos; this page has one, and its credit already says what changed (NEEDS.md item 8). */
    .replace(/<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.<\/div>/, ""),
  sourcesNote: "Homes for sale: our count of MLS listings, in aggregate. Sales: county deeds, October 2025 to September 2026. Not legal or tax advice.",
  bottomCta: { h2: "What will a new house cost you once it is taxed?", p: "Tell us the communities you like. We price each house against the nearly new houses around it, work out its tax bill once it is valued, and set up the inspections.", label: "Have us price a new build", href: CONTACT },
  keywords: "new construction Myrtle Beach, new home communities Myrtle Beach, new construction vs resale, is new construction worth it, new homes Myrtle Beach, new construction Conway SC, new construction Longs SC, do I need a realtor for new construction, builder incentives, new construction inspection, South Carolina new home warranty, new construction HOA fees, new construction property tax Horry County",
  about: "Buying a newly built house in Myrtle Beach and Horry County, South Carolina",
});
