# Data for /invest/condo-buildings/bay-view-resort/ (batch 2026-11-e)

Read 2026-11-14. Every number the page prints comes from these files. Ledger: Blog-Brain `batches/2026-11-e/bay-view-resort/facts.md`. Method copied from the Palace Resort pilot (`data/2026-11-d/palace-resort/`).

| File | What | Made by |
|---|---|---|
| listings.json | Condos for sale at 504 N Ocean Blvd (MLS subdivision "Bay View Resort"): count by bedrooms, asking middle and range, size range, HOA fee in $25 brackets and to the dollar (`fee_exact`, `fee_by_size`), feature flags, year built. Every map URL called. | `pull_listings.py`, `pull_fee_exact.py` (groups 1 and 2 only), `pull_fee_by_size.py` (site map API and listing card) |
| county.json | Units, floors, units per floor, county value groups, last-deed year, owner mailing state (counts), units taxed as a home; deed sales in two windows; `sales_by_value` splits the sales by the county's value for the unit | `pull_county.py <dir> <website root>`, then `pull_sales_by_value.py` (Horry County GIS layer 24, `LegalDescr LIKE 'BAYVIEW HPR PH I;%'`; deed files of batches 2026-10-d and 2026-11-n) |
| flood.json | FEMA zones under the parcel footprint | `pull_flood.py` (county layers 24 and 19) |
| tax.json | Current county assessments at the 6 percent rate, in aggregate, and the tax they imply at the 2026 city millage | `pull_tax.py` |
| raw/city-zoning-point.json | City of Myrtle Beach zoning district at the footprint center | curl, ZONING_DISTRICTS_MB FeatureServer 0 |
| raw/pages/ | The resort's own pages (home, accommodations, amenities, faq, homeowner services), Brittain Resorts & Hotels home and homeowner pages | curl |
| raw/google-suggestions-2026-11-14.txt | Demand only | curl, suggestqueries.google.com |

Order: `python3 -I pull_listings.py .`, `pull_fee_exact.py .`, `pull_fee_by_size.py .`, `pull_county.py . <website root>`, `pull_sales_by_value.py . <website root>`, `pull_flood.py .`, `pull_tax.py .`. `pull_listings.py` takes about 4 minutes (2.1 s between calls); run it in the background.

Changes from the Palace scripts: the address test is `^504 (N OCEAN BLVD|OCEAN BLVD N)`; the county regime is `BAYVIEW HPR PH I;`; deeds in the 2026-11-n file are written `HPR BAYVIEW U/APT/CONDO <unit>`; the fee bisection runs for one- and two-bedrooms only (the one three-bedroom has no fee bracket). The API call needs a User-Agent header (it answers 403 to the bare Python one).

Never in these files: an MLS number, a unit number with a price, a single listing's price or fee, a firm, a photo, a PIN, an owner name or a single unit's county record.
