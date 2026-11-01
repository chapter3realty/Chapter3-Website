"""Builds every derived number for /buyers/programs/ from the raw files. Run: python3.13 -I build-findings.py <datadir>
Writes findings.json. Inputs: raw/listing-points-450k.json, raw/listings-counts.json, raw/usda-sfh-ineligible-horry.geojson,
raw/horry-county-boundary.geojson, raw/acs-ACSDT1Y2024.B25118.json, raw/acs-ACSDT5Y2024.B25118.json, raw/acs-ACSDT1Y2024.B19013.json."""
import json, sys, math, collections
from shapely.geometry import shape, Point
from shapely.affinity import scale
D = sys.argv[1] if len(sys.argv) > 1 else "."
R = D + "/raw/"
out = {}
CITIES = ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet", "Little River", "Conway", "Longs", "Loris", "Aynor"]
# 1. Listing counts, active for sale, the 9 CRM cities (Garden City returns 0 in the CRM; it is filed under other names)
cnt = json.load(open(R + "listings-counts.json"))
t = collections.defaultdict(dict)
for r in cnt["rows"]:
    if r["city"] in CITIES:
        t[(r["city"], r["type"])]["under" if r["max"] else "all"] = r["total"]
by_type = {}
for ty in ["(all)", "house", "condo", "townhouse", "manufactured"]:
    a = sum(t[(c, ty)]["all"] for c in CITIES); u = sum(t[(c, ty)]["under"] for c in CITIES)
    by_type[ty] = {"all": a, "under_450k": u, "share": round(u / a, 3)}
out["listings_pulled"] = cnt["pulled"]
out["listings_by_type_9_cities"] = by_type
out["houses_by_city"] = {c: {"all": t[(c, "house")]["all"], "under_450k": t[(c, "house")]["under"],
                             "share": round(t[(c, "house")]["under"] / t[(c, "house")]["all"], 3)} for c in CITIES}
# 2. USDA: share of county area and of listings under $450k inside USDA single-family ineligible areas
u = shape(json.load(open(R + "usda-sfh-ineligible-horry.geojson"))["features"][0]["geometry"])
c = shape(json.load(open(R + "horry-county-boundary.geojson"))["features"][0]["geometry"])
k = math.cos(math.radians(33.85))
eq = lambda g: scale(g, xfact=k * 111.32, yfact=110.57, origin=(0, 0))
out["usda_ineligible_share_of_county_area"] = round(eq(u.intersection(c)).area / eq(c).area, 3)
pts = json.load(open(R + "listing-points-450k.json"))
out["points_pulled"] = pts["pulled"]
tally = collections.defaultdict(lambda: collections.Counter())
for m, h in pts["homes"].items():
    if h["lat"] is None: tally[h["type"]]["no_point"] += 1; continue
    p = Point(h["lng"], h["lat"])
    if not c.contains(p): tally[h["type"]]["outside_horry"] += 1; continue
    tally[h["type"]]["usda_eligible" if not u.contains(p) else "usda_ineligible"] += 1
    if h["type"] == "house":
        tally["house_by_city_" + h["city"]]["usda_eligible" if not u.contains(p) else "usda_ineligible"] += 1
out["usda_listing_tally_under_450k"] = {k2: dict(v) for k2, v in sorted(tally.items())}
# 3. ACS: renter households by income, Horry County
def acs(f):
    d = json.load(open(R + f))["response"]["data"]; return dict(zip(d[0], d[1]))
for tag, f in [("acs1_2024", "acs-ACSDT1Y2024.B25118.json"), ("acs5_2020_2024", "acs-ACSDT5Y2024.B25118.json")]:
    a = acs(f); g = lambda i: int(a["B25118_%03dE" % i])
    renters = g(14); under100 = sum(g(i) for i in range(15, 24)); b100_149 = g(24); over150 = g(25)
    owners = g(2)
    out["renters_" + tag] = {"renter_households": renters, "under_100k": under100, "share_under_100k": round(under100 / renters, 3),
                             "100k_to_149k": b100_149, "150k_plus": over150, "share_150k_plus": round(over150 / renters, 3),
                             "owner_households": owners, "renter_share_of_households": round(renters / g(1), 3)}
m = acs("acs-ACSDT1Y2024.B19013.json")
out["median_household_income_acs1_2024"] = {"value": int(m["B19013_001E"]), "moe": int(m["B19013_001M"])}
out["bond_limit_vs_median"] = round(114960 / int(m["B19013_001E"]), 2)
json.dump(out, open(D + "/findings.json", "w"), indent=1)
print(json.dumps(out, indent=1))
