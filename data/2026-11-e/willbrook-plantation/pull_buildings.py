"""Georgetown County 2024 building footprints (GCGIS_Buildings layer 1, TMS + status) and hydrography-like layers for the Willbrook box.
Writes RAW/buildings.json (outside the repo). Box = the bounding box of the community's residential parcels in RAW/county.json.
Run: RAW=<scratch> python3 -I pull_buildings.py"""
import json, os, urllib.parse, urllib.request, time
RAW = os.environ["RAW"]; C = json.load(open(os.path.join(RAW, "county.json")))
B = "https://gis1.georgetowncountysc.org/portal/rest/services/GCGIS_Buildings/FeatureServer/1/query"
rs = [r for f in C["parcels"] if f["attributes"]["StreetName"] != "UNKNOWN" and f["attributes"]["LandUseCode"][:1] in "QN" for r in f["geometry"]["rings"]]
xs = [x for r in rs for x, y in r]; ys = [y for r in rs for x, y in r]
box = f"{min(xs)-.001},{min(ys)-.001},{max(xs)+.001},{max(ys)+.001}"; print(box)
out, off = [], 0
while True:
    p = {"where": "1=1", "outFields": "TMS,status", "returnGeometry": "true", "outSR": 4326, "geometryPrecision": 6, "f": "json", "geometry": box,
         "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "resultOffset": off, "resultRecordCount": 1000}
    for i in range(6):
        try: d = json.load(urllib.request.urlopen(B + "?" + urllib.parse.urlencode(p), timeout=120)); break
        except Exception as e: print("retry", e); time.sleep(4)
    fs = d.get("features", []); out += fs; print(off, len(fs))
    if len(fs) < 1000 and not d.get("exceededTransferLimit"): break
    off += len(fs)
json.dump(out, open(os.path.join(RAW, "buildings.json"), "w"))
