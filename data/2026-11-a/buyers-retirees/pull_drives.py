"""Drive from each 55+ community's reference point (the point its 2026-10-a ledger used) to each hospital with an emergency room.
Hospital points: U.S. Census geocoder on the CMS address. Route: public OSRM router (OpenStreetMap roads), fastest route, no traffic.
Run: python3 -I pull_drives.py <datadir>. Writes raw/geocodes.json and drives.json."""
import sys, json, os, time, subprocess, urllib.parse
D = sys.argv[1]
def get(url):
    for i in range(4):
        try: return json.loads(subprocess.run(["curl", "-sS", "-g", "-m", "60", "-A", "Mozilla/5.0", url], capture_output=True, text=True, check=True).stdout)
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(3)
    raise SystemExit("failed " + url)
ORIG = {"Del Webb at Grande Dunes": (-78.842661, 33.749305), "Del Webb North Myrtle Beach": (-78.700908, 33.821769),
        "Myrtle Trace": (-78.996618, 33.778502), "Seasons at Prince Creek West": (-79.07094, 33.586369)}
HOSP = {"Grand Strand Medical Center": "809 82nd Parkway, Myrtle Beach, SC 29572",
        "Conway Medical Center": "300 Singleton Ridge Road, Conway, SC 29526",
        "Tidelands Waccamaw Community Hospital": "4070 Highway 17, Murrells Inlet, SC 29576",
        "McLeod Health Seacoast": "4000 Highway 9 East, Little River, SC 29566",
        "McLeod Health Loris": "3655 Mitchell Street, Loris, SC 29569"}
geo = {}
for h, a in HOSP.items():
    url = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?" + urllib.parse.urlencode({"address": a, "benchmark": "Public_AR_Current", "format": "json"})
    m = get(url)["result"]["addressMatches"]
    geo[h] = {"address": a, "url": url, "match": m[0]["matchedAddress"] if m else None, "lon": m[0]["coordinates"]["x"] if m else None, "lat": m[0]["coordinates"]["y"] if m else None}
    print(h, geo[h]["match"], flush=True)
json.dump(geo, open(os.path.join(D, "raw", "geocodes.json"), "w"), indent=1)
out = []
for o, (ox, oy) in ORIG.items():
    for h, g in geo.items():
        if g["lon"] is None: continue
        url = f"https://router.project-osrm.org/route/v1/driving/{ox},{oy};{g['lon']},{g['lat']}?overview=false"
        r = get(url)["routes"][0]; time.sleep(1)
        out.append({"from": o, "to": h, "miles": round(r["distance"] / 1609.344, 1), "minutes": round(r["duration"] / 60, 1), "url": url})
        print(out[-1]["from"], "->", h, out[-1]["miles"], out[-1]["minutes"], flush=True)
json.dump({"method": "OSRM public router, fastest route, no traffic; minutes = duration/60", "drives": out}, open(os.path.join(D, "drives.json"), "w"), indent=1)
