#!/usr/bin/env python3
"""Every derived number for /submarkets/north-myrtle-beach/. Run:
  RAW=<scratch> SALES=<out-of-state-buyers.json> LISTINGS=<listings-nmb.json> python3 -I analyze.py <this dir>
Reads RAW/parcels.json, shapes.json, munis.json, roads.json, hydro.json, sfha.json (fetch_county.py; roads.json: see README),
the batch 2026-10-d deed sales (SALES), the CRM listing pull (LISTINGS, pull_listings.py), raw/nfip-policies-29582-*.json, raw/drives.json.
Writes findings.json and the chart files. No names, addresses, PINs or deed book and page are written."""
import sys, os, json, collections, statistics, math
D = sys.argv[1]; sys.path.insert(0, D)
import areas
from shapely.geometry import Polygon, Point, shape
from shapely.ops import unary_union
from shapely.prepared import prep
from shapely.strtree import STRtree
RAW = os.environ["RAW"]
L = lambda n: json.load(open(os.path.join(RAW, n)))
P = L("parcels.json"); H = L("hydro.json"); R = L("roads.json")["features"]; M = L("munis.json")
inn, city = areas.assign(P, M, R, H)
HOUSE = {"100", "101", "102", "110", "126"}; TOWN = {"109"}; CONDO = {"107", "135"}; MFG = {"120", "121", "122", "130"}
def kind(p):
    u = p["LandUseCode"]; lg = (p["LegalDescr"] or "").upper()
    if u in CONDO or " HPR" in " " + lg or "UNIT" in lg: return "condo"
    if u in MFG: return "manufactured"
    if u in TOWN: return "townhouse"
    if u in HOUSE: return "house"
    return "other"
for p in inn: p["kind"] = kind(p)
def med(v): return round(statistics.median(v)) if v else None
def q(v, f):
    v = sorted(v); return round(v[min(len(v) - 1, int(f * (len(v) - 1) + 0.5))]) if v else None
def summ(v): return {"n": len(v), "median": med(v), "p25": q(v, .25), "p75": q(v, .75)}
out = {"method": "areas.py; kinds as the Little River ledger; deeds 2025-10-01 to 2026-09-30 (batch 2026-10-d)"}
out["city_sq_miles"] = None
# ---- homes by part and kind
out["homes"] = {"all": len(inn), "by_kind": dict(collections.Counter(p["kind"] for p in inn).most_common())}
out["homes_by_area"] = {a: {"n": sum(p["area"] == a for p in inn), "by_kind": dict(collections.Counter(p["kind"] for p in inn if p["area"] == a).most_common())} for a in areas.ORDER}
# ---- legal residence (4 percent) and tax bills mailed out of state
def ratio(p):
    try: return p["AssessedProp"] / p["TaxableProp"]
    except Exception: return None
for p in inn:
    r = ratio(p); p["legal"] = r is not None and r < 0.05
def shares(hs):
    hs = [p for p in hs if ratio(p)]
    return {"n": len(hs), "pct_legal_residence": round(100 * sum(p["legal"] for p in hs) / len(hs), 1) if hs else None,
            "pct_bill_out_of_state": round(100 * sum((p["OwnerState"] or "SC") != "SC" for p in hs) / len(hs), 1) if hs else None}
out["residence"] = {"all": shares(inn), "houses": shares([p for p in inn if p["kind"] == "house"]), "condos": shares([p for p in inn if p["kind"] == "condo"]),
                    "by_area": {a: {"all": shares([p for p in inn if p["area"] == a]), "houses": shares([p for p in inn if p["area"] == a and p["kind"] == "house"]),
                                    "condos": shares([p for p in inn if p["area"] == a and p["kind"] == "condo"])} for a in areas.ORDER}}
# ---- FEMA high-risk zone at the home's point
S = L("sfha.json")
hz = [(shape({"type": "Polygon", "coordinates": s["geometry"]["rings"]}).buffer(0), s["attributes"]["FLD_ZONE"]) for s in S if s["attributes"]["SFHA_TF"] == "T"]
tree = STRtree([g for g, _ in hz])
for p in inn:
    pt = Point(p["c"]["x"], p["c"]["y"]); z = None
    for i in tree.query(pt):
        if hz[i][0].contains(pt): z = hz[i][1]; break
    p["sfha"] = z
def fl(hs): return {"n": len(hs), "in_sfha": sum(bool(p["sfha"]) for p in hs), "ve": sum(p["sfha"] == "VE" for p in hs),
                   "pct_sfha": round(100 * sum(bool(p["sfha"]) for p in hs) / len(hs), 1) if hs else None}
