/* /buyers/farms-and-acreage/ - houses on an acre or more in Horry County (small farms, hobby farms, homesteads):
 * where they are, what the middle ask is by lot size and by area, what the county's zoning says about farm
 * animals and farm buildings, wells and septic, farm tax, flood, and what we check.
 *
 * Batch 2026-11-f, Lane N. Plan and ledger: Blog-Brain batches/2026-11-f/farms-and-acreage/ (PLAN.md, facts.md,
 * VERIFY.md). Only VERIFIED rows, and CORRECTED rows at the verifier's wording. Row numbers are given as F<n>.
 * Not used (VERIFY): "from about $460,000 around Loris" and "cheapest big-lot houses" (F5), "the Little Pee Dee
 * runs past Aynor tea-colored" and "Stump since the 1870s" (F18), "the farmland is still here" (F17), "you can
 * build a barn or a shop" (F13), any column letter of the animal chart (F11).
 * Data: data/2026-11-f/farms-and-acreage/ (acreage.json, gis.json). Every count and price is read from those
 * files. No listing, address, MLS number, one home's price or listing photo is on the page.
 * Picture: none licensed for this page; the charts carry it (photo partner's shot list in BUILD.md).
 * Empty land is /buyers/land/'s: this page links to it and never copies its per-acre chart.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/farms-and-acreage/";
const SLUG = "farms-and-acreage";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const to1000 = (v) => "$" + n0(Math.round(v / 1000) * 1000);

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const A = read("acreage.json"), GIS = read("gis.json");
/* F1, F2, F3 */
must(A.unsplit_total === 201 && A.all.n === 201, "F1: 201 houses");
const B = A.by_band;
must(B["1 to 2 acres"].n === 110 && B["2 to 5 acres"].n === 58 && B["5 to 10 acres"].n === 19 && B["10 acres or more"].n === 14, "F1: bands");
must(A.all.price_med === 534900 && B["1 to 2 acres"].price_med === 484450 && B["2 to 5 acres"].price_med === 573450
  && B["5 to 10 acres"].price_med === 579900 && B["10 acres or more"].price_med === 814950, "F2: middle asks");
must(B["10 acres or more"].price_q1 === 668675 && B["10 acres or more"].price_q3 === 1299975, "F2: 10 acres or more, middle half");
must(A.all.acres_med === 1.72, "F3: middle size 1.72 acres");
const FIVE_PLUS = B["5 to 10 acres"].n + B["10 acres or more"].n;
must(FIVE_PLUS === 33, "F1: 33 on 5 acres or more");
/* F4: ZIP-code areas (not the strip's city field). */
const AR = A.by_area;
must(AR["Loris, Green Sea and Nichols"].n === 58 && AR["Loris, Green Sea and Nichols"].price_med === 469900
  && AR["Aynor and Galivants Ferry"].n === 41 && AR["Aynor and Galivants Ferry"].price_med === 489900
  && AR.Conway.n === 60 && AR.Conway.price_med === 545345 && AR.Longs.n === 12 && AR.Longs.price_med === 679900, "F4: areas");
/* F5: tracts of 5 acres or more, by area. */
const A5 = A.by_area_5plus;
must(A5["Loris, Green Sea and Nichols"].n === 13 && A5["Loris, Green Sea and Nichols"].price_med === 487900
  && A5.Conway.n === 9 && A5.Conway.price_med === 830000 && A5.Longs.n === 6 && A5.Longs.price_med === 754900, "F5: 5 acres or more by area");
/* F6 */
must(A.under_150k === 1, "F6: 1 under $150,000");
/* F7, F8: the county map at each house's point. */
const Z = GIS.zoning_at_point;
const FARM_ZONES = Z.FA + Z.CFA + Z.LFA;
must(Z.FA === 106 && Z.CFA === 22 && Z.LFA === 17 && FARM_ZONES === 145 && GIS.pins_total === 201, "F7: 145 of 201 in FA, CFA or LFA");
must(GIS.town_at_point.unincorporated === 187, "F7: 187 outside any town");
const FL = GIS.flood_zone_at_point;
must(FL.AE === 8 && FL["0.2 PCT ANNUAL CHANCE FLOOD HAZARD"] === 5 && FL.none === 188, "F8: flood");
const FARM10 = Math.round(FARM_ZONES / GIS.pins_total * 10); /* 72 percent: 7 in 10 */
must(FARM10 === 7, "F7: 7 in 10");

