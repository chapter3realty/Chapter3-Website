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

/* What a nightly rental took in, from the site's one source for these numbers (data/str-market.json, AirROI,
   trailing twelve months, average per active listing, before costs). Refresh it, then rebuild this page. */
const STR = require("../data/str-market.json");
const MARKET = { "north-myrtle-beach": "north-myrtle-beach", "myrtle-beach-oceanfront": "myrtle-beach", "surfside-beach": "surfside-beach",
  "garden-city-beach": "garden-city", "murrells-inlet": "murrells-inlet", "pawleys-island": "pawleys-island" };
const take = (id) => {
  const m = STR.markets.find((x) => x.slug === MARKET[id]);
  if (!m) throw new Error(`second-home: no STR market for ${id}`);
  return `About $${(Math.round(m.revenue / 1000) * 1000).toLocaleString("en-US")}`;
};
const PRICE = { "north-myrtle-beach": "About $395,000", "myrtle-beach-oceanfront": "About $325,000", "surfside-beach": "About $360,000",
  "garden-city-beach": "About $400,000 (ZIP 29576)", "murrells-inlet": "About $400,000", "pawleys-island": "About $550,000 (the whole Pawleys Island address)" };

const MAP = placesMap("Second-home beach towns near Myrtle Beach", E.map((e) => ({ name: e.map || e.name, lat: e.lat, lon: e.lon, href: `#${e.id}` })), {
  caption: "Map of the six places on this page, from North Myrtle Beach south to Pawleys Island. Tap a name to read about it.",
});

const ph = photoSetB({ aerialWidth: "720px" });
ph.share("myrtle-beach-beach-from-above");
/* The place's photo first, then its homes (owner's eye r17: the strip had hidden the photo), then the rest. */
function entry(id, head, strip, paras, price, photo) {
  const e = byId[id];
  const [first, ...rest] = paras;
  return { h2: `${e.n}. ${e.name}: ${head}`, toc: `${e.n}. ${e.name}`, id, html: () =>
    h.p(first) + (photo ? ph.aerial(photo[0], photo[1], { closeUp: true }) : "") + G.homes(STRIP[id], e.name, "", strip)
    + rest.map((t) => h.p(t)).join("") + `<p class="c3-place-price">${price}</p>` };
}

