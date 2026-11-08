"""Kings Highway road centrelines (N KINGS HWY, S KINGS HWY) from the Horry County street layer,
https://www.horrycounty.org/gisweb/rest/services/Public/Streets/MapServer/1 , and their straight-line distance to the ocean shoreline.
Run: python3 -I pull_kings.py <datadir> -> raw/kings-hwy.json, kings-hwy-distance.json"""
import json, sys, math, urllib.request, urllib.parse, statistics as st
from shapely.geometry import shape, Point, LineString
from shapely.ops import transform
D = sys.argv[1]
p = {"where": "FULLNAME IN ('N KINGS HWY','S KINGS HWY')", "outFields": "FULLNAME,DOTNAME,LeftCity,RightCity", "returnGeometry": "true", "outSR": "4326", "f": "json"}
d = json.load(urllib.request.urlopen(urllib.request.Request("https://www.horrycounty.org/gisweb/rest/services/Public/Streets/MapServer/1/query", data=urllib.parse.urlencode(p).encode()), timeout=120))
json.dump(d, open(D + "/raw/kings-hwy.json", "w"))
C = math.cos(math.radians(33.65)); P = lambda x, y, z=None: ((x + 79.0) * 69.17 * C, (y - 33.65) * 69.0)
coast = transform(P, shape(json.load(open(D + "/coast.geojson"))["features"][0]["geometry"]))
out = {}
for city in ["Myrtle Beach", "Surfside Beach"]:
    ds = []
    for f in d["features"]:
        a = f["attributes"]
        if a["LeftCity"] != city and a["RightCity"] != city: continue
        for path in f["geometry"]["paths"]:
            ln = transform(P, LineString(path))
            n = max(2, int(ln.length / 0.02))
            ds += [coast.distance(ln.interpolate(i / n, normalized=True)) for i in range(n + 1)]
    ds.sort()
    out[city] = {"samples_every_0.02_mi": len(ds), "median_miles": round(st.median(ds), 2), "p10": round(ds[len(ds) // 10], 2), "p90": round(ds[9 * len(ds) // 10], 2), "min": round(ds[0], 2), "max": round(ds[-1], 2)}
json.dump(out, open(D + "/kings-hwy-distance.json", "w"), indent=1); print(out)
