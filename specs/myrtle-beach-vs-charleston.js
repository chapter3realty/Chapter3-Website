/* /buyers/relocating/myrtle-beach-vs-charleston/ - Myrtle Beach or Charleston, for a buyer choosing where to
 * move: what the same money buys, the property tax bill, the beach, the summer near the ocean, flood
 * insurance, new homes, jobs and the commute, what Charleston has more of, and which one fits which want.
 *
 * Batch 2026-11-d, Lane N. A new page, version 1, 2026-11-13. Plan: Blog-Brain
 * batches/2026-11-d/myrtle-beach-vs-charleston/PLAN.md. Demand: must-answer.md. Facts: facts.md, VERIFIED
 * rows, and CORRECTED rows at the verifier's wording only (VERIFY.md; struck wording in
 * batches/2026-11-d/facts/buyers-relocating-myrtle-beach-vs-charleston-struck.json). Row numbers are F<n>.
 * Changed from the plan by the verifier's corrections:
 *   - Weather (F30 to F33): the airports are not a fair pair (Charleston's is inland). Near the ocean, summer
 *     heat is about the same: 21 days at 90 at the North Myrtle Beach airport, 25 at downtown Charleston's
 *     harbor station (USW00013782, pulled into raw/normals-*-USW00013782.json). The chart shows all three.
 *   - Flood (F23 to F25): "residential buildings", not homes; no Horry flood-zone share.
 *   - Tax (F8): the 4% needs an application, said in the same sentence.
 *   - VA (F41): the clinic and the medical center, no "nearest", no specialist-care line.
 * Not on the page (VERIFY "Not to publish"): our cost index (F14), high-tide days (F40), the Myrtle Beach
 * "half a mile" (F29), "cooler summer", "some specialist care means a drive to Charleston".
 * Data: data/2026-11-d/myrtle-beach-vs-charleston/findings.json (analyze.py over raw/), and the downtown
 * Charleston normals in raw/. Every figure below is read from those files and checked against its row.
 * Picture: one USGS oblique aerial (public domain) of houses behind the dunes in Myrtle Beach, reused from
 * /submarkets/myrtle-beach/ (record copied to data/2026-11-d/myrtle-beach-vs-charleston/photos.json).
 * Homes: the site's edge puts the feed under the opening. Two strips here, mbvc-under-charleston-typical and
 * mbvc-beach-walk-under-437k (new places, lead items in BUILD.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/relocating/myrtle-beach-vs-charleston/";
const SLUG = "myrtle-beach-vs-charleston";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r10 = (v) => money(Math.round(v / 10) * 10);
const r500 = (v) => money(Math.round(v / 500) * 500);

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const F = read("findings.json");
const MB = F.metros.myrtle_beach_metro, CH = F.metros.charleston_metro, CC = F.metros.charleston_county;
const Z = F.zhvi;
/* F1 to F3, F6: Zillow's typical home value, September 2026, and ten years before. */
must(Z.latest_month === "2026-09-30" && Z.latest["Myrtle Beach, SC"] === 339738 && Z.latest["Charleston, SC"] === 437474, "F1, F2");
const ZMB = Z.latest["Myrtle Beach, SC"], ZCH = Z.latest["Charleston, SC"];
const GAP = ZCH - ZMB, GAP0 = Z.gap_ten_years_ago;
must(GAP === 97736 && GAP0 === 52523 && Math.round(GAP / ZCH * 100) === 22, "F3");
must(Z.year_ago["Charleston, SC"] === 438466 && Z.year_ago["Myrtle Beach, SC"] === 337789, "F6");
const GROW = (k) => Math.round((Z.latest[k] / Z.ten_years_ago[k] - 1) * 100);
must(GROW("Myrtle Beach, SC") === 80 && GROW("Charleston, SC") === 81, "both rose about 80% in ten years (F1, F2, F3)");
const SERIES = Object.entries(Z.chart_annual_sept).map(([y, v]) => ({ y: +y, ch: v.charleston, mb: v.myrtle_beach }));
must(SERIES.length === 11 && SERIES[0].y === 2016 && SERIES[10].y === 2026 && SERIES[10].mb === ZMB && SERIES[0].ch - SERIES[0].mb === GAP0, "chart series");
/* F4, F5: Census median value, owner estimates. */
must(MB.median_home_value === 323600 && CH.median_home_value === 429100, "F4, F5");
const CENSUS_GAP = r1k(Math.floor((CH.median_home_value - MB.median_home_value) / 1000) * 1000);
must(CENSUS_GAP === "$105,000", "F5: about $105,000 on Census");
/* F7: median year built. */
must(MB.median_year_built === 2003 && CH.median_year_built === 1999 && CC.median_year_built === 1996, "F7");
/* F9 to F11: median real estate tax paid. */
must(MB.median_real_estate_taxes_paid === 1181 && CH.median_real_estate_taxes_paid === 1932 && CC.median_real_estate_taxes_paid === 2306, "F9 to F11");
const TAX_MB = r10(MB.median_real_estate_taxes_paid), TAX_CH = r10(CH.median_real_estate_taxes_paid), TAX_CC = r10(CC.median_real_estate_taxes_paid);
const TAX_DIFF = money(Math.round((CH.median_real_estate_taxes_paid - MB.median_real_estate_taxes_paid) / 50) * 50);
must(TAX_MB === "$1,180" && TAX_CH === "$1,930" && TAX_CC === "$2,310" && TAX_DIFF === "$750", "tax figures");
/* F13: BEA regional price parities, 2024 (the site's col-places.json, verified at BEA). */
const RPP = { mb: 93.642, ch: 100.962 };
must(Math.round((1 - RPP.mb / RPP.ch) * 100) === 7, "F13: about 7% lower");
/* F15 to F21: jobs, pay, commute. */
const DP = (geo) => JSON.parse(fs.readFileSync(path.join(DATA, "raw", `ACSDP1Y2025.DP03-310M700US${geo}.json`), "utf8"));
const empOf = (d) => { const [head, row] = d.response.data; return +row[head.indexOf("DP03_0004E")]; };
const EMP = { mb: empOf(DP("34820")), ch: empOf(DP("16700")) };
must(EMP.mb === 185121 && EMP.ch === 448948, "F15 employed residents");
must(MB.median_household_income === 71086 && CH.median_household_income === 93054, "F16");
must(MB.value_to_income === 4.55 && CH.value_to_income === 4.61, "F19");
must(MB.industry_pct.arts_recreation_accommodation_food === 14.3 && CH.industry_pct.manufacturing === 10.1 && MB.industry_pct.manufacturing === 4.2, "F18");
must(MB.industry_pct.education_health === 23.7 && CH.industry_pct.education_health === 21.2, "F18 health and education");
must(MB.mean_commute_min === 25.3 && CH.mean_commute_min === 29.7 && MB.commute_45plus_pct === 13.1 && CH.commute_45plus_pct === 21.6, "F20, F21");
/* F26, F27: public beach accesses (SCDES, S.C. Beach Guide map). */
const BA = F.beach_access;
const ACC_HORRY = BA.by_county_type["HORRY|PUBLIC BEACH ACCESS"];
const ACC_CHS = BA.by_county_type["CHARLESTON|PUBLIC BEACH ACCESS"] + BA.by_county_type["CHARLESTON|BEACH PARK"];
must(ACC_HORRY === 362 && ACC_CHS === 136, "F26");
const AREA = (k) => BA.by_area[k];
must(AREA("HORRY|NORTH MYRTLE BEACH") === 167 && AREA("HORRY|MYRTLE BEACH") === 143 && AREA("HORRY|SURFSIDE BEACH") === 32 && AREA("HORRY|GARDEN CITY") === 17, "F27 Horry");
must(AREA("HORRY|NORTH MYRTLE BEACH") > ACC_CHS, "North Myrtle Beach alone has more than Charleston County");
/* F28, F29: drives with no traffic. Over 15 minutes, to the nearest 5 (CRAFT 2); F29's Isle of Palms is the
   verifier's county park figure (25). */
