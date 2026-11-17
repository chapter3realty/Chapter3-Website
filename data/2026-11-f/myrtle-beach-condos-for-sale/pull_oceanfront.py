"""Oceanfront or not, for the condos for sale in Myrtle Beach (MLS city), in aggregate. "Oceanfront building" = the site's feature key
oceanfront_building (the building sits on the ocean); "oceanfront unit" = oceanfront_unit (the unit faces the ocean). Slices by price like pull_listings.py,
joins the MLS numbers of each group to the listing cards in memory, and keeps only counts, price, size and HOA fee quartiles by group and bedrooms.
Not kept: an MLS number, address or single listing. Run: python3 -I pull_oceanfront.py <this dir>. Writes oceanfront.json."""
import json, sys, time, urllib.request, urllib.parse, datetime, statistics as st
from concurrent.futures import ThreadPoolExecutor
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/"; H = {"User-Agent": "Mozilla/5.0"}
def get(path, p):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(BASE + path + "?" + urllib.parse.urlencode(p), headers=H), timeout=90))
        except Exception: time.sleep(2 + 2 * i)
    raise SystemExit("failed")
def slices(extra):
    pins = {}
    def sl(lo, hi):
        d = get("map", dict({"type": "condo", "city": "Myrtle Beach", "min": lo, "max": hi}, **extra))
        if len(d["pins"]) >= d["total"] or hi - lo <= 1:
            for p in d["pins"]: pins[p["mls"]] = 1
            return
        m = (lo + hi) // 2; sl(lo, m); sl(m + 1, hi)
    sl(0, 20000000); return set(pins)
allm = slices({}); bld = slices({"has": "oceanfront_building"}); unit = slices({"has": "oceanfront_unit"})
print(len(allm), len(bld), len(unit), flush=True)
def card(m):
    for i in range(8):
        f = get("lookup", {"mls": m}).get("facts")
        if f: return f
        time.sleep(1 + i)
    return {}
ml = sorted(allm)
with ThreadPoolExecutor(3) as ex: cs = dict(zip(ml, ex.map(card, ml)))
def qs(v):
    v = sorted(v)
    if not v: return None
    q = st.quantiles(v, n=4) if len(v) > 3 else [v[0], st.median(v), v[-1]]
    return {"n": len(v), "min": v[0], "p25": q[0], "median": st.median(v), "p75": q[2], "max": v[-1]}
def grp(keys):
    c = [cs[m] for m in keys if cs.get(m) and cs[m].get("listPrice")]
    r = {"n": len(c), "price": qs([x["listPrice"] for x in c]), "hoa": qs([x["hoaMonthly"] for x in c if x.get("hoaMonthly")]), "year_built_median": st.median([x["yearBuilt"] for x in c if x.get("yearBuilt")])}
    r["by_beds"] = {}
    for b in ("0", "1", "2", "3"):
        g = [x for x in c if str(x.get("beds")) == b]
        r["by_beds"][b] = {"n": len(g), "price": qs([x["listPrice"] for x in g]), "sqft": qs([x["sqft"] for x in g if x.get("sqft")]), "hoa": qs([x["hoaMonthly"] for x in g if x.get("hoaMonthly")])}
    r["by_beds"]["4plus"] = {"n": sum(1 for x in c if (x.get("beds") or 0) >= 4)}
    return r
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "all": grp(allm), "oceanfront_building": grp(bld), "not_oceanfront_building": grp(allm - bld), "oceanfront_unit": grp(unit), "oceanfront_building_not_unit": grp(bld - unit)}
json.dump(out, open(D + "/oceanfront.json", "w"), indent=1); print("done")
