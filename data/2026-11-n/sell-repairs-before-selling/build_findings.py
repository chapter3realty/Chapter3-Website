"""Findings for /sell/repairs-before-selling/. Reads raw/acs1-2025-*.json (pull-acs.sh), raw/noaa-normals.json (pull-noaa.sh),
listing-counts.json (pull_listing_counts.py) and the HUD Estimated Useful Life values typed from the HUD table (source in the
ledger, row 4). Writes findings.json, which every chart and table on the page reads.
Run: python3 -I build_findings.py <this dir>"""
import json, os, sys
D = sys.argv[1]
YEAR = 2026
def acs(t, g):
    d = json.load(open(os.path.join(D, "raw", f"acs1-2025-{t}-{g}.json")))["response"]["data"]
    return dict(zip(d[0], d[1]))
DEC = [("2020 or later", 2, 2020, None), ("2010 to 2019", 3, 2010, 2019), ("2000 to 2009", 4, 2000, 2009),
       ("1990 to 1999", 5, 1990, 1999), ("1980 to 1989", 6, 1980, 1989), ("1970 to 1979", 7, 1970, 1979),
       ("1960 to 1969", 8, 1960, 1969), ("1950 to 1959", 9, 1950, 1959), ("1940 to 1949", 10, 1940, 1949),
       ("1939 or earlier", 11, None, 1939)]
out = {"source": "Census ACS 2025 1-year, tables B25034, B25035, B25036; NOAA 1991-2020 normals; CRM active listings",
       "age_year": YEAR, "geos": {}}
for g in ["horry", "georgetown", "sc", "us"]:
    v = acs("B25034", g); tot = int(v["B25034_001E"])
    dec = [{"built": n, "units": int(v[f"B25034_{i:03d}E"]), "moe": int(v[f"B25034_{i:03d}M"]),
            "pct": round(100 * int(v[f"B25034_{i:03d}E"]) / tot, 1),
            "age_in_2026": (f"{YEAR - b} to {YEAR - a}" if a and b else (f"{YEAR - a} or less" if a else f"{YEAR - b} or more"))}
           for n, i, a, b in DEC]
    u = {d["built"]: d["units"] for d in dec}
    before2010 = tot - u["2020 or later"] - u["2010 to 2019"]
    before2000 = before2010 - u["2000 to 2009"]
    before1980 = sum(u[k] for k in ["1970 to 1979", "1960 to 1969", "1950 to 1959", "1940 to 1949", "1939 or earlier"])
    o = acs("B25036", g); otot = int(o["B25036_002E"])
    own_before2000 = sum(int(o[f"B25036_{i:03d}E"]) for i in range(6, 13))
    own_2000s = int(o["B25036_005E"])
    out["geos"][g] = {"name": v["NAME"], "housing_units": tot, "median_year_built": int(acs("B25035", g)["B25035_001E"]),
        "by_decade": dec,
        "built_2009_or_earlier": {"units": before2010, "pct": round(100 * before2010 / tot, 1)},
        "built_1999_or_earlier": {"units": before2000, "pct": round(100 * before2000 / tot, 1)},
        "built_1960_to_1979": {"units": u["1960 to 1969"] + u["1970 to 1979"], "pct": round(100 * (u["1960 to 1969"] + u["1970 to 1979"]) / tot, 1)},
        "built_1979_or_earlier": {"units": before1980, "pct": round(100 * before1980 / tot, 1)},
        "owner_occupied": {"units": otot, "built_1999_or_earlier": own_before2000, "pct_1999_or_earlier": round(100 * own_before2000 / otot, 1),
                           "built_2000_to_2009": own_2000s, "pct_2000_to_2009": round(100 * own_2000s / otot, 1)}}
# HUD CNA e-Tool Estimated Useful Life table (family column), typed from hud.gov/sites/documents/eul_for_cna_e_tool.pdf
EUL = [("Asphalt shingle roof", "3.3.4.1.1", 20), ("Metal roof", "3.3.4.1.2", 50), ("Heat pump or AC outdoor unit", "3.4.3.1.1 / 3.4.3.1.2", 15),
       ("Air handler (indoor unit)", "3.4.3.1.3", 20), ("Water heater, gas or electric", "3.4.1.2.6", 12), ("Electrical service panel", "3.4.4.1.1", 50)]
h = out["geos"]["horry"]; med = h["median_year_built"]
out["age_clock"] = [{"item": n, "hud_item": c, "eul_years": y, "original_if_built_in": YEAR - y,
                     "median_home_age": YEAR - med, "median_home_past_eul": (YEAR - med) >= y} for n, c, y in EUL]
