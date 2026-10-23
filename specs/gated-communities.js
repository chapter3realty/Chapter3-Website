/* /buyers/gated-communities/ - the gated neighborhoods near Myrtle Beach, sold one at a time.
 *
 * Version 6, round 14 (2026-10-14 and 15). A rebuild, not a patch. The owner's third read
 * (voice/VERDICTS.md, 2026-10-14): "im scrolling for a very long time before i get to anything
 * valuable"; the list three times, the map three times, illustrations nobody reads, a table nobody
 * understands; "surface level ... sell the location ... find whats unique talk about why people would
 * want to live there then mention price then move to the next location"; "theres not even any CTA's
 * for any property"; "don't do the facts: thats not how a human talks". Lessons B39 to B44; CRAFT 1, 3,
 * 4 and 5; batches/2026-10-b/review/ROUND-14.md.
 *
 * Reader (CRAFT 1, audience rule). Someone who typed "gated communities Myrtle Beach" or "gated
 * communities near Myrtle Beach SC". They have money and want a way of living, privacy and service.
 * What they would pay an expert to know, in order:
 *   1. Which gated places exist here, and which one fits the life they want (ocean, boat, golf, 55+).
 *   2. The club: whose course, what it has hosted, whether membership is part of the house or extra.
 *   3. The water: a beach club, a marina with staff, a ramp at home.
 *   4. How the gate really works: a guard or a keypad, how guests and deliveries get in.
 *   5. What the fee takes off their hands (cable, security, a dock master) and what it does not.
 *   6. What a normal week is like: dining, events, groups.
 *   7. History and landmarks only a local knows.
 *   8. Then price and fee, and a way to see the homes.
 *   And the question we cannot rate: is it safer? (CRAFT 1, "Answer the question you cannot answer".)
 *
 * Top results read 2026-10-14 (CRAFT 1):
 *   homeguidemyrtlebeach.com/gated-communities-in-myrtle-beach/: 18 names as links, then a table of 15
 *     with unsourced "insights" and price guesses; no gate details or fees; the lists do not match.
 *   mbcoastalhomes.realgeeks.com/gated-communities/: 12 names linked to listing searches, live listings
 *     (some not gated); no description of any community.
 *   countryclubmag.com, "Top 20 Most Expensive Gated Communities": a ranked list with a paragraph each;
 *     some gate details; no prices or fees despite the title; vague praise.
 *   Each does one thing well (the listings; a paragraph per place). None says how a gate works, what a
 *   club costs beside the house, or what only one place has. We beat them on that, and on a way to act
 *   on each place.
 *
 * Shape (CRAFT 3, "No preamble"): the short answer, one offer box, the selection guide (the only list of
 * places before the entries, grouped by what each does best, with the one map inside it), then the 20
 * entries, north to south as the map. Each entry: its best non-obvious thing first, then a normal day,
 * one honest trade-off, price and fee in one sentence, and its own offer, a button to the contact form
 * with the place named (/contact/?about=<place>). After the entries: one plain price table, what a gate
 * does, the yearly cost, pros and cons, the labelled example, the FAQ. Cut: the glance tiles, the
 * second and third maps, the "What are you looking for?" table, the "The facts:" lines.
 *
 * Round 14c (owner's eye 14, OWNER-EYE-14-gated-communities.md; lessons B46, B47): a labelled aerial
 * back on the eight entries whose label sits on what the entry leads with; the rest go to the photo
 * partner's shot list (photo-request-abdulla.html). How each gate works, from rows 400 to 443, or
 * nothing. The club point once, in the short answer; each entry's trade-off is its own. Seaside,
 * Covington Lake East, Myrtle Trace and the Golf and Yacht Club rewritten for a gated buyer (rows 520
 * to 533). Cut: the dek's facts list, the safety section and its gate aerial, the story section, the
 * amenity roll calls. Pros and cons only this page's research found.
 *
 * Facts: batches/2026-10-b/facts/gated-communities-facts.md. Rows 1 to 199 as verified in rounds 1 to
 * 13, in their verifiers' wording limits (struck list: gated-communities-struck.json). New rows 200 to
 * 399, round 14, from five researchers (batches/2026-10-b/facts/r14/), pending verification by agents
 * that did not research them. Never: safe, secure, exclusive, luxury; a rating; who lives anywhere; a
 * conclusion about an HOA, a club or a builder; a rate or a payment.
 *
 * Design: the liquid glass theme (batches/2026-10-b/DESIGN-GLASS.md) when it lands. TODO(design): swap
 * GUIDE_CSS and OFFER for the theme's classes and its per-place offer button.
 */
const { h, kit, photoSetB, prosCons, story, BB } = require("./_kit.js");
const path = require("path");
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const G = require(path.join(BB, "tools", "glass.js"));

const SELF = "/buyers/gated-communities/";
const SEASONS = "/buyers/55-plus-communities/seasons-at-prince-creek-west/";
const FARM = "/submarkets/carolina-forest/the-farm/";
const OFFER = "/contact/";
const OFFER_LABEL = "Get this week's list";

/* Sources, linked in the body or the sources line. */
const CODE = "https://library.municode.com/sc/horry_county/codes/code_of_ordinances?nodeId=COOR_CH18LADERE";
const LBTS_GUIDE = "https://litchfieldbythesea.com/wp-content/uploads/2026/06/LBTS-Guest-Orientation-Guide-2026-Long-Version.pdf";
const DYE_RULES = "https://www.barefoothoa.com/wp-content/uploads/2022/05/DES_Rules_Regs_V3_Final.pdf";
const HERITAGE = "https://www.heritageplantation.com/";
const DEBORDIEU_PACKET = "https://www.debordieucolony.org/wp-content/uploads/2026/06/Welcome-Packet-2026-Website.pdf";
const WACHESAW = "https://www.wachesaw.com/";
const RESERVE_MARINA = "https://sccm.scseagrant.org/safe-harbor-reserve-harbor-recertifies-as-a-s-c-clean-marina/";

