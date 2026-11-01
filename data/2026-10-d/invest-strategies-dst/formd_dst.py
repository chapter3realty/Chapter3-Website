"""Count Delaware statutory trust real estate offerings in SEC Form D data.
Source: SEC Form D data sets, https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets
Quarters 2025Q4, 2026Q1, 2026Q2, 2026Q3 (filings dated 2025-10-01 to 2026-09-30).
Selection: primary issuer name contains the word DST or 'Delaware Statutory Trust';
original filing (SUBMISSIONTYPE D, not D/A); industry group is a real estate group
(REITS and Finance, Commercial, Residential, Other Real Estate); not a pooled investment fund.
Run: python3 -I formd_dst.py <dir with quarter folders> > formd_dst_summary.json
"""
import csv, sys, os, re, json, glob, statistics as st
csv.field_size_limit(10**9)
base = sys.argv[1]
def rd(q, name):
    p = glob.glob(os.path.join(base, q, '*', name + '.tsv'))[0]
    with open(p, encoding='utf-8', errors='replace') as f:
        return list(csv.DictReader(f, delimiter='\t'))
pat = re.compile(r'\bDST\b|DELAWARE STATUTORY TRUST', re.I)
RE = {'REITS and Finance', 'Commercial', 'Residential', 'Other Real Estate'}
rows = []
for q in ['2025q4_d', '2026q1_d', '2026q2_d', '2026q3_d']:
    sub = {r['ACCESSIONNUMBER']: r for r in rd(q, 'FORMDSUBMISSION')}
    iss = {}
    for r in rd(q, 'ISSUERS'):
        if r['IS_PRIMARYISSUER_FLAG'] == 'YES':
            iss[r['ACCESSIONNUMBER']] = r
    for o in rd(q, 'OFFERING'):
        a = o['ACCESSIONNUMBER']
        s = sub.get(a); i = iss.get(a)
        if not s or not i: continue
        if s['SUBMISSIONTYPE'] != 'D': continue
        if not pat.search(i['ENTITYNAME']): continue
        if o['INDUSTRYGROUPTYPE'] not in RE: continue
        if o['ISPOOLEDINVESTMENTFUNDTYPE'] == 'true': continue
        def num(x):
            try: return float(x)
            except: return None
        rows.append(dict(acc=a, date=s['FILING_DATE'], name=i['ENTITYNAME'], issuer_state=i['STATEORCOUNTRY'],
            industry=o['INDUSTRYGROUPTYPE'], exemptions=o['FEDERALEXEMPTIONS_ITEMS_LIST'],
            min_inv=num(o['MINIMUMINVESTMENTACCEPTED']), offering=num(o['TOTALOFFERINGAMOUNT']),
            sold=num(o['TOTALAMOUNTSOLD']), investors=num(o['TOTALNUMBERALREADYINVESTED']),
            nonaccred=o['HASNONACCREDITEDINVESTORS'], salescomm=num(o['SALESCOMM_DOLLARAMOUNT']),
            finders=num(o['FINDERSFEE_DOLLARAMOUNT']), comm_est=o['SALESCOMM_ISESTIMATE'],
            proceeds_to_insiders=num(o['GROSSPROCEEDSUSED_DOLLARAMOUNT']),
            entitytype=i['ENTITYTYPE'], entityother=i['ENTITYTYPEOTHERDESC']))
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'formd_dst_rows.csv'), 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
def pct(v, p):
    v = sorted(v); k = (len(v)-1)*p; lo = int(k); hi = min(lo+1, len(v)-1)
    return v[lo] + (v[hi]-v[lo])*(k-lo)
mins = [r['min_inv'] for r in rows if r['min_inv'] and r['min_inv'] > 0]
offs = [r['offering'] for r in rows if r['offering'] and r['offering'] > 0]
fee = [ (r['salescomm'] + (r['finders'] or 0)) / r['offering'] for r in rows
        if r['offering'] and r['offering'] > 0 and r['salescomm'] is not None and r['salescomm'] > 0 ]
from collections import Counter
out = dict(
  filings=len(rows),
  date_range=[min(r['date'] for r in rows), max(r['date'] for r in rows)],
  industry=Counter(r['industry'] for r in rows),
  exemption=Counter(r['exemptions'] for r in rows),
  has_nonaccredited=Counter(r['nonaccred'] for r in rows),
  min_inv=dict(n=len(mins), median=st.median(mins), p25=pct(mins,.25), p75=pct(mins,.75), min=min(mins), max=max(mins),
               counts=Counter(int(m) for m in mins).most_common(12)),
  offering=dict(n=len(offs), median=st.median(offs), p25=pct(offs,.25), p75=pct(offs,.75), total=sum(offs)),
  commission_plus_finders_share=dict(n=len(fee), median=st.median(fee), p25=pct(fee,.25), p75=pct(fee,.75), min=min(fee), max=max(fee)),
  zero_or_blank_commission=sum(1 for r in rows if not r['salescomm']),
)

# Extra counts for the page (added 2026-11-01)
ge100 = sum(1 for m in mins if m >= 100000)
le25 = sum(1 for m in mins if m <= 25000)
k1 = sum(1 for m in mins if m == 1000)
buckets = {'under $25,000': sum(1 for m in mins if m < 25000), '$25,000 to $99,999': sum(1 for m in mins if 25000 <= m < 100000),
           '$100,000': sum(1 for m in mins if m == 100000), '$100,001 to $499,999': sum(1 for m in mins if 100000 < m < 500000),
           '$500,000 or more': sum(1 for m in mins if m >= 500000)}
fee_b = {'under 5%': sum(1 for f in fee if f < 0.05), '5% to 6.9%': sum(1 for f in fee if 0.05 <= f < 0.07),
         '7% to 8.9%': sum(1 for f in fee if 0.07 <= f < 0.09), '9% or more': sum(1 for f in fee if f >= 0.09)}
fee_no_outlier = [f for f in fee if f < 0.5]
sponsors = set(re.split(r'[ ,]', r['name'].strip())[0].upper() for r in rows)
extra = dict(min_ge_100k=ge100, min_le_25k=le25, min_eq_1000=k1, min_buckets=buckets, fee_buckets=fee_b,
             fee_median_without_060_outlier=st.median(fee_no_outlier), fee_n_without_outlier=len(fee_no_outlier),
             fee_ge_9pct=sum(1 for f in fee if f >= 0.09), sponsors_first_word=len(sponsors),
             residential_label=sum(1 for r in rows if r['industry'] == 'Residential'))
out['extra'] = extra
out['source'] = 'SEC Form D data sets 2025Q4-2026Q3, https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets'
print(json.dumps(out, indent=1, default=str))
