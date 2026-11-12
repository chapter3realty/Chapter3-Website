"""OSRM drive times (public router, free flow, no traffic) from three starting points in the Murrells Inlet mailing area:
 marshwalk  = the public Murrells Inlet Landing on US 17 Business at the MarshWalk (Georgetown County PubSafety layer 0)
 horry      = the median point of Horry-side homes (analyze.py, part horry/west), near SC 707 and Prince Creek
 wachesaw   = the median point of Georgetown homes west of the US 17 bypass (analyze.py, part georgetown/west), near Wachesaw Road
Destinations: OpenStreetMap Nominatim (2026-11-02) and Georgetown County road ends (Huntington Beach State Park entrance = US 17 at
Atalaya Road; Brookgreen Gardens = the west end of Brookgreen Drive). Writes raw/drives.json. Run: python3 -I pull_drives.py <datadir>"""
import json, sys, os, urllib.request, time
D = sys.argv[1]
START = {"marshwalk": (-79.03313, 33.55595), "horry": (-79.047416, 33.593099), "wachesaw": (-79.061139, 33.561164)}
DEST = {"marshwalk": (-79.03313, 33.55595), "huntington_beach_sp_entrance": (-79.07684, 33.50898), "brookgreen_gardens": (-79.086407, 33.514567),
        "garden_city_pier": (-78.997404, 33.576085), "surfside_pier": (-78.9717534, 33.6049921),
        "tidelands_waccamaw_hospital": (-79.0433811, 33.5605964), "grand_strand_medical": (-78.8194704, 33.7580795),
        "airport_terminal": (-78.9227887, 33.6814671), "market_common": (-78.9402132, 33.6706705), "coastal_grand": (-78.9223169, 33.7027515),
        "broadway_at_the_beach": (-78.8807609, 33.7162695), "pawleys_island_town_hall": (-79.1216513, 33.4331644),
        "charleston_city_hall": (-79.930806, 32.7767305), "publix_707": (-79.05474, 33.58581), "food_lion_bus17": (-79.03689, 33.56674),
        "wacca_wache_landing": (-79.08571, 33.56199), "morse_landing": (-79.05732, 33.52999)}
out = {"starts": START}
for s, (sx, sy) in START.items():
    out[s] = {}
    for k, (x, y) in DEST.items():
        if k == s: continue
        u = "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false" % (sx, sy, x, y)
        for i in range(4):
            try: r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())["routes"][0]; break
            except Exception as e: time.sleep(3)
        out[s][k] = {"url": u, "minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 1)}
        print(s, k, out[s][k]["minutes"], out[s][k]["miles"], flush=True)
        time.sleep(0.3)
json.dump(out, open(os.path.join(D, "raw", "drives.json"), "w"), indent=1)
