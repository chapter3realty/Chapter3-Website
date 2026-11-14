# Data for /buyers/property-records/tax-bill/ (batch 2026-11-d)

- raw/: county and state pages as read on 2026-11-13 (curl), with text made by scripts/txt.py.
- delinquent-summary.json: counts and opening-bid statistics from the county's two tax sale lists (scripts/delinquent.py). Aggregate only.
- chart-tax-sale-opening-bids.csv: the bar chart's rows, from delinquent-summary.json.
- table-payment-fees.csv, table-installments.csv, timeline-unpaid-tax.csv: the page's tables, typed from the county page and SC Code rows in the batch facts.md (row numbers there).

The tax sale spreadsheets name owners, and the tax portal probe pages show results. They are kept outside the repo
(scratchpad/private-tax-bill/) and must not be copied into the site or this folder. To rebuild the summary:
python3 -I scripts/delinquent.py <real-estate.xlsx> <mobile-home.xlsx> > delinquent-summary.json
Sources: https://www.horrycountysc.gov/media/urdazygf/2026-real-estate-delinquent-list-111226.xlsx and
https://www.horrycountysc.gov/media/513ougud/2026-mobile-home-delinquent-list-11122026.xlsx (linked from
https://www.horrycountysc.gov/departments/treasurer/delinquent-tax/).

2026-11-13, writer: table-payment-fees.csv rewritten to the verifier's wording (VERIFY row 8). The in-office
debit figure is cut: two county pages disagree on it. In person, the table gives only the credit card's 2.35%.
No fee is claimed or denied for checks or a debit card in the office.
