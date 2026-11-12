#!/usr/bin/env python3
"""Named places from OpenStreetMap (raw/overpass-query.txt, pulled 2026-11-02 through overpass.kumi.systems or a mirror into RAW/osm-places.json)
and Georgetown County boat landings (GCGIS_PubSafety 0): which county side and which part each is in, and whether it lies in ZIP 29576.
Run: RAW=<scratch> python3 -I places.py <datadir>. Writes places.json."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import Point
from shapely.ops import nearest_points
D = sys.argv[1]
def where(x, y):
    pt = Point(x, y)
    c = "georgetown" if GEO.contains(pt) else ("horry" if HOR.contains(pt) else "other")
    if c == "horry": p = "garden_city" if GC.contains(pt) else ("east" if east_of(BYP17, pt) else "west")
    elif c == "georgetown": p = "gc_strip" if (east_of(BUS17, pt) and m(pt, nearest_points(BUS17, pt)[0]) > 700) else ("inlet" if east_of(BUS17, pt) else ("old_road" if east_of(BYP17, pt) else "west"))
    else: p = None
    return {"county": c, "part": p, "zip29576": Z29576.contains(pt), "in_mi_cdp": MI.contains(pt)}
out = []
for e in J("osm-places.json")["elements"]:
    t = e.get("tags", {}); c = e.get("center", e)
    kind = t.get("leisure") or t.get("shop") or t.get("amenity") or t.get("man_made") or t.get("tourism")
    if kind == "attraction" or not t.get("name") and kind not in ("slipway",): continue
    out.append(dict({"name": t.get("name"), "kind": kind, "osm": f"{e['type']}/{e['id']}", "lat": round(c["lat"], 5), "lon": round(c["lon"], 5)}, **where(c["lon"], c["lat"])))
for f in J("g-landings.geojson")["features"]:
    if not f["geometry"]: continue
    x, y = f["geometry"]["coordinates"]
    if y < 33.45: continue
    out.append(dict({"name": f["properties"]["name"].title(), "kind": "county boat landing", "address": f["properties"]["address"], "lat": round(y, 5), "lon": round(x, 5)}, **where(x, y)))
json.dump({"made": "places.py", "places": out}, open(os.path.join(D, "places.json"), "w"), indent=1)
for r in out:
    if r["kind"] in ("golf_course", "marina", "county boat landing", "hospital", "pier", "park") or (r["kind"] == "supermarket" and r["zip29576"]): print(r)
