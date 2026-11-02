"""OSRM drive times (public router, free flow, no traffic) from the foot of the Garden City Pier (Atlantic Avenue at Waccamaw Drive,
OpenStreetMap). Destinations from OpenStreetMap Nominatim (2026-11-02). Writes raw/drives.json. Run: python3 -I pull_drives.py <datadir>"""
import json, sys, os, urllib.request
D = sys.argv[1]; T = (-78.99795, 33.57690)
DEST = {"airport_terminal": (-78.9227887, 33.6814671), "marshwalk": (-79.0318225, 33.5578779), "market_common": (-78.9402132, 33.6706705),
        "tidelands_waccamaw_hospital": (-79.0433811, 33.5605964), "grand_strand_medical": (-78.8194704, 33.7580795),
        "huntington_beach_sp": (-79.0622818, 33.5131892), "surfside_pier": (-78.9717534, 33.6049921), "coastal_grand": (-78.9223169, 33.7027515),
        "broadway_at_the_beach": (-78.8807609, 33.7162695)}
out = {"start": T}
for k, (x, y) in DEST.items():
    u = "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false" % (T[0], T[1], x, y)
    r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())["routes"][0]
    out[k] = {"url": u, "duration_s": r["duration"], "distance_m": r["distance"], "minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 1)}
    print(k, out[k]["minutes"], out[k]["miles"])
json.dump(out, open(os.path.join(D, "raw", "drives.json"), "w"), indent=1)
