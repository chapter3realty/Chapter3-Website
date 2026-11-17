"""Findings for /submarkets/conway/wild-wing-plantation/, from the county cache (pull_county.py) and the county deed index.
Inputs: RAW/county.json; SALES = Horry County deeds recorded 2025-11-01 to 2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json,
AcclaimWeb DEED (001); person names already blanked). A sale = a deed on a community parcel with a stated price over $10,000; a deed
covering several parcels is dropped. House = parcel with county building value over $0 and land use 101/109/106 (not 300 common land).
Groups: "houses" = every section except FAIRWAYS (detached houses, The Sanctuary included); "sanctuary" = SANC @ WILD WING; "fairways" = FAIRWAYS @WILDWING (townhomes).
Size = largest county 'Residential' footprint (layer 27, structures 2023): roof outline, not heated living area. Pool = 'Pool Inground' footprint on the lot (a floor).
Golf lot = within 15 m of a county parcel with land use 394 (golf course) owned by FOUNDERS WILD WING LLC (PAR A and PAR V).
Lake lot = within 15 m of the Wild Wing POA's lake-and-wetland parcel (land use 300, owner WILD WING POA ASSOC INC).
Tax status: assessed/taxable 0.04 = legal residence ratio; 0.06 = other.
Writes findings.json (counts, medians, ranges; no PIN, owner, address or deed book and page) and map-lots.json (points rounded to 4 decimals).
Run: RAW=<scratch> SALES=<deeds-co.json> python3 -I analyze.py <this dir>"""
import json, os, sys, math, statistics as st, collections, datetime
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely.strtree import STRtree
D = sys.argv[1]; C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
P, G = C["parcels"], C["geo"]
A = {str(int(float(k))).zfill(11): v for k, v in C["addresses"].items()}
K = 111320 * math.cos(math.radians(33.79)); SQFT = K * 111320 * 10.7639
def poly(rings): return unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
fps = [(f["attributes"]["FTR_CODE"], poly(f["geometry"]["rings"])) for f in G["footprints"]]
tree = STRtree([g for c, g in fps])
golfs = [(b["attributes"]["OwnerName"], b["attributes"]["LandUseCode"], b["attributes"]["LegalDescr"], poly(b["geometry"]["rings"])) for b in G["big"]
         if b["attributes"]["LandUseCode"] == "394" and "FOUNDERS WILD WING" in (b["attributes"]["OwnerName"] or "")]
lake = unary_union([poly(b["geometry"]["rings"]) for b in G["big"] if "WILD WING POA" in (b["attributes"]["OwnerName"] or "")])
town = poly(G["towns"][0]["geometry"]["rings"])
zon = [(z["attributes"]["ZoningCode"], poly(z["geometry"]["rings"])) for z in G["zoning"]]
lots = []
for pin, a in P.items():
    g = poly(a["rings"]); c = g.representative_point()
    hfp = max((f for code, f in (fps[i] for i in tree.query(g)) if code == 1800 and g.contains(f.representative_point())), key=lambda f: f.area, default=None)
    pool = sum(1 for i in tree.query(g) if fps[i][0] == 1870 and g.contains(fps[i][1].representative_point()))
    sec = a["section"]; street = (A.get(pin) or [{}])[0].get("street")
    lots.append({"pin": pin, "section": sec, "street": street, "use": a["LandUseCode"], "imp": a["MarketImprv"] or 0, "value": a["MarketProp"] or 0, "lot": a["lotSqft"],
                 "house": (hfp.area * SQFT) if hfp is not None else 0, "pool": pool > 0, "ratio": round((a["AssessedProp"] or 0) / a["TaxableProp"], 3) if a["TaxableProp"] else None,
                 "golf": any(g.distance(gp) * K < 15 for _, _, _, gp in golfs), "lake": g.distance(lake) * K < 15 and a["LandUseCode"] != "300",
                 "in_city": town.contains(c), "zoning": next((z for z, p in zon if p.contains(c)), None), "state": a["OwnerState"], "x": c.x, "y": c.y,
                 "group": "fairways" if sec.startswith("FAIRWAYS") else ("sanctuary" if sec.startswith("SANC") else "houses_other")})
def q(v):
    v = sorted(v)
    return {"n": len(v), "min": v[0], "q1": st.quantiles(v, n=4)[0], "median": st.median(v), "q3": st.quantiles(v, n=4)[2], "max": v[-1]} if len(v) > 1 else {"n": len(v)}
def summary(L):
    H = [l for l in L if l["imp"] > 0 and l["use"] in ("101", "109", "106")]
    return {"parcels": len(L), "houses": len(H), "vacant_lots": sum(1 for l in L if l["imp"] == 0 and l["use"] in ("100", "101")),
            "lot_sqft": q([l["lot"] for l in H]), "house_footprint_sqft": q([round(l["house"]) for l in H if l["house"]]), "county_value": q([l["value"] for l in H]),
            "pools": sum(1 for l in H if l["pool"]), "golf_lots": sum(1 for l in L if l["golf"]), "lake_lots": sum(1 for l in L if l["lake"]),
            "owner_mailing_out_of_state": sum(1 for l in H if l["state"] not in ("SC", None)),
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
    sales.append({"month": d["RecordDate"][:7], "price": d["Consideration"], "house": l["imp"] > 0, "group": l["group"], "golf": l["golf"], "lake": l["lake"]})
def ssum(S): return {"count": len(S), "prices": q([s["price"] for s in S]) if len(S) > 1 else ({"n": 1, "median": S[0]["price"]} if S else {}), "by_month": dict(collections.Counter(s["month"] for s in S))}
hs = [s for s in sales if s["house"]]
det = [l for l in lots if l["group"] != "fairways"]
out = {"made": datetime.date.today().isoformat(), "rule": __doc__, "county_read": C["read"],
       "all": summary(lots), "detached": summary(det), "sanctuary": summary([l for l in lots if l["group"] == "sanctuary"]), "fairways": summary([l for l in lots if l["group"] == "fairways"]),
       "golf_parcels": [[o, u, d, round(gp.area * SQFT / 43560, 1)] for o, u, d, gp in golfs],
       "sections": dict(collections.Counter(l["section"] for l in lots)), "sales_window": [deeds["from"], deeds["to"]],
       "sales": {"houses_detached": ssum([s for s in hs if s["group"] != "fairways"]), "houses_sanctuary": ssum([s for s in hs if s["group"] == "sanctuary"]),
                 "houses_fairways": ssum([s for s in hs if s["group"] == "fairways"]), "houses_golf": ssum([s for s in hs if s["golf"] and s["group"] != "fairways"]),
                 "lots_detached": ssum([s for s in sales if not s["house"] and s["group"] != "fairways"])},
       "center": [round(st.mean(l["y"] for l in det), 5), round(st.mean(l["x"] for l in det), 5)],
       "center_fairways": [round(st.mean(l["y"] for l in lots if l["group"] == "fairways"), 5), round(st.mean(l["x"] for l in lots if l["group"] == "fairways"), 5)]}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump({"lots": [[round(l["y"], 4), round(l["x"], 4), l["group"], int(l["golf"]), int(l["lake"]), int(l["pool"]), int(l["imp"] > 0)] for l in lots],
           "columns": ["lat", "lng", "group", "golf", "lake", "pool", "house"]}, open(os.path.join(D, "map-lots.json"), "w"))
print(json.dumps({k: out[k] for k in ("all", "detached", "sanctuary", "fairways", "golf_parcels", "sales", "center", "center_fairways")}, indent=0)[:9000])
