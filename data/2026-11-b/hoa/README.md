# Data for /hoa/ (batch 2026-11-b)

Every number on the page comes from `findings.json`. Ledger: Blog-Brain `batches/2026-11-b/hoa/facts.md`.

| File | What | Made by |
|---|---|---|
| fees-by-kind.json | Typical monthly HOA fee (quartiles to $5) and what listings say it covers, by kind of home for sale: all condos, oceanfront tower, oceanfront building, off the ocean, townhouse, house, house with no shared amenities, house with a pool or clubhouse, gated, golf, gated golf. Counts only; no address, MLS number, price or firm. | pull_fees_by_kind.py (the CRM's public map API) |
| rcbap.json, raw/nfip-rcbap-horry-2025-26.json | Condo association building flood policies in Horry County, one year: cost per insured unit | pull_rcbap.py (FEMA OpenFEMA NfipPolicies v3) |
| budgets.json | Where the fee goes: Del Webb at Grande Dunes 2025 budget, Myrtle Trace 2026 budget | budgets.py (reads raw/dwgd-2025-09-financial.txt; Myrtle Trace typed from raw/mt-p6-6.png) |
| findings.json, chart-fee-by-kind.json, table-covers.json | What the page prints, and the chart and table files | build_findings.py (also reads ../../2026-11-a/buyers-cost-to-own/pums-2024-1yr*.json and hoa-by-area.json) |
| raw/google-suggestions-2026-11-09.txt | Google suggestions for the must-answer list | pull-suggestions.sh |
| raw/filters.json | The map API's feature flags and their labels, read 2026-11-09 | curl https://chapter3realty.com/homes/api/filters |
| raw/dwgd-2025-09-financial.pdf, .txt; raw/dwgd-documents.html | Del Webb at Grande Dunes Budget Comparison Statement (period ending 9/30/2025) and the Resource Center document list | curl, pdftotext -layout |
| raw/myrtle-trace-2026-annual-meeting.pdf, raw/mt-p6-6.png | Myrtle Trace 2026 annual meeting packet; page 6 rendered to read the scanned budget | curl, pdftoppm -f 6 -l 6 -r 110 |

Rerun, in order: `python3 -I pull_fees_by_kind.py .` (about 600 calls at 2.1 s or more; `python3 -I pull_fees_by_kind.py . condo` pulls one segment into the existing file), `python3 -I pull_rcbap.py .`, `python3 -I budgets.py .`, `python3 -I build_findings.py .`. The listing counts change daily; a rerun gives new numbers and the page is rebuilt from them, never edited by hand.
