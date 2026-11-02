#!/usr/bin/env python3
"""Findings for /submarkets/garden-city/ from Horry County parcels and deeds, FEMA zones (county layer 19), Census and NOAA.
Run: RAW=<scratch> SALES=<out-of-state-buyers.json> python3 -I analyze.py <datadir>
Writes <datadir>/findings.json (counts and medians only: no names, addresses, PINs or deed book and page)
and RAW/parcel-zones.json (per parcel, kept out of the repo) for the map."""
import sys, os, json, statistics, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zones import *
from shapely.geometry import Polygon, Point, shape
from shapely.strtree import STRtree
D = sys.argv[1]
# Land use codes on these parcels: 101 house lots, 107 condo and apartment units, 108 villa units, 135 townhouse units,
# 109 and 120 other residential (read from sample legal descriptions; the county publishes no code table on the layer).
def kind(p):
    c = p["LandUseCode"]; legal = p["LegalDescr"] or ""
    if c == "107" or "HPR" in legal: return "condo"
    if c == "101": return "house"
    return "other"
fema = [(shape({"type": "Polygon", "coordinates": f["geometry"]["rings"]}).buffer(0), f["attributes"]["FLD_ZONE"], f["attributes"]["STATIC_BFE"]) for f in J("fema.json") if f.get("geometry")]
ftree = STRtree([g for g, z, b in fema])
def fzone(pt):
    hits = [fema[i] for i in ftree.query(pt) if fema[i][0].contains(pt)]
    if not hits: return "none"
    order = {"VE": 0, "AE": 1, "AO": 2, "A": 3, "X": 4}
    return sorted([z for g, z, b in hits], key=lambda z: order.get(z, 9))[0]
wt = STRtree(list(getattr(WATER, "geoms", [WATER])))
def on_water(poly):
    for i in wt.query(poly.buffer(0.00018)):     # about 15 to 20 m
        if wt.geometries[i].distance(poly) < 0.00018: return True
    return False
rows = []
for p in J("parcels.json"):
    rr = (p.get("g") or {}).get("rings")
    if not rr: continue
    poly = Polygon(rr[0]).buffer(0); pt = poly.representative_point()
    if not CDP.contains(pt): continue
    z = zone(pt)
    ratio = (p["AssessedProp"] / p["TaxableProp"]) if p["TaxableProp"] else None
    r = {"pin": int(p["PIN"]), "zone": z, "kind": kind(p), "x": round(pt.x, 6), "y": round(pt.y, 6), "fz": fzone(pt),
         "own": None if ratio is None else ("4" if abs(ratio - 0.04) < 0.003 else ("6" if abs(ratio - 0.06) < 0.003 else "other")),
         "state": (p["OwnerState"] or "").strip().upper(), "mkt": p["MarketProp"],
         "water": z == "middle" and on_water(poly)}
    rows.append(r)
json.dump(rows, open(os.path.join(RAW, "parcel-zones.json"), "w"))
def pct(a, b): return round(100 * a / b, 1) if b else None
def summ(xs):
    n = len(xs)
    st = collections.Counter(x["state"] for x in xs)
    return {"homes": n, "owner_occupied_4pct": sum(x["own"] == "4" for x in xs), "pct_owner_occupied": pct(sum(x["own"] == "4" for x in xs), n),
            "rate_6pct": sum(x["own"] == "6" for x in xs), "rate_other": sum(x["own"] == "other" for x in xs),
            "tax_bill_outside_sc": n - st.get("SC", 0) - st.get("", 0), "pct_tax_bill_outside_sc": pct(n - st.get("SC", 0) - st.get("", 0), n),
            "blank_state": st.get("", 0), "top_states": st.most_common(8),
            "fema": dict(collections.Counter(x["fz"] for x in xs)), "pct_high_risk": pct(sum(x["fz"] in ("VE", "AE", "AO", "A") for x in xs), n),
            "pct_ve": pct(sum(x["fz"] == "VE" for x in xs), n),
            "median_county_market_value": statistics.median([x["mkt"] for x in xs if x["mkt"]]) if xs else None}
