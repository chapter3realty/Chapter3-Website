/* /submarkets/loris/ - Loris, SC: the houses for sale (live), what they cost, the land that comes with them,
 * the new streets, the named neighborhoods, what houses sold for, inside the city or outside it, the yearly
 * cost, the flood record, the drive to the beach and what the town is.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17.
 * Facts: Blog-Brain batches/2026-11-f/loris/facts.md, VERIFIED and CORRECTED rows only, in the verifier's
 * wording (VERIFY.md): row 4 "about" range, row 19 "about 201 to 204 mills plus a county fee of $32 to $89",
 * row 20 "about $1,100" and "about $3,400", row 17 "a home you live in" and the five-acre limit, row 22 "began
 * in 1887 around a railroad depot" (no railroad name), row 23 area "2020" and no elevation, row 1 no fixed land
 * total. Data: data/2026-11-f/loris/ (findings-deeds.json, lot-size.json, flood.json, drives.json,
 * district-city.json, photos.json). Every number from those files is read here and checked against its row.
 * Live strip counts of 2026-11-17 are in Blog-Brain batches/2026-11-f/loris/BUILD.md.
 * Pictures: a USDA NAIP aerial (public domain), our own map of the drive (tools/area-map.js), glass bar charts.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));

const SELF = "/submarkets/loris/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "loris");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings-deeds.json"), FL = read("flood.json"), DR = read("drives.json"), LOT = read("lot-size.json");

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`loris.js: ${msg}`); };

/* Rows 9, 10, 11: what houses sold for. */
const HS = F.houses;
must(HS.count === 356 && HS.median === 278500 && HS.p25 === 246040 && HS.p75 === 340000, "row 9 changed");
const BANDS = F.house_price_bands;
must(BANDS["0-200000"] === 18 && BANDS["200000-300000"] === 203 && BANDS["300000-400000"] === 94 && BANDS["400000-500000"] === 28 && BANDS["500000-1000000000"] === 13, "row 10 changed");
must(F.houses_seller_business.count === 242 && F.houses_seller_person.count === 114, "row 11 changed");
const SELL = F.houses_by_seller;
must(SELL["D.R. Horton (DR Horton Inc and D R Horton Inc)"] === 61 && SELL.person === 114 && SELL["other business"] === 181, "row 11 sellers");
const TOPS = Object.fromEntries(F.business_sellers_top);
must(TOPS["STARLIGHT HOMES SOUTH CAROLINA"] === 35 && TOPS["LENNAR CAROLINAS"] === 34, "row 11 builders");
must(Math.round(F.houses_seller_business.count / HS.count * 100) === 68, "row 11 share");

/* Row 12: inside the City of Loris is tax district 220. */
const INS = LOT.Loris_inside_city_220, OUTS = LOT.Loris_outside_city;
must(INS.count === 40 && INS.median === 260885 && OUTS.count === 316 && OUTS.median === 282300, "row 12 changed");
must(Math.round(INS.count / HS.count * 9) === 1, "row 12: no longer about 1 in 9");

/* Row 14: lot size of the houses that sold. */
must(LOT.Loris.one_acre_or_more === 61 && LOT.Loris.acres.count === 356 && LOT.Conway.one_acre_or_more === 110 && LOT.Conway.houses_with_acreage === 2155
  && LOT.Longs.one_acre_or_more === 10 && LOT.Longs.houses_with_acreage === 1260, "row 14 changed");
const SH = (k) => LOT[k].one_acre_or_more / LOT[k].houses_with_acreage * 100;     // 17.1, 5.1, 0.8
must(Math.round(SH("Loris")) === 17 && Math.round(SH("Conway")) === 5 && SH("Longs") < 1, "row 14 shares");
const BYLOT = LOT.Loris_by_acres_price;
must(BYLOT["under 0.5"].count === 244 && BYLOT["under 0.5"].median === 269950 && BYLOT["0.5 to 1"].count === 51 && BYLOT["0.5 to 1"].median === 308500
  && BYLOT["1 to 2"].count === 41 && BYLOT["1 to 2"].median === 345000 && BYLOT["2 and up"].count === 20 && BYLOT["2 and up"].median === 395000, "row 14 by lot");

