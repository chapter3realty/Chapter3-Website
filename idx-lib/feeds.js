/**
 * A homes feed on every article (owner, 2026-10-25: "every blog needs an IDX feed on it
 * that is pre filtered to what that blog is about"). One entry per page: the title over
 * the strip, and the searches that fill it (contract §5 parameters only, validated by
 * placeParams/feedParams before they reach the CRM). Several searches are merged, so a
 * page about three communities shows homes in all three. `post` narrows the answer
 * after it comes back (built after a year; built before a year), for topics the
 * search has no filter for. `link` is the "See all" search on /homes/.
 *
 * A feed that finds fewer than 3 homes shows its `fallback` (or the Grand Strand's newest
 * homes), so no article is left with an empty strip.
 *
 * Pages that already carry homes strips (batch 2026-10-b) are left out: edge.js fills
 * their own slots. A page not listed here gets no feed.
 */

const ANY = { head: "Homes for sale on the Grand Strand now", q: [{}], link: "" };
const HOUSES = { head: "Houses for sale on the Grand Strand now", q: [{ type: "house" }], link: "type=house" };
const CONDOS = { head: "Condos for sale on the Grand Strand now", q: [{ type: "condo" }], link: "type=condo" };
const town = (city) => ({ head: `Homes for sale in ${city} now`, q: [{ city }], link: `city=${encodeURIComponent(city)}` });
const STARTER = { head: "Homes for sale under $300,000", q: [{ type: "house", max: "300000" }, { type: "condo", max: "300000" }], link: "max=300000" };
const RENTAL_HOUSES = { head: "Houses for sale under $350,000", q: [{ type: "house", max: "350000" }], link: "type=house&max=350000" };
const STR_CONDOS = { head: "Condos for sale in Myrtle Beach and North Myrtle Beach", q: [{ type: "condo", city: "Myrtle Beach" }, { type: "condo", city: "North Myrtle Beach" }], link: "type=condo" };
const MULTI = { head: "2 to 4 unit properties for sale", q: [{ type: "multi" }], link: "type=multi" };
const NEWER = { head: "Homes built in the last two years", q: [{ type: "house" }], post: { builtWithin: 2 }, link: "type=house" };
const OLDER = { head: "Older houses under $300,000", q: [{ type: "house", max: "300000" }], post: { yearMax: 1995 }, link: "type=house&max=300000" };
const FIFTY_FIVE = { head: "Homes for sale in 55+ communities", q: [{ subdivision: "Del Webb" }, { subdivision: "Myrtle Trace" }, { subdivision: "Seasons at Prince Creek" }], link: "subdivision=Del%20Webb" };
const GOLF = { head: "Homes for sale in golf communities", q: [{ subdivision: "Barefoot" }, { subdivision: "Grande Dunes" }, { subdivision: "Prestwick" }, { subdivision: "Tidewater" }], link: "" };
const WATER = { head: "Waterfront homes for sale now", q: [{ waterfront: "1" }], link: "waterfront=1" };

