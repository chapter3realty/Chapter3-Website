/* /invest/airbnb-income/ - how much do Airbnbs make in Myrtle Beach: what the average Grand Strand
 * Airbnb takes in from guests a year, town by town; what a two-, three- and four-bedroom takes in;
 * how the year falls by month; what two real condos for sale keep after their bills; what a manager
 * takes; and whether it is a good investment.
 *
 * Batch 2026-11-b, Lane U. Version 1, 2026-11-09. The live page was hand-built HTML; this is its
 * first spec. Plan: Blog-Brain batches/2026-11-b/invest-airbnb-income/PLAN.md. Facts: facts.md in
 * the same folder, VERIFIED rows and CORRECTED rows at the verifier's values and wording only
 * (VERIFY.md; struck wording in batches/2026-11-b/facts/invest-airbnb-income-struck.json).
 * Data: data/str-market.json (the site's one file for short-term rental figures, AirROI's
 * 12 months to September 2026) for every town figure, and
 * data/2026-11-b/invest-airbnb-income/findings.json (analyze.py over the same AirROI update) for
 * sizes, months and the two worked condos. The build stops if the two files disagree, and every
 * figure in the copy is read from them and checked against its ledger row.
 * One source and one method (triage, 2026-11-08: "the numbers contradict each other"): every gross
 * figure is AirROI's, every net figure is /invest/str-tools/'s own arithmetic on its own two condos.
 * Kept from the live page: the question in the H1, the area figures, July and January, the point
 * that Myrtle Beach's lower average is the mix of homes, the monthly spread, the cleaning-fee line,
 * the offer to run an address, the phone line and "We answer evenings", the links to the STR pages.
 * Cut (facts.md, "Struck from the live page"): the five-vendor table, every net shortcut, the three
 * unsourced profiles, the three management scales, the portfolio not in the story bank, the market-size
 * and ordinance section, the BrickWood line.
 * Not used from the plan: the three hero chips (they repeated the short answer; CRAFT 5, "say each fact
 * once"). The page's own strips need idx-lib/feeds.js "/invest/airbnb-income/": { ...STR_OCEAN, withStrips: true }
 * (made in review 1), or the edge feed under the opening goes away (idx-lib/edge.js line 249).
 * Review 1 (2026-11-09, REVIEW-1.md): the net section, its ledger table and its Airbnb-fee and lodging-tax H3 are
 * gone. /invest/str-tools/ owns "what you keep" (its H2 "How much profit does a Myrtle Beach Airbnb make?"); this
 * page owns gross income by town, size and month. What is left after the bills is said once, in the short answer,
 * with the all-year and part-year framing together, and the "good investment" answer uses the same framing. The
 * AirROI link is out of the sources line (VERIFY.md "Not to publish": AirROI's November 5 update changed every
 * figure); the note names the update the figures are from. A second strip, str-garden-city-beach-condos.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/invest/airbnb-income/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "invest-airbnb-income");
const F = JSON.parse(fs.readFileSync(path.join(DATA, "findings.json"), "utf8"));
const STR = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "str-market.json"), "utf8"));

const must = (ok, msg) => { if (!ok) throw new Error(`airbnb-income.js: ${msg}`); };
const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const signed = (v) => (v < 0 ? "−" : "") + r100(Math.abs(v));

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* One source: str-market.json is the 2026-11-03 refresh (AirROI's October 1 update, 12 months to September 2026). */
must(STR.retrieved >= "2026-11-03" && STR.dataAsOf === "2026-10-01", "str-market.json is not the 2026-11-03 refresh: re-check every AirROI figure (VERIFY.md, the November 5 update)");
const SM = (slug) => { const m = STR.markets.find((x) => x.slug === slug); must(m, `str-market.json has no ${slug}`); return m; };
const T = Object.fromEntries(F.towns.map((t) => [t.slug, t]));
/* findings.json and str-market.json must agree on every figure both hold (rows 1, 2, 9). */
F.towns.forEach((t) => { const s = SM(t.slug);
  must(s.revenue === t.gross_avg && s.listings === t.listings && s.adr === t.adr && s.occupancy === t.occupancy_pct
    && s.median === t.month_median && s.bottom25 === t.month_bottom25 && s.top25 === t.month_top25 && s.top10 === t.month_top10, `str-market.json and findings.json disagree (${t.slug})`); });