/* Row 16: FEMA's high-risk zone, houses that sold. */
must(FL.houses === 352 && FL.in_high_risk_zone === 2, "row 16 changed");

/* Row 24: drives from the center of Loris, free flow. */
const D = (k) => DR[k];
must(D("cherry_grove_pier").minutes === 37.6 && D("main_street_ocean_drive").minutes === 36 && D("mcleod_seacoast").minutes === 30.5 && D("barefoot_landing").minutes === 40.8
  && D("grand_strand_medical").minutes === 42.2 && D("coastal_grand_mall").minutes === 51.1 && D("airport_terminal").minutes === 57.5, "row 24 changed");
const mi = (k) => `${D(k).miles.toFixed(1)} miles`;
const min = (k) => Math.round(D(k).minutes);
const BEACH_LO = min("main_street_ocean_drive"), BEACH_HI = min("cherry_grove_pier");     // 36 and 38
const AIRPORT = min("airport_terminal"), HOSP = min("mcleod_seacoast");                     // 58 and 31
must(BEACH_LO === 36 && BEACH_HI === 38 && AIRPORT === 58 && HOSP === 31, "row 24 rounding");

/* Rows 18, 19, 20 (CORRECTED): the yearly tax at the sale middle, in the verifier's wording. */
const PRICE = HS.median;
must(Math.round(PRICE * 0.04 * 0.1731) === 1928 && Math.round(PRICE * 0.06 * 0.2822) === 4716, "row 20 inside arithmetic");
const T_IN4 = "about $1,900", T_IN6 = "about $4,700", T_OUT4 = "about $1,100", T_OUT6 = "about $3,400";

/* ---------------------------------------------------------------------------- */
/* Charts.                                                                        */

const LOT_CHART = G.bars([
  { name: "Under half an acre", value: BYLOT["under 0.5"].median, valueText: r1k(BYLOT["under 0.5"].median), feature: `${BYLOT["under 0.5"].count} sold` },
  { name: "Half an acre to 1 acre", value: BYLOT["0.5 to 1"].median, valueText: r1k(BYLOT["0.5 to 1"].median), feature: `${BYLOT["0.5 to 1"].count} sold` },
  { name: "1 to 2 acres", value: BYLOT["1 to 2"].median, valueText: r1k(BYLOT["1 to 2"].median), feature: `${BYLOT["1 to 2"].count} sold` },
  { name: "2 acres and up", value: BYLOT["2 and up"].median, valueText: r1k(BYLOT["2 and up"].median), feature: `${BYLOT["2 and up"].count} sold`, reference: true },
], { caption: "Loris houses on more land sold for more, from about $270,000 to about $395,000", nameLabel: "Lot size", featureLabel: "houses sold", valueLabel: "Middle sale price", compact: true,
  note: "Houses sold with a Loris address, deeds recorded November 2025 to October 2026. Middle price: half sold for more, half for less. Rounded to the nearest $1,000." });

/* The aerial (USDA NAIP 2023, public domain): the edge of town, with streets of houses beside fields and woods. */
const AIR = read("photos.json").photos[0];
must(AIR.license === "Public domain" && AIR.slug === "loris", "the aerial record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');

const WHERE_MAP = (() => {
  const m = regionMap({ home: { name: "Loris", label: "Loris", lat: 34.056389, lon: -78.88, town: "Loris" }, maxRatio: 0.7,
    landmarks: [
      { name: "the beach at Cherry Grove Pier", short: "Cherry Grove", kind: "beach", lat: 33.828732, lon: -78.632676, minutes: BEACH_HI },
      { name: "McLeod Seacoast hospital", short: "Hospital", kind: "hospital", lat: 33.86573, lon: -78.66371, minutes: HOSP },
      { name: "Myrtle Beach International Airport", short: "Airport", kind: "airport", lat: 33.681467, lon: -78.922789, minutes: AIRPORT },
    ],
    alt: `Map of Loris and the coast: from the center of Loris, the beach at Cherry Grove Pier is about ${BEACH_HI} minutes by car, McLeod Seacoast hospital about ${HOSP} minutes, and Myrtle Beach International Airport about ${AIRPORT} minutes.` },
  { glass: true, dir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), src: "/images/maps" });
  return `<figure class="c3-lg-fig"><div class="c3-lg-frame">${m.html}</div><figcaption>Drive times by car from the center of Loris, without traffic. ${m.credit}</figcaption></figure>`;
})();

