"""OpenFEMA NfipPolicies v3: condo building flood policies (condominiumCoverageTypeCode 'A', condominium association; in the Risk Rating 2.0
rows the H and L codes are not used, checked 2026-11-09: Horry policies from 2026-06 with a condo code were U (unit) or A)
in Horry County (censusGeoid starts 45051), effective 2025-09-01 to 2026-08-31. policyCount on an RCBAP is the number of
units the one contract insures (OpenFEMA field description), so policyCost / policyCount is the yearly flood cost per unit
that the owners share through the condo fee. Rating fields only; no address. Run: python3 -I pull_rcbap.py <this folder>.
Writes raw/nfip-rcbap-horry-2025-26.json and rcbap.json (medians)."""
import json, sys, time, urllib.parse, urllib.request, statistics
out = sys.argv[1] if len(sys.argv) > 1 else "."
U = "https://www.fema.gov/api/open/v3/NfipPolicies"
FLT = ("startswith(censusGeoid,'45051') and policyEffectiveDate ge '2025-09-01' and policyEffectiveDate lt '2026-09-01' "
       "and condominiumCoverageTypeCode eq 'A'")
SEL = ("policyEffectiveDate,condominiumCoverageTypeCode,occupancyType,numberOfFloorsInInsuredBuilding,ratedFloodZone,policyCost,policyCount,totalBuildingInsuranceCoverage,"
       "nfipCommunityName,reportedZipCode,asOfDate")
rows, skip = [], 0
while True:
    q = urllib.parse.urlencode({"$filter": FLT, "$select": SEL, "$top": 5000, "$skip": skip, "$inlinecount": "allpages"}, quote_via=urllib.parse.quote)
    for i in range(5):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(U + "?" + q, headers={"User-Agent": "chapter3-research"}), timeout=300)); break
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    b = d["NfipPolicies"]; rows += b; skip += len(b); meta = d["metadata"]
    if not b or skip >= meta["count"]: break
json.dump({"source": U, "filter": FLT, "count": meta["count"], "rows": rows}, open(f"{out}/raw/nfip-rcbap-horry-2025-26.json", "w"))
def summ(rs):
    per = sorted(r["policyCost"] / r["policyCount"] for r in rs if r.get("policyCount") and r.get("policyCost"))
    tot = sorted(r["policyCost"] for r in rs if r.get("policyCost"))
    units = sorted(r["policyCount"] for r in rs if r.get("policyCount"))
    q = lambda a, p: a[int(p * (len(a) - 1))] if a else None
    return {"policies": len(rs), "per_unit_median": round(statistics.median(per)) if per else None, "per_unit_p25": round(q(per, .25)) if per else None,
            "per_unit_p75": round(q(per, .75)) if per else None, "building_cost_median": round(statistics.median(tot)) if tot else None,
            "units_median": statistics.median(units) if units else None, "units_total": sum(units)}
res = {"count": len(rows), "asOfDate": rows[0].get("asOfDate") if rows else None,
       "all": summ(rows), "three_plus_floors": summ([r for r in rows if r.get("numberOfFloorsInInsuredBuilding") == 3]),
       "multi_unit_10plus": summ([r for r in rows if (r.get("policyCount") or 0) >= 10]),
       "zone_V": summ([r for r in rows if (r.get("ratedFloodZone") or "").startswith("V")]),
       "zone_A": summ([r for r in rows if (r.get("ratedFloodZone") or "").startswith("A")]),
       "zone_X_BC": summ([r for r in rows if (r.get("ratedFloodZone") or "")[:1] in ("X", "B", "C")])}
json.dump(res, open(f"{out}/rcbap.json", "w"), indent=1)
print(json.dumps(res, indent=1))
