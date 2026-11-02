"""Active for-sale listings with a Myrtle Beach mailing address (CRM public map API, city=Myrtle Beach), counted in aggregate only.
Splits price bands until each search returns every home (the API returns at most 144 pins a call).
For each home keeps the MLS number (to join flag searches and drop duplicates), type, price, beds, square feet, lat, lng, and which flag searches returned it.
No addresses, firms, URLs or photos are saved.
Run: RAW=<scratch> python3 -I pull_listings.py. Writes RAW/listings-mb.json (kept out of the repo) and prints totals."""
import json, os, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["house", "townhouse", "condo"]
FLAGS = ["inside_city_limits", "oceanfront_building", "str_allowed", "long_term_rental_allowed", "flood_zone", "vacation_rental_program", "new_construction"]
calls = 0
def get(p):
    global calls; calls += 1
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
def band(p, lo, hi, acc, warn):
    d = get(dict(p, min=lo, max=hi))
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(p, lo, mid, acc, warn); band(p, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([p, lo, hi, d["total"], len(d["pins"])])
    for x in d["pins"]: acc[x["mls"]] = x
homes = {}; totals = {}; warn = []; meta = None
for t in TYPES:
    acc = {}; band({"city": "Myrtle Beach", "type": t}, 0, 50000000, acc, warn)
    d = get({"city": "Myrtle Beach", "type": t}); totals[t] = d["total"]; meta = d.get("meta")
    for m, x in acc.items():
        homes[m] = {"type": t, "price": num(x["price"]), "beds": x.get("beds"), "sqft": x.get("sqft") or None, "lat": x.get("lat"), "lng": x.get("lng"), "flags": []}
    print(t, "pins", len(acc), "api total", d["total"], flush=True)
for f in FLAGS:
    for t in TYPES:
        acc = {}; band({"city": "Myrtle Beach", "type": t, "has": f}, 0, 50000000, acc, warn)
        d = get({"city": "Myrtle Beach", "type": t, "has": f}); totals[t + "+" + f] = d["total"]
        for m in acc:
            if m in homes: homes[m]["flags"].append(f)
        print(t, f, len(acc), d["total"], flush=True)
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "calls": calls, "api_totals": totals, "truncated": warn, "meta": meta, "homes": homes}, open(os.path.join(RAW, "listings-mb.json"), "w"))
print("homes", len(homes), "calls", calls, "truncated", warn)
