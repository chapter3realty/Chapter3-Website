/* /submarkets/myrtle-beach/homes-for-sale/ - Myrtle Beach, SC homes for sale: a listing-first page. The homes are the
 * page: live strips by price, bedrooms, new construction, what the place has and neighborhood; short answers between
 * them (which part is which, what houses sold for, what a year costs to own, one offer); the town guide at the end.
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/myrtle-beach-homes-for-sale/facts.md, VERIFIED rows, and
 * CORRECTED rows at the verifier's values (VERIFY.md): zips named "which takes in", tax outside the city as a range,
 * no card-sample asking prices, no "1 in 5 inside the city", flood about 4 in 100, "resales" for the two area figures.
 * Data: data/2026-11-f/myrtle-beach-homes-for-sale/. Listing counts move daily, so the page prints none for a strip.
 * Pictures: no photo on the page (owner, 2026-11-17); two charts (middle price by zip, sold-price bands).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/homes-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "myrtle-beach-homes-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const DD = read("findings-deeds.json"), FL = read("flood.json"), TX = read("tax.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const must = (ok, msg) => { if (!ok) throw new Error(`myrtle-beach-homes-for-sale.js: ${msg}`); };

must(AIR.license === "Public domain", "the aerial photo record is missing");
/* Row 9 (VERIFIED): 3,294 houses sold; middle $395,000; middle half $300,000 to $545,000. */
must(DD.houses.count === 3294 && DD.houses.median === 395000 && DD.houses.p25 === 300000 && DD.houses.p75 === 545000, "row 9 changed");
/* Row 10 (VERIFIED): five bands. */
const PB = DD.house_price_bands;
const BANDS = [PB["0-200000"], PB["200000-300000"], PB["300000-400000"], PB["400000-500000"], PB["500000-1000000000"]];
must(BANDS.join() === "168,654,876,587,1009", "row 10 changed");
/* Row 11 (CORRECTED, sales side verified): middle sale price by zip. */
const Z = DD.houses_by_zip;
must(Z["29588"].count === 1150 && Z["29588"].median === 350000 && Z["29579"].count === 1415 && Z["29579"].median === 410000
  && Z["29577"].count === 473 && Z["29577"].median === 415000 && Z["29572"].count === 254 && Z["29572"].median === 694500, "row 11 changed");
/* Row 17 (VERIFIED): 117 of 3,223. */
must(FL.houses === 3223 && FL.in_high_risk_zone === 117, "row 17 changed");
/* Rows 15, 16 (CORRECTED): $395,000 tax, inside the city and outside it. */
must(Math.round(TX.tax.city_4) === 1596 && Math.round(TX.tax.city_6) === 6034 && Math.round(TX.tax.out_4) === 1541 && Math.round(TX.tax.out_6) === 4853, "row 16 changed");

const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:4/1;object-fit:cover;object-position:50% 55%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:3/1}main#main .ww-hero figcaption{display:none}main#main .detail-hero .ww-hero{margin-bottom:.9rem!important}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:5/1}main#main .detail-hero .detail-media{max-width:1100px!important}}
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

const CONTACT = `/contact/?place=${encodeURIComponent("Myrtle Beach")}`;
const C = "city=Myrtle Beach&type=house";
const S = (q, head) => G.homesQ(q, head);
const TOCNAV = (() => {
  const items = [["newest", "What Myrtle Beach houses were listed this week?"], ["prices", "Prices"], ["beds", "Bedrooms"], ["new", "New homes"], ["has", "What it has"], ["hoods", "Neighborhoods"], ["townhomes", "Townhomes"], ["which", "Which part"], ["sold", "Sold prices"], ["cost", "Cost to own"], ["tour", "Tour a house"], ["questions-buyers-ask-about-myrtle-beach-houses", "Questions buyers ask about Myrtle Beach houses"]];
  return `<nav aria-label="On this page" style="margin-top:1.5rem;max-width:720px"><p style="font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.3rem;font-weight:600">On this page</p><ul style="list-style:none;margin:0;padding:0">${items.map(([id, t]) => `<li><a href="#${id}" style="display:block;padding:.65rem 0;color:var(--navy);text-decoration:underline;text-underline-offset:.18em;line-height:1.35">${t}</a></li>`).join("")}</ul></nav>`;
})();
const NOTE = (t) => `<p class="pp-note">${t}</p>`;

