/* /invest/condos/ - is a Myrtle Beach condo a good investment: the verdict for each kind of investor, condo
 * values against houses over 25 years, what condos sell for and where, the yearly cost of one typical
 * oceanfront condo, renting it, loans, and what we read in a building before an offer.
 *
 * Batch 2026-11-a, Lane U. Version 1. The live page was hand-made with no spec; this spec replaces it.
 * Reader, must-answers and plan: Blog-Brain batches/2026-11-a/invest-condos/ (must-answer.md, PLAN.md).
 * Facts: facts.md there, VERIFIED and CORRECTED rows only, at their corrected values (VERIFY.md,
 * invest-condos-struck.json). The verifier's corrections are in: only 2 other months were lower and the
 * ratio's high was mid-2006 (row 5); no complex count, "almost half" of units in complexes of 100 or more
 * (row 6); "taxed at the 4 percent rate for its owner's legal residence" (row 7); months of supply, not time
 * to sell (row 12); "say they allow short-term rentals" (row 17); HUD's 9 approved FHA projects (row 19);
 * the 72 days per calendar year and the military exception (row 20); no insurance dollar figure (row 22
 * struck); the yearly total is $18,100 before insurance, the tax before the 25 percent exemption, and the
 * base unincorporated rate (row 23); Fannie Mae is "one of the two companies", "registration services", the
 * HOA or its manager renting units (row 25); the special-assessment carve-out (row 26); "and other recorded
 * liens" (row 27); other homes in a flood zone 10.4 percent from the full run (row 28); "a house sale and his
 * savings" (row 29).
 * Every chart, table and figure is built from data/2026-11-a/invest-condos/ (never typed):
 *   raw/zhvi-metro-condo_..., raw/zhvi-metro-sfr_...   rows 1 to 5 (Zillow ZHVI, metro, monthly)
 *   zhvi-compare.json                                  rows 1 to 5 (peaks, troughs, recovery, ratios)
 *   findings.json                                      rows 6, 7, 9 to 12, 28 (county parcels, deeds, flood)
 *   flood-other-full.json                              row 28, other homes (the verifier's full run)
 *   listings.json                                      rows 12 to 19, 23 (homes for sale, counted in total)
 *   raw/tax-levy-2026.txt                              row 21 (2026 millage)
 *   photos.json                                        one public-domain USGS photo (record there)
 * Kept from the live page: the H1 question and title, the point that the building matters more than the
 * unit (now shown with counts), "oceanfront units here still start under $200,000" (now counted), reading
 * the master deed and the rental program contract, the internal links. Cut: "19 million visitors",
 * "outperform most coastal rental markets", "2.5 to 3.8 times", "front desks", "most conventional
 * lenders", the unsourced claim about on-site managers, the check-mark fee list that told the reader to verify.
 * Stories used as recorded: boston-hotel-manager (with its label and limits), distressed-condo-discount (our
 * own observation), rental-program-buildings, unwarrantable-condo-ltv (no percentage), hoa-rental-bans-filtered.
 * Version 2 (build stage, 2026-11-03 run): a chart of the condos for sale that say they take FHA or VA (row 19),
 * the Fannie Mae list in two columns on a wide screen, and room around the yearly cost card.
 * Version 3 (fix round 1, 2026-11-03; REVIEW-1.md): what a nightly rental takes in and keeps (str-income.json, from
 * AirROI via the Myrtle Beach page's raw copy, ledger rows 35 and 36) set against the fee and tax; the verdict said once,
 * in the short answer; the 25 percent exemption with its January 31 deadline (row 34, SC Code 12-37-3135); the city's
 * nightly-rental zones (row 37); where the condos are, with two more USGS photos (row 38); management ranges (row 36);
 * insurance as a quote and the landlord-policy shares (row 39); plain words for months of supply, the Fannie Mae list,
 * non-warrantable and the lien; checklist lines no story supports cut; the "Our X page explains Y" pointers cut; counts
 * rounded; section offers tied to what each section proved; FAQ items that repeated the body replaced.
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

const DATA = path.join(__dirname, "..", "data", "2026-11-a", "invest-condos");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const Z = read("zhvi-compare.json"), F = read("findings.json"), L = read("listings.json"), FO = read("flood-other-full.json");
const SI = read("str-income.json");
const must = (ok, msg) => { if (!ok) throw new Error(`condos: ${msg}`); };

const kit = PK.create({ h, theme: "glass", photos: read("photos.json").photos,
  mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" });
const { glance } = kit;
const ph = kit.photoSet({ aerialWidth: "760px" });

const SELF = "/invest/condos/";
const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
const r100 = (v) => "$" + (Math.round(v / 100) * 100).toLocaleString("en-US");
const r5k = (v) => "$" + (Math.round(v / 5000) * 5000).toLocaleString("en-US");
const near = (v, n) => (Math.round(v / n) * n).toLocaleString("en-US");
const pct = (v) => Math.round(Math.abs(v));
const nw = (t) => `<span style="white-space:nowrap">${t}</span>`;
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthName = (ym) => `${MONTH[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

/* ---------------------------------------------------------------------------- */
/* Zillow, monthly (rows 1 to 5).                                                 */
const csvRow = (f) => {
  const lines = fs.readFileSync(path.join(DATA, "raw", f), "utf8").trim().split(/\r?\n/);
  const head = lines[0].split(","), row = (lines.find((l) => l.startsWith("394898,")) || "").replace(/"[^"]*"/g, "X").split(",");
  must(row.length === head.length, `${f}: the Myrtle Beach row does not match the header`);
  const out = [];
  head.forEach((c, i) => { if (/^\d{4}-\d{2}-\d{2}$/.test(c) && row[i] !== "") out.push([c.slice(0, 7), Number(row[i])]); });
  must(row[0] === "394898", `${f}: region is not the Myrtle Beach metro`);
  return out;
};
const CONDO_M = csvRow("zhvi-metro-condo_tier_0.33_0.67-mb.csv").filter((r) => r[0] >= Z.first_month && r[0] <= Z.last_month);
const HOUSE_M = csvRow("zhvi-metro-sfr_tier_0.33_0.67-mb.csv").filter((r) => r[0] >= Z.first_month && r[0] <= Z.last_month);
must(CONDO_M.length === 299 && HOUSE_M.length === 299, "the two Zillow series should hold 299 months");
const ZC = Z.findings.condo, ZH = Z.findings.sfr;
const at = (s, ym) => s.find((r) => r[0] === ym)[1];
must(Math.round(at(CONDO_M, ZC.peak_month)) === ZC.peak && Math.round(at(CONDO_M, ZC.trough_month)) === ZC.trough, "condo peak or trough moved");
must(Math.round(at(CONDO_M, Z.last_month)) === ZC.last && Math.round(at(HOUSE_M, Z.last_month)) === ZH.last, "last month moved");
/* Row 5, corrected: the ratio's high, and the months lower than the last one. */
const RATIO = CONDO_M.map((r, i) => [r[0], r[1] / HOUSE_M[i][1]]);
const RNOW = RATIO.at(-1)[1], RMAX = RATIO.reduce((a, b) => (b[1] > a[1] ? b : a));
const LOWER = RATIO.filter((r) => r[1] < RNOW);
must(RMAX[0] === "2006-07" && LOWER.length === 2 && LOWER.every((r) => r[0].startsWith("2021-")), "row 5 changed: the ratio's high or the lower months");
const YRS = (a, b) => Math.round(((Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5)) - Number(a.slice(5))) / 12);
const CONDO_BACK = YRS(ZC.peak_month, ZC.recovered_month), HOUSE_BACK = YRS(ZH.peak_month, ZH.recovered_month);

