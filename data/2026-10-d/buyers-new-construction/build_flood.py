"""How many new-construction houses for sale (Horry County, from raw/listings.json) sit inside a FEMA high-risk flood zone
(SFHA, zones A, AE, VE) on the county's flood layer, against houses built 2016-2023 and all houses for sale.
A listing point is the CRM's map point for the home. Usage: python3 -I fetch_flood.py <this dir>; python3 -I build_flood.py <this dir> [path to flood-sfha.json] -> findings-flood.json (raw/flood-sfha.json is 5.6 MB and not kept; rerun fetch_flood.py)"""
import json, sys, os
D = sys.argv[1]
L = json.load(open(os.path.join(D, "raw", "listings.json"))); F = json.load(open(sys.argv[2] if len(sys.argv) > 2 else os.path.join(D, "raw", "flood-sfha.json")))
ring = json.load(open(os.path.join(D, "raw", "horry-county-boundary.json")))["features"][0]["geometry"]["rings"][0]
def pip(x, y, r):
    c = False; j = len(r) - 1
    for i in range(len(r)):
        xi, yi = r[i]; xj, yj = r[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: c = not c
        j = i
    return c
polys = []
for f in F["features"]:
    rs = f["geometry"]["rings"]; xs = [p[0] for r in rs for p in r]; ys = [p[1] for r in rs for p in r]
    polys.append((min(xs), max(xs), min(ys), max(ys), rs, f["attributes"]["FLD_ZONE"]))
def zone(x, y):
    for a, b, c, d, rs, z in polys:
        if a <= x <= b and c <= y <= d:
            n = sum(1 for r in rs if pip(x, y, r))
            if n % 2 == 1: return z
    return None
out = {"flood_source": F["source"], "flood_read": F["read"], "listings_pulled": L["pulled"]}
for k in ["new_house", "nearlynew_house", "all_house"]:
    hs = [h for h in L["sets"][k]["homes"].values() if h["lat"] and pip(h["lng"], h["lat"], ring)]
    zs = [zone(h["lng"], h["lat"]) for h in hs]
    out[k] = {"in_horry": len(hs), "in_sfha": sum(1 for z in zs if z), "by_zone": {z: zs.count(z) for z in set(zs) if z}}
    print(k, out[k], flush=True)
json.dump(out, open(os.path.join(D, "findings-flood.json"), "w"), indent=1)
