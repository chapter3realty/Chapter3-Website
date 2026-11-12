/* /invest/str-tools/ - the short-term rental tools page: a calculator for one Grand Strand nightly
 * rental (what it keeps after the HOA fee, the property tax and Airbnb's cut, and the nights it
 * must book to pay its bills), the condo fee that decides it and the buildings and streets behind it, eight
 * towns side by side, the season against the ocean's temperature, the costs, the crowding, where it is
 * allowed, and the other STR pages by question.
 *
 * Batch 2026-10-d, Lane U. Version 1, 2026-11-01; review round 1 the same day (REVIEW-1.md in the batch
 * folder: the calculator no longer carries one town's condo into another, the buildings and streets
 * behind the low fees and the fee that pays the electric are named (row 31), the calculator's per-town
 * defaults are in row 30, the FAQ answers are short pointers, and the pier photo is gone); review round 2
 * the same day (REVIEW-2.md: the short answer says on average no, with the dollar figure; the fee table is
 * a chart of nights needed against nights booked; the manager case is said plainly; the AirROI income
 * change is cut; fewer numbers in the costs; a map of the towns; the city business license, row 32).
 * Final fix, 2026-11-03 (REVIEW-FINAL.md): the short answer gives the range and who lands where; the
 * calculator opens on the Garden City Beach condo, which pays its bills (row 6); a "Who runs it" choice and
 * a manager bar in the fee chart (15 percent, inside row 23's basic plans); town figures read from
 * data/str-market.json (2026-11-03 refresh) and checked against findings.json; prose dollars rounded;
 * the "too many Airbnbs" section answers for a buyer; the calculator says it is a rough estimate.
 * Facts: Blog-Brain batches/2026-10-d/invest-str-tools/facts.md, VERIFIED and CORRECTED rows, at the
 * verifier's wording (VERIFY.md), and rows 30 and 31, VERIFIED-BY-FIXER (the lead re-checks them).
 * Struck wording: invest-str-tools-struck.json (the 105 nights, $192 a night, "booked by mid-May", the
 * Kings Highway rule, "from another state", and the rest are not here).
 * Held, so not on the page: the full-service manager share as a number or a calculator setting (row 23,
 * owner question 1: its base is "gross profit", which the page says only as "a share of the profit"); a
 * Murrells Inlet, Pawleys Island, Little River or Conway tax rate (row 4 covers four districts only; the
 * calculator leaves those blank).
 * Every figure is read from data/2026-10-d/invest-str-tools/findings.json (compute.py over the raw AirROI,
 * CRM, NOAA and county files in that folder) and raw/listings-complexes.json (pull_complexes.py), never
 * typed. compute.py's kept-per-night line has the formula error the verifier found (VERIFY.md 3), so this
 * spec does the arithmetic itself, once, in run() below, with the verifier's formula: rate x (1 - cleaning
 * - running) / (1 - cleaning). The same run() is the calculator's script, so the tool, the fee table and
 * the worked example give one value. It counts nights booked as whole nights (87, not AirROI's 86.65), so
 * Myrtle Beach is $4,209 short, ledger $4,272; the page says "about $4,200" (row 12 note).
 * Kept from the live page: the menu's promise (the tools), the links to the Airbnb income report, the
 * rules page, mid-term rentals, condotel financing and the rental analyzer, the North Myrtle Beach licence
 * line, the city zoning line, the cleaner observation and the one-kind-of-guest point (story
 * str-cheapest-cleaner, without added details), the offer to run an address, the phone line and "We
 * answer evenings". Removed: the occupancy ranges, "treat with suspicion", "always confirm", the Kings
 * Highway rule (struck), the 90-day and financing sections (one line and a link each), BrickWood in the
 * body, "Talk to a Grand Strand STR specialist", the month-estimate promise (owner question 3).
 * Photos: data/2026-10-d/invest-str-tools/photos.json. A USGS oblique aerial of the Myrtle Beach towers
 * (public domain), and the Garden City aerial from /buyers/no-hoa-homes/.
 * Round 4, 2026-11-08 (owner: "i feel like i need a phd to read or do anything on that"; "we need to be better
 * salesmen"; "using IDX to its fullest"): the calculator opens on its answer in one sentence, with three choices
 * (town, bedrooms, who runs it), four result lines and every other number behind "Change the numbers"; the math and
 * every figure source unchanged. Charts: one point each, in the title (the fee chart has two labelled bars and a
 * verdict, the season chart one town). Two homes strips in Garden City Beach (condos under the calculator, houses in
 * "Where it is allowed"), each with the old offer as its fallback. Selling lines from the which-town ledger, word
 * for word (rows S19, S25 to S27, S29, T25, T26), added to this page's facts.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const DATA = path.join(__dirname, "..", "data", "2026-10-d", "invest-str-tools");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json");
const PH = PK.create({ h, photos: read("photos.json").photos }).photoSet({ aerialWidth: "760px" });

const must = (ok, what) => { if (!ok) throw new Error(`str-tools.js: ${what}`); };
const T = F.towns, EX = F.examples, M = F.months, LB = F.listings_by_town;
const MB = T["myrtle-beach"], MI = T["murrells-inlet"];

/* Final fix (2026-11-03): the site's one source for short-term rental figures is data/str-market.json,
   refreshed 2026-11-03 to AirROI's 12 months to September 2026 (revenue includes guests' cleaning fees).
   The town figures on this page (revenue, nightly rate, nights booked, listings, July and January) are
   read from it. The by-size rows, cost lines and months are not in it, so they come from the same AirROI
   update as read in findings.json, and the build stops if the two files disagree on any town. Its yoy
   field (the revenue change) is never shown: the change since August is not growth. */
const STR = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "str-market.json"), "utf8"));
must(STR.retrieved >= "2026-11-03" && STR.dataAsOf === "2026-10-01", "str-market.json is not the 2026-11-03 refresh: re-check every AirROI figure on this page");
const SLUG = (k) => (k === "garden-city-beach" ? "garden-city" : k);
const SM = (k) => { const m = STR.markets.find((x) => x.slug === SLUG(k)); must(m, `str-market.json has no ${k}`); return m; };
Object.keys(T).forEach((k) => { const s = SM(k), t = T[k];
  must(s.revenue === t.revenue_avg && s.listings === t.listings && s.adr === t.adr && s.occupancy === t.occupancy_pct, `str-market.json and findings.json disagree (${k})`); });
["myrtle-beach", "murrells-inlet"].forEach((k) => must(SM(k).peakMonth === "July" && SM(k).peakRevenue === M[k][6].revenue && SM(k).lowMonth === "January" && SM(k).lowRevenue === M[k][0].revenue, `str-market.json and the month table disagree (${k})`));
const SMB = SM("myrtle-beach"), SMI = SM("murrells-inlet");

/* ---------------------------------------------------------------------------- */
/* The towns, in the order the reader meets them on the coast, north to south, then inland.          */

const TOWNS = [
  { key: "north-myrtle-beach", name: "North Myrtle Beach", href: "/submarkets/north-myrtle-beach/", ex: "nmb_oceanfront_condo_2br", lb: "north_myrtle_beach" },
  { key: "myrtle-beach", name: "Myrtle Beach", href: "/submarkets/myrtle-beach/", ex: "mb_city_oceanfront_condo_2br", lb: "myrtle_beach_city" },
  { key: "surfside-beach", name: "Surfside Beach", href: "/submarkets/surfside-beach/", ex: "surfside_condo_2br", lb: "surfside_beach" },
  { key: "garden-city-beach", name: "Garden City Beach", href: "/submarkets/garden-city/", ex: "garden_city_condo_2br", lb: "garden_city" },
  { key: "murrells-inlet", name: "Murrells Inlet", href: "/submarkets/murrells-inlet/", lb: "murrells_inlet" },
  { key: "pawleys-island", name: "Pawleys Island", href: "/submarkets/pawleys-island/", lb: "pawleys_island" },
  { key: "little-river", name: "Little River", href: "/submarkets/little-river/", lb: "little_river" },
  { key: "conway", name: "Conway", href: "/submarkets/conway/", lb: "conway" },
];
/* 2026 mills on a rental, 6 percent assessment (row 4, as corrected): district 880 for Myrtle Beach, 550
   for North Myrtle Beach, 610 for Garden City. Surfside Beach uses 201.0: 24 of the 32 condos with a
   Surfside Beach address sit outside the town, in district 600; inside the town it is 214.2. The other
   four towns have no verified rate, so the calculator leaves the tax blank there. */
const MILLS = { "myrtle-beach": 254.6, "north-myrtle-beach": 221.2, "surfside-beach": 201.0, "garden-city-beach": 207.3 };
must(F.mills_6pct["myrtle-beach"] === 254.6 && F.mills_6pct["north-myrtle-beach"] === 221.2 && F.mills_6pct["garden-city-beach"] === 207.3, "row 4: the mills");

/* The calculator's arithmetic, used here and shipped to the browser as the same text. AirROI's cost model
   (rows 5, 11): the guest's cleaning fee is a share of gross and pays the cleaner; running costs are a
   share of gross: Airbnb's fee (running less 10), utilities and internet 5, supplies 2, repairs 3. A
   manager's share is of the nightly bookings. Insurance and permit are AirROI's town lines. */
const RUN_SRC = `function(i){var cl=i.clean/100,gross=i.nights>0&&cl<1?i.rate*i.nights/(1-cl):0;`
  + `var c={gross:gross,clean:gross*cl,airbnb:gross*(i.run-10)/100,util:i.util?0:gross*0.05,supRep:gross*0.05,mgr:i.rate*i.nights*i.mgr/100};`
  + `c.before=c.gross-c.clean-c.airbnb-c.util-c.supRep-c.mgr;c.fee=i.fee*12;c.tax=i.tax;c.ins=i.ins;c.bills=c.fee+c.tax+c.ins;c.kept=c.before-c.bills;`
  + `var per=i.rate*(1-cl-(i.run-(i.util?5:0))/100)/(1-cl)-i.rate*i.mgr/100;c.per=per;c.need=per>0?Math.round(c.bills/per):null;c.share=i.price>0?c.kept/i.price*100:null;return c}`;
