/* /invest/rent-prices/ - what a house rents for in Myrtle Beach: by bedrooms, by named area, what a new
 * lease costs against an old one, whether rents are rising, the month to rent, and the fair market rent.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-02. Replaces the 2026-09-07 page (fair market rent table
 * three times, no rent by area, no numbers on what changes the rent).
 * Facts: Blog-Brain batches/2026-11-a/invest-rent-prices/facts.md, VERIFIED and CORRECTED rows only, at the
 * corrected wording (VERIFY.md). Struck: the 3-bedroom "30 percent" gap (row 7), "two sources agree" (row 8),
 * the 2- and 4-bedroom house figures (row 3), "why rents rose" (row 18), the second clause of row 21
 * (struck list invest-rent-prices-struck.json).
 * Every number is computed here from data/2026-11-a/invest-rent-prices/ (findings.json, pums-2024-5yr.json,
 * photos.json), never typed. Sources: Census ACS 2020-2024 5-year (B25064, B25031, B25058, B25032) and
 * PUMS (PUMAs 02701 and 02702, most of Horry County); Zillow research data (ZORI houses, apartments and all
 * homes; ZHVI mid tier houses; Myrtle Beach metro, which Zillow draws to include Brunswick County, NC);
 * HUD fair market rents FY2015-FY2027 and 24 CFR 888.113; Census Vintage 2025 county estimates;
 * SC Code 27-39-60 and 27-40-770; stories.json august-turnover.
 * Kept from the live page: the H1, the analyzer and agent lines (rows 23, 24), the fair market rent table
 * (once), the links to the sibling pages, the bottom offer. Cut: "What comes out of the rent" (the eight
 * costs belong to /invest/run-the-numbers/), the stray sentence on first buyers in a new community.
 * Photos: a NOAA aerial of houses in Carolina Forest (public domain) and the Coastal Carolina University
 * bell tower (Sk5893, CC BY-SA 4.0), until the photo partner's shots arrive (shot-list.md).
 * Review round 1 (REVIEW-1.md): the short answer leads with the new-lease figure for a 3-bedroom house; one
 * area table (asking rent by ZIP code beside the Census 3-bedroom figure) with a map, in place of two;
 * a worked example in place of the five-point list; the offer said twice (top and bottom); the story told as
 * advice to the reader; a yes-or-no answer on raising the rent (rows 30, 31); a 4-bedroom FAQ line (row 29).
 * Rebuild 2026-11-03: the round-1 fixes finished (the map and the one ZIP table placed, the worked example,
 * the yes-or-no answer, the 4-bedroom line); rows 29 to 31 checked against Census and the statute.
 * Fix round 1 (REVIEW-1.md, three reviewers): one rent for a house (about $1,600 on a new lease, the tenant
 * pays the utilities) and one for an apartment, the same way all through; one area ranking on one measure
 * (asking rent by ZIP code), so the FAQ and the table agree; the Census place paragraphs and the 3-bedroom
 * column cut; the worked example in one basis with its answer in one line; the population paragraph cut;
 * HUD spelled out; corrected verbs; the offer goes to an agent, not to the tool page.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const GEO_TOWNS = JSON.parse(fs.readFileSync(path.join(BB, "tools", "geo", "grand-strand-v2.json"), "utf8")).region.towns;

const SELF = "/invest/rent-prices/";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", "invest-rent-prices");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), PUMS = read("pums-2024-5yr.json"), PHOTOS = read("photos.json").photos;

/* ---------------------------------------------------------------------------- */
/* Numbers, rounded the way the ledger says                                       */

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r10 = (v) => money(Math.round(v / 10) * 10);
const r50 = (v) => money(Math.round(v / 50) * 50);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthYear = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;

/* Zillow (rows 1, 2, 15 to 17). The month comes from the data, never typed. */
const HL = F.headline, ZM = F.zillow_latest_month, ZMONTH = monthYear(ZM), ZYEAR = +ZM.slice(0, 4);
const HOUSE_ASK = r10(HL.zillow_house_asking), APT_ASK = r10(HL.zillow_apartment_asking);
const HOUSE_12M = Math.round(HL.zillow_house_12m_pct);
if (HOUSE_ASK !== "$2,070" || APT_ASK !== "$1,580" || HOUSE_12M !== 3 || HL.zillow_house_peak.month !== ZM) throw new Error("rows 1 and 2 moved: re-verify");
const GS = F.zillow_growth_since;
const key4 = `${ZYEAR - 4}-09-30`, key19 = Object.keys(GS).find((k) => k.startsWith("2019"));
const RENT4 = Math.floor(GS[key4].zori_house_sm) /* 8.5: the ledger says "about 8" */, VAL4 = GS[key4].zhvi_house_mid;
const RENT19 = Math.round(GS[key19].zori_house_sm), VAL19 = Math.round(GS[key19].zhvi_house_mid);
const RATIO = F.zillow_house_rent_x12_over_value_pct, RATIO_THEN = RATIO[String(ZYEAR - 4)].toFixed(1), RATIO_NOW = RATIO[String(ZYEAR)].toFixed(1);
const Y19 = ZYEAR - 2019;
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
if (RENT4 !== 8 || Math.abs(VAL4) >= 1 || RATIO_THEN !== "6.3" || RATIO_NOW !== "6.8" || RENT19 !== 50 || VAL19 !== 56) throw new Error("rows 15 and 16 moved: re-verify");
const SEASON = F.zillow_seasonal_pct_by_month;
const AUG = SEASON["08"], JAN = SEASON["01"];
if (Math.max(...Object.values(SEASON)) !== AUG || Math.min(...Object.values(SEASON)) !== JAN) throw new Error("row 17: August is no longer the high or January the low");
/* Derived (critic, round 1): the all-homes swing, August against January, applied to the house asking rent. */
const SWING_PCT = Math.round(AUG - JAN), SWING_DOLLARS = Math.round(HL.zillow_house_asking * (AUG - JAN) / 100 / 10) * 10;
if (SWING_PCT !== 2 || SWING_DOLLARS !== 40) throw new Error("row 17 swing moved: re-check the wording");

