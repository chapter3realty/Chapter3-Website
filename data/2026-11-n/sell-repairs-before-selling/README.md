# Data for /sell/repairs-before-selling/ (batch 2026-11-n)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-n/sell-repairs-before-selling/facts.md`.

| File | What | Made by |
|---|---|---|
| raw/google-suggestions.txt | Google search suggestions for 76 queries (the must-answer list) | `sh pull-suggestions.sh > raw/google-suggestions.txt` |
| raw/acs1-2025-B25034-*.json, -B25035-*, -B25036-* | Census ACS 2025 1-year: year structure built, median year built, tenure by year built; Horry, Georgetown, SC, US | `sh pull-acs.sh .` |
| raw/acs1-2024-B25034-vars.json, -B25036-vars.json | Variable labels (same in 2025) | `sh pull-acs.sh .` |
| raw/noaa-normals.json | NOAA 1991-2020 annual normals: North Myrtle Beach airport, Columbus OH, New York Central Park | `sh pull-noaa.sh .` |
| listing-counts.json | Horry County houses for sale now (resales), by year built, with the CRM's feature flags; aggregate counts and every URL called | `python3 -I pull_listing_counts.py .` |
| findings.json | Everything the page's charts and tables read: decades, median year, owner-occupied shares, the HUD life table, the age clock, climate ratios, listing shares | `python3 -I build_findings.py .` |

Run order: pull-suggestions.sh, pull-acs.sh, pull-noaa.sh, pull_listing_counts.py, build_findings.py. The HUD useful-life values in build_findings.py are typed from https://www.hud.gov/sites/documents/eul_for_cna_e_tool.pdf (ledger row 4, with the item numbers). No names, addresses, MLS numbers or prices are saved.
