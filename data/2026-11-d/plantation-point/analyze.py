"""Findings for /submarkets/myrtle-beach/plantation-point/, from the county cache (pull_county.py) and the county deed index.
Inputs: RAW/county.json; SALES = Horry County deeds recorded 2025-11-01 to 2026-10-31
(data/2026-11-n/buyers-builders/raw/deeds-co.json, AcclaimWeb DEED (001); person names already blanked there).
A sale = a deed on a community parcel with a stated price over $10,000. A deed covering several parcels is dropped.
Houses = parcels with a county building value over $0. Size = the largest county 'Residential' footprint (layer 27,
Structures 2023) on the lot: ground floor plus garage roof outline, not heated living area. Pool = an 'Pool Inground' footprint on the lot.
Tax status: assessed value / taxable value = 0.04 is the 4% legal-residence (owner's full-time home) ratio; 0.06 is every other home.
Flood: the FEMA zone at each lot's inside point (layer 19), and whether any part of the lot touches a high-risk (SFHA) zone.
Waterway lot = within 25 m of the county's Intracoastal Waterway outline (layer 21). Golf lot = within 15 m of the
Myrtlewood course parcel (owner FOUNDERS NATIONAL GOLF LLC, 376.6 acres). The Landing = lots on Landing Rd, Lighthouse Way, Ketch Ct, Shipyard Rd and Plantation Dr (its streets),
plus every parcel whose legal description names The Landing.
Writes findings.json: counts, medians and ranges only; no PIN, owner, address or deed book and page.
Run: RAW=<scratch> SALES=<deeds-co.json> python3 -I analyze.py <this dir>"""
import json, os, sys, math, statistics as st, collections, datetime
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely.strtree import STRtree
D = sys.argv[1]; C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
P, G = C["parcels"], C["geo"]
A = {str(int(float(k))).zfill(11): v for k, v in C["addresses"].items()}
K = 111320 * math.cos(math.radians(33.73)); SQFT = K * 111320 * 10.7639
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
fps = [(f["attributes"]["FTR_CODE"], poly(f["geometry"]["rings"])) for f in G["footprints"]]
tree = STRtree([g for c, g in fps])
icw = poly(G["hydro"][0]["geometry"]["rings"])
golf = [poly(b["geometry"]["rings"]) for b in G["big"] if "FOUNDERS NATIONAL GOLF" in (b["attributes"]["OwnerName"] or "")][0]
flood = [(f["attributes"]["FLD_ZONE"], f["attributes"]["SFHA_TF"], poly(f["geometry"]["rings"])) for f in G["flood"]]
town = poly(G["towns"][0]["geometry"]["rings"])
zon = [(z["attributes"]["ZoningCode"], poly(z["geometry"]["rings"])) for z in G["zoning"]]
LANDING_ST = {"LANDING RD", "LIGHTHOUSE WAY", "SHIPYARD RD", "KETCH CT", "PLANTATION DR"}
lots = []
for pin, a in P.items():
    g = poly(a["rings"]); c = g.representative_point()
    house = pool = 0
    for i in tree.query(g):
        code, f = fps[i]
        if not g.contains(f.representative_point()): continue
        if code == 1800: house = max(house, f.area * SQFT)
        elif code == 1870: pool += 1
    hfp = max((f for code, f in (fps[i] for i in tree.query(g)) if code == 1800 and g.contains(f.representative_point())), key=lambda f: f.area, default=None)
    zone = next((z for z, t, p in flood if p.contains(c)), "outside mapped zones (X)")
    street = (A.get(pin) or [{}])[0].get("street")
    lots.append({"pin": pin, "section": a["section"], "street": street, "use": a["LandUseCode"], "imp": a["MarketImprv"] or 0, "value": a["MarketProp"] or 0,
                 "lot": a["lotSqft"], "house": house, "pool": pool > 0, "zone": zone, "sfha_touch": any(t == "T" and p.intersects(g) for z, t, p in flood),
                 "sfha_point": any(t == "T" and p.contains(c) for z, t, p in flood),
                 "house_in_sfha": bool(hfp is not None and any(t == "T" and p.intersects(hfp) for z, t, p in flood)),
                 "ratio": round((a["AssessedProp"] or 0) / a["TaxableProp"], 3) if a["TaxableProp"] else None, "icw": g.distance(icw) * K < 25, "golf": g.distance(golf) * K < 15,
                 "in_city": town.contains(c), "zoning": next((z for z, p in zon if p.contains(c)), None), "state": a["OwnerState"], "x": c.x, "y": c.y,
                 "landing": street in LANDING_ST or "LANDING" in a["section"]})
