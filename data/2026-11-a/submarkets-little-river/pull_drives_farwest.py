"""Review round 2: OSRM drive times (public router, free flow, no traffic) from the centre points (findings.json
subdivisions) of the far-west part's three largest subdivisions, by SC 31's start at SC 9. Destinations from
pull_drives.py, plus the old village place point. Writes raw/drives-farwest.json, keyed origin then destination.
Run: python3 -I pull_drives_farwest.py <datadir>"""
import json, sys, os, urllib.request, time
D = sys.argv[1]
ORIG = {"HIDDEN BROOKE": (-78.68518, 33.8681), "PALM LAKES PLANTATION": (-78.69557, 33.87016), "WATERFALL": (-78.69983, 33.86041)}
DEST = {"airport_terminal": (-78.9227887, 33.6814671), "barefoot_landing": (-78.7424398, 33.7998752), "coastal_grand": (-78.9223169, 33.7027515),
        "old_village_place_point": (-78.6232583, 33.8727006), "little_river_waterfront_mineola": (-78.61629, 33.87529),
        "mcleod_seacoast": (-78.66371, 33.86573), "cherry_grove_pier": (-78.6326763, 33.8287315)}
out = {}
for o, T in ORIG.items():
  out[o] = {}
  for k, (x, y) in DEST.items():
      u = "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false&steps=true" % (T[0], T[1], x, y)
      r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())["routes"][0]
      roads = []
      for s in r["legs"][0]["steps"]:
          n = (s.get("ref") or s.get("name") or "").strip()
          if n and (not roads or roads[-1] != n) and s["distance"] > 800: roads.append(n)
      out[o][k] = {"url": u, "duration_s": r["duration"], "distance_m": r["distance"], "minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 1), "main_roads": roads}
      print(o, k, out[o][k]["minutes"], out[o][k]["miles"], roads); time.sleep(1)
json.dump(out, open(os.path.join(D, "raw", "drives-farwest.json"), "w"), indent=1)
