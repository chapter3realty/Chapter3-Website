/* /market-reports/july-2026/ - the July 2026 market report, an archive of June 2026: what houses and condos sold for,
 * whether prices were falling (three first halves), whether the climb in homes for sale stopped, how many buyers had an
 * offer accepted, and the median price by Grand Strand area from January to June.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made HTML (no spec); this is its first spec. URL kept, and its
 * datePublished (2026-07-19) is kept by mkpage from the page on disk (row 21). No date is typed.
 * Plan: Blog-Brain batches/2026-11-b/market-reports-july-2026/PLAN.md. Demand: must-answer.md.
 * Facts: facts.md, VERIFIED rows and CORRECTED rows (2, 15, 17, 22) only, in the verifier's wording (VERIFY.md).
 * Row 20 (the national price) and rows 23 to 30 are struck: no rate, no Margaritaville, no "right now", no forecast.
 * Struck wording: batches/2026-11-b/facts/market-reports-july-2026-struck.json.
 * Data, never typed (website working copy): data/2026-11-b/market-reports-july-2026/june.json (CCAR Monthly
 * Indicators and Local Market Update, June 2026, and Census permits; made by build_june.py, which checks both PDFs'
 * sha256). The month name comes from meta.data_month_name. The spec throws if a ledger value moves.
 * Design, as the hub /market-reports/ (same day) and /sell/home-value/, /submarkets/garden-city/: the answer first,
 * question headings that name June 2026, charts from data, one card style for the chart and the offers, plain tables
 * and lists under thin rules, the italic line at about half the H1's size, one block width of 720 px, an offer after
 * about every second section. The hero sub is kept visible as the archive line: this is June 2026, the newest month
 * is on the hub.
 * Homes: the site's edge puts its feed under the opening (idx-lib/feeds.js "/market-reports/july-2026/", condos with
 * a price cut). One glass.js strip, in the "buyers" section: oceanfront condos under $205,000 in and around Myrtle
 * Beach (place mrj-oceanfront-condos-under-205k, listed in BUILD.md for the lead; until it exists, its fallback offer
 * shows). Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/market-reports/july-2026/";
const ROOT = path.join(__dirname, "..");
const J = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "2026-11-b", "market-reports-july-2026", "june.json"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`july-2026.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const pct1 = (v) => Number(v).toFixed(1);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r100 = (v) => n0(Math.round(v / 100) * 100);
const chgNum = (s) => { const m = String(s).replace(/\s/g, "").match(/^([+-]?\d+(?:\.\d+)?)%$/); must(m, `change "${s}" is not a percent`); return Number(m[1]); };
const abs1 = (s) => Math.abs(chgNum(s)).toFixed(1);

/* ---- The month, from the data file. ---- */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH = J.meta.data_month_name;                                  // "June 2026"
const [DY, DM] = J.meta.data_month.split("-").map(Number);
const MON = MONTHS[DM - 1], PY = String(DY - 1);                        // "June", "2025"
const YTD = `January to ${MON}`;
must(MONTH === "June 2026" && MONTH === `${MON} ${DY}`, "the month moved");
must(J.meta.ccar_files["Coastal-Carolinas_MMI_2026-06.pdf"].startsWith("c6c6d073") && J.meta.ccar_files["July_2026_All_Cities.pdf"].startsWith("205af131"), "the CCAR files moved: re-verify every row");
const [cy, cm, cd] = J.meta.ccar_current_as_of.split("-").map(Number);
const CURRENT_AS_OF = `${MONTHS[cm - 1]} ${cd}, ${cy}`;
must(CURRENT_AS_OF === "July 10, 2026", "row 21 moved");
const mon = (k) => { const [m, y] = k.split("-"); const i = MONTHS.findIndex((x) => x.startsWith(m)); must(i >= 0, `month ${k}`); return `${MONTHS[i]} ${y}`; };

/* ---- Rows 2, 4, 5, 7, 8, 9, 10, 12, 13: the overview. ---- */
const SF = J.overview.single_family, CO = J.overview.condo;
const v = (o, k, c) => o[k][c];
must(v(SF, "Closed Sales", "jun_2026") === 1127 && v(CO, "Closed Sales", "jun_2026") === 498 && SF["Closed Sales"].chg === "+6.7%" && CO["Closed Sales"].chg === "+10.2%", "row 2 moved");
must(v(SF, "Median Sales Price", "jun_2026") === 359945 && v(CO, "Median Sales Price", "jun_2026") === 244270 && SF["Median Sales Price"].chg === "-1.4%" && CO["Median Sales Price"].chg === "+2.0%", "row 4 moved");
must(v(SF, "Median Sales Price", "ytd_2026") === 359843 && v(CO, "Median Sales Price", "ytd_2026") === 232500 && SF["Median Sales Price"].ytd_chg === "-0.8%" && CO["Median Sales Price"].ytd_chg === "-3.1%", "row 5 moved");
must(v(SF, "Days on Market Until Sale", "jun_2026") === 121 && v(CO, "Days on Market Until Sale", "jun_2026") === 137, "row 7 moved");
must(v(SF, "Percent of List Price Received", "jun_2026") === 97.3 && v(CO, "Percent of List Price Received", "jun_2026") === 96.2, "row 8 moved");
must(v(SF, "Inventory of Homes for Sale", "jun_2026") === 4023 && v(CO, "Inventory of Homes for Sale", "jun_2026") === 3294 && SF["Inventory of Homes for Sale"].chg === "-3.4%" && CO["Inventory of Homes for Sale"].chg === "+0.6%", "row 9 moved");
must(v(SF, "Months Supply of Inventory", "jun_2026") === 4.3 && v(CO, "Months Supply of Inventory", "jun_2026") === 7.6, "row 10 moved");
must(v(CO, "Pending Sales", "jun_2026") === 486 && CO["Pending Sales"].chg === "+21.5%" && v(SF, "Pending Sales", "jun_2026") === 1060 && SF["Pending Sales"].chg === "+7.9%", "rows 12 and 13 moved");
must(Math.abs(v(SF, "Median Sales Price", "ytd_2026") - v(SF, "Median Sales Price", "jun_2026")) < 1000, "section 1: the first-half house median is no longer almost June's");
const ABOUT_MONTHS = Math.round(v(SF, "Days on Market Until Sale", "jun_2026") / 30.4);
must(ABOUT_MONTHS === 4, "row 7: no longer about four months");

