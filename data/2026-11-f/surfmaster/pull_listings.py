"""Surfmaster (1690 N Waccamaw Dr = MLS SURFMASTER I; 1620 N Waccamaw Dr = MLS SURFMASTER II, Garden City Beach, Murrells Inlet mailing address):
condos for sale now, in aggregate, from https://chapter3realty.com/homes/api/map (subdivision=Surfmaster) and the listing card (/homes/api/lookup).
Kept: counts by building and bedrooms, asking range, size range, HOA fee range, year built, flag counts. Never saved: an MLS number, a unit, one listing's price or fee, a firm, a photo, a remark.
Calls spaced 2.1 s. Run: python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, sys, time, statistics as st, urllib.request, urllib.parse, datetime, collections
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/"; UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def get(path, p):
    url = BASE + path + "?" + urllib.parse.urlencode(p)
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
    calls.append(url if path == "map" else BASE + path + "?mls=<listing>"); time.sleep(2.1); return j
P = {"type": "condo", "subdivision": "Surfmaster"}
j = get("map", P); pins = {x["mls"]: x for x in j["pins"]}
cards = {m: (get("lookup", {"mls": m}).get("facts") or {}) for m in pins}
def price(x): return int(x["price"].replace("$", "").replace(",", ""))
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "refreshedAt": j["meta"]["refreshedAt"], "rule": __doc__, "api_total": j["total"], "pins": len(pins),
       "subdivision_field": dict(collections.Counter(c.get("subdivision") for c in cards.values())),
       "address_street_numbers": dict(collections.Counter(x["addr"].split()[0] for x in pins.values())),
       "town_field": dict(collections.Counter(c.get("city") for c in cards.values())),
       "beds": dict(collections.Counter(str(x["beds"]) for x in pins.values())),
       "asking": {"min": min(map(price, pins.values())), "max": max(map(price, pins.values())), "median": st.median(map(price, pins.values()))},
       "sqft": sorted({x["sqft"] for x in pins.values()}),
       "hoa_monthly_range": [min(c["hoaMonthly"] for c in cards.values()), max(c["hoaMonthly"] for c in cards.values())],
       "year_built": dict(collections.Counter(str(c.get("yearBuilt")) for c in cards.values())),
       "waterfront_field": dict(collections.Counter(str(c.get("waterfront")) for c in cards.values())),
       "flood_zone_field": dict(collections.Counter(str(c.get("floodZone")) for c in cards.values())),
       "by_building": {}}
for sd in sorted({c["subdivision"] for c in cards.values()}):
    ms = [m for m, c in cards.items() if c["subdivision"] == sd]
    out["by_building"][sd] = {"n": len(ms), "beds": [pins[m]["beds"] for m in ms], "asking": [min(price(pins[m]) for m in ms), max(price(pins[m]) for m in ms)],
                              "hoa_range": [min(cards[m]["hoaMonthly"] for m in ms), max(cards[m]["hoaMonthly"] for m in ms)], "year_built": cards[ms[0]]["yearBuilt"], "waterfront": cards[ms[0]]["waterfront"]}
FLAGS = ["str_allowed", "rentals_allowed", "vacation_rental_program", "furnished", "pets_allowed", "oceanfront_unit", "ocean_view", "oceanfront_building", "balcony",
         "covered_parking", "indoor_pool", "elevator_building", "flood_zone", "hoa_includes_trash", "hoa_includes_water_sewer", "hoa_includes_insurance", "hoa_includes_cable", "hoa_includes_internet", "security_service"]
out["flags"] = {f: len({x["mls"] for x in get("map", dict(P, has=f))["pins"]} & set(pins)) for f in FLAGS}
out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1); print(json.dumps({k: v for k, v in out.items() if k not in ("calls", "rule")}, indent=1))
