"""Active CRM listings with a Pawleys Island city, counted in aggregate by zone (same zones as analyze.py; DeBordieu
is not in this city search). Run: RAW=<dir> python3 -I analyze_listings.py <out dir>  -> listings-findings.json"""
import json, os, sys, statistics, collections
from shapely.geometry import shape, Point
from shapely.ops import unary_union, nearest_points
RAW = os.environ["RAW"]; OUT = sys.argv[1] if len(sys.argv) > 1 else "."
L = lambda n: json.load(open(os.path.join(RAW, n)))["features"]
town = [shape(f["geometry"]) for f in L("munis.geojson") if "PAWLEYS" in f["properties"]["Name"]][0]
us17 = unary_union([shape(f["geometry"]) for f in L("roads.geojson") if f["properties"]["St_Full"] == "OCEAN HWY"])
M = 1 / 111000.0
def east_of_17(pt):
    a, _ = nearest_points(us17, pt); d = us17.project(a)
    p1 = us17.interpolate(max(d - 30 * M, 0)); p2 = us17.interpolate(d + 30 * M)
    cross = (p2.x - p1.x) * (pt.y - p1.y) - (p2.y - p1.y) * (pt.x - p1.x)
    return (cross < 0) if p2.y > p1.y else (cross > 0)
def zone(lat, lng):
    pt = Point(lng, lat)
    if town.contains(pt): return "island"
    if not (33.38 <= lat <= 33.505): return "other"
    if east_of_17(pt): return "east_marsh" if lat < 33.447 else "litchfield"
    return "west17"
d = json.load(open(os.path.join(RAW, "listings-pi.json")))
g = collections.defaultdict(list)
for mls, h in d["homes"].items():
    if h["lat"] is None or h["price"] is None: continue
    z = zone(float(h["lat"]), float(h["lng"]))
    kind = {"house": "house", "townhouse": "condo_townhouse", "condo": "condo_townhouse"}.get(h["type"], h["type"])
    for k in (f"{z}/all", f"{z}/{kind}", f"all/{kind}", "all/all"): g[k].append(h)
def s(rows):
    p = sorted(r["price"] for r in rows)
    ppsf = sorted(r["price"] / float(r["sqft"]) for r in rows if r.get("sqft") and float(r["sqft"]) > 300)
    return {"n": len(rows), "median_price": statistics.median(p) if p else None, "min": p[0] if p else None, "max": p[-1] if p else None,
            "median_ppsf": round(statistics.median(ppsf)) if ppsf else None}
feat = {k: len(v) for k, v in d["features"].items() if k not in ("oceanfront", "no_hoa")}
island_feat = {k: sum(1 for m in v if m in d["homes"] and d["homes"][m]["lat"] and zone(float(d["homes"][m]["lat"]), float(d["homes"][m]["lng"])) == "island") for k, v in d["features"].items() if k not in ("oceanfront", "no_hoa")}
out = {"pulled": d["pulled"], "api_totals": d["api_totals"], "groups": {k: s(v) for k, v in sorted(g.items())},
       "feature_counts": feat, "island_feature_counts": island_feat,
       "note": "oceanfront and no_hoa flags came back on every listing and are not used"}
json.dump(out, open(os.path.join(OUT, "listings-findings.json"), "w"), indent=1)
for k, v in out["groups"].items(): print(k, v)
print(feat); print(island_feat)
