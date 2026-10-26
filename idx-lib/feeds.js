/**
 * A homes feed on every article, filtered to what the article is about, near the top
 * (owner, 2026-10-25 and 2026-10-26: "something enticing for that type of audience so that
 * they click on it ... but legal of course ... as filtered as possible").
 *
 * Each title is a fact about the homes under it, made true by the filter: "DSCR
 * candidates: the lowest price per bedroom" is sorted by price per bedroom. A title never
 * describes people (fair housing), never promises income or a loan, and never states a
 * rate or a payment. Where a title names a number, the number is our own published data.
 *
 * An entry: `head` (the title), `sub` (one line on how the homes were picked), `q` (the
 * searches, contract §5 parameters only, validated by feedParams), `post` (narrowing the
 * answer: built after a year, before a year, at least N beds), `rank` ("ppb": lowest price
 * per bedroom first; "price": lowest price first; none: spread across the price range),
 * `link` (the "See all" search on /homes/), `noHoa` (prints the required source note,
 * CRM ticket 415), `low` (a tool page: the feed goes under the tool, not above it),
 * `fallback` (the wider feed when fewer than 3 homes match).
 *
 * Pages that already carry homes strips (batch 2026-10-b) are left out: edge.js fills
 * their own slots. A page not listed here gets no feed.
 */
import { STATE_PRICES, ZHVI_MONTH } from "./state-prices.js";

