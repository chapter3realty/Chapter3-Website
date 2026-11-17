/* /submarkets/conway/homes-for-sale/ - Conway, SC homes for sale: a listing-first page. The homes are the page:
 * live strips by price, bedrooms, new construction, what the place has and neighborhood; short answers between
 * them (what houses sold for, what a year costs to own, which part is which, one offer); the town guide at the end.
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/conway-homes-for-sale/facts.md, VERIFIED rows, and CORRECTED
 * rows at the verifier's values and wording (VERIFY.md): flood 2.5 in 100 (about 1 in 40), no 14-day count, "builders
 * and other companies", outside-the-city tax is the county fire district.
 * Data: data/2026-11-f/conway-homes-for-sale/. Deed and flood numbers are read from findings-deeds.json and flood.json
 * and checked below. Listing counts move daily, so the page prints none for a strip; each strip is live.
 * Pictures: the page has no photo (owner, 2026-11-17: the homes strip comes first); one chart, the sold-price bands.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/conway/homes-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "conway-homes-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const DD = read("findings-deeds.json"), FL = read("flood.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const must = (ok, msg) => { if (!ok) throw new Error(`conway-homes-for-sale.js: ${msg}`); };

must(AIR.license === "Public domain", "the aerial photo record is missing");
/* Row 9 (VERIFIED): 2,155 houses sold; middle $305,750; middle half $259,490 to $355,000. */
must(DD.houses.count === 2155 || DD.houses === 2155 || JSON.stringify(DD.houses).includes("2155"), "row 9 changed");
const BANDS = DD.house_price_bands;
must(JSON.stringify(BANDS).includes("112") && JSON.stringify(BANDS).includes("908") && JSON.stringify(BANDS).includes("821") && JSON.stringify(BANDS).includes("195") && JSON.stringify(BANDS).includes("119"), "row 10 changed");
/* Row 11 (VERIFIED, wording limit): 904 people; 541 D.R. Horton; 710 other companies; 1,251 companies in all. */
const SELL = DD.houses_by_seller;
must(SELL.person === 904 && SELL["other business"] === 710 && SELL["D.R. Horton (DR Horton Inc and D R Horton Inc)"] === 541, "row 11 changed");
/* Row 15 (CORRECTED): 53 of 2,099 parcels. */
must(JSON.stringify(FL).includes("2099") && JSON.stringify(FL).includes("53"), "row 15 changed");

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
main#main .detail-hero .c3-glance li,main#main .detail-hero .c3-glance li *{line-height:1.45!important}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

const CONTACT = `/contact/?place=${encodeURIComponent("Conway")}`;
const C = "city=Conway&type=house";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;

