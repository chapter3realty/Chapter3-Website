"""Monthly mean water and air temperature at NOAA CO-OPS station 8661070 (Springmaid Pier, Myrtle Beach), 2022-2025,
from the hourly files pulled by pull-noaa.sh. A month counts only with at least 20 days of readings.
Run: python3 -I noaa_months.py <this folder>. Writes raw/noaa-months.json."""
import csv, os, sys, json, collections
root = sys.argv[1]
out = {}
for p in ["water_temperature", "air_temperature"]:
    by = collections.defaultdict(list)
    for y in [2022, 2023, 2024, 2025]:
        f = os.path.join(root, "raw", f"noaa-8661070-{p}-{y}.csv")
        for row in csv.reader(open(f)):
            if not row or not row[0][:2] == "20": continue
            try: v = float(row[1])
            except ValueError: continue
            by[(y, int(row[0][5:7]))].append((row[0][:10], v))
    months = {}
    for m in range(1, 13):
        means = []
        for y in [2022, 2023, 2024, 2025]:
            vals = by.get((y, m), [])
            if len({d for d, _ in vals}) >= 20:
                means.append(sum(v for _, v in vals) / len(vals))
        months[m] = {"mean_f": round(sum(means) / len(means), 1) if means else None, "years": len(means)}
    out[p] = months
    print(p, {m: v["mean_f"] for m, v in months.items()}, {m: v["years"] for m, v in months.items()})
json.dump({"station": "8661070 Springmaid Pier, SC", "source": "https://tidesandcurrents.noaa.gov/stationhome.html?id=8661070", "years": "2022-2025", "months": out}, open(os.path.join(root, "raw", "noaa-months.json"), "w"), indent=1)
