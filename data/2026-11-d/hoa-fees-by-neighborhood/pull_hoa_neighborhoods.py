"""Monthly HOA fee of the homes for sale now, by neighborhood (MLS subdivision name), Grand Strand: houses, townhomes and manufactured homes.
Source: the site's public map API (https://chapter3realty.com/homes/api/map, CCMLS active listings through the CRM)
and the public listing card (https://chapter3realty.com/homes/api/lookup?mls=, which gives the subdivision name).
Method:
 1. Every house, townhouse and manufactured home for sale ($50,000 and up) inside three 25-mile circles that cover Calabash to Pawleys Island,
    split by price until each search returns all its homes (the map returns at most 144 pins; total=0 means none).
 2. Each home's subdivision name from its public card. Grouped by exact name (case and spaces folded).
 3. For every name with 3 or more homes, each home's fee is bracketed with the site's own filter
    subdivision=<name>&type=<type>&hoaMax=T on the steps T = 0, 10, 20 ... 600, then 650 ... 1500 by 50, then 2000, 3000,
    by halving: a home returned at hoaMax=T has a fee of T or less. We keep the top of its bracket.
    hoaMax=0 returns homes whose listing gives no fee or a $0 fee; hoa=0 returns the homes whose listing says there is no HOA.
    The subdivision search matches words, so only homes whose exact name is the group's name are counted.
Saved: counts, fee brackets (min, quartiles, median, max), list-price median and range, year-built range, towns, zips.
No MLS number, address, firm or photo is saved. The per-home working cache lives outside the website repo (CACHE).
Every step caches to CACHE and resumes where it stopped, so a cut-off run is safe to start again.
 4. refine_exact.py then narrows each fee to the dollar inside its bracket; a second run of this script writes the exact fees.
Run: CACHE=<scratch dir> python3 -I pull_hoa_neighborhoods.py <datadir>. Writes <datadir>/hoa-by-neighborhood.json."""
import json, os, sys, time, statistics, datetime, urllib.request, urllib.parse, re, threading
from concurrent.futures import ThreadPoolExecutor
D = sys.argv[1]; C = os.environ["CACHE"]; os.makedirs(C, exist_ok=True)
BASE = "https://chapter3realty.com/homes/api/"
NCALLS = [0]; LOCK = threading.Lock()
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    with LOCK: NCALLS[0] += 1
    for i in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(2 + 4 * i)
    raise RuntimeError("failed " + url)
def save(obj, f):
    tmp = f + ".tmp"; json.dump(obj, open(tmp, "w")); os.replace(tmp, f)
CIRCLES = ["33.86,-78.66", "33.66,-78.95", "33.45,-79.12"]  # North Myrtle Beach/Little River/Longs, Myrtle Beach/Conway, Murrells Inlet/Pawleys
TYPES = os.environ.get("TYPES", "house,townhouse,manufactured").split(",")
def pins_all(p, lo=50000, hi=20000000):
    d = get("map", dict(p, min=lo, max=hi))
    if d.get("total", 0) == 0: return []
    if d["total"] <= len(d["pins"]) or len(d["pins"]) < 144: return d["pins"]  # under the 144 cap: every home with a map point (a listing with no point is never on the map)
    if hi - lo < 2000: raise RuntimeError("cannot split " + str(p) + str(lo))
    mid = (lo + hi) // 2
    return pins_all(p, lo, mid) + pins_all(p, mid + 1, hi)
cf = os.path.join(C, "homes.json")
homes = json.load(open(cf)) if os.path.exists(cf) else {}
have = {h["type"] for h in homes.values()}
for t in TYPES:
    if t in have: continue
    for c in CIRCLES:
        for p in pins_all({"near": c, "miles": 25, "type": t}):
            homes.setdefault(p["mls"], {"type": t, "price": p.get("price"), "lat": p.get("lat"), "lng": p.get("lng"), "status": p.get("status")})
        print("collected", c, t, len(homes), flush=True)
    save(homes, cf)
