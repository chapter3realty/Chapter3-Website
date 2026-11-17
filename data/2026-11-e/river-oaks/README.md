# Data for /submarkets/carolina-forest/river-oaks/ (batch 2026-11-e)

Read 2026-11-14. Ledger: Blog-Brain `batches/2026-11-e/river-oaks/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | By section: parcels, units, lot size, county value, 4%/6% tax status, county-implied tax, owner mailing state counts, flood, distance to the waterway and the former course, zoning, centre; recorded sales in the last 12 months by section | analyze.py (county cache + deed index) |
| map-lots.json | One point per lot (4 decimals) with section and flags | analyze.py |
| listings.json | Homes for sale now by MLS subdivision: counts, price median and range, beds, size, year built; `fee_exact` monthly HOA range by group | pull_listings.py, pull_fee_exact.py |
| drives.json | Drive minutes and miles from the middle of the west side and the east side | pull_drives.py |
| strips.json | Live strip counts (site's /homes/api/strip) for the planned strips | by hand from curl, 2026-11-14 |
| raw/acclaim-restrictions-index.json | Recorded restrictions and rules index rows | pull_restrictions.py |
| raw/google-suggestions.txt, raw/map-riveroaks.json | Demand; the first map pull for the name | curl |
| flood_check.py | Parcels touching a FEMA zone: counts only | stdout |

Rerun: `export RAW=<scratch>; python3 -I pull_county.py .; SALES=<deeds-co.json> python3 -I analyze.py .; python3 -I pull_listings.py .; python3 -I pull_fee_exact.py .; python3 -I pull_drives.py .; python3 -I pull_restrictions.py .`
Never in these files: an MLS number, an address, a single listing's price, a firm, a photo, a PIN, an owner name (the three builder-owned course parcels are named in the ledger from the county's owner field, as a business).
