"""Map layers for /submarkets/carolina-forest/river-oaks/ (the writer, batch 2026-11-e).
Reads RAW/county.json (pull_county.py) and raw/course-owner-parcels.json (the five FAIRWAYS parcels, outline only).
Writes map-layers.json: each county building outline with the part it belongs to, The Landing's lots (no buildings yet), the Intracoastal Waterway and the five course parcels cut to the frame.
No PIN, owner, address or value is written. Outlines are rounded to 5 decimals (about 1 m) and simplified to 1.5 m.
Run: RAW=<scratch dir with county.json> python3 -I map_layers.py <this dir>"""
import json, os, re, sys
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
D = sys.argv[1]; C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
def poly(rings):
    shell, *holes = rings
    return Polygon(shell, holes).buffer(0)
def grp(s):
    if "WATERWAY VLG" in s: return "waterway"
    if "LANDING" in s: return "landing"
    if "FAIRWAY" in s: return "fairways"
    if "COTTAGES" in s or "OAKMONT" in s or "PAR 4" in s or "PARCEL 4" in s: return "houses"
    if re.search(r"G ?& ?T|GOLF&TENNIS|GARDEN HOMES", s): return "resort"
    return None
lots, count, shapes = [], {}, []
for a in C["parcels"].values():
    if (a["LandUseCode"] or "") in ("113", "500", "300", "353", "705", "720", "320"): continue
    g = grp(a["LegalDescr"].split(";")[0])
    if not g: continue
    count[g] = count.get(g, 0) + 1
    s = poly(a["rings"]).simplify(0.000015, preserve_topology=True)
    if s.geom_type != "Polygon": s = max(s.geoms, key=lambda q: q.area)
    shapes.append((g, poly(a["rings"])))
    lots.append({"k": g, "r": [[[round(x, 5), round(y, 5)] for x, y in s.exterior.coords]]})
# Buildings: each county building outline goes to the part whose lots it overlaps most (counts only, no PIN).
from shapely.strtree import STRtree
tree = STRtree([g for _, g in shapes])
blds = []
for f in C["geo"]["footprints"]:
    for ring in f["geometry"]["rings"][:1]:
        b = Polygon(ring).buffer(0)
        if b.is_empty: continue
        best, area = None, 0
        for i in tree.query(b):
            a2 = b.intersection(shapes[i][1]).area
            if a2 > area: best, area = shapes[i][0], a2
        if best and area > 0.3 * b.area:
            bs = b.simplify(0.000008, preserve_topology=True)
            if bs.geom_type != "Polygon": continue
            blds.append({"k": best, "r": [[round(x, 5), round(y, 5)] for x, y in bs.exterior.coords]})
bcount = {}
for b in blds: bcount[b["k"]] = bcount.get(b["k"], 0) + 1
allg = unary_union([Polygon(l["r"][0]).buffer(0) for l in lots])
minx, miny, maxx, maxy = allg.bounds
px, py = (maxx - minx) * 0.06, (maxy - miny) * 0.10
frame = box(minx - px, miny - py, maxx + px, maxy + py)
def rings_of(geom, tol):
    geom = geom.intersection(frame).simplify(tol, preserve_topology=True)
    ps = [geom] if geom.geom_type == "Polygon" else list(getattr(geom, "geoms", []))
    return [[[round(x, 5), round(y, 5)] for x, y in p.exterior.coords] for p in ps if p.geom_type == "Polygon" and p.area > 0]
icw = poly(C["geo"]["hydro"][0]["geometry"]["rings"])
course = unary_union([poly(p["rings"][0:1]) for p in json.load(open(os.path.join(D, "raw", "course-owner-parcels.json")))["parcels"]])
res = {"rule": __doc__.strip().splitlines()[0], "frame": [round(v, 5) for v in frame.bounds], "counts": count, "buildings": blds, "building_counts": bcount, "lots": [l for l in lots if l["k"] == "landing"],
       "icw": rings_of(icw, 0.00002), "course": rings_of(course, 0.00002),
       "sources": ["Horry County GIS parcels (layer 24) and hydrography (layer 21), read 2026-11-14"]}
json.dump(res, open(os.path.join(D, "map-layers.json"), "w"), separators=(",", ":"))
print(bcount, count, "frame", res["frame"], "bytes", os.path.getsize(os.path.join(D, "map-layers.json")))
