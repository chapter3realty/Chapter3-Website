"""Zillow Home Value Index (all homes, middle tier, smoothed, seasonally adjusted), latest month, for Horry County
and the counties that sent the most households to Horry County (IRS 2022-2023 inflow, out-of-state named rows).
Input: raw/zhvi-county.csv from https://files.zillowstatic.com/research/public_csvs/zhvi/County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv
(listed on https://www.zillow.com/research/data/). Run: python3 -I zhvi_origins.py <this dir>. Writes zhvi-origins.json."""
import csv, json, sys
D = sys.argv[1]
irs = json.load(open(f"{D}/irs-migration.json"))
want = ["45051"] + [r["fips"] for r in irs["top_origins_2223"] if not r["fips"].startswith("45")][:16]
rows = list(csv.reader(open(f"{D}/raw/zhvi-county.csv", encoding="utf-8")))
hdr = rows[0]; last = hdr[-1]; yago = hdr[-13]; i_last, i_y = len(hdr) - 1, len(hdr) - 13
out = {"source": "https://files.zillowstatic.com/research/public_csvs/zhvi/County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv", "month": last, "year_ago": yago, "counties": []}
by = {}
for r in rows[1:]:
    rec = dict(zip(hdr, r)); f = rec["StateCodeFIPS"].zfill(2) + rec["MunicipalCodeFIPS"].zfill(3); by[f] = r
for f in want:
    r = by.get(f)
    if not r: out["counties"].append({"fips": f, "missing": True}); continue
    rec = dict(zip(hdr, r))
    ar = next((x for x in irs["top_origins_2223"] if x["fips"] == f), None)
    out["counties"].append({"fips": f, "name": rec["RegionName"], "state": rec["State"], "zhvi": round(float(r[i_last])), "zhvi_year_ago": round(float(r[i_y])) if r[i_y] else None,
                            "arrived_returns_2223": ar and ar["arrived_returns"], "left_returns_2223": ar and ar["left_returns"]})
h = out["counties"][0]["zhvi"]
for c in out["counties"]:
    if c.get("zhvi"): c["ratio_to_horry"] = round(c["zhvi"] / h, 2); c["difference"] = c["zhvi"] - h
json.dump(out, open(f"{D}/zhvi-origins.json", "w"), indent=1)
print(last); [print(c) for c in out["counties"]]
