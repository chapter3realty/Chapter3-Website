#!/usr/bin/env python3
"""Fix round 1: neighborhood and street names by part, for /submarkets/garden-city/. Counts only, no addresses.
Neighborhood: the first words of each home parcel's LegalDescr (County GIS layer 24), as the county records it.
Street: STREETNAME of each address point (layer 22) on a home parcel. Parts from parcel-zones.json (analyze.py).
Run: RAW=<scratch raw> python3 -I names.py <datadir>. Writes <datadir>/fix1-names.json."""
import json, os, re, sys, collections
RAW = os.environ["RAW"]; D = sys.argv[1]
P = {x["PIN"]: x for x in json.load(open(os.path.join(RAW, "parcels.json")))}
Z = json.load(open(os.path.join(RAW, "parcel-zones.json")))
A = json.load(open(os.path.join(RAW, "addr.json")))
sub = collections.defaultdict(collections.Counter); st = collections.defaultdict(collections.Counter)
zp = {}
for r in Z:
    zp[r["pin"]] = r; q = P.get(r["pin"])
    if not q: continue
    L = re.sub(r"^[0-9 ]+", "", (q["LegalDescr"] or "").upper())
    m = re.match(r"([A-Z][A-Z &'\.@-]+?)(?:\s+(?:PH|PHASE|SEC|BLK|LOT|UNIT|BLDG|SITE|II|III|IV|\d)|;|,|$)", L)
    sub[r["zone"] + "/" + r["kind"]][(m.group(1).strip() if m else L[:25])] += 1
for a in A:
    pin = int(a["PIN"]) if a["PIN"] else None
    if pin in zp: st[zp[pin]["zone"] + ("/water" if zp[pin].get("water") else "")][a["STREETNAME"]] += 1
json.dump({"note": __doc__, "neighborhoods": {k: v.most_common(20) for k, v in sorted(sub.items())}, "streets": {k: v.most_common(15) for k, v in sorted(st.items())}}, open(os.path.join(D, "fix1-names.json"), "w"), indent=1)
print("ok")
