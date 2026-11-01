"""Simplifies the USDA single-family ineligible area and the Horry County outline for an inline SVG map, and writes the
chart rows (houses for sale at or under $450,000 by town, and how many sit inside USDA's eligible area).
Run: python3.13 -I build-map-data.py <datadir>. Writes usda-map.json and chart-houses-by-town.json."""
import json, sys
from shapely.geometry import shape, mapping, Point
D = sys.argv[1] if len(sys.argv) > 1 else "."
R = D + "/raw/"
u = shape(json.load(open(R + "usda-sfh-ineligible-horry.geojson"))["features"][0]["geometry"])
c = shape(json.load(open(R + "horry-county-boundary.geojson"))["features"][0]["geometry"])
tol = 0.003  # degrees, about 300 m: enough for a phone-width map
ui = u.intersection(c).simplify(tol, preserve_topology=True)
cs = c.simplify(tol, preserve_topology=True)
# Town label points: city hall or downtown of each town (lat, lon), for labels only
towns = {"Myrtle Beach": (33.6891, -78.8867), "North Myrtle Beach": (33.8160, -78.6800), "Surfside Beach": (33.6060, -78.9731),
         "Conway": (33.8360, -79.0478), "Loris": (34.0560, -78.8903), "Aynor": (33.9993, -79.1967), "Longs": (33.9346, -78.7322),
         "Little River": (33.8732, -78.6142), "Murrells Inlet": (33.5510, -79.0414)}
out = {"usda_ineligible_in_horry": mapping(ui), "horry_outline": mapping(cs),
       "towns": [{"name": n, "lat": la, "lon": lo, "usda_eligible_at_point": not u.contains(Point(lo, la))} for n, (la, lo) in towns.items()],
       "note": "USDA RD layer 'RHS SFH MFH' ineligible areas (edit date July 2023; the 'PROPOSED IELG 2020' layer is the same shape). Outline: Census TIGERweb county 45051. Simplified at %.3f degrees." % tol}
json.dump(out, open(D + "/usda-map.json", "w"))
f = json.load(open(D + "/findings.json"))
rows = []
for town, v in f["houses_by_city"].items():
    t = f["usda_listing_tally_under_450k"].get("house_by_city_" + town, {})
    rows.append({"town": town, "houses_for_sale": v["all"], "under_450k": v["under_450k"], "share_under_450k": v["share"],
                 "under_450k_usda_eligible": t.get("usda_eligible", 0), "under_450k_usda_ineligible": t.get("usda_ineligible", 0)})
rows.sort(key=lambda r: -r["share_under_450k"])
json.dump({"pulled": f["listings_pulled"], "note": "CRM active for-sale listings, type house, by the listing's city name. USDA columns count map points inside or outside the USDA ineligible area; points outside Horry County are left out.", "rows": rows},
          open(D + "/chart-houses-by-town.json", "w"), indent=1)
for r in rows: print(r)
print("map json bytes", len(json.dumps(out)))