/* ---------------------------------------------------------------------------- */
/* The 20 places, north to south. lat/lon: the dot used on the earlier maps (data/gated-map.json, or the
   address point of ledger rows 57 to 76); here they only place the six area marks on the one map. */
const E = [
  { id: "tidewater-plantation", name: "Tidewater Plantation", lat: 33.85093, lon: -78.62229, area: "nmb", price: "About $625,000", fee: "About $230" },
  { id: "seaside-plantation", name: "Seaside Plantation", lat: 33.82688, lon: -78.66809, area: "nmb", price: "About $720,000", fee: "About $210" },
  { id: "barefoot-resort", name: "Barefoot Resort", full: "Dye Estates and Leatherleaf in Barefoot Resort", lat: 33.80788, lon: -78.7403, area: "nmb", price: "About $700,000 to $975,000 in Leatherleaf", fee: "About $390 in Leatherleaf" },
  { id: "grande-dunes", name: "Grande Dunes", full: "the gated sections of Grande Dunes", lat: 33.75879, lon: -78.82911, area: "mb", price: "About $1.5 million", fee: "About $200 to $400" },
  { id: "waterway-palms-plantation", name: "Waterway Palms Plantation", lat: 33.742110, lon: -78.876082, area: "mb", price: "About $780,000", fee: "About $150" },
  { id: "the-bluffs-on-the-waterway", name: "The Bluffs on the Waterway", lat: 33.746358, lon: -78.867299, area: "mb", price: "About $850,000", fee: "About $150" },
  { id: "myrtle-beach-golf-and-yacht-club", name: "Myrtle Beach Golf and Yacht Club", lat: 33.646385, lon: -79.050559, area: "south", price: "About $225,000 in the older part", fee: "About $95" },
  { id: "prestwick", name: "Prestwick", lat: 33.64245, lon: -78.95602, area: "south", price: "About $480,000", fee: "About $190" },
  { id: "prince-creek-55", name: "Seasons at Prince Creek West", label: "Seasons at Prince Creek West (55+)", href: SEASONS, lat: 33.585419, lon: -79.071772, area: "south", price: "About $500,000", fee: "About $340" },
  { id: "bellwood-landing", name: "Bellwood Landing", lat: 33.582185, lon: -79.073470, area: "south", price: "About $810,000", fee: "About $160" },
  { id: "wachesaw-plantation", name: "Wachesaw Plantation", lat: 33.560796, lon: -79.073101, area: "south", price: "About $700,000", fee: "About $150 on most homes" },
  { id: "wachesaw-east", name: "Wachesaw East", lat: 33.558050, lon: -79.058480, area: "south", price: "About $500,000", fee: "About $145" },
  { id: "the-reserve", name: "The Reserve", lat: 33.49467, lon: -79.1133, area: "pawleys", price: "About $1.3 million", fee: "About $320 on most homes" },
  { id: "willbrook-plantation", name: "Willbrook Plantation", lat: 33.48206, lon: -79.13519, area: "pawleys", price: "About $840,000", fee: "About $340" },
  { id: "litchfield-plantation", name: "Litchfield Plantation", lat: 33.47674, lon: -79.1313, area: "pawleys", price: "About $800,000 to $1.8 million", fee: "About $230 on most homes" },
  { id: "litchfield-by-the-sea", name: "Litchfield by the Sea", lat: 33.471219, lon: -79.126112, area: "pawleys", price: "About $200,000 for a one-bedroom condo to $2.2 million", fee: "About $520 to $1,880" },
  { id: "heritage-plantation", name: "Heritage Plantation", lat: 33.44215, lon: -79.16353, area: "pawleys", price: "About $710,000", fee: "About $325" },
  { id: "debordieu-colony", name: "DeBordieu Colony", lat: 33.3744, lon: -79.17446, area: "pawleys", price: "About $2 million", fee: "About $300 to $400" },
];
E.forEach((e, i) => { e.n = i + 1; });
const byId = Object.fromEntries(E.map((e) => [e.id, e]));

/* ---------------------------------------------------------------------------- */
/* The look. TODO(design): replace with the liquid glass theme's classes (DESIGN-GLASS.md). */
const GUIDE_CSS = `<style>
.c3g-guide{max-width:760px;margin:.4rem 0 0}
.c3g-where{display:grid;gap:1.2rem;align-items:start}
@media(min-width:900px){.c3g-where{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}}
main#main .c3-want.c3g-list{list-style:none;margin:0;padding:.3rem 1rem}
main#main .c3-want.c3g-list>li{padding:.35rem 0;line-height:1.45;background:none;box-shadow:none;border:0!important;border-bottom:1px solid rgba(28,32,40,.12)!important;border-radius:0!important}
main#main .c3-want.c3g-list>li:last-child{border-bottom:0!important}
.c3-want b{color:var(--navy);font-weight:600;margin-right:.45rem}
.c3-want a{color:var(--navy);text-decoration:underline;text-underline-offset:.18em}
.c3-want .sep{color:var(--muted);padding:0 .35rem}
.c3g-map{margin:0}
.c3g-map figcaption{color:var(--muted);font-size:.95rem;line-height:1.5;margin-top:.4rem}
.c3-place-cta{margin:1.2rem 0 .4rem;max-width:720px}
section:has(> .wrap > .c3g-area){padding-top:1.6rem!important;padding-bottom:0!important}
.c3g-area{font-family:var(--sans);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);font-weight:700;margin:0;padding-top:.6rem;border-top:1px solid rgba(28,32,40,.15)}
.c3g-area span{color:var(--muted);font-weight:600}
.c3-place-cta>p{margin-bottom:.2rem}
</style>`;


