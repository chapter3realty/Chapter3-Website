"""Parcel center points (WGS84) for matched sales, and Census TIGERweb place polygons for Horry County.
Usage: python3 -I fetch_points.py <datadir>"""
import sys, json, os, time, urllib.request, urllib.parse
D = sys.argv[1]
# Raw downloads (deed index rows and parcel records carry owner names) stay outside the repo: set RAW, default <datadir>/raw.
RAW = os.environ.get("RAW", os.path.join(D, "raw")); os.makedirs(RAW, exist_ok=True)
d = json.load(open(os.path.join(D, "out-of-state-buyers.json")))
pins = sorted({x["pin"] for x in d["sales"] if x["owner_is_grantee"]})
def post(url, params):
    data = urllib.parse.urlencode(params).encode()
    for i in range(5):
        try:
            r = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=180).read())
            if "error" in r: raise Exception(r["error"])
            return r
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
f = os.path.join(RAW, "points.json")
if not os.path.exists(f):
    pts = {}
    for i in range(0, len(pins), 150):
        r = post("https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query",
                 {"where": "PIN IN (" + ",".join(pins[i:i+150]) + ")", "outFields": "PIN", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00005", "f": "json"})
        for ft in r["features"]:
            rings = (ft.get("geometry") or {}).get("rings") or []
            if not rings: continue
            ring = rings[0]
            pts[str(int(ft["attributes"]["PIN"])).zfill(11)] = [sum(p[0] for p in ring) / len(ring), sum(p[1] for p in ring) / len(ring)]
        print(i, len(pts), flush=True)
    json.dump(pts, open(f, "w"))
f = os.path.join(RAW, "places.json")
if not os.path.exists(f):
    out = []
    for layer in (4, 5):
        r = post(f"https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/{layer}/query",
                 {"where": "STATE='45'", "geometry": "-79.35,33.45,-78.5,34.25", "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects",
                  "outFields": "NAME,BASENAME,LSADC,GEOID", "returnGeometry": "true", "outSR": "4326", "f": "json"})
        out += [{"name": ft["attributes"]["NAME"], "geoid": ft["attributes"]["GEOID"], "layer": layer, "rings": ft["geometry"]["rings"]} for ft in r["features"]]
    json.dump(out, open(f, "w")); print([o["name"] for o in out])
