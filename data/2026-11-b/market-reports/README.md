# Data for /market-reports/ (batch 2026-11-b)

Every number on the hub comes from `market.json`, which `build_market.py` builds. Ledger: Blog-Brain `batches/2026-11-b/market-reports/facts.md`.

| File | What | Made by |
|---|---|---|
| market.json | CCAR September 2026, houses and condos: the numbers now (Sep and Jan to Sep 2026), the three-year bars (Sep and Jan to Sep, 2024 to 2026: median price, accepted offers, closed sales, days to an offer; Sep only: homes for sale and months of supply), the 12 monthly series (median, months of supply, days, homes for sale), and the derived ranges and changes | build_market.py |
| raw/google-suggestions.txt | Google search suggestions for 20 market searches (2026-11-10) | pull-suggestions.sh |
| raw/ccar-marketstats-2026-11-10.html | CCAR's market statistics page, with the two links read | curl https://www.ccarsc.org/pages/marketstats/ |
| raw/ccar-mls-faqs-2026-11-10.html | CCAR's MLS FAQ (the two-county scope) | curl https://www.ccarsc.org/pages/mls-faqs/ |
| raw/ccar-check-2026-11-10.txt | Which CCAR files were posted on 2026-11-10, and their sha256 | curl |
| RAW/October_2026_Monthly_Market_Report.pdf (outside the repo; (c) ShowingTime Plus) | CCAR Monthly Indicators, September 2026, "Current as of October 10, 2026", sha256 1c71eff8... | curl https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_Monthly_Market_Report.pdf |

Inputs reused from siblings (not copied): `data/2026-11-b/sell/ccar-2026-09.json` (the seller hub's parse of the same PDF; build_market.py asserts the hash and that every cell it reads agrees), `data/2026-10-d/sell-home-value/findings.json` (the deed medians, ledger row 14).

To rerun (RAW = a scratch folder outside the repo; this run used `scratchpad/mr-raw/`):

```
curl -sS -o $RAW/October_2026_Monthly_Market_Report.pdf https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_Monthly_Market_Report.pdf
RAW=$RAW python3 -I data/2026-11-b/market-reports/build_market.py data/2026-11-b/market-reports .
```

When CCAR posts a new month, the hash check fails on purpose. Read the new file, re-run the seller hub's parse_ccar.py with the new file names, update the expected hash and the ledger rows, then re-run this script.
