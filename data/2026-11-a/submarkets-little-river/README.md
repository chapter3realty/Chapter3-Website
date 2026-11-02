# Data for /submarkets/little-river/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/submarkets-little-river/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every derived number: area sizes; homes in ZIP 29566 by kind, land use, tax district and inside North Myrtle Beach; manufactured homes; homes on the water; homes in FEMA's high-risk zone; deeded boat slips by marina and their county values; slip deed sales (marina, month, price only); home sales by kind, on and off the water; active listings in aggregate; HUD FY2027 rents; the rent-and-tax worked example; NFIP policy cost; Census comparisons; county boat landings; subdivisions (homes, kinds, water, flood, lot size, resale prices, centre point); the development tracker and permits (not used; see the ledger's Not verified) | analyze.py |
| chart-seasonal.json | Share of homes held for seasonal use, 2020 Census: Little River and six other places | analyze.py |
| chart-homes.json | Homes in the ZIP by kind, on the water and in the high-risk zone | analyze.py |
| map-little-river.geojson | ZIP 29566 outline, North Myrtle Beach city limits, FEMA high-risk zone and the county's water outline, clipped to -78.78,33.82,-78.54,33.95 and simplified | analyze.py |
| map-points.json | County boat landings and the centre of each marina's deeded slips (with the slip count) | analyze.py |
| raw/google-suggestions.txt | Google search suggestions for 69 queries | pull-suggestions.sh |
| raw/census-*.json, raw/census-label-*.json | Census tables for Little River CDP, Garden City CDP, North Myrtle Beach city, Murrells Inlet CDP, Carolina Forest CDP, Conway city and Horry County (ACS 2020-2024; 2020 and 2010 Census), and the variable labels | pull-census.sh; curl api.census.gov |
| raw/safmr-2027-metro34820.json | HUD FY2027 Small Area FMRs, every Myrtle Beach metro ZIP | pull_hud.py (download FY27_safmrs.xlsx first) |
| raw/hud-fmr-index.txt, raw/hud-fy27-safmr-methodology.txt | HUD's FMR page and the FY2027 SAFMR methodology text | curl huduser.gov (browser user agent) |
| raw/nfip-policies-29566-x.json, -a.json | OpenFEMA NfipPolicies v3, ZIP 29566, single-family, June 2025 to May 2026, outside and inside the high-risk zone | pull_fema.py |
| raw/drives.json | OSRM drive times from the OpenStreetMap place point for Little River | pull_drives.py |
| raw/tax-levy-2026.pdf/.txt | Horry County Auditor, 2026 tax levies | curl horrycountysc.gov |
| raw/horry-str-salestax.pdf | Horry County chart of filings for short-term rentals in unincorporated areas | curl horrycountysc.gov |
| raw/horry-parks.txt | Horry County Parks (Vereen Memorial Historical Gardens) | curl horrycountysc.gov |
| raw/horry-cbp-hearings.txt, raw/scdot-cbp-hearings-2025.txt, raw/ncdot-cbp*.txt | Carolina Bays Parkway extension: county and SCDOT releases, NCDOT project, highlights and history pages | curl |
| raw/scdot-swing-bridge-historic.txt, raw/scdot-swing-bridge-2025.txt | SCDOT historic bridge record and the 2025 schedule release for the Little River swing bridge | curl |
| raw/nws-ilm-hazel.txt, raw/scdnr-hazel.pdf | NWS Wilmington Hurricane Hazel page; SC State Climatology Office Hazel report | curl |
| raw/census-cdp-glossary.txt | Census geography glossary (what a CDP is) | curl census.gov |
| raw/hcs-our-schools.txt | Horry County Schools, Our Schools (attendance areas) | curl |
| raw/horry-history-washington.txt | Horry County Historical Society marker text (not used; see Not verified) | curl |

Inputs from other folders: kept home sales `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (Horry County deeds recorded 2025-10-01 to 2026-09-30, 13,194 home sales; that folder's README). It ships in Blog-Brain `batches/2026-10-d/sell-out-of-state-buyers/web.patch`; the page itself reads only this folder's files. The comparison row 46 reads `data/2026-11-a/submarkets-conway/findings.json`.

Kept out of the repo (addresses, owner names or size), in RAW: county parcels (layer 24, no owner fields), parcel outlines, address points (layer 22, street names but no house numbers), ZIP and Census outlines, FEMA zones (layer 19), hydrography (layer 21), boat launches, boat-slip parcels, the development tracker, active permits, evacuation zones, the AcclaimWeb deed index rows (they carry names) and the CRM listing pull (no addresses, firms or photos).

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_county.py
python3 -I pull_listings.py
RAW=$RAW python3 -I pull_deeds.py . 2025-10-01 2026-09-30
python3 -I pull_fema.py .
python3 -I pull_drives.py .
python3 -I pull_hud.py . <FY27_safmrs.xlsx>
sh pull-census.sh ; sh pull-suggestions.sh > raw/google-suggestions.txt
SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json python3 -I analyze.py .
```

analyze.py needs shapely 2 and numpy. findings.json carries no names, addresses, PINs or deed book and page. Subdivision and marina names appear only with counts and prices.
