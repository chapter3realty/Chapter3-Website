#!/usr/bin/env python3
"""OpenFEMA NFIP policies (NfipPolicies v3) for single-family homes (occupancyType 1 or 11) in the Horry County ZIP codes on the ocean,
the Intracoastal Waterway or the Waccamaw River, policies that began 2025-06-01 to 2026-05-31 (the window the 2026-11-a town ledgers use).
Saves only the fields the page uses (the data set has no addresses).
Run: RAW=<scratch> python3 -I pull_fema.py. Writes RAW/nfip-policies-sf.json."""
import json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]
B = "https://www.fema.gov/api/open/v3/NfipPolicies"
ZIPS = ["29566", "29582", "29572", "29577", "29579", "29575", "29576", "29588", "29526", "29527", "29568"]
sel = "reportedZipCode,policyEffectiveDate,occupancyType,ratedFloodZone,floodZoneCurrent,policyCost,totalInsurancePremiumOfThePolicy,primaryResidenceIndicator,totalBuildingInsuranceCoverage,elevatedBuildingIndicator,postFIRMConstructionIndicator"
rows = []; urls = {}
for z in ZIPS:
    f = "reportedZipCode eq '%s' and (occupancyType eq 1 or occupancyType eq 11) and policyEffectiveDate ge '2025-06-01T00:00:00.000Z' and policyEffectiveDate lt '2026-06-01T00:00:00.000Z'" % z
    skip = 0
    while True:
        u = B + "?" + urllib.parse.urlencode({"$filter": f, "$select": sel, "$top": "1000", "$skip": str(skip)}, quote_via=urllib.parse.quote)
        for i in range(6):
            try: got = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=300).read()).get("NfipPolicies", []); break
            except Exception as e: print("retry", str(e)[:200], flush=True); time.sleep(10)
        else: raise SystemExit("failed " + u)
        rows += got; skip += 1000
        if len(got) < 1000: break
    urls[z] = B + "?" + urllib.parse.urlencode({"$filter": f}, quote_via=urllib.parse.quote)
    print(z, len(rows), flush=True)
json.dump({"urls": urls, "NfipPolicies": rows}, open(os.path.join(RAW, "nfip-policies-sf.json"), "w"))
