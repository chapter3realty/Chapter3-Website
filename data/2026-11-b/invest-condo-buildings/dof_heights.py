"""Building heights from the FAA Digital Obstacle File (DOF), for the wow lines on /invest/condo-buildings/.
Source: https://aeronav.faa.gov/Obst_Data/DAILY_DOF_DAT.ZIP (DOF.DAT, currency date in its first line).
For each building's mean listing point (raw/building-points.json), list every DOF obstacle of type BLDG
within 300 m, with its AGL height (feet above ground), AMSL height, verified flag and accuracy codes.
Run: python3 -I dof_heights.py <DOF.DAT> <data folder> <out.json>."""
import json, math, sys
dof, folder, out = sys.argv[1:4]
pts = json.load(open(folder + "/raw/building-points.json"))
def dms(d, m, s, h):
    v = int(d) + int(m) / 60 + float(s) / 3600
    return -v if h in "SW" else v
def metres(a, b):
    R = 6371000; p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    return 2 * R * math.asin(math.sqrt(math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))
lines = open(dof, encoding="latin-1").read().splitlines()
obs = []
for ln in lines[4:]:
    if not ln.startswith("45-"):
        continue
    f = ln.split()
    # OAS# V CO ST CITY... LATd LATm LATs+H LONd LONm LONs+H TYPE QTY AGL AMSL LT H V MAR ...
    i = next(k for k in range(5, 12) if f[k + 2][-1] in "NS" and f[k].isdigit())
    lat = dms(f[i], f[i+1], f[i+2][:-1], f[i+2][-1]); lon = dms(f[i+3], f[i+4], f[i+5][:-1], f[i+5][-1])
    typ = f[i+6]
    if typ != "BLDG":
        continue
    obs.append({"oas": f[0], "verified": f[1] == "O", "city": " ".join(f[4:i]), "lat": round(lat, 6), "lon": round(lon, 6),
                "agl_ft": int(f[i+8]), "amsl_ft": int(f[i+9]), "line": ln.rstrip()})
res = {"method": __doc__, "currency": lines[0].strip(), "buildings": {}}
for slug, p in pts.items():
    lat, lon = (p["lat"], p["lon"]) if isinstance(p, dict) else (p[0], p[1])
    near = sorted(({**o, "m": round(metres((lat, lon), (o["lat"], o["lon"])))} for o in obs
                   if metres((lat, lon), (o["lat"], o["lon"])) <= 300), key=lambda o: -o["agl_ft"])
    res["buildings"][slug] = {"point": [lat, lon], "dof_bldg_within_300m": near}
# The tallest DOF buildings on the strip from Garden City to Little River (33.50 to 33.95 N, 78.50 to 79.20 W).
strip = sorted((o for o in obs if 33.50 < o["lat"] < 33.95 and -79.20 < o["lon"] < -78.50), key=lambda o: -o["agl_ft"])
res["strip_box"] = "33.50 to 33.95 N, 78.50 to 79.20 W"
res["strip_tallest"] = [{k: o[k] for k in ("oas", "agl_ft", "verified", "lat", "lon")} for o in strip[:12]]
res["strip_count"] = len(strip)
json.dump(res, open(out, "w"), indent=1)
