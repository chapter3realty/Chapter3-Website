# /invest/rental-property-tax-cut/ data (batch 2026-11-e, page 4)

Every value comes from a VERIFIED or CORRECTED row of Blog-Brain `batches/2026-11-e/facts.md`, at the verifier's value (`VERIFY.md`). The spec `specs/rental-property-tax-cut.js` reads these files and checks them against the ledger's results before it builds.

- `levy-2026.json`: Horry County 2026 millage (F144) and the worked example (F145 to F148). The calculator and the table are computed from it.
- `horry-shares-2018.json`: Lincoln Institute Table 2.3, Horry row (F149, F150).
- `votes.json`: seats, two-thirds and past votes (F011 to F014, F081 to F084, F154, F155).

Derived on the page, not ledger rows (arithmetic on verified rows only):
- The unincorporated "taxed like a home" bill: 350,000 x 0.04 x (192.9 - 109.1) / 1000 = $1,173.20.
- The school operating share of the city example: 21,000 x 0.1091 = $2,291.10 at 6%; 14,000 x 0.1091 = $1,527.40 at 4%.
- One third of the Other residential assessed share: 47.2 / 3 = 15.7 points (2018).
- Four Democratic House votes: 83 - 79, if every Republican votes yes.
