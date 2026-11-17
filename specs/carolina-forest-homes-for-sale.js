/* /submarkets/carolina-forest/homes-for-sale/ - Carolina Forest, SC homes for sale: a listing-first page, built on the
 * Conway page's shape. Live strips by price, bedrooms, new construction, what the place has and neighborhood; short
 * answers between them; the town guide at the end.
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/carolina-forest-homes-for-sale/facts.md, VERIFIED rows and
 * CORRECTED rows at the verifier's values (VERIFY.md): no ask-price range, HOA "about $90 to $140", two-bedroom
 * condo HOA "about $300 to $500", no townhouse HOA, "sellers whose name is not a company", flood about 2 in 100.
 * "Carolina Forest" here is the MLS area filter has=area_carolina_forest. Deed numbers use ZIP 29579 in the three
 * county-only tax districts. Listing counts move daily, so the page prints none for a strip; each strip is live.
 * Pictures: no photo on the page (owner, 2026-11-17); one chart, the sold-price bands. Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/carolina-forest/homes-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "carolina-forest-homes-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const DD = read("findings-deeds-zip.json"), FL = read("flood.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const must = (ok, msg) => { if (!ok) throw new Error(`carolina-forest-homes-for-sale.js: ${msg}`); };

must(AIR.license === "Public domain", "the aerial photo record is missing");
/* Row 12 (VERIFIED): 1,340 houses sold; middle $400,000; middle half $303,000 to $540,000. */
must(DD.houses.count === 1340 && DD.houses.median === 400000 && DD.houses.p25 === 303000 && DD.houses.p75 === 540000, "row 12 changed");
/* Row 13 (VERIFIED): bands. */
const B = DD.house_price_bands;
must(B["0-300000"] === 327 && B["300000-400000"] === 337 && B["400000-500000"] === 274 && B["500000-600000"] === 159 && B["600000-1000000000"] === 243, "row 13 changed");
/* Row 14 (VERIFIED; wording CORRECTED): 861 sellers not a company; 479 companies; nine companies, 370. */
must(DD.houses_seller_person.count === 861 && DD.houses_seller_business.count === 479, "row 14 changed");
const TOP = DD.business_sellers_top.slice(0, 9);
must(TOP.reduce((s, r) => s + r[1], 0) === 370 && TOP[8][1] === 31, "row 14 nine companies changed");
/* Row 15 (VERIFIED): 26 of 1,307 parcels, all zone AE. */
must(FL.houses === 1307 && FL.in_high_risk_zone === 26, "row 15 changed");

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
main#main .detail-hero .c3-glance li{line-height:1.45!important}
main#main .detail-hero .c3-glance strong,main#main .detail-hero .c3-glance span.t{line-height:1.45!important}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

const CONTACT = `/contact/?place=${encodeURIComponent("Carolina Forest")}`;
const C = "has=area_carolina_forest&type=house";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;

