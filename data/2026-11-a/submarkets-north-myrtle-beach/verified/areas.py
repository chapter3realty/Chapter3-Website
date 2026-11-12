"""The parts of North Myrtle Beach, shared by the scripts. Every home inside the city limits (county layer 31) gets one part:
  across   - across the Intracoastal Waterway from the ocean (a line from the home toward the ocean crosses the county's waterway outline)
  west17   - between US 17 and the waterway (the line crosses US 17, county roads layer 18: N HWY 17, S HWY 17, HWY 17)
  neck     - Little River Neck: the county appraisal sub-area LRN (MarketSubArea), by the 7 nearest houses for a condo or townhouse
  cg, til, od, cb, wh - on the beach side of US 17: the historic section whose recorded original plat is nearest
            (legal descriptions naming CHERRY GROVE or FUTCH -> cg, TILGHMAN -> til, OCEAN DRIVE -> od, CRESCENT -> cb, WINDY HILL -> wh)
The ocean direction is perpendicular to the shore (shore bearing 66 degrees, Windy Hill to Cherry Grove plats)."""
import math, collections
import numpy as np
from shapely.geometry import Polygon, Point, LineString
from shapely.ops import unary_union
from shapely.prepared import prep
NAMES = {"cg": "Cherry Grove", "neck": "Little River Neck", "til": "Tilghman Beach", "od": "Ocean Drive", "cb": "Crescent Beach", "wh": "Windy Hill",
         "west17": "West of US 17", "across": "Across the waterway"}
ORDER = ["cg", "neck", "til", "od", "cb", "wh", "west17", "across"]
K = math.cos(math.radians(33.82)); B = math.radians(66); OX, OY = math.cos(B), -math.sin(B)   # toward the ocean (south-southeast), x in km-equivalent
def poly(rings):
    g = None
    for r in rings:
        p = Polygon(r).buffer(0); g = p if g is None else g.symmetric_difference(p)
    return g
def plat(legal):
    L = (legal or "").upper()
    if " AT WH" in L: return "wh"   # verifier fix: "CRESCENT SANDS AT WH" is a Windy Hill condo, not a Crescent Beach plat
    for k, v in (("CHERRY GROVE", "cg"), ("FUTCH", "cg"), ("TILGHMAN", "til"), ("OCEAN DRIVE", "od"), ("O D B", "od"), ("OD BEACH", "od"), ("CRESCENT", "cb"), ("WINDY HILL", "wh")):
        if k in L: return v
def assign(P, munis, roads, hydro):
    city_g = poly(munis[0]["geometry"]["rings"]); city = prep(city_g)
    icw = prep(poly([r for h in hydro if h["attributes"]["NAME"] == "Intracoastal Waterway" for r in h["geometry"]["rings"]]))
    us17 = prep(unary_union([LineString(p) for f in roads if f["attributes"]["FULLNAME"] in ("N HWY 17", "S HWY 17", "HWY 17") for p in f["geometry"]["paths"]]))
    inn = [p for p in P if p.get("c") and city.contains(Point(p["c"]["x"], p["c"]["y"]))]
    def ray(x, y, d=0.12): return LineString([(x, y), (x + OX * d / K, y + OY * d)])
    for p in inn:
        x, y = p["c"]["x"], p["c"]["y"]; r = ray(x, y)
        p["area"] = "across" if icw.intersects(r) else ("west17" if us17.intersects(r) else None)
    # beach side: nearest plat, and Little River Neck by the county sub-area of nearby houses
    plats = [(p["c"]["x"] * K, p["c"]["y"], plat(p["LegalDescr"])) for p in inn if p["area"] is None and plat(p["LegalDescr"])]
    PA = np.array([[a, b] for a, b, _ in plats]); PL = [c for _, _, c in plats]
    hs = [p for p in inn if p["area"] is None and p["LandUseCode"] in ("100", "101", "102", "110", "126", "120", "121", "122", "130")]
    HA = np.array([[p["c"]["x"] * K, p["c"]["y"]] for p in hs]); HL = [p["MarketSubArea"] for p in hs]
    for p in inn:
        if p["area"]: continue
        v = np.array([p["c"]["x"] * K, p["c"]["y"]])
        if p in hs or True:
            d = ((HA - v) ** 2).sum(1); idx = np.argsort(d)[:7]
            sub = p["MarketSubArea"] if p["LandUseCode"] in ("100", "101", "102", "110", "126", "120", "121", "122", "130") else collections.Counter(HL[i] for i in idx).most_common(1)[0][0]
        if sub == "LRN": p["area"] = "neck"; continue
        d = ((PA - v) ** 2).sum(1); p["area"] = PL[int(np.argmin(d))]
    return inn, city_g