/* ---- Rows 6, 9, 10, 12: three Junes (2024, 2025, 2026). ---- */
const T = J.three_years, YRS = ["2024", "2025", "2026"];
const yr = (arr) => Object.fromEntries(YRS.map((y, i) => [y, arr[i]]));
const MPH = yr(T["Median Sales Price"].ytd.single_family), MPC = yr(T["Median Sales Price"].ytd.condo);
const JPH = yr(T["Median Sales Price"].jun.single_family);
must(YRS.map((y) => MPH[y]).join() === "363000,362584,359843" && YRS.map((y) => MPC[y]).join() === "250000,240000,232500" && YRS.map((y) => JPH[y]).join() === "365000,365000,359945", "row 6 moved");
must(MPC["2024"] > MPC["2025"] && MPC["2025"] > MPC["2026"], "row 6: condos no longer fell each first half");
const CONDO_DOWN_2Y = Math.round((1 - MPC["2026"] / MPC["2024"]) * 100);
must(CONDO_DOWN_2Y === 7, "row 6: no longer 7 percent");
const FSH = yr(T["Inventory of Homes for Sale"].jun.single_family), FSC = yr(T["Inventory of Homes for Sale"].jun.condo);
const SUH = yr(T["Months Supply of Inventory"].jun.single_family), SUC = yr(T["Months Supply of Inventory"].jun.condo);
const GRH = J.derived.sf_inventory_jun_growth_pct, GRC = J.derived.condo_inventory_jun_growth_pct;
must(YRS.map((y) => FSH[y]).join() === "3342,4163,4023" && YRS.map((y) => FSC[y]).join() === "2804,3274,3294", "row 9 moved");
must(YRS.map((y) => GRH[y]).join() === "+27.1%,+24.6%,-3.4%" && YRS.map((y) => GRC[y]).join() === "+81.8%,+16.8%,+0.6%", "row 9 growth moved");
must(YRS.map((y) => SUH[y]).join() === "3.8,4.6,4.3" && YRS.map((y) => SUC[y]).join() === "6.2,8.2,7.6", "row 10 moved");
const PNC = yr(T["Pending Sales"].jun.condo);
must(YRS.map((y) => PNC[y]).join() === "429,400,486" && J.derived.condo_pending_jun_three_year_high, "row 12 moved");

/* ---- Rows 3, 11, 14: the 12 months, July 2025 to June 2026. ---- */
must(J.derived.sf_closed_jun_2026_is_12mo_high && J.derived.sf_closed_12mo_max.month === "Jun-2026", "row 3 moved");
const CLOSED = J.monthly["Closed Sales"];
const NEXT_MOST = Math.max(...CLOSED.filter((r) => r.month !== "Jun-2026").map((r) => r.single_family));
must(CLOSED.length === 12 && NEXT_MOST === 1074, "row 3: the next most moved");
const FIRST12 = mon(CLOSED[0].month), LAST12 = mon(CLOSED[11].month);
must(FIRST12 === "July 2025" && LAST12 === "June 2026", "row 3: the 12 months moved");
must(J.derived.sf_inventory_yoy_negative_months.join() === "May-2026,Jun-2026", "row 11 moved");
const MP = J.monthly["Median Sales Price"];
const lowH = MP.reduce((a, r) => (r.single_family < a.single_family ? r : a)), highH = MP.reduce((a, r) => (r.single_family > a.single_family ? r : a));
must(lowH.single_family === 350000 && lowH.month === "Feb-2026" && highH.single_family === 374995 && highH.month === "Jul-2025", "row 14 moved");

/* ---- Row 18: permits (Census, CBSA 34820 = Horry County). ---- */
const PM = J.permits;
must(PM.jun_2026 === 555 && PM.jun_2025 === 596 && PM.jun_change_pct === -6.9, "row 18 moved");

/* ---- Rows 15, 16, 17: the areas, January to June 2026. ---- */
const AREAS = ["Pawleys Island / Litchfield", "North Myrtle Beach", "Myrtle Beach", "Carolina Forest", "Garden City / Murrells Inlet",
  "Surfside Beach", "Socastee", "Little River", "Conway", "Loris / Longs"];
