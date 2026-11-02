"""Does the listing say "flood zone" when the house is in FEMA's high-risk zone? Homes for sale now, tested point by point
against Horry County GIS layer 19 polygons with SFHA_TF = 'T' (FEMA high-risk zones A, AE, VE ...), compared with the MLS
"flood zone" feature on the same listings. Points outside Horry County's flood layer coverage (Georgetown County) are not
tested: the layer covers Horry County only. Writes flood-tag-findings.json (counts only).
Run: PRIVATE=<dir> python3 -I analyze_flood_tag.py <datadir>"""
import json, os, sys
from shapely.geometry import Point, Polygon, MultiPolygon
from shapely.strtree import STRtree
from shapely.ops import unary_union
D = sys.argv[1]; P = os.environ["PRIVATE"]
polys = []
for f in json.load(open(os.path.join(P, "flood-sfha.json"))):
    rings = f["geometry"]["rings"]
    # ArcGIS rings: outer rings clockwise, holes counter-clockwise. Build by orientation.
    outer, holes = [], []
    for r in rings:
        a = sum((r[i][0] - r[i - 1][0]) * (r[i][1] + r[i - 1][1]) for i in range(len(r)))
        (outer if a > 0 else holes).append(r)
    for o in outer:
        po = Polygon(o)
        hs = [h for h in holes if po.contains(Point(h[0]))]
        polys.append(Polygon(o, hs).buffer(0))
tree = STRtree(polys)
L = json.load(open(os.path.join(P, "listing-points.json")))
# Horry County outline (Horry GIS layer 33, saved by the sibling page as raw/county.json) to keep only Horry points
cj = json.load(open(os.path.join(D, "..", "..", "2026-10-d", "buyers-undisclosed-flooding", "raw", "county.json")))
def to_geom(x):
    if isinstance(x, list): x = x[0]
    if "features" in x: x = x["features"][0]
    g = x.get("geometry", x)
    if "rings" in g: return unary_union([Polygon(r) for r in g["rings"]])
    from shapely.geometry import shape; return shape(g)
county = to_geom(cj).buffer(0)
def inside(lat, lng):
    pt = Point(lng, lat)
    return any(polys[i].contains(pt) for i in tree.query(pt))
out = {"pulled_listings": L["pulled"], "truncated_bands": len(L["truncated"]), "by_type": {}}
for t in ("house", "condo"):
    tagged = set(L["sets"][t + "|flood_zone"])
    c = {"listings": 0, "in_horry": 0, "in_sfha": 0, "in_sfha_tagged": 0, "in_sfha_not_tagged": 0, "outside_sfha_tagged": 0, "tagged_total": len(tagged)}
    for mls, p in L["sets"][t].items():
        if p["lat"] is None: continue
        c["listings"] += 1
        if not county.contains(Point(p["lng"], p["lat"])): continue
        c["in_horry"] += 1
        s = inside(p["lat"], p["lng"]); g = mls in tagged
        if s: c["in_sfha"] += 1; c["in_sfha_tagged" if g else "in_sfha_not_tagged"] += 1
        elif g: c["outside_sfha_tagged"] += 1
    c["share_in_sfha_not_tagged"] = round(c["in_sfha_not_tagged"] / c["in_sfha"], 3) if c["in_sfha"] else None
    out["by_type"][t] = c
json.dump(out, open(os.path.join(D, "flood-tag-findings.json"), "w"), indent=1); print(json.dumps(out, indent=1))
