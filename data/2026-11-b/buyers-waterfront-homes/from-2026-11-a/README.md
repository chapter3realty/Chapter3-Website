# Data for /buyers/waterfront-homes/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/buyers-waterfront-homes/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every derived number: homes whose lot touches each county water outline, by stretch and kind; vacant house lots on the water; house sales on the water against house sales within 1 km not on it (deeds 2025-10-01 to 2026-09-30); active listings on the water in aggregate (counts, middle asking price, price per square foot, dock share, no-HOA count); NFIP policy cost by zone for single-family homes in 11 waterfront ZIPs; tide ranges; bridge counts | analyze.py |
| chart-sales.json | Middle sale price on the water and nearby, by water and stretch | analyze.py |
| chart-tides.json | Mean tide range in 2026 at nine NOAA stations, by kind of water | analyze.py |
| chart-listings.json | Waterfront houses for sale by the water each listing names; the dock comparison on tidal water and rivers | analyze.py |
| map-water.geojson | County water outlines (waterway, Waccamaw, House Creek with the Cherry Grove channels, Little River, Dunn Sound), the crossings, the tide stations, two inlet label points | analyze.py |
| bridges.json | Every crossing of the waterway from the state line to Socastee: mile, kind, closed clearance, the Coast Pilot quote, a map position | typed from NOAA Coast Pilot 4 ch. 12 (each row carries its quote); positions from county road lines |
| raw/tides-2026.json | NOAA CO-OPS high and low predictions for 2026, summarised per station | pull_tides.py |
| raw/google-suggestions.txt | Google search suggestions for 66 queries | pull-suggestions.sh |
| raw/coastpilot4-*.txt | Text of the Coast Pilot paragraphs used (ch. 12 channels and Little River to the Waccamaw; ch. 6 inlets) | pypdf from the NOAA PDFs |
| raw/ecfr-117911.txt, raw/cfr117911-2025.txt, raw/cfr1175.txt | 33 CFR 117.911 as of 2026-11-01 (eCFR versioner API) and the July 2025 edition; 33 CFR 117.5 | curl |
| raw/scdes-*.txt | SCDES Bureau of Coastal Management pages: FAQ, minor activities, general permits, amendments, dock master plans, extensions and transfers | curl |
| raw/sc-regs-30-12A-docks.txt | S.C. Code of Regulations R.30-12(A), docks and piers | pypdf from scstatehouse.gov Chapter 30 |
| raw/sc-code-48-39-excerpts.txt | S.C. Code 48-39-10, -130, -140, -145, -150 | curl scstatehouse.gov |
| raw/dph-restructuring.txt | SC DPH page on the DHEC split of July 1, 2024 | curl |

Inputs from other folders: kept home sales `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (Horry County deeds recorded 2025-10-01 to 2026-09-30). Figures reused from sibling ledgers (not recomputed here): Cherry Grove channel houses and sales (North Myrtle Beach rows 13, 14), deeded slips (Little River rows 12 to 14), flood policy cost countywide (Common Mistakes row 28).

Kept out of the repo (PINs, legal descriptions, MLS numbers or size), in RAW: hydro.json (county layer 21), water-parcels.json (layer 24 parcels within 15 m of the tidal and river water polygons), sale-shapes.json (layer 24 outlines for house sales within 600 m of the water), roads-icw.json (county road lines that touch the waterway and Waccamaw polygons), listings-water.json (CRM pull, aggregate use only) and nfip-policies-sf.json (OpenFEMA rows).

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_county.py          # SALES defaults to ../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json
python3 -I pull_listings.py
python3 -I pull_fema.py
python3 -I pull_tides.py .
sh pull-suggestions.sh > raw/google-suggestions.txt
python3 -I analyze.py .
```

analyze.py needs shapely 2. findings.json carries no names, addresses, PINs, deed book and page, or MLS numbers.
