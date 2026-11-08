# Data for /sell/seller-disclosure/ (batch 2026-11-n)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-n/sell-seller-disclosure/facts.md`. Pulled 2026-11-08 unless a row says otherwise.

| File | What | Made by |
|---|---|---|
| form-checklist.json | The state form's 9 parts, 28 numbered questions, its main "Describe" lines and the 11 addendum questions, each with a short phrase copied from the form and our plain label; flags for "during your ownership" and water or coast | build_form_checklist.py (stops if a phrase is not in the form's text) |
| seaward-findings.json | Residential parcels in Horry County that lie in whole or in part seaward of the state's beachfront setback line (the contract disclosure of SC Code 48-39-330), by kind and by beach | fetch_beachfront.py, then query_seaward_parcels.py |
| ownership-findings.json | Homes whose last recorded sale is before Hurricane Matthew (2016-10-08), Florence (2018-09-14) or Ian (2022-09-30), county-wide and in FEMA's high-risk zone, by kind | analyze_ownership.py |
| acs-findings.json | Share of homes built before 1970 and before 1980, Horry County and its towns (lead rule) | pull-acs.sh, then analyze_acs.py |
| raw/t27c050.html, raw/t48c039.html, raw/t15c003.html, raw/t40c057.html | SC Code chapters, saved 2026-11-08 from https://www.scstatehouse.gov/code/statmast.php?title=27&chapter=50 (and title 48 ch. 39, title 15 ch. 3, title 40 ch. 57). The old t27c050.php links now redirect there. | curl |
| raw/sc-disclosure-06-2025.pdf, .txt | The Real Estate Commission's form and addendum, Effective 6/2023; Updated 6/2025 (md5 393ba8c3af8a7a1f0f0a2802e26ecd5c), and its text by `pdftotext -layout` | curl, pdftotext |
| raw/llr-re-resources.html | The commission's resources page that links the form | curl |
| raw/epa-lead-disclosure.html | EPA, Real Estate Disclosures about Potential Lead Hazards | curl |
| raw/setback-current.json, raw/baseline-current.json, raw/setback-layer-meta.json | SC DES Shorelines MapServer layers 3 (Current Setbackline) and 2 (Current Baseline), Horry beaches, WGS84 | fetch_beachfront.py |
| raw/acs*.json | Census ACS B25034 (year structure built): 2020-2024 5-year for SC places and Horry County, 2025 1-year for Horry County, and the table's variable labels | pull-acs.sh |
| raw/google-suggestions.txt | Google search suggestions for 44 queries | pull-suggestions.sh |

Kept out of the repo (large, or parcel-level with PINs): the county's residential parcels, address points and FEMA high-risk zone polygons (the sibling pull of 2026-11-01, made by `data/2026-10-d/buyers-undisclosed-flooding/fetch_county.py`, kept in the session scratch `wf2/buyers-undisclosed-flooding/raw-big/`), and the seaward parcel rows (`wfn/sell-seller-disclosure/raw-big/seaward-parcels.json`).

To rerun: `python3 -I fetch_beachfront.py`; `RAW=<scratch> python3 -I query_seaward_parcels.py`; `RAW=<dir with res-parcels.json, addresses-points.json, flood-sfha.json> python3 -I analyze_ownership.py`; `sh pull-acs.sh .` then `python3 -I analyze_acs.py`; `python3 -I build_form_checklist.py`. shapely 2 is needed for the two GIS scripts.

Method notes:
- Seaward parcels: a band 0.004 degrees (about 400 m) wide on the ocean side of each setback line piece (the side that covers less of the county's land), clipped to the county with a 50 m margin. The county's parcel layer (parcelapp layer 24) is asked which parcels intersect the band, with paging. A parcel counts when it touches the band within 150 m of the line (177 parcels farther out, across inlets, are dropped). Condo units are separate parcels (land use 107), so a building counts once per unit. Kind of home by land use code as in the sibling ledger `batches/2026-10-d/sell-out-of-state-buyers/facts.md` row 1.
- Ownership: "last recorded sale" is the county parcel field SaleDate. A transfer the county does not record as a sale (for example a deed into a trust) may not change it, so the count is of homes whose last recorded sale is before the storm, not proof of the same owner.
- Year built: the Census groups years by decade, so the share built before 1978 lies between the "before 1970" and "before 1980" shares.
