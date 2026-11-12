"""Builds the listing findings from raw/listings.json, kept inside the Horry County line (Census TIGERweb).
Usage: python3 -I build_listings.py <this dir> -> findings-listings.json"""
import json, sys, os, statistics as st
D = sys.argv[1]
L = json.load(open(os.path.join(D, "raw", "listings.json")))
ring = json.load(open(os.path.join(D, "raw", "horry-county-boundary.json")))["features"][0]["geometry"]["rings"][0]
def inside(x, y):
    c = False; j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: c = not c
        j = i
    return c
def med(a): return st.median(a) if a else None
def summ(hs):
    ppsf = [h["price"] / h["sqft"] for h in hs if h["price"] and h["sqft"] and h["sqft"] > 400]
    return {"count": len(hs), "median_price": med([h["price"] for h in hs if h["price"]]), "median_sqft": med([h["sqft"] for h in hs if h["sqft"]]),
            "median_ppsf": round(med(ppsf), 1) if ppsf else None, "n_ppsf": len(ppsf), "median_acres": med([h["acres"] for h in hs if h["acres"]]),
            "n_acres": len([h for h in hs if h["acres"]])}
out = {"pulled": L["pulled"], "totals": L["totals"], "sets": {}}
H = {}
for k, s in L["sets"].items():
    hs = list(s["homes"].values())
    ins = [h for h in hs if h["lat"] and h["lng"] and inside(h["lng"], h["lat"])]
    H[k] = ins
    out["sets"][k] = {"pulled": len(hs), "no_point": len([h for h in hs if not h["lat"]]), "in_horry": len(ins), "all": summ(ins),
                      "years": {str(y): len([h for h in ins if h["year"] == y]) for y in sorted(set(h["year"] for h in ins if h["year"]))}}
# by mailing city, houses
cities = sorted(set(h["city"] for h in H["new_house"] + H["nearlynew_house"]))
by = []
for c in cities:
    n = [h for h in H["new_house"] if h["city"] == c]; o = [h for h in H["nearlynew_house"] if h["city"] == c]
    if len(n) + len(o) < 10: continue
    sn, so = summ(n), summ(o)
    by.append({"city": c, "new": sn, "nearly_new_2016_2023": so,
               "ppsf_premium_pct": round(100 * (sn["median_ppsf"] / so["median_ppsf"] - 1), 1) if sn["median_ppsf"] and so["median_ppsf"] and sn["n_ppsf"] >= 10 and so["n_ppsf"] >= 10 else None})
out["by_city_house"] = sorted(by, key=lambda r: -r["new"]["count"])
# price bands for new houses
bands = [(0, 300000), (300001, 400000), (400001, 500000), (500001, 750000), (750001, 99e9)]
out["new_house_price_bands"] = [{"band": [a, b], "count": len([h for h in H["new_house"] if h["price"] and a <= h["price"] <= b])} for a, b in bands]
json.dump(out, open(os.path.join(D, "findings-listings.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in out["sets"].items()}, indent=1))
for r in out["by_city_house"]: print(r["city"], r["new"]["count"], r["new"]["median_price"], r["new"]["median_ppsf"], r["new"]["median_sqft"], r["new"]["median_acres"], "|", r["nearly_new_2016_2023"]["count"], r["nearly_new_2016_2023"]["median_price"], r["nearly_new_2016_2023"]["median_ppsf"], r["nearly_new_2016_2023"]["median_sqft"], r["nearly_new_2016_2023"]["median_acres"], "|", r["ppsf_premium_pct"])
print(out["new_house_price_bands"])
# --- share of houses for sale that are new, by mailing city (Horry only)
import math
allh = H["all_house"]; newids = set(L["sets"]["new_house"]["homes"].keys())
allmls = {m: h for m, h in L["sets"]["all_house"]["homes"].items() if h["lat"] and inside(h["lng"], h["lat"])}
share = {"houses_in_horry": len(allmls), "new_in_horry_all_set": len([m for m in allmls if m in newids])}
sc = []
for c in sorted(set(h["city"] for h in allmls.values())):
    ms = [m for m, h in allmls.items() if h["city"] == c]
    if len(ms) < 30: continue
    k = len([m for m in ms if m in newids]); sc.append({"city": c, "houses": len(ms), "new": k, "pct": round(100 * k / len(ms))})
share["by_city"] = sorted(sc, key=lambda r: -r["pct"])
out["share_new"] = share
# --- matched comparison: each new house against houses built 2016-2023 within 1 mile and within 20% of its size
def mi(a, b):
    R = 3958.8; p1, p2 = math.radians(a["lat"]), math.radians(b["lat"]); dl = math.radians(b["lng"] - a["lng"]); dp = p2 - p1
    return 2 * R * math.asin(math.sqrt(math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2))
old = [h for h in H["nearlynew_house"] if h["sqft"] and h["price"]]
ratios, pairs_n, rows = [], 0, []
for h in H["new_house"]:
    if not (h["sqft"] and h["price"]): continue
    m = [o for o in old if abs(o["sqft"] - h["sqft"]) <= 0.2 * h["sqft"] and mi(h, o) <= 1.0]
    if len(m) < 3: continue
    r = (h["price"] / h["sqft"]) / st.median([o["price"] / o["sqft"] for o in m]); ratios.append(r)
    rows.append({"city": h["city"], "ratio": r, "n": len(m)})
out["matched"] = {"rule": "new house vs houses built 2016-2023 (not flagged new) within 1 mile and within 20% of its square feet; at least 3 matches",
                  "new_houses_matched": len(ratios), "median_ratio": round(st.median(ratios), 3),
                  "share_new_cheaper_per_sqft": round(sum(1 for r in ratios if r < 1) / len(ratios), 3),
                  "quartiles": [round(x, 3) for x in st.quantiles(ratios, n=4, method="inclusive")],
                  "by_city": {c: {"n": len([r for r in rows if r["city"] == c]), "median_ratio": round(st.median([r["ratio"] for r in rows if r["city"] == c]), 3)}
                              for c in sorted(set(r["city"] for r in rows)) if len([r for r in rows if r["city"] == c]) >= 15}}
json.dump(out, open(os.path.join(D, "findings-listings.json"), "w"), indent=1)
print(json.dumps(out["share_new"], indent=0)); print(json.dumps(out["matched"], indent=0))
