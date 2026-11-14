"""Pull Horry County open layers for the property records hub (aggregate counts only).
Usage: python3 -I pull_layers.py <out_dir>
Saves: municipalities.geojson, evac-zones.geojson, addresspoints.jsonl (gzip it after: gzip -9) (city, zip, point type, lon, lat; no PIN, no unit)."""
import json, sys, time, urllib.request, urllib.parse, os
OUT = sys.argv[1]
G = "https://gisportal.horrycounty.org/server/rest/services/OpenData"
def get(url, params):
    q = urllib.parse.urlencode(params)
    for i in range(5):
        try:
            with urllib.request.urlopen(url + "?" + q, timeout=90) as r:
                return json.load(r)
        except Exception as e:
            print("retry", i, e, file=sys.stderr); time.sleep(3 * (i + 1))
    raise SystemExit("failed " + url)
for name, svc, fields in [("municipalities", "Municipalities/MapServer/0", "NAME"), ("evac-zones", "EvacuationZones_Horry/MapServer/0", "Zone")]:
    d = get(f"{G}/{svc}/query", {"where": "1=1", "outFields": fields, "outSR": 4326, "f": "geojson"})
    json.dump(d, open(os.path.join(OUT, name + ".geojson"), "w"))
    print(name, len(d["features"]))
n = get(f"{G}/AddressPoints/MapServer/0/query", {"where": "1=1", "returnCountOnly": "true", "f": "json"})["count"]
with open(os.path.join(OUT, "addresspoints.jsonl"), "w") as f:
    off = 0
    while off < n:
        d = get(f"{G}/AddressPoints/MapServer/0/query", {"where": "1=1", "outFields": "OBJECTID,CITY,ZIPCODE,POINTTYPE", "orderByFields": "OBJECTID", "resultOffset": off, "resultRecordCount": 2000, "outSR": 4326, "returnGeometry": "true", "f": "json"})
        feats = d.get("features", [])
        if not feats: break
        for x in feats:
            a = x["attributes"]; g = x.get("geometry") or {}
            f.write(json.dumps({"id": a["OBJECTID"], "city": a["CITY"], "zip": a["ZIPCODE"], "type": a["POINTTYPE"], "x": g.get("x"), "y": g.get("y")}) + "\n")
        off += len(feats)
print("addresspoints", n, "pulled", off)
