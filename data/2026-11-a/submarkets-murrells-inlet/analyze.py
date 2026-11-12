#!/usr/bin/env python3
"""Homes, sales, flood zones, tax use and owners for the Murrells Inlet mailing area, on both sides of the county line.
Run: RAW=<scratch> SALES=<out-of-state-buyers.json> python3 -I analyze.py <datadir>
Writes <datadir>/findings.json (counts and medians only: no names, addresses, parcel numbers or deed book and page)
and RAW/homes.json (one row per home, kept out of the repo) for the map.

Definitions (stated in the ledger):
- The Murrells Inlet mailing area = home parcels whose inside point falls in the ZIP 29576 polygon of Horry County GIS layer 20
  (Zipcodes; the layer covers both counties). Horry parcels inside the 2020 Garden City
  Census place are counted apart as "garden_city" (that page owns them); Georgetown parcels east of US 17 Business and more than
  700 m from it (the Georgetown end of the Garden City beach strip, on the far side of the inlet) are counted apart as "gc_strip".
- Parts. Georgetown: inlet = east of US 17 Business (the creek side; "marsh" flags a parcel within 30 m of an estuarine NWI
  wetland or water polygon); old_road = between US 17 Business and the US 17 bypass; west = west of the US 17 bypass. Horry (outside Garden City): east = east of
  the bypass; west = west of the bypass (the SC 707 side).
- House / condo. Horry: land-use 101 = house; 107 or a horizontal property regime ("HPR") legal = condo; other 1xx = other
  (villas, townhouses, manufactured homes). Georgetown: code ending 100 or 101 with a 2024 county building footprint = house;
  ending 500 = manufactured home ("other"); ending 450 to 456 with a unit word in the legal = condo; else other.
- Legal residence (the 4 percent rate). Horry: AssessedProp / TaxableProp within 0.003 of 0.04. Georgetown: land-use code starts with Q.
- Sales, 12 months to 2026-09-30. Horry: recorded deeds (the 2026-10-d pull; one residential parcel with a building, $10,000 or more).
  Georgetown: the parcel's last recorded sale date in the window and a price of $10,000 or more (a parcel sold twice counts once).
"""
import sys, os, json, statistics, collections, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import Polygon, Point, shape
from shapely.strtree import STRtree
D = sys.argv[1]
WIN = ("2025-10-01", "2026-09-30")
M = 1 / 111000.0

# ---------- water: Georgetown NWI estuarine wetlands and Horry hydrography ----------
wet = [shape(f["geometry"]).buffer(0) for f in J("g-wetlands.geojson")["features"]
       if f["geometry"] and (f["properties"].get("ATTRIBUTE") or "").startswith("E")]
wtree = STRtree(wet)
def on_marsh(poly):
    for i in wtree.query(poly.buffer(30 * M)):
        if wet[i].distance(poly) < 30 * M: return True
    return False

# ---------- FEMA ----------
def fz_rank(z, sub=""):
    if z == "X" and "0.2" in (sub or ""): z = "X shaded"
    return {"VE": 0, "AE": 1, "AO": 2, "A": 3, "X shaded": 4, "X": 5}.get(z, 6), z
gfl = [(shape(f["geometry"]).buffer(0), f["properties"]) for f in J("g-flood.geojson")["features"] if f["geometry"]]
gft = STRtree([g for g, _ in gfl])
hfl = [(shape({"type": "Polygon", "coordinates": f["geometry"]["rings"]}).buffer(0), f["attributes"]) for f in J("h-fema.json") if f.get("geometry")]
hft = STRtree([g for g, _ in hfl])
def fzone(pt, county):
    fl, ft = (gfl, gft) if county == "georgetown" else (hfl, hft)
    best = None
    for i in ft.query(pt):
        g, p = fl[i]
        if not g.contains(pt): continue
        r = fz_rank(p.get("FLD_ZONE"), p.get("ZONE_SUBTY", ""))
        if best is None or r[0] < best[0]: best = (r[0], r[1], p.get("STATIC_BFE"))
    return (best[1], best[2]) if best else ("none", None)

