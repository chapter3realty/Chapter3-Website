"""The cost-to-own HOA pull (data/2026-11-a/buyers-cost-to-own/pull_hoa.py, fixed version: $0 tested first), run the same way
for three ZIP codes that file does not hold: 29585 (Pawleys Island and Litchfield), 29569 (Loris), 29511 (Aynor). Houses only.
Monthly HOA fee of houses for sale now (type=house, list price $50,000 or more), counted in aggregate; no listing is saved.
Run: python3 -I pull_hoa_extra.py <datadir>. Writes hoa-extra.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))["total"]
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
def cut(base, n, share, lo=0, hi=3000, step=25):
    if total(dict(base, hoaMax=0)) >= n * share: return 0
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if total(dict(base, hoaMax=mid)) >= n * share: hi = mid
        else: lo = mid
    return hi
AREAS = {"29585": "Pawleys Island and Litchfield", "29569": "Loris", "29511": "Aynor"}
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "api": BASE, "rule": __doc__, "areas": {}}
for z, name in AREAS.items():
    b = {"zip": z, "type": "house", "min": 50000}; n = total(b)
    r = {"listings": n}
    if n >= 20:
        r.update({"no_hoa": total(dict(b, hoa="0")), "q1": cut(b, n, .25), "median": cut(b, n, .5), "q3": cut(b, n, .75),
                  "at_or_under_300": total(dict(b, hoaMax=300)), "at_or_under_500": total(dict(b, hoaMax=500))})
    out["areas"][z] = {"name": name, "house": r}; print(z, name, r, flush=True)
json.dump(out, open(D + "/hoa-extra.json", "w"), indent=1)
