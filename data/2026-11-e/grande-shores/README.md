# Data for /invest/condo-buildings/grande-shores/ (batch 2026-11-e)

Read 2026-11-14. Every number the page prints comes from these files. Ledger: Blog-Brain `batches/2026-11-e/grande-shores/facts.md`. Method copied from the Palace Resort pilot (`data/2026-11-d/palace-resort/`).

| File | What | Made by |
|---|---|---|
| listings.json | Condos for sale at 201 77th Ave N (MLS subdivision "Grande Shores"): count by bedrooms, asking middle and range, size, feature flags, year built; `fee_exact` is the monthly HOA fee by bedrooms to the dollar. Every map URL called. | `pull_listings.py`, then `pull_fee_exact.py` (the site's public map API and listing card). The $25-bracket fee pass of pull_listings.py stops at $1,500 and misses the larger units; pull_fee_exact.py here bisects to $6,000. |
| county.json | Condo units (136), floors and units per floor, county value groups, last-deed year, owner mailing state (counts), taxed-as-home count, the commercial parcels; deed sales in two windows, in aggregate | `pull_county.py <this dir> <website root>` (Horry County GIS layer 24; deeds from data/2026-10-d/sell-out-of-state-buyers and data/2026-11-n/buyers-builders/raw) |
| flood.json | County flood-zone layer under the footprint; raw/fema-nfhl-point.json is FEMA's own layer at the center point | `pull_flood.py` (Horry County GIS layers 24 and 19); curl of FEMA NFHL layer 28 |
| tax.json | Current county assessments for units taxed at 6 percent, in aggregate, the tax they imply at the 2026 city millage, and by county value group (5 or more units) | `pull_tax.py` |
| nearby.json | Straight-line miles from the footprint center to the Boardwalk, Broadway at the Beach, the State Park, the airport | `pull_nearby.py` (OpenStreetMap Nominatim) |
| strips.json | Each live strip's search and its count on /homes/api/strip | curl |
| raw/city-zoning-point.json | City of Myrtle Beach zoning district at the footprint's center (MUH) | curl, ZONING_DISTRICTS_MB FeatureServer 0 |
| raw/pages/ | The resort's own pages (grandeshores.com): home, accommodations, amenities, faq, about, owner-services, things-to-do, reviews | curl |
| raw/google-suggestions-2026-11-14.txt | Demand only | curl |

Rerun in order: `python3 -I pull_listings.py .`, `python3 -I pull_fee_exact.py .`, `python3 -I pull_county.py . <website root>`, `python3 -I pull_flood.py .`, `python3 -I pull_tax.py .`, `python3 -I pull_nearby.py .`. Listings change daily; rebuild the page from the files, never edit numbers by hand.

Never in these files: an MLS number, a unit number with a price, a single listing's price or fee, a firm, a photo, a PIN, an owner name or a single unit's county record.

Note: the key "at_1605" in listings.json is the count of listings at 201 77th Ave N; the name is left over from the Palace script (1605 S Ocean Blvd).
