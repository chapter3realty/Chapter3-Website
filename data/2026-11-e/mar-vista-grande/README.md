# Data for /invest/condo-buildings/mar-vista-grande/ (batch 2026-11-e)

Read 2026-11-14. Ledger: Blog-Brain `batches/2026-11-e/mar-vista-grande/facts.md`. Methods are the Palace pilot's (data/2026-11-d/palace-resort), changed for this address.

| File | What | Made by |
|---|---|---|
| listings.json | Condos for sale at 603 S Ocean Blvd, North Myrtle Beach (MLS subdivision "Mar Vista Grande"): count, asking middle and range, size range, HOA fee in $25 brackets and to the dollar (`fee_exact`), feature flags, year built (counts) | `pull_listings.py`, then `pull_fee_exact.py` (site map API and listing card) |
| county.json | Units, floor groups, county value groups (counts), last-sale year, owner mailing state (counts), units taxed as a home; deed sales in two windows | `pull_county.py . <website root>` (Horry County GIS layer 24; deeds from data/2026-10-d and data/2026-11-n) |
| flood.json | FEMA zones under the parcels, share of area | `pull_flood.py` (county layers 24 and 19) |
| tax.json | County taxable values at the 6 percent rate and the tax they imply at North Myrtle Beach 221.2 mills | `pull_tax.py` |
| nearby.json | Oceanfront condos for sale within a mile: count and year-built bands (counts) | `pull_nearby.py` |
| osm-near.json | Named places near the footprint centre, from OpenStreetMap (ODbL), metres in a straight line | `osm_near.py` on raw/osm-bbox-wide-2026-11-14.xml |
| raw/ | Google suggestions (demand only), two competitor pages as read (not copied), the OSM extract, run logs | curl |

Never in these files: an MLS number, a unit number with a price, a single listing's price, fee or address line, a firm, an owner, a PIN, or one unit's county value.
Rerun order: pull_listings, pull_fee_exact, pull_county, pull_flood, pull_tax, pull_nearby, osm_near.
