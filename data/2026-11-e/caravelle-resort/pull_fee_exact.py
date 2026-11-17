"""Second pass on the monthly HOA fee at Caravelle Resort (MLS subdivision "Caravelle Resort", 6900 N Ocean Blvd) and Caravelle Tower
(MLS subdivision "Caravelle Tower", 7000 N Ocean Blvd). For each building and bedroom group, the lowest and highest fee to the dollar,
found by bisection on hoaMax (the site's public map API, https://chapter3realty.com/homes/api/map, type=condo). Kept: per group the count
and the fee range in whole dollars, plus the count at each $25 bracket (counts only). No listing is kept.
Run: python3 -I pull_fee_exact.py <this dir>. Merges "fee_exact" into listings.json."""
import json, sys, time, re, urllib.request, urllib.parse, datetime, collections
D = sys.argv[1]
L = json.load(open(D + "/listings.json"))
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
AT = re.compile(r"^(6900|7000) (N OCEAN BLVD|OCEAN BLVD N)\b")
def ok(a): return bool(AT.match(re.sub(r"\bNORTH\b", "N", (a or "").upper().replace(".", ""))))
calls = []
def pins(sub, t):
    url = BASE + urllib.parse.urlencode({"type": "condo", "subdivision": sub, "hoaMax": t})
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); calls.append(url); time.sleep(2.1)
    return [x for x in j["pins"] if ok(x.get("addr"))]
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat()}
for sub, key in (("Caravelle Resort", "resort"), ("Caravelle Tower", "tower")):
    for b in (0, 1):
        n = sum(1 for x in pins(sub, 5000) if x.get("beds") == b)
        if n == 0: continue
        cnt = lambda t: sum(1 for x in pins(sub, t) if x.get("beds") == b)
        a, z = 0, 1500
        while z - a > 1:
            m = (a + z) // 2
            if cnt(m) >= 1: z = m
            else: a = m
        low = z
        a, z = low - 1, 1500
        while z - a > 1:
            m = (a + z) // 2
            if cnt(m) >= n: z = m
            else: a = m
        out[f"{key}_{b}"] = {"n": n, "lowest": low, "highest": z}
        print(key, b, out[f"{key}_{b}"], flush=True)
out["calls"] = calls
L["fee_exact"] = out
json.dump(L, open(D + "/listings.json", "w"), indent=1)
