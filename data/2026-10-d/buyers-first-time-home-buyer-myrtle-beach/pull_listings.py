"""Active for-sale listings up to $400,000 from the CRM's public map API (CCMLS feed), counted in aggregate.
Splits price bands until each search returns every pin (the API returns at most 144 pins per search).
Keeps only MLS number (to drop duplicates), type, price, beds, baths, square feet, acres, lat, lng.
No addresses, photos or firms are saved. Totals with no price cap are pulled for each type too.
Usage: python3 -I pull_listings.py <this dir>  -> raw/listings-400k.json"""
import json, sys, os, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["house", "townhouse", "condo", "manufactured"]
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
def band(t, lo, hi, acc):
    d = get({"type": t, "min": lo, "max": hi})
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(t, lo, mid, acc); band(t, mid + 1, hi, acc); return
    if d["total"] > len(d["pins"]): print("WARN truncated", t, lo, hi, d["total"], file=sys.stderr)
    for p in d["pins"]:
        acc[p["mls"]] = {"type": t, "price": num(p["price"]), "beds": p.get("beds"), "baths": p.get("baths"), "sqft": p.get("sqft"),
                         "acres": num(p.get("acres")), "lat": p.get("lat"), "lng": p.get("lng")}
homes, totals = {}, {}
for t in TYPES:
    acc = {}; band(t, 0, 400000, acc); homes.update(acc)
    totals[t] = {"all": get({"type": t})["total"], "max400k": get({"type": t, "max": 400000})["total"], "points": len(acc)}
    print(t, totals[t], flush=True)
totals["(all types)"] = {"all": get({})["total"]}
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "api": BASE, "calls": calls, "totals": totals, "homes": homes},
          open(os.path.join(D, "raw", "listings-400k.json"), "w"))
print("homes", len(homes), "calls", calls)
