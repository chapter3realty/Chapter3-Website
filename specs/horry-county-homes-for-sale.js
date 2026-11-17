/* /submarkets/homes-for-sale/ - Horry County, SC homes for sale: a listing-first page. The homes are the page:
 * live strips by newest, price, bedrooms, new construction, what the place has, and condos; short answers between
 * them (what houses sold for, what a year costs to own, which towns are in the county, one offer); the town guide at the end.
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/horry-county-homes-for-sale/facts.md, VERIFIED rows, and CORRECTED
 * rows at the verifier's values and wording (VERIFY.md): the "house" deeds include townhomes on their own lots and are
 * labelled so; no city lived-in tax figure (row 15 struck); outside-the-city tax is the county fire district; no "oceanfront
 * charges the most"; HOA is a sample, "on the listing sheets we read", ranges only; Garden City is "near", not "in".
 * Data: data/2026-11-f/horry-county-homes-for-sale/. Listing counts move daily, so the page prints none for a strip.
 * Pictures: no photo or map on the page (owner, 2026-11-17); two charts (middle price by town, sold-price bands).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, placesMap } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/homes-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "horry-county-homes-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const DD = read("findings-deeds.json"), FL = read("flood-county.json"), TX = read("tax.json"), CP = read("county-pull.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const must = (ok, msg) => { if (!ok) throw new Error(`horry-county-homes-for-sale.js: ${msg}`); };

must(AIR.license === "Public domain", "the aerial photo record is missing");
/* Rows 1, 3 (VERIFIED): about 2,900 houses, 2,700 condos, 300 townhouses; asking middle $419,000, half $319,880 to $599,900. */
must(Math.round(CP.inside_by_kind.house / 100) === 29 && Math.round(CP.inside_by_kind.condo / 100) === 27 && Math.round(CP.inside_by_kind.townhouse / 100) === 3, "row 1 changed");
must(CP.asking.house.median === 419000 && CP.asking.condo.median === 218000, "row 3 changed");
/* Row 5 (CORRECTED label): 10,212 deeds on single-family and own-lot townhome parcels; middle $349,000; middle half $280,000 to $471,500. */
must(DD.houses.count === 10212 && DD.houses.median === 349000 && DD.houses.p25 === 280000 && DD.houses.p75 === 471500, "row 5 changed");
/* Row 6 (CORRECTED label): five bands. */
const PB = DD.house_price_bands;
const BANDS = [PB["0-200000"], PB["200000-300000"], PB["300000-400000"], PB["400000-500000"], PB["500000-1000000000"]];
must(BANDS.join() === "460,2832,3182,1495,2243", "row 6 changed");
/* Row 7 (CORRECTED label): middle sale price by postal city. */
const PC = DD.houses_by_postal_city;
const TOWN = { "Loris": [278500, 356], "Conway": [305750, 2155], "Aynor": [309995, 158], "Longs": [319000, 1260], "Little River": [350000, 668],
  "Myrtle Beach": [395000, 3294], "Murrells Inlet": [400000, 609], "Surfside Beach": [410000, 422], "North Myrtle Beach": [540000, 839] };
for (const [t, [m, c]] of Object.entries(TOWN)) must(PC[t].median === m && PC[t].count === c, `row 7 changed: ${t}`);
must(DD.houses_by_zip["29579"].median === 410000 && DD.houses_by_zip["29579"].count === 1415, "row 7 changed: 29579");
/* Row 8 (VERIFIED): 540,000 / 278,500 = 1.94. */
must(Math.round(540000 / 278500 * 10) / 10 === 1.9, "row 8 changed");
/* Row 9 (VERIFIED, limit): 4,456 recorded condo sales; middle $215,000. */
must(DD.condos_all_county.count === 4456 && DD.condos_all_county.median === 215000, "row 9 changed");
/* Row 10 (CORRECTED label): D.R. Horton 1,115 of 10,212. */
must(DD.houses_by_seller["D.R. Horton"] === 1115, "row 10 changed");
/* Row 12 (VERIFIED, limit): 435 of 9,939 parcels in a FEMA high-risk zone, about 4 in 100. */
must(FL.houses === 9939 && FL.in_high_risk_zone === 435, "row 12 changed");
/* Row 16 (PARTLY): the county fire district figures and the 6 percent city figure; the 4 percent city figure is struck. */
must(Math.round(TX.unincorporated_4pct) === 1372 && Math.round(TX.unincorporated_6pct) === 4298 && Math.round(TX.myrtle_beach_city_6pct) === 5331, "row 16 changed");

