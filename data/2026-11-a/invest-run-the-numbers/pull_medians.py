"""Median asking price and median monthly HOA fee of active listings, found by counting (CRM public map API, aggregate only).
Houses with exactly 3 bedrooms (beds>=3 minus beds>=4) and condos with exactly 2 bedrooms (beds>=2 minus beds>=3), list price $50,000+.
The median is the lowest price (to the nearest $5,000) at or below which half the listings ask. Dues median the same way, $25 steps,
among listings that carry a dues figure up to $3,000 a month. Run: python3 -I pull_medians.py <datadir>. Writes medians.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))["total"]
        except Exception as e: err = e; time.sleep(3)
    raise SystemExit("failed " + url)
def exact(base, beds, extra):
    return total(dict(base, beds=beds, **extra)) - total(dict(base, beds=beds + 1, **extra))
def median(base, beds, key, lo, hi, step, extra0=None):
    extra0 = extra0 or {}
    n = exact(base, beds, extra0) if key == "max" else exact(base, beds, dict(extra0, hoaMax=3000))
    if n == 0: return None, 0
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if exact(base, beds, dict(extra0, **{key: mid})) >= n / 2: hi = mid
        else: lo = mid
    return hi, n
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "houses3": {}, "condos2": {}}
for z in ["29526","29527","29566","29568","29569","29572","29575","29576","29577","29579","29582","29588"]:
    b = {"zip": z, "type": "house", "min": 50000}
    p, n = median(b, 3, "max", 50000, 3000000, 5000)
    d, nd = median(b, 3, "hoaMax", 0, 3000, 25)
    nohoa = exact(b, 3, {"hoa": "0"})
    out["houses3"][z] = {"listings": n, "median_ask": p, "dues_known": nd, "median_dues": d, "no_hoa": nohoa}; print("house", z, out["houses3"][z], flush=True)
for z in ["29566","29572","29575","29576","29577","29579","29582"]:
    b = {"zip": z, "type": "condo", "min": 50000}
    p, n = median(b, 2, "max", 50000, 3000000, 5000)
    d, nd = median(b, 2, "hoaMax", 0, 3000, 25)
    out["condos2"][z] = {"listings": n, "median_ask": p, "dues_known": nd, "median_dues": d}; print("condo", z, out["condos2"][z], flush=True)
json.dump(out, open(D + "/medians.json", "w"), indent=1)
