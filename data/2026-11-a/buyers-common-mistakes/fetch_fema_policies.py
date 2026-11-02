"""OpenFEMA NfipPolicies v3: every Horry County (census GEOID 45051...) policy with an effective date from 2025-09-01
to 2026-08-31 (one year of new and renewed policies; the file's asOfDate is 2026-09-08). Only rating fields are kept.
Run: PRIVATE=<dir> python3 -I fetch_fema_policies.py   Writes PRIVATE/nfip-policies-horry-2025-26.json"""
import json, os, sys, time, urllib.parse, urllib.request
RAW = os.environ["PRIVATE"]  # 12 MB: kept out of the repo
U = "https://www.fema.gov/api/open/v3/NfipPolicies"
FLT = "startswith(censusGeoid,'45051') and policyEffectiveDate ge '2025-09-01' and policyEffectiveDate lt '2026-09-01'"
SEL = ("policyEffectiveDate,policyTermIndicator,ratedFloodZone,floodZoneCurrent,occupancyType,primaryResidenceIndicator,rentalPropertyIndicator,"
       "condominiumCoverageTypeCode,totalInsurancePremiumOfThePolicy,policyCost,policyCount,totalBuildingInsuranceCoverage,"
       "mandatoryPurchaseFlag,nfipCommunityName,reportedZipCode,elevatedBuildingIndicator,postFIRMConstructionIndicator,asOfDate")
rows, skip, meta = [], 0, None
while True:
    q = urllib.parse.urlencode({"$filter": FLT, "$select": SEL, "$top": 10000, "$skip": skip, "$inlinecount": "allpages"}, quote_via=urllib.parse.quote)
    for i in range(5):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(U + "?" + q, headers={"User-Agent": "chapter3-research"}), timeout=300)); break
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    meta = d["metadata"]; b = d["NfipPolicies"]; rows += b; skip += len(b)
    print(skip, "/", meta["count"], file=sys.stderr)
    if not b or skip >= meta["count"]: break
json.dump({"source": U, "filter": FLT, "pulled": meta["rundate"], "count": meta["count"], "rows": rows}, open(os.path.join(RAW, "nfip-policies-horry-2025-26.json"), "w"))
