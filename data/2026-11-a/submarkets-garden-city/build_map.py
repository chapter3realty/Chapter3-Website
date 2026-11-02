#!/usr/bin/env python3
"""Map layers and strip measurements for /submarkets/garden-city/.
Run: RAW=<scratch> python3 -I build_map.py <datadir>. Writes map-layers.geojson (simplified, no parcels or addresses) and strip.json."""
import sys, os, json, math, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import shape, mapping, LineString, Point, box
from shapely.ops import unary_union, split
D = sys.argv[1]
osm = J("osm.json")
W = unary_union([LineString([(p["lon"], p["lat"]) for p in e["geometry"]]) for e in osm["elements"] if "Waccamaw Drive" in e.get("tags", {}).get("name", "")])
GT, HC = CTY["Georgetown County"], CTY["Horry County"]
def km(g):  # length in km of a lon/lat line at this latitude
    return sum(math.hypot((a[0] - b[0]) * K, a[1] - b[1]) * 111.32 for l in getattr(g, "geoms", [g]) for a, b in zip(l.coords, l.coords[1:]))
w_gt = W.intersection(GT); w_hc = W.intersection(HC)
pier = Point(-78.99740, 33.57608)   # OpenStreetMap way 164853658, centre
line = GT.boundary.intersection(HC.boundary).intersection(box(-79.06, 33.56, -78.95, 33.58))
S = {"waccamaw_dr_miles_horry": round(km(w_hc) / 1.609344, 1), "waccamaw_dr_miles_georgetown": round(km(w_gt) / 1.609344, 1),
     "waccamaw_dr_south_end_lat": round(min(y for l in W.geoms for x, y in l.coords), 5), "waccamaw_dr_north_end_lat": round(max(y for l in W.geoms for x, y in l.coords), 5),
     "pier_to_county_line_miles": round(m(pier, nearest_points(line, pier)[0]) / 1609.344, 2),
     "county_line_at_beach_lat": LINE_LAT_COAST}
fema = [f for f in J("fema.json") if f.get("geometry") and f["attributes"]["FLD_ZONE"] in ("VE", "AE")]
clip = box(-79.04, 33.565, -78.97, 33.60)
feats = []
for z in ("VE", "AE"):
    g = unary_union([shape({"type": "Polygon", "coordinates": f["geometry"]["rings"]}).buffer(0) for f in fema if f["attributes"]["FLD_ZONE"] == z]).intersection(clip).simplify(0.00005)
    feats.append({"type": "Feature", "properties": {"layer": "fema", "zone": z, "note": "Horry County only (county GIS layer 19)"}, "geometry": mapping(g)})
feats.append({"type": "Feature", "properties": {"layer": "cdp", "name": "Garden City CDP (2020 Census)"}, "geometry": mapping(CDP.simplify(0.00005))})
feats.append({"type": "Feature", "properties": {"layer": "county_line"}, "geometry": mapping(line.simplify(0.00005))})
feats.append({"type": "Feature", "properties": {"layer": "road", "name": "Waccamaw Drive"}, "geometry": mapping(W.simplify(0.00003))})
feats.append({"type": "Feature", "properties": {"layer": "road", "name": "Business 17"}, "geometry": mapping(BUS17.intersection(box(-79.06, 33.54, -78.96, 33.62)).simplify(0.00003))})
feats.append({"type": "Feature", "properties": {"layer": "road", "name": "Atlantic Avenue"}, "geometry": mapping(ATL.simplify(0.00003))})
feats.append({"type": "Feature", "properties": {"layer": "point", "name": "Garden City Pier"}, "geometry": mapping(pier)})
json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(D, "map-layers.geojson"), "w"))
json.dump(S, open(os.path.join(D, "strip.json"), "w"), indent=1); print(S)
