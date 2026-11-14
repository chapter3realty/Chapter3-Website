/* /buyers/senior-living/ - senior living around Myrtle Beach: what a month of each kind of care costs here,
 * the choices side by side (your own home with help, independent living, assisted living, memory care, nursing
 * homes, continuing care), the licensed assisted living homes by town, memory care and nursing homes, who pays,
 * continuing care contracts under South Carolina law, when buying a smaller home still makes sense, and selling
 * the house.
 *
 * Batch 2026-11-d, Lane N. A new page, version 1. Plan: Blog-Brain batches/2026-11-d/senior-living/PLAN.md.
 * Demand and search ownership: must-answer.md (the 55+ hub keeps "55+ communities" and "retirement communities").
 * Facts: facts.md, VERIFIED rows, and CORRECTED rows at the verifier's wording only (VERIFY.md; struck wording in
 * batches/2026-11-d/facts/buyers-senior-living-struck.json). Row numbers are given as F<n>.
 * Not used (VERIFY "Not to publish"): the beds-per-1,000 ratio (F30), the OSS payment figure (F25), "34" continuing
 * care communities (F19: build.py now reads from the row after the header, so ccrc.statewide is 33), "nearest ...
 * Little River" (F11), the DPH map's "Max # of Beds". Left out by choice: memory care counts by
 * town (not a verified row), the Pawleys Island nursing home (F14 covers Horry County only), CMS star ratings,
 * entrance fees for named campuses (no published survey), the Pennsylvania story (VERIFY 35).
 * Review round 1 (REVIEW-1.md): each town now lists its licensed assisted living homes by name, A to Z, with Total
 * Licensed Beds (F36, VERIFIED-BY-FIXER against a fresh pull of the DPH layer), no rating and no judgment. Each town
 * names its nearest main hospital (F37, our measurement, carried). HUD's apartments are explained in plain words (F38).
 * Data: data/2026-11-d/senior-living/senior-living.json, from build.py over raw/. Every cost, count and bed total
 * below is read from that file and checked against its ledger row. No listing, address, MLS number or listing
 * photo is on the page. No photo: a photo of a named care home would read as an endorsement (PLAN).
 * Homes: the site's edge puts this page's feed under the opening (lead item in BUILD.md). Two strips here,
 * senior-one-level-near-beach and senior-elevator-condos (new places, lead item in BUILD.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/senior-living/";
const SLUG = "senior-living";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", SLUG);
const D = JSON.parse(fs.readFileSync(path.join(DATA, "senior-living.json"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r100 = (v) => money(Math.round(v / 100) * 100);

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const C = D.costs, M = C.monthly, YEAR = C.year;
const mb = (k) => M[k].myrtle_beach_area;
/* F1: assisted living, the Myrtle Beach area, median. */
must(YEAR === 2025 && mb("assisted_living") === 5850 && C.annual_myrtle_beach_area.assisted_living === 70200, "F1: $5,850 a month, $70,200 a year");
/* F2: South Carolina and the U.S. */
must(M.assisted_living.sc === 5350 && M.assisted_living.us === 6200, "F2: SC $5,350, US $6,200");
/* F3: nursing home, shared and private room. */
must(mb("nursing_home_semi_private") === 8897 && mb("nursing_home_private") === 9885, "F3: $8,897 and $9,885");
const NH_SHARED = r100(mb("nursing_home_semi_private")), NH_PRIVATE = r100(mb("nursing_home_private"));
must(NH_SHARED === "$8,900" && NH_PRIVATE === "$9,900", "F3: rounding");
/* F4 (CORRECTED: a non-medical caregiver; the monthly figure assumes 44 hours a week). */
const HOURLY = C.home_care_hourly;
must(HOURLY === 31 && mb("home_care_services") === 5911 && C.annual_myrtle_beach_area.home_care_services === HOURLY * 44 * 52, "F4: $31 an hour, 44 hours a week");
/* F5: adult day care, $72 a day; the monthly figure is five days a week. */
must(mb("adult_day_care") === 1560 && C.annual_myrtle_beach_area.adult_day_care === 72 * 5 * 52, "F5: adult day care");
/* F6: third of the SC areas the survey prices. */
const AREAS = D.al_by_sc_area;
must(AREAS.length === 8 && AREAS[0].area === "Columbia" && /^Hilton Head/.test(AREAS[1].area) && /^Myrtle Beach/.test(AREAS[2].area), "F6: third highest");
/* F9: Horry County. */
const TH = D.totals.horry;
must(TH.al === 20 && TH.al_beds === 1619 && TH.nh === 8 && TH.nh_beds === 824 && TH.adc === 3, "F9, F14: Horry County totals");
/* F10 (CORRECTED: not "Grand Strand towns"): by mailing address. Murrells Inlet joins its two county sides. */
const BT = D.by_town;
const town = (county, city) => BT.find((t) => t.county === county && t.city === city) || {};
const MI_H = town("Horry", "Murrells Inlet"), MI_G = town("Georgetown", "Murrells Inlet");
/* F37: the nearest of five main hospitals, median drive from 60 houses in each place, no traffic (our measurement;
 * healthcare row 8, which-town rows 17 and F1). Read from the shared data file, never typed. */
