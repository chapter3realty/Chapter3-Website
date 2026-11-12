# Data for /buyers/relocating/why-myrtle-beach/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/buyers-relocating-why-myrtle-beach/facts.md`. Charts and tables are built from the JSON files, never typed.

| File | What | Made by |
|---|---|---|
| irs-migration.json | IRS SOI county-to-county migration for Horry County, five filing-year pairs 2018-2019 to 2022-2023: totals in and out, by Census region (named rows plus "Other flows" lines, which add up to the IRS different-state total), top origin and destination counties with the reverse flow | irs_migration.py (raw/countyinflowYYYY.csv, raw/countyoutflowYYYY.csv from irs.gov) |
| census-pep.json | Census Bureau Vintage 2025 estimates: Horry County population 2020 to 2025, births, deaths, domestic and international migration; the metro's rank among 387 metro areas | census_pep.py (raw/co-est2025-alldata.csv, raw/cbsa-est2025-alldata.csv) |
| raw/sub-est2025_45.csv | Census Vintage 2025 city and town estimates for South Carolina (incl. "Balance of Horry County") | downloaded from www2.census.gov |
| acs.json | ACS 2024: place of birth (B05002, 1-year and 5-year), median age (B01002), moved from a different state (B07001), median home value (B25077), median real estate taxes (B25103) for Horry, SC and the US; B25077 and B25103 for eight more origin counties | acs_pull.py (data.census.gov API) |
| ../../2026-10-d/sell-out-of-state-buyers/acs-origin-counties.json | Sibling's ACS B25077 and B25103 for Horry and ten origin counties (reused, not pulled again) | that folder's acs_counties.py |
| zhvi-origins.json | Zillow Home Value Index (all homes, middle tier, Sept 2026) for Horry and the 16 largest out-of-state origin counties | zhvi_origins.py (raw/zhvi-county.csv from files.zillowstatic.com) |
| listings-counts.json | Houses and homes for sale now at or under each price line (CRM map API, aggregate totals only) | pull_listings.py |
| rfa-projection.json | SC Revenue and Fiscal Affairs Office Vintage 2023 projections, Horry County 2023 to 2043 | rfa_projection.py (raw/rfa-projections-components.xlsx) |
| raw/qcew-YYYY-AREA.csv | BLS QCEW annual averages, Horry County (45051) and US, 2019 and 2025 | curl from data.bls.gov/cew/data/api |
| raw/google-suggestions.txt | Google search suggestions for 42 seeds | pull-suggestions.sh |
| raw/census-pr-2026.html, raw/irs-migration-page.html, raw/t12c016.html, raw/lii26-2011.html | Source pages as read | curl |

Reused, not pulled again: `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers-summary.json` (12 months of county deeds by the buyer's tax-bill state), the verified rows of `batches/2026-11-a/buyers-retirees/facts.md` (SC retirement income tax and property tax), the weather page's NOAA rows (research/relocating/local-facts.md B6, B9).

The large public downloads in raw/ (IRS county files, Census county and metro files, Zillow county file) are cut to the rows the page uses by `trim_raw.py`; the scripts give the same output on the full files. Re-download the full files from the URLs above to check.

To rerun: `python3 -I irs_migration.py <this dir>`, `census_pep.py`, `acs_pull.py`, `zhvi_origins.py` (after irs_migration), `pull_listings.py` (after zhvi_origins), `rfa_projection.py`.
