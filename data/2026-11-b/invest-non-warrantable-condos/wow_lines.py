"""Fix round 1 (2026-11-10): the facts behind the Maisons Sur-Mer and Ocean Forest Plaza wow lines.
Inputs in raw/wow/ (pulled 2026-11-10):
  dunes-parcel.json  county parcel layer 24 at the Dunes Golf and Beach Club's point (33.76304,-78.79605), with geometry
  pl-parcel.json     county parcel layer 24 at Pine Lakes' Wikipedia point (33.72972,-78.84333), with geometry
  fl-*.json          layer 24 rows for each building's regime names (LegalDescr LIKE '<regime>;%')
Building points: ../invest-condo-buildings/raw/building-points.json (the mean listing point, as CB row 79 used).
Heights: ../invest-condo-buildings/raw/faa-dof-heights.json (FAA Digital Obstacle File, currency 11/02/26).
Distances are straight lines from the building's point to the nearest edge of the parcel (CB row 79's method;
Sands Ocean Club reproduces 0.20 mile). Run: python3 -I wow_lines.py > wow.json"""
import json, math, re, os, glob
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "raw", "wow")
CB = os.path.join(H, "..", "invest-condo-buildings", "raw")
PTS = json.load(open(os.path.join(CB, "building-points.json")))
DOF = json.load(open(os.path.join(CB, "faa-dof-heights.json")))["buildings"]

def seg(p, a, b):
    k = math.cos(math.radians(p[0])) * 69.172
    P, A, B = (p[1] * k, p[0] * 69.0), (a[1] * k, a[0] * 69.0), (b[1] * k, b[0] * 69.0)
    vx, vy, wx, wy = B[0] - A[0], B[1] - A[1], P[0] - A[0], P[1] - A[1]
    L = vx * vx + vy * vy; t = 0 if L == 0 else max(0, min(1, (wx * vx + wy * vy) / L))
    return math.hypot(P[0] - (A[0] + t * vx), P[1] - (A[1] + t * vy))

def edge(slug, f):
    feat = json.load(open(os.path.join(R, f)))["features"][0]; p = PTS[slug]
    d = min(seg(p, (r[i][1], r[i][0]), (r[i + 1][1], r[i + 1][0])) for r in feat["geometry"]["rings"] for i in range(len(r) - 1))
    a = feat["attributes"]
    return {"from": slug, "parcel_pin": a["PIN"], "owner": a["OwnerName"].strip(), "legal": a["LegalDescr"], "acres": a["Acreage"], "miles_to_edge": round(d, 3)}

def floors(files, unit_number=False):
    fl = []
    for f in files:
        for x in json.load(open(os.path.join(R, f)))["features"]:
            s = x["attributes"]["LegalDescr"]
            m = re.search(r"UNIT\s*[A-Z]?(\d{3,4})\b", s) if unit_number else re.search(r"\bFL(?:OOR)?\s*(\d+)", s)
            if m: fl.append(int(m.group(1)) // 100 if unit_number else int(m.group(1)))
    top = max(fl)
    return {"rows_parsed": len(fl), "top_floor": top, "units_on_top_floor": fl.count(top)}

out = {
  "read": "2026-11-10",
  "dunes_club": [edge("sands-ocean", "dunes-parcel.json"), edge("maisons-sur-mer", "dunes-parcel.json")],
  "pine_lakes": [edge("ocean-forest-plaza", "pl-parcel.json")],
  "maisons-sur-mer": {"floors": floors(["fl-MAISONS_SUR_MER.json", "fl-MAISON_SUR_MER.json", "fl-MAISON-SUR-MER.json", "fl-MAISONS-SUR_MER.json"]),
                      "dof": DOF["maisons-sur-mer"]["dof_bldg_within_300m"]},
  "ocean-forest-plaza": {"floors": floors(["fl-OCEAN_FOREST_PLAZA.json"], unit_number=True),
                         "dof": DOF["ocean-forest-plaza"]["dof_bldg_within_300m"]},
}
print(json.dumps(out, indent=1))
