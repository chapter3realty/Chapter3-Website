/* /sell/best-time-to-sell/ - the best month to sell a house in Myrtle Beach, from Horry County's own deed records: how
 * many home resales are recorded each month and at what middle price (2021 to 2025), when to list so the sale closes in
 * the strong months, condos against houses, winter, hurricane season (Hurricane Ian's week, day by day), tourist season
 * and the school year, and what matters more than the month.
 *
 * Batch 2026-11-n, Lane N (a new page). Version 1, 2026-11-08. Design: the approved pilots of batch 2026-11-a
 * (sell-fsbo, submarkets-pawleys-island, hoa-liens-and-foreclosure, invest-condos): a two-line headline with the italic
 * sub line at about half the H1 size, the answer first, one card style used once (condo or house, the one place the
 * reader chooses), plain lists under thin rules elsewhere, one block width of 720 px, and on wide screens the closings
 * chart and the photo beside the paragraphs that explain them. DESIGN.md in the batch folder says why.
 * Facts: Blog-Brain batches/2026-11-n/sell-best-time-to-sell/facts.md, VERIFIED rows, and CORRECTED rows only in the
 * verifier's "Use:" wording (VERIFY.md). Row 6 is STRUCK and not used. Struck wording: sell-best-time-to-sell-struck.json
 * (no "most homes ... March through June", no 48,338 or 17,326, no "every beach market", no "Tropical Storm Debby", no
 * "longest for January", no "last day is June 4", no $500,000 without "both", no "long-term only if" without "generally").
 * Data, never typed (website working copy, data/2026-11-n/sell-best-time-to-sell/):
 *   findings-condo-fix.json  the verifier's rerun of analyze.py with the corrected condo test (HPR or county land use
 *                            107). Every all-home value is byte for byte the same as findings.json; the house and condo
 *                            values are the corrected ones (rows 2, 4, 5). chart-months.json was made from the old
 *                            condo test, so this page does not read it (NEEDS.md asks the lead to rerun analyze.py).
 *   zillow-months.json       Zillow Research metro files, Myrtle Beach, SC: days to a contract, days to close, new
 *                            listings, new contracts, sale-to-list, price cuts (rows 7 to 10, 12, 13)
 *   photos.json              the one photo: a June day on the beach in Myrtle Beach, Loadmaster (David R. Tribble),
 *                            CC BY-SA 3.0, Wikimedia Commons, a new crop that leaves out the people nearest the camera
 *   ../../str-market.json    the month each beach town's nightly rentals earn the most (row 15)
 * Typed and checked: the BLS leisure and hospitality jobs (row 16, carried from SLTR 27), the school calendar dates
 * (row 20), the NHC dates (row 17), the IRS rules (rows 21, 22).
 * Owner questions open (OWNER-QUESTIONS.md): Q1 a seller story (the page ships without one), Q2 storms and closings
 * (offer 2 uses the fallback wording and the page says nothing about insurance), Q3 how soon the deed is recorded (the
 * charts say "recorded"; the prose says "closed" only in row 3's verified wording).
 * Fix round 1 (2026-11-08, REVIEW-1.md): the work-back table and the spring weeks now use Zillow's last 12 months (row
 * F1), since 2026 was slower than the years before; one February gap per kind of home (rows F2, F3); the 2025 price
 * pattern (row F2); fewer exact numbers; the method lines moved to "How we counted"; the tax items cut to one timing
 * line and a link; the FAQ rewritten so no answer copies the body.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/sell/best-time-to-sell/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "sell-best-time-to-sell");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings-condo-fix.json").summary;
const Z = read("zillow-months.json");
/* The site's short-term rental file as refreshed on 2026-11-03 (AirROI, 12 months to September 2026). A copy kept with this
   page so it can go live before that refresh reaches data/str-market.json; once it has, read that file again. */
const STR = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-n", "sell-best-time-to-sell", "str-market-2026-11-03.json"), "utf8"));
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r100 = (v) => (Math.round(v / 100) * 100).toLocaleString("en-US");
const M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = ["2021", "2022", "2023", "2024", "2025"];
const sumN = (by) => YEARS.reduce((a, y) => a + by[y].n, 0);

/* ---- Rows 1, 2: our count. ---- */
const ALL = F.resale_all;
const TOTAL = sumN(ALL.by_year);
const POOL = (m) => ALL.pooled_5yr_by_month[String(m)].n;
const MARJUN = [3, 4, 5, 6].reduce((a, m) => a + POOL(m), 0);
const MARJUN_PCT = Math.round(100 * MARJUN / TOTAL);
const HOUSES = sumN(F.resale_house.by_year), CONDOS = sumN(F.resale_condo.by_year), NEW = sumN(F.new.by_year);
if (TOTAL !== 65664 || MARJUN !== 25170 || MARJUN_PCT !== 38 || POOL(6) !== 6383 || POOL(1) !== 4363) throw new Error("row 1 moved");
if (HOUSES !== 37399 || CONDOS !== 28265 || NEW !== 21968) throw new Error("row 2 moved (corrected condo test)");
/* Jan and Feb: 12 to 16 percent of each year (row 1). */
const JF = YEARS.map((y) => 100 * (ALL.by_month[`${y}-01`].n + ALL.by_month[`${y}-02`].n) / ALL.by_year[y].n);
if (Math.floor(Math.min(...JF)) !== 11 || Math.round(Math.max(...JF)) !== 16) throw new Error("row 1: the Jan-Feb share moved");
/* Jan and Feb together in a typical year: 6.63 + 6.75 = 13.4 percent (row 1, row F4). */
const JF_TYP = Math.round(ALL.typical_month["1"].avg_share_of_year_pct + ALL.typical_month["2"].avg_share_of_year_pct);
if (JF_TYP !== 13) throw new Error("row F4: the typical Jan-Feb share moved");
/* 2025: October was the busiest month (row 1). */
const B25 = Array.from({ length: 12 }, (_, i) => ALL.by_month[`2025-${String(i + 1).padStart(2, "0")}`].n);
if (B25.indexOf(Math.max(...B25)) !== 9) throw new Error("row 1: 2025's busiest month moved");