const DRIVES = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-a", "buyers-relocating-which-town", "drives-houses.json"), "utf8")).areas;
const hosp = (slug) => {
  const a = DRIVES[slug], counts = a.nearest_hospital_counts, top = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0];
  return { name: top, min: Math.round(a.hospital.median), most: counts[top] < 60 };
};
const TOWNS = [
  { name: "Myrtle Beach", places: [["Horry", "Myrtle Beach"]], al: town("Horry", "Myrtle Beach").al, beds: town("Horry", "Myrtle Beach").al_beds, hosp: hosp("myrtle-beach"),
    where: "Myrtle Beach addresses take in Carolina Forest, Grande Dunes and Socastee. Brightwater, a continuing care campus, is here." },
  { name: "Murrells Inlet", places: [["Horry", "Murrells Inlet"], ["Georgetown", "Murrells Inlet"]], al: MI_H.al + MI_G.al, beds: MI_H.al_beds + MI_G.al_beds, hosp: hosp("murrells-inlet"),
    where: "Murrells Inlet addresses take in Garden City. Inlet Coastal Resort is on the Georgetown County side." },
  { name: "Conway", places: [["Horry", "Conway"]], al: town("Horry", "Conway").al, beds: town("Horry", "Conway").al_beds, hosp: hosp("conway"),
    where: `Inland, about ${Math.round(DRIVES.conway.beach.median)} minutes by car from the beach.` },
  { name: "Little River", places: [["Horry", "Little River"]], al: town("Horry", "Little River").al, beds: town("Horry", "Little River").al_beds, hosp: hosp("little-river"),
    where: "Just north of North Myrtle Beach." },
  { name: "Pawleys Island", places: [["Georgetown", "Pawleys Island"]], al: town("Georgetown", "Pawleys Island").al, beds: town("Georgetown", "Pawleys Island").al_beds, hosp: hosp("pawleys-litchfield"),
    where: "In Georgetown County. The Lakes at Litchfield, a continuing care campus, is here." },
];
must(TOWNS.map((t) => `${t.hosp.name}:${t.hosp.min}:${t.hosp.most}`).join() === "Grand Strand Medical Center:12:true,Tidelands Waccamaw Community Hospital:6:false,Conway Medical Center:13:false,McLeod Health Seacoast:7:false,Tidelands Waccamaw Community Hospital:19:false", "F37: hospitals and minutes");
must(Math.round(DRIVES.conway.beach.median) === 29, "which-town row 17: about 29 minutes from Conway to the beach");
must(TOWNS.map((t) => `${t.al}/${t.beds}`).join() === "8/718,5/455,5/248,3/260,2/179", "F10: homes and beds by town");
const ALL_AL = TOWNS.reduce((s, t) => s + t.al, 0), ALL_BEDS = TOWNS.reduce((s, t) => s + t.beds, 0);
must(ALL_AL === 23 && ALL_BEDS === 1860 && D.totals.grand_strand_towns.al === 23 && D.totals.grand_strand_towns.al_beds === 1860, "F10: 23 homes, 1,860 beds");
/* F11 (CORRECTED): no assisted living home has a North Myrtle Beach address; one in Little River carries its name. */
const AL = D.facilities.filter((f) => f.type.startsWith("assisted"));
must(!AL.some((f) => f.city === "North Myrtle Beach") && AL.some((f) => f.name === "LEGACY OF NORTH MYRTLE BEACH" && f.city === "Little River"), "F11");
/* F36 (VERIFIED-BY-FIXER, 2026-11-13): the licensed homes by name and Total Licensed Beds, A to Z within each town.
 * Re-pulled from the DPH layer the same day: the same 28 records in the two counties, names and beds unchanged,
 * every license current to 2027. Names are the state's, in title case. */