/* ---------------------------------------------------------------------------- */
/* The one map: five areas along the coast, each a soft circle around its places, named in a glass pill
   with the entry numbers it holds (area-map.js spec.areas, batch 2026-10-b round 14). The circle's middle
   is the middle of its places' dots; its radius reaches the farthest of them, plus 0.8 km. */
const AREAS = [
  ["nmb", "North Myrtle Beach"], ["mb", "Myrtle Beach and Carolina Forest"],
  ["south", "Socastee, Surfside Beach and Murrells Inlet"], ["pawleys", "Pawleys Island to DeBordieu"],
];
/* Map pills: 32 letters at most (area-map.js), so a short name and the entry numbers. */
const MAP_NAME = { nmb: "North Myrtle Beach", mb: "Myrtle Beach", south: "Socastee-Surfside-Murrells", pawleys: "Pawleys Island" };
const nums = (a) => {
  const ns = E.filter((e) => e.area === a).map((e) => e.n);
  return ns.length === 1 ? String(ns[0]) : ns.length === 2 ? `${ns[0]} and ${ns[1]}` : `${ns[0]} to ${ns[ns.length - 1]}`;
};
const km = (lat1, lon1, lat2, lon2) => Math.hypot((lat2 - lat1) * 111.2, (lon2 - lon1) * 111.2 * Math.cos(lat1 * Math.PI / 180));
/* Round 15: the four-area map is cut (owner, 2026-10-21: "not sure what the last photo ... is trying to illustrate"); the area headings say where each place is. */

/* The selection guide: every place once, under what it does best (features, never people). */
const GUIDE_GROUPS = [
  ["The ocean, or an oceanfront club", ["litchfield-by-the-sea", "debordieu-colony", "grande-dunes"]],
  ["A marina with staff", ["the-reserve", "heritage-plantation"]],
  ["A boat ramp at home", ["waterway-palms-plantation", "the-bluffs-on-the-waterway"]],
  ["A famous golf course", ["tidewater-plantation", "barefoot-resort", "prestwick", "wachesaw-plantation", "wachesaw-east"]],
  ["History you live inside", ["litchfield-plantation", "willbrook-plantation"]],
  ["Main Street by golf cart", ["seaside-plantation"]],
  ["55+", ["prince-creek-55"]],
  ["Lots of nearly half an acre", ["bellwood-landing"]],
  ["A fee under $100 a month", ["myrtle-beach-golf-and-yacht-club"]],
];
{
  const seen = GUIDE_GROUPS.flatMap(([, ids]) => ids);
  if (seen.length !== E.length || new Set(seen).size !== E.length) throw new Error("gated-communities: the guide must list each place once");
}
/* The guide links to the entries, and its last line to the map, which now sits beside the price table after the entries (owner's eye 14d, H3). */
/* Round 15 (owner, 2026-10-21: "the landing page is a bit cluttered"): the guide is a grid of small
   glass cards, one per want, each with an icon and its places, in place of ten rows of links. */
const GICON = { "The ocean, or an oceanfront club": "beach", "A marina with staff": "dock", "A boat ramp at home": "pond",
  "A famous golf course": "golf", "History you live inside": "clubhouse", "Main Street by golf cart": "town", "55+": "home",
  "Lots of nearly half an acre": "lawn", "A fee under $100 a month": "dollar" };
const GUIDE = G.guideCards(GUIDE_GROUPS.map(([want, ids]) => ({ icon: GICON[want], label: want,
  items: ids.map((id) => byId[id]).sort((a, b) => a.n - b.n).map((e) => `<a href="#${e.id}">${e.n}. ${e.name}</a>`) })))
  + "<style>main#main .detail-hero .detail-sub{display:none}</style>";

/* ---------------------------------------------------------------------------- */
/* One entry: an H2, the paragraphs, an optional photo under the first paragraph, then the place's own
   offer: the price and fee in one sentence, and a button to book a showing there (glass.js offer(),
   which links to /contact/?place=<place>). The two sit together in one box, as an agent closes: what it
   costs, then "let me show you". */
const ph = photoSetB({ aerialWidth: "720px" });
ph.share("litchfield-by-the-sea-from-above-2023");
function entry(id, head, paras, price, photo) {
  const e = byId[id];
  const [first, ...rest] = paras;
  return { h2: `${e.n}. ${e.label || e.name}: ${head}`, toc: `${e.n}. ${e.name}`, id, html: () =>
    h.p(first) + G.homes(id, e.name, photo ? ph.aerial(photo[0], photo[1], { closeUp: true }) : "") + rest.map((t) => h.p(t)).join("")
    + `<p class="c3-place-price">${price}</p>` };
}

