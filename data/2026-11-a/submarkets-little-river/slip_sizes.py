"""Slip sizes from the county's parcel outlines (layer 24, land use 306): the minimum bounding rectangle of each outline, in feet."""
import json, math, sys, collections
RAW = sys.argv[1]
s = json.load(open(f"{RAW}/slips.json"))
sh = {x["PIN"]: x["g"] for x in json.load(open(f"{RAW}/parcel-shapes.json"))}
def marina(lg):
    m = (lg or "").split(";")[0].strip().upper().replace("'", "").replace("MAIRNERS", "MARINERS")
    for k, v in (("MARINERS POINTE", "Mariner's Pointe"), ("LIGHTKEEPERS", "Lightkeepers Village"), ("COQ", "Coquina Harbour"), ("DOCK HOLIDAYS", "Dock Holidays Marina"), ("HARBOURGATE", "Harbourgate Yacht Club")):
        if m.startswith(k): return v
    return "other"
def mbr(r):
    lat0 = sum(p[1] for p in r) / len(r); kx = math.cos(math.radians(lat0)) * 111320; ky = 110574
    pts = [(p[0] * kx, p[1] * ky) for p in r]; best = None
    for i in range(len(pts) - 1):
        a = math.atan2(pts[i+1][1] - pts[i][1], pts[i+1][0] - pts[i][0]); c, sn = math.cos(a), math.sin(a)
        xs = [x*c + y*sn for x, y in pts]; ys = [-x*sn + y*c for x, y in pts]
        w, h = max(xs) - min(xs), max(ys) - min(ys)
        if best is None or w*h < best[0]: best = (w*h, max(w, h), min(w, h))
    return round(best[1] * 3.28084, 1), round(best[2] * 3.28084, 1)
out = collections.defaultdict(list)
for x in s:
    g = sh.get(x["PIN"])
    if not g or not g.get("rings"): continue
    L, W = mbr(g["rings"][0])
    out[marina(x["LegalDescr"])].append({"pin": x["PIN"], "legal": x["LegalDescr"], "len_ft": L, "wid_ft": W, "acreage": x["Acreage"], "county_value": x["MarketProp"]})
res = {}
for m, v in out.items():
    ls = sorted(r["len_ft"] for r in v if r["len_ft"] < 120)
    res[m] = {"n": len(v), "n_slip_sized": len(ls), "len_min": ls[0] if ls else None, "len_max": ls[-1] if ls else None,
              "len_median": ls[len(ls)//2] if ls else None,
              "len_buckets": dict(collections.Counter(int(round(l / 5) * 5) for l in ls).most_common()),
              "not_slip_sized": [r for r in v if r["len_ft"] >= 120]}
print(json.dumps(res, indent=1))
json.dump({"method": "Minimum bounding rectangle of each land-use-306 parcel outline (County GIS layer 24, maxAllowableOffset 0.00001 degrees), in feet. Outlines over 120 feet long are not single slips.", "by_marina": res, "rows": out}, open(sys.argv[2], "w"), indent=1)
