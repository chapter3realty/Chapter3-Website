#!/usr/bin/env python3
"""Chart and table data for /submarkets/murrells-inlet/, built only from the other files in this folder.
Run: python3 -I build_charts.py <datadir>. Writes chart-*.json and worked.json.
Inputs: findings.json (analyze.py), airroi.json (parse_airroi.py), raw/census-*.json (pull-census.sh), raw/tides-2026.json, raw/drives.json.
HUD Small Area FMR FY2027 for ZIP 29576 is typed below from HUD's file (fy2027_safmrs.xlsx, row 29576, same in both HUD areas); ledger row cites it.
Millage: Horry County 2026 levy and Treasurer bills (district 610 = 207.3 mills, 600 = 201.0; at 4 percent the 109.1-mill school
operating levy drops off); Georgetown County Property Tax Calculator, district 41 (legal residence .1289, other .2520, plus $96)."""
import json, sys, os
D = sys.argv[1]
F = json.load(open(os.path.join(D, "findings.json"))); A = json.load(open(os.path.join(D, "airroi.json")))
PARTS = [("horry/west", "Horry side, west of the US 17 bypass"), ("georgetown/west", "Georgetown side, west of the US 17 bypass"),
         ("georgetown/old_road", "Georgetown side, between the bypass and Business 17"), ("georgetown/inlet", "Georgetown side, the creek side of Business 17")]
rows = []
for k, label in PARTS:
    st, sa, sc = F["stock"][k + "/house"], F["sales"][k + "/house"], F["sales"][k + "/condo"]
    rows.append({"part": k, "label": label, "houses": st["homes"], "house_sales_12m": sa["sales"], "house_median": sa.get("median"), "house_p25": sa.get("p25"), "house_p75": sa.get("p75"),
                 "condo_sales_12m": sc["sales"], "condo_median": sc.get("median") if sc["sales"] >= 10 else None,
                 "pct_legal_residence_houses": st["pct_legal_residence"], "pct_high_risk_flood_all": F["stock"][k + "/all"]["pct_high_risk"]})
json.dump({"source": "findings.json", "window": F["window"], "rows": rows}, open(os.path.join(D, "chart-parts.json"), "w"), indent=1)
# Tax worked example: the same house on each side, and each side's own middle house
MILL = {"horry610": (0.0982, 0.2073, 89.40), "georgetown41": (0.1289, 0.2520, 96.0)}
def tax(v, side):
    a, b, fee = MILL[side]
    return {"legal_residence": round(v * 0.04 * a + fee), "second_home_or_rental": round(v * 0.06 * b + fee)}
same = 450000
W = {"same_house_value": same, "horry_610": tax(same, "horry610"), "georgetown_41": tax(same, "georgetown41"),
     "horry_middle_house": {"value": F["sales"]["horry/west/house"]["median"], **tax(F["sales"]["horry/west/house"]["median"], "horry610")},
     "georgetown_west_middle_house": {"value": F["sales"]["georgetown/west/house"]["median"], **tax(F["sales"]["georgetown/west/house"]["median"], "georgetown41")},
     "note": "Horry fee $89.40 = the fees on every 2026 Horry bill the Garden City verifier read; Georgetown $96 = the calculator's household fee for district 41."}
W["diff_same_house"] = {k: W["georgetown_41"][k] - W["horry_610"][k] for k in W["horry_610"]}
# STR vs LTR by bedrooms: AirROI typical (median) annual gross vs HUD SAFMR x 12
SAFMR = {"2": 1720, "3": 2080, "4": 2420}
AIR = {"2": 27500, "3": 30600, "4": 54100}     # AirROI "What each home size earns", typical (median) annual revenue, read 2026-11-02 (raw page in scratch)
W["str_vs_ltr"] = [{"bedrooms": b, "airbnb_typical_gross_year": AIR[b], "hud_fair_rent_year": SAFMR[b] * 12, "gap": AIR[b] - SAFMR[b] * 12} for b in ("2", "3", "4")]
json.dump(W, open(os.path.join(D, "worked.json"), "w"), indent=1)
cal = A["calendar_avg_2yr"]
json.dump({"source": A["source"], "what": "Average Airbnb revenue per active listing by calendar month, two-year average (AirROI)",
           "months": [{"month": m[:3], "revenue": cal[m]["revenue"], "season": cal[m]["season"]} for m in ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]]},
          open(os.path.join(D, "chart-str-months.json"), "w"), indent=1)
json.dump({"what": "Typical yearly gross: Airbnb (AirROI median by bedrooms) vs HUD Fair Market Rent for ZIP 29576 x 12", "rows": W["str_vs_ltr"]}, open(os.path.join(D, "chart-str-ltr.json"), "w"), indent=1)
T = json.load(open(os.path.join(D, "raw", "tides-2026.json")))
json.dump({"what": "Average rise and fall of the tide in 2026, feet (NOAA predictions)", "rows": [{"station": v["name"], "mean_range_ft": v["mean_range_ft"]} for v in T.values()]},
          open(os.path.join(D, "chart-tides.json"), "w"), indent=1)
print(json.dumps(rows, indent=1)); print(json.dumps(W, indent=1))
