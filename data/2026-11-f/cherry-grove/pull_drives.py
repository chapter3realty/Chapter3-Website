"""Drive times from Cherry Grove Pier (OSM point -78.632676,33.828732, row 41 of the North Myrtle Beach ledger) to the same places as the North Myrtle Beach ledger row 34.
OSRM public router, free flow, no traffic. Run: python3 -I pull_drives.py <dir>. Writes drives.json."""
import json, sys, time, urllib.request
O = "-78.632676,33.828732"
P = {"main_street_ocean_drive": "-78.673529,33.821138", "mcleod_seacoast": "-78.663710,33.865730", "barefoot_landing": "-78.742440,33.799875",
     "grand_strand_medical": "-78.819470,33.758080", "skywheel_myrtle_beach": "-78.877355,33.693851", "airport_terminal": "-78.922789,33.681467", "coastal_grand_mall": "-78.9371,33.7382"}
out = {}
for k, d in P.items():
    u = "https://router.project-osrm.org/route/v1/driving/%s;%s?overview=false" % (O, d)
    r = json.load(urllib.request.urlopen(u, timeout=60))["routes"][0]; out[k] = {"url": u, "minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.34, 1)}; time.sleep(1.5)
json.dump(out, open(sys.argv[1] + "/drives.json", "w"), indent=1); print({k: (v["minutes"], v["miles"]) for k, v in out.items()})