/* Census PUMS, most of Horry County (rows 3 to 5, 7, 8, 22). */
const CR = PUMS.contract_rent, GR = PUMS.gross_rent;
const HOUSE_LEASE = money(CR.house_detached.median), H3_LEASE = money(CR.house_detached_3br.median);
const APT1 = r50(CR.apartment_or_condo_1br.median), APT2 = r50(CR.apartment_or_condo_2br.median), APT_ALL = r10(CR.apartment_or_condo_2plus.median);
const UT_HOUSE = r100(F.pums_utilities.house_detached.median), UT_APT = r100(F.pums_utilities.apartment_or_condo_2plus.median);
if (HOUSE_LEASE !== "$1,400" || H3_LEASE !== "$1,500" || APT1 !== "$1,100" || APT2 !== "$1,150" || UT_HOUSE !== "$200" || UT_APT !== "$100") throw new Error("rows 3 to 5 moved: re-verify");
const NEW_ALL = CR.all_moved_in_last_2y.median, OLD_ALL = CR.all_5y_or_more.median;
const NEW_H = CR.house_detached_moved_in_last_2y.median, OLD_H = CR.house_detached_5y_or_more.median;
const GAP_PCT = Math.round((NEW_ALL / OLD_ALL - 1) * 10) * 10;
if (GAP_PCT !== 40 || r10(NEW_ALL) !== "$1,340" || r10(OLD_ALL) !== "$930" || r100(NEW_H) !== "$1,600" || r100(OLD_H) !== "$1,100") throw new Error("row 7 moved: re-verify");
const NEW3_GROSS = r100(GR.house_detached_3br_moved_in_last_2y.median);
const SH3 = F.pums_detached_bedrooms_share["3"];
if (Math.round(SH3 / 10) !== 6) throw new Error("row 22 moved");

/* The page's one rent for a house (fix round 1, all three reviewers: "one headline number for a house and one for an
   apartment, used the same way all through"): a rented house on a lease signed in the last two years, before
   utilities, the tenant paying about $200 on top (rows 5, 7). The apartment figures are rows 4 and 5. */
const HOUSE_NEW = r100(NEW_H);

/* Census ACS (rows 13, 19, 29). Only Carolina Forest's 3-bedroom figure is used, in the worked example; the area
   ranking is the ZIP table alone (fix round 1: "one ranking, one measure"). */
const HORRY = F.areas.find((x) => /^Horry/.test(x.name)), CF = F.areas.find((x) => x.name === "Carolina Forest");
if (!HORRY || !CF) throw new Error("findings.json areas: no Horry County or Carolina Forest row");
const HORRY_LEASE = r10(HORRY.median_contract_rent.est); /* row 19, B25058 */
if (HORRY_LEASE !== "$1,110") throw new Error("row 19 moved");
const CF3 = CF.gross_rent_by_bedrooms["3"];
if (r10(CF3.est) !== "$1,980" || CF3.wide) throw new Error("row 13 moved");
/* Worked example: the Census figure with utilities, less the utilities a house tenant pays, in the rounded figures
   the box prints, so the reader can redo the sum. */
const CF3_GROSS = Math.round(CF3.est / 10) * 10, UT_H = Math.round(F.pums_utilities.house_detached.median / 100) * 100;
const CF3_LEASE = money(CF3_GROSS - UT_H);
if (CF3_LEASE !== "$1,780") throw new Error("worked example moved: re-check the box");
const H4 = HORRY.gross_rent_by_bedrooms["4"]; /* row 29 (fixer row, checked by the rebuild 2026-11-03) */
if (r10(H4.est) !== "$1,530" || H4.wide) throw new Error("row 29 moved");

/* One area table, one measure (fix round 1): what landlords ask now in each ZIP code (row 14, the verifier's labels).
   The Census 3-bedroom column is gone: it set a with-utilities figure for 3-bedroom homes beside an asking rent for
   every home, and readers took the two as a contradiction. 29527 has one month of data; 29585 is in Georgetown
   County. Both are left out. `town` is the Census place whose point marks the row on the map (tools/geo, TIGER/Line). */
const ZIP_ROWS = [
  { zip: "29582", label: "North Myrtle Beach", town: "North Myrtle Beach" },
  { zip: "29576", label: "Murrells Inlet and Garden City", town: "Murrells Inlet" },
  { zip: "29568", label: "Longs", town: "Longs" },
  { zip: "29526", label: "Conway", town: "Conway" },
  { zip: "29579", label: "Carolina Forest and Forestbrook", town: "Carolina Forest" },
  { zip: "29577", label: "Myrtle Beach", town: "Myrtle Beach" },
  { zip: "29588", label: "Socastee", town: "Socastee" },
  { zip: "29575", label: "Surfside Beach", town: "Surfside Beach" },
  { zip: "29566", label: "Little River", town: "Little River" },
  { zip: "29572", label: "Myrtle Beach, north end", town: null },
];
const ZIPS = ZIP_ROWS.map((r) => {
  const z = F.zips.find((x) => x.zip === r.zip);
  if (!z || !z.zillow_asking_all_homes) throw new Error(`row 14: no asking rent for ${r.zip}`);
  return Object.assign({}, r, { ask: z.zillow_asking_all_homes });
}).sort((a, b) => b.ask - a.ask);
const ZTOP = ZIPS[0], ZLOW = ZIPS[ZIPS.length - 1];
if (ZTOP.zip !== "29582" || ZLOW.zip !== "29572" || ZIPS[ZIPS.length - 2].zip !== "29566") throw new Error("row 14: the highest or lowest ZIP codes changed");
const ZGAP = r10(ZTOP.ask - ZLOW.ask);
const ALL_ASK = r10(HL.zillow_all_asking);
/* Rows 1 and 2: across the metro, houses ask this much more than every home together. */
const HOUSE_OVER_ALL = r50(HL.zillow_house_asking - HL.zillow_all_asking);
if (ZGAP !== "$420" || HOUSE_OVER_ALL !== "$350") throw new Error("rows 1, 2, 14: the gaps moved");
const CF_ZIP = ZIPS.find((z) => z.zip === "29579"), CF_ROW = ZIPS.indexOf(CF_ZIP) + 1;

