# Data for /submarkets/myrtle-beach/plantation-point/ (batch 2026-11-d)

Pulled 2026-11-13. Ledger: Blog-Brain `batches/2026-11-d/plantation-point/facts.md`. Every number the page prints comes from a file here.

| File | What | Made by | From |
|---|---|---|---|
| findings.json | Parcels, houses, empty lots, lot and roof-outline sizes, pools, waterway and golf lots, flood, city limits, zoning, tax status (4% or 6%), streets (names and counts), house sales in the last 12 months (count, middle, range) for Plantation Point and The Landing | analyze.py | the county cache (below) and the deed index |
| map-lots.json | One point per lot (4 decimals) with flags: Landing, waterway, golf, pool, house; two map labels | analyze.py | same |
| listings.json | Homes for sale now, in aggregate: count, price median and range, beds, size, year built, HOA fee brackets | pull_listings.py | chapter3realty.com public map API and listing card (CCMLS feed) |
| drives.json | Drive minutes and miles from the middle of each part to the beach (nearest of 10 public accesses), the airport terminal, Broadway at the Beach, Coastal Grand, Grand Strand Medical Center, the Myrtlewood clubhouse and Food Lion; the foot route to the beach | pull_drives.py | OSRM public router, routing.openstreetmap.de, SC DES Beach Access layer, Nominatim |
| raw/acclaim-restrictions-index.json | Index rows of the recorded restrictions (date, book and page, description, party; parties are subdivisions and companies only) | pull_restrictions.py | Register of Deeds, AcclaimWeb "Search by name", RESTRICTIONS (082) |
| raw/google-suggestions.txt | Google suggestions for 23 seeds | pull-suggestions.sh | suggestqueries.google.com |
| raw/*.txt | Page text: SC Encyclopedia "Myrtle Beach"; Play Golf Myrtle Beach and Myrtle Beach Golf Trips on PineHills; Rivercrest's Plantation Point Plaza page | curl | URLs on each file's first line |

Inputs from other folders: deeds `data/2026-11-n/buyers-builders/raw/deeds-co.json` (DEED (001), 2025-11-01 to 2026-10-31; person names blanked there); levies `data/2026-11-a/submarkets-little-river/raw/tax-levy-2026.txt`.

Kept out of the repo, in RAW (scratch): `county.json` (parcels with owner mailing state, address points with street names, building footprints, flood, hydrography, zoning, town limits, the large neighbouring parcels) and `lot-points.json`. No owner name is saved anywhere; no PIN, address, MLS number, listing firm or photo reaches a file here.

To rerun:

```
export RAW=<scratch dir>
python3 -I pull_county.py .
SALES=../../2026-11-n/buyers-builders/raw/deeds-co.json python3 -I analyze.py .
python3 -I pull_listings.py .
python3 -I pull_drives.py .
python3 -I pull_restrictions.py .
sh pull-suggestions.sh > raw/google-suggestions.txt
```

analyze.py and pull_listings.py need shapely 2.

## The writer's changes (2026-11-13, after the verifier)

- `findings.json`, `map-lots.json`, `drives.json` and `listings.json` are now the verifier's corrected run (Blog-Brain `batches/2026-11-d/plantation-point/VERIFY.md`, section A): The Landing is 139 houses, the pond parcel is out, the utility lot is not a house, and The Landing's drives start from its corrected middle. The researcher's first files are replaced. `pull_county.py` and `analyze.py` still carry the first outline rules; VERIFY.md section A lists the section names and the two `analyze.py` fixes they need before the next re-run.
- `map_layers.py` writes `map-layers.json` for the page's map: each lot's outline with one kind (landing, waterway, golf, plain), the Intracoastal Waterway and the four parts of the Myrtlewood course parcel, cut to the frame, and the US 17 and US 17 Bypass lines from Blog-Brain `tools/geo/grand-strand-v2.json` (Census TIGER). No PIN, owner, address or value. Run: `RAW=<scratch with the corrected county.json and lot-points.json> GEO=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I map_layers.py .`
- `photos.json`: the one photo the page shows, a USDA NAIP 2023 aerial (public domain) of part of Plantation Point, exported from the USGS National Map image service; the exact requests are in the record. Files in `chapter3realty/images/2026-11-d/plantation-point/`.
