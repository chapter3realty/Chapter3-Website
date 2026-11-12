# Data for /submarkets/north-myrtle-beach/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/submarkets-north-myrtle-beach/facts.md`.

| File | What | Made by |
|---|---|---|
| areas.py | The eight parts of the city (four old beach towns, Tilghman Beach, Little River Neck, west of US 17, across the waterway) and the rule that puts each home in one. Shared by the scripts. | |
| findings.json | Every derived number: homes by kind and part; legal-residence (4 percent) share and tax bills mailed out of state, by part and kind; FEMA high-risk zone by part and kind; houses on the water and the Cherry Grove channels; deed sales by part and kind (count, median, quartiles); the property tax and lodging tax worked examples; NFIP policy cost in ZIP 29582; active listings in aggregate by type and part; drive times | analyze.py |
| table-parts.json | One row per part for the page's table: homes, houses, condos, house resale, condo sales, share of houses and condos at 4 percent, share of homes in the high-risk zone, asking price per square foot | analyze.py |
| chart-house-resales.json | Middle resold house price by part, with counts and quartiles | analyze.py |
| chart-residence.json | Share of homes, houses and condos at the 4 percent rate, by part | analyze.py |
| map-parts.geojson | Map layers: each part as a simplified shape round its homes (no parcel outlines), the city limits, the FEMA high-risk zone, the channel houses' area, the waterway | analyze.py |
| landmarks.json | Which part each named place sits in (Main Street, McLean Park, Ingram Dunes, Central Park, Cherry Grove Pier, the boat ramp, Heritage Shores, Barefoot Landing) | landmarks.py |
| images/naip_channels.py | The USDA NAIP 2023 aerial of the Cherry Grove channels (public domain), unlabelled | |
| raw/google-suggestions.txt | Google search suggestions for 70 queries | pull-suggestions.sh |
| raw/census-*.json | Census 2020 (P1, H1, H5) and 2010 (P1), ACS 2020-2024 housing tables, North Myrtle Beach city (copied from the Little River folder, same API calls) | curl api.census.gov |
| raw/nfip-policies-29582-x/-a/-v.json | OpenFEMA NfipPolicies v3, ZIP 29582, single-family, policies effective June 2025 to May 2026, outside the high-risk zone, A zones and V zones | pull_fema.py |
| raw/drives.json | OSRM drive times from Main Street at Ocean Drive | pull_drives.py |
| raw/nmb-str.txt, str-rules.txt, beachlaws.txt, golfcart.txt, nmb-parks.txt, heritage-shores.txt, nmb-faq-hospitality.txt | City of North Myrtle Beach pages (read at www.parks.nmb.us, the same site as nmb.us, which refused the connection), text only | curl, then markup removed |
| raw/horry-hospitality.txt, scdor-accom.txt, ST575.txt | Horry County hospitality fee page; SCDOR accommodations page and ST-575 rate chart (Rev. 2/5/26) | curl |
| raw/scstatehouse-1325.txt, sc-code-t01c001.txt | SC Senate resolution on the city's 40th anniversary; SC Code Title 1 Chapter 1 (state dance) | curl scstatehouse.gov |
| raw/sce-nmb.json | SC Encyclopedia entry "North Myrtle Beach" (API copy) | curl |
| raw/munis-ab.json | County municipal outlines for Atlantic Beach and Briarcliffe Acres | curl county GIS layer 31 |

Saved pages are text extracts, not HTML (Little River NEEDS 7: an HTML page carried an access key).

Kept out of the repo (addresses, PINs or size), in RAW: county parcels (layer 24: PIN, land use, tax district, legal description, values, owner state, appraisal sub-area; no owner name or street), parcel outlines, address points (layer 22), FEMA zones (layer 19), hydrography (layer 21), roads (layer 18) and the CRM listing pull (no addresses, firms or photos).

Input from another folder: deed sales `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (Horry County deeds recorded 2025-10-01 to 2026-09-30; it ships in Blog-Brain `batches/2026-10-d/sell-out-of-state-buyers/web.patch`).

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_county.py
RAW=$RAW python3 -I pull_listings.py
python3 -I pull_fema.py . ; python3 -I pull_drives.py .
sh pull-suggestions.sh > raw/google-suggestions.txt
RAW=$RAW SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json LISTINGS=$RAW/listings-nmb.json python3 -I analyze.py .
RAW=$RAW python3 -I landmarks.py .
```

The scripts need shapely 2 and numpy. findings.json and the map carry no names, addresses, PINs or deed book and page.
