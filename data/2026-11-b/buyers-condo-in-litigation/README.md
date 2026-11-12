# Data for /buyers/condo-in-litigation/ (batch 2026-11-b)

Read 2026-11-10. Ledger: `Blog-Brain/batches/2026-11-b/buyers-condo-in-litigation/facts.md`. Never type a count into the spec; read `findings.json` and the chart files.

## Scripts (run from anywhere: `python3 -I <script> <this folder>`)
- `pull-suggestions.sh`: Google search suggestions, curl's own client string. Output `raw/google-suggestions-2026-11-10.txt`.
- `pull_repose_ages.py`: condos for sale by building age, from the Chapter3 map API (CCMLS active listings). Counts only. Output `repose-ages.json`.
- `pull_case_buildings.py`: units and last-sale dates at the four regimes named in court records, from Horry County parcel layer 24. Reads LegalDescr, LandUseCode, MarketImprv, SaleDate only; keeps no PIN, owner, unit number or value. Output `case-buildings.json`.
- `build_findings.py`: writes `findings.json`, `chart-timeline.json` (the case years, from the ledger rows) and `chart-ages.json`.

## Raw sources (`raw/`)
- `27698.pdf/.txt`: S.C. Supreme Court Op. 27698, Harleysville v. Heritage Communities (Magnolia North and Riverwalk), refiled July 26, 2017.
- `4943.htm/.txt`: S.C. Court of Appeals Op. 4943, Magnolia North POA v. Heritage Communities, filed Feb. 15, 2012.
- `COA-4888.htm/.txt`: Op. 4888, Pope and Riverwalk at Arrowhead Country Club POA v. Heritage Communities, filed Sept. 14, 2011.
- `COA-6124.pdf/.txt`: Op. 6124, Wedgewood Condominium Association v. Centex Homes, filed Sept. 24, 2025 (official). `wedgewood-hallapproved.*` is a mirror, not used as a source.
- `SC-26909.htm/.txt`: S.C. Supreme Court Op. 26909, Crossmann Communities v. Harleysville, refiled Aug. 22, 2011.
- `COA-3227`, `COA-3884`: Horry County association cases that are not about the building (management contract; a fire). Read and set aside.
- `renaissance-complaint.pdf/.txt`: complaint, Liberty Property Holdings SC v. Richardson, D.S.C. 4:22-cv-03556, filed 10/13/22 (copy hosted by classaction.org; the court's file stamp is on every page).
- `fannie-b4-2.1-03.txt`: copied from `../invest-non-warrantable-condos/raw/dl/` (Selling Guide B4-2.1-03, 11/04/2026).
- `freddie-5701-3.json`: copied from `../invest-non-warrantable-condos/raw/verify/` (Freddie Mac Guide 5701.3).
- `hud-4000-1-u18-single-unit-litigation.txt`, `hud-4000-1-u18-project-approval-litigation.txt`: excerpts of HUD Handbook 4000.1, Update 18 (issued Aug. 12, 2026). The 14 MB PDF is not kept: https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf
- `usalliance-condo-questionnaire.pdf`, `usalliance-q.txt`: Fannie Mae Form 1076 / Freddie Mac Form 476, March 2016 version, as hosted by a credit union. Fannie's own copy (and the December 2021 version) returned 403 or did not connect.
- `screc-disclosure-2023.pdf/.txt`: S.C. Real Estate Commission disclosure statement and HOA addendum, effective 6/1/2023.
- `t15c003.html/.txt`: S.C. Code Title 15 Chapter 3 (15-3-530, 15-3-640, 15-3-670).
- `horry-clerk-of-court.html/.txt`: the Clerk of Court page that links the Public Index.

## Limits
- **No count from the court index.** publicindex.sccourts.org answers scripted requests with HTTP 400, and its terms are reported to bar scrapers. No attempt was made to get around it. A count of association suits needs a person searching the index by name (PLAN.md, "for the lead").
- **Last sale only.** The parcel layer keeps each parcel's last recorded sale date. "Changed hands in the past year" counts units whose last deed is within 365 days of the pull; it includes any recorded transfer, not only market sales. It undercounts nothing that matters: a unit sold twice in a year is still one unit.
- **Wedgewood tie.** The opinion names the association and Horry County, a nine-building complex built 2000 to 2001; the parcel layer has one Wedgewood regime (North Myrtle Beach market area, 111 units). The tie is by name and county; the verifier should confirm (for example, the opinion's "eleven-unit" may be "111-unit").
- **Riverwalk.** The opinion gives 228 units in 19 buildings. The layer's regimes "RIVERWALK AT ARROWHEAD" and "RIVERWALK @ ARROWHEAD" hold 216 units with a building value. Riverwalk II and the Riverwalk townhomes are other regimes and are left out.
