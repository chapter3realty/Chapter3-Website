# Verifier's corrected run (batch 2026-11-a)

The independent verifier re-ran `analyze.py` on the researcher's county pull, deed file and listing pull. Every number in `../findings.json` reproduced. One error in `../areas.py` was found and fixed here:

- `plat()` read "CRESCENT SANDS AT WH", a Windy Hill condo, as a Crescent Beach plat. The nearest-plat rule then put 1,447 homes south-west of Atlantic Beach (North Beach Towers, Beach Cove, Shore Crest and others) in Crescent Beach. Atlantic Beach sits between Crescent Beach and Windy Hill, so no home south-west of it can be in Crescent Beach.
- The fix is one line in `areas.py` here: a legal description with " AT WH" goes to Windy Hill. Only the Crescent Beach and Windy Hill figures change (homes, condo sales, flood shares, legal-residence shares, listings by part, the table, the charts and the map). City totals do not change.

Files here are the output of `analyze.py` with this `areas.py`, on the same inputs as `../`. The writer uses these files in place of the ones in `../`. Ledger: Blog-Brain `batches/2026-11-a/submarkets-north-myrtle-beach/VERIFY.md`.
