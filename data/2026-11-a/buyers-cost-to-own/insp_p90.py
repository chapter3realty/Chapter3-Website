import csv, sys
src = sys.argv[1]
pairs = {'02701': [], '02702': [], 'all': []}
with open(src, newline='') as f:
    for r in csv.DictReader(f):
        if r['PUMA'] not in ('02701', '02702') or r['TEN'] not in ('1', '2') or r['BLD'] != '02': continue
        v = r.get('INSP', '')
        if v in ('', None) or float(v) <= 0: continue
        v = float(v) * float(r['ADJHSG']) / 1e6; w = float(r['WGTP'])
        pairs[r['PUMA']].append((v, w)); pairs['all'].append((v, w))
def wq(p, q):
    p = sorted(p); t = sum(w for _, w in p); a = 0
    for v, w in p:
        a += w
        if a >= t * q: return round(v)
for k, p in pairs.items():
    print(k, len(p), {q: wq(p, q) for q in (.25, .5, .75, .9)}, 'share>=4000', round(sum(w for v, w in p if v >= 4000) / sum(w for _, w in p), 3), 'share>=6000', round(sum(w for v, w in p if v >= 6000) / sum(w for _, w in p), 3))
import json
a = pairs['all']; tot = sum(w for _, w in a)
out = {"source": "Census ACS PUMS 2024 1-year housing file, South Carolina (psam_h45.csv); PUMAs 02701 and 02702; owner-occupied (TEN 1, 2); one-family detached house (BLD 02); INSP > 0, x ADJHSG/1e6; weighted by WGTP",
       "script": "insp_p90.py", "records": len(a), "p25": wq(a, .25), "median": wq(a, .5), "p75": wq(a, .75), "p90": wq(a, .9),
       "share_4000_or_more": round(sum(w for v, w in a if v >= 4000) / tot, 3), "share_6000_or_more": round(sum(w for v, w in a if v >= 6000) / tot, 3)}
json.dump(out, open(sys.argv[2], "w"), indent=1)
