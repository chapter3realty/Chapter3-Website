"""Map layers for /submarkets/myrtle-beach/oak-forest/ (the writer, batch 2026-11-e).

Reads RAW/county.json (the researcher's county cache: 188 Oak Forest parcels, their address points, the 2023 building
outlines, the county flood layer) and Blog-Brain tools/geo/grand-strand-v2.json (Census TIGER roads). Writes map-layers.json:
each lot's outline with one kind, FEMA's high-risk zone (AE) and the shaded zone (0.2% annual chance) cut to the frame,
the US 17 Bypass line, and street label spots. No PIN, owner, address or value is written.
Kinds: touch = a house whose roof outline touches the high-risk zone (29, VERIFY row 19: 17 Temperance Dr, 12 Morlynn Dr, 0 Triumph Dr);
house = every other house; open = a parcel with no house (3). Roof outline = the largest county "Residential" (1800) building
outline whose inside point is on the lot.
Run: RAW=<scratch dir with county.json> GEO=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I map_layers.py <this dir>
"""
import json, os, sys, math, collections
from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union

D = sys.argv[1]; RAW = os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json"))); GEO = json.load(open(os.environ["GEO"]))
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
ae = unary_union([poly(f["geometry"]["rings"]) for f in C["geo"]["flood"] if f["attributes"]["FLD_ZONE"] == "AE"])
shaded = unary_union([poly(f["geometry"]["rings"]) for f in C["geo"]["flood"] if f["attributes"]["FLD_ZONE"].startswith("0.2")])
roofs = [(poly(f["geometry"]["rings"]), f) for f in C["geo"]["footprints"] if f["attributes"]["FTR_CODE"] == 1800]
lots, kinds, touch_by = [], collections.Counter(), collections.Counter()
for pin, a in C["parcels"].items():
    g = poly(a["rings"]); house = float(a["MarketImprv"] or 0) > 0 and a["LandUseCode"] == "101"
    kind = "open"
    if house:
        mine = [r for r, f in roofs if g.contains(r.representative_point())]
        assert mine, "house with no roof outline"
        big = max(mine, key=lambda r: r.area)
        kind = "touch" if big.intersects(ae) else "house"
        if kind == "touch": touch_by[(C["addresses"].get(pin) or [{"street": "?"}])[0]["street"]] += 1
    kinds[kind] += 1
    s = g.simplify(0.000012, preserve_topology=True)
    lots.append({"k": kind, "r": [[round(x, 5), round(y, 5)] for x, y in s.exterior.coords]})
assert kinds == {"house": 156, "touch": 29, "open": 3}, kinds
assert touch_by == {"TEMPERANCE DR": 17, "MORLYNN DR": 12}, touch_by
minx, miny, maxx, maxy = unary_union([Polygon(l["r"]) for l in lots]).bounds
px, py = (maxx - minx) * 0.18, (maxy - miny) * 0.04
frame = box(minx - px * 0.9, miny - py, maxx + px * 0.35, maxy + py)
def rings_of(geom, tol):
    geom = geom.intersection(frame).simplify(tol, preserve_topology=True)
    polys = [geom] if geom.geom_type == "Polygon" else list(getattr(geom, "geoms", []))
    return [[[round(x, 5), round(y, 5)] for x, y in p.exterior.coords] for p in polys if p.geom_type == "Polygon" and p.area > 1e-11]
def dec(p, s=10000):
    o, x, y = [], 0, 0
    for i in range(0, len(p), 2):
        x, y = (p[0], p[1]) if i == 0 else (x + p[i], y + p[i + 1]); o.append((x / s - 80, y / s + 33))
    return o
roads = []
for rd in GEO["region"]["roads"]:
    if rd.get("r") not in ("US 17 BYP", "SC 707"): continue
    ln = LineString(dec(rd["p"])).intersection(frame)
    for piece in ([ln] if ln.geom_type == "LineString" else list(getattr(ln, "geoms", []))):
        if piece.geom_type == "LineString" and not piece.is_empty:
            roads.append({"r": rd["r"], "p": [[round(x, 5), round(y, 5)] for x, y in piece.coords]})
# Street label spots: the middle of each street's address points.
bys = collections.defaultdict(list)
for v in C["addresses"].values():
    for a in v:
        if a["street"]: bys[a["street"]].append((a["x"], a["y"]))
streets = {k: [round(sum(p[0] for p in v) / len(v), 5), round(sum(p[1] for p in v) / len(v), 5)] for k, v in bys.items()}
# Label spots: two points on a straight stretch of each street (address points, sorted north to south; samples 3 and 4 of 8 on
# Temperance Dr, 2 and 4 on Triumph Dr, 2 and 4 on Morlynn Dr), and two points on the longest piece of the US 17 Bypass in the frame.
labels = {}
for k, (i, j) in {"TEMPERANCE DR": (3, 4), "TRIUMPH DR": (5, 7), "MORLYNN DR": (1, 2)}.items():
    v = sorted(bys[k], key=lambda p: -p[1]); st = max(1, len(v) // 8)
    labels[k] = [[round(v[i * st][0], 5), round(v[i * st][1], 5)], [round(v[j * st][0], 5), round(v[j * st][1], 5)]]
bp = max([r for r in roads if r["r"] == "US 17 BYP"], key=lambda r: LineString(r["p"]).length)["p"]
labels["US 17 BYP"] = [bp[len(bp) // 3], bp[2 * len(bp) // 3]]
res = {"rule": __doc__.strip().splitlines()[0], "frame": [round(v, 5) for v in frame.bounds], "counts": dict(kinds),
       "lots": lots, "ae": rings_of(ae, 0.00001), "shaded": rings_of(shaded, 0.00001), "roads": roads, "streets": streets, "labels": labels}
json.dump(res, open(os.path.join(D, "map-layers.json"), "w"))
print(res["counts"], len(res["ae"]), len(res["shaded"]), [r["r"] for r in roads], labels)
