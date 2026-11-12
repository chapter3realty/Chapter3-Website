"""Tower heights for entries 1 to 15 of /invest/condo-buildings/, from two federal and county records.
1. Footprints: Horry County parcel layer 24. Every unit parcel of a building's regimes (regimes.json) carries the
   building's footprint polygon; the distinct polygons are the building's footprints.
2. Heights: FAA Digital Obstacle File, https://aeronav.faa.gov/Obst_Data/DAILY_DOF_DAT.ZIP (DOF.DAT). Each obstacle of
   type BLDG with its height above ground (AGL, feet), verified flag (O = verified, U = unverified) and accuracy codes.
An obstacle is matched to a building when its point is inside one of the building's footprints, or within 30 m of one
(DOF horizontal accuracy codes 1 to 4 are 20 ft to 250 ft). Nearest footprint of any other regime is reported too, so
a match next to a neighbour can be judged by hand.
Run: python3 -I dof_in_footprints.py <DOF.DAT> <regimes.json> <out.json>"""
import json, math, sys, urllib.parse, urllib.request
dof, regimes, out = sys.argv[1:4]
R = json.load(open(regimes))["buildings"]
SLUGS = ["mb-resort","compass-cove","bluewater","palace","landmark","sea-mist","coral-beach","bay-view","camelot",
         "caribbean","beach-colony","dunes-village","monterey-bay","grande-cayman","caravelle"]
URL = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
def dms(d, m, s, h):
    v = int(d) + int(m) / 60 + float(s) / 3600
    return -v if h in "SW" else v
obs = []
L = open(dof, encoding="latin-1").read().splitlines()
for ln in L[4:]:
    if not ln.startswith("45-"): continue
    f = ln.split()
    i = next(k for k in range(5, 12) if f[k + 2][-1] in "NS" and f[k].isdigit())
    if f[i+6] != "BLDG": continue
    obs.append({"oas": f[0], "verified": f[1] == "O", "lat": dms(f[i], f[i+1], f[i+2][:-1], f[i+2][-1]),
                "lon": dms(f[i+3], f[i+4], f[i+5][:-1], f[i+5][-1]), "agl_ft": int(f[i+8]), "amsl_ft": int(f[i+9]),
                "acc_h": f[i+11] if len(f) > i + 11 else "", "line": ln.rstrip()})
def xy(lat, lon, lat0): return (math.radians(lon) * math.cos(math.radians(lat0)) * 6371000, math.radians(lat) * 6371000)
def dist_to_poly(p, ring):
    inside = False; best = 1e18
    for a, b in zip(ring, ring[1:]):
        (x1, y1), (x2, y2) = a, b
        if (y1 > p[1]) != (y2 > p[1]) and p[0] < (x2 - x1) * (p[1] - y1) / (y2 - y1) + x1: inside = not inside
        dx, dy = x2 - x1, y2 - y1
        t = max(0, min(1, ((p[0] - x1) * dx + (p[1] - y1) * dy) / (dx * dx + dy * dy or 1)))
        best = min(best, math.hypot(x1 + t * dx - p[0], y1 + t * dy - p[1]))
    return 0 if inside else best
res = {"method": __doc__, "dof_currency": L[0].strip(), "buildings": {}}
for slug in SLUGS:
    polys = set(); calls = []
    for reg in R[slug]:
        q = {"where": f"LegalDescr LIKE '{reg};%'", "outFields": "OBJECTID", "returnGeometry": "true", "outSR": "4326", "f": "json", "resultRecordCount": "2000"}
        u = URL + "?" + urllib.parse.urlencode(q); calls.append(u)
        for ft in json.load(urllib.request.urlopen(u, timeout=90)).get("features", []):
            for ring in ft["geometry"]["rings"]:
                polys.add(tuple((round(x, 7), round(y, 7)) for x, y in ring))
    lat0 = sum(y for p in polys for x, y in p) / sum(len(p) for p in polys)
    rings = [[xy(y, x, lat0) for x, y in p] for p in polys]
    hits = []
    for o in obs:
        if abs(o["lat"] - lat0) > 0.02: continue
        d = min(dist_to_poly(xy(o["lat"], o["lon"], lat0), r) for r in rings)
        if d <= 30: hits.append({**{k: o[k] for k in ("oas", "verified", "agl_ft", "amsl_ft", "line")}, "m_from_footprint": round(d)})
    res["buildings"][slug] = {"regimes": R[slug], "footprints": len(polys), "calls": calls, "dof_bldg": sorted(hits, key=lambda h: -h["agl_ft"])}
    print(slug, len(polys), [(h["oas"], h["agl_ft"], h["verified"], h["m_from_footprint"]) for h in res["buildings"][slug]["dof_bldg"]])
json.dump(res, open(out, "w"), indent=1)
