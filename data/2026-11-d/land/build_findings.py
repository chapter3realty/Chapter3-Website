"""What the /buyers/land/ page prints, read from land.json (pull_land.py). Rounds as the page will show them.
Run: python3 -I build_findings.py <this folder>. Writes findings.json, chart-ppa-by-size.json, chart-ppa-by-area.json."""
import json, sys
D = sys.argv[1] if len(sys.argv) > 1 else "."
L = json.load(open(f"{D}/land.json"))
r = lambda v, s: None if v is None else int(round(v / s) * s)
A = L["by_area"]; S = L["horry_by_size"]; F = L["horry_flags"]; H = L["by_county"]["county_horry"]
NAMES = {"loris_green_sea_nichols": "Around Loris, Green Sea and Nichols", "aynor_galivants_ferry": "Around Aynor and Galivants Ferry",
         "conway": "Around Conway", "longs": "Longs", "myrtle_beach_carolina_forest_socastee": "Myrtle Beach, Carolina Forest, Socastee",
         "little_river": "Little River", "pawleys_island": "Pawleys Island area", "murrells_inlet_garden_city": "Murrells Inlet and Garden City",
         "north_myrtle_beach": "North Myrtle Beach", "surfside_beach": "Surfside Beach"}
# price per acre on tracts of an acre or more, areas with 15 or more such tracts
area_rows = []
for k, v in A.items():
    if k in NAMES and v["one_acre_or_more"] >= 15:
        area_rows.append({"key": k, "label": NAMES[k], "tracts_1ac_plus": v["one_acre_or_more"], "listings": v["listings"],
                          "per_acre_1ac_plus": r(v["median_ask_per_acre_one_acre_plus"], 1000),
                          "median_acres": round(v["median_acres"], 1), "median_ask": r(v["median_ask"], 5000), "ten_acres_plus": v["ten_acres_or_more"]})
area_rows.sort(key=lambda x: x["per_acre_1ac_plus"])
size_label = {"under_half_acre": "Under half an acre", "half_to_1": "Half an acre to 1 acre", "1_to_5": "1 to 5 acres", "5_to_20": "5 to 20 acres", "20_plus": "20 acres or more"}
size_rows = [{"key": k, "label": size_label[k], "listings": v["listings"], "per_acre": r(v["median_ask_per_acre"], 1000),
              "median_ask": r(v["median_ask"], 5000), "median_acres": round(v["median_acres"], 2)} for k, v in S.items()]
share = lambda n: {"n": n, "of": L["totals"]["land_horry"], "pct": round(100 * n / L["totals"]["land_horry"], 1)}
out = {"pulled": L["pulled"], "group": "land for sale (type=land), listing asks, not sales",
       "totals": L["totals"],
       "horry": {"listings": H["listings"], "median_ask": r(H["median_ask"], 5000), "median_acres": round(H["median_acres"], 1),
                 "one_acre_plus": H["one_acre_or_more"], "per_acre_1ac_plus": r(H["median_ask_per_acre_one_acre_plus"], 1000),
                 "ten_acres_plus": H["ten_acres_or_more"]},
       "georgetown": {"listings": L["by_county"]["county_georgetown"]["listings"], "median_ask": r(L["by_county"]["county_georgetown"]["median_ask"], 5000)},
       "by_size": size_rows, "by_area": area_rows,
       "horry_flags": {k: share(F[k]) for k in ["septic_approved", "public_sewer", "public_water", "well_water", "mobile_home_allowed",
                        "deed_restrictions", "no_hoa_fee", "dirt_road", "private_road", "easement_access", "wooded_lot", "cleared_lot",
                        "subdividable", "hunting_land", "pond_on_property", "outside_city_limits", "lot_1_acres_plus", "lot_10_acres_plus",
                        "lot_25_acres_plus", "lot_50_acres_plus", "lot_100_acres_plus"]}}
# county map under each Horry listing's point (pull_gis.py)
try:
    G = json.load(open(f"{D}/gis.json"))
    Z = G["zoning_at_point"]; N = G["pins_read"]
    MH_ZONES = [z for z in Z if z in ("FA", "CFA") or z.startswith("MSF") or z in ("AG 5", "AG 7")]
    bigsum = {}
    for b in ("1_to_5", "5_plus"):
        for k, v in G["zoning_by_size"].get(b, {}).items(): bigsum[k] = bigsum.get(k, 0) + v
    nbig = sum(bigsum.values())
    out["county_map"] = {"pulled": G["pulled"], "listings": N, "unincorporated": G["town_at_point"].get("unincorporated"),
        "fa_cfa": Z.get("FA", 0) + Z.get("CFA", 0), "fa_cfa_pct": round(100 * (Z.get("FA", 0) + Z.get("CFA", 0)) / N, 1),
        "mobile_home_zone": sum(Z[z] for z in MH_ZONES), "mobile_home_zone_pct": round(100 * sum(Z[z] for z in MH_ZONES) / N, 1),
        "mobile_home_zones_counted": MH_ZONES,
        "sf_no_mobile": sum(v for z, v in Z.items() if z.startswith("SF ")),
        "tracts_1ac_plus": nbig, "tracts_1ac_plus_fa_cfa": bigsum.get("FA", 0) + bigsum.get("CFA", 0),
        "tracts_1ac_plus_fa_cfa_pct": round(100 * (bigsum.get("FA", 0) + bigsum.get("CFA", 0)) / nbig, 1),
        "flood_high_risk": G["high_risk_flood_at_point"]["high_risk"], "flood_high_risk_pct": round(100 * G["high_risk_flood_at_point"]["high_risk"] / N, 1),
        "flood_moderate_0_2": G["flood_zone_at_point"].get("0.2 PCT ANNUAL CHANCE FLOOD HAZARD", 0)}
except FileNotFoundError:
    pass
json.dump(out, open(f"{D}/findings.json", "w"), indent=1)
json.dump({"title": "The more land you buy, the less each acre costs", "unit": "median asking price per acre, Horry County land for sale",
           "rows": [{"label": x["label"], "value": x["per_acre"], "n": x["listings"]} for x in size_rows], "pulled": L["pulled"]},
          open(f"{D}/chart-ppa-by-size.json", "w"), indent=1)
json.dump({"title": "An acre costs least in the county's rural west", "unit": "median asking price per acre, tracts of 1 acre or more for sale",
           "rows": [{"label": x["label"], "value": x["per_acre_1ac_plus"], "n": x["tracts_1ac_plus"]} for x in area_rows], "pulled": L["pulled"]},
          open(f"{D}/chart-ppa-by-area.json", "w"), indent=1)
print(json.dumps(out, indent=1))
