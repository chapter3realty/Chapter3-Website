# data/2026-11-b/submarkets/: the town guides hub

No new county pull. The hub repeats each town guide's own verified figure, so every number is read from the data file that guide's ledger cites.

| File | What | Made by |
|---|---|---|
| `build_towns.py` | Reads each guide's findings file, checks the value still rounds to what the guide prints, writes `towns.json`. Exits 1 on any mismatch. | run from the website root: `python3 -I data/2026-11-b/submarkets/build_towns.py` |
| `towns.json` | One row per guide, in table order (beach towns north to south, then the two inland places): price, group, sales, ledger row, the "where" words, the wow line, the nightly-rental words and their row ids. | `build_towns.py` |
| `map_points.py`, `map-points.json` | A label point per town, north to south, from Blog-Brain `tools/geo/grand-strand-v2.json` (Census TIGER/Line 2026). Only if the reviewer wants a map. | `python3 -I map_points.py /home/user/Blog-Brain` |
| `pull-suggestions.sh`, `raw/google-suggestions.txt` | Google search suggestions for 28 hub searches, read 2026-11-10. | `sh pull-suggestions.sh > raw/google-suggestions.txt` |

Sources of the prices (each guide's own data folder, `data/2026-11-a/`):

| Town | File | Key |
|---|---|---|
| Little River | submarkets-little-river/findings.json | sales_zip.house_resale |
| North Myrtle Beach | submarkets-north-myrtle-beach/findings.json | sales.house_resale |
| Myrtle Beach | submarkets-myrtle-beach/house-resales.json | houses |
| Surfside Beach | submarkets-surfside-beach/findings.json | sales["R3/house"] |
| Garden City | submarkets-garden-city/findings.json | sales["beach/condo"] |
| Murrells Inlet | submarkets-murrells-inlet/findings.json | sales["horry/west/house"] |
| Pawleys Island | submarkets-pawleys-island/findings.json | groups "west17/house" (window) and "island/house" (3 years) |
| Carolina Forest | invest-where-to-buy/findings.json | areas[carolina-forest].house |
| Conway | submarkets-conway/findings.json | sales_in_city.resales_not_condo |

## Round 2 (2026-11-12): how the towns differ

| File | What | Made by |
|---|---|---|
| `raw/census/DECENNIALPL2020.P1.json`, `DECENNIALPL2020.H1.json`, `DECENNIALDHC2020.H5.json` | 2020 Census: people, homes, homes lived in, and vacation homes ("for seasonal, recreational, or occasional use"), every SC place | `https://data.census.gov/api/access/data/table?id=<table>&g=040XX00US45$1600000`, fetched 2026-11-12 |
| `raw/web/gaz_place_45.txt` | 2020 Census Gazetteer, SC places: city, town or CDP, land area | `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_gaz_place_45.txt` |
| `coast_length.py`, `coast-length.json` | Shore miles from the NC line to Pawleys Island's south end, and to near Winyah Bay (TIGER/Line 2026 COASTLINE) | `python3 -I coast_length.py /home/user/Blog-Brain/tools/geo/grand-strand-v2.json > coast-length.json` |
| `beach_by_town.py`, `beach-by-town.json` | Ocean beach miles inside each town's TIGER outline (reliable for MB, NMB, Surfside, Pawleys only) | `python3 -I beach_by_town.py /home/user/Blog-Brain/tools/geo/grand-strand-v2.json > beach-by-town.json` |
| `build_glance.py`, `glance.json` | The one-glance table and the vacation-homes chart. Exits 1 if a share moves off facts.md D3 | `python3 -I build_glance.py` |
| `pull-suggestions-2.sh`, `raw/google-suggestions-2.txt` | Google suggestions for 24 seeds about the towns and how they differ, read 2026-11-12 | `sh pull-suggestions-2.sh > raw/google-suggestions-2.txt` |
