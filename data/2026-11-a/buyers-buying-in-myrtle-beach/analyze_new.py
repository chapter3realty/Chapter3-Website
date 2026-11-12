"""Builder (new-home) sales by kind and month, for /buyers/buying-in-myrtle-beach/ (batch 2026-11-a).
Why: the 13,194-sale file (data/2026-10-d/sell-out-of-state-buyers) keeps only parcels with a county building value. New
houses deeded in 2026 have none yet, so that file drops most 2026 builder sales (CRAFT 2, a filter on a field new items lack).
This script reuses the verified builder rule and raw files of data/2026-10-d/buyers-new-construction (verify_build_deeds.py,
5,108 builder sales of 17,881 kept deeds) and splits builder sales into condo (land use 107 or HPR in the legal description,
the /sell/home-value/ rule) and house. Resales come from analyze.py (6,866 houses, 4,181 condos), which are not affected.
Usage: NC=<data/2026-10-d/buyers-new-construction> python3 -I analyze_new.py <this dir> -> new-sales.json"""
import json, os, sys, re, collections, statistics as st, importlib.util
D = sys.argv[1]; NC = os.environ["NC"]
src = open(os.path.join(NC, "verify_build_deeds.py")).read()
code = src.split("b = [d for d in k if d[\"b\"]]")[0]  # run the verified filter and builder rule only
g = {"__name__": "x"}; sys.argv = ["x", NC]; exec(compile(code, "verify_build_deeds.py", "exec"), g)
k, P = g["k"], g["P"]
b = [d for d in k if d["b"]]
def condo(p): return p["LandUseCode"] == "107" or "HPR" in (p["LegalDescr"] or "")
out = {"rule": __doc__.split("\n")[1:6], "kept_deeds": len(k), "builder_sales": len(b)}
bk = collections.Counter("condo" if condo(P[d["ParcelNumber"]]) else "house" for d in b)
out["builder_by_kind"] = dict(bk)
out["builder_median_price_by_kind"] = {kk: st.median([d["Consideration"] for d in b if ("condo" if condo(P[d["ParcelNumber"]]) else "house") == kk]) for kk in bk}
out["builder_by_month"] = {m: c for m, c in sorted(collections.Counter(d["mo"] for d in b).items())}
out["builder_house_by_month"] = {m: c for m, c in sorted(collections.Counter(d["mo"] for d in b if not condo(P[d["ParcelNumber"]])).items())}
BANDS = {"house": [(0, 300000), (300000, 450000), (450000, 700000), (700000, 10**9)], "condo": [(0, 150000), (150000, 250000), (250000, 400000), (400000, 10**9)]}
out["builder_by_price_band"] = {kk: [{"band": f"{lo}-{hi}" if hi < 10**9 else f"{lo}-up", "sold_12mo": sum(1 for d in b if ("condo" if condo(P[d["ParcelNumber"]]) else "house") == kk and lo <= d["Consideration"] < hi)} for lo, hi in BANDS[kk]] for kk in BANDS}
json.dump(out, open(os.path.join(D, "new-sales.json"), "w"), indent=1)
print(json.dumps(out, indent=0))