/* ---- Row 3: middle price by month against the 13 months around it. ---- */
const C = (m) => ALL.centred_13mo[String(m)];
const FEB = C(2), JUN = C(6), MAY = C(5);
const SPREAD = JUN.avg_pct - FEB.avg_pct;
const MID = ALL.by_year["2024"].median;
const EXAMPLE = Math.round(MID * SPREAD / 100 / 1000) * 1000;
if (FEB.years_above !== 0 || MAY.years_above !== 4 || JUN.years_above !== 4 || Math.round(SPREAD) !== 7 || Math.round(SPREAD * 10) !== 65) throw new Error("row 3 moved");
if (MID !== 305000 || EXAMPLE !== 20000) throw new Error("row 3: the $20,000 illustration moved");

/* ---- Rows 4, 5: houses and condos (the corrected condo test). ---- */
const HC = (m) => F.resale_house.centred_13mo[String(m)], CC = (m) => F.resale_condo.centred_13mo[String(m)];
if (Math.round(HC(6).avg_pct) !== 3 || HC(6).years_above !== 5 || HC(7).years_above !== 5 || HC(9).years_above !== 5 || Math.round(HC(2).avg_pct) !== -2 || HC(2).years_above !== 1) throw new Error("row 4 moved");
if (Math.round(CC(4).avg_pct) !== 4 || Math.round(CC(5).avg_pct) !== 4 || CC(4).years_above !== 4 || CC(5).years_above !== 4 || Math.round(CC(2).avg_pct) !== -5 || CC(2).years_above !== 0) throw new Error("row 5 moved");
/* Row F3: one February gap per kind of home. Houses: June against February. Condos: May against February. February is
   the lowest month of the twelve for houses and for condos. Condos that closed in September to November sold within
   about 1 percent of the months around them. */
const lowest = (fn) => [...Array(12).keys()].reduce((lo, i) => fn(i + 1).avg_pct < fn(lo).avg_pct ? i + 1 : lo, 1);
const GAP_HOUSE = Math.round(HC(6).avg_pct - HC(2).avg_pct), GAP_CONDO = Math.round(CC(5).avg_pct - CC(2).avg_pct);
if (GAP_HOUSE !== 5 || GAP_CONDO !== 9 || lowest(HC) !== 2 || lowest(CC) !== 2 || lowest(C) !== 2) throw new Error("row F3 moved");
if (![9, 10, 11].every((m) => Math.abs(CC(m).avg_pct) < 1.5 && Math.round(CC(m).avg_pct) <= 1)) throw new Error("row F3: the fall condo months moved");
/* Row F2: 2025, the flatter year. February was again the lowest month for all homes; houses that closed in June and July,
   and condos that closed in April and May, still sold above the months around them. */
const Y25 = 4, e25 = (fn, m) => fn(m).each_year_pct[Y25];
if (lowest((m) => ({ avg_pct: e25(C, m) })) !== 2 || !(e25(HC, 6) > 0.5 && e25(HC, 7) > 0.5 && e25(CC, 4) > 0.5 && e25(CC, 5) > 0.5)) throw new Error("row F2: the 2025 pattern moved");

/* ---- Rows 7 to 10: Zillow, the Myrtle Beach area. ---- */
const PEND = (m) => Z.med_doz_pending.avg_by_month[String(m)];
const CLOSE = (m) => Z.mean_days_to_close.avg_by_month[String(m)];
const closeDays = Object.values(Z.mean_days_to_close.avg_by_month);
const CL_LO = Math.round(Math.min(...closeDays)), CL_HI = Math.round(Math.max(...closeDays));
if (Math.round(PEND(3)) !== 26 || Math.round(PEND(12)) !== 53 || CL_LO !== 36 || CL_HI !== 42) throw new Error("rows 7, 8 moved");
const NL = Z.new_listings.avg_by_month, NP = Z.new_pending.avg_by_month;
if (!(NL["12"] / NL["4"] < 0.5) || Math.min(...Object.values(NL)) !== NL["12"] || Math.round(NP["12"] / 10) * 10 !== 640 || Math.round(NP["1"] / 10) * 10 !== 1110) throw new Error("row 10 moved");
/* Row F1: the last 12 months of Zillow's monthly series (days to a contract, October 2025 to September 2026; days to
   close, September 2025 to August 2026). Spring 2026 was slower than the years before, so the work-back table uses
   these. Days to close are one figure, their 12-month average, so the table does not rest on Zillow's month label. */
const last12 = (ser) => { const o = {}; Object.entries(ser).sort().slice(-12).forEach(([d, v]) => { o[+d.slice(5, 7)] = v; }); return o; };
const PEND12 = last12(Z.med_doz_pending.series), CLOSE12 = last12(Z.mean_days_to_close.series);
const CLOSE_AVG = Math.round(Object.values(CLOSE12).reduce((a, b) => a + b, 0) / 12);
const SPRING26 = [3, 4, 5].map((m) => PEND12[m]);
if (Object.keys(PEND12).length !== 12 || SPRING26.join() !== "45,46,52" || CLOSE_AVG !== 37 || Math.floor(Math.min(...SPRING26) / 7) !== 6 || Math.floor(Math.max(...SPRING26) / 7) !== 7) throw new Error("row F1 moved");
if (Math.round((PEND(3) + PEND(4) + PEND(5)) / 3 / 7) !== 4) throw new Error("row 7: the years-before spring weeks moved");

