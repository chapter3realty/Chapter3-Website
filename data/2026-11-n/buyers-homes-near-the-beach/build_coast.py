"""Ocean shoreline of the Grand Strand from the US Census TIGER/Line 2024 coastline (public domain),
https://www2.census.gov/geo/tiger/TIGER2024/COASTLINE/tl_2024_us_coastline.zip , clipped to the Horry and
Georgetown County coast (lon -79.30..-78.53, lat 33.30..33.87). Run: python3 -I build_coast.py <tiger .shp> <datadir> -> coast.geojson"""
import json, sys, shapefile
from shapely.geometry import LineString, box, mapping
from shapely.ops import linemerge, unary_union
r = shapefile.Reader(sys.argv[1]); B = box(-79.30, 33.30, -78.53, 33.87)
parts = []
for sh in r.shapes():
    if not B.intersects(box(*sh.bbox)): continue
    pts = sh.points; idx = list(sh.parts) + [len(pts)]
    for a, b in zip(idx[:-1], idx[1:]):
        g = LineString(pts[a:b]).intersection(B)
        if not g.is_empty: parts.append(g)
m = linemerge(unary_union(parts))
geoms = list(m.geoms) if hasattr(m, "geoms") else [m]
fc = {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {"n": i, "pts": len(g.coords)}, "geometry": mapping(g)} for i, g in enumerate(geoms)]}
json.dump(fc, open(sys.argv[2] + "/coast.geojson", "w"))
for i, g in enumerate(geoms): print(i, len(g.coords), [round(c, 4) for c in g.bounds])
