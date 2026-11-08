"""Public beach access points per mile of beach, by the beach name SCDES gives each point (raw/scdes-access-points.json).
Span = shore distance from the first to the last point of that beach along coast.geojson. Run: python3 -I analyze_access.py <datadir> -> access-findings.json"""
import json, sys, math, collections
from shapely.geometry import shape, Point
from shapely.ops import transform
D = sys.argv[1]; C = math.cos(math.radians(33.65)); P = lambda x, y, z=None: ((x + 79.0) * 69.17 * C, (y - 33.65) * 69.0)
coast = transform(P, shape(json.load(open(D + "/coast.geojson"))["features"][0]["geometry"]))
A = json.load(open(D + "/raw/scdes-access-points.json"))["features"]
GROUP = {"Unincorporated Georgetown County": "Garden City (Georgetown County end)", "Garden City": "Garden City (Horry County)"}
c = collections.defaultdict(list); park = collections.defaultdict(collections.Counter)
for f in A:
    n = GROUP.get(f["attributes"]["Beach_Name"], f["attributes"]["Beach_Name"])
    c[n].append(coast.project(Point(*P(f["geometry"]["x"], f["geometry"]["y"]))))
out = {}
for n, v in sorted(c.items(), key=lambda kv: -max(kv[1])):
    span = max(v) - min(v)
    out[n] = {"points": len(v), "span_miles": round(span, 2), "per_mile": round(len(v) / span, 1) if span > .5 else None, "avg_gap_feet": round(span * 5280 / (len(v) - 1)) if len(v) > 1 and span > .5 else None}
gc = c["Garden City (Horry County)"] + c["Garden City (Georgetown County end)"]
out["Garden City, both counties"] = {"points": len(gc), "span_miles": round(max(gc) - min(gc), 2), "per_mile": round(len(gc) / (max(gc) - min(gc)), 1), "avg_gap_feet": round((max(gc) - min(gc)) * 5280 / (len(gc) - 1))}
json.dump(out, open(D + "/access-findings.json", "w"), indent=1); print(json.dumps(out, indent=0))
