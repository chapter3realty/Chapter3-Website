"""Findings for /submarkets/north-myrtle-beach/briarcliffe-acres/, from the county cache (pull_county.py) and the county deed index.
Inputs: RAW/county.json; SALES = Horry County deeds recorded 2025-11-01 to 2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json, AcclaimWeb DEED (001)); GEO = Blog-Brain tools/geo/grand-strand-v2.json (Census TIGER coastline).
Town = parcels whose inside point is in the county's BRIARCLIFFE municipal boundary (layer 31). House = a single-family parcel (land use 101/102) with a county building value over $0.
Size = the largest county 'Residential' footprint (layer 27, Structures 2023) on the lot: roof outline with garage, not heated living area. Pool = an 'Pool Inground' footprint (1870) on the lot.
Tax status: assessed / taxable = 0.04 is the owner's legal-residence ratio; 0.06 every other home. Flood: FEMA zone at the lot's inside point (layer 19) and whether the house outline touches a high-risk (SFHA) zone.
Oceanfront = a lot within 30 m of the TIGER coastline. Lake lot = a lot within 15 m of one of the three 'BRIARCLIFFE ACRES-PARK; LAKE' parcels.
A sale = a deed on a town parcel with stated consideration over $10,000; a deed covering several parcels is dropped.
Writes findings.json: counts, medians and ranges only; no PIN, owner, address or deed book and page.
Run: RAW=<scratch> SALES=<deeds-co.json> GEO=<grand-strand-v2.json> python3 -I analyze.py <this dir>"""
import json, os, sys, math, statistics as st, collections, datetime
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union
from shapely.strtree import STRtree
D = sys.argv[1]; C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
P, G = C["parcels"], C["geo"]
A = {str(int(float(k))).zfill(11): v for k, v in C["addresses"].items()}
K = 111320 * math.cos(math.radians(33.79)); SQFT = K * 111320 * 10.7639
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
def dec(flat, scale, ox, oy):
    pts, x, y = [], flat[0], flat[1]; pts.append((x / scale + ox, y / scale + oy))
    for i in range(2, len(flat), 2): x += flat[i]; y += flat[i + 1]; pts.append((x / scale + ox, y / scale + oy))
    return pts
geo = json.load(open(os.environ["GEO"])); coast = LineString(dec(geo["region"]["coast"], 10000, -80, 33))
town = poly([t for t in G["towns"] if t["attributes"]["NAME"] == "BRIARCLIFFE"][0]["geometry"]["rings"])
cb = coast.intersection(town.buffer(0.01))
fps = [(f["attributes"]["FTR_CODE"], poly(f["geometry"]["rings"])) for f in G["footprints"]]; tree = STRtree([g for c, g in fps])
flood = [(f["attributes"]["FLD_ZONE"], f["attributes"]["SFHA_TF"], poly(f["geometry"]["rings"])) for f in G["flood"]]
zon = [(z["attributes"]["ZoningCode"], poly(z["geometry"]["rings"])) for z in G["zoning"]]
lakes = [poly(p["rings"]) for p in P.values() if "LAKE" in (p["LegalDescr"] or "") and p["LandUseCode"] == "600"]
lots = []
for pin, a in P.items():
    g = poly(a["rings"]); c = g.representative_point(); house = pool = 0; hfp = None
    for i in tree.query(g):
        code, f = fps[i]
        if not g.contains(f.representative_point()): continue
        if code == 1800 and f.area * SQFT > house: house = f.area * SQFT; hfp = f
        elif code == 1870: pool += 1
    zone = next((z for z, t, p in flood if p.contains(c)), "outside mapped zones (X)")
    street = (A.get(pin) or [{}])[0].get("street")
    lots.append({"pin": pin, "sub": a["MarketSubArea"], "street": street, "use": a["LandUseCode"], "imp": a["MarketImprv"] or 0, "value": a["MarketProp"] or 0, "land": a["MarketLand"] or 0,
                 "lot": a["lotSqft"], "house": house, "pool": pool > 0, "zone": zone,
                 "house_in_sfha": bool(hfp is not None and any(t == "T" and p.intersects(hfp) for z, t, p in flood)),
                 "lot_touches_sfha": any(t == "T" and p.intersects(g) for z, t, p in flood),
                 "ratio": round((a["AssessedProp"] or 0) / a["TaxableProp"], 3) if a["TaxableProp"] else None,
                 "ocean": g.distance(coast) * K < 30, "ocean_dist": g.distance(coast) * K, "lake": any(g.distance(l) * K < 15 for l in lakes),
                 "zoning": next((z for z, p in zon if p.contains(c)), None), "state": a["OwnerState"], "x": c.x, "y": c.y})
