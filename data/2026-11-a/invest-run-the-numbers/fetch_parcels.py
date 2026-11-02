"""Horry County GIS layer 24 (Parcels) value fields for every resale in the sibling deed pull recorded 2026-01-01 to 2026-09-30.
Input: the 2026-10-d deed file (data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json, 13,194 home sales,
Horry County AcclaimWeb DEED (001) recorded 2025-10-01..2026-09-30, made by that folder's pull_deeds.py and analyze.py).
Writes RAW/parcels-2026-sales.json (no owner fields). PINs stay in RAW, outside the repo.
Usage: RAW=<scratch> python3 -I fetch_parcels.py <sales.json>"""
import sys, json, os, time, urllib.request, urllib.parse
SALES = sys.argv[1]; RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
def q(params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
sales = [s for s in json.load(open(SALES))["sales"] if s["date"] >= "2026/01/01" and not s["builder"]]
pins = sorted({s["pin"] for s in sales}); print(len(sales), "resales", len(pins), "pins")
F = "PIN,LandUseCode,TaxDistrict,AssessedProp,MarketLand,MarketImprv,MarketProp,TaxableProp,SaleDate"
out = []
for i in range(0, len(pins), 200):
    out += [x["attributes"] for x in q({"where": "PIN IN (" + ",".join(pins[i:i + 200]) + ")", "outFields": F, "returnGeometry": "false"})["features"]]
    print(i, len(out), flush=True)
json.dump(out, open(os.path.join(RAW, "parcels-2026-sales.json"), "w"))
