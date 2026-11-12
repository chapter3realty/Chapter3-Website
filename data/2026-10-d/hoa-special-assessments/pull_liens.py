"""Pull Horry County Register of Deeds index rows for CONDO LIEN (064) and CONDO LIEN SATISFACTION (036),
month by month, from AcclaimWeb (the county's public deed index).
Usage: RAW=<dir outside the repo> python3 -I pull_liens.py <outdir> 2015-01 2026-10
Writes RAW/liens-<doctype>-YYYY-MM.json per month (these carry owner names, so they stay out of the repo)
and <outdir>/raw/liens-months.json (the monthly totals only).
AcclaimWeb doc type values come from the search page's own list (doctypes.json): 189 = CONDO LIEN (064),
188 = CONDO LIEN SATISFACTION (036)."""
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
    for i in range(4):
        try: return op.open(req, timeout=180).read()
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed " + url)
post(B + "/Search/Disclaimer?st=/AcclaimWeb/search/SearchTypeDocType", {"disclaimer": "true"})
TYPES = {"189": "condo-lien", "188": "condo-lien-satisfaction"}
y, m = map(int, m0.split("-")); y1, mm1 = map(int, m1.split("-"))
months = []
while (y, m) <= (y1, mm1):
    a = datetime.date(y, m, 1)
    b = (datetime.date(y + (m == 12), m % 12 + 1, 1) - datetime.timedelta(days=1))
    row = {"month": f"{y:04d}-{m:02d}"}
    for code, name in TYPES.items():
        f = os.path.join(RAW, f"liens-{name}-{y:04d}-{m:02d}.json")
        if not os.path.exists(f):
            post(B + "/search/SearchTypeDocType?Length=6", {"DocTypes": code, "RecordDateFrom": f"{a.month}/{a.day}/{a.year}",
                 "RecordDateTo": f"{b.month}/{b.day}/{b.year}", "DateRangeList": "", "X-Requested-With": "XMLHttpRequest"}, xhr=True)
            g = json.loads(post(B + "/Search/GridResults", {"page": 1, "size": 5000}))
            json.dump(g, open(f, "w"))
            time.sleep(1)
        g = json.load(open(f))
        row[name] = {"total": g.get("Total"), "rows": len(g["Data"])}
        if g.get("Total") != len(g["Data"]): print("WARNING: page cut", row, file=sys.stderr)
    months.append(row); print(row, flush=True)
    m += 1
    if m == 13: y, m = y + 1, 1
json.dump({"source": B + "/search/SearchTypeDocType", "doc_types": TYPES, "pulled": datetime.date.today().isoformat(), "months": months},
          open(os.path.join(out, "raw", "liens-months.json"), "w"), indent=1)
