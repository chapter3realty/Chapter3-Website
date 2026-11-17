# Data for /submarkets/carolina-forest/homes-for-sale/ (batch 2026-11-f)

Pulled 2026-11-17. Ledger: Blog-Brain `batches/2026-11-f/carolina-forest-homes-for-sale/facts.md`. Scripts run as `python3 -I <script> ...` (see each docstring).

| File | What | Made by |
|---|---|---|
| listings-pull.json, cards-anon.json, cards-stats.json | houses, townhouses, condos for sale in the MLS area `has=area_carolina_forest`: totals by type, one anonymous card each (price, beds, size, year, HOA fee, subdivision, ZIP; no MLS number, address, firm or photo), and the ranges built from them | pull_cf.py (cards-stats built inline from cards-anon.json) |
| strips.json, strips-extra.json, strips-extra2.json | every strip search checked live (total, cards shown); strips-list.txt is the input | strips.py |
| subs-inside.json | per subdivision: how many homes sit inside the Census place outline (counts only) | subs_inside.py |
| findings-deeds-zip.json | recorded house sales, 2025-11-01 to 2026-10-31, ZIP 29579 in tax district 100, 600 or 800 (the figures the page uses); findings-deeds-cdp.json is the same for the Census outline (not used; see facts row 22) | analyze_deeds_cf.py |
| flood.json | share of those houses inside a FEMA high-risk zone | flood_share_cf.py |
| bill-results.txt | one 2026 tax bill per tax district, Treasurer search, PIN and owner left out | pulled with data/2026-11-a/buyers-relocating-which-town/bill.py |
| carolina-forest-outline.geojson, filters.json, google-suggestions.txt | outline (Census place, from the 2026-11-a areas file), site filter keys, Google suggest | copy; curl |

Scratch, not in the repo (holds county parcel numbers): `scratchpad/cvhfs-scratch/postal-all.json` (the Conway page's pull_postal.py: county address layer 42, postal city, ZIP and subdivision for each parcel on the deed file). The deed file and parcels are the 2026-11-n builders data (`data/2026-11-n/buyers-builders/raw/`). Rerun: `python3 -I analyze_deeds_cf.py <bb dir> . zip <postal-all.json>` and `flood_share_cf.py <bb dir> . <postal-all.json>`.
