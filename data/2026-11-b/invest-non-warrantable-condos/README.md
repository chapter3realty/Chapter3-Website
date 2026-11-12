# Data for /invest/non-warrantable-condos/ (batch 2026-11-b)

Every number the page prints from local data comes from `findings.json`, `chart-owner-homes.json` or `table-buildings.json` (built by `build_findings.py`). Ledger: Blog-Brain `batches/2026-11-b/invest-non-warrantable-condos/facts.md`.

| File | What | Made by |
|---|---|---|
| owners.json | Per directory building and per county regime: condo units, units taxed at the 4% legal-residence ratio, the share held by the single owner name with the most units (and whether that name reads as a company, an association or a person), owners with 2 or more units, out-of-state owner units. Counts only. | `pull_owners.py` (Horry County GIS layer 24; regime names from `regimes-fixed.json`, CB regimes.json with the CB verifier row 5 fixes applied) |
| control.json | The same 4% count for Seagate Village, an inland FHA-approved condo community, to show the method separates homes from rentals | `pull_control.py` |
| program.json | Per directory building: condos for sale now and how many carry the listing's rental-program flag, with every URL called | `pull_program.py` (the CRM's public map API, CCMLS active listings) |
| hud-horry-all.json, raw/hud-condos-horry-*.html | HUD's FHA condo list for Horry County, every status (117 records): project name, ID, address, status, dates. Public project records. | `pull_hud_all.py` (all pages); `pull-hud-condos.sh` (first page, Approved and All; copied from 2026-11-a/buyers-va-loans) |
| findings.json, chart-owner-homes.json, table-buildings.json | What the page prints, the one chart, and the building table | `build_findings.py` |
| raw/dl/fannie-*.html, .txt | Fannie Mae Selling Guide B4-2.1-03 (11/04/2026, copied from ../invest-condotel-financing/raw/dl), B4-2.2-01 (08/05/2026), B7-3-03 (08/05/2026), read 2026-11-10 | curl |
| raw/google-suggestions-2026-11-10.txt | Google suggestions for 43 seeds | `pull-suggestions.sh` |

Rerun, in order: `python3 -I pull_owners.py .`, `python3 -I pull_control.py .`, `python3 -I pull_program.py .` (about 94 calls at 2.1 s), `python3 -I pull_hud_all.py .`, `python3 -I build_findings.py .`. Listing counts change daily; parcel owners change with every deed. A rerun gives new numbers and the page is rebuilt from them.

Method limits (say them in the sources box, not the copy):
- The 4% ratio is the county's legal-residence rate; an owner who lives in the unit but never applied is counted with the 6% units. The share is a floor for owner-occupied units.
- The single-owner count matches exact owner names after removing punctuation and spaces. Fannie Mae counts one "individual, investor group, partnership, project sponsor, or corporation", so related companies under different names (for example "AVISTA DEVELOPMENT LLC" and "AVISTA DEV LLC") are not added together here. The count is a floor.
- A regime is the county's name for one condo regime; a resort can hold several (SeaWatch has three). Fannie's 20% test applies to the project a lender reviews, so the table reports the largest share in any regime of 21 or more units.
- 43 of the 47 directory buildings have a county regime count (Island Vista and Ocean Drive Beach & Golf have no match; Myrtle Beach Resort and Ocean Creek are left out because their regimes are incomplete, CB VERIFY row 5). Rebuilt 2026-11-10 on these names; the first run is in raw/*-before-cb-fixes.json.

Never in these files: an owner name, a PIN, a unit number, a single listing's price or address, or an assessed value. (Owner names were read in memory to count them, then dropped.)

## Verifier files (raw/verify/, 2026-11-10)

| File | What |
|---|---|
| regimes-cb-fixes.json | The regime names changed to apply CB VERIFY row 5 (Myrtle Beach Resort and Ocean Creek cut; spellings added for Maisons Sur-Mer, Sands Ocean Club, Beach Cove) |
| findings-cb-fixes.json, chart-owner-homes-cb-fixes.json | `build_findings.py` output on those names: 43 buildings, 11,471 units |
| deed-index-top-owners.json | Horry County deed index (AcclaimWeb), counts by document type and index comment for the six top owners; unit and week numbers removed; no person named |
| va-condos-horry-2026-11-10.json | VA condo report, Horry County, 229 public project records |
| freddie-5701-3.json | Freddie Mac Guide 5701.3 (effective 05/06/2026) from guide.freddiemac.com/cc/data/getAnswerById/answerId/1000687 |
