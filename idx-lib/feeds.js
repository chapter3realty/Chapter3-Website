/**
 * A homes feed on every article, near the top, picked for the people who read it (owner,
 * 2026-10-25 and 2026-10-26: "enticing for that type of audience", "decent homes", "very
 * tailor made not just cheap", "no subheader"). One line of title and the homes; nothing else,
 * except the no-HOA source note the CRM requires (ticket 415).
 *
 * Each feed is a set of searches (merged), every one a profile of what that reader comes for:
 * a price band, the towns, the type, the age, and MLS features. Then the same quality bar on
 * every card (QUALITY): for sale only, well photographed, no land or mobile homes unless the
 * page is about them, no price that says "teardown", nothing very old unless the page is about
 * older homes. Then the order: the most appealing first, never the cheapest (rankHomes).
 *
 * FEATURES. `has` and `not` (a pool, a dock, a golf community, short-term rentals allowed, no
 * flood zone) are the CRM's own MLS vocabulary (idx-lib/features.js). The CRM reads them once
 * branch website/idx-filters is merged; until then they are ignored, so every profile also
 * carries filters the CRM reads today, and a title that only a feature makes true has a
 * `headToday` for an answer without `applied` (edge.js runFeed).
 *
 * A title is never about a protected class (fair housing): "people from New York" is a home
 * state, never a person's national origin, race, religion, sex, disability or family. It never
 * promises income, a loan or a rate.
 *
 * Pages that already carry homes strips (batch 2026-10-b) are left out: edge.js fills their own
 * slots. A page not listed here gets no feed.
 */
import { isFeature, isDistance, DISTANCE_MAX } from "./features.js";

/** The quality bar every feed card meets unless the feed says otherwise (see postFilter). */
export const QUALITY = { minPhotos: 12, minPrice: 150000, minPriceCondo: 120000, yearMin: 1975, minSqft: 900, ppsfMin: 110, ppsfMax: 2500 };

const H = (o) => ({ type: "house", status: "active", ...o });
const towns = (list, base) => list.map((city) => ({ ...base, city }));

