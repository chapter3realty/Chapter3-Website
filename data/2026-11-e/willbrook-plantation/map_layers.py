"""Map layers for /submarkets/pawleys-island/willbrook-plantation/ (the writer, batch 2026-11-e).

Reads RAW/county.json (Georgetown parcels, same cache as analyze.py), the golf parcel outline (county layer 2, TMS 04-0195B-032-00-00),
and a FEMA NFHL high-risk-zone file (RAW/fema.geojson: hazards.fema.gov MapServer 28, SFHA_TF = T, from the verifier's pull) and
writes map-layers.json: each lot's outline with one kind (golf, core, tradition, mingo), the golf parcel and the FEMA high-risk zone cut to the frame,
and the US 17 line from Blog-Brain tools/geo/grand-strand-v2.json if it reaches the frame. No TMS, owner, address or value is written.
Kinds: golf = a core house lot that shares a boundary with the golf parcel (within 0.5 m: 131 of 189, VERIFY row 5); core = other core lots;
tradition = Tradition Club at Willbrook; mingo = Mingo at Willbrook. Lots = parcels with a house, an empty lot or a condo unit under 3 acres.
Run: RAW=<scratch with county.json, buildings.json, fema.geojson> GEO=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I map_layers.py <this dir>
"""
import json, os, sys, math, re, urllib.request, urllib.parse
from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union
from shapely.strtree import STRtree

D = sys.argv[1]; RAW = os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json"))); BL = json.load(open(os.path.join(RAW, "buildings.json")))
FE = json.load(open(os.path.join(RAW, "fema.geojson")))
KX = 111320 * math.cos(math.radians(33.485)); KY = 111132; ACRE = 4046.86
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
def sec(l):
    l = (l or "").upper()
    for k, pat in (("MINGO", "MINGO"), ("OAK POINT", "OAK POINT|OAK POINTE"), ("AVIAN FOREST", "AVIAN"), ("GREENHAVEN", "GREENHAVEN|GREEN HAVEN"), ("TRADITION", "TRADITION"), ("ALLSTON POINT", "ALLSTON"), ("REUNION", "REUNION")):
        if re.search(pat, l): return k
    return "WILLBROOK"
bt = [poly(b["geometry"]["rings"]) for b in BL]; btree = STRtree(bt)
u = "https://gis1.georgetowncountysc.org/portal/rest/services/GCGIS_Export/FeatureServer/2/query?" + urllib.parse.urlencode({"where": "TMS='04-0195B-032-00-00'", "outFields": "TMS", "returnGeometry": "true", "outSR": 4326, "geometryPrecision": 6, "f": "json"})
golf = unary_union([poly(f["geometry"]["rings"]) for f in json.load(urllib.request.urlopen(u, timeout=90))["features"]])
fema = unary_union([Polygon(f["geometry"]["coordinates"][0]).buffer(0) if f["geometry"]["type"] == "Polygon" else unary_union([Polygon(p[0]).buffer(0) for p in f["geometry"]["coordinates"]]) for f in FE["features"]])
core_parts = ("WILLBROOK", "OAK POINT", "ALLSTON POINT")
out, count, houses_golf, lots_g = [], {"golf": 0, "core": 0, "tradition": 0, "mingo": 0}, 0, []
for f in C["parcels"]:
    a = f["attributes"]
    if a["StreetName"] == "UNKNOWN": continue
    code = a["LandUseCode"] or ""
    if code[:1] not in "QN" or not code or code == "N657": continue
    g = poly(f["geometry"]["rings"])
    if g.area * KX * KY / ACRE > 3: continue
    part = sec(a["LegalDescription"])
    if part not in core_parts + ("TRADITION", "MINGO"): continue
    house = code in ("Q100", "N100") and any(g.contains(bt[i].representative_point()) for i in btree.query(g))
    touch = part in core_parts and g.distance(golf) * KX < 0.5
    kind = "golf" if touch else "core" if part in core_parts else part.lower()
    count[kind] += 1
    if touch and house: houses_golf += 1
    s = g.simplify(0.000012, preserve_topology=True)
    out.append({"k": kind, "house": house, "r": [[round(x, 5), round(y, 5)] for x, y in s.exterior.coords]})
assert houses_golf == 131, houses_golf
minx, miny, maxx, maxy = unary_union([Polygon(l["r"]) for l in out]).bounds
px, py = (maxx - minx) * 0.06, (maxy - miny) * 0.10
frame = box(minx - px, miny - py, maxx + px, maxy + py)
def rings_of(geom, tol):
    geom = geom.intersection(frame).simplify(tol, preserve_topology=True)
    polys = [geom] if geom.geom_type == "Polygon" else list(getattr(geom, "geoms", []))
    return [[[round(x, 5), round(y, 5)] for x, y in p.exterior.coords] for p in polys if p.geom_type == "Polygon" and p.area > 1e-10]
def dec(p, s=10000):
    o, x, y = [], 0, 0
    for i in range(0, len(p), 2):
        x, y = (p[0], p[1]) if i == 0 else (x + p[i], y + p[i + 1]); o.append((x / s - 80, y / s + 33))
    return o
GEO = json.load(open(os.environ["GEO"])); roads = []
for rd in GEO["region"]["roads"]:
    if rd.get("r") != "US 17": continue
    ln = LineString(dec(rd["p"])).intersection(frame.buffer(0.01))
    for pc in ([ln] if ln.geom_type == "LineString" else list(getattr(ln, "geoms", []))):
        if pc.geom_type == "LineString" and not pc.is_empty: roads.append([[round(x, 5), round(y, 5)] for x, y in pc.coords])
res = {"rule": __doc__.strip().splitlines()[0], "frame": [round(v, 5) for v in frame.bounds], "counts": count, "house_lots_touching_golf": houses_golf, "lots": out,
       "golf": rings_of(golf, 0.00002), "fema": rings_of(fema, 0.00001), "roads": roads,
       "labels": {"Willbrook Plantation Golf Club": [-79.1168333, 33.4951539]},
       "sources": ["Georgetown County GIS parcels (Export layer 2) and golf parcel, read 2026-11-14", "FEMA National Flood Hazard Layer (hazards.fema.gov MapServer 28, SFHA_TF = T), read 2026-11-14", "U.S. Census Bureau TIGER/Line roads (Blog-Brain tools/geo/grand-strand-v2.json)"]}
json.dump(res, open(os.path.join(D, "map-layers.json"), "w"), separators=(",", ":"))
print(count, "frame", res["frame"], "roads", len(roads), "fema rings", len(res["fema"]), "bytes", os.path.getsize(os.path.join(D, "map-layers.json")))