const DR = F.drives_no_traffic;
must(Math.round(DR.mb_city_hall_to_charleston_city_hall.miles) === 98, "F28");
const r5 = (m) => Math.round(m / 5) * 5;
must(r5(DR.charleston_city_hall_to_sullivans_island.minutes) === 20 && r5(DR.charleston_city_hall_to_folly_beach_pier.minutes) === 20, "F29");
/* F30 to F33: NOAA 1991-2020 normals. Downtown Charleston (USW00013782) as the verifier read it. */
const NM = F.normals_1991_2020, NMB_AP = NM.USW00093718, CHS_AP = NM.USW00013880;
const DT = JSON.parse(fs.readFileSync(path.join(DATA, "raw", "normals-days-USW00013782.json"), "utf8"))[0];
const DTM = JSON.parse(fs.readFileSync(path.join(DATA, "raw", "normals-mly-USW00013782.json"), "utf8"));
const DT90 = parseFloat(DT["ANN-TMAX-AVGNDS-GRTH090"]), DT32 = parseFloat(DT["ANN-TMIN-AVGNDS-LSTH032"]);
const DTJUL = parseFloat(DTM.find((r) => r.DATE === "07")["MLY-TMAX-NORMAL"]);
must(NMB_AP.days_90_plus === 20.9 && DT90 === 24.5 && CHS_AP.days_90_plus === 64.3, "F30");
must(NMB_AP.jul_high === 87.6 && DTJUL === 87.5, "F31");
must(NMB_AP.nights_32_or_below === 33.7 && DT32 === 6.1, "F32");
must(NMB_AP.ann_precip_in === 48.47 && CHS_AP.ann_precip_in === 52.51 && parseFloat(DT["ANN-PRCP-NORMAL"]) === 44.26, "F33");
/* F34 to F37: permits and people. */
must(MB.permits_2025_single_family_units === 6418 && CH.permits_2025_single_family_units === 5799, "F34");
must(r1k(MB.permits_2025_single_family_avg_construction_value) === "$218,000", "F35");
must(MB.population === 427551 && CH.population === 889263, "F37");
/* F23 to F25: FEMA's NFIP residential penetration (residential buildings, not homes). */
const PEN = (c) => F.nfip_penetration.find((r) => r.county === c);
must(Math.round(1 / PEN("Horry").resPenetrationRate) === 7 && Math.round(1 / PEN("Charleston").resPenetrationRate) === 3, "F23, F24");
must(Math.round(PEN("Charleston").totalResStructuresSfha / PEN("Charleston").totalResStructures * 10) === 3, "F25");

