# Caravelle Resort data (2026-11-14)
| File | What | Script |
|---|---|---|
| listings.json | Condos for sale now at 6900 N Ocean Blvd (MLS subdivision "Caravelle Resort", 41) and 7000 N Ocean Blvd ("Caravelle Tower", 6): beds, asking range, size range, fee brackets, exact fee ranges by building and bedrooms (`fee_exact`), flags, year built | pull_listings.py, pull_fee_exact.py |
| fee-drivers.json | Counts at each $25 fee step for all, oceanfront unit, high floor, low floor, Tower | pull_fee_drivers.py |
| fee-by-size.json | Fee bracket by square-foot band (band summaries only), correlation 0.72 | pull_fee_by_size.py |
| county.json | Parcels of "CARAVELLE RESORT HPR" and "CARAVELLE TOWER HPR": units, floors, value groups, owner states, last-sale years, taxed at 4 and 6 percent; deed sales in two windows | pull_county.py (needs website data/2026-10-d and 2026-11-n deed files) |
| flood-resort.json, flood-tower.json | FEMA zones under each footprint (Horry GIS layers 24 and 19) | pull_flood.py <dir> "CARAVELLE RESORT" / "CARAVELLE TOWER" (needs shapely) |
| tax.json | Taxable value and implied yearly tax at the 6 percent rate, City of Myrtle Beach millage 254.6 (district 880, same as the Palace) | pull_tax.py |
| raw/city-zoning-*.json | City zoning at both footprints (MUH) | curl, ZONING_DISTRICTS_MB FeatureServer 0 |
| raw/pages/ | thecaravelle.com home (script challenge, no text), about, amenities, accommodations, caravelle-tower, rental-management, homeowners, a 2014 Tower blog post | curl |
| raw/google-suggestions-2026-11-14.txt | Demand only | suggestqueries.google.com |
Rerun in order: listings, fee_exact, fee_drivers, fee_by_size, county, flood (twice), tax. Listings change daily. The map API refuses a request without a User-Agent header.
Never in these files: an MLS number, a unit number with a price, a single listing's price or fee, a firm, a photo, a PIN, an owner name or a single unit's record.