const run = eval(`(${RUN_SRC})`);
const nightsOf = (avg, adr, clean) => Math.round(avg * (1 - clean / 100) / adr);
const taxOf = (price, mills) => Math.round(price * 0.06 * mills / 1000);

/* Each town's defaults for the calculator (rows 5, 10, 11, 14, 15). */
const DEF = TOWNS.map((t) => {
  const a = T[t.key], e = t.ex ? EX[t.ex] : null;
  return { key: t.key, name: t.name, clean: a.cleaning_share_pct, run: a.running_cost_pct_of_gross, ins: a.insurance_line + a.permit_line,
    adr2: a.two_bed.adr, n2: nightsOf(a.two_bed.average, a.two_bed.adr, a.cleaning_share_pct),
    adr3: a.three_bed.adr, n3: nightsOf(a.three_bed.average, a.three_bed.adr, a.cleaning_share_pct),
    mills: MILLS[t.key] || null, price: e ? Math.round(e.price_median) : null, fee: e ? e.hoa_used : null };
});
const D = Object.fromEntries(DEF.map((d) => [d.key, d]));

/* The four worked condos (rows 6, 9, 12, 13): the middle two-bedroom condo for sale marked for nightly
   rentals, run by its owner, at the town's average two-bedroom rate and nights. */
const CASE = (key) => { const d = D[key]; const tax = taxOf(d.price, d.mills);
  return Object.assign({ d, tax }, run({ rate: d.adr2, nights: d.n2, clean: d.clean, run: d.run, util: false, mgr: 0, fee: d.fee, tax, ins: d.ins, price: d.price })); };
const CMB = CASE("myrtle-beach"), CNMB = CASE("north-myrtle-beach"), CSB = CASE("surfside-beach"), CGC = CASE("garden-city-beach");
must(EX.mb_city_oceanfront_condo_2br.for_sale_n === 48 && D["myrtle-beach"].price === 327000 && D["myrtle-beach"].fee === 1225, "row 9: the worked condo");
must(CMB.tax === 4995 && Math.round(CMB.bills) === 20085 && CMB.d.n2 === 87 && CMB.d.adr2 === 252, "row 12: tax, bills, 87 nights, $252");
must(CMB.need === 110 && Math.round(CMB.per) === 182, "VERIFY.md 3: about 110 nights at about $182 a night");
must(CNMB.need === 104 && CSB.need === 42 && CGC.need === 66, "VERIFY.md 3: 104, 42 and 66 nights");
must(CNMB.d.n2 === 72 && CSB.d.n2 === 80 && CGC.d.n2 === 95, "row 6: 72, 80 and 95 nights booked");
must(Math.abs(CMB.kept - EX.mb_city_oceanfront_condo_2br.avg_two_bed_left_after_fixed) < 100 && Math.abs(CSB.kept - 6900) < 100, "rows 6, 12: what is left, within $100 of the ledger");
const FULL = run({ rate: 252, nights: Math.round(365 * MB.two_bed.occupancy_pct / 100), clean: 13, run: 24, util: false, mgr: 0, fee: 1225, tax: CMB.tax, ins: 390, price: 327000 });
must(Math.round(365 * MB.two_bed.occupancy_pct / 100) === 135 && Math.abs(FULL.kept - 4600) < 100, "VERIFY.md 4: 135 nights open all year, about $4,600 over the bills");
must(Math.abs(EX.mb_city_oceanfront_condo_2br.hoa_year / CMB.bills - 0.73) < 0.01, "VERIFY.md: the fee is 73 percent of the bills");

/* Rows 13, 14, 16 to 21, 24: the values the sentences rest on. */
const HI = EX.mb_city_oceanfront_condo_2br.hoa_includes;
must(HI.hoa_includes_electric === 31 && HI.hoa_includes_internet === 44 && HI.vacation_rental_program === 40, "row 13");
must(SMB.revenue === 25807 && SMB.listings === 8698 && SMI.revenue === 47603 && MB.condo_pct === 80.6, "rows 2, 7, 14");
must(SMI.revenue / SMB.revenue > 1.75 && SMI.revenue / SMB.revenue < 2, "row 14: nearly twice");
must(MB.top3_share_pct === 47 && MI.top3_share_pct === 43 && T["pawleys-island"].top3_share_pct === 37 && T.conway.top3_share_pct === 38, "row 17");
must(M["myrtle-beach"][6].revenue === 6800 && M["myrtle-beach"][0].revenue === 1340 && M["murrells-inlet"][6].revenue === 9780, "row 16");
must(M.water_f[0] === 50.1 && M.water_f[6] === 84.1, "row 18");
must(MB.booked_or_blocked_90_or_fewer_pct === 56.5 && MB.booked_or_blocked_over_180_pct === 13.1, "row 20");
must(MB.cleaning_fee_median === 151 && MI.cleaning_fee_median === 225 && MB.avg_stay_nights === 4.7, "row 24");
must(F.mb_week.rent === 1764 && F.mb_week.tax_13pct === 229, "row 25");
must(LB.myrtle_beach_city.house.str_allowed === 18 && LB.myrtle_beach_city.condo.str_allowed === 541 && LB.conway.house.total === 675, "row 21");
must(Math.abs(LB.myrtle_beach_city.condo.str_allowed / LB.myrtle_beach_city.condo.total - 5 / 6) < 0.02, "row 21: about 5 in 6 condos");

const money = (v) => (v < 0 ? "-$" : "$") + Math.round(Math.abs(v)).toLocaleString("en-US");
const r100 = (v) => "$" + (Math.round(Math.abs(v) / 100) * 100).toLocaleString("en-US");
const r1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
const n = (v) => Math.round(v).toLocaleString("en-US");
const growth = (k) => { const m = /listings grew (\d+)%/.exec(T[k].yoy_sentence); return m ? +m[1] : null; };
must(growth("myrtle-beach") === 43 && growth("pawleys-island") === 69 && growth("garden-city-beach") === null, "row 20: growth");

const SELF = "/invest/str-tools/";
const AIRROI = (k) => `https://www.airroi.com/airbnb-data/united-states/south-carolina/${k}`;
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const T12_36 = "https://www.scstatehouse.gov/code/t12c036.php";
const NOAA = "https://tidesandcurrents.noaa.gov/stationhome.html?id=8661070";
const ST575 = "https://dor.sc.gov/sites/dor/files/forms/ST575.pdf";
const ABNB_FEE = "https://www.airbnb.com/help/article/1857";
const ABNB_TAX = "https://www.airbnb.com/help/article/2328";
const MB_ZONE = "https://www.cityofmyrtlebeach.com/news_detail_T6_R1468.php";
const NMB_STR = "https://www.nmb.us/833/Short-term-Rentals";


/* Row 31: the buildings and streets behind the worked condos (raw/listings-complexes.json, our count). */
const CX = read("raw/listings-complexes.json").groups;
const cx = (g, name) => { const r = CX[g].complexes.find((c) => c.name === name); must(r, `row 31: ${name}`); return r; };
const SS_IN = ["Retreat at Glenns Bay", "Golf Colony at Deerfield", "Grand Palms Resort (formerly Plantation Resort)"].map((x) => cx("surfside_condo_2br", x));
must(CX.surfside_condo_2br.n === 32 && SS_IN.reduce((s, r) => s + r.n, 0) === 22 && SS_IN.every((r) => r.fee_le_600 === r.n), "row 31: 22 of 32 Surfside condos in three complexes, all at $600 or less");
must(cx("surfside_condo_2br", "Sea Shadow").n === 3 && cx("surfside_condo_2br", "Sea Shadow").fee_le_1000 === 0, "row 31: Sea Shadow over $1,000");
const GC_WAC = CX.garden_city_condo_2br.complexes.reduce((s, c) => s + Object.entries(c.streets).filter(([k]) => /Waccamaw Dr/.test(k)).reduce((a, [, v]) => a + v, 0), 0);
must(CX.garden_city_condo_2br.n === 23 && GC_WAC === 21, "row 31: 21 of 23 Garden City condos on Waccamaw Drive");
must(["Beach House", "Sea Watch - Garden City", "Garden Sands"].every((x) => { const r = cx("garden_city_condo_2br", x); return r.fee_le_600 === r.n; }), "row 31: Garden City low-fee complexes");
must(["Sand Dunes Phii", "Caribbean Oceanfront Condominium Tower - PH II", "Dunes Village Resort", "Carolinian Beach Resort", "Grande Shores"].every((x) => { const r = cx("mb_city_oceanfront_condo_2br", x); return r.electric === r.n; }), "row 31: Myrtle Beach fee pays the electric");
must(CX.mb_city_oceanfront_condo_2br.n === 48 && CX.mb_city_oceanfront_condo_2br.electric_n === 31 && CX.mb_city_oceanfront_condo_2br.fee_le_800 === 9, "row 31: 48, 31 and 9");
must(["Ocean Forest Villas", "Beach Colony II"].every((x) => { const r = cx("mb_city_oceanfront_condo_2br", x); return r.fee_le_800 === r.n && r.n === 3; }), "row 31: the lower Myrtle Beach fees");
const BW = CX.nmb_oceanfront_condo_2br.complexes.filter((c) => /^Bay Watch/.test(c.name));
must(BW.reduce((s, c) => s + c.n, 0) === 13 && BW.reduce((s, c) => s + c.electric, 0) === 9 && cx("nmb_oceanfront_condo_2br", "Beach Cove").electric === 7, "row 31: Bay Watch and Beach Cove");

/* The managed case (row 12 note): the worked condo with a manager at 15 percent of the nightly bookings. */
const MGD = Object.assign(run({ rate: 252, nights: 87, clean: 13, run: 24, util: false, mgr: 15, fee: 1225, tax: CMB.tax, ins: 390, price: 327000 }), { mgr: 15 });
must(MGD.need === 139, "row 12 note: 139 nights with a manager at 15 percent");
/* Open all year with a manager (review 2, the reader from Ohio): at 15 percent, about $600 short; at the low
   end of the basic plans (row 23, 12.6 percent), about even. So "about breaks even at best". */
