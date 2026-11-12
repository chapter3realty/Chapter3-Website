#!/usr/bin/env python3
"""Georeference the Town of Surfside Beach zoning map (PDF, updated 05/23/2022) and vectorize its districts.
Run: RAW=<scratch> python3 -I georef_zoning.py <datadir>
Inputs in RAW: zoning-map.pdf (https://surfsidebeach.org/DocumentCenter/View/3026/New-Zoning-Map),
               town-limits.geojson (Horry County GIS layer 31, NAME='SURFSIDE BEACH').
Method: the PDF's town-limits outline (the one thick black filled-and-stroked path) is matched to the county's
town-limits polygon by a similarity transform (rotation, scale, shift; PDF y runs down so the y axis is flipped),
found by a grid search on rotation and refined by ICP with a full affine fit. Every filled parcel polygon in the PDF is
then carried to longitude and latitude and labelled by its fill colour from the map legend.
Writes RAW/zoning-polys.geojson and <datadir>/zoning-georef.json (transform and fit error)."""
import os, sys, json, math
import numpy as np, pymupdf as fitz
from shapely.geometry import shape, Polygon, mapping
RAW = os.environ["RAW"]; D = sys.argv[1]
LEGEND = {(0.945,0.906,0.898):"C1",(1.0,0.667,0.0):"C2",(1.0,0.655,0.498):"C3",(1.0,0.745,0.91):"C4",(1.0,1.0,0.917):"MP",
          (0.451,0.875,1.0):"PD",(0.439,0.659,0.0):"PL",(0.827,1.0,0.745):"R1",(1.0,1.0,0.745):"R2",(0.745,0.91,1.0):"R3"}
page = fitz.open(os.path.join(RAW, "zoning-map.pdf"))[0]
dr = page.get_drawings()
def pts_of(d):
    out = []
    for it in d["items"]:
        if it[0] == "l": out += [it[1], it[2]]
        elif it[0] == "c": out += [it[1], it[4]]
        elif it[0] == "re": r = it[1]; out += [r.tl, r.tr, r.br, r.bl]
        elif it[0] == "qu": q = it[1]; out += [q.ul, q.ur, q.lr, q.ll]
    return [(p.x, p.y) for p in out]
lim = [d for d in dr if d["type"] == "fs" and d.get("color") and max(d["color"]) < 0.1 and len(d["items"]) > 100][0]
P = np.array(pts_of(lim))
town = shape(json.load(open(os.path.join(RAW, "town-limits.geojson")))["features"][0]["geometry"])
lon0, lat0 = town.centroid.x, town.centroid.y
kx = 111320 * math.cos(math.radians(lat0)); ky = 110540
def to_m(lon, lat): return np.c_[(np.asarray(lon) - lon0) * kx, (np.asarray(lat) - lat0) * ky]
ring = town.exterior if town.geom_type == "Polygon" else max(town.geoms, key=lambda g: g.area).exterior
# densify the GIS ring
G = []
for i in range(len(ring.coords) - 1):
    (a, b), (c, e) = ring.coords[i], ring.coords[i + 1]
    for t in np.linspace(0, 1, 6, endpoint=False): G.append((a + (c - a) * t, b + (e - b) * t))
G = to_m(*zip(*G))
Pf = P.copy(); Pf[:, 1] *= -1   # flip y
def nn(A, B):
    d = ((A[:, None, :] - B[None, :, :]) ** 2).sum(-1); i = d.argmin(1); return B[i], np.sqrt(d.min(1))
s0 = math.sqrt(Polygon(G).area / Polygon(Pf).area)
cands = []
for deg in range(0, 360, 2):
    th = math.radians(deg); R = np.array([[math.cos(th), -math.sin(th)], [math.sin(th), math.cos(th)]])
    Q = (Pf - Pf.mean(0)) @ R.T * s0 + G.mean(0)
    _, dist = nn(Q, G); sc = dist.mean()
    cands.append((sc, deg))