const PLACES = [
  entry("north-myrtle-beach", "a dock behind the house, the shag on Main Street", "Homes for sale from Ocean Drive to Cherry Grove", [
    "In Cherry Grove, at the north end of North Myrtle Beach, the streets from 32nd Avenue North to the end of Cherry Grove back onto canals with boat docks. The canals run out to Hog Inlet and the marsh. Cherry Grove was an island until its inlet filled in around 1950.",
    "A few miles south, Ocean Drive is where the shag began. In the 1940s, visitors came to dance at the beach music clubs on Main Street and Ocean Drive. Each spring and fall, the Society of Stranders brings its shag festivals back to the same streets.",
    "North Myrtle Beach has 9 miles of beach. A nightly rental here needs only a city business license, renewed each year.",
    "The canals fill with mud over time. Owners of lots on them in east Cherry Grove pay up to $2,400 a year toward digging them out, through a district set to last 10 years. The city has also held public meetings on new rental rules since 2024, with nothing adopted yet.",
  ], "Homes in North Myrtle Beach usually sell for about $395,000.",
  ["cherry-grove-canals-from-the-ocean-2011", "Cherry Grove from over the ocean: houses on the canals, many with their own docks, and the marsh behind."]),

  entry("myrtle-beach-oceanfront", "condos on the boardwalk", "Condos for sale near the boardwalk", [
    "The Myrtle Beach Boardwalk runs 1.3 miles along the ocean, from Pier 14 to 16th Avenue North. From a condo on this stretch, you walk out to the beach, the piers and the restaurants along the boardwalk.",
    "The city took its name from the wax myrtle, a shrub that grows wild here. The name won a contest in 1900, and Edgewater came second. South of the towers, Myrtle Beach State Park keeps about a mile of beach with no buildings on it. It opened in 1936 as the first park in the state system.",
    "The city allows nightly rentals only where the zoning allows them, and most of its neighborhoods of houses are zoned against them. The fine is up to $500 for each offense.",
    `Some oceanfront buildings run like hotels, with a registration desk and daily rentals. Those buildings are harder to finance, as the ${h.a("#loan", "loan section")} explains.`,
  ], "Homes across the City of Myrtle Beach usually sell for about $325,000.",
  ["myrtle-beach-beach-from-above", "The wide beach and the dunes in Myrtle Beach, seen from a high floor of an oceanfront building."]),

  entry("surfside-beach", "a town pier and streets of beach houses", "Homes for sale near the Surfside Beach pier", [
    "Surfside Beach owns its fishing pier. It is concrete and 814 feet long. Walking on it is free, and a day of fishing costs $14, with the state fishing license included.",
    "Much of the town was once The Ark Plantation. In the 1920s George J. Holiday named it Floral Beach, after his wife Flora and his daughter Floramay. It became Surfside Beach in 1952. When Hurricane Hazel came in 1954, it destroyed 18 of the 65 houses on the beach.",
    "The town has 36 beach access points and 12 parking lots near the beach. Parking by the pier costs $4 an hour.",
    "Stays under 30 days are allowed in only two of the town's zoning districts, called R3 and C3. The town's single-family neighborhoods do not allow them, and we tell you which district a house is in.",
  ], "Homes in Surfside Beach usually sell for about $360,000.",
  ["surfside-beach-houses-from-the-sand", "Beach houses behind the low dunes on the ocean side of Surfside Beach."]),

  entry("garden-city-beach", "the ocean on one side, the inlet on the other", "Homes for sale near the Garden City pier", [
    "Garden City Beach is a strip of land between the ocean and the marsh of Murrells Inlet. Houses on the marsh side have docks on the tidal creeks.",
    "On the Fourth of July, the Murrells Inlet boat parade starts from the point of Garden City. People watch it from the MarshWalk across the water.",
    `Garden City is not a town. It is split between two counties, and its south end is in Georgetown County. On the Horry County side you may rent by the night, unless the house's HOA forbids it, and many houses there have ${h.a("/buyers/no-hoa-homes/", "no HOA")}. We read the HOA's rules, and check the zoning on the Georgetown County side, before you make an offer.`,
  ], "Homes in the 29576 ZIP code, which covers Garden City and Murrells Inlet, usually sell for about $400,000.",
  ["garden-city-beach-and-marsh-from-the-ocean-2011", "Garden City Beach from over the ocean: rows of houses between the beach and the marsh, with docks on the creeks behind."]),

  entry("murrells-inlet", "seafood on the boardwalk, boats in the creek", "Homes for sale near the MarshWalk", [
    "Murrells Inlet began as a fishing village on a sheltered inlet. Its MarshWalk, a half-mile boardwalk along the water, has seafood restaurants and the docks for fishing trips.",
    "Huntington Beach State Park, beside the inlet, has 3 miles of beach. In the park is Atalaya, the Moorish-style winter home of Archer and Anna Hyatt Huntington, now a National Historic Landmark. Brookgreen Gardens, across the highway, has one of the country's largest collections of American statues of people and animals.",
    "Murrells Inlet is not a town either. On the Horry County side, the county has no rule on nightly stays, so only an HOA can forbid them.",
    "The waterway along the inlet is in the highest-risk flood zone on the coast, where storms bring waves. A home there with a mortgage needs flood insurance, and we get a flood quote for any home you like.",
  ], "Homes in Murrells Inlet usually sell for about $400,000."),

  entry("pawleys-island", "summer houses since the 1700s", "Homes for sale on and near Pawleys Island", [
    "Rice planters built summer houses on Pawleys Island in the early 1700s, to get away from the rivers in summer, so it is one of the oldest beach resorts in America. Its historic district, in the middle of the island, has houses from about 1780 to 1866.",
    "The town incorporated in 1985 to keep out a large hotel, and it forbids commercial businesses. Apart from two historic inns, the island has no commercial buildings. The Pawleys Island rope hammock was first made here. Pawleys Creek, the tidal creek behind the island's salt marsh, is a wildlife sanctuary with no hunting.",
    "Pawleys Island allows rentals, and the town requires no business license to rent a home out.",
    "Parts of the island flood when heavy rain comes with a high tide, including near both causeways. The streets are narrow, with 20 feet of pavement or less.",
  ], "Homes with a Pawleys Island address, on the island and the mainland side, usually sell for about $550,000.",
  ["pawleys-island-beach-walkway", "A wooden walkway over the dunes to the ocean on Pawleys Island."]),
];

const table = (head, rows) => `<div class="c3s-t"><table><thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>`
  + rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") + `</tbody></table></div>`;