const AR = AREAS.map((n) => { const a = J.areas[n]; must(a, `area ${n} missing`); return { n, ...a }; });
for (let i = 1; i < AR.length; i++) must(AR[i - 1].single_family.median_ytd_2026 > AR[i].single_family.median_ytd_2026, "row 16: the order by house price moved");
const A = Object.fromEntries(AR.map((a) => [a.n, a]));
must(A["Pawleys Island / Litchfield"].single_family.median_ytd_2026 === 656250 && A["Loris / Longs"].single_family.median_ytd_2026 === 301120, "row 16 moved");
must(A["Myrtle Beach"].condo.median_ytd_2026 === 205000 && A["Myrtle Beach"].condo.median_ytd_2025 === 235000 && A["Myrtle Beach"].zips === "29572 and 29577", "rows 15 and 16 moved");
const MB_CONDO_DOWN = ((1 - A["Myrtle Beach"].condo.median_ytd_2026 / A["Myrtle Beach"].condo.median_ytd_2025) * 100).toFixed(1);
must(MB_CONDO_DOWN === "12.8", "row 16: Myrtle Beach condos no longer down 12.8 percent");
const INLAND = A["Conway"].single_family.sales_ytd_2026 + A["Loris / Longs"].single_family.sales_ytd_2026;
const REGION_SALES = v(SF, "Closed Sales", "ytd_2026"), REGION_MED = v(SF, "Median Sales Price", "ytd_2026");
must(INLAND === 2034 && REGION_SALES === 5422 && INLAND / REGION_SALES > 1 / 3, "row 17 moved");
const ABOVE = ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City / Murrells Inlet", "Pawleys Island / Litchfield"];
must(ABOVE.every((n) => A[n].single_family.median_ytd_2026 > REGION_MED) && A["Little River"].single_family.median_ytd_2026 < REGION_MED, "row 17: the areas above the region moved");
const zipLabel = (z) => /^Area:/.test(z) ? `MLS area ${z.replace(/^Area:\s*/, "")}` : / and /.test(z) ? `ZIP codes ${z}` : `ZIP code ${z}`;

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const MI_PDF = J.meta.ccar_urls["Coastal-Carolinas_MMI_2026-06.pdf"];
const LU_PDF = J.meta.ccar_urls["July_2026_All_Cities.pdf"];
const BPS = J.meta.permits_source;
const CCAR_FAQ = "https://www.ccarsc.org/pages/mls-faqs/";
const HUB = "/market-reports/", CONTACT = "/contact/";

/* One photo: houses and condo towers on the same beach (USGS, public domain; record from /submarkets/myrtle-beach/).
   It shows the two kinds of home the report counts apart, under the sentence that says so (P10), not a mood. */
