"""Deed findings from raw/deeds.json and raw/parcels.json.
Kept deed: consideration over $10,000; exactly one 11-digit parcel; no tax-sale or court party ('DELINQUENT TAX', 'SHERIFF',
'MASTER IN EQUITY'); memo without 'CORRECT' or 'RE-RECORD' and not naming several parcels, lots or tracts; parcel in the county
layer with a residential land use code (starting with 1).
Builder sale: grantor matches BUILDER (home builders that sell finished houses here) and the grantee does not (no builder-to-builder lot sales).
Usage: python3 -I build_deeds.py <this dir> -> findings-deeds.json"""
import json, sys, os, re, statistics as st, collections
D = sys.argv[1]
R = json.load(open(os.path.join(D, "raw", "deeds-slim.json" if os.path.exists(os.path.join(D, "raw", "deeds-slim.json")) else "deeds.json"))); P = json.load(open(os.path.join(D, "raw", "parcels.json")))["parcels"]
BUILDER = re.compile(r"HORTON|LENNAR|\bNVR\b|PULTE|MERITAGE|CLAYTON PROPERTIES|GREAT SOUTHERN HOMES|BEVERLY HOMES|STARLIGHT HOMES|BEAZER|ASHTON CHARLESTON|TOLL SOUTHEAST|H & H CONSTRUCTORS|DRB GROUP|DREAM FINDERS|RS PARKER HOMES|HOWELL HOMES|MILLROSE|LEWIS CONSTRUCTION|CHRIS MANNING|CAROLINA COTTAGE|HUNTER QUINN|OCEAN PALMS BUILDERS|SANDS BUILDING|BRADLEY JONES|INFINITY CUSTOM|ALMOND QUALITY|CMH HOMES|AMERI BUILT|MUNGO|CPG INC|STANLEY MARTIN|CHESAPEAKE HOMES|ADAMS HOMES|ASHTON WOODS")
OTHER_DEV = re.compile(r"BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOMES OF|HOME BUILDERS|DEVELOPMENT")
TAX = re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO = re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
deeds = R["deeds"]; steps = collections.OrderedDict(); steps["all deeds"] = len(deeds)
k = [d for d in deeds if (d["Consideration"] or 0) > 10000]; steps["over $10,000"] = len(k)
k = [d for d in k if re.fullmatch(r"\d{11}", d["ParcelNumber"] or "")]; steps["one parcel number"] = len(k)
k = [d for d in k if not TAX.search((d["DirectName"] or "") + " " + (d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "")]; steps["not tax sale, corrective or multi-parcel memo"] = len(k)
k = [d for d in k if d["ParcelNumber"] in P]; steps["parcel in county layer"] = len(k)
k = [d for d in k if (P[d["ParcelNumber"]]["LandUseCode"] or "").startswith("1")]; steps["residential land use code"] = len(k)
for d in k:
    d["b"] = bool(BUILDER.search(d["DirectName"] or "")) and not BUILDER.search(d["IndirectName"] or "") and not OTHER_DEV.search(d["IndirectName"] or "")
    d["dev"] = (not d["b"]) and bool(BUILDER.search(d["DirectName"] or "") or OTHER_DEV.search(d["DirectName"] or ""))
    p = P[d["ParcelNumber"]]; d["imp0"] = (p["MarketImprv"] or 0) == 0; d["mo"] = d["RecordDate"][:7].replace("/", "-")
b = [d for d in k if d["b"]]; nb = [d for d in k if not d["b"] and not d["dev"]]
out = {"source": R["source"], "pulled": R["pulled"], "parcels_read": P and "raw/parcels.json", "steps": steps,
       "builder_sales": len(b), "other_sales_not_builder_or_developer": len(nb), "developer_or_builder_to_builder": len([d for d in k if d["dev"]]),
       "builder_share_pct": round(100 * len(b) / len(k), 1),
       "builder_median_price": st.median([d["Consideration"] for d in b]), "other_median_price": st.median([d["Consideration"] for d in nb]),
       "builder_price_quartiles": st.quantiles([d["Consideration"] for d in b], n=4, method="inclusive")}
# by builder (grantor name normalized)
def norm(n):
    for pat, lab in [("HORTON", "D.R. Horton"), ("LENNAR", "Lennar"), (r"\bNVR\b", "NVR (Ryan Homes)"), ("PULTE", "Pulte"), ("MERITAGE", "Meritage"),
                     ("CLAYTON PROPERTIES", "Clayton Properties"), ("GREAT SOUTHERN", "Great Southern Homes"), ("BEVERLY", "Beverly Homes"),
                     ("BEAZER", "Beazer"), ("STARLIGHT", "Starlight Homes"), ("ASHTON CHARLESTON", "Ashton Woods"), ("TOLL", "Toll Brothers"),
                     ("H & H", "H & H Constructors"), ("DRB", "DRB Group"), ("DREAM FINDERS", "Dream Finders"), ("RS PARKER", "RS Parker Homes")]:
        if re.search(pat, n): return lab
    return "other listed builders"
c = collections.Counter(norm(d["DirectName"]) for d in b); out["by_builder"] = c.most_common()
out["top5_share_of_builder_sales_pct"] = round(100 * sum(v for n, v in c.most_common(6) if n != "other listed builders") / len(b), 1)
# county building value zero, by month of deed
months = sorted(set(d["mo"] for d in b))
out["builder_imp0_by_month"] = [{"month": m, "sales": len([d for d in b if d["mo"] == m]), "no_building_value": len([d for d in b if d["mo"] == m and d["imp0"]])} for m in months]
q4 = [d for d in b if d["mo"] <= "2025-12"]; y26 = [d for d in b if d["mo"] >= "2026-01"]
out["builder_imp0"] = {"all": [len([d for d in b if d["imp0"]]), len(b)], "deeds_oct_dec_2025": [len([d for d in q4 if d["imp0"]]), len(q4)],
                       "deeds_jan_sep_2026": [len([d for d in y26 if d["imp0"]]), len(y26)]}
z = [P[d["ParcelNumber"]] for d in y26 if d["imp0"]]
out["builder_2026_imp0_land"] = {"n": len(z), "median_market_land": st.median([p["MarketLand"] or 0 for p in z]),
                                 "median_price_of_those_deeds": st.median([d["Consideration"] for d in y26 if d["imp0"]])}
# owner mailing state on builder-sold parcels (current owner; no names)
sc = collections.Counter((P[d["ParcelNumber"]]["OwnerState"] or "").strip().upper() for d in b)
out["builder_owner_state"] = {"SC": sc.get("SC", 0), "total": len(b), "top_other": [x for x in sc.most_common(8) if x[0] != "SC"]}
# assessment ratio on builder-sold parcels with a building value (assessed / market)
rat = collections.Counter()
for d in b:
    p = P[d["ParcelNumber"]]
    if p["MarketImprv"] and p["MarketProp"]:
        r = (p["AssessedProp"] or 0) / p["MarketProp"]; rat["4%" if abs(r - 0.04) < 0.004 else "6%" if abs(r - 0.06) < 0.004 else "other"] += 1
out["builder_valued_assessment_ratio"] = dict(rat)
# builder sales by tax district (ties a sale to a city or the unincorporated county)
out["builder_by_taxdistrict"] = collections.Counter(P[d["ParcelNumber"]]["TaxDistrict"] for d in b).most_common(15)
# how the county valued homes builders sold in Oct-Dec 2025 (first valued for tax year 2026): county market value / deed price
v = [(P[d["ParcelNumber"]]["MarketProp"] or 0) / d["Consideration"] for d in q4 if not d["imp0"] and d["Consideration"] > 100000]
out["q4_2025_builder_value_to_price"] = {"n": len(v), "median": round(st.median(v), 3), "quartiles": [round(x, 3) for x in st.quantiles(v, n=4, method="inclusive")]}
out["q4_2025_builder_median_price"] = st.median([d["Consideration"] for d in q4])
out["q4_2025_builder_median_county_value"] = st.median([P[d["ParcelNumber"]]["MarketProp"] or 0 for d in q4])
json.dump(out, open(os.path.join(D, "findings-deeds.json"), "w"), indent=1)
print(json.dumps({x: out[x] for x in out if x not in ("builder_imp0_by_month",)}, indent=1)); print(out["builder_imp0_by_month"])
