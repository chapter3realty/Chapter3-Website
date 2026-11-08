#!/usr/bin/env python3
"""Residential parcels in Horry County that lie in whole or in part seaward of the state's setback line (SC Code 48-39-330).
Run after fetch_beachfront.py: python3 -I query_seaward_parcels.py   (needs shapely 2)
Seaward strip: a band W wide (default 0.004 degrees, about 400 m) on the ocean side of each setback line piece (the side that covers
less of the county's land). The band is kept narrow so it reaches the beach but not across an inlet to the next shore.
Asks the county's parcel layer (parcelapp layer 24) which parcels intersect the band, piece by piece, then measures each parcel's
distance from the setback line and keeps only parcels that touch the band within 150 m of the line (a check against inlet leaks).
Keeps PIN, LandUseCode, PARCELTYPE, MarketImprv (no owner fields). The parcel rows go to RAW/seaward-parcels.json (outside the repo;
PINs); seaward-findings.json holds counts only.  Run: RAW=<scratch dir> python3 -I query_seaward_parcels.py [W]"""
import json, os, sys, time, urllib.request, urllib.parse, collections as C
import shapely
from shapely.geometry import LineString, Polygon, mapping
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.environ['RAW']; W = float(sys.argv[1]) if len(sys.argv) > 1 else 0.004
UF = os.path.join(HERE, '..', '..', '2026-10-d', 'buyers-undisclosed-flooding', 'raw')
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
county = None
for f in json.load(open(os.path.join(UF, 'county.json'))):
    for r in f['geometry']['rings']:
        p = Polygon(r).buffer(0); county = p if county is None else county.symmetric_difference(p)
def q(params):
    data = urllib.parse.urlencode(dict(params, f='json')).encode()
    for i in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(PA, data=data), timeout=300).read())
            if 'error' in d: raise Exception(d['error'])
            return d
        except Exception as e:
            print('retry', e, file=sys.stderr); time.sleep(4)
    raise SystemExit('failed')
rows = {}
lines = json.load(open(os.path.join(HERE, 'raw', 'setback-current.json')))
for f in lines:
    for path in f['geometry']['paths']:
        if len(path) < 2: continue
        ln = LineString(path)
        a = ln.buffer(W, single_sided=True); b = ln.buffer(-W, single_sided=True)
        sea = a if a.intersection(county).area < b.intersection(county).area else b
        land = sea.intersection(county.buffer(0.0005))   # keep a 50 m margin so oceanfront lots that reach past the county line still count
        if land.is_empty: continue
        geoms = getattr(land, 'geoms', [land])
        for g in geoms:
            if g.geom_type != 'Polygon' or g.area < 1e-9: continue
            rings = [list(map(list, g.exterior.coords))] + [list(map(list, i.coords)) for i in g.interiors]
            feats = []; off = 0
            while True:
                d = q({'geometry': json.dumps({'rings': rings, 'spatialReference': {'wkid': 4326}}), 'geometryType': 'esriGeometryPolygon',
                       'inSR': 4326, 'spatialRel': 'esriSpatialRelIntersects', 'outFields': 'OBJECTID,PIN,LandUseCode,PARCELTYPE,MarketImprv,CONDOLABEL',
                       'returnGeometry': 'true', 'outSR': 4326, 'maxAllowableOffset': 0.00001, 'where': '1=1',
                       'orderByFields': 'OBJECTID', 'resultOffset': off, 'resultRecordCount': 1000})
                feats += d['features']; off += len(d['features'])
                if not d.get('exceededTransferLimit') or not d['features']: break
            d = {'features': feats}
            for x in d['features']:
                r = x['attributes']; gp = Polygon(x['geometry']['rings'][0]).buffer(0) if x.get('geometry') and x['geometry'].get('rings') else None
                inter = gp.intersection(sea) if gp is not None else None
                dm = round(inter.distance(ln) * 111000) if inter is not None and not inter.is_empty else None
                old = rows.get(str(r['PIN']))
                if old is None or (dm is not None and (old['dist_m'] is None or dm < old['dist_m'])):
                    rows[str(r['PIN'])] = dict(r, beach=f['attributes']['Beach'], dist_m=dm)
json.dump(list(rows.values()), open(os.path.join(RAW, 'seaward-parcels.json'), 'w'))
def kind(lu):
    lu = str(lu or '')
    if lu in ('107', '135'): return 'condo'
    if lu == '109': return 'townhouse'
    if lu in ('100', '101', '102', '110', '126'): return 'house'
    if lu in ('120', '121'): return 'manufactured'
    return 'residential other' if lu.startswith('1') else 'not residential'
res_all = [r for r in rows.values() if str(r.get('LandUseCode') or '').startswith('1') and (r.get('MarketImprv') or 0) > 0]
res = [r for r in res_all if r['dist_m'] is not None and r['dist_m'] <= 150]
out = {'band_degrees': W, 'all_parcels_touching_band': len(rows), 'residential_with_building_touching_band': len(res_all), 'residential_with_building': len(res), 'dropped_over_150m': len(res_all) - len(res),
       'by_kind': dict(C.Counter(kind(r['LandUseCode']) for r in res).most_common()),
       'by_beach': dict(C.Counter(r['beach'] for r in res).most_common()),
       'landuse_all_top': C.Counter(str(r.get('LandUseCode')) for r in rows.values()).most_common(15)}
json.dump(out, open(os.path.join(HERE, 'seaward-findings.json'), 'w'), indent=1); print(json.dumps(out, indent=1))