const SMALL = new Set(["at", "of", "and", "the"]);
const title = (s) => s.toLowerCase().split(" ").map((w, i) => (i > 0 && SMALL.has(w)) ? w : w.replace(/^[a-z]/, (c) => c.toUpperCase())).join(" ");
for (const t of TOWNS) {
  t.homes = AL.filter((f) => t.places.some(([c, city]) => f.county === c && f.city === city))
    .map((f) => ({ name: title(f.name), beds: f.licensed })).sort((a, b) => a.name.localeCompare(b.name));
  must(t.homes.length === t.al && t.homes.reduce((s, x) => s + x.beds, 0) === t.beds, `F36: ${t.name} names add up`);
}
must(TOWNS.flatMap((t) => t.homes).length === 23, "F36: 23 named homes");
/* F12: the state's map marks 14 of Horry's 20 for Alzheimer care and 13 with an Alzheimer unit. */
const ALH = AL.filter((f) => f.county === "Horry");
must(ALH.length === 20 && ALH.filter((f) => f.alzheimer_care === "Y").length === 14 && ALH.filter((f) => f.alzheimer_unit === "Y").length === 13, "F12");
/* F13: 8 to 142 beds; 13 of 20 between 80 and 122. */
const SIZES = ALH.map((f) => f.licensed).sort((a, b) => a - b);
must(SIZES[0] === 8 && SIZES[19] === 142 && SIZES.filter((v) => v >= 80 && v <= 122).length === 13, "F13: home sizes");
/* F14: nursing homes by town in Horry County, the hospice house. */
const NHH = D.facilities.filter((f) => f.type === "nursing home" && f.county === "Horry");
const nhIn = (c) => NHH.filter((f) => f.city === c).length;
must(nhIn("Conway") === 3 && nhIn("Myrtle Beach") === 3 && nhIn("Murrells Inlet") === 1 && nhIn("Loris") === 1, "F14: nursing homes by town");
must(D.facilities.some((f) => f.type === "hospice facility" && f.city === "Myrtle Beach" && f.licensed === 36), "F14: the 36-bed hospice house");
/* F14a: statewide, and Horry's rank by beds. */
const SW = D.statewide_crcf;
must(SW.count === 427 && SW.beds === 21152 && SW.rank_by_beds[2][0] === "Horry" && SW.rank_by_beds[0][0] === "Greenville" && SW.rank_by_beds[1][0] === "Charleston", "F14a");
/* F19 (CORRECTED): 33 licensees; Brightwater and The Lakes at Litchfield on the Grand Strand. */
must(D.ccrc.statewide === 33 && D.ccrc.grand_strand.length === 2, "F19: 33 continuing care communities, 2 here");
/* F27 (CORRECTED): HUD's elderly group in Horry County. */
const HUDH = D.hud_elderly.filter((x) => x.county === "Horry");
must(HUDH.length === 4 && HUDH.reduce((s, x) => s + x.units, 0) === 228 && HUDH.some((x) => x.units === 110 && /^Partially/.test(x.group)), "F27: Horry");
must(D.hud_elderly.some((x) => x.city === "Pawleys Island" && x.units === 48), "F27: Pawleys Island");
/* F31: carried from /buyers/retirees/ (rows 23 and 24 there): 1,286.60 + 89.40, about $1,380. */
const OWN_YEAR = Math.round((1286.60 + 89.40) / 10) * 10;
must(OWN_YEAR === 1380, "F31: about $1,380");

/* ---------------------------------------------------------------------------- */
/* The photo: the Surfside Beach Pier from the air, NOAA, public domain (record in   */
/* data/2026-11-a/submarkets-surfside-beach/photos.json, already on the site). The   */
/* pier is one of the town's five beach accesses with wheelchair access (F33).       */

const PIER_REC = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-a", "submarkets-surfside-beach", "photos.json"), "utf8"))
  .photos.find((r) => r.file.endsWith("/surfside-beach-pier-from-above-2026.webp"));
