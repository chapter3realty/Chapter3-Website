# Data for /invest/run-the-numbers/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/invest-run-the-numbers/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every derived number: houses and condos against the 1 percent rule, gross rent by ZIP, the three worked examples, the tax reset summary, condo dues | build_findings.py |
| chart-houses-1pct-by-zip.json | Chart rows: houses for sale by ZIP area and how many pass at 1 percent and 8 percent gross | build_findings.py |
| safmr-fy2027.json | HUD FY2027 Small Area FMRs, Myrtle Beach metro ZIPs | extracted from FY27_safmrs.xlsx (huduser.gov) |
| listings-vs-rent.json, listings-vs-rent-2.json, medians.json | CRM map API counts, aggregate only | pull_listings.py, pull_listings2.py, pull_medians.py |
| tax-reset.json | 2026 resales: price against the seller's taxed value, ratio on record, investor bill multiples | fetch_parcels.py, analyze_tax.py |
| raw/ | Google suggestions, 2026 Horry County levy, SC Code ch. 12-37 and 12-43, county tax pages, HUD FMR page, IRS Pub 527, III | pull-suggestions.sh and curl |

To rerun: `python3 -I pull_listings.py .`, `python3 -I pull_listings2.py .`, `python3 -I pull_medians.py .` (about 15 minutes);
`RAW=<scratch>/raw python3 -I fetch_parcels.py <2026-10-d deed file>` then `RAW=<scratch>/raw python3 -I analyze_tax.py <2026-10-d deed file> .`;
then `python3 -I build_findings.py .`. The deed file is `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` from batch 2026-10-d's patch. Parcel records with PINs stay in RAW, outside the repo; the outputs here carry no PIN, address or owner.