out["flood"] = {"all": fl(inn), "houses": fl([p for p in inn if p["kind"] == "house"]), "condos": fl([p for p in inn if p["kind"] == "condo"]),
                "by_area": {a: {"all": fl([p for p in inn if p["area"] == a]), "houses": fl([p for p in inn if p["area"] == a and p["kind"] == "house"]),
                                "condos": fl([p for p in inn if p["area"] == a and p["kind"] == "condo"])} for a in areas.ORDER}}
# ---- houses on the water: parcel outline within 15 m of the county's water outline (layer 21), by water body
SH = {s["PIN"]: s["g"] for s in L("shapes.json") if s.get("g")}
water = [(shape({"type": "Polygon", "coordinates": h["geometry"]["rings"]}).buffer(0), h["attributes"]["NAME"].strip() or "unnamed") for h in H]
wtree = STRtree([g for g, _ in water]); BUF = 15 / 111000
for p in inn:
    p["water"] = None
    if p["kind"] != "house" or p["PIN"] not in SH: continue
    g = Polygon(SH[p["PIN"]]["rings"][0]).buffer(0)
    for i in wtree.query(g.buffer(BUF)):
        if water[i][0].distance(g) <= BUF: p["water"] = water[i][1]; break
out["water_houses"] = {"all": sum(bool(p["water"]) for p in inn), "by_water": dict(collections.Counter(p["water"] for p in inn if p["water"])),
                       "by_area": {a: {"houses": sum(p["area"] == a and p["kind"] == "house" for p in inn), "on_water": sum(p["area"] == a and bool(p["water"]) for p in inn),
                                       "by_water": dict(collections.Counter(p["water"] for p in inn if p["area"] == a and p["water"]))} for a in areas.ORDER}}
cgw = [p for p in inn if p["area"] in ("cg", "neck") and p["water"] == "HOUSE CREEK"]
out["channel_houses"] = {"n": len(cgw), "by_area": dict(collections.Counter(p["area"] for p in cgw)), "in_sfha": sum(bool(p["sfha"]) for p in cgw),
                         "zones": dict(collections.Counter(p["sfha"] or "outside" for p in cgw)), "legal_residence_pct": round(100 * sum(p["legal"] for p in cgw) / len(cgw), 1) if cgw else None,
                         "median_county_value": med([p["MarketProp"] for p in cgw]), "median_acres": round(statistics.median([p["Acreage"] for p in cgw if p["Acreage"]]), 3) if cgw else None}
# ---- deed sales
SA = json.load(open(os.environ["SALES"]))["sales"]
byp = {p["PIN"]: p for p in inn}
sales = []
for s in SA:
    try: pin = int(float(s["pin"]))
    except Exception: continue
    p = byp.get(pin)
    if p: sales.append(dict(s, p=p))
out["sales_window"] = [min(s["date"] for s in sales), max(s["date"] for s in sales)]
def ks(f): return summ([s["cons"] for s in sales if f(s)])
out["sales"] = {"all": len(sales), "house_resale": ks(lambda s: s["p"]["kind"] == "house" and not s["builder"]), "house_new_builder": ks(lambda s: s["p"]["kind"] == "house" and s["builder"]),
                "townhouse": ks(lambda s: s["p"]["kind"] == "townhouse"), "condo": ks(lambda s: s["p"]["kind"] == "condo"),
                "condo_resale": ks(lambda s: s["p"]["kind"] == "condo" and not s["builder"]),
                "house_resale_channel": ks(lambda s: s["p"]["kind"] == "house" and not s["builder"] and s["p"] in cgw),
                "house_resale_cg_not_channel": ks(lambda s: s["p"]["kind"] == "house" and not s["builder"] and s["p"]["area"] == "cg" and s["p"] not in cgw),
                "pct_buyer_bill_out_of_state": round(100 * sum(s["where"] != "SC" for s in sales) / len(sales), 1)}
out["sales_by_area"] = {a: {"house_resale": ks(lambda s, a=a: s["p"]["area"] == a and s["p"]["kind"] == "house" and not s["builder"]),
                            "house_new_builder": ks(lambda s, a=a: s["p"]["area"] == a and s["p"]["kind"] == "house" and s["builder"]),
                            "condo": ks(lambda s, a=a: s["p"]["area"] == a and s["p"]["kind"] == "condo"),
                            "townhouse": ks(lambda s, a=a: s["p"]["area"] == a and s["p"]["kind"] == "townhouse")} for a in areas.ORDER}
