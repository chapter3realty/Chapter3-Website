#!/usr/bin/env python3
"""Map layers for the county-line map of /submarkets/murrells-inlet/ (simplified, WGS84). Run: RAW=<scratch> python3 -I build_map.py <datadir>.
Writes map-layers.geojson with: the county line inside the view; the ZIP 29576 outline; the Garden City Census place; the Census's Murrells Inlet;
the four parts drawn as the union of 60 m circles around each home's inside point (homes.json, analyze.py), simplified; US 17 Business,
the US 17 bypass and SC 707; the inlet's shellfish grounds (SCDNR); the four county boat landings; the MarshWalk; golf courses as points."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import box, mapping, Point, shape
from shapely.ops import unary_union
D = sys.argv[1]
VIEW = box(-79.11, 33.505, -78.97, 33.65)
feats = []
def add(g, **p):
    g = g.intersection(VIEW)
    if not g.is_empty: feats.append({"type": "Feature", "properties": p, "geometry": mapping(g.simplify(0.00015))})
add(GEO.boundary.intersection(HOR.buffer(0.0005)), layer="county_line", label="Horry County / Georgetown County line")
add(Z29576.boundary, layer="zip_29576", label="ZIP 29576 (Murrells Inlet mailing address)")
add(GC, layer="garden_city_cdp", label="Garden City (its own guide)")
add(MI, layer="mi_cdp", label="Census Murrells Inlet")
H = json.load(open(os.path.join(RAW, "homes.json")))
LAB = {("horry", "west"): "Horry side", ("georgetown", "west"): "Georgetown, west of the bypass",
       ("georgetown", "old_road"): "Georgetown, between the roads", ("georgetown", "inlet"): "Georgetown, creek side"}
for (c, p), lab in LAB.items():
    pts = [Point(h["x"], h["y"]).buffer(0.0006) for h in H if h["county"] == c and h["part"] == p]
    add(unary_union(pts).buffer(0.0003).buffer(-0.0003), layer="part", part=f"{c}/{p}", label=lab, homes=len(pts))
add(BUS17, layer="road", label="US 17 Business"); add(BYP17, layer="road", label="US 17 bypass")
add(hroad({"HWY 707"}), layer="road", label="SC 707")
for f in J("shell-RecreationalUpdate092423.geojson")["features"]:
    add(shape(f["geometry"]), layer="shellfish", label=f["properties"]["map_title"])
P = json.load(open(os.path.join(D, "places.json")))["places"]
for r in P:
    if (r["kind"] == "county boat landing" and r["zip29576"]) or (r["kind"] == "golf_course" and r["zip29576"]) or r["name"] in ("The Murrells Inlet Marsh Walk", "Tidelands Waccamaw Community Hospital"):
        feats.append({"type": "Feature", "properties": {"layer": r["kind"].replace(" ", "_"), "label": r["name"]}, "geometry": {"type": "Point", "coordinates": [r["lon"], r["lat"]]}})
feats.append({"type": "Feature", "properties": {"layer": "hospital", "label": "Tidelands Waccamaw Community Hospital"}, "geometry": {"type": "Point", "coordinates": [-79.0433811, 33.5605964]}})
feats.append({"type": "Feature", "properties": {"layer": "park", "label": "Huntington Beach State Park entrance"}, "geometry": {"type": "Point", "coordinates": [-79.07684, 33.50898]}})
json.dump({"type": "FeatureCollection", "view": VIEW.bounds, "features": feats}, open(os.path.join(D, "map-layers.geojson"), "w"))
print(len(feats), os.path.getsize(os.path.join(D, "map-layers.geojson")))
