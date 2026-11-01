# Copied from data/2026-10-d/sell-home-value/pull_listings.py for this page (same method, own pull).
"""Active for-sale listings from the CRM's public map API, for counts and medians in aggregate only.
Splits price bands until each search returns every home (the API returns at most 144 pins a call).
Keeps MLS number (to drop duplicates), type, price, square feet, lat, lng and tag. No addresses, firms or photos are saved.
Run: python3 -I pull_listings.py <outdir>. Writes <outdir>/raw/listings-active.json (kept in RAW, default <outdir>/raw)."""
import json, sys, os, time, urllib.request, urllib.parse, datetime
out = sys.argv[1]; RAW = os.environ.get("RAW", os.path.join(out, "raw")); os.makedirs(RAW, exist_ok=True)
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
def band(t, lo, hi, acc, warn):
    d = get({"type": t, "min": lo, "max": hi})
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(t, lo, mid, acc, warn); band(t, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([t, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        acc[p["mls"]] = {"type": t, "price": num(p["price"]), "sqft": p.get("sqft") or None, "lat": p.get("lat"), "lng": p.get("lng"), "tag": p.get("tag") or ""}
res = {}; totals = {}; warn = []; meta = None
for t in TYPES:
    acc = {}; band(t, 0, 50000000, acc, warn)
    d = get({"type": t}); totals[t] = d["total"]; meta = d.get("meta")
    print(t, "pins", len(acc), "api total", d["total"], flush=True); res.update(acc)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "calls": calls, "api_totals": totals, "truncated": warn, "meta": meta, "homes": res}, open(os.path.join(RAW, "listings-active.json"), "w"))
print("homes", len(res), "calls", calls, "truncated bands", len(warn))