/* Charts, from the deed file (rows 13 and 14). */
const SOLD_BANDS = (() => {
  const rows = [["Under $300,000", B["0-300000"]], ["$300,000 to $399,999", B["300000-400000"]], ["$400,000 to $499,999", B["400000-500000"]], ["$500,000 to $599,999", B["500000-600000"]], ["$600,000 and up", B["600000-1000000000"]]];
  const MAXV = 337, W = 640, H = 300, bw = 82, gap = 28, x0 = 20, base = 235, top = 40;
  const cols = rows.map(([lab, v], i) => {
    const x = x0 + i * (bw + gap), hh = Math.round((base - top) * v / MAXV), y = base - hh;
    const words = lab.replace(" to ", " to|").replace("Under ", "Under|").replace(" and up", "|and up").split("|");
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="8" fill="#b8863b"/>`
      + `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-weight="700" font-size="20" fill="#1c2028">${n(v)}</text>`
      + words.map((w, k) => `<text x="${x + bw / 2}" y="${base + 24 + k * 19}" text-anchor="middle" font-size="15" fill="#4a5060">${w}</text>`).join("");
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Houses sold in Carolina Forest in the past year by sale price: 327 under $300,000, 337 from $300,000 to $399,999, 274 from $400,000 to $499,999, 159 from $500,000 to $599,999 and 243 at $600,000 and up." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Houses sold in Carolina Forest by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">Most Carolina Forest houses sold for under $500,000</p>${svg}<figcaption>1,340 houses sold in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();
const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Carolina Forest", url: "/submarkets/carolina-forest/" },
  title: "Carolina Forest SC Homes for Sale: Live and Sold Prices",
  description: "Carolina Forest, SC homes for sale, live from the MLS: the newest, by price, bedrooms, new builds and neighborhood, plus what houses sold for and cost to own.",
  ogTitle: "Carolina Forest, SC homes for sale: see the houses, then what they sold for",
  crumb: "Homes for sale",
  eyebrow: "Carolina Forest, SC homes for sale",
  h1: "Carolina Forest, SC homes for sale:",
  h1em: "the houses first, then what they cost to own.",
  sub: "Houses, townhomes and condos in the area the MLS calls Carolina Forest, shown live, then what they sold for and cost to own.",
  heroMedia: CSS + G.homesCss() + G.homesQScript() + S(`${C}&domMax=14`, "The newest Carolina Forest houses, listed in the last 14 days") + glance([
    { icon: "home", label: "New homes", text: "About 1 in 6" },
    { icon: "dollar", label: "Middle sale price", text: "About $400,000" },
    { icon: "tax", label: "Tax, lived in / second home", text: "$1,560 / $4,900" },
    { icon: "flood", label: "Flood zone", text: "About 2 in 100" },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `About 300 houses are for sale in Carolina Forest now. The strips above and below show them, then what houses sold for and what a year costs to own. Houses are most of the market. Townhomes and condos are fewer, and each kind has its own strip further down.`,
  ],
  sections: [
    { h2: "What are the newest homes for sale in Carolina Forest?", toc: "Newest", id: "newest", html: () =>
      h.p(`The newest houses are the strip at the top of this page. Most homes for sale here are houses. Townhomes and condos come further down. Each strip links to its full search, and ${h.a("/homes/?has=area_carolina_forest&type=house", "all Carolina Forest houses")} are one click away.`) },

    { h2: "What do houses in Carolina Forest cost?", toc: "Prices", id: "prices", html: () =>
      S(`${C}&max=399999`, "Carolina Forest houses under $400,000") +
      S(`${C}&min=400000&max=599999`, "Carolina Forest houses from $400,000 to $599,999") +
      S(`${C}&min=600000`, "Carolina Forest houses at $600,000 and up") +
      h.p(`The three strips add up to every house for sale, with no overlap. Asking price is not sale price. The sold-prices section below shows what houses sold for.`) },

    { h2: "How many bedrooms do Carolina Forest houses have?", toc: "Bedrooms", id: "beds", html: () =>
      h.p(`Nearly every house for sale has 3 bedrooms or more, so the strips start at 4 and at 5.`) +
      S(`${C}&beds=4`, "Carolina Forest houses with 4 or more bedrooms") +
      S(`${C}&beds=5`, "Carolina Forest houses with 5 or more bedrooms") },

    { h2: "Are there new homes for sale in Carolina Forest?", toc: "New homes", id: "new", html: () =>
      h.p(`About one in six houses for sale here is new construction. Nine companies each sold 31 or more Carolina Forest houses in the past year, 370 of the 1,340 recorded sales.`) +
      h.p(`That is 28 in 100 of the houses recorded here in the past year. Builders such as Lennar, D.R. Horton and NVR lead the list.`) +
      S(`${C}&has=new_construction`, "New-construction houses in Carolina Forest") +
      h.p(`Our ${h.a("/buyers/new-construction/builders/", "builders guide")} compares the builders, and our ${h.a("/buyers/new-construction/", "new construction guide")} covers what to check before you sign.`) },

    { h2: "Which Carolina Forest homes have water, golf, a pool or one level?", toc: "What it has", id: "has", html: () =>
      S(`${C}&waterfront=1`, "Carolina Forest houses on the water") +
      S(`${C}&has=water_lake`, "Carolina Forest houses on a lake or pond") +
      S(`${C}&has=pool`, "Carolina Forest houses with their own pool") +
      S(`${C}&has=golf_community`, "Carolina Forest houses in golf communities") +
      S(`${C}&has=on_golf_course`, "Carolina Forest houses on the golf course") +
      S(`${C}&has=one_level`, "One-level Carolina Forest houses") +
      h.p(`For empty lots, see our ${h.a("/buyers/land/", "land guide")}.`) },

    { h2: "Which Carolina Forest neighborhoods have homes for sale?", toc: "Neighborhoods", id: "hoods", html: () =>
      h.p(`Each strip below holds one neighborhood's houses, as the MLS names it. The first three have pages of their own.`) +
      S(`${C}&subdivision=Carolina Forest - The Farm`, "The Farm houses for sale") +
      h.p(`${h.a("/submarkets/carolina-forest/the-farm/", "The Farm")} has its own page.`) +
      S(`${C}&subdivision=Landing at River Oaks`, "Landing at River Oaks houses for sale") +
      S(`has=area_carolina_forest&type=condo&subdivision=RIVER OAKS CONDOS&max=400000`, "River Oaks condos for sale") +
      h.p(`${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} has its own page.`) +
      S(`${C}&subdivision=Wild Wing Plantation`, "Wild Wing Plantation houses for sale") +
      h.p(`${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} shows a Conway ZIP code, 29526, and has its own page.`) +
      S(`${C}&subdivision=Waterbridge`, "Waterbridge houses for sale") +
      S(`${C}&subdivision=Bella Vita`, "Bella Vita houses for sale") +
      S(`${C}&subdivision=Berkshire Forest-Carolina Forest`, "Berkshire Forest houses for sale") +
      S(`${C}&subdivision=Plantation Lakes`, "Plantation Lakes houses for sale") +
      S(`${C}&subdivision=Carolina Forest - Avalon`, "Avalon houses for sale") +
      S(`${C}&subdivision=The Parks of Carolina Forest`, "The Parks of Carolina Forest houses for sale") +
      S(`${C}&subdivision=Clear Pond at Myrtle Beach National`, "Clear Pond at Myrtle Beach National houses for sale") +
      S(`${C}&subdivision=Waterway Palms Plantation`, "Waterway Palms Plantation houses for sale") +
      S(`${C}&subdivision=The Bluffs On The Waterway`, "The Bluffs on the Waterway houses for sale") +
      h.p(`Other neighborhoods have a few homes at a time. Use ${h.a("/homes/?has=area_carolina_forest&type=house", "the full search")} to see them.`) },

    { h2: "Are there townhomes or condos for sale in Carolina Forest?", toc: "Townhomes, condos", id: "attached", html: () =>
      h.p(`Houses are most of the market. Townhomes and condos are a smaller part, and the strips below show them.`) +
      S(`has=area_carolina_forest&type=condo&max=400000`, "Carolina Forest condos for sale") +
      S(`has=area_carolina_forest&type=townhouse&max=400000`, "Carolina Forest townhomes for sale") +
      h.p(`A two-bedroom condo shows a monthly HOA fee of about $300 to $500, with a middle of about $400 to $420. A house shows about $90 to $140.`) },

    { h2: "What have Carolina Forest houses sold for?", toc: "Sold prices", id: "sold", html: () =>
      h.p(`In the past year, 1,340 houses sold in Carolina Forest. The middle price was about $400,000, and the middle half sold from about $303,000 to about $540,000. We read the county's deed index to count them.`) +
      SOLD_BANDS +
      h.p(`Sellers whose name is not a company sold 861 of the 1,340 houses, at a middle price of about $395,000. Companies sold 479, at about $410,000.`) +
      NOTE(`Sales: Horry County deeds recorded in the past 12 months, with a price over $10,000. Each is on a single-family parcel with a 29579 address, in a tax district with no city levy.`)  },

    { h2: "What does a year cost to own a house in Carolina Forest?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a house at the sale middle, about $400,000, and assume the county values it at that price. South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent. Carolina Forest has no city tax, so one county rate applies.`) +
      h.table(["House at about $400,000", "Lived in (4%)", "Second home or rental (6%)"], [
        ["Property tax a year, with the county stormwater fee", "About $1,560", "About $4,900"],
      ]) +
      NOTE(`The lower rate needs an application. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      h.p(`The monthly HOA fee shown for a house for sale is about $90 to $140, with a middle of about $110. The seller's agent enters that number, so it is not the HOA's own bill. See ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) +
      h.p(`About 2 in 100 of the houses that sold sit in a FEMA high-risk flood zone (26 of 1,307 lots). We checked each lot's center. A lot can touch a zone its center misses, so we check each house on the ${h.a("/buyers/flood-zone-check/", "flood zone check")} before you offer.`) },

    { h2: "What counts as Carolina Forest?", toc: "Which part", id: "which", html: () =>
      h.p(`Carolina Forest here means the MLS area of that name. Most of its houses show a Myrtle Beach mailing address, ZIP 29579. Wild Wing Plantation shows a Conway ZIP, 29526.`) +
      h.p(`Some neighborhoods have pages of their own: ${h.a("/submarkets/carolina-forest/the-farm/", "The Farm")}, ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} and ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")}.`) },

    { h2: "Which Carolina Forest houses can you move into soon?", toc: "Move in soon", id: "tour", html: () =>
      S(`${C}&has=quick_move_in`, "Carolina Forest houses you can move into soon") +
      h.p(`${h.a(CONTACT, "Book a showing")} on any house in a strip. For living in Carolina Forest, read the ${h.a("/submarkets/carolina-forest/", "Carolina Forest town guide")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")}, ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")} and ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}. Also ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Carolina Forest homes for sale FAQ",
  faq: [
    { q: "How many homes are for sale in Carolina Forest, SC?", a: `About 300 houses, plus townhomes and condos. The strips on this page are live, so the count moves daily.` },
    { q: "What do houses in Carolina Forest sell for?", a: `The "What have Carolina Forest houses sold for?" section above gives the middle price and the range, counted from recorded deeds.` },
    { q: "Is there a city tax in Carolina Forest?", a: `No. One county rate applies. The cost to own section above shows the yearly tax.` },
    { q: "Is new construction common in Carolina Forest?", a: `Yes. The new homes section above shows the share and the nine companies that sold the most.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "tax levy", href: SRC.levy },
  ],
  sourcesNote: "Our counts: Horry County deeds, parcels and the FEMA flood map. Listings: CCMLS, live.",
  bottomCta: {
    h2: "Book a showing in Carolina Forest.",
    p: "Name a house from any strip. We tour it with you, and read its HOA papers and its flood file before you offer.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Carolina Forest homes for sale, Carolina Forest SC homes for sale, new homes in Carolina Forest, Carolina Forest SC houses for sale, Carolina Forest condos for sale, Carolina Forest townhomes for sale",
  about: "Homes for sale in Carolina Forest, South Carolina, live from the MLS, with what houses sold for and what a year costs to own",
});
