/* /submarkets/garden-city/homes-for-sale/ - Garden City, SC homes for sale: a listing-first page. The homes are the page:
 * live strips by newest, price, oceanfront, water, rentals, what the homes have, building and part of town; short
 * answers between them (what homes sold for, what a year costs to own, which part is which, one offer); the town
 * guide at the end. Follows specs/conway-homes-for-sale.js, with this place's own data.
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/garden-city-homes-for-sale/facts.md, VERIFIED rows, and
 * CORRECTED rows at the verifier's values and wording (VERIFY.md): condo fees only as a broad range, no fee by size,
 * the house middle half's upper end as "about $1.6 million", no builder word for sellers.
 * Garden City is not an MLS city. Every strip uses the CRM's own area, has=area_garden_city (or a circle, near=).
 * Data: data/2026-11-f/garden-city-homes-for-sale/. Deed and flood numbers are read from findings-deeds.json and
 * flood.json and checked below. Listing counts move daily, so the page prints few; each strip is live.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/garden-city/homes-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "garden-city-homes-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const PHOTOS = read("photos.json").photos;
const HERO = PHOTOS.find((p) => p.file.endsWith("garden-city-condos-2011.webp"));
const MARSH = PHOTOS.find((p) => p.file.endsWith("garden-city-marsh-from-above-1200w.webp"));
const DD = read("findings-deeds.json"), FL = read("flood.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const must = (ok, msg) => { if (!ok) throw new Error(`garden-city-homes-for-sale.js: ${msg}`); };

must(HERO && HERO.license === "Public domain" && MARSH && MARSH.license === "Public domain", "a photo record is missing");
/* Row 14 (VERIFIED): 258 condos, middle $221,250; 181 houses, middle $350,000; Horry side. */
must(DD.condo.count === 258 && DD.condo.median === 221250 && DD.house.count === 181 && DD.house.median === 350000, "row 14 changed");
/* Row 15 (VERIFIED): bands. */
const CB = DD.condo.bands, HB = DD.house.bands;
must(CB["0-200000"] === 114 && CB["200000-300000"] === 52 && CB["300000-400000"] === 44 && CB["400000-600000"] === 27 && CB["600000-1000000000"] === 21, "row 15 condo bands changed");
must(HB["0-200000"] === 1 && HB["200000-300000"] === 63 && HB["300000-400000"] === 47 && HB["400000-600000"] === 29 && HB["600000-1000000000"] === 41, "row 15 house bands changed");
/* Row 17 (VERIFIED): flood. */
must(FL.by_kind.condo[0] === 122 && FL.by_kind.condo[1] === 250 && FL.by_kind.house[0] === 45 && FL.by_kind.house[1] === 177, "row 17 changed");
/* Rows 19 to 21 (VERIFIED): tax at 207.3 mills (6 percent) and 98.2 mills (4 percent). */
const tax6 = (v) => v * 0.06 * 0.2073, tax4 = (v) => v * 0.04 * 0.0982;
must(Math.round(tax6(221250)) === 2752 && Math.round(tax4(221250)) === 869 && Math.round(tax6(350000)) === 4353 && Math.round(tax4(350000)) === 1375, "row 20 changed");
must(Math.round(tax6(319900)) === 3979 && Math.round(tax4(319900)) === 1257, "row 21 changed");

const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .detail-hero .eyebrow,main#main .detail-hero .detail-sub{display:none}
main#main .detail-hero{padding-top:1rem!important}
main#main .detail-hero .breadcrumb{margin-bottom:.6rem!important}
main#main .detail-hero{padding-bottom:1rem!important}
main#main .detail-hero .ww-hero figcaption{font-size:.8rem;padding:.3rem .6rem}
main#main>section:nth-of-type(1){padding:1.2rem 0 1rem!important}
main#main>section:nth-of-type(1) p{margin-bottom:.4rem}
main#main>section#newest{padding-top:1.4rem!important}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;object-position:50% 55%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:3/1}main#main .detail-hero .ww-hero{margin-bottom:.9rem!important}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:7/1}main#main .detail-hero .detail-media{max-width:1100px!important}}
main#main .c3-gchart,main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.4rem 0 1.4rem}
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

const CONTACT = `/contact/?place=${encodeURIComponent("Garden City")}`;
const A = "has=area_garden_city";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;
const SEE = h.a("/homes/?has=area_garden_city", "See every Garden City home in our search");

