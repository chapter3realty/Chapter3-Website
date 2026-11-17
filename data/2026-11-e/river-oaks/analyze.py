"""Findings for /submarkets/carolina-forest/river-oaks/ from the county cache (pull_county.py) and the county deed index.
Inputs: RAW/county.json; SALES = Horry County deeds recorded 2025-11-01 to 2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json; person names blanked).
Groups by the county legal description: waterway_village (WATERWAY VLG), resort_condos (RIVER OAKS G&T / G & T / GOLF&TENNIS / HPR / VILLAS / RSRT, GARDEN HOMES, all use 107),
fairways (FAIRWAY(S) @/AT/& RIVER OAKS), cottages (RIVER OAKS COTTAGES), oakmont (OAKMONT), par4 (RIVER OAKS PAR 4 / PARCEL 4), landing (THE LANDING @ RIVER OAKS).
Unit = parcel with county building value over $0 and land use not 300. A sale = a deed on a community parcel with a stated price over $10,000; a deed covering several parcels is dropped.
Tax: AssessedProp / TaxableProp = 0.04 (legal residence) or 0.06; implied yearly tax = AssessedProp x mills / 1000 + $89.40 flat fee, mills 201.0 (4% homes: 201.0 - 109.1 school operations; 0.04 rate already in AssessedProp).
Former course: parcels owned by CHRIS MANNING COMMUNITIES FOX AND OTTER LLC (county parcels layer 24, owner kept because a business). Near course = lot within 15 m of those parcels.
Run: RAW=<scratch> SALES=<deeds-co.json> python3 -I analyze.py <this dir>. No PIN, owner or address is written."""
import json, os, sys, math, re, statistics as st, collections, datetime
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely.strtree import STRtree
D = sys.argv[1]; C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
P, G = C["parcels"], C["geo"]
K = 111320 * math.cos(math.radians(33.73))
def poly(r): return unary_union([Polygon(x).buffer(0) for x in r if len(x) >= 4])
icw = poly(G["hydro"][0]["geometry"]["rings"])
course = unary_union([poly(b["geometry"]["rings"]) for b in G["big"] if "FOX AND OTTER" in (b["attributes"]["OwnerName"] or "")])
flood = [(f["attributes"]["FLD_ZONE"], f["attributes"]["SFHA_TF"], poly(f["geometry"]["rings"])) for f in G["flood"]]
zon = [(z["attributes"]["ZoningCode"], poly(z["geometry"]["rings"])) for z in G["zoning"]]
town = poly(G["towns"][0]["geometry"]["rings"])
def grp(s):
    if "WATERWAY VLG" in s: return "waterway_village"
    if "LANDING" in s: return "landing"
    if "FAIRWAY" in s: return "fairways"
    if "COTTAGES" in s: return "cottages"
    if "OAKMONT" in s: return "oakmont"
    if "PAR 4" in s or "PARCEL 4" in s: return "par4"
    if re.search(r"G ?& ?T|GOLF&TENNIS|GARDEN HOMES", s): return "resort_condos"
    return None
lots = []
for pin, a in P.items():
    g = poly(a["rings"]); c = g.representative_point(); s = a["LegalDescr"].split(";")[0]
    gr = grp(s)
    if not gr or (a["LandUseCode"] or "") in ("113", "500", "300", "353", "705", "720", "320"): continue
    zone = next((z for z, t, p in flood if p.contains(c)), "outside mapped zones (X)")
    lots.append({"g": gr, "use": a["LandUseCode"], "imp": a["MarketImprv"] or 0, "mkt": a["MarketProp"] or 0, "asm": a["AssessedProp"] or 0, "tax": a["TaxableProp"] or 0,
                 "lot": a["lotSqft"], "zone": zone, "sfha": any(t == "T" and p.contains(c) for z, t, p in flood), "icw": g.distance(icw) * K, "near_course": g.distance(course) * K < 15,
                 "dcourse": g.distance(course) * K, "state": a["OwnerState"], "x": c.x, "y": c.y, "in_city": town.contains(c), "zoning": next((z for z, p in zon if p.contains(c)), None),
                 "ratio": round(a["AssessedProp"] / a["TaxableProp"], 3) if a["TaxableProp"] else None, "pin": pin})
def q(v):
    v = sorted(v)
    return {"n": len(v), "min": v[0], "q1": st.quantiles(v, n=4)[0], "median": st.median(v), "q3": st.quantiles(v, n=4)[2], "max": v[-1]} if len(v) > 3 else ({"n": len(v), "values": v})
