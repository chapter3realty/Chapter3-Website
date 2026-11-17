"""Flood zone under every condo for sale in Myrtle Beach (MLS city), in aggregate. The map API's pins (price slices, as in pull_listings.py) give a
point for each listing; FEMA NFHL MapServer layer 28 gives FLD_ZONE and SFHA_TF at that point. Kept: counts by zone, by waterfront tag.
Not kept: a point, address or MLS number. Run: python3 -I pull_flood.py <this dir>. Writes flood.json."""
import json, os, sys, time, urllib.request, urllib.parse, datetime, collections
from concurrent.futures import ThreadPoolExecutor
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/"
H = {"User-Agent": "Mozilla/5.0"}
def get(u, p):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u + "?" + urllib.parse.urlencode(p), headers=H), timeout=90))
        except Exception: time.sleep(2 + 2 * i)
    return None
base = {"type": "condo", "city": "Myrtle Beach"}; pins = {}
def sl(lo, hi):
    d = get(BASE + "map", dict(base, min=lo, max=hi))
    if len(d["pins"]) >= d["total"] or hi - lo <= 1:
        for p in d["pins"]: pins[p["mls"]] = (p["lat"], p["lng"], p.get("tag"), p["price"])
        return
    m = (lo + hi) // 2; sl(lo, m); sl(m + 1, hi)
sl(0, 20000000)
F = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query"
def z(v):
    r = get(F, {"geometry": "%f,%f" % (v[1], v[0]), "geometryType": "esriGeometryPoint", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "FLD_ZONE,SFHA_TF", "returnGeometry": "false", "f": "json"})
    if r is None: return None
    f = r.get("features") or []
    return (f[0]["attributes"]["FLD_ZONE"], f[0]["attributes"]["SFHA_TF"]) if f else ("none", "?")
vals = list(pins.values())
with ThreadPoolExecutor(4) as ex: res = list(ex.map(z, vals))
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "pins": len(vals), "failed": sum(r is None for r in res)}
def tally(f):
    c = collections.Counter(); 
    for v, r in zip(vals, res):
        if r is not None and f(v): c[r[0] + (":SFHA" if r[1] == "T" else "")] += 1
    return dict(c)
out["all"] = tally(lambda v: True); out["waterfront_tag"] = tally(lambda v: v[2] == "Waterfront"); out["not_waterfront_tag"] = tally(lambda v: v[2] != "Waterfront")
sf = lambda f: sum(1 for v, r in zip(vals, res) if r and r[1] == "T" and f(v))
out["in_high_risk"] = {"all": sf(lambda v: True), "waterfront": sf(lambda v: v[2] == "Waterfront"), "not_waterfront": sf(lambda v: v[2] != "Waterfront")}
json.dump(out, open(D + "/flood.json", "w"), indent=1); print(json.dumps(out, indent=1)[-900:])
