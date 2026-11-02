"""Horry County GIS layer 24 (parcels) and layer 22 (address points) for every home parcel whose last recorded sale
falls in one of the periods below. Owner name, owner street and site address are read so the analysis can tell
(1) a person from a company and (2) whether the tax bill is mailed to the home itself. These raw files stay OUT of
the repo (PRIVATE dir). analyze_parcels.py writes only counts and medians.
Run: PRIVATE=<dir> python3 -I pull_parcels.py"""
import sys, json, os, time, urllib.request, urllib.parse
P = os.environ["PRIVATE"]; os.makedirs(P, exist_ok=True)
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def q(layer, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q % layer, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
F = "OBJECTID,PIN,LandUseCode,LegalDescr,AssessedProp,TaxableProp,MarketProp,MarketImprv,SaleDate,TaxDistrict,OwnerName,OwnerStreet,OwnerCity,OwnerState,OwnerZip,OwnerZipCode"
PERIODS = {"2024-2025": ("2024-01-01", "2026-01-01"), "2018-2019": ("2018-01-01", "2020-01-01")}
for name, (a, b) in PERIODS.items():
    f = os.path.join(P, "parcels-%s.json" % name)
    if os.path.exists(f): continue
    where = "LandUseCode LIKE '1%%' AND MarketImprv > 0 AND SaleDate >= DATE '%s' AND SaleDate < DATE '%s'" % (a, b)
    rows, last = [], 0
    while True:
        d = q(24, {"where": where + " AND OBJECTID > %d" % last, "outFields": F, "orderByFields": "OBJECTID", "returnGeometry": "false", "resultRecordCount": 2000})
        feats = [x["attributes"] for x in d["features"]]
        if not feats: break
        rows += feats; last = feats[-1]["OBJECTID"]; print(name, len(rows), flush=True)
    json.dump({"where": where, "pulled": time.strftime("%Y-%m-%d"), "rows": rows}, open(f, "w"))
    pins = sorted({str(int(r["PIN"])) for r in rows if r["PIN"]})
    addr = []
    for i in range(0, len(pins), 250):
        addr += [x["attributes"] for x in q(22, {"where": "PIN IN (" + ",".join(pins[i:i + 250]) + ")", "outFields": "PIN,StreetNum,STREETNAME,UNIT,ADDRESS,ZIPCODE,POSTAL_CITY", "returnGeometry": "false"})["features"]]
        if i % 5000 == 0: print("addr", name, i, len(addr), flush=True)
    json.dump(addr, open(os.path.join(P, "addresses-%s.json" % name), "w"))
