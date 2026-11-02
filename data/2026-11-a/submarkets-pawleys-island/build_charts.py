"""Chart data and map layers for /submarkets/pawleys-island/, built from findings.json, hurricanes.json and the county
layers in RAW. Run: RAW=<dir> python3 -I build_charts.py .  -> chart-zones.json, chart-hurricanes.json, chart-last-deed.json,
map-layers.geojson"""
import json, os, sys
from shapely.geometry import shape, mapping, box
from shapely.ops import unary_union
D = sys.argv[1] if len(sys.argv) > 1 else "."; RAW = os.environ["RAW"]
F = json.load(open(os.path.join(D, "findings.json")))["groups"]
NAMES = [("island", "Pawleys Island (the town)"), ("litchfield", "Litchfield, ocean side of US 17"),
         ("east_marsh", "Mainland behind the island, east of US 17"), ("west17", "West of US 17"), ("debordieu", "DeBordieu")]
rows = []
for k, label in NAMES:
    g = F[f"{k}/house"]
    rows.append({"zone": k, "label": label, "houses": g["homes"], "sales_12m": g["sales_window"], "median_sale_12m": g["median_window"],
                 "sales_3y": g["sales_3y"], "median_sale_3y": g["median_3y"],
                 "pct_legal_residence": g["pct_legal_residence"], "pct_bill_outside_sc": g["pct_bill_outside_sc"],
                 "pct_market_sale_last5y": g["pct_market_sale_last5y"], "pct_last_deed_nominal": g["pct_last_deed_nominal"],
                 "pct_high_risk_flood_zone": g["pct_special_flood_hazard"], "pct_VE": g["pct_VE"]})
json.dump({"note": "Houses with a 2024 county building footprint; sales are last recorded deeds of $10,000 or more, 12 months = 2025-10-01 to 2026-09-30, 3 years = 2023-10-01 to 2026-09-30. Georgetown County GIS.", "rows": rows},
          open(os.path.join(D, "chart-zones.json"), "w"), indent=1)
H = json.load(open(os.path.join(D, "hurricanes.json")))
json.dump({"note": "Storm centers within 50 miles of the middle of Pawleys Island, by decade, NOAA HURDAT2. hurricane = at hurricane strength at its closest point.",
           "decades": [{"decade": k, "storms": v[0], "hurricanes": v[1]} for k, v in H["by_decade"].items()],
           "hurricanes": [{"year": r["year"], "name": r["name"].title(), "miles": round(r["miles"]), "wind_mph": round(r["wind_kt"] * 1.15078 / 5) * 5}
                          for r in H["list"] if r["class_at_closest"] == "hurricane"]},
          open(os.path.join(D, "chart-hurricanes.json"), "w"), indent=1)
dec = {}
for k in ("island", "west17"):
    g = F[f"{k}/house"]; n = g["homes"]
    dec[k] = [{"decade": f"{d}s", "houses": c, "pct": round(100 * c / n, 1)} for d, c in g["last_deed_by_decade"]]
json.dump({"note": "Decade of the last recorded deed (any price) on each house. Georgetown County GIS PARCELATTRIBUTES.", "by_zone": dec},
          open(os.path.join(D, "chart-last-deed.json"), "w"), indent=1)
L = lambda n: json.load(open(os.path.join(RAW, n)))["features"]
ext = box(-79.20, 33.36, -79.05, 33.51)
feats = []
def add(geom, props, tol=0.00008):
    g = geom.intersection(ext).simplify(tol, preserve_topology=True)
    if not g.is_empty: feats.append({"type": "Feature", "properties": props, "geometry": mapping(g)})
town = [shape(f["geometry"]) for f in L("munis.geojson") if "PAWLEYS" in f["properties"]["Name"]][0]
add(town, {"layer": "town_limits", "name": "Town of Pawleys Island"}, 0.00003)
roads = L("roads.geojson")
for name, layer in [("OCEAN HWY", "us17"), ("NORTH CAUSEWAY RD", "causeway"), ("SOUTH CAUSEWAY RD", "causeway"),
                    ("MYRTLE AVE", "island_road"), ("ATLANTIC AVE", "island_road"), ("SPRINGS AVE", "island_road")]:
    add(unary_union([shape(f["geometry"]) for f in roads if f["properties"]["St_Full"] == name]), {"layer": layer, "name": name.title()}, 0.00003)
for n, layer in (("ocrm-setback.geojson", "setback_line"), ("ocrm-baseline.geojson", "baseline")):
    add(unary_union([shape(f["geometry"]) for f in L(n) if f["geometry"]]), {"layer": layer}, 0.00002)
fl = L("flood.geojson")
for z in ("VE", "AE"):
    add(unary_union([shape(f["geometry"]).buffer(0) for f in fl if f["properties"]["FLD_ZONE"] == z]), {"layer": "flood_" + z.lower()}, 0.0002)
json.dump({"type": "FeatureCollection", "note": "Georgetown County GIS: town limits (Boundaries 1), roads (Export 1), OCRM 2018 baseline and setback (Nature 6, 7), FEMA flood zones (Nature 9). Simplified.", "features": feats},
          open(os.path.join(D, "map-layers.geojson"), "w"))
print(len(feats), os.path.getsize(os.path.join(D, "map-layers.geojson")))
for r in rows: print(r)
