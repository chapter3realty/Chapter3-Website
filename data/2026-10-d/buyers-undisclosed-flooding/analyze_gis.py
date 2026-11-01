#!/usr/bin/env python3
"""Where Hurricane Florence's water reached outside FEMA's high-risk zone, and the homes for sale now.
Run after fetch_county.py and pull_listings.py: python3 -I analyze_gis.py   (needs shapely 2)
Inputs (raw/): sfz.json (county Supplemental Flood Zone = Florence flood extent), flood-sfha.json (FEMA high-risk zone),
county.json, addresses-points.json (PIN + point), res-parcels.json (residential parcels with a building), listings-active.json.
Writes gis-findings.json (aggregates only; no addresses, PINs or listing IDs) and sfz-outside-sfha.geojson (for the map).
Method: an address point counts as inside a zone when the point falls inside the polygon. A residential address is one whose
PIN is a residential parcel with a building (LandUseCode 1xx, MarketImprv > 0). Homes are counted by distinct PIN.
A listing's seller purchase date is the parcel's last recorded sale (SaleDate) of the nearest address point within 40 m; houses,
townhouses and manufactured homes only (condo units share one point)."""
import json, os, math, datetime, collections as C
import numpy as np, shapely
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.environ.get('RAW', os.path.join(HERE, 'raw'))
def L(f):
    p = os.path.join(RAW, f)
    return json.load(open(p if os.path.exists(p) else os.path.join(HERE, 'raw', f)))
def esri(feat):
    g = None
    for r in feat['geometry']['rings']:
        if len(r) < 4: continue
        p = Polygon(r).buffer(0)
        g = p if g is None else g.symmetric_difference(p)
    return g
sfz = unary_union([esri(f) for f in L('sfz.json')])
sfha = unary_union([esri(f) for f in L('flood-sfha.json')])
county = unary_union([esri(f) for f in L('county.json')])
outside = sfz.difference(sfha)
for g in (sfz, sfha, county, outside): shapely.prepare(g)
KX, KY = 111.32 * math.cos(math.radians(33.8)), 110.95   # km per degree at the county's latitude
def km2(g): return round(g.area * KX * KY, 1)
out = {'built': datetime.date.today().isoformat(),
       'area_km2': {'sfz': km2(sfz), 'sfha_in_county': km2(sfha.intersection(county)), 'sfz_outside_sfha': km2(outside), 'county': km2(county)},
       'area_sq_mi': {}}
out['area_sq_mi'] = {k: round(v / 2.58999, 1) for k, v in out['area_km2'].items()}
res = {}
for r in L('res-parcels.json'):
    if r.get('PIN'): res[str(int(r['PIN']))] = r
A = [a for a in L('addresses-points.json') if a.get('x') is not None and a.get('PIN')]
for a in A: a['PIN'] = str(int(a['PIN']))
A = [a for a in A if a['PIN'] in res]
x = np.array([a['x'] for a in A]); y = np.array([a['y'] for a in A])
in_sfz = shapely.contains_xy(sfz, x, y); in_sfha = shapely.contains_xy(sfha, x, y)
pins = lambda m: {str(A[i]['PIN']) for i in np.nonzero(m)[0]}
p_all, p_sfz, p_sfha = {str(a['PIN']) for a in A}, pins(in_sfz), pins(in_sfha)
p_sfz_out = pins(in_sfz & ~in_sfha)
def cat(pin):
    lu = str(res[pin].get('LandUseCode') or '')
    return lu
out['homes'] = {'residential_parcels_with_address_point': len(p_all), 'residential_parcels_all': len(res),
    'in_sfha': len(p_sfha), 'in_sfz': len(p_sfz), 'in_sfz_not_sfha': len(p_sfz_out - p_sfha),
    'in_sfz_not_sfha_landuse_top': C.Counter(cat(p) for p in (p_sfz_out - p_sfha)).most_common(8),
    'in_sfha_landuse_top': C.Counter(cat(p) for p in p_sfha).most_common(8)}
