"""Cross-check what Horry County land use codes 101 to 104 and 126 hold: for every parcel with a building under each code, count the county's address points (layer 22) on that PIN.
A duplex parcel should carry two addresses, a triplex three, a fourplex four. Run: RAW=<scratch> python3 -I check_codes.py <datadir>. Writes <datadir>/code-check.json (counts only)."""
import json, sys, os, time, urllib.request, urllib.parse, collections
D = sys.argv[1]; RAW = os.environ.get("RAW", os.path.join(D, "raw"))
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def q(layer, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q % layer, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
out = {"method": "Address points (layer 22) per PIN, for parcels (layer 24) with MarketImprv > 0 under each land use code. 101 sampled (first 400 PINs).", "codes": {}}
for code in ["101", "102", "103", "104", "126"]:
    feats = []; off = 0
    while True:
        d = q(24, {"where": "LandUseCode='%s' AND MarketImprv>0" % code, "outFields": "PIN", "returnGeometry": "false", "resultRecordCount": 2000})
        feats += [f["attributes"]["PIN"] for f in d["features"]]; off += 2000
        break
    pins = sorted(set(feats))[:400] if code == "101" else sorted(set(feats))
    per = collections.Counter()
    for i in range(0, len(pins), 200):
        d = q(22, {"where": "PIN IN (%s)" % ",".join(str(p) for p in pins[i:i + 200]), "outStatistics": json.dumps([{"statisticType": "count", "onStatisticField": "OBJECTID", "outStatisticFieldName": "n"}]), "groupByFieldsForStatistics": "PIN"})
        for f in d["features"]: per[f["attributes"]["PIN"]] = f["attributes"]["n"]
    dist = collections.Counter(min(per.get(p, 0), 9) for p in pins)
    out["codes"][code] = {"parcels_with_building": len(set(feats)), "checked": len(pins), "address_points_per_parcel": {str(k): v for k, v in sorted(dist.items())}}
    print(code, out["codes"][code], flush=True)
json.dump(out, open(os.path.join(D, "code-check.json"), "w"), indent=1)
