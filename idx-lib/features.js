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
/** Up to 8 known keys from "a,b" or several values, or [] when any is unknown. */
export function featureList(values) {
  const keys = [...new Set(values.flatMap((v) => String(v || "").split(",")).map((k) => k.trim()).filter(Boolean))];
  // An unknown key is dropped on its own; the first 8 known keys stay.
  return keys.filter((k) => FEATURE_KEYS.includes(k)).slice(0, 8);
}
