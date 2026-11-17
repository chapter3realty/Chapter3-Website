# Data for /submarkets/pawleys-island/willbrook-plantation/ (batch 2026-11-e)

Pulled 2026-11-14. Ledger: Blog-Brain `batches/2026-11-e/willbrook-plantation/facts.md`. Georgetown County: the records are Georgetown's (gis1.georgetowncountysc.org), not Horry's.

| File | What | Made by |
|---|---|---|
| findings.json | Parcels, houses, condo units, empty lots, lot size (parcel outline), roof-outline size, legal-residence share, golf lots, FEMA zones, billing outside SC, last-deed sales (12 months, 3 years) for the core and each part (Willbrook main phases, Oak Point, Allston Point, Tradition Club, Mingo, Avian Forest, Reunion Hall) | analyze.py |
| map-lots.json | One point per lot (4 decimals): part, house, golf. No parcel number | analyze.py |
| listings.json | Homes for sale now in aggregate (count, price, size, lot, year, HOA fee brackets) and each planned strip's live count | pull_listings.py |
| drives.json | Drive minutes and miles from the core's middle to the nearest public beach access, the airport, Brookgreen Gardens, MarshWalk, the hospital, the clubhouse and the US 17 entrance; the foot route | pull_drives.py |
| raw/google-suggestions.txt | Google suggestions for 34 seeds | pull-suggestions.sh |
| raw/willbrookgolf-*.txt | Willbrook Plantation Golf Club pages (about, course guide, membership) | curl |
| raw/scp.txt, raw/lbts*.txt, raw/gt-tax-calculator.html | South Carolina Plantations timeline; Litchfield by the Sea pages; Georgetown tax estimator page | curl |

Kept out of the repo, in RAW (scratch `/tmp/wb`): `county.json` (parcels with billing state, flood, addresses) and `buildings.json` (2024 footprints). No owner name is saved; the golf parcel owner (a company) is named in the ledger.

To rerun:

```
export RAW=<scratch dir>
python3 -I pull_county.py . ; python3 -I pull_buildings.py ; python3 -I analyze.py .
python3 -I pull_listings.py . ; python3 -I pull_drives.py .
sh pull-suggestions.sh > raw/google-suggestions.txt
```

analyze.py and pull_listings.py need shapely 2. The Georgetown table has no market value and no square footage; `TotalLandArea` is 1.0 on most lots (a placeholder), so lot size comes from the parcel outline.

Added by the writer (build): `map_layers.py` draws `map-layers.json` (lot outlines by kind, the golf parcel, FEMA's high-risk zone, US 17) from the same county cache plus a FEMA file (`RAW/fema.geojson`, the verifier's `fema_0.000005.json`). `fema.json` holds the verifier's FEMA counts (63 of 189 roofs). `photos.json` is the NAIP 2023 aerial (public domain) of part of the golf course lots, files in `chapter3realty/images/2026-11-e/willbrook-plantation/`.
