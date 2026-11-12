"""How owners of Horry County rentals borrowed in 2025 (and 2024), from HMDA.

Counts only, no lender names, no rates, no payments. occupancy_type 3 = investment
property (HMDA's word for a home the borrower will not live in: rentals, and homes
held to resell). Applications are action_taken 1 to 5 (purchased loans, 6, and
preapproval rows, 7 and 8, are left out). An origination is action_taken 1.

Usage:
  python3 -I hmda_rentals.py raw/hmda/hmda-2025-horry.csv raw/hmda/hmda-2024-horry.csv hmda-rentals.json

Source: https://ffiec.cfpb.gov/v2/data-browser-api/view/csv?years=2025&counties=45051
        (and years=2024). Field codes: https://ffiec.cfpb.gov/documentation/publications/loan-level-datasets/lar-data-fields
"""
import csv, json, sys, statistics as st
from collections import Counter

PURPOSE = {"1": "purchase", "2": "home_improvement", "31": "refinance", "32": "cash_out_refinance", "4": "other", "5": "not_applicable"}
DENIAL = {"1": "debt_to_income", "2": "employment_history", "3": "credit_history", "4": "collateral",
          "5": "insufficient_cash", "6": "unverifiable_information", "7": "application_incomplete",
          "8": "mortgage_insurance_denied", "9": "other"}
OCC = {"1": "home", "2": "second_home", "3": "investment"}


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def q(vals):
    vals = sorted(v for v in vals if v is not None)
    if len(vals) < 4:
        return {"n": len(vals)}
    qs = st.quantiles(vals, n=4, method="inclusive")
    return {"n": len(vals), "p25": round(qs[0]), "median": round(st.median(vals)), "p75": round(qs[2])}


def kind(r):
    """purchase / cash-out refinance / line of credit / other, for one row."""
    if r["open-end_line_of_credit"] == "1":
        return "line_of_credit"
    return PURPOSE.get(r["loan_purpose"], r["loan_purpose"])


def year(path):
    rows = list(csv.DictReader(open(path, newline="")))
    apps = [r for r in rows if r["action_taken"] in ("1", "2", "3", "4", "5")]
    out = {"rows_in_file": len(rows), "applications": len(apps), "by_occupancy": {}}
    for code, name in OCC.items():
        g = [r for r in apps if r["occupancy_type"] == code]
        orig = [r for r in g if r["action_taken"] == "1"]
        o = {
            "applications": len(g),
            "originated": len(orig),
            "originated_by_kind": dict(Counter(kind(r) for r in orig)),
            "applications_by_kind": dict(Counter(kind(r) for r in g)),
            "denied_by_kind": dict(Counter(kind(r) for r in g if r["action_taken"] == "3")),
        }
        # denial rate by kind: denied / (originated + approved not accepted + denied)
        dec = {}
        for k in set(kind(r) for r in g):
            d = [r for r in g if kind(r) == k and r["action_taken"] in ("1", "2", "3")]
            den = [r for r in d if r["action_taken"] == "3"]
            dec[k] = {"decided": len(d), "denied": len(den),
                      "denied_pct": round(100 * len(den) / len(d), 1) if d else None}
        o["denial_rate_by_kind"] = dec
        if code == "3":
            reasons = Counter()
            reasons_purchase = Counter()
            reasons_cashout = Counter()
            denied = [r for r in g if r["action_taken"] == "3"]
            for r in denied:
                rs = {r[f"denial_reason-{i}"] for i in range(1, 5)} & set(DENIAL)
                for x in rs:
                    reasons[DENIAL[x]] += 1
                    if kind(r) == "purchase":
                        reasons_purchase[DENIAL[x]] += 1
                    if kind(r) == "cash_out_refinance":
                        reasons_cashout[DENIAL[x]] += 1
            o["denials"] = len(denied)
            o["denial_reasons_any_listed"] = dict(reasons.most_common())
            o["denial_reasons_purchase"] = dict(reasons_purchase.most_common())
            o["denials_purchase"] = sum(kind(r) == "purchase" for r in denied)
            o["denial_reasons_cash_out"] = dict(reasons_cashout.most_common())
            o["denials_cash_out"] = sum(kind(r) == "cash_out_refinance" for r in denied)
            # originated purchases: business purpose (loans for a business purpose, such as an LLC or a DSCR loan)
            op = [r for r in orig if kind(r) == "purchase"]
            o["purchase_originated"] = {
                "n": len(op),
                "business_purpose": sum(r["business_or_commercial_purpose"] == "1" for r in op),
                "consumer_purpose": sum(r["business_or_commercial_purpose"] == "2" for r in op),
                "conventional": sum(r["loan_type"] == "1" for r in op),
                "units_1": sum(r["total_units"] == "1" for r in op),
                "units_2_4": sum(r["total_units"] in ("2", "3", "4") for r in op),
                "property_value": q([num(r["property_value"]) for r in op]),
                "loan_amount": q([num(r["loan_amount"]) for r in op]),
                "first_lien": sum(r["lien_status"] == "1" for r in op),
            }
            oc = [r for r in orig if kind(r) == "cash_out_refinance"]
            o["cash_out_originated"] = {
                "n": len(oc),
                "business_purpose": sum(r["business_or_commercial_purpose"] == "1" for r in oc),
                "loan_amount": q([num(r["loan_amount"]) for r in oc]),
                "property_value": q([num(r["property_value"]) for r in oc]),
                # ledger only: never an LTV percentage on the page
                "ltv_ledger_only": q([num(r["loan_to_value_ratio"]) for r in oc]),
                "distinct_lenders": len({r["lei"] for r in oc}),
            }
            ol = [r for r in orig if kind(r) == "line_of_credit"]
            o["line_of_credit_originated"] = {
                "n": len(ol),
                "first_lien": sum(r["lien_status"] == "1" for r in ol),
                "second_lien": sum(r["lien_status"] == "2" for r in ol),
                "loan_amount": q([num(r["loan_amount"]) for r in ol]),
                "distinct_lenders": len({r["lei"] for r in ol}),
            }
            o["distinct_lenders_any_investment_origination"] = len({r["lei"] for r in orig})
        if code == "1":
            ol = [r for r in orig if kind(r) == "line_of_credit"]
            o["line_of_credit_originated"] = {"n": len(ol), "distinct_lenders": len({r["lei"] for r in ol})}
        out["by_occupancy"][name] = o
    return out


res = {"source": "HMDA, Horry County SC (45051), FFIEC data browser", "years": {}}
for p in sys.argv[1:-1]:
    y = open(p).readline() and next(csv.DictReader(open(p)))["activity_year"]
    res["years"][y] = year(p)
json.dump(res, open(sys.argv[-1], "w"), indent=1)
print(json.dumps(res, indent=1))