const NEWEST = { head: "The newest listings on the Grand Strand", sub: "Just listed on the MLS, across every price range.", q: [{}], link: "" };
const NO_HOA = { head: "Homes with no HOA fee", sub: "No HOA, as listed by the listing agent. Confirm before you buy.", q: [{ hoa: "0" }], link: "hoa=0", noHoa: true, fallback: NEWEST };
const NO_HOA_HOUSES = { head: "Houses with no HOA fee", sub: "No HOA, as listed by the listing agent. Confirm before you buy.", q: [{ type: "house", hoa: "0" }], link: "type=house&hoa=0", noHoa: true, fallback: NEWEST };
const CONDOS = { head: "Condos for sale: ask us for any building's HOA budget", sub: "We pull the budget, the reserve study and the minutes before you offer.", q: [{ type: "condo" }], link: "type=condo" };
const town = (city) => ({ head: `New on the market in ${city}`, sub: `Homes for sale in ${city}, newest first.`, q: [{ city }], link: `city=${encodeURIComponent(city)}`, fallback: NEWEST });
const STARTER = { head: "Starter homes under $300,000", sub: "Houses, townhouses and condos, newest first.", q: [{ type: "house", max: "300000" }, { type: "townhouse", max: "300000" }, { type: "condo", max: "300000" }], link: "max=300000", fallback: NEWEST };
const RENTAL = { head: "Rental candidates: the most bedrooms for the money", sub: "Houses and townhouses with 3 or more bedrooms, lowest price per bedroom first.", q: [{ type: "house", beds: "3", max: "400000" }, { type: "house", beds: "4", max: "400000" }, { type: "townhouse", beds: "3", max: "400000" }], rank: "ppb", link: "beds=3&max=400000" };
const DSCR = { head: "DSCR candidates: the lowest price per bedroom", sub: "Houses and townhouses with 3 or more bedrooms, lowest price per bedroom first. A DSCR loan is sized on the rent.", q: [{ type: "house", beds: "3", max: "450000" }, { type: "house", beds: "4", max: "450000" }, { type: "townhouse", beds: "3", max: "450000" }], rank: "ppb", link: "beds=3&max=450000" };
const VACATION = { head: "Waterfront condos in the vacation-rental towns", sub: "Myrtle Beach and North Myrtle Beach condos the MLS marks as waterfront. Rental rules differ by building: ask us before you buy.", q: [{ type: "condo", city: "Myrtle Beach", waterfront: "1" }, { type: "condo", city: "North Myrtle Beach", waterfront: "1" }], link: "type=condo&waterfront=1", fallback: { head: "Condos in Myrtle Beach and North Myrtle Beach", sub: "Newest first.", q: [{ type: "condo", city: "Myrtle Beach" }, { type: "condo", city: "North Myrtle Beach" }], link: "type=condo" } };
const OCEAN_UNITS = { head: "Waterfront condos under $250,000", sub: "Myrtle Beach and North Myrtle Beach, lowest price first. Whether a lender calls a building warrantable depends on the building: we check it before you offer.", q: [{ type: "condo", city: "Myrtle Beach", waterfront: "1", max: "250000" }, { type: "condo", city: "North Myrtle Beach", waterfront: "1", max: "250000" }], rank: "price", link: "type=condo&waterfront=1&max=250000", fallback: VACATION };
const MULTI = { head: "Duplexes, triplexes and fourplexes for sale", sub: "2 to 4 units on one property.", q: [{ type: "multi" }], link: "type=multi", fallback: RENTAL };
const NEWER = { head: "Brand-new homes, built in the last two years", sub: "Houses the MLS lists with this year's or last year's build date.", q: [{ type: "house" }], post: { builtWithin: 2 }, link: "type=house", fallback: NEWEST };
const SINCE_2010 = { head: "Houses built in 2010 or later", sub: "Built under newer building codes, newest first.", q: [{ type: "house" }], post: { yearMin: 2010 }, link: "type=house", fallback: NEWEST };
const VALUE_ADD = { head: "Value-add candidates: older houses under $300,000", sub: "Built before 1995, lowest price first.", q: [{ type: "house", max: "300000" }], post: { yearMax: 1994 }, rank: "price", link: "type=house&max=300000", fallback: RENTAL };
const FIFTY_FIVE = { head: "Homes for sale in 55+ communities", sub: "Del Webb, Myrtle Trace and Seasons at Prince Creek.", q: [{ subdivision: "Del Webb" }, { subdivision: "Myrtle Trace" }, { subdivision: "Seasons at Prince Creek" }], link: "subdivision=Del%20Webb" };
const GOLF = { head: "Homes for sale in golf communities", sub: "Barefoot, Grande Dunes, Prestwick and Tidewater.", q: [{ subdivision: "Barefoot" }, { subdivision: "Grande Dunes" }, { subdivision: "Prestwick" }, { subdivision: "Tidewater" }], link: "" };
const WATER = { head: "Waterfront homes for sale now", sub: "Ocean, waterway, marsh, lake and river, as the MLS marks them.", q: [{ waterfront: "1" }], link: "waterfront=1" };
const BIG = { head: "Houses with 4 or more bedrooms", sub: "Room for an office, guests or a home gym, newest first.", q: [{ type: "house", beds: "4" }], link: "type=house&beds=4" };
const COMPETITION = { head: "Your competition: homes for sale now", sub: "The newest listings buyers are comparing yours to.", q: [{}], link: "" };
const fromState = (slug) => {
  const s = STATE_PRICES[slug];
  const p = `$${s.zhvi.toLocaleString("en-US")}`;
  return { head: `Homes priced under the typical ${s.name} home`, sub: `The typical ${s.name} home is about ${p} (Zillow, ${new Date(`${ZHVI_MONTH}T12:00:00Z`).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}). These are for sale here for less.`, q: [{ max: String(s.zhvi) }], link: `max=${s.zhvi}`, fallback: NEWEST };
};

