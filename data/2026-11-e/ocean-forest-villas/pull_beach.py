"""Distance from each building's center (zoning.json) to the nearest FEMA VE polygon (the coastal high-hazard zone that runs along the oceanfront), FEMA NFHL layer 28, in feet (flat-earth, cos(lat) corrected).
A stand-in for "how far back from the ocean"; it is not the distance to the sand. Run: python3 -I pull_beach.py <this dir>. Writes beach.json."""
import json, sys, math, time, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
D = sys.argv[1]
F = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?"
p = {"geometry": "-78.8400,33.7240,-78.8280,33.7340", "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "where": "FLD_ZONE='VE'", "outFields": "FLD_ZONE,STATIC_BFE", "returnGeometry": "true", "outSR": 4326, "f": "json"}
for i in range(6):
    try: j = json.load(urllib.request.urlopen(urllib.request.Request(F + urllib.parse.urlencode(p), headers={"User-Agent": "chapter3-research"}), timeout=120)); break
    except Exception: time.sleep(5 + 5 * i)
ve = unary_union([Polygon(r).buffer(0) for f in j["features"] for r in f["geometry"]["rings"] if len(r) >= 4])
k = math.cos(math.radians(33.73)); out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "ve_polygons": len(j["features"]), "feet_to_nearest_VE_edge": {}}
for b, v in json.load(open(D + "/zoning.json"))["buildings"].items():
    pt = Point(v["center"][1], v["center"][0])
    d = pt.distance(ve); out["feet_to_nearest_VE_edge"][b] = {"feet": round(d * 111000 * 3.281 * (1 if True else k)), "inside_VE": ve.contains(pt)}
json.dump(out, open(D + "/beach.json", "w"), indent=1); print(out)
