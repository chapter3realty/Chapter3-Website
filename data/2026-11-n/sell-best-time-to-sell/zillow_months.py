"""Zillow Research metro files for Myrtle Beach, SC: each measure's average by calendar month, and the latest month against a year earlier.
Usage: python3 -I zillow_months.py <datadir>   (reads raw/zillow-*.csv from pull-zillow.sh; writes zillow-months.json)"""
import sys, csv, glob, os, json, statistics, collections
D = sys.argv[1]; out = {"meta": {"source": "Zillow Research public files, https://files.zillowstatic.com/research/public_csvs/<measure>/Metro_<measure>_uc_sfrcondo_month.csv, region 'Myrtle Beach, SC' (RegionID 394898, the Myrtle Beach-Conway-North Myrtle Beach metro, which includes Brunswick County, NC). Raw monthly values, not smoothed, not seasonally adjusted. Averages use full years 2018-2025 without 2020 and 2021.", "made": "zillow_months.py"}}
for f in sorted(glob.glob(os.path.join(D, "raw", "zillow-*.csv"))):
    name = os.path.basename(f)[len("zillow-Metro_"):-len("_uc_sfrcondo_month.csv")]
    r = list(csv.reader(open(f))); h = r[0]
    row = next(x for x in r[1:] if x[2] == "Myrtle Beach, SC")
    vals = {h[i]: float(row[i]) for i in range(5, len(h)) if row[i] != ""}
    by = collections.defaultdict(list)
    for k, v in vals.items():
        y, m = int(k[:4]), int(k[5:7])
        if 2018 <= y <= 2025 and y not in (2020, 2021): by[m].append(v)
    last = max(vals); prev = f"{int(last[:4]) - 1}{last[4:7]}"
    prevk = next((k for k in vals if k.startswith(prev)), None)
    out[name] = {"avg_by_month": {m: round(statistics.mean(v), 4) for m, v in sorted(by.items())}, "years_per_month": {m: len(v) for m, v in sorted(by.items())},
                 "latest": [last, vals[last]], "year_before": [prevk, vals.get(prevk)], "series": vals}
json.dump(out, open(os.path.join(D, "zillow-months.json"), "w"), indent=1)
for k, v in out.items():
    if k != "meta": print(k, v["latest"], v["year_before"], v["avg_by_month"])
