"""Which part of the city each landmark sits in (the part of the nearest home parcel), from OpenStreetMap points (Nominatim, 2026-11-03).
Run: RAW=<scratch> python3 -I landmarks.py <this dir>. Writes landmarks.json."""
import sys, os, json, numpy as np
D = sys.argv[1]; sys.path.insert(0, D); import areas
RAW = os.environ["RAW"]; L = lambda n: json.load(open(os.path.join(RAW, n)))
inn, city = areas.assign(L("parcels.json"), L("munis.json"), L("roads.json")["features"], L("hydro.json"))
IA = np.array([[p["c"]["x"] * areas.K, p["c"]["y"]] for p in inn])
PTS = {"Main Street (Ocean Drive)": (33.8211378, -78.6735286), "McLean Park": (33.8206878, -78.6761145), "Ingram Dunes Nature Preserve": (33.8153434, -78.6875378),
       "Central Park": (33.8171504, -78.6969325), "Cherry Grove Pier": (33.8287315, -78.6326763), "Cherry Grove Boat Ramp": (33.8420331, -78.6175078),
       "Heritage Shores Nature Preserve": (33.8431038, -78.6118539), "Barefoot Landing": (33.7998752, -78.7424398)}
out = {}
for k, (la, lo) in PTS.items():
    d = ((IA - np.array([lo * areas.K, la])) ** 2).sum(1); i = int(np.argmin(d))
    out[k] = {"lat": la, "lon": lo, "part": areas.NAMES[inn[i]["area"]], "nearest_home_m": round(float(np.sqrt(d[i])) * 111000)}
json.dump(out, open(os.path.join(D, "landmarks.json"), "w"), indent=1); print(json.dumps(out, indent=1))
