"""Verifier pass: rental-program oceanfront condos for sale, by size line and bedroom count (aggregates only)."""
import json, sys, time, urllib.request, urllib.parse
BASE = "https://chapter3realty.com/homes/api/map?"; UA = {"User-Agent": "Mozilla/5.0 (research)"}
base = {"type": "condo", "has": "county_horry,oceanfront_building,vacation_rental_program"}
edges = list(range(0, 400000, 10000)) + list(range(400000, 1000000, 50000)) + [1000000, 1500000, 2500000, 10000000]
seen, rows = set(), []
for a, b in zip(edges, edges[1:]):
    url = BASE + urllib.parse.urlencode(dict(base, min=a + (1 if a else 0), max=b, limit=144))
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90)); time.sleep(2.1)
    if j["total"] == 0: continue
    for x in j["pins"]:
        pr = int(x["price"].replace("$", "").replace(",", "")) if x.get("price", "").startswith("$") else None
        if x["mls"] in seen or pr is None or not (a < pr <= b): continue
        seen.add(x["mls"]); rows.append((x.get("sqft"), x.get("beds")))
out = {"n": len(rows), "beds_none": sum(1 for s, b in rows if b is None),
       "studios": sum(1 for s, b in rows if b == 0),
       "ge500_and_1bed": sum(1 for s, b in rows if s and s >= 500 and b and b >= 1),
       "ge500_studio": sum(1 for s, b in rows if s and s >= 500 and b == 0),
       "lt500_1bed": sum(1 for s, b in rows if s and s < 500 and b and b >= 1),
       "lt500_studio": sum(1 for s, b in rows if s and s < 500 and b == 0)}
print(json.dumps(out)); json.dump(out, open(sys.argv[1], "w"), indent=1)
