"""Every derived number on /invest/condotel-financing/. Inputs: counts.json (pull_counts.py), the condo-buildings data
(../invest-condo-buildings/buildings.json, building-fees.json, findings.json, regimes.json).
Run: python3 -I build_findings.py <this folder>. Writes findings.json and chart-size.json."""
import json, sys, os
D = sys.argv[1]; CB = os.path.join(D, "../invest-condo-buildings")
c = json.load(open(os.path.join(D, "counts.json")))
def pct(a, b): return round(100 * a / b, 1)
g = {}
for k, v in c["groups"].items():
    n = v["listings"]; s = v["size"]
    g[k] = {"listings": n, "studios": v["studios"], "studios_pct": pct(v["studios"], n),
            "under_400": s["under_400"], "under_400_pct": pct(s["under_400"], n),
            "under_500": s["under_500"], "under_500_pct": pct(s["under_500"], n),
            "at_least_500": s["at_least_500"], "at_least_500_pct": pct(s["at_least_500"], n),
            "fha_flag": v["flags"]["fha_accepted"], "va_flag": v["flags"]["va_accepted"],
            "conventional_flag": v["flags"]["conventional_accepted"], "cash_only_flag": v["flags"]["cash_only_listing"]}
of, pr = c["groups"]["oceanfront_building"]["listings"], c["groups"]["in_program"]["listings"]
B = json.load(open(os.path.join(CB, "buildings.json")))["buildings"]
fees = json.load(open(os.path.join(CB, "building-fees.json")))["buildings"]
fd = {x["slug"]: x for x in json.load(open(os.path.join(CB, "findings.json")))["buildings"]}
reg = json.load(open(os.path.join(CB, "regimes.json")))["buildings"]
WORDS = ["resort", "hotel", "motel", "holiday inn"]
common = [b["name"] for b in B if any(w in b["name"].lower() for w in WORDS)]
legal = sorted(k for k, v in reg.items() if any(any(w in str(x).upper() for w in ["RESORT", "RSRT", "HOTEL", "MOTEL"]) for x in (v if isinstance(v, list) else v.get("regimes", []))))
small = sorted([{"name": b["name"], "sqft_median": fees[b["slug"]]["sqft_median"], "for_sale": fees[b["slug"]]["total"], "beds": fd[b["slug"]]["beds"]}
                for b in B if fees.get(b["slug"], {}).get("sqft_median") and fees[b["slug"]]["sqft_median"] < 500 and fees[b["slug"]]["total"] >= 10], key=lambda x: x["sqft_median"])
out = {"made": "build_findings.py", "pulled": c["pulled"], "groups": g,
       "in_program_share_of_oceanfront": pct(pr, of),
       "directory": {"buildings": len(B), "resort_or_hotel_common_name": len(common), "names": common,
                     "with_county_regime": len(reg), "resort_in_county_regime_name": len(legal), "legal_slugs": legal,
                     "median_unit_under_500_sqft_10plus_for_sale": small,
                     "sales_year": sum(x.get("sales") or 0 for x in fd.values()), "units": sum(x.get("units") or 0 for x in fd.values())}}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
p = g["in_program"]
chart = {"title": "Most rental-program condos pass a condotel lender's size test. About 1 in 5 do not.",
         "unit": "condos for sale", "source": "CCMLS listings via the Chapter3 map, " + c["pulled"][:10] + "; size lines from Fannie Mae B4-2.1-03 (400 sq ft) and the Newrez Smart checklist, 3/2026 (500 sq ft)",
         "rows": [{"label": "500 sq ft or more", "value": p["at_least_500"]},
                  {"label": "400 to 499 sq ft", "value": p["under_500"] - p["under_400"]},
                  {"label": "Under 400 sq ft", "value": p["under_400"]}], "total": p["listings"]}
json.dump(chart, open(os.path.join(D, "chart-size.json"), "w"), indent=1)
print(json.dumps(out, indent=1)[:2500])
