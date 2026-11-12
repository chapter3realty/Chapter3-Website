#!/usr/bin/env python3
"""The CRS class FEMA applied to NFIP policies in ZIP 29575 that began in 2026, by NFIP community.
OpenFEMA NfipPolicies v3, field crsClassCode. Run: python3 -I pull_crs.py <datadir>. Writes <datadir>/crs-findings.json."""
import sys, json, os, collections, urllib.request, urllib.parse
D = sys.argv[1]
B = "https://www.fema.gov/api/open/v3/NfipPolicies"
f = "reportedZipCode eq '29575' and policyEffectiveDate ge '2026-01-01T00:00:00.000Z'"
rows = []; skip = 0
while True:
    u = B + "?" + urllib.parse.urlencode({"$filter": f, "$select": "crsClassCode,nfipCommunityName,nfipCommunityNumberCurrent,policyEffectiveDate", "$top": "1000", "$skip": str(skip)}, quote_via=urllib.parse.quote)
    got = json.loads(urllib.request.urlopen(u, timeout=300).read()).get("NfipPolicies", [])
    rows += got; skip += 1000
    if len(got) < 1000: break
c = collections.Counter((r.get("nfipCommunityName"), r.get("nfipCommunityNumberCurrent"), r.get("crsClassCode")) for r in rows)
out = {"source": B, "filter": f, "policies": len(rows), "latest_effective": max(r["policyEffectiveDate"] for r in rows),
       "by_community_class": [[a, b, cl, n] for (a, b, cl), n in c.most_common()]}
json.dump(out, open(os.path.join(D, "crs-findings.json"), "w"), indent=1); print(json.dumps(out, indent=1))
