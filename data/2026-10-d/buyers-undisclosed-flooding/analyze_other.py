#!/usr/bin/env python3
"""Repeat-loss properties, mitigation buyouts and flood-insurance take-up for Horry County. Run: python3 -I analyze_other.py
Reads raw/nfip-multiple-loss-horry.json, raw/hma-subapps-horry.json, raw/nfip-penetration-horry.json. Writes other-findings.json."""
import json, os, collections as C
HERE = os.path.dirname(os.path.abspath(__file__)); R = lambda f: json.load(open(os.path.join(HERE, 'raw', f)))
out = {}
M = R('nfip-multiple-loss-horry.json')
rows = M['rows']
def grp(z):
    if not z: return 'unknown'
    return 'high' if z[0] in 'AV' else ('outside' if z[0] in 'XBC' else 'other')
g = C.Counter(grp(r['floodZone']) for r in rows)
out['multiple_loss'] = {'source': M['source'], 'pulled': M['pulled'], 'asOfDate': rows[0]['asOfDate'], 'properties': len(rows),
    'zone_high': g['high'], 'zone_outside': g['outside'], 'zone_unknown': g['unknown'],
    'pct_outside_of_known': round(100 * g['outside'] / (g['high'] + g['outside']), 1),
    'severe_repetitive_loss': sum(1 for r in rows if r['nfipSrl']), 'mitigated': sum(1 for r in rows if r['mitigatedIndicator']),
    'insured_now': sum(1 for r in rows if r['insuredIndicator']), 'not_insured_now': sum(1 for r in rows if not r['insuredIndicator']),
    'losses_distribution': dict(sorted(C.Counter(r['totalLosses'] for r in rows).items())),
    'most_recent_loss_2015_or_later': sum(1 for r in rows if (r['mostRecentDateofLoss'] or '') >= '2015'),
    'by_city_top': C.Counter((r['reportedCity'] or '').upper().replace('N MYRTLE BCH', 'NORTH MYRTLE BEACH').replace('N MYRTLE BEACH', 'NORTH MYRTLE BEACH') for r in rows).most_common(8)}
H = R('hma-subapps-horry.json')['HmaSubapplications']
acq = [r for r in H if r['primaryActivity'] in ('Acquisition', 'Elevation') or 'cquisition' in str(r['primaryActivity']) or 'levation' in str(r['primaryActivity'])]
out['hma_projects'] = [{k: r[k] for k in ('subapplicationIdentifier', 'program', 'disasterNumber', 'fiscalYear', 'subapplicantName', 'status', 'primaryActivity', 'numberBuildingLocations', 'totalSubapplicationAmount')} for r in acq]
s = C.defaultdict(int)
for r in acq: s[(r['disasterNumber'], r['primaryActivity'])] += r['numberBuildingLocations'] or 0
out['hma_buildings_by_disaster_activity'] = {f'{k[0]} {k[1]}': v for k, v in sorted(s.items())}
out['hma_note'] = 'Disaster numbers: 1299 Hurricane Floyd (1999), 4241 October 2015 floods, 4286 Hurricane Matthew (2016), 4394 Hurricane Florence (2018). numberBuildingLocations is the count in the application; status Closed means the project is finished.'
P = R('nfip-penetration-horry.json')['NfipResidentialPenetrationRates']
h = [r for r in P if r['fipsCode'] == '45051'][0]
out['penetration'] = {**h, 'contracts_outside_sfha': h['resContractsInForce'] - h['resContractsInForceSfha'],
    'pct_structures_with_policy': round(100 * h['resPenetrationRate'], 1),
    'pct_contracts_outside_sfha': round(100 * (h['resContractsInForce'] - h['resContractsInForceSfha']) / h['resContractsInForce'], 1)}
json.dump(out, open(os.path.join(HERE, 'other-findings.json'), 'w'), indent=1)
print(json.dumps(out, indent=1)[:4000])
