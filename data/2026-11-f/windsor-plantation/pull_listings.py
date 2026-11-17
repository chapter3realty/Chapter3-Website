"""Homes for sale now in Windsor Plantation (MLS names "Windsor Plantation - Devonshire Estates", "Windsor Plantation - St. David's Township", "Berwick at Windsor Plantation"; subdivision=Windsor Plantation returns all), in aggregate, from the site's public map API (https://chapter3realty.com/homes/api/map, CCMLS active
listings) and listing card (/homes/api/lookup). Saved: counts, list-price median and range, beds, size, year built, HOA fee, lot size, HOA fee brackets
(hoaMax=T). No MLS number, address, firm or photo is saved. Run: python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, os, sys, time, statistics as st, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/"
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(3 + 3 * i)
    raise SystemExit("failed " + url)
sub = "Windsor Plantation"
d = get("map", {"subdivision": sub}); mls = [p["mls"] for p in d["pins"]]
cards = [get("lookup", {"mls": m}).get("facts") or {} for m in mls]
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "refreshedAt": d["meta"]["refreshedAt"], "api": BASE + "map", "rule": __doc__}
def agg(c, name):
    pr = [x["listPrice"] for x in c if x.get("listPrice")]; yb = [x["yearBuilt"] for x in c if x.get("yearBuilt")]; sq = [x["sqft"] for x in c if x.get("sqft")]
    r = {"for_sale": len(c), "subdivision_names": sorted({x.get("subdivision") for x in c}), "types": sorted({x.get("type") for x in c})}
    if c:
        r.update({"list_price": {"median": st.median(pr), "min": min(pr), "max": max(pr)}, "year_built": [min(yb), max(yb)] if yb else None, "sqft_median": st.median(sq) if sq else None,
                  "beds": [min(x.get("beds") or 0 for x in c), max(x.get("beds") or 0 for x in c)], "hoa_monthly_listed": sorted(x["hoaMonthly"] for x in c if x.get("hoaMonthly") is not None),
                  "hoa_fields_missing": sum(1 for x in c if x.get("hoaMonthly") is None), "keys": sorted(c[0].keys())})
    return r
out["all"] = agg(cards, sub)
out["detached"] = agg([c for c in cards if not c.get("subdivision", "").startswith("Berwick")], "detached")
out["berwick"] = agg([c for c in cards if c.get("subdivision", "").startswith("Berwick")], "berwick")
fee = {}
for t in [0] + list(range(25, 1001, 25)):
    fee[t] = len(get("map", {"subdivision": sub, "hoaMax": t})["pins"])
    if fee[t] == len(mls): break
out["fee_at_or_under"] = fee; out["listing_says_no_hoa"] = len(get("map", {"subdivision": sub, "hoa": "0"})["pins"])
json.dump(out, open(os.path.join(D, "listings.json"), "w"), indent=1); print(json.dumps(out, indent=0)[:3500])
