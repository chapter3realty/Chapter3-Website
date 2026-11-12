"""Active for-sale listings from the Chapter3 CRM's public map API (https://chapter3realty.com/homes/api/map), counted in
aggregate only. For /sell/net-proceeds/: how many homes for sale now have cut their asking price, and how many advertise a
home warranty, by home type and price band, inside the Census
Horry County outline. Splits price bands until a search returns every pin (the API returns at most 144 a call).
Keeps only MLS number, price and point, and only in RAW (scratch, outside the repo). The repo file holds counts only.
Run: RAW=<scratch> HORRY=<web>/data/2026-10-d/sell-home-value/raw/horry-county.json python3 -I pull_listings.py <this dir>"""
import json, os, sys, time, urllib.request, urllib.parse, datetime
from concurrent.futures import ThreadPoolExecutor
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True); OUT = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3 + 2 * i)
    raise SystemExit("failed " + url)
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
def band(extra, lo, hi, acc, warn):
    d = get(dict(extra, min=lo, max=hi))
    if d["total"] == 0: return  # an empty band still sends up to 144 unrelated fallback pins (verifier, 2026-11-04)
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(extra, lo, mid, acc, warn); band(extra, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([extra, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]: acc[p["mls"]] = [num(p["price"]), p.get("lat"), p.get("lng")]
SETS = [("all", {}), ("price_reduced", {"has": "price_reduced"}), ("home_warranty", {"has": "home_warranty"}), ("new_construction", {"has": "new_construction"})]
TYPES = ["house", "townhouse", "condo"]
def job(a):
    name, extra, t = a; acc, warn = {}, []
    e = dict(extra, type=t); band(e, 0, 50000000, acc, warn)
    tot = get(e); return name, t, acc, warn, tot["total"], tot.get("meta", {}).get("refreshedAt")
raw = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "sets": {}, "truncated": [], "api_totals": {}}
with ThreadPoolExecutor(6) as ex:
    for name, t, acc, warn, tot, ref in ex.map(job, [(n, e, t) for n, e in SETS for t in TYPES]):
        raw["sets"].setdefault(name, {})[t] = acc; raw["truncated"] += warn; raw["api_totals"][f"{name}/{t}"] = tot; raw["refreshedAt"] = ref
        print(name, t, len(acc), tot, flush=True)
json.dump(raw, open(os.path.join(RAW, "listings-net-proceeds.json"), "w"))
# Count inside Horry County (ray casting on the Census outline's rings).
hc = json.load(open(os.environ["HORRY"]))["features"][0]["geometry"]["rings"]
def inside(lng, lat):
    c = False
    for ring in hc:
        for i in range(len(ring)):
            x1, y1 = ring[i - 1]; x2, y2 = ring[i]
            if (y1 > lat) != (y2 > lat) and lng < (x2 - x1) * (lat - y1) / (y2 - y1) + x1: c = not c
    return c
BANDS = {"house": [(0, 300000), (300000, 450000), (450000, 700000), (700000, None)],
         "condo": [(0, 150000), (150000, 250000), (250000, 400000), (400000, None)]}
def bname(lo, hi): return f"{lo}-{hi if hi else 'up'}"
out = {"pulled": raw["pulled"], "refreshedAt": raw.get("refreshedAt"), "truncated": len(raw["truncated"]),
       "rule": __doc__.strip().splitlines()[0] + " House group = MLS house + townhouse; condo = MLS condo. Resale = not tagged new construction. Bands use the list price; a band's low end is included, its high end is not.",
       "kinds": {}}
for kind, types in (("house", ["house", "townhouse"]), ("condo", ["condo"])):
    def hor(setname):
        s = {}
        for t in types:
            for m, (pr, la, ln) in raw["sets"][setname][t].items():
                if la is not None and ln is not None and pr and inside(ln, la): s[m] = pr
        return s
    A, R, W, N = hor("all"), hor("price_reduced"), hor("home_warranty"), hor("new_construction")
    res = {m: p for m, p in A.items() if m not in N}
    k = {"for_sale": len(A), "resale": len(res), "new": len([m for m in A if m in N]),
         "price_cut": len([m for m in A if m in R]), "price_cut_resale": len([m for m in res if m in R]),
         "warranty": len([m for m in A if m in W]), "warranty_resale": len([m for m in res if m in W]),
         "warranty_new": len([m for m in A if m in W and m in N]), "bands": []}
    for f in ("price_cut", "price_cut_resale", "warranty", "warranty_resale"):
        base = k["for_sale"] if not f.endswith("resale") else k["resale"]
        k["pct_" + f] = round(100 * k[f] / base, 1) if base else None
    for lo, hi in BANDS[kind]:
        inb = lambda p: p >= lo and (hi is None or p < hi)
        rb = [m for m, p in res.items() if inb(p)]
        k["bands"].append({"band": bname(lo, hi), "resale": len(rb), "price_cut": len([m for m in rb if m in R]),
                           "warranty": len([m for m in rb if m in W]),
                           "pct_price_cut": round(100 * len([m for m in rb if m in R]) / len(rb), 1) if rb else None,
                           "pct_warranty": round(100 * len([m for m in rb if m in W]) / len(rb), 1) if rb else None})
    out["kinds"][kind] = k
json.dump(out, open(os.path.join(OUT, "listings.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
