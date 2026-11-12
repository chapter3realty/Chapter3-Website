/* /invest/str-vs-ltr/ - Airbnb or a yearly lease for one Myrtle Beach home: the same two-bedroom priced
 * both ways, the nights an Airbnb needs to match the lease, the winter months, and whether the home may
 * be rented by the night at all.
 *
 * Batch 2026-10-d, Lane U. Version 3 (review round 2), 2026-11-01. The live page was hand-made; this
 * spec replaces it. Round 1 (REVIEW-1.md): the two-bedroom open all year (facts row 32), the top-quarter
 * listing named "any size", one pros-and-cons block, furnishing and insurance (row 33). Round 2
 * (REVIEW-2.md): the owner is the actor (no lease or night "keeps"), the short answer is one answer with
 * one number each way, "both" is out of the oceanfront line (row 25), Airbnb collects the state and county
 * taxes (row 21), the jobs section is cut, the manager's lower bound (row 35) and a manager box in the
 * calculator, open days (row 34), Carolina Forest's county zoning (row 36), the federal seven-day rule
 * (row 37), the story is an example beside the top-quarter figure with the bank's label.
 * Final fix, 2026-11-03 (REVIEW-FINAL.md): market figures read from data/str-market.json (its 2026-11-03
 * refresh) with a check against findings.json; the oceanfront line is our count, 402 of 422, inside city
 * limits; the lodging tax line rests on S.C. Code 12-36-920 and SCDOR ST-575 (row 39), not a 13 percent
 * total; no "Here is"; the /contact/ buttons read as requests.
 * Facts: Blog-Brain batches/2026-10-d/invest-str-vs-ltr/facts.md, VERIFIED and CORRECTED rows only, at
 * the verifier's wording (VERIFY.md). Struck wording: invest-str-vs-ltr-struck.json. Held, so not on the
 * page: the conversion overlay's rule text (row 18, only its ordinance number), the manager break-even
 * (row 16, until owner question 1), the worked condo's HOA fee (row 26), "the lease uses the signed rent"
 * (row 29).
 * Every figure is read from data/2026-10-d/invest-str-vs-ltr/findings.json (compute.py over the raw
 * AirROI, HUD, BLS, Census, county and CRM files in that folder), never typed. The checks below stop the
 * build if the file and the sentences part ways.
 * Kept from the live page: the H1's first line and the title's first half (data/headlines.json, the
 * owner liked them), the links to the rental analyzer, the STR atlas and the Airbnb income report, the
 * snowbird middle path (now with the 90-day line), the offer to run an address both ways, the phone
 * line and "We answer evenings". New: the break-even calculator, the month chart, the count of homes
 * for sale by what the listing allows, the jobs chart.
 * Removed: the hero tiles, "2-3x the Gross", the unsourced expense ratios, "most purchases are DSCR",
 * the FAQ paragraph that called nightly rentals safer, the old listing-search sentence (SWEEP).
 * Photos: data/2026-10-d/invest-str-vs-ltr/photos.json (Commons CC BY-SA 4.0; the public-domain
 * Conway photo was cut in round 1).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, prosCons, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const DATA = path.join(__dirname, "..", "data", "2026-10-d", "invest-str-vs-ltr");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json");
const PH = PK.create({ h, photos: read("photos.json").photos }).photoSet({ aerialWidth: "760px" });

/* Final fix (2026-11-03): the site's one source for short-term rental figures is data/str-market.json,
   refreshed 2026-11-03 to AirROI's 12 months to September 2026 (revenue includes guests' cleaning fees).
   The market figures on this page are read from it; the size table, open days and month detail are not
   in it, so they come from the same AirROI update as read in findings.json, and the build stops if the
   two files ever disagree. The change since August is never shown. */
const STR = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "str-market.json"), "utf8"));
const SM = STR.markets.find((m) => m.slug === "myrtle-beach"), SCO = STR.markets.find((m) => m.slug === "conway");
const C = F.cases.mb_2br_condo, CW = F.cases.conway_3br_house, MB = F.airroi["myrtle-beach"], CO = F.airroi.conway;
const must0 = (ok, what) => { if (!ok) throw new Error(`str-vs-ltr.js: ${what}`); };
must0(STR.retrieved >= "2026-11-03" && STR.dataAsOf === "2026-10-01", "str-market.json is not the 2026-11-03 refresh: re-check every AirROI figure on this page");
must0(SM.revenue === MB.avg_annual_gross && SM.adr === MB.adr && SM.occupancy === MB.occupancy_pct && SM.listings === MB.active_listings
  && SM.median === MB.median_month_gross_active && SM.peakMonth === "July" && SM.peakRevenue === MB.month_avg_gross.July
  && SM.lowMonth === "January" && SM.lowRevenue === MB.month_avg_gross.January, "str-market.json and the AirROI read in findings.json disagree (Myrtle Beach)");
must0(SCO.revenue === CO.avg_annual_gross && SCO.listings === CO.active_listings, "str-market.json and findings.json disagree (Conway)");
const L = F.listings, BLS = F.bls;
const EX = F.listing_examples["2br_oceanfront_condo_mb_city_str_allowed"], TAXC = F.mb_condo_tax_6pct;

/* Checks: the sentences below rest on these values (ledger rows). */
const must = (ok, what) => { if (!ok) throw new Error(`str-vs-ltr.js: ${what}`); };
must(C.yearly.kept === 15254 && C.yearly.gross === 18048 && C.yearly.fmr_month === 1504, "row 13: the lease side");
must(C.nightly.size_median_gross === 20100 && C.nightly.size_median_kept === 12400 && C.nightly.size_adr === 252, "rows 2, 14: the middle two-bedroom");
must(C.nightly.market_top_quarter_gross === 44250 && C.nightly.market_top_quarter_kept === 27690, "row 3: the top-quarter mark");
must(C.gap_median_minus_yearly === -2854 && C.gap_topq_minus_yearly === 12436, "row 14: the gaps");
must(C.break_even.nights === 82 && C.break_even.share_of_year_pct === 22 && F.checkouts.break_even === 17, "row 16: the self-run break-even");
must(Math.round(C.break_even.per_booked_night_kept) === 192 && C.break_even.fixed_costs === 390, "row 16: per night and fixed costs");
must(MB.avg_stay_nights === 4.7 && MB.bookings_per_listing_year === 19 && MB.median_occ_pct === 34 && MB.top_quarter_occ_pct === 56, "rows 5, 6");
must(Math.round(F.mb_booked_or_blocked_90_or_fewer_pct) === 56 || Math.floor(F.mb_booked_or_blocked_90_or_fewer_pct) === 56, "row 5: 56 percent");
must(F.mb_summer_share_pct === 47 && F.mb_months_below_lease.join() === "January,February,November,December", "row 4: the months");
must(CW.nightly.size_median_kept === 17400 && CW.yearly.kept === 18883 && CO.active_listings === 106, "row 14: Conway");
must(L.condo_mb_city_oceanfront_building.total === 422 && L.condo_mb_city_oceanfront_building.str_allowed === 402, "row 25: oceanfront condos");
must(L.house_carolina_forest.total === 294 && L.house_carolina_forest.str_allowed === 1 && L.house_conway.str_allowed === 34, "row 25: houses");
must(EX.n === 48 && EX.price_median === 327000 && TAXC.tax === 4995 && TAXC.mills === 254.6, "row 26: the worked condo");
must(F.vacancy_sc["2026Q3"] === 11.2 && F.vacancy_sc["2026Q2"] === 12.3, "row 12: vacancy");

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r100 = (v) => "$" + (Math.round(v / 100) * 100).toLocaleString("en-US");
const r50 = (v) => "$" + (Math.round(v / 50) * 50).toLocaleString("en-US");
const n = (v) => Math.round(v).toLocaleString("en-US");
const jobs = (k) => n(k * 1000);

