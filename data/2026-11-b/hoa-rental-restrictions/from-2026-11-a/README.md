# data/2026-11-a/hoa-rental-restrictions

Research data for /hoa/rental-restrictions/ (batch 2026-11-a, Lane U). Ledger: Blog-Brain `batches/2026-11-a/hoa-rental-restrictions/facts.md`. Pulled 2026-11-04.

| File | What | Made by |
|---|---|---|
| `listings.json` | Homes for sale in Horry County (CRM public map API, active MLS listings), counted in aggregate: by type (condo, townhouse, house), with and without an association fee, and by area (City of Myrtle Beach, North Myrtle Beach, Surfside Beach, Garden City, Murrells Inlet, Little River, Carolina Forest, Socastee, Conway, Longs). Three buckets per group: nightly rentals allowed (`str_allowed`), rentals allowed but not nightly, and rentals not marked as allowed. Every URL called is in `calls` (162). No address, MLS number, firm or photo. | `python3 -I pull_listings.py .` |
| `other-rules.json` | Same API: listings marked "RV or boat parking", "pets allowed" and "home office", condos and houses, houses with no association fee. | `python3 -I pull_other_rules.py .` |
| `scdca-rentals.json` | SC Department of Consumer Affairs HOA complaints, 2022 to 2025: how many mention renting in any free-text field, statewide and in Horry County. Counts and complaint numbers only. | `RAW=<scratch> python3 -I scdca_rentals.py . ../../2026-10-d/hoa-special-assessments/raw` |
| `findings.json` | Every number the page uses, with shares, built from the three files above. | `python3 -I compute.py .` |
| `chart-by-type.json`, `chart-by-area.json` | Chart rows: what listings say about renting by kind of home; nightly share by area for condos and for houses with an HOA fee. | `compute.py` |
| `raw/google-suggestions-2026-11-04.txt` | Google suggestions for 72 seeds | `sh pull-suggestions.sh` |
| `raw/spur-v-lalla-2015-5362.*` | S.C. Court of Appeals, Opinion No. 5362, The SPUR at Williams Brice Owners Ass'n v. Lalla (filed November 18, 2015) | sccourts.org |
| `raw/csa-v-wall-2017-5525.*` | S.C. Court of Appeals, Opinion No. 5525, Community Services Associates v. Wall (filed December 6, 2017) | sccourts.org |
| `raw/hanold-coa-2015-5312.*` | S.C. Court of Appeals, Opinion No. 5312, Hanold v. Watson's Orchard POA (filed April 15, 2015) | sccourts.org |
| `raw/fl-0720.306.*`, `raw/fl-0718.110.*` | 2026 Florida Statutes 720.306 (HOAs) and 718.110 (condos): rental amendments | leg.state.fl.us |
| `raw/az-33-1806.01.*` | Arizona Revised Statutes 33-1806.01 (rental property in planned communities) | azleg.gov |
| `raw/bill-3861.*`, `raw/bill-442.*` | SC bills H. 3861 and S. 442 (2025-2026), short-term rentals and local governments, status pages | scstatehouse.gov |
| `raw/scdca-hoa-cans-and-cants.*` | SCDCA, "How does a HOA know what they can and cannot do?" | consumer.sc.gov |

Inputs from other folders (reused, not pulled again):
- SC Code Title 27 Ch. 30 and Ch. 31, Fannie Mae Selling Guide B4-2.1-03: `data/2026-11-a/hoa-liens-and-foreclosure/raw/` (saved 2026-11-01 to 2026-11-04).
- SCDCA complaint workbooks: `data/2026-10-d/hoa-special-assessments/raw/scdca-legislative-20{23..26}.xlsx`.
- Local short-term rental rules: verified rows of `batches/2026-11-a/invest-where-to-buy/facts.md` (rows 1, 2, 5, 6, 8, 9) and `submarkets-myrtle-beach/facts.md` row 8.

Kept out of the repo (complaint text names people and associations): `rental-hits-private.json` in the scratch folder.

Definitions:
- **Nightly allowed:** the listing carries the CRM flag "Short-term rentals allowed" (`str_allowed`), as the listing agent marked it. Every such listing is also "Rentals allowed" (checked: `has=str_allowed&not=rentals_allowed` returns 0 for condos and houses).
- **Rentals allowed but not nightly:** `rentals_allowed` and not `str_allowed`.
- **Not marked:** `not=rentals_allowed`. This is "the listing does not say rentals are allowed", not "rentals are banned".
- **With an HOA fee:** all listings minus `hoa=0`. Every one of the 793 houses with no association fee carries `rentals_allowed`, so for houses the "not marked" group is entirely houses with a fee; the CRM appears to mark a house with no association as rentals allowed. The nightly flag is the agent's mark in both groups.
- **Area:** the CRM's own city or area field (`city=` or `has=area_*`); City of Myrtle Beach adds `inside_city_limits`.

Listing counts change daily. A rerun gives new numbers; rebuild the page from them, never edit by hand.
