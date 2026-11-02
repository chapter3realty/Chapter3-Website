# Data for /submarkets/conway/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/submarkets-conway/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every derived number: homes inside the city limits and in each flood map, homes with a Conway mailing address inside and outside the city, flood counts by subdivision and street, Florence and Matthew road closures, deed sales in the city (resale, builder, condo, by area, in and out of flood maps), resale medians by Census place, NFIP paid claims for the City of Conway, FEMA buyouts, river days above flood stage, flood crests grouped into events, NFIP policy cost by ZIP, active listings in aggregate, the yearly tax calculation, area label points | analyze.py |
| chart-river-rise.json | Daily average river height at the Conway Marina gauge after Matthew and after Florence, with flood stage and landfall dates | analyze.py |
| chart-major-crests.json | Every flood on record that reached major flood stage (14 ft), highest crest of each | analyze.py |
| map-city.geojson | City limits (county GIS layer 31), simplified | analyze.py |
| map-flood-city.geojson | FEMA high-risk zone and the county's Florence flood extent, clipped to the city plus about 400 m, simplified | analyze.py |
| raw/google-suggestions.txt | Google search suggestions for 53 queries | pull-suggestions.sh |
| raw/census-*.json | Census tables, Conway city and Horry County (ACS 2020-2024; 2020 and 2010 Census) | pull-census.sh |
| raw/sub-est2025_45.csv, raw/sub-est2024_45.csv | Census population estimates, SC places, Vintage 2025 and 2024 | curl www2.census.gov |
| raw/usgs-02110704-dv-gage.rdb | USGS daily mean gage height, Waccamaw River at Conway Marina, 1994-10-01 to 2026-10-31 | curl waterservices.usgs.gov (URL in ledger) |
| raw/nwps-CNWS1.json, raw/nwps-CSCS1.json | NWS gauge records: flood stages, historic crests, impact statements | curl api.water.noaa.gov |
| raw/nfip-policies-*.json | OpenFEMA NfipPolicies v3, ZIPs 29526 and 29527, single-family, June 2025 to May 2026, by rated zone | pull_fema.py |
| raw/safmr-2026-metro34820.json, raw/fmr-2026-horry.html | HUD FY2026 Small Area FMRs (metro rows) and the FY2026 FMR documentation page | curl huduser.gov (browser user agent) |
| raw/drives.json | OSRM drive times from the USGS point for Conway | pull_drives.py |
| raw/conway-brief-history.html/.txt | City of Conway, "A Brief History" | curl conwaysc.gov |
| raw/nps-71000785.pdf/.txt | NRHP nomination, Old Horry County Court House and Old Jail | curl npgallery.nps.gov |
| raw/sc-aar2025-H170.pdf/.txt | Coastal Carolina University FY2024-25 accountability report to the SC General Assembly | curl scstatehouse.gov |
| raw/nces-ccu.html | NCES College Navigator, Coastal Carolina University | curl nces.ed.gov |
| raw/nws-HurricaneFlorence.html, raw/nws-matthew.html | NWS Wilmington storm summaries (copied from data/2026-10-d/buyers-undisclosed-flooding/raw) | curl weather.gov |

Inputs from other folders: deed sales `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (Horry County deeds recorded 2025-10-01 to 2026-09-30, 13,194 home sales; that folder's README). That folder is not on the live branch yet: it ships in Blog-Brain `batches/2026-10-d/sell-out-of-state-buyers/web.patch` (the page itself does not need it; every number it uses is in findings.json); NFIP claims `data/2026-10-d/buyers-undisclosed-flooding/raw/nfip-claims-horry-slim.json`; FEMA mitigation projects `data/2026-10-d/buyers-undisclosed-flooding/other-findings.json`.

Kept out of the repo (addresses or size), in RAW: county parcels (layer 24, no owner fields), address points (layer 22, street names but no house numbers), the Florence flood extent (HazardsMap 17), FEMA zones (layer 19), road closures (HazardsMap 0 and 1), the city outline (layer 31) and the CRM listing pull (no addresses, firms or photos).

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_county.py
python3 -I pull_listings.py
python3 -I pull_fema.py .
python3 -I pull_drives.py .
sh pull-census.sh ; sh pull-suggestions.sh > raw/google-suggestions.txt
SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json NFIP=../../2026-10-d/buyers-undisclosed-flooding/raw/nfip-claims-horry-slim.json HMA=../../2026-10-d/buyers-undisclosed-flooding/other-findings.json python3 -I analyze.py .
```

analyze.py needs shapely 2 and numpy. findings.json carries no names, addresses, PINs or deed book and page. Street names appear only as counts of homes.
