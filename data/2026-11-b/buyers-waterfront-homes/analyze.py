"""Batch 2026-11-b, /buyers/waterfront-homes/. What each kind of waterfront sold for in Horry County, from deeds.

Inputs (RAW, outside the repo: PINs and outlines):
  oceanfront-pins.json   from oceanfront.py (the first row on the beach)
  sale-parcels.json      outline of every parcel a kept house sale names (fetch_coast.py)
  county-hydro.json      Horry County GIS layer 21 water outlines (batch 2026-11-a's pull, reused)
  nhd-waterbodies.json   USGS NHD lakes, ponds and marsh (fetch_nhd.py)
  flood-sfha.json        FEMA high-risk zones from county layer 19 (fetch_coast.py)
  coast.json             the coastline (fetch_coast.py)
  SALES                  kept home sales, Horry County deeds recorded 2025-10-01 to 2026-09-30 (batch 2026-10-d)

Kinds, each house counted once, in this order:
  ocean      the lot is in the first row on the beach (oceanfront.py)
  ocean_condo  a condo sale whose point (county address) is within 60 m of a condo the CRM lists as in an oceanfront
             building (RAW/listings-water.json, pulled by pull_listings.py): the method of the Myrtle Beach ledger, row 18
  icw        the lot is within 15 m of the Intracoastal Waterway outline (the 2026-11-a rule)
  river      within 15 m of the Waccamaw River outline
  channels   within 15 m of the House Creek outline (the Cherry Grove channels and the marsh edge behind them)
  swamp_or_marsh  within 10 m of a USGS swamp or marsh polygon within 3 km of the coast. NOT USED ON THE PAGE: 33 of its
             48 resales are in Myrtle Beach in zone X, so the group is mostly freshwater swamp, not tidal marsh. Tidal marsh
             prices come from the Garden City (row 13) and Murrells Inlet (row 9) ledgers, which drew the salt marsh.
  lake       within 10 m of a USGS lake or pond (FType 390, 0.001 square km or more; sewage and oxidation ponds left out)
  none       none of these
House = county land use 100, 101, 102, 110 or 126 (the 2026-10-d rule).
Flood zone: the zone under the middle of the lot (VE, an A zone, or neither = outside the high-risk zone).
Writes deeds-findings.json (aggregates only, no PINs or addresses).
Run: RAW=<scratch> python3 -I analyze.py [sales.json]"""
import json, os, sys, math, statistics, collections
from shapely.geometry import Polygon, Point, LineString, shape
from shapely.ops import unary_union
from shapely.strtree import STRtree
RAW = os.environ["RAW"]; HERE = os.path.dirname(os.path.abspath(__file__))
SALES = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json")
J = lambda n: json.load(open(os.path.join(RAW, n)))
lat0 = 33.7; kx = 111320 * math.cos(math.radians(lat0)); ky = 110540
m = lambda c: [(x * kx, y * ky) for x, y in c]
def poly(rings):
    ps = []
    for r in rings:
        try:
            p = Polygon(m(r)).buffer(0)
            if p.area > 0: ps.append(p)
        except Exception: pass
    return unary_union(ps) if ps else None
HOUSE = {"100", "101", "102", "110", "126"}

ocean = J("oceanfront-pins.json")
hyd = collections.defaultdict(list)
for h in J("county-hydro.json"):
    nm = (h["attributes"].get("NAME") or "").strip().upper()
    hyd[nm].append(poly(h["geometry"]["rings"]))
W = {k: unary_union([g for g in hyd[n] if g is not None]) for k, n in (("icw", "INTRACOASTAL WATERWAY"), ("river", "WACCAMAW RIVER"), ("channels", "HOUSE CREEK"))}
cc = J("coast.json")["coordinates"]
while cc[-1][0] < -79.0008: cc.pop()
coast = LineString(m(cc))
nhd = J("nhd-waterbodies.json")["rows"]
lakes, marsh = [], []
for r in nhd:
    a = {k.lower(): v for k, v in r["a"].items()}; nm = (a.get("gnis_name") or "")
    if not r["g"]: continue
    g = poly(r["g"]["rings"])
    if g is None: continue
    if a["ftype"] == 390 and (a.get("areasqkm") or 0) >= 0.001 and not any(w in nm.lower() for w in ("oxidation", "sewage", "lagoon", "treatment")):
        lakes.append(g)
    elif a["ftype"] == 466 and g.distance(coast) <= 3000:
        marsh.append(g)
