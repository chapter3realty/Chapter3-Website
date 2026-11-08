"""Walk to the nearest public beach access, for houses for sale within 1.5 miles of the ocean (pull_walks.py).
Run: RAW=<scratch> python3 -I analyze_walks.py <datadir> -> walk-findings.json (aggregates only)."""
import json, os, sys, math, statistics as st, collections
from shapely.geometry import shape, Point
from shapely.ops import transform
RAW = os.environ["RAW"]; D = sys.argv[1]
C = math.cos(math.radians(33.65)); P = lambda x, y, z=None: ((x + 79.0) * 69.17 * C, (y - 33.65) * 69.0)
coast = transform(P, shape(json.load(open(D + "/coast.geojson"))["features"][0]["geometry"]))
F = json.load(open(D + "/findings.json")); cuts = F["stretch_cuts_miles_from_south_end"]
STRETCH = [("North Myrtle Beach and Cherry Grove", cuts["Briarcliffe Acres"], 999), ("Myrtle Beach", cuts["Surfside Beach north edge (Ocean Lakes line)"], cuts["Briarcliffe Acres"]),
           ("Surfside Beach, Garden City and Murrells Inlet", cuts["Murrells Inlet jetty (Garden City end)"], cuts["Surfside Beach north edge (Ocean Lakes line)"]),
           ("Litchfield and Pawleys Island (Georgetown County)", -1, cuts["Murrells Inlet jetty (Garden City end)"])]
def stretch(lon, lat):
    a = coast.project(Point(*P(lon, lat)))
    for n, lo, hi in STRETCH:
        if lo <= a < hi: return n
L = json.load(open(os.path.join(RAW, "pins.json"))); pins = L["pins"]; nohoa = set(L["sets"]["no_hoa"]["mls"])
W = json.load(open(os.path.join(RAW, "walks.json")))
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
MI = 1609.344
BANDS = [(0, .25, "under 1/4 mile"), (.25, .5, "1/4 to 1/2 mile"), (.5, 1, "1/2 to 1 mile"), (1, 99, "over 1 mile")]
rows = []
for m, w in W.items():
    x = pins.get(m)
    if not x or w.get("walk_m") is None: continue
    walk = (w["walk_m"] + (w.get("snap_m") or 0)) / MI   # add the straight step from the house point to the nearest mapped path
    p = num(x["price"]); sq = num(x["sqft"])
    b = next(n for a, c, n in BANDS if a <= walk < c)
    rows.append({"walk": walk, "b": b, "p": p, "ppsf": p / sq if p and sq and sq > 300 else None, "s": stretch(x["lng"], x["lat"]), "nohoa": m in nohoa,
                 "line": coast.distance(Point(*P(x["lng"], x["lat"]))), "cell": (round(x["lat"], 2), round(x["lng"], 2))})
def summ(rs):
    pr = [r["p"] for r in rs if r["p"]]
    return {"houses": len(rs), "median_ask": int(round(st.median(pr) / 5000) * 5000) if pr else None, "median_ask_per_sqft": round(st.median([r["ppsf"] for r in rs if r["ppsf"]])) if rs else None,
            "under_400k": sum(1 for v in pr if v < 400000), "under_500k": sum(1 for v in pr if v < 500000), "no_hoa": sum(1 for r in rs if r["nohoa"])}
out = {"method": "Shortest walk by the OpenStreetMap foot router from the house's map point to any of its 6 nearest SCDES public beach access points, plus the straight step to the nearest mapped path. Houses for sale (CRM map API, type=house) within 1.5 miles of the ocean in a straight line.",
       "houses_routed": len(rows), "by_walk_band": {n: summ([r for _, _, n in [(0, 0, n)] for r in rows if r["b"] == n]) for _, _, n in BANDS},
       "by_stretch": {s: {n: summ([r for r in rows if r["s"] == s and r["b"] == n]) for _, _, n in BANDS} for s, _, _ in STRETCH},
       "walk_vs_line": {"median_ratio_walk_to_line_for_line_under_half_mile": round(st.median([r["walk"] / max(r["line"], .02) for r in rows if r["line"] < .5]), 2),
                        "line_under_half_mile_but_walk_over_one_mile": sum(1 for r in rows if r["line"] < .5 and r["walk"] >= 1),
                        "line_under_half_mile": sum(1 for r in rows if r["line"] < .5),
                        "line_under_quarter_walk_over_one_by_cell": {f"{k[0]},{k[1]}": v for k, v in collections.Counter(r["cell"] for r in rows if r["line"] < .25 and r["walk"] >= 1).most_common()}},
       "note": "The foot router does not use roads or paths mapped as private (gated communities, campgrounds). A house in a gated place with its own beach path shows a long walk to a public access. Cells are 0.01-degree squares (about 0.7 by 0.6 mile) holding such houses."}
json.dump(out, open(D + "/walk-findings.json", "w"), indent=1); print(json.dumps(out, indent=1))
