# Data for /hoa/hoa-vs-poa/ (batch 2026-10-d)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-10-d/hoa-hoa-vs-poa/facts.md`.

| File | What | Made by |
|---|---|---|
| fees-by-type.json | Monthly association fee by kind of home for sale (condo, townhouse, house): counts at each fee step, the median band, and the median to $5 (ledger rows 15, 16) | pull_fees.py, refine_medians.py |
| has-with-fee.json | What the fee pays for (insurance, lawn, water and sewer, trash, internet, amenities, gate), as a share of homes with a fee, by kind of home (row 17) | pull_has_with_fee.py |
| association-names.json | The label word in the names of the 548 associations that recorded a lien in Horry County in 2025, and 2021 to 2025 (rows 18, 19). Counts only. | classify_names.py (reads the lien index pulls of hoa-special-assessments/pull_liens.py; RAW stays out of the repo) |
| layers.json | Association names recorded under nine community names, by document type (rows 20 to 22) | pull_layers.py |
| raw/layer-rows.json, raw/grande-dunes-master-restrictions.json | Index rows (date, type, parties, book and page, index description) for six master or second-layer associations. A party that is not a business is written "(person)". | pull_layer_rows.py |
| association-names-merged.json | The verifier's count for row 18: the same 2025 filers with each name's spellings merged and misspellings put in their bucket (526 associations). The page reads this file; the unmerged 548 is struck. Counts only. | classify_names_merged.py (same RAW as classify_names.py) |
| community-fees.json | Typical listed monthly fee and what listings say the fee covers, for homes for sale in Grande Dunes (houses, condos), Barefoot (condos, houses) and Prince Creek (houses), counts only (row 31) | pull_community_fees.py |
| photos.json | The licence record of the one photo on the page (CC BY-SA 4.0, Wikimedia Commons) | by hand; `tools/photos.js check` passes |
| scdca-docs.json | Horry County HOA complaints to SC Consumer Affairs, 2022 to 2025: when the owner got the governing documents; name labels (row 24) | scdca_docs.py (reads the workbooks in hoa-special-assessments/raw/) |
| raw/acclaim-no-images.txt | The county's reply when a document image is requested online (row 23) | curl |
| raw/fnma-*.html, *.txt | Fannie Mae Selling Guide B4-2.1-01 (row 14) | curl |
| raw/cfr44-61-appA3-2025.pdf, .txt | 44 CFR Part 61 App. A(3), the NFIP Residential Condominium Building Association Policy, 2025 edition (row 13) | curl, pdftotext |
| raw/google-suggestions-2026-11-01.txt | Google suggestions for the must-answer list | pull-suggestions.sh |

Statutes (Title 27 Ch. 30, 31, 50; Title 33 Ch. 31) and the SC disclosure addendum are already saved, read the same day, in `../hoa-special-assessments/raw/`. Rows here quote them.

Rerun: `python3 -I pull_fees.py .`, `python3 -I refine_medians.py .`, `python3 -I pull_has_with_fee.py .`, `python3 -I pull_community_fees.py .`, `python3 -I pull_layers.py .`, `python3 -I pull_layer_rows.py .`, `RAW=<lien pulls> python3 -I classify_names.py .`, `python3 scdca_docs.py . ../hoa-special-assessments/raw` (needs openpyxl). The listing counts change daily; a rerun gives new numbers and the page must be rebuilt from them, not edited by hand.
