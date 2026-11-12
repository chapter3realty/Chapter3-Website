#!/usr/bin/env python3
"""Active CRM listings with the postal city Surfside Beach, kept when the pin is inside the town limits (county layer 31),
by zoning district (RAW/zoning-polys.geojson) and kind, in aggregate only: count, median ask, median ask per square foot.
Also the monthly HOA fee, bracketed from the API's hoaMax filter (the site's own "Up to $X a month" filter; a pin carries no fee):
a home that appears at hoaMax=0 has no HOA fee; a condo's fee is in the $25 bracket where it first appears.
Run: RAW=<scratch> python3 -I analyze_listings.py <datadir>. Reads RAW/listings-ssb.json (pull_listings.py). Writes <datadir>/listings-findings.json.
No MLS numbers, addresses, firms or photos are written."""
import sys, os, json, statistics, collections, time, urllib.request, urllib.parse, datetime
from shapely.geometry import shape, Point
D = sys.argv[1]; RAW = os.environ["RAW"]
L = json.load(open(os.path.join(RAW, "listings-ssb.json")))
town = shape(json.load(open(os.path.join(RAW, "town-limits.geojson")))["features"][0]["geometry"])
Z = [(f["properties"]["zone"], shape(f["geometry"])) for f in json.load(open(os.path.join(RAW, "zoning-polys.geojson")))["features"]]
def zone(pt):
    for z, g in Z:
        if g.contains(pt): return z
    return "none"
homes = {}
for m, h in L["homes"].items():
    if h["lat"] is None: continue
    pt = Point(h["lng"], h["lat"])
    if not town.contains(pt): continue
    homes[m] = dict(h, zone=zone(pt))
BASE = "https://chapter3realty.com/homes/api/map?"
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
fee = {}; calls = 0
for t, steps in (("house", [0]), ("townhouse", [0]), ("manufactured", [0]), ("condo", list(range(0, 2001, 25)))):
    for T in steps:
        d = get({"city": "Surfside Beach", "type": t, "hoaMax": T}); calls += 1
        for p in d["pins"]: fee.setdefault(p["mls"], T)
        time.sleep(0.15)
def grp(xs):
    pr = [x["price"] for x in xs if x["price"]]; pp = [x["price"] / x["sqft"] for x in xs if x["price"] and x.get("sqft")]
    f = [fee[x["m"]] for x in xs if x["m"] in fee]
    return {"n": len(xs), "median_ask": statistics.median(pr) if pr else None, "median_ask_per_sqft": round(statistics.median(pp)) if pp else None,
            "no_hoa_fee": sum(1 for x in xs if fee.get(x["m"]) == 0), "fee_known": len(f), "median_fee_upper": statistics.median(f) if f else None}
rows = [dict(h, m=m) for m, h in homes.items()]
out = {"pulled": L["pulled"], "api_totals_postal_city": L["api_totals"], "in_town": len(rows), "hoa_calls": calls,
       "note": "CRM public map API (CCMLS listings), city=Surfside Beach, kept inside the town limits. Aggregate only. HOA fee: houses tested at hoaMax=0 only; condo fees to within $25 (top of the bracket).",
       "groups": {}}
for z in ("all", "R3", "C3", "R1", "R2", "PD", "C1", "R3C3", "R1R2"):
    for k in ("all", "house", "condo", "townhouse", "manufactured", "land"):
        xs = [x for x in rows if (z == "all" or x["zone"] == z or (z == "R3C3" and x["zone"] in ("R3", "C3")) or (z == "R1R2" and x["zone"] in ("R1", "R2"))) and (k == "all" or x["type"] == k)]
        if xs: out["groups"]["%s/%s" % (z, k)] = grp(xs)
json.dump(out, open(os.path.join(D, "listings-findings.json"), "w"), indent=1)
for k, v in out["groups"].items(): print(k, v)
