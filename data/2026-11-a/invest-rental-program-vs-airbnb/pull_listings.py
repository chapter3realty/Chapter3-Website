"""Oceanfront-building condos for sale in Horry County, from the CRM's public map API (active MLS listings), counted in aggregate:
the listing's "In a rental program" flag (has=vacation_rental_program) against the rest, with asking price, HOA fee and loan flags;
then the same counts by building, where the building is the "Subdivision" line on each listing's public page on chapter3realty.com/homes/.
The API returns at most 144 pins, so the set is read in price slices. No address number, MLS number, price of one unit or firm is kept
in the output; buildings with fewer than 5 listings are pooled. Calls spaced 2.1 s.
Run: python3 -I pull_listings.py <this folder>. Writes listings.json (aggregate) and raw/by-building.json."""
import json, sys, time, re, html, urllib.request, urllib.parse, datetime, collections, statistics
D = sys.argv[1]; SITE = "https://chapter3realty.com"; BASE = SITE + "/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def get(url, js=True):
    for _ in range(5):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read().decode("utf8", "replace")
            time.sleep(2.1); return json.loads(r) if js else r
        except Exception:
            time.sleep(20)
    raise SystemExit("failed " + url)
def q(p):
    url = BASE + urllib.parse.urlencode(dict(p, limit=144)); j = get(url); calls.append({"url": url, "total": j["total"]}); return j
def total(p): return q(p)["total"]
def median(base, key, lo, hi, step, n):
    while hi - lo > step:
        mid = (lo + hi) // 2 // step * step
        if total(dict(base, **{key: mid})) >= n / 2: hi = mid
        else: lo = mid
    return hi
OF = {"type": "condo", "has": "county_horry,oceanfront_building"}
PR = {"type": "condo", "has": "county_horry,oceanfront_building,vacation_rental_program"}
FLAGS = ["str_allowed", "long_term_rental_allowed", "conventional_accepted", "fha_accepted", "va_accepted", "cash_only_listing", "furnished", "hoa_includes_insurance", "hoa_includes_electric", "has_rental_income", "high_rise"]
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "groups": {}}
for name, base in {"oceanfront_building": OF, "in_program": PR}.items():
    n = total(base); g = {"params": base, "listings": n}
    g["median_ask_5k"] = median(base, "max", 0, 5000000, 5000, n)
    nd = total(dict(base, hoaMax=5000)); g["dues_known"] = nd; g["median_dues_25"] = median(base, "hoaMax", 0, 5000, 25, nd)
    g["ask_at_or_under"] = {t: total(dict(base, max=t)) for t in [150000, 200000, 250000, 300000, 400000, 500000]}
    g["dues_at_or_under"] = {t: total(dict(base, hoaMax=t)) for t in [600, 800, 1000, 1200]}
    g["flags"] = {f: total(dict(base, has=base["has"] + "," + f)) for f in FLAGS}
    g["beds_at_least"] = {b: total(dict(base, beds=b)) for b in [1, 2, 3, 4]}
    for city in ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach"]:
        g.setdefault("city", {})[city] = total(dict(base, city=city))
    out["groups"][name] = g; print(name, json.dumps({k: v for k, v in g.items() if k != "params"}), flush=True)
# not in a program, by subtraction
a, p = out["groups"]["oceanfront_building"], out["groups"]["in_program"]
out["groups"]["not_in_program_by_subtraction"] = {"listings": a["listings"] - p["listings"],
    "ask_at_or_under": {k: a["ask_at_or_under"][k] - p["ask_at_or_under"][k] for k in a["ask_at_or_under"]},
    "dues_at_or_under": {k: a["dues_at_or_under"][k] - p["dues_at_or_under"][k] for k in a["dues_at_or_under"]},
    "flags": {k: a["flags"][k] - p["flags"][k] for k in a["flags"]}, "dues_known": a["dues_known"] - p["dues_known"],
    "city": {k: a["city"][k] - p["city"][k] for k in a["city"]}}
# every pin, in price slices of under 144
def pins(base):
    got = {}; edges = [0]
    lo = 0
    while True:
        hi = lo + 25000
        while True:
            j = q(dict(base, min=lo, max=hi))
            if j["total"] < 144 or hi - lo <= 1000: break
            hi = lo + (hi - lo) // 2
        for x in j["pins"]: got[x["mls"]] = x
        if total(dict(base, min=hi + 1)) == 0: break
        lo = hi + 1
    return got
allp = pins(OF); prog = set(pins(PR)); conv = set(pins(dict(OF, has=OF["has"] + ",conventional_accepted")))
out["pins_read"] = {"oceanfront_building": len(allp), "in_program": len(prog), "conventional": len(conv)}
print("pins", out["pins_read"], flush=True)
def subdivision(url):
    t = get(SITE + url, js=False)
    m = re.search(r"Subdivision</span>\s*(?:<[^>]+>\s*)*([^<]+)<", t)
    return html.unescape(m.group(1)).strip() if m else ""
rows = collections.defaultdict(lambda: {"n": 0, "program": 0, "conventional": 0, "asks": [], "cities": collections.Counter()})
for i, (mls, x) in enumerate(allp.items()):
    s = subdivision(x["url"]) or "(none given)"
    r = rows[s]; r["n"] += 1; r["program"] += mls in prog; r["conventional"] += mls in conv
    r["asks"].append(int(re.sub(r"\D", "", x["price"]) or 0)); r["cities"][x["addr"].split(",")[1].strip() if "," in x["addr"] else ""] += 1
    if i % 100 == 0: print(i, flush=True)
bb = []
for k, v in rows.items():
    bb.append({"building": k, "listings": v["n"], "in_program": v["program"], "conventional_accepted": v["conventional"],
               "median_ask": int(statistics.median(v["asks"])) if v["n"] >= 5 else None, "city": v["cities"].most_common(1)[0][0]})
bb.sort(key=lambda r: -r["listings"])
json.dump({"pulled": out["pulled"], "source": "CRM public map API pins, in price slices; Subdivision line on each listing page", "buildings": bb}, open(D + "/raw/by-building.json", "w"), indent=1)
out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1)
print("done", len(bb))
