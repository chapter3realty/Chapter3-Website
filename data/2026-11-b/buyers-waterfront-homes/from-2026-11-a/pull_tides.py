"""NOAA CO-OPS tide predictions (high and low, feet above MLLW) for calendar 2026 at nine prediction stations from the ocean
inland, on each kind of water the page names. Mean range = mean of the differences between each high and the next low and each low and the next high.
Run: python3 -I pull_tides.py <datadir>. Writes raw/tides-2026.json (summary only)."""
import json, sys, os, urllib.request, statistics
D = sys.argv[1]; out = {}
ST = [("8661070", "Springmaid Pier, Myrtle Beach (ocean)", "ocean"),
      ("8660265", "Cherry Grove (inside)", "channel"),
      ("8660121", "Little River (town)", "waterway"),
      ("8660642", "North Myrtle Beach, ICWW", "waterway"),
      ("8660754", "Carolina Forest, ICWW", "waterway"),
      ("8660854", "Myrtle Beach, Combination Bridge", "waterway"),
      ("8660983", "Socastee Bridge", "waterway"),
      ("8660275", "Conway, RR. bridge", "river"),
      ("8661529", "Captain Alex's Marina, Parsonage Creek", "creek"),
      ("8661989", "Bennet's Dock, Pawleys Island Creek", "creek")]
for sid, name, kind in ST:
    u = ("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=chapter3realty&begin_date=20260101&end_date=20261231"
         "&datum=MLLW&station=%s&time_zone=lst_ldt&units=english&interval=hilo&format=json" % sid)
    r = json.loads(urllib.request.urlopen(u, timeout=120).read())
    if "predictions" not in r:
        out[sid] = {"name": name, "kind": kind, "url": u, "error": r.get("error")}; print(sid, name, "no predictions", r.get("error")); continue
    p = r["predictions"]
    v = [(x["type"], float(x["v"])) for x in p]
    rng = [abs(a[1] - b[1]) for a, b in zip(v, v[1:]) if a[0] != b[0]]
    hi = [x[1] for x in v if x[0] == "H"]; lo = [x[1] for x in v if x[0] == "L"]
    out[sid] = {"name": name, "kind": kind, "url": u, "tides": len(v), "mean_range_ft": round(statistics.mean(rng), 2), "max_range_ft": round(max(rng), 2),
                "max_high_ft": max(hi), "min_low_ft": min(lo), "mean_high_ft": round(statistics.mean(hi), 2), "mean_low_ft": round(statistics.mean(lo), 2),
                "lows_below_0": sum(1 for x in lo if x < 0), "lows": len(lo)}
    print(sid, out[sid]["name"], out[sid]["mean_range_ft"], out[sid]["max_range_ft"], out[sid]["min_low_ft"], out[sid]["lows_below_0"], len(lo))
json.dump(out, open(os.path.join(D, "raw", "tides-2026.json"), "w"), indent=1)
