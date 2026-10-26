/* /buyers/second-home/ - where to buy a second home on the Grand Strand, whether you may rent it when you are
 * away, which loan fits, and what it costs to hold each year.
 *
 * Version 1, 2026-10-26 (owner: "Lets definitely fix the second home blog page just redesign and write that
 * thing"). Replaces the hand-made page, which had two FAQ blocks, a "Coming soon" search box, "our lender",
 * a tax gap called "close to double" (it is three to four times) and rate talk.
 * The reader lives out of state and wants a beach place for vacations, maybe rented when they are away.
 * Must-answers (Google suggestions for "second home myrtle beach": vacation homes for sale, oceanfront, beach
 * house for sale): where to buy, can I rent it, which loan, what it costs a year.
 * The deciding fact: a second-home loan needs you to use the home part of the year and keep control of it,
 * and the rent cannot help you qualify (ledger rows A1 to A8). The towns differ most on nightly rentals (B).
 * Facts: Blog-Brain r17 second-home ledger, rows as cited, after the independent check.
 */
const { h, kit, photoSetB, BB } = require("./_kit.js");
const path = require("path");
const G = require(path.join(BB, "tools", "glass.js"));
const { placesMap } = kit;

const SELF = "/buyers/second-home/";
const FANNIE = "https://selling-guide.fanniemae.com/sel/b2-1.1-01/occupancy-types";
const MB_ZONING = "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php";
const NMB_STR = "https://www.nmb.us/833/Short-term-Rentals";
const SC_TAX = "https://www.scstatehouse.gov/code/t12c043.php";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const IRS = "https://www.irs.gov/publications/p527";
const DOR = "https://dor.sc.gov/sites/dor/files/forms/ST575.pdf";
const DOI = "https://doi.sc.gov/954/Second-Home-Insurance-What-You-Need-to-K";

/* The six places, north to south. Map points: Census geocoder matches for a public address in each place
   (r17), or the batch's existing strip points. Prices: Zillow Home Value Index, September 2026 (rows G1 to G6). */
const E = [
  { id: "north-myrtle-beach", name: "North Myrtle Beach", lat: 33.82231, lon: -78.67907 },
  { id: "myrtle-beach-oceanfront", name: "Myrtle Beach oceanfront", map: "Myrtle Beach", lat: 33.69379, lon: -78.87788 },
  { id: "surfside-beach", name: "Surfside Beach", lat: 33.60635, lon: -78.97711 },
  { id: "garden-city-beach", name: "Garden City Beach", map: "Garden City", lat: 33.57659, lon: -78.99876 },
  { id: "murrells-inlet", name: "Murrells Inlet", lat: 33.55664, lon: -79.03429 },
  { id: "pawleys-island", name: "Pawleys Island", lat: 33.43324, lon: -79.12137 },
];
E.forEach((e, i) => { e.n = i + 1; });
const byId = Object.fromEntries(E.map((e) => [e.id, e]));
/* The strip each entry shows: an existing batch place where one covers it, else a second-home place
   (batches/2026-10-b/data/idx-places.json, "second-home-*"). */
const STRIP = { "north-myrtle-beach": "second-home-north-myrtle-beach", "myrtle-beach-oceanfront": "second-home-myrtle-beach-oceanfront",
  "surfside-beach": "surfside-beach", "garden-city-beach": "second-home-garden-city-beach", "murrells-inlet": "second-home-murrells-inlet",
  "pawleys-island": "second-home-pawleys-island" };

const CSS = `<style>
.c3-place-price{font-weight:600;color:var(--navy);max-width:720px;margin:1rem 0 .4rem}
.c3s-map{margin:.6rem 0 0}
.c3s-map figcaption{color:var(--muted);font-size:.95rem;line-height:1.5;margin-top:.4rem}
.c3s-t{overflow-x:auto;margin:1.1rem 0 1.4rem;max-width:860px}
.c3s-t table{width:100%;border-collapse:collapse;font-size:.97rem;line-height:1.45}
.c3s-t th,.c3s-t td{text-align:left;vertical-align:top;padding:.55rem .8rem .55rem 0;border-top:1px solid rgba(28,32,40,.14)}
.c3s-t thead th{border-top:0;font-family:var(--sans);font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:var(--slate,#5c6b78)}
.c3s-t td:first-child{font-weight:600;color:var(--navy);white-space:nowrap}
.c3s-t td{color:var(--muted)}
@media(max-width:640px){.c3s-t td:first-child{white-space:normal}}
</style>`;

