"""Batch 2026-11-b, /buyers/waterfront-homes/. USGS National Hydrography Dataset (NHD), large-scale waterbodies
(layer 12) inside Horry County's box: lakes and ponds (FType 390), reservoirs (436) and swamp or marsh (466),
with name, FType, FCode and area. Public domain (USGS). Writes RAW/nhd-waterbodies.json.
Run: RAW=<scratch> python3 -I fetch_nhd.py"""
import json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]
URL = "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/12/query"
BOX = {"xmin": -79.34, "ymin": 33.56, "xmax": -78.54, "ymax": 34.30, "spatialReference": {"wkid": 4326}}
def q(p):
    data = urllib.parse.urlencode(dict(p, f="json")).encode()
    for i in range(5):
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(URL, data=data, headers={"User-Agent": "Mozilla/5.0"}), timeout=180))
            if "error" in r: raise RuntimeError(r["error"])
            return r
        except Exception as e:
            print("retry", e, flush=True); time.sleep(4)
    raise SystemExit("failed")
base = {"geometry": json.dumps(BOX), "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "where": "ftype IN (390,436,466)"}
ids = sorted(q(dict(base, returnIdsOnly="true"))["objectIds"]); print("waterbodies", len(ids), flush=True)
out = []
for i in range(0, len(ids), 250):
    r = q({"objectIds": ",".join(map(str, ids[i:i + 250])), "outFields": "gnis_name,ftype,fcode,areasqkm", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.000005"})
    out += [{"a": f["attributes"], "g": f.get("geometry")} for f in r["features"]]
json.dump({"source": URL, "box": BOX, "rows": out}, open(os.path.join(RAW, "nhd-waterbodies.json"), "w"))
print("saved", len(out), flush=True)