# oceanfront: the home's point within 150 m of the ocean side of Ocean Blvd is not measured here; see rows
# ---- property tax worked example (2026 levy: county and school 171.2, school operating 109.1, North Myrtle Beach 50.0)
MILLS = 171.2 + 50.0; SCHOOL_OP = 109.1
def tax(v, legal): return round(v * (0.04 if legal else 0.06) * (MILLS - (SCHOOL_OP if legal else 0)) / 1000)
hr = out["sales"]["house_resale"]["median"]; cr = out["sales"]["condo"]["median"]
out["tax_example"] = {"mills": round(MILLS, 1), "mills_at_4pct": round(MILLS - SCHOOL_OP, 1),
                      "house": {"value": hr, "as_home": tax(hr, True), "as_second_or_rental": tax(hr, False)},
                      "condo": {"value": cr, "as_home": tax(cr, True), "as_second_or_rental": tax(cr, False)},
                      "per_100k": {"as_home": tax(100000, True), "as_second_or_rental": tax(100000, False)}}
# ---- lodging tax worked example on a week's rent
WEEK = 2000
out["lodging_tax_example"] = {"rent": WEEK, "state_9pct": round(WEEK * .09), "city_hospitality_1_5pct": round(WEEK * .015), "county_hospitality_1_5pct": round(WEEK * .015),
                              "total_12pct": round(WEEK * .12)}
# ---- NFIP policies, ZIP 29582
nf = {}
for g in ("x", "a", "v"):
    fn = os.path.join(D, "raw", "nfip-policies-29582-%s.json" % g)
    if os.path.exists(fn):
        rows = json.load(open(fn))["NfipPolicies"]; v = [r["policyCost"] for r in rows if r.get("policyCost")]
        nf[g] = dict(summ(v), primary_residence=sum(bool(r.get("primaryResidenceIndicator")) for r in rows))
out["nfip_policies_29582"] = nf
# ---- listings in aggregate
LI = os.environ.get("LISTINGS")
if LI and os.path.exists(LI):
    li = json.load(open(LI)); homes = list(li["homes"].values())
    import numpy as np   # a listing takes the part of the nearest home parcel inside the city; listings outside the city limits are dropped
    pc = prep(city); IA = np.array([[p["c"]["x"] * areas.K, p["c"]["y"]] for p in inn])
    pts = [dict(c={"x": float(h["lng"]), "y": float(h["lat"])}, h=h) for h in homes if h.get("lat") and h.get("lng")]
    tagged = [x for x in pts if pc.contains(Point(x["c"]["x"], x["c"]["y"]))]
    for x in tagged: x["area"] = inn[int(np.argmin(((IA - np.array([x["c"]["x"] * areas.K, x["c"]["y"]])) ** 2).sum(1)))]["area"]
    out["listings"] = {"pulled": li["pulled"], "api_totals": li["api_totals"], "with_point": len(pts), "inside_city": len(tagged),
                       "by_type": {t: summ([x["h"]["price"] for x in tagged if x["h"]["type"] == t and x["h"]["price"]]) for t in ("house", "condo", "townhouse", "manufactured", "land")},
                       "by_area": {a: {t: summ([x["h"]["price"] for x in tagged if x["area"] == a and x["h"]["type"] == t and x["h"]["price"]]) for t in ("house", "condo")} for a in areas.ORDER},
                       "house_under_400k": sum(1 for x in tagged if x["h"]["type"] == "house" and x["h"]["price"] and x["h"]["price"] < 400000),
                       "condo_under_200k": sum(1 for x in tagged if x["h"]["type"] == "condo" and x["h"]["price"] and x["h"]["price"] < 200000),
                       "house_ppsf": {a: med([x["h"]["price"] / float(x["h"]["sqft"]) for x in tagged if x["area"] == a and x["h"]["type"] == "house" and x["h"]["price"] and x["h"]["sqft"] and float(x["h"]["sqft"]) > 400]) for a in areas.ORDER}}
# ---- drives
dr = os.path.join(D, "raw", "drives.json")
if os.path.exists(dr): out["drives_from_main_street"] = {k: {"minutes": v["minutes"], "miles": v["miles"]} for k, v in json.load(open(dr)).items()}
out["area_names"] = areas.NAMES
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
# ---- chart files
json.dump({"title": "What a house resold for, by part of North Myrtle Beach", "unit": "USD", "window": out["sales_window"],
           "rows": [{"area": areas.NAMES[a], "key": a, **out["sales_by_area"][a]["house_resale"]} for a in areas.ORDER]}, open(os.path.join(D, "chart-house-resales.json"), "w"), indent=1)
json.dump({"title": "Homes that are someone's legal residence, by part", "unit": "percent",
           "rows": [{"area": areas.NAMES[a], "key": a, "all": out["residence"]["by_area"][a]["all"]["pct_legal_residence"], "houses": out["residence"]["by_area"][a]["houses"]["pct_legal_residence"],
                     "condos": out["residence"]["by_area"][a]["condos"]["pct_legal_residence"], "homes": out["residence"]["by_area"][a]["all"]["n"]} for a in areas.ORDER]}, open(os.path.join(D, "chart-residence.json"), "w"), indent=1)