/* Chart 1: two lines, monthly, with the three condo turns marked. */
const PRICE_CHART = (() => {
  const W = 360, H = 262, L0 = 56, R0 = 296, T0 = 30, B0 = 222, YMIN = 100000, YMAX = 400000, N = CONDO_M.length;
  const X = (i) => L0 + i / (N - 1) * (R0 - L0), Y = (v) => B0 - (v - YMIN) / (YMAX - YMIN) * (B0 - T0);
  const f1 = (v) => Math.round(v * 10) / 10;
  const line = (s) => "M" + s.map((r, i) => `${f1(X(i))} ${f1(Y(r[1]))}`).join("L");
  const CO = "#c4783a", CO_INK = "#8a5226", SF = "#2f6f8f";
  const grid = [200000, 300000, 400000].map((v) => `<line x1="${L0}" y1="${f1(Y(v))}" x2="${R0}" y2="${f1(Y(v))}" stroke="#1c2028" stroke-opacity=".1"/><text class="ct" x="${L0 - 6}" y="${f1(Y(v) + 5)}" text-anchor="end">$${v / 1000}k</text>`).join("")
    + `<text class="ct" x="${L0 - 6}" y="${f1(Y(YMIN) + 5)}" text-anchor="end">$100k</text>`;
  const xt = ["2002", "2010", "2018", "2026"].map((y) => { const i = CONDO_M.findIndex((r) => r[0] === `${y}-01`); return `<text class="ct" x="${f1(X(i))}" y="${B0 + 24}" text-anchor="middle">${y}</text>`; }).join("");
  const mark = (ym, label, dy, anchor, dx = 0) => { const i = CONDO_M.findIndex((r) => r[0] === ym), v = CONDO_M[i][1];
    return `<circle cx="${f1(X(i))}" cy="${f1(Y(v))}" r="4.5" fill="${CO}" stroke="#fff" stroke-width="1.5"/>`
      + `<text class="cl" x="${f1(X(i) + dx)}" y="${f1(Y(v) + dy)}" text-anchor="${anchor}" fill="${CO_INK}">${label}</text>`; };
  const k = (v) => `$${Math.round(v / 1000)}k`;
  const aria = `Line chart of the typical home value in the Myrtle Beach metro, monthly from late 2001 to ${monthName(Z.last_month)}. `
    + `Condos rose from about ${r1k(ZC.first)} to a high of about ${r1k(ZC.peak)} in ${monthName(ZC.peak_month)}, fell to about ${r1k(ZC.trough)} in ${monthName(ZC.trough_month)}, `
    + `rose to about ${r1k(ZC.recent_peak)} in ${monthName(ZC.recent_peak_month)} and were about ${r1k(ZC.last)} in ${monthName(Z.last_month)}. `
    + `Houses rose from about ${r1k(ZH.first)} to about ${r1k(ZH.last)}, and fell less after 2007.`;
  const svg = `<svg class="c3-cd-chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${aria}">`
    + `<rect x="${L0}" y="${T0}" width="${R0 - L0}" height="${B0 - T0}" fill="rgba(255,255,255,.55)" rx="6"/>` + grid + xt
    + `<path d="${line(HOUSE_M)}" fill="none" stroke="${SF}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="${line(CONDO_M)}" fill="none" stroke="${CO}" stroke-width="3" stroke-linejoin="round"/>`
    + mark(ZC.peak_month, "2006 high", 22, "middle") + mark(ZC.trough_month, "2012 low", -12, "middle") + mark(ZC.recent_peak_month, "2023 high", -12, "start", -6)
    + `<text class="cl" x="${R0 + 6}" y="${f1(Y(ZH.last) + 5)}" fill="${SF}">${k(ZH.last)}</text>`
    + `<text class="cl" x="${R0 + 6}" y="${f1(Y(ZC.last) + 5)}" fill="${CO_INK}">${k(ZC.last)}</text>`
    + `</svg>`;
  const legend = `<ul class="c3-cd-legend"><li><span class="c3-cd-line" style="background:${SF}"></span>Houses</li><li><span class="c3-cd-line" style="background:${CO}"></span>Condos</li></ul>`;
  return `<figure class="c3-gchart c3-cd-fig"><span class="cap" style="display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem">Typical condo and house value, Myrtle Beach metro</span>${legend}${svg}`
    + `<figcaption>Zillow's typical value of a home in the middle third of prices, each month from November 2001. Houses means single-family homes.</figcaption></figure>`;
})();

/* The values under the chart (CRAFT 3, market data: the chart and its table of values). */
const VALUE_TABLE = h.table(["When", "Typical condo", "Typical house"], [
  ["Late 2001", r1k(ZC.first), r1k(ZH.first)],
  ["High, 2006 or 2007", r1k(ZC.peak), r1k(ZH.peak)],
  ["Low, 2011 or 2012", r1k(ZC.trough), r1k(ZH.trough)],
  ["Latest month", r1k(ZC.last), r1k(ZH.last)],
  ["Since 2001", `Up ${pct(ZC.change_first_to_last_pct)}%`, `Up ${pct(ZH.change_first_to_last_pct)}%`],
]).replace("<table ", '<table aria-label="Typical condo and house value in the Myrtle Beach metro" ');

/* ---------------------------------------------------------------------------- */
/* Sales from deeds (rows 9 to 11).                                               */
const CS = F.sales.condo, OS = F.sales.other, BY = F.sales.condo_by_area;
const NMB = BY["North Myrtle Beach"], CMB = BY["City of Myrtle Beach"], REST = BY["Outside city limits and other towns"];
must(Math.abs(NMB.median_price / CMB.median_price - 2) < 0.1, "row 11: North Myrtle Beach is no longer about twice the city");
must(near(CS.sales, 100) === "2,600", "row 9: hero says about 2,600 condo sales");
const AREA_CHART = G.bars([
  { name: "North Myrtle Beach", value: NMB.median_price, valueText: r1k(NMB.median_price) },
  { name: "Outside city limits and other towns", value: REST.median_price, valueText: r1k(REST.median_price) },
  { name: "City of Myrtle Beach", value: CMB.median_price, valueText: r1k(CMB.median_price) },
  { name: "Every other kind of home, for comparison", value: OS.median_price, valueText: r1k(OS.median_price), reference: true },
], { caption: "Middle condo sale price in Horry County, by area", nameLabel: "Area", valueLabel: "middle price",
  note: "Deeds Horry County recorded in the past year. The areas follow city limits. Every other kind of home means houses, townhouses outside a condo and mobile homes on owned land." });

