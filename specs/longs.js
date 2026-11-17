/* /submarkets/longs/ - Longs, SC: the houses for sale, what they cost, what they sold for, the new streets,
 * the land, the odd fact that Longs has no city limits yet a quarter of its sales are inside North Myrtle
 * Beach, the yearly cost, the flood record and the drive to the beach.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17.
 * Facts: Blog-Brain batches/2026-11-f/longs/facts.md, VERIFIED and CORRECTED rows only, in the verifier's
 * wording (VERIFY.md): row 13 "about 1 in 4 ... about $388,000 against about $300,000", row 16 Polo Farms
 * "off SC 905" and Aberdeen "in Longs", row 20 Coastal Grand Mall 37.5 minutes and 26.2 miles, row 7 "on the
 * water" only as a strip title, row 2 without the SC 9 and SC 905 line, build-day counts not the researcher's.
 * Data: data/2026-11-f/longs/ (findings-deeds.json, flood.json, drives.json, district-city.json). Every
 * number from those files is read here and checked against its row. Live strip counts of 2026-11-17 are in
 * Blog-Brain batches/2026-11-f/longs/BUILD.md.
 * Pictures: our own map of the drive (tools/area-map.js) and glass bar charts. No licensed photo yet; the
 * photo partner's shot list is in BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));

const SELF = "/submarkets/longs/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "longs");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings-deeds.json"), FL = read("flood.json"), DR = read("drives.json");

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r100 = (v) => money(Math.round(v / 100) * 100);
const must = (ok, msg) => { if (!ok) throw new Error(`longs.js: ${msg}`); };

/* Rows 10, 11, 12: what houses sold for. */
const HS = F.houses;
must(HS.count === 1260 && HS.median === 319000 && HS.p25 === 269990 && HS.p75 === 380000, "row 10 changed");
const BANDS = F.house_price_bands;
must(BANDS["0-200000"] === 23 && BANDS["200000-300000"] === 473 && BANDS["300000-400000"] === 515 && BANDS["400000-500000"] === 171 && BANDS["500000-1000000000"] === 78, "row 11 changed");
must(F.houses_seller_business.count === 950 && F.houses_seller_business.median === 322000 && F.houses_seller_person.count === 310 && F.houses_seller_person.median === 305000, "row 12 changed");
must(F.houses_by_seller["D.R. Horton (DR Horton Inc and D R Horton Inc)"] === 172, "row 12 Horton");
const TOPS = Object.fromEntries(F.business_sellers_top);
must(TOPS["MERITAGE HOMES OF THE CAROLINA"] === 250 && TOPS["LENNAR CAROLINAS"] === 225, "row 12 builders");

/* Row 13 (CORRECTED): the tax district that lies inside North Myrtle Beach, 322 of 1,260. */
const IN = F.houses_median_price_by_tax_district["550"], OUT = F.houses_outside_550;
must(IN.count === 322 && IN.median === 387495 && OUT.count === 938 && Math.round(OUT.median) === 299999, "row 13 changed");
must(Math.round(IN.count / HS.count * 4) === 1, "row 13: no longer about 1 in 4");
const IN_TXT = "about $388,000", OUT_TXT = "about $300,000", IN_BAR = "$388,000", OUT_BAR = "$300,000";                   // the verifier's wording

/* Row 15: FEMA's high-risk zone. */
must(FL.houses === 1230 && FL.in_high_risk_zone === 28 && FL.by_tax_district["550"][0] === 0 && FL.by_tax_district["550"][1] === 303, "row 15 changed");

/* Row 20 (CORRECTED): drives from the middle of Longs, free flow. Coastal Grand Mall is the verifier's re-route. */
DR.coastal_grand_mall = { minutes: 37.5, miles: 26.2 };
const D = (k) => DR[k];
must(D("cherry_grove_pier").minutes === 18.7 && D("main_street_ocean_drive").minutes === 17.0 && D("mcleod_seacoast").minutes === 11.6
  && D("barefoot_landing").minutes === 24.3 && D("grand_strand_medical").minutes === 28.6 && D("airport_terminal").minutes === 42.5, "row 20 changed");
