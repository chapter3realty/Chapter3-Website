"""Index rows (date, document type, parties, book/page, the index's description) for named associations, from the
Horry County Register of Deeds (AcclaimWeb "Search by name"). A party that is not a business or association is
written as "(person)". The county index is online; the document images are not (see raw/acclaim-no-images.txt).
Usage: python3 -I pull_layer_rows.py <outdir>. Writes <outdir>/raw/layer-rows.json."""
import sys, json, re, time, datetime, http.cookiejar, urllib.request, urllib.parse
out = sys.argv[1] if len(sys.argv) > 1 else "."
B = "https://acclaimweb.horrycounty.org/AcclaimWeb"
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [("User-Agent", "Mozilla/5.0 (research; chapter3realty.com)")]
def post(url, data):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode()); req.add_header("X-Requested-With", "XMLHttpRequest")
    for i in range(4):
        try: return op.open(req, timeout=120).read().decode("utf-8", "replace")
        except Exception: time.sleep(4)
    return ""
post(B + "/Search/Disclaimer?st=/AcclaimWeb/search/SearchTypeName", {"disclaimer": "true"})
BIZ = re.compile(r"ASSOC|ASSN|REGIME|\bHPR\b|COUNCIL|CONDO|OWNERS|CLUB|COMMUNITY|MASTER|\bLLC\b|\bINC\b|COMPANY|\bCO\b|CORP|\bLP\b|PARTNERS|DEVELOPMENT|HOMES|GRANDE DUNES|COUNTY|CITY OF|BANK|TRUST", re.I)
Q = [("GRANDE DUNES MASTER", ["GRANDE DUNES MASTER ASSOCIATION"]),
     ("PRINCE CREEK MASTER", ["PRINCE CREEK MASTER COMMUNITY ASSOCIATION INC", "PRINCE CREEK MASTER COMMUNITY ASSOCIATION", "PRINCE CREEK MASTER COMMUNITY ASSOC INC"]),
     ("PRINCE CREEK WEST ROAD", ["PRINCE CREEK WEST ROAD AND PARK DISTRICTS ASSOCIATION INC", "PRINCE CREEK WEST ROAD AND PARK DISTRICTS ASSOCIATION"]),
     ("KINGSTON PLANTATION MASTER", ["KINGSTON PLANTATION MASTER ASSOCIATION", "KINGSTON PLANTATION MASTER ASSOCIATION INC", "KINGSTON PLANTATION MASTER ASSN"]),
     ("WILD WING PLANTATION ROAD", ["WILD WING PLANTATION ROAD MAINTENANCE ASSOCIATION INC"]),
     ("BAREFOOT RESORT RESIDENTIAL", ["BAREFOOT RESORT RESIDENTIAL OWNERS ASSOCIATION INC", "BAREFOOT RESORT RESIDENTIAL OWNERS ASSOCIATION"]),
     ("BAREFOOT RESORT NONRESIDENTIAL", ["BAREFOOT RESORT NONRESIDENTIAL OWNERS ASSOCIATION INC"])]
res = {"source": B + "/search/SearchTypeName", "doc_type": "RESTRICTIONS (082), value 170", "pulled": datetime.date.today().isoformat(), "queries": {}}
for search, names in Q:
    base = {"PartyType": "Both", "BookTypes": "1,2,3,4,5,6,7,8", "DocTypes": "170"}
    rows, total = [], 0
    for nm in names:  # one name per search; a list of names returns nothing
        post(B + "/search/SearchTypeName?Length=6", dict(base, SearchOnName=search, RecordDateFrom="1/1/1960", RecordDateTo="11/1/2026", DateRangeList=""))
        post(B + "/Search/SearchTypePreName", dict(base, NameList=nm, SearchOnName=search, RecordDateFrom="1/1/1960 12:00:00 AM",
             RecordDateTo="11/1/2026 12:00:00 AM", SearchOnLastOrBusinessName="", SearchOnFirstName="", ShowAllNames="", ShowAllLegals=""))
        g = json.loads(post(B + "/Search/GridResults", {"page": 1, "size": 1000}) or '{"Data":[]}')
        total += g.get("Total") or 0
        for r in g["Data"]:
            cp = r.get("CrossPartyName") or ""
            rows.append({"date": r["RecordDate"], "type": r["DocTypeDescription"], "name": r.get("Name"), "cross_party": cp if BIZ.search(cp) else "(person)",
                         "book_page": r["BookPage"], "index_description": r.get("Comments")})
        time.sleep(1)
    rows.sort(key=lambda r: r["date"])
    res["queries"][search] = {"names": names, "total": total, "rows": rows}
    print(search, total, len(rows), flush=True)
json.dump(res, open(f"{out}/raw/layer-rows.json", "w"), indent=1)
