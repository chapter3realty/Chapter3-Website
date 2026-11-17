"""How many of the condos for sale (MLS city Surfside Beach) sit inside the Town of Surfside Beach, and which MLS names are inside or outside.
Pins from the site's map API, each point asked of the county Municipalities layer 31 (NAME). Kept: counts by municipality, by MLS name group. Not kept: a point, address, MLS number.
Run: python3 -I town_limits.py <this dir>. Writes town-limits.json."""
import json, sys, urllib.request, urllib.parse, collections, datetime
H = {"User-Agent": "Mozilla/5.0"}
def get(u, q): return json.load(urllib.request.urlopen(urllib.request.Request(u + "?" + urllib.parse.urlencode(q), headers=H), timeout=90))
pins = {}
def sl(lo, hi):
    d = get("https://chapter3realty.com/homes/api/map", {"type": "condo", "city": "Surfside Beach", "min": lo, "max": hi})
    if len(d["pins"]) >= d["total"] or hi - lo <= 1:
        for p in d["pins"]: pins[p["mls"]] = (p["lat"], p["lng"], p["price"])
        return
    m = (lo + hi) // 2; sl(lo, m); sl(m + 1, hi)
sl(0, 20000000)
cards = {}
for m in pins:
    c = get("https://chapter3realty.com/homes/api/lookup", {"mls": m}).get("facts") or {}
    cards[m] = c.get("subdivision") or "?"
M = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/31/query"
res = {}
for m, (la, ln, _) in pins.items():
    r = get(M, {"geometry": "%f,%f" % (ln, la), "geometryType": "esriGeometryPoint", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "outFields": "NAME", "returnGeometry": "false", "f": "json"})
    res[m] = r["features"][0]["attributes"]["NAME"] if r.get("features") else "unincorporated"
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "n": len(pins), "by_town": dict(collections.Counter(res.values()))}
g = collections.defaultdict(collections.Counter)
for m in pins: g[cards[m]][res[m]] += 1
out["by_name"] = {k: dict(v) for k, v in sorted(g.items(), key=lambda t: -sum(t[1].values()))}
json.dump(out, open(sys.argv[1] + "/town-limits.json", "w"), indent=1); print(json.dumps(out)[:2500])
