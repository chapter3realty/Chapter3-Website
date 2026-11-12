"""Active for-sale listings with the postal city Surfside Beach (public map API, city=Surfside Beach; the town-limits test is in analyze_listings.py), for counts and medians in aggregate only.
Splits price bands until each search returns every home (the API returns at most 144 pins a call).
Keeps MLS number (to drop duplicates), type, price, beds, square feet, lat, lng and tag. No addresses, firms or photos are saved.
Run: RAW=<scratch> python3 -I pull_listings.py. Writes RAW/listings-gc.json (kept out of the repo) and prints totals."""
import json, os, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["house", "townhouse", "condo", "manufactured", "land", "multi"]
CITY = "Surfside Beach"
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
def band(t, lo, hi, acc, warn, has):
    q = {"city": CITY, "type": t, "min": lo, "max": hi}
    if has: q["has"] = has
    d = get(q)
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(t, lo, mid, acc, warn, has); band(t, mid + 1, hi, acc, warn, has); return
    if d["total"] > len(d["pins"]): warn.append([t, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        acc[p["mls"]] = {"type": t, "price": num(p["price"]), "beds": p.get("beds"), "sqft": p.get("sqft") or None, "lat": p.get("lat"), "lng": p.get("lng"), "tag": p.get("tag") or ""}
res = {}; totals = {}; warn = []; meta = None
for t in TYPES:
    acc = {}; band(t, 0, 50000000, acc, warn, None)
    d = get({"city": CITY, "type": t}); totals[t] = d["total"]; meta = d.get("meta")
    print(t, "pins", len(acc), "api total", d["total"], flush=True); res.update(acc)
d = get({"city": CITY}); totals["all"] = d["total"]
feat = {}
for h in ["flood_zone", "str_allowed", "raised_home", "oceanfront", "ocean_view", "walk_to_beach", "no_hoa", "furnished", "waterfront"]:
    mls = set()
    for t in TYPES:
        acc = {}; band(t, 0, 50000000, acc, [], h); mls |= set(acc)
    feat[h] = sorted(mls); print(h, len(mls), flush=True)
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "calls": calls, "api_totals": totals, "truncated": warn, "meta": meta, "homes": res, "features": feat}, open(os.path.join(RAW, "listings-ssb.json"), "w"))
print("homes", len(res), "calls", calls, "truncated", warn)