must(F.towns.length === 8, "eight towns");
const MB = T["myrtle-beach"], NMB = T["north-myrtle-beach"], MI = T["murrells-inlet"], GC = T["garden-city"], PI = T["pawleys-island"], LR = T["little-river"], CW = T["conway"], SB = T["surfside-beach"];

/* Row 2: town by town, all sizes. */
must(MI.gross_avg === 47603 && SB.gross_avg === 42902 && GC.gross_avg === 41223 && NMB.gross_avg === 34401 && PI.gross_avg === 31430 && MB.gross_avg === 25807 && CW.gross_avg === 23426 && LR.gross_avg === 14963, "row 2 gross changed");
must(MB.occupancy_pct === 36.3 && MB.listings === 8698 && CW.listings === 106 && LR.listings === 169, "row 2 occupancy and listings changed");
/* Row 3: no Carolina Forest market. */
must(STR.noMarket.some((x) => x.slug === "carolina-forest"), "row 3: Carolina Forest has a market now");
/* Row 4: what kind of homes the listings are. */
must(MB.condo_pct === 80.6 && MI.house_pct === 59.8, "row 4 changed");
/* Rows 5 and 6: by size. */
const SZ = (t, k) => t.by_size[k] || null;
must(SZ(MB, "2").average === 25100 && SZ(MB, "2").median === 20100 && SZ(MB, "3").average === 37100 && SZ(MB, "4").average === 57400, "row 5 changed");
must(SZ(NMB, "2").average === 20700 && SZ(NMB, "2").median === 14900 && SZ(MI, "2").average === 27900 && SZ(MI, "2").median === 27500, "row 6/8 changed");
must(SZ(GC, "5+").average === 98400 && SZ(GC, "4").listings === 19 && SZ(LR, "4").listings === 11 && !SZ(CW, "4") && !SZ(LR, "5+"), "row 6 small groups changed");
/* Row 7 (CORRECTED): the ranges for two and three bedrooms, Little River left out; the four-bedroom range in the five towns with 50 or more. */
must(F.size.two_bed_avg_range_excl_little_river.join() === "20700,27900" && F.size.three_bed_avg_range_excl_little_river.join() === "27800,38700", "row 7 ranges changed");
must(F.size.mi_over_mb_all_sizes === 1.84 && F.size.mi_over_mb_two_bed === 1.11, "row 7 multiples changed");
const FOUR_BIG = F.towns.filter((t) => SZ(t, "4") && SZ(t, "4").listings >= 50).map((t) => SZ(t, "4").average);
must(FOUR_BIG.length === 5 && Math.min(...FOUR_BIG) === 41600 && Math.max(...FOUR_BIG) === 73300, "four-bedroom range: five towns, $41,600 to $73,300");
/* Row 8 (CORRECTED): the middle two-bedroom against the average. */
const BELOW = F.towns.filter((t) => t.slug !== "murrells-inlet").map((t) => t.two_bed_median_below_avg_pct);
must(MI.two_bed_median_below_avg_pct === 1 && Math.min(...BELOW) === 12 && Math.max(...BELOW) === 31, "row 8: 1 percent, and 12 to 31 percent");
must(F.towns.every((t) => SZ(t, "2").median < SZ(t, "2").average), "row 8: the middle two-bedroom is below the average in every town");
/* Row 6: bigger homes, two to four times a two-bedroom in the same town. */
const MULT = F.towns.flatMap((t) => ["4", "5+"].filter((k) => SZ(t, k) && SZ(t, k).listings >= 30).map((k) => SZ(t, k).average / SZ(t, "2").average));
must(Math.min(...MULT) > 1.75 && Math.max(...MULT) < 4.3, "row 6: about two to four times");
/* Row 9: a month. */
must(MB.month_median === 2530 && MB.month_bottom25 === 1270 && MB.month_top25 === 4330 && MB.month_top10 === 6770, "row 9 changed");
/* Rows 10 and 15: the top-quarter mark, all sizes, run all year. */
must(MB.top_quarter_gross === 44250, "row 10 changed");
/* Row 11: the months. */
const MO = MB.months;
must(MO.length === 12 && MO[6].month === "July" && MO[6].gross === 6800 && MO[0].month === "January" && MO[0].gross === 1340, "row 11 changed");
must(SM("myrtle-beach").peakRevenue === 6800 && SM("myrtle-beach").lowRevenue === 1340, "row 11: str-market.json peak and low");
must(Math.round(MO[6].gross / MO[0].gross) === 5, "row 11: about five times");
/* Row 12 (CORRECTED): summer shares. */
must(MB.summer_share_pct === 47 && PI.summer_share_pct === 37 && Math.min(...F.towns.map((t) => t.summer_share_pct)) === 37, "row 12 changed");
/* Rows 19 and 20 (CORRECTED): the two worked condos, the same arithmetic as /invest/str-tools/. */
const W = F.worked, WG = W.garden_city_2br, WM = W.myrtle_beach_oceanfront_2br, WGM = W.garden_city_2br_manager15;
must(WG.gross === 26843 && WG.before_bills === 16911 && WG.bills === 11792 && WG.kept === 5119 && WG.nights === 95 && WG.rate === 243 && WG.hoa === 6900 && WG.tax === 4272 && WG.ins_permit === 620, "row 20 changed");
must(WGM.kept === 1656 && WGM.manager_pct === 15, "row 20 manager changed");
must(WM.gross === 25200 && WM.before_bills === 15876 && WM.bills === 20085 && WM.kept === -4209 && WM.nights === 87 && WM.rate === 252 && WM.hoa === 14700 && WM.tax === 4995 && WM.ins_permit === 390, "row 19 changed");
must(WG.price_median === 343500 && WM.price_median === 327000 && WG.hoa_month === 575 && WM.hoa_month === 1225, "rows 19, 20: prices and fees changed");
/* Row 19 corrections: "about $4,000 short" and "about $4,500" open all year (the str-tools wording); HOA "about $1,200 a month". */
must(Math.abs(WM.hoa / WM.bills - 0.73) < 0.01, "row 19: the HOA fee is about 73 percent of the bills");
const MB_SHORT = r1k(-WM.kept), MB_FULL_YEAR = "$4,500", GC_KEPT = r1k(WG.kept);
must(MB_SHORT === "$4,000" && GC_KEPT === "$5,000" && WGM.kept < 2000, "rows 19, 20: the rounded figures");
/* Rows 21 to 23: managers. */
must(F.manager_published.low_pct === 10 && F.manager_published.high_pct === 25, "row 21 changed");
must(Math.round(STR.management.basicLow) === 13 && Math.round(STR.management.basicHigh) === 17 && STR.management.fullServiceBase === "gross profit", "row 22 changed");
/* Row 24: listing growth (the Myrtle Beach area). Typed: str-market.json holds it, and the verifier read the page. */
must(SM("myrtle-beach").supplyGrowth === 43, "row 24 changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CSS = "<style>"
  /* The headline: the italic line at about half the H1's size. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} h2{text-wrap:balance}`
  /* Tables without cards, under thin rules. */
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} td{font-variant-numeric:tabular-nums}${TBL} td:not(:first-child),${TBL} th:not(:first-child){text-align:right!important;white-space:nowrap}`
  + `${TBL} td:first-child{color:var(--navy)!important}`
  + `@media (max-width:599px){${TBL} table{font-size:.95rem!important}${TBL} th,${TBL} td{padding:.5rem .3rem!important}${TBL} th{font-size:.8rem!important;letter-spacing:0!important;text-transform:none!important;vertical-align:bottom}${TBL} th:first-child,${TBL} td:first-child{width:36%}}`
  + `${S} .ai-cap{display:block;color:var(--navy);font-weight:600;font-size:1.05rem;line-height:1.4;margin:1.6rem 0 .1rem;max-width:720px}`
  + `${S} .ai-note{color:var(--muted);font-size:.95rem;line-height:1.55;margin:-.4rem 0 1.4rem;max-width:720px}`
  /* One block width. */
  + `${S} .c3-gchart,${S} div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box}`
  /* The size table: plain, under thin rules; on a phone each town is a name over three labelled figures. */
  + `${S} .ai-sz{width:100%;max-width:720px;border-collapse:collapse;margin:.6rem 0 1rem;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .ai-sz th,${S} .ai-sz td{padding:.55rem .4rem;border-bottom:${RULE};text-align:right;vertical-align:top;line-height:1.35;font-variant-numeric:tabular-nums;white-space:nowrap}`
  + `${S} .ai-sz th:first-child{text-align:left;padding-left:0;white-space:normal}${S} .ai-sz td:last-child,${S} .ai-sz th:last-child{padding-right:0}`
  + `${S} .ai-sz thead th{font-size:.95rem;font-weight:600;border-bottom:1px solid rgba(28,32,40,.3)}${S} .ai-sz tbody th{font-weight:500}${S} .ai-sz .l{display:none}`
  + `@media (max-width:599px){${S} .ai-sz,${S} .ai-sz tbody{display:block;width:100%}${S} .ai-sz thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .ai-sz tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:.6rem;padding:.6rem 0;border-bottom:${RULE}}${S} .ai-sz th,${S} .ai-sz td{border:0;padding:0;text-align:left}`
  + `${S} .ai-sz tbody th{grid-column:1/-1;font-weight:600;padding-bottom:.2rem}${S} .ai-sz .l{display:block;font-size:.875rem;color:var(--muted)}}`
  /* Plain lists under thin rules; the story under a brass rule. */
  + `${S} .ai-list{list-style:none;margin:1rem 0 1.4rem;padding:0;max-width:720px;border-bottom:${RULE}}`
  + `${S} .ai-list li{margin:0;padding:.75rem 0 .8rem;border-top:${RULE};color:var(--muted);line-height:1.7;font-size:var(--read,1.0625rem)}`
  + `${S} .ai-list b{display:block;color:var(--navy);font-family:var(--sans);font-weight:600;margin-bottom:.15rem}`
  + `${S} .ai-story{max-width:720px;margin:1.4rem 0 1.4rem;padding:.2rem 0 .2rem 1.2rem;border-left:3px solid var(--brass);color:var(--navy);line-height:1.75;font-size:var(--read,1.0625rem)}`
  /* The month chart: text 15 to 17 px at every width. */
  + `${S} svg.ai-cols{display:block;width:100%;height:auto}${S} svg.ai-cols text{font-family:var(--sans),system-ui,sans-serif;font-size:17px;fill:#4a5763}`
  + `${S} svg.ai-cols text.v{font-weight:700;fill:#1c2028}`
  + `@media (min-width:700px){${S} svg.ai-cols{max-width:560px;margin:0 auto}${S} svg.ai-cols text{font-size:10px}}`
  /* The end band (the same fix as /submarkets/garden-city/). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}}`
  + "@media (min-width:1000px) and (max-width:1100px){.header-inner nav.primary{gap:2.2rem}}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Chart 1: the towns, all sizes (row 2), high to low.                            */

const NAME = { "myrtle-beach": "Myrtle Beach area", "garden-city": "Garden City Beach" };
const FEATURE = { "murrells-inlet": "most listings are houses", "myrtle-beach": "4 in 5 listings are condos", "conway": "few listings", "little-river": "few listings" };
const BY_GROSS = F.towns.slice().sort((a, b) => b.gross_avg - a.gross_avg);
must(BY_GROSS[0] === MI && BY_GROSS[7] === LR, "chart 1: Murrells Inlet first, Little River last");
/* Exact figures, as AirROI prints them: build.js check requires every revenue in str-market.json and the four Myrtle Beach
   monthly percentiles to appear on this page exactly (the strdata gate). Prose rounds to the nearest $1,000. */
const TOWN_CHART = G.bars(BY_GROSS.map((t) => Object.assign({ name: NAME[t.slug] || t.name, href: t.page, value: t.gross_avg, valueText: money(t.gross_avg) },
  FEATURE[t.slug] ? { feature: FEATURE[t.slug] } : {})),
{ caption: "Murrells Inlet's average Airbnb took in nearly twice the Myrtle Beach area's", nameLabel: "Town", featureLabel: "the homes", valueLabel: "a year from guests", compact: true,
  note: "What the average Airbnb took in over a year, all sizes: money from guests, cleaning fees included, before any cost. AirROI, 12 months to September 2026. Its areas do not follow city limits." });
must(Math.abs(MI.gross_avg / MB.gross_avg - 1.84) < 0.01, "chart 1 title: nearly twice");

/* ---------------------------------------------------------------------------- */
/* Table: by size (rows 5, 6), in the chart's order.                              */

const SIZES = ["2", "3", "4"];
const FEW = 30; /* "thirty" in the note below */
const cellOf = (t, k) => { const c = SZ(t, k); return c ? r100(c.average) + (c.listings < FEW ? "*" : "") : "none"; };
const SIZE_TABLE = `<span class="ai-cap" id="ai-size-cap">What the average Airbnb took in a year, by bedrooms</span>`
  /* A real table on every screen; on a phone each row is the town's name over its three figures, each with a small label. */
  + `<table class="ai-sz" aria-labelledby="ai-size-cap"><thead><tr><th scope="col">Town</th>${SIZES.map((k) => `<th scope="col">${k} bedrooms</th>`).join("")}</tr></thead><tbody>`
  + BY_GROSS.map((t) => `<tr><th scope="row">${NAME[t.slug] || t.name}</th>${SIZES.map((k) => `<td><span class="l" aria-hidden="true">${k} bedrooms</span>${cellOf(t, k)}</td>`).join("")}</tr>`).join("")
  + `</tbody></table>`
  + `<p class="ai-note">Condos and houses together, cleaning fees included, before any cost. * Fewer than thirty listings. Conway has no four-bedroom listings in the data.</p>`;
must(cellOf(GC, "4").endsWith("*") && cellOf(LR, "4").endsWith("*") && cellOf(CW, "2").endsWith("*") && cellOf(CW, "4") === "none", "table: the small groups are marked");

/* ---------------------------------------------------------------------------- */
/* Chart 2: the months, Myrtle Beach area (row 11). Columns; values on July and January only. */

const MONTH_CHART = (() => {
  const W0 = 360, H0 = 230, L0 = 58, R0 = 354, T0 = 30, B0 = 196, MAX = 7000, bw = (R0 - L0) / 12;
  const Y = (v) => B0 - v / MAX * (B0 - T0), f1 = (v) => Math.round(v * 10) / 10;
  const grid = [0, 3000, 6000].map((v) => `<line x1="${L0}" x2="${R0}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="#1c2028" stroke-opacity="${v ? ".12" : ".35"}"/><text x="${L0 - 6}" y="${f1(Y(v) + 5)}" text-anchor="end">${v ? "$" + v / 1000 + "k" : "$0"}</text>`).join("");
  const summer = ["June", "July", "August"];
  const cols = MO.map((r, i) => { const x = L0 + i * bw + bw * 0.14, w = bw * 0.72, lab = r.month === "July" || r.month === "January";
    return `<rect x="${f1(x)}" y="${f1(Y(r.gross))}" width="${f1(w)}" height="${f1(B0 - Y(r.gross))}" rx="3" fill="${summer.includes(r.month) ? "#c4783a" : "#dcc0a3"}"/>`
      + `<text x="${f1(x + w / 2)}" y="${B0 + 22}" text-anchor="middle">${r.month[0]}</text>`
      + (lab ? `<text class="v" x="${f1(r.month === "January" ? Math.max(x + w / 2, L0 + 16) : x + w / 2)}" y="${f1(Y(r.gross) - 8)}" text-anchor="middle">${r100(r.gross)}</text>` : ""); }).join("");
  const svg = `<svg class="ai-cols" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="Column chart of what the average Myrtle Beach area Airbnb took in from guests in each month: ${MO.map((r) => `${r.month} ${r100(r.gross)}`).join(", ")}.">${grid}${cols}</svg>`;
  return `<figure class="c3-gchart"><span class="cap" aria-hidden="true">A Myrtle Beach Airbnb takes in about five times as much in July as in January</span>${svg}`
    + `<figcaption>Average from guests per Myrtle Beach area listing open that month, over the last two years. AirROI. The darker columns are June, July and August.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* The homes strip and the offers (each different words, each a request).        */

/* Owner, 2026-11-08: "horizontal idx listings is the strongest tool we have". Garden City Beach houses (the place
   /invest/str-tools/ uses: houses within 0.8 mile of the middle of Waccamaw Drive), beside the sentence on its
   five-bedroom homes. The strip cannot filter on nightly rentals, so its title says only what it finds. */
const GC_HOUSES = G.homes("str-garden-city-beach-houses", "Garden City Beach",
  "",
  "Houses for sale in Garden City Beach");
/* Review 1: the Garden City Beach condos (the place /invest/str-tools/ uses: condos within a mile of the middle of
   Waccamaw Drive), beside the answer on low-fee condos, under the title str-tools ships (row 20: the typical
   two-bedroom there keeps about $5,000 after its bills). */
const GC_CONDOS = G.homes("str-garden-city-beach-condos", "Garden City Beach",
  "",
  "Best Airbnb opportunities in Garden City Beach");

const LEAD = "/contact/";

/* A plain list under thin rules: a bold name, then its sentence. */
const plain = (rows) => `<ul class="ai-list">` + rows.map(([k, t]) => `<li><b>${k}</b><span>${t}</span></li>`).join("") + `</ul>`;
/* The one real story (story bank, boston-hotel-manager), set off by a brass rule. */
const story = (t) => `<p class="ai-story">${t}</p>`;

/* One photo, beside the sentence it shows (condos and houses): the USGS oblique aerial of oceanfront towers in
   Myrtle Beach with streets of houses behind them (public domain), recorded in /invest/str-tools/'s photos.json. */
const PHOTOS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-10-d", "invest-str-tools", "photos.json"), "utf8")).photos;
const PH = PK.create({ h, photos: PHOTOS }).photoSet({ aerialWidth: "720px" });
const TOWERS = PH.aerial("myrtle-beach-oceanfront-towers-and-houses-2011", "Oceanfront towers in Myrtle Beach, with streets of houses behind them, seen from over the ocean.");

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

/* Review 1 (VERIFY.md "Not to publish"): AirROI's November 5 update changed every figure, and the four STR pages
   move together or not at all. Until the lead refreshes data/str-market.json, the AirROI page is not linked as the
   place to check a number. The note names the update the figures come from, read from the data file. */
const AIRROI_UPDATE = (() => { const [y, m, d] = STR.dataAsOf.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }); })();
must(AIRROI_UPDATE === "October 1, 2026", "the AirROI update named in the note");
const ABNB_FEE = "https://www.airbnb.com/help/article/1857";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const T12_43 = "https://www.scstatehouse.gov/code/statmast.php?title=12&chapter=43";
const MGR_FEES = "https://www.mbvacationhomerentals.com/owners-thank-you/";
const CALC = "/invest/str-tools/";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "How Much Do Myrtle Beach Airbnbs Make? By Town and Size",
  description: `How much do Myrtle Beach Airbnbs make? About ${r100(MB.gross_avg)} a year on average. What each Grand Strand town, home size and month takes in from guests.`,
  /* The share card (Blog-Brain tools/ogcard.js, from this page's eyebrow and H1), kept in this page's images folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/invest-airbnb-income/share-card.jpg",
  ogImageAlt: "How much do Airbnbs make in Myrtle Beach, by town and size? Chapter III.",
  ogTitle: "How much do Airbnbs make in Myrtle Beach? What they take in from guests by town, size and month",
  crumb: "Airbnb Income",
  eyebrow: "Short-term rental income",
  h1: "How much do Airbnbs make in Myrtle Beach, by town and size?",
  h1em: "Most of the difference between towns is the size of the homes.",
  sub: "What the average Grand Strand Airbnb takes in from guests in a year, by town, by home size and by month.",
  heroCta: { title: "Send us a listing. We send what Airbnbs like it take in nearby.", label: "Send us a listing", href: LEAD },
  author: "devin",
  shortAnswer: [
    `The average Airbnb in the Myrtle Beach area took in about ${r100(MB.gross_avg)} from guests in a year, cleaning fees included, before any cost. An average two-bedroom took in about ${r1k(F.size.two_bed_avg_range_excl_little_river[0])} to ${r1k(F.size.two_bed_avg_range_excl_little_river[1])} a year in seven of the eight Grand Strand towns. In most of them, an average four-bedroom took in about ${r1k(Math.min(...FOUR_BIG))} to ${r1k(Math.max(...FOUR_BIG))}.`,
    /* Rows 19 and 20 as corrected: the all-year figure and the part-year case together, in the str-tools wording. */
    `What is left after the bills depends most on the HOA fee. Run by its owner, a typical two-bedroom Garden City Beach condo keeps about ${GC_KEPT} a year before any loan. A typical oceanfront one inside Myrtle Beach keeps about ${MB_FULL_YEAR} if it is open all year. Open only part of the year, at the nights the average listing books, it comes up short.`,
  ],
  sections: [
    { h2: "How much does an Airbnb make in each Grand Strand town?", toc: "By town", id: "by-town", html: () =>
      CSS + PH.css() + G.homesCss() +
      h.p(`Murrells Inlet's average Airbnb took in the most, about ${r1k(MI.gross_avg)} a year, and Little River's the least, about ${r1k(LR.gross_avg)}. The figures are from AirROI, a company that publishes Airbnb data town by town.`) +
      TOWN_CHART +
      h.p(`The gap between towns is mostly the kind of home, as the labels show. For a two-bedroom alone, Murrells Inlet took in only about a tenth more than the Myrtle Beach area.`) +
      TOWERS +
      h.p(`The average Myrtle Beach area listing was booked on about ${Math.round(MB.occupancy_pct)} percent of the nights it was open. AirROI has no Airbnb market for Carolina Forest, which is inland.`) },

    { h2: "How much does a two-, three- or four-bedroom Airbnb make in Myrtle Beach?", toc: "By size", id: "by-size", html: (bg) =>
      h.p(`For two- and three-bedroom homes, seven of the eight towns are close; Little River takes in less. An average three-bedroom took in about ${r1k(F.size.three_bed_avg_range_excl_little_river[0])} to ${r1k(F.size.three_bed_avg_range_excl_little_river[1])} a year in those seven.`) +
      SIZE_TABLE +
      h.h3("Is the average Airbnb income the typical result?") +
      h.p(`The middle two-bedroom listing takes in less than the average two-bedroom in every town, because listings that take in far more than most raise the average. In North Myrtle Beach the middle one took in about ${r1k(SZ(NMB, "2").median)}, against an average of ${r1k(SZ(NMB, "2").average)}.`) +
      h.p(`In Murrells Inlet the two are within about ${MI.two_bed_median_below_avg_pct} percent. In the other seven towns the middle two-bedroom took in ${Math.min(...BELOW)} to ${Math.max(...BELOW)} percent less than the average. Both figures also count part-year listings.`) +
      h.h3("How much more does a bigger home take in?") +
      h.p(`Bigger homes take in far more. An average listing with four bedrooms or more took in about two to four times what a two-bedroom took in, in the same town. In Garden City Beach the average five-bedroom or larger took in about ${r1k(SZ(GC, "5+").average)}.`) +
      GC_HOUSES +
      h.cta("Want homes where nightly stays are allowed?", "Tell us the town and the bedrooms. We send homes for sale there and leave out the ones whose zoning or building rules ban nightly stays.", "Send me homes for nightly rentals", LEAD, bg) },

    { h2: "How much does a Myrtle Beach Airbnb make each month?", toc: "By month", id: "by-month", html: () =>
      h.p(`In a typical month, the middle Myrtle Beach area Airbnb took in ${money(MB.month_median)} from guests. The middle half of listings took in ${money(MB.month_bottom25)} to ${money(MB.month_top25)}, and the top tenth ${money(MB.month_top10)} or more.`) +
      MONTH_CHART +
      h.p(`June, July and August bring in ${MB.summer_share_pct} percent of a year's income in the Myrtle Beach area. Pawleys Island's June, July and August bring the smallest share of its year, ${PI.summer_share_pct} percent.`) +
      h.p(`The monthly figures count only listings open that month. The yearly average is lower than a typical month would suggest, because it also counts part-year listings. A long winter stay with one guest is a ${h.a("/invest/mid-term-rentals/", "mid-term rental")}.`) },

    { h2: "What does an Airbnb manager take in Myrtle Beach?", toc: "Managers", id: "managers", html: () =>
      h.p(`Vacation rental managers here that publish their fees charge ${F.manager_published.low_pct} to ${F.manager_published.high_pct} percent of the booking.`) +
      plain([
        ["A basic plan", `In what we have seen here, a basic plan costs about ${Math.round(STR.management.basicLow)} to ${Math.round(STR.management.basicHigh)} percent. It covers marketing, guest messages and basic accounting.`],
        ["Full service", `It adds taxes, maintenance and repairs, and is priced as a share of the profit.`],
        ["A resort's rental program", `One large oceanfront resort in Myrtle Beach took 38.6 percent of gross rental income on its 2017 terms, before its other charges. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program or Airbnb")} compares the two. For one resort's rental terms, see ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort in Myrtle Beach")}.`],
      ]) +
      /* Story bank str-cheapest-cleaner (observation; Chapter3 does no property management, so nothing implies it does). */
      h.p(`If you will not be here, a manager or a cleaner you trust matters. The worst short-term rental mistake we see here is an owner running it alone with the cheapest cleaner. Theft and damage followed. Our page on ${h.a("/invest/property-management/", "property management")} covers hiring a manager.`) },

    { h2: "Is an Airbnb in Myrtle Beach a good investment?", toc: "Worth it?", id: "worth-it", html: (bg) =>
      h.p(`An Airbnb here can pay, when the HOA fee is low or the home is open all year. At the nights the average listing books, a two-bedroom condo with a low HOA fee keeps money after its bills. One in a high-fee oceanfront tower keeps money only when it is open all year.`) +
      h.p(`Our ${h.a(CALC, "Airbnb calculator")} works out what one condo keeps, with its own fee and tax, and the nights it needs to pay its bills. It also covers ${h.a(CALC + "#more-hosts", "how many more Airbnbs there are than a year ago")}.`) +
      GC_CONDOS +
      h.h3("What do the busiest Myrtle Beach Airbnbs take in?") +
      h.p(`A listing at the top-quarter mark in the Myrtle Beach area, run all year, took in about ${r1k(MB.top_quarter_gross)}.`) +
      story(`A friend who ran a hotel in Boston bought three condos in one oceanfront building. They gross about $120,000, roughly half of it profit. He now helps manage fourteen units. These are his real numbers, not a promise.`) +
      h.h3("What should you weigh next?") +
      h.ul([
        `Whether a yearly lease would keep more: our page on ${h.a("/invest/str-vs-ltr/", "an Airbnb or a long-term rental")} compares the same home both ways.`,
        `The return on the price: our ${h.a("/invest/rental-returns/", "rental returns")} page works it out by area.`,
        `Where nightly stays are allowed: our ${h.a("/invest/str-rules/", "short-term rental rules")} page lists the rules by city.`,
      ]) +
      h.cta("Weighing an Airbnb against a yearly lease?", "Send us the home. We work out what it would keep as a nightly rental and as a yearly lease, side by side.", "Have us compare both", LEAD, bg) },
  ],
  faqTitle: "Myrtle Beach Airbnb income questions",
  faq: [
    { q: "How much does an Airbnb make a month in Myrtle Beach?", a: `In a typical month, half of Myrtle Beach area listings took in more than ${money(MB.month_median)} from guests, and half took in less. July brings in about five times as much as January.` },
    { q: "How much does a four-bedroom Airbnb make in Myrtle Beach?", a: `In the Myrtle Beach area the average four-bedroom took in about ${r1k(SZ(MB, "4").average)} a year from guests, before any cost. The average two-bedroom took in about ${r1k(SZ(MB, "2").average)}.` },
    { q: "Do these Airbnb income figures include the cleaning fee?", a: "Yes. They are what guests paid, the nightly rate plus the cleaning fee, before Airbnb's fee or any other cost. The cleaning fee pays the cleaner." },
    { q: "What occupancy does a Myrtle Beach Airbnb get?", a: `Guests booked about ${Math.round(MB.occupancy_pct)} percent of the nights the average Myrtle Beach area listing was open. Our Airbnb calculator works out the nights one condo needs to pay its bills.` },
    { q: "Is there Airbnb income data for Carolina Forest?", a: "AirROI has no Airbnb market for Carolina Forest, an inland area, so there is no figure for it." },
  ],
  sources: [
    { name: "Airbnb host fees", href: ABNB_FEE },
    { name: "Horry County 2026 tax levy", href: LEVY },
    { name: "S.C. Code 12-43-220", href: T12_43 },
    { name: "A manager's published fees", href: MGR_FEES },
  ],
  sourcesNote: `Income: AirROI's update of ${AIRROI_UPDATE}, for the 12 months to September 2026, with guests' cleaning fees in the income. What a condo keeps: the arithmetic of our Airbnb calculator. Not legal or tax advice.`,
  bottomCta: { h2: "Want these numbers for one address?", p: "Send us the address. We work out what Airbnbs like it take in nearby and what it would keep after its bills. Call 854.333.2135. We answer evenings.", label: "Send us an address", href: LEAD },
  keywords: "how much do Airbnbs make in Myrtle Beach, Myrtle Beach Airbnb income, Myrtle Beach average Airbnb gross income, Myrtle Beach Airbnb revenue by month, North Myrtle Beach Airbnb income, Murrells Inlet Airbnb income, Surfside Beach Airbnb income, how much does a 2 bedroom Airbnb make Myrtle Beach, how much does a 4 bedroom Airbnb make Myrtle Beach, Myrtle Beach Airbnb data",
  afterSources: () => PH.credits(),
  about: "Airbnb and short-term rental income in Myrtle Beach and the Grand Strand, South Carolina",
});