/* ---- Rows 12, 13: the market now and the asking price. ---- */
const INV = Z.invt_fs, DTP = Z.med_doz_pending, CUT = Z.perc_listings_price_cut, STL = Z.median_sale_to_list;
if (INV.latest[0] !== "2026-09-30" || Math.round(INV.latest[1] / 1000) !== 8 || DTP.latest[1] !== 53 || DTP.year_before[1] !== 61 || Math.round(CUT.latest[1] * 10) !== 3) throw new Error("row 12 moved");
/* Row F8: 53 days against 61 a year earlier is about a week faster. */
if (Math.round((DTP.year_before[1] - DTP.latest[1]) / 7) !== 1) throw new Error("row F8 moved");
/* Row 13, said as one range (row F7): 97.1 to 97.9 percent in every month, "about 97 to 98 percent". */
const STLV = Object.values(STL.avg_by_month).map((v) => 100 * v);
if (Math.floor(Math.min(...STLV)) !== 97 || Math.ceil(Math.max(...STLV)) !== 98) throw new Error("row 13 moved");

/* ---- Row 11: the year. ---- */
const BY = ALL.by_year, JO = ALL.jan_oct;
if (BY["2021"].median !== 230000 || BY["2022"].median !== 275001 || BY["2024"].median !== 305000 || JO["2026"].median !== 305000 || JO["2025"].median !== 304000) throw new Error("row 11 moved");
const RISE = Math.round(100 * (BY["2022"].median / BY["2021"].median - 1));
if (RISE !== 20) throw new Error("row 11: the 2021-2022 rise moved");

/* ---- Row 14: out-of-state buyers by month. ---- */
const OOS = F.out_of_state_by_month.by_month;
if (Math.round(OOS["7"].pct) !== 28 || Math.round(OOS["4"].pct) !== 33 || Math.min(...Object.values(OOS).map((x) => x.pct)) !== OOS["7"].pct) throw new Error("row 14 moved");

/* ---- Row 15: rental months (AirROI via the site's file). ---- */
const MK = STR.markets;
if (MK.length !== 8 || !MK.every((m) => m.peakMonth === "July") || MK.filter((m) => m.lowMonth === "January").length !== 7) throw new Error("row 15 moved");

/* Row F5: leisure and hospitality jobs, January 32.3k and July 45.6k in 2026 (row 16): about 40 percent more in July. */
if (Math.round((45.6 / 32.3 - 1) * 10) !== 4) throw new Error("row F5 moved");

/* ---- Rows 18, 19: hurricane season and Ian's days. ---- */
const SH = (m) => ALL.typical_month[String(m)].avg_share_of_year_pct;
if (Math.floor(SH(10)) !== 8 || Math.floor(SH(8)) !== 8 || Math.round(SH(7) * 10) !== 84) throw new Error("row 18 moved");
const IAN = F.storm_days.ian_2022, DEB = F.storm_days.debby_2024;
const wk = (o, from, to) => Object.entries(o).filter(([d]) => d >= from && d <= to).reduce((a, [, v]) => a + v, 0);
if (IAN["2022-09-29"] !== 97 || IAN["2022-09-30"] !== 0 || IAN["2022-10-03"] !== 64 || IAN["2022-10-04"] !== 94) throw new Error("row 19: Ian's days moved");
if (wk(IAN, "2022-09-19", "2022-09-23") !== 258 || wk(IAN, "2022-10-03", "2022-10-07") !== 317) throw new Error("row 19: Ian's weeks moved");
if (DEB["2024-08-08"] !== 0 || DEB["2024-08-09"] !== 63 || wk(DEB, "2024-07-29", "2024-08-02") !== 262 || wk(DEB, "2024-08-05", "2024-08-09") !== 163 || wk(DEB, "2024-08-12", "2024-08-16") !== 230) throw new Error("row 19: Debby's weeks moved");
/* Row F6: the fourth week on the Ian chart, Oct 10 to 14, 2022 (29, 39, 46, 58, 56). */
if (wk(IAN, "2022-10-10", "2022-10-14") !== 228) throw new Error("row F6: Ian's fourth week moved");

/* ---- Links ---- */
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const ZR = "https://www.zillow.com/research/data/";
const NHC = "https://www.nhc.noaa.gov/climo/";
const IAN_TCR = "https://www.nhc.noaa.gov/data/tcr/AL092022_Ian.pdf";
const DEB_TCR = "https://www.nhc.noaa.gov/data/tcr/AL042024_Debby.pdf";
const HCS = "https://www.horrycountyschools.net/about-hcs/hcs-calendars";
const IRS701 = "https://www.irs.gov/taxtopics/tc701";
const IRS409 = "https://www.irs.gov/taxtopics/tc409";
const BLS = "https://download.bls.gov/pub/time.series/sm/sm.data.42.SouthCarolina";
const CTA = "/contact/";

/* ---- Chart A (row 1): sales recorded each month, five years added together. The four busiest in color. ---- */
const CHART_A = G.bars(M.map((name, i) => ({ name, value: POOL(i + 1), valueText: n0(POOL(i + 1)), reference: !(i >= 2 && i <= 5) })), {
  caption: "Home sales recorded each month, 2021 to 2025",
  nameLabel: "Month", valueLabel: "home sales recorded", compact: true,
  note: "Horry County, the five years added together, from our count of county deeds. Resales only: builders' sales of new homes are left out. March to June, the four busiest months, are in color." });

/* ---- Chart B (row 3): each month's middle price against the 13 months around it. Bars left of the middle line are
   lower, right of it higher. ---- */