const mi = (k) => `${D(k).miles.toFixed(1)} miles`;
const min = (k) => Math.round(D(k).minutes);
const BEACH_LO = min("main_street_ocean_drive"), BEACH_HI = min("cherry_grove_pier");   // 17 and 19
const AIRPORT = min("airport_terminal"), HOSP = min("mcleod_seacoast");

/* Rows 9, 17, 18, 19: the yearly bill. Tax at the sale middle, computed from the 2026 levy (row 19). */
const PRICE = HS.median;
const TAX = {
  out4: PRICE * 0.04 * 0.0919 + 89.40, out6: PRICE * 0.06 * 0.201 + 89.40,
  in4: PRICE * 0.04 * 0.1121, in6: PRICE * 0.06 * 0.2212,
};
must(Math.round(TAX.out4) === 1262 && Math.round(TAX.out6) === 3937 && Math.round(TAX.in4) === 1430 && Math.round(TAX.in6) === 4234, "row 19 arithmetic changed");
const HOA_MID = 81, HOA_LO = 70, HOA_HI = 103;                                 // row 9, listing-sheet entries
const YEAR = Math.round((TAX.out4 + 12 * HOA_MID) / 10) * 10;                  // about $2,230
must(YEAR === 2230, "row 19 year total");

/* ---------------------------------------------------------------------------- */
/* Charts.                                                                        */

const SOLD_CHART = G.bars([
  { name: "Under $200,000", value: BANDS["0-200000"], valueText: `${BANDS["0-200000"]} houses` },
  { name: "$200,000 to $299,999", value: BANDS["200000-300000"], valueText: `${BANDS["200000-300000"]} houses` },
  { name: "$300,000 to $399,999", value: BANDS["300000-400000"], valueText: `${BANDS["300000-400000"]} houses` },
  { name: "$400,000 to $499,999", value: BANDS["400000-500000"], valueText: `${BANDS["400000-500000"]} houses` },
  { name: "$500,000 and up", value: BANDS["500000-1000000000"], valueText: `${BANDS["500000-1000000000"]} houses` },
], { caption: "Most Longs houses sold for $200,000 to $400,000", nameLabel: "Sale price", valueLabel: "Houses sold", format: (v) => `${v} houses`, compact: true,
  note: `${n(HS.count)} houses sold with a Longs address, deeds recorded November 2025 to October 2026.` });

/* The share image (USDA NAIP 2023, public domain): the highway crossroads and the new streets beside the fields. */
const AIR = read("photos.json").photos[0];
must(AIR.license === "Public domain" && AIR.slug === "longs", "the aerial record is missing");
const WHERE_MAP = (() => {
  const m = regionMap({ home: { name: "Longs", label: "Longs", lat: 33.938611, lon: -78.733056, town: "Longs" },
    landmarks: [
      { name: "the beach at Cherry Grove Pier", short: "Cherry Grove", kind: "beach", lat: 33.828732, lon: -78.632676, minutes: BEACH_HI },
      { name: "McLeod Seacoast hospital", short: "Hospital", kind: "hospital", lat: 33.86573, lon: -78.66371, minutes: HOSP },
      { name: "Myrtle Beach International Airport", short: "Airport", kind: "airport", lat: 33.681467, lon: -78.922789, minutes: AIRPORT },
    ],
    alt: `Map of Longs and the coast: from the middle of Longs, the beach at Cherry Grove Pier is about ${BEACH_HI} minutes by car, McLeod Seacoast hospital about ${HOSP} minutes, and Myrtle Beach International Airport about ${AIRPORT} minutes.` },
  { glass: true, dir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), src: "/images/maps" });
  return `<figure class="c3-lg-fig"><div class="c3-lg-frame">${m.html}</div><figcaption>Drive times by car from the middle of Longs, without traffic. ${m.credit}</figcaption></figure>`;
})();

