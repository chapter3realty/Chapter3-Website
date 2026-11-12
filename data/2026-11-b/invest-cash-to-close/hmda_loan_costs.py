"""HMDA 2025, Horry County (45051), originated home purchase loans.
Loan costs at closing by how the buyer will use the home (occupancy_type 1 = home,
2 = second home, 3 = investment). Aggregate only. Usage:
  python3 -I hmda_loan_costs.py <hmda2025-horry-purchase.csv> <out.json>
Source: https://ffiec.cfpb.gov/v2/data-browser-api/view/csv?years=2025&counties=45051&actions_taken=1&loan_purposes=1
"""
import csv, json, sys, statistics as st

def q(vals):
    vals = sorted(vals)
    if not vals: return None
    qs = st.quantiles(vals, n=4, method="inclusive")
    return {"n": len(vals), "p25": round(qs[0], 2), "median": round(st.median(vals), 2), "p75": round(qs[2], 2)}

def num(x):
    try: return float(x)
    except: return None

rows = list(csv.DictReader(open(sys.argv[1], newline="")))
OCC = {"1": "home", "2": "second_home", "3": "investment"}
out = {"source": "HMDA 2025, Horry County, actions_taken=1, loan_purposes=1", "rows_in_file": len(rows), "groups": {}}

# all investment purchase loans, every loan type, for the counts
inv_all = [r for r in rows if r["occupancy_type"] == "3"]
out["investment_all"] = {
    "n": len(inv_all),
    "business_purpose": sum(r["business_or_commercial_purpose"] == "1" for r in inv_all),
    "by_loan_type": {t: sum(r["loan_type"] == t for r in inv_all) for t in "1234"},
    "by_units": {u: sum(r["total_units"] == u for r in inv_all) for u in sorted(set(r["total_units"] for r in inv_all))},
    "total_loan_costs_reported": sum(num(r["total_loan_costs"]) is not None for r in inv_all),
    "total_loan_costs_reported_business": sum(num(r["total_loan_costs"]) is not None for r in inv_all if r["business_or_commercial_purpose"] == "1"),
}
out["by_occupancy_all_types"] = {OCC.get(k, k): sum(r["occupancy_type"] == k for r in rows) for k in "123"}

def base(r):
    return (r["lien_status"] == "1" and r["open-end_line_of_credit"] == "2" and r["reverse_mortgage"] == "2"
            and r["construction_method"] == "1" and r["total_units"] == "1" and r["loan_type"] == "1")

for occ, name in OCC.items():
    for bp, bpn in (("2", "consumer"), ("1", "business"), (None, "all")):
        g = [r for r in rows if base(r) and r["occupancy_type"] == occ and (bp is None or r["business_or_commercial_purpose"] == bp)]
        if not g: continue
        tlc = [num(r["total_loan_costs"]) for r in g if num(r["total_loan_costs"]) is not None]
        orig = [num(r["origination_charges"]) / num(r["loan_amount"]) * 100 for r in g
                if num(r["origination_charges"]) is not None and num(r["loan_amount"])]
        pts = [num(r["discount_points"]) for r in g if num(r["discount_points"]) is not None]
        tlc_pv = [num(r["total_loan_costs"]) / num(r["property_value"]) * 100 for r in g
                  if num(r["total_loan_costs"]) is not None and num(r["property_value"])]
        out["groups"][f"{name}_{bpn}"] = {
            "n": len(g),
            "total_loan_costs": q(tlc),
            "origination_pct_of_loan": q(orig),
            "discount_points_paid_n": sum(1 for p in pts if p > 0),
            "discount_points_field_n": len(pts),
            "loan_costs_pct_of_value": q(tlc_pv),
            "loan_amount": q([num(r["loan_amount"]) for r in g if num(r["loan_amount"])]),
            "property_value": q([num(r["property_value"]) for r in g if num(r["property_value"])]),
        }
json.dump(out, open(sys.argv[2], "w"), indent=1)
print(json.dumps(out, indent=1))
