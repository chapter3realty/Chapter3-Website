"""Houses for sale, with and without an HOA fee, from the CRM's public map API (CCMLS active listings), for
aggregate medians only. The API returns at most 144 pins a call, so each search is split into price bands
until every home is returned. A search with no match returns nearby homes with its filters
dropped (the "closest" block); those pins are skipped. Four searches: all houses; houses with no fee listed (hoaMax=0, the site's
"No HOA" filter count); houses built 2000 or later (yearMin=2000); houses built 2015 or later (yearMin=2015).
Saved per home: ZIP (from the pin's address line), list price, square feet, lot acres, the straight-line
distance to the beach as a band (under 1 mile, 1 to 3, 3 to 10, over 10), and which of the
searches returned it. No MLS number, address, firm, photo or coordinate is saved.
Run: python3 -I pull_houses.py <outdir>. Writes <outdir>/raw/houses-active.json."""
import json, sys, os, re, math, time, urllib.request, urllib.parse, datetime
# The beach, as points along the shore from Pawleys Island to Waites Island (approximate, read off the map to about
# 0.2 mile). A home's straight-line distance to this line is kept only as a band; its coordinates are not saved.
SHORE = [(33.400, -79.130), (33.500, -79.060), (33.5838, -78.9908), (33.6058, -78.9727), (33.651, -78.927), (33.6919, -78.8784),
         (33.760, -78.782), (33.785, -78.750), (33.816, -78.668), (33.8297, -78.6338), (33.846, -78.597), (33.856, -78.567)]
def miles_to_shore(lat, lng):
    if lat is None or lng is None: return None
    kx = 69.17 * math.cos(math.radians(lat)); ky = 69.0; best = 1e9
    for (a1, o1), (a2, o2) in zip(SHORE, SHORE[1:]):
        ax, ay, bx, by, px, py = o1 * kx, a1 * ky, o2 * kx, a2 * ky, lng * kx, lat * ky
        dx, dy = bx - ax, by - ay; t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        best = min(best, math.hypot(px - ax - t * dx, py - ay - t * dy))
    return best
def band_of(m):
    if m is None: return None
    return "under 1 mile" if m < 1 else "1 to 3 miles" if m < 3 else "3 to 10 miles" if m < 10 else "over 10 miles"
out = sys.argv[1]; RAW = os.path.join(out, "raw"); os.makedirs(RAW, exist_ok=True)
BASE = "https://chapter3realty.com/homes/api/map?"
calls = []
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=60))
            calls.append([url, d.get("total")]); return d
        except Exception: time.sleep(4)
    raise SystemExit("failed " + url)
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
def band(extra, lo, hi, acc, warn):
    d = get(dict(extra, type="house", min=lo, max=hi))
    if not d.get("total") or d.get("closest"): return  # an empty search returns nearby homes with the filters dropped; skip them
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(extra, lo, mid, acc, warn); band(extra, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([extra, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        m = re.search(r"(\d{5})\s*$", p.get("addr") or "")
        acc[p["mls"]] = {"zip": m.group(1) if m else None, "price": num(p.get("price")), "sqft": p.get("sqft") or None,
                         "acres": num(p.get("acres")), "beach_band": band_of(miles_to_shore(p.get("lat"), p.get("lng"))), "new_tag": bool(re.match(r"Built 20(2[5-9])", p.get("tag") or ""))}
EDGES = list(range(0, 1000001, 50000)) + [1250000, 1500000, 2000000, 3000000, 60000000]
STARTS = [(EDGES[i] + (1 if i else 0), EDGES[i + 1]) for i in range(len(EDGES) - 1)]
SEARCHES = {"all": {}, "no_fee": {"hoaMax": 0}, "built_2000_plus": {"yearMin": 2000}, "built_2015_plus": {"yearMin": 2015}}
sets, totals, warn, homes = {}, {}, [], {}
for k, extra in SEARCHES.items():
    acc = {}
    for lo, hi in STARTS: band(extra, lo, hi, acc, warn)
    totals[k] = get(dict(extra, type="house"))["total"]; sets[k] = set(acc); homes.update(acc)
    print(k, "pins", len(acc), "api total", totals[k], flush=True)
rows = []
for mls, h in homes.items():
    rows.append(dict(h, in_all=mls in sets["all"], no_fee=mls in sets["no_fee"], built_2000_plus=mls in sets["built_2000_plus"], built_2015_plus=mls in sets["built_2015_plus"]))
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "api": BASE, "searches": SEARCHES, "api_totals": totals,
           "truncated_bands": warn, "calls": len(calls), "homes": rows}, open(os.path.join(RAW, "houses-active.json"), "w"))
print("homes", len(rows), "calls", len(calls), "truncated", len(warn))
