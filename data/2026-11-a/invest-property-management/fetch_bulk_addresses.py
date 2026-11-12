"""Mailing addresses that receive the tax bills of 10 or more Horry County homes taxed at the 6 percent ratio
(timeshare and resort companies, builders holding new homes, large landlords, managers). Same base filter as
fetch_owner_distance.py. Groups by OwnerStreet + OwnerZip + OwnerState, kept only where the group has 10 or more.
Run: python3 -I fetch_bulk_addresses.py <datadir>. Writes raw/bulk-addresses.json (street lines are business
mailing addresses; owner names are not read)."""
import json, sys, time, urllib.request, urllib.parse
D = sys.argv[1]; Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"
BASE = "LandUseCode LIKE '1%' AND MarketImprv > 0 AND AssessedProp >= TaxableProp*0.05"
STAT = json.dumps([{"statisticType": "count", "onStatisticField": "OBJECTID", "outStatisticFieldName": "n"}])
out = {"read": time.strftime("%Y-%m-%d"), "min": 10, "q": {}}
for k, kw in {"condo": "LegalDescr LIKE '%HPR%'", "house_other": "LegalDescr NOT LIKE '%HPR%'"}.items():
    w = f"{BASE} AND {kw}"
    p = {"where": w, "outStatistics": STAT, "groupByFieldsForStatistics": "OwnerStreet,OwnerZip,OwnerState",
         "having": "COUNT(OBJECTID) >= 10", "orderByFields": "n DESC", "f": "json"}
    url = Q + urllib.parse.urlencode(p)
    d = json.load(urllib.request.urlopen(url, timeout=300))
    if "error" in d: raise SystemExit(json.dumps(d))
    rows = [[f["attributes"]["OwnerStreet"], f["attributes"]["OwnerZip"], f["attributes"]["OwnerState"], f["attributes"]["n"]] for f in d["features"]]
    out["q"][k] = {"where": w, "url": url, "groups": rows, "exceeded": d.get("exceededTransferLimit")}
    print(k, len(rows), sum(r[3] for r in rows), d.get("exceededTransferLimit"))
json.dump(out, open(D + "/raw/bulk-addresses.json", "w"), indent=1)
