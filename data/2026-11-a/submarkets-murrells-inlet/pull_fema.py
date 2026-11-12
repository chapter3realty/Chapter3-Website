#!/usr/bin/env python3
"""OpenFEMA NFIP claims (FimaNfipClaims v2) for ZIP 29576, every year on file, and TIGERweb 2020 block groups in the area.
Policies: the Garden City folder's pull (raw/nfip-policies-29576.json, policies that began 2025-06-01 to 2026-05-31) is copied into RAW.
Run: RAW=<scratch> python3 -I pull_fema.py. Writes RAW/nfip-claims-29576.json and RAW/bg2020.geojson."""
import json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]
B = "https://www.fema.gov/api/open/v2/FimaNfipClaims"
f = "reportedZipCode eq '29576'"
sel = "yearOfLoss,dateOfLoss,countyCode,censusTract,censusBlockGroupFips,occupancyType,ratedFloodZone,amountPaidOnBuildingClaim,amountPaidOnContentsClaim,amountPaidOnIncreasedCostOfComplianceClaim,buildingDamageAmount,floodEvent,primaryResidenceIndicator,elevatedBuildingIndicator,originalConstructionDate,causeOfDamage,waterDepth"
rows = []; skip = 0
while True:
    u = B + "?" + urllib.parse.urlencode({"$filter": f, "$select": sel, "$top": "1000", "$skip": str(skip)}, quote_via=urllib.parse.quote)
    for i in range(6):
        try: got = json.loads(urllib.request.urlopen(u, timeout=300).read()).get("FimaNfipClaims", []); break
        except Exception as e: print("retry", e, flush=True); time.sleep(10)
    else: raise SystemExit("failed")
    rows += got; skip += 1000; print(len(rows), flush=True)
    if len(got) < 1000: break
json.dump({"url": u.split("&%24top")[0], "FimaNfipClaims": rows}, open(os.path.join(RAW, "nfip-claims-29576.json"), "w"))
u = ("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/1/query?where=1%3D1&geometry=-79.14,33.48,-78.94,33.70"
     "&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=GEOID,TRACT,BLKGRP,STATE,COUNTY&outSR=4326&f=geojson")
open(os.path.join(RAW, "bg2020.geojson"), "wb").write(urllib.request.urlopen(u, timeout=300).read())
print("bg", len(json.load(open(os.path.join(RAW, "bg2020.geojson")))["features"]))
