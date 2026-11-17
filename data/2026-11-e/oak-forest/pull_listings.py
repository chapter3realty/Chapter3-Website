"""Homes for sale now in Oak Forest, in aggregate, from the site's public map API (https://chapter3realty.com/homes/api/map, CCMLS active
listings) and the public listing card (/homes/api/lookup). MLS subdivision name: "Oak Forest" (the word search also matched nothing else:
total 3, all pins on Temperance Dr and Morlynn Dr). HOA fee bracket: the site's own filter hoaMax=T. Saved: counts, price median and range,
beds, size, year built, fee brackets. No MLS number, address, firm or photo is saved. Run: python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, os, sys, time, statistics as st, urllib.request, urllib.parse, datetime
D = sys.argv[1]; B = "https://chapter3realty.com/homes/api/"
def get(path, p):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(B + path + "?" + urllib.parse.urlencode(p), headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(3 + 3 * i)
    raise SystemExit("failed")
d = get("map", {"subdivision": "Oak Forest"}); ids = [p["mls"] for p in d["pins"]]
cards = [get("lookup", {"mls": m}).get("facts") or {} for m in ids]
fee = {t: get("map", {"subdivision": "Oak Forest", "hoaMax": t})["total"] for t in (0, 25, 30, 50)}
pr = [c["listPrice"] for c in cards]
out = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "refreshedAt": d["meta"]["refreshedAt"], "rule": __doc__,
       "for_sale": len(ids), "subdivision_names": sorted({c["subdivision"] for c in cards}), "types": sorted({c["type"] for c in cards}),
       "list_price": {"median": st.median(pr), "min": min(pr), "max": max(pr)}, "beds": sorted(c["beds"] for c in cards), "baths": sorted(c["baths"] for c in cards),
       "sqft": sorted(c["sqft"] for c in cards), "year_built": sorted(c["yearBuilt"] for c in cards), "lot_acres": sorted(c["lotAcres"] for c in cards),
       "hoa_monthly_listed": [c["hoaMonthly"] for c in cards], "homes_at_or_under_fee": fee,
       "strips": {k: get("strip", q)["total"] for k, q in {"oak_forest": {"subdivision": "Oak Forest"}, "within_1_mile": {"near": "33.67669,-78.96186", "miles": "1"}, "under_300k_within_2_miles": {"near": "33.67669,-78.96186", "miles": "2", "max": "300000"}}.items()}}
json.dump(out, open(os.path.join(D, "listings.json"), "w"), indent=1); print(json.dumps(out, indent=1))
