"""Active for-sale listings in ZIP 29577 from the site's public map API (chapter3realty.com/homes/api/map), for counts,
medians and HOA fee brackets in aggregate only. The zoning-district test is in analyze_listings.py.
Splits price bands until each search returns every home (the API returns at most 144 pins a call).
HOA fee: the API's hoaMax filter (the site's "HOA up to $X a month"); a home's fee bracket is the first threshold where it appears.
Also records which listings the MLS subdivision field puts in "Market Common" and four nearby subdivisions.
Keeps MLS number (to drop duplicates), type, price, beds, square feet, lat, lng. No addresses, firms or photos are saved.
Run: RAW=<scratch> python3 -I pull_listings.py. Writes RAW/listings-29577.json (kept out of the repo)."""
import json, os, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["house", "townhouse", "condo", "manufactured", "land", "multi"]
HOA = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1500]
SUBS = ["Market Common", "Emmens Preserve", "Withers Preserve", "Cresswind", "Belle Harbor"]
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
def band(base, lo, hi, acc, warn):
    d = get(dict(base, min=lo, max=hi))
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(base, lo, mid, acc, warn); band(base, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([base, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        acc[p["mls"]] = {"type": base.get("type"), "price": num(p["price"]), "beds": p.get("beds"), "baths": p.get("baths"), "sqft": p.get("sqft") or None, "lat": p.get("lat"), "lng": p.get("lng")}
homes = {}; warn = []; totals = {}; meta = None
for t in TYPES:
    acc = {}; band({"zip": "29577", "type": t}, 0, 50000000, acc, warn); homes.update(acc)
    d = get({"zip": "29577", "type": t}); totals[t] = d["total"]; meta = d.get("meta")
    print(t, len(acc), d["total"], flush=True)
hoa = {}
for T in HOA:
    for t in ("house", "townhouse", "condo"):
        acc = {}; band({"zip": "29577", "type": t, "hoaMax": T}, 0, 50000000, acc, warn)
        for m in acc: hoa.setdefault(m, T)
    print("hoa", T, len(hoa), flush=True)
subs = {}
for s in SUBS:
    acc = {}
    for t in TYPES: band({"subdivision": s, "type": t}, 0, 50000000, acc, warn)
    subs[s] = sorted(acc); print(s, len(acc), flush=True)
    for m, h in acc.items(): homes.setdefault(m, h)
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "calls": calls, "api_totals_zip": totals, "truncated": warn,
           "meta": meta, "homes": homes, "hoa_first_threshold": hoa, "hoa_thresholds": HOA, "subdivisions": subs}, open(os.path.join(RAW, "listings-29577.json"), "w"))
print("homes", len(homes), "calls", calls, "truncated", warn)
