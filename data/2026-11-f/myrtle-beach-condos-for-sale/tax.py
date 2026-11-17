"""Yearly property tax in the City of Myrtle Beach, tax year 2026, at 6 and 4 percent, at three prices. Method and levy from ledger batches/2026-11-a/invest-condos/facts.md rows 20, 21 and C7:
6%: price x 0.06 x 254.6 mills. 4%: price x 0.04 x (254.6 - 109.1 school operations = 145.5 mills), less the 53.4% credit on the city part (83.4 mills).
No county fee, no special district. Writes tax.json."""
import json
out = {}
for p in (150000, 200000, 330000):
    six = p * .06 * .2546
    four = p * .04 * .1455 - 0.534 * p * .04 * .0834
    out[p] = {"six": round(six, 2), "four": round(four, 2)}
json.dump({"rule": __doc__, "tax": out}, open("tax.json", "w"), indent=1); print(out)
