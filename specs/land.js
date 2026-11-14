/* /buyers/land/ - land for sale in Horry County: what an acre costs by area and by tract size (our count of
 * every land listing), the land around Loris and Aynor (the river landings, Cartwheel Bay, tobacco history),
 * the South Carolina septic permit (no perc test since the late 1970s), water and sewer, what the zoning lets
 * you put on a lot (lot sizes, manufactured homes, campers), road frontage, flood zones, the fees to build,
 * and how farm and timber land is taxed.
 *
 * Batch 2026-11-d, Lane N. A new page, version 1, 2026-11-13. Plan: Blog-Brain batches/2026-11-d/land/PLAN.md.
 * Demand: must-answer.md. Facts: facts.md, VERIFIED rows, and CORRECTED rows at the verifier's wording only
 * (VERIFY.md; struck wording in batches/2026-11-d/facts/buyers-land-struck.json). Row numbers are given as F<n>.
 * Not used (VERIFY "Not to publish"): the $1,615 impact fee and its ordinance (F21), any impact fee study
 * figure (F22), "since the 1870s ... from the porch" in one sentence (F31), "runs past Aynor tea-colored" (F30).
 * Left out by choice: LFA's manufactured-home rule (not in a verified row), AG6 and AG7 at "two acres" (the
 * ordinance says 1.5, F14), any private perc test price (not found), Georgetown County's lot sizes (not read).
 * Data: data/2026-11-d/land/ (findings.json, chart-ppa-by-area.json, chart-ppa-by-size.json, gis.json, from
 * pull_land.py, pull_gis.py and build_findings.py). Every count, share and price below is read from those
 * files and checked against its ledger row. No listing, address, MLS number or listing photo is on the page.
 * Picture: one USDA NAIP aerial of country land outside Loris (public domain), the which-town export re-run
 * at full size for this page's crops; record in data/2026-11-d/land/photos.json. It is the fallback of the
 * Loris and Aynor homes strip, so it shows only while that strip is empty.
 * Homes: the site's edge puts this page's feed under the opening (lead item in BUILD.md). Two strips here,
 * land-loris-aynor and land-conway-longs (new places, lead item in BUILD.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/land/";
const SLUG = "land";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const about10 = (v) => n0(Math.round(v / 10) * 10);

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const F = read("findings.json"), GIS = read("gis.json");
const BY_AREA = read("chart-ppa-by-area.json"), BY_SIZE = read("chart-ppa-by-size.json");
const HZ = F.horry, FL = F.horry_flags, CM = F.county_map;

/* F34 (CORRECTED: two separate medians). */
must(F.totals.land_horry === 763 && F.totals.land_georgetown === 172, "F34: 763 and 172 listings");
must(HZ.median_ask === 195000 && HZ.median_acres === 1.7 && HZ.one_acre_plus === 484 && HZ.ten_acres_plus === 146, "F34: medians and counts");
must(FL.lot_100_acres_plus.n === 17, "F34: 17 of 100 acres or more");
/* F35: by tract size. */
const SZ = Object.fromEntries(F.by_size.map((b) => [b.key, b]));
must(SZ.under_half_acre.per_acre === 686000 && SZ.half_to_1.per_acre === 140000 && SZ["1_to_5"].per_acre === 54000 && SZ["5_to_20"].per_acre === 30000 && SZ["20_plus"].per_acre === 19000, "F35: per-acre by size");
must(BY_SIZE.rows.map((r) => r.n).join() === "158,117,267,112,105", "F35: listings by size");
/* F36: by area, tracts of an acre or more. */
const AR = Object.fromEntries(F.by_area.map((a) => [a.key, a]));
const EXPECT36 = { loris_green_sea_nichols: [25000, 212], aynor_galivants_ferry: [40000, 50], conway: [51000, 97], longs: [73000, 31],
  myrtle_beach_carolina_forest_socastee: [152000, 52], little_river: [265000, 17], murrells_inlet_garden_city: [302000, 15], pawleys_island: [342000, 19] };
