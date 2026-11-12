#!/usr/bin/env python3
"""Ocean Lakes Family Campground in Horry County parcel records (layer 24): every record whose legal description names
OCEAN LAKES, plus the parent parcel 45900000325 that the site records point to. Counts and medians only.
Run: python3 -I pull_ocean_lakes.py <datadir>. Writes <datadir>/ocean-lakes-findings.json. No PINs, owners or addresses kept."""
import sys, json, os, statistics, collections, urllib.request, urllib.parse
D = sys.argv[1]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
def q(p):
    return json.loads(urllib.request.urlopen(urllib.request.Request(U, data=urllib.parse.urlencode(dict(p, f="json")).encode()), timeout=300).read())
ids = sorted(q({"where": "LegalDescr LIKE '%OCEAN LAKES%'", "returnIdsOnly": "true"})["objectIds"])
rows = []
for i in range(0, len(ids), 500):
    rows += [f["attributes"] for f in q({"objectIds": ",".join(map(str, ids[i:i+500])), "outFields": "LandUseCode,MarketLand,MarketImprv,Acreage,OwnerState,LegalDescr", "returnGeometry": "false"})["features"]]
parent = q({"where": "PIN = 45900000325", "outFields": "LandUseCode,MarketLand,MarketImprv,Acreage,LegalDescr", "returnGeometry": "false"})["features"]
built = [r for r in rows if (r["MarketImprv"] or 0) > 0]
out = {"source": U, "where": "LegalDescr LIKE '%OCEAN LAKES%'", "records": len(rows),
       "with_building": len(built),
       "with_building_land_value_zero": sum(1 for r in built if not r["MarketLand"]),
       "with_building_acreage_zero": sum(1 for r in built if not r["Acreage"]),
       "median_building_value": statistics.median(r["MarketImprv"] for r in built),
       "land_use_codes": collections.Counter(r["LandUseCode"] for r in built).most_common(),
       "owner_state_top": collections.Counter(r["OwnerState"] for r in built).most_common(6),
       "legal_mentions_parent_45900000325": sum(1 for r in built if "45900000325" in (r["LegalDescr"] or "")),
       "parent_parcel": [p["attributes"] for p in parent]}
json.dump(out, open(os.path.join(D, "ocean-lakes-findings.json"), "w"), indent=1); print(json.dumps(out, indent=1))
