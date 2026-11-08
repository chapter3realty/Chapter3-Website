#!/usr/bin/env python3
"""Findings for /submarkets/myrtle-beach/market-common/ from Horry County parcels, deeds and FEMA zones, and the city's zoning.
Run: RAW=<scratch> SALES=<web>/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json \
     ATTRS=<web>/data/2026-10-d/buyers-first-time-home-buyer-myrtle-beach/raw/parcel-attrs.json python3 -I analyze.py <this dir>
Inputs in RAW (fetch_gis.py): zoning.json, parcels.json, fema.json.
The area: the three City of Myrtle Beach zoning districts drawn on the former air base's homes: C6 (the town center), CENTER POINTE PUD
and CLEMSON TRACT PUD. A parcel is in a district when its representative point is inside the district polygon.
Home = land use code 1xx with a county building value (MarketImprv > 0). Kind: condo = 107 or 135, or 'HPR' in the legal description;
townhouse = 109; house = 101, 102, 110, 126; code100 = a lot still coded 100 (vacant) that has a building value (new homes not yet recoded); other = the rest. (Codes as read in the 2026-10-d ledgers, from samples.)
Main home = assessed at the 4 percent ratio (AssessedProp / TaxableProp under 0.05).
Neighborhood = the county legal description's first words, grouped by the rules in HOOD below.
Sales = the reused deed file (Horry County deeds recorded 2025-10-01 to 2026-09-30, $10,000 or more, one residential parcel with a building),
matched to these parcels by PIN. For Carolina Forest CDP and Surfside Beach town the deed file's Census place is used, with land use
codes from ATTRS. Writes findings.json, map-layers.geojson. No names, addresses, PINs or deed book and page are written."""
import sys, os, json, re, statistics, collections
from shapely.geometry import Polygon, Point, mapping, shape
from shapely.ops import unary_union
from shapely.prepared import prep
D = sys.argv[1]; RAW = os.environ["RAW"]
J = lambda n: json.load(open(os.path.join(RAW, n)))
def rings(g): return unary_union([Polygon(r).buffer(0) for r in g["rings"]])
Z = collections.defaultdict(list)
for f in J("zoning.json"): Z[f["attributes"]["ZONING_DIS"]].append(rings(f["geometry"]))
PARTS = {"town_center": unary_union(Z["C6"]), "center_pointe": unary_union(Z["CENTER POINTE PUD"]), "clemson_tract": unary_union(Z["CLEMSON TRACT PUD"])}
PP = {k: prep(v) for k, v in PARTS.items()}
ALL = unary_union(list(PARTS.values()))
HOOD = [("Emmens Preserve", r"EMMENS P"), ("Cresswind", r"CRESSWIND"), ("Park Place", r"^PARK PLACE"), ("West Lake", r"^WEST LAKE"),
        ("Balmoral", r"^BALMORAL"), ("The Reserve at Market Common", r"^RESERVE"), ("Withers Preserve", r"WITHERS"),
        ("High Market (condos)", r"^HIGH MARKET"), ("Heritage of Coventry", r"COVENTRY"), ("Belle Harbor", r"BELLE HARBOR"),
        ("Sweetgrass Square", r"SWEETGRASS"), ("Town center streets (Market Common parcels R1 to R13)", r"MARKET COMMON|COMMON MARKET")]
def hood(legal):
    l = (legal or "").upper()
    for n, rx in HOOD:
        if re.search(rx, l): return n
    return "other: " + re.split(r"[;#,]| LOT | LT | UNIT ", l)[0].strip()[:30]
def kind(p):
    c = p["LandUseCode"] or ""; legal = (p["LegalDescr"] or "").upper()
    if c == "117": return "other"
    if c in ("107", "135") or "HPR" in legal: return "condo"
    if c == "109": return "townhouse"
    if c == "100": return "code100"  # a lot coded vacant that has a building value: new homes the county has not yet recoded (house or townhome)
    if c in ("101", "102", "110", "126"): return "house"
    return "other"
fema = []
for f in J("fema.json"):
    a = f["attributes"]
    try: fema.append((a["FLD_ZONE"], a["SFHA_TF"], a.get("STATIC_BFE"), prep(rings(f["geometry"]))))
    except Exception: pass
def fz(pt):
    for z, t, b, g in fema:
        if g.contains(pt): return z, t
    return "none", "F"
homes = []; geoms = collections.defaultdict(list); lots = collections.Counter()
for p in J("parcels.json"):
    if not p.get("g"): continue
    try: g = rings(p["g"])
    except Exception: continue
    pt = g.representative_point()
    part = next((k for k, v in PP.items() if v.contains(pt)), None)
    if not part: continue
    lu = p["LandUseCode"] or ""
    if lu.startswith("1") and not (p["MarketImprv"] or 0) > 0: lots[part] += 1
    if not (lu.startswith("1") and (p["MarketImprv"] or 0) > 0): continue
    k = kind(p); h = hood(p["LegalDescr"]); z, t = fz(pt)
    ratio = (p["AssessedProp"] or 0) / p["TaxableProp"] if p["TaxableProp"] else None
    homes.append({"pin": str(p["PIN"]), "part": part, "kind": k, "hood": h, "zone": z, "sfha": t == "T", "main": ratio is not None and ratio < 0.05,
                  "out_sc": (p["OwnerState"] or "SC").strip().upper() not in ("SC", ""), "mkt": p["MarketProp"], "lon": pt.x, "lat": pt.y})
    geoms[h].append(g)
