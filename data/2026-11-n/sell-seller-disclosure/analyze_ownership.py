#!/usr/bin/env python3
"""How many Horry County homes have had the same owner since before Hurricane Matthew (2016) or Florence (2018).
Why: the state form's flood questions 20 and 25 to 27 ask about the seller's own years of ownership, so an owner who bought
before a storm must answer for that storm.
Run: RAW=<dir with the sibling's big raw files> python3 -I analyze_ownership.py   (needs shapely 2)
Inputs from RAW (made by data/2026-10-d/buyers-undisclosed-flooding/fetch_county.py, pulled 2026-11-01):
res-parcels.json (residential parcels with a building: PIN, LandUseCode, SaleDate = last recorded sale), addresses-points.json,
flood-sfha.json (FEMA high-risk zone, SFHA_TF = 'T').
Kind of home by land use code, as in the sibling ledger (sell-out-of-state-buyers row 1). A parcel with no sale date is counted apart.
Writes ownership-findings.json (counts only)."""
import json, os, datetime, collections as C
import numpy as np, shapely
from shapely.geometry import Polygon
from shapely.ops import unary_union
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.environ['RAW']
L = lambda f: json.load(open(os.path.join(RAW, f)))
def esri(feat):
    g = None
    for r in feat['geometry']['rings']:
        if len(r) < 4: continue
        p = Polygon(r).buffer(0); g = p if g is None else g.symmetric_difference(p)
    return g
sfha = unary_union([esri(f) for f in L('flood-sfha.json')]); shapely.prepare(sfha)
res = {str(int(r['PIN'])): r for r in L('res-parcels.json') if r.get('PIN')}
pt = {}
for a in L('addresses-points.json'):
    if a.get('x') is not None and a.get('PIN'):
        p = str(int(a['PIN']))
        if p in res and p not in pt: pt[p] = (a['x'], a['y'])
ks = list(pt); x = np.array([pt[k][0] for k in ks]); y = np.array([pt[k][1] for k in ks])
insf = dict(zip(ks, shapely.contains_xy(sfha, x, y)))
def kind(lu):
    lu = str(lu or '')
    if lu in ('107', '135'): return 'condo'
    if lu == '109': return 'townhouse'
    if lu in ('100', '101', '102', '110', '126'): return 'house'
    if lu in ('120', '121'): return 'manufactured'
    return 'other'
STORMS = {'matthew': datetime.date(2016, 10, 8), 'florence': datetime.date(2018, 9, 14), 'ian': datetime.date(2022, 9, 30)}
def ms(d): return int(datetime.datetime(d.year, d.month, d.day, tzinfo=datetime.timezone.utc).timestamp() * 1000)
def tally(rows):
    o = {'parcels': len(rows), 'no_sale_date': sum(1 for r in rows if not r.get('SaleDate'))}
    dated = [r for r in rows if r.get('SaleDate')]; o['with_sale_date'] = len(dated)
    for s, d in STORMS.items():
        n = sum(1 for r in dated if r['SaleDate'] < ms(d)); o['owned_before_' + s] = n; o['pct_before_' + s] = round(100 * n / len(dated), 1) if dated else None
    return o
by = C.defaultdict(list); by_sf = C.defaultdict(list)
for p, r in res.items():
    k = kind(r.get('LandUseCode')); by[k].append(r); by['all'].append(r)
    if insf.get(p): by_sf[k].append(r); by_sf['all'].append(r)
out = {'pulled_parcels': '2026-11-01 (sibling pull)', 'storms': {k: v.isoformat() for k, v in STORMS.items()},
       'all_county': {k: tally(v) for k, v in by.items()}, 'in_fema_high_risk_zone': {k: tally(v) for k, v in by_sf.items()},
       'note': 'In-zone counts use the address point; condo units without their own point are not in the zone counts.'}
json.dump(out, open(os.path.join(HERE, 'ownership-findings.json'), 'w'), indent=1); print(json.dumps(out, indent=1))
