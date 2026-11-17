/* /submarkets/little-river/homes-for-sale/ - Little River, SC homes for sale: a listing-first page. The homes are the page:
 * live strips by price, bedrooms, new construction, what the place has, condo building and neighborhood; short
 * answers between them (what houses sold for, what a year costs to own, which part is which, one offer); the town
 * guide at the end. Shape follows specs/conway-homes-for-sale.js.
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/little-river-homes-for-sale/facts.md, VERIFIED rows, and
 * CORRECTED rows at the verifier's values (VERIFY.md): HOA middles $505 condo and $105 house (not $496, $103),
 * flood about 1 in 44, no townhouse count printed, "builders and other companies".
 * Data: data/2026-11-f/little-river-homes-for-sale/. Deed and flood numbers are read from findings-deeds.json and
 * flood.json and checked below. Listing counts move daily, so the page prints none for a strip; each strip is live.
 * Pictures: no photo on the page (owner, 2026-11-17); two small charts.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/little-river/homes-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "little-river-homes-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const DD = read("findings-deeds.json"), FL = read("flood.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const must = (ok, msg) => { if (!ok) throw new Error(`little-river-homes-for-sale.js: ${msg}`); };

must(AIR.license === "Public domain", "the aerial photo record is missing");
/* Row 12 (VERIFIED): 668 houses sold; middle $350,000; middle half $292,000 to $450,000. */
must(DD.houses.count === 668 && DD.houses.median === 350000 && DD.houses.p25 === 292000 && DD.houses.p75 === 450000, "row 12 changed");
const PB = DD.house_price_bands;
must(PB["0-200000"] === 27 && PB["200000-300000"] === 159 && PB["300000-400000"] === 254 && PB["400000-500000"] === 100 && PB["500000-1000000000"] === 128, "row 13 changed");
/* Row 14 (VERIFIED): 230 sold by a business at a middle $338,337; 438 by a person at $351,250. */
must(DD.houses_seller_business.count === 230 && DD.houses_seller_person.count === 438 && Math.round(DD.houses_seller_business.median / 1000) === 338 && Math.round(DD.houses_seller_person.median / 1000) === 351, "row 14 changed");
/* Row 16 (CORRECTED): 15 of 657, about 1 in 44. */
must(FL.houses === 657 && FL.in_high_risk_zone === 15, "row 16 changed");

const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero figcaption{display:none}main#main .ww-hero img{aspect-ratio:3/1!important;object-position:50% 62%}main#main .detail-hero .ww-hero{margin-bottom:.9rem!important}}
main#main .ww-hero{max-width:640px!important}
main#main .c3-gchart,main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.4rem 0 1.4rem}
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]{margin-top:1rem!important}
main#main nav[aria-label="On this page"]>p{display:none}
main#main nav[aria-label="On this page"]>ul{display:flex!important;flex-wrap:nowrap;gap:1.2rem;overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch}
main#main nav[aria-label="On this page"] li{flex:none}main#main nav[aria-label="On this page"] li a{padding:.2rem 0!important;font-size:.9rem}
main#main .detail-hero .c3-glance li strong{line-height:1.4!important}main#main .detail-hero .c3-glance li span,main#main .detail-hero .c3-glance li{line-height:1.4!important}
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

const CONTACT = `/contact/?place=${encodeURIComponent("Little River")}`;
const H = "city=Little River&type=house";
const C = "city=Little River&type=condo";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;