const CSS = `<style>
main#main .c3-lg-fig{margin:1.4rem 0 1.6rem;max-width:560px}
main#main .c3-lg-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.65rem}
main#main .c3-lg-frame{border-radius:18px;overflow:hidden;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.08)}
main#main .c3-lg-frame img,main#main .c3-lg-frame svg{display:block;width:100%;height:auto}
main#main h2{text-wrap:balance}
main#main .c3-gchart,main#main .hx-qs{max-width:720px;box-sizing:border-box}
main#main .c3-lg-wow{border-left:3px solid var(--brass);padding:.2rem 0 .2rem 1rem;margin:1.2rem 0;max-width:720px;font-size:1.15rem;line-height:1.5;color:var(--navy);font-family:var(--serif)}
</style>`;

const Q = (q, head) => G.homesQ(q, head);

/* Row 7: the named neighborhoods with homes for sale (MLS names). */
const HOODS = [
  ["Sutton Farm", "Sutton Farm houses for sale in Loris"],
  ["Edgefield", "Edgefield houses for sale in Loris"],
  ["Andalusia", "Andalusia houses for sale in Loris"],
  ["Meadow Walk", "Meadow Walk houses for sale in Loris"],
  ["Warner Crossing", "Warner Crossing houses for sale in Loris"],
  ["Woodland Valley", "Woodland Valley houses for sale in Loris"],
];

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const FEMA = "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer";
const OSRM = "https://project-osrm.org/";
const CENSUS = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/";
const HISTORY = "https://www.lorischamber.com/history-of-loris";

