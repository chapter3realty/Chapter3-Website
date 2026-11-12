/* /market-reports/ - the Myrtle Beach market report hub: the latest month's median prices for houses and condos,
 * whether prices are dropping (three years of CCAR bars), how long homes take to get an accepted offer, how many are
 * for sale, the 12 months in one chart and its table, why websites give different medians, and every report we publish.
 *
 * Batch 2026-11-b, Lane U. The live hub was hand-made HTML (no spec); this is its first spec. URL kept.
 * Plan: Blog-Brain batches/2026-11-b/market-reports/PLAN.md. Demand: must-answer.md.
 * Facts: facts.md, VERIFIED rows and CORRECTED rows (8, 9, 14, 15) only, in the verifier's wording (VERIFY.md).
 * Rows 19 and 20 are struck: no "illustrative", no "three months", no rates, no forecast. Struck wording:
 * batches/2026-11-b/facts/market-reports-struck.json.
 * Data, never typed (website working copy): data/2026-11-b/market-reports/market.json (CCAR Monthly Indicators,
 * September 2026, made by build_market.py, which checks the PDF's sha256). The month name comes from meta.data_month.
 * The deed medians (FAQ and the "why websites differ" answer) come from data/2026-10-d/sell-home-value/findings.json,
 * the Myrtle Beach area's ZIP codes from data/2026-11-b/sell/ccar-2026-09.json. The spec throws if a ledger value moves.
 * Two year-over-year facts from CCAR's monthly tables are not in market.json; they are typed at the verifier's wording,
 * with the row number beside them (rows 8 and 9).
 * Design, as /sell/ and /submarkets/garden-city/ (owner-approved 2026-11-08): the answer first, question headings,
 * charts from data, one card style for the charts and the offers, plain tables and lists under thin rules, the italic
 * line at about half the H1's size, one block width of 720 px, an offer after about every second section.
 * Homes: the site's edge puts "New this week on the Grand Strand" (idx-lib/feeds.js "/market-reports/") under the
 * opening. One glass.js strip, in the "dropping" section: oceanfront condos with a price cut (place mr-oceanfront-condos-cut,
 * listed in BUILD.md for the lead; until it exists, its fallback offer shows).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/market-reports/";
const ROOT = path.join(__dirname, "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", f), "utf8"));
const M = read("2026-11-b/market-reports/market.json");
const HV = read("2026-10-d/sell-home-value/findings.json");
const SELLCCAR = read("2026-11-b/sell/ccar-2026-09.json");
const must = (ok, msg) => { if (!ok) throw new Error(`market-reports.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r100 = (v) => n0(Math.round(v / 100) * 100);

/* ---- The month, from the data file. ---- */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [DY, DM] = M.meta.data_month.split("-").map(Number);
const MONTH = `${MONTHS[DM - 1]} ${DY}`;                       // "September 2026"
const MON = MONTHS[DM - 1];                                     // "September"
const YTD = `January to ${MON}`;
must(M.meta.sha256.startsWith("1c71eff8") && MONTH === "September 2026", "the CCAR file or month moved: re-verify rows 1 to 12 before the next build");
const [cy, cm, cd] = M.meta.current_as_of.split("-").map(Number);
const CURRENT_AS_OF = `${MONTHS[cm - 1]} ${cd}, ${cy}`;
const mon = (k) => { const [m, y] = k.split("-"); const i = MONTHS.findIndex((x) => x.startsWith(m)); must(i >= 0, `month ${k}`); return { long: `${MONTHS[i]} ${y}`, short: `${m} ${y}`, m }; };

/* ---- Rows 1, 3, 4, 5, 6: the month now. ---- */
const HO = M.now.house, CO = M.now.condo;
must(HO.median_sep === 370000 && CO.median_sep === 230125 && HO.median_ytd === 362000 && CO.median_ytd === 232000, "row 1 moved");
must(HO.days_to_offer_ytd === 122 && CO.days_to_offer_ytd === 131 && HO.days_to_offer_sep === 118 && CO.days_to_offer_sep === 137, "row 3 moved");
must(HO.pct_of_list_ytd === 97.3 && CO.pct_of_list_ytd === 96.0 && HO.pct_of_list_sep === 97.3 && CO.pct_of_list_sep === 95.9, "row 4 moved");
must(HO.months_supply_sep === 4.2 && CO.months_supply_sep === 7.5, "row 5 moved");
must(HO.for_sale_sep === 3855 && CO.for_sale_sep === 3235, "row 6 moved");
/* Rows 5 and 9 in other words (fix round 1): "almost twice as long" (7.5 / 4.2 = 1.8), "fewer houses than a year
   before, and the same number of condos" (3,855 against 3,994; 3,235 both years). */
