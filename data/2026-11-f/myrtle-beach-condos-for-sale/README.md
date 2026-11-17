# Data for /submarkets/myrtle-beach/condos-for-sale/ (batch 2026-11-f)

Read 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/myrtle-beach-condos-for-sale/facts.md`.
| File | What | Made by |
|---|---|---|
| cards.json | Condos for sale (MLS city Myrtle Beach): price, beds, sqft, year built, fee, subdivision; no address or MLS number | pull_listings.py |
| oceanfront.json | Same, split by oceanfront building / unit, quartiles by bedrooms | pull_oceanfront.py |
| findings.json | Aggregates, deed sales by price band and building | analyze.py (sales from pull_sales.py, raw/sales-rows.json, raw/district-city.json from pull_districts.py) |
| flood.json | FEMA zone at each listing point, counts only | pull_flood.py |
| tax.json | Yearly tax at 6 and 4 percent at three prices | tax.py |
| strips.json, strips2.json | Live count of every strip search | check_strips.py |
| raw/google-suggestions.txt | Demand | curl |
Order: pull_listings, pull_oceanfront, pull_flood, pull_sales, pull_districts, analyze, tax, check_strips. pull_sales takes `<dir> <website root>`. Needs a User-Agent header on the site's API. Pulls take about 10 minutes each (3 threads).