F = {"made": "analyze.py", "stock": {}, "sales": {}}
for z in ("beach", "middle", "inland", None):
    for k in ("all", "condo", "house", "other"):
        xs = [x for x in rows if x["zone"] == z and (k == "all" or x["kind"] == k)]
        if xs: F["stock"]["%s/%s" % (z, k)] = summ(xs)
F["stock"]["middle/on_water/house"] = summ([x for x in rows if x["zone"] == "middle" and x["water"] and x["kind"] == "house"])
F["stock"]["middle/on_water/all"] = summ([x for x in rows if x["zone"] == "middle" and x["water"]])
F["stock"]["middle/off_water/house"] = summ([x for x in rows if x["zone"] == "middle" and not x["water"] and x["kind"] == "house"])
F["stock"]["cdp/all"] = summ(rows)
F["stock"]["east_of_bus17/all"] = summ([x for x in rows if x["zone"] in ("beach", "middle")])
for k in ("condo", "house", "other"):
    F["stock"]["cdp/" + k] = summ([x for x in rows if x["kind"] == k])
# Deed sales recorded 2025-10-01 to 2026-09-30 (the 2026-10-d pull), inside the 2020 Census place
S = json.load(open(os.environ["SALES"]))
byz = {(x["zone"]): x for x in rows}
pz = {x["pin"]: x for x in rows}
sales = []
for s in S["sales"]:
    if s.get("lon") is None: continue
    pt = Point(s["lon"], s["lat"])
    if not CDP.contains(pt): continue
    p = pz.get(int(s["pin"]))
    z = p["zone"] if p else zone(pt)
    k = p["kind"] if p else ("condo" if s["condo"] else "other")
    sales.append({"zone": z, "kind": k, "price": s["cons"], "builder": s["builder"], "where": s["where"], "water": bool(p and p["water"]), "fz": p["fz"] if p else None, "month": s["date"][:7]})
def ss(xs):
    pr = sorted(x["price"] for x in xs)
    if not pr: return {"sales": 0}
    q = statistics.quantiles(pr, n=4) if len(pr) >= 4 else [pr[0], statistics.median(pr), pr[-1]]
    return {"sales": len(pr), "median": statistics.median(pr), "p25": q[0], "p75": q[2], "min": pr[0], "max": pr[-1],
            "builder": sum(x["builder"] for x in xs), "buyer_outside_sc": sum(x["where"] in ("US", "CANADA", "OTHER") for x in xs), "buyer_sc": sum(x["where"] == "SC" for x in xs)}
for z in ("beach", "middle", "inland"):
    for k in ("all", "condo", "house", "other"):
        F["sales"]["%s/%s" % (z, k)] = ss([x for x in sales if x["zone"] == z and (k == "all" or x["kind"] == k)])
F["sales"]["middle/on_water/house"] = ss([x for x in sales if x["zone"] == "middle" and x["water"] and x["kind"] == "house"])
F["sales"]["middle/off_water/house"] = ss([x for x in sales if x["zone"] == "middle" and not x["water"] and x["kind"] == "house"])
F["sales"]["cdp/all"] = ss(sales)
F["sales_note"] = "Horry County deeds recorded 2025-10-01 to 2026-09-30, home sales of $10,000 or more on one residential parcel with a building (filters in data/2026-10-d/sell-out-of-state-buyers/README.md), point inside the 2020 Garden City CDP."
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
for k, v in F["stock"].items(): print("STOCK", k, {kk: v[kk] for kk in ("homes", "pct_owner_occupied", "pct_tax_bill_outside_sc", "pct_high_risk", "pct_ve", "median_county_market_value")}, v["fema"])
for k, v in F["sales"].items(): print("SALES", k, v)