print(json.dumps({k: out[k] for k in ("homes", "residence", "water_houses", "channel_houses", "sales", "tax_example", "nfip_policies_29582")}, indent=0)[:6000])
for a in areas.ORDER: print(a, out["homes_by_area"][a], out["sales_by_area"][a], out["flood"]["by_area"][a]["all"], out["residence"]["by_area"][a]["all"])
# ---- map layers (simplified; no parcel outlines): the parts as the union of 45 m circles round each home's point, the city limits,
# the FEMA high-risk zone, the channel houses' area, and the drive-time points
from shapely.geometry import mapping
def clean(g, tol=0.0003): return g.simplify(tol, preserve_topology=True)
feats = []
for a in areas.ORDER:
    pts = [Point(p["c"]["x"], p["c"]["y"]).buffer(0.00045) for p in inn if p["area"] == a]
    g = clean(unary_union(pts).buffer(0.0004).buffer(-0.0003))
    feats.append({"type": "Feature", "properties": {"layer": "part", "key": a, "name": areas.NAMES[a], "homes": out["homes_by_area"][a]["n"]}, "geometry": mapping(g)})
feats.append({"type": "Feature", "properties": {"layer": "city"}, "geometry": mapping(clean(city, 0.0004))})
feats.append({"type": "Feature", "properties": {"layer": "sfha"}, "geometry": mapping(clean(unary_union([g for g, z in hz]).intersection(city.buffer(0.002)), 0.0004))})
feats.append({"type": "Feature", "properties": {"layer": "channel_houses", "n": len(cgw)}, "geometry": mapping(clean(unary_union([Point(p["c"]["x"], p["c"]["y"]).buffer(0.0004) for p in cgw]), 0.0002))})
feats.append({"type": "Feature", "properties": {"layer": "waterway"}, "geometry": mapping(clean(unary_union([g for g, n in water if n == "Intracoastal Waterway"]).intersection(city.buffer(0.01)), 0.0002))})
json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(D, "map-parts.geojson"), "w"))
# by-part table for the page
json.dump({"title": "The parts of North Myrtle Beach", "window": out["sales_window"], "rows": [{"key": a, "name": areas.NAMES[a], "homes": out["homes_by_area"][a]["n"],
           "houses": out["homes_by_area"][a]["by_kind"].get("house", 0), "condos": out["homes_by_area"][a]["by_kind"].get("condo", 0),
           "house_resale": out["sales_by_area"][a]["house_resale"], "condo_sales": out["sales_by_area"][a]["condo"],
           "pct_houses_legal_residence": out["residence"]["by_area"][a]["houses"]["pct_legal_residence"], "pct_condos_legal_residence": out["residence"]["by_area"][a]["condos"]["pct_legal_residence"],
           "pct_homes_high_risk_flood": out["flood"]["by_area"][a]["all"]["pct_sfha"],
           "listing_house_ask_per_sqft": (out.get("listings") or {}).get("house_ppsf", {}).get(a)} for a in areas.ORDER]}, open(os.path.join(D, "table-parts.json"), "w"), indent=1)
print("map and table written")
# ---- the largest subdivisions and condo regimes in each part (the county legal description before ';', phase and section words cut)
import re
def subname(lg):
    s = (lg or "").split(";")[0].upper()
    s = re.sub(r"\b(PH(ASE)?|SEC(TION)?|BLDG|BL|UNIT|UN|LT|LOT|REV(ISED)?|HPR|TR(ACT)?|PAR)\b.*$", "", s)
    s = re.sub(r"\b(I{1,3}|IV|V|VI{0,3}|\d+[A-Z]?)\s*$", "", s).strip(" ,.-&@")
    return s or None
subs = {}
for a in areas.ORDER:
    c = collections.defaultdict(list)
    for p in inn:
        if p["area"] == a and subname(p["LegalDescr"]): c[subname(p["LegalDescr"])].append(p)
    rows = []
    for k, hs in sorted(c.items(), key=lambda kv: -len(kv[1]))[:8]:
        ss = [s["cons"] for s in sales if s["p"] in hs and not s["builder"] and s["p"]["kind"] == hs[0]["kind"]]
        rows.append({"name": k, "homes": len(hs), "kinds": dict(collections.Counter(p["kind"] for p in hs)), "legal_residence_pct": round(100 * sum(p["legal"] for p in hs) / len(hs)),
                     "in_sfha": sum(bool(p["sfha"]) for p in hs), "resales_main_kind": summ(ss) if len(ss) >= 5 else {"n": len(ss)}})
    subs[a] = rows
out["subdivisions_by_area"] = subs
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
for a in areas.ORDER:
    print("==", a)
    for r in subs[a]: print("  ", r["name"], r["homes"], r["kinds"], "4%", r["legal_residence_pct"], "sfha", r["in_sfha"], r["resales_main_kind"])
