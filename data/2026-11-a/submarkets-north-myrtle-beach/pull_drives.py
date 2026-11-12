"""OSRM drive times (public router, free flow, no traffic) from Main Street at Ocean Drive, North Myrtle Beach (OpenStreetMap way point 33.8211378, -78.6735286, Nominatim).
Destinations from OpenStreetMap (Nominatim, 2026-11-03); McLeod Seacoast from the Little River ledger's point. Writes raw/drives.json.
Run: python3 -I pull_drives.py <datadir>"""
import json, sys, os, urllib.request, time
D = sys.argv[1]; T = (-78.6735286, 33.8211378)
DEST = {"cherry_grove_pier": (-78.6326763, 33.8287315), "heritage_shores": (-78.6118539, 33.8431038), "barefoot_landing": (-78.7424398, 33.7998752),
        "mcleod_seacoast": (-78.66371, 33.86573), "grand_strand_medical": (-78.8194704, 33.7580795), "skywheel_myrtle_beach": (-78.8773549, 33.6938507),
        "airport_terminal": (-78.9227887, 33.6814671), "coastal_grand": (-78.9223169, 33.7027515), "little_river_waterfront": (-78.61629, 33.87529)}
out = {}
for k, (x, y) in DEST.items():
    u = "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false" % (T[0], T[1], x, y)
    for i in range(6):
        try:
            r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())["routes"][0]; break
        except Exception as e:
            print("retry", k, e); time.sleep(5 + 5 * i)
    out[k] = {"url": u, "duration_s": r["duration"], "distance_m": r["distance"], "minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 1)}
    print(k, out[k]["minutes"], out[k]["miles"]); time.sleep(1)
json.dump(out, open(os.path.join(D, "raw", "drives.json"), "w"), indent=1)
