"""Merge resale (findings.json, from analyze.py) and builder sales (new-sales.json, from analyze_new.py) into the page's
market table: months of supply for houses and condos, all homes and resales only, by price band. Writes market.json, the
file the page's chart and table read. Usage: python3 -I build_market.py <this dir>"""
import json, os, sys
D = sys.argv[1]
F = json.load(open(os.path.join(D, "findings.json"))); N = json.load(open(os.path.join(D, "new-sales.json")))
out = {"listings_pulled": F["listings"]["pulled"], "deeds": "recorded 2025-10-01 to 2026-09-30",
       "rule": "months of supply = homes for sale now / (homes sold in 12 months / 12); sold = resales (analyze.py) + builder sales (analyze_new.py)", "kinds": {}}
for k in ("house", "condo"):
    L = F["listings"][k]; sold = L["resold_12mo"] + N["builder_by_kind"][k]; new_fs = L["new_construction"]
    r = {"for_sale": L["for_sale"], "for_sale_new": new_fs, "for_sale_resale": L["for_sale"] - new_fs,
         "sold_12mo": sold, "resold_12mo": L["resold_12mo"], "builder_sold_12mo": N["builder_by_kind"][k],
         "months_all": round(L["for_sale"] / (sold / 12), 1), "months_resale": L["months_supply_resale"],
         "months_new": round(new_fs / (N["builder_by_kind"][k] / 12), 1),
         "price_cut": L["price_reduced"], "pct_price_cut": L["pct_price_reduced"],
         "listed_over_90_days": L["for_sale"] - L["listed_within_days"]["90"] if "90" in L["listed_within_days"] else L["for_sale"] - L["listed_within_days"][90],
         "median_ask": L["median_ask"], "bands": []}
    r["pct_listed_over_90_days"] = round(100 * r["listed_over_90_days"] / L["for_sale"], 1)
    for bnd, nb in zip(L["by_price_band"], N["builder_by_price_band"][k]):
        s = bnd["resold_12mo"] + nb["sold_12mo"]
        r["bands"].append({"band": bnd["band"], "for_sale": bnd["for_sale"], "sold_12mo": s, "months_all": round(bnd["for_sale"] / (s / 12), 1),
                           "for_sale_resale": bnd["for_sale_resale"], "resold_12mo": bnd["resold_12mo"], "months_resale": bnd["months_supply_resale"]})
    out["kinds"][k] = r
json.dump(out, open(os.path.join(D, "market.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
