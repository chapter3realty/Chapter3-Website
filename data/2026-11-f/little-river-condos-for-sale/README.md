# Data for /submarkets/little-river/condos-for-sale/ (batch 2026-11-f)

Pulled 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/little-river-condos-for-sale/facts.md`. Scripts run as `python3 -I <script> ...`. Adapted from `../myrtle-beach-condos-for-sale/` and `../little-river-homes-for-sale/`.

| File | What | Made by |
|---|---|---|
| cards.json | 184 condos for sale with MLS city Little River (pull also returned 71 pins of other cities; dropped): price, beds, size, year, HOA fee, subdivision, waterfront flag. No address, MLS number, firm or photo | pull_listings.py (the MLS list is kept in scratch, not in the repo) |
| findings-listings.json | counts, middles, quartiles: all, by bedrooms, waterfront, building group, decade built | analyze_listings.py |
| flood.json | FEMA zone at each listing's map point: counts only (14 of 184 in zone AE) | pull_flood.py |
| findings-deeds.json | recorded condo sales in the named buildings, 2025-11-01 to 2026-10-31, by building, band, quarter | analyze_deeds.py (needs ../little-river-homes-for-sale scratch postal-all.json) |
| building-points.json | one point and a condo-parcel count per building regime (county GIS layer 24); no PIN | pull_building_points.py |
| tax.json | yearly tax at 4 and 6 percent, three prices | tax.py |
| strips.json, strips2.json (+ strip-final*.txt) | every strip search checked live: total and cards shown | strips.py |
| filters.json | the site's feature keys with counts | curl /homes/api/filters |
| google-suggestions.txt | Google suggest, 15 seeds | curl |
The map API needs a User-Agent and answers `unavailable` now and then: the scripts retry.
