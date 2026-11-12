"""Build the page's counts and chart data from the saved files. No number on the page is typed by hand.
Run: python3 -I build_findings.py <this folder>. Writes findings.json, chart-timeline.json, chart-ages.json."""
import json, sys, os
d = sys.argv[1]
ages = json.load(open(os.path.join(d, "repose-ages.json")))
bld = json.load(open(os.path.join(d, "case-buildings.json")))
allrow = next(r for r in ages["rows"] if r["city"] == "(all)")
b = {x["band"]: x["count"] for x in allrow["bands"]}
inside = b["built 2019 or later"] + b["built 2018"]
older25 = b["built 1981 to 2000"] + b["built 1980 or earlier"]
f = {"pulled_listings": ages["pulled"], "pulled_parcels": bld["read"],
     "condos_for_sale": allrow["all"],
     "inside_8_years_built_2018_or_later": inside, "inside_share_pct": round(100 * inside / allrow["all"], 1),
     "built_2000_or_earlier": older25, "built_2000_or_earlier_pct": round(100 * older25 / allrow["all"], 1),
     "built_1980_or_earlier": b["built 1980 or earlier"],
     "by_city": {r["city"]: {"all": r["all"], "built_2018_or_later": r["bands"][0]["count"] + r["bands"][1]["count"]} for r in ages["rows"]},
     "case_buildings": {k: {"units": v["units"], "changed_hands_last_365_days": v["last_sale_within_365_days"],
                             "share_pct": round(100 * v["last_sale_within_365_days"] / v["units"], 1)} for k, v in bld["buildings"].items()}}
# Timeline: years from the opinions and the federal complaint (facts.md rows C1 to C12). Typed here once, from the ledger.
timeline = {"title": "Grand Strand condo lawsuits in the court record: from filing to the last ruling",
  "unit": "year", "source": "S.C. Court of Appeals Op. 4888, 4943, 6124; S.C. Supreme Court Op. 27698, 26909; D.S.C. 4:22-cv-03556 complaint",
  "rows": [
   {"building": "Riverwalk at Arrowhead Country Club", "built": [1997, 1999], "suit_filed": 2003, "trial": 2009, "appeal_decided": 2011, "insurance_ruling": 2017},
   {"building": "Magnolia North", "built": [1998, 2002], "suit_filed": 2003, "trial": 2009, "appeal_decided": 2012, "insurance_ruling": 2017},
   {"building": "Wedgewood", "built": [2000, 2001], "suit_filed": 2018, "trial": None, "appeal_decided": 2025, "insurance_ruling": None},
   {"building": "Renaissance Tower", "built": None, "suit_filed": 2022, "trial": None, "appeal_decided": None, "insurance_ruling": None}]}
for r in timeline["rows"]:
    last = max(x for x in [r["appeal_decided"], r["insurance_ruling"]] if x) if (r["appeal_decided"] or r["insurance_ruling"]) else None
    r["years_filing_to_last_ruling"] = (last - r["suit_filed"]) if last else None
chart_ages = {"title": "Most condos for sale here are in buildings past the state's 8-year limit on defect suits",
  "source": "Chapter3 map API (CCMLS active listings), aggregate; S.C. Code 15-3-640", "pulled": ages["pulled"],
  "bars": [{"label": "Built 2018 or later (about 8 years old or newer)", "count": inside},
           {"label": "Built 2001 to 2017", "count": b["built 2001 to 2017"]},
           {"label": "Built 1981 to 2000", "count": b["built 1981 to 2000"]},
           {"label": "Built 1980 or earlier", "count": b["built 1980 or earlier"]}]}
json.dump(f, open(os.path.join(d, "findings.json"), "w"), indent=1)
json.dump(timeline, open(os.path.join(d, "chart-timeline.json"), "w"), indent=1)
json.dump(chart_ages, open(os.path.join(d, "chart-ages.json"), "w"), indent=1)
print(json.dumps(f, indent=1)); print(json.dumps([(r["building"], r["years_filing_to_last_ruling"]) for r in timeline["rows"]]))
