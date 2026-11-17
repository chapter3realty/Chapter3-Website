"""Riverwalk (Myrtle Beach 29579): homes for sale now, in aggregate, from the site's public map API (https://chapter3realty.com/homes/api/map, CCMLS)
and the listing card (/homes/api/lookup). subdivision=Riverwalk matches two MLS names: RIVERWALK (condos) and "Riverwalk Townhomes at Arrowhead"; the card's subdivision field splits them.
HOA fee: hoaMax=T returns the listings whose fee is T or less, so each fee is known to a $25 bracket (T=0: blank or zero). Flags: has=<key> counts.
Never saved: an MLS number, an address, a single listing's price or fee, a firm, a photo, a remark. Calls spaced 2.1 s. Run: python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, sys, time, statistics as st, urllib.request, urllib.parse, datetime, collections
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/"; UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}; calls = []
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    for i in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); calls.append(url if path == "map" else BASE + path + "?mls=<listing>"); time.sleep(2.1); return j
        except Exception: time.sleep(10 + 10 * i)
    raise SystemExit("failed " + url)
P = {"subdivision": "Riverwalk"}
j = get("map", P); pins = {x["mls"]: x for x in j["pins"]}
cards = {m: (get("lookup", {"mls": m}).get("facts") or {}) for m in sorted(pins)}
def kind(m): return "townhomes" if "TOWNHOMES" in (cards[m].get("subdivision") or "").upper() else "condos"
def price(x): return int(x["price"].replace("$", "").replace(",", ""))
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "refreshedAt": j["meta"]["refreshedAt"], "source": j["meta"]["source"], "rule": __doc__, "api_total": j["total"], "n": len(pins)}
out["subdivision_field"] = dict(collections.Counter(c.get("subdivision") for c in cards.values()))
out["city_zip"] = dict(collections.Counter((c.get("city"), c.get("zip")) for c in cards.values()) and {f"{a}|{b}": v for (a, b), v in collections.Counter((c.get("city"), c.get("zip")) for c in cards.values()).items()})
def summ(ms):
    if not ms: return {"n": 0}
    pr = [price(pins[m]) for m in ms]; sq = [pins[m]["sqft"] for m in ms if pins[m].get("sqft")]
    return {"n": len(ms), "median": st.median(pr), "min": min(pr), "max": max(pr), "sqft_median": st.median(sq) if sq else None, "sqft_range": [min(sq), max(sq)] if sq else None,
            "beds": {str(k): v for k, v in sorted(collections.Counter(pins[m].get("beds") for m in ms).items(), key=lambda t: (t[0] is None, t[0]))},
            "waterfront_tag": sum(1 for m in ms if pins[m].get("tag") == "Waterfront"), "waterfront_field": sum(1 for m in ms if cards[m].get("waterfront")),
            "year_built": dict(collections.Counter(str(cards[m].get("yearBuilt")) for m in ms))}
groups = {"condos": [m for m in pins if kind(m) == "condos"], "townhomes": [m for m in pins if kind(m) == "townhomes"]}
out["groups"] = {k: summ(v) for k, v in groups.items()}
out["condos_by_beds"] = {}
for b in sorted({pins[m].get("beds") for m in groups["condos"]}): out["condos_by_beds"][str(b)] = summ([m for m in groups["condos"] if pins[m].get("beds") == b])
bracket = {}
for t in range(0, 801, 25):
    got = {x["mls"] for x in get("map", dict(P, hoaMax=t))["pins"]}
    for m in got:
        if m in pins and m not in bracket: bracket[m] = t
    if len(bracket) == len(pins): break
def fsum(ms):
    v = sorted(bracket[m] for m in ms if m in bracket and bracket[m] > 0)
    return {"n_with_fee": len(v), "zero_or_blank": sum(1 for m in ms if bracket.get(m) == 0), "no_bracket": sum(1 for m in ms if m not in bracket), "median_at_or_under": st.median(v) if v else None, "lowest_at_or_under": v[0] if v else None, "highest_at_or_under": v[-1] if v else None, "all_brackets": dict(collections.Counter(v))}
out["fee"] = {"rule": "fee is at or under T and over T-25 (T=0: blank or zero)", "condos": fsum(groups["condos"]), "townhomes": fsum(groups["townhomes"])}
out["fee_by_beds"] = {str(b): fsum([m for m in groups["condos"] if pins[m].get("beds") == b]) for b in sorted({pins[m].get("beds") for m in groups["condos"]})}
FLAGS = ["rentals_allowed", "long_term_rental_allowed", "str_allowed", "has_rental_income", "pets_allowed", "community_pool", "outdoor_pool", "clubhouse", "tennis", "golf_view", "on_golf_course", "icw_view", "water_view", "water_icw", "marsh_view", "waterfront_community", "balcony", "elevator", "elevator_building", "upper_floor_unit", "low_floor_unit", "first_floor_or_elevator", "in_unit_laundry", "furnished", "fha_accepted", "va_accepted", "conventional_accepted", "cash_only_listing", "hoa_includes_trash", "hoa_includes_water_sewer", "hoa_includes_insurance", "hoa_includes_internet", "hoa_includes_cable", "hoa_includes_electric", "hoa_includes_utilities", "hoa_includes_pest", "lawn_care_included", "security_service", "gated", "outside_city_limits", "beach_5mi", "near_beach"]
out["flags_all"] = {}
for f in FLAGS:
    out["flags_all"][f] = len({x["mls"] for x in get("map", dict(P, has=f))["pins"]} & set(pins))
out["flood_zone_field"] = {str(k): v for k, v in collections.Counter(c.get("floodZone") for c in cards.values()).items()}
out["stories_field"] = {str(k): v for k, v in collections.Counter(c.get("stories") for c in cards.values()).items()}
out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("calls", "rule")}, indent=1))
