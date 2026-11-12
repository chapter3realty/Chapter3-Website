"""Active for-sale listings with a Murrells Inlet city in the CRM (public map API, city=Murrells Inlet), for counts and medians in aggregate only.
Splits price bands until each search returns every home (the API returns at most 144 pins a call).
Keeps MLS number (to drop duplicates), type, price, beds, square feet, lat, lng and tag. No addresses, firms or photos are saved.
Run: RAW=<scratch> python3 -I pull_listings.py. Writes RAW/listings-mi.json (kept out of the repo) and prints totals."""
import json, os, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["house", "townhouse", "condo", "manufactured", "land", "multi"]
Q = {"city": "Murrells Inlet"}
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
def band(extra, lo, hi, acc, warn):
    d = get(dict(Q, **extra, min=lo, max=hi))
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(extra, lo, mid, acc, warn); band(extra, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([extra, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        acc[p["mls"]] = {"type": extra.get("type"), "price": num(p["price"]), "beds": p.get("beds"), "sqft": p.get("sqft") or None, "lat": p.get("lat"), "lng": p.get("lng"), "tag": p.get("tag") or ""}
res = {}; totals = {}; warn = []; meta = None
for t in TYPES:
    acc = {}; band({"type": t}, 0, 50000000, acc, warn)
    d = get(dict(Q, type=t)); totals[t] = d["total"]; meta = d.get("meta")
    print(t, "pins", len(acc), "api total", d["total"], flush=True); res.update(acc)
d = get(Q); totals["all"] = d["total"]
feat = {}
for h in ["county_georgetown", "private_dock", "boat_slip", "boat_access", "deep_water", "marsh_view", "waterfront", "flood_zone", "golf_community", "on_golf_course",
          "gated", "no_hoa", "new_construction", "str_allowed", "long_term_rental_allowed", "rentals_allowed", "one_level", "marshwalk_1mi", "huntington_beach_state_park_5mi",
          "rv_boat_parking", "raised_home", "pool", "community_pool"]:
    mls = set()
    for t in TYPES:
        acc = {}; band({"type": t, "has": h}, 0, 50000000, acc, []); mls |= set(acc)
    feat[h] = sorted(mls); print(h, len(mls), flush=True)
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "query": Q, "calls": calls, "api_totals": totals, "truncated": warn, "meta": meta, "homes": res, "features": feat},
          open(os.path.join(RAW, "listings-mi.json"), "w"))
print("homes", len(res), "calls", calls, "truncated", warn)
