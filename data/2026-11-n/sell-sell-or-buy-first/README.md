# Data for /sell/sell-or-buy-first/ (batch 2026-11-n)

Every number on the page comes from these files. Ledger: Blog-Brain `batches/2026-11-n/sell-sell-or-buy-first/facts.md`. The chooser, the chart and the timeline drawing read `chart-moves.json`, never typed.

| File | What | Made by |
|---|---|---|
| moves.json | Horry County owners who sold a home (deeds recorded 2021-07 to 2025-10) and bought another Horry County home within a year before or after: counts, order (same week, bought first, sold first), days between, price direction, builder homes, by year, a chance-match check, and the subset who still own and live in the new home (4 percent assessment). Counts only. | match_moves.py |
| moves-strict.json | The same with names on 2 or fewer deeds (a check that the result does not depend on the name filter) | match_moves.py with MAXF=2 |
| timing.json | Zillow's median days to pending and mean days to close, Myrtle Beach, SC metro and United States, last 12 months | timing.py |
| chart-moves.json | The rows the page uses | build_charts.py |
| raw/google-suggestions.txt | Google search suggestions for 59 queries | pull-suggestions.sh |
| sources/ | Fannie Mae Selling Guide B2-1.1-01, B3-4.3-14, B3-6-06 and the South Carolina REALTORS legal FAQ on SCR504 (HTML, read 2026-11-08) | downloaded |

Reused, not pulled again: the deed index and parcel file of `data/2026-11-n/sell-best-time-to-sell/` (`pull_deeds.py`, `fetch_parcels.py`) and its Zillow raw files (`raw/zillow-*.csv`). Their raw deed rows carry party names, so they stay in the scratchpad (`wfn/sell-best-time-to-sell/raw/`). The SC REALTORS forms 310, 504 and 505 (1/2020) are SCR's copyright and are not stored here; the ledger gives their public URLs.

To rerun:

```
RAW=<scratch>/wfn/sell-best-time-to-sell/raw OUT=<scratch>/wfn/sell-sell-or-buy-first/raw python3 -I match_moves.py <this dir>
OUT=<scratch>/wfn/sell-sell-or-buy-first/raw python3 -I fetch_assess.py          # today's assessment of each purchased home
RAW=<scratch>/wfn/sell-best-time-to-sell/raw OUT=<scratch>/wfn/sell-sell-or-buy-first/raw python3 -I match_moves.py <this dir>   # again, now with the 4 percent check
MAXF=2 NAME=moves-strict.json RAW=... OUT=<a copy of OUT with assess.json> python3 -I match_moves.py <this dir>
python3 -I timing.py <this dir> <web>/data/2026-11-n/sell-best-time-to-sell
python3 -I build_charts.py <this dir>
```

Method limits (also in `moves.json` `meta.limits`): the deed index names only the first seller and the first buyer, so a couple listed in a different order on the two deeds, or a purchase in a trust's name, is missed. The count is a floor. Dates are recording dates.
