"""Georgetown County parcels (GIS open data, GCGIS_Export layer 2) and the county's FEMA flood zones (GCGIS_Nature layer 9)
for the Waccamaw Neck: Garden City's south end, Murrells Inlet, Litchfield and Pawleys Island.
Parcels keep TMS, LandUseCode (first letter Q = legal residence, taxed at 4 percent), mailing State, SaleDate, SalePrice,
LegalDescription and a representative point. No owner name or street is kept.
Run: RAW=<scratch> python3 -I fetch_georgetown.py. Writes RAW/gt-homes.json and RAW/gt-flood.geojson (kept out of the repo)."""
import json, os, sys, time, urllib.parse, urllib.request
from shapely.geometry import shape
RAW = os.environ["RAW"]
B = "https://gis1.georgetowncountysc.org/portal/rest/services"
ENV = "-79.25,33.36,-78.98,33.62"
def get(url, params):
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode(params).encode()), timeout=180) as r:
                return json.load(r)
        except Exception as e:
            print("retry", i, e, file=sys.stderr); time.sleep(4 + 3 * i)
    raise SystemExit("failed " + url)
def pull(layer, fields, where="1=1"):
    feats, off = [], 0
    while True:
        d = get(f"{B}/{layer}/query", {"where": where, "outFields": fields, "returnGeometry": "true", "outSR": 4326, "f": "geojson",
                "resultOffset": off, "resultRecordCount": 2000, "geometryPrecision": 6, "geometry": ENV, "geometryType": "esriGeometryEnvelope",
                "inSR": 4326, "spatialRel": "esriSpatialRelIntersects"})
        fs = d.get("features", []); feats += fs; print(layer, off, len(fs), flush=True)
        if len(fs) < 2000 and not d.get("exceededTransferLimit") and not d.get("properties", {}).get("exceededTransferLimit"): break
        off += len(fs)
        if not fs: break
    return feats
rows = []
for f in pull("GCGIS_Export/FeatureServer/2", "TMS,LandUseCode,State,SaleDate,SalePrice,LegalDescription"):
    if not f.get("geometry"): continue
    p = f["properties"]; pt = shape(f["geometry"]).representative_point()
    rows.append([p["TMS"], p["LandUseCode"], (p["State"] or "").strip().upper(), p["SaleDate"], p["SalePrice"], p["LegalDescription"], round(pt.x, 6), round(pt.y, 6)])
json.dump({"source": B + "/GCGIS_Export/FeatureServer/2", "env": ENV, "pulled": time.strftime("%Y-%m-%d"), "cols": ["TMS", "LandUseCode", "State", "SaleDate", "SalePrice", "LegalDescription", "x", "y"], "rows": rows},
          open(os.path.join(RAW, "gt-homes.json"), "w"))
print("parcels", len(rows))
fl = pull("GCGIS_Nature/FeatureServer/9", "FLD_ZONE,SFHA_TF,ZONE_SUBTY")
json.dump({"type": "FeatureCollection", "features": fl}, open(os.path.join(RAW, "gt-flood.geojson"), "w")); print("flood", len(fl))