cands.sort(); best = cands[0]
def start(deg):
    th = math.radians(deg); R = np.array([[math.cos(th), -math.sin(th)], [math.sin(th), math.cos(th)]])
    M = np.zeros((3, 2)); M[:2, :] = (R.T * s0); M[2, :] = G.mean(0) - (Pf.mean(0) @ R.T * s0); return M
th = math.radians(best[1]); R = np.array([[math.cos(th), -math.sin(th)], [math.sin(th), math.cos(th)]])
A = np.eye(3); 
X = np.c_[Pf, np.ones(len(Pf))]
M = np.zeros((3, 2)); M[:2, :] = (R.T * s0); M[2, :] = G.mean(0) - (Pf.mean(0) @ R.T * s0)
for it in range(60):
    Q = X @ M; tgt, dist = nn(Q, G)
    M, *_ = np.linalg.lstsq(X, tgt, rcond=None)
Q = X @ M; _, dist = nn(Q, G)
outline_fit = (round(float(dist.mean()), 1), round(float(np.percentile(dist, 90)), 1))
# Refine on parcels: the centroid of every filled parcel polygon in the PDF against the centroids of the county's
# residential parcels with a building (RAW/parcels.json, deduplicated by polygon), keeping pairs closer than 30 m.
from scipy.spatial import cKDTree
pdfc = []
for d in dr:
    if d.get("fill") and d["type"] in ("f", "fs") and d["rect"].x0 < 1090 and tuple(round(x, 3) for x in d["fill"]) in LEGEND:
        pp = pts_of(d)
        if len(pp) >= 3:
            pg = Polygon(pp).buffer(0)
            if not pg.is_empty and pg.area < 400: pdfc.append((pg.centroid.x, pg.centroid.y))
pdfc = np.array(pdfc); Xc = np.c_[pdfc[:, 0], -pdfc[:, 1], np.ones(len(pdfc))]
seen = set(); gc = []
for p in json.load(open(os.path.join(RAW, "parcels.json"))):
    rr = (p.get("g") or {}).get("rings")
    if not rr: continue
    pg = Polygon(rr[0]).buffer(0)
    k = (round(pg.centroid.x, 5), round(pg.centroid.y, 5))
    if k in seen or not town.buffer(0.002).contains(pg.centroid): continue
    seen.add(k); gc.append(k)
GC = to_m(*zip(*gc)); tree = cKDTree(GC)
def refine(M):
    for thr in (120, 80, 50, 30, 20, 15, 12, 10, 10):
        Q = Xc @ M; dd, ii = tree.query(Q)
        keep = dd < thr
        M, *_ = np.linalg.lstsq(Xc[keep], GC[ii[keep]], rcond=None)
    Q = Xc @ M; dd, ii = tree.query(Q); return (dd < 8).sum(), M
# try the best outline rotations and their opposites (the outline is nearly symmetric end to end)
trials = []
for sc, deg in cands[:6]:
    for dg in (deg, (deg + 180) % 360):
        n, MM = refine(start(dg)); trials.append((n, dg, MM))
trials.sort(key=lambda t: -t[0]); M = trials[0][2]; best = (None, trials[0][1])
print("trials", [(int(n), d) for n, d, _ in trials[:4]])
# Final fit on streets: the PDF's street lines (light grey strokes, width 2) against the county road centerlines
# (RAW/roads.json, layer 18), both sampled densely; ICP with shrinking match distance. Street lines do not repeat
# the way a grid of lots does, so this settles the last shift.
def sample(seg, step):
    out = []
    for (a, b), (c, e) in zip(seg[:-1], seg[1:]):
        L = math.hypot(c - a, e - b); n = max(1, int(L / step))
        for t in np.linspace(0, 1, n, endpoint=False): out.append((a + (c - a) * t, b + (e - b) * t))
    return out
SP = []
for d in dr:
    if d["type"] == "s" and d.get("color") and all(abs(c - 0.8) < 0.01 for c in d["color"]) and abs((d.get("width") or 0) - 2) < 0.01 and d["rect"].x1 < 1090:
        for it in d["items"]:
            if it[0] == "l": SP += sample([(it[1].x, it[1].y), (it[2].x, it[2].y)], 0.7)
