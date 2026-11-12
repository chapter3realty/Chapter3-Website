"""OpenFEMA NfipClaims v3: flood claims on condo policies in Horry County (countyCode 45051), every year in the data set.
A, H, L = the association's building policy (RCBAP; H and L are FEMA's high-rise and low-rise RCBAP codes, added after the verifier found them, 2026-11-10); U = a policy on one unit. Rating and payment fields only; no address.
Run: python3 -I pull_nfip_claims.py <this folder>. Writes raw/nfip-claims-horry-condo.json."""
import json, sys, time, urllib.parse, urllib.request
out = sys.argv[1] if len(sys.argv) > 1 else "."
U = "https://www.fema.gov/api/open/v3/NfipClaims"
SEL = ("dateOfLoss,yearOfLoss,condominiumCoverageTypeCode,floodEvent,amountPaidOnBuildingClaim,amountPaidOnContentsClaim,"
       "totalBuildingInsuranceCoverage,buildingDeductibleCode,policyCount,buildingDamageAmount,numberOfUnits,ratedFloodZone,numberOfFloorsInTheInsuredBuilding,asOfDate")
rows = []
for code in ("A", "H", "L", "U"):
    FLT = f"countyCode eq '45051' and condominiumCoverageTypeCode eq '{code}'"
    skip = 0
    while True:
        q = urllib.parse.urlencode({"$filter": FLT, "$select": SEL, "$top": 5000, "$skip": skip, "$inlinecount": "allpages"}, quote_via=urllib.parse.quote)
        for i in range(5):
            try:
                d = json.load(urllib.request.urlopen(urllib.request.Request(U + "?" + q, headers={"User-Agent": "research-script"}), timeout=300)); break
            except Exception as e:
                print("retry", e, file=sys.stderr); time.sleep(5)
        b = d["NfipClaims"]; rows += b; skip += len(b)
        if not b or skip >= d["metadata"]["count"]: break
    print(code, skip)
json.dump({"source": U, "select": SEL, "pulled": time.strftime("%Y-%m-%d"), "rows": rows}, open(f"{out}/raw/nfip-claims-horry-condo.json", "w"))
