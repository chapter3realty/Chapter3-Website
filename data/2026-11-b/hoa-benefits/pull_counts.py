"""Counts only, from the CRM's public map API (CCMLS active listings for sale), for /hoa/benefits/.
1) Houses by year built: how many are for sale and how many list no HOA fee (hoaMax=0), per band.
2) Houses with an HOA fee that list a community pool, clubhouse, gate, tennis, or RV and boat parking
   (count with the feature, minus the count with the feature and no fee).
No listing is saved. Run: python3 -I pull_counts.py <outdir>. Writes <outdir>/counts.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"; calls = []
def total(p):
    p = dict(p, limit=1); url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            t = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=60)).get("total")
            calls.append([url, t]); time.sleep(0.2); return t
        except Exception: time.sleep(4)
    return None
BANDS = [("before 1980", None, 1979), ("1980 to 1999", 1980, 1999), ("2000 to 2009", 2000, 2009), ("2010 to 2019", 2010, 2019), ("2020 or later", 2020, None)]
res = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "api": BASE, "by_year": [], "features_with_fee": {}}
res["house_total"] = total({"type": "house"}); res["house_no_fee"] = total({"type": "house", "hoaMax": 0})
for name, lo, hi in BANDS:
    q = {"type": "house"}
    if lo: q["yearMin"] = lo
    if hi: q["yearMax"] = hi
    t = total(q); z = total(dict(q, hoaMax=0))
    res["by_year"].append({"band": name, "yearMin": lo, "yearMax": hi, "houses": t, "no_fee": z, "with_fee": t - z, "pct_with_fee": round(100 * (t - z) / t, 1) if t else None})
with_fee = res["house_total"] - res["house_no_fee"]; res["house_with_fee"] = with_fee
for f in ["community_pool", "clubhouse", "gated", "tennis", "rv_boat_parking", "fenced_yard", "boat_ramp", "boat_slip"]:
    a = total({"type": "house", "has": f}); z = total({"type": "house", "has": f, "hoaMax": 0})
    res["features_with_fee"][f] = {"all": a, "no_fee": z, "with_fee": a - z, "pct_of_with_fee": round(100 * (a - z) / with_fee, 1),
                                   "pct_of_no_fee": round(100 * z / res["house_no_fee"], 1)}
res["calls"] = calls
json.dump(res, open(f"{out}/counts.json", "w"), indent=1)
print(json.dumps({k: v for k, v in res.items() if k != "calls"}, indent=1))