/* ---------------------------------------------------------------------------- */
/* Homes for sale (rows 12 to 19), counted in total.                               */
const LC = L.groups.condos, LO = L.groups.oceanfront_building, LH = L.groups;
const HOUSE_LIST = LH.houses.listings + LH.townhouses.listings;
const CONDO_SUPPLY = LC.listings / (CS.sales / 12), HOUSE_SUPPLY = HOUSE_LIST / (OS.sales / 12);
must(Math.round(CONDO_SUPPLY) === 12 && Math.round(HOUSE_SUPPLY) === 4, "row 12 months of supply changed");
const share = (a, b) => a / b;
const inN = (a, b, n) => Math.round(a / b * n);
must(inN(LC.flags.str_allowed, LC.listings, 10) === 7 && inN(LO.flags.str_allowed, LO.listings, 100) === 94, "row 17 shares changed");
must(inN(LC.flags.hoa_includes_insurance, LC.listings, 10) === 8, "row 18 share changed");
must(Math.round(LC.listings / LC.flags.fha_accepted) === 9 && Math.round(LC.listings / LC.flags.va_accepted) === 12, "row 19 shares changed");
const OVER_1K = LC.listings - LC.dues_at_or_under["1000"];
must(inN(OVER_1K, LC.listings, 5) === 1, "row 14: about 1 in 5 over $1,000");
const SMALL = LO.beds_exact["0"] + LO.beds_exact["1"];
must(inN(SMALL, LO.listings, 10) === 6, "row 15: about 6 in 10 oceanfront units for sale are studios or one-bedrooms");
/* Where the condos are (row 38): condo units by area, county parcels. */
const BYA = F.stock.by_area;
must(near(BYA["North Myrtle Beach"].units, 1000) === "12,000" && near(BYA["City of Myrtle Beach"].units, 1000) === "12,000"
  && near(ST_UNITS_REST(), 1000) === "17,000", "row 38: units by area changed");
function ST_UNITS_REST() { return F.stock.units - BYA["North Myrtle Beach"].units - BYA["City of Myrtle Beach"].units; }
/* ---------------------------------------------------------------------------- */
/* The worked example (row 23, corrected): the middle two-bedroom for sale in an oceanfront building with a  */
/* Myrtle Beach address. Millage from the 2026 levy (row 21).                                                 */
const LEVY_TXT = fs.readFileSync(path.join(DATA, "raw", "tax-levy-2026.txt"), "utf8");
const mill = (re) => { const m = LEVY_TXT.match(re); must(m, `levy line ${re}`); return Number(m[1]); };
const COUNTY = mill(/TOTAL LEVY FOR COUNTY PURPOSES \.+([\d.]+)/), SCHOOL = mill(/TOTAL LEVY FOR SCHOOL PURPOSES \.+([\d.]+)/);
const MB_CITY = mill(/\nMYRTLE BEACH\.+([\d.]+)/), FIRE = mill(/COUNTY FIRE DISTRICT \.+([\d.]+)/), APP = mill(/COUNTY FIRE APPARATUS REPLACEMENT \.+([\d.]+)/), WASTE = mill(/WASTE MANAGEMENT \.+([\d.]+)/);
const MILLS_CITY = Math.round((COUNTY + SCHOOL + MB_CITY) * 10) / 10, MILLS_OUT = Math.round((COUNTY + SCHOOL + FIRE + APP + WASTE) * 10) / 10;
must(MILLS_CITY === 254.6 && MILLS_OUT === 201, "row 21 millage changed");
const EX = L.oceanfront_building_2bed;
const FEE_YEAR = EX.median_dues_25 * 12, TAX_CITY = EX.median_ask_5k * 0.06 * MILLS_CITY / 1000, TAX_OUT = EX.median_ask_5k * 0.06 * MILLS_OUT / 1000;
const TOTAL = FEE_YEAR + TAX_CITY;
must(r100(TOTAL) === "$18,100" && r100(TAX_CITY) === "$5,200" && r100(TAX_OUT) === "$4,100", "row 23 example changed");
const COST_TABLE = `<figure class="c3-cd-fig2"><div class="c3-cd-bill" role="table" aria-label="What one typical oceanfront condo costs to own for a year, before insurance and the loan">`
  + `<p class="hd" aria-hidden="true">One typical oceanfront condo, a year</p>`
  + `<div role="row"><span role="rowheader">HOA fee <small>${usd(EX.median_dues_25)} a month</small></span><span role="cell">${r100(FEE_YEAR)}</span></div>`
  + `<div role="row"><span role="rowheader">Property tax <small>City of Myrtle Beach, at the rental rate</small></span><span role="cell">${r100(TAX_CITY)}</span></div>`
  + `<div role="row" class="tot"><span role="rowheader">Total before insurance and the loan</span><span role="cell">${r100(TOTAL)}</span></div>`
  + `<p class="nt">The middle two-bedroom for sale in an oceanfront building with a Myrtle Beach address asks about ${usd(EX.median_ask_5k)}. Not in the total: insurance on the unit, the loan, and the running costs of renting it.</p></div></figure>`;
/* Row 34 (VERIFIED-BY-FIXER): the 6 percent share of the example's value, and the most the exemption can take off. */
const ASSESSED = EX.median_ask_5k * 0.06, TAX_EXEMPT_MIN = TAX_CITY * 0.75;
must(ASSESSED === 20400 && r100(TAX_EXEMPT_MIN) === "$3,900", "row 34 arithmetic changed");

