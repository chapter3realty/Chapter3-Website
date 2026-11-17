# Data for /submarkets/little-river/homes-for-sale/ (batch 2026-11-f)

Pulled 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/little-river-homes-for-sale/facts.md`. Scripts run as `python3 -I <script> ...`. Adapted from `../conway-homes-for-sale/` (same method, city = Little River).

| File | What | Made by |
|---|---|---|
| listings-pull.json, cards-anon.json, cards-stats.json | houses, condos, townhouses for sale with MLS city Little River from the site's public map API and card lookup; one anonymous card per home (price, beds, size, year, HOA fee, subdivision name, acres; no MLS number, address, firm or photo). 251 of 400 answered the card lookup | pull_lr.py; stats inline |
| strip-final.txt, strips.json | every strip search the page uses, checked live: total and cards shown (strips.json also holds the 55 first-pass checks) | ../conway-homes-for-sale/strips.py |
| findings-deeds.json | recorded house sales with a Little River postal address, 2025-11-01 to 2026-10-31: count, middle, quartiles, bands, sellers, quarters (condo deeds: only 39 found, not used) | analyze_deeds.py |
| flood.json | share of those houses inside a FEMA high-risk zone | flood_share.py |
| filters.json | the site's feature filter keys with counts (all places) | curl /homes/api/filters |
| google-suggestions.txt | Google suggest for 14 seeds | curl |

Scratch, not in the repo (holds county parcel numbers): `scratchpad/lrhfs-scratch/postal-all.json`, a copy of `scratchpad/cvhfs-scratch/postal-all.json` (pull_postal.py of the Conway batch: county address layer 42, postal city, zip and subdivision per parcel). Rerun: `python3 -I analyze_deeds.py <data/2026-11-n/buyers-builders> .` after copying postal-all.json next to it.
