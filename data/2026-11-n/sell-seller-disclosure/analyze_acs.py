#!/usr/bin/env python3
"""Share of homes built before 1980 in Horry County and its towns (the federal lead rule covers most homes built before 1978).
Run: python3 -I analyze_acs.py. Inputs (raw/, pulled 2026-11-08 by pull-acs.sh): Census ACS 2020-2024 5-year table B25034
(year structure built) for every SC place and for Horry County, and ACS 2025 1-year B25034 for Horry County.
The Census groups years by decade, so "before 1980" includes 1978 and 1979 and "before 1970" leaves out 1970 to 1977:
the pre-1978 share lies between the two. Counts are housing units (owned, rented and vacant). Writes acs-findings.json."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(HERE, 'raw')
def rows(f):
    d = json.load(open(os.path.join(RAW, f)))['response']['data']; return [dict(zip(d[0], r)) for r in d[1:]]
def calc(x):
    v = lambda i: int(x['B25034_%03dE' % i]); t = v(1); p80 = sum(v(i) for i in range(7, 12)); p70 = sum(v(i) for i in range(8, 12))
    return {'name': x['NAME'].replace(', South Carolina', ''), 'geo': x['GEO_ID'], 'units': t, 'built_before_1970': p70, 'built_before_1980': p80,
            'built_1970s': v(7), 'built_1970s_moe': int(x['B25034_007M']), 'pct_before_1970': round(100 * p70 / t, 1), 'pct_before_1980': round(100 * p80 / t, 1)}
# Places in Horry County (Murrells Inlet and Garden City CDPs reach into Georgetown County; Georgetown and Pawleys Island are shown for comparison)
HORRY = ['Atlantic Beach town', 'Aynor town', 'Briarcliffe Acres town', 'Conway city', 'Loris city', 'Myrtle Beach city', 'North Myrtle Beach city',
         'Surfside Beach town', 'Carolina Forest CDP', 'Forestbrook CDP', 'Garden City CDP', 'Little River CDP', 'Murrells Inlet CDP', 'Red Hill CDP', 'Socastee CDP']
P = {r['NAME'].replace(', South Carolina', ''): r for r in rows('acs5-2024-B25034-sc-places.json')}
out = {'source': 'U.S. Census Bureau, ACS 2020-2024 5-year, B25034; ACS 2025 1-year, B25034',
       'horry_5yr': calc(rows('acs5-2024-B25034-horry.json')[0]), 'horry_1yr_2025': calc(rows('acs1-2025-B25034-horry.json')[0]),
       'places': sorted((calc(P[n]) for n in HORRY), key=lambda r: -r['pct_before_1980']),
       'compare': [calc(P[n]) for n in ('Georgetown city', 'Pawleys Island town')]}
json.dump(out, open(os.path.join(HERE, 'acs-findings.json'), 'w'), indent=1)
for k in ('horry_5yr', 'horry_1yr_2025'): print(out[k])
for r in out['places']: print(r['name'], r['units'], r['pct_before_1970'], r['pct_before_1980'])
