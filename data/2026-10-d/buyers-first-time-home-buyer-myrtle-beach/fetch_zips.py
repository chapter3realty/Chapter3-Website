"""ZIP code areas from Horry County GIS MapServer layer 20 (Zipcodes), WGS84, generalized about 5 m.
Usage: python3 -I fetch_zips.py <this dir>  -> raw/zips.json"""
import sys, json, os, urllib.request, urllib.parse, time
D = sys.argv[1]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/20/query"
p = {"where": "1=1", "outFields": "*", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00005", "geometryPrecision": "6", "f": "json"}
d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=urllib.parse.urlencode(p).encode()), timeout=300).read())
json.dump({"source": Q, "read": time.strftime("%Y-%m-%d"), "features": d["features"]}, open(os.path.join(D, "raw", "zips.json"), "w"))
print(len(d["features"]), [f["attributes"] for f in d["features"]][:40])