n = {r["NAME"].split(",")[0]: r for r in json.load(open(os.path.join(D, "raw", "noaa-normals.json")))}
out["climate"] = [{"station": r["NAME"], "id": r["STATION"], "cooling_degree_days": float(r["ANN-CLDD-NORMAL"]),
                   "heating_degree_days": float(r["ANN-HTDD-NORMAL"]), "annual_mean_f": float(r["ANN-TAVG-NORMAL"]),
                   "summer_mean_f": float(r["JJA-TAVG-NORMAL"]), "days_90f_or_more": float(r["ANN-TMAX-AVGNDS-GRTH090"])}
                  for r in json.load(open(os.path.join(D, "raw", "noaa-normals.json")))]
c = {x["id"]: x for x in out["climate"]}
out["climate_ratio_cooling_nmb_vs_columbus"] = round(c["USW00093718"]["cooling_degree_days"] / c["USW00014821"]["cooling_degree_days"], 2)
out["climate_ratio_cooling_nmb_vs_nyc"] = round(c["USW00093718"]["cooling_degree_days"] / c["USW00094728"]["cooling_degree_days"], 2)
lp = os.path.join(D, "listing-counts.json")
if os.path.exists(lp):
    L = json.load(open(lp)); rows = []
    for r in L["rows"]:
        t = r["houses"] or 0
        pct = lambda k: (round(100 * r[k] / t, 1) if t and r.get(k) is not None else None)
        nr, nnr = r.get("new_roof"), r.get("no_new_roof")
        rows.append(dict(r, pct_new_roof=pct("new_roof"), pct_new_hvac=pct("new_hvac"), pct_home_warranty=pct("home_warranty"),
                         pct_renovated=pct("renovated"), pct_fixer_upper=pct("fixer_upper"), pct_price_reduced=pct("price_reduced"),
                         pct_crawlspace=pct("crawlspace"),
                         pct_price_cut_if_new_roof=(round(100 * r["new_roof_and_price_reduced"] / nr, 1) if nr else None),
                         pct_price_cut_if_no_new_roof=(round(100 * r["no_new_roof_and_price_reduced"] / nnr, 1) if nnr else None)))
    out["listings"] = {"pulled": L["pulled"], "filters": L["base_filters"], "rows": rows}
# NAR and NARI, 2025 Remodeling Impact Report (April 2025), charts typed from
# https://remodelingdoneright.nari.org/media/jjjaoome/2025remodelingimpactreport.pdf (ledger row 22), and
# NAR 2025 Profile of Home Staging, "Home Improvement" chart (ledger row 21).
out["nar_cost_recovered_pct"] = [["New steel front door", 100], ["Complete kitchen renovation", 60], ["Minor kitchen upgrade", 60],
    ["Add new bathroom", 56], ["New primary suite", 54], ["Bathroom renovation", 50]]
out["nar_recommend_before_selling_pct"] = [["Paint the entire home", 50], ["Paint 1 interior room", 41], ["New roofing", 37],
    ["Kitchen upgrade", 30], ["Bathroom renovation", 24]]
out["nar_staging_recommend_pct"] = [["Declutter home", 91], ["Entire home cleaning", 88], ["Improve curb appeal", 77], ["Professional photos", 76],
    ["Minor repairs", 75], ["Carpet cleaning", 74], ["Depersonalize home", 72], ["Paint touch ups", 67], ["Painting walls", 57], ["Landscape outdoor area", 53]]
if "listings" in out:
    R = {r["band"]: r for r in out["listings"]["rows"]}
    old = [R[b] for b in ["built 1985 or earlier", "built 1986 to 1995", "built 1996 to 2005"]]
    n = sum(r["houses"] for r in old)
    out["listings"]["built_2005_or_earlier"] = {"houses": n, "new_roof": sum(r["new_roof"] for r in old), "new_hvac": sum(r["new_hvac"] for r in old),
        "pct_new_roof": round(100 * sum(r["new_roof"] for r in old) / n, 1), "pct_new_hvac": round(100 * sum(r["new_hvac"] for r in old) / n, 1)}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({k: out["geos"]["horry"][k] for k in ["median_year_built", "built_2009_or_earlier", "built_1999_or_earlier", "built_1960_to_1979", "owner_occupied"]}, indent=0))
print([(g, out["geos"][g]["median_year_built"]) for g in out["geos"]], out["climate_ratio_cooling_nmb_vs_columbus"], out["climate_ratio_cooling_nmb_vs_nyc"])
print([(d["built"], d["units"], d["pct"]) for d in out["geos"]["horry"]["by_decade"]])