def q(v): v = sorted(v); return {"n": len(v), "min": v[0], "q1": st.quantiles(v, n=4)[0], "median": st.median(v), "q3": st.quantiles(v, n=4)[2], "max": v[-1]} if len(v) > 1 else {"n": len(v)}
def summary(L):
    H = [l for l in L if l["imp"] > 0 and l["use"] != "300"]
    return {"parcels": len(L), "houses": len(H), "vacant_lots": sum(1 for l in L if l["imp"] == 0 and l["use"] in ("100", "101")),
            "lot_sqft": q([l["lot"] for l in H]), "house_footprint_sqft": q([round(l["house"]) for l in H if l["house"]]),
            "county_value": q([l["value"] for l in H]), "pools": sum(1 for l in H if l["pool"]),
            "waterway_lots": sum(1 for l in L if l["icw"]), "golf_lots": sum(1 for l in L if l["golf"]),
            "lot_center_in_high_risk_flood_zone": sum(1 for l in L if l["sfha_point"]), "lot_touches_high_risk_zone": sum(1 for l in L if l["sfha_touch"]),
            "flood_zone_at_lot_center": dict(collections.Counter(l["zone"] for l in L)),
            "owner_mailing_out_of_state": sum(1 for l in H if l["state"] not in ("SC", None)),
            "house_footprint_touches_high_risk_zone": sum(1 for l in H if l["house_in_sfha"]),
            "assessed_at_4pct_legal_residence": sum(1 for l in H if l["ratio"] is not None and abs(l["ratio"] - 0.04) < 0.003),
            "assessed_at_6pct": sum(1 for l in H if l["ratio"] is not None and abs(l["ratio"] - 0.06) < 0.003),
            "in_city_limits": sum(1 for l in L if l["in_city"]), "zoning": dict(collections.Counter(l["zoning"] for l in L)),
            "streets": dict(collections.Counter(l["street"] for l in L).most_common())}
deeds = json.load(open(os.environ["SALES"]))
byp = {l["pin"]: l for l in lots}
multi = collections.Counter(d["BookPage"] for d in deeds["deeds"])
sales = []
for d in deeds["deeds"]:
    l = byp.get(d["ParcelNumber"])
    if not l or (d["Consideration"] or 0) <= 10000 or multi[d["BookPage"]] > 1: continue
    sales.append({"month": d["RecordDate"][:7], "price": d["Consideration"], "house": l["imp"] > 0, "landing": l["landing"], "icw": l["icw"], "golf": l["golf"]})
def ssum(S): return {"count": len(S), "prices": q([s["price"] for s in S]) if S else {}, "by_month": dict(collections.Counter(s["month"] for s in S))}
hs = [s for s in sales if s["house"]]
out = {"made": datetime.date.today().isoformat(), "rule": __doc__, "county_read": C["read"],
       "all": summary(lots), "main": summary([l for l in lots if not l["landing"]]), "landing": summary([l for l in lots if l["landing"]]),
       "sections": dict(collections.Counter(l["section"] for l in lots)),
       "sales_window": [deeds["from"], deeds["to"]],
       "sales": {"all": ssum(sales), "houses": ssum(hs), "houses_main": ssum([s for s in hs if not s["landing"]]),
                 "houses_landing": ssum([s for s in hs if s["landing"]]), "houses_waterway": ssum([s for s in hs if s["icw"]]),
                 "houses_golf": ssum([s for s in hs if s["golf"]]), "lots": ssum([s for s in sales if not s["house"]])},
       "center": [round(st.mean(l["y"] for l in lots), 5), round(st.mean(l["x"] for l in lots), 5)],
       "center_main": [round(st.mean(l["y"] for l in lots if not l["landing"]), 5), round(st.mean(l["x"] for l in lots if not l["landing"]), 5)],
       "center_landing": [round(st.mean(l["y"] for l in lots if l["landing"]), 5), round(st.mean(l["x"] for l in lots if l["landing"]), 5)]}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump([{k: l[k] for k in ("x", "y", "landing", "icw", "golf", "pool")} | {"house": l["imp"] > 0} for l in lots], open(os.path.join(os.environ["RAW"], "lot-points.json"), "w"))
print(json.dumps({k: out[k] for k in ("all", "main", "landing", "sales")}, indent=0)[:6000])
# Map points for the page's one map: each lot's inside point rounded to 4 decimals (about 10 m), with its flags. No PIN or address.
json.dump({"rule": "Lot inside points from county parcels (layer 24), rounded to 4 decimals; flags as in findings.json.",
           "lots": [[round(l["y"], 4), round(l["x"], 4), int(l["landing"]), int(l["icw"]), int(l["golf"]), int(l["pool"]), int(l["imp"] > 0)] for l in lots],
           "columns": ["lat", "lng", "landing", "waterway", "golf", "pool", "house"],
           "labels": {"Food Lion, Plantation Point Plaza": [33.724684, -78.869565], "Myrtlewood Golf Club clubhouse": [33.7362738, -78.8687547]}},
          open(os.path.join(D, "map-lots.json"), "w"))
