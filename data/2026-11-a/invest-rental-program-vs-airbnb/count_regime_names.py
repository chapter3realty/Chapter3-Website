"""Horry County condo units (GIS parcel layer 24: LandUseCode 1xx, a building value, legal description containing 'HPR', the
same definition as data/2026-11-a/invest-condos) whose recorded regime name contains a word a lender's hotel test names:
RESORT, HOTEL, MOTEL, INN. Lender rule: Fannie Mae Selling Guide B4-2.1-03 ("has a legal or common name that contains hotel,
motel, or resort"). Counts only, with every query URL. Run: python3 -I count_regime_names.py <this folder>. Writes raw/regime-name-counts.json."""
import json, sys, time, urllib.request, urllib.parse
D = sys.argv[1]; Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"
BASE = "LegalDescr LIKE '%HPR%' AND LandUseCode LIKE '1%' AND MarketImprv > 0"
W = {"all_condo_units": BASE}
for w in ["RESORT", "HOTEL", "MOTEL", "INN", "SUITES"]:
    W["name_" + w.lower()] = BASE + f" AND LegalDescr LIKE '%{w}%'"
W["name_resort_hotel_motel"] = BASE + " AND (LegalDescr LIKE '%RESORT%' OR LegalDescr LIKE '%HOTEL%' OR LegalDescr LIKE '%MOTEL%')"
out = {"read": time.strftime("%Y-%m-%d"), "layer": Q[:-7], "counts": {}}
for k, w in W.items():
    url = Q + urllib.parse.urlencode({"where": w, "returnCountOnly": "true", "f": "json"})
    n = json.load(urllib.request.urlopen(url, timeout=120))["count"]
    out["counts"][k] = {"where": w, "url": url, "count": n}; print(k, n, flush=True)
# the distinct regime names behind the resort/hotel/motel count, with units each
url = Q + urllib.parse.urlencode({"where": W["name_resort_hotel_motel"], "outFields": "LegalDescr,TaxDistrict", "returnGeometry": "false", "f": "json", "resultRecordCount": 2000})
rows, off = [], 0
while True:
    j = json.load(urllib.request.urlopen(url + "&resultOffset=%d" % off, timeout=180)); f = [x["attributes"] for x in j.get("features", [])]
    rows += f; off += len(f)
    if not f or not j.get("exceededTransferLimit"): break
import collections, re
def regime(s):
    m = re.search(r"([A-Z0-9 &'/\.\-]*?(RESORT|HOTEL|MOTEL)[A-Z0-9 &'/\.\-]*?HPR)", (s or "").upper())
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else (s or "")[:60]
c = collections.Counter(regime(r["LegalDescr"]) for r in rows)
d = collections.Counter(str(r["TaxDistrict"]) for r in rows)
out["regimes"] = [{"name": k, "units": v} for k, v in c.most_common()]
out["tax_districts"] = dict(d.most_common())
json.dump(out, open(D + "/raw/regime-name-counts.json", "w"), indent=1)
print(len(rows), len(c)); print(c.most_common(40)); print(d.most_common(15))
