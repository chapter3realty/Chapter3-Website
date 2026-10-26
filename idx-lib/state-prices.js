/**
 * Each home state's typical home value, for the "moving from" pages' homes feed: Zillow's
 * statewide ZHVI as the pages print it (rounded to the thousand). Copied from
 * data/relocating/col-places.json, Zillow Research, ZHVI (all homes, smoothed, seasonally adjusted) and ZORI, metro level, month 2026-07-31.
 * tools/idx-test.mjs fails when this drifts from that file: after 'node build.js coldata',
 * copy the new figures here.
 */
export const ZHVI_MONTH = "2026-07-31";
export const STATE_PRICES = {
  "new-york": { name: "New York", zhvi: 527000 },
  "north-carolina": { name: "North Carolina", zhvi: 338000 },
  "ohio": { name: "Ohio", zhvi: 250000 },
  "maryland": { name: "Maryland", zhvi: 433000 },
  "virginia": { name: "Virginia", zhvi: 418000 },
  "connecticut": { name: "Connecticut", zhvi: 453000 },
  "massachusetts": { name: "Massachusetts", zhvi: 669000 },
  "new-jersey": { name: "New Jersey", zhvi: 584000 },
  "pennsylvania": { name: "Pennsylvania", zhvi: 291000 },
  "florida": { name: "Florida", zhvi: 378000 },
};
