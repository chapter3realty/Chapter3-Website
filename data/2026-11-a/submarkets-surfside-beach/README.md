# Data for /submarkets/surfside-beach/ (batch 2026-11-a)

Pulled 2026-11-03. Raw county parcels, address points, road lines, listing pins, the town zoning PDF and its traced
polygons carry addresses or are large; they stay outside the repo in a scratch folder (RAW). The scripts rebuild them.

| Step | Script | Output (this folder) |
|---|---|---|
| County GIS: parcels (layer 24), addresses (22), FEMA zones (19), roads (18) | fetch_county.py | RAW/*.json |
| Town zoning map PDF (surfsidebeach.org DocumentCenter 3026) traced to lon/lat | georef_zoning.py | zoning-georef.json (fit: street labels median 0.3 m, parcels median 0.9 m) |
| Homes by district, kind, flood zone, 4%/6% ratio, owner state; deed sales by district | analyze.py (SALES = data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json) | findings.json |
| Distance from each home to Ocean Boulevard | analyze_beach.py | beach-distance.json |
| Map layers (districts grouped by nightly-rental rule, town limits, roads, pier, Ocean Lakes parcel) and counts | build_map.py | map-layers.geojson, map-counts.json |
| Active listings (chapter3realty.com/homes/api/map, aggregate only) | pull_listings.py, analyze_listings.py | listings-findings.json |
| Ocean Lakes structures on the county roll | pull_ocean_lakes.py | ocean-lakes-findings.json |
| NFIP policy cost, ZIP 29575 | pull_fema.py, analyze_fema.py | nfip-findings.json |
| CRS class on 2026 NFIP policies | pull_crs.py | crs-findings.json |
| Census 2010, 2020 and ACS 2020-2024 | pull-census.sh | raw/census-*.json |
| AirROI market page | parse_airroi.py | airroi.json |
| Drive times (OSRM, free flow) from the pier | pull_drives.py | raw/drives.json |
| Google suggestions | pull-suggestions.sh | raw/google-suggestions.txt |
| 2026 Horry County tax levies; SCDOR ST-575 | (curl + pypdf) | raw/tax-levy-2026.*, raw/ST575.* |

Note (2026-11-03, restart): the page reads its short-term rental figures only from `data/str-market.json` (ledger rows 37, 38). `airroi.json` is kept as the researcher's own read for reference; its monthly series is not used on the page.
