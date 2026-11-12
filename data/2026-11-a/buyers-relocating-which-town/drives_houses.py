"""Drive minutes from the houses themselves, not from a town hall or a pier. For each of the 13 places, 60 detached houses
are drawn at random (seed 2026) from the county parcel points used by analyze.py (same house rule, same outlines), and the
OSRM public router's table service (router.project-osrm.org, OpenStreetMap roads, fastest route, free flow: no traffic,
no stops) gives the minutes from each house to: the nearest of ten public beach points (drives.json beach_points), the
nearest of five hospitals (drives.json hospitals), Myrtle Beach International Airport's terminal, Coastal Grand Mall and the
Myrtle Beach boardwalk at Pier 14 (drives.json). Reported: the middle (median) and the quartiles over the 60 houses.
Run: RAW=<where-to-buy scratch raw> python3 -I drives_houses.py <datadir>. Writes drives-houses.json (no PIN or point kept)."""
import json, os, sys, random, statistics, subprocess, time
sys.path.insert(0, "")
D = sys.argv[1]; RAW = os.environ["RAW"]
from shapely.geometry import Point, Polygon
from shapely.strtree import STRtree
J = lambda p: json.load(open(p))
WTB = os.path.join(D, "../invest-where-to-buy")
def rings_to_poly(rings):
    out = None
    for r in rings:
        if len(r) < 4: continue
        p = Polygon(r).buffer(0); out = p if out is None else out.symmetric_difference(p)
    return out
places = {p["name"]: rings_to_poly(p["rings"]) for p in J(os.path.join(WTB, "raw/places.json"))["places"]}
zctas = {z["zcta"]: rings_to_poly(z["rings"]) for z in J(os.path.join(WTB, "raw/zctas.json"))["zctas"]}
GT = {c["name"]: rings_to_poly(c["rings"]) for c in J(os.path.join(WTB, "raw/counties.json"))["counties"]}["Georgetown County"]
AREAS = [("loris", zctas["29569"]), ("aynor", zctas["29511"]), ("longs", zctas["29568"].difference(places["North Myrtle Beach city"])),
  ("little-river", places["Little River CDP"]), ("conway", places["Conway city"]), ("north-myrtle-beach", places["North Myrtle Beach city"]),
  ("carolina-forest", places["Carolina Forest CDP"]), ("myrtle-beach", places["Myrtle Beach city"]), ("socastee", places["Socastee CDP"]),
  ("surfside-beach", places["Surfside Beach town"]), ("garden-city", places["Garden City CDP"]), ("murrells-inlet", places["Murrells Inlet CDP"]),
  ("pawleys-litchfield", zctas["29585"])]
tree = STRtree([a[1] for a in AREAS])
def area_of(x, y):
    for i in tree.query(Point(x, y), predicate="within"): return AREAS[i][0]
pts = {a: [] for a, _ in AREAS}
H = J(os.path.join(RAW, "horry-homes.json")); HP = J(os.path.join(RAW, "horry-points.json"))
for r in H["rows"]:
    pin, lu, td, ap, tp, mp, st, sd, hpr, _, _ = r
    if lu not in ("100", "101", "102", "110", "126") or hpr: continue
    xy = HP.get(str(pin))
    if not xy or not xy[0]: continue
    a = area_of(*xy)
    if a: pts[a].append(tuple(xy))
for tms, lu, st, sd, sp, legal, x, y in J(os.path.join(RAW, "gt-homes.json"))["rows"]:
    if (lu or "")[1:] not in ("100", "101", "500") or not GT.contains(Point(x, y)): continue
    a = area_of(x, y)
    if a: pts[a].append((x, y))
dv = J(os.path.join(D, "drives.json"))
BEACH = list(dv["beach_points"].items()); HOSP = list(dv["hospitals"].items())
ONE = [("airport", (-78.9227887, 33.6814671)), ("mall", (-78.9223169, 33.7027515)), ("boardwalk", (-78.8747973, 33.6943277))]
DEST = BEACH + HOSP + ONE
def table(src):
    coords = ";".join(f"{x:.6f},{y:.6f}" for x, y in list(src) + [p for _, p in DEST])
    n = len(src)
    url = f"https://router.project-osrm.org/table/v1/driving/{coords}?sources={';'.join(map(str, range(n)))}&destinations={';'.join(map(str, range(n, n + len(DEST))))}&annotations=duration"
    for i in range(6):
        try:
            r = json.loads(subprocess.run(["curl", "-sS", "-g", "-m", "120", "-A", "Mozilla/5.0", url], capture_output=True, text=True, check=True).stdout)
            if r.get("code") == "Ok": return r["durations"]
            print("osrm", r.get("code"), r.get("message"), file=sys.stderr)
        except Exception as e: print("retry", e, file=sys.stderr)
        time.sleep(4 + 3 * i)
    raise SystemExit("failed")
def summ(v):
    v = sorted(x for x in v if x is not None); q = statistics.quantiles(v, n=4)
    return {"median": round(statistics.median(v), 1), "p25": round(q[0], 1), "p75": round(q[2], 1), "n": len(v)}
out = {"method": __doc__, "pulled": time.strftime("%Y-%m-%d"), "houses_in_frame": {a: len(v) for a, v in pts.items()}, "areas": {}}
rnd = random.Random(2026)
for a, _ in AREAS:
    src = rnd.sample(pts[a], min(60, len(pts[a])))
    m = table(src); time.sleep(1.5)
    nb, nh = len(BEACH), len(HOSP)
    beach = [min(x for x in row[:nb] if x is not None) / 60 for row in m]
    near = [min(range(nb), key=lambda j: row[j] if row[j] is not None else 9e9) for row in m]
    hosp = [min(x for x in row[nb:nb + nh] if x is not None) / 60 for row in m]
    nearh = [min(range(nh), key=lambda j: row[nb + j] if row[nb + j] is not None else 9e9) for row in m]
    rec = {"beach": summ(beach), "hospital": summ(hosp)}
    for k, (name, _) in enumerate(ONE): rec[name] = summ([row[nb + nh + k] / 60 for row in m if row[nb + nh + k] is not None])
    rec["nearest_beach_point_counts"] = {BEACH[j][0]: near.count(j) for j in set(near)}
    rec["nearest_hospital_counts"] = {HOSP[j][0]: nearh.count(j) for j in set(nearh)}
    out["areas"][a] = rec
    print(a, len(pts[a]), {k: v["median"] for k, v in rec.items() if isinstance(v, dict) and "median" in v}, flush=True)
json.dump(out, open(os.path.join(D, "drives-houses.json"), "w"), indent=1)
