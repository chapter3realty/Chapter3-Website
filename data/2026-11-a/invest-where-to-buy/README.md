# Data for /invest/where-to-buy/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/invest-where-to-buy/facts.md`.
No owner names, street addresses, PINs, MLS numbers, single-listing prices or photos are kept here. Raw pulls that carry them stay in RAW (a scratch folder outside the repo).

| File | What | Made by |
|---|---|---|
| findings.json | Per area (11): homes by kind (house, condo, townhouse, all), share at 6 percent, tax bill out of state, FEMA high-risk and VE share, top tax districts; resales (median, quartiles; Horry deeds and Georgetown last sales), builder sales; CRM listings in aggregate (count, say nightly allowed, say rentals allowed, median ask); HUD FY2027 rent for the main ZIP; ACS rent and renter share; 2026 mills at 6 percent and the tax on the middle house; rent as a share of price; the site's nightly figures (str-market.json) | analyze.py |
| chart-scorecard.json | One row per area for the scorecard table and charts | analyze.py |
| areas.geojson | The 11 area outlines (simplified) and the Horry and Georgetown county line, for the map | analyze.py |
| hud-safmr-fy2027.json | HUD FY2027 Small Area FMRs for the Myrtle Beach metro and Georgetown County ZIPs | extracted from FY27_safmrs.xlsx (huduser.gov) |
| raw/places.json, raw/zctas.json, raw/counties.json | Census TIGERweb places, ZIP code areas, county outlines | fetch_areas.py |
| raw/acs/*.json | Census ACS 2020-2024 5-year B25064 and B25003 per area | pull_acs.sh |
| raw/google-suggestions*.txt | Google search suggestions, 67 seeds | pull-suggestions.sh, pull-suggestions-2.sh |
| raw/src/ | Source texts: SC Code 12-36 and 27-30, the two bills, Myrtle Beach and North Myrtle Beach STR pages, Surfside Sec. 17-396.10 (packet text), Conway UDO excerpt, Horry zoning search results, Georgetown zoning (definitions, GRR), Georgetown tax calculator, 2026 Horry levy | curl, pypdf |

Kept out of the repo, in RAW: `horry-homes.json` (fetch_parcels.py, 227,000 Horry home parcels with PIN and owner state), `horry-points.json` (fetch_points.py), `horry-sfha.json` (fetch_flood.py), `gt-homes.json` and `gt-flood.geojson` (fetch_georgetown.py), `listings.json` (pull_listings.py, MLS numbers and points), the HUD xlsx files, the 15 MB Horry zoning PDF and the Conway UDO PDF.

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_areas.py . ; sh pull_acs.sh ; sh pull-suggestions.sh > raw/google-suggestions.txt ; sh pull-suggestions-2.sh > raw/google-suggestions-2.txt
python3 -I fetch_parcels.py ; python3 -I fetch_points.py ; python3 -I fetch_flood.py ; python3 -I fetch_georgetown.py ; python3 -I pull_listings.py
SALES=<web2>/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json python3 -I analyze.py .
```

The deed file ships with batch 2026-10-d's out-of-state-buyers patch (Blog-Brain `batches/2026-10-d/sell-out-of-state-buyers/web.patch`). analyze.py needs shapely 2 and takes about 15 seconds; the parcel pulls take about 10 minutes, the listing pull about 5 (568 calls).

## Review round 1 (2026-11-03)

| File | What | Made by |
|---|---|---|
| nfip-houses.json | FEMA NFIP policies on single-family houses, effective 2025-09-01 to 2026-08-31, in each area's main ZIP code: median, quartiles and count of policyCost by rated zone (V, A, X/B/C), beach ZIPs against inland | nfip_r1.py (the raw pull, 24,000 policy rows, stays in scratch) |
| naip-requests.json | The exact National Map NAIP exportImage request for each of the five new aerials | the fixer's export loop |
| make_photos_r1.py | Six new photo records (five NAIP 2023 aerials, one public-domain Commons photo of Conway) and plain captions for the five USGS photos; writes photos.json and the WebP files | run after make_photos.py |

The page also reads `data/str-market.json` (nightly income) and `data/2026-11-a/submarkets-myrtle-beach/map-str-zones.geojson` (Myrtle Beach's nightly zones on the map).
