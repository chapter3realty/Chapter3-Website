"""Monthly condo fee, oceanfront buildings against the rest, from the CRM's public map API (CCMLS active
listings for sale), the same method as ../../2026-10-d/hoa-hoa-vs-poa/pull_fees.py and refine_medians.py
(whole feed, no county filter): count condos at or under each fee step (hoaMax), $25 steps, then $5 steps
around the median. "Not oceanfront" = all condos minus has=oceanfront_building. Counts only.
Run: python3 -I pull_condo_fees.py <outdir>. Writes <outdir>/condo-fees.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"; calls = []
def total(p):
    url = BASE + urllib.parse.urlencode(dict(p, limit=1))
    for i in range(5):
        try:
            t = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=60)).get("total")
            calls.append([url, t]); time.sleep(0.15); return t
        except Exception: time.sleep(4)
    raise SystemExit("failed " + url)
STEPS = list(range(0, 2001, 25)) + [3000, 100000]
def cdf(extra):
    return {s: total(dict(extra, type="condo", hoaMax=s)) for s in STEPS}
def median5(extra, c, tot):
    zero = c[0]; half = zero + (tot - zero) / 2
    hi = next(s for s in STEPS if c[s] >= half); lo = max(s for s in STEPS if s < hi)
    for s in range(lo + 5, hi + 1, 5):
        if total(dict(extra, type="condo", hoaMax=s)) >= half: return s, zero, tot - zero
    return hi, zero, tot - zero
res = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "api": BASE, "groups": {}}
allc = cdf({}); oc = cdf({"has": "oceanfront_building"})
t_all = total({"type": "condo"}); t_oc = total({"type": "condo", "has": "oceanfront_building"})
for name, c, t, extra in (("all condos", allc, t_all, {}), ("oceanfront building", oc, t_oc, {"has": "oceanfront_building"})):
    m, z, w = median5(extra, c, t)
    res["groups"][name] = {"total": t, "fee_zero_or_blank": z, "with_fee": w, "median_fee_5": m, "cdf": c,
                           "share_over_500_pct": round(100 * (t - c[500]) / t, 1)}
rest = {s: allc[s] - oc[s] for s in STEPS}; t_rest = t_all - t_oc; zero = rest[0]; half = zero + (t_rest - zero) / 2
hi = next(s for s in STEPS if rest[s] >= half); lo = max(s for s in STEPS if s < hi)
m = hi
for s in range(lo + 5, hi + 1, 5):
    if total({"type": "condo", "hoaMax": s}) - total({"type": "condo", "has": "oceanfront_building", "hoaMax": s}) >= half: m = s; break
res["groups"]["not oceanfront"] = {"total": t_rest, "fee_zero_or_blank": zero, "with_fee": t_rest - zero, "median_fee_5": m, "cdf": rest,
                                   "share_over_500_pct": round(100 * (t_rest - rest[500]) / t_rest, 1)}
res["calls"] = calls
json.dump(res, open(f"{out}/condo-fees.json", "w"), indent=1)
print(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != "cdf"} for k, v in res["groups"].items()}, indent=1))