/* Charts, from the deed file (rows 14 and 15). */
const BAND_NAMES = ["Under $200,000", "$200,000 to $299,999", "$300,000 to $399,999", "$400,000 to $599,999", "$600,000 and up"];
const KEYS = ["0-200000", "200000-300000", "300000-400000", "400000-600000", "600000-1000000000"];
const bandChart = (bands, unit, caption, note) => G.bars(KEYS.map((k, i) => ({ name: BAND_NAMES[i], value: bands[k], valueText: `${n(bands[k])} ${unit}` })), {
  caption, nameLabel: "Sale price", valueLabel: `${unit[0].toUpperCase()}${unit.slice(1)} sold`, compact: true, format: (v) => n(v), note,
});
const CONDO_BANDS = bandChart(CB, "condos", "More Garden City condos sold for under $200,000 than in any other price band", "258 condos sold in the past 12 months on the Horry County side, counted by the price on the deed.");
const HOUSE_BANDS = bandChart(HB, "houses", "Garden City houses sold across a wide spread, most from $200,000 to $399,999", "181 houses sold in the past 12 months on the Horry County side, counted by the price on the deed.");
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
  hub: { name: "Garden City", url: "/submarkets/garden-city/" },
  title: "Garden City SC Homes for Sale: Condos and Houses, Live",
  description: "Garden City, SC homes for sale, live from the MLS: oceanfront condos, houses on the marsh, buildings, price bands, what homes sold for and what a year costs.",
  ogTitle: "Garden City, SC homes for sale: see the homes, then what a year costs",
  crumb: "Homes for sale",
  eyebrow: "Garden City, SC homes for sale",
  h1: "Garden City, SC homes for sale:",
  h1em: "the homes first, then what they cost to own.",
  sub: "Condos and houses in and around Garden City, live from the MLS, with what they sold for and what a year costs to own.",
  heroMedia: CSS,
  heroCta: false,
  toc: false,
  author: "devin",
  shortAnswer: [
    `132 homes are for sale in and around Garden City now: 77 condos asking a middle $299,000 and 55 houses asking $950,000. In the past year condos sold for a middle $221,250 and houses for $350,000, on the Horry County side.`,
  ],
  sections: [
    { h2: "What Garden City homes were listed most recently?", toc: "Newest", id: "newest", html: () =>
      G.homesCss() + G.homesQScript() +
      S(`${A}&type=house&domMax=30`, "New Garden City houses, listed in the last 30 days") +
      S(`${A}&type=condo&domMax=30`, "New Garden City condos, listed in the last 30 days") +
      h.p(`The MLS has no Garden City city, so a city search finds nothing. These strips use our own Garden City area, and the mailing address on a home can read Garden City Beach, Murrells Inlet or Surfside Beach. ${SEE}.`) },

    { h2: "What do Garden City condos cost?", toc: "Condo prices", id: "condo-prices", html: () =>
      S(`${A}&type=condo&max=249999`, "Garden City condos under $250,000") +
      S(`${A}&type=condo&min=250000&max=399999`, "Garden City condos from $250,000 to $399,999") +
      S(`${A}&type=condo&min=400000`, "Garden City condos at $400,000 and up") +
      h.p(`On the ocean side of Waccamaw Drive, fewer than 1 in 10 homes is taxed at the 4 percent rate. Most ocean-side condos pay the second-home rate.`) +
      h.p(`The middle ocean-side condo sold for $319,900. As a second home or rental it pays about $3,980 a year in tax. As a main home it pays about $1,260.`) +
      h.p(`The three strips hold every condo for sale, with no overlap. Asking price is not sale price: the sold-prices section below shows what condos sold for.`) },

    { h2: "What do Garden City houses cost?", toc: "House prices", id: "house-prices", html: () =>
      S(`${A}&type=house&max=749999`, "Garden City houses under $750,000") +
      S(`${A}&type=house&min=750000&max=1499999`, "Garden City houses from $750,000 to $1.5 million") +
      S(`${A}&type=house&min=1500000`, "Garden City houses at $1.5 million and up") +
      h.p(`Houses ask a middle of about $950,000, and about half ask $1,000,000 or more. The set includes 17 houses in Georgetown County.`) },

    { h2: "Which Garden City condos are oceanfront?", toc: "Oceanfront", id: "oceanfront", html: () =>
      S(`${A}&type=condo&has=oceanfront_unit`, "Oceanfront condos in Garden City") +
      S(`${A}&type=condo&has=oceanfront_unit&max=299999`, "Oceanfront condos for $299,999 or less") +
      S(`${A}&type=condo&has=ocean_view`, "Garden City condos with an ocean view") +
      h.p(`"Oceanfront unit" is the listing agent's entry in the MLS. Check it against the building's own papers before you offer. Our ${h.a("/buyers/homes-near-the-beach/", "guide to homes near the beach")} covers the choices.`) },

    { h2: "Which Garden City houses are on the water?", toc: "On the water", id: "water", html: () =>
      S(`${A}&type=house&waterfront=1`, "Garden City houses on the water") +
      S(`${A}&type=house&has=marsh_view`, "Garden City houses with a marsh view") +
      S(`${A}&type=house&has=private_dock`, "Garden City houses with a dock") +
      h.p(`The marsh sits behind the beach strip, with docks from the houses on both edges. Our ${h.a("/buyers/waterfront-homes/", "waterfront homes guide")} explains what to check on a dock and a seawall.`) },

    { h2: "Which Garden City condos can be rented?", toc: "Rentals", id: "rentals", html: () =>
      S(`${A}&type=condo&has=str_allowed`, "Garden City condos where short-term rentals are allowed") +
      S(`${A}&type=condo&has=furnished`, "Garden City condos sold furnished") +
      h.p(`The listing agent enters the rental line. The rules belong to the HOA and the county, so read ${h.a("/invest/str-rules/", "our short-term rental rules guide")} and the building's papers before you offer.`) },

    { h2: "More Garden City homes, by what they have", toc: "What they have", id: "has", html: () =>
      S(`${A}&type=house&has=pool`, "Garden City houses with a private pool") +
      S(`${A}&type=house&has=walk_to_beach`, "Garden City houses you can walk to the beach from") +
      S(`${A}&type=house&beds=5`, "Garden City houses with 5 or more bedrooms") +
      S(`${A}&type=house&yearMin=2015`, "Garden City houses built since 2015") +
      S(`${A}&type=condo&beds=3`, "Garden City condos with 3 or more bedrooms") +
      S(`${A}&type=house&hoa=0`, "Garden City houses whose listing shows no HOA fee") +
      NOTE(`40 of the 55 houses list no HOA fee. The listing agent enters that line. Confirm it before you offer.`) },

    { h2: "Which Garden City buildings and neighborhoods have homes for sale?", toc: "Buildings", id: "buildings", html: () =>
      h.p(`Each strip below holds one building or neighborhood, named the way the MLS names it. We have no page yet for these, so each strip links to our search for it.`) +
      S(`subdivision=Jasmine Lake&type=condo&${A}`, "Jasmine Lake condos for sale") +
      S(`subdivision=WATERS EDGE&type=condo&${A}`, "Waters Edge condos for sale") +
      S(`subdivision=ROYAL GARDEN&type=condo&${A}`, "Royal Garden condos for sale") +
      S(`subdivision=SANDY SHORES I&type=condo&${A}`, "Sandy Shores I condos for sale") +
      S(`subdivision=SANDY SHORES II&type=condo&${A}`, "Sandy Shores II condos for sale") +
      S(`subdivision=Garden Sands&type=condo&${A}`, "Garden Sands condos for sale") +
      S(`subdivision=Sweetwater - Indian Wells&type=condo&${A}`, "Sweetwater - Indian Wells condos for sale") +
      S(`subdivision=Duneside I&type=condo&${A}`, "Duneside I condos for sale") +
      S(`subdivision=Inlet Pointe&type=house&${A}`, "Inlet Pointe houses for sale") },

    { h2: "Which part of Garden City has which homes?", toc: "Parts of town", id: "parts", html: () =>
      h.p(`Garden City is not a town, and no town government runs it. Horry County and Georgetown County do, each on its own side of the county line. Waccamaw Drive, the beach road, is about 5 miles long, and most of it is in Georgetown County. The county line crosses the beach about a quarter mile south of the pier.`) +
      S(`near=33.58000,-78.99250&miles=0.45&type=condo`, "Condos near the Garden City Pier") +
      S(`near=33.57600,-79.01000&miles=0.7&type=house`, "Garden City houses on the marsh") +
      S(`near=33.59200,-78.99850&miles=0.5&type=house`, "Houses between the marsh and Business 17") +
      S(`near=33.59600,-79.01500&miles=0.6&type=house`, "Houses west of Business 17") +
      S(`near=33.59600,-79.01500&miles=0.6&type=condo`, "Condos west of Business 17") +
      S(`near=33.54800,-79.02000&miles=1&type=house`, "Houses at the Georgetown end") +
      h.p(`Sold prices differ by part of town. Ocean-side condos sold for a middle of about $320,000. West of Business 17, houses sold for about $340,000 and condos for about $172,000.`) +
      h.p(`The ${h.a("/submarkets/garden-city/", "Garden City town guide")} names the five parts and draws the county line.`) },

    { h2: "What have Garden City homes sold for?", toc: "Sold prices", id: "sold", html: (bg) =>
      h.p(`Asking and selling differ here. The charts below count the 258 condos and 181 houses that sold in the past year, by the price on the deed. We read the county's deed index to count them.`) +
      CONDO_BANDS + HOUSE_BANDS +
      h.p(`Asking and selling middles describe different homes: the sold set is the Horry side only, and the for-sale set includes 17 Georgetown County houses.`) +
      NOTE(`Sales: Horry County deeds recorded from 2025-11-01 to 2026-10-31 with a price over $10,000, on parcels inside the Garden City Census place. The deed index covers the Horry County side only. Deeds with no price are not counted.`) +
      h.cta("Curious what one home paid?", "Give us an address. We pull its deed, its tax bill and its HOA papers, and tell you what we found.", "Have us pull the records", CONTACT, bg) },

    { h2: "What does a year cost to own a Garden City home?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent. A home on the 4 percent rate also pays no school operating tax. The owner must apply for the 4 percent rate.`) +
      h.table(["At the middle sale price", "Main home (4%)", "Second home or rental (6%)"], [
        ["Condo, at the middle sale price", `About $${n(Math.round(tax4(221250) / 10) * 10)}`, `About $${n(Math.round(tax6(221250) / 10) * 10)}`],
        ["House, at the middle sale price", `About $${n(Math.round(tax4(350000) / 5) * 5)}`, `About $${n(Math.round(tax6(350000) / 10) * 10)}`],
      ]) +
      NOTE(`Horry County 2026 rates: $207.30 per $1,000 of the value the county taxes, or $98.20 on the 4 percent rate. This assumes the county values the home at its price. Georgetown County has its own rates. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      h.p(`Condo fees on the listing sheets are about $320 to over $1,000 a month, and most are near $600 to $650. That is the listing agent's entry, not the HOA's bill. See ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) +
      h.p(`Of the homes that sold, about half the condos and 1 house in 4 have their center point in a FEMA high-risk flood zone. A home can touch a zone its center misses, so we check each one on the ${h.a("/buyers/flood-zone-check/", "flood zone check")} before you offer.`) },

    { h2: "Want to see one?", toc: "Tour a home", id: "tour", html: (bg) =>
      h.cta("We tour it with you, and check before you offer", "Before you offer on a Garden City home, we read its HOA papers and its flood file, then tell you what we found.", "Book a showing", CONTACT, bg) +
      h.p(`For living in Garden City, its pier, the county line and its flood history, read the ${h.a("/submarkets/garden-city/", "Garden City town guide")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Garden City homes for sale FAQ",
  faq: [
    { q: "How many homes are for sale in Garden City, SC?", a: `The strips on this page are live, so the count moves daily. The newest homes are the first strips on the page.` },
    { q: "What do homes in Garden City sell for?", a: `The sold prices section above counts them from county deeds.` },
    { q: "Why does a Garden City search find no homes in the MLS?", a: `The MLS has no Garden City city. We search our own Garden City area instead, and the mailing address on a home can read Garden City Beach, Murrells Inlet or Surfside Beach.` },
    { q: "What does property tax cost on a Garden City condo?", a: `It depends on whether you live there. The cost to own section above shows it at both rates.` },
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
    h2: "Pick a home above and we tour it with you.",
    p: "Found one in a strip? We book the showing, read its HOA papers and its flood file first, and tell you what we found.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "homes for sale in Garden City SC, Garden City SC condos for sale, Garden City Beach SC oceanfront condos, Garden City SC houses for sale, Garden City SC MLS listings",
  about: "Homes for sale in Garden City, South Carolina, live from the MLS, with what homes sold for and what a year costs to own",
});