const CSS = `<style>
main#main .c3-lg-fig{margin:1.4rem 0 1.6rem;max-width:560px}
main#main .c3-lg-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.65rem}
main#main .c3-lg-frame{border-radius:18px;overflow:hidden;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.08)}
main#main .c3-lg-frame img,main#main .c3-lg-frame svg{display:block;width:100%;height:auto}
main#main h2{text-wrap:balance}
main#main .c3-gchart,main#main .hx-qs{max-width:720px;box-sizing:border-box}
main#main .c3-lg-list{columns:2;column-gap:2rem;max-width:720px;padding-left:1.1rem;margin:.6rem 0 1rem}
main#main .c3-lg-list li{margin:.15rem 0;break-inside:avoid}
@media (max-width:599px){main#main .c3-lg-list{columns:1}}
main#main .c3-lg-wow{border-left:3px solid var(--brass);padding:.2rem 0 .2rem 1rem;margin:1.2rem 0;max-width:720px;font-size:1.15rem;line-height:1.5;color:var(--navy);font-family:var(--serif)}
</style>`;

/* Strips: each title is bold and true of its search (counts are as of 2026-11-17 in BUILD.md). */
const Q = (q, head) => G.homesQ(q, head);
const SEE = (href, text) => h.p(`${h.a(href, text)}`);

/* ---------------------------------------------------------------------------- */
/* The neighborhoods with homes for sale (row 8).                                  */

const HOODS = [
  ["Carrington Woods", "Carrington Woods houses for sale in Longs"],
  ["The Forest At Black Bear", "The Forest at Black Bear houses for sale in Longs"],
  ["Palmetto Place", "Palmetto Place houses for sale in Longs"],
  ["Heritage Park", "Heritage Park houses for sale in Longs"],
  ["Eden Springs", "Eden Springs houses for sale in Longs"],
];
const MORE = [
  ["Marshfield", "Marshfield"], ["The Tides of Little Creek", "The Tides of Little Creek"], ["Forestwood", "Forestwood"],
  ["Evington Place", "Evington Place"], ["Waterside - Area 10A", "Waterside"], ["Avery Woods", "Avery Woods"],
  ["Lakes at Plantation Pines", "Lakes at Plantation Pines"], ["Oak Hollow", "Oak Hollow"], ["Grande Dunes - North Village", "Grande Dunes North Village"],
  ["Sun Colony", "Sun Colony"],
];
const hoodSearch = (name) => `/homes/?subdivision=${encodeURIComponent(name)}&city=Longs`;

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const FEMA = "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer";
const NWS = "https://www.weather.gov/ilm/HurricaneFlorence";
const OSRM = "https://project-osrm.org/";

