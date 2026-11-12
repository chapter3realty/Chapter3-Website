# Data for /buyers/new-construction/ (batch 2026-10-d)

Pulled 2026-11-01. Every number on the page is computed by a script here from a raw file here. Run from any folder with `python3 -I <script> <this dir>`.

| Step | Script | Writes | Source |
|---|---|---|---|
| Listings | `pull_listings.py` | `raw/listings.json` | Chapter3 CRM public map API (CCMLS feed): new-construction houses and townhouses, houses built 2016 to 2023 not flagged new, every house, and filter totals. Aggregate only; no street, photo or firm saved. |
| County line | (curl, in the ledger) | `raw/horry-county-boundary.json` | Census TIGERweb, county 45051 |
| Listing findings | `build_listings.py` | `findings-listings.json` | share new by town, medians, the matched 1-mile comparison |
| Deeds | `pull_deeds.py` then `slim_deeds.py` | `raw/deeds-slim.json` | Horry County Register of Deeds, AcclaimWeb, DEED (001), recorded 2025-10-01 to 2026-09-30, week by week (30,339 deeds). Person names are blanked in the kept file; the full pull is not kept. |
| Parcels | `pull_parcels.py` | `raw/parcels.json` | Horry County GIS MapServer layer 24, for every parcel on a priced deed (18,275). Owner mailing state only, no owner name or street. |
| Deed findings | `build_deeds.py` | `findings-deeds.json` | builder share of home sales, builders by count, building value still zero by month, county value against price |
| Flood | `fetch_flood.py` then `build_flood.py` | `findings-flood.json` | Horry County GIS layer 19 (FEMA zones), SFHA only. `raw/flood-sfha.json` (5.6 MB) is not kept; rerun `fetch_flood.py`. |
| Census | `pull-acs.sh` | `raw/acs-ACSDT1Y2024.B25034.json` | ACS 1-year 2024, year structure built, Horry County |
| Census | (curl) | `raw/census-soc-avg_starttocomp_cust.xlsx` | Survey of Construction, months from start to completion |
| Search demand | (curl) | `raw/google-suggestions-2026-11-01.txt` | Google suggest endpoint |
| Build status | `pull_status.sh` | `raw/listings-status-totals.txt` | CRM filter totals: finished and never occupied, still being built |
| Communities (review round 1) | `build_communities.py` | `findings-communities.json`, `raw/county-municipalities.json`, `raw/county-highways.json`, `raw/community-plat-parcels.json`, `raw/community-postal-city.json` | the verified builder deeds grouped by the subdivision in each deed memo; county GIS layers 31, 17, 24 and 22 (postal city only); coastline from Blog-Brain tools/geo. Rerun without --fetch to use the saved layers. |
| HOA fee (review round 1) | `pull_hoa.sh` | `raw/listings-hoa-totals.txt` | CRM filter totals for new houses: hoa=0 and hoaMax steps, whole feed, aggregate only |
| Charts | `make_charts.py` | `chart-share-by-town.json`, `chart-tax-lag.json`, `chart-new-vs-nearly-new.json` | the findings files above |

MLS data: only active listings, counted in aggregate (counts and medians). No sold MLS data is used. Sale prices come from county deeds.
