# data/2026-11-a/invest-property-management

Research data for /invest/property-management/ (batch 2026-11-a, Lane U). Ledger: Blog-Brain `batches/2026-11-a/invest-property-management/facts.md`. Pulled 2026-11-04. Charts and tables read `findings.json`; no number is typed into the spec.

| File | What | Made by |
|---|---|---|
| `raw/owner-distance.json` | Horry County GIS parcel layer 24, homes with a building (LandUseCode LIKE '1%', MarketImprv > 0), split by the 4 percent legal-residence ratio (AssessedProp < TaxableProp*0.05) and the 6 percent ratio, and by condo (LegalDescr has HPR) or not. Counts by owner tax-bill state, and for SC by ZIP. Every query URL. No owner names read. | `python3 -I fetch_owner_distance.py .` |
| `raw/bulk-addresses.json` | Mailing addresses (street + ZIP + state) that receive 10 or more 6 percent tax bills: timeshare and resort companies, builders, large landlords, managers. Used to show the share for individual owners. | `python3 -I fetch_bulk_addresses.py .` |
| `owner-distance.json` | Shares by where the tax bill goes: Grand Strand ZIPs (the 21 Horry County post-office ZIPs plus 29585 Pawleys Island), elsewhere in SC, NC, other states, abroad. All owners, and without the bulk addresses. | `python3 -I analyze_owner_distance.py .` |
| `fee-pages.json`, `raw/fees/` | The owner-fee pages of managers that serve Horry County, saved as HTML and text with the date read (`raw/fees/index.json`). | `python3 -I fetch_fee_pages.py .` |
| `fees.json` | The published fee terms copied from `raw/fees/*.txt`, with line numbers; firms kept and firms left out, with the reason. Typed from the saved pages; the verifier re-reads each line. | by hand from `raw/fees/` |
| `raw/law/` | SC Code Title 40 Ch. 57 and Title 27 Ch. 40 and Title 12 Ch. 36, SCDOR accommodations tax page, Horry County hospitality fee page, City of Myrtle Beach business FAQ, IRS Publication 527, as HTML and text. | curl, 2026-11-04 |
| `raw/google-suggestions.txt` | Google search suggestions, 45 queries. | `sh pull-suggestions.sh > raw/google-suggestions.txt` |
| `findings.json` | Every derived number: owner distance, the published fee summary, the worked year for a 3-bedroom house, the short-term year. | `python3 -I build_findings.py .` |

Reused, not pulled again (lead, 2026-11-03):
- `../invest-rent-prices/findings.json`: `new_vs_long_lease_3br.moved_in_last_2y` (about $1,600 lease rent for a 3-bedroom house with a tenant who moved in within two years; rent-prices ledger row 7) and `pums_detached_moved_in` (share of rented houses whose tenant moved in within 12 months, from `../invest-rent-prices/pums-2024-5yr.json`, made by `analyze_pums.py` there).
- `../invest-condos/listings.json`: vacation rental program flags on condos for sale (invest-condos ledger row 17).
- `../2026-10-d/sell-out-of-state-buyers/raw/stock-by-state*.json`: the same parcel layer counted by mailing state for all homes (2026-10-d ledger row 6). Our counts split it by tax ratio.
- `../../str-market.json`: Myrtle Beach market revenue and the owner-observed management ranges ("management").

Rerun order: fetch_owner_distance.py, fetch_bulk_addresses.py, analyze_owner_distance.py, fetch_fee_pages.py, build_findings.py.

Blocked: the SC LLR licence lookup (verify.llronline.com) requires a reCAPTCHA, so licence counts by county were not pulled. LLR sells licensee lists through a request form (llr.sc.gov/re/resources.aspx, "Sample Licensee List Request Form"). Wikimedia Commons answered 429 (rate limit) on 2026-11-04.
