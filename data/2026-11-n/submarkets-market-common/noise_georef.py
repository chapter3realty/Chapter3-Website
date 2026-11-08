#!/usr/bin/env python3
"""Place the 65 dB DNL noise contour lines from Myrtle Beach International Airport's Airport Layout Plan, sheet 14 of 15
("Airport - Community Land Use Compatibility Drawing", dated 07/11/2023, AIP 3-45-0065-058-2018, hosted by the SC Aeronautics
Commission: https://aeronautics.sc.gov/sites/default/files/2025-03/14-MYR-LDU-36x48.pdf) on the map, and measure how far the
Market Common's homes are from them.
Method: the sheet rendered at 100 dpi (pdftoppm -r 100). Two control points: the runway ends printed on the sheet
(Runway 18 end N 33 41 33.08, W 78 55 53.45; Runway 36 end N 33 40 01.05, W 78 55 30.47) at the pixels of the runway
centerline ends (P18, P36 below, read by eye at 2x zoom). A similarity transform (rotation, scale, shift; no skew) maps pixels
to meters. Check: the runway is 1,901 px on the sheet and 2,898 m between the printed ends, 1.525 m (5.0 ft) per px, which
matches the sheet's 1 inch = 500 ft scale. The county parcels are drawn back onto the sheet (check-overlay.png) to see the fit.
The 65 dB lines are the sheet's dark blue line pixels (solid = existing 2018, dashed = forecast 2038), selected by colour.
Run: RAW=<scratch> SHEET=<png> python3 -I noise_georef.py <this dir>. Writes noise-findings.json and RAW/check-overlay.png."""
import sys, os, json, math, cmath
from PIL import Image, ImageDraw
from shapely.geometry import Polygon, Point, MultiPoint
from shapely.ops import unary_union
Image.MAX_IMAGE_PIXELS = None
D = sys.argv[1]; RAW = os.environ["RAW"]
P18 = (1390, 1279); P36 = (3291, 1278.5)
def dms(d, m, s): return d + m / 60 + s / 3600
G18 = (dms(33, 41, 33.08), -dms(78, 55, 53.45)); G36 = (dms(33, 40, 1.05), -dms(78, 55, 30.47))
LAT0 = 33.68; KX = 111320 * math.cos(math.radians(LAT0)); KY = 110950
def g2m(lat, lon): return complex((lon - G18[1]) * KX, (lat - G18[0]) * KY)
def m2g(w): return (G18[0] + w.imag / KY, G18[1] + w.real / KX)
def p2z(x, y): return complex(x, -y)
a = (g2m(*G36) - g2m(*G18)) / (p2z(*P36) - p2z(*P18)); b = g2m(*G18) - a * p2z(*P18)
def px2g(x, y): return m2g(a * p2z(x, y) + b)
def g2px(lat, lon): z = (g2m(lat, lon) - b) / a; return (z.real, -z.imag)
im = Image.open(os.environ["SHEET"]).convert("RGB"); W, H = im.size
px = im.load()
# dark blue line pixels, inside the drawing area (left of the title block, above the notes)
pts = []
for y in range(0, int(H * 0.77)):
    for x in range(0, int(W * 0.94)):
        r, g, bb = px[x, y]
        if r < 70 and 50 < g < 100 and bb > 100 and bb - r > 60: pts.append((x, y))
# drop thin leader lines and stray marks: keep a pixel only when 8 or more line pixels sit in its 5 x 5 neighbourhood
ps = set(pts)
pts = [(x, y) for x, y in pts if sum((x + i, y + j) in ps for i in range(-2, 3) for j in range(-2, 3)) >= 8]
print("blue line px", len(pts))
# homes
F = json.load(open(os.path.join(RAW, "parcels.json")))
zon = json.load(open(os.path.join(RAW, "zoning.json")))
def rings(g): return unary_union([Polygon(r).buffer(0) for r in g["rings"]])
PARTZ = {k: unary_union([rings(f["geometry"]) for f in zon if f["attributes"]["ZONING_DIS"] == z]) for k, z in (("town_center", "C6"), ("center_pointe", "CENTER POINTE PUD"), ("clemson_tract", "CLEMSON TRACT PUD"))}
parts = unary_union(list(PARTZ.values()))
homepart = []
homes = []
ov = im.copy(); dr = ImageDraw.Draw(ov)
for p in F:
    if not p.get("g"): continue
    try: g = rings(p["g"])
    except Exception: continue
    c = g.representative_point()
    lu = p.get("LandUseCode") or ""
    if not parts.contains(c): continue
    for ring in p["g"]["rings"]:
        dr.line([g2px(lat, lon) for lon, lat in ring], fill=(255, 0, 0), width=1)
    if lu.startswith("1") and (p.get("MarketImprv") or 0) > 0:
        homes.append(g2px(c.y, c.x)); homepart.append(next(k for k, v in PARTZ.items() if v.contains(c)))
