"""Batch 2026-11-b, /buyers/waterfront-homes/. Does the sun rise over the ocean all year on Horry County's beach?
1. The direction the beach faces: for each stretch of the coastline (RAW/coast.json, the county boundary's ocean edge,
   the Georgetown county line trimmed off), the bearing square to the shore, toward the sea.
2. Where the sun rises: NOAA's solar position equations (NOAA Global Monitoring Laboratory, "General Solar Position
   Calculations", https://gml.noaa.gov/grad/solcalc/solareqns.PDF), every day of 2026, at each stretch's latitude and
   longitude. Sunrise is when the sun's centre is 0.833 degrees below the horizon (refraction and the sun's radius).
3. The open sea is everything within 90 degrees of the direction the beach faces (a straight shore).
Writes sunrise.json. Run: RAW=<scratch> python3 -I sunrise.py"""
import json, os, math, datetime
RAW = os.environ["RAW"]; HERE = os.path.dirname(os.path.abspath(__file__))
cc = json.load(open(os.path.join(RAW, "coast.json")))["coordinates"]
while cc[-1][0] < -79.0008: cc.pop()
lat0 = 33.7; kx = 111320 * math.cos(math.radians(lat0)); ky = 110540
def bearing(a, b):   # degrees clockwise from north, from a to b
    return (math.degrees(math.atan2((b[0] - a[0]) * kx, (b[1] - a[1]) * ky)) + 360) % 360
# stretches about 8 km long, walking from the state line south-west
pts = cc; stretches = []; cur = [pts[0]]; dist = 0
for p, q in zip(pts, pts[1:]):
    dist += math.hypot((q[0] - p[0]) * kx, (q[1] - p[1]) * ky); cur.append(q)
    if dist >= 8000: stretches.append(cur); cur = [q]; dist = 0
if len(cur) > 1: stretches.append(cur)
def sun(lat, lon, day):
    """NOAA equations: declination (rad) and the hour angle at sunrise; returns the sunrise azimuth in degrees."""
    g = 2 * math.pi / 365 * (day - 1 + (6 - 12) / 24)
    dec = (0.006918 - 0.399912 * math.cos(g) + 0.070257 * math.sin(g) - 0.006758 * math.cos(2 * g) + 0.000907 * math.sin(2 * g)
           - 0.002697 * math.cos(3 * g) + 0.00148 * math.sin(3 * g))
    phi = math.radians(lat); zen = math.radians(90.833)
    ha = math.acos(math.cos(zen) / (math.cos(phi) * math.cos(dec)) - math.tan(phi) * math.tan(dec))
    # azimuth of the sun at that hour angle (morning: negative hour angle)
    cosz = math.cos(zen)
    az = math.degrees(math.acos((math.sin(dec) - math.sin(phi) * cosz) / (math.cos(phi) * math.sin(zen))))
    return az   # morning azimuth east of north
out = {"method": __doc__.split("\n", 1)[1].split("Writes")[0].strip(), "stretches": []}
for s in stretches:
    a, b = s[0], s[-1]
    along = bearing(a, b)                          # walking south-west along the shore
    sea = (along - 90) % 360                       # the sea is on the left of a walk to the south-west
    mid = s[len(s) // 2]
    azs = [sun(mid[1], mid[0], d) for d in range(1, 366)]
    lo, hi = (sea - 90) % 360, (sea + 90) % 360
    over_sea = sum(lo <= z <= hi for z in azs)
    out["stretches"].append({"from": [round(a[1], 4), round(a[0], 4)], "to": [round(b[1], 4), round(b[0], 4)], "beach_faces_deg": round(sea, 1),
                             "open_sea_from_deg": round(lo, 1), "open_sea_to_deg": round(hi, 1),
                             "sunrise_az_min_deg": round(min(azs), 1), "sunrise_az_max_deg": round(max(azs), 1), "days_sun_rises_over_sea": over_sea})
out["all_year_everywhere"] = all(s["days_sun_rises_over_sea"] == 365 for s in out["stretches"])
json.dump(out, open(os.path.join(HERE, "sunrise.json"), "w"), indent=1)
for s in out["stretches"]: print(s)
print("all year everywhere:", out["all_year_everywhere"])
