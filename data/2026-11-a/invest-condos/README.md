# data/2026-11-a/invest-condos

Research data for /invest/condos/ (batch 2026-11-a). Ledger: Blog-Brain `batches/2026-11-a/invest-condos/facts.md`. Pulled 2026-11-02.

| File | What | Made by |
|---|---|---|
| `zhvi-compare.json` | Zillow Home Value Index, Myrtle Beach metro, condo/co-op against single-family, monthly 2001-11 to 2026-09: the 2006 peak, the trough, the recovery month, changes, the condo-to-house ratio, and a December series for the chart | `python3 -I zhvi_compare.py .` |
| `findings.json` | Every count from public records: Horry County condo units (stock, 4 percent share, owner mailing state, units per regime, by area), condo and other home sales recorded 2025-10-01 to 2026-09-30 (median, quartiles, under $200,000, by area, busiest regimes), FEMA zone at each condo sale point | `RAW=<scratch> DEEDS=<file> python3 -I analyze.py .` |
| `listings.json` | Condos, houses and townhouses for sale in Horry County from the CRM's public map API, counted in aggregate (no address, MLS number, firm or photo): counts, medians found by halving, price and HOA fee thresholds, listing flags, the worked example's group, oceanfront buildings by mailing city. Every API URL called is in `calls`. | `python3 -I pull_listings.py .` |
| `raw/ratio-counts.json` | Four ArcGIS count queries on county parcel layer 24: condo units and other homes, all and at the 4 percent ratio, with URLs | `python3 -I count_ratio.py .` |
| `raw/zhvi-metro-*-mb.csv` | Header plus the Myrtle Beach, SC and United States rows of Zillow's metro ZHVI files (condo, sfr, sfrcondo; mid tier, smoothed, seasonally adjusted) | curl files.zillowstatic.com |
| `raw/acs2024-B25002-*.json`, `raw/acs2024-B25004-*.json` | ACS 2020-2024 5-year occupancy and vacancy status, Horry County and Myrtle Beach city | curl data.census.gov/api/access |
| `raw/t12c043.txt`, `raw/t27c031.txt` | S.C. Code Title 12 Chapter 43 and Title 27 Chapter 31 (Horizontal Property Act), scstatehouse.gov | curl |
| `raw/tax-levy-2026.txt` | Horry County Auditor, 2026 tax levies, certified 7/27/2026 | curl, pdftotext |
| `raw/fnma-b4-2.1-03.txt` | Fannie Mae Selling Guide B4-2.1-03, Ineligible Projects (08/05/2026), guide published October 7, 2026 | curl |
| `raw/google-suggestions.txt` | Google search suggestions for 43 seed queries | `sh pull-suggestions.sh` |

Inputs from other folders: Horry County deeds recorded 2025-10-01 to 2026-09-30, `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (13,194 kept home sales; ships in Blog-Brain `batches/2026-10-d/sell-out-of-state-buyers/web.patch`).

Kept out of the repo (PINs, per-parcel owner states, size), in the scratch RAW folder: `condo-parcels.json` (every condo unit parcel, layer 24: PIN, legal description, tax district, land use, values, owner mailing state, sale date; no owner name or street), `flood-points.json` (layer 19 zones at each sale point), `condo-sales-subset.json`.

Definitions:
- **Condo unit:** a residential parcel (land use 1xx) with a building value whose county legal description contains "HPR" (horizontal property regime, a condo under S.C. Code Title 27 Chapter 31).
- **Main home:** the parcel's assessed value is under 5 percent of its taxable value, which is the 4 percent legal-residence ratio.
- **Area:** county tax district 550 is North Myrtle Beach; 88x and 89x are the City of Myrtle Beach; 660 Surfside Beach; 110 Conway; the rest is outside city limits or in other towns. The codes were matched to places by joining the deed file's Census place to each sold parcel's tax district.
- **Flood zone:** the FEMA zone at the sold parcel's center point. Layer 19 maps only VE, AE, A and the shaded 0.2 percent zone; a point with no polygon is outside the mapped flood areas (zone X).
