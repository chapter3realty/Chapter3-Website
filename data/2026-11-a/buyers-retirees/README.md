# Data for /buyers/retirees/ (batch 2026-11-a)

Every chart and table on the page is built from a file here. Scripts write to this folder; raw downloads go in `raw/`.
No owner names, street addresses or single-listing prices are kept.

| Script | Pulls / builds | Writes |
|---|---|---|
| pull-suggestions.sh | Google search suggestions (30 searches) | raw/google-suggestions.txt |
| pull_parcels.py | Horry County parcel layer 24: the four 55+ communities' home parcels (class, sale date, owner state only) and county-wide counts by class | raw/parcels-55plus.json, raw/county-class-stats.json |
| analyze_parcels.py | Share of homes taxed at 4% (full-time home) per community and county | parcels-findings.json |
| pull-cms.sh | CMS Hospital General Information, Horry and Georgetown | raw/cms-hospitals-*.json |
| pull_drives.py | Census geocoder for hospitals; OSRM drives from each community | raw/geocodes.json, drives.json |
| pull_zones.py | Horry County HazardsMap layers 2, 3, 8 at each community point | zones.json |
| analyze_zones.py | SCEMD Know Your Zone polygons (downloaded to $RAW/scemd-evac-zones.json, 7 MB, kept out of the repo) against every home parcel | zones-findings.json |
| pull-acs.sh | Census ACS S0101 (age) and B07001 (movers by age), Horry, SC, US | raw/acs-*.json |
| pull-noaa.sh | NOAA 1991-2020 normals, Conway, Myrtle Beach, North Myrtle Beach airport | raw/noaa-*.csv |
| pull_listings.py | Chapter3 CRM map API, aggregate counts of one-level houses and 55+ listings | listings-counts.json |
| build_examples.py | Property tax on a $400,000 house (2026 levy) and three 2026 SC income tax examples | examples.json |
| build_communities.py | One row per 55+ community for the comparison table | communities.json |

Statutes and documents read are saved in raw/ (t12c006.html, t12c037.html, t12c043.html, h4216.htm, IL26-20.pdf, tax-levy-2026.pdf, scemd-annex-c-2026.pdf, lii26-86.html, lii42-3607.html).

## Added by the writer (build)

| File | What | Writes |
|---|---|---|
| pull_listings.py, re-run on build day into a scratch folder, plus one query for every one-level house under $400,000 | Aggregate counts of active listings | listings-counts-build.json |
| build_page_data.py | The one file the page reads: the researcher's files with the verifier's corrections of 2026-11-02 applied (rows 25, 35, 45, 46), the build-day listing counts, and examples.json | page-data.json |
| sctax.js | The 2026 South Carolina income tax rules of build_examples.py as one browser function. The spec checks it against the three examples on every build, and the page's calculator runs it. | (used by specs/retirees.js) |
