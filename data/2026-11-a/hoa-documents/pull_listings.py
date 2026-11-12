"""Active listings in the CRM feed (chapter3realty.com/homes/api/map), counted in aggregate only:
how many come with an association fee, and how many say whether rentals are allowed. Counts only, no addresses.
Run: python3 -I pull_listings.py <this dir>. Writes listings-counts.json with each query string."""
import json, sys, time, urllib.request, urllib.parse, datetime
d = sys.argv[1]
def total(p):
    url = "https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode(dict(p, limit=1))
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))["total"]
        except Exception: time.sleep(3)
Q = {}
for t in ["condo", "townhouse", "house"]:
    base = {"type": t, "status": "active"}
    Q[t] = {"all": base, "no_fee": dict(base, hoaMax=0),
            "rentals_allowed": dict(base, has="rentals_allowed"), "str_allowed": dict(base, has="str_allowed"),
            "long_term_rental_allowed": dict(base, has="long_term_rental_allowed"),
            "rentals_allowed_no_fee": dict(base, has="rentals_allowed", hoaMax=0),
            "str_allowed_no_fee": dict(base, has="str_allowed", hoaMax=0),
            "ltr_allowed_no_fee": dict(base, has="long_term_rental_allowed", hoaMax=0)}
out = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "api": "https://chapter3realty.com/homes/api/map", "counts": {}, "queries": {}}
for t, qs in Q.items():
    out["counts"][t] = {k: total(v) for k, v in qs.items()}
    out["queries"][t] = {k: urllib.parse.urlencode(v) for k, v in qs.items()}
    print(t, out["counts"][t], flush=True)
json.dump(out, open(f"{d}/listings-counts.json", "w"), indent=1)
