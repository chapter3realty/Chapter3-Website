# Data for /buyers/land/ (batch 2026-11-d)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-d/land/facts.md`.
No address, MLS number, listing price, firm, photo or map point is kept here. Each listing's ask, acres, ZIP and point are read in memory only.

| File | What | Made by |
|---|---|---|
| land.json | Land for sale (type=land) in Horry and Georgetown counties: totals, medians and middle halves of ask, acres and ask per acre, by county, by area (ZIP groups) and by tract size; Horry counts by feature flag and by lot size; the call log | pull_land.py (the CRM's public map API) |
| raw/land-run1.json | The first run of pull_land.py, 2026-11-13 04:40 UTC. The second run (land.json, 04:46) matches it exactly. | pull_land.py |
| gis.json | Horry County GIS zoning, town and FEMA flood zone under each Horry land listing's map point, counts only | pull_gis.py (county identify service, layers 19, 30, 31) |
| findings.json, chart-ppa-by-size.json, chart-ppa-by-area.json | What the page prints, rounded, and the two chart files | build_findings.py |
| raw/filters.json | The map API's feature keys and labels, read 2026-11-13 | curl https://chapter3realty.com/homes/api/filters |
| raw/suggest-land.json | Google search suggestions, 60 seeds | curl suggestqueries.google.com (client=firefox) |
| raw/zoning-area-stats.json | A failed try at zoning area by code (the county server refused the statistics query); not used | curl |
| raw/src/ | Source pages as read 2026-11-13: SC DES septic pages (FAQ, single home builder, site inspections, before you buy land, plat or deed, permits), DES private wells, GSWSA history and service area, Horry County zoning ordinance Appendix B (9/1/2026) and zoning districts summary, planning fee schedule FY 2027, minor plat form, building permit cost and requirements pages, the impact fee study (02/26/26), WMBF impact fee article (2026-07-21), S.C. Code Title 12 Chapter 43, SC Encyclopedia Horry County | curl, pdftotext -layout, a small HTML-to-text script |

The two large PDFs (the zoning ordinance, 15.7 MB, and the impact fee study, 7.7 MB) are kept in scratch, not here; their text copies are in raw/src/.

Rerun, in order: `python3 -I pull_land.py .` (about 85 calls at 2.1 s), `python3 -I pull_gis.py .` (about 45 API calls and 763 county calls), `python3 -I build_findings.py .`. Listings change daily; a rerun gives new numbers and the page is rebuilt from them, never edited by hand.

Notes:
- A map API search with no match returns suggested homes that do not match (2026-11-a README). pull_land.py and pull_gis.py skip bands whose total is 0 and keep only `total` pins of a band.
- Areas are ZIP groups read from the end of each pin's address line: Loris 29569, 29545, 29581; Aynor 29511, 29544; Conway 29526 to 29528; Longs 29568; Little River 29566; North Myrtle Beach 29582; Myrtle Beach 29572, 29577, 29579, 29588; Surfside Beach 29575; Murrells Inlet and Garden City 29576; Pawleys Island 29585; everything else "other".
- Ask per acre is each listing's ask divided by its acres, then the median. Four Horry listings give no acres and are left out of per-acre figures.
