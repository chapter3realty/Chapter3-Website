"""Batch 2026-11-b, /buyers/waterfront-homes/. Which parcels in Horry County are oceanfront (the first row on the beach).
Rule: sweep the parcel's outline straight out to the coastline (the ocean edge of the county boundary, RAW/coast.json),
square to the coast. The parcel is oceanfront when the swept area meets no other parcel with a building, and no unbuilt
parcel 25 m or deeper (a thin dune or beach strip with no building does not count). Streets are not parcels, so the whole
width of the lot is swept, not one line, so a second-row lot cannot look out through a street. Stacked condo outlines count once.
Writes RAW/oceanfront-pins.json (PIN -> kind) and prints counts.
Run: RAW=<scratch> python3 -I oceanfront.py"""
import json, os, math, collections
from shapely.geometry import Polygon, LineString
from shapely.ops import nearest_points
from shapely.strtree import STRtree
RAW = os.environ["RAW"]
J = lambda n: json.load(open(os.path.join(RAW, n)))
lat0 = 33.7; kx = 111320 * math.cos(math.radians(lat0)); ky = 110540
m = lambda c: [(x * kx, y * ky) for x, y in c]
cc = J("coast.json")["coordinates"]
while cc[-1][0] < -79.0008: cc.pop()      # the arc ends with the Georgetown county line across the island; keep only the beach
coast = LineString(m(cc))
rows = J("coast-parcels.json")
HOUSE = {"100", "101", "102", "110", "126"}
outl = {}; pins = collections.defaultdict(list)
for r in rows:
    g = r["g"]
    if not g: continue
    k = json.dumps(g["rings"][0][:4])
    if k not in outl:
        try: p = Polygon(m(g["rings"][0])).buffer(0)
        except Exception: continue
        outl[k] = {"poly": p, "built": False, "lus": set()}
    o = outl[k]; a = r["a"]
    o["lus"].add(a["LandUseCode"]); o["built"] = o["built"] or (a["MarketImprv"] or 0) > 0
    pins[k].append((a["PIN"], a["LandUseCode"]))
keys = list(outl); polys = [outl[k]["poly"] for k in keys]
tree = STRtree(polys)
from shapely.affinity import translate
front = set()
for i, k in enumerate(keys):
    p = polys[i]
    if p.area < 20 or p.distance(coast) > 260: continue
    a, b = nearest_points(p, coast)
    L = a.distance(b)
    if L < 0.5: front.add(k); continue
    vx, vy = (b.x - a.x) / L, (b.y - a.y) / L          # toward the sea, square to the coast
    core = p.buffer(-1.5) if p.buffer(-1.5).area > 5 else p
    sweep = core.union(translate(core, vx * (L + 5), vy * (L + 5))).convex_hull.difference(p)
    ok = True
    for j in tree.query(sweep):
        if j == i: continue
        inter = polys[j].intersection(sweep)
        if inter.area > 20:
            o = outl[keys[j]]
            depth = inter.area / max(1.0, core.length / 4)   # rough depth of the overlap along the sweep
            if o["built"] or depth >= 25: ok = False; break
    if ok: front.add(k)
out = {}
for k in front:
    for pin, lu in pins[k]:
        out[str(pin)] = "condo" if lu == "107" else ("house" if lu in HOUSE else "other:%s" % lu)
json.dump(out, open(os.path.join(RAW, "oceanfront-pins.json"), "w"))
c = collections.Counter(v if not v.startswith("other") else "other" for v in out.values())
print("oceanfront outlines", len(front), "pins", len(out), dict(c))
# a GeoJSON of the oceanfront outlines for a look on the aerial (degrees)
fe = []
for k in front:
    pp = outl[k]["poly"]
    if pp.geom_type != "Polygon": continue
    fe.append({"type": "Feature", "properties": {"lus": sorted(x or "" for x in outl[k]["lus"])}, "geometry": {"type": "Polygon", "coordinates": [[(x / kx, y / ky) for x, y in pp.exterior.coords]]}})
json.dump({"type": "FeatureCollection", "features": fe}, open(os.path.join(RAW, "oceanfront-outlines.geojson"), "w"))