const NEWEST = { head: "Just listed on the Grand Strand", q: towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet", "Conway"], { status: "active", min: "250000", domMax: "21" }), link: "domMax=21" };
const NO_HOA = { head: "Homes with no HOA fee", q: towns(["Myrtle Beach", "Conway", "Little River", "Surfside Beach", "Murrells Inlet"], H({ hoa: "0", min: "220000" })), link: "hoa=0", noHoa: true, fallback: NEWEST };
/* A condo page never falls back to houses (owner, 2026-10-27: "there's some single family and townhomes in there"). */
const CONDOS_WIDE = { head: "Condos for sale on the Grand Strand", q: towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet", "Little River"], { type: "condo", status: "active", min: "120000" }), link: "type=condo" };
CONDOS_WIDE.fallback = CONDOS_WIDE;
const CONDOS = { head: "Condos for sale on the Grand Strand", q: towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet"], { type: "condo", status: "active", min: "180000", yearMin: "1985" }), link: "type=condo", fallback: CONDOS_WIDE };
const town = (city) => ({ head: `Just listed in ${city}`, q: [{ city, status: "active", min: "200000", domMax: "30" }], link: `city=${encodeURIComponent(city)}&domMax=30`, fallback: NEWEST });
const STARTER = { head: "Starter homes under $300,000", q: towns(["Myrtle Beach", "Conway", "Longs", "Little River", "Surfside Beach"], H({ min: "190000", max: "300000", yearMin: "1995" })), post: { yearMin: 1995 }, link: "max=300000", fallback: NEWEST };

/* Investors: the long-term rental areas the analyzer page names (Carolina Forest, Conway,
   Socastee, Market Common), 3 to 4 bedrooms, newer, a sane price band, rentals allowed. */
const RENTAL_Q = [
  H({ subdivision: "Carolina Forest", beds: "3", min: "240000", max: "460000", yearMin: "2000", has: "long_term_rental_allowed" }),
  H({ city: "Conway", beds: "3", min: "230000", max: "420000", yearMin: "2000", has: "long_term_rental_allowed" }),
  H({ subdivision: "Market Common", beds: "3", min: "260000", max: "520000", yearMin: "2000", has: "long_term_rental_allowed" }),
  H({ city: "Myrtle Beach", beds: "3", min: "240000", max: "450000", yearMin: "2003", has: "long_term_rental_allowed" }),
  { type: "townhouse", status: "active", city: "Myrtle Beach", beds: "3", min: "220000", max: "400000", yearMin: "2005", has: "long_term_rental_allowed" },
];
const RENTAL = { head: "Top long-term rental picks", q: RENTAL_Q, post: { yearMin: 2000, minSqft: 1300 }, rank: "rental", link: "beds=3&min=230000&max=460000" };
const DSCR = { head: "DSCR picks, lowest price per bedroom", q: RENTAL_Q, post: { yearMin: 2000, minSqft: 1300 }, rank: "ppb", link: "beds=3&min=230000&max=460000" };
/* Short-term rentals: condos in the beach towns' resort areas, in buildings that allow them. */
const VACATION = {
  head: "Condos where nightly rentals are allowed", headToday: "Waterfront condos in Myrtle Beach and North Myrtle Beach",
  needs: "has",
  q: towns(["Myrtle Beach", "North Myrtle Beach"], { type: "condo", status: "active", waterfront: "1", min: "200000", max: "850000", yearMin: "1985", has: "str_allowed,east_of_17" }),
  post: { yearMin: 1985 }, link: "type=condo&waterfront=1", fallback: CONDOS,
};
const OCEAN_UNITS = { ...VACATION, head: "Oceanfront condos for sale", headToday: VACATION.headToday, q: towns(["Myrtle Beach", "North Myrtle Beach"], { type: "condo", status: "active", waterfront: "1", min: "160000", max: "600000", yearMin: "1980", has: "oceanfront_unit" }), post: { yearMin: 1980 } };
const MULTI = { head: "Duplexes, triplexes and fourplexes", q: [{ type: "multi", status: "active", min: "250000" }], allowTypes: true, link: "type=multi", fallback: RENTAL };
const NEWER = { head: "Brand-new homes", q: towns(["Myrtle Beach", "Conway", "Little River", "Longs", "North Myrtle Beach"], H({ min: "280000", has: "new_construction" })), post: { builtWithin: 2, strictYear: true }, link: "type=house", fallback: NEWEST };
const SINCE_2010 = { head: "Built since 2010, outside the flood zone", needs: "has", headToday: "Newer homes, built 2010 or later", q: towns(["Myrtle Beach", "Conway", "Little River", "Murrells Inlet", "North Myrtle Beach"], H({ min: "280000", yearMin: "2010", not: "flood_zone" })), post: { yearMin: 2010, strictYear: true }, link: "type=house", fallback: NEWEST };
/* Value-add: solid older houses in established towns, never the $50,000 shells. */
const VALUE_ADD = { head: "Value-add picks", q: towns(["Myrtle Beach", "Surfside Beach", "North Myrtle Beach", "Conway", "Murrells Inlet"], H({ min: "170000", max: "340000", yearMin: "1975", yearMax: "1999" })), post: { yearMin: 1975, yearMax: 1999, minSqft: 1100 }, rank: "ppb", link: "type=house&min=170000&max=340000", fallback: RENTAL };
const FIFTY_FIVE = { head: "Homes for sale in 55+ communities", q: [{ subdivision: "Del Webb", status: "active" }, { subdivision: "Myrtle Trace", status: "active" }, { subdivision: "Seasons at Prince Creek", status: "active" }], post: { minPhotos: 6 }, link: "subdivision=Del%20Webb" };
const GOLF = { head: "Homes in golf communities", q: [H({ subdivision: "Barefoot", has: "golf_community" }), H({ subdivision: "Grande Dunes" }), H({ subdivision: "Prestwick" }), H({ subdivision: "Tidewater" })], link: "" };
const WATER = { head: "Waterfront homes for sale", q: towns(["Murrells Inlet", "Little River", "North Myrtle Beach", "Myrtle Beach", "Pawleys Island"], H({ waterfront: "1", min: "400000" })), link: "waterfront=1" };
const BIG = { head: "Homes with 4 or more bedrooms", q: towns(["Myrtle Beach", "Conway", "Murrells Inlet", "Little River", "North Myrtle Beach"], H({ beds: "4", min: "350000", yearMin: "2000" })), post: { yearMin: 2000 }, link: "type=house&beds=4" };
const COMPETITION = { head: "Your competition: homes for sale now", q: towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet", "Conway"], { status: "active", min: "250000" }), link: "" };
/*
 * Hooks the filters make true (owner, 2026-10-26: "better filters to back up my click bait"): each title
 * is what every home under it has, from the CRM's MLS features (Ticket 471). A feed whose feature the
 * CRM does not list, or that finds too few homes, falls back to the next one under that one's title.
 */
const cut = (head, q, link, fallback) => ({ head, q, link, needs: "has", fallback });
const PRICE_CUT = cut("Price just cut on these homes", towns(["Myrtle Beach", "North Myrtle Beach", "Conway", "Surfside Beach", "Murrells Inlet"], { status: "active", min: "220000", has: "price_reduced" }), "has=price_reduced", NEWEST);
const CUT_300 = cut("Price cut, and under $300,000", towns(["Myrtle Beach", "Conway", "Longs", "Little River", "Surfside Beach"], H({ min: "180000", max: "300000", yearMin: "1990", has: "price_reduced" })), "max=300000&has=price_reduced", STARTER);
const CONDO_CUT = cut("Condos with a fresh price cut", towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet"], { type: "condo", status: "active", min: "150000", has: "price_reduced" }), "type=condo&has=price_reduced", CONDOS);
const FHA_FIRST = cut("Under $300,000, and the seller takes FHA", towns(["Myrtle Beach", "Conway", "Longs", "Little River", "Surfside Beach"], H({ min: "180000", max: "300000", yearMin: "1990", has: "fha_accepted" })), "max=300000&has=fha_accepted", STARTER);
const VA_FEED = cut("3 bedrooms under $400,000, the seller takes VA", towns(["Myrtle Beach", "Conway", "Little River", "Longs"], H({ beds: "3", min: "250000", max: "400000", yearMin: "2000", has: "va_accepted" })), "beds=3&max=400000&has=va_accepted",
  { head: "Homes with 3 or more bedrooms under $400,000", q: towns(["Myrtle Beach", "Conway", "Little River", "Longs"], H({ beds: "3", min: "250000", max: "400000", yearMin: "2000" })), post: { yearMin: 2000 }, link: "type=house&beds=3&max=400000" });
const ONE_LEVEL = cut("One-level homes with a garage", towns(["Myrtle Beach", "Conway", "Little River", "Murrells Inlet", "Longs"], H({ min: "280000", max: "650000", yearMin: "2005", has: "one_level,garage" })), "type=house&has=one_level%2Cgarage", FIFTY_FIVE);
const QUICK = { ...cut("Brand-new homes you can move into now", towns(["Myrtle Beach", "Conway", "Little River", "Longs", "North Myrtle Beach"], H({ min: "260000", has: "quick_move_in" })), "type=house&has=quick_move_in", NEWER), post: { builtWithin: 2, strictYear: true } };
const STILL_BUILT = cut("Still being built: homes going up now", towns(["Myrtle Beach", "Conway", "Little River", "Longs", "North Myrtle Beach"], H({ min: "260000", has: "still_being_built" })), "type=house&has=still_being_built", NEWER);
const DOCK = cut("Homes with their own dock", towns(["Murrells Inlet", "Little River", "North Myrtle Beach", "Myrtle Beach", "Garden City"], H({ min: "350000", has: "private_dock" })), "has=private_dock", WATER);
const ON_COURSE = cut("Homes right on the golf course", towns(["Myrtle Beach", "North Myrtle Beach", "Murrells Inlet", "Little River", "Pawleys Island"], H({ min: "300000", has: "on_golf_course" })), "has=on_golf_course", GOLF);
const OUTSIDE_CITY = cut("Outside city limits: no city property tax", towns(["Myrtle Beach", "Murrells Inlet", "Little River", "Longs"], H({ min: "250000", max: "700000", yearMin: "2000", has: "outside_city_limits" })), "type=house&has=outside_city_limits", NO_HOA);
const MORE_HOUSE = { head: "4 bedrooms for under $400,000", q: towns(["Myrtle Beach", "Conway", "Little River", "Longs", "Murrells Inlet"], H({ beds: "4", min: "260000", max: "400000", yearMin: "2000" })), post: { yearMin: 2000 }, link: "type=house&beds=4&max=400000", fallback: BIG };
const WALK_BEACH = cut("Walk to the beach from these homes", towns(["North Myrtle Beach", "Myrtle Beach", "Surfside Beach", "Garden City"], { status: "active", min: "250000", has: "walk_to_beach" }), "has=walk_to_beach", VACATION);
const WALK_500 = cut("Walk to the beach for under $500,000", towns(["North Myrtle Beach", "Myrtle Beach", "Surfside Beach", "Garden City"], { status: "active", min: "200000", max: "500000", has: "walk_to_beach" }), "max=500000&has=walk_to_beach", WALK_BEACH);
const GOLF_CART = cut("Homes where golf carts are allowed", towns(["North Myrtle Beach", "Myrtle Beach", "Surfside Beach", "Murrells Inlet", "Little River"], { status: "active", min: "250000", has: "golf_cart_ok" }), "has=golf_cart_ok", NEWEST);
const NEAR_HOSPITAL = cut("Homes within 5 miles of Grand Strand Medical Center", [{ status: "active", min: "220000", has: "grand_strand_medical_center_5mi" }], "has=grand_strand_medical_center_5mi", NEWEST);
const NEAR_AIRPORT = cut("Homes within 5 miles of the Myrtle Beach airport", [{ status: "active", min: "220000", has: "myrtle_beach_airport_5mi" }], "has=myrtle_beach_airport_5mi", NEWEST);
const OPEN_HOUSE = cut("Open houses coming up in Myrtle Beach", [{ city: "Myrtle Beach", status: "active", min: "200000", has: "open_house" }, { city: "North Myrtle Beach", status: "active", min: "200000", has: "open_house" }], "has=open_house", town("Myrtle Beach"));
const STR_OCEAN = { ...cut("Oceanfront condos where nightly rentals are allowed", towns(["Myrtle Beach", "North Myrtle Beach"], { type: "condo", status: "active", min: "180000", max: "900000", yearMin: "1985", has: "str_allowed,oceanfront_unit" }), "type=condo&has=str_allowed%2Coceanfront_unit", VACATION), post: { yearMin: 1985 } };
const TURNKEY = cut("Turnkey condos sold furnished, nightly rentals allowed", towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach"], { type: "condo", status: "active", min: "150000", has: "furnished,str_allowed" }), "type=condo&has=furnished%2Cstr_allowed", VACATION);
const RENTAL_PROGRAM = cut("Condos in buildings with a rental program", towns(["Myrtle Beach", "North Myrtle Beach"], { type: "condo", status: "active", min: "120000", has: "vacation_rental_program" }), "type=condo&has=vacation_rental_program", VACATION);
const FORECLOSURE = { ...cut("Foreclosures and bank-owned homes for sale", towns(["Myrtle Beach", "Conway", "Surfside Beach", "Little River", "Longs"], { status: "active", min: "120000", has: "foreclosure" }), "has=foreclosure", VALUE_ADD), post: { yearMin: 1970 } };
const HOA_INSURED = cut("Condos whose HOA fee covers the insurance", towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet"], { type: "condo", status: "active", min: "150000", has: "hoa_includes_insurance" }), "type=condo&has=hoa_includes_insurance", CONDOS);
const RENTALS_OK = cut("Condos where the HOA allows rentals", towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach"], { type: "condo", status: "active", min: "150000", has: "rentals_allowed" }), "type=condo&has=rentals_allowed", CONDOS);
const AMENITIES = cut("Homes with a community pool and clubhouse", towns(["Myrtle Beach", "Conway", "Murrells Inlet", "Little River", "North Myrtle Beach"], H({ min: "260000", yearMin: "2000", has: "community_pool,clubhouse" })), "has=community_pool%2Cclubhouse", NO_HOA);


/*
 * "Homes people from ___ love" (owner, 2026-10-26). The profiles come from what moves people
 * here (Redfin 2023, Horry County DMV transfers 2018-2020: New York, Pennsylvania, New Jersey,
 * Virginia, Florida, Maryland, Connecticut, Ohio, Massachusetts, North Carolina; Northeast
 * retirees, golf, low taxes and more house for the money) and from our own pages (most of our
 * Pennsylvania buyers are retirees; Florida movers come for lower insurance and taxes).
 */

/* Owner, 2026-10-27: town pages show the best homes there, not price cuts ("we don't want it to seem like
   we are showing budget homes"): the quality bar and the appeal order. */
const townTop = (city) => ({ head: `Top homes in ${city}`, q: [{ city, status: "active", min: "250000" }], link: `city=${encodeURIComponent(city)}`, fallback: town(city) });
/* Second homes: the best homes near the beach from Cherry Grove to Pawleys Island, on top of the page's own town rows. */
const TOP_VACATION = { ...cut("Top vacation homes", towns(["North Myrtle Beach", "Myrtle Beach", "Surfside Beach", "Garden City", "Murrells Inlet", "Pawleys Island"], { status: "active", min: "250000", has: "walk_to_beach" }), "has=walk_to_beach", VACATION), withStrips: true };
/* Jobs: homes within 5 miles (about a 15 to 20 minute drive) of the largest employers the page names: the hospitals, the mall and the airport. */
const EMPLOYERS = { ...cut("Homes near major employers", ["grand_strand_medical_center_5mi", "conway_medical_center_5mi", "mcleod_seacoast_5mi", "tidelands_waccamaw_5mi", "coastal_grand_mall_5mi", "myrtle_beach_airport_5mi"].map((k) => ({ status: "active", min: "200000", has: k })), "has=grand_strand_medical_center_5mi", NEWEST) };
/* Fix and flip: the most equity to capture, distressed sales and older houses in the beach-side areas east of 17. */
const FIXERS = { ...cut("Older and distressed homes east of 17", [H({ has: "distressed_sale,east_of_17" }), H({ has: "east_of_17", yearMax: "1985", min: "180000" })], "type=house&has=east_of_17&yearMax=1985", VALUE_ADD), post: { floors: false, yearMin: 1900, minPhotos: 6 } };
/* The HOA guides, each with the homes its reader is weighing. */
const NEWER_CONDOS = { head: "Condos in buildings built since 2005", q: towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet"], { type: "condo", status: "active", min: "150000", yearMin: "2005" }), post: { yearMin: 2005, strictYear: true }, link: "type=condo&yearMin=2005", fallback: CONDOS };
const LOW_FEE = { head: "Condos with an HOA fee under $300 a month", q: towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet", "Little River"], { type: "condo", status: "active", min: "120000", hoaMax: "300" }), link: "type=condo&hoaMax=300", fallback: CONDOS };
const HOA_INTERNET = cut("Condos whose HOA fee includes internet", towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach"], { type: "condo", status: "active", min: "120000", has: "hoa_includes_internet" }), "type=condo&has=hoa_includes_internet", CONDOS);
const BANK_CONDOS = cut("Bank-owned and foreclosure condos", towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Little River"], { type: "condo", status: "active", min: "80000", has: "foreclosure" }), "type=condo&has=foreclosure", CONDOS);
const NO_FINES = { ...NO_HOA, head: "No HOA, no fines: homes with no HOA fee" };
const love = (state, q, extra = {}) => ({ head: `Homes people from ${state} love`, q, link: "type=house", fallback: NEWEST, ...extra });
const FROM = {
  // More house than New York money buys: newer, a garage, near the beach towns.
  "new-york": love("New York", towns(["North Myrtle Beach", "Myrtle Beach", "Little River", "Murrells Inlet"], H({ beds: "3", min: "400000", max: "950000", yearMin: "2005", has: "garage" })), { post: { yearMin: 2005 } }),
  // The Jersey shore, with more room: east of 17, in the shore towns.
  "new-jersey": love("New Jersey", towns(["Surfside Beach", "Garden City", "North Myrtle Beach", "Murrells Inlet"], H({ beds: "3", min: "400000", max: "1300000", yearMin: "1990", has: "east_of_17" })), { post: { yearMin: 1990 } }),
  // Retirees: one level, a garage, newer, some in golf communities.
  "pennsylvania": love("Pennsylvania", [...towns(["Myrtle Beach", "Conway", "Little River", "Longs"], H({ min: "300000", max: "650000", yearMin: "2008", has: "one_level,garage" })), H({ city: "Myrtle Beach", min: "320000", max: "700000", yearMin: "2005", has: "golf_community" })], { post: { yearMin: 2005 } }),
  // Golf and one-level living.
  "ohio": love("Ohio", towns(["Myrtle Beach", "North Myrtle Beach", "Little River", "Longs"], H({ min: "300000", max: "750000", yearMin: "2000", has: "golf_community,one_level" })), { post: { yearMin: 2000 } }),
  // Chesapeake boaters: on the water, with a dock or on the waterway or marsh.
  "maryland": love("Maryland", [...towns(["Murrells Inlet", "Little River", "North Myrtle Beach"], H({ waterfront: "1", min: "450000", max: "1600000", has: "private_dock" })), H({ city: "Myrtle Beach", waterfront: "1", min: "450000", max: "1500000", has: "water_icw" })]),
  // The water and the course.
  "virginia": love("Virginia", [...towns(["Little River", "Murrells Inlet"], H({ waterfront: "1", min: "450000", max: "1500000", has: "private_dock" })), ...towns(["North Myrtle Beach", "Myrtle Beach"], H({ min: "400000", max: "1000000", yearMin: "2000", has: "on_golf_course" }))], { post: { yearMin: 1990 } }),
  // Next door: the north end, newer, a garage.
  "north-carolina": love("North Carolina", towns(["North Myrtle Beach", "Little River", "Calabash", "Longs"], H({ beds: "3", min: "350000", max: "800000", yearMin: "2008", has: "garage" })), { post: { yearMin: 2008 } }),
  // Coastal New England character: the marsh and the inlet towns.
  "massachusetts": love("Massachusetts", [...towns(["Murrells Inlet", "Pawleys Island"], H({ min: "450000", max: "1600000", has: "marsh_view" })), ...towns(["Murrells Inlet", "Pawleys Island"], H({ waterfront: "1", min: "500000", max: "1800000" }))]),
  // Old towns they already love at home: Pawleys Island and Murrells Inlet, on a real lot.
  "connecticut": love("Connecticut", towns(["Pawleys Island", "Murrells Inlet"], H({ min: "500000", max: "1800000", yearMin: "1985", lotMin: "0.3" })), { post: { yearMin: 1985 } }),
  // Halfbacks: newer, out of the flood zone, a garage; some with their own pool.
  "florida": love("Florida", [...towns(["Conway", "Myrtle Beach", "Longs", "Little River"], H({ min: "320000", max: "700000", yearMin: "2015", has: "garage", not: "flood_zone" })), H({ city: "Myrtle Beach", min: "380000", max: "900000", yearMin: "2005", has: "pool" })], { post: { yearMin: 2005 } }),
};

export const FEEDS = {
  "/buyers/": NEWEST,
  "/buyers/buying-in-myrtle-beach/": OPEN_HOUSE,
  "/buyers/common-mistakes/": PRICE_CUT,
  "/buyers/first-time-home-buyer-myrtle-beach/": FHA_FIRST,
  "/buyers/programs/": FHA_FIRST,
  "/buyers/va-loans/": VA_FEED,
  "/buyers/retirees/": ONE_LEVEL,
  "/buyers/second-home/": TOP_VACATION,
  "/buyers/new-construction/": QUICK,
  "/buyers/cost-to-own/": NO_HOA,
  "/buyers/waterfront-homes/": DOCK,
  "/buyers/golf-communities/": ON_COURSE,
  "/buyers/condo-in-litigation/": CONDO_CUT,
  "/buyers/undisclosed-flooding/": SINCE_2010,
  "/buyers/property-taxes/": OUTSIDE_CITY,
  "/buyers/coastal-insurance/": SINCE_2010,
  "/buyers/closing-costs/": CUT_300,
  "/buyers/55-plus-communities/": FIFTY_FIVE,
  "/buyers/55-plus-communities/del-webb-north-myrtle-beach/": { head: "For sale now in Del Webb North Myrtle Beach", q: [{ subdivision: "Del Webb", city: "North Myrtle Beach", status: "active" }], post: { minPhotos: 6 }, link: "subdivision=Del%20Webb", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/del-webb-grande-dunes/": { head: "For sale now in Del Webb at Grande Dunes", q: [{ subdivision: "Del Webb", city: "Myrtle Beach", status: "active" }], post: { minPhotos: 6 }, link: "subdivision=Del%20Webb", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/myrtle-trace/": { head: "For sale now in Myrtle Trace", q: [{ subdivision: "Myrtle Trace", status: "active" }], post: { minPhotos: 6, yearMin: 1980 }, link: "subdivision=Myrtle%20Trace", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/seasons-at-prince-creek-west/": { head: "For sale now in Seasons at Prince Creek", q: [{ subdivision: "Seasons at Prince Creek", status: "active" }], post: { minPhotos: 6 }, link: "subdivision=Seasons%20at%20Prince%20Creek", fallback: FIFTY_FIVE },
  "/buyers/relocating/": NEWEST,
  "/buyers/relocating/cost-of-living/": MORE_HOUSE,
  "/buyers/relocating/pros-and-cons/": GOLF_CART,
  "/buyers/relocating/moving-checklist/": NEWEST,
  "/buyers/relocating/schools/": BIG,
  "/buyers/relocating/which-town/": NEWEST,
  "/buyers/relocating/jobs/": EMPLOYERS,
  "/buyers/relocating/healthcare/": NEAR_HOSPITAL,
  "/buyers/relocating/hurricanes/": SINCE_2010,
  "/buyers/relocating/weather/": WALK_BEACH,
  "/buyers/relocating/getting-around/": NEAR_AIRPORT,
  "/buyers/relocating/why-myrtle-beach/": WALK_500,
  "/buyers/relocating/beaches/": WALK_BEACH,
  ...Object.fromEntries(Object.entries(FROM).map(([s, f]) => [`/buyers/relocating/from-${s}/`, f])),
  "/submarkets/": NEWEST,
  "/submarkets/conway/": townTop("Conway"),
  "/submarkets/garden-city/": townTop("Garden City"),
  "/submarkets/little-river/": townTop("Little River"),
  "/submarkets/murrells-inlet/": townTop("Murrells Inlet"),
  "/submarkets/myrtle-beach/": townTop("Myrtle Beach"),
  "/submarkets/north-myrtle-beach/": townTop("North Myrtle Beach"),
  "/submarkets/pawleys-island/": townTop("Pawleys Island"),
  "/submarkets/surfside-beach/": townTop("Surfside Beach"),
  "/submarkets/carolina-forest/": { head: "Top homes in Carolina Forest", q: [{ subdivision: "Carolina Forest", status: "active", min: "250000" }], link: "subdivision=Carolina%20Forest", fallback: townTop("Myrtle Beach") },
  "/invest/": RENTAL,
  "/invest/str-vs-ltr/": VACATION,
  "/invest/condos/": VACATION,
  "/invest/condotel-financing/": OCEAN_UNITS,
  "/invest/non-warrantable-condos/": OCEAN_UNITS,
  "/invest/condo-buildings/": STR_OCEAN,
  "/invest/airbnb-income/": STR_OCEAN,
  "/invest/str-rules/": VACATION,
  "/invest/str-setup/": TURNKEY,
  "/invest/str-tax-treatment/": VACATION,
  "/invest/accommodations-tax/": VACATION,
  "/invest/14-day-rule/": VACATION,
  "/invest/rental-program-vs-airbnb/": RENTAL_PROGRAM,
  "/invest/j1-rentals/": { head: "Condos near the Myrtle Beach boardwalk", q: [{ type: "condo", status: "active", near: "33.6915,-78.8820", miles: "2", min: "150000" }], link: "type=condo&near=33.6915%2C-78.8820&miles=2", fallback: VACATION },
  "/invest/canadian-buyers/": { head: "North Myrtle Beach condo picks", q: [{ type: "condo", city: "North Myrtle Beach", status: "active", waterfront: "1", min: "200000", yearMin: "1985" }], post: { yearMin: 1985 }, link: "type=condo&city=North%20Myrtle%20Beach&waterfront=1", fallback: VACATION },
  "/invest/cost-segregation/": VACATION,
  "/invest/rental-depreciation/": RENTAL,
  "/invest/run-the-numbers/": { ...RENTAL, low: true },
  "/invest/out-of-state/": RENTAL,
  "/invest/property-management/": RENTAL,
  "/invest/cash-to-close/": RENTAL,
  "/invest/where-to-buy/": RENTAL,
  "/invest/mid-term-rentals/": { head: "Mid-term rental picks", q: [{ type: "condo", status: "active", city: "Myrtle Beach", beds: "2", min: "180000", max: "420000", yearMin: "1995" }, { type: "townhouse", status: "active", city: "Myrtle Beach", beds: "2", min: "200000", max: "420000", yearMin: "2000" }], post: { bedsMax: 3, yearMin: 1995 }, rank: "rental", link: "beds=2&min=180000&max=420000" },
  "/invest/student-rentals/": { head: "Rental picks near Coastal Carolina University", q: [H({ near: "33.7951,-79.0112", miles: "4", beds: "3", min: "200000", max: "420000", yearMin: "1995" })], post: { yearMin: 1995 }, rank: "rental", link: "type=house&near=33.7951%2C-79.0112&miles=4", fallback: RENTAL },
  "/invest/landlord-rules/": RENTAL,
  "/invest/llc/": RENTAL,
  "/invest/foreclosures/": FORECLOSURE,
  "/invest/section-8-rentals/": { head: "Rental picks under $300,000", q: towns(["Conway", "Myrtle Beach", "Longs"], H({ beds: "3", min: "190000", max: "300000", yearMin: "1995" })), post: { yearMin: 1995 }, rank: "ppb", link: "type=house&beds=3&max=300000", fallback: RENTAL },
  "/invest/new-construction-rentals/": NEWER,
  "/invest/financing-multiple-rentals/": DSCR,
  "/invest/landlord-insurance/": SINCE_2010,
  "/invest/rent-prices/": RENTAL,
  "/invest/rental-returns/": RENTAL,
  "/invest/how-long-to-hold/": RENTAL,
  "/invest/what-is-being-built/": STILL_BUILT,
  "/invest/strategies/": RENTAL,
  "/invest/strategies/dscr-loans/": DSCR,
  "/invest/strategies/brrrr/": FORECLOSURE,
  "/invest/strategies/fix-and-flip/": FIXERS,
  "/invest/strategies/1031-exchange/": MULTI,
  "/invest/strategies/dst/": MULTI,
  "/invest/strategies/small-multifamily/": MULTI,
  "/hoa/": NO_HOA,
  "/hoa/special-assessments/": NEWER_CONDOS,
  "/hoa/reserves/": NEWER_CONDOS,
  "/hoa/documents/": HOA_INTERNET,
  "/hoa/liens-and-foreclosure/": BANK_CONDOS,
  "/hoa/south-carolina-hoa-laws/": NO_HOA,
  "/hoa/violations-and-fines/": NO_FINES,
  "/hoa/estoppel-and-transfer-fees/": LOW_FEE,
  "/hoa/dues-increases/": LOW_FEE,
  "/hoa/tax-deductible/": RENTALS_OK,
  "/hoa/rental-restrictions/": RENTALS_OK,
  "/hoa/master-insurance-ho6/": HOA_INSURED,
  "/hoa/who-pays-for-damage/": HOA_INSURED,
  "/hoa/hoa-vs-poa/": NO_HOA,
  "/hoa/benefits/": AMENITIES,
  "/hoa/developer-control-turnover/": STILL_BUILT,
  "/sell/": COMPETITION,
  "/sell/home-value/": { ...COMPETITION, low: true },
  "/sell/net-proceeds/": { ...COMPETITION, low: true },
  "/sell/fsbo/": COMPETITION,
  "/sell/out-of-state-buyers/": COMPETITION,
  "/sell/inherited-house/": { ...COMPETITION, q: towns(["Myrtle Beach", "Conway", "Surfside Beach", "North Myrtle Beach"], H({ min: "200000" })), link: "type=house" },
  "/sell/rental-property/": RENTAL,
  "/sell/sell-my-condo/": { ...COMPETITION, head: "Condos competing with yours right now", q: CONDOS.q, link: "type=condo" },
  "/sell/capital-gains/": COMPETITION,
  "/market-reports/": PRICE_CUT,
  "/market-reports/july-2026/": PRICE_CUT,
};

const SUB = /^[A-Za-z0-9 .,'&()\/-]{2,80}$/;
const TYPES = ["house", "condo", "townhouse", "manufactured", "multi", "land"];
const CITY = /^[A-Za-z .'-]{2,40}$/;

/** One feed search as CRM parameters, from validated parts only; null if a part is bad. */
export function feedParams(q) {
  const p = new URLSearchParams();
  if (q.city !== undefined) { if (!CITY.test(q.city)) return null; p.set("city", q.city); }
  if (q.subdivision !== undefined) { if (!SUB.test(q.subdivision)) return null; p.set("subdivision", q.subdivision); }
  if (q.type !== undefined) { if (!TYPES.includes(q.type)) return null; p.set("type", q.type); }
  for (const k of ["max", "min", "beds", "yearMin", "yearMax", "hoaMax", "garage", "domMax"]) if (q[k] !== undefined) { if (!/^\d{1,9}$/.test(q[k])) return null; p.set(k, q[k]); }
  if (q.lotMin !== undefined) { if (!/^\d{1,4}(\.\d{1,3})?$/.test(q.lotMin)) return null; p.set("lotMin", q.lotMin); }
  if (q.waterfront !== undefined) { if (q.waterfront !== "1") return null; p.set("waterfront", "1"); }
  if (q.hoa !== undefined) { if (q.hoa !== "0") return null; p.set("hoa", "0"); }
  if (q.status !== undefined) { if (q.status !== "active") return null; p.set("status", "active"); }
  for (const k of ["has", "not"]) if (q[k] !== undefined) {
    const keys = q[k].split(",");
    // A key the CRM does not list today drops the whole search: the title promises it.
    if (!keys.length || keys.length > 8 || !keys.every((x) => isFeature(x))) return null;
    p.set(k, keys.join(","));
  }
  if ([...(p.get("has") || "").split(","), ...(p.get("not") || "").split(",")].filter((k) => k && isDistance(k)).length > DISTANCE_MAX) return null;
  if (q.near !== undefined) {
    const m = /^(-?\d{1,2}\.\d{1,6}),(-?\d{1,3}\.\d{1,6})$/.exec(q.near);
    if (!m || +m[1] < 31 || +m[1] > 37 || +m[2] < -82 || +m[2] > -75 || !/^\d{1,2}(\.\d)?$/.test(q.miles || "")) return null;
    p.set("near", q.near); p.set("miles", q.miles);
  }
  return p;
}

const num = (v) => typeof v === "number" && isFinite(v);
const isType = (l, re) => re.test(`${l.propertySubType || ""} ${l.propertyType || ""}`);

/**
 * The answer narrowed: the feed's own `post` (built after or before a year, at most N beds,
 * a size floor) and the quality bar (QUALITY) unless the feed sets `allowTypes` or its own
 * limits. A card that leaves out a field the bar reads is judged on the rest.
 */
export function postFilter(listings, post = {}, feed = {}) {
  // The year is read here, per request: at module scope a Worker's clock reads 1970.
  const yearMin = post.builtWithin ? new Date().getUTCFullYear() - post.builtWithin + 1 : post.yearMin ?? QUALITY.yearMin;
  const minPhotos = post.minPhotos ?? QUALITY.minPhotos;
  const minSqft = post.minSqft ?? QUALITY.minSqft;
  // floors: false (the reader asked for land, mobile homes or a low price): only status and photos.
  const floors = post.floors !== false;
  return listings.filter((l) => {
    if (!l) return false;
    if (l.status && l.status !== "Active") return false;
    if (!l.photo || (num(l.photoCount) && l.photoCount < minPhotos)) return false;
    const condo = isType(l, /condo|apartment/i);
    if (!feed.allowTypes && isType(l, /land|lot|farm|manufactured|mobile/i)) return false;
    const price = num(l.listPrice) ? l.listPrice : null;
    if (floors && price !== null && price < (condo ? QUALITY.minPriceCondo : QUALITY.minPrice)) return false;
    // A title that names a year (strictYear) shows no home without one.
    if (post.strictYear && !num(l.yearBuilt)) return false;
    if (num(l.yearBuilt) && l.yearBuilt < yearMin) return false;
    if (post.yearMax !== undefined && num(l.yearBuilt) && l.yearBuilt > post.yearMax) return false;
    if (floors && !condo && num(l.sqft) && l.sqft < minSqft) return false;
    if (floors && price !== null && num(l.sqft) && l.sqft > 0) {
      const ppsf = price / l.sqft;
      if (ppsf < QUALITY.ppsfMin || ppsf > QUALITY.ppsfMax) return false;
    }
    if (post.bedsMax !== undefined && num(l.beds) && l.beds > post.bedsMax) return false;
    return true;
  });
}

/**
 * The order the reader sees: never the cheapest first (owner, 2026-10-26). "appeal" (the
 * default): newer, roomier and better photographed first, near the middle of the feed's
 * prices. "rental": the same, a little toward more bedrooms for the money. "ppb": lowest
 * price per bedroom first, among homes that already met the bar. "price": lowest first.
 * Then the towns take turns, so one town never fills the row.
 */
export function rankHomes(listings, rank) {
  const price = (l) => (num(l.listPrice) && l.listPrice > 0 ? l.listPrice : null);
  if (rank === "price") return listings.filter(price).sort((a, b) => price(a) - price(b));
  if (rank === "ppb") return interleave(listings.filter((l) => price(l) && num(l.beds) && l.beds > 0).sort((a, b) => price(a) / a.beds - price(b) / b.beds));
  const prices = listings.map(price).filter(Boolean).sort((a, b) => a - b);
  const mid = prices.length ? prices[Math.floor(prices.length * 0.6)] : 0;
  const year = new Date().getUTCFullYear();
  const score = (l) => {
    let s = 0;
    if (num(l.yearBuilt)) s += Math.max(0, 1 - (year - l.yearBuilt) / 40) * 3;
    if (num(l.sqft)) s += Math.min(l.sqft, 4000) / 4000 * 2;
    if (num(l.photoCount)) s += Math.min(l.photoCount, 40) / 40;
    if (mid && price(l)) s += Math.max(0, 1 - Math.abs(Math.log(price(l) / mid)) * 1.5) * 2;
    if (rank === "rental" && price(l) && num(l.beds) && l.beds > 0) s += Math.min(1.5, 120000 / (price(l) / l.beds));
    if (l.waterfront === true) s += 0.4;
    return s;
  };
  return interleave(listings.slice().sort((a, b) => score(b) - score(a)));
}

/** The best of each town in turn, then the next best of each: variety along the row. */
function interleave(sorted) {
  const by = new Map();
  for (const l of sorted) { const k = l.city || ""; if (!by.has(k)) by.set(k, []); by.get(k).push(l); }
  const lanes = [...by.values()], out = [];
  for (let i = 0; out.length < sorted.length; i++) for (const lane of lanes) if (lane[i]) out.push(lane[i]);
  return out;
}
