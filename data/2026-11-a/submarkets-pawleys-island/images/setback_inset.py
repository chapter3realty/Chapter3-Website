"""The south-end setback inset for /submarkets/pawleys-island/: the state's baseline and setback lines
(SCDHEC OCRM 2018, Georgetown County GIS Nature 6 and 7, full resolution) and the 2024 county footprint
of each oceanfront island house in the frame, flagged when at least 20 square metres of it lie on the
ocean side of the setback line. Same test as the verifier's setback2.py (1 m grid in a local metre
grid; ledger row 22). Writes setback-inset.json next to this script. No address, parcel number or
owner field is written. Usage: python3 -I setback_inset.py <raw dir>"""
import json, sys, os, math
import numpy as np, shapely
from shapely.geometry import shape, Point, box, mapping
from shapely.ops import unary_union, nearest_points
from shapely.strtree import STRtree
R = sys.argv[1]; here = os.path.dirname(os.path.abspath(__file__))
L = lambda n: json.load(open(os.path.join(R, n)))['features']
FR = json.load(open(os.path.join(here, 'naip-frames.json')))['south']['bbox_wgs84']
frame = box(*FR)
K = math.cos(math.radians(33.43))
P = lambda g: shapely.transform(g, lambda c: np.column_stack([c[:, 0] * 111320 * K, c[:, 1] * 110950]))
town = P([shape(f['geometry']) for f in L('munis.geojson') if 'PAWLEYS' in f['properties']['Name']][0])
sb0 = unary_union([shape(f['geometry']) for f in L('ocrm-setback.geojson') if f['geometry']])
bl0 = unary_union([shape(f['geometry']) for f in L('ocrm-baseline.geojson') if f['geometry']])
sb, bl = P(sb0), P(bl0)
ENDS = [Point(c) for l in getattr(sb, 'geoms', [sb]) for c in (l.coords[0], l.coords[-1])]
def seaward(pt):
    a, _ = nearest_points(sb, pt)
    if min(a.distance(e) for e in ENDS) < 1: return False
    b, _ = nearest_points(bl, a)
    return ((b.x - a.x) * (pt.x - a.x) + (b.y - a.y) * (pt.y - a.y)) > 0 and pt.distance(sb) < 300
par = [f for f in L('parcels.geojson') if f['geometry'] and shape(f['geometry']).intersects(frame)]
bld = [b for b in L('bld2024-all.geojson') if shape(b['geometry']).intersects(frame)]
bg = [P(shape(b['geometry'])) for b in bld]; bp = [g.representative_point() for g in bg]
tr = STRtree(bp)
houses = []
for f in par:
    code = f['properties']['LandUseCode'] or ''
    if code[1:] not in ('100', '101', '500'): continue
    g = P(shape(f['geometry']).buffer(0)); pt = g.representative_point()
    if not town.contains(pt): continue
    js = list(tr.query(g, predicate='contains'))
    if not js: continue
    if not (g.distance(sb) < 2 or g.distance(bl) < 2 or seaward(pt)): continue
    j = max(js, key=lambda j: bg[j].area); h = bg[j]
    n = 0
    if not (h.distance(sb) > 40 and not seaward(h.representative_point())):
        x0, y0, x1, y1 = h.bounds
        pts = [Point(x, y) for x in np.arange(x0 + .5, x1, 1.) for y in np.arange(y0 + .5, y1, 1.)]
        n = sum(1 for p in pts if h.contains(p) and seaward(p))
    g0 = shape(bld[j]['geometry'])
    if not g0.intersects(frame): continue
    ring = [[round(x, 6), round(y, 6)] for x, y in (g0.exterior.coords if g0.geom_type == 'Polygon' else max(g0.geoms, key=lambda q: q.area).exterior.coords)]
    houses.append({'ring': ring, 'sq_m_past_setback': n, 'past': n >= 20})
def lines(g):
    g = g.intersection(frame.buffer(0.0005))
    return [[[round(x, 6), round(y, 6)] for x, y in l.coords] for l in getattr(g, 'geoms', [g]) if not l.is_empty]
out = {'frame_wgs84': FR, 'setback': lines(sb0), 'baseline': lines(bl0), 'houses': houses,
       'count': {'oceanfront_houses': len(houses), 'past_setback_20sqm': sum(h['past'] for h in houses)},
       'note': 'SCDHEC OCRM 2018 baseline and setback lines and 2024 building footprints, Georgetown County GIS. A house is flagged when at least 20 square metres (about 215 square feet) of its largest footprint lie seaward of the setback line (1 m grid, local metre grid), as in the verifier\'s test for ledger row 22.'}
json.dump(out, open(os.path.join(here, 'setback-inset.json'), 'w'))
print(out['count'], [round(h['sq_m_past_setback']) for h in houses])