const FULLMGD = run({ rate: 252, nights: 135, clean: 13, run: 24, util: false, mgr: 15, fee: 1225, tax: CMB.tax, ins: 390, price: 327000 });
const FULLLOW = run({ rate: 252, nights: 135, clean: 13, run: 24, util: false, mgr: 12.6, fee: 1225, tax: CMB.tax, ins: 390, price: 327000 });
must(Math.round(FULLMGD.kept / 100) === -6 && Math.abs(FULLLOW.kept) < 500, "review 2: with a manager, open all year: about $600 short at 15 percent, about even at 12.6");

/* Final fix (lead's brief): every case also with a manager. 15 percent of the nightly bookings sits inside
   the basic plans we have seen here (row 23: about 12.6 to 17.5 percent). Same run(), same defaults. */
const MGR = 15;
must(MGR >= 12.62 && MGR <= 17.45, "row 23: the manager share sits inside the basic plans");
const MCASE = (c) => run({ rate: c.d.adr2, nights: c.d.n2, clean: c.d.clean, run: c.d.run, util: false, mgr: MGR, fee: c.d.fee, tax: c.tax, ins: c.d.ins, price: c.d.price });
const MMB = MCASE(CMB), MNMB = MCASE(CNMB), MSB = MCASE(CSB), MGC = MCASE(CGC);
must(MMB.need === MGD.need && MNMB.need === 131 && MSB.need === 52 && MGC.need === 83, "managed: 139, 131, 52 and 83 nights");
/* The calculator opens on the sound case (lead's brief): the Garden City Beach condo (row 6, VERIFY.md 3). */
must(Math.round(CGC.kept / 1000) === 5 && CGC.d.n2 === 95 && CGC.need === 66 && MGC.kept > 1000 && MGC.kept < 2000, "row 6: Garden City keeps about $5,000, under $2,000 with a manager");
must(Math.round(CMB.kept / 1000) === -4 && Math.round(FULL.kept / 500) * 500 === 4500 && FULLMGD.kept < 0 && FULLMGD.kept > -1000, "rows 12, VERIFY.md 4: about $4,000 short; open all year about $4,500, a little short with a manager");
/* ---------------------------------------------------------------------------- */
/* The page's own styles                                                          */

const CSS = `<style>
/* Round 4 (owner, 2026-11-08, on the old calculator: "i feel like i need a phd to read or do anything on that"):
   the calculator opens on its answer in one sentence; three choices up front; four result lines; every other
   number behind "Change the numbers". One width with the rest of the page. */
main#main .st-calc{background:linear-gradient(160deg,rgba(42,48,64,.97),rgba(28,32,40,.98));border-radius:20px;padding:1.3rem 1.2rem 1.15rem;margin:1.2rem 0 1.4rem;max-width:720px;color:rgba(244,239,232,.94);font-family:var(--sans);box-sizing:border-box}
@media (min-width:700px){main#main .st-calc{padding:1.6rem 1.7rem 1.35rem}}
main#main .st-calc .t{font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brass-2);margin:0 0 .8rem;font-weight:600}
main#main .st-calc .st-ask{display:flex;flex-wrap:wrap;align-items:flex-end;gap:.8rem 1.1rem;margin:0 0 1.2rem}main#main .st-calc .st-ask>.st-f:first-child{flex:1 1 100%}
@media (min-width:700px){main#main .st-calc .st-ask>.st-f:first-child{flex:1 1 12rem}}
main#main .st-calc .st-f select{width:100%}
main#main .st-calc .st-seg{display:flex;gap:.4rem}
main#main .st-calc .st-seg button{font:inherit;font-size:1rem;min-height:44px;min-width:3rem;padding:.35rem .95rem;border-radius:999px;border:1px solid rgba(244,239,232,.42);background:rgba(244,239,232,.08);color:#f4efe8;cursor:pointer;white-space:nowrap}
main#main .st-calc .st-seg button[aria-pressed=true]{background:var(--brass-2);border-color:var(--brass-2);color:#1c2028;font-weight:600}
main#main .st-calc .st-ans{font-family:var(--serif);font-size:clamp(1.3rem,2.5vw,1.65rem);line-height:1.32;color:#f4efe8;margin:0 0 1rem;text-wrap:pretty}
main#main .st-calc .st-ans strong{color:var(--brass-2);font-weight:600;white-space:nowrap}
main#main .st-calc .st-res{border-top:1px solid rgba(244,239,232,.22);margin:0}
main#main .st-calc .st-res .ln{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding:.6rem 0;border-bottom:1px solid rgba(244,239,232,.14);font-size:1.05rem;line-height:1.35;color:rgba(244,239,232,.9)}
main#main .st-calc .st-res .ln strong{color:#f4efe8;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
main#main .st-calc .st-res .ln.keep strong{color:var(--brass-2);font-size:1.3rem}
main#main .st-calc .st-res small{display:block;font-size:.9rem;color:rgba(244,239,232,.72);margin-top:.1rem}
main#main .st-calc .st-fine{margin:.75rem 0 0;font-size:.92rem;line-height:1.5;color:rgba(244,239,232,.75)}
main#main .st-calc details.st-more{margin-top:1rem}
main#main .st-calc details.st-more>summary{display:inline-flex;align-items:center;gap:.5rem;min-height:44px;padding:.3rem 1rem;border-radius:999px;border:1px solid rgba(244,239,232,.42);color:#f4efe8;font-weight:600;font-size:1rem;cursor:pointer;list-style:none}
main#main .st-calc details.st-more>summary::-webkit-details-marker{display:none}
main#main .st-calc details.st-more>summary::after{content:"+";font-size:1.2rem;line-height:1;color:var(--brass-2)}
main#main .st-calc details.st-more[open]>summary::after{content:"\\2212"}
main#main .st-calc .st-grid{display:grid;gap:0 1.6rem;margin-top:.9rem}
@media (min-width:700px){main#main .st-calc .st-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}
main#main .st-calc label,main#main .st-calc .row{display:flex;justify-content:space-between;align-items:center;gap:.8rem;font-size:1rem;line-height:1.4;margin:0 0 .6rem;color:rgba(244,239,232,.94)}
main#main .st-calc .st-f,main#main .st-calc label.st-f{display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;gap:.35rem;margin:0;font-size:.95rem;color:rgba(244,239,232,.82)}
main#main .st-calc .row label{margin:0}main#main .st-calc .row>span{display:inline-flex;align-items:center;min-width:0}
main#main .st-calc input[type=number],main#main .st-calc select{width:7.6rem;flex:none;box-sizing:border-box;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.42);border-radius:8px;color:#f4efe8;font:inherit;font-size:1.05rem;padding:.45rem .55rem;min-height:44px}
main#main .st-calc .st-f select{width:100%}
main#main .st-calc input[type=number]{text-align:right}
main#main .st-calc select option{color:#1c2028}
main#main .st-calc label.ck{justify-content:flex-start;gap:.6rem;align-items:flex-start;margin-top:.2rem}
main#main .st-calc label.ck input{width:1.3rem;height:1.3rem;margin:.1rem 0 0;flex:none;accent-color:#d4894a}
main#main .st-calc .st-note{margin:.9rem 0 0;color:rgba(244,239,232,.8);font-size:.95rem;line-height:1.5}
main#main .st-calc .q{display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;min-width:24px;min-height:24px;margin-left:.35rem;border-radius:50%;border:1px solid rgba(244,239,232,.55);background:transparent;color:#f4efe8;font:inherit;font-size:.85rem;line-height:1;cursor:pointer;vertical-align:middle;flex:none}
main#main .st-calc .tip{display:none;margin:-.2rem 0 .8rem;padding:.6rem .75rem;border-radius:10px;background:rgba(244,239,232,.1);color:rgba(244,239,232,.92);font-size:.95rem;line-height:1.5}
main#main .st-calc .tip.on{display:block}
main#main .st-calc .st-break{margin:.6rem 0 0;padding-top:.7rem;border-top:1px solid rgba(244,239,232,.18)}
main#main .st-calc .st-break .k{margin:0 0 .3rem;font-size:.9rem;font-weight:600;color:rgba(244,239,232,.85)}
main#main .st-calc .st-break .ln{display:flex;justify-content:space-between;gap:1rem;font-size:.95rem;line-height:1.4;padding:.12rem 0;color:rgba(244,239,232,.8)}
main#main .st-calc .st-break .ln strong{font-weight:500;color:#f4efe8;font-variant-numeric:tabular-nums;white-space:nowrap}
@media (max-width:420px){main#main .st-calc input[type=number]{width:6.6rem}}
main#main .st-ex{border-left:3px solid var(--brass);padding:.9rem 1.15rem;margin:0 0 1.4rem;max-width:720px;border-radius:0 16px 16px 0;background:rgba(255,255,255,.55)}
main#main .st-ex p{color:var(--muted);line-height:1.7;margin:0 0 .5rem;font-size:var(--read,1.0625rem)}main#main .st-ex p:last-child{margin:0}
main#main .st-ex .k{font-family:var(--sans);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--g-ink,#8a5226);font-weight:600;margin-bottom:.35rem}
main#main .st-mo{margin:1.4rem 0 1.8rem;max-width:760px;padding:1.1rem 1.15rem .9rem;border-radius:18px;box-sizing:border-box}
main#main .st-mo .cap{font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.05rem;line-height:1.4;margin:0 0 .6rem}
main#main .st-mo figcaption{margin-top:.8rem;color:var(--muted);font-size:.95rem;line-height:1.55}
main#main table.st-nd,main#main .st-nd tbody{display:grid;gap:1.15rem;width:100%;margin:0;border-collapse:separate}main#main .st-nd tr{display:block;margin:0;padding:0;background:none}
main#main .st-nd th,main#main .st-nd td{padding:0;border:0;background:none;text-align:left;font-weight:400}
main#main .st-nd .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
main#main .st-nd th.hd{display:flex;flex-wrap:wrap;align-items:baseline;gap:.15rem .7rem;margin:0 0 .35rem;font-family:var(--sans);font-size:1rem;line-height:1.35;color:var(--navy)}
main#main .st-nd .hd a{color:var(--navy);font-weight:600}
main#main .st-nd .fee{color:var(--muted);font-size:.95rem}
main#main .st-nd .vd{margin-left:auto;font-weight:650;font-size:.95rem}
main#main .st-nd .vd.ok{color:#2f6b4a}main#main .st-nd .vd.no{color:#a3402a}
main#main .st-nd td.br{display:grid;grid-template-columns:3.4rem minmax(0,1fr) 5.4rem;align-items:center;gap:.6rem;margin:.25rem 0;font-family:var(--sans);font-size:.95rem;line-height:1.3;color:var(--muted)}
main#main .st-nd .tr{display:block}
main#main .st-nd .b{display:block;height:.7rem;width:calc(var(--f) * 100%);min-width:.4rem;border-radius:5px;background:linear-gradient(90deg,var(--brass),var(--brass-2))}
main#main .st-nd .b.mi{background:#3d5a73}
main#main .st-nd .v{text-align:right;color:var(--navy);font-variant-numeric:tabular-nums;white-space:nowrap}
main#main .st-cost{list-style:none;margin:.4rem 0 1.2rem;padding:0;max-width:760px;display:grid;gap:.55rem}
main#main .st-cost li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.2rem 1rem;padding:.75rem 1rem;border-radius:14px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.8);box-shadow:0 6px 18px -12px rgba(28,32,40,.3)}
main#main .st-cost b{color:var(--navy);font-family:var(--sans);font-weight:650}
main#main .st-cost .amt{color:var(--navy);font-family:var(--sans);font-weight:650;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
main#main .st-cost .why{grid-column:1/-1;color:var(--muted);line-height:1.55;font-size:var(--read,1.0625rem)}
main#main .st-where li{grid-template-columns:minmax(0,1fr)}
@media (prefers-reduced-transparency:reduce){main#main .st-ex,main#main .st-cost li{background:#fbf8f3}}
/* Hero tiles: one line each on a phone, so no tile breaks a word or leaves one word alone (critic, round 1). */
.c3-glance li,.c3-glance span.t,.c3-glance strong{line-height:1.4!important}.c3-glance li{min-width:0}
@media (max-width:699px){.c3-glance{grid-template-columns:1fr!important;gap:.35rem!important}.c3-glance li{flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.55rem!important;padding:.4rem .6rem!important}.c3-glance strong,.c3-glance span.t{display:inline!important}.c3-glance strong::after{content:": "}}
/* Shared chrome, worked around on this page until the lead fixes the shared CSS (NEEDS.md items 11 and 12):
   the listing search box is wider than a 320 px window, and the header is 1029 px wide at 1024. */
@media (max-width:379px){.hx-fb-ai,.hx-fb-ai .hx-ai-badge,.hx-fb-ai .hx-fb-q{max-width:100%!important;min-width:0!important;box-sizing:border-box}.hx-fb-ai .hx-fb-q textarea{flex:1 1 0!important;width:auto!important;min-width:0!important}.hx-fb-pills{flex-wrap:wrap!important;max-width:100%!important}}
@media (min-width:1000px) and (max-width:1100px){.header-inner>.primary{gap:2.2rem!important}.header-inner{gap:1.6rem!important}}
</style>` + "<style>" + DESIGN_CSS() + "</style>";

