# Data for /invest/strategies/small-multifamily/ (batch 2026-11-b)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-b/invest-strategies-small-multifamily/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | For sale now (MLS "2 to 4 units", Horry County, by town, by distance from the ocean, under FHA's two-unit limit); the county's 2 to 4 unit parcels (by code, town, distance from the ocean, named group, tax ratio); their sales in the deeds of Oct 2025 to Sep 2026; rents carried from pums-2to4.json; the two worked examples | analyze.py |
| pums-2to4.json | Census ACS PUMS 2020-2024: lease and gross rent in 2 to 4 unit buildings (BLD 04, 05), by bedrooms, with 90 percent margins; owner and renter counts | analyze_pums.py |
| code-check.json | Address points per parcel for land use codes 101 to 104 and 126 (what the codes hold) | check_codes.py |
| raw/listings-prices.json | Active listings: price, mailing city, parcel code, in-county flag (nothing else) | analyze.py |
| raw/stock-by-landuse.json | County parcels with a building, counted by land use code | fetch_county.py |
| raw/acs5-2024-B25024-horry.json, raw/acs5-2024-B25032-horry.json | Census units in structure and tenure by units, Horry County | curl data.census.gov access API |
| raw/hud-4000-1-update18-excerpts.txt | HUD Handbook 4000.1, Update 18 (issued 2026-08-12), the lines the ledger quotes | pdftotext of the hud.gov PDF |
| raw/hud-92561.txt | HUD form 92561 | copy from data/2026-11-b/invest-condotel-financing/raw/dl/ |
| raw/hud-limits-FHA-from-2026-10-d.html | HUD FHA limits CY2026, Horry County | copy from data/2026-10-d/buyers-first-time-home-buyer-myrtle-beach/raw/ |
| raw/fhlmc-ltv.html, .txt | Freddie Mac maximum LTV table | curl sf.freddiemac.com |
| raw/google-suggestions.txt | Google search suggestions for 32 queries | pull-suggestions.sh |

Inputs read from other folders: `../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (deeds), `../../2026-10-d/sell-home-value/raw/horry-county.json` and `raw/ocean.json` (county line, ocean polygon).

To rerun (raw listing, parcel and address downloads stay outside the repo in RAW):

```
RAW=<scratch>/smf-raw python3 -I pull_listings.py .
RAW=<scratch>/smf-raw python3 -I fetch_county.py .
python3 -I check_codes.py .
python3 -I analyze_pums.py <scratch>/pums5/psam_h45.csv pums-2to4.json   # the 5-year file, 131,050 rows
RAW=<scratch>/smf-raw python3 -I analyze.py .
sh pull-suggestions.sh > raw/google-suggestions.txt
```

findings.json carries no names, addresses, PINs, MLS numbers or firms.
