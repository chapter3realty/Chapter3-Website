/* /submarkets/murrells-inlet/condos-for-sale/ - Murrells Inlet, SC condos for sale: a listing-first page.
 * The condos are the page: live strips by price, bedrooms, water, fee, age, what the community has, community
 * and distance; short answers between them (what the fee runs, what condos sold for, what a year costs to own,
 * the flood share, one offer).
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/murrells-inlet-condos-for-sale/facts.md, VERIFIED rows, and the
 * CORRECTED rows at the verifier's wording (VERIFY.md): no precise county split (row 2), no per-side flood counts (row 20),
 * fee "about $480" (row 13), the other-118 fee "about $465" (row 12), the MarshWalk point 33.55795,-79.03183 (row 5).
 * Row 26 (search volume) is not printed. Data: data/2026-11-f/murrells-inlet-condos-for-sale/. Counts move daily, so the page
 * prints none for a strip; each strip is live.
 * Pictures: the town page's USDA NAIP aerial of the MarshWalk (public domain, same file), charts and a map.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, placesMap } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/murrells-inlet/condos-for-sale/";
const ROOT = path.join(__dirname, "..", "data");
const DATA = path.join(ROOT, "2026-11-f", "murrells-inlet-condos-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = JSON.parse(fs.readFileSync(path.join(ROOT, "2026-11-a", "submarkets-murrells-inlet", "photos.json"), "utf8")).photos[0];
const F = read("findings.json"), OF = read("oceanfront.json"), TX = read("tax.json").tax, FL = read("flood.json");
const SALES = JSON.parse(fs.readFileSync(path.join(ROOT, "2026-11-a", "submarkets-murrells-inlet", "findings.json"), "utf8")).sales;
const must = (ok, msg) => { if (!ok) throw new Error(`murrells-inlet-condos-for-sale.js: ${msg}`); };
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const about = (v, step) => Math.round(v / step) * step;

must(AIR.license === "Public domain" && /marshwalk/.test(AIR.file), "the aerial photo record is missing");
/* Row 1, 8, 14: 130 condos, asking middle $251,298, middle year 2004. */
must(F.total === 130 && Math.round(F.price.median) === 251298 && F.price.min === 128000 && F.year_built.median === 2004, "rows 1, 8 or 14 changed");
/* Rows 9 and 10: bedrooms. */
const B = F.by_beds;
must(B["2"].n === 39 && B["2"].price.median === 215000 && B["2"].sqft.median === 1008 && Math.round(B["2"].hoa.median) === 474, "row 9 two-bedroom changed");
must(B["3"].n === 73 && B["3"].price.median === 259900 && B["3"].sqft.median === 1450 && Math.round(B["3"].hoa.median) === 473, "row 9 three-bedroom changed");
must(B["1"].price.median === 286000 && B["1"].sqft.median === 760 && B["4"].price.median === 434900, "row 9 other sizes changed");
must(B["3"].price.median - B["2"].price.median === 44900 && B["3"].sqft.median - B["2"].sqft.median === 442, "row 10 arithmetic changed");
/* Row 12: oceanfront building against the rest. */
const OB = OF.oceanfront_building, NB = OF.not_oceanfront_building;
must(OB.n === 12 && OB.by_beds["2"].n === 4 && Math.round(OB.by_beds["2"].hoa.median) === 583 && NB.by_beds["2"].n === 35 && NB.by_beds["2"].hoa.median === 464, "row 12 changed");
must(OB.by_beds["1"].n === 6 && OB.by_beds["1"].hoa.median === 783 && NB.by_beds["1"].n === 3 && NB.by_beds["1"].hoa.median === 640, "row 12 one-bedroom changed");
must(OB.by_beds["3"].n === 2 && OB.by_beds["3"].hoa.median === 836 && NB.by_beds["3"].n === 71 && NB.by_beds["3"].hoa.median === 472, "row 12 three-bedroom changed");
/* Row 13: fee, all. */
must(F.hoa_all && F.hoa_all.median >= 470 && F.hoa_all.median <= 480, "row 13 changed");
/* Row 15: sales, year to September 2026. */
const SW = SALES["horry/west/condo"], SG = SALES["horry/garden_city/condo"], SO = SALES["georgetown/*/condo"];
must(SW.sales === 90 && SW.median === 273500 && SG.sales === 190 && SG.median === 250000 && SO.sales === 21 && SO.median === 280000, "row 15 changed");
/* Row 19: tax. */
must(TX.horry["250000"].four === 1071.4 && TX.georgetown["250000"].six === 3876 && TX.horry["200000"].six === 2577, "row 19 changed");
/* Row 20: flood. */
must(FL.in_high_risk.all === 31 && FL.pins === 130, "row 20 changed");