LT, MT = STRtree(lakes), STRtree(marsh)
fz = [(f["z"], poly(f["g"]["rings"])) for f in J("flood-sfha.json") if f["g"]]
fz = [(z, g) for z, g in fz if g is not None]
FT = STRtree([g for z, g in fz])
def zone(pt):
    hits = [fz[i][0] for i in FT.query(pt) if fz[i][1].contains(pt)]
    if any(z.startswith("V") for z in hits): return "VE"
    if hits: return "A"
    return "X"

par = {}
for r in J("sale-parcels.json"):
    if r["g"]: par[str(int(r["a"]["PIN"]))] = (r["a"]["LandUseCode"], poly(r["g"]["rings"]))
S = json.load(open(SALES))["sales"]

def kind(p, pin):
    if ocean.get(pin) == "house": return "ocean"
    for k in ("icw", "river", "channels"):
        if p.distance(W[k]) <= 15: return k
    if any(marsh[i].distance(p) <= 10 for i in MT.query(p.buffer(10))): return "swamp_or_marsh"
    if any(lakes[i].distance(p) <= 10 for i in LT.query(p.buffer(10))): return "lake"
    return "none"

LW = J("listings-water.json")
obp = [Point(LW["homes"][k]["lng"] * kx, LW["homes"][k]["lat"] * ky) for k in LW["sets"]["condo+oceanfront_building"] if LW["homes"][k].get("lat")]
OB = STRtree(obp)
rows = []
for s in S:
    pin = str(int(float(s["pin"])))
    if s.get("condo"):
        if s.get("lat"):
            q = Point(s["lon"] * kx, s["lat"] * ky)
            if any(obp[i].distance(q) <= 60 for i in OB.query(q.buffer(60))):
                rows.append({"kind": "ocean_condo", "price": s["cons"], "builder": s["builder"], "zone": None, "pt": None,
                             "first_row": ocean.get(pin) == "condo", "place": s.get("place")})
        continue
    if pin not in par: continue
    lu, p = par[pin]
    if lu not in HOUSE or p is None: continue
    k = kind(p, pin)
    c = p.representative_point()
    rows.append({"kind": k, "price": s["cons"], "builder": s["builder"], "zone": zone(c), "pt": (c.x, c.y)})

def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    q = statistics.quantiles(xs, n=4) if len(xs) >= 4 else [None, statistics.median(xs), None]
    return {"n": len(xs), "median": statistics.median(xs), "p25": q[0], "p75": q[2], "min": xs[0], "max": xs[-1]}
out = {"method": __doc__.split("Kinds,")[1].split("Writes")[0].strip(), "deeds": "Horry County Register of Deeds, recorded 2025-10-01 to 2026-09-30 (batch 2026-10-d kept sales)",
       "kinds": {}}
KINDS = ["ocean", "ocean_condo", "icw", "river", "channels", "swamp_or_marsh", "lake", "none"]
for k in KINDS:
    g = [r for r in rows if r["kind"] == k]
    z = collections.Counter(r["zone"] for r in g if r["zone"])
    out["kinds"][k] = {"all": summ([r["price"] for r in g]), "resale": summ([r["price"] for r in g if not r["builder"]]),
                       "builder_sales": sum(r["builder"] for r in g), "zone": dict(z),
                       "zone_pct": {kk: round(100 * v / sum(z.values()), 1) for kk, v in z.items()} if z else {}}
