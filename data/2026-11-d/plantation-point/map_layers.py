"""Map layers for /submarkets/myrtle-beach/plantation-point/ (the writer, batch 2026-11-d).

Reads the verifier's corrected county cache (RAW/county.json, 506 parcels: VERIFY.md section A) and its
lot points (RAW/lot-points.json, one inside point per parcel with the landing, waterway, golf and pool flags).
Writes map-layers.json: each lot's outline with one kind (landing, waterway, golf, plain), the Intracoastal
Waterway and the Myrtlewood course parcel cut to the frame, and the US 17 and US 17 Bypass lines from
Blog-Brain tools/geo/grand-strand-v2.json (Census TIGER). No PIN, owner, address or value is written.
Outlines are rounded to 5 decimals (about 1 m) and simplified to 1.5 m.

Run: RAW=<scratch dir with county.json and lot-points.json> GEO=<Blog-Brain>/tools/geo/grand-strand-v2.json \
     python3 -I map_layers.py <this dir>
"""
import json, os, sys
from shapely.geometry import Polygon, Point, LineString, box, mapping
from shapely.ops import unary_union

D = sys.argv[1]
RAW = os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json")))
LP = json.load(open(os.path.join(RAW, "lot-points.json")))
GEO = json.load(open(os.environ["GEO"]))

def poly(rings):
    shell, *holes = rings
    return Polygon(shell, holes).buffer(0)

lots = [(poly(a["rings"]) if isinstance(a["rings"], list) else None) for a in C["parcels"].values()]
assert all(l is not None for l in lots), "parcel rings missing"
assert len(lots) == len(LP) == 506, f"expected 506 parcels and points, got {len(lots)} and {len(LP)}"

out_lots = []
count = {"landing": 0, "waterway": 0, "golf": 0, "plain": 0}
used = set()
for pt in LP:
    p = Point(pt["x"], pt["y"])
    hit = [i for i, g in enumerate(lots) if i not in used and g.contains(p)]
    assert len(hit) == 1, f"point {pt['x']:.5f},{pt['y']:.5f} is in {len(hit)} parcels"
    used.add(hit[0])
    g = lots[hit[0]]
    kind = "landing" if pt["landing"] else "waterway" if pt["icw"] else "golf" if pt["golf"] else "plain"
    count[kind] += 1
    golf = bool(pt["golf"])
    s = g.simplify(0.000015, preserve_topology=True)
    out_lots.append({"k": kind, "golf": golf, "house": bool(pt["house"]),
                     "r": [[[round(x, 5), round(y, 5)] for x, y in s.exterior.coords]]})

LABELS = {"Food Lion, Plantation Point Plaza": [-78.869565, 33.724684], "Myrtlewood Golf Club clubhouse": [-78.8687547, 33.7362738]}
minx, miny, maxx, maxy = unary_union(lots + [Point(*p).buffer(0.0001) for p in LABELS.values()]).bounds
pad_x, pad_y = (maxx - minx) * 0.05, (maxy - miny) * 0.08
frame = box(minx - pad_x, miny - pad_y, maxx + pad_x * 2.5, maxy + pad_y)

def rings_of(geom, tol):
    geom = geom.intersection(frame).simplify(tol, preserve_topology=True)
    polys = [geom] if geom.geom_type == "Polygon" else list(getattr(geom, "geoms", []))
    return [[[round(x, 5), round(y, 5)] for x, y in p.exterior.coords] for p in polys if p.geom_type == "Polygon" and p.area > 0]

icw = poly(C["geo"]["hydro"][0]["geometry"]["rings"])
# The course parcel has four outer rings (four parts), so each ring is its own polygon here.
golf = unary_union([Polygon(r).buffer(0) for b in C["geo"]["big"] if "FOUNDERS NATIONAL GOLF" in (b["attributes"]["OwnerName"] or "") for r in b["geometry"]["rings"]])

def dec(p, s=10000):
    out, x, y = [], 0, 0
    for i in range(0, len(p), 2):
        x, y = (p[0], p[1]) if i == 0 else (x + p[i], y + p[i + 1])
        out.append((x / s - 80, y / s + 33))
    return out

roads = []
for rd in GEO["region"]["roads"]:
    if rd.get("r") not in ("US 17", "US 17 BYP"):
        continue
    ln = LineString(dec(rd["p"])).intersection(frame.buffer(0.01))
    for piece in ([ln] if ln.geom_type == "LineString" else list(getattr(ln, "geoms", []))):
        if piece.geom_type == "LineString" and not piece.is_empty:
            roads.append({"r": rd["r"], "p": [[round(x, 5), round(y, 5)] for x, y in piece.coords]})

assert count == {"landing": 139, "waterway": 58, "golf": 88, "plain": 221}, count
assert sum(1 for l in out_lots if l["golf"]) == 135, "golf lots (88 + 47)"
res = {
    "rule": __doc__.strip().splitlines()[0] + " Kinds: landing (The Landing at Plantation Point), waterway (within 25 m of the Intracoastal Waterway), golf (within 15 m of the Myrtlewood course parcel), plain. golf is also flagged on Landing lots.",
    "frame": [round(v, 5) for v in frame.bounds],
    "counts": count,
    "lots": out_lots,
    "icw": rings_of(icw, 0.00002),
    "golf": rings_of(golf, 0.00002),
    "roads": roads,
    "labels": LABELS,
    "sources": ["Horry County GIS parcels (layer 24), hydrography (layer 21), read 2026-11-13 (verifier's corrected cache)",
                "U.S. Census Bureau TIGER/Line roads (Blog-Brain tools/geo/grand-strand-v2.json)"],
}
json.dump(res, open(os.path.join(D, "map-layers.json"), "w"), separators=(",", ":"))
print(count, "frame", res["frame"], "roads", len(roads), "bytes", os.path.getsize(os.path.join(D, "map-layers.json")))
