"""Distance from the worked Surfside Beach and Garden City condos to the ocean shore, by street (fixer, review 1).
Pins: CRM public map API, exactly 2 bedrooms, marked for nightly rentals. Shore: U.S. Census TIGER/Line 2026
COASTLINE, from Blog-Brain tools/geo/grand-strand-v2.json (region scale 10000, about 10 m).
Output: per street, the count and the nearest and farthest distance in miles. No address number or MLS kept.
Run: python3 -I verify/coast_distance.py <this folder> <grand-strand-v2.json>."""
import json, sys, math, re, time, urllib.request, urllib.parse, collections
root, geo = sys.argv[1], sys.argv[2]
G = json.load(open(geo)); S = 10000
def decode(a):
    pts = []; x, y = a[0], a[1]; pts.append((x, y))
    for i in range(2, len(a), 2): x += a[i]; y += a[i + 1]; pts.append((x, y))
    return [(px / S - 80, py / S + 33) for px, py in pts]
coast = decode(G["region"]["coast"])
def miles(a, b):
    lat = math.radians((a[1] + b[1]) / 2)
    return math.hypot((a[0] - b[0]) * 69.17 * math.cos(lat), (a[1] - b[1]) * 69.0)
def to_coast(p):
    best = 9e9
    for (x1, y1), (x2, y2) in zip(coast, coast[1:]):
        lat = math.radians(p[1]); kx = 69.17 * math.cos(lat); ky = 69.0
        ax, ay, bx, by, px, py = x1 * kx, y1 * ky, x2 * kx, y2 * ky, p[0] * kx, p[1] * ky
        dx, dy = bx - ax, by - ay; L = dx * dx + dy * dy
        t = 0 if L == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L))
        best = min(best, math.hypot(px - ax - t * dx, py - ay - t * dy))
    return best
def street(addr):
    s = re.sub(r"^\d+[A-Za-z\-]*\s+", "", addr.split(",")[0].strip()).rstrip(".")
    return re.sub(r"\s+(Unit|Apt|#).*$", "", s)
EX = {"surfside_condo_2br": {"type": "condo", "city": "Surfside Beach", "has": "str_allowed"},
      "garden_city_condo_2br": {"type": "condo", "has": "area_garden_city,str_allowed"}}
out = {}
for k, p in EX.items():
    j = json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode(dict(p, beds=2, limit=144)), headers={"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}), timeout=60)); time.sleep(2.1)
    by = collections.defaultdict(list)
    for x in j["pins"]:
        if x.get("beds") == 2: by[street(x["addr"])].append(to_coast((x["lng"], x["lat"])))
    out[k] = {s: {"n": len(v), "min_mi": round(min(v), 2), "max_mi": round(max(v), 2)} for s, v in sorted(by.items(), key=lambda kv: -len(kv[1]))}
    print(k, out[k])
json.dump(out, open(root + "/verify/coast-distance.json", "w"), indent=1)
