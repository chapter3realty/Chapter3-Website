#!/usr/bin/env python3
"""Label points for the hub's map of the nine town guides, north to south.
Reads the town label points in Blog-Brain tools/geo/grand-strand-v2.json (U.S. Census TIGER/Line 2026,
region scale 10000: lon = x/10000 - 80, lat = y/10000 + 33). Carolina Forest is not a town in that layer;
its point is the Census place's label point from the which-town data (areas.geojson), if present.
Run: python3 -I map_points.py <Blog-Brain root>
"""
import json, os, sys
bb = sys.argv[1] if len(sys.argv) > 1 else "/home/user/Blog-Brain"
geo = json.load(open(os.path.join(bb, "tools", "geo", "grand-strand-v2.json")))
want = ["Little River", "North Myrtle Beach", "Conway", "Carolina Forest", "Myrtle Beach", "Surfside Beach",
        "Garden City", "Murrells Inlet", "Pawleys Island"]
pts = {}
for t in geo["region"]["towns"]:
    if t["n"] in want:
        x, y = t["at"]; pts[t["n"]] = {"lon": round(x / 10000 - 80, 4), "lat": round(y / 10000 + 33, 4), "kind": t.get("kind"), "from": "grand-strand-v2.json towns"}
missing = [w for w in want if w not in pts]
here = os.path.dirname(os.path.abspath(__file__))
wt = os.path.join(here, "..", "..", "2026-11-a", "buyers-relocating-which-town", "areas.geojson")
if missing and os.path.exists(wt):
    g = json.load(open(wt))
    for f in g["features"]:
        nm = f["properties"].get("name")
        if nm in missing:
            cs = f["geometry"]["coordinates"]
            ring = cs[0][0] if f["geometry"]["type"] == "MultiPolygon" else cs[0]
            lon = sum(c[0] for c in ring) / len(ring); lat = sum(c[1] for c in ring) / len(ring)
            pts[nm] = {"lon": round(lon, 4), "lat": round(lat, 4), "kind": "census place (mean of outline vertices)", "from": "which-town areas.geojson"}
order = sorted(pts, key=lambda n: -pts[n]["lat"])
out = [{"n": i + 1, "name": n, **pts[n]} for i, n in enumerate(order)]
json.dump({"made_by": "map_points.py", "order": "north to south by label latitude", "points": out,
           "missing": [w for w in want if w not in pts]}, open(os.path.join(here, "map-points.json"), "w"), indent=1)
for p in out: print(p["n"], p["name"], p["lat"], p["lon"], p["kind"])
print("missing:", [w for w in want if w not in pts])
