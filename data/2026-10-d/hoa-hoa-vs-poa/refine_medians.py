"""Narrow the median monthly fee band from fees-by-type.json to $5 steps (same API, same rule).
Run: python3 -I refine_medians.py <this dir>. Adds "median_fee_5" to each type in fees-by-type.json."""
import json, sys, time, urllib.request, urllib.parse
d = sys.argv[1]; f = f"{d}/fees-by-type.json"; res = json.load(open(f))
def total(p):
    url = "https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode(dict(p, limit=1))
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))["total"]
        except Exception: time.sleep(3)
for t, r in res["types"].items():
    lo, hi = r["median_fee_band_among_with_fee"]
    tot = total({"type": t}); zero = total({"type": t, "hoaMax": 0}); half = zero + (tot - zero) / 2
    steps = {s: total({"type": t, "hoaMax": s}) for s in range(lo, hi + 1, 5)}
    med = next(s for s in sorted(steps) if steps[s] >= half)
    r["median_fee_5"] = {"total_now": tot, "zero_now": zero, "half": half, "steps": steps, "median_at_or_below": med}
    print(t, tot, zero, med, steps, flush=True)
json.dump(res, open(f, "w"), indent=1)