/* HUD (rows 9 to 11). The fiscal years come from the data keys. */
const FMR = F.fmr_fy2027, FMR_OLD = F.fmr_fy2026, FY = 2027;
const FMR_10 = F.fmr_by_year_2_3_4br[String(FY - 10)];
const FMR_RISE = Math.round((FMR["3"] / FMR_10["3"] - 1) * 100 / 5) * 5;
if (FMR["3"] !== 1823 || FMR_10["3"] !== 1172 || FMR_RISE !== 55) throw new Error("row 11 moved: re-verify");

/* Population (row 18): cut in fix round 1 (owner and reader: never tied back to the rent; the verifier bars the
   causal reading that would tie it). */

/* Links */
const RTN = "/invest/run-the-numbers/";
const CONTACT = "/contact/";
const ANALYZER = "/invest/long-term-rental/";
const TEL = "tel:+18543332135";
const ACS = (t, g) => `https://data.census.gov/table/ACSDT5Y2024.${t}?g=${g}`;
const PUMS_URL = "https://www.census.gov/programs-surveys/acs/microdata.html";
const ZRES = "https://www.zillow.com/research/data/";
const FMR_PAGE = "https://www.huduser.gov/portal/datasets/fmr.html";
const CFR888 = "https://www.ecfr.gov/current/title-24/subtitle-B/chapter-VIII/part-888/subpart-A/section-888.113";
const T27_39 = "https://www.scstatehouse.gov/code/t27c039.php";
const T27_40 = "https://www.scstatehouse.gov/code/t27c040.php";

/* ---------------------------------------------------------------------------- */
/* Styles for the page's own figures                                              */

const CSS = `<style>
main#main .rp-fig{max-width:760px}
main#main img[src*="coastal-carolina-bell-tower"]{object-position:88% 50%}
main#main .c3-glance li,main#main .c3-glance span.t{line-height:1.4}
/* The closing offer is followed by the listing notice (.hx-wrap), so glass.js's compact rule for the first offer (:not(:last-child)) also catches it and its ivory text sits on a light bar. Put the dark panel back (NEEDS.md). */
main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;display:block!important;padding:2.2rem 1.6rem!important;border-radius:28px!important;margin-left:auto!important;margin-right:auto!important}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
main#main .rp-fig svg{display:block;width:100%;height:auto}
main#main .rp-fig svg.rp-n{max-width:400px}
main#main .rp-fig svg.rp-w{display:none}
@media (min-width:640px){main#main .rp-fig svg.rp-n{display:none}main#main .rp-fig svg.rp-w{display:block}}
main#main .rp-key{display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;list-style:none;margin:0 0 .6rem;padding:0}
main#main .rp-key li{display:flex;align-items:center;gap:.45rem;margin:0;font-family:var(--sans);font-size:1rem;color:var(--navy)}
main#main .rp-key i{display:inline-block;width:1.1rem;height:.3rem;border-radius:3px}
main#main .rp-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1rem;line-height:1.4;color:var(--navy);margin:1rem 0 0}
main#main .rp-tab caption{caption-side:top;text-align:left;font-weight:600;padding:0 0 .5rem}
main#main .rp-tab th,main#main .rp-tab td{padding:.45rem .5rem;border-bottom:1px solid rgba(28,32,40,.12);text-align:right;font-variant-numeric:tabular-nums}
main#main .rp-tab th:first-child,main#main .rp-tab td:first-child{text-align:left;padding-left:0}
main#main .rp-tab thead th{font-weight:600;vertical-align:bottom;border-bottom:2px solid var(--navy)}
main#main .rp-tab tbody tr:last-child>*{border-bottom:0}
main#main .rp-list{counter-reset:rp;list-style:none;margin:1rem 0 1.4rem;padding:0;max-width:720px;display:grid;gap:.7rem}
main#main .rp-list li{counter-increment:rp;position:relative;margin:0;padding:.85rem 1rem .85rem 3.1rem;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.85);box-shadow:0 14px 30px -24px rgba(28,32,40,.4);color:var(--muted);line-height:1.6}
main#main .rp-list li::before{content:counter(rp);position:absolute;left:1rem;top:.85rem;width:1.5rem;height:1.5rem;border-radius:50%;background:#c4783a;color:#fff;font-family:var(--sans);font-size:.9rem;font-weight:600;display:flex;align-items:center;justify-content:center}
main#main .rp-list b{color:var(--navy)}
main#main .rp-law{max-width:720px;display:grid;gap:.7rem;margin:1rem 0 1.2rem}
@media (min-width:700px){main#main .rp-law{grid-template-columns:1fr 1fr}}
main#main .rp-law div{padding:1rem 1.1rem;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.85);box-shadow:0 14px 30px -24px rgba(28,32,40,.4)}
main#main .rp-law b{display:block;font-family:var(--sans);color:var(--navy);font-size:1.05rem;margin-bottom:.3rem}
main#main .rp-law p{margin:0;color:var(--muted);line-height:1.6}
main#main .rp-tabwrap{max-width:100%;overflow-x:auto}
@media (max-width:380px){main#main .rp-tab{font-size:.92rem}main#main .rp-tab th,main#main .rp-tab td{padding:.4rem .25rem}}
main#main .rp-ex{max-width:720px;margin:1rem 0 1.4rem;padding:1.1rem 1.2rem;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.55));border:1px solid rgba(255,255,255,.85);box-shadow:0 14px 30px -24px rgba(28,32,40,.4);font-family:var(--sans);color:var(--navy)}
main#main .rp-ex .k{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:#8a5226;font-weight:600;margin:0 0 .5rem}
main#main .rp-ex dl{margin:0;display:grid;gap:.15rem}
main#main .rp-ex dl>div{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding:.5rem 0;border-bottom:1px solid rgba(28,32,40,.12)}
main#main .rp-ex dl>div:last-child{border-bottom:0}
main#main .rp-ex p b{color:var(--navy)}
main#main .rp-ex dt{margin:0;line-height:1.45}main#main .rp-ex dd{margin:0;white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600}
main#main .rp-ex p{margin:.6rem 0 0;color:var(--muted);line-height:1.6;font-size:1rem}
/* The homes strip's search box ran 44 px past a 320 px window (critic, round 1; the same fix as /invest/run-the-numbers/; NEEDS.md). */
main#main .hx-fb-ai{max-width:100%;box-sizing:border-box;flex-wrap:wrap;min-width:0}
main#main .hx-fb-ai>.hx-ai-badge{flex-wrap:wrap;white-space:normal;max-width:100%;min-width:0}
main#main .hx-fb-ai>.hx-fb-q{flex:1 1 100%;max-width:100%;min-width:0;flex-wrap:wrap;box-sizing:border-box}
main#main .hx-fb-q textarea{min-width:7.5rem}
main#main .hx-fb-go{max-width:100%}
/* The shared header at 1000 to 1120 px: the phone digits ran 5 px past a 1024 px window (critic, round 1; the same rule as /buyers/retirees/; NEEDS.md). */
@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}
/* "On this page" was one column of 9 links on a desktop, with empty space beside it (critic, fix round 1). The
   site's sheet uses two columns under 700 px only. Three columns from 700 px, on this page (NEEDS.md). */
@media (min-width:700px){main#main nav[aria-label="On this page"]{max-width:none!important}main#main nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:1.4rem}}
</style>`;

