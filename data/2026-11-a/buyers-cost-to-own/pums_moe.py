#!/usr/bin/env python3
"""Margin of error (90 percent) for the Horry vs rest-of-SC medians in pums-2024-1yr*.json, by the Census successive
difference replication method: SE = sqrt(4/80 * sum((median_r - median)^2)) over replicate weights WGTP1..WGTP80; MOE = 1.645 x SE.
Groups: owner-occupied one-family detached houses (BLD 02). Fields: INSP (yearly), ELEP (monthly, flag ELEFP 3), SMOCP no mortgage (TEN 2).
Usage: python3 -I pums_moe.py <psam_h45.csv> <out.json>"""
import csv, json, sys, math
src, out = sys.argv[1], sys.argv[2]
H = {'02701', '02702'}
def med(p):
    p = sorted(p); t = sum(w for _, w in p); a = 0
    for v, w in p:
        a += w
        if a >= t / 2: return v
sets = {}
with open(src, newline='') as f:
    for r in csv.DictReader(f):
        if r['TEN'] not in ('1', '2') or r['BLD'] != '02' or r['PUMA'] == '02601': continue
        geo = 'horry' if r['PUMA'] in H else 'rest_of_sc'
        adj = float(r['ADJHSG']) / 1e6
        ws = [float(r['WGTP'])] + [float(r['WGTP%d' % i]) for i in range(1, 81)]
        def add(k, v): sets.setdefault((geo, k), []).append((v * adj, ws))
        if r['INSP'] and float(r['INSP']) > 0: add('INSP', float(r['INSP']))
        if r['ELEP'] and r['ELEFP'] == '3' and float(r['ELEP']) > 0: add('ELEP', float(r['ELEP']))
        if r['TEN'] == '2' and r['SMOCP'] and float(r['SMOCP']) > 0: add('SMOCP_no_mortgage', float(r['SMOCP']))
res = {}
for (geo, k), rows in sets.items():
    m0 = med([(v, w[0]) for v, w in rows])
    reps = [med([(v, w[i]) for v, w in rows]) for i in range(1, 81)]
    se = math.sqrt(4 / 80 * sum((x - m0) ** 2 for x in reps))
    res.setdefault(k, {})[geo] = {'median': round(m0), 'moe90': round(1.645 * se), 'records': len(rows)}
json.dump(res, open(out, 'w'), indent=1); print(json.dumps(res, indent=1))
