# Data for /buyers/first-time-home-buyer-myrtle-beach/ (batch 2026-10-d)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-10-d/buyers-first-time-home-buyer-myrtle-beach/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every number the ledger uses: sales by kind and price band, new vs resale, starter sales by ZIP, flood share, out-of-state share, listings now in aggregate, the tax example | build_findings.py |
| chart-ladder.json | The price ladder chart rows (8 price bands x condo, townhouse, house, manufactured; new houses and townhouses) | build_findings.py |
| chart-zip.json | Houses and townhouses sold under $300,000 by ZIP area | build_findings.py |
| map-starter-points.json | 2,403 starter-house sale points (rounded to about 100 m), price band and new/resale flag, no addresses | build_findings.py |
| raw/parcel-attrs.json | County parcel layer 24 land use code and values for each sold parcel (no owner names) | fetch_attrs.py |
| raw/zips.json | ZIP areas, county GIS layer 20 | fetch_zips.py |
| raw/listings-400k.json | Active listings up to $400,000: type, price, beds, baths, sq ft, acres, point (no addresses) | pull_listings.py |
| raw/horry-county-boundary.geojson | Census TIGERweb county line (copied from ../buyers-programs/raw/) | that folder's pull-usda.sh |
| raw/*.html, *.txt, *.pdf, acs1-*.json | The primary pages the ledger quotes | pull-sources.sh |
| raw/hud-4000-1-excerpts.txt | The quoted passages of HUD Handbook 4000.1 Update 18 | by hand from the PDF, line numbers given |
| raw/google-suggestions-2026-11-01.txt | Search suggestions | pull-suggestions.sh |

Not kept (large; rerun to rebuild): `raw/flood-sfha.json` (fetch_flood.py, 5.8 MB), the HUD handbook PDF (14 MB), IRS Publication 590-B HTML (`raw/irs-p590b.txt` is its text).

The deed sales are read from `../sell-out-of-state-buyers/out-of-state-buyers.json` (built there by pull_deeds.py, fetch_parcels.py, fetch_points.py and analyze.py; no names).

To rerun: `python3 -I fetch_attrs.py <this dir> ../sell-out-of-state-buyers/out-of-state-buyers.json`, `python3 -I fetch_flood.py <this dir>`, `python3 -I fetch_zips.py <this dir>`, `python3 -I pull_listings.py <this dir>`, `sh pull-sources.sh <this dir>/raw`, then `python3 -I build_findings.py <this dir>`.
