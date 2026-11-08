"""Derived numbers for /buyers/pool-homes/ from listings.json, listings-extra.json, water-temp.json and raw/normals-USW00093718.csv.
Writes findings.json. Every number on the page's charts and tables comes from this file. Run: python3 -I analyze.py <datadir>"""
import json, sys, csv
D = sys.argv[1]
L = json.load(open(D + "/listings.json")); X = json.load(open(D + "/listings-extra.json"))
c = L["counts"]; out = {"pulled": L["pulled"], "extra_pulled": X["pulled"]}
out["share_with_pool"] = {"pool": c["pool"], "houses": c["houses"], "pct": round(100 * c["pool"] / c["houses"], 1)}
# price bands: houses and pool houses in each band, from the at-or-under counts
cuts = [0, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000, None]
au = L["at_or_under"]
def cnt(t, k):
    if t is None: return c["houses"] if k == "houses" else c["pool"]
    if t == 0: return 0
    return au[str(t)][k]
bands = []
for lo, hi in zip(cuts[:-1], cuts[1:]):
    h = cnt(hi, "houses") - cnt(lo, "houses"); p = cnt(hi, "pool") - cnt(lo, "pool")
    bands.append({"from": lo, "to": hi, "houses": h, "pool": p, "pct": round(100 * p / h, 1) if h else None})
out["pool_share_by_price"] = bands
out["under_500k"] = {"houses": au["500000"]["houses"], "pool": au["500000"]["pool"], "pct": round(100 * au["500000"]["pool"] / au["500000"]["houses"], 1)}
over1m_h = c["houses"] - au["1000000"]["houses"]; over1m_p = c["pool"] - au["1000000"]["pool"]
out["over_1m"] = {"houses": over1m_h, "pool": over1m_p, "pct": round(100 * over1m_p / over1m_h, 1)}
out["medians"] = {"ask": L["median_ask_5k"], "sqft": L["median_sqft_50"]}
out["size_bands"] = {k: dict(v, gap=(v["pool"]["median_ask_5k"] - v["not_pool"]["median_ask_5k"])) for k, v in L["size_bands"].items()}
f = L["flags"]
out["traits"] = {k: {"pool": v["pool"], "pool_pct": round(100 * v["pool"] / c["pool"], 1), "houses": v["houses"], "houses_pct": round(100 * v["houses"] / c["houses"], 1)} for k, v in f.items()}
out["no_hoa_listed"] = {"pool": c["pool_no_hoa"], "pool_pct": round(100 * c["pool_no_hoa"] / c["pool"], 1), "houses": c["all_no_hoa"], "houses_pct": round(100 * c["all_no_hoa"] / c["houses"], 1)}
out["community_pool"] = {"houses_with_community_pool": f["community_pool"]["houses"], "pct_of_houses": round(100 * f["community_pool"]["houses"] / c["houses"], 1),
  "community_no_private": c["community_pool_no_private"], "both": c["pool_and_community_pool"], "extra": {k: v for k, v in X.items() if k != "calls"}}
out["by_place"] = []
for name, r in L["by_place"].items():
    if "error" in r: out["by_place"].append({"place": name, "error": r["error"]}); continue
    out["by_place"].append({"place": name, "houses": r["houses"], "pool": r["pool"], "pct": round(100 * r["pool"] / r["houses"], 1) if r["houses"] else None,
                            "pool_median_ask_5k": r["pool_median_ask_5k"], "not_pool_median_ask_5k": r["not_pool_median_ask_5k"]})
out["georgetown"] = {"houses": c["georgetown_houses"], "pool": c["georgetown_pool"], "pawleys_island": L.get("pawleys_island")}
# climate: NOAA 1991-2020 monthly normals, North Myrtle Beach airport
rows = list(csv.DictReader(open(D + "/raw/normals-USW00093718.csv")))
out["air_normals_f"] = {int(r["month"]): {"high": float(r["MLY-TMAX-NORMAL"]), "low": float(r["MLY-TMIN-NORMAL"]), "avg": float(r["MLY-TAVG-NORMAL"]), "rain_in": float(r["MLY-PRCP-NORMAL"])} for r in rows}
out["rain_year_in"] = round(sum(v["rain_in"] for v in out["air_normals_f"].values()), 2)
W = json.load(open(D + "/water-temp.json"))
yrs = W["years"]
out["ocean_f_3yr_mean"] = {m: round(sum(yrs[y][str(m)]["mean_f"] for y in yrs if str(m) in yrs[y]) / sum(1 for y in yrs if str(m) in yrs[y]), 1) for m in range(1, 13)}
json.dump(out, open(D + "/findings.json", "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("air_normals_f",)}, indent=1))
