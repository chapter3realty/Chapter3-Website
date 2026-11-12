"""What homes for sale on the Grand Strand say about renting, from the CRM's public map API.
Aggregate counts and median bands only: no address, MLS number or firm is kept.
Feature keys and labels come from /homes/api/filters (group "Community and HOA"):
  rentals_allowed "Can rent it out", long_term_rental_allowed "Long-term rentals allowed",
  str_allowed "Short-term rentals allowed", has_rental_income "Rents now",
  vacation_rental_program "In a rental program". A listing that says nothing has no flag.
'has=a,b' means both (checked: str_allowed 2,021 condos, str_allowed+long_term 1,915).
'beds=n' means n or more (checked against the pins), so exactly 2 = beds2 - beds3.
'max' is the list-price ceiling, 'hoaMax' the association fee ceiling per month.
Status is the API default, for sale (active).
Run: python3 -I pull_listings.py <outdir>. Writes <outdir>/listings-rental-flags.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"

def total(p):
    url = BASE + urllib.parse.urlencode(dict(p, limit=1))
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"})
    for _ in range(4):
        try:
            v = json.load(urllib.request.urlopen(req, timeout=60)).get("total")
            time.sleep(0.25)
            return v
        except Exception:
            time.sleep(3)
    return None

def has(p, extra):
    q = dict(p)
    q["has"] = ",".join([x for x in [p.get("has"), extra] if x])
    return total(q)

SEGMENTS = {
    "condo_mb_city_oceanfront_building": {"type": "condo", "city": "Myrtle Beach", "has": "oceanfront_building,inside_city_limits"},
    "condo_mb_city_all": {"type": "condo", "city": "Myrtle Beach", "has": "inside_city_limits"},
    "condo_nmb_oceanfront_building": {"type": "condo", "city": "North Myrtle Beach", "has": "oceanfront_building"},
    "condo_all": {"type": "condo"},
    "house_carolina_forest": {"type": "house", "has": "area_carolina_forest"},
    "house_conway": {"type": "house", "city": "Conway"},
    "house_mb_city": {"type": "house", "city": "Myrtle Beach", "has": "inside_city_limits"},
    "house_nmb": {"type": "house", "city": "North Myrtle Beach"},
    "house_surfside": {"type": "house", "city": "Surfside Beach"},
    "house_all": {"type": "house"},
}
FLAGS = ["rentals_allowed", "long_term_rental_allowed", "str_allowed", "has_rental_income", "vacation_rental_program", "furnished"]

def median_band(p, key, steps):
    n = total(p)
    if not n:
        return {"n": n}
    cdf = {}
    for s in steps:
        cdf[s] = total(dict(p, **{key: s}))
    half = n / 2
    hi = next((s for s in steps if cdf[s] is not None and cdf[s] >= half), None)
    lo = max([s for s in steps if hi is not None and s < hi] or [0])
    q1 = next((s for s in steps if cdf[s] is not None and cdf[s] >= n / 4), None)
    q3 = next((s for s in steps if cdf[s] is not None and cdf[s] >= 3 * n / 4), None)
    return {"n": n, "median_band": [lo, hi], "p25_at_or_below": q1, "p75_at_or_below": q3, "cdf": cdf}

res = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": BASE, "status": "for sale (API default)", "segments": {}}
for name, p in SEGMENTS.items():
    r = {"params": p, "total": total(p), "flags": {}}
    for f in FLAGS:
        r["flags"][f] = has(p, f)
    r["flags"]["str_and_long_term"] = has(p, "str_allowed,long_term_rental_allowed")
    r["flags"]["long_term_only_no_str_flag"] = (r["flags"]["long_term_rental_allowed"] or 0) - (r["flags"]["str_and_long_term"] or 0)
    res["segments"][name] = r
    print(name, r["total"], r["flags"], flush=True)

# Worked-example homes: price and fee bands for the kinds of home the page runs both ways.
PRICE_STEPS = list(range(100000, 1000001, 10000)) + [1250000, 1500000, 2000000, 5000000, 100000000]
FEE_STEPS = list(range(0, 1501, 25)) + [2000, 3000, 100000]
EX = {
    "2br_oceanfront_condo_mb_city_str_allowed": {"type": "condo", "city": "Myrtle Beach", "has": "oceanfront_building,inside_city_limits,str_allowed"},
}
# Houses were dropped from the worked examples on 2026-11-01: the page does not use their prices, and the CRM's
# per-visitor limit (300 searches per 10 minutes) made each price ladder take most of an hour.
BEDS = {"2br_oceanfront_condo_mb_city_str_allowed": 2}
res["examples"] = {}
for name, p in EX.items():
    b = BEDS[name]
    # exactly b bedrooms: the API has no exact filter ('beds' is n or more), so counts are differenced.
    lo = dict(p, beds=b); hi = dict(p, beds=b + 1)
    n_lo, n_hi = total(lo), total(hi)
    n = n_lo - n_hi
    r = {"exact_beds": b, "n": n}
    # The price median is exact when every home fits in one answer (the API returns up to 144 pins).
    req = urllib.request.Request(BASE + urllib.parse.urlencode(lo), headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"})
    pins = json.load(urllib.request.urlopen(req, timeout=60))
    if pins.get("total", 0) <= len(pins.get("pins", [])):
        pr = sorted(int(x["price"].replace("$", "").replace(",", "")) for x in pins["pins"] if x.get("beds") == b and x.get("price"))
        m = len(pr) // 2
        r["price_n"] = len(pr)
        r["price_median"] = pr[m] if len(pr) % 2 else (pr[m - 1] + pr[m]) / 2
        r["price_p25"], r["price_p75"] = pr[len(pr) // 4], pr[(3 * len(pr)) // 4]
    else:
        price = {}
        for s in PRICE_STEPS:
            price[s] = (total(dict(lo, max=s)) or 0) - (total(dict(hi, max=s)) or 0)
        med = next((s for s in PRICE_STEPS if price[s] >= n / 2), None)
        r["price_cdf"] = price
        r["price_median_band"] = [max([s for s in PRICE_STEPS if s < med] or [0]), med]
    if name.startswith("2br"):
        fee = {}
        for s in FEE_STEPS:
            fee[s] = (total(dict(lo, hoaMax=s)) or 0) - (total(dict(hi, hoaMax=s)) or 0)
        fmed = next((s for s in FEE_STEPS if fee[s] >= n / 2), None)
        r["fee_cdf"] = fee
        r["fee_zero_or_blank"] = fee[0]
        r["fee_median_band_all"] = [max([s for s in FEE_STEPS if s < fmed] or [0]), fmed]
        wf = n - fee[0]
        fmed2 = next((s for s in FEE_STEPS if fee[s] - fee[0] >= wf / 2), None)
        r["fee_median_band_among_with_fee"] = [max([s for s in FEE_STEPS if s < fmed2] or [0]), fmed2]
    res["examples"][name] = r
    print(name, n, r.get("price_median"), r.get("price_median_band"), r.get("fee_median_band_among_with_fee"), r.get("fee_zero_or_blank"), flush=True)

json.dump(res, open(f"{out}/listings-rental-flags.json", "w"), indent=1)
