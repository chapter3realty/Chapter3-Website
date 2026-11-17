# Data for /submarkets/north-myrtle-beach/briarcliffe-acres/ (batch 2026-11-e)

Pulled 2026-11-14. Ledger: Blog-Brain `batches/2026-11-e/briarcliffe-acres/facts.md`. Every number the page prints comes from a file here.

| File | What | Made by | From |
|---|---|---|---|
| findings.json | Town parcels, houses, empty lots, lot and roof-outline sizes, pools, lake-side lots, distance from houses to the coastline, flood zones, tax status (4% or 6%), streets, house sales in the last 12 months | analyze.py | the county cache (below), the deed index, Census TIGER coastline |
| listings.json | Homes for sale now (count, price, year built, size, HOA fields as listed) and the live count of each strip the page may use | pull_listings.py | chapter3realty.com public map and strip APIs (CCMLS feed) |
| drives.json | Drive minutes and miles from the middle of the houses to the nearest public beach access, Barefoot Landing, the medical center, Broadway at the Beach, Coastal Grand, the airport | pull_drives.py | OSRM public router, SC DES Beach Access layer, Nominatim |
| tax-sample.json | 12 random 2026 tax bills: appraisal, assessed value, county and town tax, fee, total (no PIN, name or address) | pull_tax.py | Horry County Treasurer public payment site |
| map-layers.json | The page map: lot outlines with kind (lake, plain) and pool and house flags, lakes, town boundary, US 17, coastline | map_layers.py | county cache, Blog-Brain tools/geo/grand-strand-v2.json |
| photos.json | The one photo: a NAIP 2023 aerial (public domain) | by hand, from the request in the record | USGS National Map |
| raw/google-suggestions.txt | Google suggestions for 25 seeds | pull-suggestions.sh | suggestqueries.google.com |
| raw/*.txt, *.pdf | Page text kept as read: Wikipedia, the town site home page, the town's 2025 comprehensive plan (comp-plan-2025.pdf, 10 MB), the beach handout, the zoning code (Zoneomics mirror, code2.txt), the golf cart form | curl, pdftotext | URLs in the ledger |
| raw/aerial-crop-source.jpg, raw/aerial-request.txt | The cropped aerial and the exact request | | |

Kept out of the repo, in the scratch folder `ba-private/`: `county.json` (parcels with owner mailing state, addresses, footprints, flood, hydrography, zoning, towns), `lot-points.json`, tax pin lists. No owner name is saved anywhere; no PIN, address, MLS number, listing firm or photo reaches a file here.

To rerun:

```
export RAW=<scratch dir>
python3 -I pull_county.py .
SALES=../../2026-11-n/buyers-builders/raw/deeds-co.json GEO=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I analyze.py .
python3 -I pull_listings.py .
python3 -I pull_drives.py .        # needs findings.json
GEO=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I map_layers.py .
python3 -I pull_tax.py <pins.json> <out.json>
sh pull-suggestions.sh > raw/google-suggestions.txt
```

analyze.py and map_layers.py need shapely 2. The coastline is a simplified Census line (about 10 m): distances to it are "about". The zoning text in raw/code2.txt is a mirror, not Municode: the verifier checks the rentals line (Sec. 32-77 (12)) and the lot rule against Municode.
