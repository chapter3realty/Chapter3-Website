"""Houses for sale with and without a private pool, from the CRM's public map API (active MLS listings), counted in aggregate.
No address, MLS number, firm or photo is kept: only counts, and medians found by counting (binary search on the max price or min size filter).
Pool = the CRM's "pool" key ("Private pool": the listing says the home has its own pool). Houses only (type=house): a condo listing's pool is the building's.
Run: python3 -I pull_listings.py <datadir>. Writes listings.json with every URL called."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"
calls = []
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
            calls.append({"url": url, "total": j["total"], "echo": j.get("params")}); return j
        except Exception as e: time.sleep(4)
    raise SystemExit("failed " + url)
def total(p): return get(p)["total"]
def echoed(p):
    """True when the API understood every parameter (it echoes back what it applied)."""
    e = urllib.parse.parse_qs(get(p).get("params") or "")
    return all(k in e for k in p)
def median(base, key, lo, hi, step, cnt=None):
    cnt = cnt or total
    n = cnt(base)
    if n == 0: return None
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if cnt(dict(base, **{key: mid})) >= n / 2: hi = mid
        else: lo = mid
    return hi
def median_min(base, key, lo, hi, step):
    """Median for a lower-bound filter (sqft is a minimum): the largest x with count(x) >= n/2."""
    n = total(base)
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if total(dict(base, **{key: mid})) >= n / 2: lo = mid
        else: hi = mid
    return lo
H = {"type": "house", "has": "county_horry"}
def w(extra_has=None, **kw):
    p = dict(H, **kw)
    if extra_has: p["has"] = H["has"] + "," + extra_has
    return p
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "group": "houses for sale, Horry County (has=county_horry, type=house)"}
P, NP = w("pool"), dict(H, **{"not": "pool"})
out["counts"] = {"houses": total(H), "pool": total(P), "not_pool": total(NP), "above_ground_pool": total(w("above_ground_pool")),
  "pool_and_community_pool": total(w("pool,community_pool")), "community_pool_no_private": total(dict(w("community_pool"), **{"not": "pool"})),
  "pool_no_hoa": total(dict(P, **{"not": "hoa"})), "all_no_hoa": total(dict(H, **{"not": "hoa"})),
  "georgetown_houses": total({"type": "house", "has": "county_georgetown"}), "georgetown_pool": total({"type": "house", "has": "county_georgetown,pool"})}
print("counts", out["counts"], flush=True)
out["median_ask_5k"] = {"houses": median(H, "max", 0, 10000000, 5000), "pool": median(P, "max", 0, 10000000, 5000), "not_pool": median(NP, "max", 0, 10000000, 5000)}
out["median_sqft_50"] = {"pool": median_min(P, "sqft", 0, 12000, 50), "not_pool": median_min(NP, "sqft", 0, 12000, 50)}
print("medians", out["median_ask_5k"], out["median_sqft_50"], flush=True)
out["at_or_under"] = {str(t): {"houses": total(dict(H, max=t)), "pool": total(dict(P, max=t))} for t in [200000, 300000, 400000, 500000, 600000, 750000, 1000000, 1500000, 2000000]}
print("bands", out["at_or_under"], flush=True)
# median ask inside one size band [a, b): count(sqft>=a, max) - count(sqft>=b, max)
def band_cnt(base, a, b):
    return lambda p: total(dict(p, sqft=a)) - (total(dict(p, sqft=b)) if b else 0)
out["size_bands"] = {}
for a, b in [(1500, 2000), (2000, 2500), (2500, 3000), (3000, 4000)]:
    row = {}
    for name, base in [("pool", P), ("not_pool", NP)]:
        c = band_cnt(base, a, b)
        row[name] = {"listings": c(base), "median_ask_5k": median(base, "max", 0, 10000000, 5000, c)}
    out["size_bands"][f"{a}-{b - 1}"] = row; print("band", a, b, row, flush=True)
FLAGS = ["community_pool", "hot_tub", "screened_porch", "fenced_yard", "new_construction", "waterfront", "golf_community", "flood_zone",
         "str_allowed", "east_of_17", "inside_city_limits", "one_level", "gated"]
out["flags"] = {f: {"pool": total(w("pool," + f)), "houses": total(w(f))} for f in FLAGS}
out["flags"]["built_2015_or_later"] = {"pool": total(dict(P, yearMin=2015)), "houses": total(dict(H, yearMin=2015))}
print("flags", out["flags"], flush=True)
PLACES = [("Myrtle Beach", {"city": "Myrtle Beach"}), ("North Myrtle Beach", {"city": "North Myrtle Beach"}), ("Conway", {"city": "Conway"}),
  ("Murrells Inlet", {"city": "Murrells Inlet"}), ("Surfside Beach", {"city": "Surfside Beach"}), ("Little River", {"city": "Little River"}),
  ("Longs", {"city": "Longs"}), ("Loris", {"city": "Loris"}), ("Aynor", {"city": "Aynor"}),
  ("Carolina Forest (area)", {"area": "area_carolina_forest"}), ("Socastee (area)", {"area": "area_socastee"}), ("Garden City (area)", {"area": "area_garden_city"})]
out["by_place"] = {}
for name, sel in PLACES:
    def mk(base):
        p = dict(base)
        if "city" in sel: p["city"] = sel["city"]
        if "area" in sel: p["has"] = p["has"] + "," + sel["area"]
        return p
    hp, pp, npp = mk(H), mk(P), mk(NP)
    if "city" in sel and not echoed(hp): out["by_place"][name] = {"error": "city not understood"}; continue
    row = {"params_pool": pp, "houses": total(hp), "pool": total(pp), "not_pool": total(npp)}
    row["pool_median_ask_5k"] = median(pp, "max", 0, 10000000, 5000) if row["pool"] >= 10 else None
    row["not_pool_median_ask_5k"] = median(npp, "max", 0, 10000000, 5000) if row["not_pool"] >= 10 else None
    out["by_place"][name] = row; print(name, {k: v for k, v in row.items() if k != "params_pool"}, flush=True)
gp = {"type": "house", "has": "county_georgetown,pool", "city": "Pawleys Island"}
out["pawleys_island"] = {"houses": total({"type": "house", "has": "county_georgetown", "city": "Pawleys Island"}), "pool": total(gp)}
out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1)
print("calls", len(calls))
