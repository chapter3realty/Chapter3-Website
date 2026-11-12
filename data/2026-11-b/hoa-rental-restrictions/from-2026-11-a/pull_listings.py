"""What homes for sale in Horry County say about renting, from the CRM's public map API (active MLS listings), counted in aggregate.
No address, MLS number, firm or photo is kept: only counts. Every URL called is in `calls`.
Flags (the CRM's /homes/api/filters, group "Community and HOA"), as the listing agent marked them:
  rentals_allowed ("Rentals allowed"), long_term_rental_allowed ("Long-term rentals allowed"), str_allowed ("Short-term rentals allowed").
  `not=` excludes a flag. str_allowed is a subset of rentals_allowed (checked: has=str_allowed&not=rentals_allowed returns 0).
HOA: hoa=0 is a listing with no association fee. "With an HOA fee" = all minus hoa=0.
Buckets: nightly = str_allowed; yearly only = rentals_allowed and not str_allowed; not marked = not rentals_allowed.
Run: python3 -I pull_listings.py <datadir>. Writes listings.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"
calls = []
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            n = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=90))["total"]
            calls.append({"url": url, "total": n}); time.sleep(1.2); return n
        except Exception: time.sleep(15)
    raise SystemExit("failed " + url)
def add(p, k, v):
    q = dict(p); q[k] = ",".join(x for x in [p.get(k), v] if x); return q
def buckets(p):
    n = total(p); nightly = total(add(p, "has", "str_allowed")); rent = total(add(p, "has", "rentals_allowed"))
    nm = total(add(p, "not", "rentals_allowed"))
    lt = total(add(p, "has", "long_term_rental_allowed"))
    return {"listings": n, "rentals_allowed": rent, "nightly": nightly, "yearly_only": rent - nightly, "not_marked": nm,
            "long_term_rental_allowed": lt, "check_sum": nightly + (rent - nightly) + nm == n}
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "county": "has=county_horry, status for sale (API default)"}
out["subset_check"] = {"condo": total({"type": "condo", "has": "county_horry,str_allowed", "not": "rentals_allowed"}),
                       "house": total({"type": "house", "has": "county_horry,str_allowed", "not": "rentals_allowed"})}
T = {}
for t in ["condo", "townhouse", "house"]:
    base = {"type": t, "has": "county_horry"}
    allb = buckets(base); nohoa = buckets(dict(base, hoa="0"))
    withhoa = {k: (allb[k] - nohoa[k]) if isinstance(allb[k], int) else None for k in allb}
    T[t] = {"all": allb, "no_hoa_fee": nohoa, "with_hoa_fee": withhoa}
    print(t, json.dumps(T[t]), flush=True)
out["by_type"] = T
AREAS = {
    "myrtle_beach_city": {"city": "Myrtle Beach", "has": "inside_city_limits"},
    "north_myrtle_beach": {"city": "North Myrtle Beach"},
    "surfside_beach": {"city": "Surfside Beach"},
    "garden_city": {"has": "area_garden_city"},
    "murrells_inlet": {"city": "Murrells Inlet"},
    "little_river": {"city": "Little River"},
    "carolina_forest": {"has": "area_carolina_forest"},
    "socastee": {"has": "area_socastee"},
    "conway": {"city": "Conway"},
    "longs": {"city": "Longs"},
}
A = {}
for name, p in AREAS.items():
    A[name] = {}
    for t in ["condo", "house"]:
        base = add(dict(p, type=t), "has", "county_horry")
        b = buckets(base)
        if t == "house":
            nh = total(dict(base, hoa="0")); b["no_hoa_fee"] = nh
            b["with_hoa_fee"] = b["listings"] - nh
            b["with_hoa_fee_not_marked"] = b["not_marked"] - total(dict(add(base, "not", "rentals_allowed"), hoa="0"))
            b["with_hoa_fee_nightly"] = b["nightly"] - total(dict(add(base, "has", "str_allowed"), hoa="0"))
        A[name][t] = b
    print(name, json.dumps(A[name]), flush=True)
out["by_area"] = A
out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1)