SP = np.array(SP); Xs = np.c_[SP[:, 0], -SP[:, 1], np.ones(len(SP))]
RG = []
for f in json.load(open(os.path.join(RAW, "roads.json"))):
    for path in (f.get("geometry") or {}).get("paths", []):
        m = to_m(*zip(*path)); RG += sample([tuple(x) for x in m], 3.0)
RG = np.array(RG); rtree = cKDTree(RG)
# Street names first: the centre of each street label in the PDF lies on the county road of the same name.
# Names make the match unambiguous, so this fixes the block-sized shifts a lot or street grid allows.
from shapely.geometry import LineString, MultiLineString, Point as SPoint
byname = {}
for f in json.load(open(os.path.join(RAW, "roads.json"))):
    nm = (f["attributes"].get("FULLNAME") or "").strip().upper()
    for path in (f.get("geometry") or {}).get("paths", []):
        byname.setdefault(nm, []).append(LineString([tuple(x) for x in to_m(*zip(*path))]))
byname = {k: MultiLineString(v) for k, v in byname.items()}
labels = []
for b in page.get_text("dict")["blocks"]:
    for l in b.get("lines", []):
        t = " ".join(s["text"] for s in l["spans"]).strip().upper()
        x0, y0, x1, y1 = l["bbox"]
        if x1 < 1090 and t in byname: labels.append((t, (x0 + x1) / 2, (y0 + y1) / 2))
XL = np.array([[x, -y, 1.0] for t, x, y in labels])
for thr in (150, 100, 60, 40, 25, 15, 10, 10):
    Q = XL @ M; tg = []; ok = []
    for (t, _, _), q in zip(labels, Q):
        g = byname[t]; pp = g.interpolate(g.project(SPoint(q[0], q[1])))
        tg.append((pp.x, pp.y)); ok.append(math.hypot(pp.x - q[0], pp.y - q[1]) < thr)
    ok = np.array(ok); tg = np.array(tg)
    M, *_ = np.linalg.lstsq(XL[ok], tg[ok], rcond=None)
Q = XL @ M
lab_err = [SPoint(q[0], q[1]).distance(byname[t]) for (t, _, _), q in zip(labels, Q)]
label_fit = {"street_labels": len(labels), "label_median_m": round(float(np.median(lab_err)), 1), "label_p90_m": round(float(np.percentile(lab_err, 90)), 1)}
print(label_fit)
for thr in (12, 8, 6, 5, 5):
    dd, ii = rtree.query(Xs @ M); keep = dd < thr
    M, *_ = np.linalg.lstsq(Xs[keep], RG[ii[keep]], rcond=None)
dd, ii = rtree.query(Xs @ M)
# Last step: a second-order polynomial fit on parcel centroids (PDF parcel against nearest county parcel, pairs under 8 m),
# which takes up the slow stretch along the town's length that one affine fit leaves.
def feat(xy):
    x = xy[:, 0] / 1000.0; y = xy[:, 1] / 1000.0
    return np.c_[np.ones(len(x)), x, y, x * x, x * y, y * y]
PC = np.c_[pdfc[:, 0], -pdfc[:, 1]]
F2 = feat(PC); C2 = np.zeros((6, 2)); C2[0] = M[2]; C2[1] = M[0] * 1000; C2[2] = M[1] * 1000
for thr in (10, 8, 8, 6, 6, 6):
    dd2, ii2 = tree.query(F2 @ C2); keep2 = dd2 < thr
    C2, *_ = np.linalg.lstsq(F2[keep2], GC[ii2[keep2]], rcond=None)
# The lots and streets along the coast repeat every block, so the fit above can lock one avenue off along the
# coast. The street labels settle it: each label's centre must lie on the county road of the same name. Fit the
# polynomial again on labels (named roads) and parcels together, labels weighted heavily, then a short parcel ICP.
LP = np.array([[x, -y] for t, x, y in labels]); FL = feat(LP)
def label_targets(C):
    Q = FL @ C; tg = []; dist = []
    for (t, _, _), q in zip(labels, Q):
        g = byname[t]; pp = g.interpolate(g.project(SPoint(q[0], q[1]))); tg.append((pp.x, pp.y)); dist.append(math.hypot(pp.x - q[0], pp.y - q[1]))
    return np.array(tg), np.array(dist)
