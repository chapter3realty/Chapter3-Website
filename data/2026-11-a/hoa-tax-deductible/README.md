# Data for /hoa/tax-deductible/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/hoa-tax-deductible/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every derived number: condo units at the 4 percent ratio (reused), dues and rental flags of condos for sale (reused), what the dues include, condo tax groups and the three bills, the dues-vs-tax comparison, the worked example | build_findings.py |
| worked-example.json | One condo with the county's middle dues ($650 a month), five uses, the deductible dues for each. The calculator must reproduce these cases. | build_findings.py |
| chart-dues-by-zip.json | Middle monthly condo dues by ZIP area (50 or more listings) and the yearly amount a full-year rental deducts | build_findings.py (reads ../buyers-cost-to-own/hoa-by-area.json) |
| chart-dues-vs-tax.json | A year of dues against a year of property tax, three real 2026 bills | build_findings.py |
| includes.json | What the dues include, Horry County condos for sale and oceanfront buildings, CRM map API in aggregate, every URL called | pull_includes.py (2026-11-04) |
| raw/bills-2026.json | Three 2026 condo tax bills from the Horry County Treasurer: levy, ratio, appraisal, assessed, exemptions, total, and the arithmetic check. No PIN, owner, unit or building name. | bills_sanitize.py (bills read with ../buyers-relocating-which-town/bill.py) |
| raw/sources/*.txt | Text copies of IRS Pub. 527, 530, 523, 587 (2025), Schedule E and its instructions (2025), Form 8829 instructions (2025), S.C. Code Title 12 Chapter 6, read 2026-11-04 | curl, pdftotext |
| raw/google-suggestions-2026-11-04.txt | Google suggestions for 46 seed queries | pull-suggestions.sh |

Reused inputs: `../invest-condos/findings.json`, `../invest-condos/listings.json`, `../invest-condos/raw/` (t12c043.txt, t27c031.txt, tax-levy-2026.txt), `../buyers-cost-to-own/hoa-by-area.json`.

Kept out of the repo (PINs): the county parcel file `condo-parcels.json` (scratch `wf2/invest-condos/raw/`) and the three raw bill pages (scratch `wf2/hoa-tax-deductible/`).

Rerun: `RAW=<condo-parcels.json> python3 -I build_findings.py .`; `python3 -I pull_includes.py .`; `python3 -I bills_sanitize.py <dir with bill-*.txt> .`; `sh pull-suggestions.sh > raw/google-suggestions-<date>.txt`. Listing counts change daily; a rerun gives new numbers and the page must be rebuilt from them, not edited by hand.
