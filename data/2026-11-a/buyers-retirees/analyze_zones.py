"""Which SCEMD hurricane evacuation zone (scemd.org/json/evac_zones.json, the polygons behind scemd.org Know Your Zone,
file Last-Modified 2024-04-28) holds each 55+ community's reference point, and the county HazardsMap answer for comparison.
Run: RAW=<scratch> python3 -I analyze_zones.py <datadir>. Reads raw/scemd-evac-zones.json and zones.json; writes zones-findings.json."""
import sys, json, os
D = sys.argv[1]
ZF = os.path.join(os.environ.get("RAW", os.path.join(D, "raw")), "scemd-evac-zones.json")  # 7 MB; kept out of the repo. Set RAW to a scratch folder.
if not os.path.exists(ZF):
    import subprocess; subprocess.run(["curl", "-sS", "-m", "300", "-A", "Mozilla/5.0", "-o", ZF, "https://www.scemd.org/json/evac_zones.json?v=1.2"], check=True)
Z = json.load(open(ZF))["features"]
H = json.load(open(os.path.join(D, "zones.json")))
ORIG = {"Del Webb at Grande Dunes": (-78.842661, 33.749305), "Del Webb North Myrtle Beach": (-78.700908, 33.821769),
        "Myrtle Trace": (-78.996618, 33.778502), "Seasons at Prince Creek West": (-79.07094, 33.586369)}
def rings(g):
    if g["type"] == "Polygon": return [g["coordinates"]]
    if g["type"] == "MultiPolygon": return g["coordinates"]
    if g["type"] == "GeometryCollection": return [p for gg in g["geometries"] for p in rings(gg)]
    return []
def pip(x, y, ring):
    c = False
    for i in range(len(ring) - 1):
        (x1, y1), (x2, y2) = ring[i][:2], ring[i + 1][:2]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
def inpoly(x, y, poly): return pip(x, y, poly[0]) and not any(pip(x, y, h) for h in poly[1:])
out = {}
for name, (x, y) in ORIG.items():
    hits = [f["properties"]["county"] + " " + f["properties"]["name"] for f in Z if any(inpoly(x, y, p) for p in rings(f["geometry"]))]
    out[name] = {"point": [x, y], "scemd_zone": hits or ["none"],
                 "county_hazardsmap_zone": [a.get("Zone") for a in H[name]["2"]["attributes"]] or ["none"],
                 "fema_zone_at_point": [a.get("FLD_ZONE") for a in H[name]["8"]["attributes"]]}
    print(name, out[name])
json.dump(out, open(os.path.join(D, "zones-findings.json"), "w"), indent=1)
# Every home parcel: centroid of its first ring (parcel layer 24, outSR 4326), same parcel sets as pull_parcels.py.
import urllib.parse, subprocess, collections, time
sys.path.insert(0, D)
SETS = json.load(open(os.path.join(D, "raw", "parcels-55plus.json")))["sets"]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
GD_BOX = {"geometry": "-78.86,33.735,-78.82,33.765", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"}
for name, where in SETS.items():
    p = dict(where=where, outFields="PIN,LandUseCode,MarketImprv", returnGeometry="true", outSR="4326", f="json", resultRecordCount=2000)
    if name == "Del Webb at Grande Dunes": p.update(GD_BOX)
    r = subprocess.run(["curl", "-sS", "-m", "300", "--data", urllib.parse.urlencode(p), Q], capture_output=True, text=True).stdout
    feats = [f for f in json.loads(r)["features"] if str(f["attributes"]["LandUseCode"]).startswith("1") and (f["attributes"]["MarketImprv"] or 0) > 0]
    cnt = collections.Counter()
    for f in feats:
        ring = f["geometry"]["rings"][0]; x = sum(p[0] for p in ring) / len(ring); y = sum(p[1] for p in ring) / len(ring)
        hits = [z["properties"]["name"] for z in Z if z["properties"]["county"] == "Horry" and any(inpoly(x, y, pp) for pp in rings(z["geometry"]))]
        cnt[",".join(hits) or "none"] += 1
    out[name]["home_parcels_by_scemd_zone"] = dict(cnt); print(name, dict(cnt), flush=True)
json.dump(out, open(os.path.join(D, "zones-findings.json"), "w"), indent=1)
