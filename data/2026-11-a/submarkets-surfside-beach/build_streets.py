"""Streets for the rental map on /submarkets/surfside-beach/ (fix round 1, 2026-11-04).
Reads the county road centerlines already pulled for this page (county GIS layer 18, raw roads.json,
the same pull build_map.py uses) and writes map-streets.geojson: every named street inside the town,
simplified, plus a label point and direction for the streets the map names. Also prints which streets
the inland edge of the nightly-rental band follows (ledger row 45).
Run: python3 -I build_streets.py <raw dir> <data dir>."""
import json, sys, math, collections
from shapely.geometry import shape, LineString, Point, mapping
from shapely.ops import unary_union, linemerge
import shapely
RAW, D = sys.argv[1], sys.argv[2]
L = json.load(open(D + "/map-layers.geojson"))
geo = {f["properties"].get("group") or f["properties"]["layer"]: shape(f["geometry"]) for f in L["features"] if f["properties"]["layer"] in ("zoning", "town_limits")}
lat0 = 33.61; kx = math.cos(math.radians(lat0)) * 111320; ky = 110574
fwd = lambda g: shapely.transform(g, lambda c: [[(x + 78.975) * kx, (y - lat0) * ky] for x, y in c])
back = lambda g: shapely.transform(g, lambda c: [[x / kx - 78.975, y / ky + lat0] for x, y in c])
town = fwd(geo["town_limits"]); night = fwd(geo["nightly"]); no = fwd(geo["no_nightly"])
by = collections.defaultdict(list)
for f in json.load(open(RAW + "/roads.json")):
    nm = f["attributes"]["FULLNAME"]
    if not nm: continue
    for p in f["geometry"]["paths"]:
        ls = fwd(LineString(p))
        if town.buffer(20).intersects(ls): by[nm].append(ls)
# Labels: street name on the map, and where along the street (share of its length inside the town).
LABELS = {"N OCEAN BLVD": ("Ocean Blvd", 0.3), "DOGWOOD DR N": ("Dogwood Dr N", 0.8), "LAKESIDE DR": ("Lakeside Dr", 0.5),
          "POPLAR DR N": ("Poplar Dr N", 0.5), "POPLAR DR S": ("Poplar Dr S", 0.5), "SURFSIDE DR": ("Surfside Dr", 0.62),
          "16TH AVE N": ("16th Ave N", 0.65), "8TH AVE N": ("8th Ave N", 0.3), "6TH AVE S": ("6th Ave S", 0.45), "13TH AVE S": ("13th Ave S", 0.45)}
feats = []
for nm, ls in sorted(by.items()):
    u = unary_union(ls).intersection(town.buffer(20))
    if u.is_empty: continue
    m = linemerge(u) if u.geom_type == "MultiLineString" else u
    props = {"layer": "street", "name": nm}
    if nm in LABELS:
        text, at = LABELS[nm]
        longest = max(m.geoms, key=lambda g: g.length) if m.geom_type == "MultiLineString" else m
        a = longest.interpolate(at, normalized=True); b = longest.interpolate(min(1, at + 0.04), normalized=True)
        if a.distance(b) < 1: b = longest.interpolate(max(0, at - 0.04), normalized=True)
        A, B = back(a), back(b)
        props.update({"label": text, "label_at": [round(A.x, 6), round(A.y, 6)], "label_dir": [round(B.x, 6), round(B.y, 6)]})
    g = back(m.simplify(4))
    feats.append({"type": "Feature", "properties": props, "geometry": shapely.geometry.mapping(g)})
missing = [k for k in LABELS if not any(f["properties"]["name"] == k for f in feats)]
assert not missing, missing
json.dump({"type": "FeatureCollection", "note": "County road centerlines (layer 18) inside the Town of Surfside Beach, simplified to 4 m. build_streets.py.", "features": feats},
          open(D + "/map-streets.geojson", "w"), separators=(",", ":"))
# Row 45: the streets the band's inland edge follows, walking the edge every 60 m.
edge = night.boundary.intersection(no.buffer(12))
ax = (math.cos(0.85), math.sin(0.85)); pier = fwd(Point(-78.9717534, 33.6049921))
along = lambda p: (p.x - pier.x) * ax[0] + (p.y - pier.y) * ax[1]
pts = []
for gm in (edge.geoms if hasattr(edge, "geoms") else [edge]):
    n = max(1, int(gm.length // 60)); pts += [gm.interpolate(i / n, normalized=True) for i in range(n + 1)]
allr = [(nm, unary_union(ls)) for nm, ls in by.items()]
cnt = collections.Counter()
for p in pts:
    nm, d = min(((nm, u.distance(p)) for nm, u in allr), key=lambda t: t[1])
    if d < 40 and "AVE" not in nm: cnt[(nm, "north of the pier" if along(p) > 0 else "south of the pier")] += 1
out = {"edge_with_R1R2_m": round(edge.length), "points": len(pts), "nearest_street_counts": {f"{k[0]} ({k[1]})": v for k, v in cnt.most_common()}}
for nm in ("N OCEAN BLVD", "DOGWOOD DR N", "LAKESIDE DR", "WILLOW DR S", "DOGWOOD DR S"):
    u = unary_union(by[nm]); out[nm] = {"in_band_m": round(u.intersection(night).length), "in_R1R2_m": round(u.intersection(no).length)}
json.dump(out, open(D + "/band-edge-streets.json", "w"), indent=1); print(json.dumps(out, indent=1))