/* Design pass, 2026-11-08 (redo2/invest-str-tools/DESIGN.md): a two-line headline, a plain contents list, one card
   style (the calculator, the charts, the map and the offers), plain lists, one block width of 720 px, and the
   photos beside the text they show on a wide screen. */
function DESIGN_CSS() {
  const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
  const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
  return ""
    /* 1. The headline: the italic line at about half the H1's size; on a phone the hero facts are flat rows under thin rules. */
    + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
    /* Below 960 px the italic line is under 24 px, so it takes the darker brass for contrast. */
    + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
    + `@media (max-width:699px){${S} .c3-glance{gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;padding:.55rem 0!important;gap:.7rem!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
    /* 2. The contents list: no card, in columns between two thin rules. */
    + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
    + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
    + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}`
    /* 3. Plain lists, no box in a box. The worked example keeps its brass rule; the photos lose their frames. */
    + `${S} .st-ex{background:none!important;border-radius:0!important;padding:.2rem 0 .2rem 1.2rem!important}`
    + `${S} ul.st-cost{gap:0!important}${S} ul.st-cost li{${FLAT};border-top:${RULE}!important;padding:.85rem 0!important}${S} ul.st-cost li:last-child{border-bottom:${RULE}!important}`
    + `${S} .c3-gcards{border-top:${RULE};padding-top:.9rem;gap:1rem 1.5rem!important}${S} .c3-gcards .c3-gcard{${FLAT};padding:0!important}`
    + `@media (min-width:700px){${S} .c3-gcards{grid-template-columns:repeat(3,minmax(0,1fr))!important}}`
    + `${S} .c3-aerial figure.c3ph-hero{${FLAT};padding:0!important}${S} .c3-aerial figure.c3ph-hero figcaption{padding:.5rem 0 0!important}`
    /* 4. One block width. The calculator keeps its own. */
    + `${S} figure.st-mo,${S} ul.st-cost,${S} .c3-gchart,${S} section .wrap>figure:not([class]),${S} .c3-aerial .c3ph-hero,${S} .c3-gcards{max-width:720px!important;box-sizing:border-box}`
    /* 5. On a wide screen each photo sits beside the text it shows; below 1,180 px the order is as before. */
    + `@media (min-width:1180px){${S} .st-side{display:grid;grid-template-columns:minmax(0,720px) minmax(0,1fr);column-gap:2.5rem;align-items:start}`
    + `${S} .st-side>*{grid-column:1}${S} .st-side>.c3-aerial{grid-column:2;grid-row:var(--r,1)/span 2}${S} .st-side>.c3-aerial .c3ph-hero{margin:.3rem 0 0!important;max-width:none!important}}`;
}

/* Workaround (sibling str-vs-ltr NEEDS 1): when the site's edge adds the listing disclaimer after the last
   band, glass.js draws the bottom band as the light top bar and its ivory words vanish. Keep it dark. */
const BAND_FIX = `<style>main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;display:block!important;text-align:center!important;border-radius:24px;padding:1.8rem 1.3rem 1.9rem!important}`
  + `@media (min-width:700px){main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{margin-left:auto!important;margin-right:auto!important;padding:2.2rem 1.6rem!important}}</style>`;

/* ---------------------------------------------------------------------------- */
/* The calculator                                                                 */

/* Round 4 (owner, 2026-11-08): the calculator opens on its answer, in one plain sentence. The only choices up front
   are the town, the bedrooms and who runs it. The results are four lines: what guests pay, what the costs and bills
   take, what you keep, and the nights needed to break even. Every other number sits behind "Change the numbers",
   already filled in. The math (run()) and every default and its source are unchanged. */
