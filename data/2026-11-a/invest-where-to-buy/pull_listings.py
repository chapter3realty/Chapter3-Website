"""Active for-sale homes on the CRM's public map API (https://chapter3realty.com/homes/api/map), for counts and medians
in aggregate only. Three sets: every house, townhouse and condo for sale; those whose listing says short-term rentals are
allowed (has=str_allowed); those whose listing says the home can be rented out at all (has=rentals_allowed).
Splits price bands until each search returns every pin (the API returns at most 144 pins a call).
Keeps MLS number (to drop duplicates), type, price, beds, lat and lng. No address, firm or photo is saved.
Run: RAW=<scratch> python3 -I pull_listings.py. Writes RAW/listings.json (kept out of the repo)."""
import json, os, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["house", "townhouse", "condo"]
calls = 0
def get(p):
    global calls; calls += 1
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3 + 2 * i)
    raise SystemExit("failed " + url)
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
def band(base, lo, hi, acc, warn):
    d = get(dict(base, min=lo, max=hi))
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(base, lo, mid, acc, warn); band(base, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([base, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        acc[p["mls"]] = {"type": base["type"], "price": num(p["price"]), "beds": p.get("beds"), "lat": p.get("lat"), "lng": p.get("lng")}
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "api": BASE, "sets": {}, "api_totals": {}, "truncated": []}
for name, has in [("all", None), ("str_allowed", "str_allowed"), ("rentals_allowed", "rentals_allowed")]:
    homes = {}
    for t in TYPES:
        base = {"type": t, "status": "active"}
        if has: base["has"] = has
        acc = {}; band(base, 0, 30000000, acc, out["truncated"])
        d = get(base); out["api_totals"][name + "|" + t] = d["total"]; out["meta"] = d.get("meta")
        homes.update(acc); print(name, t, "pins", len(acc), "api total", d["total"], "calls", calls, flush=True)
    out["sets"][name] = homes
out["calls"] = calls
json.dump(out, open(os.path.join(RAW, "listings.json"), "w"))
print("done calls", calls, "truncated", out["truncated"][:5])