/* The month of the count, from the data file (never typed). */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pm = String(A.read).match(/^(\d{4})-(\d{2})-/);
must(pm, "acreage.json: no read date");
const COUNTED = `${MONTHS[+pm[2] - 1]} ${pm[1]}`;

/* ---------------------------------------------------------------------------- */
/* Links.                                                                         */

const LEAD = "/contact/", CONTACT = "/contact/";
const ZO = "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf";
const DES_FAQ = "https://des.sc.gov/permits-regulations/septic-tanks/homeowner-resources/septic-tanks-frequently-asked-questions";
const DES_HOME = "https://des.sc.gov/permits-regulations/septic-tanks/permits-licenses/septic-tanks-residential-single-home-builder";
const DES_WELL = "https://des.sc.gov/programs/bureau-water/residential-wells/private-drinking-water-wells";
const SC_TAX = "https://www.scstatehouse.gov/code/t12c043.php";
const GIS_SVC = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const SCE = "https://www.scencyclopedia.org/sce/entries/horry-county/";
const STUMP = "https://scencyclopedia.org/sce/entries/galivants-ferry-stump-meeting/";
const CARTWHEEL = "https://www.sctrails.net/trails/trail/cartwheel-bay-heritage-preserve";
const LANDINGS = "https://www.horrycountysc.gov/departments/parksandrecreation/boat-landings/";

const SITE_ROOT = path.join(__dirname, "..", "chapter3realty");
const live = (u) => fs.existsSync(path.join(SITE_ROOT, ...u.split("/").filter(Boolean), "index.html"));

/* The photo: the USDA NAIP aerial of country outside Loris, public domain, already on the site for /buyers/land/
   (its record: data/2026-11-d/land/photos.json). The same file is reused; nothing new is copied. */
const REC = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-d", "land", "photos.json"), "utf8")).photos
  .find((r) => /country-land-outside-loris-from-above\.webp$/.test(r.file));
must(REC && REC.license === "Public domain", "the NAIP aerial record");

/* ---------------------------------------------------------------------------- */
/* Styles, scoped to main#main. Tables plain under thin rules.                     */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.25rem,2.4vw,2.1rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} h2{text-wrap:balance}`
  + `${S} ul.ld-list{list-style:none;margin:.6rem 0 1.3rem;padding:0;max-width:720px}`
  + `${S} ul.ld-list>li{margin:0;padding:.75rem 0;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} ul.ld-list>li:last-child{border-bottom:${RULE}}${S} ul.ld-list strong{color:var(--navy)}`
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}${TBL} td:first-child{color:var(--navy)}`
  + `@media (max-width:599px){${TBL} table,${TBL} tbody,${TBL} tr,${TBL} td{display:block;width:100%}${TBL} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TBL} tr{padding:.65rem 0;border-bottom:${RULE}}${TBL} td{border:0!important;padding:.1rem 0!important}${TBL} td:first-child{font-weight:650}`
  + `${TBL} td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-weight:500}}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero>figcaption{padding:0!important}`
  + `${S} figure.c3ph-hero img{aspect-ratio:4/3!important}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

const table = (head, rows) => h.table(head, rows).replace(/<tbody>([\s\S]*)<\/tbody>/, (m, body) => "<tbody>" + body.replace(/<tr>([\s\S]*?)<\/tr>/g, (r, cells) => {
  let i = 0;
  return "<tr>" + cells.replace(/<td ([^>]*)>/g, (t, attrs) => { const l = head[i++]; return i === 1 ? t : `<td ${attrs} data-l="${l}">`; }) + "</tr>";
}) + "</tbody>");
const list = (items) => `<ul class="ld-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

/* ---------------------------------------------------------------------------- */
/* Charts (F2, F4).                                                               */

