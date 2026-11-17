"""Two-bedroom monthly HOA fee range at Prince Resort by bisection on hoaMax (map API). Counts and range only. Run: python3 -I pull_fee_2br.py <dir>; merges fee_exact_2br into listings.json."""
import json, sys, time, urllib.request, urllib.parse, re
D = sys.argv[1]; L = json.load(open(D + "/listings.json"))
AT = re.compile(r"^(3500|3601) N OCEAN BLVD")
def cnt(t):
    u = "https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode({"type": "condo", "subdivision": "Prince Resort", "hoaMax": t})
    j = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (research)"}), timeout=60)); time.sleep(2.1)
    return sum(1 for x in j["pins"] if x["beds"] == 2 and AT.match(x["addr"].upper().replace(".", "")))
a, z = 1500, 2000
while z - a > 1:
    m = (a + z) // 2
    if cnt(m) >= 1: z = m
    else: a = m
low = z; a, z = low - 1, 2000
while z - a > 1:
    m = (a + z) // 2
    if cnt(m) >= 2: z = m
    else: a = m
L["fee_exact_2br"] = {"n": 2, "lowest": low, "highest": z}; json.dump(L, open(D + "/listings.json", "w"), indent=1); print(L["fee_exact_2br"])
