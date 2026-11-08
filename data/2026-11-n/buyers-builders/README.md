# Data for /buyers/new-construction/builders/ (batch 2026-11-n)

Pulled 2026-11-08. Every number the page prints is in `findings.json`, written by `analyze.py` from the raw files here. Run each script from any folder with `python3 -I <script> <this dir> [...]`.

| Step | Script | Writes | Source |
|---|---|---|---|
| Search demand | `pull-suggestions.sh` | `raw/google-suggestions.txt` | Google suggest endpoint, 73 seed queries |
| Deeds | `pull_deeds.py` | `raw/deeds-co.json` | Horry County Register of Deeds, AcclaimWeb, DEED (001), recorded 2025-11-01 to 2026-10-31, week by week (30,333 deeds). A party name is kept only when it reads as a business; a person's name is saved as "". Same search as `data/2026-10-d/buyers-new-construction/pull_deeds.py`, one month later. |
| Parcels and postal city | `pull_parcels.py` | `raw/parcels.json`, `raw/postal-city.json` | Horry County GIS MapServer layer 24 (parcels: land use, values, owner mailing state, center point; no owner name or street) and layer 22 (address points: postal city only) |
| Listings | `pull_listings.py` | `raw/listings-calls.json` here; the pin file goes to the scratch folder only | Chapter3 CRM public map API (CCMLS feed), `has=new_construction,county_horry`, house, townhouse, condo, and each "Built by" filter. The pin file holds the listing firm, which this repo never keeps; only aggregates reach `findings.json`. |
| Findings | `analyze.py` | `findings.json` | the files above. Builder sales by builder, price range, towns, plat names; town table; listings by builder (asking prices) |
| Cross-check | `check_chesapeake.py` | prints only | listings marked "Built by Chesapeake Homes" against parcels the five community companies sold |
| Annual reports | (curl, EDGAR) | `raw/sec/*.txt` | text of each builder's latest 10-K (and the UHG 8-K of 2026-05-04), for the lender and warranty rows |

MLS data: only active listings, counted in aggregate (counts, medians, ranges). No sold MLS data. Sale prices come from county deeds. No address, MLS number, listing firm or photo is kept or printed.

To rerun the listings: `python3 -I pull_listings.py <this dir> <scratch>/listings-full.json`, then `python3 -I analyze.py <this dir> <scratch>/listings-full.json`. Without the second argument, `analyze.py` writes the deed findings only.
