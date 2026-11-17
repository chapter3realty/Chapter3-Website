"""Oak Forest flood: the county's flood layer (Horry layer 19) against FEMA's own National Flood Hazard Layer (NFHL, layer 28 Flood Hazard Zones).
Counts lots whose inside point is in each zone, houses whose roof outline touches a high-risk (SFHA) zone, and the base flood elevations.
Saves counts only. Run: RAW=<scratch> python3 -I flood_check.py <this dir>. Writes flood.json."""
import json, os, sys, urllib.request, urllib.parse, collections, time
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
D = sys.argv[1]; C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
xs = [p[0] for a in C["parcels"].values() for r in a["rings"] for p in r]; ys = [p[1] for a in C["parcels"].values() for r in a["rings"] for p in r]
env = f"{min(xs)-.001},{min(ys)-.001},{max(xs)+.001},{max(ys)+.001}"
U = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query"
def q(url, p):
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode(p).encode(), headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(4)
    return None
fe = q(U, {"geometry": env, "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "outFields": "FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE,DFIRM_ID", "returnGeometry": "true", "outSR": "4326", "f": "json"})
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
out = {"read": time.strftime("%Y-%m-%d"), "fema_source": U}
def count(feats, label, key):
    zs = [(f["attributes"][key["zone"]], f["attributes"].get(key["sfha"]), f["attributes"].get(key["bfe"]), poly(f["geometry"]["rings"])) for f in feats]
    c = collections.Counter(); touch = 0; bfes = collections.Counter()
    for pin, a in C["parcels"].items():
        g = poly(a["rings"]); pt = g.representative_point()
        z = next((z for z, s, b, p in zs if p.contains(pt)), "X (outside mapped hazard areas)"); c[z] += 1
        if any(s == "T" and p.intersects(g) for z, s, b, p in zs): touch += 1
    for z, s, b, p in zs: bfes[(z, b)] += 1
    out[label] = {"lots_by_zone_at_inside_point": dict(c), "lots_touching_high_risk": touch, "polygons": {f"{z} bfe={b}": n for (z, b), n in bfes.items()}}
if fe and "features" in fe:
    count(fe["features"], "fema_nfhl", {"zone": "FLD_ZONE", "sfha": "SFHA_TF", "bfe": "STATIC_BFE"})
    out["fema_subtypes"] = dict(collections.Counter((f["attributes"]["FLD_ZONE"], f["attributes"]["ZONE_SUBTY"], f["attributes"]["DFIRM_ID"]) .__str__() for f in fe["features"]))
else: out["fema_nfhl"] = "FEMA service did not answer"
count(C["geo"]["flood"], "county_layer19", {"zone": "FLD_ZONE", "sfha": "SFHA_TF", "bfe": "STATIC_BFE"})
json.dump(out, open(os.path.join(D, "flood.json"), "w"), indent=1); print(json.dumps(out, indent=1))
