# Prince Resort data (2026-11-14)
| File | What | Script |
|---|---|---|
| listings.json | Condos for sale now at 3500 and 3601 N Ocean Blvd (MLS subdivision "Prince Resort"): beds, asking range, fee range, flags, year built | pull_listings.py, pull_fee_exact.py (1-bedroom), pull_fee_2br.py (2-bedroom) |
| county.json | Parcels of "PRINCE CONDO @ C.G.PIER" (both phases), floors, values, owner states, deed sales in two windows | pull_county.py (needs website data/2026-10-d and 2026-11-n deed files) |
| flood.json | FEMA zones under the footprint (Horry GIS layers 24 and 19) | pull_flood.py (needs shapely) |
| tax.json | Taxable value and implied yearly tax at the 6 percent rate, 221.2 mills (county and schools 171.2 + city 50, no residence credit) | pull_tax.py |
| raw/owner-concentration.txt | Top owner names by unit count (companies only) | one-off curl, layer 24 OwnerName |
| raw/google-suggestions-2026-11-14.txt | Demand only | suggestqueries.google.com |
| raw/pages/ | Third-party pages tried; the resort's own site sits behind a script challenge | curl |
Rerun in order: listings, fee_exact, fee_2br, county, flood, tax. Never in these files: an MLS number, a unit number with a price, a firm, a photo, a PIN or a single unit's record.