/* Chart: recorded house sales by price band (row 10). */
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Houses sold in Myrtle Beach in the past year by sale price: ${BANDS[0]} under $200,000, ${BANDS[1]} from $200,000 to $299,999, ${BANDS[2]} from $300,000 to $399,999, ${BANDS[3]} from $400,000 to $499,999 and ${n(BANDS[4])} at $500,000 and up." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Houses sold in Myrtle Beach by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">Three in ten Myrtle Beach houses sold for $500,000 or more</p>${svg}<figcaption>${n(DD.houses.count)} houses sold in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();

/* Chart (the wow): middle sale price by zip (row 11). */
const ZIPS = G.bars([
  { name: "29588, takes in Socastee", value: Z["29588"].median, sales: Z["29588"].count },
  { name: "29579, takes in Carolina Forest", value: Z["29579"].median, sales: Z["29579"].count },
  { name: "29577, holds Market Common", value: Z["29577"].median, sales: Z["29577"].count },
  { name: "29572, holds most of Grande Dunes", value: Z["29572"].median, sales: Z["29572"].count },
].map((r) => Object.assign(r, { valueText: `$${n(r.value)}` })), {
  caption: "The middle house sold for $350,000 in one Myrtle Beach zip code and $694,500 in another",
  nameLabel: "Zip code", valueLabel: "Middle sale price", compact: true,
  note: "Houses sold in the past 12 months, by the postal zip on the county address.",
});

