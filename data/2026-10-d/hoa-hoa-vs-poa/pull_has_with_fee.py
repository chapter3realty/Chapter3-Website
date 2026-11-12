"""For houses and townhouses, the "what the fee pays for" counts with no-fee listings taken out:
count(type, has=X) minus count(type, has=X, hoaMax=0). Same API as pull_fees.py. Counts only.
Run: python3 -I pull_has_with_fee.py <this dir>. Writes has-with-fee.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
d = sys.argv[1]
HAS = ["hoa_includes_insurance", "lawn_care_included", "hoa_includes_water_sewer", "hoa_includes_trash", "hoa_includes_internet", "community_amenities", "gated"]
def total(p):
    url = "https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode(dict(p, limit=1))
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))["total"]
        except Exception: time.sleep(3)
out = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "types": {}}
for t in ["condo", "townhouse", "house"]:
    tot, zero = total({"type": t}), total({"type": t, "hoaMax": 0})
    r = {"total": tot, "fee_zero_or_blank": zero, "with_fee": tot - zero, "has": {}}
    for h in HAS:
        a, z = total({"type": t, "has": h}), total({"type": t, "has": h, "hoaMax": 0})
        r["has"][h] = {"all": a, "no_fee": z, "with_fee": a - z, "pct_of_with_fee": round(100 * (a - z) / (tot - zero), 1)}
    out["types"][t] = r; print(t, tot, zero, {k: (v["with_fee"], v["pct_of_with_fee"]) for k, v in r["has"].items()}, flush=True)
json.dump(out, open(f"{d}/has-with-fee.json", "w"), indent=1)
