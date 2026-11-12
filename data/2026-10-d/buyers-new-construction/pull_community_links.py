"""Review round 2: the search each community card links to (/homes/map/?<q>), checked against the CRM's public
map API (active listings, counted in aggregate) so that every house it finds is within 1.5 miles of the
community's middle point (findings-communities.json). Usage: python3 -I pull_community_links.py <this dir>"""
import json, math, sys, os, urllib.request
D = sys.argv[1]
C = {c["name"]: c for c in json.load(open(os.path.join(D, "findings-communities.json")))["communities"]}
Q = {"AUBERON WOODS": "subdivision=Auberon+Woods", "GRANDE DUNES NORTH": "subdivision=Grande+Dunes&city=Longs",
     "ARCADIA": "subdivision=Arcadia&near=33.709%2C-79.0044&miles=1.5", "WATERSIDE NEIGHBORHOOD": "subdivision=Waterside&city=Longs",
     "INDIGO GROVE": "subdivision=The+Overlook", "CHESTNUT GREENS": "subdivision=Del+Webb&city=North+Myrtle+Beach",
     "CYPRESS RIDGE": "subdivision=Cypress+Ridge", "KINGSTON OAKS": "subdivision=Kingston+Oaks", "CRESCENT COVE": "subdivision=Crescent+Cove",
     "EDEN SPRINGS": "subdivision=Eden+Springs"}
mi = lambda a, b, c, d: math.hypot((a - c) * 69 * math.cos(math.radians(34)), (b - d) * 69)
out = {}
for name, q in Q.items():
    u = "https://chapter3realty.com/homes/api/map?type=house&" + q
    d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=40))
    lo, la = C[name]["mid"]
    far = max([mi(p["lng"], p["lat"], lo, la) for p in d["pins"]] or [0])
    out[name] = {"q": q, "total": d["total"], "farthest_miles": round(far, 2)}
    print(name, out[name])
json.dump({"pulled": "2026-11-01", "source": "https://chapter3realty.com/homes/api/map", "links": out}, open(os.path.join(D, "raw", "community-links.json"), "w"), indent=1)
