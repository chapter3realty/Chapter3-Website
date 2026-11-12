"""Which streets the worked two-bedroom condos on /invest/str-tools/ sit on, from the CRM's public map API.
Aggregate counts by street name only. No address number, MLS number, price or firm is kept in the output.
Exactly 2 bedrooms: pins with beds == 2 from a beds>=2 query (the API returns up to 144 pins; each group fits).
Fee bands: hoaMax is the monthly association fee ceiling; a pin is in band "<= X" when it is in the hoaMax=X query.
Calls spaced 2.1 s (the CRM allows about 300 searches per 10 minutes).
Run: python3 -I pull_streets.py <this folder>. Writes raw/listings-streets.json."""
import json, sys, time, re, urllib.request, urllib.parse, datetime, collections
root = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
def get(p):
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(BASE + urllib.parse.urlencode(dict(p, limit=144)), headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=60))
            time.sleep(2.1); return j
        except Exception:
            time.sleep(20)
    return {}
def street(addr):
    s = addr.split(",")[0].strip()
    s = re.sub(r"\s+(Unit|Apt|#|Ste|Suite|Bldg)\b.*$", "", s, flags=re.I)
    s = re.sub(r"^\d+[A-Za-z\-]*\s+", "", s)
    return s.rstrip(".")
EX = {
    "mb_city_oceanfront_condo_2br": {"type": "condo", "city": "Myrtle Beach", "has": "oceanfront_building,inside_city_limits,str_allowed"},
    "mb_city_oceanfront_condo_2br_electric": {"type": "condo", "city": "Myrtle Beach", "has": "oceanfront_building,inside_city_limits,str_allowed,hoa_includes_electric"},
    "nmb_oceanfront_condo_2br": {"type": "condo", "city": "North Myrtle Beach", "has": "oceanfront_building,str_allowed"},
    "surfside_condo_2br": {"type": "condo", "city": "Surfside Beach", "has": "str_allowed"},
    "garden_city_condo_2br": {"type": "condo", "has": "area_garden_city,str_allowed"},
}
BANDS = [400, 600, 800]
out = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": BASE, "groups": {}}
for name, p in EX.items():
    j = get(dict(p, beds=2)); pins = [x for x in j.get("pins", []) if x.get("beds") == 2]
    g = {"total_beds2plus": j.get("total"), "n": len(pins), "streets": collections.Counter(street(x["addr"]) for x in pins).most_common()}
    for b in BANDS:
        jb = get(dict(p, beds=2, hoaMax=b)); pb = [x for x in jb.get("pins", []) if x.get("beds") == 2]
        g["fee_le_%d" % b] = {"n": len(pb), "streets": collections.Counter(street(x["addr"]) for x in pb).most_common()}
    out["groups"][name] = g
    print(name, g["n"], g["streets"][:8], flush=True)
json.dump(out, open(root + "/raw/listings-streets.json", "w"), indent=1)