for (const [k, [v, n]] of Object.entries(EXPECT36)) must(AR[k] && AR[k].per_acre_1ac_plus === v && AR[k].tracts_1ac_plus === n, `F36: ${k}`);
must(BY_AREA.rows.length === 8 && BY_AREA.rows.every((r, i) => r.value <= (BY_AREA.rows[i + 1] || { value: Infinity }).value), "F36: chart rows cheapest first");
/* F37 (CORRECTED: "of the areas we counted"). */
const LO = AR.loris_green_sea_nichols;
must(LO.listings === 266 && LO.ten_acres_plus === 70 && LO.median_acres === 2.5, "F37: Loris, Green Sea and Nichols");
must(F.by_area.every((a) => a.listings <= LO.listings), "F37: the Loris ZIP codes have the most land of the areas counted");
/* F38 (CORRECTED: the flag reads "perc or septic approved"). */
must(FL.septic_approved.n === 177 && FL.public_sewer.n === 267 && FL.public_water.n === 325 && FL.well_water.n === 41, "F38: utilities flags");
const SEPTIC_IN = Math.round(FL.septic_approved.of / FL.septic_approved.n); /* 763 / 177 = 4.3: about 1 in 4 */
const WATER10 = Math.round(FL.public_water.pct / 10), SEWER_IN = Math.round(FL.public_sewer.of / FL.public_sewer.n);
must(SEPTIC_IN === 4 && WATER10 === 4 && SEWER_IN === 3, "F38: 1 in 4, 4 in 10, 1 in 3");
/* F39 (CORRECTED labels). */
must(FL.mobile_home_allowed.n === 111 && FL.deed_restrictions.n === 74 && FL.dirt_road.n === 77 && FL.private_road.n === 49 && FL.easement_access.n === 27 && FL.hunting_land.n === 30, "F39: flags");
/* F40: the county map under each listing's point. */
must(CM.fa_cfa === 368 && CM.tracts_1ac_plus_fa_cfa === 295 && CM.tracts_1ac_plus === 484 && CM.sf_no_mobile === 62 && CM.flood_high_risk === 91 && CM.flood_moderate_0_2 === 24, "F40: county map counts");
must(GIS.zoning_at_point.FA === 287 && GIS.zoning_at_point.CFA === 81 && GIS.high_risk_flood_at_point.high_risk === 91, "F40: gis.json");
const FLOOD_IN = Math.round(CM.listings / CM.flood_high_risk); /* 763 / 91 = 8.4: about 1 in 8 */
const BIG_FA10 = Math.round(CM.tracts_1ac_plus_fa_cfa / CM.tracts_1ac_plus * 10); /* 61.0%: 6 in 10 */
must(FLOOD_IN === 8 && BIG_FA10 === 6 && Math.abs(CM.fa_cfa / CM.listings - 0.5) < 0.03, "F40: 1 in 8, 6 in 10, about half");
/* F19: the building permit on a 2,000 square foot house: 0.20 + 0.50 a square foot, plus $25 zoning. */
const SQFT = 2000, PERMIT = SQFT * 0.20 + SQFT * 0.50 + 25;
must(PERMIT === 1425, "F19: $1,425 on 2,000 square feet");
/* F3, F10, F19: the three fees a house with a septic tank and a well pays first. */
const FEES3 = 150 + 70 + PERMIT;
must(Math.round(FEES3 / 50) * 50 === 1650, "F3 + F10 + F19: about $1,650");

/* The month of the count, from the data file (never typed). */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pm = String(F.pulled).match(/^(\d{4})-(\d{2})-/);
must(pm, "findings.json: no pulled date");
const COUNTED = `${MONTHS[+pm[2] - 1]} ${pm[1]}`;

/* ---------------------------------------------------------------------------- */
/* Links.                                                                         */

const LEAD = "/contact/", CONTACT = "/contact/";
const DES_FAQ = "https://des.sc.gov/permits-regulations/septic-tanks/homeowner-resources/septic-tanks-frequently-asked-questions";
const DES_HOME = "https://des.sc.gov/permits-regulations/septic-tanks/permits-licenses/septic-tanks-residential-single-home-builder";
const DES_SITE = "https://des.sc.gov/permits-regulations/septic-tanks/homeowner-resources/site-inspections";
const DES_LAND = "https://des.sc.gov/permits-regulations/septic-tanks/homeowner-resources/you-buy-land";
const DES_WELL = "https://des.sc.gov/programs/bureau-water/residential-wells/private-drinking-water-wells";
const GSWSA = "https://www.gswsa.com/about_us.cfm?page=58";
const ZO = "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf";
const ZD = "https://www.horrycountysc.gov/media/tg5aree5/zoningdistricts.pdf";
const PERMIT_COST = "https://www.horrycountysc.gov/departments/code-enforcement/permits/building-permit/cost-of-a-building-permit/";
const PERMIT_NEEDS = "https://www.horrycountysc.gov/departments/code-enforcement/permits/building-permit/what-you-need-for-a-building-permit/";
const FEES = "https://www.horrycountysc.gov/media/e4hbjmgx/planning-and-zoning-fee-schedule-fy-2027.pdf";
const IMPACT = "https://horrycountysc.gov/news/articles/how-impact-fees-invest-in-horry-countys-future/";
const BUILD_SAFE = "https://www.horrycountysc.gov/departments/emergency-management/flooding/build-responsibly/";
const SC_TAX = "https://www.scstatehouse.gov/code/t12c043.php";
const GIS_SVC = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const SCE = "https://www.scencyclopedia.org/sce/entries/horry-county/";
const STUMP = "https://scencyclopedia.org/sce/entries/galivants-ferry-stump-meeting/";
const DNR = "https://dnr.sc.gov/water/river/scenic/littlepeedee.html";
const CARTWHEEL = "https://www.sctrails.net/trails/trail/cartwheel-bay-heritage-preserve";
const LANDINGS = "https://www.horrycountysc.gov/departments/parksandrecreation/boat-landings/";
const LORIS_WATER = "https://cityoflorissc.com/water-utilities";

