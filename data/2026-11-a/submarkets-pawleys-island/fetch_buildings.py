"""2024 building footprints, Georgetown County GIS (GCGIS_Buildings layer 1), over the whole study envelope,
pulled by object id so no page is skipped. Run: RAW=<dir> python3 -I fetch_buildings.py"""
import json, os, sys, urllib.parse, urllib.request
RAW = os.environ["RAW"]
U = "https://gis1.georgetowncountysc.org/portal/rest/services/GCGIS_Buildings/FeatureServer/%d/query"
ENV = "-79.22,33.36,-79.03,33.53"
def get(url, p, post=False):
    data = urllib.parse.urlencode(p).encode()
    return json.load(urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=180))
for layer, out in [(1, "bld2024-all.geojson"), (5, "bld2017-all.geojson")]:
    ids = get(U % layer, {"where": "1=1", "geometry": ENV, "geometryType": "esriGeometryEnvelope", "inSR": 4326,
                          "returnIdsOnly": "true", "f": "json"})["objectIds"]
    ids.sort(); feats = []
    for i in range(0, len(ids), 500):
        d = get(U % layer, {"objectIds": ",".join(map(str, ids[i:i+500])), "outFields": "OBJECTID,TMS,status",
                            "returnGeometry": "true", "returnCentroid": "true", "outSR": 4326, "geometryPrecision": 6, "f": "geojson"})
        feats += d["features"]
    print(layer, len(ids), len(feats), file=sys.stderr)
    json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(RAW, out), "w"))