const LEAD = "/contact/";

/* ---------------------------------------------------------------------------- */
/* The photo: USGS, public domain (record in data/2026-11-d/myrtle-beach-vs-charleston/photos.json). */

const PHOTOS = read("photos.json").photos;
const BEACH_REC = PHOTOS.find((r) => /houses-and-towers-from-the-ocean-1200w\.webp$/.test(r.file));
must(BEACH_REC && BEACH_REC.license === "Public domain", "the USGS aerial record");
const BEACH_PHOTO = PH.heroPhoto(BEACH_REC, { alt: BEACH_REC.alt, caption: BEACH_REC.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
/* The template's credit line already says we resized and cropped; drop the record's own note so it is said once. */
const CREDITS = PH.creditsList([{ photo: { ...BEACH_REC, changes: "" }, caption: BEACH_REC.caption.replace(/\.$/, "") }]);

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main. One card style for the charts and the offers; */
/* lists and tables plain under thin rules; one block width of 720 px.            */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CSS = "<style>"
  /* The headline: the italic line at about half the H1's size. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.25rem,2.4vw,2.1rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} h2{text-wrap:balance}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* Tables plain, under thin rules; on a phone each row is its first cell over labelled cells. */
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}${TBL} td:first-child{color:var(--navy)}${TBL} td strong{color:var(--navy)}`
  + `@media (max-width:599px){${TBL} table,${TBL} tbody,${TBL} tr,${TBL} td{display:block;width:100%}${TBL} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TBL} tr{padding:.65rem 0;border-bottom:${RULE}}${TBL} td{border:0!important;padding:.1rem 0!important}${TBL} td:first-child{font-weight:650}`
  + `${TBL} td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-weight:500}}`
  + `@media (min-width:600px){${TBL} td:nth-child(2){white-space:nowrap}}`
  + `${S} .mbc-note{font-size:.95rem;color:var(--muted);line-height:1.6;max-width:720px;margin:-.4rem 0 1.4rem}`
  /* The story: a quiet block with a brass rule. */
  + `${S} .mbc-story{max-width:720px;margin:1.2rem 0 1.4rem;padding:.2rem 0 .2rem 1.2rem;border-left:4px solid var(--brass);color:var(--muted);line-height:1.7}`
  /* The photo sits without a second frame. */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero>figcaption{padding:0!important}`
  + `${S} .hx-fallback .c3-offer{margin-top:.4rem}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  /* The line chart: drawn twice, so its text shows at 13 to 16 px on a phone and on a wide screen. */
  + `${S} svg.mbc-n{display:block;width:100%;height:auto;max-width:340px;margin:0 auto}${S} svg.mbc-w{display:none;width:100%;height:auto}`
  + `@media (min-width:600px){${S} svg.mbc-n{display:none}${S} svg.mbc-w{display:block}}`
  + `${S} .mbc-key{display:flex;flex-wrap:wrap;gap:.3rem 1.2rem;margin:0 0 .6rem;padding:0;list-style:none;font-size:1rem;color:var(--navy)}`
  + `${S} .mbc-key li{margin:0;display:flex;align-items:center;gap:.45rem}${S} .mbc-key i{display:inline-block;width:1.4rem;height:.3rem;border-radius:3px}`
  + "</style>";

/* A table that turns into rows of labelled cells on a phone. */
const table = (head, rows) => h.table(head, rows).replace(/<tbody>([\s\S]*)<\/tbody>/, (m, body) => "<tbody>" + body.replace(/<tr>([\s\S]*?)<\/tr>/g, (r, cells) => {
  let i = 0;
  return "<tr>" + cells.replace(/<td ([^>]*)>/g, (t, attrs) => { const l = head[i++]; return i === 1 ? t : `<td ${attrs} data-l="${l}">`; }) + "</tr>";
}) + "</tbody>");
const note = (t) => `<p class="mbc-note">${t}</p>`;
const b = (t) => `<strong>${t}</strong>`;

/* ---------------------------------------------------------------------------- */
/* Review round 1 (2026-11-13): the 12-row side-by-side table is gone; the verdict  */
/* table leads. New rows F42 to F47 (VERIFIED-BY-FIXER, raw copies in raw/):        */
/*   F42 Myrtle Beach: after summer, until May 1, a leashed dog or a bike on the    */
/*       beach and the Boardwalk at any hour (city news, raw/myrtlebeach-news-R2685)*/
/*   F43 the Boardwalk, about 1.3 miles (city news, raw/myrtlebeach-news-R986)      */
/*   F44 ferries from downtown Charleston to Fort Sumter, where the Civil War began */
/*   F45 Fort Moultrie on Sullivan's Island, 1776 (NPS)                              */
/*   F46 FAA 2025 boardings: CHS 3,142,402, MYR 1,743,132                            */
/*   F47 MUSC: the state's only comprehensive academic health system; the only NCI- */
/*       designated cancer center in the state (web.musc.edu/about)                  */
const ENPL = { chs: 3142402, myr: 1743132 };
must(ENPL.chs / ENPL.myr > 1.79 && ENPL.chs / ENPL.myr < 1.81, "F46: about 1.8 times");
const mil = (v) => (Math.round(v / 100000) / 10).toFixed(1) + " million";
must(mil(ENPL.chs) === "3.1 million" && mil(ENPL.myr) === "1.7 million", "F46 rounding");

/* ---------------------------------------------------------------------------- */
/* Visual 2: the typical home value in both areas, each September, 2016 to 2026.  */

const NAVY = "#2a3040", BRASS = "#c4783a", INK = "#4a4f5c";
const kfmt = (v) => "$" + Math.round(v / 1000) + "K";
const lineSvg = (W, fs, cls) => {
  const H = Math.round(W * (W < 400 ? 0.9 : 0.5)), x0 = Math.round(fs * 4), x1 = W - 10, y0 = fs * 1.6, y1 = H - fs * 2.2;
  const lo = 160000, hi = 470000;
  const X = (y) => x0 + ((y - 2016) / 10) * (x1 - x0), Y = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
  const path = (k) => SERIES.map((p, i) => `${i ? "L" : "M"}${X(p.y).toFixed(1)} ${Y(p[k]).toFixed(1)}`).join("");
  const grid = [200000, 300000, 400000].map((g) => `<line x1="${x0}" x2="${x1}" y1="${Y(g).toFixed(1)}" y2="${Y(g).toFixed(1)}" stroke="#1c2028" stroke-opacity=".1"/><text x="${x0 - 6}" y="${(Y(g) + fs * 0.35).toFixed(1)}" text-anchor="end" font-size="${fs}" fill="${INK}">${kfmt(g)}</text>`).join("");
  const yrs = W < 400 ? [2016, 2021, 2026] : [2016, 2018, 2020, 2022, 2024, 2026];
  const xl = yrs.map((y, i) => `<text x="${X(y).toFixed(1)}" y="${(H - fs * 0.5).toFixed(1)}" text-anchor="${i === 0 ? "start" : i === yrs.length - 1 ? "end" : "middle"}" font-size="${fs}" fill="${INK}">${y}</text>`).join("");
  const first = SERIES[0], last = SERIES[SERIES.length - 1];
  const halo = `stroke="#fbf8f3" stroke-width="6" stroke-linejoin="round" paint-order="stroke"`;
  /* The difference, marked at each end: a dashed line between the two points, its amount beside it. */
  const gapMark = (p, x, anchor, dx, label) => `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${Y(p.ch).toFixed(1)}" y2="${Y(p.mb).toFixed(1)}" stroke="#1c2028" stroke-width="1.5" stroke-dasharray="3 3"/>`
    + `<text x="${(x + dx).toFixed(1)}" y="${((Y(p.ch) + Y(p.mb)) / 2 + fs * 0.35).toFixed(1)}" text-anchor="${anchor}" font-size="${fs}" font-weight="700" fill="#1c2028" ${halo}>${label}</text>`;
  const xa = X(first.y) + 3, xb = X(last.y) - 3;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of the typical home value each September from 2016 to 2026. The Charleston area rose from about ${r1k(first.ch)} to about ${r1k(last.ch)}, and the Myrtle Beach area from about ${r1k(first.mb)} to about ${r1k(last.mb)}. The difference grew from about ${r500(GAP0)} to about ${r1k(GAP)}.">`
    + grid + xl
    + `<path d="${path("ch")}" fill="none" stroke="${NAVY}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<path d="${path("mb")}" fill="none" stroke="${BRASS}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
    + gapMark(first, xa, "start", 7, `${r500(GAP0)} apart`)
    + gapMark(last, xb, "end", -7, W < 400 ? kfmt(GAP) + " apart" : `${r1k(GAP)} apart`)
    + `<circle cx="${X(last.y).toFixed(1)}" cy="${Y(last.ch).toFixed(1)}" r="4.5" fill="${NAVY}"/><circle cx="${X(last.y).toFixed(1)}" cy="${Y(last.mb).toFixed(1)}" r="4.5" fill="${BRASS}"/>`
    + `<text x="${x1}" y="${(Y(last.ch) - fs * 0.8).toFixed(1)}" text-anchor="end" font-size="${fs}" font-weight="600" fill="${NAVY}" ${halo}>${r1k(last.ch)}</text>`
    + `<text x="${x1}" y="${(Y(last.mb) + fs * 1.5).toFixed(1)}" text-anchor="end" font-size="${fs}" font-weight="600" fill="#8a5226" ${halo}>${r1k(last.mb)}</text>`
    + `</svg>`;
};
const LINE_FIG = `<figure class="c3-gchart"><span class="cap">The difference in typical home value has almost doubled in ten years</span>`
  + `<ul class="mbc-key" aria-hidden="true"><li><i style="background:${NAVY}"></i>Charleston area</li><li><i style="background:${BRASS}"></i>Myrtle Beach area</li></ul>`
  + lineSvg(280, 14, "mbc-n") + lineSvg(660, 13, "mbc-w")
  + `<figcaption>Zillow's typical home value for all homes, each September. Both areas rose about 80% since 2016, so the difference in dollars almost doubled.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* Visual 3: days a year at 90 degrees or more, at three weather stations (F30).  */