const RENT_TABLE = table(["Where", "Nightly and weekly rentals", "What we check"], [
  ["City of Myrtle Beach", "Only where the zoning allows them. Most neighborhoods of houses do not.", "The unit's zoning"],
  ["North Myrtle Beach", "Allowed with a city business license, renewed each year.", "New rules, if the city adopts them"],
  ["Surfside Beach", "Only in the R3 and C3 zoning districts.", "The house's district"],
  ["Horry County outside the cities, including Garden City and Murrells Inlet", "Allowed. The county has no rule.", "The HOA's rules, if there is an HOA"],
  ["Pawleys Island", "Allowed. No town business license is needed.", "The house's own papers"],
  ["Georgetown County outside the towns", "A house rented for 30 days or less is allowed in the resort districts.", "The zoning"],
]);

const TAKE_TABLE = table(["Place", "What a nightly rental took in, past year", "Homes usually sell for"], E.map((e) => [e.id === "myrtle-beach-oceanfront" ? "City of Myrtle Beach, all of it" : e.name, take(e.id), PRICE[e.id]]));

const TAX_TABLE = table(["A $400,000 home, 2026", "If you lived in it", "As a second home"], [
  ["City of Myrtle Beach", "About $1,615 a year", "About $6,110 a year"],
  ["Horry County outside the cities", "About $1,470 a year", "About $4,820 a year"],
]);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => ph.pageImages(),
  title: "Second Homes Near Myrtle Beach: 6 Beach Places | Chapter3",
  description: "Six places on the beach for a second home near Myrtle Beach, where you may rent it by the night, what rentals take in, and the tax on a $400,000 home.",
  ogTitle: "Buying a second home near Myrtle Beach: six places, the rental rules and the yearly cost",
  crumb: "Second Home",
  eyebrow: "Second homes",
  h1: "Where should you buy a second home near Myrtle Beach?",
  h1em: "Six places on the beach, from Cherry Grove to Pawleys Island.",
  sub: "Six places on the beach, their rental rules and the yearly tax on a second home.",
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `For a boat at your back door, buy on the Cherry Grove canals in North Myrtle Beach. For a condo on the sand with the boardwalk outside, buy on the Myrtle Beach oceanfront. For an old beach house on an island with no hotels, buy on Pawleys Island.`,
    `North Myrtle Beach, Pawleys Island and the county outside the cities allow nightly rentals. The City of Myrtle Beach and Surfside Beach allow them only in some zones. Property tax on a $400,000 second home is about $4,800 to $6,100 a year.`,
  ],
  sections: [
    { id: "where", html: () => CSS + G.homesCss() + ph.css() + `<div class="c3s-map">${MAP.html}</div>`
      + "<style>main#main .detail-hero .detail-sub{display:none}</style>" },

    ...PLACES,

    { h2: "Can you rent it out when you are not there?", toc: "Renting it", id: "renting", html: () =>
      h.p("Yes, in most of these places. Each town makes its own rule, an HOA can forbid what the town allows, and your loan has its own limits.") +
      RENT_TABLE +
      TAKE_TABLE +
      h.p("The rental figures are averages for the past year, before the manager, cleaning, taxes and the HOA fee. Your own place can earn more or less, depending on the home, its view and how it is run.") +
      h.cta("Want the numbers for one home?", "Send us the listing. We check whether you may rent it by the night, read its HOA rules, and give you its tax bill as a second home.", "Send us the home", "/contact/?topic=second-home", "ivory-2") +
      h.p("Guests pay lodging tax on any stay under 90 days: about 13 percent in the City of Myrtle Beach, about 12 percent elsewhere in Horry County, and about 11 percent on Pawleys Island. You or your rental manager collect it from guests and send it in.") +
      h.p(`The IRS has a rule for a home you both use and rent. Use it yourself for more than 14 days a year, or more than 10 percent of the days it is rented, whichever is more, and the IRS treats it as a home. Then rent from fewer than 15 days a year is tax-free, and your rental deductions cannot be more than the rent. Our ${h.a("/invest/14-day-rule/", "14-day rule")} page has examples.`) },

    { h2: "Is it a second home or an investment property?", toc: "Which loan", id: "loan", html: () =>
      h.p("Decide this before you apply for a loan. Most lenders follow the rules of Fannie Mae, which buys home loans from lenders. Fannie Mae calls a home a second home only when:") +
      h.ul([
        "you live in it yourself for part of the year;",
        "it is one home, not a duplex;",
        "it can be lived in all year;",
        "no agreement gives a management company control over who stays there;",
        "the rent from it is not used to qualify you for the loan.",
      ]) +
      h.p("Some rent is allowed. If the lender sees rental income, the loan can still be a second-home loan, as long as the rent did not help you qualify and every other rule is met. A home you will not live in is an investment property, and lenders price that loan differently.") +
      h.p(`Fannie Mae does not buy loans in a condo building run like a hotel, with a rental pool or daily rentals, so many lenders will not finance a unit there. Other loans exist for those buildings: see ${h.a("/invest/condotel-financing/", "loans for hotel-style condos")}. Our lending partner can lay out both kinds of loan for the home you choose.`) },

    { h2: "What does a second home cost to hold each year?", toc: "Yearly cost", id: "cost", html: () =>
      h.p("South Carolina taxes a second home on 6 percent of its value, and the home you live in on 4 percent. A home you live in also pays no school operating tax, the largest part of the bill. Together, the two rules make a second home's bill three to four times larger.") +
      TAX_TABLE +
      h.p(`In North Myrtle Beach and Surfside Beach, the bill on a $400,000 second home falls between these two. Every town's bill is in our ${h.a("/buyers/property-taxes/", "property tax calculator")}.`) +
      h.p(`Insurance is the other large cost, and the condo and beach house table below shows who insures what. A federal flood policy has a $250 yearly surcharge when the home is no one's main home. For a main home, the surcharge is $25. Renting the home out will likely raise the premium. What each policy costs here is on our ${h.a("/buyers/coastal-insurance/", "coastal insurance")} page.`) +
      h.p("We get the insurance quotes and the HOA fee for any home you like before you make an offer, so you know the whole yearly cost.") },

    { h2: "Should you buy a condo or a beach house?", toc: "Condo or house", id: "condo-or-house", html: () =>
      table(["", "A condo", "A beach house"], [
        ["The building", "The association insures it and keeps up the outside. The cost is in the monthly fee.", "You insure it against wind and often flood, and the roof is yours."],
        ["Your own policy", "Covers the inside of the unit and your things.", "Covers the whole house."],
        ["Big repairs", "An older building can send every owner a one-time bill, called a special assessment.", "You pay for them when they come."],
        ["The loan", `Harder in a building run like a hotel (see ${h.a("#loan", "the loan")}).`, "Any second-home or investment loan."],
      ])
      + h.p(`We read a building's budget and its ${h.a("/hoa/special-assessments/", "special assessments")} before you make an offer on a condo.`) },
  ],
  faqTitle: "Second home FAQ",
  faq: [
    { q: "Can I get the 4 percent tax rate on a second home in South Carolina?", a: "No. South Carolina gives the 4 percent rate only to the home your household lives in, and the owner certifies that no one in the household is a legal resident of another state. A second home is taxed on 6 percent of its value." },
    { q: "Can I use a rental manager with a second-home loan?", a: "Yes, as long as no agreement gives the manager control over who stays in the home and when. The lender also cannot count the rent toward qualifying you for a second-home loan." },
    { q: "Who looks after a second home while I am away?", a: "A local property manager can check on the home, handle repairs and, if you rent it, run the bookings. Chapter3 sells homes and does not manage them, and our property management page explains what managers here charge." },
    { q: "What about hurricane season?", a: "The Atlantic hurricane season runs from June 1 to November 30. A beach house needs a wind policy and usually flood coverage, and a condo owner relies on the building's master policy. We check the flood zone of any home before you make an offer." },
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
  sourcesNote: "Also the towns' own pages, the Surfside and Georgetown County zoning codes, SC State Parks, AirROI's rental data and Zillow's home value index for September 2026 (condos and houses together). Tax figures are estimates from 2026 tax rates. Not legal or tax advice.",
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Found a place you like?", p: "Send it to us. We check its rental rules, its HOA papers and its tax bill before you make an offer.", label: "Send us the home", href: "/contact/?topic=second-home" },
  keywords: "second home Myrtle Beach, vacation homes for sale Myrtle Beach, beach house for sale Myrtle Beach, oceanfront condo Myrtle Beach, second home North Myrtle Beach, second home Pawleys Island, second home property tax South Carolina, can I rent my second home Myrtle Beach",
  about: "Buying a second home or vacation home on the Grand Strand, from North Myrtle Beach to Pawleys Island, South Carolina",
});
