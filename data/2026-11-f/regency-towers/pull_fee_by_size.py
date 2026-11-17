"""Regency Towers: the monthly HOA fee of the one-bedrooms for sale, by their size in square feet (606 or 693), by bisection on
hoaMax (https://chapter3realty.com/homes/api/map, type=condo&subdivision=Regency Towers, address 2511 S Ocean Blvd). Kept: per size the count
and the lowest and highest fee in whole dollars. No listing is kept. Run: python3 -I pull_fee_by_size.py <this dir>. Merges "fee_by_size" into listings.json."""
import json, sys, time, re, urllib.request, urllib.parse, datetime
AT = re.compile(r"^2511 (S OCEAN BLVD|OCEAN BLVD S)\b")
def at(a): return bool(AT.match(re.sub(r"\bSOUTH\b", "S", (a or "").upper().replace(".", ""))))
D = sys.argv[1]; L = json.load(open(D + "/listings.json"))
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}; calls = []
def pins(t):
    url = "https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode({"type": "condo", "subdivision": "Regency Towers", "hoaMax": t})
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); calls.append(url); time.sleep(1.5)
    return [x for x in j["pins"] if at(x.get("addr")) and x.get("beds") == 1]
full = pins(5000); sizes = {}
for x in full: sizes.setdefault(x["sqft"], 0); sizes[x["sqft"]] += 1
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "sizes_for_sale": {str(k): v for k, v in sizes.items()}}
def cnt(t, s): return sum(1 for x in pins(t) if x["sqft"] == s)
for s, n in sizes.items():
    a, z = 600, 800
    while z - a > 1:
        m = (a + z) // 2
        if cnt(m, s) >= 1: z = m
        else: a = m
    lo = z; a, z = lo - 1, 800
    while z - a > 1:
        m = (a + z) // 2
        if cnt(m, s) >= n: z = m
        else: a = m
    out[str(s)] = {"n": n, "lowest": lo, "highest": z}; print(s, out[str(s)], flush=True)
out["calls"] = calls; L["fee_by_size"] = out; json.dump(L, open(D + "/listings.json", "w"), indent=1)
