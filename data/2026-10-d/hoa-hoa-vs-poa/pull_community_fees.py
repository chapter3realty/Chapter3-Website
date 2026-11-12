"""Listed monthly association fee and what it covers, for homes for sale in three communities with more than one
association (ledger rows 20 to 22), from the CRM's public map API. Aggregate counts only: no address, MLS number,
price or firm is kept. The API's subdivision filter is the listing's MLS subdivision name; hoaMax is the listing's
association fee per month, as the site's filter labels it. A listing shows the fee its agent entered; it may not
show a second association's fee (ledger row 31).
Run: python3 -I pull_community_fees.py <outdir>. Writes <outdir>/community-fees.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
SETS = [("Grande Dunes", "house"), ("Grande Dunes", "condo"), ("Barefoot", "condo"), ("Barefoot", "house"), ("Prince Creek", "house")]
STEPS = list(range(0, 1000, 25)) + list(range(1000, 2001, 50)) + [3000, 100000]
HAS = ["gated", "community_amenities", "lawn_care_included", "golf_community", "hoa_includes_insurance", "hoa_includes_water_sewer", "hoa_includes_trash", "hoa_includes_internet"]
def total(params):
    url = BASE + urllib.parse.urlencode(dict(params, limit=1))
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"})
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(req, timeout=60)).get("total")
        except Exception:
            time.sleep(3)
    return None
def at(q, s):
    v = total(dict(q, hoaMax=s)); time.sleep(0.15); return v
res = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": BASE + "subdivision=<name>&type=<type>&hoaMax=<n> | has=<key>",
       "status": "for sale (the API's default)", "sets": []}
for sub, t in SETS:
    q = {"subdivision": sub, "type": t}
    r = {"subdivision": sub, "type": t, "total": total(q), "cdf": {}, "has": {}}
    for s in STEPS:
        r["cdf"][s] = at(q, s)
    zero = r["cdf"][0]
    r["fee_zero_or_blank"] = zero
    r["with_fee"] = r["total"] - zero
    def quant(p):
        k = zero + r["with_fee"] * p
        hi = next(s for s in STEPS if r["cdf"][s] >= k)
        lo = max([s for s in STEPS if s < hi] or [0])
        # refine to $5 inside the band
        for s in range(lo + 5, hi, 5):
            if at(q, s) >= k:
                return [s - 5, s]
        return [hi - 5, hi]
    r["median_band_5"] = quant(0.5)
    r["p25_band_5"] = quant(0.25)
    r["p75_band_5"] = quant(0.75)
    for h in HAS:
        r["has"][h] = total(dict(q, has=h)); time.sleep(0.15)
    res["sets"].append(r)
    print(sub, t, r["total"], zero, r["with_fee"], r["p25_band_5"], r["median_band_5"], r["p75_band_5"], r["has"], flush=True)
json.dump(res, open(f"{out}/community-fees.json", "w"), indent=1)
