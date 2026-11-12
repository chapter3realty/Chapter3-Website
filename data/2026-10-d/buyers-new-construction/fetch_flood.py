"""(Copied from the first-time-buyer batch folder, unchanged.) Fetch the high-risk flood zones (SFHA_TF = 'T': zones A, AE, VE) from Horry County GIS
MapServer layer 19 (Flood Zones, FEMA flood map fields), in WGS84, lightly generalized (about 2 m).
Output: raw/flood-sfha.json (not kept in the repo if large; rerun to rebuild).
Usage: python3 -I fetch_flood.py <this dir>"""
import sys, json, os, time, urllib.request, urllib.parse
D = sys.argv[1]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/19/query"
def post(p):
    for k in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=urllib.parse.urlencode(p).encode()), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
ids = post({"where": "SFHA_TF='T'", "returnIdsOnly": "true", "f": "json"})["objectIds"]
ids.sort(); feats = []
for i in range(0, len(ids), 25):
    d = post({"objectIds": ",".join(map(str, ids[i:i+25])), "outFields": "OBJECTID,FLD_ZONE,SFHA_TF,SOURCE_CIT", "outSR": "4326",
              "maxAllowableOffset": "0.00002", "geometryPrecision": "6", "returnGeometry": "true", "f": "json"})
    feats += d["features"]; print(i, len(feats), flush=True)
json.dump({"source": Q, "where": "SFHA_TF='T'", "read": time.strftime("%Y-%m-%d"), "features": feats}, open(os.path.join(D, "raw", "flood-sfha.json"), "w"))
