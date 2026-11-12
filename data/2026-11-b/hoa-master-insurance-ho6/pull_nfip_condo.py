"""OpenFEMA NfipPolicies v3, Horry County (censusGeoid starts 45051), condo flood policies that started 2025-09-01 to 2026-08-31
(the same window as data/2026-11-b/hoa/pull_rcbap.py). Two groups:
  A = the condo association's building policy (RCBAP). policyCount = units the one contract insures (OpenFEMA field description).
  U = a policy on one condo unit, bought by the unit owner.
Rating fields only; no address. Run: python3 -I pull_nfip_condo.py <this folder>. Writes raw/nfip-condo-horry-2025-26-<A|U>.json."""
import json, sys, time, urllib.parse, urllib.request
out = sys.argv[1] if len(sys.argv) > 1 else "."
U = "https://www.fema.gov/api/open/v3/NfipPolicies"
SEL = ("policyEffectiveDate,condominiumCoverageTypeCode,occupancyType,numberOfFloorsInInsuredBuilding,ratedFloodZone,policyCost,policyCount,"
       "totalBuildingInsuranceCoverage,totalContentsInsuranceCoverage,buildingReplacementCost,buildingDeductibleCode,contentsDeductibleCode,"
       "insuranceToValueCode,primaryResidenceIndicator,rentalPropertyIndicator,nfipCommunityName,reportedZipCode,asOfDate")
for code in ("A", "U"):
    FLT = ("startswith(censusGeoid,'45051') and policyEffectiveDate ge '2025-09-01' and policyEffectiveDate lt '2026-09-01' "
           f"and condominiumCoverageTypeCode eq '{code}'")
    rows, skip = [], 0
    while True:
        q = urllib.parse.urlencode({"$filter": FLT, "$select": SEL, "$top": 5000, "$skip": skip, "$inlinecount": "allpages"}, quote_via=urllib.parse.quote)
        for i in range(5):
            try:
                d = json.load(urllib.request.urlopen(urllib.request.Request(U + "?" + q, headers={"User-Agent": "research-script"}), timeout=300)); break
            except Exception as e:
                print("retry", e, file=sys.stderr); time.sleep(5)
        b = d["NfipPolicies"]; rows += b; skip += len(b); meta = d["metadata"]
        if not b or skip >= meta["count"]: break
    json.dump({"source": U, "filter": FLT, "select": SEL, "count": meta["count"], "pulled": time.strftime("%Y-%m-%d"), "rows": rows},
              open(f"{out}/raw/nfip-condo-horry-2025-26-{code}.json", "w"))
    print(code, len(rows), meta["count"])
