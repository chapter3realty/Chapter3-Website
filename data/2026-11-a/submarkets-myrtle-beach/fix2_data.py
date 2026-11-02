#!/usr/bin/env python3
"""Fix round 2 (2026-11-02): houses near the city's middle price. Writes house-resales.json (counts and medians only).
1. Deed resales inside the city (the analyze.py rules), split by the county land use of the sold parcel: houses only
   (100, 101, 102, 110, 126, the ledger's house rule) against the rest of the 'not condo' group.
2. The neighborhoods with the most house resales at $350,000 or less, named from the deed legal description
   (phase and section numbers dropped): sales, middle price; houses in their zoning district (parcels): count,
   main-home share, FEMA high-risk share, straight-line miles from the district's houses' center to the coastline
   (tools/geo/grand-strand-v2.json) and to the airport point of ledger row 40.
3. CRM active listings inside the city at $300,000 or less, by type (aggregate).
Run: RAW=<scratch raw> SALES=<out-of-state-buyers.json> COAST=<Blog-Brain>/tools/geo/grand-strand-v2.json python3 -I fix2_data.py"""
import json, os, re, math, statistics, collections
from shapely.geometry import Polygon, Point, LineString
from shapely.ops import unary_union
from shapely.strtree import STRtree
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.environ["RAW"]
def J(n): return json.load(open(os.path.join(RAW, n)))
def esri(rings):
    outer, holes = [], []
    for r in rings:
        a = sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))
        (outer if a < 0 else holes).append(Polygon(r).buffer(0))
    g = unary_union(outer) if outer else Polygon()
    return g.difference(unary_union(holes)) if holes else g
CITY = unary_union([esri(f["geometry"]["rings"]) for f in J("city.json")])
zp = json.load(open(os.path.join(HERE, "zone-pink.json")))
ZONES = [(esri(f["geometry"]["rings"]), (f["attributes"]["ZONING_DIS"] or "").strip()) for f in J("zoning.json")]
zt = STRtree([z[0] for z in ZONES])
def zcode(pt):
    for i in zt.query(pt):
        if ZONES[i][0].contains(pt): return ZONES[i][1]
P = {str(int(p["PIN"])): p for p in J("parcels.json")}
HOUSE = {"100", "101", "102", "110", "126"}
def med(xs): return statistics.median(xs) if xs else None
def qs(xs): return statistics.quantiles(xs, n=4) if len(xs) >= 4 else None
ins = []
for s in json.load(open(os.environ["SALES"]))["sales"]:
    if s.get("lon") is None: continue
    pt = Point(s["lon"], s["lat"])
    if not CITY.contains(pt) or s["condo"] or s["builder"]: continue
    p = P.get(str(int(s["pin"]))) if s.get("pin") else None
    ins.append({"cons": s["cons"], "group": s.get("group") or "", "lu": p["LandUseCode"] if p else None, "z": zcode(pt)})
def lu_kind(lu):
    if lu in HOUSE: return "house"
    if lu == "107": return "condo_land_use_no_hpr"
    if lu in ("108", "135"): return "villa_townhouse"
    if lu == "109": return "land_use_109"
    return "other"
out = {"made": "fix2_data.py", "pulled": "2026-11-02", "resale_not_condo_all": {"n": len(ins), "median": med([x["cons"] for x in ins])}, "by_land_use": {}}
for k in ("house", "condo_land_use_no_hpr", "villa_townhouse", "land_use_109", "other"):
    v = [x["cons"] for x in ins if lu_kind(x["lu"]) == k]
    out["by_land_use"][k] = {"n": len(v), "median": med(v)}
H = [x for x in ins if lu_kind(x["lu"]) == "house"]
hv = [x["cons"] for x in H]; q = qs(hv)
out["houses"] = {"n": len(hv), "median": med(hv), "q1": q[0], "q3": q[2], "at_or_under_350k": sum(v <= 350000 for v in hv)}
def base(g):
    g = g.upper().replace(" AT ", " @ ")
    return re.sub(r"\s*(PH(ASE)?\.?\s*[\dIVX]+[A-Z]?|#\s*\d+|SEC(TION)?\s*[\dA-Z]+|UNIT\s*\d+)\b.*$", "", g).strip()
under = collections.Counter(base(x["group"]) for x in H if x["cons"] <= 350000)
out["under_350k_top_names"] = under.most_common(6)
G = json.load(open(os.environ["COAST"]))["region"]
def dec(flat, sc=1e4):
    o = []; x = y = 0
    for i in range(0, len(flat), 2): x += flat[i]; y += flat[i + 1]; o.append((x / sc - 80, y / sc + 33))
    return o
kx = math.cos(math.radians(33.7)) * 111320; ky = 110540
coast = LineString([(lo * kx, la * ky) for lo, la in dec(G["coast"])])
AIRPORT = (-78.92906, 33.68064)
rows = J("parcel-classes.json")
out["neighborhoods"] = {}
for name, district in (("BENT OAK ESTATES", "BENT OAK ESTATES PUD"), ("MERIDIAN", "ARBOR GLENN PUD"), ("SUMMIT @ MERIDIAN", "ARBOR GLENN PUD")):
    v = [x["cons"] for x in H if base(x["group"]) == name]
    xs = [r for r in rows if r["zcode"] == district and r["kind"] == "house"]
    cx, cy = statistics.mean(r["x"] for r in xs), statistics.mean(r["y"] for r in xs)
    out["neighborhoods"][name] = {"house_resales": len(v), "median": med(v), "district": district, "district_houses": len(xs),
        "district_pct_main_home": round(100 * sum(r["own"] == "4" for r in xs) / len(xs), 1),
        "district_in_high_risk": sum(r["fz"] in ("VE", "AE", "A", "AO") for r in xs),
        "district_nightly_rentals": sorted(set(r["zcls"] for r in xs)),
        "center": [round(cx, 5), round(cy, 5)],
        "miles_to_coastline": round(coast.distance(Point(cx * kx, cy * ky)) / 1609.34, 2),
        "miles_to_airport": round(math.hypot((cx - AIRPORT[0]) * kx, (cy - AIRPORT[1]) * ky) / 1609.34, 2),
        "east_of_airport": cx > AIRPORT[0]}
li = [h for h in J("listings-mb.json")["homes"].values() if h["lat"] and CITY.contains(Point(h["lng"], h["lat"]))]
low = [h for h in li if h["price"] and h["price"] <= 300000]
out["listings_inside_at_or_under_300k"] = {"n": len(low), "by_type": dict(collections.Counter(h["type"] for h in low)), "inside_all": len(li)}
json.dump(out, open(os.path.join(HERE, "house-resales.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
