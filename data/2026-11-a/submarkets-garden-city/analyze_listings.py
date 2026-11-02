#!/usr/bin/env python3
"""Active listings in the CRM's Garden City area, in aggregate: count, median list price and median price per square foot by type,
by side of Waccamaw Drive and by county. Run: RAW=<scratch> python3 -I analyze_listings.py <datadir>. Writes <datadir>/listings-findings.json."""
import sys, os, json, statistics, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import Point, LineString
from shapely.ops import unary_union
D = sys.argv[1]
L = J("listings-gc.json")
osm = J("osm.json")
WALL = unary_union([LineString([(p["lon"], p["lat"]) for p in e["geometry"]]) for e in osm["elements"] if "Waccamaw Drive" in e.get("tags", {}).get("name", "")])
GT = CTY["Georgetown County"]
out = collections.defaultdict(list)
for mls, h in L["homes"].items():
    if h["lat"] is None: continue
    pt = Point(h["lng"], h["lat"])
    county = "georgetown" if GT.contains(pt) else "horry"
    if county == "horry": z = zone(pt)
    else:
        s, d = side(pt, WALL); z = "beach" if s > 0 else ("middle" if d < 400 else "inland")
    h = dict(h, county=county, zone=z, dock=mls in L["features"]["private_dock"], str_ok=mls in L["features"]["str_allowed"])
    for key in ("all", h["type"], "%s/%s" % (z, h["type"]), "%s/%s/%s" % (county, z, h["type"]), county + "/all"):
        out[key].append(h)
def s(xs):
    pr = [x["price"] for x in xs if x["price"]]; pp = [x["price"] / x["sqft"] for x in xs if x["price"] and x["sqft"]]
    return {"n": len(xs), "median_price": statistics.median(pr) if pr else None, "min": min(pr) if pr else None, "max": max(pr) if pr else None,
            "median_ppsf": round(statistics.median(pp)) if pp else None, "with_sqft": len(pp), "docks": sum(x["dock"] for x in xs), "str_allowed": sum(x["str_ok"] for x in xs)}
F = {"pulled": L["pulled"], "api_totals": L["api_totals"], "feature_counts": {k: len(v) for k, v in L["features"].items()},
     "note": "CRM public map API, has=area_garden_city; MLS listings counted in aggregate only. The oceanfront and no_hoa flags came back on every home in this area and are not used.",
     "groups": {k: s(v) for k, v in sorted(out.items())}}
json.dump(F, open(os.path.join(D, "listings-findings.json"), "w"), indent=1)
for k, v in F["groups"].items(): print(k, v)
