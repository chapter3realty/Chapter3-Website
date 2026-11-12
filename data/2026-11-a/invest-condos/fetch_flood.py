"""FEMA flood zone (Horry County GIS layer 19, 'Flood Zones', fields FLD_ZONE, SFHA_TF, STATIC_BFE) at the center point
of every kept home sale in batch 2026-10-d's deed file (Horry County deeds recorded 2025-10-01 to 2026-09-30).
Usage: RAW=<scratch> python3 -I fetch_flood.py <deed file out-of-state-buyers.json>
Writes RAW/flood-points.json keyed by 'lat,lon' (no PIN, address or owner)."""
import json, os, sys, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
RAW = os.environ["RAW"]; deeds = json.load(open(sys.argv[1]))["sales"]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/19/query?"
out_f = os.path.join(RAW, "flood-points.json")
done = json.load(open(out_f)) if os.path.exists(out_f) else {}
pts = sorted({f"{x['lat']:.5f},{x['lon']:.5f}" for x in deeds if x.get("lat") and x.get("lon")} - set(done))
print(len(pts), "points to query", flush=True)
def one(k):
    lat, lon = k.split(",")
    q = urllib.parse.urlencode({"geometry": f"{lon},{lat}", "geometryType": "esriGeometryPoint", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects",
                                "outFields": "FLD_ZONE,SFHA_TF,STATIC_BFE,ZONE_SUBTY" if False else "FLD_ZONE,SFHA_TF,STATIC_BFE", "returnGeometry": "false", "f": "json"})
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q + q, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())
            if "error" in d: raise Exception(d["error"])
            return k, [f["attributes"] for f in d["features"]]
        except Exception as e:
            time.sleep(3 + 2 * i)
    return k, None
with ThreadPoolExecutor(8) as ex:
    for n, (k, v) in enumerate(ex.map(one, pts)):
        if v is not None: done[k] = v
        if n % 500 == 0:
            print(n, flush=True); json.dump(done, open(out_f, "w"))
json.dump(done, open(out_f, "w")); print("done", len(done))
