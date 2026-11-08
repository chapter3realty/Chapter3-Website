"""Houses for sale now, from the CRM's public map API (active CCMLS listings), https://chapter3realty.com/homes/api/map .
The API returns at most 144 pins a call, so each search is cut into price slices (min/max) until every slice returns all
of its homes. A search that finds nothing returns filler pins with the filter dropped (field "closest"); those are skipped.
Sets pulled: every house (type=house), and houses with each beach and flood key (has=...), plus no HOA (not=hoa).
Pins (MLS number, point, price, size, town) stay in RAW and are never published; the page uses only counts and medians.
Run: RAW=<scratch> python3 -I pull_listings.py -> RAW/pins.json, RAW/listing-calls.json"""
import json, os, sys, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]; BASE = "https://chapter3realty.com/homes/api/map?"
calls = []
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(6):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
            calls.append({"url": url, "total": j["total"], "pins": len(j["pins"]), "closest": j.get("closest")}); return j
        except Exception as e: print("retry", url, e, file=sys.stderr); time.sleep(4 + 2 * i)
    raise SystemExit("failed " + url)
def pull(p, lo=0, hi=60000000):
    j = get(dict(p, min=lo, max=hi))
    if j.get("closest") or j["total"] == 0: return []
    if j["total"] <= len(j["pins"]): return j["pins"]
    if hi - lo <= 1000: print("cannot split", p, lo, hi, j["total"], file=sys.stderr); return j["pins"]
    mid = (lo + hi) // 2
    if hi > 3000000 and lo < 2000000: mid = max(lo + 1000, min(hi - 1000, 2000000 if lo < 2000000 else mid))
    return pull(p, lo, mid) + pull(p, mid + 1, hi)
H = {"type": "house"}
SETS = {"all": H}
for k in ["near_beach", "walk_to_beach", "beach_1mi", "east_of_17", "second_row", "water_ocean", "flood_zone", "str_allowed", "golf_cart_ok", "county_horry", "county_georgetown"]:
    SETS[k] = dict(H, has=k)
SETS["no_hoa"] = dict(H, **{"not": "hoa"})
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "sets": {}}
for name, p in SETS.items():
    tot = get(p)["total"]
    pins = pull(p); ids = {x["mls"] for x in pins}
    print(name, "total", tot, "pulled", len(ids), flush=True)
    out["sets"][name] = {"params": p, "total": tot, "mls": sorted(ids)}
    if name == "all": out["pins"] = {x["mls"]: {k: x.get(k) for k in ["lat", "lng", "price", "beds", "baths", "sqft", "acres", "addr", "status"]} for x in pins}
json.dump(out, open(os.path.join(RAW, "pins.json"), "w"))
json.dump(calls, open(os.path.join(RAW, "listing-calls.json"), "w"), indent=0)
print("calls", len(calls))
