"""Condos for sale in Horry County (the site's county_horry flag), from the CRM's public map API (active MLS listings), counted in aggregate.
No address, MLS number, firm or photo is kept: only counts, and medians found by counting.
Run: python3 -I pull_listings.py <datadir>. Writes listings.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"
calls = []
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            n = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))["total"]
            calls.append({"url": url, "total": n}); return n
        except Exception as e: time.sleep(3)
    raise SystemExit("failed " + url)
def median(base, key, lo, hi, step, n):
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if total(dict(base, **{key: mid})) >= n / 2: hi = mid
        else: lo = mid
    return hi
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "groups": {}}
GROUPS = {
  "condos": {"type": "condo", "has": "county_horry"},
  "oceanfront_building": {"type": "condo", "has": "county_horry,oceanfront_building"},
  "not_oceanfront_building": None,
  "houses": {"type": "house", "has": "county_horry"},
  "townhouses": {"type": "townhouse", "has": "county_horry"},
}
FLAGS = ["str_allowed", "rentals_allowed", "long_term_rental_allowed", "vacation_rental_program", "conventional_accepted", "fha_accepted", "va_accepted",
         "cash_only_listing", "price_reduced", "furnished", "hoa_includes_insurance", "flood_zone", "high_rise", "elevator_building"]
for name, base in GROUPS.items():
    if base is None: continue
    n = total(base); g = {"params": base, "listings": n}
    g["median_ask_5k"] = median(base, "max", 0, 5000000, 5000, n)
    g["under"] = {t: total(dict(base, max=t)) for t in [100000, 150000, 200000, 250000, 300000, 400000, 500000]}
    if base["type"] == "condo":
        nd = total(dict(base, hoaMax=5000)); g["dues_known"] = nd
        g["median_dues_25"] = median(base, "hoaMax", 0, 5000, 25, nd)
        g["dues_at_or_under"] = {t: total(dict(base, hoaMax=t)) for t in [300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500]}
    if base["type"] != "condo": out["groups"][name] = g; print(name, json.dumps(g), flush=True); continue
    g["flags"] = {f: total(dict(base, has=(base.get("has", "") + "," + f).strip(","))) for f in FLAGS}
    for beds in [0, 1, 2, 3]:
        if base["type"] == "condo":
            g.setdefault("beds_exact", {})[beds] = (total(dict(base, beds=beds)) if beds else n) - total(dict(base, beds=beds + 1))
    out["groups"][name] = g; print(name, json.dumps({k: v for k, v in g.items() if k != "params"}), flush=True)
# the worked example's group: exactly 2 bedrooms, oceanfront building, Myrtle Beach mailing city
b2 = {"type": "condo", "has": "county_horry,oceanfront_building", "city": "Myrtle Beach", "beds": 2}
n2 = total(b2) - total(dict(b2, beds=3))
def exact2(extra): return total(dict(b2, **extra)) - total(dict(b2, beds=3, **extra))
lo, hi = 0, 5000000
while hi - lo > 5000:
    mid = (lo + hi) // 2 // 5000 * 5000
    if exact2({"max": mid}) >= n2 / 2: hi = mid
    else: lo = mid
nd2 = exact2({"hoaMax": 5000}); dlo, dhi = 0, 5000
while dhi - dlo > 25:
    mid = (dlo + dhi) // 2 // 25 * 25
    if exact2({"hoaMax": mid}) >= nd2 / 2: dhi = mid
    else: dlo = mid
out["oceanfront_building_2bed"] = {"listings": n2, "median_ask_5k": hi, "dues_known": nd2, "median_dues_25": dhi}
# by city, oceanfront-building condos
for city in ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City Beach", "Murrells Inlet", "Little River"]:
    b = {"type": "condo", "has": "county_horry,oceanfront_building", "city": city}
    n = total(b)
    if n < 10: out.setdefault("by_city", {})[city] = {"listings": n}; continue
    nd = total(dict(b, hoaMax=5000))
    out.setdefault("by_city", {})[city] = {"listings": n, "median_ask_5k": median(b, "max", 0, 5000000, 5000, n), "dues_known": nd, "median_dues_25": median(b, "hoaMax", 0, 5000, 25, nd)}
    print(city, out["by_city"][city], flush=True)
print("2bed", out["oceanfront_building_2bed"])
out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1)
