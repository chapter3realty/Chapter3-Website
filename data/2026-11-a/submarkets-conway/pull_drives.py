"""OSRM drive times (public router, free flow, no traffic) from the USGS GNIS point for Conway, the same start as affordable-facts row 50.
Destinations from OpenStreetMap Nominatim (2026-11-01). Writes raw/drives.json. Run: python3 -I pull_drives.py <datadir>"""
import json, sys, os, urllib.request
D = sys.argv[1]; T = (-79.047814, 33.836003)
DEST = {"airport_terminal": (-78.9227887, 33.6814671), "ccu": (-79.0126825, 33.7953227), "riverwalk_park": (-79.0439071, 33.8288646),
        "beach_mb40": (-78.880438, 33.690692), "coastal_grand": (-78.923261, 33.702315), "conway_medical": (-79.001894, 33.785483)}
out = {}
for k, (x, y) in DEST.items():
    u = "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false" % (T[0], T[1], x, y)
    r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())["routes"][0]
    out[k] = {"url": u, "duration_s": r["duration"], "distance_m": r["distance"], "minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 1)}
    print(k, out[k]["minutes"], out[k]["miles"])
json.dump(out, open(os.path.join(D, "raw", "drives.json"), "w"), indent=1)
