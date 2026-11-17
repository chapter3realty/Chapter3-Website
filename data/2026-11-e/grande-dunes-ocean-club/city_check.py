"""Which city each for-sale Grande Dunes listing is inside: the listing's map pin (RAW/map.json, /homes/api/map?subdivision=Grande Dunes) tested against the county
Municipalities layer 31 (RAW/gd-geo.json), with the listing's MLS subdivision from raw/cards.json. Writes listing-city.json: counts only, no pin, address or MLS number.
Run: RAW=<scratch> python3 -I city_check.py <this dir>   (needs shapely 2; raw/cards.json comes from pull_listings.py)"""
import json, os, sys, collections
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
D = sys.argv[1]; RAW = os.environ["RAW"]
G = json.load(open(os.path.join(RAW, "gd-geo.json"))); M = json.load(open(os.path.join(RAW, "map.json"))); C = json.load(open(os.path.join(D, "raw/cards.json")))
mun = [(f["attributes"]["NAME"], unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"] if len(r) >= 4])) for f in G["municipalities"]]
bym = {p["mls"]: p for p in M["pins"]}
c = collections.Counter()
for k in C:
    p = bym[k["mlsNumber"]]
    c[(k["subdivision"].replace("Grande Dunes - ", ""), next((n for n, m in mun if m.contains(Point(p["lng"], p["lat"]))), "outside the county GIS frame"))] += 1
by_city = collections.Counter()
for (s, t), v in c.items(): by_city[(t, s == "North Village")] += v
res = {"rule": __doc__.strip().splitlines()[0], "by_subdivision_and_city": [[s, t, v] for (s, t), v in sorted(c.items())],
       "north_village_in_north_myrtle_beach": c[("North Village", "NORTH MYRTLE BEACH")], "other_listings_in_myrtle_beach": sum(v for (s, t), v in c.items() if s != "North Village" and t == "MYRTLE BEACH"),
       "other_listings_outside_frame": sum(v for (s, t), v in c.items() if t.startswith("outside"))}
json.dump(res, open(os.path.join(D, "listing-city.json"), "w"), indent=1); print({k: v for k, v in res.items() if k not in ("rule", "by_subdivision_and_city")})