/* Sibling pages of this batch may not be built yet. A sentence that points to one is written only when its page
   exists in this working copy, else the whole sentence is left out; rebuild this spec once it is built (BUILD.md). */
const SITE_ROOT = path.join(__dirname, "..", "chapter3realty");
const live = (u) => fs.existsSync(path.join(SITE_ROOT, ...u.split("/").filter(Boolean), "index.html"));
/* The flood zone check sentence is written only once /buyers/flood-zone-check/ exists (BUILD.md lead item 5). */

/* ---------------------------------------------------------------------------- */
/* The photo: USDA NAIP, public domain (record in data/2026-11-d/land/photos.json). */

const PHOTOS = read("photos.json").photos;
const LORIS_REC = PHOTOS.find((r) => /country-land-outside-loris-from-above\.webp$/.test(r.file));
must(LORIS_REC && LORIS_REC.license === "Public domain", "the NAIP aerial record");
const LORIS_PHOTO = PH.heroPhoto(LORIS_REC, { alt: LORIS_REC.alt, caption: LORIS_REC.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
const CREDITS = PH.creditsList([{ photo: LORIS_REC, caption: LORIS_REC.caption.replace(/\.$/, "") }]);

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
  /* Lists plain, under thin rules. */
  + `${S} ul.ld-list{list-style:none;margin:.6rem 0 1.3rem;padding:0;max-width:720px}`
  + `${S} ul.ld-list>li{margin:0;padding:.75rem 0;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} ul.ld-list>li:last-child{border-bottom:${RULE}}${S} ul.ld-list strong{color:var(--navy)}`
  /* Tables plain, under thin rules; on a phone each row is the first cell over labelled cells. */
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}${TBL} td:first-child{color:var(--navy)}`
  + `@media (max-width:599px){${TBL} table,${TBL} tbody,${TBL} tr,${TBL} td{display:block;width:100%}${TBL} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TBL} tr{padding:.65rem 0;border-bottom:${RULE}}${TBL} td{border:0!important;padding:.1rem 0!important}${TBL} td:first-child{font-weight:650}`
  + `${TBL} td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-weight:500}}`
  /* The story: a quiet block with a brass rule. */
  + `${S} .ld-story{max-width:720px;margin:1.2rem 0 1.4rem;padding:.2rem 0 .2rem 1.2rem;border-left:4px solid var(--brass);color:var(--muted);line-height:1.7}`
  + `${S} .ld-story b{color:var(--navy)}`
  /* The photo sits without a second frame. */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero>figcaption{padding:0!important}`
  + `${S} figure.c3ph-hero img{aspect-ratio:4/3!important}`
  + `${S} .hx-fallback .c3-offer{margin-top:.4rem}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* A table that turns into rows of labelled cells on a phone. */
const table = (head, rows) => h.table(head, rows).replace(/<tbody>([\s\S]*)<\/tbody>/, (m, body) => "<tbody>" + body.replace(/<tr>([\s\S]*?)<\/tr>/g, (r, cells) => {
  let i = 0;
  return "<tr>" + cells.replace(/<td ([^>]*)>/g, (t, attrs) => { const l = head[i++]; return i === 1 ? t : `<td ${attrs} data-l="${l}">`; }) + "</tr>";
}) + "</tbody>");
const list = (items) => `<ul class="ld-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

/* ---------------------------------------------------------------------------- */
/* Charts, from the data files (F35, F36).                                        */

