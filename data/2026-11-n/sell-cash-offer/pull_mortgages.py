"""Pull Horry County MORTGAGE (002) index rows, week by week, from AcclaimWeb.
Usage: python3 -I pull_mortgages.py <outdir> 2025-10-01 2026-09-30
Writes <outdir>/raw/mortgages-YYYY-MM-DD.json per week and <outdir>/raw/mortgages-weeks.json (totals)."""
import sys, json, os, time, datetime, http.cookiejar, urllib.request, urllib.parse
out, d0, d1 = sys.argv[1], sys.argv[2], sys.argv[3]
# Raw downloads (deed index rows and parcel records carry owner names) stay outside the repo: set RAW, default <datadir>/raw.
RAW = os.environ.get("RAW", os.path.join(out, "raw")); os.makedirs(RAW, exist_ok=True)
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
a = datetime.date.fromisoformat(d0); z = datetime.date.fromisoformat(d1)
weeks = []
while a <= z:
    b = min(a + datetime.timedelta(days=6), z)
    f = os.path.join(RAW, f"mortgages-{a.isoformat()}.json")
    if not os.path.exists(f):
        post(B + "/search/SearchTypeDocType?Length=6", {"DocTypes": "199", "RecordDateFrom": f"{a.month}/{a.day}/{a.year}",
             "RecordDateTo": f"{b.month}/{b.day}/{b.year}", "DateRangeList": "", "X-Requested-With": "XMLHttpRequest"}, xhr=True)
        g = json.loads(post(B + "/Search/GridResults", {"page": 1, "size": 5000}))
        json.dump(g, open(f, "w"))
    g = json.load(open(f))
    weeks.append({"from": a.isoformat(), "to": b.isoformat(), "total": g.get("Total"), "rows": len(g["Data"])})
    print(weeks[-1], flush=True)
    a = b + datetime.timedelta(days=1)
json.dump(weeks, open(os.path.join(RAW, "mortgages-weeks.json"), "w"), indent=1)
