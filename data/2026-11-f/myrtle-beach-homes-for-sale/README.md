# Data for /submarkets/myrtle-beach/homes-for-sale/ (batch 2026-11-f)

Pulled 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/myrtle-beach-homes-for-sale/facts.md`. Scripts run as `python3 -I <script> ...`. Adapted from `../little-river-homes-for-sale/` (same method, city = Myrtle Beach; houses and townhouses only, condos are the sibling page).

| File | What | Made by |
|---|---|---|
| listings-pull.json, cards-anon.json, cards-stats.json | houses and townhouses for sale with MLS city Myrtle Beach from the site's public map API and card lookup; one anonymous card per home (price, beds, size, year, HOA fee, subdivision, zip, acres; no MLS number, address, firm or photo). 549 of 1,032 houses and 48 of 145 townhouses answered the card lookup | pull_mb.py; stats.py |
| strips-a.txt/.json, strips-b, strips-c, strips.json | every strip search the page uses, checked live: total and cards shown (strips.json is the merged list with 3 or more homes) | strips.py |
| findings-deeds.json | recorded house sales with a Myrtle Beach postal address, 2025-11-01 to 2026-10-31: count, middle, quartiles, bands, sellers, zip, tax district, quarters | analyze_deeds.py |
| flood.json | share of those houses inside a FEMA high-risk zone | flood_share.py |
| tax.py, tax.json | tax at the sale middle at 4 and 6 percent, inside and outside the city | tax.py |
| filters.json | the site's feature filter keys with counts (all places) | curl /homes/api/filters |
| google-suggestions.txt | Google suggest for 16 seeds | curl |

Scratch, not in the repo (holds county parcel numbers): `scratchpad/mbhfs-scratch/postal-all.json`, a copy of `scratchpad/cvhfs-scratch/postal-all.json` (pull_postal.py of the Conway batch). analyze_deeds.py and flood_share.py here are the Little River scripts with the city and zip list changed (the copies that ran are in the scratch folder: `Little River` replaced by `Myrtle Beach`, zips 29579, 29588, 29577, 29572, tax-district list taken from the data). Rerun: copy postal-all.json next to them and run `python3 -I analyze_deeds.py <data/2026-11-n/buyers-builders> .`.
