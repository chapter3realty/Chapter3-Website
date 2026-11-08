#!/usr/bin/env python3
"""Share of homes in FEMA's high-risk flood zone in Carolina Forest CDP, for the comparison table, by a method close to analyze.py's.
Carolina Forest CDP: Census TIGERweb, Census Designated Places layer 5 (current), GEOID 4511833 (RAW/cf-cdp-5.json).
Homes: county layer 24 parcels that intersect the CDP with land use 1xx and a building value (attributes only), located at their
county address point (layer 22, first point per PIN) or, with no address point, left out. FEMA zone: county layer 19 at that point.
Run: RAW=<scratch> python3 -I compare_flood.py <this dir>. Writes compare-flood.json."""
import sys, os, json, time, urllib.request, urllib.parse, collections
from shapely.geometry import Polygon, Point, shape
from shapely.ops import unary_union
from shapely.prepared import prep
D = sys.argv[1]; RAW = os.environ["RAW"]
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def q(url, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data, headers={"User-Agent": "Mozilla/5.0"}), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
cf = json.load(open(os.path.join(RAW, "cf-cdp-5.json")))["features"][0]["geometry"]
poly = unary_union([Polygon(r).buffer(0) for r in cf["rings"]]); P = prep(poly)
xmin, ymin, xmax, ymax = poly.bounds
env = {"geometry": "%f,%f,%f,%f" % (xmin, ymin, xmax, ymax), "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"}
def ids(layer, where):
    p = {"where": where, "returnIdsOnly": "true"}; p.update(env); return sorted(q(PA % layer, p)["objectIds"] or [])
def get(layer, oids, fields, geom):
    rows = []
    for i in range(0, len(oids), 1000):
        rows += q(PA % layer, {"objectIds": ",".join(map(str, oids[i:i+1000])), "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"})["features"]
        print(layer, i, len(rows), flush=True)
    return rows
fa = os.path.join(RAW, "cf-addr.json")
if not os.path.exists(fa):
    json.dump([dict(r["attributes"], x=r["geometry"]["x"], y=r["geometry"]["y"]) for r in get(22, ids(22, "1=1"), "PIN", True) if r.get("geometry")], open(fa, "w"))
fp = os.path.join(RAW, "cf-parcels.json")
if not os.path.exists(fp):
    json.dump([r["attributes"] for r in get(24, ids(24, "LandUseCode LIKE '1%' AND MarketImprv > 0"), "PIN,LandUseCode,LegalDescr", False)], open(fp, "w"))
ff = os.path.join(RAW, "cf-fema.json")
if not os.path.exists(ff):
    json.dump(get(19, ids(19, "1=1"), "FLD_ZONE,SFHA_TF", True), open(ff, "w"))
pts = {}
for a in json.load(open(fa)):
    if a.get("PIN") and P.contains(Point(a["x"], a["y"])): pts.setdefault(str(int(a["PIN"])), (a["x"], a["y"]))
fem = [(f["attributes"]["FLD_ZONE"], f["attributes"]["SFHA_TF"], prep(unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"]]))) for f in json.load(open(ff))]
def kind(p):
    c = p["LandUseCode"] or ""; l = (p["LegalDescr"] or "").upper()
    if c == "117": return "other"
    if c in ("107", "135") or "HPR" in l: return "condo"
    if c == "109": return "townhouse"
    if c in ("101", "102", "110", "126"): return "house"
    return "other"
c = collections.Counter(); hi = collections.Counter()
for p in json.load(open(fp)):
    pt = pts.get(str(int(p["PIN"])))
    if not pt: continue
    k = kind(p); c[k] += 1; c["all"] += 1
    if any(t == "T" and g.contains(Point(*pt)) for z, t, g in fem): hi[k] += 1; hi["all"] += 1
out = {"place": "Carolina Forest CDP (TIGERweb GEOID 4511833)", "homes_with_address_point": dict(c), "in_fema_high_risk": dict(hi),
       "pct_high_risk": {k: round(100 * hi[k] / c[k], 1) for k in c if c[k]}}
json.dump(out, open(os.path.join(D, "compare-flood.json"), "w"), indent=1); print(out)