const CHART_SIZE = G.bars([
  ["1 to 2 acres", B["1 to 2 acres"]], ["2 to 5 acres", B["2 to 5 acres"]],
  ["5 to 10 acres", B["5 to 10 acres"]], ["10 acres or more", B["10 acres or more"]],
].map(([name, r]) => ({ name, value: r.price_med, valueText: to1000(r.price_med), feature: `${r.n} houses` })), {
  caption: "The middle ask by lot size, for houses on an acre or more",
  note: `Middle asking price of a house on the lot size shown, Horry County, from our count in ${COUNTED}. The 10 acres or more bar rests on ${B["10 acres or more"].n} houses, with a middle half from ${to1000(B["10 acres or more"].price_q1)} to ${to1000(B["10 acres or more"].price_q3)}.`,
  nameLabel: "Lot size", featureLabel: "houses for sale", valueLabel: "Middle asking price", compact: true,
});

/* ---------------------------------------------------------------------------- */
/* Homes strips. Every search read ok on the live site, 2026-11-17 (BUILD.md).      */

const BASE = "type=house&has=county_horry";
const SQ = (extra, t, has) => G.homesQ(`type=house&${extra}&has=county_horry${has ? "," + has : ""}`, t);
const STRIP_ALL = SQ("lotMin=1", "Houses on an acre or more in Horry County");
const STRIP_5 = SQ("lotMin=5", "Houses on five acres or more");
const STRIP_10 = SQ("lotMin=10", "Houses on ten acres or more");
const STRIP_LORIS = SQ("city=Loris&lotMin=1", "An acre or more around Loris");
const STRIP_AYNOR = SQ("city=Aynor&lotMin=1", "An acre or more in Aynor");
const STRIP_CONWAY = SQ("city=Conway&lotMin=1", "An acre or more around Conway");
const STRIP_LONGS = SQ("city=Longs&lotMin=1", "An acre or more in Longs");
const STRIP_BARN = SQ("lotMin=1", "Houses with a barn on the property", "barn");
const STRIP_SHOP = SQ("lotMin=1", "Houses with a workshop", "workshop");
const STRIP_POND = SQ("lotMin=1", "Houses with a pond on the property", "pond_on_property");
const STRIP_WELL = SQ("lotMin=1", "Houses on a private well", "well_water");
const WELL43 = 43; /* live strip total, VERIFY row 9, re-read 2026-11-17 */
const STRIP_UNDER = G.homesQ("type=house&lotMin=1&max=450000&has=county_horry", "An acre or more for $450,000 or less");

/* ---------------------------------------------------------------------------- */
/* The affiliated business disclosure (the wording on /buyers/programs/).         */

