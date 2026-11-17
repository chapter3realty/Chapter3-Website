"""City of Myrtle Beach zoning district at the center of each of the five buildings (A to E), from the city's ZONING_DISTRICTS_MB layer, and whether that point is inside the
shaded nightly-rental area of the city's map (website data/2026-11-a/submarkets-myrtle-beach/map-str-zones.geojson, a fit of the city's map, IoU 0.85). Building centers = mean of each building's unit parcel vertices (pull_county.py selection).
Run: python3 -I pull_zoning.py <this dir> <website root>. Writes zoning.json and raw/city-zoning-point.json (center)."""
import json, sys, re, urllib.request, urllib.parse, collections, datetime
from shapely.geometry import shape, Point
D, WEB = sys.argv[1], sys.argv[2]
H = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"
Z = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0/query?"
NAME = re.compile(r"^(A PLACE AT TH|A PLACE AT BCH|PLACE AT B|OCEAN FOREST;)")
def letter(l):
    s = l.split(";", 1)[1] if ";" in l else l
    m = re.search(r"\b([A-E])[- ]?\d{3}\b|\b\d{3}[- ]?([A-E])\b", s); return (m[1] or m[2]) if m else None
j = json.load(urllib.request.urlopen(H + urllib.parse.urlencode({"geometry": "-78.8375,33.7270,-78.8325,33.7310", "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "LegalDescr,LandUseCode", "returnGeometry": "true", "outSR": 4326, "resultRecordCount": 2000, "f": "json"}), timeout=120))
pts = collections.defaultdict(list)
for f in j["features"]:
    a = f["attributes"]
    if NAME.match(a["LegalDescr"] or "") and (a.get("LandUseCode") or "").startswith("1"):
        r = f["geometry"]["rings"][0]
        if sum(p[1] for p in r) / len(r) >= 33.7278 and letter(a["LegalDescr"]): pts[letter(a["LegalDescr"])] += r
g = json.load(open(WEB + "/data/2026-11-a/submarkets-myrtle-beach/map-str-zones.geojson"))
shaded = [shape(f["geometry"]) for f in g["features"] if f["properties"]["class"] == "str"]; city = [shape(f["geometry"]) for f in g["features"] if f["properties"]["class"] == "city_limits"]
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "buildings": {}}
for b, r in sorted(pts.items()):
    lo = sum(p[0] for p in r) / len(r); la = sum(p[1] for p in r) / len(r)
    zj = json.load(urllib.request.urlopen(Z + urllib.parse.urlencode({"geometry": f"{lo},{la}", "geometryType": "esriGeometryPoint", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "ZONING_DIS", "returnGeometry": "false", "f": "json"}), timeout=60))
    p = Point(lo, la)
    out["buildings"][b] = {"center": [round(la, 5), round(lo, 5)], "zoning": [x["attributes"]["ZONING_DIS"] for x in zj.get("features", [])], "in_shaded_nightly_area": any(s.contains(p) for s in shaded), "in_city_limits": any(s.contains(p) for s in city)}
    if b == "A": json.dump(zj, open(D + "/raw/city-zoning-point.json", "w"))
json.dump(out, open(D + "/zoning.json", "w"), indent=1); print(json.dumps(out, indent=1))
