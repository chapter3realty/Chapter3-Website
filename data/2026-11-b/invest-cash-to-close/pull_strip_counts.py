"""Counts of homes for sale near the middle sold price, for the page's homes strips.
Source: the CRM's public map API (https://chapter3realty.com/homes/api/map), aggregate totals only.
No address, MLS number or firm is kept. Run: python3 -I pull_strip_counts.py <out.json>"""
import json, sys, time, urllib.request, urllib.parse, datetime
BASE = "https://chapter3realty.com/homes/api/map?"
AREA = {"near": "33.69000,-78.89200", "miles": 25}
Q = {
 "condo_200_265k": {"type": "condo", "min": 200000, "max": 265000},
 "condo_200_265k_rentals_allowed": {"type": "condo", "min": 200000, "max": 265000, "has": "rentals_allowed"},
 "condo_200_265k_oceanfront_unit": {"type": "condo", "min": 200000, "max": 265000, "has": "oceanfront_unit"},
 "condo_200_265k_oceanfront_unit_rentals_allowed": {"type": "condo", "min": 200000, "max": 265000, "has": "oceanfront_unit,rentals_allowed"},
 "condo_200_265k_str_allowed": {"type": "condo", "min": 200000, "max": 265000, "has": "str_allowed"},
 "condo_200_265k_oceanfront_unit_str_allowed": {"type": "condo", "min": 200000, "max": 265000, "has": "oceanfront_unit,str_allowed"},
 "house_330_395k": {"type": "house", "min": 330000, "max": 395000},
 "house_330_395k_str_allowed": {"type": "house", "min": 330000, "max": 395000, "has": "str_allowed"},
 "house_330_395k_rentals_allowed": {"type": "house", "min": 330000, "max": 395000, "has": "rentals_allowed"},
}
out = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "api": BASE, "area": AREA, "counts": {}}
for k, p in Q.items():
    url = BASE + urllib.parse.urlencode(dict(AREA, **p, limit=1))
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
    out["counts"][k] = {"params": p, "total": j["total"]}
    time.sleep(2.1)
json.dump(out, open(sys.argv[1], "w"), indent=1); print(json.dumps(out["counts"]))
