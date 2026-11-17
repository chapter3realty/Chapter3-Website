# Data for /submarkets/conway/wild-wing-plantation/ (batch 2026-11-e)

Pulled 2026-11-14. Ledger: Blog-Brain `batches/2026-11-e/wild-wing-plantation/facts.md`. Scripts adapted from the pilot (`../../2026-11-d/plantation-point/`).
| File | What | Made by |
|---|---|---|
| findings.json | parcels, houses, lot and roof-outline sizes, pools, golf and lake lots, tax status, streets, 12-month house sales (count, middle, range), for the detached houses, The Sanctuary and the Fairways townhomes | analyze.py |
| map-lots.json | one point per lot (4 decimals) with group, golf, lake, pool, house flags; no PIN | analyze.py |
| listings.json | homes for sale now, aggregate (hoa fields are empty on every card; the hoaMax brackets are unreliable, do not use) | pull_listings.py |
| drives.json | drive minutes from the middle of the detached houses and of the Fairways to the beach, airport, Broadway at the Beach, Coastal Grand. Downtown Conway, Conway Medical Center and the clubhouse points are approximate coordinates: not for the page until checked | pull_drives.py |
| raw/ | map API pulls, FEMA NFHL answer, Google suggestions | curl |
Scratch (not in repo): `scratchpad/ww-raw/county.json`. Rerun: `RAW=<scratch> python3 -I pull_county.py .` then `RAW=<scratch> SALES=../../2026-11-n/buyers-builders/raw/deeds-co.json python3 -I analyze.py .`, then pull_listings.py, pull_drives.py.
