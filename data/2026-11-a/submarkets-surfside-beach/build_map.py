#!/usr/bin/env python3
"""Map layers for /submarkets/surfside-beach/: the town's zoning districts drawn from its own zoning map (georef_zoning.py),
grouped by what they allow for nightly rentals, the town limits (county layer 31), Ocean Boulevard and US 17 Business /
US 17 (county layer 18), the pier, and the Ocean Lakes parent parcel (county layer 24, PIN 45900000325).
Also counts town homes and active listings by group. No parcels, addresses or listing points are written.
Run: RAW=<scratch> python3 -I build_map.py <datadir>. Writes map-layers.geojson and map-counts.json."""
import sys, os, json, urllib.request, urllib.parse, collections
from shapely.geometry import shape, mapping, Point, LineString
from shapely.ops import unary_union
RAW = os.environ["RAW"]; D = sys.argv[1]
J = lambda n: json.load(open(os.path.join(RAW, n)))
GROUP = {"R3": "nightly", "C3": "nightly", "R1": "no_nightly", "R2": "no_nightly"}
town = shape(J("town-limits.geojson")["features"][0]["geometry"])
z = collections.defaultdict(list)
for f in J("zoning-polys.geojson")["features"]:
    z[GROUP.get(f["properties"]["zone"], "other")].append(shape(f["geometry"]))
feats = []
LABEL = {"nightly": "R3 and C3: nightly rentals allowed", "no_nightly": "R1 and R2: no rentals under 30 days", "other": "Other districts (PD, C1, C2, C4, PL, MP): check the parcel"}
for k, gs in z.items():
    g = unary_union(gs).buffer(0.00002).buffer(-0.00002).intersection(town.buffer(0.0003)).simplify(0.00003)
    feats.append({"type": "Feature", "properties": {"layer": "zoning", "group": k, "label": LABEL[k]}, "geometry": mapping(g)})
feats.append({"type": "Feature", "properties": {"layer": "town_limits", "name": "Town of Surfside Beach (county layer 31)"}, "geometry": mapping(town.simplify(0.00003))})
roads = collections.defaultdict(list)
for f in J("roads.json"):
    nm = (f["attributes"].get("FULLNAME") or "").upper()
    key = "Ocean Boulevard" if nm in ("N OCEAN BLVD", "S OCEAN BLVD") else ("US 17 Business" if "17 BUS" in nm else ("US 17" if nm in ("HWY 17", "N HWY 17", "S HWY 17", "US HWY 17", "S KINGS HWY", "N KINGS HWY", "HWY 17 BYP", "US HWY 17 BYP") else None))
    if key:
        for p in f["geometry"]["paths"]: roads[key].append(LineString(p))
for k, ls in roads.items():
    feats.append({"type": "Feature", "properties": {"layer": "road", "name": k}, "geometry": mapping(unary_union(ls).simplify(0.00003))})
feats.append({"type": "Feature", "properties": {"layer": "poi", "name": "Surfside Beach Pier", "src": "OSM/Nominatim, pull_drives.py"}, "geometry": {"type": "Point", "coordinates": [-78.9717534, 33.6049921]}})
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
r = json.loads(urllib.request.urlopen(urllib.request.Request(U, data=urllib.parse.urlencode({"where": "PIN = 45900000325", "outFields": "Acreage", "returnGeometry": "true", "outSR": "4326", "f": "json"}).encode()), timeout=300).read())
ol = unary_union([shape({"type": "Polygon", "coordinates": x["geometry"]["rings"]}).buffer(0) for x in r["features"]])
feats.append({"type": "Feature", "properties": {"layer": "ocean_lakes", "name": "Ocean Lakes Family Campground (county parcel 45900000325, outside the town)", "acres": r["features"][0]["attributes"]["Acreage"]}, "geometry": mapping(ol.simplify(0.00003))})
json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(D, "map-layers.geojson"), "w"))
H = J("parcel-zones.json"); C = collections.Counter(GROUP.get(h["zone"], "other") for h in H)
L = J("listings-ssb.json"); lc = collections.Counter()
for h in L["homes"].values():
    pt = Point(h["lng"], h["lat"])
    if not town.contains(pt): lc["outside_town"] += 1; continue
    g = "other"
    for k, gs in z.items():
        if any(s.contains(pt) for s in gs): g = k; break
    lc[g] += 1
out = {"homes_by_group": dict(C), "listings_by_group": dict(lc), "listings_pulled": L["pulled"],
       "ocean_lakes_parcel_inside_town": town.intersects(ol), "ocean_lakes_centroid": [round(ol.centroid.x, 5), round(ol.centroid.y, 5)],
       "ocean_lakes_north_of_town_north_edge": ol.centroid.y > town.bounds[3] - 0.003}
json.dump(out, open(os.path.join(D, "map-counts.json"), "w"), indent=1); print(json.dumps(out, indent=1)); print([f["properties"] for f in feats])
