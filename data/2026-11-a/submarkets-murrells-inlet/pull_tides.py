"""NOAA CO-OPS tide predictions (high and low, feet, MLLW) for calendar 2026 at three NOAA prediction stations:
 8661529 Captain Alex's Marina, Parsonage Creek (the MarshWalk end of the inlet); 8661437 Garden City Pier (ocean);
 8661493 Wachesaw Landing, Waccamaw River. Mean range = mean of (high - next low) and (next high - low) pairs.
Run: python3 -I pull_tides.py <datadir>. Writes raw/tides-2026.json (summary only)."""
import json, sys, os, urllib.request, statistics
D = sys.argv[1]; out = {}
for sid, name in (("8661529", "Captain Alex's Marina, Parsonage Creek"), ("8661437", "Garden City Pier (ocean)"), ("8661493", "Wachesaw Landing, Waccamaw River")):
    u = ("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=chapter3realty&begin_date=20260101&end_date=20261231"
         "&datum=MLLW&station=%s&time_zone=lst_ldt&units=english&interval=hilo&format=json" % sid)
    p = json.loads(urllib.request.urlopen(u, timeout=120).read())["predictions"]
    v = [(x["type"], float(x["v"])) for x in p]
    rng = [abs(a[1] - b[1]) for a, b in zip(v, v[1:]) if a[0] != b[0]]
    hi = [x[1] for x in v if x[0] == "H"]; lo = [x[1] for x in v if x[0] == "L"]
    out[sid] = {"name": name, "url": u, "tides": len(v), "mean_range_ft": round(statistics.mean(rng), 2), "max_high_ft": max(hi), "min_low_ft": min(lo),
                "mean_high_ft": round(statistics.mean(hi), 2), "mean_low_ft": round(statistics.mean(lo), 2), "lows_below_0": sum(1 for x in lo if x < 0)}
    print(sid, out[sid])
json.dump(out, open(os.path.join(D, "raw", "tides-2026.json"), "w"), indent=1)