const d0 = D["garden-city-beach"];
const OCEAN = { "myrtle-beach": true, "north-myrtle-beach": true };
const num = (id, label, v, step, extra = "") => `<label for="${id}">${label}<input id="${id}" type="number" min="0" step="${step}" value="${v}" inputmode="decimal"${extra}></label>`;
const LINE = (id, label, v) => `<div class="ln"><span>${label}</span><strong id="${id}">${v}</strong></div>`;
/* A "?" beside a label: the explanation shows on hover, focus or tap (owner, 2026-10-27, VERDICTS). */
const Q = (id, about) => `<button type="button" class="q" aria-expanded="false" aria-controls="${id}" aria-label="What ${about} means">?</button>`;
const TIP = (id, text) => `<p class="tip" id="${id}">${text}</p>`;
const r100n = (v) => Math.round(v / 100) * 100;
must(r100(CGC.kept) === "$5,100" && CGC.kept > 0, "the calculator's opening answer: about $5,100");
const SAY0 = `A typical two-bedroom condo in ${d0.name} keeps about <strong>${r100(CGC.kept)} a year</strong> after its bills, before any loan.`;
const CALC = `<div class="st-calc" role="group" aria-labelledby="stCalcT"><p class="t" id="stCalcT">Your rental, before any loan</p>`
  + `<div class="st-ask">`
  + `<label class="st-f" for="stTown"><span>Town</span><select id="stTown">${TOWNS.map((t) => `<option value="${t.key}"${t.key === d0.key ? " selected" : ""}>${t.name}</option>`).join("")}</select></label>`
  + `<div class="st-f" role="group" aria-label="Bedrooms"><span aria-hidden="true">Bedrooms</span><div class="st-seg"><button type="button" data-b="2" aria-pressed="true">2</button><button type="button" data-b="3" aria-pressed="false">3</button></div></div>`
  + `<div class="st-f" role="group" aria-label="Who runs it"><span aria-hidden="true">Who runs it</span><div class="st-seg"><button type="button" data-m="0" aria-pressed="true">You</button><button type="button" data-m="${MGR}" aria-pressed="false">A manager</button></div></div>`
  + `</div>`
  + `<p class="st-ans" id="stSay" aria-live="polite">${SAY0}</p>`
  + `<div class="st-res">`
  + LINE("stGross", "Guests pay a year", money(r100n(CGC.gross)))
  + LINE("stTake", "Costs and bills take", money(-(r100n(CGC.gross) - r100n(CGC.kept))))
  + `<div class="ln keep"><span id="stKeptL">You keep</span><strong id="stKept">${money(r100n(CGC.kept))}</strong></div>`
  + `<div class="ln"><span>Nights to break even<small id="stBk">The average one here books ${d0.n2}</small></span><strong id="stNeed">${CGC.need}</strong></div>`
  + `</div>`
  + `<p class="st-fine">A rough estimate from town averages, not a forecast for one condo. Your own listing can do better or worse.</p>`
  + `<details class="st-more" id="stMore"><summary>Change the numbers</summary>`
  + `<p class="st-note" id="stFill"></p>`
  + `<div class="st-grid"><div>`
  + num("stPrice", "Price, $", d0.price, 1000)
  + num("stFee", "HOA fee a month, $", d0.fee, 25)
  + num("stNightly", "Nightly rate, $", d0.adr2, 1)
  + num("stNights", "Nights booked a year", d0.n2, 1, ' max="365"')
  + `</div><div>`
  + `<div class="row"><span><label for="stTax">Property tax a year, $</label>${Q("stTaxQ", "the property tax")}</span><input id="stTax" type="number" min="0" step="1" value="${taxOf(d0.price, d0.mills)}" inputmode="decimal"></div>`
  + TIP("stTaxQ", `The county taxes a rental you do not live in on 6 percent of its value, at the tax rate for its address. On the Garden City Beach condo that is about ${r100(CGC.tax)} a year, about ${Math.round(CGC.tax / d0.price * 1000) / 10} percent of the price. The calculator fills it in from the price where we know the rate.`)
  + num("stIns", "Rental insurance and permit a year, $", d0.ins, 10)
  + num("stMgr", "Manager, % of nightly bookings", 0, 0.5, ' max="100"')
  + `<label class="ck" for="stUtil"><input id="stUtil" type="checkbox"><span>The HOA fee pays the electric and internet</span></label>`
  + `</div></div>`
  + `<div class="st-break"><p class="k">Where the money goes</p>`
  + LINE("stClean", "Cleaner, paid by the guest's cleaning fee", money(-CGC.clean))
  + LINE("stAir", "Airbnb's fee", money(-CGC.airbnb))
  + LINE("stUt", "Utilities and internet", money(-CGC.util))
  + LINE("stSup", "Supplies and repairs", money(-CGC.supRep))
  + LINE("stMg", "Manager", money(0))
  + LINE("stHoa", "HOA fee", money(-CGC.fee))
  + LINE("stTx", "Property tax", money(-CGC.tax))
  + LINE("stIn", "Insurance and permit", money(-CGC.ins))
  + `</div>`
  + `<p class="st-note">The rate and nights are town averages, so one unit can do better or worse. Costs are AirROI's shares for the town, the low end of what owners pay. Your own condo insurance policy is extra, and no loan is counted. Chapter3 does not manage rentals.</p>`
  + `</details></div>`
  + `<script>(function(){var D=${JSON.stringify(Object.fromEntries(DEF.map((d) => [d.key, Object.assign({}, d, OCEAN[d.key] ? { ocean: 1 } : {})])))};var run=${RUN_SRC};var MGR=${MGR};`
  + `var $=function(i){return document.getElementById(i)};var g=function(i){var e=$(i);var v=e?parseFloat(e.value):NaN;return isFinite(v)&&v>0?v:0};var all=function(s,f){Array.prototype.forEach.call(document.querySelectorAll(s),f)};`
  + `var m=function(x){return (x<-0.5?"-$":"$")+Math.round(Math.abs(x)).toLocaleString("en-US")};var h=function(x){return Math.round(x/100)*100};var r=function(x){return "$"+h(Math.abs(x)).toLocaleString("en-US")};var o=function(i,t){var e=$(i);if(e)e.textContent=t};`
  + `var taxSet=false,custom=false,beds="2";`
  + `function seg(){all(".st-calc button[data-b]",function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-b")===beds))});var mg=String(g("stMgr"));all(".st-calc button[data-m]",function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-m")===mg))})}`
  + `function fill(){var d=D[$("stTown").value],two=beds==="2";$("stNightly").value=two?d.adr2:d.adr3;$("stNights").value=two?d.n2:d.n3;$("stIns").value=d.ins;`
  + `var said="Filled in: the average "+(two?"two":"three")+"-bedroom Airbnb's rate and nights in "+d.name+", and AirROI's rental insurance and permit cost there";var own=!(two&&d.price);`
  + `if(own){$("stPrice").value="";$("stFee").value="";$("stMore").open=true}else{$("stPrice").value=d.price;$("stFee").value=d.fee;said+=", and a typical two-bedroom condo for sale there that allows nightly rentals"+(d.key==="surfside-beach"?", most of them a mile or more from the beach":"")}`
  + `said+=".";if(own)said+=" Put in the listing's price and HOA fee.";taxSet=false;custom=false;`
  + `if(!d.mills)said+=" The tax rate here depends on the address, so the tax is blank. Send us the address and we work it out.";`
  + `else if(d.key==="surfside-beach")said+=" The tax is at the rate for most condos with a Surfside Beach address, which sit outside the town; inside the town it is a little higher.";`
  + `o("stFill",said);seg();calc()}`
  + `function calc(){var d=D[$("stTown").value],two=beds==="2",price=g("stPrice"),miss=$("stPrice").value===""||$("stFee").value==="";if(!taxSet)$("stTax").value=d.mills&&price?Math.round(price*0.06*d.mills/1000):"";`
  + `var i={rate:g("stNightly"),nights:Math.min(g("stNights"),365),clean:d.clean,run:d.run,util:$("stUtil").checked,mgr:Math.min(g("stMgr"),100),fee:g("stFee"),tax:g("stTax"),ins:g("stIns"),price:price};var c=run(i);`
  + `o("stClean",m(-c.clean));o("stAir",m(-c.airbnb));o("stUt",i.util?"in the HOA fee":m(-c.util));o("stSup",m(-c.supRep));o("stMg",m(-c.mgr));o("stIn",m(-c.ins));`
  + `var kind=(two?"two":"three")+"-bedroom",subj=custom?"This listing":"A typical "+(d.ocean?"oceanfront ":"")+kind+" condo in "+d.name;if(i.mgr>0)subj+=", run by a manager"+(i.mgr===MGR?"":" at "+i.mgr+" percent")+",";`
  + `o("stBk",custom?"You put in "+i.nights+" booked":"The average one here books "+i.nights);var say=$("stSay");`
  + `var blank=function(t){say.textContent=t;o("stTake","--");o("stKept","--");o("stNeed","--");o("stKeptL","You keep")};`
  + `if(miss){o("stGross",m(h(c.gross)));o("stHoa","--");o("stTx","--");blank("Put in the listing's price and HOA fee under \\u201cChange the numbers\\u201d to see what a "+kind+" in "+d.name+" keeps.");return}`
  + `if(!i.nights||!i.rate){o("stGross","--");blank("Put in a nightly rate and the nights booked under \\u201cChange the numbers\\u201d.");return}`
  + `o("stHoa",m(-c.fee));o("stTx",c.tax?m(-c.tax):"not counted");var gr=h(c.gross),k=h(c.kept);o("stGross",m(gr));o("stTake",m(-(gr-k)));`
  + `if(k<0){o("stKeptL","Short of the bills");o("stKept",m(-k))}else{o("stKeptL","You keep");o("stKept",m(k))}`
  + `o("stNeed",c.need===null?"--":c.need>365?"more than 365":String(c.need));`
  + `var s=Math.abs(c.kept)<250?subj+" about pays its bills, with little left over, before any loan.":c.kept>0?subj+" keeps about <strong>"+r(c.kept)+" a year</strong> after its bills, before any loan.":subj+" falls about <strong>"+r(-c.kept)+" a year</strong> short of its bills, before any loan.";`
  + `if(!c.tax)s+=" Property tax is not counted.";say.innerHTML=s}`
  + `function tips(){all(".st-calc .q",function(b){var t=$(b.getAttribute("aria-controls"));var set=function(on){b.setAttribute("aria-expanded",String(on));t.classList.toggle("on",on)};var pinned=false;`
  + `b.addEventListener("click",function(){pinned=!pinned;set(pinned)});b.addEventListener("mouseenter",function(){set(true)});b.addEventListener("mouseleave",function(){if(!pinned)set(false)});`
  + `b.addEventListener("focus",function(){set(true)});b.addEventListener("blur",function(){if(!pinned)set(false)})})}`
  + `function start(){if(!$("stTown"))return;$("stTown").addEventListener("change",fill);`
  + `all(".st-calc button[data-b]",function(b){b.addEventListener("click",function(){beds=b.getAttribute("data-b");fill()})});all(".st-calc button[data-m]",function(b){b.addEventListener("click",function(){$("stMgr").value=b.getAttribute("data-m");seg();calc()})});`
  + `["stPrice","stFee","stNightly","stNights","stIns"].forEach(function(id){$(id).addEventListener("input",function(){custom=true;calc()})});$("stMgr").addEventListener("input",function(){seg();calc()});$("stUtil").addEventListener("change",function(){custom=true;calc()});`
  + `$("stTax").addEventListener("input",function(){taxSet=true;custom=true;calc()});tips();fill()}`
  + `if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start()})();</script>`;

/* The worked example under it (rows 9, 12; VERIFY.md 3, 4). From run() at the defaults. Round 4: two short
   paragraphs, since the calculator now states the Garden City answer itself. */
const r500 = (v) => "$" + (Math.round(v / 500) * 500).toLocaleString("en-US");
const r5k = (v) => "$" + (Math.round(v / 5000) * 5000).toLocaleString("en-US");
must(r5k(d0.price) === "$345,000" && d0.fee === 575, "row 6: the Garden City Beach condo, about $345,000 and $575 a month");
must(CMB.d.fee / CGC.d.fee > 2, "short answer: more than twice as high");
const WORKED = `<div class="st-ex"><p class="k">The worked example</p>`
  + `<p>The calculator starts on a typical two-bedroom beach condo for sale in Garden City Beach that allows nightly rentals. It asks about ${r5k(d0.price)}, and its HOA fee is about ${money(d0.fee)} a month. The average two-bedroom Airbnb there books about ${d0.n2} nights a year, and this condo pays its bills at about ${CGC.need}. With a manager at ${MGR} percent of the bookings, it needs about ${MGC.need} nights and keeps under ${money(2000)}.</p>`
  + `<p>The oceanfront towers in Myrtle Beach are the hard case. A typical two-bedroom there has a fee of about ${r100(CMB.d.fee)} a month and needs about ${CMB.need} booked nights. `
  + `The average listing books about ${CMB.d.n2}, counting listings open only part of the year, so it falls about ${r1k(-CMB.kept)} short. Open all year, it keeps about ${r500(FULL.kept)}, or falls a little short with a manager.</p></div>`;