# ---------- schools ----------
def zones_of(name, field):
    return [(shape(f["geometry"]).buffer(0), f["properties"][field]) for f in J(name)["features"] if f["geometry"]]
SCH = {"georgetown": {"elem": zones_of("g-school-elem.geojson", "NAME"), "middle": zones_of("g-school-middle.geojson", "NAME"), "high": zones_of("g-school-high.geojson", "NAME")},
       "horry": {"elem": zones_of("h-school-5.geojson", "school"), "middle": zones_of("h-school-4.geojson", "school"), "high": zones_of("h-school-3.geojson", "school")}}
def school(pt, county, lvl):
    for g, n in SCH[county][lvl]:
        if g.contains(pt): return n
    return None
gtd = [(shape(f["geometry"]).buffer(0), f["properties"]["TaxDist_No"]) for f in J("g-taxdist.geojson")["features"] if f["geometry"]]
def gtax(pt):
    for g, n in gtd:
        if g.contains(pt): return str(n)
    return None
hoods = [(shape(f["geometry"]).buffer(0), f["properties"]["Neighborhood"]) for f in J("g-hoods.geojson")["features"] if f["geometry"]]
def ghood(pt):
    for g, n in hoods:
        if g.contains(pt): return n
    return None

homes = []
# ---------- Horry ----------
hpins = collections.defaultdict(set)
for a in J("h-addr.json"):
    if a.get("PIN"): hpins[int(a["PIN"])].add(a["STREETNAME"])
def hkind(p):
    c = p["LandUseCode"]; legal = p["LegalDescr"] or ""
    if c == "107" or "HPR" in legal: return "condo"
    if c == "101": return "house"
    return "other"
for p in J("h-parcels.json"):
    pin = int(p["PIN"])
    rr = (p.get("g") or {}).get("rings")
    if not rr: continue
    poly = Polygon(rr[0]).buffer(0); pt = poly.representative_point()
    if not HOR.contains(pt) or not Z29576.contains(pt): continue
    part = "garden_city" if GC.contains(pt) else ("east" if east_of(BYP17, pt) else "west")
    ratio = (p["AssessedProp"] / p["TaxableProp"]) if p["TaxableProp"] else None
    fz, bfe = fzone(pt, "horry")
    homes.append({"county": "horry", "part": part, "kind": hkind(p), "x": round(pt.x, 6), "y": round(pt.y, 6), "id": pin,
                  "lr": None if ratio is None else (abs(ratio - 0.04) < 0.003), "state": (p["OwnerState"] or "").strip().upper(),
                  "fz": fz, "bfe": bfe, "taxdist": p["TaxDistrict"], "legal": p["LegalDescr"], "mkt": p["MarketProp"],
                  "elem": school(pt, "horry", "elem"), "middle": school(pt, "horry", "middle"), "high": school(pt, "horry", "high"),
                  "acres": p["Acreage"], "streets": sorted(hpins.get(pin, []))})
# ---------- Georgetown ----------
gz = collections.defaultdict(set)
for f in J("g-addr.geojson")["features"]:
    q = f["properties"]
    if (q.get("Zip_Code") or "") == "29576" and q.get("TMS"): gz[q["TMS"]].add(q.get("St_Full"))
gp = [f for f in J("g-parcels.geojson")["features"] if f["geometry"]]
gpoly = [shape(f["geometry"]).buffer(0) for f in gp]
ptree = STRtree(gpoly)
hasb = collections.Counter()
for b in J("g-bld2024.geojson")["features"]:
    if not b["geometry"] or (b["properties"].get("status") or "") == "demolished": continue
    bp = shape(b["geometry"]).representative_point()
    for i in ptree.query(bp, predicate="within"): hasb[i] += 1
