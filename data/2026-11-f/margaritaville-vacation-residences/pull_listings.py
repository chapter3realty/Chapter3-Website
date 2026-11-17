"""Margaritaville Vacation Residences Myrtle Beach (235 Fins Up Circle): condos for sale now, in aggregate, from the site's public map API
(https://chapter3realty.com/homes/api/map, CCMLS active listings) and the listing card (/homes/api/lookup).
A listing counts only if the MLS subdivision is "Margaritaville Vacation Residences Myrtle Beach" and the address is 235 Fins Up Circle.
Fee: the card's hoaMonthly, kept per size as range and median. Flags: has=<key> counts. Medians, ranges and counts only.
Never saved: an MLS number, a unit number, a single listing's price or fee, a firm, a photo or a remark.
Run: python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, sys, time, statistics as st, urllib.request, urllib.parse, datetime, collections
D = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
            calls.append(url if path == "map" else BASE + path + "?mls=<listing>"); time.sleep(2.1); return j
        except Exception:
            time.sleep(10 + 10 * i)
    raise SystemExit("failed " + url)
P = {"subdivision": "Margaritaville Vacation Residences Myrtle Beach"}
def ours(pins): return {x["mls"]: x for x in pins if (x.get("addr") or "").upper().startswith("235 FINS UP")}
j = get("map", P); pins = ours(j["pins"])
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "refreshedAt": j["meta"].get("refreshedAt"), "source": j["meta"]["source"],
       "rule": __doc__, "api_total": j["total"], "at_235_fins_up": len(pins)}
def price(x): return int(x["price"].replace("$", "").replace(",", ""))
beds = collections.Counter(x.get("beds") for x in pins.values())
out["beds"] = {str(k): v for k, v in sorted(beds.items())}
out["asking_all"] = {"median": st.median(price(x) for x in pins.values()), "min": min(price(x) for x in pins.values()), "max": max(price(x) for x in pins.values())}
cards = {m: get("lookup", {"mls": m}).get("facts") or {} for m in sorted(pins)}
out["by_size"] = {}
for b in sorted(set(beds)):
    ms = [m for m in pins if pins[m].get("beds") == b]
    pr = [price(pins[m]) for m in ms]; sq = [pins[m]["sqft"] for m in ms if pins[m].get("sqft")]
    fe = [cards[m]["hoaMonthly"] for m in ms if cards[m].get("hoaMonthly")]
    out["by_size"][str(b)] = {"n": len(ms), "asking_median": st.median(pr), "asking_min": min(pr), "asking_max": max(pr),
        "sqft_range": [min(sq), max(sq)] if sq else None, "sqft_median": st.median(sq) if sq else None,
        "fee_n": len(fe), "fee_range": [min(fe), max(fe)] if fe else None, "fee_median": st.median(fe) if fe else None}
# by sqft band (fee follows size)
fees_all = [c["hoaMonthly"] for c in cards.values() if c.get("hoaMonthly")]
out["fee_all"] = {"n": len(fees_all), "range": [min(fees_all), max(fees_all)] if fees_all else None}
out["fee_by_sqft_pairs_sorted"] = sorted([[pins[m]["sqft"], cards[m].get("hoaMonthly")] for m in pins])  # size and fee only, no id
out["ppsf_range"] = [round(min(price(x)/x["sqft"] for x in pins.values())), round(max(price(x)/x["sqft"] for x in pins.values()))]
out["year_built"] = dict(collections.Counter(str(c.get("yearBuilt")) for c in cards.values()))
out["flood_zone_field"] = dict(collections.Counter(str(c.get("floodZone")) for c in cards.values()))
out["subdivision_field"] = dict(collections.Counter(str(c.get("subdivision")) for c in cards.values()))
out["waterfront_field"] = dict(collections.Counter(str(c.get("waterfront")) for c in cards.values()))
out["newConstruction_field"] = dict(collections.Counter(str(c.get("newConstruction")) for c in cards.values()))
out["type_field"] = dict(collections.Counter(str(c.get("type")) for c in cards.values()))
FLAGS = ["str_allowed", "rentals_allowed", "long_term_rental_allowed", "vacation_rental_program", "has_rental_income", "furnished", "pets_allowed",
         "oceanfront_unit", "ocean_view", "oceanfront_building", "high_floor_unit", "low_floor_unit", "top_floor", "balcony", "parking_garage", "covered_parking",
         "indoor_pool", "sauna", "elevator_building", "flood_zone", "hoa_includes_trash", "hoa_includes_utilities", "hoa_includes_water_sewer",
         "hoa_includes_insurance", "hoa_includes_internet", "hoa_includes_pest", "hoa_includes_cable", "hoa_includes_electric", "security_service", "new_construction"]
out["flags"] = {}
for f in FLAGS:
    got = ours(get("map", dict(P, has=f))["pins"]); out["flags"][f] = len(set(got) & set(pins))
out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("calls", "rule")}, indent=1))
