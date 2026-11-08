# Data: /buyers/pool-homes/ (batch 2026-11-n)

Pulled 2026-11-08. Ledger: Blog-Brain `batches/2026-11-n/buyers-pool-homes/facts.md`.

| File | What | Made by |
|---|---|---|
| `raw/google-suggestions.txt` | Google search suggestions for 55 seed queries | `pull-suggestions.sh` |
| `listings.json` | Houses for sale in Horry County with and without a private pool: counts, medians by counting, price bands, size bands, traits, by town; every API call and its echo | `pull_listings.py` |
| `listings-extra.json` | Houses with a community pool and no private pool: count, median ask, HOA fee | `pull_extra.py` |
| `water-temp.json`, `raw/coops-8661070-water-temp-*.json` | Springmaid Pier ocean temperature, monthly means 2023 to 2025 (collected, not planned for the page) | `pull_water_temp.py` |
| `neighborhoods.json` | Review round 1: five neighborhoods with a shared pool (houses for sale, community pool, private pool, middle ask) and townhouses with a community pool | `pull_neighborhoods.py` |
| `findings.json` | Every derived number the page's tables and chart use | `analyze.py` |
| `raw/filters.json` | The CRM's public filter list on the day (keys and counts) | curl https://chapter3realty.com/homes/api/filters |
| `raw/normals-USW00093718.csv` | NOAA 1991-2020 monthly normals, North Myrtle Beach airport | curl NCEI |
| `raw/pool-fence-affidavit-2021-ispsc.*` | Horry County Code Enforcement, Pool Fence Affidavit (2021 ISPSC section 305) | curl |
| `raw/R.61-51.*`, `raw/des-*.{html,txt}` | SC DES public pool regulation and pages | curl |
| `raw/t06c009.*`, `raw/t40c059.*`, `raw/t12c037-from-2026-10-d-sell-home-value.html` | SC Code chapters (the last reused from batch 2026-10-d) | curl |
| `raw/llr-rbi-faq.*`, `raw/ashi-sop.*`, `raw/naic-pools.html` | LLR home inspector FAQ, ASHI Standard of Practice, NAIC consumer page | curl |

Nothing here names an address, MLS number, listing firm or owner. Re-run: `python3 -I pull_listings.py . && python3 -I pull_extra.py . && python3 -I analyze.py .` from this folder (run from another directory with the full path, as the scripts take the folder as an argument).
