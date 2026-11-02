"""Active for-sale listings with a Little River mailing address (CRM public map API, city=Little River), for counts and medians in aggregate only.
Splits price bands until each search returns every home (the API returns at most 144 pins a call).
Keeps MLS number (to drop duplicates), type, price, beds, square feet, acres, lat, lng and tag. No addresses, firms or photos are saved.
Run: RAW=<scratch> python3 -I pull_listings.py. Writes RAW/listings-little-river.json (kept out of the repo) and prints totals."""
import json, os, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["house", "townhouse", "condo", "manufactured", "land"]
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
def band(t, lo, hi, acc, warn):
    d = get({"city": "Little River", "type": t, "min": lo, "max": hi})
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(t, lo, mid, acc, warn); band(t, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([t, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        acc[p["mls"]] = {"type": t, "price": num(p["price"]), "beds": p.get("beds"), "sqft": p.get("sqft") or None, "acres": num(p.get("acres")), "lat": p.get("lat"), "lng": p.get("lng"), "tag": p.get("tag") or ""}
res = {}; totals = {}; warn = []; meta = None
for t in TYPES:
    acc = {}; band(t, 0, 50000000, acc, warn)
    d = get({"city": "Little River", "type": t}); totals[t] = d["total"]; meta = d.get("meta")
    print(t, "pins", len(acc), "api total", d["total"], flush=True); res.update(acc)
for h in ["flood_zone", "new_construction", "no_hoa", "private_dock", "boat_slip", "boat_access", "water_icw", "deep_water", "golf_community", "gated", "long_term_rental_allowed", "str_allowed", "acreage_lot", "septic", "rv_boat_parking"]:
    d = get({"city": "Little River", "type": "house", "has": h}); totals["house+" + h] = d["total"]; print(h, d["total"], d.get("params"))
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "calls": calls, "api_totals": totals, "truncated": warn, "meta": meta, "homes": res}, open(os.path.join(RAW, "listings-little-river.json"), "w"))
print("homes", len(res), "calls", calls, "truncated", warn)
