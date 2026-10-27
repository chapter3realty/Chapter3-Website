/**
 * The MLS features a search may ask for (has / not), as the CRM names them: the
 * home-search vocabulary's consumer-safe yes-or-no filters (CRM
 * src/lib/home-search/mls-filters.ts, IDX_FEATURE_KEYS), with their labels, in
 * the groups the filter panel shows. The CRM reads them once branch
 * website/idx-filters is merged; until then it answers without `applied` and
 * the site does not offer them (FEATURES_LIVE in the answer).
 */
export const FEATURE_GROUPS = [
 {
  "name": "Water",
  "keys": [
   [
    "waterfront",
    "Waterfront"
   ],
   [
    "water_ocean",
    "Oceanfront"
   ],
   [
    "ocean_view",
    "Ocean view"
   ],
   [
    "water_icw",
    "Intracoastal (ICW)"
   ],
   [
    "water_marsh",
    "On the marsh"
   ],
   [
    "water_view",
    "Water view"
   ],
   [
    "marsh_view",
    "Marsh view"
   ],
   [
    "water_lake",
    "Lake"
   ],
   [
    "water_pond",
    "Pond"
   ],
   [
    "water_river",
    "River"
   ],
   [
    "water_canal",
    "Canal or channel"
   ],
   [
    "water_creek",
    "Creek"
   ],
   [
    "deep_water",
    "Deep water access"
   ],
   [
    "private_dock",
    "Dock"
   ],
   [
    "boat_slip",
    "Boat slip"
   ],
   [
    "boat_ramp",
    "Boat ramp"
   ],
   [
    "beach_access",
    "Beach access"
   ],
   [
    "east_of_17",
    "East of 17"
   ],
   [
    "second_row",
    "Second row"
   ],
   [
    "oceanfront_building",
    "Oceanfront building"
   ],
   [
    "oceanfront_unit",
    "Oceanfront unit"
   ]
  ]
 },
 {
  "name": "Outside",
  "keys": [
   [
    "pool",
    "Private pool"
   ],
   [
    "community_pool",
    "Community pool"
   ],
   [
    "garage",
    "Garage"
   ],
   [
    "rv_boat_parking",
    "RV or boat parking"
   ],
   [
    "fenced_yard",
    "Fenced yard"
   ],
   [
    "screened_porch",
    "Screened porch"
   ],
   [
    "hot_tub",
    "Hot tub"
   ],
   [
    "outdoor_kitchen",
    "Outdoor kitchen"
   ],
   [
    "balcony",
    "Balcony"
   ],
   [
    "corner_lot",
    "Corner lot"
   ],
   [
    "cul_de_sac",
    "Cul-de-sac"
   ],
   [
    "wooded_lot",
    "Wooded lot"
   ]
  ]
 },
 {
  "name": "Inside",
  "keys": [
   [
    "one_level",
    "One level"
   ],
   [
    "two_story",
    "Two stories or more"
   ],
   [
    "main_level_bedroom",
    "Bedroom on the main floor"
   ],
   [
    "main_level_primary",
    "Primary bedroom on the main floor"
   ],
   [
    "home_office",
    "Office or study"
   ],
   [
    "bonus_room",
    "Bonus room"
   ],
   [
    "fireplace",
    "Fireplace"
   ],
   [
    "elevator",
    "Elevator"
   ],
   [
    "wheelchair_accessible",
    "Wheelchair accessible"
   ],
   [
    "furnished",
    "Furnished"
   ],
   [
    "dual_primary",
    "Two primary suites"
   ],
   [
    "in_law_suite",
    "In-law suite"
   ],
   [
    "loft",
    "Loft"
   ],
   [
    "workshop",
    "Workshop"
   ],
   [
    "hardwood_floors",
    "Hardwood floors"
   ],
   [
    "lvp_floors",
    "Luxury vinyl floors"
   ],
   [
    "top_floor",
    "Top floor"
   ],
   [
    "end_unit",
    "End unit"
   ]
  ]
 },
 {
  "name": "Community",
  "keys": [
   [
    "golf_community",
    "Golf community"
   ],
   [
    "on_golf_course",
    "On the golf course"
   ],
   [
    "golf_view",
    "Golf course view"
   ],
   [
    "golf_cart_ok",
    "Golf carts allowed"
   ],
   [
    "gated",
    "Gated community"
   ],
   [
    "clubhouse",
    "Clubhouse"
   ],
   [
    "tennis",
    "Tennis courts"
   ],
   [
    "pets_allowed",
    "Pets allowed"
   ],
   [
    "str_allowed",
    "Short-term rentals allowed"
   ],
   [
    "long_term_rental_allowed",
    "Long-term rentals allowed"
   ],
   [
    "inside_city_limits",
    "Inside city limits"
   ],
   [
    "outside_city_limits",
    "Outside city limits"
   ]
  ]
 },
 {
  "name": "Listing",
  "keys": [
   [
    "new_construction",
    "New construction"
   ],
   [
    "price_reduced",
    "Price reduced"
   ],
   [
    "open_house",
    "Open house coming up"
   ]
  ]
 },
 {
  "name": "Utilities",
  "keys": [
   [
    "public_sewer",
    "Public sewer"
   ],
   [
    "public_water",
    "Public water"
   ],
   [
    "septic",
    "Septic"
   ],
   [
    "well_water",
    "Well water"
   ],
   [
    "flood_zone",
    "Flood zone"
   ]
  ]
 }
];
export const FEATURE_KEYS = FEATURE_GROUPS.flatMap((g) => g.keys.map(([k]) => k));
export const FEATURE_LABEL = Object.fromEntries(FEATURE_GROUPS.flatMap((g) => g.keys));

