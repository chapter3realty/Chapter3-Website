"""OSRM drive times (public router, free flow, no traffic) from Pawleys Island Town Hall, 323 Myrtle Avenue (Georgetown County
E911 address point). Destinations from OpenStreetMap Nominatim (read 2026-11-02). Writes raw/drives.json.
Run: python3 -I pull_drives.py <datadir>"""
import json, sys, os, urllib.request
D = sys.argv[1]; T = (-79.12152664, 33.43324962)
DEST = {"airport_terminal": (-78.9227887, 33.6814671), "tidelands_waccamaw_hospital": (-79.0433811, 33.5605964),
        "brookgreen_gardens": (-79.0921611, 33.5211073), "huntington_beach_sp": (-79.0622818, 33.5131892),
        "georgetown_front_street": (-79.2835461, 33.3665406), "charleston_marion_square": (-79.9356727, 32.7868337),
        "broadway_at_the_beach": (-78.8807609, 33.7162695)}
out = {"start": T}
for k, (x, y) in DEST.items():
    u = "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false" % (T[0], T[1], x, y)
    r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())["routes"][0]
    out[k] = {"url": u, "duration_s": r["duration"], "distance_m": r["distance"], "minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 1)}
    print(k, out[k]["minutes"], out[k]["miles"])
json.dump(out, open(os.path.join(D, "raw", "drives.json"), "w"), indent=1)
