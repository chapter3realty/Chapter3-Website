"""Straight-line distance from Holiday Sands South's footprint center (flood.json footprint_center) to named places, from OpenStreetMap Nominatim
(https://nominatim.openstreetmap.org/search, one call per name, read 2026-11-14). Miles by the haversine formula, to one decimal.
Run: python3 -I pull_nearby.py <this dir>. Writes nearby.json."""
import json, sys, math, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]
c = json.load(open(D + "/flood.json"))["footprint_center"]
def hav(a, b, c2, d):
    R = 3958.8; p = math.radians
    x = math.sin(p(c2 - a) / 2) ** 2 + math.cos(p(a)) * math.cos(p(c2)) * math.sin(p(d - b) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "from": c, "places": {}}
for name in ["Myrtle Beach Boardwalk", "Broadway at the Beach", "Myrtle Beach State Park", "Springmaid Pier", "Myrtle Beach International Airport", "Family Kingdom Amusement Park"]:
    u = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({"q": name, "format": "json", "limit": 1})
    for i in range(6):
        try: j = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "chapter3-research"}), timeout=30)); break
        except Exception: time.sleep(20 * (i + 1))
    time.sleep(3)
    if j:
        la, lo = float(j[0]["lat"]), float(j[0]["lon"])
        out["places"][name] = {"lat": la, "lon": lo, "osm": j[0]["osm_type"] + "/" + str(j[0]["osm_id"]), "display": j[0]["display_name"][:90], "miles": round(hav(c[0], c[1], la, lo), 1), "url": u}
json.dump(out, open(D + "/nearby.json", "w"), indent=1); print(json.dumps({k: v["miles"] for k, v in out["places"].items()}))