const SUPPLY_RATIO = CO.months_supply_sep / HO.months_supply_sep;
must(SUPPLY_RATIO >= 1.75 && SUPPLY_RATIO < 2, "row 5: condo supply is no longer almost twice the house supply");
must(r100(HO.for_sale_sep + CO.for_sale_sep) === "7,100", "row 22: no longer about 7,100 houses and condos for sale");
const ABOUT_MONTHS = Math.round(HO.days_to_offer_ytd / 30.4);
must(ABOUT_MONTHS === 4, "row 3: no longer about four months");
const pct1 = (v) => v.toFixed(1);

/* ---- Row 7: the three-year medians, January to September. ---- */
const T = M.three_years, YRS = ["2024", "2025", "2026"];
const MPH = T.median_price.single_family.jan_to_sep, MPC = T.median_price.condo.jan_to_sep;
must(YRS.map((y) => MPH[y]).join() === "360000,365000,362000" && YRS.map((y) => MPC[y]).join() === "247500,239000,232000", "row 7 moved");
must(MPC["2026"] < MPC["2025"] && MPC["2025"] < MPC["2024"], "row 7: condos no longer fell two years in a row");
const CONDO_DOWN = Math.round(-M.derived.condo_median_ytd_2024_to_2026_pct);
must(CONDO_DOWN === 6 && Math.abs(M.derived.house_median_ytd_2024_to_2026_pct) < 1, "row 7: no longer about 6 percent and about flat");

/* ---- Row 10: accepted offers on condos, January to September. ---- */
const AOC = T.accepted_offers.condo.jan_to_sep;
must(AOC["2026"] === 4105 && AOC["2025"] === 3878 && AOC["2024"] === 4065 && M.derived.condo_accepted_offers_ytd_most_of_three_years, "row 10 moved");

/* ---- Row 8: the 12 monthly medians (the verifier's wording; the 10-of-12 count is from CCAR's p. 8 table). ---- */
const MP = M.monthly.median_price, MS = M.monthly.months_supply;
must(MP.length === 12 && MS.length === 12 && MP.every((r, i) => r.month === MS[i].month), "row 8: the 12 months changed shape");
const RNG = M.derived.monthly_median_range;
must(RNG.house.low === 350000 && RNG.house.high === 371250 && RNG.condo.low === 220000 && RNG.condo.high === 248500, "row 8 range moved");
const CONDO_BELOW_YEAR_BEFORE = 10;                                                    // row 8, CORRECTED: 10 of the 12 months
const FIRST = mon(MP[0].month).long, LAST = mon(MP[11].month).long;
must(FIRST === "October 2025" && LAST === "September 2026", "row 8: the 12 months moved");

/* ---- Row 9: three Septembers of homes for sale and months of supply (CORRECTED wording). ---- */
const FSH = T.for_sale.single_family.september, FSC = T.for_sale.condo.september;
const SUH = T.months_supply.single_family.september, SUC = T.months_supply.condo.september;
must(YRS.map((y) => FSH[y]).join() === "3479,3994,3855" && YRS.map((y) => FSC[y]).join() === "2886,3235,3235", "row 9 for sale moved");
must(YRS.map((y) => SUH[y]).join() === "3.9,4.3,4.2" && YRS.map((y) => SUC[y]).join() === "6.8,7.9,7.5", "row 9 supply moved");
must(FSH["2026"] < FSH["2025"] && FSC["2026"] === FSC["2025"], "row 9: no longer fewer houses and the same number of condos than a year before");
const SUPPLY_LOWER_SINCE = { house: "April", condo: "May" };  /* this year, 2026 */                   // row 9, CORRECTED (CCAR p. 13 monthly table)

/* ---- Rows 13 to 15: why websites differ. ---- */
const DC = HV.county_all;
must(DC.resale_house.n === 6866 && DC.resale_house.median === 350000 && DC.resale_condo.n === 4181 && DC.resale_condo.median === 215000, "row 14 moved");
const MB_ZIPS = SELLCCAR.areas["Myrtle Beach"].zips;
must(MB_ZIPS === "29572 and 29577", "row 15 moved");

/* ---- Row 21 (fix round 1, VERIFIED-BY-FIXER): the oceanfront condos' wow line, from /submarkets/myrtle-beach/'s ledger
   (batch 2026-11-a row 9, verified 2026-11-02) and its data file. Inside the city only; no count on this page. ---- */
const OCF = read("2026-11-a/submarkets-myrtle-beach/findings.json").listings.oceanfront_condos_inside;
must(OCF.n === 668 && OCF.in_str_zone === 667 && OCF.in_str_zone / OCF.n >= 0.95, "row 21: no longer nearly every oceanfront condo inside the city in a nightly-rental zone");

