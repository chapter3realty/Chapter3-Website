"""Flood zones under Ocean Forest Villas, from Horry County GIS. Footprint = the union of the 241 unit parcels pull_county.py selects (layer 24 stacked condo parcels share the building footprints).
Zones: layer 19 "Flood Zones", every polygon whose area overlaps the footprint (found by its bounding box, shares computed exactly); kept: zone name and share of the footprint's area. Also the zone at the footprint center.
Run: python3 -I pull_flood.py <this dir>. Writes flood.json."""
import json, sys, re, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon
from shapely.ops import unary_union
D = sys.argv[1]
B = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/"
def q(layer, p): return json.load(urllib.request.urlopen(B + f"{layer}/query?" + urllib.parse.urlencode(p), timeout=120))
j = q(24, {"geometry": "-78.8375,33.7270,-78.8325,33.7310", "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "LegalDescr,LandUseCode", "returnGeometry": "true", "outSR": 4326, "resultRecordCount": 2000, "f": "json"})
NAME = re.compile(r"^(A PLACE AT TH|A PLACE AT BCH|PLACE AT B|OCEAN FOREST;)")
polys = []; n = 0
for f in j["features"]:
    a = f["attributes"]
    if not NAME.match(a["LegalDescr"] or "") or not (a.get("LandUseCode") or "").startswith("1"): continue
    for r in f["geometry"]["rings"]:
        if len(r) >= 4 and sum(p[1] for p in r) / len(r) >= 33.7278: polys.append(Polygon(r).buffer(0)); n += 1
fp = unary_union(polys)
parts = [fp] if fp.geom_type == "Polygon" else list(fp.geoms)
bx = fp.bounds
zl = q(19, {"geometry": f"{bx[0]},{bx[1]},{bx[2]},{bx[3]}", "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "returnGeometry": "true", "outSR": 4326, "f": "json"})
zones = []
for f in zl.get("features", []):
    g = unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"] if len(r) >= 4])
    a = {k: v for k, v in f["attributes"].items() if k.upper() in ("FLD_ZONE", "ZONE", "ZONE_SUBTY", "STATIC_BFE", "SFHA_TF", "FLOODZONE", "BFE", "DFIRM_ID", "ZONE_")}
    if g.intersection(fp).area / fp.area < 0.0005: continue
    zones.append({"attributes": a, "share_of_footprint": round(g.intersection(fp).area / fp.area, 3)})
c = fp.centroid
pt = q(19, {"geometry": f"{c.x},{c.y}", "geometryType": "esriGeometryPoint", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "returnGeometry": "false", "f": "json"})
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "footprint_parcels": n, "footprint_center": [round(c.y, 6), round(c.x, 6)], "footprint_bounds": [round(v, 6) for v in fp.bounds],
       "zones_touching": zones, "center_point_zones": [x["attributes"] for x in pt.get("features", [])], "share_in_no_zone": round(1 - sum(z["share_of_footprint"] for z in zones), 3)}
json.dump(out, open(D + "/flood.json", "w"), indent=1); print(json.dumps(out, indent=1)[:3000])