const SCALE = 5;
if (Math.max(...M.map((_, i) => Math.abs(C(i + 1).avg_pct))) > SCALE) throw new Error("chart B: a bar runs past its scale");
/* Round half away from zero, as the ledger does (-1.45 is 1.5 lower, -0.95 is 1.0 lower). */
const pct1 = (v) => (Math.round(Math.abs(v) * 10 + 1e-9) / 10).toFixed(1);
if (pct1(-1.45) !== "1.5" || pct1(-0.95) !== "1.0") throw new Error("chart B rounding");
const CHART_B = `<figure class="bt-fig bt-div"><p class="cap" id="btDivCap">How much more or less homes sold for in each month</p>`
  + `<div role="table" aria-labelledby="btDivCap"><div role="rowgroup" class="sr"><div role="row"><span role="columnheader">Month</span><span role="columnheader">Middle price, higher or lower than nearby months</span></div></div><div role="rowgroup">`
  + M.map((name, i) => {
    const v = C(i + 1).avg_pct, w = Math.round(Math.abs(v) / SCALE * 500) / 10;
    const up = v >= 0.05, down = v <= -0.05, cls = up ? "pos" : down ? "neg" : "lev";
    const txt = up ? `${pct1(v)}% higher` : down ? `${pct1(v)}% lower` : "level";
    return `<div role="row" class="${cls}"><span role="rowheader">${name.slice(0, 3)}</span><span role="cell"><span class="tr" aria-hidden="true"><span class="b" style="width:${w}%"></span></span><span class="v">${txt}</span></span></div>`;
  }).join("")
  + `</div></div><figcaption>We took out the yearly rise in prices, so only the month shows. Averages for 2021 to 2025, from county deeds.</figcaption></figure>`;

/* ---- The work-back table (rows 7 to 9, row F1): for a closing in the middle of each month, when the buyer signs and
   when the home goes on the market. Days are Zillow's figures for the Myrtle Beach area over the last 12 months: the
   12-month average days to close, then days to a contract for the month the contract is signed. ---- */
const DAY = 864e5;
const when = (t) => { const d = new Date(t), day = d.getUTCDate(); return `${day <= 10 ? "early" : day <= 20 ? "mid" : "late"} ${M[d.getUTCMonth()]}`; };
const backFrom = (close) => { const signed = close - CLOSE_AVG * DAY; const listed = signed - PEND12[new Date(signed).getUTCMonth() + 1] * DAY; return { signed, listed, days: Math.round((close - listed) / DAY) }; };
const BACK = M.map((name, i) => { const b = backFrom(Date.UTC(2027, i, 15)); return { name, signed: when(b.signed), listed: when(b.listed), days: b.days }; });
if (BACK[3].listed !== "late January" || BACK[4].listed !== "late February" || BACK[5].listed !== "mid March" || BACK[6].listed !== "mid April") throw new Error("the work-back table moved (row F1)");
const SPRING_WK = [3, 4, 5].map((i) => Math.round(BACK[i].days / 7));
if (Math.min(...SPRING_WK) !== 12 || Math.max(...SPRING_WK) !== 13 || !BACK.every((b, i) => i >= 3 && i <= 5 || b.days >= 88)) throw new Error("row F1: the table's weeks moved");
/* "About 3 months for a closing from April to July, and up to 4 months for one in winter." */
if (!BACK.slice(3, 7).every((b) => b.days >= 80 && b.days <= 92) || !BACK.every((b) => b.days <= 122) || Math.max(...BACK.map((b) => b.days)) !== Math.max(BACK[0].days, BACK[1].days, BACK[2].days, BACK[11].days)) throw new Error("row F1: the table's months moved");
if (Math.round(PEND12[4] / 7) !== 7 || Math.round(CLOSE_AVG / 7) !== 5) throw new Error("row F1: the worked example's weeks moved");
/* The worked example: a closing on June 5. */
const EX = backFrom(Date.UTC(2027, 5, 5));
if (when(EX.signed) !== "late April" || when(EX.listed) !== "mid March") throw new Error("row F1: the worked example moved");
/* Listing now: a home listed in mid November closes in about mid February. */
const NOW_CLOSE = when(Date.UTC(2026, 10, 15) + (PEND12[11] + CLOSE_AVG) * DAY);
if (NOW_CLOSE !== "mid February") throw new Error("row F1: the listing-now example moved");
const BACK_TABLE = h.table(["To close in the middle of", "Put the home on the market in"],
  BACK.map((r, i) => [i >= 2 && i <= 5 ? `<b>${r.name}</b>` : r.name, i >= 2 && i <= 5 ? `<b>${r.listed}</b>` : r.listed]));

/* ---- Visual D (row 19): home sales the county recorded each working day around Hurricane Ian. Weekends, when
   nothing is recorded, are left out, so the one zero is the day of the storm. ---- */
const IAN_DAYS = Object.entries(IAN).filter(([d]) => { const w = new Date(d + "T12:00:00Z").getUTCDay(); return w !== 0 && w !== 6; });
if (IAN_DAYS.length !== 20 || Object.entries(IAN).some(([d, v]) => { const w = new Date(d + "T12:00:00Z").getUTCDay(); return (w === 0 || w === 6) && v !== 0; })) throw new Error("visual D: a weekend has recordings, or a day is missing");
const IMAX = Math.max(...IAN_DAYS.map(([, v]) => v));
const WEEKS = [0, 1, 2, 3].map((k) => IAN_DAYS.slice(k * 5, k * 5 + 5));
const mdy = (d) => { const [, m, dd] = d.split("-").map(Number); return `${M[m - 1].slice(0, 3)} ${dd}`; };
const IAN_FIG = `<figure class="bt-fig bt-ian"><p class="cap">Home sales recorded each working day around Hurricane Ian, 2022</p>`
  + `<div class="wks" role="img" aria-label="Home sales recorded each working day from September 19 to October 14, 2022. 97 on Thursday, September 29, none on Friday, September 30, the day Ian came ashore, then 64 and 94 the next Monday and Tuesday. Week totals: ${WEEKS.map((w) => wk(Object.fromEntries(w), "0", "9")).join(", ")}.">`
  + WEEKS.map((w) => `<div class="wk"><div class="bars">` + w.map(([d, v]) => {
    const storm = d === "2022-09-30";
    return storm ? `<span class="bar zero"><b class="lb">Ian</b></span>` : `<span class="bar" style="height:${Math.max(2, Math.round(v / IMAX * 100))}%"></span>`;
  }).join("") + `</div><p class="t"><span>${mdy(w[0][0])} to ${mdy(w[4][0])}</span><b>${wk(Object.fromEntries(w), "0", "9")}</b></p></div>`).join("")
  + `</div><figcaption>Resales recorded by Horry County, Monday to Friday. The dashed line is Friday, September 30, when Ian came ashore and the county recorded none. The number under each week is that week's total.</figcaption></figure>`;

