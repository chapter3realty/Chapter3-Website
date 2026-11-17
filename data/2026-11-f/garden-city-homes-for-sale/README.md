# Data for /submarkets/garden-city/homes-for-sale/ (batch 2026-11-f)

Pulled 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/garden-city-homes-for-sale/facts.md`. Scripts run as `python3 -I <script> ...` (see each docstring).

| File | What | Made by |
|---|---|---|
| listings-pull.json, cards-anon.json | houses and condos for sale in the CRM area `has=area_garden_city`, from the site's public map API and card lookup; totals by type; one anonymous card per home (price when answered, beds, HOA fee, subdivision name; no MLS number, address, firm or photo) | pull_gc.py |
| cards-stats.json, hoa-condo-by-size.json | card summaries: price, fee, beds, subdivisions; condo HOA fee by bedrooms and water | stats.py; inline script (fee by size) |
| pins-stats.json | asking price, beds, bands from the map pins (list price) | pins_stats.py |
| strips.json, strip-final.txt | every strip search the page uses, checked live: total and cards shown | strips.py |
| strip-near.json, strip-try*.json/.txt | the first pass and the "near" strips with a type | strips.py |
| findings-deeds.json | recorded sales in the Horry part of the Garden City Census place, 2025-11-01 to 2026-10-31: count, median, quartiles, range, bands, by kind | analyze_deeds.py |
| flood.json | share of those homes inside a FEMA high-risk zone, by kind | flood_share.py |
| filters.json | the site's feature filter keys with counts | curl /homes/api/filters |
| google-suggestions.txt | Google suggest for 15 seeds | curl |

Scratch, not in the repo (the pin files hold street addresses and MLS numbers): `scratchpad/gchfs-scratch/map-*.json`. Inputs from other batches: deed file and parcels `data/2026-11-n/buyers-builders/raw/`, boundary `data/2026-11-a/submarkets-garden-city/raw/cdp2020.geojson`. Rerun: `python3 -I pull_gc.py .`; the map files by `curl "https://chapter3realty.com/homes/api/map?has=area_garden_city&status=active&type=<t>"`; `python3 -I pins_stats.py <scratch>`; `python3 -I analyze_deeds.py <data dir>`; `python3 -I flood_share.py <data dir>`; `python3 -I strips.py strip-final.txt strips.json`. The scripts need shapely 2. Note: strips.py quotes its input, so give it names with spaces, not %20.
