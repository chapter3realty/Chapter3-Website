import json, sys
from shapely.geometry import Polygon, Point
from shapely.prepared import prep
raw = json.load(open(sys.argv[1])); hc = json.load(open(sys.argv[2]))["features"][0]["geometry"]["rings"][0]
P = prep(Polygon(hc))
def S(name, types):
    out = {}
    for t in types:
        for m, (pr, la, ln) in raw["sets"][name][t].items():
            if la is not None and ln is not None and pr and P.contains(Point(ln, la)): out[m] = pr
    return out
res = {}
for kind, types, bands in (("house", ["house", "townhouse"], [0, 300000, 450000, 700000, 1e12]), ("condo", ["condo"], [0, 150000, 250000, 400000, 1e12])):
    A, R, Wt, N = S("all", types), S("price_reduced", types), S("home_warranty", types), S("new_construction", types)
    rs = {m: p for m, p in A.items() if m not in N}
    o = {"all": len(A), "resale": len(rs), "cut_resale": sum(m in R for m in rs), "warr": sum(m in Wt for m in A),
         "warr_new": sum(m in Wt and m in N for m in A), "warr_resale": sum(m in Wt for m in rs),
         "R_not_in_A": len(set(R) - set(A)), "W_not_in_A": len(set(Wt) - set(A)), "N_not_in_A": len(set(N) - set(A)), "bands": []}
    for lo, hi in zip(bands, bands[1:]):
        b = [m for m, p in rs.items() if lo <= p < hi]
        o["bands"].append([lo, len(b), sum(m in R for m in b), round(100 * sum(m in R for m in b) / len(b), 1)])
    res[kind] = o
print(json.dumps(res, indent=0))