const CHART_AREA = G.bars(BY_AREA.rows.map((r) => ({ name: r.label, value: r.value, valueText: money(r.value), feature: `${r.n} tracts` })), {
  caption: "An acre costs least around Loris and Aynor",
  /* Values are prices an acre; the caption and note say so, and the short value fits a phone row. */
  note: `Middle asking price an acre on tracts of 1 acre or more, by ZIP code area, from our count of land for sale in ${COUNTED}. The Pawleys Island area is in Georgetown County; the rest are in Horry.`,
  nameLabel: "Area", featureLabel: "tracts for sale", valueLabel: "Middle asking price an acre", compact: true,
});
const CHART_SIZE = G.bars(BY_SIZE.rows.map((r) => ({ name: r.label, value: r.value, valueText: money(r.value), feature: `${r.n} for sale` })), {
  caption: "Price an acre, by lot size",
  note: `Middle asking price an acre of Horry County land for sale, by the size of the lot. Our count of ${n0(F.totals.land_horry)} land listings.`,
  nameLabel: "Lot size", featureLabel: "for sale", valueLabel: "Middle asking price an acre", compact: true,
});

/* ---------------------------------------------------------------------------- */
/* Homes strips (new places, BUILD.md) with their fallbacks.                      */

const SQ = (q, t) => G.homesQ(q, t);
const STRIP_LORIS = SQ("type=land&city=Loris&lotMin=1", "Acres for sale in Loris");
const STRIP_AYNOR = SQ("type=land&city=Aynor", "Land for sale in Aynor");
const STRIP_CONWAY = SQ("type=land&city=Conway", "Land for sale in Conway");
const STRIP_LONGS = SQ("type=land&city=Longs&lotMin=1", "An acre or more in Longs");
/* One strip per row of the size chart, in its order and words. lotMax is ignored by the live site until v1.40. */
const SIZE_STRIPS = h.h3("Land for sale, by lot size") +
  SQ("type=land&lotMax=0.5", "Lots under half an acre") +
  SQ("type=land&lotMin=0.5&lotMax=1", "Half an acre to 1 acre") +
  SQ("type=land&lotMin=1&lotMax=5", "1 to 5 acres") +
  SQ("type=land&lotMin=5&lotMax=20", "5 to 20 acres") +
  SQ("type=land&lotMin=20", "Lots of 20 acres or more");

/* ---------------------------------------------------------------------------- */
/* The affiliated business disclosure (the wording on /buyers/programs/).         */

const AFBA = `<div id="afba" style="margin:1.4rem 0 3rem;max-width:640px"><p style="font-size:1rem;color:var(--muted);line-height:1.7;margin-bottom:.4rem"><strong style="color:var(--navy)">Affiliated Business Arrangement Disclosure.</strong> Chapter3 Realty Corp has a business relationship with BrickWood Mortgage (NMLS #189497). Because of this relationship, referrals to BrickWood Mortgage may provide Chapter3 Realty a financial or other benefit.</p>`
  + `<p style="font-size:1rem;color:var(--muted);line-height:1.7">You are NOT required to use BrickWood Mortgage as a condition for the purchase, sale, or refinance of any property. There are frequently other settlement service providers available with similar services. You are free to shop around to determine that you are receiving the best services and the best rate for those services.</p></div>`;

