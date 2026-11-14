"""Flood zones under The Palace, from Horry County GIS.
Footprint: the union of the Palace parcels in layer 24 (LegalDescr LIKE 'THE PALACE;%'), as the county draws them.
Zones: layer 19 "Flood Zones" (the FEMA flood map polygons the county serves), every polygon that touches the footprint.
Kept: each zone's name, its base flood elevation field if any, and the share of the footprint's area it covers.
Also: the zone at the footprint's center point. Run: python3 -I pull_flood.py <this dir>. Writes flood.json."""
import json, sys, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon, shape, mapping
from shapely.ops import unary_union
D = sys.argv[1]
B = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/"
def q(layer, p):
    return json.load(urllib.request.urlopen(B + f"{layer}/query?" + urllib.parse.urlencode(p), timeout=120))
j = q(24, {"where": "LegalDescr LIKE 'THE PALACE;%'", "outFields": "OBJECTID", "returnGeometry": "true", "outSR": 4326, "f": "json"})
polys = []
for f in j["features"]:
    for r in f["geometry"]["rings"]:
        if len(r) >= 4: polys.append(Polygon(r).buffer(0))
fp = unary_union(polys)
info = json.load(urllib.request.urlopen(B + "19?f=json", timeout=60))
fields = [f["name"] for f in info.get("fields", [])]
zl = q(19, {"geometry": json.dumps({"rings": [list(map(list, fp.exterior.coords))] if fp.geom_type == "Polygon" else [list(map(list, g.exterior.coords)) for g in fp.geoms], "spatialReference": {"wkid": 4326}}),
            "geometryType": "esriGeometryPolygon", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "returnGeometry": "true", "outSR": 4326, "f": "json"})
zones = []
for f in zl.get("features", []):
    g = unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"] if len(r) >= 4])
    share = g.intersection(fp).area / fp.area
    a = {k: v for k, v in f["attributes"].items() if k.upper() in ("FLD_ZONE", "ZONE", "ZONE_SUBTY", "STATIC_BFE", "SFHA_TF", "FLOODZONE", "BFE", "DFIRM_ID", "ZONE_")}
    zones.append({"attributes": a, "all_attribute_names": list(f["attributes"].keys()), "share_of_footprint": round(share, 3)})
c = fp.centroid
pt = q(19, {"geometry": f"{c.x},{c.y}", "geometryType": "esriGeometryPoint", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "returnGeometry": "false", "f": "json"})
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "layer19_fields": fields, "footprint_parcels": len(j["features"]),
       "footprint_center": [round(c.y, 6), round(c.x, 6)], "footprint_bounds": [round(v, 6) for v in fp.bounds], "zones_touching": zones,
       "center_point_zones": [x["attributes"] for x in pt.get("features", [])], "share_in_no_zone": round(1 - sum(z["share_of_footprint"] for z in zones), 3)}
json.dump(out, open(D + "/flood.json", "w"), indent=1)
print(json.dumps(out, indent=1)[:4000])
