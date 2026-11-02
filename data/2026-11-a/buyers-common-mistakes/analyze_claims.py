"""What a flood cost the owner when it was insured: median NFIP building payment in Horry County, by rated zone, since 2015.
Input: the sibling page's slim OpenFEMA NfipClaims v3 pull, data/2026-10-d/buyers-undisclosed-flooding/raw/nfip-claims-horry-slim.json
(countyCode 45051, asOfDate 2026-09-08). Dollars are as paid (not adjusted for inflation). Writes claims-findings.json.
Run: python3 -I analyze_claims.py <datadir> <slim.json>"""
import json, os, sys, statistics as st, collections
D, SRC = sys.argv[1], sys.argv[2]
d = json.load(open(SRC)); rows = d["rows"] if isinstance(d, dict) and "rows" in d else d
def grp(z):
    z = (z or "").upper()
    if z[:1] in ("A", "V"): return "high"
    if z in ("X", "B", "C") or z.startswith("X"): return "outside"
    return "unknown"
out = {"source": SRC, "fields_seen": sorted(rows[0].keys()), "by": {}}
for since in (1978, 2015):
    G = collections.defaultdict(list); R = collections.defaultdict(list)
    for r in rows:
        y = r.get("yearOfLoss") or int(str(r.get("dateOfLoss", "0"))[:4] or 0)
        if not y or int(y) < since: continue
        b = r.get("netBuildingPaymentAmount") or 0
        if b > 0:
            g = grp(r.get("ratedFloodZone")); G[g].append(b)
            if r.get("occupancyType") in (1, 11): R[g].append(b)
    out["by"]["since_%d" % since] = {g: {"n": len(v), "median_building_payment": round(st.median(v))} for g, v in G.items()}
    out["by"]["since_%d_single_family" % since] = {g: {"n": len(v), "median_building_payment": round(st.median(v))} for g, v in R.items()}
json.dump(out, open(os.path.join(D, "claims-findings.json"), "w"), indent=1); print(json.dumps(out, indent=1))
