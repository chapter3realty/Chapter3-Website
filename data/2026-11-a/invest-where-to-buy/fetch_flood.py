"""Horry County GIS layer 19 (FEMA flood zones): every special flood hazard area polygon (SFHA_TF = 'T': zones A, AE, AO, VE),
county-wide, in WGS84, lightly generalised (maxAllowableOffset 0.00001 degrees, about 1 m).
Run: RAW=<scratch> python3 -I fetch_flood.py. Writes RAW/horry-sfha.json (kept out of the repo for size)."""
import json, os, sys, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/19/query"
def q(params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
ids = sorted(q({"where": "SFHA_TF='T'", "returnIdsOnly": "true"})["objectIds"]); feats = []
for i in range(0, len(ids), 50):
    d = q({"objectIds": ",".join(map(str, ids[i:i+50])), "outFields": "FLD_ZONE,SFHA_TF,STATIC_BFE", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00001"})
    feats += [{"a": f["attributes"], "rings": f["geometry"]["rings"]} for f in d["features"] if f.get("geometry")]
    print(i, len(feats), flush=True)
json.dump({"source": Q, "where": "SFHA_TF='T'", "pulled": time.strftime("%Y-%m-%d"), "features": feats}, open(os.path.join(RAW, "horry-sfha.json"), "w"))
print("done", len(feats))
