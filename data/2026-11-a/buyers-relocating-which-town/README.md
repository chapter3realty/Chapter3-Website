# Data for /buyers/relocating/which-town/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/buyers-relocating-which-town/facts.md`.
No owner names, street addresses, PINs, MLS numbers, single-listing prices or photos are kept here. Raw pulls that carry them stay in scratch (RAW, RAW2).

| File | What | Made by |
|---|---|---|
| chart-towns.json | One row per place (13, north to south) for the page's table, charts and filter: middle house price, sales, builders' share of sales, yearly cost besides the mortgage, lot size, legal-residence share, flood share, year built (Census), HOA, drive minutes, houses for sale by feature | analyze.py |
| findings.json | Everything behind chart-towns.json, with counts, quartiles, tax districts and the parts of the yearly cost | analyze.py |
| areas.geojson | The 13 outlines, numbered north to south, for the map | analyze.py |
| drives-houses.json | Drive minutes from 60 houses drawn at random in each place (seed 2026) to the nearest beach point, the nearest hospital, the airport, Coastal Grand Mall and the boardwalk (OSRM table service, free flow) | drives_houses.py |
| drives.json | The destination points (ten public beach points, five hospitals, the airport, the mall, the boardwalk) and, from an earlier run, drives from one start point per town | pull_drives.py |
| hoa-extra.json | Middle HOA fee of houses for sale in ZIPs 29585, 29569, 29511 (the cost-to-own method) | pull_hoa_extra.py |
| bills-2026.json | One 2026 Horry County tax bill per district not yet read on a bill by a sibling (400, 550, 660, 220), no PIN or owner | bill.py |
| photos.json | Licence records for the 13 entry photos: three new USDA NAIP 2023 aerials (Loris, Aynor, the Socastee swing bridge) and ten records copied from sibling pages (three of their files copied into this page's image folder so their metadata could be embedded) | make_photos.py, naip-requests.json |
| raw/acs/*.json | Census ACS 2020-2024 5-year B25034 and B25035 for the 13 places | pull_acs.sh |
| raw/google-suggestions.txt | Google search suggestions, 38 seeds | pull-suggestions.sh |
| raw/src/ | Source texts: SCDOR ST-500 (Rev. 3/9/2026) and its tourism tax page, Myrtle Beach resident parking decal page and two city news items on decals (mb-R1737, mb-R1774), Myrtle Beach curbside news item (2022), North Myrtle Beach sanitation page, Horry County Solid Waste Authority convenience centers, S.C. Code Title 56 Chapter 2, SCDOT historic bridge record for the Socastee swing span, S.C. Act 200 of 2014 (Aynor Harvest Hoe-Down), Horry County parks page | curl |

Reused, not pulled again (FASTER.md, "Reuse data before pulling it"):
- `data/2026-11-a/invest-where-to-buy/`: place outlines (raw/places.json, zctas.json, counties.json) and its scratch parcel pulls (horry-homes.json, horry-points.json, horry-sfha.json, gt-homes.json, gt-flood.geojson, read 2026-11-02). Its 11 areas give the same house figures here.
- `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json`: Horry County deeds recorded 2025-10-01 to 2026-09-30.
- `data/2026-11-a/buyers-cost-to-own/`: hoa-by-area.json (HOA fee by ZIP), examples.json (insurance $2,000 and upkeep $3,273, its verified rows 17 and 31) and its tax model.

Kept out of the repo, in scratch: RAW2/horry-house-acreage.json (fetch_acreage.py, PINs), RAW2/gt-area.json (fetch_gt_area.py, parcel numbers), RAW2/house-features.json (pull_features.py, MLS numbers), the tax bills with owner names.

To rerun:

```
export RAW=<scratch>/invest-where-to-buy/raw RAW2=<scratch>/buyers-relocating-which-town/raw
python3 -I fetch_acreage.py ; python3 -I fetch_gt_area.py ; python3 -I pull_features.py
python3 -I pull_hoa_extra.py . ; sh pull_acs.sh ; python3 -I drives_houses.py . ; python3 -I analyze.py .
```

Two faults found and fixed on 2026-11-03:
- The CRM map API returns suggested homes that do not match when a search has no match (total 0). pull_features.py skips those bands. The first run counted them (for example 355 "acre lots" against an API total of 285).
- Georgetown County's TotalLandArea field reads 1.0 on 17,997 of 22,147 parcels. Lot size there uses the parcel's Shape__Area (square feet, State Plane) / 43,560.
