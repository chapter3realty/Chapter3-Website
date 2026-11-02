#!/usr/bin/env python3
"""Census Day 2020 occupancy along Waccamaw Drive (both counties), the Census place totals, the NOAA tide gauge trend and
high-tide flood days, and the tax worked example. Run: RAW=<scratch> python3 -I analyze_census_noaa.py <datadir>. Writes census-noaa.json and chart-*.json."""
import sys, os, json, glob, statistics
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import shape, LineString
from shapely.ops import unary_union
D = sys.argv[1]; R = lambda n: json.load(open(os.path.join(D, "raw", n)))
osm = J("osm.json")
W = unary_union([LineString([(p["lon"], p["lat"]) for p in e["geometry"]]) for e in osm["elements"] if "Waccamaw Drive" in e.get("tags", {}).get("name", "")])
h5 = {}
for f in glob.glob(os.path.join(D, "raw/census-H5-blocks-*.json")):
    dd = json.load(open(f))["response"]["data"]
    for r in dd[1:]:
        x = dict(zip(dd[0], r)); h5[x["GEO_ID"][-15:]] = x
buf = W.buffer(0.0012)   # blocks that touch a band about 110 to 130 m either side of Waccamaw Drive
out = {"strip_blocks": {}}
for f in J("blocks2020.geojson")["features"]:
    p = f["properties"]
    if p["HU100"] <= 0 or not shape(f["geometry"]).intersects(buf): continue
    c = {"051": "horry", "043": "georgetown"}[p["COUNTY"]]
    for k in (c, "both"):
        o = out["strip_blocks"].setdefault(k, {"blocks": 0, "housing_units": 0, "vacant": 0, "seasonal": 0, "people": 0})
        x = h5[p["GEOID"]]
        o["blocks"] += 1; o["housing_units"] += p["HU100"]; o["people"] += p["POP100"]; o["vacant"] += int(x["H5_001N"]); o["seasonal"] += int(x["H5_006N"])
for k, o in out["strip_blocks"].items():
    o["occupied"] = o["housing_units"] - o["vacant"]; o["pct_occupied"] = round(100 * o["occupied"] / o["housing_units"], 1); o["pct_seasonal"] = round(100 * o["seasonal"] / o["housing_units"], 1)
def acs(t, g): d = R("census-%s-%s.json" % (t, g))["response"]["data"]; return dict(zip(d[0], d[1]))
for g, name in (("160XX00US4528455", "cdp"), ("050XX00US45051", "horry")):
    h1 = acs("DECENNIALPL2020.H1", g); h5c = acs("DECENNIALDHC2020.H5", g); p1 = acs("DECENNIALPL2020.P1", g)
    out[name + "_2020"] = {"people": int(p1["P1_001N"]), "housing_units": int(h1["H1_001N"]), "occupied": int(h1["H1_002N"]), "vacant": int(h1["H1_003N"]), "seasonal": int(h5c["H5_006N"]),
                          "pct_seasonal": round(100 * int(h5c["H5_006N"]) / int(h1["H1_001N"]), 1), "pct_occupied": round(100 * int(h1["H1_002N"]) / int(h1["H1_001N"]), 1)}
# NOAA Springmaid Pier
tr = [x for x in R("noaa-sltrend-8661070.json")["SeaLvlTrends"] if x["stationId"] == "8661070"][0]
yrs = (int(tr["endDate"][-4:]) + 1 - int(tr["startDate"][-4:]))
out["sea_level"] = {"inches_per_decade": tr["trend"], "error": tr["trendError"], "start": tr["startDate"], "end": tr["endDate"], "inches_over_record": round(tr["trend"] * (2025.96 - 1957.46) / 10, 1)}
h = R("noaa-htf-annual-8661070.json")["AnnualFloodCount"]
rows = [{"year": x["year"], "minor_days": x["minCount"], "missing_days": x["nanCount"]} for x in h if x["minCount"] is not None]
def dec(a, b):
    xs = [r for r in rows if a <= r["year"] <= b and r["missing_days"] < 60]
    return {"years": "%d-%d" % (a, b), "years_used": len(xs), "avg_minor_days": round(statistics.mean(r["minor_days"] for r in xs), 1)}
out["high_tide_flood_days"] = {"by_decade": [dec(1985, 1994), dec(1995, 2004), dec(2005, 2014), dec(2015, 2024)], "rule": "years with fewer than 60 days of missing data",
                               "outlook_latest": R("noaa-htf-outlook-8661070.json")["MetYearAnnualOutlook"][-1]}
json.dump({"title": "Minor high-tide flood days a year at Springmaid Pier, Myrtle Beach (NOAA)", "rows": [r for r in rows if r["year"] >= 1980]}, open(os.path.join(D, "chart-high-tide-days.json"), "w"), indent=0)
# Tax worked example: the middle ocean-side condo sale (findings.json sales beach/condo median), 2026 millage for Murrells Inlet - Garden City
F = json.load(open(os.path.join(D, "findings.json")))
price = F["sales"]["beach/condo"]["median"]; mills = 52.1 + 119.1 + 28.0 + 8.1; school_ops = 109.1
out["tax_example"] = {"price": price, "mills": round(mills, 1), "rental_or_second_home_6pct": round(price * 0.06 * mills / 1000), "legal_residence_4pct": round(price * 0.04 * (mills - school_ops) / 1000),
                      "parts": "county 52.1 + schools 119.1 (debt 10.0, operation 109.1) + Murrells Inlet-Garden City fire 28.0 + waste management 8.1"}
A = json.load(open(os.path.join(D, "airroi.json")))
json.dump({"title": "Average revenue per active Airbnb listing by calendar month, Garden City Beach (AirROI, two-year average)", "rows": [{"month": k, "revenue": v["revenue"], "season": v["season"]} for k, v in A["calendar_avg_2yr"].items()],
           "occupancy_by_month_last_12": [{"month": k, "occupancy": v["occupancy"]} for k, v in A["months"].items()]}, open(os.path.join(D, "chart-str-months.json"), "w"), indent=0)
json.dump(out, open(os.path.join(D, "census-noaa.json"), "w"), indent=1); print(json.dumps(out, indent=1))
