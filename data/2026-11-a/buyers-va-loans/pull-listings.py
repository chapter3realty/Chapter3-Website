"""Counts active for-sale listings from the CRM's public map API (aggregate counts only; no address is kept).
'va_accepted' and 'fha_accepted' are the CRM's flags for listings whose MLS record names VA (or FHA) among the
financing the seller will consider. A listing without the flag may still take VA; the flag is the listing agent's entry.
Run: python3 -I pull-listings.py <outdir>. Writes listings-counts.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
def total(params):
    url = BASE + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    err = None
    for i in range(3):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=60))
            return d.get("total"), d.get("params"), (d.get("meta") or {}).get("refreshedAt")
        except Exception as e:
            time.sleep(2); err = e
    return None, "ERR " + str(err), None
rows = []
def q(label, **p):
    n, params, ref = total(p)
    rows.append({"label": label, "params": params, "total": n, "refreshedAt": ref})
    print(label, params, n, flush=True)
for t in ["", "house", "condo", "townhouse", "manufactured", "land"]:
    for h in ["", "va_accepted", "fha_accepted", "assumable_loan"]:
        p = {}
        if t: p["type"] = t
        if h: p["has"] = h
        q(f"type={t or 'all'} has={h or '-'}", **p)
for h in ["oceanfront_building", "vacation_rental_program", "oceanview_unit", "str_allowed", "elevator_building"]:
    q(f"condo {h}", type="condo", has=h)
    q(f"condo {h}+va", type="condo", has=h + ",va_accepted")
    q(f"condo {h}+fha", type="condo", has=h + ",fha_accepted")
for h in ["flood_zone", "new_construction", "market_common_2mi", "near_beach", "one_level"]:
    q(f"house {h}", type="house", has=h)
    q(f"house {h}+va", type="house", has=h + ",va_accepted")
CITIES = ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City", "Murrells Inlet", "Little River", "Conway", "Longs", "Loris", "Aynor"]
for c in CITIES:
    for t in ["house", "condo"]:
        q(f"{c} {t}", city=c, type=t)
        q(f"{c} {t}+va", city=c, type=t, has="va_accepted")
for lo, hi in [(0, 249999), (250000, 299999), (300000, 349999), (350000, 399999), (400000, 499999), (500000, 699999), (700000, 999999), (1000000, None)]:
    p = {"type": "house", "min": lo}
    if hi: p["max"] = hi
    q(f"house {lo}-{hi}", **p)
    q(f"house {lo}-{hi}+va", has="va_accepted", **p)
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rows": rows}, open(f"{out}/listings-counts.json", "w"), indent=1)
