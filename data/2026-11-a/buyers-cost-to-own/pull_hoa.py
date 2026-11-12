"""Monthly HOA fee of homes for sale now, by ZIP area, counted in aggregate from the site's public map API
(https://chapter3realty.com/homes/api/map, CRM feed of CCMLS active listings). No listing is saved.
Houses (type=house) and condos (type=condo), every bedroom count, list price $50,000 or more.
hoaMax is the site's own filter ("Up to $X a month"); hoaMax=0 returns the same count as hoa=0 (no HOA listed).
Median: the lowest fee, in $25 steps, at or under which half the listings fall. Also the quartiles the same way.
"horry": the same counts summed over the 15 Horry County ZIPs (the whole feed also holds Georgetown, Pawleys Island,
Marion, Dillon and North Carolina ZIPs, so "all" is not Horry County).
Fix 2026-11-02 (verifier): cut() now tests $0 first, so a median or quartile of $0 prints as $0, not $25.
Run: python3 -I pull_hoa.py <datadir>. Writes hoa-by-area.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
from concurrent.futures import ThreadPoolExecutor
POOL = ThreadPoolExecutor(8)
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))["total"]
        except Exception as e: time.sleep(3)
    raise SystemExit("failed " + url)
HORRY = ["29511", "29526", "29527", "29544", "29566", "29568", "29569", "29572", "29575", "29576", "29577", "29579", "29581", "29582", "29588"]
def htotal(p):
    if p.get("zip") != "HORRY": return total(p)
    return sum(POOL.map(lambda z: total(dict(p, zip=z)), HORRY))
def cut(base, n, share, lo=0, hi=3000, step=25):
    if htotal(dict(base, hoaMax=0)) >= n * share: return 0
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if htotal(dict(base, hoaMax=mid)) >= n * share: hi = mid
        else: lo = mid
    return hi
AREAS = {"29579": "Carolina Forest", "29588": "Socastee", "29577": "Myrtle Beach (central and south)", "29572": "Myrtle Beach (north end)",
         "29575": "Surfside Beach", "29576": "Murrells Inlet and Garden City", "29582": "North Myrtle Beach", "29566": "Little River",
         "29568": "Longs", "29526": "Conway (29526)", "29527": "Conway (29527)"}
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "rule": __doc__, "areas": {}}
for kind in ("house", "condo"):
    for z, name in AREAS.items():
        b = {"zip": z, "type": kind, "min": 50000}
        n = total(b)
        if n < 20: out["areas"].setdefault(z, {"name": name})[kind] = {"listings": n}; continue
        no_hoa = total(dict(b, hoa="0"))
        r = {"listings": n, "no_hoa": no_hoa, "q1": cut(b, n, .25), "median": cut(b, n, .5), "q3": cut(b, n, .75),
             "at_or_under_300": total(dict(b, hoaMax=300)), "at_or_under_500": total(dict(b, hoaMax=500))}
        out["areas"].setdefault(z, {"name": name})[kind] = r; print(kind, z, name, r, flush=True)
for kind in ("house", "condo"):
    b = {"type": kind, "min": 50000}; n = total(b)
    out.setdefault("all", {})[kind] = {"listings": n, "no_hoa": total(dict(b, hoa="0")), "q1": cut(b, n, .25), "median": cut(b, n, .5), "q3": cut(b, n, .75)}
    print("all", kind, out["all"][kind], flush=True)
for kind in ("house", "condo"):
    b = {"zip": "HORRY", "type": kind, "min": 50000}; n = htotal(b)
    out.setdefault("horry", {"zips": HORRY})[kind] = {"listings": n, "no_hoa": htotal(dict(b, hoa="0")), "q1": cut(b, n, .25), "median": cut(b, n, .5), "q3": cut(b, n, .75)}
    print("horry", kind, out["horry"][kind], flush=True)
out["refreshedAt"] = json.load(urllib.request.urlopen(urllib.request.Request(BASE + "type=condo", headers={"User-Agent": "Mozilla/5.0"}), timeout=90))["meta"]["refreshedAt"]
json.dump(out, open(D + "/hoa-by-area.json", "w"), indent=1)
