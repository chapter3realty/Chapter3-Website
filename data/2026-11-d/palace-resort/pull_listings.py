"""The Palace (1605 S Ocean Blvd, Myrtle Beach): condos for sale now, in aggregate, from the site's public map API
(https://chapter3realty.com/homes/api/map, CCMLS active listings through the CRM) and the public listing card (/homes/api/lookup).
Same building words as /invest/condo-buildings/ ("Palace", type=condo). A listing counts only if its address is 1605 S Ocean Blvd (however the listing spells it).
- Monthly HOA fee: for each threshold T (0, 25, 50 ... 1500) the call hoaMax=T returns the listings whose fee is T or less.
  Each listing's fee is then known to a $25 bracket. Only medians and ranges per bedroom group are saved.
- Flags: has=<key> counts (agent-ticked MLS fields and description words, as the CRM reads them).
- Cards: year built, size, bedrooms, flood zone field. Only ranges, medians and counts are saved.
Never saved: an MLS number, a unit number, a single listing's price or fee, a firm, a photo or a remark.
Calls are spaced 2.1 s. Run: python3 -I pull_listings.py <this dir>. Writes listings.json."""
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
            calls.append(url if path == "map" else BASE + path + "?mls=<listing>"); time.sleep(2.1); return j  # no MLS number is kept
        except Exception:
            time.sleep(10 + 10 * i)
    raise SystemExit("failed " + url)
P = {"type": "condo", "subdivision": "Palace"}
import re
AT = re.compile(r"^1605 (S OCEAN BLVD|OCEAN BLVD S)\b")  # "1605 S Ocean Blvd", "1605 South Ocean Blvd.", "1605 Ocean Blvd. S"
def at1605(a): return bool(AT.match(re.sub(r"\bSOUTH\b", "S", (a or "").upper().replace(".", ""))))
def ours(pins): return {x["mls"]: x for x in pins if at1605(x.get("addr"))}
j = get("map", P); pins = ours(j["pins"])
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "refreshedAt": j["meta"]["refreshedAt"], "source": j["meta"]["source"],
       "rule": __doc__, "api_total": j["total"], "at_1605": len(pins)}
beds = collections.Counter(x.get("beds") for x in pins.values())
out["beds"] = {str(k): v for k, v in sorted(beds.items(), key=lambda t: (t[0] is None, t[0]))}
def price(x): return int(x["price"].replace("$", "").replace(",", ""))
out["asking"] = {"all": {"median": st.median(price(x) for x in pins.values()), "min": min(price(x) for x in pins.values()), "max": max(price(x) for x in pins.values())}}
for b in sorted(set(beds)):
    pr = [price(x) for x in pins.values() if x.get("beds") == b]; sq = [x["sqft"] for x in pins.values() if x.get("beds") == b and x.get("sqft")]
    out["asking"][str(b)] = {"n": len(pr), "median": st.median(pr), "min": min(pr), "max": max(pr), "sqft_median": st.median(sq) if sq else None, "sqft_range": [min(sq), max(sq)] if sq else None}
# fee brackets
bracket = {}
for t in range(0, 1501, 25):
    got = ours(get("map", dict(P, hoaMax=t))["pins"])
    for m in got:
        if m in pins and m not in bracket: bracket[m] = t
    if len(bracket) == len(pins): break
fee = {"bracket_rule": "fee is at or under T and over T-25 (T=0: blank or zero)", "no_bracket": len(pins) - len(bracket)}
def summ(vals):
    vals = sorted(vals)
    return {"n": len(vals), "median_at_or_under": st.median(vals) if vals else None, "lowest_at_or_under": vals[0] if vals else None, "highest_at_or_under": vals[-1] if vals else None,
            "middle_half": [st.quantiles(vals, n=4)[0], st.quantiles(vals, n=4)[2]] if len(vals) >= 8 else None}
fee["all"] = summ([v for v in bracket.values() if v > 0]); fee["zero_or_blank"] = sum(1 for v in bracket.values() if v == 0)
for b in sorted(set(beds)):
    fee[str(b)] = summ([v for m, v in bracket.items() if pins[m].get("beds") == b and v > 0])
out["fee"] = fee
FLAGS = ["str_allowed", "rentals_allowed", "long_term_rental_allowed", "vacation_rental_program", "has_rental_income", "furnished", "pets_allowed",
         "oceanfront_unit", "ocean_view", "oceanfront_building", "high_floor_unit", "low_floor_unit", "top_floor", "balcony", "parking_garage", "covered_parking",
         "indoor_pool", "sauna", "elevator_building", "flood_zone", "hoa_includes_trash", "hoa_includes_utilities", "hoa_includes_water_sewer",
         "hoa_includes_insurance", "hoa_includes_internet", "hoa_includes_pest", "hoa_includes_cable", "hoa_includes_electric", "security_service"]
out["flags"] = {}
for f in FLAGS:
    got = ours(get("map", dict(P, has=f))["pins"])
    out["flags"][f] = len(set(got) & set(pins))
cards = [get("lookup", {"mls": m}).get("facts") or {} for m in sorted(pins)]
yb = collections.Counter(c.get("yearBuilt") for c in cards)
out["year_built"] = {str(k): v for k, v in yb.most_common()}
out["flood_zone_field"] = {str(k): v for k, v in collections.Counter(c.get("floodZone") for c in cards).most_common()}
out["subdivision_field"] = {str(k): v for k, v in collections.Counter(c.get("subdivision") for c in cards).most_common()}
out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("calls", "rule")}, indent=1))