const SECTIONS_PLACES = [
  entry("tidewater-plantation", "nine holes along Cherry Grove Inlet", [
    "Tidewater, in North Myrtle Beach, has one of the best public courses in South Carolina: Golf Digest ranks it No. 38 in the state. Nine of its holes play along the tidal inlet at Cherry Grove.",
    "The course opened in 1990. Golf Digest named it the best new public course in America that year. Golf Magazine put it first on its list of 1990's top 10 new public courses. About seven in ten of the house lots touch the course. Golf membership is sold to residents and property owners of Horry, Georgetown and Brunswick counties.",
    "Tidewater is inside North Myrtle Beach's city limits, with city services. It is on the Intracoastal Waterway, not the ocean, but the neighborhood keeps its own beach cabana, with parking, at Cherry Grove Beach.",
    "Tidewater has about 580 houses and one master association, with six smaller associations under it, so a house may answer to two associations. We check both for any home you like.",
  ], "Homes at Tidewater usually sell for about $625,000. The HOA fee is about $230 a month.",
  ["tidewater-plantation-marsh-from-above-2023", "Tidewater Plantation from above, with its golf holes along the inlet labelled. Houses line the street above the fairways."]),

  entry("seaside-plantation", "Main Street by golf cart", [
    "From the south end of Seaside Plantation, Main Street in North Myrtle Beach is about two-thirds of a mile by road. The way runs on two side streets, with no main highway to cross. The city lets a golf cart with a state permit use secondary roads posted at 35 mph or less, from sunrise to sunset.",
    "Each spring and fall the Society of Stranders brings its shag dance festivals, the Spring Safari and the Fall Migration, to Main Street and Ocean Drive. The ocean is a quarter to three-quarters of a mile from the houses, and some houses look onto the neighborhood's lakes.",
    "Festival weeks bring crowds to Main Street.",
  ], "Homes here usually sell for about $720,000, with an HOA fee of about $210 a month."),

  entry("barefoot-resort", "the course that hosts the Monday After the Masters", [
    "Dye Estates, a gated neighborhood inside Barefoot Resort in North Myrtle Beach, surrounds the Dye Course, home of the Monday After the Masters. Hootie & the Blowfish host the charity pro-am each spring, and it brings celebrities and PGA Tour players to the course. Many of its houses are large custom homes, on lots of about two-thirds of an acre.",
    `Its gate is staffed. A guard works the main gate 24 hours a day, and owners drive through a resident lane with a barcode on the car. A guest gets in only when the owner has given the guard the guest's name and the date. At the second gate, an owner who has set up a gate code can let a guest in by phone. The guest calls from the keypad, and the owner presses 9.`,
    "Leatherleaf, the other gated neighborhood here, has 62 houses with the Love Course on every side. Davis Love III designed that course with Pinehurst No. 2 in mind, and Leatherleaf's Residents' Club has a lifestyle director who plans events.",
    "In summer a free shuttle runs to the owners' beach cabana, which has key-fob parking, showers and a pet-washing station. In these two neighborhoods you call the driver 15 minutes ahead. At Barefoot a golf membership stays with certain houses. The seller gives it up at closing, and the buyer can take it over by enrolling within 60 days.",
    "Most of Barefoot Resort has no gate. In Dye Estates no one may swim, boat or fish in the ponds. Lots there are still for sale with no deadline to build, so a house can go up next door at any time.",
  ], "Leatherleaf homes usually sell for about $700,000 to $975,000, with an HOA fee of about $390 a month. Two Dye Estates homes resold this past year, for about $1.4 million and about $2.5 million."),

  entry("grande-dunes", "an oceanfront club and a marina for big boats", [
    "In Myrtle Beach, many Grande Dunes homes come with a household membership to the Ocean Club, a private club on the beach. It has towel and bar service at its pool and cabanas on the sand. We confirm it for each home you look at.",
    "The private Members Club is a separate membership from the home. Its course was designed by Nick Price, a member of golf's Hall of Fame, with Craig Schreiner. The clubhouse has golf simulators, and the calendar includes themed dinners, wine tastings and a Fourth of July cookout.",
    "Grande Dunes Marina, on the Intracoastal Waterway, has 126 slips and takes boats up to 120 feet long, with fuel and a store. A two-mile trail along the waterway is open to the public. In Calais, Palermo and Villa Venezia, most houses are one-story Mediterranean-style homes, and many have a private pool.",
    "Grande Dunes has a security company on contract, with a main guard house, a north guard house and a guard house at the Ocean Club. This page covers three of its gated sections: Calais, Palermo and Villa Venezia.",
  ], "Homes in those three sections usually sell for about $1.5 million, and the HOA fee is about $200 to $400 a month."),

  entry("waterway-palms-plantation", "a Charleston-style plan around a lake", [
    "Waterway Palms Plantation, in Carolina Forest, was planned to echo Charleston's Battery district. At its center the association owns a lake parcel of about 15 acres. The clubhouse stands on a point in the lake, with water on three sides.",
    "Most houses sold here lately were built since 2020, and they are large: many are custom homes of about 3,000 to 3,800 square feet. Many rise two or three stories, some have an elevator, and lots on the Intracoastal Waterway often have a private dock. The neighborhood also has its own boat ramp on the waterway, so a boat can go in without a trip across town.",
    "The lots are small, and about one in five has no house on the county roll yet.",
  ], "Homes usually sell for about $780,000, and the HOA fee is about $150 a month."),

  entry("the-bluffs-on-the-waterway", "a boathouse clubhouse on the waterway", [
    "The Bluffs on the Waterway, in Carolina Forest, has two clubhouses, and one of them is a boathouse on the Intracoastal Waterway. Its boat ramp sits on a waterfront lot of more than 6 acres. Grande Dunes Marina is about 2.5 miles away by water.",
    "Many of its houses are custom Mediterranean-style homes in stucco. Black Creek runs through the woods along the west side, and the county's bike park is less than a mile away.",
    "The Carolina Bays Parkway (S.C. 31) runs along one side; the nearest lots are about 280 feet from it.",
  ], "Homes here usually sell for about $850,000; the HOA fee is about $150 a month."),

  entry("myrtle-beach-golf-and-yacht-club", "room for the boat and the camper", [
    "At Myrtle Beach Golf and Yacht Club, off Bay Road in Socastee, the association keeps storage for RVs, trailers and boats, for a fee when space is open. Enterprise Landing, a public boat ramp on the Intracoastal Waterway, is about a 4-minute drive from the entrance.",
    "The owners' association owns about 62 acres of open land, most of it the wide strips of grass and woods between the streets. Its Community Watch desk is covered 24 hours a day, and the HOA fee is about $95 a month.",
    "Despite the name, there is no golf or yacht club anymore; Heron Point, its golf club, closed years ago. Sandpiper Place, where D.R. Horton is building new houses, shares the entrance but has its own owners association. We look up the association for any home you like.",
  ], "In the older part, homes usually sell for about $225,000."),

  entry("prestwick", "a Pete and P.B. Dye course named Course of the Year", [
    "Prestwick, near Surfside Beach, has a course by Pete Dye and his son P.B. Dye that was named the 2025 Myrtle Beach Area Golf Course of the Year. It carries several of Dye's marks: wooden bulkheads along many water banks, deep-faced bunkers around greens that are often raised, and fast greens.",
    "Prestwick opened in 1989 as a private club, founded by the Jackson family, who also created Ocean Lakes. The Gatlin Brothers once lived here and held a charity golf tournament each year, and about half the lots are on the course. When the club ended its memberships, the owners association took over the pools and the tennis center. Owners have two pools and two hard courts, and the eleven clay courts take their own membership.",
        "The course is fully public now, so you share the fairways with visiting golfers.",
  ], "Homes usually sell for about $480,000, and the HOA fee is about $190 a month.",
  ["prestwick-course-from-above-2023", "Prestwick from above, with its Dye golf course labelled: houses among the fairways, with a long lake at the left and an RV lot at the lower right."]),

  entry("prince-creek-55", "a clubhouse, indoor and outdoor pools and bocce", [
    "At Seasons at Prince Creek West, in Murrells Inlet, the builder listed a ballroom, a card room, an art studio and a billiards room in the clubhouse.",
    "Today the community has a clubhouse, indoor and outdoor pools, a fitness center, tennis and bocce. The Murrells Inlet MarshWalk is about a 10-minute drive.",
    `Every occupied home must have a resident ${h.a(SEASONS, "55 or older")}. Most are one-story builder homes, about half of them 1,750 to 2,350 square feet. They sit on lots of about a fifth of an acre, so the yards are small. The county roll shows a house on every lot.`,
  ], "Homes usually sell for about $500,000, and the HOA fee, about $340 a month, includes internet, trash pickup and lawn care."),

  entry("bellwood-landing", "big lots on Collins Creek, with TPC beyond the woods", [
    "In Bellwood Landing, in Murrells Inlet, about a dozen lots back onto Collins Creek, which runs through a wide band of woods. Beyond the woods lies TPC Myrtle Beach, a Tom Fazio design that has hosted the PGA Tour's Monday qualifier for the Myrtle Beach Classic.",
    "The lots are big, many of them nearly half an acre, and seventeen are an acre or more. Many houses are custom, often two stories.",
    "For tennis, pickleball or a cookout, owners drive about 4 minutes to the Park at Prince Creek West. It has courts and a covered pavilion with grills. The park is shared with the other Prince Creek West neighborhoods, not Bellwood's own.",
  ], "Homes here usually sell for about $810,000, and the HOA fee is about $160 a month."),

  entry("wachesaw-plantation", "a members' club on a bluff above the river", [
    "Before the neighborhoods were planned, archaeologists dug at Wachesaw, on the Waccamaw River in Murrells Inlet. Their University of South Carolina study of Wachesaw and the neighboring Richmond Hill plantation found more than half a million artifacts. Some finds are on display in the clubhouse.",
    `The members own the Wachesaw Plantation Club. Its Tom Fazio course has hosted Carolinas Golf Association championships. Each March the members host the Can-Am Junior Team Matches.`,
    "From the best lots you look down a Fazio fairway or out over the Waccamaw River.",
    "Kimbels, the club's restaurant, is on the bluff above the waterway and the 18th green, with a Tavern Room, open decks and an enclosed porch. Wachesaw's eight clay tennis courts and its book clubs and card groups fill the rest of the week. The main gate has a guard, and Wacca Wache Marina, outside the gates, has about 100 wet slips and indoor racks.",
    "The club is rebuilding its pool and its Magnolia's restaurant, so part of the club is a work site for now.",
  ], "Homes usually sell for about $700,000, and the HOA fee on most homes is about $150 a month."),

  entry("wachesaw-east", "where the LPGA played four years", [
    "Wachesaw East, in Murrells Inlet, has a course that hosted four televised LPGA Tour events, from 1997 to 2000. Karrie Webb won the first two.",
    "Clyde Johnston laid out the course on a former rice plantation, past freshwater lakes and wetlands. Houses line the fairways behind the gate, most of them one story and from the early 2000s. The club's grill, the Toasted Tee Pub & Grub, has hosted happy hours with live music.",
    "The course and its grill are a business of their own, not the homeowners': Festiva Real Estate Holdings bought them in 2017.",
  ], "Homes usually sell for about $500,000, and the HOA fee is about $145 a month."),

  entry("the-reserve", "Greg Norman's private course and a marina with dry storage", [
    `Near Pawleys Island, The Reserve's marina sits at the southern tip of Sandy Island, where Thoroughfare Creek meets the Waccamaw River. Staff launch and haul boats from a dry storage building that holds about 200. The marina also has a fuel dock, and a boardwalk runs through a cypress forest to the river.`,
    "The Reserve Golf Club is a private Greg Norman course of up to 7,200 yards, set among 160 acres of wetlands. It has hosted the Carolinas Mid-Amateur twice, and a golf membership includes the club's dining and social events.",
    "Each fall the Pawleys Island Festival of Music & Art puts up its tent at the golf club, and the neighborhood has private beach access with parking.",
    "Dry storage takes boats up to 27 feet. A bigger boat needs a wet slip or a side tie.",
  ], "Homes usually sell for about $1.3 million, and the HOA fee on most homes is about $320 a month."),

  entry("willbrook-plantation", "a neighborhood on three rice plantations", [
    "Willbrook, near Pawleys Island, was built on the land of three rice plantations, Willbrook, Oatland and Turkey Hill, and its golf course crosses two of them. Five markers along the course tell that history hole by hole. Under the live oaks by the 5th hole are brick remains at the site of the plantation house, which burned in 1895 and was rebuilt that year.",
    "By the 8th hole is the Oatland cemetery of enslaved people, protected inside the community. After rice, the land was used for duck and quail hunting.",
    "Willbrook is a gated neighborhood of about 250 houses inside Litchfield by the Sea, with its own clubhouse and social calendar. Its residents have Litchfield by the Sea's private beach and Beach Club, and one car barcode is issued for both. Golf membership is separate, and the club accepts applications from any golfer.",
  ], "Homes usually sell for about $840,000, and the HOA fee is about $340 a month.",
  ["willbrook-plantation-named-from-above-2023", "Willbrook Plantation from above: its houses are in the middle and at the upper right, beside golf fairways. The houses at the lower left are in Litchfield Plantation."]),

  entry("litchfield-plantation", "the owners own the plantation house", [
    "Near Pawleys Island, at the end of the Avenue of Live Oaks, stands Litchfield Plantation's house, and the owners own it. For about 50 years the developer controlled the association. In 2018 the owners took control after court challenges, and the house, its pool and about 7 acres passed to the association.",
    "The house and its avenue of oaks appear on a map of the land drawn in 1794. After taking it over, the owners repaired it and set up a club room, and it has hosted weddings to help pay for its upkeep. A terrace off the main room overlooks the old rice fields.",
    "The gatehouse stands on the avenue. The association also owns a beach house on Pawleys Island, about 4 miles away by road. A private marina on the river is an optional extra.",
    "The old rice fields beside the community, about 330 acres, still belong to the original development company, not to the owners.",
  ], "Houses here usually sell for about $800,000 to $1.8 million. The HOA fee on most homes is about $230 a month."),

  entry("litchfield-by-the-sea", "a mile of beach and a guard around the clock", [
    "Litchfield by the Sea, near Pawleys Island, has about a mile of its own beach, with an oceanfront Beach Club, a deck and a pavilion.",
    `A guard works the main gate day and night. Owners' cars come in with a barcode, and each guest must be registered by the owner before the visit.`,
    "A normal week can include Tai Chi on Wednesday and yoga on Thursday at the Beach Club. In between there is crabbing off the docks on Osprey Lake and a walk on the paved paths through the marsh.",
    "Many homes are condos and villas from the 1980s to the 2000s, and the Beach Club comes with the home. The association also lists single-family homes in Charlestowne Grant, Compass Point and River Club, and freestanding villas in Oystercatcher Island. Many of Charlestowne Grant's houses are raised beach houses.",
    "It is many neighborhoods inside the gates, each with its own sub-association, and the HOA fee differs from section to section and from unit to unit. In the sections whose sales we read, condo and villa fees range from about $620 a month to about $1,880 for an oceanfront condo.",
  ], "One-bedroom condos in Summerhouse usually sell for about $200,000, and four villas in Breakers Reef sold last year for about $1.5 million to $2.2 million.",
  ["litchfield-by-the-sea-from-above-2023", "Litchfield by the Sea from above: homes around a lake, large buildings by the beach and the Atlantic Ocean at the right."]),

  entry("heritage-plantation", "a dock master and a crow's nest over the river", [
    "Heritage Plantation, near Pawleys Island, has a marina with a full-time dock master. Its dock house is built over the Waccamaw River, with a crow's nest and a swing on its roof. The marina also has a deck over the water, bordered by cypress trees, that serves as a daily sunset gathering place.",
    `The HOA fee includes cable TV, home internet, the dock master and 24-hour security, and the association lists a separate phone line for the main gate.`,
    "Many mornings are reserved for league play on four green-clay Har-Tru courts and four pickleball courts. The Heritage Club, a public par-71 course by Dan Maples, lies among the live oaks on land that was once the True Blue and Midway plantations.",
    "A few lots look over the old rice fields toward the river.",
    "Trash pickup costs extra, and boat slips are rented by the day, the month or the year.",
  ], "Homes usually sell for about $710,000, and the HOA fee is about $325 a month."),

  entry("debordieu-colony", "a planters' colony with a Dye course and a private beach club", [
    "Before the Civil War, rice planters built a colony of summer homes at DeBordieu, on the ocean south of Pawleys Island. Later owners of the land included Isaac Emerson, the Bromo-Seltzer maker, and the Vanderbilt family. Locals say \"Debidue\".",
    "Only DeBordieu owners can join the DeBordieu Club. It has a Pete and P.B. Dye course that has hosted the Carolinas Mid-Amateur, and eight Har-Tru tennis courts. Its places to eat include the Beanery cafe and the Beach Club, with three dining spaces. On the Fourth of July the colony holds a parade.",
    "Many houses are raised beach houses with an elevator, and some stand right on the ocean. Every car comes through one gate. Guests are registered online, in an app or by phone, and a guest pass lasts up to a week. The colony covers 2,700 acres, and at least 600 of them are a nature preserve.",
    "South Carolina spends public money to rebuild a beach only where the public has full access to it, and DeBordieu does not qualify. Its owners pay for their beach themselves, through assessments to a beach fund they voted to set up. Boats cannot stay at the community dock overnight.",
  ], "Homes here usually sell for about $2 million, and the HOA fee is about $300 to $400 a month.",
  ["debordieu-beach-houses-from-the-ocean-2011", "DeBordieu Colony from over the ocean in 2011: large houses behind the dunes, with walkways over the dunes to the beach, and the salt marsh beyond."]),
];

