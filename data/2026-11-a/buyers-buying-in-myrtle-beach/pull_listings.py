"""Active for-sale listings from the Chapter3 CRM's public map API, counted in aggregate only (no addresses, firms, photos).
For each home type, and for each subset (listed in the last N days, price reduced, new construction), splits price bands
until a search returns every pin (the API returns at most 144 a call). Keeps only MLS number, type, price, lat, lng.
Run: RAW=<scratch> python3 -I pull_listings.py   -> RAW/listings-sets.json (MLS numbers and points stay in scratch).
Then analyze.py counts the homes inside the Census Horry County outline."""
import json, os, time, urllib.request, urllib.parse, datetime
from concurrent.futures import ThreadPoolExecutor
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
BASE = "https://chapter3realty.com/homes/api/map?"
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
def band(extra, lo, hi, acc, warn):
    d = get(dict(extra, min=lo, max=hi))
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(extra, lo, mid, acc, warn); band(extra, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([extra, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]: acc[p["mls"]] = [num(p["price"]), p.get("lat"), p.get("lng")]
SETS = [("all", {})] + [(f"dom{n}", {"domMax": str(n)}) for n in (30, 60, 90, 120, 180, 270, 365)] + [("price_reduced", {"has": "price_reduced"}), ("new_construction", {"has": "new_construction"})]
TYPES = ["house", "townhouse", "condo", "manufactured"]
def job(arg):
    name, extra, t = arg
    acc, warn = {}, []; e = dict(extra, type=t)
    band(e, 0, 50000000, acc, warn)
    tot = get(e)
    return name, t, acc, warn, tot["total"], tot.get("meta", {}).get("refreshedAt")
jobs = [(n, e, t) for n, e in SETS for t in TYPES]
out = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "sets": {}, "truncated": [], "api_totals": {}}
with ThreadPoolExecutor(8) as ex:
    for name, t, acc, warn, tot, ref in ex.map(job, jobs):
        out["sets"].setdefault(name, {})[t] = acc; out["truncated"] += warn; out["api_totals"][f"{name}/{t}"] = tot; out["refreshedAt"] = ref
        print(name, t, len(acc), tot, flush=True)
out["calls"] = calls
json.dump(out, open(os.path.join(RAW, "listings-sets.json"), "w"))
print("calls", calls, "truncated", len(out["truncated"]))
