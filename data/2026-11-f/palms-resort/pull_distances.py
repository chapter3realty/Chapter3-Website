"""Straight-line miles from the Palms (footprint center in flood.json) to named landmarks.
Landmark points: OpenStreetMap Nominatim results already saved for /invest/condo-buildings/ (website data/2026-11-b/invest-condo-buildings/raw/landmarks-osm.json, read 2026-11-09), plus the Carolinian and Carolina Grande building centers from their own regime footprints? (not used).
Run: python3 -I pull_distances.py <this dir> <website root>. Writes distances.json."""
import json, math, sys
D, W = sys.argv[1], sys.argv[2]
c = json.load(open(D + "/flood.json"))["footprint_center"]
L = json.load(open(W + "/data/2026-11-b/invest-condo-buildings/landmark-distances.json"))["landmarks"]
def mi(a, b):
    R = 3958.8; p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1] - a[1])
    h = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * R * math.asin(math.sqrt(h)), 2)
out = {"from": c, "miles": {k: mi(c, v) for k, v in L.items() if mi(c, v) < 3.5}, "landmark_points_source": "website data/2026-11-b/invest-condo-buildings/landmark-distances.json (Nominatim, read 2026-11-09)"}
json.dump(out, open(D + "/distances.json", "w"), indent=1); print(out)
