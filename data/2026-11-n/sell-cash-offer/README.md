# Data for /sell/cash-offer/ (batch 2026-11-n)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-n/sell-cash-offer/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | What the page's charts and tables read: company share by price band, bought-versus-resold medians, no-mortgage share, cash-only listings, and the worked example ($260,000 fixed-up price, $178,000 at the share companies paid, deed fees) | build_findings.py |
| cash-buyers.json | Home resales (seller not a builder) whose first-named buyer is a company; by kind, price band, month and Census place; the same-subdivision price test; houses a company bought and resold within the 12 months. No names. | cash_buyers.py |
| cash-share.json | Home sales with no new mortgage recorded in the buyer's name (floor, loose and strict match rules). No names. | cash_share.py |
| listing-counts.json | Active listings from the CRM map API in aggregate: all, "Cash only", and cash-only with a price cut, by home type; the filter list's whole-feed counts for "Cash only" and "Needs work" | pull_listing_counts.py |
| raw/google-suggestions.txt | Google search suggestions for 56 queries | pull-suggestions.sh |
| raw/t40c057.html, .txt | SC Code Title 40, Chapter 57 (Real Estate Practice Act), read 2026-11-08 | curl https://www.scstatehouse.gov/code/statmast.php?title=40&chapter=57 |
| raw/llr-wholesaling.pdf, .txt | SC Real Estate Commission, Advisory Opinion on Exceptions to Wholesaling, November 14, 2024 | curl https://www.llr.sc.gov/re/News/Wholesaling-Assignment-of-Contracts-Guidance.pdf, pdftotext |
| raw/fnma-b4-1.3-06.*, fnma-b7-3-02.* | Fannie Mae Selling Guide: property condition (C1 to C6) and property insurance perils | curl selling-guide.fanniemae.com |
| raw/nar-escrow-earnest.pdf, .txt | NAR Consumer Guide: Escrow and Earnest Money (2025-02-12) | curl nar.realtor, pdftotext |

Inputs from siblings: `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (13,194 home sales, deeds recorded 2025-10-01 to 2026-09-30) and the weekly AcclaimWeb DEED (001) pulls with grantor and grantee names (that folder's pull_deeds.py; kept out of the repo because they carry names). The MORTGAGE (002) pulls (pull_mortgages.py, 27,851 rows, recorded 2025-09-24 to 2026-10-21) also carry names and stay in scratch.

To rerun:

```
sh pull-suggestions.sh > raw/google-suggestions.txt
RAW=<scratch>/raw python3 -I pull_mortgages.py <scratch> 2025-09-24 2026-10-21
SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json DEEDS=<deed raw dir> python3 -I cash_buyers.py .
SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json DEEDS=<deed raw dir> MORTS=<scratch>/raw python3 -I cash_share.py .
python3 -I pull_listing_counts.py .
python3 -I build_findings.py .
```

Limits, said once here so the page need not: the deed index names only the first grantor and grantee; a deed shows who bought, not how they paid; "company" is read from the buyer's name; a mortgage recorded under another name or more than 30 days later reads as no mortgage, so the no-mortgage share is a floor only under the broad rule; both deeds of a resale pair must fall inside the 12 months, so every hold is under a year.
