# Data for /submarkets/conway/homes-for-sale/ (batch 2026-11-f)

Pulled 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/conway-homes-for-sale/facts.md`. All scripts run as `python3 -I <script> ...` (see each docstring).

| File | What | Made by |
|---|---|---|
| listings-pull.json, cards-anon.json | houses, townhouses, condos for sale with MLS city Conway, from the site's public map API and card lookup; totals by type; one anonymous card per home (price, beds, size, year, HOA fee, subdivision name, acres; no MLS number, address, firm or photo). 464 of 640 houses answered the card lookup | pull_conway.py |
| strips.json | every strip search the page uses, checked live: total and cards shown | strips.py, strip-final.txt |
| findings-deeds.json | recorded house sales in Conway, 2025-11-01 to 2026-10-31: count, middle, quartiles, range, by seller, by zip, by tax district, by quarter | analyze_deeds.py |
| flood.json | share of those houses inside a FEMA high-risk zone | flood_share.py |
| filters.json | the site's feature filter keys with counts (all places) | curl /homes/api/filters |
| google-suggestions.txt | Google suggest for 15 seeds | curl |
Scratch, not in the repo (holds county parcel numbers and the live pin list): `scratchpad/cvhfs-scratch/postal-all.json` (pull_postal.py: county address layer 42, postal city, zip and subdivision for each parcel on the deed file) and `map-conway.json`. The deed file and parcels are the 2026-11-n builders data (`data/2026-11-n/buyers-builders/raw/`). Rerun: `python3 -I pull_postal.py <bb dir> <scratch>`, copy the output next to the scripts, then `analyze_deeds.py <bb dir> .` and `flood_share.py <bb dir> .`.
