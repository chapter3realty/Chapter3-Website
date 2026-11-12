# Data for /submarkets/murrells-inlet/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/submarkets-murrells-inlet/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Homes in the Murrells Inlet mailing area (ZIP 29576 polygon, Horry GIS layer 20) by county side and part (Horry side; Georgetown west of the US 17 bypass, between the roads, creek side of US 17 Business; Garden City counted apart), by kind: legal-residence share, tax-bill state, FEMA zone, tax district, school zones. Sales: Horry deeds and Georgetown last sales, 12 months to 2026-09-30, plus 3-year Georgetown figures and the marsh-front houses | analyze.py (zones.py) |
| names.json | Neighborhoods with 40 or more homes, by side and part: count, kind, 12-month sales | names.py |
| listings-findings.json | Active CRM listings with a Murrells Inlet city, in aggregate: counts, median ask, feature tags, houses with no HOA, house HOA fees bracketed to $10 | analyze_listings.py (after pull_listings.py) |
| nfip-findings.json | NFIP policy cost, ZIP 29576, policies that began 2025-06 to 2026-05, by county side and block group (Garden City and the beach strip apart) | analyze_fema.py |
| airroi.json | AirROI Murrells Inlet market page, parsed (raw HTML in scratch) | parse_airroi.py |
| places.json | OpenStreetMap places and Georgetown County boat landings, with county side, part and ZIP | places.py |
| worked.json | Property tax on the same house on each side, and Airbnb vs HUD fair rent by bedrooms | build_charts.py |
| chart-parts.json, chart-str-months.json, chart-str-ltr.json, chart-tides.json | Chart and table data | build_charts.py |
| map-layers.geojson | County line, ZIP outline, Census places, the four parts (from home points), roads, shellfish grounds, landings, golf courses, MarshWalk | build_map.py |
| raw/google-suggestions.txt | Google suggestions for 76 queries | pull-suggestions.sh |
| raw/census-*.json, census-summary.txt | Census tables: Murrells Inlet CDP 4548985, ZCTA 29576, Georgetown and Horry counties | pull-census.sh |
| raw/drives.json | OSRM drive times from the MarshWalk landing, the Horry side's middle and the Georgetown west side's middle | pull_drives.py |
| raw/tides-2026.json | NOAA 2026 tide predictions summary, stations 8661529, 8661437, 8661493 | pull_tides.py |
| raw/scregs-30-12A-docks.txt | S.C. Regulation 30-12(A), docks and piers, text | from scstatehouse.gov Chapter 30 PDF |
| raw/scdnr-shellfish-grounds.geojson, raw/scdnr-shellfish-regs.html | SCDNR recreational shellfish grounds in the inlet; the harvest rules page | curl |
| raw/nrhp-80003670-excerpt.txt | National Register nomination, Murrells Inlet Historic District, sections 1 to 10 (owner list left out) | pypdf |
| raw/sc-encyclopedia-murrells-inlet.txt | South Carolina Encyclopedia entry text | curl |
| raw/overpass-query.txt | The OpenStreetMap query | |

Kept out of the repo (addresses, owner fields or size), in RAW: Horry parcels (layer 24, no owner name or street), address points, FEMA zones, hydrography, roads, ZIP polygons, HCS attendance areas (h-school-3/4/5); Georgetown parcels (Export 2: land use, last sale, legal description, billing city and state), address points, FEMA zones, NWI wetlands, tax districts, neighborhoods, roads, 2024 footprints, school zones, landings; TIGER CDPs (Murrells Inlet and Garden City), counties and 2020 block groups; the NFIP policy file (copied from the Garden City folder); osm-places.json; the AirROI HTML; homes.json (one row per home); the CRM listing pull (no addresses, firms or photos); the NRHP PDFs.

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_county.py ; RAW=$RAW sh pull_schools.sh
curl TIGERweb Murrells Inlet CDP into $RAW/cdp2020.geojson (URL in ledger row 1); copy Garden City's cdp2020.geojson to $RAW/gc-cdp2020.geojson and counties.geojson
curl Horry layer 20 into $RAW/h-zip.geojson (URL in ledger row 3)
curl -sS --data-urlencode data@raw/overpass-query.txt https://overpass.kumi.systems/api/interpreter -o $RAW/osm-places.json
curl -sS https://www.airroi.com/airbnb-data/united-states/south-carolina/murrells-inlet -o $RAW/airroi-murrells-inlet.html
cp ../submarkets-garden-city/raw/nfip-policies-29576.json $RAW/ ; python3 -I pull_fema.py   (claims step failed 2026-11-02; block groups only)
python3 -I pull_listings.py ; python3 -I pull_drives.py . ; python3 -I pull_tides.py . ; sh pull-census.sh ; sh pull-suggestions.sh > raw/google-suggestions.txt
SALES=<out-of-state-buyers.json from data/2026-10-d> python3 -I analyze.py . ; SALES=... python3 -I names.py .
python3 -I analyze_listings.py . ; python3 -I analyze_fema.py . ; python3 -I parse_airroi.py . ; python3 -I places.py . ; python3 -I build_charts.py . ; python3 -I build_map.py .
```

The scripts need shapely 2. findings.json, names.json and places.json carry no owner names, home addresses, parcel numbers or deed book and page.
