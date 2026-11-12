"""What the HOA fee covers, for the worked two-bedroom condos on /invest/str-tools/, from the CRM's public map API.
Counts only, as the listing agent marked them (/homes/api/filters, group "Community and HOA").
Exactly 2 bedrooms = beds2 - beds3. Calls spaced 2.1 s (the CRM allows about 300 searches per 10 minutes).
Run: python3 -I pull_hoa_incl.py <this folder>. Writes raw/listings-hoa-incl.json."""
import json, sys, time, urllib.request, urllib.parse
root = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(BASE + urllib.parse.urlencode(dict(p, limit=1)), headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=60))
            time.sleep(2.1); return j.get("total")
        except Exception:
            time.sleep(20)
EX = {
    "mb_city_oceanfront_condo_2br": {"type": "condo", "city": "Myrtle Beach", "has": "oceanfront_building,inside_city_limits,str_allowed"},
    "nmb_oceanfront_condo_2br": {"type": "condo", "city": "North Myrtle Beach", "has": "oceanfront_building,str_allowed"},
    "surfside_condo_2br": {"type": "condo", "city": "Surfside Beach", "has": "str_allowed"},
    "garden_city_condo_2br": {"type": "condo", "has": "area_garden_city,str_allowed"},
}
out = {}
for name, p in EX.items():
    r = {}
    for f in ["hoa_includes_utilities", "hoa_includes_electric", "hoa_includes_insurance", "hoa_includes_internet", "vacation_rental_program", "furnished"]:
        q2 = dict(p, beds=2, has=p["has"] + "," + f); q3 = dict(q2, beds=3)
        r[f] = (total(q2) or 0) - (total(q3) or 0)
    out[name] = r
    print(name, r, flush=True)
json.dump(out, open(root + "/raw/listings-hoa-incl.json", "w"), indent=1)
