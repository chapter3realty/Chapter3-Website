"""Verifier recount for /sell/net-proceeds/ rows 34-35. Same API and Horry outline as pull_listings.py, but a leaf band
keeps its pins only when the API's own total for that band is above zero and equals the pins returned (an empty band
returns unrelated fallback pins). Usage: python3 -I recount.py <horry-county.json> <out.json>"""
import json, sys, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
B = "https://chapter3realty.com/homes/api/map?"
def get(p):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(B + urllib.parse.urlencode(p), headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3 + 2 * i)
    raise SystemExit("fail")
def pull(extra):
    acc, log = {}, {"fallback_dropped": 0, "short": 0}
    def band(lo, hi):
        d = get(dict(extra, min=lo, max=hi))
        if d["total"] > len(d["pins"]) and hi - lo > 500:
            m = (lo + hi) // 2; band(lo, m); band(m + 1, hi); return
        if d["total"] == 0: log["fallback_dropped"] += len(d["pins"]); return
        if d["total"] > len(d["pins"]): log["short"] += d["total"] - len(d["pins"])
        for p in d["pins"][: d["total"]]: acc[p["mls"]] = (float(str(p["price"]).replace("$", "").replace(",", "")), p.get("lat"), p.get("lng"))
    band(0, 50000000)
    return acc, log, get(extra)["total"]
SETS = {"all": {}, "price_reduced": {"has": "price_reduced"}, "home_warranty": {"has": "home_warranty"}, "new_construction": {"has": "new_construction"}}
jobs = [(s, t) for s in SETS for t in ("house", "townhouse", "condo")]
with ThreadPoolExecutor(6) as ex:
    res = dict(zip(jobs, ex.map(lambda j: pull(dict(SETS[j[0]], type=j[1])), jobs)))
hc = json.load(open(sys.argv[1]))["features"][0]["geometry"]["rings"]
def inside(x, y):
    c = False
    for r in hc:
        for i in range(len(r)):
            x1, y1 = r[i - 1]; x2, y2 = r[i]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
out = {"check": {f"{s}/{t}": {"union": len(res[(s, t)][0]), "api_total": res[(s, t)][2], **res[(s, t)][1]} for s, t in jobs}, "kinds": {}}
BANDS = {"house": [(0, 300000), (300000, 450000), (450000, 700000), (700000, None)], "condo": [(0, 150000), (150000, 250000), (250000, 400000), (400000, None)]}
for kind, types in (("house", ["house", "townhouse"]), ("condo", ["condo"])):
    def hor(s):
        o = {}
        for t in types:
            for m, (p, la, ln) in res[(s, t)][0].items():
                if la is not None and ln is not None and p and inside(ln, la): o[m] = p
        return o
    A, R, W, N = hor("all"), hor("price_reduced"), hor("home_warranty"), hor("new_construction")
    res_ = {m: p for m, p in A.items() if m not in N}
    k = {"for_sale": len(A), "resale": len(res_), "price_cut_resale": len([m for m in res_ if m in R]),
         "warranty": len([m for m in A if m in W]), "warranty_new": len([m for m in A if m in W and m in N]),
         "warranty_resale": len([m for m in res_ if m in W]), "R_not_in_A": len([m for m in R if m not in A]), "bands": []}
    k["pct_price_cut_resale"] = round(100 * k["price_cut_resale"] / k["resale"], 1)
    k["pct_warranty_resale"] = round(100 * k["warranty_resale"] / k["resale"], 1)
    for lo, hi in BANDS[kind]:
        rb = [m for m, p in res_.items() if p >= lo and (hi is None or p < hi)]
        c = len([m for m in rb if m in R]); k["bands"].append([lo, hi, len(rb), c, round(100 * c / len(rb), 1)])
    out["kinds"][kind] = k
json.dump(out, open(sys.argv[2], "w"), indent=1); print(json.dumps(out, indent=1))
