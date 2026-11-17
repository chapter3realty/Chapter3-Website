"""Findings for /submarkets/pawleys-island/willbrook-plantation/, from the Georgetown County GIS cache (pull_county.py, pull_buildings.py).
Community (the county's own wording): every parcel whose legal description contains WILLBROOK, minus the 9 pieces of the 600-acre Highway 17 tract
(street UNKNOWN). Parts, by legal description: MINGO (Mingo at Willbrook), OAK POINT, ALLSTON POINT, AVIAN FOREST, GREENHAVEN, TRADITION (Tradition Club at Willbrook),
REUNION (Reunion Hall roads and lakes), else WILLBROOK (the main phases and stages). Core = WILLBROOK + OAK POINT + ALLSTON POINT (the part the MLS calls Willbrook Plantation).
House = land-use code Q100 or N100 with a 2024 county building footprint whose centre is inside the parcel. Condo/townhome unit = code Q455 or N455.
Empty lot = Q100/N100/N000 with no building. Lot size = the parcel outline (the table's TotalLandArea is 1.0 on most lots: a placeholder). Size = largest 2024 footprint on the lot (roof outline, not heated area).
Tax status: land-use code first letter Q = legal residence (4 percent), N = other (6 percent), our reading (Pawleys Island ledger row 8).
Last deed = the county's SalePrice and SaleDate on the parcel. A market sale = a last deed of $10,000 or more. Window = 2025-11-01 to 2026-10-31.
Golf lot = parcel within 15 m of the Willbrook Golf Course parcel (owner FOUNDERS NATIONAL GOLF LLC, 193.7 acres, Tidewater Cir). Flood: FEMA zone (county Nature layer 9) at the lot's inside point.
Writes findings.json, map-lots.json: counts, medians, ranges and one rounded point per lot; no TMS, owner, street number or name.
Run: RAW=<scratch> python3 -I analyze.py <this dir>"""
import json, os, sys, math, re, statistics as st, collections, datetime
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
from shapely.strtree import STRtree
D = sys.argv[1]; RAW = os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json"))); BL = json.load(open(os.path.join(RAW, "buildings.json")))
GOLF_TMS = "04-0195B-032-00-00"
KX = 111320 * math.cos(math.radians(33.485)); KY = 111132; ACRE = 4046.86
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
def acres(g): return g.area * KX * KY / ACRE
bt = [(poly(b["geometry"]["rings"]), b["attributes"]) for b in BL]; btree = STRtree([g for g, a in bt])
flood_bfe = [(f["attributes"]["FLD_ZONE"], f["attributes"]["SFHA_TF"], poly(f["geometry"]["rings"]), f["attributes"].get("STATIC_BFE")) for f in C["geo"]["flood"]]
flood = [(f["attributes"]["FLD_ZONE"], f["attributes"]["SFHA_TF"], poly(f["geometry"]["rings"])) for f in C["geo"]["flood"]]
def sec(l):
    l = (l or "").upper()
    for k, pat in (("MINGO", "MINGO"), ("OAK POINT", "OAK POINT|OAK POINTE"), ("AVIAN FOREST", "AVIAN"), ("GREENHAVEN", "GREENHAVEN|GREEN HAVEN"), ("TRADITION", "TRADITION"),
                   ("ALLSTON POINT", "ALLSTON"), ("REUNION", "REUNION")):
        if re.search(pat, l): return k
    return "WILLBROOK"
golf = None; lots = []
for f in C["parcels"]:
    a = f["attributes"]
    if a["TMS"] == GOLF_TMS: pass
for f in C["parcels"]:
    a = f["attributes"]
    if a["StreetName"] == "UNKNOWN": continue
    g = poly(f["geometry"]["rings"]); c = g.representative_point(); code = a["LandUseCode"] or ""
    bigb = [bt[i][0] for i in btree.query(g) if g.contains(bt[i][0].representative_point())]
    fp = max((b.area * KX * KY * 10.7639 for b in bigb), default=0)
    hb = max(bigb, key=lambda b: b.area, default=None)
    sd = datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.UTC).date() if a["SaleDate"] else None
    zone = next((z for z, t, p in flood if p.contains(c)), "X")
    lots.append({"tms": a["TMS"], "part": sec(a["LegalDescription"]), "use": code, "acres": acres(g), "fp": fp, "built": bool(bigb), "x": c.x, "y": c.y, "g": g,
                 "price": a["SalePrice"], "date": sd.isoformat() if sd else None, "zone": zone, "sfha": any(t == "T" and p.contains(c) for z, t, p in flood),
                 "sfha_touch": any(t == "T" and p.intersects(g) for z, t, p in flood), "house_in_sfha": bool(hb is not None and any(t == "T" and p.intersects(hb) for z, t, p in flood)),
                 "bfe": next((bf for z, t, p, bf in flood_bfe if p.contains(c)), None), "state": (a["State"] or "").strip().upper()})
