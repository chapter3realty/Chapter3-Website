/* /submarkets/north-myrtle-beach/condos-for-sale/ - North Myrtle Beach, SC condos for sale: a listing-first page.
 * The condos are the page: live strips by price, bedrooms, oceanfront, building and part of town; short answers
 * between them (the fee by size, what condos sold for, what a year costs to own, the flood share, one offer).
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/north-myrtle-beach-condos-for-sale/facts.md, VERIFIED rows,
 * and the CORRECTED row 10 at the verifier's values (VERIFY.md): Baywatch 33 deeds, about $236,000; no cause for
 * the oceanfront fee gap (row 12 note); middles only for the fee by size (row 13 note); no link to the Myrtle Beach
 * condo page until it exists (hold 6).
 * Data: data/2026-11-f/north-myrtle-beach-condos-for-sale/. Numbers are read from the JSON files and checked below.
 * Listing counts move daily, so the page prints none for a strip; each strip is live.
 * Pictures: a USDA NAIP aerial (public domain), charts and a map. The photo partner's shot list is in the batch BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, placesMap } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/north-myrtle-beach/condos-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "north-myrtle-beach-condos-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const F = read("findings.json"), OF = read("oceanfront.json"), TX = read("tax.json").tax, FL = read("flood.json");
const must = (ok, msg) => { if (!ok) throw new Error(`north-myrtle-beach-condos-for-sale.js: ${msg}`); };
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");

must(AIR.license === "Public domain", "the aerial photo record is missing");
/* Rows 6 and 8: asking middle about $289,000; middle year built 2001. */
must(F.price.median === 289000 && F.year_built.median === 2001, "rows 6 or 8 changed");
/* Row 9: 1,088 deeds, middle $306,050; bands 30, 155, 347, 377, 179. */
const SB = F.sales_city_bands;
must(F.sales.city_limits.n === 1088 && F.sales.city_limits.median === 306050 && SB.under_100k === 30 && SB["100_200k"] === 155 && SB["200_300k"] === 347 && SB["300_500k"] === 377 && SB["500k_plus"] === 179, "row 9 changed");
/* Rows 12 and 13: asking and fee middles by unit size, oceanfront building against not. */
const OB = OF.oceanfront_building.by_beds, NB = OF.not_oceanfront_building.by_beds;
must(OB["2"].hoa.median === 1033 && NB["2"].hoa.median === 530 && OB["2"].price.median === 369999 && NB["2"].price.median === 229950, "row 12 changed");
must(Math.round(OB["1"].hoa.median) === 781 && Math.round(NB["1"].hoa.median) === 515 && Math.round(OB["3"].hoa.median) === 1270 && Math.round(NB["3"].hoa.median) === 655, "row 13 changed");
must(OB["1"].price.median === 221200 && NB["1"].price.median === 175000 && OB["3"].price.median === 540000 && NB["3"].price.median === 385900, "row 12 sizes changed");
/* Row 16: tax. */
must(TX["200000"].six === 2654 && TX["200000"].four === 897 && TX["300000"].six === 3982 && TX["300000"].four === 1345 && TX["450000"].six === 5972 && TX["450000"].four === 2018, "row 16 changed");
/* Row 17: flood. */
must(FL.in_high_risk.all === 269 && FL.pins === 613 && FL.in_high_risk.waterfront === 153 && FL.in_high_risk.not_waterfront === 116, "row 17 changed");

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
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:5/1}main#main .ww-hero figcaption{display:none}main#main .detail-hero .detail-media{max-width:1100px!important}}
main#main .c3-gchart,main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.4rem 0 1.4rem}
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
main#main .detail-hero .c3-glance li,main#main .detail-hero .c3-glance strong,main#main .detail-hero .c3-glance span.t{line-height:1.4!important}
main#main .detail-hero .c3-glance li:focus,main#main .detail-hero .c3-glance li:focus-within,main#main .detail-hero .c3-glance li:hover{outline:0!important}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{min-height:44px!important;box-sizing:border-box;outline:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

const CONTACT = `/contact/?place=${encodeURIComponent("North Myrtle Beach")}`;
const C = "type=condo&city=North Myrtle Beach";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;
const about = (v, step) => Math.round(v / step) * step;