/* The guide: what the reader wants, then where. */
const GUIDE = G.guideCards([
  { icon: "dock", label: "A canal and your own dock", items: ["north-myrtle-beach"] },
  { icon: "beach", label: "A condo on the boardwalk", items: ["myrtle-beach-oceanfront"] },
  { icon: "town", label: "A town pier and beach streets", items: ["surfside-beach"] },
  { icon: "pond", label: "The ocean and the marsh", items: ["garden-city-beach"] },
  { icon: "dollar", label: "Seafood and boats", items: ["murrells-inlet"] },
  { icon: "clubhouse", label: "Old beach houses, no hotels", items: ["pawleys-island"] },
].map((g) => ({ icon: g.icon, label: g.label, items: g.items.map((id) => `<a href="#${id}">${byId[id].n}. ${byId[id].name}</a>`) })))
  + "<style>main#main .detail-hero .detail-sub{display:none}</style>";

const MAP = placesMap("Second-home beach towns near Myrtle Beach", E.map((e) => ({ name: e.map || e.name, lat: e.lat, lon: e.lon, href: `#${e.id}` })), {
  caption: "Map of the six places on this page, from North Myrtle Beach south to Pawleys Island.",
});

const ph = photoSetB({ aerialWidth: "720px" });
ph.share("myrtle-beach-beach-from-above");
function entry(id, head, paras, price, photo) {
  const e = byId[id];
  const [first, ...rest] = paras;
  return { h2: `${e.n}. ${e.name}: ${head}`, toc: `${e.n}. ${e.name}`, id, html: () =>
    h.p(first) + G.homes(STRIP[id], e.name, photo ? ph.aerial(photo[0], photo[1], { closeUp: true }) : "") + rest.map((t) => h.p(t)).join("")
    + `<p class="c3-place-price">${price}</p>` };
}