/*
 * The live list (CRM Ticket 471, contract §5 GET /api/idx/filters): about 490 features, Katie's and the
 * distances included, each with how many homes for sale match it. idx-lib/catalog.js loads it (cached an
 * hour) and hands it here. While it is not loaded, the keys above and the ones the feeds use are trusted.
 */
let LIVE = null;
/** Keys the article feeds ask for (idx-lib/feeds.js), all in the CRM's vocabulary on 27 Oct 2026. */
const FEED_KEYS = ["walk_to_beach", "beach_1mi", "near_beach", "east_of_17", "second_row", "oceanfront_building", "oceanfront_unit",
  "oceanview_unit", "ocean_or_ocean_view", "str_allowed", "long_term_rental_allowed", "rentals_allowed", "vacation_rental_program",
  "golf_cart_ok", "golf_community", "on_golf_course", "golf_view", "private_dock", "boat_slip", "boat_access", "deep_water", "water_icw",
  "marsh_view", "pool", "rv_boat_parking", "fenced_yard", "one_level", "main_level_primary", "new_construction", "quick_move_in",
  "still_being_built", "price_reduced", "open_house", "foreclosure", "short_sale", "distressed_sale", "assumable_loan", "va_accepted",
  "fha_accepted", "cash_only_listing", "furnished", "elevator", "elevator_building", "first_floor_unit", "high_floor_unit", "top_floor",
  "gated", "community_pool", "clubhouse", "pets_allowed", "garage", "acreage_lot", "workshop", "in_law_suite", "detached_guest_house",
  "home_office", "screened_porch", "hot_tub", "outdoor_kitchen", "flood_zone", "inside_city_limits", "outside_city_limits",
  "hoa_includes_internet", "hoa_includes_insurance", "lawn_care_included", "has_rental_income", "multi_family", "icw_1mi", "near_icw",
  "marshwalk_1mi", "barefoot_landing_2mi", "market_common_2mi", "nmb_main_street_1mi", "downtown_conway_2mi", "myrtle_beach_boardwalk_1mi",
  "grand_strand_medical_center_5mi", "mcleod_carolina_forest_5mi", "myrtle_beach_airport_5mi", "huntington_beach_state_park_5mi"];
const STATIC = new Set([...FEATURE_KEYS, ...FEED_KEYS]);
/** A feature that is a distance from a place: the CRM takes at most 2 in one search (has and not together). */
export const isDistance = (k) => /^(walk_to_beach|near_beach|beach_\d+mi|near_icw|icw_\d+mi)$|_\d+mi$/.test(k);
export const DISTANCE_MAX = 2;

/** The live list, or null to go back to the built-in keys. Features no home for sale has are left out. */
export function useCatalog(features) {
  LIVE = Array.isArray(features) && features.length ? new Map(features.filter((f) => f && f.forSale > 0).map((f) => [f.key, f])) : null;
}
export const catalogLoaded = () => !!LIVE;
export const isFeature = (k) => (LIVE ? LIVE.has(k) : STATIC.has(k));
/** The words for a key: ours, else the CRM's, else the key spelled out. */
export const featureLabel = (k) => FEATURE_LABEL[k] || (LIVE && LIVE.get(k) && LIVE.get(k).label) || String(k).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/** Up to 8 known keys from "a,b" or several values; an unknown key is dropped on its own, and past 2 distances the rest. */
export function featureList(values, distancesUsed = 0) {
  const keys = [...new Set(values.flatMap((v) => String(v || "").split(",")).map((k) => k.trim()).filter(Boolean))];
  let d = distancesUsed;
  return keys.filter((k) => isFeature(k)).filter((k) => !isDistance(k) || ++d <= DISTANCE_MAX).slice(0, 8);
}