/* Round 4 (owner, 2026-11-08: "horizontal idx listings is the strongest tool we have"): the condos for sale in the
   town the calculator opens on, right under its answer. Place str-garden-city-beach-condos in Blog-Brain
   batches/2026-10-b/data/idx-places.json: condos within a mile of the middle of Waccamaw Drive, all inside Garden
   City (live map search, 2026-11-08: 56 condos, 51 of them on Waccamaw Drive). index false. The offer pill is the
   fallback, shown only while the strip is empty. */
const GC_CONDOS = G.homes("str-garden-city-beach-condos", "Garden City Beach",
  G.offer("Garden City Beach", { label: "Get the Garden City Beach condos for sale" }),
  "Best Airbnb opportunities in Garden City Beach");
/* What a host can tell a guest about Garden City Beach: rows S25 to S27 and T26, word for word from the
   /buyers/relocating/which-town/ ledger (independent verifier, 2026-11-08). */
const GC_SELL = h.p(`What to tell a guest about Garden City Beach:`) + h.ul([
  `Parking is free all year at every oceanfront beach access Horry County runs in Garden City.`,
  `At the inlet end of Waccamaw Drive, people go up to the rooftop deck of Gulfstream Cafe to watch the sun set over the water.`,
  `From a dock on the marsh, you can tie a chicken neck to a string and pull up blue crabs for dinner, and with three or fewer drop nets, fold-up traps or hand lines you need no license.`,
  `Every Fourth of July afternoon, decorated golf carts drive the "wet" parade while people along the route soak them with water guns.`,
]);

/* ---------------------------------------------------------------------------- */
/* The fee chart (rows 6, 9, 12, 13; VERIFY.md 3): four worked condos.                                */

/* Round 4 (owner, 2026-11-08: "i feel like i need a college dipoma to read most graphs"): one point, in the title.
   Lowest fee first; for each place two labelled bars, the nights it needs and the nights the average one books,
   and the verdict in words. No legend, no third bar: the manager case is in the calculator. */
const FEE_ROWS = [
  { name: "Surfside Beach", href: "/submarkets/surfside-beach/", c: CSB },
  { name: "Garden City Beach", href: "/submarkets/garden-city/", c: CGC },
  { name: "North Myrtle Beach, oceanfront", href: "/submarkets/north-myrtle-beach/", c: CNMB },
  { name: "Myrtle Beach, oceanfront", href: "/submarkets/myrtle-beach/", c: CMB },
];
must(FEE_ROWS.every((r, i) => i === 0 || r.c.d.fee > FEE_ROWS[i - 1].c.d.fee), "the fee chart runs from the lowest fee up");
must(FEE_ROWS.every((r) => (r.c.kept > 0) === (r.c.d.n2 >= r.c.need)), "the verdict matches what is kept");
const NEED_MAX = Math.max(...FEE_ROWS.map((r) => Math.max(r.c.need, r.c.d.n2)));
const fq = (v) => Math.round(v / NEED_MAX * 1000) / 1000;
const FEE_TABLE = `<figure class="st-mo st-need"><p class="cap" id="stNeedCap">The lower the HOA fee, the fewer nights a condo must book to pay its bills</p>`
  + `<table class="st-nd" aria-labelledby="stNeedCap"><thead class="sr"><tr><th scope="col">Where, its HOA fee, and whether it pays its bills</th><th scope="col">Nights it needs to pay its bills</th><th scope="col">Nights the average one books</th></tr></thead><tbody>`
  + FEE_ROWS.map((r) => { const ok = r.c.d.n2 >= r.c.need;
    return `<tr><th scope="row" class="hd"><a href="${r.href}">${r.name}</a><span class="fee">HOA fee ${money(r.c.d.fee)} a month</span><span class="vd ${ok ? "ok" : "no"}">${ok ? "Pays its bills" : "Falls short"}</span></th>`
      + `<td class="br"><span class="lb" aria-hidden="true">Needs</span><span class="tr" aria-hidden="true"><span class="b" style="--f:${fq(r.c.need)}"></span></span><span class="v">${r.c.need} nights</span></td>`
      + `<td class="br"><span class="lb" aria-hidden="true">Books</span><span class="tr" aria-hidden="true"><span class="b mi" style="--f:${fq(r.c.d.n2)}"></span></span><span class="v">${r.c.d.n2} nights</span></td></tr>`; }).join("")
  + `</tbody></table><figcaption>A typical two-bedroom condo for sale that allows nightly rentals, run by its owner, before any loan. The bills are the HOA fee, the property tax and rental insurance. Books: the average two-bedroom Airbnb in the town, AirROI, 12 months to September 2026.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* Town by town (rows 7, 14, 15). Two-bedroom only: the three-bedroom figure beside the name read as the
   bar's value (critic and reader, review 1). Bars on a phone too (owner's eye, review 1). Round 4: the title states the point. */

const TOWN_CHART = G.bars(TOWNS.map((t) => ({ t, a: T[t.key] })).sort((x, y) => y.a.two_bed.average - x.a.two_bed.average).map(({ t, a }) => ({
  name: t.name, href: t.href, value: a.two_bed.average, valueText: r1k(a.two_bed.average) })),
{ caption: "For a two-bedroom Airbnb, most towns are close. Little River is the low one.", nameLabel: "Town", valueLabel: "a year from guests, two bedrooms", compact: true,
  note: "What the average two-bedroom Airbnb took in over a year: money from guests, cleaning fees included, before any cost. AirROI, 12 months to September 2026. Little River and Conway have few two-bedroom listings." });
const TW = (k) => T[k];
const two = TOWNS.map((t) => T[t.key].two_bed.average).sort((a, b) => a - b);
must(two[0] === TW("little-river").two_bed.average && two[1] === TW("north-myrtle-beach").two_bed.average && two[7] === MI.two_bed.average, "row 15: Little River low, North Myrtle Beach to Murrells Inlet for the other seven");

/* ---------------------------------------------------------------------------- */
/* The season (row 16). Round 4: one town, one bar a month, and the point in the title. The second town and the
   ocean's temperature made the chart hard to read; the text keeps both. */

must(Math.round(M["myrtle-beach"][6].revenue / M["myrtle-beach"][0].revenue) === 5, "row 16: about five times");
const SEASON = G.bars(M["myrtle-beach"].map((x) => ({ name: x.month, value: x.revenue, valueText: r100(x.revenue) })),
{ caption: "A Myrtle Beach Airbnb earns about five times as much in July as in January", nameLabel: "Month", valueLabel: "earned that month", compact: true,
  note: "Average money from guests per Myrtle Beach Airbnb listing open that month, over the last two years. AirROI." });

/* More hosts (row 20). Garden City's page gives no listing figure. Round 4: the listing counts beside each
   name are gone; the title states the point. */
must(Math.min(...TOWNS.map((t) => growth(t.key)).filter((g) => g !== null)) === 24, "row 20: the least growth, 24 percent, about a quarter");
const GROWTH = G.bars(TOWNS.filter((t) => growth(t.key) !== null).map((t) => ({ t, g: growth(t.key) })).sort((x, y) => y.g - x.g).map(({ t, g }) => ({
  name: t.name, value: g, valueText: `${g}% more` })),
{ caption: "Airbnb listings grew in every town, by about a quarter or more", nameLabel: "Town", valueLabel: "growth in active listings", compact: true,
  note: "Active listings now, against the year before. AirROI, 12 months to September 2026." });
/* Review 2: the income change (row 20 note, -10.7 then +7.8) is not on the page. Row 20 says use the
   listing growth, and the owner (2026-10-10): no good data, no mention. */

/* Where nightly stays are marked on homes for sale (row 21; VERIFY.md 6). Short names: the 1440 wrap split
   "houses" from its count (critic, review 1); the note says how each place is drawn. */
const pct = (o) => o.str_allowed / o.total * 100;
const HOUSES = G.bars([
  ["Garden City area", "garden_city"], ["North Myrtle Beach", "north_myrtle_beach"], ["Pawleys Island", "pawleys_island"],
  ["Surfside Beach", "surfside_beach"], ["Murrells Inlet", "murrells_inlet"], ["Myrtle Beach city", "myrtle_beach_city"],
  ["Little River", "little_river"], ["Conway", "conway"],
].map(([name, k]) => ({ name, k, p: pct(LB[k].house) })).sort((x, y) => y.p - x.p).map((r) => ({
  name: r.name, value: r.p, valueText: `${Math.round(r.p)}%` })),
{ caption: "Houses for sale marked for nightly rentals: about three in four in the Garden City area, few inside Myrtle Beach", nameLabel: "Where", valueLabel: "share of houses for sale marked for nightly rentals", max: 100, compact: true,
  note: "Our count of active listings, by what the listing agent entered. A listing that says nothing counts as not marked. Myrtle Beach counts only homes inside city limits. The others go by the town in the home's address, except the Garden City area, which is our own." });

/* Round 4: the houses for sale in Garden City Beach, where the chart above leads. Place str-garden-city-beach-houses in
   Blog-Brain batches/2026-10-b/data/idx-places.json: houses within 0.8 mile of the middle of Waccamaw Drive (live map
   search, 2026-11-08: 32 houses, 30 inside Garden City; 24 of the 32 marked for nightly rentals). index false. The old
   "Send me homes that allow Airbnb" box is the fallback, shown only while the strip is empty. */
const GC_HOUSES = (bg) => G.homes("str-garden-city-beach-houses", "Garden City Beach",
  h.cta("Want homes where nightly stays are allowed?", "Tell us the town and your budget. We send homes for sale there and leave out the ones whose zoning or building rules ban nightly stays.", "Send me homes that allow Airbnb", "/contact/", bg),
  "Prime Airbnb beach houses in Garden City Beach");

/* Photos (rules/images.md; photos.json). No year in the captions (owner's eye, review 1). */
const TOWERS = PH.aerial("myrtle-beach-oceanfront-towers-and-houses-2011", "Oceanfront towers in Myrtle Beach, with streets of houses behind them, seen from over the ocean.");
/* Review 2 (owner's eye): the photo shows houses, so it sits by the houses chart, where the Garden City area
   leads (row 21: 38 of 51, about three in four). */
must(LB.garden_city.house.str_allowed === 38 && LB.garden_city.house.total === 51, "row 21: Garden City area houses");
const GARDEN = PH.aerial("garden-city-beach-and-marsh-from-the-ocean-2011", "Beach houses between the ocean and the marsh at Garden City Beach. In the Garden City area, about three in four houses for sale are marked for nightly rentals.", { closeUp: true });

/* Review 2 (the reader from Ohio: "Where is this?"): one map of the eight towns. Each town sits at its
   Census TIGER/Line 2026 label point, the same cached file the map tool draws (row 33). */
const GEO = require(path.join(BB, "tools", "geo", "grand-strand-v2.json"));
const atTown = (g) => { const t = GEO.region.towns.find((x) => x.n === g); must(t, `row 33: ${g}`); return { lat: 33 + t.at[1] / 10000, lon: -80 + t.at[0] / 10000 }; };
const MAPKIT = PK.create({ h, theme: "glass", mapDir: path.join(__dirname, "..", "chapter3realty", "images", "2026-10-d", "invest-str-tools"), mapSrc: "/images/2026-10-d/invest-str-tools" });
const MAP = MAPKIT.placesMap("Grand Strand Airbnb towns", TOWNS.map((t) => Object.assign({ name: t.name, href: t.href }, atTown(t.name === "Garden City Beach" ? "Garden City" : t.name))), {
  caption: "Map of the eight towns on this page, from Little River south to Pawleys Island, and Conway inland.", leaders: { places: true, towns: [] } });
must(MAP.map.unlabelled.length === 0, "review 2: every town named on the map");

/* The glance row under the H1 (rows 12, 17; VERIFY.md 3). Each tile reads as one thought (owner's eye). */
const GLANCE = glance([
  { icon: "calendar", label: "Oceanfront Myrtle Beach", text: `About ${CMB.need} nights to pay the bills` },
  { icon: "dollar", label: "Lower-fee condos", text: `About ${Math.round(CSB.need / 10) * 10} to ${Math.round(CGC.need / 10) * 10} nights to pay the bills` },
  { icon: "beach", label: "June to August", text: "Nearly half the year's income" },
]);
must(MB.top3_share_pct >= 45 && MB.top3_share_pct < 50, "row 17: nearly half");

/* The other STR pages, by question. */
const GUIDE = G.guideCards([
  { icon: "dollar", label: "Money", items: [
    h.a("/invest/airbnb-income/", "How much do Airbnbs make here?"),
    h.a("/invest/str-vs-ltr/", "Airbnb or a yearly lease?"),
    h.a("/invest/rental-returns/", "What return does a rental make?"),
    h.a("/invest/str-tax-treatment/", "How is the income taxed?") ] },
  { icon: "tax", label: "Rules and tax", items: [
    h.a("/invest/str-rules/", "Where is an Airbnb allowed?"),
    h.a("/invest/accommodations-tax/", "What tax does the guest pay?"),
    h.a("/invest/14-day-rule/", "How many nights can I use it myself?") ] },
  { icon: "key", label: "Running it", items: [
    h.a("/invest/str-setup/", "What do I set up after closing?"),
    h.a("/invest/rental-program-vs-airbnb/", "Rental program or run it myself?"),
    h.a("/invest/mid-term-rentals/", "Rent it for 90 days or more instead?"),
    h.a("/invest/condotel-financing/", "Can I get a loan on a condotel?") ] },
]);

/* Where the worked condos are (row 31), one card a place (owner's eye, review 1: name the buildings and
   streets). A list, not four paragraphs, so the phone does not scroll a wall of prose (critic warning). */
const WHERE = `<ul class="st-cost st-where">`
  + [
    ["Garden City Beach, on the beach", `Nearly all are on Waccamaw Drive, the street along the beach. Beach House, Sea Watch and Garden Sands are among those with fees of ${money(600)} a month or less.`],
    ["Surfside Beach, mostly inland", `Most are at Retreat at Glenns Bay, Golf Colony at Deerfield and Grand Palms Resort, a mile or more from the beach, with fees of ${money(600)} or less. On the oceanfront, the units listed at Sea Shadow have fees over ${money(1000)}, and the few others listed there have fees of ${money(1000)} or less. An inland condo may book fewer nights than the town's average of ${CSB.d.n2}, which counts the beach condos too. It pays its bills at about ${CSB.need}, about half that average.`],
    ["Myrtle Beach, oceanfront", `The fees of ${money(800)} a month or less are at places like Ocean Forest Villas and Beach Colony. The fee pays the electric on every unit listed at Sand Dunes, the Caribbean, Dunes Village, Carolinian Beach Resort and Grande Shores.`],
    ["North Myrtle Beach, oceanfront", "The fee pays the electric on most of the units listed at Bay Watch and Beach Cove."],
  ].map(([k, why]) => `<li><b>${k}</b><span class="why">${why}</span></li>`).join("") + `</ul>`;