const PLACES = [
  entry("north-myrtle-beach", "canals, docks and the shag", [
    "In Cherry Grove, at the north end of North Myrtle Beach, the streets from 32nd Avenue North to the end of Cherry Grove back onto canals with boat docks. The canals run out to Hog Inlet and the marsh. Cherry Grove was an island until its inlet filled in around 1950.",
    "A few miles south, Ocean Drive is where the shag began. In the 1940s, visitors came to dance at the beach music clubs on Main Street and Ocean Drive. The shag became South Carolina's state dance in 1984.",
    "North Myrtle Beach became a city in 1968. Its four wards are Cherry Grove, Ocean Drive, Crescent Beach and Windy Hill, and it has 9 miles of beach. A nightly rental here needs a city business license, renewed each year, and no other permit.",
    "The canals silt in. Owners of lots on them in east Cherry Grove pay up to $2,400 a year toward dredging, through a district set to last 10 years. The city has also held public meetings on new rental rules since 2024, with nothing adopted yet.",
  ], "Homes in North Myrtle Beach usually sell for about $395,000.",
  ["cherry-grove-canals-from-the-ocean-2011", "Cherry Grove from over the ocean: houses on the canals, many with their own docks, and the marsh behind."]),

  entry("myrtle-beach-oceanfront", "condos on the boardwalk", [
    "The Myrtle Beach Boardwalk runs 1.3 miles along the ocean, from Pier 14 to 16th Avenue North. From a condo on this stretch, you walk out to the beach, the piers and the restaurants along the boardwalk.",
    "The city took its name from the wax myrtle, a shrub that grows wild here. The name won a contest in 1900, and Edgewater came second. South of the towers, Myrtle Beach State Park keeps about a mile of beach with no buildings on it. It opened in 1936 as the first park in the state system.",
    "The city allows nightly rentals only where the zoning allows them, and most of its neighborhoods of houses are zoned against them. The fine is up to $500 for each offense.",
    `Some oceanfront buildings run like hotels, with a registration desk and daily rentals. Fannie Mae does not buy loans in those buildings, so many lenders will not lend on them. The loans that do exist are on our ${h.a("/invest/condotel-financing/", "condotel financing")} page.`,
  ], "Homes across the City of Myrtle Beach usually sell for about $325,000.",
  ["myrtle-beach-beach-from-above", "The wide beach and the dunes in Myrtle Beach, seen from a high floor of an oceanfront building."]),

  entry("surfside-beach", "a town pier and streets of beach houses", [
    "Surfside Beach owns its fishing pier. It is concrete and 814 feet long. Walking on it is free, and a day of fishing costs $14, with the state fishing license included.",
    "Much of the town was once The Ark Plantation. In the 1920s George J. Holiday named it Floral Beach, after his wife Flora and his daughter Floramay. It became Surfside Beach in 1952. When Hurricane Hazel came in 1954, it destroyed 18 of the 65 houses on the beach.",
    "The town has 36 beach access points and 12 parking lots near the beach. Parking by the pier costs $4 an hour.",
    "Stays under 30 days are allowed in only two of the town's zoning districts, R3 and C3. The town's single-family neighborhoods do not allow them.",
  ], "Homes in Surfside Beach usually sell for about $360,000.",
  ["surfside-beach-houses-from-the-sand", "Beach houses behind the low dunes on the ocean side of Surfside Beach."]),

  entry("garden-city-beach", "the ocean on one side, the inlet on the other", [
    "Garden City Beach is a strip of land between the ocean and the marsh of Murrells Inlet. Houses on the marsh side have docks on the tidal creeks.",
    "On the Fourth of July, the Murrells Inlet boat parade starts from the point of Garden City. People watch it from the MarshWalk across the water.",
    "Garden City is not a town. It is split between two counties, and its south end is in Georgetown County. On the Horry County side, the county's zoning has no rule on nightly stays, but an HOA's recorded rules can still forbid them. We read those rules, and check the zoning on the Georgetown County side, before you make an offer.",
  ], "Homes in the 29576 ZIP code, which covers Garden City and Murrells Inlet, usually sell for about $400,000.",
  ["garden-city-beach-and-marsh-from-the-ocean-2011", "Garden City Beach from over the ocean: rows of houses between the beach and the marsh, with docks on the creeks behind."]),

  entry("murrells-inlet", "seafood on the boardwalk, boats in the creek", [
    "Murrells Inlet calls itself the Seafood Capital of South Carolina. It began as a fishing village on a sheltered inlet. The MarshWalk, a half-mile boardwalk along the water, has restaurants and the docks for fishing trips.",
    "Huntington Beach State Park, beside the inlet, has 3 miles of beach. In the park is Atalaya, the Moorish-style winter home of Archer and Anna Hyatt Huntington, now a National Historic Landmark. Brookgreen Gardens, across the highway, holds one of the largest collections of American figurative sculpture in the country.",
    "The waterway along the inlet is in a VE flood zone, the zone where storms bring waves. A home there with a mortgage needs flood insurance. We get a flood quote for any home there.",
  ], "Homes in Murrells Inlet usually sell for about $400,000."),

  entry("pawleys-island", "America's oldest seaside resort", [
    "Rice planters built summer houses on Pawleys Island in the early 1700s, to get away from the rivers in summer. The island calls itself America's oldest seaside resort. Its historic district, in the middle of the island, has houses from about 1780 to 1866.",
    "The town incorporated in 1985 to keep out a large hotel, and it forbids commercial businesses. Apart from two historic inns, the island has no commercial buildings. The Pawleys Island rope hammock was first made here. Pawleys Creek, the tidal creek behind the island's salt marsh, is a wildlife sanctuary with no hunting.",
    "Tourism is the island's main business, and the town plans to keep encouraging rentals. About 300 homes on the island were for rent in 2020. The town requires no business license to rent one out.",
    "Parts of the island flood when heavy rain comes with a high tide, including near both causeways. The streets are narrow, with 20 feet of pavement or less.",
  ], "Homes with a Pawleys Island address, on the island and the mainland side, usually sell for about $550,000.",
  ["pawleys-island-beach-walkway", "A wooden walkway over the dunes to the ocean on Pawleys Island."]),
];