/* What a nightly rental keeps (rows 35 and 36, VERIFIED-BY-FIXER), against the fee and tax above. */
const AV = SI.average_listing, TQ = SI.top_quarter_listing, TWO = SI.by_size["2 bedrooms"];
must(AV.gross - AV.running_costs === AV.left_for_housing_costs && TQ.gross - TQ.running_costs === TQ.left_for_housing_costs, "row 35: AirROI's table does not add up");
must(r100(AV.left_for_housing_costs) === "$16,000" && r100(TQ.left_for_housing_costs) === "$27,700" && TWO.median_year === 20100, "row 35 changed");
const SHORT = TOTAL - AV.left_for_housing_costs, SPARE = TQ.left_for_housing_costs - TOTAL;
must(r100(SHORT) === "$2,100" && r100(SPARE) === "$9,600", "row 35 arithmetic changed");
const EARN_CHART = G.bars([
  { name: "In the top quarter (more than 3 in 4 rentals), all year", value: TQ.left_for_housing_costs, valueText: r100(TQ.left_for_housing_costs), feature: `takes in about ${r100(TQ.gross)}` },
  { name: "The average rental", value: AV.left_for_housing_costs, valueText: r100(AV.left_for_housing_costs), feature: `takes in about ${r100(AV.gross)}` },
  { name: "HOA fee and tax on one typical oceanfront two-bedroom", value: TOTAL, valueText: r100(TOTAL), feature: "from the yearly cost above", reference: true },
], { caption: "What a nightly rental has left each year after its running costs, against one condo's fee and tax", nameLabel: "Rental", featureLabel: "a year", valueLabel: "left a year",
  note: `AirROI, every active Airbnb listing in the Myrtle Beach market, ${SI.period}. Running costs are Airbnb's fee, cleaning, utilities, supplies, repairs, a rental insurance policy and the permit, with no manager.` });
const MG = SI.management;
const MANAGE = compareCards([
  { name: "Hands-off management", cells: { take: `About ${MG.fullServiceLow} to ${MG.fullServiceHigh} percent`, does: "Marketing, guests, accounting, repairs" } },
  { name: "A basic plan", cells: { take: `About ${Math.round(MG.basicLow)} to ${Math.round(MG.basicHigh)} percent`, does: "Marketing, guests, basic accounting" } },
  { name: "You run it yourself", cells: { take: "Nothing", does: "You do the work" } },
], [{ key: "take", label: "Takes, of gross profit" }, { key: "does", label: "What it does" }], { caption: "What a rental manager takes on the Grand Strand", nameLabel: "Who runs it" });
must(Math.abs(ZC.change_from_recent_peak_pct) > 10 && Math.abs(ZC.change_from_recent_peak_pct) < 12, "row 3: more than a tenth below the 2023 high");
must(MG.fullServiceLow === 40 && MG.fullServiceHigh === 60 && Math.round(MG.basicLow) === 13 && Math.round(MG.basicHigh) === 17, "row 36 management ranges changed");

/* ---------------------------------------------------------------------------- */
/* Who owns condos (row 7, corrected).                                             */
const ST = F.stock;
const HOME_CHART = G.bars([
  { name: "Condo units", value: ST.pct_4pct, valueText: "About 1 in 5" },
  { name: "Every other kind of home", value: ST.other_homes.pct_4pct, valueText: "About 6 in 10" },
], { caption: "Homes in Horry County taxed at the 4 percent rate for a home its owner lives in", nameLabel: "Kind of home", valueLabel: "share", max: 100,
  note: "County parcel records. The rest are taxed at 6 percent: rentals, second homes and homes whose owner has not claimed the lower rate." });
must(inN(ST.units_4pct, ST.units, 5) === 1 && inN(ST.other_homes.homes_4pct, ST.other_homes.homes, 10) === 6, "row 7 shares changed");

/* Flood (row 28, corrected). */
const FL = F.flood_condo_sales;
const HIGH = FL.by_zone.AE + FL.by_zone.VE;
must(Math.round(FL.sales_with_zone / HIGH) === 6 && Math.round(FO.pct_high_risk) === 10, "row 28 shares changed");

/* Units in large complexes (row 6, corrected). */
const BIG = ST.units_per_regime.units_in_regimes_100_plus;
must(BIG / ST.units < 0.5 && BIG / ST.units > 0.45, "row 6: almost half");

/* ---------------------------------------------------------------------------- */
/* The decision table (section 1), every row from a verified fact.                */
const DECIDE = compareCards([
  { name: "You want the lowest price into a beach rental", cells: { pick: "A condo", why: "Oceanfront: half ask under $200,000" } },
  { name: "You are counting on the price to rise", cells: { pick: "A house", why: "Houses fell less and grew more" } },
  { name: "You want short-term rentals near the ocean", cells: { pick: "An oceanfront condo", why: `Oceanfront: ${inN(LO.flags.str_allowed, LO.listings, 100)} in 100 say they allow it` } },
  { name: "You need an FHA or VA loan", cells: { pick: "Most likely a house", why: "Horry County has 9 FHA-approved ones" } },
  { name: "You may need to sell within a few years", cells: { pick: "A house", why: "Condos sit longer; houses sell sooner" } },
  { name: "You do not want to manage a roof, a pool or the building's insurance", cells: { pick: "A condo", why: "The HOA takes care of the building" } },
], [{ key: "pick", label: "The better choice" }, { key: "why", label: "Why" }],
{ caption: "Condo or house: which suits each kind of investor", nameLabel: "If this is you" });

/* The two tax rates (row 20, corrected), as cards. */
const TAX_CARDS = compareCards([
  { name: "The home you live in", cells: { rate: "4 percent of its value" } },
  { name: "A unit rented out", cells: { rate: "6 percent of its value" } },
  { name: "A second home", cells: { rate: "6 percent of its value" } },
], [{ key: "rate", label: "The tax rate applies to" }], { caption: "Property tax on a South Carolina condo, by how it is used", nameLabel: "How the condo is used" });

/* What decides a building (section 9): only lines a verified row or a story supports (critic, fix round 1). */
const STEPS = [
  ["dollar", "The budget and the fee", "What the fee pays for, how much it has risen, and whether the HOA collects enough to pay its bills."],
  ["calendar", "The savings for repairs", `How much the HOA has ${h.a("/hoa/reserves/", "saved")} for roofs, elevators and balconies, and any ${h.a("/hoa/special-assessments/", "special assessment")} voted or planned. An older building may charge one for a large repair.`],
  ["key", "The rental rules", "Whether the rules allow short-term rentals, and whether the building runs its own rental program."],
  ["home", "The loan", "Whether a normal loan, an FHA loan or a VA loan works in the building."],
  ["flood", "The flood zone", `About 1 in ${Math.round(FL.sales_with_zone / HIGH)} condos sold last year sat in a high-risk flood zone, against about 1 in ${Math.round(100 / FO.pct_high_risk)} other homes.`],
];
const STEP_LIST = `<ol class="c3-cd-steps">` + STEPS.map(([ic, t, d]) => `<li><span class="i" aria-hidden="true">${icon(ic, { size: 22 })}</span><span><strong>${t}.</strong> ${d}</span></li>`).join("") + `</ol>`;

/* The real story (boston-hotel-manager). Label: the wording shipped on the relocating pages ("his own numbers ... not a promise");
   the stories.json label "from a real story" fails build.js audit ("real X" intensifier). REVIEW-1.md. */
must(Math.round(120000 / 3 / 1000) === 40, "story arithmetic");
const STORY = `<aside class="c3-cd-story" aria-label="A real owner's numbers"><p class="lb">His own numbers, not a promise</p>`
  + `<p>A friend of ours ran a hotel in Boston. When he retired, a house sale and his savings bought three condos in one oceanfront building here.</p>`
  + `<p>He had about $100,000 saved and sold his Massachusetts house for about $450,000. The three condos gross about $120,000 a year, an average of about $40,000 a condo, and roughly half of it is profit. He now helps manage fourteen units.</p></aside>`;

