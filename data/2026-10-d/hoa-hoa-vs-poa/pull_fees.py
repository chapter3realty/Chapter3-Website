"""Monthly association fee and what it pays for, by kind of home, from the CRM's public map API.
Aggregate counts only: no address, MLS number, price or firm is kept.
The API's hoaMax filter is the listing's association fee per month, as the site's filter labels it
("Up to $X a month"). hoa=0 is "No HOA, as listed by the listing agent".
Run: python3 -I pull_fees.py <outdir>. Writes <outdir>/fees-by-type.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
TYPES = ["condo", "townhouse", "house"]
STEPS = list(range(0, 500, 25)) + list(range(500, 1500, 50)) + [1500, 2000, 3000, 100000]
HAS = ["hoa_includes_insurance", "lawn_care_included", "hoa_includes_water_sewer", "hoa_includes_trash",
       "hoa_includes_internet", "hoa_includes_cable", "hoa_includes_pest", "hoa_includes_electric", "community_amenities", "gated"]
def total(params):
    params = dict(params, limit=1)
    url = BASE + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"})
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(req, timeout=60)).get("total")
        except Exception as e:
            time.sleep(3)
    return None
res = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": BASE + "type=<type>&hoaMax=<n> | hoa=0 | has=<key>",
       "status": "for sale (the API's default)", "types": {}}
for t in TYPES:
    r = {"total": total({"type": t}), "listed_no_hoa": total({"type": t, "hoa": "0"}), "cdf": {}, "has": {}}
    for s in STEPS:
        r["cdf"][s] = total({"type": t, "hoaMax": s}); time.sleep(0.2)
    zero = r["cdf"][0]
    r["fee_zero_or_blank"] = zero
    r["with_fee"] = r["total"] - zero
    half = zero + r["with_fee"] / 2
    med = next((s for s in STEPS if r["cdf"][s] is not None and r["cdf"][s] >= half), None)
    prev = max([s for s in STEPS if s < (med or 0)] or [0])
    r["median_fee_band_among_with_fee"] = [prev, med]
    for q in (0.25, 0.75):
        k = zero + r["with_fee"] * q
        hi = next((s for s in STEPS if r["cdf"][s] >= k), None)
        r[f"p{int(q*100)}_band"] = [max([s for s in STEPS if s < hi] or [0]), hi]
    for h in HAS:
        r["has"][h] = total({"type": t, "has": h}); time.sleep(0.2)
    res["types"][t] = r
    print(t, r["total"], r["listed_no_hoa"], zero, r["with_fee"], r["median_fee_band_among_with_fee"], r["p25_band"], r["p75_band"], r["has"], flush=True)
json.dump(res, open(f"{out}/fees-by-type.json", "w"), indent=1)
