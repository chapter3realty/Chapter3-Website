"""Condos for sale now with city=Myrtle Beach, from the site's public map API (CCMLS active listings) and listing card /homes/api/lookup.
Slices the price range until each slice returns every pin (the map caps a pull near 143). Saves only fields for aggregates and the MLS number
(kept in the scratch cache, not on the page). Run: python3 -I pull_listings.py <this dir>. Writes cards.json (no address) and listings.json."""
import json, os, sys, time, urllib.request, urllib.parse, datetime
from concurrent.futures import ThreadPoolExecutor
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/"
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(2 + 2 * i)
    raise SystemExit("failed " + url)
base = {"type": "condo", "city": "Murrells Inlet"}
pins = {}
def sl(lo, hi):
    d = get("map", dict(base, min=lo, max=hi))
    if len(d["pins"]) >= d["total"] or hi - lo <= 1:
        for p in d["pins"]: pins[p["mls"]] = p
        return
    mid = (lo + hi) // 2
    sl(lo, mid); sl(mid + 1, hi)
sl(0, 20000000)
tot = get("map", base)
print("pins", len(pins), "total", tot["total"])
mls = sorted(pins)
def card(m):
    for i in range(8):
        f = get("lookup", {"mls": m}).get("facts")
        if f: return f
        time.sleep(1 + i)
    return {}
with ThreadPoolExecutor(3) as ex: cards = list(ex.map(card, mls))
json.dump({"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "refreshedAt": tot["meta"]["refreshedAt"], "total": tot["total"], "rule": __doc__, "cards": [{k: c.get(k) for k in ("listPrice","beds","baths","sqft","yearBuilt","type","subdivision","waterfront","city","zip","hoaMonthly","newConstruction","daysOnMarket")} | {"tag": pins[m].get("tag")} for m, c in zip(mls, cards)]}, open(os.path.join(D, "cards.json"), "w"))
json.dump(mls, open(os.path.join(D, "raw", "mls-list.json"), "w"))
print("cards", len(cards), "empty", sum(1 for c in cards if not c))
