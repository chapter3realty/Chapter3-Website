"""Fix round 1 (2026-11-02): two small data files for the page.
1. nfip-city-houses.json: FEMA NFIP policies (OpenFEMA NfipPolicies v3), NFIP community 450109 (City of Myrtle Beach),
   single-family occupancy (1, 11), policies effective 2025-09-01 to 2026-08-31; policyCost (premium plus fees),
   middle and quartiles, by rated zone: high risk (A*, V*) against X/B/C.
2. building-units.json: CRM active condo listings (aggregate only) within 80 m of each busiest oceanfront building's
   sale points (the analyze.py rule): count, bedrooms mix, middle square feet. No address or listing is kept.
Run: NFIP=<nfip.json> LISTINGS=<listings-mb.json> python3 -I fix1_data.py"""
import json, os, math, statistics, collections
HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.environ["NFIP"]))["NfipPolicies"]
def grp(z):
    z = (z or "").upper()
    return "high" if z[:1] in ("A", "V") else ("x" if z in ("X", "B", "C") else "other")
out = {"source": "https://www.fema.gov/api/open/v3/NfipPolicies", "community": "450109 MYRTLE BEACH, CITY OF",
       "filter": "occupancyType 1 or 11; policyEffectiveDate 2025-09-01 to 2026-08-31", "field": "policyCost", "pulled": "2026-11-02"}
for g in ("high", "x"):
    v = sorted(x["policyCost"] for x in d if grp(x["ratedFloodZone"]) == g and x["policyCost"] is not None)
    out[g] = {"n": len(v), "median": statistics.median(v), "q1": v[len(v) // 4], "q3": v[3 * len(v) // 4]}
json.dump(out, open(os.path.join(HERE, "nfip-city-houses.json"), "w"), indent=1)
L = json.load(open(os.environ["LISTINGS"]))["homes"]
F = json.load(open(os.path.join(HERE, "findings.json")))
kx = math.cos(math.radians(33.7)) * 111320; ky = 110540
B = {}
for b in F["oceanfront"]["top_buildings"][:10]:
    near = [h for h in L.values() if h["type"] == "condo" and h["lat"] and math.hypot((h["lng"] - b["lon"]) * kx, (h["lat"] - b["lat"]) * ky) < 80]
    sq = [h["sqft"] for h in near if h["sqft"]]
    B[b["group"]] = {"listings": len(near), "beds": dict(sorted(collections.Counter(h["beds"] for h in near).items())), "median_sqft": statistics.median(sq) if sq else None}
json.dump({"pulled": "2026-11-02", "rule": "condo listings within 80 m of the building's sale points", "buildings": B}, open(os.path.join(HERE, "building-units.json"), "w"), indent=1)
print(json.dumps(out)); print(json.dumps(B))