/* Photos (photos.json; each looked at full size). Where the condos are: one stretch in each area (row 38). */
const PREC = (n) => read("photos.json").photos.find((r) => r.file.endsWith(`/${n}.webp`));
const GALLERY = ph.gallery(["north-myrtle-beach-condos-2011", "myrtle-beach-condo-towers-2011", "garden-city-condos-2011"]
  .map((n) => ({ name: n, alt: PREC(n).alt, caption: PREC(n).caption })), { label: "Oceanfront condo buildings in North Myrtle Beach, the City of Myrtle Beach and Garden City Beach", ratio: "16/9" })
  /* The three-up grid is about 345 px a photo in this column, not the 250 px photos.js assumes (NEEDS.md). */
  .split('sizes="(max-width: 699px) 100vw, 250px"').join('sizes="(max-width: 699px) 100vw, 360px"');
ph.share("myrtle-beach-condo-towers-2011");

/* Design pass, 2026-11-07 (redo/invest-condos/DESIGN.md): a two-line headline, a short contents list, one card style
   (charts, the bill and the offers), plain tables and lists, and one block width of 720 px. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const DESIGN_CSS = ""
  /* 1. The headline: the italic sub line at about half the H1's size; on a phone the tiles are short rows under hairlines, with no box. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* 2. The contents list: no card, in columns between two rules. */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}`
  /* The FAQ's label is its H2, the one long label (mkpage has no short contents label for the FAQ): on a wide screen it takes the last row to itself, so it stays on one line. */
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] li:last-child{grid-column:1/-1}}`
  /* 3. Tables and lists without cards. */
  + `${S} .c3-cc,${S} div[style^="overflow-x:auto;margin:1.2rem 0"]{${FLAT};padding:0!important}`
  + `${S} .c3-cc thead th,${S} div[style^="overflow-x:auto;margin:1.2rem 0"] thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${S} .c3-cc th:first-child,${S} .c3-cc td:first-child,${S} div[style^="overflow-x:auto;margin:1.2rem 0"] th:first-child,${S} div[style^="overflow-x:auto;margin:1.2rem 0"] td:first-child{padding-left:0}`
  + `@media (max-width:39.999em){${S} .c3-cc tbody tr{${FLAT};border-top:${RULE}!important;margin:0!important;padding:.7rem 0 .75rem!important}`
  + `${S} .c3-cc tbody tr:last-child{border-bottom:${RULE}!important}${S} .c3-cc th,${S} .c3-cc td{padding-left:0!important;padding-right:0!important}}`
  + `${S} ol.c3-cd-steps{gap:0!important}${S} ol.c3-cd-steps li{${FLAT};border-top:${RULE}!important;padding:.85rem 0!important}${S} ol.c3-cd-steps li:last-child{border-bottom:${RULE}!important}`
  + `${S} .c3-cd-story{background:none!important;border-radius:0!important;padding:.2rem 0 .2rem 1.2rem!important}`
  + `${S} .c3ph-gal>figure{${FLAT};padding:0!important}${S} .c3ph-gal>figure figcaption{padding:.5rem 0 0!important}`
  /* 4. One block width; the bill keeps the charts' card. */
  + `${S} .c3-cc,${S} .c3-gchart,${S} figure.c3-cd-fig2,${S} div[style^="overflow-x:auto;margin:1.2rem 0"],${S} .c3-cd-story,${S} ol.c3-cd-steps{max-width:720px!important;box-sizing:border-box}`
  + `${S} figure.c3-cd-fig2{border-radius:var(--g-r,20px)!important}`
  + `@media (min-width:1100px){${S} .c3-cd-side{display:grid;grid-template-columns:minmax(0,665px) minmax(0,380px);grid-template-rows:auto auto auto 1fr;column-gap:2.5rem;align-items:start}`
  + `${S} .c3-cd-side>*{grid-column:1}${S} .c3-cd-side>figure.c3-cd-fig2{grid-column:2;grid-row:1/-1;margin:.2rem 0 0!important;max-width:none!important}}`;

