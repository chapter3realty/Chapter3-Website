"""Active for-sale listings from the CRM's public map API (CCMLS feed), counted in aggregate only.
Pulls (1) every house and townhouse flagged new construction, (2) every house built 2016 to 2023
that is not flagged new construction (the nearly-new resale comparison), (3) every house for sale, for the share, (4) totals for counts
(all houses, new-never-occupied, each builder filter). Splits price bands until every pin comes back
(the API returns at most 144 pins per search).
Saved per listing: MLS number (to drop duplicates), type, price, beds, sqft, acres, year (from the "Built YYYY" tag),
city (the mailing city in the address, no street), lat, lng. No street, photo or firm is saved.
Usage: python3 -I pull_listings.py <this dir>  -> raw/listings.json"""
import json, sys, os, time, urllib.request, urllib.parse, datetime, re
D = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
calls = 0
def get(p):
    global calls; calls += 1
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
            if d.get("ok"): return d
        except Exception: pass
        time.sleep(4)
    raise SystemExit("failed " + url)
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
def city(addr):
    parts = [x.strip() for x in (addr or "").split(",")]
    return parts[-3] if len(parts) >= 3 else None
def band(q, lo, hi, acc, trunc):
    d = get(dict(q, min=lo, max=hi))
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(q, lo, mid, acc, trunc); band(q, mid + 1, hi, acc, trunc); return
    if d["total"] > len(d["pins"]): trunc.append([q, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        m = re.search(r"Built (\d{4})", p.get("tag") or "")
        acc[p["mls"]] = {"type": q["type"], "price": num(p["price"]), "beds": p.get("beds"), "sqft": p.get("sqft"),
                         "acres": num(p.get("acres")), "year": int(m.group(1)) if m else None, "city": city(p.get("addr")),
                         "lat": p.get("lat"), "lng": p.get("lng")}
out = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "api": BASE, "sets": {}, "totals": {}, "truncated": []}
SETS = {
  "new_house": {"type": "house", "has": "new_construction"},
  "new_townhouse": {"type": "townhouse", "has": "new_construction"},
  "nearlynew_house": {"type": "house", "not": "new_construction", "yearMin": "2016", "yearMax": "2023"},
  "all_house": {"type": "house"},
}
for k, q in SETS.items():
    acc = {}; band(q, 0, 6000000, acc, out["truncated"]); out["sets"][k] = {"query": q, "total_reported": get(q)["total"], "homes": acc}
    print(k, len(acc), out["sets"][k]["total_reported"], flush=True)
T = {"house_all": {"type": "house"}, "townhouse_all": {"type": "townhouse"}, "condo_all": {"type": "condo"}, "all_types": {},
     "new_all_types": {"has": "new_construction"}, "new_never_occupied_all": {"has": "quick_move_in"},
     "new_never_occupied_house": {"type": "house", "has": "quick_move_in"}, "new_condo": {"type": "condo", "has": "new_construction"}}
for b in ["dr_horton", "lennar", "bradley_jones", "beverly", "mungo", "beazer", "meritage", "stanley_martin", "pulte", "ryan", "chesapeake",
          "dream_finders", "clayton", "adams", "starlight", "great_southern", "ashton_woods"]:
    T["builder_" + b] = {"has": "new_construction,builder_" + b}
for k, q in T.items(): out["totals"][k] = {"query": q, "total": get(q)["total"]}
out["calls"] = calls
json.dump(out, open(os.path.join(D, "raw", "listings.json"), "w"))
print(json.dumps(out["totals"]), "calls", calls, "trunc", out["truncated"])
