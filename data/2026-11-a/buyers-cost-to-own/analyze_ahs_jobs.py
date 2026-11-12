#!/usr/bin/env python3
"""What the big replacements cost, from the Census American Housing Survey 2023 national PUF (project.csv joined to household.csv).
JOBTYPE labels from the AHS 2023 Value Labels Package: 16 roofing, 26 central air conditioning, 27 built-in heating, 29 water heater,
18 doors or windows, 17 siding, 33 fencing. JOBCOST = what the job cost (dollars; Census adds noise to the PUF).
Group: owner-occupied (TENURE 1) one-family detached (BLD 02) homes in the South Atlantic division (DIVISION 5, holds SC).
Jobs with JOBCOST <= 0 or a negative code are dropped. Weighted by the household WEIGHT.
Also the mean yearly spend on these seven jobs per home (two-year window per the 2023 AHS Definitions, 'Exterior additions and replacements').
Usage: python3 -I analyze_ahs_jobs.py <household.csv> <project.csv> <out.json>"""
import csv, json, sys
hh, pj, out = sys.argv[1:4]
def c(v): return v.strip().strip("'\"")
H = {}
with open(hh, newline='') as f:
    for r in csv.DictReader(f):
        r = {k.strip("'\""): c(v) for k, v in r.items()}
        if r['TENURE'] == '1' and r['BLD'] == '02' and r['DIVISION'] == '5':
            H[r['CONTROL']] = float(r['WEIGHT'])
LAB = {'16': 'roof', '26': 'central air conditioning', '27': 'heating equipment', '29': 'water heater', '18': 'doors or windows', '17': 'siding', '33': 'fencing'}
jobs = {k: [] for k in LAB}; did = {k: set() for k in LAB}
with open(pj, newline='') as f:
    for r in csv.DictReader(f):
        r = {k.strip("'\""): c(v) for k, v in r.items()}
        if r['CONTROL'] not in H or r['JOBTYPE'] not in LAB: continue
        try: cost = float(r['JOBCOST'])
        except ValueError: continue
        did[r['JOBTYPE']].add(r['CONTROL'])
        if cost > 0: jobs[r['JOBTYPE']].append((cost, H[r['CONTROL']]))
def wq(p, q):
    p = sorted(p); t = sum(w for _, w in p); a = 0
    for v, w in p:
        a += w
        if a >= q * t: return v
tot = sum(H.values())
spend = sum(c * w for k in LAB for c, w in jobs[k])
res = {'source': 'Census AHS 2023 National PUF v1.1 (household.csv, project.csv)', 'rule': __doc__, 'owner_detached_homes_weighted': round(tot), 'records': len(H), 'jobs': {},
       'mean_yearly_spend_on_these_jobs_per_home': round(spend / 2 / tot), 'mean_rule': 'sum of job cost x weight over the seven types, / 2 (the survey asks about the last two years), / weighted owner detached homes (including homes with no job)'}
for k, lab in LAB.items():
    p = jobs[k]
    res['jobs'][lab] = {'jobs_with_cost': len(p), 'median_cost': wq(p, .5) if p else None, 'p25': wq(p, .25) if p else None, 'p75': wq(p, .75) if p else None,
                        'share_of_homes_reporting_job': round(sum(H[x] for x in did[k]) / tot, 3)}
json.dump(res, open(out, 'w'), indent=1); print(json.dumps(res['jobs'], indent=1), res['mean_yearly_spend_on_these_jobs_per_home'])
