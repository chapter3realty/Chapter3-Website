#!/usr/bin/env python3
"""What Horry County homeowners report paying, from Census ACS PUMS (housing file, SC).
Input: psam_h45.csv from https://www2.census.gov/programs-surveys/acs/data/pums/<year>/<1-Year|5-Year>/csv_hsc.zip
PUMAs 02701 and 02702 lie wholly in Horry County (2020 tract-to-PUMA file); 02601 mixes Horry, Dillon and Marion and is left out.
Usage: python3 -I analyze_pums.py <psam_h45.csv> <label> <out.json> [rest-of-sc]
Weighted medians (WGTP) of owner-occupied households (TEN 1 or 2). Dollar amounts x ADJHSG/1e6.
INSP fire/hazard/flood insurance per year; ELEP electricity per month; WATP water per year;
GASP gas per month; FULP other fuel per year; CONP condo fee per month; TAXAMT property tax per year;
VALP property value; SMOCP selected monthly owner costs. Flags F*P mark allocated (imputed) values; kept, as Census does.
"""
import csv, json, sys
src, label, out = sys.argv[1], sys.argv[2], sys.argv[3]
PUMAS = {'02701', '02702'}
REST_OF_SC = len(sys.argv) > 4 and sys.argv[4] == 'rest-of-sc'   # every SC PUMA except the three that touch Horry
rows = []
with open(src, newline='') as f:
    for r in csv.DictReader(f):
        if REST_OF_SC:
            if r['PUMA'] in PUMAS or r['PUMA'] == '02601': continue
        elif r['PUMA'] not in PUMAS: continue
        if r['TEN'] not in ('1', '2'): continue
        rows.append(r)
def num(r, k):
    v = r.get(k, '')
    return None if v in ('', None) else float(v)
def wmedian(pairs):
    pairs = sorted(pairs); tot = sum(w for _, w in pairs)
    if tot == 0: return None
    acc = 0
    for v, w in pairs:
        acc += w
        if acc >= tot / 2: return v
def wq(pairs, q):
    pairs = sorted(pairs); tot = sum(w for _, w in pairs); acc = 0
    for v, w in pairs:
        acc += w
        if acc >= tot * q: return v
def stat(group, field, adj=True, monthly_flag=None, positive=True, yearly=False):
    pairs = []
    for r in group:
        v = num(r, field)
        if v is None: continue
        if field == 'ELEP' and r.get('ELEFP') != '3': continue   # 3 = a dollar amount is reported
        if field == 'WATP' and r.get('WATFP') != '3': continue
        if field == 'GASP' and r.get('GASFP') != '4': continue   # 4 = a dollar amount
        if field == 'FULP' and r.get('FULFP') != '3': continue
        if positive and v <= 0: continue
        if adj: v = v * float(r['ADJHSG']) / 1e6
        pairs.append((v, float(r['WGTP'])))
    if not pairs: return None
    return {'n_records': len(pairs), 'weighted_households': round(sum(w for _, w in pairs)),
            'median': round(wmedian(pairs)), 'p25': round(wq(pairs, .25)), 'p75': round(wq(pairs, .75))}
groups = {
  'all_owners': rows,
  'house_detached': [r for r in rows if r['BLD'] == '02'],
  'house_detached_no_mortgage': [r for r in rows if r['BLD'] == '02' and r['TEN'] == '2'],
  'house_detached_with_mortgage': [r for r in rows if r['BLD'] == '02' and r['TEN'] == '1'],
  'attached_or_apartment_building': [r for r in rows if r['BLD'] in ('03','04','05','06','07','08','09')],
  'apartment_building_3plus': [r for r in rows if r['BLD'] in ('05','06','07','08','09')],
  'apartment_building_3plus_no_mortgage': [r for r in rows if r['BLD'] in ('05','06','07','08','09') and r['TEN'] == '2'],
  'mobile_home': [r for r in rows if r['BLD'] == '01'],
}
res = {'source': 'Census ACS PUMS ' + label + ' housing file, South Carolina (psam_h45.csv)', 'pumas': 'rest of SC (all but 02601, 02701, 02702)' if REST_OF_SC else sorted(PUMAS),
       'owner_records': len(rows), 'groups': {}}
for g, grp in groups.items():
    d = {'records': len(grp), 'weighted_households': round(sum(float(r['WGTP']) for r in grp))}
    for fld in ['INSP', 'ELEP', 'WATP', 'GASP', 'FULP', 'CONP', 'TAXAMT', 'VALP', 'SMOCP']:
        d[fld] = stat(grp, fld)
    # share paying a condo fee
    w = sum(float(r['WGTP']) for r in grp)
    wc = sum(float(r['WGTP']) for r in grp if (num(r, 'CONP') or 0) > 0)
    d['share_paying_condo_fee'] = round(wc / w, 3) if w else None
    # insurance as a share of value (median of ratios)
    pr = [((num(r,'INSP')*float(r['ADJHSG'])/1e6) / (num(r,'VALP')*float(r['ADJHSG'])/1e6), float(r['WGTP'])) for r in grp if (num(r,'INSP') or 0) > 0 and (num(r,'VALP') or 0) > 0]
    d['insp_per_100k_value_median'] = round(wmedian(pr) * 100000) if pr else None
    res['groups'][g] = d
json.dump(res, open(out, 'w'), indent=1)
print(json.dumps(res, indent=1)[:6000])