/* Review 2 (owner's eye): one number a card (owner, 2026-10-07: "too many numbers"). */
must(CSB.need / CSB.d.n2 > 0.45 && CSB.need / CSB.d.n2 < 0.56, "row 31 card: about half the Surfside average");
const CLEAN = money(Math.round(MB.cleaning_fee_median / 10) * 10);
must(CLEAN === "$150", "row 24: about $150");
const COSTS = `<ul class="st-cost">`
  + [
    ["Airbnb's fee", "15.5%", `Most hosts pay 15.5 percent of each booking, taken from the payout. Some still pay less on an older plan, which ${h.ext(ABNB_FEE, "Airbnb is phasing out")}, so the calculator uses AirROI's average for the town.`],
    ["Cleaning", `about ${CLEAN} a stay`, "The guest's cleaning fee pays the cleaner, so the owner keeps none of it. It is the typical fee in Myrtle Beach."],
    ["Utilities, supplies, repairs", "about 10%", "Utilities and internet are about half of it. Supplies, repairs and linens are the rest. Where the HOA fee pays the electric and internet, the owner does not pay most of the utilities."],
    ["Rental insurance and permit", `${money(MB.insurance_line + MB.permit_line)} a year`, "A short-term rental policy on top of Airbnb's free cover, and a permit where one is needed. This is AirROI's cost for Myrtle Beach; it differs by town, and the calculator fills in each town's. The owner's own condo policy is extra."],
    ["A manager, basic plan", "about 13 to 17%", "The basic plans we have seen here cover marketing, guest messages and basic accounting. Full service adds taxes, maintenance and repairs, and is priced as a share of the profit."],
  ].map(([k, amt, why]) => `<li><b>${k}</b><span class="amt">${amt}</span><span class="why">${why}</span></li>`).join("") + `</ul>`;