for it in range(25):
    tg, dl = label_targets(C2); ok = dl < max(40, np.median(dl) * 3)
    dd2, ii2 = tree.query(F2 @ C2); kp = dd2 < 6
    W = 20.0
    A = np.r_[FL[ok] * W, F2[kp]]; B = np.r_[tg[ok] * W, GC[ii2[kp]]]
    C2, *_ = np.linalg.lstsq(A, B, rcond=None)
tg, dl = label_targets(C2)
label_fit |= {"after_label_median_m": round(float(np.median(dl)), 1), "after_label_p90_m": round(float(np.percentile(dl, 90)), 1)}
print(label_fit)
dd2, ii2 = tree.query(F2 @ C2)
poly_fit = {"poly_parcel_pairs_under_6m": int((dd2 < 6).sum()), "poly_parcel_median_m": round(float(np.median(dd2[dd2 < 6])), 1)}
dd3, ii3 = rtree.query(feat(np.c_[SP[:, 0], -SP[:, 1]]) @ C2)
poly_fit |= {"poly_street_within_6m": round(float((dd3 < 6).mean()), 3), "poly_street_median_m": round(float(np.median(dd3)), 1)}
print(poly_fit)
street_fit = {"street_points": int(len(SP)), "street_within_6m": round(float((dd < 6).mean()), 3), "street_median_m": round(float(np.median(dd)), 1)}
print(street_fit)
Q = Xc @ M; dd, ii = tree.query(Q); keep = dd < 10
dist = dd[keep]
fit = dict(street_fit); fit |= poly_fit; fit["poly_coef"] = C2.tolist(); fit |= label_fit; fit |= {"outline_mean_error_m": outline_fit[0], "outline_p90_error_m": outline_fit[1], "parcel_pairs": int(keep.sum()), "pdf_parcels": int(len(pdfc)), "county_parcels": len(gc),
       "parcel_median_error_m": round(float(np.median(dist)), 1),"rotation_start_deg": best[1], "parcel_p90_error_m": round(float(np.percentile(dist, 90)), 1), "points": int(len(P)), "matrix": M.tolist(), "lon0": lon0, "lat0": lat0}
print(fit)
def pdf_to_ll(xy):
    xy = np.asarray(xy, float); xy = feat(np.c_[xy[:, 0], -xy[:, 1]]) @ C2
    return np.c_[xy[:, 0] / kx + lon0, xy[:, 1] / ky + lat0]
feats = []
for d in dr:
    if not d.get("fill") or d["type"] not in ("f", "fs"): continue
    key = tuple(round(x, 3) for x in d["fill"]); z = LEGEND.get(key)
    if not z: continue
    pts = pts_of(d)
    if len(pts) < 3: continue
    r = d["rect"]
    if r.x0 > 1090: continue   # legend swatches
    ll = pdf_to_ll(pts)
    poly = Polygon(ll).buffer(0)
    if poly.is_empty: continue
    feats.append({"type": "Feature", "properties": {"zone": z}, "geometry": mapping(poly)})
# dissolve by district (the PDF draws many polygons twice, filled and filled-and-stroked)
from shapely.ops import unary_union
from shapely.geometry import shape as _shape
byz = {}
for f in feats: byz.setdefault(f["properties"]["zone"], []).append(_shape(f["geometry"]))
order = ["C4", "C3", "C2", "PL", "MP", "PD", "C1", "R3", "R2", "R1"]   # smaller districts drawn on top win an overlap
done = None; feats = []
for z in order:
    if z not in byz: continue
    g = unary_union(byz[z]).buffer(0)
    if done is not None: g = g.difference(done)
    done = g if done is None else unary_union([done, g])
    feats.append({"type": "Feature", "properties": {"zone": z}, "geometry": mapping(g)})
json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(RAW, "zoning-polys.geojson"), "w"))
json.dump(fit, open(os.path.join(D, "zoning-georef.json"), "w"), indent=1)
print(len(feats), "zoning polygons")
