"""Round 1 (fixer) measurements for /submarkets/pawleys-island/, written to raw/fix1-places.json.
Places from OpenStreetMap Nominatim (read 2026-11-02); side of US 17 by the same test as analyze.py
(east_of_17 against the county's US 17 line in map-layers.geojson); drives by the public OSRM router
from Town Hall (free flow), as pull_drives.py. Lodging-tax figures are typed from the town's own
documents (rows 52 and 53 of the ledger), with their sources.
Run: python3 -I fix1_places.py <datadir>"""
import json, os, sys, urllib.request
from shapely.geometry import shape, Point
from shapely.ops import nearest_points, linemerge
D = sys.argv[1]; T = (-79.12152664, 33.43324962); M = 1 / 111000
G = json.load(open(os.path.join(D, 'map-layers.geojson')))
us = linemerge([g for f in G['features'] if f['properties']['layer'] == 'us17' for g in (shape(f['geometry']).geoms if shape(f['geometry']).geom_type.startswith('Multi') else [shape(f['geometry'])])])
lines = list(getattr(us, 'geoms', [us]))
def east(pt):
    line = min(lines, key=lambda l: l.distance(pt)); a, _ = nearest_points(line, pt); d = line.project(a)
    p1 = line.interpolate(max(d - 30 * M, 0)); p2 = line.interpolate(d + 30 * M)
    cross = (p2.x - p1.x) * (pt.y - p1.y) - (p2.y - p1.y) * (pt.x - p1.x)
    return (cross < 0) if p2.y > p1.y else (cross > 0)
def zone(lo, la):
    if east(Point(lo, la)): return 'litchfield' if la >= 33.447 else 'behind'
    return 'west17'
OSM = {  # name: (osm ref, kind, lon, lat)
    'Hammock Shops Village': ('way/12400033', 'shops', -79.1224807, 33.4433758),
    'Publix, 10225 Ocean Highway': ('node/5138543020', 'supermarket', -79.1315625, 33.4384867),
    'The Fresh Market, Ocean Highway': ('node/5148415753', 'supermarket', -79.1202931, 33.4502567),
    'Food Lion, 9380 Ocean Highway': ('node/1202153686', 'supermarket', -79.1430727, 33.4301517),
    'Lowes Foods, 9160 Ocean Highway': ('node/5138542965', 'supermarket', -79.1465156, 33.4282826),
    'Food Lion, 115 Willbrook Boulevard': ('node/5148415762', 'supermarket', -79.0989276, 33.4833811),
    'The Reserve Golf Club': ('way/342217465', 'golf_course', -79.1100171, 33.4953903),
    'Tradition Golf Club': ('relation/4855534', 'golf_course', -79.1149571, 33.4845647),
    'True Blue Golf Plantation': ('relation/4856438', 'golf_course', -79.1487458, 33.4413104),
    'Caledonia Golf & Fish Club': ('way/342296678', 'golf_course', -79.1515069, 33.4528128),
    'Willbrook Plantation': ('relation/4855578', 'golf_course', -79.1204793, 33.4896526),
    'Litchfield Country Club': ('relation/4855642', 'golf_course', -79.1161444, 33.4750777),
    'The River Club': ('relation/4855658', 'golf_course', -79.1311081, 33.4723123),
    'Pawleys Plantation (course on Pawleys Plantation Way)': ('relation/18995919', 'golf_course', -79.1439767, 33.4190769),
    'Heritage Club': ('relation/4856858', 'golf_course', -79.1607462, 33.4429715),
    'Founders Club at Pawleys Island': ('relation/4856975', 'golf_course', -79.1594993, 33.4283024),
    'Waccamaw Neck Bikeway, south end (Pawleys Landing)': ('way/294240301', 'cycleway', -79.1427485, 33.4312906),
    'Waccamaw Neck Bikeway, Litchfield': ('way/199920704', 'cycleway', -79.1060900, 33.4864604),
    'Waccamaw Neck Bikeway, Murrells Inlet': ('way/1037796532', 'cycleway', -79.0600391, 33.5300431),
}
out = {'start': T, 'places': {}, 'drives': {}}
for k, (ref, kind, lo, la) in OSM.items():
    out['places'][k] = {'osm': 'https://www.openstreetmap.org/' + ref, 'kind': kind, 'lon': lo, 'lat': la, 'part': zone(lo, la)}
for k in ('Hammock Shops Village', 'Publix, 10225 Ocean Highway'):
    lo, la = OSM[k][2], OSM[k][3]
    u = 'https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false' % (T[0], T[1], lo, la)
    r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read())['routes'][0]
    out['drives'][k] = {'url': u, 'minutes': round(r['duration'] / 60, 1), 'miles': round(r['distance'] / 1609.344, 2)}
out['lodging_tax'] = {
    'state_atax_2024_quarters': [12261.58, 127127.66, 307942.89, 85085.03], 'state_atax_2024_total': 532417.16,
    'state_atax_source': 'https://www.townofpawleysisland.com/wp-content/uploads/2026/02/Pawleys-Island-Atax-Agenda_Packet-Nov-2025-1.pdf (memo "2024 Accommodations Tax for 4 Quarters", November 18, 2025)',
    'state_atax_rate': 0.02, 'state_atax_law': 'SC Code 12-36-2630(3): a two percent local accommodations tax, remitted quarterly to the municipality where it is collected, less the department\'s added cost',
    'local_atax_2024_actual': 828307, 'local_atax_line': '40700-07 Pawleys Accommodations/Hospitality Tax, Local ATAX Fund, 2024 actual',
    'local_atax_source': 'https://www.townofpawleysisland.com/wp-content/uploads/2025/12/2026-Annual-Budget-FINAL.pdf (Local ATAX Fund page)',
    'local_rates': 'Town monthly form: accommodations 3 percent (line 2), food and beverage hospitality tax 2 percent (line 4)'}
lt = out['lodging_tax']
lt['rent_from_state_2pct'] = round(lt['state_atax_2024_total'] / 0.02)
lt['rent_ceiling_from_local_3pct'] = round(lt['local_atax_2024_actual'] / 0.03)
json.dump(out, open(os.path.join(D, 'raw', 'fix1-places.json'), 'w'), indent=1)
for k, v in out['places'].items(): print(f"{v['part']:10} {k}")
print(out['drives']); print(lt['rent_from_state_2pct'], lt['rent_ceiling_from_local_3pct'])