def stock(xs):
    n = len(xs)
    return {"homes": n, "by_kind": dict(collections.Counter(x["kind"] for x in xs)), "pct_main_home": round(100 * sum(x["main"] for x in xs) / n, 1) if n else None,
            "pct_tax_bill_outside_sc": round(100 * sum(x["out_sc"] for x in xs) / n, 1) if n else None,
            "in_fema_high_risk": sum(x["sfha"] for x in xs), "fema_zones": dict(collections.Counter(x["zone"] for x in xs)),
            "median_county_market_value": statistics.median([x["mkt"] for x in xs if x["mkt"]]) if n else None}
F = {"area_note": "City of Myrtle Beach zoning districts C6, CENTER POINTE PUD and CLEMSON TRACT PUD (terra.cityofmyrtlebeach.com ZONING_DISTRICTS_MB), read 2026-11-08.",
     "area_sq_mi": {k: round(v.area * (69.05 * 57.6), 2) for k, v in PARTS.items()}, "vacant_res_parcels": dict(lots)}
F["stock"] = {"all": stock(homes)}
for part in PARTS: F["stock"][part] = stock([x for x in homes if x["part"] == part])
for k in ("house", "townhouse", "condo", "code100"): F["stock"]["kind/" + k] = stock([x for x in homes if x["kind"] == k])
F["stock_by_hood"] = {h: dict(stock([x for x in homes if x["hood"] == h]), part=collections.Counter(x["part"] for x in homes if x["hood"] == h).most_common(1)[0][0])
                      for h in sorted(set(x["hood"] for x in homes))}
# Sales
S = json.load(open(os.environ["SALES"]))["sales"]
byp = {x["pin"]: x for x in homes}
def med(v): return statistics.median(v) if v else None
def sales_summary(rows):
    out = {}
    for k in ("all", "house", "townhouse", "condo", "code100"):
        for b in ("all", "resale", "builder"):
            xs = [r for r in rows if (k == "all" or r["kind"] == k) and (b == "all" or (b == "builder") == r["builder"])]
            if xs: out[k + "/" + b] = {"n": len(xs), "median": med([r["price"] for r in xs]), "p25": sorted(r["price"] for r in xs)[len(xs) // 4],
                                       "p75": sorted(r["price"] for r in xs)[(3 * len(xs)) // 4], "min": min(r["price"] for r in xs), "max": max(r["price"] for r in xs)}
    return out
mc = []
for s in S:
    h = byp.get(str(s["pin"]))
    if h: mc.append({"price": s["cons"], "builder": bool(s["builder"]), "kind": h["kind"], "hood": h["hood"], "part": h["part"], "month": s["date"][:7]})
F["sales_note"] = "Horry County deeds recorded 2025-10-01 to 2026-09-30 in the reused file data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json, matched by PIN to the homes above."
F["sales"] = {"all": sales_summary(mc)}
for part in PARTS: F["sales"][part] = sales_summary([r for r in mc if r["part"] == part])
F["sales_by_hood"] = {h: sales_summary([r for r in mc if r["hood"] == h]) for h in sorted(set(r["hood"] for r in mc))}
A = {str(r["PIN"]): r for r in json.load(open(os.environ["ATTRS"]))["rows"]} if os.environ.get("ATTRS") else {}
def kind_attr(s):
    a = A.get(str(s["pin"]))
    if not a: return None
    return kind({"LandUseCode": a.get("LandUseCode"), "LegalDescr": s.get("legal")})
cmp = {}
for place, key in (("Carolina Forest CDP", "carolina_forest"), ("Surfside Beach town", "surfside_beach"), ("Myrtle Beach city", "myrtle_beach_city")):
    rows = []
    for s in S:
        if s.get("place") != place: continue
        k = kind_attr(s)
        if k: rows.append({"price": s["cons"], "builder": bool(s["builder"]), "kind": k})
    cmp[key] = sales_summary(rows); cmp[key]["matched_sales"] = len(rows)
F["compare_sales"] = cmp
F["compare_note"] = "Same deed file; Census place from the file; land use code from data/2026-10-d/buyers-first-time-home-buyer-myrtle-beach/raw/parcel-attrs.json (county layer 24, read 2026-11-01)."
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
# Map layers: one outline per neighborhood (union of its parcels, smoothed), the three districts
feats = [{"type": "Feature", "properties": {"layer": "district", "name": k}, "geometry": mapping(v.simplify(0.00005))} for k, v in PARTS.items()]
for h, gs in geoms.items():
    if h.startswith("other"): continue
    u = unary_union([g.buffer(0.00012) for g in gs]).buffer(-0.0001).simplify(0.00004)
    feats.append({"type": "Feature", "properties": {"layer": "hood", "name": h, "homes": len(gs)}, "geometry": mapping(u)})
json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(D, "map-layers.geojson"), "w"))
print(json.dumps({k: F[k] for k in ("area_sq_mi", "vacant_res_parcels", "stock")}, indent=0)[:5000])
for h, v in F["stock_by_hood"].items(): print("HOOD", h, v["homes"], v["by_kind"], v["pct_main_home"], v["in_fema_high_risk"], v["part"])
for k, v in F["sales"].items(): print("SALES", k, {kk: (vv["n"], vv["median"]) for kk, vv in v.items()})
for k, v in F["sales_by_hood"].items(): print("HSALES", k, {kk: (vv["n"], vv["median"]) for kk, vv in v.items()})
for k, v in cmp.items(): print("CMP", k, {kk: ((vv["n"], vv["median"]) if isinstance(vv, dict) else vv) for kk, vv in v.items()})
