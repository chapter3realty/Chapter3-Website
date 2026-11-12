"""Rental-program share of condos for sale, per directory building, from the CRM's public map API (CCMLS active listings).
For each building in ../invest-condo-buildings/buildings.json: total condos for sale matching its subdivision words, and how many
carry the listing agent's 'vacation_rental_program' flag. Totals only; no listing is kept.
Run: python3 -I pull_program.py <this folder>. Writes program.json (with every URL called)."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1]
B = json.load(open(f"{out}/../invest-condo-buildings/buildings.json"))["buildings"]
API = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research script)"}
def total(p):
    url = API + urllib.parse.urlencode(p)
    for i in range(3):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); time.sleep(2.1); return j["total"], url
        except Exception as e:
            time.sleep(5)
    raise SystemExit("failed " + url)
res = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "api": API, "buildings": {}}
for b in B:
    p = {"type": "condo", "subdivision": b["words"]}
    t, u1 = total(p); r, u2 = total(dict(p, has="vacation_rental_program"))
    res["buildings"][b["slug"]] = {"for_sale": t, "in_program": r, "share": round(100 * r / t, 1) if t else None, "calls": [u1, u2]}
    print(b["slug"], t, r, flush=True)
json.dump(res, open(f"{out}/program.json", "w"), indent=1)
