"""Map points for the DST-owned parcels in Horry County, from horry_dst_parcels.json (ledger row 25).
Each point is the plain average of the parcel's outer ring vertices (a parcel center for a map pin,
not a survey point). Parcels of one owner within 300 m share one point (Haven Pointe's two parcels).
kind comes from the verifier's wording in facts.md row 25: the two code 211 apartment parcels, the
code 213 residential community, and every other code as a commercial or industrial site.
home_parcels counts parcels in the county's house, condo and townhouse classes (101, 107, 108, 109, 110).
Run: python3 -I dst_parcel_points.py > dst_parcel_points.json
"""
import json, os, math, datetime
here = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(here, 'horry_dst_parcels.json')))
pts, owners, recent, total, home = [], set(), set(), 0, 0
for f in d['features']:
    a = f['attributes']; o = a['OwnerName'].split(' C/O')[0].strip(); owners.add(o)
    total += a['MarketProp'] or 0
    if a['LandUseCode'] in ('101', '107', '108', '109', '110'): home += 1
    if a['SaleDate'] and datetime.datetime.utcfromtimestamp(a['SaleDate'] / 1000).date() >= datetime.date(2024, 11, 1): recent.add(o)
    ring = f['geometry']['rings'][0]
    lon = sum(p[0] for p in ring) / len(ring); lat = sum(p[1] for p in ring) / len(ring)
    code = a['LandUseCode']
    if code == '211': kind = 'apt_cf' if 'CAROLINA FOREST' in o else 'apt_cp'
    elif code == '213': kind = 'res_17'
    elif code == '705': kind = None  # the $32 pump station parcel of the Haven Pointe trust; shares its community's point
    else: kind = 'other'
    pts.append({'owner': o, 'code': code, 'kind': kind, 'lat': round(lat, 5), 'lon': round(lon, 5)})
out = []
for p in pts:
    if p['kind'] is None: continue
    out.append({k: p[k] for k in ('kind', 'code', 'lat', 'lon')})
# the pump station must sit within 300 m of its own community's point
ps = [p for p in pts if p['kind'] is None]
for p in ps:
    m = [q for q in pts if q['owner'] == p['owner'] and q['kind']]
    dist = min(math.hypot((p['lat'] - q['lat']) * 111000, (p['lon'] - q['lon']) * 92500) for q in m)
    assert dist < 300, dist
print(json.dumps({'source': 'horry_dst_parcels.json (Horry County GIS, Parcels layer 24, pulled 2026-11-01)',
                  'parcels': len(d['features']), 'owners': len(owners), 'market_total': total,
                  'bought_since_2024_11': len(recent), 'home_parcels': home, 'points': out}, indent=1))
