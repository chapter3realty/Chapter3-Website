# Data for /submarkets/myrtle-beach/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/submarkets-myrtle-beach/facts.md`.

| File | What | Made by |
|---|---|---|
| findings.json | Every derived number: city-limit areas; zoning classes by square mile; homes inside the city by kind, by nightly-rental zone class, by ZIP and by part of the city (count, 4 percent share, owner's tax bill out of state, FEMA high-risk and VE zone, median county value); homes and buildings with a Myrtle Beach mailing address inside and outside the city, by ZIP; deed sales in the city (all, condo, not condo, builder, resale, by zone class, ZIP, part and month; buyer tax-bill states); active listings in aggregate (inside and outside, by zone class and part; houses in rental zones; what listings say about short-term rentals; oceanfront-building condos by bedrooms and price band; months of supply); oceanfront condo resales and the busiest buildings; tax per $100,000 | analyze.py |
| zone-pink.json | For each of the city's 288 zoning polygons: its area in image pixels and how much of it the city's 2021 visitor-accommodation map shades (strict and with about 60 m of tolerance); the fit's overlap (IoU 0.853) | str_zones.py |
| map-str-zones.geojson | The city's zoning areas in four classes (shaded on the city's map; R zone; planned development not shaded; other not shaded) and the city limits, simplified | charts.py |
| chart-values.json | Zillow ZHVI, city of Myrtle Beach, condo and single-family, monthly from 2019-01 | charts.py |
| chart-jobs.json | BLS QCEW private leisure and hospitality jobs, Horry County, monthly 2024-01 to 2026-03 | charts.py |
| chart-str-months.json | AirROI average revenue per active listing by calendar month | charts.py |
| chart-owners.json | Condos and houses in the city: main home or not, tax bill in SC or not | charts.py |
| worked-example.json | The one-bedroom oceanfront example: asking price, AirROI income and cost share, 6 percent tax, what is left | worked.py |
| house-resales.json | Fix round 2: deed resales in the city split by the sold parcel's land use (houses alone against the rest of the 'not condo' group); the neighborhoods with the most house resales at $350,000 or less (Bent Oak Estates, Meridian, Summit at Meridian) with their district's houses, main-home share, FEMA high-risk count and straight-line miles to the coastline and the airport; listings inside the city at $300,000 or less by type (aggregate) | fix2_data.py |
| raw/google-suggestions.txt | Google search suggestions for 81 queries | pull-suggestions.sh |
| raw/mb-str-zoning-notice.html, raw/mb-planning-zoning.html | City of Myrtle Beach STR zoning news item and planning and zoning page | curl cityofmyrtlebeach.com |
| raw/mb-str-zone-map-2021.jpg | The city's map "Zones in the Myrtle Beach City Limits that Allow Visitor Accommodations (Short Term Rentals)", print date 04/05/2021, embedded on the planning page | curl cms6.revize.com (the page's image) |
| raw/census-*.json | Census tables, Myrtle Beach city and Horry County (ACS 2020-2024 B25077, B25003, B25004, B25002, B25024, B25035, B01003, B19013; 2020 DHC H1, H5; 2020 PL P1) | pull-census.sh |
| raw/sub-est2025_45.csv | Census population estimates, SC places, Vintage 2025 | copied from ../submarkets-conway/raw |
| raw/qcew-45051-*.csv | BLS QCEW Horry County, 2024 Q1 to 2026 Q1 | pull-qcew.sh |
| raw/zillow-zhvi-city-*.csv | Zillow ZHVI city rows (header plus Myrtle Beach, North Myrtle Beach, Conway, Surfside Beach): all homes, condo, single-family | pull-zillow.sh |
| raw/airroi-myrtle-beach.html/.txt | AirROI Myrtle Beach market page, updated October 1, 2026 | curl airroi.com |

Inputs from other folders: kept home sales `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (Horry County deeds recorded 2025-10-01 to 2026-09-30, 13,194 home sales). It ships in Blog-Brain `batches/2026-10-d/sell-out-of-state-buyers/web.patch`; the page reads only this folder's files.

Kept out of the repo (addresses, owner states per parcel, or size), in RAW: the city's zoning and city-limit layers, county parcels (layer 24, no owner names or streets), parcel points, address points (layer 22), every address point with a Myrtle Beach mailing city and its land use, FEMA zones (layer 19), the CRM listing pull (no addresses, firms or photos), per-parcel classes, and the image fit (`work/fit.json`).

To rerun:

```
export RAW=<scratch dir>
python3 -I fetch_gis.py            # zoning, city limits, parcels, address points, FEMA zones, parcel points
python3 -I fetch_mailing.py        # Myrtle Beach mailing-address points countywide and their land use
python3 -I pull_listings.py        # CRM listings, aggregate
python3 -I str_zones.py .          # fit the city's map image and measure each zoning polygon
SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json python3 -I analyze.py .
python3 -I charts.py . ; python3 -I worked.py .
SALES=... COAST=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I fix2_data.py
sh pull-census.sh ; sh pull-qcew.sh ; sh pull-zillow.sh ; sh pull-suggestions.sh > raw/google-suggestions.txt
```

The scripts need shapely 2, numpy and Pillow. findings.json carries no names, addresses, PINs or deed book and page. Building names appear only as the county's legal-description groups with sale counts and prices.
