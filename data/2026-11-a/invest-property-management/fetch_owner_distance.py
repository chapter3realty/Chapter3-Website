"""Where the owners of Horry County homes that are not taxed as the owner's legal residence get their tax bill.
Horry County GIS parcel layer 24 (same base filter as data/2026-10-d/sell-out-of-state-buyers row 6 and
data/2026-11-a/invest-condos/count_ratio.py): residential land use (LandUseCode LIKE '1%') with a building (MarketImprv > 0).
Legal-residence (4 percent) homes: AssessedProp < TaxableProp*0.05. Every other home (6 percent): AssessedProp >= TaxableProp*0.05.
Condo = legal description contains 'HPR' (horizontal property regime). Groups by OwnerState, and for SC by OwnerZip.
Run: python3 -I fetch_owner_distance.py <datadir>. Writes raw/owner-distance.json with every URL. No owner names are read."""
import json, sys, time, urllib.request, urllib.parse
D = sys.argv[1]; Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"
BASE = "LandUseCode LIKE '1%' AND MarketImprv > 0"
RATIO = {"res4": "AssessedProp < TaxableProp*0.05", "other6": "AssessedProp >= TaxableProp*0.05"}
KIND = {"condo": "LegalDescr LIKE '%HPR%'", "house_other": "LegalDescr NOT LIKE '%HPR%'"}
STAT = json.dumps([{"statisticType": "count", "onStatisticField": "OBJECTID", "outStatisticFieldName": "n"}])
def get(params):
    url = Q + urllib.parse.urlencode(params)
    for t in range(4):
        try: return url, json.load(urllib.request.urlopen(url, timeout=180))
        except Exception as e: time.sleep(5)
    raise SystemExit("failed " + url)
out = {"read": time.strftime("%Y-%m-%d"), "base": BASE, "ratio": RATIO, "kind": KIND, "q": {}}
for r, rw in RATIO.items():
    for k, kw in KIND.items():
        w = f"{BASE} AND {rw} AND {kw}"
        u0, c = get({"where": w, "returnCountOnly": "true", "f": "json"})
        u1, s = get({"where": w, "outStatistics": STAT, "groupByFieldsForStatistics": "OwnerState", "f": "json"})
        u2, z = get({"where": w + " AND OwnerState = 'SC'", "outStatistics": STAT, "groupByFieldsForStatistics": "OwnerZip", "f": "json"})
        out["q"][f"{r}_{k}"] = {"where": w, "count": c["count"], "count_url": u0, "state_url": u1, "zip_url": u2,
            "by_state": {(f["attributes"]["OwnerState"] or ""): f["attributes"]["n"] for f in s["features"]},
            "sc_by_zip": {(f["attributes"]["OwnerZip"] or ""): f["attributes"]["n"] for f in z["features"]},
            "exceeded": [s.get("exceededTransferLimit"), z.get("exceededTransferLimit")]}
        print(r, k, c["count"], len(s["features"]), len(z["features"]))
json.dump(out, open(D + "/raw/owner-distance.json", "w"), indent=1)
