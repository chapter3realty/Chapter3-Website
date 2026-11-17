"""Map layers for /submarkets/myrtle-beach/riverwalk/ (the writer, batch 2026-11-e).

Reads the county cache (RAW/county.json, pull_county.py: parcels layer 24, hydrography layer 21, the course parcels).
Writes map-layers.json: each condo unit's outline with one kind (near = within 25 m of the Intracoastal Waterway's
mapped edge, mid = 25 to 100 m, far = over 100 m), the townhome lots and garage parcels as kind "other", the Intracoastal
Waterway and the Arrowhead Country Club parcels cut to the frame. No PIN, owner, address or value is written.
Outlines are rounded to 5 decimals (about 1 m) and simplified to 1.5 m.
Run: RAW=<dir with county.json> python3 -I map_layers.py <this dir>
"""
import json, math, os, sys
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from shapely import affinity

D, RAW = sys.argv[1], os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json")))

def mp(f):
    out = None
    for ring in f["geometry"]["rings"]:
        p = Polygon(ring).buffer(0)
        out = p if out is None else out.symmetric_difference(p)
    return out

rows = [(r["attributes"], mp(r)) for r in C["rows"]]
def phase(a):
    s = a["LegalDescr"].split(";")[0].strip()
    if s.startswith("RIVERWALK II"): return "II"
    if s in ("RIVERWALK AT ARROWHEAD", "RIVERWALK @ ARROWHEAD"): return "I"
    return "TH" if "TNHMS" in s else "other"

allp = unary_union([g for a, g in rows])
lat0 = allp.centroid.y
kx, ky = 111320 * math.cos(math.radians(lat0)), 110540
proj = lambda g: affinity.scale(g, xfact=kx, yfact=ky, origin=(0, 0))
icw = unary_union([mp(f) for f in C["geo"]["hydro"]]); icwp = proj(icw)
golf = unary_union([mp(f) for f in C["geo"]["big"] if "ARROWHEAD COUNTRY CLUB" in (f["attributes"]["OwnerName"] or "")])

lots, count = [], {"near": 0, "mid": 0, "far": 0, "other": 0}
for a, g in rows:
    if a["LandUseCode"] == "107":
        d = proj(g).distance(icwp)
        k = "near" if d <= 25 else "mid" if d <= 100 else "far"
    else:
        k = "other"
    count[k] += 1
    s = g.simplify(0.000015, preserve_topology=True)
    polys = [s] if s.geom_type == "Polygon" else list(s.geoms)
    lots.append({"k": k, "r": [[[round(x, 5), round(y, 5)] for x, y in p.exterior.coords] for p in polys if p.area > 0]})

minx, miny, maxx, maxy = allp.bounds
px, py = (maxx - minx) * 0.10, (maxy - miny) * 0.12
frame = box(minx - px, miny - py, maxx + px * 1.6, maxy + py * 2.8)

def rings_of(geom, tol):
    geom = geom.intersection(frame).simplify(tol, preserve_topology=True)
    polys = [geom] if geom.geom_type == "Polygon" else list(getattr(geom, "geoms", []))
    return [[[round(x, 5), round(y, 5)] for x, y in p.exterior.coords] for p in polys if p.geom_type == "Polygon" and p.area > 0]

assert count == {"near": 66, "mid": 90, "far": 165, "other": 45}, count
res = {"rule": __doc__.strip().splitlines()[0], "frame": [round(v, 5) for v in frame.bounds], "counts": count,
       "lots": lots, "icw": rings_of(icw, 0.00002), "golf": rings_of(golf, 0.00002),
       "sources": ["Horry County GIS parcels (layer 24) and hydrography (layer 21), read 2026-11-14"]}
json.dump(res, open(os.path.join(D, "map-layers.json"), "w"), separators=(",", ":"))
print(count, res["frame"], os.path.getsize(os.path.join(D, "map-layers.json")))
