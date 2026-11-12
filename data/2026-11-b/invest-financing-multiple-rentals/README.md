# data/2026-11-b/invest-financing-multiple-rentals

Research data for /invest/financing-multiple-rentals/ (batch 2026-11-b, rebuild). Ledger: Blog-Brain `batches/2026-11-b/invest-financing-multiple-rentals/facts.md`. Pulled 2026-11-10.

| File | What | Made by |
|---|---|---|
| `hmda-rentals.json` | HMDA 2025 and 2024, Horry County (45051): applications and loans made by how the borrower will use the home (home, second home, investment property), by kind (purchase, refinance, cash-out refinance, line of credit), denial rates, denial reasons, distinct lenders. Counts and medians only. No lender names, no rates, no payments. The LTV median is ledger only. | `python3 -I hmda_rentals.py raw/hmda/hmda-2025-horry.csv raw/hmda/hmda-2024-horry.csv hmda-rentals.json` |
| `chart-equity-routes.json` | Chart rows: how owners here took cash out of a home in 2025 (cash-out refinances on rentals, lines of credit on rentals, lines of credit on homes owners live in). | `python3 -I build_page_data.py .` |
| `chart-equity-by-year.json` | Chart rows: what a typical Myrtle Beach-area house has gained, by the September it was bought (2015 to 2025), from the 2026-11-a ZHVI file. | `python3 -I build_page_data.py .` |
| `examples.json` | The worked example, rebuilt without the insurance figure struck on 2026-11-04: cash the first rental can give, rent counted, the reserve, two houses empty three months. | `python3 -I build_page_data.py .` |
| `raw/hmda/hmda-2025-horry.csv`, `hmda-2024-horry.csv` | The FFIEC data browser files, every record for Horry County | `curl -L --compressed "https://ffiec.cfpb.gov/v2/data-browser-api/view/csv?years=2025&counties=45051"` (and 2024) |
| `raw/hmda/lar-data-fields.txt` | HMDA field codes (occupancy, line of credit, loan purpose, denial reasons) | https://ffiec.cfpb.gov/documentation/publications/loan-level-datasets/lar-data-fields |
| `raw/hmda/regb-appendix-c.txt` | Regulation B sample notice ("Value or type of collateral not sufficient") | https://www.consumerfinance.gov/rules-policy/regulations/1002/c/ |
| `raw/fnma/*.txt` | Fannie Mae Selling Guide B2-2-03, B3-4.1-01, B3-4.3-15, B2-1.3-03, re-opened 2026-11-10 (guide published November 4, 2026); Freddie Mac maximum LTV table | curl selling-guide.fanniemae.com, sf.freddiemac.com |
| `raw/heloc/` | CFPB HELOC answer page and booklet (October 2026 print); one credit union's HELOC FAQ (secondary, for the ledger only) | curl consumerfinance.gov, files.consumerfinance.gov, connexuscu.org |
| `raw/google-suggestions-2026-11-10.txt` | Google search suggestions, 18 seeds | `sh pull-suggestions.sh > raw/google-suggestions-2026-11-10.txt` |
| `from-2026-11-a/` | The verified research of batch 2026-11-a for this page (never built): ZHVI equity by year, county deed and parcel counts, listing counts, the verifier's recounts (`verify/verify-recounts.json`), and the 2026-11-04 Fannie Mae text copies. Its `examples.json` still carries the struck $3,300 insurance; use this folder's `examples.json`. | see `from-2026-11-a/README.md` |

HMDA notes:
- "Investment property" is HMDA's occupancy code 3: a home the borrower will not live in. It takes in rentals and homes bought to resell.
- Lenders under HMDA's volume thresholds do not report, and partly exempt lenders may leave a field "1111". In 2025, 350 investment-property applications have the line-of-credit field exempt; of the 329 of those that were made, 324 are first liens (214 purchases, 95 refinances, 14 home improvement, 1 cash-out). Some could be lines of credit (8 of the 17 reported rental lines are first liens). On homes owners live in, 513 applications have the field exempt. The counts are what lenders reported: a floor on both sides.
- "Line of credit" is `open-end_line_of_credit = 1`, whatever the stated purpose.