/* One value per figure on the page (critic, round 1): every kept figure is rounded to $100, in the
   chart, the prose and the calculator alike, and each gap is the gap between the printed figures. */
const LEASE_KEPT = r100(C.yearly.kept);                      // $15,300
const MID_GROSS = money(C.nightly.size_median_gross);        // $20,100
const MID_KEPT = r100(C.nightly.size_median_kept);           // $12,400
const TOPQ_KEPT = r100(C.nightly.market_top_quarter_kept);   // $27,700
const r1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
const R100 = (v) => Math.round(v / 100) * 100;
const GAP_MID = r1k(R100(C.yearly.kept) - R100(C.nightly.size_median_kept));          // $3,000 (15,300 - 12,400)
const GAP_TOP = r1k(R100(C.nightly.market_top_quarter_kept) - R100(C.yearly.kept));   // $12,000 (27,700 - 15,300)
const NIGHTS = C.break_even.nights;                          // 82
const PER_NIGHT = C.break_even.per_booked_night_kept;        // 191.52
const PER_NIGHT_TEXT = "$" + Math.floor(PER_NIGHT / 10) * 10; // $190
const LEASE_MONTH_EXACT = money(F.mb_months[0].lease_kept);  // $1,270
/* Facts row 32 (VERIFIED-BY-FIXER): a two-bedroom open all year, booked as often as the middle Myrtle
   Beach listing (34 percent of open nights, row 5), at the two-bedroom rate (row 2), kept by the same
   per-night method as the break-even (row 16). Our arithmetic. */
const YR_NIGHTS = Math.round(365 * MB.median_occ_pct / 100);                // 124
const YR_KEPT_V = YR_NIGHTS * PER_NIGHT - C.break_even.fixed_costs;         // 23,358
const YR_KEPT = r100(YR_KEPT_V);                                            // $23,400
const GAP_YR = r1k(R100(YR_KEPT_V) - R100(C.yearly.kept));                  // $8,000 (23,400 - 15,300)
must(YR_NIGHTS === 124 && YR_KEPT === "$23,400" && GAP_YR === "$8,000" && GAP_MID === "$3,000" && GAP_TOP === "$12,000", "row 32: the year-round two-bedroom and the gaps");
const SHORT30 = MB.booked_or_blocked_days["1-30"].share_pct;                 // 22.3: about one in five
must(SHORT30 > 19 && SHORT30 < 23, "row 5: about one in five booked 30 nights or fewer");
const OCEAN_PCT = Math.round(pctOf0(L.condo_mb_city_oceanfront_building));  // 95
function pctOf0(o) { return o.str_allowed / o.total * 100; }
must(OCEAN_PCT === 95, "row 25: 95 percent of the city's oceanfront condos for sale");
/* Row 34 (VERIFIED-BY-FIXER, round 2): AirROI's open-days table, 271 to 366 days 58.5 percent, so about
   four listings in ten are open to guests nine months a year or less. Typed from the raw page; the
   findings file does not hold the open-days table. */
const OPEN_271_PLUS = 58.5;
must(Math.round((100 - OPEN_271_PLUS) / 10) === 4, "row 34: about four in ten open nine months or less");
/* Row 35 (VERIFIED-BY-FIXER, round 2): a full-service manager at 40 percent of any base no larger than the
   owner's own keep (the most favourable base there is) still leaves less than the lease at 124 nights, and
   matching the lease takes at least this many nights. The base itself is owner question 1; the 172-night
   figure on the nightly base stays held (row 16). */
const MGR_LOW = 0.40;
const MGR_AT_YR = YR_KEPT_V * (1 - MGR_LOW);                                               // 14,015
const MGR_MIN_NIGHTS = Math.ceil((C.yearly.kept / (1 - MGR_LOW) + C.break_even.fixed_costs) / PER_NIGHT); // 135
must(MGR_AT_YR < C.yearly.kept && MGR_MIN_NIGHTS === 135, "row 35: the manager's lower bound");
const JUL = F.mb_months.find((m) => m.month === SM.peakMonth);
must(JUL.nightly_gross === SM.peakRevenue && JUL.nightly_gross === 6800 && Math.round(JUL.nightly_kept / 100) * 100 === 4200, "row 4: July");

const SELF = "/invest/str-vs-ltr/";
const AIRROI_MB = "https://www.airroi.com/airbnb-data/united-states/south-carolina/myrtle-beach";
const AIRROI_CW = "https://www.airroi.com/airbnb-data/united-states/south-carolina/conway";
const FMR = "https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx";
const CFR = "https://www.law.cornell.edu/cfr/text/24/888.113";
const HVS = "https://www.census.gov/housing/hvs/data/rates/tab1_state05_2026_rvr.xlsx";
const T12_36 = "https://www.scstatehouse.gov/code/t12c036.php";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const MB_ZONE = "https://www.cityofmyrtlebeach.com/news_detail_T6_R1468.php";
const MB_LIC = "https://www.cityofmyrtlebeach.com/careers/business/business_faq.php";
const ABNB_TAX = "https://www.airbnb.com/help/article/2328";
const ST575 = "https://dor.sc.gov/sites/dor/files/forms/ST575.pdf";
const ABNB_FEE = "https://www.airbnb.com/help/article/1857";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const HC_ZONE = "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf";
const CFR469 = "https://www.ecfr.gov/current/title-26/section-1.469-1T";