MILLS, FEE, SCH = 201.0, 89.40, 109.1
def summary(L):
    H = [l for l in L if l["imp"] > 0]
    t6 = [l for l in H if l["ratio"] and abs(l["ratio"] - .06) < .003]; t4 = [l for l in H if l["ratio"] and abs(l["ratio"] - .04) < .003]
    return {"parcels": len(L), "units": len(H), "no_building_value": len(L) - len(H), "lot_sqft": q([l["lot"] for l in H]) if H else None,
            "county_market_value": q([l["mkt"] for l in H]) if H else None, "taxable_value": q([l["tax"] for l in H if l["tax"]]) if H else None,
            "at_4pct_legal_residence": len(t4), "at_6pct": len(t6),
            "implied_tax_6pct": q([round(l["asm"] * MILLS / 1000 + FEE) for l in t6]) if t6 else None,
            "implied_tax_4pct": q([round(l["asm"] * (MILLS - SCH) / 1000 + FEE) for l in t4]) if t4 else None,
            "owner_mail_out_of_state": sum(1 for l in H if l["state"] not in ("SC", None)), "owner_mail_sc": sum(1 for l in H if l["state"] == "SC"),
            "units_in_high_risk_flood_zone": sum(1 for l in H if l["sfha"]), "flood_zone_at_center": dict(collections.Counter(l["zone"] for l in L)),
            "within_25m_of_waterway": sum(1 for l in L if l["icw"] < 25), "nearest_to_waterway_m": round(min(l["icw"] for l in L)),
            "within_15m_of_former_course": sum(1 for l in L if l["near_course"]), "in_city_limits": sum(1 for l in L if l["in_city"]),
            "zoning": dict(collections.Counter(l["zoning"] for l in L)), "center": [round(st.mean(l["y"] for l in L), 5), round(st.mean(l["x"] for l in L), 5)]}
deeds = json.load(open(os.environ["SALES"])); byp = {l["pin"]: l for l in lots}
multi = collections.Counter(d["BookPage"] for d in deeds["deeds"]); sales = []
for d in deeds["deeds"]:
    l = byp.get(d["ParcelNumber"])
    if not l or (d["Consideration"] or 0) <= 10000 or multi[d["BookPage"]] > 1: continue
    sales.append({"g": l["g"], "month": d["RecordDate"][:7], "price": d["Consideration"], "unit": l["imp"] > 0, "near_course": l["near_course"]})
def ssum(S): return {"count": len(S), "prices": q([s["price"] for s in S]) if S else {}, "by_month": dict(sorted(collections.Counter(s["month"] for s in S).items()))}
out = {"made": datetime.date.today().isoformat(), "rule": __doc__, "county_read": C["read"], "groups": {}, "sales_window": [deeds["from"], deeds["to"]], "sales": {}}
names = sorted({l["g"] for l in lots})
for g in names: out["groups"][g] = summary([l for l in lots if l["g"] == g]); out["sales"][g] = ssum([s for s in sales if s["g"] == g and s["unit"]])
condo = [l for l in lots if l["g"] in ("waterway_village", "resort_condos", "fairways")]
out["condos_all"] = summary(condo); out["sales"]["condos_all"] = ssum([s for s in sales if s["g"] in ("waterway_village", "resort_condos", "fairways") and s["unit"]])
out["houses_all"] = summary([l for l in lots if l["g"] in ("cottages", "oakmont", "par4")]); out["sales"]["houses_all"] = ssum([s for s in sales if s["g"] in ("cottages", "oakmont", "par4") and s["unit"]])
out["all"] = summary(lots)
out["former_course_parcels_acres"] = [round(b["attributes"]["Shape.STArea()"] / 43560, 1) for b in G["big"] if "FOX AND OTTER" in (b["attributes"]["OwnerName"] or "")]
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump({"lots": [[round(l["y"], 4), round(l["x"], 4), l["g"], int(l["near_course"]), int(l["imp"] > 0)] for l in lots], "columns": ["lat", "lng", "group", "near_former_course", "unit"],
           "rule": "Inside points rounded to 4 decimals; no PIN."}, open(os.path.join(D, "map-lots.json"), "w"))
print(json.dumps({k: out[k] for k in ("groups", "sales", "condos_all", "houses_all")}, indent=0)[:9000])
