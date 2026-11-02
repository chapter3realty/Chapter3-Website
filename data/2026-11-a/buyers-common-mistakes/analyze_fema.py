"""Median NFIP flood policy cost in Horry County by flood zone, for one-family houses (not condos), lived in or not.
Input PRIVATE/nfip-policies-horry-2025-26.json (fetch_fema_policies.py). Writes fema-findings.json.
policyCost = premium + reserve fund assessment + federal policy fee + HFIAA surcharge (FEMA's definition): what the owner pays.
Run: PRIVATE=<dir> python3 -I analyze_fema.py <datadir>"""
import json, os, sys, statistics as st, collections
D = sys.argv[1]; P = os.environ["PRIVATE"]
d = json.load(open(os.path.join(P, "nfip-policies-horry-2025-26.json")))
def grp(z):
    z = (z or "").upper()
    if z.startswith("V"): return "V (coastal high hazard)"
    if z.startswith("A"): return "A (high risk)"
    if z in ("X", "B", "C"): return "X (moderate or low risk)"
    return "other/unknown"
def q(xs, p): xs = sorted(xs); return xs[min(len(xs) - 1, int(p * (len(xs) - 1) + 0.5))]
out = {"source": d["source"], "filter": d["filter"], "pulled": d["pulled"], "records": d["count"], "asOfDate": d["rows"][0].get("asOfDate") if d["rows"] else None,
       "definition": "one-year policies on one-family houses (occupancyType 1 or 11, not a condo unit or condo association), policyCost in dollars", "groups": {}}
H = [r for r in d["rows"] if r.get("occupancyType") in (1, 11) and (r.get("condominiumCoverageTypeCode") in (None, "N")) and r.get("policyTermIndicator") == 1 and (r.get("policyCost") or 0) > 0]
out["house_policies"] = len(H)
for zone_field in ("ratedFloodZone", "floodZoneCurrent"):
    G = collections.defaultdict(list)
    for r in H:
        k = (grp(r.get(zone_field)), "lived in" if r.get("primaryResidenceIndicator") else "not lived in")
        G[k].append(r["policyCost"])
        G[(grp(r.get(zone_field)), "all")].append(r["policyCost"])
    out["groups"][zone_field] = {" | ".join(k): {"n": len(v), "median": st.median(v), "p25": q(v, .25), "p75": q(v, .75)} for k, v in sorted(G.items())}
req = collections.Counter((grp(r.get("floodZoneCurrent")), bool(r.get("mandatoryPurchaseFlag"))) for r in H)
out["lender_required_by_current_zone"] = {"%s | required=%s" % k: n for k, n in sorted(req.items())}
json.dump(out, open(os.path.join(D, "fema-findings.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