/* Chart from the deed file (row 13). */
const SOLD_BANDS = (() => {
  const rows = [["Under $200,000", 27], ["$200,000 to $299,999", 159], ["$300,000 to $399,999", 254], ["$400,000 to $499,999", 100], ["$500,000 and up", 128]];
  const MAXV = 254, W = 640, HT = 300, bw = 82, gap = 28, x0 = 20, base = 235, top = 40;
  const cols = rows.map(([lab, v], i) => {
    const x = x0 + i * (bw + gap), hh = Math.round((base - top) * v / MAXV), y = base - hh;
    const words = lab.replace(" to ", " to|").replace("Under ", "Under|").replace(" and up", "|and up").split("|");
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="8" fill="#b8863b"/>`
      + `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-weight="700" font-size="20" fill="#1c2028">${n(v)}</text>`
      + words.map((w, k) => `<text x="${x + bw / 2}" y="${base + 24 + k * 19}" text-anchor="middle" font-size="15" fill="#4a5060">${w}</text>`).join("");
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${HT}" role="img" aria-label="Houses sold in Little River in the past year by sale price: 27 under $200,000, 159 from $200,000 to $299,999, 254 from $300,000 to $399,999, 100 from $400,000 to $499,999 and 128 at $500,000 and up." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Houses sold in Little River by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">The most common sale price band in Little River is $300,000 to $399,999</p>${svg}<figcaption>668 houses sold in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();

/* The wow chart (rows 11 and 25, CORRECTED): middle monthly HOA fee on the listing sheets. */
const FEES = G.bars([
  { name: "Condo", value: 505 },
  { name: "House", value: 105 },
].map((r) => Object.assign(r, { valueText: `$${r.value}` })), {
  caption: "A Little River condo's HOA fee is about five times a house's",
  nameLabel: "Kind of home", valueLabel: "Middle HOA fee a month", compact: true,
  note: "The middle fee shown on the listing sheets of homes for sale now: 178 condos and 164 houses show one. The listing agent enters it, so it is not the HOA's own bill.",
});

const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  nfip: "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  osrm: "https://project-osrm.org/",
};

const BLDG = [["Cypress Bay", "Cypress Bay"], ["Baytree", "Baytree"], ["Carolina Yacht Landing", "Carolina Yacht Landing"], ["Little River Inn Resort", "Little River Inn Resort"], ["Spinnaker", "Spinnaker"], ["Yacht Club at Lightkeepers Village", "Yacht Club at Lightkeepers Village"], ["Mariners Point", "Mariners Point"], ["Lightkeepers Village - HPR", "Lightkeepers Village"], ["Intercoastal Village", "Intercoastal Village"]];
const HOODS = [["Heather Glen", "Heather Glen"], ["Sandridge Park", "Sandridge Park"], ["River Hills", "River Hills"], ["Bridgewater", "Bridgewater"], ["Cypress Village", "Cypress Village"], ["Windjammer Village - LR", "Windjammer Village"], ["Lafayette Park", "Lafayette Park"], ["North Village", "North Village"], ["Blue Heron Retreat", "Blue Heron Retreat"], ["Palm Lakes Plantation", "Palm Lakes Plantation"], ["Woodlyn Meadows", "Woodlyn Meadows"], ["Grande Harbour", "Grande Harbour"]];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Little River", url: "/submarkets/little-river/" },
  title: "Little River SC Homes for Sale: Houses and Condos, Live",
  description: "Little River, SC homes for sale, live from the MLS: houses and condos by price, bedrooms, water and neighborhood, with sold prices and the cost to own.",
  ogTitle: "Little River, SC homes for sale: see the homes, then what they cost to own",
  crumb: "Homes for sale",
  eyebrow: "Little River, SC homes for sale",
  h1: "Little River, SC homes for sale:",
  h1em: "the homes first, then what they cost to own.",
  sub: "Houses, condos and townhomes with a Little River address, live from the MLS.",
  heroMedia: CSS + G.homesCss() + G.homesQScript() + S(`${H}&domMax=14`, "The newest houses for sale in Little River") + glance([
    { icon: "home", label: "Houses and condos for sale", text: "More than 180 of each" },
    { icon: "dollar", label: "Houses sold, middle price", text: "About $350,000" },
    { icon: "tax", label: "Yearly tax, lived-in house at the middle sale price", text: "About $1,400" },
    { icon: "flood", label: "Houses in a flood zone", text: "About 2 in 100" },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `The newest houses are above, and every strip below is live. A Little River condo costs far less to buy than a house, but its HOA fee is about five times a house's. Sold prices, the yearly cost to own and the town guide follow the strips.`,
  ],
  sections: [
    { h2: "What do houses in Little River cost?", toc: "House prices", id: "prices", html: () =>
      S(`${H}&max=299999`, "Little River houses under $300,000") +
      S(`${H}&min=300000&max=399999`, "Little River houses from $300,000 to $399,999") +
      S(`${H}&min=400000`, "Little River houses at $400,000 and up") +
      h.p(`Asking price is not sale price. More Little River houses sold for $300,000 to $399,999 than in any other band, so that band is where the sold-prices section below points.`) },

    { h2: "How many bedrooms do Little River houses have?", toc: "Bedrooms", id: "beds", html: () =>
      h.p(`Nearly every house for sale has 3 bedrooms or more, so the strips start at 4 and at 5.`) +
      S(`${H}&beds=4`, "Little River houses with 4 or more bedrooms") +
      S(`${H}&beds=5`, "Little River houses with 5 or more bedrooms") },

    { h2: "Are there new homes for sale in Little River?", toc: "New homes", id: "new", html: () =>
      h.p(`Builders and other companies sold about 34 in 100 of the houses that sold in the past year.`) +
      S(`${H}&has=new_construction`, "New-construction houses in Little River") +
      S(`${H}&has=quick_move_in`, "Little River houses you can move into soon") +
      h.p(`Our ${h.a("/buyers/new-construction/builders/", "builders guide")} compares the builders, and our ${h.a("/buyers/new-construction/", "new construction guide")} covers what to check before you sign.`) },

    { h2: "Which Little River houses have water, golf or one level?", toc: "What it has", id: "has", html: () =>
      S(`${H}&waterfront=1`, "Little River houses on the water") +
      S(`${H}&has=private_dock`, "Little River houses with a private dock") +
      S(`${H}&has=boat_access`, "Little River houses with boat access") +
      S(`${H}&has=water_lake`, "Little River houses on a lake") +
      S(`${H}&has=golf_community`, "Little River houses in golf communities") +
      S(`${H}&has=one_level`, "One-level Little River houses") +
      S(`${H}&has=pool`, "Little River houses with a pool") +
      S(`${H}&has=active_adult`, "Little River houses in active-adult communities") +
      h.p(`The ${h.a("/buyers/senior-living/", "senior living guide")} explains active-adult communities. For empty lots, see our ${h.a("/buyers/land/", "land guide")}.`) +
      S(`${H}&lotMin=1`, "Little River houses on an acre or more") +
      S(`${H}&hoa=0`, "Little River houses whose listing shows no HOA fee") +
      NOTE(`The listing agent enters the HOA line. Confirm it before you offer.`) },

    { h2: "Which Little River neighborhoods have houses for sale?", toc: "Neighborhoods", id: "hoods", html: () =>
      h.p(`Each neighborhood has its own HOA, so pick the neighborhood before you compare prices.`) +
      HOODS.map(([q, nm]) => S(`${H}&subdivision=${q}`, `${nm} houses for sale`)).join("") +
      h.p(`${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")} lists what these communities charge.`) },

    { h2: "What Little River condos are for sale?", toc: "Condos", id: "condos", html: () =>
      h.p(`The condo and the house are the first choice here, and the HOA fee is most of the difference in the yearly cost.`) +
      FEES +
      h.p(`Half of the condos show a fee of $403 to $570 a month, and half of the houses show $69 to $160. Some houses show no fee at all, and no condo does.`) +
      S(`${C}&max=199999`, "Little River condos under $200,000") +
      S(`${C}&min=200000&max=299999`, "Little River condos from $200,000 to $299,999") +
      S(`${C}&min=300000`, "Little River condos at $300,000 and up") +
      S(`${C}&beds=3`, "Little River condos with 3 or more bedrooms") +
      S(`${C}&waterfront=1`, "Little River condos on the water") +
      S(`${C}&has=private_dock`, "Little River condos with a dock") +
      S(`${C}&has=golf_community`, "Little River condos in golf communities") +
      S(`${C}&has=pool`, "Little River condos with a pool") +
      S(`${C}&domMax=30`, "Little River condos listed in the last 30 days") },

    { h2: "Which Little River building has the condo?", toc: "Condo buildings", id: "buildings", html: () =>
      h.p(`Each building has its own HOA fee, so compare units inside one building first.`) +
      BLDG.map(([q, nm]) => S(`${C}&subdivision=${q}`, `${nm} condos for sale`)).join("") },

    { h2: "Are there townhomes for sale in Little River?", toc: "Townhomes", id: "attached", html: () =>
      S(`city=Little River&type=townhouse`, "Little River townhomes for sale") +
      S(`city=Little River&type=townhouse&subdivision=Champions Park`, "Champions Park townhomes for sale") +
      h.p(`A townhome sits between the two. Townhomes that sold in the past year went for about $265,000.`) },

    { h2: "What have Little River homes sold for?", toc: "Sold prices", id: "sold", html: (bg) =>
      h.p(`In the past year, 668 houses sold with a Little River address. The middle price was about $350,000, and the middle half sold from about $292,000 to about $450,000. We read the county's deed index to count them.`) +
      SOLD_BANDS +
      h.p(`Builders and other companies sold 230 of the 668, at a middle price of about $338,000. People sold 438, at about $351,000.`) +
      h.p(`A condo with a Little River ZIP code usually sold for about $189,000. One on the waterway sold for about $263,000, and one away from it for about $180,000.`) +
      h.p(`Only 5 houses on the water resold in the year. The middle one sold for about $1.3 million. Five sales are too few to call that a typical price.`) +
      NOTE(`Sales: Horry County deeds recorded in the past 12 months, with a price over $10,000, on parcels the county codes as single-family. Deeds with no price are not counted. Condo figures count the ZIP code.`) +
      h.cta("Want to know what one home paid?", "Give us an address. A person at our office reads its deed, its tax bill and its HOA papers, and tells you what they say.", "Have us pull the records", CONTACT, bg) },

    { h2: "What does a year cost to own in Little River?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a house at the middle sale price, and assume the county values it at that price. South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent.`) +
      h.table(["Home", "Lived in (4%)", "Second home or rental (6%)"], [
        ["House at the middle sale price", "About $1,400", "About $4,300"],
        ["Condo at about $189,000", "About $800", "About $2,400"],
      ]) +
      NOTE(`Little River homes outside the city of North Myrtle Beach pay no city tax. The lower rate needs an application. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      h.p(`${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")} lists what each community charges.`) +
      h.p(`About 2 in 100 of the houses that sold (15 of 657) sit in a FEMA high-risk flood zone, judged by the house's center point. A flood policy outside that zone usually costs about $480 a year, and inside it about $1,250. A house near the water's edge can differ from that point, so we check each one on the ${h.a("/buyers/flood-zone-check/", "flood zone check")} before you offer.`) },

    { h2: "Which part of Little River is which?", toc: "Which part", id: "which", html: () =>
      h.p(`Little River has no town government or limits. Horry County runs it. About 246 homes with a Little River address sit inside the city of North Myrtle Beach and pay its city tax.`) +
      h.p(`Start from the old village, by US 17 and Mineola Avenue. With no traffic, McLeod Seacoast hospital is about 6 minutes away, and the beach at Cherry Grove Pier about 11.`) +
      h.p(`About 2 of every 3 deeded boat slips in Horry County are in Little River. The ${h.a("/submarkets/little-river/", "Little River town guide")} covers the slips and the marinas.`) },

    { h2: "Which Little River houses are priced where most sales land?", toc: "Common band", id: "tour", html: () =>
      S(`${H}&min=300000&max=399999&domMax=30`, "Houses at $300,000 to $399,999, listed in the last 30 days") +
      h.p(`We tour any of them with you, and we read the HOA papers and the flood file before you offer. For living in Little River, its waterfront and its history, read the ${h.a("/submarkets/little-river/", "Little River town guide")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")} and ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}. Also ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Little River homes for sale FAQ",
  faq: [
    { q: "How many homes are for sale in Little River, SC?", a: `The tiles at the top give the size of the market. The strips are live, so the count moves daily.` },
    { q: "What do houses in Little River sell for?", a: `The sold-prices section above gives the middle price and the range, counted from recorded deeds.` },
    { q: "Should I buy a house or a condo in Little River?", a: `The condo section above shows the HOA fee for each kind, and the cost section shows the yearly tax.` },
    { q: "Is Little River a town?", a: `No. It is a community with no town limits, run by Horry County. The town guide covers its waterfront and its history.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "FEMA flood policies", href: SRC.nfip },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "tax levy", href: SRC.levy },
    { name: "OpenStreetMap routes", href: SRC.osrm },
  ],
  sourcesNote: "Our counts: Horry County deeds, parcels and the FEMA flood map. Listings: CCMLS, live. HOA fees: the listing agent's entry. Drives: OpenStreetMap roads, no traffic.",
  bottomCta: {
    h2: "Book a showing in Little River.",
    p: "We tour it with you.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Little River SC homes for sale, Little River SC houses for sale, Little River SC townhomes for sale, new homes in Little River SC, Little River SC waterfront homes for sale",
  about: "Homes for sale in Little River, South Carolina, live from the MLS, with what homes sold for and what a year costs to own",
});
