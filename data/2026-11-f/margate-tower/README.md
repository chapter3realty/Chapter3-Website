# Data for /invest/condo-buildings/margate-tower/ (batch 2026-11-f, read 2026-11-17)

| File | What | Made by |
|---|---|---|
| listings.json | Condos for sale under the MLS name "Kingston Plantation - Margate Tower" (address 8500 Margate Circle): counts by bedrooms, asking middle and range, size range, HOA fee in $50 brackets, feature flags (agent-ticked MLS fields), year built | `pull_listings.py` (site map API and listing card) |
| county.json | Units, floors, county value groups, last-sale years, owner tax-bill state (counts), units taxed as a home; deed sales in two windows | `pull_county.py <dir> <website root>` (Horry County GIS layer 24, `LegalDescr LIKE 'MARGATE TOWER HPR PH I;%'`; deeds matched by parcel number) |
| flood.json | FEMA zones under the 253 parcels' footprint, with each zone's share of the footprint | `pull_flood.py` (county layers 24 and 19) |
| map-*.json | The four map searches used to confirm the place and the pins (they hold MLS numbers: scratch only, never on the page) | curl |
| raw/google-suggestions-2026-11-17.txt | Demand only | curl, suggestqueries.google.com |
| raw/kcv.txt | Kingston Resorts "Kingston Condos & Villas" page, text | curl |
| raw/pc-table.html | Post and Courier "Tallest buildings in Myrtle Beach" table, 2021 | curl |

Order: `python3 -I pull_listings.py .` (about 3 minutes), `pull_county.py . <website root>`, `pull_flood.py .`.
Never on the page: an MLS number, a unit number with a price, a single listing's price or fee, a firm, a photo, a PIN, an owner name.
No key or token is in any file here.
