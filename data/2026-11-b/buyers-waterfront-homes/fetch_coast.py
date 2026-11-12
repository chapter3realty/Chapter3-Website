"""Batch 2026-11-b, /buyers/waterfront-homes/. Horry County GIS pulls for the ocean, the lakes and the flood map.
1. The county boundary (layer 33); its ocean edge is the coastline (the ring from the state line at Little River Inlet
   to the Georgetown line at Garden City, the shorter of the two arcs).
2. Every parcel (layer 24) within 300 m of that coastline: PIN, land use, parcel type, condo label, building value, outline.
3. The outline of every parcel that a kept home sale names (deeds file of batch 2026-10-d), by PIN, for the lake test.
4. FEMA's high-risk flood zones (layer 19, FLD_ZONE A, AE, AO, VE), outlines, for the zone of each sale.
Owner names and mailing addresses are not requested. Outputs go to RAW (outside the repo: PINs and outlines).
Run: RAW=<scratch> python3 -I fetch_coast.py [sales.json]"""
import json, os, sys, time, urllib.request, urllib.parse
from shapely.geometry import shape, LineString, mapping
RAW = os.environ["RAW"]
HERE = os.path.dirname(os.path.abspath(__file__))
SALES = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json")
BASE = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def q(layer, p):
    data = urllib.parse.urlencode(dict(p, f="json")).encode()
    for i in range(5):
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(BASE % layer, data=data, headers={"User-Agent": "Mozilla/5.0"}), timeout=180))
            if "error" in r: raise RuntimeError(r["error"])
            return r
        except Exception as e:
            print("retry", layer, e, flush=True); time.sleep(4)
    raise SystemExit("failed layer %d" % layer)
def save(n, o): json.dump(o, open(os.path.join(RAW, n), "w"))

# 1. coastline
cty = q(33, {"where": "1=1", "outFields": "Name", "returnGeometry": "true", "outSR": "4326"})
ring = cty["features"][0]["geometry"]["rings"][0]
iN = max(range(len(ring)), key=lambda i: ring[i][0])        # easternmost point: the state line at the coast
iS = min(range(len(ring)), key=lambda i: ring[i][1])        # southernmost point: the Georgetown line at the coast
a, b = sorted((iN, iS))
arc1 = ring[a:b + 1]; arc2 = ring[b:] + ring[1:a + 1]
coast = min((arc1, arc2), key=lambda c: LineString(c).length)
save("coast.json", {"type": "LineString", "coordinates": coast})
print("coast points", len(coast), "from", coast[0], "to", coast[-1], flush=True)

have = lambda n: os.path.exists(os.path.join(RAW, n))
# 2. parcels within 300 m of the coast, in pieces of the coast so each request stays small
FIELDS = "OBJECTID,PIN,LandUseCode,PARCELTYPE,CONDOLABEL,MarketImprv,MarketProp,Acreage"
ids = set(); step = 40
for i in (range(0, len(coast) - 1, step) if not have("coast-parcels.json") else []):
    seg = coast[i:i + step + 1]
    g = json.dumps({"paths": [seg], "spatialReference": {"wkid": 4326}})
    r = q(24, {"geometry": g, "geometryType": "esriGeometryPolyline", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects",
               "distance": "300", "units": "esriSRUnit_Meter", "returnIdsOnly": "true"})
    ids |= set(r.get("objectIds") or [])
ids = sorted(ids); print("coast parcels", len(ids), flush=True)
rows = []
for i in (range(0, len(ids), 400) if ids else []):
    r = q(24, {"objectIds": ",".join(map(str, ids[i:i + 400])), "outFields": FIELDS, "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.000005"})
    rows += [{"a": f["attributes"], "g": f.get("geometry")} for f in r["features"]]
if rows: save("coast-parcels.json", rows); print("coast parcels fetched", len(rows), flush=True)

# 3. outlines of every sold parcel (not condos: a condo's lake test uses its building's parcel, which the point finds)
S = json.load(open(SALES))["sales"]
pins = sorted({s["pin"] for s in S if not s.get("condo")})
out = []
for i in (range(0, len(pins), 200) if not have("sale-parcels.json") else []):
    w = "PIN IN (%s)" % ",".join(str(int(p)) for p in pins[i:i + 200])
    r = q(24, {"where": w, "outFields": "PIN,LandUseCode,MarketImprv,Acreage", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.000005"})
    out += [{"a": f["attributes"], "g": f.get("geometry")} for f in r["features"]]
    if i % 3000 == 0: print("sale outlines", i, len(out), flush=True)
if out: save("sale-parcels.json", out); print("sale outlines", len(out), "of", len(pins), flush=True)

# 4. high-risk flood zones
r = q(19, {"where": "FLD_ZONE IN ('A','AE','AO','VE','V')", "returnIdsOnly": "true"})
fids = sorted(r["objectIds"]); fz = []
for i in range(0, len(fids), 200):
    r = q(19, {"objectIds": ",".join(map(str, fids[i:i + 200])), "outFields": "FLD_ZONE,STATIC_BFE", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})
    fz += [{"z": f["attributes"]["FLD_ZONE"], "bfe": f["attributes"].get("STATIC_BFE"), "g": f.get("geometry")} for f in r["features"]]
save("flood-sfha.json", fz); print("flood polygons", len(fz), flush=True)
