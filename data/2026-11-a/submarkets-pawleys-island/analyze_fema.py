#!/usr/bin/env python3
"""NFIP policy cost (what the policyholder pays a year, fees included) for ZIP 29585 policies that began June 2025 to May 2026,
split by NFIP community (the Town of Pawleys Island vs unincorporated Georgetown County), occupancy, rated zone and whether
the policy is on a primary residence. Run: python3 -I analyze_fema.py <datadir>. Writes nfip-findings.json."""
import json, sys, os, statistics, collections
D = sys.argv[1]
r = json.load(open(os.path.join(D, "raw/nfip-policies-29585.json")))["NfipPolicies"]
OCC = {11: "single-family home", 16: "unit in a multi-unit building (condo unit policy)", 15: "condo association building policy (RCBAP)", 14: "manufactured home"}
def zg(z):
    z = (z or "").upper()
    return "V" if z.startswith("V") else ("A" if z.startswith("A") else ("X" if z in ("X", "B", "C", "AR") or z.startswith("X") else "other"))
def comm(x):
    n = (x.get("nfipCommunityName") or "").upper()
    return "town" if "PAWLEYS" in n else ("county" if "GEORGETOWN" in n else "other:" + n)
G = collections.defaultdict(list)
names = collections.Counter(x.get("nfipCommunityName") for x in r)
for x in r:
    c = comm(x); pr = "primary" if x.get("primaryResidenceIndicator") else "not_primary"
    for key in ((c, x["occupancyType"], zg(x["ratedFloodZone"]), "any"), (c, x["occupancyType"], "any", "any"),
                (c, x["occupancyType"], zg(x["ratedFloodZone"]), pr), (c, x["occupancyType"], "any", pr)):
        G[key].append(x)
out = {}
for (c, o, z, p), xs in sorted(G.items(), key=lambda kv: str(kv[0])):
    if o not in OCC or len(xs) < 5: continue
    pc = [x["policyCost"] for x in xs if x.get("policyCost") is not None]
    out["%s/%s/%s/%s" % (c, o, z, p)] = {"what": OCC[o], "policies": len(xs), "median_cost": statistics.median(pc), "p25": statistics.quantiles(pc, n=4)[0],
        "p75": statistics.quantiles(pc, n=4)[2], "median_building_coverage": statistics.median([x["totalBuildingInsuranceCoverage"] or 0 for x in xs])}
json.dump({"source": "OpenFEMA NfipPolicies v3", "filter": "reportedZipCode 29585, policyEffectiveDate 2025-06-01 to 2026-05-31",
           "community_names": names.most_common(), "groups": out}, open(os.path.join(D, "nfip-findings.json"), "w"), indent=1)
print(names.most_common())
for k, v in out.items():
    if "/11/" in k: print(k, v)
