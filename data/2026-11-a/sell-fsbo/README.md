# Data for /sell/fsbo/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/sell-fsbo/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Everything the page's charts and tables read: the SC disclosure form's question counts and its seven coastal questions, the NAR 2025 FSBO figures, the worked example inputs ($350,000, deed fee $1,295), the same-surname deed counts, and a listing-count cross-check | build_findings.py |
| surname-findings.json | Home sales between a seller and buyer who share a last name, against other sales between people: counts, middle prices, price bands, comparison with sales in the same subdivision. No names. | analyze_surnames.py |
| listing-counts.json | Active for-sale listing counts from the CRM map API (all, price cut, listed in 30 and 7 days), by type. Cross-check only; the page carries buyers-buying-in-myrtle-beach row 9. | pull_listing_counts.py |
| raw/google-suggestions.txt | Google search suggestions for 45 queries | pull-suggestions.sh |
| raw/sc-disclosure-06-2025.txt | Text of the SC Residential Property Condition Disclosure Statement (effective 6/2023, updated 6/2025) | pypdf from https://llr.sc.gov/re/recpdf/Property-Condition-Disclosure-Statement-06.2025.pdf |
| raw/llr-limited-market-exposure.txt | SC Real Estate Commission, Seller-Directed Limited Residential Market Exposure Guidance (August 13, 2026) | pypdf from https://llr.sc.gov/re/RECPDF/Limited%20Market%20Exposure%20Guidance%20Document.pdf |
| raw/t27c050.html, t40c057.html, t12c024.html, t12c008.html | SC Code chapters 27-50, 40-57, 12-24, 12-8 | curl scstatehouse.gov |
| raw/sc-25508.htm | SC Supreme Court, Doe v. McMaster, Op. 25508 | curl sccourts.org |
| raw/epa-lead-disclosure.html | EPA, Real Estate Disclosures about Potential Lead Hazards | curl epa.gov |

Inputs from siblings: `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (13,194 home sales, deeds recorded 2025-10-01 to 2026-09-30) and the weekly AcclaimWeb deed pulls that carry the grantor and grantee names (made by that folder's pull_deeds.py; kept out of the repo because they carry names).

NAR's 2025 Profile is copyrighted ("May not be reprinted"), so its PDF and text stay in scratch (PRIV). Its figures are in findings.json with the exhibit numbers.

To rerun:

```
sh pull-suggestions.sh > raw/google-suggestions.txt
python3 -I pull_listing_counts.py .
RAW=<scratch>/raw python3 -I ../../2026-10-d/sell-out-of-state-buyers/pull_deeds.py <scratch> 2025-10-01 2026-09-30
SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json DEEDS=<scratch>/raw python3 -I analyze_surnames.py .
PRIV=<scratch with nar-2025-highlights-rir.txt> python3 -I build_findings.py .
```
