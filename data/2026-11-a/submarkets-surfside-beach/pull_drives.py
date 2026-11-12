#!/usr/bin/env python3
"""OSRM (public router on OpenStreetMap) free-flow drive times from the Surfside Beach Pier (OSM/Nominatim point for the pier shop
on South Ocean Boulevard, 33.60499 N, 78.97175 W). Destinations from Nominatim, read 2026-11-03. Writes raw/drives.json.
Run: python3 -I pull_drives.py <datadir>"""
import sys, os, json, urllib.request, time
D = sys.argv[1]
START = (-78.9717534, 33.6049921)
DEST = {"garden_city_pier": (-78.9974040, 33.5760849), "food_lion_bus17": (-78.9938401, 33.6019250), "market_common": (-78.9402132, 33.6706705),
        "airport_terminal": (-78.9227887, 33.6814671), "myrtle_beach_state_park": (-78.9311317, 33.6505854), "marshwalk": (-79.0318225, 33.5578779),
        "tidelands_waccamaw_hospital": (-79.0433811, 33.5605964), "coastal_grand": (-78.9229345, 33.7025683), "broadway_at_the_beach": (-78.8807609, 33.7162695),
        "grand_strand_medical": (-78.8194704, 33.7580795), "huntington_beach_sp": (-79.0622818, 33.5131892), "ocean_lakes_campground": (-78.9598229, 33.6248853)}
out = {"start": START, "router": "https://router.project-osrm.org/route/v1/driving/", "drives": {}}
for k, (x, y) in DEST.items():
    u = "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false" % (START[0], START[1], x, y)
    for i in range(5):
        try: r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))["routes"][0]; break
        except Exception as e: time.sleep(3)
    out["drives"][k] = {"minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 1), "url": u}
    print(k, out["drives"][k]["minutes"], out["drives"][k]["miles"], flush=True); time.sleep(1)
json.dump(out, open(os.path.join(D, "raw/drives.json"), "w"), indent=1)
