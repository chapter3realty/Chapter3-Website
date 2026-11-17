"""How many River Oaks parcels touch any FEMA zone polygon the county's Flood Zones layer 19 returns around the community (97 polygons: 1 AE high-risk, 96 0.2-percent).
Run: RAW=<scratch> python3 -I flood_check.py. Prints counts only (result 2026-11-14: 0 of 1,428)."""
import json, os
from shapely.geometry import Polygon
from shapely.ops import unary_union
C = json.load(open(os.path.join(os.environ["RAW"], "county.json")))
def poly(r): return unary_union([Polygon(x).buffer(0) for x in r if len(x) >= 4])
zones = unary_union([poly(f["geometry"]["rings"]) for f in C["geo"]["flood"]])
EXC = ("113", "500", "300", "353", "705", "720", "320")
P = [a for a in C["parcels"].values() if (a["LandUseCode"] or "") not in EXC]
n = sum(1 for a in P if poly(a["rings"]).intersects(zones))
print(sum(1 for a in C["parcels"].values() if poly(a["rings"]).intersects(zones)) - n, "common-area, course or water parcels (land use in EXC) touch;")
print(n, "of", len(P), "parcels touch a mapped zone;", sum(1 for f in C["geo"]["flood"] if f["attributes"]["SFHA_TF"] == "T"), "AE polygons read")