/* ---- Rows 17 and 18: the two other reports, read from their own pages (and the June data file). ---- */
const pageOf = (u) => fs.readFileSync(path.join(ROOT, "chapter3realty", ...u.split("/").filter(Boolean), "index.html"), "utf8");
const pubMonth = (html, u) => { const m = html.match(/"datePublished":\s*"(\d{4})-(\d{2})-\d{2}"/); must(m, `${u}: no datePublished`); return `${MONTHS[+m[2] - 1]} ${m[1]}`; };
const JULY_URL = "/market-reports/july-2026/"; /* The election guide was taken down (owner, 2026-11-07); its row is gone. */
const JULY = pageOf(JULY_URL);
const JUNE_FILE = path.join(ROOT, "data", "2026-11-b", "market-reports-july-2026", "june.json");
const JUNE = fs.existsSync(JUNE_FILE) ? JSON.parse(fs.readFileSync(JUNE_FILE, "utf8")).meta.data_month_name : "June 2026";
must(JUNE === "June 2026" && JULY.includes("June 2026"), "row 17: the July report no longer covers June 2026");

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const CCAR = M.meta.listed_on;
const CCAR_PDF = M.meta.url;
const CCAR_FAQ = "https://www.ccarsc.org/pages/mls-faqs/";
const CCAR_AREAS = "https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_All_Cities.pdf";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const DEEDS_GOV = "https://www.horrycountysc.gov/departments/register-of-deeds/";
must(CCAR === "https://www.ccarsc.org/pages/marketstats/" && /October_2026_Monthly_Market_Report\.pdf$/.test(CCAR_PDF), "the CCAR links moved");
const CONTACT = "/contact/";

/* ---------------------------------------------------------------------------- */
/* V1 (fix round 1): selling speed, the year so far and September alone side by side (rows 3 and 4). It replaces
   the "September at a glance" table: its prices repeated the short answer, its supply and homes for sale repeated
   the three-September table, and its 95.9 percent beside the text's 96.0 percent read as two numbers for one thing. */
must(CO.days_to_offer_ytd > HO.days_to_offer_ytd, "row 3: condos no longer took a little longer than houses");
const SPEED_GROUPS = [
  ["Days to an accepted offer", [[YTD, n0(HO.days_to_offer_ytd), n0(CO.days_to_offer_ytd)], [`${MON} alone`, n0(HO.days_to_offer_sep), n0(CO.days_to_offer_sep)]]],
  ["Share of asking price paid", [[YTD, `${pct1(HO.pct_of_list_ytd)}%`, `${pct1(CO.pct_of_list_ytd)}%`], [`${MON} alone`, `${pct1(HO.pct_of_list_sep)}%`, `${pct1(CO.pct_of_list_sep)}%`]]],
];
const SPEED_TABLE = `<div class="mr-tw"><table class="mr-tab mr-two"><caption>How fast homes sold, and for how much of the asking price</caption>`
  + `<thead><tr><th scope="col"><span class="sr">Period</span></th><th scope="col">Houses</th><th scope="col">Condos</th></tr></thead>`
  + SPEED_GROUPS.map(([g, rows]) => `<tbody><tr class="g"><th scope="colgroup" colspan="3">${g}</th></tr>`
    + rows.map(([q, a, b]) => `<tr><th scope="row">${q}</th><td>${a}</td><td>${b}</td></tr>`).join("") + `</tbody>`).join("")
  + `</table><p class="nt">The share is of the last asking price, after any price cuts. CCAR MLS sales, Horry and Georgetown Counties.</p></div>`;

/* V2: three years of medians, January to September (row 7). Fix round 1: bars from zero made $247,500, $239,000 and
   $232,000 look the same length, so the picture did not show the fall its title states. Now two short lines of three
   dots, each dot labelled, each line named at its end, on the same $200,000 to $400,000 scale as the 12-month chart.
   Drawn twice so the text stays 12 px or more on a 320 px phone. */