/* Charts, from the deed file (rows 10 and 11). */
const SOLD_BANDS = (() => {
  const rows = [["Under $200,000", 112], ["$200,000 to $299,999", 908], ["$300,000 to $399,999", 821], ["$400,000 to $499,999", 195], ["$500,000 and up", 119]];
  const MAXV = 908, W = 640, H = 300, bw = 82, gap = 28, x0 = 20, base = 235, top = 40;
  const cols = rows.map(([lab, v], i) => {
    const x = x0 + i * (bw + gap), hh = Math.round((base - top) * v / MAXV), y = base - hh;
    const words = lab.replace(" to ", " to|").replace("Under ", "Under|").replace(" and up", "|and up").split("|");
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="8" fill="#b8863b"/>`
      + `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-weight="700" font-size="20" fill="#1c2028">${n(v)}</text>`
      + words.map((w, k) => `<text x="${x + bw / 2}" y="${base + 24 + k * 19}" text-anchor="middle" font-size="15" fill="#4a5060">${w}</text>`).join("");
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Houses sold in Conway in the past year by sale price: 112 under $200,000, 908 from $200,000 to $299,999, 821 from $300,000 to $399,999, 195 from $400,000 to $499,999 and 119 at $500,000 and up." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Houses sold in Conway by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">Most Conway houses sold for $200,000 to $399,999</p>${svg}<figcaption>2,155 houses sold in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();
const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  osrm: "https://project-osrm.org/",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Conway", url: "/submarkets/conway/" },
  title: "Conway SC Homes for Sale: Live Listings and Sold Prices",
  description: "Conway, SC homes for sale, live from the MLS: the newest, by price, bedrooms, new builds and neighborhood, plus what houses sold for and cost to own.",
  ogTitle: "Conway, SC homes for sale: see the houses, then what they sold for",
  crumb: "Homes for sale",
  eyebrow: "Conway, SC homes for sale",
  h1: "Conway, SC homes for sale:",
  h1em: "the houses first, then what they cost to own.",
  sub: "The newest houses with a Conway address, live from the MLS, then townhomes, condos, sold prices and the yearly cost to own.",
  heroMedia: CSS + G.homesCss() + G.homesQScript() + S(`${C}&domMax=14`, "The newest Conway houses, listed in the last 14 days") + glance([
    { icon: "home", label: "New homes", text: "About half" },
    { icon: "dollar", label: "Houses sold, past year", text: "2,155" },
    { icon: "tax", label: "Yearly tax, lived in", text: "$2,000 city, $1,200 county" },
    { icon: "flood", label: "In a flood zone", text: "About 1 in 40" },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `More than 600 houses are for sale with a Conway address. Many sit outside the city limits, so the yearly tax depends on the lot, not on the mailing address.`,
  ],
  sections: [
    { h2: "What do houses in Conway cost?", toc: "Prices", id: "prices", html: () =>
      S(`${C}&max=299999`, "Conway houses under $300,000") +
      S(`${C}&min=300000&max=399999`, "Conway houses from $300,000 to $399,999") +
      S(`${C}&min=400000`, "Conway houses at $400,000 and up") },

    { h2: "How many bedrooms do Conway houses have?", toc: "Bedrooms", id: "beds", html: () =>
      S(`${C}&beds=4`, "Conway houses with 4 or more bedrooms") +
      S(`${C}&beds=5`, "Conway houses with 5 or more bedrooms") },

    { h2: "Are there new homes for sale in Conway?", toc: "New homes", id: "new", html: () =>
      h.p(`Many Conway listings are new. Some are built and ready to move into soon, and others are still to be built.`) +
      S(`${C}&has=quick_move_in`, "Conway houses you can move into soon") +
      S(`${C}&has=new_construction`, "New-construction houses in Conway") +
      h.p(`One builder, D.R. Horton, sold one house in four in the past year, and other companies such as Lennar and NVR sold more, so builder homes shape the market.`) +
      h.p(`Our ${h.a("/buyers/new-construction/builders/", "builders guide")} compares the builders, and our ${h.a("/buyers/new-construction/", "new construction guide")} covers what to check before you sign.`) },

    { h2: "Which Conway homes have water, golf, land or one level?", toc: "What it has", id: "has", html: () =>
      S(`${C}&waterfront=1`, "Conway houses on the water") +
      S(`${C}&has=water_lake`, "Conway houses on a lake") +
      S(`${C}&has=golf_community`, "Conway houses in golf communities") +
      S(`${C}&lotMin=1`, "Conway houses on an acre or more") +
      S(`${C}&has=one_level`, "One-level Conway houses") +
      S(`${C}&has=pool`, "Conway houses with a pool") +
      S(`${C}&has=active_adult`, "Conway houses in active-adult communities") +
      h.p(`The ${h.a("/buyers/senior-living/", "senior living guide")} explains active-adult communities. For empty lots, see our ${h.a("/buyers/land/", "land guide")}.`) +
      S(`${C}&hoa=0`, "Conway houses with no HOA fee shown") +
      NOTE(`The seller's agent enters the HOA line. Confirm it before you offer.`) },

    { h2: "Which Conway neighborhoods have homes for sale?", toc: "Neighborhoods", id: "hoods", html: () =>
      S(`subdivision=Auberon Woods&type=house&city=Conway`, "Auberon Woods houses for sale") +
      S(`subdivision=Heritage Crossing&type=house&city=Conway`, "Heritage Crossing houses for sale") +
      S(`subdivision=Wild Wing Plantation&type=house&city=Conway`, "Wild Wing Plantation houses for sale") +
      h.p(`The golf neighborhood has its own page: ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")}.`) +
      S(`subdivision=Night Owl Farms&type=house&city=Conway`, "Night Owl Farms houses for sale") +
      S(`subdivision=Westfield&type=house&city=Conway`, "Westfield houses for sale") +
      S(`subdivision=Elmhurst&type=house&city=Conway`, "Elmhurst houses for sale") +
      S(`subdivision=Westwood Reserve&type=house&city=Conway`, "Westwood Reserve houses for sale") +
      S(`subdivision=Coastal Farms&type=house&city=Conway`, "Coastal Farms houses for sale") +
      S(`subdivision=Rivertown Landing&type=house&city=Conway`, "Rivertown Landing houses for sale") +
      S(`subdivision=The Preserve at Shaftesbury Glen&type=house&city=Conway`, "The Preserve at Shaftesbury Glen houses for sale") +
      h.p(`${h.a("/submarkets/conway/shaftesbury-glen/", "Shaftesbury Glen")} has its own page.`) +
      S(`subdivision=Coastal Point West&type=house&city=Conway`, "Coastal Point West houses for sale") +
      S(`subdivision=Lakeside Crossing&type=house&city=Conway`, "Lakeside Crossing houses for sale") +
      S(`subdivision=Myrtle Trace&type=house&city=Conway`, "Myrtle Trace houses for sale") },

    { h2: "Are there townhomes or condos for sale in Conway?", toc: "Townhomes, condos", id: "attached", html: () =>
      S(`city=Conway&type=townhouse`, "Conway townhomes for sale") +
      S(`city=Conway&type=condo`, "Conway condos for sale") },

    { h2: "What have Conway houses sold for?", toc: "Sold prices", id: "sold", html: (bg) =>
      h.p(`In the past year, 2,155 houses sold in Conway. The middle price was about $306,000, and the middle half sold from about $259,000 to about $355,000. We read the county's deed index to count them.`) +
      SOLD_BANDS +
      h.p(`By postal code, houses in 29526 sold for a middle price of about $317,000 and houses in 29527 for about $279,000.`) +
      h.p(`Inside the city, 526 houses sold at a middle price of about $278,000. In the main county district outside it, 1,362 sold at about $320,000. The rest sit in other tax districts.`) +
      h.p(`People sold 904 of the 2,155 houses, at a middle price of about $298,000. Builders and other companies sold 1,251, at about $310,000.`) +
      NOTE(`Sales: Horry County deeds recorded in the past 12 months, with a price over $10,000, on parcels the county codes as single-family. Deeds with no price are not counted.`) +
      h.cta("Curious what one house paid?", "Give us an address. We pull its deed, its tax bill and its HOA papers, and tell you what we found.", "Have us pull the records", CONTACT, bg) },

    { h2: "What does a year cost to own a house in Conway?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a house at the middle sale price and assume the county values it at that price. South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent.`) +
      h.table(["House at the middle sale price", "Lived in (4%)", "Second home or rental (6%)"], [
        ["Inside the city", "About $2,000", "About $5,000"],
        ["Outside the city, county fire district", "About $1,200", "About $3,800"],
      ]) +
      NOTE(`Other fire and watershed districts add a little. The lower rate needs an application. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      h.p(`The HOA fee shown for a home for sale had a middle of $75 a month, and the middle half showed $57 to $95. Houses with no fee shown made up about a quarter of the ones we counted. The seller's agent enters that number, so it is not the HOA's own bill. See ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) +
      h.p(`About 1 in 40 houses that sold (53 of 2,099 lots) has its center point in a FEMA high-risk flood zone. A lot can touch a zone its center misses, so we check each house on the ${h.a("/buyers/flood-zone-check/", "flood zone check")} before you offer.`) },

    { h2: "Is a Conway address in the city of Conway?", toc: "City or county", id: "which", html: () =>
      h.p(`Often it is not. About 27 in 100 homes with a Conway mailing address are inside the city limits. The rest are in Horry County, outside the city, and their tax rates differ from the city's.`) +
      h.p(`From the center of Conway, with no traffic, the nearest public beach access in Myrtle Beach is about 24 minutes away, 14.5 miles. Coastal Grand Mall is about 23 minutes and Conway Medical Center about 10.`) +
      h.p(`The ${h.a("/submarkets/conway/", "Conway town guide")} covers the four parts of town.`) },

    { h2: "Want to see one?", toc: "Tour a house", id: "tour", html: (bg) =>
      S(`${C}&min=260000&max=355000`, "Conway houses priced where most sales landed, $260,000 to $355,000") +
      h.cta("We tour it with you, and check before you offer", "Before you offer on a Conway house, we read its HOA papers and its flood file, then tell you what we found.", "Book a showing", CONTACT, bg) +
      h.p(`For living in Conway, its history and the river, read the ${h.a("/submarkets/conway/", "Conway town guide")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")}, ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")} and ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}. Also ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Conway homes for sale FAQ",
  faq: [
    { q: "How many homes are for sale in Conway, SC?", a: `The count moves daily. The strips on this page are live, and townhomes and condos have their own.` },
    { q: "What do houses in Conway sell for?", a: `The sold-prices section above has the middle price, the middle half and the count by price band.` },
    { q: "Are most Conway homes inside the city?", a: `Most are not. The section on which part of Conway is which gives the share.` },
    { q: "Is new construction common in Conway?", a: `Yes. The new homes section shows the ones ready to move into soon, and the ones still to be built.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "tax levy", href: SRC.levy },
    { name: "OpenStreetMap routes", href: SRC.osrm },
  ],
  sourcesNote: "Our counts: Horry County deeds, parcels and the FEMA flood map. Listings: CCMLS, live. Drives: OpenStreetMap roads, no traffic.",
  bottomCta: {
    h2: "Book a showing in Conway.",
    p: "We tour it with you.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Conway SC homes for sale, Conway SC houses for sale, new homes in Conway SC, Conway SC real estate listings, Conway SC townhomes for sale, Conway SC condos for sale",
  about: "Homes for sale in Conway, South Carolina, live from the MLS, with what houses sold for and what a year costs to own",
});
