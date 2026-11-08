"""Every derived number for /buyers/homes-near-the-beach/. Run: RAW=<scratch> python3 -I analyze.py <datadir>
Inputs:
  coast.geojson                      ocean shoreline (build_coast.py, TIGER 2024)
  RAW/parcels.json, RAW/fema.json    county house parcels and FEMA zones in the coastal strip (fetch_county.py)
  RAW/towns.json                     county municipal limits (fetch_county.py)
  RAW/landuse.json                   land use code for each deed PIN (fetch_landuse.py)
  SALES = data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (12 months of Horry County deeds, reused)
  RAW/pins.json                      houses for sale, CRM map API (pull_listings.py)
  raw/scdes-access-points.json       SCDES public beach access points (pull_access.py)
Distance: straight line from the point to the nearest point of the ocean shoreline, in miles (local flat projection
at 33.65 N; error well under 1 percent here). House = county land use 100, 101, 102, 110 or 126 (deeds: also not a condo
or HPR unit). Writes findings.json (aggregates only: no address, PIN or MLS number)."""
import json, os, sys, math, statistics as st, collections
from shapely.geometry import shape, Point, LineString
from shapely.strtree import STRtree
from shapely.ops import transform
RAW = os.environ["RAW"]; D = sys.argv[1]
SALES = os.environ.get("SALES", os.path.join(D, "../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))
C = math.cos(math.radians(33.65))
def P(lon, lat): return ((lon + 79.0) * 69.17 * C, (lat - 33.65) * 69.0)
coast_ll = shape(json.load(open(D + "/coast.geojson"))["features"][0]["geometry"])
coast = transform(lambda x, y, z=None: P(x, y), coast_ll)
def dist(lon, lat): return coast.distance(Point(*P(lon, lat)))
def along(lon, lat): return coast.project(Point(*P(lon, lat)))   # miles along the shore from the south end
BANDS = [(0, .25, "under 1/4 mile"), (.25, .5, "1/4 to 1/2 mile"), (.5, 1, "1/2 to 1 mile"), (1, 2, "1 to 2 miles"), (2, 5, "2 to 5 miles"), (5, 10, "5 to 10 miles"), (10, 99, "10 miles or more")]
def band(d):
    for a, b, n in BANDS:
        if a <= d < b: return n
def med(v): return round(st.median(v)) if v else None
def r5(v): return None if v is None else int(round(v / 5000.0) * 5000)
# Stretches of shore, by distance along the coastline from its south end (lat 33.30). Cut points are measured below
# from named places (printed in findings.json "stretch_cuts").
LAND = {"Cherry Grove pier": (-78.6343, 33.8297), "NMB Main Street": (-78.6797, 33.8160), "Briarcliffe Acres": (-78.7350, 33.7880),
        "Myrtle Beach State Park": (-78.9050, 33.6460), "Surfside Pier": (-78.9675, 33.6057), "Surfside Beach north edge (Ocean Lakes line)": (-78.9530, 33.6170), "Garden City Pier": (-78.9989, 33.5795),
        "Murrells Inlet jetty (Garden City end)": (-79.0230, 33.5420), "Huntington Beach State Park": (-79.0600, 33.5050), "Pawleys Island pier": (-79.1215, 33.4275)}
cuts = {k: round(along(*v), 2) for k, v in LAND.items()}
STRETCH = [("North Myrtle Beach and Cherry Grove", cuts["Briarcliffe Acres"], 999), ("Myrtle Beach", cuts["Surfside Beach north edge (Ocean Lakes line)"], cuts["Briarcliffe Acres"]),
           ("Surfside Beach, Garden City and Murrells Inlet", cuts["Murrells Inlet jetty (Garden City end)"], cuts["Surfside Beach north edge (Ocean Lakes line)"]),
           ("Litchfield and Pawleys Island (Georgetown County)", -1, cuts["Murrells Inlet jetty (Garden City end)"])]
def stretch(lon, lat):
    a = along(lon, lat)
    for n, lo, hi in STRETCH:
        if lo <= a < hi: return n
out = {"method": __doc__.split("Distance:")[1].strip(), "stretch_cuts_miles_from_south_end": cuts, "shore_miles_in_line": round(coast.length, 1)}
# ---- 1. County house stock by band, and FEMA zone by band (Horry County only) ----
par = json.load(open(os.path.join(RAW, "parcels.json")))
fz = json.load(open(os.path.join(RAW, "fema.json")))
polys, zones = [], []
for f in fz:
    rings = f["geometry"]["rings"]
    try:
        g = shape({"type": "Polygon", "coordinates": rings}).buffer(0)
    except Exception: continue
    polys.append(g); zones.append(f["attributes"]["FLD_ZONE"])
tree = STRtree(polys)
def zone(lon, lat):
    p = Point(lon, lat); z = [zones[i] for i in tree.query(p) if polys[i].contains(p)]
    if not z: return None
    for k in ("VE", "AE", "A", "AO", "AH"):
        if k in z: return k
    return z[0]
stock = collections.defaultdict(lambda: collections.Counter())
stock_zone_by_stretch = collections.defaultdict(lambda: collections.Counter())
pts_near = []
for x in par:
    d = dist(x["x"], x["y"]); b = band(d)
    z = zone(x["x"], x["y"]) if d < 2 else "not checked"
    zz = "VE" if z == "VE" else ("A or AE" if z in ("A", "AE", "AO", "AH") else ("X or none" if z != "not checked" else z))
    stock[b]["houses"] += 1; stock[b][zz] += 1
    if d < .5: stock_zone_by_stretch[stretch(x["x"], x["y"])][zz] += 1; stock_zone_by_stretch[stretch(x["x"], x["y"])]["houses"] += 1; pts_near.append((x["x"], x["y"]))
out["stock"] = {"note": "Horry County house parcels with a building in a strip about 3.5 miles wide; the 5 to 10 and 10+ bands are partial (strip edge)",
                "county_houses_total": json.load(open(os.path.join(RAW, "county-house-count.json")))["count"],
                "by_band": {n: dict(stock[n]) for _, _, n in BANDS if n in stock},
                "within_half_mile_by_stretch": {k: dict(v) for k, v in stock_zone_by_stretch.items()}}
for n, v in out["stock"]["by_band"].items():
    if v.get("houses") and n in ("under 1/4 mile", "1/4 to 1/2 mile", "1/2 to 1 mile", "1 to 2 miles"):
        v["pct_high_risk"] = round(100 * (v.get("VE", 0) + v.get("A or AE", 0)) / v["houses"], 1); v["pct_VE"] = round(100 * v.get("VE", 0) / v["houses"], 1)
# zone by finer distance for the "how close can you get" line (0.05-mile steps to 1 mile)
fine = collections.defaultdict(lambda: [0, 0])
for x in par:
    d = dist(x["x"], x["y"])
    if d < 1:
        z = zone(x["x"], x["y"]); k = round(int(d / .05) * .05, 2)
        fine[k][0] += 1; fine[k][1] += 1 if z in ("VE", "A", "AE", "AO", "AH") else 0
out["stock"]["high_risk_by_twentieth_mile"] = {str(k): {"houses": v[0], "pct_high_risk": round(100 * v[1] / v[0], 1)} for k, v in sorted(fine.items())}
# ---- 2. Deed sales: house sales by band and by stretch ----
S = json.load(open(SALES))["sales"]; LU = json.load(open(os.path.join(RAW, "landuse.json")))
HOUSE = {"100", "101", "102", "110", "126"}
hs = []
for x in S:
    lu = str(LU.get(str(x["pin"]).zfill(11), "")).strip()
    if lu not in HOUSE or x["condo"] or "HPR" in (x.get("legal") or "").upper() or x.get("lat") is None: continue
    d = dist(x["lon"], x["lat"]); hs.append({"d": d, "b": band(d), "s": stretch(x["lon"], x["lat"]), "p": x["cons"], "builder": x["builder"], "z": zone(x["lon"], x["lat"]) if d < 2 else None})
def summ(rows):
    v = [r["p"] for r in rows]
    return {"sales": len(v), "median": r5(med(v)), "resales": sum(1 for r in rows if not r["builder"]), "median_resale": r5(med([r["p"] for r in rows if not r["builder"]]))}
out["deeds"] = {"source": "Horry County deeds recorded 2025-10-01 to 2026-09-30 (13,194 kept home sales, batch 2026-10-d), houses only", "house_sales_with_point": len(hs),
                "by_band": {n: summ([r for r in hs if r["b"] == n]) for _, _, n in BANDS},
                "by_stretch": {}}
GROUPS = [("within 1/2 mile", 0, .5), ("1/2 to 2 miles", .5, 2), ("2 to 5 miles", 2, 5)]
for sname, _, _ in STRETCH:
    rows = [r for r in hs if r["s"] == sname]
    out["deeds"]["by_stretch"][sname] = {g: summ([r for r in rows if a <= r["d"] < b]) for g, a, b in GROUPS}
    near = out["deeds"]["by_stretch"][sname]["within 1/2 mile"]["median"]; far = out["deeds"]["by_stretch"][sname]["2 to 5 miles"]["median"]
    if near and far: out["deeds"]["by_stretch"][sname]["ratio_near_to_2_5"] = round(near / far, 2)
nr = [r for r in hs if r["d"] < .5]; fr = [r for r in hs if 2 <= r["d"] < 5]
out["deeds"]["all_near_vs_2_5"] = {"near": summ(nr), "two_to_five": summ(fr)}
out["deeds"]["share_of_house_sales_within_half_mile_pct"] = round(100 * len(nr) / len(hs), 1)
out["deeds"]["near_sales_under"] = {str(t): sum(1 for r in nr if r["p"] < t) for t in (300000, 400000, 500000, 750000, 1000000)}
out["deeds"]["near_sales_under_400k_by_stretch"] = dict(collections.Counter(r["s"] for r in nr if r["p"] < 400000))
out["deeds"]["near_sales_by_stretch_zone"] = {s: dict(collections.Counter(("high risk" if r["z"] in ("VE", "A", "AE", "AO", "AH") else "low or moderate") for r in nr if r["s"] == s)) for s, _, _ in STRETCH}
# ---- 3. Listings: houses for sale by band and by town ----
L = json.load(open(os.path.join(RAW, "pins.json"))); pins = L["pins"]; sets = {k: set(v["mls"]) for k, v in L["sets"].items()}
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
rows = []
for m, x in pins.items():
    if x.get("lat") is None or x.get("lng") is None: continue
    if ", SC" not in (x.get("addr") or ""): continue
    pr = num(x.get("price")); sq = num(x.get("sqft"))
    town = (x.get("addr") or "").split(",")[-3].strip() if (x.get("addr") or "").count(",") >= 3 else None
    d = dist(x["lng"], x["lat"])
    rows.append({"m": m, "d": d, "b": band(d), "p": pr, "sq": sq, "ppsf": pr / sq if pr and sq and sq > 300 else None, "town": town, "s": stretch(x["lng"], x["lat"])})
def lsum(rs):
    return {"listings": len(rs), "median_ask": r5(med([r["p"] for r in rs if r["p"]])), "median_sqft": None if not rs else int(round(st.median([r["sq"] for r in rs if r["sq"]] or [0]) / 50) * 50),
            "median_ask_per_sqft": med([r["ppsf"] for r in rs if r["ppsf"]]), "no_hoa": sum(1 for r in rs if r["m"] in sets["no_hoa"]),
            "under_400k": sum(1 for r in rs if r["p"] and r["p"] < 400000), "under_500k": sum(1 for r in rs if r["p"] and r["p"] < 500000)}
out["listings"] = {"pulled": L["pulled"], "api": "https://chapter3realty.com/homes/api/map?type=house (and has= keys)", "set_totals": {k: v["total"] for k, v in L["sets"].items()},
                   "sc_houses_with_point": len(rows), "by_band": {n: lsum([r for r in rows if r["b"] == n]) for _, _, n in BANDS}}
out["listings"]["by_stretch"] = {s: {g: lsum([r for r in rows if r["s"] == s and a <= r["d"] < b]) for g, a, b in GROUPS} for s, _, _ in STRETCH}
tw = collections.Counter(r["town"] for r in rows if r["d"] < .5)
out["listings"]["within_half_mile_by_town"] = {t: lsum([r for r in rows if r["d"] < .5 and r["town"] == t]) for t, n in tw.most_common() if n >= 5}
# what the search keys cover, measured
def cover(k):
    ds = sorted(r["d"] for r in rows if r["m"] in sets[k])
    if not ds: return None
    q = lambda p: round(ds[min(len(ds) - 1, int(p * len(ds)))], 2)
    return {"houses": len(ds), "median_miles": q(.5), "p90_miles": q(.9), "max_miles": round(ds[-1], 2)}
out["listings"]["search_keys_measured"] = {k: cover(k) for k in ["walk_to_beach", "beach_1mi", "near_beach", "east_of_17", "second_row", "water_ocean", "flood_zone"]}
# ---- 4. Public beach access points (SCDES) ----
A = json.load(open(D + "/raw/scdes-access-points.json"))["features"]
apts = [(f["geometry"]["x"], f["geometry"]["y"], f["attributes"]["Beach_Name"]) for f in A if f.get("geometry")]
out["access"] = {"source": "SCDES Beach Access map, layer ACCESS_PTS, Horry and Georgetown counties", "points": len(apts),
                 "by_beach": dict(collections.Counter(a[2] for a in apts).most_common()), "last_update_years": dict(collections.Counter(
                     __import__("datetime").datetime.utcfromtimestamp(f["attributes"]["LAST_UPDATE"] / 1000).year for f in A if f["attributes"].get("LAST_UPDATE")))}
# spacing along the shore by stretch: shore miles / access points
for sname, lo, hi in STRETCH:
    lo2, hi2 = max(lo, 0), min(hi, coast.length)
    n = sum(1 for a in apts if stretch(a[0], a[1]) == sname)
    out["access"].setdefault("by_stretch", {})[sname] = {"points": n, "shore_miles": round(hi2 - lo2, 1), "per_mile": round(n / (hi2 - lo2), 1) if hi2 > lo2 else None}
# straight-line distance from houses within 1/2 mile of the ocean to the nearest public access point
at = STRtree([Point(*P(a[0], a[1])) for a in apts])
dd = []
for lon, lat in pts_near:
    p = Point(*P(lon, lat)); i = at.nearest(p); dd.append(p.distance(at.geometries[i]))
dd.sort()
out["access"]["houses_within_half_mile_to_nearest_access_miles"] = {"houses": len(dd), "median": round(st.median(dd), 2), "pct_within_quarter": round(100 * sum(1 for x in dd if x < .25) / len(dd), 1)}
# ---- 5. Price by quarter mile, for the chart (to 3 miles) ----
def qm(d): return round(int(d / .25) * .25, 2)
out["chart_quarter_mile"] = []
for k in [i * .25 for i in range(12)]:
    dr = [r for r in hs if qm(r["d"]) == k]; lr = [r for r in rows if qm(r["d"]) == k]
    out["chart_quarter_mile"].append({"from_mile": k, "to_mile": k + .25, "house_sales": len(dr), "median_sale": r5(med([r["p"] for r in dr])),
        "listings": len(lr), "median_ask_per_sqft": med([r["ppsf"] for r in lr if r["ppsf"]]), "median_sqft": None if not lr else int(round(st.median([r["sq"] for r in lr if r["sq"]] or [0]) / 50) * 50)})
out["deeds"]["first_tenth_mile"] = summ([r for r in hs if r["d"] < .1]); out["deeds"]["tenth_to_quarter"] = summ([r for r in hs if .1 <= r["d"] < .25])
out["listings"]["first_tenth_mile"] = lsum([r for r in rows if r["d"] < .1]); out["listings"]["tenth_to_quarter"] = lsum([r for r in rows if .1 <= r["d"] < .25])
json.dump(out, open(D + "/findings.json", "w"), indent=1)
print(json.dumps({k: out[k] for k in ("stretch_cuts_miles_from_south_end", "shore_miles_in_line")}, indent=0))