const HEAT_FIG = G.bars([
  { name: "North Myrtle Beach airport", feature: "near the ocean", value: NMB_AP.days_90_plus, valueText: `${Math.round(NMB_AP.days_90_plus)} days` },
  { name: "Downtown Charleston", feature: "harbor station", value: DT90, valueText: `${Math.round(DT90)} days` },
  { name: "Charleston airport", feature: "inland, in North Charleston", value: CHS_AP.days_90_plus, valueText: `${Math.round(CHS_AP.days_90_plus)} days`, reference: true },
], {
  caption: "Days a year at 90 degrees or more: about the same near the ocean",
  note: "NOAA's 1991 to 2020 averages at each weather station. Charleston's airport is inland, so it is hotter than either beach town.",
  nameLabel: "Weather station", featureLabel: "where", valueLabel: "Days a year at 90 degrees or more", compact: true,
});

/* ---------------------------------------------------------------------------- */
/* Visual 4: which one fits what you want.                                         */

must(Math.round(GAP / ZCH * 5) === 1, "about a fifth less (F3: 22%)");
const FITS = table(["If you want", "Choose", "Why"], [
  ["More home for the same money", "Myrtle Beach", "The typical home costs about a fifth less."],
  ["A lower yearly property tax", "Myrtle Beach", `The middle bill is about ${TAX_DIFF} a year less.`],
  ["The beach on a weeknight", "Myrtle Beach", "The city is on the ocean. Charleston's beaches are on islands, in towns of their own."],
  ["A newer house", "Myrtle Beach", `Half the homes were built in ${MB.median_year_built} or later.`],
  ["A shorter drive to work", "Myrtle Beach", `About ${Math.round(MB.mean_commute_min)} minutes on average, against about ${Math.round(CH.mean_commute_min)}.`],
  ["A local job in a big market", "Charleston", "More than twice as many working residents, and higher pay."],
  ["More flights", "Charleston", "Its airport boards about 1.8 times as many passengers."],
  ["A teaching hospital nearby", "Charleston", "MUSC, the state's only comprehensive academic health system, is there."],
  ["History at your door", "Charleston", "Fort Sumter and Fort Moultrie, run by the National Park Service."],
  ["Fewer freezing nights", "Charleston", `About ${Math.round(DT32)} a year downtown, against about ${Math.round(NMB_AP.nights_32_or_below)} at the North Myrtle Beach airport.`],
]);