const AFBA = `<div id="afba" style="margin:1.4rem 0 3rem;max-width:640px"><p style="font-size:1rem;color:var(--muted);line-height:1.7;margin-bottom:.4rem"><strong style="color:var(--navy)">Affiliated Business Arrangement Disclosure.</strong> Chapter3 Realty Corp has a business relationship with BrickWood Mortgage (NMLS #189497). Because of this relationship, referrals to BrickWood Mortgage may provide Chapter3 Realty a financial or other benefit.</p>`
  + `<p style="font-size:1rem;color:var(--muted);line-height:1.7">You are NOT required to use BrickWood Mortgage as a condition for the purchase, sale, or refinance of any property. There are frequently other settlement service providers available with similar services. You are free to shop around to determine that you are receiving the best services and the best rate for those services.</p></div>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buy", url: "/buyers/" },
  title: "Farms and Acreage for Sale in Horry County, SC",
  description: "Houses on an acre or more for sale in Horry County: where they are, what they cost by lot size, and what zoning, wells and septic mean for animals and barns.",
  ogTitle: "Farms and acreage for sale in Horry County: where the houses with land are, what they cost, and what you can keep on them",
  crumb: "Farms and acreage",
  eyebrow: "Buying a house with land",
  h1: "Farms and acreage for sale in Horry County, SC",
  h1em: "Houses with room for animals, a garden and a shop.",
  sub: `Hobby farms, homesteads and small acreage in Horry County: ${GIS.pins_total} houses on an acre or more, with room for animals, a garden and a shop.`,
  heroMedia: CSS + `<p style="font-size:1.1rem;line-height:1.6;color:var(--navy);margin:0 0 1rem;max-width:720px">Houses on an acre or more are in Horry County's rural west and north, around Loris, Aynor, Conway and Longs, not at the beach.</p>` + G.homesCss() + G.homesQScript() + STRIP_ALL,
  heroCta: { title: "Found a farm or a house with acres? We check the zoning for your animals, the septic, the well and the flood map before you offer.", label: "Have us check a farm", href: CONTACT },
  topOfferLine: "Found a house with acres? We check zoning, septic, well and flood first.",
  author: "devin",
  shortAnswer: [
    `About ${FARM10} in 10 sit in the county's farm zones, where farm animals need 1 1/2 acres or more.`,
    `A house on five acres or more is rarer: ${FIVE_PLUS} are for sale. Before you offer, check the zoning for your animals, the septic permit, the well and the flood map. We check all of them for you.`,
  ],
  sections: [
    { h2: "Where are the farms and small acreage near Myrtle Beach?", toc: "Where the farms are", id: "where", html: () =>
      h.p(`Horry County grew more tobacco than any other county in South Carolina by the 1920s, says the ${h.ext(SCE, "SC Encyclopedia")}.`) +
      h.p(`Of the ${A.unsplit_total} houses, ${GIS.town_at_point.unincorporated} sit outside any town, at the house's map point. The middle lot is ${A.all.acres_med} acres.`) +
      h.p(`The areas above are ZIP code groups, so a search by town shows fewer houses than the chart for Loris and Aynor. Only ${AR["Little River"].n + AR["North Myrtle Beach"].n + AR["Murrells Inlet and Garden City"].n} houses on an acre or more are for sale in Little River, North Myrtle Beach, Murrells Inlet and Garden City together.`) +
      h.h3("Around Loris") +
      h.p(`The Loris, Green Sea and Nichols ZIP codes have ${AR["Loris, Green Sea and Nichols"].n} houses on an acre or more, 48 of them listed in Loris itself. The middle ask there is about ${to1000(AR["Loris, Green Sea and Nichols"].price_med)}, the lowest of the four areas. West of Loris, ${h.ext(CARTWHEEL, "Cartwheel Bay Heritage Preserve")} has a 3.5-mile trail where wild Venus flytraps grow. Our ${h.a("/submarkets/loris/", "Loris guide")} covers the town.`) +
      STRIP_LORIS +
      h.h3("Around Aynor") +
      h.p(`Galivants Ferry is where US 501 crosses the Little Pee Dee River, and the county keeps a public ${h.ext(LANDINGS, "boat landing")} on each side of the bridge. The ${h.ext(STUMP, "Galivants Ferry Stump meeting")} began with the 1876 campaign of Wade Hampton. The Aynor and Galivants Ferry ZIP codes have ${AR["Aynor and Galivants Ferry"].n} houses on an acre or more, 13 of them listed in Aynor itself. The middle ask there is about ${to1000(AR["Aynor and Galivants Ferry"].price_med)}.`) +
      STRIP_AYNOR +
      h.h3("Around Conway") +
      h.p(`The Conway ZIP codes have the most houses of the four areas, ${AR.Conway.n}, with a middle lot of ${AR.Conway.acres_med} acres. Our ${h.a("/submarkets/conway/", "Conway guide")} covers the town and its edges.`) +
      STRIP_CONWAY +
      h.h3("Around Longs") +
      h.p(`Longs has fewer houses on acres, and bigger lots: the middle lot is ${AR.Longs.acres_med.toFixed(1)} acres, and the middle ask is about ${to1000(AR.Longs.price_med)}. Our ${h.a("/submarkets/longs/", "Longs guide")} covers the town.`) +
      STRIP_LONGS },

    { h2: "How much does a house on an acre, five acres or ten acres cost?", toc: "What it costs", id: "cost", html: () =>
      h.p(`The middle ask for a house on an acre or more in Horry County is about ${to1000(A.all.price_med)}. Half the houses ask between ${to1000(A.all.price_q1)} and ${to1000(A.all.price_q3)}. These are asking prices, not sale prices.`) +
      CHART_SIZE +
      h.p(`A house on 1 to 2 acres has a middle ask of about ${to1000(B["1 to 2 acres"].price_med)}. Most houses on acres are on small acreage: ${B["1 to 2 acres"].n} of the ${A.unsplit_total} are on 1 to 2 acres.`) +
      h.p(`A house on five acres or more is rarer. ${FIVE_PLUS} are for sale, ${B["10 acres or more"].n} of them on ten acres or more.`) +
      STRIP_5 + STRIP_10 +
      h.p(`Around Loris, ${A5["Loris, Green Sea and Nichols"].n} houses on five acres or more have a middle ask of about ${to1000(A5["Loris, Green Sea and Nichols"].price_med)}. Around Conway, ${A5.Conway.n} have about ${to1000(A5.Conway.price_med)}. Around Longs, ${A5.Longs.n} have about ${to1000(A5.Longs.price_med)}. Of those three areas, Loris has the lowest middle ask.`) +
      h.p(`Only ${A.under_150k} of the ${A.unsplit_total} asks under $150,000. If a price looks low for a farm, we find out why before you spend time on it.`) +
      STRIP_UNDER +
      h.p(`For empty land with no house, see our guide to ${h.a("/buyers/land/", "land for sale in Horry County")}.`) },

    { h2: "Can I keep horses or farm animals on my land in Horry County?", toc: "Animals", id: "animals", html: () =>
      h.p(`Maybe, and it depends on the county's zoning district and the size of the lot. The county zoning ordinance lists a smallest lot for a building that holds farm animals. In the farm districts, farm animals are a conditional use, which means the county signs off.`) +
      table(["Zoning district", "Smallest lot for a farm animal building"], [
        ["FA, CFA and LFA (the county's farm and forest zones)", "1 1/2 acres"],
        ["AG2, AG6 and AG7", "1 1/2 acres"],
        ["RE (Rural Estates)", "3 acres"],
        ["AG4 and AG5", "5 acres"],
        ["AG1", "20 acres"],
        ["SF and MSF districts, horses only", "3 acres"],
      ]) +
      h.p(`${FARM_ZONES} of the ${GIS.pins_total} houses, about ${FARM10} in 10, sit in FA, CFA or LFA at the house's map point. ${GIS.zoning_at_point.none} sit where the county map shows no county zoning code, such as inside a town.`) +
      h.p(`The estate districts (AG4 and AG5) and the ranchette districts (AG6 and AG7) allow farming for the residents' own pleasure, and no commercial farming. In all four, the raising and care of swine is prohibited. Rural Estates allows livestock to make a farm self-sustaining, not to the point where it creates a public nuisance or health hazard.`) +
      h.p(`${h.ext(ZO, "The ordinance")} says animals must meet the smallest lot size in the table. The table says "farm animals" and "horses". We read the ordinance for your district and tell you what it says about your animals.`) +
      STRIP_BARN +
      h.cta("Picked a house with land for animals?", "Tell us the animals you plan to keep. We look up the zoning district, read the ordinance for it and ask the county before you offer.", "Have us check a farm for you", LEAD, "") },

    { h2: "Can I build a barn or a workshop on my land?", toc: "Barns and shops", id: "barns", html: () =>
      h.p(`A farm building in the farm districts has lighter rules. Greenhouses, open sheds, tobacco or bulk barns, packhouses and pump sheds count as farm buildings when they serve a real farm use. This holds in LFA, FA, CFA and AG1 to AG7. They should be shown on a plan. They do not have to meet the structure spacing rules. They must still meet the district's setbacks from the property line.`) +
      h.p(`That list does not name a house, a garage or a workshop. We ask the county about a workshop or a second home on the lot before you offer.`) +
      STRIP_SHOP +
      STRIP_POND },

    { h2: "Do I need a well and a septic tank on a farm?", toc: "Wells and septic", id: "well-septic", html: () =>
      h.p(`Where no public sewer or water reaches the lot, the house needs a septic tank or a well. Our ${h.a("/buyers/land/", "land guide")} has the full steps.`) +
      h.p(`South Carolina does not use perc tests. A state inspector reads the soil, and where no sewer reaches the lot, the state's septic permit comes before the county's building permit. The ${h.ext(DES_FAQ, "state's septic page")} explains it.`) +
      h.p(`The septic system must sit at least 75 feet from a private well. A new well needs a state notice of intent, $70 for a drinking well or $50 for an irrigation well, and a South Carolina certified driller.`) +
      h.p(`On a house that is already built, we read the septic permit on file and ask for a well test before you offer.`) +
      STRIP_WELL },

    { h2: "Do farms pay less property tax?", toc: "Farm tax", id: "tax", html: () =>
      h.p(`Only land in real farm use, and only when the owner applies. Your home and up to 5 acres around it are taxed at the 4 percent rate when you live there and apply.`) +
      h.p(`Farm land generally needs 10 acres or more, or a smaller tract with farm income. Timber needs 5 acres or more. When the use changes, rollback taxes apply. The ${h.ext(SC_TAX, "state code")} has these rules. How the county works out a bill is on our ${h.a("/buyers/property-taxes/", "property tax page")}.`) },

    { h2: "Is a farm in a flood zone?", toc: "Flood", id: "flood", html: () =>
      h.p(`${FL.AE} of the ${GIS.pins_total} houses sit in a high-risk (AE) flood zone at the house's map point, and ${FL["0.2 PCT ANNUAL CHANCE FLOOD HAZARD"]} more in the moderate zone. A big tract can reach into a flood zone away from that point.`) +
      h.p(`${live("/buyers/flood-zone-check/") ? `Our ${h.a("/buyers/flood-zone-check/", "flood zone check guide")} shows how to read the map. ` : ""}On acreage we look at the flood map across the whole tract, not one point.`) },

    { h2: "What do we check before you offer on a farm?", toc: "What we check", id: "check", html: () =>
      list([
        `<strong>The zoning district,</strong> and what it says about your animals and buildings.`,
        `<strong>The septic permit,</strong> and the well and its test.`,
        `<strong>The flood map,</strong> across the whole tract.`,
        `<strong>Road access,</strong> and who keeps up the road.`,
        `<strong>Farm-use tax status,</strong> and what changes when you buy.`,
      ]) +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can explain loans for a house on acreage.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}.`) /* end forsale-links */ },
  ],
  faqTitle: "Farms and acreage: questions",
  faq: [
    { q: "Where are the farms for sale near Myrtle Beach?", a: `Houses on an acre or more are around Loris, Aynor, Conway and Longs, west and north of the beach towns. We count ${A.unsplit_total} in Horry County now, and ${FIVE_PLUS} of them on five acres or more.` },
    { q: "How much does a house with five acres cost in Horry County?", a: `The middle ask on five acres or more is about ${to1000(B["5 to 10 acres"].price_med)} for 5 to 10 acres. On ten acres or more it is about ${to1000(B["10 acres or more"].price_med)}, from ${B["10 acres or more"].n} houses.` },
    { q: "Can I keep horses or cattle in Horry County?", a: `In the farm districts, farm animals are a conditional use on 1 1/2 acres or more. Other districts need 3, 5 or 20 acres. We check your district and your animals before you offer.` },
    { q: "Do farms in Horry County have a well and septic?", a: `${WELL43} of the ${A.unsplit_total} are listed with well water. A septic system needs the state's permit, and a new well needs a state notice and a certified driller.` },
    { q: "Do I pay less tax on a farm?", a: `Only land in real farm use that the owner has applied for, generally 10 acres or more. Your home and up to 5 acres around it are taxed at the 4 percent rate when you live there and apply.` },
  ],
  sources: [
    { name: "county zoning ordinance", href: ZO },
    { name: "SC DES septic FAQ", href: DES_FAQ },
    { name: "septic permit", href: DES_HOME },
    { name: "private wells", href: DES_WELL },
    { name: "SC Code 12-43", href: SC_TAX },
    { name: "Horry County GIS", href: GIS_SVC },
    { name: "SC Encyclopedia, Horry County", href: SCE },
    { name: "Galivants Ferry Stump", href: STUMP },
    { name: "boat landings", href: LANDINGS },
    { name: "Cartwheel Bay", href: CARTWHEEL },
  ],
  sourcesNote: "Our counts: CCMLS house listings of an acre or more in Horry County in aggregate, with the county map's zoning and flood zone at each listing's point.",
  pageImages: () => PH.pageImages(REC),
  afterSources: () => AFBA,
  bottomCta: { h2: "Know what the land can hold before you offer.", p: "We check the zoning for your animals, the septic, the well and the flood map on any farm you send us.", label: "Ask us about a farm", href: LEAD },
  keywords: "farms for sale Horry County SC, small farms for sale near Myrtle Beach, hobby farms for sale South Carolina, houses with acreage Horry County, homesteads for sale near me, houses with land Horry County, farm land for sale Conway SC, farms for sale Loris SC",
  about: "Houses on an acre or more for sale in Horry County, South Carolina: small farms, hobby farms and homesteads",
});
