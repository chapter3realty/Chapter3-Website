"""Condos for sale on the Grand Strand by building age, from the CRM's public map API.
Aggregate counts only: no address, MLS number, price or firm is kept.
For each age band: all condos, condos in elevator buildings, condos in oceanfront buildings,
and how many list an HOA fee at or under each monthly threshold (to find the median fee).
Run: python3 -I pull_condo_ages.py <outdir>. Writes <outdir>/condo-ages.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
# Year-built bands. Ages are for 2026: built 1986 or earlier is 40 years or older.
BANDS = [("built 1986 or earlier", None, 1986), ("built 1987 to 1996", 1987, 1996),
         ("built 1997 to 2006", 1997, 2006), ("built 2007 to 2016", 2007, 2016), ("built 2017 or later", 2017, None)]
THRESH = [200, 300, 400, 500, 600, 700, 800, 1000, 1200, 1500, 2000]
calls = []
def total(params):
    url = BASE + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    err = None
    for i in range(4):
        try:
            n = json.load(urllib.request.urlopen(req, timeout=90)).get("total")
            calls.append({"url": url, "total": n}); return n
        except Exception as e:
            err = e; time.sleep(3)
    calls.append({"url": url, "error": str(err)}); return None
def band_params(a, b, extra=None):
    p = {"type": "condo"}
    if a: p["yearMin"] = a
    if b: p["yearMax"] = b
    if extra: p.update(extra)
    return p
def median_fee(a, b, n):
    lo, hi = 0, 5000
    while hi - lo > 5:
        mid = (lo + hi) // 2
        k = total(band_params(a, b, {"hoaMax": mid}))
        if k is None: return None
        if k >= n / 2: hi = mid
        else: lo = mid
    return hi
rows = []
allp = {"type": "condo"}
grand = total(allp)
for name, a, b in BANDS + [("all", None, None)]:
    n = grand if name == "all" else total(band_params(a, b))
    r = {"band": name, "yearMin": a, "yearMax": b, "condos": n,
         "elevator_building": total(band_params(a, b, {"has": "elevator_building"})),
         "oceanfront_building": total(band_params(a, b, {"has": "oceanfront_building"})),
         "fee_at_or_under": {t: total(band_params(a, b, {"hoaMax": t})) for t in THRESH}}
    r["median_fee_month_within_5"] = median_fee(a, b, n)
    rows.append(r); print(json.dumps({k: v for k, v in r.items() if k != "fee_at_or_under"}), flush=True)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": "https://chapter3realty.com/homes/api/map (CRM active MLS listings, type=condo, status for sale)",
           "notes": "yearMin/yearMax are the listing's year built. hoaMax is the listed HOA fee a month. Median found by halving to within $5.",
           "rows": rows, "calls": calls}, open(f"{out}/condo-ages.json", "w"), indent=1)
