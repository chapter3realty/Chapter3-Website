# Data for /invest/condo-buildings/ocean-forest-villas/ (batch 2026-11-e)

Read 2026-11-14. Every number the page prints comes from these files. Ledger: Blog-Brain `batches/2026-11-e/ocean-forest-villas/facts.md`. Method copied from the Palace Resort pilot and the Grande Shores scripts.

| File | What | Made by |
|---|---|---|
| listings.json | Condos for sale at 5601 N Ocean Blvd (MLS subdivision "Ocean Forest Villas"): count by bedrooms, asking middle and range, size, flags, year built; `fee_exact` the monthly fee range to the dollar | `pull_listings.py`, `pull_fee_exact.py` (site map API and listing card) |
| by_building.json | Listings by nearest building and fee brackets (pin positions are rough: not for the page; used only to see the two fee groups) | `pull_by_building.py` |
| county.json | 241 units in buildings A to E (county legal names "A PLACE AT THE BEACH" and "OCEAN FOREST"), value groups, last-deed year, owner states, 4 percent homes; 2025-11-01 to 2026-10-31 deed sales in aggregate | `pull_county.py <this dir> <website root>` |
| flood.json | County flood layer 19: no zone returned | `pull_flood.py` |
| fema.json, raw/fema-nfhl-point.json | FEMA NFHL layer 28 shares under the footprint and at the center | `pull_fema.py` |
| zoning.json, raw/city-zoning-point.json | City zoning and shaded nightly-rental area at each building's center | `pull_zoning.py <this dir> <website root>` |
| tax.json | Current county assessments of units taxed at 6 percent, in aggregate, and implied city tax | `pull_tax.py` |
| nearby.json | Straight-line miles from the footprint center (Nominatim) | `pull_nearby.py` (needs flood.json) |
| beach.json | Rough distance to the VE zone: DO NOT PRINT (flat-earth, unverified) | `pull_beach.py` |
| strips.json | Each strip search and its count on /homes/api/strip | curl |
| raw/google-suggestions-2026-11-14.txt | Demand only | curl |

Rerun in order: pull_listings, pull_fee_exact, pull_county, pull_flood, pull_zoning, pull_by_building, pull_fema, pull_tax, pull_nearby (`python3 -I <script> . [../../..]`). Never in these files: an MLS number, a unit number with a price, a PIN, an owner name or a single unit's record.

Note: `at_1605` in listings.json is the count of listings at 5601 N Ocean Blvd (name left over from the Palace script). `raw/bbox-parcels-scratch.json` holds parcel legal names and centers only (no owners); delete before publishing the folder.
