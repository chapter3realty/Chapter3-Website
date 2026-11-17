"""Houses on an acre or more for sale in Horry County, from the public map API (active CCMLS listings), aggregate only.
Each pin's ask, acres and ZIP are read in memory; the file keeps counts, medians and middle halves. No address, MLS number or point is saved.
Run: python3 -I pull_acreage.py <this folder>"""
import json, sys, time, re, statistics, urllib.request, urllib.parse, datetime
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90))
            time.sleep(2.1); calls.append({"url": url, "total": j["total"]}); return j
        except Exception: time.sleep(15)
    raise SystemExit("fail " + url)
def money(s):
    try: return int(re.sub(r"[^0-9]", "", s or "")) or None
    except ValueError: return None
def all_pins(base):
    got = {}
    def walk(a, b):
        j = get(dict(base, min=a, max=b))
        if j["total"] == 0: return
        if j["total"] < 144 or b - a < 1000:
            for p in j["pins"][: j["total"]]: got[p["mls"]] = p
            return
        m = (a + b) // 2; walk(a, m); walk(m + 1, b)
    walk(0, 50_000_000); return list(got.values())
AREAS = {"Aynor and Galivants Ferry": ["29511", "29544"], "Loris, Green Sea and Nichols": ["29569", "29545", "29581"],
 "Conway": ["29526", "29527", "29528"], "Longs": ["29568"], "Little River": ["29566"], "North Myrtle Beach": ["29582"],
 "Myrtle Beach, Carolina Forest and Socastee": ["29572", "29577", "29579", "29588", "29575"], "Murrells Inlet and Garden City": ["29576"]}
def area(z):
    for k, v in AREAS.items():
        if z in v: return k
    return "Other"
def q(v, f):
    v = sorted(v)
    if not v: return None
    i = (len(v) - 1) * f; a = int(i); b = min(a + 1, len(v) - 1); return v[a] + (v[b] - v[a]) * (i - a)
def summ(rows):
    pr = [r["price"] for r in rows if r["price"]]; ac = [r["acres"] for r in rows]
    return {"n": len(rows), "price_q1": q(pr, .25), "price_med": q(pr, .5), "price_q3": q(pr, .75), "acres_med": q(ac, .5),
            "acres_q1": q(ac, .25), "acres_q3": q(ac, .75)}
rows = []
base = {"type": "house", "lotMin": 1, "has": "county_horry"}
tot = get(base)["total"]
for p in all_pins(base):
    try: ac = float(p.get("acres") or 0)
    except ValueError: ac = 0
    z = (p.get("addr") or "")[-5:]
    rows.append({"price": money(p.get("price")), "acres": ac, "zip": z, "beds": p.get("beds"), "sqft": p.get("sqft")})
rows = [r for r in rows if r["acres"] >= 1]
bands = {"1 to 2 acres": (1, 2), "2 to 5 acres": (2, 5), "5 to 10 acres": (5, 10), "10 acres or more": (10, 1e9)}
res = {"read": datetime.date.today().isoformat(), "unsplit_total": tot, "houses_1plus": len(rows),
       "all": summ(rows), "by_band": {k: summ([r for r in rows if a <= r["acres"] < b]) for k, (a, b) in bands.items()},
       "by_area": {}, "by_area_5plus": {}, "calls": len(calls)}
for k in list(AREAS) + ["Other"]:
    sub = [r for r in rows if area(r["zip"]) == k]
    res["by_area"][k] = summ(sub)
    res["by_area_5plus"][k] = summ([r for r in sub if r["acres"] >= 5])
res["under_150k"] = sum(1 for r in rows if r["price"] and r["price"] < 150000)
res["with_acres_5plus_3bed_up"] = sum(1 for r in rows if r["acres"] >= 5 and (r["beds"] or 0) >= 3)
json.dump(res, open(OUT + "/acreage.json", "w"), indent=1)
json.dump(calls, open(OUT + "/raw/calls.json", "w"))
print(json.dumps(res, indent=1))
