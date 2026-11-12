# Data for /invest/condo-buildings/ (batch 2026-11-b)

Every number the page prints comes from `findings.json` (built by `build_findings.py`). Ledger: Blog-Brain `batches/2026-11-b/invest-condo-buildings/facts.md`.

| File | What | Made by |
|---|---|---|
| buildings.json | The 47 buildings: slug, name, town, the MLS subdivision words used to find their listings, and whether the July page listed them | typed from the July page, `raw/subdivision-probe.json` and the subdivision names in `../../2026-11-a/invest-rental-program-vs-airbnb/raw/by-building.json` |
| building-fees.json | Per building, condos for sale now: count, the middle monthly HOA fee and its middle half (bisection on hoaMax to $5), the middle asking price, bedrooms, size, four feature flags (fee pays electric, pets allowed, indoor pool, oceanfront building), and the street addresses the listings carry. Aggregates only. Every API URL called is in `calls`. | `pull_building_fees.py` (the CRM's public map API) |
| regimes.json, regimes-out.json | The county regime names tied to each building; per building, condo units in the county parcel layer and the sales recorded 2025-10-01 to 2026-09-30 (count, middle, quartiles) | `pull_regimes.py` (Horry County GIS layer 24; deeds from `../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json`) |
| findings.json, chart-fees.json, chart-sales.json, table.json | What the page prints, and the chart and table files | `build_findings.py` (also reads `../hoa/fees-by-kind.json`) |
| raw/oceanfront-addresses.json | All 1,106 oceanfront-building condos for sale grouped by building street address (count and mean point only) | `pull_addresses.py` |
| raw/subdivision-probe.json | For each candidate subdivision word: listings it finds and their street addresses | `probe_subdivisions.py` |
| raw/building-points.json, raw/parcels-by-building.json | A box query of the county parcel layer around each building's mean listing point, grouped by regime name (to find the regime names) | `pull_parcels.py` |
| raw/resort-pages/*.html | Resort home pages read 2026-11-09 for the amenity lines (several resort sites refuse the request; those are listed in the ledger as unread) | curl |
| raw/faa-dof-heights.json, raw/faa-dof-sc-bldg-33N.txt | Building heights (feet above ground) from the FAA Digital Obstacle File, currency 11/02/26: every DOF building within 300 m of each building's mean listing point, and the tallest on the strip; the text file keeps the DOF header and the South Carolina building lines between 33.50 and 33.95 N (the full DOF.DAT is 86 MB) | `dof_heights.py` (https://aeronav.faa.gov/Obst_Data/DAILY_DOF_DAT.ZIP) |
| raw/county-unit-floors.json | Highest floor per building, read from the unit numbers in the county parcel layer (counts per floor only; no PIN, owner or value) | `unit_floors.py` (Horry County GIS layer 24) |
| raw/wow-pages/*.html | Resort, club, pier and state pages read 2026-11-10 for the wow lines (ledger rows from 43) | curl |
| raw/google-suggestions-2026-11-09.txt | Google suggestions for the must-answer list | `pull-suggestions.sh` |

Rerun, in order: `python3 -I pull_building_fees.py .` (about 34 calls a building at 2.1 s or more), `python3 -I pull_regimes.py . <website root>`, `python3 -I build_findings.py .`. Listing counts change daily; a rerun gives new numbers and the page is rebuilt from them, never edited by hand.

Never in these files: an MLS number, a unit number, a single listing's price or address, a firm, a PIN or an owner. Street addresses are kept only where two or more listings share one (a building); single listings at other addresses are counted as "other addresses, one listing each" (scrubbed 2026-11-09; the pull scripts should apply the same rule on a rerun).