const END = {
  h2: "See the Loris houses you like, in person",
  p: "Pick the Loris houses you like. An agent shows them to you and answers what the page did not.",
  label: "Have us set up a Loris showing", href: `/contact/?place=${encodeURIComponent("Loris")}`,
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  title: "Loris SC Houses for Sale: New Homes, Land, Prices | Chapter3",
  description: "Houses for sale in Loris, SC, live from the MLS: new homes, land, price bands, neighborhoods, what houses sold for, what a year costs and how far the beach is.",
  ogTitle: "Loris, SC houses for sale, and what it is like to live in Loris",
  crumb: "Loris",
  eyebrow: "Loris, SC",
  h1: "Loris, SC: houses for sale, and what it is like to live here.",
  h1em: "A house in Loris often comes with land.",
  sub: "Loris houses for sale, live from the MLS. Houses there sold for a middle price of about $279,000 in the past year.",
  heroMedia: glance([
    { icon: "beach", label: "Beach", text: `${BEACH_LO} to ${BEACH_HI} min drive` },
    { icon: "airport", label: "Airport", text: `${AIRPORT} min drive` },
    { icon: "hospital", label: "Hospital", text: `${HOSP} min drive` },
    { icon: "town", label: "Sales in city limits", text: "1 in 9" },
  ]),
  heroCta: false,
  toc: false,
  pageImages: () => PH.pageImages(AIR),
  author: "devin",
  shortAnswer: [
    `About 146 houses are for sale under a Loris address, about two in three of them new. In the past year ${n(HS.count)} houses sold here, at a middle of ${r1k(HS.median)}.`,
    `About 1 in 3 of the houses for sale sits on an acre or more. Most houses here are outside the city limits, which changes the tax bill.`,
  ],
  sections: [
    { h2: "What houses are for sale in Loris right now?", toc: "For sale now", id: "for-sale", html: () =>
      CSS + G.homesCss() + G.homesQScript() +
      Q("city=Loris&type=house", "Houses for sale in Loris") +
      h.p(`More than 140 houses are for sale with a Loris address. The same address also has manufactured homes and many lots. It has no condos and no townhouses. ${h.a("/homes/?city=Loris&type=house", "See every Loris house for sale")}.`) +
      h.p(`Loris is a small town in Horry County, zip code 29569. A Loris address reaches well past the town. Most of the houses that sold sit outside the city limits, in the county.`) +
      Q("city=Loris&type=house&domMax=14", "Loris houses listed in the past two weeks") },

    { h2: "Are there houses with land in Loris?", toc: "Houses with land", id: "land", html: () =>
      `<p class="c3-lg-wow">Of the Loris houses for sale, about 1 in 3 sits on an acre or more. Of the houses that sold in the past year, about 1 in 6 did.</p>` +
      h.p(`We counted lot size from the county's parcel records.`) +
      Q("city=Loris&type=house&lotMin=1", "Loris houses on an acre or more") +
      h.p(`Land costs more in the sale prices too. The middle sale price rose with the lot, from about ${r1k(BYLOT["under 0.5"].median)} under half an acre to about ${r1k(BYLOT["2 and up"].median)} on 2 acres or more.`) +
      h.p(`Some of the houses for sale sit on five acres or more.`) +
      Q("city=Loris&type=house&lotMin=5", "Loris houses on five acres or more") +
      h.p(`You can also buy an empty lot. Many lots and parcels have a Loris address. ${h.a("/homes/?city=Loris&type=land", "See the Loris lots for sale")}, or read our ${h.a("/buyers/land/", "land buying guide")} first.`) },

    { h2: "What do houses in Loris cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`Loris houses for sale ask a middle of about $330,000. The middle half ask about $269,000 to $440,000.`) +
      Q("city=Loris&type=house&max=299999", "Loris houses under $300,000") +
      Q("city=Loris&type=house&min=300000&max=399999", "Loris houses from $300,000 to $399,999") +
      Q("city=Loris&type=house&min=400000", "Loris houses at $400,000 and up") },

    { h2: "Are there new houses for sale in Loris?", toc: "New houses", id: "new-houses", html: () =>
      h.p(`Yes. About two in three of the Loris houses for sale are new construction. Some are finished and ready to move into now.`) +
      Q("city=Loris&type=house&has=quick_move_in", "New Loris houses you can move into now") +
      Q("city=Loris&type=house&has=new_construction", "Every new-construction house in Loris") +
      h.p(`Builders and other companies sold most of what changed hands. A company sold 68 of every 100 houses in the past year. D.R. Horton sold the most, then Starlight Homes and Lennar.`) +
      h.p(`Our guides to ${h.a("/buyers/new-construction/", "buying new construction")} and to ${h.a("/buyers/new-construction/builders/", "the builders here")} cover the contract and what to ask.`) },

    { h2: "Which Loris houses have water, a pool or no HOA fee?", toc: "By feature", id: "by-feature", html: () =>
      h.p(`Pick what matters and the homes below follow. Most Loris houses for sale have one level.`) +
      Q("city=Loris&type=house&waterfront=1", "Loris houses on a lake or pond") +
      Q("city=Loris&type=house&has=pool", "Loris houses with a pool of their own") +
      Q("city=Loris&type=house&beds=4", "Loris houses with four or more bedrooms") +
      h.p(`The agent who listed a house enters its HOA fee on the listing, so we confirm it with the association before you offer.`) +
      Q("city=Loris&type=house&hoa=0", "Loris houses with no HOA fee listed") },

    { h2: "Which Loris neighborhoods have houses for sale?", toc: "Neighborhoods", id: "neighborhoods", html: () =>
      h.p(`Six named neighborhoods have houses for sale right now. More than half of the houses sit outside any named neighborhood, often on their own lot.`) +
      HOODS.map(([name, head]) => Q(`subdivision=${name}&type=house&city=Loris`, head)).join("") +
      h.p(`Each neighborhood has its own homeowners association and its own fee. Our ${h.a("/hoa/fees-by-neighborhood/", "HOA fee guide")} explains how to read one.`) },

    { h2: "What have houses in Loris sold for?", toc: "Sold prices", id: "sold", html: () =>
      h.p(`In the past year ${n(HS.count)} houses sold with a Loris address. The middle price was ${r1k(HS.median)}. The middle half sold for ${r1k(HS.p25)} to ${r1k(HS.p75)}. We counted them one deed at a time in the county's recorded deeds. About ${n(BANDS["200000-300000"])} of them, more than half, sold for $200,000 to $299,999. Another ${BANDS["300000-400000"]} sold for $300,000 to $399,999, and ${BANDS["500000-1000000000"]} sold for $500,000 or more.`) +
      h.p(`That is below the about $330,000 the houses for sale ask in the middle.`) },

    { h2: "Is a house inside the city of Loris or outside it?", toc: "City or county", id: "city-or-county", html: (bg) =>
      h.p(`Most of the time, outside. Of the ${n(HS.count)} houses that sold, ${INS.count} were inside the City of Loris, about 1 in 9. The other ${OUTS.count} were in the county.`) +
      h.p(`The inside houses sold for a middle of about ${r1k(INS.median)}. The ones outside sold for about ${r1k(OUTS.median)}.`) +
      h.p(`The city line changes the tax bill. The City of Loris adds its own tax on top of the county and school tax. We found each house's side from its county tax district.`) +
      h.p(`Take a house that sold for ${r1k(PRICE)}, the middle sale price. South Carolina taxes a home you live in on 4 percent of its value, and a second home or a rental on 6 percent. You must apply for the 4 percent rate. It covers the house and up to five acres next to it.`) +
      h.table(["Tax a year", "Inside the City of Loris", "Outside the city"], [
        ["A house you live in", T_IN4, T_OUT4],
        ["A second home or rental", T_IN6, T_OUT6],
      ]) +
      h.p(`Each figure assumes the county values the house at its price. Outside the city the bill also has a county fee of $32 to $89 a year, which the figure includes.`) +
      h.p(`Our ${h.a("/buyers/property-taxes/", "property tax guide")} explains how the county works out the bill, and the ${h.a("/buyers/property-records/", "property records guide")} shows where to look up any address.`) +
      h.cta("Inside the city or not, for one address", "Send us a Loris address. We tell you which side of the city line it is on, and we pull its tax bill from the county's own records.", "Have us look up an address", "/contact/", bg) },

    { h2: "What does a year cost besides tax?", toc: "Yearly cost", id: "yearly-cost", html: (bg) =>
      h.p(`Two things come every year besides your loan and insurance: the property tax above and, in a neighborhood with an association, its fee. Flood is the third cost to check.`) +
      h.ul([
        `<strong>HOA fee:</strong> 57 of the 146 houses for sale show a monthly fee. The middle is about $78 a month and the range is $35 to $205. The rest show none. The agent who listed the house enters the fee, not the association, so we confirm it from the HOA papers.`,
        `<strong>Flood:</strong> of the ${FL.houses} Loris houses that sold, and that we could place on the map, only ${FL.in_high_risk_zone} sit in FEMA's high-risk flood zone. We checked each lot against FEMA's map. That count is for houses that sold, not for the whole town.`,
      ]) +
      h.p(`See ${h.a("/buyers/flood-zone-check/", "how to check a house's flood zone")} before you offer on any house.`) +
      h.cta("The HOA papers and flood zone for one Loris house", "Send us a Loris house you like. We read its HOA papers and check its flood zone before you offer.", "Have us check a house", "/contact/", bg) },

    { h2: "How far is Loris from the beach?", toc: "Drive to the beach", id: "beach", html: () =>
      h.p(`The beach is ${BEACH_LO} to ${BEACH_HI} minutes by car from the center of Loris, at Ocean Drive and at Cherry Grove Pier. Both are in North Myrtle Beach. Myrtle Beach itself is farther, ${min("coastal_grand_mall")} minutes to Coastal Grand Mall. Barefoot Landing is ${min("barefoot_landing")} minutes and McLeod Seacoast hospital ${HOSP}.`) +
      WHERE_MAP +
      h.p(`A Loris address is farther from the coast than most of the towns we cover. In return, more of the houses sit on an acre or more. For the nearer towns, see ${h.a("/submarkets/conway/", "Conway")} and ${h.a("/submarkets/longs/", "Longs")}.`) },

    { h2: "What is Loris, SC?", toc: "About Loris", id: "about", html: () =>
      h.p(`Loris is a city in Horry County. It began in 1887 around a railroad depot, and it was incorporated in 1902. The 2020 census counted 2,449 people inside the city limits, which cover 4.57 square miles.`) +
      h.p(`The house you buy with a Loris address is usually outside those limits. The mailing address reaches the farms and new streets around the town.`) +
      AERIAL +
      h.p(`For public records on any address, see the ${h.a("/buyers/property-records/", "property records guide")}. For the full list of towns we cover, see our ${h.a("/submarkets/", "neighborhoods guide")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/longs/", "Longs")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Loris, SC FAQ",
  faq: [
    { q: "What county is Loris, SC in?", a: "Horry County. The zip code is 29569. A Loris address covers the city and much of the county land around it." },
    { q: "How far is Loris from Myrtle Beach?", a: `The beaches in North Myrtle Beach are ${BEACH_LO} to ${BEACH_HI} minutes by car from the center of Loris. Coastal Grand Mall in Myrtle Beach is about ${min("coastal_grand_mall")} minutes and the airport about ${AIRPORT}, without traffic.` },
    { q: "Are there Loris houses for sale with no HOA fee?", a: "Yes. About 89 of the 146 houses for sale show no HOA fee on the listing. The agent who listed the house enters that, so we confirm it with the association. These are the same MLS listings an agent sees." },
    { q: "Are there mobile homes for sale in Loris?", a: "A few. About 15 manufactured homes are for sale with a Loris address. Our search shows them if you pick manufactured as the kind of home." },
    { q: "Is a Loris house inside the city limits?", a: "Usually not. About 1 house in 9 sold under a Loris address is inside the City of Loris, and that side pays the city's levy as well as the county's." },
    { q: "Is Loris in a flood zone?", a: `For most houses, no. Of the ${FL.houses} houses that sold, ${FL.in_high_risk_zone} sit in FEMA's high-risk zone. Check the house you like against FEMA's map before you offer.` },
  ],
  sources: [
    { name: "county deeds", href: DEEDS },
    { name: "Horry County GIS", href: GIS },
    { name: "2026 tax levy", href: LEVY },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "FEMA flood map", href: FEMA },
    { name: "Census 2020", href: CENSUS },
    { name: "Loris history", href: HISTORY },
    { name: "drive estimates", href: OSRM },
  ],
  sourcesNote: "Our counts from county parcels, flood maps and the past year's deeds. Listing counts in aggregate from CCMLS. Drives from the center of Loris, without traffic.",
  afterSources: () => PH.creditsList([{ photo: AIR, caption: "Part of Loris from the air" }]) + PH.imageSchema([AIR]),
  bottomCta: END,
  keywords: "Loris SC houses for sale, Loris SC homes for sale, Loris SC new construction, Loris SC land, Loris SC neighborhoods, Loris SC property tax, Loris SC no HOA, how far is Loris SC from Myrtle Beach, living in Loris SC, Loris SC real estate",
  about: "Loris, a city in Horry County, South Carolina",
});
