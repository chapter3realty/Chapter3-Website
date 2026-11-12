# Data for /invest/airbnb-income/ (batch 2026-11-b)

Read 2026-11-09. Every number on the page comes from `findings.json`, made by `analyze.py`. Nothing here is pulled from AirROI: the gross figures are the site's one file, `data/str-market.json` (2026-11-03 refresh, AirROI's October 1, 2026 update, 12 months to September 2026). The size rows, the months and AirROI's cost lines are not in that file, so `analyze.py` reads them from the same update as saved by /invest/str-tools/ (`data/2026-10-d/invest-str-tools/raw/airroi-parsed.json`) and stops if the two disagree on any shared figure (revenue, occupancy, nightly rate, listings, RevPAR, the four monthly tiers, peak and low month).

Rerun: `python3 -I analyze.py <website-root>` → `findings.json`, `str-market-add.json` (a proposed size-and-month block for `data/str-market.json`; the lead decides).

- `raw/google-suggestions-2026-11-09.txt` from `sh pull-suggestions.sh` (demand only).
- `raw/gsc-airbnb-queries.txt`: lines of the owner's two Search Console exports (28 days; Oct 27 to Nov 6 against Oct 16 to 26) for this topic, and the page rows.

The worked condos repeat /invest/str-tools/'s arithmetic (its `RUN_SRC`) on its two cases, and `analyze.py` stops if they drift from what that page prints. Ledger: Blog-Brain `batches/2026-11-b/invest-airbnb-income/facts.md`.
