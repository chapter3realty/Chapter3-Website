"""Storms whose center passed within 50 statute miles of the middle of Pawleys Island, 1950 to 2025, from NOAA NHC HURDAT2
($RAW/hurdat2.txt = https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2025-092326.txt). The 6-hour track points are joined
by straight segments in a flat projection and the closest point of each segment is taken; wind is linearly interpolated.
Run: RAW=<dir> python3 -I hurricanes.py <data dir>   writes hurricanes.json"""
import json, math, os, sys
D = sys.argv[1] if len(sys.argv) > 1 else "."
LAT0, LON0 = 33.4290, -79.1235   # middle of the island, between the causeways
R = 3958.8
def xy(lat, lon):
    return (math.radians(lon - LON0) * R * math.cos(math.radians(LAT0)), math.radians(lat - LAT0) * R)
storms = []; cur = None
for line in open(os.path.join(os.environ.get("RAW", os.path.join(D, "raw")), "hurdat2.txt")):
    f = [x.strip() for x in line.split(",")]
    if f[0].startswith("AL") and len(f[0]) == 8 and len(f) <= 4:  # header line: id, name, rows
        cur = {"id": f[0], "name": f[1], "pts": []}; storms.append(cur); continue
    lat = float(f[4][:-1]) * (1 if f[4][-1] == "N" else -1); lon = float(f[5][:-1]) * (-1 if f[5][-1] == "W" else 1)
    cur["pts"].append((f[0], f[1], f[2], f[3], lat, lon, int(f[6])))
out = []
for s in storms:
    yr = int(s["id"][4:]);
    if yr < 1950: continue
    best = None
    P = s["pts"]
    for a, b in zip(P, P[1:] + [P[-1]]):
        ax, ay = xy(a[4], a[5]); bx, by = xy(b[4], b[5]); dx, dy = bx - ax, by - ay
        L2 = dx * dx + dy * dy; t = 0 if L2 == 0 else max(0, min(1, -(ax * dx + ay * dy) / L2))
        d = math.hypot(ax + t * dx, ay + t * dy); w = a[6] + t * (b[6] - a[6])
        if best is None or d < best[0]: best = (d, w, a[0], a[3])
    if best[0] <= 50:
        cat = "hurricane" if best[1] >= 64 else ("tropical storm" if best[1] >= 34 else "depression or weaker")
        out.append({"year": yr, "name": s["name"], "miles": round(best[0], 1), "wind_kt": round(best[1]), "date": best[2], "class_at_closest": cat, "status_code": best[3]})
out.sort(key=lambda r: (r["year"], r["date"]))
summary = {"source": "NOAA NHC HURDAT2 1851-2025 (file dated 2026-09-23)", "center": [LAT0, LON0], "radius_miles": 50,
           "years": "1950-2025", "storms": len(out), "hurricane_strength_at_closest": sum(r["class_at_closest"] == "hurricane" for r in out),
           "tropical_storm_strength": sum(r["class_at_closest"] == "tropical storm" for r in out),
           "by_decade": {}, "list": out}
for r in out:
    k = f"{r['year'] // 10 * 10}s"; summary["by_decade"].setdefault(k, [0, 0]); summary["by_decade"][k][0] += 1
    summary["by_decade"][k][1] += r["class_at_closest"] == "hurricane"
json.dump(summary, open(os.path.join(D, "hurricanes.json"), "w"), indent=1)
print(summary["storms"], summary["hurricane_strength_at_closest"], summary["tropical_storm_strength"], summary["by_decade"])
for r in out:
    if r["class_at_closest"] == "hurricane" or r["miles"] < 20: print(r)