/* Chart 1 and 2: the fee and the asking price by unit size (rows 13 and 12). */
const SIZES = [["1", "1 bedroom"], ["2", "2 bedrooms"], ["3", "3 bedrooms"]];
const rowsFor = (pick) => SIZES.flatMap(([k, lab]) => [
  { name: `${lab}, oceanfront building`, value: pick(OB[k]) },
  { name: `${lab}, not oceanfront`, value: pick(NB[k]) },
]);
const FEE_CHART = G.bars(rowsFor((b) => Math.round(b.hoa.median)).map((r) => Object.assign(r, { valueText: `${money(r.value)}` })), {
  caption: "Monthly fee: a two-bedroom in an oceanfront building pays about twice as much",
  nameLabel: "Unit and building", valueLabel: "Middle monthly fee, dollars a month", compact: true, phoneList: true,
  note: "Middle of the monthly HOA fee on the listings for sale. It is the listing's number, not the association's own bill.",
});
const SOLD_BANDS = (() => {
  const rows = [["Under $100,000", SB.under_100k], ["$100,000 to $199,999", SB["100_200k"]], ["$200,000 to $299,999", SB["200_300k"]], ["$300,000 to $499,999", SB["300_500k"]], ["$500,000 and up", SB["500k_plus"]]];
  const MAXV = Math.max(...rows.map((r) => r[1])), W = 640, H = 300, bw = 82, gap = 28, x0 = 20, base = 235, top = 40;
  const cols = rows.map(([lab, v], i) => {
    const x = x0 + i * (bw + gap), hh = Math.round((base - top) * v / MAXV), y = base - hh;
    const words = lab.replace(" to ", " to|").replace("Under ", "Under|").replace(" and up", "|and up").split("|");
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="8" fill="#b8863b"/>`
      + `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-weight="700" font-size="20" fill="#1c2028">${v.toLocaleString("en-US")}</text>`
      + words.map((w, k) => `<text x="${x + bw / 2}" y="${base + 24 + k * 19}" text-anchor="middle" font-size="15" fill="#4a5060">${w}</text>`).join("");
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Condos sold in North Myrtle Beach in the past year by sale price: ${SB.under_100k} under $100,000, ${SB["100_200k"]} from $100,000 to $199,999, ${SB["200_300k"]} from $200,000 to $299,999, ${SB["300_500k"]} from $300,000 to $499,999 and ${SB["500k_plus"]} at $500,000 and up." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Condos sold in North Myrtle Beach by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">Most North Myrtle Beach condos sold for $200,000 to $499,999</p>${svg}<figcaption>1,088 condos and condo-style villas sold in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();

/* The page's own map: three of our buildings (centers from their pages' flood files) and three landmarks (row 5). */
const A = "/invest/condo-buildings";
const MAP = placesMap("Buildings and landmarks in North Myrtle Beach", [
  { name: "Beach Cove", lat: 33.790703, lon: -78.735033, href: `${A}/beach-cove-resort/` },
  { name: "Mar Vista Grande", lat: 33.815286, lon: -78.680278, href: `${A}/mar-vista-grande/` },
  { name: "Prince Resort", lat: 33.830662, lon: -78.633242, href: `${A}/prince-resort/` },
  { name: "Barefoot Landing", lat: 33.7998752, lon: -78.7424398 },
  { name: "Main Street, ocean end", lat: 33.8188841, lon: -78.6723736 },
  { name: "Cherry Grove Pier", lat: 33.8287315, lon: -78.6326763 },
], { caption: "Map of our three building pages and the three places used for the strips below." });

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
  hub: { name: "North Myrtle Beach", url: "/submarkets/north-myrtle-beach/" },
  title: "North Myrtle Beach Condos for Sale: Live Oceanfront Listings",
  description: "Condos for sale in North Myrtle Beach, SC, live: by price, size, building and oceanfront. What the fees run, what condos sold for, and what a year costs.",
  ogTitle: "North Myrtle Beach, SC condos for sale: see them, then the monthly fee",
  crumb: "Condos for sale",
  eyebrow: "North Myrtle Beach, SC condos for sale",
  h1: "North Myrtle Beach, SC condos for sale:",
  h1em: "the monthly fee depends on the building.",
  sub: "Condos with a North Myrtle Beach address, live from the MLS.",
  heroMedia: CSS + glance([
    { icon: "dollar", label: "Asking, middle price", text: "About $289,000" },
    { icon: "dollar", label: "Sold, middle price", text: "About $306,000" },
    { icon: "beach", label: "Oceanfront fee", text: "$1,030 a month" },
    { icon: "home", label: "Condos for sale", text: "About 580" },
  ]) + G.homesCss() + G.homesQScript()
    + h.p(`These are the newest condos for sale here, live from the MLS. Prices, sizes, oceanfront units and buildings follow below, and the fee by size.`)
    + S(`${C}&domMax=14`, "North Myrtle Beach condos listed in the last 14 days")
    + h.p(`${h.a("/homes/?type=condo&city=North+Myrtle+Beach", "See all North Myrtle Beach condos")}. Each strip below links to its full search.`),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `About 580 condos are for sale in North Myrtle Beach, asking a middle of about $289,000.`,
    `The monthly fee depends on the building. A two-bedroom in an oceanfront building asks about $370,000 and pays about $1,030 a month. An inland two-bedroom asks about $230,000 and pays about $530.`,
    `We tour them with you, and we check the HOA and flood file before you offer.`,
  ],
  sections: [
    { h2: "What do condos in North Myrtle Beach cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`Half of the condos for sale ask between about $220,000 and about $440,000.`) +
      S(`${C}&max=100000`, "Condos under $100,000") +
      S(`${C}&max=150000`, "Condos under $150,000") +
      S(`${C}&min=150000&max=300000`, "Condos from $150,000 to $300,000") +
      S(`${C}&min=300000`, "Condos at $300,000 and up") +
      S(`${C}&min=500000`, "Condos at $500,000 and up") +
      h.p(`Few condos ask under $100,000. Asking price is not sale price. The sold-prices section below shows what condos sold for.`) },

    { h2: "How many bedrooms do the condos have?", toc: "Bedrooms", id: "beds", html: () =>
      h.p(`A two-bedroom is the common size: about 4 in 10 of the condos for sale. A studio is about 345 square feet and asks about $127,000. A one-bedroom is about 640 square feet and asks about $215,000. A two-bedroom is about 1,040 square feet and asks about $250,000. A three-bedroom is about 1,350 square feet and asks about $438,000. These are middles of the listings.`) +
      S(`${C}&beds=2`, "Condos with 2 or more bedrooms") +
      S(`${C}&beds=3`, "Condos with 3 or more bedrooms") +
      S(`${C}&beds=4`, "Condos with 4 or more bedrooms") },

    { h2: "Which North Myrtle Beach condos are oceanfront?", toc: "Oceanfront", id: "ocean", html: () =>
      h.p(`Beachfront and oceanfront mean the same thing here. An oceanfront building sits on the sand. An oceanfront unit faces the ocean. A unit in an oceanfront building can still face the street or the pool, so the strips use the unit's own listing tag.`) +
      S(`${C}&has=oceanfront_unit`, "Oceanfront condo units") +
      S(`${C}&has=oceanfront_unit&max=300000`, "Oceanfront units under $300,000") +
      S(`${C}&has=oceanfront_unit&beds=3`, "Oceanfront units with 3 or more bedrooms") +
      S(`${C}&has=oceanview_unit`, "Ocean-view condo units") +
      h.p(`For fees building by building, see our ${h.a("/invest/condo-buildings/", "oceanfront condo buildings compared")}.`) },

    { h2: "What is the monthly fee, and how does oceanfront differ?", toc: "Monthly fee", id: "fee", html: () =>
      h.p(`The middle fee is about $670 a month across all the condos. Half pay between about $525 and about $1,040.`) +
      h.p(`The building matters more than the size. A two-bedroom in an oceanfront building asks about $370,000, pays about $1,030 a month and has about 920 square feet. An inland two-bedroom asks about $230,000, pays about $530 and has about 1,050 square feet.`) +
      h.p(`That is about $140,000 more to buy and about $6,000 more a year in fees, for a smaller unit. The data does not say why the fee differs, so we read the building's budget before you offer.`) +
      FEE_CHART +
      S(`${C}&hoaMax=500`, "Condos with a fee under $500 a month") +
      S(`${C}&hoaMax=400`, "Condos with a fee under $400 a month") +
      NOTE(`The fee is the number the seller's agent enters. Confirm it with the association before you offer. See ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) },

    { h2: "Are there newer condos in North Myrtle Beach?", toc: "Newer", id: "newer", html: () =>
      h.p(`The middle year built is 2001, and about half were built before 2000. Few are new: none carries the new-construction tag.`) +
      S(`${C}&yearMin=2015`, "Condos built in 2015 or later") +
      h.p(`Townhomes are a different search, with their own strip.`) +
      S(`type=townhouse&city=North Myrtle Beach`, "Townhomes for sale in North Myrtle Beach") },

    { h2: "Which condos have a lazy river, an indoor pool or golf?", toc: "What it has", id: "has", html: () =>
      h.p(`Each strip uses the amenity tag the listing carries. About 100 condos for sale carry the lazy river tag, and about 170 carry the indoor pool tag.`) +
      S(`${C}&has=lazy_river`, "Condos in buildings with a lazy river") +
      S(`${C}&has=indoor_pool`, "Condos with an indoor pool") +
      S(`${C}&has=golf_community`, "Condos in or beside a golf community") +
      S(`${C}&has=icw_community`, "Condos on the Intracoastal Waterway") +
      S(`${C}&has=pets_allowed`, "Condos where pets are allowed") +
      S(`${C}&has=str_allowed`, "Condos where nightly rentals are allowed") +
      NOTE(`The listing says whether pets and nightly rentals are allowed. The building's own rules decide. See our ${h.a("/invest/str-rules/", "short-term rental rules")}.`) },

    { h2: "Which buildings have condos for sale?", toc: "By building", id: "buildings", html: () =>
      h.p(`Each strip holds one building's condos, as the MLS names it. A name can match more than one tower.`) +
      S(`subdivision=Beach Cove&${C}`, "Beach Cove condos for sale") +
      h.p(`${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} has its own page.`) +
      S(`subdivision=Prince Resort&${C}`, "Prince Resort condos for sale") +
      h.p(`${h.a("/invest/condo-buildings/prince-resort/", "Prince Resort")} has its own page.`) +
      S(`subdivision=Mar Vista Grande&${C}`, "Mar Vista Grande condos for sale") +
      h.p(`${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} has its own page.`) +
      S(`subdivision=Bay Watch&${C}`, "Bay Watch condos for sale") +
      h.p(`${h.a("/invest/condo-buildings/bay-watch-resort/", "Bay Watch Resort")} has its own page.`) +
      S(`subdivision=Towers On The Grove&${C}`, "Towers on the Grove condos for sale") +
      h.p(`${h.a("/invest/condo-buildings/towers-on-the-grove/", "Towers on the Grove")} has its own page.`) +
      S(`subdivision=Tilghman&${C}`, "Tilghman condos for sale") +
      S(`subdivision=Crescent Shores&${C}`, "Crescent Shores condos for sale") +
      S(`subdivision=Sea Cabin&${C}`, "Sea Cabin condos for sale") +
      S(`subdivision=Avista&${C}`, "Avista condos for sale") +
      S(`subdivision=North Beach Towers&${C}`, "North Beach Towers condos for sale") +
      S(`subdivision=Ocean Keyes&${C}`, "Ocean Keyes condos for sale") +
      S(`subdivision=Carolina Keyes&${C}`, "Carolina Keyes condos for sale") +
      S(`subdivision=Waterway Landing&${C}`, "Waterway Landing condos for sale") +
      S(`subdivision=OCEAN BAYCLUB&${C}`, "Ocean Bayclub condos for sale") +
      S(`subdivision=Malibu Pointe&${C}`, "Malibu Pointe condos for sale") +
      h.p(`Our ${h.a("/invest/condo-buildings/", "oceanfront condo buildings page")} compares 45 buildings and their fees.`) },

    { h2: "Which part of North Myrtle Beach has condos for sale?", toc: "By part of town", id: "where", html: () =>
      S(`subdivision=Barefoot&${C}`, "Barefoot Resort condos for sale") +
      S(`near=33.7998752,-78.7424398&miles=1&${C}`, "Condos within a mile of Barefoot Landing") +
      S(`near=33.8188841,-78.6723736&miles=1&${C}`, "Condos within a mile of Main Street") +
      S(`near=33.8287315,-78.6326763&miles=1&${C}`, "Condos within a mile of Cherry Grove Pier") +
      h.p(`Our ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove page")} has the houses there too.`) +
      NOTE(`Within a mile is a straight line on the map, not a walk or a drive. The Barefoot Resort strip holds every Barefoot Resort community the MLS names.`) },

    { h2: "What have North Myrtle Beach condos sold for?", toc: "Sold prices", id: "sold", html: (bg) =>
      h.p(`In the past year, 1,088 condos and condo-style villas sold in the city's tax district. The middle price was about $306,000, and the middle half sold from about $222,000 to about $430,000. We read the county's deed index to count them.`) +
      SOLD_BANDS +
      h.p(`Beach Cove had the most sales, 37, at a middle price of about $172,500. Baywatch had 33 at about $236,000. With only a few sales, a building's middle is a weak guide.`) +
      NOTE(`Sales: Horry County deeds recorded in the past 12 months, with a price over $10,000, on condo parcels in the city's tax district. Deeds with no price are not counted. Baywatch adds three spellings of its legal name.`) +
      h.cta("Curious what one condo paid?", "Give us a building and a unit. We pull its deed, its HOA papers and its flood file, and tell you what we found.", "Have us pull the records", CONTACT, bg) },

    { h2: "What does a year cost to own a condo in North Myrtle Beach?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a price and assume the county values the condo at it. South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent. Inside the city, the 2026 rate is about $221 per $1,000 of the value the county taxes.`) +
      h.table(["Condo price", "Lived in (4%)", "Second home or rental (6%)"], [
        ["$200,000", `About ${money(about(TX["200000"].four, 10))}`, `About ${money(about(TX["200000"].six, 10))}`],
        ["$300,000", `About ${money(about(TX["300000"].four, 10))}`, `About ${money(about(TX["300000"].six, 10))}`],
        ["$450,000", `About ${money(about(TX["450000"].four, 10))}`, `About ${money(about(TX["450000"].six, 10))}`],
      ]) +
      NOTE(`Yearly tax only. The monthly HOA fee is on top, and it depends on the building. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) },

    { h2: "Is the condo in a flood zone?", toc: "Flood", id: "flood", html: () =>
      h.p(`About 44 in 100 of the condos for sale sit in a FEMA high-risk zone, where a lender requires flood insurance. Among condos tagged waterfront, about 62 in 100 do. Among the others, about 32 in 100 do.`) +
      h.p(`We measure the point of each listing against the FEMA map. A building can touch a zone its point misses, so we check the building before you offer. Start with our ${h.a("/buyers/flood-zone-check/", "flood zone check")}, then read about ${h.a("/buyers/coastal-insurance/", "coastal insurance")} and ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")}.`) },

    { h2: "Want to see one?", toc: "Tour a condo", id: "tour", html: (bg) =>
      h.cta("Tour three buildings with us in one day", "Pick the buildings from the strips above. We line up the showings and read each building's HOA and flood file before you offer.", "Book a showing", CONTACT, bg) +
      h.p(`For the town itself, read the ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach town guide")}. For condos as an investment, see our ${h.a("/invest/condos/", "condo investing page")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "North Myrtle Beach condos for sale FAQ",
  faq: [
    { q: "Are the condos in the strips current?", a: `Each strip is filled from the live MLS feed when you open the page, so it shows what is for sale now. We print no count for a strip because the counts change daily.` },
    { q: "Can I rent a condo by the night?", a: `About 470 of the listings say nightly rentals are allowed. The building's own rules decide, and the city has its own. See our short-term rental rules page.` },
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
  sourcesNote: "Our counts: Horry County deeds and parcels, and the FEMA flood map. Listings: CCMLS, live, in aggregate. Map points: OpenStreetMap.",
    bottomCta: {
    h2: "Book a showing in North Myrtle Beach.",
    p: "Pick a condo from the strips above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "condos north myrtle beach for sale, north myrtle beach condos for sale, condos north myrtle beach oceanfront, north myrtle beach oceanfront condos",
  about: "Condos for sale in North Myrtle Beach, South Carolina, live from the MLS, with the monthly fee by building type, what condos sold for and what a year costs to own",
});
