"""What the listings say the HOA fee pays for and what the community has, per neighborhood, in aggregate.
Runs after pull_hoa_neighborhoods.py, from the same per-home cache (CACHE: homes.json, cards.json, fees.json).
For each flag below and each kind of home, the site's public map API is asked type=<type>&has=<flag> inside the same three
25-mile circles (split by price until each search returns all its homes). Each community's count is then the number of its
own homes (exact subdivision name, from the cache) that carry the flag.
area_carolina_forest and area_socastee are the CRM's area tags, used to place a community in Carolina Forest or Socastee.
Flags are the listing agent's ticked fields in the MLS (CCMLS), so they show what listings say, not the HOA's documents.
"gated" is left out: it is ticked on most homes in at least one community with no gate (Waterbridge, 24 of 26, 2026-11-13).
Saved: per community, the number of homes for sale and, per flag, how many listings tick it (all homes, and among
homes whose listing gives a fee above $0, from the fee cache of pull_hoa_neighborhoods.py). No MLS number, address or photo.
The per-flag sets of MLS numbers are cached in CACHE/flagsets.json (scratch, never in the repo); a cut-off run resumes there.
Run: CACHE=<scratch dir> python3 -I pull_includes.py <datadir>. Writes <datadir>/hoa-includes.json."""
import json, os, sys, time, re, datetime, urllib.request, urllib.parse
D = sys.argv[1]; C = os.environ["CACHE"]
BASE = "https://chapter3realty.com/homes/api/map?"
FLAGS = ["lawn_care_included", "hoa_includes_internet", "hoa_includes_cable", "hoa_includes_trash", "hoa_includes_water_sewer",
         "hoa_includes_insurance", "community_pool", "clubhouse", "tennis", "area_carolina_forest", "area_socastee"]
CIRCLES = ["33.86,-78.66", "33.66,-78.95", "33.45,-79.12"]
TYPES = os.environ.get("TYPES", "house,townhouse,manufactured").split(",")
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
    if hi - lo < 2000: raise RuntimeError("cannot split " + str(p))
    mid = (lo + hi) // 2
    return pins_all(p, lo, mid) + pins_all(p, mid + 1, hi)
def save(obj, f):
    json.dump(obj, open(f + ".tmp", "w")); os.replace(f + ".tmp", f)
homes = json.load(open(os.path.join(C, "homes.json"))); cards = json.load(open(os.path.join(C, "cards.json")))
fees = json.load(open(os.path.join(C, "fees.json")))
sf = os.path.join(C, "flagsets.json"); sets = json.load(open(sf)) if os.path.exists(sf) else {}
for f in FLAGS:
    for t in TYPES:
        if f + "|" + t in sets: continue
        got = set()
        for c in CIRCLES: got |= {p["mls"] for p in pins_all({"near": c, "miles": 25, "type": t, "has": f})}
        sets[f + "|" + t] = sorted(got); save(sets, sf); print("flag", f, t, len(got), flush=True)
key = lambda s: re.sub(r"\s+", " ", (s or "").strip()).lower()
SKIP = ("none", "not within a subdivision", "n/a", "na", "no", "other", "not in a subdivision", "unknown")
groups = {}
for m, h in homes.items():
    k = key((cards.get(m) or {}).get("subdivision"))
    if k and k not in SKIP: groups.setdefault(k, []).append(m)
groups = {k: v for k, v in groups.items() if len(v) >= 3}
S = {f: set().union(*(set(sets[f + "|" + t]) for t in TYPES)) for f in FLAGS}
out = {}
for k, ms in sorted(groups.items()):
    fk = fees.get(k) or {}; got = set(ms); paid = {m for m in got if (fk.get(m) or 0) > 0}
    out[k] = {**{f: len(S[f] & got) for f in FLAGS}, "homes_found": len(got), "homes_with_fee": len(paid),
              "among_homes_with_fee": {f: len(S[f] & paid) for f in FLAGS},
              "name": (cards[ms[0]].get("subdivision") or "").strip(), "homes": len(ms)}
save({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "flags": FLAGS,
      "flag_totals": {f + "|" + t: len(sets[f + "|" + t]) for f in FLAGS for t in TYPES}, "communities": out},
     os.path.join(D, "hoa-includes.json"))
print("done", len(out))