const HC = "#c4783a", CC_ = "#2b4c7e", HC_TXT = "#8a5226";
const dotsSvg = (W, fs, cls) => {
  const H = Math.round(W < 400 ? W * 0.8 : W * 0.4), lo = 200000, hi = 400000, y0 = fs * 2.2, y1 = H - fs * 3.1;
  const xs = W < 400 ? [fs * 2.9, W * 0.42, W * 0.68] : [W * 0.12, W * 0.42, W * 0.72];
  const nameX = xs[2] + fs * 2.2;
  const Y = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0), f1 = (v) => v.toFixed(1);
  const series = (vals, color, txt, name, above) =>
    `<path d="${vals.map((v, i) => `${i ? "L" : "M"}${f1(xs[i])} ${f1(Y(v))}`).join("")}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
    + vals.map((v, i) => `<circle cx="${f1(xs[i])}" cy="${f1(Y(v))}" r="5" fill="${color}"/>`
      + `<text x="${f1(xs[i])}" y="${f1(above ? Y(v) - fs * 0.85 : Y(v) + fs * 1.6)}" text-anchor="middle" font-size="${fs}" fill="${txt}" stroke="#fbf8f3" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${money(v)}</text>`).join("")
    + `<text x="${f1(nameX)}" y="${f1(Y(vals[2]) + fs * 0.35)}" font-size="${fs}" font-weight="700" fill="${txt}">${name}</text>`;
  const years = YRS.map((y, i) => `<text x="${f1(xs[i])}" y="${f1(H - fs * 0.5)}" text-anchor="middle" font-size="${fs}" fill="#4a4f5c">${y}</text>`).join("");
  const label = `Dot chart of the median sale price from ${YTD}, 2024 to 2026. Houses: ${YRS.map((y) => money(MPH[y])).join(", ")}. Condos: ${YRS.map((y) => money(MPC[y])).join(", ")}.`;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">`
    + `<line x1="0" x2="${W}" y1="${f1(H - fs * 1.9)}" y2="${f1(H - fs * 1.9)}" stroke="#1c2028" stroke-opacity=".16"/>${years}`
    + series(YRS.map((y) => MPH[y]), HC, HC_TXT, "Houses", true)
    + series(YRS.map((y) => MPC[y]), CC_, CC_, "Condos", false) + `</svg>`;
};
const PRICE_CHART = `<figure class="c3-gchart mr-line mr-dots"><span class="cap">House prices stayed level. Condo prices fell two years in a row.</span>`
  + dotsSvg(260, 13.5, "mr-n") + dotsSvg(620, 14, "mr-w")
  + `<figcaption>Median sale price from ${YTD} of each year. CCAR MLS sales, Horry and Georgetown Counties.</figcaption></figure>`;

/* V3: three Septembers of supply (row 9). A plain table. */
const SUPPLY_TABLE = `<div class="mr-tw"><table class="mr-tab mr-four"><caption>Months of supply grew in 2024 and 2025, then dipped in 2026.</caption>`
  + `<thead><tr><th scope="col">${MON} of</th><th scope="col">Houses for sale</th><th scope="col">Condos for sale</th><th scope="col">Months of supply, houses</th><th scope="col">Months of supply, condos</th></tr></thead><tbody>`
  + YRS.map((y) => `<tr><th scope="row">${y}</th><td><span class="l">Houses for sale</span>${n0(FSH[y])}</td><td><span class="l">Condos for sale</span>${n0(FSC[y])}</td><td><span class="l">Months of supply, houses</span>${pct1(SUH[y])}</td><td><span class="l">Months of supply, condos</span>${pct1(SUC[y])}</td></tr>`).join("")
  + `</tbody></table><p class="nt">Homes for sale at the end of ${MON} of each year. CCAR MLS, Horry and Georgetown Counties.</p></div>`;

/* V4: the 12 months as two lines (row 8), drawn twice so the text stays 13 to 16 px: a phone one and a wide one
   (as /sell/home-value/). Each line is named at its end; no legend. Under it, the open table of all 12 months. */
const lineSvg = (W, fs, cls) => {
  const H = Math.round(W * (W < 400 ? 0.78 : 0.5)), x0 = Math.round(fs * 5.3), x1 = W - 8, y0 = fs * 1.6, y1 = H - fs * 2.1, lo = 180000, hi = 400000;
  const X = (i) => x0 + (i / 11) * (x1 - x0), Y = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
  const f1 = (v) => v.toFixed(1);
  const path_ = (k) => MP.map((r, i) => `${i ? "L" : "M"}${f1(X(i))} ${f1(Y(r[k]))}`).join("");
  const grid = [200000, 250000, 300000, 350000, 400000].map((g) => `<line x1="${x0}" x2="${x1}" y1="${f1(Y(g))}" y2="${f1(Y(g))}" stroke="#1c2028" stroke-opacity=".1"/>`
    + `<text x="${x0 - 6}" y="${f1(Y(g) + fs * 0.35)}" text-anchor="end" font-size="${fs}" fill="#4a4f5c">${money(g)}</text>`).join("");
  const ticks = [0, 3, 6, 9].map((i) => { const k = mon(MP[i].month);
    return `<text x="${f1(X(i))}" y="${f1(H - fs * 0.45)}" text-anchor="${i === 0 ? "start" : "middle"}" font-size="${fs}" fill="#4a4f5c">${W < 400 ? k.m : k.short}</text>`; }).join("");
  const end = (k, color, name, below) => { const v = MP[11][k];
    return `<circle cx="${f1(X(11))}" cy="${f1(Y(v))}" r="4.5" fill="${color}"/>`
      + `<text x="${f1(x1)}" y="${f1(below ? Y(v) + fs * 1.55 : Y(v) - fs * 0.85)}" text-anchor="end" font-size="${fs}" font-weight="700" fill="${color}" stroke="#fbf8f3" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${name} ${money(v)}</text>`; };
  const label = `Line chart of the median sale price each month, ${FIRST} to ${LAST}. Houses stayed between ${money(RNG.house.low)} and ${money(RNG.house.high)}, ending at ${money(MP[11].house)}. Condos stayed between ${money(RNG.condo.low)} and ${money(RNG.condo.high)}, ending at ${money(MP[11].condo)}.`;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${grid}${ticks}`
    + `<path d="${path_("house")}" fill="none" stroke="${HC}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<path d="${path_("condo")}" fill="none" stroke="${CC_}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
    + end("house", "#8a5226", "Houses") + end("condo", CC_, "Condos", true) + `</svg>`;
};
const LINE_FIG = `<figure class="c3-gchart mr-line"><span class="cap">House prices stayed level this year. Condo prices dipped.</span>`
  + lineSvg(260, 13.5, "mr-n") + lineSvg(620, 14, "mr-w")
  + `<figcaption>Median sale price each month for the past 12 months, to ${MON}. CCAR MLS sales, Horry and Georgetown Counties.</figcaption></figure>`;
