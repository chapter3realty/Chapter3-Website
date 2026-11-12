"""How long is the beach from the North Carolina line to the south end of Pawleys Island?
Measured along the Census TIGER/Line 2026 COASTLINE, as cut and simplified (about 10 m) in Blog-Brain
tools/geo/grand-strand-v2.json (region.coast, one line running south to north; region.stateline).
North end: where the NC-SC state line meets the coast (its vertex at Little River Inlet).
South end: the coast vertex nearest the south bound of the Town of Pawleys Island's TIGER PLACE polygon
(33.397 N; Pawleys Island ledger row 1). Also reported: the coast to 33.20 N, near the mouth of Winyah Bay.
A simplified line is shorter than the real shore, so the figure is a floor: say "about", rounded down.
Usage: python3 -I coast_length.py <Blog-Brain>/tools/geo/grand-strand-v2.json > coast-length.json"""
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
coast = dec(d["region"]["coast"]); sl = dec(d["region"]["stateline"][0])
state_pt = sl[1]  # (-78.5411, 33.8511): the state line's vertex on the shore at Little River Inlet
i_n = min(range(len(coast)), key=lambda i: hav(coast[i], state_pt))
def south_index(lat):
    cands = [i for i in range(i_n) if abs(coast[i][1] - lat) < 0.01]
    return min(cands, key=lambda i: abs(coast[i][1] - lat))
out = {"source": "U.S. Census Bureau TIGER/Line 2026 COASTLINE, via Blog-Brain tools/geo/grand-strand-v2.json (about 10 m simplification)",
       "north_end": {"state_line_vertex": state_pt, "coast_vertex": coast[i_n], "gap_miles": round(hav(coast[i_n], state_pt), 2)}, "to": {}}
for name, lat in [("pawleys_island_town_south_end", 33.397), ("near_winyah_bay_33.20", 33.20)]:
    j = south_index(lat)
    miles = sum(hav(coast[k], coast[k + 1]) for k in range(j, i_n))
    out["to"][name] = {"coast_vertex": coast[j], "shore_miles": round(miles, 1), "straight_miles": round(hav(coast[j], coast[i_n]), 1)}
print(json.dumps(out, indent=1))
