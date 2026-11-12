"""Horry County homes taxed at the 6 percent ratio, grouped by owner name (county parcel layer 24).
Home = residential parcel (LandUseCode 1xx) with a building value (MarketImprv > 0).
6 percent = AssessedProp / TaxableProp between 0.055 and 0.065; 4 percent = between 0.035 and 0.045.
Usage: RAW=<scratch dir> python3 -I pull_owner_counts.py <this dir>
Writes RAW/homes-6pct.json (every 6 percent home with owner name, kept out of the repo) and raw/owner-count-queries.json (URLs and totals)."""
import sys, os, json, time, urllib.request, urllib.parse
D = sys.argv[1]; RAW = os.environ["RAW"]; os.makedirs(os.path.join(D, "raw"), exist_ok=True)
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
HOME = "LandUseCode LIKE '1%' AND MarketImprv > 0 AND TaxableProp > 0"
SIX = HOME + " AND AssessedProp > 0.055 * TaxableProp AND AssessedProp < 0.065 * TaxableProp"
FOUR = HOME + " AND AssessedProp > 0.035 * TaxableProp AND AssessedProp < 0.045 * TaxableProp"
def get(params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(Q, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(8)
    raise SystemExit("failed")
log = {"layer": Q, "read": time.strftime("%Y-%m-%d"), "queries": []}
for name, w in [("homes", HOME), ("six", SIX), ("four", FOUR)]:
    n = get({"where": w, "returnCountOnly": "true"})["count"]
    log["queries"].append({"name": name, "where": w, "count": n, "url": Q + "?" + urllib.parse.urlencode({"where": w, "returnCountOnly": "true", "f": "json"})})
    print(name, n, flush=True)
# Every 6 percent home, by OBJECTID pages (grouping on the server ignored the offset and repeated pages, 2026-11-04).
rows = []; last = -1
while True:
    d = get({"where": SIX + f" AND OBJECTID > {last}", "outFields": "OBJECTID,PIN,OwnerName,OwnerState,LegalDescr,TaxDistrict,MarketProp",
             "orderByFields": "OBJECTID", "resultRecordCount": 2000, "returnGeometry": "false"})
    f = [x["attributes"] for x in d["features"]]
    if not f: break
    rows += f; last = f[-1]["OBJECTID"]; print("rows", len(rows), flush=True)
log["queries"].append({"name": "six_all_rows", "where": SIX, "rows": len(rows)})
json.dump(rows, open(os.path.join(RAW, "homes-6pct.json"), "w"))
json.dump(log, open(os.path.join(D, "raw", "owner-count-queries.json"), "w"), indent=1)
