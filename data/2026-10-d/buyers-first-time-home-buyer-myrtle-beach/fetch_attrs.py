"""Fetch Horry County parcel attributes (GIS layer 24) for every home sale in the
deed file built for /sell/out-of-state-buyers/ (data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json:
Horry County AcclaimWeb DEED (001), recorded 2025-10-01 to 2026-09-30, 13,194 kept home sales).
No owner names are requested. Output: raw/parcel-attrs.json.
Usage: python3 -I fetch_attrs.py <this dir> <path to out-of-state-buyers.json>"""
import sys, json, os, time, urllib.request, urllib.parse
D, SRC = sys.argv[1], sys.argv[2]
pins = sorted({s["pin"] for s in json.load(open(SRC))["sales"]})
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
F = "PIN,LandUseCode,MarketImprv,MarketLand,MarketProp,Acreage,TaxDistrict,AssessedProp,PARCELTYPE,CONDOLABEL"
out = []
for i in range(0, len(pins), 200):
    data = urllib.parse.urlencode({"where": "PIN IN (" + ",".join(pins[i:i+200]) + ")", "outFields": F, "returnGeometry": "false", "f": "json"}).encode()
    for k in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=180).read())
            if "error" in d: raise Exception(d["error"])
            out += [x["attributes"] for x in d["features"]]; break
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    print(i, len(out), flush=True)
json.dump({"source": Q, "fields": F, "read": time.strftime("%Y-%m-%d"), "rows": out}, open(os.path.join(D, "raw", "parcel-attrs.json"), "w"))
