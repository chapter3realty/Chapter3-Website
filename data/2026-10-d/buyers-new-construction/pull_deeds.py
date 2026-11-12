"""Every deed (Doc Type DEED (001), value 138) recorded in Horry County from 2025-10-01 to 2026-09-30,
from the Register of Deeds' public index (AcclaimWeb), searched week by week, results read from the grid JSON.
Then the county parcel record (GIS MapServer layer 24) for every parcel on a priced deed.
Usage: python3 -I pull_deeds.py <this dir> -> raw/deeds.json, raw/parcels.json"""
import json, sys, os, time, datetime, urllib.request, urllib.parse, http.cookiejar
D = sys.argv[1]
B = "https://acclaimweb.horrycounty.org/AcclaimWeb"
cj = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
UA = {"User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest"}
def req(url, data=None, tries=5):
    for i in range(tries):
        try:
            r = op.open(urllib.request.Request(url, data=urllib.parse.urlencode(data).encode() if data else None, headers=UA), timeout=120)
            return r.read()
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed " + url)
req(B + "/Search/Disclaimer?st=/AcclaimWeb/search/SearchTypeDocType", {"disclaimer": "true"})
start, end = datetime.date(2025, 10, 1), datetime.date(2026, 9, 30)
deeds, weeks = [], []
d0 = start
while d0 <= end:
    d1 = min(d0 + datetime.timedelta(days=6), end)
    f = lambda d: f"{d.month}/{d.day}/{d.year}"
    req(B + "/search/SearchTypeDocType?Length=6", {"DocTypes": "138", "DocTypesDisplay": "DEED (001)", "DateRangeList": " ", "RecordDateFrom": f(d0), "RecordDateTo": f(d1)})
    g = json.loads(req(B + "/Search/GridResults", {"page": "1", "size": "5000"}))
    if g["Total"] != len(g["Data"]): raise SystemExit(f"short page {d0} {g['Total']} {len(g['Data'])}")
    for r in g["Data"]:
        deeds.append({k: r.get(k) for k in ["BookPage", "RecordDate", "Consideration", "DirectName", "IndirectName", "Comments", "ParcelNumber"]})
    weeks.append([str(d0), str(d1), g["Total"]]); print(d0, g["Total"], len(deeds), flush=True)
    d0 = d1 + datetime.timedelta(days=1); time.sleep(1)
json.dump({"source": B + "/search/SearchTypeDocType", "doc_type": "DEED (001)", "from": str(start), "to": str(end),
           "pulled": datetime.datetime.utcnow().isoformat() + "Z", "weeks": weeks, "deeds": deeds}, open(os.path.join(D, "raw", "deeds.json"), "w"))
