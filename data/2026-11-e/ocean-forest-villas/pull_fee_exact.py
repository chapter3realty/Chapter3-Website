"""Ocean Forest Villas' monthly HOA fee, by bedrooms, to the dollar, by bisection on hoaMax.
The site's public map API (https://chapter3realty.com/homes/api/map?subdivision=Ocean Forest Villas&hoaMax=T) returns the listings whose fee is T or less.
The $25-bracket pass in pull_listings.py stopped at $1,500 and left 6 of 10 listings (every two- and three-bedroom) unplaced, so here the search runs
from 0 to 6,000. Kept: per bedroom group the count and the lowest and highest fee in whole dollars. No listing is kept.
Run: python3 -I pull_fee_exact.py <this dir>. Merges "fee_exact" into listings.json."""
import json, sys, time, re, urllib.request, urllib.parse, datetime
AT = re.compile(r"^5601 (N OCEAN BLVD|OCEAN BLVD N|NORTH OCEAN BLVD)\b")
def atgs(a): return bool(AT.match(re.sub(r"\bNORTH\b", "N", (a or "").upper().replace(".", ""))))
D = sys.argv[1]
L = json.load(open(D + "/listings.json"))
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def pins(t):
    url = BASE + urllib.parse.urlencode({"type": "condo", "subdivision": "Ocean Forest Villas", "hoaMax": t})
    for i in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); break
        except Exception: time.sleep(8 * (i + 1))
    calls.append(url); time.sleep(2.1)
    return [x for x in j["pins"] if atgs(x.get("addr"))]
def count(t, b): return sum(1 for x in pins(t) if x.get("beds") == b)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "no_fee_listed": None}
top = len(pins(6000)); out["listings_with_a_fee_up_to_6000"] = top; out["total_at_address"] = L["at_1605"]
for b in sorted(L["beds"]):
    n = L["beds"][b]
    if count(6000, int(b)) < n: out[b] = {"n": n, "note": "some fees blank or over 6000"}; continue
    a, z = -1, 6000
    while z - a > 1:
        m = (a + z) // 2
        if count(m, int(b)) >= 1: z = m
        else: a = m
    low = z
    a, z = low - 1, 6000
    while z - a > 1:
        m = (a + z) // 2
        if count(m, int(b)) >= n: z = m
        else: a = m
    out[b] = {"n": n, "lowest": low, "highest": z}; print(b, out[b], flush=True)
out["calls"] = calls
L["fee_exact"] = out
json.dump(L, open(D + "/listings.json", "w"), indent=1)
