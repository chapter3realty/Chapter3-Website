"""Review round 1 (2026-11-03): what a federal flood policy costs on a house, beach ZIP codes against inland.
FEMA OpenFEMA NfipPolicies v3, one query per ZIP code (each area's main ZIP code on this page):
  https://www.fema.gov/api/open/v3/NfipPolicies?$filter=reportedZipCode eq '<zip>' and policyEffectiveDate ge '2025-09-01'
  and policyEffectiveDate lt '2026-09-01'&$select=policyCost,ratedFloodZone,occupancyType,nfipRatedCommunityNumber,nfipCommunityName,propertyState
Kept: propertyState SC, occupancyType 1 or 11 (single-family), policyCost (premium plus fees) above 0.
Groups by rated zone: V* (the coastal zone where the flood map expects waves), A* (other high-risk), X/B/C (outside).
Beach ZIPs: 29582, 29572, 29577, 29575, 29576, 29585. Inland: 29568, 29579, 29588, 29526, 29566.
Run: NFIP=<nfip-raw.json from the query loop> python3 -I nfip_r1.py   (the raw pull stays in scratch: 24,000 policy rows)."""
import json, os, statistics
HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.environ["NFIP"]))["rows"]
BEACH = ["29582", "29572", "29577", "29575", "29576", "29585"]; INLAND = ["29568", "29579", "29588", "29526", "29566"]
def g(z):
    z = (z or "").upper()
    return "v" if z[:1] == "V" else "a" if z[:1] == "A" else "x" if z in ("X", "B", "C") else "other"
out = {"source": "https://www.fema.gov/api/open/v3/NfipPolicies", "pulled": "2026-11-03",
       "filter": "reportedZipCode per ZIP; policyEffectiveDate 2025-09-01 to 2026-08-31; propertyState SC; occupancyType 1 or 11; policyCost > 0",
       "field": "policyCost (premium plus fees), dollars a year", "beach_zips": BEACH, "inland_zips": INLAND}
for side, zips in (("beach", BEACH), ("inland", INLAND)):
    for grp in ("v", "a", "x"):
        v = sorted(r["policyCost"] for z in zips for r in d[z] if r.get("occupancyType") in (1, 11) and r.get("propertyState") == "SC"
                   and g(r["ratedFloodZone"]) == grp and r.get("policyCost") and r["policyCost"] > 0)
        if v: out[f"{side}_{grp}"] = {"n": len(v), "median": statistics.median(v), "q1": v[len(v) // 4], "q3": v[3 * len(v) // 4]}
json.dump(out, open(os.path.join(HERE, "nfip-houses.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
