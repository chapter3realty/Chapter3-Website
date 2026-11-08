"""Cross-check: do the listings the CRM marks "Built by Chesapeake Homes" sit in the same streets as the parcels sold by the five
community companies (Banbury SC, Baytree SC, Waterbridge SC, Heritage SC, Cedar Branch SC LLC)? Distance from each listing to the
nearest such parcel, in meters (straight line). Prints counts only. Usage: python3 -I check_chesapeake.py <this dir> <scratch pins json>"""
import json, sys, os, re, math, collections
D = sys.argv[1]
R = json.load(open(os.path.join(D, "raw", "deeds-co.json")))["deeds"]; P = json.load(open(os.path.join(D, "raw", "parcels.json")))["parcels"]
L = json.load(open(sys.argv[2]))["pins"]
cos = re.compile(r"^(BANBURY|BAYTREE|WATERBRIDGE|HERITAGE|CEDAR BRANCH) SC LLC$")
pts = [(P[d["ParcelNumber"]]["lat"], P[d["ParcelNumber"]]["lng"], d["DirectName"]) for d in R if cos.search(d["DirectName"] or "") and d["ParcelNumber"] in P and P[d["ParcelNumber"]]["lat"]]
def m(a, b): return math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 111000 * math.cos(math.radians(a[0])))
out = collections.Counter(); near = collections.Counter()
for p in L:
    if "chesapeake" not in p["filters"]: continue
    best = min(pts, key=lambda x: m((p["lat"], p["lng"]), x))
    dd = m((p["lat"], p["lng"]), best)
    out["within 400 m" if dd <= 400 else "farther"] += 1
    if dd <= 400: near[best[2]] += 1
print(dict(out), dict(near), "parcels", len(pts))