const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;object-position:50% 55%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:3/1}}
@media (max-width:420px){main#main #beds table th:nth-child(2),main#main #beds table td:nth-child(2){display:none}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:3/1}main#main .detail-hero .detail-media{max-width:1100px!important}}
main#main .c3-gchart,main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.4rem 0 1.4rem}
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;
const CONTACT = `/contact/?place=${encodeURIComponent("Murrells Inlet")}`;
const C = "type=condo&city=Murrells+Inlet";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;

/* Chart 2: the monthly fee by unit size, oceanfront building against not (row 12). */
const SZ = [["1", "1 bedroom"], ["2", "2 bedrooms"], ["3", "3 bedrooms"]];
const FEE_CHART = G.bars(SZ.flatMap(([k, lab]) => [
  { name: `${lab}, oceanfront building (${OB.by_beds[k].n} listed)`, value: about(OB.by_beds[k].hoa.median, 5), valueText: money(about(OB.by_beds[k].hoa.median, 5)) },
  { name: `${lab}, not oceanfront (${NB.by_beds[k].n} listed)`, value: about(NB.by_beds[k].hoa.median, 5), valueText: money(about(NB.by_beds[k].hoa.median, 5)) },
]), {
  caption: "In every size, an oceanfront building charges a higher monthly fee",
  nameLabel: "Unit and building", valueLabel: "Middle monthly fee, dollars a month", compact: true, phoneList: true,
  note: "Middle of the monthly HOA fee on the listings for sale. It is the listing's number, not the association's own bill. The oceanfront groups are small: two to six listings.",
});

const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  gtcalc: "https://www.gtcountysc.gov/385/Property-Tax-Calculator",
  osm: "https://www.openstreetmap.org/",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Murrells Inlet", url: "/submarkets/murrells-inlet/" },
  title: "Murrells Inlet Condos for Sale: Golf, Marsh, Ocean | Chapter3",
  description: "Condos for sale in Murrells Inlet, SC, live: by price, size, community and water. What the fees run, what condos sold for, and what a year costs to own.",
  ogTitle: "Murrells Inlet, SC condos for sale: golf, marsh and ocean",
  crumb: "Condos for sale",
  eyebrow: "Murrells Inlet, SC condos for sale",
  h1: "Murrells Inlet, SC condos for sale:",
  h1em: "golf, marsh and ocean, with a different tax bill across the county line.",
  sub: "Condos with a Murrells Inlet address, live from the MLS, by price, size, community and water.",
  heroMedia: CSS,
  toc: false,
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `About 130 condos are for sale in Murrells Inlet, asking a middle of about $251,000, with a middle fee of about $480 a month. Most are three-bedroom condos. Only about 12 sit in an oceanfront building.`,
    `The county line changes the tax bill. At $250,000, the Georgetown side costs about $310 a year more at 4 percent. We tour them with you and check the HOA and flood file before you offer.`,
  ],
  sections: [
    { h2: "What are the newest condos for sale in Murrells Inlet?", toc: "Newest", id: "newest", html: () =>
      G.homesCss() + G.homesQScript() +
      S(`${C}&domMax=14`, "Murrells Inlet condos listed in the last 14 days") +
      h.p(`The strip shows the condos listed in the last 14 days, newest first. ${h.a("/homes/?type=condo&city=Murrells+Inlet", "See all Murrells Inlet condos")}. Jump to ${h.a("#prices", "price")}, ${h.a("#beds", "bedrooms")}, ${h.a("#water", "water")}, ${h.a("#fee", "the monthly fee")} or ${h.a("#communities", "a community")}. Each strip links to its full search.`) },

    { h2: "What do condos in Murrells Inlet cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`The middle asking price is about $251,000. The middle half asks from about $210,000 to about $350,000. The lowest ask is about $128,000.`) +
      S(`${C}&max=200000`, "Condos under $200,000") +
      NOTE(`The strip hides the cheapest listings unless the search has a top price, so the first strip has one.`) +
      S(`${C}&min=200000&max=300000`, "Condos from $200,000 to $300,000") +
      S(`${C}&min=300000`, "Condos at $300,000 and up") +
      h.p(`Asking price is not sale price. The sold-prices section below shows what condos sold for.`) },

    { h2: "How many bedrooms do the condos have?", toc: "Bedrooms", id: "beds", html: (bg) =>
      h.p(`Most are three-bedrooms. They are more than half of the condos for sale. These are middles of the listings:`) +
      h.table(["Size", "About how big", "Asks about", "Fee a month"], [
        ["1 bedroom", "760 sq ft", "$286,000", "$785"],
        ["2 bedrooms", "1,010 sq ft", "$215,000", "about the same, $475"],
        ["3 bedrooms", "1,450 sq ft", "$260,000", "about the same, $475"],
        ["4 bedrooms", "2,075 sq ft", "$435,000", "$400"],
      ]) +
      NOTE(`A third bedroom asks about $45,000 more than a second and adds about 440 square feet. Nine one-bedrooms and eight four-bedrooms are for sale, so those rows are small groups. The fee is the number the seller's agent enters.`) +
      S(`${C}&beds=2`, "Condos with 2 or more bedrooms") +
      S(`${C}&beds=3`, "Condos with 3 or more bedrooms") +
      S(`${C}&beds=3&max=300000`, "Three-bedroom condos under $300,000") +
      S(`${C}&beds=4`, "Condos with 4 or more bedrooms") },

    { h2: "Which condos are on the water?", toc: "Water", id: "water", html: () =>
      h.p(`In Murrells Inlet the word covers three things. An oceanfront building sits on the sand. A listing that says "on the water" also covers the marsh, a creek and a golf pond.`) +
      S(`${C}&has=oceanfront_building`, "Condos in an oceanfront building") +
      S(`${C}&has=oceanview_unit`, "Condos with the ocean in view") +
      S(`${C}&has=water_view`, "Condos with a water view") +
      S(`${C}&has=marsh_view`, "Condos with a marsh view") +
      S(`${C}&waterfront=1`, "Condos the listing tags as waterfront: ocean, marsh, creek or lake") +
      h.p(`The oceanfront buildings are the older, higher-priced end. The middle oceanfront-building condo asks about $337,000. The other condos ask about $232,000.`) },

    { h2: "What is the monthly fee?", toc: "Monthly fee", id: "fee", html: () =>
      h.p(`The middle fee is about $480 a month. Half pay between about $410 and about $585. Most listings say the fee covers water and sewer.`) +
      h.p(`The fee depends on the building as well as the size. A one-bedroom in an oceanfront building pays about $785 a month. A one-bedroom elsewhere pays about $640. A two-bedroom pays about $585 in an oceanfront building and about $465 elsewhere.`) +
      FEE_CHART +
      S(`${C}&hoaMax=450`, "Condos with a fee under $450 a month") +
      S(`${C}&hoaMax=400`, "Condos with a fee under $400 a month") +
      NOTE(`Confirm the fee with the association before you offer. See ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) },

    { h2: "What else do the condos have?", toc: "What it has", id: "has", html: () =>
      h.p(`Condos built since 2015 and new construction come first. The middle condo here was built in 2004.`) +
      S(`${C}&yearMin=2015`, "Condos built in 2015 or later") +
      S(`${C}&has=new_construction`, "New construction condos") +
      S(`${C}&has=golf_community`, "Condos in a golf community") +
      S(`${C}&has=on_golf_course`, "Condos on the golf course") +
      S(`${C}&has=gated`, "Condos in a gated community") +
      S(`${C}&has=tennis`, "Condos with tennis courts") +
      S(`${C}&has=pets_allowed`, "Condos where pets are allowed") +
      S(`${C}&has=furnished`, "Furnished condos") +
      S(`${C}&has=str_allowed`, "Condos where nightly rentals are allowed") +
      NOTE(`About 1 in 4 listings say nightly rentals are allowed. The building's own rules decide. See our ${h.a("/invest/str-rules/", "short-term rental rules")}.`)  +
      S(`type=townhouse&city=Murrells Inlet`, "Townhomes for sale in Murrells Inlet")},

    { h2: "Which communities have condos for sale?", toc: "By community", id: "communities", html: () =>
      h.p(`Each strip holds one community's condos, as the MLS names it. A name can match more than one building.`) +
      h.p(`West of the US 17 bypass, in Horry County, are the golf communities near the International Club and Blackmoor.`) +
      S(`subdivision=Bally+Castle&${C}`, "Bally Castle condos for sale") +
      S(`subdivision=Marcliffe&${C}`, "Marcliffe condos for sale") +
      S(`subdivision=International+Club&${C}`, "International Club condos for sale") +
      S(`subdivision=Park+West&${C}`, "Park West condos for sale") +
      h.p(`Toward Garden City, on the Horry side of the line:`) +
      S(`subdivision=Indian+Wells&${C}`, "Sweetwater at Indian Wells condos for sale") +
      S(`subdivision=Jasmine+Lake&${C}`, "Jasmine Lake condos for sale") +
      S(`subdivision=Tupelo+Bay&${C}`, "Tupelo Bay condos for sale") +
      h.p(`On the Georgetown County side:`) +
      S(`subdivision=Riverwood&${C}`, "Riverwood condos for sale") +
      S(`subdivision=Wyngate&${C}`, "Wyngate condos for sale") +
      S(`subdivision=Royal+Garden&${C}`, "Royal Garden condos for sale") +
      S(`subdivision=Blue+Heron&${C}`, "Blue Heron condos for sale") +
      h.p(`The county line decides your tax bill and your rental rules. The sections below show the tax. For the town itself, read the ${h.a("/submarkets/murrells-inlet/", "Murrells Inlet town guide")}.`) },

    { h2: "Which condos are near the MarshWalk and the beach?", toc: "Near the MarshWalk", id: "near", html: () =>
      h.p(`The MarshWalk is a half-mile wooden boardwalk along the salt marsh, with restaurants and free live music. The International Club and Blackmoor golf courses are on the Horry side. These strips measure a straight line on the map, not a walk.`) +
      S(`${C}&near=33.55795,-79.03183&miles=1`, "Condos within a mile of the MarshWalk") +
      S(`${C}&near=33.57608,-78.9974&miles=1`, "Condos within a mile of the Garden City Pier") +
      S(`${C}&near=33.60062,-79.04166&miles=2`, "Condos within 2 miles of the International Club") },

    { h2: "What have Murrells Inlet condos sold for?", toc: "Sold prices", id: "sold", html: (bg) =>
      h.p(`In the year to September 2026, about 90 condos sold west of the bypass, with a middle price of about $273,500. About 190 sold in the Garden City area, with a middle of about $250,000. About 21 sold on the Georgetown side, with a middle of about $280,000. We read the county's deed index to count them.`) +
      NOTE(`Deeds do not show a unit's size, fee or view, so a sold condo is not a type here. The Garden City area is the Garden City Census place, so it can include condos with a Garden City mailing address.`) },

    { h2: "What does a year cost to own a condo in Murrells Inlet?", toc: "Cost to own", id: "cost", html: () =>
      h.p(`Take a price and assume the county values the condo at it. South Carolina taxes a home you live in on 4 percent of its value. A second home or rental pays on 6 percent. The county line changes the rate.`) +
      h.table(["Condo price and side", "Lived in (4%)", "Second home (6%)"],
        ["200000", "250000", "350000"].flatMap((p) => [
          [`${money(+p)}, Horry side`, `About ${money(about(TX.horry[p].four, 10))}`, `About ${money(about(TX.horry[p].six, 10))}`],
          [`${money(+p)}, Georgetown side`, `About ${money(about(TX.georgetown[p].four, 10))}`, `About ${money(about(TX.georgetown[p].six, 10))}`],
        ])) +
      NOTE(`Yearly tax only, before any credit and the 15 percent cap. The Horry side uses the 2026 levy for the district that holds all or nearly all of these condos. The Georgetown side uses the county's current estimate. The lower rate needs an application. The monthly HOA fee is on top. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      h.p(`At $250,000, the Georgetown side costs about $310 more a year at 4 percent and about $680 more at 6 percent.`) },

    { h2: "Is the condo in a flood zone?", toc: "Flood", id: "flood", html: () =>
      h.p(`About 31 of the 130 condos for sale, close to 1 in 4, sit in a FEMA high-risk zone, where a lender requires flood insurance. None of the ones west of the bypass on the Horry side does. The 31 are in the Garden City area and on the Georgetown side.`) +
      h.p(`We measure the map point of each listing against the FEMA map. That is not a lender's determination. A building can touch a zone its point misses, so we check the building before you offer. Start with our ${h.a("/buyers/flood-zone-check/", "flood zone check")}, then read about ${h.a("/buyers/coastal-insurance/", "coastal insurance")} and ${h.a("/buyers/undisclosed-flooding/", "flooding sellers did not disclose")}.`) },

    { h2: "Where else can I look?", toc: "Keep looking", id: "tour", html: () =>
      h.p(`For the town itself, read the ${h.a("/submarkets/murrells-inlet/", "Murrells Inlet town guide")}. Nearby, see the ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach condos for sale")}, the ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach condos for sale")} and the ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach condos for sale")}. For condos as an investment, see our ${h.a("/invest/condos/", "condo investing page")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")} and ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Murrells Inlet condos for sale FAQ",
  faq: [
    { q: "Is a Murrells Inlet condo on the beach?", a: `Some are. The ones in an oceanfront building sit on the sand. The rest are in golf, lake and other communities. See the water strips above.` },
    { q: "Does the county line change my property tax?", a: `Yes. The Murrells Inlet mailing address crosses from Horry County into Georgetown County, and the rates differ. The cost to own table above shows the gap.` },
    { q: "How much is the monthly fee?", a: `The middle fee is about $480 a month. An oceanfront building charges more. The fee chart above shows it by size.` },
    { q: "Can I rent a condo by the night?", a: `The building's own rules decide, and the county line matters too. Our short-term rental rules page explains how both work.` },
    { q: "Will a lender loan on a condo?", a: `Many condo buildings do not pass a lender's condo review. Our page on condos many lenders will not lend on explains why. Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "Horry County tax levy", href: SRC.levy },
    { name: "Georgetown County tax calculator", href: SRC.gtcalc },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: Horry County deeds, parcels and the FEMA flood map. Listings: CCMLS, live, in aggregate. Places: OpenStreetMap. Photo: USDA NAIP.",
    bottomCta: {
    h2: "Book a showing in Murrells Inlet.",
    p: "Pick a condo from the strips above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "condos in murrells inlet sc for sale, murrells inlet condos for sale, murrells inlet oceanfront condos, murrells inlet waterfront condos for sale",
  about: "Condos for sale in Murrells Inlet, South Carolina, live from the MLS, by price, size, community and water, with the fee by building type, what condos sold for and what a year costs to own",
});
