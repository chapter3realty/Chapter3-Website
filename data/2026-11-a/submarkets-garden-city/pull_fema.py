#!/usr/bin/env python3
"""OpenFEMA NFIP policies (v3) for ZIP 29576 (Murrells Inlet and Garden City; both counties), every occupancy type,
policies that began June 1, 2025 to May 31, 2026. Writes raw/nfip-policies-29576.json. Run: python3 -I pull_fema.py <datadir>"""
import sys, json, os, time, urllib.request, urllib.parse
D = sys.argv[1]; R = os.path.join(D, "raw")
B = "https://www.fema.gov/api/open/v3/NfipPolicies"
f = "reportedZipCode eq '29576' and policyEffectiveDate ge '2025-06-01T00:00:00.000Z' and policyEffectiveDate lt '2026-06-01T00:00:00.000Z'"
sel = "totalInsurancePremiumOfThePolicy,policyCost,ratedFloodZone,occupancyType,primaryResidenceIndicator,censusGeoid,nfipCommunityName,condominiumCoverageTypeCode,latitude,longitude,policyCount,originalConstructionDate,elevatedBuildingIndicator,totalBuildingInsuranceCoverage,policyEffectiveDate,rentalPropertyIndicator"
rows = []; skip = 0
while True:
    u = B + "?" + urllib.parse.urlencode({"$filter": f, "$select": sel, "$top": "1000", "$skip": str(skip)}, quote_via=urllib.parse.quote)
    for i in range(6):
        try: got = json.loads(urllib.request.urlopen(u, timeout=300).read()).get("NfipPolicies", []); break
        except Exception as e: print("retry", e, flush=True); time.sleep(10)
    else: raise SystemExit("failed")
    rows += got; skip += 1000; print(len(rows), flush=True)
    if len(got) < 1000: break
json.dump({"url": u.split("&%24top")[0], "NfipPolicies": rows}, open(os.path.join(R, "nfip-policies-29576.json"), "w"))