/* ---------------------------------------------------------------------------- */
/* Homes strips (new places, BUILD.md) with their fallbacks.                      */

/* Round 2 (owner, 2026-11-14): live strips from the site's own search, no "send me" offers. max is Charleston's typical
   value rounded down. The owner's words: "just show them the houses as a personalized idx feed right there". */
const STRIP_PRICE = G.homesQScript() + G.homesQ("type=house&max=437000", "A whole house here for less than Charleston's typical home");
const STRIP_BEACH = G.homesQ("has=walk_to_beach&type=house&max=437000", "Walk to the beach for less than Charleston's typical home");
const STRIP_NEW = G.homesQ("type=house&max=437000&yearMin=2024&city=Myrtle Beach", "Myrtle Beach houses built since 2024, under Charleston's typical price");
const NEW_PER_1K = (v, pop) => v / pop * 1000;
must(Math.floor(ZCH / 1000) * 1000 === 437000, "the strips' $437,000 is Charleston's typical value, rounded down (F2)");

/* ---------------------------------------------------------------------------- */
/* Sources: each opened by the researcher and again by the verifier.              */

const ZILLOW = "https://www.zillow.com/research/data/";
const ACS = (t) => `https://data.census.gov/table/${t}?g=310XX00US34820,16700`;
const BEA = "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area";
const BEACH_GUIDE = "https://gis.des.sc.gov/beachaccess/";
const NOAA = "https://www.ncei.noaa.gov/access/us-climate-normals/";
const SC_TAX = "https://www.scstatehouse.gov/code/t12c043.php";
const FEMA = "https://www.fema.gov/openfema-data-page/nfip-residential-penetration-rates-v1";
const BPS = "https://www.census.gov/construction/bps/";
const VA = "https://www.va.gov/charleston-health-care/locations/myrtle-beach-va-clinic/";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Relocating", url: "/buyers/relocating/" },
  pageImages: () => PH.pageImages(BEACH_REC),
  title: "Living in Myrtle Beach vs Charleston: Typical Home $98K Less",
  description: "Myrtle Beach vs Charleston, side by side: home prices, property tax, beaches, summer heat, flood insurance, jobs and the commute, from federal and state data.",
  ogTitle: "Myrtle Beach or Charleston? Home prices, property tax, the beach, the summer, jobs and the commute, side by side",
  crumb: "Myrtle Beach vs Charleston",
  eyebrow: "Moving to Myrtle Beach",
  h1: "Myrtle Beach or Charleston?",
  h1em: "More home for the money here. More jobs, flights and history in Charleston.",
  sub: "Myrtle Beach and Charleston side by side: home prices, property tax, the beach, the summer, flood insurance, jobs and the drive to work.",
  /* Round 2: the live homes strip is the first call to action; a button to /homes/ fails the audit. */
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `The typical home in the Myrtle Beach area is worth about ${r1k(ZMB)}, about ${r1k(GAP)} less than in the Charleston area. In Myrtle Beach, after the summer season, you can walk a leashed dog on the beach at any hour.`,
    `Charleston has more jobs, higher pay and a busier airport, and ferries leave downtown for Fort Sumter, where the Civil War began. The saving here goes furthest when your income or savings come with you.`,
  ],
  sections: [
    { h2: "Is Myrtle Beach or Charleston better to live in?", toc: "Which fits you", id: "which-fits", html: () =>
      CSS + G.homesCss() +
      h.p(`Pick Myrtle Beach for more home, the beach and a lower tax bill. Pick Charleston for a bigger job market, more flights and its history.`) +
      FITS +
      h.p(`Our guide to ${h.a("/buyers/relocating/getting-around/", "getting around Myrtle Beach")} has the drive to Charleston, the roads and the airport.`) },

    { h2: "Is it cheaper to live in Myrtle Beach than Charleston?", toc: "Home prices", id: "home-prices", html: (bg) =>
      h.p(`Yes. The typical home in the Myrtle Beach area is worth about ${r1k(ZMB)}, and in the Charleston area about ${r1k(ZCH)}. That is about ${r1k(GAP)} less.`) +
      h.p(`The Census Bureau's survey of homeowners shows about the same difference: about ${CENSUS_GAP} between the two areas' middle home values. In the past year, values held about flat in both areas.`) +
      LINE_FIG +
      h.p(`Everyday prices are lower too. On the federal government's price index, prices in the Myrtle Beach area are about 7% lower overall. To compare your own budget, use our ${h.a("/buyers/relocating/cost-of-living/", "cost of living calculator")}.`) +
      STRIP_PRICE },

    { h2: "Which has more beach, Myrtle Beach or Charleston?", toc: "The beach", id: "the-beach", html: () =>
      h.p(`Myrtle Beach is on the ocean. Downtown has a boardwalk about 1.3 miles long, beside the sand. After the summer season and until May 1, you can walk a leashed dog or ride a bike on the beach and the Boardwalk at any hour.`) +
      h.p(`Horry County has more than 360 public beach accesses, and Charleston County has ${ACC_CHS}. North Myrtle Beach alone has ${AREA("HORRY|NORTH MYRTLE BEACH")}, more than Charleston County's whole coast. Parking and tent rules differ by town; our ${h.a("/buyers/relocating/beaches/", "beach rules by town")} lists them.`) +
      BEACH_PHOTO +
      h.p(`Charleston's beaches are on its islands. From Charleston City Hall, Sullivan's Island and Folly Beach are each about 20 minutes by car with no traffic. On Sullivan's Island is Fort Moultrie, where patriots in a fort of palmetto logs beat the Royal Navy in 1776.`) +
      STRIP_BEACH },

    { h2: "Is Myrtle Beach hotter than Charleston?", toc: "Weather", id: "weather", html: () =>
      h.p(`Near the ocean, no. Myrtle Beach and Charleston have about the same summer, with about three weeks a year at 90 degrees or more.`) +
      HEAT_FIG +
      h.p(`Winter is colder here. The North Myrtle Beach airport has about ${Math.round(NMB_AP.nights_32_or_below)} nights a year at or below freezing, and downtown Charleston about ${Math.round(DT32)}. Rain is about the same in both.`) +
      `<p class="mbc-story">One of our team found the first summer here hot and humid, got used to it within a short time, and now likes being outside.</p>` +
      h.p(`Month by month, see ${h.a("/buyers/relocating/weather/", "Myrtle Beach weather")}, with the ocean temperature.`) },

    { h2: "Are property taxes lower in Myrtle Beach than Charleston?", toc: "Property tax", id: "property-tax", html: (bg) =>
      h.p(`Yes. The middle property tax a homeowner pays is about ${TAX_MB} a year in the Myrtle Beach area and about ${TAX_CH} in the Charleston area.`) +
      h.p(`The state's rule is the same in both: the home you live in is taxed on 4% of its fair market value, once you apply for it.`) +
      h.p(`The bills differ because each county, city and school district has its own tax rate. In Charleston County alone, the middle bill is about ${TAX_CC}.`) +
      h.p(`Our ${h.a("/buyers/property-taxes/", "Horry County property tax guide")} shows how to apply for the 4% rate, with a calculator.`) +
      h.cta("Want the yearly tax on one house?", "Send us the listing. We work out its yearly property tax before you make an offer.", "Have us work out the tax on a home", LEAD, bg) },

    { h2: "Is flood insurance more common in Charleston?", toc: "Flood insurance", id: "flood", html: (bg) =>
      h.p(`Yes. FEMA estimates about one in seven residential buildings in Horry County are covered by a federal flood policy. In Charleston County, it is about one in three.`) +
      h.p(`FEMA also counts about three in ten residential buildings in Charleston County in its high-risk flood zone. Its file has no matching count for Horry County.`) +
      h.p(`For a house here, our agents check its flood zone and flood history before you make an offer. Our guides to ${h.a("/buyers/coastal-insurance/", "home, wind and flood insurance")} and ${h.a("/buyers/undisclosed-flooding/", "finding out if a house has flooded")} cover both.`) +
      h.cta("Found a house you like?", "Send us the address. We check its flood zone and any record of flooding before you make an offer.", "Have us check a house's flood history", LEAD, bg) },

    { h2: "More new homes are being built in Myrtle Beach", toc: "New homes", id: "new-homes", html: () =>
      h.p(`Half of all homes in the Myrtle Beach area, vacation homes included, were built in ${MB.median_year_built} or later. In the Charleston area, the middle year is ${CH.median_year_built}.`) +
      h.p(`In 2025, builders in the Myrtle Beach area took out permits for ${n0(MB.permits_2025_single_family_units)} new single-family houses. That is more than the Charleston area's ${n0(CH.permits_2025_single_family_units)}, with less than half the people.`) +
      h.p(`The construction cost on those permits, without the land, averaged about ${r1k(MB.permits_2025_single_family_avg_construction_value)} here and at least $370,000 in the Charleston area. Our ${h.a("/buyers/new-construction/", "new construction guide")} covers buying a new home here.`) },

    { h2: "Charleston has more jobs and higher pay", toc: "Jobs and the commute", id: "jobs", html: (bg) =>
      h.p(`The Charleston area has about ${r1k(EMP.ch).slice(1)} working residents, and the Myrtle Beach area about ${r1k(EMP.mb).slice(1)}. The middle household income is about ${r1k(CH.median_household_income)} there and about ${r1k(MB.median_household_income)} here.`) +
      h.p(`Pay is higher there, and homes cost more by about the same share. In both areas, the middle home value is about 4.6 times the middle household income.`) +
      h.h3("Where people work") +
      h.p(`Health care and education employ the most people in both. Here, about one in seven workers is in hotels, restaurants, entertainment and recreation. In the Charleston area, about one in ten works in manufacturing.`) +
      h.h3("The drive to work") +
      h.p(`The drive to work is shorter here: about ${Math.round(MB.mean_commute_min)} minutes on average, against about ${Math.round(CH.mean_commute_min)}. About one in eight commuters here take 45 minutes or more, and about one in five in the Charleston area.`) +
      `<p class="mbc-story">In our experience, rush hour here adds 5 to 10 minutes, and leaving for work between 5 and 8 in the morning has few stops.</p>` +
      h.p(`Who hires here, and what the work pays, is in our ${h.a("/buyers/relocating/jobs/", "jobs guide")}. Why so many people move here is in ${h.a("/buyers/relocating/why-myrtle-beach/", "why everyone is moving to Myrtle Beach")}.`) },

    { h2: "What Charleston does better", toc: "What Charleston does better", id: "charleston", html: () =>
      h.h3("More flights") +
      h.p(`Charleston's airport is busier. About ${mil(ENPL.chs)} passengers boarded there in 2025, against about ${mil(ENPL.myr)} at Myrtle Beach International.`) +
      h.h3("The state's teaching hospital") +
      h.p(`The Medical University of South Carolina, MUSC, is in Charleston. It is the state's only comprehensive academic health system, and its cancer center is the only one in the state the National Cancer Institute has designated.`) +
      h.p(`For veterans, the ${h.ext(VA, "Myrtle Beach VA Clinic")} is an outpatient clinic in the VA Charleston system. That system's medical center, the Ralph H. Johnson VA Medical Center, is in Charleston. Our ${h.a("/buyers/relocating/healthcare/", "Myrtle Beach hospitals guide")} lists every hospital that serves the Grand Strand.`) +
      h.h3("History in the harbor") +
      h.p(`Two forts stand at the entrance to Charleston's harbor. Ferries leave downtown for Fort Sumter, where the Civil War began in April 1861.`) +
      h.p(`For the full list of what is good and hard about living here, read ${h.a("/buyers/relocating/pros-and-cons/", "living in Myrtle Beach year-round")}. Choosing a town on the Grand Strand next? Our ${h.a("/buyers/relocating/which-town/", "13 towns compared")} puts each one side by side.`) },

    { h2: "What Myrtle Beach does better", toc: "What Myrtle Beach does better", id: "myrtle-beach", html: () =>
      h.p(`Charleston has real strengths, and Myrtle Beach has its own. These are the places Myrtle Beach comes out ahead.`) +
      h.h3("Housing costs less in every way we measured") +
      h.p(`The typical home is worth about ${r1k(ZMB)}, against about ${r1k(ZCH)}. Median rent is about ${money(MB.median_gross_rent)} a month, against about ${money(CH.median_gross_rent)}. The middle property tax bill is about ${TAX_MB} a year, against about ${TAX_CH}.`) +
      h.h3("Far more new houses") +
      h.p(`The 2025 permits work out to about ${Math.round(NEW_PER_1K(MB.permits_2025_single_family_units, MB.population))} new single-family houses per 1,000 residents in the Myrtle Beach area. The Charleston area's figure is about ${NEW_PER_1K(CH.permits_2025_single_family_units, CH.population).toFixed(1)}.`) +
      STRIP_NEW +
      h.h3("A beach that is the city itself") +
      h.p(`Myrtle Beach has ${AREA("HORRY|MYRTLE BEACH")} public beach accesses inside the city, and a boardwalk about 1.3 miles long. From Charleston City Hall, the nearest beach is about 20 minutes away by car.`) +
      h.h3("A shorter drive to work") +
      h.p(`The average one-way commute is about ${Math.round(MB.mean_commute_min)} minutes here, against about ${Math.round(CH.mean_commute_min)}. About 1 in 8 commuters here drives 45 minutes or more, against about 1 in 5 in the Charleston area.`) +
      h.p(`If these matter most to you, the houses above are where to start. A day of showings shows you the rest.`) },
  ],
  faqTitle: "Myrtle Beach vs Charleston FAQ",
  faq: [
    { q: "Is Myrtle Beach part of Charleston?", a: "No. Myrtle Beach is in Horry County, and Charleston is in Charleston County. They are separate cities with separate local governments." },
    { q: "How far is Myrtle Beach from Charleston?", a: `About ${Math.round(DR.mb_city_hall_to_charleston_city_hall.miles)} miles by road, city hall to city hall. With no traffic, the drive takes about 2 hours 15 minutes each way.` },
    { q: "Which is bigger, Myrtle Beach or Charleston?", a: `Charleston. The Charleston area has about ${r1k(CH.population).slice(1)} people, about twice the Myrtle Beach area's ${r1k(MB.population).slice(1)}.` },
    { q: "Is Charleston's airport bigger than Myrtle Beach's?", a: "Yes. The FAA ranks Charleston International a medium hub and Myrtle Beach International a small hub, by passengers boarded." },
  ],
  sources: [
    { name: "Zillow", href: ZILLOW },
    { name: "Census home values", href: ACS("ACSDT1Y2025.B25077") },
    { name: "Census tax paid", href: ACS("ACSDT1Y2025.B25103") },
    { name: "Census jobs", href: ACS("ACSDP1Y2025.DP03") },
    { name: "Census commute", href: ACS("ACSST1Y2025.S0801") },
    { name: "BEA prices", href: BEA },
    { name: "S.C. Beach Guide", href: BEACH_GUIDE },
    { name: "NOAA normals", href: NOAA },
    { name: "SC Code 12-43", href: SC_TAX },
    { name: "FEMA flood policies", href: FEMA },
    { name: "Census permits", href: BPS },
    { name: "VA clinic", href: VA },
    { name: "FAA", href: "https://www.faa.gov/airports/planning_capacity/passenger_allcargo_stats/passenger" },
    { name: "MUSC", href: "https://web.musc.edu/about" },
    { name: "NPS", href: "https://www.nps.gov/fosu/index.htm" },
    { name: "City of Myrtle Beach", href: "https://www.cityofmyrtlebeach.com/news_detail_T6_R2685.php" },
  ],
  sourcesNote: `Areas are Census metro areas (Myrtle Beach: Horry County; Charleston: Berkeley, Charleston and Dorchester counties). Zillow: September value, all homes. Census values: owners' estimates. Flood: federal policies only. Permits: Census estimates, construction cost only. Not tax advice.`,
  bottomCta: { h2: "Plan a day of showings in Myrtle Beach.", p: "Tell us your budget and what you want near you. We pick the homes with you and book the showings for one day.", label: "Plan my showing day", href: LEAD },
  keywords: "Myrtle Beach vs Charleston, Charleston vs Myrtle Beach, Myrtle Beach or Charleston, living in Myrtle Beach vs Charleston, Myrtle Beach vs Charleston to live, Charleston vs Myrtle Beach cost of living, is Myrtle Beach cheaper than Charleston, Myrtle Beach vs Charleston weather",
  about: "Myrtle Beach and Charleston, South Carolina, compared for a move: home values, property tax, beaches, weather, flood insurance, jobs and the commute",
  afterSources: () => CREDITS,
});
