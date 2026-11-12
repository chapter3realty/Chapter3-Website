"""Lot size for Georgetown County parcels on the Waccamaw Neck (GIS open data, GCGIS_Export layer 2), same envelope as
invest-where-to-buy/fetch_georgetown.py, so rows join to that file's TMS and point. Keeps TMS, LandUseCode, TotalLandArea
(acres, the county's field) and Shape__Area (square feet, SC State Plane, wkid 3361). TotalLandArea reads 1.0 on 17,997 of 22,147
parcels (a lot count, not acres; checked 2026-11-03 against Shape__Area), so analyze.py uses Shape__Area / 43,560. No owner or street.
Run: RAW=<scratch> python3 -I fetch_gt_area.py. Writes RAW/gt-area.json (kept out of the repo; it has parcel numbers)."""
import json, os, sys, time, urllib.parse, urllib.request
RAW = os.environ["RAW"]
U = "https://gis1.georgetowncountysc.org/portal/rest/services/GCGIS_Export/FeatureServer/2/query"
ENV = "-79.25,33.36,-78.98,33.62"
def get(params):
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(U, data=urllib.parse.urlencode(params).encode()), timeout=180) as r:
                return json.load(r)
        except Exception as e:
            print("retry", i, e, file=sys.stderr); time.sleep(4 + 3 * i)
    raise SystemExit("failed")
rows, off = [], 0
while True:
    d = get({"where": "1=1", "outFields": "TMS,LandUseCode,TotalLandArea,Shape__Area", "returnGeometry": "false", "f": "json",
             "resultOffset": off, "resultRecordCount": 2000, "geometry": ENV, "geometryType": "esriGeometryEnvelope", "inSR": 4326,
             "spatialRel": "esriSpatialRelIntersects"})
    fs = d.get("features", [])
    for f in fs:
        a = f["attributes"]; rows.append([a["TMS"], a["LandUseCode"], a["TotalLandArea"], a.get("Shape__Area")])
    print(off, len(fs), flush=True)
    if not fs or (len(fs) < 2000 and not d.get("exceededTransferLimit")): break
    off += len(fs)
json.dump({"source": U, "env": ENV, "pulled": time.strftime("%Y-%m-%d"), "cols": ["TMS", "LandUseCode", "TotalLandArea", "ShapeArea_sqft"], "rows": rows}, open(os.path.join(RAW, "gt-area.json"), "w"))
print("done", len(rows))