/* The page's own styles: the chart, the bill, the steps and the story. */
const BAND_END = 'main#main>section[style^="background:var(--navy)"]:has(>.wrap>h2)';
const PAGE_CSS = "<style>"
  + "main#main .c3-cd-fig{max-width:640px}main#main figure.c3-cd-fig2{max-width:640px}"
  + "main#main svg.c3-cd-chart{display:block;max-width:600px;height:auto}"
  + "main#main svg.c3-cd-chart text.ct{font-family:var(--sans),system-ui,sans-serif;font-size:15px;fill:#4a5763}"
  + "main#main svg.c3-cd-chart text.cl{font-family:var(--sans),system-ui,sans-serif;font-size:15px;font-weight:700;stroke:#fff;stroke-width:6px;stroke-linejoin:round;paint-order:stroke}"
  + "@media (min-width:700px){main#main svg.c3-cd-chart text.ct,main#main svg.c3-cd-chart text.cl{font-size:11px}}"
  + ".c3-cd-legend{display:flex;flex-wrap:wrap;gap:.35rem 1.1rem;margin:.5rem 0 .4rem;padding:0;list-style:none}"
  + ".c3-cd-legend li{display:flex;align-items:center;gap:.5rem;color:var(--muted);font-size:1rem;line-height:1.35;margin:0}"
  + ".c3-cd-line{display:inline-block;width:26px;height:4px;border-radius:2px}"
  + "main#main .c3-cd-bill{max-width:620px;margin:0;padding:0;background:none;border:0;box-shadow:none}"
  + "main#main .c3-cd-bill .hd{font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1.05rem;margin:0 0 .5rem}"
  + "main#main .c3-cd-bill [role=row]{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding:.6rem 0;border-bottom:1px solid rgba(28,32,40,.1)}"
  + "main#main .c3-cd-bill [role=rowheader]{color:var(--navy);font-size:1.02rem;line-height:1.4}"
  + "main#main .c3-cd-bill small{display:block;color:var(--muted);font-size:.95rem;line-height:1.4}"
  + "main#main .c3-cd-bill [role=cell]{font-family:var(--serif);color:var(--navy);font-size:1.3rem;white-space:nowrap}"
  + "main#main .c3-cd-bill .tot{border-bottom:0;border-top:2px solid var(--navy);margin-top:.1rem}"
  + "main#main .c3-cd-bill .tot [role=rowheader]{font-weight:600}"
  + "main#main .c3-cd-bill .tot [role=cell]{font-size:1.55rem;color:var(--brass-ink,#8a5226)}"
  + "main#main .c3-cd-bill .nt{color:var(--muted);font-size:.95rem;line-height:1.6;margin:.6rem 0 0}"
  + "main#main ol.c3-cd-steps{list-style:none;counter-reset:s;margin:1rem 0 1.4rem;padding:0;max-width:720px;display:grid;gap:.6rem}"
  + "main#main ol.c3-cd-steps li{counter-increment:s;display:flex;gap:.8rem;align-items:flex-start;padding:.8rem .9rem;border-radius:14px;background:rgba(255,255,255,.6);border:1px solid rgba(28,32,40,.1);color:var(--muted);line-height:1.6;margin:0}"
  + "main#main ol.c3-cd-steps li strong{color:var(--navy)}"
  + "main#main ol.c3-cd-steps .i{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:2.4rem;height:2.4rem;border-radius:50%;background:var(--ivory-2);color:var(--brass-ink,#8a5226)}"
  + "main#main .c3-cd-story{max-width:680px;margin:1.4rem 0 1.6rem;padding:1.1rem 1.3rem;border-left:4px solid var(--brass);border-radius:0 14px 14px 0;background:rgba(255,255,255,.6)}"
  + "main#main .c3-cd-story p{color:var(--muted);line-height:1.7;margin:0 0 .6rem}"
  + "main#main .c3-cd-story p:last-child{margin:0}"
  + "main#main .c3-cd-story .lb{font-family:var(--sans);font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--brass-ink,#8a5226);font-weight:600}"
  + "main#main .c3-cd-list{color:var(--muted);line-height:1.7;max-width:720px;margin:0 0 1rem 1.3rem;padding:0}"
  + "main#main .c3-cd-list li{margin-bottom:.35rem}"
  + "@media (min-width:700px){main#main ul.c3-cd-cols{columns:2;column-gap:2rem;max-width:680px}main#main ul.c3-cd-cols li{break-inside:avoid}}"
  + "main#main figure.c3-cd-fig2{padding:1rem 1.15rem .95rem!important;margin:1.1rem 0 1.5rem!important}"
  /* The end offer band: the website's listing notice follows it inside <main>, so glass.js's top-bar rules
     reach it and turn it pale (retirees NEEDS.md 1; the same fix as /buyers/cost-to-own/). This puts the dark panel back. */
  + `${BAND_END}{padding:.9rem 0 1.4rem!important}${BAND_END}>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important}`
  + `${BAND_END}>.wrap>h2{color:var(--ivory)!important}${BAND_END}>.wrap>p{color:rgba(244,239,232,.82)!important}`
  + `@media (max-width:699px){${BAND_END}>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}${BAND_END}>.wrap>h2{font-size:1.5rem!important;line-height:1.25}}`
  /* Shared-code faults this page works around until the shared fix lands (NEEDS.md, fix round 1): the homes search
     bar runs 44 px past a 320 px window, and the header's phone number runs 5 px past a 1024 px window. */
  + "@media (max-width:359px){main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0;max-width:100%}main#main .hx-fb-q{flex-wrap:wrap}"
  + "main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%}main#main .hx-fb-go{flex:1 1 100%}main#main .hx-fb-pills{max-width:100%;flex-wrap:wrap}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone-num{display:none}}"
  + DESIGN_CSS
  + "</style>";

/* Sources a reader can open. */
const ZILLOW = "https://www.zillow.com/research/data/";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const HUD = "https://entp.hud.gov/idapp/html/condlook.cfm";

const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const AIRROI = SI.source_url;
const III = "https://www.iii.org/article/coverage-for-renting-out-your-home";
const MB_ZONING = "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php";

/* Offers (owner, RULES CTA-1 to CTA-4): each one tied to what its section proved, every label on his record, never the
   same button twice. Every promise is a story or a verified row: the rental rules (hoa-rental-bans-filtered), the
   insurance quote (insurance-quote-before-offer), the lender check (row 19), the discount (distressed-condo-discount). */