UNITW = ("UNIT", "APT", "VILLA", "#", "BLDG", "HPR")
for i, f in enumerate(gp):
    p = f["properties"]; code = p["LandUseCode"] or ""; legal = p["LegalDescription"] or ""
    poly = gpoly[i]; pt = poly.representative_point()
    if not GEO.contains(pt) or not Z29576.contains(pt): continue
    tail = code[1:]
    if tail in ("100", "101") and hasb[i]: kind = "house"
    elif tail == "500": kind = "other"
    elif tail in ("450", "451", "452", "453", "455", "456") and any(w in legal.upper() for w in UNITW): kind = "condo"
    elif tail in ("450", "451", "452", "453", "455", "456") and hasb[i]: kind = "other"
    else: continue
    eb = east_of(BUS17, pt); dist_bus = m(pt, nearest_points(BUS17, pt)[0])
    if eb and dist_bus > 700: part = "gc_strip"
    elif eb: part = "inlet"
    elif east_of(BYP17, pt): part = "old_road"
    else: part = "west"
    sd = datetime.datetime.fromtimestamp(p["SaleDate"] / 1000, datetime.UTC).date().isoformat() if p["SaleDate"] else None
    fz, bfe = fzone(pt, "georgetown")
    homes.append({"county": "georgetown", "part": part, "kind": kind, "x": round(pt.x, 6), "y": round(pt.y, 6), "id": p["TMS"],
                  "lr": code[:1] == "Q", "state": (p["State"] or "").strip().upper(), "fz": fz, "bfe": bfe, "taxdist": gtax(pt),
                  "legal": legal, "hood": ghood(pt), "sale_date": sd, "price": p["SalePrice"], "in_cdp": MI.contains(pt), "marsh": on_marsh(poly), "zip_addr": p["TMS"] in gz,
                  "elem": school(pt, "georgetown", "elem"), "middle": school(pt, "georgetown", "middle"), "high": school(pt, "georgetown", "high"),
                  "acres": p["TotalLandArea"], "streets": sorted(x for x in gz[p["TMS"]] if x)})
# Horry parcels on the marsh too (for the inlet count on the Horry side): within 30 m of Georgetown NWI estuarine polygons or Horry hydro
hyd = [shape({"type": "Polygon", "coordinates": f["geometry"]["rings"]}).buffer(0) for f in J("h-hydro.json") if f.get("geometry")]
for h in homes:
    if h["county"] == "horry": h["marsh"] = on_marsh(Point(h["x"], h["y"]).buffer(15 * M))
json.dump(homes, open(os.path.join(RAW, "homes.json"), "w"))

# ---------- sales ----------
S = json.load(open(os.environ["SALES"]))
hidx = {h["id"]: h for h in homes if h["county"] == "horry"}
sales = []
for s in S["sales"]:
    h = hidx.get(int(s["pin"]))
    if not h: continue
    if not (WIN[0] <= s["date"].replace("/", "-") <= WIN[1]): continue
    sales.append({"county": "horry", "part": h["part"], "kind": h["kind"], "price": s["cons"], "builder": s["builder"], "where": s["where"], "fz": h["fz"], "legal": h["legal"]})
for h in homes:
    if h["county"] == "georgetown" and h["sale_date"] and WIN[0] <= h["sale_date"] <= WIN[1] and (h["price"] or 0) >= 10000:
        sales.append({"county": "georgetown", "part": h["part"], "kind": h["kind"], "price": h["price"], "builder": None,
                      "where": "SC" if h["state"] == "SC" else ("US" if h["state"] else ""), "fz": h["fz"], "legal": h["legal"], "hood": h.get("hood")})

def pct(a, b): return round(100 * a / b, 1) if b else None
def summ(xs):
    n = len(xs)
    if not n: return {"homes": 0}
    st = collections.Counter(x["state"] for x in xs)
    fzc = collections.Counter(x["fz"] for x in xs)
    return {"homes": n, "legal_residence": sum(bool(x["lr"]) for x in xs), "pct_legal_residence": pct(sum(bool(x["lr"]) for x in xs), n),
            "pct_bill_outside_sc": pct(n - st.get("SC", 0) - st.get("", 0), n), "top_states": st.most_common(6),
            "fema": dict(fzc), "pct_high_risk": pct(sum(fzc[z] for z in ("VE", "AE", "AO", "A")), n), "pct_ve": pct(fzc["VE"], n),
            "taxdist": dict(collections.Counter(x["taxdist"] for x in xs)),
            "elem": dict(collections.Counter(x["elem"] for x in xs)), "middle": dict(collections.Counter(x["middle"] for x in xs)), "high": dict(collections.Counter(x["high"] for x in xs))}
