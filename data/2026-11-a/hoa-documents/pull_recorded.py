"""Pull Horry County Register of Deeds index rows (AcclaimWeb, the county's public deed index), month by month,
for the document types that hold association papers: RESTRICTIONS (082, value 170) and MASTER DEED (022, value 213).
Value codes are the search page's own checkbox values (read 2026-11-04).
Usage: RAW=<dir outside the repo> python3 -I pull_recorded.py <outdir> 2012-01 2026-10 [types]
  types: comma list from 170,213,166 (166 = AMENDMENT DEED BOOK (069)); default 170,213.
Writes RAW/<type>-YYYY-MM.json per month (party names, so they stay out of the repo) and
<outdir>/raw/recorded-months.json (monthly totals only)."""
import sys, json, os, time, datetime, http.cookiejar, urllib.request, urllib.parse
out, m0, m1 = sys.argv[1], sys.argv[2], sys.argv[3]
RAW = os.environ.get("RAW", os.path.join(out, "raw-private")); os.makedirs(RAW, exist_ok=True)
os.makedirs(os.path.join(out, "raw"), exist_ok=True)
B = "https://acclaimweb.horrycounty.org/AcclaimWeb"
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [("User-Agent", "Mozilla/5.0 (research; chapter3realty.com)")]
def post(url, data, xhr=False):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode())
    if xhr: req.add_header("X-Requested-With", "XMLHttpRequest")
    for i in range(5):
        try: return op.open(req, timeout=180).read()
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(6)
    raise SystemExit("failed " + url)
post(B + "/Search/Disclaimer?st=/AcclaimWeb/search/SearchTypeDocType", {"disclaimer": "true"})
ALL = {"170": "restrictions", "213": "master-deed", "166": "amendment-deed-book"}
TYPES = {c: ALL[c] for c in (sys.argv[4].split(",") if len(sys.argv) > 4 else ["170", "213"])}
y, m = map(int, m0.split("-")); y1, mm1 = map(int, m1.split("-"))
months = []
while (y, m) <= (y1, mm1):
    a = datetime.date(y, m, 1)
    b = (datetime.date(y + (m == 12), m % 12 + 1, 1) - datetime.timedelta(days=1))
    row = {"month": f"{y:04d}-{m:02d}"}
    for code, name in TYPES.items():
        f = os.path.join(RAW, f"{name}-{y:04d}-{m:02d}.json")
        if not os.path.exists(f):
            post(B + "/search/SearchTypeDocType?Length=6", {"DocTypes": code, "RecordDateFrom": f"{a.month}/{a.day}/{a.year}",
                 "RecordDateTo": f"{b.month}/{b.day}/{b.year}", "DateRangeList": ""}, xhr=True)
            g = json.loads(post(B + "/Search/GridResults", {"page": 1, "size": 5000}))
            json.dump(g, open(f, "w"))
            time.sleep(0.7)
        g = json.load(open(f))
        row[name] = {"total": g.get("Total"), "rows": len(g["Data"])}
        if g.get("Total") != len(g["Data"]): print("WARNING: page cut", row, file=sys.stderr)
    months.append(row); print(row, flush=True)
    m += 1
    if m == 13: y, m = y + 1, 1
LBL = {"170": "RESTRICTIONS (082)", "213": "MASTER DEED (022)", "166": "AMENDMENT DEED BOOK (069)"}
json.dump({"source": B + "/search/SearchTypeDocType", "doc_types": {c: LBL[c] for c in TYPES},
           "pulled": datetime.date.today().isoformat(), "months": months},
          open(os.path.join(out, "raw", "recorded-months-" + "-".join(TYPES) + ".json"), "w"), indent=1)