lf = os.path.join(C, "cards.json")
cards = json.load(open(lf)) if os.path.exists(lf) else {}
todo = [m for m in homes if m not in cards]
def card(m):
    try: f = get("lookup", {"mls": m}).get("facts") or {}
    except RuntimeError: return m, None
    return m, {k: f.get(k) for k in ("subdivision", "city", "zip", "type", "listPrice", "yearBuilt", "sqft", "hoaMonthly")}
with ThreadPoolExecutor(8) as ex:
    for i, (m, f) in enumerate(ex.map(card, todo)):
        if f is not None: cards[m] = f
        if i % 200 == 0: print("cards", i, len(todo), flush=True); save(cards, lf)
save(cards, lf)
key = lambda s: re.sub(r"\s+", " ", (s or "").strip()).lower()
SKIP = ("none", "not within a subdivision", "n/a", "na", "no", "other", "not in a subdivision", "unknown")
groups = {}
for m, h in homes.items():
    f = cards.get(m) or {}
    k = key(f.get("subdivision"))
    if not k or k in SKIP: continue
    groups.setdefault(k, []).append(m)
STEPS = [0] + list(range(10, 601, 10)) + list(range(650, 1501, 50)) + [2000, 3000]
ff = os.path.join(C, "fees.json")
fees = json.load(open(ff)) if os.path.exists(ff) else {}
for v in fees.values():  # entries from the first run (houses and townhouses only, a count of no-HOA homes)
    if isinstance(v, dict) and "_types" not in v and "_skipped" not in v:
        v["_types"] = ["house", "townhouse"]; v["_nohoa_old"] = v.pop("_nohoa", 0)
def bracket(k):
    ms = groups[k]; name = (cards[ms[0]].get("subdivision") or "").strip()
    if not re.match(r"^[A-Za-z0-9 .,'’&()/#@-]{2,80}$", name): return k, {"_skipped": "name the search refuses"}
    res = dict(fees.get(k) or {}); nohoa = res.pop("_nohoa_list", [])
    try:
        for t in TYPES:
            want = {m for m in ms if homes[m]["type"] == t}
            if not want or t in res.get("_types", []): continue
            base = {"subdivision": name, "type": t}
            found = {p["mls"] for p in pins_all(base)} & want
            res["_missing_" + t] = len(want - found)
            if not found: continue
            nohoa += [p["mls"] for p in pins_all(dict(base, hoa="0")) if p["mls"] in found]
            memo = {}
            def le(i):  # homes in `found` with fee at or under STEPS[i]
                if i not in memo: memo[i] = {p["mls"] for p in pins_all(dict(base, hoaMax=STEPS[i]))} & found
                return memo[i]
            at0 = le(0)
            for m in at0: res[m] = 0
            top = len(STEPS) - 1
            above = found - le(top)
            for m in above: res[m] = 9999  # over $3,000
            def split(lo, hi, S):  # S: fee in (STEPS[lo], STEPS[hi]]
                if not S: return
                if hi - lo == 1:
                    for m in S: res[m] = STEPS[hi]
                    return
                mid = (lo + hi) // 2
                inlow = le(mid) & S
                split(lo, mid, inlow); split(mid, hi, S - inlow)
            split(0, top, le(top) - at0)
            res["_types"] = res.get("_types", []) + [t]
    except RuntimeError as e:
        return k, None
    res["_nohoa"] = len(set(nohoa)) + res.get("_nohoa_old", 0); res["_nohoa_list"] = sorted(set(nohoa))
    return k, res
todo = [k for k, ms in groups.items() if len(ms) >= 3 and "_skipped" not in (fees.get(k) or {}) and ({homes[m]["type"] for m in ms} - set((fees.get(k) or {}).get("_types", [])))]
print("communities to bracket", len(todo), flush=True)
with ThreadPoolExecutor(6) as ex:
    for i, (k, r) in enumerate(ex.map(bracket, todo)):
        if r is None: print("retry later", k, flush=True); continue
        fees[k] = r
        if i % 10 == 0: print("fees", i, len(todo), k, NCALLS[0], flush=True); save(fees, ff)
