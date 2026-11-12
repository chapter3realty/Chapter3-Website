#!/usr/bin/env python3
"""Findings for /submarkets/surfside-beach/ from Horry County parcels and deeds, FEMA zones (county layer 19) and the town's zoning map.
Run: RAW=<scratch> SALES=<out-of-state-buyers.json> python3 -I analyze.py <datadir>
Inputs in RAW: parcels.json, fema.json, roads.json (fetch_county.py); town-limits.geojson (county layer 31); zoning-polys.geojson (georef_zoning.py).
A home is a parcel with a county land-use code starting with 1 and a building value above 0 whose inside point is in the
town limits (county layer 31). Its zoning district is the district covering the largest share of its parcel polygon.
Kind: condo = land-use code 107 or "HPR" in the legal description; house = code 101; other = every other 1xx code
(duplex halves, attached and townhouse lots, small multi-unit lots).
Ocean side = the parcel's inside point is on the ocean side of Ocean Boulevard (N and S OCEAN BLVD in county layer 18).
Writes <datadir>/findings.json (counts and medians only: no names, addresses, PINs or deed book and page)
and RAW/parcel-zones.json (per parcel, kept out of the repo) for the map."""
import sys, os, json, statistics, collections, math
from shapely.geometry import Polygon, Point, shape, LineString
from shapely.strtree import STRtree
from shapely.ops import nearest_points
RAW = os.environ["RAW"]; D = sys.argv[1]
J = lambda n: json.load(open(os.path.join(RAW, n)))
town = shape(J("town-limits.geojson")["features"][0]["geometry"])
Z = J("zoning-polys.geojson")["features"]; zg = [shape(f["geometry"]) for f in Z]; zn = [f["properties"]["zone"] for f in Z]
fema = [(shape({"type": "Polygon", "coordinates": f["geometry"]["rings"]}).buffer(0), f["attributes"]["FLD_ZONE"]) for f in J("fema.json") if f.get("geometry")]
ftree = STRtree([g for g, z in fema])
def fzone(pt):
    hits = [fema[i][1] for i in ftree.query(pt) if fema[i][0].contains(pt)]
    if not hits: return "none"
    order = {"VE": 0, "AE": 1, "AO": 2, "A": 3, "X": 4}
    return sorted(hits, key=lambda z: order.get(z, 9))[0]
ob = [LineString(p) for f in J("roads.json") if (f["attributes"].get("FULLNAME") or "") in ("N OCEAN BLVD", "S OCEAN BLVD") for p in f["geometry"]["paths"]]
obt = STRtree(ob)
def ocean_side(pt):
    l = ob[obt.nearest(pt)]; q = nearest_points(l, pt)[0]
    d = l.project(q)
    if (d < 0.00005 or d > l.length - 0.00005) and q.distance(pt) > 0.0002: return False   # past the end of Ocean Boulevard
    a = l.interpolate(max(0, d - 0.0003)); b = l.interpolate(min(l.length, d + 0.0003))
    tx, ty = b.x - a.x, b.y - a.y
    if tx < 0: tx, ty = -tx, -ty          # point the tangent north-east
    nx, ny = ty, -tx                       # right-hand normal of a north-east tangent points south-east, to the ocean
    return (pt.x - q.x) * nx + (pt.y - q.y) * ny > 0
def zone_of(poly):
    ov = collections.Counter()
    for i in range(len(zg)):
        a = zg[i].intersection(poly).area
        if a > 0: ov[zn[i]] += a
    if not ov: return "none", 0.0
    z, a = ov.most_common(1)[0]; return z, a / poly.area
def kind(p):
    c = p["LandUseCode"]; legal = p["LegalDescr"] or ""
    if c == "107" or "HPR" in legal: return "condo"
    if c == "101": return "house"
    return "other"
rows = []
for p in J("parcels.json"):
    rr = (p.get("g") or {}).get("rings")
    if not rr: continue
    poly = Polygon(rr[0]).buffer(0); pt = poly.representative_point()
    if not town.contains(pt): continue
    z, share = zone_of(poly)
    ratio = (p["AssessedProp"] / p["TaxableProp"]) if p["TaxableProp"] else None
    rows.append({"pin": int(p["PIN"]), "zone": z, "zone_share": round(share, 3), "kind": kind(p), "x": round(pt.x, 6), "y": round(pt.y, 6), "fz": fzone(pt),
                 "ocean": ocean_side(pt), "own": None if ratio is None else ("4" if abs(ratio - 0.04) < 0.003 else ("6" if abs(ratio - 0.06) < 0.003 else "other")),
                 "state": (p["OwnerState"] or "").strip().upper(), "mkt": p["MarketProp"], "lu": p["LandUseCode"]})
