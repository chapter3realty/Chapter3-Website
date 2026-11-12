"""Typical monthly association fee, and what listings say it covers, by kind of home for sale on the Grand Strand.
Source: the CRM's public map API (https://chapter3realty.com/homes/api/map), the same feed as the site's homes pages.
Aggregate counts only. No address, MLS number, price or firm is kept.
- hoaMax=<n>: listings whose association fee per month is n or less (a blank fee counts as 0, as in batch 2026-10-d).
- Quartiles among homes that list a fee are found by bisection on hoaMax, to $5.
- has=<keys> (all must be true) and not=<keys>: the listing agent's feature flags (/homes/api/filters).
- A "covers" share = listings with the flag and a fee / listings in the segment with a fee.
Calls are spaced 2.1 s (the CRM allows about 300 searches per 10 minutes).
Run: python3 -I pull_fees_by_kind.py <this folder> [segment ...]. Writes fees-by-kind.json (segments named on the
command line are pulled and merged into the existing file; with none, every segment is pulled)."""
import json, sys, time, urllib.request, urllib.parse, datetime
out = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = 0
def total(p):
    global calls
    url = BASE + urllib.parse.urlencode(dict(p, limit=1))
    for _ in range(5):
        try:
            calls += 1
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
            time.sleep(2.1)
            return j["total"]
        except Exception:
            time.sleep(20)
    raise SystemExit("API failed: " + url)

SEGMENTS = {
    "condo": {"type": "condo"},
    "condo_oceanfront_highrise": {"type": "condo", "has": "oceanfront_building,high_rise"},
    "condo_oceanfront": {"type": "condo", "has": "oceanfront_building"},
    "condo_off_ocean": {"type": "condo", "not": "oceanfront_building"},
    "townhouse": {"type": "townhouse"},
    "house": {"type": "house"},
    "house_no_amenities": {"type": "house", "not": "community_amenities"},
    "house_pool_or_clubhouse": {"type": "house", "has": "pool_or_clubhouse"},
    "house_gated": {"type": "house", "has": "gated"},
    "house_golf_community": {"type": "house", "has": "golf_community"},
    "house_gated_golf": {"type": "house", "has": "gated,golf_community"},
}
FLAGS = ["hoa_includes_insurance", "hoa_includes_water_sewer", "hoa_includes_trash", "hoa_includes_internet",
         "hoa_includes_cable", "hoa_includes_pest", "hoa_includes_electric", "lawn_care_included",
         "community_pool", "clubhouse", "security_service", "gated", "tennis", "golf_included"]
def add_has(p, k):
    q = dict(p); q["has"] = ",".join(x for x in [p.get("has"), k] if x); return q

ONLY = sys.argv[2:]
res = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": BASE + "type=..&has=..&not=..&hoaMax=..",
       "status": "for sale (the API's default)", "segments": {}}
if ONLY:
    old = json.load(open(f"{out}/fees-by-kind.json")); old.setdefault("pulled_more", {}); res = old
for name, p in SEGMENTS.items():
    if ONLY and name not in ONLY: continue
    if ONLY: res["pulled_more"][name] = datetime.datetime.utcnow().isoformat() + "Z"
    tot = total(p); zero = total(dict(p, hoaMax=0)); wf = tot - zero
    r = {"params": p, "total": tot, "fee_zero_or_blank": zero, "with_fee": wf, "quartiles": {}, "covers": {}}
    for qn, frac in [("p25", 0.25), ("median", 0.5), ("p75", 0.75)]:
        k = zero + wf * frac
        lo, hi = 0, 6000  # invariant: count(lo) < k <= count(hi)
        while hi - lo > 5:
            mid = (lo + hi) // 2
            mid -= mid % 5
            if mid <= lo: mid = lo + 5
            if total(dict(p, hoaMax=mid)) >= k: hi = mid
            else: lo = mid
        r["quartiles"][qn] = {"at_or_below": hi, "band": [lo, hi]}
    for f in FLAGS:
        q = add_has(p, f)
        a = total(q); z = total(dict(q, hoaMax=0)) if zero else 0
        r["covers"][f] = {"with_flag": a, "with_flag_and_fee": a - z, "share_of_with_fee": round((a - z) / wf, 3) if wf else None}
    res["segments"][name] = r
    print(name, tot, zero, {k: v["at_or_below"] for k, v in r["quartiles"].items()}, calls, flush=True)
    json.dump(res, open(f"{out}/fees-by-kind.json", "w"), indent=1)
res["calls"] = calls
json.dump(res, open(f"{out}/fees-by-kind.json", "w"), indent=1)
print("done", calls)
