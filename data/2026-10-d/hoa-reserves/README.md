# data/2026-10-d/hoa-reserves

Research data for /hoa/reserves/ (batch 2026-10-d). Ledger: Blog-Brain `batches/2026-10-d/hoa-reserves/facts.md`. Pulled 2026-11-01.

| File | What | Made by |
|---|---|---|
| `condo-ages.json` | Condos for sale by building age band (1986 or earlier, 1987-1996, 1997-2006, 2007-2016, 2017 on), elevator and oceanfront buildings in each, listed HOA fees at thresholds and the median fee. Aggregate counts only, with every API URL called. | `python3 -I pull_condo_ages.py .` |
| `worked-example.json` | The labelled worked example: six parts, HUD lives, fully funded balance, percent funded, the five-year gap, the budget test. Round example costs, not a real building. | `python3 -I worked_example.py > worked-example.json` |
| `horry-inflow-2223.json` | Households moving into Horry County by origin state (IRS SOI 2022-2023 county inflow). | `python3 -I horry_inflow_states.py raw/countyinflow2223-horry.csv > horry-inflow-2223.json` |
| `raw/google-suggestions-2026-11-01.txt` | Google search suggestions for 59 seeds. | `sh pull-suggestions.sh` |
| `raw/countyinflow2223-horry.csv` | The Horry County rows (y2 45/051) of https://www.irs.gov/pub/irs-soi/countyinflow2223.csv, with the header. | filtered from the full IRS file |
| `raw/t27c030`, `t27c031`, `t33c031` | S.C. Code Title 27 Ch. 30 and 31, Title 33 Ch. 31 (scstatehouse.gov), HTML and text. | curl |
| `raw/fl-718.112`, `fl-553.899` | Florida Statutes 2026 (leg.state.fl.us). | curl |
| `raw/nj-pl2023-c214` | N.J. P.L.2023, c.214 (pub.njleg.state.nj.us), HTML, text and PDF. | curl |
| `raw/md-11-109.4`, `va-55.1-1965` | Maryland Real Property 11-109.4; Virginia Code 55.1-1965. | curl |
| `raw/fnma-b4-2.2-02`, `fnma-b4-2.1-01`, `fnma-b4-2.1-03` | Fannie Mae Selling Guide pages (guide published October 7, 2026). The first is served as "B4-2.2-01, Full Review Process". | curl |
| `raw/freddie-bulletin-2026-C` | Freddie Mac Guide Bulletin 2026-C (March 18, 2026), copy hosted at tenaco.com; guide.freddiemac.com serves a script page. | curl, pdftotext |
| `raw/hud-eul` | HUD CNA e-Tool Estimated Useful Life table. | curl, pdftotext |
| `raw/cai-explanation-2025` | CAI, An Explanation of CAI's Reserve Study Standards (2025). | curl, pdftotext |
| `raw/ar-nrss` | National Reserve Study Standards (1998), copy hosted by Association Reserves. | curl, pdftotext |
| `raw/ar-insights-2026` | Association Reserves, HOA Reserves: Industry Insights Report (April 2026). | curl, pdftotext |
| `raw/filters.json` | The CRM's public filter list with counts (chapter3realty.com/homes/api/filters). | curl |

Not reachable on 2026-11-01: singlefamily.fanniemae.com (403 to curl and WebFetch); Wikimedia Commons API and uploads (rate-limited, 429).