export const FEEDS = {
  "/buyers/": NEWEST,
  "/buyers/buying-in-myrtle-beach/": town("Myrtle Beach"),
  "/buyers/common-mistakes/": NEWEST,
  "/buyers/first-time-home-buyer-myrtle-beach/": STARTER,
  "/buyers/programs/": STARTER,
  "/buyers/va-loans/": { head: "Houses with 3 or more bedrooms under $400,000", sub: "Newest first.", q: [{ type: "house", beds: "3", max: "400000" }], link: "type=house&beds=3&max=400000" },
  "/buyers/retirees/": FIFTY_FIVE,
  "/buyers/second-home/": VACATION,
  "/buyers/new-construction/": NEWER,
  "/buyers/cost-to-own/": NO_HOA_HOUSES,
  "/buyers/waterfront-homes/": WATER,
  "/buyers/golf-communities/": GOLF,
  "/buyers/condo-in-litigation/": CONDOS,
  "/buyers/undisclosed-flooding/": SINCE_2010,
  "/buyers/property-taxes/": NO_HOA_HOUSES,
  "/buyers/coastal-insurance/": SINCE_2010,
  "/buyers/closing-costs/": STARTER,
  "/buyers/55-plus-communities/": FIFTY_FIVE,
  "/buyers/55-plus-communities/del-webb-north-myrtle-beach/": { head: "For sale now in Del Webb North Myrtle Beach", sub: "Newest first.", q: [{ subdivision: "Del Webb", city: "North Myrtle Beach" }], link: "subdivision=Del%20Webb", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/del-webb-grande-dunes/": { head: "For sale now in Del Webb at Grande Dunes", sub: "Newest first.", q: [{ subdivision: "Del Webb", city: "Myrtle Beach" }], link: "subdivision=Del%20Webb", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/myrtle-trace/": { head: "For sale now in Myrtle Trace", sub: "Newest first.", q: [{ subdivision: "Myrtle Trace" }], link: "subdivision=Myrtle%20Trace", fallback: FIFTY_FIVE },
  "/buyers/55-plus-communities/seasons-at-prince-creek-west/": { head: "For sale now in Seasons at Prince Creek", sub: "Newest first.", q: [{ subdivision: "Seasons at Prince Creek" }], link: "subdivision=Seasons%20at%20Prince%20Creek", fallback: FIFTY_FIVE },
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
  ...Object.fromEntries(Object.keys(STATE_PRICES).map((s) => [`/buyers/relocating/from-${s}/`, fromState(s)])),
  "/submarkets/": NEWEST,
  "/submarkets/conway/": town("Conway"),
  "/submarkets/garden-city/": town("Garden City"),
  "/submarkets/little-river/": town("Little River"),
  "/submarkets/murrells-inlet/": town("Murrells Inlet"),
  "/submarkets/myrtle-beach/": town("Myrtle Beach"),
  "/submarkets/north-myrtle-beach/": town("North Myrtle Beach"),
  "/submarkets/pawleys-island/": town("Pawleys Island"),
  "/submarkets/surfside-beach/": town("Surfside Beach"),
  "/submarkets/carolina-forest/": { head: "New on the market in Carolina Forest", sub: "Homes for sale in Carolina Forest, newest first.", q: [{ subdivision: "Carolina Forest" }], link: "subdivision=Carolina%20Forest", fallback: town("Myrtle Beach") },
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
  "/invest/j1-rentals/": { head: "Condos within 2 miles of the Myrtle Beach boardwalk", sub: "Closest first.", q: [{ type: "condo", near: "33.6915,-78.8820", miles: "2" }], link: "type=condo&near=33.6915%2C-78.8820&miles=2", fallback: VACATION },
  "/invest/canadian-buyers/": { head: "Waterfront condos in North Myrtle Beach", sub: "Condos the MLS marks as waterfront, newest first.", q: [{ type: "condo", city: "North Myrtle Beach", waterfront: "1" }], link: "type=condo&city=North%20Myrtle%20Beach&waterfront=1", fallback: VACATION },
  "/invest/cost-segregation/": VACATION,
  "/invest/rental-depreciation/": RENTAL,
  "/invest/run-the-numbers/": { ...RENTAL, low: true },
  "/invest/out-of-state/": RENTAL,
  "/invest/property-management/": RENTAL,
  "/invest/cash-to-close/": RENTAL,
  "/invest/where-to-buy/": RENTAL,
  "/invest/mid-term-rentals/": { head: "2 and 3 bedroom condos and townhouses", sub: "Lowest price per bedroom first.", q: [{ type: "condo", beds: "2", max: "400000" }, { type: "townhouse", beds: "2", max: "400000" }], post: { bedsMax: 3 }, rank: "ppb", link: "beds=2&max=400000" },
  "/invest/student-rentals/": { head: "Houses within 3 miles of Coastal Carolina University", sub: "Closest first.", q: [{ type: "house", near: "33.7951,-79.0112", miles: "3" }], link: "type=house&near=33.7951%2C-79.0112&miles=3", fallback: RENTAL },
  "/invest/landlord-rules/": RENTAL,
  "/invest/llc/": RENTAL,
  "/invest/foreclosures/": VALUE_ADD,
  "/invest/section-8-rentals/": { head: "Houses with 3 or more bedrooms under $250,000", sub: "Lowest price per bedroom first.", q: [{ type: "house", beds: "3", max: "250000" }], rank: "ppb", link: "type=house&beds=3&max=250000", fallback: RENTAL },
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
  "/hoa/hoa-vs-poa/": NO_HOA_HOUSES,
  "/hoa/benefits/": NO_HOA_HOUSES,
  "/hoa/developer-control-turnover/": NEWER,
  "/sell/": COMPETITION,
  "/sell/home-value/": { ...COMPETITION, low: true },
  "/sell/net-proceeds/": { ...COMPETITION, low: true },
  "/sell/fsbo/": COMPETITION,
  "/sell/out-of-state-buyers/": COMPETITION,
  "/sell/inherited-house/": { ...COMPETITION, q: [{ type: "house" }], link: "type=house" },
  "/sell/rental-property/": RENTAL,
  "/sell/sell-my-condo/": { ...COMPETITION, q: [{ type: "condo" }], link: "type=condo" },
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
  for (const k of ["max", "min", "beds"]) if (q[k] !== undefined) { if (!/^\d{1,9}$/.test(q[k])) return null; p.set(k, q[k]); }
  if (q.waterfront !== undefined) { if (q.waterfront !== "1") return null; p.set("waterfront", "1"); }
  if (q.hoa !== undefined) { if (q.hoa !== "0") return null; p.set("hoa", "0"); }
  if (q.near !== undefined) {
    const m = /^(-?\d{1,2}\.\d{1,6}),(-?\d{1,3}\.\d{1,6})$/.exec(q.near);
    if (!m || +m[1] < 31 || +m[1] > 37 || +m[2] < -82 || +m[2] > -75 || !/^\d{1,2}(\.\d)?$/.test(q.miles || "")) return null;
    p.set("near", q.near); p.set("miles", q.miles);
  }
  return p;
}

/** The answer narrowed by `post`. */
export function postFilter(listings, post) {
  if (!post) return listings;
  // The year is read here, per request: at module scope a Worker's clock reads 1970.
  const yearMin = post.builtWithin ? new Date().getUTCFullYear() - post.builtWithin + 1 : post.yearMin;
  const num = (v) => typeof v === "number" && isFinite(v);
  return listings.filter((l) => (yearMin === undefined || (num(l.yearBuilt) && l.yearBuilt >= yearMin))
    && (post.yearMax === undefined || (num(l.yearBuilt) && l.yearBuilt <= post.yearMax))
    && (post.bedsMax === undefined || (num(l.beds) && l.beds <= post.bedsMax)));
}

/** The homes in the order the title promises: lowest price per bedroom, or lowest price. */
export function rankHomes(listings, rank) {
  const price = (l) => (typeof l.listPrice === "number" && l.listPrice > 0 ? l.listPrice : Infinity);
  if (rank === "ppb") return listings.filter((l) => typeof l.beds === "number" && l.beds > 0 && price(l) < Infinity).sort((a, b) => price(a) / a.beds - price(b) / b.beds);
  if (rank === "price") return listings.filter((l) => price(l) < Infinity).sort((a, b) => price(a) - price(b));
  return listings;
}
