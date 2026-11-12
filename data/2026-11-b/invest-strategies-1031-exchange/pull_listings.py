"""Active for-sale listings from the site's own public map API (chapter3realty.com/homes/api/map), for counts and medians in aggregate only.
Types: condo, multi (2 to 4 units), house, townhouse. Splits price bands until each call returns every home (144 pins a call at most). Fetched with curl.
Keeps MLS number (to drop duplicates), type, price, square feet, beds, lat and lng. No address, firm, photo or URL is saved.
Run: RAW=<scratch> python3 -I pull_listings.py <outdir>. Writes RAW/listings-active.json, kept outside the repo (MLS numbers and points). analyze.py writes the repo copy raw/listings-prices.json (type, price, in Horry County; nothing else)."""
import json, sys, os, time, subprocess, urllib.parse, datetime
out = sys.argv[1]; RAW = os.environ.get("RAW", os.path.join(out, "raw")); os.makedirs(RAW, exist_ok=True)
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["condo", "multi", "house", "townhouse"]
calls = 0
def get(p):
    global calls; calls += 1
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.loads(subprocess.run(["curl", "-sS", "-m", "60", url], capture_output=True, check=True).stdout)
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
        acc[p["mls"]] = {"type": t, "price": num(p["price"]), "sqft": p.get("sqft") or None, "beds": p.get("beds"), "lat": p.get("lat"), "lng": p.get("lng"), "status": p.get("status")}
res = {}; totals = {}; warn = []
for t in TYPES:
    acc = {}; band(t, 0, 50000000, acc, warn)
    d = get({"type": t}); totals[t] = d["total"]
    print(t, "pins", len(acc), "api total", d["total"], flush=True); res.update(acc)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": BASE, "calls": calls, "api_totals": totals, "truncated": warn, "homes": res}, open(os.path.join(RAW, "listings-active.json"), "w"))
print("homes", len(res), "calls", calls, "truncated bands", len(warn))