const NAVY = "#1c2028", BRASS = "#c4783a", INK = "#4a4f5c", HALO = ' stroke="#fbf8f3" stroke-width="4" stroke-linejoin="round" paint-order="stroke"';
const fig = (cap, svgs, note, extra = "") => `<figure class="c3-gchart rp-fig"><span class="cap" style="display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .8rem">${cap}</span>${extra}${svgs}<figcaption>${note}</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* Chart 1: lease rent by kind of home (rows 3 to 5)                              */

const KIND_CHART = G.bars([
  { name: "1-bedroom apartment or condo", value: CR.apartment_or_condo_1br.median, valueText: APT1, feature: `plus about ${UT_APT} of utilities` },
  { name: "2-bedroom apartment or condo", value: CR.apartment_or_condo_2br.median, valueText: APT2, feature: `plus about ${UT_APT} of utilities` },
  { name: "3-bedroom house", value: CR.house_detached_3br.median, valueText: H3_LEASE, feature: `plus about ${UT_HOUSE} of utilities` },
], { caption: "Middle rent a month, leases old and new, most of Horry County", nameLabel: "Kind of home", featureLabel: "utilities the renter pays", valueLabel: "rent before utilities", max: 1800,
  note: `Census surveys of renters.` });

/* ---------------------------------------------------------------------------- */
/* Chart 2: middle rent by place (rows 12, 13)                                    */

const AREA_CHART = G.bars(ZIPS.map((z, i) => ({ name: `${i + 1}. ${z.label}`, value: z.ask, valueText: r10(z.ask), feature: `ZIP ${z.zip}` }))
  .concat([
    { name: "Whole metro area: houses", value: HL.zillow_house_asking, valueText: HOUSE_ASK, reference: true },
    { name: "Whole metro area: every home", value: HL.zillow_all_asking, valueText: ALL_ASK, reference: true },
  ]),
{ caption: "Asking rent a month for homes listed now, by ZIP code", nameLabel: "Place", featureLabel: "ZIP code", valueLabel: "asking rent", compact: true, phoneList: true, max: 2100,
  note: `Zillow's rent index, ${ZMONTH}. Every row but the houses row counts apartments, condos and houses together. Zillow's metro area includes Brunswick County, NC.` });

/* The map (reader, round 1: "I cannot picture Socastee, Red Hill, Longs ..."). Each marker is the Census place point
   from the cached TIGER/Line data; the north end of Myrtle Beach has no place point of its own and is left off,
   and the caption says so (critic, fix round 1). */
const townAt = (nm) => { const t = GEO_TOWNS.find((x) => x.n === nm); if (!t) throw new Error(`geo: no town ${nm}`); return { lat: 33 + t.at[1] / 10000, lon: -80 + t.at[0] / 10000 }; };
const AREA_MAP = (() => {
  const places = ZIPS.map((z, i) => ({ z, i })).filter(({ z }) => z.town).map(({ z, i }) => Object.assign({ name: z.label, short: z.town }, townAt(z.town)));
  const m = regionMap({ name: "Where the places in the rent table are", places, maxRatio: 0.85, leaders: { places: true } },
    { dir: path.join(__dirname, "..", "chapter3realty", "images", "2026-11-a", "invest-rent-prices"), src: "/images/2026-11-a/invest-rent-prices", glass: true });
  return h.figure(m.html, `Row ${ZIPS.length}, the north end of Myrtle Beach (29572), is the coast north of the city center. ${m.credit}`) + (m.unlabelled && m.unlabelled.length ? m.key : "");
})();

/* ---------------------------------------------------------------------------- */
/* Chart 4: a new lease against an old one (row 7)                                */

const LEASE_CHART = G.bars([
  { name: "Rented houses: moved in within 2 years", value: NEW_H, valueText: r100(NEW_H) },
  { name: "Rented houses: stayed 5 years or more", value: OLD_H, valueText: r100(OLD_H), reference: true },
  { name: "Every rented home: moved in within 2 years", value: NEW_ALL, valueText: r10(NEW_ALL) },
  { name: "Every rented home: stayed 5 years or more", value: OLD_ALL, valueText: r10(OLD_ALL), reference: true },
], { caption: "Middle rent a month before utilities, by how long the renter has been in the home", nameLabel: "Renters", valueLabel: "rent before utilities", max: 1800,
  note: `Census surveys of renters, most of Horry County.` });

/* ---------------------------------------------------------------------------- */
/* Chart 5: house rent against house value, September of each year (rows 15, 16)  */

const RS = F.zillow_house_series_sept, VS = F.zillow_house_value_series_sept;
const YEARS = Object.keys(RS).map(Number).sort((a, b) => a - b);
if (YEARS[YEARS.length - 1] !== ZYEAR || YEARS.some((y) => !VS[y])) throw new Error("Zillow series: the years do not line up");
const Y0 = YEARS[0];
const pctOf = (s, y) => (s[y] / s[Y0] - 1) * 100;
const lineSvg = (W, fs, cls) => {
  const H = Math.round(W * (W < 500 ? 0.78 : 0.5)), x0 = Math.round(fs * 4), x1 = W - (W < 500 ? 14 : 20), y0 = fs * 1.2, y1 = H - fs * 2.3, lo = 0, hi = 100;
  const X = (y) => x0 + (y - Y0) / (ZYEAR - Y0) * (x1 - x0), Y = (v) => y1 - (v - lo) / (hi - lo) * (y1 - y0);
  const path = (s) => YEARS.map((y, i) => `${i ? "L" : "M"}${X(y).toFixed(1)} ${Y(pctOf(s, y)).toFixed(1)}`).join("");
  const band = `<rect x="${X(ZYEAR - 4).toFixed(1)}" y="${y0 - fs * 0.6}" width="${(X(ZYEAR) - X(ZYEAR - 4)).toFixed(1)}" height="${(y1 - y0 + fs * 0.6).toFixed(1)}" fill="${BRASS}" fill-opacity=".09" rx="6"/>`
    + `<text x="${((X(ZYEAR - 4) + X(ZYEAR)) / 2).toFixed(1)}" y="${(Y(8) + fs * 0.2).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="${NAVY}"${HALO}>last 4 years</text>`;
  const grid = [0, 25, 50, 75, 100].map((g) => `<line x1="${x0}" x2="${x1}" y1="${Y(g).toFixed(1)}" y2="${Y(g).toFixed(1)}" stroke="${NAVY}" stroke-opacity="${g ? ".1" : ".3"}"/><text x="${x0 - 6}" y="${(Y(g) + fs * 0.35).toFixed(1)}" text-anchor="end" font-size="${fs}" fill="${INK}">${g ? "+" + g + "%" : "0"}</text>`).join("");
  const step = W < 500 ? 4 : 2;
  const xl = YEARS.filter((y) => (y - Y0) % step === 0 || y === ZYEAR).filter((y, i, a) => y === ZYEAR || ZYEAR - y >= (W < 500 ? step - 0.5 : step / 2 + 0.5) || a.length < 3) /* phone: no label 3 years before the last (critic, fix round 1: "2023 2026" touched) */
    .map((y) => `<text x="${X(y).toFixed(1)}" y="${(H - fs * 0.5).toFixed(1)}" text-anchor="${y === ZYEAR ? "end" : "middle"}" font-size="${fs}" fill="${INK}">${y}</text>`).join("");
  const endR = [X(ZYEAR), Y(pctOf(RS, ZYEAR))], endV = [X(ZYEAR), Y(pctOf(VS, ZYEAR))];
  const lab = (x, y, t, col, dy) => `<text x="${(x - 8).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="end" font-size="${fs}" font-weight="600" fill="${col}"${HALO}>${t}</text>`;
  const aria = `Line chart of two Zillow indexes for the Myrtle Beach metro, September of each year from ${Y0} to ${ZYEAR}, as the change since ${Y0}. The asking rent for a house and the middle-tier house value both rose steeply from ${YEARS[5]} to ${ZYEAR - 4}. Over the last four years the rent kept rising, about ${RENT4} percent, while the house value stayed about flat.`;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria}">` + band + grid + xl
    + `<path d="${path(VS)}" fill="none" stroke="${NAVY}" stroke-width="2.6" stroke-dasharray="7 5" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<path d="${path(RS)}" fill="none" stroke="${BRASS}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<circle cx="${endR[0].toFixed(1)}" cy="${endR[1].toFixed(1)}" r="4.5" fill="${BRASS}"/><circle cx="${endV[0].toFixed(1)}" cy="${endV[1].toFixed(1)}" r="4.5" fill="${NAVY}"/>`
    + lab(endV[0], endV[1], "value", NAVY, -fs * 0.7) + lab(endR[0], endR[1], "rent", "#8a5226", fs * 1.3)
    + `</svg>`;
};
const LINE_KEY = `<ul class="rp-key" aria-hidden="true"><li><i style="background:${BRASS}"></i>House asking rent</li><li><i style="background:repeating-linear-gradient(90deg,${NAVY} 0 6px,transparent 6px 10px)"></i>House value</li></ul>`;
const kVal = (v) => "$" + Math.round(v / 1000) + "K";
const ROWS_T = [2019, ZYEAR - 4, ZYEAR].map((y) => `<tr><td>${y}</td><td>${r10(RS[y])}</td><td>${kVal(VS[y])}</td><td>${RATIO[String(y)].toFixed(1)}%</td></tr>`).join("");
const VALUE_TABLE = `<div class="rp-tabwrap"><table class="rp-tab"><caption>A house's asking rent and value each September</caption><thead><tr><th scope="col">Year</th><th scope="col">Rent a month</th><th scope="col">Value</th><th scope="col">A year's rent as a share of value</th></tr></thead><tbody>${ROWS_T}</tbody></table></div>`;
const TREND_FIG = fig(`House rent and house value, change since ${Y0}`, lineSvg(280, 14, "rp-n") + lineSvg(680, 13, "rp-w") + VALUE_TABLE,
  `Zillow's rent index for houses and Zillow's middle-tier house value index, Myrtle Beach metro, September of each year to ${ZMONTH}. A year's rent is twelve months of the asking rent, before any cost; it is not a return.`, LINE_KEY);

