"""Homes in the city of Conway, counted on a grid of about 180 m cells, by part of town (fix round 1, 2026-11-02).
For the page's two city maps: where the homes are, without one dot per house.
Reads RAW/parcels.json and RAW/city.json (fetch_county.py; kept out of the repo, they carry parcel numbers).
Home = the ledger's rule: land-use code starting with 1 and a building value above 0, inside the county's city limits.
Location = the parcel polygon's center (analyze.py uses the address point when there is one; the map does not need it).
Part of town = analyze.py area(). Writes map-homes-grid.json: cells [lon, lat, homes, part], no parcel or address data.
Run: RAW=<scratch> python3 -I home_grid.py"""
import json, math, os, collections
import shapely
from shapely.geometry import Polygon
RAW = os.environ["RAW"]
rings = json.load(open(os.path.join(RAW, "city.json")))[0]["geometry"]["rings"]
city = Polygon(rings[0])
for r in rings[1:]: city = city.symmetric_difference(Polygon(r))
shapely.prepare(city)
TOWN = (-79.047814, 33.836003)
def miles(x, y): return math.hypot((x - TOWN[0]) * 57.37, (y - TOWN[1]) * 69.05)
def area(x, y):
    if miles(x, y) <= 1.0: return "downtown"
    if x > -79.03 and y < 33.83: return "us501"
    if y >= 33.877: return "north"
    if y >= 33.852: return "crabtree"
    return "west"
DX, DY = 0.002, 0.0016
cells = collections.defaultdict(collections.Counter); n = 0
for p in json.load(open(os.path.join(RAW, "parcels.json"))):
    if not str(p.get("LandUseCode") or "").startswith("1") or not (p.get("MarketImprv") or 0) > 0 or not p.get("c"): continue
    r = p["c"]["rings"][0]; x = sum(a for a, b in r) / len(r); y = sum(b for a, b in r) / len(r)
    if not city.contains(shapely.Point(x, y)): continue
    n += 1; cells[(math.floor(x / DX), math.floor(y / DY))][area(x, y)] += 1
out = [[round((i + .5) * DX, 5), round((j + .5) * DY, 5), sum(c.values()), c.most_common(1)[0][0]] for (i, j), c in sorted(cells.items())]
json.dump({"made": "home_grid.py", "homes": n, "cell_deg": [DX, DY], "cells": out}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "map-homes-grid.json"), "w"))
print("homes", n, "cells", len(out), collections.Counter(c[3] for c in out))
