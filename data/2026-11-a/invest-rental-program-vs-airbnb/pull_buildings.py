"""Second stage of the CRM pull for /invest/rental-program-vs-airbnb/ (the first run of pull_listings.py printed the aggregate
groups to raw/pull_listings-run1.log, then stopped on a listing page that had come off the market).
1. Writes listings.json from the aggregate lines of raw/pull_listings-run1.log (the counts the first run read from
   https://chapter3realty.com/homes/api/map, every call spaced 2.1 s; the URL pattern is in pull_listings.py).
2. Reads every oceanfront-building condo pin, and the pins marked "In a rental program" and "Conventional accepted", in
   adaptive price slices (the API returns at most 144 pins a call). Saves raw/pins.json (MLS numbers, addresses, firms and
   photo links, for the join only). Move it out of the website copy after the run: it may not ship (the 2026-11-04 copy is in
   the scratch folder wf2/invest-rental-program-vs-airbnb/pins.json).
3. Reads the "Subdivision" line from one listing page per street address (units at one street address are one building),
   tolerating pages that have come off the market. Writes raw/by-building.json: per building, units for sale, units marked in
   a rental program, units marked conventional accepted, city. No address, unit, price or firm in the output.
Run: python3 -I pull_buildings.py <this folder>."""
import json, sys, time, re, html, urllib.request, urllib.parse, datetime, collections, os
D = sys.argv[1]; SITE = "https://chapter3realty.com"; BASE = SITE + "/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
def get(url, js=True, tries=4):
    for i in range(tries):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read().decode("utf8", "replace")
            time.sleep(2.1); return json.loads(r) if js else r
        except urllib.error.HTTPError as e:
            if e.code == 404: time.sleep(2.1); return None
            time.sleep(15)
        except Exception:
            time.sleep(15)
    return None
# 1. listings.json from the first run's log
agg = {}
for line in open(os.path.join(D, "raw/pull_listings-run1.log")):
    m = re.match(r"^(oceanfront_building|in_program) (\{.*\})$", line.strip())
    if m: agg[m.group(1)] = json.loads(m.group(2))
a, p = agg["oceanfront_building"], agg["in_program"]
sub = lambda x, y: {k: x[k] - y[k] for k in x}
agg["not_in_program_by_subtraction"] = {"listings": a["listings"] - p["listings"], "ask_at_or_under": sub(a["ask_at_or_under"], p["ask_at_or_under"]),
    "dues_at_or_under": sub(a["dues_at_or_under"], p["dues_at_or_under"]), "flags": sub(a["flags"], p["flags"]),
    "beds_at_least": sub(a["beds_at_least"], p["beds_at_least"]), "city": sub(a["city"], p["city"]), "dues_known": a["dues_known"] - p["dues_known"]}
agg["oceanfront_building"]["params"] = {"type": "condo", "has": "county_horry,oceanfront_building"}
agg["in_program"]["params"] = {"type": "condo", "has": "county_horry,oceanfront_building,vacation_rental_program"}
json.dump({"pulled": "2026-11-04 (first run of pull_listings.py, log raw/pull_listings-run1.log)", "api": BASE,
           "how": "medians by halving the max and hoaMax filters to the nearest $5,000 and $25; counts with the has= flags named; not-in-program by subtraction",
           "groups": agg}, open(os.path.join(D, "listings.json"), "w"), indent=1)
print("listings.json written", flush=True)
# 2. pins
calls = []
def q(prm):
    url = BASE + urllib.parse.urlencode(dict(prm, limit=144)); j = get(url) or {"total": 0, "pins": []}; calls.append({"url": url, "total": j["total"]}); return j
def pins(base):
    got, lo, w = {}, 0, 50000
    top = 6000000
    while lo <= top:
        j = q(dict(base, min=lo, max=lo + w))
        if j["total"] >= 144 and w > 1000: w //= 2; continue
        for x in j["pins"]: got[x["mls"]] = x
        lo += w + 1
        if j["total"] < 50: w *= 2
        if lo > 1000000 and q(dict(base, min=lo))["total"] == 0: break
    return got
OF = {"type": "condo", "has": "county_horry,oceanfront_building"}
allp = pins(OF); prog = set(pins(dict(OF, has=OF["has"] + ",vacation_rental_program"))); conv = set(pins(dict(OF, has=OF["has"] + ",conventional_accepted")))
json.dump({"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "all": allp, "program": sorted(prog), "conventional": sorted(conv), "calls": calls},
          open(os.path.join(D, "raw/pins.json"), "w"))
print("pins", len(allp), len(prog), len(conv), flush=True)
# 3. one page per street address
def addr_key(a): return re.sub(r"\s+", " ", a.split(",")[0].upper().replace(".", "")).replace("NORTH ", "N ").replace("SOUTH ", "S ").strip()
groups = collections.defaultdict(list)
for mls, x in allp.items(): groups[addr_key(x["addr"])].append(mls)
subs = {}
for i, (k, mlss) in enumerate(groups.items()):
    name = ""
    for mls in mlss[:3]:
        t = get(SITE + allp[mls]["url"], js=False)
        if not t: continue
        m = re.search(r"Subdivision</span>\s*(?:<[^>]+>\s*)*([^<]+)<", t)
        if m: name = html.unescape(m.group(1)).strip(); break
    subs[k] = name or "(none given)"
    if i % 25 == 0: print(i, len(groups), flush=True)
rows = collections.defaultdict(lambda: {"listings": 0, "in_program": 0, "conventional_accepted": 0, "addresses": 0, "cities": collections.Counter()})
for k, mlss in groups.items():
    r = rows[subs[k]]; r["addresses"] += 1
    for mls in mlss:
        r["listings"] += 1; r["in_program"] += mls in prog; r["conventional_accepted"] += mls in conv
        parts = allp[mls]["addr"].split(","); r["cities"][parts[1].strip() if len(parts) > 1 else ""] += 1
bb = [{"building": k, "listings": v["listings"], "in_program": v["in_program"], "conventional_accepted": v["conventional_accepted"],
       "street_addresses": v["addresses"], "city": v["cities"].most_common(1)[0][0]} for k, v in rows.items()]
bb.sort(key=lambda r: -r["listings"])
json.dump({"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "pins": len(allp),
           "source": "CRM public map API pins in price slices (raw/pins.json); building = Subdivision line on one listing page per street address",
           "buildings": bb}, open(os.path.join(D, "raw/by-building.json"), "w"), indent=1)
print("done", len(bb), flush=True)
