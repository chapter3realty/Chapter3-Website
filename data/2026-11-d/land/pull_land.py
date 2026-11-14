"""Land for sale in Horry County and the Pawleys Island area, from the CRM's public map API (active Coastal Carolinas MLS
listings, the same feed as the site's homes pages), counted in aggregate.
Nothing per listing is saved: no address, MLS number, price, firm, photo or point. Each pin's ask, acres and ZIP code are
read in memory only, to sort it into an area and a size band; the file keeps counts, medians and middle-half ranges.
- type=land is the site's "Land" kind of home. has=county_horry / county_georgetown are the CRM's county keys.
- Every pin of each county is read by splitting the price range (min/max) until each call returns fewer than 144 pins
  (the API's most per call); the split total is checked against the unsplit total.
- Areas are groups of ZIP codes (the ZIP is the last 5 digits of the pin's address line, read in memory).
- Flag counts use the listing agent's feature keys (raw/filters.json labels).
Calls are spaced 2.1 s (the CRM allows about 300 searches per 10 minutes).
Run: python3 -I pull_land.py <this folder>. Writes land.json."""
import json, sys, time, re, statistics, urllib.request, urllib.parse, datetime
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
calls = []
def get(p):
    url = BASE + urllib.parse.urlencode(p)
    for _ in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90))
            time.sleep(2.1)
            calls.append({"url": url, "total": j["total"]})
            return j
        except Exception:
            time.sleep(15)
    raise SystemExit("API failed: " + url)
def total(p): return get(p)["total"]

def money(s):
    try: return int(re.sub(r"[^0-9]", "", s or "")) or None
    except ValueError: return None

def all_pins(base, lo=0, hi=50_000_000):
    """Every pin of a search, by splitting the price range. Returns (pins, unsplit total)."""
    n = total(base)
    got = {}
    def walk(a, b):
        j = get(dict(base, min=a, max=b))
        if j["total"] == 0:
            return  # a search with no match returns suggested homes that do not match (2026-11-a README); skip
        if j["total"] < 144 or b - a < 1000:
            for p in j["pins"][: j["total"]]:
                got[p["mls"]] = p
            return
        m = (a + b) // 2
        walk(a, m); walk(m + 1, b)
    walk(lo, hi)
    return list(got.values()), n

AREAS = {  # ZIP groups, north to south / east to west
    "aynor_galivants_ferry": ["29511", "29544"],
    "loris_green_sea_nichols": ["29569", "29545", "29581"],
    "conway": ["29526", "29527", "29528"],
    "longs": ["29568"],
    "little_river": ["29566"],
    "north_myrtle_beach": ["29582"],
    "myrtle_beach_carolina_forest_socastee": ["29572", "29575", "29577", "29579", "29588"],
    "murrells_inlet_garden_city": ["29576"],
    "surfside_beach": ["29575"],
    "pawleys_island": ["29585"],
}
AREAS["myrtle_beach_carolina_forest_socastee"] = ["29572", "29577", "29579", "29588"]
def area_of(z):
    for k, zs in AREAS.items():
        if z in zs: return k
    return "other"

def q(vals, f):
    vals = sorted(vals)
    if not vals: return None
    i = (len(vals) - 1) * f; a = int(i); b = min(a + 1, len(vals) - 1)
    return vals[a] + (vals[b] - vals[a]) * (i - a)
def summ(rows):
    pr = [r["price"] for r in rows if r["price"]]
    ac = [r["acres"] for r in rows if r["acres"]]
    ppa = [r["price"] / r["acres"] for r in rows if r["price"] and r["acres"] and r["acres"] > 0]
    big = [r for r in rows if r["acres"] and r["acres"] >= 1]
    ppa_big = [r["price"] / r["acres"] for r in big if r["price"]]
    return {"listings": len(rows), "with_acres": len(ac),
            "median_ask": q(pr, .5), "ask_p25": q(pr, .25), "ask_p75": q(pr, .75),
            "median_acres": q(ac, .5), "acres_p25": q(ac, .25), "acres_p75": q(ac, .75),
            "median_ask_per_acre": q(ppa, .5), "ppa_p25": q(ppa, .25), "ppa_p75": q(ppa, .75),
            "one_acre_or_more": len(big), "median_ask_per_acre_one_acre_plus": q(ppa_big, .5),
            "ten_acres_or_more": sum(1 for r in rows if r["acres"] and r["acres"] >= 10)}

