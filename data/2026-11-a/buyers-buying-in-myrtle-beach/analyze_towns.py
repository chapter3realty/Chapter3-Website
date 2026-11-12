"""Months of supply by town for /buyers/buying-in-myrtle-beach/ (batch 2026-11-a). Aggregate counts only.
Sales: the same 13,194 deed sales as analyze.py (SALES), each already placed in a Census place by
data/2026-10-d/sell-out-of-state-buyers/fetch_points.py (field 'place'); kind by the analyze.py rule (LU = RAW/landuse.json).
Listings: RAW/listings-sets.json (pull_listings.py), placed in the same Census places with PLACES
(data/2026-11-a/invest-where-to-buy/raw/places.json, TIGERweb current vintage), and kept inside the Horry outline (HORRY).
Months of supply = for sale now / (sold in 12 months / 12). Towns with 100+ sales of the kind are reported.
Usage: RAW=<scratch> SALES=<path> HORRY=<path> PLACES=<path> python3 -I analyze_towns.py <this dir> -> towns.json"""
import json, os, sys, statistics as st
from collections import defaultdict
from shapely.geometry import shape, Point, Polygon, MultiPolygon
from shapely.prepared import prep
D = sys.argv[1]; RAW = os.environ["RAW"]
S = json.load(open(os.environ["SALES"]))["sales"]
LU = json.load(open(os.path.join(RAW, "landuse.json")))
L = json.load(open(os.path.join(RAW, "listings-sets.json")))
def rings_poly(rings):
    # ArcGIS rings: outer rings clockwise; build polygons by containment
    ps = [Polygon(r) for r in rings if len(r) >= 4]
    ps.sort(key=lambda p: -p.area); outs = []
    for p in ps:
        for o in outs:
            if o[0].contains(p.representative_point()): o[1].append(p); break
        else: outs.append([p, []])
    polys = []
    for o, holes in outs:
        g = o
        for h in holes: g = g.difference(h)
        polys.append(g)
    from shapely.ops import unary_union
    return unary_union(polys)
hc = json.load(open(os.environ["HORRY"]))["features"][0]["geometry"]
horry = prep(rings_poly(hc["rings"]))
PL = [(p["name"], prep(rings_poly(p["rings"]))) for p in json.load(open(os.environ["PLACES"]))["places"]]
def place_of(lng, lat):
    pt = Point(lng, lat)
    for n, g in PL:
        if g.contains(pt): return n
    return "outside any Census place"
def is_condo(x): return bool(x["condo"]) or LU.get(str(int(x["pin"])).zfill(11)) == "107"
sold = defaultdict(lambda: {"house": 0, "condo": 0, "house_resale": 0, "condo_resale": 0})
for x in S:
    k = "condo" if is_condo(x) else "house"; sold[x["place"]][k] += 1
    if not x["builder"]: sold[x["place"]][k + "_resale"] += 1
GROUP = {"house": ["house", "townhouse", "manufactured"], "condo": ["condo"]}
fs = defaultdict(lambda: {"house": 0, "condo": 0, "house_new": 0, "condo_new": 0, "house_cut": 0, "condo_cut": 0})
newc = {m for t in L["sets"]["new_construction"].values() for m in t}
cut = {m for t in L["sets"]["price_reduced"].values() for m in t}
for k, types in GROUP.items():
    for t in types:
        for mls, (price, lat, lng) in L["sets"]["all"].get(t, {}).items():
            if lat is None or lng is None or not horry.contains(Point(lng, lat)): continue
            p = place_of(lng, lat); fs[p][k] += 1
            if mls in newc: fs[p][k + "_new"] += 1
            if mls in cut: fs[p][k + "_cut"] += 1
out = {"meta": {"rule": __doc__.split("\n")[1:7], "listings_pulled": L["pulled"]}, "towns": []}
for p in sorted(set(sold) | set(fs), key=lambda p: -(sold[p]["house"] + sold[p]["condo"])):
    r = {"place": p}
    for k in ("house", "condo"):
        n = sold[p][k]; f = fs[p][k]
        r[k] = {"sold_12mo": n, "resold_12mo": sold[p][k + "_resale"], "for_sale": f, "for_sale_new": fs[p][k + "_new"],
                "price_cut": fs[p][k + "_cut"], "months_supply": round(f / (n / 12), 1) if n >= 100 else None,
                "months_supply_resale": round((f - fs[p][k + "_new"]) / (sold[p][k + "_resale"] / 12), 1) if sold[p][k + "_resale"] >= 100 else None}
    out["towns"].append(r)
json.dump(out, open(os.path.join(D, "towns.json"), "w"), indent=1)
for r in out["towns"][:16]:
    print(r["place"], "| H", r["house"], "| C", r["condo"])
