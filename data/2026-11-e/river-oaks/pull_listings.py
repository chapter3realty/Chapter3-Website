"""Homes for sale now in River Oaks (Carolina Forest), in aggregate, from the site public map API (https://chapter3realty.com/homes/api/map, CCMLS) and the
public listing card (/homes/api/lookup). A home counts when its map point is inside the community outline (county parcels of pull_county.py, buffered 60 m)
and its MLS subdivision name is one of: RIVER OAKS CONDOS, The Fairways At River Oaks, Landing at River Oaks, Oakmont at River Oaks, River Oaks Cottages.
(River Oaks Estates, Pawleys Island, is another place and is left out by its city. One RIVER OAKS CONDOS listing, on White River Dr, has a map point at 33.689,-78.887, outside the outline; the street is in River Oaks, so it is kept.)
Kept: counts, list-price median and range, beds, size, year built, the card's monthly HOA fee (counts of listings with a fee and its range), tax if the card has it.
No MLS number, address, firm or photo is kept. Run: RAW=<scratch> python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, os, sys, time, statistics as st, urllib.request, urllib.parse, datetime
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
D, RAW = sys.argv[1], os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json")))
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
shape = unary_union([poly(a["rings"]) for p, a in C["parcels"].items() if (a["LandUseCode"] or "") not in ("113",) and a["lotSqft"] < 400000]).buffer(0.0006)
BASE = "https://chapter3realty.com/homes/api/"
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(3 + 3 * i)
    raise SystemExit("failed " + url)
d = get("map", {"subdivision": "River Oaks"}); d2 = get("map", {"subdivision": "Fairways"}); d3 = get("map", {"subdivision": "Landing"})
seen = {}
for dd in (d, d2, d3):
    for p in dd["pins"]:
        if p.get("lat") and (shape.contains(Point(p["lng"], p["lat"])) or "MYRTLE-BEACH" in p["url"].upper() and p["lat"] < 33.70 and 33.6 < p["lat"]): seen[p["url"].split("/")[2].split("-")[0]] = p
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "refreshedAt": d["meta"]["refreshedAt"], "rule": __doc__, "groups": {}}
cards = {}
for m in sorted(seen):
    f = get("lookup", {"mls": m}).get("facts") or {}; time.sleep(0.3)
    if f.get("subdivision") and "RIVER OAKS" in f["subdivision"].upper() and f.get("city") == "Myrtle Beach": cards[m] = f
def summ(cs):
    r = {"for_sale": len(cs), "types": sorted({c.get("type") for c in cs})}
    if not cs: return r
    pr = [c["listPrice"] for c in cs if c.get("listPrice")]; yb = [c["yearBuilt"] for c in cs if c.get("yearBuilt")]; sq = [c["sqft"] for c in cs if c.get("sqft")]
    hoa = sorted(c["hoaMonthly"] for c in cs if c.get("hoaMonthly") is not None); tx = sorted(c["taxAnnual"] for c in cs if c.get("taxAnnual"))
    bd = sorted(c.get("beds") or 0 for c in cs)
    r.update({"list_price": {"median": st.median(pr), "min": min(pr), "max": max(pr), "q1": st.quantiles(pr, n=4)[0] if len(pr) > 3 else None, "q3": st.quantiles(pr, n=4)[2] if len(pr) > 3 else None},
              "year_built": [min(yb), max(yb)] if yb else None, "sqft": {"median": st.median(sq), "min": min(sq), "max": max(sq)} if sq else None,
              "beds": dict(sorted({b: bd.count(b) for b in set(bd)}.items())), "hoa_monthly_listed_n": len(hoa), "hoa_monthly": hoa, "tax_annual_listed": tx,
              "new_construction": sum(1 for c in cs if c.get("newConstruction")), "waterfront": sum(1 for c in cs if c.get("waterfront"))})
    return r
names = sorted({c["subdivision"] for c in cards.values()}, key=str.lower)
for n in names:
    out["groups"][n] = summ([c for c in cards.values() if c["subdivision"] == n]); print(n, out["groups"][n], flush=True)
out["all"] = summ(list(cards.values())); out["condos"] = summ([c for c in cards.values() if c["type"] == "Condominium"]); out["houses"] = summ([c for c in cards.values() if c["type"] != "Condominium"])
print("all", out["all"]); print("condos", out["condos"])
json.dump(out, open(os.path.join(D, "listings.json"), "w"), indent=1)