const CTA_HREF = "/contact/";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  pageImages: () => ph.pageImages(),
  title: "Are Myrtle Beach Oceanfront Condos a Good Investment?",
  description: `Condos here fell ${pct(ZC.fall_pct)}% after 2006 and are ${Math.abs(ZC.change_from_recent_peak_pct)}% off their 2023 high. What one earns and costs a year, HOA fees, taxes, loans, and who they suit.`,
  ogTitle: "Are Myrtle Beach condos a good investment? What one earns, costs and who they suit",
  crumb: "Condo Investing",
  eyebrow: "Condo investing",
  h1: "Are Myrtle Beach condos a good investment?",
  h1em: "What one earns and costs a year, how condos compare with houses, and how to pick the building.",
  sub: "What you can expect a condo to earn and cost here, from about 2,600 condo sales, 25 years of home values and a year of rental data.",
  heroMedia: glance([
    { icon: "dollar", label: "Middle condo sale", text: r1k(CS.median_price) },
    { icon: "home", label: "Middle HOA fee", text: `${usd(LC.median_dues_25)} a month` },
    { icon: "key", label: "Typical two-bedroom nightly rental, before costs", text: `About ${r1k(TWO.median_year)} a year` },
  ]),
  heroCta: { title: "Buying a condo to rent out? Talk it through with an agent who works with investors.", label: "Talk to a specialized agent", href: CTA_HREF },
  author: "devin",
  shortAnswer: [
    `Only if it rents like the busier listings here. On a typical oceanfront two-bedroom condo, the HOA fee and the tax come to about ${r1k(TOTAL)} a year. The HOA fee is what owners pay ${h.a("/hoa/hoa-vs-poa/", "the homeowners association to run the building")}.`,
    `A rental-data company estimates the average nightly rental in the Myrtle Beach market keeps about ${r1k(AV.left_for_housing_costs)} after running costs, so it falls short. A rental that takes in as much as the top quarter here, more than 3 in 4 rentals, keeps about ${r1k(TQ.left_for_housing_costs)} if rented all year.`,
    `As a bet on the price, a house has done better. Since 2001 the typical condo here has about doubled in value, and the typical house has grown about 2.5 times.`,
  ],
  sections: [
    { h2: "Is a condo or a house the better investment in Myrtle Beach?", toc: "Condo or house", id: "condo-or-house", html: () =>
      PAGE_CSS + ph.css() +
      h.p("It depends on what you want from it. Find the row that fits you:") +
      DECIDE +
      h.p(`The rest depends on the building: its fee, its rules and whether a lender will finance it. The ${h.a("#the-building", "building section")} below lists what decides one.`) },

    { h2: "How have Myrtle Beach condo prices done compared with houses?", toc: "Prices over time", id: "prices-over-time", html: () =>
      h.p(`From its 2006 high to early 2012, the typical metro condo lost about ${pct(ZC.fall_pct)} percent of its value. The typical house lost about ${pct(ZH.fall_pct)} percent.`) +
      PRICE_CHART +
      h.p(`Condos took about ${CONDO_BACK} years to pass their 2006 high again, and houses about ${HOUSE_BACK}. Today the typical condo is worth more than a tenth less than at its 2023 high. The typical house is within 2 percent of its own high.`) +
      VALUE_TABLE +
      h.p(`The typical metro condo is now worth about ${Math.round(Math.round(RNOW * 1000) / 10)} percent of the typical house, about as low as it has been in 25 years. In mid-2006 it was about ${Math.round(RMAX[1] * 100)} percent.`) +
      h.p("For an investor, a condo here is cheap next to a house today. Its value has not grown steadily, so buy it for its income and its lower price.") },

    { h2: "What do condos cost to buy in Myrtle Beach and North Myrtle Beach?", toc: "Prices to buy", id: "prices-to-buy", html: (bg) =>
      h.p(`About ${r1k(CS.median_price)} was the middle price of condos sold in Horry County in the past year.`) +
      AREA_CHART +
      h.p(`North Myrtle Beach condos sell for about twice the City of Myrtle Beach's. Asking prices in oceanfront buildings show the same split.`) +
      h.h3("Where are the condos?") +
      h.p(`The county has about ${near(ST.units, 1000)} condo units. About ${near(BYA["North Myrtle Beach"].units, 1000)} are in North Myrtle Beach, about ${near(BYA["City of Myrtle Beach"].units, 1000)} in the City of Myrtle Beach, and about ${near(ST_UNITS_REST(), 1000)} outside city limits and in the smaller towns. On the ocean, towers and low-rise buildings stand side by side:`) +
      GALLERY +
      h.h3("How cheap can a Myrtle Beach condo be?") +
      h.p(`About 4 in 10 condos sold for under $200,000, against about 1 in 7 other homes.`) +
      h.p(`Oceanfront units still start under $200,000: about half of the condos for sale in oceanfront buildings ask less. Most are small: about 6 in 10 are studios or one-bedrooms.`) +
      h.cta("Get a list of condos for sale that fit you", "Tell us your budget and the town. We send you the condos for sale in that price range.", "Have us send condos that fit", CTA_HREF, bg) },

    { h2: "How much does it cost to own a Myrtle Beach condo each year?", toc: "Yearly cost", id: "yearly-cost", html: () =>
      /* Design pass 2026-11-07: on a wide screen the bill sits beside the paragraphs that explain it. */
      `<div class="c3-cd-side">` +
      h.p(`About ${r1k(TOTAL)} a year before insurance and the loan, for the middle two-bedroom for sale in an oceanfront building with a Myrtle Beach address. The HOA fee is most of it. Our page on ${h.a("/hoa/tax-deductible/", "whether HOA fees are tax deductible")} covers the fee on a condo you rent out.`) +
      COST_TABLE +
      h.h3("What are HOA fees on a Myrtle Beach condo?") +
      h.p(`The middle condo for sale charges a homeowners association (HOA) fee of about ${usd(LC.median_dues_25)} a month. In oceanfront buildings the middle fee is about ${usd(LO.median_dues_25)}. About 1 in 5 condos for sale charge more than $1,000 a month.`) +
      h.p(`About ${inN(LC.flags.hoa_includes_insurance, LC.listings, 10)} in 10 condos for sale say the fee includes the building's insurance, which a house owner pays alone.`) +
      `</div>` +
      h.h3("What does insurance add?") +
      h.p("You still need a policy on your own unit, and flood cover if the building sits in a flood zone. The price depends on the unit and the cover. If you buy with us, we can get you an insurance quote for the unit before you make an offer.") +
      h.p("A unit you rent out costs more to insure. In our files, a landlord policy on a house costs 15 to 20 percent more than a homeowner policy on the same house. Nationally, the Insurance Information Institute puts it at about 25 percent more.") +
      h.h3("What property tax does a rental condo pay?") +
      h.p("A condo you rent out or keep as a second home is taxed at the 6 percent rate. The home you live in is taxed at 4 percent.") +
      TAX_CARDS +
      h.p(`The rate is the share of the value that is taxed, not the tax. On the ${usd(EX.median_ask_5k)} example, 6 percent is about ${r1k(ASSESSED)}. The 2026 tax rates in the City of Myrtle Beach turn that into about ${r100(TAX_CITY)} a year, before the exemption below. Outside city limits it would be about ${r100(TAX_OUT)}; some fire districts add more.`) +
      h.p(`If you buy a condo already taxed at 6 percent and keep it at 6 percent, a quarter of its new value is exempt. The taxed value cannot fall below the county's current market value for it, so the tax inside the city could fall to about ${r100(TAX_EXEMPT_MIN)} at the lowest. You or your agent must tell the county assessor before January 31 of the first year you claim it.`) +
      h.h3("Who pays the lodging tax?") +
      h.p(`The guest, on top of the price: about 13 percent in ${h.a("/invest/str-rules/", "lodging taxes")} on a stay under 90 days inside the City of Myrtle Beach.`) },

    { h2: "What does a Myrtle Beach condo earn?", toc: "What it earns", id: "what-it-earns", html: (bg) =>
      h.p(`The typical two-bedroom nightly rental in the Myrtle Beach market takes in about ${r1k(TWO.median_year)} a year, counting listings open only part of the year. Running costs come out of that before the HOA fee and the tax:`) +
      EARN_CHART +
      h.p(`Carrying the fee and tax of the typical oceanfront two-bedroom, the average rental would fall about ${r100(SHORT)} short. A rental in the top quarter, rented all year, would cover them and keep about ${r100(SPARE)} for insurance and the loan. A condo pays when it rents like the busier listings, or when its fee and tax are lower.`) +
      STORY +
      h.h3("What does a rental manager take?") +
      h.p("It depends on how much of the work you keep. These are the ranges we see on the Grand Strand:") +
      MANAGE +
      h.p(`Rental programs here are usually in oceanfront buildings run for short-term rentals. A building's own ${h.a("/invest/rental-program-vs-airbnb/", "rental program")} is one choice; your own listing is the other. Our ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort condos guide")} covers how one building's owners rent.`) +
      h.cta("Want the numbers on one condo before you offer?", "Tell us the building or your price range. If you buy with us, an agent reads the building's rental rules, gets you an insurance quote for the unit and confirms the loan with the lender before you make an offer.", "Have us check a condo", CTA_HREF, bg) },

    { h2: "Can you rent out a Myrtle Beach condo by the night?", toc: "Renting it", id: "renting-it", html: (bg) =>
      h.p(`In most oceanfront buildings, yes. About ${inN(LO.flags.str_allowed, LO.listings, 100)} in 100 condos for sale in oceanfront buildings say they allow short-term rentals. Across all condos for sale in the county it is about ${inN(LC.flags.str_allowed, LC.listings, 10)} in 10.`) +
      h.p(`Inside the City of Myrtle Beach, nightly rentals are legal only in the zones the city shades on its ${h.a("/submarkets/myrtle-beach/", "rental map")}, apart from 24 grandfathered houses. They are most of the oceanfront hotel and condo strip, the Broadway at the Beach area, stretches of the US 17 Bypass and US 501, and The Market Common's town center. About 3 in 4 condos in the city sit in those zones.`) +
      h.p("Some buildings ban renting at all.") +
      h.cta("Want a building that lets you rent by the night?", "We take buildings that ban nightly rentals out of your search. Then we read the HOA papers for any rule that would stop your plan.", "Have us find rentable buildings", CTA_HREF, bg) +
      h.h3("Who are your neighbors in a condo building?") +
      h.p(`Mostly investors and second-home owners. About 1 in 5 condo units here is taxed at the 4 percent rate for a home its owner lives in. Of the county's other homes, about 6 in 10 are.`) +
      HOME_CHART +
      h.p("Most of your neighbors will rent their units out or use them part of the year.") },

    { h2: "Can you get a mortgage on a Myrtle Beach oceanfront condo?", toc: "Loans", id: "loans", html: () =>
      h.p(`Often not a normal one. Fannie Mae, one of the two big companies that buy normal home loans from lenders, will not buy a loan on a unit in a building ${h.a("/invest/condotel-financing/", "run like a hotel")}, even if each unit is owned separately. The signs it lists:`) +
      `<ul class="c3-cd-list c3-cd-cols"><li>registration services that check guests in, as a hotel does</li><li>the HOA or its manager renting units by the night or for short stays</li><li>daily cleaning</li><li>one key system for every unit, run by the building</li><li>owners required to put their units in a shared rental pool</li><li>rent shared with the HOA or a rental company</li></ul>` +
      h.p("It also will not buy one where one person or company owns too many of the units, or in a building facing large repairs that no one has paid for.") +
      h.h3("What is a non-warrantable condo?") +
      h.p(`A condo in a building that fails these tests. Lenders call it ${h.a("/invest/non-warrantable-condos/", "non-warrantable")}. Buildings with a rental program usually are, because so many owners are investors. That also shows the building is run for renting.`) +
      h.p(`For you it means a larger down payment, so more of your cash stays in that unit and cannot fund the next purchase. A loan officer at our preferred lender can tell you which loans work, including a ${h.a("/invest/strategies/dscr-loans/", "DSCR loan")}, which is approved on what the unit rents for.`) +
      h.h3("Can you use an FHA or VA loan on a Myrtle Beach condo?") +
      h.p(`Rarely. About 1 in ${Math.round(LC.listings / LC.flags.fha_accepted)} condos for sale say they accept an FHA loan, and about 1 in ${Math.round(LC.listings / LC.flags.va_accepted)} a VA loan. That is what the seller's agent wrote. The FHA's own list holds only 9 approved condo buildings in Horry County, so we confirm the building with the lender before you offer.`) },

    { h2: "Where are the bargains on Myrtle Beach condos?", toc: "Bargains", id: "bargains", html: (bg) =>
      h.p("With an owner in trouble, in a sound building. In our own files, condos bought from a distressed owner in a stable building sold for about 22 percent less on average. The building still qualifies for normal loans; only that one unit was mismanaged.") +
      h.cta("Want a condo like that?", "Tell us your price range. An agent looks for condos sold by an owner in trouble, in buildings that still qualify for normal loans.", "Have us find you your next investment", CTA_HREF, bg) },

    { h2: "What should you look for in a Myrtle Beach condo building?", toc: "The building", id: "the-building", html: () =>
      h.p("The building matters more than the unit. Two units with the same view can cost and earn different amounts because their buildings differ. Five parts of a building matter most:") +
      STEP_LIST +
      h.h3("Can you owe the seller's HOA dues?") +
      h.p("Yes, up to a limit. Under South Carolina's condo law, a buyer owes the seller's unpaid HOA dues together with the seller, unless the buyer bought at a foreclosure sale. Your share is capped at the amount on a statement the HOA must give you when you ask for it, so the amount is known before closing.") },
  ],
  faqTitle: "Myrtle Beach condo investing FAQ",
  faq: [
    { q: "Can you live in a Myrtle Beach condo and rent it out part of the year?", a: "Yes, but the home you live in loses the 4 percent tax rate if it is rented out more than 72 days in a calendar year, unless its owner is on active military duty under orders. Then it is taxed at 6 percent, like any rental." },
    { q: "What do you pay the HOA when you buy a Myrtle Beach condo?", a: "Usually a transfer fee, and often a few months of dues paid ahead into escrow. Both are common in condo buildings here, with or without a rental program." },
    { q: "Is it harder to sell a Myrtle Beach condo than a house?", a: `Usually. At last year's pace of sales, the condos for sale now would take about a year to sell, and the houses and townhouses about ${Math.round(HOUSE_SUPPLY)} months. A condo owner should plan on more time to sell.` },
    { q: "Are most Myrtle Beach condos in big buildings?", a: `Almost half of the county's condo units are in complexes of 100 units or more. Many others are in small buildings: the middle complex has ${ST.units_per_regime.median} units.` },
  ],
  sources: [
    { name: "Zillow Research", href: ZILLOW },
    { name: "AirROI Myrtle Beach", href: AIRROI },
    { name: "Horry County deed index", href: DEEDS },
    { name: "Horry County GIS", href: PARCELS },
    { name: "SC Code 12-37", href: T12_37 },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "SC Code 27-31", href: T27_31 },
    { name: "Horry County 2026 tax levy", href: LEVY },
    { name: "City of Myrtle Beach zoning", href: MB_ZONING },
    { name: "Fannie Mae B4-2.1-03", href: FNMA },
    { name: "HUD condo list", href: HUD },
    { name: "Insurance Information Institute", href: III },
  ],
  sourcesNote: `Sales: county deeds; rentals: AirROI; both ${SI.period}. Homes for sale: CCMLS listings on our site, counted in total. Flood: FEMA zones at each sale. Not legal, tax or loan advice.`,
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Ready to look at condos?", p: "Tell us your price range and how you plan to rent. If you buy with us, an agent reads each building's rental rules, confirms the loan with the lender and gets you an insurance quote before you make an offer.", label: "Have us help buy your next unit", href: CTA_HREF },
  keywords: "Myrtle Beach condo investment, are Myrtle Beach condos a good investment, Myrtle Beach condo rental income, Myrtle Beach condo prices, North Myrtle Beach condo prices, Myrtle Beach condo market crash, Myrtle Beach condo taxes, Myrtle Beach condo insurance, Myrtle Beach condo flood zone, condotel financing, non-warrantable condo, condo vs house investment, pros and cons of buying a condo in Myrtle Beach",
  about: "Buying a condo as an investment in Myrtle Beach and Horry County, South Carolina",
});