def ss(xs):
    pr = sorted(x["price"] for x in xs)
    if not pr: return {"sales": 0}
    q = statistics.quantiles(pr, n=4) if len(pr) >= 4 else [pr[0], statistics.median(pr), pr[-1]]
    return {"sales": len(pr), "median": statistics.median(pr), "p25": q[0], "p75": q[2], "min": pr[0], "max": pr[-1],
            "builder": sum(bool(x["builder"]) for x in xs), "high_risk_flood": sum(x["fz"] in ("VE", "AE", "AO", "A") for x in xs)}
F = {"made": "analyze.py", "window": WIN, "stock": {}, "sales": {}}
KEYS = [("horry", p) for p in ("west", "east", "garden_city")] + [("georgetown", p) for p in ("inlet", "old_road", "west", "gc_strip")]
for c, p in KEYS + [("horry", "*"), ("georgetown", "*")]:
    for k in ("all", "house", "condo", "other"):
        xs = [h for h in homes if h["county"] == c and (p == "*" or h["part"] == p) and (k == "all" or h["kind"] == k)]
        F["stock"][f"{c}/{p}/{k}"] = summ(xs)
        F["sales"][f"{c}/{p}/{k}"] = ss([s for s in sales if s["county"] == c and (p == "*" or s["part"] == p) and (k == "all" or s["kind"] == k)])
# Both sides, outside Garden City (the page's own area)
core = lambda h: h["part"] not in ("garden_city", "gc_strip")
for k in ("all", "house", "condo", "other"):
    F["stock"][f"core/{k}"] = summ([h for h in homes if core(h) and (k == "all" or h["kind"] == k)])
    F["sales"][f"core/{k}"] = ss([s for s in sales if core(s) and (k == "all" or s["kind"] == k)])
F["cdp_homes_by_part"] = dict(collections.Counter(h["part"] for h in homes if h["county"] == "georgetown" and h.get("in_cdp")))
F["georgetown_outside_cdp"] = dict(collections.Counter(h["part"] for h in homes if h["county"] == "georgetown" and not h.get("in_cdp")))
# Houses that back onto the inlet's marsh (Georgetown, east of US 17 Business, within 30 m of an NWI estuarine polygon), three-year window
W3 = ("2023-10-01", "2026-09-30")
for lab, test in (("marsh", lambda h: h.get("marsh")), ("not_marsh", lambda h: not h.get("marsh"))):
    xs = [h for h in homes if h["county"] == "georgetown" and h["part"] == "inlet" and h["kind"] == "house" and test(h)]
    s3 = [{"price": h["price"], "builder": None, "fz": h["fz"]} for h in xs if h["sale_date"] and W3[0] <= h["sale_date"] <= W3[1] and (h["price"] or 0) >= 10000]
    F["stock"]["georgetown/inlet/house_" + lab] = summ(xs); F["sales"]["georgetown/inlet/house_" + lab + "_3y"] = ss(s3)
for p in ("west", "old_road"):
    xs = [h for h in homes if h["county"] == "georgetown" and h["part"] == p and h["kind"] == "house"]
    F["sales"][f"georgetown/{p}/house_3y"] = ss([{"price": h["price"], "builder": None, "fz": h["fz"]} for h in xs if h["sale_date"] and W3[0] <= h["sale_date"] <= W3[1] and (h["price"] or 0) >= 10000])
F["horry_marsh_houses_outside_gc"] = sum(1 for h in homes if h["county"] == "horry" and h["part"] == "west" and h.get("marsh"))
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
for k in ["core/all", "core/house"] + [f"{c}/{p}/all" for c, p in KEYS] + [f"{c}/{p}/house" for c, p in KEYS] + [f"{c}/{p}/condo" for c, p in KEYS]:
    st, sa = F["stock"][k], F["sales"][k]
    print(k, "homes", st.get("homes"), "lr%", st.get("pct_legal_residence"), "out%", st.get("pct_bill_outside_sc"), "hr%", st.get("pct_high_risk"),
          "| sales", sa.get("sales"), "med", sa.get("median"), sa.get("p25"), sa.get("p75"), "bld", sa.get("builder"))
