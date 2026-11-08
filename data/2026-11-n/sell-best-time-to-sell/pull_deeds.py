"""Pull Horry County DEED (001) index rows from AcclaimWeb, one calendar month per search.
Usage: RAW=<scratch dir> python3 -I pull_deeds.py <outdir> 2019-01 2026-10
Writes RAW/deeds-YYYY-MM{a,b}.json (two half-month searches per month).
The index rows carry party names, so RAW stays outside the repo."""
import sys, json, os, time, datetime, calendar, http.cookiejar, urllib.request, urllib.parse
out, m0, m1 = sys.argv[1], sys.argv[2], sys.argv[3]
RAW = os.environ.get("RAW", os.path.join(out, "raw")); os.makedirs(RAW, exist_ok=True)
B = "https://acclaimweb.horrycounty.org/AcclaimWeb"
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [("User-Agent", "Mozilla/5.0 (research; chapter3realty.com)")]
def post(url, data, xhr=False):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode())
    if xhr: req.add_header("X-Requested-With", "XMLHttpRequest")
    for i in range(5):
        try: return op.open(req, timeout=300).read()
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(10)
    raise SystemExit("failed " + url)
post(B + "/Search/Disclaimer?st=/AcclaimWeb/search/SearchTypeDocType", {"disclaimer": "true"})
def months(a, b):
    y, m = map(int, a.split("-")); y1, mm1 = map(int, b.split("-"))
    while (y, m) <= (y1, mm1):
        yield y, m
        m += 1
        if m == 13: y, m = y + 1, 1
for y, m in months(m0, m1):
    last = calendar.monthrange(y, m)[1]
    # two half-month searches keep each under the grid's 5000-row page
    for (d0, d1, tag) in [(1, 15, "a"), (16, last, "b")]:
        f = os.path.join(RAW, f"deeds-{y}-{m:02d}{tag}.json")
        if os.path.exists(f): continue
        post(B + "/search/SearchTypeDocType?Length=6", {"DocTypes": "138", "RecordDateFrom": f"{m}/{d0}/{y}",
             "RecordDateTo": f"{m}/{d1}/{y}", "DateRangeList": "", "X-Requested-With": "XMLHttpRequest"}, xhr=True)
        g = json.loads(post(B + "/Search/GridResults", {"page": 1, "size": 5000}))
        if g.get("Total") != len(g["Data"]): print("WARNING total", g.get("Total"), "rows", len(g["Data"]), f, file=sys.stderr)
        json.dump(g, open(f, "w"))
        print(f, g.get("Total"), len(g["Data"]), flush=True)
