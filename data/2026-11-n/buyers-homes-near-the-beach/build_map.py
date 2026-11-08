"""Layers for the page's map of the beach towns: the ocean shoreline (TIGER 2024), lines a quarter, a half and one mile
inland from it, town limits along the coast (Horry County GIS layer 31), and the SCDES public beach access points.
Run: RAW=<scratch> python3 -I build_map.py <datadir> -> map-layers.geojson (public geography only; no homes)."""
import json, os, sys, math
from shapely.geometry import shape, mapping, Point
from shapely.ops import transform
RAW = os.environ["RAW"]; D = sys.argv[1]
C = math.cos(math.radians(33.65))
fwd = lambda x, y, z=None: ((x + 79.0) * 69.17 * C, (y - 33.65) * 69.0)
inv = lambda x, y, z=None: (x / (69.17 * C) - 79.0, y / 69.0 + 33.65)
coast_ll = shape(json.load(open(D + "/coast.geojson"))["features"][0]["geometry"]); coast = transform(fwd, coast_ll)
feats = [{"type": "Feature", "properties": {"layer": "shore"}, "geometry": mapping(coast_ll.simplify(0.0002))}]
land_side = transform(fwd, Point(-78.95, 33.75))   # a point inland, to pick the land side of each offset line
for mi in (0.25, 0.5, 1.0):
    for side in ("left", "right"):
        off = coast.offset_curve(mi if side == "left" else -mi, join_style=2)
        if off.is_empty: continue
        if off.distance(land_side) < coast.distance(land_side):
            feats.append({"type": "Feature", "properties": {"layer": "band", "miles": mi}, "geometry": mapping(transform(inv, off).simplify(0.0003))})
NAMES = {"NORTH MYRTLE BEACH": "North Myrtle Beach", "ATLANTIC BEACH": "Atlantic Beach", "BRIARCLIFFE": "Briarcliffe Acres", "MYRTLE BEACH": "Myrtle Beach", "SURFSIDE BEACH": "Surfside Beach"}
for f in json.load(open(os.path.join(RAW, "towns.json"))):
    name = NAMES.get(f["attributes"].get("NAME"))
    if not name: continue
    from shapely.geometry import Polygon
    from shapely.ops import unary_union
    rings = [Polygon(r).buffer(0) for r in f["geometry"]["rings"] if len(r) > 3]
    g = rings[0]
    for r in rings[1:]: g = g.symmetric_difference(r)   # outer rings add, inner rings (holes) cut
    g = g.simplify(0.0003)
    feats.append({"type": "Feature", "properties": {"layer": "town", "name": name}, "geometry": mapping(g)})
for x in json.load(open(D + "/raw/scdes-access-points.json"))["features"]:
    feats.append({"type": "Feature", "properties": {"layer": "access"}, "geometry": {"type": "Point", "coordinates": [round(x["geometry"]["x"], 5), round(x["geometry"]["y"], 5)]}})
json.dump({"type": "FeatureCollection", "features": feats}, open(D + "/map-layers.geojson", "w"))
import collections; print(collections.Counter(f["properties"]["layer"] for f in feats), [f["properties"].get("name") for f in feats if f["properties"]["layer"] == "town"])