const RENT_TABLE = `<div class="c3s-t"><table><thead><tr><th>Where</th><th>Nightly and weekly rentals</th><th>What we check</th></tr></thead><tbody>`
  + [
    ["City of Myrtle Beach", "Only where the zoning allows them. Most streets of houses do not.", "The unit's zoning"],
    ["North Myrtle Beach", "Allowed with a city business license, renewed each year.", "New rules, if the city adopts them"],
    ["Surfside Beach", "Only in the R3 and C3 districts.", "The house's district"],
    ["Horry County outside the cities", "No county rule.", "The HOA's recorded rules"],
    ["Pawleys Island", "Tourism is the main business, and no license is needed.", "The town's rules for the house"],
    ["Georgetown County outside the towns", "A house rented for 30 days or less is allowed in the resort districts.", "The zoning"],
  ].map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("") + `</tbody></table></div>`;

const TAX_TABLE = `<div class="c3s-t"><table><thead><tr><th>A $400,000 home, 2026</th><th>Your home</th><th>Your second home</th></tr></thead><tbody>`
  + `<tr><td>City of Myrtle Beach</td><td>About $1,615 a year</td><td>About $6,110 a year</td></tr>`
  + `<tr><td>Horry County outside the cities</td><td>About $1,470 a year</td><td>About $4,820 a year</td></tr>`
  + `</tbody></table></div>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => ph.pageImages(),
  title: "Second Homes Near Myrtle Beach: 6 Beach Towns | Chapter3",
  description: "Six beach towns for a second home near Myrtle Beach, where you may rent it by the night, which loan fits, and the tax bill on a $400,000 home.",
  ogTitle: "Buying a second home near Myrtle Beach: six towns, the rental rules and the yearly cost",
  crumb: "Second Home",
  eyebrow: "Second homes",
  h1: "Where should you buy a second home near Myrtle Beach?",
  h1em: "Six beach towns, from Cherry Grove to Pawleys Island.",
  sub: "Six beach towns, their rental rules and the yearly tax on a second home.",
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The beach towns differ most in one thing: whether you may rent your place by the night when you are away. North Myrtle Beach allows it with a city license. The City of Myrtle Beach and Surfside Beach allow it only in some zones. Property tax on a $400,000 second home is about $4,800 to $6,100 a year, three to four times a full-time owner's bill.`,
  ],
  sections: [
    { id: "choose", html: () =>
      CSS + G.homesCss() + ph.css() +
      `<p style="font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600">Choose by what you want</p>` +
      GUIDE + `<div class="c3s-map">${MAP.html}</div>` },

    ...PLACES,

    { h2: "Can you rent it out when you are not there?", toc: "Renting it", id: "renting", html: () =>
      h.p("Yes, in most of these places. Each town makes its own rule, an HOA can forbid what the town allows, and your loan has its own limits. Here is each town's rule for nightly and weekly stays.") +
      RENT_TABLE +
      h.p("Every rental is also a business here. Guests pay lodging tax on any stay under 90 days: about 13 percent in the City of Myrtle Beach, about 12 percent elsewhere in Horry County, and about 11 percent on Pawleys Island. A stay of 90 days or more in a row is not taxed as lodging.") +
      h.p(`If you use it yourself for more than 14 days, or more than 10 percent of the days it is rented, the IRS treats it as a home, and that limits what you can deduct. If it counts as a home and you rent it fewer than 15 days in a year, the IRS does not count the rent as income. The day count is on our ${h.a("/invest/14-day-rule/", "14-day rule")} page.`) },

    { h2: "Is it a second home or an investment property?", toc: "Which loan", id: "loan", html: () =>
      h.p("Decide this before you apply for a loan. Most lenders follow Fannie Mae's rules, and Fannie Mae calls a home a second home only when:") +
      h.ul([
        "you live in it yourself for part of the year;",
        "it is one home, not a duplex;",
        "it can be lived in all year;",
        "you alone control it, so no management company decides who stays there;",
        "the rent from it is not used to qualify you for the loan.",
      ]) +
      h.p("Some rent is allowed. If the lender sees rental income, the loan can still be a second-home loan, as long as the rent did not help you qualify and every other rule is met. A home you will not live in is an investment property, and lenders price that loan differently.") +
      h.p(`A condo in a building run like a hotel, with a rental pool or daily rentals, fails Fannie Mae's rules for the building itself. Our lending partner can lay out both kinds of loan for the home you choose. For a building like that, see ${h.a("/invest/non-warrantable-condos/", "condos most lenders will not finance")}.`) },

    { h2: "What does a second home cost to hold each year?", toc: "Yearly cost", id: "cost", html: () =>
      h.p("South Carolina taxes a second home on 6 percent of its value, and the home you live in on 4 percent. Your own home also pays no school operating tax, the largest part of the bill. Together, the two rules make a second home's bill three to four times larger.") +
      TAX_TABLE +
      h.p(`The 4 percent rate is only for the home your household lives in, and the owner certifies that no one in the household is a legal resident of another state. The bill for any town is in our ${h.a("/buyers/property-taxes/", "property tax calculator")}.`) +
      h.p("Insurance is the other large cost. On a beach house, you insure the house against wind and often flood. In a condo, the association insures the building and puts the cost in the monthly fee, and your own policy covers the inside of the unit and your things.") +
      h.p(`A federal flood policy has a $250 yearly surcharge when the home is no one's main home. For a main home, the surcharge is $25. Renting the home out will likely raise the premium. What each policy costs here is on our ${h.a("/buyers/coastal-insurance/", "coastal insurance")} page.`) },

    { h2: "Should you buy a condo or a beach house?", toc: "Condo or house", id: "condo-or-house", html: () =>
      `<div class="c3s-t"><table><thead><tr><th></th><th>A condo</th><th>A beach house</th></tr></thead><tbody>`
      + [
        ["The building", "The association insures it and keeps up the outside. The cost is in the monthly fee.", "You insure it against wind and often flood, and the roof is yours."],
        ["Your own policy", "Covers the inside of the unit and your things.", "Covers the whole house."],
        ["Big repairs", "An older building can charge every owner a special assessment.", "You pay for them when they come."],
        ["The loan", "A building run like a hotel fails Fannie Mae's rules, so fewer lenders finance it.", "Any second-home or investment loan."],
      ].map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("") + `</tbody></table></div>`
      + h.p(`We read a building's budget and its ${h.a("/hoa/special-assessments/", "special assessments")} before you make an offer on a condo.`) },
  ],
  faqTitle: "Second home FAQ",
  faq: [
    { q: "Can I get the 4 percent tax rate on a second home in South Carolina?", a: "No. South Carolina gives the 4 percent rate only to the home your household lives in. A second home is taxed on 6 percent of its value and also pays the school operating tax." },
    { q: "Can I rent out my second home in Myrtle Beach?", a: "Yes, in some places. North Myrtle Beach allows nightly rentals with a city license. The City of Myrtle Beach and Surfside Beach allow them only in some zones. A second-home loan also expects you to live in it part of the year and keep control of it." },
    { q: "Do my guests pay lodging tax?", a: "Yes, on any stay under 90 days: about 11 to 13 percent, depending on the town. A stay of 90 days or more in a row is not taxed as lodging." },
    { q: "What if I rent it for less than two weeks a year?", a: "If you also use it yourself for more than 14 days, the IRS does not count the rent as income, and you deduct no rental costs." },
  ],
  sources: [
    { name: "Fannie Mae Selling Guide, occupancy types", href: FANNIE },
    { name: "City of Myrtle Beach zoning", href: MB_ZONING },
    { name: "North Myrtle Beach short-term rentals", href: NMB_STR },
    { name: "SC Code 12-43-220", href: SC_TAX },
    { name: "Horry County 2026 tax levy", href: LEVY },
    { name: "SC Department of Revenue, lodging tax rates", href: DOR },
    { name: "IRS Publication 527", href: IRS },
  ],
  sourcesNote: "Also the towns' own pages, the Surfside and Georgetown County zoning codes, SC State Parks and Zillow's home value index for September 2026. Tax figures are estimates from 2026 millage. Not legal or tax advice.",
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Found a place you like?", p: "Send it to us. We check its rental rules, its HOA papers and its tax bill before you make an offer.", label: "Send us the home", href: "/contact/?topic=second-home" },
  keywords: "second home Myrtle Beach, vacation homes for sale Myrtle Beach, beach house for sale Myrtle Beach, oceanfront condo Myrtle Beach, second home North Myrtle Beach, second home Pawleys Island, second home property tax South Carolina, can I rent my second home Myrtle Beach",
  about: "Buying a second home or vacation home on the Grand Strand, from North Myrtle Beach to Pawleys Island, South Carolina",
});