const a36 = (k) => money(AR[k].per_acre_1ac_plus);
/* F36: Myrtle Beach, Carolina Forest and Socastee at $152,000, said as "about $150,000". */
const MB = money(Math.round(AR.myrtle_beach_carolina_forest_socastee.per_acre_1ac_plus / 10000) * 10000);
must(MB === "$150,000", "F36: about $150,000 near Myrtle Beach");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buy", url: "/buyers/" },
  pageImages: () => PH.pageImages(LORIS_REC),
  title: "Land for Sale in Horry County, SC: What an Acre Costs",
  description: "Land for sale in Horry County, by the acre: asking prices by area and tract size, and what to check first: septic approval, zoning, water and flood zone.",
  ogTitle: "Land for sale in Horry County: what an acre costs by area and size, and what you can build on it",
  crumb: "Land",
  eyebrow: "Buying land",
  h1: "Land for sale in Horry County, SC",
  h1em: "What an acre costs, and what you can build on it.",
  sub: `An acre of land for sale is listed at about ${a36("loris_green_sea_nichols")} around Loris and about ${MB} near Myrtle Beach. A lot with no sewer needs a state septic permit first.`,
  heroCta: { title: "Found a piece of land? We check the septic, the flood map and the zoning before you offer.", label: "Have us check a parcel", href: CONTACT },
  topOfferLine: "Found land? We check the septic, flood map and zoning before you offer.",
  author: "devin",
  shortAnswer: [
    `Land for sale in Horry County is listed at about ${a36("loris_green_sea_nichols")} an acre around Loris and ${a36("aynor_galivants_ferry")} around Aynor. In Myrtle Beach, Carolina Forest and Socastee it is about ${MB}. Those are tracts of an acre or more, and the bigger the tract, the less each acre costs.`,
    `Before you offer, three things matter most: the state's septic permit, the zoning and the flood zone. We check all three for you.`,
  ],
  sections: [
    { h2: "What does an acre of land cost in Horry County?", toc: "Price an acre", id: "price", html: () =>
      CSS + G.homesCss() + G.homesQScript() +
      h.p(`About ${about10(F.totals.land_horry)} pieces of land are for sale in Horry County, and about ${about10(F.totals.land_georgetown)} in Georgetown County. In Horry the middle asking price is about ${money(HZ.median_ask)}, and the middle size is about ${HZ.median_acres} acres.`) +
      CHART_AREA +
      h.p(`Of the areas we counted, the Loris, Green Sea and Nichols ZIP codes have the most land for sale: ${LO.listings} pieces. Of those, ${LO.tracts_1ac_plus} are an acre or more, and ${LO.ten_acres_plus} are 10 acres or more. In all of Horry County, ${FL.lot_100_acres_plus.n} tracts for sale are 100 acres or more.`) +
      h.p(`These are asking prices, not sale prices. In each area, half the tracts are listed for more than the middle price an acre, and half for less.`) },

    { h2: "Land around Loris and Aynor: river landings, longleaf pine and old farms", toc: "Loris and Aynor", id: "loris-aynor", html: () =>
      h.p(`The country around Loris and Aynor has the lowest land prices we counted, and a long history as farm land.`) +
      h.h3("Around Loris") +
      h.p(`By 1903, tobacco markets were thriving in Conway and Loris. By the 1920s, Horry grew more tobacco than any other county in South Carolina.`) +
      h.p(`West of Loris, between Green Sea and Nichols, ${h.ext(CARTWHEEL, "Cartwheel Bay Heritage Preserve")} has a 3.5-mile trail through longleaf and loblolly pine. Wild Venus flytraps, pitcher plants and orchids grow along it. It is open dawn to dusk, with no fee.`) +
      LORIS_PHOTO + STRIP_LORIS +
      h.h3("Around Aynor") +
      h.p(`Galivants Ferry is west of Aynor, where US 501 crosses the Little Pee Dee River. There is a public boat landing on each side of the bridge. People fish the river for bluegill, redbreast, bass, crappie and catfish. Downriver, below the US 378 bridge, its state scenic stretch has tea-colored water, cypress-tupelo swamps and sandbars.`) +
      h.p(`Since the 1870s, candidates have come to Galivants Ferry to speak at ${h.ext(STUMP, "the Stump")}. These days they speak from the porch of the Holliday family store, and the crowd eats chicken bog and barbecue. What living in these towns is like is in our guide to ${h.a("/buyers/relocating/which-town/", "which town fits you")}.`) +
      STRIP_AYNOR +
      h.h3("Around Conway and Longs") +
      h.p(`Around Conway an acre is listed at about ${a36("conway")}, and in Longs at about ${a36("longs")}. At Longs, the county runs two boat landings on the Waccamaw River: Chris Anderson Landing on SC 9 and Danny Knight Landing at Red Bluff. Our ${h.a("/submarkets/conway/", "Conway guide")} covers the city and its edges.`) +
      STRIP_CONWAY + STRIP_LONGS +
      `<div class="ld-story"><b>From Chapter3's files.</b> Clients of ours from North Carolina bought land in Longs and built a new house there with a builder.</div>` },

    { h2: "The more land you buy, the less each acre costs", toc: "Tract size", id: "tract-size", html: () =>
      h.p(`In Horry County, a lot under half an acre is listed at about ${money(SZ.under_half_acre.per_acre)} an acre. A tract of 20 acres or more is listed at about ${money(SZ["20_plus"].per_acre)} an acre.`) +
      CHART_SIZE +
      h.p(`Compare a lot's price an acre only with lots of about the same size, in the same area.`) + SIZE_STRIPS },

    { h2: "Do you need a perc test to buy land in South Carolina?", toc: "Perc test and septic", id: "septic", html: (bg) =>
      h.p(`No. South Carolina has not used perc tests since the late 1970s, because a lot can pass in a dry season and fail in a wet one. A state inspector reads the soil instead.`) +
      h.p(`Where no public or community sewer reaches a lot, you need the state's septic permit before you build a house or place a manufactured home. Without it, the county will not issue a building permit. The state's steps:`) +
      list([
        `<strong>Apply online, for $150.</strong> The application needs a copy of the deed, or of the survey map filed for the lot. Our guide to ${h.a("/buyers/property-records/deeds/", "finding a deed in Horry County")} shows where to get both.`,
        `<strong>The inspector bores the soil.</strong> Under the state's traditional method, an inspector visits the lot and takes at least two soil borings where the septic system would go. The soil's color shows how high the water table rises in the wettest season.`,
        `<strong>Wet soil can wait.</strong> If the soil is too wet, the visit may be put off until it dries out. Poor soil can limit the number of bedrooms the house may have.`,
        `<strong>The permit is good for five years.</strong> If the site passes, the state issues a Permit to Construct.`,
      ]) +
      h.h3("What the lot needs room for") +
      h.p(`The drainfield is sized at 120 gallons a day per bedroom. A three-bedroom house needs a drainfield big enough for about 360 gallons a day, plus a spare repair area half its size.`) +
      h.p(`The system must sit at least 75 feet from a private well or a creek, pond or other surface water, and 25 feet from a drainage ditch.`) +
      h.p(`If a lot fails the state's conventional and alternative standards, an engineer and a soil scientist can check whether it can take an engineered system. That can cost thousands of dollars more. Not every lot can take a septic system.`) +
      h.h3("What the listings say") +
      h.p(`About 1 in ${SEPTIC_IN} Horry land listings are marked "perc or septic approved". We ask the seller for the state's permit itself, not the word "perc". If there is none, we can write your offer so it depends on the lot passing.`) +
      h.cta("No sewer on the lot?", "We look for a septic permit on it, ask whether sewer can reach it, and tell you what the soil visit will look for.", "Have us check the septic", LEAD, bg) },

    { h2: "Is there public water and sewer, or do you need a well?", toc: "Water and sewer", id: "water", html: () =>
      h.p(`Many lots have public water, and fewer have public sewer: about ${WATER10} in 10 Horry land listings list public water, and about 1 in ${SEWER_IN} list public sewer. Only ${FL.well_water.n} list a well.`) +
      h.p(`With no public sewer you need a septic system, and with no public water you need a well. Before you offer, we ask the local provider whether each one reaches the lot.`) +
      h.p(`${h.ext(GSWSA, "Grand Strand Water and Sewer Authority")} began east of the Intracoastal Waterway in Horry County. It now serves from the North Carolina line to parts of Georgetown County, and rural areas west of the Waccamaw River. Inside the City of Loris, ${h.ext(LORIS_WATER, "the city runs water and sewer")}.`) +
      h.p(`A new drinking-water well needs a state notice with a $70 fee, and a South Carolina certified well driller must drill it.`) +
      h.p(`A listing that says nothing about water or sewer is not proof either way, so we ask the provider.`) },

    { h2: "What can you build on land in Horry County?", toc: "Zoning and mobile homes", id: "zoning", html: (bg) =>
      h.p(`Outside the towns, each county zone has its own smallest lot for a home and its own rule on manufactured homes. In the two forest and farm zones, FA and CFA, a house or a manufactured home needs at least half an acre, 90 feet wide.`) +
      table(["Zone, outside the towns", "Smallest lot for a home", "Mobile homes"], [
        ["FA and CFA (Forest Agriculture, Commercial Forest Agriculture)", "Half an acre", "Allowed"],
        ["RE (Rural Estates)", "1 acre", "Not allowed"],
        ["AG4 and AG5", "5 acres", "Allowed in AG5 only"],
        ["AG6 and AG7", "1.5 acres", "Allowed in AG7 only"],
        ["SF6 to SF40", "6,000 to 40,000 sq ft", "Not allowed"],
        ["MSF6 to MSF40", "6,000 to 40,000 sq ft", "Allowed"],
      ]) +
      h.p(`In Limited Forest Agriculture (LFA), a home needs 1 acre. A lot recorded before the county's zoning ordinance can still be built on if it is no more than 25 percent short of its zone's minimum.`) +
      h.p(`Our count, at each listing's map point: about half of all Horry land listings are in FA or CFA. Among tracts of an acre or more, ${BIG_FA10} in 10 are. Another ${CM.sf_no_mobile} are in SF zones, where no mobile home is allowed.`) +
      h.p(`We look up the zone of any lot you send us. Our guide to ${h.a("/buyers/property-records/gis-map/", "the Horry County GIS map")} shows where the county keeps it.`) +
      h.h3("Deed restrictions") +
      h.p(`A deed restriction is a rule recorded with the land. It can bar a mobile home even where the zoning allows one. In our count, ${FL.deed_restrictions.n} Horry land listings mention deed restrictions, and ${FL.mobile_home_allowed.n} are marked as allowing a mobile home. We read the recorded restrictions before you offer. To look up a parcel yourself, use our ${h.a("/buyers/property-records/", "Horry County property records search")}.`) +
      h.h3("Can you live in a camper on your land?") +
      h.p(`Only for part of each month, and only in some places. On land zoned LFA, FA or CFA that touches the Waccamaw River or lies north and west of it, you can keep up to two campers or RVs. The land must have no house or business on it, and you can stay in them up to 15 days a month.`) +
      h.p(`Each camper must be tagged, registered and road-ready, on approved sewer or septic, with permitted power.`) },

    { h2: "Does land in Horry County need road frontage?", toc: "Road access", id: "road", html: () =>
      h.p(`Yes, for a new lot. A new lot must have at least 50 feet of frontage on a street. On a cul-de-sac, 25 feet is enough if the lot is 50 feet wide at the building line.`) +
      h.p(`For a lot with no frontage that existed before the zoning ordinance, the county's planning commission decides whether private access is enough to build.`) +
      h.p(`Along some highways, the front of a lot cannot be built on. Outside the towns, no structure may stand within 60 feet of the right of way of certain highways. They include Highways 701, 905 and 917, and two named stretches of Highway 9.`) +
      h.p(`In our count, ${FL.dirt_road.n} land listings are marked as on a dirt or gravel road, ${FL.private_road.n} on a private road and ${FL.easement_access.n} reached by an easement. For those, we find out who keeps up the road and get a copy of the recorded easement.`) },

    { h2: "Is the land in a flood zone?", toc: "Flood and wetlands", id: "flood", html: (bg) =>
      h.p(`About 1 in ${FLOOD_IN} Horry land listings (${CM.flood_high_risk} of ${CM.listings}) sit in FEMA's high-risk flood zone at the listing's map point, and ${CM.flood_moderate_0_2} more in the moderate zone. A big tract can reach into a flood zone away from that point.`) +
      h.p(`In the unincorporated county, a new home in the high-risk zone must have its lowest floor at least 3 feet above the 100-year flood height. The county ${h.ext(PERMIT_NEEDS, "asks for more papers")} before it issues the permit.`) +
      h.h3("Wetlands") +
      h.p(`If part of a lot may be a wetland, you may need to ask the U.S. Army Corps of Engineers or the state's Bureau of Coastal Management.`) +
      h.p(`${live("/buyers/flood-zone-check/") ? `Our ${h.a("/buyers/flood-zone-check/", "flood zone check guide")} shows how to read a flood map. ` : ""}Our guide to ${h.a("/buyers/undisclosed-flooding/", "finding past flooding")} shows how to learn whether a place has flooded before.`) +
      h.cta("Big tract near a creek or a swamp?", "One map point can miss a flood zone. We look at the flood map across the whole tract, and tell you what a house there needs.", "Have us check the flood map", LEAD, bg) },

    { h2: "What does it cost to build on your own land in Horry County?", toc: "Fees to build", id: "costs", html: () =>
      h.p(`Outside the towns, the state and county fees for a ${n0(SQFT)} square foot house with a septic tank and a well come to about ${money(Math.round(FEES3 / 50) * 50)}. Impact fees and the house itself are extra.`) +
      table(["What you pay for", "What it costs"], [
        ["State septic permit application", "$150"],
        ["State notice for a drinking-water well", "$70, plus the driller"],
        ["County building permit, new house", `20 cents a sq ft for plan review, 50 cents a sq ft at issue, plus $25 for zoning: about ${money(PERMIT)} on ${n0(SQFT)} sq ft`],
        ["County permit, manufactured home", "$150 plus zoning fees, after a $5 registration with the assessor"],
        ["Zoning verification letter", "$25"],
        ["Rezoning, if your plan needs it", "$250 under 5 acres; $500 plus $10 an acre over 5 acres"],
        ["Impact fees", "Charged on new building since October 2021. We get the current amount for your plan."],
      ]) +
      h.p(`For a used manufactured home, all taxes on it must be paid before the county issues the permit.`) +
      h.p(`To buy a builder's house in a new community instead, see our guide to ${h.a("/buyers/new-construction/", "new construction in Horry County")} and the ${h.a("/buyers/new-construction/builders/", "builders who build the most here")}. For what is planned near a tract, see ${h.a("/invest/what-is-being-built/", "what is being built in Horry County")}.`) +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can explain land and construction loans.`) },

    { h2: "Is farm and timber land taxed less in South Carolina?", toc: "Farm land tax", id: "tax", html: (bg) =>
      h.p(`Yes, when it is in real farm or timber use and the owner applies to the assessor. The land is then taxed on its farm-use value, not its market value.`) +
      list([
        `<strong>Timber land</strong> must be 5 acres or more, with trees grown for sale.`,
        `<strong>Other farm land</strong> must be 10 acres or more, or a smaller tract that earned at least $1,000 in gross farm income in three of five years.`,
        `<strong>After a change of use, such as a new house,</strong> the land owes rollback taxes. They are the difference between the farm-use tax and the full tax, for the year of the change and up to three years before it.`,
        `<strong>Your own home and up to 5 acres around it</strong> are taxed at the 4 percent rate when you live there and apply.`,
      ]) +
      h.p(`How the county works out a tax bill is on our ${h.a("/buyers/property-taxes/", "Horry County property tax page")}.`) },
  ],
  faqTitle: "Buying land: questions",
  faq: [
    { q: "Can you do a perc test before buying land in South Carolina?", a: "South Carolina has not used perc tests since the late 1970s. The state's septic permit takes their place: a $150 application with the deed or the lot's survey map, then a soil visit. We can write your offer so it depends on the lot passing." },
    { q: "Where is the cheapest land for sale near Myrtle Beach?", a: `Around Loris, Green Sea and Nichols, where an acre is listed at about ${a36("loris_green_sea_nichols")} on tracts of an acre or more. Around Aynor it is about ${a36("aynor_galivants_ferry")}.` },
    { q: "Can you put a mobile home on land in Horry County?", a: "In the county's FA and CFA zones, yes, on a lot of at least half an acre. In the SF zones, no. Deed restrictions on the land can still bar one." },
    { q: "Is there hunting land for sale in Horry County?", a: `Yes. In our count, ${FL.hunting_land.n} Horry land listings are marked for hunting. Tell us the size and the area you want, and we send you the tracts that fit.` },
    { q: "What does land cost around Pawleys Island?", a: `In the Pawleys Island area, in Georgetown County, an acre is listed at about ${a36("pawleys_island")} on tracts of an acre or more. That is the highest of the areas we counted.` },
  ],
  sources: [
    { name: "SC DES septic FAQ", href: DES_FAQ },
    { name: "septic permit", href: DES_HOME },
    { name: "site inspections", href: DES_SITE },
    { name: "before you buy land", href: DES_LAND },
    { name: "private wells", href: DES_WELL },
    { name: "GSWSA", href: GSWSA },
        { name: "county zoning ordinance", href: ZO },
    { name: "zoning districts", href: ZD },
    { name: "permit fees", href: PERMIT_COST },
        { name: "zoning fees", href: FEES },
    { name: "impact fees", href: IMPACT },
    { name: "flood rules", href: BUILD_SAFE },
    { name: "SC Code 12-43", href: SC_TAX },
    { name: "Horry County GIS", href: GIS_SVC },
    { name: "SC Encyclopedia", href: SCE },
        { name: "SCDNR", href: DNR },
    { name: "Cartwheel Bay", href: CARTWHEEL },
    { name: "boat landings", href: LANDINGS },
  ],
  sourcesNote: "Our counts: CCMLS land listings in aggregate, with the county map's zoning and flood zone at each listing's point.",
  afterSources: () => AFBA + CREDITS + PH.imageSchema([LORIS_REC]),
  bottomCta: { h2: "Know what the land can hold before you offer.", p: "We check the septic, the flood map, the zoning and the road for any tract you send us.", label: "Ask us about a tract", href: LEAD },
  keywords: "land for sale Horry County SC, acreage for sale Horry County, farms for sale Horry County, lots for sale Horry County, cheap land Horry County, land for sale Conway SC, land for sale Loris SC, land for sale Aynor SC, perc test South Carolina, Horry County septic permit, mobile home on land Horry County, buying land in Horry County",
  about: "Land for sale in Horry County, South Carolina: price per acre, septic permits, zoning and building on your own land",
});
