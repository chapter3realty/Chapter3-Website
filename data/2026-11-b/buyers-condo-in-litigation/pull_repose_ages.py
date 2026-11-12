"""Count condos for sale by building age against South Carolina's eight-year limit on defect suits
(S.C. Code 15-3-640), from the CRM's public map API. Aggregate counts only: no address, MLS number or price is kept.
Run: python3 -I pull_repose_ages.py <outdir>. Writes <outdir>/repose-ages.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
CITIES = ["", "Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City", "Murrells Inlet", "Little River"]
BANDS = [("built 2019 or later", 2019, None), ("built 2018", 2018, 2018), ("built 2001 to 2017", 2001, 2017),
         ("built 1981 to 2000", 1981, 2000), ("built 1980 or earlier", None, 1980)]
def total(params):
    url = BASE + urllib.parse.urlencode(params)
    err = None
    for i in range(3):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "chapter3realty-research-script/1.0"}), timeout=60)).get("total"), url
        except Exception as e:
            err = e; time.sleep(2)
    return None, url + " ERR " + str(err)
rows = []
for city in CITIES:
    p0 = {"type": "condo"}
    if city: p0["city"] = city
    n, url = total(p0)
    r = {"city": city or "(all)", "all": n, "all_url": url, "bands": []}
    for name, a, b in BANDS:
        p = dict(p0)
        if a: p["yearMin"] = a
        if b: p["yearMax"] = b
        k, u = total(p)
        r["bands"].append({"band": name, "count": k, "url": u})
    r["sum_of_bands"] = sum(x["count"] or 0 for x in r["bands"])
    r["no_year_or_gap"] = (n or 0) - r["sum_of_bands"]
    rows.append(r); print(r["city"], n, [x["count"] for x in r["bands"]], r["sum_of_bands"], flush=True)
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "type": "condo", "status": "for sale (the API's default)",
           "rule": "S.C. Code 15-3-640: no defect suit more than eight years after substantial completion (exceptions in 15-3-670)",
           "rows": rows}, open(f"{out}/repose-ages.json", "w"), indent=1)