/* ---------------------------------------------------------------------------- */
/* The places side by side: one plain table after the entries, three columns. */
/* The gate, one or two words per place, only from a row (owner's eye 14f, M3). Empty where no row says.
   Rows: Tidewater 20 (listings: guard house); Barefoot 211, 212 (Dye Estates); Grande Dunes 405; Golf and
   Yacht Club 149, 259; Prestwick 82; Seasons batch 2026-10-a rows 92, 93 (call box); Wachesaw 21 (listings);
   Willbrook 356 (barcode); Litchfield Plantation 165; Litchfield by the Sea 6; Heritage 442; DeBordieu owners packet. */
const GATE = {
  "tidewater-plantation": "Guard house", "barefoot-resort": "Guard and keypad (Dye Estates)", "grande-dunes": "Guard houses",
  "myrtle-beach-golf-and-yacht-club": "Gatehouse", "prestwick": "Gatehouse", "prince-creek-55": "Call box",
  "wachesaw-plantation": "Guard", "willbrook-plantation": "Car barcode", "litchfield-plantation": "Gatehouse",
  "litchfield-by-the-sea": "Guard, around the clock", "heritage-plantation": "24-hour security", "debordieu-colony": "Guest passes",
};
const TABLE = (() => {
  const td = "padding:.45rem .6rem;border-bottom:1px solid var(--line,#e3dccf);vertical-align:top;text-align:left";
  const rows = E.map((e) => `<tr><td style="${td}"><a href="#${e.id}" style="color:var(--navy);text-decoration:underline;text-underline-offset:.18em">${e.n}. ${e.name}</a></td><td style="${td}" data-l="Homes sell for">${e.price}</td><td style="${td}" data-l="HOA fee a month">${e.fee}</td>${GATE[e.id] ? `<td style="${td}" data-l="Gate">${GATE[e.id]}</td>` : `<td style="${td}"></td>`}</tr>`).join("");
  /* On a phone each row becomes a short card: the name, then the two figures with their labels, so
     nothing is cut off at 390 px (owner's eye 14, M10). */
  const css = `<style>.c3g-tkey{display:none}@media(max-width:640px){.c3g-tkey{display:block;color:var(--muted);font-size:.9rem;margin:0 0 .3rem}.c3g-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.c3g-table tr{display:block;padding:.3rem 0;border-bottom:1px solid var(--line,#e3dccf)}.c3g-table td{display:inline;border:0!important;padding:0!important;font-size:.95rem}.c3g-table td[data-l]::before{content:" \\00B7  ";color:var(--muted)}}</style>`;
  return `${css}<div style="max-width:760px"><p class="c3g-tkey">Place &middot; homes sell for &middot; HOA fee a month &middot; gate</p><table class="c3g-table" style="border-collapse:collapse;width:100%;font-size:var(--read,1.0625rem);line-height:1.45"><thead><tr><th scope="col" style="${td}">Neighborhood</th><th scope="col" style="${td}">Homes sell for</th><th scope="col" style="${td}">HOA fee a month</th><th scope="col" style="${td}">Gate</th></tr></thead><tbody>${rows}</tbody></table></div>`;
})();