const PHOTOS = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "2026-11-a", "submarkets-myrtle-beach", "photos.json"), "utf8")).photos;
const BOTH = PHOTOS.find((r) => r.file.endsWith("/houses-and-towers-from-the-ocean-1200w.webp"));
must(BOTH && /public domain/i.test(BOTH.license), "no public-domain record for houses-and-towers-from-the-ocean");
const BOTH_CAP = "Houses and condo towers on the same beach in Myrtle Beach.";
const BOTH_PHOTO = PH.heroPhoto(BOTH, { alt: BOTH.alt, caption: BOTH_CAP, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.5rem;');
must(BOTH_PHOTO.includes('loading="lazy"'), "the photo is not lazy");
const CREDITS_NOTE = '<div role="listitem">Chapter3 Realty resized these photos and cropped some of them.</div>';
const CREDITS_RAW = PH.creditsList([{ photo: BOTH, caption: "Houses and condo towers on the same beach in Myrtle Beach" }]);
must(CREDITS_RAW.includes(CREDITS_NOTE), "photo credits: the note of changes moved");
/* One public-domain photo, whose own line already says what was changed: the generic second line is left out. */
const CREDITS = CREDITS_RAW.replace(CREDITS_NOTE, "");

/* ---------------------------------------------------------------------------- */
/* V1: June at a glance (rows 2, 4, 7, 8, 9, 10, 12, 13). June 2026 large, June 2025 small under it. */
const cell = (lab, now, then) => `<td><span class="l">${lab}</span>${now}<span class="was">${PY}: ${then}</span></td>`;
const GL = [
  ["Homes sold", "Closed Sales", n0],
  ["Median sale price", "Median Sales Price", money],
  ["Accepted offers", "Pending Sales", n0],
  ["Days from listing to an accepted offer", "Days on Market Until Sale", n0],
  ["Share of the last asking price paid", "Percent of List Price Received", (x) => `${pct1(x)}%`],
  ["Homes for sale at the end of the month", "Inventory of Homes for Sale", n0],
  ["Months of supply", "Months Supply of Inventory", pct1],
];
const GLANCE_TABLE = `<div class="mj-tw"><table class="mj-tab mj-two"><caption>${MONTH} at a glance</caption>`
  + `<thead><tr><th scope="col"><span class="sr">Measure</span></th><th scope="col">Houses</th><th scope="col">Condos</th></tr></thead><tbody>`
  + GL.map(([q, k, f]) => `<tr><th scope="row">${q}</th>${cell("Houses", f(v(SF, k, "jun_2026")), f(v(SF, k, "jun_2025")))}${cell("Condos", f(v(CO, k, "jun_2026")), f(v(CO, k, "jun_2025")))}</tr>`).join("")
  + `</tbody></table><p class="nt">The small figure under each is the June before. Sales through the multiple listing service (MLS) of the Coastal Carolinas Association of REALTORS (CCAR), for Horry and Georgetown Counties. Houses are single-family homes.</p></div>`;

/* V2: three first halves of medians (row 6). Houses gray, condos brass: the message is the condos. */
const PRICE_CHART = G.bars([
  ...YRS.map((y) => ({ name: `Houses, ${y}`, value: MPH[y], reference: true })),
  ...YRS.map((y) => ({ name: `Condos, ${y}`, value: MPC[y] })),
], { caption: "House prices stayed about level. Condo prices fell a little each year.", nameLabel: "Kind of home and year", valueLabel: "Median sale price", compact: true,
  note: `Median sale price from ${YTD} of each year, Horry and Georgetown Counties.` });

/* V3a: the 12 months of houses for sale against the year before (row 11): the deciding fact in one picture.
   Bars above the line are months with more houses for sale than a year before; the two below are May and June 2026.
   Drawn twice so the text stays 13 to 14 px: on a phone, one row per month with the month's name and its value
   (review 1: single month letters were too small and "J" could be any of three months); wide, upright bars. */
const INV = J.monthly["Inventory of Homes for Sale"];
const INV_CHG = INV.map((r) => chgNum(r.sf_chg));
must(INV.length === 12 && INV_CHG.join() === "18.2,13.2,14.7,10.1,4.6,4.6,5.3,3.7,4,1.8,-1.6,-3.4", "row 11: the monthly changes moved");
const UP_MONTHS = INV_CHG.filter((x) => x > 0).length;
must(UP_MONTHS === 10 && INV_CHG.slice(0, 10).every((x) => x > 0) && INV_CHG.slice(10).every((x) => x < 0), "row 11: the pattern moved");
const UP_MONTHS_WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][UP_MONTHS];
const UPC = "#a9aeb8", DNC = "#b5652a", TXT = "#4a4f5c";
const invSvg = (W, fs, cls) => {
  const narrow = W < 400, y0 = fs * 1.2, plotH = Math.round(W * (narrow ? 0.5 : 0.3)), hi = 24, lo = -6;
  const x0 = Math.round(fs * 3.4), x1 = W - 4, y1 = y0 + plotH;
  const tickY = y1 + fs * 1.25, yearY = tickY + fs * 1.3, H = Math.round(yearY + fs * 0.4);
  const Y = (v) => y0 + ((hi - v) / (hi - lo)) * (y1 - y0), slot = (x1 - x0) / 12, bw = slot * 0.62;
  const f1 = (v) => v.toFixed(1);
  const grid = [20, 10, 0].map((g) => `<line x1="${x0}" x2="${x1}" y1="${f1(Y(g))}" y2="${f1(Y(g))}" stroke="#1c2028" stroke-opacity="${g === 0 ? ".55" : ".1"}"/>`
    + `<text x="${x0 - 6}" y="${f1(Y(g) + fs * 0.35)}" text-anchor="end" font-size="${fs}" fill="${TXT}">${g > 0 ? "+" : ""}${g}%</text>`).join("");
  const barX = (i) => x0 + i * slot + (slot - bw) / 2;
  const bars_ = INV_CHG.map((c, i) => { const ya = Y(Math.max(c, 0)), yb = Y(Math.min(c, 0));
    return `<rect x="${f1(barX(i))}" y="${f1(ya)}" width="${f1(bw)}" height="${f1(Math.max(yb - ya, 1))}" rx="2" fill="${c < 0 ? DNC : UPC}"/>`; }).join("");
  const mid = (i) => x0 + i * slot + slot / 2;
  /* The first bar's value sits above it, starting at the bar's left edge, clear of the axis labels; the last bar's
     value sits under its bar, ending at its right edge. */
  const first = `<text x="${f1(barX(0))}" y="${f1(Y(INV_CHG[0]) - fs * 0.45)}" text-anchor="start" font-size="${fs}" font-weight="700" fill="${TXT}">+${f1(INV_CHG[0])}%</text>`;
  const last = `<text x="${f1(barX(11) + bw)}" y="${f1(Y(INV_CHG[11]) + fs * 1.15)}" text-anchor="end" font-size="${fs}" font-weight="700" fill="#8a4a1c">${f1(INV_CHG[11])}%</text>`;
  const ticks = INV.map((r, i) => { const [m] = r.month.split("-");
    return `<text x="${f1(mid(i))}" y="${f1(tickY)}" text-anchor="middle" font-size="${narrow ? fs * 0.92 : fs}" fill="${TXT}">${narrow ? m[0] : m}</text>`; }).join("");
  const years = `<text x="${f1(barX(0))}" y="${f1(yearY)}" text-anchor="start" font-size="${fs * 0.9}" fill="${TXT}">2025</text>`
    + `<text x="${f1(barX(6))}" y="${f1(yearY)}" text-anchor="start" font-size="${fs * 0.9}" fill="${TXT}">2026</text>`;
  const label = `Bar chart of the change in houses for sale from a year before, each month from ${FIRST12} to ${LAST12}. It was up ${f1(INV_CHG[0])} percent in ${FIRST12}, then smaller, and down ${f1(-INV_CHG[10])} percent in May 2026 and ${f1(-INV_CHG[11])} percent in ${LAST12}.`;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${grid}${bars_}${first}${last}${ticks}${years}</svg>`;
};
const invRows = (W, fs, cls) => {
  const rowH = Math.round(fs * 2), lab = Math.round(fs * 4.9), x0 = lab + 8, x1 = W - Math.round(fs * 3.9), lo = -6, hi = 20;
  const X = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0), z = X(0), H = 12 * rowH + 6, bh = Math.round(fs * 1.05);
  const f1 = (v) => v.toFixed(1);
  /* Month names first, then bars, then values: a value never sits just before a month name in the text
     ("+4.0% Apr" reads as a rate to the claims scanner). */
  const yc = (i) => 3 + i * rowH + rowH / 2;
  const names = INV.map((r, i) => { const [m, y] = r.month.split("-");
    return `<text x="${lab}" y="${f1(yc(i) + fs * 0.35)}" text-anchor="end" font-size="${fs}" fill="${TXT}">${m} ${y}</text>`; }).join("");
  const bars_ = INV_CHG.map((c, i) => `<rect x="${f1(Math.min(X(c), z))}" y="${f1(yc(i) - bh / 2)}" width="${f1(Math.max(Math.abs(X(c) - z), 1))}" height="${bh}" rx="2" fill="${c < 0 ? DNC : UPC}"/>`).join("");
  const vals = INV_CHG.map((c, i) => { const neg = c < 0;
    return `<text x="${f1((neg ? z : X(c)) + 5)}" y="${f1(yc(i) + fs * 0.35)}" font-size="${fs}" font-weight="${neg ? 700 : 400}" fill="${neg ? "#8a4a1c" : TXT}">${c > 0 ? "+" : ""}${f1(c)}%</text>`; }).join("");
  const rows = names + bars_ + vals;
  const zero = `<line x1="${f1(z)}" x2="${f1(z)}" y1="0" y2="${H}" stroke="#1c2028" stroke-opacity=".55"/>`;
  const label = `Bar chart of the change in houses for sale from a year before, each month from ${FIRST12} to ${LAST12}. It was up ${f1(INV_CHG[0])} percent in ${FIRST12}, then smaller, and down ${f1(-INV_CHG[10])} percent in May 2026 and ${f1(-INV_CHG[11])} percent in ${LAST12}.`;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${zero}${rows}</svg>`;
};
const SUPPLY_CHART = `<figure class="c3-gchart mj-bars"><span class="cap">Houses for sale were above the year before in every month until May 2026.</span>`
  + invRows(260, 14, "mj-n") + invSvg(640, 13.5, "mj-w")
  + `<figcaption>Change in houses for sale at the end of each month, from the same month a year before. Horry and Georgetown Counties.</figcaption></figure>`;

/* V4: January to June 2026 by area (rows 15, 16). Three columns at every width; the sales count under each price.
   Each area with a page of its own links to it (review 1), so a reader who likes an area can go see it. */
const AREA_LINK = { "Pawleys Island / Litchfield": [["Pawleys Island", "/submarkets/pawleys-island/"], " / Litchfield"],
  "North Myrtle Beach": [["North Myrtle Beach", "/submarkets/north-myrtle-beach/"]], "Myrtle Beach": [["Myrtle Beach", "/submarkets/myrtle-beach/"]],
  "Carolina Forest": [["Carolina Forest", "/submarkets/carolina-forest/"]],
  "Garden City / Murrells Inlet": [["Garden City", "/submarkets/garden-city/"], " / ", ["Murrells Inlet", "/submarkets/murrells-inlet/"]],
  "Surfside Beach": [["Surfside Beach", "/submarkets/surfside-beach/"]], "Little River": [["Little River", "/submarkets/little-river/"]],
  "Conway": [["Conway", "/submarkets/conway/"]] };
for (const [, parts] of Object.entries(AREA_LINK)) for (const x of parts) if (Array.isArray(x)) must(fs.existsSync(path.join(ROOT, "chapter3realty", x[1], "index.html")), `no page at ${x[1]}`);
const areaName = (n) => AREA_LINK[n] ? AREA_LINK[n].map((x) => Array.isArray(x) ? h.a(x[1], x[0]) : x).join("") : n;
const AREA_TABLE = `<div class="mj-tw"><table class="mj-tab mj-area"><caption>Median sale price by area, ${YTD} ${DY}</caption>`
  + `<thead><tr><th scope="col">Area</th><th scope="col">Houses</th><th scope="col">Condos</th></tr></thead><tbody>`
  + AR.map((a) => `<tr><th scope="row">${areaName(a.n)}<span class="z">${zipLabel(a.zips)}</span></th>`
    + `<td>${money(a.single_family.median_ytd_2026)}<span class="was">${n0(a.single_family.sales_ytd_2026)} sold</span></td>`
    + `<td>${money(a.condo.median_ytd_2026)}<span class="was">${n0(a.condo.sales_ytd_2026)} sold</span></td></tr>`).join("")
  + `<tr class="all"><th scope="row">All of Horry and Georgetown Counties</th><td>${money(REGION_MED)}</td><td>${money(v(CO, "Median Sales Price", "ytd_2026"))}</td></tr>`
  + `</tbody></table><p class="nt">${YTD}, because ${MON} alone had too few sales in most areas. CCAR's areas follow ZIP codes or MLS areas, not city limits. Condos include townhouses. Sorted by the house price.</p></div>`;

/* The homes strip (the owner, 2026-11-08 and 2026-11-10: the strip is the strongest offer, its title bold and true).
   Title in the verifier's words (row 22): the circle is in and around Myrtle Beach, not CCAR's ZIP codes. */
/* The fallback pill says the same words as the strip's title (review 1). */
const STRIP_TITLE = "Oceanfront condos under $205,000 in and around Myrtle Beach";
const STRIP = G.homes("mrj-oceanfront-condos-under-205k", "Myrtle Beach",
  G.offer("Myrtle Beach", { label: STRIP_TITLE, href: CONTACT }), STRIP_TITLE);

/* What to do with the numbers (review 1): one line per reader, each a figure the page has not said yet and what we
   do with it before an offer. Rows 7 (January to June days), 8 (January to June share of asking), 14 (condo range). */
const MPC_LOW = MP.reduce((a, r) => (r.condo < a.condo ? r : a)), MPC_HIGH = MP.reduce((a, r) => (r.condo > a.condo ? r : a));
must(MPC_LOW.condo === 220000 && MPC_LOW.month === `Feb-${DY}` && MPC_HIGH.month === `Nov-${PY}` && MPC_LOW.month === "Feb-2026" && MPC_HIGH.condo === 248000 && MPC_HIGH.month === "Nov-2025", "row 14 (condos) moved");
must(v(SF, "Days on Market Until Sale", "ytd_2026") === 125 && v(CO, "Percent of List Price Received", "ytd_2026") === 95.9, "rows 7 and 8 (January to June) moved");
const MEANT = `<ul class="mj-list">`
  + `<li><b>Buying a house</b>From ${YTD}, the average house waited ${v(SF, "Days on Market Until Sale", "ytd_2026")} days for an accepted offer. Our agents check how long the house you like has been for sale, and any price cuts, before you write your offer. ${h.a(CONTACT, "Ask us about a house")}</li>`
  + `<li><b>Buying a condo</b>From ${YTD}, condos sold for ${pct1(v(CO, "Percent of List Price Received", "ytd_2026"))} percent of their last asking price on average. Before you offer, our agents check what the same floor plan sold for in that building. ${h.a(CONTACT, "Ask us about a building")}</li>`
  + `<li><b>Selling</b>Over the year to ${MON}, the median condo moved between ${money(MPC_LOW.condo)} in ${MONTHS[1]} and ${money(MPC_HIGH.condo)} the ${MONTHS[10]} before. One month's median says little about one home, so we price yours from the sales closest to it. ${h.a(CONTACT, "Ask us to price your home")}</li>`
  + `</ul>`;

/* ---- The page's own styles: the hub's (one card style for the chart and the offers; tables and lists under thin
   rules; one block width of 720 px), with this page's prefix, and the hero sub shown as the archive line. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  /* the archive line: the hero sub, a small box with a brass edge */
  + `${S} .detail-hero .detail-sub{font-family:var(--sans);font-weight:400;font-size:1rem;line-height:1.6;color:var(--navy);max-width:720px;margin:.2rem 0 0;padding:.7rem 0 .7rem 1rem;border-left:3px solid var(--brass)}`
  + `${S} .detail-hero .detail-sub a{color:var(--navy);text-decoration:underline;text-underline-offset:.18em}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  + `${S} .c3-gchart,${S} .mj-tw,${S} .mj-list,${S} .hx-strip,${S} .hx-fallback{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  /* tables: plain, under thin rules */
  + `${S} .mj-tw{margin:1.3rem 0 1.5rem}`
  + `${S} .mj-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .mj-tab caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem;font-size:1.08rem}`
  + `${S} .mj-tab thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom;line-height:1.3}`
  + `${S} .mj-tab tbody th{text-align:left;font-weight:600;padding:.65rem .9rem .65rem 0;border-bottom:${RULE};line-height:1.35;vertical-align:top}`
  + `${S} .mj-tab td{padding:.65rem .8rem .65rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.45;color:var(--navy);font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600}`
  + `${S} .mj-tab .was,${S} .mj-tab .z{display:block;font-size:.875rem;font-weight:400;color:var(--muted);line-height:1.35;margin-top:.1rem;white-space:normal}`
  + `${S} .mj-tab td .l{display:none}${S} .mj-tab .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .mj-two tbody th{width:46%;font-weight:500}`
  + `${S} .mj-area tbody th{width:46%}${S} .mj-area tr.all th,${S} .mj-area tr.all td{border-top:1px solid rgba(28,32,40,.3)}${S} .mj-area tr.all th{font-weight:600}`
  + `${S} .mj-tw .nt{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.7rem 0 0;max-width:40rem}`
  + `@media (max-width:599px){${S} .mj-two td,${S} .mj-area td{padding-right:.6rem}${S} .mj-two tbody th,${S} .mj-area tbody th{width:44%;font-size:1rem}}`
  /* at 320 px the area table keeps a gutter on the right (review 1) */
  + `@media (max-width:379px){${S} .mj-area{font-size:.97rem}${S} .mj-area tbody th{width:40%;font-size:.95rem}${S} .mj-area td{padding-right:.4rem}${S} .mj-area td:last-child{padding-right:0}}`
  /* the 12-month bars: drawn twice, the phone one up to 599 px */
  + `${S} .mj-bars svg{display:block;width:100%;height:auto}${S} .mj-bars svg.mj-n{max-width:420px;margin:0 auto}${S} .mj-bars svg.mj-w{display:none}`
  + `@media (min-width:600px){${S} .mj-bars svg.mj-n{display:none}${S} .mj-bars svg.mj-w{display:block}}`
  + `${S} .mj-bars .cap{display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem}`
  /* lists: plain, under thin rules, a bold lead-in on each */
  + `${S} .mj-list{list-style:none;margin:1rem 0 1.4rem;padding:0}`
  + `${S} .mj-list li{margin:0;padding:.8rem 0;border-top:${RULE};line-height:1.6;font-size:1.0625rem;color:var(--muted)}`
  + `${S} .mj-list li:last-child{border-bottom:${RULE}}`
  + `${S} .mj-list li a{white-space:nowrap}`
  + `${S} .mj-list b{display:block;font-weight:600;font-family:var(--sans);color:var(--navy);line-height:1.4;margin-bottom:.15rem}`
  /* Work-arounds copied from the hub: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. Past prices do not promise future prices. Nothing on this page is legal, tax or lending advice.</p>`;

/* The closing questions (review 1): open text, each one a fact the sections do not give. The heading has no "FAQ" or
   "questions" in it, so the site's script leaves the answers open (CRAFT 4, "Hide nothing"). mkpage needs three.
   Rows 7 (three Junes of condo days) and 18 (permits, June and January to June), and the hub. */
const DOMC = yr(T["Days on Market Until Sale"].jun.condo);
must(YRS.map((y) => DOMC[y]).join() === "102,132,137", "row 7 (three Junes) moved");
must(PM.ytd_jun_2026 === 3336 && PM.ytd_jun_2025 === 3579 && PM.ytd_jun_change_pct === -6.8, "row 18 (January to June) moved");
const FAQ = [
  { q: `Did Myrtle Beach condos take longer to sell in ${MONTH}?`, a: `Yes. The average condo took ${DOMC["2026"]} days from listing to an accepted offer, up from ${DOMC["2024"]} days two Junes before.` },
  { q: `Were fewer new homes permitted in Horry County in ${MONTH}?`, a: `Yes. Building permits were issued for ${n0(PM.jun_2026)} new homes in Horry County that month, ${Math.abs(PM.jun_change_pct).toFixed(1)} percent fewer than the June before. From ${YTD}, permits covered ${n0(PM.ytd_jun_2026)} homes, ${Math.abs(PM.ytd_jun_change_pct).toFixed(1)} percent fewer than a year before.` },
  { q: "Where are the newest Myrtle Beach market numbers?", a: `Our Myrtle Beach market reports page has the latest month, with the past year in one chart. This page stays up as the record of that June.` },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Market Reports", url: HUB },
  title: `Myrtle Beach Housing Market Report: ${MONTH} Data | Chapter3`,
  description: `${MONTH} data for Myrtle Beach and the Grand Strand: the median house ${money(v(SF, "Median Sales Price", "jun_2026"))}, the median condo ${money(v(CO, "Median Sales Price", "jun_2026"))}, homes for sale, condo offers and prices by area.`,
  ogTitle: `Myrtle Beach housing market report, ${MONTH}: prices, homes for sale and prices by area`,
  /* The share card (Blog-Brain tools/ogcard.js, our own text on navy; no photo), kept in this page's images folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/market-reports-july-2026/market-report-june-2026-share.jpg",
  crumb: "July 2026 Report",
  eyebrow: "Market report archive",
  h1: `Myrtle Beach housing market report: ${MONTH} data.`,
  h1em: "Prices stayed level. Fewer houses were for sale, and more condo buyers had an offer accepted.",
  /* The archive line (PLAN): shown under the byline in its own small box. */
  sub: `This report covers ${MONTH}. Find the newest numbers in the ${h.a(HUB, "Myrtle Beach market reports")}, and whether it is a buyer's market today in the ${h.a("/buyers/buying-in-myrtle-beach/", "buying guide")}.`,
  heroMedia: CSS + G.homesCss(),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `In ${MONTH}, the median house in Horry and Georgetown Counties sold for about ${r1k(v(SF, "Median Sales Price", "jun_2026"))} and the median condo for about ${r1k(v(CO, "Median Sales Price", "jun_2026"))}. Both were within 2 percent of a year earlier.`,
    `Compared with a year earlier, fewer houses were for sale, and sellers accepted ${abs1(CO["Pending Sales"].chg)} percent more offers on condos.`,
  ],
  sections: [
    { h2: `What did Myrtle Beach homes sell for in ${MONTH}?`, toc: "Prices in June", id: "prices", html: () =>
      h.p(`The median is the middle sale: half of the homes sold for more, and half for less. From ${YTD}, the median house sold for almost the same as in ${MON}, and the median condo for ${money(v(CO, "Median Sales Price", "ytd_2026"))}.`) +
      GLANCE_TABLE +
      BOTH_PHOTO },

    { h2: `Were Myrtle Beach home prices falling in ${MONTH}?`, toc: "Were prices falling", id: "were-prices-falling", html: (bg) =>
      h.p(`Not for houses. The median house sold for about ${r5k(Math.min(...Object.values(JPH)))} to ${money(Math.max(...Object.values(JPH)))} in each of the last three Junes.`) +
      h.p(`Condos sold for a little less in each first half. From January to ${MON}, the median condo cost ${CONDO_DOWN_2Y} percent less than in 2024.`) +
      PRICE_CHART +
      h.p(`Month by month, the median house price stayed between ${money(lowH.single_family)} and about ${r1k(highH.single_family)} over the year to ${MON}.`) +
      h.cta("Want these numbers for your own street?", "We pull the sales near your house from that June and from the months since, and tell you what they mean for your price.", "Send me my street's sales", CONTACT, bg) },

    { h2: `Did the rise in Myrtle Beach homes for sale stop in ${MONTH}?`, toc: "Homes for sale", id: "homes-for-sale", html: () =>
      h.p(`Yes, for houses. At the end of ${MON}, ${abs1(GRH["2026"])} percent fewer houses were for sale than twelve months before. It was the second month in a row with fewer, after ${UP_MONTHS_WORD} months with more.`) +
      SUPPLY_CHART +
      h.p(`Months of supply is how long the homes for sale would last at the past year's pace of accepted offers, if no new homes were listed. There were still more houses for sale than two Junes before, when ${n0(FSH["2024"])} were listed and houses had ${pct1(SUH["2024"])} months of supply.`) },

    { h2: `Were buyers coming back to Myrtle Beach in ${MONTH}?`, toc: "Buyers in June", id: "buyers", html: (bg) =>
      h.p(`Yes, most of all for condos. Sellers accepted ${n0(PNC["2026"])} offers on condos in ${MON}, ${abs1(CO["Pending Sales"].chg)} percent more than a year earlier and the most of the last three Junes.`) +
      h.p(`House buyers had about ${Math.round(chgNum(SF["Pending Sales"].chg))} percent more offers accepted. ${MON} also had ${n0(v(SF, "Closed Sales", "jun_2026"))} house sales closed, the most of any month in the year to ${MON}.`) +
      STRIP +
      h.cta("Found a condo you like? We check the building first.", "We pull the building's recent sales, its HOA fee and its insurance before you make an offer.", "Have us check the building", CONTACT, bg) },

    { h2: `What did homes sell for in each Myrtle Beach area in the first half of 2026?`, toc: "Prices by area", id: "by-area", html: () =>
      h.p(`Pawleys Island and North Myrtle Beach had the highest median house prices from January to ${MON}, and Conway and Loris / Longs the lowest.`) +
      AREA_TABLE +
      h.p(`More than a third of the region's house sales in the first half were in the Conway and Loris / Longs ZIP codes. The median house there sold for about ${r1k(A["Loris / Longs"].single_family.median_ytd_2026)} to ${r1k(A["Conway"].single_family.median_ytd_2026)}. The region's median house price was below the median in ${ABOVE.slice(0, -1).join(", ")} and ${ABOVE[ABOVE.length - 1]}.`) +
      h.p(`In the Myrtle Beach area, ZIP codes ${A["Myrtle Beach"].zips}, the median condo sold for ${money(A["Myrtle Beach"].condo.median_ytd_2026)} in the first half, down ${MB_CONDO_DOWN} percent from a year before. Our ${h.a("/sell/home-value/", "home value page")} shows what homes in your area sold for since then.`) },

    { h2: `How could Myrtle Beach buyers and sellers use the ${MONTH} numbers?`, toc: "Using the numbers", id: "what-it-meant", html: () =>
      h.p("Set the one home you want against them, before you write an offer or set a price.") + MEANT },
  ],
  faqTitle: `What else changed in ${MONTH}?`,
  faq: FAQ,
  sources: [
    { name: `CCAR Monthly Indicators, ${MONTH}`, href: MI_PDF },
    { name: `CCAR Local Market Update, ${MONTH}`, href: LU_PDF },
    { name: "CCAR MLS questions", href: CCAR_FAQ },
    { name: "Census Building Permits Survey", href: BPS },
  ],
  sourcesNote: `Market: sales through CCAR's MLS in Horry and Georgetown Counties, current as of ${CURRENT_AS_OF}. Permits: the Census count for the Myrtle Beach metro, which is Horry County. Our ${h.a("/invest/what-is-being-built/", "new home permits page")} has every month.`,
  afterSources: () => CREDITS + PH.imageSchema([BOTH]) + LEGAL,
  bottomCta: { h2: "Get the newest numbers for your street or building.", p: "We send you the recent sales near you and the homes for sale now.", label: "Send me the numbers", href: CONTACT },
  keywords: `Myrtle Beach housing market ${MONTH}, Myrtle Beach market report July 2026, Grand Strand home sales ${MONTH}, Myrtle Beach condo sales ${MONTH}`,
  about: `The Myrtle Beach and Horry and Georgetown County real estate market in ${MONTH}`,
});
