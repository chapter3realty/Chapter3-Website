#!/usr/bin/env python3
"""Straight-line distance from each town home (RAW/parcel-zones.json, from analyze.py) to Ocean Boulevard (county layer 18,
N and S OCEAN BLVD), the road that runs along the dunes the length of the town. Ocean-side homes count as 0.
By zoning district: median distance in miles and the share within a quarter mile and a half mile. Also the town's size.
Run: RAW=<scratch> python3 -I analyze_beach.py <datadir>. Writes <datadir>/beach-distance.json."""
import sys, os, json, math, statistics, collections
from shapely.geometry import shape, Point, LineString
from shapely.ops import unary_union
RAW = os.environ["RAW"]; D = sys.argv[1]
J = lambda n: json.load(open(os.path.join(RAW, n)))
lat0 = 33.61; kx = 111320 * math.cos(math.radians(lat0)); ky = 110540
def m(x, y): return (x * kx, y * ky)
ob = unary_union([LineString([m(*p) for p in path]) for f in J("roads.json") if (f["attributes"].get("FULLNAME") or "") in ("N OCEAN BLVD", "S OCEAN BLVD") for path in f["geometry"]["paths"]])
town = shape(J("town-limits.geojson")["features"][0]["geometry"])
H = J("parcel-zones.json")
by = collections.defaultdict(list)
for h in H:
    d = 0.0 if h["ocean"] else Point(m(h["x"], h["y"])).distance(ob) / 1609.344
    by["town"].append(d); by[h["zone"]].append(d)
    if h["zone"] in ("R3", "C3"): by["R3C3"].append(d)
    if h["zone"] in ("R1", "R2"): by["R1R2"].append(d)
out = {"method": "straight line to Ocean Boulevard (county layer 18); ocean-side homes = 0", "zones": {}}
for z, xs in by.items():
    out["zones"][z] = {"homes": len(xs), "median_miles": round(statistics.median(xs), 2), "max_miles": round(max(xs), 2),
                       "within_quarter_mile_pct": round(100 * sum(x <= 0.25 for x in xs) / len(xs), 1),
                       "within_half_mile_pct": round(100 * sum(x <= 0.5 for x in xs) / len(xs), 1)}
# town size: length along the coast and area
g = town if town.geom_type == "Polygon" else max(town.geoms, key=lambda x: x.area)
gm = shape({"type": "Polygon", "coordinates": [[m(*c) for c in g.exterior.coords]]})
obl = ob.intersection(gm.buffer(30))
out["town_area_sq_miles"] = round(sum((shape({"type": "Polygon", "coordinates": [[m(*c) for c in gg.exterior.coords]]}).area for gg in (town.geoms if town.geom_type != "Polygon" else [town]))) / 1609.344 ** 2, 2)
out["ocean_blvd_in_town_miles"] = round(obl.length / 1609.344, 2)
json.dump(out, open(os.path.join(D, "beach-distance.json"), "w"), indent=1); print(json.dumps(out, indent=1))
