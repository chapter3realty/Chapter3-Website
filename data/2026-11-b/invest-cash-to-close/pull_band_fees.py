"""Middle monthly association fee for homes for sale near the middle sold price, for the worked example's reserves line.
Same method as data/2026-11-b/hoa/pull_fees_by_kind.py: the CRM's public map API, hoaMax bisection to $5, a blank fee counts
as 0, the median is among listings that show a fee. Aggregate only; no address, MLS number or firm is kept.
Run: python3 -I pull_band_fees.py <out.json>"""
import json, sys, time, urllib.request, urllib.parse, datetime
BASE = "https://chapter3realty.com/homes/api/map?"
AREA = {"near": "33.69000,-78.89200", "miles": 25}
UA = {"User-Agent": "Mozilla/5.0"}
def total(p):
    url = BASE + urllib.parse.urlencode(dict(AREA, **p, limit=1))
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); time.sleep(2.1); return j["total"]
        except Exception: time.sleep(20)
    raise SystemExit("API failed " + url)
SEG = {"condo_200_265k": {"type": "condo", "min": 200000, "max": 265000},
       "condo_200_265k_oceanfront_unit_str_allowed": {"type": "condo", "min": 200000, "max": 265000, "has": "oceanfront_unit,str_allowed"},
       "house_330_395k": {"type": "house", "min": 330000, "max": 395000}}
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "api": BASE, "area": AREA, "segments": {}}
for k, p in SEG.items():
    tot = total(p); zero = total(dict(p, hoaMax=0)); wf = tot - zero
    want = zero + wf * 0.5; lo, hi = 0, 6000
    while hi - lo > 5:
        mid = (lo + hi) // 2; mid -= mid % 5
        if mid <= lo: mid = lo + 5
        if total(dict(p, hoaMax=mid)) >= want: hi = mid
        else: lo = mid
    out["segments"][k] = {"params": p, "total": tot, "fee_zero_or_blank": zero, "with_fee": wf, "median_fee_at_or_below": hi, "band": [lo, hi]}
    print(k, out["segments"][k], flush=True)
json.dump(out, open(sys.argv[1], "w"), indent=1)
