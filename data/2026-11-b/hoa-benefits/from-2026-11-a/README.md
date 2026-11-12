# Data for /hoa/benefits/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/hoa-benefits/facts.md`.

| File | What | Made by |
|---|---|---|
| raw/houses-active.json | Every house for sale from four map API searches (all, no fee, built 2000+, built 2015+), split into price bands: ZIP, list price, square feet, lot acres, distance-to-beach band, and which searches returned it. No MLS number, address, firm or coordinate. | pull_houses.py (2026-11-04) |
| price-test.json | Asking price per square foot and lot size, with a fee against no fee: county, ZIP by ZIP, by age, by lot size and by distance from the beach (rows 9 to 12) | analyze_houses.py |
| counts.json | Houses with a fee by year built; house features with and without a fee; every URL called (rows 6, 8) | pull_counts.py (2026-11-04) |
| condo-fees.json | Condo fee medians, oceanfront buildings against the rest, $5 steps (row 2) | pull_condo_fees.py (2026-11-04) |
| prices.json | Public pool and gym prices read from the saved city pages (row 13) | extract_prices.py |
| scdca-concerns.json | Horry County HOA complaints to SC Consumer Affairs by concern, 2022 to 2025 (row 25). Counts only. | scdca_concerns.py (reads ../../2026-10-d/hoa-special-assessments/raw/scdca-legislative-*.xlsx) |
| findings.json, chart-*.json | Every derived number and the chart data the spec reads | build_findings.py |
| raw/nmb-afc-membership.html, raw/nmb-afc-home.html | North Myrtle Beach Aquatic & Fitness Center pages, read 2026-11-04 | curl |
| raw/mb-rec-memberships.html, raw/mb-pepper-geddings.html | City of Myrtle Beach recreation pages, read 2026-11-04 | curl |
| raw/fnma-b7-3-03.html, .txt | Fannie Mae Selling Guide B7-3-03 (08/05/2026), read 2026-11-04 (row 21) | curl |
| raw/clarke-freedman-2019.txt | Clarke and Freedman (2019), text of the full paper posted by the Minnesota Legislative Coordinating Commission (row 7). The 8 MB PDF stays out of the repo (scratch `wf2/hoa-benefits/`). | curl, pypdf |
| raw/google-suggestions-2026-11-04.txt | Google suggestions for 51 seed queries | pull-suggestions.sh |

Reused inputs: `../../2026-10-d/hoa-hoa-vs-poa/fees-by-type.json` and `has-with-fee.json` (typical fee, what it includes), `../hoa-tax-deductible/includes.json` (oceanfront inclusions), `../buyers-cost-to-own/ahs-2023-replacements.json` (roof cost), statutes in `../../2026-10-d/hoa-special-assessments/raw/`.

Rerun, in order: `python3 -I pull_houses.py .` (about 280 calls), `python3 -I analyze_houses.py .`, `python3 -I pull_counts.py .`, `python3 -I pull_condo_fees.py .`, `python3 -I extract_prices.py .`, `python3 -I scdca_concerns.py . ../../2026-10-d/hoa-special-assessments/raw`, `python3 -I build_findings.py .`. Listing counts change daily; a rerun gives new numbers and the page must be rebuilt from them, not edited by hand.

Note on the API: a search that matches nothing returns nearby homes with its filters dropped (a `closest` block). pull_houses.py skips those replies.
