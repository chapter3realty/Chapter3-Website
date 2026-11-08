# Data for /submarkets/myrtle-beach/market-common/ (batch 2026-11-n)

Pulled 2026-11-08. Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-n/submarkets-market-common/facts.md`.

**The area.** The three City of Myrtle Beach zoning districts drawn on the former air base's homes: C6 (the town center), CENTER POINTE PUD and CLEMSON TRACT PUD (city layer ZONING_DISTRICTS_MB). The same grouping as the /submarkets/myrtle-beach/ ledger row 23, without ITAP PUD, which holds no homes.

| File | What | Made by |
|---|---|---|
| findings.json | Homes by part, neighborhood and kind (count, main-home share, tax bill outside SC, FEMA zone, county value); deed sales by part, neighborhood and kind; the same deed file for Carolina Forest CDP, Surfside Beach town and the city | analyze.py |
| listings-findings.json | Active CRM listings inside the area, in aggregate: count, asking price, price per square foot, size, beds, HOA fee bracket | pull_listings.py, analyze_listings.py |
| noise-findings.json | Distance from every home to the 65 dB DNL lines on the airport's layout plan, and to the runway centerline | noise_georef.py |
| compare-flood.json | Houses and townhomes in Carolina Forest CDP in FEMA's high-risk zone (address-point method) | compare_flood.py |
| map-layers.geojson | The three districts and one outline per neighborhood (parcels merged and smoothed) | analyze.py |
| map-noise.geojson | The 65 dB DNL area traced from the airport's layout plan (outer edge of the 2018 and 2038 lines; approximate) | noise_georef.py |
| raw/routes.json | Walks (OSRM foot) from each neighborhood's middle to Valor Park, and from Valor Park to parks, stores and the 29th Avenue South beach access; drives (OSRM car, no traffic) from Valor Park | pull_routes.py |
| raw/google-suggestions.txt | Google search suggestions for 72 queries | pull-suggestions.sh |
| raw/sources/*.txt | Text of the primary pages quoted in the ledger (city news R729 and R392, SC Encyclopedia, SC Senate resolution S.1230 of 2008, EPA 2019 reuse awards, 14 CFR 150 Appendix A, the layout plan sheet's note 4) | curl, pdftotext |
| raw/check-overlay-alp-parcels.jpg | County parcels (red) drawn on the airport layout plan sheet with the fitted transform: the check that the noise lines are placed right | noise_georef.py |

Inputs from other folders (reused, not pulled again):
- Deeds: `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (Horry County deeds recorded 2025-10-01 to 2026-09-30, 13,194 home sales).
- Land use codes for the comparison places: `data/2026-10-d/buyers-first-time-home-buyer-myrtle-beach/raw/parcel-attrs.json`.

Kept out of the repo (addresses, owner states per parcel, or size), in RAW: the city zoning layer, county parcels (layer 24, no owner names or street), address points (22), FEMA zones (19), roads (18), hydrography (21), the CRM listing pull (no addresses, firms or photos), the airport layout plan sheet (PDF, 7.8 MB, URL in noise_georef.py) and its 100 dpi render.

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_gis.py
python3 -I pull_listings.py
SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json ATTRS=../../2026-10-d/buyers-first-time-home-buyer-myrtle-beach/raw/parcel-attrs.json python3 -I analyze.py .
python3 -I analyze_listings.py .
curl -sSL -o $RAW/myr-ldu.pdf https://aeronautics.sc.gov/sites/default/files/2025-03/14-MYR-LDU-36x48.pdf && pdftoppm -r 100 -png $RAW/myr-ldu.pdf $RAW/ldu100
SHEET=$RAW/ldu100-1.png python3 -I noise_georef.py .
python3 -I pull_routes.py .
curl -sS 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/5/query?where=BASENAME%3D%27Carolina+Forest%27+AND+STATE%3D%2745%27&outFields=NAME,GEOID&returnGeometry=true&outSR=4326&f=json' -o $RAW/cf-cdp-5.json
python3 -I compare_flood.py .
sh pull-suggestions.sh > raw/google-suggestions.txt
```

The scripts need shapely 2 and Pillow. No file here carries names, addresses, PINs, MLS numbers or deed book and page.