oc = [r for r in rows if r["kind"] == "ocean_condo" and not r["builder"]]
out["kinds"]["ocean_condo"]["resale_by_place"] = {pl: summ([r["price"] for r in oc if r["place"] == pl]) for pl in sorted({r["place"] for r in oc})}
out["kinds"]["ocean_condo"]["resale_also_first_row_parcel"] = sum(r["first_row"] for r in oc)
# each water kind against houses within 1 km of those sales that are on no water (the 2026-11-a comparison)
none_pts = [(Point(r["pt"]), r["price"], r["builder"]) for r in rows if r["kind"] == "none"]
NT = STRtree([p for p, _, _ in none_pts])
for k in ("ocean", "icw", "river", "channels", "swamp_or_marsh", "lake"):
    g = [r for r in rows if r["kind"] == k and not r["builder"]]
    near = set()
    for r in g:
        for i in NT.query(Point(r["pt"]).buffer(1000)):
            if none_pts[i][0].distance(Point(r["pt"])) <= 1000 and not none_pts[i][2]: near.add(i)
    nb = summ([none_pts[i][1] for i in near])
    out["kinds"][k]["nearby_off_water_resale"] = nb
    if nb.get("n") and out["kinds"][k]["resale"].get("n"):
        out["kinds"][k]["ratio_to_nearby"] = round(out["kinds"][k]["resale"]["median"] / nb["median"], 2)
# every house on each water (not only those sold): the flood zone under the middle of the lot
stock = collections.defaultdict(collections.Counter)
VEU = unary_union([g for z, g in fz if z.startswith("V")]); SF = unary_union([g for z, g in fz])
def touch(p, k):
    stock[k]["lots"] += 0
    if p.intersects(VEU): stock[k]["lot_reaches_VE"] += 1
    if p.intersects(SF): stock[k]["lot_reaches_high_risk"] += 1
for r in J("coast-parcels.json"):
    a = r["a"]
    if ocean.get(str(a["PIN"])) == "house" and a["LandUseCode"] in HOUSE and (a["MarketImprv"] or 0) > 0 and r["g"]:
        p = poly(r["g"]["rings"]); stock["ocean"][zone(p.representative_point())] += 1; touch(p, "ocean")
seen = set()
for r in J("water-parcels-2026-11-a.json"):   # batch 2026-11-a pull: parcels within 15 m of the county's tidal and river water
    if r["LandUseCode"] not in HOUSE or not (r.get("MarketImprv") or 0) > 0 or not r.get("g") or r["PIN"] in seen: continue
    seen.add(r["PIN"])
    if ocean.get(str(r["PIN"])): continue
    w = r["water"]
    k = "icw" if "Intracoastal Waterway" in w else ("river" if "Waccamaw River" in w else ("channels" if "HOUSE CREEK" in w else None))
    if not k: continue
    p = poly(r["g"]["rings"]); stock[k][zone(p.representative_point())] += 1; touch(p, k)
def sf(v):
    n = v["X"] + v["A"] + v["VE"]
    return {"houses": n, "zone_at_middle_of_lot": {z: v[z] for z in ("X", "A", "VE")}, "middle_outside_high_risk_pct": round(100 * v["X"] / n, 1),
            "lot_reaches_VE": v["lot_reaches_VE"], "lot_reaches_VE_pct": round(100 * v["lot_reaches_VE"] / n, 1),
            "lot_reaches_high_risk": v["lot_reaches_high_risk"], "lot_wholly_outside_high_risk_pct": round(100 * (n - v["lot_reaches_high_risk"]) / n, 1)}
out["stock_flood"] = {k: sf(v) for k, v in stock.items()}
print("stock", out["stock_flood"])
json.dump(out, open(os.path.join(HERE, "deeds-findings.json"), "w"), indent=1)
for k in KINDS:
    v = out["kinds"][k]
    print(k, "resale", v["resale"], "| all n", v["all"]["n"], "| zone", v["zone_pct"], "| nearby", v.get("nearby_off_water_resale", {}).get("median"), v.get("nearby_off_water_resale", {}).get("n"), v.get("ratio_to_nearby"))
