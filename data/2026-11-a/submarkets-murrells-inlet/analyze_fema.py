#!/usr/bin/env python3
"""NFIP policy cost (what the policyholder pays a year, fees included) for ZIP 29576 policies that began 2025-06-01 to 2026-05-31,
split by county and by whether the 2020 block group lies mostly in the Garden City Census place or on the beach strip.
Strip = the three block groups the Garden City beach strip falls in (the Garden City page's split). Garden City = a Horry block group
with more than half its land in the 2020 Garden City CDP. Run: RAW=<scratch> python3 -I analyze_fema.py <datadir>. Writes nfip-findings.json."""
import json, sys, os, statistics, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
D = sys.argv[1]
r = J("nfip-policies-29576.json")["NfipPolicies"]
STRIP = {"450510513011", "450510513012", "450439205101"}
bgs = {f["properties"]["GEOID"]: shape(f["geometry"]).buffer(0) for f in J("bg2020.geojson")["features"]}
def area(geoid):
    if geoid in STRIP: return "strip"
    if geoid.startswith("45043"): return "georgetown"
    g = bgs.get(geoid)
    if g is not None and g.intersection(GC).area > 0.5 * g.area: return "garden_city"
    return "horry"
OCC = {11: "single-family home", 16: "condo unit policy", 15: "condo building policy", 14: "manufactured home", 12: "2-4 family", 13: "other residential"}
def zg(z):
    z = (z or "").upper()
    return "V" if z.startswith("V") else ("A" if z.startswith("A") else "X")
G = collections.defaultdict(list)
for x in r:
    a = area(x.get("censusGeoid") or "")
    for k in ((a, x["occupancyType"], zg(x["ratedFloodZone"])), (a, x["occupancyType"], "any"), (a, "all", "any")):
        G[k].append(x)
out = {}
for (a, o, z), xs in sorted(G.items(), key=lambda kv: str(kv[0])):
    if len(xs) < 5: continue
    pc = sorted(x["policyCost"] for x in xs if x.get("policyCost") is not None)
    q = statistics.quantiles(pc, n=4)
    out["%s/%s/%s" % (a, o, z)] = {"what": OCC.get(o, o), "policies": len(xs), "median_cost": statistics.median(pc), "p25": q[0], "p75": q[2],
        "primary_residence": sum(bool(x.get("primaryResidenceIndicator")) for x in xs), "median_building_coverage": statistics.median([x["totalBuildingInsuranceCoverage"] or 0 for x in xs])}
json.dump({"source": "OpenFEMA NfipPolicies v3", "filter": "reportedZipCode 29576, policyEffectiveDate 2025-06-01 to 2026-05-31",
           "areas_by_block_group": {g: area(g) for g in sorted({x.get("censusGeoid") or "" for x in r})}, "groups": out}, open(os.path.join(D, "nfip-findings.json"), "w"), indent=1)
for k, v in out.items():
    if "/11/" in k or "/all/" in k: print(k, v["policies"], v["median_cost"], v["p25"], v["p75"], "primary", v["primary_residence"])
