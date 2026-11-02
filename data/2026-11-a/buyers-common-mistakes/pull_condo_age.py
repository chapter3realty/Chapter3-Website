"""Condos for sale on the Grand Strand built in 1996 or earlier, from the CRM's public map API (ledger row 34).
Aggregate counts only: no address, MLS number, price or firm is kept.
Run: python3 -I pull_condo_age.py <datadir>. Writes condo-age.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for i in range(4):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=90)); return d.get("total"), d["meta"]["refreshedAt"], url
        except Exception: time.sleep(3)
    return None, None, url
alln, ref, u1 = total({"type": "condo"})
old, _, u2 = total({"type": "condo", "yearMax": 1996})
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "refreshedAt": ref, "built_through": 1996,
           "condos": alln, "built_1996_or_earlier": old, "urls": [u1, u2]}, open(f"{D}/condo-age.json", "w"), indent=1)
print(alln, old, old / alln if alln and old else None)
