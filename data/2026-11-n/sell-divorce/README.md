# Data for /sell/divorce/ (batch 2026-11-n)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-n/sell-divorce/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | What the page's tables and chart read: the middle resale house price; the worked sale and the worked buyout on it (deed fee, per-1-percent agent fee, equal-split example, new loan amount, deed fee saved); the gain on that house by year bought, from the FHFA index, and the first quarter whose gain is at or under $250,000 | build_findings.py |
| suggestion-groups.json | 235 Google suggestions grouped by what the reader wants (groups overlap) | count_suggestions.py |
| raw/google-suggestions.txt | Google search suggestions for 59 queries | pull-suggestions.sh |
| raw/fhfa-34820.csv | FHFA All-Transactions HPI, CBSA 34820 rows (copy of `../../2026-10-d/sell-home-value/raw/fhfa-34820.csv`, read 2026-11-01) | from https://www.fhfa.gov/hpi/download/quarterly_datasets/hpi_at_metro.csv |
| raw/t20c003.*, t63c3.*, t12c24.*, t27c7.*, t15c61.*, t62c2.*, t40c060.* | SC Code chapters, read 2026-11-08 | curl https://www.scstatehouse.gov/code/statmast.php?title=T&chapter=C, then h2t.py |
| raw/t40c057.txt | SC Code Title 40 Ch. 57 (copy of the cash-offer pull, same day) | `../sell-cash-offer/raw/t40c057.txt` |
| raw/irs-p523.*, irs-p504.* | IRS Publications 523 and 504 (2025) | curl https://www.irs.gov/publications/p523 and p504 |
| raw/fnma-b2-1.3-02.*, fnma-b3-6-05.* | Fannie Mae Selling Guide: limited cash-out refinance (buyouts) and monthly debt (court-ordered debt) | curl selling-guide.fanniemae.com |
| raw/usc-1701j-3-govinfo.* | 12 U.S.C. 1701j-3 (Garn-St Germain), govinfo 2023 edition | curl govinfo.gov |
| raw/rpc-1-15.*, scadr-3.* | SC Rule 407 RPC 1.15 and SC ADR Rule 3 | curl sccourts.org |
| raw/horry-clerk-of-court.html | Horry County Clerk of Court page | curl horrycountysc.gov |

Reused, not re-pulled: `../../2026-10-d/sell-home-value/findings.json` "county_all" (middle resale house $350,000, n 6,866, deeds Oct 2025 to Sep 2026; that page's verified row 2).

To rerun:

```
sh pull-suggestions.sh > raw/google-suggestions.txt
python3 -I count_suggestions.py .
python3 -I build_findings.py .
```

Limits, said once here so the page need not: the $200,000 loan balance in the worked examples is an example input, not a fact; the equal split is one example, since South Carolina divides marital property equitably; the gain by year bought applies a single-family repeat-sales index to the middle price of houses and other homes, before improvements and selling costs, so it is an estimate for a typical house, not any one house.

Scratch only (names, kept out of the repo): a probe of the Horry County COURT ORDER DEED (125) index, October 2025 to September 2026, in `wfn/sell-divorce/raw/courtorder-*.json`. It was not used (ledger "Not verified" 7).
