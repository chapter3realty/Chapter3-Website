"""Ocean water temperature at Springmaid Pier, Myrtle Beach (NOAA CO-OPS station 8661070), hourly, for the last full years.
Writes raw/coops-8661070-water-temp-<year>.json and water-temp.json (monthly mean, in degrees F). Run: python3 -I pull_water_temp.py <datadir>"""
import json, sys, urllib.request, statistics, collections
D = sys.argv[1]; out = {"station": "8661070 Springmaid Pier, SC", "source": "https://tidesandcurrents.noaa.gov/stationhome.html?id=8661070", "years": {}}
for y in [2023, 2024, 2025]:
    rows = []
    for m in range(1, 13):
        import calendar
        last = calendar.monthrange(y, m)[1]
        url = f"https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_temperature&station=8661070&begin_date={y}{m:02d}01&end_date={y}{m:02d}{last}&interval=h&units=english&time_zone=lst_ldt&format=json&application=chapter3realty"
        j = json.load(urllib.request.urlopen(url, timeout=90))
        rows += [(r["t"], float(r["v"])) for r in j.get("data", []) if r.get("v")]
    json.dump(rows, open(f"{D}/raw/coops-8661070-water-temp-{y}.json", "w"))
    by = collections.defaultdict(list)
    for t, v in rows: by[int(t[5:7])].append(v)
    out["years"][y] = {m: {"mean_f": round(statistics.mean(v), 1), "hours": len(v)} for m, v in sorted(by.items())}
    print(y, {m: x["mean_f"] for m, x in out["years"][y].items()})
json.dump(out, open(D + "/water-temp.json", "w"), indent=1)
