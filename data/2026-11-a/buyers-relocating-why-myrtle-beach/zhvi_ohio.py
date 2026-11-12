"""Fix round 1 (reader from Ohio): Zillow Home Value Index for two Ohio counties, same file and month as zhvi-origins.json.
Input: the Zillow county CSV (same URL as zhvi_origins.py). Run: python3 -I zhvi_ohio.py <csv> <this dir>. Writes zhvi-ohio.json."""
import csv, json, sys
src, D = sys.argv[1], sys.argv[2]
want = {"39049": "Franklin County (Columbus)", "39035": "Cuyahoga County (Cleveland)"}
r = csv.reader(open(src, encoding="utf-8")); hdr = next(r); last = hdr[-1]
out = {"source": "https://files.zillowstatic.com/research/public_csvs/zhvi/County_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv", "month": last, "counties": []}
for row in r:
    d = dict(zip(hdr, row)); f = d["StateCodeFIPS"].zfill(2) + d["MunicipalCodeFIPS"].zfill(3)
    if f in want or f in ("45051", "36103"):
        out["counties"].append({"fips": f, "name": d["RegionName"], "state": d["State"], "label": want.get(f), "zhvi": round(float(row[-1]))})
json.dump(out, open(f"{D}/zhvi-ohio.json", "w"), indent=1)
print(json.dumps(out, indent=1))
