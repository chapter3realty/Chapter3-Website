/* /submarkets/surfside-beach/condos-for-sale/ - Surfside Beach, SC condos for sale: a listing-first page.
 * The condos are the page: live strips by price, bedrooms, oceanfront, fee, pier distance, what the community has
 * and community; short answers between them (in the town or out of it, what condos sold for, what a year costs
 * to own, the flood share, one offer).
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/surfside-beach-condos-for-sale/facts.md, VERIFIED rows, and the
 * CORRECTED rows at the verifier's wording (VERIFY.md): no total tax for outside the town (row 18, fire and waste are
 * special levies), no flood policy figures (row 20), the rental wording follows the town's zoning map (row 23),
 * "South Bay Lakes and South Bay East" (row 14). Row 25 (search volume) is not printed.
 * Data: data/2026-11-f/surfside-beach-condos-for-sale/. Numbers are read from the JSON files and checked below.
 * Listing counts move daily, so the page prints none for a strip; each strip is live.
 * Pictures: a USDA NAIP aerial (public domain), charts and a map with the town limit.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, placesMap } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/surfside-beach/condos-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "surfside-beach-condos-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const F = read("findings.json"), OF = read("oceanfront.json"), TX = read("tax.json").tax, FL = read("flood.json");
const DD = read("findings-deeds.json"), MD = read("map-data.json");
const must = (ok, msg) => { if (!ok) throw new Error(`surfside-beach-condos-for-sale.js: ${msg}`); };
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const about = (v, step) => Math.round(v / step) * step;

must(AIR.license === "Public domain", "the aerial photo record is missing");
/* Rows 7 and 11: asking middle $189,000; middle year built 1987. */
must(F.price.median === 189000 && F.year_built.median === 1987 && F.year_built.since_2015 === 0, "rows 7 or 11 changed");
/* Row 13: 54 deeds inside the town, middle $362,500, bands 3, 11, 26, 14. */
const DB = DD.bands;
must(DD.town_residential.n === 54 && DD.town_residential.median === 362500 && DB.under_200k === 3 && DB["200_300k"] === 11 && DB["300_500k"] === 26 && DB["500k_plus"] === 14, "row 13 changed");
/* Row 14: outside the town. */
const OUT = DD.outside;
must(DD.outside_all_named.n === 122 && DD.outside_all_named.median === 156475 && OUT["Southbridge"].n === 27 && OUT["Southbridge"].median === 164900 && OUT["South Bay Lakes"].n === 28 && OUT["South Bay Lakes"].median === 172250 && OUT["Golf Colony"].n === 38 && OUT["Golf Colony"].median === 146200 && OUT["Hampton Greens"].n === 7 && OUT["Villas on the Green"].n === 11 && OUT["Plantation Golf Villas (Grand Palms)"].n === 11, "row 14 changed");
/* Row 9: oceanfront building against the rest. */
const OB = OF.oceanfront_building, NB = OF.not_oceanfront_building;
must(OB.n === 10 && OB.price.median === 562000 && Math.round(OB.hoa.median) === 944 && NB.price.median === 179900 && NB.hoa.median === 394, "row 9 changed");
must(OB.by_beds["2"].n === 5 && OB.by_beds["2"].price.median === 540000 && OB.by_beds["2"].hoa.median === 855 && OB.by_beds["2"].sqft.median === 1008, "row 9 two-bedroom changed");
must(NB.by_beds["2"].n === 43 && NB.by_beds["2"].price.median === 178000 && NB.by_beds["2"].hoa.median === 384 && NB.by_beds["2"].sqft.median === 925, "row 9 two-bedroom elsewhere changed");
must(OB.by_beds["3"].n === 5 && OB.by_beds["3"].price.median === 719000 && OB.by_beds["3"].hoa.median === 1032 && NB.by_beds["3"].n === 19 && NB.by_beds["3"].price.median === 209999 && NB.by_beds["3"].hoa.median === 415, "row 9 three-bedroom changed");
/* Row 17: tax inside the town. */
must(TX["150000"].six === 1927.8 && TX["150000"].four === 630.6 && TX["200000"].six === 2570.4 && TX["350000"].four === 1471.4, "row 17 changed");
/* Row 19: flood. */
must(FL.in_high_risk.all === 18 && FL.pins === 83 && FL.in_high_risk.waterfront === 12 && FL.in_high_risk.not_waterfront === 6, "row 19 changed");
must(MD.limit_polygon.length > 20 && MD.centers["Golf Colony at Deerfield"], "map data missing");

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
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:3/1}main#main .detail-hero .detail-media{max-width:1100px!important}}
main#main .c3-gchart,main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.4rem 0 1.4rem}
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;
const CONTACT = `/contact/?place=${encodeURIComponent("Surfside Beach")}`;
const C = "type=condo&city=Surfside+Beach";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;

