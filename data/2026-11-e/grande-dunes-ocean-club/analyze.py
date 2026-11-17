"""Findings for /submarkets/myrtle-beach/grande-dunes/ from the parcels whose county legal description names GRANDE DUNES (raw/gd-parcels.json),
the county Municipalities layer, FEMA's NFHL and the county deed index (SALES = deeds-co.json, AcclaimWeb DEED 2025-11-01..2026-10-31, names blanked).
Home = parcel with land use 101, 109 or 126 and a county building value over $0. Counts, medians, ranges only; no PIN, owner, address, deed book or page.
Tax: AssessedProp / TaxableProp = 0.04 is the legal-residence ratio, 0.06 every other home. Sale = a deed on such a parcel, price over $10,000, one parcel per deed.
Run: RAW=<scratch> SALES=<deeds-co.json> python3 -I analyze.py <this dir>"""
import json, os, sys, collections, statistics as st, datetime
from shapely.geometry import Polygon
from shapely.ops import unary_union
D = sys.argv[1]; RAW = os.environ["RAW"]
P = json.load(open(os.path.join(RAW, "gd-parcels.json"))); G = json.load(open(os.path.join(RAW, "gd-geo.json")))
poly = lambda rings: unary_union([Polygon(r).buffer(0) for r in rings if len(r) >= 4])
mun = [(f["attributes"]["NAME"], poly(f["geometry"]["rings"])) for f in G["municipalities"]]
fema = [(f["attributes"]["FLD_ZONE"], f["attributes"]["SFHA_TF"], poly(f["geometry"]["rings"])) for f in G["fema"]]
def q(v):
    v = sorted(v)
    return {"n": len(v), "median": st.median(v), "min": v[0], "max": v[-1], "q1": v[len(v) // 4], "q3": v[3 * len(v) // 4]} if v else {"n": 0}
L = []
for f in P:
    a = f["attributes"]; g = poly(f["geometry"]["rings"]); pt = g.representative_point()
    town = next((n for n, m in mun if m.contains(pt)), "unincorporated")
    z = next((z for z, s, p in fema if p.contains(pt)), "X")
    sf = any(s == "T" and p.intersects(g) for z_, s, p in fema)
    L.append({"pin": str(int(a["PIN"])) if a["PIN"] else None, "use": a["LandUseCode"], "imp": a["MarketImprv"] or 0, "mkt": a["MarketProp"] or 0, "ass": a["AssessedProp"] or 0, "tax": a["TaxableProp"] or 0,
              "state": a["OwnerState"], "dist": a["TaxDistrict"], "town": town, "zone": z, "touch": sf, "x": pt.x, "y": pt.y, "acre": a["Acreage"] or 0, "legal": (a["LegalDescr"] or "").split(";")[0].strip()})
H = [l for l in L if l["use"] in ("101", "109", "126") and l["imp"] > 0]
ratio = lambda l: l["ass"] / l["tax"] if l["tax"] else None
res = {"made": datetime.date.today().isoformat(), "rule": __doc__,
       "parcels_named_grande_dunes": len(L), "homes": len(H),
       "homes_by_use": dict(collections.Counter(l["use"] for l in H)),
       "empty_lots_101_109_126": sum(1 for l in L if l["use"] in ("101", "109", "126") and l["imp"] == 0),
       "county_value": q([l["mkt"] for l in H]),
       "assessed_at_4pct_legal_residence": sum(1 for l in H if ratio(l) and abs(ratio(l) - .04) < .003),
       "assessed_at_6pct": sum(1 for l in H if ratio(l) and abs(ratio(l) - .06) < .003),
       "owner_mailing_out_of_state": sum(1 for l in H if l["state"] not in ("SC", None)),
       "town": dict(collections.Counter(l["town"] for l in H)),
       "tax_district": dict(collections.Counter(l["dist"] for l in H)),
       "town_by_tax_district": {d: dict(collections.Counter(l["town"] for l in H if l["dist"] == d)) for d in sorted({l["dist"] for l in H})},
       "flood_zone_at_inside_point": dict(collections.Counter(l["zone"] for l in H)),
       "homes_touching_high_risk": sum(1 for l in H if l["touch"]),
       "fema_zones_in_frame": dict(collections.Counter(z for z, s, p in fema)),
       "sections": dict(collections.Counter(l["legal"] for l in H).most_common(30)),
       "center": [round(st.mean(l["y"] for l in H), 5), round(st.mean(l["x"] for l in H), 5)]}
deeds = json.load(open(os.environ["SALES"])); multi = collections.Counter(d["BookPage"] for d in deeds["deeds"])
byp = {l["pin"]: l for l in H}; sales = []
for d in deeds["deeds"]:
    l = byp.get(str(d["ParcelNumber"]))
    if not l or (d["Consideration"] or 0) <= 10000 or multi[d["BookPage"]] > 1: continue
    sales.append({"price": d["Consideration"], "month": d["RecordDate"][:7], "town": l["town"], "ratio": l["mkt"] and d["Consideration"] / l["mkt"]})
res["sales_window"] = [deeds["from"], deeds["to"]]
res["sales"] = {"all": q([s["price"] for s in sales]), "by_town": {t: q([s["price"] for s in sales if s["town"] == t]) for t in {s["town"] for s in sales}},
                "multi_parcel_deeds_dropped": sum(1 for d in deeds["deeds"] if byp.get(str(d["ParcelNumber"])) and multi[d["BookPage"]] > 1)}
json.dump(res, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump({"rule": "One point per home, 4 decimals. No PIN or owner.", "points": [[round(l["x"], 4), round(l["y"], 4), l["town"]] for l in H]}, open(os.path.join(D, "map-points.json"), "w"))
print(json.dumps({k: v for k, v in res.items() if k != "rule"}, indent=1))