/* ---- The one chooser: condo or house (rows 4, 5, 15). The only cards on the page. ---- */
const card = (k, title, text) => `<li><span class="k">${k}</span><b>${title}</b>${text}</li>`;
const KINDS = `<ul class="bt-cards" aria-label="When a condo and a house sell for the most">`
  + card("A condo", "Close in April or May. List in late January or February.",
    h.p(`Condos that closed in April and May sold for the highest middle prices of the year, about ${GAP_CONDO} percent above February's.`)
    + h.p("If you rent the condo by the night, a spring sale gives up the summer. In all eight towns in our rental data, nightly rentals earn the most in July.")
    + h.p("Renting through the summer and selling in the fall has a cost too. Condos that closed from September to November sold for about the same as the months around them, not the spring high."))
  + card("A house or townhome", "Close in June. List in March.",
    h.p(`Houses that closed in June sold for the highest middle price of the year, about ${GAP_HOUSE} percent above February's.`)
    + h.p("July and September closings did nearly as well. All three months were above the months around them in all five years."))
  + `</ul>`;

/* ---- Plain lists under thin rules. ---- */
const plain = (items, label) => `<ul class="bt-plain" aria-label="${label}">` + items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("") + `</ul>`;

/* ---- The photo (VERIFY.md, Photos: usable with a new crop; photos.json subject_check). ---- */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("myrtle-beach-beach-in-june", PHOTOS[0].caption);
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const METHOD = `<div class="bt-notes"><p class="bt-small"><strong>How we counted.</strong> We read the county's index of every deed recorded since 2019 and counted ${n0(TOTAL)} home resales from 2021 to 2025. A resale is a deed of $10,000 or more for one home that the county lists today as residential, with a building on it.</p><p class="bt-small">We left out ${n0(NEW)} sales by builders, whose closings are spread more evenly over the year. We also left out tax sales, foreclosures, corrective deeds and sales under 30 percent of the county's value.</p><p class="bt-small">Of the ${n0(TOTAL)} resales, about ${r100(HOUSES)} were houses and townhomes and ${r100(CONDOS)} condos. We told a condo from a house by the county's parcel records.</p><p class="bt-small">Each sale is counted in the month the county recorded its deed, which comes after the closing. The county's index carries a parcel number on nearly every deed only from July 2020, so our count starts in 2021. The price chart compares each month's middle price with the six months before it and the six after. That takes out the rise from year to year.</p><p class="bt-small">Days to a contract and to closing, new listings and price cuts are Zillow's figures for the Myrtle Beach area. The listing table uses Zillow's figures for the latest 12 months.</p>`;
const LEGAL = `<p class="bt-small"><strong>Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not tax advisers, and nothing on this page is tax or legal advice.</p></div>`;
const AFTER = () => METHOD + LEGAL + ph.credits().replace(GENERIC_CREDIT, "");

/* ---- The glance rows under the H1 (rows 1, 7, 8). ---- */
const GLANCE = PK.glance([
  { icon: "calendar", label: "March to June", text: `about ${MARJUN_PCT} percent of a year's home sales` },
  { icon: "key", label: "About 6 to 7 weeks", text: "on the market before a contract, this spring" },
  { icon: "home", label: "About 5 weeks", text: "from a signed contract to closing" },
]);

