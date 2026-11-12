"""Counts for /invest/condotel-financing/ from the CRM's public map API (active CCMLS listings), in aggregate only.
Groups: condos for sale in oceanfront buildings in Horry County (has=county_horry,oceanfront_building), and those
whose listing says the unit is in a rental program (+vacation_rental_program).
- Loan flags on the listing (fha_accepted, va_accepted, conventional_accepted, cash_only_listing): totals.
- Studios: total minus beds>=1 (the API's beds filter counts "at least").
- Size: the API has no size filter, so the pins are read in price slices of under 144 and the sqft field is
  counted against the 400 sq ft line in Fannie Mae's B4-2.1-03 and the 500 sq ft line in the Newrez 3/2026 checklist.
No MLS number, address, unit, single price or firm is kept. Calls spaced 2.1 s.
Run: python3 -I pull_counts.py <this folder>. Writes counts.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def q(p):
    url = BASE + urllib.parse.urlencode(dict(p, limit=144))
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90)); break
        except Exception:
            time.sleep(20)
    else: raise SystemExit("failed " + url)
    calls.append({"url": url, "total": j["total"], "refreshedAt": j.get("meta", {}).get("refreshedAt")}); time.sleep(2.1); return j
G = {"oceanfront_building": {"type": "condo", "has": "county_horry,oceanfront_building"},
     "in_program": {"type": "condo", "has": "county_horry,oceanfront_building,vacation_rental_program"}}
FLAGS = ["fha_accepted", "va_accepted", "conventional_accepted", "cash_only_listing", "str_allowed", "furnished"]
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "groups": {}}
for name, base in G.items():
    n = q(base)["total"]; g = {"params": base, "listings": n}
    g["flags"] = {f: q(dict(base, has=base["has"] + "," + f))["total"] for f in FLAGS}
    g["beds_at_least_1"] = q(dict(base, beds=1))["total"]; g["studios"] = n - g["beds_at_least_1"]
    # sizes by price slices
    sq, seen, mls = [], 0, set()
    edges = list(range(0, 400000, 10000)) + list(range(400000, 1000000, 50000)) + [1000000, 1500000, 2500000, 10000000]
    for a, b in zip(edges, edges[1:]):
        j = q(dict(base, min=a + (1 if a else 0), max=b))
        if j["total"] > 144: raise SystemExit(f"slice {a}-{b} has {j['total']}")
        seen += j["total"]
        if j["total"] == 0: continue  # an empty slice can still return nearby pins
        for x in j["pins"]:
            pr = int(x["price"].replace("$", "").replace(",", "")) if x.get("price", "").startswith("$") else None
            if x["mls"] in mls or pr is None or not (a < pr <= b or (a == 0 and pr == 0)): continue
            mls.add(x["mls"]); sq.append(x.get("sqft"))
    known = [s for s in sq if s]
    g["size"] = {"pins_read": len(sq), "slice_totals": seen, "unique_in_range": len(mls), "with_sqft": len(known),
                 "under_400": sum(1 for s in known if s < 400), "under_500": sum(1 for s in known if s < 500),
                 "at_least_500": sum(1 for s in known if s >= 500)}
    out["groups"][name] = g; print(name, json.dumps(g), flush=True)
out["calls"] = calls
json.dump(out, open(f"{D}/counts.json", "w"), indent=1)
print("done", len(calls))
