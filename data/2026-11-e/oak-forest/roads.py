"""Roads nearest Oak Forest: U.S. Census TIGERweb Transportation layer 4 (state and U.S. highways) and layer 6, distance from the community outline in metres.
Run: RAW=<scratch> python3 -I roads.py <this dir>. Writes roads.json."""
import json, os, sys, math, urllib.request, urllib.parse
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union
D = sys.argv[1]; C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
out = unary_union([Polygon(r).buffer(0) for a in C["parcels"].values() for r in a["rings"] if len(r) >= 4]).convex_hull
K = 111320 * math.cos(math.radians(33.677))
res = {}
for L in (4, 6):
    u = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation/MapServer/%d/query?" % L + urllib.parse.urlencode({"geometry": "-79.02,33.64,-78.90,33.72", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "outFields": "NAME,MTFCC", "returnGeometry": "true", "outSR": "4326", "f": "json"})
    for f in json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "research-client"}), timeout=60))["features"]:
        g = unary_union([LineString(p) for p in f["geometry"]["paths"]])
        n = f["attributes"]["NAME"]; d = round(out.distance(g) * K)
        res[n] = min(res.get(n, 99999), d)
json.dump({"source": "TIGERweb Transportation layers 4 and 6", "metres_from_outline": dict(sorted(res.items(), key=lambda x: x[1]))}, open(os.path.join(D, "roads.json"), "w"), indent=1)
print(json.dumps(dict(sorted(res.items(), key=lambda x: x[1])), indent=0))
