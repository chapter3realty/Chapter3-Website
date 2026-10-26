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
import { FEATURE_KEYS } from "./features.js";

/** The quality bar every feed card meets unless the feed says otherwise (see postFilter). */
export const QUALITY = { minPhotos: 12, minPrice: 150000, minPriceCondo: 120000, yearMin: 1975, minSqft: 900, ppsfMin: 110, ppsfMax: 2500 };

const H = (o) => ({ type: "house", status: "active", ...o });
const towns = (list, base) => list.map((city) => ({ ...base, city }));

const NEWEST = { head: "The newest listings on the Grand Strand", q: towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet", "Conway"], { status: "active", min: "250000" }), link: "" };
const NO_HOA = { head: "Homes with no HOA fee", q: towns(["Myrtle Beach", "Conway", "Little River", "Surfside Beach", "Murrells Inlet"], H({ hoa: "0", min: "220000" })), link: "hoa=0", noHoa: true, fallback: NEWEST };
const CONDOS = { head: "Condos for sale on the Grand Strand", q: towns(["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet"], { type: "condo", status: "active", min: "180000", yearMin: "1985" }), link: "type=condo" };
const town = (city) => ({ head: `New on the market in ${city}`, q: [{ city, status: "active", min: "200000" }], link: `city=${encodeURIComponent(city)}`, fallback: NEWEST });
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
const DSCR = { head: "Top DSCR picks", q: RENTAL_Q, post: { yearMin: 2000, minSqft: 1300 }, rank: "ppb", link: "beds=3&min=230000&max=460000" };
/* Short-term rentals: condos in the beach towns' resort areas, in buildings that allow them. */
const VACATION = {
  head: "Prime vacation-rental condos", headToday: "Waterfront condos in Myrtle Beach and North Myrtle Beach",
  needs: "has",
  q: towns(["Myrtle Beach", "North Myrtle Beach"], { type: "condo", status: "active", waterfront: "1", min: "200000", max: "850000", yearMin: "1985", has: "str_allowed,east_of_17" }),
  post: { yearMin: 1985 }, link: "type=condo&waterfront=1",
};
const OCEAN_UNITS = { ...VACATION, head: "Oceanfront condo picks", headToday: VACATION.headToday, q: towns(["Myrtle Beach", "North Myrtle Beach"], { type: "condo", status: "active", waterfront: "1", min: "160000", max: "600000", yearMin: "1980", has: "oceanfront_unit" }), post: { yearMin: 1980 } };
const MULTI = { head: "Duplexes, triplexes and fourplexes", q: [{ type: "multi", status: "active", min: "250000" }], allowTypes: true, link: "type=multi", fallback: RENTAL };
const NEWER = { head: "Brand-new homes", q: towns(["Myrtle Beach", "Conway", "Little River", "Longs", "North Myrtle Beach"], H({ min: "280000", has: "new_construction" })), post: { builtWithin: 2 }, link: "type=house", fallback: NEWEST };
const SINCE_2010 = { head: "Newer homes, built 2010 or later", q: towns(["Myrtle Beach", "Conway", "Little River", "Murrells Inlet", "North Myrtle Beach"], H({ min: "280000", yearMin: "2010", not: "flood_zone" })), post: { yearMin: 2010 }, link: "type=house", fallback: NEWEST };
/* Value-add: solid older houses in established towns, never the $50,000 shells. */
const VALUE_ADD = { head: "Value-add picks", q: towns(["Myrtle Beach", "Surfside Beach", "North Myrtle Beach", "Conway", "Murrells Inlet"], H({ min: "170000", max: "340000", yearMin: "1975", yearMax: "1999" })), post: { yearMin: 1975, yearMax: 1999, minSqft: 1100 }, rank: "ppb", link: "type=house&min=170000&max=340000", fallback: RENTAL };
const FIFTY_FIVE = { head: "Homes for sale in 55+ communities", q: [{ subdivision: "Del Webb", status: "active" }, { subdivision: "Myrtle Trace", status: "active" }, { subdivision: "Seasons at Prince Creek", status: "active" }], post: { minPhotos: 6 }, link: "subdivision=Del%20Webb" };
const GOLF = { head: "Golf community homes", q: [H({ subdivision: "Barefoot", has: "golf_community" }), H({ subdivision: "Grande Dunes" }), H({ subdivision: "Prestwick" }), H({ subdivision: "Tidewater" }), H({ subdivision: "Carolina Forest", has: "on_golf_course" })], link: "" };
const WATER = { head: "Waterfront homes for sale", q: towns(["Murrells Inlet", "Little River", "North Myrtle Beach", "Myrtle Beach", "Pawleys Island"], H({ waterfront: "1", min: "400000" })), link: "waterfront=1" };
const BIG = { head: "Homes with 4 or more bedrooms", q: towns(["Myrtle Beach", "Conway", "Murrells Inlet", "Little River", "North Myrtle Beach"], H({ beds: "4", min: "350000", yearMin: "2000" })), post: { yearMin: 2000 }, link: "type=house&beds=4" };
const COMPETITION = { head: "Your competition: homes for sale now", q: NEWEST.q, link: "" };

/*
 * "Homes people from ___ love" (owner, 2026-10-26). The profiles come from what moves people
 * here (Redfin 2023, Horry County DMV transfers 2018-2020: New York, Pennsylvania, New Jersey,
 * Virginia, Florida, Maryland, Connecticut, Ohio, Massachusetts, North Carolina; Northeast
 * retirees, golf, low taxes and more house for the money) and from our own pages (most of our
 * Pennsylvania buyers are retirees; Florida movers come for lower insurance and taxes).
 */
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
  "/buyers/buying-in-myrtle-beach/": town("Myrtle Beach"),
  "/buyers/common-mistakes/": NEWEST,
  "/buyers/first-time-home-buyer-myrtle-beach/": STARTER,
  "/buyers/programs/": STARTER,
  "/buyers/va-loans/": { head: "Homes with 3 or more bedrooms under $400,000", q: towns(["Myrtle Beach", "Conway", "Little River", "Longs"], H({ beds: "3", min: "250000", max: "400000", yearMin: "2000" })), post: { yearMin: 2000 }, link: "type=house&beds=3&max=400000" },
  "/buyers/retirees/": FIFTY_FIVE,
  "/buyers/second-home/": VACATION,
  "/buyers/new-construction/": NEWER,
  "/buyers/cost-to-own/": NO_HOA,
  "/buyers/waterfront-homes/": WATER,
  "/buyers/golf-communities/": GOLF,
  "/buyers/condo-in-litigation/": CONDOS,
  "/buyers/undisclosed-flooding/": SINCE_2010,
  "/buyers/property-taxes/": NO_HOA,
  "/buyers/coastal-insurance/": SINCE_2010,
  "/buyers/closing-costs/": STARTER,
  "/buyers/55-plus-communities/": FIFTY_FIVE,
  "/buyers/55-plus-communities/del-webb-north-myrtle-beach/": { head: "For sale now in Del Webb North Myrtle Beach", q: [{ subdivision: "Del Webb", city: "North Myrtle Beach", status: "active" }], post: { minPhotos: 6 }, link: "subdivision=Del%20Webb", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/del-webb-grande-dunes/": { head: "For sale now in Del Webb at Grande Dunes", q: [{ subdivision: "Del Webb", city: "Myrtle Beach", status: "active" }], post: { minPhotos: 6 }, link: "subdivision=Del%20Webb", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/myrtle-trace/": { head: "For sale now in Myrtle Trace", q: [{ subdivision: "Myrtle Trace", status: "active" }], post: { minPhotos: 6, yearMin: 1980 }, link: "subdivision=Myrtle%20Trace", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/seasons-at-prince-creek-west/": { head: "For sale now in Seasons at Prince Creek", q: [{ subdivision: "Seasons at Prince Creek", status: "active" }], post: { minPhotos: 6 }, link: "subdivision=Seasons%20at%20Prince%20Creek", fallback: FIFTY_FIVE },
  "/buyers/relocating/": NEWEST,
  "/buyers/relocating/cost-of-living/": STARTER,
  "/buyers/relocating/pros-and-cons/": NEWEST,
  "/buyers/relocating/moving-checklist/": NEWEST,
  "/buyers/relocating/schools/": BIG,
  "/buyers/relocating/which-town/": NEWEST,
  "/buyers/relocating/jobs/": STARTER,
  "/buyers/relocating/healthcare/": NEWEST,
  "/buyers/relocating/hurricanes/": SINCE_2010,
  "/buyers/relocating/weather/": NEWEST,
  "/buyers/relocating/getting-around/": NEWEST,
  "/buyers/relocating/why-myrtle-beach/": town("Myrtle Beach"),
  "/buyers/relocating/beaches/": VACATION,
  ...Object.fromEntries(Object.entries(FROM).map(([s, f]) => [`/buyers/relocating/from-${s}/`, f])),
  "/submarkets/": NEWEST,
  "/submarkets/conway/": town("Conway"),
  "/submarkets/garden-city/": town("Garden City"),
  "/submarkets/little-river/": town("Little River"),
  "/submarkets/murrells-inlet/": town("Murrells Inlet"),
  "/submarkets/myrtle-beach/": town("Myrtle Beach"),
  "/submarkets/north-myrtle-beach/": town("North Myrtle Beach"),
  "/submarkets/pawleys-island/": town("Pawleys Island"),
  "/submarkets/surfside-beach/": town("Surfside Beach"),
  "/submarkets/carolina-forest/": { head: "New on the market in Carolina Forest", q: [{ subdivision: "Carolina Forest", status: "active", min: "220000" }], link: "subdivision=Carolina%20Forest", fallback: town("Myrtle Beach") },
  "/invest/": RENTAL,
  "/invest/str-vs-ltr/": VACATION,
  "/invest/condos/": VACATION,
  "/invest/condotel-financing/": OCEAN_UNITS,
  "/invest/non-warrantable-condos/": OCEAN_UNITS,
  "/invest/condo-buildings/": VACATION,
  "/invest/airbnb-income/": VACATION,
  "/invest/str-rules/": VACATION,
  "/invest/str-setup/": VACATION,
  "/invest/str-tax-treatment/": VACATION,
  "/invest/accommodations-tax/": VACATION,
  "/invest/14-day-rule/": VACATION,
  "/invest/rental-program-vs-airbnb/": VACATION,
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
  "/invest/foreclosures/": VALUE_ADD,
  "/invest/section-8-rentals/": { head: "Rental picks under $300,000", q: towns(["Conway", "Myrtle Beach", "Longs"], H({ beds: "3", min: "190000", max: "300000", yearMin: "1995" })), post: { yearMin: 1995 }, rank: "ppb", link: "type=house&beds=3&max=300000", fallback: RENTAL },
  "/invest/new-construction-rentals/": NEWER,
  "/invest/financing-multiple-rentals/": DSCR,
  "/invest/landlord-insurance/": SINCE_2010,
  "/invest/rent-prices/": RENTAL,
  "/invest/rental-returns/": RENTAL,
  "/invest/how-long-to-hold/": RENTAL,
  "/invest/what-is-being-built/": NEWER,
  "/invest/strategies/": RENTAL,
  "/invest/strategies/dscr-loans/": DSCR,
  "/invest/strategies/brrrr/": VALUE_ADD,
  "/invest/strategies/fix-and-flip/": VALUE_ADD,
  "/invest/strategies/1031-exchange/": MULTI,
  "/invest/strategies/dst/": MULTI,
  "/invest/strategies/small-multifamily/": MULTI,
  "/hoa/": NO_HOA,
  ...Object.fromEntries(["special-assessments", "reserves", "documents", "rental-restrictions", "liens-and-foreclosure", "south-carolina-hoa-laws", "master-insurance-ho6", "who-pays-for-damage", "violations-and-fines", "estoppel-and-transfer-fees", "dues-increases", "tax-deductible"].map((s) => [`/hoa/${s}/`, CONDOS])),
  "/hoa/hoa-vs-poa/": NO_HOA,
  "/hoa/benefits/": NO_HOA,
  "/hoa/developer-control-turnover/": NEWER,
  "/sell/": COMPETITION,
  "/sell/home-value/": { ...COMPETITION, low: true },
  "/sell/net-proceeds/": { ...COMPETITION, low: true },
  "/sell/fsbo/": COMPETITION,
  "/sell/out-of-state-buyers/": COMPETITION,
  "/sell/inherited-house/": { ...COMPETITION, q: towns(["Myrtle Beach", "Conway", "Surfside Beach", "North Myrtle Beach"], H({ min: "200000" })), link: "type=house" },
  "/sell/rental-property/": RENTAL,
  "/sell/sell-my-condo/": { ...COMPETITION, q: CONDOS.q, link: "type=condo" },
  "/sell/capital-gains/": COMPETITION,
  "/market-reports/": NEWEST,
  "/market-reports/july-2026/": NEWEST,
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
    if (!keys.length || keys.length > 8 || !keys.every((x) => FEATURE_KEYS.includes(x))) return null;
    p.set(k, keys.join(","));
  }
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
  return listings.filter((l) => {
    if (!l) return false;
    if (l.status && l.status !== "Active") return false;
    if (!l.photo || (num(l.photoCount) && l.photoCount < minPhotos)) return false;
    const condo = isType(l, /condo|apartment/i);
    if (!feed.allowTypes && isType(l, /land|lot|farm|manufactured|mobile/i)) return false;
    const price = num(l.listPrice) ? l.listPrice : null;
    if (price !== null && price < (condo ? QUALITY.minPriceCondo : QUALITY.minPrice)) return false;
    if (num(l.yearBuilt) && l.yearBuilt < yearMin) return false;
    if (post.yearMax !== undefined && num(l.yearBuilt) && l.yearBuilt > post.yearMax) return false;
    if (!condo && num(l.sqft) && l.sqft < minSqft) return false;
    if (price !== null && num(l.sqft) && l.sqft > 0) {
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
