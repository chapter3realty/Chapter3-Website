"""Straight-line distances (miles) from each building's mean listing point to named landmarks, for the place lines on
/invest/condo-buildings/. Building points: raw/building-points.json (the mean of each building's listing pins; The Palace
from raw/oceanfront-addresses.json, 1605 S Ocean Blvd). Landmark points: raw/landmarks-osm.json (OpenStreetMap Nominatim,
read 2026-11-09; Main Street's ocean end is the east end of its OSM line). Run: python3 -I landmark_distances.py <this folder>."""
import json, math, sys
D = sys.argv[1]
P = json.load(open(f"{D}/raw/building-points.json")); A = json.load(open(f"{D}/raw/oceanfront-addresses.json"))
pal = [x for x in A["buildings"] if x["street"].startswith("1605 S Ocean")][0]; P["palace"] = [pal["lat"], pal["lng"]]
L = json.load(open(f"{D}/raw/landmarks-osm.json"))
def pt(q, i=0): r = L[q]["results"][i]; return (float(r["lat"]), float(r["lon"]))
LM = {"Myrtle Beach State Park": pt("Myrtle Beach State Park"), "Springmaid Pier": pt("Springmaid Pier, Myrtle Beach"),
  "Family Kingdom": pt("Family Kingdom Amusement Park, Myrtle Beach"), "2nd Avenue Pier": pt("2nd Avenue Pier, Myrtle Beach"),
  "SkyWheel": pt("Myrtle Beach SkyWheel"), "Pier 14": pt("Pier 14, Myrtle Beach"), "Sea Captain's House": pt("Sea Captain's House, Myrtle Beach"),
  "Dunes Golf and Beach Club": pt("Dunes Club, Myrtle Beach"), "Hilton Myrtle Beach Resort": pt("Hilton Myrtle Beach Resort"),
  "Embassy Suites (Kingston Plantation)": pt("Kingston Plantation, Myrtle Beach", 1), "Tanger Outlets, Kings Road": pt("Tanger Outlets, Myrtle Beach", 1),
  "Barefoot Landing": pt("Barefoot Landing, North Myrtle Beach"), "Main Street, ocean end": (33.8188841, -78.6723736),
  "Cherry Grove Pier": pt("Cherry Grove Pier, North Myrtle Beach")}
def mi(a, b):
    R = 3958.8; p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1] - a[1])
    h = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * R * math.asin(math.sqrt(h)), 2)
side = lambda a, b: "north of" if a[0] > b[0] else "south of"
PAIRS = [("mb-resort", "Myrtle Beach State Park"), ("compass-cove", "Springmaid Pier"), ("bluewater", "Springmaid Pier"), ("bluewater", "Family Kingdom"),
  ("landmark", "Family Kingdom"), ("sea-mist", "Family Kingdom"), ("sea-mist", "2nd Avenue Pier"), ("bay-view", "SkyWheel"), ("bay-view", "2nd Avenue Pier"),
  ("camelot", "SkyWheel"), ("camelot", "Pier 14"), ("caribbean", "Sea Captain's House"), ("sands-ocean", "Dunes Golf and Beach Club"),
  ("margate", "Hilton Myrtle Beach Resort"), ("south-hampton", "Embassy Suites (Kingston Plantation)"), ("royale-palms", "Hilton Myrtle Beach Resort"),
  ("seawatch", "Tanger Outlets, Kings Road"), ("ocean-creek", "Barefoot Landing"), ("north-beach-towers", "Barefoot Landing"),
  ("bay-watch", "Main Street, ocean end"), ("avista", "Main Street, ocean end"), ("prince", "Cherry Grove Pier")]
BLD = [("palace", "landmark"), ("coral-beach", "sea-mist"), ("dunes-village", "beach-colony")]
out = {"method": __doc__.strip(), "landmarks": LM, "pairs": [], "neighbors": []}
for b, l in PAIRS: out["pairs"].append({"building": b, "landmark": l, "miles": mi(P[b], LM[l]), "side": side(P[b], LM[l])})
for a, b in BLD: out["neighbors"].append({"building": a, "of": b, "miles": mi(P[a], P[b]), "side": side(P[a], P[b])})
json.dump(out, open(f"{D}/landmark-distances.json", "w"), indent=1)
for r in out["pairs"] + out["neighbors"]: print(r)
