"""Worked examples for /invest/financing-multiple-rentals/. Every input is a verified row elsewhere; no rate, no loan payment.
Inputs: equity-by-year.json (this folder); worked example 1 of /invest/run-the-numbers/ (Blog-Brain batches/2026-11-a/invest-run-the-numbers/facts.md rows 17 and 30:
 a 3-bedroom house in Carolina Forest, ZIP 29579, asking $390,000; HUD rent $2,230 a month; tax at 6 percent outside city limits about $4,700 a year;
 HOA $1,200 a year; landlord insurance about $3,300 a year, one agency's estimate).
Rules: Fannie Mae Selling Guide B3-3.8-02 (75% of gross rent), B3-3.8-03 (50% for a short-term rental), B3-4.1-01 (6 months PITIA for an
investment purchase; 2/4/6% of other financed balances), Freddie Mac max LTV table (75% cash-out, 1-unit investment).
Usage: python3 -I build_examples.py <this dir>. Writes examples.json."""
import sys, os, json
D = sys.argv[1]
E = json.load(open(os.path.join(D, "equity-by-year.json")))["example"]
house = {"zip": "29579", "area": "Carolina Forest", "asking": 390000, "rent_month": 2230, "tax_year": 4700, "hoa_year": 1200, "insurance_year": 3300}
non_loan_month = (house["tax_year"] + house["hoa_year"] + house["insurance_year"]) / 12
out = {"house": house, "non_loan_cost_month": round(non_loan_month, 2)}
out["rent_counted"] = {"long_term_share": 0.75, "rent": house["rent_month"], "counted": house["rent_month"] * 0.75,
                       "short_term_share": 0.50, "note": "Short-term: 50% of a market rent from Form 1007 or three comparable short-term rentals, offset against the house's own cost only."}
# Reserves for buying the example house as a second rental, owning the 2019 house after its cash-out (balance = largest new loan).
other_balance = E["largest_new_loan"]
res = {"subject_months": 6, "subject_non_loan_part": round(6 * non_loan_month), "plus": "six months of the new loan's principal and interest (the reader's own figure)",
       "financed_properties": "2 or 3 (the first rental, the new one, and the reader's home if it has a mortgage): the 2 percent tier",
       "other_rental_balance": other_balance, "other_share": 0.02, "other_part": round(0.02 * other_balance)}
res["total_before_loan_payments"] = res["subject_non_loan_part"] + res["other_part"]
out["reserves"] = res
# Worst case: both houses empty three months. Same costs assumed for both houses (the first is a 2019 house now worth about the same).
wc = {"houses": 2, "months": 3, "non_loan_costs": round(2 * 3 * non_loan_month), "rent_not_collected": 2 * 3 * house["rent_month"],
      "plus": "three payments on each loan (the reader's own figure)"}
out["worst_case"] = wc
out["reserve_minus_worst_case_non_loan"] = res["total_before_loan_payments"] - wc["non_loan_costs"]
json.dump(out, open(os.path.join(D, "examples.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