json.dump(rows, open(os.path.join(RAW, "parcel-zones.json"), "w"))
def pct(a, b): return round(100 * a / b, 1) if b else None
def summ(xs):
    n = len(xs); st = collections.Counter(x["state"] for x in xs)
    return {"homes": n, "owner_occupied_4pct": sum(x["own"] == "4" for x in xs), "pct_owner_occupied": pct(sum(x["own"] == "4" for x in xs), n),
            "rate_6pct": sum(x["own"] == "6" for x in xs), "rate_other": sum(x["own"] == "other" for x in xs),
            "tax_bill_outside_sc": n - st.get("SC", 0) - st.get("", 0), "pct_tax_bill_outside_sc": pct(n - st.get("SC", 0) - st.get("", 0), n), "top_states": st.most_common(6),
            "fema": dict(collections.Counter(x["fz"] for x in xs)), "pct_high_risk": pct(sum(x["fz"] in ("VE", "AE", "AO", "A") for x in xs), n),
            "zone_share_under_80pct": sum(x["zone_share"] < 0.8 for x in xs),
            "median_county_market_value": statistics.median([x["mkt"] for x in xs if x["mkt"]]) if xs else None}
GROUPS = {"town": lambda x: True, "R3": lambda x: x["zone"] == "R3", "R1": lambda x: x["zone"] == "R1", "R2": lambda x: x["zone"] == "R2",
          "R1R2": lambda x: x["zone"] in ("R1", "R2"), "C3": lambda x: x["zone"] == "C3", "R3C3": lambda x: x["zone"] in ("R3", "C3"),
          "PD": lambda x: x["zone"] == "PD", "C1": lambda x: x["zone"] == "C1", "other_zone": lambda x: x["zone"] not in ("R1", "R2", "R3", "C3", "PD", "C1"),
          "ocean_side": lambda x: x["ocean"], "R3_not_ocean_side": lambda x: x["zone"] == "R3" and not x["ocean"]}
F = {"made": "analyze.py", "zones_count": dict(collections.Counter(x["zone"] for x in rows)), "stock": {}, "sales": {}}
for g, fn in GROUPS.items():
    for k in ("all", "condo", "house", "other"):
        xs = [x for x in rows if fn(x) and (k == "all" or x["kind"] == k)]
        if xs: F["stock"]["%s/%s" % (g, k)] = summ(xs)
S = json.load(open(os.environ["SALES"]))
pz = {x["pin"]: x for x in rows}
sales = []
for s in S["sales"]:
    if s.get("lon") is None: continue
    pt = Point(s["lon"], s["lat"])
    p = pz.get(int(s["pin"]))
    if not p and not town.contains(pt): continue
    if not p: continue   # sale of a parcel not in the current residential layer (merged or recoded); counted separately
    sales.append({"zone": p["zone"], "kind": p["kind"], "ocean": p["ocean"], "price": s["cons"], "builder": s["builder"], "where": s["where"], "own_grantee": s["owner_is_grantee"], "fz": p["fz"], "month": s["date"][:7]})
F["sales_unmatched_in_town"] = sum(1 for s in S["sales"] if s.get("lon") is not None and int(s["pin"]) not in pz and town.contains(Point(s["lon"], s["lat"])))
def ss(xs):
    pr = sorted(x["price"] for x in xs)
    if not pr: return {"sales": 0}
    q = statistics.quantiles(pr, n=4) if len(pr) >= 4 else [pr[0], statistics.median(pr), pr[-1]]
    g = [x for x in xs if x["own_grantee"]]
    return {"sales": len(pr), "median": statistics.median(pr), "p25": q[0], "p75": q[2], "min": pr[0], "max": pr[-1], "builder": sum(x["builder"] for x in xs),
            "matched_grantee": len(g), "buyer_outside_sc": sum(x["where"] in ("US", "CANADA", "OTHER") for x in g), "buyer_sc": sum(x["where"] == "SC" for x in g)}
for g, fn in GROUPS.items():
    for k in ("all", "condo", "house", "other"):
        F["sales"]["%s/%s" % (g, k)] = ss([x for x in sales if fn(x) and (k == "all" or x["kind"] == k)])
F["sales_note"] = "Horry County deeds recorded 2025-10-01 to 2026-09-30, home sales of $10,000 or more on one residential parcel with a building (filters in data/2026-10-d/sell-out-of-state-buyers/README.md), on a parcel inside the Town of Surfside Beach limits (county layer 31)."
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(F["zones_count"])
for k, v in F["stock"].items():
    if k.endswith(("/all", "/house", "/condo")): print("STOCK", k, {kk: v[kk] for kk in ("homes", "pct_owner_occupied", "pct_tax_bill_outside_sc", "pct_high_risk", "zone_share_under_80pct", "median_county_market_value")})
for k, v in F["sales"].items():
    if v["sales"]: print("SALES", k, {kk: v.get(kk) for kk in ("sales", "median", "p25", "p75", "min", "max", "builder", "matched_grantee", "buyer_outside_sc")})
print("unmatched", F["sales_unmatched_in_town"])
