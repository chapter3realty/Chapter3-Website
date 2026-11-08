"""The dot map's points for /buyers/new-construction/builders/ (writer, batch 2026-11-n, 2026-11-08). Writes map-points.json.
Runs analyze.py with the verifier's three fixes (verify_corrections.py, the same patch points), sends its own findings file to a
throwaway path, then takes each kept builder sale's parcel centre (raw/parcels.json, county GIS layer 24) and its builder. Points are
rounded to 3 decimals (about 100 m), so no single parcel can be read off the map. No address, price or name is written.
Usage: python3 -I map_points.py <this dir>"""
import sys, os, json, collections, tempfile
D = sys.argv[1]
src = open(os.path.join(D, "analyze.py")).read()
tmp = os.path.join(tempfile.gettempdir(), "builders-map-findings.json")
for a, c in [('"H&H Homes", "H & H Constructors of Fayetteville LLC"', '"Dream Finders Homes", "H & H Constructors of Fayetteville LLC"'),
             ('MEMO = re.compile(r"CORRECT|RE-RECORD|', 'MEMO = re.compile(r"CORRECT|RE-?RECORD|'),
             ('os.path.join(D, "findings.json")', repr(tmp))]:
    if a not in src: raise SystemExit("patch point missing: " + a[:60])
    src = src.replace(a, c)
sys.argv = [os.path.join(D, "analyze.py"), D]
g = {"__name__": "__main__"}
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(src, "analyze.py (verifier patch)", "exec"), g)
b, P = g["b"], g["P"]
cells = collections.Counter()
for d in b:
    p = P[d["ParcelNumber"]]
    if p.get("lat"): cells[(round(p["lat"], 3), round(p["lng"], 3), d["bl"])] += 1
out = {"note": "Kept builder sales (findings-verified.json rules), by parcel centre rounded to 3 decimals, with the builder.",
       "builder_sales": len(b), "with_point": sum(cells.values()),
       "points": [[la, lo, bl, n] for (la, lo, bl), n in sorted(cells.items())]}
json.dump(out, open(os.path.join(D, "map-points.json"), "w"))
print(out["builder_sales"], out["with_point"], len(out["points"]))
