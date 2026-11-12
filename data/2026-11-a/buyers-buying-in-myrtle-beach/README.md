# Data for /buyers/buying-in-myrtle-beach/ (batch 2026-11-a)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-a/buyers-buying-in-myrtle-beach/facts.md`.
No MLS numbers, map points, parcel numbers, names or addresses are kept here. Raw pulls that carry them stay in RAW (a scratch folder outside the repo).

| File | What | Made by |
|---|---|---|
| market.json | The page's chart and key facts: months of supply for houses and condos (all, resale, new), by price band; price cuts; listings over 90 days; median asking price | build_market.py |
| town-table.json | The page's town table: middle resale price (carried from /sell/home-value/) and resale months of supply, houses and condos, ten towns | build_towns.py |
| findings.json | Listing counts inside Horry County by kind, subset and price band; resale and builder counts from the filtered deed file | analyze.py |
| new-sales.json | Builder sales by kind, month and price band from the full deed file (the building-value filter removed) | analyze_new.py |
| towns.json | Sales and listings by Census place | analyze_towns.py |
| raw/google-suggestions.txt | Google search suggestions for 48 searches | pull-suggestions.sh |
| raw/src/ | Copies of the primary sources read: SC Code 8-21, 27-50, 40-57; SC Regs ch. 27 (CL-100, 27-1085 K); Doe v. McMaster; CFPB Loan Estimate and Closing Disclosure; Horry County Register of Deeds; Texas A&M Real Estate Research Center 1897; NAR September 2026 release | curl |

Inputs reused from siblings (not copied):
- `data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json`: 13,194 deed sales, Oct 2025 to Sep 2026 (resales are complete; builder sales are not, see facts.md row 2).
- `data/2026-10-d/buyers-new-construction/raw/deeds-slim.json`, `raw/parcels.json`, `verify_build_deeds.py`: the full deed file and the verified builder rule.
- `data/2026-10-d/sell-home-value/findings.json` (by_area, by_month, fhfa) and `raw/horry-county.json` (county outline).
- `data/2026-11-a/invest-where-to-buy/raw/places.json`: Census place outlines.

To rerun (RAW = a scratch folder):

```
RAW=$RAW SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json python3 -I fetch_landuse.py
RAW=$RAW python3 -I pull_listings.py
RAW=$RAW SALES=../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json HORRY=../../2026-10-d/sell-home-value/raw/horry-county.json python3 -I analyze.py .
NC=../../2026-10-d/buyers-new-construction python3 -I analyze_new.py .
python3 -I build_market.py .
RAW=$RAW SALES=... HORRY=... PLACES=../invest-where-to-buy/raw/places.json python3 -I analyze_towns.py .
SHV=../../2026-10-d/sell-home-value/findings.json python3 -I build_towns.py .
```