const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;object-position:50% 55%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:3/1}main#main .ww-hero figcaption{display:none}main#main .detail-hero .ww-hero{margin-bottom:.9rem!important}}
@media (max-width:479px){main#main .ww-hero img{aspect-ratio:5/1}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:4/1}main#main .detail-hero .detail-media{max-width:1100px!important}}
main#main .c3-gchart,main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.4rem 0 1.4rem}
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
main#main .c3-glance li,main#main .c3-glance li *{line-height:1.45!important}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

const CONTACT = `/contact/?place=${encodeURIComponent("Horry County")}`;
/* glass.js homesQ does not list "zip" among its keys, though /homes/api/strip reads it (checked live). A zip strip is the same
 * markup, built here with homesQ's own title checks left to a stand-in search; reported to the lead. */
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const S = (q, head) => {
  if (!/(^|&)zip=\d{5}(&|$)/.test(q)) return G.homesQ(q, head);
  G.homesQ(q.replace(/zip=\d{5}/, "city=Conway"), head);
  return `<div class="hx-strip hx-qs" data-q="${esc(new URLSearchParams(q).toString())}" data-head="${esc(head)}"></div>`;
};
const NOTE = (t) => `<p class="pp-note">${t}</p>`;
const MB = "city=Myrtle%20Beach", NMB = "city=North%20Myrtle%20Beach", LR = "city=Little%20River", CF = "zip=29579", GC = "near=33.5995,-79.0045&miles=2";

/* Row 8: the wow chart, the middle sale price of a house by town. */
const TOWN_PAGE = { "Loris": "/submarkets/loris/", "Conway": "/submarkets/conway/", "Longs": "/submarkets/longs/", "Little River": "/submarkets/little-river/",
  "Myrtle Beach": "/submarkets/myrtle-beach/", "Murrells Inlet": "/submarkets/murrells-inlet/", "Surfside Beach": "/submarkets/surfside-beach/",
  "North Myrtle Beach": "/submarkets/north-myrtle-beach/" };
const TOWN_BARS = G.bars(Object.entries(TOWN).sort((a, b) => a[1][0] - b[1][0]).map(([t, [m, c]]) =>
  Object.assign({ name: t, value: m, valueText: `$${n(m)}` }, TOWN_PAGE[t] ? { href: TOWN_PAGE[t] } : {})), {
  caption: "What a house sold for, by town",
  nameLabel: "Town", valueLabel: "Middle sale price", compact: true,
  note: "The middle price of the houses that sold in the past 12 months, by postal city. Houses include townhomes on their own lots. Murrells Inlet counts its Horry County side only.",
});

/* Row 6: house sales by price band. */
const SOLD_BANDS = (() => {
  const labs = ["Under $200,000", "$200,000 to $299,999", "$300,000 to $399,999", "$400,000 to $499,999", "$500,000 and up"];
  const MAXV = Math.max(...BANDS), W = 640, H = 300, bw = 82, gap = 28, x0 = 20, base = 235, top = 40;
  const cols = BANDS.map((v, i) => {
    const x = x0 + i * (bw + gap), hh = Math.round((base - top) * v / MAXV), y = base - hh;
    const words = labs[i].replace(" to ", " to|").replace("Under ", "Under|").replace(" and up", "|and up").split("|");
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="8" fill="#b8863b"/>`
      + `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-weight="700" font-size="20" fill="#1c2028">${n(v)}</text>`
      + words.map((w, k) => `<text x="${x + bw / 2}" y="${base + 24 + k * 19}" text-anchor="middle" font-size="15" fill="#4a5060">${w}</text>`).join("");
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Houses sold in Horry County in the past year by sale price: ${BANDS.map((v, i) => `${n(v)} ${i === 0 ? "under $200,000" : i === 4 ? "at $500,000 and up" : "from " + labs[i]}`).join(", ")}." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Horry County houses sold by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">Most Horry County houses sold for $200,000 to $399,999</p>${svg}<figcaption>${n(DD.houses.count)} houses sold in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();

/* Row 2: homes for sale by town and kind, to the nearest 10. */
const BY = CP.inside_by_mls_city;
const r10 = (v) => n(Math.round(v / 10) * 10);
const kind = (c, k) => (BY[c] && BY[c][k]) || 0;
const TOWN_ROWS = [
  ["Myrtle Beach", "/submarkets/myrtle-beach/homes-for-sale/"], ["North Myrtle Beach", "/submarkets/north-myrtle-beach/"],
  ["Conway", "/submarkets/conway/homes-for-sale/"], ["Little River", "/submarkets/little-river/homes-for-sale/"],
  ["Longs", "/submarkets/longs/"], ["Surfside Beach", "/submarkets/surfside-beach/"], ["Loris", "/submarkets/loris/"], ["Murrells Inlet", "/submarkets/murrells-inlet/"],
].map(([c, u]) => [h.a(u, c), r10(kind(c, "house")), kind(c, "condo") ? r10(kind(c, "condo")) : "–"]);
/* The county's towns on one map (P8). Town centers; a name with no room is listed in the key. */
const COUNTY_MAP = placesMap("Horry County towns", [
  { name: "Myrtle Beach", lat: 33.6891, lon: -78.8867, href: "/submarkets/myrtle-beach/" },
  { name: "North Myrtle Beach", lat: 33.8160, lon: -78.6800, href: "/submarkets/north-myrtle-beach/" },
  { name: "Conway", lat: 33.8360, lon: -79.0478, href: "/submarkets/conway/" },
  { name: "Little River", lat: 33.8710, lon: -78.6270, href: "/submarkets/little-river/" },
  { name: "Longs", lat: 33.9160, lon: -78.7170, href: "/submarkets/longs/" },
  { name: "Loris", lat: 34.0555, lon: -78.8900, href: "/submarkets/loris/" },
  { name: "Carolina Forest", lat: 33.7600, lon: -78.9500, href: "/submarkets/carolina-forest/" },
  { name: "Surfside Beach", lat: 33.6070, lon: -78.9730, href: "/submarkets/surfside-beach/" },
  { name: "Murrells Inlet", lat: 33.5513, lon: -79.0390, href: "/submarkets/murrells-inlet/" },
], { caption: "Map of the Horry County towns on this page.", glass: true }).html;
const HOUSES_N = Math.round(CP.inside_by_kind.house / 100) * 100;

const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  fee: "https://www.horrycountysc.gov/departments/stormwater/utility-fee/",
  census: "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/11",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Towns", url: "/submarkets/" },
  title: "Horry County SC Homes for Sale, Live From the MLS",
  description: "Horry County, SC homes for sale, live from the MLS: new houses, price bands, towns, waterfront and condos, what houses sold for and what a year costs.",
  ogTitle: "Horry County, SC homes for sale: see the houses, then the town that fits",
  crumb: "Homes for sale",
  eyebrow: "Horry County, SC homes for sale",
  h1: "Horry County, SC homes for sale:",
  h1em: "see the houses, then pick the town.",
  sub: "Houses, townhomes and condos for sale in Horry County, live from the MLS, town by town, with what houses sold for.",
  heroMedia: CSS + G.homesCss() + G.homesQScript() + S(`type=house&domMax=14`, "The newest homes for sale in Horry County") + glance([
    { icon: "home", label: "Houses for sale", text: `About ${n(HOUSES_N)}` },
    { icon: "dollar", label: "Sold, middle price", text: "About $349,000" },
    { icon: "flood", label: "In a flood zone", text: "About 4 in 100" },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `About ${n(HOUSES_N)} houses, 2,700 condos and 300 townhouses are for sale in Horry County today. The town you pick changes the price as much as the house does, and the strips below show homes town by town.`,
  ],
  sections: [
    { h2: "What Horry County homes for sale were listed this week?", toc: "Newest", id: "newest", html: () =>
      S(`${MB}&type=house&domMax=7`, "The newest Myrtle Beach houses, listed this week") +
      S(`city=Conway&type=house&domMax=7`, "The newest Conway houses, listed this week") +
      S(`city=Longs&type=house&domMax=7`, "The newest Longs houses, listed this week") +
      S(`${CF}&type=house&domMax=7`, "The newest Carolina Forest houses, listed this week") +
      S(`${LR}&type=house&domMax=7`, "The newest Little River houses, listed this week") +
      h.p(`The newest houses, town by town. Each strip links to every home in that town. A Myrtle Beach address is often outside the city, in Carolina Forest or Socastee.`) },

    { h2: "How much do homes cost in Horry County, town by town?", toc: "Prices", id: "prices", html: () =>
      h.p(`A house in North Myrtle Beach sold for a middle price of $540,000 in the past year. A house in Loris sold for about $279,000. The North Myrtle Beach price is 1.9 times the Loris price, and both towns are in Horry County.`) +
      TOWN_BARS +
      h.h3(`Houses under $300,000`) +
      h.p(`The strips below show houses under $300,000 in Longs, Loris and Myrtle Beach.`) +
      S(`city=Longs&type=house&max=299999`, "Longs houses under $300,000") +
      S(`city=Loris&type=house&max=299999`, "Loris houses under $300,000") +
      S(`${MB}&type=house&max=299999`, "Myrtle Beach houses under $300,000") +
      h.h3(`Houses from $300,000 to $499,999`) +
      h.p(`The strips below show houses from $300,000 to $499,999 in Little River, Carolina Forest and Surfside Beach.`) +
      S(`${LR}&type=house&min=300000&max=499999`, "Little River houses from $300,000 to $499,999") +
      S(`${CF}&type=house&min=300000&max=499999`, "Carolina Forest houses from $300,000 to $499,999") +
      S(`city=Surfside%20Beach&type=house&min=300000&max=499999`, "Surfside Beach houses from $300,000 to $499,999") +
      h.h3(`Houses at $500,000 and up`) +
      h.p(`The strips below show houses at $500,000 and up in North Myrtle Beach and Myrtle Beach.`) +
      S(`${NMB}&type=house&min=500000`, "North Myrtle Beach houses at $500,000 and up") +
      S(`${MB}&type=house&min=500000`, "Myrtle Beach houses at $500,000 and up") +
      h.p(`Across the county, the middle asking price of a house is about $419,000, and the middle half ask about $320,000 to $600,000. Asking price is not sale price. The sold-prices section below shows what houses sold for.`) },

    { h2: "Which Horry County homes have 5 bedrooms or more?", toc: "Bedrooms", id: "beds", html: () =>
      h.p(`The strips below show houses with 5 bedrooms or more in Carolina Forest and Longs.`) +
      S(`${CF}&type=house&beds=5`, "Carolina Forest houses with 5 or more bedrooms") +
      S(`city=Longs&type=house&beds=5`, "Longs houses with 5 or more bedrooms") },

    { h2: "Are there new homes for sale in Horry County?", toc: "New homes", id: "new", html: () =>
      h.p(`Yes. The strips show new construction in Longs, Loris and Carolina Forest.`) +
      S(`city=Longs&type=house&has=new_construction`, "New-construction houses in Longs") +
      S(`city=Loris&type=house&has=new_construction`, "New-construction houses in Loris") +
      S(`${CF}&type=house&has=new_construction`, "New-construction houses in Carolina Forest") +
      h.p(`Our ${h.a("/buyers/new-construction/builders/", "builders guide")} compares the builders, and our ${h.a("/buyers/new-construction/", "new construction guide")} covers what to check before you sign.`) },

    { h2: "Which Horry County homes have water, golf, land or one level?", toc: "What it has", id: "has", html: () =>
      h.h3(`On the water`) + h.p(`Houses on a canal, the Intracoastal Waterway, a river or a lake.`) +
      S(`${MB}&type=house&waterfront=1`, "Myrtle Beach houses on the water") +
      S(`city=Longs&type=house&waterfront=1`, "Longs houses on the water") +
      S(`${LR}&type=house&waterfront=1`, "Little River houses on the water") +
      h.h3(`Golf communities`) + h.p(`Houses in a community built around a golf course.`) +
      S(`${MB}&type=house&has=golf_community`, "Myrtle Beach houses in golf communities") +
      S(`${NMB}&type=house&has=golf_community`, "North Myrtle Beach houses in golf communities") +
      S(`${CF}&type=house&has=golf_community`, "Carolina Forest houses in golf communities") +
      h.h3(`An acre or more`) + h.p(`Houses on a lot of an acre or larger.`) +
      S(`city=Loris&type=house&lotMin=1`, "Loris houses on an acre or more") +
      S(`city=Aynor&type=house&lotMin=1`, "Aynor houses on an acre or more") +
      S(`city=Longs&type=house&lotMin=1`, "Longs houses on an acre or more") +
      h.p(`For empty lots, see our ${h.a("/buyers/land/", "land guide")}.`) +
      h.h3(`Active-adult communities`) +
      S(`${MB}&type=house&has=active_adult`, "Myrtle Beach houses in active-adult communities") +
      S(`${LR}&type=house&has=active_adult`, "Little River houses in active-adult communities") +
      h.p(`The ${h.a("/buyers/senior-living/", "senior living guide")} explains active-adult communities.`) },

    { h2: "What about condos and townhouses in Horry County?", toc: "Condos", id: "condos", html: () =>
      h.p(`About 2,700 condos are for sale, and the middle half ask about $155,000 to $320,000. The HOA fee depends on the building: the fees we read ran from $481 to $1,014 a month for the middle half of condos. Each oceanfront strip links to its condo page.`) +
      S(`${MB}&type=condo&has=oceanfront_unit`, "Oceanfront condos in Myrtle Beach") +
      S(`${NMB}&type=condo&has=oceanfront_unit`, "Oceanfront condos in North Myrtle Beach") +
      S(`${GC}&type=condo`, "Condos within 2 miles of Garden City Beach") +
      S(`${LR}&type=condo`, "Little River condos") +
      S(`city=Surfside%20Beach&type=condo`, "Surfside Beach condos") +
      h.p(`See ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach condos for sale")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach condos for sale")} and the ${h.a("/invest/condo-buildings/", "oceanfront condo buildings")}.`) },

    { h2: "What about homes near Garden City?", toc: "Garden City", id: "garden-city", html: () =>
      S(`${GC}&type=house`, "Houses within 2 miles of Garden City Beach") +
      h.p(`Garden City shares a ZIP code, 29576, with Murrells Inlet, so we search a 2-mile circle around Garden City Beach. See ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City homes for sale")}.`) },

    { h2: "What have Horry County houses sold for?", toc: "Sold prices", id: "sold", html: () =>
      h.p(`In the past year, ${n(DD.houses.count)} houses sold in Horry County, counting townhomes on their own lots. The middle price was about $349,000, and the middle half sold from $280,000 to about $471,000. We read the county's deed index to count them.`) +
      SOLD_BANDS +
      h.p(`Condos sold too: 4,456 recorded condo sales, at a middle price of $215,000. Together with houses, that is about 14,700 sales, or about 40 a day.`) +
      h.p(`D.R. Horton, one builder, recorded 1,115 of the ${n(DD.houses.count)} house sales, about 1 in 9. People sold 5,374, and other companies, mostly builders, sold 3,723.`) +
      NOTE(`Sales: Horry County deeds from the past 12 months with a price over $10,000, on parcels coded as single-family or as townhomes on their own lots. Deeds with no price are not counted. Read more in ${h.a("/buyers/property-records/", "how to read the property records")}.`) },

    { h2: "What does a year cost to own in Horry County?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a house at the sale middle, $349,000, and assume the county values it at that price. South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent.`) +
      h.table(["House at $349,000", "Lived in (4%)", "Second home or rental (6%)"], [
        ["Unincorporated Horry County, county fire district", "About $1,400", "About $4,300"],
        ["City of Myrtle Beach", "See the guide", "About $5,300"],
      ]) +
      NOTE(`The county fire district takes in Carolina Forest and Little River. Murrells Inlet and Garden City pay a little more, and Conway, North Myrtle Beach and Surfside Beach set their own rates. The lower rate needs an application. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      h.p(`On the listing sheets we read, the HOA fee for a house had a middle of $89 a month, and the middle half showed $65 to $119. About 1 in 4 showed no fee. The seller's agent enters that number, so it is not the HOA's own bill. See ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) +
      h.p(`About 4 in 100 of the houses that sold (435 of 9,939 lots) have their center point in a FEMA high-risk flood zone. The share is higher on the coast and lower inland. A lot can touch a zone its center misses, so we check each house on the ${h.a("/buyers/flood-zone-check/", "flood zone check")} before you offer.`) },

    { h2: "Which towns are in Horry County?", toc: "Towns", id: "towns", html: () =>
      h.p(`Houses and condos for sale by town, counted from the site's map when we built this page, to the nearest 10. The strips above are live.`) +
      COUNTY_MAP +
      h.table(["Town", "Houses", "Condos"], TOWN_ROWS) +
      NOTE(`Murrells Inlet crosses the county line, so its row counts only the homes inside Horry County. Pawleys Island is in Georgetown County and is not counted. A town name here is the MLS city, so a Myrtle Beach address can be in Carolina Forest or Socastee.`) },

    { h2: "Which town fits?", toc: "Town guide", id: "tour", html: () =>
      h.p(`For how the nine towns differ, read ${h.a("/submarkets/", "the towns guide")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/longs/", "Longs")} and ${h.a("/submarkets/loris/", "Loris")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Horry County homes for sale FAQ",
  faq: [
    { q: "How many homes are for sale in Horry County, SC?", a: `About ${n(HOUSES_N)} houses, 2,700 condos and 300 townhouses. The strips on this page are live, so the count moves daily.` },
    { q: "What do houses in Horry County sell for?", a: `In the past year the middle sale price was about $349,000 for a house, townhomes on their own lots included.` },
    { q: "Are there new homes for sale in Horry County?", a: `Yes. The strips show new construction in Longs, Loris and Carolina Forest.` },
    { q: "What does it cost a year to own a house in Horry County?", a: `At $349,000, property tax is about $1,400 for a home you live in and about $4,300 for a second home or rental, in the county fire district. The HOA fee and flood zone vary by house.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "Census county boundary", href: SRC.census },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "tax levy", href: SRC.levy },
    { name: "county stormwater fee", href: SRC.fee },
  ],
  sourcesNote: "Our counts: Horry County deeds, parcels and the FEMA flood map. Listings: CCMLS, live.",
  bottomCta: {
    h2: "Check the house before you offer.",
    p: "Before you offer on a Horry County home, we read its HOA papers and its flood file, then tell you what we found.",
    label: "Ask us to check a house", href: CONTACT,
  },
  keywords: "Horry County SC homes for sale, Horry County houses for sale, new homes in Horry County SC, Horry County real estate listings, Horry County condos for sale",
  about: "Homes for sale in Horry County, South Carolina, live from the MLS, with what houses sold for and what a year costs to own",
});
