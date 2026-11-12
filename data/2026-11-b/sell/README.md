# Data for /sell/ (batch 2026-11-b)

Every number on the hub comes from `findings.json`, which `build_findings.py` builds. Ledger: Blog-Brain `batches/2026-11-b/sell/facts.md`. No names, addresses, parcel numbers or book and page are kept here.

| File | What | Made by |
|---|---|---|
| findings.json | The page's numbers: the CCAR market now (houses and condos), accepted offers by month, days to an offer and share of list price by CCAR area (Jan to Sep 2026), what investors paid and resold for (Horry deeds), the labelled $350,000 example, costs and price cuts read from the net-proceeds files | build_findings.py |
| ccar-2026-09.json | CCAR Monthly Indicators and Local Market Updates for September 2026, parsed (overview, 12 monthly series, 13 areas), with each file's sha256 | parse_ccar.py |
| offmarket.json | Horry County resales Oct 2025 to Sep 2026: company buyers against people (price over county value), and houses bought by a company and sold again in the window | deeds_offmarket.py |
| RAW/ccar-monthly-indicators-2026-09.pdf (outside the repo; the report is (c) ShowingTime Plus) | CCAR "October 2026 Market Report" (data month September 2026, "Current as of October 10, 2026") | curl https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_Monthly_Market_Report.pdf |
| RAW/ccar-local-updates-2026-09.pdf (outside the repo) | CCAR "October 2026 All Cities" (Local Market Update, September 2026) | curl https://www.ccarsc.org/clientuploads/2026_Market_Stats/October_2026_All_Cities.pdf |
| raw/t40c057.html | SC Code Title 40 Chapter 57 (real estate licensing; wholesaling) | curl https://www.scstatehouse.gov/code/statmast?title=40&chapter=57 |
| raw/google-suggestions.txt | Google search suggestions for 25 seller searches (2026-11-09) | pull-suggestions.sh |
| raw/gsc-seller-queries.txt | Search Console lines for /sell/ and the seller queries, from the owner's two exports of 2026-11-06 | grep |

Inputs reused from siblings (not copied): `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (13,194 recorded home sales, Oct 2025 to Sep 2026), `data/2026-11-b/sell-net-proceeds/findings.json` and `listings.json`.

To rerun (RAW = a scratch folder outside the repo; the weekly deed files carry names and stay there):

```
RAW=$RAW python3 -I data/2026-11-b/sell/parse_ccar.py data/2026-11-b/sell   # after curl of the two CCAR files into $RAW
SALES=data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json RAW=$RAW python3 -I data/2026-11-b/sell/fetch_landuse.py
SALES=data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json LANDUSE=$RAW/landuse-107.json DEEDS=<folder of deeds-YYYY-MM-DD.json from that sibling's pull_deeds.py> python3 -I data/2026-11-b/sell/deeds_offmarket.py data/2026-11-b/sell
python3 -I data/2026-11-b/sell/build_findings.py .
```

This run: deeds from `scratchpad/wf2/sell-fsbo/verify/deeds/` (53 weekly AcclaimWeb files, 2025-10-01 to 2026-09-30); land use read 2026-11-09 into `scratchpad/sell-raw/landuse-107.json`; the CCAR PDFs are in `scratchpad/sell-raw/` (sha256 in ccar-2026-09.json).
