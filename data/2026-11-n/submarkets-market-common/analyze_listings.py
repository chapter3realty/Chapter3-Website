#!/usr/bin/env python3
"""Active CRM listings (pull_listings.py) inside the three zoning districts (analyze.py's area), by part, neighborhood and kind,
in aggregate only: count, median and range of asking price, median asking price per square foot, beds, and the HOA fee bracket
(the first hoaMax threshold at which the listing appears in the site's own "HOA up to $X a month" filter; checked for house,
townhouse and condo; a listing never seen under $1,500 is 'over 1500 or not given').
Neighborhood: the county parcel the pin falls in (RAW/parcels.json), grouped as in analyze.py.
Run: RAW=<scratch> python3 -I analyze_listings.py <datadir>. Writes <datadir>/listings-findings.json. No MLS numbers or addresses are written."""
import sys, os, json, statistics, collections, re
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
from shapely.prepared import prep
from shapely.strtree import STRtree
D = sys.argv[1]; RAW = os.environ["RAW"]
sys.path.insert(0, D)
L = json.load(open(os.path.join(RAW, "listings-29577.json")))
def rings(g): return unary_union([Polygon(r).buffer(0) for r in g["rings"]])
Z = collections.defaultdict(list)
for f in json.load(open(os.path.join(RAW, "zoning.json"))): Z[f["attributes"]["ZONING_DIS"]].append(rings(f["geometry"]))
PARTS = {"town_center": prep(unary_union(Z["C6"])), "center_pointe": prep(unary_union(Z["CENTER POINTE PUD"])), "clemson_tract": prep(unary_union(Z["CLEMSON TRACT PUD"]))}
HOOD = [("Emmens Preserve", r"EMMENS P"), ("Cresswind", r"CRESSWIND"), ("Park Place", r"^PARK PLACE"), ("West Lake", r"^WEST LAKE"),
        ("Balmoral", r"^BALMORAL"), ("The Reserve at Market Common", r"^RESERVE"), ("Withers Preserve", r"WITHERS"),
        ("High Market (condos)", r"^HIGH MARKET"), ("Heritage of Coventry", r"COVENTRY"), ("Belle Harbor", r"BELLE HARBOR"),
        ("Sweetgrass Square", r"SWEETGRASS"), ("Town center streets (Market Common parcels R1 to R13)", r"MARKET COMMON|COMMON MARKET")]
def hood(legal):
    l = (legal or "").upper()
    for n, rx in HOOD:
        if re.search(rx, l): return n
    return "other"
P = [p for p in json.load(open(os.path.join(RAW, "parcels.json"))) if p.get("g")]
G = []
for p in P:
    try: G.append((rings(p["g"]), p))
    except Exception: pass
tree = STRtree([g for g, _ in G])
def parcel(pt):
    for i in tree.query(pt):
        g, p = G[i]
        if g.contains(pt): return p
    return None
rows = []
for m, h in L["homes"].items():
    if h["lat"] is None: continue
    pt = Point(h["lng"], h["lat"])
    part = next((k for k, v in PARTS.items() if v.contains(pt)), None)
    if not part: continue
    p = parcel(pt)
    rows.append(dict(h, m=m, part=part, hood=hood(p["LegalDescr"] if p else None), fee=L["hoa_first_threshold"].get(m)))
def grp(xs):
    pr = sorted(x["price"] for x in xs if x["price"]); pp = [x["price"] / x["sqft"] for x in xs if x["price"] and x.get("sqft")]
    sq = [x["sqft"] for x in xs if x.get("sqft")]
    fees = [x["fee"] for x in xs if x["fee"] is not None]
    return {"n": len(xs), "median_ask": statistics.median(pr) if pr else None, "min_ask": pr[0] if pr else None, "max_ask": pr[-1] if pr else None,
            "median_ask_per_sqft": round(statistics.median(pp)) if pp else None, "median_sqft": statistics.median(sq) if sq else None,
            "beds": dict(collections.Counter(x.get("beds") for x in xs)),
            "fee_bracket_top": dict(sorted(collections.Counter(x["fee"] if x["fee"] is not None else "over_1500_or_none" for x in xs).items(), key=lambda kv: str(kv[0]))),
            "median_fee_bracket_top": statistics.median(fees) if fees else None}
out = {"pulled": L["pulled"], "meta_source": L["meta"]["source"], "api_totals_zip_29577": L["api_totals_zip"],
       "in_area": len(rows), "hoa_thresholds": L["hoa_thresholds"],
       "note": "CRM public map API (CCMLS listings), ZIP 29577, kept when the pin is inside C6, CENTER POINTE PUD or CLEMSON TRACT PUD. Aggregate only. HOA bracket top = the first 'HOA up to' threshold where the listing appears (so the fee is at or under it and over the threshold before).",
       "groups": {}}
for z in ("all", "town_center", "center_pointe", "clemson_tract"):
    for k in ("all", "house", "townhouse", "condo", "land"):
        xs = [x for x in rows if (z == "all" or x["part"] == z) and (k == "all" or x["type"] == k)]
        if xs: out["groups"]["%s/%s" % (z, k)] = grp(xs)
for hname in sorted(set(x["hood"] for x in rows)):
    for k in ("all", "house", "townhouse", "condo"):
        xs = [x for x in rows if x["hood"] == hname and (k == "all" or x["type"] == k)]
        if xs: out["groups"]["hood:%s/%s" % (hname, k)] = grp(xs)
json.dump(out, open(os.path.join(D, "listings-findings.json"), "w"), indent=1)
for k, v in out["groups"].items(): print(k, v["n"], v["median_ask"], v["min_ask"], v["max_ask"], v["median_ask_per_sqft"], v["median_sqft"], v["fee_bracket_top"])