/* ---------------------------------------------------------------------------- */
/* Chart 6: the season, month by month (row 17)                                   */

const MKEYS = Object.keys(SEASON).sort();
const seasonSvg = (W, fs, cls) => {
  const H = Math.round(W < 500 ? W * 0.62 : W * 0.36), x0 = Math.round(fs * 3), x1 = W - 6, top = fs * 1.6, bot = H - fs * 2, hi = 1, lo = -1.6;
  const Y = (v) => top + (hi - v) / (hi - lo) * (bot - top), cw = (x1 - x0) / 12, bw = cw * 0.62;
  const grid = [1, 0, -1].map((g) => `<line x1="${x0}" x2="${x1}" y1="${Y(g).toFixed(1)}" y2="${Y(g).toFixed(1)}" stroke="${NAVY}" stroke-opacity="${g ? ".1" : ".45"}"/><text x="${x0 - 6}" y="${(Y(g) + fs * 0.35).toFixed(1)}" text-anchor="end" font-size="${fs}" fill="${INK}">${g > 0 ? "+1%" : g < 0 ? "−1%" : "trend"}</text>`).join("");
  const bars = MKEYS.map((k, i) => {
    const v = SEASON[k], x = x0 + i * cw + (cw - bw) / 2, ya = Y(Math.max(v, 0)), yb = Y(Math.min(v, 0));
    const col = v >= 0 ? BRASS : "#7d8291";
    const m = MONTHS[+k - 1];
    const tag = k === "08" ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(ya - fs * 0.45).toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="#8a5226"${HALO}>high</text>`
      : k === "01" ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(yb + fs * 1.15).toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="${NAVY}"${HALO}>low</text>` : "";
    return `<rect x="${x.toFixed(1)}" y="${ya.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(yb - ya, 1.5).toFixed(1)}" rx="3" fill="${col}"><title>${m}</title></rect>${tag}`
      + `<text x="${(x + bw / 2).toFixed(1)}" y="${(H - fs * 0.4).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="${INK}">${W < 500 ? m[0] : m.slice(0, 3)}</text>`;
  }).join("");
  const above = MKEYS.filter((k) => SEASON[k] > 0).map((k) => MONTHS[+k - 1]);
  const aria = `Bar chart of asking rents against the year's trend, by month. Rents are above the trend from ${above[0]} to ${above[above.length - 1]}, highest in August, about half a percent above. They are below it from November to April, lowest in January, about 1.4 percent below.`;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria}">${grid}${bars}</svg>`;
};
const SEASON_FIG = fig("Asking rents each month, above or below the year's trend", seasonSvg(280, 14, "rp-n") + seasonSvg(680, 13, "rp-w"),
  `Zillow's rent index, every kind of home, Myrtle Beach metro: each month's average distance from the trend, ${F.zillow_seasonal_years[0]} to ${F.zillow_seasonal_years[1]}.`);

