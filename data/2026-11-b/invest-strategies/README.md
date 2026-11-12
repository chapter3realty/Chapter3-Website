# /invest/strategies/ data (batch 2026-11-b)

- `build_findings.py`: reads data files other pages already pulled and verified, and writes `findings.json` (every number the hub prints) and `chart-entry-prices.json` (the entry-price chart). It pulls nothing from the web. Run from the website root: `python3 -I data/2026-11-b/invest-strategies/build_findings.py`.
- Files it reads: `data/2026-10-c/horry-flips.json`; `data/2026-11-b/invest-strategies-small-multifamily/findings.json`; `data/2026-10-d/invest-strategies-dst/formd_dst_summary.json`; `data/2026-11-b/invest-strategies-1031-exchange/findings.json`; `data/2026-11-a/invest-rent-prices/findings.json`; `data/str-market.json`; `data/2026-11-b/invest-strategies-dscr-loans/findings.json`.
- `pull-suggestions.sh` and `raw/google-suggestions-2026-11-10.txt`: Google search suggestions for 30 queries, read 2026-11-10.
- No address, PIN, owner name or MLS number is in any file here.
- Ledger: Blog-Brain `batches/2026-11-b/invest-strategies/facts.md`.
