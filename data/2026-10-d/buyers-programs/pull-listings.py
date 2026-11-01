"""Counts active for-sale listings from the CRM's public map API (aggregate only, no addresses kept).
SC Housing's Homebuyer (Bond) price limit in Horry County is $450,000 (2026/2027 sheet).
Run: python3 -I pull-listings.py <outdir>. Writes listings-counts.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
CITIES = ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City", "Murrells Inlet", "Little River",
          "Conway", "Longs", "Loris", "Aynor"]
TYPES = ["", "house", "condo", "townhouse", "manufactured"]
def total(params):
    url = BASE + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for i in range(3):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=60))
            return d.get("total"), url
        except Exception as e:
            time.sleep(2); err = e
    return None, url + " ERR " + str(err)
rows = []
for scope in [""] + CITIES:
    for t in TYPES:
        for mx in [None, 450000]:
            p = {}
            if scope: p["city"] = scope
            if t: p["type"] = t
            if mx: p["max"] = mx
            n, url = total(p)
            rows.append({"city": scope or "(all)", "type": t or "(all)", "max": mx, "total": n, "url": url})
            print(scope or "(all)", t or "(all)", mx, n, flush=True)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "rows": rows}, open(f"{out}/listings-counts.json", "w"), indent=1)