must(PIER_REC && PIER_REC.license === "Public domain", "the Surfside Beach Pier photo record");
const PIER_CAPTION = "The Surfside Beach Pier from the air. The pier is one of the town's five beach accesses with wheelchair access.";
const PIER_PHOTO = PH.heroPhoto(PIER_REC, { alt: PIER_REC.alt, caption: PIER_CAPTION, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
const CREDITS = PH.creditsList([{ photo: PIER_REC, caption: PIER_CAPTION.replace(/\.$/, "") }]);

/* ---------------------------------------------------------------------------- */
/* Links.                                                                         */

const LEAD = "/contact/";
const CARESCOUT = "https://www.carescout.com/cost-of-care";
const DPH_FIND = "https://dph.sc.gov/professionals/healthcare-quality/find-facility";
const DPH_CRC = "https://dph.sc.gov/professionals/healthcare-quality/licensed-facilities-professionals/community-residential-care";
const DPH_SHEET = "https://dph.sc.gov/sites/scdph/files/Library/00343-ENG-CR.pdf";
const REG_6084 = "https://dph.sc.gov/sites/scdph/files/Library/Regulations/R.60-84.pdf";
const SCDCA = "https://consumer.sc.gov/business-resourceslaws/licensing/ccrcs";
const CODE_37 = "https://www.scstatehouse.gov/code/t37c011.php";
const CODE_44 = "https://www.scstatehouse.gov/code/t44c007.php";
const MEDICARE = "https://www.medicare.gov/coverage/long-term-care";
const OSS = "https://www.scdhhs.gov/resources/programs-and-initiatives/long-term-living/optional-state-supplementation-oss";
const CARE_COMPARE = "https://www.medicare.gov/care-compare/";
const CMS = "https://data.cms.gov/provider-data/dataset/4pq5-n9py";
const HUD = "https://hudgis-hud.opendata.arcgis.com/";
const HUD_FIND = "https://resources.hud.gov/";
const HC_BEACH = "https://www.horrycountysc.gov/about-our-beaches";
const SURFSIDE = "https://www.surfsidebeach.org/200/Beaches";

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main. One card style for the chart and the offers; */
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
  /* Lists plain, under thin rules. */
  + `${S} ul.sl-list{list-style:none;margin:.6rem 0 1.3rem;padding:0;max-width:720px}`
  + `${S} ul.sl-list>li{margin:0;padding:.75rem 0;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} ul.sl-list>li:last-child{border-bottom:${RULE}}${S} ul.sl-list strong{color:var(--navy)}`
  /* Tables plain, under thin rules; on a phone each row is the first cell over labelled cells. */
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important;vertical-align:bottom}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}${TBL} td{vertical-align:top;line-height:1.55}${TBL} td:first-child{color:var(--navy);font-weight:600}`
  + `${TBL} tr.tot td{color:var(--navy);font-weight:600;border-bottom:0!important}`
  + `${TBL} td.num{white-space:nowrap;font-variant-numeric:tabular-nums}`
  + `@media (max-width:599px){${TBL} table,${TBL} tbody,${TBL} tr,${TBL} td{display:block;width:100%}${TBL} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TBL} tr{padding:.65rem 0;border-bottom:${RULE}}${TBL} td{border:0!important;padding:.12rem 0!important}${TBL} td:first-child{font-weight:650;padding-bottom:.25rem!important}`
  + `${TBL} td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-weight:500}${TBL} td.num{white-space:normal}}`
  + `@media (max-width:599px){${S} .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important}}`
  + `${S} ul.sl-list>li{font-size:var(--read,1.0625rem)}`
  /* The choices table at desktop: the cost column narrow and wrapping, the last column the second widest. */
  + `@media (min-width:600px){${TBL} table.sl-choices{table-layout:fixed}${TBL} table.sl-choices th:nth-child(1){width:18%}${TBL} table.sl-choices th:nth-child(2){width:34%}${TBL} table.sl-choices th:nth-child(3){width:18%}${TBL} table.sl-choices th:nth-child(4){width:30%}${TBL} table.sl-choices td.num{white-space:normal}}`
  /* The hero tiles: one row, wide enough that no label wraps past two lines. */
  + `@media (min-width:1000px){${S} .detail-media,${S} .c3-glance{max-width:1060px!important}}`
  /* Licensed homes by town: a town line, one plain line on the place, then the homes A to Z. */
  + `${S} .sl-town{max-width:720px;margin:1.4rem 0 0;padding-top:1rem;border-top:${RULE}}`
  + `${S} .sl-town h3{font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:0 0 .35rem}${S} .sl-town h3 span{font-family:var(--sans);font-size:.95rem;color:var(--muted);font-weight:500;margin-left:.5rem}`
  + `${S} .sl-town p{color:var(--muted);line-height:1.65;margin:0 0 .55rem;font-size:var(--read,1.0625rem)}${S} .sl-town p.sl-hosp{font-size:.95rem;margin-top:-.3rem}${S} .sl-town p.sl-hosp strong{color:var(--navy);font-weight:600}`
  + `${S} ul.sl-homes{list-style:none;margin:0;padding:0;columns:2;column-gap:2rem}${S} ul.sl-homes li{break-inside:avoid;display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin:0;padding:.35rem 0;border-bottom:1px solid rgba(28,32,40,.08);color:var(--navy);line-height:1.4}`
  + `${S} ul.sl-homes li span{color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}`
  + `@media (max-width:599px){${S} ul.sl-homes{columns:1}}`
  + `${S} .sl-town + p{margin-top:1.3rem}`
  + `${S} .hx-fallback .c3-offer{margin-top:.4rem}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* A table that turns into rows of labelled cells on a phone. Cells that start with "#" are numbers. */
