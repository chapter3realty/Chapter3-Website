"""Every condo unit parcel in Horry County: GIS layer 24, residential (LandUseCode 1xx) with a building value, legal description
containing 'HPR' (horizontal property regime, a condo under SC Code Title 27 Chapter 31). Fields kept: legal description, tax district,
assessed, taxable and market values, owner mailing state, sale date. No owner name or street.
Usage: RAW=<scratch> python3 -I fetch_condo_parcels.py. Writes RAW/condo-parcels.json (keeps PIN for joins; stays outside the repo)."""
import json, os, sys, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
WHERE = "LegalDescr LIKE '%HPR%' AND LandUseCode LIKE '1%' AND MarketImprv > 0"
F = "PIN,LegalDescr,TaxDistrict,LandUseCode,AssessedProp,TaxableProp,MarketProp,MarketLand,OwnerState,SaleDate"
rows, off = [], 0
while True:
    data = urllib.parse.urlencode({"where": WHERE, "outFields": F, "orderByFields": "OBJECTID", "resultOffset": off, "resultRecordCount": 2000, "returnGeometry": "false", "f": "json"}).encode()
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=180).read())
            if "error" in d: raise Exception(d["error"])
            break
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    feats = [x["attributes"] for x in d["features"]]; rows += feats; off += len(feats); print(off, flush=True)
    if not feats or not d.get("exceededTransferLimit"): break
json.dump({"query": Q, "where": WHERE, "fields": F, "read": time.strftime("%Y-%m-%d"), "rows": rows}, open(os.path.join(RAW, "condo-parcels.json"), "w"))
print("rows", len(rows))
