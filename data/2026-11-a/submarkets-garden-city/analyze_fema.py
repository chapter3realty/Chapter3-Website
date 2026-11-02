#!/usr/bin/env python3
"""NFIP policy cost (what the policyholder pays a year, fees included) for ZIP 29576 policies that began June 2025 to May 2026,
by area and rated zone. Strip = the three Census block groups the Waccamaw Drive strip falls in (450510513011, 450510513012
in Horry; 450439205101 in Georgetown). Run: python3 -I analyze_fema.py <datadir>. Writes nfip-findings.json."""
import json, sys, os, statistics, collections
D = sys.argv[1]
r = json.load(open(os.path.join(D, "raw/nfip-policies-29576.json")))["NfipPolicies"]
STRIP = {"450510513011", "450510513012", "450439205101"}
OCC = {11: "single-family home", 16: "unit in a multi-unit building (condo unit policy)", 15: "condo association building policy (RCBAP)", 14: "manufactured home"}
def zg(z):
    z = (z or "").upper()
    return "V" if z.startswith("V") else ("A" if z.startswith("A") else ("X" if z in ("X", "B", "C", "AR") or z.startswith("X") else "other"))
G = collections.defaultdict(list)
for x in r:
    area = "strip" if (x.get("censusGeoid") or "") in STRIP else "rest_29576"
    for a in (area, "all_29576"):
        G[(a, x["occupancyType"], zg(x["ratedFloodZone"]))].append(x)
        G[(a, x["occupancyType"], "any")].append(x)
out = {}
for (a, o, z), xs in sorted(G.items()):
    if o not in OCC or len(xs) < 5: continue
    pc = [x["policyCost"] for x in xs if x.get("policyCost") is not None]
    out["%s/%s/%s" % (a, o, z)] = {"what": OCC[o], "policies": len(xs), "median_cost": statistics.median(pc), "p25": statistics.quantiles(pc, n=4)[0], "p75": statistics.quantiles(pc, n=4)[2],
        "primary_residence": sum(bool(x.get("primaryResidenceIndicator")) for x in xs), "median_building_coverage": statistics.median([x["totalBuildingInsuranceCoverage"] or 0 for x in xs])}
json.dump({"source": "OpenFEMA NfipPolicies v3", "filter": "reportedZipCode 29576, policyEffectiveDate 2025-06-01 to 2026-05-31", "groups": out}, open(os.path.join(D, "nfip-findings.json"), "w"), indent=1)
for k, v in out.items(): print(k, v)
