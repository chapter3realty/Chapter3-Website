# Data for /invest/condotel-financing/ (batch 2026-11-b)

Every number the page prints comes from `findings.json` (built by `build_findings.py`). Ledger: Blog-Brain `batches/2026-11-b/invest-condotel-financing/facts.md`.

| File | What | Made by |
|---|---|---|
| counts.json | Oceanfront-building condos for sale in Horry County, and those whose listing says the unit is in a rental program: totals, listing loan flags (FHA, VA, conventional, cash only), studios (total minus beds 1+), and unit size against 400 and 500 sq ft (pins read in price slices, deduplicated, kept in range). Aggregates only; every API URL called is in `calls`. | `pull_counts.py` (the CRM's public map API, 2026-11-10) |
| findings.json | What the page prints: shares, plus building facts from the condo-buildings data (names with "Resort" or a hotel brand; county regime names with "Resort"; buildings whose middle unit for sale is under 500 sq ft; deeds in a year) | `build_findings.py` (reads `../invest-condo-buildings/`) |
| chart-size.json | The one chart: rental-program condos for sale by size band | `build_findings.py` |
| raw/google-suggestions-2026-11-10.txt | Google suggestions for the must-answer list | `pull-suggestions.sh` |
| raw/dl/fannie-b4-2.1-03.html, .txt | Fannie Mae Selling Guide B4-2.1-03, Ineligible Projects (11/04/2026), read 2026-11-10 | curl |
| raw/dl/newrez-smart-project-checklist-3-2026.pdf, newrez.txt | Newrez Wholesale, Smart Product Project Checklist 3/2026 (a published non-agency program sheet with a condotel section) | curl, pdftotext |
| raw/dl/hud-92561.pdf, .txt | HUD-92561, Borrower's Contract with Respect to Hotel and Transient Use of Property | curl, pdftotext |
| raw/dl/jmac-condo-hotels.html | JMAC program list (names condo hotels under one DSCR program; no unit rules). Not used on the page. | curl |

Not reachable from this session: guide.freddiemac.com (Freddie Mac Guide 5701.3). angeloakms.com refused (403).

Rerun: `python3 -I pull_counts.py .` (126 calls at 2.1 s), then `python3 -I build_findings.py .`. Listing counts change daily; rebuild the page from the new files, never edit numbers by hand.

Never in these files: an MLS number, a unit number, a single listing's price or address, a firm, a PIN or an owner.

## Verifier files (2026-11-10), `raw/verify/`

| File | What |
|---|---|
| counts-rerun-2026-11-10.json | `pull_counts.py` re-run at 02:55 UTC: identical to counts.json |
| beds_sqft.py, beds-sqft.json | Rental-program condos for sale by the 500 sq ft line and bedroom count (678 of 885 are 500 sq ft or more with a bedroom; beds never blank). Run: `python3 -I raw/verify/beds_sqft.py <out.json>` |
| freddie-5701-3.json, .txt | Freddie Mac Guide 5701.3, Ineligible projects (effective 05/06/2026), from guide.freddiemac.com/cc/data/getAnswerById/answerId/1000687 |
| hud-4000-1-update18-excerpts.txt | HUD Handbook 4000.1 Update 18: form 92561 scope, "hotels, motels and condotels", condo project ineligible characteristics |
| va-condos-horry-2026-11-10.json | VA condo report, Horry County, every status (229 records) |
| fhfa-about.txt | FHFA: what Fannie Mae and Freddie Mac are |
| sandsresorts.com-rental-management-services.html, compasscove.com-homeowner-services.html | Resort rental-program pages |
