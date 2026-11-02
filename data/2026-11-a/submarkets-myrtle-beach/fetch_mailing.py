#!/usr/bin/env python3
"""Every county address point whose mailing city is Myrtle Beach, countywide, and the land use of its parcel.
Run: RAW=<scratch> python3 -I fetch_mailing.py
Writes RAW/mb-postal.json (PIN, ZIPCODE, SUBDIVISION, point; no street or house number) and RAW/mb-postal-landuse.json ({PIN: [LandUseCode, MarketImprv]})."""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def q(url, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
f1 = os.path.join(RAW, "mb-postal.json")
if not os.path.exists(f1):
    ids = sorted(q(PA % 22, {"where": "UPPER(POSTAL_CITY) = 'MYRTLE BEACH'", "returnIdsOnly": "true"})["objectIds"])
    rows = []
    for i in range(0, len(ids), 1000):
        fs = q(PA % 22, {"objectIds": ",".join(map(str, ids[i:i+1000])), "outFields": "PIN,ZIPCODE,SUBDIVISION", "returnGeometry": "true", "outSR": "4326"})["features"]
        rows += [dict(x["attributes"], x=round(x["geometry"]["x"], 6), y=round(x["geometry"]["y"], 6)) for x in fs if x.get("geometry")]
        print("addr", i, len(rows), flush=True)
    json.dump(rows, open(f1, "w"))
rows = json.load(open(f1))
f2 = os.path.join(RAW, "mb-postal-landuse.json")
lu = json.load(open(f2)) if os.path.exists(f2) else {}
pins = sorted(set(int(r["PIN"]) for r in rows if r.get("PIN")) - set(int(k) for k in lu))
for i in range(0, len(pins), 400):
    ch = pins[i:i+400]
    fs = q(PA % 24, {"where": "PIN IN (%s)" % ",".join(map(str, ch)), "outFields": "PIN,LandUseCode,MarketImprv", "returnGeometry": "false"})["features"]
    for f in fs: lu[str(f["attributes"]["PIN"])] = [f["attributes"]["LandUseCode"], f["attributes"]["MarketImprv"]]
    if i % 4000 == 0: print("lu", i, len(lu), flush=True); json.dump(lu, open(f2, "w"))
json.dump(lu, open(f2, "w")); print("done")
