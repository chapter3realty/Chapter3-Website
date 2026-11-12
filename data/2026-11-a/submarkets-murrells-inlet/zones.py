"""Shared geometry for /submarkets/murrells-inlet/: the two counties, the Murrells Inlet and Garden City Census places, US 17 Business,
the US 17 bypass, the inlet's marsh (NWI estuarine wetlands, Georgetown County layer). Every input is in RAW (fetch_county.py)."""
import json, os, math
from shapely.geometry import shape, Point, LineString, Polygon
from shapely.ops import unary_union, nearest_points
RAW = os.environ["RAW"]
def J(n): return json.load(open(os.path.join(RAW, n)))
MI = shape(J("cdp2020.geojson")["features"][0]["geometry"])          # Murrells Inlet CDP 4548985 (2020)
GC = shape(J("gc-cdp2020.geojson")["features"][0]["geometry"])       # Garden City CDP 4528455 (2020)
CTY = {f["properties"]["NAME"]: shape(f["geometry"]) for f in J("counties.geojson")["features"]}
GEO, HOR = CTY["Georgetown County"], CTY["Horry County"]
K = math.cos(math.radians(33.56))
def m(a, b): return math.hypot((a.x - b.x) * K, a.y - b.y) * 111320
def groad(names):
    return unary_union([shape(f["geometry"]) for f in J("g-roads.geojson")["features"] if f["geometry"] and (f["properties"]["St_Full"] or "") in names])
def hroad(names):
    return unary_union([LineString(p) for f in J("h-roads.json") if (f["attributes"]["FULLNAME"] or "") in names for p in f["geometry"].get("paths", [])])
BUS17 = unary_union([groad({"HIGHWAY 17 BUS"}), hroad({"N HWY 17 BUS", "S HWY 17 BUS", "HWY 17 BUS", "BUS 17"})])
BYP17 = unary_union([groad({"HIGHWAY 17 BYP"}), hroad({"HWY 17 BYP", "HWY 17 BY-PASS"})])
WACC = unary_union([groad({"WACCAMAW DR", "S WACCAMAW DR", "N WACCAMAW DR"}), hroad({"N WACCAMAW DR", "S WACCAMAW DR"})])
from shapely.ops import linemerge
def _parts(line):
    g = linemerge(line) if line.geom_type == "MultiLineString" else line
    return list(getattr(g, "geoms", [g]))
def east_of(line, pt):
    """True if pt is on the east (ocean) side of a road that runs roughly north-east: the right-hand side when heading north
    along the nearest piece of the road (a 2D cross product on a 60 m piece around the nearest point)."""
    best = min(_parts(line), key=lambda l: l.distance(pt))
    d = best.project(pt); a = best.interpolate(max(d - 30 / 111000, 0)); b = best.interpolate(min(d + 30 / 111000, best.length))
    if b.y < a.y: a, b = b, a
    cross = (b.x - a.x) * (pt.y - a.y) - (b.y - a.y) * (pt.x - a.x)
    return cross < 0
ZIP = {f["properties"]["ZIPCODE"]: shape(f["geometry"]).buffer(0) for f in J("h-zip.geojson")["features"]}
Z29576 = ZIP["29576"]