save(fees, ff)
def money(s):
    try: return int(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
def q(xs, f): return xs[min(len(xs) - 1, int(f * len(xs)))] if xs else None
xf = os.path.join(C, "exact.json"); EXACT = json.load(open(xf)) if os.path.exists(xf) else {}
out = {}
for k, ms in sorted(groups.items()):
    if len(ms) < 3: continue
    r = {**fees.get(k, {}), **EXACT.get(k, {})}  # exact dollars from refine_exact.py where it has run
    fs = sorted(r[m] for m in ms if m in r)
    miss = sum(v for kk, v in r.items() if kk.startswith("_missing_"))
    nz = [x for x in fs if x > 0]
    pr = sorted(p for p in ((cards[m].get("listPrice") or money(homes[m]["price"])) for m in ms) if p)
    yb = sorted(y for y in (cards[m].get("yearBuilt") for m in ms) if y)
    towns, zips = {}, {}
    for m in ms:
        towns[cards[m].get("city") or "?"] = towns.get(cards[m].get("city") or "?", 0) + 1
        zips[cards[m].get("zip") or "?"] = zips.get(cards[m].get("zip") or "?", 0) + 1
    out[k] = {"name": (cards[ms[0]].get("subdivision") or "").strip(), "homes": len(ms),
              "houses": sum(1 for m in ms if homes[m]["type"] == "house"), "townhomes": sum(1 for m in ms if homes[m]["type"] == "townhouse"),
              "manufactured": sum(1 for m in ms if homes[m]["type"] == "manufactured"),
              "by_type": {t: {"homes": len(tm), "with_fee": len(tf), "fee_min": tf[0] if tf else None, "fee_median": statistics.median(tf) if tf else None, "fee_max": tf[-1] if tf else None}
                          for t in TYPES for tm in [[m for m in ms if homes[m]["type"] == t]] if tm for tf in [sorted(r[m] for m in tm if r.get(m))]},
              "towns": towns, "zips": zips, "fee_bracketed": len(fs), "not_found_by_name_search": miss,
              "listing_says_no_hoa": r.get("_nohoa"), "no_fee_or_zero": sum(1 for x in fs if x == 0), "with_fee": len(nz),
              "fee_min": nz[0] if nz else None, "fee_q1": q(nz, .25), "fee_median": statistics.median(nz) if nz else None,
              "fee_q3": q(nz, .75), "fee_max": nz[-1] if nz else None, "skipped": r.get("_skipped"),
              "price_median": statistics.median(pr) if pr else None, "price_min": pr[0] if pr else None, "price_max": pr[-1] if pr else None,
              "year_min": yb[0] if yb else None, "year_max": yb[-1] if yb else None,
              "center": [round(statistics.median([homes[m]["lat"] for m in ms if homes[m]["lat"]]), 3), round(statistics.median([homes[m]["lng"] for m in ms if homes[m]["lng"]]), 3)]}
try: meta = get("map", {"subdivision": "Arcadia"}).get("meta", {})
except RuntimeError: meta = {}
allhouse = [m for m in homes if cards.get(m)]
F = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "meta_refreshed": meta.get("refreshedAt"), "source": meta.get("source"),
     "homes_seen": len(homes), "houses_seen": sum(1 for h in homes.values() if h["type"] == "house"),
     "townhomes_seen": sum(1 for h in homes.values() if h["type"] == "townhouse"), "manufactured_seen": sum(1 for h in homes.values() if h["type"] == "manufactured"), "cards_read": len(allhouse),
     "homes_with_subdivision": sum(len(v) for v in groups.values()), "names": len(groups),
     "names_3plus": sum(1 for v in groups.values() if len(v) >= 3), "homes_in_names_3plus": sum(len(v) for v in groups.values() if len(v) >= 3),
     "rule": __doc__,
     "exact_communities": len(EXACT), "note": "Each fee is in whole dollars where refine_exact.py has run (exact_communities), else the top of its bracket ($10 steps to $600, then $50, then 2000 and 3000); 9999 = over $3,000. no_fee_or_zero = the listing gives no fee or $0. listing_says_no_hoa = the listing's HOA field says no. Aggregate only.",
     "communities": out}
save(F, os.path.join(D, "hoa-by-neighborhood.json"))
print("done", len(out), "calls", NCALLS[0])
