# Data for /hoa/documents/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/hoa-documents/facts.md`.

| File | What | Made by |
|---|---|---|
| raw/recorded-months-170-213.json, raw/recorded-months-166.json | Monthly totals of Horry County Register of Deeds index rows, 2012-01 to 2026-10: RESTRICTIONS (082), MASTER DEED (022), AMENDMENT DEED BOOK (069). Totals only. | pull_recorded.py |
| recorded-by-year.json | Association papers recorded, by year and kind (rules and policies, amendments, declarations, bylaws), January counts, the last 12 months, and amendments to master deeds and declarations (ledger rows 29, 30, 30a). Counts only, no names. | analyze_recorded.py (reads the monthly index pulls; RAW stays out of the repo because rows carry party names) |
| scdca-documents.json | Horry County HOA complaints to SC Consumer Affairs, 2022 to 2025: documents before or after purchase, denied access, when and by whom the owner was told of the association (rows 31 to 33) | scdca_documents.py (reads the workbooks in ../../2026-10-d/hoa-special-assessments/raw/) |
| listings-counts.json | Active listings in the CRM feed with and without an association fee, by type, with each query (row 1) | pull_listings.py |
| chart-recorded.json, chart-scdca.json, chart-states.json | Chart and table rows for the page, built from the files above and the ledger | build_charts.py |
| raw/google-suggestions-2026-11-04.txt | Google suggestions for the must-answer list | pull-suggestions.sh |
| raw/acclaim-no-images-2026-11-04.txt | The county's reply to an online document image request (row 13) | curl |
| raw/rod-register-of-deeds.*, raw/rod-request-form.* | The Register of Deeds page (hours, address) and its copy request form (fees, index since 1984) (rows 14 to 16) | curl, pdftotext |
| raw/va-55.1-2308.*, va-55.1-2310.*, va-55.1-2312.*, va-55.1-2316.*, md-11b-106.*, fl-720.401.*, nc-47c-4-109.* | Other states' statutes (rows 24 to 27) | curl |

South Carolina statutes, the disclosure addendum, the Fannie Mae guide pages and bill H. 5204 were saved the same week by sibling pages; rows quote them from `../hoa-liens-and-foreclosure/raw/` and `../../2026-10-d/hoa-special-assessments/raw/`.

Rerun: `RAW=<scratch dir> python3 -I pull_recorded.py . 2012-01 2026-10` and `... 166`, then `RAW=<same> python3 -I analyze_recorded.py .`; `python3 scdca_documents.py . ../../2026-10-d/hoa-special-assessments/raw` (needs openpyxl); `python3 -I pull_listings.py .`; `python3 -I build_charts.py .`. Listing counts change daily and the county index grows; a rerun gives new numbers, and the page must be rebuilt from them, not edited by hand.
