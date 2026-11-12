# Data for /invest/cash-to-close/ (batch 2026-11-b)

Ledger: Blog-Brain `batches/2026-11-b/invest-cash-to-close/facts.md`. The spec reads numbers from `example.json` only.

- `hmda_loan_costs.py` -> `hmda-2025-loan-costs.json`. Input: HMDA 2025, Horry County purchase loans, https://ffiec.cfpb.gov/v2/data-browser-api/view/csv?years=2025&counties=45051&actions_taken=1&loan_purposes=1 (10,096 rows; sha256 9733f3559bb4fb1f751eebc6904dbd1a73fb36a0e100f6f95470d443c5d2d0bd; not kept here, 3.9 MB).
- `pull_strip_counts.py` -> `strip-counts.json`; `pull_band_fees.py` -> `band-fees.json`. CRM map API, aggregate counts only.
- `build_example.py` -> `example.json`: the worked example, the reserves line, the chart rows. Run `python3 -I build_example.py .`
- `pull-suggestions.sh` -> `raw/google-suggestions-2026-11-10.txt`.
- `raw/`: Fannie Mae B3-4.1-01, 12 CFR 1024.17, SC Code 8-21-310, Freddie Mac LTV page (text copies read 2026-11-10).