/* ---- The page's own styles (copied from the approved pilots, then this page's figures). ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const BRASS = "#c4783a", INK = "#8a5226", SLATE = "#7c8a96";
const S = "main#main";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line (pilots' design pass). */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  /* One block width: 720 px. */
  + `${S} .c3-gchart,${S} div[style^="overflow-x:auto;margin:1.2rem 0"]{max-width:720px!important;box-sizing:border-box}`
  /* Our own figures: the one card style, padded. */
  + `${S} figure.bt-fig{max-width:720px;box-sizing:border-box;margin:1.4rem 0 1.6rem;padding:1.1rem 1.2rem 1rem}`
  + `${S} .bt-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .9rem}`
  + `${S} .bt-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.9rem!important;padding:0!important}`
  + `${S} .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`
  /* Chart B: bars left (lower) or right (higher) of a middle line. */
  + `${S} .bt-div [role=rowgroup]:not(.sr){display:grid;gap:.4rem}`
  + `${S} .bt-div [role=row]{display:grid;grid-template-columns:2.6rem minmax(0,1fr);align-items:center;gap:.6rem}`
  + `${S} .bt-div [role=rowheader]{color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1rem}`
  + `${S} .bt-div [role=cell]{display:grid;grid-template-columns:minmax(0,1fr) 6.4rem;align-items:center;gap:.6rem}`
  + `${S} .bt-div .tr{position:relative;height:.8rem}${S} .bt-div .tr::before{content:"";position:absolute;left:50%;top:-.3rem;bottom:-.3rem;width:1px;background:rgba(28,32,40,.35)}`
  + `${S} .bt-div .b{position:absolute;top:0;bottom:0;border-radius:4px}${S} .bt-div .pos .b{left:50%;background:${BRASS}}${S} .bt-div .neg .b{right:50%;background:${SLATE}}`
  + `${S} .bt-div .v{color:var(--muted);font-family:var(--sans);font-size:.95rem;white-space:nowrap}${S} .bt-div .pos .v{color:${INK};font-weight:600}`
  /* Visual C: the month strip. */
  + `${S} .bt-plan .row{margin:0 0 1.1rem}${S} .bt-plan .who{color:var(--muted);line-height:1.5;margin:0 0 .55rem;max-width:none}`
  + `${S} .bt-plan .who b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem}`
  + `${S} .bt-plan .tr{position:relative;display:block;height:.9rem;border-radius:6px;background:rgba(28,32,40,.06)}`
  + `${S} .bt-plan .s{position:absolute;top:0;bottom:0}${S} .bt-plan .s.w{background:rgba(196,120,58,.38);border-radius:6px 0 0 6px}${S} .bt-plan .s.c{background:${BRASS};border-radius:0 6px 6px 0}`
  + `${S} .bt-plan .d{position:absolute;top:50%;width:.8rem;height:.8rem;margin:-.4rem 0 0 -.4rem;border-radius:50%;background:#fff;border:2px solid ${INK};box-sizing:border-box}${S} .bt-plan .d.e{background:${INK}}`
  + `${S} .bt-plan .ax{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));border-top:1px solid rgba(28,32,40,.16);margin-top:.2rem;padding-top:.35rem}`
  + `${S} .bt-plan .ax span{color:var(--muted);font-family:var(--sans);font-size:.95rem;padding-left:.25rem;border-left:1px solid rgba(28,32,40,.16)}`
  + `${S} .bt-plan .key{display:flex;flex-wrap:wrap;gap:.4rem 1.4rem;color:var(--muted);font-family:var(--sans);font-size:.95rem;margin:.8rem 0 0}`
  + `${S} .bt-plan .sw{display:inline-block;width:1.4rem;height:.7rem;border-radius:3px;margin-right:.45rem;vertical-align:middle}${S} .bt-plan .sw.w{background:rgba(196,120,58,.38)}${S} .bt-plan .sw.c{background:${BRASS}}`
  /* Visual D: Ian's working days. */
  + `${S} .bt-ian .wks{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem}`
  + `${S} .bt-ian .bars{display:flex;align-items:flex-end;gap:3px;height:140px;padding-top:2.2rem;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .bt-ian .bar{position:relative;flex:1 1 0;background:${SLATE};border-radius:3px 3px 0 0;min-width:0}`
  + `${S} .bt-ian .bar.zero{background:none;height:calc(100% + 1.4rem);border-left:2px dashed ${INK};border-radius:0;flex:0 0 0;margin:0 .45rem}${S} .bt-ian .lb{position:absolute;top:0;left:-1px;transform:translate(-50%,-100%);color:${INK};font-family:var(--sans);font-size:.9rem;font-weight:700;line-height:1.15;white-space:nowrap}`
  
  + `${S} .bt-ian .t{margin:.45rem 0 0;font-family:var(--sans);line-height:1.3}${S} .bt-ian .t span{display:block;color:var(--muted);font-size:.85rem}${S} .bt-ian .t b{color:var(--navy);font-size:1.05rem}`
  /* The one chooser: two cards. */
  + `${S} .bt-cards{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.75rem;max-width:720px;align-items:start}`
  + `@media (min-width:760px){${S} .bt-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .bt-cards>li{margin:0;padding:1rem 1.1rem .3rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55}`
  + `${S} .bt-cards .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin-bottom:.3rem}`
  + `${S} .bt-cards b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.55rem}`
  + `${S} .bt-cards p{margin-bottom:.7rem!important;line-height:1.6!important}`
  /* Plain lists under thin rules. */
  + `${S} .bt-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:1.1rem;max-width:720px}`
  + `${S} .bt-plain>li{margin:0;padding:.85rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.65;font-size:1.0625rem}@media (min-width:700px){${S} .bt-plain>li{font-size:1.15rem}}`
  + `${S} .bt-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.3rem}`
  /* A wide screen: the closings chart beside the paragraphs that explain it; the photo beside the list. */
  + `@media (min-width:1100px){${S} .bt-side{display:grid;grid-template-columns:minmax(0,1fr) 400px;grid-template-rows:auto auto 1fr;column-gap:2.5rem;max-width:1000px;align-items:start}`
  + `${S} .bt-side>*{grid-column:1}${S} .bt-side>.c3-gchart,${S} .bt-side>.c3-aerial{grid-column:2;grid-row:1/4;margin:.3rem 0 1.2rem!important;max-width:none!important}`
  + `${S} .bt-side>.c3-aerial figure{margin:0!important}`
  + `${S} .bt-side>div[style^="overflow-x:auto"]{grid-column:2;grid-row:1/4;margin:.3rem 0 1.2rem!important;max-width:none!important}}`
  /* The photo sits on the page: the picture and its caption, no card around it. */
  + `${S} figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;max-width:720px}`
  + `${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  + `${S} .bt-small{font-size:.85rem;color:var(--muted);line-height:1.7;max-width:600px;margin-top:1rem}@media (max-width:699px){${S} .bt-small{font-size:.95rem}}${S} .bt-small strong{color:var(--navy)}`
  /* Offer boxes: a larger button. */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .bt-cards b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* A phone: the three hero tiles as short rows. */
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}`
  + `${S} figure.bt-fig{padding:1rem .9rem .9rem}${S} .bt-ian .bars{gap:2px;height:120px}${S} .bt-ian .wks{gap:.35rem}${S} .bt-div [role=cell]{grid-template-columns:minmax(0,1fr) 5.9rem}}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* Work-arounds copied from the pilots: the feed's search row at 320 px, the header phone at 1000 to 1100 px, the
     closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* The FAQ repeats only questions the page answers, said short. */
const FAQ = [
  { q: "What is the worst month to sell a house in Myrtle Beach?", a: "February. For houses and for condos alike, it was the lowest month of the year for price, and one of the slowest for sales." },
  { q: "Do houses sell in December in Myrtle Beach?", a: "Yes. Buyers sign contracts all winter. A contract signed in December closes about five weeks later, in January." },
  { q: "How long does it take from contract to closing in Myrtle Beach?", a: `About five weeks. The average ran from ${CL_LO} days to ${CL_HI} days, depending on the month.` },
  { q: "Is now a good time to sell a house in Myrtle Beach?", a: `At this year's pace, a home listed in mid November closes around ${NOW_CLOSE}, the lowest month for price. Listing in March moves the closing to May or June, at the cost of four more months of owning the home.` },
  { q: "When is the best time to sell a beach condo in Myrtle Beach?", a: "Close in April or May, when condos sold for the most. That means listing in late January or February, before the summer rental season." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "Best Time to Sell a House in Myrtle Beach: List in March",
  description: "The best time to sell a house in Myrtle Beach, from Horry County deeds month by month: when to list, condo or house, winter and hurricane season.",
  ogTitle: "The best time to sell a house in Myrtle Beach: list in March to close in May or June",
  crumb: "Best Time to Sell",
  eyebrow: "Selling a home",
  h1: "The best time to sell a house in Myrtle Beach",
  h1em: "List in March to close in May or June.",
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. */
  sub: "The best time to list, from five years of Horry County deed records month by month, with the weeks from listing to closing.",
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Have us pick your listing date", label: "Have us pick my date", href: CTA },
  author: "devin",
  shortAnswer: [
    `The best time to sell a house in Myrtle Beach is late spring and early summer. Homes that closed in June sold for a middle price about 6 percent above homes that closed in February. About ${MARJUN_PCT} percent of a year's home sales here are recorded in March through June.`,
    "To close in those months, list a house in March and a condo in late January or February. This spring, a home had a buyer after about 6 to 7 weeks on the market. Closing took about 5 weeks more.",
    `The month is worth a few percent of the price. ${h.a("#what-matters-more", "The year you sell in and the price you ask")} can matter more.`,
  ],
  sections: [
    { h2: "When do the most homes sell in Myrtle Beach?", toc: "When homes sell", id: "when-homes-sell", html: () =>
      ph.css() +
      h.p(`Spring and early summer are the busiest months for home sales in Horry County. From 2021 to 2025, about ${MARJUN_PCT} percent of home resales were recorded in March through June. That is more than in any other four months in a row. An even spread would be 33 percent.`) +
      CHART_A +
      h.p(`January and February are the slowest months. Together they hold about ${JF_TYP} percent of a year's sales.`) +
      h.p("The pattern is not the same every year. In 2025, sales were spread more evenly, and October was the busiest month. Prices still followed the season that year. February was again the lowest month for price, and houses that closed in June and July still sold above the months around them.") +
      `<h3 id="price-by-month" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">Which month brings the highest price?</h3>` +
      h.p("June brought the highest middle price, and February the lowest. Half of the homes sold for more than the middle price, and half for less.") +
      h.p("February was lower than the months around it in all five years. May and June were higher in four of the five.") +
      CHART_B +
      h.p(`From February's bar to June's bar is about 6 percent. On a home at the county's middle resale price of about ${money(MID)}, that is about ${money(EXAMPLE)}. Part of that gap comes from which homes sell in each month, so one home should expect less. We could not measure how much less.`) },

    { h2: "When should you list to close in the best months?", toc: "When to list", id: "when-to-list", html: (bg) =>
      `<div class="bt-side"><div>` +
      h.p("List about three months before the month you want to close. A home is under contract, which agents call pending, once the buyer and the seller have both signed the purchase contract.") +
      h.p("Homes go under contract fastest in March, April and May. This spring, the middle home had a buyer after about 6 to 7 weeks on the market. In the years before, it was about 4 weeks.") +
      h.p(`After a buyer signs, closing took about five weeks here, in every month of the year. A buyer who pays cash has no lender to wait for. Our page on ${h.a("/sell/cash-offer/", "cash offers")} covers that kind of sale.`) +
      h.p("The table counts back from a closing in the middle of each month, at the pace of the last 12 months. Winter closings need up to 4 months. The four busiest months are in bold.") +
      `</div>` + BACK_TABLE + `</div>` +
      h.p(`A worked example: to close in early June, count back about 5 weeks to a signed contract in ${when(EX.signed)}. Count back about 6 to 7 weeks more, and the house goes on the market in ${when(EX.listed)}.`) +
      h.p(`Start getting the home ready a few weeks before that. Our page on ${h.a("/sell/repairs-before-selling/", "repairs before selling")} lists what to fix first.`) +
      h.cta("Have us set a listing date for a May or June closing", "Tell us when you need to be out, and we will work back to the day your home should go on the market.", "Have us work back from my date", CTA, bg) },

    { h2: "Is the best month different for a condo?", toc: "Condo or house", id: "condo-or-house", html: () =>
      h.p("Yes. Condos here sell for the most in April and May, a little earlier in the year than houses, which sell for the most in June.") +
      KINDS +
      h.p(`Our page on ${h.a("/sell/sell-my-condo/", "selling a condo")} covers the rest of a condo sale: the HOA papers, rental programs and buyers' loans.`) },

    { h2: "Is winter a bad time to sell a house in Myrtle Beach?", toc: "Winter", id: "winter", html: () =>
      h.p("Winter has fewer sales and lower prices. It also has fewer homes for sale to compete with yours.") +
      plain([
        ["Fewer sales, lower prices", "January and February have the fewest sales of the year. February closings sold for the lowest middle price of the year."],
        ["Fewer homes for sale", `In the Myrtle Beach area, December has the fewest new listings of the year, less than half of April's. Buyers still sign contracts all winter, about ${n0(Math.round(NP["12"] / 10) * 10)} in a typical December.`],
        ["Out-of-state buyers buy all year", `About 3 in 10 buyers in every month are from another state. Our page on ${h.a("/sell/out-of-state-buyers/", "out-of-state buyers")} says where they come from.`],
      ], "What winter means for a seller") +
      h.p("A home that goes under contract in February closes about five weeks later, in March or early April, when the busy months begin.") },

    { h2: "Does hurricane season hurt a home sale here?", toc: "Hurricane season", id: "hurricane-season", html: (bg) =>
      h.p(`Not as a season. Atlantic ${h.ext(NHC, "hurricane season")} is June 1 to November 30. Most of the season's activity comes between mid-August and mid-October, with the peak on September 10.`) +
      h.p("Those months are not a slow season for home sales. August, September and October each had about 8 to 9 percent of a year's home resales. August and September closings sold a little above the months around them on average.") +
      h.h3("What happened to home sales the week Hurricane Ian came?") +
      h.p("Hurricane Ian came ashore near Georgetown on Friday, September 30, 2022. The county recorded no home sales that day. It recorded sales again the next Monday, and the week after the storm had more sales than the week before.") +
      IAN_FIG +
      h.p("The storm Debby came ashore down the coast, near Bulls Bay, early on Thursday, August 8, 2024. The county recorded no sales that day and recorded sales again the next day.") +
      h.p(`A storm can move a closing by a few days, not by a season. What a storm means for a buyer's insurance is on our ${h.a("/buyers/coastal-insurance/", "coastal insurance page")}.`) +
      h.cta("Have us build a few spare days into a fall closing", "A storm week can push a closing back a few days. Tell us the month you hope to close, and we will plan the dates with room to spare.", "Have us plan my closing dates", CTA, bg) },

    { h2: "Do tourist season and the school year change the best month?", toc: "Tourists and school", id: "tourists-and-school", html: () =>
      h.p("Tourist season peaks in July, after the busiest months for home sales. School lets out in early June, during one of them.") +
      `<div class="bt-side">` +
      PHOTO +
      plain([
        ["Tourist season", "This year, Horry County had about 40 percent more hotel, restaurant and other leisure jobs in July than in January. Home sales do not follow the tourists: July has fewer sales than June."],
        ["The school year", "Horry County public schools let out in early June and start again in mid-August. This school year ends on June 8, 2027, and the next one starts on August 18, 2027. Make-up days can move the last day."],
        ["Moving while school is out", "June is one of the two busiest months for home sales. To close in June, list in March."],
      ], "Tourist season and the school year") + `</div>` },

    { h2: "What matters more than the month you sell?", toc: "What matters more", id: "what-matters-more", html: (bg) =>
      h.p(`Prices changed far more from year to year than from month to month. The middle price rose about ${RISE} percent from 2021 to 2022, against about 6 percent between February and June.`) +
      plain([
        ["The year", `Since 2024 the middle resale price has stayed near ${money(BY["2024"].median)}. So far this year it has been about the same again, with about as many sales as a year earlier. Our ${h.a("/sell/home-value/", "home value page")} gives middle prices by area.`],
        ["The market now", `In September 2026, about ${n0(Math.round(INV.latest[1] / 1000) * 1000)} homes were for sale in the Myrtle Beach area, about the same as a year earlier. Homes went under contract about a week faster than a year earlier.`],
        ["The asking price", `That month, about 3 in 10 listings had cut their asking price. Each week a home waits for a cut moves its closing a week later, and can push a spring closing into summer. Buyers paid about 97 to 98 percent of the last asking price, whatever the month. The row of just-listed homes on this page shows what yours would compete with.`],
        ["Tax dates", `Owning and living in your main home for 2 of the last 5 years can mean no federal tax on up to $250,000 of your profit. If you are a few months short, selling early can cost that. A rental or second home has its own one-year date. Our ${h.a("/sell/capital-gains/", "capital gains page")} explains both, from ${h.ext(IRS701, "IRS Topic 701")} and ${h.ext(IRS409, "IRS Topic 409")}. Ask a tax pro about your own dates.`],
        ["Your own dates", `You may have a date you must move by: a lease that ends, a new job, or a home you are buying. Work back from that date with the weeks above. Our pages on ${h.a("/sell/sell-or-buy-first/", "whether to sell or buy first")} and ${h.a("/sell/rental-property/", "selling a rented home")} cover those cases.`],
      ], "What matters more than the month") +
      h.cta("Have us price it for the month you list", "We price your home from recorded sales near you and the homes you would compete with that month.", "Have us price my home for my month", CTA, bg) },
  ],
  pageImages: [{ "@type": "ImageObject", url: `https://chapter3realty.com/${PHOTOS[0].file}`, contentUrl: `https://chapter3realty.com/${PHOTOS[0].file}`, width: PHOTOS[0].width, height: PHOTOS[0].height, description: PHOTOS[0].alt }],
  afterSources: () => AFTER(),
  faqTitle: "Best time to sell FAQ",
  faq: FAQ,
  sources: [
    { name: "County deeds", href: DEEDS },
    { name: "County parcels", href: GIS },
    { name: "Zillow Research", href: ZR },
    { name: "NOAA hurricane climatology", href: NHC },
    { name: "NHC Ian report", href: IAN_TCR },
    { name: "NHC Debby report", href: DEB_TCR },
    { name: "Horry County Schools calendars", href: HCS },
    { name: "BLS jobs", href: BLS },
    { name: "IRS Topic 701", href: IRS701 },
    { name: "IRS Topic 409", href: IRS409 },
  ],
  sourcesNote: "Sales by month and middle prices: our count of county deeds, 2021 to 2025. Rental months: AirROI, in our rental data.",
  bottomCta: { h2: "Have us plan your sale from listing day to closing", p: "Tell us when you need to move. We work out the week to list and price your home from recorded sales near it.", label: "Have us plan my sale", href: CTA },
  keywords: "best time to sell a house in Myrtle Beach, best month to sell a house, best time to sell a condo in Myrtle Beach, when to list a house, how long from contract to closing, selling a house in winter, hurricane season home sale, Horry County home sales by month",
  about: "The best month to sell a house in Myrtle Beach and Horry County, South Carolina",
});
