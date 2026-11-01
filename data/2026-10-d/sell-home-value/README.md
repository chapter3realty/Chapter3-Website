# Data for /sell/home-value/ (batch 2026-10-d)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-10-d/sell-home-value/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every summary the page uses: resale medians by area and type, the methods test (neighbors' median and county value against the recorded price), the worked example (anonymized), county value against price by distance from the ocean, the flood-zone counts and same-subdivision test, the tax-cap counts, active-listing asking price per square foot by distance from the ocean, monthly resale medians, the FHFA index for the metro, Redfin's published Horry County accuracy | analyze.py |
| raw/google-suggestions.txt | Google search suggestions for 31 queries | pull-suggestions.sh |
| raw/fhfa-34820.csv | FHFA All-Transactions HPI, Myrtle Beach-Conway-North Myrtle Beach MSA rows | from https://www.fhfa.gov/hpi/download/quarterly_datasets/hpi_at_metro.csv |
| raw/redfin-estimate.html | Redfin's "About the Redfin Estimate" page with its accuracy table (Horry County rows) | curl https://www.redfin.com/redfin-estimate |
| raw/horry-guide-to-assessment.html | Horry County Assessor, Guide to Real Property and Assessment | curl |
| raw/t12c0*.html, raw/t40c0*.html | SC Code chapters 12-24, 12-37, 12-43, 12-60, 40-57, 40-60 | curl scstatehouse.gov |
| raw/horry-county.json | Census TIGERweb Horry County boundary (filters listings to the county) | curl TIGERweb State_County layer 1 |
| raw/ocean.json | Census TIGERweb areal hydrography polygons named Atlantic Ocean (distance to the beach) | fetch_county.py |

Sales input: `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (Horry County deeds recorded 2025-10-01 to 2026-09-30, 13,194 home sales; see that folder's README). Census place polygons: that folder's fetch_points.py (raw/places.json).

To rerun (raw parcel, address and listing downloads stay outside the repo in RAW):

```
RAW=<scratch>/raw python3 -I fetch_county.py . ../sell-out-of-state-buyers/out-of-state-buyers.json
RAW=<scratch>/raw python3 -I pull_listings.py .
RAW=<scratch>/raw SALES=../sell-out-of-state-buyers/out-of-state-buyers.json PLACES=<scratch>/sell-out-of-state-buyers/raw/places.json python3 -I analyze.py .
```

findings.json carries no names, addresses, PINs or deed book and page. The worked example's identity is written to RAW/worked-example-private.json only.
