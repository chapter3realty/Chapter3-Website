"""Every Horry County home parcel with a building (GIS layer 24, LandUseCode 1xx, MarketImprv > 0), county-wide.
Keeps PIN, LandUseCode, TaxDistrict, AssessedProp, TaxableProp, MarketProp, OwnerState, SaleDate, the HPR (condo regime)
flag from the legal description, and the parcel's centroid. No owner name, street or city is kept.
Assessment class: AssessedProp / TaxableProp about 0.04 = legal residence (4%), about 0.06 = every other home (6%).
Run: RAW=<scratch> python3 -I fetch_parcels.py. Writes RAW/horry-homes.json (kept out of the repo; it has PINs)."""
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
W = "LandUseCode LIKE '1%' AND MarketImprv > 0"
ids = sorted(q({"where": W, "returnIdsOnly": "true"})["objectIds"]); print("ids", len(ids), flush=True)
rows = []
F = "PIN,LandUseCode,TaxDistrict,AssessedProp,TaxableProp,MarketProp,OwnerState,SaleDate,LegalDescr"
for i in range(0, len(ids), 1000):
    d = q({"objectIds": ",".join(map(str, ids[i:i+1000])), "outFields": F, "returnGeometry": "false", "returnCentroid": "true", "outSR": "4326"})
    for f in d["features"]:
        a = f["attributes"]; c = f.get("centroid") or {}
        rows.append([a["PIN"], a["LandUseCode"], a["TaxDistrict"], a["AssessedProp"], a["TaxableProp"], a["MarketProp"], a["OwnerState"], a["SaleDate"],
                     1 if "HPR" in (a["LegalDescr"] or "") else 0, round(c.get("x", 0), 6), round(c.get("y", 0), 6)])
    if i % 20000 == 0: print(i, len(rows), flush=True)
json.dump({"source": Q, "where": W, "pulled": time.strftime("%Y-%m-%d"), "cols": ["PIN", "LandUseCode", "TaxDistrict", "AssessedProp", "TaxableProp", "MarketProp", "OwnerState", "SaleDate", "HPR", "x", "y"], "rows": rows},
          open(os.path.join(RAW, "horry-homes.json"), "w"))
print("done", len(rows))
