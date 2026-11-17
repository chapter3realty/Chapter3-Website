"""Homes for sale now in Briarcliffe Acres, in aggregate, from the site's public map API (https://chapter3realty.com/homes/api/map, CCMLS active listings)
and the public listing card (/homes/api/lookup). MLS subdivision name searched: "Briarcliffe Acres". A home counts when its map point is inside the town boundary
(county Municipalities layer 31, buffered 40 m). Also records the live counts of the strips the page uses (/homes/api/strip). HOA: hoa=0 = the listing says no HOA; hoaMax=0 includes a $0 fee.
Saved: counts, list-price range and median, beds, size, year built, acres, HOA fields as listed, strip counts. No MLS number, address, listing firm or photo.
Run: RAW=<scratch> python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, os, sys, time, statistics as st, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
D, RAW = sys.argv[1], os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json")))
town = unary_union([Polygon(r).buffer(0) for t in C["geo"]["towns"] if t["attributes"]["NAME"] == "BRIARCLIFFE" for r in t["geometry"]["rings"]]).buffer(0.0004)
BASE = "https://chapter3realty.com/homes/api/"
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(3 + 3 * i)
    raise SystemExit("failed " + url)
def inside(pins): return {p["mls"] for p in pins if p.get("lat") and town.contains(Point(p["lng"], p["lat"]))}
d = get("map", {"subdivision": "Briarcliffe Acres"}); ids = inside(d["pins"])
cards = [get("lookup", {"mls": m}).get("facts") or {} for m in sorted(ids)]
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE + "map", "refreshedAt": d["meta"]["refreshedAt"], "rule": __doc__,
       "subdivision_search_total": d["total"], "for_sale_inside_town": len(ids), "subdivision_names": sorted({c.get("subdivision") for c in cards}), "types": sorted({c.get("type") for c in cards}),
       "listing_says_no_hoa": len(inside(get("map", {"subdivision": "Briarcliffe Acres", "hoa": "0"})["pins"]) & ids),
       "at_or_under_0_fee": len(inside(get("map", {"subdivision": "Briarcliffe Acres", "hoaMax": 0})["pins"]) & ids),
       "hoa_monthly_listed": [c.get("hoaMonthly") for c in cards], "hoa_fields": [{k: c.get(k) for k in c if "hoa" in k.lower()} for c in cards],
       "list_price": [c.get("listPrice") for c in cards], "year_built": [c.get("yearBuilt") for c in cards], "sqft": [c.get("sqft") for c in cards], "beds": [c.get("beds") for c in cards],
       "city_on_card": sorted({c.get("city") for c in cards}), "waterfront_flag": [c.get("waterfront") for c in cards], "strips": {}}
NEAR = "33.79068,-78.75036"
for name, q in {"town (subdivision)": {"subdivision": "Briarcliffe Acres"}, "houses within 1.5 miles": {"near": NEAR, "miles": "1.5", "type": "house"},
                "houses with a pool within 2 miles": {"near": NEAR, "miles": "2", "type": "house", "has": "pool"}, "houses within 1.5 miles at $700,000 and up": {"near": NEAR, "miles": "1.5", "type": "house", "min": "700000"},
                "houses with a lake view within 1.5 miles": {"near": NEAR, "miles": "1.5", "type": "house", "has": "lake_view"}, "homes within 1 mile (all types)": {"near": NEAR, "miles": "1"}}.items():
    r = get("strip", q); out["strips"][name] = {"query": urllib.parse.urlencode(q), "ok": r.get("ok"), "total": r.get("total")}
json.dump(out, open(os.path.join(D, "listings.json"), "w"), indent=1); print(json.dumps({k: v for k, v in out.items() if k != "rule"}, indent=1))
