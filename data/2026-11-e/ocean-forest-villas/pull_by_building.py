"""Ocean Forest Villas, listings by building (A to E), in aggregate. Each listing pin is assigned to the nearest building center (zoning.json), then each pin's fee is bracketed
by hoaMax calls at $1 steps near the two fee levels found by pull_fee_exact.py (450 to 749) using bisection on the sorted fee levels. Kept per building: count, asking middle/min/max, fee range, count with an ocean view (has=ocean_view),
count in a rental program (has=vacation_rental_program). No MLS number, unit or single-listing price is kept.
Run: python3 -I pull_by_building.py <this dir>. Writes by_building.json."""
import json, sys, time, math, statistics as st, urllib.request, urllib.parse, datetime, collections
D = sys.argv[1]; UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
B = "https://chapter3realty.com/homes/api/map?"
def get(**p):
    p = dict({"type": "condo", "subdivision": "Ocean Forest Villas"}, **p)
    for i in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(B + urllib.parse.urlencode(p), headers=UA), timeout=60)); time.sleep(1.5); return j["pins"]
        except Exception: time.sleep(8)
    raise SystemExit("fail")
cent = {b: v["center"] for b, v in json.load(open(D + "/zoning.json"))["buildings"].items()}
pins = get(); build = {}
for x in pins: build[x["mls"]] = min(cent, key=lambda b: math.hypot(x["lat"] - cent[b][0], x["lng"] - cent[b][1]))
fee = {}
lo, hi = 440, 760
ts = [450, 460, 475, 500, 525, 550, 575, 600, 650, 700, 749, 760]   # the thresholds; each pin gets the first T that holds it
for t in ts:
    got = {x["mls"] for x in get(hoaMax=t)}
    for m in got:
        fee.setdefault(m, t)
flag = {k: {x["mls"] for x in get(has=k)} for k in ("ocean_view", "vacation_rental_program", "oceanfront_unit", "str_allowed")}
price = lambda x: int(x["price"].replace("$", "").replace(",", ""))
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "thresholds_fee_at_or_under": ts, "buildings": {}}
for b in sorted(cent):
    xs = [x for x in pins if build[x["mls"]] == b]
    if not xs: continue
    f = [fee.get(x["mls"]) for x in xs]
    out["buildings"][b] = {"n": len(xs), "asking_median": st.median(price(x) for x in xs), "asking_min": min(price(x) for x in xs), "asking_max": max(price(x) for x in xs),
                           "fee_bracket_counts": dict(collections.Counter(f)), "ocean_view": sum(1 for x in xs if x["mls"] in flag["ocean_view"]),
                           "oceanfront_unit": sum(1 for x in xs if x["mls"] in flag["oceanfront_unit"]), "rental_program": sum(1 for x in xs if x["mls"] in flag["vacation_rental_program"]),
                           "str_allowed": sum(1 for x in xs if x["mls"] in flag["str_allowed"])}
json.dump(out, open(D + "/by_building.json", "w"), indent=1); print(json.dumps(out["buildings"], indent=1))
