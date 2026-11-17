"""Map layers for /submarkets/conway/wild-wing-plantation/ (batch 2026-11-e).
Reads the county cache (RAW/county.json: 940 parcels with outlines, plus the large parcels) and map-lots.json
(one point per parcel with the golf, lake, pool and house flags). Writes map-layers.json: each lot's outline with
one kind (fairways, sanctuary, plain) and its golf and lake flags, the two Wild Wing golf-course parcels and the
property owners' association's lake-and-wetland parcel, and the US 501 line (Census TIGER, Blog-Brain
tools/geo/grand-strand-v2.json). No PIN, owner, address or value is written. Outlines are rounded to 5 decimals.
Run: RAW=<scratch dir with county.json> GEO=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I map_layers.py <this dir>
"""
import json, os, sys
from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union
D = sys.argv[1]
C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
GEO = json.load(open(os.environ["GEO"]))
ML = json.load(open(os.path.join(D, "map-lots.json")))["lots"]
def poly(rings):
    shell, *holes = rings
    return Polygon(shell, holes).buffer(0)
parcels = [(poly(a["rings"]), a) for a in C["parcels"].values()]
assert len(parcels) == 940 == len(ML)
lots, used = [], set()
count = {"fairways": 0, "sanctuary": 0, "plain": 0, "golf": 0, "lake": 0}
for lat, lng, grp, golf, lake, pool, house in ML:
    p = Point(lng, lat)
    hit = [i for i, (g, a) in enumerate(parcels) if i not in used and g.contains(p)]
    if len(hit) != 1:  # points are rounded to 4 decimals: take the nearest unused parcel
        hit = [min((i for i in range(len(parcels)) if i not in used), key=lambda i: parcels[i][0].distance(p))]
    used.add(hit[0]); g = parcels[hit[0]][0]
    kind = "fairways" if grp == "fairways" else "sanctuary" if grp == "sanctuary" else "plain"
    count[kind] += 1; count["golf"] += golf; count["lake"] += lake
    s = g.simplify(0.000012, preserve_topology=True)
    lots.append({"k": kind, "golf": bool(golf), "lake": bool(lake), "house": bool(house), "r": [[round(x, 5), round(y, 5)] for x, y in s.exterior.coords]})
big = {b["attributes"]["LegalDescr"]: b for b in C["geo"]["big"]}
golfp = [big["WILD WING; PAR A"], big["WILD WING PLANTATION; PAR V"]]
lakep = big["WILD WING PLANTATION; LAKE & WETLAND PH 1"]
minx, miny, maxx, maxy = unary_union([g for g, a in parcels]).bounds
px, py = (maxx - minx) * 0.06, (maxy - miny) * 0.05
frame = box(minx - px, miny - py, maxx + px, maxy + py)
def rings(b, tol=0.00002):
    out = []
    for r in b["geometry"]["rings"]:
        g = Polygon(r).buffer(0).intersection(frame).simplify(tol, preserve_topology=True)
        for q in ([g] if g.geom_type == "Polygon" else list(getattr(g, "geoms", []))):
            if q.geom_type == "Polygon" and not q.is_empty:
                out.append([[round(x, 5), round(y, 5)] for x, y in q.exterior.coords])
    return out
def dec(p, s=10000):
    out, x, y = [], 0, 0
    for i in range(0, len(p), 2):
        x, y = (p[0], p[1]) if i == 0 else (x + p[i], y + p[i + 1])
        out.append((x / s - 80, y / s + 33))
    return out
roads = []
for rd in GEO["region"]["roads"]:
    if rd.get("r") not in ("US 501", "US 501 BUS"): continue
    ln = LineString(dec(rd["p"])).intersection(frame.buffer(0.01))
    for piece in ([ln] if ln.geom_type == "LineString" else list(getattr(ln, "geoms", []))):
        if piece.geom_type == "LineString" and not piece.is_empty:
            roads.append({"r": rd["r"], "p": [[round(x, 5), round(y, 5)] for x, y in piece.coords]})
res = {"frame": [round(v, 5) for v in frame.bounds], "counts": count, "lots": lots,
       "golf": [r for b in golfp for r in rings(b)], "lake": rings(lakep), "roads": roads,
       "sources": ["Horry County GIS parcels (layer 24), read 2026-11-14", "U.S. Census Bureau TIGER/Line roads"]}
json.dump(res, open(os.path.join(D, "map-layers.json"), "w"), separators=(",", ":"))
print(count, res["frame"], "golf rings", len(res["golf"]), "lake rings", len(res["lake"]), "roads", len(roads), os.path.getsize(os.path.join(D, "map-layers.json")))
