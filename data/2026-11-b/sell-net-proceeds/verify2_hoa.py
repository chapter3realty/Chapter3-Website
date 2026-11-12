import json, sys, time, urllib.request, urllib.parse
from shapely.geometry import Polygon, Point
from shapely.prepared import prep
BASE = "https://chapter3realty.com/homes/api/map?"
def get(p):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(BASE + urllib.parse.urlencode(p), headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3 + 2 * i)
    raise SystemExit("fail")
def band(e, lo, hi, acc):
    d = get(dict(e, min=lo, max=hi))
    if d["total"] == 0: return
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        m = (lo + hi) // 2; band(e, lo, m, acc); band(e, m + 1, hi, acc); return
    for p in d["pins"]: acc[p["mls"]] = (p.get("lat"), p.get("lng"))
P = prep(Polygon(json.load(open(sys.argv[1]))["features"][0]["geometry"]["rings"][0]))
out = {}
for t in ("house", "townhouse", "condo"):
    acc = {}; band({"type": t, "hoa": 0}, 0, 50000000, acc)
    tot = get({"type": t, "hoa": 0})["total"]
    out[t] = {"no_hoa_feed_pins": len(acc), "api_total": tot, "no_hoa_in_horry": [m for m, (la, ln) in acc.items() if la and ln and P.contains(Point(ln, la))]}
raw = json.load(open(sys.argv[2]))
N = set(raw["sets"]["new_construction"]["house"]) | set(raw["sets"]["new_construction"]["townhouse"])
for t in out:
    s = set(out[t]["no_hoa_in_horry"]); print(t, out[t]["no_hoa_feed_pins"], out[t]["api_total"], "in Horry", len(s), "resale", len(s - N))
