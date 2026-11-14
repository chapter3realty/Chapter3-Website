# Data for /hoa/fees-by-neighborhood/ (batch 2026-11-d)

Counted 2026-11-13 (homes for sale; the CRM feed was refreshed at 21:00 UTC). Ledger: Blog-Brain `batches/2026-11-d/hoa-fees-by-neighborhood/facts.md`. Every number the page prints comes from a file here.

| File | What | Made by | From |
|---|---|---|---|
| hoa-by-neighborhood.json | Every MLS subdivision name with 3 or more houses, townhomes or manufactured homes for sale between Calabash and Pawleys Island (406 names): homes by kind, towns, zip codes, the monthly HOA fee (lowest, quartiles, middle, highest, in whole dollars), how many list no fee and how many say there is no HOA, list-price middle and range, year-built range, a center point to 3 decimals | pull_hoa_neighborhoods.py, refine_exact.py | chapter3realty.com public map API and listing card (CCMLS feed) |
| hoa-includes.json | Per name: how many listings tick lawn care, internet, cable, trash, water and sewer, insurance in the fee; a community pool, clubhouse, tennis; the CRM's Carolina Forest and Socastee area tags (all homes, and among homes with a fee) | pull_includes.py | same API, `has=<flag>` |
| table.json | The page's table: one row per South Carolina neighborhood (382), with town, kind, homes, fee range, what the fee includes, what it has, leased land, its own page | analyze.py | the two files above and sibling-pages.json |
| findings.json | The counts the page prints (bands, middles, lawn and pool comparisons, by town, Carolina Forest, the biggest, the lowest and highest) | analyze.py | table.json |
| sibling-pages.json | MLS name to the site page that owns that community | by hand, from the live pages | chapter3realty/ |
| raw/google-suggestions.txt | Google suggestions for 17 seeds | pull-suggestions.sh | suggestqueries.google.com |
| raw/*.txt | Page text: Cresswind Myrtle Beach association (About), Waterbridge HOA (About), Ocean Lakes (Annual Lease Sales), Toll Brothers Townes of Prince Creek West (two excerpts, no financing text) | curl | URL on each file's first line |

Kept out of the repo, in CACHE (scratch): homes.json (MLS number, kind, price, point), cards.json (subdivision, city, zip per MLS number), fees.json and exact.json (fee per MLS number), flagsets.json (MLS numbers per flag). No MLS number, address, listing firm or photo reaches a file here.

## Method in short

1. Every house, townhouse and manufactured home for sale ($50,000 and up) in three 25-mile circles (North Myrtle Beach, Myrtle Beach, Murrells Inlet), split by price until each search returns all its homes (the map returns at most 144 pins; a listing with no map point is never on the map): 4,213 homes.
2. Each home's MLS subdivision name from its public card. Grouped by exact name (case and spaces folded). 406 names have 3 or more homes.
3. Each home's fee, by halving with the site's own filter `hoaMax` (houses: subdivision=<name>&type=<kind>&hoaMax=T): first to a step ($10 to $600, $50 to $1,500, then $2,000 and $3,000), then to the dollar inside it (refine_exact.py). `hoa=0` counts the listings that say there is no HOA.
4. The flags are fetched once for the whole area per kind of home (`has=<flag>`, same circles) and matched to each name's homes.
5. analyze.py keeps South Carolina (drops 19 names whose homes are mostly in a 28xxx zip), drops MLS placeholders ("Not Within a Project/Section Code") and 4 names the search ignores ("@" or a curly apostrophe), marks leased land (Ocean Lakes, Lakeside Crossing, Apache Campground), and builds the rows.

## Limits

- The fee is what the listing says, not the HOA's budget. Agents type it; a home in two associations may list one fee or both.
- MLS names are typed by agents: one community can appear under more than one name (a sub-neighborhood and its master name).
- Edgefield and Waterfall keep the top of their $10 step (the exact pass failed when the API began to answer 503 "stale" at about 21:30 UTC). hoa-by-neighborhood.json's feed time is copied from the 21:03 UTC run for the same reason (`meta_note`).
- "gated" is not used (ticked on 24 of 26 Waterbridge houses; no source calls Waterbridge gated).

## To rerun (about 30 minutes; every step resumes from CACHE)

```
export CACHE=<scratch dir>
python3 -I pull_hoa_neighborhoods.py .
python3 -I refine_exact.py
python3 -I pull_hoa_neighborhoods.py .
python3 -I pull_includes.py .
python3 -I analyze.py .
sh pull-suggestions.sh > raw/google-suggestions.txt
```

Start with an empty CACHE for a fresh count; a CACHE from an earlier day re-uses that day's homes.
