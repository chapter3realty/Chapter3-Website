#!/usr/bin/env python3
"""NFIP paid claims in Horry County (OpenFEMA NfipClaims v3, countyCode 45051). Run: python3 -I analyze_claims.py
Writes claims-findings.json. A claim is 'paid' when net building + contents + ICC payment > 0.
'High-risk' = ratedFloodZone starting with A or V (FEMA Special Flood Hazard Area). 'Outside' = X, B or C."""
import json, os, statistics as S, collections as C
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.environ.get('RAW', os.path.join(HERE, 'raw'))
FULL = os.path.join(RAW, 'nfip-claims-horry.json'); SLIM = os.path.join(HERE, 'raw', 'nfip-claims-horry-slim.json')
KEEP = ['yearOfLoss', 'dateOfLoss', 'floodEvent', 'ratedFloodZone', 'floodZoneCurrent', 'occupancyType', 'censusGeoid', 'reportedZipCode', 'nfipCommunityName',
        'netBuildingPaymentAmount', 'netContentsPaymentAmount', 'netIccPaymentAmount', 'causeOfDamage', 'primaryResidenceIndicator', 'asOfDate']
if os.path.exists(FULL):   # make the slim copy kept in the repo (no field identifies a building)
    d = json.load(open(FULL)); d['rows'] = [{k: r.get(k) for k in KEEP} for r in d['rows']]; json.dump(d, open(SLIM, 'w'))
d = json.load(open(SLIM))
RES = {1, 2, 3, 11, 12, 13, 14, 15, 16}
def paid(r): return sum((r.get(k) or 0) for k in ('netBuildingPaymentAmount', 'netContentsPaymentAmount', 'netIccPaymentAmount')) > 0
def grp(z):
    if not z: return 'unknown'
    return 'high' if z[0] in 'AV' else ('outside' if z[0] in 'XBC' else 'other')
P = [r for r in d['rows'] if paid(r)]
def summary(rows):
    g = C.Counter(grp(r.get('ratedFloodZone')) for r in rows)
    known = g['high'] + g['outside']
    bp = [r['netBuildingPaymentAmount'] for r in rows if (r.get('netBuildingPaymentAmount') or 0) > 0]
    return {'paid': len(rows), 'high': g['high'], 'outside': g['outside'], 'unknown': g['unknown'] + g['other'],
            'pct_outside_of_known': round(100 * g['outside'] / known, 1) if known else None,
            'median_net_building_payment': round(S.median(bp)) if bp else None, 'n_building_payments': len(bp)}
out = {'source': d['source'], 'filter': d['filter'], 'pulled': d['pulled'], 'records': d['count'], 'asOfDate': d['rows'][0]['asOfDate']}
out['all_paid'] = summary(P)
out['all_paid_residential'] = summary([r for r in P if r.get('occupancyType') in RES])
out['since_2015'] = summary([r for r in P if r['yearOfLoss'] >= 2015])
ev = {}
for name in ['Hurricane Hugo', 'Hurricane Floyd', 'Hurricane Matthew', 'Hurricane Florence', 'Hurricane Ian', 'Hurricane Isaias', 'October severe storms', 'Flooding']:
    rows = [r for r in P if r.get('floodEvent') == name]
    s = summary(rows); s['years'] = dict(C.Counter(r['yearOfLoss'] for r in rows))
    s['cause'] = dict(C.Counter(r.get('causeOfDamage') for r in rows))
    s['top_communities'] = C.Counter(r.get('nfipCommunityName') for r in rows).most_common(6)
    s['top_zips'] = C.Counter(r.get('reportedZipCode') for r in rows).most_common(8)
    ev[name] = s
out['events'] = ev
out['by_year'] = dict(sorted(C.Counter(r['yearOfLoss'] for r in P).items()))
out['by_year_outside'] = dict(sorted(C.Counter(r['yearOfLoss'] for r in P if grp(r.get('ratedFloodZone')) == 'outside').items()))
tr = C.defaultdict(lambda: C.Counter())
for r in P:
    g = (r.get('censusGeoid') or '')[:11]
    if len(g) != 11: continue
    tr[g]['paid'] += 1; tr[g][grp(r.get('ratedFloodZone'))] += 1
    if r.get('floodEvent') == 'Hurricane Florence': tr[g]['florence'] += 1; tr[g]['florence_' + grp(r.get('ratedFloodZone'))] += 1
    if r['yearOfLoss'] >= 2015: tr[g]['since2015'] += 1; tr[g]['since2015_' + grp(r.get('ratedFloodZone'))] += 1
out['tracts'] = {k: dict(v) for k, v in sorted(tr.items())}
out['n_tracts_with_paid'] = len(tr)
out['tracts_with_outside_claims'] = sum(1 for v in tr.values() if v['outside'] > 0)
out['primary_residence_share_paid'] = round(100 * sum(1 for r in P if r.get('primaryResidenceIndicator')) / len(P), 1)
# Same claims on today's map (floodZoneCurrent: the zone where the building sits on the current FIRM; blank on many old claims)
def cur(rows):
    g = C.Counter(grp(r.get('floodZoneCurrent')) for r in rows)
    k = g['high'] + g['outside']
    return {'with_current_zone': k, 'current_high': g['high'], 'current_outside': g['outside'], 'current_unknown': g['unknown'] + g['other'],
            'pct_outside_today_of_known': round(100 * g['outside'] / k, 1) if k else None,
            'rated_outside_and_outside_today': sum(1 for r in rows if grp(r.get('ratedFloodZone')) == 'outside' and grp(r.get('floodZoneCurrent')) == 'outside')}
out['current_map'] = {'note': 'Current FIRMs for Horry County and its towns took effect 12/16/21 (FEMA Community Status Book).',
    'florence': cur([r for r in P if r.get('floodEvent') == 'Hurricane Florence']),
    'matthew': cur([r for r in P if r.get('floodEvent') == 'Hurricane Matthew']),
    'since_2015': cur([r for r in P if r['yearOfLoss'] >= 2015]),
    'all': cur(P)}
json.dump(out, open(os.path.join(HERE, 'claims-findings.json'), 'w'), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ('tracts',)}, indent=1)[:6000])
