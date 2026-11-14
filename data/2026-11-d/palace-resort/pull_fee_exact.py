"""Second pass on The Palace's monthly HOA fee: listings.json put every studio, every one-bedroom and every two-bedroom
for sale in a $25 bracket. This finds, for each bedroom group, the lowest and highest fee to the dollar by bisection
on hoaMax (the site's public map API, https://chapter3realty.com/homes/api/map, type=condo&subdivision=Palace, address
1605 S Ocean Blvd). Kept: per group the count and the fee range in whole dollars. No listing is kept.
Run: python3 -I pull_fee_exact.py <this dir>. Merges "fee_exact" into listings.json."""
import json, sys, time, re, urllib.request, urllib.parse, datetime
AT = re.compile(r"^1605 (S OCEAN BLVD|OCEAN BLVD S)\b")
def at1605(a): return bool(AT.match(re.sub(r"\bSOUTH\b", "S", (a or "").upper().replace(".", ""))))
D = sys.argv[1]
L = json.load(open(D + "/listings.json"))
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def pins(t):
    url = BASE + urllib.parse.urlencode({"type": "condo", "subdivision": "Palace", "hoaMax": t})
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); calls.append(url); time.sleep(2.1)
    return [x for x in j["pins"] if at1605(x.get("addr"))]
def count(t, b): return sum(1 for x in pins(t) if x.get("beds") == b)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat()}
for b in ("0", "1", "2"):
    n = L["fee"][b]["n"]; hi = int(L["fee"][b]["highest_at_or_under"]); lo = int(L["fee"][b]["lowest_at_or_under"]) - 25
    a, z = lo, hi            # lowest fee: smallest t with count(t) >= 1
    while z - a > 1:
        m = (a + z) // 2
        if count(m, int(b)) >= 1: z = m
        else: a = m
    low = z
    a, z = low - 1, hi       # highest fee: smallest t with count(t) == n
    while z - a > 1:
        m = (a + z) // 2
        if count(m, int(b)) >= n: z = m
        else: a = m
    out[b] = {"n": n, "lowest": low, "highest": z}
    print(b, out[b], flush=True)
out["calls"] = calls
L["fee_exact"] = out
json.dump(L, open(D + "/listings.json", "w"), indent=1)
