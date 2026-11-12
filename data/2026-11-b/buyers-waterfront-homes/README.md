# Data for /buyers/waterfront-homes/ (batch 2026-11-b)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-b/buyers-waterfront-homes/facts.md`. Batch 2026-11-a researched this page first (verified ledger `batches/2026-11-a/buyers-waterfront-homes/facts.md`); its data files are copied, unchanged, into `from-2026-11-a/`.

| File | What | Made by |
|---|---|---|
| deeds-findings.json | What a house on each kind of water resold for (oceanfront first row, Intracoastal Waterway, Waccamaw River, Cherry Grove channels, USGS lakes and ponds, no water) and condos in oceanfront buildings, Horry County deeds recorded 2025-10-01 to 2026-09-30; each against house resales within 1 km on no water; the flood zone of each sold house; `stock_flood`: every house on the ocean, the waterway, the Waccamaw and the Cherry Grove channels, and how many lots reach FEMA's high-risk zone and its VE wave zone | analyze.py |
| listings-findings.json | Homes for sale on each kind of water, in aggregate: count, middle asking price, price per square foot, how many under $300,000 and over $1 million, with and without a dock. `kinds` uses the CRM's water keys alone; `on_the_water` also requires the listing's waterfront flag (the water keys also tick a view or community access) | analyze_listings.py |
| sunrise.json | Which way each 8 km stretch of Horry County's beach faces, and on how many days of 2026 the sun rises over the open sea there (NOAA solar equations) | sunrise.py |
| chart-prices.json | Middle resale price by kind of water, with counts and the file each figure comes from | build_charts.py |
| chart-dock.json | Asking price per square foot with and without a dock, tidal water and rivers | build_charts.py |
| chart-flood.json | Houses on each water: lots that reach the high-risk zone and the VE zone | build_charts.py |
| raw/google-suggestions-2026-11-b.txt | Google search suggestions for 30 queries (prices, places, sunrise) | pull-suggestions.sh |
| raw/google-suggestions-2026-11-a.txt | The 2026-11-a pull, 66 queries | from-2026-11-a/pull-suggestions.sh |
| raw/coastpilot4-c12-paras-1-8.txt | NOAA Coast Pilot 4 (01 NOV 2026), chapter 12, paragraphs 1 to 8: the waterway from Norfolk to Key West | pypdf text of CPB4_C12_WEB.pdf (2026-11-a pull) |
| raw/www_fws_gov_refuge_waccamaw*.txt | US Fish and Wildlife Service, Waccamaw National Wildlife Refuge home and About Us pages, as text | curl 2026-11-10 |
| raw/www_dnr_sc_gov_fish_swfaqs_html.txt | SC DNR saltwater fishing license FAQ, as text (crabbing without a license) | curl 2026-11-10 |
| from-2026-11-a/ | The first round's data: findings.json (houses touching each water, deeds on the waterway and the Waccamaw, listings, NFIP, tides, bridges), bridges.json, chart-tides.json, map-water.geojson, the SCDES, SC Code, R.30-12, eCFR and Coast Pilot extracts | that round's scripts |

Inputs from other folders, read, not copied: kept home sales `../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json`; Cherry Grove channel resales `../../2026-11-a/submarkets-north-myrtle-beach/findings.json` (NMB ledger row 14); Garden City marsh sales `../../2026-11-a/submarkets-garden-city/findings.json` (Garden City ledger row 13).

Kept out of the repo (PINs, outlines, owner fields, MLS numbers), in `RAW` = the scratchpad folder `wfw/raw`: county.geojson and coast.json (county boundary, layer 33), coast-parcels.json (39,032 parcels within 300 m of the coast, layer 24), sale-parcels.json (outlines of 10,351 sold parcels), flood-sfha.json (758 high-risk flood polygons, layer 19), nhd-waterbodies.json (7,224 USGS lakes, ponds and marsh), oceanfront-pins.json and oceanfront-outlines.geojson (oceanfront.py), county-hydro.json and water-parcels-2026-11-a.json (copies of the 2026-11-a pull), listings-water.json (CRM pull, 2026-11-10 07:01 UTC).

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_coast.py        # county boundary, coast parcels, sold parcels' outlines, flood zones
python3 -I fetch_nhd.py          # USGS lakes, ponds, marsh
python3 -I pull_listings.py      # CRM, aggregate use only
python3 -I oceanfront.py         # the first row on the beach
cp <2026-11-a RAW>/hydro.json $RAW/county-hydro.json; cp <2026-11-a RAW>/water-parcels.json $RAW/water-parcels-2026-11-a.json
python3 -I analyze.py; python3 -I analyze_listings.py; python3 -I sunrise.py; python3 -I build_charts.py
sh pull-suggestions.sh > raw/google-suggestions-2026-11-b.txt
```

Checks done by the researcher: the oceanfront rule was drawn over aerials at Garden City, Myrtle Beach (Dunes Club) and Cherry Grove. Two fixes came from that look: the county line across Garden City's island is trimmed off the coastline, and the whole width of a lot is swept to the sea (a single line slipped through street gaps and took second-row lots). In Cherry Grove the county's parcels, footprints and address points all sit about 30 m north-west of both NAIP and Esri imagery; the even-numbered (ocean-side) Ocean Boulevard addresses fall on the parcels the rule marks, so the rule is read against the county's own layers.

Not used: the `swamp_or_marsh` group in deeds-findings.json is mostly freshwater swamp in Myrtle Beach (33 of 48 resales in zone X); tidal marsh comes from the Garden City and Murrells Inlet ledgers.
