"""Monthly HOA fee of the active condo listings on Garden City's ocean side (Horry part), in aggregate only (fix round 2).
The CRM's public map API takes hoaMax (dollars a month, the site's own "Up to $X a month" filter) but returns no fee on a pin.
So each condo's fee is bracketed: query has=area_garden_city&type=condo&hoaMax=T for T = 0, 10, 20 ... 3000 and record the first T
at which each MLS number appears (its fee is in T-9 to T). Zones come from zones.py, the same split as analyze_listings.py.
Saves only counts and the bracketed median, no MLS numbers, addresses, firms or photos.
Run: RAW=<scratch> python3 -I pull_hoa.py <datadir>. Writes <datadir>/hoa-findings.json."""
import sys, os, json, time, statistics, urllib.request, urllib.parse, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import Point, LineString
from shapely.ops import unary_union
D = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
q = {"has": "area_garden_city", "type": "condo"}
allc = get(q); assert allc["total"] == len(allc["pins"]), "truncated"
pins = {p["mls"]: p for p in allc["pins"]}
osm = J("osm.json")
WALL = unary_union([LineString([(p["lon"], p["lat"]) for p in e["geometry"]]) for e in osm["elements"] if "Waccamaw Drive" in e.get("tags", {}).get("name", "")])
GT = CTY["Georgetown County"]
def where(p):
    pt = Point(p["lng"], p["lat"])
    if GT.contains(pt):
        s, d = side(pt, WALL); return "georgetown/" + ("beach" if s > 0 else ("middle" if d < 400 else "inland"))
    return "horry/" + zone(pt)
zoneof = {m: where(p) for m, p in pins.items() if p.get("lat") is not None}
fee = {}; calls = 1
for T in range(0, 3001, 10):
    d = get(dict(q, hoaMax=T)); calls += 1
    for p in d["pins"]:
        fee.setdefault(p["mls"], T)
    if len(fee) >= len(pins): break
    time.sleep(0.15)
out = {}
for key in sorted(set(zoneof.values())) + ["all"]:
    ms = [m for m in pins if key == "all" or zoneof.get(m) == key]
    fs = sorted(fee[m] for m in ms if m in fee)
    out[key] = {"n": len(ms), "with_fee": len(fs), "median_upper": statistics.median(fs) if fs else None,
                "q1_upper": fs[len(fs) // 4] if fs else None, "q3_upper": fs[(3 * len(fs)) // 4] if fs else None,
                "min_upper": fs[0] if fs else None, "max_upper": fs[-1] if fs else None}
F = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "calls": calls, "condos": len(pins), "bracketed": len(fee),
     "note": "CRM public map API, has=area_garden_city&type=condo, filter hoaMax (monthly). Each fee is known to within $10: the value is the top of its $10 bracket. Aggregate only.",
     "meta_refreshed": allc.get("meta", {}).get("refreshedAt"), "groups": out}
json.dump(F, open(os.path.join(D, "hoa-findings.json"), "w"), indent=1)
print(json.dumps(F, indent=1))