ov.crop((int(W * 0.40), int(H * 0.25), int(W * 0.92), int(H * 0.80))).save(os.path.join(RAW, "check-overlay.png"))
# distance from each home to the nearest blue line pixel (straight line, in meters)
import bisect
pts.sort()
xs = [p[0] for p in pts]
def nearest(hx, hy, rad=1500):
    best = 1e9; i0 = bisect.bisect_left(xs, hx - rad); i1 = bisect.bisect_right(xs, hx + rad)
    for i in range(i0, i1):
        x, y = pts[i]; d = (x - hx) ** 2 + (y - hy) ** 2
        if d < best: best = d
    return math.sqrt(best) * abs(a)
dl = [nearest(x, y) for x, y in homes]
ds = sorted(dl)
out = {"sheet": "MYR ALP sheet 14 of 15, dated 07/11/2023", "m_per_px": round(abs(a), 4), "homes": len(ds),
       "nearest_home_to_65db_line_m": round(ds[0]), "nearest_home_to_65db_line_ft": round(ds[0] * 3.2808),
       "homes_within_m": {str(r): sum(1 for d in ds if d <= r) for r in (150, 300, 500, 800, 1000)},
       "median_m": round(ds[len(ds) // 2]),
       "by_part": {k: {"homes": sum(1 for p in homepart if p == k), "nearest_m": round(min(d for d, p in zip(dl, homepart) if p == k)),
                       "within_500m": sum(1 for d, p in zip(dl, homepart) if p == k and d <= 500), "within_800m": sum(1 for d, p in zip(dl, homepart) if p == k and d <= 800)} for k in PARTZ}}
json.dump(out, open(os.path.join(D, "noise-findings.json"), "w"), indent=1)
print(out)
# Straight-line distance from each home to the runway centerline (between the two printed runway ends)
from shapely.geometry import LineString
def m(lat, lon): w = g2m(lat, lon); return (w.real, w.imag)
rw = LineString([m(*G18), m(*G36)])
hm = []
for hx, hy in homes:
    lat, lon = px2g(hx, hy); hm.append(rw.distance(Point(*m(lat, lon))))
hm.sort()
out["runway_centerline"] = {"nearest_home_m": round(hm[0]), "nearest_home_ft": round(hm[0] * 3.2808), "median_home_m": round(hm[len(hm) // 2]),
                            "homes_within_half_mile": sum(1 for d in hm if d <= 804.7), "homes_within_one_mile": sum(1 for d in hm if d <= 1609.3)}
json.dump(out, open(os.path.join(D, "noise-findings.json"), "w"), indent=1)
print(out["runway_centerline"])
# The 65 dB area for our map: the concave hull of the blue line pixels (both the 2018 and 2038 lines), in longitude and latitude.
import shapely
mp = MultiPoint([px2g(x, y)[::-1] for x, y in pts[::3]])
hull = shapely.concave_hull(mp, ratio=0.03).simplify(0.0002)
json.dump({"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {"layer": "dnl65", "what": "Outer edge of the 65 dB DNL lines (2018 existing and 2038 forecast), MYR ALP sheet 14, traced"},
           "geometry": shapely.geometry.mapping(hull)}]}, open(os.path.join(D, "map-noise.geojson"), "w"))
print("hull area sq mi", round(hull.area * 69.05 * 57.6, 2))
