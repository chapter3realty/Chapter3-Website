# Data for /market-reports/july-2026/ (batch 2026-11-b)

The dated archive report: June 2026 data. Every number on the page comes from `june.json`. Ledger: Blog-Brain `batches/2026-11-b/market-reports-july-2026/facts.md`.

| File | What | Made by |
|---|---|---|
| ccar-2026-06.json | CCAR June 2026, parsed: the overview (June and Jan to Jun, 2025 and 2026, houses and condos), the 12 monthly series (Jul 2025 to Jun 2026), the Local Market Update for 13 areas | parse_june.py |
| june.json | The page's data: overview, the three-June bars (2024, 2025, 2026; checked against the PDF text), monthly series, derived findings (asserted), Census permits for CBSA 34820, areas, map API counts | build_june.py |
| raw/google-suggestions.txt | Google suggestions for 17 dated and market searches (2026-11-10) | pull-suggestions.sh |
| raw/api-counts-2026-11-10.json | Two counts from the public map API (no listing kept) | curl, by hand |
| RAW (outside the repo; (c) ShowingTime Plus) | `Coastal-Carolinas_MMI_2026-06.pdf` sha256 c6c6d073...; `July_2026_All_Cities.pdf` sha256 205af131...; Census `cbsa2505c/y`, `cbsa2506c/y`, `cbsa2605c/y`, `cbsa2606c/y` | curl |

Sources:
- https://www.ccarsc.org/clientuploads/2026_Market_Stats/Coastal-Carolinas_MMI_2026-06.pdf (footer "Current as of July 10, 2026")
- https://www.ccarsc.org/clientuploads/2026_Market_Stats/July_2026_All_Cities.pdf ("Local Market Update – June 2026")
- https://www2.census.gov/econ/bps/CBSA%20(beginning%20Jan%202024)/

To rerun (RAW = `scratchpad/mrj-raw/`):

```
RAW=$RAW python3 -I data/2026-11-b/market-reports-july-2026/parse_june.py data/2026-11-b/market-reports-july-2026
RAW=$RAW python3 -I data/2026-11-b/market-reports-july-2026/build_june.py data/2026-11-b/market-reports-july-2026
```

Both scripts assert the PDFs' sha256. This page is an archive: the June data never changes. A Census revision to the permit files would change `permits`; the page prints one permit sentence.
