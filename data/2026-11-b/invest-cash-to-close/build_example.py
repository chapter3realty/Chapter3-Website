"""Worked cash-to-close lines for /invest/cash-to-close/: a condo and a house at the Grand Strand's middle sold price
(CCAR, January to September 2026). Every input is a ledger row in Blog-Brain batches/2026-11-b/invest-cash-to-close/facts.md
(row numbers in the comments). No down payment, interest rate or loan payment is computed or stated: the reader adds their
own down payment, and the loan part of reserves stays "months of your lender's payment".
Run: python3 -I build_example.py <this folder>   (reads hmda-2025-loan-costs.json, band-fees.json, strip-counts.json; writes example.json)"""
import json, sys
d = sys.argv[1] if len(sys.argv) > 1 else "."
J = lambda f: json.load(open(f"{d}/{f}"))
h = J("hmda-2025-loan-costs.json"); fees = J("band-fees.json")["segments"]; strips = J("strip-counts.json")["counts"]
inv = h["groups"]["investment_consumer"]; home = h["groups"]["home_consumer"]; sec = h["groups"]["second_home_consumer"]
LOAN_COST_PCT = inv["loan_costs_pct_of_value"]["median"] / 100            # row 6
CASES = {
  "condo": {"price": 232000, "mills": 254.6, "where": "inside the City of Myrtle Beach",            # rows 1, 12
            "insurance_year": 972, "dues_month": fees["condo_200_265k"]["median_fee_at_or_below"]},  # rows 14, 17
  "house": {"price": 362000, "mills": 201.0, "where": "outside city limits",
            "insurance_year": 3300, "dues_month": fees["house_330_395k"]["median_fee_at_or_below"]},  # rows 15, 17
}
MORTGAGE_RECORDING = 25            # row 10
CUSHION_MONTHS = 2                 # row 11: the cushion is at most 1/6 of a year's escrow payments
RESERVE_MONTHS = 6                 # row 19: Fannie Mae, investment property
def r(x, step=10): return int(round(x / step) * step)
out = {"inputs": {"loan_cost_pct_of_price": round(LOAN_COST_PCT * 100, 2), "cushion_months": CUSHION_MONTHS, "reserve_months": RESERVE_MONTHS}, "cases": {}}
for k, c in CASES.items():
    p = c["price"]
    tax_year = p * 0.06 * c["mills"] / 1000                                 # rows 12, 13
    lines = {
      "loan_costs": p * LOAN_COST_PCT,
      "mortgage_recording": MORTGAGE_RECORDING,
      "insurance_first_year": c["insurance_year"],
      "insurance_escrow_cushion": c["insurance_year"] * CUSHION_MONTHS / 12,
      "tax_escrow_cushion": tax_year * CUSHION_MONTHS / 12,
    }
    total = sum(lines.values())
    month_non_loan = tax_year / 12 + c["insurance_year"] / 12 + c["dues_month"]
    out["cases"][k] = {
      "price": p, "where": c["where"], "tax_year_at_6pct": round(tax_year), "dues_month": c["dues_month"],
      "lines": {n: round(v) for n, v in lines.items()},
      "lines_rounded": {n: (round(v) if n == "mortgage_recording" else r(v, 10)) for n, v in lines.items()},  # a flat fee prints exact
      "total_beyond_down_payment": round(total), "total_rounded": r(total, 100),
      "total_pct_of_price": round(total / p * 100, 1),
      "reserves": {"months": RESERVE_MONTHS, "tax_insurance_dues_month": round(month_non_loan),
                   "tax_insurance_dues_part": round(month_non_loan * RESERVE_MONTHS), "tax_insurance_dues_part_rounded": r(month_non_loan * RESERVE_MONTHS, 100),
                   "plus": "6 months of your lender's loan payment (never computed here)"},
      "not_in_total": ["your down payment", "owner's title policy (optional; no filed schedule opened)", "prepaid interest (needs a rate)",
                       "HOA statement, transfer and capital charges (set by the documents; no state cap; no published local range)",
                       "the weeks of tax and insurance escrow until the first payment date", "inspection, wood report, survey", "flood policy where required"],
    }
out["hmda_compare"] = {"investment_median_loan_costs": inv["total_loan_costs"]["median"], "home_median_loan_costs": home["total_loan_costs"]["median"],
  "second_home_median_loan_costs": sec["total_loan_costs"]["median"],
  "difference": round(inv["total_loan_costs"]["median"] - home["total_loan_costs"]["median"]),
  "investment_pct_of_value": inv["loan_costs_pct_of_value"]["median"], "home_pct_of_value": home["loan_costs_pct_of_value"]["median"],
  "second_home_pct_of_value": sec["loan_costs_pct_of_value"]["median"],
  "investment_origination_pct": inv["origination_pct_of_loan"]["median"], "home_origination_pct": home["origination_pct_of_loan"]["median"]}
out["chart_loan_costs_by_use"] = [
  {"label": "A home you live in", "median": round(home["total_loan_costs"]["median"], -2), "n": home["total_loan_costs"]["n"]},
  {"label": "A second home", "median": round(sec["total_loan_costs"]["median"], -2), "n": sec["total_loan_costs"]["n"]},
  {"label": "A rental", "median": round(inv["total_loan_costs"]["median"], -2), "n": inv["total_loan_costs"]["n"]},
]
ia = h["investment_all"]
out["investor_loans"] = {"all_purchase_loans": h["rows_in_file"], "investment": ia["n"], "second_home": h["by_occupancy_all_types"]["second_home"],
  "investment_share_pct": round(ia["n"] / h["rows_in_file"] * 100, 1),
  "share_not_lived_in_pct": round((ia["n"] + h["by_occupancy_all_types"]["second_home"]) / h["rows_in_file"] * 100, 1),
  "investment_business_purpose": ia["business_purpose"], "business_share_pct": round(ia["business_purpose"] / ia["n"] * 100, 1),
  "business_with_loan_costs_reported": ia["total_loan_costs_reported_business"]}
out["strips"] = {k: v["total"] for k, v in strips.items()}
out["strips"]["oceanfront_str_condo_median_dues"] = fees["condo_200_265k_oceanfront_unit_str_allowed"]["median_fee_at_or_below"]
json.dump(out, open(f"{d}/example.json", "w"), indent=1); print(json.dumps(out, indent=1))
