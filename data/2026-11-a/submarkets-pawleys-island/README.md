# Data for /submarkets/pawleys-island/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/submarkets-pawleys-island/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Houses, condos and lots by zone (island and its north, middle and south parts, oceanfront and marsh side; Litchfield's ocean side of US 17; the mainland behind the island; west of US 17; DeBordieu): legal-residence share, tax-bill state and SC city, last-deed age and price type, market sales (12 months, 3 years, 5 years), FEMA zone and base flood elevation, houses past the state setback line; island building counts 2017 and 2024 | analyze.py |
| chart-zones.json | The four-place comparison table | build_charts.py |
| chart-last-deed.json | Decade of the last deed, island vs west of US 17 | build_charts.py |
| chart-hurricanes.json | Storms within 50 miles by decade, and the 7 hurricanes | build_charts.py |
| map-layers.geojson | Simplified map layers: town limits, US 17, the causeways, the island's three main roads, the 2018 OCRM baseline and setback lines, FEMA VE and AE | build_charts.py |
| hurricanes.json | Every storm center within 50 miles of the island's middle, 1950 to 2025 | hurricanes.py |
| listings-findings.json | Active CRM listings with a Pawleys Island city, in aggregate by zone and kind | analyze_listings.py |
| nfip-findings.json | NFIP policy cost in ZIP 29585 by community (town vs county), occupancy, zone and primary residence | analyze_fema.py |
| airroi.json | AirROI Pawleys Island market page, parsed | parse_airroi.py |
| raw/google-suggestions.txt | Google search suggestions for 76 queries | pull-suggestions.sh |
| raw/census-*.json, raw/census-summary.txt | Census tables for the town, Litchfield Beach CDP, DeBordieu Colony CDP, ZCTA 29585 and Georgetown County | pull-census.sh |
| raw/nfip-policies-29585.json | OpenFEMA NfipPolicies v3, ZIP 29585, June 2025 to May 2026 (no addresses; FEMA rounds location) | pull_fema.py |
| raw/drives.json | OSRM drive times from Town Hall, 323 Myrtle Avenue | pull_drives.py |
| raw/gt-tax-calculator.html | Georgetown County tax calculator page (millage by district in its script) | curl |
| raw/sc-code-48-39.txt, raw/sc-code-12-43.txt | SC Code Title 48 Ch. 39 (beachfront) and Title 12 Ch. 43 (assessment ratios), text | curl scstatehouse.gov |
| raw/nrhp-72001211.txt | Pawleys Island Historic District National Register nomination, text (NPS) | curl npgallery.nps.gov |
| raw/ST575.txt | SCDOR sales and accommodations tax rates by municipality (Rev. 2/5/26) | copied from the Garden City folder |
| raw/town/*.txt | Town of Pawleys Island pages and PDFs, text | curl townofpawleysisland.com |
| raw/overpass-query.txt | OpenStreetMap query (Overpass was unreachable on 2026-11-02; not used) | |

Kept out of the repo (owner mailing fields or size), in RAW: county parcels (Export 2: land-use code, mailing city and state, last sale date and price, legal description; no names are used), address points, roads, flood zones, OCRM lines, wetlands, 2017 and 2024 building footprints, HURDAT2, the AirROI and other HTML pages and PDFs, and the CRM listing pull (no addresses, firms or photos).

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_county.py ; python3 -I fetch_buildings.py
curl -sS "https://gis1.georgetowncountysc.org/portal/rest/services/GCGIS_Nature/FeatureServer/0/query?where=1%3D1&geometry=-79.17,33.38,-79.06,33.50&geometryType=esriGeometryEnvelope&inSR=4326&outFields=*&outSR=4326&geometryPrecision=6&f=geojson" -o $RAW/wetlands.geojson
curl -sS https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2025-092326.txt -o $RAW/hurdat2.txt
curl -sS https://www.airroi.com/airbnb-data/united-states/south-carolina/pawleys-island -o $RAW/airroi-pawleys-island.html
python3 -I pull_listings.py ; python3 -I pull_fema.py . ; python3 -I pull_drives.py .
sh pull-census.sh ; sh pull-suggestions.sh > raw/google-suggestions.txt
python3 -I analyze.py . ; python3 -I analyze_listings.py . ; python3 -I analyze_fema.py . ; python3 -I hurricanes.py . ; python3 -I parse_airroi.py . ; python3 -I build_charts.py .
```

The scripts need shapely 2. analyze.py takes about 80 seconds. findings.json carries no names, addresses, parcel numbers or deed book and page; it lists tax-bill cities only where 5 or more houses share one.

## Review round 1 (2026-11-02)

- `fix1_places.py` writes `raw/fix1-places.json`: OpenStreetMap places (Hammock Shops, grocery stores, golf courses, the Waccamaw Neck Bikeway) with the side of US 17 by analyze.py's test, OSRM drives from Town Hall to the Hammock Shops and the nearest grocery store, and the town's 2024 lodging tax figures (ledger rows 52 to 56). Run: `python3 -I fix1_places.py .`
- `images/commons.py` adds the Commons photos (creek walkway, north end) to `photos.json` after `records.py`; `images/commons-looked.json` holds what the fixer saw in each file, and why the "Still Standing" house photo is not used.
- `images/prep.py`: the "Atlantic Ocean" label on the North Causeway close-up moved onto the water.