const TDS = 'padding:.6rem .8rem;border-bottom:1px solid var(--rule);color:var(--muted)';
const table = (head, rows, o = {}) => {
  const cell = (c, i) => {
    const num = typeof c === "string" && c.startsWith("#"), v = num ? c.slice(1) : c;
    if (i > 0 && v === "") return "";
    return `<td style="${TDS}"${num ? ' class="num"' : ""}${i > 0 ? ` data-l="${head[i]}"` : ""}>${v}</td>`;
  };
  const body = rows.map((r) => `<tr>${r.map(cell).join("")}</tr>`).join("") + (o.total ? `<tr class="tot">${o.total.map(cell).join("")}</tr>` : "");
  return `<div style="overflow-x:auto;margin:1.2rem 0;max-width:760px"><table${o.cls ? ` class="${o.cls}"` : ""} style="width:100%;border-collapse:collapse"><thead><tr>`
    + head.map((c) => `<th style="padding:.55rem .8rem;color:var(--navy);text-align:left;font-family:var(--sans);font-size:.8rem;letter-spacing:.04em;text-transform:uppercase">${c}</th>`).join("")
    + `</tr></thead><tbody>${body}</tbody></table></div>`;
};
const list = (items) => `<ul class="sl-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

/* ---------------------------------------------------------------------------- */
/* The chart: a month of each kind of care (F1, F3, F4, F5).                      */

const CHART_COST = G.bars([
  { name: "Adult day care, 5 days a week", value: mb("adult_day_care"), valueText: money(mb("adult_day_care")) },
  { name: "Assisted living", value: mb("assisted_living"), valueText: money(mb("assisted_living")) },
  { name: "Care at home, 44 hours a week", value: mb("home_care_services"), valueText: money(mb("home_care_services")) },
  { name: "Nursing home, shared room", value: mb("nursing_home_semi_private"), valueText: NH_SHARED },
  { name: "Nursing home, private room", value: mb("nursing_home_private"), valueText: NH_PRIVATE },
], {
  caption: "What a month of care costs around Myrtle Beach",
  note: `Middle monthly cost in the Myrtle Beach area, from CareScout's ${YEAR} Cost of Care Survey. Care at home is a non-medical caregiver for 44 hours a week.`,
  nameLabel: "Kind of care", valueLabel: "A month", compact: true,
});

/* ---------------------------------------------------------------------------- */
/* Homes strips (new places, BUILD.md) with their fallbacks.                      */

