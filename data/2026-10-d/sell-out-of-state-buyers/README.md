# Data for /sell/out-of-state-buyers/ (batch 2026-10-d)

Every number on the page comes from these files. Ledger: Blog-Brain batches/2026-10-d/sell-out-of-state-buyers/facts.md.

| File | What | Made by |
|---|---|---|
| out-of-state-buyers.json | Every kept home sale (deed book/page, PIN, price, record date, builder flag, buyer's tax-bill state, condo flag, Census place, point) and every summary | analyze.py |
| out-of-state-buyers-summary.json | The summaries only (charts read this) | analyze.py |
| irs-horry-inflow.json | IRS SOI 2022-2023 county-to-county moves into Horry County | irs_migration.py |
| acs-origin-counties.json | ACS 2024 5-year median home value (B25077) and median real estate taxes paid (B25103), Horry and the 10 largest origin counties outside SC | acs_counties.py |
| raw/stock-by-state*.json | Every residential parcel with a building, counted by owner mailing state (all, condo, other) | one ArcGIS statistics query each (URL in the ledger) |
| raw/deeds-weeks.json | The 53 weekly AcclaimWeb searches and their totals (30,339 deeds) | pull_deeds.py |

To rerun: `RAW=<scratch dir> python3 -I pull_deeds.py <this dir> 2025-10-01 2026-09-30`, then fetch_parcels.py, analyze.py, fetch_points.py, analyze.py again, irs_migration.py (needs countyinflow2223.csv from irs.gov in RAW), acs_counties.py. The raw deed rows and parcel records carry owner names, so they are kept out of the repo; the output files leave names out.
