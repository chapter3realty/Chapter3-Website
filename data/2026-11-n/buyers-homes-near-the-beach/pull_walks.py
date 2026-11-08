"""Walking distance from each house for sale within 1.5 miles (straight line) of the ocean to the nearest public
beach access point (SCDES), by the OpenStreetMap foot router at https://routing.openstreetmap.de/routed-foot/
(OSRM table service; streets and paths as mapped in OpenStreetMap). For each house the 6 nearest access points by
straight line are tried and the shortest walk is kept. Run: RAW=<scratch> python3 -I pull_walks.py <datadir>
-> RAW/walks.json (keyed by MLS number; stays in scratch). analyze_walks.py turns it into walk-findings.json."""
import json, os, sys, math, time, urllib.request
RAW = os.environ["RAW"]; D = sys.argv[1]
from shapely.geometry import shape, Point
C = math.cos(math.radians(33.65)); P = lambda x, y: ((x + 79.0) * 69.17 * C, (y - 33.65) * 69.0)
from shapely.ops import transform
coast = transform(lambda x, y, z=None: P(x, y), shape(json.load(open(D + "/coast.geojson"))["features"][0]["geometry"]))
A = [(f["geometry"]["x"], f["geometry"]["y"]) for f in json.load(open(D + "/raw/scdes-access-points.json"))["features"] if f.get("geometry")]
pins = json.load(open(os.path.join(RAW, "pins.json")))["pins"]
path = os.path.join(RAW, "walks.json"); done = json.load(open(path)) if os.path.exists(path) else {}
todo = []
for m, x in pins.items():
    if x.get("lat") is None or ", SC" not in (x.get("addr") or "") or m in done: continue
    if coast.distance(Point(*P(x["lng"], x["lat"]))) < 1.5: todo.append((m, x["lng"], x["lat"]))
print("to do", len(todo), flush=True)
def one(t):
    m, lon, lat = t
    near = sorted(A, key=lambda a: (P(*a)[0] - P(lon, lat)[0]) ** 2 + (P(*a)[1] - P(lon, lat)[1]) ** 2)[:6]
    coords = ";".join(f"{a:.6f},{b:.6f}" for a, b in [(lon, lat)] + near)
    url = f"https://routing.openstreetmap.de/routed-foot/table/v1/driving/{coords}?sources=0&annotations=distance"
    for i in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "chapter3realty research (aggregate counts)"}), timeout=60)); break
        except Exception as e: time.sleep(3 + 3 * i); j = None
    if not j or j.get("code") != "Ok": return m, None
    ds = [d for d in j["distances"][0][1:] if d is not None]
    return m, {"walk_m": min(ds) if ds else None, "snap_m": round(j["sources"][0]["distance"], 1)}
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(3) as ex:
    for k, (m, r) in enumerate(ex.map(one, todo)):
        if r: done[m] = r
        if k % 100 == 0: json.dump(done, open(path, "w")); print(k, flush=True)
json.dump(done, open(path, "w")); print("done", len(done))