/* ---------------------------------------------------------------------------- */
/* The page's own blocks                                                          */

const CSS = `<style>
main#main .sl-fit{display:grid;gap:.7rem;margin:1.2rem 0 1.4rem;max-width:960px}
@media (min-width:760px){main#main .sl-fit{grid-template-columns:repeat(2,minmax(0,1fr))}}
main#main .sl-fit>div{padding:1rem 1.15rem .55rem;border-radius:16px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.08)}
main#main .sl-fit h3{font-family:var(--sans)!important;font-size:1.08rem!important;font-weight:650;color:var(--navy);margin:0 0 .5rem!important;line-height:1.35}
main#main .sl-fit ul{list-style:none;margin:0;padding:0}
main#main .sl-fit li{position:relative;padding-left:1.15rem;margin:0 0 .5rem;color:var(--muted);line-height:1.55;font-size:var(--read,1.0625rem)}
main#main .sl-fit li::before{content:"";position:absolute;left:0;top:.62em;width:.5rem;height:.5rem;border-radius:50%;background:var(--brass)}
main#main .sl-fit .sl-lease li::before{background:var(--navy)}
main#main .sl-story{border-left:3px solid var(--brass);padding:1rem 1.2rem;margin:1.4rem 0;max-width:720px;border-radius:0 16px 16px 0;background:rgba(255,255,255,.55);color:var(--muted);line-height:1.7;font-size:var(--read,1.0625rem)}
main#main .sl-story p{margin:0 0 .5rem}main#main .sl-story p:last-child{margin:0;font-size:.95rem}
main#main .sl-mo{margin:1.6rem 0 1.8rem;max-width:760px;padding:1.1rem 1.2rem .9rem;border-radius:18px}
main#main .sl-mo .cap{font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.02rem;line-height:1.4;margin:0 0 .6rem}
main#main .sl-key{display:flex;flex-wrap:wrap;gap:.35rem 1.2rem;margin:0 0 .8rem;color:var(--muted);font-size:.95rem;line-height:1.4}
main#main .sl-key span{display:inline-flex;align-items:center;gap:.45rem}
main#main .sl-key i{display:inline-block;width:1.1rem;height:.6rem;border-radius:4px;background:var(--brass)}
main#main .sl-key i.lo{background:#8e99a4}
main#main .sl-key svg{flex:none;display:block}
main#main .sl-mo [role=rowgroup]{display:grid;gap:.42rem}
main#main .sl-mo [role=row]{display:grid;grid-template-columns:2.6rem minmax(0,1fr);align-items:center;gap:.6rem}
main#main .sl-mo [role=rowheader]{font-family:var(--sans);font-size:1rem;color:var(--navy)}
main#main .sl-mo .trk{position:relative;display:block;height:1.4rem;--w:calc(100% - 4.6rem)}
main#main .sl-mo .b{position:absolute;left:0;top:.25rem;bottom:.25rem;width:calc(var(--f) * var(--w));border-radius:6px;background:linear-gradient(90deg,var(--brass),var(--brass-2))}
main#main .sl-mo .lo .b{background:#8e99a4}
main#main .sl-mo .ln{position:absolute;top:-.2rem;bottom:-.2rem;left:calc(var(--l) * var(--w));border-left:2px dashed var(--navy)}
main#main .sl-mo .v{position:absolute;top:0;left:calc(var(--f) * var(--w) + .3rem);z-index:1;padding:0 .25rem;border-radius:4px;background:#fbf8f4;line-height:1.4rem;font-family:var(--sans);font-size:1rem;font-weight:600;color:var(--navy);white-space:nowrap;font-variant-numeric:tabular-nums}
main#main .sl-mo .lo .v{color:var(--muted)}
main#main .sl-mo figcaption{margin-top:.8rem;color:var(--muted);font-size:.9rem;line-height:1.55}
main#main .sl-mo .sr,main#main .sl-calc .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
main#main .sl-calc{background:linear-gradient(160deg,rgba(42,48,64,.97),rgba(28,32,40,.98));border-radius:18px;padding:1.3rem 1.3rem 1.2rem;margin:1.4rem 0 1.6rem;max-width:620px;color:rgba(244,239,232,.92);font-family:var(--sans)}
main#main .sl-calc .t{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brass-2);margin:0 0 .9rem;font-weight:600}
main#main .sl-calc label{display:flex;justify-content:space-between;align-items:center;gap:.8rem;font-size:1rem;line-height:1.35;margin:0 0 .65rem;color:rgba(244,239,232,.92)}
main#main .sl-calc input{width:7.2rem;flex:none;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.4);border-radius:8px;color:#f4efe8;font:inherit;font-size:1.05rem;padding:.45rem .55rem;text-align:right}
main#main .sl-calc .out{border-top:1px solid rgba(244,239,232,.22);margin-top:1rem;padding-top:.9rem}
main#main .sl-calc .big{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;font-size:1rem}
main#main .sl-calc .big strong{font-family:var(--serif);font-size:2rem;line-height:1;color:var(--brass-2)}
main#main .sl-calc .row{display:flex;justify-content:space-between;gap:1rem;margin-top:.5rem;font-size:1rem;color:rgba(244,239,232,.85)}
main#main .sl-calc .row strong{color:#f4efe8;font-weight:600;font-variant-numeric:tabular-nums}
main#main .sl-calc .say{margin:.75rem 0 0;color:rgba(244,239,232,.85);line-height:1.55;font-size:1rem}
main#main .sl-calc .note{margin:.7rem 0 0;color:rgba(244,239,232,.78);font-size:1rem;line-height:1.5}
@media (max-width:420px){main#main .sl-calc input{width:6.2rem}}
@media (prefers-reduced-transparency:reduce){main#main .sl-fit>div,main#main .sl-story{background:#fbf8f3}}
</style>`;

/* The same two-bedroom, run by its owner (rows 2, 5, 9, 13, 14, 16, 32): what the owner keeps in a year.
   The top-quarter listing is any size (rows 14, 15), so it is one sentence, not a bar. Round 2: the
   "what comes in" column is the same kind of thing in each row, and the note is a source line and one
   sentence (owner's eye). */
