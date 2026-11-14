# Data for /invest/condo-buildings/palace-resort/ (batch 2026-11-d)

Read 2026-11-13. Every number the page prints comes from these files. Ledger: Blog-Brain `batches/2026-11-d/palace-resort/facts.md`.

| File | What | Made by |
|---|---|---|
| listings.json | Condos for sale at 1605 S Ocean Blvd (however a listing spells it): count by bedrooms, asking middle and range by bedrooms, size range by bedrooms, the monthly HOA fee in $25 brackets and to the dollar by bedrooms (`fee_exact`), feature flags, year built and subdivision fields (counts). Every map URL called; listing-card calls kept without their MLS number. | `pull_listings.py`, then `pull_fee_exact.py` (the site's public map API and listing card) |
| county.json | Units, floors and units per floor, county value groups (counts), last-deed year (counts), owner mailing state (counts), units taxed as a home; deed sales in the directory's window (2025-10-01 to 2026-09-30) and the later window, by floor band | `pull_county.py <this dir> <website root>` (Horry County GIS layer 24; deeds from data/2026-10-d/sell-out-of-state-buyers and data/2026-11-n/buyers-builders/raw) |
| flood.json | FEMA flood zones under the Palace's parcel footprint, share of area each | `pull_flood.py` (Horry County GIS layers 24 and 19) |
| tax.json | Current county assessments for the units taxed at 6 percent, in aggregate, and the tax they imply at the 2026 city millage | `pull_tax.py` |
| raw/city-zoning-point.json | City of Myrtle Beach zoning district at the footprint's center | curl, ZONING_DISTRICTS_MB FeatureServer 0 |
| raw/pages/ | The resort's own pages, the CVU record, and a text note on the competitor page (its listings are not saved) | curl |
| raw/google-suggestions-2026-11-13.txt | Demand only | curl, suggestqueries.google.com |

Rerun in order: `python3 -I pull_listings.py .`, `python3 -I pull_fee_exact.py .`, `python3 -I pull_county.py . <website root>`, `python3 -I pull_flood.py .`, `python3 -I pull_tax.py .`. Listings change daily; rebuild the page from the files, never edit numbers by hand.

Never in these files: an MLS number, a unit number with a price, a single listing's price or fee, a firm, a photo, a PIN, an owner name or a single unit's county record.
