# data/2026-11-a/invest-financing-multiple-rentals

Research data for /invest/financing-multiple-rentals/ (batch 2026-11-a). Ledger: Blog-Brain `batches/2026-11-a/invest-financing-multiple-rentals/facts.md`. Pulled 2026-11-04.

| File | What | Made by |
|---|---|---|
| `equity-by-year.json` | Zillow Home Value Index, Myrtle Beach metro, single-family, middle third: the September value for each purchase year 2012 to 2025 against September 2026, the gain, the peak, and the worked equity example (cap from Freddie Mac's table, an assumed $150,000 still owed). Chart rows for "what the first rental can give". | `python3 -I build_equity.py . ../invest-rent-prices/raw/zillow/Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv` |
| `examples.json` | The worked examples: rent counted (75 and 50 percent), the reserve for a second rental, two houses empty three months. Inputs are /invest/run-the-numbers/ worked example 1 (verified rows 17 and 30) and `equity-by-year.json`. No rate and no loan payment. | `python3 -I build_examples.py .` |
| `repeat-buyers.json` | Our count from county deeds: buyers with two or more home purchases recorded 2025-10-01 to 2026-09-30, by kind (person, company, builder, institution) and by number of homes; what they bought (median price, condo share, tax-bill state); days between two purchases. Counts only. | `DEEDS=<scratch deed weeks> RAW=<scratch> python3 -I analyze_repeat.py . ../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json` |
| `owner-counts.json` | Our count from the county parcel layer: owners of two or more homes taxed at the 6 percent ratio, by kind and by number of homes. Counts only. | `RAW=<scratch> python3 -I pull_owner_counts.py .` then `RAW=<scratch> python3 -I analyze_owners.py .` |
| `listings.json` | Active listings on the CRM's public map API, counted in aggregate: houses (3+ bedrooms), condos and townhouses (2+) at or under the median price repeat buyers paid. Every API URL called is in `calls`. | `python3 -I pull_listings.py .` |
| `verify/verify-recounts.json` | Verifier recount, 2026-11-04 (counts only): repeat buyers and 6 percent owners with a person's trust counted as a person and resort, timeshare, association and charity owners left out; active listings in Horry County only (`has=county_horry`). Ledger rows 24 to 27 use these. | `DEEDS=<scratch deed weeks> RAW=<scratch> python3 -I verify/verify_recount.py . ../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json verify/verify-recounts.json` |
| `raw/fnma-*.txt` | Fannie Mae Selling Guide sections (text copies), read 2026-11-04 | curl selling-guide.fanniemae.com |
| `raw/fhlmc-ltv.txt` | Freddie Mac maximum LTV table (text copy) | curl sf.freddiemac.com |
| `raw/owner-count-queries.json` | The parcel-layer count queries, with URLs and totals | `pull_owner_counts.py` |
| `raw/google-suggestions.txt` | Google search suggestions for 36 seed queries | `sh pull-suggestions.sh > raw/google-suggestions.txt` |

Inputs reused from other folders (not re-pulled): the 2026-10-d deed pull (`data/2026-10-d/sell-out-of-state-buyers/`, 30,339 deeds, 13,194 kept home sales); Zillow ZHVI from `data/2026-11-a/invest-rent-prices/raw/zillow/`; the example house from `data/2026-11-a/invest-run-the-numbers/` (ledger rows 11, 17, 30).

Kept out of the repo (owner names and PINs), in the scratch RAW folder `wf2/invest-financing-multiple-rentals/raw/`: `homes-6pct.json` (every 6 percent home with owner name), `repeat-pins.json`. The raw deed weeks (with grantee names) are in scratch `wf2/sell-fsbo/verify/deeds/`.

Definitions:
- **Home:** a residential parcel (land use 1xx) with a building value.
- **6 percent home:** assessed value 5.5 to 6.5 percent of taxable value; not the owner's legal residence (rentals, second homes, company-held homes, unsold builder homes).
- **Repeat buyer:** the same first-named grantee (letters and digits only) on two or more kept home sales of different parcels. A floor: name order and spelling differences split one buyer in two.
- **Left out of both counts:** builders, banks, government and loan agencies, Opendoor and Offerpad, relocation firms, REO servicers, associations (regexes in the scripts).
