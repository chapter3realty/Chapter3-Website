"""Oceanfront condos for sale within a mile of Mar Vista Grande (site map API near=33.815286,-78.680278&miles=1&type=condo&has=oceanfront_unit),
year built from the listing card. Aggregate only: counts by year-built band and by subdivision (counts). Never saved: MLS number, address, price.
Run: python3 -I pull_nearby.py . Writes nearby.json."""
import json, sys, time, urllib.request, urllib.parse, collections, datetime
BASE = "https://chapter3realty.com/homes/api/"; UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
def get(path, p):
    for i in range(5):
        try: j = json.load(urllib.request.urlopen(urllib.request.Request(BASE + path + "?" + urllib.parse.urlencode(p), headers=UA), timeout=60)); time.sleep(2.1); return j
        except Exception: time.sleep(10)
P = {"near": "33.815286,-78.680278", "miles": 1, "type": "condo", "has": "oceanfront_unit"}
j = get("map", P); pins = j["pins"]; yb = collections.Counter(); sub = collections.Counter()
for x in pins:
    f = get("lookup", {"mls": x["mls"]})["facts"]; y = f.get("yearBuilt"); yb[("2006 or later" if y and y >= 2006 else "before 2006" if y else "no year")] += 1; sub[f.get("subdivision")] += 1
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "query": BASE + "map?" + urllib.parse.urlencode(P), "total": j["total"], "pins": len(pins), "year_built_bands": dict(yb), "subdivisions": sub.most_common()}
json.dump(out, open("nearby.json", "w"), indent=1); print(json.dumps(out, indent=1))
