"""Homes for sale marked for short-term rentals, from the CRM's public map API (https://chapter3realty.com/homes/api/map).
Aggregate counts, median prices and median HOA-fee bands only. No address, MLS number or firm is kept in the output.
Flag: str_allowed ("Short-term rentals allowed", /homes/api/filters, group "Community and HOA"), as the listing agent marked it.
'beds=n' means n or more, so exactly 2 bedrooms = beds2 - beds3. 'hoaMax' is the monthly association fee ceiling.
The API returns up to 144 pins; when a segment fits, the price median is read from the pins (prices only).
The CRM allows about 300 searches per 10 minutes per visitor, so calls are spaced 2.1 seconds apart.
Run: python3 -I pull_listings.py <outdir>. Writes <outdir>/raw/listings-str.json."""
import json, sys, time, urllib.request, urllib.parse, datetime, statistics
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = 0
def get(p):
    global calls
    url = BASE + urllib.parse.urlencode(p)
    for _ in range(5):
        try:
            calls += 1
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
            time.sleep(2.1)
            return j
        except Exception as e:
            time.sleep(20)
    return {}
def total(p):
    return get(dict(p, limit=1)).get("total")

TOWNS = {
    "myrtle_beach_city": {"city": "Myrtle Beach", "has": "inside_city_limits"},
    "north_myrtle_beach": {"city": "North Myrtle Beach"},
    "surfside_beach": {"city": "Surfside Beach"},
    "garden_city": {"has": "area_garden_city"},
    "murrells_inlet": {"city": "Murrells Inlet"},
    "pawleys_island": {"city": "Pawleys Island"},
    "little_river": {"city": "Little River"},
    "conway": {"city": "Conway"},
}
def with_has(p, extra):
    q = dict(p); q["has"] = ",".join(x for x in [p.get("has"), extra] if x); return q

res = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": BASE, "status": "for sale (API default)", "towns": {}, "examples": {}}
for name, p in TOWNS.items():
    r = {}
    for t in ["condo", "house"]:
        q = dict(p, type=t)
        r[t] = {"total": total(q), "str_allowed": total(with_has(q, "str_allowed"))}
    res["towns"][name] = r
    print(name, r, calls, flush=True)

FEE_STEPS = list(range(0, 1501, 50)) + [2000, 100000]
EX = {
    "mb_city_oceanfront_condo_2br": ({"type": "condo", "city": "Myrtle Beach", "has": "oceanfront_building,inside_city_limits,str_allowed"}, 2, True),
    "nmb_oceanfront_condo_2br": ({"type": "condo", "city": "North Myrtle Beach", "has": "oceanfront_building,str_allowed"}, 2, True),
    "surfside_condo_2br": ({"type": "condo", "city": "Surfside Beach", "has": "str_allowed"}, 2, True),
    "garden_city_condo_2br": ({"type": "condo", "has": "area_garden_city,str_allowed"}, 2, True),
    "murrells_inlet_house_3br": ({"type": "house", "city": "Murrells Inlet", "has": "str_allowed"}, 3, False),
}
for name, (p, b, fee) in EX.items():
    lo, hi = dict(p, beds=b), dict(p, beds=b + 1)
    pins = get(lo)
    n_lo = pins.get("total"); n_hi = total(hi); n = (n_lo or 0) - (n_hi or 0)
    r = {"params": p, "exact_beds": b, "n": n}
    if n_lo is not None and n_lo <= len(pins.get("pins", [])):
        pr = sorted(int(x["price"].replace("$", "").replace(",", "")) for x in pins["pins"] if x.get("beds") == b and x.get("price"))
        r["price_n"] = len(pr); r["price_median"] = statistics.median(pr) if pr else None
        r["price_p25"] = pr[len(pr) // 4] if pr else None; r["price_p75"] = pr[(3 * len(pr)) // 4] if pr else None
    else:
        r["price_note"] = "more than 144 pins; median not read"
    if fee:
        cdf = {}
        for s in FEE_STEPS:
            cdf[s] = (total(dict(lo, hoaMax=s)) or 0) - (total(dict(hi, hoaMax=s)) or 0)
        r["fee_cdf"] = cdf
        r["fee_zero_or_blank"] = cdf[0]
        wf = n - cdf[0]
        m = next((s for s in FEE_STEPS if cdf[s] - cdf[0] >= wf / 2), None)
        r["fee_median_band_among_with_fee"] = [max([s for s in FEE_STEPS if s < m] or [0]), m]
    res["examples"][name] = r
    print(name, {k: v for k, v in r.items() if k != "fee_cdf"}, calls, flush=True)
res["calls"] = calls
json.dump(res, open(f"{out}/raw/listings-str.json", "w"), indent=1)
