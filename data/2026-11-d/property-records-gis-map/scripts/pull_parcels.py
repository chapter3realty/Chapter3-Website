# Pull every parcel's shape area and listed acreage from Horry County's public parcel layer
# (HorryCountyGISApp MapServer layer 24, public, used by Map Your Move). No owner fields are requested or saved.
# PIN and TMS are reduced to their digit pattern (9 for a digit) so no parcel id is stored.
import json, re, sys, time, urllib.request, urllib.parse
B = 'https://www.horrycountysc.gov/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query'
out = sys.argv[1]
lo, hi, step = 1, 302630, 2000
fields = 'OBJECTID,PARCELTYPE,Acreage,NumberOfLots,LandUseCode,TaxDistrict,Shape.STArea(),PIN,TMS,CONDOLABEL'
rows = []
def pat(v):
    return re.sub(r'\d', '9', str(v)) if v not in (None, '') else ''
a = lo
while a <= hi:
    q = urllib.parse.urlencode({'where': f'OBJECTID>={a} AND OBJECTID<{a+step}', 'outFields': fields,
                                'returnGeometry': 'false', 'f': 'json'})
    for t in range(4):
        try:
            d = json.load(urllib.request.urlopen(B + '?' + q, timeout=90)); break
        except Exception as e:
            time.sleep(3 * (t + 1)); d = None
    if d is None or 'features' not in d:
        print('FAIL', a, d, file=sys.stderr); a += step; continue
    for f in d['features']:
        x = f['attributes']
        rows.append({'oid': x['OBJECTID'], 'type': x.get('PARCELTYPE'), 'acres': x.get('Acreage'),
                     'lots': x.get('NumberOfLots'), 'landuse': x.get('LandUseCode'), 'district': x.get('TaxDistrict'),
                     'area_sqft': x.get('Shape.STArea()'), 'pin_pat': pat(x.get('PIN')), 'tms_pat': pat(x.get('TMS')),
                     'condo': 1 if x.get('CONDOLABEL') else 0})
    if exceeded := d.get('exceededTransferLimit'):
        print('EXCEEDED', a, file=sys.stderr)
    a += step
json.dump(rows, open(out, 'w'))
print('rows', len(rows))
