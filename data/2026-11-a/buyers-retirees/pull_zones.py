"""Hurricane evacuation zone, storm surge layer and FEMA flood zone at each 55+ community's reference point and at every home
parcel's centroid (Horry County HazardsMap layers 2 and 3; county parcel layer 19 flood zones are checked at the reference point).
Run: python3 -I pull_zones.py <datadir>. Writes zones.json."""
import sys, json, os, time, subprocess, urllib.parse
D = sys.argv[1]
HZ = "https://www.horrycounty.org/gisweb/rest/services/Public/HazardsMap/MapServer/%d/query"
def get(url, params):
    u = url + "?" + urllib.parse.urlencode(dict(params, f="json"))
    for i in range(4):
        try: return json.loads(subprocess.run(["curl", "-sS", "-m", "120", u], capture_output=True, text=True, check=True).stdout), u
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(3)
ORIG = {"Del Webb at Grande Dunes": (-78.842661, 33.749305), "Del Webb North Myrtle Beach": (-78.700908, 33.821769),
        "Myrtle Trace": (-78.996618, 33.778502), "Seasons at Prince Creek West": (-79.07094, 33.586369)}
out = {}
for name, (x, y) in ORIG.items():
    out[name] = {}
    for lyr in (2, 3, 8):
        d, u = get(HZ % lyr, {"geometry": f"{x},{y}", "geometryType": "esriGeometryPoint", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "returnGeometry": "false"})
        out[name][str(lyr)] = {"url": u, "attributes": [f["attributes"] for f in d.get("features", [])]}
    print(name, json.dumps(out[name])[:600], flush=True)
json.dump(out, open(os.path.join(D, "zones.json"), "w"), indent=1)
