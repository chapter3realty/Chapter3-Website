# Data for /buyers/undisclosed-flooding/ (batch 2026-10-d)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-10-d/buyers-undisclosed-flooding/facts.md`.

| File | What | Made by |
|---|---|---|
| claims-findings.json | NFIP paid flood claims in Horry County: by flood zone (rated and today's map), by storm, by year, by census tract | analyze_claims.py |
| other-findings.json | NFIP repeat-loss properties; FEMA mitigation buyouts and elevations; share of homes with a flood policy | analyze_other.py |
| gis-findings.json | Area and homes inside the county's Florence flood map (Supplemental Flood Zone) and FEMA's high-risk zone; active listings counted in aggregate; houses for sale whose owner bought after Florence | analyze_gis.py |
| map-*.geojson | Simplified map layers: county outline, FEMA high-risk zone, Florence flood extent, the part of it outside FEMA's zone, and the same without edge strips under about 60 m (map-sfz-outside-sfha-core, the one to draw) | analyze_gis.py |
| raw/nfip-claims-horry-slim.json | OpenFEMA NfipClaims v3, countyCode 45051, only the fields the analysis uses | analyze_claims.py from the full pull |
| raw/nfip-multiple-loss-horry.json, raw/hma-*.json, raw/nfip-penetration-horry.json, raw/nfip-community-status-sc.json, raw/nfip-claims-fields.json | OpenFEMA pulls | fetch_fema.py (and the Community Status Book query in the ledger) |
| raw/county.json, raw/tracts-horry*.json | County outline (Horry GIS layer 33); Census tracts 2020 and 2010 (TIGERweb) | fetch_county.py, fetch_tracts.py |
| raw/*.html, raw/*.pdf, raw/*.txt | Saved copies of the primary sources quoted in the ledger | curl, by hand |
| raw/google-suggestions.txt | Google search suggestions for 50 queries | pull-suggestions.sh |

Kept out of the repo (large, and some carry parcel IDs): the full NFIP claims pull (33 MB), every county address point and residential parcel (PIN, land use code, last sale date; no owner fields), the FEMA high-risk and Supplemental Flood Zone polygons at full detail, and the CRM listing pull (no addresses, firms or photos are saved, only type, price, size, point and tag).

To rerun: `export RAW=<scratch dir>`, then `python3 -I fetch_fema.py` and `python3 -I fetch_fema.py small`, `python3 -I fetch_county.py`, `python3 -I pull_listings.py .`, `python3 -I fetch_tracts.py`, then `python3 -I analyze_claims.py`, `python3 -I analyze_other.py`, `python3 -I analyze_gis.py` (needs shapely 2). The county's server refuses spatial queries with the large Supplemental Flood Zone polygons, so analyze_gis.py tests points against the polygons locally.
