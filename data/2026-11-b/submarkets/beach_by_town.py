"""How many miles of ocean beach does each Grand Strand place have? Census TIGER/Line 2026 COASTLINE and PLACE
outlines (cities, towns and Census designated places), as simplified in Blog-Brain tools/geo/grand-strand-v2.json.
Each coast segment is given to the place whose outline holds its midpoint, or lies within BUF m (default 120) of it (the
simplified shore and outlines can sit a few metres apart). Unclaimed shore is county land or a state park.
Check: Surfside Beach should come out near 2.1 miles (Ocean Boulevard inside the town, SB ledger row 26).
Usage: python3 -I beach_by_town.py <Blog-Brain>/tools/geo/grand-strand-v2.json > beach-by-town.json"""
import json, sys, math
d = json.load(open(sys.argv[1])); S = 10000
def dec(f):
    p = []; x = y = None
    for i in range(0, len(f), 2):
        if i == 0: x, y = f[0], f[1]
        else: x += f[i]; y += f[i + 1]
        p.append((x / S - 80, y / S + 33))
    return p
def hav(a, b):
    R = 3958.8; la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))
def inside(pt, ring):
    x, y = pt; c = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
def seg_dist_m(p, a, b):
    k = math.cos(math.radians(p[1])) * 69.17 * 1609.34; m = 69.0 * 1609.34
    ax, ay, bx, by, px, py = a[0]*k, a[1]*m, b[0]*k, b[1]*m, p[0]*k, p[1]*m
    dx, dy = bx-ax, by-ay; t = 0 if dx == dy == 0 else max(0, min(1, ((px-ax)*dx + (py-ay)*dy) / (dx*dx + dy*dy)))
    return math.hypot(px - ax - t*dx, py - ay - t*dy)
towns = []
for t in d["region"]["towns"]:
    def flat(o):
        if not o: return []
        if isinstance(o[0], int): return [o]
        return [r for x in o for r in flat(x)]
    rings = [dec(r) for r in flat(t["o"]) if len(r) >= 6]
    if not rings: continue
    towns.append((t["n"], t["kind"], rings))
coast0 = dec(d["region"]["coast"])
BUF = float(sys.argv[2]) if len(sys.argv) > 2 else 120.0
coast = []  # densified: a point about every 40 m, so a town line can fall inside a long straight segment
for a, b in zip(coast0, coast0[1:]):
    n = max(1, int(hav(a, b) * 1609.34 / 40))
    coast += [(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n) for i in range(n)]
coast.append(coast0[-1])
sl = dec(d["region"]["stateline"][0])[1]
i_n = min(range(len(coast)), key=lambda i: hav(coast[i], sl))
miles = {}; free = 0.0
for k in range(i_n):
    a, b = coast[k], coast[k + 1]
    if a[1] < 33.38: continue  # south of Pawleys Island's south end
    mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); L = hav(a, b); got = None
    for n, kind, rings in towns:
        if any(inside(mid, r) for r in rings) or min(seg_dist_m(mid, r[i], r[(i+1) % len(r)]) for r in rings for i in range(len(r))) < BUF:
            got = n; break
    if got: miles[got] = miles.get(got, 0) + L
    else: free += L
out = {"source": "U.S. Census Bureau TIGER/Line 2026 COASTLINE and PLACE, via Blog-Brain tools/geo/grand-strand-v2.json",
       "method": "coast segment midpoint inside a place outline or within BUF m (default 120); NC line to 33.38 N",
       "places": {n: round(v, 1) for n, v in sorted(miles.items(), key=lambda x: -x[1])}, "outside_any_place_miles": round(free, 1),
       "kinds": {n: kind for n, kind, _ in towns}}
print(json.dumps(out, indent=1))
