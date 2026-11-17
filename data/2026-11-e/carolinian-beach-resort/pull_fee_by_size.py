"""Carolinian: the monthly HOA fee by unit size, to the dollar, for the condos for sale at 2504 N Ocean Blvd.
Splits the 1-bedrooms by size (620 sq ft vs 763-783 sq ft) with the same hoaMax bisection as pull_fee_exact.py.
Source: https://chapter3realty.com/homes/api/map?type=condo&subdivision=Carolinian&hoaMax=<T>. Kept: per size group the count and the lowest and highest fee. No listing is kept.
Run: python3 -I pull_fee_by_size.py <this dir>. Merges "fee_by_size" into listings.json."""
import json, sys, time, re, urllib.request, urllib.parse, datetime
D = sys.argv[1]; L = json.load(open(D + "/listings.json"))
AT = re.compile(r"^2504 (N OCEAN BLVD|OCEAN BLVD N)\b")
def at(a): return bool(AT.match(re.sub(r"\bNORTH\b", "N", (a or "").upper().replace(".", ""))))
BASE = "https://chapter3realty.com/homes/api/map?"; UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}; calls = []
def pins(t):
    url = BASE + urllib.parse.urlencode({"type": "condo", "subdivision": "Carolinian", "hoaMax": t})
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); calls.append(url); time.sleep(2.1)
    return [x for x in j["pins"] if at(x.get("addr"))]
base = [x for x in json.load(urllib.request.urlopen(urllib.request.Request(BASE + urllib.parse.urlencode({"type": "condo", "subdivision": "Carolinian"}), headers=UA)))["pins"] if at(x.get("addr"))]
groups = {"1bd_620sqft": lambda x: x["beds"] == 1 and x["sqft"] == 620, "1bd_763_to_783sqft": lambda x: x["beds"] == 1 and x["sqft"] in (763, 783), "2bd": lambda x: x["beds"] == 2}
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat()}
for g, f in groups.items():
    total = sum(1 for x in base if f(x)); cnt = lambda t: sum(1 for x in pins(t) if f(x))
    n = cnt(1500); a, z = 0, 1500
    while z - a > 1:
        m = (a + z) // 2
        if cnt(m) >= 1: z = m
        else: a = m
    low = z; a, z = low - 1, 1500
    while z - a > 1:
        m = (a + z) // 2
        if cnt(m) >= n: z = m
        else: a = m
    out[g] = {"for_sale": total, "with_a_fee": n, "lowest": low, "highest": z}; print(g, out[g], flush=True)
out["calls"] = calls; L["fee_by_size"] = out; json.dump(L, open(D + "/listings.json", "w"), indent=1)