# the golf course parcel: fetched separately (owner kept: a business)
import urllib.request, urllib.parse
u = "https://gis1.georgetowncountysc.org/portal/rest/services/GCGIS_Export/FeatureServer/2/query?" + urllib.parse.urlencode({"where": f"TMS='{GOLF_TMS}'", "outFields": "Owner1,LegalDescription", "returnGeometry": "true", "outSR": 4326, "geometryPrecision": 6, "f": "json"})
gf = json.load(urllib.request.urlopen(u, timeout=90))["features"]
golf = unary_union([poly(f["geometry"]["rings"]) for f in gf]); print("golf", gf[0]["attributes"], round(acres(golf), 1), "acres")
for l in lots: l["golf"] = l["g"].distance(golf) * KX < 15
def isH(l): return l["use"] in ("Q100", "N100") and l["built"]
def q(v):
    v = sorted(v)
    if len(v) < 2: return {"n": len(v), **({"median": v[0]} if v else {})}
    qs = st.quantiles(v, n=4); return {"n": len(v), "min": v[0], "q1": qs[0], "median": st.median(v), "q3": qs[2], "max": v[-1]}
W0, W1 = "2025-11-01", "2026-10-31"
def summ(L):
    H = [l for l in L if isH(l)]
    sales = [l["price"] for l in H if l["date"] and W0 <= l["date"] <= W1 and (l["price"] or 0) >= 10000]
    s3 = [l["price"] for l in H if l["date"] and "2023-11-01" <= l["date"] <= W1 and (l["price"] or 0) >= 10000]
    lotsales = [l["price"] for l in L if l["use"] in ("N000", "Q000") or (l["use"] in ("N100", "Q100") and not l["built"])]
    return {"parcels": len(L), "houses": len(H), "condo_units": sum(1 for l in L if l["use"] in ("Q455", "N455")),
            "empty_lots": sum(1 for l in L if l["use"] in ("Q100", "N100", "N000") and not l["built"]),
            "lot_acres": q([round(l["acres"], 3) for l in H]), "footprint_sqft": q([round(l["fp"]) for l in H if l["fp"]]),
            "legal_residence": sum(1 for l in H if l["use"][0] == "Q"), "golf_lots": sum(1 for l in H if l["golf"]),
            "sfha_center": sum(1 for l in H if l["sfha"]), "sfha_touch": sum(1 for l in H if l["sfha_touch"]), "house_in_sfha": sum(1 for l in H if l["house_in_sfha"]), "bfe_values": dict(collections.Counter(str(l["bfe"]) for l in H if l["sfha"])),
            "flood_zones": dict(collections.Counter(l["zone"] for l in H)), "bill_outside_sc": sum(1 for l in H if l["state"] not in ("SC", "")),
            "sales_12m": q(sales), "sales_3y": q(s3), "last_deed_year": dict(sorted(collections.Counter(l["date"][:4] for l in H if l["date"] and (l["price"] or 0) >= 10000).items()))}
core = [l for l in lots if l["part"] in ("WILLBROOK", "OAK POINT", "ALLSTON POINT")]
out = {"computed": datetime.datetime.now(datetime.UTC).isoformat(), "rule": __doc__, "core": summ(core), "parts": {p: summ([l for l in lots if l["part"] == p]) for p in sorted({l["part"] for l in lots})},
       "all": summ(lots), "golf_acres": round(acres(golf), 1), "golf_tract_total_acres_other_owner": None}
H = [l for l in core if isH(l)]
out["center_core"] = [round(sum(l["y"] for l in H) / len(H), 5), round(sum(l["x"] for l in H) / len(H), 5)]
# highest and lowest core sales without naming the lot
cs = sorted((l["price"], l["date"]) for l in H if l["date"] and W0 <= l["date"] <= W1 and (l["price"] or 0) >= 10000)
out["core_sales_12m_list_prices_only"] = [p for p, d in cs]
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump({"points": [[round(l["x"], 4), round(l["y"], 4), l["part"][0:2], int(isH(l)), int(l["golf"])] for l in lots if l["use"][0] in "QN" and l["use"] not in ("N657",)], "note": "x, y, part, house, golf; no parcel number"}, open(os.path.join(D, "map-lots.json"), "w"))
for k in ("core",): print(json.dumps(out[k], indent=1, default=str))
for p, v in out["parts"].items(): print(p, v["parcels"], v["houses"], v["condo_units"], v["empty_lots"], v["lot_acres"].get("median"), v["sales_12m"], v["golf_lots"])