res = {"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE + "type=land&has=county_..&min=..&max=..",
       "status": "for sale (the API's default)", "note": "listing asks, not sales; each listing agent's acres and flags"}
res["totals"] = {"land_all_feed": total({"type": "land"}),
                 "land_horry": total({"type": "land", "has": "county_horry"}),
                 "land_georgetown": total({"type": "land", "has": "county_georgetown"}),
                 "manufactured_horry": total({"type": "manufactured", "has": "county_horry"}),
                 "house_horry": total({"type": "house", "has": "county_horry"})}
print("totals", res["totals"], flush=True)

rows = []
for county in ["county_horry", "county_georgetown"]:
    pins, n = all_pins({"type": "land", "has": county})
    res.setdefault("split_check", {})[county] = {"unsplit_total": n, "pins_read": len(pins)}
    print(county, n, len(pins), flush=True)
    for p in pins:
        m = re.search(r"(\d{5})\s*$", p.get("addr") or "")
        z = m.group(1) if m else ""
        try: a = float(p.get("acres")) if p.get("acres") not in (None, "") else None
        except ValueError: a = None
        rows.append({"county": county, "zip": z, "price": money(p.get("price")), "acres": a})

res["by_county"] = {c: summ([r for r in rows if r["county"] == c]) for c in ["county_horry", "county_georgetown"]}
H = [r for r in rows if r["county"] == "county_horry"]
res["by_area"] = {}
for k in list(AREAS) + ["other"]:
    rs = [r for r in rows if area_of(r["zip"]) == k]
    res["by_area"][k] = dict(summ(rs), zips=AREAS.get(k, "rest"))
BANDS = [("under_half_acre", 0, .5), ("half_to_1", .5, 1), ("1_to_5", 1, 5), ("5_to_20", 5, 20), ("20_plus", 20, 1e9)]
res["horry_by_size"] = {name: summ([r for r in H if r["acres"] is not None and a <= r["acres"] < b]) for name, a, b in BANDS}
res["horry_no_acres"] = sum(1 for r in H if not r["acres"])
res["by_size_all"] = {name: summ([r for r in rows if r["acres"] is not None and a <= r["acres"] < b]) for name, a, b in BANDS}

FLAGS = ["septic_approved", "septic", "public_water", "public_sewer", "well_water", "mobile_home_allowed",
         "agricultural_zoning", "flood_zone", "wetlands_lot", "wooded_lot", "cleared_lot", "hunting_land", "subdividable",
         "deed_restrictions", "rural", "outside_city_limits", "inside_city_limits", "acreage_lot", "public_road_frontage",
         "state_road_frontage", "county_road", "dirt_road", "private_road", "easement_access", "water_river",
         "creek_on_property", "pond_on_property", "horse_property", "zoned_commercial", "waterfront_lot", "rv_boat_parking"]
res["horry_flags"] = {f: total({"type": "land", "has": "county_horry," + f}) for f in FLAGS}
res["horry_flags"]["no_hoa_fee"] = total({"type": "land", "has": "county_horry", "hoa": 0})
for t in [1, 5, 10, 25, 50, 100]:
    res["horry_flags"][f"lot_{t}_acres_plus"] = total({"type": "land", "has": "county_horry", "lotMin": t})
print("flags", res["horry_flags"], flush=True)
res["calls"] = len(calls)
res["call_log"] = calls
json.dump(res, open(f"{OUT}/land.json", "w"), indent=1)
print(json.dumps({k: v for k, v in res.items() if k != "call_log"}, indent=1))