/* ---------------------------------------------------------------------------- */
/* Chart 7: the fair market rent (rows 9, 10)                                     */

const BEDS = [["0", "Studio"], ["1", "1 bedroom"], ["2", "2 bedrooms"], ["3", "3 bedrooms"], ["4", "4 bedrooms"]];
const FMR_CHART = G.bars(BEDS.map(([k, nm]) => ({ name: nm, value: FMR[k], valueText: money(FMR[k]) })),
  { caption: "HUD fair market rent a month, Horry County", nameLabel: "Home", valueLabel: "fair market rent, with utilities", compact: true,
    note: `HUD's schedule for the Myrtle Beach-North Myrtle Beach-Conway metro area, from October. The figures include the utilities, except the telephone.` });

/* ---------------------------------------------------------------------------- */
/* Photos                                                                         */

const CF_PHOTO = PH.findPhoto(PHOTOS, "carolina-forest-streets-from-above");
const CCU_PHOTO = PH.findPhoto(PHOTOS, "coastal-carolina-bell-tower");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const CF_CAP = `Houses in Carolina Forest, seen from above. Carolina Forest is in ZIP code ${CF_ZIP.zip}, row ${CF_ROW} of the table.`;
const CCU_CAP = "The bell tower at Coastal Carolina University in Conway. New students arrive in August and look for homes to rent.";
const photo = (rec, cap) => lazy(PH.heroPhoto(rec, { alt: rec.alt, caption: cap, maxWidth: "640px", sizes: "(max-width: 680px) 100vw, 640px" }));
const CREDITS = PH.creditsList([{ photo: CF_PHOTO, caption: "Houses in Carolina Forest from above" }, { photo: CCU_PHOTO, caption: "The bell tower at Coastal Carolina University" }]);