def q(v): v = sorted(v); return {"n": len(v), "min": v[0], "q1": st.quantiles(v, n=4)[0], "median": st.median(v), "q3": st.quantiles(v, n=4)[2], "max": v[-1]} if len(v) > 1 else {"n": len(v)}
H = [l for l in lots if l["imp"] > 0 and l["use"] in ("101", "102") and l["sub"] == "BCA"]
V = [l for l in lots if l["imp"] == 0 and l["use"] in ("100", "101") and l["sub"] == "BCA"]
def part(L): return {"houses": len(L), "pools": sum(l["pool"] for l in L), "lot_sqft": q([l["lot"] for l in L]) if L else {}, "footprint": q([round(l["house"]) for l in L if l["house"]]) if len(L) > 1 else {},
                     "county_value": q([l["value"] for l in L]) if len(L) > 1 else {}, "legal_residence_4pct": sum(1 for l in L if l["ratio"] and abs(l["ratio"] - .04) < .003), "six_pct": sum(1 for l in L if l["ratio"] and abs(l["ratio"] - .06) < .003)}
out_ = {"made": datetime.date.today().isoformat(), "rule": __doc__, "county_read": C["read"],
        "town_parcels": len(lots), "town_acres": round(town.area * K * 111320 * 10.7639 / 43560, 1),
        "town_bounds_lng_lat": list(town.bounds), "land_use": dict(collections.Counter(l["use"] for l in lots)), "sub": dict(collections.Counter(l["sub"] for l in lots)),
        "houses": part(H), "empty_lots": len(V), "empty_lot_sqft": q([l["lot"] for l in V]) if len(V) > 1 else {},
        "oceanfront": part([l for l in H if l["ocean"]]), "not_oceanfront": part([l for l in H if not l["ocean"]]), "lake": part([l for l in H if l["lake"]]),
        "ocean_dist_m": q([round(l["ocean_dist"]) for l in H]),
        "houses_within_400m_of_ocean": sum(1 for l in H if l["ocean_dist"] < 400), "houses_within_800m_of_ocean": sum(1 for l in H if l["ocean_dist"] < 800),
        "flood_zone_at_lot_center": dict(collections.Counter(l["zone"] for l in H)), "house_outline_touches_high_risk": sum(l["house_in_sfha"] for l in H),
        "oceanfront_house_outline_touches_high_risk": sum(l["house_in_sfha"] for l in H if l["ocean"]),
        "oceanfront_flood_zone_at_lot_center": dict(collections.Counter(l["zone"] for l in H if l["ocean"])),
        "owner_mailing_out_of_state": sum(1 for l in H if l["state"] not in ("SC", None)), "zoning_of_houses": dict(collections.Counter(l["zoning"] for l in H)),
        "streets_houses_and_lots": dict(collections.Counter(l["street"] for l in lots if l["sub"] == "BCA").most_common())}
deeds = json.load(open(os.environ["SALES"])); byp = {l["pin"]: l for l in lots}; multi = collections.Counter(d["BookPage"] for d in deeds["deeds"])
sales = []
for d in deeds["deeds"]:
    l = byp.get(d["ParcelNumber"])
    if not l or (d["Consideration"] or 0) <= 10000 or multi[d["BookPage"]] > 1: continue
    sales.append({"month": d["RecordDate"][:7], "price": d["Consideration"], "house": l["imp"] > 0 and l["use"] in ("101", "102"), "ocean": l["ocean"], "lake": l["lake"], "sub": l["sub"], "pool": l["pool"]})
def ssum(S): return {"count": len(S), "prices": q([s["price"] for s in S]) if len(S) > 1 else ({"n": 1, "median": S[0]["price"]} if S else {}), "by_month": dict(sorted(collections.Counter(s["month"] for s in S).items()))}
hs = [s for s in sales if s["house"] and s["sub"] == "BCA"]
out_["sales_window"] = [deeds["from"], deeds["to"]]
out_["sales"] = {"all_town": ssum(sales), "houses": ssum(hs), "oceanfront_houses": ssum([s for s in hs if s["ocean"]]), "not_oceanfront_houses": ssum([s for s in hs if not s["ocean"]]), "pool_houses": ssum([s for s in hs if s["pool"]]), "lots": ssum([s for s in sales if not s["house"]])}
out_["center"] = [round(st.mean(l["y"] for l in H), 5), round(st.mean(l["x"] for l in H), 5)]
json.dump(out_, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump([{k: l[k] for k in ("x", "y", "ocean", "lake", "pool")} | {"house": l["imp"] > 0} for l in lots], open(os.path.join(os.environ["RAW"], "lot-points.json"), "w"))
print(json.dumps({k: v for k, v in out_.items() if k != "rule"}, indent=0)[:6500])
