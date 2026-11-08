"""Public beach access points from the SC Department of Environmental Services (SCDES) Beach Access map,
https://gis.des.sc.gov/beachaccess/ (service BeachAccess/MapServer layer 0 ACCESS_PTS, and layer 1 BEACH).
Run: python3 -I pull_access.py <datadir> -> raw/scdes-access-points.json, raw/scdes-beach-lines.json"""
import json, sys, urllib.request, urllib.parse
D = sys.argv[1]; U = "https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/"
def q(layer, **p):
    p = dict({"where": "1=1", "outFields": "*", "outSR": "4326", "f": "json"}, **p)
    return json.load(urllib.request.urlopen(urllib.request.Request(U + str(layer) + "/query?" + urllib.parse.urlencode(p), headers={"User-Agent": "Mozilla/5.0"}), timeout=120))
a = q(0, where="UPPER(County) IN ('HORRY','GEORGETOWN')")
json.dump(a, open(D + "/raw/scdes-access-points.json", "w"))
print("access points", len(a.get("features", [])), a.get("exceededTransferLimit"))
b = q(1)
json.dump(b, open(D + "/raw/scdes-beach-lines.json", "w"))
print("beach features", len(b.get("features", [])), b.get("error"))
