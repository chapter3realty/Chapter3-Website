"""Review round 1 pull for /buyers/pool-homes/ (owner's eye: name the neighborhoods with a shared pool).
For five neighborhoods whose shared pools are in verified rows of batch 2026-10-b, count the houses for sale
(Horry County, the MLS subdivision words below), how many list a community pool, and their middle asking price
by counting (binary search on max, $5,000 steps). Also townhouses with a community pool. Aggregate only:
no address, MLS number or listing firm is kept. Run: python3 -I pull_neighborhoods.py <datadir>"""
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
def median(base, lo=0, hi=10000000, step=5000):
    n = total(base)
    if n == 0: return None
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if total(dict(base, max=mid)) >= n / 2: hi = mid
        else: lo = mid
    return hi
# page name -> MLS subdivision words (checked 2026-11-08: every house the words return has a 29579 or 29588 ZIP as expected)
NB = {"The Farm at Carolina Forest": "Carolina Forest - The Farm", "Berkshire Forest": "Berkshire Forest",
      "Waterbridge": "Waterbridge", "Plantation Lakes": "Plantation Lakes", "Myrtle Beach Golf and Yacht Club": "Golf & Yacht"}
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "neighborhoods": {}}
for name, sub in NB.items():
    H = {"type": "house", "subdivision": sub, "has": "county_horry"}
    r = {"subdivision_words": sub, "houses": total(H), "community_pool": total(dict(H, has="county_horry,community_pool")),
         "private_pool": total(dict(H, has="county_horry,pool")), "median_ask_5k": median(H),
         "at_or_under_300k": total(dict(H, max=300000)), "at_or_under_500k": total(dict(H, max=500000))}
    out["neighborhoods"][name] = r; print(name, r)
T = {"type": "townhouse", "has": "county_horry,community_pool"}
out["townhouse_community_pool"] = {"listings": total(T), "median_ask_5k": median(T), "all_townhouses": total({"type": "townhouse", "has": "county_horry"})}
print(out["townhouse_community_pool"])
out["calls"] = calls
json.dump(out, open(D + "/neighborhoods.json", "w"), indent=1)