const STRIP_ONE_LEVEL = G.homesQ("type=house&has=one_level", "One-level houses along the Grand Strand, every room on one floor");
const STRIP_CONDOS = G.homesQ("type=condo&has=elevator_building", "Condos in elevator buildings");
/* One strip of one-level houses for each town section (round 2, FIXES-2.md). Each search found 28 or more on 2026-11-14. */
const TOWN_STRIP = (name) => G.homesQ(`type=house&has=one_level&city=${name}`, `One-level houses in ${name}, every room on one floor`);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buy", url: "/buyers/" },
  title: "Assisted Living Myrtle Beach SC: $5,850 a Month, Town by Town",
  description: "Assisted living in Myrtle Beach costs about $5,850 a month. Compare memory care, nursing homes and continuing care, and see the licensed homes by town.",
  ogTitle: "Senior living around Myrtle Beach: what assisted living, nursing homes and care at home cost, and where the licensed homes are",
  crumb: "Senior Living",
  eyebrow: "Senior living",
  h1: "Senior living around Myrtle Beach, SC",
  h1em: "What each choice costs, and what it gives you.",
  sub: `Assisted living, memory care, nursing homes and continuing care around Myrtle Beach: ${YEAR} costs, the licensed homes town by town, and when buying still makes sense.`,
  heroMedia: glance([
    { icon: "dollar", label: "Assisted living", text: `${money(mb("assisted_living"))} a month` },
    { icon: "hospital", label: "Nursing home, shared room", text: `${NH_SHARED} a month` },
    { icon: "home", label: "Care at home", text: `$${HOURLY} an hour` },
    { icon: "pin", label: "Assisted living homes", text: `${ALL_AL} licensed` },
  ]),
  heroCta: { title: "Tell us what care is needed. We find the homes and price the house.", label: "Have us plan the move", href: LEAD },
  topOfferLine: "Tell us what care is needed. We plan the move and price the house.",
  author: "devin",
  shortAnswer: [
    `Assisted living around Myrtle Beach costs about ${money(mb("assisted_living"))} a month, about ${money(C.annual_myrtle_beach_area.assisted_living)} a year. The state licenses ${TH.al} assisted living homes in Horry County and ${ALL_AL - TH.al} more in Murrells Inlet and Pawleys Island.`,
    `While no one needs daily care, owning costs far less: about ${money(OWN_YEAR)} a year in county tax at 65 on a $400,000 house outside the city limits. Help at home costs about $${HOURLY} an hour.`,
  ],
  sections: [
    { h2: "How much is assisted living in Myrtle Beach?", toc: "Costs", id: "costs", html: (bg) =>
      CSS + G.homesCss() + G.homesQScript() +
      CHART_COST +
      list([
        `<strong>Against the state and the country.</strong> Assisted living here costs more than South Carolina's ${money(M.assisted_living.sc)} a month, and less than the U.S. figure of ${money(M.assisted_living.us)}.`,
        `<strong>Against other South Carolina areas.</strong> Of the areas the survey prices, Myrtle Beach is third highest, after Columbia and Hilton Head Island.`,
        `<strong>Care at home.</strong> A non-medical caregiver, such as a home health aide or a homemaker, costs about $${HOURLY} an hour. Adult day care costs about $72 a day.`,
      ]) +
      h.p(`The survey has no separate figure for memory care, and none for independent living. Prices differ from one home to the next, so we get each home's current prices for you.`) +
      h.cta("Weigh a year of care against the house", `Send us the address of the house. An agent prices it from recorded sales nearby, so you can see how many years of care it would cover.`, "Have us price the house", LEAD, bg) },

    { h2: "Assisted living vs. nursing home vs. independent living: what is the difference?", toc: "The choices", id: "choices", html: () =>
      h.p(`Each choice gives a different amount of care. In South Carolina, assisted living is licensed as a "community residential care facility", and the state's papers use both names.`) +
      table(["Choice", "What you get", "Cost a month here", "When more care is needed"], [
        ["Your own home, with help", "Your house or condo, and a caregiver who comes in by the hour.", `#$${HOURLY} an hour`, "Add hours, or move to a place that gives care."],
        ["Independent living", "An apartment or a home with no care included. The state has no license for it.", "No published local figure", "Hire help at home, or move to assisted living."],
        ["Assisted living", "A room, at least three meals a day, and help with dressing, walking, bathing and taking medicines.", `#${money(mb("assisted_living"))}`, "A nurse may come for up to 14 days in a row. Past that, a move."],
        ["Memory care", "Alzheimer's care, often in its own unit of an assisted living home.", "No published local figure", "The same limits as assisted living."],
        ["Nursing home", "An organized nursing staff that gives nursing care.", `#${NH_SHARED} shared, ${NH_PRIVATE} private`, "The level of care assisted living may not give."],
        ["Continuing care", "One contract: an apartment or a cottage, and access to more care as needs change.", "An entrance fee; each campus has its own", "More care, under the same contract."],
      ], { cls: "sl-choices" }) +
      h.p(`Assisted living may not admit or keep a person who needs nursing home care or a nurse's daily attention. When the home's care, even with outside home health or hospice care, no longer meets a person's needs, the person must move within 30 days.`) +
      h.p(`South Carolina's health facility licensing law has no license for independent living. A home with room, board and personal help must be licensed as residential care.`) +
      h.h3("Apartments with HUD rent help") +
      h.p(`HUD pays subsidies to the owners of some apartment buildings to keep rents affordable for people with low incomes, including older adults. They are rental apartments, and none is on the state's list of licensed care homes.`) +
      h.p(`In Horry County, HUD lists four of these buildings for older adults, with ${n0(HUDH.reduce((s, x) => s + x.units, 0))} apartments; one, with 110, is partly for people with disabilities. Two are in Myrtle Beach, one in Conway and one in Loris. One more is in Pawleys Island, with 48.`) +
      h.p(`${h.ext(HUD_FIND, "HUD's Resource Locator")} shows each building on a map. Ask the building's office about openings and who may rent there.`) },

    { h2: "Where is assisted living around Myrtle Beach?", toc: "By town", id: "by-town", html: (bg) =>
      h.p(`The state licenses ${ALL_AL} assisted living homes with ${n0(ALL_BEDS)} beds in Horry County and the Georgetown County side of Murrells Inlet and Pawleys Island. Each home is listed under the town in its mailing address, A to Z, with the beds the state licenses.`) +
      TOWNS.map((t) => `<div class="sl-town"><h3>${t.name}<span>${t.al} homes, ${n0(t.beds)} beds</span></h3>`
        + `<p>${t.where}</p><p class="sl-hosp"><strong>Nearest main hospital${t.hosp.most ? ", for most houses" : ""}:</strong> ${t.hosp.name}, about ${t.hosp.min} minutes</p>`
        + `<ul class="sl-homes">${t.homes.map((x) => `<li>${x.name} <span>${x.beds} beds</span></li>`).join("")}</ul>${TOWN_STRIP(t.name)}</div>`).join("") +
      h.p(`Drive times are our measurement: the middle of 60 houses in each place, with no traffic, to the nearest of five main hospitals. ${h.ext(DPH_FIND, "The state's facility map")} shows each home's license and address.`) +
      list([
        `<strong>North Myrtle Beach.</strong> No licensed assisted living home has a North Myrtle Beach address. Three are within a mile of its city limits, in a straight line. One is in Little River, named Legacy of North Myrtle Beach, and two are in Myrtle Beach, near the city's south end.`,
        `<strong>Small homes and large ones.</strong> The smallest homes have 8 beds and the largest has 142. Horry County has the third most licensed assisted living beds in South Carolina, after Greenville and Charleston.`,
        `<strong>A plan for hurricanes.</strong> Every licensed assisted living home keeps a written disaster and evacuation plan, made with the county emergency agency and updated yearly. A resident or the resident's responsible party may ask to see it.`,
      ]) +
      h.p(`More on each hospital is on our ${h.a("/buyers/relocating/healthcare/", "Myrtle Beach healthcare page")}.`) +
      h.cta("Tour the towns before you choose a home", "Tell us where the family lives now and what care is needed. We show you the towns, the care homes in each, and the homes for sale around them.", "Have us plan a day of tours", LEAD, bg) },

    { h2: "Memory care and nursing homes around Myrtle Beach", toc: "Memory care and nursing homes", id: "memory-care", html: () =>
      h.p(`On the state's facility map, 14 of Horry County's 20 licensed assisted living homes are marked for Alzheimer care, and 13 are marked with an Alzheimer unit.`) +
      h.p(`Horry County has ${TH.nh} licensed nursing homes with ${TH.nh_beds} beds. Three are in Conway and three in Myrtle Beach, with one each in Murrells Inlet and Loris. Seven of the eight are certified for both Medicare and Medicaid, and one for Medicare only. Certification is not a promise of an open Medicaid bed.`) +
      h.p(`The county also has ${TH.adc} licensed adult day care centers, in Myrtle Beach, Conway and Loris, and a 36-bed hospice house in Myrtle Beach. ${h.ext(CARE_COMPARE, "Medicare's Care Compare")} has a page for each nursing home.`) +
      h.h3("Who pays for long-term care") +
      list([
        `<strong>Medicare does not.</strong> Medicare and most health insurance, including Medigap, do not pay for long-term care, in a nursing home or at home. Medicaid may, for people who meet the state's rules.`,
        `<strong>South Carolina's Optional State Supplementation (OSS)</strong> helps people 65 or older, blind or disabled, whose income and savings are under its limits. It pays toward a licensed assisted living home enrolled in OSS, for a person with an approved OSS slot.`,
        `<strong>OSS is not Medicaid.</strong> It is a separate state program, run by the ${h.ext(OSS, "South Carolina Department of Health and Human Services")}.`,
      ]) },

    { h2: "Continuing care: two licensed campuses on the Grand Strand", toc: "Continuing care", id: "continuing-care", html: (bg) =>
      h.p(`South Carolina licenses ${D.ccrc.statewide} continuing care retirement communities. Two are on the Grand Strand: Brightwater in Myrtle Beach and The Lakes at Litchfield in Pawleys Island.`) +
      h.p(`A continuing care retirement community offers, under one contract, an apartment or a cottage and access to a range of long-term care as a resident's needs change. The resident pays an entrance fee, which holds the resident's place.`) +
      h.p(`Under South Carolina law, the person who signs has four protections:`) +
      list([
        `<strong>The refund.</strong> The contract must say what part of the entrance fee is refundable.`,
        `<strong>30 days to cancel.</strong> The resident may cancel within 30 days of signing. The refund is what was paid, less the community's costs and, if the home was ready to move into, a daily rate from the eighth day.`,
        `<strong>A disclosure statement.</strong> By the time the contract is signed or any money is paid, whichever comes first, the community must give one.`,
        `<strong>A check of the finances.</strong> The state checks a community's finances before it grants a license.`,
      ]) },

    { h2: "When does buying a home still make sense?", toc: "Buying a home", id: "buying", html: () =>
      h.p(`For a couple or a parent who does not need daily care yet, a smaller home here can cost far less each year. A one-level house or a condo with an elevator keeps every room within reach.`) +
      h.p(`Outside the city limits, a $400,000 house you live in costs about ${money(OWN_YEAR)} a year in county tax and stormwater fee at 65. Insurance and any HOA fee are extra. A year of assisted living costs about ${money(C.annual_myrtle_beach_area.assisted_living)}. The tax rules at 65 are on our ${h.a("/buyers/retirees/", "retiring to Myrtle Beach page")}.`) +
      h.h3("The beach, by wheelchair") +
      h.p(`Horry County lends beach wheelchairs free on the beaches it runs. Ask at least two days ahead; chairs are limited. In ${h.a("/submarkets/surfside-beach/", "Surfside Beach")}, special beach wheelchairs are available through the town's police department, and five beach accesses have wheelchair access.`) +
      PIER_PHOTO +
      STRIP_ONE_LEVEL +
      STRIP_CONDOS +
      h.p(`For neighborhoods that are age-restricted, with their own clubs and HOA fees, compare the ${h.a("/buyers/55-plus-communities/", "55+ communities around Myrtle Beach")}. What a home costs to own each year is on our ${h.a("/buyers/cost-to-own/", "cost of owning page")}.`) },

    { h2: "How do you sell the house and move to the right-size home?", toc: "Selling the house", id: "selling", html: () =>
      h.p(`We sell a house here, find the next home, and time the two so the money is ready for the move.`) +
      list([
        `<strong>We price the house from recorded sales.</strong> An agent picks the sales most like it. Our ${h.a("/sell/home-value/", "home value page")} shows what homes sold for by area.`,
        `<strong>We plan the order.</strong> Sell first, buy first, or both close together: our guide to ${h.a("/sell/sell-or-buy-first/", "selling or buying first")} weighs each.`,
        `<strong>We handle it from a distance.</strong> A parent can stay put while we list and show the house. Our page on ${h.a("/sell/out-of-state-buyers/", "selling from out of state")} covers the steps.`,
        `<strong>We show what you keep.</strong> Our ${h.a("/sell/net-proceeds/", "net proceeds page")} works out the cash left after the loan and closing costs. Our ${h.a("/sell/capital-gains/", "capital gains page")} shows when the gain on a home you lived in is taxed.`,
        `<strong>We find the next home.</strong> A one-level house, a condo with an elevator, or a home near the care a parent uses.`,
      ]) +
      h.p(`An agent at Chapter3 worked with a client household from New York. They sold a $1 million house with more than $20,000 a year in property tax. They bought a $700,000 house here with about $3,200 a year in tax. That is one household's result, not a promise.`) +
      h.p(`If the house is in another state, an agent there lists it. We work out the timing with you, so the money from that sale is ready for the move here.`) },
  ],
  faqTitle: "Senior living questions",
  faq: [
    { q: "Does Medicare pay for assisted living in South Carolina?", a: "No. Medicare and Medigap do not pay for long-term care, in a nursing home or in the community. Medicaid can, for those who qualify." },
    { q: "Is there help paying for assisted living in South Carolina?", a: "Yes, for some people. A state program called Optional State Supplementation helps pay for a licensed assisted living home enrolled in it, for a person with an approved slot. It is for people 65 or older, blind or disabled, under its income and savings limits. It is not Medicaid." },
    { q: "Do assisted living homes near Myrtle Beach have a hurricane plan?", a: "Yes. Each licensed assisted living home must have a written evacuation plan, made with the county's emergency agency and updated every year. A resident or the resident's responsible party can ask to read it." },
    { q: "Is independent living licensed in South Carolina?", a: "No. South Carolina licenses assisted living and nursing homes, but it has no license for independent living with no care." },
    { q: "What does adult day care cost in Myrtle Beach?", a: `About $72 a day at the middle, or about ${money(mb("adult_day_care"))} a month at five days a week. Horry County has ${TH.adc} licensed adult day care centers, in Myrtle Beach, Conway and Loris.` },
    { q: "How much is memory care in Myrtle Beach?", a: "There is no published local figure: the cost survey does not price memory care on its own. Prices differ from one home to the next." },
  ],
  sources: [
    { name: `CareScout ${YEAR} survey`, href: CARESCOUT },
    { name: "SC DPH facility map", href: DPH_FIND },
    { name: "DPH residential care", href: DPH_CRC },
    { name: "DPH sheet 00343", href: DPH_SHEET },
    { name: "SC Reg. 60-84", href: REG_6084 },
    { name: "SC Consumer Affairs", href: SCDCA },
    { name: "SC Code 37-11", href: CODE_37 },
    { name: "SC Code 44-7", href: CODE_44 },
    { name: "Medicare.gov", href: MEDICARE },
    { name: "SCDHHS OSS", href: OSS },
    { name: "CMS nursing homes", href: CMS },
    { name: "HUD assisted housing", href: HUD },
    { name: "HUD Resource Locator", href: HUD_FIND },
    { name: "Horry County beaches", href: HC_BEACH },
    { name: "Surfside Beach", href: SURFSIDE },
  ],
  sourcesNote: `Costs are medians from CareScout's ${YEAR} Cost of Care Survey. Our counts: the state's licensed facility list, by mailing address, and its Total Licensed Beds.`,
  afterSources: () => CREDITS + PH.imageSchema([PIER_REC]),
  bottomCta: { h2: "Sell the house, find the right-size home.", p: "Tell us what care is needed and where. We price the house, plan the move and find the next home.", label: "Ask us to plan it", href: LEAD },
  keywords: "assisted living Myrtle Beach SC, senior living Myrtle Beach, independent living Myrtle Beach, memory care Myrtle Beach, nursing homes Myrtle Beach, assisted living Conway SC, assisted living Murrells Inlet, assisted living Pawleys Island, how much is assisted living in Myrtle Beach",
  about: "Senior living around Myrtle Beach, South Carolina: assisted living, memory care, nursing homes and continuing care costs and licensed homes",
});
