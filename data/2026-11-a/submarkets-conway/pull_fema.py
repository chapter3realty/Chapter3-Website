#!/usr/bin/env python3
"""OpenFEMA NFIP policies (v3) for Conway ZIPs 29526 and 29527: single-family (occupancyType 1 or 11), policies that began
June 1, 2025 to May 31, 2026, split by rated zone (X/B/C = outside the high-risk zone; A* = inside). Writes raw/nfip-policies-<zip>-<grp>.json.
Run: python3 -I pull_fema.py <datadir>"""
import sys, json, os, urllib.request, urllib.parse
D = sys.argv[1]; R = os.path.join(D, "raw")
B = "https://www.fema.gov/api/open/v3/NfipPolicies"
for z in ("29526", "29527"):
    for grp, zf in (("x", "(ratedFloodZone eq 'X' or ratedFloodZone eq 'B' or ratedFloodZone eq 'C')"), ("a", "(startswith(ratedFloodZone,'A'))")):
        f = ("reportedZipCode eq '%s' and (occupancyType eq 1 or occupancyType eq 11) and %s and policyEffectiveDate ge '2025-06-01T00:00:00.000Z' and policyEffectiveDate lt '2026-06-01T00:00:00.000Z'" % (z, zf))
        rows = []; skip = 0
        while True:
            u = B + "?" + urllib.parse.urlencode({"$filter": f, "$select": "totalInsurancePremiumOfThePolicy,policyCost,ratedFloodZone,reportedZipCode,occupancyType,policyEffectiveDate,primaryResidenceIndicator", "$orderby": "totalInsurancePremiumOfThePolicy", "$top": "1000", "$skip": str(skip)}, quote_via=urllib.parse.quote)
            got = json.loads(urllib.request.urlopen(u, timeout=300).read()).get("NfipPolicies", [])
            rows += got; skip += 1000
            if len(got) < 1000: break
        d = {"NfipPolicies": rows, "url": u.split("&%24top")[0]}
        json.dump(d, open(os.path.join(R, "nfip-policies-%s-%s.json" % (z, grp)), "w"))
        print(z, grp, len(d.get("NfipPolicies", [])))
