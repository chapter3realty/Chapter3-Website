# Data for /invest/str-tools/ (batch 2026-10-d)

Read 2026-11-01. Every number on the page that is a count or a calculation comes from `findings.json`. Rerun in order:

1. `sh pull-suggestions.sh > raw/google-suggestions-2026-11-01.txt` (demand; for the must-answer list only)
2. `sh pull-airroi.sh` then `python3 -I parse_airroi.py .` → `raw/airroi-parsed.json` (eight AirROI market pages, 12 months to September 2026)
3. `python3 -I pull_listings.py .` → `raw/listings-str.json` (CRM active listings: counts, median asking price, HOA-fee band; no address, MLS number or firm kept). About 310 calls at 2.1 s.
4. `python3 -I pull_hoa_incl.py .` → `raw/listings-hoa-incl.json` (what the fee covers, counts only)
5. `sh pull-noaa.sh` then `python3 -I noaa_months.py .` → `raw/noaa-months.json` (Springmaid Pier, station 8661070)
6. `raw/horry-tax-levy-2026.pdf` (Horry County Auditor, certified 2026 levy) → `pdftotext -layout` → `.txt`; `raw/scdor-st575.pdf` likewise
7. `python3 -I compute.py .` → `findings.json`

The ledger is `Blog-Brain/batches/2026-10-d/invest-str-tools/facts.md`.
