"""Worked examples for /buyers/common-mistakes/, from verified rules only. Writes examples.json.
Millage: Horry County 2026 certified levy (retirees ledger rows 21-22): unincorporated district 100 = 201.0 mills, of which
109.1 is school operating (exempt at 4%, S.C. Code 12-37-220(B)(47)); City of Myrtle Beach = 254.6 mills incl. 83.4 city, with the
city's 53.4% credit on the city tax for a legal residence (/buyers/property-taxes/ model). Same model as the site's property tax calculator.
Run: python3 -I build_examples.py <datadir>"""
import json, os, sys
D = sys.argv[1]
SCHOOL_OPS = 109.1
PLACES = {"Unincorporated Horry County": (201.0, 0.0), "City of Myrtle Beach": (254.6, 83.4)}
TDF = 0.534
def tax(value, ratio, mills, city):
    if ratio == 0.06: return value * 0.06 * mills / 1000
    t = value * 0.04 * (mills - SCHOOL_OPS) / 1000
    if city: t -= value * 0.04 * city / 1000 * TDF
    return t
PRICE = 350000  # middle resale house, Horry County, deeds Oct 2025-Sep 2026 (sell-home-value ledger row 2)
out = {"price": PRICE, "tax": {}}
for p, (m, c) in PLACES.items():
    four, six = tax(PRICE, 0.04, m, c), tax(PRICE, 0.06, m, c)
    out["tax"][p] = {"4pct": round(four, 2), "6pct": round(six, 2), "gap_per_year": round(six - four, 2), "gap_5_years": round(5 * (six - four), 2), "ratio": round(six / four, 2)}
# Seller's bill: a house last sold 2005-2014 is taxed on about 62.5% of the county's market value (sell-home-value ledger row 15, value-weighted band).
SHARE = 0.625
seller_taxable = PRICE * SHARE
m, c = PLACES["Unincorporated Horry County"]
out["seller_bill_example"] = {"assumption": "house worth $350,000, seller owned since about 2010 and lived in it (4%), taxable value at the 2005-2014 band's 62.5% of market",
    "seller_taxable": round(seller_taxable), "seller_bill_4pct": round(tax(seller_taxable, 0.04, m, c), 2),
    "buyer_bill_4pct": out["tax"]["Unincorporated Horry County"]["4pct"], "buyer_bill_6pct": out["tax"]["Unincorporated Horry County"]["6pct"]}
s = out["seller_bill_example"]; s["buyer_6pct_over_seller"] = round(s["buyer_bill_6pct"] - s["seller_bill_4pct"], 2); s["times"] = round(s["buyer_bill_6pct"] / s["seller_bill_4pct"], 2)
# Flood: one insured flood outside the high-risk zone vs a year of cover (claims-findings.json, fema-findings.json)
cl = json.load(open(os.path.join(D, "claims-findings.json")))["by"]["since_2015_single_family"]
fe = json.load(open(os.path.join(D, "fema-findings.json")))["groups"]["ratedFloodZone"]
out["flood"] = {"median_paid_house_outside_high_risk_since_2015": cl["outside"]["median_building_payment"], "n_outside": cl["outside"]["n"],
                "median_paid_house_high_risk_since_2015": cl["high"]["median_building_payment"], "n_high": cl["high"]["n"],
                "median_policy_house_lived_in_X": fe["X (moderate or low risk) | lived in"]["median"], "n_X_lived_in": fe["X (moderate or low risk) | lived in"]["n"],
                "median_policy_house_lived_in_A": fe["A (high risk) | lived in"]["median"], "n_A_lived_in": fe["A (high risk) | lived in"]["n"],
                "median_policy_house_not_lived_in_A": fe["A (high risk) | not lived in"]["median"],
                "median_policy_house_V_all": fe["V (coastal high hazard) | all"]["median"], "n_V": fe["V (coastal high hazard) | all"]["n"]}
out["flood"]["years_of_X_cover_per_median_outside_claim"] = round(out["flood"]["median_paid_house_outside_high_risk_since_2015"] / out["flood"]["median_policy_house_lived_in_X"], 1)
json.dump(out, open(os.path.join(D, "examples.json"), "w"), indent=1); print(json.dumps(out, indent=1))
