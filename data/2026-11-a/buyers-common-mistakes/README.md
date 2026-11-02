# Data for /buyers/common-mistakes/ (batch 2026-11-a)

Every chart, table and number on the page comes from a file here. Ledger: Blog-Brain `batches/2026-11-a/buyers-common-mistakes/facts.md`.
No owner names, street addresses, PINs, single-listing prices or photos are kept in this folder. Raw pulls that carry them stay in PRIVATE (a scratch folder outside the repo).

| Script | Pulls / builds | Writes |
|---|---|---|
| pull-suggestions.sh | Google search suggestions for 40 searches | raw/google-suggestions.txt |
| pull_parcels.py | Horry County GIS layer 24 (parcels) and 22 (address points) for every home whose last sale is in 2024-2025 or 2018-2019 | PRIVATE/parcels-*.json, PRIVATE/addresses-*.json |
| analyze_parcels.py | Houses owned by a person, tax bill mailed to the house itself, by assessment class (4% or 6%) and year bought; yearly tax gap in district 100 | parcels-findings.json |
| fetch_fema_policies.py | OpenFEMA NfipPolicies v3, Horry County, policies effective 2025-09-01 to 2026-08-31 | PRIVATE/nfip-policies-horry-2025-26.json (12 MB) |
| analyze_fema.py | Median flood policy cost for one-family houses by flood zone, lived in or not | fema-findings.json |
| analyze_claims.py | Median FEMA building payment per paid claim on a house, by rated zone, all years and since 2015 (input: the sibling page's slim claims file, data/2026-10-d/buyers-undisclosed-flooding/raw/nfip-claims-horry-slim.json) | claims-findings.json |
| pull_listing_points.py | CRM map API: every house and condo for sale (MLS number and point only) and the ones whose MLS entry has the "flood zone" feature; Horry GIS layer 19 FEMA high-risk polygons | PRIVATE/listing-points.json, PRIVATE/flood-sfha.json |
| analyze_flood_tag.py | Homes for sale inside FEMA's high-risk zone, and how many say "flood zone" in the listing features | flood-tag-findings.json |
| pull_listings.py | CRM map API aggregate counts: houses on septic, public sewer and well water, by town and price band; flood-zone tags; condo rental tags | listings-counts.json |
| build_examples.py | Tax on a $350,000 house at 4% and 6% (2026 millage), the seller's-bill example, one flood against a year of cover | examples.json |
| pull_condo_age.py | CRM map API aggregate counts: condos for sale, and those built 1996 or earlier (ledger row 34), pulled on build day | condo-age.json |
| (by hand) | Three photo licence records reused from records already on the site; see each record's reused_from | photos.json |

Saved sources (raw/): SC Code chapters 12-24, 12-37, 12-43, 12-45, 12-54, 12-60, 27-50, 40-57 (html and text); Horry County Legal Residence documents checklist (spa-required-docs.pdf/.txt); Horry County news, 'Legal Residence' applications due May 31 (2025); City of Myrtle Beach planning page (short-term rentals); NAR settlement facts page; Fannie Mae Selling Guide B3-3.1-07; OpenFEMA NfipPolicies field definitions.

To rerun: `export PRIVATE=<scratch dir>`, then
```
sh pull-suggestions.sh > raw/google-suggestions.txt
python3 -I pull_parcels.py && python3 -I analyze_parcels.py .
python3 -I fetch_fema_policies.py && python3 -I analyze_fema.py .
python3 -I analyze_claims.py . ../../2026-10-d/buyers-undisclosed-flooding/raw/nfip-claims-horry-slim.json
python3 -I pull_listing_points.py && python3 -I analyze_flood_tag.py .   # needs shapely 2
python3 -I pull_listings.py .
python3 -I build_examples.py .
python3 -I pull_condo_age.py .
```
