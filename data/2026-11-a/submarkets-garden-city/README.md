# Data for /submarkets/garden-city/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/submarkets-garden-city/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Homes in the 2020 Garden City Census place by part (ocean side of Waccamaw Drive, between Waccamaw Drive and Business 17, west of Business 17, on the marsh) and kind (condo, house, other): legal-residence (4 percent) share, tax bills mailed outside SC, FEMA zone, county value. Deed sales by part and kind: count, median, quartiles, buyers from outside SC | analyze.py |
| listings-findings.json | Active CRM listings in the Garden City area, in aggregate: count, median ask and median price per square foot by kind, part and county | analyze_listings.py |
| nfip-findings.json | NFIP policy cost in ZIP 29576 by area (the three block groups along Waccamaw Drive vs the rest), occupancy type and zone | analyze_fema.py |
| census-noaa.json | Census Day 2020 along Waccamaw Drive (48 blocks, both counties); Census place and county totals; Springmaid Pier sea-level trend and high-tide flood days by decade; the property tax worked example | analyze_census_noaa.py |
| chart-high-tide-days.json | Minor high-tide flood days a year at Springmaid Pier, 1980 on | analyze_census_noaa.py |
| chart-str-months.json | AirROI revenue per listing by calendar month (two-year average) and occupancy by month (last 12) | analyze_census_noaa.py |
| airroi.json | AirROI Garden City Beach page, parsed | parse_airroi.py |
| hoa-findings.json | Fix round 2. Monthly HOA dues of the active condo listings in the CRM's Garden City area by part, in aggregate: count and the median and quartiles, each to within $10 (no MLS numbers) | pull_hoa.py |
| map-layers.geojson | Simplified map layers: FEMA VE and AE (Horry side), the Census place, the county line, Waccamaw Drive, Business 17, Atlantic Avenue, the pier | build_map.py |
| strip.json | Waccamaw Drive miles by county, pier to county line | build_map.py |
| zones.py | The split into parts, shared by the scripts | |
| raw/google-suggestions.txt | Google search suggestions for 64 queries | pull-suggestions.sh |
| raw/census-*.json | Census tables, Garden City CDP and Horry County; DHC H5 by block for four tracts | pull-census.sh, pull-blocks.sh |
| raw/noaa-*.json | NOAA CO-OPS station 8661070: sea-level trend, annual high-tide flood counts, outlook, station datums | pull-noaa.sh |
| raw/nfip-policies-29576.json | OpenFEMA NfipPolicies v3, ZIP 29576, June 2025 to May 2026 (no addresses; FEMA rounds the location to 0.1 degree) | pull_fema.py |
| raw/drives.json | OSRM drive times from the foot of the pier | pull_drives.py |
| raw/airroi-garden-city-beach.html | AirROI market page, read 2026-11-02 | curl |
| raw/ST575.pdf/.txt | SCDOR sales and accommodations tax rates by municipality (Rev. 2/5/26) | curl dor.sc.gov |
| raw/tax-levy-2026.pdf/.txt | Horry County 2026 tax levies | curl horrycountysc.gov |
| raw/horry-str-tax-chart.pdf, raw/horry-about-our-beaches.txt, raw/horry-renourishment-begins.html | Horry County pages quoted in the ledger | curl horrycountysc.gov |
| raw/nws-hurricanehugo.html, raw/nws-hurricaneian.html | NWS Wilmington storm pages | curl weather.gov |
| raw/gardencitypier-home.html | The pier's own home page | curl |
| raw/munis.json | County GIS layer 31 municipality names | curl |
| raw/cdp2020.geojson | 2020 Garden City CDP boundary (TIGERweb) | curl |
| raw/overpass-query.txt | The OpenStreetMap query for marsh, water, Waccamaw Drive and the pier | |

Kept out of the repo (addresses, owner fields or size), in RAW: county parcels (layer 24: PIN, land use, tax district, legal description, values, owner state; no owner name or street), address points (layer 22), FEMA zones (layer 19), roads (layer 18), hydrography (layer 21), TIGER counties and 2020 blocks, the OpenStreetMap extract, the CRM listing pull (no addresses, firms or photos) and parcel-zones.json.

Input from another folder: deed sales `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (Horry County deeds recorded 2025-10-01 to 2026-09-30; it ships in Blog-Brain `batches/2026-10-d/sell-out-of-state-buyers/web.patch`). The page needs only findings.json.

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_county.py
curl TIGERweb CDP and counties into RAW (URLs in the ledger rows 2 and 5); RAW=$RAW sh pull-blocks.sh
curl -sS --data-urlencode data@raw/overpass-query.txt https://overpass-api.de/api/interpreter -o $RAW/osm.json
python3 -I pull_listings.py ; python3 -I pull_hoa.py . ; python3 -I pull_fema.py . ; python3 -I pull_drives.py .
sh pull-census.sh ; sh pull-noaa.sh ; sh pull-suggestions.sh > raw/google-suggestions.txt
SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json python3 -I analyze.py .
python3 -I analyze_listings.py . ; python3 -I analyze_fema.py . ; python3 -I parse_airroi.py . ; python3 -I analyze_census_noaa.py . ; python3 -I build_map.py .
```

The scripts need shapely 2. findings.json carries no names, addresses, PINs or deed book and page.

## Images (builder, 2026-11-02)

`images/` holds the scripts that made the page's pictures: `base.py` (the USGS Imagery Only export of bbox -79.036,33.531,-78.977,33.606 for the map, its no-imagery corner over the sea filled with the sea's colour), `naip.py` (USDA NAIP 2023 close-ups from the USGS National Map image service; frames in `naip-frames.json`), `label_naip.py` (labels placed from coordinates; `labels.json`) and `records.py` (writes `photos.json`, the licence records). Raw exports stay in scratch.
