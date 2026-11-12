"""Builds findings.json and the chart files for /hoa/master-insurance-ho6/ from the raw OpenFEMA pulls.
Run after pull_nfip_condo.py and pull_nfip_claims.py: python3 -I build_findings.py <this folder>."""
import json, sys, statistics as st, collections
out = sys.argv[1] if len(sys.argv) > 1 else "."
A = json.load(open(f"{out}/raw/nfip-condo-horry-2025-26-A.json"))
U = json.load(open(f"{out}/raw/nfip-condo-horry-2025-26-U.json"))
C = json.load(open(f"{out}/raw/nfip-claims-horry-condo.json"))
DED = {'0':500,'1':1000,'2':2000,'3':3000,'4':4000,'5':5000,'9':750,'A':10000,'B':15000,'C':20000,'D':25000,'E':50000,'F':1250,'G':1500}
def q(a, p): a = sorted(a); return a[int(p * (len(a) - 1))] if a else None
def r5(x): return int(round(x / 5.0) * 5) if x is not None else None
a, u = A["rows"], U["rows"]
f = {"window": "policies that started 2025-09-01 to 2026-08-31", "asOfDate": a[0]["asOfDate"], "pulled": A["pulled"]}
# Association building flood policies (RCBAP)
withrc = [r for r in a if r.get("buildingReplacementCost") and r.get("policyCount")]
meets = [r for r in withrc if r["totalBuildingInsuranceCoverage"] >= min(0.8 * r["buildingReplacementCost"], 250000 * r["policyCount"]) - 1]
f["rcbap"] = {
  "policies": len(a), "units": sum(r.get("policyCount") or 0 for r in a),
  "deductible_counts": dict(collections.Counter(DED.get(r.get("buildingDeductibleCode")) for r in a).most_common()),
  "with_replacement_cost": len(withrc), "meets_80pct_or_max": len(meets),
  "coverage_per_unit_median": round(st.median(r["totalBuildingInsuranceCoverage"] / r["policyCount"] for r in a if r.get("policyCount"))),
  "at_250k_per_unit_cap": sum(1 for r in a if r.get("policyCount") and r["totalBuildingInsuranceCoverage"] / r["policyCount"] >= 249999),
  "with_contents_coverage": sum(1 for r in a if r.get("totalContentsInsuranceCoverage")),
}
def rcpu(rs): v = [r["buildingReplacementCost"] / r["policyCount"] for r in rs if r.get("buildingReplacementCost") and r.get("policyCount")]; return {"n": len(v), "median": round(st.median(v)), "p25": round(q(v, .25)), "p75": round(q(v, .75)), "over_250k": sum(x > 250000 for x in v)}
f["replacement_cost_per_unit"] = {"all": rcpu(a), "ten_plus_units": rcpu([r for r in a if (r.get("policyCount") or 0) >= 10]),
                                  "three_plus_floors": rcpu([r for r in a if r.get("numberOfFloorsInInsuredBuilding") == 3]),
                                  "zone_V": rcpu([r for r in a if (r.get("ratedFloodZone") or "").startswith("V")])}
# Unit owner flood policies
cost = [r["policyCost"] for r in u if r.get("policyCost")]
f["unit_policies"] = {"policies": len(u), "cost_median": round(st.median(cost)), "cost_p25": q(cost, .25), "cost_p75": q(cost, .75),
  "building_cov_median": round(st.median(r["totalBuildingInsuranceCoverage"] for r in u)), "building_cov_zero": sum(1 for r in u if not r["totalBuildingInsuranceCoverage"]),
  "contents_cov_median": round(st.median(r["totalContentsInsuranceCoverage"] for r in u)), "contents_cov_zero": sum(1 for r in u if not r["totalContentsInsuranceCoverage"]),
  "zone": dict(collections.Counter((r.get("ratedFloodZone") or "?")[:1] for r in u)), "primary_residence": sum(1 for r in u if r.get("primaryResidenceIndicator"))}
# Claims by storm
ev = collections.defaultdict(lambda: {"A_claims": 0, "A_paid": 0.0, "U_claims": 0, "U_paid": 0.0})
for r in C["rows"]:
    k = r.get("floodEvent") or "(no event name)"; c = r["condominiumCoverageTypeCode"]
    c = "A" if c in ("A", "H", "L") else c  # every association building policy (RCBAP: A, H high-rise, L low-rise); verifier 2026-11-10
    ev[k][c + "_claims"] += 1; ev[k][c + "_paid"] += (r.get("amountPaidOnBuildingClaim") or 0) + (r.get("amountPaidOnContentsClaim") or 0)
f["claims_by_event"] = {k: {kk: round(vv) for kk, vv in v.items()} for k, v in sorted(ev.items(), key=lambda x: -x[1]["A_paid"])}
f["claims_total"] = {"rows": len(C["rows"]), "pulled": C["pulled"]}
# Worked example: a storm deductible split per unit, at the middle replacement cost per unit of a building with 10 or more units
m = f["replacement_cost_per_unit"]["ten_plus_units"]["median"]
f["example"] = {"replacement_cost_per_unit": m, "basis": "middle replacement cost per unit, Horry condo buildings of 10+ units with a federal flood policy",
  "share_1pct": r5(m * .01), "share_2pct": r5(m * .02), "share_5pct": r5(m * .05)}
json.dump(f, open(f"{out}/findings.json", "w"), indent=1)
chart = {"title": "What one owner could be billed after a storm",
  "unit": "dollars per unit", "note": "Example. A building insured at the middle cost to rebuild per unit for Horry condo buildings of 10 or more units. Each owner pays an equal share.",
  "bars": [{"label": "1% storm deductible", "value": f["example"]["share_1pct"]},
           {"label": "2% storm deductible", "value": f["example"]["share_2pct"]}, {"label": "5% storm deductible (the most Fannie Mae allows)", "value": f["example"]["share_5pct"]}]}
json.dump(chart, open(f"{out}/chart-deductible-share.json", "w"), indent=1)
print(json.dumps(f, indent=1))
