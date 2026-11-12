# Data for /hoa/special-assessments/ (batch 2026-10-d)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-10-d/hoa-special-assessments/facts.md`.

| File | What | Made by |
|---|---|---|
| liens-by-year.json | Association liens recorded in Horry County, by year, 2010 to October 2026: all documents, bulk filers left out, associations filing (ledger row 26). Counts only, no names. | analyze_liens.py |
| raw/liens-months.json | Monthly index totals for CONDO LIEN and CONDO LIEN SATISFACTION | pull_liens.py |
| listing-ages.json | Condos for sale by year built, all and by city, with each query URL (row 10) | pull_listing_ages.py |
| scdca-counts.json | SC Consumer Affairs HOA complaints by county and money concern, report years 2023 to 2026 (rows 30 to 32) | scdca_counts.py |
| eul-subset.json | HUD planning lives for 13 building parts (row 11) | eul_subset.py |
| worked-example.json | The labelled 120-unit example (row 5) | worked_example.py |
| raw/google-suggestions-2026-11-01.txt | Google suggestions for the must-answer list | pull-suggestions.sh |
| raw/*.txt, *.html, *.pdf, *.xlsx | Statutes (Title 27 Ch. 30, 31, 50; Title 33 Ch. 31), Fannie Mae B4-2.1-03, SC disclosure addendum, HUD EUL table, IRS Pubs 527/530/551, Fisher v. Shipyard Village (Op. 27603), SCDCA 2026 report and workbooks | curl, pdftotext |

To rerun the liens: `RAW=<scratch dir> python3 -I pull_liens.py <this dir> 2010-01 2026-10`, then `RAW=<same> python3 -I analyze_liens.py <this dir>`. The raw index rows carry owners' and associations' names, so they stay out of the repo. The others: `python3 -I <script> <this dir>` (scdca_counts.py needs openpyxl, so run it without -I).
