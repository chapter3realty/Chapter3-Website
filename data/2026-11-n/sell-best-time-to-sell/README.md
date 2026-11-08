# Data for /sell/best-time-to-sell/ (batch 2026-11-n)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-n/sell-best-time-to-sell/facts.md`. Charts read `chart-months.json` (made from the two files above it), never typed.

| File | What | Made by |
|---|---|---|
| findings.json | Horry County home resales by month of recording, July 2020 to October 2026: counts and middle (median) prices, all homes, houses, condos, and builders' new homes kept apart; each month's share of its year (2021-2025); each month's middle price against the 13 months around it; out-of-state buyers by month; daily recordings around Hurricane Ian (2022) and Tropical Storm Debby (2024); the filter counts | analyze.py |
| zillow-months.json | Zillow Research metro measures for "Myrtle Beach, SC", averaged by calendar month (2018-2025 without 2020 and 2021), with the latest month and the month a year earlier | zillow_months.py |
| chart-months.json | One row per month with the values the charts use | build_charts.py |
| raw/zillow-*.csv | Header, United States row and Myrtle Beach, SC row of nine Zillow metro files (raw, not smoothed) | pull-zillow.sh |
| raw/google-suggestions.txt | Google search suggestions for 48 queries | pull-suggestions.sh |
| sources/ | Text of the Horry County Schools 2025-26 and 2026-27 student calendars and of the NHC tropical cyclone reports for Ian and Debby (pdftotext; the PDFs are at the URLs in the ledger), the NHC climatology page and IRS tax topics 409 and 701 (HTML) | downloaded 2026-11-08 |

To rerun (raw deed rows and parcel records carry owner names, so they stay outside the repo in RAW):

```
RAW=<scratch>/raw python3 -I pull_deeds.py <this dir> 2019-01 2026-10
RAW=<scratch>/raw python3 -I fetch_parcels.py [<older parcels.json to reuse>]
RAW=<scratch>/raw python3 -I analyze.py <this dir>
sh pull-zillow.sh && python3 -I zillow_months.py <this dir>
python3 -I build_charts.py <this dir>
```

The pull starts in January 2019, but the deed index carries a parcel number on nearly every deed only from July 2020 (about a third or less before), so analyze.py uses July 2020 on, and full years 2021 to 2025. The 2025-10 to 2026-09 parcel file of `data/2026-10-d/sell-out-of-state-buyers/` (in the scratchpad as wf2/sell-out-of-state-buyers/raw/parcels.json) was reused for 26,488 parcels; the rest were fetched 2026-11-08.

A same-home price check (sale price over the county's market value) was tried and dropped: for sales from 2023 on, the county's value equals the sale price on most parcels (a parcel is reappraised after an assessable transfer of interest), so the ratio is 1 and says nothing.
