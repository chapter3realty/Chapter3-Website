# Data for /submarkets/north-myrtle-beach/cherry-grove/ (batch 2026-11-f)

Pulled 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/cherry-grove/facts.md`. No address, MLS number, PIN or owner name is saved. No key or token is in raw/.

| File | What | Made by |
|---|---|---|
| pull_county.py, county.json | Parcels of the old Cherry Grove plats (legal description starts CHERRY GROVE): houses, lots, condos, tax ratio, owner mailing state counts, county value; house sales 2025-11-01 to 2026-10-31 matched by parcel number | county GIS layer 24; deeds-co.json from data/2026-11-n |
| pull_listings.py, listings.json | Homes for sale within 0.8 mile of the site's Cherry Grove point: counts, asking prices by type, flags, HOA fee brackets | chapter3realty.com/homes/api/map |
| check_strips.py, strips.json | Live count of every search a strip uses (map and strip API) | same |
| pull_drives.py, drives.json | Drive minutes from Cherry Grove Pier (OSRM, free flow) | router.project-osrm.org |
| raw/map-sub.json, map-circle.json | Raw map answers for `subdivision=Cherry Grove` (32) and the circle (79) | curl |
| raw/google-suggestions-2026-11-17.txt | Google suggest for 12 queries | curl |
| raw/pier.txt, pier-home.txt, nmb-parks.txt, park-fireworks.txt | Text extracts of the pier's pages and two city pages | curl |

Channel-house, flood-share, sales-by-part and tax numbers come from the North Myrtle Beach page's folder `data/2026-11-a/submarkets-north-myrtle-beach/` (findings.json), verified 2026-11-03. Rerun the county and listing pulls with `python3 -I <script> <this dir> [<website root>]`.
