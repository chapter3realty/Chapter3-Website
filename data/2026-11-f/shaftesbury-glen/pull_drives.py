"""Drive times from the middle of Shaftesbury Glen (detached houses; mean of parcel centre points, findings.json "center") and the Fairways townhomes ("center_fairways"), by the OSRM public router (driving profile, no traffic), plus the foot route to the beach.
Beach: the 10 public beach accesses in SC DES's Beach Access layer nearest in a straight line, each routed; the shortest is kept.
Places: Nominatim (OpenStreetMap) points; the airport terminal is OSM way 308490784 (as in data/2026-11-n/submarkets-market-common).
Run: python3 -I pull_drives.py <this dir>. Writes drives.json."""
import json, os, sys, math, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; F = json.load(open(os.path.join(D, "findings.json")))
def get(url):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "research-client"}), timeout=60))
        except Exception: time.sleep(3 + 3 * i)
    raise SystemExit("failed " + url)
def route(a, b, prof="driving"):
    host = "https://router.project-osrm.org/route/v1/driving/" if prof == "driving" else "https://routing.openstreetmap.de/routed-foot/route/v1/foot/"
    u = host + f"{a[1]},{a[0]};{b[1]},{b[0]}?overview=false"
    r = get(u)["routes"][0]; time.sleep(1)
    return {"minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 2), "url": u}
START = {"The Preserve at Shaftesbury Glen (middle of its 92 lots)": tuple(F["center_preserve"])}
PLACES = {"Myrtle Beach International Airport terminal": (33.681467, -78.922789),"Broadway at the Beach": (33.7162695, -78.8807609), "Coastal Grand Mall": (33.7027515, -78.9223169),"Downtown Conway (Main Street at 4th Avenue)": (33.8355, -79.0480), "Conway Medical Center": (33.8332, -79.0207), "Conway Hospital (Conway Medical Center)": (33.8332, -79.0207)}
acc = get("https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0/query?" + urllib.parse.urlencode(
    {"where": "1=1", "geometry": "-78.95,33.65,-78.75,33.80", "geometryType": "esriGeometryEnvelope", "inSR": "4326",
     "outFields": "NAME,Beach_Name,ADMIN,ACC_TYPE,PARKING,Parking_Sp", "returnGeometry": "true", "outSR": "4326", "f": "json"}))["features"]
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "rule": __doc__, "starts": START, "drives": {}}
for s, p in START.items():
    r = {k: route(p, v) for k, v in PLACES.items()}
    near = sorted(acc, key=lambda f: math.hypot(f["geometry"]["x"] - p[1], (f["geometry"]["y"] - p[0]) * 1.2))[:10]
    br = [dict(route(p, (f["geometry"]["y"], f["geometry"]["x"])), name=f["attributes"]["NAME"], parking=f["attributes"].get("PARKING")) for f in near]
    best = min(br, key=lambda x: x["minutes"])
    r["nearest public beach access"] = best
    r["beach accesses routed"] = [[b["name"], b["minutes"], b["miles"]] for b in br]
    r["walk to that access"] = route(p, [(f["geometry"]["y"], f["geometry"]["x"]) for f in near if f["attributes"]["NAME"] == best["name"]][0], "foot")
    out["drives"][s] = r; print(s, json.dumps({k: (v["minutes"], v["miles"]) if isinstance(v, dict) else v for k, v in r.items()}), flush=True)
json.dump(out, open(os.path.join(D, "drives.json"), "w"), indent=1)
