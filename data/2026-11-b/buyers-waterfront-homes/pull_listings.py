"""Active for-sale listings on the water across the CRM's search area (CRM public map API), for counts and medians in aggregate only.
For each home type and each water feature key, splits price bands until each search returns every home (the API returns at most 144 pins a call).
Keeps MLS number (to join the sets), type, price, square feet, acres, lat, lng, city and ZIP. No street addresses, firms or photos are saved.
Run: RAW=<scratch> python3 -I pull_listings.py. Writes RAW/listings-water.json (kept out of the repo) and prints totals."""
import json, os, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]
BASE = "https://chapter3realty.com/homes/api/map?"
KEYS = {"house": ["waterfront", "water_ocean", "water_icw", "water_marsh", "water_lake", "water_pond", "water_river", "water_canal", "water_creek", "deep_water", "private_dock", "boat_slip", "waterfront+nohoa", "oceanfront_unit", "oceanfront_building"],
        "townhouse": ["waterfront"], "condo": ["waterfront", "water_ocean", "water_icw", "water_marsh", "water_creek", "water_lake", "oceanfront_building", "oceanfront_unit", "private_dock"]}
TYPES = list(KEYS)
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
def q(t, k):
    p = {"type": t}
    if k == "waterfront+nohoa": p["waterfront"] = "1"; p["hoa"] = "0"
    elif k == "waterfront": p["waterfront"] = "1"
    else: p["has"] = k
    return p
def band(p, lo, hi, acc, warn):
    d = get(dict(p, min=lo, max=hi))
    if d["total"] == 0 or d.get("closest"): return   # the API fills an empty search with the nearest matches without the filter; take none
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(p, lo, mid, acc, warn); band(p, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([p, lo, hi, d["total"], len(d["pins"])])
    for x in d["pins"]:
        parts = [s.strip() for s in (x.get("addr") or "").split(",")]
        acc[x["mls"]] = {"price": num(x["price"]), "sqft": x.get("sqft") or None, "acres": num(x.get("acres")), "lat": x.get("lat"), "lng": x.get("lng"),
                         "city": parts[-3] if len(parts) >= 3 else "", "state": parts[-2] if len(parts) >= 2 else "", "zip": parts[-1] if parts else ""}
homes = {}; sets = {}; totals = {}; warn = []; meta = None
for t in TYPES:
    for k in KEYS[t]:
        acc = {}; p = q(t, k); band(p, 0, 50000000, acc, warn)
        d = get(p); totals[t + "+" + k] = d["total"]; meta = d.get("meta")
        sets[t + "+" + k] = sorted(acc)
        for m, v in acc.items(): homes[m] = dict(v, type=t)
        print(t, k, "pins", len(acc), "api total", d["total"], flush=True)
    d = get({"type": t}); totals[t] = d["total"]
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "calls": calls, "api_totals": totals, "truncated": warn, "meta": meta, "sets": sets, "homes": homes}, open(os.path.join(RAW, "listings-water.json"), "w"))
print("homes", len(homes), "calls", calls, "truncated", warn)
