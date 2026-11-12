"""Centre points for every Horry home parcel in RAW/horry-homes.json (layer 24 returned no centroid).
Asks layer 24 for each parcel's outline, generalised to about 30 m (maxAllowableOffset 0.0003), and keeps the mean of the
first ring's vertices. Run: RAW=<scratch> python3 -I fetch_points.py. Writes RAW/horry-points.json {PIN: [lon, lat]}."""
import json, os, sys, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
def q(params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(8):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5 + 3 * i)
    raise SystemExit("failed")
W = "LandUseCode LIKE '1%' AND MarketImprv > 0"
ids = sorted(q({"where": W, "returnIdsOnly": "true"})["objectIds"]); pts = {}
for i in range(0, len(ids), 1000):
    d = q({"objectIds": ",".join(map(str, ids[i:i+1000])), "outFields": "PIN", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.0003", "geometryPrecision": "6"})
    for f in d["features"]:
        rings = (f.get("geometry") or {}).get("rings") or []
        if not rings: continue
        r = rings[0][:-1] or rings[0]
        pts[str(f["attributes"]["PIN"])] = [round(sum(p[0] for p in r) / len(r), 6), round(sum(p[1] for p in r) / len(r), 6)]
    if i % 20000 == 0: print(i, len(pts), flush=True)
json.dump(pts, open(os.path.join(RAW, "horry-points.json"), "w")); print("done", len(pts))
