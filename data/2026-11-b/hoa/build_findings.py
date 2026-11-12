"""Builds findings.json and the chart and table files the spec reads, from fees-by-kind.json, rcbap.json, budgets.json
and the sibling files named below. Every number the page prints comes from findings.json. Run: python3 -I build_findings.py <this folder>.
Sibling files read (already verified in their own ledgers):
  ../../2026-11-a/buyers-cost-to-own/pums-2024-1yr.json, pums-2024-1yr-rest-of-sc.json  (Census ACS PUMS 2024, CONP)
  ../../2026-11-a/buyers-cost-to-own/hoa-by-area.json  (condo and house fee by ZIP, 2026-11-02)"""
import json, sys, os
d = sys.argv[1] if len(sys.argv) > 1 else "."
J = lambda p: json.load(open(os.path.join(d, p)))
F = J("fees-by-kind.json")["segments"]; R = J("rcbap.json"); B = J("budgets.json")
P = J("../../2026-11-a/buyers-cost-to-own/pums-2024-1yr.json")["groups"]
PR = J("../../2026-11-a/buyers-cost-to-own/pums-2024-1yr-rest-of-sc.json")["groups"]
A = J("../../2026-11-a/buyers-cost-to-own/hoa-by-area.json")["areas"]
def seg(k):
    s = F[k]; q = s["quartiles"]
    return {"homes_for_sale": s["total"], "with_fee": s["with_fee"], "no_fee_or_blank": s["fee_zero_or_blank"],
            "median": q["median"]["at_or_below"], "p25": q["p25"]["at_or_below"], "p75": q["p75"]["at_or_below"],
            "median_year": q["median"]["at_or_below"] * 12,
            "covers_pct": {f: round(100 * v["share_of_with_fee"]) for f, v in s["covers"].items() if v["share_of_with_fee"] is not None}}
KINDS = [("condo", "Condo (all)"), ("condo_oceanfront_highrise", "Condo in an oceanfront tower"), ("condo_oceanfront", "Condo in an oceanfront building"),
         ("condo_off_ocean", "Condo off the ocean"), ("townhouse", "Townhouse"), ("house", "House (all with a fee)"),
         ("house_no_amenities", "House, neighborhood with no shared amenities"), ("house_pool_or_clubhouse", "House, neighborhood with a pool or clubhouse"),
         ("house_gated", "House in a gated community"), ("house_golf_community", "House in a golf community"), ("house_gated_golf", "House in a gated golf community")]
out = {"fees_by_kind": {k: dict(seg(k), label=l) for k, l in KINDS if k in F}}
fk = out["fees_by_kind"]
if "house" in fk and "condo_oceanfront_highrise" in fk:
    out["tower_vs_house_times"] = round(fk["condo_oceanfront_highrise"]["median"] / fk["house"]["median"], 1)
# Census: what owners who live in the home say they pay (median among owners who pay a fee)
out["census_owners"] = {
    "horry_house": P["house_detached"]["CONP"], "horry_condo_bldg_3plus": P["apartment_building_3plus"]["CONP"],
    "horry_share_paying": P["all_owners"]["share_paying_condo_fee"], "rest_sc_house": PR["house_detached"]["CONP"],
    "rest_sc_condo_bldg_3plus": PR["apartment_building_3plus"]["CONP"], "rest_sc_share_paying": PR["all_owners"]["share_paying_condo_fee"],
    "note": "Horry = PUMAs 02701, 02702 (Loris area 02601 left out). Medians among owners who pay a fee."}
# The building's flood policy, per unit
out["flood_policy_per_unit_year"] = {"all": R["all"], "zone_V": R["zone_V"], "asOfDate": R["asOfDate"]}
out["flood_policy_per_unit_month_median"] = round(R["all"]["per_unit_median"] / 12)
# Budgets
out["budget_del_webb_grande_dunes_2025"] = B["del_webb_grande_dunes_2025"]["groups"]
out["budget_myrtle_trace_2026"] = B["myrtle_trace_2026"]["groups_of_each_100_income"]
# By area (ZIP), condos and houses, from the cost-to-own pull of 2026-11-02 ($25 steps, list price $50,000 or more)
out["by_area_2026_11_02"] = {z: {"name": v["name"], "condo_median": (v.get("condo") or {}).get("median"), "condo_n": (v.get("condo") or {}).get("listings"),
                                  "house_median": (v.get("house") or {}).get("median"), "house_n": (v.get("house") or {}).get("listings"),
                                  "house_no_hoa": (v.get("house") or {}).get("no_hoa")} for z, v in A.items()}
json.dump(out, open(os.path.join(d, "findings.json"), "w"), indent=1)
# Chart 1: typical monthly fee by kind of home (median, middle half), the kinds the page shows
chart = [{"kind": fk[k]["label"], "median": fk[k]["median"], "p25": fk[k]["p25"], "p75": fk[k]["p75"], "n": fk[k]["with_fee"]}
         for k in ["house_no_amenities", "house_pool_or_clubhouse", "house_gated_golf", "townhouse", "condo_off_ocean", "condo_oceanfront_highrise"] if k in fk]
json.dump({"title": "Typical monthly HOA fee, homes for sale on the Grand Strand", "rows": chart}, open(os.path.join(d, "chart-fee-by-kind.json"), "w"), indent=1)
# Table 2: what the fee covers (share of homes with a fee whose listing says the fee includes it)
ITEMS = [("hoa_includes_insurance", "Insurance"), ("hoa_includes_water_sewer", "Water and sewer"), ("hoa_includes_trash", "Trash"),
         ("hoa_includes_internet", "Internet"), ("hoa_includes_cable", "Cable TV"), ("hoa_includes_electric", "Electricity"),
         ("lawn_care_included", "Lawn care"), ("hoa_includes_pest", "Pest control")]
cols = [k for k in ["condo_oceanfront_highrise", "condo_off_ocean", "townhouse", "house"] if k in fk]
json.dump({"columns": [fk[c]["label"] for c in cols], "rows": [{"item": l, "pct": [fk[c]["covers_pct"].get(f) for c in cols]} for f, l in ITEMS]},
          open(os.path.join(d, "table-covers.json"), "w"), indent=1)
print(json.dumps({k: {x: v[x] for x in ("with_fee", "p25", "median", "p75")} for k, v in fk.items()}, indent=1))
print(json.dumps({k: v["covers_pct"] for k, v in fk.items()}))
print(out.get("tower_vs_house_times"), out["census_owners"], out["flood_policy_per_unit_month_median"])
