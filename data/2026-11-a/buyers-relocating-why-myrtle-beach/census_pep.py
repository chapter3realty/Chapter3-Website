"""Census Bureau Vintage 2025 population estimates: Horry County components of change, and the metro's rank.
Inputs: raw/co-est2025-alldata.csv, raw/cbsa-est2025-alldata.csv from
https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/ (counties/totals, metro/totals).
Run: python3 -I census_pep.py <this dir>. Writes census-pep.json."""
import csv, json, sys
D = sys.argv[1]
YRS = ["2021", "2022", "2023", "2024", "2025"]
r = next(x for x in csv.DictReader(open(f"{D}/raw/co-est2025-alldata.csv", encoding="latin-1")) if x["STATE"] == "45" and x["COUNTY"] == "051")
comp = {}
for k in ["BIRTHS", "DEATHS", "NATURALCHG", "INTERNATIONALMIG", "DOMESTICMIG", "NETMIG", "RESIDUAL", "NPOPCHG_"]:
    comp[k] = {y: int(r[k + y]) for y in YRS if (k + y) in r}
    comp[k]["sum_2021_2025"] = sum(comp[k][y] for y in YRS if y in comp[k])
out = {"source": "https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/counties/totals/co-est2025-alldata.csv",
       "county": r["CTYNAME"], "base2020": int(r["ESTIMATESBASE2020"]), "pop": {y: int(r["POPESTIMATE" + y]) for y in ["2020"] + YRS}, "components": comp}
out["pct_change_2020_2025"] = round(100 * (out["pop"]["2025"] - out["base2020"]) / out["base2020"], 1)
# metros: rank by numeric and percent change 2024-2025 and base-2025
rows = [x for x in csv.DictReader(open(f"{D}/raw/cbsa-est2025-alldata.csv", encoding="latin-1")) if x["LSAD"] == "Metropolitan Statistical Area"]
def rank(key):
    s = sorted(rows, key=key, reverse=True)
    for i, x in enumerate(s, 1):
        if "Myrtle Beach" in x["NAME"]: return i, len(s), x
pct1 = lambda x: (int(x["POPESTIMATE2025"]) - int(x["POPESTIMATE2024"])) / int(x["POPESTIMATE2024"])
pct5 = lambda x: (int(x["POPESTIMATE2025"]) - int(x["ESTIMATESBASE2020"])) / int(x["ESTIMATESBASE2020"])
dom5 = lambda x: sum(int(x["DOMESTICMIG" + y]) for y in YRS) / int(x["ESTIMATESBASE2020"])
m = {}
for name, f in [("pct_2024_2025", pct1), ("pct_2020_2025", pct5), ("domestic_mig_rate_2020_2025", dom5)]:
    i, n, x = rank(f); m[name] = {"rank": i, "of": n, "value_pct": round(100 * f(x), 2)}
    top = sorted(rows, key=f, reverse=True)[:5]; m[name]["top5"] = [(t["NAME"], round(100 * f(t), 2)) for t in top]
x = next(x for x in rows if "Myrtle Beach" in x["NAME"])
m["name"] = x["NAME"]; m["base2020"] = int(x["ESTIMATESBASE2020"]); m["pop2025"] = int(x["POPESTIMATE2025"])
out["metro"] = m
json.dump(out, open(f"{D}/census-pep.json", "w"), indent=1)
print(json.dumps(out, indent=1))
