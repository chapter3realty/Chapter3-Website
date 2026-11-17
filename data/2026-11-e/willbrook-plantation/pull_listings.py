"""Homes for sale now in Willbrook Plantation (MLS subdivision "Willbrook Plantation") and in Tradition (MLS name "Tradition", the Tradition Club at Willbrook part), in aggregate, from the
site's public map API (https://chapter3realty.com/homes/api/map, CCMLS active listings through the CRM) and the listing card (/homes/api/lookup).
A home counts when its card's subdivision is the name and its map point is inside the community outline (county parcels, buffered 40 m). "Tradition" also matches other places by name: the near= filter and the outline keep only this one.
HOA fee: bracketed with the site's filter hoaMax=T (T = 0, 25, 50 ... 1000); hoa=0 = the listing says there is no HOA. Saved: counts, list-price median and range, beds, size, lot, year built, fee brackets, and each strip's live count. No MLS number, address, listing firm or photo is saved.
Run: RAW=<scratch> python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, os, sys, time, statistics as st, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
D, RAW = sys.argv[1], os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json")))
shape = unary_union([unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"]]) for f in C["parcels"] if f["attributes"]["StreetName"] != "UNKNOWN" and f["attributes"]["LandUseCode"][:1] in "QN"]).buffer(0.0004)
BASE = "https://chapter3realty.com/homes/api/"
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(3 + 3 * i)
    raise SystemExit("failed " + url)
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE + "map", "rule": __doc__, "groups": {}, "strips": {}}
for name, sub, extra in (("Willbrook Plantation", "Willbrook Plantation", {}), ("Tradition Club at Willbrook (MLS: Tradition)", "Tradition", {"near": "33.4885,-79.1125", "miles": "1.5"})):
    d = get("map", dict({"subdivision": sub}, **extra)); out["refreshedAt"] = d["meta"]["refreshedAt"]
    ids = {}
    for p in d["pins"]:
        f = get("lookup", {"mls": p["mls"]}).get("facts") or {}
        if f.get("subdivision") == sub and shape.contains(Point(p["lng"], p["lat"])): ids[p["mls"]] = f
    cards = list(ids.values())
    no_hoa = {p["mls"] for p in get("map", dict({"subdivision": sub, "hoa": "0"}, **extra))["pins"]} & set(ids)
    fee = {}
    for t in [0] + list(range(25, 1001, 25)):
        fee[t] = len({p["mls"] for p in get("map", dict({"subdivision": sub, "hoaMax": t}, **extra))["pins"]} & set(ids))
        if fee[t] == len(ids): break
    r = {"for_sale": len(ids), "types": sorted({c.get("type") for c in cards}), "listing_says_no_hoa": len(no_hoa), "fee_at_or_under": fee}
    pr = [c["listPrice"] for c in cards if c.get("listPrice")]
    if pr:
        r.update({"list_price": {"median": st.median(pr), "min": min(pr), "max": max(pr)}, "prices": sorted(pr),
                  "year_built": sorted(c["yearBuilt"] for c in cards if c.get("yearBuilt")), "sqft": sorted(c["sqft"] for c in cards if c.get("sqft")),
                  "lot_acres": sorted(c["lotAcres"] for c in cards if c.get("lotAcres")), "beds": sorted(c["beds"] for c in cards if c.get("beds")),
                  "hoa_monthly_listed": sorted(c["hoaMonthly"] for c in cards if c.get("hoaMonthly") is not None), "waterfront_flag": sum(1 for c in cards if c.get("waterfront"))})
    out["groups"][name] = r; print(name, r, flush=True)
STRIPS = {"Willbrook Plantation (all)": "subdivision=Willbrook+Plantation", "Willbrook Plantation over $1 million": "subdivision=Willbrook+Plantation&min=1000000",
          "Tradition Club at Willbrook": "subdivision=Tradition&near=33.4885,-79.1125&miles=1.5", "Within a mile of Willbrook Plantation": "near=33.48923,-79.12668&miles=1",
          "Golf communities within a mile": "near=33.48923,-79.12668&miles=1&has=golf_community", "Houses with 4 or more bedrooms within a mile": "near=33.48923,-79.12668&miles=1&type=Detached&beds=4"}
for k, q in STRIPS.items():
    s = get("strip", dict(urllib.parse.parse_qsl(q))); out["strips"][k] = {"query": q, "ok": s.get("ok"), "total": s.get("total"), "link": s.get("link")}; print(k, s.get("ok"), s.get("total"))
json.dump(out, open(os.path.join(D, "listings.json"), "w"), indent=1)
