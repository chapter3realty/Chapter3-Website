"""Reads the two VA facilities' coordinates from their va.gov pages (schema.org GeoCoordinates in raw/*.html) and measures drive times with the public OSRM router
(OpenStreetMap road data; free-flow estimate, no traffic, no stops). Origins are town centers (Census place
internal points, typed from TIGERweb; see ORIGINS). Run: python3 -I pull-drives.py <outdir>. Writes drives.json."""
import json, sys, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
def get(u):
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
def geocode(a):
    u = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?" + urllib.parse.urlencode({"address": a, "benchmark": "Public_AR_Current", "format": "json"})
    m = get(u)["result"]["addressMatches"][0]
    return {"matched": m["matchedAddress"], "lon": m["coordinates"]["x"], "lat": m["coordinates"]["y"]}
DEST = {"Myrtle Beach VA Clinic": "1800 Airpark Dr, Myrtle Beach, SC 29577",
        "Ralph H. Johnson VA Medical Center": "109 Bee St, Charleston, SC 29401"}
ORIGINS = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
res = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "dest": {}, "drives": []}
import re
PAGES = {"Myrtle Beach VA Clinic": "raw/va-clinic-mb.html", "Ralph H. Johnson VA Medical Center": "raw/va-charleston-vamc.html"}
for k, a in DEST.items():
    m = re.search(r'"geo":\{"@type":"GeoCoordinates","latitude":([0-9.-]+),"longitude":([0-9.-]+)', open(PAGES[k]).read())
    res["dest"][k] = {"address": a, "lat": float(m.group(1)), "lon": float(m.group(2)), "from": PAGES[k]}
def drive(o, d):
    u = f"https://router.project-osrm.org/route/v1/driving/{o['lon']},{o['lat']};{d['lon']},{d['lat']}?overview=false"
    r = get(u)["routes"][0]
    return round(r["duration"] / 60, 1), round(r["distance"] / 1609.344, 1)
clinic = res["dest"]["Myrtle Beach VA Clinic"]; vamc = res["dest"]["Ralph H. Johnson VA Medical Center"]
for name, o in ORIGINS.items():
    m, mi = drive(o, clinic); res["drives"].append({"from": name, "to": "Myrtle Beach VA Clinic", "minutes": m, "miles": mi})
    print(name, "-> clinic", m, mi)
m, mi = drive(clinic, vamc); res["drives"].append({"from": "Myrtle Beach VA Clinic", "to": "Ralph H. Johnson VA Medical Center", "minutes": m, "miles": mi}); print("clinic -> Charleston", m, mi)
json.dump(res, open(f"{out}/drives.json", "w"), indent=1)
