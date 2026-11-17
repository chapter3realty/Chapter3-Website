"""Map layers for /submarkets/north-myrtle-beach/briarcliffe-acres/ (batch 2026-11-e).
Reads RAW/county.json (pull_county.py) and RAW/lot-points.json (analyze.py). Writes map-layers.json: each Briarcliffe Acres lot's outline with a kind
(lake = within 15 m of a lake parcel, plain) and flags pool and house; the three lake parcels; the town boundary; the Atlantic coastline and US 17 from Blog-Brain tools/geo/grand-strand-v2.json
(Census TIGER). No PIN, owner, address or value. Outlines are rounded to 5 decimals (about 1 m) and simplified to 1.5 m.
Run: RAW=<scratch> GEO=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I map_layers.py <this dir>"""
import json, os, sys
from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union
D, RAW = sys.argv[1], os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json"))); LP = json.load(open(os.path.join(RAW, "lot-points.json"))); GEO = json.load(open(os.environ["GEO"]))
def poly(rings):
    shell, *holes = rings; return Polygon(shell, holes).buffer(0)
parcels = list(C["parcels"].values()); lots = [poly(a["rings"]) for a in parcels]
assert len(lots) == len(LP)
out, count, used = [], {"lake": 0, "plain": 0}, set()
for pt in LP:
    p = Point(pt["x"], pt["y"]); hit = [i for i, g in enumerate(lots) if i not in used and g.contains(p)]
    assert len(hit) == 1; used.add(hit[0]); a = parcels[hit[0]]
    if a["MarketSubArea"] != "BCA" or a["LandUseCode"] not in ("100", "101", "102"): continue
    kind = "lake" if pt["lake"] else "plain"; count[kind] += 1
    s = lots[hit[0]].simplify(0.000015, preserve_topology=True)
    out.append({"k": kind, "pool": bool(pt["pool"]), "house": bool(pt["house"]), "r": [[[round(x, 5), round(y, 5)] for x, y in s.exterior.coords]]})
lakes = [poly(a["rings"]) for a in parcels if a["LandUseCode"] == "600" and "LAKE" in (a["LegalDescr"] or "")]
town = poly([t for t in C["geo"]["towns"] if t["attributes"]["NAME"] == "BRIARCLIFFE"][0]["geometry"]["rings"])
minx, miny, maxx, maxy = town.bounds; px, py = (maxx - minx) * .08, (maxy - miny) * .12
frame = box(minx - px, miny - py, maxx + px * 3, maxy + py)
def rings_of(g, tol):
    g = g.intersection(frame).simplify(tol, preserve_topology=True); ps = [g] if g.geom_type == "Polygon" else list(getattr(g, "geoms", []))
    return [[[round(x, 5), round(y, 5)] for x, y in q.exterior.coords] for q in ps if q.geom_type == "Polygon" and q.area > 0]
def dec(flat, s=10000):
    pts, x, y = [], 0, 0
    for i in range(0, len(flat), 2):
        x, y = (flat[0], flat[1]) if i == 0 else (x + flat[i], y + flat[i + 1]); pts.append((x / s - 80, y / s + 33))
    return pts
def lines(ln, keep=None):
    ln = ln.intersection(frame.buffer(0.01)); r = []
    for pc in ([ln] if ln.geom_type == "LineString" else list(getattr(ln, "geoms", []))):
        if pc.geom_type == "LineString" and not pc.is_empty: r.append([[round(x, 5), round(y, 5)] for x, y in pc.coords])
    return r
roads = []
for rd in GEO["region"]["roads"]:
    if rd.get("r") in ("US 17",):
        for l in lines(LineString(dec(rd["p"]))): roads.append({"r": rd["r"], "p": l})
coast = lines(LineString(dec(GEO["region"]["coast"])))
res = {"rule": __doc__.strip().splitlines()[0] + " Kinds: lake (within 15 m of a lake parcel), plain.", "frame": [round(v, 5) for v in frame.bounds], "counts": count, "lots": out,
       "lakes": rings_of(unary_union(lakes), 0.00002), "town": rings_of(town, 0.00002), "roads": roads, "coast": coast,
       "sources": ["Horry County GIS parcels (layer 24) and municipalities (layer 31), read 2026-11-14", "U.S. Census Bureau TIGER/Line roads and coastline (Blog-Brain tools/geo/grand-strand-v2.json)"]}
json.dump(res, open(os.path.join(D, "map-layers.json"), "w"), separators=(",", ":")); print(count, res["frame"], len(roads), len(coast), os.path.getsize(os.path.join(D, "map-layers.json")))
