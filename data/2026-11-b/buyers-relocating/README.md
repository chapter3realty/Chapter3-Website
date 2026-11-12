# Data for /buyers/relocating/ (batch 2026-11-b, the relocation hub)

Ledger: Blog-Brain batches/2026-11-b/buyers-relocating/facts.md. The page's state table reads hub.json.

| File | What | Made by |
|---|---|---|
| hub.json | Buyers by tax-bill state (Horry County deeds, Oct 2025 to Sep 2026), the ten guide states' share, each guide state's largest IRS source county, and road miles from it to Myrtle Beach | build_hub.py |
| raw/2024_Gaz_counties_national.txt | Census 2024 county gazetteer (internal points) | downloaded from www2.census.gov |
| raw/google-suggestions.txt | Google search suggestions for 17 seeds | pull_suggestions.sh |
| raw/horry-beaches.html | Horry County "About Our Beaches", read 2026-11-10 (facts rows 7, 8) | curl |
| raw/scdmv-moving.html | SCDMV "Moving To SC - License", read 2026-11-10 (row 28) | curl |
| raw/eao05-16.html | SC Bar Ethics Advisory Opinion 05-16, read 2026-11-10 (row 24) | curl |

To rerun: `python3 -I build_hub.py <website root>` (reads data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json and data/2026-11-a/buyers-relocating-why-myrtle-beach/raw/countyinflow2223.csv; calls router.project-osrm.org). Drive minutes are stored but not printed: the public router's times run long on interstate trips.
