"""Map data for the page's own map. Run: python3 -I map_data.py <this dir>. Writes map-data.json.
1) The Town of Surfside Beach limit: county Municipalities layer 31, polygon, simplified to under 400 points.
2) One center per named community for sale: the middle of the map points of that name's condos (rounded to 3 decimals, about 100 m).
No MLS number, address or single listing point is kept."""
import json, sys, urllib.request, urllib.parse, datetime, math
H = {"User-Agent": "Mozilla/5.0"}
def get(u, q): return json.load(urllib.request.urlopen(urllib.request.Request(u + "?" + urllib.parse.urlencode(q), headers=H), timeout=90))
M = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/31/query"
r = get(M, {"where": "NAME='SURFSIDE BEACH'", "outFields": "NAME", "returnGeometry": "true", "outSR": "4326", "f": "json"})
rings = []
for f in r["features"]:
    rings += f["geometry"]["rings"]
rings.sort(key=lambda g: -len(g))
def simp(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dm, di = 0, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]; dx, dy = b[0]-a[0], b[1]-a[1]; L = math.hypot(dx, dy) or 1e-12
        d = abs(dy*(p[0]-a[0]) - dx*(p[1]-a[1])) / L
        if d > dm: dm, di = d, i
    if dm > tol: return simp(pts[:di+1], tol)[:-1] + simp(pts[di:], tol)
    return [a, b]
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "ring_sizes": [len(g) for g in rings]}
big = rings[0]; tol = 0.00005
def ring(pts, tol):
    pts = pts[:-1] if pts[0] == pts[-1] else pts
    h = len(pts) // 2
    return simp(pts[:h+1], tol)[:-1] + simp(pts[h:] + [pts[0]], tol)[:-1]
poly = ring(big, tol)
while len(poly) > 380: tol *= 1.4; poly = ring(big, tol)
out["limit_polygon"] = [[round(x, 5), round(y, 5)] for x, y in poly]
# community centers
def pins(q):
    d = get("https://chapter3realty.com/homes/api/map", q); return d
names = {"Golf Colony at Deerfield": "Golf Colony at Deerfield", "Southbridge": "Southbridge", "Retreat at Glenns Bay": "Retreat at Glenns Bay", "South Bay Lakes": "South Bay Lakes", "Plantation": "Grand Palms", "Hampton Greens": "Hampton Greens", "Sea Shadow": "Sea Shadow"}
cent = {}
for k, lab in names.items():
    d = pins({"type": "condo", "city": "Surfside Beach", "subdivision": k})
    ps = d["pins"]
    if ps: cent[lab] = {"n": len(ps), "lat": round(sum(p["lat"] for p in ps)/len(ps), 3), "lon": round(sum(p["lng"] for p in ps)/len(ps), 3)}
out["centers"] = cent
json.dump(out, open(sys.argv[1] + "/map-data.json", "w"), indent=1); print(json.dumps(out["centers"]), len(out["limit_polygon"]), out["ring_sizes"][:5])
