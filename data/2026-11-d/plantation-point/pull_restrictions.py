"""Recorded restrictions for Plantation Point and The Landing, from the Horry County Register of Deeds name index
(AcclaimWeb "Search by name", doc type RESTRICTIONS (082), value 170). Index rows only: the county keeps the images in Conway.
Parties are kept only as the index prints the subdivision name and the company on the other side.
Run: python3 -I pull_restrictions.py <this dir>. Writes raw/acclaim-restrictions-index.json."""
import sys, os, json, re, time, http.cookiejar, urllib.request, urllib.parse
D = sys.argv[1]; B = "https://acclaimweb.horrycounty.org/AcclaimWeb"
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())); op.addheaders = [("User-Agent", "Mozilla/5.0")]
def post(url, data):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode()); req.add_header("X-Requested-With", "XMLHttpRequest")
    for i in range(4):
        try: return op.open(req, timeout=120).read().decode("utf-8", "replace")
        except Exception: time.sleep(4)
    return ""
post(B + "/Search/Disclaimer?st=/AcclaimWeb/search/SearchTypeName", {"disclaimer": "true"})
base = {"PartyType": "Both", "BookTypes": "1,2,3,4,5,6,7,8", "DocTypes": "170"}
SEARCH = {"PLANTATION POINT": ["PLANTATION POINT", "PLANTATION POINT ADDITION THREE PH ONE", "PLANTATION POINT ADDITION THREE PH TWO", "PLANTATION POINT ADDITION TWO PHS III"],
          "LANDING AT PLANTATION": ["LANDING AT PLANTATION POINT"]}
rows, seen = [], set()
for s, names in SEARCH.items():
    for nm in names:
        post(B + "/search/SearchTypeName?Length=6", dict(base, SearchOnName=s, RecordDateFrom="1/1/1960", RecordDateTo="11/12/2026", DateRangeList=""))
        post(B + "/Search/SearchTypePreName", dict(base, NameList=nm, SearchOnName=s, RecordDateFrom="1/1/1960 12:00:00 AM", RecordDateTo="11/12/2026 12:00:00 AM",
             SearchOnLastOrBusinessName="", SearchOnFirstName="", ShowAllNames="", ShowAllLegals=""))
        for r in json.loads(post(B + "/Search/GridResults", {"page": 1, "size": 1000}) or '{"Data":[]}')["Data"]:
            k = (r["RecordDate"], r["BookPage"])
            if k in seen: continue
            seen.add(k); rows.append({"name": nm, "date": r["RecordDate"], "type": r["DocTypeDescription"], "book_page": r["BookPage"], "desc": r.get("Comments"), "cross": r.get("CrossPartyName")})
        time.sleep(1)
rows.sort(key=lambda r: r["date"])
json.dump({"source": B + "/search/SearchTypeName", "doc_type": "RESTRICTIONS (082), value 170", "searched": list(SEARCH), "read": time.strftime("%Y-%m-%d"),
           "note": "Index rows only. The county does not put document images online (data/2026-10-d/hoa-hoa-vs-poa/raw/acclaim-no-images.txt).", "rows": rows},
          open(os.path.join(D, "raw", "acclaim-restrictions-index.json"), "w"), indent=1)
print(len(rows))