/* Chart 1: asking price and monthly fee, oceanfront building against the rest (row 9). */
const SZ = [["2", "2 bedrooms"], ["3", "3 bedrooms"]];
const rowsFor = (pick) => SZ.flatMap(([k, lab]) => [
  { name: `${lab}, oceanfront building (${OB.by_beds[k].n} listed)`, value: pick(OB.by_beds[k]) },
  { name: `${lab}, not oceanfront (${NB.by_beds[k].n} listed)`, value: pick(NB.by_beds[k]) },
]);
const FEE_CHART = G.bars(rowsFor((b) => Math.round(b.hoa.median)).map((r) => Object.assign(r, { valueText: money(r.value) })), {
  caption: "Monthly fee: an oceanfront building charges more than twice as much",
  nameLabel: "Unit and building", valueLabel: "Middle monthly fee, dollars a month", compact: true, phoneList: true,
  note: "Middle of the monthly HOA fee on the listings for sale. It is the listing's number, not the association's own bill. Five oceanfront listings in each size is a small group.",
});
/* Chart 3: deed sales inside the town by price band (row 13). */
const SOLD_BANDS = (() => {
  const rows = [["Under $200,000", DB.under_200k], ["$200,000 to $299,999", DB["200_300k"]], ["$300,000 to $499,999", DB["300_500k"]], ["$500,000 and up", DB["500k_plus"]]];
  const MAXV = Math.max(...rows.map((r) => r[1])), W = 640, H = 300, bw = 100, gap = 38, x0 = 30, base = 235, top = 40;
  const cols = rows.map(([lab, v], i) => {
    const x = x0 + i * (bw + gap), hh = Math.round((base - top) * v / MAXV), y = base - hh;
    const words = lab.replace(" to ", " to|").replace("Under ", "Under|").replace(" and up", "|and up").split("|");
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="8" fill="#b8863b"/>`
      + `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-weight="700" font-size="20" fill="#1c2028">${v}</text>`
      + words.map((w, k) => `<text x="${x + bw / 2}" y="${base + 24 + k * 19}" text-anchor="middle" font-size="15" fill="#4a5060">${w}</text>`).join("");
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Condos sold inside the Town of Surfside Beach in the past year by sale price: ${DB.under_200k} under $200,000, ${DB["200_300k"]} from $200,000 to $299,999, ${DB["300_500k"]} from $300,000 to $499,999 and ${DB["500k_plus"]} at $500,000 and up." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Condos sold inside the Town of Surfside Beach by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">Inside the town, the most common sale price band was $300,000 to $499,999</p>${svg}<figcaption>54 condos and condo-style units sold inside the town in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();

/* The page's own map: the town limit, the pier and one center for each community (row 2, 5). */
const CT = MD.centers;
const MAP = placesMap("Surfside Beach condo communities and the town limit", [
  { name: "Surfside Beach Pier", lat: 33.6049921, lon: -78.9717534 },
  { name: "Sea Shadow", lat: CT["Sea Shadow"].lat, lon: CT["Sea Shadow"].lon },
  { name: "Golf Colony at Deerfield", lat: CT["Golf Colony at Deerfield"].lat, lon: CT["Golf Colony at Deerfield"].lon },
  { name: "Grand Palms", lat: CT["Grand Palms"].lat, lon: CT["Grand Palms"].lon },
  { name: "Hampton Greens", lat: CT["Hampton Greens"].lat, lon: CT["Hampton Greens"].lon },
  { name: "Retreat at Glenns Bay", lat: CT["Retreat at Glenns Bay"].lat, lon: CT["Retreat at Glenns Bay"].lon },
  { name: "Southbridge", lat: CT["Southbridge"].lat, lon: CT["Southbridge"].lon },
  { name: "South Bay Lakes", lat: CT["South Bay Lakes"].lat, lon: CT["South Bay Lakes"].lon },
], { areas: [{ name: "Town of Surfside Beach", note: "Inside the town limit", polygon: MD.limit_polygon }], key: true,
  caption: "Map of the Town of Surfside Beach limit, the pier and the communities with condos for sale. The community spots are the middle of its listings." });

const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  osm: "https://www.openstreetmap.org/",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Surfside Beach", url: "/submarkets/surfside-beach/" },
  title: "Surfside Beach Condos for Sale: Live List | Chapter3",
  description: "Condos for sale in Surfside Beach, SC, live: by price, size, community and oceanfront. What the fees run, what condos sold for, and what a year costs to own.",
  ogTitle: "Surfside Beach, SC condos for sale: in the town or out of it",
  crumb: "Condos for sale",
  eyebrow: "Surfside Beach, SC condos for sale",
  h1: "Surfside Beach, SC condos for sale:",
  h1em: "the place decides the price.",
  sub: "Condos with a Surfside Beach address, live from the MLS: some in the town, most in golf and lake communities outside it.",
  heroMedia: CSS + G.homesCss() + G.homesQScript() +
    `<p style="font-size:1.1rem;line-height:1.55;max-width:720px;margin:0 0 .2rem">Condos inside the town of Surfside Beach sold for over twice what condos in the six golf and lake communities outside it did: about $362,500 against about $156,000. ${h.a("/homes/?type=condo&city=Surfside+Beach", "See all 82 Surfside Beach condos")}, or start with the newest.</p>` +
    S(`${C}&domMax=14`, "Surfside Beach condos listed in the last 14 days") + glance([
    { icon: "dollar", label: "Asking, middle", text: "About $189,000" },
    { icon: "dollar", label: "Sold in town", text: "About $362,500" },
    { icon: "dollar", label: "Sold in six communities outside", text: "About $156,000" },
    { icon: "flood", label: "High-risk flood", text: "22 in 100" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The middle asking price is about $189,000. Where a condo sits matters more than its size: the town and the golf and lake communities outside it price apart, and the sections below show how.`,
    `We tour them with you, and we check the HOA and flood file before you offer.`,
  ],
  sections: [
    { h2: "What do condos in Surfside Beach cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`The middle asking price is about $189,000. The middle half asks from about $155,000 to about $225,000.`) +
      S(`${C}&max=125000`, "Condos under $125,000") +
      NOTE(`The strip hides the cheapest listings unless the search has a top price, so this strip and the next one have one.`) +
      S(`${C}&max=150000`, "Condos under $150,000") +
      S(`${C}&min=150000&max=300000`, "Condos from $150,000 to $300,000") +
      S(`${C}&min=300000`, "Condos at $300,000 and up") +
      S(`${C}&min=500000`, "Condos at $500,000 and up") +
      h.p(`Asking price is not sale price. The sold-prices section below shows what condos sold for.`) },

    { h2: "How many bedrooms do the condos have?", toc: "Bedrooms", id: "beds", html: () =>
      h.p(`The two-bedroom is the common size, almost 6 in 10 of the condos for sale. None has four bedrooms. These are middles of the listings, by size:`) +
      h.p(`A studio asks about $115,000 and pays about $346 a month. A one-bedroom asks about $144,000 and pays about $354. A two-bedroom asks about $183,000 and pays about $388. A three-bedroom asks about $221,000 and pays about $449.`) +
      NOTE(`Three studios are for sale, so that row is a small group. The fee is the number the seller's agent enters.`) +
      S(`${C}&beds=2`, "Condos with 2 or more bedrooms") +
      S(`${C}&beds=3`, "Condos with 3 or more bedrooms") },

    { h2: "Which Surfside Beach condos are oceanfront?", toc: "Oceanfront", id: "ocean", html: () =>
      h.p(`Searchers also say beachfront, and it means the same thing here. About 1 condo in 8 is in an oceanfront building. The rest are not. The unit's own listing tag says whether it faces the ocean.`) +
      S(`${C}&has=oceanfront_unit`, "Oceanfront condo units") +
      S(`${C}&has=oceanfront_unit&beds=3`, "Oceanfront units with 3 or more bedrooms") +
      S(`${C}&has=oceanview_unit`, "Ocean-view condo units") +
      h.p(`No oceanfront condo asks under $300,000 right now, so that strip would be empty.`) },

    { h2: "What is the monthly fee, and what does oceanfront add?", toc: "Monthly fee", id: "fee", html: () =>
      h.p(`The middle fee is about $400 a month across all the condos. Half pay between about $360 and about $480. About 8 in 10 listings say the fee covers water and sewer.`) +
      h.p(`The building matters more than the size. Ten condos for sale are in an oceanfront building. They ask about $562,000 and pay about $944 a month. The other condos ask about $180,000 and pay about $394.`) +
      h.p(`A two-bedroom in an oceanfront building asks about $540,000, pays about $855 a month and has about 1,008 square feet. The common two-bedroom elsewhere asks about $178,000, pays about $385 and has about 925 square feet. That is about $5,600 more a year in fees. The listings do not say why the fee differs. The building's budget does, so we read it before you offer.`) +
      FEE_CHART +
      S(`${C}&hoaMax=400`, "Condos with a fee under $400 a month") +
      S(`${C}&hoaMax=350`, "Condos with a fee under $350 a month") +
      NOTE(`Confirm the fee with the association before you offer. See ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) },

    { h2: "Is the condo in the town of Surfside Beach, or outside it?", toc: "Town or not", id: "where", html: () =>
      h.p(`Of the 82 condos for sale, 18 sit inside the town limit. The other 64 are in unincorporated Horry County with a Surfside Beach mailing address. They sit in golf and lake communities. Where a condo is decides which tax bill it gets and which rules apply.`) +
      h.p(`Inside the town, the tax rate includes the town's own levy. Outside it, the town's levy does not apply, and the county's special fire and waste management levies do. Those depend on the parcel, so we read the bill before you offer.`) +
      h.p(`Inside the town, nightly rentals follow the town's zoning map, and most inland streets do not allow rentals under 30 days. The ${h.a("/submarkets/surfside-beach/", "Surfside Beach town guide")} has the rental map, the 48 percent rule and the pier.`) },

    { h2: "Which condos are near the Surfside Beach Pier?", toc: "Near the pier", id: "pier", html: () =>
      h.p(`The pier is 814 feet long and free to walk. These strips measure a straight line on the map, not a walk.`) +
      S(`${C}&near=33.6049921,-78.9717534&miles=1`, "Condos within a mile of the Surfside Beach Pier") +
      S(`${C}&near=33.6049921,-78.9717534&miles=0.5`, "Condos within half a mile of the pier") },

    { h2: "What do the communities have?", toc: "What it has", id: "has", html: () =>
      h.p(`Pool, pets, rentals and the walk to the beach decide a lot for a condo buyer, so each has its own strip.`) +
      S(`${C}&has=outdoor_pool`, "Condos with an outdoor pool") +
      S(`${C}&has=pets_allowed`, "Condos where pets are allowed") +
      S(`${C}&has=str_allowed`, "Condos where nightly rentals are allowed") +
      NOTE(`The listing says whether nightly rentals are allowed. The building's own rules decide, and so does the town's map. See our ${h.a("/invest/str-rules/", "short-term rental rules")}.`) +
      S(`${C}&has=furnished`, "Furnished condos") +
      S(`${C}&has=walk_to_beach`, "Condos the listing says are a walk to the beach") +
      S(`${C}&has=tennis`, "Condos with tennis") },

    { h2: "Which communities have condos for sale?", toc: "By community", id: "communities", html: () =>
      h.p(`The communities outside the town are where most of the condos are, so each has its own strip. Each strip holds one community's condos, as the MLS names it. A name can match more than one building.`) +
      S(`subdivision=Golf+Colony+at+Deerfield&${C}`, "Golf Colony at Deerfield condos for sale") +
      S(`subdivision=Southbridge&${C}`, "Southbridge condos for sale") +
      S(`subdivision=Retreat+at+Glenns+Bay&${C}`, "Retreat at Glenns Bay condos for sale") +
      S(`subdivision=South+Bay+Lakes&${C}`, "South Bay Lakes condos for sale") +
      S(`subdivision=Plantation&${C}`, "Grand Palms, formerly Plantation Resort, condos for sale") +
      S(`subdivision=Hampton+Greens&${C}`, "Hampton Greens condos for sale") +
      S(`subdivision=Sea+Shadow&${C}`, "Sea Shadow condos for sale") +
      h.p(`Sea Shadow is inside the town. The other six are outside it. The oceanfront building directory covers the Myrtle Beach and North Myrtle Beach towers: see ${h.a("/invest/condo-buildings/", "oceanfront condo buildings compared")}.`) },

    { h2: "What have Surfside Beach condos sold for?", toc: "Sold prices", id: "sold", html: () =>
      h.p(`In the past year, 54 condos and condo-style units sold inside the town. The middle price was about $362,500, and the middle half sold from about $290,000 to about $500,000. We read the county's deed index to count them.`) +
      SOLD_BANDS +
      h.p(`Outside the town, six communities with condos for sale sold 122 deeds. The middle price was about $156,000, and the middle half sold from about $132,000 to about $175,000.`) +
      NOTE(`Sales: Horry County deeds recorded in the past 12 months, with a price over $10,000, on condo parcels. Three commercial-unit deeds are left out. Deeds do not show a unit's size, fee or view. We matched communities by the legal name on the deed. Golf Colony deeds read Golf Colony Resort, and South Bay Lakes includes South Bay East.`)},

    { h2: "What does a year cost to own a condo in Surfside Beach?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a price and assume the county values the condo at it. South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent. Inside the town, the 2026 tax is about $214 for every $1,000 the county taxes. A home you live in does not pay the school operations part.`) +
      h.table(["Condo price, inside the town", "Lived in (4%)", "Second home or rental (6%)"], [
        ["$150,000", `About ${money(about(TX["150000"].four, 10))}`, `About ${money(about(TX["150000"].six, 10))}`],
        ["$200,000", `About ${money(about(TX["200000"].four, 10))}`, `About ${money(about(TX["200000"].six, 10))}`],
        ["$350,000", `About ${money(about(TX["350000"].four, 10))}`, `About ${money(about(TX["350000"].six, 10))}`],
      ]) +
      NOTE(`Yearly tax only, before any credit and the 15 percent cap. A sale resets the county's taxable value. The lower rate needs an application. The monthly HOA fee is on top. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      h.p(`Outside the town, the town's levy does not apply, so the tax is lower. The county's special fire and waste management levies come on top, and they depend on the parcel. Give us the condo and we read the bill.`) },

    { h2: "Is the condo in a flood zone?", toc: "Flood", id: "flood", html: () =>
      h.p(`About 22 in 100 of the condos for sale sit in a FEMA high-risk zone, where a lender requires flood insurance. Among condos tagged waterfront, about 4 in 10 do. Among the others, about 1 in 8 do.`) +
      h.p(`We measure the map point of each listing against the FEMA map. That is not a lender's determination. A building can touch a zone its point misses, so we check the building before you offer. Start with our ${h.a("/buyers/flood-zone-check/", "flood zone check")}, then read about ${h.a("/buyers/coastal-insurance/", "coastal insurance")} and ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")}.`) },

    { h2: "Where next?", toc: "Next", id: "tour", html: () =>
      h.p(`To tour several communities in one day, pick them from the ${h.a("#communities", "community strips")} above. For the town itself, read the ${h.a("/submarkets/surfside-beach/", "Surfside Beach town guide")}. Nearby, see the ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach condos for sale")} and the ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach condos for sale")}. For condos as an investment, see our ${h.a("/invest/condos/", "condo investing page")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Surfside Beach condos for sale FAQ",
  faq: [
    { q: "Is the condo inside the town of Surfside Beach?", a: `Some are, and most are not. Most have a Surfside Beach mailing address but sit in unincorporated Horry County. The section on the town limit, with its map, shows the split. We check the map point before you offer.` },
    { q: "Why does an oceanfront condo cost more?", a: `The monthly fee section above shows what an oceanfront building adds to the price and the fee.` },
    { q: "How much is property tax on a Surfside Beach condo?", a: `At $200,000 inside the town, about $840 a year if you live in it and about $2,570 if it is a second home or rental. Outside the town the town's levy does not apply, and county fire and waste levies do. The HOA fee is separate.` },
    { q: "Can I rent a condo by the night?", a: `About 6 in 10 of the listings say nightly rentals are allowed. The building's own rules decide, and inside the town the zoning map does. See our short-term rental rules page.` },
    { q: "Will a lender loan on a condo?", a: `Many condo buildings do not pass a lender's condo review. Our page on condos many lenders will not lend on explains why. Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "tax levy", href: SRC.levy },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: Horry County deeds, parcels and municipal limits, and the FEMA flood map. Listings: CCMLS, live, in aggregate. Pier: OpenStreetMap.",
    bottomCta: {
    h2: "Have us check before you offer.",
    p: "Pick a condo from the strips. Before you offer, we read its HOA papers and its flood file, and tell you what we found.",
    label: "Ask us to check", href: CONTACT,
  },
  keywords: "condos surfside beach sc for sale, surfside beach condos for sale, surfside beach oceanfront condos, surfside sc condos",
  about: "Condos for sale in Surfside Beach, South Carolina, live from the MLS, in the town and outside it, with the fee by building type, what condos sold for and what a year costs to own",
});
