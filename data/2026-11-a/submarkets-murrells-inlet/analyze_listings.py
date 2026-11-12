#!/usr/bin/env python3
"""Active CRM listings with a Murrells Inlet city (pull_listings.py), in aggregate: count, median ask, median ask per square foot,
by county side and part (zones.py: the same split as analyze.py), and feature counts. Then the monthly HOA fee of the house listings
by part, bracketed to $10 with the API's hoaMax filter (the Garden City method), and the count with no HOA (hoa=0).
Run: RAW=<scratch> python3 -I analyze_listings.py <datadir>. Writes listings-findings.json (no MLS numbers, addresses, firms or photos)."""
import sys, os, json, statistics, collections, time, urllib.request, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import Point
from shapely.ops import nearest_points
D = sys.argv[1]
L = J("listings-mi.json"); homes = L["homes"]
def part(lng, lat):
    pt = Point(lng, lat)
    if HOR.contains(pt):
        return "horry/garden_city" if GC.contains(pt) else ("horry/east" if east_of(BYP17, pt) else "horry/west")
    if east_of(BUS17, pt) and m(pt, nearest_points(BUS17, pt)[0]) > 700: return "georgetown/gc_strip"
    if east_of(BUS17, pt): return "georgetown/inlet"
    return "georgetown/old_road" if east_of(BYP17, pt) else "georgetown/west"
P = {k: part(v["lng"], v["lat"]) for k, v in homes.items() if v.get("lat") is not None}
def agg(ks):
    pr = sorted(homes[k]["price"] for k in ks if homes[k]["price"])
    pps = sorted(homes[k]["price"] / homes[k]["sqft"] for k in ks if homes[k]["price"] and homes[k]["sqft"])
    return {"n": len(ks), "median_ask": statistics.median(pr) if pr else None, "p25": statistics.quantiles(pr, n=4)[0] if len(pr) > 3 else None,
            "p75": statistics.quantiles(pr, n=4)[2] if len(pr) > 3 else None, "median_ask_per_sqft": round(statistics.median(pps)) if pps else None}
out = {"pulled": L["pulled"], "query": L["query"], "api_totals": L["api_totals"], "truncated": L["truncated"], "groups": {}, "features": {}}
parts = sorted(set(P.values()))
for p in parts + ["*"]:
    for t in ("all", "house", "condo", "townhouse", "manufactured", "land"):
        ks = [k for k in homes if (p == "*" or P.get(k) == p) and (t == "all" or homes[k]["type"] == t)]
        if ks: out["groups"][f"{p}/{t}"] = agg(ks)
for f, ks in L["features"].items():
    out["features"][f] = {"n": len(ks), "by_part": dict(collections.Counter(P.get(k) for k in ks)), "by_type": dict(collections.Counter(homes[k]["type"] for k in ks if k in homes))}
# HOA fee brackets for houses
BASE = "https://chapter3realty.com/homes/api/map?"
def get(p):
    u = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3)
    raise SystemExit("failed " + u)
q = {"city": "Murrells Inlet", "type": "house"}
nohoa = get(dict(q, hoa="0")); out["house_no_hoa"] = {"api_total": nohoa["total"], "by_part": dict(collections.Counter(part(x["lng"], x["lat"]) for x in nohoa["pins"] if x.get("lat"))), "complete": nohoa["total"] == len(nohoa["pins"])}
fee = {}
houses = {k for k in homes if homes[k]["type"] == "house"}
for T in range(0, 2001, 10):
    d = get(dict(q, hoaMax=T)); 
    if d["total"] > len(d["pins"]):   # more than 144: split by price
        pins = []
        for lo, hi in ((0, 400000), (400001, 600000), (600001, 50000000)):
            dd = get(dict(q, hoaMax=T, min=lo, max=hi)); pins += dd["pins"]
    else: pins = d["pins"]
    for x in pins: fee.setdefault(x["mls"], T)
    if len(fee) >= len(houses): break
    time.sleep(0.1)
hoa = {}
for p in parts + ["*"]:
    fs = sorted(fee[k] for k in houses if k in fee and (p == "*" or P.get(k) == p) and fee[k] > 0)
    if fs: hoa[p] = {"houses_with_fee": len(fs), "median_upper": statistics.median(fs), "q1_upper": fs[len(fs) // 4], "q3_upper": fs[(3 * len(fs)) // 4]}
out["house_hoa_monthly"] = {"note": "Each fee is known to within $10 (top of its bracket). Houses with a fee above $0 only; houses that never appeared up to $2,000 are not counted.", "bracketed": len(fee), "groups": hoa}
json.dump(out, open(os.path.join(D, "listings-findings.json"), "w"), indent=1)
for k, v in out["groups"].items(): print(k, v)
print("no hoa", out["house_no_hoa"]); print("hoa", hoa)
for f, v in out["features"].items(): print(f, v["n"], v["by_part"])
