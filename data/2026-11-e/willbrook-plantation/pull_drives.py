"""Drive times from the middle of Willbrook Plantation (the mean of the core houses' centre points, findings.json "center_core") by the OSRM public router
(driving, no traffic), plus the foot route to the beach. Beach: the 10 public accesses in SC DES's Beach Access layer nearest in a straight line, each routed; the shortest is kept.
Places by OpenStreetMap Nominatim (Brookgreen Gardens, Murrells Inlet MarshWalk, Tidelands Waccamaw Community Hospital) and the airport terminal (as in the Plantation Point folder).
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
p = tuple(F["center_core"])
PLACES = {"Myrtle Beach International Airport terminal": (33.681467, -78.922789), "Brookgreen Gardens": (33.5211073, -79.0921611),
          "Murrells Inlet MarshWalk": (33.5578779, -79.0318225), "Tidelands Waccamaw Community Hospital": (33.5605964, -79.0433811),
          "Willbrook Plantation Golf Club clubhouse (Nominatim point)": (33.4951539, -79.1168333), "Willbrook Boulevard at US 17 (entrance)": (33.4855, -79.0968)}
acc = get("https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0/query?" + urllib.parse.urlencode(
    {"where": "1=1", "geometry": "-79.20,33.40,-79.05,33.52", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "outFields": "NAME,ADMIN,PARKING", "returnGeometry": "true", "outSR": "4326", "f": "json"}))["features"]
r = {k: route(p, v) for k, v in PLACES.items()}
near = sorted(acc, key=lambda f: math.hypot(f["geometry"]["x"] - p[1], (f["geometry"]["y"] - p[0]) * 1.2))[:10]
br = [dict(route(p, (f["geometry"]["y"], f["geometry"]["x"])), name=f["attributes"]["NAME"], admin=f["attributes"]["ADMIN"]) for f in near]
best = min(br, key=lambda x: x["minutes"]); r["nearest public beach access"] = best; r["beach accesses routed"] = [[b["name"], b["minutes"], b["miles"]] for b in br]
r["walk to that access"] = route(p, [(f["geometry"]["y"], f["geometry"]["x"]) for f in near if f["attributes"]["NAME"] == best["name"]][0], "foot")
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "rule": __doc__, "start": p, "drives": r}
print(json.dumps({k: (v["minutes"], v["miles"]) if isinstance(v, dict) else v for k, v in r.items()}, indent=0))
json.dump(out, open(os.path.join(D, "drives.json"), "w"), indent=1)
