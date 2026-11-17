"""Which MLS subdivision names sit inside the Willbrook parcel outline? Reads every active pin within 2.5 miles of the community's middle
from the site's public map API, then each pin's card (subdivision name only), and tests the pin against the county parcels. Prints; saves counts only."""
import json, os, sys, time, urllib.request, urllib.parse, collections
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
RAW = os.environ["RAW"]
C = json.load(open(os.path.join(RAW, "county.json")))
shape = unary_union([unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"]]) for f in C["parcels"] if f["attributes"]["StreetName"] != "UNKNOWN" and f["attributes"]["LandUseCode"][:1] in "QN"]).buffer(0.0004)
def get(u):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        except Exception: time.sleep(3)
d = get("https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode({"near": "33.4865,-79.122", "miles": "2.5"}))
c = collections.Counter(); inn = collections.Counter()
for p in d["pins"]:
    f = get("https://chapter3realty.com/homes/api/lookup?mls=" + p["mls"]).get("facts") or {}
    n = f.get("subdivision"); c[n] += 1
    if shape.contains(Point(p["lng"], p["lat"])): inn[n] += 1
print("all within 2.5 mi", c.most_common(15)); print("inside outline", inn)