/* ---------------------------------------------------------------------------- */
/* The page                                                                       */

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Myrtle Beach Rent Prices by Bedrooms and Area | Chapter3",
  description: `What a house rents for in Myrtle Beach, by bedrooms and in 10 ZIP codes from Little River to Murrells Inlet, and why a new lease costs about ${GAP_PCT} percent more.`,
  ogTitle: "How much does a house rent for in Myrtle Beach?",
  crumb: "Rent prices",
  eyebrow: "Long-term rents",
  h1: "How much does a house rent for in Myrtle Beach?",
  h1em: `A new lease here costs about ${GAP_PCT} percent more than one 5 years old.`,
  sub: "Rents on leases of a year or more, by bedrooms and in ten ZIP codes from Little River to Murrells Inlet.",
  heroMedia: glance([
    { icon: "key", label: `About ${HOUSE_NEW}`, text: "a house on a new lease" },
    { icon: "home", label: `About ${APT2}`, text: "a 2-bedroom apartment, old and new leases" },
    { icon: "dollar", label: `Up about ${HOUSE_12M}%`, text: "house rents in a year" },
  ]),
  heroCta: { title: "An agent works out the rent for one house before you offer.", label: "Ask an agent", href: CONTACT },
  author: "devin",
  shortAnswer: [
    `A house rents for about ${HOUSE_NEW} a month on a new lease in Horry County outside the Loris, Aynor and Green Sea area. The tenant also pays about ${UT_HOUSE} a month for power, water and gas. That is the middle rent for houses leased in the last two years: half rent for more, and half for less.`,
    `An apartment or condo rents for about ${APT1} a month with one bedroom and about ${APT2} with two, plus about ${UT_APT} of utilities. Those apartment figures count leases old and new, so a new lease costs more than that.`,
  ],
  sections: [
    { h2: "How much is rent in Myrtle Beach, by bedrooms?", toc: "By bedrooms", id: "by-bedrooms", html: () =>
      CSS +
      h.p(`Most rented houses here have three bedrooms: about six in ten. Houses are about three in ten rented homes. About half are apartments and condos, and about one in seven is a mobile home.`) +
      KIND_CHART +
      h.p(`The chart counts every lease in place, old and new, so each figure is lower than what a new tenant pays. The survey has too few rented houses with two or four bedrooms for a firm figure. Condos rented by the night are another market: ${h.a("/invest/condos/", "our condo investing guide")}.`) },

    { h2: "Why does a new lease cost more than the rent the last tenant paid?", toc: "New leases", id: "new-leases", html: (bg) =>
      h.p(`Across every rented home, a lease signed in the last two years costs about ${GAP_PCT} percent more than one signed five or more years ago. For rented houses, it is about ${HOUSE_NEW} a month against about ${r100(OLD_H)}, before utilities.`) +
      LEASE_CHART +
      h.p(`An average of all leases includes long tenants on old rents, so it is lower than what the next tenant will pay.`) +
      h.p(`For an owner, it means two things. Plan a house you buy empty on the new-lease figure. A house you buy with a tenant in it may come with an older, lower rent until that lease ends. Before you offer, we find out how long the tenant has been there and what the lease says.`) +
      h.cta("Buying a house that has a tenant in it?", "We read the lease, so you know the rent you start with and when that lease ends.", "Have us read the lease", CONTACT, bg) },

    { h2: "What does rent cost in Carolina Forest, Socastee and the rest of the Grand Strand?", toc: "By area", id: "by-area", html: () =>
      h.p(`Asking rent is the rent on a home listed for rent now. Across ten Grand Strand ZIP codes, it is lowest in the north end of Myrtle Beach, about ${r10(ZLOW.ask)} a month, and highest in North Myrtle Beach, about ${r10(ZTOP.ask)}. The asking rent in the highest ZIP code is about ${ZGAP} a month more than in the lowest.`) +
      AREA_MAP +
      AREA_CHART +
      h.p(`Each ZIP code figure counts apartments and condos with houses. Across the metro area, the asking rent for a house is about ${HOUSE_OVER_ALL} a month higher than for every home together.`) +
      photo(CF_PHOTO, CF_CAP) },

    { h2: "Is rent going up or down in Myrtle Beach?", toc: "Are rents rising", id: "up-or-down", html: (bg) =>
      h.p(`Up. Asking rents for houses rose about ${HOUSE_12M} percent in the last year, to the highest point in Zillow's index.`) +
      TREND_FIG +
      h.p(`Over the last four years, the asking rent for a house rose about ${RENT4} percent while the house value stayed about flat. A year's rent is now a larger share of the price than it was. Since 2019, both rose by about half.`) +
      h.p(`${h.a(RTN, "How we run the numbers on a rental")} shows the math. ${h.a("/invest/where-to-buy/", "Where to buy a rental")} compares the parts of the Grand Strand by strategy.`) +
      h.cta("Will the rent cover the tax, HOA dues and insurance?", "Send us the address. We add its tax, HOA dues and insurance and see if the rent covers them.", "Have us run the numbers", CONTACT, bg) },

    { h2: "When is the best month to rent out a house in Myrtle Beach?", toc: "Best month", id: "best-month", html: () =>
      h.p(`Summer. Asking rents are about half a percent above the year's trend in August, the high, and about 1.4 percent below it in January, the low. A year's lease that starts in summer also ends in summer, so you look for the next tenant in the high months too.`) +
      SEASON_FIG +
      h.p(`The swing is small, about $${SWING_DOLLARS} a month on a house. Near the college, the month you list makes more difference to empty weeks than to the price.`) +
      photo(CCU_PHOTO, CCU_CAP) +
      h.p(`If your house is near Coastal Carolina University, end the lease in August and start marketing the house a month before it ends. New students arrive in August and need a home to rent. In our experience, August turnover near the college has been no problem, and it is the month we have found best for no empty weeks. More on ${h.a("/invest/student-rentals/", "student rentals near the college")}.`) },

    { h2: "How much can I rent my house for in Myrtle Beach?", toc: "What will my house rent for", id: "your-house", html: (bg) =>
      h.p(`For one house, an agent at Chapter3 works out what it will rent for from current local leases and listings, at no cost, before you write the offer. The figures on this page are where we start.`) +
      h.raw(`<div class="rp-ex" role="group" aria-label="Worked example"><p class="k">Worked example: a 3-bedroom house in Carolina Forest, bought empty</p><dl>`
        + `<div><dt>3-bedroom homes rented in Carolina Forest, with utilities</dt><dd>about ${money(CF3_GROSS)}</dd></div>`
        + `<div><dt>Less the utilities a house tenant pays</dt><dd>about ${money(UT_H)}</dd></div>`
        + `<div><dt>Rent, with the tenant paying the utilities</dt><dd>about ${CF3_LEASE}</dd></div>`
        + `<div><dt>Homes listed now in ZIP ${CF_ZIP.zip}, every kind of home</dt><dd>about ${r10(CF_ZIP.ask)}</dd></div>`
        + `<div><dt>Listed in August, not January</dt><dd>about $${SWING_DOLLARS} more</dd></div>`
        + `</dl><p><b>List a 3-bedroom house there from about ${CF3_LEASE} a month, with the tenant paying the utilities.</b> The Census figure counts old leases with new ones, and new leases cost more. Before you offer, we check the leases and listings near the one house.</p></div>`) +
      h.p(`A furnished home on a lease of a few months is priced another way: ${h.a("/invest/mid-term-rentals/", "mid-term rentals")}. For a quick screen, ${h.a(ANALYZER, "our investment analyzer")} takes any Grand Strand address and returns an estimated market rent with the cash flow. It is a screening estimate, not an appraisal. ${h.a("/invest/rental-returns/", "What return a Myrtle Beach rental should make")}, by area and after costs, is on its own page. What a manager charges is on ${h.a("/invest/property-management/", "our property management cost page")}.`) +
      h.cta("Want this worked example done for one house?", "Tell us which house. We price it the same way, from the leases and listings near it, at no cost.", "Ask us what it will rent for", CONTACT, bg) },

    { h2: "What is the fair market rent in Horry County?", toc: "Fair market rent", id: "fair-market-rent", html: () =>
      h.p(`The fair market rent matters to a landlord who takes housing vouchers (Section 8). The U.S. Department of Housing and Urban Development (HUD) publishes it each year. For Horry County, it is ${money(FMR["3"])} a month for three bedrooms in the fiscal year ${FY} schedule, with utilities.`) +
      h.p(`It is not the average rent. About four in ten recent movers into a standard home pay that much or less.`) +
      FMR_CHART +
      h.p(`The voucher program uses it to work out what it pays. The rules for landlords who take vouchers are on our ${h.a("/invest/section-8-rentals/", "Section 8 rentals")} page. The three-bedroom figure has risen about ${FMR_RISE} percent in ten years.`) },

    { h2: "Can a landlord raise the rent in South Carolina?", toc: "Raising the rent", id: "raising-the-rent", html: () =>
      h.p(`Yes. A new lease can state a higher rent. During a lease, the rent is the amount the lease states.`) +
      h.raw(`<div class="rp-law"><div><b>No local rent limits</b><p>South Carolina does not let a city or county limit rents on privately owned homes.</p></div>`
        + `<div><b>Thirty days' notice</b><p>Either side can end a month-to-month lease with thirty days' written notice.</p></div>`
        + `<div><b>No raise to retaliate</b><p>A landlord may not raise the rent above market value to punish a tenant who complained to a code agency or to the landlord.</p></div></div>`) +
      h.p(`Deposits, notices and the rest of the landlord's rules are on our ${h.a("/invest/landlord-rules/", "South Carolina landlord rules")} page.`) },
  ],
  faqTitle: "Rent prices FAQ",
  faq: [
    { q: "What is the average rent in Horry County?", a: `The middle rent for every rented home in Horry County is about ${HORRY_LEASE} a month before utilities. It counts houses, apartments, condos and mobile homes, on old leases and new.` },
    { q: "How much is rent for a 4-bedroom house in Myrtle Beach?", a: `Across every rented home with four bedrooms in Horry County, old leases and new, the middle rent is about ${r10(H4.est)} a month with utilities. The survey has too few rented 4-bedroom houses alone for a firm figure.` },
    { q: "Where is rent cheapest on the Grand Strand?", a: `Among ten Grand Strand ZIP codes, the asking rent is lowest in the north end of Myrtle Beach (${ZLOW.zip}). It is about ${r10(ZLOW.ask)} a month across every kind of home listed for rent. Little River (${ZIPS[ZIPS.length - 2].zip}) is next, about ${r10(ZIPS[ZIPS.length - 2].ask)}.` },
    { q: "Did the fair market rent go down?", a: `For four bedrooms, yes: it fell from ${money(FMR_OLD["4"])} to ${money(FMR["4"])} a month in the fiscal year ${FY} schedule. The three-bedroom figure rose.` },
  ],
  sources: [
    { name: "Census ACS rent tables", href: ACS("B25064", "050XX00US45051") },
    { name: "Census ACS microdata", href: PUMS_URL },
    { name: "Zillow research data", href: ZRES },
    { name: "HUD fair market rents", href: FMR_PAGE },
    { name: "24 CFR 888.113", href: CFR888 },
    { name: "SC Code 27-39", href: T27_39 },
    { name: "SC Code 27-40", href: T27_40 },
  ],
  sourcesNote: `Census: ${F.acs_period}, 2024 dollars. "Most of Horry County" leaves out the Loris, Aynor and Green Sea area; Chapter3 computed those medians from the Census microdata. Zillow's metro area includes Brunswick County, NC; Zillow's data is through ${ZMONTH}. No rent or value for any one address. Not legal advice.`,
  pageImages: () => PH.pageImages(CF_PHOTO),
  afterSources: () => CREDITS + PH.imageSchema([CF_PHOTO, CCU_PHOTO]),
  bottomCta: { h2: "Get the rent for the house you are looking at.", p: "One call. An agent at Chapter3 works out what the house will rent for from current local leases and listings, before you offer.", label: "Call a specialized agent", href: TEL },
  keywords: "Myrtle Beach rent prices, average rent Myrtle Beach, average rent Horry County, how much can I rent my house for Myrtle Beach, 3 bedroom house rent Myrtle Beach, Carolina Forest rent, Socastee rent, Conway SC rent, fair market rent Horry County, is rent going down in Myrtle Beach, South Carolina rent control",
  about: "Long-term rent prices for houses and apartments in Myrtle Beach and Horry County, South Carolina",
});
