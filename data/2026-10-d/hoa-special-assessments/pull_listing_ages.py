"""Count condos for sale by the year the building was built, from the CRM's public map API
(aggregate counts only; no address, MLS number or price is kept).
Run: python3 -I pull_listing_ages.py <outdir>. Writes <outdir>/listing-ages.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
CITIES = ["", "Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City", "Murrells Inlet", "Little River", "Conway", "Pawleys Island"]
BANDS = [("before 1980", None, 1979), ("1980 to 1989", 1980, 1989), ("1990 to 1999", 1990, 1999),
         ("2000 to 2009", 2000, 2009), ("2010 to 2019", 2010, 2019), ("2020 or later", 2020, None)]
def total(params):
    url = BASE + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for i in range(3):
        try:
            return json.load(urllib.request.urlopen(req, timeout=60)).get("total"), url
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
    rows.append(r); print(r["city"], n, [x["count"] for x in r["bands"]], r["sum_of_bands"], flush=True)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "type": "condo", "status": "for sale (the API's default)", "rows": rows},
          open(f"{out}/listing-ages.json", "w"), indent=1)
