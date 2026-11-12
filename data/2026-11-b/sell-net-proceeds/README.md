# Data for /sell/net-proceeds/ (batch 2026-11-b)

Every number on the page comes from `findings.json`, which `build_findings.py` builds. Ledger: Blog-Brain `batches/2026-11-b/sell-net-proceeds/facts.md`. No MLS numbers, map points, addresses or names are kept here. The raw listing pull (MLS numbers, prices, points) stays in scratch (`scratchpad/np-raw/listings-net-proceeds.json`).

Copied from batch 2026-11-a's folder (its web.patch was never applied), then re-run on 2026-11-09. Bracketed row numbers inside the scripts are 2026-11-a ledger rows; the 2026-11-b ledger maps each to its new row.

| File | What | Made by |
|---|---|---|
| findings.json | The page's numbers: costs by price tier (now with `fixed_pct`, the share of the price the law sets, and `fixed_no_mortgage`), the tax proration example, the withholding example, deed fees in 12 months, homes by tax-bill state, homes for sale with a price cut or a home warranty | build_findings.py |
| listings.json | Homes for sale now inside the Census Horry County outline: price cuts and home warranties, by type and price band (counts only). Pulled 2026-11-09T03:07Z. | pull_listings.py (with the 2026-11-a verifier's empty-band fix) |
| findings-2026-11-a.json, listings-2026-11-a.json | The 2026-11-a outputs, kept for comparison. Their listing counts carry the fallback-pin fault; do not use them. | 2026-11-a |
| verify_recount.py, verify-recount.json | The 2026-11-a verifier's recount | 2026-11-a verifier |
| raw/google-suggestions.txt | Google search suggestions for 49 searches (2026-11-04) | pull-suggestions.sh |
| raw/gsc-seller-queries.txt | Search Console lines for this page and the seller-cost queries, from the owner's two exports of 2026-11-06 | grep, 2026-11-09 |
| raw/src/ | Primary sources read: SC Code 12-8, 12-24, 12-43, 12-45, 27-1, 27-30, 27-31, 29-3; CFPB Reg Z 1026.36 and the payoff answer; IRS Pub 523, Topic 701 and the 1099-S instructions; Horry County treasurer and register of deeds pages; SC Bar Ethics Advisory Opinion 11-06 (new, PDF and text) | curl. SC Realtors Form 310 is copyrighted and stays out of the repo; the ledger quotes the lines used. |

Inputs reused from siblings (not copied):
- `data/2026-10-d/sell-home-value/findings.json` (county_all: resale prices) and `raw/horry-county.json` (county outline).
- `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` (13,194 recorded home sales, Oct 2025 to Sep 2026) and `raw/stock-by-state-condo.json`, `raw/stock-by-state-house.json` (homes by tax-bill state).

To rerun (RAW = a scratch folder outside the repo), from the website repo root:

```
RAW=$RAW HORRY=data/2026-10-d/sell-home-value/raw/horry-county.json python3 -I data/2026-11-b/sell-net-proceeds/pull_listings.py data/2026-11-b/sell-net-proceeds
python3 -I data/2026-11-b/sell-net-proceeds/build_findings.py .
```

Verifier, 2026-11-09: `verify2_recount.py` (own recount of a fresh `pull_listings.py` run, shapely polygon test) and `verify2_hoa.py` (houses, townhouses and condos with no HOA fee, same outline) wrote `verify2-recount.json`. Counts match `listings.json` exactly. Run: `python3 -I verify2_recount.py <RAW>/listings-net-proceeds.json data/2026-10-d/sell-home-value/raw/horry-county.json`.