/* A small heading above the first entry of each area, north to south (owner's eye 14e, H1): the page
   asks "where", and the entries already run in map order. Each is a slim section of its own. */
const AREA_FIRST = { ...MAP_NAME, south: "Socastee, Surfside Beach and Murrells Inlet" };
function withAreas(list) {
  const out = []; const seen = new Set();
  for (const s of list) {
    const e = byId[s.id];
    if (!seen.has(e.area)) {
      seen.add(e.area);
      out.push({ id: `area-${e.area}`, html: () => `<h3 class="c3g-area">${AREA_FIRST[e.area]}<span>, ${nums(e.area)}</span></h3>` });
    }
    out.push(s);
  }
  return out;
}

/* ItemList schema for the numbered entries. */
const ITEMLIST = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "Gated communities near Myrtle Beach", numberOfItems: E.length,
  itemListElement: E.map((e) => ({ "@type": "ListItem", position: e.n, name: e.name, url: `https://chapter3realty.com${SELF}#${e.id}` })) })}</script>`;

const OFFER_TEXT = "Tell us the neighborhoods you like and your price range. One of our agents will email you this week's homes for sale there, with the HOA fee and what it covers.";
const OFFER_MID = "Pick two or three of these places and tell us your price range. One of our agents will send you the homes for sale in each, side by side.";
const OFFER_SHORT = "Tell us the places and your price range. One of our agents will email you this week's homes.";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => ph.pageImages(),
  title: "Gated Communities in Myrtle Beach: 18 Neighborhoods | Chapter3",
  description: "Eighteen gated neighborhoods from North Myrtle Beach to DeBordieu, south of Pawleys Island: their clubs, marinas, history, homes and prices.",
  ogTitle: "Gated communities near Myrtle Beach: what each of the 18 does best",
  crumb: "Gated Communities",
  eyebrow: "Gated communities",
  h1: "Where are the gated communities near Myrtle Beach?",
  h1em: "From the Cherry Grove marsh to the ocean at DeBordieu.",
  sub: "Two of these gated communities sit on the ocean, and ten have golf.",
  heroCta: false, /* round 15 (owner, 2026-10-21): the homes strips are the offer */
  author: "devin",
  toc: false,
  shortAnswer: [
    `These 18 gated neighborhoods run from North Myrtle Beach to DeBordieu Colony, south of Pawleys Island. Most of them are on a golf course or on the water. Homes in them usually sell for about $200,000 to about $2 million, and most homeowners association (HOA) fees are about $95 to $400 a month.`,
  ],
  sections: [
    { id: "choose", html: () =>
      GUIDE_CSS + G.homesCss() + ph.css() +
      `<p style="font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600">Choose by what you want</p>` +
      GUIDE },

    ...withAreas(SECTIONS_PLACES),

    { h2: "What do homes sell for, and what is the HOA fee?", toc: "Prices", id: "compare", html: (bg) =>
      `<div class="c3g-where">${TABLE}</div>` +
      h.p(`For neighborhoods without a gate, see ${h.a("/buyers/best-neighborhoods/", "the best neighborhoods in Myrtle Beach")}, ${h.a("/buyers/no-hoa-homes/", "homes with no HOA")}, ${h.a("/buyers/golf-communities/", "golf communities")} and ${h.a("/buyers/55-plus-communities/", "55+ communities")}.`) },


    { h2: "What are the pros and cons of a gated community?", toc: "Pros and cons", id: "pros-and-cons", html: (bg) =>
      prosCons([
        "Most of these neighborhoods are built around something you use: a golf course, a marina, a boat ramp or a beach club.",
        "Some HOA fees cover more than the gate, such as security, cable or internet.",
        "Some gates have a guard on duty day and night; others have a gatehouse or a watch desk.",
      ], [
        { text: "Every guest, contractor and delivery has to get through the gate, so a party or a repair takes some planning." },
        { text: "Only two of the 18 are on the ocean, so from most of them a beach day starts in the car." },
        { text: `Owners pay for big projects through their association. Outside city limits in Horry County the HOA, not the county, maintains the ${h.ext(CODE, "private streets")}, and DeBordieu's owners pay assessments to rebuild their beach.`, act: `Our agents check for ${h.a("/hoa/special-assessments/", "special assessments")} before you make an offer.` },
      ], { bg }) },

  ],
  faqTitle: "Gated communities FAQ",
  faq: [
    { q: "Does a gate make a neighborhood safer?", a: "We do not rate any neighborhood as safe or unsafe. The price table shows which gates have a guard, a gatehouse, a keypad or a call box." },
    { q: "How do guests get through the gate?", a: "By a guard with a guest list, a call box at the gate, or a code from the owner. When you tour homes with us, we set up the visit with the gate before we go." },
    { q: "Is there a gated community in Surfside Beach?", a: "No, not inside the town. Prestwick, about a mile outside it, is the gated neighborhood on this page nearest Surfside Beach." },
    { q: "Are there 55+ gated communities near Myrtle Beach?", a: "Yes. Seasons at Prince Creek West in Murrells Inlet is the 55+ community on this page, and visitors use a call box at its main entrance." },
    { q: "Are there gated golf communities near Myrtle Beach?", a: "Yes. Most of the places on this page are golf communities, from Tidewater in North Myrtle Beach to DeBordieu Colony." },
    { q: "Is Barefoot Resort a gated community?", a: "Only in part. Barefoot Resort in North Myrtle Beach is mostly open, with a few gated neighborhoods inside it." },
    { q: "Is Grande Dunes a gated community?", a: "Only in part. Grande Dunes in Myrtle Beach is a large planned community, and only some of its sections have gates." },
  ],
  sources: [
    { name: "Dye Estates rules", href: DYE_RULES },
    { name: "Litchfield by the Sea guest guide", href: LBTS_GUIDE },
    { name: "DeBordieu owners' packet", href: DEBORDIEU_PACKET },
    { name: "Heritage Plantation association", href: HERITAGE },
    { name: "SC Clean Marina, Reserve Harbor", href: RESERVE_MARINA },
    { name: "Wachesaw Plantation Club", href: WACHESAW },
  ],
  sourcesNote: "Also the associations' and clubs' own documents, county records and local news. Each price is the past year's middle sale, checked against the MLS and the county deed index, and Horry County prices leave out builder sales. A price from few sales is a rough guide, and drive times assume no traffic. Not legal advice.",
  afterSources: () => ph.credits() + ITEMLIST,
  bottomCta: { h2: "Get this week's homes for sale in the gated neighborhoods you like.", p: OFFER_TEXT, label: OFFER_LABEL, href: OFFER },
  keywords: "gated communities Myrtle Beach, gated communities North Myrtle Beach, gated communities Murrells Inlet, gated communities Pawleys Island, 55+ gated communities Myrtle Beach, gated golf communities Myrtle Beach, homes for sale in gated communities Myrtle Beach",
  about: "Gated residential neighborhoods along the Grand Strand, from North Myrtle Beach to Pawleys Island, South Carolina",
});
