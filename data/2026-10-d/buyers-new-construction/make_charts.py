"""Chart data for the page, built from the findings files (never typed).
chart-share-by-town.json: houses for sale and how many are new construction, by mailing town, Horry County.
chart-tax-lag.json: homes builders sold each month, and how many still had no county building value when the parcel layer was read.
chart-new-vs-nearly-new.json: middle list price per square foot, new against built 2016-2023, by town (10 or more of each).
Usage: python3 -I make_charts.py <this dir>"""
import json, sys, os
D = sys.argv[1]
L = json.load(open(os.path.join(D, "findings-listings.json"))); Dd = json.load(open(os.path.join(D, "findings-deeds.json")))
json.dump({"source": "Chapter3 CRM map API, active CCMLS listings, houses, inside Horry County", "pulled": L["pulled"],
           "rows": [{"town": r["city"], "houses": r["houses"], "new": r["new"], "pct": r["pct"]} for r in L["share_new"]["by_city"]],
           "total": {"houses": L["share_new"]["houses_in_horry"], "new": L["share_new"]["new_in_horry_all_set"]}},
          open(os.path.join(D, "chart-share-by-town.json"), "w"), indent=1)
json.dump({"source": "Horry County Register of Deeds (AcclaimWeb) and county parcel layer 24", "pulled": Dd["pulled"],
           "rows": Dd["builder_imp0_by_month"]}, open(os.path.join(D, "chart-tax-lag.json"), "w"), indent=1)
json.dump({"source": "Chapter3 CRM map API, active CCMLS listings, houses, inside Horry County", "pulled": L["pulled"],
           "rows": [{"town": r["city"], "new_ppsf": r["new"]["median_ppsf"], "new_n": r["new"]["n_ppsf"], "nearly_new_ppsf": r["nearly_new_2016_2023"]["median_ppsf"],
                     "nearly_new_n": r["nearly_new_2016_2023"]["n_ppsf"]} for r in L["by_city_house"] if r["new"]["n_ppsf"] >= 10 and (r["nearly_new_2016_2023"]["n_ppsf"] or 0) >= 10],
           "matched": L["matched"]}, open(os.path.join(D, "chart-new-vs-nearly-new.json"), "w"), indent=1)
print("ok")
