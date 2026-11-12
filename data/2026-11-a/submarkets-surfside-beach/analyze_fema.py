#!/usr/bin/env python3
"""NFIP policy cost in ZIP 29575 (OpenFEMA NfipPolicies v3, policies that began June 2025 to May 2026), by the FEMA zone the
policy was rated in, by occupancy type, and by 2020 Census block group, with each block group's share of town homes in R3.
Run: RAW=<scratch> python3 -I analyze_fema.py <datadir>   (needs raw/nfip-policies-29575.json, RAW/bg2020.geojson, RAW/parcel-zones.json)
policyCost = what the policyholder pays a year, fees included. Occupancy 11 single-family; 12 two to four family; 15 condo association (whole building); 16 condo unit."""
import sys, os, json, statistics, collections
from shapely.geometry import shape, Point
D = sys.argv[1]; RAW = os.environ["RAW"]
P = json.load(open(os.path.join(D, "raw/nfip-policies-29575.json")))["NfipPolicies"]
bgs = [(f["properties"]["GEOID"], shape(f["geometry"])) for f in json.load(open(os.path.join(RAW, "bg2020.geojson")))["features"]]
homes = json.load(open(os.path.join(RAW, "parcel-zones.json")))
bgz = collections.defaultdict(collections.Counter)
for h in homes:
    pt = Point(h["x"], h["y"])
    for g, s in bgs:
        if s.contains(pt): bgz[g][h["zone"]] += 1; break
def zgrp(z):
    z = (z or "").upper()
    if z.startswith("V"): return "V"
    if z.startswith("A"): return "A"
    if z.startswith(("X", "B", "C")): return "X"
    return "other"
def med(xs):
    xs = [x for x in xs if x is not None]
    return {"policies": len(xs), "median_cost": round(statistics.median(xs)) if xs else None,
            "p25": round(statistics.quantiles(xs, n=4)[0]) if len(xs) >= 4 else None, "p75": round(statistics.quantiles(xs, n=4)[2]) if len(xs) >= 4 else None}
out = {"source": "OpenFEMA NfipPolicies v3, reportedZipCode 29575, policyEffectiveDate 2025-06-01 to 2026-05-31", "by_zone_occupancy": {}, "by_bg": {}, "bg_town_homes": {}}
for occ in (11, 12, 15, 16, None):
    for zg in ("A", "V", "X", None):
        xs = [p["policyCost"] for p in P if (occ is None or p["occupancyType"] == occ) and (zg is None or zgrp(p["ratedFloodZone"]) == zg)]
        if xs: out["by_zone_occupancy"]["%s/%s" % (occ or "all", zg or "all")] = med(xs)
for g, c in bgz.items():
    n = sum(c.values()); out["bg_town_homes"][g] = {"town_homes": n, "R3_C3_share": round((c["R3"] + c["C3"]) / n, 2), "R1_R2_share": round((c["R1"] + c["R2"]) / n, 2)}
for g in sorted({p["censusGeoid"][:12] for p in P if p.get("censusGeoid")}):
    for occ in (11, 16, 15):
        xs = [p["policyCost"] for p in P if (p.get("censusGeoid") or "")[:12] == g and p["occupancyType"] == occ]
        if xs: out["by_bg"]["%s/%s" % (g, occ)] = med(xs)
# groups: block groups where most town homes are R3 or C3, and where most are R1 or R2
grpA = [g for g, v in out["bg_town_homes"].items() if v["town_homes"] >= 100 and v["R3_C3_share"] >= 0.6]
grpB = [g for g, v in out["bg_town_homes"].items() if v["town_homes"] >= 100 and v["R1_R2_share"] >= 0.6]
out["groups"] = {"mostly_R3": grpA, "mostly_R1_R2": grpB}
for nm, gg in (("mostly_R3", grpA), ("mostly_R1_R2", grpB)):
    for occ in (11, 16, 15):
        xs = [p["policyCost"] for p in P if (p.get("censusGeoid") or "")[:12] in gg and p["occupancyType"] == occ]
        out["groups"]["%s/%s" % (nm, occ)] = med(xs)
json.dump(out, open(os.path.join(D, "nfip-findings.json"), "w"), indent=1)
print(json.dumps(out["by_zone_occupancy"], indent=0)); print(out["bg_town_homes"]); print({k: v for k, v in out["groups"].items()})
