# Data for /hoa/master-insurance-ho6/ (batch 2026-11-b)

Every number on the page comes from `findings.json` or `chart-deductible-share.json`. Ledger: Blog-Brain `batches/2026-11-b/hoa-master-insurance-ho6/facts.md`.

| File | What | Made by |
|---|---|---|
| raw/nfip-condo-horry-2025-26-A.json | Condo association building flood policies (RCBAP), Horry County, policies that started 2025-09-01 to 2026-08-31: coverage, replacement cost, deductible, units, cost. No address. | pull_nfip_condo.py (OpenFEMA NfipPolicies v3) |
| raw/nfip-condo-horry-2025-26-U.json | Flood policies on one condo unit, same county and window | pull_nfip_condo.py |
| raw/nfip-claims-horry-condo.json | Every flood claim on a condo association or condo unit policy in Horry County, 1984 to 2026, by storm | pull_nfip_claims.py (OpenFEMA NfipClaims v3) |
| findings.json, chart-deductible-share.json | What the page prints, and the one chart | build_findings.py |
| raw/google-suggestions-2026-11-10.txt | Google suggestions for the must-answer list | pull-suggestions.sh |
| raw/sc-t27c031.html(.txt), raw/sc-t38c075.html(.txt) | S.C. Code Title 27 Ch. 31 (condo law) and Title 38 Ch. 75 (property insurance), read 2026-11-10 | curl scstatehouse.gov |
| raw/sc-reg-ch69.pdf(.txt) | S.C. Code of Regulations Chapter 69 (Department of Insurance); Reg. 69-56 is at line 18927 of the .txt | curl scstatehouse.gov |
| raw/fannie-sg-b7-3-03.html(.txt), raw/fannie-sg-b7-3-04.html(.txt) | Fannie Mae Selling Guide B7-3-03 (master policy) and B7-3-04 (unit owner policy), both dated 08/05/2026 | curl selling-guide.fanniemae.com |
| raw/ecfr-61.xml(.txt) | 44 CFR Part 61 with the flood policy forms (Appendix A(1) Dwelling Form, A(3) RCBAP), as of 2026-11-01 | eCFR versioner API |
| raw/mpiua-basic-ho-00-06.docx(.txt) | Massachusetts Property Insurance Underwriting Association claim letter that quotes the HO-6 form's Loss Assessment clause | curl mpiua.com |
| raw/harrison-2025-ins-study.pdf, raw/h.txt | SC Wind and Hail Underwriting Association presentation to the Insurance Rate Review Ad Hoc Committee, July 23, 2025 | curl scstatehouse.gov |
| raw/irmi-bare-walls-coverage.html, raw/irmi-single-entity-coverage.html, raw/irmi-all-inclusive-coverage.html | IRMI insurance definitions of the three kinds of master policy | curl irmi.com |
| raw/scdoi-1023.html(.txt) | SC Department of Insurance, "Understanding the Types of Homeowner Insurance" | curl doi.sc.gov |
| raw/floodsmart-home.html, raw/floodsmart-home.txt | FEMA FloodSmart home page: "Most homeowners insurance does not cover flood damage." (ledger row 29, fix round 1) | curl floodsmart.gov, 2026-11-10 |

Reused, not pulled again: `../hoa/rcbap.json` (the hub's per-unit flood cost, same window), `../../2026-11-a/buyers-cost-to-own/pums-2024-1yr.json` (owners' own insurance, Census PUMS).

Rerun, in order: `python3 -I pull_nfip_condo.py .`, `python3 -I pull_nfip_claims.py .`, `python3 -I build_findings.py .`. OpenFEMA refreshes monthly; a rerun can move the counts and the page is rebuilt from them, never edited by hand.