const BOTH = G.bars([
  { name: "Airbnb booked a third of the nights in the year", value: YR_KEPT_V, valueText: YR_KEPT, feature: `about ${YR_NIGHTS} nights at ${money(C.nightly.size_adr)}` },
  { name: "Yearly lease", value: C.yearly.kept, valueText: LEASE_KEPT, feature: `11 months at ${money(C.yearly.fmr_month)}`, reference: true },
  { name: "Airbnb, the middle two-bedroom listing", value: C.nightly.size_median_kept, valueText: MID_KEPT, feature: `${MID_GROSS} of bookings and fees` },
], { caption: "Booked a third of the year, a Myrtle Beach two-bedroom Airbnb leaves its owner more than a lease. The middle listing leaves less.", nameLabel: "Rented as", featureLabel: "what comes in", valueLabel: "owner keeps",
  note: `What the owner keeps in a year, before the loan, tax and HOA fee. Sources: AirROI's Myrtle Beach market, for an owner who runs it, and HUD's standard two-bedroom rent for the metro area, less utilities. Guests' cleaning fees are in the ${MID_GROSS} and pay the cleaner.` });

/* Workaround (NEEDS.md 6): when the site's edge adds the listing disclaimer after the last band, glass.js
   draws the bottom offer band as the light top bar and its ivory words vanish. Keep it the dark panel.
   Shared chrome, worked around on this page until the lead fixes the shared CSS (NEEDS.md 9 and 10): the
   listing search box and its chips run past a 320 px window, and the header is 1029 px wide at 1024.
   The hero tiles and the pros and cons are styled in the design pass (DESIGN_CSS below). */
const BAND_FIX = `<style>main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;display:block!important;text-align:center!important;border-radius:24px;padding:1.8rem 1.3rem 1.9rem!important}`
  + `@media (min-width:700px){main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{margin-left:auto!important;margin-right:auto!important;padding:2.2rem 1.6rem!important}}`
  + `.hx-fb,.hx-fb-ai,.hx-fb-q{max-width:100%;min-width:0;box-sizing:border-box}.hx-fb-q textarea{min-width:0}.hx-fb-pills{flex-wrap:wrap;max-width:100%}`
  + `@media (max-width:379px){.hx-fb-ai,.hx-fb-ai .hx-ai-badge,.hx-fb-ai .hx-fb-q{max-width:100%!important;min-width:0!important;box-sizing:border-box}.hx-fb-ai .hx-fb-q textarea{flex:1 1 0!important;width:auto!important;min-width:0!important}}`
  + `@media (min-width:1000px) and (max-width:1100px){.header-inner>.primary{gap:2.2rem!important}.header-inner{gap:1.6rem!important}}`
  + `</style>`;

