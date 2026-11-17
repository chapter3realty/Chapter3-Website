"""Drive times from the middle of the Riverwalk condos (findings.json "center") by the OSRM public router (driving, no traffic), plus the foot route to the beach.
Beach: the 10 public beach accesses in SC DES's Beach Access layer nearest in a straight line, each routed; the shortest is kept.
Places: the airport terminal and Broadway at the Beach and Coastal Grand as in data/2026-11-d/plantation-point/pull_drives.py; Publix (955 Wood Duck Dr) and Arrowhead Country Club (OSM relation 6544171, centre point) from Nominatim.
Run: python3 -I pull_drives.py <this dir>. Writes drives.json."""
import json, os, sys, math, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; F = json.load(open(os.path.join(D, "findings.json"))); C = tuple(F["center"])
def get(url):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "research-client"}), timeout=60))
        except Exception: time.sleep(3 + 3 * i)
    raise SystemExit("failed " + url)
def route(a, b, prof="driving"):
    host = "https://router.project-osrm.org/route/v1/driving/" if prof == "driving" else "https://routing.openstreetmap.de/routed-foot/route/v1/foot/"
    u = host + f"{a[1]},{a[0]};{b[1]},{b[0]}?overview=false"; r = get(u)["routes"][0]; time.sleep(1)
    return {"minutes": round(r["duration"] / 60, 1), "miles": round(r["distance"] / 1609.344, 2), "url": u}
PLACES = {"Myrtle Beach International Airport terminal": (33.681467, -78.922789), "Broadway at the Beach": (33.7162695, -78.8807609), "Coastal Grand Mall": (33.7027515, -78.9223169),
          "Publix, 955 Wood Duck Dr": (33.6637074, -78.9689224), "Arrowhead Country Club (centre of the OSM course outline)": (33.7052162, -78.9561351)}
acc = get("https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0/query?" + urllib.parse.urlencode(
    {"where": "1=1", "geometry": "-78.95,33.65,-78.75,33.80", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "outFields": "NAME,Beach_Name,ADMIN,ACC_TYPE,PARKING,Parking_Sp", "returnGeometry": "true", "outSR": "4326", "f": "json"}))["features"]
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "start": C, "drives": {k: route(C, v) for k, v in PLACES.items()}}
near = sorted(acc, key=lambda f: math.hypot(f["geometry"]["x"] - C[1], (f["geometry"]["y"] - C[0]) * 1.2))[:10]
br = [dict(route(C, (f["geometry"]["y"], f["geometry"]["x"])), name=f["attributes"]["NAME"], parking=f["attributes"].get("PARKING")) for f in near]
best = min(br, key=lambda x: x["minutes"]); out["drives"]["nearest public beach access"] = best; out["beach_accesses_routed"] = [[b["name"], b["minutes"], b["miles"]] for b in br]
out["walk_to_that_access"] = route(C, [(f["geometry"]["y"], f["geometry"]["x"]) for f in near if f["attributes"]["NAME"] == best["name"]][0], "foot")
json.dump(out, open(os.path.join(D, "drives.json"), "w"), indent=1)
print(json.dumps({k: (v["minutes"], v["miles"]) for k, v in out["drives"].items()}), out["beach_accesses_routed"][:3], out["walk_to_that_access"]["miles"])
