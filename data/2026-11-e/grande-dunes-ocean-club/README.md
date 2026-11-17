# Data for /submarkets/myrtle-beach/grande-dunes/ (batch 2026-11-e, fix round 1, pulled 2026-11-15)

Ledger: Blog-Brain `batches/2026-11-e/grande-dunes-ocean-club/facts.md`. Every number the page prints comes from a file here.

| File | What | Made by | From |
|---|---|---|---|
| findings.json | Homes the county names Grande Dunes (633; 246 inside Myrtle Beach, 387 inside North Myrtle Beach), tax status, flood, past-year sales by city | analyze.py | the county cache (raw, scratch) and the deed index |
| listings.json | Homes for sale now, in aggregate: per kind and per MLS subdivision: count, price, size, year built, listed monthly fee, mailing city | pull_listings.py | chapter3realty.com public map API and listing card (CCMLS feed) |
| drives.json | Drive minutes from the middle of the Myrtle Beach homes and of the North Village homes to the Ocean Club, the marina, the hospital, Broadway, Coastal Grand, the airport; nearest public beach access; the foot route | pull_drives.py | OSRM public router, SC DES Beach Access layer |
| map-points.json | One point per home, 4 decimals, with its city (used only for the two middles) | analyze.py | same |
| photos.json | The one photo: a USDA NAIP 2023 aerial of the Grande Dunes Marina (public domain), with the exact requests | by hand | USGS National Map image service |
| listing-city.json | Which city each for-sale listing is inside (counts only) | city_check.py | listing pins and the county Municipalities layer |
| raw/cards.json | Listing cards with MLS numbers (scratch; not kept in the repo, pull_listings.py writes it again) | pull_listings.py | /homes/api/lookup |
| raw/*.txt | The pages read for the amenity facts, each with its URL on line 1 | curl | grandedunesoceanclub.com, grandedunes.com, vistadelmarcoa.com, the master association's TownSq site |

Scratch (outside the repo): `scratchpad/gd/raw/gd-parcels.json` (county parcels, no owner name requested), `gd-geo.json` (county municipalities and FEMA zones for the frame), `map.json`.

To rerun:
```
export RAW=<scratch dir>
python3 -I pull_county.py            # writes gd-parcels.json and gd-geo.json to RAW
SALES=../../2026-11-n/buyers-builders/raw/deeds-co.json python3 -I analyze.py .
python3 -I pull_listings.py .
python3 -I pull_drives.py .
RAW=$RAW python3 -I city_check.py .
```
analyze.py needs shapely 2. The page's map is made by Blog-Brain tools/area-map.js (regionMap), not from a file here. `all.built_2024_or_later` was added to listings.json from raw/cards.json, and the script now writes it.