/* ---------------------------------------------------------------------------- */

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Myrtle Beach Airbnb Calculator: Nights to Pay the Bills",
  description: "What a Grand Strand Airbnb keeps after the condo fee, the property tax and Airbnb's cut, and how many nights it must book to pay its bills.",
  ogTitle: "Myrtle Beach Airbnb calculator: what a nightly rental keeps after the HOA fee and tax, and the nights it needs",
  crumb: "Short-Term Rentals",
  eyebrow: "Short-term rental tools",
  h1: "How much would you keep from a Myrtle Beach Airbnb?",
  h1em: "Count the costs before you offer.",
  sub: "A rough yearly estimate for one Grand Strand nightly rental, from town averages: what is left after the HOA fee, tax and Airbnb's cut.",
  heroMedia: GLANCE,
  heroCta: { title: "Send us a listing. We run its own fee, tax and nightly rate through these numbers before you offer.", label: "Have us run its numbers", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    `From a few thousand dollars a year over its bills to a few thousand short, before any mortgage payment. It depends most on the HOA fee, the monthly fee every condo owner pays. Run as an Airbnb by its owner, a typical two-bedroom beach condo in Garden City Beach keeps about ${r1k(CGC.kept)} a year. With a manager, who takes a share of each booking, it keeps under ${money(2000)}.`,
    `A typical oceanfront two-bedroom inside Myrtle Beach has a fee more than twice as high. At the nights the average listing books, counting listings open only part of the year, it falls about ${r1k(-CMB.kept)} short. Open all year, it keeps about ${r500(FULL.kept)}, or falls a little short with a manager.`,
  ],
  sections: [
    { h2: "How many nights does it take to pay the bills?", toc: "The calculator", id: "calculator", html: (bg) =>
      CSS + BAND_FIX + PH.css() + G.homesCss() +
      h.p(`Pick a town, the bedrooms and who runs it. The calculator fills in what Airbnbs like it there charge and book on average, from AirROI, a company that publishes Airbnb data town by town.`) +
      CALC + WORKED +
      GC_SELL + GC_CONDOS +
      h.p(`Thinking of a yearly lease instead? Our page on ${h.a("/invest/str-vs-ltr/", "Airbnb or a long-term rental")} runs the same home both ways, and our ${h.a("/invest/long-term-rental/", "rental analyzer")} prices the lease.`) },

    { h2: "Why does the HOA fee matter so much for a Myrtle Beach Airbnb?", toc: "The HOA fee", id: "condo-fee", html: (bg) =>
      /* Design pass 2026-11-08: on a wide screen the towers photo sits beside the paragraph and chart about the towers. */
      `<div class="st-side">` +
      h.p(`In an oceanfront tower the HOA fee is the biggest bill. On the typical Myrtle Beach oceanfront two-bedroom it is nearly three quarters of the bills. It is due every month, in January as well as July. Where the fee is lower, the bills take far fewer booked nights to pay.`) +
      FEE_TABLE +
      h.p(`The low fees are in two kinds of places: on the beach in Garden City Beach, and inland in Surfside Beach.`) +
      WHERE +
      TOWERS + `</div>` +
      h.p(`When the fee pays the electric, tick the box under "Change the numbers" in the calculator, and the utilities cost goes. Most oceanfront units are in the building's own rental program, which takes its own share. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program or Airbnb")} compares the two.`) +
      h.cta("Send us the listing you are looking at", "We read the building's budget and what its fee pays for, at no cost.", "Have us read the building's budget", "/contact/", bg) },

    { h2: "How do the Grand Strand towns compare for an Airbnb?", toc: "Town by town", id: "towns", html: (bg) =>
      h.p(`For the same size of home, the towns are close. In seven of the eight, the average two-bedroom took in about ${r1k(TW("north-myrtle-beach").two_bed.average)} to ${r1k(MI.two_bed.average)} a year. Little River took in far less, and Murrells Inlet and Garden City Beach did best. What Airbnbs take in by town, size and month is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}.`) +
      MAP.html + TOWN_CHART +
      h.p(`Counting all sizes, Murrells Inlet's average Airbnb took in nearly twice Myrtle Beach's. Most of Murrells Inlet's listings are houses, and most of its homes sleep groups. Four in five of Myrtle Beach's listings are condos, and Myrtle Beach has far more listings than any other town here.`) +
      h.cta("Torn between two towns?", "Send us a listing in each. We run both through the same numbers, at no cost.", "Send us two listings", "/contact/", bg) },

    { h2: "How slow is the off season for a Myrtle Beach Airbnb?", toc: "The season", id: "season", html: () =>
      h.p(`A Myrtle Beach Airbnb earns about five times as much in July as in January, when the ocean is about ${Math.round(M.water_f[0])} degrees. June, July and August bring in nearly half its year. In Murrells Inlet, where most Airbnbs are houses, they bring ${MI.top3_share_pct} percent.`) +
      SEASON +
      h.p(`Murrells Inlet earns more in every month, with bigger homes. Pawleys Island has the most even year, with ${TW("pawleys-island").top3_share_pct} percent of its income in June to August.`) +
      h.p(`Summer guests book early. A typical July booking in Myrtle Beach is made in mid-May, and Murrells Inlet's July stays are booked even further ahead.`) +
      /* Round 4: what a host can offer a guest in the quiet months. Rows S19, T25 and S29 of the /buyers/relocating/which-town/
         ledger, word for word (independent verifier, 2026-11-08). */
      h.p(`The quiet months still give a listing something to offer a guest:`) +
      h.ul([
        `In Myrtle Beach, after the summer season, from September to May 1, you can walk a leashed dog or ride a bike on the beach and the boardwalk at any hour.`,
        `In Surfside Beach, from mid-September to mid-May, you can surf anywhere on the town's beach from sunup to sundown, except within 300 feet of the pier.`,
        `In Murrells Inlet, from the day after Thanksgiving to New Year's Eve, every restaurant along the MarshWalk is outlined in lights that play in time to Christmas music, on the hour and the half hour from 5 to 11 p.m.`,
      ]) +
      h.p(`South Carolina does not tax a stay of 90 continuous days or more by one guest as lodging. Our page on ${h.a("/invest/mid-term-rentals/", "mid-term rentals")} covers renting by the month.`) },

    { h2: "What does Airbnb take from a Myrtle Beach rental, and what else comes off?", toc: "The costs", id: "costs", html: (bg) =>
      h.p(`At AirROI's low-end cost shares, an owner-run Myrtle Beach Airbnb keeps about 63 cents of each dollar guests pay, before insurance, the HOA fee, property tax and any loan.`) +
      COSTS +
      h.p(`The guest pays the lodging taxes on top of the price, about 13 percent inside the City of Myrtle Beach, and Airbnb collects them. Our ${h.a("/invest/accommodations-tax/", "accommodations tax")} page has the rates town by town.`) +
      h.p(`The worst short-term rental mistake our team sees is running it yourself with the cheapest cleaner. We have seen theft and damage follow. If you will not be here to check the cleaning, pick the manager in the calculator.`) +
      h.p(`The top short-term rentals here pick one kind of guest and stay filled, such as golfers, workers or people moving here.`) },

    { h2: "Is Myrtle Beach getting too many Airbnbs?", toc: "More hosts", id: "more-hosts", html: () =>
      h.p(`Myrtle Beach has many more Airbnbs than a year ago, and each new one competes with the rest for the same guests. It had ${growth("myrtle-beach")} percent more active listings than a year earlier. Every other town in the chart grew by about a quarter or more.`) +
      GROWTH +
      h.p(`Many listings book few nights. More than half of Myrtle Beach listings were booked, or blocked by their owner, 90 days or fewer in the year.`) +
      h.p(`For a buyer, that means a condo should pay its bills at the nights the average listing books now. Do not plan on more.`) },

    { h2: "Can you Airbnb a home in Myrtle Beach?", toc: "Where it is allowed", id: "allowed", html: (bg) =>
      h.p(`In an oceanfront condo building, usually yes; in a house inside the city, usually not. Inside the City of Myrtle Beach, a stay under 90 days is short-term, and any rental needs a city business license. The city ${h.ext(MB_ZONE, "allows short-term stays in no residential zone")} except RMV, the zone for apartment and condo buildings for visitors. Fewer than 30 houses in the other residential zones may still rent nightly, because they did before the zoning.`) +
      h.p(`Homes for sale show the same split. Inside Myrtle Beach city limits, about 5 in 6 condos for sale are marked for nightly rentals, and few houses are. In Garden City and North Myrtle Beach, many more houses are.`) +
      /* Design pass 2026-11-08: on a wide screen the Garden City photo sits beside the houses chart, whose first row it shows. */
      `<div class="st-side" style="--r:1">` + HOUSES + GARDEN + `</div>` +
      h.p(`${h.ext(NMB_STR, "North Myrtle Beach")} requires a business license for every short-term rental, renewed every year, and no separate zoning or permit process. Our page on ${h.a("/invest/str-rules/", "short-term rental rules")} covers each town.`) +
      h.p(`A listing's mark is the listing agent's word, not the city's. Before you offer, we read the zoning for the address and the building's own rules.`) +
      GC_HOUSES(bg) },

    { h2: "What else do Grand Strand Airbnb buyers ask?", toc: "More STR pages", id: "more", html: () =>
      h.p(`Each question below has its own page.`) + GUIDE },
  ],
  faqTitle: "Myrtle Beach Airbnb questions",
  faq: [
    { q: "Do you need a business license for an Airbnb in Myrtle Beach?", a: "Yes. Inside the City of Myrtle Beach, any rental needs a city business license. North Myrtle Beach asks every short-term rental for one, renewed each year." },
    { q: "How much does an Airbnb make in Myrtle Beach?", a: `The average one took in about ${r1k(SMB.revenue)} from guests in a year, before any cost. Our Airbnb income page breaks it down by town, size and month.` },
    { q: "How many nights does a Myrtle Beach Airbnb condo need to book?", a: `The count depends most on the HOA fee. The four typical condos in the chart above need about ${CSB.need} to ${CMB.need} booked nights a year to pay their bills if the owner runs them, and more with a manager.` },
    { q: "What percentage does Airbnb take?", a: "For most hosts, 15.5 percent of each booking. The list of costs above shows what else comes off before the HOA fee." },
    { q: "How much is an Airbnb cleaning fee in Myrtle Beach?", a: `About ${CLEAN} is typical. The guest pays it, and it goes to the cleaner, so the owner keeps none of it.` },
    { q: "Who pays the lodging tax on a Myrtle Beach Airbnb?", a: "The guest. Inside the City of Myrtle Beach the lodging taxes add about 13 percent to the price, and Airbnb collects them on stays under 90 nights." },
    { q: "What is the slow season for a Myrtle Beach Airbnb?", a: "November to February are the four slowest months. The season chart above shows each month." },
    { q: "Can you finance an Airbnb condo?", a: "Yes, with limits. A loan officer at our preferred lender tells us that loans approved on the rental's income, called DSCR loans, count only about 75 percent of a short-term rental estimate. A condotel, a condo run as a hotel, needs its own kind of loan." },
  ],
  sources: [
    ...TOWNS.map((t, i) => ({ name: i === 0 ? `AirROI: ${t.name}` : t.name, href: AIRROI(t.key) })),
    { name: "Tax levy", href: LEVY },
    { name: "S.C. 12-43-220", href: T12_43 },
    { name: "S.C. 12-36-920", href: T12_36 },
    { name: "NOAA", href: NOAA },
    { name: "SCDOR ST-575", href: ST575 },
    { name: "Airbnb fees", href: ABNB_FEE },
    { name: "Airbnb taxes", href: ABNB_TAX },
    { name: "City zoning", href: MB_ZONE },
    { name: "North Myrtle Beach rentals", href: NMB_STR },
    { name: "County beaches", href: "https://www.horrycountysc.gov/departments/parksandrecreation/beach-accesses/" },
    { name: "Gulfstream", href: "https://gulfstreamcafe.com/" },
    { name: "SCDNR", href: "https://www.dnr.sc.gov/fish/swfaqs.html" },
    { name: "Visit Myrtle Beach", href: "https://www.myrtlebeachareacvb.com/news/myrtle-beach-lights-up-july-4th-with-fireworks-festivals-and-family-fun" },
    { name: "City news", href: "https://www.cityofmyrtlebeach.com/news_detail_T6_R2685.php" },
    { name: "Surfside surfing", href: "https://www.surfsidebeach.org/204/Swimming-Surfing-Safety" },
    { name: "MarshWalk", href: "https://marshwalk.com/calendar/wonderland-of-lights-on-the-marshwalk/" },
  ],
  sourcesNote: "AirROI, 12 months to September 2026. Listings: our count. Our arithmetic. Not legal or tax advice.",
  afterSources: () => PH.credits(),
  pageImages: () => PH.share("myrtle-beach-oceanfront-towers-and-houses-2011").pageImages(),
  bottomCta: { h2: "Does its building allow nightly rentals?", p: "Send us the listing. We read its zoning and the building's own rules before you write an offer, at no cost. Call 854.333.2135. We answer evenings.", label: "Have us check its rules", href: "/contact/" },
  keywords: "Myrtle Beach Airbnb calculator, short term rental calculator Myrtle Beach, Airbnb break even calculator, Airbnb cleaning fee Myrtle Beach, what percentage does Airbnb take, Myrtle Beach off season, North Myrtle Beach Airbnb, Surfside Beach Airbnb",
  about: "Short-term rentals (Airbnb) on the Grand Strand: what one nightly rental keeps after its HOA fee, property tax and costs, Horry County, South Carolina",
});
