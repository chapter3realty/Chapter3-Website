# Data for /hoa/rental-restrictions/ (batch 2026-11-b)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-b/hoa-rental-restrictions/facts.md` (rows named below).

| File | What | Made by |
|---|---|---|
| from-2026-11-a/ | The batch 2026-11-a research for this page, never shipped: scripts, listing counts of 2026-11-04, saved court opinions (Op. 5362, 5525, 5312), Florida and Arizona statutes, bills H. 3861 and S. 442, the SCDCA guide and the complaint recount (ledger rows 9 to 29) | applied from Blog-Brain `batches/2026-11-a/hoa-rental-restrictions/web.patch` |
| pull-2026-11-10/ | Fresh listing counts: listings.json, other-rules.json, findings.json, chart-by-type.json, chart-by-area.json (rows 1 to 8). Build the page from this one pull. | pull_listings.py, pull_other_rules.py, compute.py (copied unchanged from from-2026-11-a/) |
| raw/cam/cam-index.json | The 210 governing documents Coastal Association Management posts for 62 associations: association, file name, download id (row 60) | GetFiles?propertyId=<n> for each association (the page's own AJAX call), 2026-11-10 |
| raw/cam/cam-docs.json, files/, cam-addresses.json | The per-association file lists, and the address each property page prints (1016 2nd Ave North is the manager's office, not the place) | curl |
| (not in the repo) txt/ and ocr/ | Full text of each document: pdftotext where it has a text layer (61), tesseract 5.3 at 150 dpi for scans (first 40 pages of each master deed, declaration, amendment and rules file). Kept outside the repo, like the PDFs (about 1 GB), because signature pages carry officers' and notaries' names. In this session: scratchpad `hoa-rr-private/cam-text/`. Each PDF reopens at `https://www.coastalassociationmanagement.com/Site/FileDownload/Index/<id>`. | pdftotext; ocr_docs.py |
| raw/lease-clauses.txt, raw/amend-votes.txt | Every leasing sentence and every amendment-vote sentence found (rows 40 to 55, 61) | find_lease_clauses.py, find_amend_votes.py |
| table-named-rules.json, table-amend-votes.json | Rows for the page's two tables, each naming its ledger row and source file | build_tables.py |
| rental-papers.json | Association papers whose index title names renting, 2012-01 to 2026-10 (row 57) | count_rental_papers.py |
| community-papers.json | Amendments, supplements and rule sets recorded for nine named communities, 2012-01 to 2026-10 (row 56) | count_community_papers.py |
| parcels-by-name.json | County parcel counts and center points for six named communities (rows 41, 43, 44) | parcels_by_name.py |
| raw/fnma-*.txt, raw/hud-pr19-121.txt | Fannie Mae guide B4-2.2-01, B4-2.2-02, B4-2.1-01; HUD release 19-121 (rows 58, 59) | curl |
| raw/google-suggestions-2026-11-10.txt | Suggestions for the must-answer list | pull-suggestions.sh |

The two Register of Deeds scripts read the monthly index pulls made for /hoa/documents/ (`data/2026-11-a/hoa-documents/pull_recorded.py`, RESTRICTIONS 082 and AMENDMENT DEED BOOK 069, 2012-01 to 2026-10, pulled 2026-11-04). Those raw rows carry party names and stay out of the repo.

Rerun:
```
python3 -I pull_listings.py pull-<date> && python3 -I pull_other_rules.py pull-<date> && cp from-2026-11-a/scdca-rentals*.json pull-<date>/ && python3 -I compute.py pull-<date>
RAW=<index pulls> python3 -I count_rental_papers.py . ; RAW=<index pulls> python3 -I count_community_papers.py .
python3 -I ocr_docs.py raw/cam <pdf dir> ; python3 -I find_lease_clauses.py raw/cam > raw/lease-clauses.txt ; python3 -I find_amend_votes.py raw/cam > raw/amend-votes.txt
python3 -I parcels_by_name.py . ; python3 -I build_tables.py .
```
Listing counts change daily; a rerun gives new numbers, and the page must be rebuilt from them, not edited by hand.