HOUSE = {'100', '101', '102', '110', '126'}; MFG = {'120', '121'}   # land use groups as read in the sibling ledger (sell-out-of-state-buyers)
kind = lambda ps, K: sum(1 for p in ps if cat(p) in K)
out['homes']['houses'] = {'with_point': kind(p_all, HOUSE), 'in_sfha': kind(p_sfha, HOUSE), 'in_sfz': kind(p_sfz, HOUSE), 'in_sfz_not_sfha': kind(p_sfz_out - p_sfha, HOUSE)}
# Robustness: drop slivers narrower than about 60 m (edge mismatch between the two maps) and count again
core = outside.buffer(-0.0003).buffer(0.0003); shapely.prepare(core)
in_core = shapely.contains_xy(core, x, y)
p_core = pins(in_core) - p_sfha
out['area_km2']['sfz_outside_sfha_without_slivers'] = km2(core); out['area_sq_mi']['sfz_outside_sfha_without_slivers'] = round(km2(core) / 2.58999, 1)
out['homes']['houses_in_sfz_not_sfha_without_slivers'] = kind(p_core, HOUSE)
out['homes']['manufactured_in_sfz_not_sfha_without_slivers'] = kind(p_core, MFG)
out['homes']['manufactured'] = {'with_point': kind(p_all, MFG), 'in_sfha': kind(p_sfha, MFG), 'in_sfz': kind(p_sfz, MFG), 'in_sfz_not_sfha': kind(p_sfz_out - p_sfha, MFG)}
# Listings
Ls = L('listings-active.json'); H = [h for h in Ls['homes'].values() if h.get('lat') and h.get('lng')]
lx = np.array([h['lng'] for h in H]); ly = np.array([h['lat'] for h in H])
inc = shapely.contains_xy(county, lx, ly)
l_sfz = shapely.contains_xy(sfz, lx, ly); l_sfha = shapely.contains_xy(sfha, lx, ly)
types = C.Counter(); t_sfha = C.Counter(); t_sfz = C.Counter(); t_out = C.Counter()
for i, h in enumerate(H):
    if not inc[i]: continue
    t = h['type']; types[t] += 1
    if l_sfha[i]: t_sfha[t] += 1
    if l_sfz[i]: t_sfz[t] += 1
    if l_sfz[i] and not l_sfha[i]: t_out[t] += 1
out['listings'] = {'pulled': Ls['pulled'], 'source_meta': Ls['meta']['source'], 'in_horry': sum(types.values()), 'by_type': dict(types),
    'in_sfha': dict(t_sfha), 'in_sfz': dict(t_sfz), 'in_sfz_not_sfha': dict(t_out),
    'in_sfha_total': sum(t_sfha.values()), 'in_sfz_total': sum(t_sfz.values()), 'in_sfz_not_sfha_total': sum(t_out.values())}
# Seller's purchase date for houses for sale (nearest address point within 40 m)
tree = shapely.STRtree(shapely.points(x, y))
cut = {'after_florence_2018_09_14': datetime.datetime(2018, 9, 14), 'after_matthew_2016_10_08': datetime.datetime(2016, 10, 8)}
cnt = C.Counter(); n = 0; nodate = 0
for i, h in enumerate(H):
    if not inc[i] or h['type'] == 'condo': continue
    if (h.get('tag') or '').startswith('Built 20'): cnt['skipped_new_construction_tag'] += 1; continue
    j = tree.query_nearest(shapely.Point(lx[i], ly[i]), max_distance=40 / 111000)
    if len(j) == 0: cnt['no_point_within_40m'] += 1; continue
    sd = res[str(A[int(j[0])]['PIN'])].get('SaleDate')
    if not sd: nodate += 1; continue
    d = datetime.datetime.utcfromtimestamp(sd / 1000) if isinstance(sd, (int, float)) else datetime.datetime.fromisoformat(str(sd)[:10])
    n += 1
    for k, c in cut.items():
        if d > c: cnt[k] += 1
    if d >= datetime.datetime(2025, 1, 1): cnt['bought_2025_or_later'] += 1
out['sellers'] = {'houses_matched_with_sale_date': n, 'no_sale_date': nodate, **dict(cnt),
    'pct_after_florence': round(100 * cnt['after_florence_2018_09_14'] / n, 1) if n else None,
    'pct_after_matthew': round(100 * cnt['after_matthew_2016_10_08'] / n, 1) if n else None}
json.dump(out, open(os.path.join(HERE, 'gis-findings.json'), 'w'), indent=1)
# Map layers for the page (simplified; chart and map are drawn from these, never typed)
fc = lambda name, g, tol: {'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {'name': name}, 'geometry': mapping(g.simplify(tol))}]}
json.dump(fc('Florence flood extent outside FEMA high-risk zone', outside, 0.0003), open(os.path.join(HERE, 'map-sfz-outside-sfha.geojson'), 'w'))
json.dump(fc('Florence flood extent outside FEMA high-risk zone, strips under ~60 m removed', core, 0.0003), open(os.path.join(HERE, 'map-sfz-outside-sfha-core.geojson'), 'w'))
json.dump(fc('Florence flood extent (Horry County Supplemental Flood Zone)', sfz, 0.0006), open(os.path.join(HERE, 'map-sfz.geojson'), 'w'))
json.dump(fc('FEMA high-risk flood zone (SFHA), current map', sfha.intersection(county), 0.0006), open(os.path.join(HERE, 'map-sfha.geojson'), 'w'))
json.dump(fc('Horry County', county, 0.001), open(os.path.join(HERE, 'map-county.geojson'), 'w'))
print(json.dumps(out, indent=1))
