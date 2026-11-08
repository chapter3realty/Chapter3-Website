#!/usr/bin/env python3
"""Fix round 1 (2026-11-08): per neighborhood, the median lot size of its houses (county parcel Acreage, or the parcel outline's
area when Acreage is empty) and the county's common-area parcels whose legal description says AMENITY AREA or RESIDENTS CLUB
(or the one HOA parcel coded 388 in The Reserve), with their centre points. What stands on each amenity parcel was read by eye
on the USDA NAIP 2023 aerial (public domain; images/amenity-tiles.py) and is written in AERIAL below.
Run: RAW=<scratch> python3 -I hood_details.py <this dir>   (same RAW inputs and rules as analyze.py). Writes hood-details.json."""
import sys, os, json, re, statistics, collections, math
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely.prepared import prep
D = sys.argv[1]; RAW = os.environ["RAW"]
J = lambda n: json.load(open(os.path.join(RAW, n)))
src = open(os.path.join(D, "analyze.py")).read()
exec(src[src.index("HOOD = ["):src.index("fema = []")])          # the same HOOD, hood() and kind() as analyze.py
def rings(g): return unary_union([Polygon(r).buffer(0) for r in g["rings"]])
Z = collections.defaultdict(list)
for f in J("zoning.json"): Z[f["attributes"]["ZONING_DIS"]].append(rings(f["geometry"]))
ALL = prep(unary_union(Z["C6"] + Z["CENTER POINTE PUD"] + Z["CLEMSON TRACT PUD"]))
ACRE_M2 = 4046.856
def acres(p, g):
    if p.get("Acreage"): return p["Acreage"]
    lat = g.centroid.y; k = 111320 * 110574 * math.cos(math.radians(lat))   # square degrees to square metres, near enough at this size
    return g.area * k / ACRE_M2
lots = collections.defaultdict(list); amen = []
for p in J("parcels.json"):
    if not p.get("g"): continue
    try: g = rings(p["g"])
    except Exception: continue
    pt = g.representative_point()
    legal = (p.get("LegalDescr") or "").upper(); lu = p.get("LandUseCode") or ""
    if re.search(r"AMENITY AREA|RESIDENTS CLUB", legal) or (legal.startswith("THE RESERVE; C/A") and lu == "388"):
        if ALL.contains(pt) or any(s in legal for s in ("BELLE HARBOR", "CRESSWIND", "EMMENS", "BALMORAL", "MBAFB", "PARK PLACE", "RESERVE")):
            amen.append({"legal": legal, "code": lu, "lon": round(pt.x, 6), "lat": round(pt.y, 6)})
        continue
    if not ALL.contains(pt) or not (lu.startswith("1") and (p.get("MarketImprv") or 0) > 0): continue
    if kind(p) != "house": continue
    lots[hood(p["LegalDescr"])].append(acres(p, g))
AERIAL = {  # read by eye on NAIP 2023 tiles, 300 m square, centred on each amenity parcel (fix1 naip/*.jpg); the neighborhood is
            # the one whose houses surround the parcel (all houses within 150 m share its legal-description group)
  "Cresswind": "a large clubhouse building, an outdoor pool, tennis and pickleball courts and a lake with a path",
  "Emmens Preserve": "an outdoor pool with a pool house beside a lake (RESIDENTS CLUB), and a park with a pavilion and paths (AMENITY AREA)",
  "Belle Harbor": "an outdoor pool with a small clubhouse and a sports court",
  "Balmoral": "an outdoor pool with a pool house",
  "Park Place": "an outdoor pool with a pool house",
  "The Reserve at Market Common": "an outdoor pool with a pool house, beside a lake",
}
out = {"made": "2026-11-08", "lot_acres_house_median": {h: round(statistics.median(v), 3) for h, v in lots.items() if len(v) >= 20},
       "houses_counted": {h: len(v) for h, v in lots.items() if len(v) >= 20}, "amenity_parcels": amen, "aerial_reading": AERIAL}
json.dump(out, open(os.path.join(D, "hood-details.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