/* Fix round 1: prices only. The two supply columns made the table 348 px wide in a 320 px window, and the section
   is about prices; months of supply is said once, in "How many homes are for sale". */
const MONTH_TABLE = `<div class="mr-tw"><table class="mr-tab mr-mon"><caption>Median sale price every month, ${FIRST} to ${LAST}</caption>`
  + `<thead><tr><th scope="col">Month</th><th scope="col">Houses</th><th scope="col">Condos</th></tr></thead><tbody>`
  + MP.map((r) => `<tr><th scope="row">${mon(r.month).short}</th><td>${money(r.house)}</td><td>${money(r.condo)}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* The homes strip (the owner, 2026-11-08 and 2026-11-10: the strip is the strongest offer, its title bold and true). */
const STRIP = G.homes("mr-oceanfront-condos-cut", "oceanfront condos with a price cut",
  G.offer("oceanfront condos with a price cut", { label: "Send me oceanfront condos with a price cut", href: CONTACT }),
  "Oceanfront condos already priced below where they started");

/* One photo: oceanfront condo towers (USGS, public domain; record from /submarkets/myrtle-beach/), beside the condo
   strip it shows the kind of home of. It shows the subject of its section (P10), not a mood. */
const PHOTOS = read("2026-11-a/submarkets-myrtle-beach/photos.json").photos;
const TOWERS = PHOTOS.find((r) => r.file.endsWith("/oceanfront-towers-from-the-ocean-1200w.webp"));
must(TOWERS && /public domain/i.test(TOWERS.license), "no public-domain record for oceanfront-towers-from-the-ocean");
const TOWERS_CAP = "Oceanfront condo towers on the beach in Myrtle Beach.";
const TOWERS_PHOTO = PH.heroPhoto(TOWERS, { alt: TOWERS.alt, caption: TOWERS_CAP, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.5rem;');
const CREDITS_NOTE = '<div role="listitem">Chapter3 Realty resized these photos and cropped some of them.</div>';
const CREDITS_RAW = PH.creditsList([{ photo: TOWERS, caption: "Oceanfront condo towers on the beach in Myrtle Beach" }]);
must(CREDITS_RAW.includes(CREDITS_NOTE) && /resized the photo/.test(CREDITS_RAW), "photo credits: the note of changes moved");
/* One public-domain photo, whose own line already says what was changed: the generic second line is left out. */
const CREDITS = CREDITS_RAW.replace(CREDITS_NOTE, "");

/* The reports, newest first, and the related numbers on other pages: plain lists under thin rules. */
const REPORTS = `<div class="mr-tw"><table class="mr-tab mr-four mr-rep"><caption>Our market reports, newest first</caption>`
  + `<thead><tr><th scope="col">Report</th><th scope="col">Month</th><th scope="col">What it covers</th></tr></thead><tbody>`
  + `<tr><th scope="row">This page</th><td><span class="l">Month</span>${MONTH} numbers</td><td><span class="l">What it covers</span>Prices, days to an accepted offer and homes for sale, for houses and condos, with three years of trend</td></tr>`
  + `<tr><th scope="row">${h.a(JULY_URL, "July 2026 report")}</th><td><span class="l">Month</span>${JUNE} numbers</td><td><span class="l">What it covers</span>Sales, prices and homes for sale, the median price by Grand Strand area, and building permits</td></tr>`
  + `</tbody></table></div>`;
const RELATED = [
  ["/sell/home-value/", "What homes sold for in your area", "from Horry County's deed records"],
  ["/buyers/buying-in-myrtle-beach/", "Is it a buyer's market?", "by price and by town"],
  ["/sell/best-time-to-sell/", "The best month to list", "from the county's deeds, month by month"],
  ["/sell/", "How long houses wait for an offer", "in each part of the Grand Strand, and the busiest months"],
  ["/invest/condos/", "How condo prices have done next to houses", "and whether a condo or a house is the better investment"],
  ["/sell/sell-my-condo/", "Selling a condo in Myrtle Beach", "the condo market for sellers, and pricing to the buyers a building draws"],
  ["/invest/what-is-being-built/", "How many new homes Horry County permits", "each month, and the communities approved"],
  ["/invest/rent-prices/", "What homes rent for", "by number of bedrooms and by area"],
];
const RELATED_LIST = `<ul class="mr-list mr-rel">${RELATED.map(([u, t, d]) => `<li>${h.a(u, t)}<span class="d2">${d}</span></li>`).join("")}</ul>`;

/* ---- The page's own styles: one card style (the glass surface) for the charts and the offers; tables and lists
   under thin rules; one block width of 720 px. Copied from /sell/ with this page's prefix. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  + `${S} .c3-gchart,${S} .mr-tw,${S} .mr-list,${S} .hx-strip{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  /* tables: plain, under thin rules */
  + `${S} .mr-tw{margin:1.3rem 0 1.5rem}`
  + `${S} .mr-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .mr-tab caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem;font-size:1.08rem}`
  + `${S} .mr-tab thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom;line-height:1.3}`
  + `${S} .mr-tab tbody th{text-align:left;font-weight:600;padding:.65rem .9rem .65rem 0;border-bottom:${RULE};line-height:1.35;vertical-align:top}`
  + `${S} .mr-tab td{padding:.65rem .8rem .65rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.45;color:var(--navy);font-variant-numeric:tabular-nums;white-space:nowrap}`
  + `${S} .mr-tab td .l{display:none}${S} .mr-tab .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .mr-two tbody th{width:52%;font-weight:500}${S} .mr-two td{font-weight:600}${S} .mr-two tr.g th{font-weight:600;padding:1rem 0 .35rem;border-bottom:0;width:auto}${S} .mr-two tr.g+tr th,${S} .mr-two tr.g+tr td{border-top:${RULE}}`
  + `${S} .mr-tw .nt{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.7rem 0 0}`
  /* the month table stays a table at every width, a little smaller on a phone */
  + `@media (max-width:599px){${S} .mr-mon{font-size:.9rem}${S} .mr-mon thead th{font-size:.8rem;padding-right:.45rem}${S} .mr-mon td,${S} .mr-mon tbody th{padding-right:.45rem;white-space:nowrap}${S} .mr-two td{padding-right:.6rem}${S} .mr-two tbody th{width:44%}}`
  /* the two-column and four-column tables: on a phone each row is a short card under a thin rule */
  + `@media (max-width:599px){${S} .mr-four,${S} .mr-four tbody,${S} .mr-four caption{display:block;width:100%}`
  + `${S} .mr-four thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .mr-four tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1rem;row-gap:.45rem;padding:.75rem 0;border-bottom:${RULE}}`
  + `${S} .mr-four th,${S} .mr-four td{border:0!important;padding:0;width:auto!important}${S} .mr-four tbody th{grid-column:1/-1;padding-bottom:.1rem}`
  + `${S} .mr-four td .l{display:block;font-size:.875rem;color:var(--muted);font-weight:400;white-space:normal;line-height:1.3;margin-bottom:.1rem}`
  + `${S} .mr-two tbody th{white-space:normal}${S} .mr-rep tr{grid-template-columns:1fr;row-gap:.25rem}${S} .mr-rep td .l{display:none!important}${S} .mr-rep td:nth-of-type(1){font-size:.95rem;color:${INK}}${S} .mr-four:not(.mr-rep) td{font-weight:600}${S} .mr-four:not(.mr-rep) td .l{font-weight:400}}`
  + `${S} .mr-rep td{white-space:normal}${S} .mr-rep td:last-child{color:var(--muted)}${S} .mr-rep tbody th{width:38%}`
  /* the line chart: drawn twice, the phone one up to 599 px */
  + `${S} .mr-line svg{display:block;width:100%;height:auto}${S} .mr-line svg.mr-n{max-width:340px;margin:0 auto}${S} .mr-line svg.mr-w{display:none}`
  + `@media (min-width:600px){${S} .mr-line svg.mr-n{display:none}${S} .mr-line svg.mr-w{display:block}}`
  + `${S} .mr-line .cap{display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem}`
  /* lists: plain, under thin rules, a bold lead-in or a link on each */
  + `${S} .mr-list{list-style:none;margin:1rem 0 1.4rem;padding:0}`
  + `${S} .mr-list li{margin:0;padding:.8rem 0;border-top:${RULE};line-height:1.55;font-size:1.0625rem;color:var(--muted)}`
  + `${S} .mr-list li:last-child{border-bottom:${RULE}}`
  + `${S} .mr-list b,${S} .mr-list a{display:block;font-weight:600;font-family:var(--sans);color:var(--navy);line-height:1.4;margin-bottom:.15rem}`
  + `${S} .mr-list .d{display:block;font-size:.95rem;color:${INK};margin-bottom:.2rem}`
  + `${S} .mr-rel li{padding:.65rem 0}${S} .mr-rel .d2{display:block;font-size:1rem}`
  /* Work-arounds copied from /sell/: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     the slim offer bar lined up with the text, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "@media (min-width:700px){main#main>section[style^=\"background:var(--navy)\"]:not(:last-child)>.wrap{margin-left:max(2rem,calc((100% - 1200px) / 2 + 2rem))!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. Past prices do not promise future prices. Nothing on this page is legal, tax or lending advice.</p>`;

/* The FAQ repeats only questions the page answers, said short and in other words. */
const FAQ = [
  { q: "What is the median home price in Myrtle Beach?", a: `Half of the houses sold in Horry and Georgetown Counties in ${MON} went for more than ${money(HO.median_sep)}, and half for less. For condos, the middle sale was ${money(CO.median_sep)}.` },
  { q: "Are Myrtle Beach home prices dropping?", a: `Not for houses: the median from ${YTD} was about the same in 2024, 2025 and 2026. The condo median was lower in each of the last two years than the year before.` },
  { q: "How long does it take to sell a home in Myrtle Beach?", a: `Houses took ${HO.days_to_offer_ytd} days on average from listing to an accepted offer this year, and condos ${CO.days_to_offer_ytd}. The closing comes after that.` },
  { q: "How many homes are for sale in Myrtle Beach?", a: `About ${r100(HO.for_sale_sep + CO.for_sale_sep)} houses and condos in Horry and Georgetown Counties at the end of ${MON}. At the past year's pace of accepted offers, the condos would last almost twice as long as the houses.` },
  { q: "Why do websites give different median prices?", a: `Websites count different sales and different areas. These numbers are MLS sales in two counties. County deed records also hold sales never listed, and a site's "Myrtle Beach" can be a city, a ZIP code or a whole county.` },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Market Reports", url: SELF },
  title: `Myrtle Beach Market Report: ${MONTH} Prices | Chapter3`,
  description: `Myrtle Beach market report, ${MONTH}: the median house ${money(HO.median_sep)}, the median condo ${money(CO.median_sep)}, days to an offer, months of supply, and three years of trend.`,
  ogTitle: `Myrtle Beach real estate market report, ${MONTH}: prices, time to an offer and homes for sale`,
  /* The share card (Blog-Brain tools/ogcard.js, our own text on navy; no photo), kept in this page's images folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/market-reports/market-report-share.jpg",
  crumb: "Myrtle Beach Market Report",
  eyebrow: "Market report",
  h1: `Myrtle Beach real estate market report: ${MONTH}.`,
  h1em: "Houses cost about what they did in 2024. Condos cost less, and more of them went under contract.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: `The Myrtle Beach market in ${MON}: the median house sold for ${money(HO.median_sep)} and the median condo for ${money(CO.median_sep)}.`,
  heroMedia: CSS + G.homesCss(),
  heroCta: { title: "Get this month's sales for your street or building.", label: "Send me the numbers", href: CONTACT },
  author: "devin",
  shortAnswer: [
    `In ${MONTH}, the median house sold in Horry and Georgetown Counties went for ${money(HO.median_sep)}, and the median condo for ${money(CO.median_sep)}.`,
    `House prices in this market have been about level for three years. Condos cost about ${CONDO_DOWN} percent less than in 2024, and buyers had more condo offers accepted this year than in either of the last two.`,
  ],
  sections: [
    { h2: "What is the median home price in Myrtle Beach?", toc: "Median price", id: "median-price", html: () =>
      h.p(`From ${YTD}, the median house sold for ${money(HO.median_ytd)} and the median condo for ${money(CO.median_ytd)}, close to the ${MON} figures. The median is the middle sale: half of the homes sold for more, and half for less.`) +
      h.h3("Why do other websites show a different median?") +
      h.p(`These numbers are sales through the ${h.ext(CCAR_FAQ, "CCAR MLS")}, the listing service of the local REALTOR association for Horry and Georgetown Counties. A home sold without a listing on the MLS is not in them.`) +
      h.p(`We checked ${h.ext(DEEDS_GOV, "Horry County's deed records")}, which hold those sales too. For the 12 months to ${MON}, the middle resale price there was about ${r1k(DC.resale_condo.median)} for condos and about ${r1k(DC.resale_house.median)} for the other homes, mostly houses.`) +
      h.p(`Areas differ too. CCAR's areas follow ZIP codes or MLS areas, not city limits. Its "Myrtle Beach" area is the two ZIP codes ${MB_ZIPS}.`) +
      h.p(`For ${h.a("/sell/home-value/", "what homes sold for in your area")}, from the deeds, see our home value page.`) },

    { h2: "Are Myrtle Beach home prices dropping?", toc: "Are prices dropping", id: "are-prices-dropping", html: (bg) =>
      h.p(`Myrtle Beach house prices are not dropping. The median condo price has fallen two years in a row.`) +
      PRICE_CHART +
      h.p(`A median depends on which homes sold that month, so it changes more from one month to the next. The ${YTD} figure is steadier. Our condo guide compares ${h.a("/invest/condos/", "how condo prices have done next to houses")}, over more years.`) +
      h.p(`Condo buyers did not stay away. From ${YTD} this year, sellers accepted ${n0(AOC["2026"])} offers on condos, more than in the same months of either of the last two years.`) +
      h.p(`Many condo sellers have already come down. In Horry County, more than half of the condos for sale on November 3 had cut their asking price, ${h.a("/buyers/buying-in-myrtle-beach/", "our buying guide found")}.`) +
      TOWERS_PHOTO +
      h.p(`Inside the ${h.a("/submarkets/myrtle-beach/", "city of Myrtle Beach")}, nearly every condo for sale in an oceanfront building sits where the city allows nightly rentals.`) +
      STRIP +
      h.cta("Thinking of a condo? Know its building first.", "We pull the building's recent sales, its HOA fee and its insurance before you make an offer.", "Have us check a building", CONTACT, bg) },

    { h2: "How long do homes take to sell in Myrtle Beach?", toc: "Time to sell", id: "time-to-sell", html: () =>
      h.p(`Houses took about ${ABOUT_MONTHS} months from listing to an accepted offer from ${YTD}, and condos a little longer. The closing comes after the accepted offer, on the date the contract names.`) +
      SPEED_TABLE +
      h.p(`Our selling page shows ${h.a("/sell/", "how long houses wait for an offer in each area")}, and the months buyers sign the most.`) },

    { h2: "How many homes are for sale in Myrtle Beach?", toc: "Homes for sale", id: "homes-for-sale", html: (bg) =>
      h.p(`Fewer houses were for sale at the end of ${MON} than a year before, and the same number of condos. Condos for sale would last almost twice as long as houses.`) +
      h.p(`That is months of supply: how long the homes for sale would last at the past year's pace of accepted offers, if no new homes were listed.`) +
      SUPPLY_TABLE +
      h.p(`This year, months of supply has been lower than a year before in every month since ${SUPPLY_LOWER_SINCE.house} for houses, and since ${SUPPLY_LOWER_SINCE.condo} for condos.`) +
      h.p(`Our buying guide answers ${h.a("/buyers/buying-in-myrtle-beach/", "whether it is a buyer's market, by price and by town")}.`) +
      h.cta("See new listings the day they come on.", "Tell us the town, the kind of home and your price, and we send you the new ones.", "Send me new listings", CONTACT, bg) },

    { h2: "How did Myrtle Beach home prices change month by month?", toc: "Month by month", id: "month-by-month", html: () =>
      h.p(`Over the past 12 months, the median house price stayed between about ${r1k(RNG.house.low)} and ${r1k(RNG.house.high)}. The median condo stayed between about ${r1k(RNG.condo.low)} and ${r1k(RNG.condo.high)}.`) +
      h.p(`The median condo sold for less than a year before in ${CONDO_BELOW_YEAR_BEFORE} of the last 12 months.`) +
      LINE_FIG +
      MONTH_TABLE },

    { h2: "Which Myrtle Beach market reports can I read?", toc: "All reports", id: "reports", html: () =>
      h.p(`We read CCAR's report each month and update this page when the next one is posted. Our other reports stay up, newest first. Every guide on the site is on our ${h.a("/guides/", "guides page")}.`) +
      REPORTS +
      h.h3("Related numbers on other pages") +
      RELATED_LIST },
  ],
  faqTitle: "Market report: questions",
  faq: FAQ,
  sources: [
    { name: `CCAR Monthly Indicators, ${MONTH}`, href: CCAR_PDF },
    { name: "CCAR market statistics", href: CCAR },
    { name: "CCAR MLS", href: CCAR_FAQ },
    { name: "CCAR Local Market Update", href: CCAR_AREAS },
    { name: "Horry County deeds", href: DEEDS },
  ],
  sourcesNote: `Market: CCAR's MLS sales in Horry and Georgetown Counties, current as of ${CURRENT_AS_OF}; "house" is CCAR's single-family. Deeds: our count of Horry County's deed records, ${FIRST} to ${LAST}.`,
  afterSources: () => CREDITS + PH.imageSchema([TOWERS]) + LEGAL,
  bottomCta: { h2: "Want the numbers for one street or one building?", p: "We send you the recent sales near you and the homes for sale now, and tell you what they mean for your price.", label: "Have us pull the sales near me", href: CONTACT },
  /* "Myrtle Beach condo prices" is /invest/condos/'s keyword. "are Myrtle Beach home prices dropping" is still declared by
     /sell/home-value/; it comes back here when the lead drops it there (BUILD.md, the cannibalization fix). */
  keywords: "Myrtle Beach market report, Myrtle Beach real estate market update, Myrtle Beach home prices, Myrtle Beach median home price, Myrtle Beach housing market crash, Myrtle Beach real estate price trends",
  about: "The Myrtle Beach and Horry and Georgetown County real estate market",
});
