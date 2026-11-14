"""Homes for sale now in Plantation Point and The Landing at Plantation Point, in aggregate, from the site's public map API
(https://chapter3realty.com/homes/api/map, CCMLS active listings through the CRM) and the public listing card (/homes/api/lookup).
A home counts when its map point falls inside the community outline (the county parcels of pull_county.py, buffered 40 m).
MLS subdivision names searched: "Plantation Point" and "The Landing". HOA fee: bracketed with the site's own filter
hoaMax=T (T = 0, 25, 50 ... 1000); hoa=0 = the listing says there is no HOA. hoaMax=0 also returns listings that name an HOA with a $0 fee.
Saved: counts, list-price median and range, beds range, size median, year-built range, fee brackets. No MLS number, address,
listing firm or photo is saved. Run: RAW=<scratch> python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, os, sys, time, statistics as st, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
D, RAW = sys.argv[1], os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json")))
LANDING_ST = {"LANDING RD", "LIGHTHOUSE WAY", "SHIPYARD RD", "KETCH CT", "PLANTATION DR"}
A = {str(int(float(k))).zfill(11): v for k, v in C["addresses"].items()}
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
main = unary_union([poly(a["rings"]) for p, a in C["parcels"].items() if not (((A.get(p) or [{}])[0].get("street") in LANDING_ST) or "LANDING" in a["section"])]).buffer(0.0004)
land = unary_union([poly(a["rings"]) for p, a in C["parcels"].items() if ((A.get(p) or [{}])[0].get("street") in LANDING_ST) or "LANDING" in a["section"]]).buffer(0.0004)
BASE = "https://chapter3realty.com/homes/api/"
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(3 + 3 * i)
    raise SystemExit("failed " + url)
def inside(pins, shape): return {p["mls"] for p in pins if p.get("lat") and shape.contains(Point(p["lng"], p["lat"]))}
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE + "map", "rule": __doc__, "groups": {}}
for name, sub, shape in (("Plantation Point", "Plantation Point", main), ("The Landing at Plantation Point", "The Landing", land)):
    d = get("map", {"subdivision": sub}); ids = inside(d["pins"], shape)
    out["refreshedAt"] = d["meta"]["refreshedAt"]
    cards = [get("lookup", {"mls": m}).get("facts") or {} for m in sorted(ids)]
    no_hoa = inside(get("map", {"subdivision": sub, "hoa": "0"})["pins"], shape) & ids
    fee = {}
    for t in [0] + list(range(25, 1001, 25)):
        fee[t] = len(inside(get("map", {"subdivision": sub, "hoaMax": t})["pins"], shape) & ids)
        if fee[t] == len(ids): break
    r = {"for_sale": len(ids), "subdivision_names": sorted({c.get("subdivision") for c in cards}), "types": sorted({c.get("type") for c in cards}),
         "listing_says_no_hoa": len(no_hoa), "fee_at_or_under": fee}
    if cards:
        pr = [c["listPrice"] for c in cards if c.get("listPrice")]; yb = [c["yearBuilt"] for c in cards if c.get("yearBuilt")]; sq = [c["sqft"] for c in cards if c.get("sqft")]
        r.update({"list_price": {"median": st.median(pr), "min": min(pr), "max": max(pr)}, "year_built": [min(yb), max(yb)] if yb else None,
                  "sqft_median": st.median(sq) if sq else None, "beds": [min(c.get("beds") or 0 for c in cards), max(c.get("beds") or 0 for c in cards)],
                  "hoa_monthly_listed": sorted(c["hoaMonthly"] for c in cards if c.get("hoaMonthly") is not None)})
    out["groups"][name] = r; print(name, r, flush=True)
json.dump(out, open(os.path.join(D, "listings.json"), "w"), indent=1)
