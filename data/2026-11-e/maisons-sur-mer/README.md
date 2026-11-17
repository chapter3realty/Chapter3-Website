# Data for /invest/condo-buildings/maisons-sur-mer/ (batch 2026-11-e)

Read 2026-11-14. Every number the page prints comes from these files. Ledger: Blog-Brain `batches/2026-11-e/maisons-sur-mer/facts.md` (its README section says what changed from the Palace and Bay View scripts).

| File | What | Made by |
|---|---|---|
| listings.json | Condos for sale at 9650 Shore Dr (MLS subdivision "Maisons Sur-Mer"): counts, asking middle and range, size range, HOA fee in $25 brackets and to the dollar (`fee_exact`, `fee_by_size`), feature flags, year built. Every map URL called. | `pull_listings.py`, `pull_fee_exact.py`, `pull_fee_by_size.py` |
| county.json | Units, floors, county value groups, last-deed year, owner mailing state (counts), units taxed as a home, deed sales in two windows, `sales_by_value` | `pull_county.py <dir> <website root>`, `pull_sales_by_value.py` |
| flood.json | FEMA zones under the parcel footprint | `pull_flood.py` |
| taxbills.json | The Treasurer's real 2026 bills for 16 sampled units, in aggregate | `NODE_USE_ENV_PROXY=1 node pull_taxbills.mjs .` |
| raw/ | `parcels-raw.json` (county parcels with owner fields and PINs: scratch, never publish or commit), zoning and municipality point queries, Google suggestions, the association's pages | curl |

Never in these files (except `raw/parcels-raw.json`): an MLS number, a unit number with a price, a single listing's price or fee, a firm, a photo, a PIN, an owner name or a single unit's county or tax record.
