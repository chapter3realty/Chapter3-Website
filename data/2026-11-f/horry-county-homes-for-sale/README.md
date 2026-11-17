# Data for /submarkets/homes-for-sale/ (Horry County homes for sale, batch 2026-11-f)

Pulled 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/horry-county-homes-for-sale/facts.md`. Scripts run as `python3 -I <script> ...`; each has its usage in the docstring.

| File | What | Made by |
|---|---|---|
| counts.json | Homes for sale by MLS city and kind (all places), 12 cities the site lists | pull_counts.py |
| county-pull.json | Houses, condos, townhouses for sale with a map point inside Horry County (Census boundary 45051): counts by kind, MLS city, zip; asking quartiles and price bands. No address or MLS number | pull_county.py |
| cards-anon.json, cards-stats.json | One anonymous card per home (first pass: 2,691 of 5,947 answered the card lookup): price, beds, size, year, HOA fee, MLS city. HOA fee stats by kind | pull_cards.py, analyze_cards.py |
| findings-deeds.json | Recorded house and condo sales 2025-11-01 to 2026-10-31, county-wide and by postal city and zip: counts, middle, quartiles, by price band, seller, quarter | analyze_county.py |
| flood-county.json | Share of those houses inside a FEMA high-risk zone | flood_county.py |
| tax.json | Yearly tax at the sale middle, 4 and 6 percent, unincorporated and city of Myrtle Beach | tax.py |
| strips.json, strips2.json | Every strip search the page uses, checked live: total and cards shown | strips.py, strip-list.txt |
| explore*.json | Candidate strips tried, counts only | strips.py |
| check_near.py | Checks a circle search returns only Horry County homes | |
| google-suggestions.txt | Google suggest for 15 seeds | curl |

Scratch, not in the repo (holds county parcel numbers): `scratchpad/cvhfs-scratch/postal-all.json` (postal city, zip and subdivision for each parcel on the deed file, from the Conway batch's pull_postal.py). Copy it next to analyze_county.py and flood_county.py to rerun: `python3 -I analyze_county.py <data/2026-11-n/buyers-builders> .`. The deed file and parcels are the 2026-11-n builders data.

The site's API answers `{"ok":false}` or `found:false` under load: every script retries. A second full card pass was started and stopped because it slowed the strip checks; the first pass stands.