export const FEEDS = {
  "/buyers/": ANY,
  "/buyers/buying-in-myrtle-beach/": town("Myrtle Beach"),
  "/buyers/common-mistakes/": ANY,
  "/buyers/first-time-home-buyer-myrtle-beach/": STARTER,
  "/buyers/programs/": STARTER,
  "/buyers/va-loans/": { head: "Houses for sale under $400,000", q: [{ type: "house", max: "400000" }], link: "type=house&max=400000" },
  "/buyers/retirees/": FIFTY_FIVE,
  "/buyers/second-home/": STR_CONDOS,
  "/buyers/new-construction/": NEWER,
  "/buyers/cost-to-own/": HOUSES,
  "/buyers/waterfront-homes/": WATER,
  "/buyers/golf-communities/": GOLF,
  "/buyers/condo-in-litigation/": CONDOS,
  "/buyers/undisclosed-flooding/": HOUSES,
  "/buyers/property-taxes/": HOUSES,
  "/buyers/coastal-insurance/": WATER,
  "/buyers/closing-costs/": ANY,
  "/buyers/55-plus-communities/": FIFTY_FIVE,
  "/buyers/55-plus-communities/del-webb-north-myrtle-beach/": { head: "Homes for sale in Del Webb North Myrtle Beach", q: [{ subdivision: "Del Webb", city: "North Myrtle Beach" }], link: "subdivision=Del%20Webb" },
  "/buyers/55-plus-communities/del-webb-grande-dunes/": { head: "Homes for sale in Del Webb at Grande Dunes", q: [{ subdivision: "Del Webb", city: "Myrtle Beach" }], link: "subdivision=Del%20Webb" },
  "/buyers/55-plus-communities/myrtle-trace/": { head: "Homes for sale in Myrtle Trace", q: [{ subdivision: "Myrtle Trace" }], link: "subdivision=Myrtle%20Trace" },
  "/buyers/55-plus-communities/seasons-at-prince-creek-west/": { head: "Homes for sale in Seasons at Prince Creek", q: [{ subdivision: "Seasons at Prince Creek" }], link: "subdivision=Seasons%20at%20Prince%20Creek" },
  "/buyers/relocating/": ANY,
  "/buyers/relocating/cost-of-living/": STARTER,
  "/buyers/relocating/pros-and-cons/": ANY,
  "/buyers/relocating/moving-checklist/": ANY,
  "/buyers/relocating/schools/": { head: "Houses with 3 or more bedrooms for sale", q: [{ type: "house", beds: "3" }], link: "type=house&beds=3" },
  "/buyers/relocating/which-town/": ANY,
  "/buyers/relocating/jobs/": HOUSES,
  "/buyers/relocating/healthcare/": HOUSES,
  "/buyers/relocating/hurricanes/": HOUSES,
  "/buyers/relocating/weather/": ANY,
  "/buyers/relocating/getting-around/": ANY,
  "/buyers/relocating/why-myrtle-beach/": town("Myrtle Beach"),
  "/buyers/relocating/beaches/": STR_CONDOS,
  ...Object.fromEntries(["new-york", "north-carolina", "ohio", "maryland", "virginia", "connecticut", "massachusetts", "new-jersey", "pennsylvania", "florida"].map((s) => [`/buyers/relocating/from-${s}/`, ANY])),
  "/submarkets/": ANY,
  "/submarkets/conway/": town("Conway"),
  "/submarkets/garden-city/": town("Garden City"),
  "/submarkets/little-river/": town("Little River"),
  "/submarkets/murrells-inlet/": town("Murrells Inlet"),
  "/submarkets/myrtle-beach/": town("Myrtle Beach"),
  "/submarkets/north-myrtle-beach/": town("North Myrtle Beach"),
  "/submarkets/pawleys-island/": town("Pawleys Island"),
  "/submarkets/surfside-beach/": town("Surfside Beach"),
  "/submarkets/carolina-forest/": { head: "Homes for sale in Carolina Forest now", q: [{ subdivision: "Carolina Forest" }], link: "subdivision=Carolina%20Forest", fallback: town("Myrtle Beach") },
  "/invest/": STR_CONDOS,
  "/invest/str-vs-ltr/": STR_CONDOS,
  "/invest/condos/": CONDOS,
  "/invest/condotel-financing/": STR_CONDOS,
  "/invest/non-warrantable-condos/": CONDOS,
  "/invest/condo-buildings/": STR_CONDOS,
  "/invest/airbnb-income/": STR_CONDOS,
  "/invest/str-rules/": STR_CONDOS,
  "/invest/str-setup/": STR_CONDOS,
  "/invest/str-tax-treatment/": STR_CONDOS,
  "/invest/accommodations-tax/": STR_CONDOS,
  "/invest/14-day-rule/": STR_CONDOS,
  "/invest/rental-program-vs-airbnb/": STR_CONDOS,
  "/invest/j1-rentals/": { head: "Condos for sale in Myrtle Beach", q: [{ type: "condo", city: "Myrtle Beach" }], link: "type=condo&city=Myrtle%20Beach" },
  "/invest/canadian-buyers/": { head: "Condos for sale in North Myrtle Beach", q: [{ type: "condo", city: "North Myrtle Beach" }], link: "type=condo&city=North%20Myrtle%20Beach" },
  "/invest/cost-segregation/": STR_CONDOS,
  "/invest/rental-depreciation/": RENTAL_HOUSES,
  "/invest/run-the-numbers/": RENTAL_HOUSES,
  "/invest/out-of-state/": RENTAL_HOUSES,
  "/invest/property-management/": RENTAL_HOUSES,
  "/invest/cash-to-close/": RENTAL_HOUSES,
  "/invest/where-to-buy/": RENTAL_HOUSES,
  "/invest/mid-term-rentals/": RENTAL_HOUSES,
  "/invest/student-rentals/": { head: "Houses for sale in Conway", q: [{ type: "house", city: "Conway" }], link: "type=house&city=Conway" },
  "/invest/landlord-rules/": RENTAL_HOUSES,
  "/invest/llc/": RENTAL_HOUSES,
  "/invest/foreclosures/": OLDER,
  "/invest/section-8-rentals/": { head: "Houses under $250,000", q: [{ type: "house", max: "250000" }], link: "type=house&max=250000" },
  "/invest/new-construction-rentals/": NEWER,
  "/invest/financing-multiple-rentals/": RENTAL_HOUSES,
  "/invest/landlord-insurance/": RENTAL_HOUSES,
  "/invest/rent-prices/": RENTAL_HOUSES,
  "/invest/rental-returns/": RENTAL_HOUSES,
  "/invest/how-long-to-hold/": RENTAL_HOUSES,
  "/invest/what-is-being-built/": NEWER,
  "/invest/strategies/": RENTAL_HOUSES,
  "/invest/strategies/dscr-loans/": RENTAL_HOUSES,
  "/invest/strategies/brrrr/": OLDER,
  "/invest/strategies/fix-and-flip/": OLDER,
  "/invest/strategies/1031-exchange/": MULTI,
  "/invest/strategies/dst/": MULTI,
  "/invest/strategies/small-multifamily/": MULTI,
  "/hoa/": CONDOS,
  ...Object.fromEntries(["special-assessments", "reserves", "documents", "rental-restrictions", "liens-and-foreclosure", "south-carolina-hoa-laws", "master-insurance-ho6", "who-pays-for-damage", "violations-and-fines", "estoppel-and-transfer-fees", "dues-increases", "tax-deductible"].map((s) => [`/hoa/${s}/`, CONDOS])),
  "/hoa/hoa-vs-poa/": HOUSES,
  "/hoa/benefits/": HOUSES,
  "/hoa/developer-control-turnover/": NEWER,
  "/sell/": ANY,
  "/sell/home-value/": ANY,
  "/sell/net-proceeds/": ANY,
  "/sell/fsbo/": ANY,
  "/sell/out-of-state-buyers/": ANY,
  "/sell/inherited-house/": HOUSES,
  "/sell/rental-property/": RENTAL_HOUSES,
  "/sell/sell-my-condo/": CONDOS,
  "/sell/capital-gains/": ANY,
  "/market-reports/": ANY,
  "/market-reports/july-2026/": ANY,
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
  return p;
}

/** The answer narrowed by `post`. */
export function postFilter(listings, post) {
  if (!post) return listings;
  // The year is read here, per request: at module scope a Worker's clock reads 1970.
  const yearMin = post.builtWithin ? new Date().getUTCFullYear() - post.builtWithin + 1 : post.yearMin;
  return listings.filter((l) => (yearMin === undefined || (typeof l.yearBuilt === "number" && l.yearBuilt >= yearMin))
    && (post.yearMax === undefined || (typeof l.yearBuilt === "number" && l.yearBuilt <= post.yearMax)));
}
