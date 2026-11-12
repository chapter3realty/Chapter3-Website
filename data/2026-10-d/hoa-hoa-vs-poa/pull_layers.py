"""Which associations are recorded under one master-planned community's name, from the Horry County Register of
Deeds name index (AcclaimWeb, "Search by name", the list of matching party names it shows before results).
Only association names are kept (names with ASSOC, REGIME, HPR, HORIZONTAL, COUNCIL, CONDO, OWNERS, CLUB,
COMMUNITY or MASTER). Person names are dropped. Doc types searched: RESTRICTIONS (082, value 170),
MASTER DEED (022, value 213), ARTICLES OF ASSOCIATION (023, value 144), CONDO LIEN (064, value 189).
Usage: python3 -I pull_layers.py <outdir>. Writes <outdir>/layers.json."""
import sys, json, re, time, datetime, http.cookiejar, urllib.request, urllib.parse
out = sys.argv[1] if len(sys.argv) > 1 else "."
B = "https://acclaimweb.horrycounty.org/AcclaimWeb"
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [("User-Agent", "Mozilla/5.0 (research; chapter3realty.com)")]
def post(url, data):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode())
    req.add_header("X-Requested-With", "XMLHttpRequest")
    for i in range(4):
        try: return op.open(req, timeout=120).read().decode("utf-8", "replace")
        except Exception as e: time.sleep(4)
    return ""
post(B + "/Search/Disclaimer?st=/AcclaimWeb/search/SearchTypeName", {"disclaimer": "true"})
DOC = {"170": "RESTRICTIONS", "213": "MASTER DEED", "144": "ARTICLES OF ASSOCIATION", "189": "CONDO LIEN"}
ASSOC = re.compile(r"ASSOC|REGIME|\bHPR\b|HORIZONTAL|COUNCIL|CONDO|OWNERS|CLUB|COMMUNITY|MASTER", re.I)
PLACES = ["BAREFOOT RESORT", "GRANDE DUNES", "MARKET COMMON", "KINGSTON PLANTATION", "PRINCE CREEK", "WILD WING", "CAROLINA FOREST", "PAWLEYS PLANTATION", "LITCHFIELD"]
res = {"source": B + "/search/SearchTypeName", "pulled": datetime.date.today().isoformat(), "doc_types": DOC, "places": {}}
for place in PLACES:
    r = {}
    for code, name in DOC.items():
        s = post(B + "/search/SearchTypeName?Length=6", {"SearchOnName": place, "PartyType": "Both", "BookTypes": "1,2,3,4,5,6,7,8",
                 "DocTypes": code, "RecordDateFrom": "1/1/1960", "RecordDateTo": "11/1/2026", "DateRangeList": ""})
        names = re.findall(r'"text":"([^"]+?) \((\d+)\)"', s)
        r[name] = sorted({n: int(c) for n, c in names if ASSOC.search(n) and n != place}.items())
        time.sleep(1)
    res["places"][place] = r
    print(place, {k: len(v) for k, v in r.items()}, flush=True)
json.dump(res, open(f"{out}/layers.json", "w"), indent=1)
