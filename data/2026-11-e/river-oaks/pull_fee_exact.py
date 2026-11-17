"""Monthly HOA fee by bisection on the site's public filter hoaMax (map API, https://chapter3realty.com/homes/api/map, subdivision=River Oaks / Fairways / Landing),
per MLS subdivision group of pull_listings.py. The card has no fee, so: lowest fee = smallest T where one listing of the group is at or under T; highest = smallest T where all are.
Also hoa=0 (listing says no HOA). Kept: per group count and fee range in whole dollars; no listing. Run: RAW=<scratch> python3 -I pull_fee_exact.py <this dir>. Merges "fee_exact" into listings.json."""
import json, os, sys, time, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
D, RAW = sys.argv[1], os.environ["RAW"]
L = json.load(open(D + "/listings.json")); C = json.load(open(os.path.join(RAW, "county.json")))
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
shape = unary_union([poly(a["rings"]) for p, a in C["parcels"].items() if (a["LandUseCode"] or "") != "113" and a["lotSqft"] < 400000]).buffer(0.0006)
BASE = "https://chapter3realty.com/homes/api/map?"; UA = {"User-Agent": "Mozilla/5.0"}; calls = []
def pins(sub, **kw):
    u = BASE + urllib.parse.urlencode(dict(subdivision=sub, **kw)); calls.append(u); time.sleep(1.5)
    return [p for p in json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=90))["pins"] if p.get("lat") and (shape.contains(Point(p["lng"], p["lat"])) or "MYRTLE-BEACH" in p["url"].upper() and p["lat"] < 33.70 and 33.6 < p["lat"])]
base = {}
for sub in ("River Oaks", "Fairways", "Landing"):
    for p in pins(sub): base[p["url"]] = p
# group by subdivision via the card
def sub_of(url):
    r = json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/lookup?mls=" + url.split("/")[2].split("-")[0], headers=UA), timeout=60))["facts"]; time.sleep(.3)
    return r.get("subdivision") or ""
G = {}
for u in base:
    s = sub_of(u)
    if "RIVER OAKS" in s.upper() and "PAWLEYS" not in s.upper(): G.setdefault(s, set()).add(u)
G["condos (River Oaks Condos + Fairways)"] = G.get("RIVER OAKS CONDOS", set()) | G.get("The Fairways At River Oaks", set())
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "groups": {}}
for name, ids in G.items():
    n = len(ids)
    if n < 1: continue
    sub = {"RIVER OAKS CONDOS": "River Oaks Condos", "The Fairways At River Oaks": "Fairways At River Oaks", "Landing at River Oaks": "Landing at River Oaks", "Oakmont at River Oaks": "Oakmont", "River Oaks Cottages": "River Oaks Cottages"}.get(name, "River Oaks")
    def cnt(t, s=sub): return len({p["url"] for p in pins(s, hoaMax=t)} & ids)
    if name.startswith("condos"):
        def cnt(t): return len({p["url"] for s in ("River Oaks Condos", "Fairways At River Oaks") for p in pins(s, hoaMax=t)} & ids)
    no = len({p["url"] for p in pins(sub if not name.startswith("condos") else "River Oaks", hoa="0")} & ids)
    top = 2000
    if cnt(top) < n: out["groups"][name] = {"n": n, "note": "some above %d or no fee" % top, "at_top": cnt(top), "hoa0": no}; print(name, out["groups"][name]); continue
    a, z = -1, top
    while z - a > 1:
        m = (a + z) // 2
        if cnt(m) >= 1: z = m
        else: a = m
    low = z; a, z = low - 1, top
    while z - a > 1:
        m = (a + z) // 2
        if cnt(m) >= n: z = m
        else: a = m
    out["groups"][name] = {"n": n, "lowest": low, "highest": z, "says_no_hoa": no}; print(name, out["groups"][name], flush=True)
out["calls"] = calls; L["fee_exact"] = out
json.dump(L, open(D + "/listings.json", "w"), indent=1)
