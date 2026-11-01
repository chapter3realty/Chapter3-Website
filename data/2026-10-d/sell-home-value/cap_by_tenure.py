"""Horry County residential parcels with a building: county market value against taxable value, by the year of the
parcel's last recorded sale (layer 24 SaleDate). One ArcGIS statistics query per band. Writes cap-by-tenure.json.
Usage: python3 -I cap_by_tenure.py <datadir>"""
import sys, json, os, urllib.request, urllib.parse, time
D = sys.argv[1]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
ST = json.dumps([{"statisticType": "count", "onStatisticField": "OBJECTID", "outStatisticFieldName": "n"},
                 {"statisticType": "sum", "onStatisticField": "MarketProp", "outStatisticFieldName": "market"},
                 {"statisticType": "sum", "onStatisticField": "TaxableProp", "outStatisticFieldName": "taxable"}])
base = "LandUseCode LIKE '1%' AND MarketImprv > 0"
bands = [("before 2005", "SaleDate < DATE '2005-01-01'"), ("2005-2014", "SaleDate >= DATE '2005-01-01' AND SaleDate < DATE '2015-01-01'"),
         ("2015-2019", "SaleDate >= DATE '2015-01-01' AND SaleDate < DATE '2020-01-01'"), ("2020-2022", "SaleDate >= DATE '2020-01-01' AND SaleDate < DATE '2023-01-01'"),
         ("2023-2024", "SaleDate >= DATE '2023-01-01' AND SaleDate < DATE '2025-01-01'"), ("2025", "SaleDate >= DATE '2025-01-01' AND SaleDate < DATE '2026-01-01'"),
         ("2026", "SaleDate >= DATE '2026-01-01'"), ("no sale date", "SaleDate IS NULL")]
out = []
for name, w in bands:
    data = urllib.parse.urlencode({"where": base + " AND " + w, "outStatistics": ST, "returnGeometry": "false", "f": "json"}).encode()
    for i in range(4):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=300).read()); a = d["features"][0]["attributes"]; break
        except Exception as e: print("retry", e, d if 'd' in dir() else '', file=sys.stderr); time.sleep(4)
    out.append({"last_sale": name, "where": base + " AND " + w, "n": a["n"], "market": a["market"], "taxable": a["taxable"],
                "taxable_over_market": round(a["taxable"] / a["market"], 3) if a["market"] else None})
    print(out[-1], flush=True)
json.dump(out, open(os.path.join(D, "cap-by-tenure.json"), "w"), indent=1)
