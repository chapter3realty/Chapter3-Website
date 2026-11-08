"""Second pull for /buyers/pool-homes/: houses in a neighborhood with a community pool but no private pool, and the HOA fee they list.
Same method as pull_listings.py (aggregate counts and medians by counting; nothing about any one listing kept). Writes listings-extra.json.
Run: python3 -I pull_extra.py <datadir>"""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"; calls = []
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
            calls.append({"url": url, "total": j["total"], "echo": j.get("params")}); return j["total"]
        except Exception: time.sleep(4)
    raise SystemExit("failed " + url)
def median(base, key, lo, hi, step):
    n = total(base)
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if total(dict(base, **{key: mid})) >= n / 2: hi = mid
        else: lo = mid
    return hi
H = {"type": "house", "has": "county_horry"}
CP = {"type": "house", "has": "county_horry,community_pool", "not": "pool"}
PP = {"type": "house", "has": "county_horry,pool"}
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE}
out["community_pool_no_private"] = {"listings": total(CP), "median_ask_5k": median(CP, "max", 0, 10000000, 5000),
  "at_or_under": {str(t): total(dict(CP, max=t)) for t in [300000, 400000, 500000]},
  "fee_listed": total(dict(CP, hoaMax=5000)), "median_hoa_fee_5": median(dict(CP, hoaMax=5000), "hoaMax", 0, 5000, 5)}
out["private_pool"] = {"fee_listed": total(dict(PP, hoaMax=5000)), "fee_listed_above_0": total(dict(PP, hoaMax=5000)) - total(dict(PP, hoaMax=0))}
out["private_pool"]["median_hoa_fee_5_of_fee_listed"] = median(dict(PP, hoaMax=5000), "hoaMax", 0, 5000, 5)
out["all_houses_fee_listed"] = total(dict(H, hoaMax=5000)); out["all_houses_hoaMax0"] = total(dict(H, hoaMax=0))
out["community_pool_no_private_east_of_17"] = total(dict(CP, has=CP["has"] + ",east_of_17"))
print(json.dumps(out, indent=1))
out["calls"] = calls
json.dump(out, open(D + "/listings-extra.json", "w"), indent=1)