/* Design pass, 2026-11-08 (redo3/invest-str-vs-ltr/DESIGN.md), after the approved HOA documents and Garden City
   pages: a two-line headline with the facts as flat items under rules, the contents between rules, one card style
   (the charts, the calculator and the offers), plain lists and tables under thin rules, the photo beside the chart it
   shows, and one block width of 720 px. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const DESIGN_CSS = "<style>"
  /* 1. The headline: the italic line at about half the H1's size; the four facts flat, number first, between rules. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:#8a5226!important}}`
  + `${S} .detail-media{max-width:720px!important}`
  + `${S} .c3-glance{display:grid!important;grid-template-columns:1fr!important;gap:0 1.6rem!important;max-width:720px!important;margin:0!important;padding:0!important;border-top:${RULE};border-bottom:${RULE}}`
  + `${S} .c3-glance li{${FLAT};display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;text-align:left!important;gap:.7rem!important;padding:.55rem 0!important;min-width:0}`
  + `${S} .c3-glance li+li{border-top:${RULE}!important}`
  + `${S} .c3-glance li>span:last-child{display:flex;flex-direction:column-reverse;min-width:0}`
  + `${S} .c3-glance strong{font-family:var(--sans);font-size:.95rem!important;font-weight:400!important;color:var(--muted)!important;line-height:1.35!important}`
  + `${S} .c3-glance span.t{font-family:var(--sans);font-size:1.1rem!important;font-weight:700!important;color:var(--navy)!important;line-height:1.4!important;white-space:normal!important}${S} .c3-glance li{line-height:1.4!important}`
  + `@media (max-width:699px){${S} .c3-glance li{padding:.42rem 0!important}${S} .c3-glance .i{width:32px!important;height:32px!important}${S} .detail-h1 em{margin-top:.35rem}}`
  + `@media (min-width:700px){${S} .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important}${S} .c3-glance li+li{border-top:0!important}${S} .c3-glance li:nth-child(n+3){border-top:${RULE}!important}${S} .c3-glance li{padding:.7rem 0!important}}`
  /* 2. The contents list: no card, in columns between two rules. */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}`
  /* 3. The pros and cons: two plain columns under a rule; what to do about a con after a brass arrow. */
  + `${S} .c3-pc{gap:0 2rem!important;max-width:720px!important;margin:.4rem 0 1.4rem!important}`
  + `${S} .c3-pc>div{${FLAT};border-top:${RULE}!important;padding:.75rem 0 .3rem!important}`
  + `${S} .c3-pc h3{font-family:var(--sans)!important;font-size:.78rem!important;letter-spacing:.1em;text-transform:uppercase;color:#8a5226!important;font-weight:700!important;margin:0 0 .6rem!important}`
  + `${S} .c3-pc li{line-height:1.55!important;margin:0 0 .8rem!important;gap:.6rem!important}${S} .c3-pc li svg{width:18px;height:18px;margin-top:.22rem!important}`
  + `${S} .c3-pc .c3-pc-do{margin-top:.3rem!important;font-family:var(--sans);font-size:.95rem;font-weight:600!important;line-height:1.45;color:var(--navy)}`
  + `${S} .c3-pc .c3-pc-do::before{content:"\\2192\\00a0";color:var(--brass);font-weight:700}`
  /* 4. One card style: the nights table is a plain table under rules, a table on a phone too; the example loses its box;
        the photo loses its frame and sits beside the homes-for-sale chart on a wide screen; every block 720 px wide. */
  + `${S} .c3-cc{max-width:720px!important}`
  + `${S} .c3-cc{${FLAT};padding:0!important}`
  + `${S} .c3-cc thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}${S} .c3-cc th,${S} .c3-cc td{border-bottom:${RULE}!important}`
  + `${S} .c3-cc th:first-child,${S} .c3-cc td:first-child{padding-left:0!important}${S} .c3-cc tr>:last-child{padding-right:0!important}`
  + `@media (max-width:39.999em){${S} .c3-cc table{display:table!important;font-size:.98rem}${S} .c3-cc caption{display:table-caption!important}`
  + `${S} .c3-cc thead{display:table-header-group!important;position:static!important;width:auto!important;height:auto!important;overflow:visible!important;clip:auto!important;white-space:normal!important}`
  + `${S} .c3-cc tbody{display:table-row-group!important}${S} .c3-cc tr{display:table-row!important;background:none!important;box-shadow:none!important;border-radius:0!important;border:0!important;margin:0!important;padding:0!important}`
  + `${S} .c3-cc th,${S} .c3-cc td{display:table-cell!important;padding:.55rem .5rem!important;font-size:1em!important}${S} .c3-cc thead th{font-size:.88rem!important;line-height:1.3}`
  + `${S} .c3-cc tr>*{background:none!important}${S} .c3-cc tbody th{white-space:nowrap}${S} .c3-cc td[data-label]::before{content:none!important}}`
  + `${S} .sl-story{background:none!important;border-radius:0!important;padding:.2rem 0 .2rem 1.2rem!important}`
  + `${S} .c3-gchart,${S} .sl-mo,${S} .sl-calc,${S} .sl-story{max-width:720px!important;box-sizing:border-box}`
  + `${S} .sl-side figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} .sl-side figure.c3ph-hero figcaption{padding:0!important}`
  + `@media (min-width:1180px){${S} .sl-side{display:grid;grid-template-columns:720px minmax(0,1fr);column-gap:2.4rem;align-items:start;margin:1.4rem 0 1.6rem}`
  + `${S} .sl-side>.c3-gchart{margin:0!important}${S} .sl-side .c3ph-hero{margin:0!important}}`
  /* 5. The month chart: the number at the end of each bar, on the card's own colour where it crosses the lease line. */
  + `${S} h2,${S} h3,${S} a.btn,${S} .sl-mo .cap,${S} .c3-gchart .cap{text-wrap:balance}`
  + "</style>";

/* The break-even calculator. Formula from ledger row 16: on each booked night the owner keeps the rate
   less 24 percent (Airbnb's fee 14, utilities 5, supplies 2, repairs 3; the guest's cleaning fee pays the
   cleaner), and pays $390 a year (insurance $260, permit $130). On the lease the owner keeps 11 months'
   rent less $1,290 of utilities (row 13). Round 2 (reader): a box for a manager's share, taken from the
   nightly rate, which the reader enters; it starts at 0, so the default is the self-run row 16 figure.
   No loan, rate or payment. Money to the nearest $100, as everywhere else on the page. */
const SHARE = C.break_even.per_booking_cost_share, FIXED = C.break_even.fixed_costs, UTIL = C.yearly.utilities;
must(SHARE === 0.24 && UTIL === 1290, "row 16: 24 percent and $1,290");
const calcField = (id, label, v, step) => `<label for="${id}">${label}<input id="${id}" type="number" min="0" step="${step}" value="${v}" inputmode="decimal" oninput="slCalc()"></label>`;
const be0 = Math.ceil((C.yearly.kept + FIXED) / (C.nightly.size_adr * (1 - SHARE)));
must(be0 === NIGHTS, "the calculator's default must give the ledger's 82 nights");
const kept0 = C.nightly.size_adr * (1 - SHARE) * NIGHTS - FIXED;
must(r100(kept0) === LEASE_KEPT, "at 82 nights the calculator shows the lease's figure");
const CALC = `<div class="sl-calc" role="group" aria-labelledby="slCalcT"><p class="t" id="slCalcT">Your own break-even</p>`
  + calcField("slNight", "Nightly rate, $", C.nightly.size_adr, 1)
  + calcField("slRent", "Monthly rent on a lease, $", C.yearly.fmr_month, 1)
  + calcField("slNights", "Nights booked a year", NIGHTS, 1)
  + calcField("slMgr", "Manager's share of the nightly rate, %", 0, 1)
  + `<div class="out" aria-live="polite"><div class="big"><span>Nights a year to match the lease</span><strong id="slBe">${NIGHTS}</strong></div>`
  + `<div class="row"><span>Stays of average length</span><strong id="slBk">${Math.round(NIGHTS / MB.avg_stay_nights)}</strong></div>`
  + `<div class="row"><span>You keep with the Airbnb</span><strong id="slA">${r100(kept0)}</strong></div>`
  + `<div class="row"><span>You keep with the lease</span><strong id="slL">${LEASE_KEPT}</strong></div>`
  + `<p class="say" id="slSay">At ${NIGHTS} nights you keep about the same either way.</p></div>`
  + `<p class="note">A year, before the loan, property tax and HOA fee, which are the same either way. On each booked night you keep the rate less Airbnb's fee, running costs and any manager's share. Guests pay the cleaning fee, and it pays the cleaner. You also pay for a short-term rental insurance policy and a permit. On the lease you keep 11 months of rent, less utilities.</p></div>`
  + `<script>function slCalc(){var g=function(i){var e=document.getElementById(i);var v=e?parseFloat(e.value):NaN;return isFinite(v)&&v>0?v:0};`
  + `var m=function(x){return (x<0?"-$":"$")+(Math.round(Math.abs(x)/100)*100).toLocaleString("en-US")};var o=function(i,t){var e=document.getElementById(i);if(e)e.textContent=t};`
  + `var r=g("slNight"),rent=g("slRent"),nt=Math.min(g("slNights"),365),mg=Math.min(g("slMgr"),100);var per=r*(${1 - SHARE}-mg/100);var lk=rent*11-${UTIL};var ak=per*nt-${FIXED};`
  + `o("slL",m(lk));o("slA",m(ak));if(!r){o("slBe","--");o("slBk","--");o("slSay","Enter a nightly rate.");return}`
  + `var be=per>0?Math.ceil((lk+${FIXED})/per):Infinity;o("slBe",be>365?"more than 365":String(Math.max(be,0)));o("slBk",be>365?"--":String(Math.round(Math.max(be,0)/${MB.avg_stay_nights})));`
  + `var d=ak-lk;o("slSay",Math.abs(d)<250?"At "+nt+" nights you keep about the same either way.":d>0?"At "+nt+" nights you keep about "+m(d)+" more a year with the Airbnb.":"At "+nt+" nights you keep about "+m(-d)+" more a year with the lease.")}`
  + `document.addEventListener("DOMContentLoaded",slCalc);</script>`;

/* Row 38 (VERIFIED-BY-FIXER, round 2): what the owner keeps at five booked-night counts, by the
   calculator's own method (row 16), self-run, at the two-bedroom rate. Gaps to the nearest $1,000, as in the prose. The page's data table (score A6;
   the jobs table was cut in round 2). Each gap is between printed figures. */
const NIGHT_ROWS = [60, NIGHTS, 100, YR_NIGHTS, 150].map((nt) => {
  const k = R100(nt * PER_NIGHT - FIXED), d = k - R100(C.yearly.kept);
  return { name: `${nt} nights`, cells: { a: "$" + k.toLocaleString("en-US"), d: Math.abs(d) < 250 ? "about the same" : `about ${r1k(Math.abs(d))} ${d > 0 ? "more" : "less"}` } };
});
must(NIGHT_ROWS.map((r) => r.cells.a).join() === "$11,100,$15,300,$18,800,$23,400,$28,300", "row 38: the nights table");
must(NIGHT_ROWS[3].cells.d === `about ${GAP_YR} more`, "row 38: the 124-night gap reads as in the short answer");
const NIGHT_TABLE = compareCards(NIGHT_ROWS, [{ key: "a", label: "You keep with the Airbnb" }, { key: "d", label: `Against ${LEASE_KEPT} from the lease` }],
  { caption: `What you keep in a year from a Myrtle Beach two-bedroom at ${money(C.nightly.size_adr)} a night, run by you`, nameLabel: "Booked a year" });

/* The month chart (rows 4, 13, 14): what the average Myrtle Beach listing keeps each month at the market's
   kept share, against what the owner keeps each month from the lease. Months below the lease in grey.
   Round 2: the owner is the actor in the title and key, and the caption is a source line and one plain
   sentence (owner's eye). */
const MONTHS = F.mb_months;
const MO_MAX = Math.max(...MONTHS.map((m) => m.nightly_kept));
const leaseL = Math.round(MONTHS[0].lease_kept / MO_MAX * 1000) / 1000;
const MONTH_CHART = `<figure class="sl-mo"><p class="cap" id="slMoCap">The owner of the average Myrtle Beach Airbnb keeps more than a lease each month, except November to February</p>`
  + `<div class="sl-key" aria-hidden="true"><span><i></i>More than the lease</span><span><i class="lo"></i>Less than the lease</span><span><svg width="4" height="18" viewBox="0 0 4 18" aria-hidden="true"><path d="M2 0v18" stroke="#1c2028" stroke-width="2" stroke-dasharray="3 3"/></svg>Lease: about ${LEASE_MONTH_EXACT} a month to the owner</span></div>`
  + `<div role="table" aria-labelledby="slMoCap"><div role="rowgroup" class="sr"><div role="row"><span role="columnheader">Month</span><span role="columnheader">Owner keeps</span></div></div><div role="rowgroup">`
  + MONTHS.map((m) => {
    const lo = m.nightly_kept < m.lease_kept;
    return `<div role="row"${lo ? ' class="lo"' : ""}><span role="rowheader">${m.month.slice(0, 3)}<span class="sr">${m.month.slice(3)}</span></span>`
      + `<span role="cell"><span class="trk" aria-hidden="true" style="--f:${Math.round(m.nightly_kept / MO_MAX * 1000) / 1000}"><span class="b"></span><span class="ln" style="--l:${leaseL}"></span><span class="v">${money(m.nightly_kept)}</span></span>`
      + `<span class="sr">${money(m.nightly_kept)}${lo ? ", less than the lease" : ""}</span></span></div>`;
  }).join("") + `</div></div>`
  + `<figcaption>Source: AirROI, the average Myrtle Beach listing of any size open in that month, after running costs. The lease line is the ${money(C.yearly.fmr_month)} rent less utilities and one empty month, spread over the year.</figcaption></figure>`;

/* Homes for sale by what the listing allows (row 25): our count, aggregate, active listings only. */
const pctOf = pctOf0;
const LIST_CHART = G.bars([
  { name: "Myrtle Beach oceanfront condos", o: L.condo_mb_city_oceanfront_building },
  { name: "North Myrtle Beach oceanfront condos", o: L.condo_nmb_oceanfront_building },
  { name: "North Myrtle Beach houses", o: L.house_nmb },
  { name: "Myrtle Beach houses", o: L.house_mb_city },
  { name: "Houses with a Conway address", o: L.house_conway },
  { name: "Carolina Forest houses", o: L.house_carolina_forest },
].map((r) => ({ name: r.name, value: pctOf(r.o), valueText: pctOf(r.o) < 1 ? "under 1%" : Math.round(pctOf(r.o)) + "%", feature: `${n(r.o.str_allowed)} of ${n(r.o.total)} for sale` })),
{ caption: "Homes for sale marked for short-term rentals: most oceanfront condos, fewer houses", nameLabel: "Homes for sale", featureLabel: "how many", valueLabel: "share marked", max: 100, compact: true, phoneList: true,
  note: "Our count of the homes for sale in our search, by what the listing agent entered. Myrtle Beach means inside city limits. North Myrtle Beach and Conway are by the home's address." });

/* Photo (rules/images.md). The Conway house is cut (owner's eye, round 1: it showed neither point). */
const TOWERS = PH.aerial("myrtle-beach-oceanfront-towers-from-the-beach", "Oceanfront towers along the beach in Myrtle Beach.");

/* The glance row under the H1 (rows 16, 4, 25, 17). */
/* A no-break space before each last word, so a narrow tile never leaves one word alone (round 2). */
const NB = (t) => t.replace(/ (\S+)$/, "\u00a0$1");
const GLANCE = glance([
  { icon: "calendar", label: NB("Break-even, run by you"), text: NB(`${NIGHTS} nights a year`) },
  { icon: "beach", label: NB("June to August"), text: NB(`${F.mb_summer_share_pct}% of the income`) },
  { icon: "home", label: "Oceanfront condos for sale, Myrtle Beach", text: NB(`${OCEAN_PCT}% marked nightly`) },
  { icon: "town", label: "Myrtle Beach neighborhoods", text: NB("Mostly lease only") },
]);

/* The example (row 30, story boston-hotel-manager), beside the top-quarter figure as row 30 requires.
   Round 2 (owner's eye): an example, not a story, with the bank's label less "from a real story", which
   the build bans (punch rule, "real story"); "He now helps manage
   fourteen units" is in the bank's summary and its limits. Nothing added. */
const STORY = `<div class="sl-story"><p>An example from a friend of ours. He ran a hotel in Boston, retired, and bought three condos in one oceanfront building. They gross about $120,000 a year, roughly half of it profit. He now helps manage fourteen units.</p><p>His real numbers, not a promise.</p></div>`;

/* ---------------------------------------------------------------------------- */

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: `Airbnb vs Long-Term Rental, Myrtle Beach: ${NIGHTS}-Night Break-Even`,
  description: `Airbnb or a yearly lease in Myrtle Beach? One two-bedroom priced both ways, the ${NIGHTS} nights it needs to match a lease, and where each is allowed.`,
  ogTitle: `Airbnb or a yearly lease in Myrtle Beach: one two-bedroom priced both ways, and the ${NIGHTS} nights it needs`,
  crumb: "Airbnb vs Long-Term Rental",
  eyebrow: "Strategy",
  h1: "Short-term or long-term rental in Myrtle Beach?",
  h1em: "Run the same home both ways.",
  sub: `Run it yourself, and a two-bedroom Airbnb leaves you more than a lease once guests book it about ${NIGHTS} nights a year. Most city neighborhoods allow only a lease.`,
  heroMedia: GLANCE,
  heroCta: { title: "Send us one address. We run it both ways before you offer.", label: "Have us run both numbers", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    `A short-term rental, such as an Airbnb, leaves you more than a long-term rental, a yearly lease, once guests book it about ${NIGHTS} nights a year. That figure assumes you run it yourself. At a third of the nights, about ${YR_NIGHTS}, the owner of a Myrtle Beach two-bedroom keeps about ${GAP_YR} a year more.`,
    `Many listings book fewer nights. Half of two-bedroom listings take in more than the middle one, and half take in less. Its owner keeps about ${GAP_MID} less than with a lease.`,
    `Of ${n(L.condo_mb_city_oceanfront_building.total)} condos for sale in oceanfront buildings inside Myrtle Beach city limits, listing agents marked ${n(L.condo_mb_city_oceanfront_building.str_allowed)} as allowing nightly stays. Most city neighborhoods allow only stays of 90 days or more.`,
  ],
  sections: [
    { h2: "Which earns more in Myrtle Beach, an Airbnb or a long-term rental?", toc: "Which earns more", id: "which-earns-more", html: () =>
      CSS + BAND_FIX + DESIGN_CSS + PH.css() +
      h.p(`An owner who opens the Airbnb all year and gets a third of its nights booked keeps the most. The chart below follows one Myrtle Beach two-bedroom, run by its owner.`) +
      BOTH +
      h.p(`Some costs are the same either way: the loan, the HOA fee, and the property tax, about ${money(Math.round(TAXC.tax / 1000) * 1000)} a year on an oceanfront condo listed near ${money(Math.round(EX.price_median / 25000) * 25000)}.`) +
      h.p(`The lease figure uses the standard two-bedroom rent from HUD, the federal housing department, for the whole metro area. For an oceanfront unit, put its own rent in the calculator below.`) +
      h.p(`Our lease figure allows one empty month a year. South Carolina's rental vacancy rate is the share of rental homes empty and up for rent. It was 11 to 12 percent in each quarter the Census has reported this year, give or take about 3 points. Each extra empty month costs you about ${r100(C.yearly.fmr_month)} of rent.`) +
      /* Overlap fix, 2026-11-08: whether a home may rent by the night, with its license and lodging tax, belongs to
         /invest/str-rules/, so the section "Can you Airbnb a home in Myrtle Beach?" is one sentence pointing there.
         The homes-for-sale count, the photo and the federal tax note compare the two choices, so they stay, here. */
      h.p(`Whether a home can rent by the night, and the license and tax, is on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.`) +
      h.p(`The homes for sale show the split:`) +
      `<div class="sl-side">` + LIST_CHART + TOWERS + `</div>` +
      h.h3("How does federal income tax treat each?") +
      h.p(`Federal income tax treats the two differently. Under ${h.ext(CFR469, "federal tax rules")}, a lease is a rental activity, so for most owners its losses are passive. A home whose average guest stays seven days or less is not a rental activity, and the average Myrtle Beach stay is under five nights. Our page on ${h.a("/invest/str-tax-treatment/", "rental losses and W-2 income")} explains when those losses can lower the tax on a salary.`) },

    { h2: "How many nights does a Myrtle Beach Airbnb need to match a lease?", toc: "Nights to break even", id: "break-even", html: () =>
      h.p(`About ${NIGHTS} booked nights a year, if you run it yourself. On each night booked at the average two-bedroom rate of ${money(C.nightly.size_adr)}, you keep about ${PER_NIGHT_TEXT} after Airbnb's fee, utilities, supplies and repairs. That is about ${F.checkouts.break_even} stays of four or five nights.`) +
      NIGHT_TABLE +
      h.p(`Running it yourself means you, or people you hire for each job, take the bookings, answer guests, send the cleaner and arrange repairs.`) +
      CALC +
      h.h3("How many nights do Myrtle Beach listings book?") +
      h.p(`A two-bedroom open all year and booked as often as the middle Myrtle Beach listing, a third of its open nights, gets about ${YR_NIGHTS} nights. Many do not get there. About four listings in ten are open to guests nine months a year or less, and about one in five was booked 30 nights or fewer.`) +
      h.p(`Some listings are booked far more. The owner of a listing that takes in more than three in four others, of any size, keeps about ${TOPQ_KEPT} a year, ${GAP_TOP} more than with the lease.`) +
      STORY +
      h.h3("What does an Airbnb manager cost in Myrtle Beach?") +
      h.p(`The average listing took about ${MB.bookings_per_listing_year} bookings in the year. Each one ends in a check-out, a cleaning and a turnover.`) +
      h.p(`A full-service manager, who handles marketing, guest messages, accounting, taxes, maintenance and repairs, takes about 40 to 60 percent in what we have seen on the Grand Strand. A basic plan of marketing, guest messages and basic accounting costs about 13 to 17 percent, and you still arrange the cleaning and repairs.`) +
      h.p(`With a full-service manager at 40 percent, the owner of the two-bedroom booked ${YR_NIGHTS} nights keeps less than with a lease. To keep as much as with a lease, guests have to book it at least about ${MGR_MIN_NIGHTS} nights a year. The calculator above takes a manager's share.`) },

    { h2: "What an Airbnb and a two-bedroom lease earn each month", toc: "Month by month", id: "month-by-month", html: (bg) =>
      h.p(`Most of it in summer. June, July and August bring in ${F.mb_summer_share_pct} percent of the year's income. In ${SM.peakMonth}, the best month, the average listing takes in about ${r100(SM.peakRevenue)}, and its owner keeps about ${r100(JUL.nightly_kept)} of it. From November through February the owner keeps less than with a lease, and about the same in October.`) +
      MONTH_CHART +
      h.p(`Some owners rent the winter as one stay of 90 days or more. A stay by the same person for 90 continuous days is not taxed as lodging. Our page on ${h.a("/invest/mid-term-rentals/", "mid-term rentals")} covers renting by the month.`) +
      h.p(`What Myrtle Beach Airbnbs gross across the market is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}.`) +
      h.cta("What do the Airbnbs near one building take in?", "Name a building you like. We send what the Airbnbs around it take in, at no cost.", "Send me the Airbnb income near it", "/contact/", bg) },

    { h2: "What are the pros and cons of an Airbnb and a long-term rental in Myrtle Beach?", toc: "Pros and cons", id: "pros-and-cons", html: (bg) =>
      h.p(`With an Airbnb you get summer prices and weeks in the home yourself. With a lease you get the same rent every month, in more neighborhoods.`) +
      h.h3("An Airbnb") +
      prosCons([
        "You can price each night for its week. On a lease the rent is the same all year.",
        "You can use the home yourself in any week it is not booked.",
        "Guests pay the cleaning fee, and it pays the cleaner.",
      ], [
        { text: "In four winter months you keep less than with a lease.", act: "Rent the winter as one stay of 90 days or more." },
        { text: "You furnish it, with photos, before the first guest, and you buy a short-term rental insurance policy.", act: "We price the furniture and photos for the unit you pick." },
        { text: "Investor lenders count only about 75 percent of an appraiser's estimate of a nightly rental's income, a loan officer at our preferred lender tells us.", act: "Only that 75 percent counts toward the income the loan is based on." },
        { text: "Standard loans are not made in a condo building that requires owners to rent through a shared rental pool. Nor are they made where the building offers hotel services, such as a front desk.", act: `We check the building first. Our page on ${h.a("/invest/condotel-financing/", "loans for hotel-style condos")} covers other loans.` },
      ], { bg }) +
      h.h3("A long-term rental") +
      prosCons([
        "One tenant moves in once a year.",
        "The same rent every month, winter included.",
        "Allowed in the city neighborhoods where nightly stays are not.",
        "You can rent it unfurnished, so there is no setup to buy.",
      ], [
        "The rent is the same in July as in January, so you get none of the summer prices.",
        "Each new tenant can mean an empty month.",
        "The tenant has the home for the year, so you cannot use it yourself.",
      ], { bg }) },

    { h2: "What does Chapter3 do before you choose?", toc: "What we do", id: "what-we-do", html: (bg) =>
      h.p(`Send us one address and we price it as a lease and as an Airbnb. Our ${h.a("/invest/long-term-rental/", "long-term rental analyzer")} prices the lease, and our ${h.a("/invest/str-tools/", "short-term rental atlas")} shows what Airbnbs around the building take in. We also read the building's rules and the zoning, and work out the property tax for that home.`) +
      h.p(`For income across the whole market, our ${h.a("/invest/airbnb-income/", "Airbnb income report")} has it town by town.`) +
      h.cta("Both numbers for one home", "We run the lease and the Airbnb side and send you both numbers before you write an offer, at no cost.", "Have us price one home both ways", "/contact/", bg) },
  ],
  faqTitle: "Airbnb vs long-term rental questions",
  faq: [
    { q: "Is Airbnb or a long-term rental more profitable in Myrtle Beach?", a: `The Airbnb, once guests book a two-bedroom about ${NIGHTS} nights a year and you run it yourself. Below that, you keep more with a lease at HUD's standard rent, and many listings book fewer nights.` },
    { q: "Can you Airbnb a house in Myrtle Beach?", a: "Inside city limits, only in the Residential Multifamily Visitor zone; the other residential zones allow only stays of 90 days or more. In Carolina Forest and the rest of unincorporated Horry County, the county's zoning has no short-term rental rule. A home's HOA rules may still not allow nightly stays. The license, the tax and every town's rules are on our short-term rental rules page." },
    { q: "How many nights does a Myrtle Beach Airbnb need to book?", a: `About ${NIGHTS} a year on a two-bedroom at ${money(C.nightly.size_adr)} a night, if you run it yourself. With a full-service manager at 40 percent, at least about ${MGR_MIN_NIGHTS}.` },
    { q: "Do I pay lodging tax on a long-term lease?", a: "No. South Carolina charges its 7 percent state tax only on stays under 90 days, plus local taxes. Two exceptions to the tax: a home rented out 14 days or fewer in a year, and rooms in the owner's own home with fewer than six rented." },
    { q: "Is a short-term or long-term rental easier to finance?", a: "A lease. A loan officer at our preferred lender tells us investor lenders count only about 75 percent of the appraiser's estimate of a nightly rental's income." },
    { q: "Does Chapter3 manage rentals?", a: "No. Chapter3 is a brokerage and does not manage rentals. A full-service manager here takes about 40 to 60 percent, in what we have seen." },
  ],
  sources: [
    { name: "AirROI, Myrtle Beach", href: AIRROI_MB },
    { name: "HUD Fair Market Rents", href: FMR },
    { name: "Census vacancy", href: HVS },
    { name: "S.C. Code 12-36-920", href: T12_36 },
    { name: "Horry County 2026 tax levy", href: LEVY },
    { name: "City zoning", href: MB_ZONE },
    { name: "Horry County zoning", href: HC_ZONE },
    { name: "City business license", href: MB_LIC },
    { name: "SCDOR ST-575 tax rates", href: ST575 },
    { name: "Airbnb taxes", href: ABNB_TAX },
    { name: "26 CFR 1.469-1T", href: CFR469 },
    { name: "Fannie Mae B4-2.1-03", href: FNMA },
  ],
  sourcesNote: "Airbnb: AirROI, 12 months to September 2026, with guests' cleaning fees in the income; run by the owner, at the low end of AirROI's costs; our arithmetic. Homes for sale: our count of active listings. Not legal or tax advice.",
  /* Round 2 (critic): one photo, whose own credit already says what we changed, so the shared note is
     cut to the license line ShareAlike needs. */
  afterSources: () => {
    const c = PH.credits(), NOTE = "Chapter3 Realty resized these photos and cropped some of them. Each photo keeps the license listed with it.";
    must(c.includes(NOTE), "the shared credits note changed: re-check this replacement");
    return c.split(NOTE).join("Our crops keep the photo's CC BY-SA 4.0 license.");
  },
  pageImages: () => PH.share("myrtle-beach-oceanfront-towers-from-the-beach").pageImages(),
  bottomCta: { h2: "Should your home be an Airbnb or a lease?", p: "Tell us the home. An agent sends what you would keep as a lease and as an Airbnb, at no cost. Call 854.333.2135. We answer evenings.", label: "Ask us which pays more", href: "/contact/" },
  keywords: "Airbnb vs long term rental Myrtle Beach, short term vs long term rental, Airbnb or long term rental more profitable, short term rental break even, vacation rental vs long term rental, Airbnb vs long term rental taxes, Airbnb vs long term rental pros and cons",
  about: "Renting a Myrtle Beach home nightly (short-term rental, Airbnb) against a yearly lease (long-term rental), Horry County, South Carolina",
});