const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  str: "https://www.cityofmyrtlebeach.com/news_detail_T6_R1468.php",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  title: "Myrtle Beach Homes for Sale: Houses and Townhomes, Live",
  description: "Myrtle Beach, SC houses and townhomes for sale, live from the MLS: by price, bedrooms, water, golf and neighborhood, what homes sold for and cost to own.",
  ogTitle: "Myrtle Beach, SC homes for sale: see the houses, then what they sold for",
  crumb: "Homes for sale",
  eyebrow: "Myrtle Beach, SC homes for sale",
  h1: "Myrtle Beach, SC homes for sale:",
  h1em: "the houses first, then what they cost to own.",
  sub: "More than 1,000 houses are for sale with a Myrtle Beach address, live from the MLS.",
  heroMedia: CSS,
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Myrtle Beach houses for sale are live in the strips below. The houses that sold in the past year went for a middle price of about $395,000.`,
    `The name covers four zip codes, and prices follow the zip, as the chart under the first strip shows.`,
  ],
  sections: [
    { h2: "What Myrtle Beach houses were listed this week?", toc: "Newest", id: "newest", html: () =>
      G.homesCss() + G.homesQScript() +
      S(`${C}&domMax=14`, "The newest Myrtle Beach houses, listed in the last 14 days") +
      NOTE(`Every strip shows houses with a Myrtle Beach address. Each links to its full search. Townhomes have their own strips below. Condos have their own page: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach condos for sale")}.`) +
      h.p(`Prices follow the zip code, not the city name.`) +
      ZIPS + TOCNAV },

    { h2: "What do houses in Myrtle Beach cost?", toc: "Prices", id: "prices", html: () =>
      S(`${C}&max=399999`, "Myrtle Beach houses under $400,000") +
      S(`${C}&min=400000&max=599999`, "Myrtle Beach houses from $400,000 to $599,999") +
      S(`${C}&min=600000`, "Myrtle Beach houses at $600,000 and up") +
      S(`${C}&min=1000000`, "Myrtle Beach houses at $1 million and up") +
      h.p(`The first three strips add up to every house for sale, with no overlap. Of the houses we checked, the lowest asking price is about $120,000. Asking price is not sale price. The sold-prices section below shows what houses sold for.`) },

    { h2: "How many bedrooms do Myrtle Beach houses have?", toc: "Bedrooms", id: "beds", html: () =>
      h.p(`More than half of the houses for sale have 4 bedrooms or more, so the strips start at 4 and at 5.`) +
      S(`${C}&beds=4`, "Myrtle Beach houses with 4 or more bedrooms") +
      S(`${C}&beds=5`, "Myrtle Beach houses with 5 or more bedrooms") },

    { h2: "Are there new homes for sale in Myrtle Beach?", toc: "New homes", id: "new", html: () =>
      h.p(`About 1 in 6 Myrtle Beach houses for sale is new construction. Builders and other companies sold 34 in 100 of the houses recorded in the past year. The three builders the listings name most are below.`) +
      S(`${C}&has=new_construction`, "New-construction houses in Myrtle Beach") +
      S(`${C}&has=quick_move_in`, "Myrtle Beach houses you can move into soon") +
      S(`${C}&has=builder_dr_horton`, "D.R. Horton houses in Myrtle Beach") +
      S(`${C}&has=builder_lennar`, "Lennar houses in Myrtle Beach") +
      S(`${C}&has=builder_pulte`, "Pulte houses in Myrtle Beach") +
      h.p(`Our ${h.a("/buyers/new-construction/builders/", "builders guide")} compares the builders, and our ${h.a("/buyers/new-construction/", "new construction guide")} covers what to check before you sign.`) },

    { h2: "Which Myrtle Beach houses have water, golf, land or one level?", toc: "What it has", id: "has", html: () =>
      NOTE(`These come from fields the listing agent fills in, so each strip says what the listing says.`) +
      S(`${C}&has=water_ocean`, "Houses listed as oceanfront in Myrtle Beach") +
      S(`${C}&has=water_icw`, "Myrtle Beach houses listed on the Intracoastal") +
      S(`${C}&has=water_lake`, "Myrtle Beach houses on a lake") +
      S(`${C}&has=private_dock`, "Myrtle Beach houses with a private dock") +
      h.p(`The ${h.a("/buyers/waterfront-homes/", "waterfront guide")} explains what to check on a house on the water.`) +
      S(`${C}&has=beach_1mi`, "Myrtle Beach houses within a mile of the beach") +
      S(`${C}&has=golf_community`, "Myrtle Beach houses in golf communities") +
      h.p(`The ${h.a("/buyers/golf-communities/", "golf communities guide")} compares them.`) +
      S(`${C}&lotMin=1`, "Myrtle Beach houses on an acre or more") +
      h.p(`For empty lots, see our ${h.a("/buyers/land/", "land guide")}.`) +
      S(`${C}&has=one_level`, "One-level Myrtle Beach houses") +
      S(`${C}&has=pool`, "Myrtle Beach houses with a pool") +
      S(`${C}&has=active_adult`, "Myrtle Beach houses in active-adult communities") +
      h.p(`The ${h.a("/buyers/senior-living/", "senior living guide")} explains active-adult communities.`) +
      S(`${C}&hoa=0`, "Myrtle Beach houses whose listing shows no HOA fee") +
      NOTE(`The listing agent enters the HOA line. Confirm it before you offer. More in ${h.a("/buyers/no-hoa-homes/", "our no-HOA guide")}.`) },

    { h2: "Which Myrtle Beach neighborhoods have houses for sale?", toc: "Neighborhoods", id: "hoods", html: () =>
      h.p(`Each strip holds one neighborhood's houses, named as the MLS names it. Where we have a page for the neighborhood, a link follows its strip.`) +
      S(`subdivision=Grande Dunes&city=Myrtle Beach&type=house`, "Grande Dunes houses for sale") +
      h.p(`${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes guide")}`) +
      S(`subdivision=Ocean Lakes&city=Myrtle Beach&type=house`, "Ocean Lakes houses for sale") +
      S(`subdivision=Market Common&city=Myrtle Beach&type=house`, "Market Common (also called Market Commons) houses for sale") +
      h.p(`${h.a("/submarkets/myrtle-beach/market-common/", "Market Common guide")}`) +
      S(`subdivision=Waterbridge&city=Myrtle Beach&type=house`, "Waterbridge houses for sale") +
      S(`subdivision=Clear Pond at Myrtle Beach National&city=Myrtle Beach&type=house`, "Clear Pond at Myrtle Beach National houses for sale") +
      S(`subdivision=Arcadia&city=Myrtle Beach&type=house`, "Arcadia houses for sale") +
      S(`subdivision=Bella Vita&city=Myrtle Beach&type=house`, "Bella Vita houses for sale") +
      S(`subdivision=Waterway Palms Plantation&city=Myrtle Beach&type=house`, "Waterway Palms Plantation houses for sale") +
      S(`subdivision=Winfield Farms&city=Myrtle Beach&type=house`, "Winfield Farms houses for sale") +
      S(`subdivision=Coopers Bluff&city=Myrtle Beach&type=house`, "Coopers Bluff houses for sale") +
      S(`subdivision=Carolina Forest - The Farm&city=Myrtle Beach&type=house`, "The Farm at Carolina Forest houses for sale") +
      h.p(`${h.a("/submarkets/carolina-forest/the-farm/", "The Farm guide")}`) +
      S(`subdivision=The Bluffs On The Waterway&city=Myrtle Beach&type=house`, "The Bluffs on the Waterway houses for sale") +
      S(`subdivision=Carolina Forest - Avalon&city=Myrtle Beach&type=house`, "Avalon houses for sale") +
      S(`subdivision=Plantation Point&city=Myrtle Beach&type=house`, "Plantation Point houses for sale") +
      h.p(`${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point guide")}`) +
      S(`subdivision=Oak Forest&city=Myrtle Beach&type=house`, "Oak Forest houses for sale") +
      h.p(`${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest guide")}`) +
      h.p(`More neighborhood guides: ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")}, ${h.a("/submarkets/myrtle-beach/windsor-plantation/", "Windsor Plantation")} and ${h.a("/submarkets/myrtle-beach/golf-and-yacht-club/", "Myrtle Beach Golf and Yacht Club")}.`) },

    { h2: "Are there townhomes for sale in Myrtle Beach?", toc: "Townhomes", id: "townhomes", html: () =>
      h.p(`On the listing sheets that showed a fee, the middle was $325 a month for a townhome and $100 for a house. These sheets are a sample and lean toward the cheaper homes.`) +
      S(`city=Myrtle Beach&type=townhouse`, "Myrtle Beach townhomes for sale") +
      S(`city=Myrtle Beach&type=townhouse&has=pool`, "Myrtle Beach townhomes with a pool") +
      NOTE(`The fee figures come from the listing sheets that answered our lookup (a sample), and those sheets lean toward the cheaper homes.`) },

    { h2: "What are the parts of Myrtle Beach, by zip code?", toc: "Which part", id: "which", html: () =>
      h.p(`Zip by zip, with the communities the listings name in each.`) +
      h.table(["Zip", "Middle price", "Communities in the listings"], [
        ["29588", "$350,000", "Winfield Farms, Coopers Bluff, Arcadia, Myrtle Beach Golf & Yacht"],
        ["29579", "$410,000", "Avalon, The Farm, Waterbridge, Clear Pond at Myrtle Beach National"],
        ["29577", "$415,000", "Market Common neighborhoods, The Villages at Withers Heights"],
        ["29572", "$694,500", "Grande Dunes: Islecrest, Cipriana Park, most of Del Webb"],
      ]) +
      NOTE(`Communities are from the listings that answered our lookup. A community can cross a zip line. 29579 takes in Carolina Forest and Forestbrook. Ocean Lakes houses are listed in 29575.`) +
      h.p(`About 3 in 4 homes with a Myrtle Beach mailing address are outside the city limits. None of zip 29588 is inside them, and nearly all of 29579 is outside. Most of 29577 and 29572 is inside. The county and the city tax differently, as the cost section shows.`) +
      h.p(`For Carolina Forest on its own, read our ${h.a("/submarkets/carolina-forest/", "Carolina Forest guide")}.`) },

    { h2: "What have Myrtle Beach houses sold for?", toc: "Sold prices", id: "sold", html: (bg) =>
      h.p(`In the past year, ${n(DD.houses.count)} houses sold with a Myrtle Beach address. Half of them sold between $300,000 and $545,000. We read the county's deed index to count them.`) +
      SOLD_BANDS +
      h.p(`Sellers recorded under a company name sold 34 in 100 of the houses, at a middle price of about $400,000. Sellers recorded under a person's name sold the rest, at about $391,000.`) +
      h.p(`Inside the city, resales of houses, villas and townhomes were about $880,000 in the Grande Dunes area and about $500,000 in the Market Common area.`) +
      NOTE(`Sales: Horry County deeds recorded in the past 12 months, with a price over $10,000, on one parcel the county codes as a house. Deeds with no price are not counted.`) +
      h.cta("Curious what one house paid?", "Give us an address. We pull its deed, its tax bill and its HOA papers, and tell you what we found.", "Have us pull the records", CONTACT, bg) },

    { h2: "What does a year cost to own a house in Myrtle Beach?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a house at the sale middle, $395,000, and assume the county values it at that price. South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent.`) +
      h.table(["House at $395,000", "Lived in (4%)", "Second home or rental (6%)"], [
        ["Inside the city", "About $1,600", "About $6,000"],
        ["Outside the city", "About $1,450 to $1,550", "About $4,750 to $4,850"],
      ]) +
      NOTE(`Outside the city, the range depends on a county fee that is on some bills and not others. Other fire and watershed districts add a little. The lower rate needs an application. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      h.p(`On the listing sheets that showed a fee, the HOA middle was $100 a month for a house, and the middle half ran from $80 to $125. It is the listing agent's entry, not the association's bill. See ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) +
      h.p(`About 1 in 28 of the houses that sold (117 of ${n(FL.houses)} lots) have their lot's center point in a FEMA high-risk flood zone. A lot can touch a zone its center misses, so we check each house on the ${h.a("/buyers/flood-zone-check/", "flood zone check")} before you offer.`) +
      h.p(`Inside the city limits, a rental under 90 days is legal only where the zoning allows it, and most traditional neighborhoods are not zoned for it. Check the zone before you count on nightly rent.`) },

    { h2: "Want to see one?", toc: "Tour a house", id: "tour", html: (bg) =>
      h.cta("We tour it with you, and check before you offer", "Before you offer on a Myrtle Beach house, we read its HOA papers and its flood file, then tell you what we found.", "Book a showing", CONTACT, bg) +
      h.p(`Looking at condos? See ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach condos for sale")}. For living in Myrtle Beach, read the ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach town guide")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")}, ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")} and ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}. Also ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Questions buyers ask about Myrtle Beach houses",
  faq: [
    { q: "How many homes are for sale in Myrtle Beach, SC?", a: `More than 1,000 houses and about 145 townhomes, plus condos on a separate page. The strips on this page are live, so the count moves daily.` },
    { q: "What do houses in Myrtle Beach sell for?", a: `In the past year the middle sale price was about $395,000. The middle half sold from $300,000 to $545,000.` },
    { q: "Why do Myrtle Beach prices differ so much?", a: `The name covers four zip codes. The middle house sold for about $350,000 in 29588, which takes in Socastee, and $694,500 in 29572, which holds most of Grande Dunes.` },
    { q: "Are most Myrtle Beach homes inside the city?", a: `No. About 3 in 4 homes with a Myrtle Beach mailing address are outside the city limits, and their tax rates differ from the city's.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "tax levy", href: SRC.levy },
    { name: "City of Myrtle Beach rental rules", href: SRC.str },
  ],
  sourcesNote: "Our counts: Horry County deeds, parcels and the FEMA flood map. Listings: CCMLS, live.",
  bottomCta: {
    h2: "Book a showing in Myrtle Beach.",
    p: "Pick a house from the strips above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Myrtle Beach SC homes for sale, Myrtle Beach houses for sale, homes Myrtle Beach, new homes in Myrtle Beach SC, Myrtle Beach townhomes for sale, Myrtle Beach real estate listings",
  about: "Homes for sale in Myrtle Beach, South Carolina, live from the MLS, with what houses sold for and what a year costs to own",
});
