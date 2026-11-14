"""Narrows each home's bracketed HOA fee (from pull_hoa_neighborhoods.py) to the exact dollar, with the same filter.
A home in the bracket ($140, $150] is asked hoaMax=141 ... 150 by halving, within its community and kind of home, until the
smallest T that returns it is found: that T is its monthly fee in whole dollars. Fees over $3,000 are left as "over $3,000".
Reads CACHE/fees.json, homes.json, cards.json; writes CACHE/exact.json (per home, scratch only; resumes).
pull_hoa_neighborhoods.py then uses the exact fee where exact.json has one.
Run: CACHE=<scratch dir> python3 -I refine_exact.py"""
import json, os, re, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
C = os.environ["CACHE"]
BASE = "https://chapter3realty.com/homes/api/map?"
STEPS = [0] + list(range(10, 601, 10)) + list(range(650, 1501, 50)) + [2000, 3000]
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(2 + 4 * i)
    raise RuntimeError(url)
def pins_all(p, lo=50000, hi=20000000):
    d = get(dict(p, min=lo, max=hi))
    if d.get("total", 0) == 0: return []
    if d["total"] <= len(d["pins"]) or len(d["pins"]) < 144: return d["pins"]  # under the 144 cap: every home with a map point (a listing with no point is never on the map)
    mid = (lo + hi) // 2
    return pins_all(p, lo, mid) + pins_all(p, mid + 1, hi)
def save(obj, f):
    json.dump(obj, open(f + ".tmp", "w")); os.replace(f + ".tmp", f)
homes = json.load(open(os.path.join(C, "homes.json"))); cards = json.load(open(os.path.join(C, "cards.json")))
fees = json.load(open(os.path.join(C, "fees.json")))
ef = os.path.join(C, "exact.json"); exact = json.load(open(ef)) if os.path.exists(ef) else {}
def one(k):
    r = fees[k]; out = {}
    ms = [m for m in r if not m.startswith("_") and 0 < r[m] <= 3000]
    if not ms: return k, out
    name = (cards[ms[0]].get("subdivision") or "").strip()
    try:
        for t in {homes[m]["type"] for m in ms}:
            base = {"subdivision": name, "type": t}
            byT = {}
            for m in ms:
                if homes[m]["type"] == t: byT.setdefault(r[m], set()).add(m)
            for T, S in byT.items():
                lo = STEPS[STEPS.index(T) - 1]
                memo = {}
                def le(x):
                    if x not in memo: memo[x] = {p["mls"] for p in pins_all(dict(base, hoaMax=x))} & S
                    return memo[x]
                def split(a, b, SS):  # SS: fee in (a, b]
                    if not SS: return
                    if b - a == 1:
                        for m in SS: out[m] = b
                        return
                    mid = (a + b) // 2
                    low = le(mid) & SS
                    split(a, mid, low); split(mid, b, SS - low)
                split(lo, T, S)
    except RuntimeError: return k, None
    return k, out
todo = [k for k in fees if k not in exact and isinstance(fees[k], dict) and "_skipped" not in fees[k]]
with ThreadPoolExecutor(int(os.environ.get("THREADS", "6"))) as ex:
    for i, (k, r) in enumerate(ex.map(one, todo)):
        if r is None: print("retry later", k, flush=True); continue
        exact[k] = r
        if i % 20 == 0: print("exact", i, len(todo), flush=True); save(exact, ef)
save(exact, ef)
print("done", len(exact))
