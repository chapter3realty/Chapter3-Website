#!/usr/bin/env python3
"""Routine maintenance a homeowner spends in a typical year, from the Census American Housing Survey 2023 national PUF.
Input: household.csv from https://www2.census.gov/programs-surveys/ahs/2023/AHS%202023%20National%20PUF%20v1.1%20CSV.zip
(MAINTAMT = yearly routine maintenance cost in a typical year, dollars; the Census verification sheet puts the owner median at $510; MARKETVAL = owner's estimate of value; WEIGHT = final weight).
AHS definition (2023 AHS Definitions, "Routine maintenance costs in typical year"): minor repairs, painting, restoring shingles,
fixing water pipes, replacing parts of large equipment, repairing fences, gutters, decks; NOT room additions, remodeling or replacements.
Groups: owner-occupied (TENURE 1), one-family detached (BLD 02), and owned units in buildings of 3+ units (BLD 05-09, mostly condos), U.S. and South Atlantic division (DIVISION 5, which holds SC).
Negative codes (-6 not applicable, -9 not reported) are dropped. Usage: python3 -I analyze_ahs.py <household.csv> <out.json>"""
import csv, json, sys
src, out = sys.argv[1], sys.argv[2]
def clean(v): return v.strip().strip("'\"")
def wq(pairs, q):
    pairs = sorted(pairs); tot = sum(w for _, w in pairs); acc = 0
    for v, w in pairs:
        acc += w
        if acc >= q * tot: return v
groups = {}
with open(src, newline='') as f:
    for r in csv.DictReader(f):
        r = {k.strip("'\""): clean(v) for k, v in r.items()}
        if r['TENURE'] != '1' or r['BLD'] not in ('02', '05', '06', '07', '08', '09'): continue
        kind = 'house' if r['BLD'] == '02' else 'apt'
        try: m, val, w = float(r['MAINTAMT']), float(r['MARKETVAL']), float(r['WEIGHT'])
        except ValueError: continue
        if m < 0 or w <= 0: continue
        yb = r.get('YRBUILT', '')
        for g in ('US', 'SouthAtlantic' if r['DIVISION'] == '5' else None):
            if not g: continue
            if kind == 'apt': g = g + '_owned_unit_in_building_of_3plus'
            groups.setdefault(g, []).append((m, val if val > 0 else None, w, yb))
res = {'source': 'Census AHS 2023 National PUF v1.1, household.csv', 'rule': __doc__, 'groups': {}}
for g, rows in groups.items():
    yr = [(a, w) for a, _, w, _ in rows]
    share = [(a / v, w) for a, v, w, _ in rows if v]
    tot = sum(w for _, w in yr)
    old = [(a, w) for a, _, w, yb in rows if yb.isdigit() and int(yb) < 1980]
    new = [(a, w) for a, _, w, yb in rows if yb.isdigit() and int(yb) >= 2000]
    res['groups'][g] = {'records': len(rows), 'weighted_homes': round(tot),
        'yearly': {'p25': wq(yr, .25), 'median': wq(yr, .5), 'p75': wq(yr, .75), 'mean': round(sum(a * w for a, w in yr) / tot)},
        'share_spending_zero': round(sum(w for a, w in yr if a == 0) / tot, 3),
        'pct_of_value': {'median': round(wq(share, .5) * 100, 2), 'mean_of_totals': round(sum(a * w for a, v, w, _ in rows if v) / sum(v * w for a, v, w, _ in rows if v) * 100, 2)},
        'mean_marketval_of_homes_with_value': round(sum(v * w for a, v, w, _ in rows if v) / sum(w for a, v, w, _ in rows if v)),
        'built_before_1980_median': wq(old, .5) if old else None, 'built_2000_or_later_median': wq(new, .5) if new else None}
json.dump(res, open(out, 'w'), indent=1); print(json.dumps(res['groups'], indent=1))
