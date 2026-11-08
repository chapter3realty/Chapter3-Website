#!/usr/bin/env python3
"""Horry County GIS records in a strip about 3.5 miles wide along the ocean (the TIGER coastline in coast.geojson,
buffered 0.056 degrees). Run: RAW=<scratch> python3 -I fetch_county.py <datadir>
Writes into RAW (kept out of the repo; parcel numbers stay private):
  parcels.json  layer 24 house parcels (LandUseCode 100, 101, 102, 110 or 126, MarketImprv > 0): PIN, LandUseCode,
                MarketProp, MarketImprv, centroid. No owner name or address is requested.
  fema.json     layer 19 FEMA flood zone polygons (FLD_ZONE, SFHA_TF, STATIC_BFE), WGS84
  towns.json    layer 31 municipal limits, WGS84"""
import sys, json, os, time, urllib.request, urllib.parse
from shapely.geometry import shape
RAW = os.environ["RAW"]; D = sys.argv[1]
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
g = shape(json.load(open(D + "/coast.geojson"))["features"][0]["geometry"]).buffer(0.056).simplify(0.003)
GEOM = json.dumps({"rings": [[list(c) for c in g.exterior.coords]], "spatialReference": {"wkid": 4326}})
env = {"geometry": GEOM, "geometryType": "esriGeometryPolygon", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"}
def q(url, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data, headers={"User-Agent": "Mozilla/5.0"}), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5 + 3 * i)
    raise SystemExit("failed")
def page(lay, where, fields, extra, n=1000, use_env=True):
    p = {"where": where, "returnIdsOnly": "true"}
    if use_env: p.update(env)
    ids = sorted(q(PA % lay, p)["objectIds"] or []); rows = []
    for i in range(0, len(ids), n):
        pp = {"objectIds": ",".join(map(str, ids[i:i+n])), "outFields": fields, "outSR": "4326"}; pp.update(extra)
        rows += q(PA % lay, pp)["features"]; print(lay, i, len(rows), flush=True)
    return rows
def have(n): return os.path.exists(os.path.join(RAW, n))
def save(n, o): json.dump(o, open(os.path.join(RAW, n), "w"))
if not have("parcels.json"):
    rows = page(24, "LandUseCode IN ('100','101','102','110','126') AND MarketImprv > 0", "PIN,LandUseCode,MarketProp,MarketImprv",
                {"returnGeometry": "true", "returnCentroid": "true", "maxAllowableOffset": "0.0003"})
    out = []
    for x in rows:
        c = x.get("centroid")
        if not c and x.get("geometry"):
            c = shape({"type": "Polygon", "coordinates": x["geometry"]["rings"]}).representative_point(); c = {"x": c.x, "y": c.y}
        if c: out.append(dict(x["attributes"], x=round(c["x"], 6), y=round(c["y"], 6)))
    save("parcels.json", out)
if not have("fema.json"):
    save("fema.json", page(19, "1=1", "FLD_ZONE,SFHA_TF,STATIC_BFE", {"returnGeometry": "true", "maxAllowableOffset": "0.00002"}, n=100))
if not have("towns.json"):
    save("towns.json", page(31, "1=1", "*", {"returnGeometry": "true", "maxAllowableOffset": "0.0001"}, n=50, use_env=False))
