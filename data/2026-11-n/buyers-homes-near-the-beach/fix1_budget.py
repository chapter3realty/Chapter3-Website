"""Fix round 1 (batch 2026-11-n): what a budget buys within a 10-minute walk of a public beach access, and where.
Same inputs and rules as analyze_walks.py and verify_campground.py (campground homes dropped). Also checks the live
North Myrtle Beach walk search under $400,000 (CRM map API) for campground homes and places each pin in the
North Myrtle Beach parts map (data/2026-11-a/submarkets-north-myrtle-beach/map-parts.geojson).
Run: RAW=<scratch> python3 -I fix1_budget.py <datadir> -> <datadir>/fix1-walk-budget.json (aggregates and street names only)."""
import json, os, re, sys, math, collections, statistics as st, urllib.request
from shapely.geometry import shape, Point
from shapely.ops import transform
RAW = os.environ["RAW"]; D = sys.argv[1]
C = math.cos(math.radians(33.65)); P = lambda x, y, z=None: ((x + 79.0) * 69.17 * C, (y - 33.65) * 69.0)
coast = transform(P, shape(json.load(open(D + "/coast.geojson"))["features"][0]["geometry"]))
cuts = json.load(open(D + "/findings.json"))["stretch_cuts_miles_from_south_end"]
def stretch(lon, lat):
    a = coast.project(Point(*P(lon, lat)))
    if a >= cuts["Briarcliffe Acres"]: return "North Myrtle Beach and Cherry Grove"
    if a >= cuts["Surfside Beach north edge (Ocean Lakes line)"]: return "Myrtle Beach"
    if a >= cuts["Murrells Inlet jetty (Garden City end)"]: return "Surfside Beach, Garden City and Murrells Inlet"
    return "Litchfield and Pawleys Island (Georgetown County)"
CAMP = re.compile(r"^\s*(6001\s*-|6001\b.*Kings H|9700\s+Kings R)", re.I)
L = json.load(open(os.path.join(RAW, "pins.json"))); pins = L["pins"]; W = json.load(open(os.path.join(RAW, "walks.json")))
num = lambda s: float(str(s).replace("$", "").replace(",", "")) if s else None
street = lambda a: re.sub(r"^[\dA-Z\- ]*?(?=[A-Z][a-z]|\d+(st|nd|rd|th)\b|[NSEW] )", "", a.split(",")[0].strip()).strip()
rows = []
for m, w in W.items():
    x = pins.get(m)
    if not x or w.get("walk_m") is None or CAMP.match(x.get("addr") or ""): continue
    rows.append({"walk": (w["walk_m"] + (w.get("snap_m") or 0)) / 1609.344, "p": num(x["price"]), "sqft": x["sqft"], "beds": x["beds"],
                 "s": stretch(x["lng"], x["lat"]), "street": street(x["addr"])})
def summ(rs):
    return {"houses": len(rs), "by_stretch": dict(collections.Counter(r["s"] for r in rs)), "median_sqft": round(st.median([r["sqft"] for r in rs if r["sqft"]]) / 10) * 10,
            "beds": dict(sorted(collections.Counter(r["beds"] for r in rs).items())),
            "streets_by_stretch": {s: collections.Counter(r["street"] for r in rs if r["s"] == s).most_common() for s in sorted({r["s"] for r in rs})}}
ten = [r for r in rows if r["walk"] < .5]
out = {"pulled": L["pulled"], "method": "Houses for sale (campground homes dropped) whose walk to the nearest public beach access is under half a mile (about 10 minutes), from walks.json and pins.json.",
       "under_400k": summ([r for r in ten if r["p"] < 400000]), "400k_to_600k": summ([r for r in ten if 400000 <= r["p"] < 600000])}
url = "https://chapter3realty.com/homes/api/map?type=house&has=walk_to_beach&city=North%20Myrtle%20Beach&max=400000"
live = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0"}), timeout=60))
parts = [(f["properties"]["name"], shape(f["geometry"])) for f in json.load(open(os.path.join(D, "../../2026-11-a/submarkets-north-myrtle-beach/map-parts.geojson")))["features"] if f["properties"].get("layer") == "part"]
inpart = collections.Counter()
for p in live["pins"]:
    nm = [n for n, sh in parts if sh.contains(Point(p["lng"], p["lat"]))]
    inpart[" / ".join(nm) or "none"] += 1
out["live_nmb_walk_under_400k"] = {"url": url, "checked": __import__("datetime").date.today().isoformat(), "total": live["total"],
    "campground_homes": sum(1 for p in live["pins"] if CAMP.match(p.get("addr") or "")), "by_part": dict(inpart),
    "streets": collections.Counter(street(p["addr"]) for p in live["pins"]).most_common()}
json.dump(out, open(os.path.join(D, "fix1-walk-budget.json"), "w"), indent=1); print(json.dumps(out, indent=1))