const END = {
  h2: "See the Longs houses you like, in person",
  p: "An agent shows you the Longs houses you pick.",
  label: "Have us set up a Longs showing", href: `/contact/?place=${encodeURIComponent("Longs")}`,
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  title: "Longs SC Houses for Sale: New Homes, Prices, Flood | Chapter3",
  description: "Houses for sale in Longs, SC, live from the MLS: new homes, price bands, neighborhoods, what houses sold for, taxes, flood zones and the drive to the beach.",
  ogTitle: "Longs, SC houses for sale, and what it is like to live in Longs",
  crumb: "Longs",
  eyebrow: "Longs, SC",
  h1: "Longs, SC: houses for sale, and what it is like to live here.",
  h1em: "A Longs address with no city of its own, and a part of it inside North Myrtle Beach.",
  sub: "Houses for sale in Longs, SC, live from the MLS, with what they cost, what they sold for and what a year of owning one costs.",
  heroMedia: G.homesCss() + G.homesQScript() + glance([
    { icon: "beach", label: "Beach", text: `${BEACH_LO} to ${BEACH_HI} min drive` },
    { icon: "airport", label: "Airport", text: `${AIRPORT} min drive` },
    { icon: "hospital", label: "Hospital", text: `${HOSP} min drive` },
    { icon: "town", label: "City", text: "None, county land" },
  ]) + `<p style="margin:1rem 0 .4rem;max-width:720px">More than 320 houses are for sale under a Longs address, about half of them new. These were listed in the past two weeks.</p>` + Q("city=Longs&type=house&domMax=14", "Longs houses listed in the past two weeks") + SEE("/homes/?city=Longs&type=house", "See every Longs house for sale"),
  heroCta: false,
  pageImages: () => PH.pageImages(AIR),
  author: "devin",
  shortAnswer: [
    `In the past year ${n(HS.count)} houses sold under a Longs address, at a middle of ${r1k(HS.median)}. The houses for sale ask a middle of $320,000.`,
    `Longs is not a city. Part of its land lies inside the city of North Myrtle Beach, and that changes a house's tax bill.`,
  ],
  sections: [
    { h2: "Which Longs houses were listed this week?", toc: "New this week", id: "this-week", html: () =>
      CSS +
      h.p(`About 20 townhouses and about 22 condos are for sale in Longs too.`) +
      h.p(`Longs is an unincorporated community in Horry County, zip code 29568. Its mailing address covers new neighborhoods and open land, and part of it lies inside the city of North Myrtle Beach.`) +
      WHERE_MAP },

    { h2: "What do houses in Longs cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`Longs houses for sale ask a middle of $320,000. The middle half ask about $290,000 to $395,000. The lowest asks about $134,000 and the highest about $2.1 million.`) +
      Q("city=Longs&type=house&max=299999", "Longs houses under $300,000") +
      h.p(`The largest group, about 140 houses, asks $300,000 to $399,999.`) +
      Q("city=Longs&type=house&min=300000&max=399999", "Longs houses from $300,000 to $399,999") +
      h.p(`Another 71 ask $400,000 or more.`) +
      Q("city=Longs&type=house&min=400000", "Longs houses at $400,000 and up") },

    { h2: "Is Longs part of North Myrtle Beach?", toc: "City or county", id: "city-or-county", html: () =>
      h.p(`Mostly no, and in part yes. Longs has no city limits of its own. The land with a Longs address is mostly in Horry County, outside any city. The city of North Myrtle Beach also reaches inland over part of it.`) +
      `<p class="c3-lg-wow">About 1 house in 4 sold under a Longs address is in the North Myrtle Beach tax district. Those ${IN.count} houses sold for ${IN_TXT}. The other ${n(OUT.count)} sold for ${OUT_TXT}.</p>` +
      h.p(`The tax district changes the tax bill. On a house at the middle sale price, the yearly bill is about $${n(Math.round((TAX.in4 - TAX.out4) / 10) * 10)} higher in the North Myrtle Beach tax district if you live there.`) +
      h.p(`On a second home or rental it is about $${n(Math.round((TAX.in6 - TAX.out6) / 10) * 10)} higher. The yearly cost section has the dollars.`) +
      h.p(`The ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach guide")} covers the city itself. Before you offer on a Longs house, we tell you which side of the line it is on. A house is in a different tax district, with a different bill, on each side.`) },

    { h2: "Are there new homes for sale in Longs?", toc: "New homes", id: "new-homes", html: () =>
      h.p(`Yes. About half of the Longs houses for sale are new construction, 165 of 323 on 2026-11-17. Some are finished and ready to move into now.`) +
      Q("city=Longs&type=house&has=quick_move_in", "New Longs homes you can move into now") +
      Q("city=Longs&type=house&has=new_construction", "Every new-construction house in Longs") +
      h.p(`Builders sold most of what changed hands. A business, mostly a builder, sold ${F.houses_seller_business.count} of the ${n(HS.count)} houses in the past year, about 3 in 4.`) +
      h.cta("Walk a new-home contract with us", "Send us the builder's contract for a Longs house. We read it with you and point out what to ask before you sign.", "Have us walk a contract", "/contact/", "base") +
      h.p(`Meritage Homes sold ${TOPS["MERITAGE HOMES OF THE CAROLINA"]} of them, Lennar ${TOPS["LENNAR CAROLINAS"]} and D.R. Horton ${F.houses_by_seller["D.R. Horton (DR Horton Inc and D R Horton Inc)"]}.`) +
      h.p(`Those houses sold for a middle of ${r1k(F.houses_seller_business.median)}, against ${r1k(F.houses_seller_person.median)} for the houses a person sold. Our guides to ${h.a("/buyers/new-construction/", "buying new construction")} and to ${h.a("/buyers/new-construction/builders/", "the builders here")} cover the contract and what to ask.`) },

    { h2: "Which Longs houses have a pool, golf, water, land or one level?", toc: "By feature", id: "by-feature", html: () =>
      h.p(`Pick what matters and the homes below follow.`) +
      Q("city=Longs&type=house&has=one_level", "One-level Longs houses, no stairs") +
      Q("city=Longs&type=house&has=pool", "Longs houses with a pool of their own") +
      Q("city=Longs&type=house&has=golf_community", "Longs houses in golf communities") +
      Q("city=Longs&type=house&waterfront=1", "Longs houses with a water view") +
      Q("city=Longs&type=house&lotMin=1", "Longs houses on an acre or more") +
      h.p(`A house with a water view is not always on its own shoreline. We check what the water is, and whether you can reach it, before you offer.`) },

    { h2: "Which Longs neighborhoods have homes for sale?", toc: "Neighborhoods", id: "neighborhoods", html: () =>
      h.p(`Five neighborhoods have the most houses for sale right now.`) +
      HOODS.map(([name, head]) => Q(`subdivision=${name}&type=house&city=Longs`, head)).join("") +
      h.p(`Houses are also for sale in these Longs neighborhoods. Each link opens our search for it.`) +
      `<ul class="c3-lg-list">${MORE.map(([name, label]) => `<li>${h.a(hoodSearch(name), label)}</li>`).join("")}</ul>` +
      h.p(`Neighborhoods have their own associations and fees. Our ${h.a("/hoa/fees-by-neighborhood/", "HOA fee guide")} explains how to read one.`) },

    { h2: "Are there townhomes and condos in Longs?", toc: "Townhomes and condos", id: "townhomes-condos", html: () =>
      h.p(`A few. About 20 townhouses and 22 condos are for sale.`) +
      Q("city=Longs&type=townhouse", "Longs townhouses for sale") +
      Q("city=Longs&type=condo", "Longs condos for sale") +
      h.p(`For a condo near the water, the ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach guide")} and our ${h.a("/invest/condo-buildings/", "condo buildings guide")} cover the buildings by the ocean.`) },

    { h2: "Can I buy land in Longs?", toc: "Land", id: "land", html: () =>
      h.p(`Yes. Of the 38 lots and parcels for sale with a Longs address, 32 are an acre or more.`) +
      Q("city=Longs&type=land&lotMin=1", "Longs land, an acre or more") +
      h.p(`Clients of ours from North Carolina bought land in Longs and built a new house there with a builder.`) +
      h.p(`Before you buy a lot, we check its flood zone and its zoning. We also check whether the city of North Myrtle Beach reaches it. Our ${h.a("/buyers/land/", "land buying guide")} covers the steps.`) },

    { h2: "What have Longs houses sold for?", toc: "Sold prices", id: "sold", html: () =>
      h.p(`In the past year ${n(HS.count)} houses sold with a Longs address. The middle price was ${r1k(HS.median)}. The middle half sold for ${r1k(HS.p25)} to ${r1k(HS.p75)}. We counted them one deed at a time in the county's recorded deeds.`) +
      SOLD_CHART +
      h.p(`That is a little under the $320,000 the houses for sale ask in the middle. Sale prices are from Horry County deeds. A new house counts when its builder sold it.`) },

    { h2: "What does a year cost to own a house in Longs?", toc: "Yearly cost", id: "yearly-cost", html: () =>
      h.p(`Two bills come every year besides your loan and insurance: the county's property tax and, in a neighborhood with an association, its fee.`) +
      h.p(`South Carolina taxes a home you live in on 4 percent of its value. It taxes a second home or a rental on 6 percent. You must apply for the 4 percent rate.`) +
      h.p(`Take a house that sold for ${r1k(PRICE)}, the middle sale price. The county tax on it is below. Each figure assumes the county values the house at its price, before any small watershed levy.`) +
      h.table(["Tax a year", "Outside any city", "In the North Myrtle Beach tax district"], [
        ["A house you live in", `about ${r100(TAX.out4)}`, `about ${r100(TAX.in4)}`],
        ["A second home or rental", `about ${r100(TAX.out6)}`, `about ${r100(TAX.in6)}`],
      ]) +
      h.p(`The fee shown for a Longs house for sale is a middle of about $${HOA_MID} a month, and the middle half show $${HOA_LO} to $${HOA_HI}. About 22 houses show no fee. The agent who listed the house enters that fee, so we confirm it with the association.`) +
      h.p(`For a house you live in, outside any city, tax plus twelve months at that middle fee comes to about ${money(YEAR)} a year. Our ${h.a("/buyers/property-taxes/", "property tax guide")} explains how the county works out the bill.`) +
      Q("city=Longs&type=house&hoa=0", "Longs houses with no HOA fee listed") },

    { h2: "Is Longs in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`For most houses, no. The flood map and the storm record each tell part of it.`) +
      h.ul([
        `<strong>The map:</strong> about 2 in 100 of the houses that sold under a Longs address sit in FEMA's high-risk flood zone, 28 of ${n(FL.houses)}. None of the houses in the North Myrtle Beach tax district do. We checked each house's lot against FEMA's map.`,
        `<strong>The storm:</strong> after Hurricane Florence in 2018, the National Weather Service reported five feet of water in homes in Polo Farms, off SC 905. It reported up to three feet in Aberdeen Country Club, in Longs.`,
      ]) +
      h.p(`We do not rate a place. We check the house you like against FEMA's map and its flood history. See ${h.a("/buyers/flood-zone-check/", "how to check a house's flood zone")}.`) },

    { h2: "How far is Longs from the beach?", toc: "Drive to the beach", id: "beach", html: () =>
      h.p(`The beach is ${BEACH_LO} to ${BEACH_HI} minutes by car from the middle of Longs, at Ocean Drive and at Cherry Grove Pier. Both are in North Myrtle Beach. Myrtle Beach itself is farther.`) +
      h.p(`Barefoot Landing is about ${min("barefoot_landing")} minutes away and Grand Strand Regional hospital about ${min("grand_strand_medical")}. Coastal Grand Mall is about 38 minutes and the airport about ${AIRPORT}.`) },

    { h2: "Is Longs a good place to live?", toc: "Living here", id: "living-here", html: () =>
      h.p(`That depends on what you want to drive to. About half of the houses for sale are new, and the hospital is ${HOSP} minutes away.`) +
      h.p(`We do not rate a place as safe or unsafe. For public records on any address, see the ${h.a("/buyers/property-records/", "property records guide")}. For a town with its own center and downtown, compare ${h.a("/submarkets/little-river/", "Little River")} and ${h.a("/submarkets/conway/", "Conway")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Longs, SC FAQ",
  faq: [
    { q: "What county is Longs, SC in?", a: "Horry County. Longs is an unincorporated community, so it has no city government. Its zip code is 29568." },
    { q: "How far is Longs from Myrtle Beach?", a: `The beaches in North Myrtle Beach are ${BEACH_LO} to ${BEACH_HI} minutes by car from the middle of Longs. Coastal Grand Mall in Myrtle Beach is about 38 minutes and the airport about ${AIRPORT}, without traffic.` },
    { q: "Does Longs have an HOA?", a: `Longs is not one association. Each neighborhood has its own, and about 22 houses for sale show no fee. The rest show a middle of about $${HOA_MID} a month. That is the entry of the agent who listed the house, not the association's bill.` },
    { q: "Is Longs in North Myrtle Beach?", a: "Part of it is. Longs has no city limits, but about 1 house in 4 sold under a Longs address is inside North Myrtle Beach, which changes its tax bill." },
  ],
  sources: [
    { name: "county deeds", href: DEEDS },
    { name: "Horry County GIS", href: GIS },
    { name: "2026 tax levy", href: LEVY },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "FEMA flood map", href: FEMA },
    { name: "NWS Florence report", href: NWS },
    { name: "drive estimates", href: OSRM },
  ],
  sourcesNote: "Our counts from county parcels, flood maps and the past year's deeds. Listing counts in aggregate from CCMLS. Drives from the middle of Longs, without traffic.",
  bottomCta: END,
  keywords: "Longs SC houses for sale, Longs SC homes for sale, Longs SC new construction, Longs SC neighborhoods, Longs SC flood zone, Longs SC HOA, how far is Longs SC from Myrtle Beach, Longs SC property tax, Longs SC land for sale, Longs SC real estate",
  about: "Longs, an unincorporated community in Horry County, South Carolina",
});
