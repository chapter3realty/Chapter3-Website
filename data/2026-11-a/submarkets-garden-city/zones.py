"""Shared geometry for /submarkets/garden-city/: the Census place, the county line, Waccamaw Drive, Business 17, the marsh.
Every input is in RAW (see fetch_county.py and README.md)."""
import json, os, math
from shapely.geometry import shape, Polygon, MultiPolygon, LineString, Point
from shapely.ops import linemerge, polygonize, unary_union, nearest_points
RAW = os.environ["RAW"]
def J(n): return json.load(open(os.path.join(RAW, n)))
CDP = shape(J("cdp2020.geojson")["features"][0]["geometry"])
CTY = {f["properties"]["NAME"]: shape(f["geometry"]) for f in J("counties.geojson")["features"]}
roads = J("roads.json")
def road(names):
    ls = [LineString(p) for f in roads if (f["attributes"]["FULLNAME"] or "") in names for p in f["geometry"].get("paths", [])]
    return unary_union(ls)
WACC = road({"N WACCAMAW DR", "S WACCAMAW DR"})
BUS17 = road({"N HWY 17 BUS", "S HWY 17 BUS", "HWY 17 BUS", "BUS 17"})
ATL = road({"ATLANTIC AVE"})
K = math.cos(math.radians(33.58))          # metres per degree of longitude, relative to latitude
def m(a, b): return math.hypot((a.x - b.x) * K, a.y - b.y) * 111320
OCEAN_DIR = (0.64, -0.77)                  # unit vector toward the sea (south-east), shoreline bearing about 40 degrees
def side(pt, line):
    """+1 if pt is on the ocean side of line, -1 if on the land side; and distance in metres."""
    q = nearest_points(line, pt)[0]
    dx, dy = (pt.x - q.x) * K, pt.y - q.y
    return (1 if dx * OCEAN_DIR[0] + dy * OCEAN_DIR[1] > 0 else -1), m(pt, q)
# Marsh and tidal water from OpenStreetMap (natural=wetland, natural=water except ponds), as polygons
def osm_water():
    d = J("osm.json"); polys = []
    for e in d["elements"]:
        t = e.get("tags", {})
        wet = t.get("natural") == "wetland" and t.get("wetland") not in ("swamp",)
        wat = t.get("natural") == "water" and t.get("water") not in ("pond", "reservoir", "basin", "lake", "wastewater")
        if not (wet or wat): continue
        if e["type"] == "way":
            g = e.get("geometry") or []
            if len(g) >= 4 and g[0] == g[-1]: polys.append(Polygon([(p["lon"], p["lat"]) for p in g]))
        elif e["type"] == "relation":
            lines = [LineString([(p["lon"], p["lat"]) for p in mm["geometry"]]) for mm in e.get("members", []) if mm.get("role") == "outer" and mm.get("geometry")]
            polys += list(polygonize(unary_union(lines))) if lines else []
    return unary_union([p.buffer(0) for p in polys if p.is_valid or p.buffer(0).is_valid])
WATER = osm_water()
LINE_LAT_COAST = 33.5726                    # Horry/Georgetown line where it meets the beach (TIGER county polygons)
WACC_N = max(y for g in getattr(WACC, "geoms", [WACC]) for x, y in g.coords)
def zone(pt):
    """beach = between Waccamaw Drive and the sea; middle = between Business 17 and Waccamaw Drive (or north of its end);
    inland = west of Business 17."""
    s_bus, _ = side(pt, BUS17)
    if s_bus < 0: return "inland"
    if pt.y > WACC_N: return "middle"
    s_w, d_w = side(pt, WACC)
    return "beach" if s_w > 0 else "middle"
