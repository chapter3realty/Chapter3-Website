"""OSRM drive times (public router, free flow, no traffic) from the OpenStreetMap place point for Little River (relation 194179 label, 33.8727006, -78.6232583; the old village by US 17 and Mineola Avenue).
Destinations from OpenStreetMap (Nominatim and Overpass, 2026-11-02) and the county boat launch layer. Writes raw/drives.json.
Run: python3 -I pull_drives.py <datadir>"""
import json, sys, os, urllib.request, time
D = sys.argv[1]; T = (-78.6232583, 33.8727006)
DEST = {"cherry_grove_pier": (-78.6326763, 33.8287315), "nmb_main_street_ocean_drive": (-78.6735286, 33.8211378), "mcleod_seacoast": (-78.66371, 33.86573),
        "airport_terminal": (-78.9227887, 33.6814671), "barefoot_landing": (-78.7424398, 33.7998752), "coastal_grand": (-78.9223169, 33.7027515),
        "little_river_waterfront_mineola": (-78.61629, 33.87529), "calabash_nc": (-78.5683446, 33.8907278), "wilmington_nc": (-77.9487284, 34.2352853),
        "campbell_landing": (-78.65429, 33.85394), "coquina_harbour": (-78.6355948, 33.8633938)}
out = {}
for k, (x, y) in DEST.items():
    u = "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false" % (T[0], T[1], x, y)
    r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())["routes"][0]
    out[k] = {"url": u, "duration_s": r["duration"], "distance_m": r["distance"], "minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 1)}
    print(k, out[k]["minutes"], out[k]["miles"]); time.sleep(1)
json.dump(out, open(os.path.join(D, "raw", "drives.json"), "w"), indent=1)
