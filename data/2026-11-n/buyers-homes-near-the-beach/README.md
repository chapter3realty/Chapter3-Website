# Data for /buyers/homes-near-the-beach/ (batch 2026-11-n)

Pulled 2026-11-08. Ledger: Blog-Brain `batches/2026-11-n/buyers-homes-near-the-beach/facts.md`. Every number on the page comes from the JSON files here; charts read them, never typed values.

County parcels, listing pins (with MLS numbers and addresses), deed PINs and the walk results stay outside the repo in a scratch folder (RAW). The scripts rebuild them. Published files hold counts and medians only.

| Step | Script | Output |
|---|---|---|
| Google suggestions | pull-suggestions.sh | raw/google-suggestions.txt |
| Ocean shoreline from TIGER/Line 2024 coastline (public domain) | build_coast.py `<tl_2024_us_coastline.shp>` | coast.geojson |
| SCDES public beach access points (Horry and Georgetown) and beach outlines | pull_access.py | raw/scdes-access-points.json, raw/scdes-beach-lines.json |
| Land use code per deed PIN (reuses the 2026-10-d deeds) | fetch_landuse.py (RAW, SALES env) | RAW/landuse.json |
| County house parcels, FEMA zones and town limits in a 3.5-mile coastal strip | fetch_county.py | RAW/parcels.json, RAW/fema.json, RAW/towns.json |
| Countywide house parcel count | one ArcGIS count query (URL in the ledger) | RAW/county-house-count.json |
| Houses for sale, every pin by price slices, and each beach key's set | pull_listings.py | RAW/pins.json, RAW/listing-calls.json |
| Kings Highway centrelines and their distance from the ocean | pull_kings.py | raw/kings-hwy.json, kings-hwy-distance.json |
| Every derived number: deeds, listings, stock, flood, access spacing, chart rows | analyze.py (RAW; SALES defaults to ../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json) | findings.json |
| Access points per mile, by beach | analyze_access.py | access-findings.json |
| Walk from each house for sale within 1.5 miles of the ocean to the nearest public access (OpenStreetMap foot router) | pull_walks.py, analyze_walks.py | RAW/walks.json, walk-findings.json |
| Fix round 1: what a budget buys within a 10-minute walk, by stretch and street; the live North Myrtle Beach walk search under $400,000 checked for campground homes and placed in the city's parts | fix1_budget.py (RAW) | fix1-walk-budget.json |
| Map layers: shoreline, 1/4, 1/2 and 1 mile lines, beach town limits, access points | build_map.py | map-layers.geojson |
| Saved source pages | (curl) | raw/myrtle-beach-accessibility.html, raw/nmb-beach-accesses.html, raw/horry-county-beach-accesses.html, raw/scdot-us17bus-rsa.html, raw/usc-42-4012a.html (copied from the Surfside data), raw/osrm-foot.lua |

To rerun: `RAW=<scratch>` for every script that writes to RAW. Order: build_coast.py, pull_access.py, fetch_landuse.py, fetch_county.py, the count query, pull_listings.py, pull_kings.py, analyze.py, analyze_access.py, pull_walks.py, analyze_walks.py, build_map.py. Run Python with `-I`.

Notes:
- Distances are straight lines to the ocean shoreline on a flat local projection at 33.65 N, except the walk, which follows mapped streets and paths.
- House = county land use 100, 101, 102, 110 or 126 (deeds: also not a condo and no HPR in the legal description).
- Listings: the API returns at most 144 pins a call; each search was cut into price slices until every slice returned all of its homes (3,673 of 3,677 houses).
- The SCDES access points were last edited 2013 to 2022. Use their places, not their parking fields.
