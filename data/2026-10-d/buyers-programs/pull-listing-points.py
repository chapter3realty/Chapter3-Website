"""Pulls map points of active for-sale listings at or under $450,000 (SC Housing Bond price limit) from the CRM's
public map API, splitting price bands until each search returns under 144 homes. Keeps only type, city, price,
lat, lng and MLS number (to drop duplicates). No addresses are saved. Run: python3.13 -I pull-listing-points.py <outdir>"""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
CITIES = ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet", "Little River", "Conway", "Longs", "Loris", "Aynor"]
TYPES = ["house", "townhouse", "condo", "manufactured"]
calls = 0
def get(p):
    global calls; calls += 1
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception:
            time.sleep(3)
    raise SystemExit("failed " + url)
def band(city, t, lo, hi, acc):
    d = get({"city": city, "type": t, "min": lo, "max": hi})
    if d["total"] > len(d["pins"]) and hi - lo > 1000:
        mid = (lo + hi) // 2
        band(city, t, lo, mid, acc); band(city, t, mid + 1, hi, acc); return
    if d["total"] > len(d["pins"]):
        print("WARN truncated", city, t, lo, hi, d["total"], file=sys.stderr)
    for p in d["pins"]:
        acc[p["mls"]] = {"city": city, "type": t, "price": p["price"], "lat": p.get("lat"), "lng": p.get("lng")}
res = {}
for c in CITIES:
    for t in TYPES:
        acc = {}; band(c, t, 0, 450000, acc)
        tot = get({"city": c, "type": t, "max": 450000})["total"]
        print(c, t, "points", len(acc), "api total", tot, flush=True)
        res.update(acc)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "calls": calls, "homes": res}, open(f"{out}/listing-points-450k.json", "w"))
print("homes", len(res), "calls", calls)
