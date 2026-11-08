"""Every deed (Doc Type DEED (001), value 138) recorded in Horry County from 2025-11-01 to 2026-10-31 (the latest 12 full
months on the day of the pull), from the Register of Deeds' public index (AcclaimWeb), searched week by week.
Adapted from data/2026-10-d/buyers-new-construction/pull_deeds.py (same search, newer window).
A party name is kept only when it reads as a business (LLC, INC, LP, CORP, COMPANY, HOMES, BUILDERS, CONSTRUCTION,
DEVELOPMENT, PROPERTIES, GROUP) or a tax-sale or court party; every other name (a person) is saved as "".
Usage: python3 -I pull_deeds.py <this dir> -> raw/deeds-co.json"""
import json, sys, os, time, datetime, re, urllib.request, urllib.parse, http.cookiejar
D = sys.argv[1]
B = "https://acclaimweb.horrycounty.org/AcclaimWeb"
cj = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
UA = {"User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest"}
CO = re.compile(r"\b(LLC|L L C|INC|INCORPORATED|LP|LLP|CORP|CORPORATION|COMPANY|CO|HOMES|BUILDERS?|CONSTRUCTION|CONSTRUCTORS|DEVELOPMENT|PROPERTIES|GROUP|RESIDENTIAL|COMMUNITIES|LAND|HOLDINGS|PARTNERS|VENTURES|DELINQUENT TAX|SHERIFF|MASTER IN EQUITY|HOUSING AND URBAN)\b")
def keep(n): return n if n and CO.search(n) else ""
def req(url, data=None, tries=5):
    for i in range(tries):
        try:
            r = op.open(urllib.request.Request(url, data=urllib.parse.urlencode(data).encode() if data else None, headers=UA), timeout=120)
            return r.read()
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed " + url)
req(B + "/Search/Disclaimer?st=/AcclaimWeb/search/SearchTypeDocType", {"disclaimer": "true"})
start, end = datetime.date(2025, 11, 1), datetime.date(2026, 10, 31)
deeds, weeks = [], []
d0 = start
while d0 <= end:
    d1 = min(d0 + datetime.timedelta(days=6), end)
    f = lambda d: f"{d.month}/{d.day}/{d.year}"
    req(B + "/search/SearchTypeDocType?Length=6", {"DocTypes": "138", "DocTypesDisplay": "DEED (001)", "DateRangeList": " ", "RecordDateFrom": f(d0), "RecordDateTo": f(d1)})
    g = json.loads(req(B + "/Search/GridResults", {"page": "1", "size": "5000"}))
    if g["Total"] != len(g["Data"]): raise SystemExit(f"short page {d0} {g['Total']} {len(g['Data'])}")
    for r in g["Data"]:
        deeds.append({"BookPage": r.get("BookPage"), "RecordDate": r.get("RecordDate"), "Consideration": r.get("Consideration"),
                      "ParcelNumber": r.get("ParcelNumber"), "Comments": r.get("Comments"),
                      "DirectName": keep(r.get("DirectName")), "IndirectName": keep(r.get("IndirectName"))})
    weeks.append([str(d0), str(d1), g["Total"]]); print(d0, g["Total"], len(deeds), flush=True)
    d0 = d1 + datetime.timedelta(days=1); time.sleep(1)
json.dump({"source": B + "/search/SearchTypeDocType", "doc_type": "DEED (001)", "from": str(start), "to": str(end),
           "pulled": datetime.datetime.utcnow().isoformat() + "Z", "weeks": weeks,
           "note": "Party names kept only when they read as a business or a tax-sale or court party; a person's name is blanked.",
           "deeds": deeds}, open(os.path.join(D, "raw", "deeds-co.json"), "w"))
print("done", len(deeds))
