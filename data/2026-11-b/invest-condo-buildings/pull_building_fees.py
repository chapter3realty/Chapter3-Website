"""Monthly HOA fee by oceanfront condo building, from condos for sale now, counted in aggregate.
Source: the CRM's public map API (https://chapter3realty.com/homes/api/map), the feed under the site's homes pages
(Coastal Carolinas MLS active listings). Same method as data/2026-11-b/hoa/pull_fees_by_kind.py:
- A building is the listings whose MLS subdivision matches its words (buildings.json), type=condo.
- hoaMax=<n> counts listings whose association fee per month is n or less (a blank fee counts as 0).
- The median (and the quartiles when 12 or more listings give a fee) is found by bisection on hoaMax, to $5.
- Feature shares: listings with the agent's flag / all listings in the building (has=<flag>).
- Asking price median, bedrooms and size are computed from the listings the call returns (144 at most) and kept
  only as aggregates. No address, unit, MLS number, single price or firm is kept.
Calls are spaced 2.1 s (the CRM allows about 300 searches per 10 minutes).
Run: python3 -I pull_building_fees.py <this folder> [slug ...]. Writes building-fees.json (named slugs merge in)."""
import json, sys, time, os, statistics, urllib.request, urllib.parse, datetime
out = sys.argv[1]; ONLY = sys.argv[2:]
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
            calls.append(url); time.sleep(2.1); return j
        except Exception:
            time.sleep(20)
    raise SystemExit("API failed: " + url)
def total(p): return get(p)["total"]
FLAGS = ["hoa_includes_electric", "pets_allowed", "indoor_pool", "oceanfront_building"]
B = json.load(open(f"{out}/buildings.json"))["buildings"]
fn = f"{out}/building-fees.json"
res = json.load(open(fn)) if os.path.exists(fn) else {"source": BASE + "type=condo&subdivision=<words>&hoaMax=<n>", "status": "for sale (the API's default)", "buildings": {}}
res["pulled" if not ONLY else "pulled_more_at"] = datetime.datetime.utcnow().isoformat() + "Z"
for b in B:
    if ONLY and b["slug"] not in ONLY: continue
    if not ONLY and b["slug"] in res["buildings"] and res["buildings"][b["slug"]].get("total") is not None: continue
    if not b.get("words"): continue
    p = {"type": "condo", "subdivision": b["words"]}
    j = get(p); tot = j["total"]
    r = {"words": b["words"], "url": BASE + urllib.parse.urlencode(p), "total": tot, "read": datetime.datetime.utcnow().isoformat() + "Z"}
    if tot == 0:
        res["buildings"][b["slug"]] = r; print(b["slug"], 0, flush=True); continue
    pins = j["pins"]
    pr = [int(x["price"].replace("$", "").replace(",", "")) for x in pins if x.get("price", "").startswith("$")]
    r["pins_returned"] = len(pins)
    r["asking"] = {"median": statistics.median(pr) if pr else None, "p25": statistics.quantiles(pr, n=4)[0] if len(pr) >= 4 else None,
                   "p75": statistics.quantiles(pr, n=4)[2] if len(pr) >= 4 else None, "n": len(pr)}
    r["beds"] = {str(k): sum(1 for x in pins if x.get("beds") == k) for k in sorted(set(x.get("beds") for x in pins if x.get("beds") is not None))}
    import collections, re as _re
    st = collections.Counter()
    for x in pins:
        a = x["addr"].split(","); t = _re.sub(r"\.", "", a[0]).strip(); t = _re.sub(r"\b(South|North)\b", lambda m: m.group(1)[0], t)
        st[_re.sub(r"^(\d+) ([NS]) Ocean Blvd [NS]$", r"\1 \2 Ocean Blvd", _re.sub(r"^(\d+) Ocean Blvd ([NS])$", r"\1 \2 Ocean Blvd", t)) + " | " + (a[1].strip() if len(a) > 1 else "")] += 1
    r["streets"] = st.most_common()  # building street addresses only, to check the words pick one building
    sq = [x["sqft"] for x in pins if x.get("sqft")]
    r["sqft_median"] = statistics.median(sq) if sq else None
    zero = total(dict(p, hoaMax=0)); wf = tot - zero
    r["fee_zero_or_blank"] = zero; r["with_fee"] = wf; r["quartiles"] = {}
    qs = [("median", 0.5)] + ([("p25", 0.25), ("p75", 0.75)] if wf >= 12 else [])
    if wf >= 3:
        for qn, frac in qs:
            k = zero + wf * frac
            med = r["quartiles"].get("median", {}).get("at_or_below")
            lo, hi = (0, med) if (qn == "p25" and med) else ((med - 5, 4000) if (qn == "p75" and med) else (0, 4000))
            while hi - lo > 5:
                mid = (lo + hi) // 2; mid -= mid % 5
                if mid <= lo: mid = lo + 5
                if total(dict(p, hoaMax=mid)) >= k: hi = mid
                else: lo = mid
            r["quartiles"][qn] = {"at_or_below": hi, "band": [lo, hi]}
    r["flags"] = {f: total(dict(p, has=f)) for f in FLAGS}
    res["buildings"][b["slug"]] = r
    print(b["slug"], tot, wf, {k: v["at_or_below"] for k, v in r["quartiles"].items()}, r["asking"]["median"], flush=True)
    json.dump(res, open(fn, "w"), indent=1)
res.setdefault("calls", []); res["calls"] += calls
json.dump(res, open(fn, "w"), indent=1)
print("done", len(calls))
