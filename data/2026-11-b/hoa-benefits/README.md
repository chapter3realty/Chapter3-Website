# Data for /hoa/benefits/ (batch 2026-11-b)

Every number the page prints comes from `findings.json` or a chart file here. Ledger: Blog-Brain `batches/2026-11-b/hoa-benefits/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every derived number: The Farm's fee per home by budget line; Myrtle Trace and Del Webb at Grande Dunes per home; one staffed gate at the local guard wage; public pool and gym prices; houses with and without a fee (price, land, boat parking) | build_findings.py |
| chart-farm-fee.json | Where The Farm's $107 goes, dollars a home a month, 2027 approved budget | build_findings.py |
| chart-pool.json | A year of the pool through the fee against a year at a public pool and gym | build_findings.py |
| chart-price-by-beach.json | Asking price per square foot with and without a fee, by distance from the beach, houses built 2000 or later | build_findings.py |
| chart-complaints.json | Horry County HOA complaints to SC Consumer Affairs by concern, 2022 to 2025 (copied from from-2026-11-a, unchanged) | batch 2026-11-a build_findings.py |
| rerun/ | Fresh pull of houses for sale, 2026-11-10: raw/houses-active.json, price-test.json, counts.json, logs | pull_houses.py, analyze_houses.py, pull_counts.py (python3 -I <script> rerun) |
| raw/farm-budget-summary.pdf, .txt | The Farm @ Carolina Forest HOA, "2027 Budget - Approved" (2026 and 2027 columns), read 2026-11-10. The 2026 file the 2026-10-b ledger used now returns 404. | curl, pdftotext -layout |
| raw/bls-oews-34820-2026-11-10.json | BLS OEWS May 2025, Myrtle Beach-Conway-North Myrtle Beach MSA: security guards (33-9032: employment, median hourly, median annual) and groundskeepers (37-3011: employment, median hourly). The sixth series (373012, datatype 13) is another occupation and is not used | BLS public API v2 (series OEUM0034820000000 + occupation + datatype) |
| raw/barefoot-*.html, .txt | Barefoot Resort Residential Association: home, amenities and single-family pages, read 2026-11-10 (robots.txt allows) | curl |
| raw/mb-rec-memberships-2026-11-10.*, raw/nmb-afc-membership-2026-11-10.* | City recreation membership prices, read 2026-11-10 (byte-identical to the 2026-11-04 copies) | curl |
| raw/google-suggestions-2026-11-10.txt | Google suggestions for 62 seed queries | pull-suggestions.sh |
| from-2026-11-a/ | The stopped 2026-11-a research for this page: scripts, raw files and outputs, copied unchanged from that batch's web.patch | batch 2026-11-a |

Inputs read from other folders, not pulled again: `../hoa/budgets.json` (Del Webb at Grande Dunes 2025 and Myrtle Trace 2026 budget lines).

Rerun, in order: `python3 -I pull_houses.py rerun`, `python3 -I analyze_houses.py rerun`, `python3 -I pull_counts.py rerun`, `sh pull-suggestions.sh > raw/google-suggestions-<date>.txt`, `python3 -I build_findings.py .`. Listing counts change daily; rebuild the page from a rerun, never edit a number by hand.

Group notes: the house counts are asking prices of houses for sale (CRM map API over the CCMLS feed), in aggregate, Horry County ZIP codes, list price $50,000 or more, 600 to 6,000 square feet. Not sales. No address, MLS number, firm or coordinate is saved.
