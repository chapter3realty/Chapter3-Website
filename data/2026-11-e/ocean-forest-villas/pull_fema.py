"""FEMA National Flood Hazard Layer (hazards.fema.gov NFHL layer 28, S_FLD_HAZ_AR) under Ocean Forest Villas: every flood polygon overlapping the footprint
(flood.json footprint_bounds), with the share of the unit parcels' area (the 241 stacked parcels, pull_flood.py) each covers. The county's own flood layer 19 answered nothing here.
Also saves the point answer at the center. Run: python3 -I pull_fema.py <this dir>. Writes fema.json and raw/fema-nfhl-point.json."""
import json, sys, re, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon
from shapely.ops import unary_union
D = sys.argv[1]
F = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?"
H = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"
import time
def get(u, p):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u + urllib.parse.urlencode(p), headers={"User-Agent": "chapter3-research"}), timeout=120))
        except Exception: time.sleep(5 + 5 * i)
    raise SystemExit("failed " + u)
fl = json.load(open(D + "/flood.json")); bx = fl["footprint_bounds"]; c = fl["footprint_center"]
NAME = re.compile(r"^(A PLACE AT TH|A PLACE AT BCH|PLACE AT B|OCEAN FOREST;)")
j = get(H, {"geometry": "-78.8375,33.7270,-78.8325,33.7310", "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "LegalDescr,LandUseCode", "returnGeometry": "true", "outSR": 4326, "resultRecordCount": 2000, "f": "json"})
polys = [Polygon(r).buffer(0) for f in j["features"] if NAME.match(f["attributes"]["LegalDescr"] or "") and (f["attributes"].get("LandUseCode") or "").startswith("1") for r in f["geometry"]["rings"] if len(r) >= 4 and sum(p[1] for p in r) / len(r) >= 33.7278]
fp = unary_union(polys)
pt = get(F, {"geometry": f"{c[1]},{c[0]}", "geometryType": "esriGeometryPoint", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE", "returnGeometry": "false", "f": "json"})
json.dump(pt, open(D + "/raw/fema-nfhl-point.json", "w"), indent=1)
z = get(F, {"geometry": f"{bx[0]},{bx[1]},{bx[2]},{bx[3]}", "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE", "returnGeometry": "true", "outSR": 4326, "f": "json"})
zones = []
for f in z.get("features", []):
    g = unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"] if len(r) >= 4]); s = g.intersection(fp).area / fp.area
    zones.append({"attributes": f["attributes"], "share_of_footprint": round(s, 3)})
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": F, "center_point": [x["attributes"] for x in pt.get("features", [])], "zones": zones, "share_in_no_polygon": round(1 - sum(x["share_of_footprint"] for x in zones), 3)}
json.dump(out, open(D + "/fema.json", "w"), indent=1); print(json.dumps(out, indent=1))
