"""Lot size for every Horry County house parcel with a building (GIS layer 24; LandUseCode 100, 101, 102, 110 or 126; MarketImprv > 0).
Keeps PIN, LandUseCode, Acreage and the parcel's area in square feet from the county's own shape field. No owner, street or city.
Run: RAW=<scratch> python3 -I fetch_acreage.py. Writes RAW/horry-house-acreage.json (kept out of the repo; it has PINs)."""
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
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5 + 3 * i)
    raise SystemExit("failed")
W = "LandUseCode IN ('100','101','102','110','126') AND MarketImprv > 0"
ids = sorted(q({"where": W, "returnIdsOnly": "true"})["objectIds"]); print("ids", len(ids), flush=True)
rows = []
for i in range(0, len(ids), 1000):
    d = q({"objectIds": ",".join(map(str, ids[i:i+1000])), "outFields": "PIN,LandUseCode,Acreage,Shape.STArea()", "returnGeometry": "false"})
    for f in d["features"]:
        a = f["attributes"]
        rows.append([a["PIN"], a["LandUseCode"], a["Acreage"], round(a.get("Shape.STArea()") or 0)])
    if i % 20000 == 0: print(i, len(rows), flush=True)
json.dump({"source": Q, "where": W, "pulled": time.strftime("%Y-%m-%d"), "cols": ["PIN", "LandUseCode", "Acreage", "ShapeArea_sqft"], "rows": rows},
          open(os.path.join(RAW, "horry-house-acreage.json"), "w"))
print("done", len(rows))
